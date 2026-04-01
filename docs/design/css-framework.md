# CSS Framework Integration (Tailwind v4)

> Spoke file for `docs/design.md`. Return to the [hub](../design.md) for the Section Index.

### 3.1 Layer Cascade — The #1 Architectural Rule

In Tailwind v4, utilities live in `@layer utilities`. **Unlayered CSS always beats layered CSS** in the cascade.

**NEVER** put global resets outside a layer:

```css
/* BROKEN — kills all Tailwind spacing */
* { margin: 0; padding: 0; }
```

**ALWAYS** wrap resets in `@layer base`:

```css
@layer base {
  * { margin: 0; padding: 0; box-sizing: border-box; }
}
```

This is non-negotiable. Violating this silently zeroes out every `p-*`, `m-*`, `gap-*` utility.

### 3.2 @theme vs @theme inline

- `@theme` → emits CSS custom property **references** (`var(--color-background)`). Dark mode `.dark` class overrides work.
- `@theme inline` → hardcodes **literal values** at build time. Dark mode overrides are impossible.

**Always use `@theme` (without `inline`)** for any color or value that changes between themes.

### 3.3 Token-First, Never Inline

All styling must go through design tokens — Tailwind classes, CSS custom properties, or component-level props. **Never use `style={{}}`** as a workaround.

If Tailwind can't express a value, use an arbitrary value class (`w-[200px]`) or a CSS custom property. If the framework fundamentally can't handle the pattern, evaluate switching to ShadCN/Radix or Chakra — don't hack around it with inline styles.
