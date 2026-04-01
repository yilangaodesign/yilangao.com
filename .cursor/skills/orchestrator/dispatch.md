# Phase 3: Dispatch

## Pre-Dispatch Decision Check

Before building context packages, confirm the decision check from the hub
(between Pre-Assign IDs and Phase 3) has passed. If any task was flagged as
high-risk or ambiguous during decomposition, the orchestrator must have already
surfaced a decision-only question to the user and received a response. Do not
dispatch helpers until all blocking decisions are resolved.

## Context Package Template

Every helper receives a dispatch prompt with these 10 items:

1. **`[ORCHESTRATED]` marker** — first line of the dispatch prompt. This triggers
   the override in AGENTS.md and the skip clauses in iteration skills.

2. **Task description** — scoped to this specific task, not the full user message.
   Be precise about what the helper should accomplish.

3. **Skill file(s)** — which skill(s) the helper should follow
   (e.g., `.cursor/skills/design-iteration/SKILL.md`).

4. **Files to read** — specific files the helper should read before starting
   implementation (e.g., relevant docs sections, existing component code).

5. **File boundary** — "You may modify: [explicit file list] and your designated
   feedback log file (`docs/design-feedback-log.md`). Do not modify anything else."

6. **Server ops instruction** — "If your work requires a server restart or sync
   script, include `## Server Operations Needed` in your response listing what's
   needed. Do NOT run them yourself."

7. **Pre-assigned log ID + stub-first instruction** — "Your log entry ID is
   `ENG-074`. BEFORE starting implementation, write a 2-line stub to the feedback
   log (e.g., `docs/engineering-feedback-log.md`): the entry header
   (`#### ENG-074: '[task title]'`) and
   `**Resolution pending (orchestrated)**`. This stub must exist before you write
   any code (per EAP-027). After implementation, include a full
   `## Draft Documentation` section in your response with the complete entry
   using this same ID."

8. **File manifest instruction** — "Include a `## Files Modified` section listing
   every file you created or changed."

9. **Success criteria** — what "done" looks like for this specific task.

10. **Hard Guardrails reminder** — "All Hard Guardrails from AGENTS.md apply.
    Key ones: no inline styles, no SVG for text, verify dark mode if touching
    colors, never edit main branch."

## Helper Type Mapping

| Task type                      | subagent_type    | Model   | Flags          |
|--------------------------------|------------------|---------|----------------|
| Implementation (code changes)  | generalPurpose   | default |                |
| Exploration / diagnosis        | explore          | fast    | readonly: true |
| Browser verification           | browser-use      | default |                |
| Shell commands / git ops       | shell            | fast    |                |

## TodoWrite Integration

Before dispatching helpers, create a visible checklist using TodoWrite:
- One todo per task, status `pending`
- Update to `in_progress` when dispatching each helper
- Update to `completed` when the helper returns successfully

## Dispatch Execution

- For parallel tasks: dispatch all in a single message with multiple Task tool calls
- For sequential tasks: dispatch one, wait for result, then dispatch next
- For hybrid: dispatch the parallel batch first, wait, then dispatch dependent tasks
