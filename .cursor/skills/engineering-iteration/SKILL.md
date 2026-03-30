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

**Cross-category check (mandatory):** Before proceeding, ask: **does this feedback also have a design or content dimension?** User feedback about "confusing UI", "unclear fields", "bad labels", or "missing instructions" is almost always multi-dimensional:
- A confusing form is a **design** issue (missing labels, bad affordances) AND possibly a **content** issue (poor microcopy, database names as user-facing labels) AND an **engineering** issue (missing schema fields).
- If other dimensions exist, note them now. You will document them in Step 5.

### Step 2: Check Existing Knowledge

Before writing code:
1. Read the **full** `docs/engineering.md` — not just the Section Index. Incident processing requires complete context, even if pre-flight only loaded one section.
2. Read `docs/engineering-anti-patterns.md` for matching anti-patterns.
3. If a documented solution exists, **apply it directly** — don't re-derive.

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

## File Map

| File | Purpose | Read When | Write When |
|------|---------|-----------|------------|
| `docs/engineering.md` | Accumulated engineering principles | Before any code work | After processing incidents |
| `docs/engineering-feedback-log.md` | Chronological incident history | Session start, during incidents | After each incident resolution |
| `docs/engineering-anti-patterns.md` | Things to never do | Before writing code | After discovering a new anti-pattern |
| `docs/port-registry.md` | Live port assignments | Before starting any server | After starting/stopping servers |
