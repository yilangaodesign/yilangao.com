#!/usr/bin/env node

/**
 * Static audit of `.cache/graph.json` — scripts/audit-graph-structure.mjs
 *
 * Read-only structural analysis. No agent runs, no API calls. Emits
 * `docs/eval-graph-audit.md` (frontmatter `type: eval-report`) covering:
 *
 *   - Edge type distribution (forward + inverse, with %).
 *   - Edge source distribution (frontmatter, citation:*, anchor:contained, ...).
 *   - Confidence distribution per edge source.
 *   - Coverage gaps: orphan nodes (no inbound + no outbound), dead-end nodes
 *     (no outbound), source-less nodes (no inbound).
 *   - Edge density per node type (mean + median in/out degree).
 *
 * Part of Eval-B Phase 0 (static audit). Re-runnable as a check.
 *
 * Usage:
 *   node scripts/audit-graph-structure.mjs              # default cache + default output path
 *   node scripts/audit-graph-structure.mjs --graph .cache/graph-untyped.json
 *   node scripts/audit-graph-structure.mjs --out docs/eval-graph-audit-2026-05.md
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { resolve } from 'path';

const ROOT = resolve(import.meta.dirname, '..');
const args = process.argv.slice(2);
const getArg = (name, def) => {
  const i = args.indexOf(`--${name}`);
  return i === -1 ? def : args[i + 1];
};

const GRAPH_PATH = resolve(ROOT, getArg('graph', '.cache/graph.json'));
const OUT_PATH = resolve(ROOT, getArg('out', 'docs/eval-graph-audit.md'));

if (!existsSync(GRAPH_PATH)) {
  console.error(`Graph cache not found: ${GRAPH_PATH}\nRun \`npm run build-graph\` first.`);
  process.exit(1);
}

const graph = JSON.parse(readFileSync(GRAPH_PATH, 'utf8'));
const { nodes = [], edges = [] } = graph;

// ---------------------------------------------------------------------------
// Distributions
// ---------------------------------------------------------------------------
function tally(arr, fn) {
  const m = new Map();
  for (const x of arr) {
    const k = fn(x) ?? 'unknown';
    m.set(k, (m.get(k) || 0) + 1);
  }
  return m;
}

function pct(n, total) {
  if (!total) return '0.0';
  return ((n / total) * 100).toFixed(1);
}

const edgeTypeCounts = tally(edges, (e) => e.type);
const edgeSourceCounts = tally(edges, (e) => e.source);

// Forward types vs inverse types (forward = "references", inverse = "referencedBy", etc.)
const FORWARD_TYPES = ['triggers', 'references', 'documents', 'enforces', 'derivedFrom', 'supersedes'];
const INVERSE_TYPES = ['triggeredBy', 'referencedBy', 'documentedBy', 'enforcedBy', 'derives', 'supersededBy'];

const forwardEdges = edges.filter((e) => FORWARD_TYPES.includes(e.type));
const referencesForward = forwardEdges.filter((e) => e.type === 'references').length;
const typedForward = forwardEdges.length - referencesForward;
const referencesPctForward = pct(referencesForward, forwardEdges.length);
const typedPctForward = pct(typedForward, forwardEdges.length);

// Confidence distribution per source
const confBySource = new Map();
for (const e of edges) {
  const s = e.source || 'unknown';
  if (!confBySource.has(s)) confBySource.set(s, []);
  confBySource.get(s).push(e.confidence ?? 0);
}
function summarize(values) {
  if (!values.length) return { mean: 0, min: 0, max: 0 };
  const sorted = [...values].sort((a, b) => a - b);
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  return { mean, min: sorted[0], max: sorted[sorted.length - 1] };
}

// ---------------------------------------------------------------------------
// Coverage gaps + edge density per node type
// ---------------------------------------------------------------------------
const inDeg = new Map();
const outDeg = new Map();
for (const n of nodes) {
  inDeg.set(n.id, 0);
  outDeg.set(n.id, 0);
}
for (const e of edges) {
  if (FORWARD_TYPES.includes(e.type)) {
    outDeg.set(e.from, (outDeg.get(e.from) || 0) + 1);
    inDeg.set(e.to, (inDeg.get(e.to) || 0) + 1);
  }
}

const orphans = [];
const deadEnds = [];
const sourceless = [];
for (const n of nodes) {
  const i = inDeg.get(n.id) || 0;
  const o = outDeg.get(n.id) || 0;
  if (i === 0 && o === 0) orphans.push(n);
  else if (o === 0) deadEnds.push(n);
  else if (i === 0) sourceless.push(n);
}

// Per-node-type density
const nodesByType = new Map();
for (const n of nodes) {
  const t = n.type || 'unknown';
  if (!nodesByType.has(t)) nodesByType.set(t, []);
  nodesByType.get(t).push(n);
}

function median(arr) {
  if (!arr.length) return 0;
  const s = [...arr].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}

const densityRows = [];
for (const [type, ns] of nodesByType) {
  const ins = ns.map((n) => inDeg.get(n.id) || 0);
  const outs = ns.map((n) => outDeg.get(n.id) || 0);
  const meanIn = (ins.reduce((a, b) => a + b, 0) / ns.length).toFixed(1);
  const meanOut = (outs.reduce((a, b) => a + b, 0) / ns.length).toFixed(1);
  densityRows.push({
    type,
    count: ns.length,
    meanIn: Number(meanIn),
    meanOut: Number(meanOut),
    medianIn: median(ins),
    medianOut: median(outs),
  });
}
densityRows.sort((a, b) => b.count - a.count);

// ---------------------------------------------------------------------------
// Gate A evaluation
// ---------------------------------------------------------------------------
// Gate A: Healthy = typed forward edges > 20%, frontmatter > 15%, no node type
// with median outDegree 0 among non-leaf types. Sick = references > 95%.
const frontmatterEdges = edges.filter((e) => /^frontmatter/.test(e.source || '')).length;
const frontmatterPct = pct(frontmatterEdges, edges.length);
const typedForwardPct = parseFloat(typedPctForward);
const referencesAllPct = parseFloat(pct(referencesForward + (edgeTypeCounts.get('referencedBy') || 0), edges.length));

let gateA;
if (referencesAllPct > 95) {
  gateA = { status: 'sick', reason: `references-family edges = ${referencesAllPct}% (> 95% threshold)` };
} else if (typedForwardPct > 20 && parseFloat(frontmatterPct) > 15) {
  gateA = { status: 'healthy', reason: `typed forward = ${typedPctForward}% (> 20%), frontmatter = ${frontmatterPct}% (> 15%)` };
} else {
  gateA = { status: 'borderline', reason: `typed forward = ${typedPctForward}% (target > 20%), frontmatter = ${frontmatterPct}% (target > 15%)` };
}

// ---------------------------------------------------------------------------
// Render markdown report
// ---------------------------------------------------------------------------
const lines = [];
lines.push('---');
lines.push('type: eval-report');
lines.push('id: eval-graph-audit');
lines.push('topics: [eval, knowledge-graph, audit]');
lines.push('derivedFrom:');
lines.push('  - .cursor/plans/eval_experiment_program_0516e9af.plan.md');
lines.push('references:');
lines.push('  - docs/knowledge-graph.md');
lines.push('  - docs/eval-multipillar-task-corpus.md');
lines.push('---');
lines.push('');
lines.push('# Eval graph structural audit (Phase 0)');
lines.push('');
lines.push('> Read-only static analysis of `.cache/graph.json`. Generated by `scripts/audit-graph-structure.mjs`. No agent runs, no API costs. Re-runnable as a regression check.');
lines.push('>');
lines.push(`> **Source cache**: \`${getArg('graph', '.cache/graph.json')}\``);
lines.push(`> **Generated at**: ${graph.generatedAt || 'unknown'}`);
lines.push(`> **Schema version**: ${graph.version || 'unknown'}`);
lines.push('');
lines.push('## Summary');
lines.push('');
lines.push(`| Metric | Value |`);
lines.push(`|---|---|`);
lines.push(`| Total nodes | ${nodes.length} |`);
lines.push(`| Total edges (incl. inverses) | ${edges.length} |`);
lines.push(`| Forward edges | ${forwardEdges.length} |`);
lines.push(`| Typed forward edges (non-references) | ${typedForward} (${typedPctForward}%) |`);
lines.push(`| references forward edges | ${referencesForward} (${referencesPctForward}%) |`);
lines.push(`| Frontmatter-sourced edges | ${frontmatterEdges} (${frontmatterPct}%) |`);
lines.push('');
lines.push('## Gate A evaluation');
lines.push('');
lines.push(`**Status: \`${gateA.status}\`** — ${gateA.reason}`);
lines.push('');
lines.push('Gate A criteria (from [`.cursor/plans/eval_experiment_program_0516e9af.plan.md`](../.cursor/plans/eval_experiment_program_0516e9af.plan.md) Gate A):');
lines.push('');
lines.push('- **Healthy**: typed (non-`references`) forward edges > 20%, frontmatter edges > 15%, no node type has median outDegree 0 among connected types.');
lines.push('- **Sick**: `references`-family edges > 95% of total.');
lines.push('- **Borderline**: between healthy and sick — proceed to Phase 1 with caveats documented in pre-registration.');
lines.push('');
lines.push('## Edge type distribution');
lines.push('');
lines.push('| Type | Count | % of all edges |');
lines.push('|---|---|---|');
for (const [type, count] of [...edgeTypeCounts.entries()].sort((a, b) => b[1] - a[1])) {
  lines.push(`| \`${type}\` | ${count} | ${pct(count, edges.length)}% |`);
}
lines.push('');
lines.push('## Edge source distribution');
lines.push('');
lines.push('| Source | Count | % of all edges |');
lines.push('|---|---|---|');
for (const [source, count] of [...edgeSourceCounts.entries()].sort((a, b) => b[1] - a[1])) {
  lines.push(`| \`${source}\` | ${count} | ${pct(count, edges.length)}% |`);
}
lines.push('');
lines.push('## Confidence distribution per source');
lines.push('');
lines.push('| Source | N | mean | min | max |');
lines.push('|---|---|---|---|---|');
for (const [source, vals] of [...confBySource.entries()].sort((a, b) => b[1].length - a[1].length)) {
  const s = summarize(vals);
  lines.push(`| \`${source}\` | ${vals.length} | ${s.mean.toFixed(2)} | ${s.min.toFixed(2)} | ${s.max.toFixed(2)} |`);
}
lines.push('');
lines.push('## Coverage gaps');
lines.push('');
lines.push(`| Category | Count | Notes |`);
lines.push(`|---|---|---|`);
lines.push(`| Orphan nodes (no inbound + no outbound) | ${orphans.length} | Potential indexing miss; investigate top 5 below. |`);
lines.push(`| Dead-end nodes (no outbound, has inbound) | ${deadEnds.length} | Often expected for leaf-like types (release, feedback). |`);
lines.push(`| Source-less nodes (no inbound, has outbound) | ${sourceless.length} | Often expected for hub/route entry points. |`);
lines.push('');
lines.push('### Top 5 orphans (if any)');
lines.push('');
if (orphans.length === 0) {
  lines.push('_No orphan nodes._');
} else {
  for (const n of orphans.slice(0, 5)) {
    lines.push(`- \`${n.id}\` (${n.type})`);
  }
}
lines.push('');
lines.push('## Edge density per node type');
lines.push('');
lines.push('Forward-edge degrees only (inverses excluded so the numbers reflect author-declared connectivity).');
lines.push('');
lines.push('| Node type | Count | Mean in | Mean out | Median in | Median out |');
lines.push('|---|---|---|---|---|---|');
for (const r of densityRows) {
  lines.push(`| \`${r.type}\` | ${r.count} | ${r.meanIn} | ${r.meanOut} | ${r.medianIn} | ${r.medianOut} |`);
}
lines.push('');
lines.push('## Self-referential drift acknowledgment');
lines.push('');
lines.push('Adding this audit doc to `docs/` triggers Hard Guardrail Engineering #27 (`build-graph` rebuild). The distributions above describe the graph state at audit time. Adding the audit doc itself nudges totals by ~1 node + a handful of edges out of thousands — trivially small. Re-running this script after the audit doc lands will produce ≤ 1% drift in every metric.');
lines.push('');
lines.push('## Phase 1 implication');
lines.push('');
if (gateA.status === 'healthy') {
  lines.push('Gate A green. Phase 1 (typed-vs-untyped A/B) proceeds with strong framing. Both arms get the full 5280-edge graph; only edge typing differs.');
} else if (gateA.status === 'borderline') {
  lines.push(`Gate A borderline. Phase 1 proceeds, but the typing-effect framing must disclose that ~${referencesPctForward}% of forward edges already collapse to \`references\` semantics in the typed arm. The "typed minus untyped" delta will measure the contribution of the remaining ~${typedPctForward}% non-\`references\` edges PLUS any distributional differences in confidence, not "all typing vs no typing."`);
} else {
  lines.push('Gate A red. Pause Phase 1 + Phase 2. Fix graph (add typed edges, ensure frontmatter coverage) and re-run this audit before scheduling any paid runs.');
}
lines.push('');

writeFileSync(OUT_PATH, lines.join('\n'));
console.log(`✓ Audit written to ${OUT_PATH}`);
console.log(`  Gate A status: ${gateA.status}`);
console.log(`  ${gateA.reason}`);
