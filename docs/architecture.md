# Architecture

> **What this file is:** The authoritative map of how the design system, main site,
> and playground UI relate to each other — where code lives, how it flows, how it's
> published, and how it's deployed.
>
> **Last updated:** 2026-03-29

---

## System Overview

The project is split across **three artifacts** that serve different audiences:

```
┌─────────────────────────────────────────────────────────────┐
│  yilangaodesign/design-system  (separate GitHub repo)       │
│  ─────────────────────────────                              │
│  SCSS tokens · mixins · React components · docs             │
│  Published → GitHub Packages (@yilangaodesign/design-system)│
│  Versioned with Changesets · Built with tsup                │
└────────────────────────┬────────────────────────────────────┘
                         │ npm install (GitHub Packages)
                         ▼
┌─────────────────────────────────────────────────────────────┐
│  yilangao.com  (this repo)                                  │
│  ─────────────                                              │
│  Personal site: portfolio, blog, contact, experiments        │
│  Next.js 16 · Sass · Framer Motion · Payload CMS           │
│  Consumes @yilangaodesign/design-system via SCSS + React    │
│  Port 4000 (dev)                                            │
│                                                             │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  playground/  (subdirectory, separate Next.js app)     │ │
│  │  ──────────────────────────────────────────────        │ │
│  │  Design system documentation UI                       │ │
│  │  Token galleries · component previews · archive browser│ │
│  │  Next.js 16 · Tailwind 4                              │ │
│  │  Port 4001 (dev)                                      │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

---

## 1. Design System Package

**Repo:** https://github.com/yilangaodesign/design-system
**Registry:** GitHub Packages (`https://npm.pkg.github.com`)
**Current version:** 1.0.0

### What It Contains

| Export | Path | Contents |
|--------|------|----------|
| SCSS barrel | `@yilangaodesign/design-system/scss` | All tokens + mixins via `_index.scss` |
| SCSS sub-modules | `@yilangaodesign/design-system/scss/tokens/colors` | Individual token files |
| CSS custom properties | `@yilangaodesign/design-system/css/tokens` | Compiled CSS variables |
| React components (motion) | `@yilangaodesign/design-system` | `FadeIn`, `StaggerChildren`, `StaggerItem` |
| React components (UI) | `src/components/ui/` (local, promotion pending) | Button, Card, Badge, Divider, Avatar, Input, Textarea, Select, Checkbox, Toggle, Tooltip, Dialog, DropdownMenu, Tabs, Toast |
| Design docs | `@yilangaodesign/design-system/docs/*` | `design.md`, `design-anti-patterns.md` |

### Publishing Flow

1. Make changes in the design-system repo
2. Create a changeset (`npx changeset`)
3. Version bump (`npx changeset version`)
4. Publish (`npm run release`) — CI pushes to GitHub Packages
5. Renovate auto-creates a PR in this repo (configured in `renovate.json`, runs every 3 days)
6. Review changelog, merge the PR

### Authentication

GitHub Packages requires authentication even for public packages when using npm.
Consumer repos need an `.npmrc` with:

```
@yilangaodesign:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${NPM_TOKEN}
```

The `NPM_TOKEN` needs `read:packages` scope (or `write:packages` for publishing).

---

## 2. Main Site (yilangao.com)

**Framework:** Next.js 16 with Sass, Framer Motion, Payload CMS
**Dev port:** 4000

### How It Consumes the Design System

- **SCSS:** `@use '@yilangaodesign/design-system/scss' as *` — resolved via
  `sassOptions.includePaths` in `next.config.ts` pointing to `node_modules`
- **React:** `import { FadeIn } from '@yilangaodesign/design-system'`
- **Local overrides:** `src/styles/` contains site-specific tokens and mixins
  that haven't been promoted to the shared package

### UI Component Layer (`src/components/ui/`)

Foundational UI primitives live in `src/components/ui/`, organized by component:

```
src/components/ui/
  Button/       Card/        Badge/       Divider/     Avatar/
  Input/        Textarea/    Select/      Checkbox/    Toggle/
  Tooltip/      Dialog/      DropdownMenu/ Tabs/       Toast/
  index.ts      (barrel re-export)
```

