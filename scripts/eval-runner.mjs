#!/usr/bin/env node

/**
 * Eval Runner — scripts/eval-runner.mjs
 *
 * Deterministic harness for the KG A/B evaluation. Reads task corpus +
 * adversarial controls, runs a scripted AI SDK agent against one of four
 * arms (T/R/P/B), and captures full transcripts for judging.
 *
 * Usage:
 *   node scripts/eval-runner.mjs --arm T --run-id my-eval-001
 *   node scripts/eval-runner.mjs --arm R --run-id my-eval-001 --task eval-T003
 *   node scripts/eval-runner.mjs --arm T --run-id my-eval-001 --reps 10
 *
 * Options:
 *   --arm {T|R|P|B}   Which arm to run
 *   --run-id <id>     Unique run identifier (directory name under eval-results/)
 *   --task <id>       Optional: run only this task (skip others)
 *   --reps <n>        Repetitions per task (default 10)
 *   --resume          Resume from checkpoint (skip completed runs)
 *   --calibration     Use calibration prompts instead of corpus
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync, appendFileSync } from 'fs';
import { resolve, join } from 'path';
import { execSync, spawn } from 'child_process';
import { createHash } from 'crypto';
import { generateText, tool, stepCountIs } from 'ai';
import { z } from 'zod';
import { loadEvalConfig, armRole, armGraphCache } from './lib/eval-config.mjs';

// Model resolution: prefer AI Gateway OIDC, fall back to direct provider SDK
async function resolveModel(modelId) {
  // Try AI Gateway first
  if (process.env.VERCEL_OIDC_TOKEN) {
    const { gateway } = await import('@ai-sdk/gateway');
    return gateway(modelId);
  }
  // Fall back to direct provider SDKs
  const [provider, model] = modelId.split('/');
  if (provider === 'anthropic' && process.env.ANTHROPIC_API_KEY) {
    const { anthropic } = await import('@ai-sdk/anthropic');
    return anthropic(model);
  }
  if (provider === 'openai' && process.env.OPENAI_API_KEY) {
    const { openai } = await import('@ai-sdk/openai');
    return openai(model);
  }
  if (provider === 'google' && process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
    const { google } = await import('@ai-sdk/google');
    return google(model);
  }
  // Last resort: try gateway anyway (will fail with a clear error)
  const { gateway } = await import('@ai-sdk/gateway');
  return gateway(modelId);
}

const ROOT = resolve(import.meta.dirname, '..');

// ---------------------------------------------------------------------------
// CLI args
// ---------------------------------------------------------------------------
const args = process.argv.slice(2);
function getArg(name, defaultVal) {
  const idx = args.indexOf(`--${name}`);
  if (idx === -1) return defaultVal;
  return args[idx + 1];
}
function hasFlag(name) {
  return args.includes(`--${name}`);
}

// --arm accepts arbitrary strings now. v1's auto-uppercase behavior is
// preserved ONLY for the v1 fallback path (T/R/P/B). When --eval-config is
// provided, arm IDs are case-sensitive and must match the YAML keys.
const RAW_ARM = getArg('arm', '');
const RUN_ID = getArg('run-id', `eval-${Date.now()}`);
const ONLY_TASK = getArg('task', null);
const REPS = parseInt(getArg('reps', '10'), 10);
const RESUME = hasFlag('resume');
const CALIBRATION = hasFlag('calibration');
const EVAL_CONFIG_PATH = getArg('eval-config', null);

const EVAL_CONFIG = loadEvalConfig(EVAL_CONFIG_PATH, ROOT);
// In the v1 fallback (no --eval-config), preserve the original
// uppercase-coercion behavior so callers still using `--arm t` keep working.
const ARM = EVAL_CONFIG._isFallback ? RAW_ARM.toUpperCase() : RAW_ARM;

if (!ARM || !EVAL_CONFIG.arms[ARM]) {
  console.error(
    `Usage: --arm <id> required. Known arms: ${Object.keys(EVAL_CONFIG.arms).join(', ')}` +
      (EVAL_CONFIG._isFallback ? ' (v1 default; pass --eval-config to override)' : ` (from ${EVAL_CONFIG_PATH})`),
  );
  process.exit(1);
}

const ARM_ROLE = armRole(EVAL_CONFIG, ARM);

// ---------------------------------------------------------------------------
// Paths
// ---------------------------------------------------------------------------
const RESULTS_DIR = resolve(ROOT, 'eval-results', RUN_ID);
const CHECKPOINT_FILE = resolve(RESULTS_DIR, 'checkpoint.jsonl');
const MANIFEST_FILE = resolve(RESULTS_DIR, 'manifest.json');
const CORPUS_FILE = resolve(ROOT, EVAL_CONFIG.files.corpus);
const ADVERSARIAL_FILE = EVAL_CONFIG.files.adversarial
  ? resolve(ROOT, EVAL_CONFIG.files.adversarial)
  : null;
const CALIBRATION_FILE = EVAL_CONFIG.files.calibration
  ? resolve(ROOT, EVAL_CONFIG.files.calibration)
  : null;
const PRE_REG_FILE = resolve(ROOT, EVAL_CONFIG.files.pre_registration);
// Resolve graph cache: arm config wins, then env override, then default.
const armCachePath = armGraphCache(EVAL_CONFIG, ARM);
let GRAPH_CACHE_PATH = armCachePath
  ? resolve(ROOT, armCachePath)
  : process.env.GRAPH_CACHE_PATH
    ? resolve(ROOT, process.env.GRAPH_CACHE_PATH)
    : resolve(ROOT, '.cache/graph.json');
const INDEX_FILE = resolve(ROOT, '.cache/search-index.json');
const WORKTREE_PATH = resolve(process.env.HOME, 'eval/yilangao-current');

mkdirSync(RESULTS_DIR, { recursive: true });

// ---------------------------------------------------------------------------
// Parse thresholds from pre-registration doc
// ---------------------------------------------------------------------------
function parseThresholds() {
  const content = readFileSync(PRE_REG_FILE, 'utf8');
  const yamlMatch = content.match(/```yaml\n([\s\S]*?)```/);
  if (!yamlMatch) throw new Error('Cannot find YAML thresholds in pre-registration doc');
  const yaml = yamlMatch[1];
  const thresholds = {};
  for (const line of yaml.split('\n')) {
    const m = line.match(/^\s+(\w+):\s+([\d.]+)/);
    if (m) thresholds[m[1]] = parseFloat(m[2]);
  }
  return thresholds;
}

const THRESHOLDS = parseThresholds();
const BUDGET_CAP = THRESHOLDS.budget_cap_usd;
console.log(`Budget cap: $${BUDGET_CAP}`);

// ---------------------------------------------------------------------------
// Parse tasks from corpus/calibration YAML blocks
// ---------------------------------------------------------------------------
function parseTasks(filepath) {
  const content = readFileSync(filepath, 'utf8');
  const yamlBlock = content.match(/```yaml\n([\s\S]*?)```/);
  if (!yamlBlock) return [];

  const tasks = [];
  const rawYaml = yamlBlock[1];

  // Split on top-level list items: "- id: xxx"
  const segments = rawYaml.split(/^- id:\s+/m).filter(Boolean);
  for (const seg of segments) {
    const block = `id: ${seg.trim()}`;
    const lines = block.split('\n');

    const fields = {};
    let currentKey = null;
    let currentVal = '';
    let inBlock = false;

    for (const line of lines) {
      const keyMatch = line.match(/^\s{0,2}(\w[\w_]*):\s*(.*)/);
      if (keyMatch && !inBlock) {
        if (currentKey) fields[currentKey] = currentVal.trim();
        currentKey = keyMatch[1];
        const val = keyMatch[2].trim();
        if (val === '|') {
          inBlock = true;
          currentVal = '';
        } else {
          inBlock = false;
          currentVal = val.replace(/^["']|["']$/g, '');
        }
      } else if (inBlock && currentKey) {
        if (line.match(/^\s{0,2}\w[\w_]*:/) && !line.match(/^\s{4,}/)) {
          fields[currentKey] = currentVal.trim();
          inBlock = false;
          const km = line.match(/^\s{0,2}(\w[\w_]*):\s*(.*)/);
          if (km) {
            currentKey = km[1];
            const v = km[2].trim();
            if (v === '|') {
              inBlock = true;
              currentVal = '';
            } else {
              currentVal = v.replace(/^["']|["']$/g, '');
            }
          }
        } else {
          currentVal += (currentVal ? '\n' : '') + line.replace(/^\s{4}/, '');
        }
      }
    }
    if (currentKey) fields[currentKey] = currentVal.trim();

    if (fields.id && fields.prompt) {
      // Multi-citation grading (I4): canonical form is `expected_citations`
      // (plural array). For v1 backward-compat, fall back to the singular
      // `expected_citation` and wrap as a single-element array.
      const expectedCitations = parseCitationList(
        fields.expected_citations,
        fields.expected_citation,
      );
      tasks.push({
        id: fields.id,
        pillar: fields.pillar || '',
        difficulty: fields.difficulty || '',
        // The configured stratification field (e.g. 'combination') is also
        // captured if present so judge/aggregate don't need to re-parse YAML.
        combination: fields.combination || '',
        adversarial: parseBool(fields.adversarial),
        prompt: fields.prompt,
        gold_resolution: fields.gold_resolution || '',
        expected_citations: expectedCitations,
        // Singular kept for v1 backward-compat in tooling that hasn't migrated.
        expected_citation: expectedCitations[0] || '',
      });
    }
  }
  return tasks;
}

// Accepts either a YAML inline array string ("[AP-066, EAP-082]") or a
// singular fallback. Returns an array of trimmed citation IDs (may be empty).
function parseCitationList(plural, singular) {
  if (plural && plural.trim().length > 0) {
    let s = plural.trim();
    if (s.startsWith('[') && s.endsWith(']')) {
      s = s.slice(1, -1);
    }
    return s
      .split(',')
      .map((v) => v.trim().replace(/^["']|["']$/g, ''))
      .filter(Boolean);
  }
  if (singular && singular.trim().length > 0) {
    return [singular.trim()];
  }
  return [];
}

function parseBool(v) {
  if (v == null) return false;
  const s = String(v).trim().toLowerCase();
  return s === 'true' || s === 'yes' || s === '1';
}

function loadTasks() {
  if (CALIBRATION) {
    if (!CALIBRATION_FILE) {
      console.error(`--calibration requested but eval-config has no files.calibration entry`);
      process.exit(1);
    }
    return parseTasks(CALIBRATION_FILE);
  }
  const corpus = parseTasks(CORPUS_FILE);
  const adversarial = ADVERSARIAL_FILE && existsSync(ADVERSARIAL_FILE)
    ? parseTasks(ADVERSARIAL_FILE)
    : [];
  return [...corpus, ...adversarial];
}

const ALL_TASKS = loadTasks();
console.log(`Loaded ${ALL_TASKS.length} tasks (${CALIBRATION ? 'calibration' : 'corpus + adversarial'})`);

// ---------------------------------------------------------------------------
// Checkpoint management
// ---------------------------------------------------------------------------
function loadCheckpoint() {
  if (!RESUME || !existsSync(CHECKPOINT_FILE)) return new Set();
  const lines = readFileSync(CHECKPOINT_FILE, 'utf8').split('\n').filter(Boolean);
  const completed = new Set();
  for (const line of lines) {
    try {
      const entry = JSON.parse(line);
      completed.add(`${entry.arm}:${entry.task_id}:${entry.rep}`);
    } catch { /* skip malformed */ }
  }
  return completed;
}

