# Single Source of Truth (Token Sync)

> Spoke file for `docs/engineering.md`. Return to the [hub](../engineering.md) for the Section Index.

**Severity: Critical** — Manual data duplication caused the playground drift incident (ENG-001).

## 3.1 The Problem

Color tokens exist in three locations:
1. `src/styles/tokens/_colors.scss` — **canonical source** (SCSS variables)
2. `playground/src/lib/tokens.ts` — playground UI data (TypeScript)
3. `playground/src/app/globals.css` — Tailwind `@theme` block (CSS custom properties)

## 3.2 The Rule

`_colors.scss` is the single source of truth. When modifying it:

1. Run `npm run sync-tokens` — this regenerates the color portion of `playground/src/lib/tokens.ts` from the SCSS source.
2. Verify the playground page loads and renders the changes: `curl -sI http://localhost:4001/tokens/colors`
3. If adding a new semantic token category, manually update `globals.css` if the token needs a CSS custom property for Tailwind (this mapping includes light/dark variants and is not auto-generated).

## 3.3 Sync Points

| Source | Consumer | Synced How | When to Update |
|--------|----------|-----------|----------------|
| `src/components/ui/*` | Playground demo pages | **Automatic** (direct `@ds/*` import) | No action — playground imports production components live |
| `_colors.scss` | `tokens.ts` (colors) | `npm run sync-tokens` | After any `_colors.scss` change |
| `_colors.scss` | `playground/globals.css` | Manual (light/dark mapping) | When adding semantic tokens that need CSS custom properties |
| `_typography.scss` | `tokens.ts` (typography) | Manual | When adding/changing font stacks, weights, scale |
| `src/app/layout.tsx` (font loading) | `playground/src/app/layout.tsx` | Manual | When adding/changing font packages or CSS variables |
| Root `package.json` (font deps) | `playground/package.json` | Manual | When adding font packages used by both apps |

## 3.4 Cross-App Component Imports (`@ds/*`)

The playground imports production UI components **directly** from `src/components/ui/` via the `@ds/*` TypeScript path alias. This means:

- **Component changes in `src/components/ui/` are automatically reflected in the playground** — no manual re-implementation or sync needed.
- Demo pages in `playground/src/app/components/*/page.tsx` are thin harnesses that import the production component, arrange it with different props, and render `PropsTable` documentation.
- The playground shell (sidebar, layout, search, theme) remains in Tailwind and is independently maintained in `playground/src/components/`.

**How it works:**
- `playground/tsconfig.json` maps `@ds/*` → `../src/components/ui/*`
- `playground/next.config.ts` sets `turbopack.root` to the monorepo root so Turbopack can process files from `src/`
- `sassOptions.loadPaths` includes `src/styles/` so the SCSS compiler resolves `@use '../../../styles'` in component `.module.scss` files
- Production SCSS Module classes are scoped/hashed and coexist with the playground's Tailwind utilities without conflicts

**When adding a new component to `src/components/ui/`:**
1. Create the component in `src/components/ui/{Name}/`
2. Create a demo page at `playground/src/app/components/{slug}/page.tsx` that imports from `@ds/{Name}`
3. Add a sidebar entry in `playground/src/components/sidebar.tsx`
4. The demo page only needs layout/state — **never re-implement the component in Tailwind**

## 3.5 Other Token Files

Typography, spacing, motion, elevation, and breakpoints in `tokens.ts` are still manually maintained. They change infrequently enough that automated sync is not yet warranted. If drift becomes a pattern, extend the sync script.

**Important:** Font-related changes are NOT just data — they also require **infrastructure parity** between the main app and the playground (package installation, `next/font` imports, CSS variable injection). See §6.
