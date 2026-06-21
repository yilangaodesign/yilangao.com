<!-- graph metadata for docs knowledge graph (see docs/knowledge-graph.md) -->
---
type: spoke
id: design-data-grid
topics:
  - design
  - accessibility
  - engineering
derivedFrom:
  - design.md
references:
  - engineering.md
---

# Data Grid

> Spoke file for `docs/design.md` (and cross-referenced from `docs/engineering.md` — the engine + substrate choices are engineering decisions). Return to the [design hub](../design.md) or the [engineering hub](../engineering.md) for the Section Indexes.
>
> **What this is:** The durable decision record + conventions for the Élan `DataGrid` (`src/components/ui/DataGrid/`). It is the canonical memory: the `.plan.md` that produced v1 is an ephemeral execution vehicle; this spoke is what survives. v2 planning should regenerate from the "Deferred / v2" section below, not from the discarded plan.

## Overview

`DataGrid` is the Élan DS's higher-level, behavioral table component, modeled on the Goldman Sachs "One GS / Data Grid" Figma anatomy. It pairs **headless TanStack Table v8 logic** with a **bespoke, token-driven div-based ARIA grid** render layer (so the look is 100% Élan tokens, including zero corner radius). The simpler presentational `Table` primitive (`src/components/ui/Table/`) stays as-is for static tables; `DataGrid` is the new component for sorting / filtering / selection / pagination and (later) the advanced behaviors.

**v1 shipped:** full presentational layer (size × density × alignment × cell-content × status × background) + sorting (`aria-sort`), per-column filtering, row selection (Élan `Checkbox`), pagination, and the WAI-ARIA grid keyboard pattern. It is a `"use client"` component.

<a id="design-data-grid-adr-001"></a>
## ADR-001: DataGrid engine — TanStack Table v8 over AG Grid

**Status:** Accepted (2026-06-21). **Decision owner:** Yilan Gao. **Drafted by:** engineering pairing session.

### Context

The Élan DS needs a `DataGrid` that (a) can reproduce — or freely deviate from — the Goldman Sachs "One GS" Figma visual anatomy, and (b) supports the full behavioral set: sorting, per-column filtering, row selection, pagination, column resize/reorder, sticky header/columns, virtualization, inline cell editing, and expandable rows. The Figma is an explicit *reference only*. The deliverable is a design-system component showcased in the playground (portfolio / job-application context), not a funded production BI app.

The fundamental axis of the decision is **who owns the rendering**: a headless library (we own all DOM + CSS) versus a batteries-included grid (the library owns DOM + theming, we override).

### Decision drivers

- **Design control / brand fidelity** — the component's *design* is the product. Cells must render existing Élan primitives (`Badge`, `Button`, `Input`, `ProgressBar`, `Checkbox`) and honor Élan SCSS tokens (incl. zero corner radius). Unconstrained styling freedom is a hard requirement.
- **Feature coverage** — must support the full behavioral set above.
- **Scale story** — must *credibly demonstrate* enterprise-grade data volumes in a showcase.
- **Cost** — solo developer, portfolio context; recurring per-seat licensing is hard to justify.
- **Fit with the codebase** — React 19, Next 16, SCSS modules, no CVA/`cn()`, `@dnd-kit` already present.

### Options considered

**Option A — TanStack Table v8 (`@tanstack/react-table`) + `@tanstack/react-virtual` [CHOSEN]**

- Headless: ships zero markup and zero CSS. We author 100% of the DOM and styling.
- MIT, ~14kb, tree-shakeable, React 19 native.
- First-class support for every behavior in scope; virtualization via the sibling `react-virtual`.
- Server-side scale via `manual*` modes (the library tracks sort/filter/page *state*; we fetch the matching slice).
- Pros: total design freedom (matches Figma *or* a bespoke look equally well); reuses Élan primitives directly inside cells; no theme bridge; no license; aligns with existing conventions.
- Cons: we hand-build the render layer and CSS. For this project the render layer *is* the deliverable, so this "cost" is the work we want to be doing.

**Option B — AG Grid (Community or Enterprise) [REJECTED]**

- Renders its own DOM and ships its own theming system (`--ag-*` variables / Theming API); customization beyond what the theme exposes means fighting internal class names.
- AG Grid *Community* (free, MIT) ≈ TanStack's capability envelope for this use case — but still imposes AG Grid's DOM/theme, the opposite of a token-driven DS goal.
- The features that would *justify* AG Grid — Server-Side Row Model, row grouping, aggregation, pivot tables, Excel export, advanced filtering — are all **Enterprise (paid)**.
- Cons: styling friction against Élan tokens; heavier footprint; differentiating features paywalled; "looks like AG Grid" undercuts a design-system showcase.

