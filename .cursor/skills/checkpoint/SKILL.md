---
name: checkpoint
description: >-
  Handles version bumps, releases, and merges to main. Use when the user
  says "checkpoint", "merge to main", "deploy", or asks about versioning.
---
# Skill: Checkpoint & Release Workflow

## When to Activate

- User says "checkpoint", "merge to main", or "deploy"
- User asks about version bumps or release workflow

## Manifest Structure (shared across all apps)

| Field | Meaning |
|---|---|
| `version` | The development version (what `dev` branch is building toward) |
| `release.version` | The deployed version (what's live on Vercel from `main`) |
| `release.name` | Display name, e.g. "Élan 1.0.0" or "ASCII Art Studio 0.1.0" |
| `release.releasedAt` | ISO 8601 timestamp of last deploy |

## Registered Apps

| App | Manifest | Sync target | Version commands |
|-----|----------|-------------|------------------|
| **Élan** (design system + portfolio) | `elan.json` | `playground/src/lib/elan.ts` | `npm run version:patch/minor/major/release/analyze/auto` |
| **ASCII Art Studio** | `ascii-studio.json` | `ascii-tool/src/lib/version.ts` | `npm run ascii-tool:version:patch/minor/major/release` |

## Semver Policy

- **Patch** (x.y.Z): Bug fixes, value tweaks, minor component adjustments
- **Minor** (x.Y.0): New features, new components, non-breaking additions
- **Major** (X.0.0): Breaking changes, API changes, architectural shifts

## Checkpoint Procedure

When the user says "checkpoint", "merge to main", or "deploy":

```bash
# 1. Verify version level is appropriate (auto-bumps if needed)
npm run version:auto

# 2. Release ALL apps that have unreleased changes
npm run version:release
npm run ascii-tool:version:release  # skip if no changes

git add elan.json ascii-studio.json
git commit -m "release: Élan $(node -p \"require('./elan.json').release.version\"), ASCII Art Studio $(node -p \"require('./ascii-studio.json').release.version\")"
git checkout main
git merge dev
git push origin main
git checkout dev

# 3. Bump all released apps to next dev patch
npm run version:patch
npm run ascii-tool:version:patch

git add elan.json ascii-studio.json
git commit -m "chore: begin Élan $(node -p \"require('./elan.json').version\"), ASCII Art Studio $(node -p \"require('./ascii-studio.json').version\")"
git push origin dev
```

## Pre-Checkpoint Verification

Before merging, check all manifests to see if `version` differs from `release.version`:
```bash
node -p "const e=require('./elan.json'); e.version !== e.release.version ? 'Élan: unreleased' : 'Élan: up to date'"
node -p "const a=require('./ascii-studio.json'); a.version !== a.release.version ? 'ASCII: unreleased' : 'ASCII: up to date'"
```

## Runtime Exposure

- Main site: `<meta name="generator">` tag contains the Élan release version
- Playground footer: shows live version, "last updated" date, and change analysis badge
- Playground sidebar header: shows `Élan {version}` — live-updated in dev mode
- ASCII Art Studio: version accessible via `ascii-tool/src/lib/version.ts`

## Changelog

`CHANGELOG.md` at repo root tracks what changed in each version for all apps. Prefix entries with the app name.

## File Map

| File | Purpose | Read When | Write When |
|------|---------|-----------|------------|
| `elan.json` | Élan version manifest | Before any checkpoint | During release |
| `ascii-studio.json` | ASCII Art Studio manifest | Before any checkpoint | During release |
| `CHANGELOG.md` | Version history | Before release | During release |
| `playground/src/lib/elan.ts` | Synced version data | After release | Auto-synced |
