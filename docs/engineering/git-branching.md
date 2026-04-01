# Git Branching & Session Safety

> Spoke file for `docs/engineering.md`. Return to the [hub](../engineering.md) for the Section Index.

**Severity: Critical** — Working directly on `main` creates rollback risk. Branch-per-session creates forgotten-merge risk.

## 6.1 Two-Branch Model

This project uses exactly two permanent branches:

| Branch | Purpose | Who writes | When it changes |
|--------|---------|-----------|-----------------|
| `dev` | All ongoing work. Always checked out. | Agent sessions + human | Every commit |
| `main` | Stable checkpoints. Deployed state. | Human-triggered merge only | When user says "checkpoint" or "merge to main" |

No other branches should exist. No feature branches, no session branches, no experiment branches.

## 6.2 Why Not Branch-Per-Session

Multiple agent sessions run concurrently in the same Cursor workspace. They share the same filesystem and git checkout. Creating separate branches provides zero isolation (only one branch can be checked out in a single directory) and creates branch accumulation because there is no reliable "end of session" trigger to merge back.

## 6.3 Agent Protocol — Branch Check Before Writing

Before making any file changes in a session, an agent MUST:

1. Check the current branch: `git branch --show-current`
2. If on `main`, switch to `dev`:
   ```bash
   git checkout dev
   ```
3. If `dev` does not exist (should never happen), create it from `main`:
   ```bash
   git checkout -b dev main
   ```

This is a **hard gate** — no files should be written until the agent is confirmed on `dev`.

**NEVER create new branches.** Never run `git checkout -b`. The only branches are `dev` and `main`.

## 6.4 Concurrent Session Safety

All agent sessions in the same Cursor workspace share the same `dev` branch and filesystem. Isolation comes from **task partitioning**, not branching:

- Concurrent agents should work on **different files**. Two agents editing the same file simultaneously will cause overwrites regardless of branching strategy.
- If two tasks require modifying the same file, serialize them — finish one before starting the other.

## 6.5 Checkpoint Workflow (Merging to `main`)

When the user says "checkpoint", "merge to main", or "deploy":

```bash
# 1. Stamp the release version
npm run version:release
git add elan.json
git commit -m "release: Élan $(node -p \"require('./elan.json').release.version\")"

# 2. Merge to main and push
git checkout main
git merge dev
git push origin main

# 3. Return to dev and bump to next patch
git checkout dev
npm run version:patch
git add elan.json
git commit -m "chore: begin Élan $(node -p \"require('./elan.json').version\")"
git push origin dev
```

After this, `main` reflects the latest stable state with a stamped Élan release. If Vercel is connected, it auto-deploys from `main`. The agent then continues working on `dev` with the version already bumped to the next patch.

## 6.6 Rollback

If `dev` gets into a bad state, it can be reset to the last checkpoint:

```bash
git checkout dev
git reset --hard main
```

This discards all work on `dev` since the last merge to `main`. Use with caution.

## 6.7 What If I'm on `main` with Uncommitted Changes?

Move them to `dev` without losing work:

```bash
git stash
git checkout dev
git stash pop
```
