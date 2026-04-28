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

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { resolve } from 'path';

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

if (!RUN_ID) {
  console.error('Usage: --run-id <id> required');
  process.exit(1);
}

// ---------------------------------------------------------------------------
// Paths
// ---------------------------------------------------------------------------
const RESULTS_DIR = resolve(ROOT, 'eval-results', RUN_ID);
const JUDGMENTS_FILE = resolve(RESULTS_DIR, 'judgments.jsonl');
const PRE_REG_FILE = resolve(ROOT, 'docs/eval-pre-registration.md');
const CORPUS_FILE = resolve(ROOT, 'docs/eval-task-corpus.md');

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
// Parse task metadata from corpus (for difficulty stratification)
// ---------------------------------------------------------------------------
function parseTaskMeta() {
  const content = readFileSync(CORPUS_FILE, 'utf8');
  const yamlBlock = content.match(/```yaml\n([\s\S]*?)```/);
  if (!yamlBlock) return {};
  const meta = {};
  const entries = yamlBlock[1].split(/^- id:\s+/m).filter(Boolean);
  for (const entry of entries) {
    const id = entry.match(/^(\S+)/)?.[1];
    const diff = entry.match(/difficulty:\s*(\S+)/)?.[1];
    if (id) meta[`eval-${id}`.replace('eval-eval-', 'eval-')] = {
      difficulty: diff || 'unknown',
      id: id.startsWith('eval-') ? id : `eval-${id}`,
    };
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

  const taskMeta = parseTaskMeta();

  // Group judgments by comparison pair
  const byPair = {};
  for (const j of judgments) {
    const pairKey = `${j.arm_a}-${j.arm_b}`;
    if (!byPair[pairKey]) byPair[pairKey] = [];
    byPair[pairKey].push(j);
  }

  console.log('Pairs:', Object.keys(byPair).map(k => `${k}: ${byPair[k].length}`).join(', '));

  // Stratify tasks
  const obviousTasks = new Set();
  const subtleTasks = new Set();
  for (const [id, meta] of Object.entries(taskMeta)) {
    if (meta.difficulty === 'obvious') obviousTasks.add(meta.id);
    else if (meta.difficulty === 'subtle') subtleTasks.add(meta.id);
  }

  // ---------------------------------------------------------------------------
  // Compute metrics for each comparison pair
  // ---------------------------------------------------------------------------
  const results = {};

  for (const [pairKey, pairJudgments] of Object.entries(byPair)) {
    const [armA, armB] = pairKey.split('-');

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
    const prefByDifficulty = { obvious: [], subtle: [] };

    for (const [, data] of Object.entries(taskRepPrefs)) {
      const aWins = data.votes.filter(v => v === 'A').length;
      const bWins = data.votes.filter(v => v === 'B').length;
      const majority = aWins > bWins ? 1 : bWins > aWins ? 0 : 0.5;
      prefValues.push(majority);

      if (obviousTasks.has(data.taskId)) prefByDifficulty.obvious.push(majority);
      else if (subtleTasks.has(data.taskId)) prefByDifficulty.subtle.push(majority);
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

    results[pairKey] = {
      pair: pairKey,
      is_primary: pairKey === 'T-R',
      n_judgments: pairJudgments.length,
      preference: {
        rate_pct: prefRate,
        ci_lower: prefCI.lower * 100,
        ci_upper: prefCI.upper * 100,
        n: prefValues.length,
        by_difficulty: {
          obvious: prefByDifficulty.obvious.length > 0
            ? (prefByDifficulty.obvious.reduce((s, v) => s + v, 0) / prefByDifficulty.obvious.length * 100)
            : null,
          subtle: prefByDifficulty.subtle.length > 0
            ? (prefByDifficulty.subtle.reduce((s, v) => s + v, 0) / prefByDifficulty.subtle.length * 100)
            : null,
        },
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
  // Decision rules
  // ---------------------------------------------------------------------------
  const TR = results['T-R'];
  const decisions = {};

  if (TR) {
    decisions.rule_1 = {
      name: 'Primary preference T>R >= 60%',
      threshold: T.primary_preference_pct,
      observed: TR.preference.rate_pct,
      ci_lower: TR.preference.ci_lower,
      ci_floor_threshold: T.primary_preference_ci_floor,
      pass: TR.preference.rate_pct >= T.primary_preference_pct &&
            TR.preference.ci_lower > T.primary_preference_ci_floor,
    };

    decisions.rule_2 = {
      name: 'Citation advantage T>=R+10pp (subtle)',
      threshold_pp: T.citation_advantage_pp,
      observed_advantage_pp: TR.citation.gold_advantage_pp,
      pass: TR.citation.gold_advantage_pp >= T.citation_advantage_pp,
    };

    decisions.rule_3 = {
      name: 'Non-inferiority on hallucination T<=R+5pp',
      threshold_pp: T.hallucination_tolerance_pp,
      observed_wrong_t: TR.citation.wrong_rate_a_pct,
      observed_wrong_r: TR.citation.wrong_rate_b_pct,
      difference: TR.citation.wrong_rate_a_pct - TR.citation.wrong_rate_b_pct,
      pass: (TR.citation.wrong_rate_a_pct - TR.citation.wrong_rate_b_pct) <= T.hallucination_tolerance_pp,
    };

    decisions.rule_5_adherence = {
      name: 'Inter-judge agreement (adherence) kappa >= 0.4',
      threshold: T.judge_kappa_floor,
      observed: TR.adherence.kappa,
      pass: TR.adherence.kappa >= T.judge_kappa_floor,
    };

    decisions.rule_5_quality = {
      name: 'Inter-judge agreement (quality) kappa >= 0.4',
      threshold: T.judge_kappa_floor,
      observed: TR.quality.kappa,
      pass: TR.quality.kappa >= T.judge_kappa_floor,
    };
  }

  // Secondary comparisons with Holm correction
  const secondaryPValues = [];
  const secondaryKeys = [];
  for (const [key, r] of Object.entries(results)) {
    if (key !== 'T-R') {
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
    decisions,
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

  const allPass = Object.values(decisions).every(r => r.pass);
  console.log(`\nOverall: ${allPass ? 'TREATMENT WINS' : 'NO EFFECT / INCONCLUSIVE'}`);
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

    if (r.preference.by_difficulty.obvious != null) {
      lines.push(`- **Preference by difficulty:** obvious=${r.preference.by_difficulty.obvious.toFixed(1)}%, subtle=${r.preference.by_difficulty.subtle?.toFixed(1) || 'N/A'}%`);
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
