#!/usr/bin/env node

// Louvain community detection over the docs knowledge graph.
// Emits an advisory report at docs/cluster-validation-report.md that compares
// the algorithm's discovered clusters against the three declared "pillars"
// (design, engineering, content). NOT a hard audit failure — pillar/cluster
// mismatch is informational and may surface intentional cross-pillar links.

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';
import Graph from 'graphology';
import louvain from 'graphology-communities-louvain';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const CACHE_PATH = resolve(ROOT, '.cache', 'graph.json');
const REPORT_PATH = resolve(ROOT, 'docs', 'cluster-validation-report.md');

function loadGraph() {
  if (!existsSync(CACHE_PATH)) {
    console.error(
      `[cluster-check] .cache/graph.json missing — run \`npm run build-graph\` first.`
    );
    process.exit(1);
  }
  return JSON.parse(readFileSync(CACHE_PATH, 'utf-8'));
}

function pillarOf(node) {
  // The three declared pillars + miscellaneous bins.
  const t = node.type;
  const id = node.id || '';
  const path = node.path || '';

  if (id === 'design' || path === 'docs/design.md') return 'design';
  if (id === 'engineering' || path === 'docs/engineering.md') return 'engineering';
  if (id === 'content' || path === 'docs/content.md') return 'content';

  if (path.startsWith('docs/design/') || id.startsWith('design-')) return 'design';
  if (path.startsWith('docs/engineering/') || id.startsWith('engineering-'))
    return 'engineering';
  if (path.startsWith('docs/content/') || id.startsWith('content-')) return 'content';

  // Anti-pattern files
  if (path === 'docs/design-anti-patterns.md') return 'design';
  if (path === 'docs/engineering-anti-patterns.md') return 'engineering';
  if (path === 'docs/content-anti-patterns.md') return 'content';
  if (id.startsWith('dap-')) return 'design';
  if (id.startsWith('eap-')) return 'engineering';
  if (id.startsWith('cap-')) return 'content';
  if (id.startsWith('ap-') && /design/.test(path)) return 'design';
  if (id.startsWith('ap-') && /engineering/.test(path)) return 'engineering';
  if (id.startsWith('ap-') && /content/.test(path)) return 'content';

  // Feedback logs
  if (/^docs\/design-feedback/.test(path)) return 'design';
  if (/^docs\/engineering-feedback/.test(path)) return 'engineering';
  if (/^docs\/content-feedback/.test(path)) return 'content';

  // Routing / cross-cutting / skills / rules / release log all live in 'meta'
  if (t === 'route-table' || t === 'alias') return 'meta';
  if (t === 'skill' || t === 'rule') return 'meta';
  if (t === 'release-log' || t === 'release') return 'meta';
  if (t === 'cross-cutting') return 'meta';
  if (t === 'spec') return 'meta';

  return 'other';
}

function buildGraphology(graphData) {
  const g = new Graph({ type: 'undirected', multi: false });
  for (const node of graphData.nodes) {
    if (!g.hasNode(node.id)) g.addNode(node.id, { pillar: pillarOf(node) });
  }
  for (const edge of graphData.edges) {
    if (!edge.from || !edge.to) continue;
    if (edge.from === edge.to) continue;
    if (!g.hasNode(edge.from) || !g.hasNode(edge.to)) continue;
    if (g.hasEdge(edge.from, edge.to)) {
      // Bump weight on duplicate edges (after dedupe one slot remains).
      const w = g.getEdgeAttribute(edge.from, edge.to, 'weight') || 1;
      g.setEdgeAttribute(edge.from, edge.to, 'weight', w + (edge.confidence || 1));
      continue;
    }
    g.addEdge(edge.from, edge.to, { weight: edge.confidence || 1 });
  }
  return g;
}

function summarizeClusters(g) {
  louvain.assign(g, { getEdgeWeight: 'weight' });
  const clusters = new Map();
  g.forEachNode((id, attrs) => {
    const c = attrs.community ?? attrs.communities ?? 0;
    if (!clusters.has(c)) clusters.set(c, { id: c, members: [], pillarCounts: {} });
    const entry = clusters.get(c);
    entry.members.push(id);
    const p = attrs.pillar || 'other';
    entry.pillarCounts[p] = (entry.pillarCounts[p] || 0) + 1;
  });
  return [...clusters.values()].sort((a, b) => b.members.length - a.members.length);
}

