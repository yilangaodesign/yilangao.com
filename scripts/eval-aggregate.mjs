#!/usr/bin/env node

/**
 * Eval Aggregate — scripts/eval-aggregate.mjs
 *
 * Reads judgments from eval-results/{run_id}/judgments.jsonl, computes all
 * decision-rule metrics from the pre-registration doc (thresholds parsed at
 * runtime, zero hardcoded constants), and outputs summary JSON + markdown.
 *
 * Usage:
 *   node scripts/eval-aggregate.mjs --run-id my-eval-001
 *   node scripts/eval-aggregate.mjs --run-id my-eval-001 --calibration-only
 */

import { readFileSync, writeFileSync, existsSync, readdirSync } from 'fs';
import { resolve } from 'path';
import { loadEvalConfig } from './lib/eval-config.mjs';

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
const CALIBRATION_ONLY = hasFlag('calibration-only');
const EVAL_CONFIG_PATH = getArg('eval-config', null);

if (!RUN_ID) {
  console.error('Usage: --run-id <id> required');
  process.exit(1);
}

const EVAL_CONFIG = loadEvalConfig(EVAL_CONFIG_PATH, ROOT);
const PRIMARY_PAIR = EVAL_CONFIG.primary_pair;
const STRATIFICATION_FIELD = EVAL_CONFIG.stratification_field;
const STRATA = EVAL_CONFIG.strata;

// ---------------------------------------------------------------------------
// Paths
// ---------------------------------------------------------------------------
const RESULTS_DIR = resolve(ROOT, 'eval-results', RUN_ID);
const JUDGMENTS_FILE = resolve(RESULTS_DIR, 'judgments.jsonl');
const PRE_REG_FILE = resolve(ROOT, EVAL_CONFIG.files.pre_registration);
const CORPUS_FILE = resolve(ROOT, EVAL_CONFIG.files.corpus);

// ---------------------------------------------------------------------------
// Parse thresholds from pre-registration doc (single source of truth)
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

const T = parseThresholds();
console.log('Thresholds parsed from pre-registration doc:', T);

// ---------------------------------------------------------------------------
// Parse task metadata from corpus.
//
// Extracts the field named by config.stratification_field for each task so
// the aggregator can stratify generically (v1: 'difficulty' → obvious/subtle;
// Phase 2: 'combination' → D+E / D+E+C / D+C / E+C / single-pillar).
//
// We also retain `difficulty` unconditionally for backward-compat with the v1
// summary.json shape, even when a different stratification field is in use.
// ---------------------------------------------------------------------------
function parseTaskMeta(stratField) {
  const content = readFileSync(CORPUS_FILE, 'utf8');
  const yamlBlock = content.match(/```yaml\n([\s\S]*?)```/);
  if (!yamlBlock) return {};
  const meta = {};
  const entries = yamlBlock[1].split(/^- id:\s+/m).filter(Boolean);
  // Build a regex for the configured stratification field; allow either bare
  // word or quoted/multi-token values (e.g. "D+E").
  const stratRe = new RegExp(`${stratField}:\\s*"?([^"\\n]+?)"?\\s*$`, 'm');
  for (const entry of entries) {
    const id = entry.match(/^(\S+)/)?.[1];
    if (!id) continue;
    const stratVal = entry.match(stratRe)?.[1]?.trim() || 'unknown';
    const diff = entry.match(/difficulty:\s*(\S+)/)?.[1] || 'unknown';
    // Preserve the corpus's task ID verbatim. We DON'T inject an `eval-`
    // prefix because runs/judgments key off task_id from the corpus YAML
    // exactly. (v1 corpora already use `eval-T001`-style IDs; later phases
    // may use different prefixes.)
    meta[id] = {
      id,
      difficulty: diff,
      stratum: stratVal,
    };
    // Also expose under the `eval-${id}` alias for v1 callers that historically
    // looked up by the prefixed key.
    if (!id.startsWith('eval-')) {
      meta[`eval-${id}`] = meta[id];
    }
  }
  return meta;
}

// ---------------------------------------------------------------------------
// Load judgments
// ---------------------------------------------------------------------------
function loadJudgments() {
  if (!existsSync(JUDGMENTS_FILE)) {
    throw new Error(`Judgments file not found: ${JUDGMENTS_FILE}`);
  }
  return readFileSync(JUDGMENTS_FILE, 'utf8')
    .split('\n')
    .filter(Boolean)
    .map(line => {
      try { return JSON.parse(line); }
      catch { return null; }
    })
    .filter(Boolean);
}

