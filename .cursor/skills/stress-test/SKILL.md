---
name: stress-test
description: >-
  Retroactive evaluation of all active case studies against the current
  knowledge base. Runs ALL review checks and CAP pattern-matching,
  auto-fixes deterministic issues from an explicit allowlist, and reports
  everything else. Requires write access (modifies files, pushes to CMS).
  Use when the user says "content stress test" or "fresh eyes" after new
  rules have been added.
---

# Skill: Retroactive Content Stress Test

Re-evaluates all active case studies through the lens of the current knowledge base. Runs every check and anti-pattern test, auto-fixes only deterministic issues from a strict allowlist, and reports everything else for user decision.

## When to Activate

- User says "content stress test", "fresh eyes", "recheck portfolio"
- Active case studies exist in the CMS
- Typically after a session that added new checks, anti-patterns, or refined existing rules
- Requires write access (modifies route files, pushes to CMS). If in a read-only mode, note the requirement and let the user/system handle the transition.

## Step 1: Inventory Current Evaluation Criteria

Read the full knowledge base that drives evaluation:

- `docs/content/case-study-review.md` (all checks)
- `docs/content-anti-patterns.md` (all active CAPs)
- `docs/content/voice-style.md` (metric handling rules)
- `docs/content/self-audit.md` (all layers)
- `docs/content/portfolio-coherence.md` (diversity manifest)

## Step 2: Read Each Active Case Study

For each project listed in the Portfolio Coherence Manifest, read:

- The update route file (`src/app/(frontend)/api/update-{slug}/route.ts`) for the actual content
- The project dossier (`docs/content/projects/{slug}.md`) for the last evaluation date
- The `page.tsx` static maps (`src/app/(frontend)/work/[slug]/page.tsx`) for hero metrics, inline links, interactive visuals

## Step 3: Run the Full Review Checklist

- Execute ALL checks from `case-study-review.md` against each case study, using the CURRENT knowledge base
- Run ALL active CAP pattern-matching against all portfolio text
- Run the self-audit framework (Layers 1-3) across the portfolio
- Run the portfolio coherence diversity assessment

## Step 4: Triage Findings Using the Mechanical Fix Allowlist

For each failure, classify using the allowlist:

**Mechanical (auto-fix) — ONLY these:**
- CAP-022 (em dash removal): replace with space-dash-space or split sentences
- Check 16 (hero block presence): add missing hero block as first content block
- Structural formatting issues (heading levels, block ordering)

**Everything else -> Report to user.** This includes:
- Check 17 (metric anchoring)
- Voice/headline issues
- Scope statement changes
- Any fix that requires choosing words

Content writing goes through the content-iteration skill's voice refinement protocol, not through automated patching.

## Step 5: Execute Mechanical Fixes (Allowlisted Only)

For each mechanical fix:
1. Update the route file with the corrected content
2. Call the POST endpoint to push to CMS
3. Verify delivery (curl the page, confirm the change landed)

## Step 6: Report

- Summary: N checks run, N passed, N auto-fixed, N flagged for user
- Per flagged item: the check that failed, what the content currently says, what the rule requires, resolution options
- Per auto-fix: what was changed, which rule drove the change, verification status

## Step 7: Abbreviated Post-Flight

Append ONE summary entry to `docs/content-feedback-log.md`:

```markdown
#### CFB-NNN: "Stress test run — [date]"

**Intent:** Retroactive evaluation of all case studies against current knowledge base
**Checks run:** [N] across [N] case studies
**Auto-fixes applied:** [list of mechanical fixes, if any]
**Flagged for user:** [count and brief list]
```

Do NOT update `content.md`, anti-patterns, or any other doc. The knowledge base drove the test; it does not change from the test.

## What This Skill Does NOT Do

- Does not rebuild case studies (that is the case-study-authoring skill)
- Does not make voice/strategy decisions
- Does not modify the knowledge base itself (no new CAPs or checks)
- Does not auto-fix anything outside the mechanical fix allowlist
- Does not interact with the orchestrator

## File Map

| File | Purpose | Read When | Write When |
|------|---------|-----------|------------|
| `docs/content/case-study-review.md` | Review checks | Step 1 | Never |
| `docs/content-anti-patterns.md` | CAP catalog | Step 1 | Never |
| `docs/content/voice-style.md` | Metric handling rules | Step 1 | Never |
| `docs/content/self-audit.md` | Retention layer audit | Step 1 | Never |
| `docs/content/portfolio-coherence.md` | Diversity manifest | Step 1 | Never |
| `src/app/(frontend)/api/update-*/route.ts` | Case study content | Step 2 | Step 5 (mechanical fixes) |
| `docs/content/projects/*.md` | Project dossiers | Step 2 | Never |
| `src/app/(frontend)/work/[slug]/page.tsx` | Static maps | Step 2 | Never |
| `docs/content-feedback-log.md` | Feedback history | Never | Step 7 (summary entry) |
