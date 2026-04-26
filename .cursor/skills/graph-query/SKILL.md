---
name: graph-query
description: >-
  Targeted retrieval over the docs knowledge graph. Use this skill when you
  need to look up a specific node (anti-pattern, guardrail, route, skill,
  release, hub, spoke), search docs by keyword, or pull a 1-2 hop subgraph
  for context — instead of reading whole files. Cheaper and more precise
  than a full doc read.
---

# Skill: Graph Query

The docs knowledge graph is a typed, anchored cross-reference layer over
`AGENTS.md`, `docs/**/*.md`, `.cursor/skills/`, and `.cursor/rules/`. Every
guardrail, anti-pattern, feedback entry, route, skill, and release has a
stable HTML anchor and a node in the graph. Use this skill to retrieve
targeted slices instead of reading whole files when you only need one
specific fact, one anti-pattern, or one decision's neighborhood.

See `docs/knowledge-graph.md` for the full spec (node types, edge types,
confidence convention, frontmatter schema, anchor convention).

## When to Activate

- You need a specific anti-pattern by ID (e.g. `EAP-027`, `AP-072`, `CAP-022`)
- You need to find which docs cite a guardrail or anti-pattern
- You need the 1-2 hop neighborhood around a hub or spoke for context
- You need to search docs by keyword/topic and rank by relevance (BM25)
- You're disambiguating overlapping rules and want to see all references at once
- A skill or guardrail mentions an unfamiliar identifier (e.g. `FB-192`, `ENG-186`, `REL-024`) and you want quick context

Do NOT activate this skill when:
- You already know exactly which file holds the answer — use `Read` directly
- You need to scan body prose, not metadata — use `Grep` or `SemanticSearch`

## Step 1: Decide What You Need

Pick one of two query modes:

| Mode | Use when | CLI form |
|------|----------|----------|
| **Subgraph (default)** | You know the ID and want the node + its 1-hop neighbors (or N hops) | `<id> [--depth N]` (positional) |
| **Search** | You only have a keyword or topic | `--search "<query>"` |

A subgraph at depth=0 is effectively a single-node lookup; depth=1 (the
default) returns the node and its direct neighbors. There is no separate
`--node` flag — passing just the ID is equivalent.

IDs follow lowercase, kebab-case, zero-padded conventions:
- Anti-patterns: `eap-027`, `ap-072`, `cap-022`
- Routes: `route-1` through `route-19` (plus `route-knowledge-a..d`)
- Guardrails: `guardrail-design-1`, `guardrail-engineering-21`, `guardrail-content-2`
- Skills: `skill-playground`, `skill-design-iteration`, `skill-graph-query`
- Releases: `rel-024`
- Hubs/spokes: `engineering`, `engineering-versioning`, `design-color`

## Step 2: Run the Query

The query script auto-rebuilds the graph cache (`.cache/graph.json`) before
querying, so it's always fresh.

```bash
# Lookup a single node + its direct neighbors (default depth=1)
npm run query-graph -- eap-027

# Pull a 2-hop subgraph (use sparingly — fan-out grows fast)
npm run query-graph -- engineering --depth 2

# Search by keyword (BM25-ranked)
npm run query-graph -- --search "playground hydration"

# Filter by minimum edge confidence (0.0-1.0)
npm run query-graph -- design --confidence-min 0.7

# JSON output (for programmatic use)
npm run query-graph -- ap-072 --json

# Limit search results (default 10)
npm run query-graph -- --search "release log" --limit 5
```

Default output is markdown. Use `--json` only when you need to parse the
result programmatically.

## Step 3: Read the Result

The markdown output groups nodes by type and shows edges with their
type, target, and confidence score (1.0 = explicit `See X`, 0.6 = `Related: X`,
1.0 = frontmatter). Read top-down: the queried node first, then its
direct neighbors, then 2nd-degree (if `--depth 2`).

Confidence rules of thumb:
- **1.0** — frontmatter edges, explicit `See X` citations. Trust as authoritative.
- **0.6** — `Related: X`, `cf. X`, `Also: X` — semi-authoritative; verify
- **<0.6** — generally not produced today; flag if you see them

## Step 4: Drill In Selectively

If a neighbor looks relevant, follow up with either:
- `Read <path>` for the full file content
- `npm run query-graph -- <neighbor-id>` to expand further
- `Grep` inside the path to find specific text

Avoid reading entire feedback log archives or anti-pattern catalogs end-to-end.
The graph exists so you don't have to.

## Step 5: MCP Fallback (Optional, for Long Sessions)

For sessions with many graph queries, the `graph-mcp` server (stdio-based MCP)
exposes the same operations as MCP tools. Start it once at session start and
reuse:

```bash
npm run graph-mcp
```

Tools exposed by the MCP server:
- `query-node` — same as `--node`
- `search` — same as `--search`
- `subgraph` — same as `--subgraph`

The CLI is the canonical interface; MCP is a thin wrapper for agents that
prefer tool-call discipline. Use whichever fits the host integration.

## File Map

| File | Purpose | Read When | Write When |
|------|---------|-----------|------------|
| `docs/knowledge-graph.md` | Spec: node types, edge types, anchor convention | Before authoring graph metadata | When extending the schema |
| `scripts/build-graph.mjs` | Builds `.cache/graph.json` + `.cache/search-index.json` | Never directly (auto-runs) | When changing parsing |
| `scripts/query-graph.mjs` | CLI query interface | Never directly (use npm script) | When adding query modes |
| `scripts/mcp-graph-server.mjs` | MCP wrapper around the query script | Never directly | When adding MCP tools |
| `.cache/graph.json` | Materialized graph (gitignored) | Programmatic only | Rebuilt by `npm run build-graph` |
| `.cache/search-index.json` | Lunr BM25 index (gitignored) | Programmatic only | Rebuilt by `npm run build-graph` |

## Common Patterns

**"Show me all anti-patterns enforced by AGENTS.md guardrail 21":**
```bash
npm run query-graph -- guardrail-engineering-21
```

**"What spokes does the design hub document?":**
```bash
npm run query-graph -- design
# Look at the `documents` edges
```

**"Which feedback entries cite EAP-038?":**
```bash
npm run query-graph -- eap-038
# Look at incoming `enforcedBy` and `referencedBy` edges
```

**"Find docs about 'hydration mismatch'":**
```bash
npm run query-graph -- --search "hydration mismatch"
```

## Anti-Patterns of This Skill

- **Don't run this for trivial reads** — if you know the file path, just `Read` it.
- **Don't request 3+ hop subgraphs** — fan-out is exponential. Use `--depth 1` or `2` only.
- **Don't ignore confidence scores** — a 0.6 edge means "loosely related"; verify before acting on it.
- **Don't paste the full subgraph back to the user** — summarize. The point is to reduce tokens, not move them.
