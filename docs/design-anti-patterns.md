# Design Anti-Patterns

> **What this file is:** A catalog of mistakes that caused user frustration, documented so they are never repeated. Each anti-pattern includes the trigger, why it's wrong, and the correct alternative.
>
> **Who reads this:** AI agents before making UI changes — scan for relevant anti-patterns.
> **Who writes this:** AI agents when a feedback cycle reveals a new anti-pattern.
> **Last updated:** 2026-03-29 (AP-017: shared-stem naming + AP-018: additive gap padding)

---

## AP-001: Unlayered CSS Reset with Tailwind v4

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

**Trigger:** Using `@theme inline { --color-background: #fff; }` in Tailwind v4.

**Why it's wrong:** `inline` hardcodes literal color values into utility classes at build time. `bg-background` compiles to `background-color: #ffffff` instead of `background-color: var(--color-background)`. This means `.dark` class CSS variable overrides have zero effect — dark mode is completely broken.

**Correct alternative:** Use `@theme` (without `inline`). This emits `var()` references that respond to runtime class changes.

**Frustration caused:** 2 rounds — user saw white backgrounds in dark mode, sidebar not changing theme.

---

## AP-003: Inline Styles as Workarounds

**Trigger:** Using `style={{ padding: 40 }}` or `style={{ width: someVar }}` when Tailwind classes aren't working.

**Why it's wrong:** Inline styles bypass the design token system. They can't be themed, can't respond to breakpoints, can't be audited, and signal that the framework integration is broken. Using them is treating symptoms instead of diagnosing the root cause.

**Correct alternative:** Fix the root cause (usually a cascade issue). For dynamic values, use Tailwind arbitrary value classes (`w-[200px]`) or CSS custom properties.

---

## AP-004: Fixed Sidebar with padding-left Offset

**Trigger:** Using `position: fixed` on a sidebar and adding `pl-60` or `padding-left` to the content wrapper to prevent overlap.

**Why it's wrong:** The fixed sidebar is removed from document flow. The padding approach is fragile — it depends on the exact sidebar width, breaks when the sidebar is collapsible (dynamic width), and fails if Tailwind can't generate classes from dynamically constructed strings.

**Correct alternative:** Flexbox layout with the sidebar still `fixed`, but an **in-flow spacer div** (same dynamic width class, `hidden lg:block`) that reserves space in the flex flow. Content uses `flex-1 min-w-0`.

---

## AP-005: Centering with w-N mx-auto Inside Padded Containers

**Trigger:** Using `w-10 mx-auto` on an element inside a container that also has horizontal padding.

**Why it's wrong:** `margin: auto` distributes remaining space. If the container is only 40px wide and has `px-1.5` (3px each side), the available width is 34px. A `w-10` (40px) element overflows — `mx-auto` has no space to distribute. The element appears left-aligned.

**Correct alternative:** Make the element full-width and use `justify-center` (flex) to center its children. The icon centers naturally regardless of container math.

---

## AP-006: Truncated Dividers in Compact Layouts

**Trigger:** Using `w-4 mx-auto` on a horizontal divider in a collapsed sidebar.

**Why it's wrong:** A divider that doesn't span its container looks like a rendering artifact, not an intentional design element. Users interpret it as broken.

**Correct alternative:** Plain `border-t` with no width constraint — let it stretch to fill the container.

---

## AP-007: Excessive Content Padding for B2B Interfaces

**Trigger:** Using `p-8` (32px) or larger as base content padding in a tool/dashboard UI.

**Why it's wrong:** 32–40px content gutters are appropriate for consumer landing pages where whitespace conveys luxury. In B2B tools, they waste screen real estate and make the interface feel empty rather than efficient. Designers working in data-dense environments expect tight, purposeful spacing.

**Correct alternative:** Use `px-4 py-4` (16px) as the base, scaling to `px-5 py-5` (20px) at `lg`. This is dense enough for professional use without feeling cramped. See `design.md` §1.1.

**Note:** This supersedes earlier guidance that mandated 32px minimum. That was appropriate before the B2B design posture was established.

---

## AP-008: Treating Symptoms Instead of Diagnosing Root Causes

**Trigger:** User says "there's no spacing." Response: add more `p-*` classes to more elements. User says "still no spacing." Response: add even bigger values.

**Why it's wrong:** If multiple correct Tailwind classes produce no visible effect, the problem is architectural — a cascade override, a build issue, or a framework misconfiguration. Adding more of the same classes will never fix a systemic override.

**Correct alternative:** When spacing classes don't render, immediately check:
1. CSS cascade layers — is there an unlayered reset?
2. Build output — are the utilities being generated?
3. DevTools computed styles — what's actually being applied?
4. Theme directive — is `@theme inline` preventing variable resolution?

---

## AP-009: Inconsistent Spacing Between Toggle States

