#!/usr/bin/env node

/**
 * Validate eval task corpus — scripts/validate-corpus.mjs
 *
 * Quality gate for the locked Phase 2 corpus (docs/eval-multipillar-task-corpus.md).
 * Cheap insurance against malformed corpus causing silent failures during
 * Phase 1 / Phase 2 runs. Runs 5 checks:
 *
 *   (a) The YAML block parses without error.
 *   (b) Every non-adversarial task has a non-empty `expected_citations` array.
 *   (c) Every adversarial task has at least one `*-FAKE-*-EVAL-ONLY` sentinel
 *       in `expected_citations`.
 *   (d) Strata balance: exactly 4 tasks per stratum (D+E, D+E+C, D+C, E+C),
 *       4 single-pillar controls, 4 adversarial controls (one per stratum),
 *       3 calibration tasks. Total = 27.
 *   (e) No duplicate task IDs.
 *
 * Usage:
 *   node scripts/validate-corpus.mjs [path/to/corpus.md]
 *
 * Exit codes:
 *   0 — all checks pass
 *   1 — at least one check failed (errors printed to stderr)
 */

import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';
import yaml from 'js-yaml';

const ROOT = resolve(import.meta.dirname, '..');
const DEFAULT_PATH = resolve(ROOT, 'docs/eval-multipillar-task-corpus.md');
const corpusPath = process.argv[2]
  ? resolve(process.cwd(), process.argv[2])
  : DEFAULT_PATH;

if (!existsSync(corpusPath)) {
  console.error(`Corpus file not found: ${corpusPath}`);
  process.exit(1);
}

const errors = [];
const warnings = [];

const content = readFileSync(corpusPath, 'utf8');
const yamlBlocks = [...content.matchAll(/```yaml\n([\s\S]*?)```/g)];
if (yamlBlocks.length === 0) {
  errors.push('No fenced ```yaml``` block found in corpus file');
}

let tasks = [];
if (yamlBlocks.length > 0) {
  // Concatenate all yaml blocks (the corpus uses inline section comment dividers
  // inside one big block, but supporting multiple is harmless).
  const rawYaml = yamlBlocks.map((m) => m[1]).join('\n');
  try {
    const parsed = yaml.load(rawYaml);
    if (!Array.isArray(parsed)) {
      errors.push(`Top-level YAML must be a list of task objects (got: ${typeof parsed})`);
    } else {
      tasks = parsed;
    }
  } catch (e) {
    errors.push(`YAML parse error: ${e.message}`);
  }
}

const STRATA = ['D+E', 'D+E+C', 'D+C', 'E+C'];
const FAKE_SENTINEL_RE = /(AP|EAP|CAP)-FAKE-[A-Z]+-EVAL-ONLY/;

const ids = new Set();
const dupIds = new Set();
const byCombination = new Map();
const adversarialByStratum = new Map();
const calibrationByStratum = new Map();
let calibrationCount = 0;
let singlePillarCount = 0;