// Resolve "armA-armB" to [armA, armB] honoring multi-dash arm IDs by
// consulting the known arm list. Falls back to a simple single-dash split
// when no match is found (preserves error visibility for misconfigured pairs).
function splitPair(pairKey, knownArms) {
  const parts = pairKey.split('-');
  for (let i = 1; i < parts.length; i++) {
    const a = parts.slice(0, i).join('-');
    const b = parts.slice(i).join('-');
    if (knownArms.includes(a) && knownArms.includes(b)) return [a, b];
  }
  // Best-effort fallback (used when the pair doesn't match known arms; the
  // caller will surface a clearer error elsewhere).
  return [parts[0], parts.slice(1).join('-') || parts[1]];
}

// ---------------------------------------------------------------------------
// Statistical functions
// ---------------------------------------------------------------------------

/** Wilcoxon signed-rank test (two-sided, normal approximation for N > 20) */
function wilcoxonSignedRank(paired) {
  const diffs = paired.map(([a, b]) => a - b).filter(d => d !== 0);
  const n = diffs.length;
  if (n === 0) return { stat: 0, z: 0, p: 1, n: 0 };

  const ranks = diffs
    .map((d, i) => ({ abs: Math.abs(d), sign: Math.sign(d), idx: i }))
    .sort((a, b) => a.abs - b.abs);

  // Assign ranks with ties
  let i = 0;
  while (i < ranks.length) {
    let j = i;
    while (j < ranks.length && ranks[j].abs === ranks[i].abs) j++;
    const avgRank = (i + 1 + j) / 2;
    for (let k = i; k < j; k++) ranks[k].rank = avgRank;
    i = j;
  }

  const wPlus = ranks.filter(r => r.sign > 0).reduce((s, r) => s + r.rank, 0);
  const wMinus = ranks.filter(r => r.sign < 0).reduce((s, r) => s + r.rank, 0);
  const W = Math.min(wPlus, wMinus);

  const mean = n * (n + 1) / 4;
  const variance = n * (n + 1) * (2 * n + 1) / 24;
  const z = (W - mean) / Math.sqrt(variance);
  const p = 2 * (1 - normalCDF(Math.abs(z)));

  return { stat: W, wPlus, wMinus, z, p, n };
}

/** McNemar's test for paired binary data */
function mcNemar(paired) {
  let b = 0, c = 0;
  for (const [a, x] of paired) {
    if (a && !x) b++;
    if (!a && x) c++;
  }
  if (b + c === 0) return { chi2: 0, p: 1, b, c };
  const chi2 = (Math.abs(b - c) - 1) ** 2 / (b + c);
  const p = 1 - chi2CDF(chi2, 1);
  return { chi2, p, b, c };
}

/** Bootstrap 95% CI on a proportion */
function bootstrapCI(values, iterations, alpha = 0.05) {
  const n = values.length;
  if (n === 0) return { mean: 0, lower: 0, upper: 0 };
  const means = [];
  for (let i = 0; i < iterations; i++) {
    let sum = 0;
    for (let j = 0; j < n; j++) {
      sum += values[Math.floor(Math.random() * n)];
    }
    means.push(sum / n);
  }
  means.sort((a, b) => a - b);
  const lo = Math.floor((alpha / 2) * iterations);
  const hi = Math.floor((1 - alpha / 2) * iterations);
  return {
    mean: values.reduce((s, v) => s + v, 0) / n,
    lower: means[lo],
    upper: means[hi],
  };
}

/** Fleiss' kappa for inter-rater agreement */
function fleissKappa(ratings, categories) {
  const n = ratings.length;
  if (n === 0) return 0;
  const k = ratings[0].length; // number of raters
  const catSet = categories || [...new Set(ratings.flat())];
  const q = catSet.length;

  const proportions = [];
  let pBar = 0;

  for (const row of ratings) {
    const counts = {};
    for (const c of catSet) counts[c] = 0;
    for (const r of row) counts[r] = (counts[r] || 0) + 1;
    const pi = Object.values(counts).reduce((s, c) => s + c * (c - 1), 0) / (k * (k - 1));
    proportions.push(pi);
  }

  pBar = proportions.reduce((s, p) => s + p, 0) / n;

  const pj = {};
  for (const c of catSet) {
    let total = 0;
    for (const row of ratings) {
      total += row.filter(r => r === c).length;
    }
    pj[c] = total / (n * k);
  }
  const pE = Object.values(pj).reduce((s, p) => s + p * p, 0);

  if (pE === 1) return 1;
  return (pBar - pE) / (1 - pE);
}

