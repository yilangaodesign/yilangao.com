# Design Anti-Patterns

> **What this file is:** A catalog of mistakes that caused user frustration, documented so they are never repeated. Each anti-pattern includes the trigger, why it's wrong, and the correct alternative.
>
> **Who reads this:** AI agents before making UI changes — scan for relevant anti-patterns.
> **Who writes this:** AI agents when a feedback cycle reveals a new anti-pattern.
> **Last updated:** 2026-04-02 (AP-052: Typography mixin color clobbering on-color text)

---

## Category Index

| Category | Entries | Count | Active |
|----------|---------|------:|-------:|
| CSS Cascade & Build | AP-001, AP-002, AP-003, AP-008, AP-021, AP-038 | 6 | 6 |
| Spacing & Layout | AP-004, AP-005, AP-006, AP-007, AP-009, AP-018, AP-020, AP-027, AP-045, AP-048† | 10 | 10 |
| Positioning & Transforms | AP-013, AP-031, AP-033 | 3 | 3 |
| Theming & Dark Mode | AP-042, AP-043, AP-044, AP-047 | 4 | 4 |
| Interaction & Pointer Behavior | AP-011, AP-012, AP-022, AP-025, AP-035 | 5 | 5 |
| Navigation & Menus | AP-014, AP-015, AP-016, AP-029, AP-046, AP-049 | 6 | 6 |
| Visual Hierarchy & Affordances | AP-010, AP-017, AP-019, AP-026, AP-030, AP-032, AP-039, AP-040, AP-041, AP-048‡, AP-050, AP-051, AP-052 | 13 | 13 |
| Form & Input UX | AP-023, AP-024, AP-028, AP-036 | 4 | 4 |
| Admin UI Patterns | AP-034, AP-037 | 2 | 2 |
| **Total** | | **53** | **53** |

> **†** AP-048 "Independent Padding Decisions Across Adjacent Panels" (spacing entry)
> **‡** AP-048 "Incremental State-by-State Implementation Without a Holistic Model" (state modeling entry)
> **Note:** AP-048 is a duplicate ID — two distinct anti-patterns share the same number.

---

## AP-001: Unlayered CSS Reset with Tailwind v4

**Status: ACTIVE**

**Trigger:** `* { margin: 0; padding: 0; }` placed outside any `@layer`.

**Why it's wrong:** Tailwind v4 generates utilities inside `@layer utilities`. In the CSS cascade, unlayered styles always beat layered styles. This silently zeroes out every spacing utility — `p-8`, `m-4`, `gap-3` all produce zero visible effect. The classes are present in the DOM, DevTools shows them, but they have no visual impact.

**Correct alternative:**
```css
@layer base {
  * { margin: 0; padding: 0; box-sizing: border-box; }
}
```

**Frustration caused:** 3 rounds of escalating user anger. The assistant kept adding more padding classes instead of diagnosing the cascade override.

---

## AP-002: @theme inline for Themeable Values

**Status: ACTIVE**

**Trigger:** Using `@theme inline { --color-background: #fff; }` in Tailwind v4.

**Why it's wrong:** `inline` hardcodes literal color values into utility classes at build time. `bg-background` compiles to `background-color: #ffffff` instead of `background-color: var(--color-background)`. This means `.dark` class CSS variable overrides have zero effect — dark mode is completely broken.

**Correct alternative:** Use `@theme` (without `inline`). This emits `var()` references that respond to runtime class changes.

**Frustration caused:** 2 rounds — user saw white backgrounds in dark mode, sidebar not changing theme.

---

## AP-003: Inline Styles as Workarounds

**Status: ACTIVE**

**Trigger:** Using `style={{ padding: 40 }}` or `style={{ width: someVar }}` when Tailwind classes aren't working.

**Why it's wrong:** Inline styles bypass the design token system. They can't be themed, can't respond to breakpoints, can't be audited, and signal that the framework integration is broken. Using them is treating symptoms instead of diagnosing the root cause.

**Correct alternative:** Fix the root cause (usually a cascade issue). For dynamic values, use Tailwind arbitrary value classes (`w-[200px]`) or CSS custom properties.

---

## AP-004: Fixed Sidebar with padding-left Offset

**Status: ACTIVE**

**Trigger:** Using `position: fixed` on a sidebar and adding `pl-60` or `padding-left` to the content wrapper to prevent overlap.

**Why it's wrong:** The fixed sidebar is removed from document flow. The padding approach is fragile — it depends on the exact sidebar width, breaks when the sidebar is collapsible (dynamic width), and fails if Tailwind can't generate classes from dynamically constructed strings.

**Correct alternative:** Flexbox layout with the sidebar still `fixed`, but an **in-flow spacer div** (same dynamic width class, `hidden lg:block`) that reserves space in the flex flow. Content uses `flex-1 min-w-0`.

---

## AP-005: Centering with w-N mx-auto Inside Padded Containers

**Status: ACTIVE**

**Trigger:** Using `w-10 mx-auto` on an element inside a container that also has horizontal padding.

**Why it's wrong:** `margin: auto` distributes remaining space. If the container is only 40px wide and has `px-1.5` (3px each side), the available width is 34px. A `w-10` (40px) element overflows — `mx-auto` has no space to distribute. The element appears left-aligned.

**Correct alternative:** Make the element full-width and use `justify-center` (flex) to center its children. The icon centers naturally regardless of container math.

---

## AP-006: Truncated Dividers in Compact Layouts

**Status: ACTIVE**

**Trigger:** Using `w-4 mx-auto` on a horizontal divider in a collapsed sidebar.

**Why it's wrong:** A divider that doesn't span its container looks like a rendering artifact, not an intentional design element. Users interpret it as broken.

**Correct alternative:** Plain `border-t` with no width constraint — let it stretch to fill the container.

---

## AP-007: Excessive Content Padding for B2B Interfaces

**Status: ACTIVE**

**Trigger:** Using `p-8` (32px) or larger as base content padding in a tool/dashboard UI.

**Why it's wrong:** 32–40px content gutters are appropriate for consumer landing pages where whitespace conveys luxury. In B2B tools, they waste screen real estate and make the interface feel empty rather than efficient. Designers working in data-dense environments expect tight, purposeful spacing.

**Correct alternative:** Use `px-4 py-4` (16px) as the base, scaling to `px-5 py-5` (20px) at `lg`. This is dense enough for professional use without feeling cramped. See `design.md` §1.1.

**Note:** This supersedes earlier guidance that mandated 32px minimum. That was appropriate before the B2B design posture was established.

---

## AP-008: Treating Symptoms Instead of Diagnosing Root Causes

**Status: ACTIVE**

**Trigger:** User says "there's no spacing." Response: add more `p-*` classes to more elements. User says "still no spacing." Response: add even bigger values.

**Why it's wrong:** If multiple correct Tailwind classes produce no visible effect, the problem is architectural — a cascade override, a build issue, or a framework misconfiguration. Adding more of the same classes will never fix a systemic override.

**Correct alternative:** When spacing classes don't render, immediately check:
1. CSS cascade layers — is there an unlayered reset?
2. Build output — are the utilities being generated?
3. DevTools computed styles — what's actually being applied?
4. Theme directive — is `@theme inline` preventing variable resolution?

---

## AP-009: Inconsistent Spacing Between Toggle States

**Status: ACTIVE**

**Trigger:** A collapsible component (sidebar, accordion, drawer) uses different vertical or horizontal spacing values in its collapsed vs expanded states — e.g., `h-7` tabs when collapsed but `h-8` when expanded, or `mt-4` section gaps when collapsed but `mt-5` when expanded.

**Why it's wrong:** When the user toggles between states, the differing box models cause child elements to visibly shift position. Even with a smooth width transition, the vertical jump is jarring — tabs appear to bounce up or down. Users perceive this as a layout bug rather than a design choice. The root issue is that the two states were styled independently rather than derived from a single canonical spacing model.

**Correct alternative:** Adopt **collapsed-first spacing** — use the collapsed state's values as the canonical reference for all shared vertical dimensions (tab height, section gap, separator height, container vertical padding). The expanded state changes only the horizontal axis (width, padding, label visibility). Shared vertical elements must use a fixed-height wrapper so the same box model is rendered regardless of internal content (e.g., a `h-5` wrapper that contains either a `border-t` or a section label).

**Frustration caused:** User explicitly noted tabs jumping up and down on toggle, and requested the collapsed view as the authoritative spacing reference.

---

## AP-010: Consumer-Grade Corner Radius in B2B

**Status: ACTIVE**

**Trigger:** Using `rounded-md` (6px), `rounded-lg` (8px), `rounded-xl` (12px), or `rounded-2xl` (16px) on any element in a B2B product.

