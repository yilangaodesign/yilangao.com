# Spacing & Breathing Room

> Spoke file for `docs/design.md`. Return to the [hub](../design.md) for the Section Index.

**Severity: Critical** — This was the #1 recurring frustration (8 of 18 feedback messages).

### 1.1 Content Area Padding (Cross-Panel Alignment)

- **Horizontal padding in content areas adjacent to a sidebar must match the sidebar's effective content offset.** The sidebar's content starts 14px from its edge (container `px-1.5` + item `px-2`). The content area (header, main, footer) uses **`px-3.5` (14px)** to align. This creates a consistent visual rhythm across both panels.
- **Never use a responsive step-up** (`lg:px-5`) for horizontal padding in sidebar-adjacent content — it breaks alignment at exactly the breakpoint where both panels are visible.
- Vertical padding from top nav to content: **16px (`py-4`) base**, **20px (`py-5`) at `lg`** — vertical can step up because there is no cross-panel vertical alignment to maintain.
- **Supersedes earlier "16px base, 20px at lg" horizontal guidance** (pre-FB-079) — that was set independently of the sidebar and created a visible 6px misalignment on desktop.

### 1.2 Three-Tier Spacing Token Architecture (One GS Reference)

Spacing tokens use a three-tier architecture optimized for AI agent comprehension. An agent must be able to derive the pixel value from a primitive token name via arithmetic, and infer layout intent from a layout token name without consulting a lookup table.

**Base unit: 8px.** All primitive tokens are multiples of 8. SCSS encodes decimals as hyphens (`spacer-0-5x` for 0.5x).

**Tier 1 — Primitive Spacers (`spacer-Nx`):** Value = N x 8px. Self-documenting: `spacer-3x` = 24px.

| Token | Value | Use |
|-------|-------|-----|
| `spacer-0.125x` | 1px | Hairline borders, sub-pixel adjustments |
| `spacer-0.25x` | 2px | Fine divider spacing |
| `spacer-0.5x` | 4px | Micro gaps, divider spacing |
| `spacer-1x` | 8px | Icon padding, compact element gaps |
| `spacer-1.5x` | 12px | List item vertical padding |
| `spacer-2x` | 16px | Nav link padding, card internal padding minimum |
| `spacer-2.5x` | 20px | Mid-range component padding |
| `spacer-3x` | 24px | Section gaps, card padding standard |
| `spacer-4x` | 32px | Content area padding, major section spacing |
| `spacer-5x` | 40px | Large viewport content padding |
| `spacer-6x`–`spacer-20x` | 48–160px | Section/page-level rhythm (integer steps) |

Clean progression: sub-1x uses halving (0.5, 0.25, 0.125), 1x–2.5x use half-steps, 3x+ use integer steps. Oddball fractions (0.75x, 0.875x, 1.25x, 1.625x) belong ONLY in Tier 3 (utility). See `_spacing.scss` for the complete 25-token scale.

**Tier 2 — Layout Spacers (`spacer-layout-*`):** Semantic density names for section/page spacing. Default density: Functional (B2B tool UI).

| Token | Functional Value | Use |
|-------|-----------------|-----|
| `spacer-layout-x-compact` | 8px | Tightest layout gap (data tables) |
| `spacer-layout-compact` | 16px | Minimum layout margin |
| `spacer-layout-standard` | 24px | Standard layout margin |
| `spacer-layout-spacious` | 32px | Comfortable layout margin |
| `spacer-layout-x-spacious` | 48px | Generous layout margin |
| `spacer-layout-xx-spacious` | 64px | Section vertical rhythm (default) |
| `spacer-layout-xxx-spacious` | 80px | Hero/feature section spacing |
| `spacer-layout-xxxx-spacious` | 96px | Major section dividers |

**Tier 3 — Utility Spacers (`spacer-utility-Nx`):** Component-internal spacing for buttons, inputs, checkboxes. Same multiplier math, separate namespace to signal "this is component-internal, not layout." Oddball fractions (0.75x, 0.875x, 1.25x, 1.625x) live ONLY here — they serve component sizing but don't belong in the clean primitive grid. Utility tokens own their pixel values directly (no primitive counterpart exists for oddball fractions).

