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

### 6.10 Desktop Min-Width Floor — Content Only, Functional Chrome Stays Fluid

**Policy.** On the public portfolio site (`src/app/(frontend)/(site)/**`), at `@media (pointer: fine)` AND viewport < `$elan-bp-sm` (672px):

- **Page content** (`.contentAreaInner`) gets `min-width: 672px` and the parent `.contentArea` becomes an `overflow-x: auto` scroll container. Desktop users who drag the browser narrower see a horizontal scrollbar inside the content region instead of the desktop composition collapsing into the phone layout.
- **Functional chrome** (Navigation, SiteFooter) stays fluid to the actual viewport width and falls back to its mobile layouts via its own `$elan-mq-sm` media queries. Nav remains usable; the footer collapses to its centred single-column stack (FB-144).

**Why the split.** An earlier version of this policy (FB-147) put the min-width floor on `.siteWrapper`, which pinned the *entire* layout (nav + content + footer) to 672px at narrow viewports. The symptom: at 400px viewport on desktop, the footer rendered in its desktop layout inside a 672px-wide wrapper, even though only 400px of it was visible without horizontal scrolling. The user had to scroll sideways to reach the right side of the footer, which is exactly wrong for functional chrome — the footer contains the contact address and social links, which must be reachable at any width. The split (FB-149) restores that invariant: content can opinionate about its minimum width, chrome must not.

**Scope boundary.** This rule lives in `src/app/(frontend)/(site)/layout.module.scss` and applies only inside the `(site)` route group. Unaffected:
- Payload admin (`src/app/(payload)/**`)
- Company login gate (`src/app/(frontend)/for/**`)
- API routes
- Playground or ASCII Studio apps

**Why `pointer: fine` instead of `min-device-width`.** `pointer: fine` is the modern signal for "mouse-driven input" and correctly distinguishes desktop from phones and tablets. User-agent sniffing is brittle; `min-device-width` is deprecated. A small laptop with a touchscreen will report `pointer: coarse` on the primary pointer if touch is preferred, which is the right behavior — treat it like a tablet.

**Structural pattern.**

```scss
.siteWrapper {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  // NO min-width here — chrome must stay viewport-sized
}

.contentArea {
  flex: 1;
  min-width: 0; // allow flex shrink below intrinsic width
}

@media (pointer: fine) and (max-width: #{$elan-bp-sm - 1px}) {
  .contentArea {
    overflow-x: auto; // contain overflow inside this region
  }
  .contentAreaInner {
    min-width: $elan-bp-sm; // 672px floor, applied to inner wrapper
  }
}
```

The inner wrapper is required: if `min-width` is applied directly to `.contentArea`, its parent grows to accommodate it (flex distribution) and nav/footer grow with it — the exact symptom we're trying to avoid.

**Side effect at narrow desktop.** `overflow-x: auto` on `.contentArea` implicitly promotes `overflow-y` to `auto` per the CSS spec. At narrow desktop only, this means the content region scrolls vertically inside itself rather than at the document level. The sticky-bottom footer reveal pattern becomes a "footer always pinned to viewport bottom" pattern. This is the correct behavior for this zone: the user is outside the supported composition, so the chrome being always-visible is a better fallback than the reveal animation. At viewport ≥ 672px, the media query does not fire, so document scroll and sticky reveal work as designed.

**Accessibility caveat.** WCAG 1.4.10 (Reflow) asks that content reflow to 320 CSS pixels without horizontal scroll. Forcing horizontal scroll on desktop content technically relaxes this *for zoomed-in sighted users* (zoom to 200% on a 1280px monitor produces a 640px effective viewport, which hits the floor). We mitigate this by keeping nav and footer fully responsive — the functional tasks (contact, navigate, read bio) are reachable at any width even when a case study forces horizontal scroll.

**Pattern extraction.** When a site has two structurally distinct layouts (phone vs desktop) rather than a single fluid composition, split the responsiveness rules: **content** can opinionate a minimum width and scroll horizontally inside its own region; **functional chrome** (nav, footer, cookie banners, global CTAs) must always be fluid to the viewport. Put the min-width on an inner wrapper and the scroll container on its direct parent — never on a root wrapper that also contains chrome. This gives the brand authority to say "the case study is composed for ≥672px" without sacrificing the "contact is always reachable" promise.

### 6.11 Priority Wrapping: Grid `1/-1` Beats Flex-Wrap

