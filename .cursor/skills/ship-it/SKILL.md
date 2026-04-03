---
name: ship-it
description: >-
  Full release pipeline: analyzes uncommitted changes, batches them into
  dependency-ordered commits, pushes, and hands off to the checkpoint skill
  for version bump, build gate, merge to main, and Vercel deploy. Use when
  the user says "ship it", "publish", "release everything", "push it live",
  "deploy everything", or "go live".
---
# Skill: Ship It

## When to Activate

- User says "ship it", "publish", "release everything", "push it live",
  "deploy everything", "go live"
- User has uncommitted local changes and wants to release them end-to-end
- NOT for when commits already exist and only the release pipeline is
  needed — use `checkpoint` skill directly for that

## Phase Index

| Phase | What | Blocks on |
|-------|------|-----------|
| 1 | Analyze diff | Nothing |
| 2 | Clean junk files | Nothing |
| 3 | Generate commit plan | Nothing |
| 4 | Execute commits | Phase 3 complete |
| 5 | Handoff to checkpoint | Phase 4 complete |

---

## Phase 0: Pre-Flight

Before starting, scan `docs/release-log.md` (first 30 lines) for recent
pitfalls. Known recurring issues are cataloged in the Known Pitfalls section
at the bottom of this file — they inform classification and error recovery.

**Deployment targets:** See AGENTS.md App Registry for production URLs and Vercel
project names. The main site deploys to `yilangao-portfolio` (root dir `.`), the
playground to `yilangao-design-system` (root dir `playground/`). Note that
`.vercel/project.json` at repo root links to the playground, not the main site.

## Phase 1: Analyze

Understand the scope of changes since the last release.

```bash
git branch --show-current                    # Must be dev
git diff --stat                              # Modified tracked files
git diff --name-status                       # Categorize: M/A/D/R
git ls-files --others --exclude-standard     # Untracked new files
```

Classify every changed file into a **dependency layer**:

| Layer | Priority | Path patterns |
|-------|----------|---------------|
| 0 - Config | First | `AGENTS.md`, `.cursor/skills/`, `tsconfig.json`, `.gitignore` |
| 1 - Docs | First | `docs/*`, `CHANGELOG.md` |
| 2 - Tokens | Early | `src/styles/tokens/*`, `src/styles/mixins/*`, `src/styles/_*.scss` |
| 3 - Dependencies | Early | `package.json`, `package-lock.json` (all apps) |
| 4 - Deletions | Mid | Removed files from `src/components/` (not `src/components/ui/`) |
| 5 - New components | Mid | New directories under `src/components/ui/`, new `src/lib/*.ts` |
| 6 - Component updates | Mid | Modified `src/components/ui/*/*.module.scss`, `*.tsx` |
| 7 - Site components | Late | `src/components/` (non-ui: admin, inline-edit, elan-visuals, etc.) |
| 8 - Frontend pages | Late | `src/app/(frontend)/*`, `src/lib/*` (non-new) |
| 9 - Playground | Last | `playground/src/*` |
| 10 - ASCII tool | Last | `ascii-tool/src/*` |

Files that don't fit cleanly: `src/app/globals.scss` goes with Layer 2
(tokens consumer). `archive/registry.json` goes with Layer 5 (component
registry). `src/components/ui/index.ts` goes with Layer 5 (barrel exports).

**Component family rule (REL-AP-003):** When a `src/components/ui/*/`
directory contains *any* new files, ALL files in that directory (new and
modified) go into Layer 5 together. Do not split a component family across
Layer 5 and Layer 6 — they are semantically one unit.

After classification, note:
- Total file count per layer
- Whether any layer is empty (skip it)
- Whether any layer has > 50 files (consider splitting)
- Whether Layer 9 (Playground) contains new pages — flag for build gate
  scrutiny (see REL-AP-002)

## Phase 2: Clean

Before any commits, scan for junk that should never be tracked:

1. **macOS duplicates**: files matching `* 2.*` pattern (e.g., `file 2.md`,
   `logo 2.svg`). Delete them.
2. **Debug logs**: `.cursor/debug-*.log`. Delete them.
3. **Build artifacts**: `.next/`, `node_modules/` (should already be gitignored).

Add any missing patterns to `.gitignore` (e.g., `.cursor/debug-*.log`).

## Phase 3: Plan

Generate the commit plan and **present it to the user before executing**.

For each populated layer, create one commit entry:

| Layer | Conventional commit prefix | Message pattern |
|-------|---------------------------|-----------------|
| 0 | `docs:` | `update agent guardrails and project configuration` |
| 1 | `docs:` | `(describe the specific doc changes)` |
| 2 | `feat:` | `expand design tokens — (list new token files)` |
| 3 | `chore:` | `add/remove (dependency name) dependency` |
| 4 | `refactor:` | `remove legacy component wrappers` |
| 5 | `feat:` | `add (ComponentName) components, remove (ComponentName)` |
| 6 | `refactor:` | `update UI component SCSS modules and APIs` |
| 7 | `refactor:` | `update site-level component styles` |
| 8 | `fix:` | `migrate frontend pages to local component imports` |
| 9 | `refactor:` | `update playground — infrastructure and pages` |
| 10 | `refactor:` | `(describe ASCII tool changes)` |

Present to the user:
1. A **summary table** with commit number, type, file count, and message
2. A **semver recommendation** (see Semver Decision section below)

Then proceed directly to Phase 4. Do NOT pause for approval.

## Phase 4: Execute

Execute each commit sequentially:

```bash
# For each commit in the plan:
git add <files for this commit>
git diff --cached --stat                     # Verify staged files
git commit -m "<approved message>"
```

After all commits:

```bash
git status                                   # Must show clean working tree
git log --oneline -N                         # N = number of commits created
```

If any commit fails (e.g., file not found), diagnose and fix before
continuing. Do NOT skip commits.

## Phase 5: Handoff

1. Push dev to origin:

```bash
git push origin dev
```

2. **Activate the checkpoint skill** at `.cursor/skills/checkpoint/SKILL.md`.

Pass along:
- The **semver recommendation** from Phase 3 (confirm with user)
- The **change summary** for CHANGELOG.md generation

The checkpoint skill handles:
- Version bump (`npm run version:minor/patch/major`)
- Release (`npm run version:release` for each app)
- CHANGELOG.md update
- Release commit
- Build gate (all 3 apps must pass)
- Merge `dev` to `main` and push (triggers Vercel deploy)
- Post-deploy verification (`vercel ls --prod`)
- Bump to next dev patch

If the user only said "ship it" without specifying scope, proceed through
checkpoint automatically. If they said "prepare commits" or "batch my
changes", stop after Phase 4 and ask if they want to continue to deploy.

---

## Semver Decision

Recommend a version bump level based on the change analysis:

| Signal | Level |
|--------|-------|
| Only SCSS value tweaks, doc fixes, bug fixes | **Patch** |
| New components, new tokens, new features, non-breaking API additions | **Minor** |
| Deleted public components, renamed exported types/props, architectural shifts | **Major** |

**Key heuristic:** If Layer 4 (deletions) only removes internal wrappers
that were already replaced by Layer 5 (new components), this is **Minor**,
not Major. Deletions of internal implementation details are not breaking
changes.

Present the recommendation with reasoning. The user makes the final call.

---

## Error Recovery

| Failure | Action |
|---------|--------|
| Build gate fails | Fix on `dev`, commit the fix, re-run builds. Do NOT merge with a broken build. |
| TypeScript errors from tsconfig changes | These are pre-existing issues exposed by the fix. Create a separate commit for the type fixes. |
| Merge conflict on main | Should not happen with fast-forward merges. If it does, abort merge and diagnose. |
| Vercel deploy fails | Check `vercel inspect <url>`. Common causes: missing env vars, module resolution. Fix on `dev`, re-merge. |

---

## File Map

| File | Read When | Write When |
|------|-----------|------------|
| `elan.json` | Phase 1 (current version) | Phase 5 (via checkpoint) |
| `ascii-studio.json` | Phase 1 (current version) | Phase 5 (via checkpoint) |
| `CHANGELOG.md` | Phase 3 (last entry reference) | Phase 5 (via checkpoint) |
| `.gitignore` | Phase 2 (check patterns) | Phase 2 (add missing patterns) |
| `docs/release-log.md` | Phase 0 (recent pitfalls) | Phase 6 (post-release audit) |

---

## Phase 6: Post-Release Audit

**This phase is mandatory after every ship-it run.** It runs after the
checkpoint skill completes (deploy verified) and before responding to the
user with the final summary.