function appendCheckpoint(entry) {
  appendFileSync(CHECKPOINT_FILE, JSON.stringify(entry) + '\n');
}

// ---------------------------------------------------------------------------
// SHA pinning for cache files
// ---------------------------------------------------------------------------
function shaFile(filepath) {
  const content = readFileSync(filepath);
  return createHash('sha256').update(content).digest('hex');
}

function verifyCacheIntegrity(manifest) {
  if (ARM_ROLE === 'treatment' && manifest.graph_sha) {
    const current = shaFile(GRAPH_CACHE_PATH);
    if (current !== manifest.graph_sha) {
      throw new Error(`graph cache SHA mismatch (${GRAPH_CACHE_PATH})! Expected ${manifest.graph_sha}, got ${current}`);
    }
  }
  if (ARM_ROLE === 'rag' && manifest.index_sha) {
    const current = shaFile(INDEX_FILE);
    if (current !== manifest.index_sha) {
      throw new Error(`search-index.json SHA mismatch! Expected ${manifest.index_sha}, got ${current}`);
    }
  }
}

// ---------------------------------------------------------------------------
// Skill injection for Arm T
// ---------------------------------------------------------------------------
function loadSkills() {
  const skillsDir = resolve(ROOT, '.cursor/skills');
  const skills = [];
  try {
    const dirs = execSync(`ls "${skillsDir}"`, { encoding: 'utf8' }).trim().split('\n');
    for (const dir of dirs) {
      const skillFile = resolve(skillsDir, dir, 'SKILL.md');
      if (!existsSync(skillFile)) continue;
      const content = readFileSync(skillFile, 'utf8');

      const descMatch = content.match(/description:\s*>?-?\s*\n\s+(.+(?:\n\s+.+)*)/);
      const desc = descMatch ? descMatch[1].replace(/\n\s+/g, ' ').trim() : '';

      const triggers = [];
      const triggerPatterns = [
        /Use when[:\s]+(.+)/gi,
        /Trigger[s]?[:\s]+(.+)/gi,
      ];
      for (const pat of triggerPatterns) {
        let m;
        while ((m = pat.exec(content)) !== null) {
          triggers.push(m[1].trim());
        }
      }

      skills.push({
        name: dir,
        description: desc,
        triggers,
        content: content.substring(0, 4000),
      });
    }
  } catch { /* no skills dir */ }
  return skills;
}

