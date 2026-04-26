<!-- graph metadata for docs knowledge graph (see docs/knowledge-graph.md) -->
---
type: spoke
id: design-admin-ui
topics:
  - design
  - cms
derivedFrom:
  - design.md
---

# Admin UI, Button Adoption & Undocumented Patterns

> Spoke file for `docs/design.md`. Return to the [hub](../design.md) for the Section Index.

## §19 Admin UI Palette Policy

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

## §20 Button Component Adoption Policy

**Source:** DS compliance audit, 2026-03-30.

### 20.1 When to Use the DS Button

**Rule:** Any new button that performs a standard action (submit, confirm, cancel, navigate) MUST use `Button` from `src/components/ui/Button/`. Available appearances: `neutral`, `highlight`, `positive`, `negative`, `warning`, `inverse`, `always-dark`, `always-light` (with `emphasis` and `size`). For `<a href="…">` navigation that must look like a button, compose the same appearance classes from `Button.module.scss` onto `Link` (see `AdminBar.tsx`) so hover, focus-visible, and dark-mode contrast fixes stay aligned with the DS.

**Reference composition — `AdminBar`:** The role label is **informational**, not a status or call-to-action — the toolbar copy and layout already explain edit mode, so the chip must not compete with primary actions. Use `<Badge appearance="neutral" emphasis="regular" size="sm" shape="squared">` (no `mono`, no brand `highlight`). **Always-dark chrome caveat:** `neutral`/`regular` maps `surface-neutral-minimal` to the same value as `surface-always-dark` when the site is in dark theme; `AdminBar.module.scss` adds `.adminContextBadge` to bump the fill to `surface-neutral-subtle` in `[data-theme="dark"]` / `.dark` so the bordered pill stays visible. Primary edit and secondary Dashboard links stay on `Button` module classes (`highlight`/`bold`/`sm` and `alwaysLight`/`subtle`/`sm`); dismiss uses `<Button appearance="always-light" emphasis="minimal" iconOnly>`.

### 20.2 When Raw `<button>` + `@include button-reset` Is Acceptable

Raw buttons are acceptable ONLY when all three conditions are met:
1. The button has a highly custom visual identity that doesn't map to any DS Button variant (e.g., circular icon-only overlay, slider thumb, scrub control tick)
2. The button's styling is context-dependent (changes based on parent hover, animation state, or position)
3. Adding a new Button variant would be single-use and not reusable

**Current documented exceptions:**
- **ScrollSpy ticks** — interactive control geometry, not a standard button
- **Card admin overlays** (edit, reorder) — appear-on-hover overlays with scale transitions
- **Testimonial slider arrows** — dark-surface navigation arrows
- **Drag handles** — DnD affordance, not a standard button

### 20.3 Missing Button Variant: Inverse

The contact page submit button uses `$portfolio-surface-inverse` background (black on light mode) — a pattern not covered by the current DS Button variants. Consider adding a `variant="inverse"` to the Button component.

---

## §21 Undocumented Patterns (DS Gap Analysis)

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
