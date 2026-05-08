#!/usr/bin/env node

/**
 * Eval Judge — scripts/eval-judge.mjs
 *
 * Reads generation transcripts from eval-results/{run_id}/{arm}/{task_id}/,
 * presents blind pairwise comparisons to a 3-judge ensemble, and outputs
 * judgment JSONL for aggregation.
 *
 * Usage:
 *   node scripts/eval-judge.mjs --run-id my-eval-001
 *   node scripts/eval-judge.mjs --run-id my-eval-001 --task eval-T003
 *   node scripts/eval-judge.mjs --run-id my-eval-001 --calibration
 *
 * Options:
 *   --run-id <id>     Run identifier (must match eval-runner output)
 *   --task <id>       Optional: judge only this task
 *   --resume          Skip already-judged pairs
 *   --calibration     Judge calibration runs instead of corpus
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync, appendFileSync, readdirSync } from 'fs';
import { resolve, join } from 'path';
import { fileURLToPath } from 'url';
import { generateText } from 'ai';
import { loadEvalConfig } from './lib/eval-config.mjs';

// Only run main() / parse CLI args / validate when invoked directly so that
// other scripts (e.g. test-citation-f1.mjs) can import classifyCitations and
// extractCitations without side effects.
const isDirectInvocation = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);

async function resolveModel(modelId) {
  if (process.env.VERCEL_OIDC_TOKEN) {
    const { gateway } = await import('@ai-sdk/gateway');
    return gateway(modelId);
  }
  const [provider, model] = modelId.split('/');
  if (provider === 'openai' && process.env.OPENAI_API_KEY) {
    const { openai } = await import('@ai-sdk/openai');
    return openai(model);
  }
  if (provider === 'google' && process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
    const { google } = await import('@ai-sdk/google');
    return google(model);
  }
  if (provider === 'xai' && process.env.XAI_API_KEY) {
    const { xai } = await import('@ai-sdk/xai');
    return xai(model);
  }
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

const RUN_ID = getArg('run-id', '');
const ONLY_TASK = getArg('task', null);
const RESUME = hasFlag('resume');
const CALIBRATION = hasFlag('calibration');
const EVAL_CONFIG_PATH = getArg('eval-config', null);

// Validation only fires when invoked directly so importers can pull in the
// pure functions (extractCitations, classifyCitations) without args.
if (isDirectInvocation && !RUN_ID) {
  console.error('Usage: --run-id <id> required');
  process.exit(1);
}

// Skip eval-config resolution entirely on import; it's only needed by main().
const EVAL_CONFIG = isDirectInvocation ? loadEvalConfig(EVAL_CONFIG_PATH, ROOT) : null;

// ---------------------------------------------------------------------------
// Paths and constants
// ---------------------------------------------------------------------------
const RESULTS_DIR = isDirectInvocation ? resolve(ROOT, 'eval-results', RUN_ID) : null;
const JUDGMENTS_FILE = isDirectInvocation ? resolve(RESULTS_DIR, 'judgments.jsonl') : null;
const RUBRIC_FILE = isDirectInvocation ? resolve(ROOT, EVAL_CONFIG.files.judge_rubric) : null;

const JUDGE_MODELS = [
  'openai/gpt-5.4',
  'google/gemini-2.5-pro',
  'xai/grok-3',
];

// I5: judge-side cost tracking. Rates are APPROXIMATE Claude-Sonnet-class
// list prices applied uniformly across the three judges, mirroring the
// constants in scripts/eval-runner.mjs. Use the AI Gateway dashboard for
// authoritative billing — these constants exist only for runaway detection
// and a coarse in-flight budget signal.
const JUDGE_COST_PER_1K_INPUT = 0.003;
const JUDGE_COST_PER_1K_OUTPUT = 0.015;
const PER_RUN_COST_CAP_USD = 5;

function estimateJudgeCost(usage) {
  if (!usage) return 0;
  const inputCost = ((usage.promptTokens || 0) / 1000) * JUDGE_COST_PER_1K_INPUT;
  const outputCost = ((usage.completionTokens || 0) / 1000) * JUDGE_COST_PER_1K_OUTPUT;
  return inputCost + outputCost;
}

// Pairs ordered as [armA, armB]. Either order is valid; the runner stores
// per-arm runs in disjoint directories so loading is symmetric.
const COMPARISON_PAIRS = isDirectInvocation ? EVAL_CONFIG.comparison_pairs : null;
const ARM_IDS = isDirectInvocation ? Object.keys(EVAL_CONFIG.arms) : null;
// Anchor arm for task enumeration: derived from the primary pair (the
// "treatment" side) so judging always iterates over the universe of tasks
// the treatment arm produced.
const ANCHOR_ARM = isDirectInvocation
  ? resolveAnchorArm(EVAL_CONFIG.primary_pair.split('-'), ARM_IDS, COMPARISON_PAIRS, EVAL_CONFIG.primary_pair)
  : null;

function resolveAnchorArm(parts, ids, pairs, primaryPair) {
  // Try every prefix split — pick the one whose [a, b] match a known pair.
  for (let i = 1; i < parts.length; i++) {
    const a = parts.slice(0, i).join('-');
    const b = parts.slice(i).join('-');
    if (ids.includes(a) && ids.includes(b) && pairs.some(([x, y]) => x === a && y === b)) {
      return a;
    }
  }
  throw new Error(
    `Cannot resolve primary_pair '${primaryPair}' against arms [${ids.join(', ')}] and comparison_pairs [${pairs.map((p) => p.join('-')).join(', ')}]`,
  );
}

// ---------------------------------------------------------------------------
// Load judge rubric
// ---------------------------------------------------------------------------
function loadRubric() {
  const content = readFileSync(RUBRIC_FILE, 'utf8');
  const systemMatch = content.match(/## Judge system prompt[\s\S]*?```\n([\s\S]*?)```/);
  const userMatch = content.match(/## Judge user prompt template[\s\S]*?```\n([\s\S]*?)```/);

  if (!systemMatch) throw new Error('Cannot find judge system prompt in rubric file');

  return {
    systemPrompt: systemMatch[1].trim(),
    userTemplate: userMatch?.[1]?.trim() || '## User prompt\n\n{task_prompt}\n\n## Response A\n\n{response_a}\n\n## Response B\n\n{response_b}',
  };
}

// ---------------------------------------------------------------------------
// Citation extraction (deterministic, not LLM-judged)
// ---------------------------------------------------------------------------
const CITATION_REGEX = /(?:AP|EAP|CAP)-\d+(?:-[A-Z0-9-]+)?/g;

export function extractCitations(text) {
  if (!text) return [];
  return [...new Set(text.match(CITATION_REGEX) || [])];
}

/**
 * I4: multi-citation F1 grading.
 *
 * Inputs:
 *   citations           — extracted citation IDs from the model response
 *   expectedCitations   — canonical array of gold IDs (Phase 1+ schema)
 *   expectedCitationStr — singular fallback when only v1 corpus available
 *
 * Returns: { gold, wrong, noCite, precision, recall, f1, n_expected, n_extracted }
 *
 * Edge cases (pre-registered convention from multipillar plan Appendix A):
 *   - extracted = []                 → precision=0, F1=0 (recall undefined → 0 if expected non-empty; vacuous 1 if expected also empty)
 *   - expected = [], extracted = X   → recall=1 (vacuous), precision=0, F1=0
 *   - extracted = [], expected = []  → precision=1, recall=1, F1=1 (perfect: model correctly avoided citing)
 *
 * Adversarial tasks set expected_citations to a sentinel
 * (e.g. ["EAP-FAKE-NNN-EVAL-ONLY"]); a "gold cite" against this sentinel
 * indicates the model HALLUCINATED. eval-aggregate.mjs is responsible for
 * relabeling the metric for tasks tagged adversarial: true.
 */
