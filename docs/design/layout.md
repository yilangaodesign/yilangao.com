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
