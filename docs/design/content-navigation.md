<!-- graph metadata for docs knowledge graph (see docs/knowledge-graph.md) -->
---
type: spoke
id: design-content-navigation
topics:
  - design
  - navigation
derivedFrom:
  - design.md
---

# Content Navigation Policy

> Spoke file for `docs/design.md`. Return to the [hub](../design.md) for the Section Index.

### 13.1 ScrollSpy Threshold Model

**Source:** Session 2026-03-29, feedback "For all pages with significant vertical overflow, add ScrollSpy — only if it's a lot"
**Rule:** Add a ScrollSpy (right-rail section indicator) only when BOTH conditions are met:

1. **Content depth:** 3+ viewport heights of rendered content. Estimate rendered height, not source line count — a 150-line page with data-driven grids can render 5+ viewport heights.
2. **Section count:** 5+ distinct, named sections that a user might want to jump between.

Pages that are long but monotonic (a single repeating grid) do not benefit — there's nothing to navigate between. Pages that have many sections but are short do not benefit — the user can already see most sections.

**Cost-benefit framing:** Every UI element has implementation cost, maintenance burden, and cognitive cost. ScrollSpy adds an interaction surface the user must notice and learn. That cost must be justified by proportional wayfinding benefit.

### 13.2 ScrollSpy Label Brevity

Labels in ScrollSpy tooltips should be shorter than section headings. The section heading "Interactive Mixins (SCSS)" becomes the ScrollSpy label "Mixins". The user is already on the page and knows the context — the label only needs to differentiate sections from each other, not introduce them. Aim for 1-2 words per label.

### 13.3 Scroll Offset — Context-Preserving Navigation

**Source:** Session 2026-03-30, "I don't want it to be up against the upper border of the browser screen"
**Updated:** Session 2026-04-03, component-level offset replaces reliance on per-page `scroll-margin-top`

**ScrollSpy component-level offset (primary mechanism):** The ScrollSpy component now handles scroll offset internally. When a user clicks or drags to a section, ScrollSpy positions the target at **20% from the viewport top** using `window.scrollTo` instead of `scrollIntoView`. This:
- Aligns with the IntersectionObserver `rootMargin: "-20% 0px -60% 0px"` detection zone, so the scroll target and the active-section detection use the same viewport region
- Provides breathing room without depending on CSS on the target elements
- Eliminates the failure mode where pages forget to add `scroll-margin-top` to their section elements

**CSS `scroll-margin-top` (secondary, for non-ScrollSpy navigation):** Anchor links, direct URL hash navigation, and other non-ScrollSpy scroll mechanisms still rely on `scroll-margin-top` on target elements. Keep these values for those cases:

| Context | Property | Value | Rationale |
|---------|----------|-------|-----------|
| Main site (no sticky header) | `scroll-margin-top` | `$portfolio-layout-04` (48px) | Pure breathing room — shows the divider from the previous section |
| Playground (sticky header) | `scroll-mt-24` | 96px (6rem) | 64px header clearance + 32px breathing room |

**UX principle:** Scroll-to navigation is a spatial metaphor. The user expects to "arrive" slightly above the destination, as if they walked up to it and stopped a step before. Landing exactly on it (flush top) feels like teleportation — disorienting because the preceding context is invisible. The offset creates a landing zone that preserves the user's mental map of the page.

### 13.5 ScrollSpy Auto-Contrast Label

**Source:** Session 2026-04-20, FB-155 "can the notch text color change to light when it detects that the background pixel... only the current notch will have the impact"

**Rule:** The currently-active (or drag-targeted) notch's label must remain legible over any backdrop — including dark hero splashes, photographic full-bleed sections, and colored accent blocks. Non-active labels shown on hover retain their token-driven hierarchy.

**Mechanism:** The active label is portaled to `document.body` via `createPortal` and styled with `color: #fff; mix-blend-mode: difference`. This yields `|255 − backdrop|` per channel — automatic inverse-of-backdrop contrast with no JavaScript sampling, no per-section annotation, and no dependence on theme tokens. Black bg → white text, white bg → black text, colored bg → color-inverse text.

**Why portal:** `position: fixed` always creates a new stacking context (regardless of `z-index`), and `mix-blend-mode` only blends against the *parent stacking context's* backdrop. A label rendered inside the fixed rail would blend only against the rail's interior — invisible. Portaling the label to `document.body` places it in the root stacking context, where it blends against all page content rendered below. See the `mix-blend-mode` entry in `design-anti-patterns.md` for the failure mode to avoid.

**Scope:** Only the active/drag-targeted notch's label. Applying difference blend mode to all hover-revealed labels would collapse the depth-by-opacity hierarchy (placeholder / primary / secondary) into a flat layer — the hierarchy exists to communicate sub-section subordination and must survive hover.

**Position sync:** The overlay's `top` / `left` are computed from the active tick's `getBoundingClientRect()` inside a `useIsomorphicLayoutEffect`, re-subscribed to `resize` and capture-phase `scroll` events. Because the rail is viewport-fixed, the tick's coordinates don't change on page scroll — but the listeners handle browser zoom, window resize, and edge cases where an ancestor scroll container might shift the rail.

**Trade-off:** On highly saturated non-neutral backdrops, the inverse is a complementary color (red → cyan, green → magenta, blue → yellow) rather than pure black or white. For a portfolio whose backgrounds are dominantly neutral with occasional photographic accents, this reads as "still readable, occasionally stylistically tinted" — which is aligned with the author's ask ("the inverse of whatever the background color is"). If a future visual identity requires strictly black/white labels regardless of backdrop hue, the implementation would need to switch to pixel sampling + luminance scoring, and the trade-off becomes handling background-images and gradients (which sampling cannot observe).

### 13.4 Current ScrollSpy Pages (Playground)

| Page | Sections | Notches |
|------|----------|---------|
| tokens/colors | Accent Scale, Neutral Scale, Extended Palette, Surfaces, Text, Borders, Support, Focus & Highlight | 8 |
| tokens/motion | Easing Curves, Durations, Choreography, Mixins, Globals, Z-Index | 6 |
| tokens/typography | Type Scale, Font Stacks, Weights, Line Heights, Letter Spacing | 5 |

**Excluded pages (below threshold):** All component pages (button, card, fade-in, input, etc.) — typically 1.5-2 viewport heights with 4 preview sections. Moderate scrolling, not "a lot." tokens/spacing and tokens/elevation — 3 sections each, moderate length.