**Problem.** When a multi-column section has a "priority" element that must occupy its own row when the layout gets tight, flex-wrap is the wrong tool. Flex-wrap wraps from the *end* of the row — the last item wraps first. You cannot tell flex-wrap "when things don't fit, move the first item to its own row." The closest flex trick (pseudo-element break, `flex-basis: 100%` + `max-width`) requires either a DOM change or fights the specification.

**Pattern.** Use CSS Grid with `grid-column: 1 / -1` on the priority item. This authoritatively claims the entire row at a given breakpoint, regardless of how the remaining columns sub-divide the row below. Combine with a `max-width` on the priority item to visually cap its content while the grid cell itself spans the full track range.

```scss
.columns {
  // Compact zone: priority spans all columns, others auto-fit below
  @media #{$elan-mq-sm} {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
    gap: $portfolio-spacer-5x $portfolio-spacer-8x;
  }

  // Wide zone: explicit template, priority gets its own track
  @media #{$elan-mq-md} {
    grid-template-columns:
      minmax(260px, 320px)
      repeat(3, minmax(180px, 240px));
    justify-content: space-between;
  }
}

.priorityColumn {
  @media #{$elan-mq-sm} {
    grid-column: 1 / -1;
    max-width: 360px; // visual cap even though the cell spans the full row
  }
  @media #{$elan-mq-md} {
    grid-column: auto; // defer to the explicit template
  }
}
```

**Two-zone grammar.** The compact zone uses `auto-fit` + `minmax` so the non-priority columns reflow based on available width — you don't hardcode the column count. The wide zone uses an explicit `minmax(a, b) repeat(n, minmax(x, y))` template so every column gets known min/max bounds and `justify-content: space-between` absorbs leftover horizontal slack into the inter-column gaps instead of stretching any single column past its content-width ceiling.

**When to apply:** footers, section headers with a brand block + utility links, form layouts with a label group + paired fields, any composition with one "hero" element and N peer elements. See FB-148 for the portfolio footer implementation.

---

### 6.12 Rigid vs Flexible Columns — Enforce Content Invariants at Both Text and Layout Layers

**Problem.** Some columns contain content with a structural reading rule (e.g. "one row = one job" for an Experience list). If the column's track width drops below what the content needs to render at one line, the text wraps and the reading rule breaks. Relying on grid `minmax(Nmin, Nmax)` alone is fragile: (a) the rule only holds for today's content lengths — tomorrow's CMS edit can violate it, and (b) `minmax` with a min lower than content-width *does* permit wrap when auto-fit assigns the minimum to the track.

**Pattern.** Enforce the invariant at two layers:

1. **Text layer (authoritative):** `white-space: nowrap` on the link/span that must stay one line. The rule now lives in the content's rendering, not in the surrounding layout. No amount of viewport shrinkage can make a nowrap element wrap.
2. **Layout layer (safety net):** give the column a **fixed track width** matching the content's rendered one-line width — `grid-template-columns: ... Npx ...` (not `minmax`). Nowrap alone without a layout safety net would let content visually overflow the column into adjacent gaps; the fixed track width makes overflow impossible.

Treat columns in the grid as having one of two roles:

- **Rigid** columns (content has a structural one-line rule): fixed track `Npx`. Never `minmax`.
- **Flexible** columns (content is short and decorative): `minmax(Nmin, Nmax)` range. They absorb horizontal slack.

When viewport shrinks below `sum(rigid) + sum(flexible-min) + gaps`, the auto-fit grid falls back to fewer tracks and the last items in DOM order wrap to the next row. Rigid columns stay at their fixed width; flexible columns get squeezed to their min. This matches the user's mental model: "Experience must never compromise; Links/Contact can adapt."

```scss
.list a { white-space: nowrap; } // text-layer invariant

.columns {
  @media #{$elan-mq-sm} {
    // compact: auto-fit with floor matching the rigid column's needed width
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  }
  @media #{$footer-wide-mq} {
    // wide: rigid column gets a fixed track, others stay minmax
    grid-template-columns:
      minmax(260px, 320px) // flexible (About bio)
      240px                // rigid (Experience)
      repeat(2, minmax(180px, 240px)); // flexible (Links, Contact)
  }
}
```

**When to apply:** any list column where content integrity demands one-line-per-item (company names, product names, dates, monetary values, IDs). Avoid applying to prose columns — bio paragraphs and descriptions *want* to wrap and look wrong as a single line. Rigidity is for list columns, not prose columns.