export function classifyCitations(citations, expectedCitations, expectedCitationStr) {
  const expectedArr = (expectedCitations && expectedCitations.length > 0)
    ? expectedCitations
    : (expectedCitationStr ? [expectedCitationStr] : []);
  const expectedSet = new Set(expectedArr);
  const extractedSet = new Set(citations);

  const gold = [];
  const wrong = [];
  for (const c of citations) {
    if (expectedSet.has(c)) gold.push(c);
    else wrong.push(c);
  }

  const tp = [...extractedSet].filter((c) => expectedSet.has(c)).length;

  let precision, recall, f1;
  if (extractedSet.size === 0 && expectedSet.size === 0) {
    precision = 1; recall = 1; f1 = 1;
  } else if (extractedSet.size === 0) {
    // Model cited nothing but should have cited something.
    precision = 0; recall = 0; f1 = 0;
  } else if (expectedSet.size === 0) {
    // Vacuous recall (no gold to find), but precision=0 because every
    // extracted ID is wrong by definition.
    precision = 0; recall = 1; f1 = 0;
  } else {
    precision = tp / extractedSet.size;
    recall = tp / expectedSet.size;
    f1 = (precision + recall) === 0 ? 0 : (2 * precision * recall) / (precision + recall);
  }

  return {
    gold,
    wrong,
    noCite: citations.length === 0,
    precision,
    recall,
    f1,
    n_expected: expectedSet.size,
    n_extracted: extractedSet.size,
    expected: [...expectedSet],
  };
}

