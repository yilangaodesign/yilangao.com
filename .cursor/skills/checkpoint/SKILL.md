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
- **Automatically activated by the `ship-it` skill** after commits are
  batched and pushed — in this case, a semver recommendation will be
  provided; confirm with the user before proceeding

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

# IMPORTANT: release scripts auto-sync version files — commit ALL of them
git add elan.json ascii-studio.json playground/src/lib/elan.ts ascii-tool/src/lib/version.ts
git commit -m "release: Élan $(node -p \"require('./elan.json').release.version\"), ASCII Art Studio $(node -p \"require('./ascii-studio.json').release.version\")"

# 3. BUILD GATE — verify all apps build before merging (mandatory)
#    If any build fails, STOP. Do not merge to main. Fix the error first.
npm run build --prefix playground   # Playground (Vercel-deployed)
npm run build                       # Main site
npm run build --prefix ascii-tool   # ASCII Art Studio (skip if no changes)

# 4. Merge to main and push
git checkout main
git merge dev
git push origin main
git checkout dev

# 5. Post-deploy verification — poll Vercel for deployment status
#    Wait ~60s for Vercel to pick up the push, then check:
sleep 60
vercel ls --prod                    # Check latest deployment status
#    If status is "Error", diagnose with:
#      vercel inspect <deploy-url>
#      Use Vercel API: GET /v2/deployments/<id>/events for build logs
#    If status is "Ready", deployment succeeded.

# 6. Bump all released apps to next dev patch
npm run version:patch
npm run ascii-tool:version:patch

# Include sync targets (version scripts auto-update them)
git add elan.json ascii-studio.json playground/src/lib/elan.ts ascii-tool/src/lib/version.ts
git commit -m "chore: begin Élan $(node -p \"require('./elan.json').version\"), ASCII Art Studio $(node -p \"require('./ascii-studio.json').version\")"
git push origin dev
```

## Build Gate Details

The build gate (step 3) is **mandatory** — it catches the same errors Vercel would
encounter, but before the merge to main. Common failures:

- **Module not found**: a dependency used by `src/components/ui/` is missing from
  `playground/package.json` (Vercel installs from playground root)
- **TypeScript errors**: type mismatches in component props
- **Import path errors**: incorrect `@ds/*` aliases or circular imports

If a build fails, fix the error on `dev`, re-run the build gate, then proceed.

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
