#!/usr/bin/env node

import { readFileSync, existsSync } from 'fs';
import { resolve, join } from 'path';
import { spawnSync } from 'child_process';
import lunr from 'lunr';

const ROOT = resolve(import.meta.dirname, '..');
const CACHE_DIR = resolve(ROOT, '.cache');
const GRAPH_PATH = join(CACHE_DIR, 'graph.json');
const SEARCH_PATH = join(CACHE_DIR, 'search-index.json');

function parseArgs(argv) {
  const args = { positional: [], search: null, confidenceMin: 0, depth: 1, limit: 10, json: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--search') {
      args.search = argv[++i];
    } else if (a.startsWith('--search=')) {
      args.search = a.slice('--search='.length);
    } else if (a === '--confidence-min') {
      args.confidenceMin = parseFloat(argv[++i]);
    } else if (a.startsWith('--confidence-min=')) {
      args.confidenceMin = parseFloat(a.slice('--confidence-min='.length));
    } else if (a === '--depth') {
      args.depth = parseInt(argv[++i], 10);
    } else if (a.startsWith('--depth=')) {
      args.depth = parseInt(a.slice('--depth='.length), 10);
    } else if (a === '--limit') {
      args.limit = parseInt(argv[++i], 10);
    } else if (a.startsWith('--limit=')) {
      args.limit = parseInt(a.slice('--limit='.length), 10);
    } else if (a === '--json') {
      args.json = true;
    } else if (a === '--help' || a === '-h') {
      args.help = true;
    } else {
      args.positional.push(a);
    }
  }
  return args;
}

function printHelp() {
  console.log(`Usage:
  node scripts/query-graph.mjs <node-id> [--depth N] [--confidence-min X] [--json]
  node scripts/query-graph.mjs --search "<text>" [--limit N] [--json]

Options:
  --depth N             Subgraph traversal depth (default: 1)
  --confidence-min X    Filter edges below confidence X (0..1, default: 0)
  --search "<text>"     BM25 search across nodes; returns ranked list
  --limit N             Max results for --search (default: 10)
  --json                Output JSON instead of markdown
  -h, --help            Show this help

Examples:
  node scripts/query-graph.mjs route-17
  node scripts/query-graph.mjs eap-120 --depth 2 --confidence-min 0.7
  node scripts/query-graph.mjs --search "analytics hydration"
`);
}

function refreshCache() {
  const buildScript = resolve(ROOT, 'scripts', 'build-graph.mjs');
  const result = spawnSync(process.execPath, [buildScript], { stdio: ['ignore', 'pipe', 'inherit'] });
  if (result.status !== 0) {
    console.error('[query-graph] build-graph failed; aborting.');
    process.exit(result.status || 1);
  }
}

function loadGraph() {
  if (!existsSync(GRAPH_PATH)) {
    console.error(`[query-graph] graph cache not found at ${GRAPH_PATH}`);
    process.exit(1);
  }
  return JSON.parse(readFileSync(GRAPH_PATH, 'utf8'));
}

function loadSearch() {
  if (!existsSync(SEARCH_PATH)) {
    console.error(`[query-graph] search index not found at ${SEARCH_PATH}`);
    process.exit(1);
  }
  return JSON.parse(readFileSync(SEARCH_PATH, 'utf8'));
}

function buildIndexes(graph) {
  const nodeById = new Map();
  for (const n of graph.nodes) nodeById.set(n.id, n);
  const outgoing = new Map();
  const incoming = new Map();
  for (const e of graph.edges) {
    if (!outgoing.has(e.from)) outgoing.set(e.from, []);
    outgoing.get(e.from).push(e);
    if (!incoming.has(e.to)) incoming.set(e.to, []);
    incoming.get(e.to).push(e);
  }
  return { nodeById, outgoing, incoming };
}

function gatherSubgraph(rootId, depth, confidenceMin, indexes) {
  const visited = new Set([rootId]);
  const collectedEdges = [];
  const frontier = [rootId];
  for (let d = 0; d < depth; d++) {
    const nextFrontier = [];
    for (const id of frontier) {
      const out = indexes.outgoing.get(id) || [];
      const inc = indexes.incoming.get(id) || [];
      for (const e of [...out, ...inc]) {
        if (e.confidence < confidenceMin) continue;
        collectedEdges.push(e);
        const other = e.from === id ? e.to : e.from;
        if (!visited.has(other)) {
          visited.add(other);
          nextFrontier.push(other);
        }
      }
    }
    if (nextFrontier.length === 0) break;
    frontier.length = 0;
    frontier.push(...nextFrontier);
  }
  return {
    nodeIds: [...visited],
    edges: dedupeEdgePairs(collectedEdges),
  };
}

