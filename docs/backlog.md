<!-- graph metadata for docs knowledge graph (see docs/knowledge-graph.md) -->
---
type: cross-cutting
id: backlog
topics: [engineering, playground, search]
references:
  - engineering.md
---

# Backlog — Deferred Cross-Cutting Tasks

> **What this file is:** A flat, append-only ledger of deferred cross-cutting
> tasks that don't yet justify a full plan but must not be forgotten. It is a
> spoke — read only when relevant, never loaded by default. Each entry is kept
> terse (title, date, origin, pointer) to avoid context bloat.
>
> **When to add:** When a task is identified mid-work but is out of scope for
> the current effort, and there is no better home for it (a plan, an
> anti-pattern, a feedback log). Keep entries to ~4 lines.
>
> **When to remove:** When the task is completed or promoted into a standalone
> plan, delete the entry (or mark it `Done` with the date) so the ledger stays
> a live list of *open* work.

---

<a id="backlog-keywords-backfill"></a>
## Backfill `keywords` search metadata for all playground components

- **Added:** 2026-06-21
- **Origin:** DataGrid v1 (Élan Data Grid plan). The playground sidebar search
  (`Fuse` in `playground/src/components/sidebar.tsx`) gained an optional
  `keywords?: string[]` field and a `"keywords"` Fuse key. Only the DataGrid
  nav entry is seeded so far.
- **Task:** Seed `keywords` (synonyms / alternate names) on the remaining nav
  entries so every component is discoverable by synonym, not just by label.
- **Pointer:** `playground/src/components/sidebar.tsx` (`componentCategories`,
  `fuseInstance`).

---

<a id="backlog-data-grid-v2"></a>
## Élan DataGrid v2 — advanced behaviors

- **Added:** 2026-06-21
- **Origin:** Élan Data Grid plan shipped v1 (presentational + sort / filter /
  select / paginate + WAI-ARIA keyboard). v2 was deliberately deferred.
- **Task:** Column resize, column reorder (`@dnd-kit/*`), sticky columns,
  virtualization (`@tanstack/react-virtual` + `aria-rowcount`/`aria-colcount`),
  inline cell editing, expandable rows, and re-hardened a11y for windowed rows
  (focus restoration on remount). Add `@tanstack/react-virtual` + `@dnd-kit/*`
  to both `ds-package/package.json` and `playground/package.json` when built.
- **Pointer:** Durable spec in [`docs/design/data-grid.md`](design/data-grid.md#design-data-grid-deferred-v2);
  starting-point plan `.cursor/plans/elan_data_grid_v2_advanced.plan.md`.