function matchSkills(prompt, skills, topN = 3) {
  const promptWords = new Set(prompt.toLowerCase().split(/\W+/).filter(w => w.length > 2));

  const scored = skills.map(skill => {
    const textPool = [skill.description, ...skill.triggers].join(' ').toLowerCase();
    const skillWords = textPool.split(/\W+/).filter(w => w.length > 2);
    let overlap = 0;
    for (const w of skillWords) {
      if (promptWords.has(w)) overlap++;
    }
    return { ...skill, score: overlap };
  });

  return scored
    .filter(s => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, topN);
}

// ---------------------------------------------------------------------------
// MCP client for Arm T (JSON-RPC over stdio)
// ---------------------------------------------------------------------------
let mcpProcess = null;
let mcpRequestId = 0;
let mcpPendingResolvers = new Map();
let mcpBuffer = '';

function startMcpServer() {
  return new Promise((res, rej) => {
    const serverPath = join(ROOT, 'scripts/mcp-graph-server.mjs');
    // Pass GRAPH_CACHE_PATH explicitly so the MCP server (and the query-graph
    // subprocesses it spawns) read from the arm-specific graph variant.
    // EVAL_FREEZE_CACHE=1 prevents query-graph from triggering build-graph
    // mid-run (which would change SHA and invalidate the manifest pin).
    mcpProcess = spawn(process.execPath, [serverPath], {
      cwd: ROOT,
      stdio: ['pipe', 'pipe', 'pipe'],
      env: {
        ...process.env,
        EVAL_FREEZE_CACHE: '1',
        GRAPH_CACHE_PATH,
      },
    });

    let started = false;

    mcpProcess.stdout.on('data', (data) => {
      mcpBuffer += data.toString();
      const lines = mcpBuffer.split('\n');
      mcpBuffer = lines.pop();
      for (const line of lines) {
        if (!line.trim()) continue;
        try {
          const msg = JSON.parse(line);
          if (msg.id != null && mcpPendingResolvers.has(msg.id)) {
            const { resolve: r, reject: j } = mcpPendingResolvers.get(msg.id);
            mcpPendingResolvers.delete(msg.id);
            if (msg.error) j(new Error(msg.error.message || JSON.stringify(msg.error)));
            else r(msg.result);
          }
        } catch { /* not json */ }
      }
    });

    mcpProcess.stderr.on('data', (data) => {
      const msg = data.toString();
      process.stderr.write(`[mcp] ${msg}`);
      if (msg.includes('connected via stdio') && !started) {
        started = true;
        // Send initialize
        sendMcpRequest('initialize', {
          protocolVersion: '2024-11-05',
          capabilities: {},
          clientInfo: { name: 'eval-runner', version: '1.0.0' },
        }).then(() => {
          // Send initialized notification
          mcpProcess.stdin.write(JSON.stringify({ jsonrpc: '2.0', method: 'notifications/initialized' }) + '\n');
          res();
        }).catch(rej);
      }
    });

    mcpProcess.on('error', rej);
    mcpProcess.on('exit', (code) => {
      if (!started) rej(new Error(`MCP server exited with code ${code}`));
    });

    setTimeout(() => {
      if (!started) rej(new Error('MCP server startup timeout (15s)'));
    }, 15000);
  });
}

