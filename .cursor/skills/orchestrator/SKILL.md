---
name: orchestrator
description: >-
  Coordinates multi-task requests by decomposing, dispatching to helpers,
  collecting results, running gates, synthesizing documentation, and verifying
  completeness. Activate when Step 0 detects 3+ distinct tasks or 2 where one
  involves creation from scratch.
---

# Skill: Orchestrator

## When to Activate

Activate when Step 0 detects:
- 3+ distinct tasks, OR
- 2 distinct tasks where at least one involves creating a new component, page,
  or CMS collection from scratch.

Do NOT activate for:
- Single-task-multi-category feedback (Step 0 handles it with existing routing)
- 2 small edit tasks (single agent handles these faster)

## Phase Index

| Phase | What                         | Detail file               | When                 |
|-------|------------------------------|---------------------------|----------------------|
| 1     | Escalation check             | (inline)                  | Always               |
| 2     | Decompose + plan             | orchestrator/decompose.md | Always               |
| 3     | Dispatch                     | orchestrator/dispatch.md  | Always               |
| 4     | Collect + server ops + gates | orchestrator/collect.md   | After helpers return  |
| 5     | Synthesize docs              | orchestrator/document.md  | After gates pass     |
| 6     | Verify + report              | (inline)                  | Always               |

## Phase 1: Escalation Check (inline)

Read last 15 lines of each applicable feedback log (all categories that appear
across the user's tasks). Also read the frequency map appendix in
`engineering.md` / `design.md` / `content.md`.

If current task matches a pattern with 2+ hits (eng) or 3+ hits (design/content):
reframe the task from "fix X" to "diagnose architectural root cause of X."

## Between Phase 2 and Phase 3: Pre-Assign IDs

After decomposition identifies the discrete tasks and their categories,
pre-assign the next available log entry IDs (e.g., FB-070, ENG-074, CFB-021).
Read the latest entry in each relevant feedback log to determine the next ID.
Pass these IDs to helpers in Phase 3 dispatch.

## Between Pre-Assign IDs and Phase 3: Decision Check (inline)

After decomposition and ID assignment, check: does any task involve high risk
(new architecture, unfamiliar pattern) or ambiguity (unclear user intent,
multiple valid approaches)?

- If NO: proceed directly to Phase 3 dispatch.
- If YES: surface a concise, decision-only question to the user before
  dispatching. Keep it to one question with 2-3 options. Do not present the
  full decomposition — only the decision that blocks dispatch.
  After the user responds, proceed to Phase 3.

## Phase 6: Verify + Report (inline)

Re-read user's original message. For each distinct request, confirm a helper
addressed it. If anything was dropped, dispatch a remediation helper.

Report to user: concise summary of what was done (not how). Format:
- One bullet per completed task
- Any issues encountered and how they were resolved
- Any items that need user attention

## Future: Evaluator Hook

Phase 4 currently handles collection, server ops, and gates directly.
A future evaluator agent will take over quality assessment, testing, and gate
checks. Design the evaluator to receive helper results + file change manifests
and return approve/rework decisions. See [placeholder: orchestrator/evaluator-interface.md].

**Design risk (from Cursor's scaling-agents research):** Cursor found that an
integrator role for quality control and conflict resolution "created more
bottlenecks than it solved" at scale. At our scale (3-5 helpers, minutes not
weeks), the bottleneck risk is lower, but the evaluator should be designed as
a lightweight, time-bounded pass — not a blocking gate that re-reviews every
file. If it can't complete in under 30 seconds, reconsider the design.
See: https://cursor.com/blog/scaling-agents