**Why it's wrong:** Large corner radii communicate friendliness and approachability — the visual language of consumer apps (iOS, social media, SaaS marketing pages). In a professional tool, they look out of place, softening edges that should feel precise and utilitarian. The larger the radius, the more it signals "casual" rather than "serious."

**Correct alternative:** Default to `rounded-sm` (2px) for everything. Use `rounded-none` (0px) for tables and full-bleed containers. Reserve `rounded-full` strictly for progress bars, pills, and avatars. Never exceed 4px (`rounded`) and even that should be rare. See `design.md` §8 for the full scale.

**Frustration caused:** User explicitly stated corner radius is "a little too much" and wants 0px to a few pixels as the standard range.

---

## AP-011: Linear Interpolation for Pointer-to-Element Mapping

**Status: ACTIVE**

**Trigger:** Using `Math.round((cursorY - containerTop) / containerHeight * (count - 1))` to determine which discrete element (tick, tab, item) the cursor is pointing at.

**Why it's wrong:** This formula assumes elements are evenly distributed from the very top to the very bottom of the container. In practice, containers have padding, centering (`justify-center`), variable gaps, and elements of different sizes. The mathematical zones diverge from the visual positions, causing the wrong element to be selected. Clicking directly on tick 0 might return index 1 because the tick's visual center doesn't align with the top of the interpolation range. The mismatch feels random to the user — they click exactly on a target and get the wrong result.

**Correct alternative:** Query all target elements by a data attribute (e.g., `[data-notch-index]`), compute the distance from the cursor to each element's bounding rect center, and return the closest match. This is always correct regardless of padding, centering, or gap configuration. The cost of iterating N elements (where N is typically < 20) is negligible.

**Incident:** FB-017, FB-018 (2026-03-29) — ScrollSpy clicks mapped to wrong sections; drag required excessive movement to switch notches.

---

## AP-012: Entering Drag Mode on Pointer Down

**Status: ACTIVE**

**Trigger:** Calling `setDragActive(true)` or equivalent inside the `onPointerDown` handler of a component that supports both click and drag.

**Why it's wrong:** If every `pointerdown` immediately starts a drag, there is no way to perform a click. `e.preventDefault()` on `pointerdown` suppresses the browser-generated `click` event (because it prevents compatibility mouse events). The component becomes drag-only — tapping a target does nothing, or worse, triggers a drag to the current position with `instant` scroll behavior and drag visual feedback, which feels janky for what should be a simple navigation tap.

**Correct alternative:** Use a dead zone pattern:
1. `pointerdown`: Record the start position in a ref. Do NOT activate drag.
2. `pointermove`: If movement exceeds a small threshold (3px), THEN enter drag mode.
3. `pointerup`: If drag was never activated, treat as a click (smooth-scroll to the target determined at pointer-down time).

This cleanly separates two intents: "I want to go to this specific section" (click) vs. "I want to scrub through sections" (drag).

**Incident:** FB-017 (2026-03-29) — ScrollSpy click-to-navigate impossible because every tap started a drag.

---

## AP-013: Fixed Positioning Inside Transformed Containers

**Status: ACTIVE**

**Trigger:** Using `position: fixed` on a flyout, modal, or overlay that is a DOM child of an element with any CSS `transform` property — including identity transforms like `translateX(0)` from Tailwind animation classes (`translate-x-0`, `translate-x-full`, etc.).

**Why it's wrong:** CSS `transform` creates a new containing block. `position: fixed` elements inside a transformed ancestor are positioned relative to that ancestor, not the viewport. If the ancestor also has `overflow: hidden`, the "fixed" element is clipped to the ancestor's visible area. The flyout appears trapped inside its parent — invisible, clipped, or overlapping the wrong elements. DevTools will show `position: fixed` but the element behaves as `position: absolute`.

**Correct alternative:** Render the flyout via `createPortal(…, document.body)`. This physically moves the DOM node outside the transformed ancestor's hierarchy, making it truly viewport-fixed. Maintain a separate ref for the portal content for event handling (click-away detection, focus management). Any component using Tailwind animation/transition utilities on an ancestor is vulnerable to this — it's not a rare edge case.

**Incident:** FB-023 (2026-03-29) — Search flyout trapped inside collapsed sidebar due to `translate-x-0` creating a containing block.

---

## AP-014: Centered Modals for Contextual Actions

**Status: ACTIVE**

**Trigger:** Opening a centered viewport modal for a contextual action that was triggered from a specific UI element (e.g., clicking a search icon in the sidebar opens a centered search modal).

**Why it's wrong:** Centered modals are appropriate for global, disruptive actions (destructive confirmations, onboarding flows, critical alerts). For contextual actions — where the user's attention and cursor are already at a specific screen location — a centered modal forces a long mouse/eye movement from the trigger to the center of the viewport. This violates Fitts's Law: the response should appear where the user's attention already is. It also breaks the spatial relationship between trigger and response — the user must mentally connect "I clicked *there* and the result appeared *here*."

**Correct alternative:** Use an adjacent flyout, popover, or dropdown that appears immediately next to the trigger element. For sidebar interactions, position the flyout at the sidebar's edge (`left` equal to sidebar width). For toolbar actions, use a dropdown below the button. Reserve centered modals only for actions that *should* interrupt flow and demand full attention.

**Incident:** FB-020 (2026-03-29) — User explicitly rejected centered search modal in favor of adjacent flyout panel.

---

## AP-015: Centering Icons in Collapsed Sidebar

**Status: ACTIVE**

**Trigger:** Using `justify-center w-7 mx-auto` on nav links in collapsed sidebar mode, while expanded mode uses `px-2` for left-aligned icons.

**Why it's wrong:** During the collapse/expand transition, the sidebar width animates from 200px to 40px (or vice versa). If icons are centered in collapsed mode but left-aligned in expanded mode, they shift horizontally during the transition. Users perceive this as unstable layout — the navigation "moves to the middle" instead of smoothly retracting. The sidebar should be anchored to the left edge; only the right edge moves.