// ---------------------------------------------------------------------------
// Load generation runs
// ---------------------------------------------------------------------------
function loadRunsForArm(arm) {
  const armDir = resolve(RESULTS_DIR, arm);
  if (!existsSync(armDir)) return {};

  const runs = {};
  const taskDirs = readdirSync(armDir).filter(d => {
    const p = resolve(armDir, d);
    try { return readdirSync(p).length > 0; } catch { return false; }
  });

  for (const taskId of taskDirs) {
    runs[taskId] = [];
    const taskDir = resolve(armDir, taskId);
    const runFiles = readdirSync(taskDir).filter(f => f.startsWith('run-') && f.endsWith('.jsonl'));
    for (const rf of runFiles) {
      try {
        const data = JSON.parse(readFileSync(resolve(taskDir, rf), 'utf8').split('\n')[0]);
        const rep = parseInt(rf.match(/run-(\d+)/)?.[1] || '0');
        runs[taskId].push({ ...data, rep });
      } catch { /* skip malformed */ }
    }
    runs[taskId].sort((a, b) => a.rep - b.rep);
  }
  return runs;
}

// ---------------------------------------------------------------------------
// Load existing judgments for resume
// ---------------------------------------------------------------------------
function loadExistingJudgments() {
  if (!RESUME || !existsSync(JUDGMENTS_FILE)) return new Set();
  const lines = readFileSync(JUDGMENTS_FILE, 'utf8').split('\n').filter(Boolean);
  const done = new Set();
  for (const line of lines) {
    try {
      const j = JSON.parse(line);
      done.add(`${j.task_id}:${j.rep}:${j.arm_a}:${j.arm_b}:${j.judge_model}`);
    } catch { /* skip */ }
  }
  return done;
}

// ---------------------------------------------------------------------------
// Call a single judge
// ---------------------------------------------------------------------------
async function callJudge(judgeModel, systemPrompt, userPrompt) {
  try {
    const model = await resolveModel(judgeModel);
    const result = await generateText({
      model,
      system: systemPrompt,
      prompt: userPrompt,
      maxTokens: 512,
    });

    const text = result.text.trim();

    // Extract JSON from response (handle markdown code blocks)
    let jsonStr = text;
    const codeBlockMatch = text.match(/```(?:json)?\s*\n?([\s\S]*?)```/);
    if (codeBlockMatch) jsonStr = codeBlockMatch[1].trim();

    const parsed = JSON.parse(jsonStr);
    return {
      raw_response: text,
      parsed,
      usage: result.usage,
      error: null,
    };
  } catch (error) {
    return {
      raw_response: null,
      parsed: null,
      usage: null,
      error: error.message,
    };
  }
}

