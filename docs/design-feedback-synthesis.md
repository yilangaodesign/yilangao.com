# Design Feedback Synthesis — Archived Lessons

> Distilled from 48 archived feedback entries (FB-001 through FB-047).
> Raw entries preserved in `docs/design-feedback-log.md` (lines 620–end).
> Read this file when you need historical context beyond the active 30 entries.
> Last synthesized: 2026-04-01

---

## Theme 1: CSS Architecture — Cascade, Layers, and Theme Directives

**Core lesson:** CSS architecture bugs silently nullify correct styling, making every subsequent visual fix appear to fail. The most dangerous bugs are invisible — correct Tailwind classes that produce no effect because an unlayered reset overrides them, or a theme directive that compiles to hardcoded values instead of CSS variable references. Always check the cascade before adding more padding.

**Key entries:** FB-009, FB-007, FB-039

**Details:**

- **FB-009 (unlayered reset):** `* { margin: 0; padding: 0; }` as unlayered CSS beats all Tailwind utilities in `@layer utilities`. Caused 3 rounds of escalating frustration ("what the fuck") because the agent kept adding more padding classes instead of diagnosing the cascade. **Fix:** Wrap resets in `@layer base`. This was the single most critical bug in the entire design feedback history.
- **FB-007 (@theme inline):** Tailwind v4's `@theme inline` hardcodes literal values at build time. Dark mode CSS variable overrides are silently ignored because utilities don't reference variables. **Fix:** Use `@theme` (not `@theme inline`) so utilities emit `var(--color-*)`.
- **FB-039 (global svg display:block):** Common CSS reset `svg { display: block; max-width: 100%; }` forces ALL SVGs to block-level, including 8×8px inline link arrow icons. Fragments text flow in prose paragraphs. **Fix:** Override `display: inline` on inline icon SVGs; add `white-space: nowrap` on parent `<a>` to prevent icon/text wrapping.

**Not covered by recent entries:** None of these three specific architecture failures have recurred in FB-048–078. The lessons are foundational and preventive — if they're forgotten, the same invisible cascade bugs will return. The `@theme inline` gotcha is Tailwind v4–specific knowledge that has no equivalent in the recent entries.

---

## Theme 2: Sidebar Spatial Geometry & Collapse Transitions

**Core lesson:** A collapsible sidebar is the single most precision-sensitive UI element in the system. Users perceive sub-pixel shifts, 1px asymmetries, and non-square proportions during collapse/expand transitions. The canonical reference must be the tighter state (collapsed), and the expanded state must match it — never the reverse. Every centering calculation must account for border widths.

**Key entries:** FB-002, FB-003, FB-005, FB-011, FB-012, FB-013, FB-014, FB-030, FB-033, FB-034, FB-035

**Details:**

- **Fixed sidebar blocking content (FB-002):** `position: fixed` removes the sidebar from document flow. Tailwind can't generate classes from dynamic strings (`lg:pl-60`). **Fix:** Flex layout with in-flow spacer div that dynamically matches sidebar width.
- **Collapsed-first principle (FB-013):** Five independent spacing differences between collapsed and expanded states caused 15–20px vertical jumps during toggle. **Fix:** Build the collapsed state first as the canonical reference. Match expanded dimensions to collapsed: unified `h-7` tab height, `px-1.5` container padding, `h-5` separator wrapper, `mt-4` section gap.
- **Border-width accounting (FB-033):** `pl-2` (8px) placed icons at 21px from the sidebar left edge, but the true center of the 40px sidebar is 19.5px (accounting for 1px `border-right`). **Fix:** `pl-[7px]` — icon center at 20px, 0.5px from true center (imperceptible).
- **Square icon tabs (FB-035):** Items were 27px wide × 28px tall — 1px off from square. **Fix:** Widened collapsed sidebar from 40px to 41px. Inner width = 28px = `h-7`. Perfect squares.
- **Left-anchoring (FB-030):** Centering icons in collapsed mode (`justify-center`) caused horizontal shift during transition. **Fix:** All collapsed items use `pl-[7px]` (same horizontal position as expanded `px-2`). Icons at 14px from left edge in both states — zero shift.
- **Divider centering (FB-014, FB-034):** Dividers were closer to one section than the other due to additive margins. **Fix:** The separator wrapper height IS the entire gap. `h-6` with `items-center` places the `border-t` at 12px from each adjacent tab.

