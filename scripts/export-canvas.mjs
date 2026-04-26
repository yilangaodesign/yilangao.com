#!/usr/bin/env node
// scripts/export-canvas.mjs
//
// Generates Obsidian Canvas (.canvas) files from .cache/graph.json so the
// typed knowledge graph (994 nodes, 4888 edges, with edge types and
// confidence scores) can be reviewed in Obsidian's built-in Canvas viewer.
//
// Output (under docs/canvas/):
//   - overview.canvas        — top-level navigator (hubs, AP catalogs, route table, skills, rules, spec, release log)
//   - anti-patterns.canvas   — all AP/EAP/CAP nodes grouped by catalog band, with cross-references
//   - recent-feedback.canvas — last 30 entries per active feedback log + their cited APs
//
// Each `file` node deep-links to the underlying doc anchor, so clicking a
// node in Obsidian opens the source file at the right heading.
//
// Conventions:
//   - Forward edges only (skip auto-derived inverses to halve visual noise)
//   - Color by node type / edge type
//   - Edge labels include the type (and confidence on the per-feedback canvas)
//
// Why three canvases instead of one giant force-directed graph: a 994-node
// canvas is unreadable. Each canvas answers a distinct question:
//   - overview     → "what is this knowledge base made of?"
//   - anti-patterns → "what failure modes are catalogued, and how do they relate?"
//   - recent-feedback → "what is actively recurring vs novel, and against which APs?"

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const CACHE_PATH = resolve(ROOT, '.cache/graph.json');
const OUT_DIR = resolve(ROOT, 'docs/canvas');

// --- spec helpers ----------------------------------------------------------

// Forward edge types only — inverses (referencedBy, etc.) are auto-derived
// and would double every visible line in the canvas.
const FORWARD_EDGE_TYPES = new Set([
  'triggers',
  'references',
  'documents',
  'enforces',
  'derivedFrom',
  'supersedes',
]);

// Obsidian canvas node colors: 1=red 2=orange 3=yellow 4=green 5=cyan 6=purple
const NODE_COLOR = {
  'route-table': '6',
  guardrail: '1',
  route: '6',
  hub: '3',
  spoke: '4',
  'anti-pattern': '1',
  feedback: '5',
  rule: '2',
  skill: '6',
  'release-log': '2',
  release: '2',
  spec: '4',
  'cross-cutting': '4',
  alias: '4',
  section: '4',
  'untagged-pattern-list': '1',
  'cluster-report': '4',
  unknown: '4',
};

const EDGE_COLOR = {
  triggers: '6',
  references: '4',
  documents: '3',
  enforces: '1',
  derivedFrom: '5',
  supersedes: '6',
};

const NODE_W = 220;
const NODE_H = 60;

// --- helpers ---------------------------------------------------------------

function loadGraph() {
  return JSON.parse(readFileSync(CACHE_PATH, 'utf8'));
}