/** Cohen's d with CI */
function cohensD(group1, group2) {
  const n1 = group1.length;
  const n2 = group2.length;
  if (n1 === 0 || n2 === 0) return { d: 0, lower: 0, upper: 0 };
  const mean1 = group1.reduce((s, v) => s + v, 0) / n1;
  const mean2 = group2.reduce((s, v) => s + v, 0) / n2;
  const var1 = group1.reduce((s, v) => s + (v - mean1) ** 2, 0) / (n1 - 1);
  const var2 = group2.reduce((s, v) => s + (v - mean2) ** 2, 0) / (n2 - 1);
  const pooledSD = Math.sqrt(((n1 - 1) * var1 + (n2 - 1) * var2) / (n1 + n2 - 2));
  const d = pooledSD === 0 ? 0 : (mean1 - mean2) / pooledSD;
  const se = Math.sqrt((n1 + n2) / (n1 * n2) + (d * d) / (2 * (n1 + n2)));
  return {
    d,
    lower: d - 1.96 * se,
    upper: d + 1.96 * se,
  };
}

/** Holm-Bonferroni correction */
function holmCorrect(pValues) {
  const indexed = pValues.map((p, i) => ({ p, i })).sort((a, b) => a.p - b.p);
  const m = pValues.length;
  const corrected = new Array(m);
  let maxSoFar = 0;
  for (let k = 0; k < m; k++) {
    const adj = indexed[k].p * (m - k);
    maxSoFar = Math.max(maxSoFar, adj);
    corrected[indexed[k].i] = Math.min(maxSoFar, 1);
  }
  return corrected;
}

// Helper: standard normal CDF approximation
function normalCDF(x) {
  const a1 = 0.254829592, a2 = -0.284496736, a3 = 1.421413741;
  const a4 = -1.453152027, a5 = 1.061405429, p = 0.3275911;
  const sign = x < 0 ? -1 : 1;
  x = Math.abs(x) / Math.SQRT2;
  const t = 1.0 / (1.0 + p * x);
  const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);
  return 0.5 * (1.0 + sign * y);
}

// Helper: chi-squared CDF (1 df) approximation
function chi2CDF(x, df) {
  if (df !== 1) return 0;
  return 2 * normalCDF(Math.sqrt(x)) - 1;
}