**Option C — Fully from scratch [REJECTED for logic / ADOPTED for rendering]**

- Reimplementing sort/filter/selection/pagination/virtualization *state* is error-prone, low-value busywork.
- We *do* hand-build the render layer. The split is deliberate: borrow proven logic, own the presentation.

### Cost analysis (AG Grid, mid-2026)

- **Community:** free (MIT), production-allowed — but lacks enterprise features and still constrains styling.
- **Enterprise:** ~**$999 / developer** (model in flux; some resellers bill ~$999/yr).
- **Enterprise Bundle** (Grid + Charts): ~**$1,498 / developer**.
- **Org deals:** ~**$7k/yr (SMB)** to ~**$35k/yr (enterprise)**.
- Key point: paying for Enterprise buys server-side BI machinery a DS *component* does not own. Zero of that spend is visible to a portfolio reviewer.

### Scale: does TanStack cover "enterprise-grade massive data"?

- **Client-side large (~100k+ rows in memory):** yes — `react-virtual` windows the DOM so scroll/sort/filter stay smooth.
- **Server-side / unlimited rows:** yes, via `manualSorting/Filtering/Pagination` + a data layer (e.g. TanStack Query). The library owns state; we own the fetch.
- **Turnkey server-side grouping / pivot / aggregation / export over millions of rows:** the one place AG Grid *Enterprise* is genuinely superior with less custom code. Out of scope for an Élan DS primitive.

### Decision

Adopt **TanStack Table v8 for state/logic + a bespoke Élan-styled presentational layer**, with `@tanstack/react-virtual` for virtualization (v2). Keep the existing presentational `Table` untouched for simple static tables; `DataGrid` is the new higher-level behavioral component.

### Consequences

- We own and maintain the entire render layer and its CSS — accepted, because that is the deliverable.
- The enterprise-scale story is demonstrated with a virtualized large-sample-data showcase rather than a paid SSRM.
- No new licensing or recurring cost; bundle stays small; full alignment with Élan tokens and existing conventions.

### Revisit triggers

- A real, funded product needs turnkey pivot / row grouping / aggregation / Excel export over millions of *server-side* rows, and engineering time on TanStack exceeds the AG Grid Enterprise license cost.
- The render-layer maintenance burden materially outweighs the design-control benefit across many grid instances.

<a id="design-data-grid-adr-002"></a>
## ADR-002: Rendering substrate — div-based `role="grid"` (not native `<table>`)

**Status:** Accepted (2026-06-21). Surfaced by the plan-audit pressure test.

### Context

The locked feature set includes **virtualization, sticky header/columns, and column resizing**. Native `<table>` semantics make these hard-to-impossible: row-windowing breaks `<tbody>` flow, and sticky/resizable columns fight table layout. TanStack Table is render-agnostic and its own virtualization examples use a div-based grid.

### Decision

Render `DataGrid` as a **div-based ARIA grid**: `role="grid"` / `role="row"` / `role="columnheader"` / `role="gridcell"`, with CSS grid/flex layout. The existing semantic `<table>` `Table` primitive stays as-is for simple static tables; `DataGrid` deliberately does not reuse its DOM (only its visual palette — header tint, separators, numeric/accent treatments).

### Consequences

- **Accessibility is a first-class, non-optional work item**, not an afterthought. We implement the WAI-ARIA grid pattern: roving `tabindex`, arrow-key cell navigation, `Home`/`End`/`PageUp`/`PageDown`, dual-mode focus (navigation vs actionable), and correct ARIA state (`aria-sort`, `aria-selected`, `aria-rowcount`/`aria-colcount`). Tracked in `use-grid-keyboard.ts`.
- `DataGrid` is a `"use client"` component (hooks), diverging from the server-safe `Table`.
- Visual parity with the GS Figma is unaffected — the look is reproduced in CSS regardless of substrate.

## Prop-naming decisions

