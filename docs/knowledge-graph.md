---
type: spec
id: knowledge-graph
topics: [graph, anchor, knowledge-graph, edge, search, audit]
references:
  - AGENTS.md
  - docs/initiatives/docs-knowledge-graph-initiative.md
  - .cursor/plans/docs_kg_foundation_a1f3e7c2.plan.md
  - .cursor/plans/feedback_log_ap_tagging_b4d8c91e.plan.md
  - .cursor/plans/docs_kg_eval_handle_c7e2a5f9.plan.md
---

<a id="kg-spec"></a>
# Docs Knowledge Graph - Canonical Spec

> **Single source of truth** for the knowledge graph layered over the documentation system. Every other document in the system - hubs, spokes, anti-patterns, skills, rules, feedback logs, release logs, the AGENTS.md route table - participates in this graph by following the conventions defined here.
>
> **Authored**: Plan A Phase 0a. **Updated by**: Plan B Phase 0 (records empirical baseline + target). **Consumed by**: `scripts/build-graph.mjs`, `scripts/query-graph.mjs`, `scripts/mcp-graph-server.mjs`, `scripts/cluster-check.mjs`, `scripts/audit-docs.mjs`, the `graph-query` skill, and the Obsidian vault.

<a id="kg-section-index"></a>
## Section index

