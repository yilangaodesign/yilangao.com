#!/usr/bin/env node

/**
 * Build untyped graph cache — scripts/build-untyped-graph.mjs
 *
 * Thin wrapper: read .cache/graph.json (the typed graph produced by
 * build-graph.mjs), collapse every edge to {type: 'references', confidence: 1.0}
 * via untypeGraph(), and write .cache/graph-untyped.json.
 *
 * Most invocations should rely on build-graph.mjs which already dual-emits
 * both variants in a single pass. Use this wrapper only when you need to
 * regenerate the untyped variant from an existing typed cache without
 * re-walking the docs tree (e.g. after a manual cache edit, or when
 * verifying that the dual-emit and the wrapper agree).
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { untypeGraph } from './build-graph.mjs';

const ROOT = resolve(import.meta.dirname, '..');
const GRAPH_PATH = resolve(ROOT, '.cache/graph.json');
const GRAPH_UNTYPED_PATH = resolve(ROOT, '.cache/graph-untyped.json');

if (!existsSync(GRAPH_PATH)) {
  console.error(`[build-untyped-graph] missing ${GRAPH_PATH}; run build-graph.mjs first`);
  process.exit(1);
}

const typed = JSON.parse(readFileSync(GRAPH_PATH, 'utf8'));
const untyped = untypeGraph(typed, typed.generatedAt);

mkdirSync(dirname(GRAPH_UNTYPED_PATH), { recursive: true });
writeFileSync(GRAPH_UNTYPED_PATH, JSON.stringify(untyped, null, 2));
console.log(
  `[build-untyped-graph] wrote ${GRAPH_UNTYPED_PATH} (${untyped.edges.length} edges, all references/conf 1.0)`,
);