**Not covered by recent entries:** Recent entries (FB-052, FB-075, FB-078) revisit sidebar topics but focus on header spacing and nav state modeling. The foundational geometry system — collapsed-first principle, border-width centering math, 41px width derivation, separator-as-entire-gap pattern — is not re-taught. These are the load-bearing decisions that all subsequent sidebar work depends on.

---

## Theme 3: B2B Density Posture — The Foundational Design Decision

**Core lesson:** This design system serves a B2B portfolio. Every pixel of whitespace must justify its existence. "Not dense enough" means gutters, margins, and radii are one tier too generous for the target audience. The posture pivoted from consumer-grade to B2B in this period, and the shift touched every spatial decision. Corner radius near-zero (2px), content padding 16–20px, and systematic one-tier tightening are the concrete expressions of this posture.

**Key entries:** FB-004, FB-006, FB-015, FB-036, FB-037, FB-038

**Details:**

- **Spacing baseline (FB-004, FB-006):** Initial spacing used Carbon scale values but at consumer-level generosity. IBM Carbon spacing applied to nav links: `h-8`, `pl-5 pr-2`. Container: `px-3 py-4`.
- **Corner radius pivot (FB-015):** `rounded-md` (6px) and `rounded-lg` (8px) read as "friendly consumer app." For B2B: all `rounded-lg/md` → `rounded-sm` (2px). Only `rounded-full` survives on progress bars (structural shape). This was a 15-file audit across the entire playground.
- **Systematic tightening (FB-037):** After masonry conversion (FB-036), every spacing value was still one tier too generous. Methodical reduction: layout padding 32→24, side padding 48→32, sidebar-content gap 40→32, section gaps 48→32, column gap 16→12, card margin 16→12, footer margin 96→48. Each value dropped exactly one token tier.
- **Unnecessary scrollbar (FB-038):** `overflow-y: auto` on a sidebar whose content fits the viewport shows a useless scrollbar gutter (~15px) that creates asymmetric spacing. **Fix:** Remove `overflow-y: auto` and `max-height` when content fits naturally.

**Not covered by recent entries:** The foundational consumer→B2B pivot and corner radius philosophy are not re-stated in FB-048–078. Recent entries assume the B2B posture but don't re-derive it. The systematic one-tier tightening methodology is also unique — later spacing feedback is about individual adjustments, not systematic audit.

---

## Theme 4: Information Architecture as Editorial Curation

**Core lesson:** A design system's navigation taxonomy is its first impression. Categorize components by the design job they serve ("What am I trying to accomplish?"), not by technical ancestry ("What kind of component is this?"). A catch-all "UI Primitives" bucket with 15 items signals an uncurated system. Names in the same visual column must not share roots ("Foundational" and "Foundations" is a collision). Section headers are organizational labels that must recede — small, muted, uppercase — so interactive links stand out.

**Key entries:** FB-008, FB-019, FB-032, FB-034

**Details:**

- **Taxonomy rewrite (FB-019):** "UI Primitives" → 9 task-oriented categories: Foundational, Forms & Controls, Feedback & Overlay, Navigation & Menus, Data Display, Layout & Shell, Content & Media, Entrance & Reveal, Interaction. Each category answers "what design problem am I solving?"
- **Foundations section (FB-032):** Overview and Styles are both "what the system IS" (identity tier), distinct from components ("what the system BUILDS"). Grouped under "Foundations" with section dividers separating tiers. Added direct-link category model (categories with `href` instead of flyout).
- **Naming collision (FB-034):** "Foundational" category under "Foundations" section shares the "found-" root. Renamed to "Base."
- **Section header treatment (FB-008):** Headers at `text-[9px]`, `tracking-[0.12em]`, `uppercase`, 50% opacity. Interactive links indented under them at `pl-5`.