- [1. Goals and non-goals](#kg-goals)
- [2. Anchor convention](#kg-anchors)
- [3. ID naming](#kg-id-naming)
- [4. Frontmatter schema](#kg-frontmatter)
- [5. Edge types and allowlist](#kg-edges)
- [6. Confidence convention](#kg-confidence)
- [7. Link syntax](#kg-link-syntax)
- [8. Node-type taxonomy](#kg-node-types)
- [9. Topic vocabulary](#kg-topic-vocab)
- [10. Build artifacts and cache](#kg-cache)
- [11. Search index (BM25)](#kg-search)
- [12. MCP server](#kg-mcp)
- [13. Audit checks](#kg-audits)
- [14. Cluster validation](#kg-clusters)
- [15. Obsidian vault setup](#kg-obsidian)
- [16. Maintenance rules](#kg-maintenance)
- [17. Empirical baseline + target (Plan B fills)](#kg-empirical-baseline)
- [18. Skill + rule frontmatter spike outcomes](#kg-spike-outcomes)

<a id="kg-goals"></a>
## 1. Goals and non-goals

**Goals.** Make the documentation system traversable as a graph. Every route, guardrail, anti-pattern, skill, rule, hub, and spoke is a node with a stable HTML-anchor ID and typed semantic edges with confidence scores. An agent can ask "what is connected to AGENTS.md route 17?" and get a connected subgraph as markdown. A human can open Obsidian on the repo and see the same graph visually.

**Non-goals.**
- Vector embeddings (search uses BM25; embeddings are a Phase 2 follow-up).
- Auto-generated cluster summary pages.
- Runtime instrumentation (the graph is build-time only).
- A graph database (KuzuDB or similar). Cache files are JSON, regenerated on demand.
- Replacement of `audit-docs.mjs` (this spec extends it with new topology checks).
- Bidirectional edge declaration (only forward edges are authored; inverses are auto-derived).

<a id="kg-anchors"></a>
## 2. Anchor convention

**PREPEND HTML anchors on the line directly above each heading.** Do not append. Appending breaks scroll-to-target on multi-line items. Do not put the anchor on the same line as the heading. Always its own line, immediately preceding the heading.

```markdown
<a id="eap-120"></a>
## EAP-120: Client analytics `init` only in a parent `useEffect` while children `track` in `useEffect`
```

The anchor element renders as zero-height in all renderers (GitHub, Cursor, Obsidian); the link target `#eap-120` resolves to the heading because browsers scroll to the nearest preceding anchor with that ID.

**Why HTML anchors and not GitHub auto-generated heading slugs?** Auto-slugs change when headings are reworded; explicit anchors are stable across renames. They also work in renderers that don't auto-generate slugs (Cursor's preview, Obsidian, raw markdown viewers).

<a id="kg-id-naming"></a>
## 3. ID naming

| Heading shape | Anchor ID | Example |
|---|---|---|
| `## EAP-NNN:` (engineering anti-patterns) | `eap-NNN` | `eap-120` |
| `## AP-NNN:` (design anti-patterns) | `ap-NNN` | `ap-022` |
| `## CAP-NNN:` (content anti-patterns) | `cap-NNN` | `cap-022` |
| `## REL-NNN ...` (release log entries) | `rel-NNN` | `rel-027` |
| `### ENG-NNN:` (engineering feedback entries) | `eng-NNN` | `eng-209` |
| `### FB-NNN:` (design feedback entries) | `fb-NNN` | `fb-040` |
| `### CFB-NNN:` (content feedback entries) | `cfb-NNN` | `cfb-022` |
| AGENTS.md numbered route | `route-N` | `route-17` |
| AGENTS.md hard guardrail | `guardrail-{design,content,engineering}-N` | `guardrail-engineering-27` |
| Skill | `skill-{slug}` | `skill-graph-query` |
| Rule | `rule-{slug}` | `rule-password-gate` |
| Hub | `hub-{design,engineering,content}` | `hub-engineering` |
| Spoke | `spoke-{slug-derived-from-filename}` | `spoke-analytics-instrumentation` |
| Section heading inside any doc | `<doc-id>-<section-slug>` | `kg-edges` |

IDs MUST be lowercase, kebab-case, and globally unique across the whole graph. The `checkAnchorIdUniqueness()` audit check enforces this.

<a id="kg-frontmatter"></a>
## 4. Frontmatter schema

Every participating document SHOULD declare file-level frontmatter at the top:

```yaml
---
type: <node-type>           # required - one of the values in §8
id: <stable-id>              # required - matches the document's primary anchor
topics: [topic1, topic2]     # required - 1-5 entries from the vocabulary in §9
enforces: [...]              # optional - typed edge list (§5)
documents: [...]             # optional
supersedes: [...]            # optional
derivedFrom: [...]           # optional
triggers: [...]              # optional
references: [...]            # optional
deprecated: false            # optional, defaults to false
---
```

**Required fields per node type:**
- `route-table`, `hub`, `anti-pattern`, `skill`, `rule`, `spoke`, `eval-task-corpus`, `eval-baseline`: all four (`type`, `id`, `topics`, plus at least one edge field)
- `feedback`, `release`: `type` and `id` only (per-entry edges live inline as citations - see §6)
- `alias`: `type`, `id`, and `references: [<canonical-doc>]`

The build script tolerates missing optional fields and produces no edges for them. The `checkFrontmatterSchema()` audit check enforces required fields.

<a id="kg-edges"></a>
## 5. Edge types and allowlist

Edges are typed forward-only relations. The build script auto-derives every inverse. The allowlist:

| Forward edge | Inverse (auto-derived) | Semantics | Example |
|---|---|---|---|
| `enforces` | `enforcedBy` | Source enforces a rule/anti-pattern/guardrail. | A skill `enforces` an anti-pattern. |
| `documents` | `documentedBy` | Source documents a concept/policy. | A spoke `documents` a hub. |
| `supersedes` | `supersededBy` | Source replaces target. | A new EAP `supersedes` an older one. |
| `derivedFrom` | `derives` | Source was distilled from target. | A synthesis file `derivedFrom` an archive. |
| `triggers` | `triggeredBy` | Source activates target (skill / route activation). | An AGENTS.md route `triggers` a skill. |
| `references` | `referencedBy` | Generic citation. Default for inline `See [...]` and standard markdown links. | Anything to anything else. |

**Why exactly six.** Smaller is better for an LLM to reason about; six covers every relationship currently in the docs without lossy collapsing. Typos against this allowlist are caught by the build script and emitted as warnings.

**Build script behavior on unknown edge names:** emits a warning to stderr (`[build-graph] WARN: unknown edge name 'foo' in docs/X.md - did you mean 'documents'?`) and skips that edge. Never silently drops or guesses.

<a id="kg-confidence"></a>
## 6. Confidence convention

Every edge carries a confidence score in `[0.0, 1.0]`.

**Frontmatter edges.** Default to `1.0`. Author may override by writing the edge as a 2-element array:

```yaml
references:
  - [docs/engineering/analytics-instrumentation.md, 0.6]
  - docs/architecture.md  # implicit 1.0
```

**Citation-derived edges.** The build script scans the body of every doc for two citation patterns:

1. **Strong citations** — explicit reference keyword followed by an ID token. Confidence by keyword:

| Keyword | Confidence | Rationale |
|---|---|---|
| `See` / `see` | 1.0 | Strongest assertion. The author considers the citation directly authoritative. |
| `Related:` | 0.6 | Acknowledged similarity, not direct authority. |
| `cf.` | 0.6 | Same. |
| `Also:` | 0.6 | Same. |
| (no keyword, raw markdown link in body) | 0.6 | Default for unannotated links. |
| `(0.X)` parenthetical override | `X` (0-1.0) | Author's explicit calibration. Wins over keyword default. |

2. **Bare ID mentions** — any `AP-XXX`, `EAP-XXX`, `CAP-XXX`, `FB-XXX`, `CFB-XXX`, `ENG-XXX`, or `REL-XXX` token appearing in prose without a keyword. Confidence: **0.5** (informational mention, not authoritative). A strong citation at the same offset always wins.

Examples:

```markdown
See [EAP-120](docs/engineering-anti-patterns.md#eap-120).        <-- conf 1.0
Related: [EAP-119](docs/engineering-anti-patterns.md#eap-119).   <-- conf 0.6
See [EAP-118](docs/engineering-anti-patterns.md#eap-118) (0.4).  <-- conf 0.4 (override)
Violated 6+ times - see EAP-042.                                  <-- conf 1.0 (lowercase "see")
ENFORCEMENT (EAP-027): the fix is not done until ...              <-- conf 0.5 (bare in prose)
```

**Auto-derived inverses preserve the forward edge's confidence.** A `references` edge from A to B with confidence 0.6 produces a `referencedBy` edge from B to A also with confidence 0.6.

<a id="kg-edge-extraction-invariants"></a>
**Edge-extraction invariants.** Three rules govern how raw text becomes graph edges. Together they make anchor-scoped citations work correctly.

1. **Body-anchor segmentation.** Every offset in a document body is owned by the nearest preceding anchor (`<a id="...">`) or feedback-entry heading. Citations and markdown links in that span attribute to the owner anchor, **not** the file. Without this, `guardrail-engineering-13` citing `EAP-013` would emit `AGENTS -> eap-013` and lose all per-guardrail granularity.
2. **Edge-type inference from source-node type.** When the source anchor is a `guardrail`, `skill`, or `rule` and the target is an anti-pattern (`ap-*`, `eap-*`, `cap-*`), the emitted edge type is `enforces` (not `references`). Routes navigate; they do not enforce, so `route` is excluded.
3. **Frontmatter coercion.** The same coercion runs on frontmatter: a skill or rule that lists an AP under `references:` produces an `enforces` edge instead. The original declared type is recorded in `source: 'frontmatter:coerced'` for traceability.

These invariants live in `scripts/build-graph.mjs` (`buildSegmenter`, `inferEdgeType`, `extractEdgesFromFrontmatter`, `STRONG_CITATION_RE`, `BARE_ID_RE`).

The `--confidence-min` flag on `query-graph` filters edges below a threshold (default: 0.0, no filtering).

<a id="kg-link-syntax"></a>
## 7. Link syntax

**Standard markdown only.** `[text](path#anchor)` for in-repo links, `[text](https://...)` for external. The build script extracts both as edges.

**No Obsidian wikilinks.** `[[Note Name]]` and `[[Note Name#Section]]` syntax renders as literal text in GitHub and Cursor's markdown preview. Obsidian's graph view still works on standard markdown links because Obsidian parses both syntaxes; standard markdown is the universal subset.

**No HTML `<a href>` for in-repo navigation.** Use markdown. The build script does not parse `<a href>` as edges (only `<a id>` for anchors).

<a id="kg-node-types"></a>
## 8. Node-type taxonomy

The full set declared by Plan A so that Plans B and C have stable types to point at.

| Type | What it represents | Where it lives | Plan that lands it |
|---|---|---|---|
| `route-table` | The AGENTS.md routing table file. | `AGENTS.md` | A |
| `hub` | A pillar hub (design, engineering, content). | `docs/{design,engineering,content}.md` | A |
| `spoke` | A specialized topic doc under a pillar. | `docs/{design,engineering,content}/*.md` | A |
| `anti-pattern` | Codified failure mode (AP, EAP, CAP). | `docs/{design,engineering,content}-anti-patterns.md` (file-level) and per-entry anchors. | A |
| `feedback` | A correction log entry (FB, CFB, ENG, retrofit Session). | `docs/*-feedback-log{,-archive}.md` per-entry anchors. | B |
| `release` | A REL-XXX release entry. | `docs/release-log{,-archive}.md` per-entry anchors. | A |
| `skill` | An agent skill (SKILL.md). | `.cursor/skills/*/SKILL.md` | A |
| `rule` | A Cursor rule (rules/*.md). | `.cursor/rules/*.md` | A |
| `cross-cutting` | A reference doc that spans multiple pillars. | `docs/{analytics,architecture,port-registry,magic-words}.md` | A |
| `untagged-pattern-list` | A list of patterns that have NOT yet been promoted to AP/EAP/CAP. | `docs/candidate-anti-patterns.md` | A (declares); B (may add entries) |
| `renumber-log` | A retrofit log mapping legacy headings to new IDs. | `docs/eng-renumber-log.md` | B |
| `cluster-report` | An advisory community-detection output. | `docs/cluster-validation-report.md` | A |
| `alias` | A pointer to a canonical node. | `CLAUDE.md` (alias for AGENTS.md) | A |
| `eval-task-corpus` | The frozen evaluation task list. | `docs/eval-task-corpus.md` | C |
| `eval-baseline` | A captured baseline run output. | `docs/eval-baselines/current/<task-id>/run-<n>.md` | C |
| `spec` | A canonical specification (this file, knowledge-graph.md). | `docs/knowledge-graph.md` | A |

`type` values not in this table cause a `checkFrontmatterSchema()` warning.

<a id="kg-topic-vocab"></a>
## 9. Topic vocabulary

**Cap: 39 terms.** When an annotator wants a term not in this list, they propose an addition in their PR; if accepted, the term is appended here AND the cap raised by 1 (never silently). The cap exists because lumping below 40 forces low-precision categories ("a11y" + "ux" + "interaction" all collapsed into one is unhelpful for retrieval).

**Seed terms (count: 39).**

```
accessibility
analytics
animation
anchor
anti-pattern
audit
branding
case-study
cms
color
content
copy
dark-mode
design
edge
engineering
feedback
graph
guardrail
hydration
interaction
knowledge-graph
layout
navigation
parity
playground
port-registry
portfolio
projects
release
route
rule
search
security
skill
storage
system-architecture
typography
voice
```

The build script's `checkTopicVocabulary()` reads this section, parses the fenced block, and emits a warning if any frontmatter `topics:` entry is not in the list. Adding a term requires editing this section AND keeping the count <= 39.

**Cap principle.** A term enters the vocabulary when it has 2+ distinct uses across annotated files OR represents a core retrieval surface (a query an agent would routinely issue). Vague variants are folded into existing terms: `frontmatter`/`mcp`/`retrieval` -> `knowledge-graph`, `quality` -> `audit`, `visual-evidence` -> `design`, `internal-tools` -> `projects`, `positioning` -> `voice`, `admin-ui` -> `design`. Past 39 requires editing the cap, a §1 non-goal review, and a documented justification per term - do NOT silently extend. Past 50 means the vocabulary has lost its retrieval-surface discipline; consolidate before growing.

**Growth log.**
- 28 (Plan A Phase 0a seed) -> 35 (Plan A Phase 7a, 7 empirical terms with multi-use evidence) -> 39 (Plan A Foundation fix-up, 4 distinct retrieval surfaces: `navigation`, `typography`, `storage`, `security`).

<a id="kg-cache"></a>
## 10. Build artifacts and cache

**Output paths.**
- `.cache/graph.json` - the full node + edge graph.
- `.cache/search-index.json` - the lunr BM25 search index.

Both are `.gitignore`'d. The graph is regenerated on demand via `npm run build-graph`, and `query-graph` always rebuilds first.

**Atomic write contract.** The build script writes to `.cache/X.json.tmp` and renames to `.cache/X.json` on success. On failure (parse error, schema violation), the script exits non-zero and the prior cache stays intact. The `checkGraphStaleness()` audit check compares `mtime(.cache/graph.json)` against the latest `mtime` across watched directories (`docs/`, `.cursor/`, `AGENTS.md`, `CLAUDE.md`); if the graph is older, it emits an advisory warning suggesting `npm run build-graph`.

**graph.json shape (informative).**

```json
{
  "version": 1,
  "generatedAt": "ISO 8601",
  "nodes": [
    {
      "id": "eap-120",
      "type": "anti-pattern",
      "title": "Client analytics init only in a parent useEffect...",
      "path": "docs/engineering-anti-patterns.md",
      "anchor": "eap-120",
      "topics": ["analytics", "hydration"],
      "deprecated": false
    }
  ],
  "edges": [
    {
      "from": "skill-graph-query",
      "to": "eap-120",
      "type": "enforces",
      "confidence": 1.0,
      "source": "frontmatter"
    },
    {
      "from": "eng-209",
      "to": "eap-120",
      "type": "references",
      "confidence": 1.0,
      "source": "citation",
      "keyword": "See"
    }
  ],
  "warnings": [
    "[build-graph] unknown edge name 'foo' in docs/X.md (line 12)"
  ]
}
```

<a id="kg-search"></a>
## 11. Search index (BM25)

`scripts/build-graph.mjs` emits `.cache/search-index.json` as a serialized [`lunr`](https://lunrjs.com/) index built over node text: title + frontmatter `topics` + body excerpt (first ~500 chars).

`query-graph --search "<text>"` rehydrates the index and returns ranked nodes. Why BM25 not embeddings:
- Finite node count (~hundreds).
- Zero infrastructure cost (no LLM API key, no model download, no GPU).
- Deterministic and explainable.
- Embeddings are a Phase 2 follow-up if recall proves insufficient.

<a id="kg-mcp"></a>
## 12. MCP server

`scripts/mcp-graph-server.mjs` is a thin stdio MCP server (Model Context Protocol) exposing 3 tools by reusing `query-graph` internals:

| Tool | Inputs | Output |
|---|---|---|
| `query-node` | `id: string` | The node and its connected subgraph as markdown. |
| `search` | `query: string`, optional `limit: number` | Ranked nodes (BM25). |
| `subgraph` | `id: string`, `depth: number`, optional `confidenceMin: number` | Connected subgraph at given depth. |

**Why a separate MCP server when there's already a Cursor `graph-query` skill.** The skill is the convenience UX inside Cursor. The MCP server is the portability layer: usable from Claude Code, Codex, Windsurf, OpenCode, or any MCP-aware client. Both call the same internal functions in `scripts/query-graph.mjs`, so semantics never drift.

**Smoke-test command:** `npx @modelcontextprotocol/inspector node scripts/mcp-graph-server.mjs`. Phase 11 verifies `query-node` with `id=route-17` returns a non-empty subgraph.

<a id="kg-audits"></a>
## 13. Audit checks

`scripts/audit-docs.mjs` gains 8 topology checks. The first 6 are Plan A's; checks 7 and 8 are Plan B's.

| # | Check | What it verifies | Plan |
|---|---|---|---|
| 1 | `checkBrokenAnchors()` | Every `[text](path#anchor)` link points to an anchor that exists. | A |
| 2 | `checkOrphanAntiPatterns()` | Every AP/EAP/CAP entry has at least one inbound `references` or `enforces` edge. | A |
| 3 | `checkTopicVocabulary()` | Every frontmatter `topics:` entry is in the §9 list AND the list has <= 35 entries. | A |
| 4 | `checkFrontmatterSchema()` | Every required field for the node's `type` is present. | A |
| 5 | `checkAnchorIdUniqueness()` | No two anchors in the repo share an `id`. | A |
| 6 | `checkGraphStaleness()` | `.cache/graph.json` mtime >= latest watched-file mtime. | A |
| 7 | `checkFeedbackTaggingRate()` | Feedback log entries with at least one AP citation reach the empirical target. | B |
| 8 | `checkWeightedTaggingRate()` | Weighted-mean confidence across tagged feedback entries >= 0.7. | B |

**`--quick` flag.** Skips checks 6, 7, 8 (the slow ones). Default `npm run audit-docs` runs all 8. CI runs `--quick` for pre-commit.

<a id="kg-clusters"></a>
## 14. Cluster validation

`scripts/cluster-check.mjs` runs Louvain community detection ([`graphology-communities-louvain`](https://www.npmjs.com/package/graphology-communities-louvain)) on the built graph, compares detected communities against pillar frontmatter (`hub-design`, `hub-engineering`, `hub-content`), and emits `docs/cluster-validation-report.md`. The report is **advisory**, not gating - mismatch is design feedback for a future restructuring pass, not a build failure.

Output structure:
- Summary: detected community count, modularity score, mismatch count.
- Per-community section: members + dominant pillar + mismatch flag.
- Top of file: a "Flagged communities" list for fast scanning.

<a id="kg-obsidian"></a>
## 15. Obsidian vault setup

The repo IS the Obsidian vault. Open the repo root in Obsidian as an existing vault.

**Committed file: `.obsidian/app.json`** (created in Phase 6). Sets `userIgnoreFilters` to skip non-doc directories from Obsidian's graph and search:

```json
{
  "userIgnoreFilters": [
    "node_modules/",
    ".next/",
    ".git/",
    "playground/",
    "ascii-tool/",
    "archive/",
    "src/",
    ".cache/",
    ".vercel/",
    ".turbo/"
  ]
}
```

**Uncommitted Obsidian state.** Personal Obsidian preferences (`.obsidian/workspace.json`, `.obsidian/graph.json` view settings, plugin lists) stay user-local and are NOT committed. The repo `.gitignore` enforces this:

```gitignore
/.obsidian/*
!/.obsidian/app.json
```

Only `.obsidian/app.json` is shared. Anything you change in Obsidian after first opening the vault (workspace layout, graph view colors, installed plugins) lives only on your machine.

**Graph view tip.** Group edges by `type` (Settings -> Graph view -> Color groups). Group nodes by `type` frontmatter. Filter to a single pillar with `path:docs/engineering/` or similar.

**Typed-graph canvas exports.** Obsidian's native graph view operates at the file level — it cannot render the typed graph at full fidelity (per-anchor nodes, typed edges with confidence). To see the typed graph inside Obsidian without a plugin install, run `npm run export-canvas`. This regenerates `.cache/graph.json` and emits three `.canvas` files under [`docs/canvas/`](canvas/README.md):

- `overview.canvas` — top-level navigator (~43 nodes): hubs, AP catalogs, route table, skills, rules, spec, release log.
- `anti-patterns.canvas` — every AP/EAP/CAP entry (~215 nodes), grouped by catalog band, with cross-AP `references` edges.
- `recent-feedback.canvas` — last 30 entries per active feedback log + cited APs (~143 nodes), edges colored by confidence (strong / loose). Visual mirror of recurrence classification (recurrent / approximate / novel).

Each `file` node deep-links to the underlying doc anchor — clicking opens the source at the right heading. The exporter is generated by [`scripts/export-canvas.mjs`](../scripts/export-canvas.mjs); see [`docs/canvas/README.md`](canvas/README.md) for view-by-view guidance.

**When to add a richer UI.** When the canvases stop scaling (filtering needs, deep-linking from outside Obsidian, public-facing views), the next step is an in-site knowledge graph viewer. The `GraphCanvas` component already renders `.cache/graph.json` via `/api/knowledge-graph/route.ts` on the case study page with auto-transitioning view modes. A standalone explorer page is intentionally deferred until the canvases prove insufficient.

<a id="kg-maintenance"></a>
## 16. Maintenance rules

**When to rebuild the graph.** After ANY structural change to docs (new heading, renamed anchor, new edge in frontmatter, new file). Engineering Hard Guardrail 27 in AGENTS.md (added in Phase 7b) codifies this: `npm run build-graph && npm run audit-docs`. The `checkGraphStaleness()` audit catches forgotten rebuilds.

**Adding a new edge type.** Edit §5 to add the new forward + inverse pair, update `scripts/build-graph.mjs` allowlist constant, write at least 3 use-case rows in §5's table, and verify the inverse derivation in `deriveInverses()`. Cap is whatever fits without redundancy; six is current.

**Adding a topic to the vocabulary.** Edit §9: append the new term inside the fenced block, increment the count in the heading. The cap of 35 is hard - past 35 requires editing the cap (and a §1 non-goal review). Do NOT silently extend.

**Renaming an anchor.** Update the anchor in place, then grep the repo for the old anchor and rewrite citations. Plan A's eventual `rename` tool (Phase 2 follow-up) automates this.

**Adding a node type.** Edit §8 to declare the new type, add a row to §3's ID-naming table, decide which `audit-docs.mjs` checks apply (or stay opt-out), update `scripts/build-graph.mjs` if it needs special parsing. Touch the spec FIRST, code SECOND.

**Deleting a node.** Set `deprecated: true` in the file's frontmatter rather than removing the file. The build script honors `deprecated: true` by emitting `deprecated: true` on the node and excluding deprecated nodes from default search results. Hard delete only after a release cycle confirms nothing in the active graph still cites it.

<a id="kg-empirical-baseline"></a>
## 17. Empirical baseline + target (Plan B Phase 0 — completed 2026-04-26)

**Sample**: 50 entries across 5 raw correction logs (10 per file; positional sampling: first 3 + middle 4 + last 3 chronologically). Each entry was manually matched against the AP/EAP/CAP catalog (214 entries) using the match rules in `.cursor/plans/feedback_log_ap_tagging_b4d8c91e.plan.md` §"Citation syntax with confidence".

> **Adversarial-audit corrections (ENG-230, 2026-04-26):** The first revision of this section locked a target of **75%** that was strictly above the empirically-measured **66% achievable** ceiling. That violated the plan's own fallback policy ("if achieved < target, use achieved floored to nearest 5%") and produced an audit that warned at 43.3% when its enforcement threshold (`MIN_RAW_RATE = 0.35`) was 40 pp below the locked spec. Both bugs are corrected below: (a) the locked invariants now reflect achievable + currently-achieved data; (b) `scripts/audit-docs.mjs` reads these invariants from this file rather than hardcoding constants; (c) a forward-regression guard (windowed rate) was added.

| Metric | Pre-flight (2026-04-25) | Phase 0 sample (2026-04-26) | Phase 4a actual (2026-04-26) | Locked invariant |
|---|---|---|---|---|
| Active feedback log entries (5 files) | ~555 | ~556 | 568 anchored | n/a |
| Pre-existing AP citations (canonical regex) | ~15 | n/a | n/a | n/a |
| Raw tagging rate | ~2.7% | n/a (measures *achievable*) | **43.3%** (245/568, reverse-citation method) | **see Locked invariant rows below** |
| **Achievable raw rate** (forward-match) | n/a | **66%** (33/50) | n/a yet — pending P2 forward-match pass | n/a |
| **Achievable mean confidence** | n/a | **0.879** (23 × 1.0 + 10 × 0.6) | **0.971** (Phase 4a) | n/a |
| **Catalog-gap rate** | n/a | **2%** (1/50) | n/a | gate at 20% — **PASSED** |
| **Locked raw-rate invariant** | n/a | n/a | n/a | **40%** |
| **Locked mean-confidence invariant** | n/a | n/a | n/a | **0.70** |
| **Locked windowed-rate window size** | n/a | n/a | n/a | **30** |
| **Locked windowed-rate floor** | n/a | n/a | n/a | **50%** |

#### Why **40%** for the raw-rate invariant (not 75%)

1. **Achievable ceiling is 66%, not 76%.** The Phase 0 sample established that 66% is the upper bound a forward-matching pass can deliver against the current AP catalog. The original formula `min(max(60%, 1.5 × 66%), 66% + 10%) = 76%` is mathematically nonsensical for an upper-bound-bounded metric — a target above the achievable ceiling is unreachable by definition.
2. **Phase 4a used reverse-citation, not forward-match.** The actual implementation parsed AP catalog citations to find which feedback entries they reference, then tagged those entries. This biases toward already-cited APs and toward "loud" patterns in the catalog. It produced **43.3% achieved**, well below the 66% achievable.
3. **Fallback policy applied.** Per the plan's policy "if achieved < target, use achieved floored to 5%": 43.3% → **40%**. The audit will pass at the current corpus and warn if anyone removes citations.
4. **Forward-regression guard.** A second invariant (windowed rate) requires the most-recent 30 entries in each active log to be tagged at ≥ 50%. This prevents the corpus from drifting back to ~3% as new untagged entries land.

#### Re-locking schedule

- **After P2 forward-match pass:** re-measure `tagged/total` across all 5 logs; floor to nearest 5%; raise `Locked raw-rate invariant` accordingly.
- **After AP catalog growth:** re-run the Phase 0 sample (50 entries); if achievable rises above the locked invariant + 10 pp, re-tighten.

### Sample composition

| Bucket | Count | Confidence |
|---|---|---|
| Strong matches (`See` 1.0) | 23 | 1.0 each |
| Approximate matches (`Related:` 0.6) | 10 | 0.6 each |
| No match — one-off (won't recur) | 16 | n/a |
| No match — recurring-but-uncatalogued | 1 | n/a |
| **Total** | **50** | |

### Mid-plan decision gate verdict

Catalog-gap rate (2%) is well below the 20% threshold. **Decision: PASS — proceed with Phase 4a without forking AP catalog expansion.**

### 5–10 new-AP budget decision

**No new APs authored from Phase 0 budget.** The single recurring-but-uncatalogued entry (`ENG-218`: React 19 commit-phase rule for `flushSync` inside `useLayoutEffect`) is borderline — it could be a one-off if React 19 adoption stabilizes, or it could recur as more sync-effect + measurement patterns surface. Tracked in `docs/candidate-anti-patterns.md` for separate later review per non-goal #1.

### Per-entry tagging decisions (locked)

These are the planned citations Phase 4a will insert. The full table lives in this initiative's plan record; the audit invariants reference only the aggregate metrics above.

| ID | File | Decision | AP IDs |
|---|---|---|---|
| FB-207 | design-active | oneoff | — |
| FB-206 | design-active | strong | CAP-032 |
| FB-205 | design-active | approx | AP-027 |
| FB-097 | design-active | strong | AP-009 |
| FB-096 | design-active | strong | AP-055 |
| FB-095 | design-active | strong | EAP-064 |
| FB-094 | design-active | strong | AP-063 |
| FB-084 | design-active | approx | AP-010 |
| FB-086 | design-active | strong | AP-030 |
| FB-087 | design-active | strong | AP-007 |
| FB-047 | design-archive | strong | AP-029 |
| FB-050 | design-archive | approx | AP-027 |
| FB-045 | design-archive | oneoff | — |
| FB-016 | design-archive | oneoff | — |
| FB-013 | design-archive | strong | AP-009 |
| FB-014 | design-archive | strong | AP-018 |
| FB-015 | design-archive | strong | AP-007, AP-010 |
| FB-058 | design-archive | approx | AP-007 |
| FB-065 | design-archive | approx | EAP-040 |
| FB-067 | design-archive | strong | EAP-038 |
| ENG-218 | eng-active | gap | — |
| ENG-217 | eng-active | oneoff | — |
| ENG-216 | eng-active | oneoff | — |
| ENG-149 | eng-active | strong | EAP-087 |
| ENG-148 | eng-active | approx | EAP-014 |
| ENG-147 | eng-active | approx | EAP-001 |
| ENG-146 | eng-active | strong | EAP-027 |
| ENG-202 | eng-active | strong | EAP-119 |
| ENG-200 | eng-active | oneoff | — |
| ENG-201 | eng-active | strong | EAP-001 |
| ENG-049 | eng-archive | strong | EAP-029 |
| ENG-048 | eng-archive | oneoff | — |
| ENG-047 | eng-archive | strong | EAP-035 |
| ENG-054 | eng-archive | approx | EAP-029 |
| ENG-055 | eng-archive | approx | EAP-029 |
| ENG-056 | eng-archive | oneoff | — |
| ENG-057 | eng-archive | strong | EAP-066 |
| ENG-109 | eng-archive | strong | EAP-063 |
| ENG-110 | eng-archive | approx | AP-008 |
| ENG-104 | eng-archive | oneoff | — |
| CFB-042 | content-active | oneoff | — |
| CFB-041 | content-active | oneoff | — |
| CFB-040 | content-active | oneoff | — |
| CFB-028 | content-active | strong | CAP-025, CAP-026 |
| CFB-027 | content-active | oneoff | — |
| CFB-026 | content-active | oneoff | — |
| CFB-025 | content-active | oneoff | — |
| CFB-010 | content-active | strong | CAP-006 |
| CFB-011 | content-active | oneoff | — |
| CFB-012 | content-active | strong | CAP-015 |

<a id="kg-spike-outcomes"></a>
## 18. Skill + rule frontmatter spike outcomes (Plan A Phase 0b)

**Spike date**: 2026-04-25. **Outcome**: sibling `METADATA.yml` fallback adopted for BOTH domains.

| Domain | Decision | Inline frontmatter contents | Sibling graph-metadata file |
|---|---|---|---|
| `.cursor/skills/*/SKILL.md` | Sibling fallback | `name`, `description` (Cursor-required schema) ONLY. | `.cursor/skills/<slug>/METADATA.yml` (per-skill directory already exists). |
| `.cursor/rules/*.md` | Sibling fallback | `globs:` (Cursor-required activation field) ONLY. | `.cursor/rules/<slug>-METADATA.yml` (sibling at flat directory level; rule file name `<slug>.md` -> sibling `<slug>-METADATA.yml`). |

### Rationale

- **In-session verification was not possible.** The spike could not restart Cursor's session loader to confirm that augmenting inline frontmatter with `type`, `id`, `topics`, and edge fields does not silently drop the skill/rule from the activation registry.
- **Survey of all 17 existing skills** showed every active SKILL.md uses the minimal `name` + `description` schema. No skill in the wild carries extra fields. Adding extra fields would be untested territory in this repo.
- **The cost of asymmetry is zero.** Build-graph reads sibling `METADATA.yml` first if present; falls back to inline frontmatter otherwise. The graph parser does not care which file holds the metadata.
- **Future-proofing.** If Cursor tightens its frontmatter schema in a future version, the graph layer is fully decoupled. No churn in `.cursor/` files when the schema evolves.

### Sibling METADATA.yml shape

Same schema as inline frontmatter (see §4) minus the duplicated Cursor-required fields:

```yaml
# .cursor/skills/doc-audit/METADATA.yml
type: skill
id: skill-doc-audit
topics: [audit, graph, anti-pattern]
enforces:
  - eap-082
  - eap-019
documents:
  - knowledge-graph
references:
  - AGENTS.md
```

```yaml
# .cursor/rules/password-gate-METADATA.yml
type: rule
id: rule-password-gate
topics: [engineering, deployment, parity]
enforces:
  - guardrail-engineering-23
references:
  - .cursor/skills/password-gate/SKILL.md
```

### Implications for Phases 2d and 2e

- **Phase 2d (skills annotation)**: create `METADATA.yml` files alongside each `SKILL.md`. Do NOT modify the inline frontmatter of any SKILL.md.
- **Phase 2e (rules annotation)**: create `<rulename>-METADATA.yml` files alongside each `.cursor/rules/<rulename>.md`. Do NOT modify the inline `globs:` field of any rule file.
- **Phase 1a (build-graph)**: when traversing `.cursor/skills/` and `.cursor/rules/`, the parser reads the sibling METADATA.yml file (if present) for graph metadata; reads the inline frontmatter for the file's own existence and Cursor-schema fields if needed for context. If both exist, the sibling METADATA.yml wins for graph fields; inline frontmatter is authoritative for `name`/`description`/`globs`. There is no field overlap so this is unambiguous.
- **Future revisit**: a future spike (post-Plan A) may attempt inline-augmentation again if Cursor exposes a definitive schema doc. Until then, sibling files are canonical.
