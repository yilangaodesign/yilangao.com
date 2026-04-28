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
import { generateText } from 'ai';

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

if (!RUN_ID) {
  console.error('Usage: --run-id <id> required');
  process.exit(1);
}

// ---------------------------------------------------------------------------
// Paths and constants
// ---------------------------------------------------------------------------
const RESULTS_DIR = resolve(ROOT, 'eval-results', RUN_ID);
const JUDGMENTS_FILE = resolve(RESULTS_DIR, 'judgments.jsonl');
const RUBRIC_FILE = resolve(ROOT, 'docs/eval-judge-rubric.md');

const JUDGE_MODELS = [
  'openai/gpt-5.4',
  'google/gemini-2.5-pro',
  'xai/grok-3',
];

const COMPARISON_PAIRS = [
  ['T', 'R'],
  ['T', 'P'],
  ['T', 'B'],
];

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

function extractCitations(text) {
  if (!text) return [];
  return [...new Set(text.match(CITATION_REGEX) || [])];
}

function classifyCitations(citations, expectedCitation) {
  const gold = [];
  const wrong = [];
  for (const c of citations) {
    if (c === expectedCitation) gold.push(c);
    else wrong.push(c);
  }
  return { gold, wrong, noCite: citations.length === 0 };
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

  // Load all arms
  const armData = {};
  for (const arm of ['T', 'R', 'P', 'B']) {
    armData[arm] = loadRunsForArm(arm);
    const taskCount = Object.keys(armData[arm]).length;
    const runCount = Object.values(armData[arm]).reduce((s, r) => s + r.length, 0);
    console.log(`Arm ${arm}: ${taskCount} tasks, ${runCount} runs`);
  }

  const existingJudgments = loadExistingJudgments();
  if (existingJudgments.size > 0) {
    console.log(`Resuming: ${existingJudgments.size} judgments already exist`);
  }

  // Collect all task IDs from Treatment arm
  let taskIds = Object.keys(armData.T);
  if (ONLY_TASK) {
    taskIds = taskIds.filter(t => t === ONLY_TASK);
  }

  console.log(`\nJudging ${taskIds.length} tasks across ${COMPARISON_PAIRS.length} pairs x ${JUDGE_MODELS.length} judges\n`);

  let judgeCount = 0;
  let skipCount = 0;
  let errorCount = 0;
  let totalCost = 0;

  for (const taskId of taskIds) {
    const tRuns = armData.T[taskId] || [];

    for (const tRun of tRuns) {
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

          // Citation extraction (deterministic)
          const citationsA = extractCitations(runA.response);
          const citationsB = extractCitations(runB.response);
          const citClassA = classifyCitations(citationsA, runA.expected_citation);
          const citClassB = classifyCitations(citationsB, runB.expected_citation);

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

          const cost = judgeResult.usage
            ? ((judgeResult.usage.promptTokens || 0) / 1000) * 0.003 +
              ((judgeResult.usage.completionTokens || 0) / 1000) * 0.015
            : 0;
          totalCost += cost;

          const pref = deblindedPreference || 'error';
          console.log(`    -> pref: ${pref} | adh: ${judgeResult.parsed?.adherence_a || '?'}/${judgeResult.parsed?.adherence_b || '?'} | $${cost.toFixed(4)}`);
        }
      }
    }
  }

  console.log(`\n=== Judging Complete ===`);
  console.log(`Judgments: ${judgeCount}, Skipped: ${skipCount}, Errors: ${errorCount}`);
  console.log(`Total judge cost: $${totalCost.toFixed(2)}`);
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