// ---------------------------------------------------------------------------
// Aggregation
// ---------------------------------------------------------------------------
async function main() {
  console.log(`\n=== Eval Aggregate: Run ID ${RUN_ID} ===\n`);

  const judgments = loadJudgments();
  console.log(`Loaded ${judgments.length} judgments`);

  const taskMeta = parseTaskMeta(STRATIFICATION_FIELD);
  console.log(`Stratification: field='${STRATIFICATION_FIELD}', strata=[${STRATA.join(', ')}]`);
  console.log(`Primary pair: ${PRIMARY_PAIR}`);

  // Group judgments by comparison pair
  const byPair = {};
  for (const j of judgments) {
    const pairKey = `${j.arm_a}-${j.arm_b}`;
    if (!byPair[pairKey]) byPair[pairKey] = [];
    byPair[pairKey].push(j);
  }

  console.log('Pairs:', Object.keys(byPair).map(k => `${k}: ${byPair[k].length}`).join(', '));

  // ---------------------------------------------------------------------------
  // Convergence rate per arm (Phase 1+ derived metric).
  //
  // Reads the raw run JSONLs directly so we can count how many runs produced
  // an empty `response` (typically: agent exhausted its step budget without
  // emitting final text). The judge SKIPs pairs where either side is null,
  // which means a low convergence rate would otherwise vanish from the
  // aggregated metrics — and Phase 1's Gate B explicitly cares about whether
  // typed-vs-untyped affects convergence.
  // ---------------------------------------------------------------------------
  const convergenceByArm = {};
  for (const arm of Object.keys(EVAL_CONFIG.arms)) {
    const armDir = resolve(RESULTS_DIR, arm);
    convergenceByArm[arm] = { total_runs: 0, empty_response: 0, runaway: 0 };
    if (!existsSync(armDir)) continue;
    const taskDirs = readdirSync(armDir, { withFileTypes: true })
      .filter((d) => d.isDirectory())
      .map((d) => d.name);
    for (const taskId of taskDirs) {
      const taskDir = resolve(armDir, taskId);
      const runFiles = readdirSync(taskDir).filter((f) => /^run-\d+\.jsonl$/.test(f));
      for (const file of runFiles) {
        const lines = readFileSync(resolve(taskDir, file), 'utf8').split('\n').filter(Boolean);
        for (const line of lines) {
          let r;
          try { r = JSON.parse(line); } catch { continue; }
          convergenceByArm[arm].total_runs++;
          if (!r.response) convergenceByArm[arm].empty_response++;
          if (r.error === 'runaway') convergenceByArm[arm].runaway++;
        }
      }
    }
    const c = convergenceByArm[arm];
    c.convergence_rate_pct = c.total_runs > 0
      ? ((c.total_runs - c.empty_response) / c.total_runs) * 100
      : null;
  }
  const convergenceLine = Object.entries(convergenceByArm)
    .map(([arm, c]) => {
      if (c.total_runs === 0) return `${arm}: no runs`;
      const rate = c.convergence_rate_pct?.toFixed(1) ?? 'n/a';
      return `${arm}: ${c.total_runs - c.empty_response}/${c.total_runs} (${rate}%)`;
    })
    .join(', ');
  console.log(`Convergence: ${convergenceLine}`);

  // Stratify tasks: build a Set per stratum value declared in config.
  // Tasks whose stratum value isn't in config.strata are routed to a special
  // 'unknown' bucket so they're surfaced rather than silently dropped.
  const tasksByStratum = {};
  for (const stratum of STRATA) tasksByStratum[stratum] = new Set();
  tasksByStratum.unknown = new Set();
  for (const meta of Object.values(taskMeta)) {
    const bucket = STRATA.includes(meta.stratum) ? meta.stratum : 'unknown';
    tasksByStratum[bucket].add(meta.id);
  }
  if (tasksByStratum.unknown.size > 0) {
    console.warn(
      `[aggregate] WARN: ${tasksByStratum.unknown.size} task(s) have stratum value not in config.strata: ${[...tasksByStratum.unknown].join(', ')}`,
    );
  }

  // ---------------------------------------------------------------------------
  // Compute metrics for each comparison pair
  // ---------------------------------------------------------------------------
  const results = {};

  const knownArms = Object.keys(EVAL_CONFIG.arms);
  for (const [pairKey, pairJudgments] of Object.entries(byPair)) {
    // Use splitPair() so multi-hyphen arm IDs (e.g. 'T-typed-T-untyped')
    // resolve correctly. Naive split('-') would yield ['T', 'typed', 'T', 'untyped'].
    const [armA, armB] = splitPair(pairKey, knownArms);

    // Preferences (per task-rep, majority vote across judges)
    const taskRepPrefs = {};
    const adherencePairs = [];
    const qualityPairs = [];

    for (const j of pairJudgments) {
      const trKey = `${j.task_id}:${j.rep}`;
      if (!taskRepPrefs[trKey]) taskRepPrefs[trKey] = { votes: [], taskId: j.task_id };
      if (j.deblinded_preference) {
        taskRepPrefs[trKey].votes.push(j.deblinded_preference);
      }

      // Collect adherence/quality scores
      if (j.raw_scores) {
        const scoreA = j.coin_flip ? j.raw_scores.adherence_a : j.raw_scores.adherence_b;
        const scoreB = j.coin_flip ? j.raw_scores.adherence_b : j.raw_scores.adherence_a;
        if (scoreA != null && scoreB != null) adherencePairs.push([scoreA, scoreB]);

        const qualA = j.coin_flip ? j.raw_scores.quality_a : j.raw_scores.quality_b;
        const qualB = j.coin_flip ? j.raw_scores.quality_b : j.raw_scores.quality_a;
        if (qualA != null && qualB != null) qualityPairs.push([qualA, qualB]);
      }
    }

    // Majority preference per task-rep
    const prefValues = [];
    // N-way strata bins keyed by stratum value declared in config.
    const prefByStratum = {};
    for (const stratum of STRATA) prefByStratum[stratum] = [];

    for (const [, data] of Object.entries(taskRepPrefs)) {
      const aWins = data.votes.filter(v => v === 'A').length;
      const bWins = data.votes.filter(v => v === 'B').length;
      const majority = aWins > bWins ? 1 : bWins > aWins ? 0 : 0.5;
      prefValues.push(majority);

      for (const stratum of STRATA) {
        if (tasksByStratum[stratum].has(data.taskId)) {
          prefByStratum[stratum].push(majority);
          break;
        }
      }
    }

    const prefRate = prefValues.length > 0
      ? prefValues.reduce((s, v) => s + v, 0) / prefValues.length * 100
      : 0;

    const prefCI = bootstrapCI(prefValues, T.bootstrap_iterations);

    // Citation metrics
    const goldCiteA = [];
    const goldCiteB = [];
    const wrongCiteA = [];
    const wrongCiteB = [];

    for (const j of pairJudgments) {
      if (j.judge_model !== pairJudgments[0]?.judge_model) continue;
      const citA = j.citations?.[armA];
      const citB = j.citations?.[armB];
      if (citA) {
        goldCiteA.push(citA.gold?.length > 0 ? 1 : 0);
        wrongCiteA.push(citA.wrong?.length > 0 ? 1 : 0);
      }
      if (citB) {
        goldCiteB.push(citB.gold?.length > 0 ? 1 : 0);
        wrongCiteB.push(citB.wrong?.length > 0 ? 1 : 0);
      }
    }

    const goldRateA = goldCiteA.length > 0 ? goldCiteA.reduce((s, v) => s + v, 0) / goldCiteA.length * 100 : 0;
    const goldRateB = goldCiteB.length > 0 ? goldCiteB.reduce((s, v) => s + v, 0) / goldCiteB.length * 100 : 0;
    const wrongRateA = wrongCiteA.length > 0 ? wrongCiteA.reduce((s, v) => s + v, 0) / wrongCiteA.length * 100 : 0;
    const wrongRateB = wrongCiteB.length > 0 ? wrongCiteB.reduce((s, v) => s + v, 0) / wrongCiteB.length * 100 : 0;

    // Statistical tests
    const wilcoxonAdh = wilcoxonSignedRank(adherencePairs);
    const wilcoxonQual = wilcoxonSignedRank(qualityPairs);
    const mcNemarGold = mcNemar(goldCiteA.map((a, i) => [a === 1, (goldCiteB[i] || 0) === 1]));

    const cohensAdh = cohensD(
      adherencePairs.map(([a]) => a),
      adherencePairs.map(([, b]) => b)
    );
    const cohensQual = cohensD(
      qualityPairs.map(([a]) => a),
      qualityPairs.map(([, b]) => b)
    );

    // Fleiss' kappa (per metric)
    const adherenceRatings = [];
    const qualityRatings = [];
    const prefRatings = [];

    const byTaskRep = {};
    for (const j of pairJudgments) {
      const trKey = `${j.task_id}:${j.rep}`;
      if (!byTaskRep[trKey]) byTaskRep[trKey] = { adherence: [], quality: [], preference: [] };
      if (j.raw_scores?.adherence_a != null) {
        byTaskRep[trKey].adherence.push(j.coin_flip ? j.raw_scores.adherence_a : j.raw_scores.adherence_b);
      }
      if (j.raw_scores?.quality_a != null) {
        byTaskRep[trKey].quality.push(j.coin_flip ? j.raw_scores.quality_a : j.raw_scores.quality_b);
      }
      if (j.deblinded_preference) {
        byTaskRep[trKey].preference.push(j.deblinded_preference);
      }
    }

    for (const data of Object.values(byTaskRep)) {
      if (data.adherence.length === 3) adherenceRatings.push(data.adherence);
      if (data.quality.length === 3) qualityRatings.push(data.quality);
      if (data.preference.length === 3) prefRatings.push(data.preference);
    }

    const kappaAdh = fleissKappa(adherenceRatings, [1, 2, 3, 4, 5]);
    const kappaQual = fleissKappa(qualityRatings, [1, 2, 3, 4, 5]);
    const kappaPref = fleissKappa(prefRatings, ['A', 'B', 'tie']);

    // Build per-stratum preference rates dictionary keyed by stratum name.
    const byStratum = {};
    for (const stratum of STRATA) {
      const vals = prefByStratum[stratum];
      byStratum[stratum] = vals.length > 0
        ? (vals.reduce((s, v) => s + v, 0) / vals.length * 100)
        : null;
    }
    // For backward-compat with v1 summary.json shape: emit by_difficulty
    // when STRATIFICATION_FIELD === 'difficulty'. Otherwise emit by_stratum.
    const stratumKey = STRATIFICATION_FIELD === 'difficulty' ? 'by_difficulty' : 'by_stratum';

    results[pairKey] = {
      pair: pairKey,
      is_primary: pairKey === PRIMARY_PAIR,
      n_judgments: pairJudgments.length,
      preference: {
        rate_pct: prefRate,
        ci_lower: prefCI.lower * 100,
        ci_upper: prefCI.upper * 100,
        n: prefValues.length,
        [stratumKey]: byStratum,
      },
      citation: {
        gold_rate_a_pct: goldRateA,
        gold_rate_b_pct: goldRateB,
        gold_advantage_pp: goldRateA - goldRateB,
        wrong_rate_a_pct: wrongRateA,
        wrong_rate_b_pct: wrongRateB,
        mcnemar: mcNemarGold,
      },
      adherence: {
        wilcoxon: wilcoxonAdh,
        cohens_d: cohensAdh,
        kappa: kappaAdh,
      },
      quality: {
        wilcoxon: wilcoxonQual,
        cohens_d: cohensQual,
        kappa: kappaQual,
      },
      preference_kappa: kappaPref,
    };
  }

  // ---------------------------------------------------------------------------
  // Decision rules — anchored on the primary pair declared in eval-config.
  // Thresholds are parameterized from the pre-registration YAML; only the
  // pair identity is config-driven here.
  // ---------------------------------------------------------------------------
  const PRIMARY = results[PRIMARY_PAIR];
  const decisions = {};

  if (PRIMARY) {
    // Resolve armA/armB from primary_pair. The v1 form is exactly two single
    // characters joined by '-' ('T-R'); Phase 1 form is hyphenated multi-char
    // ('T-typed-T-untyped'). Use the same prefix-split heuristic as the
    // judge's anchor resolution to handle both.
    const [armA, armB] = splitPair(PRIMARY_PAIR, Object.keys(EVAL_CONFIG.arms));

    // V1 fallback preserves the original v1 rule name suffix and field names
    // (observed_wrong_t / observed_wrong_r) so downstream tooling reading
    // existing summary.json keeps working without --eval-config.
    const isV1Fallback = !!EVAL_CONFIG._isFallback;
    const subtleSuffix = isV1Fallback ? ' (subtle)' : '';

    // Rules 1-3 are v1-specific (preference/citation thresholds with explicit
    // pass/fail). Phase 1+ pre-regs use Gate B / Gate C 4-outcome tables based
    // on Δ F1 by stratum, evaluated downstream (e.g. Phase 1e write-up). Skip
    // these rules when the v1 thresholds are absent so the dry-run / Phase 1+
    // output isn't polluted with `undefined%` FAIL noise.
    if (T.primary_preference_pct !== undefined) {
      decisions.rule_1 = {
        name: `Primary preference ${armA}>${armB} >= ${T.primary_preference_pct}%`,
        threshold: T.primary_preference_pct,
        observed: PRIMARY.preference.rate_pct,
        ci_lower: PRIMARY.preference.ci_lower,
        ci_floor_threshold: T.primary_preference_ci_floor,
        pass: PRIMARY.preference.rate_pct >= T.primary_preference_pct &&
              PRIMARY.preference.ci_lower > T.primary_preference_ci_floor,
      };
    }

    if (T.citation_advantage_pp !== undefined) {
      decisions.rule_2 = {
        name: `Citation advantage ${armA}>=${armB}+${T.citation_advantage_pp}pp${subtleSuffix}`,
        threshold_pp: T.citation_advantage_pp,
        observed_advantage_pp: PRIMARY.citation.gold_advantage_pp,
        pass: PRIMARY.citation.gold_advantage_pp >= T.citation_advantage_pp,
      };
    }

    if (T.hallucination_tolerance_pp !== undefined) {
      decisions.rule_3 = {
        name: `Non-inferiority on hallucination ${armA}<=${armB}+${T.hallucination_tolerance_pp}pp`,
        threshold_pp: T.hallucination_tolerance_pp,
        ...(isV1Fallback
          ? {
              observed_wrong_t: PRIMARY.citation.wrong_rate_a_pct,
              observed_wrong_r: PRIMARY.citation.wrong_rate_b_pct,
            }
          : {
              observed_wrong_a: PRIMARY.citation.wrong_rate_a_pct,
              observed_wrong_b: PRIMARY.citation.wrong_rate_b_pct,
            }),
        difference: PRIMARY.citation.wrong_rate_a_pct - PRIMARY.citation.wrong_rate_b_pct,
        pass: (PRIMARY.citation.wrong_rate_a_pct - PRIMARY.citation.wrong_rate_b_pct) <= T.hallucination_tolerance_pp,
      };
    }

    decisions.rule_5_adherence = {
      name: `Inter-judge agreement (adherence) kappa >= ${T.judge_kappa_floor}`,
      threshold: T.judge_kappa_floor,
      observed: PRIMARY.adherence.kappa,
      pass: PRIMARY.adherence.kappa >= T.judge_kappa_floor,
    };

    decisions.rule_5_quality = {
      name: `Inter-judge agreement (quality) kappa >= ${T.judge_kappa_floor}`,
      threshold: T.judge_kappa_floor,
      observed: PRIMARY.quality.kappa,
      pass: PRIMARY.quality.kappa >= T.judge_kappa_floor,
    };
  }

  // Secondary comparisons with Holm correction
  const secondaryPValues = [];
  const secondaryKeys = [];
  for (const [key, r] of Object.entries(results)) {
    if (key !== PRIMARY_PAIR) {
      secondaryPValues.push(r.adherence.wilcoxon.p);
      secondaryKeys.push(key);
    }
  }
  const holmCorrected = holmCorrect(secondaryPValues);
  for (let i = 0; i < secondaryKeys.length; i++) {
    results[secondaryKeys[i]].holm_corrected_p = holmCorrected[i];
  }

  // ---------------------------------------------------------------------------
  // Output
  // ---------------------------------------------------------------------------
  const summary = {
    run_id: RUN_ID,
    aggregated_at: new Date().toISOString(),
    thresholds: T,
    total_judgments: judgments.length,
    eval_config: {
      phase: EVAL_CONFIG.phase || 'v1',
      stratification_field: STRATIFICATION_FIELD,
      strata: STRATA,
      primary_pair: PRIMARY_PAIR,
      arms: Object.keys(EVAL_CONFIG.arms),
      _is_fallback: !!EVAL_CONFIG._isFallback,
    },
    decisions,
    convergence_by_arm: convergenceByArm,
    results,
  };

  const summaryJsonPath = resolve(RESULTS_DIR, 'summary.json');
  writeFileSync(summaryJsonPath, JSON.stringify(summary, null, 2));
  console.log(`\nSummary JSON: ${summaryJsonPath}`);

  // Markdown summary
  const md = generateMarkdown(summary, decisions, results);
  const summaryMdPath = resolve(RESULTS_DIR, 'summary.md');
  writeFileSync(summaryMdPath, md);
  console.log(`Summary MD: ${summaryMdPath}`);

  // Print decision rules
  console.log('\n=== Decision Rules ===');
  for (const [key, rule] of Object.entries(decisions)) {
    const status = rule.pass ? 'PASS' : 'FAIL';
    console.log(`  ${key}: ${status} - ${rule.name} (observed: ${JSON.stringify(rule.observed ?? rule.observed_advantage_pp ?? rule.difference)})`);
  }

  // The "TREATMENT WINS / NO EFFECT" verdict only makes sense when the v1
  // pass/fail rules (rule_1..rule_3) are present. Phase 1+ pre-regs use Gate
  // B / Gate C 4-outcome tables evaluated downstream from the per-stratum
  // metrics, so we suppress the verdict here to avoid implying a binary
  // outcome that doesn't apply.
  const hasV1Rules = !!(decisions.rule_1 && decisions.rule_2 && decisions.rule_3);
  if (hasV1Rules) {
    const allPass = Object.values(decisions).every(r => r.pass);
    console.log(`\nOverall: ${allPass ? 'TREATMENT WINS' : 'NO EFFECT / INCONCLUSIVE'}`);
  } else {
    console.log('\nOverall: see per-stratum metrics in summary.json — Gate B/C verdict assigned downstream.');
  }
}

