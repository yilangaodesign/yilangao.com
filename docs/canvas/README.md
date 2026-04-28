<!-- graph metadata for docs knowledge graph (see ../knowledge-graph.md) -->
---
type: spoke
id: canvas-readme
topics:
  - graph
  - knowledge-graph
references:
  - knowledge-graph.md
---

<a id="canvas-readme"></a>
# Knowledge graph — Obsidian Canvas exports

> **What this is:** Three `.canvas` files that visualize `.cache/graph.json` (the typed knowledge graph: 994 nodes, 4,888 edges) using Obsidian's built-in Canvas viewer — **no plugin install required**.
>
> **Who reads this:** Humans reviewing the knowledge graph visually. Each canvas answers a different question.
> **How it's generated:** [`scripts/export-canvas.mjs`](../../scripts/export-canvas.mjs) reads `.cache/graph.json` and writes the three files in this directory. Re-run with `npm run export-canvas`.

## How to open

1. Open the **repo root** as an Obsidian vault (`File → Open Vault → Open folder as vault`). The committed [`.obsidian/app.json`](../../.obsidian/app.json) scopes Obsidian's index to docs only.
2. In the file tree, navigate to `docs/canvas/` and click any `.canvas` file. Obsidian opens it in the native Canvas viewer.
3. Click any node to open the underlying doc at the right anchor — every `file` node deep-links via `subpath`.

## The three views

### `overview.canvas` (~43 nodes)

Top-level navigator. Eight columns, one per node type:

| Column | Contents |
|---|---|
| `route-table` | `AGENTS.md` (the 20 routes + 27 hard guardrails entry point) |
| `hub` | The three pillar hubs: design, engineering, content |
| `spec` | `docs/knowledge-graph.md` |
| `anti-pattern` | The three AP catalog files (not individual entries) |
| `cross-cutting` | Cross-pillar references |
| `rule` | `.cursor/rules/` files |
| `skill` | `.cursor/skills/` files |
| `release-log` | `docs/release-log.md`, `docs/release-log-archive.md` |

Edges show `triggers`, `references`, `documents`, `enforces`, `derivedFrom`, `supersedes`.

**Use this when:** you're orienting yourself or auditing the catalog structure.

### `anti-patterns.canvas` (~215 nodes)

Every individual AP/EAP/CAP entry, grouped into three horizontal bands:

- Engineering APs (EAP)
- Design APs (AP)
- Content APs (CAP)

Within each band, nodes are arranged in a 10-column grid sorted by ID. Edges show cross-references between APs (e.g. `EAP-122` references `EAP-027` and `EAP-115`).

**Use this when:** you want to see the failure-mode landscape, find a specific AP, or audit cross-AP relationships.

### `recent-feedback.canvas` (~143 nodes)

The last 30 entries from each of the three active feedback logs, with the APs they cite. Three pillar bands stacked vertically:

- Engineering — last 30
- Design — last 30
- Content — last 30

Each band has feedback entries on the left, cited APs on the right, edges colored by confidence (green = strong / 1.0, cyan = loose / 0.6).

**Use this when:** you want to see what's actively recurring vs novel — the visual mirror of recurrence classification. A feedback entry with no edge to an AP node is **novel** in the Plan B sense.

## Regeneration

```bash
npm run export-canvas
```

This rebuilds `.cache/graph.json` first, then writes the three `.canvas` files. Run after any structural docs change (new AP, new feedback entry, anchor rename).

## Obsidian quirks the exporter handles

These are non-obvious behaviors of Obsidian's Canvas that the exporter compensates for. Documented here so future maintainers don't reintroduce the bugs.

- **`subpath` resolves against markdown headings, NOT HTML `<a id>` anchors.** Our docs use the pattern `<a id="eap-120"></a>\n## EAP-120: ...` — the HTML anchor is what `.cache/graph.json` records, but Obsidian's `subpath` field looks for a heading literally named `eap-120` and fails. The exporter scans each `.md` file for `<a id="X">` followed by the next heading and emits the heading text as the subpath instead (e.g. `subpath: "#EAP-120: Client analytics ..."`). See `buildAnchorToHeadingMap()` in `scripts/export-canvas.mjs`.
- **Files in dotfolders (other than `.obsidian/`) are not indexed.** `.cursor/skills/<name>/SKILL.md` files exist on disk and at correct paths, but file-node links to them render as "Create new note" prompts. The exporter detects dotfolder paths via `isHiddenFolderPath()` and falls back to text nodes with the path embedded as a code-formatted subtitle. Click-through is lost; the user can copy/paste the path into Obsidian's quick-switcher.
- **Canvas regeneration overwrites manual node positions.** Layouts are deterministic by design. Don't drag nodes around in Obsidian and expect the layout to survive `npm run export-canvas`.

## Limits

- **Static layout.** The canvases are deterministic columnar / grid layouts. Force-directed clustering would fight Obsidian's manual canvas paradigm.
- **Forward edges only.** Inverses (`referencedBy`, `enforcedBy`, etc.) are auto-derived in the graph but skipped on canvas to avoid doubling visual lines.
- **Anchor depth = 1.** Each node is a heading-anchor link; sub-section anchors below H2 aren't materialized.
- **Peer AP↔AP edges in `anti-patterns.canvas` are sparse (~14 edges across 215 nodes).** Most cross-references between APs in the docs are written as bullet text or inline mentions, not canonical citation lines, so the post-P9 audit-grade citation regex doesn't capture them. **Citation density actually lives on the feedback→AP axis (558 edges across 200 APs)** — the per-pillar "Top-cited" legend in `anti-patterns.canvas` shows top-5 most-cited APs per pillar, and `recent-feedback.canvas` is the truth source for citation visualization.
- **Skill nodes are text-only.** Lost click-through is a known trade-off. If skill files matter, navigate via the file tree or quick-switcher.

## When to consider a richer UI

If you outgrow the three canvases — typical signs: zooming becomes painful, you want filterable views, you want to deep-link from outside Obsidian — the next step is the **in-site knowledge graph viewer** discussed in [`docs/knowledge-graph.md`](../knowledge-graph.md) §15. The `GraphCanvas` component on the case study page already renders the graph data; a standalone explorer page would extend this into a queryable web UI.
