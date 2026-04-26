# Docs Knowledge Graph Initiative

> **Coordinator doc.** Three plans, executed in sequence, that together deliver a queryable knowledge graph over the documentation system, retroactive anti-pattern coverage on every feedback log entry, and an evaluation-readiness contract for the future A/B experiment that will measure whether the new structure improves agent outcomes.

## Drift-check reference (deprecated monolith)

This initiative is the result of splitting a single ~83–117h monolith plan (deprecated 2026-04-25) into 3 sibling plans + this coordinator. The deprecated source plan is kept in place as a **read-only drift-check resource** — consult only if a sibling plan's content seems to have drifted (a phase's intent unclear, a number suspicious, a dependency missing).

- **Deprecated source**: [`.cursor/plans/docs_knowledge_graph_bb11941d.plan.md`](../../.cursor/plans/docs_knowledge_graph_bb11941d.plan.md)
- **Mapping monolith → siblings** is documented in the deprecated file's banner.
- **Drift resolution rule**: if a discrepancy between the monolith and a sibling plan is found, resolve by updating the sibling plan + appending a "drift-check resolution" entry to the lessons-learned log below — never by re-aligning siblings back to the monolith. The split is canonical going forward.

## Plans in this initiative

| Plan | Path | Effort | Status | Ships |
|---|---|---|---|---|
| **A — Foundation** | `.cursor/plans/docs_kg_foundation_a1f3e7c2.plan.md` | ~30–40h | pending | Graph build/query/MCP infrastructure, anchors on AGENTS.md + anti-patterns + spokes + skills + rules + release logs + cross-cutting refs, audits, Guardrail 27, Obsidian config |
| **B — Feedback Log AP-Tagging** | `.cursor/plans/feedback_log_ap_tagging_b4d8c91e.plan.md` | ~35–65h | pending | Feedback log anchors + engineering Session retrofit + AP/EAP/CAP tagging with confidence + raw and weighted tagging-rate audits |
| **C — Evaluation Handle** | `.cursor/plans/docs_kg_eval_handle_c7e2a5f9.plan.md` | ~5–6h | pending | `eval-baseline-current` git tag + 12-task eval corpus + 9-run baseline capture procedure |

**Total**: ~70–110h across the three plans, recalibrated from the original ~83–117h monolith because the 5–10h "single-pass bundling savings" are recovered by Plan B keeping anchors + tagging in one pass per entry.

## Critical precondition (read this first)

**Plan C's Phase 00 (`git tag eval-baseline-current`) MUST run before any commit from Plan A or Plan B lands.** This single step takes ~30 minutes including preconditions (clean working tree, branch is `dev` or `main`) and pushes the tag to origin. If skipped or done late, the "current structure" reference for the future A/B evaluation is contaminated by plan work and the eval becomes invalid. Treat this as initiative-level release-blocking.

The remainder of Plan C (corpus authoring, baseline runs, eval-specific verification) can run later — only the tag step is precondition.

## Recommended execution sequence

1. **Plan C Phase 00 only** (~0.5h) — tag `eval-baseline-current` and push to origin. Stop. Do NOT continue Plan C yet.
2. **Plan A in full** (~30–40h, ~1 focused calendar week) — ships graph foundation. End-of-plan checkpoint:
   - `npm run build-graph` produces `.cache/graph.json` and `.cache/search-index.json`
   - `npm run query-graph route-17` returns connected subgraph as markdown
   - `npm run audit-docs` passes (topology checks green; feedback-log tagging-rate checks NOT yet wired — Plan B owns those)
   - MCP smoke-test via `npx @modelcontextprotocol/inspector` returns `route-17` for `query-node`
   - **Decision gate**: graph is shippable to `main` as standalone value. Decide whether to enter Plan B now or pause.
3. **Plan B in full** (~35–65h, 2–3 calendar weeks) — feedback log retrofit + tagging. Mid-plan decision gate after Plan B's Phase 0 empirical sample (50-entry stratified audit):
   - If catalog-gap rate ≤20% → continue Plan B as authored
   - If catalog-gap rate >20% → halt Plan B, fork an AP catalog expansion as a separate plan, return to Plan B after expansion ships
4. **Plan C remaining** (~5h) — corpus authoring (Phase 9), baseline capture (Phase 10), eval-specific verification (Phase 11-eval). Phase 9 prefers Plan B's engineering retrofit complete so the corpus can fingerprint stable `### ENG-NNN` headings — but if Plan B is still mid-execution, fill engineering corpus slots from existing ENG-NNN entries only and defer Session-sourced slots until Plan B's Phase 4a.2.(i) retrofit is done.

## Architectural shared state across plans

**`docs/knowledge-graph.md` (authored in Plan A Phase 0a)** hosts the canonical specifications:
- Anchor convention (PREPEND HTML anchors on the line above each heading)
- Frontmatter schema and typed edge allowlist (`enforces`, `documents`, `supersedes`, `derivedFrom`, `triggers`, `references`)
- Confidence convention (`See` → 1.0, `Related:` → 0.6, parenthetical override `(0.X)`)
- Topic vocabulary (cap 35, seeded with 25–30 terms)
- Node-type taxonomy (full set including `eval-task-corpus`, `eval-baseline`, `alias`, `untagged-pattern-list`, `renumber-log`, `cluster-report`)
- Empirical baseline + target (Plan B Phase 0 records here)

Plans B and C body-link back to this file rather than duplicating its specs.

**`docs/eng-renumber-log.md` (authored in Plan B Phase 4a.2.(i))** is the single source of truth for the Session → ENG-NNN retrofit map. Plan C's corpus authoring reads it when filling engineering corpus slots from previously-Session-shape entries.

**`eval-baseline-current` git tag (created by Plan C Phase 00)** is the worktree reference for Plan C Phase 10 baseline runs and the future separate A/B eval plan.

## Cross-plan lessons-learned log (rolling)

Append entries here when Plan A's outcomes inform Plan B, when Plan B's empirical findings reshape Plan C, or when any plan's discoveries warrant an architectural update across the initiative.

| Date | Plan | Discovery | Impact on other plans |
|---|---|---|---|
| _none yet_ | | | |

## What this initiative does NOT include

- **Full A/B evaluation experiment** — separate plan post-initiative, ~34–40h, consumes Plan C's corpus + baseline outputs. Builds `scripts/eval-runner.mjs`, scales to N=5×12 = 60 runs per arm, runs hybrid LLM-as-judge + 20% human spot-check grading, writes `docs/eval-results.md`.
- **AP catalog expansion beyond the 5–10 budget** capped in Plan B's non-goal #1 — separate plan if Plan B Phase 0 finds catalog-gap rate >20%.
- **Vector embeddings, file watchers, `impact` / `rename` graph tools, LLM-generated cluster summaries** — Phase 2 follow-ups detailed in Plan A.

## Status legend

- **pending** — plan written, no commits yet
- **in-progress** — at least one phase committed; mid-plan
- **shipped** — all phases complete, merged to `main`
- **blocked** — paused on a cross-plan dependency or empirical finding

## Maintenance

Update the **Status** column in the plans table after every checkpoint merge. Append to **Lessons-learned** whenever a plan finishes and its retrospective produces an insight that affects sibling plans. When all three plans ship, this initiative doc gets archived to `docs/initiatives/archive/` with a final summary appended.
