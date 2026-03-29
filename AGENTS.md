# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

# Hard Guardrails

**Design:**
1. **NEVER** use inline `style={{}}` — always use Tailwind classes or CSS custom properties
2. **NEVER** place CSS resets outside `@layer base` — unlayered resets override all Tailwind utilities
3. **NEVER** use `@theme inline` for themeable values — use `@theme` so dark mode works
4. **NEVER** treat repeated user complaints incrementally — 3+ in the same category means the root cause is architectural
5. **NEVER** skip dark mode verification when touching colors or backgrounds
6. **ALWAYS** start with comfortable base padding (≥32px for content areas) and scale up at larger breakpoints
7. **ALWAYS** use flex layout with in-flow spacers for fixed sidebars — never rely on padding-left offsets

**Engineering:**
1. **NEVER** make file changes while on `main` — check `git branch --show-current` first; if on `main`, create a feature branch (`git checkout -b feat/<topic>`) before writing any code
2. **NEVER** modify `src/styles/tokens/` without running `npm run sync-tokens` afterward
3. **NEVER** start a dev server without first reading `docs/port-registry.md`
4. **NEVER** kill a process on a port without checking what it is first
5. **NEVER** use ports below 4000 — they are reserved for other projects
6. **NEVER** assume a dev server from a previous session is still running — verify it
7. **ALWAYS** verify changes on localhost after implementation
8. **ALWAYS** trace data flow (source → build → server → browser) when debugging visibility issues
9. **ALWAYS** run the Cross-App Parity Checklist (below) after creating or modifying anything in `src/`

# Knowledge Routing

Read **only** the docs relevant to your current task — not everything.

| Task type | Read before working |
|---|---|
| UI / design work | `docs/design.md` + `docs/design-anti-patterns.md` |
| Engineering / infra | `docs/engineering.md` + `docs/engineering-anti-patterns.md` |
| Starting or stopping a server | `docs/port-registry.md` |
| Structural / architectural changes | `docs/architecture.md` |
| User gives design feedback | Activate `design-iteration` skill |
| User reports a bug or incident | Activate `engineering-iteration` skill |
| Ambiguous: "it looks wrong" | Design track — check `docs/design-feedback-log.md` |
| Ambiguous: "it doesn't work" | Engineering track — check `docs/engineering-feedback-log.md` |

# Design System Package

Published as **`@yilangaodesign/design-system`** on GitHub Packages.
Source repo: https://github.com/yilangaodesign/design-system

| Import type | Path |
|---|---|
| SCSS barrel | `@use '@yilangaodesign/design-system/scss' as *` |
| SCSS sub-module | `@use '@yilangaodesign/design-system/scss/tokens/colors' as *` |
| CSS custom properties | `@import '@yilangaodesign/design-system/css/tokens'` |
| React components | `import { FadeIn } from '@yilangaodesign/design-system'` |

Local `src/styles/` exists for site-specific overrides not yet promoted to the package.
`docs/design.md` is the canonical working copy — update it in-session, then periodically publish to the package.
Renovate (`renovate.json`) auto-creates PRs when a new package version is published.

# Cross-App Parity Checklist

This project has TWO Next.js apps: main site (`src/`) and playground (`playground/`). **This is a blocking gate — run after every creation or modification.**

| What you did | What you MUST also do |
|---|---|
| Created a new component in `src/components/` | Create `playground/src/app/components/<slug>/page.tsx` preview AND add sidebar entry in `playground/src/components/sidebar.tsx` |
| Added a font or dependency to root `package.json` | Add to `playground/package.json` too, wire in `playground/src/app/layout.tsx` |
| Changed font loading in `src/app/(frontend)/layout.tsx` | Mirror in `playground/src/app/layout.tsx` |
| Added CSS variables or tokens | Update `playground/src/app/globals.css` if needed |
| Modified `src/styles/tokens/` | Run `npm run sync-tokens` to update `playground/src/lib/tokens.ts` |

# Token Sync Protocol

When modifying any file in `src/styles/tokens/`:
1. Make the change in the SCSS source of truth
2. Run `npm run sync-tokens` to regenerate playground data
3. Verify: `curl -sI http://localhost:4001/tokens/colors`
4. If adding new semantic tokens, update `playground/src/app/globals.css`

# Component Registry

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

**Step 2: Playground preview** (Components only) —
Create page at `playground/src/app/components/<kebab-name>/page.tsx` and add sidebar entry in `playground/src/components/sidebar.tsx`. A component without a preview is incomplete.

**Step 3: Cross-app parity check** — Run the checklist above.

**Archiving:** Set `status` to `"archived"`, populate `archivePath`/`archivedAt`/`archivedBy`/`reason`, move file to `archive/`.
**Restoring:** Set `status` to `"active"`, remove archive fields, move back to `sourcePath`.
**Origin types:** `custom` (from scratch) · `library` (wrapper/direct usage) · `hybrid` (custom + library)

# Archive — Cold Storage

`/archive/` contains explored-but-shelved code from past experiments.
1. Do NOT reference or import from `/archive/` unless the user explicitly asks.
2. Do NOT include `/archive/` contents in search results during normal work.
3. When shelving: move to `archive/experiment-XX/` or `archive/shared/`, add a comment noting origin and reason.

See `archive/README.md` for the full convention.
