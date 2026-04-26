<!-- graph metadata for docs knowledge graph (see docs/knowledge-graph.md) -->
---
type: spoke
id: design-playground-consistency
topics:
  - design
  - playground
derivedFrom:
  - design.md
---

# Playground Consistency Principles

> Spoke file for `docs/design.md`. Return to the [hub](../design.md) for the Section Index.

**Source:** Session 2026-03-29, color page UI audit.

### 14.1 One Conceptual Element = One Visual Treatment

When the same conceptual element (e.g., "a color swatch") appears multiple times on a page, every instance must share the same dimensions, border treatment, and interaction pattern. Different data sources (semantic tokens, palette scales, interaction tokens) are not a justification for different visual presentations. The audience sees "color swatches" — not "EmphasisSwatch vs. ColorSwatch vs. inline card."

Concrete rule: A swatch is `w-12 h-12` (48px, fixed intrinsic size) with `rounded-sm border border-border/50`. Swatch size must never be grid-derived — use `flex flex-wrap gap-1.5` containers so item count and container width cannot inflate dimensions. All swatches use the same `ColorSwatch` component with hover overlay + click-to-copy. No "display-only" variants. No `large` variant. No inline card alternative. One element, one treatment, one interaction.

**Focus ring clearance (FB-066):** The swatch button must include `p-0.5` (2px padding) around the swatch content, with total outer width `w-[52px]`. This reserves space for `focus-visible:ring-2` so the ring is never clipped by adjacent elements or container edges. An interactive element without room for its focus indicator is incomplete — see AP-039.

### 14.2 User-Centric Information Filtering

Every piece of information displayed in the playground must pass the audience filter: **"Does the consumer of this design system need to see this?"**

- **Show:** Current token name, current value, usage guidance, accessibility notes.
- **Don't show:** Legacy names, migration history, internal refactoring notes, version diffs.

Historical information belongs in changelogs, git history, and `docs/` — not in the product surface. The playground is a product, not a developer console.

### 14.3 Metadata as Footnotes

System-level metadata (version, last updated, build environment) belongs in a page footer — never inline with token content. It should be visually subordinate: `text-xs`, `font-mono`, reduced opacity. On localhost, prefix with "Local Dev" to distinguish from published builds.

### 14.4 Production Sync Obligation

The playground is both a documentation surface AND an experimentation surface. When a design experiment in the playground advances a component or token beyond what production implements, the production codebase MUST be updated in the same session. Conversely, when production adds or modifies a component, the playground demo MUST be updated in the same session.

**Rule:** A playground experiment that isn't propagated to production (or vice versa) within the same session is a parity violation (see EAP-030). The Cross-App Parity Checklist in `AGENTS.md` is bidirectional — it applies in both directions.
