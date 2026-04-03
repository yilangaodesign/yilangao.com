# Design Feedback Log

> **What this file is:** Chronological record of recent design feedback sessions (last 30 entries). Newest entries first.
>
> **Who reads this:** AI agents at session start (scan recent entries for context), and during feedback processing (check for recurring patterns).
> **Who writes this:** AI agents after each feedback cycle via the `design-iteration` skill.
> **Last updated:** 2026-04-03 (FB-096: Accent scale OKLCH redesign + Blue removal)
>
> **For agent skills:** Read only the first 30 lines of this file (most recent entries) for pattern detection.
> **Older entries:** Synthesized in `docs/design-feedback-synthesis.md`. Raw archive in `docs/design-feedback-log-archive.md`.

---

## Session: 2026-04-03 — Accent scale audit + extended palette blue removal

### FB-096: Lumen accent scale perceptually uneven; extended Blue too close to brand

**User feedback:** "There are certain steps that don't really make sense. They're a little bit too close, especially for step 50 (#7182FD). It seriously is not enough of a distinction from 40, and it's too far from 60." Also: "Remove the blue color from the extended palette — it's too close to the brand accent, clashing."

**Root cause:** The old accent scale had uneven OKLCH lightness deltas — the 40-to-50 gap was 0.10 while 50-to-60 was 0.16 (a 60% asymmetry). Combined with a chroma cliff (pastels → maximum saturation in one step), steps 40/50 looked nearly identical while 60 felt disconnected. The extended Blue family (hue ~219deg) was only ~20deg from the accent (hue ~270deg), creating semantic confusion.

