# Design System — Accumulated Knowledge

> **What this file is:** The synthesized, authoritative design pattern knowledge base for yilangao.com. Every principle here was extracted from real user feedback during design iteration. This is a living document — it grows after every chat session.
>
> **Who reads this:** AI agents routed here by `AGENTS.md` Pre-Flight. Read the Section Index first, then only the section matching your task.
> **Who writes this:** AI agents after processing user feedback via the `design-iteration` skill.
> **Last updated:** 2026-03-29 (§11.5 naming collision avoidance + spacing fix)

---

## Section Index — Read This First

| § | Topic | Read when |
|---|-------|-----------|
| §0 | Design Posture | Always for UI work (~10 lines — read this every time) |
| §1 | Spacing & Breathing Room | Touching spacing, padding, gaps, hit zones |
| §2 | Layout Integrity | Changing layout, positioning, flex structure |
| §3 | CSS Framework (Tailwind v4) | Touching CSS config, layers, theme directives |
| §4 | Navigation Design | Modifying sidebar, nav, collapsible panels, category flyouts |
| §5 | Theming | Touching colors, dark mode, CSS variables |
| §6 | Responsive Design | Touching breakpoints, fluid layout, viewports |
| §8 | Corner Radius | Adding or modifying border-radius |
| §9 | Color Philosophy & Token Architecture | Adopting palette colors, token naming (property·role·emphasis), semantic tokens |
| §10 | Interactive Controls | Building scrub/drag/click controls, hit zones, gesture handling |
| §11 | Information Architecture | Organizing components/tokens into categories, taxonomy design, naming collisions |
| §12 | Overlay & Flyout Positioning | Flyouts, portals, stacking contexts, state coherence across modes |
| §13 | Content Navigation Policy | Adding ScrollSpy or secondary nav aids to long pages |
| §14 | Playground Consistency Principles | Token page visual consistency, user-centric information filtering |
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

### 1.2 IBM Carbon Spacing Scale (Reference)

Use these as the canonical spacing tokens. When in doubt, round up.

| Token | Value | Use |
|-------|-------|-----|
| `spacing-03` | 8px | Icon padding, compact element gaps |
| `spacing-04` | 12px | List item vertical padding |
| `spacing-05` | 16px | Nav link horizontal padding, card internal padding minimum |
| `spacing-06` | 24px | Section gaps, card padding standard |
| `spacing-07` | 32px | Content area padding, major section spacing |
| `spacing-08` | 40px | Large viewport content padding |
| `spacing-09` | 48px | Page-level vertical rhythm |
| `layout-01` | 16px | Minimum layout margin |
| `layout-02` | 24px | Standard layout margin |
| `layout-03` | 32px | Comfortable layout margin |
| `layout-04` | 48px | Generous layout margin |

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

### 6.1 Content Containers

- Use `max-w-5xl` (not `max-w-4xl`) for content wrappers — allows content to breathe on wide screens.
- Add `overflow-x-auto` to any table or grid that might exceed viewport width.
- Mobile: Content must be usable without the sidebar visible (sidebar slides in as overlay).

### 6.2 Fluid, Not Fixed

Avoid hardcoded pixel widths for content areas. Use `flex-1 min-w-0` to let content fill available space naturally.

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

### 13.3 Scroll Offset for Sticky Headers

Any section targeted by `scrollIntoView({ block: "start" })` or anchor navigation must have `scroll-mt-{N}` (e.g., `scroll-mt-16`) to prevent the heading from scrolling under a sticky header bar. This applies to the `SubSection` component and any element with an `id` used for scroll targeting.

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

Concrete rule: A swatch is `h-14` with `rounded-sm border border-border/50`. No `large` variant. No inline card alternative. One element, one treatment.

### 14.2 User-Centric Information Filtering

Every piece of information displayed in the playground must pass the audience filter: **"Does the consumer of this design system need to see this?"**

- **Show:** Current token name, current value, usage guidance, accessibility notes.
- **Don't show:** Legacy names, migration history, internal refactoring notes, version diffs.

Historical information belongs in changelogs, git history, and `docs/` — not in the product surface. The playground is a product, not a developer console.

### 14.3 Metadata as Footnotes

System-level metadata (version, last updated, build environment) belongs in a page footer — never inline with token content. It should be visually subordinate: `text-[11px]`, `font-mono`, reduced opacity. On localhost, prefix with "Local Dev" to distinguish from published builds.

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
| Spacing / Padding / Breathing Room | 10 | Critical |
| State transition consistency (toggle jump / layout shift / mode coherence) | 5 | Critical |
| Layout integrity (no overlapping, cross-panel alignment) | 4 | Critical |
| Interactive control design (hit zones, gestures, mapping) | 3 | High |
| Dark mode / Theming | 3 | High |
| Overlay / flyout positioning (stacking contexts, portals) | 3 | High |
| Visual hierarchy in navigation | 2 | High |
| Information architecture / taxonomy / naming | 4 | High |
| Visual identity across spatial contexts (size/alignment consistency) | 3 | High |
| Centering / Symmetry | 3 | High |
| Token-first, no inline styles | 2 | High |
| CSS framework architecture | 2 | High |
| Collapsibility / Compact modes | 2 | Medium |
| Interaction proximity (response near trigger) | 1 | High |
| Interaction friction (click vs. hover for exploration) | 1 | High |
| Corner radius too large | 1 | High |
| Color philosophy / palette governance | 1 | High |
| Content navigation policy (ScrollSpy threshold) | 1 | Medium |
| User-centric information filtering (audience vs. maintainer data) | 1 | High |

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