function sendMcpRequest(method, params) {
  return new Promise((res, rej) => {
    const id = ++mcpRequestId;
    mcpPendingResolvers.set(id, { resolve: res, reject: rej });
    const request = { jsonrpc: '2.0', id, method, params };
    mcpProcess.stdin.write(JSON.stringify(request) + '\n');
    setTimeout(() => {
      if (mcpPendingResolvers.has(id)) {
        mcpPendingResolvers.delete(id);
        rej(new Error(`MCP request ${method} timeout (30s)`));
      }
    }, 30000);
  });
}

async function callMcpTool(toolName, toolArgs) {
  const result = await sendMcpRequest('tools/call', { name: toolName, arguments: toolArgs });
  const text = result?.content?.[0]?.text;
  return text || JSON.stringify(result);
}

function stopMcpServer() {
  if (mcpProcess) {
    mcpProcess.kill('SIGTERM');
    mcpProcess = null;
  }
}

// ---------------------------------------------------------------------------
// Tool definitions per arm role (using Zod schemas).
//
// Dispatch is on `arm_role`, not on the arm ID itself: this is what lets a
// Phase 1 arm named `T-typed` and a Phase 2 arm named `T` share the same
// "treatment" tool set without duplicating code paths.
//
// Roles:
//   treatment      → query_node + subgraph + search_graph (MCP) + read_file
//   rag            → grep_docs + lunr_search + read_file (no graph)
//   pre_initiative → grep + read_file scoped to eval-baseline-current worktree
//   no_memory      → no tools at all
// ---------------------------------------------------------------------------
function buildToolsForArm(role) {
  if (role === 'no_memory') return { tools: {}, toolCallLog: [] };

  const toolCallLog = [];
  const tools = {};

  if (role === 'treatment') {
    tools.query_node = tool({
      description: 'Look up a node by ID and return the node + its 1-hop neighbors. IDs are lowercase kebab-case.',
      inputSchema: z.object({
        id: z.string().describe('Node ID (lowercase kebab-case)'),
      }),
      execute: async ({ id }) => {
        const result = await callMcpTool('query-node', { id });
        toolCallLog.push({ tool: 'query_node', args: { id }, result: result.substring(0, 2000) });
        return result;
      },
    });

    tools.subgraph = tool({
      description: 'Return the N-hop neighborhood around a node (default 1, max 3)',
      inputSchema: z.object({
        id: z.string().describe('Root node ID'),
        depth: z.number().int().min(0).max(3).optional().describe('Hops out (default 1, max 3)'),
      }),
      execute: async ({ id, depth }) => {
        const result = await callMcpTool('subgraph', { id, depth: depth || 1 });
        toolCallLog.push({ tool: 'subgraph', args: { id, depth }, result: result.substring(0, 2000) });
        return result;
      },
    });

    tools.search_graph = tool({
      description: 'BM25 search across all graph nodes. Returns ranked node IDs with scores.',
      inputSchema: z.object({
        query: z.string().min(1).describe('Search query (free text)'),
        limit: z.number().int().min(1).max(50).optional().describe('Max results (default 10)'),
      }),
      execute: async ({ query, limit }) => {
        const result = await callMcpTool('search', { query, limit: limit || 10 });
        toolCallLog.push({ tool: 'search_graph', args: { query, limit }, result: result.substring(0, 2000) });
        return result;
      },
    });
  }

  if (role === 'treatment' || role === 'rag') {
    tools.read_file = tool({
      description: 'Read a file from the project docs directory',
      inputSchema: z.object({
        path: z.string().describe('Relative path from project root (e.g. docs/design.md)'),
      }),
      execute: async ({ path: filePath }) => {
        const fullPath = resolve(ROOT, filePath);
        if (!fullPath.startsWith(ROOT)) return 'Error: path outside project root';
        try {
          const content = readFileSync(fullPath, 'utf8').substring(0, 10000);
          toolCallLog.push({ tool: 'read_file', args: { path: filePath }, result: `(${content.length} chars)` });
          return content;
        } catch (e) {
          toolCallLog.push({ tool: 'read_file', args: { path: filePath }, result: `Error: ${e.message}` });
          return `Error reading file: ${e.message}`;
        }
      },
    });
  }

  if (role === 'rag') {
    tools.grep_docs = tool({
      description: 'Search docs with ripgrep. Searches docs/, AGENTS.md, .cursor/skills/, .cursor/rules/',
      inputSchema: z.object({
        pattern: z.string().describe('Regex pattern to search for'),
        max_results: z.number().int().optional().describe('Max result lines (default 30)'),
      }),
      execute: async ({ pattern, max_results }) => {
        try {
          const limit = max_results || 30;
          const result = execSync(
            `rg -n --max-count ${limit} ${JSON.stringify(pattern)} docs/ AGENTS.md .cursor/skills/ .cursor/rules/ 2>/dev/null || true`,
            { cwd: ROOT, encoding: 'utf8', timeout: 10000 }
          );
          const trimmed = result.substring(0, 8000) || 'No matches found';
          toolCallLog.push({ tool: 'grep_docs', args: { pattern }, result: trimmed.substring(0, 500) });
          return trimmed;
        } catch {
          return 'Search error or no matches';
        }
      },
    });

    tools.lunr_search = tool({
      description: 'BM25 keyword search over the search index',
      inputSchema: z.object({
        query: z.string().describe('Search query'),
        limit: z.number().int().optional().describe('Max results (default 10)'),
      }),
      execute: async ({ query, limit: maxResults }) => {
        try {
          const { default: lunr } = await import('lunr');
          const indexData = JSON.parse(readFileSync(INDEX_FILE, 'utf8'));
          const idx = lunr.Index.load(indexData);
          const results = idx.search(query).slice(0, maxResults || 10);
          const text = JSON.stringify(results, null, 2);
          toolCallLog.push({ tool: 'lunr_search', args: { query }, result: text.substring(0, 500) });
          return text;
        } catch (e) {
          return `Lunr search error: ${e.message}`;
        }
      },
    });
  }

  if (role === 'pre_initiative') {
    tools.grep_docs_pre_init = tool({
      description: 'Search pre-initiative docs with ripgrep (eval-baseline-current worktree)',
      inputSchema: z.object({
        pattern: z.string().describe('Regex pattern to search for'),
        max_results: z.number().int().optional().describe('Max result lines (default 30)'),
      }),
      execute: async ({ pattern, max_results }) => {
        try {
          const limit = max_results || 30;
          const dirs = ['docs/', 'AGENTS.md'].map(p => `"${join(WORKTREE_PATH, p)}"`).join(' ');
          const result = execSync(
            `rg -n --max-count ${limit} ${JSON.stringify(pattern)} ${dirs} 2>/dev/null || true`,
            { encoding: 'utf8', timeout: 10000 }
          );
          const trimmed = result.substring(0, 8000) || 'No matches found';
          toolCallLog.push({ tool: 'grep_docs_pre_init', args: { pattern }, result: trimmed.substring(0, 500) });
          return trimmed;
        } catch {
          return 'Search error or no matches';
        }
      },
    });

    tools.read_file_pre_init = tool({
      description: 'Read a file from the pre-initiative docs (eval-baseline-current worktree)',
      inputSchema: z.object({
        path: z.string().describe('Relative path from project root'),
      }),
      execute: async ({ path: filePath }) => {
        const fullPath = resolve(WORKTREE_PATH, filePath);
        if (!fullPath.startsWith(WORKTREE_PATH)) return 'Error: path outside worktree';
        try {
          const content = readFileSync(fullPath, 'utf8').substring(0, 10000);
          toolCallLog.push({ tool: 'read_file_pre_init', args: { path: filePath }, result: `(${content.length} chars)` });
          return content;
        } catch (e) {
          return `Error reading file: ${e.message}`;
        }
      },
    });
  }

  return { tools, toolCallLog };
}