**Correct alternative:** Use `pl-[7px]` for collapsed mode nav links. This places the icon center at 20px from sidebar left — 0.5px from true center of the 39px inner width (40px sidebar minus 1px border-r). During the transition, icons shift by only 1px (from 13px to 14px in expanded mode's `px-2`), which is imperceptible over the 200ms animation. Do not use `pl-2` (8px) — it creates a 1.5px right-skew that is visible in the narrow 40px sidebar.

**Incident:** FB-030/FB-033 (2026-03-29) — User described icons "moving to the middle and shifting to the right" during collapse; later noticed collapsed icons were visibly right-skewed.

---

## AP-016: Click-to-Open for Navigation Sub-Menus

**Status: ACTIVE**

**Trigger:** Requiring a click to open category sub-navigation (sliver/flyout panel) in a sidebar, with a click or backdrop dismiss to close.

**Why it's wrong:** Navigation exploration is a scanning activity, not a transactional one. The user is moving their cursor across categories to see what's available — they haven't committed to a specific destination yet. Requiring a click to peek inside a category creates two unnecessary interactions per exploration (click to open, click/backdrop to close). Over a session with frequent navigation, this compounds into significant friction. The click-to-open model treats each category as a door that must be deliberately opened, when it should be a lens the user passes over.

**Correct alternative:** Use a hover-to-reveal pattern: `onMouseEnter` opens the sliver, `onMouseLeave` with a 200ms timer closes it. The timer serves as a grace period for moving between the sidebar and the sliver without accidentally closing. Non-category elements in the sidebar should close the sliver on hover to prevent stale panels. See `design.md` §4.6.

**Incident:** FB-031 (2026-03-29) — User said "that's just very inconvenient" about click-to-open category panels.

---

## AP-017: Shared-Stem Names at Visible Proximity

**Status: ACTIVE**

**Trigger:** Using "Foundations" as a section header and "Foundational" as a category label in the same sidebar. Any pair of labels sharing a root morpheme (e.g., `found-`) displayed simultaneously.

**Why it's wrong:** Users scan navigation labels quickly. Two names sharing a stem are parsed as the same concept or as a copy error, breaking the taxonomy's credibility. The cognitive cost of distinguishing "Foundations" from "Foundational" exceeds the cost of learning a distinct word.

**Correct alternative:** Audit adjacent labels for shared stems. Replace adjective forms with distinct nouns: "Base" instead of "Foundational" (same meaning, no stem overlap with "Foundations").

**Incident:** FB-034 (2026-03-29)

---

## AP-018: Additive Gap Padding Between Sections

**Status: ACTIVE**

**Trigger:** Using `pb-*` on a container AND `pt-*` on the next container AND `mt-*` on an inner element to control the gap between two visual regions. Each looks "small" individually but they stack.

**Why it's wrong:** Three 4px values (pb-1 + pt-1 + mt-1 = 12px) create a gap larger than intended, and the visual separator (divider line) ends up positioned asymmetrically within the combined gap. The gap ownership is ambiguous — no single element "owns" the spacing, making future adjustments error-prone.

**Correct alternative:** Let a single spacing element own the gap. A section divider with `h-6` (24px) and `items-center` gives a centered divider line with 12px above and 12px below. Do not add external padding on adjacent containers — the divider IS the gap. Per §1.4: "no `mt-*` on the section container."

**Incident:** FB-034 (2026-03-29)

---

## AP-019: Hero-Scale Cards in Portfolio Overview

**Status: ACTIVE**

**Trigger:** Using full-width or multi-column-spanning cards (e.g., `grid-column: span 2` with 2:1 aspect ratio) for featured projects in a portfolio homepage grid.

**Why it's wrong:** A portfolio overview page exists for breadth scanning — the visitor wants to quickly assess the range of work. Hero-scale cards force sequential scrolling: each featured project consumes the entire viewport width, so the user can only evaluate one project at a time. This is appropriate for a case study detail page (deep focus on one project) but wrong for the homepage (shallow scan of many projects). The result is that a portfolio with 12 projects requires 6+ viewport heights of scrolling before the visitor has seen all the titles, when a masonry grid would show them all in 2-3 viewport heights.

**Correct alternative:** Use CSS columns masonry (`column-count: 2` or `3`) where all cards occupy one column width. Differentiate featured projects through aspect ratio (4:3 vs 3:2), not column span. This creates the waterfall height variation that makes masonry layouts visually interesting while keeping all cards compact enough for scanning.

**Incident:** FB-036 (2026-03-29) — User explicitly referenced Pinterest as the density benchmark.

---

## AP-020: Unnecessary overflow-y on Fit-Content Containers

**Status: ACTIVE**

**Trigger:** Adding `overflow-y: auto` and `max-height` to a sidebar or panel whose content fits within the viewport height.

**Why it's wrong:** `overflow-y: auto` reserves space for a scrollbar gutter (~15px on most browsers) even when no scrolling is needed. In a fixed-width sidebar (e.g., 300px), this gutter eats into the content area, creating an asymmetric gap between the sidebar content and adjacent elements. The user sees uneven left/right margins and a scrollbar rail that serves no purpose. It signals "there's more content below" when there isn't, undermining layout trust.

**Correct alternative:** For sticky sidebars with known-fit content, use `position: sticky` + `align-self: flex-start` without any `max-height` or `overflow` constraints. The sidebar takes its natural height and sticks. If the sidebar content genuinely risks exceeding the viewport on small screens, handle it at the page level (the whole page scrolls) rather than creating a scroll-within-a-scroll.

**Incident:** FB-038 (2026-03-29)

---

## AP-022: Unprotected Diagonal Mouse Path Between Menu Tiers

**Status: ACTIVE**

**Trigger:** A hover-to-reveal submenu (flyout, sliver panel, mega-dropdown) that instantly switches to a different category when the cursor crosses adjacent parent items during diagonal mouse movement toward the open submenu.

**Why it's wrong:** When a user sees a submenu open and moves their cursor toward an item in it, the natural mouse path is diagonal — from the parent item to the target in the submenu. This diagonal path inevitably crosses other parent items in the list. Without path prediction, each crossing fires `onMouseEnter`, switching the submenu to a different category. The user never reaches their intended target because the submenu keeps changing under their cursor. Amazon identified this as a revenue-impacting UX failure in their mega-dropdown menus. Ben Kamens documented the solution as "menu aim."

**Correct alternative:** Implement the "safe triangle" / submenu aim pattern. Track the cursor's trajectory using slope analysis between successive positions and the submenu's far corners. If the slopes are diverging (cursor is getting closer to the submenu), defer the category switch. Use the `useSafeTriangle` hook with a `submenuRef` and `interceptHover` wrapper around the hover callback. See `design.md` §4.7 for the full specification.

**Frustration caused:** User reported "area for mouse maneuvering is too narrow and it can cause a very bad experience."

---

## AP-021: Global `svg { display: block }` Breaking Inline Icons

**Status: ACTIVE**

**Trigger:** A global CSS reset includes `svg { display: block; max-width: 100%; }`, and then a small SVG icon is placed inside an inline element (like an `<a>` tag within flowing paragraph text).

**Why it's wrong:** The reset was designed for standalone/decorative SVGs and is a common modern pattern (Tailwind Preflight, etc.). But it has a hidden side effect: any SVG used as an inline icon — e.g., an external-link arrow next to a link — becomes a block element, breaking onto its own line and fragmenting the surrounding text flow. The paragraph becomes unreadable.

**Correct alternative:** Keep the global reset for general SVGs, but explicitly override with `display: inline` on any SVG class used as an inline text icon:
```scss
.externalIcon {
  display: inline;
  vertical-align: super;
}
```

**Frustration caused:** 1 round — user saw paragraph text completely fragmented by block-level icons.

---

## AP-023: Form Inputs Without Persistent Labels or Field Type Affordances

**Status: ACTIVE**

**Trigger:** Rendering form inputs in an editing UI (modal, panel, inline editor) with only `placeholder` text and no visible `<label>`, no `type` differentiation (e.g., `type="url"` vs `type="text"`), and no help text.

**Why it's wrong:** Placeholders disappear the moment the user types. A filled input with no label is a mystery — you can't tell whether the value "2023-2024" is in a period field, a URL field, or a name field. Without `type="url"`, the browser provides no validation or affordance (like showing `https://` prefix or URL keyboard on mobile). The user must hold the field's purpose in memory, which violates recognition over recall (Nielsen's 6th heuristic). In practice, users WILL put data in the wrong field and not realize it until something breaks downstream.

**Correct alternative:**
1. Always render a persistent `<label>` above each input — even in compact panels. Small uppercase labels (10–11px) are sufficient.
2. Use semantic `type` attributes: `type="url"` for URLs, `type="email"` for emails. This gives browser-native validation and mobile keyboard hints.
3. For fields with non-obvious formats (dates, periods, slugs), add a one-line `<span>` below the input with an example: "e.g., 2023-Present".

**Frustration caused:** 1 round — user typed period info into a URL field because all fields looked identical.

---

## AP-024: Critical Action Buttons in Scrollable Content Flow

**Status: ACTIVE**

**Trigger:** Placing "Save", "Submit", "Done", or other high-stakes action buttons inside a scrollable container where they can scroll off-screen.

**Why it's wrong:** If the user can't see the Save button, they either (a) don't know it exists, (b) assume their changes are already saved, or (c) have to scroll to find it — adding friction to the most important action in the UI. For CMS editing panels where NOT saving means losing work, an invisible Save button directly causes data loss and frustration.

**Correct alternative:** Use a flex column layout for modal/panel containers: header (`flex-shrink: 0`) → scrollable body (`flex: 1; overflow-y: auto; min-height: 0`) → footer (`flex-shrink: 0`). Only content scrolls. Action buttons in the header and footer are always visible regardless of content length.

**Frustration caused:** 1 round — user couldn't find Save button in a panel with 5+ items.

---

## AP-025: Arrow Buttons for List Reorder When Drag Is Available

**Status: ACTIVE**

**Trigger:** Using up/down arrow buttons as the primary mechanism for reordering list items in a desktop UI.

**Why it's wrong:** Arrow buttons require O(n) clicks to move an item across the list. For a 10-item list, moving item 10 to position 1 takes 9 clicks. This is high-friction, cognitively demanding (count clicks), and doesn't match user expectations — every modern CMS, Figma layer panel, and task manager uses drag-and-drop for reordering. Arrow buttons signal "this tool wasn't designed with real use in mind."

**Correct alternative:** Add a drag handle (6-dot grip icon) to each item. Use HTML5 native drag (or `@dnd-kit` for complex cases) for reordering. During drag, collapse all items to single-line summaries so the user can easily find drop targets without scrolling. Keep the drop indicator clear (a colored line between items).

**Frustration caused:** 1 round — user identified unnecessary friction.

---

## AP-026: Low-Contrast Error States for Critical Actions

**Status: ACTIVE**

**Trigger:** Displaying a save/submit error as small colored text within the existing UI layout, without changing the overall visual state of the containing element.

**Why it's wrong:** For high-stakes actions (save, submit, delete), failure means the user's work is at risk. A small red text label competing with other UI elements for attention fails the "glance test" — the user should know something is wrong within 200ms of looking at the screen. When the error text is the same size as surrounding copy and the container's visual state doesn't change, the error is invisible in peripheral vision.