// Obsidian's `subpath` field resolves against markdown headings, not HTML
// `<a id="X">` anchors. Our docs use HTML anchors above headings:
//
//   <a id="eap-120"></a>
//   ## EAP-120: Client analytics `init` only in a parent ...
//
// To make `subpath` resolve correctly, we map each anchor ID to the next
// heading text (within ~5 lines) and use that as the subpath.
function buildAnchorToHeadingMap(graph) {
  const map = new Map();
  const filesNeeded = new Set();
  for (const n of graph.nodes) {
    if (n.path && n.path.endsWith('.md')) filesNeeded.add(n.path);
  }

  for (const path of filesNeeded) {
    const fullPath = resolve(ROOT, path);
    if (!existsSync(fullPath)) continue;
    const content = readFileSync(fullPath, 'utf8');
    const lines = content.split('\n');
    for (let i = 0; i < lines.length; i++) {
      const m = lines[i].match(/<a\s+id="([^"]+)"\s*>\s*<\/a>/);
      if (!m) continue;
      const anchor = m[1];
      // Look ahead up to 5 lines for the next markdown heading.
      for (let j = i + 1; j < Math.min(i + 6, lines.length); j++) {
        const headingMatch = lines[j].match(/^#{1,6}\s+(.+?)\s*$/);
        if (headingMatch) {
          // Strip inline markdown (backticks, links) for cleaner subpath
          // matching — Obsidian compares stripped heading text.
          const heading = headingMatch[1]
            .replace(/`/g, '')
            .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
          map.set(`${path}#${anchor}`, heading);
          break;
        }
      }
    }
  }
  return map;
}

// Count incoming feedback→AP citations per AP node so the AP landscape
// canvas can show "this AP is heavily cited" via a node-side badge,
// compensating for the sparseness of peer AP↔AP cross-references in
// the docs (the typed graph captures 174 AP→AP edges but 172 are
// catalog-index links; only 2 are peer cross-references).
function buildAPCitationCounts(graph) {
  const apIds = new Set(
    graph.nodes.filter((n) => n.type === 'anti-pattern').map((n) => n.id)
  );
  const counts = new Map();
  for (const e of graph.edges) {
    if (e.type !== 'references') continue;
    if (!apIds.has(e.to)) continue;
    if (apIds.has(e.from)) continue; // skip catalog-level navigation
    counts.set(e.to, (counts.get(e.to) || 0) + 1);
  }
  return counts;
}

function isHiddenFolderPath(p) {
  if (!p) return false;
  return p.split('/').some((seg) => seg.startsWith('.') && seg !== '.');
}

function makeNode({
  id,
  x,
  y,
  node,
  anchorMap,
  w = NODE_W,
  h = NODE_H,
}) {
  // Hidden-folder paths (e.g. `.cursor/skills/<name>/SKILL.md`) aren't
  // indexed by Obsidian by default — file-node links to them render as
  // "Create new note" prompts. Fall back to text nodes for those.
  const hiddenPath = isHiddenFolderPath(node.path);

  if (node.path && node.path.endsWith('.md') && !hiddenPath) {
    const headingText = anchorMap?.get(`${node.path}#${node.anchor}`);
    const subpath = headingText ? '#' + headingText : null;

    return {
      id,
      type: 'file',
      file: node.path,
      ...(subpath ? { subpath } : {}),
      x,
      y,
      width: w,
      height: h,
      color: NODE_COLOR[node.type] || '4',
    };
  }

  // Text-node fallback: hidden-folder paths or anchorless files.
  const subtitle = node.path
    ? `_${node.type}_  ·  \`${node.path}\``
    : `_${node.type}_`;
  return {
    id,
    type: 'text',
    text: `**${node.title || node.id}**\n${subtitle}`,
    x,
    y,
    width: w,
    height: h,
    color: NODE_COLOR[node.type] || '4',
  };
}

function makeHeader({ id, x, y, text, color, w = 320, h = 60 }) {
  return {
    id,
    type: 'text',
    text,
    x,
    y,
    width: w,
    height: h,
    ...(color ? { color } : {}),
  };
}

function makeEdge({ id, from, to, label, color }) {
  return {
    id,
    fromNode: from,
    toNode: to,
    ...(label ? { label } : {}),
    ...(color ? { color } : {}),
  };
}

// --- canvas builders -------------------------------------------------------

function buildOverviewCanvas(graph, anchorMap, apCitations) {
  // Top-level navigator: catalogs and entry points only — no per-entry detail.
  const ANTI_PATTERN_CATALOGS = new Set([
    'engineering-anti-patterns',
    'design-anti-patterns',
    'content-anti-patterns',
  ]);
  const TYPES_INCLUDED = new Set([
    'route-table',
    'hub',
    'spec',
    'release-log',
    'rule',
    'cross-cutting',
    'skill',
  ]);

  const includedNodes = graph.nodes.filter(
    (n) =>
      TYPES_INCLUDED.has(n.type) ||
      (n.type === 'anti-pattern' && ANTI_PATTERN_CATALOGS.has(n.id))
  );

  // Columnar layout — one column per node type, vertically stacked.
  const columnOrder = [
    'route-table',
    'hub',
    'spec',
    'anti-pattern',
    'cross-cutting',
    'rule',
    'skill',
    'release-log',
  ];
  const COL_GAP = 380;
  const ROW_GAP = 90;
  const columns = {};
  columnOrder.forEach((t, i) => {
    columns[t] = { x: i * COL_GAP, count: 0 };
  });

  const idMap = new Map();
  const nodes = [];
  const headers = [];

  // Sort each type's nodes deterministically so the layout is stable.
  const sortedNodes = [...includedNodes].sort((a, b) => {
    const ai = columnOrder.indexOf(a.type);
    const bi = columnOrder.indexOf(b.type);
    if (ai !== bi) return ai - bi;
    return a.id.localeCompare(b.id);
  });

  for (const node of sortedNodes) {
    const col = columns[node.type];
    if (!col) continue;
    const x = col.x;
    const y = col.count * ROW_GAP;
    col.count += 1;

    const cid = `n-${nodes.length}`;
    idMap.set(node.id, cid);
    nodes.push(makeNode({ id: cid, x, y, node, anchorMap, apCitations }));
  }

  // Column headers above each populated column.
  for (const [type, col] of Object.entries(columns)) {
    if (col.count === 0) continue;
    headers.push(
      makeHeader({
        id: `h-${type}`,
        x: col.x,
        y: -120,
        text: `### ${type}`,
        w: NODE_W,
      })
    );
  }

  // Edges: forward edges between included nodes only.
  const includedIds = new Set(idMap.keys());
  const edges = [];
  for (const e of graph.edges) {
    if (!FORWARD_EDGE_TYPES.has(e.type)) continue;
    if (!includedIds.has(e.from) || !includedIds.has(e.to)) continue;
    const conf = e.confidence != null ? ` (${Number(e.confidence).toFixed(1)})` : '';
    edges.push(
      makeEdge({
        id: `e-${edges.length}`,
        from: idMap.get(e.from),
        to: idMap.get(e.to),
        label: `${e.type}${conf}`,
        color: EDGE_COLOR[e.type] || '4',
      })
    );
  }

  return { nodes: [...headers, ...nodes], edges };
}

function buildAntiPatternsCanvas(graph, anchorMap, apCitations) {
  // Per-entry AP nodes (skip the three catalog-level files themselves).
  const CATALOG_IDS = new Set([
    'engineering-anti-patterns',
    'design-anti-patterns',
    'content-anti-patterns',
  ]);
  const apNodes = graph.nodes.filter(
    (n) => n.type === 'anti-pattern' && !CATALOG_IDS.has(n.id)
  );

  const bandSpec = {
    'docs/engineering-anti-patterns.md': { yOrigin: 0, label: 'Engineering APs (EAP)', color: '1' },
    'docs/design-anti-patterns.md': { yOrigin: 0, label: 'Design APs (AP)', color: '2' },
    'docs/content-anti-patterns.md': { yOrigin: 0, label: 'Content APs (CAP)', color: '5' },
  };

  // Group nodes by source path; sort each group by ID (eap-001, eap-002, ...)
  const byPath = {};
  for (const node of apNodes) {
    if (!byPath[node.path]) byPath[node.path] = [];
    byPath[node.path].push(node);
  }
  for (const path of Object.keys(byPath)) {
    byPath[path].sort((a, b) =>
      a.id.localeCompare(b.id, undefined, { numeric: true })
    );
  }

  // Layout: each band is a horizontal grid of `COLS` columns.
  // Bands are stacked vertically with a fixed gap between them.
  const COLS = 10;
  const COL_W = NODE_W + 30;
  const ROW_H = NODE_H + 20;
  const BAND_GAP = 100;

  const idMap = new Map();
  const nodes = [];
  const headers = [];

  let cursorY = 0;
  const orderedPaths = Object.keys(bandSpec).filter((p) => byPath[p]);
  for (const path of orderedPaths) {
    const items = byPath[path];
    const band = bandSpec[path];
    band.yOrigin = cursorY;
    const rows = Math.ceil(items.length / COLS);

    headers.push(
      makeHeader({
        id: `h-${path.replace(/[^a-z0-9]+/gi, '-')}`,
        x: -360,
        y: band.yOrigin,
        text: `## ${band.label}\n${items.length} entries`,
        color: band.color,
        w: 320,
        h: 80,
      })
    );

    items.forEach((node, i) => {
      const col = i % COLS;
      const row = Math.floor(i / COLS);
      const x = col * COL_W;
      const y = band.yOrigin + row * ROW_H;
      const cid = `n-${nodes.length}`;
      idMap.set(node.id, cid);
      nodes.push(makeNode({ id: cid, x, y, node, anchorMap, apCitations }));
    });

    cursorY += rows * ROW_H + BAND_GAP;
  }

  // Add a per-pillar legend showing top-cited APs in this band so authors
  // can scan citation density at a glance without clicking through.
  const TOP_K = 5;
  for (const [path, band] of Object.entries(bandSpec)) {
    if (!byPath[path]) continue;
    const ranked = byPath[path]
      .map((n) => ({ id: n.id, count: apCitations.get(n.id) || 0 }))
      .filter((r) => r.count > 0)
      .sort((a, b) => b.count - a.count)
      .slice(0, TOP_K);
    if (ranked.length === 0) continue;
    const lines = ranked
      .map((r) => `- **${r.id.toUpperCase()}** — ${r.count} feedback citation${r.count === 1 ? '' : 's'}`)
      .join('\n');
    headers.push(
      makeHeader({
        id: `legend-${path.replace(/[^a-z0-9]+/gi, '-')}`,
        x: -360,
        y: band.yOrigin + 100,
        text: `### Top-cited\n${lines}`,
        w: 320,
        h: 180,
      })
    );
  }

  const includedIds = new Set(idMap.keys());
  const edges = [];
  for (const e of graph.edges) {
    if (!FORWARD_EDGE_TYPES.has(e.type)) continue;
    if (!includedIds.has(e.from) || !includedIds.has(e.to)) continue;
    edges.push(
      makeEdge({
        id: `e-${edges.length}`,
        from: idMap.get(e.from),
        to: idMap.get(e.to),
        label: e.type,
        color: EDGE_COLOR[e.type] || '4',
      })
    );
  }

  return { nodes: [...headers, ...nodes], edges };
}

function buildRecentFeedbackCanvas(graph, anchorMap, apCitations) {
  // Last 30 feedback entries per active log + the APs they cite.
  // Mirrors the MaturityTimeline "By recurrence" classification visually:
  //   - feedback with strong-confidence references → recurrent
  //   - feedback with only loose references         → approximate
  //   - feedback with no AP references             → novel (visible by absence)
  const ACTIVE_LOGS = [
    { path: 'docs/engineering-feedback-log.md', label: 'Engineering — last 30', color: '1' },
    { path: 'docs/design-feedback-log.md', label: 'Design — last 30', color: '2' },
    { path: 'docs/content-feedback-log.md', label: 'Content — last 30', color: '5' },
  ];

  // Build forward 'references' adjacency from feedback → anti-pattern.
  const fbToAps = new Map();
  const apsCited = new Set();
  for (const e of graph.edges) {
    if (e.type !== 'references') continue;
    const target = graph.nodes.find((n) => n.id === e.to);
    if (!target || target.type !== 'anti-pattern') continue;
    if (!fbToAps.has(e.from)) fbToAps.set(e.from, []);
    fbToAps.get(e.from).push({ apId: e.to, conf: Number(e.confidence) || 0 });
  }

  const PILLAR_GAP = 1100;
  const FB_X = 0;
  const AP_X = 700;
  const FB_SPACING = 80;
  const AP_SPACING = 80;

  const idMap = new Map();
  const nodes = [];
  const headers = [];

  ACTIVE_LOGS.forEach((pillar, pillarIdx) => {
    const pillarY = pillarIdx * PILLAR_GAP;

    const fbInPillar = graph.nodes
      .filter((n) => n.type === 'feedback' && n.path === pillar.path)
      .sort((a, b) =>
        b.id.localeCompare(a.id, undefined, { numeric: true })
      )
      .slice(0, 30);

    headers.push(
      makeHeader({
        id: `h-pillar-${pillarIdx}`,
        x: FB_X - 400,
        y: pillarY,
        text: `## ${pillar.label}\n${fbInPillar.length} feedback entries`,
        color: pillar.color,
        w: 360,
        h: 80,
      })
    );

    // Place feedback nodes in a vertical column.
    fbInPillar.forEach((node, i) => {
      const cid = `n-${nodes.length}`;
      idMap.set(node.id, cid);
      nodes.push(
        makeNode({
          id: cid,
          x: FB_X,
          y: pillarY + i * FB_SPACING,
          node,
          anchorMap,
          apCitations,
        })
      );
      (fbToAps.get(node.id) || []).forEach((c) => apsCited.add(c.apId));
    });

    // Per-pillar APs: APs cited by THIS pillar's recent entries.
    const pillarRecentIds = new Set(fbInPillar.map((n) => n.id));
    const pillarApIds = new Set();
    for (const fbId of pillarRecentIds) {
      for (const c of fbToAps.get(fbId) || []) pillarApIds.add(c.apId);
    }
    const pillarAps = [...pillarApIds]
      .map((id) => graph.nodes.find((n) => n.id === id))
      .filter(Boolean)
      .sort((a, b) => a.id.localeCompare(b.id, undefined, { numeric: true }));

    pillarAps.forEach((apNode, i) => {
      const cid = `n-${nodes.length}`;
      idMap.set(apNode.id, cid);
      nodes.push(
        makeNode({
          id: cid,
          x: AP_X,
          y: pillarY + i * AP_SPACING,
          node: apNode,
          anchorMap,
          apCitations,
        })
      );
    });
  });

  const includedIds = new Set(idMap.keys());
  const edges = [];
  for (const e of graph.edges) {
    if (e.type !== 'references') continue;
    if (!includedIds.has(e.from) || !includedIds.has(e.to)) continue;
    const target = graph.nodes.find((n) => n.id === e.to);
    if (!target || target.type !== 'anti-pattern') continue;
    const strong = Number(e.confidence) >= 1;
    edges.push(
      makeEdge({
        id: `e-${edges.length}`,
        from: idMap.get(e.from),
        to: idMap.get(e.to),
        label: strong ? 'strong (1.0)' : `loose (${Number(e.confidence).toFixed(1)})`,
        color: strong ? '4' : '5',
      })
    );
  }

  return { nodes: [...headers, ...nodes], edges };
}

// --- main ------------------------------------------------------------------

function writeCanvas(filename, canvas) {
  if (!existsSync(OUT_DIR)) mkdirSync(OUT_DIR, { recursive: true });
  const path = resolve(OUT_DIR, filename);
  writeFileSync(path, JSON.stringify(canvas, null, 2));
  console.log(
    `[export-canvas] ${filename}: ${canvas.nodes.length} nodes, ${canvas.edges.length} edges`
  );
}

function main() {
  if (!existsSync(CACHE_PATH)) {
    console.error(
      `[export-canvas] missing ${CACHE_PATH}. Run \`npm run build-graph\` first.`
    );
    process.exit(1);
  }

  const graph = loadGraph();
  const anchorMap = buildAnchorToHeadingMap(graph);
  const apCitations = buildAPCitationCounts(graph);
  console.log(
    `[export-canvas] resolved ${anchorMap.size} anchor→heading mappings; ${apCitations.size} APs with feedback citations`
  );

  writeCanvas(
    'overview.canvas',
    buildOverviewCanvas(graph, anchorMap, apCitations)
  );
  writeCanvas(
    'anti-patterns.canvas',
    buildAntiPatternsCanvas(graph, anchorMap, apCitations)
  );
  writeCanvas(
    'recent-feedback.canvas',
    buildRecentFeedbackCanvas(graph, anchorMap, apCitations)
  );

  console.log('[export-canvas] done — open docs/canvas/*.canvas in Obsidian');
}

main();