Each component follows the same pattern:
- `Component.tsx` — React component with typed props and `forwardRef`
- `Component.module.scss` — SCSS module consuming `@yilangaodesign/design-system/scss` tokens
- `index.ts` — re-export for clean imports

**Styling:** All components use SCSS modules with design system tokens. No inline styles, no Tailwind.

**Complex interactivity:** Components requiring keyboard navigation, focus trapping, or ARIA management (Select, Checkbox, Toggle, Tooltip, Dialog, DropdownMenu, Tabs, Toast) use Radix UI primitives for behavior, with custom SCSS for all visual styling.

**Import pattern:**
```tsx
import { Button, Card, Badge } from "@/components/ui";
```

**Promotion path:** Once a component is stable and used in production, it gets promoted to the `@yilangaodesign/design-system` package (see §6 below).

**Tier 4 — Headless data layer (future):** For complex data-heavy components, use headless logic libraries: `@tanstack/react-table` for data tables, `react-hook-form` + `zod` for form validation, `react-day-picker` for date picking, `@tanstack/react-virtual` for virtualized lists. These handle logic without imposing design.

### Local vs Package Tokens

| Location | Role |
|----------|------|
| `@yilangaodesign/design-system/scss/tokens/*` | Canonical, shared tokens |
| `src/styles/tokens/*` | Site-specific overrides and tokens not yet in the package |
| `src/styles/_index.scss` | Local barrel that mirrors the package structure for site-specific additions |

---

## 3. Playground UI

**Location:** `playground/` subdirectory (separate `package.json`, separate Next.js app)
**Framework:** Next.js 16 with Tailwind 4
**Dev port:** 4001
**Purpose:** Internal documentation UI for browsing tokens, previewing components, and managing the archive

### What It Provides

- **Token galleries** — color, typography, spacing, motion, elevation
- **Component previews** — FadeIn, Marquee, ArrowReveal, ExpandCollapse, MountEntrance, Navigation, Footer, ThemeToggle
- **Archive browser** — UI for browsing, restoring, and managing archived experiments
- **Fuzzy search** — Fuse.js-powered sidebar search across all pages

### Current Token Source (Important)

The playground does **NOT** consume `@yilangaodesign/design-system`. Instead:

1. `src/styles/tokens/_colors.scss` is the local SCSS source
2. `npm run sync-tokens` (from repo root) reads the SCSS and regenerates the
   color section of `playground/src/lib/tokens.ts`
3. Typography, spacing, motion, elevation, and breakpoints in `tokens.ts`
   are maintained manually

This means the playground's token data can drift from what the published
package actually contains. See "Known Architectural Tensions" below.

### Archive Dependency

The playground's archive browser has API routes (`playground/src/app/api/archive/`)
that read `archive/registry.json` from the **parent repo's filesystem** using
relative paths. This works in local development. In production (Vercel):

- The **archive page** (`archive/page.tsx`) uses `force-static` rendering, so
  the registry data is baked in at build time (the full repo is checked out
  during Vercel builds). If the file isn't found, it falls back to empty data.
- The **mutating API routes** (restore, delete, move) check for `process.env.VERCEL`
  and return a 403 in production. These are development-only features.

---

## 4. Deployment

| Artifact | Target | Status | Notes |
|----------|--------|--------|-------|
| Design system package | GitHub Packages | **Deployed** (v1.0.0) | Changesets + CI publish |
| Main site | Vercel | **Ready to deploy** | Needs `.npmrc` auth + `NPM_TOKEN` env var |
| Playground UI | Vercel | **Ready to deploy** | Separate Vercel project, root dir = `playground/` |

### Deploying the Main Site to Vercel

1. Create a new Vercel project linked to this GitHub repo
2. Root Directory: `.` (default)
3. Framework: Next.js (auto-detected)
4. Environment variable: `NPM_TOKEN` = a GitHub PAT with `read:packages` scope
   (needed because `.npmrc` points `@yilangaodesign` to GitHub Packages)

### Deploying the Playground UI to Vercel

