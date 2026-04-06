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

**Rebuild redirect (check first):**
If the feedback is a full rebuild request — not a specific text fix but "redo this
case study," "rebuild from scratch," "apply the new framework," or general
dissatisfaction with the entire case study — redirect to the `case-study-authoring`
skill at `.cursor/skills/case-study-authoring/SKILL.md` (Phase 1b: Rebuild). Do
not process a full rebuild through the iteration loop.

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
8. If the feedback touches a specific case study, also read the Portfolio Coherence Manifest (`docs/content/portfolio-coherence.md`) to check if the proposed edit would break portfolio-wide diversity on any of the six dimensions.

### Step 3: Diagnose Root Cause

If it's a new issue:
1. **Check which retention layer is failing** — Layer 1 (value verification), Layer 2 (engagement), or Layer 3 (conversion).
2. **Check the hiring manager mental model** — which segment is this optimizing for?
3. **Check the image-to-text ratio** — is the visual balance off?

### Step 4: Implement the Fix

- Follow the inverted pyramid - lead with outcome, not context.
- Maintain 80-85% visual, 15-20% text ratio.
- Every word must earn its place - cut generic language.
- Verify the fix reads correctly at the hiring manager's scan speed (15-60 seconds).

**When feedback targets a section title or blurb headline:** Headlines are a
different compositional level than body text. Do not apply body-text refinement
to headline-level problems. Read `personal-voice.md` Techniques 6-10 (headline
composition) and `case-study.md` §3.4 (title archetypes). Rewrite the title using
the selection heuristic from the case-study-authoring skill Phase 2 Step 4 and run
the Standalone Test before presenting the fix.

### Step 4b: Voice Refinement Protocol (when user provides raw draft text)

When the user provides replacement text - not just a complaint but actual
draft copy - the processing is different from a standard fix.

**Detection:** The user's message contains quotation marks or a block of text
that reads as draft copy (not instructions). Phrases like "I wrote this," "my
draft," "here's what I'd say," or raw text with grammatical roughness.

**Processing:**

1. Read the user's draft. Identify the register, rhythm, and devices.
2. Apply Tier 1 constraints (see `personal-voice.md` Part C): banned words,
   em dashes, thesis coherence, word counts, no credential performance.
3. Preserve Tier 2 elements: fragment density, rhetorical questions, cultural
   references, informal grammar that carries personality, sentence rhythm.
4. Tighten logic where the draft drifts from the thesis - but tighten the
   CONNECTION, don't cut the drift. The drift may reveal how the user thinks.
5. Fix grammar errors: typos, unclear antecedents, subject-verb disagreement.
   Do NOT fix informalities that carry voice ("Me too." stays as-is).
6. **Voice-flattening test:** Compare the refined version against the original
   draft. If the refined version is less vivid, less specific, or less personal,
   the refinement over-corrected. Restore the original's energy.

**The rule:** When a Tier 2 constraint conflicts with the user's draft, the
user's draft wins.

See `personal-voice.md` Part C for the full Tier 1/Tier 2 definition and the
voice-flattening test. See also CAP-023 in `docs/content-anti-patterns.md`.

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

6. **Update the project dossier** (if the feedback touches a specific case study):
   - Check if `docs/content/projects/{slug}.md` exists. If it doesn't and this is
     the 3rd+ feedback entry for this project, create one by synthesizing existing
     log entries.
   - **Tiered updates** (not every edit warrants a full dossier entry):
     - *Always:* Append one line to the Evolution Timeline section.
     - *On explicit praise:* Add to Positive Signals. Classify as Type A
       (content-specific — recyclable only if future thesis demands it) or Type B
       (principle-level — always transferable).
     - *On explicit frustration/rejection:* Add to Frustration Log with root cause.
     - *On thesis change or significant structural pivot:* Update Current State;
       archive old thesis in Evolution Timeline.
     - *On interactive visual change:* Update Interactive Visual History.
   - When a style preference pattern emerges (same correction 2+ times for this
     project), add to Style Preferences.

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
| `docs/content/personal-voice.md` | Named voice techniques, refinement protocol | When user provides raw draft text (Step 4b) | Never (spoke) |
| `docs/content/projects/{slug}.md` | Per-project dossier (evolution, signals, frustrations) | When feedback targets a specific case study | After resolving feedback (tiered — see Step 5.6) |