**Correct alternative:** Transform the entire containing element's visual state on error. For a bottom action bar: change the background to a bold error color (e.g. deep red #991b1b), swap the primary message to the error explanation, change the action button from "Save" to "Retry" with inverted contrast (white button on red bar). The state change should be unmissable from any screen position. Reserve small inline text for non-critical warnings, not for "your data may be lost" scenarios.

**Frustration caused:** 1 round — user called the error treatment "too subtle for something critical."

---

## AP-027: Flex Containers Without Minimum Dimension Constraints

**Status: ACTIVE**

**Trigger:** Using `display: flex; flex-direction: column` on a modal/panel with `max-height` but no `min-height`, causing the container to collapse when children have a flex-basis of 0 or content is empty/short.

**Why it's wrong:** Flex containers size to their content by default. When a child has `flex: 1 1 0` (basis 0), it contributes zero size to the container's intrinsic dimensions. Without a `min-height`, the container collapses to just the non-flexible children (e.g. header + footer), leaving the flexible child invisible. This makes the UI appear broken — users see an empty panel and assume the feature is bugged.

**Correct alternative:** Always set both `min-height` and `max-height` (or use `height: clamp(...)`) on flex modal/panel containers. Use `min()` for the lower bound to respect small viewports: `min-height: min(400px, 60vh)`. Apply the same thinking to width: `min-width: 320px`. The minimum should guarantee enough space for at least 2-3 items plus breathing room. Modal dimension template: `min-height: min(420-520px, 65-70vh)`, `max-height: 88vh`, `min-width: 320px`, `width: min(Npx, 90-92vw)`.

**Frustration caused:** 3 rounds — FB-043 (array panel collapse), FB-045 (array panel too short), FB-062 (ProjectEditModal squeeze). **ESCALATED: violated 3 times despite documentation. Consider extracting a shared SCSS mixin.**

---

## AP-028: Form Fields Without Required Indicators or Client-Side Validation

**Status: ACTIVE**

**Trigger:** Rendering form inputs without visual distinction between required and optional fields, and relying solely on server-side validation to catch empty required fields.

**Why it's wrong:** Two failures compound: (1) The user has no way to know which fields must be filled before attempting to save — they discover requirements only through trial and error. (2) Server-side validation produces a delayed, dislocated error (in a banner, not at the field) that the user must mentally map back to the offending input. Both violate the principle of immediate, proximal feedback.

**Correct alternative:**
- **Red asterisk** (`*`) after required field labels — universally understood.
- **Deferred inline validation**: Show errors only after the user's first save attempt (not on open, to avoid premature nagging). Empty required fields get a red border + error text directly under the input.
- **Disabled save**: Button is disabled while validation errors exist, with a footer message explaining why.
- **Auto-recovery**: Errors clear in real-time as the user fills in fields.

**Also consider:** Whether "required" is truly necessary. A field that blocks saving should represent a genuine data integrity requirement, not a "nice to have." If the user can meaningfully save without it, make it optional.

**Frustration caused:** 1 round — user couldn't save because an optional-feeling field was silently required.

---

## AP-029: Duplicate Navigation in Footer

**Status: ACTIVE**

**Trigger:** Repeating sidebar or header navigation links in the site footer, especially when the sidebar is persistently visible.

**Why it's wrong:** Duplicate links create two editing surfaces for the same data. If only one surface is editable (e.g., sidebar has `EditableArray`, footer renders plain `<a>` tags), users can't edit the "broken" copy and believe the editing system is bugged. Even if both are editable, changes to one don't visually update the other until a page refresh, creating a confusing inconsistency. For single-page layouts where the sidebar is always visible, footer links add no discoverability value.

**Correct alternative:** Footer should contain only content that is unique to the footer context (CTA, email, copyright). Navigation links that are already persistently visible in the sidebar or header should not be duplicated.

**Frustration caused:** 1 round — user reported footer editing was "broken" because footer links were not editable copies of the sidebar's EditableArray.

---

## AP-030: Inconsistent External Link Indicators

**Status: ACTIVE**

**Trigger:** Some external links show an icon (↗ arrow, external-link SVG) while others in the same layout do not.

**Why it's wrong:** Users rely on visual cues to predict navigation behavior. An external link indicator signals "this will leave the site." When some external links have the indicator and others don't, users lose confidence in the signal. They either start expecting every link to leave the site (over-caution) or stop noticing the indicator entirely (signal blindness). Both undermine the intended UX.

**Correct alternative:** Treat external link indicators as a consistency invariant: every `target="_blank"` link must show the indicator. No exceptions. Audit all link renders in the component after adding new link sections.

**Frustration caused:** 1 round — user noticed the Experience section's company links lacked the ↗ icon present in the Links section.

---

## AP-031: CSS Transform for Centering on Framer-Motion-Animated Elements

**Status: ACTIVE**

**Trigger:** Using `transform: translateY(-50%)` (or `translateX(-50%)`) for centering on an element that also has Framer Motion animation props (`x`, `y`, `scale`, `rotate`).

**Why it's wrong:** Framer Motion manages transforms via inline `style.transform`. When FM animates `x: 4 → 0`, it sets `transform: translateX(0px)` as an inline style — which **overrides** the CSS class's `transform: translateY(-50%)`. The vertical centering is silently dropped. The element's `top: 50%` places its top edge at the center instead of its midpoint, causing a downward shift equal to half the element's height. This is invisible in static CSS inspection (the class looks correct) and only manifests at runtime when FM takes control of the transform property.

**Correct alternative:** Use non-transform centering: `top: 0; height: <parent-height>; display: flex; align-items: center`. This achieves the same vertical centering through flex layout, which FM cannot override. Reserve `transform` for FM-managed properties only.

**Frustration caused:** 4 rounds (FB-030, FB-033, FB-050, FB-053). The user escalated to "IT IS STILL NOT FIXED!!!! What the fuck?" Labels appeared ~6px below their ticks — the exact half-height offset predicted by `translateY(-50%)` being dropped.

---

## AP-032: Static Label Color on Multi-State Controls

**Status: ACTIVE**

**Trigger:** A control has visually distinct states for one visual channel (e.g., tick bar color changes between active/inactive) but uses a single static value for its paired channel (e.g., label text stays the same color for all states).

**Why it's wrong:** When two visual elements are spatially paired (a tick and its label, an icon and its text), users perceive them as a single unit. If one element differentiates states (dark bar = active, light bar = inactive) but the other doesn't (all labels are medium gray), the pairing breaks. The label undermines the bar's state signal — the user sees the bar change but the label doesn't reinforce it. From a Gestalt perspective, inconsistent shared properties (color, weight) across paired elements cause them to be perceived as unrelated, degrading the control's communicative power.

**Correct alternative:** Both visual channels must track the same state. If the tick uses `color-primary` when active and `color-placeholder` when inactive, the label must use the same pair. Add a state attribute (`data-active`) to the shared container and use CSS descendant selectors to style both children from the same state source.

**Frustration caused:** 1 round — user noted "inconsistency between the notes for the notch and the notch's visual."

---

## AP-033: Fixed Toolbars Overlaying Page Content

**Status: ACTIVE**

**Trigger:** Using `position: fixed` on an admin bar, toolbar, or save bar that overlays page content, then compensating with hardcoded `paddingTop` or `paddingBottom` on every page that renders the bar.

**Why it's wrong:** A fixed toolbar is removed from document flow. Every page must independently know the toolbar's exact height and apply padding to avoid content being hidden underneath. This creates fragile coupling: if the toolbar height changes (text wraps on small screens, content is added), every page breaks. The toolbar also blocks interactive elements (navigation links, buttons) behind it. Users literally cannot click buttons that the toolbar covers. The "compensating padding" approach also violates AP-003 (inline styles as workarounds) when implemented as `style={{ paddingTop: N }}`.

**Correct alternative:** Use `position: sticky` instead of `position: fixed`. Sticky positioning keeps the element in document flow (naturally pushing content) while still sticking to the viewport edge during scroll. For a top bar: `position: sticky; top: 0`. For a bottom bar: `position: sticky; bottom: 0`. No compensating padding needed on any page. Prerequisite: no `overflow: hidden` on ancestor elements.

**Frustration caused:** 1 round — user identified admin bar was blocking navigation buttons and called it "very bad practice."

---

## AP-034: Admin Controls in Component Document Flow

**Status: ACTIVE**

**Trigger:** Placing admin-only controls (edit, delete, reorder buttons) as in-flow children inside a component's layout — e.g., adding an edit button as a flex child in an attribution row alongside the real content.

**Why it's wrong:** Admin controls are a separate concern from the component's content. When placed in-flow, they participate in the layout algorithm: they take up space, push siblings, change gap distribution, and alter alignment. This forces compensating changes to the real content (e.g., absolutely positioning the LinkedIn button to make room for admin buttons), which breaks Fitts' law by moving interactive elements away from their semantic context. The component's layout in admin mode diverges from the visitor experience — what the admin sees is not what the visitor sees.

