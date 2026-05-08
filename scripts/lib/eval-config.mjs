/**
 * Shared eval-config loader for eval-runner.mjs, eval-judge.mjs, and
 * eval-aggregate.mjs. Schema documented in:
 *   - docs/eval-typing-eval-config.yaml      (Phase 1)
 *   - docs/eval-multipillar-eval-config.yaml (Phase 2)
 *
 * When --eval-config is omitted, scripts fall back to v1 hardcoded defaults
 * (T/R/P/B + v1 file paths) for backward-compat with full-001 reproducibility.
 */

import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';
import yaml from 'js-yaml';

const VALID_ROLES = new Set(['treatment', 'rag', 'pre_initiative', 'no_memory']);

/**
 * Synthetic v1 config so the rest of the runner can speak one schema.
 * Mirrors the hardcoded T/R/P/B behavior, the v1 file paths, and the
 * difficulty-axis stratification that `eval-aggregate.mjs` used in v1.
 */
export function v1FallbackConfig(root) {
  return {
    phase: 'v1',
    schema_version: 1,
    stratification_field: 'difficulty',
    strata: ['obvious', 'subtle'],
    files: {
      corpus: 'docs/eval-task-corpus.md',
      pre_registration: 'docs/eval-pre-registration.md',
      judge_rubric: 'docs/eval-judge-rubric.md',
      adversarial: 'docs/eval-adversarial-controls.md',
      calibration: 'docs/eval-calibration-prompts.md',
    },
    arms: {
      T: { arm_role: 'treatment', graph_cache: '.cache/graph.json' },
      R: { arm_role: 'rag' },
      P: { arm_role: 'pre_initiative' },
      B: { arm_role: 'no_memory' },
    },
    comparison_pairs: [['T', 'R'], ['T', 'P'], ['T', 'B']],
    primary_pair: 'T-R',
    _isFallback: true,
  };
}

export function loadEvalConfig(configPath, root) {
  if (!configPath) return v1FallbackConfig(root);

  const abs = resolve(root, configPath);
  if (!existsSync(abs)) {
    throw new Error(`eval-config not found: ${abs}`);
  }
  const raw = readFileSync(abs, 'utf8');
  const cfg = yaml.load(raw);
  return validateConfig(cfg, abs);
}

function validateConfig(cfg, sourcePath) {
  const errs = [];
  if (!cfg || typeof cfg !== 'object') errs.push('config root must be an object');
  if (!cfg.arms || typeof cfg.arms !== 'object' || !Object.keys(cfg.arms).length) {
    errs.push('config.arms must be a non-empty object');
  }
  if (!Array.isArray(cfg.comparison_pairs) || cfg.comparison_pairs.length === 0) {
    errs.push('config.comparison_pairs must be a non-empty array of [armA, armB] tuples');
  }
  if (!cfg.primary_pair || typeof cfg.primary_pair !== 'string') {
    errs.push('config.primary_pair must be a string of the form "armA-armB"');
  }
  if (!cfg.files || typeof cfg.files !== 'object') {
    errs.push('config.files must be an object');
  }
  if (!cfg.stratification_field || typeof cfg.stratification_field !== 'string') {
    errs.push('config.stratification_field must be a string (corpus YAML field name)');
  }
  if (!Array.isArray(cfg.strata) || cfg.strata.length === 0) {
    errs.push('config.strata must be a non-empty array of stratum names');
  }

  if (cfg && cfg.arms) {
    for (const [armId, armCfg] of Object.entries(cfg.arms)) {
      if (!armCfg || typeof armCfg !== 'object') {
        errs.push(`arm '${armId}' must be an object`);
        continue;
      }
      if (!VALID_ROLES.has(armCfg.arm_role)) {
        errs.push(
          `arm '${armId}'.arm_role must be one of: ${[...VALID_ROLES].join(', ')} (got: ${armCfg.arm_role})`,
        );
      }
      if (armCfg.arm_role === 'treatment' && !armCfg.graph_cache) {
        errs.push(`arm '${armId}'.graph_cache is required for arm_role='treatment'`);
      }
    }
  }

  if (cfg && Array.isArray(cfg.comparison_pairs)) {
    for (const [i, p] of cfg.comparison_pairs.entries()) {
      if (!Array.isArray(p) || p.length !== 2) {
        errs.push(`comparison_pairs[${i}] must be a [armA, armB] tuple`);
        continue;
      }
      const [a, b] = p;
      if (!cfg.arms?.[a]) errs.push(`comparison_pairs[${i}] references unknown arm '${a}'`);
      if (!cfg.arms?.[b]) errs.push(`comparison_pairs[${i}] references unknown arm '${b}'`);
    }
  }

  if (cfg && cfg.primary_pair && cfg.arms) {
    const found = (cfg.comparison_pairs || []).some(([a, b]) => `${a}-${b}` === cfg.primary_pair);
    if (!found) {
      errs.push(`primary_pair '${cfg.primary_pair}' must match one of comparison_pairs (in armA-armB form)`);
    }
  }

  if (errs.length) {
    throw new Error(`Invalid eval-config (${sourcePath}):\n  - ${errs.join('\n  - ')}`);
  }
  return cfg;
}

export function armRole(config, armId) {
  const arm = config.arms?.[armId];
  if (!arm) throw new Error(`Arm '${armId}' not declared in eval-config (known: ${Object.keys(config.arms || {}).join(', ')})`);
  return arm.arm_role;
}

export function armGraphCache(config, armId) {
  return config.arms?.[armId]?.graph_cache || null;
}
