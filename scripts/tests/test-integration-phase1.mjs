#!/usr/bin/env node

/**
 * Gate I7 integration test (structural).
 *
 * Exercises the full eval-config plumbing across all three scripts WITHOUT
 * spending API tokens. The real-LLM dry-run is I8 (blocked on Plan B L1).
 *
 * Steps:
 *   1.  Run scripts/build-graph.mjs to produce both .cache/graph.json and
 *       .cache/graph-untyped.json (Gate I2 already verified parity).
 *   2.  Launch eval-runner with --reps 0 against the Phase-1-shaped test
 *       config for each arm (T-typed and T-untyped). Capture stderr to
 *       confirm each MCP startup logs the correct GRAPH_CACHE_PATH.
 *   3.  Synthesize per-arm run JSONL files (skipping real generation) with
 *       the I4 schema (expected_citations array, F1-eligible).
 *   4.  Synthesize judgments.jsonl entries that mirror eval-judge's output
 *       shape, including multi-citation classification via the imported
 *       classifyCitations() function (so the test doesn't reinvent F1).
 *   5.  Run scripts/eval-aggregate.mjs against the synthesized data and
 *       assert: primary_pair=T-typed-T-untyped, strata=[multi-pillar,
 *       single-pillar], by_stratum populated, and per-pair F1 metrics
 *       reflect the synthesized inputs.
 *
 * Run: node scripts/tests/test-integration-phase1.mjs
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync, rmSync, appendFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { spawn, execSync } from 'child_process';
import { classifyCitations } from '../eval-judge.mjs';

const ROOT = resolve(import.meta.dirname, '..', '..');
const CONFIG = 'scripts/tests/fixtures/typing-eval-config-test.yaml';
const CORPUS = resolve(ROOT, 'scripts/tests/fixtures/typing-corpus-test.md');
const RUN_ID = 'integration-test';
const RESULTS_DIR = resolve(ROOT, 'eval-results', RUN_ID);

let failed = 0;
function check(label, ok, detail = '') {
  console.log(`  ${ok ? 'PASS' : 'FAIL'}: ${label}${detail ? ` (${detail})` : ''}`);
  if (!ok) failed++;
}

function cleanup() {
  if (existsSync(RESULTS_DIR)) rmSync(RESULTS_DIR, { recursive: true, force: true });
}

// ---------------------------------------------------------------------------
// Step 1: build-graph dual emit
// ---------------------------------------------------------------------------
function step1_buildGraph() {
  console.log('\n[1/5] Build typed + untyped graphs');
  execSync('node scripts/build-graph.mjs', { cwd: ROOT, stdio: 'inherit' });
  check('graph.json exists', existsSync(resolve(ROOT, '.cache/graph.json')));
  check('graph-untyped.json exists', existsSync(resolve(ROOT, '.cache/graph-untyped.json')));
}

// ---------------------------------------------------------------------------
// Step 2: runner --reps 0 for each arm with config; verify MCP gets right cache
// ---------------------------------------------------------------------------
function runRunnerCaptureStderr(arm) {
  return new Promise((res, rej) => {
    const proc = spawn(
      process.execPath,
      [
        'scripts/eval-runner.mjs',
        '--eval-config', CONFIG,
        '--arm', arm,
        '--run-id', RUN_ID,
        '--reps', '0',
      ],
      { cwd: ROOT, stdio: ['ignore', 'pipe', 'pipe'] },
    );
    let out = '', err = '';
    proc.stdout.on('data', (d) => { out += d; });
    proc.stderr.on('data', (d) => { err += d; });
    proc.on('exit', (code) => res({ code, out, err }));
    proc.on('error', rej);
  });
}

async function step2_runnerPerArm() {
  console.log('\n[2/5] Runner --reps 0 per arm (verifies config + MCP cache plumbing)');
  cleanup();

  for (const arm of ['T-typed', 'T-untyped']) {
    const expectedCache = arm === 'T-typed'
      ? '.cache/graph.json'
      : '.cache/graph-untyped.json';

    const { code, out, err } = await runRunnerCaptureStderr(arm);
    check(`runner exits 0 (arm=${arm})`, code === 0, `code=${code}`);
    // Combined output (eval-runner emits cache path on stdout, MCP server on stderr).
    const combined = out + err;
    check(
      `runner reports cache path for ${arm}`,
      combined.includes(`GRAPH_CACHE_PATH=`) && combined.includes(expectedCache),
      `expected '${expectedCache}'`,
    );
    check(
      `MCP server stderr confirms cache for ${arm}`,
      combined.includes('[mcp-graph-server] graph cache:') && combined.includes(expectedCache),
    );
  }
}

// ---------------------------------------------------------------------------
// Step 3: synthesize run JSONLs (skip LLM generation)
// ---------------------------------------------------------------------------
function syntheticRun(taskId, arm, rep, expectedCitations, response, pillar) {
  return {
    task_id: taskId,
    arm,
    arm_role: 'treatment',
    rep,
    system_prompt_length: 256,
    prompt: `[fixture] ${taskId}`,
    response,
    tool_calls: [],
    steps: 1,
    usage: { promptTokens: 200, completionTokens: 50 },
    cost_usd: 0.001,
    cumulative_cost_usd: 0.001,
    wall_time_ms: 100,
    timestamp: new Date().toISOString(),
    expected_citations: expectedCitations,
    expected_citation: expectedCitations[0],
    difficulty: 'subtle',
    pillar,
    combination: null,
    adversarial: false,
  };
}

function writeRun(arm, taskId, rep, payload) {
  const dir = resolve(RESULTS_DIR, arm, taskId);
  mkdirSync(dir, { recursive: true });
  writeFileSync(resolve(dir, `run-${rep}.jsonl`), JSON.stringify(payload) + '\n');
}

function step3_synthRuns() {
  console.log('\n[3/5] Synthesize per-arm run JSONLs');

  // int-T001 (multi-pillar, expected: AP-066 + EAP-082)
  //   T-typed   responds with both → F1 = 1.0
  //   T-untyped responds with only AP-066 → F1 = 2/3
  // int-T002 (single-pillar, expected: AP-072)
  //   T-typed   responds correctly  → F1 = 1.0
  //   T-untyped responds wrong (AP-001) → F1 = 0
  writeRun('T-typed', 'int-T001', 1,
    syntheticRun('int-T001', 'T-typed', 1, ['AP-066', 'EAP-082'], 'See AP-066 and EAP-082.', 'multi-pillar'));
  writeRun('T-untyped', 'int-T001', 1,
    syntheticRun('int-T001', 'T-untyped', 1, ['AP-066', 'EAP-082'], 'See AP-066 only.', 'multi-pillar'));
  writeRun('T-typed', 'int-T002', 1,
    syntheticRun('int-T002', 'T-typed', 1, ['AP-072'], 'See AP-072.', 'single-pillar'));
  writeRun('T-untyped', 'int-T002', 1,
    syntheticRun('int-T002', 'T-untyped', 1, ['AP-072'], 'See AP-001.', 'single-pillar'));

  // Manifest stub so eval-runner-style tooling that reads it doesn't choke.
  writeFileSync(
    resolve(RESULTS_DIR, 'manifest.json'),
    JSON.stringify({ run_id: RUN_ID, fixture: true, arms: ['T-typed', 'T-untyped'] }, null, 2),
  );

  for (const arm of ['T-typed', 'T-untyped']) {
    for (const t of ['int-T001', 'int-T002']) {
      check(
        `${arm}/${t}/run-1.jsonl exists`,
        existsSync(resolve(RESULTS_DIR, arm, t, 'run-1.jsonl')),
      );
    }
  }
}

// ---------------------------------------------------------------------------
// Step 4: synthesize judgments.jsonl
// ---------------------------------------------------------------------------
function loadRun(arm, taskId) {
  const path = resolve(RESULTS_DIR, arm, taskId, 'run-1.jsonl');
  return JSON.parse(readFileSync(path, 'utf8').split('\n')[0]);
}

function citationRegex() { return /(?:AP|EAP|CAP)-\d+(?:-[A-Z0-9-]+)?/g; }
function extract(text) { return [...new Set((text || '').match(citationRegex()) || [])]; }

function syntheticJudgment(taskId, rep, armA, armB, judgeModel, prefForA) {
  const runA = loadRun(armA, taskId);
  const runB = loadRun(armB, taskId);
  const citA = extract(runA.response);
  const citB = extract(runB.response);
  const cA = classifyCitations(citA, runA.expected_citations, runA.expected_citation);
  const cB = classifyCitations(citB, runB.expected_citations, runB.expected_citation);
  return {
    task_id: taskId,
    rep,
    arm_a: armA,
    arm_b: armB,
    judge_model: judgeModel,
    coin_flip: true,
    presented_a_arm: armA,
    presented_b_arm: armB,
    raw_scores: {
      adherence_a: prefForA ? 5 : 3,
      adherence_b: prefForA ? 3 : 5,
      quality_a: prefForA ? 4 : 3,
      quality_b: prefForA ? 3 : 4,
      preference: prefForA ? 'A' : 'B',
      reasoning: '[fixture]',
    },
    deblinded_preference: prefForA ? 'A' : 'B',
    reasoning: '[fixture]',
    citations: {
      [armA]: { all: citA, ...cA },
      [armB]: { all: citB, ...cB },
    },
    usage: { promptTokens: 500, completionTokens: 100 },
    error: null,
    timestamp: new Date().toISOString(),
  };
}

function step4_synthJudgments() {
  console.log('\n[4/5] Synthesize judgments.jsonl');
  const judgmentsPath = resolve(RESULTS_DIR, 'judgments.jsonl');
  const lines = [];
  // Three judges, deterministic majorities favoring T-typed.
  const judges = ['openai/gpt-5.4', 'google/gemini-2.5-pro', 'xai/grok-3'];
  for (const taskId of ['int-T001', 'int-T002']) {
    for (const j of judges) {
      lines.push(JSON.stringify(syntheticJudgment(taskId, 1, 'T-typed', 'T-untyped', j, true)));
    }
  }
  writeFileSync(judgmentsPath, lines.join('\n') + '\n');
  check('judgments.jsonl exists', existsSync(judgmentsPath));
  check('contains 6 judgment lines', readFileSync(judgmentsPath, 'utf8').trim().split('\n').length === 6);
}

// ---------------------------------------------------------------------------
// Step 5: run eval-aggregate and inspect summary.json
// ---------------------------------------------------------------------------
function step5_aggregate() {
  console.log('\n[5/5] Run eval-aggregate with test config and inspect summary');
  execSync(
    `node scripts/eval-aggregate.mjs --eval-config ${CONFIG} --run-id ${RUN_ID}`,
    { cwd: ROOT, stdio: 'inherit' },
  );

  const summaryPath = resolve(RESULTS_DIR, 'summary.json');
  check('summary.json exists', existsSync(summaryPath));
  const s = JSON.parse(readFileSync(summaryPath, 'utf8'));

  check('summary.eval_config.phase = typing-test', s.eval_config?.phase === 'typing-test');
  check('summary.eval_config.primary_pair = T-typed-T-untyped',
    s.eval_config?.primary_pair === 'T-typed-T-untyped');
  check('summary.eval_config.stratification_field = pillar',
    s.eval_config?.stratification_field === 'pillar');
  check('summary.eval_config.strata = [multi-pillar, single-pillar]',
    JSON.stringify(s.eval_config?.strata) === JSON.stringify(['multi-pillar', 'single-pillar']));
  check('summary.eval_config._is_fallback = false', s.eval_config?._is_fallback === false);

  const primary = s.results['T-typed-T-untyped'];
  check('primary pair result exists', !!primary);
  check('primary is_primary=true', primary?.is_primary === true);
  // by_stratum (since stratification_field !== 'difficulty')
  check('preference.by_stratum present', !!primary?.preference?.by_stratum);
  check('by_stratum.multi-pillar populated',
    primary?.preference?.by_stratum?.['multi-pillar'] != null);
  check('by_stratum.single-pillar populated',
    primary?.preference?.by_stratum?.['single-pillar'] != null);
  check('preference rate is 100% (judges all favored A=T-typed)',
    Math.abs(primary?.preference?.rate_pct - 100) < 0.01);

  // Citation metrics: T-typed had perfect F1 on both tasks; T-untyped missed
  // half of int-T001 and all of int-T002. Gold rate is the proportion of
  // task-reps with at least one matching citation.
  // T-typed: int-T001 has [AP-066, EAP-082] → 2 gold; int-T002 has [AP-072] → 1 gold
  //   → gold_rate_a = 100% (both task-reps had ≥1 gold)
  // T-untyped: int-T001 had AP-066 → 1 gold; int-T002 had AP-001 → 0 gold
  //   → gold_rate_b = 50%
  check('gold_rate (T-typed) = 100%',
    Math.abs(primary?.citation?.gold_rate_a_pct - 100) < 0.01,
    `actual=${primary?.citation?.gold_rate_a_pct}`);
  check('gold_rate (T-untyped) = 50%',
    Math.abs(primary?.citation?.gold_rate_b_pct - 50) < 0.01,
    `actual=${primary?.citation?.gold_rate_b_pct}`);
  check('gold_advantage_pp = 50',
    Math.abs(primary?.citation?.gold_advantage_pp - 50) < 0.01,
    `actual=${primary?.citation?.gold_advantage_pp}`);

  // No v1-style observed_wrong_t / observed_wrong_r in non-fallback mode.
  check('decisions.rule_3 uses observed_wrong_a/b (non-v1 schema)',
    s.decisions?.rule_3?.observed_wrong_a != null && s.decisions?.rule_3?.observed_wrong_t == null);
}

// ---------------------------------------------------------------------------
// Driver
// ---------------------------------------------------------------------------
async function main() {
  step1_buildGraph();
  await step2_runnerPerArm();
  step3_synthRuns();
  step4_synthJudgments();
  step5_aggregate();

  console.log(`\n${failed === 0 ? 'ALL INTEGRATION CHECKS PASSED' : `${failed} CHECK(S) FAILED`}`);
  cleanup();
  process.exit(failed === 0 ? 0 : 1);
}

main().catch((e) => {
  console.error('Fatal:', e);
  cleanup();
  process.exit(1);
});
