# Design System — Accumulated Knowledge

> **What this file is:** The synthesized, authoritative design pattern knowledge base for yilangao.com. Every principle here was extracted from real user feedback during design iteration. This is a living document — it grows after every chat session.
>
> **Who reads this:** AI agents routed here by `AGENTS.md` Pre-Flight. Read the Section Index first, then only the section matching your task.
> **Who writes this:** AI agents after processing user feedback via the `design-iteration` skill.
> **Last updated:** 2026-03-30 (FB-068: TokenGrid interactive builder — color-first dropdown, cascading filters, tab consolidation)

---

## Section Index — Read This First

| § | Topic | Read when |
|---|-------|-----------|
| §0 | Design Posture | Always for UI work (~10 lines — read this every time) |
| §1 | Spacing & Breathing Room | Touching spacing, padding, gaps, hit zones |
| §2 | Layout Integrity | Changing layout, positioning, flex structure |
| §3 | CSS Framework (Tailwind v4) | Touching CSS config, layers, theme directives |
| §4 | Navigation Design | Modifying sidebar, nav, collapsible panels, category flyouts, submenu aim |
| §5 | Theming | Touching colors, dark mode, CSS variables |
| §6 | Responsive Design & Breakpoints | Touching breakpoints, fluid layout, viewports, density modes, container queries, grid influencers |
| §8 | Corner Radius | Adding or modifying border-radius |
| §9 | Color Philosophy & Token Architecture | Adopting palette colors, token naming (property·role·emphasis), semantic tokens |
| §10 | Interactive Controls | Building scrub/drag/click controls, hit zones, gesture handling |
| §11 | Information Architecture | Organizing components/tokens into categories, taxonomy design, naming collisions |
| §12 | Overlay & Flyout Positioning | Flyouts, portals, stacking contexts, state coherence across modes |
| §13 | Content Navigation Policy | Adding ScrollSpy or secondary nav aids to long pages |
| §14 | Playground Consistency Principles | Token page visual consistency, user-centric information filtering |
| §15 | Portfolio Grid Layout | Homepage project grid, masonry layout, card density, scannability |
| §16 | Homepage Information Architecture | Sidebar navigation, page structure, nav consistency |
| §18 | Typography System | Font role assignments, semantic mixins, pairing rules, enterprise compact guidelines |
| §19 | Admin UI Palette Policy | Admin vs public palette split, intentional exceptions |
| §20 | Button Adoption Policy | When to use DS Button vs raw `<button>`, missing variants |
| §21 | Undocumented Patterns | DS gap analysis — patterns on site without DS coverage |
| §7 | Process Principles | Meta — how to diagnose and fix design issues |
| Appendix | Frequency Map | Checking for recurring feedback patterns |

---

## 0. Design Posture

**Always approach design decisions as a staff-level UX designer building for B2B.** This means:

- **B2B density by default.** This is a professional tool, not a consumer marketing page. Content should feel dense and efficient — generous whitespace is wasted real estate. When in doubt, tighten.
- Prioritize spatial consistency, visual rhythm, and state transitions over raw aesthetics.
- Catch problems that junior designers miss: sub-pixel vertical shifts on toggle, inconsistent padding between component states, interaction choreography that feels off even when each frame looks fine.
- When two states of the same component (e.g., collapsed vs expanded) have different spacing, that's a bug — not a style choice. Users perceive it as broken.
- Default to the tighter, more constrained state as the canonical reference and match the looser state to it, not the other way around. Tight spacing is intentional; loose spacing is often accidental padding accumulation.
- **Corner radius: near-zero.** Round corners signal consumer/playful. B2B products use sharp to barely-rounded corners. See §8 for the full radius scale.

---

## How to Use This File

1. **Read the Section Index above** — match your task to a section, read only that section.
2. **If the user gives feedback**, activate the `design-iteration` skill — it will handle full doc reading.
3. **After resolving feedback**, update this file: strengthen existing principles or add new ones.
4. **Do NOT read the entire file** unless the skill protocol requires it.

---

## 1. Spacing & Breathing Room

**Severity: Critical** — This was the #1 recurring frustration (8 of 18 feedback messages).

### 1.1 Content Area Padding (B2B Density)

- Content areas adjacent to navigation use **16px (`px-4`) base**, scaling to **20px (`px-5`) at `lg`**. This is B2B-appropriate density — not cramped, but not wasteful.
- Vertical padding from top nav to content: **16px (`py-4`) base**, **20px (`py-5`) at `lg`**.
- Header horizontal padding matches main content: `px-4 lg:px-5`.
- Responsive padding should increase modestly, not double. The jump from 16→20px is sufficient.
- **Supersedes earlier "32px minimum" guidance** — that was appropriate for consumer spacing but too loose for B2B tool interfaces.

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

### 1.3 Never Zero

Every container boundary (sidebar edge, card edge, header edge) must have **visible** padding separating it from its children. If you can't see the gap, it's wrong.

### 1.4 Sidebar Internal Spacing (Collapsed-First)

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

---

## 2. Layout Integrity

### 2.1 No Overlapping

Navigation and content must coexist as **flex siblings**, never overlap via z-index. The pattern:

```
<div class="flex min-h-screen">
  <Sidebar />              <!-- fixed panel + in-flow spacer div -->
  <div class="flex-1 min-w-0">  <!-- content stretches to fill -->
    <header />
    <main />
  </div>
</div>
```

A `position: fixed` sidebar requires a **companion spacer div** (same dynamic width, `hidden lg:block`) that reserves space in the flex flow.

### 2.2 Content Must Never Be Covered

If a sidebar is fixed, the content area must be pushed over by an in-flow element — not by `padding-left` on a distant ancestor. The spacer div pattern is the only reliable approach.

---

## 3. CSS Framework Integration (Tailwind v4)

### 3.1 Layer Cascade — The #1 Architectural Rule

In Tailwind v4, utilities live in `@layer utilities`. **Unlayered CSS always beats layered CSS** in the cascade.

**NEVER** put global resets outside a layer:

```css
/* BROKEN — kills all Tailwind spacing */
* { margin: 0; padding: 0; }
```

**ALWAYS** wrap resets in `@layer base`:

```css
@layer base {
  * { margin: 0; padding: 0; box-sizing: border-box; }
}
```

This is non-negotiable. Violating this silently zeroes out every `p-*`, `m-*`, `gap-*` utility.

### 3.2 @theme vs @theme inline

- `@theme` → emits CSS custom property **references** (`var(--color-background)`). Dark mode `.dark` class overrides work.
- `@theme inline` → hardcodes **literal values** at build time. Dark mode overrides are impossible.

**Always use `@theme` (without `inline`)** for any color or value that changes between themes.

### 3.3 Token-First, Never Inline

All styling must go through design tokens — Tailwind classes, CSS custom properties, or component-level props. **Never use `style={{}}`** as a workaround.

If Tailwind can't express a value, use an arbitrary value class (`w-[200px]`) or a CSS custom property. If the framework fundamentally can't handle the pattern, evaluate switching to ShadCN/Radix or Chakra — don't hack around it with inline styles.

---

## 4. Navigation Design

### 4.1 Collapsible Sidebar (Left-Anchored, Collapsed-First Spacing)

Every persistent sidebar must support two states:
- **Expanded**: Full labels, section headers, footer. Width ≤ 200px.
- **Collapsed**: Icon-only, left-aligned icons, section dividers. Width = 41px (produces 28×28 square icon hit zones after border and padding).

**Critical — Vertical rhythm:** Both states must share identical vertical rhythm — same tab height, same section separator height, same section gap. The collapsed state defines the canonical values; the expanded state conforms to them. See §1.4 for exact values.

