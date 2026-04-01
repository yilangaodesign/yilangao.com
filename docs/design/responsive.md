# Responsive Design

> Spoke file for `docs/design.md`. Return to the [hub](../design.md) for the Section Index.

**Source:** Session 2026-03-30, comparative analysis of IBM Carbon, Goldman Sachs OneGS, and Tailwind v4 breakpoint systems. Audited for enterprise B2B SaaS requirements: small phones through ultrawide monitors, with variable information density at any viewport.

### 6.1 Breakpoint Scale (6-Tier)

**Status: PLANNED — awaiting confirmation before implementation.**

The design system uses a **6-tier mobile-first breakpoint scale**. Values were selected by auditing IBM Carbon (5 tiers, enterprise-proven), OneGS (5 tiers, device-oriented), and Tailwind v4 defaults (5 tiers, general web). The unified scale cherry-picks the best from each while addressing gaps none of them cover (ultrawide enterprise monitors).

| Tier | SCSS Token | CSS Custom Property | Value | Columns | Origin | Rationale |
|------|-----------|-------------------|-------|---------|--------|-----------|
| `xs` | `$elan-bp-xs` | `--breakpoint-xs` | 375px | 4 | OneGS | Modern smallest phone (iPhone SE). Replaces Carbon's obsolete 320px. |
| `sm` | `$elan-bp-sm` | `--breakpoint-sm` | 672px | 8 | Carbon | Large phone landscape / small tablet. Column count doubles (4→8). |
| `md` | `$elan-bp-md` | `--breakpoint-md` | 1056px | 16 | Carbon | Standard laptop. Column count doubles again (8→16). Primary desktop target. |
| `lg` | `$elan-bp-lg` | `--breakpoint-lg` | 1440px | 16 | OneGS | Common laptop resolution (MacBook Pro 15"). Same column count, wider columns. |
| `xl` | `$elan-bp-xl` | `--breakpoint-xl` | 1920px | 16+ | OneGS | Full HD monitor. Most common enterprise desktop viewport. |
| `2xl` | `$elan-bp-2xl` | `--breakpoint-2xl` | 2560px | 16+ | New | QHD / ultrawide. Increasingly common in enterprise with external monitors. |

**Column logic:** Columns double at major layout shifts (4→8→16) following Carbon's 2x Grid principle. Above `md` (1056px), column count stays at 16 — wider viewports get wider columns, not more columns (unless a grid influencer reduces available space). Above `xl`, layouts may optionally add columns in increments of 2.

**Migration from current tokens:** The `$portfolio-bp-*` prefix will be renamed to `$elan-bp-*` to match the design system name. Old token names will be aliased during transition.

| Current token | Current value | New token | New value | Change |
|---------------|---------------|-----------|-----------|--------|
| `$portfolio-bp-sm` | 320px | `$elan-bp-xs` | 375px | Renamed + value updated |
| `$portfolio-bp-md` | 672px | `$elan-bp-sm` | 672px | Renamed only |
| `$portfolio-bp-lg` | 1056px | `$elan-bp-md` | 1056px | Renamed only |
| `$portfolio-bp-xl` | 1312px | — | — | **Dropped** (too close to both 1056 and 1440) |
| `$portfolio-bp-2xl` | 1584px | — | — | **Replaced** by `$elan-bp-xl` at 1920px |
| — | — | `$elan-bp-lg` | 1440px | **New tier** |
| — | — | `$elan-bp-xl` | 1920px | **New tier** |
| — | — | `$elan-bp-2xl` | 2560px | **New tier** |

### 6.2 Design Decisions and Trade-offs

**Why 6 tiers instead of 5:** Enterprise B2B users work on 1440px laptops, 1920px external monitors, and 2560px ultrawides. These are three genuinely different workspace contexts — a dashboard that works at 1440px wastes half the screen at 2560px, and a layout optimized for 2560px is unusably cramped at 1440px. Five tiers (like Carbon or OneGS) force at least one of these into "above max" territory with no explicit design target.

**Why 1312px was dropped:** It sits only 256px above 1056px and 128px below 1440px. In practice, layouts that change at 1056 don't need to change again at 1312 — the next meaningful shift is at 1440 where laptop screens give way to external monitors. Carbon uses 1312 because its max-width container is 1584px and 1312 provides a pre-max tier, but with our max at 1920, that logic no longer applies.

**Why 1584px was dropped:** Carbon's "max" at 1584px (99rem) was designed when 1080p was the dominant enterprise display. Today, 1920px Full HD is the baseline for enterprise monitors, not the ceiling. Keeping 1584px as a tier would create a breakpoint that triggers on almost no real device boundary.

**Why 375px instead of 320px:** The smallest phone in active circulation (iPhone SE) has a 375px viewport. 320px hasn't been a real device width since iPhone 5 (discontinued 2016). Using 320px wastes the mobile tier on a nonexistent device. OneGS correctly starts at 375px.

### 6.3 Density Modes (Gutter System)

**Adopted from Carbon.** Information density is orthogonal to viewport size — a 1920px monitor might show a spacious editorial page or a cramped data table. Breakpoints control *layout*; density modes control *spacing within that layout*.

| Mode | Gutter | Use Case |
|------|--------|----------|
| **Comfortable** (default) | 32px | Editorial content, reading-heavy pages, settings panels |
| **Compact** | 16px | Data tables, dashboards, form-heavy admin screens, side panels |
| **Condensed** | 1px (with `$border-subtle`) | Dense dashboards, resource catalogs, tile overviews |

Density modes are applied via a class on a container (e.g., `.density-compact`), not via breakpoints. A single page can mix modes: a side panel in compact mode next to a content area in comfortable mode.

**This is the solution for "big screen, dense content."** At `xl` (1920px), a dashboard can use condensed gutter mode to pack information tightly, while the same viewport shows a case study in comfortable mode. The breakpoint stays the same; the density changes.

### 6.4 Grid Influencers

**Adopted from Carbon.** A grid influencer is a UI element (left nav, slide-in panel) that reduces the available grid width when present. The grid reflows into the remaining space — column count stays the same but columns narrow, or the effective breakpoint downgrades.

This is critical for enterprise B2B SaaS because:
- Products almost always have a persistent left navigation (sidebar)
- Slide-in panels for detail views, configurations, and wizards are ubiquitous
- The content grid must respond to the *available* width, not the *viewport* width

**Implementation approach:** Use CSS container queries on the content area rather than viewport media queries for components inside grid-influenced regions. This way, a component in a 800px-wide content area behaves the same whether the viewport is 1440px (with a 640px sidebar) or 800px (full width on a small screen).

### 6.5 Container Widths

Container tokens define the max-width of content areas. They are intentionally **not** aligned 1:1 with breakpoint names to avoid the naming collision in the current system.

| Token | Value | Use |
|-------|-------|-----|
| `$elan-container-narrow` | 672px | Long-form reading, blog posts, narrow forms |
| `$elan-container-default` | 1056px | Standard content pages, case studies |
| `$elan-container-wide` | 1440px | Dashboards with moderate density |
| `$elan-container-full` | 100% | High-density interfaces, data tables, full-bleed layouts |

**Key change:** Containers now use semantic names (`narrow`, `default`, `wide`, `full`) instead of size labels (`sm`, `md`, `lg`, `xl`). This eliminates the current collision where `container-sm` (672px) maps to `bp-md` (672px).

### 6.6 Cross-App Unification

All three apps must use the same breakpoint values. See AP-038 for why mixed systems are an anti-pattern.

**Implementation plan:**

1. **SCSS source of truth** (`src/styles/tokens/_breakpoints.scss`): Define the 6-tier `$elan-bp-*` tokens + media query helpers
2. **Playground `globals.css`**: Add `--breakpoint-xs: 375px` through `--breakpoint-2xl: 2560px` to the `@theme` block
3. **ASCII Tool `globals.css`**: Same `--breakpoint-*` overrides
4. **Replace hardcoded values**: Kill `640px` in AdminBar, `768px` in experiments, `768/1200` in typography comments — all become token references
5. **Playground tokens page**: Create `/tokens/breakpoints` preview page and add sidebar entry
6. **Sync script**: `npm run sync-tokens` must include breakpoint data in `playground/src/lib/tokens.ts`

### 6.7 Content Containers (Existing Guidance, Retained)

- Add `overflow-x-auto` to any table or grid that might exceed viewport width.
- Mobile: Content must be usable without the sidebar visible (sidebar slides in as overlay).

### 6.8 Fluid, Not Fixed (Existing Guidance, Retained)

Avoid hardcoded pixel widths for content areas. Use `flex-1 min-w-0` to let content fill available space naturally.

### 6.9 Container Queries for Component-Level Responsiveness

For components that live inside grid-influenced regions (next to sidebars, inside panels), prefer CSS `@container` queries over `@media` queries. This ensures the component responds to its actual available space, not the viewport.

```scss
.card-grid-wrapper {
  container-type: inline-size;
}

@container (min-width: 672px) {
  .card-grid { grid-template-columns: repeat(2, 1fr); }
}
@container (min-width: 1056px) {
  .card-grid { grid-template-columns: repeat(3, 1fr); }
}
```
