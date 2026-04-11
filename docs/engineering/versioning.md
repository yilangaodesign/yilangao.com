# Multi-App Versioning

> Spoke file for `docs/engineering.md`. Return to the [hub](../engineering.md) for the Section Index.

**Source:** Session 2026-03-29 — "Let's start doing version control for the design system." Extended 2026-04-09 to cover the main website.

## 10.1 Overview

Every app in the monorepo with its own deployment lifecycle has a **version manifest** at the repo root. Each uses semantic versioning (major.minor.patch).

| App | Manifest | Display name | Tracks |
|-----|----------|-------------|--------|
| Design system | `elan.json` | Élan | Components, tokens, styles, playground |
| Main website | `website.json` | yilangao.com | Pages, routes, CMS schemas, site config |
| ASCII Art Studio | `ascii-studio.json` | ASCII Art Studio | ASCII tool features |

The two-branch model maps directly onto the version lifecycle:
- `dev` branch carries the **development version** — the next version being built
- `main` branch carries the **released version** — what's deployed on Vercel

## 10.2 Manifest Structure

All manifests share the same structure:

| Field | Purpose |
|---|---|
| `name` | App display name (e.g. "Élan", "yilangao.com") |
| `version` | Development version (always >= `release.version`) |
| `release.version` | Currently deployed version |
| `release.name` | Display name, e.g. "Élan 1.0.0" or "yilangao.com 1.0.0" |
| `release.releasedAt` | ISO 8601 timestamp of last deploy |

## 10.3 Semver Policy

### Élan (Design System)

| Level | When to use | Examples |
|---|---|---|
| **Patch** (1.0.x) | Token value changes, bug fixes, minor component tweaks | Adjust a color hex, fix a mixin edge case |
| **Minor** (1.x.0) | New tokens, new components, new playground pages, non-breaking additions | Add a new semantic color role, create a new component |
| **Major** (x.0.0) | Breaking token renames/removals, component API changes, architectural shifts | Rename `$portfolio-*` prefix, restructure token files |

### yilangao.com (Website)

| Level | When to use | Examples |
|---|---|---|
| **Patch** (1.0.x) | Content updates, copy changes, style tweaks, bug fixes | Fix a typo, adjust page layout, update CMS field values |
| **Minor** (1.x.0) | New pages/routes, new CMS collections, new site features | Add /experiments page, create a Testimonials collection |
| **Major** (x.0.0) | Route deletions/renames (URL breaking), CMS collection removals, layout restructuring | Remove /blog, rename /work to /projects |

## 10.4 Commands

### Élan (default — no app prefix)

| Command | Effect |
|---|---|
| `npm run version:patch` | Bump dev version patch number |
| `npm run version:minor` | Bump dev version minor number |
| `npm run version:major` | Bump dev version major number |
| `npm run version:release` | Promote `version` → `release.version`, stamp `releasedAt` |
| `npm run version:analyze` | Analyze git diff since last release and recommend a bump level |
| `npm run version:auto` | Analyze + auto-apply the recommended bump |

### yilangao.com (website)

| Command | Effect |
|---|---|
| `npm run website:version:patch` | Bump dev version patch number |
| `npm run website:version:minor` | Bump dev version minor number |
| `npm run website:version:major` | Bump dev version major number |
| `npm run website:version:release` | Promote `version` → `release.version`, stamp `releasedAt` |
| `npm run website:version:analyze` | Analyze git diff since last release and recommend a bump level |
| `npm run website:version:auto` | Analyze + auto-apply the recommended bump |

### ASCII Art Studio

| Command | Effect |
|---|---|
| `npm run ascii-tool:version:patch` | Bump dev version patch number |
| `npm run ascii-tool:version:minor` | Bump dev version minor number |
| `npm run ascii-tool:version:major` | Bump dev version major number |
| `npm run ascii-tool:version:release` | Promote `version` → `release.version`, stamp `releasedAt` |

## 10.5 Automated Version Analysis (`scripts/version-analyze.mjs`)

The analysis script is multi-app. Pass the app key as the first argument (defaults to "elan"). Each app has its own heuristic rules.

### Élan heuristics

| Signal | Bump Level | Example |
|---|---|---|
| Component file(s) deleted | **Major** | Removed a shared component |
| Component file(s) renamed | **Major** | Changed import paths |
| Token file(s) deleted | **Major** | Removed a token category |
| New component file(s) added | **Minor** | Created a new DS component |
| 3+ token files AND 5+ component files modified | **Minor** | Broad design refresh |
| 15+ total DS files changed | **Minor** | Large scope of work |
| Everything else | **Patch** | Value tweaks, bug fixes |

### Website heuristics

| Signal | Bump Level | Example |
|---|---|---|
| Page/route file(s) deleted | **Major** | Removed a public URL |
| Page/route file(s) renamed | **Major** | Changed URL structure |
| CMS collection(s) deleted | **Major** | Removed a content type |
| New page/route file(s) added | **Minor** | Added a new section |
| New CMS collection(s) added | **Minor** | New content type |
| 15+ total files changed | **Minor** | Large scope of work |
| Everything else | **Patch** | Content tweaks, config changes |

The script checks if the current dev version already satisfies the recommended level (e.g., if analysis says "minor" and version is already 1.1.0 vs release 1.0.0, no bump needed).

**Usage patterns:**
- Run `npm run version:analyze` or `npm run website:version:analyze` periodically to check if versions are appropriate.
- Run `npm run version:auto` or `npm run website:version:auto` to let the script decide and apply the bump.
- The playground footer also displays the Élan analysis in real-time during development (via `/api/dev-info`).

## 10.6 Release Workflow

Integrated into the checkpoint workflow (§6.5). Before merging to `main`, repeat for each app with unreleased changes:
1. Run `npm run [app:]version:analyze` to verify the version level is appropriate
2. Run `npm run [app:]version:auto` if it recommends a bump
3. Run `npm run [app:]version:release` to stamp the release
4. Commit the updated manifest(s) (`elan.json`, `website.json`, `ascii-studio.json`)
5. Merge to `main` and push
6. Return to `dev`, bump to next patch, commit

## 10.7 Runtime Exposure

- **Main site:** `<meta name="generator" content="yilangao.com x.x.x (Élan x.x.x)">` in the HTML head (release versions from `website.json` and `elan.json`)
- **Main site code:** `import { website } from '@/lib/website-version'` for runtime access to website version data
- **Playground footer:** Shows Élan version, live "last updated" date (via `/api/dev-info` in dev, static `releasedAt` in production), and change analysis summary
- **Playground sidebar header:** Shows `Élan {version}` — live-updated in dev mode via the same API

## 10.8 Live Dev Info API (`playground/src/app/api/dev-info/route.ts`)

In development mode, the playground exposes `/api/dev-info` which returns:
- `lastModified` — ISO timestamp of the most recent DS file change (git log + uncommitted check)
- `lastModifiedDate` — date portion for display
- `currentVersion` / `releaseVersion` — from `elan.json`
- `analysis` — same change analysis as the standalone script

The `useDevInfo()` hook (`playground/src/hooks/use-dev-info.ts`) polls this endpoint every 60 seconds and provides the data to the Shell footer and Sidebar header components. In production, the endpoint returns 403 and components fall back to the static `elan.ts` data.

## 10.9 Changelog

`CHANGELOG.md` at repo root follows [Keep a Changelog](https://keepachangelog.com/) format. Update it when bumping versions — document what was Added, Changed, Removed, or Fixed.
