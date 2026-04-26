#!/usr/bin/env node

import { spawnSync } from 'child_process';
import { resolve } from 'path';
import { z } from 'zod';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';

const ROOT = resolve(import.meta.dirname, '..');
const QUERY_SCRIPT = resolve(ROOT, 'scripts', 'query-graph.mjs');

function runQuery(args) {
  const result = spawnSync(process.execPath, [QUERY_SCRIPT, ...args], {
    cwd: ROOT,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  if (result.status !== 0) {
    const stderr = (result.stderr || '').trim();
    throw new Error(`query-graph exited ${result.status}: ${stderr || '(no stderr)'}`);
  }
  return result.stdout || '';
}

function tryParseJson(stdout) {
  try {
    return { json: JSON.parse(stdout), raw: stdout };
  } catch {
    return { json: null, raw: stdout };
  }
}

const server = new McpServer(
  {
    name: 'docs-knowledge-graph',
    version: '0.1.0',
  },
  {
    capabilities: { tools: {} },
    instructions:
      'Query the docs knowledge graph (typed nodes + edges over AGENTS.md, docs/**, .cursor/skills, .cursor/rules). ' +
      'Use `query-node` to look up a single node + 1-hop neighbors by ID, `subgraph` for N-hop neighborhoods, ' +
      'and `search` for BM25 keyword retrieval. See docs/knowledge-graph.md for the spec.',
  },
);

server.registerTool(
  'query-node',
  {
    title: 'Query Node',
    description:
      'Look up a node by ID and return the node + its 1-hop neighbors. ' +
      "IDs are lowercase kebab-case: anti-patterns ('eap-027'), routes ('route-9'), guardrails ('guardrail-engineering-21'), " +
      "skills ('skill-playground'), releases ('rel-024'), hubs/spokes ('engineering', 'design-color').",
    inputSchema: {
      id: z.string().describe('Node ID (lowercase kebab-case)'),
      confidenceMin: z
        .number()
        .min(0)
        .max(1)
        .optional()
        .describe('Filter edges below this confidence (0..1)'),
    },
  },
  async ({ id, confidenceMin }) => {
    const args = [id, '--depth', '1', '--json'];
    if (confidenceMin != null) args.push('--confidence-min', String(confidenceMin));
    try {
      const stdout = runQuery(args);
      const { json, raw } = tryParseJson(stdout);
      return {
        content: [{ type: 'text', text: json ? JSON.stringify(json, null, 2) : raw }],
        structuredContent: json ?? undefined,
      };
    } catch (err) {
      return {
        isError: true,
        content: [{ type: 'text', text: String(err?.message || err) }],
      };
    }
  },
);

server.registerTool(
  'subgraph',
  {
    title: 'Subgraph',
    description:
      'Return the N-hop neighborhood around a node. Use depth=1 by default; depth=2 only when fan-out is small. ' +
      'Higher depths grow exponentially.',
    inputSchema: {
      id: z.string().describe('Root node ID'),
      depth: z.number().int().min(0).max(3).default(1).describe('Hops out (default 1, max 3)'),
      confidenceMin: z
        .number()
        .min(0)
        .max(1)
        .optional()
        .describe('Filter edges below this confidence (0..1)'),
    },
  },
  async ({ id, depth, confidenceMin }) => {
    const args = [id, '--depth', String(depth ?? 1), '--json'];
    if (confidenceMin != null) args.push('--confidence-min', String(confidenceMin));
    try {
      const stdout = runQuery(args);
      const { json, raw } = tryParseJson(stdout);
      return {
        content: [{ type: 'text', text: json ? JSON.stringify(json, null, 2) : raw }],
        structuredContent: json ?? undefined,
      };
    } catch (err) {
      return {
        isError: true,
        content: [{ type: 'text', text: String(err?.message || err) }],
      };
    }
  },
);

server.registerTool(
  'search',
  {
    title: 'Search',
    description:
      'BM25 search across all graph nodes (titles, IDs, topics, frontmatter excerpts). ' +
      'Returns ranked node IDs with scores. Use to find the right node when you only have a keyword.',
    inputSchema: {
      query: z.string().min(1).describe('Search query (free text)'),
      limit: z.number().int().min(1).max(50).default(10).describe('Max results (default 10)'),
    },
  },
  async ({ query, limit }) => {
    const args = ['--search', query, '--limit', String(limit ?? 10), '--json'];
    try {
      const stdout = runQuery(args);
      const { json, raw } = tryParseJson(stdout);
      return {
        content: [{ type: 'text', text: json ? JSON.stringify(json, null, 2) : raw }],
        structuredContent: Array.isArray(json) ? { results: json } : undefined,
      };
    } catch (err) {
      return {
        isError: true,
        content: [{ type: 'text', text: String(err?.message || err) }],
      };
    }
  },
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  process.stderr.write('[mcp-graph-server] connected via stdio\n');
}

main().catch((err) => {
  console.error('[mcp-graph-server] fatal:', err);
  process.exit(1);
});
