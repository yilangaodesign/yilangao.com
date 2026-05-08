#!/usr/bin/env node

/**
 * Gate I2 unit test: dual-emit untyped graph parity.
 *
 * Builds the typed and untyped graph caches via build-graph.mjs (or reads
 * existing caches if recent), then asserts:
 *   1. Identical edge counts.
 *   2. Identical (from, to) pair multisets (order does not matter, but
 *      duplicates must match).
 *   3. Untyped variant has type='references' and confidence=1.0 on EVERY edge.
 *   4. Untyped sources are wrapped as untyped:collapsed:<orig>.
 *   5. Node arrays are deeply identical.
 *
 * Run: node scripts/tests/test-untyped-graph.mjs
 */

import { readFileSync, existsSync, statSync } from 'fs';
import { resolve } from 'path';
import { execSync } from 'child_process';

const ROOT = resolve(import.meta.dirname, '..', '..');
const TYPED = resolve(ROOT, '.cache/graph.json');
const UNTYPED = resolve(ROOT, '.cache/graph-untyped.json');

let failed = 0;
function assert(cond, msg) {
  if (!cond) {
    console.error(`  FAIL: ${msg}`);
    failed++;
  } else {
    console.log(`  PASS: ${msg}`);
  }
}

function buildIfStale() {
  const need = !existsSync(TYPED) || !existsSync(UNTYPED);
  if (need) {
    console.log('Building graphs...');
    execSync('node scripts/build-graph.mjs', { cwd: ROOT, stdio: 'inherit' });
    return;
  }
  // Rebuild if untyped is older than typed (build-graph dual-emits in one pass).
  if (statSync(UNTYPED).mtimeMs < statSync(TYPED).mtimeMs) {
    console.log('Untyped older than typed — rebuilding...');
    execSync('node scripts/build-graph.mjs', { cwd: ROOT, stdio: 'inherit' });
  }
}

function pairKey(e) {
  return `${e.from}\t${e.to}`;
}

function sortedPairKeys(edges) {
  return edges.map(pairKey).sort();
}

function main() {
  buildIfStale();
  const typed = JSON.parse(readFileSync(TYPED, 'utf8'));
  const untyped = JSON.parse(readFileSync(UNTYPED, 'utf8'));

  console.log(`\nTyped:   ${typed.edges.length} edges, ${typed.nodes.length} nodes`);
  console.log(`Untyped: ${untyped.edges.length} edges, ${untyped.nodes.length} nodes\n`);

  console.log('Edge count parity:');
  assert(
    typed.edges.length === untyped.edges.length,
    `edge counts match (${typed.edges.length} === ${untyped.edges.length})`,
  );

  console.log('\nNode parity:');
  assert(
    JSON.stringify(typed.nodes) === JSON.stringify(untyped.nodes),
    'node arrays are deeply equal',
  );

  console.log('\n(from, to) pair multiset parity:');
  const tKeys = sortedPairKeys(typed.edges);
  const uKeys = sortedPairKeys(untyped.edges);
  let mismatchIdx = -1;
  for (let i = 0; i < tKeys.length; i++) {
    if (tKeys[i] !== uKeys[i]) {
      mismatchIdx = i;
      break;
    }
  }
  assert(
    mismatchIdx === -1,
    mismatchIdx === -1
      ? 'all (from, to) pairs match position-for-position when sorted'
      : `first mismatch at index ${mismatchIdx}: typed='${tKeys[mismatchIdx]}' untyped='${uKeys[mismatchIdx]}'`,
  );

  console.log('\nUntyped uniformity:');
  const badType = untyped.edges.find((e) => e.type !== 'references');
  assert(!badType, `every untyped edge has type='references'${badType ? ` (offender: ${JSON.stringify(badType)})` : ''}`);
  const badConf = untyped.edges.find((e) => e.confidence !== 1.0);
  assert(!badConf, `every untyped edge has confidence=1.0${badConf ? ` (offender: ${JSON.stringify(badConf)})` : ''}`);
  const badSource = untyped.edges.find((e) => typeof e.source !== 'string' || !e.source.startsWith('untyped:collapsed:'));
  assert(!badSource, `every untyped source starts with 'untyped:collapsed:'${badSource ? ` (offender: ${JSON.stringify(badSource)})` : ''}`);

  console.log('\nProvenance preservation:');
  const sample = typed.edges.slice(0, Math.min(20, typed.edges.length));
  const untypedByPair = new Map();
  for (const e of untyped.edges) {
    const key = pairKey(e);
    if (!untypedByPair.has(key)) untypedByPair.set(key, []);
    untypedByPair.get(key).push(e);
  }
  let provFail = 0;
  for (const t of sample) {
    const us = untypedByPair.get(pairKey(t)) || [];
    const expected = `untyped:collapsed:${t.source ?? 'unknown'}`;
    if (!us.some((u) => u.source === expected)) provFail++;
  }
  assert(provFail === 0, `original sources preserved in untyped:collapsed:<source> form (${sample.length - provFail}/${sample.length} sampled)`);

  console.log(`\n${failed === 0 ? 'ALL TESTS PASSED' : `${failed} TEST(S) FAILED`}`);
  process.exit(failed === 0 ? 0 : 1);
}

main();