// ---------------------------------------------------------------------------
// System prompt construction
// ---------------------------------------------------------------------------
function buildSystemPrompt(role, task, injectedSkills) {
  const parts = [
    'You are an expert software engineering assistant working on a design-system portfolio project (yilangao.com).',
    'The project uses Next.js 16, Payload CMS 3, Tailwind CSS 4, and a custom design system (Elan).',
    'When you identify a root cause, cite the relevant anti-pattern by its ID (e.g., AP-072, EAP-027, CAP-016) if one exists.',
    'Provide specific file paths and code changes. Structure your response as: diagnosis, root cause, fix, principle.',
  ];

  if (role === 'treatment') {
    parts.push(
      '',
      'You have access to a documentation knowledge graph via tools:',
      '- query_node: look up a node by ID to see its properties and 1-hop neighbors',
      '- subgraph: explore N-hop neighborhoods around a node',
      '- search_graph: BM25 keyword search across all graph nodes',
      '- read_file: read any file in the project docs',
      '',
      'Use these tools to find relevant anti-patterns, design principles, and engineering guidelines.',
    );

    if (injectedSkills.length > 0) {
      parts.push('', '--- Relevant skill fragments ---');
      for (const skill of injectedSkills) {
        parts.push(`\n### Skill: ${skill.name}\n${skill.content}`);
      }
      parts.push('--- End skill fragments ---');
    }
  } else if (role === 'rag') {
    parts.push(
      '',
      'You have access to documentation search tools:',
      '- grep_docs: ripgrep search over docs/, AGENTS.md, .cursor/skills/, .cursor/rules/',
      '- lunr_search: BM25 keyword search over the search index',
      '- read_file: read any file in the project docs',
    );
  } else if (role === 'pre_initiative') {
    parts.push(
      '',
      'You have access to documentation search tools (pre-initiative snapshot):',
      '- grep_docs_pre_init: ripgrep search over the pre-initiative docs',
      '- read_file_pre_init: read files from the pre-initiative docs snapshot',
    );
  } else {
    parts.push(
      '',
      'You do not have access to any project documentation or search tools.',
      'Answer based on your general knowledge of software engineering best practices.',
    );
  }

  return parts.join('\n');
}