- **`numeric` (not `mono`).** Per [guardrail-design-8](../../AGENTS.md#guardrail-design-8), props are named by *intent*, not implementation. The legacy `Table` exposes a `mono` cell prop; `DataGrid` instead uses `numeric` on `ColumnDef.meta` — it means "numeric column: right-align + tabular figures." Do not propagate `mono` to `DataGrid`.
- **`zebra` (kept, documented exception).** `zebra` is retained as the canonical prop name despite being closer to a visual term, because it mirrors the GS Figma property exactly and reads unambiguously. Synonyms (`striped`, `banded`, `alternating`) live in the playground search layer (`keywords` on the sidebar nav entry), **not** the prop API.
- **Feature flags are intent-named:** `enableSorting`, `enableFiltering`, `enableRowSelection`, `enablePagination`, `stickyHeader`.

## Density → row-height mapping

Density names align with the layout-density vocabulary, but the **values do not come from `$portfolio-spacer-layout-*`** (those are page/section spacing, not cell metrics). Cell row-heights and vertical padding are expressed as **Tier-1 spacer tokens** (the GS Figma symbol heights, snapped to the nearest 8px-grid step so nothing is a raw literal). They are assigned to component-local CSS custom properties in `DataGrid.module.scss` (component-level — no `src/styles/tokens/` change, so no `sync-tokens` needed):

| Density | Row height (`--dg-row-h`) | Vertical padding (`--dg-pad-y`) |
|---|---|---|
| `x-compact` | `spacer-3x` (24px) | `spacer-0-25x` (2px) |
| `compact` | `spacer-4x` (32px) | `spacer-0-5x` (4px) |
| `standard` (default) | `spacer-5x` (40px) | `spacer-1x` (8px) |
| `spacious` | `spacer-6x` (48px) | `spacer-1-5x` (12px) |

**Size** is an orthogonal axis controlling font size + horizontal padding: `sm` (`type-2xs` / `spacer-1-5x`), `md` (`type-xs` / `spacer-2x`), `lg` (`type-sm` / `spacer-2-5x`). Density = vertical rhythm; size = horizontal + type.

**Token discipline (FB-248 / EAP-126):** every visual value resolves to a token — borders via `--portfolio-border-width-thin`, corners via `--portfolio-radius-none`, line-height via `--portfolio-leading-snug`, focus ring via `--portfolio-border-width-regular`, and the header font tracks `--dg-font` (it was previously a fixed 10px, smaller than the body, which inverted the hierarchy). Header cells inherit `.cell` padding rather than zeroing it, so non-sortable headers (select / action columns) are no longer jammed against the edge — matching the canonical `Table` head treatment.

## Cell-content conventions

Every GS cell archetype maps to a renderer in `cell-renderers.tsx` that **composes an existing Élan primitive — never reinvents it**:

| Archetype | Renderer | Composes |
|---|---|---|
| Text | `TextCell` | single-line ellipsis `<span>` |
| Multi-line text | `MultiLineTextCell` | 2-line clamped `<span>` |
| Progress | `ProgressCell` | `ProgressBar` (size `sm`, `showValue`) |
| Badge | `BadgeCell` | `Badge` (`shape="squared"` for zero radius) |
| Button | `ButtonCell` | `Button` (size `xs`) |
| Input | `InputCell` | `Input` (size `xs`; reuses its `status` axis) |
| Slot | `SlotCell` | arbitrary children |

Per-cell `status` (success/warning/error tint + left accent) and `background` (neutral-subtle/neutral-regular fill) are set via `ColumnDef.meta` and applied by `DataGridCell`. Lucide icons inside the grid (sort caret, pager chevrons) MUST use individual imports (`lucide-react/dist/esm/icons/<name>`), never the barrel — the playground bundles `@ds/DataGrid` and Turbopack's `optimizePackageImports` causes SSR/client icon mismatches with barrel imports (see [EAP-056](../engineering-anti-patterns.md#eap-056)).

<a id="design-data-grid-deferred-v2"></a>
## Deferred / v2

v2 is **not built**. It is tracked in [`docs/backlog.md`](../backlog.md#backlog-data-grid-v2) and a starting-point plan (`.cursor/plans/elan_data_grid_v2_advanced.plan.md`). Regenerate full v2 planning from this section. Scope:

- **Column resize** and **column reorder** (`@dnd-kit/*`, already a repo dependency).
- **Sticky columns** (header sticky already shipped in v1 via `stickyHeader`).
- **Virtualization** (`@tanstack/react-virtual`) + `aria-rowcount`/`aria-colcount` for windowed rows. Note: virtualization is substrate-invasive — its placement in this list does not dictate build order; consider building it first (or re-validating other features against it).
- **Inline cell editing** (`InputCell` in an editable mode). Hazard: when a virtualized row unmounts, in-flight edit state must be committed or preserved, or edits silently drop.
- **Expandable rows.**
- **Re-harden a11y for virtualization** — v1 keyboard nav assumes fully-rendered rows; windowing unmounts off-screen cells, so v2 must add focus restoration (track focused cell by row/col id, re-focus on remount).

**Dependencies to add when built (both manifests):** `@tanstack/react-virtual` + `@dnd-kit/*` in BOTH `ds-package/package.json` and `playground/package.json` (the playground does not hoist from root).

**API additivity:** the v2-marked props (`enableColumnResizing`, `enableColumnReordering`, `enableExpanding`, `virtualized`) are reserved in the API sketch so v2 lands as an additive, non-breaking change.
