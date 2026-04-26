import { NextResponse } from 'next/server';
import { readFileSync } from 'fs';
import { join } from 'path';

export type KnowledgeGraphNode = {
  id: string;
  label: string;
  group: string;
  val: number;
};

export type KnowledgeGraphLink = {
  source: string;
  target: string;
  edgeType: string;
  confidence: number;
  bidirectional: boolean;
};

export type KnowledgeGraphData = {
  nodes: KnowledgeGraphNode[];
  links: KnowledgeGraphLink[];
};

type RawNode = {
  id: string;
  type: string;
  title: string;
  path: string;
  anchor: string;
  topics: string[];
  deprecated: boolean;
};

type RawEdge = {
  from: string;
  to: string;
  type: string;
  confidence: number;
  source: string;
};

type RawGraph = {
  version: number;
  nodes: RawNode[];
  edges: RawEdge[];
};

function readGraph(): RawGraph | null {
  try {
    const raw = readFileSync(join(process.cwd(), '.cache/graph.json'), 'utf-8');
    return JSON.parse(raw) as RawGraph;
  } catch {
    return null;
  }
}

export async function GET() {
  const raw = readGraph();
  if (!raw) {
    return NextResponse.json(
      { error: 'Knowledge graph not built. Run npm run build-graph.' },
      { status: 503 },
    );
  }

  const activeNodes = raw.nodes.filter((n) => !n.deprecated);
  const activeIds = new Set(activeNodes.map((n) => n.id));

  const activeEdges = raw.edges.filter(
    (e) => activeIds.has(e.from) && activeIds.has(e.to),
  );

  // Degree computed from ALL edges (both directions) to preserve hub sizing
  const degree = new Map<string, number>();
  for (const e of activeEdges) {
    degree.set(e.from, (degree.get(e.from) ?? 0) + 1);
    degree.set(e.to, (degree.get(e.to) ?? 0) + 1);
  }

  // Deduplicate to forward-only edges (exclude :inverse sources)
  const forwardEdges = activeEdges.filter(
    (e) => !e.source.endsWith(':inverse'),
  );

  // Build a set of forward edge keys to detect bidirectional pairs
  const forwardKeys = new Set(
    forwardEdges.map((e) => `${e.from}|${e.to}`),
  );

  const links: KnowledgeGraphLink[] = forwardEdges.map((e) => ({
    source: e.from,
    target: e.to,
    edgeType: e.type,
    confidence: e.confidence,
    bidirectional: forwardKeys.has(`${e.to}|${e.from}`),
  }));

  const nodes: KnowledgeGraphNode[] = activeNodes.map((n) => ({
    id: n.id,
    label: n.title,
    group: n.type,
    val: degree.get(n.id) ?? 0,
  }));

  const data: KnowledgeGraphData = { nodes, links };

  return NextResponse.json(data, {
    headers: {
      'Cache-Control': 'public, max-age=3600, stale-while-revalidate=600',
    },
  });
}
