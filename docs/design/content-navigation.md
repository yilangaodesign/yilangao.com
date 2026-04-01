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

Any section targeted by `scrollIntoView({ block: "start" })` or anchor navigation must have `scroll-margin-top` that provides **contextual breathing room**, not just header clearance. When a user jumps to a section, they need to see a sliver of the preceding content to maintain spatial context — "where did I come from?" Without it, the section heading slams against the viewport top edge, losing all sense of position within the page.

**Values:**

| Context | Property | Value | Rationale |
|---------|----------|-------|-----------|
| Main site (no sticky header) | `scroll-margin-top` | `$portfolio-layout-04` (48px) | Pure breathing room — shows the divider from the previous section |
| Playground (sticky header) | `scroll-mt-24` | 96px (6rem) | 64px header clearance + 32px breathing room |

**UX principle:** Scroll-to navigation is a spatial metaphor. The user expects to "arrive" slightly above the destination, as if they walked up to it and stopped a step before. Landing exactly on it (flush top) feels like teleportation — disorienting because the preceding context is invisible. The offset creates a landing zone that preserves the user's mental map of the page.

### 13.4 Current ScrollSpy Pages (Playground)

| Page | Sections | Notches |
|------|----------|---------|
| tokens/colors | Accent Scale, Neutral Scale, Extended Palette, Surfaces, Text, Borders, Support, Focus & Highlight | 8 |
| tokens/motion | Easing Curves, Durations, Choreography, Mixins, Globals, Z-Index | 6 |
| tokens/typography | Type Scale, Font Stacks, Weights, Line Heights, Letter Spacing | 5 |

**Excluded pages (below threshold):** All component pages (button, card, fade-in, input, etc.) — typically 1.5-2 viewport heights with 4 preview sections. Moderate scrolling, not "a lot." tokens/spacing and tokens/elevation — 3 sections each, moderate length.