function dedupeEdgePairs(edges) {
  const seen = new Set();
  const out = [];
  for (const e of edges) {
    const key = `${e.from}|${e.to}|${e.type}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(e);
  }
  return out;
}

function renderSubgraphMarkdown(rootId, sub, indexes) {
  const root = indexes.nodeById.get(rootId);
  const lines = [];
  if (!root) {
    lines.push(`# Node not found: \`${rootId}\``);
    lines.push('');
    lines.push('Try `--search` to find nodes by text.');
    return lines.join('\n');
  }
  lines.push(`# ${root.title || root.id}`);
  lines.push('');
  lines.push(`- **ID**: \`${root.id}\``);
  lines.push(`- **Type**: \`${root.type}\``);
  lines.push(`- **Path**: \`${root.path}\``);
  if (root.topics && root.topics.length) lines.push(`- **Topics**: ${root.topics.map((t) => `\`${t}\``).join(', ')}`);
  if (root.deprecated) lines.push(`- **Deprecated**: yes`);
  lines.push('');

  const grouped = groupByType(sub.edges);
  if (grouped.size === 0) {
    lines.push('_No edges within depth/confidence constraints._');
    return lines.join('\n');
  }
  lines.push(`## Connected nodes (depth ${sub.edges.length} edges, ${sub.nodeIds.length - 1} neighbors)`);
  lines.push('');
  for (const [type, group] of grouped) {
    lines.push(`### ${type} (${group.length})`);
    lines.push('');
    for (const e of group) {
      const otherId = e.from === rootId ? e.to : e.from;
      const otherNode = indexes.nodeById.get(otherId);
      const direction = e.from === rootId ? '->' : '<-';
      const title = otherNode ? otherNode.title : '(unknown)';
      const path = otherNode ? otherNode.path : '(no path)';
      lines.push(`- ${direction} \`${otherId}\` (conf: ${e.confidence.toFixed(2)}) - ${title} - \`${path}\``);
    }
    lines.push('');
  }
  return lines.join('\n');
}

function groupByType(edges) {
  const groups = new Map();
  for (const e of edges) {
    if (!groups.has(e.type)) groups.set(e.type, []);
    groups.get(e.type).push(e);
  }
  return groups;
}

function runSearch(query, limit, json) {
  const search = loadSearch();
  const idx = lunr.Index.load(search.index);
  const results = idx.search(query).slice(0, limit);
  const docsById = new Map((search.docs || []).map((d) => [d.id, d]));
  const enriched = results.map((r) => ({
    id: r.ref,
    score: r.score,
    title: docsById.get(r.ref)?.title || r.ref,
    type: docsById.get(r.ref)?.type || 'unknown',
    path: docsById.get(r.ref)?.path || '(unknown)',
  }));
  if (json) {
    console.log(JSON.stringify(enriched, null, 2));
    return;
  }
  if (enriched.length === 0) {
    console.log(`# Search: ${query}\n\n_No results._`);
    return;
  }
  const lines = [`# Search: ${query}`, '', `${enriched.length} result${enriched.length === 1 ? '' : 's'}:`, ''];
  for (const r of enriched) {
    lines.push(`- \`${r.id}\` (score: ${r.score.toFixed(3)}) [\`${r.type}\`] - ${r.title} - \`${r.path}\``);
  }
  console.log(lines.join('\n'));
}

function runSubgraph(nodeId, depth, confidenceMin, json) {
  const graph = loadGraph();
  const indexes = buildIndexes(graph);
  const sub = gatherSubgraph(nodeId, depth, confidenceMin, indexes);
  if (json) {
    const subNodes = sub.nodeIds.map((id) => indexes.nodeById.get(id) || { id, type: 'unknown', title: id });
    console.log(JSON.stringify({ root: nodeId, nodes: subNodes, edges: sub.edges }, null, 2));
    return;
  }
  console.log(renderSubgraphMarkdown(nodeId, sub, indexes));
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help || (!args.search && args.positional.length === 0)) {
    printHelp();
    process.exit(args.help ? 0 : 1);
  }
  refreshCache();

  if (args.search) {
    runSearch(args.search, args.limit, args.json);
    return;
  }

  const id = args.positional[0];
  runSubgraph(id, args.depth, args.confidenceMin, args.json);
}

main();