| Token | Value | Use |
|-------|-------|-----|
| `spacer-utility-0.5x` | 4px | xs button padding |
| `spacer-utility-0.75x` | 6px | Compact component internal spacing |
| `spacer-utility-0.875x` | 7px | sm button vertical padding |
| `spacer-utility-1x` | 8px | sm button horizontal padding, md gap |
| `spacer-utility-1.25x` | 10px | md button vertical padding |
| `spacer-utility-1.5x` | 12px | md button horizontal padding, lg gap |
| `spacer-utility-1.625x` | 13px | lg button vertical padding |
| `spacer-utility-2x` | 16px | lg button horizontal padding, xl gap |
| `spacer-utility-2.5x` | 20px | Component padding, card internal spacing |
| `spacer-utility-3x` | 24px | xl button horizontal padding |

**Migration from legacy names:** All old `spacing-NN` and `layout-NN` tokens are preserved as deprecated aliases. See `_spacing.scss` for the full mapping. When in doubt, round up to the next multiplier step.

### 1.3 Minimum Inter-Component Gap for Buttons

Buttons must never be placed directly adjacent to each other — horizontally or vertically — without a gap. This applies universally unless a dedicated button group component explicitly overrides it (e.g., a segmented control or split button with internal border separators).

- **Minimum gap between adjacent buttons:** 8px (`gap-2` / `spacer-1x`). This is the floor — not a target.
- **Recommended gap for side-by-side buttons:** 12px (`gap-3` / `spacer-1.5x`). This is the standard for button rows in forms, toolbars, and previews.
- **Recommended gap for stacked full-width buttons:** 12px (`space-y-3` / `spacer-1.5x`). Full-width buttons each carry their own background/border, so the gap between them must be large enough to read as distinct elements, not a single merged block.
- **Why not 4px?** While 4px (`gap-1`) is technically non-zero, it's visually indistinguishable from touching at normal viewing distances, especially between elements with filled backgrounds. 8px is the practical minimum where two adjacent buttons read as separate entities.

**Button group exception:** A component that explicitly groups buttons into a unified control (e.g., `ButtonGroup`, `SegmentedControl`) may use `gap-0` with internal dividers or shared borders. This is a deliberate design decision, not an accident. The visual cohesion of the group communicates "these are facets of one control."

### 1.4 Never Zero

Every container boundary (sidebar edge, card edge, header edge) must have **visible** padding separating it from its children. If you can't see the gap, it's wrong.

### 1.5 Full-Width Splash Inset Symmetry

When a full-width element (hero splash, feature banner) uses horizontal inset at any breakpoint, it must apply equivalent vertical inset. Directional asymmetry in padding - horizontal but not vertical - creates a visual imbalance where the element feels "pressed against" the top/bottom edges. If the element is not a deliberate full-bleed takeover, all four sides need breathing room.

- **Mobile (no horizontal padding):** Vertical padding still applies (`spacer-3x` = 24px top/bottom) to prevent the content from being flush against the preceding/following elements.
- **Tablet+ (horizontal padding appears):** Vertical padding matches or tracks the horizontal value. At `sm`, 24px vertical / 16px horizontal. At `md`, 32px all four sides.
- **Full-bleed exception:** If the design intent is a full-viewport takeover (no padding on any side), omit all inset. The rule targets the in-between case where horizontal padding exists but vertical does not.

### 1.7 Overlay Pointer Inset on Rounded Containers

When an overlay element (tooltip, popover, dropdown) displays a pointer (caret, arrow, triangle) against a container with rounded corners, the pointer must be inset from the container edge by **at least the container's border-radius**. The pointer is geometrically sharp; placing it inside the radius zone visually breaks the corner curve and creates a jarring sharp-meets-round collision.

- **Tooltip caret:** `arrowPadding = radius-sm` (4px). The caret sits inside the flat portion of the container edge, clear of the corner rounding.
- **Future popovers/dropdowns:** Same rule applies. Inset >= border-radius.
- **Centered pointers:** When a pointer is explicitly centered (`caret="center"` in the tooltip), it is far from any corner by definition, so the inset can be 0. The rule only matters when the pointer could drift to the edge via alignment or collision-shifting.

This is a geometric constraint, not an aesthetic preference. It applies to all overlay components in the design system.

### 1.6 Sidebar Internal Spacing (Collapsed-First)

The collapsed state is the **canonical spacing reference**. The expanded state must match it exactly on every shared vertical axis so that toggling never causes tabs to jump.