// ---------------------------------------------------------------------------
// Main judging loop
// ---------------------------------------------------------------------------
async function main() {
  console.log(`\n=== Eval Judge: Run ID ${RUN_ID} ===\n`);

  const rubric = loadRubric();
  console.log(`Rubric loaded (system prompt: ${rubric.systemPrompt.length} chars)`);

  // Load every arm declared in the config. Arms with no run directory are
  // tolerated (e.g. partial dry-runs); they simply produce zero pairings.
  const armData = {};
  for (const arm of ARM_IDS) {
    armData[arm] = loadRunsForArm(arm);
    const taskCount = Object.keys(armData[arm]).length;
    const runCount = Object.values(armData[arm]).reduce((s, r) => s + r.length, 0);
    console.log(`Arm ${arm}: ${taskCount} tasks, ${runCount} runs`);
  }

  const existingJudgments = loadExistingJudgments();
  if (existingJudgments.size > 0) {
    console.log(`Resuming: ${existingJudgments.size} judgments already exist`);
  }

  // Enumerate tasks from the anchor arm (the "treatment" side of the primary
  // pair). For Phase 1 this is `T-typed`; for v1 fallback this is `T`.
  let taskIds = Object.keys(armData[ANCHOR_ARM] || {});
  if (ONLY_TASK) {
    taskIds = taskIds.filter(t => t === ONLY_TASK);
  }

  console.log(`\nJudging ${taskIds.length} tasks across ${COMPARISON_PAIRS.length} pairs x ${JUDGE_MODELS.length} judges\n`);

  let judgeCount = 0;
  let skipCount = 0;
  let errorCount = 0;
  let totalCost = 0;

  for (const taskId of taskIds) {
    const anchorRuns = armData[ANCHOR_ARM][taskId] || [];

    for (const tRun of anchorRuns) {
      const rep = tRun.rep;

      for (const [armA, armB] of COMPARISON_PAIRS) {
        const runsA = armData[armA][taskId] || [];
        const runsB = armData[armB][taskId] || [];
        const runA = runsA.find(r => r.rep === rep);
        const runB = runsB.find(r => r.rep === rep);

        if (!runA || !runB) {
          console.log(`  SKIP ${taskId} rep ${rep} ${armA}-${armB}: missing data`);
          continue;
        }

        if (!runA.response || !runB.response) {
          console.log(`  SKIP ${taskId} rep ${rep} ${armA}-${armB}: null response`);
          continue;
        }

        // Randomize presentation order
        const coinFlip = Math.random() > 0.5;
        const presentedA = coinFlip ? runA : runB;
        const presentedB = coinFlip ? runB : runA;
        const actualArmA = coinFlip ? armA : armB;
        const actualArmB = coinFlip ? armB : armA;

        for (const judgeModel of JUDGE_MODELS) {
          const key = `${taskId}:${rep}:${armA}:${armB}:${judgeModel}`;
          if (existingJudgments.has(key)) {
            skipCount++;
            continue;
          }

          const userPrompt = rubric.userTemplate
            .replace('{task_prompt}', tRun.prompt)
            .replace('{response_a}', presentedA.response)
            .replace('{response_b}', presentedB.response);

          console.log(`  [${judgeCount + 1}] ${taskId} rep ${rep} ${armA}-${armB} judge=${judgeModel.split('/')[1]}...`);

          const judgeResult = await callJudge(judgeModel, rubric.systemPrompt, userPrompt);

          // De-blind the preference
          let deblindedPreference = judgeResult.parsed?.preference || null;
          if (deblindedPreference && !coinFlip) {
            if (deblindedPreference === 'A') deblindedPreference = 'B';
            else if (deblindedPreference === 'B') deblindedPreference = 'A';
          }

          // Citation extraction (deterministic). Pass both array (I4 canonical)
          // and singular fallback so v1 run JSONLs with only expected_citation
          // still grade correctly.
          const citationsA = extractCitations(runA.response);
          const citationsB = extractCitations(runB.response);
          const citClassA = classifyCitations(citationsA, runA.expected_citations, runA.expected_citation);
          const citClassB = classifyCitations(citationsB, runB.expected_citations, runB.expected_citation);

          const judgment = {
            task_id: taskId,
            rep,
            arm_a: armA,
            arm_b: armB,
            judge_model: judgeModel,
            coin_flip: coinFlip,
            presented_a_arm: actualArmA,
            presented_b_arm: actualArmB,
            raw_scores: judgeResult.parsed,
            deblinded_preference: deblindedPreference,
            reasoning: judgeResult.parsed?.reasoning || null,
            citations: {
              [armA]: { all: citationsA, ...citClassA },
              [armB]: { all: citationsB, ...citClassB },
            },
            usage: judgeResult.usage,
            error: judgeResult.error,
            timestamp: new Date().toISOString(),
          };

          appendFileSync(JUDGMENTS_FILE, JSON.stringify(judgment) + '\n');

          judgeCount++;
          if (judgeResult.error) errorCount++;

          // Cost estimate uses Claude-Sonnet-class APPROXIMATE rates and
          // applies them uniformly to all judges. Rates are mirrored in
          // scripts/eval-runner.mjs (COST_PER_1K_INPUT/OUTPUT). For final
          // reconciliation, consult the AI Gateway dashboard — these
          // numbers are only used for in-flight runaway detection and an
          // order-of-magnitude budget signal.
          const judgeCost = estimateJudgeCost(judgeResult.usage);
          totalCost += judgeCost;
          if (judgeCost > PER_RUN_COST_CAP_USD) {
            console.warn(`    [runaway-judge] ${taskId} rep ${rep} ${judgeModel}: $${judgeCost.toFixed(2)} exceeded per-run cap $${PER_RUN_COST_CAP_USD}`);
          }

          const pref = deblindedPreference || 'error';
          console.log(`    -> pref: ${pref} | adh: ${judgeResult.parsed?.adherence_a || '?'}/${judgeResult.parsed?.adherence_b || '?'} | $${judgeCost.toFixed(4)}`);
        }
      }
    }
  }

  console.log(`\n=== Judging Complete ===`);
  console.log(`Judgments: ${judgeCount}, Skipped: ${skipCount}, Errors: ${errorCount}`);
  console.log(`Total judge cost: $${totalCost.toFixed(2)}`);
}

if (isDirectInvocation) {
  main().catch((err) => {
    console.error('Fatal error:', err);
    process.exit(1);
  });
}
