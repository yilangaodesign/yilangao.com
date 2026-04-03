# Color Philosophy & Token Architecture

> Spoke file for `docs/design.md`. Return to the [hub](../design.md) for the Section Index.

**Source:** Session 2026-03-29, comparative analysis with IBM Carbon and Goldman Sachs One GS design systems.

### 9.1 The Palette Is a Toolkit, Not a Mandate

The color file (`src/styles/tokens/_colors.scss`) contains a comprehensive, accessible palette influenced by the IBM Carbon Design System. **Having a color defined in the palette does not mean it must be used.** The palette exists so that when a color is needed, there is a pre-vetted, accessible option ready — not so that every color gets deployed into the UI.

When an agent is prompted to use a color from the extended palette, it should:
1. Check that the color serves a clear functional purpose (status, differentiation, data encoding).
2. Verify accessibility contrast ratios against its intended background (see §9.8).
3. Document the rationale for adoption here in this section.

### 9.2 Neutral-Dominant UI

The interface should remain **predominantly neutral with minimal, intentional hits of color.** The neutral gray family and the brand accent (blue-violet) carry the visual identity. Extended palette colors (red, green, yellow, cyan, etc.) appear only where they have a specific functional role.

### 9.3 Brand Accent: Lumen Blue-Violet

**Adopted 2026-03-29. Redesigned 2026-04-03 (OKLCH).**

Lumen is a custom blue-violet accent scale built in OKLCH — a perceptual color space where equal numeric deltas produce equal visual difference. Grade 60 (`#3336FF`) is the immovable brand anchor; all other steps are derived via an even lightness ramp and a sine chroma arc at constant hue ~270deg.

**Construction parameters (OKLCH):**
- **Lightness:** Two-segment even ramp — deltaL ~0.093 (steps 10-60), deltaL ~0.081 (steps 60-100)
- **Chroma:** Sine bell peaking at step 60 (C = 0.281), tapering toward both extremes. Dark half (70-100) chroma optimized for even perceptual distance (max/min ratio 1.33x)
- **Hue:** Constant 269.7deg across all steps (no hue discontinuity)