**Correct alternative:** Admin controls must be positioned out of document flow as an overlay:
1. Wrap admin buttons in an overlay container with `position: absolute` on the card (which has `position: relative`).
2. Default state: `opacity: 0; pointer-events: none` — invisible and non-interactive.
3. On parent hover: `opacity: 1; pointer-events: auto` — fades in.
4. Override child buttons' self-hiding (`button { opacity: 1; transform: scale(1) }` within the hover rule) since the overlay handles group visibility.
5. Real content (LinkedIn button, avatar, name/role) stays in its natural flow position, identical to visitor view.

**Frustration caused:** 1 round — user identified admin buttons displacing LinkedIn to the wrong position and violating Fitts' law.

---

## AP-035: Small Drag Handle as Sole Drag Target Inside Clickable Card

**Status: ACTIVE**

**Trigger:** Implementing DnD with a small grip icon (e.g., 28×28px) as the only draggable area, while the rest of the tile is a clickable link or button that navigates on pointer events.

**Why it's wrong:** Two failures compound: (1) Fitts' law — a 28×28px target inside a ~300×200px tile means the user must precisely target <2% of the tile surface to initiate a drag. (2) Affordance mismatch — the tile's visual treatment (dashed outline, reorder-mode styling) signals "this entire thing is draggable," but the interaction model says "only this tiny corner works." Users will click-and-drag the tile body, hit the link, and conclude dragging is broken.

**Correct alternative:** The entire tile must be the drag target. The grip icon is a visual indicator ("this tile is draggable") but not the interactive area. During reorder mode, disable all navigation and link behavior on the tile content (`pointer-events: none` on inner content, `cursor: grab` on the wrapper). The perceived drag target and the actual drag target must be identical.

**Frustration caused:** 1 round — user reported "I cannot drag things still" after feature shipped.

---

## AP-036: Bare CMS Fields Without Labels, Descriptions, or Placeholders

**Status: ACTIVE**

**Trigger:** Adding a field to a Payload collection with only `name` and `type`, relying on the auto-generated label (which is just the camelCase field name, title-cased) and providing no `admin.description` or `admin.placeholder`.

**Why it's wrong:** CMS admin forms are used by the site owner, not developers. A field labeled "Alt" with no explanation communicates nothing — the user doesn't know what alt text is, why it's required, or what a good example looks like. Technical field names (alt, slug, href, mime) are meaningless jargon in the admin UI. Without placeholder examples, the user has no model for what to type. Without descriptions, they either guess wrong or skip the field entirely. This is the form-level equivalent of a tooltip-less icon: the affordance exists but the semantics are missing.

**Correct alternative:** Every Payload field must include:
1. `label` — a human-readable phrase (e.g., "Description (Alt Text)" instead of "Alt")
2. `admin.description` — one sentence explaining what this field does in the user's context
3. `admin.placeholder` — a concrete example of valid input (e.g., `"e.g., Team photo from the Q3 design review"`)

For collection-level context, set `admin.description` on the collection config to explain the overall purpose and any automatic behaviors (like filename sanitization).

**Frustration caused:** 1 round — user encountered bare "Alt" and "Caption" fields on Media upload with no explanation, on top of a silent upload failure.

---

## AP-037: Full-Surface Admin Overlays on Navigable Elements

**Status: ACTIVE**

**Trigger:** Rendering an admin-only hover overlay (upload zone, edit zone) that covers the entire surface of a clickable/navigable element (card link, button).

**Why it's wrong:** The overlay captures all pointer events on hover, making the underlying navigation inaccessible. Users can either interact with the admin tool or navigate — never both. This forces admin users to choose between editing and viewing, which is the opposite of inline editing's promise. Click-to-upload inside these overlays also has inconsistent browser behavior when the file input is inside a deeply nested event-stopped context.

**Correct alternative:** Admin actions should be discrete button badges positioned in a corner (e.g., top-right) that open a modal/panel via `createPortal`. The navigable surface remains fully accessible at all times. Hover only reveals the badge, never replaces the content.

**Frustration caused:** 2 rounds — first the hover overlay didn't trigger uploads, then the overlay blocked navigation to detail pages.

---

## AP-038: Mixed Breakpoint Systems Across Apps in a Monorepo

**Status: ACTIVE**

**Trigger:** Creating a new app (Playground, ASCII Tool) with a Tailwind `@theme` block that defines colors, fonts, and spacing but omits `--breakpoint-*` overrides — silently falling through to Tailwind v4's built-in defaults instead of the design system's canonical breakpoints.

**Why it's wrong:** The design system defines breakpoints at 320/672/1056/1312/1584 in SCSS, but Tailwind's defaults are 640/768/1024/1280/1536. When a developer writes `lg:flex` in the Playground, it activates at 1024px. When the same intent is expressed via `$portfolio-mq-lg` in the main site, it activates at 1056px. Same semantic name, different pixel value. This makes responsive behavior non-transferable between apps: a component that looks correct in the Playground breaks at a different width in the main site. Hardcoded media queries (640px in AdminBar, 768px in experiments) compound the problem by introducing a third, implicit scale.

**Correct alternative:** Every app's `globals.css` must include `--breakpoint-*` overrides in the `@theme` block that match the canonical SCSS tokens. The Cross-App Parity Checklist must include breakpoint sync as a mandatory step. Hardcoded media query values must be replaced with token references.

**Frustration caused:** Latent — discovered during audit, not from a user-visible bug. But the divergence affects every responsive utility in 2 of 3 apps.

---

## AP-039: Interactive Elements Without Focus Ring Clearance

**Status: ACTIVE**

**Trigger:** A clickable/focusable element (button, link, input) whose content fills flush to its bounding box, with no padding buffer, placed in a tight-gap container (`gap-1.5` or less).

**Why it's wrong:** When a user clicks an interactive element, the browser draws a focus ring (outline) around it. This ring extends *outside* the element's border box — typically 2–3px. If the element has zero padding and is flush against its container edge or adjacent siblings, the ring gets visually clipped: neighboring elements paint over the top or bottom of the ring, or the ring extends into a parent's hidden overflow. The result is a chopped, incomplete border that looks like a rendering bug. This violates a basic principle: **every interactive element must reserve space for its focus indicator**. An element designed without room for its own focus state is incomplete.

**Correct alternative:**
1. Add `p-0.5` (2px) padding to the interactive element so the ring renders inside the padding zone.
2. Suppress the browser's default outline with `outline-none`.
3. Use `focus-visible:ring-2 focus-visible:ring-ring` for a controlled, Tailwind-managed focus ring (box-shadow based, not affected by overflow clipping).
4. Adjust the element's width to include the padding (e.g., `w-[52px]` for a 48px swatch + 4px padding).
5. Alternatively, ensure the container has enough gap (≥ `gap-2.5` / 10px) to visually accommodate outlines without padding changes.

**Rule of thumb:** If an element is interactive, its box model must include at least 2px of breathing room on all sides for the focus indicator. This is not optional — it's a baseline accessibility and visual polish requirement.

**Frustration caused:** 1 round — user identified the brand color swatch's border being "chopped up on the top" in the playground color tokens page.

---

## AP-040: False Affordances on Static Elements

**Status: ACTIVE**

**Trigger:** Styling a non-interactive element (span, div) with visual treatments that universally signal interactivity — accent color highlights, pill shapes with hover-like backgrounds, or differentiated visual states that imply "selected" vs. "unselected."

**Why it's wrong:** Users interpret visual cues before attempting interaction. An accent-highlighted label reads as "this is the currently selected option in a set of clickable options." A pill-shaped tag with a background reads as "click me to filter/toggle." When these elements don't respond to clicks, the user experiences a broken promise — the UI looked interactive but wasn't. This is worse than a plain, obviously-static label because it wastes the user's time and erodes trust in the interface's consistency. If something looks different from its siblings (one label is blue while three are gray), the difference must mean something the user can act on.

**Correct alternative:**
1. **If the element should be interactive**, make it a `<button>` with click handler, hover state, focus-visible ring, and cursor: pointer.
2. **If the element is static**, style it identically to its siblings. No accent colors, no differentiated backgrounds. Use plain text, matching weight and color. A static element must look unmistakably static.
3. **The test:** If a user would try to click it based on its appearance, it must be clickable. If it's not clickable, it must look like it's not.

**Frustration caused:** 1 round — user noted "color is somehow highlighted... it almost implies to me it's an active state that users can just kind of click on those."

---

## AP-041: Bounding-Box-With-Padding Icon Sizing in Buttons

**Status: ACTIVE**

