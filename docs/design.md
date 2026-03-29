# Design System — Accumulated Knowledge

> **What this file is:** The synthesized, authoritative design pattern knowledge base for yilangao.com. Every principle here was extracted from real user feedback during design iteration. This is a living document — it grows after every chat session.
>
> **Who reads this:** Every AI agent before making any UI change.
> **Who writes this:** AI agents after processing user feedback via the `design-iteration` skill.
> **Last updated:** 2026-03-29

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

1. **Before writing any UI code**, scan the relevant section below.
2. **If the user gives feedback**, check whether an existing principle already covers it — apply the documented fix, don't re-derive.
3. **After resolving feedback**, update this file: strengthen existing principles or add new ones.

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

### 4.1 Collapsible Sidebar (Collapsed-First Spacing)

Every persistent sidebar must support two states:
- **Expanded**: Full labels, section headers, footer. Width ≤ 200px.
- **Collapsed**: Icon-only, square icon buttons, section dividers. Width ≈ 40px.

**Critical:** Both states must share identical vertical rhythm — same tab height, same section separator height, same section gap. The collapsed state defines the canonical values; the expanded state conforms to them. See §1.4 for exact values.

The toggle control lives **inside the sidebar header** (top-right), not in the main content header.

### 4.2 Collapsed State — Symmetry & Centering

In icon-only mode:
- Each icon button: **square proportion** (e.g., `w-7 h-7` = 28×28px).
- Container: just enough width for the button + 4–8px padding on each side.
- Centering: Use `justify-center` on the full-width flex item. **Never** `w-10 mx-auto` — it's fragile when combined with container padding.
- Section dividers: **full-width** `border-t` — never truncated with a fixed `w-*` class.

### 4.3 Visual Hierarchy in Expanded Sidebar

- **Section headers** (TOKENS, COMPONENTS): `text-[9px]`, `font-medium`, `tracking-[0.12em]`, `uppercase`, `text-sidebar-muted-foreground/50`. Smaller, lighter, clearly distinct from nav links.
- **Nav links**: `text-[13px]`, `font-normal/medium`, indented `pl-5` to visually nest under headers.
- The height of section headers should match nav link height for rhythm, but the visual weight must be clearly lower.

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

## 9. Color Philosophy

**Source:** Session 2026-03-29, comparative analysis of yilangao.com palette vs IBM Carbon Design System.

### 9.1 The Palette Is a Toolkit, Not a Mandate

The color file (`src/styles/tokens/_colors.scss`) contains a comprehensive, accessible palette influenced by the IBM Carbon Design System. **Having a color defined in the palette does not mean it must be used.** The palette exists so that when a color is needed, there is a pre-vetted, accessible option ready — not so that every color gets deployed into the UI.

When an agent is prompted to use a color from the extended palette, it should:
1. Check that the color serves a clear functional purpose (status, differentiation, data encoding).
2. Verify accessibility contrast ratios against its intended background (see §9.6).
3. Document the rationale for adoption here in this section.

### 9.2 Neutral-Dominant UI

The interface — especially the design system documentation site and the playground — should remain **predominantly neutral with minimal, intentional hits of color.** The neutral gray family and the brand accent (purple-indigo) carry the visual identity. Extended palette colors (blue, red, green, yellow, etc.) appear only where they have a specific functional role.

This aligns with IBM's own guidance: *"The Neutral Gray family is dominant in our UI, making use of subtle shifts in value to help organize content into distinct zones."*

### 9.3 Brand Accent vs. Carbon Primary

| Aspect | yilangao.com | IBM Carbon |
|--------|-------------|------------|
| Primary interactive color | Purple-indigo `accent-60` (#4A3ADB) | Blue 60 (#0F62FE) |
| Links | `accent-60` | Blue 60 |
| Focus indicators | `accent-60` | Blue 60 |
| Interactive borders | `accent-60` | Blue 60 |

The purple-indigo accent IS the brand. It must never be replaced with Carbon's blue for interactive elements. Carbon's blue family is available in the palette for *informational* use cases (info states, data visualization) where blue is semantically expected.

### 9.4 Carbon Color Provenance

The extended palette (`$portfolio-blue-*`, `$portfolio-red-*`, etc.) is sourced directly from `@carbon/colors` v11. These are the exact hex values from the IBM Design Language — they are not approximations. The neutral gray family (`$portfolio-neutral-*`) was already identical to Carbon's gray palette before this expansion.

The only non-Carbon value in the palette is `$portfolio-neutral-05` (#F9F9F9), which is a yilangao.com addition for a subtle secondary surface.

### 9.5 Semantic Token Mapping

Semantic tokens map palette colors to UI roles. Components consume **only** semantic tokens, never raw palette values. Current semantic mappings and their rationale:

| Semantic Token | Maps To | Rationale |
|---------------|---------|-----------|
| `support-error` | `red-60` (#DA1E28) | Matches Carbon exactly. Universal error red. |
| `support-success` | `green-60` (#198038) | Carbon White theme uses Green 50 (#24A148); we use Green 60 for slightly better contrast on white (5.9:1 vs 4.5:1). |
| `support-warning` | `yellow-30` (#F1C21B) | Matches Carbon exactly. Yellow is universal for warnings. Note: yellow-30 on white has low contrast (1.3:1) — always pair with a dark icon or text. |
| `support-info` | `blue-70` (#0043CE) | Matches Carbon exactly. Blue is universally understood as "informational." Deliberately NOT our accent color — info states should feel neutral/systematic, not branded. |
| `support-caution-major` | `orange-40` (#FF832B) | Matches Carbon. For elevated caution states that are more severe than a warning but not an error. |
| `text-helper` | `neutral-60` (#6F6F6F) | Matches Carbon's `$text-helper`. For captions, help text, metadata — a tertiary text level between secondary and placeholder. |
| `text-error` | `red-60` (#DA1E28) | Matches Carbon. Alias to support-error for use in form validation messages. |
| `text-on-color` | `neutral-00` (#FFFFFF) | White text on brand/interactive backgrounds. |
| `border-disabled` | `neutral-30` (#C6C6C6) | Matches Carbon's `$border-disabled`. |
| `focus` | `accent-60` (#4A3ADB) | Our brand color, NOT Carbon's Blue 60. Focus rings carry brand identity. |
| `highlight` | `accent-20` (#D9D9FF) | Light accent wash for selection/highlight states. Carbon uses Blue 20; we use our accent equivalent. |

### 9.6 Accessibility Contrast Reference

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

### 9.7 Colors Not Yet Adopted (Available in Palette)

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
| Spacing / Padding / Breathing Room | 9 | Critical |
| Corner radius too large | 1 | High |
| State transition consistency (toggle jump) | 1 | Critical |
| Layout integrity (no overlapping) | 3 | Critical |
| Dark mode / Theming | 3 | High |
| Visual hierarchy in navigation | 2 | High |
| Centering / Symmetry | 2 | Medium |
| Token-first, no inline styles | 2 | High |
| CSS framework architecture | 2 | High |
| Collapsibility / Compact modes | 2 | Medium |
| Color philosophy / palette governance | 1 | High |

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