**Not covered by recent entries:** The task-oriented taxonomy philosophy and naming collision avoidance principle are not re-taught. FB-075 (nav state model) assumes the taxonomy exists but doesn't revisit how it was derived. The editorial curation perspective — "a directory listing is not a design opinion" — is a one-time foundational insight.

---

## Theme 5: Overlay Architecture — Stacking Contexts, Portals, and State Coherence

**Core lesson:** Any CSS `transform` property — even an identity transform like `translate-x-0` — creates a new stacking context and containing block. `position: fixed` elements inside a transformed ancestor are positioned relative to that ancestor, not the viewport. The only escape is `createPortal(…, document.body)`. Additionally, transient UI state (open flyouts, search queries) must reset when layout state changes (sidebar collapse/expand), and the same affordance appearing in two spatial contexts must be visually identical.

**Key entries:** FB-020, FB-021, FB-022, FB-023

**Details:**

- **Interaction proximity (FB-020):** Search response should appear adjacent to the trigger (Fitts's Law) without displacing navigation (spatial stability). Floating panel next to collapsed sidebar, inline dropdown in expanded mode.
- **Visual identity across contexts (FB-021):** Collapsed flyout used `h-9 text-[13px]`, expanded inline used `h-7 text-[12px]`. Different sizes signal "two controls" not "one control in two places." **Fix:** Unified to `h-7 text-[12px]` in both contexts.
- **State coherence (FB-022):** Flyout persisted into expanded mode as a visual duplicate. **Fix:** `useEffect` watching `collapsed` prop resets `open` and `query` on any mode change.
- **Stacking context escape (FB-023):** Sidebar Tailwind transition classes applied `transform`, trapping the `position: fixed` flyout inside the sidebar's bounds. Combined with `overflow-hidden`, the flyout was clipped and invisible. **Fix:** `createPortal(…, document.body)` with separate `flyoutRef` for click-away detection.

**Not covered by recent entries:** The stacking context trap (CSS transform + fixed positioning) and portal escape pattern are not re-encountered in FB-048–078. These are architectural lessons about CSS rendering that remain relevant whenever flyouts or overlays are used near animated containers. The state coherence principle (transient state resets on mode transitions) is also unique to this session.

---

## Theme 6: Pointer Interaction Design — Dead Zones, Closest-Element Mapping, and Threshold Models

**Core lesson:** Interactive scrub/scroll controls need three things: (1) a dead zone to discriminate click intent from drag intent (3px threshold), (2) closest-element pointer mapping instead of linear interpolation (linear interpolation breaks when padding/centering shifts element positions), and (3) a threshold model for when to add navigation aids (both 3+ viewport heights AND 5+ named sections must be true).

**Key entries:** FB-017, FB-018, FB-024

**Details:**

- **Dead zone pattern (FB-017):** `onPointerDown` records start position. `onPointerMove` only enters drag mode after 3px of movement. If no drag activated, `endInteraction` treats it as a click and smooth-scrolls to the target.
- **Closest-element mapping (FB-017, FB-018):** Linear interpolation `(clientY - trackTop) / trackHeight * (count - 1)` fails when padding, gaps, or centering shift tick positions. With `py-6 justify-center`, clicking tick 0 (at ~30% from top) returned index 1. **Fix:** Each notch has `data-notch-index`. `indexFromPointer` iterates all notches, computes distance from cursor to each center, returns the closest. Always correct regardless of layout.
- **ScrollSpy threshold model (FB-024):** ScrollSpy warranted when BOTH conditions met: (a) 3+ viewport heights of rendered content, (b) 5+ distinct named sections. Long but monotonic pages (200 color swatches, no sections) don't need it. Structured but short pages don't need it. Only deep AND structured pages qualify.

**Not covered by recent entries:** The dead zone and closest-element patterns are foundational interaction design patterns not re-encountered in FB-048–078. The threshold model for ScrollSpy placement is a decision framework that prevents unnecessary UI complexity — it's referenced indirectly but never re-derived.

---

## Theme 7: CMS Inline Edit Panel — Building a Complete Product

**Core lesson:** An edit panel is not a debug tool — it's a product the user interacts with under pressure (unsaved work at risk). It needs: persistent labels above inputs (not just placeholders), field type differentiation (URL fields look like URL fields), pinned action bars (Save must never scroll off-screen), drag-and-drop for list reordering, full-bar error states (not subtle inline text), minimum dimension constraints, required field indicators with deferred validation, and a footer that contains only unique content.

**Key entries:** FB-040, FB-041a, FB-041b, FB-042, FB-043, FB-044, FB-045, FB-047

**Details:**

- **Form design basics (FB-040):** Inputs had no persistent labels (placeholders only), no field type differentiation (URL looked like text), no inline help text. **Fix:** `<label>` above every input, `type="url"` where appropriate, fields ordered by cognitive priority.
- **Pinned action bar (FB-041a):** Panel used `overflow-y: auto` on the entire container, scrolling Save off-screen. **Fix:** Flex column layout — header (`flex-shrink: 0`) → body (`flex: 1; overflow-y: auto`) → footer (`flex-shrink: 0`). Only the item list scrolls.
- **Drag-and-drop (FB-041b):** Arrow buttons for reordering require N-1 clicks. **Fix:** Native HTML5 DnD with 6-dot grip handle. During drag, all items collapse to single-line summaries for easy drop targeting.
- **Error banner (FB-042):** Error was 12px red text competing with buttons. **Fix:** Full-bar state change — background turns deep red (#991b1b), error replaces count text, buttons adapt colors. The entire bar transforms to signal danger.
- **Minimum dimensions (FB-043):** Panels must have `min-height: min(400px, 60vh)` and `min-width: 320px`. The `min()` function respects small viewports while providing a usable floor.
- **Required fields (FB-044):** Red asterisk after label, inline validation after first save attempt (deferred — no premature nagging), disabled Save when errors exist, auto-recovery as user fills fields.
- **Footer minimalism (FB-047):** Footer had duplicate navigation links already in the sidebar, version metadata, and 48px padding. **Fix:** Single horizontal row with only unique content (CTA text + email). Height reduced from ~300px to ~60px.

**Not covered by recent entries:** The pinned action bar pattern (flex column with scrolling body only), drag-and-drop replacing arrow buttons, full-bar error state transformation, and deferred validation pattern are not revisited in FB-048–078. Recent entries (FB-058, FB-062) touch modal forms but focus on field descriptions and dimension templates, not the interaction patterns established here. The complete edit panel product UX was built in this archived period.

---

## Theme 8: Token-First Design & Three-Tier Spacing Architecture

**Core lesson:** Every style value must be expressible as a token. Inline styles bypass theming, auditing, and responsive design. Spacing tokens should use a three-tier architecture: primitives (multiplier-based, `spacer-Nx`, for arithmetic verification), layout semantics (density names like `compact`/`spacious`, for intent), and utility (component internals like button padding). Token names must be self-documenting for AI agent parseability — an agent should derive the pixel value from a primitive name via arithmetic and infer layout intent from a layout name without a lookup table.

**Key entries:** FB-010, plus archived FB-055, FB-056

**Details:**

- **Foundational mandate (FB-010):** All `style={{ width }}` replaced with Tailwind arbitrary classes (`w-[200px]`). Inline styles are banned.
- **Three-tier migration (archived FB-055):** Replaced Carbon's indexed convention (`spacing-01..13`) with One GS multiplier naming: `$portfolio-spacer-Nx` (primitives), `$portfolio-spacer-layout-{density}` (layout), `$portfolio-spacer-utility-Nx` (component). Agent analysis: multiplier names win for primitives (value derivable from name), semantic names win for layout (intent derivable), indexed names lose on both axes.
- **Button token compliance (archived FB-056):** Button dimensions must snap to token grid. When a design adjustment lands between token stops, snap to nearest or propose a new Tier 3 utility token — never leave an orphan pixel value. `var()` reference is proof of compliance; `[Npx]` is a violation.

**Not covered by recent entries:** FB-060 (spacing audit) in the active section extends this work but doesn't re-derive the three-tier architecture or the AI-parseability rationale. The foundational "never inline" mandate (FB-010) and the One GS naming philosophy are not re-taught.

---

## Theme 9: Color System — Palette-as-Toolkit, Semantic Naming, and Accessibility

**Core lesson:** The color palette is a toolkit, not a mandate — having a color doesn't mean using it. The UI is neutral-dominant. The palette expanded from minimal grays to 90+ chromatic values (from IBM Carbon v11) so future use cases (data viz, status indicators, tags) have pre-vetted accessible colors ready. Token naming follows a three-part formula (`property·role·emphasis`) from Goldman Sachs One GS. The brand accent uses the "Lumen" blue-violet scale with corrected perceptual uniformity. Any accent step used as foreground text must achieve 4.5:1 WCAG AA contrast.

**Key entries:** FB-016, archived FB-020 (color restructure), FB-021 (Lumen accent), FB-022 (accessibility)

**Details:**

- **Palette expansion (FB-016):** 9 chromatic families, 90 new values from `@carbon/colors` v11. Expanded semantic tokens (text-helper, text-error, text-on-color, border-disabled, focus, highlight). Philosophy: palette-as-toolkit, neutral-dominant posture.
- **Semantic naming (archived FB-020):** Flat naming (`text-primary`, `surface-inverse`) → structured `{property}·{role}·{emphasis}`. Properties: text, surface, border, icon, action. Emphasis ladder: bold/regular/subtle/minimal. Legacy aliases preserved.
- **Brand accent (archived FB-021):** Lumen scale from Cadence project — corrected hue interpolation at step 50. Key value: #3336FF at step 60.
- **Accessibility policy (archived FB-022):** `--color-accent` changed from accent-50 (#7182FD, 3.33:1 — fails) to accent-60 (#3336FF, 6.75:1 — passes). Rule: any accent step used as foreground text must achieve 4.5:1 against its background.

**Not covered by recent entries:** Recent entries (FB-072–077) extend accessibility work to dark-mode button contrast and brightness inversion rules but don't re-derive the palette philosophy, the Lumen origin story, or the property·role·emphasis naming architecture. The palette-as-toolkit principle and the One GS naming comparison are unique to the archived period.

---

## Theme 10: Playground as User-Facing Product, Not Maintainer Tool

**Core lesson:** Every piece of information in a design system playground must pass a user-centric filter: "Does the audience (designers, developers) need to see this?" Legacy token names, inconsistent swatch sizes, and migration artifacts answer questions only the maintainer cares about. Historical names belong in changelogs and git history, not the product surface. Swatch sizing must be intrinsic (`w-12 h-12`), never grid-derived, to guarantee cross-section parity.

**Key entries:** FB-025, FB-026, FB-027, FB-028, archived FB-057, FB-058

**Details:**

- **Swatch consistency (FB-025):** Three different swatch heights (80px, 56px, 40px) across the same page. **Fix:** All swatches standardized to `h-14`. Single `ColorSwatch` component used everywhere.
- **Legacy noise (FB-026):** `showLegacy` prop displayed "was: {old-name}" beneath swatches. **Fix:** Removed from UI. Legacy mapping preserved in `tokens.ts` for programmatic use only.
- **Version metadata (FB-027, FB-028):** Version was in the sidebar (persistent nav) AND page footer — competing sources. **Fix:** Consolidated to page-level footnote only. Localhost shows "Local Dev" qualifier. Nav is reserved for navigation.
- **Intrinsic swatch sizing (archived FB-057, FB-058):** `aspect-square` + `w-full` made swatch size grid-dependent (145px in 6-col, 78px in 12-col). **Fix:** Fixed `w-12 h-12` (48px×48px). `flex flex-wrap gap-1.5` containers — item count and container width cannot influence swatch dimensions.

**Not covered by recent entries:** FB-066 (focus ring clipping) in recent entries extends swatch interaction but doesn't revisit the user-centric information filter or intrinsic sizing decision. The "maintainer vs. audience" lens — the meta-principle that governs what belongs in the playground UI — is a one-time foundational insight from this period.

---

## Theme 11: Homepage Grid, Masonry Architecture, and Cross-Page Layout Consistency

**Core lesson:** The homepage optimizes for breadth scanning (Pinterest-like density) using masonry layout. CSS `column-count` fills top-to-bottom per column, making intuitive row ordering impossible — use JS round-robin column distribution instead. Case study pages must share the homepage's split-view layout paradigm (300px sidebar + flex-1 content) for navigation continuity. Drag-and-drop for tile reordering must use the entire tile as the drag target, not a small handle icon. The handle is a visual hint; the hit area covers the full surface.

**Key entries:** FB-036, archived FB-044 (mobile), FB-046 (case study nav), FB-047 (hero), FB-052 (masonry), FB-053 (DnD), FB-054 (drag handle)

**Details:**

- **Masonry conversion (FB-036):** Replaced CSS Grid with CSS columns for waterfall layout. Featured/regular differentiation via aspect ratio (4:3 vs 3:2). Top padding reduced 96→32px.
- **JS round-robin (archived FB-052):** CSS `column-count` distributes items top-to-bottom, making row/column positioning unintuitive. **Fix:** JS distributes items `index % columnCount` into flex columns within a CSS Grid shell — left-to-right row ordering.
- **Split-view paradigm (archived FB-046):** Case study pages used a different layout (full-width hero + centered container) than the homepage (split-view). Created navigation inconsistency. **Fix:** Restructured case study into matching split-view: 300px sticky sidebar (metadata) + flex-1 content.
- **Drag-and-drop (archived FB-053, FB-054):** `@dnd-kit` with `rectSortingStrategy`. During reorder mode, tiles switch to flat CSS grid (not masonry) for unambiguous left-to-right ordering. Drag handle alone was insufficient — users expected to grab the whole tile. **Fix:** Entire tile is drag target with `cursor: grab/grabbing`, inner content gets `pointer-events: none` during reorder.
- **Mobile density (archived FB-044):** Sidebar sections had 32px gaps on mobile. Teams + Links rendered stacked instead of side-by-side. **Fix:** 2-column grid for Teams+Links, reduced mobile gaps, trimmed nav links to essential only.
- **Hero-first (archived FB-047):** Case study must lead with a hero screenshot (16:9 aspect ratio) — time-to-value in under 2 seconds before any text is read.
- **Safe triangle (archived FB-045):** Hover-to-reveal sliver had "whack-a-mole" problem — diagonal mouse path crossed adjacent categories. **Fix:** `useSafeTriangle` hook implementing Amazon's slope-based path prediction. Tracks last 4 mouse positions, defers category switch by 100ms when slopes indicate cursor heading toward the sliver.

**Not covered by recent entries:** The JS round-robin vs CSS column-count architectural decision, the cross-page split-view paradigm, the safe triangle hover pattern, the whole-tile drag target principle, and the hero-first case study structure are all unique to this period. Recent entries work within these established patterns but don't re-derive them.

---

## Theme 12: Navigation Fluidity & Cross-Panel Alignment

**Core lesson:** Navigation exploration should feel conversational (hover to reveal, leave to dismiss), not transactional (click to open, click to close). When two adjacent elements share a hover zone, a 200ms timer on `mouseLeave` with `cancelClose` on `mouseEnter` prevents accidental dismissal during mouse transit. Non-category elements must explicitly close the sliver — `mouseEnter`/`mouseLeave` on the aside alone is insufficient because moving between children doesn't trigger `mouseLeave`. Horizontal bands across adjacent panels must use explicit shared heights (e.g., `h-11`) rather than implicit padding-derived heights.

**Key entries:** FB-031 (hover-to-reveal), FB-029 (footer height alignment)

**Details:**

- **Hover-to-reveal sliver (FB-031):** Replaced `onClick` with `onMouseEnter` on category buttons. Replaced backdrop overlay with timer-based hover zone. Added slide animation (`translate-x-0` ↔ `-translate-x-full` at 200ms). Non-category elements (header, Overview, search, Archive) close the sliver on hover.
- **Timer handoff (FB-031):** `onMouseLeave` on sidebar/sliver starts 200ms close timer. `onMouseEnter` on either element cancels it. Grace period handles quick mouse passes and the gap between sidebar edge and sliver edge.
- **Explicit band heights (FB-029):** Sidebar archive section was ~44px (implicit), page footer was ~40px (implicit). 4px mismatch at the bottom edge. **Fix:** Both sections get explicit `h-11` (44px) with `flex items-center`.

**Not covered by recent entries:** The hover-to-reveal interaction model, timer handoff pattern, and non-category explicit close handlers are not re-taught in FB-048–078. The cross-panel explicit height principle is also unique — recent entries don't encounter this specific misalignment class.

---

## Repetitive Issues (Escalation History)

### 1. Spacing / Padding / Breathing Room — 13+ occurrences

**Pattern:** FB-004, FB-006, FB-009 (×3), FB-013, FB-014, FB-015, FB-034, FB-037, FB-038, FB-043, FB-045

**What finally fixed it:** FB-009 revealed the root cause — an unlayered CSS reset (`* { margin: 0; padding: 0; }`) was overriding all Tailwind utilities. Before this diagnosis, every spacing complaint was treated as "not enough padding" when the real problem was "padding is being silently removed." After the cascade fix, spacing complaints became token-level adjustments (tighten this gap one tier) rather than architectural crises. **The meta-lesson:** when the same category of problem persists across 3+ exchanges, the agent is treating symptoms instead of diagnosing the root cause.

### 2. Centering / Symmetry — 4+ occurrences

**Pattern:** FB-005, FB-033, FB-034, FB-035 (continued in FB-053 in the active period)

**What finally fixed it:** The centering math was never wrong in concept — it was wrong in input. Each failure missed a different geometric detail: border-width eating available space (FB-033), padding asymmetry (FB-034), or non-square proportions (FB-035). The recurring fix was to account for ALL box model contributions (border, padding, content) before computing center. The `pl-[7px]` rule and 41px sidebar width are the surviving artifacts. **Escalation note:** This pattern crossed from archived into active entries (FB-053 — ScrollSpy label alignment), indicating the lesson hadn't been fully generalized to non-sidebar contexts until Framer Motion's transform override was discovered.

### 3. Sidebar Collapse Transition — 5+ occurrences

**Pattern:** FB-003, FB-005, FB-013, FB-030, FB-033 (continued in FB-052, FB-075 in active)

**What finally fixed it:** The collapsed-first principle (FB-013): build the collapsed state as the canonical reference, then match expanded to it. Combined with left-anchoring (FB-030): icons at fixed horizontal position in both states, sidebar width shrinks from the right. These two principles eliminated the class of "tabs jump during transition" bugs.

### 4. Search Flyout Positioning — 4 occurrences in one session

**Pattern:** FB-020, FB-021, FB-022, FB-023

**What finally fixed it:** Each fix addressed a symptom without addressing the system:
- FB-020: Created the flyout (proximity issue solved)
- FB-021: Fixed visual sizing (identity issue solved)
- FB-022: Fixed state persistence (coherence issue solved)
- FB-023: Fixed stacking context (rendering issue solved)
The escalation confirmed §7.1: diagnose architecturally before patching visually. The portal escape (FB-023) should have been identified first — it would have prevented the clipping that masked FB-021's fix.

### 5. Panel/Modal Minimum Dimensions — 3+ occurrences

**Pattern:** FB-043, FB-045, and FB-062 (active section — 3rd violation of AP-027)

**What finally fixed it:** A standard dimension template documented as AP-027: `min-height: min(420–520px, 65–70vh)`, `max-height: 88vh`, `min-width: 320px`, `width: min(Npx, 90–92vw)`. The template exists in docs but was not consulted during creation of the ProjectEditModal (FB-062), confirming that documentation alone doesn't prevent recurrence — the template must be part of the component creation workflow.

### 6. Color Swatch Inconsistency — 3 occurrences

**Pattern:** FB-025, archived FB-057, archived FB-058

**What finally fixed it:** FB-025 standardized height but left size grid-dependent. FB-057 made swatches square but still grid-dependent. FB-058 finally fixed it with intrinsic sizing (`w-12 h-12`) in `flex flex-wrap` containers — size is now independent of grid column count. **The meta-lesson:** each fix was correct for its scope but incomplete for the full system. Size consistency requires decoupling from the layout container entirely.

---

## Lessons Not Covered by Recent Entries

These principles from the archived period have not been re-learned in FB-048–078. They represent foundational decisions or edge-case discoveries that are still worth remembering.

### Foundational Decisions (load-bearing, not to be revisited without cause)

1. **`@layer base` for CSS resets (FB-009):** The single most impactful design system bug — unlayered resets silently override all Tailwind utilities. This hasn't recurred because the fix is structural, but if a new global stylesheet is added without `@layer base`, the same invisible failure will return.

2. **`@theme` not `@theme inline` (FB-007):** Tailwind v4–specific. `@theme inline` kills dark mode by hardcoding values. This is a one-line configuration difference with catastrophic consequences.

3. **Collapsed-first sidebar principle (FB-013):** The tighter state is the canonical reference. Expanded matches collapsed, never the reverse. All sidebar geometry (41px width, `pl-[7px]`, `h-7` tabs, `h-6` separators) derives from this.

4. **B2B corner radius: 2px (FB-015):** A codebase-wide audit replaced all `rounded-md/lg` with `rounded-sm`. The rationale (consumer vs. B2B signal) hasn't been challenged and shouldn't be without a deliberate posture change.

5. **Palette-as-toolkit (FB-016):** 90+ chromatic colors exist for future use cases. The current UI is neutral-dominant. Having a color doesn't mean using it.

6. **Property·role·emphasis naming (archived FB-020):** Self-documenting token names for AI agent consumption. This naming architecture predates the recent token audit (FB-060) and underpins it.

### Edge Cases and One-Off Discoveries

7. **Global `svg { display: block }` breaks inline icons (FB-039):** A common modern CSS reset pattern that silently fragments text flow when SVGs are used as inline link decorations. Override with `display: inline` on icon SVGs.

8. **CSS `transform` creates containing blocks (FB-023):** Even identity transforms (`translate-x-0`) trap `position: fixed` descendants. The only escape is `createPortal(…, document.body)`. This applies to any flyout or overlay near an animated container.

9. **Closest-element pointer mapping (FB-018):** Linear interpolation for pointer-to-index mapping is fundamentally broken when padding, gaps, or centering shift element positions. Always use `data-*` attributes and compute distance to each element's center.

10. **ScrollSpy threshold model (FB-024):** Add ScrollSpy only when BOTH conditions are true: 3+ viewport heights AND 5+ named sections. This prevents unnecessary complexity on short or monotonic pages.

11. **Safe triangle hover pattern (archived FB-045):** Amazon's slope-based path prediction for hover menus. The `useSafeTriangle` hook tracks 4 mouse positions and defers category switches when the cursor is heading toward the open sliver. Without this, diagonal mouse paths trigger rapid unwanted menu switches.

12. **Timer handoff between adjacent hover zones (FB-031):** 200ms `mouseLeave` timer with `cancelClose` on `mouseEnter`. Non-category sidebar elements must explicitly close the sliver because moving between children inside `<aside>` doesn't trigger the aside's `mouseLeave`.

13. **Deferred validation (FB-044):** Required field errors appear only after the first save attempt (`showValidation` state), not on panel open. This prevents premature nagging during initial data entry while still providing clear feedback when the user attempts to save.

14. **JS round-robin vs CSS column-count (archived FB-052):** CSS `column-count` fills top-to-bottom per column, making row-based ordering unintuitive. For masonry grids that need predictable ordering, distribute items `index % columnCount` into flex columns within a CSS Grid shell.

15. **Whole-tile drag target (archived FB-054):** The drag handle is a visual indicator ("this is draggable"), but the hit area for initiating drag must cover the full tile surface. Inner content gets `pointer-events: none` during reorder mode.