**Resolution:**
1. **Accent scale rebuilt in OKLCH** with grade 60 (#3336FF) as immovable anchor. Even lightness ramp (deltaL ~0.093 above, ~0.081 below) with sine chroma arc peaking at the anchor. Constant hue 269.7deg. The critical 40-60 zone now has <2% asymmetry vs the old 60%.
2. **Blue family removed** from `_colors.scss` and all downstream consumers. `$portfolio-support-info` remapped from `$portfolio-blue-70` to `$portfolio-cyan-70` (#00539A).
3. **Purple kept** — 29deg hue separation is sufficient, and it leans red-violet vs the accent's blue-violet.
4. **Playground documentation added** — "How This Scale Is Built" section in the Palette Reference with OKLCH construction parameters, Lumen origin narrative, and full hex/contrast audit table.
5. **Case study updated** — TokenGrid.tsx methodology text changed from "hybrid Carbon luminance" to OKLCH construction.

**Files changed:** `src/styles/tokens/_colors.scss`, `playground/src/lib/tokens.ts`, `playground/src/app/globals.css`, `playground/src/app/tokens/colors/page.tsx`, `playground/src/app/tokens/colors/colors.module.scss`, `src/components/elan-visuals/TokenGrid.tsx`, `src/components/inline-edit/token-map.ts`, `docs/design/color.md`

**Pattern note:** This is the second time the accent scale's perceptual uniformity has been flagged (first: pre-Lumen hue jump at step 50). The root cause both times was hand-picked hex values without systematic perceptual validation. The OKLCH approach makes the scale auditable by construction.

---

## Session: 2026-04-03 — Checkbox height fluctuation on toggle

### FB-095: Checkbox visually fluctuates in height when toggling checked state

**User feedback:** "When I tick the checkbox, it kind of just fluctuates in height or something. It really bothers me."

**Root cause:** Two compounding factors. (1) The Radix `CheckboxPrimitive.Indicator` was mounted/unmounted from the DOM on every state change (no `forceMount`), triggering a brief layout recalculation inside the fixed-size checkbox button. (2) The `.checkbox` element used `transition: all 110ms` (via `transition-fast` mixin), which animated even momentary layout-related property changes during the DOM churn — making the recalculation visible as a size fluctuation.

**Resolution (two iterations):** First attempt used `forceMount` on the Radix Indicator — eliminated DOM mount/unmount but Presence's ResizeObserver/animation machinery still caused sub-frame jitter. Final fix: bypassed `CheckboxPrimitive.Indicator` entirely. Icons are now direct children of the Root button, absolutely positioned with `opacity: 0/1` toggling via CSS `data-state` selectors. Replaced `transition: all` with targeted transitions on `background-color`, `border-color`, `box-shadow`. Added `position: relative` + `overflow: hidden` on the checkbox.

**Design rule — Transition specificity:** Never use `transition: all` on interactive controls with conditional children — always enumerate the specific visual properties (`background-color`, `border-color`, `box-shadow`, `color`, `opacity`). `transition: all` makes layout recalculations visible as glitches.

**Design rule — Radix Indicator bypass:** When entrance/exit animations are not needed, skip the Radix Indicator and render icons directly as children of the Root, using CSS `data-state` selectors for visibility. This eliminates the Presence/ResizeObserver/animation machinery entirely.

**Cross-category note:** Also documented as ENG-104 (engineering) — Radix Indicator bypass for stable layout.

---

## Session: 2026-04-03 — Playground doc primitives: Tailwind to Élan DS migration

### FB-094: Playground documentation infrastructure migrated from Tailwind to Élan DS tokens + SCSS modules

**User feedback:** "Why tf is Tailwind still here? Everything should be built using the actual Élan design system code. Use anything that we can use in the design system as a token instead of hardcoding things that mirror the design system."

**Root cause:** Previous implementation used Tailwind utility classes for all styling in the doc infrastructure files (token-grid.tsx, component-preview.tsx, scroll-spy.tsx, colors/page.tsx). The playground already had `sassOptions.loadPaths` configured to resolve DS sources, but the convenience of Tailwind led to bypassing the DS token system entirely.

**Resolution:**
- Created 4 co-located SCSS modules (`token-grid.module.scss`, `component-preview.module.scss`, `scroll-spy.module.scss`, `colors.module.scss`) using `var(--portfolio-*)` custom properties and `@include` mixins from the DS
- Migrated all 4 TSX files from `className="tailwind-classes"` to `className={s.scssClass}` references
- Eliminated all `cn()` and `@/lib/utils` imports from the migrated files
- Dynamic data-driven inline styles (`style={{ backgroundColor: tokenColor }}`) retained as the one acceptable exception
- Added comprehensive "Styling Policy" section to `SKILL.md` documenting the no-Tailwind mandate, gradual migration plan, and SCSS module conventions
- Updated Composition Rules, Validation Checklist, and typography hierarchy table to reflect DS tokens instead of Tailwind class descriptions

**Cross-category note:** Also documented as an engineering concern — the SCSS module pattern, `sassOptions.loadPaths` configuration, and Turbopack cache flush requirements are engineering infrastructure. See SKILL.md Styling Policy for the canonical reference.

---

## Session: 2026-04-03 — Colors page IA, typography hierarchy, and layout restructure

### FB-093: Playground documentation typography hierarchy standardized; colors page restructured

**User feedback:** The colors page had three problems: (1) information architecture was flat — palette reference (raw primitives) appeared in the same list as semantic token sections with no visual separation; (2) `h3` meant three different things across the playground (uppercase eyebrow, large semibold section title, and ComponentPreview demo title); (3) light/dark theme panels stacked vertically, wasting horizontal space on wide screens.

**Root cause:** The playground grew organically without a codified heading hierarchy. `SubSection` (token-grid.tsx) and `SubsectionHeading` (component-preview.tsx) both used `h3` for what was semantically an `h4`-level eyebrow. The colors page used ad-hoc `h3` tags at `text-lg font-semibold` for property sections — a completely different visual level than the shared components. Section description text alternated between `text-xs` and `text-sm` with no standard.

**Resolution:**
- Defined a standard typography hierarchy: `SectionHeading` (h2), `SectionTitle` (h3, new), `SubsectionTitle` (h4, fixed from h3), `SectionDescription` (p, text-sm), `ZoneDivider` (new). All in `playground/src/components/token-grid.tsx`.
- Changed `SubsectionHeading` in `component-preview.tsx` from h3 to h4 (same visual, correct semantics). Auto-fixes ~40 component pages.
- Refactored the colors page to use shared heading components. Added `ZoneDivider` between semantic tokens and palette reference. Added responsive side-by-side light/dark layout (`lg:flex-row`).
- Standardized section description text from `text-xs` to `text-sm` on spacing and breakpoints pages.
- Added ScrollSpy group divider support for IA zone separation.
- Updated `.cursor/skills/playground/SKILL.md` with "Page Typography Hierarchy" and "ScrollSpy Usage Policy" sections.

**Principle established:** Documentation surfaces must codify their heading hierarchy as shared components, not as ad-hoc inline elements. When the same HTML tag carries multiple visual meanings, the system is already broken — fix the semantic tags and extract shared components before building more pages. This is the same principle as design tokens: naming things forces consistency.

**Files changed:** `playground/src/components/token-grid.tsx`, `playground/src/components/component-preview.tsx`, `playground/src/components/scroll-spy.tsx`, `playground/src/app/tokens/colors/page.tsx`, `playground/src/app/tokens/spacing/page.tsx`, `playground/src/app/tokens/breakpoints/page.tsx`, `.cursor/skills/playground/SKILL.md`

---

## Session: 2026-04-03 — Input xs icon disproportionate to text

#### FB-092: "The icon size for xs is just a hair too big — doesn't match the placeholder typography size"

**User feedback:** At the `xs` size, the input icon (16px) looks disproportionately large next to the 12px font-size placeholder text. It takes up too much space and feels visually unbalanced.

**Root cause:** The `$_input-icon-xs` token was 16px — a 1.33:1 ratio to the 12px text. The other sizes maintain a tighter ~1.1–1.17:1 ratio (e.g., `sm`: 18px icon / 14px text = 1.28, `md`: 20px icon / 16px text = 1.25). The xs size was the outlier.

**Resolution:** Reduced `$_input-icon-xs` from 16px to 14px (1.17:1 ratio to 12px text). This single token change propagates to `iconWrap`, `clearButton`, `statusIcon`, and the loading spinner at the xs size.

**Principle established:** When building components with multiple content types (text, icons, badges), always verify **visual size consistency** across all content slots. Icon size should be proportional to the text scale at every size variant — if the font size drops, the icon must drop with it. The eye tests this as "do these feel like the same weight?" not just "are they technically aligned?"

**Files changed:** `src/components/ui/Input/Input.module.scss` (`$_input-icon-xs: 16px` → `14px`)

---

## Session: 2026-04-03 — Eyebrow component created to canonicalize uppercase text pattern

### FB-091: Eyebrow component built — canonical uppercase tracked text primitive for section headings, group labels, and metric annotations

**Date:** 2026-04-03

**Intent:** User requested building an Eyebrow component based on the text primitive taxonomy established in FB-090. The design system had three divergent implementations of the same visual pattern (uppercase, tracked, small text): the `@include label` mixin (5 consumers), the `@include label-sm` mixin (7 consumers), and VerticalNav's hand-rolled variant (different weight and tracking). No React component existed — every consumer re-implemented the mixin or hand-wrote the styles.

**Diagnosis:** Audit found the VerticalNav variant had drifted from the canonical mixin: weight 500 vs 400, tracking 0.02em vs 0.05em. This drift was actually typographically intentional — heavier strokes at medium weight (500) create more visual air between characters, so tighter tracking (0.02em) compensates. The component needed to formalize both variants as a 2×2 matrix: size (sm/md) × emphasis (subtle/bold).

**Resolution:** Created `src/components/ui/Eyebrow/` with:
- Two sizes: `sm` (10px, compact leading) and `md` (12px, normal leading)
- Two emphases: `subtle` (regular/400, wider tracking 0.05em) and `bold` (medium/500, tighter tracking 0.02em)
- Polymorphic `as` prop supporting span, p, div, dt, legend, h2, h3, h4
- No slots — Eyebrow is pure text; compose with TextRow or flex containers for adjacent content
- Color defaults to `--portfolio-text-secondary`; parent components override via className
- Added to barrel exports, registry, playground with demo page, sidebar navigation

**Principle extracted:** When a visual pattern has drifted across multiple implementations, the component should formalize ALL observed variants (not just the canonical one). The drift often encodes real typographic logic — in this case, weight-tracking compensation. Rejecting the drift and forcing a single recipe would regress the VerticalNav's intentional refinement.

**Cross-category note:** Also documented as FB-090 (taxonomy decision). Existing `@include label` consumers were NOT migrated — that is a separate, higher-risk effort.

---

## Session: 2026-04-03 — Label renamed to TextRow to resolve naming collision

### FB-090: "Label" component renamed to "TextRow" after audit revealed naming collision with 4 distinct label patterns

**Date:** 2026-04-03

**Intent:** User noticed the newly built Label component's name was ambiguous — the design system already uses "label" in four different contexts: (1) the `@include label` mixin (uppercase section headings), (2) `.label` classes in 9 form components, (3) HTML `<label>` element semantics, (4) `.label` / `.itemLabel` in Menu/NavItem for interactive text. The component needed a distinct name.

**Diagnosis:** Full audit of all 45 components under `src/components/ui/` identified three distinct text patterns that should NOT be conflated: **Eyebrow** (uppercase, tracked, section headings), **Form field labels** (coupled to parent control's size system), and **Composed text rows** (standalone inline text with slots). The new component is Pattern 3 only.

**Resolution:** Renamed `Label` → `TextRow` across all surfaces:
- `src/components/ui/Label/` → `src/components/ui/TextRow/` (component, SCSS, barrel)
- Type exports: `LabelProps` → `TextRowProps`, `LabelSize` → `TextRowSize`, etc.
- SCSS root class: `.label` → `.textRow`
- Playground page: `/components/label` → `/components/text-row`
- Sidebar entry: updated href + display name
- Registry: `shared-ui-label` → `shared-ui-text-row`
- Updated all code comments and descriptions to clarify scope: "Use for standalone metadata annotations, key-value pairs, and card metadata. NOT a replacement for eyebrow/section headings, form field labels, or nav/menu item text."

**Principle extracted:** When a design system term is overloaded (used for 3+ distinct visual/semantic patterns), the newer component should yield the name to the established usage. Name by structure (TextRow = "what it IS") rather than role (Label = "what it DOES") when the component serves multiple roles.

**Cross-category note:** Also an engineering rename touching 8 files. No engineering feedback log entry needed — this is a clean rename with no incident or breakage.

---

## Session: 2026-04-03 — Brand status variant for Input

#### FB-089: "Add a brand version for the input field — active state border in the brand color"

**User feedback:** The Input component has neutral, success, error, and warning statuses, but no brand/accent variant. The playground's sidebar search bar already uses the accent color for its active border — the Input component should support this as a first-class status.

**Resolution:** Added `"brand"` to `InputStatus` type. Created `.brand` status block in SCSS following the identical pattern as error/success/warning — sets `border-color` to `--portfolio-border-brand-bold` (accent-60 in light, accent-50 in dark) for both resting and focused states, across both regular and minimal emphasis. No status icon for brand (it signals intent, not validation). Feedback text uses `--portfolio-text-brand-bold`. Playground updated with a brand demo (search input with leading icon).

**Design decision:** Brand follows Option A (colored border at rest, matching other statuses) rather than Option B (neutral at rest, brand on focus only). This is consistent with the existing status pattern and makes the field always visually distinct as a branded/primary element.

**Files changed:** `src/components/ui/Input/Input.tsx`, `src/components/ui/Input/Input.module.scss`, `playground/src/app/components/input/page.tsx`

---

## Session: 2026-04-03 — Input focus border layout shift

#### FB-088: "Clicking the input makes everything jump — placeholder, icons, all content shifts"

**User feedback:** When clicking/focusing the Input component, all content (placeholder text, icons, prefix/suffix) visibly shifts position. The component's geometry changes between resting and active states.

**Root cause:** The resting border was `border: 1px solid` and focus changed it to `border-width: 2px`. The extra 1px on each side (top, right, bottom, left) pushed all internal content inward by 1px, causing a visible jump. This affected both `regular` (all four sides) and `minimal` (bottom border only) emphasis variants, plus all status variant focus overrides (error, success, warning).

**Resolution:** Padding compensation via CSS custom properties. Each size variant now stores its base padding in `--_ic-py` and `--_ic-px`. The container always computes `padding: calc(var(--_ic-py) - var(--_border-offset)) calc(var(--_ic-px) - var(--_border-offset))`. The `--_border-offset` defaults to `0px` and flips to `1px` on `:focus-within` when the border grows from 1px to 2px. This keeps the content in exactly the same position across all states. Three distinct visual states preserved: resting (1px gray), hover (1px black), focus (2px black). For minimal emphasis, only `padding-bottom` compensates since only `border-bottom-width` changes.

**Files changed:** `src/components/ui/Input/Input.module.scss`

**Principle reinforced:** When a design requires border-width changes on state transitions (e.g., thicker focus ring), compensate with padding reduction so content stays fixed. Use CSS custom properties for the base padding values and `calc()` with a `--_border-offset` variable — this scales across all size variants without per-size focus overrides.

---

## Session: 2026-04-02 — Colors page: dual-theme display and token audit

#### FB-087: "Playground colors page doesn't show dark theme values; needs full audit"

**User feedback:** The playground colors page only documented light mode token values. Dark theme border colors (and all other dark mode overrides) were invisible. Color swatches should stay true to their hex values regardless of the playground theme. The page needs to show both light and dark resolved values explicitly.

**Root cause:** The `sync-tokens.mjs` script only parsed `_colors.scss` (light mode SCSS variables). It never read `_custom-properties.scss` where dark mode overrides are defined. The `tokens.ts` data had no concept of `darkValue`. The colors page rendered one set of swatches that showed only light mode hex values, with no way to see what those tokens resolve to in dark mode.

**Resolution:**
1. Enhanced `sync-tokens.mjs` to also parse `_custom-properties.scss` dark mode section (`[data-theme="dark"]`). Added `parseDarkOverrides()` that extracts CSS custom property overrides and resolves them to hex via the palette lookup. Every semantic token and interaction token now carries an optional `darkValue`.
2. Updated `EmphasisToken` and `SemanticToken` types in `tokens.ts` to include `darkValue?: string`.
3. Rewrote the colors page (`playground/src/app/tokens/colors/page.tsx`): each role row now shows a **Light strip** (white background, light mode swatches) and a **Dark strip** (dark background, dark mode swatches). All swatch fills use inline `style={{ backgroundColor }}` with hardcoded hex — they never change with the playground theme toggle.
4. Palette reference section (raw scales) kept as-is — these are theme-invariant primitives.

**Files changed:** `scripts/sync-tokens.mjs`, `playground/src/lib/tokens.ts` (auto-generated), `playground/src/app/tokens/colors/page.tsx`

**Cross-category note:** Also documented as ENG-102 (engineering) — sync-tokens script enhancement.

**Principle reinforced:** Token documentation pages are primitives — they must show the **resolved values**, not just names. For any token that changes between themes, both resolved values must be visible simultaneously. Never rely on theme toggle to reveal dark mode values; that conflates "viewing documentation" with "testing the theme."

---

## Session: 2026-04-02 — Input focus state visual fix

#### FB-086: "Focus state has double-layer border; default focus should be black, not gray"

**User feedback:** Two issues with the Input component's focus state: (1) the active/focused state shows a double-layer border effect, and (2) the default focus border color appears gray instead of black.

**Root cause:** Three compounding issues: (1) The focus-within styles used a `box-shadow` technique (1px white gap + 2px outer ring) that created a visible double-layer border effect. (2) The border token scale was fundamentally miscalibrated — `$portfolio-border-neutral-bold` was mapped to `$portfolio-neutral-50` (#8D8D8D, mid-gray), which is equivalent to One GS's "Regular" level, not "Bold". The entire scale was shifted one level too light. (3) The scale was incomplete — only 2 levels (bold, subtle) existed instead of the 4-level hierarchy (bold, regular, subtle, minimal) that the One GS foundation specifies.

**Resolution:** Three-part fix:
1. Removed all `box-shadow` from focus-within states — focus now uses `border-width: 2px` for visual weight without gap artifacts.
2. Rebuilt the border neutral token scale to match the One GS 4-level hierarchy:
   - `bold`: neutral-50 (#8D8D8D) → **neutral-100 (#161616)** — near-black
   - `regular`: **(NEW)** neutral-50 (#8D8D8D) — mid-gray
   - `subtle`: neutral-20 (#E0E0E0) → **neutral-30 (#C6C6C6)** — medium-light
   - `minimal`: **(NEW)** neutral-20 (#E0E0E0) — light gray
3. Dark mode overrides updated proportionally: bold→neutral-10, regular→neutral-50, subtle→neutral-70, minimal→neutral-80.
4. Reverted the Input focus border from workaround `--portfolio-border-inverse-bold` back to `--portfolio-border-neutral-bold` — the token itself is now correct.

**Files changed:** `src/styles/tokens/_colors.scss`, `src/styles/_custom-properties.scss`, `src/components/ui/Input/Input.module.scss`

**Cross-category note:** This is primarily a design-system token calibration issue. The fix is global — all 40+ components referencing `border-neutral-bold` or `border-neutral-subtle` will shift. The new `regular` and `minimal` levels are available for future granularity.

**Principle reinforced:** (1) Token values should be validated against the reference design system early, not assumed correct from names. A token named "bold" that maps to mid-gray breaks the mental model of every consumer. (2) Border token scales should have at least 4 levels (bold/regular/subtle/minimal) — a 2-level scale forces components to choose between "too strong" and "too weak" with nothing in between. (3) Use `border-width` for thicker focus borders, not `box-shadow` stacking — box-shadow rings create a visible gap between the element border and the outer ring.

---

## Session: 2026-04-02 — Parent nav item active state propagation

#### FB-085: "Parent nav items containing active children should also show active state (brand color)"

**UX Intent:** In a tiered/hierarchical navigation, when a child item is active, the parent trigger must also reflect the active state. This is a basic navigation contract — the parent shows "you are in this section" while the child shows "you are on this page."

**Root Cause:** The playground demo `TriggerCompositionDemo` in `vertical-nav/page.tsx` marked a child `NavItem` ("Badge") as `active activeAppearance="brand"` but did not pass `active` or `activeAppearance` to the parent `NavItemTrigger`. The design system component (`NavItemTrigger`) already supports these props — this was a demo authoring oversight, not a component logic gap. The real sidebar (`sidebar.tsx`) handles this correctly via `getCategoryForPath()` which computes active state for categories based on child path matching.

**Resolution:** Added `active activeAppearance="brand"` to the `NavItemTrigger` in `TriggerCompositionDemo` and updated the code example string to show the correct pattern (including a comment reinforcing that parent active state must be explicitly set when a child is active).

**Classification:** Playground documentation/demo fix — not a design system component change.

**Principles reinforced:** Playground demos must correctly demonstrate the intended usage patterns of design system components, including state propagation conventions. A demo that shows incorrect state handling teaches consumers the wrong pattern.

---

## Session: 2026-04-02 — AdminBar role label (informational vs brand)

#### FB-084: "Admin badge should be neutral regular — not bold brand; banner already explains context"

**UX Intent:** The "Admin" chip is a **quiet role descriptor**, not a warning, success state, or primary affordance. The sticky bar and hint line already establish that the user is in edit mode. Using `highlight`/`bold`/`mono` overstates importance, pulls attention away from real actions (Edit / Dashboard), and violates informational hierarchy.

**Root Cause:** The first AdminBar DS pass reused the most salient badge recipe (`highlight` + `bold`) suitable for **status** or **calls-to-action**, without separating **chrome metadata** (who you are / what mode) from **actionable emphasis** (what to do next).

**Resolution:** Switched to `<Badge appearance="neutral" emphasis="regular" size="sm" shape="squared">`, removed `mono` (no tracked shout label). Added `.adminContextBadge` on the bar only: in dark site theme, `neutral`/`regular`'s minimal surface equals the always-dark bar color — one-tier surface lift to `surface-neutral-subtle` preserves border legibility. Documented rationale in `docs/design/admin-ui.md` §20 (AdminBar reference composition).

**Pattern extracted → admin UI policy: On admin chrome, role/mode labels = `neutral` + `regular` (or softer); reserve `highlight`/`bold` for states and primary-adjacent emphasis.**

---

## Session: 2026-04-02 — AdminBar accessibility & design system alignment

#### FB-083: "Admin edit view accessibility is horrible — use correct DS components and primitives"

**UX Intent:** The sticky admin toolbar must meet WCAG contrast for all functional text and labels. It should read as part of the same design system as the rest of the product (Badge for status, Button for actions) rather than bespoke SCSS that drifts from token rules.

**Root Cause:** `AdminBar` styled the "Admin" pill with `color: var(--portfolio-text-always-light-bold)` followed by `@include label`, and the primary CTA with `color: var(--portfolio-text-always-light-bold)` followed by `@include body-compact`. Both typography mixins assign `color: var(--portfolio-text-secondary)`, which **overrode** the intended on-brand / on-color text. In light mode that resolves to neutral-70 on accent-60 — failing contrast and matching the reported "unreadable Admin badge." Raw `<a>` / `<button>` markup also skipped DS `Button` behaviors (focus ring, dark-mode `highlight.bold` deepening to accent-60 for AA on filled brand buttons).

**Resolution:** Replaced the custom badge with `<Badge appearance="highlight" emphasis="bold" size="sm" shape="squared" mono>`. Composed primary and secondary actions from `Button.module.scss` classes on `next/link` `<Link>` (plus a local `text-decoration: none` helper) for `highlight`/`bold`/`sm` and `alwaysLight`/`subtle`/`sm` respectively. Replaced the dismiss control with `<Button appearance="always-light" emphasis="minimal" iconOnly …>`. Wrapped the toolbar in `<aside aria-label="Admin editing toolbar">`.

**Pattern extracted → `design-anti-patterns.md` AP-052: Typography mixins that set `color` must not be applied after explicit on-color text without re-overriding — prefer DS components on tinted surfaces. AdminBar called out in `docs/design/admin-ui.md` §20 as a reference composition.**

---

## Session: 2026-04-01 — NavItem Badge Overlay Contrast

#### FB-082: "Badges should avoid any color — the gray background blends with the nav item"

**UX Intent:** Overlay badges on collapsed NavItems are status indicators (unread counts, new flags). They must be instantly scannable at a glance. A subtle-emphasis badge (gray fill + dark text) has near-zero contrast against the NavItem's own neutral surface, defeating the purpose of the overlay. The badge must maximally contrast against its parent — black-on-white or white-on-black depending on theme — and switch to the brand color when the NavItem is active to maintain visual coherence with the active icon/label.

**Root Cause:** The `renderBadge` helper used a single set of Badge props (`appearance="neutral" emphasis="subtle"`) for both expanded inline badges and collapsed overlays. It had no awareness of the overlay context or the NavItem's active state. Subtle emphasis is appropriate inline (where the badge sits next to a label with ample surrounding context) but catastrophic for overlays (where the badge floats alone over a small icon target).

**Resolution:** Refactored `renderBadge` to accept an options object (`{ size, overlay?, active? }`). For overlay badges: emphasis is always `"bold"` (inverse surface = maximum contrast). For active + overlay: appearance switches from `"neutral"` to `"highlight"` (brand surface). Expanded inline badges retain `emphasis="subtle"` as before. Updated playground demo to show active + overlay state.

**Pattern extracted → `design.md` §9 / `design-anti-patterns.md` AP-049: Overlay elements must use bold emphasis — subtle fills blend with parent surfaces. Active state must propagate to all nested semantic elements (badge, icon, label).**

---

## Session: 2026-04-01 — Playground Sidebar IA Reorganization

#### FB-080: "Nav items are in a different tab than navigation — why is navigation not in layout and shell?"

**UX Intent:** Related components must be colocated in the sidebar navigation. When a user is working with `Navigation` they immediately want `NavItem` — splitting them across two categories ("Layout & Shell" vs "Navigation & Menus") forces unnecessary hunting.

**Root Cause:** The original 9-category taxonomy was based on abstract component type (what it *is*) rather than usage context (where/how a developer *uses* it). This led to:
1. NavItem and Navigation split across two tabs despite being parent-child.
2. "Navigation & Menus" became a grab-bag mixing overlay patterns (DropdownMenu, CommandMenu) with navigation primitives (NavItem) and content organization (Tabs).
3. ThemeToggle in "Forms & Controls" — it's a shell utility, not a form field.
4. ScrollSpy in "Interaction" — it's a navigation utility, not a general interaction.
5. Two anemic 2-item categories ("Layout & Shell", "Content & Media") adding cognitive overhead for minimal payoff.

**Resolution:** Reorganized from 9 categories to 7, grouping by usage context:
- **Base** (7 items) — added Kbd and InlineCode (inline primitives, not "data display")
- **Forms & Inputs** (9 items) — removed ThemeToggle and SegmentedControl
- **Overlays & Feedback** (7 items) — absorbed DropdownMenu and CommandMenu from dissolved "Navigation & Menus"
- **Navigation & Layout** (7 items) — unified Navigation + NavItem + Footer + Tabs + SegmentedControl + ScrollSpy + ThemeToggle
- **Data Display** (3 items) — slimmed to CodeBlock, Table, DescriptionList
- **Content & Media** (2 items) — unchanged (Marquee, TestimonialCard)
- **Motion & Entrance** (4 items) — merged old "Entrance & Reveal" + "Interaction" (all animation/motion primitives)

Dissolved categories: "Navigation & Menus", "Layout & Shell", "Interaction", "Entrance & Reveal".

**Pattern extracted → design principle: Group sidebar navigation by usage context (where the developer uses the component), not by abstract component taxonomy (what the component is). Parent-child components must always be colocated.**

#### FB-081: "Why are the categories and items ordered this way? Should they be alphabetical? Should there be sub-sections?"

**UX Intent:** Sidebar ordering should follow a predictable, discoverable principle — both at the category level and the item level. As the component count grows, flat lists within flyout panels become hard to scan without internal structure.

**Root Cause:** Categories and items within categories had no explicit ordering principle. Categories were in an ad hoc sequence (roughly foundational-to-specific but inconsistent). Items within categories were in insertion order — not alphabetical, not by frequency, not by any other discoverable sort.

**Resolution:**
1. **Category ordering: build-up flow** — reordered categories to mirror how developers compose a page: atoms (Base) → inputs (Forms & Inputs) → page structure (Navigation & Layout) → data presentation (Data Display) → reactive layers (Overlays & Feedback) → content blocks (Content & Media) → polish (Motion & Entrance).
2. **Within-category ordering: alphabetical** — all items within each category sorted A-Z by label. Alphabetical is the most predictable scan pattern and scales as items are added.
3. **Sub-section group headers for large categories** — added `group` sub-headers to the 4 categories with 7+ items (Base, Forms & Inputs, Navigation & Layout, Overlays & Feedback). Groups are ordered logically (e.g., Action → Display → Inline), items alphabetical within each group. Smaller categories (Data Display, Content & Media, Motion & Entrance) have no sub-sections — flat alphabetical suffices.

**Patterns extracted:**
- **Category ordering:** Use build-up flow (atoms → structure → behavior → polish), not alphabetical or ad hoc insertion order.
- **Item ordering:** Alphabetical within each category/sub-section. No exceptions.
- **Sub-sections:** Add group headers when a category reaches 7+ items. Below that, flat alphabetical is sufficient.

---

## Session: 2026-04-01 — Content Area Horizontal Padding Aligned to Sidebar Rhythm

#### FB-079: "The side distance in the header and main content doesn't match the sidebar nav items — visually inconsistent"

**UX Intent:** In a sidebar+content layout, the horizontal distance from the panel border to the first content element must be the same across both panels. When the sidebar's nav items sit 14px from the sidebar edge but the content area's header/main/footer start 16–20px from their left edge, the eye detects the misalignment — especially at the shared horizontal boundary where the sidebar border meets the content area.

**Root Cause:** The sidebar established a 14px internal content offset (container `px-1.5` + item `px-2` = 6+8). The content area (Shell component) used `px-4 lg:px-5` (16px / 20px), a different value documented in `spacing.md` §1.1 as "B2B density." These two spacing decisions were made independently and never reconciled. The `lg:px-5` step-up to 20px made the mismatch worse on desktop — exactly where both panels are visible simultaneously.

**Resolution:**
1. Changed Shell header from `px-4 lg:px-5` to `px-3.5` (14px) — matches sidebar's effective content offset exactly.
2. Changed Shell main from `px-4 lg:px-5` to `px-3.5` — same alignment.
3. Changed Shell footer from `px-4 lg:px-5` to `px-3.5` — same alignment.
4. Vertical padding kept unchanged (`py-4 lg:py-5` on main).
5. Updated `spacing.md` §1.1 to reflect the new cross-panel alignment rule.

**Pattern extracted → `spacing.md` §1.1: Content area horizontal padding must match the sidebar's effective content offset (14px / `px-3.5`) for cross-panel alignment**

---

## Session: 2026-04-01 — Sidebar Hover Background: Neutral, Not Brand

#### FB-078: "Navigation items hover background should not use the brand color, it's way too light"

**UX Intent:** Hover backgrounds in sidebar navigation must be neutral (gray/black-derived), not brand-colored. The blue-tinted `sidebar-accent` (`#F0F5FD`) is too light and introduces an unwanted brand hue into a utility interaction state. Hover is a transient affordance signal — it should darken subtly without introducing color semantics that compete with the active state's blue accent.

**Root Cause:** All nav item hover states used `hover:bg-sidebar-accent/50` — 50% of `#F0F5FD`, a blue-tinted color. This produced a barely-visible blue wash that: (1) was too light to register as a clear hover signal, (2) introduced brand color into an interaction state where neutral is appropriate, and (3) competed visually with the active state's `text-accent` blue.

**Resolution:**
1. Replaced `hover:bg-sidebar-accent/50` with `hover:bg-foreground/7` across all 7 sidebar locations (4 nav items + 2 search result lists + 1 collapsed search button).
2. `foreground/7` produces a neutral overlay: 7% of `#161616` in light mode (subtle gray darkening on `#f9f9f9`), 7% of `#f4f4f4` in dark mode (subtle lightening on `#1a1a1a`).
3. Also updated search result selected state from `bg-sidebar-accent` to `bg-foreground/7` for consistency.
4. Updated §4.5b in `docs/design/navigation.md`.

**Pattern extracted → `navigation.md` §4.5b: Hover backgrounds must use neutral foreground-derived overlay, never brand accent color**

---

## Session: 2026-04-01 — Border/Action Warning Token Dark-Mode Completion

#### FB-077: "Complete the dark-mode adaptation contract for border and action warning tokens"

**UX Intent:** The brightness inversion rule (§9.12) was established for text and icon tokens but had not been applied to border and action tokens. `border-warning` used yellow-30 in both modes — yielding 1.68:1 on white (fails WCAG 1.4.11's 3:1 requirement for UI components). This is the same yellow-30 problem fixed for text/icon in FB-076, now completed across the remaining properties.

**Root Cause:** Border and action tokens for the warning role were defined with yellow-30 (a bright yellow) in both light and dark modes. Negative and positive borders already adapted (step-60/step-50), but warning was missed. The action-warning token had the same issue but is not currently consumed by any component.

**Resolution:**
- Fixed `$portfolio-border-warning` and `$portfolio-action-warning`: yellow-30 → yellow-60 (light)
- Fixed dark-mode overrides: yellow-30 → yellow-50 (dark), matching the step-60/step-50 pattern used by border-negative and border-positive
- All 10 contrast checks pass (4.54:1 to 5.43:1, all above 3:1 threshold)
- Updated §9.12 to cover border/action pattern; updated §9.11 open issues

**Pattern extracted → §9.12 expanded: Border/action tokens use step-60 (light) / step-50 (dark), text/icon tokens use step-60 (light) / step-40 (dark)**

---

## Session: 2026-04-01 — Text Color Brightness Inversion for Dark/Light Mode

#### FB-076: "For the footer, the dark mode color should be slightly lighter"

**UX Intent:** Colored text used for functional purposes (status indicators, warnings, emphasis labels) must maintain optimal legibility in both light and dark modes. On dark surfaces, text colors need to be brighter; on light surfaces, darker. The user referenced the brand/highlight text color as the gold standard — it already shifts from accent-60 (light) to accent-40 (dark). All functional text color tokens should follow this brightness inversion pattern.

**Root Cause:** The warning text token (`--portfolio-text-warning`) used yellow-30 (#F1C21B) in both light and dark modes. On white, yellow-30 yields 1.68:1 contrast — catastrophic WCAG failure. The same issue affected `--portfolio-icon-warning`. Meanwhile, the playground footer used static Tailwind classes (`text-red-500/80`, `text-amber-500/80`) that don't adapt between modes. The underlying principle — step-60 for light backgrounds, step-40 for dark backgrounds — was implemented for brand, negative, and positive but missed for warning.

**Resolution:**
- Fixed `$portfolio-text-warning` and `$portfolio-icon-warning`: yellow-30 → yellow-60 (light mode, 4.99:1 on white)
- Fixed dark-mode overrides: yellow-30 → yellow-40 (dark mode, 7.62:1 on #161616)
- Fixed playground footer: added `dark:` Tailwind variants for red and amber text (red-600/red-400, amber-600/amber-400)
- Fixed playground token-grid check icon: added `dark:text-green-400`
- All 18 contrast checks pass WCAG AA
- Formalized the step-60/step-40 brightness inversion rule as §9.12 in `docs/design/color.md`

**Cross-category note:** Also an engineering issue — playground footer used raw Tailwind colors instead of DS semantic tokens or mode-adaptive classes.

**Pattern extracted → §9.12: Text Color Brightness Inversion Rule; AP-047: Static Colored Text Palette Step Across Both Modes**

---

## Session: 2026-04-01 — Unified Four-State Model for Sidebar Navigation Items

#### FB-075: "The nav item highlight color doesn't persist" / "hover text is not black" / "expanded parent should not differ from children"

**UX Intent:** Every nav item in the sidebar must follow one unified four-state model. Two visual dimensions communicate two different things: neutral colors (gray/black) signal interaction, brand accent color (blue) signals location, and font weight (medium) signals activation (expanded or active). The states are:
1. **Default** — dark gray text/icon, normal weight, no background.
2. **Hover (non-active)** — black text/icon, normal weight, neutral gray background.
3. **Expanded (non-active parent)** — black text/icon, medium weight, neutral gray hover background. No resting background.
4. **Active (current page)** — blue accent text/icon, medium weight, light blue hover background.

**Root Cause (three issues across multiple rounds):**
1. Active state was inconsistent across nav item types — only category buttons used blue text; sub-links, direct links, and pinned items used a background highlight with generic foreground.
2. Hover text used `sidebar-foreground` (`#161616`) instead of absolute black/white. Hover background used brand-tinted `sidebar-accent` instead of neutral gray.
3. Expanded (non-active parent) state used a permanent blue-tinted background (`bg-sidebar-accent`) instead of matching the neutral interaction pattern (black text, no resting bg, gray hover bg).

**Resolution:**
1. All active states → `text-accent font-medium hover:bg-accent/7` (blue text, blue hover bg).
2. All hover states → `hover:bg-foreground/7 hover:text-black dark:hover:text-white` (neutral gray bg, absolute darkest text).
3. Expanded (non-active parent) → `text-black dark:text-white font-medium hover:bg-foreground/7` (black text, medium weight, neutral gray hover, no resting bg).
4. `isCatActive` takes priority over `isOpen` in conditional chains.
5. Updated AP-046 and §4.5b in navigation docs.

**Files changed:** `playground/src/components/sidebar.tsx` (all nav item locations unified)

**Pattern extracted → `navigation.md` §4.5b: Unified four-state model for all sidebar nav items; AP-046**

---

## Session: 2026-04-01 — Minimum Inter-Button Spacing Principle

#### FB-074: "There is no spacing in between those buttons. It's so cramped."

**UX Intent:** Buttons are discrete interactive elements and must always be visually distinguishable from one another. Placing buttons flush or near-flush (< 8px) makes them visually merge, especially when they have filled backgrounds or borders. This is a fundamental design principle — no buttons should be adjacent without breathing room unless a deliberate button group component overrides it.

**Root Cause:** The playground's Full Width button section used `space-y-2` (8px) between stacked full-width buttons. While technically non-zero, full-width buttons each carry their own background/border, making 8px of vertical separation feel flush at normal viewing distances. All other button demo sections in the page used `gap-3` (12px), making this section inconsistently tight.

**Resolution:**
1. Bumped `space-y-2` to `space-y-3` (12px) in the playground Full Width section — consistent with all other sections.
2. Added new design principle §1.3 ("Minimum Inter-Component Gap for Buttons") in `docs/design/spacing.md`: minimum 8px, recommended 12px, exception only for dedicated button group components.
3. Added AP-045 ("Adjacent Buttons Without Minimum Gap") to `docs/design-anti-patterns.md`.

**Pattern extracted → `spacing.md` §1.3: Minimum Inter-Component Gap for Buttons; AP-045**

---

## Session: 2026-04-01 — Systemic Dark-Mode Hover/Active Fixes

#### FB-073: "These buttons in the dark mode on hover are having a problematic display"

**UX Intent:** Every interactive state (hover, active) must provide clear visual feedback and maintain WCAG AA contrast in both color modes. A button that visually disappears on hover, or produces zero visible change, is a broken interaction — users lose confidence that the UI is responsive.

**Root Cause:** Hover/active states across all Button variants used hardcoded SCSS palette variables (`$portfolio-neutral-90`, `$portfolio-red-70`, etc.) that compile to static hex values. These were calibrated for light mode only. In dark mode they produced: (1) invisible text — neutral bold hover flipped from white (#FFF) to near-black (#262626) while text stayed dark, yielding 1.20:1 contrast; (2) jarring polarity flash — inverse bold hover jumped from dark to light (#F4F4F4), making white text invisible at 1.10:1; (3) zero feedback — positive and negative bold hover backgrounds matched their default dark-mode values exactly; (4) same issue across subtle/regular/minimal variants.

**Resolution:** Added `:global([data-theme="dark"]) &, :global(.dark) &` overrides in `Button.module.scss` for every hover/active state that used hardcoded SCSS values. 33 state combinations verified, all pass WCAG AA (range 4.83:1 to 15.22:1). Also added `warning` appearance to the playground's CORE_APPEARANCES and props table (it existed in source but had no playground coverage).

**Variants fixed:**
- Bold: negative (hover red-80/active red-90), inverse (hover neutral-90/active neutral-80)
- Subtle: neutral (hover neutral-70/active neutral-60), highlight (hover accent-90/active accent-80), positive (hover green-90/active green-80), negative (hover red-90/active red-80), warning (hover yellow-90/active yellow-80)
- Regular active: highlight (accent-90), positive (green-90), negative (red-90), warning (yellow-90)
- Minimal active: highlight (accent-90), positive (green-90), negative (red-90), warning (yellow-90)

**Pattern extracted → AP-044 (expanded): Hardcoded SCSS hover values in theme-responsive components**

---

## Session: 2026-04-01 — Bold Button Dark-Mode WCAG Contrast

#### FB-072: "I doubt that bold style buttons pass WCAG in dark theme"

**UX Intent:** Functional interactive elements (buttons) must meet WCAG 2.1 AA contrast as a first-class requirement. Decorative/emphasis uses of brand color can prioritize visual pop over strict ratios. This is a deliberate split: buttons serve action affordance and must be readable; non-button brand accents serve identity and are judged differently.

**Root Cause:** Dark mode swaps `--portfolio-action-brand-bold` from accent-60 (#3336FF) to accent-50 (#7182FD) for better visibility against dark surfaces. This is correct for non-button contexts — but accent-50 + white text yields 3.33:1, which fails WCAG AA (4.5:1). Other bold variants pass: positive (7.72:1), negative (7.79:1), warning (10.78:1).

**Resolution:** Added a dark-mode override in `Button.module.scss` for `.highlight.bold` that pins the background to accent-60 (#3336FF) in dark mode, restoring 6.75:1 contrast. The shared `--portfolio-action-brand-bold` token is untouched — non-button brand elements keep accent-50 in dark mode.

**Design principle established:** Functional elements (buttons, form controls) treat WCAG 2.1 AA as non-negotiable. Decorative/emphasis elements (brand badges, color accents, illustrated surfaces) may relax contrast requirements when the element's purpose is identity expression rather than action affordance. See §17.6 in `docs/design/accessibility.md`.

**Pattern extracted → `design.md` §17.6: Functional vs. Decorative WCAG Split**

---

## Session: 2026-04-01 — Button Inverse / Always Taxonomy

#### FB-071: "I think this section tells me that we haven't defined the inverse vs always logic well"

**User intent:** The playground's "Context Appearances" section for buttons showed inverse and always-light variants on the same fixed dark surface, making the distinction unclear. The user wanted the One GS taxonomy properly implemented: inverse is theme-responsive, always-* is locked.

**Diagnosis:** Three issues — (1) Inverse had 4 emphasis levels (Bold, Regular, Subtle, Minimal) when One GS limits it to Bold + Regular, creating overlap with Always Light; (2) always-dark and always-light used raw SCSS primitives instead of semantic tokens; (3) the playground demo rendered all context buttons on a fixed `bg-neutral-900` surface instead of using the correct paired surfaces.

**Changes:**
1. Added 4 new semantic tokens: `$portfolio-action-always-dark`, `$portfolio-action-always-light`, `$portfolio-border-always-dark`, `$portfolio-icon-always-dark-bold` in `_colors.scss`. Exported as CSS custom properties in `:root` only (mode-invariant).
2. Trimmed `.inverse` in `Button.module.scss` to Bold + Regular only, matching One GS. Subtle/Minimal are covered by Always Light.
3. Replaced all raw primitives in `.always-dark` and `.always-light` with semantic tokens. Fixed Always Light Bold from light gray (#F4F4F4) to white (#FFFFFF).
4. Restructured the playground button page to 3 separate surface rows with correct paired surfaces per One GS.

**Design principle:** Inverse = theme-responsive pair (button + surface flip together). Always = mode-invariant lock (button stays fixed). Limiting Inverse to Bold + Regular eliminates overlap with Always at Subtle/Minimal levels.

---

## Session: 2026-04-01 — Design System Dark Mode Adaptation

#### FB-070: "Design system components don't adapt well to dark vs light theme"

**UX Intent:** A design system that only renders correctly in light mode appears incomplete and untested. When the playground toggles to dark mode, Card/Input/Table components should adapt their backgrounds, borders, and text colors to match the dark context — maintaining readability and visual hierarchy.

**Root Cause:** SCSS tokens (`$portfolio-surface-primary`, `$portfolio-border-subtle`, etc.) are Sass compile-time variables that resolve to hardcoded light-mode hex values. They produce static CSS like `background: #FFFFFF` regardless of the host environment's theme. Meanwhile, the playground's dark mode toggles Tailwind tokens via `.dark` class, creating a mismatch — light component backgrounds with dark-adapted text colors.

**Resolution:** Introduced `--ds-*` CSS custom properties as the design system's runtime theming API:
1. Added 15 semantic `--ds-*` custom properties to `playground/src/app/globals.css` under `:root` (light) and `.dark` (dark) blocks.
2. Updated Card, Input, and Table SCSS modules to use `var(--ds-*, #{$scss-fallback})` — picks up the custom property when defined (dark mode works), falls back to the compiled SCSS value otherwise (main site unchanged).
3. Pattern is backward-compatible: the main site (which doesn't define `--ds-*`) continues to use the SCSS fallback values with zero visual change.

**Pattern extracted → `design.md`: New anti-pattern AP-042 documented for SCSS-only color tokens in themeable contexts.**
**Cross-category note:** Also documented as ENG-082 (engineering) — architectural fix to SCSS module compilation strategy.

---

## Session: 2026-03-30 — Button Component Sizing Redesign

#### FB-069: "Vertical spacing too big, icons don't scale with label size"

**UX Intent:** The button's internal proportions feel wrong — vertical padding is visually excessive and icons appear tiny/disconnected from the label at larger sizes. The user wants buttons where (a) vertical padding is noticeably tighter than horizontal, producing a wider pill shape, and (b) icons scale proportionally with the label text as button size increases, so all button content forms a cohesive visual unit.

**Root Cause:** Three structural problems in the sizing model:

1. **Bounding-box icon model.** The `.iconWrap` used internal padding that ate the wrapper size, producing effective icons of 8/10/10/12px — far smaller than the label text. The sm and lg sizes produced the same 10px icon despite an 18px font-size difference. The padding was doing double duty: sizing the icon AND creating icon-to-label spacing.

2. **Fixed `height` constraint.** The button used `height` (not `min-height`), making the declared `py` values irrelevant — with small content (12-16px fonts at 1.1 line-height) in large containers (48-56px), the visual vertical space was determined by `(height - content) / 2`, not by `py`. Reducing `py` would have no visible effect.

3. **Disconnected icon-only path.** When `iconOnly` is true, children went through `.label` (no size constraints) instead of `.iconWrap`, rendering at the Lucide default 24×24 regardless of button size — 2-3x larger than the same icon in icon-plus-label mode.

**Resolution:** Redesigned the sizing system following the Goldman Sachs One GS button component reference (extracted from Figma via MCP):

1. **Icon = label line-height.** Icon wrapper dimensions now match the label's computed line-height per size (16/18/20/24px). No internal padding on icon wrappers — direct sizing.
2. **Gap-based spacing.** Replaced `gap: 0` + bounding-box padding with flex `gap` per size (4/6/10/12px). Icon sizing and icon-to-label spacing are now independent concerns.
3. **Padding-derived height.** Replaced `height` with `min-height`. Button height = `py + line-height + py`. Vertical padding is now the actual visual control.
4. **Font size bump.** Increased font sizes — sm: 12→14px, lg: 14→16px, xl: 16→18px — so content fills more of the button and icons are proportionally larger.
5. **Unified icon-only path.** When `iconOnly` is true, children are now routed through `.iconWrap` instead of `.label`, receiving the same size-constrained treatment.

**Pattern extracted → `design.md` §22: Button Sizing Principles — 5 principles for proportional button construction (icon = line-height, gap-based spacing, padding-derived height, py < px, unified icon path).**

---

## Session: 2026-03-30 — TokenGrid Interactive Token Builder

#### FB-068: "The interactivity is just confusing because you cannot select a color picker"

**UX Intent:** The user's mental model is color-first: pick a concrete color, then see which semantic tokens use it. The previous design forced users to work in the opposite direction — picking abstract dimensions (property, role, emphasis) independently, with no link to actual colors. Separate tabs for Extended Palette and Neutral were redundant because they showed colors without connecting them to the token naming system. The user wants a single integrated builder where choosing a color drives the rest of the interaction.

**Root Cause:** The TokenGrid had a disconnect between the color palettes (displayed in separate tabs) and the token naming system (displayed in the Token Architecture tab). Users could see swatches OR compose tokens, but not both simultaneously. The Role dimension was presented as a manual selection when it should be automatically derived from the color family (Accent → brand, Red → negative, etc.). This created cognitive overhead: users had to know the mapping between color families and semantic roles, which is exactly what the system should teach them.

**Resolution:**
1. Collapsed 4 tabs (Token Architecture / Lumen / Extended / Neutral) → 2 tabs (Token Builder / Lumen Accent).
2. Built a color picker dropdown trigger inline in the formula bar — replaces the static "color" prefix.
3. Dropdown panel (rendered via `createPortal` to bypass overflow clipping) shows all 6 color families with grouped swatch rows and role annotations.
4. Selecting a swatch auto-fills the Role dimension and cascading-filters Property and Emphasis pills to only valid combinations (derived from `_colors.scss` actual token definitions).
5. Invalid dimension pills are visually disabled (30% opacity, `cursor: not-allowed`).
6. Contextual hint text guides users through the selection flow ("Pick a color swatch to auto-fill the role" → "Now choose a property" → "Pick an emphasis level to complete the token").
7. Composed token preview includes a swatch preview of the selected hex color.

**Cross-category note:** Also documented as CFB-020 (content — tab consolidation rationale, dropdown as information filter).

**Pattern extracted → `design.md` §10: Color-first interaction — when demonstrating a mapping between concrete values (colors) and abstract semantics (roles), let the user start with the concrete and derive the abstract automatically.**

---

## Session: 2026-03-30 — Token Architecture Interactive Affordances & IA

#### FB-067: "Can there be some interactiveness here? Currently, the color doesn't really show options"

**UX Intent:** Interactive-looking elements that aren't interactive create a false affordance — the visual treatment signals "I'm clickable" but the behavior says "I'm static." This violates Norman's principle of perceived affordance: the appearance of an element must match its function. The accent-highlighted "color" prefix and pill-shaped dimension values both used visual treatments (colored background, pill shape) that universally signal interactivity in UI, but were static spans. Users see pills and expect to click them.

Additionally, the information architecture within the tab was inverted: rationale ("Why semantic naming") appeared before the architecture itself (the formula). The user's principle is clear: show the result/outcome first, then explain the reasoning. This maps to CAP-006 (Burying the Lede) applied at the component level.

**Root Cause:** The Token Architecture tab was authored as a narrative: motivation → structure → examples. This follows the writer's logic (build up to the conclusion) rather than the reader's need (show me the answer, then explain why). The "color" prefix used `namingPartPrefix` with accent styling (blue bg, semibold) while the other formula parts used `namingPart` with neutral styling — this differential treatment implied "color" was in an active/selected state rather than being a static prefix. The dimension pills used span elements styled like interactive tags but with no click handler.

**Resolution:**
1. **Reordered tabs**: Token Architecture is now the first/default tab (was second after Lumen Accent). The skeleton comes before the examples.
2. **Reordered content within tab**: Architecture (formula + dimensions) first, rationale second. Sub-headers "Naming Formula" and "Why Semantic Naming" provide clear wayfinding.
3. **Made pills interactive**: Dimension values are now `<button>` elements. Clicking a pill selects it — the formula bar updates live to show the composed token name. Selecting all three dimensions shows the full composed token with human-readable interpretation.
4. **Fixed "color" prefix**: Changed from accent-highlighted `namingPartPrefix` to muted `namingPartStatic` — plain text, no background, no blue. It reads as a constant, not an active state.
5. **Replaced static examples**: Removed the 4 hardcoded example tokens. The interactive formula IS the example — users compose their own token name by clicking pills.
6. **Updated section blurb**: CMS seed now contextualizes color as the example domain ("Using color as the example domain: a token naming convention where...").

**Cross-category note:** Also documented as CFB-019 (content) — information hierarchy inversion and section blurb missing domain context.

**Pattern extracted → AP-040: False affordances on static elements. Also reinforces `design.md` §14 (playground consistency) and `content.md` §3 (inverted pyramid / outcome-first structure).**

---

## Session: 2026-03-30 — Playground Swatch Focus Ring Clipping

#### FB-066: "The border is kind of chopped up on the top for the brand key brand color"

**UX Intent:** Every interactive element must visually complete its focus/selection indicator without clipping. A chopped border signals a rendering bug and erodes trust in the design system's own tooling. If the playground — the design system's showcase — can't render clean focus states, it undermines the system's credibility.

**Root Cause:** The `ColorSwatch` button component had zero padding (`w-12` with a flush `h-12 w-12` child). When the user clicks a swatch, the browser draws a focus ring (outline) around the button that extends 2–3px outside the element boundary. In the tight `flex flex-wrap gap-1.5` (6px gap) container, this ring was visually clipped at the top by adjacent content or parent edges. The element was designed for its resting state only — no space was reserved for its interactive state.

**Resolution:**
1. Added `p-0.5` (2px padding) to the `ColorSwatch` button, giving the focus ring a buffer zone to render cleanly.
2. Adjusted width to `w-[52px]` (48px swatch + 4px padding) to maintain layout alignment.
3. Suppressed browser default focus ring (`outline-none`) and replaced with `focus-visible:ring-2 focus-visible:ring-ring` — a Tailwind-managed ring using box-shadow, which is immune to overflow clipping.
4. Added `rounded-sm` to the button so the ring follows the swatch shape.

**Pattern extracted → AP-039: Interactive Elements Without Focus Ring Clearance. Also reinforces `design.md` §14.1 (one visual treatment) — the swatch's interactive state is part of its visual treatment, not an afterthought.**

---

## Session: 2026-03-30 — Breakpoint System Audit & Unification Plan

#### FB-064: "Look at the breakpoints for the design system — audit existing and compare OneGS/Carbon"

**UX Intent:** The design system needs a breakpoint scale built for enterprise B2B SaaS — supporting screens from small phones through ultrawide desktop monitors, with the ability to vary information density at any viewport size. The current breakpoints were inherited from IBM Carbon without adaptation, and two of three apps (Playground, ASCII Tool) silently use different Tailwind defaults. The user wants a deliberate, audited decision on what to adopt, adapt, or reject from Carbon and OneGS, with explicit consideration for large/ultra-large screens and compact-on-big-screen scenarios.

**Root Cause:** The main site's SCSS breakpoints (320/672/1056/1312/1584) are Carbon's exact values — adopted wholesale without evaluating enterprise-specific needs. The Playground and ASCII Tool use Tailwind v4 defaults (640/768/1024/1280/1536) because `globals.css` never overrides `--breakpoint-*`. This creates three separate breakpoint systems in one repo: Carbon (SCSS), Tailwind defaults (Playground/ASCII), and ad-hoc hardcoded values (AdminBar 640px, experiments 768px, typography comments 768/1200). The container tokens (`$portfolio-container-sm` = 672px) also collide with breakpoint names (`$portfolio-bp-sm` = 320px), using the same `sm` label for different values.

**Analysis performed:**
- Full codebase audit: 5 SCSS token breakpoints, Tailwind defaults in 2 apps, hardcoded media queries in 3+ files, typography comment referencing a third scale
- IBM Carbon: 320/672/1056/1312/1584 — 5 tiers, 4→8→16 column doubling, 8px mini-unit, 3 gutter modes, grid influencer pattern. Max at 1584px.
- OneGS (from Figma): 375/768/1024/1440/1920 — 5 tiers, device-oriented naming (Mobile/Tablet/Desktop/XL Desktop/XL+ Desktop). No column system or density modes.
- Tailwind v4: 640/768/1024/1280/1536 — general-purpose web, no enterprise consideration.

**Decision framework (adopt / partially adapt / reject):**

From Carbon — **Fully adopt:** 8px mini-unit, column doubling (4→8→16), three gutter modes (wide/narrow/condensed), grid influencer pattern. **Partially adapt:** breakpoint values (keep 672/1056, replace 320→375, 1584→1920, add 1440 and 2560). **Reject:** 320px mobile (obsolete), 1584px max (too low for enterprise), `max` naming (implies ceiling).

From OneGS — **Fully adopt:** 375px mobile baseline, 1920px as first-class tier. **Partially adapt:** 1440px as explicit tier. **Reject:** device-oriented naming, absence of column system, absence of density modes.

From Tailwind — **Partially adapt:** as implementation mechanism (`@theme` overrides). **Reject:** default values and philosophy.

**Proposed unified scale:**

| Tier | Token | Value | Columns | Rationale |
|------|-------|-------|---------|-----------|
| xs | `$elan-bp-xs` | 375px | 4 | Modern smallest phone. Replaces Carbon 320px. |
| sm | `$elan-bp-sm` | 672px | 8 | Large phone landscape / small tablet. From Carbon. |
| md | `$elan-bp-md` | 1056px | 16 | Standard laptop. From Carbon. |
| lg | `$elan-bp-lg` | 1440px | 16 | Common laptop/external display. From OneGS. New. |
| xl | `$elan-bp-xl` | 1920px | 16+ | Full HD monitor. From OneGS. Replaces Carbon max. |
| 2xl | `$elan-bp-2xl` | 2560px | 16+ | QHD/ultrawide. New tier for enterprise. |

**Status:** PLANNED — awaiting user confirmation before implementation.

**Cross-category note:** Also documented as ENG-070 (engineering) — cross-app breakpoint drift and Tailwind override implementation.

**Pattern extracted → `design.md` §6: Comprehensive responsive breakpoint system — 6-tier scale, column logic, density modes, grid influencers, cross-app unification plan.**

---

## Session: 2026-03-30 — Typography System Revamp

#### FB-063: "Reference OneGS typography and IBM Carbon — audit and revamp typography setup"

**UX Intent:** The typography system had only 9 semantic mixins and no support for enterprise-density compact interfaces, body weight variants, responsive headings, quotes, captions, stats, or utility text categories. A B2B enterprise SaaS product needs dense typography with small minimums (8px per OneGS), explicit font role assignments, and enough semantic variety to avoid raw token usage in components.

**Root Cause:** Typography was under-specified — the system had tokens (scale, weights, leading, tracking) but insufficient semantic mixins mapping those tokens to design intent. No formal rules existed for when to use serif, mono, or pixel fonts, leading to ad-hoc serif usage in non-quote contexts (contact page headings, experiments page headings).

**Resolution:**
- Expanded token foundation: added 2xs (8px), 7xl (72px), 8xl (96px) sizes; thin/extralight weights; compact line-height (1.15)
- Expanded from 9 to 28 semantic mixins across 9 categories: Heading (4), Subtitle (6), Body (9), Quote (3), Caption (2), Label (1), Utility (2), Code (3), Stat (3)
- Added 6 responsive fluid variants using `clamp()` for headings and stats
- Renamed `mono-data` → `code-base`; restricted mono to code-only per Carbon
- Formalized Georgia serif to quotes-only (more selective than OneGS)
- Documented font role assignments, pairing rules, enterprise compact guidelines
- Updated playground tokens.ts with categories/mixin data + typography preview page
- Identified migration candidates for incremental Phase 6 cleanup

**Pattern extracted → `design.md` §18: Full typography system documentation including font role table, 28-mixin catalogue, pairing rules, enterprise compact guidelines, and migration candidates.**

---

## Session: 2026-03-30 — Spacing Token Audit (Agent Parseability)

#### FB-062: "This modal's height has the same exact issue — viewport adjustment"

**UX Intent:** Every modal must provide enough vertical space for content to breathe. A squeezed modal with no min-height collapses to its content size, making it unusable when content is minimal (e.g., a cover image placeholder + two short inputs). This is the same feedback as FB-043 and FB-045 — the user explicitly said "the same kind of UX feedback I gave you before."

**Root Cause:** Third violation of AP-027 (Flex Containers Without Minimum Dimension Constraints). The `ProjectEditModal` was created without carrying over the dimension constraints from the established `EditableArray` panel template. The pattern documentation exists but was not consulted during creation.

**Resolution:** Added `min-height: min(520px, 70vh)`, `min-width: 320px`, `max-height: 88vh` to the modal. Increased internal padding and gap for breathing room. All values now align with the established modal sizing pattern.

**Cross-category note:** Also documented as ENG-068 (engineering). Third violation of AP-027 — escalation note added to the anti-pattern.

**Pattern extracted -> design.md: New modals MUST be created from the established dimension template: `min-height: min(420-520px, 65-70vh)`, `max-height: 88vh`, `min-width: 320px`, `width: min(Npx, 90-92vw)`. The exact min-height should scale with content complexity (simple forms ~420px, rich content ~520px).**

---

#### FB-061: "Hover upload blocks navigation; edit button should open modal instead of dashboard"

**UX Intent:** Admin editing must not degrade the visitor experience. The hover-to-upload overlay blocked navigation to case study detail pages — a core visitor action. The Edit button opening the Payload dashboard in a new tab forced a context switch. The user wants a single modal that consolidates image management and text editing without leaving the page.

**Root Cause:** The HeroUploadZone was designed as a full-surface overlay that appeared on hover, which conflicts with the card's primary affordance (a navigable link). Admin actions occupied the same interaction surface as visitor navigation, creating a mutually exclusive interaction: you could either upload or navigate, never both. The EditButton was a convenience shortcut that didn't respect the inline editing philosophy already established elsewhere in the site.

**Resolution:** Removed the hover overlay entirely. Replaced the Edit button with an inline edit button that opens a `ProjectEditModal` — a centered dialog with cover image preview/upload/browse, text fields for title and category, and footer actions (dashboard link + save). The modal uses `createPortal` to render above the page, follows the same design language as `EditableArray` panels (same shadows, radii, colors), and supports keyboard dismissal (Escape).

**Cross-category note:** Also documented as ENG-066 (engineering) — component architecture and data flow changes.

**Pattern extracted -> Admin edit affordances on navigable elements must be additive, not exclusive. They must: (1) never occupy the same interaction surface as the primary action, (2) use modals or panels that layer above the page, not overlays that replace the page, (3) consolidate related edits (image + text) into a single modal rather than scattered tools.**

---

#### FB-060: Spacing token system audit — 5 consistency fixes for agent parseability

**UX Intent:** The three-tier spacing system (implemented in FB-055) had inconsistencies that degraded agent parseability. Agents need unambiguous tier rules: Tier 1 = clean grid, Tier 2 = layout intent, Tier 3 = component internals. Mixing tiers or leaking oddball values into the wrong tier forces agents to learn exceptions instead of rules.

**Findings and Resolution:**
1. **Primitive scale polluted with utility-only values** — Removed 0.75x, 0.875x, 1.25x, 1.625x from Tier 1. These exist solely for component sizing (button vertical padding) and don't belong in the global 8px grid. Tier 3 utility tokens now own their pixel values directly.
2. **Layout mixins inconsistently mixed Tier 1 and Tier 2** — `container` and `container-narrow` used primitive tokens (`$portfolio-spacer-2x`, `$portfolio-spacer-4x`, `$portfolio-spacer-6x`) for layout-level padding. Migrated to `spacer-layout-compact`, `spacer-layout-spacious`, `spacer-layout-x-spacious`. Rule is now unambiguous: layout mixins always use Tier 2 tokens.
3. **`design.md` utility table incomplete** — Only 6 of 10 tokens were documented. Updated to show all 10.
4. **Utility tokens back-referenced nonexistent primitives** — Removed the circular dependency. Utility tokens now own oddball values as literal px values.
5. **Unused `sass:map` import** — Removed dead code.

**Pattern extracted → `design.md` §1.2: Updated Tier 1 table to show clean progression without oddball fractions. Added note about tier boundary rule.**

**Cross-category note:** Also documented as ENG-064 (engineering).

---

## Session: 2026-03-30 — Media Upload Affordances

#### FB-059: "Link modals don't let me upload files; tiles don't let me upload images"

**UX Intent:** Two distinct upload affordance gaps: (1) Inline edit link modals forced users to type URLs even when the target was an uploaded file (like a resume). The natural flow is "pick/upload the file and let the system handle the URL." (2) Homepage project tiles had no way to set or change cover images — the admin had to use the Payload panel, find the project, upload there, and refresh. The natural flow is hover → drop/click → done.

**Root Cause:** (1) `FieldDefinition` only supported plain input types; no media integration. (2) Cover images were hardcoded to a static map, not CMS-driven, and `ProjectCard` had no upload affordance.

**Resolution:** (1) Added `media-url` field type: URL input + upload button side by side. Upload → auto-fills URL. Applied to social link `href` and project external link `href`. (2) Added `HeroUploadZone` as an admin-only hover overlay on project tiles: semi-transparent overlay with upload icon + "Upload cover" label; accepts drag-and-drop and click-to-browse; shows spinner during upload; stops event propagation so the parent `<Link>` doesn't navigate. Wired homepage to CMS `heroImage` (removed hardcoded map).

**Cross-category note:** Also documented as ENG-062/063 (engineering) and CFB-018 (content).

**Pattern extracted -> `design.md` §10: Upload affordances must be contextual — place them where the user sees the content they want to change, not in a separate admin panel. For image areas, hover overlays with drag-and-drop are the expected pattern. For URL fields that could be files, a companion upload button is the expected pattern.**

---

## Session: 2026-03-30 — Élan Case Study TokenGrid & Section Restructuring

#### FB-058: "Upload screen is not intuitive — no field explanations, no validation"

**UX Intent:** Form fields without descriptions, labels using technical jargon, and no validation feedback violate basic form UX principles. Users need to understand what each field does before they can fill it in correctly. Errors must be specific and contextual, not generic toasts.

**Root Cause:** The Media upload collection used Payload's default field presentation — bare `type: 'text'` fields with no `label` overrides, no `admin.description` helper text, and no `admin.placeholder` examples. The upload filename is set by the browser file picker and Payload's upload handler, with no collection-level explanation that filenames may be sanitized for compatibility. The S3 upload error produced a generic "Something went wrong" toast instead of explaining what was invalid.

**Resolution:** (1) Added human-readable labels: "Alt" → "Description (Alt Text)", "Caption" → "Caption (optional)". (2) Added `admin.description` helper text to all fields explaining purpose in plain language. (3) Added `admin.placeholder` with concrete examples. (4) Added collection-level `admin.description` explaining the upload process and automatic filename cleanup. (5) The underlying S3 error was already resolved by ENG-060 (filename sanitization hook).

**Cross-category note:** Also documented as ENG-060/ENG-061 (engineering — filename sanitization + validation) and CFB-017 (content — field microcopy).

**Pattern extracted → `design.md` §17 (new): CMS admin forms must include field-level descriptions and examples. Technical field names (alt, slug, href) must have human-readable labels with explanations. Generic error toasts are never acceptable — validation must be field-level and specific.**

---

#### FB-057: "Token examples don't follow convention — $portfolio is meaningless — need Lumen accent tab with brand story"

**UX Intent:** The TokenGrid component serves a dual role: it's an interactive showcase in the Élan case study AND it demonstrates the design system's token architecture. Three visual/structural issues:
1. Token examples used `$portfolio-text-neutral-bold` — a SCSS variable prefix unrelated to the described `color.property.role.emphasis` formula. The disconnect undermines the naming convention it's supposed to demonstrate.
2. The "Lumen Accent" tab existed but was purely a color swatch row with no brand story. The user wants the rationale — what Lumen is, why this hue, why the hybrid scaling — in its own dedicated tab.
3. The "Token Architecture" tab lacked rationale. It showed the formula and dimensions but not the design decision (evaluating IBM, Goldman Sachs, Material Design approaches; choosing semantic naming for agent processability).

**Root Cause:** The TokenGrid was built to demonstrate the naming system structurally (formula + dimensions + examples) but omitted the design reasoning — which is the actual signal a hiring manager or fellow designer would evaluate. Token examples were given an arbitrary `$portfolio-` prefix from initial scaffolding rather than following the convention they described. This is the same WHAT-without-WHY pattern identified in CFB-014.

**Resolution:**
1. Reorganized tabs: "Lumen Accent" (brand story + hybrid scaling legend), "Token Architecture" (naming formula + rationale + IBM/GS comparison + agent benefit), "Extended Palette", "Neutral"
2. Fixed token examples to use dot notation matching the formula: `color.text.neutral.bold` instead of `$portfolio-text-neutral-bold`
3. Added rationale text explaining why semantic naming was chosen and how it benefits AI agents

**Cross-category note:** Also documented as CFB-014 (content — broader case study restructuring).

**Pattern extracted → `design.md` §14: Interactive visuals that demonstrate a design system convention must use examples that follow that convention — scaffolding prefixes or placeholder naming break the demonstration.**

---

## Session: 2026-03-30 — TokenGrid Color Section Relevance

#### FB-056: "Spacing and radius tab is irrelevant — section is about color, tabs should be color schemes"

**UX Intent:** The TokenGrid component lives in the "Lumen — A Custom Color Identity" section of the Élan case study. Every tab within that interactive visual must be relevant to the section's topic (color). The Spacing and Radius tabs show non-color design tokens — they belong to a spacing or layout section, not a color identity section. Additionally, the token naming convention (`property.role.emphasis`) that defines the color architecture was missing entirely — this was previously part of the section content and its absence left a gap in the design system narrative.

**Root Cause:** When the TokenGrid was originally built, it was conceived as a general-purpose token showcase rather than being scoped to the section it lives in. The component included all token categories (color, spacing, radius) even though the parent section is specifically about color identity. The token naming convention — the `color.property.role.emphasis` formula that's a key design decision — was never added to the interactive component, only existing in the playground and docs.

**Resolution:**
1. **Removed** Spacing and Radius tabs — irrelevant to a color identity section.
2. **Added** "Extended Palette" tab showing Red, Green, Yellow, and Teal color families sourced from @carbon/colors v11 — these are real color schemes that exist in the design system and are relevant to the section.
3. **Added** "Token Architecture" tab explaining the `color.property.role.emphasis` naming convention with the formula visualization, dimension pills (property, role, emphasis), and concrete examples with color swatches.
4. Updated SCSS: replaced spacing/radius styles with extended palette grid and token architecture styles.

**Cross-category note:** Also documented as CFB-013 (content) — the section's interactive visual must match the section topic, and the token naming convention is a key content element for communicating design system craft.

**Pattern extracted → `design.md` §14: Interactive visuals in case studies must be scoped to the section topic — a general-purpose component that shows everything dilutes the narrative signal.**

---

## Session: 2026-03-30 — Admin Overlay vs Component Content Separation

#### FB-055: "You're forcing an admin view inline edit button on, treating it as the same element as the actual component"

**UX Intent:** Admin controls (edit, delete) are a separate concern from component content. They must be layered on top as an overlay, never inserted into the document flow where they displace real content. The LinkedIn button was pushed to `position: absolute` at the card's top-right corner to make room for admin buttons in the attribution row — violating Fitts' law (the button should be near the name/role it relates to, not in an arbitrary corner). Admin mode should never alter the spatial layout that a visitor would see.

**Root Cause:** The admin edit + delete buttons were placed as flex children inside the `.attribution` row (in-flow), displacing the LinkedIn button. To compensate, the LinkedIn button was given `position: absolute; top; right` on the card — moving it far from its semantic context (the person's name/role). This is an example of admin controls contaminating the component's document flow.

**Resolution:**
1. **Admin controls → absolute overlay:** Moved edit + delete buttons into a `.adminOverlay` div with `position: absolute; top; right; opacity: 0; pointer-events: none`. On `.card:hover`, the overlay fades in with `opacity: 1; pointer-events: auto` and forces child buttons visible (specificity override on `button { opacity: 1; transform: scale(1) }`).
2. **LinkedIn button → back in attribution row:** Removed `position: absolute` from LinkedIn button. It now sits in-flow within the `.attribution` flex row, directly adjacent to the name/role meta — satisfying Fitts' law (the action is near the content it relates to).
3. **Same pattern applied to project cards:** `.cardAdminActions` on project hero images also converted to the overlay pattern (opacity + pointer-events toggled on `.projectHero:hover`).

**Pattern extracted → `design-anti-patterns.md` AP-034: Admin controls in component document flow.**
**Cross-category note:** Also related to ENG-051 (engineering) — the collection CRUD feature that introduced these buttons.

---

## Session: 2026-03-30 — TestimonialCard Component (Homepage Waterfall)

**Chat:** Current session
**Scope:** `src/components/TestimonialCard.tsx`, `src/components/TestimonialCard.module.scss`, `src/app/(frontend)/HomeClient.tsx`, `src/app/(frontend)/page.tsx`

#### FB-055: "This DAG is drawn horribly — hard to navigate — consider infinite canvas"

**UX Intent:** The Feedback Architecture diagram in the Élan case study was unreadable: 12 nodes crammed into a 380px container with 9px text, percentage-based absolute positioning causing overlap, and no way to explore a complex multi-tier graph. The user requested a draggable canvas approach. Simultaneously, the user identified that zero accessibility standards existed for interactive components.

**Design Decisions:**
- Replaced absolute-positioned SVG+div diagram with a pannable 880×620px canvas inside an overflow-hidden viewport — drag-to-explore interaction pattern consistent with the ScrollSpy dead zone implementation already in the codebase.
- 6-tier vertical layout with 200px-wide nodes at 12px mono font (up from 9px), 32px horizontal gaps, clear visual differentiation per tier (accent tints for input/process/skill, neutral for steps, green for docs, accent border for escalation).
- Zoom controls (+/- buttons + pinch-to-zoom) in top-right corner, plus reset button.
- Click-to-select nodes with description appearing in a detail bar below the canvas (replacing hover tooltip which was invisible on touch).
- Established §17 Interactive Component Accessibility in `design.md` — keyboard navigation (arrow keys for tabs, pan), ARIA tab pattern (`role="tablist/tab"`, `aria-selected`, `aria-controls`), focus indicators (`2px solid accent-60`), `prefers-reduced-motion: reduce`, and pointer-only interaction equivalents.
- Applied ARIA tab pattern to all 4 Élan visual components (TokenGrid, ComponentShowcase, EscalationTimeline, InteractionShowcase) — a total of 18 tab buttons across the 4 tab bars.

**Cross-category note:** Also documented as ENG-052 (engineering) — CSS module purity constraint and `prefers-reduced-motion` scoping.

**Pattern extracted → `design.md` §17: Interactive Component Accessibility — new section covering keyboard, ARIA, focus, motion sensitivity, and pointer-only equivalents.**

---

#### FB-054: "Build a testimonial card to mix in with the waterfall gallery"

**UX Intent:** The homepage masonry grid is currently all project cards — a uniform tile type. Interleaving testimonial cards breaks the visual monotony, adds social proof at the browsing layer (before the visitor commits to reading a case study), and creates height variation that enhances the waterfall stagger effect described in §15.3.

**Design Decisions:**
- Geist Pixel Square for the decorative quotation mark — creates a distinctive typographic accent that ties the card to the design system's pixel font family without competing with body text.
- Initials-based avatar fallback — avoids empty states when no photo is uploaded.
- LinkedIn icon as the only action — keeps the card's purpose focused (social proof) without turning it into a contact widget.
- Surface-secondary background with border — visually distinct from project cards (which use surface-tertiary image placeholders) while sharing the same B2B-tight density.
- No hover state or link behavior — testimonial cards are read-only social proof, not navigable.

**Cross-category note:** Also documented as ENG-048 (engineering) for CMS schema and data flow changes.

**Pattern extracted → `design.md` §15: Added heterogeneous tile types to masonry grid for visual rhythm.**

---

## Session: 2026-03-30 — ScrollSpy Label Left-Alignment

**Chat:** Current session
**Scope:** `src/components/ScrollSpy.module.scss`, `src/app/(frontend)/work/[slug]/ProjectClient.tsx`, `src/app/(frontend)/about/AboutClient.tsx`

#### FB-053: "IT IS STILL NOT FIXED!!!! This text is not fixed. It's still aligned to the center."

**UX Intent:** ScrollSpy section labels that appear on hover must be vertically centered with their corresponding tick marks — the visual midline of each label text must sit at the exact same Y-coordinate as the center of its tick bar. Labels that are "a few pixels down" break the spatial mapping between text and notch. A secondary issue: labels must sit close to the ticks with only a small gap, not be pushed far away.

**Root Cause (two compounding issues):**
1. **Vertical misalignment (primary):** The label used `top: 50%; transform: translateY(-50%)` for vertical centering. However, Framer Motion animates the `x` property via inline `transform`, which *overrides* the CSS `transform: translateY(-50%)`. The result: `top: 50%` places the label's **top edge** at the tick center, and the label extends downward from there — producing a consistent ~6px downward shift. This is the "few pixels down" the user observed.
2. **Horizontal gap (self-inflicted):** The initial fix (min-width: 16rem) pushed labels far from the ticks, creating a huge horizontal gap. The original right-anchored positioning (content-width + `right: calc(100% + spacing)`) was correct for horizontal proximity.
3. **Import path:** Case study pages imported ScrollSpy from the npm package, not the local component. Fixed in the same pass.

**Resolution:**
1. Replaced `top: 50%; transform: translateY(-50%)` with `top: 0; height: $portfolio-spacing-05; display: flex; align-items: center`. This uses the same height as the notch and flex centering, which doesn't rely on `transform` at all — so Framer Motion's `x` animation can't interfere with vertical positioning.
2. Removed `min-width: 16rem; text-align: left` (caused the horizontal gap). Labels are content-width again, tight to the ticks.
3. Synced local ScrollSpy styles with the design system package version.
4. Switched `ProjectClient.tsx` and `AboutClient.tsx` imports to `@/components/ScrollSpy`.

**Escalation note:** This is the 4th centering/alignment complaint (FB-030, FB-033, FB-050, FB-053). The frequency map in `design.md` Appendix already lists "Centering / Symmetry" at 3 — updating to 4.

**Pattern extracted → `design.md` §10.5: Never use CSS `transform` for vertical centering on elements animated by Framer Motion — FM overrides CSS `transform` with its own inline transform for `x`/`y`/`scale`/`rotate` properties. Use `top: 0; height: <parent-height>; display: flex; align-items: center` instead.**

---

## Session: 2026-03-30 — Playground Sidebar Header Spacing

**Chat:** Current session
**Scope:** `playground/src/components/sidebar.tsx`

#### FB-052: "Navigation bar header spacing is asymmetric with collapse button distance inconsistent between states"

**UX Intent:** The sidebar header used `px-4` (16px) horizontal padding while the rest of the sidebar (nav area, search, archive) used `px-1.5` (6px). This created visible misalignment between the logo/collapse button and the nav items below. Additionally, the collapse button's distance from the sidebar's right border was 16px in expanded mode but ~14px in collapsed mode — the inconsistency makes the expand/collapse transition feel unstable.

**Root Cause:** The header container was styled independently from the rest of the sidebar. Expanded state used `px-4` while collapsed used `px-1.5`, and the collapse button (`w-8 h-8`) was larger than the expand button (`h-7` with `pl-[7px]`), creating mismatched proportions between states.

**Resolution:**
1. Unified header container padding to `px-1.5` (matching nav area, search, and archive containers)
2. Added `px-2` to the logo link, placing the É logo box at 14px from sidebar left — aligned with nav item icons (6px container + 8px link padding = 14px)
3. Changed collapse button from `w-8 h-8` to `w-7 h-7` (matching expand button's `h-7`) with icon from `w-4 h-4` to `w-3.5 h-3.5` (matching expand button's icon size)
4. Added `mr-2` to collapse button, placing its right edge at 14px from sidebar right — matching the collapsed expand button's 14px right distance (41px - 6px - 21px = 14px)

**Spacing verification (all elements now at 14px from sidebar edges):**
- Expanded logo: 6px + 8px = 14px from left ✓
- Expanded collapse button: 6px + 8px = 14px from right ✓
- Collapsed expand button: 41px - 6px - 21px = 14px from right ✓
- Nav items: 6px + 8px = 14px from edges ✓
- Archive: 6px + 8px = 14px from edges ✓

**Pattern extracted → `design.md` §4.1: Sidebar header must use the same container padding (`px-1.5`) as nav/archive/search sections, with internal element padding (`px-2`, `mr-2`) providing the 14px edge distance.**

---

## Session: 2026-03-29 — Case Study Detail Page Visual Refinements

**Chat:** Current session
**Scope:** `src/app/(frontend)/work/[slug]/ProjectClient.tsx`, `src/app/(frontend)/work/[slug]/page.module.scss`

#### FB-051: "Collaborators are all stacked into one line; description text too small"

**UX Intent:** Three distinct issues on the case study detail page, all related to scannability and information hierarchy in the sidebar and intro blurb:
1. Collaborators (Product Management, Engineering, Customer Success) render on a single line rather than as distinct entries — the reader can't parse them as separate stakeholder groups.
2. The description/scope statement text (the first blurb after the hero) lacks enough visual presence to capture attention as the most important paragraph on the page.
3. Duration showed a ship date ("Shipped August 2022") which is redundant with the description and doesn't communicate project length.

**Root Cause:**
1. The `EditableArray` component wraps all rendered items inside a single `<div>` that has no column layout. The parent `.metaGroup` uses `flex-direction: column`, but the wrapper div absorbs the spans and renders them inline.
2. `.descriptionText` used `$portfolio-type-base` (16px) and `$portfolio-weight-regular` (400) — the same visual weight as body text, failing to differentiate the scope statement as a higher-priority content element.
3. Content issue: "Shipped August 2022" duplicates information already in the description text. Duration should communicate project length.

**Resolution:**
1. Created `.collaboratorList` CSS class with `display: flex; flex-direction: column; gap: $portfolio-spacing-02`. Applied via `className` on `EditableArray` and as a wrapper `<div>` in the non-admin path. Each collaborator now renders on its own line.
2. Upgraded `.descriptionText` to `$portfolio-type-lg` (18px) and `$portfolio-weight-medium` (500), changed color to `$portfolio-text-primary`. This gives the scope statement a distinct "intro paragraph" presence without being as heavy as section headings.
3. Changed Lacework duration to "~3 months". Updated CMS field description to guide future entries toward project length rather than ship dates.

**Cross-category note:** Also documented as CF-010 (content) and ENG-041 (engineering). The collaborator rendering is an engineering/component issue; the duration and description typography are content strategy issues.

**Pattern extracted → `design.md` §17 (case study detail): The scope statement (first blurb) must have visually distinct typography — larger and medium-weight — to function as the hiring manager's primary engagement hook after the hero image.**

---

## Session: 2026-03-29 — Admin Edit View UX Batch

**Chat:** Current session
**Scope:** `src/app/(frontend)/HomeClient.tsx`, `src/app/(frontend)/page.module.scss`, `src/components/admin/ViewSiteLink.tsx`, `src/payload.config.ts`

#### FB-049: "no easy way for me to enter the visual edit view"

**UX Intent:** The user needs a clear, discoverable path from the Payload CMS admin dashboard to the visual editing experience on the live site. Currently, the only way is to manually navigate to the public URL after logging in.

**Root Cause:** No link existed from the Payload admin UI to the public site. The `AdminBar` component only appears when already on the public site — a chicken-and-egg problem for discovery.

**Resolution:** Created `ViewSiteLink` component (`src/components/admin/ViewSiteLink.tsx`) and registered it as an `afterNavLinks` component in `payload.config.ts`. This adds a "Visual Editor" link with an external-link icon at the bottom of the Payload admin sidebar nav, pointing to the public site root. Also updated the SiteConfig global description to mention the Visual Editor link.

**Pattern extracted -> `design.md`: CMS admin should always provide a one-click path to the visual editing experience.**

**Cross-category note:** Also documented as ENG-039 (engineering) — CMS tab organization.

#### FB-048: "it's a link and will bring users outside elsewhere, not showing the redirect icon"

**UX Intent:** External links should consistently show the ↗ (northeast arrow) icon to signal they will navigate away from the site. The Links section had this icon but the Experience section (formerly Teams) did not.

**Root Cause:** The team items rendered `<a>` tags without the arrow icon, while the sidebar Links section consistently included `<span className={styles.arrow}>&#8599;</span>`.

**Resolution:** Added the `<span className={styles.arrow}>&#8599;</span>` to experience item `<a>` tags when the company has a URL. This matches the established pattern in the Links section.

**Pattern extracted -> `design.md`: All external links must include the ↗ icon — no exceptions. This is a consistency invariant.**

---

## Session: 2026-04-01 — BadgeOverlay Bordered Refinement

**Chat:** Current session
**Scope:** `src/components/ui/BadgeOverlay/BadgeOverlay.module.scss`

#### FB-050: "bordered badge overlays are way too thick and color too strong for light mode"

**UX Intent:** The bordered variant creates a "knockout ring" — visual separation between the badge and its anchor element (avatar, icon). The ring should be barely perceptible: just enough to prevent the badge from visually merging with the surface underneath. It should not be a decorative stroke.

**Root Cause:** Two compounding issues: (1) `border-width: 2px` is disproportionate on a 16-20px element — 12.5% of the xs badge height, making it look chunky. (2) Border color used `--portfolio-border-inverse-bold` (near-white), which is correct for dark mode separation but renders as a harsh, visible white outline against light backgrounds. The right pattern is a "surface knockout" ring — the border color should match the page background, not contrast against it.

**Resolution:** Two changes: (1) Reduced border thickness from 2px to 1.5px — proportionate to the 16-20px badge sizes (9.4% of xs height vs the original 12.5%). (2) Replaced all per-appearance bordered `border-color` values with a single `--portfolio-surface-neutral-minimal` (page background token). This creates a "knockout ring" — a thin sliver of page background that separates the badge from its anchor element, adapting to both light and dark themes automatically. Removed all `&.bordered` overrides from individual appearance/status blocks, consolidating into a single compound `.badge-overlay.bordered` selector declared after appearance blocks for correct cascade.

**Pattern extracted -> `design.md`:** For overlay indicators, use the "knockout ring" pattern — border color should be the page surface, not a contrast color. The ring creates visual separation by revealing the background, not by adding a decorative stroke. At sub-24px element sizes, border thickness should not exceed 1.5px.

#### FB-051: "BadgeOverlay is not even touching the base"

**UX Intent:** When a BadgeOverlay sits on a circular anchor (avatar), it should visually overlap the circle's edge — not float in the dead space between the circle and its bounding box corner.

**Root Cause:** Circular geometry mismatch. The badge was positioned at the bounding-box corner (`top: 0; right: 0`) then translated outward by 40% of its own size. On a circular anchor, the bounding-box corner sits `sqrt(2) - 1 ≈ 41%` of the radius outside the circle. For a 36px avatar, this gap is ~7.5px; for a 48px avatar, ~10px. The badge floated in that gap instead of overlapping the visible circle. Only top-right counter badges were large enough (16px) to accidentally span the gap.

**Resolution:** Adopted the MUI circular-anchor pattern: (1) Inset placement by `14%` from each edge — this moves the anchor point inward from the bounding-box corner to approximately the circle's edge at the 45-degree diagonal. (2) Center the badge on that point with `translate(50%, -50%)`. The 14% inset scales with anchor size (5px on 36px avatar, 6.7px on 48px), and the 50% translate scales with badge size (8px for a 16px counter, 4px for an 8px dot). Both dimensions adapt automatically.

**Pattern extracted -> `design.md`:** When positioning overlay indicators on circular anchors, never use bounding-box corner positioning — the corner is ~7-10px outside the visible circle. Use percentage insets (`14%` from each edge for the standard circle-inscribed-in-square case) plus `translate(50%)` centering to land the badge at the circle's edge.

#### FB-052: "highlight bold BadgeOverlay label is invisible — contrast violation"

**UX Intent:** Counter labels inside a bold-emphasis badge overlay must be instantly legible at any size — especially at 10-12px where the element is already at the perceptibility floor.

**Root Cause:** Wrong text token. `highlight.bold` used `--portfolio-text-always-dark-bold` (#161616, near-black) on `--portfolio-surface-brand-bold` (#3336FF, saturated blue-violet). The contrast ratio for dark-on-dark-saturated is approximately 1.7:1 — well below the WCAG AA minimum of 4.5:1 for small text. The existing `Badge` component correctly uses `--portfolio-text-inverse-bold` (#FFFFFF) for the same variant, yielding ~8.6:1 contrast.

**Resolution:** Changed `highlight.bold` text color from `var(--portfolio-text-always-dark-bold)` to `var(--portfolio-text-inverse-bold)`, matching the Badge component's token assignment. White text on the brand-blue background exceeds WCAG AA for both normal and large text.

**Pattern extracted -> `design.md`:** When creating companion components (e.g., BadgeOverlay from Badge), always cross-reference the parent component's token assignments for each variant. Saturated brand surfaces (≤ 50% lightness) require inverse (light) text — never dark text tokens. Audit every `appearance × emphasis` cell against WCAG AA (4.5:1) before shipping.

---

### Session: 2026-04-02 — Collapsed NavItem Badge Overlay Vertical Spacing

#### FB-053: "The vertical spacing is cramped — badges are sticking out and there's barely any breathing room"

**UX Intent:** When stacking collapsed NavItems with badge overlays vertically, the visual gap between items should feel open and breathable — not crowded by badges that overflow the element's bounding box.

**Root Cause:** The playground "Collapsed with Badge Overlay" section used `gap-1` (4px) between vertically stacked collapsed NavItems. This gap is measured between the NavItem's CSS box-model edges — but badge overlays are `position: absolute` and extend ~6-10px beyond the top-right corner of the bounding box. The human eye perceives spacing as the distance between the closest *visible* elements, not between invisible box edges. With badges protruding upward and the next item's badge protruding downward, the *visual* gap was effectively 0px despite a 4px *layout* gap. This violates the design language's spacing principle: spacing must account for what the eye sees, not what the box model measures.

**Resolution:** Increased gap from `gap-1` (4px) to `gap-3` (12px) in the "Collapsed with Badge Overlay" section. The 12px gap provides enough clearance for the badge overlay's visual footprint (~8px protrusion) plus minimum perceivable breathing room (~4px). Other sections without overflow elements retain `gap-1` since their box-model edges match their visual edges.

**Pattern extracted -> `design.md`:** When stacking elements that contain positioned overlays (badge overlays, tooltips, status dots), the vertical/horizontal gap must account for the overlay's visual footprint, not just the parent element's box-model bounds. Rule of thumb: `gap ≥ overlay protrusion + minimum breathing room (4px)`.

**Cross-category note:** Also documented as ENG-089/ENG-090 (engineering) for the `href="#"` breakage and `preventDefault` fix that occurred during the same session.

---

### Session: 2026-04-02 — VerticalNav Component & NavItem Brand Active Variant

#### FB-054: "Build a VerticalNav design system component mirroring the playground sidebar"

**UX Intent:** Promote the playground sidebar's interaction model and layout into a reusable design system component. The sidebar's 4-state model (default, hover, expanded, active with brand accent) should be formally available through the NavItem component.

**Root Cause (NavItem active state gap):** NavItem's `.active` class used neutral colors (`surface-neutral-regular` background, `text-primary` text) — a generic active treatment. The playground sidebar's documented 4-state model (§4.5b) uses brand accent color for active state (`text-brand-bold`, no resting background, `surface-brand-subtle` hover). NavItem lacked this variant because it was built as a generic primitive before the sidebar's state model was formalized.

**Resolution:**
1. Added `activeAppearance` prop to NavItem: `"neutral"` (default, backward-compatible) and `"brand"` (accent color, no resting bg, brand-tinted hover). The brand variant maps to the playground sidebar's §4.5b active state.
2. Added polymorphic `as` prop to NavItem for framework-agnostic link rendering (consumers pass `next/link` or any router component).
3. Created VerticalNav compound component (`src/components/ui/VerticalNav/`) with Provider, Header, Content, Section, Group, Category, Footer, and SliverPortal subcomponents. All values use DS semantic tokens — no Tailwind, no inline styles.
4. Added `$portfolio-duration-nav` (200ms) and `$portfolio-easing-nav` (ease-out) motion tokens for navigation spatial transitions.

**Pattern extracted -> `design.md`:** NavItem supports two active appearance modes. Use `"brand"` in sidebar/vertical navigation contexts where accent color signals location. Use `"neutral"` in contexts where a subtle background-based active state is preferred (horizontal nav, settings panels).

**Cross-category note:** Also documented as ENG-091 (engineering) for the motion token addition and VerticalNav component architecture.

---

### Session: 2026-04-02 — NavItem Tiered Architecture (Expanded State + NavItemTrigger + NavItemChildren)

#### FB-055: "Category button states should belong to NavItem, not VerticalNav — need parent/children tier"

**UX Intent:** The NavItem component should be the single source of truth for all navigation item visual states and behaviors, including expandable parent items. The tiered navigation pattern (parent with children) should be defined at the NavItem primitive level, not reimplemented at the sidebar layout level.

**Root Cause:** VerticalNavCategory was a "shadow NavItem" — a complete parallel implementation (~80% shared visual DNA, zero shared code) with its own `.categoryButton`, `.categoryActive`, `.categoryExpanded`, `.categoryCollapsed`, `.categoryDisabled` SCSS classes. NavItem's 4-state model was incomplete: the design doc (§4.5b) defined four states (default, hover, expanded, active) but NavItem only implemented three — the "expanded" state (bold text, medium weight, no resting bg) was missing. This forced VerticalNavCategory to build it from scratch. The parent/children tier concept existed only inside VerticalNav, making it impossible to reuse in other contexts (horizontal nav, mobile drawer, settings panels).

**Resolution:**
1. Added `expanded` prop to NavItem (the missing 4th state): bold primary text, medium weight, no resting background. State priority: `active` > `expanded` > default.
2. Created `NavItemTrigger` — an expandable parent that composes NavItem internally, adding an auto-rotating chevron in the trailing slot and controlled/uncontrolled expand/collapse behavior (`expanded`, `defaultExpanded`, `onExpandedChange`).
3. Created `NavItemChildren` — an animated collapsible container using the nav motion token (200ms ease-out) for smooth height transitions.
4. Refactored `VerticalNavCategory` to compose `NavItem` + `NavItemChildren` instead of raw `<button>` — eliminated all 11 duplicate SCSS classes (`.categoryButton`, `.categoryCollapsed`, `.categoryActive`, `.categoryExpanded`, `.categoryDisabled`, `.categoryIcon`, `.categoryLabel`, `.chevron`, `.chevronRotated`, `.mobileSubmenu`) from `VerticalNav.module.scss`.

**Pattern extracted -> `design.md`:** Navigation tier behavior (expandable parent, collapsible children) belongs at the nav item primitive level, not the layout level. Layout components (VerticalNav, HorizontalNav) add spatial concerns (flyout portals, fixed positioning) but compose — never reimplement — the primitive. This follows the Carbon/Fluent UI "School A" pattern (separate leaf vs parent components).

**Cross-category note:** Also documented as ENG-093 (engineering) for the architectural refactoring and duplication elimination.

### Session: 2026-04-02 — NavItem Expanded Chevron, Expandable Badge, Trailing Spacing

#### FB-056: "Expanded state has no chevron — and expandable items can have badges too"

**UX Intent:** (1) The "Expanded" visual state demo should show the complete expandable appearance — including the rotated chevron — because users will never see an expanded item without one. (2) Expandable nav items can carry badges (notification counts, status indicators) alongside the chevron. (3) The trailing slot (chevron) should be right-aligned consistently with how badges are right-aligned.

**Root Cause:** Three issues: (a) The "Four Visual States" section used a bare `<NavItem expanded>` which showed bold text but no chevron — misleading because in practice the expanded state always appears on a `NavItemTrigger` which includes the chevron. (b) `NavItemTrigger` did not support the `badge` prop, so there was no way to compose badges with expandable items. (c) The `.trailing` CSS class lacked `margin-inline-start: auto`, while `.badge` had it — this meant the trailing slot relied solely on `.label { flex: 1 }` for right-alignment instead of having its own explicit push-to-right behavior matching the badge.

**Resolution:**
1. Replaced `<NavItem expanded>` with a controlled `<NavItemTrigger expanded={true} onExpandedChange={() => {}}>` in the "Four Visual States" demo — now shows the complete expandable appearance with rotated chevron.
2. Added `badge?: ReactNode` prop to `NavItemTrigger` (pass-through to NavItem). Badge renders between label and chevron.
3. Added `margin-inline-start: auto` to `.trailing` in `NavItem.module.scss`, matching `.badge`'s existing right-alignment pattern. Both trailing content types now use the same CSS mechanism.
4. Added "Expandable with Badge" demo section showing all three sizes with various badge types + chevrons.

**Cross-category note:** Also documented as ENG-094 (engineering) for the component API addition and CSS fix.

### Session: 2026-04-02 — DS Parity Remediation (Primitives Pass)

#### FB-057: Systematic DS primitive adoption across portfolio site

**UX Intent:** Bring all site-level SCSS into alignment with Elan design system primitives — tokens, typography mixins, layout mixins, interactive mixins, spacing, color, elevation, border, and z-index scales. No component swaps; restyle existing code using DS fundamentals. Motion explicitly deferred.

**Root Cause:** Site code predated the design system's token and mixin expansion. Many values were hardcoded (font-family, font-size, font-weight, border-radius, padding, gap, z-index, rgba overlays) despite equivalent DS tokens/mixins existing. This created drift: a token change wouldn't propagate to site code.

**Resolution:**
1. **Contact page:** Replaced manual form focus/hover CSS with `@include form-field-focus` and `@include hover-micro-lift`; nav pill with `@include flex-between`; transitions with `@include transition-fast`. Extracted gradient to scoped custom properties. Replaced all 15+ `rgba(255,255,255,N)` with overlay tokens.
2. **Experiments page:** Replaced nav font declarations with `@include body-sm-medium`, `@include subtitle-3-bold`; replaced all ~18 `rgba(255,255,255,N)` with overlay tokens.
3. **elan-visuals:** Replaced `rgba(0,0,0,0.1)` with `$portfolio-overlay-black-10`, `border-radius: 2px/3px` with `$portfolio-radius-xs`, `z-index: 3` with `$portfolio-z-raised`.
4. **inline-edit:** Replaced 9 instances of `font-family: system-ui` with `$portfolio-font-sans`, 20+ `font-weight` literals with weight tokens, 15+ `border-radius` values with radius tokens, 15+ `padding/gap` pixel values with spacer tokens.
5. **ProjectEditModal:** Same pattern — `font-size`, `font-weight`, `border-radius`, `padding`, `gap`, `box-shadow` all moved to tokens.
6. **Type scale:** Added `$portfolio-type-4xs` (9px). Bulk-replaced 28+ `font-size: 10px` → `$portfolio-type-2xs` and 5 `font-size: 9px` → `$portfolio-type-4xs` across 6 files.
7. **Overlay tokens:** Extended `$portfolio-overlay-white-*` from 7 to 19 steps (04–75). Updated `_custom-properties.scss` to reference SCSS vars instead of hardcoding rgba.
8. **z-index:** Replaced all 9 hardcoded `z-index: N` literals with semantic tokens across 6 files.
9. **Cleanup:** Deleted dead `src/styles 2/` directory (11 files). Removed unused `tailwind-merge` + `clsx` deps and dead `cn()` utility.

**Cross-category note:** Also documented as ENG-095 (engineering) for token sync, build verification, and dependency cleanup.

#### FB-058: NavItem sizing adjustments informed by cross-system audit

**UX Intent:** Align NavItem sizing with industry best practices from MUI, IBM Carbon, shadcn/ui, Ant Design, and Adobe Spectrum while preserving the design system's identity. Four specific adjustments: (1) increase sm horizontal padding from 6px to 8px to match md, (2) flatten md/lg gap from 8/10px to 8/8px, (3) unify trailing icon size with leading icon at every size, (4) add a touch-optimized size tier at 44px (Apple HIG minimum tap target).

**Root Cause:** Cross-system audit revealed the sm padding (6px) was tighter than any major system, the lg gap (10px vs md's 8px) added complexity without perceptual benefit, trailing icons being 2px smaller than leading added specification overhead with no industry precedent, and the system lacked a mobile/touch tier that most modern systems include.

**Resolution:**
1. sm padding: 6px → 8px (now matches md; tokens: `$portfolio-spacer-utility-0-75x` → `var(--portfolio-spacer-1x)`)
2. lg gap: 10px → 8px (flat with md; token: `$portfolio-spacer-utility-1-25x` → `var(--portfolio-spacer-1x)`)
3. Trailing icon = leading icon at all sizes (deleted `$_nav-trailing-*` variables; `.trailing svg` now uses `$_nav-icon-*`)
4. New `touch` size: 44px height, 16px font, 20px icon, 16px padding, 8px gap — content stays at lg scale, only the container grows
5. Updated TypeScript type (`NavItemSize`), badge size map, and all playground demos

**Principles reinforced:** Height is the primary size differentiator; icon and font can be held constant across larger sizes. Trailing icons should match leading icons unless there's a strong visual reason to differentiate. Touch targets are a first-class concern, not an afterthought.

---

#### FB-059: Hardcoded tool/technology tags should use DS Badge component

**UX Intent:** Tool and technology tags displayed on case study detail pages and the experiments listing page were rendering as raw `<span>` elements with custom SCSS, bypassing the existing DS Badge component. The user requested an audit to identify all such instances and swap them with the Badge component for consistency.

**Root Cause:** The tool tags predated the Badge component's creation. When Badge was added to the DS, existing pages were not retroactively updated. Two locations were hardcoded:
1. **Case study detail pages** (`ProjectClient.tsx`) — `.toolTag` spans with custom caption styling, tertiary surface bg, and squared radius
2. **Experiments listing** (`ExperimentsClient.tsx`) — `.tag` spans with custom mono/uppercase pill styling, transparent bg, and faint white border on dark background

**Resolution:**
1. Case study tools → `<Badge appearance="neutral" emphasis="subtle" size="sm" shape="squared">` — direct structural match; removed custom `.toolTag` SCSS class entirely
2. Experiments tags → `<Badge appearance="always-light" emphasis="regular" size="sm" shape="pill" mono>` with a page-level `.tag` className override for dark-surface color adaptation (transparent bg, 12% white border, 40% white text). Badge handles shape, sizing, typography, and mono formatting; page handles context-specific color.
3. Added Badge import to both client components

**Principles reinforced:** When a DS component exists for a pattern (tags, badges, pills), always use it rather than recreating with raw elements + SCSS. Context-specific color overrides via className are acceptable when the Badge's structural CSS remains canonical.

---

#### FB-060: Uppercase label typography inconsistency — handrolled patterns replaced with `@include label` / `@include label-sm`

**UX Intent:** All uppercase section labels, group headers, and category titles across the site should use the DS `label` or `label-sm` typography mixin for consistency. The user flagged "ROLE" / "TEAM" / "DURATION" / "TOOLS" labels on case study pages and asked whether all similar uppercase text uses the same DS style.

**Root Cause:** The `label` and `label-sm` mixins existed in the DS but were not consistently adopted. Many components and pages recreated the same uppercase + tracked + small-font pattern with raw CSS properties, often with drifting letter-spacing values (`0.04em`, `0.05em`, `0.08em`, `0.1em` vs the canonical `$portfolio-tracking-wider: 0.05em`).

**Resolution — 14 classes across 9 files replaced with mixin + overrides:**

| File | Class(es) | Was | Now |
|------|-----------|-----|-----|
| CommandMenu.module.scss | `[cmdk-group-heading]` | raw props, `0.05em` | `@include label` + color override |
| Select.module.scss | `.groupLabel` | raw props, tracking-wider | `@include label` + color override |
| DropdownMenu.module.scss | `.label` | raw props, tracking-wider | `@include label` + color override |
| TestimonialCard.module.scss | `.linkedinEditorLabel` | raw props, tracking-wider | `@include label` (exact match) |
| DescriptionList.module.scss | `.label` | raw props, `0.05em`, mono | `@include label` + mono/color override |
| ProjectEditModal.module.scss | `.fieldLabel` | raw props, `0.04em` | `@include label` + weight override |
| inline-edit.module.scss | `.arrayFieldLabel`, `.formatLabel` | raw props, `0.05em` / `0.04em` | `@include label-sm` + overrides |
| typography/page.module.scss | `.previewLabel` | partial raw props | `@include label` + color override |
| elan-visuals.module.scss | 7 classes (section/dimension/group titles) | raw props, tracking-wider | `@include label-sm` or `@include label` + overrides |

**Intentionally not changed:**
- VerticalNav `.sectionLabel` / `.groupLabel` — uses `tracking-wide` (0.02em) instead of `tracking-wider` (0.05em), likely an intentional tighter tracking for the compact sidebar context
- TestimonialCard `.avatarInitials` — `text-transform: uppercase` is for display initials (e.g., "JD"), conceptually different from a section label
- Typography page mono labels (`.fontCategory`, `.specimenLabel`, `.controlLabel`) — mono-font demo labels, different pattern
- Experiments `.rowDate` — mono-font date display on dark bg, different pattern
- Admin NavPages — Payload admin context, cannot use SCSS `@include` (no `@use` import); uses CSS custom properties
- Elan-visuals micro-labels (`type-4xs`, mono, brand-colored) — specialized data-viz annotations, too divergent from label mixin

**Principles reinforced:** Typography mixins exist to prevent letter-spacing drift. When a class matches a mixin's intent (small uppercase tracked text used as a section/group/meta label), always use the mixin and override only the properties that differ (color, weight, font-family). This ensures that future type-scale changes propagate automatically.

---

#### FB-061: "Label text is too thick — uppercase labels should use regular (400) weight"

**UX Intent:** The user found the uppercase "ROLE" / "TEAM" / "DURATION" / "TOOLS" labels on the case study sidebar too heavy and asked for a thinner weight — specifically at the design system mixin level, not as a one-off page fix.

**Root Cause:** The `label` and `label-sm` mixins used `$portfolio-weight-medium` (500) as their default, and ~10 consumers further overrode to `$portfolio-weight-semibold` (600). Uppercase glyphs + wide letter-spacing (`tracking-wider: 0.05em`) already provide substantial visual weight — stacking `medium` or `semibold` on top creates double emphasis that competes with actual headings. Industry precedent (IBM Carbon, Adobe Spectrum) uses `regular` (400) for uppercase tracked labels.

**Resolution:**
1. Changed `@mixin label` and `@mixin label-sm` from `$portfolio-weight-medium` (500) → `$portfolio-weight-regular` (400)
2. Removed all `font-weight: semibold` overrides from 10 consumers across 6 files:
   - `work/[slug]/page.module.scss` — `.metaLabel`, `.projectNavLabel`
   - `page.module.scss` — `.sectionLabel`
   - `ProjectEditModal.module.scss` — `.fieldLabel`
   - `inline-edit.module.scss` — `.arrayFieldLabel`, `.formatLabel` (was regular, now redundant)
   - `elan-visuals.module.scss` — 6 section/group title classes

**Principles reinforced:** Uppercase + tracking is itself an emphasis mechanism — the font-weight should compensate downward, not stack upward. Consumer overrides that contradict the mixin's canonical weight are a design system smell — if many consumers override the same property, the mixin default is wrong.

---

#### FB-062: "Zoom buttons and other elan-visual elements not using DS components"

**UX Intent:** The user observed that the ArchitectureDag zoom buttons (+, −, ↺) were raw `<button>` elements with custom CSS instead of using the DS `Button` component. Audit revealed additional non-DS elements across all elan-visual case study components.

**Root Cause:** The elan-visual components were built as bespoke case study visualizations before the DS component library reached full coverage. Custom implementations of buttons, tabs, and badges duplicated patterns already solved by DS components — creating maintenance burden and visual inconsistency.

**Resolution:**
1. **Zoom buttons** (EscalationTimeline.tsx) → DS `Button` with `iconOnly size="xs" appearance="neutral" emphasis="regular"` — removed `.dagZoomBtn` CSS class
2. **Tab bars** in all 4 elan-visual components (EscalationTimeline, InteractionShowcase, ComponentShowcase, TokenGrid) → DS `Tabs` / `TabsList` / `TabsTrigger` / `TabsContent` (Radix UI) — eliminated ~80 lines of manual keyboard navigation and ARIA handling per component. Removed `.tabBar`, `.tab`, `.tabActive` CSS classes.
3. **Badges** — `.escalationBadge` (EscalationTimeline) → DS `Badge appearance="highlight" emphasis="subtle" size="xs"`. `.densityBadge` (IncidentDensityMap) → DS `Badge appearance="highlight" emphasis="subtle" size="xxs" mono`.
4. Removed dead CSS: `.closestMethodToggle`, `.tabWrong` (unreferenced in any TSX)
5. Added `.tabList` override class for `overflow-x: auto` on DS TabsList

**Elements intentionally kept as custom implementations:**
- DAG nodes (`.dagNodeBox`) — absolute-positioned diagram elements with tier-specific coloring; no DS component equivalent
- Escalation strikes (`.escalationStrike`) — interactive disclosure cards with custom layout
- Density map rows (`.densityRow`) — accordion-like expandable items
- Naming pills (`.namingPill`) — interactive dimension pickers in token builder
- Color dropdown (`.colorDropdownTrigger`) — specialized picker UI
- Funnel stages — data visualization bars

These remain custom because they are purpose-built visualization primitives with no clean DS component mapping, but they all use DS tokens (colors, spacing, typography, radii) as their foundation.

**Principles reinforced:** When a DS component exists for a pattern (Button, Tabs, Badge), use the component — even in bespoke visualizations. Custom CSS that reimplements DS component behavior is maintenance debt. Visualization-specific elements that don't map to any DS component are acceptable when they use DS tokens.

---

#### FB-063: "Menu item spacing audit vs. IBM Carbon, MUI, Ant Design"

**UX Intent:** Comparative analysis of Élan Menu item spacing against three industry-standard design systems (IBM Carbon v11, MUI v6, Ant Design v5). Goal: identify discrepancies in inline padding, vertical padding, font-size scaling, icon sizing, and icon-to-text gap.

**Key Finding:** The Menu component intentionally mirrors the Button spatial scale 1:1 — every dimension (height, padding-block, padding-inline, font-size, icon-size, gap) is identical between Button and Menu. The "discrepancies" against industry systems are deliberate design decisions from the One GS reference model, not Menu-specific issues.

**Industry divergences (deliberate, consistent with Button):**
- **Inline padding**: Élan uses progressive scaling (6→8→12→16→24px); Carbon/MUI/Ant all use constant 16px. Élan only reaches 16px at lg.
- **Font size**: Élan uses 4-step progression (12→14→16→18px); Carbon uses constant 14px. Élan's "size = different weight class" vs. Carbon's "size = same content, different density."
- **Icon size**: Élan scales 16→18→20→22→24px; Carbon uses constant 16px.
- **Icon-to-text gap**: Élan scales 4→6→8→12→16px; Carbon uses ~8px constant, Ant uses 10px.
- **Vertical padding**: Élan uses explicit block padding (padding-derived height model); Carbon/Ant use min-height + flex centering.

**Resolution:**
1. Added `padding-inline: 4px` to `.menu` container — supplements item-level inline padding without changing the Button spatial scale. At xs, effective inset from menu border is now 10px (4px container + 6px item) instead of 6px. Matches Ant Design's `itemMarginInline: 4px` pattern.
2. Separator/header/footer negative margins already compensate, so dividing lines still span full width.
3. All other dimensions left unchanged — they are consistent with Button and the One GS reference.

**Design review flag:** If the 4px icon-to-text gap at xs or 6px item inline padding at xs/sm ever feels too tight in a menu context, the fix would be a design-system-wide spatial scale change affecting Button + Menu + all future components on the same scale. This is not a Menu-only decision.

**Principles reinforced:** Menu items are contained elements (inside a bordered panel), unlike buttons which are standalone. Container-level padding is a valid menu-specific concern that doesn't violate Button spatial parity. When comparing against industry systems, distinguish between deliberate architectural decisions (progressive vs. constant scaling) and actual gaps (missing container inset).

---

#### FB-064: "Menu header demo should use real use case, not generic placeholder"

**UX Intent:** The MenuHeader playground demo used a "Select all" button — a plausible but uncommon use case. The user pointed out that high-fidelity demos create strong mental models, and showing the wrong content misleads viewers about the component's purpose even if they're "smart enough" to know it's a demo.

**Root Cause:** The AI agent extrapolated MenuHeader/MenuFooter from the One GS design and chose generic demo content ("Select all" / "Cancel") without considering what the most representative real-world usage would be. The canonical pattern for menu headers is a search/filter input (VS Code command palette, Notion's page picker, Slack's channel switcher).

**Resolution:**
1. Replaced MenuHeader demo content: "Select all" button → `Input` with `leadingIcon={<Search />}` and `placeholder="Filter actions..."`. This is the single most common real-world use case for a fixed menu header.
2. Updated MenuFooter demo content: "Cancel" → "Manage actions..." — a more realistic secondary action pattern.
3. Updated demo description text to explain the header slot's purpose in terms of the real use case.
4. Added design principle 7.6 ("Playground Demos Must Show the Real Use Case") to `docs/design.md`.

**Principles reinforced:** Demo content is not throwaway — it teaches usage patterns. The human brain pattern-matches against demo content rather than reading API descriptions. Always ask "what is the single most common real-world use case?" before writing a playground demo. Generic labels like "Header slot" or "Content here" signal that the author didn't think through actual usage.

---

#### FB-065: "Line-on-line visual collision — Input minimal inside Menu with separators"

**UX Intent:** The user observed that using `Input emphasis="minimal"` (bottom-border underline style) inside a `MenuHeader` creates visual ambiguity because the menu already uses horizontal lines for `MenuSeparator` dividers and `MenuHeader`/`MenuFooter` border lines. Two different semantic elements — "type here" vs. "group boundary" — render as visually identical horizontal lines.

**Root Cause:** When choosing the Input emphasis for the menu header demo, the agent selected "minimal" (underline) without auditing the parent container's existing visual vocabulary. The menu container already owns the "horizontal line" visual language for separators and section boundaries. Nesting another line-based element inside it creates ambiguity.

**Resolution:**
1. Changed `Input emphasis="minimal"` to `emphasis="regular"` (box/bordered style) in the MenuHeader demo. The box style is visually distinct from divider lines — it reads as a contained interactive field.
2. Updated demo description to note the emphasis choice rationale.
3. Added anti-pattern AP-058 ("Overlapping Visual Language — Line-on-Line Ambiguity") to `docs/design-anti-patterns.md`.

**Principles reinforced:** Before choosing a child component's visual variant, audit the parent container's visual vocabulary. If the parent already uses a visual treatment (lines, fills, borders) for a specific semantic purpose, the child must use a different treatment to remain visually distinct. Distinct semantics require distinct visual treatments. See AP-058.

---

#### FB-066: "Header/footer padding stacks with nested component padding; Input size must match Menu size"

**UX Intent:** Two issues in the MenuHeader demo: (1) the header had the same padding as menu items (e.g., 10px/12px at md), but since it wraps an Input that has its own internal padding, the total whitespace was visually doubled compared to regular items; (2) the Input was hardcoded to `size="xs"` regardless of the Menu's size, causing a 16px search icon next to 20px menu item icons at the default md size.

**Root Cause — padding:** Header/footer were treated as content rows (same padding as `.item`) rather than structural slots. A slot wraps content that brings its own sizing — it should only add minimal breathing room from the border, not full item-level padding.

**Root Cause — size mismatch:** The demo chose `size="xs"` for compactness without considering that Menu and Input share the same spatial scale (identical icon sizes at each step: 16/18/20/22/24). Mismatched sizes create a visible icon-size discrepancy that breaks visual consistency within the menu.

**Resolution:**
1. Changed header/footer padding from copying full item padding to a fixed minimal `padding-block` only (4px at xs–md, 6px at lg, 8px at xl). Inline padding is handled by the base header/footer styles. The nested component (Input, Button) brings its own height and internal padding.
2. Changed the demo's `Input size="xs"` to `size="md"` and `Button size="xs"` to `size="md"` to match the Menu's default size. This aligns the search icon (20px) with menu item icons (20px).
3. Updated demo description to note: "Match nested component sizes to the Menu size so icons align visually."

**Design rule — Slot vs. Row:** Structural slots (header, footer) wrap content that owns its own sizing. They should use minimal padding (breathing room from borders only). Content rows (items, labels) are the content itself — they use the full spatial scale padding. Never copy item padding to a slot — it doubles the whitespace. See AP-059.

**Design rule — Size Parity for Nested Components:** When a component is nested inside a container that defines a size scale, the nested component's size must match the container's size so that proportional elements (icons, font, padding) remain visually consistent. Input, Button, and Menu all share the same spatial scale — use the same size keyword across all of them.

---

#### FB-070: "Eyebrow mono font looks bad as section headers — revert to sans, keep mono as option for metrics"

**UX Intent:** The Eyebrow component was switched to mono font (Geist Mono) globally, but mono doesn't work well for section header / nav divider use cases — it looks too technical and clashes with the surrounding sans-serif UI. However, mono is desirable for metric/data annotations where tabular alignment aids scanability.

**Root Cause:** Applying a single font family globally to a component that serves two distinct visual contexts (structural headings vs. data labels) forces one context to compromise. Section headers need the same font family as their surrounding UI to feel integrated; metric labels benefit from mono's uniform character widths.

**Resolution:**
1. Reverted Eyebrow base font from `var(--portfolio-font-mono)` to `var(--portfolio-font-sans)` in `Eyebrow.module.scss`.
2. Added a `.metric` class and corresponding `metric?: boolean` prop (default: `false`) that opts into `var(--portfolio-font-mono)`. Originally named `mono` — renamed in FB-071 to follow semantic intent naming.
3. Updated playground metric annotations demo to use `metric` prop. Updated PropsTable and code snippet.

**Design rule — Font as Context Signal:** When a component serves multiple visual contexts, font family should be a per-instance option, not a global default. Default to the font that integrates with the majority use case (sans for structural UI), and provide an opt-in for the minority use case (mono for data display).

---

#### FB-071: "Prop names must communicate intent, not implementation — rename `mono` to `metric`"

**UX Intent:** The `mono` prop on Eyebrow describes what CSS changes (switches to monospace font) but not when to use it. An agent encountering `mono` has to reason through a two-step chain: "Is this a data context? → If so, use mono." The prop name should collapse that to one step so agents can make the right decision from the name alone.

**Root Cause:** The original naming (`mono`) followed the implementation-detail pattern common in utility-first CSS (`font-mono`, `rounded-full`, `bg-gray`). This pattern works for low-level utilities where the consumer is always a human developer making an aesthetic choice. It fails for component props where the consumer is an AI agent making a contextual decision — the agent needs to know *when*, not *what*.

**Resolution:**
1. Renamed `mono` → `metric` in `EyebrowProps`, SCSS module class (`.mono` → `.metric`), and all playground references.
2. Established **Design guardrail #8** in `AGENTS.md`: "ALWAYS name component props, CSS classes, and design tokens by semantic intent, never by visual implementation."
3. Established **Process Principle §7.7** in `docs/design.md`: "Name by Semantic Intent, Not Visual Implementation" — includes the one-step test, protocol, and example table.
4. Added frequency map entry: "Semantic intent naming" at Critical priority.

**Design rule — Semantic Intent Naming:** Every prop, variant, CSS class, and token in the design system must be named by its use-case context (when/why), not its CSS effect (what). The test: can an agent decide whether to use this prop from its name alone, without inspecting the source? If the name requires a second reasoning step to map from implementation to context, it fails. This is a first-class design system principle — it applies to every new API surface.

---

#### FB-072: "Eyebrow adoption audit — migrate ~44 hand-rolled label instances to `<Eyebrow>`"

**UX Intent:** Consolidate all hand-rolled uppercase+tracked text (via `@include label` / `label-sm` SCSS mixins) into the canonical `<Eyebrow>` component across all public-facing pages and elan-visuals, ensuring a single source of truth for this text pattern.

**Root Cause:** When the Eyebrow component was created (FB-091), it unified three divergent implementations but didn't retroactively migrate existing call sites. Across 9 files and ~44 JSX instances, raw `<span>`, `<div>`, and `<h2>` elements still used `@include label` / `label-sm` mixins directly, duplicating the typography Eyebrow now owns.

**Resolution:**
1. **Tier 1 (public-facing, 6 page pairs, ~30 instances):**
   - HomeClient.tsx: 3 sectionLabel instances — wrapped `<Eyebrow as="h2">` around existing `<EditableText>` (inner `as` changed to `"span"` removed, relies on Eyebrow for typography inheritance).
   - AboutClient.tsx: 2 sectionLabel instances — `<h2>` → `<Eyebrow as="h2">`.
   - ProjectClient.tsx: 4 metaLabel + 1 companyCalloutLabel + 2 projectNavLabel — `<span>` → `<Eyebrow>`.
   - ExperimentsClient.tsx: 1 label instance — `<span>` → `<Eyebrow>`.
   - ContactClient.tsx: 1 trustLabel instance — `<span>` → `<Eyebrow>`.
   - Motion page: 17 demoLabel instances — `<div>` → `<Eyebrow as="div">`.
2. **Tier 2 (elan-visuals, 3 components, ~13 instances):**
   - ComponentShowcase: 1 componentCategory — `<span>` → `<Eyebrow size="sm">`.
   - TokenGrid: 2 namingSectionTitle + 2 namingDimensionTitle — `<span>` → `<Eyebrow size="sm">`.
   - InteractionShowcase: 8 beforeAfterLabel — `<div>` → `<Eyebrow as="div">`.
3. **SCSS cleanup:** Removed `@include label` / `@include label-sm` from all 9 SCSS files, preserving non-typography properties (color, display, margin, padding, border).
4. **No TextRow migrations** — candidates were in tightly-coupled visualization components where the risk/reward ratio was unfavorable.

**Design rule — Component Adoption Audit Pattern:** When creating a new primitive that replaces hand-rolled patterns, schedule a follow-up audit to retroactively migrate existing call sites. The audit should: (a) search for the SCSS mixin the component replaces, (b) classify each hit as definite/borderline/excluded with reasons, (c) batch migrations by risk tier (public-facing first, internal second), (d) preserve non-typography residual styles in the original SCSS class.

---

#### FB-073: "Input trailing slot — generic content slot for Kbd, badges, and chips"

**UX Intent:** Expand the Input component's API to support a generic `trailing` slot for arbitrary content (Kbd shortcut hints, status badges, action chips) positioned after clear/status but before `trailingIcon`. The Kbd component was already designed with sizes calibrated to fit inside Input, but the Input never had a slot to accept it.

**Root Cause:** The existing `suffix` prop served double duty — both as a value-context affix ("USD", ".com") and as a container for non-affix content like Kbd. This conflated two different semantic roles: `suffix` wraps content in `.affix` styles (font-family, color, whitespace) that are appropriate for text units but interfere with self-styled components like Kbd that own their own typography. A dedicated slot was missing.

**Resolution:**
1. Added `trailing?: ReactNode` to `InputProps` in `src/components/ui/Input/Input.tsx`.
2. Rendered the slot inside a `<span className={styles.trailingSlot}>` positioned after `statusIcon` but before `trailingIcon` — the rightmost non-icon position.
3. Added `.trailingSlot` to `Input.module.scss` — `display: inline-flex; align-items: center; flex-shrink: 0; pointer-events: auto` — a neutral container that lets children determine their own dimensions and styles.
4. Updated Input playground to use `trailing={<Kbd bordered>⌘K</Kbd>}` instead of `suffix={<Kbd>⌘K</Kbd>}`.
5. Updated Menu playground's header demo to show `trailing={<Kbd bordered size="md">⌘F</Kbd>}` inside the search Input.
6. Updated the Input Props table: added `trailing` entry; refined `suffix` description to clarify it's for value affixes.

**Design rule — Slot Semantic Separation:** Input's addon slots have distinct roles: `prefix`/`suffix` are value affixes (contextual to what the user types), `leadingIcon`/`trailingIcon` are icon slots (forced to icon dimensions), and `trailing` is a generic content slot (neutral container, no imposed styles). When a component needs to appear inside Input but isn't a value affix or an icon, use `trailing`.

---

#### FB-074: "Menu lg/xl icon-to-text gap too wide, content not left-aligned at xl"

**UX Intent:** The gap between leading icon and text label in Menu items at lg and xl sizes felt disproportionately spacious compared to xs/sm/md. The xl size's content also appeared insufficiently left-aligned due to excessive inline padding.

**Root Cause:** Menu's gap and inline padding were lifted 1:1 from the Button spatial scale. While Button is an isolated interactive element where generous spacing aids tap target clarity, Menu items are dense stacked list items where the same spacing feels excessive in aggregate. The gap-to-icon ratio jumped from a smooth +8% per step (xs→sm→md) to +15% at lg and +12% at xl, breaking the visual curve. Similarly, xl inline padding jumped by 8px (md→lg was +4px, but lg→xl was +8px), pushing content away from the left edge.

**Resolution:**
1. **lg gap**: reduced from 12px (1.5x) to 10px (1.25x) — ratio becomes 45% (smooth step from md's 40%).
2. **xl gap**: reduced from 16px (2x) to 10px (1.25x) — matches lg, per user directive to use lg's gap for xl.
3. **xl inline padding**: reduced from 24px (3x) to 20px (2.5x) — restores the consistent +4px delta (md 12 → lg 16 → xl 20).
4. Updated `--_menu-gap` CSS custom property and `.label` padding for both sizes.

**Corrected progression:**
| Size | Icon | Gap | Gap/Icon | px | px delta |
|------|------|-----|----------|-----|----------|
| xs | 16px | 4px | 25% | 6px | — |
| sm | 18px | 6px | 33% | 8px | +2 |
| md | 20px | 8px | 40% | 12px | +4 |
| lg | 22px | 10px | 45% | 16px | +4 |
| xl | 24px | 10px | 42% | 20px | +4 |

**Design rule — Menu-Specific Gap Ceiling:** Menu items are stacked list rows, not standalone buttons. While Menu shares Button's icon sizes, font sizes, and vertical padding, the icon-to-text gap should scale more conservatively — capped at 10px (1.25x) for lg and xl — because dense vertical repetition amplifies perceived spacing. This is a deliberate departure from Button's gap scale for Menu only.

---

#### FB-075: "Menu item hover state must boost text and icon to max contrast"

**UX Intent:** When a menu item's hover background shifts from white to light gray, the text and icon must compensate by increasing to maximum contrast (pure black in light mode, pure white in dark mode). Without this, hover *decreases* the contrast between content and background — the opposite of what a hover state should do. This is a universal interactive-state principle, not Menu-specific.

**Root Cause:** Menu items in the `neutral` appearance used `var(--portfolio-text-primary)` (maps to `#161616` / neutral-100) for both default and hover states. When hover shifted the background from `#FFFFFF` to `#F9F9F9`, the text-to-background contrast dropped from ~19.5:1 to ~18:1. While technically above WCAG AA, the perceptual effect is that hover makes the text *less* readable rather than *more* prominent. The design system lacked a "max contrast" tier — the darkest text token was `neutral-bold` (`#161616`), with no pure black (`#000000`) option. This was previously identified in NavItem sidebar work (FB-078) but never formalized as a system-wide token or applied to other components.

**Resolution:**
1. Added `$portfolio-text-neutral-max: #000000` and `$portfolio-icon-neutral-max: #000000` to `src/styles/tokens/_colors.scss`.
2. Added `--portfolio-text-neutral-max` and `--portfolio-icon-neutral-max` CSS custom properties to `src/styles/_custom-properties.scss`:
   - Light mode: `#000000`
   - Dark mode: `#FFFFFF`
3. Applied to Menu's `neutral` appearance: hover and active states now set `color: var(--portfolio-text-neutral-max)` on the `.item` and `color: var(--portfolio-icon-neutral-max)` on `.leadingSlot`.
4. Applied to Menu's `always-light` appearance: same treatment with static `#000000` (always-light is theme-invariant).
5. `inverse` and `always-dark` appearances already use max-white text by default — no change needed.

**Design rule — Two-Tier Contrast Model (system-wide):** Text and icon color in interactive components uses a deliberate two-tier system:
- **Default state** → `neutral-bold` (`#161616`, dark gray). This is intentionally *not* pure black. Pure black (#000) on pure white (#FFF) creates a contrast ratio so high it causes visual fatigue during sustained reading. The slightly softened dark gray provides comfortable readability while still far exceeding WCAG AA.
- **Hover/active state** → `neutral-max` (`#000000`, pure black). When the background shifts from white to gray on hover, the contrast gap shrinks. The text must compensate by stepping up to max contrast. This is a *reactive* boost — it fires only when background conditions change, not as a resting state.

The same two-tier logic applies in dark mode: default text is `neutral-bold` (white, `#FFFFFF` / neutral-00), and hover uses `neutral-max` (`#FFFFFF`). In dark mode the two happen to be the same value, so no visual change occurs — which is correct, because the dark-mode hover background is an additive white overlay that already *increases* text-to-background contrast.

This applies to Menu, NavItem, sidebar items, command palettes, and any future list-based interactive component. Never use `neutral-max` as a resting-state text color — it's reserved for interactive states where background context changes.

**Cross-category note:** This pattern was previously identified in NavItem work (FB-078) and Button dark mode audit (FB-072/073 in design-feedback-log) but was never formalized as a reusable token or applied consistently. This entry establishes the token (`neutral-max`) and the two-tier contrast principle as system-wide standards.

---

#### FB-095: "Token Architecture should belong to the application section"

**UX Intent:** Standardize the information architecture across all 6 foundational styles pages in the playground. The "Token Architecture" section on the colors page was positioned at the global level (as a SubsectionTitle h4), but its content explains how semantic token *names* are constructed — an application/use-case concern. The user wanted it scoped inside the semantic zone as a proper SectionTitle (h3), and wanted every foundational styles page to have its own Token Architecture section explaining the naming convention for that token category.

**Root Cause:** The colors page was the only page with a Token Architecture explanation, and it was at the wrong heading level (h4 SubsectionTitle instead of h3 SectionTitle). The other 5 pages (typography, spacing, motion, elevation, breakpoints) had no Token Architecture section at all. Additionally, 3 pages (spacing, elevation, breakpoints) lacked ScrollSpy despite meeting the 4+ sections threshold.

**Resolution:**
1. **Colors page:** Promoted Token Architecture from `SubsectionTitle` (h4) to `SectionTitle` (h3) with `id="token-architecture"`. Added `SectionDescription` explaining the four-part naming formula. Removed redundant `scroll-margin-top` from SCSS (now handled by SectionTitle's own class).
2. **Typography page:** Added Token Architecture as first SectionTitle explaining two-tier naming (semantic mixins vs. primitive tokens). Updated ScrollSpy.
3. **Spacing page:** Added Token Architecture explaining three-tier naming (primitives, layout, utility). Added ScrollSpy with 5 sections. Added `id` attributes to existing SubSections.
4. **Motion page:** Added Token Architecture explaining intent-based naming (duration speed names, easing intent names, choreography presets, interactive mixins). Updated ScrollSpy.
5. **Elevation page:** Added Token Architecture explaining size-scale naming (shadow-sm/md/lg, radius-sm/md/lg). Added ScrollSpy with 4 sections. Added `id` attributes to existing SubSections.
6. **Breakpoints page:** Added Token Architecture explaining SCSS variable naming ($elan-bp-* vs $elan-mq-*). Added ScrollSpy with 6 sections. Added `id` attributes to existing SubSections.
7. **SKILL.md:** Added "Token Page Template" section codifying the standard IA for foundational styles pages. Added MUST DO #8 requiring Token Architecture as the first SectionTitle on every styles page.

**Design rule — Token Page IA Template:** Every foundational styles page must follow: SectionHeading (h2) → Token Architecture as first SectionTitle (h3) → content sections → optional ZoneDivider → reference sections. Token Architecture explains the naming formula and belongs to the application/semantic zone. The colors page is the gold-standard reference. This template is now codified in `.cursor/skills/playground/SKILL.md`.

**Cross-category note:** Also documented as CF-011 (content) — the placement of Token Architecture is both an IA design decision and a content strategy decision about how naming conventions are communicated.

---

#### FB-096: "Light/dark columns and ScrollSpy should appear at medium widths, not just largest"

**UX Intent:** On the playground colors page, the light/dark theme strip columns (side-by-side arrangement) and the ScrollSpy navigation only activated at `$elan-mq-lg` (1440px). At medium viewport widths (1056px–1439px) the sidebar is in hamburger mode, so the content area has the full viewport width — plenty of horizontal space for both features. The user wanted them to activate earlier so that medium-width viewports aren't stuck with stacked panels and no page navigation.

**Root Cause:** Both features used `$elan-mq-lg` (1440px) as their breakpoint. This was likely set conservatively to account for the sidebar at wide widths, but at `md` (1056px) the sidebar is hidden, so the full width is available. The design system ScrollSpy (`src/components/ui/ScrollSpy/`) already used `$elan-mq-md` (1056px) — the playground version was misaligned.

**Resolution:**
1. **ScrollSpy:** Changed `.nav` breakpoint from `$elan-mq-lg` to `$elan-mq-md` in `playground/src/components/scroll-spy.module.scss` — now matches the production design system ScrollSpy.
2. **Colors page:** Changed four media queries from `$elan-mq-lg` to `$elan-mq-md` in `playground/src/app/tokens/colors/colors.module.scss`: `.themeStripContainer`, `.themeStripLight`, `.themeStripDark`, `.interactionStrips`.

**Design rule — Playground responsive breakpoint alignment:** When the playground sidebar is in hamburger/overlay mode (below `lg`), the content area has full viewport width. Features that need horizontal space (side-by-side panels, ScrollSpy) should activate at `$elan-mq-md` (1056px), not `$elan-mq-lg` (1440px). Reserve `lg` breakpoints for features that must coexist with the expanded sidebar.