1. **Append to `docs/release-log.md`** (newest first):
   - Version released, date, file count, commit count
   - Semver level and reasoning
   - Any incidents during the release (build gate failures, classification
     issues, checkpoint problems) with references to Known Pitfall IDs
   - Resolution for each incident
   - Layer classification notes (anything non-obvious)

2. **Check Known Pitfalls:** If any incident occurred during the release,
   check if it matches an existing Known Pitfall below. If not, add a new
   `REL-AP-NNN` entry.

3. **Escalation check:** If a Known Pitfall has been triggered 3+ times
   (count occurrences in the release log), promote it:
   - If it's a procedure gap → modify the Phase it affects
   - If it's a cross-cutting concern → propose a Hard Guardrail in `AGENTS.md`

4. **Cap:** If `docs/release-log.md` exceeds 15 entries, archive the oldest.

---

## Known Pitfalls

> Accumulated lessons from past ship-it runs. Scan before each release.
> Escalation: 3+ occurrences → promote to procedure change or guardrail.
> Last updated: 2026-04-03 (5 pitfalls from REL-001, REL-004)

### REL-AP-001: Version sync targets left uncommitted before branch switch

**Occurrences:** 1 (REL-001)

**Trigger:** `npm run version:release` auto-syncs files listed in the
checkpoint skill's Registered Apps table (`playground/src/lib/elan.ts`,
`ascii-tool/src/lib/version.ts`), but the checkpoint procedure's
`git add` command only includes manifest files.

**Failure:** `git checkout main` refuses — "local changes would be
overwritten by checkout."

**Fix:** The release commit must include all sync targets:
```bash
git add elan.json ascii-studio.json playground/src/lib/elan.ts ascii-tool/src/lib/version.ts
```

### REL-AP-002: New playground pages with wrong component preview APIs

**Occurrences:** 1 (REL-001 — 2 type errors in same page)

**Trigger:** New playground pages use wrong prop shapes for shared preview
components (`SubsectionHeading` expects `children`, `SourcePath` expects
`path` prop). These components have no TypeScript autocomplete hints during
authoring because playground pages are often generated in bulk.

**Failure:** Build gate catches TypeScript errors after the release commit
is already created, requiring fix commits before merge.

**Fix:** Phase 1 should flag new playground pages. Before the build gate,
verify that new playground pages use the correct APIs:
- `<SubsectionHeading>Title text</SubsectionHeading>` (children, not props)
- `<SourcePath path="src/components/ui/..." />` (path prop, not children)
- `<PropsTable props={[...]} />` (array of prop objects)

### REL-AP-003: Layer classification splits component families

**Occurrences:** 1 (REL-001)

**Trigger:** A new sub-component file (e.g., `NavItemChildren.tsx`) and
modified parent files (e.g., `NavItem.tsx`, `index.ts`) in the same
`src/components/ui/*/` directory get classified into different layers
(Layer 5 for new, Layer 6 for modified).

**Failure:** Semantically related changes are split across commits, making
the git history harder to follow and potentially causing intermediate
build states where the parent references a sub-component that hasn't been
committed yet.

**Fix:** Layer 5 absorbs ALL files in a `src/components/ui/ComponentName/`
directory when that directory contains any new files. This is now documented
in the Phase 1 classification rules.

### REL-AP-004: Commit message templates don't cover removals

**Occurrences:** 1 (REL-001)

**Trigger:** Layer 3 template says "add (dependency name) dependency" but
the actual change was removing `tailwind-merge`.

**Failure:** No functional failure — the template was silently adapted.
But rigid templates slow down Phase 3 when changes don't match the
expected pattern.

**Fix:** Templates now use `add/remove` for Layer 3. All templates are
starting points — adapt verb and description to match actual change
semantics.

### REL-AP-005: Dead utility file with missing dependency passes classification

**Occurrences:** 1 (REL-004)

**Trigger:** `src/lib/utils.ts` (standard shadcn `cn` utility) was added
as a new file importing `tailwind-merge`, which was never installed and
never imported by any other file. Phase 1 classified it as Layer 5 and
committed it without verifying imports or dependencies.

**Failure:** Main site build gate failed with `Cannot find module
'tailwind-merge'`. Required a fix commit to remove the dead file before
merge.

**Fix:** During Phase 1, for any new `src/lib/*.ts` file, verify:
1. It is imported by at least one other file (`grep -r` for the export)
2. All its imports resolve (check `package.json` for third-party deps)
If either check fails, flag the file as dead code and exclude from commit.