**Critical — Left-anchoring:** The sidebar is anchored to the left edge. During the collapse/expand transition, the sidebar width changes from the right (shrinks inward, grows outward). Icons must remain at the **same horizontal position** (14px from sidebar left edge) in both states. This means collapsed icons use `pl-2` (matching expanded mode's left padding), NOT `justify-center` or `mx-auto`. Centering causes icons to shift horizontally during the transition, which users perceive as unstable layout.

**Category sliver interaction:** Categories reveal their sub-links via a **hover-to-reveal sliver panel** that slides out from the sidebar's right edge. No click is required. The sliver closes when the user moves their cursor away from the sidebar and sliver area. This applies to both collapsed and expanded modes. See §4.6 for the full interaction model.

The toggle control lives **inside the sidebar header** (top-right), not in the main content header.

**Critical — Unified padding:** The sidebar header must use the same container padding (`px-1.5`) as the nav area, search, and archive sections. Internal elements use their own padding to achieve the 14px edge distance: logo link gets `px-2`, collapse button gets `mr-2`. This ensures all elements across the sidebar are horizontally aligned at 14px from the sidebar edges. The collapse button's right-edge distance (14px) must match the collapsed expand button's right-edge distance (14px) for visual stability during the expand/collapse transition.

### 4.2 Collapsed State — Square Icon Tabs, Exactly Centered

**Geometry:** Sidebar = 41px, border-r = 1px → inner = 40px. Container `px-1.5` = 6px each side → item width = 28px. Item height = `h-7` = 28px. **Each tab is a perfect 28×28 square.**

In icon-only mode:
- Each nav link: `pl-[7px] h-7` — 7px left padding positions the 14px icon from 7–21px within the 28px item. Icon center = 14px = item center. **Exactly centered** (0px offset).
- Container: `px-1.5` (6px padding each side).
- During the collapse/expand transition, icons shift by only 1px (from 13px to 14px) — imperceptible over the 200ms animation.
- **Never use `justify-center` or `mx-auto`** in collapsed mode — these cause the icon to track the container's center, creating a visible horizontal slide during the width transition.
- **Never use `pl-2` (8px)** in collapsed mode — this creates a right-skew visible in the narrow sidebar.
- Section dividers: **full-width** `border-t` — never truncated with a fixed `w-*` class.

### 4.3 Visual Hierarchy in Expanded Sidebar

- **Section headers** (TOKENS, COMPONENTS): `text-[9px]`, `font-medium`, `tracking-[0.12em]`, `uppercase`, `text-sidebar-muted-foreground/50`. Smaller, lighter, clearly distinct from nav links.
- **Nav links**: `text-[13px]`, `font-normal/medium`, indented `pl-5` to visually nest under headers.
- The height of section headers should match nav link height for rhythm, but the visual weight must be clearly lower.

### 4.4 Search Interaction (Adjacent Flyout)

Search in a sidebar must be accessible in both collapsed and expanded states while preserving spatial stability.

- **Collapsed mode**: A search icon button triggers a floating flyout panel adjacent to the sidebar (not a centered modal — Fitts's Law demands proximity to the trigger). The flyout is rendered via `createPortal` to escape the sidebar's stacking context.
- **Expanded mode**: A trigger button transforms into an inline input field with a dropdown results panel below it, contained within the sidebar column.
- **Global shortcut**: `Cmd+K` / `Ctrl+K` opens search regardless of sidebar state.
- **Visual identity**: The input field in both modes must be visually identical — same height, font size, padding, border treatment, icon size. The only difference is spatial position. If they look like different controls, the user perceives two features instead of one.
- **State coherence**: When the sidebar transitions between collapsed and expanded modes, all search-related transient state (open/closed, query text, selection index) must reset. A flyout that persists across mode transitions creates visual duplicates.

### 4.5 Category Flyout Sub-Headers

When a category contains many links, group them with optional sub-headers inside the flyout (sliver) panel. This provides two-level structure (category → group → link) without deep nesting.

- Sub-headers are driven by a `group` field on `NavLink` — when consecutive links share a group, a `text-[9px]` uppercase label appears above the first item in the group.
- Not all categories need groups — only those where 8+ links benefit from visual chunking.
- Sub-headers use the same visual treatment as sidebar section dividers: minimal weight, clearly subordinate to the links.

### 4.6 Hover-to-Reveal Category Sliver

**Source:** Session 2026-03-29, "side panel should slide out on hover, not require clicking"

Category sub-navigation uses a **hover-to-reveal** interaction model, not click-to-toggle. This applies to both collapsed and expanded sidebar modes.

**Opening:** When the user hovers a category button, the sliver panel slides out from the sidebar's right edge. No click needed. The cursor position expresses intent; the interface responds without requiring a commitment.

**Closing:** When the user moves their cursor away from both the sidebar and the sliver, the sliver slides back after a brief delay (200ms). The delay serves as a grace period for cursor movement between the sidebar and the sliver — without it, crossing the boundary would cause a flash close-reopen.

**Slide animation:** The sliver uses `translate-x-0` (visible) ↔ `-translate-x-full` (hidden) with `transition-transform duration-200 ease-out`. The sliver slides out from behind the sidebar and slides back behind it. The sidebar's higher z-index (`z-30` vs sliver `z-29`) makes the sliver appear to emerge from and retract into the sidebar.

**Timer handoff pattern:** The hover zone spans both the sidebar and the sliver as two separate DOM elements. The pattern:
1. `onMouseLeave` on sidebar or sliver → start 200ms close timer
2. `onMouseEnter` on sidebar or sliver → cancel timer
3. `onMouseEnter` on a category button → cancel timer + open that category's sliver
4. `onMouseEnter` on non-category elements (header, search, Overview, Archive) → close sliver immediately

Rule 4 is critical: without it, moving from a category to the Overview link (still inside the sidebar) would leave a stale sliver open because `mouseLeave` on the sidebar never fires.

**State coherence:** The sliver resets when the sidebar transitions between collapsed and expanded modes (per §12.3).

**Mobile:** Touch devices retain tap-to-expand (accordion) behavior. Hover-to-reveal is desktop-only.

### 4.7 Safe Triangle (Submenu Aim)

**Source:** Session 2026-03-29, "area for mouse maneuvering is too narrow and causes bad experience"

When a category sliver is open and the user moves their cursor diagonally toward it, the cursor crosses adjacent category buttons. Without protection, each crossing triggers a category switch — the "whack-a-mole" problem. This is the exact issue Amazon solved with their mega-dropdown menus.

**Solution:** The `useSafeTriangle` hook (`playground/src/hooks/use-safe-triangle.ts`) implements Amazon's slope-based path prediction:

1. Track the last 4 mouse positions via a document-level `mousemove` listener.
2. When a new category button is hovered while a sliver is already open, compute slopes from the current and previous cursor positions to the far corners of the sliver.
3. If the slopes are diverging (the "cone" from cursor to sliver is widening — meaning the cursor is getting closer to the sliver), the cursor is heading toward the submenu. **Defer** the category switch by 100ms.
4. After the deferral, re-check. If the cursor is still heading toward the sliver, re-defer. If not, execute the switch.
5. If the cursor is NOT heading toward the sliver (moving vertically through items), switch immediately — no perceptible delay.

**Integration:** The `interceptHover` function wraps the `setOpenCategory` call. It only engages when `openCategory !== null` (a sliver is already visible) and `catId !== openCategory` (attempting to switch). First-time opens and re-hovers of the same category bypass the check entirely.

**Parameters:**
- `delay`: 100ms default (re-check interval)
- `tolerance`: 75px (vertical forgiveness beyond the sliver's actual bounds)
- `direction`: `"right"` for right-opening slivers, `"left"` for left-opening

**Reusability:** The hook is generic — any component with parent-menu + submenu hover dynamics can use it. It accepts a `submenuRef` for bounding rect calculation and returns `{ interceptHover, cancelPending }`.

---

## 5. Theming

### 5.1 Dual Theme Testing

Every UI change must be mentally verified in **both** light and dark mode. If you touch colors, background classes, or border classes — check both themes.

### 5.2 CSS Variable Architecture

```css
@theme {
  --color-sidebar: #f9f9f9;  /* light */
}
.dark {
  --color-sidebar: #1a1a1a;  /* dark override — unlayered, beats @layer theme */
}
```

The `.dark` class block must be **unlayered** (outside any `@layer`) so it overrides the theme layer values.

### 5.3 Complete Token Coverage

Every surface (card, sidebar, code block, preview area) must have both light and dark tokens defined. Missing a single `--color-*` variable in `.dark` creates a white flash.

---

## 6. Responsive Design

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

---

## 8. Corner Radius (B2B Sharp)

**Severity: High** — Excessive rounding undermines the professional, tool-like aesthetic expected in B2B products.

### 8.1 Radius Scale

| Class | Value | Use |
|-------|-------|-----|
| `rounded-none` | 0px | Tables, full-bleed containers, dividers |
| `rounded-sm` | 2px | **Default for everything** — buttons, cards, inputs, nav links, badges, code blocks, interactive elements |
| `rounded` | 4px | Rarely — only when a slightly softer edge is intentional (e.g., modal dialogs) |
| `rounded-full` | 9999px | **Only** for progress bars, pills, and avatars where the shape is structural |

### 8.2 Rules

- **Never use `rounded-md` (6px), `rounded-lg` (8px), `rounded-xl` (12px), or `rounded-2xl` (16px).** These are consumer-grade radii that look out of place in a B2B tool.
- The default for any new element is `rounded-sm` (2px). If you're unsure, use `rounded-sm`.
- `rounded-full` is reserved for elements whose identity depends on being circular or pill-shaped.
- When in doubt, prefer sharper. A 0px corner is always acceptable; an 8px corner rarely is.

### 8.3 Rationale

B2B products communicate precision, density, and utility. Large corner radii signal friendliness and approachability — appropriate for consumer apps but incongruent with professional tools. The 0–2px range keeps edges crisp while avoiding the harshness of perfectly square corners.

---

## 9. Color Philosophy & Token Architecture

**Source:** Session 2026-03-29, comparative analysis with IBM Carbon and Goldman Sachs One GS design systems.

### 9.1 The Palette Is a Toolkit, Not a Mandate

The color file (`src/styles/tokens/_colors.scss`) contains a comprehensive, accessible palette influenced by the IBM Carbon Design System. **Having a color defined in the palette does not mean it must be used.** The palette exists so that when a color is needed, there is a pre-vetted, accessible option ready — not so that every color gets deployed into the UI.

When an agent is prompted to use a color from the extended palette, it should:
1. Check that the color serves a clear functional purpose (status, differentiation, data encoding).
2. Verify accessibility contrast ratios against its intended background (see §9.8).
3. Document the rationale for adoption here in this section.

### 9.2 Neutral-Dominant UI

The interface should remain **predominantly neutral with minimal, intentional hits of color.** The neutral gray family and the brand accent (purple-indigo) carry the visual identity. Extended palette colors (blue, red, green, yellow, etc.) appear only where they have a specific functional role.

### 9.3 Brand Accent: Lumen Blue-Violet

**Adopted 2026-03-29.** The accent scale is ported from the Cadence Design System's "Lumen" color family, originally designed for the IBM Carbon project. Lumen is a perceptually uniform blue-violet ramp with no hue discontinuity — the previous accent had a visible hue jump at step 50 where desaturated blue-gray shifted abruptly to warm indigo.

| Aspect | yilangao.com | IBM Carbon |
|--------|-------------|------------|
| Primary interactive color | Lumen blue-violet `accent-60` (#3336FF) | Blue 60 (#0F62FE) |
| Links | `accent-60` | Blue 60 |
| Focus indicators | `accent-60` | Blue 60 |
| Interactive borders | `accent-60` | Blue 60 |

| Step | Hex | Usage |
|------|-----|-------|
| 10 | #F0F5FD | Highlight backgrounds, sidebar accent (light mode) |
| 20 | #D5E0FC | Selection highlight, action-brand-subtle |
| 30 | #B3C5FC | — |
| 40 | #8DA3FC | Playground accent + ring (dark mode, 7.56:1 on #161616) |
| 50 | #7182FD | ~~Playground accent (light mode)~~ — **Removed:** 3.33:1 on white fails WCAG AA. |
| 60 | **#3336FF** | **Key brand color.** Playground accent + ring (light mode, 6.75:1 on white). Links, focus, interactive borders, brand surfaces. |
| 70 | #0004E2 | — |
| 80 | #0003A7 | — |
| 90 | #000273 | Selection text color |
| 100 | #05063E | — |

The Lumen accent IS the brand. It must never be replaced with Carbon's blue for interactive elements. Carbon's blue family is available in the palette for *informational* use cases (info states, data visualization) where blue is semantically expected.

### 9.4 Carbon Color Provenance

The extended palette (`$portfolio-blue-*`, `$portfolio-red-*`, etc.) is sourced directly from `@carbon/colors` v11. These are the exact hex values from the IBM Design Language — they are not approximations. The neutral gray family (`$portfolio-neutral-*`) was already identical to Carbon's gray palette before this expansion.

The only non-Carbon value in the palette is `$portfolio-neutral-05` (#F9F9F9), which is a yilangao.com addition for a subtle secondary surface.

### 9.5 Token Architecture: Property · Role · Emphasis

**Adopted 2026-03-29.** Inspired by Goldman Sachs One GS design system's structured color taxonomy.

Semantic tokens follow a consistent three-part naming formula:

```
$portfolio-{property}-{role}[-{emphasis}]
```

**Property** — What element type the color applies to:

| Property | Purpose | A11y Target |
|----------|---------|-------------|
| `surface` | Background fills. Any container housing content. | — |
| `text` | Text elements. | 4.5:1 AA |
| `icon` | Icon elements. Separate from text for lower contrast threshold. | 3:1 AA |
| `border` | Border and divider lines. | — |
| `action` | Buttons, selected fills, interactive controls. | — |

**Role** — Semantic intent of the color:

| Role | Purpose |
|------|---------|
| `neutral` | Default UI chrome. Black in light mode, white in dark mode. |
| `brand` | Brand identity color (purple-indigo accent). |
| `inverse` | Flipped for use on inverse backgrounds. Swaps in dark mode. |
| `always-light` | Stays light in both modes (e.g., white text on brand-colored backgrounds). |
| `positive` | Success, confirmation, positive metrics. |
| `warning` | Caution, non-critical alerts. |
| `negative` | Errors, destructive actions, negative metrics. |
| `overlay` | Semi-transparent overlay (surface only). |

**Emphasis** — Prominence level (relative within the same property + role):

| Emphasis | Meaning |
|----------|---------|
| `bold` | Strongest prominence, highest contrast. |
| `regular` | Standard prominence. |
| `subtle` | Lesser prominence, lighter fills. |
| `minimal` | Least prominence, most recessive. |
| `disabled` | Disabled state (text, border only). |

Not all tokens carry an emphasis modifier. Functional roles (positive, warning, negative) typically have a single value per property. Emphasis is **relative** — `surface.neutral.bold` is the darkest neutral surface, but still lighter than `text.neutral.bold`.

**Examples of composed token names:**

| Token | Reads as | Maps to |
|-------|----------|---------|
| `$portfolio-text-neutral-bold` | Bold neutral text | neutral-100 (#161616) |
| `$portfolio-text-neutral-regular` | Regular neutral text | neutral-70 (#525252) |
| `$portfolio-surface-neutral-minimal` | Minimal neutral surface | neutral-00 (#FFFFFF) |
| `$portfolio-surface-negative-subtle` | Subtle negative surface | red-10 (#FFF1F1) |
| `$portfolio-icon-brand-bold` | Bold brand icon | accent-60 (#4A3ADB) |
| `$portfolio-action-brand-subtle` | Subtle brand action fill | accent-20 (#D9D9FF) |
| `$portfolio-border-neutral-bold` | Bold neutral border | neutral-50 (#8D8D8D) |
| `$portfolio-text-negative` | Negative text (no emphasis) | red-60 (#DA1E28) |

### 9.6 Why Icon Is Separate from Text

Icons have a lower WCAG contrast threshold (3:1 for graphics vs 4.5:1 for text). A design system that forces icons to share text tokens over-constrains icon color choices. By giving icons their own property, we can tune icon colors independently while maintaining appropriate accessibility thresholds.

Currently, icon tokens mirror text values — the separation is structural, not yet visual. This allows future differentiation without a breaking rename.

### 9.7 Legacy Aliases

The previous flat naming convention (`$portfolio-text-primary`, `$portfolio-surface-inverse`, `$portfolio-border-subtle`, etc.) is preserved as backward-compatible aliases in `_colors.scss` §5. These aliases point to the new canonical tokens. **New code should use the property·role·emphasis names.**

| Legacy Name | New Canonical Name |
|-------------|-------------------|
| `text-primary` | `text-neutral-bold` |
| `text-secondary` | `text-neutral-regular` |
| `text-helper` | `text-neutral-subtle` |
| `text-placeholder` | `text-neutral-minimal` |
| `text-disabled` | `text-neutral-disabled` |
| `text-inverse` | `text-inverse-bold` |
| `text-on-color` | `text-always-light-bold` |
| `text-link` | `text-brand-bold` |
| `text-error` | `text-negative` |
| `surface-primary` | `surface-neutral-minimal` |
| `surface-secondary` | `surface-neutral-subtle` |
| `surface-tertiary` | `surface-neutral-regular` |
| `surface-inverse` | `surface-inverse-bold` |
| `border-subtle` | `border-neutral-subtle` |
| `border-strong` | `border-neutral-bold` |
| `border-interactive` | `border-brand-bold` |
| `border-inverse` | `border-inverse-bold` |
| `border-disabled` | `border-neutral-disabled` |

The `support-*` tokens (`support-error`, `support-success`, `support-warning`, `support-info`, `support-caution-minor`, `support-caution-major`) remain as legacy aliases pointing to raw palette values. In the new architecture, their function is served by distributed functional tokens across properties (e.g., `text-negative`, `surface-positive-subtle`, `icon-warning`).

### 9.8 Accent Color Accessibility Policy

**Severity: High** — Discovered 2026-03-29 during self-audit. Accent-50 (#7182FD) was used as `--color-accent` in the playground light mode, appearing as `text-accent` on meaningful content (prop types, token values, active navigation). At **3.33:1** on white, it fails WCAG AA for normal text (4.5:1 required).

**Rule: Any accent step used as foreground text on a neutral surface must achieve 4.5:1 contrast.** This means:
- **Light mode text on white:** Only accent-60 (#3336FF, 6.75:1) or darker may be used. Accent-50 and lighter steps **must not** be used for text.
- **Dark mode text on #161616:** Accent-40 (#8DA3FC, 7.56:1) or lighter may be used. Accent-50 (5.44:1) also passes.
- **Disabled states** are exempt from the 4.5:1 requirement per WCAG (SC 1.4.3 exception).
- **Decorative elements** (borders, backgrounds, focus rings) follow the 3:1 threshold for UI components.

**Playground theme mapping (light / dark):**

| Variable | Light mode | Contrast on bg | Dark mode | Contrast on bg |
|----------|-----------|----------------|-----------|----------------|
| `--color-accent` | accent-60 (#3336FF) | 6.75:1 on white ✓ | accent-40 (#8DA3FC) | 7.56:1 on #161616 ✓ |
| `--color-ring` | accent-60 (#3336FF) | 6.75:1 ✓ | accent-40 (#8DA3FC) | 7.56:1 ✓ |
| `--color-sidebar-accent` | accent-10 (#F0F5FD) | bg only | #262626 | bg only |

### 9.9 Accessibility Contrast Reference (IBM)

From IBM's Design Language — minimum steps between two colors for WCAG contrast:

| Color grade | 4.5:1 (small text) | 3:1 (large text / graphics) |
|-------------|--------------------|-----------------------------|
| White | 60–Black (6 steps) | 50–Black (5 steps) |
| 10 | 60–Black (5 steps) | 50–Black (4 steps) |
| 20 | 70–Black (5 steps) | 60–Black (4 steps) |
| 30 | 70–Black (4 steps) | 70–Black (4 steps) |
| 40 | 80–Black (4 steps) | 70–Black (3 steps) |
| 50 | 90–Black (4 steps) | 80–Black (3 steps) |
| 60 | 10–White (4 steps) | 20–White (4 steps) |
| 70 | 30–White (4 steps) | 40–White (3 steps) |
| 80 | 40–White (4 steps) | 50–White (3 steps) |
| 90 | 50–White (4 steps) | 60–White (3 steps) |
| 100 | 50–White (5 steps) | 60–White (4 steps) |
| Black | 50–White (6 steps) | 60–White (5 steps) |

### 9.10 Colors Not Yet Adopted (Available in Palette)

The following color families are defined in `_colors.scss` but have no current UI use case. They are available for future adoption when a need arises:

| Family | Potential Use Cases | Notes |
|--------|-------------------|-------|
| **Blue** (non-info steps) | Data visualization, link states in non-brand contexts, code syntax | Carbon's primary — use carefully to avoid looking like an IBM product |
| **Red** (non-error steps) | Destructive action gradients, error state backgrounds (red-10 for error banners) | Light steps (10–30) useful for background tints on error states |
| **Green** (non-success steps) | Success banners (green-10 background), progress indicators | Light steps for background tints |
| **Yellow** (non-warning steps) | Star ratings, highlight markers, pending states | Be cautious — yellow has poor contrast on white |
| **Orange** | Caution states, urgency indicators, notifications | Sits between yellow (warning) and red (error) in severity |
| **Teal** | Secondary accent, tags, categories, data series | Cool complement to the purple-indigo brand |
| **Cyan** | Links in specific contexts, informational badges, data series | Close to blue — differentiate carefully |
| **Purple** (Carbon's) | Visited links, special states, data series | Different hue from our accent — our accent is purple-indigo, Carbon's purple is more violet |
| **Magenta** | Tags, decorative elements, data series | Warm accent — use very sparingly in B2B context |

### 9.11 Open Issues (Future Work)

| Issue | Status | Notes |
|-------|--------|-------|
| **Accent scale perceptual jump at step 50** | **Resolved** | Replaced with Lumen scale from Cadence Design System. Lumen is perceptually uniform blue-violet with no hue discontinuity. |
| **Carbon Purple vs. Accent overlap** | Flagged | Two purple families exist (brand accent + Carbon purple). Consider dropping Carbon purple or adding clear gating rules. |
| **Dark mode semantic tokens** | Not started | SCSS defines only light-mode semantics. Dark mode is handled ad-hoc in playground CSS. Canonical dark-mode mappings needed in SCSS when dark mode is prioritized. |
| **`support-info` and `support-caution-major` migration** | Pending | These legacy tokens have no direct equivalent in the new architecture. `info` may warrant its own role; `caution-major` (orange-40) remains legacy-only. |

---

## 10. Interactive Control Design

**Severity: High** — Three compounding interaction bugs in the ScrollSpy demo (FB-017, FB-018) all stemmed from ignoring fundamental input handling principles.

### 10.1 Hit Zone Sizing (Fitts's Law)

Interactive elements that support pointer-based selection (ticks, dots, tabs in a rail) must have generous spacing and hit areas. The pointer target is not the visual element — it's the invisible bounding box the user aims at.

- **Minimum gap between interactive targets:** `gap-4` (16px). Anything tighter requires surgical precision.
- **Pad each target:** Add `py-1` or similar to each interactive element to expand the clickable area beyond its visual footprint.
- **Scrub controls (drag-to-navigate) need even more space** because the user is moving fast — small zones cause overshooting.

### 10.2 Click vs. Drag Gesture Discrimination

Any control that supports both tap-to-navigate and drag-to-scrub **must** disambiguate the two gestures. The pattern:

1. **Pointer down:** Record start position. Do NOT enter drag mode yet.
2. **Pointer move:** If movement exceeds a dead zone threshold (3px), enter drag mode with instant scrolling.
3. **Pointer up:** If drag was never activated, treat as a click — smooth-scroll to the target.

**Never** enter drag mode on `pointerdown`. This swallows click events and makes tap-to-navigate impossible. `e.preventDefault()` on `pointerdown` suppresses the browser's `click` event — intentional for preventing text selection, but it means the component must handle clicks through the pointer event lifecycle, not through `onClick`.

### 10.3 Pointer-to-Index Mapping

When translating a cursor position to a discrete index (which tick, which tab, which item), **always use closest-element detection**, not linear interpolation.

**Wrong:** `Math.round((cursorY - containerTop) / containerHeight * (count - 1))` — this assumes elements are evenly distributed across the full container height. Padding, centering (`justify-center`), and variable gaps all cause the visual positions to diverge from the interpolated zones.

**Right:** Query all target elements, compute the distance from the cursor to each element's center, and return the closest match. This is always correct regardless of layout.

```typescript
const notches = container.querySelectorAll<HTMLElement>("[data-notch-index]");
let closest = 0, minDist = Infinity;
notches.forEach((el, i) => {
  const dist = Math.abs(clientY - (el.getBoundingClientRect().top + el.offsetHeight / 2));
  if (dist < minDist) { minDist = dist; closest = i; }
});
```

### 10.4 Layout Stability During State Changes

When an interactive element changes visual state (active tick widens, hovered button grows), the state change must not alter the layout footprint of its container. The container should be **pre-sized for the maximum state** so transitions only change appearance, not geometry.

- **Fixed-width containers:** Give the track/rail a fixed width (`w-10`) that accommodates the widest tick state. Use `items-end` to align ticks within the fixed space.
- **This is the width-axis equivalent of AP-009** (vertical spacing inconsistency between toggle states). The same principle applies: if a state change causes adjacent content to shift, that's a layout bug.

### 10.5 Transform Conflicts with Animation Libraries

**Source:** Session 2026-03-30, "IT IS STILL NOT FIXED!!!! This text is still aligned to the center."

**Never use CSS `transform` for positioning on elements animated by Framer Motion** (or any library that manages transforms via inline styles). Framer Motion compiles `x`, `y`, `scale`, `rotate` props into an inline `transform` string that **overrides** the CSS class's `transform`. If the CSS uses `transform: translateY(-50%)` for vertical centering and FM animates `x`, the `translateY` is silently dropped.

**Symptom:** An absolutely positioned label uses `top: 50%; transform: translateY(-50%)`. On hover, FM animates it with `x: 4 → 0`. The label appears ~6px below the target because `translateY(-50%)` is overridden.

**Rule:** For elements animated by FM, use **non-transform centering**:
```scss
.label {
  position: absolute;
  top: 0;
  height: $parent-height;    // same as the containing element
  display: flex;
  align-items: center;       // flex centering — no transform needed
}
```

This achieves the same vertical centering without `transform`, so FM's animation of `x` doesn't interfere.

**Incident:** FB-053 — 4th centering/alignment complaint. Labels were 6px below their ticks because FM's `x` animation silently replaced the CSS `translateY(-50%)`.

### 10.6 Paired Visual Channels Must Share State

**Source:** Session 2026-03-30, "there is inconsistency between the notes for the notch and the notch's visual"

When an interactive control communicates state through multiple visual channels (e.g., a tick bar and a text label), **all channels must reflect the same state.** If the bar is bold/dark for active and light/muted for inactive, the paired label must follow the same color and weight progression.

**Violated principle:** The ScrollSpy tick had three distinct visual states (active: `$portfolio-text-primary`; hovered-inactive: `$portfolio-text-placeholder`; default-inactive: `$portfolio-border-subtle`) but the label used a single static color (`$portfolio-text-secondary`) for all states. The label color sat between the active and inactive tick colors, matching neither.

**Rule:** For any control with paired visual elements (bar + label, icon + text, indicator + tooltip):
- Active state: both elements use the primary/bold color; text weight increases (e.g., 400 → 500)
- Inactive state: both elements use the muted/subtle color; text weight stays at base
- The pairing must be enforced through shared state propagation (e.g., `data-active` on the container, CSS descendant selectors)

---

## 11. Information Architecture

**Source:** Session 2026-03-29, sidebar taxonomy redesign.

### 11.1 Taxonomy by Design Task, Not Technical Ancestry

Component categories should answer "what kind of design problem am I solving?" — not "what kind of HTML element is this?" This is the difference between a developer's mental model (component types: primitives, atoms, molecules) and a designer's mental model (design tasks: inputting data, giving feedback, navigating).

**Wrong:** "UI Primitives" containing Button, Toast, Select, Card, Input, Divider, Menu — grouped because they are all "basic" components.

**Right:** Button and Card in "Foundational" (base building blocks), Toast in "Feedback & Overlay" (system responses to user action), Select and Input in "Forms & Controls" (data collection), Menu in "Navigation & Menus" (wayfinding).

The canonical question for placement: *"When a designer reaches for this component, what task are they in the middle of?"*

### 11.1b Conceptual Tiers in Navigation

**Source:** Session 2026-03-29, "put overview and styles together."

The sidebar has three conceptual tiers, each with its own section header:

| Tier | Section Header | Contains | Purpose |
|------|---------------|----------|---------|
| **Foundations** | `FOUNDATIONS` | Overview (system identity), Styles (design tokens) | What the system IS — its identity and visual atoms |
| **Components** | `COMPONENTS` | Base, Feedback, Overlay, Data Display | What the system BUILDS — reusable UI pieces |
| **Utility** | (bottom-pinned) | Archive | System housekeeping |

Items within the Foundations tier may be **direct-link** categories (`href` set, `links: []`) — they navigate directly without opening a flyout. This extends the `NavCategory` type with an optional `href` field. The Overview page is the canonical example: it's a page, not a category with sub-pages.

### 11.2 Curation as Authority

A design system that dumps 15 components into one category is a directory listing, not a design opinion. The system's credibility depends on editorial curation — every component having exactly one logical home signals that a human (or an opinionated system) made deliberate placement decisions. When the organization feels auto-generated, consumers won't trust the design guidance either.

### 11.3 Interaction Proximity (Extended Fitts's Law)

Interactive responses (search results, selection menus, confirmation dialogs) should appear adjacent to the trigger element, not at the viewport center. This extends Fitts's Law from §10.1 — the principle applies not just to hit zone sizing but to where the *response* appears:

- **Right:** Flyout panel appears next to the sidebar search icon (0px travel).
- **Wrong:** Centered modal appears at viewport center (300–500px travel from sidebar edge).

The exception is destructive confirmations and global alerts — these earn center-screen placement because they *should* interrupt flow.

### 11.4 Section Dividers for Conceptual Tiers

When a navigation list contains items that belong to different conceptual tiers (tokens vs. components, settings vs. content, system vs. user), insert visual dividers between tiers. These dividers are not decorative — they are semantic signals that declare "what follows is a different kind of thing." Without them, the user must infer the boundary from context, adding cognitive overhead in the exact place where navigation should be effortless.

- Dividers should be data-driven (a `section` field on the category data), not hardcoded in the render logic.
- Use `text-[9px]` uppercase labels when expanded, `border-t` when collapsed — same vertical space in both states.

### 11.5 Naming Collision Avoidance

**Source:** Session 2026-03-29, "Foundational" category vs "Foundations" section header.

When naming categories, tiers, and sections in a navigation hierarchy, **no two labels may share the same root word at visible proximity**. If a section header reads "Foundations," a category within it (or in an adjacent section) must not be "Foundational" — users parse them as related or redundant, undermining the taxonomy's clarity.

**Rules:**
- Audit names at each hierarchical level for shared stems. "Foundations" and "Foundational" share `found-` → collision.
- Prefer short, distinct nouns over adjective forms: "Base" instead of "Foundational" (both mean "bottom layer," but "Base" has no stem overlap with "Foundations").
- This applies cross-tier: a section header collides with any label the user can see simultaneously, not just labels within the same section.

**Incident:** FB-034 (2026-03-29) — "Foundations" section header and "Foundational" component category caused user confusion. Renamed to "Base."

### 11.6 Vertical Real Estate Economy

In a sidebar, every item competes for screen space. Strategies for reducing vertical footprint without reducing capability:

- **Collapse flat lists into expandable categories**: 5 token links as a flat list → 1 "Tokens" category that expands on hover/click. Saves 4 rows.
- **Progressive disclosure via flyouts**: Category icons in collapsed mode reveal link lists on hover. The full list exists but consumes zero vertical space until needed.
- **Group sub-headers inside flyouts**: Add structure within flyouts rather than adding nesting depth to the sidebar itself.

---

## 12. Overlay & Flyout Positioning

**Source:** Session 2026-03-29, sidebar search flyout architecture.

### 12.1 Portal Escape for Stacking Contexts

CSS `transform` — even an identity transform like `translateX(0)` from Tailwind's animation utilities — creates a new stacking context and a containing block. `position: fixed` elements inside a transformed ancestor are positioned relative to that ancestor, not the viewport. Combined with `overflow: hidden` on the ancestor, the "fixed" element is clipped to the ancestor's bounds.

**Symptom:** A flyout/overlay rendered inside the sidebar appears trapped, clipped, or invisible despite having `position: fixed` and `z-50`.

**Solution:** Render the flyout via `createPortal(…, document.body)`. This physically moves the DOM node outside the sidebar's hierarchy, making it truly viewport-fixed. Maintain a separate ref for the portal content so click-away detection spans both the trigger and the flyout.

**This is not a rare edge case.** Tailwind's `translate-x-*`, `scale-*`, `rotate-*`, and `transform` utilities all trigger containing block creation. Any component that uses transition animations (sidebar collapse, drawer slide, modal entrance) is vulnerable.

### 12.2 Visual Identity Across Spatial Contexts

When the same affordance appears in different spatial contexts (inline vs. flyout, sidebar vs. modal), it must be visually identical. The user's mental model is "one control that lives in different places" — not "two different controls that do the same thing."

Specifically:
- Same `height` (e.g., `h-7`)
- Same `font-size` (e.g., `text-[12px]`)
- Same `padding` (e.g., `pl-6 pr-2`)
- Same `border` and `background` treatment
- Same icon size and position
- Same `border-radius`

If any of these differ, the user perceives two features instead of one, which fractures the interface.

### 12.3 State Coherence Across Mode Transitions

When a component has multiple display modes (collapsed/expanded sidebar, mobile/desktop layout, light/dark theme), every piece of transient state — open menus, search queries, active flyouts, hover states — must either:

1. **Transfer gracefully** to the new mode (e.g., a search query typed in collapsed mode appears in the expanded inline input), or
2. **Reset cleanly** (e.g., the flyout closes and the query clears on mode change).

Never allow transient state from one mode to persist visually in another mode where it doesn't belong. A flyout that stays open when the sidebar expands creates a duplicate control. A hover state that persists when the layout changes creates a ghost element.

The safest default is **reset on mode change**: `useEffect(() => { setOpen(false); setQuery(""); }, [collapsed])`. Transfer is more polished but requires more careful state management.

---

## 13. Content Navigation Policy

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

---

## 14. Playground Consistency Principles

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

---

## 15. Portfolio Grid Layout

**Source:** Session 2026-03-29, "case studies space is taking up a lot of space, not great for quick scanning"

### 15.1 Scannability Over Showcase

The homepage project grid optimizes for **breadth scanning**, not individual project showcase. A portfolio visitor's first action is assessing the range of work — companies, industries, project types — before committing to read any single case study. The grid must let the eye jump between tiles without sequential scrolling.

**Rule:** The homepage grid uses CSS columns masonry (`column-count`), not CSS Grid with row-based flow. Masonry packs cards efficiently by filling vertical gaps, maximizing the number of tiles visible in a single viewport.

### 15.2 Column Count

| Breakpoint | Columns | Rationale |
|------------|---------|-----------|
| Mobile (< md) | 1 | Single-column for readable card widths on narrow screens |
| Medium (md) | 2 | Enough density for scanning without cramming |
| Large (lg+) | 3 | Maximum density — more columns dilute individual card readability |

The user explicitly stated "two to three columns at maximum." Three columns is the upper bound.

### 15.3 Height Variation for Visual Interest

In a masonry layout, uniform card heights create a rigid grid that negates the waterfall effect. Height variation comes from aspect ratio differentiation:

| Card type | Image aspect ratio | Purpose |
|-----------|-------------------|---------|
| Featured | 4:3 | Slightly taller, draws more attention |
| Regular | 3:2 | Compact, efficient scanning |

Both types occupy the same column width. The height difference creates the waterfall stagger.

### 15.4 Layout Spacing — Enterprise Density

The homepage uses B2B-tight spacing throughout. Every value was audited against the §0 density mandate: if whitespace doesn't serve a clear separation purpose, remove it.

| Element | Token | Value | Rationale |
|---------|-------|-------|-----------|
| Layout top/bottom padding | `spacer-3x` | 24px | Enough to clear browser chrome, no more |
| Layout side padding (desktop) | `spacer-4x` | 32px | Standard layout margin |
| Sidebar-to-content gap | `spacer-4x` | 32px | Clear channel between sidebar and grid |
| Sidebar sections gap | `spacer-4x` | 32px | Separates identity/about/teams/links |
| Column gap | `spacer-1.5x` | 12px | Tight gutter — cards are the focus, not the space between them |
| Card margin-bottom | `spacer-1.5x` | 12px | Matches column gap for uniform density |
| Section label margin | `spacer-1.5x` | 12px | Subordinate label, minimal separation from content |

**Rule:** The first visible content must appear within the top 80px of the viewport. No dead zone at the top.

### 15.5 Card Density

Card info (title + category) uses compact padding: `$portfolio-spacer-1x` (8px) vertical, `$portfolio-spacer-0-25x` (2px) horizontal. The image is the primary visual; the text label is a quick identifier, not a content area.

---

## 16. Homepage Information Architecture

**Source:** Session 2026-03-29, hiring manager audit — "mobile experience squeezes, unnecessary tabs, follow Joseph's denser layout"

### 16.1 The Homepage Is Navigation

The homepage sidebar serves as the primary navigation surface. It does NOT need a separate `<Navigation />` bar — the identity block + Links section fulfill that role. Interior pages (case studies, about, experiments) use the shared `<Navigation />` component for consistency.

**Rule:** Every publicly reachable page must be accessible from the homepage sidebar Links section. If a page isn't worth linking from the sidebar, it shouldn't be a public route.

### 16.2 Navigation Link Set

The portfolio has exactly **two** navigation links: **About** and **Experiments**. These appear:
- In the homepage sidebar Links section (alongside social links)
- In the `<Navigation />` component on interior pages

Removed pages from navigation: Reading (low hiring-signal value), Contact (email CTA in footer is lower friction than a form page), Blog (empty page signals abandonment).

**Rule:** Navigation links must pass the hiring manager signal test: "Does visiting this page increase P(Alive)?" A reading list does not. An experiments page demonstrating technical craft does.

### 16.3 Teams + Links Layout — Context-Dependent Stacking

Teams and Links use a responsive 2-column grid (`.teamsAndLinks`). On **tight screens** (mobile/tablet) they sit side-by-side to conserve vertical space and get to work faster. On **wide screens** (desktop sidebar) they stack vertically — the sidebar has plenty of height and the vertical rhythm reads better.

| Breakpoint | Layout | Rationale |
|------------|--------|-----------|
| Default (< lg) | Side-by-side (`1fr 1fr`) | Save vertical space, work visible sooner |
| Large (lg+) | Stacked (`1fr`) | Sidebar has room; vertical flow matches other sidebar sections |

**Rule:** When the sidebar is the primary content column (mobile), pack information horizontally. When it's a secondary column alongside work (desktop), let it breathe vertically.

### 16.4 Mobile Density

On mobile, the sidebar stacks above the project grid. Every pixel of sidebar height is a pixel of project grid hidden below the fold. Mobile-specific spacing reductions:

| Element | Desktop | Mobile | Rationale |
|---------|---------|--------|-----------|
| Sidebar section gap | `spacing-07` (32px) | `spacing-05` (16px) | Work visible sooner |
| Layout padding | `spacing-06/07` | `spacing-05/04` | Tighter frame |
| Identity gap | `spacing-02` (6px) | `spacing-01` (2px) | Name+role+location are a single unit |
| Section label margin | `spacing-04` (12px) | `spacing-03` (8px) | Labels are subordinate |

**Rule:** Mobile sidebar content must be compact enough that the first project card is visible within ~1.5 screen heights of scrolling. If it takes more, tighten.

---

## 7. Process Principles

### 7.1 Diagnose Before You Patch

When spacing "isn't working," the root cause is usually architectural (wrong CSS layer, wrong theme directive, wrong layout model) — not insufficient padding values. Check the cascade, check the layout mode, check the build output before adding more utilities.

### 7.2 One Fix, One Concept

Each iteration should fix one conceptual problem. Don't scatter changes across 15 files to fix a spacing issue that has a single root cause (e.g., unlayered reset).

### 7.3 Check the Design.md First

Before writing UI code, read this file. If the user's feedback maps to an existing principle, apply the documented solution immediately.

---

## Appendix: Feedback Frequency Map

| Pattern | Times Raised | Priority |
|---------|-------------|----------|
| Spacing / Padding / Breathing Room | 12 | Critical |
| State transition consistency (toggle jump / layout shift / mode coherence) | 6 | Critical |
| Layout integrity (no overlapping, cross-panel alignment) | 5 | Critical |
| Interactive control design (hit zones, gestures, mapping, color-first builders) | 4 | High |
| Dark mode / Theming | 3 | High |
| Overlay / flyout positioning (stacking contexts, portals) | 3 | High |
| Visual hierarchy in navigation | 2 | High |
| Information architecture / taxonomy / naming / tab consolidation | 5 | Critical |
| Visual identity across spatial contexts (size/alignment consistency) | 4 | High |
| Centering / Symmetry | 4 | Critical |
| Token-first, no inline styles | 2 | High |
| CSS framework architecture (global resets breaking inline elements) | 3 | High |
| Collapsibility / Compact modes | 2 | Medium |
| Interaction proximity (response near trigger) | 1 | High |
| Interaction friction (click vs. hover for exploration) | 1 | High |
| Corner radius too large | 1 | High |
| Color philosophy / palette governance | 1 | High |
| Content navigation policy (ScrollSpy threshold, scroll offset) | 2 | High |
| Portfolio grid density / scannability | 1 | High |
| Homepage IA / nav consistency / mobile density | 1 | High |
| User-centric information filtering (audience vs. maintainer data) | 1 | High |
| Playground swatch interaction/shape/size consistency | 3 | High |
| CMS inline edit panel UX (actions, drag, errors, dimensions, validation) | 6 | Critical |
| CMS admin form UX (field labels, descriptions, validation feedback) | 1 | High |
| Upload affordances (contextual upload where content is displayed) | 1 | High |
| Admin controls displacing component content (overlay separation) | 1 | High |
| Interactive visual scoping (content must match section topic) | 1 | High |
| False affordances (static elements styled as interactive) | 1 | High |
| Responsive breakpoints / cross-app parity | 1 | High |
| DS compliance (token adoption, mixin usage, brand color) | 1 | High |
| Undocumented patterns (gradient bg, masonry, dark surface alpha) | 1 | Medium |

---

## 19. Admin UI Palette Policy

**Source:** DS compliance audit, 2026-03-30.

### 19.1 Intentional Split: Admin vs Public Palette

The admin/CMS editing UI (`src/components/ProjectEditModal.module.scss`, `src/components/inline-edit/inline-edit.module.scss`, `src/components/admin/*.module.scss`) intentionally uses a **Tailwind-influenced gray palette** (`#111827`, `#e5e7eb`, `#6b7280`, `#f3f4f6`, `#dc2626`) that differs from the public site's Carbon-based neutrals (`#161616`-`#f4f4f4`).

**Rationale:** The admin UI overlays the public site and must be visually distinct so the user always knows they're in "edit mode." Using the same neutral palette as the site would make admin panels blend into the content, creating ambiguity about what's editable and what's the final output.

**Rules:**
1. The admin palette is a documented exception — it does NOT need to migrate to DS neutral tokens.
2. Brand accent colors (accent-60, accent-70) MUST use DS tokens even in admin components (fixed in Phase 1).
3. Admin error states should use `$portfolio-text-negative` / `$portfolio-support-error` from the DS, not raw `#dc2626`, for consistent error handling across the system.
4. Admin border-radius MAY use larger values (6-10px) to visually distinguish admin controls from the B2B-sharp public components.

---

## 20. Button Component Adoption Policy

**Source:** DS compliance audit, 2026-03-30.

### 19.1 When to Use the DS Button

**Rule:** Any new button that performs a standard action (submit, confirm, cancel, navigate) MUST use `Button` from `src/components/ui/Button/`. Available variants: `primary`, `secondary`, `ghost`, `danger`. Available sizes: `xs`, `sm`, `md`, `lg`, `xl`.

### 19.2 When Raw `<button>` + `@include button-reset` Is Acceptable

Raw buttons are acceptable ONLY when all three conditions are met:
1. The button has a highly custom visual identity that doesn't map to any DS Button variant (e.g., circular icon-only overlay, slider thumb, scrub control tick)
2. The button's styling is context-dependent (changes based on parent hover, animation state, or position)
3. Adding a new Button variant would be single-use and not reusable

**Current documented exceptions:**
- **ScrollSpy ticks** — interactive control geometry, not a standard button
- **Card admin overlays** (edit, reorder) — appear-on-hover overlays with scale transitions
- **Testimonial slider arrows** — dark-surface navigation arrows
- **Drag handles** — DnD affordance, not a standard button

### 19.3 Missing Button Variant: Inverse

The contact page submit button uses `$portfolio-surface-inverse` background (black on light mode) — a pattern not covered by the current DS Button variants. Consider adding a `variant="inverse"` to the Button component.

---

## 21. Undocumented Patterns (DS Gap Analysis)

**Source:** DS compliance audit, 2026-03-30.

These patterns exist in the production portfolio site but have no corresponding DS component, mixin, or documented pattern. They are listed here to track the gap between what the site uses and what the design system formally covers.

### 21.1 Patterns Requiring DS Components

| Pattern | Location | Current Implementation | Recommended DS Action |
|---------|----------|----------------------|----------------------|
| **Category Pill Nav** | Experiments page | Scrollable horizontal pill-shaped filter tabs, dark surface | Create `PillNav` or `FilterBar` DS component |
| **Stat/Metric Callout** | Work/[slug] hero | Raw styles; DS has `stat-*` mixins but they weren't wired | Now wired via `@include stat-sm` (Phase 3). Promote to a `StatCard` component if reused. |
| **Page-Level Scroll Nav** | Experiments (sticky filtered nav) | Custom sticky nav with scroll-shrink animation | Distinct from ScrollSpy; evaluate as `PageNav` component |

### 21.2 Patterns Documented as Exceptions

| Pattern | Location | Rationale for Exception |
|---------|----------|------------------------|
| **Gradient Hero Background** | Contact page | `linear-gradient(165deg, #1a1a2e, #16213e, #0f3460)` — bespoke dark-surface pattern for the contact page's editorial feel. The dark navy gradient creates visual separation from the form card. Tokenizing as a semantic surface would over-generalize a single-use pattern. |
| **Masonry Grid** | Homepage | CSS Grid with round-robin column distribution. The layout is page-specific (homepage only), driven by project card data. A reusable `MasonryGrid` component adds abstraction without reuse benefit. Document as a layout pattern in this section instead. |
| **Fixed Sidebar Layout** | Homepage, Work/[slug] | 300px fixed sidebar + fluid content area. The sidebar width is page-specific (matches the identity block's content needs). The playground has its own sidebar with different dimensions. A shared `SidebarLayout` component would need too many props to accommodate both contexts. |
| **Card Admin Overlay** | Homepage cards | Edit/reorder buttons that appear on hover over project cards. Admin-only UI that overlays CMS content. Follows the admin palette exception (§19). |

### 21.3 Masonry Grid Layout Pattern

**Used on:** Homepage (`src/app/(frontend)/page.module.scss`)

The homepage uses a round-robin column distribution (not CSS `column-count`) with `display: grid` and responsive column counts:

| Breakpoint | Columns | Token |
|------------|---------|-------|
| Mobile (default) | 1 | — |
| `$elan-mq-sm` (672px) | 2 | `repeat(2, 1fr)` |
| `$elan-mq-md` (1056px) | 3 | `repeat(3, 1fr)` |

Gap: `$portfolio-spacer-1-5x` (12px) — tight B2B density per §15.4.

Cards within columns use `flex-direction: column; gap: $portfolio-spacer-1-5x` for vertical spacing. Height variation comes from image aspect ratio (4:3 featured vs 3:2 regular).

### 21.4 Dark Surface Alpha Pattern

**Used on:** Contact page, Experiments page

When text and UI elements appear on dark surfaces (gradients, dark backgrounds), the pattern uses `rgba(255, 255, 255, opacity)` for progressive disclosure:

| Opacity | Use |
|---------|-----|
| 0.04–0.06 | Subtle surface tints, dot patterns, faint backgrounds |
| 0.07–0.12 | Borders, dividers, button outlines |
| 0.25–0.40 | Secondary text, muted labels, inactive controls |
| 0.50–0.65 | Body text, descriptions |
| 0.75 | Emphasized secondary text |
| 1.0 (`$portfolio-text-always-light-bold`) | Primary text, headings, active states |

This alpha system is not tokenized because it's context-dependent — the same opacity on different gradient backgrounds produces different contrast ratios. When dark surfaces are formalized, these should become semantic dark-mode tokens.

---

## Entry Template (for future updates)

```markdown
## N. [Category Name]

### N.1 [Principle Name]

**Source:** Session YYYY-MM-DD, feedback message "[first 10 words...]"
**Problem:** [What went wrong]
**Root cause:** [Why it went wrong]
**Rule:** [The principle to follow going forward]
**Implementation:** [Specific code pattern or token to use]
```

## 17. Interactive Component Accessibility

All interactive components must be usable with keyboard alone, compatible with screen readers, and safe for motion-sensitive users. These standards apply to every component in the design system and every interactive visual in the portfolio.

### 17.1 Keyboard Navigation

**Rule:** Every interactive control (button, tab, toggle, drag handle) must be reachable via keyboard. Tab bars use `role="tablist"` / `role="tab"` with arrow key navigation between tabs. Custom drag interactions (canvas pan, scrub controls) must have keyboard equivalents (arrow keys).

**Implementation:**
- Tab bars: Left/Right arrow keys move between tabs, Home/End jump to first/last
- `tabIndex={0}` on the active tab, `tabIndex={-1}` on inactive tabs — Tab key enters the tab bar, arrows move within
- Canvas/drag: Arrow keys for panning (40px per press), +/- for zoom
- Focus must never become trapped — Escape should release custom key handlers where applicable

### 17.2 ARIA Attributes

**Rule:** Interactive patterns must declare their role and state to assistive technology.

**Implementation:**
- Tab bars: container gets `role="tablist"`, each tab gets `role="tab"`, `aria-selected="true|false"`, `aria-controls="panelId"`. Tab panels get `role="tabpanel"`, `aria-labelledby="tabId"`.
- Interactive diagrams: `role="figure"` with `aria-label` describing the content for screen readers
- Toggle buttons: `aria-pressed="true|false"`
- Live regions: Use `role="status"` with `aria-live="polite"` for content that updates in response to user interaction (e.g., node descriptions, mode indicators)

### 17.3 Focus Indicators

**Rule:** Every focusable element must have a visible focus ring. Never remove `outline` without replacing it.

**Implementation:**
- Default: `outline: 2px solid $portfolio-accent-60; outline-offset: 2px`
- Applied via `&:focus-visible` (not `:focus`) to avoid showing rings on mouse click
- High contrast: ring must pass 3:1 contrast against adjacent colors (accent-60 on white = 6.75:1 ✓)

### 17.4 Motion Sensitivity

**Rule:** Components with animation must respect `prefers-reduced-motion: reduce`. Disable transitions, entrance animations, and auto-playing motion.

**Implementation:**
```scss
@media (prefers-reduced-motion: reduce) {
  * { transition-duration: 0s !important; animation-duration: 0s !important; }
}
```
Applied at the component SCSS module level. FadeIn entrance animations, tab transitions, and canvas zoom all collapse to instant state changes.

### 17.5 Pointer-Only Interaction Equivalents

**Rule:** Any interaction that requires a pointer (drag-to-pan, hover tooltips, scrub controls) must have a keyboard or touch alternative. Pointer-only interactions are enhancements, not requirements.

**Implementation:**
- Drag-to-pan canvas → arrow key panning + zoom buttons
- Hover tooltips → click-to-reveal on touch; focus-triggered on keyboard
- Scrub/slider controls → arrow key increment + click-to-jump

---

## 18. Typography System

**Severity: Foundational** — Typography tokens and semantic mixins define the hierarchy, density, and readability of every screen. This section codifies font role assignments, the mixin catalogue, pairing rules, and enterprise compact guidelines. Informed by an audit of Goldman Sachs OneGS and IBM Carbon design systems.

**Source files:**
- Tokens: `src/styles/tokens/_typography.scss`
- Mixins: `src/styles/mixins/_typography.scss`
- Playground mirror: `playground/src/lib/tokens.ts`

### 18.1 Font Role Assignments

Every font family has exactly one permitted role. Using a font outside its role is a bug.

| Font | Token | Role | Permitted contexts |
|------|-------|------|--------------------|
| **Geist Sans** | `$portfolio-font-sans` | Primary UI | Headings, subtitles, body, labels, captions, stats, legal, helper text — all interface text |
| **Georgia** | `$portfolio-font-serif` | Quotes only | Pull quotes, block quotes, testimonial text, case study epigraphs. NEVER headings, body, or labels. Even more selective than OneGS (which uses serif for headlines). |
| **Geist Mono** | `$portfolio-font-mono` | Code only | Code blocks, inline code, terminal output, build hashes. NEVER data numbers, table columns, or stats. Use `font-variant-numeric: tabular-nums` on Geist Sans for numeric alignment. |
| **Geist Pixel \*** | `$portfolio-font-pixel-*` | Decorative accent | NEVER in interface elements. Only with explicit user instruction. No semantic mixins exist for pixel fonts. |

### 18.2 Semantic Mixin Catalogue (28 mixins, 9 categories)

All mixins are in `src/styles/mixins/_typography.scss`. Usage: `@include heading-1;`

#### Headings — Geist Sans

| Mixin | Size | Weight | Leading | Tracking | Use |
|-------|------|--------|---------|----------|-----|
| `heading-display` | 6xl (60px) | Bold 700 | Tight 1.1 | Tight -0.02em | Hero sections |
| `heading-1` | 5xl (48px) | Bold 700 | Tight 1.1 | Tight -0.02em | Page titles |
| `heading-2` | 4xl (36px) | Semibold 600 | Snug 1.25 | Tight -0.02em | Section titles |
| `heading-3` | 3xl (30px) | Semibold 600 | Snug 1.25 | Normal | Subsection titles |

Fluid variants available: `heading-display-fluid`, `heading-1-fluid`, `heading-2-fluid`, `heading-3-fluid` — use `clamp()` to scale between mobile and desktop.

#### Subtitles — Geist Sans (adopted from OneGS)

| Mixin | Size | Weight | Leading | Use |
|-------|------|--------|---------|-----|
| `subtitle-1` | xl (20px) | Semibold 600 | Snug 1.25 | Section subheading |
| `subtitle-1-bold` | xl (20px) | Bold 700 | Snug 1.25 | Emphasized subheading |
| `subtitle-2` | lg (18px) | Medium 500 | Snug 1.25 | Card/component subheading |
| `subtitle-2-bold` | lg (18px) | Bold 700 | Snug 1.25 | Emphasized card subheading |
| `subtitle-3` | base (16px) | Medium 500 | Snug 1.25 | Inline subheading |
| `subtitle-3-bold` | base (16px) | Bold 700 | Snug 1.25 | Emphasized inline subheading |

#### Body — Geist Sans (weight matrix from OneGS, compact from Carbon)

| Mixin | Size | Weight | Leading | Use |
|-------|------|--------|---------|-----|
| `body-lg` | lg (18px) | Regular 400 | Normal 1.5 | Editorial, long-form |
| `body-lg-light` | lg (18px) | Light 300 | Normal 1.5 | Secondary/supporting large text |
| `body-base` | base (16px) | Regular 400 | Normal 1.5 | Standard body |
| `body-base-medium` | base (16px) | Medium 500 | Normal 1.5 | Emphasized body inline |
| `body-base-light` | base (16px) | Light 300 | Normal 1.5 | Secondary body |
| `body-sm` | sm (14px) | Regular 400 | Normal 1.5 | Dense UI body |
| `body-sm-medium` | sm (14px) | Medium 500 | Normal 1.5 | Emphasized small text |
| `body-compact` | sm (14px) | Regular 400 | Compact 1.15 | Dense panels, sidebars, data tables |
| `body-compact-xs` | xs (12px) | Regular 400 | Compact 1.15 | Very dense tables, metadata rows |

#### Quotes — Georgia (adopted from OneGS + Carbon)

| Mixin | Size | Weight | Leading | Use |
|-------|------|--------|---------|-----|
| `quote-lg` | 2xl (24px) | Regular 400 | Relaxed 1.625 | Pull quotes, testimonials |
| `quote-base` | xl (20px) | Regular 400 | Relaxed 1.625 | Inline block quotes |
| `quote-sm` | lg (18px) | Regular 400 | Relaxed 1.625 | Small quotes, attribution |

All quote mixins set `font-style: italic`.

#### Captions — Geist Sans (from OneGS)

| Mixin | Size | Weight | Leading | Use |
|-------|------|--------|---------|-----|
| `caption` | xs (12px) | Regular 400 | Normal 1.5 | Image captions, timestamps |
| `caption-sm` | 2xs (8px) | Regular 400 | Compact 1.15 | Metadata, dense table secondary info |

#### Labels — Geist Sans

| Mixin | Size | Weight | Leading | Use |
|-------|------|--------|---------|-----|
| `label` | xs (12px) | Medium 500 | Normal 1.5 | Uppercase, wider tracking. Field labels, category tags. |

#### Utility — Geist Sans (from Carbon)

| Mixin | Size | Weight | Leading | Color | Use |
|-------|------|--------|---------|-------|-----|
| `helper-text` | xs (12px) | Regular 400 | Normal 1.5 | Helper (subtle) | Form descriptions below fields |
| `legal` | xs (12px) | Regular 400 | Normal 1.5 | Secondary | Footer copyright, disclaimers |

#### Code — Geist Mono (replaces former `mono-data`)

| Mixin | Size | Weight | Leading | Use |
|-------|------|--------|---------|-----|
| `code-lg` | base (16px) | Regular 400 | Normal 1.5 | Code blocks, large snippets |
| `code-base` | sm (14px) | Regular 400 | Normal 1.5 | Inline code, terminal output |
| `code-sm` | xs (12px) | Regular 400 | Compact 1.15 | Annotations, build hashes |

#### Stats — Geist Sans (adapted from OneGS)

| Mixin | Size | Weight | Leading | Use |
|-------|------|--------|---------|-----|
| `stat-lg` | 7xl (72px) | Light 300 | Tight 1.1 | Hero numbers, KPI dashboards |
| `stat-base` | 5xl (48px) | Light 300 | Tight 1.1 | Secondary stat callouts |
| `stat-sm` | 3xl (30px) | Medium 500 | Snug 1.25 | Tertiary stat callouts |

All stat mixins set `font-variant-numeric: tabular-nums`.

Fluid variants available: `stat-lg-fluid`, `stat-base-fluid`.

### 18.3 Pairing Rules (adopted from Carbon)

Use these pairings to maintain consistent vertical rhythm:

| Heading | Pairs with body | Context |
|---------|----------------|---------|
| `heading-display` | `body-lg` | Hero sections, landing pages |
| `heading-1` | `body-lg` or `body-base` | Page-level content |
| `heading-2` | `body-base` | Section content |
| `heading-3` | `body-sm` or `body-compact` | Subsections, cards |
| `subtitle-1` | `body-base` | Feature descriptions |
| `subtitle-2` | `body-sm` | Card content |
| `subtitle-3` | `body-compact` or `body-compact-xs` | Dense list items, table headers |

### 18.4 Enterprise Compact Guidelines

This is a B2B enterprise SaaS product. Dense, compact UI is the norm.

**When 8px (2xs) is acceptable:**
- `caption-sm`: metadata rows in data tables, secondary timestamps, build version strings
- Contexts where the information is supplementary and the user is not expected to read continuously

**When 12px (xs) is the floor:**
- `caption`, `label`, `helper-text`, `legal`, `code-sm`: any text the user needs to read and act on
- Form labels, error messages, navigation items

**When 14px (sm) is the default:**
- `body-sm`, `body-compact`, `code-base`: standard dense UI body text
- Table cell content, sidebar items, dropdown options

**Productive vs Expressive contexts (concept from Carbon):**
- **Productive contexts** (admin panels, data tables, settings, edit mode): prefer `body-sm`, `body-compact`, `body-compact-xs`, `caption-sm`, `subtitle-3`
- **Expressive contexts** (case studies, about page, testimonials): prefer `body-lg`, `body-base`, `quote-lg`, `heading-display-fluid`, `stat-lg-fluid`

### 18.5 Type Scale Reference

| Token | rem | px | Added in |
|-------|-----|-----|----------|
| `$portfolio-type-2xs` | 0.5 | 8 | Typography revamp (OneGS minimum) |
| `$portfolio-type-xs` | 0.75 | 12 | Original |
| `$portfolio-type-sm` | 0.875 | 14 | Original |
| `$portfolio-type-base` | 1 | 16 | Original |
| `$portfolio-type-lg` | 1.125 | 18 | Original |
| `$portfolio-type-xl` | 1.25 | 20 | Original |
| `$portfolio-type-2xl` | 1.5 | 24 | Original |
| `$portfolio-type-3xl` | 1.875 | 30 | Original |
| `$portfolio-type-4xl` | 2.25 | 36 | Original |
| `$portfolio-type-5xl` | 3 | 48 | Original |
| `$portfolio-type-6xl` | 3.75 | 60 | Original |
| `$portfolio-type-7xl` | 4.5 | 72 | Typography revamp (stat display) |
| `$portfolio-type-8xl` | 6 | 96 | Typography revamp (hero stat display) |

### 18.6 Weight Reference

| Token | Value | Added in |
|-------|-------|----------|
| `$portfolio-weight-thin` | 100 | Typography revamp |
| `$portfolio-weight-extralight` | 200 | Typography revamp |
| `$portfolio-weight-light` | 300 | Original |
| `$portfolio-weight-regular` | 400 | Original |
| `$portfolio-weight-medium` | 500 | Original |
| `$portfolio-weight-semibold` | 600 | Original |
| `$portfolio-weight-bold` | 700 | Original |

### 18.7 Migration Candidates (Phase 6 — Incremental)

These components use raw typography tokens where semantic mixins would be more appropriate. Migrate them as each component is touched for other work.

**Serif in non-quote contexts (violates font role rules):**
- `src/app/(frontend)/contact/page.module.scss` — `.heading` uses serif for a decorative heading. Should evaluate switching to `heading-2-fluid` (sans) or `quote-lg` if the intent is editorial.
- `src/app/(frontend)/contact/page.module.scss` — `.quoteIcon` uses serif for a quote mark glyph. Acceptable as decorative accent.
- `src/app/(frontend)/experiments/page.module.scss` — `.heading` and `.rowTitle` use serif for display headings. Should evaluate switching to heading-fluid variants (sans).

**Mono in non-code contexts:**
- Most mono usage across the codebase (`elan-visuals`, `page.module.scss`, etc.) is for code-like annotations, token names, and technical metadata. These are legitimate code contexts per the typography rules. No migration needed.

**Components with hardcoded px sizes instead of tokens:**
- `src/components/elan-visuals/elan-visuals.module.scss` — many instances of `font-size: 10px`, `9px`. These should eventually use `$portfolio-type-2xs` (8px) or `$portfolio-type-xs` (12px) depending on density needs.
- Various components using `font-size: 11px` — not on the token scale. Evaluate case-by-case.
