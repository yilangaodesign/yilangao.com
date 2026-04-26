<!-- graph metadata for docs knowledge graph (see docs/knowledge-graph.md) -->
---
type: spoke
id: design-button-sizing
topics:
  - design
derivedFrom:
  - design.md
---

# Button Sizing Principles (One GS Reference)

> Spoke file for `docs/design.md`. Return to the [hub](../design.md) for the Section Index.

**Source:** Session 2026-03-30, design feedback "vertical spacing too big, icons don't scale with label size." Reference: Goldman Sachs One GS design system button component (Figma).

### 22.1 Icon = Label Line-Height

At every button size, the icon dimensions (width and height of `.iconWrap`) equal the label's computed line-height. This ensures icons and text form a single proportional visual block that scales together as button size changes.

| Size | Font | Line-height | Icon |
|------|------|-------------|------|
| xs | 12px | 16px | 16×16 |
| sm | 14px | 18px | 18×18 |
| lg | 16px | 20px | 20×20 |
| xl | 18px | 24px | 24×24 |

Icons are directly sized — no internal padding on the icon wrapper. The `.iconWrap` is a flex container at the exact icon dimensions; `svg { width: 100%; height: 100% }` fills it without a bounding-box padding model eating space.

### 22.2 Gap-Based Icon-Label Spacing

Spacing between icon and label uses flex `gap` on the button container, not internal padding on the icon wrapper. This separates icon sizing (§22.1) from icon-to-label spacing — two independent concerns that the old bounding-box-with-padding model conflated.

| Size | Gap |
|------|-----|
| xs | 4px (utility-0.5x) |
| sm | 6px (utility-0.75x) |
| lg | 10px (utility-1.25x) |
| xl | 12px (utility-1.5x) |

### 22.3 Padding-Derived Height

Button height is a natural consequence of `py + line-height + py`, not a fixed `height` constraint. The button uses `min-height` (not `height`) as a safety floor. This makes vertical padding the actual control for how tall the button appears — changing `py` changes the visual height.

### 22.4 Asymmetric Padding (py < px)

Vertical padding must be less than or equal to horizontal padding at every size. This produces buttons that read as wider shapes with tighter vertical density — appropriate for B2B interfaces where vertical real estate is precious.

| Size | px | py | Delta |
|------|-----|-----|-------|
| xs | 6px | 4px | 2px |
| sm | 8px | 7px | 1px |
| lg | 16px | 13px | 3px |
| xl | 20px | 16px | 4px |

### 22.5 Unified Icon Sizing Path

Icon-only and icon-plus-label buttons route icons through the same `.iconWrap` wrapper with the same size constraints. In the component, when `iconOnly` is true, `children` is wrapped in `.iconWrap` (not `.label`), receiving the same size-aware treatment as `leadingIcon`/`trailingIcon`. This eliminates the structural disconnect where icon-only icons rendered at intrinsic SVG size (24×24) while icon-plus-label icons were clamped to the bounding-box model.
