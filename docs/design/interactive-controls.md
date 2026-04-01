# Interactive Control Design

> Spoke file for `docs/design.md`. Return to the [hub](../design.md) for the Section Index.

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

### 10.5 Transform Conflicts with Animation Libraries

**Source:** Session 2026-03-30, "IT IS STILL NOT FIXED!!!! This text is still aligned to the center."

**Never use CSS `transform` for positioning on elements animated by Framer Motion** (or any library that manages transforms via inline styles). Framer Motion compiles `x`, `y`, `scale`, `rotate` props into an inline `transform` string that **overrides** the CSS class's `transform`. If the CSS uses `transform: translateY(-50%)` for vertical centering and FM animates `x`, the `translateY` is silently dropped.

**Symptom:** An absolutely positioned label uses `top: 50%; transform: translateY(-50%)`. On hover, FM animates it with `x: 4 → 0`. The label appears ~6px below the target because `translateY(-50%)` is overridden.

**Rule:** For elements animated by FM, use **non-transform centering**:
```scss
.label {
  position: absolute;
  top: 0;
  height: $parent-height;    // same as the containing element
  display: flex;
  align-items: center;       // flex centering — no transform needed
}
```

This achieves the same vertical centering without `transform`, so FM's animation of `x` doesn't interfere.

**Incident:** FB-053 — 4th centering/alignment complaint. Labels were 6px below their ticks because FM's `x` animation silently replaced the CSS `translateY(-50%)`.

### 10.6 Paired Visual Channels Must Share State

**Source:** Session 2026-03-30, "there is inconsistency between the notes for the notch and the notch's visual"

When an interactive control communicates state through multiple visual channels (e.g., a tick bar and a text label), **all channels must reflect the same state.** If the bar is bold/dark for active and light/muted for inactive, the paired label must follow the same color and weight progression.

**Violated principle:** The ScrollSpy tick had three distinct visual states (active: `$portfolio-text-primary`; hovered-inactive: `$portfolio-text-placeholder`; default-inactive: `$portfolio-border-subtle`) but the label used a single static color (`$portfolio-text-secondary`) for all states. The label color sat between the active and inactive tick colors, matching neither.

**Rule:** For any control with paired visual elements (bar + label, icon + text, indicator + tooltip):
- Active state: both elements use the primary/bold color; text weight increases (e.g., 400 → 500)
- Inactive state: both elements use the muted/subtle color; text weight stays at base
- The pairing must be enforced through shared state propagation (e.g., `data-active` on the container, CSS descendant selectors)