| Aspect | yilangao.com | IBM Carbon |
|--------|-------------|------------|
| Primary interactive color | Lumen blue-violet `accent-60` (#3336FF) | Blue 60 (#0F62FE) |
| Links | `accent-60` | Blue 60 |
| Focus indicators | `accent-60` | Blue 60 |
| Interactive borders | `accent-60` | Blue 60 |

| Step | Hex | OKLCH (L, C, H) | vs White | vs #161616 | Usage |
|------|-----|-----------------|----------|------------|-------|
| 10 | #EFF3FF | 0.96, 0.016, 269.7 | 1.1:1 | 16.3:1 | Highlight backgrounds, sidebar accent (light mode) |
| 20 | #C5D4FF | 0.87, 0.062, 269.7 | 1.5:1 | 12.2:1 | Selection highlight, action-brand-subtle |
| 30 | #9BB4FF | 0.78, 0.111, 269.7 | 2.0:1 | 8.9:1 | action-brand-bold-disabled (light), pressed (dark) |
| 40 | #7392FF | 0.69, 0.164, 269.7 | 2.9:1 | 6.3:1 | Dark mode text/icon brand, hover (dark), playground accent (dark) |
| 50 | #4E6CFF | 0.59, 0.220, 269.7 | 4.3:1 | 4.2:1 | Dark mode border/action/focus brand |
| 60 | **#3336FF** | **0.50, 0.281, 269.7** | **6.7:1** | 2.7:1 | **Brand anchor.** Links, focus, interactive borders, brand surfaces (light mode). |
| 70 | #261BD5 | 0.42, 0.257, 269.7 | 9.6:1 | 1.9:1 | action-brand-bold-hover (light) |
| 80 | #1A169C | 0.34, 0.200, 269.8 | 12.8:1 | 1.4:1 | action-brand-bold-pressed (light) |
| 90 | #0F1560 | 0.26, 0.129, 269.8 | 16.2:1 | 1.1:1 | Dark mode highlight, action-brand-subtle (dark) |
| 100 | #070D29 | 0.17, 0.058, 269.8 | 19.1:1 | 1.1:1 | surface-brand-subtle (dark) |

The Lumen accent IS the brand. It must never be replaced with Carbon's blue for interactive elements.

### 9.4 Carbon Color Provenance

The extended palette (`$portfolio-red-*`, `$portfolio-green-*`, etc.) is sourced directly from `@carbon/colors` v11. These are the exact hex values from the IBM Design Language — they are not approximations. The neutral gray family (`$portfolio-neutral-*`) was already identical to Carbon's gray palette before this expansion.

**Removals:**
- **Blue family** — Removed 2026-04-03. Blue-60 (#0F62FE, hue ~219deg) was only ~20deg from the brand accent (#3336FF, hue ~270deg), creating semantic confusion between "brand" and "informational" contexts. Cyan and Teal cover cool-informational use cases. `$portfolio-support-info` remapped from `$portfolio-blue-70` to `$portfolio-cyan-70` (#00539A).

**Additions:**
- `$portfolio-neutral-05` (#F9F9F9) — yilangao.com addition for a subtle secondary surface.

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
| `$portfolio-icon-brand-bold` | Bold brand icon | accent-60 (#3336FF) |
| `$portfolio-action-brand-subtle` | Subtle brand action fill | accent-20 (#C5D4FF) |
| `$portfolio-border-neutral-bold` | Bold neutral border | neutral-100 (#161616) |
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

**Rule: Any accent step used as foreground text on a neutral surface must achieve 4.5:1 contrast.** This means:
- **Light mode text on white:** Only accent-60 (#3336FF, 6.7:1) or darker may be used. Accent-50 and lighter steps **must not** be used for text.
- **Dark mode text on #161616:** Accent-40 (#7392FF, 6.3:1) passes WCAG AA. Accent-30 and lighter also pass.
- **Border/action/focus in dark mode:** Accent-50 (#4E6CFF, 4.2:1) passes the 3:1 threshold for UI components.
- **Disabled states** are exempt from the 4.5:1 requirement per WCAG (SC 1.4.3 exception).
- **Decorative elements** (borders, backgrounds, focus rings) follow the 3:1 threshold for UI components.

**Playground theme mapping (light / dark):**

| Variable | Light mode | Contrast on bg | Dark mode | Contrast on bg |
|----------|-----------|----------------|-----------|----------------|
| `--color-accent` | accent-60 (#3336FF) | 6.7:1 on white ✓ | accent-40 (#7392FF) | 6.3:1 on #161616 ✓ |
| `--color-ring` | accent-60 (#3336FF) | 6.7:1 ✓ | accent-40 (#7392FF) | 6.3:1 ✓ |
| `--color-sidebar-accent` | accent-10 (#EFF3FF) | bg only | #262626 | bg only |

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
| **Red** (non-error steps) | Destructive action gradients, error state backgrounds (red-10 for error banners) | Light steps (10–30) useful for background tints on error states |
| **Green** (non-success steps) | Success banners (green-10 background), progress indicators | Light steps for background tints |
| **Yellow** (non-warning steps) | Star ratings, highlight markers, pending states | Be cautious — yellow has poor contrast on white |
| **Orange** | Caution states, urgency indicators, notifications | Sits between yellow (warning) and red (error) in severity |
| **Teal** | Secondary accent, tags, categories, data series | Cool complement to the purple-indigo brand |
| **Cyan** | Info states (`support-info` remapped here), informational badges, data series | Hue-distinct from brand accent (~45deg separation) |
| **Purple** (Carbon's) | Visited links, special states, data series | Different hue from our accent — our accent is blue-violet (~270deg), Carbon purple is more red-violet (~268deg). ~29deg separation is sufficient. |
| **Magenta** | Tags, decorative elements, data series | Warm accent — use very sparingly in B2B context |

### 9.12 Text Color Brightness Inversion Rule

**Source:** Session 2026-04-01, feedback "For the footer, the dark mode color should be slightly lighter"

**Rule: All functional color tokens must follow a brightness inversion pattern — darker steps in light mode, lighter steps in dark mode.** The exact step offset depends on the property type and its WCAG threshold:

- **Text tokens** (4.5:1 threshold): step-60 (light) / step-40 (dark)
- **Icon tokens** (3:1 threshold): step-60 (light) / step-40 (dark) — mirrors text for visual consistency
- **Border tokens** (3:1 threshold per WCAG 1.4.11): step-60 (light) / step-50 (dark)
- **Action tokens** (background fills): step-60 (light) / step-50 (dark) — matches border pattern

**Rationale:** The user observed that brand text already inverts well (accent-60 on white, accent-40 on dark) and asked why other colored text didn't follow the same rule. Warning tokens across all properties used yellow-30 in both modes — yielding 1.68:1 on white (catastrophic fail). The fix aligns all properties to systematic step offsets.

**Implementation — complete token map (text/icon):**

| Role | Light mode (`:root`) | Dark mode (`[data-theme="dark"]`) | Light contrast on white | Dark contrast on #161616 |
|------|---------------------|----------------------------------|------------------------|-------------------------|
| Brand | accent-60 (#3336FF) | accent-40 (#7392FF) | 6.75:1 | 6.26:1 |
| Negative | red-60 (#DA1E28) | red-40 (#FF8389) | 5.00:1 | 7.63:1 |
| Positive | green-60 (#198038) | green-40 (#42BE65) | 5.02:1 | 7.57:1 |
| Warning | yellow-60 (#8E6A00) | yellow-40 (#D2A106) | 4.99:1 | 7.62:1 |

**Implementation — border/action token map (step-60/step-50):**

| Role | Light mode (`:root`) | Dark mode (`[data-theme="dark"]`) | Light contrast on white | Dark contrast on #161616 |
|------|---------------------|----------------------------------|------------------------|-------------------------|
| Negative | red-60 (#DA1E28) | red-50 (#FA4D56) | 5.00:1 | 5.40:1 |
| Positive | green-60 (#198038) | green-50 (#24A148) | 5.02:1 | 5.40:1 |
| Warning | yellow-60 (#8E6A00) | yellow-50 (#B28600) | 4.99:1 | 5.43:1 |

**When adding a new functional color role** (e.g., `info`), apply the same rules: step-60 as the light-mode SCSS source, step-40 dark override for text/icon, step-50 dark override for border/action. Verify contrast against both white and #161616 before shipping.

**For non-DS contexts** (Tailwind utility classes in the playground, one-off components): use the `dark:` variant with a lighter step. The pattern: one Tailwind step darker for light mode, one step lighter for dark mode (e.g., `text-red-600 dark:text-red-400`).

### 9.11 Open Issues (Future Work)

| Issue | Status | Notes |
|-------|--------|-------|
| **Accent scale perceptual uniformity** | **Resolved (2026-04-03)** | Rebuilt entire scale in OKLCH with grade 60 as anchor. Even lightness ramp (deltaL ~0.09), sine chroma arc, constant hue 269.7deg. The old scale had a 60% lightness cliff at step 50-to-60; the new scale has <2% asymmetry across the critical 40-60 zone. Dark-half chroma subsequently optimized to reduce max/min perceptual distance ratio from 1.48x to 1.33x (steps 70-100 redistributed). |
| **Carbon Blue vs. Accent hue collision** | **Resolved (2026-04-03)** | Blue family removed. Blue-60 (#0F62FE, hue ~219deg) was only ~20deg from accent-60 (#3336FF, hue ~270deg). `$portfolio-support-info` remapped to `$portfolio-cyan-70`. |
| **Carbon Purple vs. Accent overlap** | **Resolved (2026-04-03)** | Kept. Purple-60 (#8A3FFC, hue ~268deg) has ~29deg separation from the accent and leans red-violet vs the accent's blue-violet. Perceptually distinct. |
| **Dark mode semantic tokens** | Mostly resolved | Text/icon (step-60/step-40) and border/action (step-60/step-50) tokens for all four functional roles now have canonical dark-mode overrides (§9.12). Surface tokens remain: `surface-warning-bold` uses yellow-30 in both modes intentionally (bright attention-grabbing background). |
| **`support-info` and `support-caution-major` migration** | Partially resolved | `support-info` remapped from `$portfolio-blue-70` to `$portfolio-cyan-70` (#00539A) as part of blue removal. `info` may still warrant its own role. `caution-major` (orange-40) remains legacy-only. |