for (const t of tasks) {
  if (!t || typeof t !== 'object') {
    errors.push(`Task entry is not an object: ${JSON.stringify(t).slice(0, 80)}`);
    continue;
  }
  if (!t.id) {
    errors.push(`Task missing id: ${JSON.stringify(t).slice(0, 80)}`);
    continue;
  }
  if (ids.has(t.id)) {
    dupIds.add(t.id);
  }
  ids.add(t.id);

  const combo = t.combination || 'unknown';
  byCombination.set(combo, (byCombination.get(combo) || 0) + 1);

  const expected = Array.isArray(t.expected_citations) ? t.expected_citations : [];
  const isAdversarial = t.adversarial === true;
  const isCalibration = t.calibration === true;

  if (expected.length === 0) {
    errors.push(`Task ${t.id}: expected_citations is empty (must be a non-empty array)`);
  }

  if (isAdversarial) {
    const hasFakeSentinel = expected.some((c) => FAKE_SENTINEL_RE.test(String(c)));
    if (!hasFakeSentinel) {
      errors.push(
        `Task ${t.id}: adversarial=true but expected_citations has no *-FAKE-*-EVAL-ONLY sentinel (got: ${JSON.stringify(expected)})`,
      );
    }
    if (!STRATA.includes(combo)) {
      errors.push(`Task ${t.id}: adversarial task combination must be one of ${STRATA.join(', ')} (got: ${combo})`);
    } else {
      adversarialByStratum.set(combo, (adversarialByStratum.get(combo) || 0) + 1);
    }
  } else if (isCalibration) {
    calibrationCount++;
    if (STRATA.includes(combo)) {
      calibrationByStratum.set(combo, (calibrationByStratum.get(combo) || 0) + 1);
    }
  } else if (combo === 'single-pillar') {
    singlePillarCount++;
  } else if (STRATA.includes(combo)) {
    /* main-run multi-pillar */
  } else {
    errors.push(`Task ${t.id}: combination='${combo}' is not one of ${[...STRATA, 'single-pillar'].join(', ')} (and not adversarial/calibration)`);
  }
}

if (dupIds.size > 0) {
  errors.push(`Duplicate task IDs: ${[...dupIds].join(', ')}`);
}

// Main-run multi-pillar: exactly 4 per stratum (excluding adversarial AND
// calibration entries, which are held out from the main run).
for (const stratum of STRATA) {
  const total = byCombination.get(stratum) || 0;
  const adv = adversarialByStratum.get(stratum) || 0;
  const cal = calibrationByStratum.get(stratum) || 0;
  const mainRun = total - adv - cal;
  if (mainRun !== 4) {
    errors.push(`Stratum ${stratum}: expected 4 main-run multi-pillar tasks, got ${mainRun} (total ${total} including ${adv} adversarial, ${cal} calibration)`);
  }
  if (adv !== 1) {
    errors.push(`Stratum ${stratum}: expected exactly 1 adversarial task, got ${adv}`);
  }
}

if (singlePillarCount !== 4) {
  errors.push(`Expected 4 single-pillar control tasks, got ${singlePillarCount}`);
}
if (calibrationCount !== 3) {
  errors.push(`Expected 3 calibration tasks, got ${calibrationCount}`);
}

const expectedTotal = 4 * 4 + 4 + 4 + 3; // 16 multi + 4 single + 4 adv + 3 cal = 27
if (tasks.length !== expectedTotal) {
  warnings.push(`Total task count is ${tasks.length}, expected ${expectedTotal}`);
}

// Output -------------------------------------------------------------------
const counts = {
  total: tasks.length,
  byStratum: Object.fromEntries(byCombination),
  adversarial: tasks.filter((t) => t?.adversarial).length,
  calibration: tasks.filter((t) => t?.calibration).length,
};

if (errors.length === 0) {
  console.log(`✓ Corpus validation passed (${corpusPath})`);
  console.log(`  Total tasks:        ${counts.total}`);
  console.log(`  By stratum:         ${JSON.stringify(counts.byStratum)}`);
  console.log(`  Adversarial:        ${counts.adversarial}`);
  console.log(`  Calibration:        ${counts.calibration}`);
  if (warnings.length) {
    console.log(`  Warnings:`);
    for (const w of warnings) console.log(`    - ${w}`);
  }
  process.exit(0);
} else {
  console.error(`✗ Corpus validation failed: ${errors.length} error(s)`);
  for (const e of errors) console.error(`  - ${e}`);
  if (warnings.length) {
    console.error(`  Warnings:`);
    for (const w of warnings) console.error(`    - ${w}`);
  }
  console.error(`\nCounts (for diagnosis):`);
  console.error(`  ${JSON.stringify(counts, null, 2).split('\n').join('\n  ')}`);
  process.exit(1);
}
