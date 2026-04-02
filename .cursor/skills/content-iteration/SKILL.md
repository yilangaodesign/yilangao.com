---
name: content-iteration
description: >-
  Processes user content feedback through a structured loop: parse intent,
  check existing knowledge, diagnose root cause, implement fix, close the
  loop with documentation. Use when the user gives feedback about portfolio
  copy, case studies, labels, microcopy, or content strategy.
---
# Skill: Content Iteration Feedback Loop

## Processing User Feedback

When the user gives content feedback, follow this protocol:

### Step 1: Parse the Intent

Don't just fix the surface-level complaint. Ask:
- **What content principle is being violated?** (clarity, specificity, visual economy, seniority signal)
- **Why does this matter to a hiring manager?** (conversion, engagement, credibility)
- **Is this the same category as a previous complaint?** (check feedback log)

**Cross-category check (mandatory):**
> If `[ORCHESTRATED]`: skip this cross-category check. The orchestrator already
> decomposed the request into category-specific tasks.

Before proceeding, ask: **does this feedback also have a design or engineering dimension?**
- If design dimension exists, note it now. You will document it in Step 5.
- If engineering dimension exists (CMS field, data sync), note it now.

### Step 2: Check Existing Knowledge

Before making changes:
1. Read `docs/content.md` Section Index — identify the spoke file(s) matching this feedback.
2. Read §0 (Content Posture) from the hub (always).
3. Read the matching spoke file(s) from `docs/content/` (e.g., `docs/content/case-study.md` for case study feedback).
4. Read `docs/content-anti-patterns.md` for matching anti-patterns.
5. Read the first 30 lines of `docs/content-feedback-log.md` (most recent entries) for recurring patterns.
6. If the feedback touches an area covered by archived entries, skim `docs/content-feedback-synthesis.md` (when it exists) for historical context.
7. If a documented solution exists, **apply it directly** — don't re-derive.

### Step 3: Diagnose Root Cause

If it's a new issue:
1. **Check which retention layer is failing** — Layer 1 (value verification), Layer 2 (engagement), or Layer 3 (conversion).
2. **Check the hiring manager mental model** — which segment is this optimizing for?
3. **Check the image-to-text ratio** — is the visual balance off?

### Step 4: Implement the Fix

- Follow the inverted pyramid — lead with outcome, not context.
- Maintain 80-85% visual, 15-20% text ratio.
- Every word must earn its place — cut generic language.
- Verify the fix reads correctly at the hiring manager's scan speed (15-60 seconds).

### Step 5: Close the Loop — Update Documentation

After resolving the feedback:

1. **Append to `docs/content-feedback-log.md`** (newest first):
   ```markdown
   #### CFB-NNN: "[First 10 words of user message]"

   **Intent:** [Why this matters from a content strategy perspective]
   **Root Cause:** [Why the content was weak]
   **Resolution:** [What was done to fix it]
   **Pattern extracted → `content.md` §N.N: [Section reference]**
   ```

2. **Update `docs/content.md`** if the feedback reveals a new content principle or refines an existing one.

3. **Update `docs/content-anti-patterns.md`** if the feedback reveals a content pattern to avoid.

4. **Update the frequency map** in `content.md` Appendix if a category gets another hit.

5. **Cross-category documentation (if Step 1 identified other dimensions):**
   - If design dimension exists → also append to `docs/design-feedback-log.md`
   - If engineering dimension exists → also append to `docs/engineering-feedback-log.md`

## Escalation Triggers

If the user raises the **same category** of content issue 3+ times:
- **STOP adding incremental copy fixes.**
- The problem is structural — the content architecture needs rethinking.
- Diagnose from the retention layer / hiring manager mental model level.

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
| `docs/content.md` | Content strategy hub (Section Index + §0 Posture) | Before any content work (always) | After processing feedback (update frequency map) |
| `docs/content/*.md` | Spoke files: conversion funnel, homepage, case study, visual economy, language patterns, seniority signals, internal tools, project selection, about page, portfolio lifecycle, self-audit, reference portfolios | Read the spoke matching the feedback topic | After updating a content principle |
| `docs/content-feedback-log.md` | Chronological feedback history (30 most recent entries) | Session start, during feedback | After each feedback resolution |
| `docs/content-anti-patterns.md` | Things to never do | Before writing content | After discovering a new anti-pattern |
| `docs/content-feedback-synthesis.md` | Distilled lessons from archived entries | When historical context needed | When archiving entries reveals new patterns |
