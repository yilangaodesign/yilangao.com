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
| **A — Foundation** | `.cursor/plans/docs_kg_foundation_a1f3e7c2.plan.md` | ~30–40h | **complete + remediated (2026-04-26)** | Graph build/query/MCP infrastructure, anchors on AGENTS.md + anti-patterns + spokes + skills + rules + release logs + cross-cutting refs, audits, Guardrail 27, Obsidian config, **anchor-scoped edge extraction**, **MCP server registered**, **postinstall graph build** |
| **B — Feedback Log AP-Tagging** | `.cursor/plans/feedback_log_ap_tagging_b4d8c91e.plan.md` | ~35–65h | **complete + remediated (2026-04-26)** | Feedback log anchors (568/568, 100%) + engineering Session retrofit + 319 AP/EAP/CAP citations with confidence + raw and weighted tagging-rate audits + post-remediation "By recurrence" view in `MaturityTimeline` + Obsidian Canvas exports for typed-graph review (ENG-231 + ENG-232 — built on Plan B's foundation, scoped as initiative deliverable rather than Plan B Phase) |
| **C — Evaluation Handle** | `.cursor/plans/docs_kg_eval_handle_c7e2a5f9.plan.md` | ~5–6h | Phase 00 complete; corpus + baselines pending | `eval-baseline-current` git tag + 12-task eval corpus + 9-run baseline capture procedure |

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
| 2026-04-25 | C | Phase 00 strict precondition `git status --porcelain` empty was relaxed at tag time. Two unrelated files (`docs/engineering.md` frequency map row removal, `docs/release-log.md` REL-028 entry removal) had uncommitted user-WIP revert work, semantically orphan to the initiative. Tag references the HEAD commit only — git tags do not capture working-tree state — so eval baseline correctness is unaffected. SHA `56f8760` tagged at `2026-04-25T23:44:43-04:00` and pushed to origin. | None on Plans A or B. Future operators of Phase 00: relax the precondition to "no uncommitted changes that affect docs/, .cursor/skills/, .cursor/rules/, AGENTS.md, or CLAUDE.md" rather than the strict global empty-tree check, OR commit/stash unrelated WIP first. The strict global check was over-conservative for the actual semantic risk (initiative-related WIP would contaminate the baseline; unrelated WIP cannot). |
| 2026-04-26 | A | Markdown-link edge resolution in `scripts/build-graph.mjs` originally used a basename-stripping heuristic, producing 50+ phantom-anchor errors after Phase 7a wired up `checkBrokenAnchors`. Fix: built a path -> nodeId map in pass 1 and resolved links against it in pass 2; fallback returns `null` so out-of-scope links (e.g., `../src/lib/foo.ts`) drop instead of polluting the graph. | Plan B's feedback-log anchor pass should produce edges that resolve cleanly against the same map (frontmatter `id` is canonical). If a Plan B markdown link does not resolve, it points to a file outside the watched docs scope and should be intentional or rewritten. |
| 2026-04-26 | A | `audit-docs.mjs` `checkSectionIndex` originally validated only cell-1 of each Section Index row as a local heading, generating 55 false errors against the 3 hub files whose Section Index columns are markdown links to spoke files. Fix: detect any external markdown link on a row and skip local-heading validation for it; `checkCrossReferences` already validates link targets exist. Same code regions are now stripped in `checkCrossReferences` (inline + fenced code) so example markdown in `docs/knowledge-graph.md` and feedback-log entries quoting broken markdown no longer count as real links. | None on Plans B/C beyond the parsing improvement. Future audit checks that walk markdown links should call `stripCodeRegions(content)` first; the helper is in `scripts/audit-docs.mjs`. |
| 2026-04-26 | A | Topic vocabulary cap (35) was reached during Phase 7a after measuring drift across all annotated files. The 7 added terms (`interaction`, `knowledge-graph`, `port-registry`, `portfolio`, `projects`, `system-architecture`, `voice`) had multiple uses each. 12 single-use drift terms remain as warnings rather than silently extending the cap. | Plan B's spoke-targeted feedback annotation should reuse existing terms; if a feedback entry's topic genuinely doesn't fit, propose a vocabulary update via this lessons-learned log + `docs/knowledge-graph.md` §9 (and bump the cap deliberately). |
| 2026-04-26 | A | `package.json` devDependencies were missing `@modelcontextprotocol/sdk`, `graphology`, `graphology-communities-louvain`, `js-yaml`, `lunr`, `zod` — the lockfile had them but the manifest didn't. Added them so `npm ci` doesn't fail in CI/fresh-clone scenarios. | None on Plans B/C — but reminder for any future plan: when adding scripts that consume new packages, verify both `package.json` AND `package-lock.json` are updated before considering the phase done. |
| 2026-04-26 | A | **Plan A delivered structurally but not semantically.** Initial pass extracted 1450 edges, 88% of them just file-level `documents`/`documentedBy` from anchor containment. 100% of anti-patterns appeared "orphan" because no extractor wrote `enforces` edges, and citations like `guardrail-engineering-13` saying `See EAP-013` were attributed to the file (`AGENTS`) instead of the guardrail anchor — losing the entire reason anchors exist. **Root cause vs GitNexus:** GitNexus's edges are *semantic causal relationships* (function call, import, inheritance) extracted at *symbol granularity* via Tree-sitter; ours started as *table-of-contents annotations* extracted at *file granularity*. The discrepancy was an architectural mismatch, not a parser bug. **Fix in `scripts/build-graph.mjs`:** (1) **Body-anchor segmentation** — `buildSegmenter()` maps every body offset to the nearest preceding anchor, so citations attribute to anchors not files; (2) **Expanded citation regex** — `STRONG_CITATION_RE` now catches lowercase `see`, parenthesized `(EAP-027)`, and adds `FB`/`CFB`/`ENG`/`REL` prefixes; `BARE_ID_RE` catches every unannotated ID mention with confidence 0.5; (3) **Edge-type inference** — when a `guardrail`/`skill`/`rule` cites an anti-pattern, the emitted edge is `enforces` (not `references`), populating the `enforcedBy` inverse on every cited AP; (4) **Frontmatter coercion** — same rule for `references:` entries in skill/rule frontmatter pointing at APs. **Result:** edges 1450 → 4164 (2.9x), `enforces` 10 → 43, AP coverage 0/214 → 201/214 with 13 truly-orphan APs surfaced as actionable WARN; the audit now distinguishes "no inbound at all" (WARN) from "no enforcer" (INFO, documentation gap). MCP server registered in `.cursor/mcp.json`. `postinstall` script auto-builds the graph on fresh clones. Topic vocab cap raised 35 → 39 with documented growth principle ("2+ distinct uses OR core retrieval surface; vague variants fold into existing terms"). | **Plan B**: feedback log entries already produce correct anchor-scoped citations once anchors are added — the segmenter handles `### FB-NNN` headings as segment boundaries automatically. The 175 "no enforcer" INFO signals are exactly what Plan B should resolve by tagging guardrails/skills against APs. **Plan C**: the eval-baseline tag was made before this remediation, so the baseline reflects the pre-fix structure — this is **correct**, since the A/B eval will compare pre-graph behavior against post-graph behavior, and this fix is part of the post-graph treatment arm. |

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