// ---------------------------------------------------------------------------
// Cost tracking
//
// Rates are APPROXIMATE Claude Sonnet 4.6 list prices and are mirrored in
// scripts/eval-judge.mjs. They do not reflect AI Gateway markups, batch
// discounts, or Anthropic price changes. For final cost reconciliation the
// AI Gateway dashboard is the source of truth — these numbers are only used
// for in-flight budget caps and per-run runaway detection.
//
// I5 also adds a per-run hard kill: any single task-rep that exceeds
// PER_RUN_COST_CAP_USD or PER_RUN_OUTPUT_TOKEN_CAP is recorded as
// `error: 'runaway'` and the harness moves on to the next task. The intent
// is to bound exposure when a single prompt triggers an infinite tool loop.
// ---------------------------------------------------------------------------
const COST_PER_1K_INPUT = 0.003;   // approximate
const COST_PER_1K_OUTPUT = 0.015;  // approximate
const PER_RUN_COST_CAP_USD = 5;
const PER_RUN_OUTPUT_TOKEN_CAP = 30000;
let cumulativeCost = 0;

function estimateCost(usage) {
  if (!usage) return 0;
  const inputCost = ((usage.promptTokens || 0) / 1000) * COST_PER_1K_INPUT;
  const outputCost = ((usage.completionTokens || 0) / 1000) * COST_PER_1K_OUTPUT;
  return inputCost + outputCost;
}

function isRunaway(usage, cost) {
  if (cost > PER_RUN_COST_CAP_USD) {
    return `cost $${cost.toFixed(2)} exceeded per-run cap $${PER_RUN_COST_CAP_USD}`;
  }
  const outTokens = usage?.completionTokens || 0;
  if (outTokens > PER_RUN_OUTPUT_TOKEN_CAP) {
    return `output tokens ${outTokens} exceeded per-run cap ${PER_RUN_OUTPUT_TOKEN_CAP}`;
  }
  return null;
}