function dominantPillar(counts) {
  const entries = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  if (entries.length === 0) return ['none', 0];
  const total = entries.reduce((s, [, n]) => s + n, 0);
  const [name, count] = entries[0];
  const purity = total === 0 ? 0 : count / total;
  return [name, purity, total];
}

function buildReport(clusters, totalNodes) {
  const lines = [];
  const date = new Date().toISOString().split('T')[0];
  lines.push('---');
  lines.push('type: cluster-report');
  lines.push('id: cluster-validation-report');
  lines.push('topics: [knowledge-graph, audit]');
  lines.push('---');
  lines.push('');
  lines.push('# Cluster Validation Report');
  lines.push('');
  lines.push(
    `> **Advisory only.** Generated by \`scripts/cluster-check.mjs\` via the Louvain community-detection algorithm against \`.cache/graph.json\`. Cluster boundaries that do NOT align with the declared pillars (\`design\`, \`engineering\`, \`content\`) are *signals*, not failures — they may indicate cross-pillar concepts that genuinely span boundaries (e.g., the \`graph-query\` skill, hub <-> spoke shared topology).`
  );
  lines.push('');
  lines.push(`**Generated:** ${date}`);
  lines.push(`**Total nodes clustered:** ${totalNodes}`);
  lines.push(`**Cluster count:** ${clusters.length}`);
  lines.push('');
  lines.push('## Cluster Summary');
  lines.push('');
  lines.push('| # | Size | Dominant pillar | Purity | Pillar mix |');
  lines.push('|---|------|-----------------|--------|------------|');
  clusters.forEach((c, idx) => {
    const [pillar, purity] = dominantPillar(c.pillarCounts);
    const mix = Object.entries(c.pillarCounts)
      .sort((a, b) => b[1] - a[1])
      .map(([k, v]) => `${k}:${v}`)
      .join(', ');
    lines.push(
      `| ${idx + 1} | ${c.members.length} | ${pillar} | ${(purity * 100).toFixed(0)}% | ${mix} |`
    );
  });
  lines.push('');
  lines.push('## Per-Cluster Members');
  lines.push('');
  clusters.forEach((c, idx) => {
    const [pillar, purity] = dominantPillar(c.pillarCounts);
    lines.push(
      `### Cluster ${idx + 1} — ${pillar} (${(purity * 100).toFixed(0)}% pure, ${c.members.length} nodes)`
    );
    lines.push('');
    const sample = c.members.slice(0, 30);
    lines.push(sample.map((id) => `- \`${id}\``).join('\n'));
    if (c.members.length > sample.length) {
      lines.push('');
      lines.push(`_(+${c.members.length - sample.length} more)_`);
    }
    lines.push('');
  });
  lines.push('## Mixed Clusters (purity < 70%)');
  lines.push('');
  const mixed = clusters
    .map((c, idx) => ({ c, idx, p: dominantPillar(c.pillarCounts) }))
    .filter(({ p }) => p[1] < 0.7);
  if (mixed.length === 0) {
    lines.push('_None — all clusters are pillar-pure at >= 70%._');
  } else {
    mixed.forEach(({ c, idx, p }) => {
      lines.push(
        `- Cluster ${idx + 1}: ${(p[1] * 100).toFixed(0)}% ${p[0]}, mix = ${Object.entries(c.pillarCounts)
          .sort((a, b) => b[1] - a[1])
          .map(([k, v]) => `${k}:${v}`)
          .join(', ')}`
      );
    });
  }
  lines.push('');
  return lines.join('\n');
}

function main() {
  const data = loadGraph();
  const g = buildGraphology(data);
  if (g.order === 0) {
    console.error('[cluster-check] graph is empty');
    process.exit(1);
  }
  const clusters = summarizeClusters(g);
  const report = buildReport(clusters, g.order);
  if (!existsSync(dirname(REPORT_PATH))) mkdirSync(dirname(REPORT_PATH), { recursive: true });
  writeFileSync(REPORT_PATH, report);
  console.log(
    `[cluster-check] ${g.order} nodes -> ${clusters.length} clusters; report: ${REPORT_PATH.replace(ROOT + '/', '')}`
  );
}

main();
