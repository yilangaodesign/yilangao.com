# Phase 4: Collect + Server Ops + Gates

## Step 1: Extract Structured Sections

From each helper's response, parse:
- `## Draft Documentation` — the full feedback log entry draft
- `## Files Modified` — list of every file the helper created or changed
- `## Server Operations Needed` — any server restarts or sync scripts required

If a helper's response is missing any expected section, flag it for
manual review. The helper may have failed partway through.

Update the TodoWrite checklist — mark each helper's task as `completed` when
its response is successfully parsed.

## Step 2: Batch Server Operations

Before running any server operation:
1. Read `docs/port-registry.md` (Hard Guardrail #6)
2. Check what's running on the relevant ports

Then run all needed operations sequentially (never in parallel):
- `npm run sync-tokens` if any helper modified `src/styles/tokens/*`
- Dev server restart if any helper modified CMS schema files
- Any other sync scripts reported by helpers

Wait for the server to be healthy before proceeding to gates.

## Step 3: Run Gates

Check the gate identification table from `decompose.md`. For each gate that
applies based on the actual files modified (from Step 1):

1. Read the gate's skill file
2. Run the checklist against the current state of the codebase
3. If the gate passes: proceed
4. If the gate fails: dispatch a follow-up helper to fix the specific issue,
   with the same `[ORCHESTRATED]` context package format. Re-run the gate
   after the follow-up helper returns.
5. After all follow-up helpers return, re-scan every newly modified file
   against the gate identification table. If a follow-up introduced files
   matching a gate that hasn't run yet, run that gate now. Repeat until no
   new gates are triggered.

Run gates sequentially — each gate may depend on the previous one passing.

## Step 4: Reconcile

1. Run `git diff --name-only` to get the actual set of changed files
2. Compare against the union of all helpers' `## Files Modified` sections
3. For each file modified by more than one helper (or unexpectedly modified):
   - Read the file and check for consistency
   - Cross-check imports across modified files
4. Classify any issues found:
   - **Self-heal**: typos, missing imports, minor inconsistencies — fix directly
   - **Escalate**: architectural conflicts, contradictory changes — report to user

## Recovery Classification

If a helper fails entirely (timeout, crash, no response):
- Check if the 2-line stub was written to the feedback log
- If stub exists: leave it as "Resolution pending (orchestrated)" for next-session catch-up
- If no stub: note the dropped task for Phase 6 verification
- Consider re-dispatching if the failure seems transient
- **Circuit breaker:** max 1 remediation attempt per failed task. If the
  remediation helper also fails, stop re-dispatching, report the failure to
  the user in Phase 6, and move on. Never re-dispatch the same task more
  than once.

**Future:** Steps 3-4 will be replaced by the evaluator agent.
