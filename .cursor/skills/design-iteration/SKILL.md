---
name: design-iteration
description: >-
  Processes user design feedback through a structured loop: parse intent,
  check existing knowledge, diagnose root cause, implement fix, close the
  loop with documentation. Use when the user gives visual, spacing,
  interaction, or layout feedback.
---

# Skill: Design Iteration Feedback Loop

## Processing User Feedback

When the user gives design feedback, follow this protocol:

### Step 1: Parse the Intent

Don't just fix the surface-level complaint. Ask:
- **What design principle is being violated?** (spacing, hierarchy, theming, layout, responsiveness)
- **Why does this matter to a UX designer?** (trust, professionalism, usability, consistency)
- **Is this the same category as a previous complaint?** (check feedback log)

**Cross-category check (mandatory):**
> If `[ORCHESTRATED]`: skip this cross-category check. The orchestrator already
> decomposed the request into category-specific tasks.

Before proceeding, ask: **does this feedback also have an engineering or content dimension?** A visual/UX complaint about forms, labels, or interactions often implies:
- An **engineering** issue (missing data field, broken save flow, wrong schema)
- A **content** issue (poor labels, bad microcopy, unclear instructions)
- If other dimensions exist, note them now. You will document them in Step 5.

### Step 2: Check Existing Knowledge

Before making changes:
1. Read `docs/design.md` Section Index — identify sections matching this feedback category.
2. Read §0 (Design Posture) from the hub file.
3. Read the matching spoke file(s) from `docs/design/` (the Section Index has a File column pointing to each spoke).
4. Read `docs/design-anti-patterns.md` (focus on active entries).
5. Read the first 30 lines of `docs/design-feedback-log.md` (most recent entries) for recurring pattern detection.
6. If a documented solution exists, **apply it directly** — don't re-derive.

### Step 3: Diagnose Root Cause

If it's a new issue:
1. **Check architecture first** — CSS cascade layers, build output, layout model.
2. **Check token resolution** — are utilities generating `var()` references or hardcoded values?
3. **Check computed styles in mental model** — will the classes actually produce the expected pixel values?
4. Only after architectural checks pass, consider adjusting token values.

### Step 4: Implement the Fix

- Use design tokens / Tailwind classes only. Never inline styles.
- Verify the fix works in both light and dark mode (if touching colors/backgrounds).
- Verify at multiple viewport widths (if touching spacing/layout).

### Step 5: Close the Loop — Update Documentation

After resolving the feedback:

1. **Append to `docs/design-feedback-log.md`** (newest first):
   ```markdown
   #### FB-NNN: "[First 10 words of user message]"

   **UX Intent:** [Why this matters from a design perspective]
   **Root Cause:** [Technical reason it happened]
   **Resolution:** [What was done to fix it]
   **Pattern extracted → `design.md` §N.N: [Section reference]**
   ```

2. **Update `docs/design.md`** if the feedback reveals:
   - A new design principle not yet documented
   - A refinement to an existing principle
   - A new concrete value or pattern to reference

3. **Update `docs/design-anti-patterns.md`** if the feedback reveals:
   - A code pattern that should never be used
   - A debugging sequence that wasted time
   - A workaround that bypassed the token system

4. **Update the frequency map** in `design.md` Appendix if a category gets another hit.

5. **Cross-category documentation (if Step 1 identified other dimensions):**
   - If engineering dimension exists → also append to `docs/engineering-feedback-log.md` and check `docs/engineering-anti-patterns.md`
   - If content dimension exists → also append to `docs/content-feedback-log.md` and check `docs/content-anti-patterns.md`
   - Each cross-category entry should include a "Cross-category note" referencing the design entry (e.g., "Also documented as FB-NNN")

## Escalation Triggers

If the user raises the **same category** of issue 3+ times in one session:
- **STOP adding more of the same fix.**
- The problem is architectural, not incremental.
- Diagnose from the CSS cascade / build system / layout model level.
- Document the root cause prominently in `design-anti-patterns.md`.

## Session Closeout

At the end of a session that involved design feedback:
1. Verify all feedback log entries are written.
2. Verify `design.md` reflects any new principles discovered.
3. Update the "Last updated" date on all modified docs.

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
| `docs/design.md` | Accumulated design principles | Before any UI work | After processing feedback |
| `docs/design/*.md` | Topic-specific design principles (spokes) | When the Section Index points to a matching topic | After processing feedback |
| `docs/design-feedback-log.md` | Chronological feedback history | Session start, during feedback | After each feedback resolution |
| `docs/design-anti-patterns.md` | Things to never do | Before writing code | After discovering a new anti-pattern |