- Scrollable area top padding: `pt-2` (8px) — minimal gap between header border and first tab.
- Container padding (both states): `px-1.5` (6px) — tight against the sidebar border.
- Nav link height (both states): `h-7` (28px) — identical in collapsed and expanded.
- Nav links collapsed: `w-7` square buttons, `justify-center`, `mx-auto`.
- Nav links expanded: `gap-2`, `px-2`, `text-[13px]` — flush alignment, no deep indent.
- Section separator (both states): fixed `h-6` (24px) wrapper with no additional margin — contains a `border-t` divider when collapsed, or a `text-[9px]` uppercase label when expanded. The separator IS the entire gap between sections; no `mt-*` on the section container.
- In collapsed mode, the `border-t` divider sits at the exact vertical midpoint of the 24px wrapper (12px above, 12px below) — perfectly centered between the last tab of one section and the first tab of the next.
- Link vertical spacing: `space-y-px` (both states).
- Header: `px-4` (16px) horizontal padding, `h-12` (48px) height.

**Why collapsed-first:** The collapsed state has the tightest possible spacing — every pixel is intentional because there's so little room. The expanded state tends to accumulate extra padding (taller rows, deeper indents, bigger section gaps) that isn't deliberate. By locking the vertical rhythm to the collapsed state, toggling between states produces zero vertical shift in tab positions.

### 1.8 Optical Balance — Whitespace Follows Visual Weight

**Mathematical centering of unequal-weight elements reads as imbalanced.** Visual weight is a *perceptual* quantity, not a dimensional one. Two elements of identical bounding-box size can carry very different perceived mass depending on:

- **Density** — how much of the bounding box is filled with marks (dense pattern > sparse text)
- **Motion** — animated, video, or interactive content pulls the eye more than static content
- **Contrast** — high foreground/background contrast increases weight vs. the surrounding field
- **Detail** — fine-grained pattern, texture, or illustration increases weight vs. plain fills
- **Color saturation** — saturated colors carry more weight than muted/neutral ones
- **Face/figure presence** — humans register faces/bodies as high-weight regardless of size

**The principle:** When a composition contains two elements of meaningfully different visual weight, the heavier element must have **more** whitespace on its outer side than the lighter element has on its outer side. The goal is to *balance perceived mass*, not to equalize dimensions. A composition where both sides have equal outer whitespace will always read as "heavy side pulling left/up/wherever the heavy element sits" because the viewer's eye disproportionately weights the dense side.

**How to implement (layout-level):**

- Express the offset through the flex ratio or grid-template columns of the two containers, NOT through padding tricks on one child. The ratio is the thing that scales proportionally with viewport — padding tricks break at different viewport widths.
- Near-equal weight → stay near 50/50.
- Modestly unequal (e.g., dense illustration vs. simple heading) → 53–55 / 45–47.
- Strongly unequal (e.g., animated video vs. small text label) → 55–60 / 40–45 or even further.
- The empty space on the outer side of the heavier element should exceed the empty space on the outer side of the lighter element by approximately the perceptual weight delta — typically 15–40px on canonical (1120px–1440px) containers.

**Canonical example — password gate (`src/app/(frontend)/for/[company]/login.module.scss`):** Animated halftone portrait on the left, static serif text on the right. `.canvasPane` is `flex: 0 0 55%` (not 50%). Empty-left-of-portrait ≈ 133px on 1120px inner; empty-right-of-card ≈ 108px. The ~25px offset favoring the portrait side reads as balanced; mathematical centering (50/50) reads as portrait-heavy. See FB-168.

**Why this is a spacing principle, not a layout principle:** the thing being tuned is *whitespace* — the empty gutters around the elements. The layout (two-column flex) is agnostic to weight; the whitespace distribution is where the weight compensation lives. This belongs here.

**Anti-patterns:**

- Compensating for visual weight via padding on one child instead of the container ratio — padding is a fixed pixel value and does not scale; the ratio is a percentage and does.
- Treating "centered on the viewport" as the goal when the composition has unequal weight. Centered-on-viewport is a lesser goal than balanced-as-perceived.
- Applying optical-offset logic to compositions of roughly equal weight — you get a gratuitous skew with no perceptual payoff.

**Paired responsiveness rule:** When optical-offset tuning is active at certain breakpoints but not others (for example, the heavier element is hidden at mobile), the non-offset breakpoints MUST have explicit overrides that reset alignment and padding to the symmetric/centered case. A desktop-tuned alignment that leaks into a context where the heavier element doesn't exist is a regression. The trigger: any media query that sets `display: none` on a layout-structural element demands an audit of every rule written assuming that element's presence. See FB-168.