The playground is deployed as a **separate Vercel project** from the same GitHub repo.

1. Create a new Vercel project linked to this GitHub repo
2. **Root Directory: `playground/`**
3. Framework: Next.js (auto-detected)
4. Build command: `npm run build` (default — the `prebuild` script runs
   `sync-tokens` automatically to ensure fresh token data)
5. No additional env vars needed (the playground doesn't import from
   `@yilangaodesign/design-system` directly)

**What works in production:**
- All token galleries (colors, typography, spacing, motion, elevation)
- All component previews
- Archive browser (read-only — data baked in at build time)
- Theme toggle, sidebar, search

**What's disabled in production:**
- Archive mutations (restore, move, delete) — returns 403 with helpful message

### Both Projects from One Repo

Vercel supports multiple projects from the same GitHub repo. Each project has its
own root directory, build settings, and domain. Pushes to the repo trigger builds
for both projects. Use the Vercel dashboard's "Ignored Build Step" setting if you
want to skip playground rebuilds when only `src/` changes (and vice versa).

---

## 5. Known Architectural Tensions

### 5.1 Dual Token Sources

Tokens have two paths:
- **Package path:** `@yilangaodesign/design-system/scss/tokens/*` → consumed by main site via `@use`
- **Local path:** `src/styles/tokens/*` → consumed by `sync-tokens` → feeds playground

These can drift. The canonical source should be the published package, with
`sync-tokens` reading from the package rather than from local SCSS files.

### 5.2 Playground Token Independence

The playground's token data comes from `src/styles/tokens/` (via `sync-tokens`),
not from the published `@yilangaodesign/design-system` package. This is workable
— the `prebuild` script ensures tokens are fresh at build time — but long-term
the playground should consume the package directly for full alignment.

### 5.3 Archive in Production

The archive browser works in production (read-only, build-time data) but mutations
are disabled. If archive management becomes a production need, consider moving the
registry to a CMS or API rather than a filesystem JSON file.

---

## 6. Component Promotion Path

Once a local UI component is stable and used in production:

1. Copy the component to the design-system repo under `components/`
2. Add to `components/index.ts` exports
3. Include the SCSS module in the package build (update `tsup.config.ts` if needed)
4. Publish a new version via Changesets
5. Update this repo to import from the package instead of local `src/components/ui/`
6. Update the component's entry in `archive/registry.json` with the new `sourcePath`

**Decision criteria for promotion:** A component is ready for promotion when it has been used in at least 2 different pages/contexts on the main site, its API has been stable for 2+ weeks, and it has no outstanding design feedback.

---

## 7. Repo Map

```
yilangao.com/
├── src/                          # Main site source
│   ├── app/                      # Next.js App Router pages
│   │   ├── design-system/        # Motion showcase (uses package)
│   │   ├── about/ work/ blog/ contact/ reading/ experiments/
│   │   └── api/                  # Payload CMS API routes
│   ├── components/               # Site components
│   │   └── ui/                   # Foundational UI primitives (Button, Card, etc.)
│   ├── styles/                   # Site-specific SCSS (overrides + local tokens)
│   │   ├── tokens/               # Local token files
│   │   └── mixins/               # Local mixins
│   └── lib/                      # Utilities
├── playground/                   # Design system docs UI (separate Next.js app)
│   ├── src/
│   │   ├── app/                  # Token galleries, component previews, archive
│   │   ├── components/           # Sidebar, shell, previews, archive UI
│   │   └── lib/                  # Token data mirror, archive manifest
│   └── package.json              # Independent dependencies
├── archive/                      # Shelved experiments
│   └── registry.json             # Component/artifact registry
├── scripts/
│   └── sync-tokens.mjs           # SCSS → playground token sync
├── docs/
│   ├── architecture.md           # ← This file
│   ├── engineering.md            # Engineering knowledge base
│   ├── port-registry.md          # Dev server port assignments
│   └── design.md                 # Site-level design knowledge
├── AGENTS.md                     # AI agent rules and protocols
├── renovate.json                 # Auto-update design system dependency
└── package.json                  # Main site dependencies
```
