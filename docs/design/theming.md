<!-- graph metadata for docs knowledge graph (see docs/knowledge-graph.md) -->
---
type: spoke
id: design-theming
topics:
  - design
  - dark-mode
derivedFrom:
  - design.md
---

# Theming

> Spoke file for `docs/design.md`. Return to the [hub](../design.md) for the Section Index.

### 5.1 Dual Theme Testing

Every UI change must be mentally verified in **both** light and dark mode. If you touch colors, background classes, or border classes — check both themes.

### 5.2 CSS Variable Architecture

```css
@theme {
  --color-sidebar: #f9f9f9;  /* light */
}
.dark {
  --color-sidebar: #1a1a1a;  /* dark override — unlayered, beats @layer theme */
}
```

The `.dark` class block must be **unlayered** (outside any `@layer`) so it overrides the theme layer values.

### 5.3 Complete Token Coverage

Every surface (card, sidebar, code block, preview area) must have both light and dark tokens defined. Missing a single `--color-*` variable in `.dark` creates a white flash.