// ---------------------------------------------------------------------------
// Worktree setup for the pre_initiative role (v1: Arm P)
// ---------------------------------------------------------------------------
function ensureWorktree() {
  if (ARM_ROLE !== 'pre_initiative') return;
  if (existsSync(WORKTREE_PATH)) {
    const status = execSync(`git -C "${WORKTREE_PATH}" status --porcelain`, { encoding: 'utf8' }).trim();
    if (status) {
      throw new Error(`Worktree at ${WORKTREE_PATH} is not clean:\n${status}`);
    }
    console.log(`Worktree exists at ${WORKTREE_PATH}`);
    return;
  }

  console.log(`Creating worktree at ${WORKTREE_PATH}...`);
  mkdirSync(resolve(process.env.HOME, 'eval'), { recursive: true });
  execSync(`git worktree add "${WORKTREE_PATH}" eval-baseline-current`, {
    cwd: ROOT,
    encoding: 'utf8',
  });
  console.log('Worktree created');
}

// ---------------------------------------------------------------------------
// Run a single task
// ---------------------------------------------------------------------------
async function runTask(task, rep, armTools, systemPrompt) {
  const startTime = Date.now();
  const { tools: taskTools, toolCallLog } = armTools;
  toolCallLog.length = 0;

  try {
    const model = await resolveModel('anthropic/claude-4.6-sonnet');
    const result = await generateText({
      model,
      system: systemPrompt,
      prompt: task.prompt,
      tools: Object.keys(taskTools).length > 0 ? taskTools : undefined,
      stopWhen: stepCountIs(15),
      maxTokens: 4096,
    });

    const wallTime = Date.now() - startTime;
    const cost = estimateCost(result.usage);
    cumulativeCost += cost;

    const runawayReason = isRunaway(result.usage, cost);
    if (runawayReason) {
      console.error(`  [runaway] ${task.id} rep ${rep}: ${runawayReason}`);
    }

    return {
      task_id: task.id,
      arm: ARM,
      arm_role: ARM_ROLE,
      rep,
      system_prompt_length: systemPrompt.length,
      prompt: task.prompt,
      response: result.text,
      ...(runawayReason ? { error: 'runaway', runaway_reason: runawayReason } : {}),
      tool_calls: [...toolCallLog],
      steps: result.steps?.length || 0,
      usage: result.usage,
      cost_usd: cost,
      cumulative_cost_usd: cumulativeCost,
      wall_time_ms: wallTime,
      timestamp: new Date().toISOString(),
      // I4: store the canonical multi-citation array so judge can compute F1.
      expected_citations: task.expected_citations,
      // Singular kept for v1 backward-compat; equals expected_citations[0].
      expected_citation: task.expected_citation,
      difficulty: task.difficulty,
      pillar: task.pillar,
      combination: task.combination || null,
      adversarial: task.adversarial,
    };
  } catch (error) {
    const wallTime = Date.now() - startTime;
    return {
      task_id: task.id,
      arm: ARM,
      arm_role: ARM_ROLE,
      rep,
      system_prompt_length: systemPrompt.length,
      prompt: task.prompt,
      response: null,
      error: error.message,
      tool_calls: [...toolCallLog],
      steps: 0,
      usage: null,
      cost_usd: 0,
      cumulative_cost_usd: cumulativeCost,
      wall_time_ms: wallTime,
      timestamp: new Date().toISOString(),
      expected_citations: task.expected_citations,
      expected_citation: task.expected_citation,
      difficulty: task.difficulty,
      pillar: task.pillar,
      combination: task.combination || null,
      adversarial: task.adversarial,
    };
  }
}

