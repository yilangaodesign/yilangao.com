# Design System Versioning (Élan)

> Spoke file for `docs/engineering.md`. Return to the [hub](../engineering.md) for the Section Index.

**Source:** Session 2026-03-29 — "Let's start doing version control for the design system."

## 10.1 Overview

The design system is named **Élan** and uses semantic versioning (major.minor.patch). The single source of truth is `elan.json` at the repo root.

The two-branch model maps directly onto the version lifecycle:
- `dev` branch carries the **development version** — the next version being built
- `main` branch carries the **released version** — what's deployed on Vercel

## 10.2 Manifest Structure (`elan.json`)

| Field | Purpose |
|---|---|
| `name` | Always "Élan" |
| `version` | Development version (always >= `release.version`) |
| `release.version` | Currently deployed version |
| `release.name` | Display name, e.g. "Élan 1.0.0" |
| `release.releasedAt` | ISO 8601 timestamp of last deploy |

## 10.3 Semver Policy

| Level | When to use | Examples |
|---|---|---|
| **Patch** (1.0.x) | Token value changes, bug fixes, minor component tweaks | Adjust a color hex, fix a mixin edge case |
| **Minor** (1.x.0) | New tokens, new components, new playground pages, non-breaking additions | Add a new semantic color role, create a new component |
| **Major** (x.0.0) | Breaking token renames/removals, component API changes, architectural shifts | Rename `$portfolio-*` prefix, restructure token files |

## 10.4 Commands

| Command | Effect |
|---|---|
| `npm run version:patch` | Bump dev version patch number |
| `npm run version:minor` | Bump dev version minor number |
| `npm run version:major` | Bump dev version major number |
| `npm run version:release` | Promote `version` → `release.version`, stamp `releasedAt` |
| `npm run version:analyze` | Analyze git diff since last release and recommend a bump level |
| `npm run version:auto` | Analyze + auto-apply the recommended bump |

## 10.5 Automated Version Analysis (`scripts/version-analyze.mjs`)

The analysis script scans git diff since the last release and categorizes changes to determine the appropriate semver bump:

| Signal | Bump Level | Example |
|---|---|---|
| Component file(s) deleted | **Major** | Removed a shared component |
| Component file(s) renamed | **Major** | Changed import paths |
| Token file(s) deleted | **Major** | Removed a token category |
| New component file(s) added | **Minor** | Created a new DS component |
| 3+ token files AND 5+ component files modified | **Minor** | Broad design refresh |
| 15+ total DS files changed | **Minor** | Large scope of work |
| Everything else | **Patch** | Value tweaks, bug fixes |

The script checks if the current dev version already satisfies the recommended level (e.g., if analysis says "minor" and version is already 1.1.0 vs release 1.0.0, no bump needed).

**Usage patterns:**
- Run `npm run version:analyze` periodically to check if the current version is appropriate.
- Run `npm run version:auto` to let the script decide and apply the bump.
- The playground footer also displays the analysis in real-time during development (via `/api/dev-info`).

## 10.6 Release Workflow

Integrated into the checkpoint workflow (§6.5). Before merging to `main`:
1. Run `npm run version:analyze` to verify the version level is appropriate
2. Run `npm run version:auto` if it recommends a bump
3. Run `npm run version:release` to stamp the release
4. Commit the updated `elan.json`
5. Merge to `main` and push
6. Return to `dev`, bump to next patch, commit

## 10.7 Runtime Exposure

- **Main site:** `<meta name="generator" content="Élan x.x.x">` in the HTML head (release version, from `elan.json`)
- **Playground footer:** Shows version, live "last updated" date (via `/api/dev-info` in dev, static `releasedAt` in production), and change analysis summary
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