**Component-local breakpoints are allowed — and sometimes required.** If the rigid column's width calculation pushes the layout's fit threshold past a canonical breakpoint token, define a component-local breakpoint with a comment that derives the number from column widths + gaps + padding. Example: `$footer-wide-mq: '(min-width: 1120px)'` because `260 + 240 + 2×180 + 3×64 + 2×32 = 1116 → 1120`. The token system is for platform categories (phone/tablet/laptop); layout-fit thresholds are component-level concerns. See FB-150.

---

### 6.13 Composition-Scaling Coherence — A Mixed Composition Is Only Valid Across Its Proportional Range

**Problem.** When a composition mixes elements that scale with the container (e.g. a flex-ratio column holding a canvas that fills its pane) with elements that have a fixed `max-width` (e.g. a 380px action card), the relationships between them hold only across a specific range of container widths. Let the container grow past that range and the scaling element outgrows the fixed one — gaps, gutters, and visual balance all degrade monotonically. The composition was never designed for those widths; it just happens to still render there.

**Anti-pattern: re-expansion at ultra-wide breakpoints.** A common instinct is to cap a container at (say) `1120px` on normal desktops, then at `@media (min-width: 1800px)` bump it back to `80vw` so "the content doesn't feel lost on big monitors." This is almost always wrong when the composition contains any fixed-width element, because:

1. **It creates a breakpoint discontinuity.** At the ultra-wide breakpoint, the container snaps from `1120px` to `1440px` (or whatever `80vw` evaluates to at that width). The composition visibly inflates in one frame — a ~28% jump — which reads as broken.
2. **It breaks the fixed-element's proportions.** Past the cap, the scaling column keeps widening and the fixed card stays the same size. The gap between them grows without bound — 149px at 1120px inner, 197px at 1520px, ~260px at 2000px. The gap that was tuned to feel right at the canonical width becomes progressively wrong at every wider viewport.
3. **The "wasted space" framing is wrong.** Negative space on ultra-wide monitors is not a bug — it's atmospheric breathing room that benefits editorial and brand-led compositions. Ultra-wide stretch only pays off when *every* element of the composition scales together (pure fluid grid with no fixed children); otherwise it's just smeared-out content.

**The principle:** pick a single `max-width` for the container — the width at which the composition's proportions look correct — and let the container stay at that value at every viewport equal to or wider than it. Do not re-expand the container at ultra-wide breakpoints unless all children scale with it. On viewports wider than the cap, the composition centers in a field of its background color and reads as a deliberate "object in space."

**How to pick the cap:**

1. Render the composition at candidate widths (1056, 1120, 1280, 1440).
2. Measure the gap between the fixed element and the scaling element at each. Pick the narrowest width where the gap still reads as intentional breathing room rather than compression.
3. Set that as the `max-width`. Do not add an `@media (min-width: ...)` rule that overrides it upward.
4. If the composition still feels "small" on genuinely ultra-wide displays, the fix is to increase *type sizes*, *illustration density*, or the *fixed element's cap* — not to stretch the container.

**Canonical example — password gate.** The layout has a scaling `.canvasPane` (flex `0 0 55%`, halftone canvas fills the pane and its figure scales with the pane) and a fixed action card (`max-width: 380px`). The inner is capped at `1120px` across all desktop viewports. An earlier version re-expanded to `80vw` at `min-width: 1800px`; this widened the portrait-to-card gap from 149px (tuned) to ~197px at 1900px viewports and created the 1800→1800px snap. Removed the re-expansion; composition now holds its proportions at every viewport ≥ 1120px and sits in a generous terra-colored field at ultra-wide. See FB-169.

**Related anti-pattern:** breakpoint discontinuity in any dimension. If a rule causes any layout quantity (container width, font size, gap, column count) to *snap* rather than *flow* at a breakpoint crossing, that's almost always a design mistake. Prefer fluid-to-cap-then-hold (the container fills the viewport up to a ceiling, then stays there) over fluid-to-cap-then-fluid-again (fills, then holds, then re-scales at a higher breakpoint). The latter forces a step change that is visible on every monitor whose width straddles the second breakpoint during a resize.

**When re-expansion IS correct:** only when every element in the composition scales proportionally with the container. A pure fluid-grid editorial page with no fixed-width primitives (no `max-width: 380px` cards, no fixed-width logos, no pinned panels) can safely stretch to `80vw` or beyond. The rule is not "never stretch past the cap" but "only stretch past the cap if stretching preserves all relationships."
