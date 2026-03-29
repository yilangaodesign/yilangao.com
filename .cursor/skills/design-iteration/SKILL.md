# Skill: Design Iteration Feedback Loop

## Processing User Feedback

When the user gives design feedback, follow this protocol:

### Step 1: Parse the Intent

Don't just fix the surface-level complaint. Ask:
- **What design principle is being violated?** (spacing, hierarchy, theming, layout, responsiveness)
- **Why does this matter to a UX designer?** (trust, professionalism, usability, consistency)
- **Is this the same category as a previous complaint?** (check feedback log)

### Step 2: Check Existing Knowledge

Before writing code:
1. Search `docs/design.md` for the relevant section.
2. Search `docs/design-anti-patterns.md` for matching anti-patterns.
3. If a documented solution exists, **apply it directly** — don't re-derive.

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

## File Map

| File | Purpose | Read When | Write When |
|------|---------|-----------|------------|
| `docs/design.md` | Accumulated design principles | Before any UI work | After processing feedback |
| `docs/design-feedback-log.md` | Chronological feedback history | Session start, during feedback | After each feedback resolution |
| `docs/design-anti-patterns.md` | Things to never do | Before writing code | After discovering a new anti-pattern |