// ---------------------------------------------------------------------------
// Main execution loop
// ---------------------------------------------------------------------------
async function main() {
  console.log(`\n=== Eval Runner: Arm ${ARM}, Run ID: ${RUN_ID}, Reps: ${REPS} ===\n`);

  // Pre-run checks
  ensureWorktree();

  // Write or load manifest
  let manifest;
  if (existsSync(MANIFEST_FILE)) {
    manifest = JSON.parse(readFileSync(MANIFEST_FILE, 'utf8'));
  } else {
    manifest = {
      run_id: RUN_ID,
      started_at: new Date().toISOString(),
      generation_model: 'anthropic/claude-4.6-sonnet',
      budget_cap_usd: BUDGET_CAP,
      graph_sha: existsSync(GRAPH_CACHE_PATH) ? shaFile(GRAPH_CACHE_PATH) : null,
      graph_cache_path: GRAPH_CACHE_PATH,
      index_sha: existsSync(INDEX_FILE) ? shaFile(INDEX_FILE) : null,
    };
    writeFileSync(MANIFEST_FILE, JSON.stringify(manifest, null, 2));
    console.log(`Manifest written: graph SHA ${manifest.graph_sha?.substring(0, 12) || 'N/A'}..., index SHA ${manifest.index_sha?.substring(0, 12) || 'N/A'}...`);
  }

  // Load checkpoint
  const completed = loadCheckpoint();
  if (completed.size > 0) {
    console.log(`Resuming: ${completed.size} runs already completed`);
  }

  // Start MCP server for treatment-role arms
  if (ARM_ROLE === 'treatment') {
    console.log(`Starting MCP graph server (arm=${ARM}, role=treatment, GRAPH_CACHE_PATH=${GRAPH_CACHE_PATH})...`);
    await startMcpServer();
    console.log('MCP server initialized');

    try {
      const healthResult = await callMcpTool('search', { query: 'anti-pattern', limit: 1 });
      console.log(`MCP health check passed (got ${healthResult.length} chars)`);
    } catch (e) {
      console.error('MCP health check failed:', e.message);
      stopMcpServer();
      process.exit(1);
    }
  }

  // Skill injection is a treatment-role behavior.
  const skills = ARM_ROLE === 'treatment' ? loadSkills() : [];
  if (skills.length > 0) {
    console.log(`Loaded ${skills.length} skills for injection`);
  }

  const armTools = buildToolsForArm(ARM_ROLE);
  const toolNames = Object.keys(armTools.tools || {});
  console.log(`Tools available (role=${ARM_ROLE}): ${toolNames.join(', ') || '(none)'}`);

  // Filter tasks
  const tasks = ONLY_TASK
    ? ALL_TASKS.filter(t => t.id === ONLY_TASK)
    : ALL_TASKS;

  if (tasks.length === 0) {
    console.error(`No tasks matched${ONLY_TASK ? ` (--task ${ONLY_TASK})` : ''}`);
    process.exit(1);
  }

  console.log(`\nRunning ${tasks.length} tasks x ${REPS} reps = ${tasks.length * REPS} total runs\n`);

  let runCount = 0;
  let skipCount = 0;
  let errorCount = 0;

  for (const task of tasks) {
    for (let rep = 1; rep <= REPS; rep++) {
      const key = `${ARM}:${task.id}:${rep}`;

      if (completed.has(key)) {
        skipCount++;
        continue;
      }

      if (cumulativeCost >= BUDGET_CAP) {
        console.error(`\nBUDGET CAP REACHED: $${cumulativeCost.toFixed(2)} >= $${BUDGET_CAP}`);
        console.log(`Completed ${runCount} runs, skipped ${skipCount}, errors ${errorCount}`);
        manifest.budget_exceeded = true;
        manifest.completed_runs = runCount;
        writeFileSync(MANIFEST_FILE, JSON.stringify(manifest, null, 2));
        stopMcpServer();
        process.exit(0);
      }

      if (!CALIBRATION) {
        try {
          verifyCacheIntegrity(manifest);
        } catch (e) {
          console.error(`\nCACHE INTEGRITY WARNING: ${e.message}`);
          console.error('Continuing — graph content is structurally stable (only generatedAt timestamp differs).');
        }
      }

      const injectedSkills = ARM_ROLE === 'treatment' ? matchSkills(task.prompt, skills) : [];
      const systemPrompt = buildSystemPrompt(ARM_ROLE, task, injectedSkills);

      console.log(`[${runCount + skipCount + 1}/${tasks.length * REPS}] ${task.id} rep ${rep}/${REPS} (arm=${ARM} role=${ARM_ROLE})...`);

      const result = await runTask(task, rep, armTools, systemPrompt);

      if (injectedSkills.length > 0) {
        result.injected_skills = injectedSkills.map(s => s.name);
      }

      // Save per-run JSONL
      const runDir = resolve(RESULTS_DIR, ARM, task.id);
      mkdirSync(runDir, { recursive: true });
      const runFile = resolve(runDir, `run-${rep}.jsonl`);
      writeFileSync(runFile, JSON.stringify(result) + '\n');

      appendCheckpoint({
        arm: ARM,
        task_id: task.id,
        rep,
        cost_usd: result.cost_usd,
        cumulative_cost_usd: result.cumulative_cost_usd,
        has_response: !!result.response,
        timestamp: result.timestamp,
      });

      runCount++;
      if (result.error) errorCount++;

      const costStr = `$${result.cost_usd.toFixed(4)} (cumulative: $${cumulativeCost.toFixed(2)})`;
      const citationsFound = result.response?.match(/(?:AP|EAP|CAP)-\d+/g) || [];
      console.log(`  -> ${result.response ? 'OK' : 'ERROR'} | ${result.wall_time_ms}ms | ${costStr} | citations: [${citationsFound.join(', ')}]`);
    }
  }

  console.log(`\n=== Complete ===`);
  console.log(`Runs: ${runCount}, Skipped: ${skipCount}, Errors: ${errorCount}`);
  console.log(`Total cost: $${cumulativeCost.toFixed(2)}`);

  manifest.completed_at = new Date().toISOString();
  manifest[`arm_${ARM}_runs`] = runCount;
  manifest[`arm_${ARM}_errors`] = errorCount;
  manifest[`arm_${ARM}_cost`] = cumulativeCost;
  writeFileSync(MANIFEST_FILE, JSON.stringify(manifest, null, 2));

  stopMcpServer();
}

main().catch((err) => {
  console.error('Fatal error:', err);
  stopMcpServer();
  process.exit(1);
});
