# Interactive Component Accessibility

> Spoke file for `docs/design.md`. Return to the [hub](../design.md) for the Section Index.

All interactive components must be usable with keyboard alone, compatible with screen readers, and safe for motion-sensitive users. These standards apply to every component in the design system and every interactive visual in the portfolio.

### 17.1 Keyboard Navigation

**Rule:** Every interactive control (button, tab, toggle, drag handle) must be reachable via keyboard. Tab bars use `role="tablist"` / `role="tab"` with arrow key navigation between tabs. Custom drag interactions (canvas pan, scrub controls) must have keyboard equivalents (arrow keys).

**Implementation:**
- Tab bars: Left/Right arrow keys move between tabs, Home/End jump to first/last
- `tabIndex={0}` on the active tab, `tabIndex={-1}` on inactive tabs — Tab key enters the tab bar, arrows move within
- Canvas/drag: Arrow keys for panning (40px per press), +/- for zoom
- Focus must never become trapped — Escape should release custom key handlers where applicable

### 17.2 ARIA Attributes

**Rule:** Interactive patterns must declare their role and state to assistive technology.

**Implementation:**
- Tab bars: container gets `role="tablist"`, each tab gets `role="tab"`, `aria-selected="true|false"`, `aria-controls="panelId"`. Tab panels get `role="tabpanel"`, `aria-labelledby="tabId"`.
- Interactive diagrams: `role="figure"` with `aria-label` describing the content for screen readers
- Toggle buttons: `aria-pressed="true|false"`
- Live regions: Use `role="status"` with `aria-live="polite"` for content that updates in response to user interaction (e.g., node descriptions, mode indicators)

### 17.3 Focus Indicators

**Rule:** Every focusable element must have a visible focus ring. Never remove `outline` without replacing it.

**Implementation:**
- Default: `outline: 2px solid $portfolio-accent-60; outline-offset: 2px`
- Applied via `&:focus-visible` (not `:focus`) to avoid showing rings on mouse click
- High contrast: ring must pass 3:1 contrast against adjacent colors (accent-60 on white = 6.75:1 ✓)

### 17.4 Motion Sensitivity

**Rule:** Components with animation must respect `prefers-reduced-motion: reduce`. Disable transitions, entrance animations, and auto-playing motion.

**Implementation:**
```scss
@media (prefers-reduced-motion: reduce) {
  * { transition-duration: 0s !important; animation-duration: 0s !important; }
}
```
Applied at the component SCSS module level. FadeIn entrance animations, tab transitions, and canvas zoom all collapse to instant state changes.

### 17.5 Pointer-Only Interaction Equivalents

**Rule:** Any interaction that requires a pointer (drag-to-pan, hover tooltips, scrub controls) must have a keyboard or touch alternative. Pointer-only interactions are enhancements, not requirements.

**Implementation:**
- Drag-to-pan canvas → arrow key panning + zoom buttons
- Hover tooltips → click-to-reveal on touch; focus-triggered on keyboard
- Scrub/slider controls → arrow key increment + click-to-jump