**Trigger:** Sizing button icons by giving the icon wrapper a fixed `width`/`height` and then adding internal `padding` to shrink the visible icon area. Using `gap: 0` on the button and relying on the wrapper's padding for icon-to-label spacing.

**Why it's wrong:** This conflates two independent concerns — icon size and icon-to-label spacing — into a single mechanism. The padding eats the wrapper dimensions, producing icons far smaller than intended (e.g., an 18×18 wrapper with 4px padding yields a 10×10 icon — smaller than the 14px label text next to it). Worse, the non-linear padding jumps (2px at sm, 4px at lg) produce size plateaus: sm and lg render the same effective icon despite the button being 50% taller. When `iconOnly` uses a separate code path (children → `.label` instead of `.iconWrap`), icons render at their intrinsic SVG size (24×24) — 2-3x larger than in icon-plus-label mode at the same button size.

**Correct alternative:**
1. Size the icon wrapper directly to the label's computed line-height — no internal padding.
2. Use flex `gap` on the button container for icon-to-label spacing.
3. Route icon-only children through the same `.iconWrap` as `leadingIcon`/`trailingIcon`.
4. See `design.md` §22 for the complete button sizing model.

**Frustration caused:** 1 round — user identified icons as visually inconsistent and non-proportional across button sizes.

---

## AP-042: SCSS-Only Color Tokens in Multi-Theme Contexts

**Status: ACTIVE**

**Trigger:** Using raw SCSS variables (`$portfolio-surface-primary`, `$portfolio-text-primary`, etc.) as the sole color source in component `.module.scss` files when the component will be rendered in a context that supports runtime theme switching (dark mode via `.dark` class).

**Why it's wrong:** Sass variables are compile-time constants. They resolve to hardcoded hex values during the build (e.g., `background: #FFFFFF`). When the host app toggles a `.dark` class at runtime, the compiled CSS doesn't respond — backgrounds stay white, borders stay light gray, and text colors become unreadable. The mismatch creates illegible component UIs in dark mode.

**Correct alternative:**
```scss
background-color: var(--ds-surface-primary, #{$portfolio-surface-primary});
border: 1px solid var(--ds-border-subtle, #{$portfolio-border-subtle});
color: var(--ds-text-primary, #{$portfolio-text-primary});
```
Use `var(--ds-*, #{$scss-fallback})`. The CSS custom property adapts at runtime; the SCSS fallback preserves backward compatibility for hosts that don't define `--ds-*` properties. The `--ds-*` namespace is the design system's theming API — hosts populate it to control the theme.

**Components migrated:** Card, Input, Table. Remaining SCSS modules should follow the same pattern when touched.

---

## AP-043: Raw Primitives in Locked-Appearance Component Styles

**Trigger:** Using `$portfolio-neutral-100` or `$portfolio-neutral-10` directly in "always-dark" / "always-light" component SCSS instead of semantic tokens like `$portfolio-action-always-dark` / `$portfolio-text-always-light-bold`.

**Why it's wrong:** Raw primitives obscure intent. A developer reading `$portfolio-neutral-100` cannot tell whether this is an "always dark" value, a "neutral bold surface," or an "inverse" value — they're all the same hex. Semantic tokens make the intent explicit and enable future value changes without hunting through component files. Additionally, using the wrong primitive (e.g., `$portfolio-neutral-10` for Always Light background instead of `$portfolio-neutral-00`) silently produces the wrong shade.

**Correct alternative:** Use semantic tokens: `var(--portfolio-action-always-dark)`, `var(--portfolio-text-always-light-bold)`, `var(--portfolio-border-always-dark)`, etc. Even though always-* tokens are mode-invariant, they should still be CSS custom properties for consistency with the rest of the token system.

**Frustration caused:** 1 round (FB-071). Always Light Bold was light gray instead of white because it used the wrong primitive.

---

## AP-044: Hardcoded SCSS Palette Values for Hover/Active in Theme-Responsive Components

**Status: ACTIVE**

**Trigger:** Using compile-time SCSS palette variables (`$portfolio-neutral-90`, `$portfolio-red-70`, `$portfolio-accent-20`, etc.) for hover/active background colors in components that also use CSS custom properties for their default state. The default state adapts to dark mode via custom properties, but hover/active compile to static hex values that stay fixed.

**Why it's wrong:** Two distinct failure modes: (1) **Invisible text** — neutral bold's default inverts to white in dark mode, but hover stays hardcoded to near-black, making dark text invisible (1.20:1 contrast). (2) **Zero feedback** — positive/negative bold's default shifts to a deeper shade in dark mode that happens to equal the hardcoded hover value, so hover produces no visible change. Both undermine interaction confidence. The same issue affects subtle/regular/minimal variants, not just bold. Hardcoded light palette values like `$portfolio-accent-20` flash to bright pastels on dark surfaces, making dark-adapted text invisible.

**Correct alternative:** For every appearance-emphasis variant, add a `:global([data-theme="dark"]) &, :global(.dark) &` block that overrides hover/active to dark-appropriate palette steps. The pattern: one step deeper than the dark-mode default for hover, two steps deeper for active. Verify each with WCAG AA contrast math before shipping. Variants using `var(--portfolio-*)` custom properties for hover are already safe and don't need overrides.

**Frustration caused:** 2 rounds (FB-072, FB-073). First caught on highlight bold WCAG contrast, then expanded when neutral bold hover was found invisible in dark mode.

---

## AP-045: Adjacent Buttons Without Minimum Gap

**Status: ACTIVE**

**Trigger:** Placing two or more buttons directly next to each other (horizontally or vertically) with `gap-0`, `gap-1` (4px), or no gap at all — outside of a dedicated button group component.

**Why it's wrong:** Buttons are discrete interactive elements. When placed flush or near-flush, they visually merge into a single block — users can't tell where one button ends and the next begins, especially when both have filled backgrounds or borders. This creates a false affordance (looks like one wide button) and violates the principle that each interactive element must be visually distinct. The problem is worse for full-width stacked buttons, where the entire width of adjacent backgrounds creates a wall of color with no separation. Even 4px is too small to read as intentional separation at normal viewing distances.

**Correct alternative:** Use a minimum gap of 8px (`gap-2` / `spacer-1x`) between adjacent buttons. The recommended default is 12px (`gap-3` / `spacer-1.5x`). The only exception is a dedicated button group component (`ButtonGroup`, `SegmentedControl`) that uses shared borders or internal dividers to communicate "these are facets of one control." See `design.md` → `docs/design/spacing.md` §1.3.

**Frustration caused:** 1 round — user identified the full-width button section as "horrible design practice" due to cramped stacking.

---

## AP-046: Inconsistent Active/Hover Treatment Across Nav Item Types

**Status: ACTIVE**

**Trigger:** Applying different active-state styling to different nav item types in the same sidebar — e.g., category buttons get `text-accent` (blue) but sub-nav links, direct links, and pinned items get `bg-sidebar-accent text-sidebar-accent-foreground` (background highlight with generic foreground).

