# Navigation Design

> Spoke file for `docs/design.md`. Return to the [hub](../design.md) for the Section Index.

## §4 Navigation Design

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

### 4.5b Unified Four-State Model for All Sidebar Nav Items

**Source:** Session 2026-04-01, iterative refinement across multiple rounds.

Every nav item in the sidebar — parent categories, direct links (Overview), sub-nav links (Button, Badge…), and pinned items (Archive) — follows one unified state model. No exceptions based on nav item type.

Two visual dimensions communicate two different things:
- **Neutral colors (gray/black)** = "you are interacting with this"
- **Brand accent color (blue)** = "this is where you actually are"
- **Font weight (medium)** = "this has been clicked/activated" (expanded OR active)

**1. Default state:** `text-sidebar-muted-foreground`
- Dark gray text and icon. Normal weight. No background.

**2. Hover state (non-active items):** `hover:bg-foreground/7 hover:text-black dark:hover:text-white`
- Neutral gray background (7% of foreground color). Text goes to absolute black/white for maximum contrast. Normal weight.
- Background must be neutral (foreground-derived), never brand-colored.

**3. Expanded state (non-active parent, flyout open):** `text-black dark:text-white font-medium hover:bg-foreground/7`
- Black text, medium weight — signals "you clicked/expanded this." No resting background.
- Hover background is still neutral gray — because the user is not ON this page, just interacting with it.
- For category buttons: `isCatActive` takes priority over `isOpen`. If the category contains the current page, it gets Active state, not Expanded.

**4. Active state (current page):** `text-accent font-medium hover:bg-accent/7`
- Blue accent text, medium weight — signals "this is where you are."
- Hover background is brand-tinted (7% of accent color) — same brightness as neutral hover but preserving brand identity.
- Icons inherit blue via `currentColor`.

**Anti-pattern:** Applying different state styling to different nav item types, or using a permanent background for the Expanded state. See AP-046.

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

## §12 Overlay & Flyout Positioning

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
