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
| 3 | Generate commit plan | User approval |
| 4 | Execute commits | Phase 3 approval |
| 5 | Handoff to checkpoint | Phase 4 complete |

---

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

After classification, note:
- Total file count per layer
- Whether any layer is empty (skip it)
- Whether any layer has > 50 files (consider splitting)

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
| 3 | `chore:` | `add (dependency name) dependency` |
| 4 | `refactor:` | `remove legacy component wrappers` |
| 5 | `feat:` | `add (ComponentName) components, remove (ComponentName)` |
| 6 | `refactor:` | `update UI component SCSS modules and APIs` |
| 7 | `refactor:` | `update site-level component styles` |
| 8 | `fix:` | `migrate frontend pages to local component imports` |
| 9 | `refactor:` | `update playground — infrastructure and pages` |
| 10 | `refactor:` | `(describe ASCII tool changes)` |

Present to the user:
1. A **summary table** with commit number, type, file count, and message
2. A **mermaid dependency diagram** showing commit order
3. A **semver recommendation** (see Semver Decision section below)

**STOP and wait for user approval.** The user may:
- Approve as-is
- Ask to merge/split layers
- Change commit messages
- Override the semver recommendation

## Phase 4: Execute

After approval, execute each commit sequentially:

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
