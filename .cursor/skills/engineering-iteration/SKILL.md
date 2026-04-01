---
name: engineering-iteration
description: >-
  Processes engineering incidents through a structured loop: parse the
  issue, check existing knowledge, diagnose root cause, implement fix,
  close the loop with documentation. Use when something is broken, data
  doesn't save, builds fail, or infrastructure misbehaves.
---

# Skill: Engineering Iteration Feedback Loop

## Processing Engineering Feedback

When the user reports a bug or engineering issue, follow this protocol:

### Step 1: Parse the Issue

Don't just fix the surface symptom. Ask:
- **Is this a data sync issue?** (source changed but consumer wasn't updated)
- **Is this a cross-app parity issue?** (infrastructure added to one app but not the other — see `engineering.md` §6)
- **Is this a process issue?** (server not running, wrong port, stale build)
- **Is this an architecture issue?** (the system design makes this failure possible)
- **Is this the same category as a previous incident?** (check feedback log)

**Cross-category check (mandatory):**
> If `[ORCHESTRATED]`: skip this cross-category check. The orchestrator already
> decomposed the request into category-specific tasks.

Before proceeding, ask: **does this feedback also have a design or content dimension?** User feedback about "confusing UI", "unclear fields", "bad labels", or "missing instructions" is almost always multi-dimensional:
- A confusing form is a **design** issue (missing labels, bad affordances) AND possibly a **content** issue (poor microcopy, database names as user-facing labels) AND an **engineering** issue (missing schema fields).
- If other dimensions exist, note them now. You will document them in Step 5.

### Step 2: Check Existing Knowledge

Before making changes:
1. Read `docs/engineering.md` Section Index — identify sections matching this incident.
2. Read §0 (Engineering Posture) from the hub file.
3. Read the matching spoke file(s) from `docs/engineering/` (the Section Index has a File column pointing to each spoke).
4. Read `docs/engineering-anti-patterns.md` (focus on active entries).
5. Read the first 30 lines of `docs/engineering-feedback-log.md` (most recent entries) for recurring pattern detection.
6. If a documented solution exists, **apply it directly** — don't re-derive.

### Step 3: Reproduce and Diagnose

1. **Reproduce the issue** — curl the URL, check terminal output, read error logs.
2. **Check the obvious** — is the server running? Right port? Did the file save?
3. **Trace data flow** — from source file → build/bundler → server → browser.
4. **Check sync points** — if data exists in multiple files, are they all up to date?
5. Only after infrastructure checks pass, look at the code logic.

### Step 4: Implement the Fix

- Fix the immediate issue.
- If the fix reveals a missing automation (e.g., manual sync needed), create the automation.
- Verify the fix on localhost — curl the page, check rendered output.
- If the fix touches shared data, run the appropriate sync script.

### Step 5: Close the Loop — Update Documentation

After resolving the issue:

1. **Append to `docs/engineering-feedback-log.md`** (newest first):
   ```markdown
   #### ENG-NNN: "[First 10 words of user message]"

   **Issue:** [What the user observed]
   **Root Cause:** [Technical reason it happened]
   **Resolution:** [What was done to fix it]
   **Principle extracted -> `engineering.md` §N.N: [Section reference]**
   **Cross-category note:** [If Step 1 identified design/content dimensions, reference them here]
   ```

2. **Update `docs/engineering.md`** if the incident reveals:
   - A new engineering principle not yet documented
   - A refinement to an existing principle
   - A new command, script, or pattern to reference

3. **Update `docs/engineering-anti-patterns.md`** if the incident reveals:
   - A code or process pattern that should never be used
   - A debugging sequence that wasted time
   - A manual process that should be automated

4. **Update the frequency map** in `engineering.md` Appendix if a category gets another hit.

5. **Cross-category documentation (if Step 1 identified other dimensions):**
   - If design dimension exists → also append to `docs/design-feedback-log.md` and check `docs/design-anti-patterns.md`
   - If content dimension exists → also append to `docs/content-feedback-log.md` and check `docs/content-anti-patterns.md`
   - Each cross-category entry should include a "Cross-category note" referencing the engineering entry (e.g., "Also documented as ENG-NNN")

## Escalation Triggers

If the user raises the **same category** of issue 2+ times in one session:
- **STOP applying incremental fixes.**
- The problem is architectural — the system design allows this class of failure.
- Create an automation (script, rule, guard) that makes the failure impossible.
- Document the systemic fix prominently in `engineering.md`.

## Session Closeout

At the end of a session that involved engineering incidents:
1. Verify all feedback log entries are written.
2. Verify `engineering.md` reflects any new principles discovered.
3. Verify any new sync scripts or automations are working.
4. Update the "Last updated" date on all modified docs.

## Operating Under Orchestrator Dispatch

When `[ORCHESTRATED]` appears in your context:
- BEFORE implementation: write the 2-line stub to the feedback log using the
  pre-assigned ID from your dispatch instructions (entry header + "Resolution
  pending (orchestrated)"). This must happen before any code changes (per EAP-027).
- Follow Steps 1-4 as normal (except skip the cross-category check in Step 1)
- Replace Step 5 with:
  1. Include a full `## Draft Documentation` section in your response (using the same pre-assigned ID)
  2. Include a `## Files Modified` section listing every file you created or changed
  3. Include a `## Server Operations Needed` section if applicable
- Do NOT write to any docs/ files other than the initial 2-line stub

## File Map

| File | Purpose | Read When | Write When |
|------|---------|-----------|------------|
| `docs/engineering.md` | Accumulated engineering principles | Before any code work | After processing incidents |
| `docs/engineering/*.md` | Topic-specific engineering principles (spokes) | When the Section Index points to a matching topic | After processing feedback |
| `docs/engineering-feedback-log.md` | Chronological incident history | Session start, during incidents | After each incident resolution |
| `docs/engineering-anti-patterns.md` | Things to never do | Before writing code | After discovering a new anti-pattern |
| `docs/port-registry.md` | Live port assignments | Before starting any server | After starting/stopping servers |
