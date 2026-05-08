#!/usr/bin/env node

/**
 * Gate I4 unit test: multi-citation F1 grading.
 *
 * Verifies classifyCitations() against:
 *   1. Perfect single match     → F1 = 1.0
 *   2. Perfect multi match      → F1 = 1.0
 *   3. Partial match (recall)   → F1 ≈ 2/3
 *   4. Partial match (precision)→ F1 ≈ 2/3
 *   5. No match                 → F1 = 0.0
 *
 * Edge cases (pre-registered, see eval-judge.mjs:classifyCitations doc):
 *   E1. extracted = []                  → F1 = 0
 *   E2. expected_citations = []         → recall = 1, precision = 0, F1 = 0
 *   E3. both empty                      → F1 = 1
 *
 * Plus regression tests for:
 *   - Singular fallback (v1 corpus where only expected_citation exists)
 *   - Adversarial sentinel (model "fell for" the fake AP)
 *   - Duplicate extracted IDs (set semantics)
 */

import { classifyCitations, extractCitations } from '../eval-judge.mjs';

let failed = 0;
function approx(a, b, eps = 1e-9) { return Math.abs(a - b) < eps; }

function check(label, got, want) {
  const ok = (typeof want === 'number')
    ? approx(got, want)
    : JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? 'PASS' : 'FAIL'}: ${label} (got=${JSON.stringify(got)}, want=${JSON.stringify(want)})`);
  if (!ok) failed++;
}

console.log('1. Perfect single match');
{
  const r = classifyCitations(['AP-066'], ['AP-066']);
  check('precision', r.precision, 1);
  check('recall', r.recall, 1);
  check('f1', r.f1, 1);
}

console.log('\n2. Perfect multi match');
{
  const r = classifyCitations(['AP-066', 'EAP-082'], ['AP-066', 'EAP-082']);
  check('precision', r.precision, 1);
  check('recall', r.recall, 1);
  check('f1', r.f1, 1);
}

console.log('\n3. Partial recall (extracted is subset of expected)');
{
  // expected: 2 gold, extracted: 1 of them. precision=1, recall=0.5, F1=2/3
  const r = classifyCitations(['AP-066'], ['AP-066', 'EAP-082']);
  check('precision', r.precision, 1);
  check('recall', r.recall, 0.5);
  check('f1', r.f1, 2 / 3);
}

console.log('\n4. Partial precision (extracted is superset of expected)');
{
  // expected: 1 gold, extracted: gold + 1 wrong. precision=0.5, recall=1, F1=2/3
  const r = classifyCitations(['AP-066', 'AP-999'], ['AP-066']);
  check('precision', r.precision, 0.5);
  check('recall', r.recall, 1);
  check('f1', r.f1, 2 / 3);
  check('wrong has AP-999', r.wrong.includes('AP-999'), true);
}

console.log('\n5. No overlap');
{
  const r = classifyCitations(['AP-001'], ['AP-066', 'EAP-082']);
  check('precision', r.precision, 0);
  check('recall', r.recall, 0);
  check('f1', r.f1, 0);
}

console.log('\nE1. extracted = [], expected non-empty');
{
  const r = classifyCitations([], ['AP-066']);
  check('precision', r.precision, 0);
  check('recall', r.recall, 0);
  check('f1', r.f1, 0);
  check('noCite flag', r.noCite, true);
}

console.log('\nE2. expected = [] (vacuous), extracted non-empty');
{
  const r = classifyCitations(['AP-001'], []);
  check('precision', r.precision, 0);
  check('recall', r.recall, 1);
  check('f1', r.f1, 0);
}

console.log('\nE3. both empty (model correctly cited nothing)');
{
  const r = classifyCitations([], []);
  check('precision', r.precision, 1);
  check('recall', r.recall, 1);
  check('f1', r.f1, 1);
  check('noCite flag', r.noCite, true);
}

console.log('\nR1. v1 backward-compat: singular fallback');
{
  // No expected_citations array (undefined), but expected_citation singular exists.
  const r = classifyCitations(['AP-066'], undefined, 'AP-066');
  check('precision', r.precision, 1);
  check('recall', r.recall, 1);
  check('f1', r.f1, 1);
  check('expected was wrapped', r.expected, ['AP-066']);
}

console.log('\nR2. v1 backward-compat: empty array, singular fallback');
{
  const r = classifyCitations(['EAP-099'], [], 'EAP-099');
  check('precision', r.precision, 1);
  check('recall', r.recall, 1);
  check('f1', r.f1, 1);
}

console.log('\nR3. Adversarial: model fell for fake AP (gold means hallucination here)');
{
  // Sentinel expected; model emits sentinel → registered as gold. Aggregator
  // is responsible for relabeling to "hallucination_count".
  const r = classifyCitations(['EAP-FAKE-001-EVAL-ONLY'], ['EAP-FAKE-001-EVAL-ONLY']);
  check('gold has sentinel', r.gold, ['EAP-FAKE-001-EVAL-ONLY']);
  check('f1', r.f1, 1);
}

console.log('\nR4. Duplicate extracted IDs collapse to set');
{
  const r = classifyCitations(['AP-066', 'AP-066', 'AP-066'], ['AP-066']);
  check('precision', r.precision, 1);
  check('recall', r.recall, 1);
  check('f1', r.f1, 1);
  check('n_extracted is set size', r.n_extracted, 1);
}

console.log('\nR5. extractCitations regex coverage');
{
  const ids = extractCitations('See AP-066 and CAP-016 plus EAP-127-WRONG-LABEL');
  check('found AP', ids.includes('AP-066'), true);
  check('found CAP', ids.includes('CAP-016'), true);
  check('found EAP-with-suffix', ids.includes('EAP-127-WRONG-LABEL'), true);
}

console.log(`\n${failed === 0 ? 'ALL TESTS PASSED' : `${failed} TEST(S) FAILED`}`);
process.exit(failed === 0 ? 0 : 1);