**Why it's wrong:** "Active" is a system-wide contract — it signals "you are here." When different nav item types use different visual treatments for the same semantic state, the user can't form a consistent mental model. A blue category label next to a background-highlighted sub-link looks like two different states, not one. Additionally, using `hover:text-sidebar-foreground` (#161616, dark gray) instead of `hover:text-black` (#000) for hover text reduces contrast against the hover background — the user perceives the text as "not changing enough" on hover.

**Correct alternative:**
- **Default**: `text-sidebar-muted-foreground` — dark gray, normal weight, no bg.
- **Hover (non-active)**: `hover:bg-foreground/7 hover:text-black dark:hover:text-white` — neutral gray bg, absolute darkest text.
- **Expanded (non-active parent)**: `text-black dark:text-white font-medium hover:bg-foreground/7` — black text, medium weight, neutral gray hover, no resting bg.
- **Active (current page)**: `text-accent font-medium hover:bg-accent/7` — blue text, medium weight, brand-tinted hover bg.
- **Category `isCatActive`** must take priority over `isOpen` in conditional chains.

**Frustration caused:** 5 rounds — each round fixed one state while inadvertently breaking or neglecting another, because no complete state model was defined upfront. See §7.4 ("Model All States Before Writing Any Code").

---

## AP-047: Static Colored Text Palette Step Across Both Modes

**Status: ACTIVE**

**Trigger:** Using the same palette step for a functional text or icon color token in both light and dark mode (e.g., `$portfolio-text-warning: yellow-30` with no dark-mode override, or using a raw Tailwind class like `text-red-500` without a `dark:` variant).

**Why it's wrong:** Colored text that doesn't adapt to the background luminance fails WCAG contrast in one mode or the other. Yellow-30 on white gives 1.68:1 (unreadable), while on dark surfaces it gives 10.75:1 (overkill). The system already has an established step-60 (light) / step-40 (dark) pattern for brand, negative, and positive text — warning was the exception. Similarly, static Tailwind color classes in the playground (like `text-red-500/80`) provide no mode adaptation, producing dim text on dark surfaces.

**Correct alternative:** For DS tokens: use step-60 as the SCSS source value for light mode, and add a step-40 override in the `[data-theme="dark"]` block of `_custom-properties.scss`. For Tailwind utility contexts: use `dark:` variant with a lighter step (e.g., `text-red-600/80 dark:text-red-400/80`). Always verify contrast against both the light surface (white) and dark surface (#161616). See §9.12 in `docs/design/color.md` for the complete rule.

**Frustration caused:** 3 rounds across sessions (FB-072: button text, FB-073: button hover states, FB-076: text color tokens). The pattern was partially implemented but not systematically enforced.

---

## AP-048: Incremental State-by-State Implementation Without a Holistic Model

**Status: ACTIVE**

**Trigger:** Implementing or modifying an interactive component's visual states one at a time — e.g., fixing the active state, then addressing hover as a separate pass, then patching the expanded state, then realizing the hover background is wrong — without first defining the complete state model.

**Why it's wrong:** Each state of an interactive component exists in relation to every other state. Active must be visually distinct from hover. Hover must be visually distinct from expanded. The same semantic state (e.g., "active") must use identical treatment across all instances. When states are implemented incrementally, each fix is locally correct but globally incoherent — fixing one state inadvertently changes the relative contrast or visual weight of another. The result is a "frankenstate" component where no two rounds of feedback produce the same state table, because no state table was defined upfront.

**Correct alternative:** Before writing any conditional class logic, enumerate every visual state the component can be in. For each state, define: text color, icon color, font weight, resting background, and hover background. Define what semantic message each state communicates (interaction vs. location vs. status). Verify that no two different semantic states share identical styling. Only then write the code. See §7.4 in `design.md`.

**Frustration caused:** 5 rounds on sidebar navigation items (FB-075). Each round fixed one dimension while neglecting the complete model. The final four-state table could have been defined in round 1 if the state model had been the starting point rather than the end product.

---

## AP-048: Independent Padding Decisions Across Adjacent Panels

**Status: ACTIVE**

**Trigger:** Setting horizontal padding on a content area (`px-4 lg:px-5`) without checking the adjacent sidebar's effective content offset.

**Why it's wrong:** When a sidebar and content area share a vertical border, the human eye aligns content across both panels along horizontal scan lines. If the sidebar's content starts at 14px from its edge but the adjacent content area starts at 16–20px, the misalignment is visible — especially on desktop where both panels are always in view. A responsive step-up (`lg:px-5`) amplifies the problem at exactly the breakpoint where both panels appear.

**Correct alternative:** Derive the content area's horizontal padding from the sidebar's effective content offset. In this system, the sidebar uses container `px-1.5` (6px) + item `px-2` (8px) = 14px. The content area must use `px-3.5` (14px) to match. Document the alignment relationship in `spacing.md` §1.1 so future changes to sidebar padding automatically flag a content area update.

**Frustration caused:** 1 round (FB-079). Low damage because it was caught early, but the pattern of deciding panel padding independently is systemic.

---

## AP-049: Taxonomy-Based Navigation Grouping That Splits Related Components

**Trigger:** Organizing a component sidebar by abstract type ("what it is") rather than usage context ("where/how a developer uses it"), causing parent-child or sibling components to land in different categories.

**Why it's wrong:** Users navigate by task, not by ontology. When NavItem and Navigation are in different tabs, the user must remember which abstract category each belongs to. Grab-bag categories like "Navigation & Menus" — mixing overlay menus, tab patterns, and nav primitives — provide no predictive value: knowing the category name doesn't tell you what's inside.

**Correct alternative:** Group by usage context. Components that a developer uses together in the same workflow belong in the same category. Parent-child components (Navigation → NavItem) must always be colocated. When a category has only 2 items, consider merging it into an adjacent group rather than adding sidebar noise.

**Frustration caused:** 1 round (FB-080). The user couldn't find NavItem relative to Navigation and questioned the entire IA.

---

## AP-050: Subtle-Emphasis Overlay Badges Blending with Parent Surface

**Trigger:** Using `emphasis="subtle"` (gray tinted fill) on a Badge that overlays a neutral-surface component (e.g., collapsed NavItem, toolbar button, avatar). The subtle fill has near-zero contrast against the parent's own neutral background.

**Why it's wrong:** Overlay badges exist to convey urgency at a glance — unread counts, new flags, status indicators. A badge that blends with its parent surface is invisible, defeating its purpose. The same subtle emphasis that works inline (where surrounding label text provides context) fails catastrophically in overlay position (where the badge floats alone over a small icon).

**Correct alternative:** Overlay badges must always use `emphasis="bold"` (inverse surface = maximum contrast: black-on-white in light, white-on-black in dark). When the parent component enters an active/selected state that uses the brand color, the badge must also switch to `appearance="highlight"` to maintain visual coherence — active state must propagate to all nested semantic elements (icon, label, badge).

**Frustration caused:** 1 round (FB-082). The gray badge blended completely with the NavItem surface, making the notification indicator invisible.

---

## AP-051: Box-Model Gap on Elements with Positioned Overlays

**Trigger:** Using standard flex/grid `gap` values (e.g., `gap-1`) between stacked elements that contain `position: absolute` overlay indicators (badge overlays, status dots, notification pips) without accounting for the overlay's visual protrusion.

**Why it's wrong:** CSS `gap` measures distance between box-model edges, but positioned overlays extend beyond those edges. The human eye perceives spacing as the distance between the closest *visible* elements. When overlays protrude 6-10px beyond the box and the gap is only 4px, the visual spacing is effectively zero — badges from adjacent items appear to touch or overlap. This makes the layout feel cramped and violates the design language's breathing-room principle.

**Correct alternative:** When stacking elements with overflow overlays, set `gap ≥ overlay protrusion + minimum breathing room (4px)`. For NavItem collapsed badge overlays (~8px protrusion), use `gap-3` (12px) minimum. For elements without overflow, `gap-1` (4px) remains appropriate since box-model edges match visual edges.

**Frustration caused:** 2 rounds (FB-053). User flagged the section as "cramped" and "violating design principles."

---

## AP-051: Recreating Badge/Tag/Pill Styling with Raw `<span>` + Custom SCSS

**Status: ACTIVE**

**Trigger:** Rendering a list of labels (tools, technologies, skills, categories) as plain `<span>` elements with bespoke SCSS classes (`.toolTag`, `.tag`, `.chip`, etc.) instead of using the DS `Badge` component.

**Why it's wrong:** The DS Badge component already encodes the correct sizing, spacing, typography, shape, and theming logic across all appearance×emphasis combinations. Custom SCSS reimplementations diverge from the canonical styling, don't benefit from future Badge improvements, and create maintenance burden — every visual refinement to Badge must be manually replicated in every custom tag class. The pattern also makes auditing impossible: searching for `<Badge>` usage won't reveal these shadow implementations.

**Correct alternative:** Use `<Badge>` with the appropriate `appearance`, `emphasis`, `size`, `shape`, and `mono` props. When the page context requires color adaptation (e.g., dark-surface backgrounds where no Badge appearance exactly matches), pass a `className` override for only the color/border/background properties — let Badge handle structure, shape, sizing, and typography.

**Frustration caused:** 1 round (FB-059). Found during audit — 2 locations (case study detail + experiments listing) were using custom spans instead of Badge.

---

## AP-052: Typography Mixin Color Clobbering On-Color Text

**Status: ACTIVE**

**Trigger:** Setting `color: var(--portfolio-text-always-light-bold)` (or any on-surface / on-color token) on a branded pill, filled button, or tinted chip, then calling `@include label`, `@include body-compact`, or another typography mixin that **also** sets `color` to a neutral semantic token (`--portfolio-text-secondary`, etc.).

**Why it's wrong:** Sass emits declarations in source order. The mixin’s `color` wins, replacing the intended high-contrast pairing. On brand fills this often yields dark gray on saturated blue — failing WCAG and defeating the purpose of `always-light` / `text-on-color` tokens.

**Correct alternative:** Use DS components (`Badge`, `Button`) whose SCSS pairs background and text in one place. If mixing custom layout with mixins, **apply the mixin first**, then set `color` again afterward — or extract a typography-only mixin without `color`. For navigation styled as buttons, reuse `Button.module.scss` classes on `<Link>` so dark-mode contrast fixes (e.g. `highlight.bold` on `[data-theme="dark"]`) stay centralized.

**Frustration caused:** 1 round (FB-083). Admin toolbar "Admin" badge and primary CTA were effectively using body/label text colors on brand backgrounds.

---

---

## AP-053: Reimplementing DS Components in Bespoke Visualizations

**Status: ACTIVE**

**Trigger:** Creating raw `<button>`, `<div role="tablist">`, or `<span class="badge">` elements with custom CSS in visualization components when the DS already provides `Button`, `Tabs`, or `Badge` components with the same semantics.

**Why it's wrong:** Custom implementations duplicate behavior the DS already provides — keyboard navigation, ARIA attributes, focus management, hover/active states, dark mode support. Each custom reimplementation is a maintenance fork that won't benefit from DS improvements. Even when styling needs to be compact (e.g., `xs` buttons in a diagram toolbar), the DS components support size variants.

**Correct alternative:** Always check the DS component library first. If a DS component exists for the pattern, use it with appropriate `size`/`emphasis`/`appearance` props. Add a CSS module override class only for context-specific adjustments (e.g., `overflow-x: auto` on a TabsList). Reserve custom implementations for truly novel visualization primitives (diagram nodes, density dots, funnel bars) that have no DS component equivalent — but still use DS tokens.

**Frustration caused:** 1 round (FB-062). 4 components × 3 element types (buttons, tabs, badges) were all using custom implementations.

---

## AP-054: Changing border-width Without Padding Compensation

**Trigger:** Writing CSS that changes `border-width` (or `border-bottom-width`) on `:focus`, `:focus-within`, `:hover`, or `:active` without simultaneously reducing padding by the same amount.

**Why it's wrong:** Changing `border-width` without compensating padding causes layout reflow. The extra pixels push all internal content (text, icons, placeholders) inward, producing a visible jump/flicker every time the state changes. This is especially noticeable on form inputs where focus toggles rapidly.

**Correct alternative:** Use CSS custom properties for base padding (`--_ic-py`, `--_ic-px`) and a `--_border-offset` variable (default `0px`, set to the border increase on focus). Compute padding as `calc(var(--_ic-py) - var(--_border-offset))`. When border goes from 1px to 2px, set `--_border-offset: 1px` — content stays fixed while the border visually thickens. This preserves distinct state affordances (thin→thick) without layout shift.

**Frustration caused:** 1 round — user noticed "everything jumps" on input click.

---

## AP-058: Overlapping Visual Language — Line-on-Line Ambiguity

**Trigger:** Nesting a component that uses a line-based visual treatment (e.g., `Input emphasis="minimal"` with its bottom-border underline) inside a container that already uses lines for a different semantic purpose (e.g., `MenuSeparator` divider lines, `MenuHeader`/`MenuFooter` border lines).

**Why it's wrong:** When two different elements in the same visual context both render as horizontal lines, the viewer cannot distinguish their purposes at a glance. The input underline and the menu separator become visually identical — one means "type here" and the other means "group boundary," but they look the same. This violates the principle that distinct semantics require distinct visual treatments.

**Correct alternative:** When embedding a component inside a container that already owns the "line" visual language, switch the nested component to its box/bordered variant (e.g., `Input emphasis="regular"`). The box style is visually distinct from divider lines — it reads as a contained interactive field, not a separator. More generally: audit the parent container's visual vocabulary before choosing a child component's emphasis/variant.

**Frustration caused:** 1 round — user identified the visual collision immediately.

---

## AP-059: Treating Structural Slots Like Content Rows

**Trigger:** Giving a structural slot (header, footer, toolbar area) the same padding as a content row (menu item, list item) when the slot wraps a child component that already has its own internal padding/sizing.

**Why it's wrong:** Structural slots and content rows serve different purposes. A content row IS the content — its padding defines the click target and reading margin. A structural slot WRAPS content — it provides a mounting point with border separation. When a slot copies item padding, and the child inside it (Input, Button, etc.) also has its own padding, the total whitespace doubles. The slot visually appears bloated compared to sibling items.

**Correct alternative:** Structural slots should use minimal `padding-block` only (breathing room from borders) and let the child component handle its own sizing. The slot's inline alignment comes from the container's padding, not its own. When the child component shares the same spatial scale as the container (e.g., Input at md inside Menu at md), the child's internal dimensions will naturally harmonize with sibling items.

**Frustration caused:** 1 round — user noticed the header was visually heavier than items.

---

## AP-060: Mismatched Size Keywords Across Shared-Scale Components

**Trigger:** Using `size="xs"` on a component (Input, Button) nested inside a container that defaults to `size="md"` (Menu, DropdownMenu), when both components share the same spatial scale (identical icon/font/padding values at each size step).

**Why it's wrong:** Components built on the same spatial scale (Button, Input, Menu, NavItem) use identical icon sizes at each step (16/18/20/22/24px). When a nested component uses a different size keyword than its parent, proportional elements (icons, font size, gap) visually clash — e.g., a 16px search icon next to 20px menu item icons. The inconsistency is immediately perceptible and signals a broken visual system.

**Correct alternative:** Match the nested component's size keyword to the parent container's size. If `Menu size="md"`, use `Input size="md"` and `Button size="md"` inside it. This ensures all icons, font sizes, and gaps are optically consistent. Document the size-matching expectation in the component's playground demo.

**Frustration caused:** 1 round — user spotted the icon size mismatch immediately.

---

## AP-062: Same Text Color for Default and Hover on Light Surfaces

**Trigger:** Setting a component's hover state to change only the background color without also boosting the text and icon color to maximum contrast.

**Why it's wrong:** On a light surface (white or near-white), the default text color is `neutral-bold` (`#161616`). When hover adds a gray background (`#F9F9F9` or similar), the contrast between text and background *decreases*. A hover state that reduces contrast undermines the purpose of hover feedback — the user perceives the text as less readable, not more prominent. This is a perceptual accessibility issue even when the raw WCAG ratio stays above 4.5:1, because the directional change is wrong (hover should make content more prominent, never less).

**Correct alternative:** Use the two-tier contrast model: default state uses `neutral-bold` (`#161616`) for comfortable reading — pure black is too sharp for sustained use. On hover/active, boost to `var(--portfolio-text-neutral-max)` (`#000000`) for text and `var(--portfolio-icon-neutral-max)` for icons — this compensates for the background contrast reduction. Never use `neutral-max` as a resting color; it's a reactive boost reserved for interactive states where the background context has changed.

**Frustration caused:** 2+ rounds — first caught on NavItem sidebar hover (FB-078), then on Menu items (FB-075). The pattern was identified but never formalized as a system-wide token until FB-075.

---

## AP-061: Lifting Button Spacing 1:1 Into Dense List Components

**Trigger:** Creating a list-based component (Menu, Sidebar, CommandPalette) and copying the Button's gap/padding scale verbatim for all five sizes.

**Why it's wrong:** Buttons are isolated interactive elements where generous spacing improves tap target clarity and visual weight. Menu items (and similar dense list rows) stack vertically, so the same spacing is amplified by repetition — 12px gap × 8 items = 96px of total dead space in a column, which reads as "too airy" and breaks the visual density expected from a list. The gap-to-icon ratio diverges sharply at lg/xl (55–67% vs the 25–40% at xs–md), making the two tiers feel like different components.

**Correct alternative:** Share Button's icon sizes, font sizes, and vertical padding (these set the row height), but apply a gap ceiling for dense-list components — 10px (1.25x) at lg and xl. Inline padding at xl should follow the existing +4px delta pattern, not jump +8px. This preserves the spatial family while respecting the density context.

**Frustration caused:** 1 round — FB-074.

---

## AP-055: Disproportionate Icon Size Relative to Text Scale

**Trigger:** Setting icon dimensions (width/height) without checking the corresponding font-size at the same size variant — especially at small sizes where 2px differences are perceptually significant.

**Why it's wrong:** When an icon is visually heavier than the text next to it, the component feels unbalanced. At small sizes (xs, sm), even a 2px overshoot makes the icon dominate the row, drawing the eye away from the content and making the text feel undersized. The user reads this as "the icon is too big" even when the text is correctly sized.

**Correct alternative:** Always verify visual size consistency across all content slots (text, icons, badges, affixes) at every size variant. Icon dimensions should maintain a proportional ratio to the font-size — roughly 1.1–1.25:1. When the font drops (e.g., 12px at xs), the icon must drop with it. Validate by asking: "do these feel like the same visual weight?"

**Frustration caused:** 1 round — FB-092.

---

## Entry Template

```markdown
## AP-NNN: [Short Name]

**Trigger:** [What action or code pattern triggers this]

**Why it's wrong:** [The technical and UX reason]

**Correct alternative:** [What to do instead]

**Frustration caused:** [Optional — how many rounds of user frustration this created]
```