function generateMarkdown(summary, decisions, results) {
  const lines = [
    `# Eval Results: ${summary.run_id}`,
    '',
    `> Aggregated: ${summary.aggregated_at}`,
    `> Total judgments: ${summary.total_judgments}`,
    '',
    '## Decision Rules',
    '',
    '| Rule | Threshold | Observed | Result |',
    '|------|-----------|----------|--------|',
  ];

  for (const [key, rule] of Object.entries(decisions)) {
    const val = rule.observed ?? rule.observed_advantage_pp ?? rule.difference;
    const formatted = typeof val === 'number' ? val.toFixed(2) : String(val);
    lines.push(`| ${rule.name} | ${JSON.stringify(rule.threshold ?? rule.threshold_pp)} | ${formatted} | ${rule.pass ? 'PASS' : 'FAIL'} |`);
  }

  // Convergence-rate-by-arm. Phase 1+ explicitly cares about whether typed-vs-
  // untyped affects the agent's ability to converge within its step budget; a
  // skipped pair (one side is null response) would otherwise vanish in the
  // judge-aggregated view.
  if (summary.convergence_by_arm && Object.keys(summary.convergence_by_arm).length > 0) {
    lines.push('', '## Convergence by arm', '');
    lines.push('| Arm | Converged / total | Convergence rate | Empty responses | Runaway flagged |');
    lines.push('|-----|-------------------|------------------|-----------------|-----------------|');
    for (const [arm, c] of Object.entries(summary.convergence_by_arm)) {
      const conv = c.total_runs - c.empty_response;
      const rate = c.convergence_rate_pct != null ? `${c.convergence_rate_pct.toFixed(1)}%` : 'n/a';
      lines.push(`| ${arm} | ${conv}/${c.total_runs} | ${rate} | ${c.empty_response} | ${c.runaway} |`);
    }
  }

  lines.push('', '## Comparison Results', '');

  for (const [key, r] of Object.entries(results)) {
    const label = r.is_primary ? 'PRIMARY' : 'SECONDARY (exploratory, Holm-corrected)';
    lines.push(`### ${key} [${label}]`, '');
    lines.push(`- **Preference rate:** ${r.preference.rate_pct.toFixed(1)}% [${r.preference.ci_lower.toFixed(1)}%, ${r.preference.ci_upper.toFixed(1)}%]`);
    lines.push(`- **Gold cite rate:** ${r.citation.gold_rate_a_pct.toFixed(1)}% vs ${r.citation.gold_rate_b_pct.toFixed(1)}% (advantage: ${r.citation.gold_advantage_pp.toFixed(1)}pp)`);
    lines.push(`- **Wrong cite rate:** ${r.citation.wrong_rate_a_pct.toFixed(1)}% vs ${r.citation.wrong_rate_b_pct.toFixed(1)}%`);
    lines.push(`- **Adherence Cohen's d:** ${r.adherence.cohens_d.d.toFixed(3)} [${r.adherence.cohens_d.lower.toFixed(3)}, ${r.adherence.cohens_d.upper.toFixed(3)}]`);
    lines.push(`- **Quality Cohen's d:** ${r.quality.cohens_d.d.toFixed(3)} [${r.quality.cohens_d.lower.toFixed(3)}, ${r.quality.cohens_d.upper.toFixed(3)}]`);
    lines.push(`- **Fleiss' kappa:** adherence=${r.adherence.kappa.toFixed(3)}, quality=${r.quality.kappa.toFixed(3)}, preference=${r.preference_kappa.toFixed(3)}`);

    // Render strata: works for either v1's by_difficulty or v2's by_stratum.
    const strataDict = r.preference.by_difficulty || r.preference.by_stratum || {};
    const strataEntries = Object.entries(strataDict).filter(([, v]) => v != null);
    if (strataEntries.length > 0) {
      const label = r.preference.by_difficulty ? 'difficulty' : 'stratum';
      lines.push(
        `- **Preference by ${label}:** ` +
          strataEntries.map(([k, v]) => `${k}=${v.toFixed(1)}%`).join(', '),
      );
    }

    if (r.holm_corrected_p != null) {
      lines.push(`- **Holm-corrected p:** ${r.holm_corrected_p.toFixed(4)}`);
    }

    lines.push('');
  }

  const allPass = Object.values(decisions).every(r => r.pass);
  lines.push(`## Overall Verdict`, '', allPass ? '**Treatment wins.** All primary decision rules passed.' : '**No effect detected / Inconclusive.** One or more primary rules failed.');

  return lines.join('\n');
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