**Trigger:** A collapsible component (sidebar, accordion, drawer) uses different vertical or horizontal spacing values in its collapsed vs expanded states — e.g., `h-7` tabs when collapsed but `h-8` when expanded, or `mt-4` section gaps when collapsed but `mt-5` when expanded.

**Why it's wrong:** When the user toggles between states, the differing box models cause child elements to visibly shift position. Even with a smooth width transition, the vertical jump is jarring — tabs appear to bounce up or down. Users perceive this as a layout bug rather than a design choice. The root issue is that the two states were styled independently rather than derived from a single canonical spacing model.

**Correct alternative:** Adopt **collapsed-first spacing** — use the collapsed state's values as the canonical reference for all shared vertical dimensions (tab height, section gap, separator height, container vertical padding). The expanded state changes only the horizontal axis (width, padding, label visibility). Shared vertical elements must use a fixed-height wrapper so the same box model is rendered regardless of internal content (e.g., a `h-5` wrapper that contains either a `border-t` or a section label).

**Frustration caused:** User explicitly noted tabs jumping up and down on toggle, and requested the collapsed view as the authoritative spacing reference.

---

## AP-010: Consumer-Grade Corner Radius in B2B

**Trigger:** Using `rounded-md` (6px), `rounded-lg` (8px), `rounded-xl` (12px), or `rounded-2xl` (16px) on any element in a B2B product.

**Why it's wrong:** Large corner radii communicate friendliness and approachability — the visual language of consumer apps (iOS, social media, SaaS marketing pages). In a professional tool, they look out of place, softening edges that should feel precise and utilitarian. The larger the radius, the more it signals "casual" rather than "serious."

**Correct alternative:** Default to `rounded-sm` (2px) for everything. Use `rounded-none` (0px) for tables and full-bleed containers. Reserve `rounded-full` strictly for progress bars, pills, and avatars. Never exceed 4px (`rounded`) and even that should be rare. See `design.md` §8 for the full scale.

**Frustration caused:** User explicitly stated corner radius is "a little too much" and wants 0px to a few pixels as the standard range.

---

## AP-011: Linear Interpolation for Pointer-to-Element Mapping

**Trigger:** Using `Math.round((cursorY - containerTop) / containerHeight * (count - 1))` to determine which discrete element (tick, tab, item) the cursor is pointing at.

**Why it's wrong:** This formula assumes elements are evenly distributed from the very top to the very bottom of the container. In practice, containers have padding, centering (`justify-center`), variable gaps, and elements of different sizes. The mathematical zones diverge from the visual positions, causing the wrong element to be selected. Clicking directly on tick 0 might return index 1 because the tick's visual center doesn't align with the top of the interpolation range. The mismatch feels random to the user — they click exactly on a target and get the wrong result.

**Correct alternative:** Query all target elements by a data attribute (e.g., `[data-notch-index]`), compute the distance from the cursor to each element's bounding rect center, and return the closest match. This is always correct regardless of padding, centering, or gap configuration. The cost of iterating N elements (where N is typically < 20) is negligible.

**Incident:** FB-017, FB-018 (2026-03-29) — ScrollSpy clicks mapped to wrong sections; drag required excessive movement to switch notches.

---

## AP-012: Entering Drag Mode on Pointer Down

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

**Trigger:** Using `position: fixed` on a flyout, modal, or overlay that is a DOM child of an element with any CSS `transform` property — including identity transforms like `translateX(0)` from Tailwind animation classes (`translate-x-0`, `translate-x-full`, etc.).

**Why it's wrong:** CSS `transform` creates a new containing block. `position: fixed` elements inside a transformed ancestor are positioned relative to that ancestor, not the viewport. If the ancestor also has `overflow: hidden`, the "fixed" element is clipped to the ancestor's visible area. The flyout appears trapped inside its parent — invisible, clipped, or overlapping the wrong elements. DevTools will show `position: fixed` but the element behaves as `position: absolute`.

**Correct alternative:** Render the flyout via `createPortal(…, document.body)`. This physically moves the DOM node outside the transformed ancestor's hierarchy, making it truly viewport-fixed. Maintain a separate ref for the portal content for event handling (click-away detection, focus management). Any component using Tailwind animation/transition utilities on an ancestor is vulnerable to this — it's not a rare edge case.

**Incident:** FB-023 (2026-03-29) — Search flyout trapped inside collapsed sidebar due to `translate-x-0` creating a containing block.

---

## AP-014: Centered Modals for Contextual Actions

**Trigger:** Opening a centered viewport modal for a contextual action that was triggered from a specific UI element (e.g., clicking a search icon in the sidebar opens a centered search modal).

