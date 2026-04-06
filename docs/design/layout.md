# Layout Integrity

> Spoke file for `docs/design.md`. Return to the [hub](../design.md) for the Section Index.

### 2.1 No Overlapping

Navigation and content must coexist as **flex siblings**, never overlap via z-index. The pattern:

```
<div class="flex min-h-screen">
  <Sidebar />              <!-- fixed panel + in-flow spacer div -->
  <div class="flex-1 min-w-0">  <!-- content stretches to fill -->
    <header />
    <main />
  </div>
</div>
```

A `position: fixed` sidebar requires a **companion spacer div** (same dynamic width, `hidden lg:block`) that reserves space in the flex flow.

### 2.2 Content Must Never Be Covered

If a sidebar is fixed, the content area must be pushed over by an in-flow element — not by `padding-left` on a distant ancestor. The spacer div pattern is the only reliable approach.

### 2.3 Cross-Page Alignment Consistency

Child pages must share the same visual center as their parent page unless a documented exception exists. Use **symmetric padding** on layout containers; solve per-element clearance with `margin` on the element that would overlap, not `padding` on the layout ancestor.

### 2.4 Overlay Clearance

When a fixed-position overlay (ScrollSpy, FAB, chat widget) occupies viewport-edge space, yield clearance via `margin` on the content that would overlap - not via `padding` on a layout ancestor. Margin moves one element; padding shifts everything.

### 2.5 Flex-Grow vs. Max-Width Centering Trap

When a flex child has `flex: 1` (grow) and `max-width`, it claims free space it cannot use. The dead space sits on one side, making the layout look off-center. Fix: set `flex-grow: 0` on the capped child and use `justify-content: center` on the flex parent. The child shrinks when the container is tight and centers when the container is wide.
