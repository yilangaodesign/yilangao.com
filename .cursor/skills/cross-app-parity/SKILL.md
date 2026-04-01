---
name: cross-app-parity
description: >-
  Cross-app synchronization checklist for the monorepo's three Next.js apps
  (main site, playground, ASCII Art Studio). Covers component parity, token
  sync, component registry, and new app onboarding. Use after creating or
  modifying anything in src/, after creating a new app, or after changing tokens.
---
# Skill: Cross-App Parity

## When to Activate

- After creating or modifying anything in `src/`
- After adding fonts, dependencies, or CSS variables
- After creating a new component in `src/components/ui/`
- After changing design tokens in `src/styles/tokens/`
- After creating a new app in the monorepo

This project has THREE Next.js apps: main site (`src/`), playground (`playground/`), and ASCII Art Studio (`ascii-tool/`).

---

## §1: Cross-App Parity Checklist

**This is a blocking gate — run after every creation or modification.**

| What you did | What you MUST also do |
|---|---|
| Created a new component in `src/components/ui/` | Create `playground/src/app/components/<slug>/page.tsx` demo harness that imports via `@ds/<Name>` AND add sidebar entry in `playground/src/components/sidebar.tsx`. **Never re-implement the component in Tailwind.** |
| Modified a component in `src/components/ui/` | **Nothing** — the playground imports production components directly via `@ds/*`. Changes propagate automatically. Verify the playground page still renders: `curl -s http://localhost:4001/components/<slug>` |
| Added a font or dependency to root `package.json` | Add to `playground/package.json` too, wire in `playground/src/app/layout.tsx` |
| Changed font loading in `src/app/(frontend)/layout.tsx` | Mirror in `playground/src/app/layout.tsx` |
| Added CSS variables or tokens | Update `playground/src/app/globals.css` AND `ascii-tool/src/app/globals.css` if needed |
| Modified `src/styles/tokens/` | Run `npm run sync-tokens` to update `playground/src/lib/tokens.ts` |
| Modified `src/styles/tokens/_breakpoints.scss` | Update `--breakpoint-*` in BOTH `playground/src/app/globals.css` AND `ascii-tool/src/app/globals.css` `@theme` blocks |
| Modified a DS component used by ASCII Art Studio | Update the Tailwind version in `ascii-tool/src/components/ui/` to match |
| Modified the playground shell (sidebar, layout, theme) | This is playground-only code — no cross-app parity needed |
| Conducted a design experiment that changes token values or component API | Document the outcome in `docs/design-feedback-log.md` AND propagate to production in the same session |
| Added a new app to the monorepo | Follow §4 (New App Onboarding) below |

---

## §2: Token Sync Protocol

When modifying any file in `src/styles/tokens/`:

1. Make the change in the SCSS source of truth
2. Run `npm run sync-tokens` to regenerate playground data
3. Verify: `curl -sI http://localhost:4001/tokens/colors`
4. If adding new semantic tokens, update `playground/src/app/globals.css`

---

## §3: Component Registry Protocol

`archive/registry.json` is the **single source of truth** for all design system artifacts.

**When creating a new artifact — all three steps are mandatory:**

**Step 1: Registry entry** — Add to `archive/registry.json`:
```json
{
  "id": "<experiment>-<kebab-name>",
  "name": "Human-Readable Name",
  "type": "Component | Page | Token | Style",
  "experiment": "experiment-XX | shared",
  "status": "active",
  "description": "What this artifact does.",
  "sourcePath": "src/path/to/file",
  "createdAt": "<ISO 8601 timestamp>",
  "createdBy": "user | cursor",
  "origin": { "type": "custom | library | hybrid", "library": "...", "url": "..." },
  "tags": ["relevant", "tags"],
  "hasPreview": false
}
```

**Step 2: Playground preview** (Components only) — Create page at `playground/src/app/components/<kebab-name>/page.tsx` and add sidebar entry in `playground/src/components/sidebar.tsx`.

**Step 3: Cross-app parity check** — Run §1 checklist above.

**Archiving:** Set `status` to `"archived"`, populate `archivePath`/`archivedAt`/`archivedBy`/`reason`, move file to `archive/`.

---

## §4: New App Onboarding Checklist

When adding a new Next.js app to this monorepo, **all steps are mandatory.**

| Step | What to do | Where |
|------|-----------|-------|
| 1 | Create the app directory with `package.json`, `next.config.ts`, `tsconfig.json`, `postcss.config.mjs` | `<app-dir>/` |
| 2 | Copy and adapt `globals.css` from playground (synced design tokens via `@theme`) | `<app-dir>/src/app/globals.css` |
| 3 | Wire Geist fonts + ThemeProvider in `layout.tsx` | `<app-dir>/src/app/layout.tsx` |
| 4 | Register the port in `docs/port-registry.md` | Port 4000–5000 range |
| 5 | Add `npm run <app-name>` script to root `package.json` | Root `package.json` |
| 6 | **Add to the App Registry table in `AGENTS.md`** | `AGENTS.md` App Registry section |
| 7 | Create a version manifest (`<app-name>.json`) at the repo root if the app has its own release cycle | Root |
| 8 | Register the app in `scripts/version-bump.mjs` and `scripts/version-release.mjs` APPS config | Scripts |
| 9 | Add version bump scripts to root `package.json` | Root `package.json` |
| 10 | Create a synced version TS file (`<app-dir>/src/lib/version.ts`) | App + scripts |
| 11 | Update the §1 checklist to include the new app | This file |
| 12 | Update `docs/engineering.md` route namespace table | `docs/engineering.md` |
| 13 | Document in `docs/engineering-feedback-log.md` | Feedback log |

---

## File Map

| File | Purpose | Read When | Write When |
|------|---------|-----------|------------|
| `archive/registry.json` | Component registry | When adding a new component | When adding a new component |
| `playground/src/components/sidebar.tsx` | Sidebar navigation | When adding a page | When adding a page |
| `src/styles/tokens/` | SCSS token source | When syncing tokens | When modifying tokens |
| `playground/src/lib/tokens.ts` | Token data mirror | After sync | Auto-generated |
| `playground/src/app/globals.css` | Tailwind theme tokens | After adding tokens | When adding CSS vars |
