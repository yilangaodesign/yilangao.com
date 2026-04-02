# Design Feedback Log

> **What this file is:** Chronological record of recent design feedback sessions (last 30 entries). Newest entries first.
>
> **Who reads this:** AI agents at session start (scan recent entries for context), and during feedback processing (check for recurring patterns).
> **Who writes this:** AI agents after each feedback cycle via the `design-iteration` skill.
> **Last updated:** 2026-04-01 (FB-082: Badge overlay contrast on collapsed NavItem)
>
> **For agent skills:** Read only the first 30 lines of this file (most recent entries) for pattern detection.
> **Older entries:** Synthesized in `docs/design-feedback-synthesis.md`. Raw archive in `docs/design-feedback-log-archive.md`.

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