**Why it's wrong:** Centered modals are appropriate for global, disruptive actions (destructive confirmations, onboarding flows, critical alerts). For contextual actions — where the user's attention and cursor are already at a specific screen location — a centered modal forces a long mouse/eye movement from the trigger to the center of the viewport. This violates Fitts's Law: the response should appear where the user's attention already is. It also breaks the spatial relationship between trigger and response — the user must mentally connect "I clicked *there* and the result appeared *here*."

**Correct alternative:** Use an adjacent flyout, popover, or dropdown that appears immediately next to the trigger element. For sidebar interactions, position the flyout at the sidebar's edge (`left` equal to sidebar width). For toolbar actions, use a dropdown below the button. Reserve centered modals only for actions that *should* interrupt flow and demand full attention.

**Incident:** FB-020 (2026-03-29) — User explicitly rejected centered search modal in favor of adjacent flyout panel.

---

## AP-015: Centering Icons in Collapsed Sidebar

**Trigger:** Using `justify-center w-7 mx-auto` on nav links in collapsed sidebar mode, while expanded mode uses `px-2` for left-aligned icons.

**Why it's wrong:** During the collapse/expand transition, the sidebar width animates from 200px to 40px (or vice versa). If icons are centered in collapsed mode but left-aligned in expanded mode, they shift horizontally during the transition. Users perceive this as unstable layout — the navigation "moves to the middle" instead of smoothly retracting. The sidebar should be anchored to the left edge; only the right edge moves.

**Correct alternative:** Use `pl-[7px]` for collapsed mode nav links. This places the icon center at 20px from sidebar left — 0.5px from true center of the 39px inner width (40px sidebar minus 1px border-r). During the transition, icons shift by only 1px (from 13px to 14px in expanded mode's `px-2`), which is imperceptible over the 200ms animation. Do not use `pl-2` (8px) — it creates a 1.5px right-skew that is visible in the narrow 40px sidebar.

**Incident:** FB-030/FB-033 (2026-03-29) — User described icons "moving to the middle and shifting to the right" during collapse; later noticed collapsed icons were visibly right-skewed.

---

## AP-016: Click-to-Open for Navigation Sub-Menus

**Trigger:** Requiring a click to open category sub-navigation (sliver/flyout panel) in a sidebar, with a click or backdrop dismiss to close.

**Why it's wrong:** Navigation exploration is a scanning activity, not a transactional one. The user is moving their cursor across categories to see what's available — they haven't committed to a specific destination yet. Requiring a click to peek inside a category creates two unnecessary interactions per exploration (click to open, click/backdrop to close). Over a session with frequent navigation, this compounds into significant friction. The click-to-open model treats each category as a door that must be deliberately opened, when it should be a lens the user passes over.

**Correct alternative:** Use a hover-to-reveal pattern: `onMouseEnter` opens the sliver, `onMouseLeave` with a 200ms timer closes it. The timer serves as a grace period for moving between the sidebar and the sliver without accidentally closing. Non-category elements in the sidebar should close the sliver on hover to prevent stale panels. See `design.md` §4.6.

**Incident:** FB-031 (2026-03-29) — User said "that's just very inconvenient" about click-to-open category panels.

---

## AP-017: Shared-Stem Names at Visible Proximity

**Trigger:** Using "Foundations" as a section header and "Foundational" as a category label in the same sidebar. Any pair of labels sharing a root morpheme (e.g., `found-`) displayed simultaneously.

**Why it's wrong:** Users scan navigation labels quickly. Two names sharing a stem are parsed as the same concept or as a copy error, breaking the taxonomy's credibility. The cognitive cost of distinguishing "Foundations" from "Foundational" exceeds the cost of learning a distinct word.

**Correct alternative:** Audit adjacent labels for shared stems. Replace adjective forms with distinct nouns: "Base" instead of "Foundational" (same meaning, no stem overlap with "Foundations").

**Incident:** FB-034 (2026-03-29)

---

## AP-018: Additive Gap Padding Between Sections

**Trigger:** Using `pb-*` on a container AND `pt-*` on the next container AND `mt-*` on an inner element to control the gap between two visual regions. Each looks "small" individually but they stack.

**Why it's wrong:** Three 4px values (pb-1 + pt-1 + mt-1 = 12px) create a gap larger than intended, and the visual separator (divider line) ends up positioned asymmetrically within the combined gap. The gap ownership is ambiguous — no single element "owns" the spacing, making future adjustments error-prone.

**Correct alternative:** Let a single spacing element own the gap. A section divider with `h-6` (24px) and `items-center` gives a centered divider line with 12px above and 12px below. Do not add external padding on adjacent containers — the divider IS the gap. Per §1.4: "no `mt-*` on the section container."

**Incident:** FB-034 (2026-03-29)

---

## Entry Template

```markdown
## AP-NNN: [Short Name]

**Trigger:** [What action or code pattern triggers this]

**Why it's wrong:** [The technical and UX reason]

**Correct alternative:** [What to do instead]

**Frustration caused:** [Optional — how many rounds of user frustration this created]
```
