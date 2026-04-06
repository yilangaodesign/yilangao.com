---
name: plan-structure
description: >-
  Meta-audit evaluating a plan's organization, sequencing, context
  sufficiency, and proportionality from the perspective of an executing
  agent. Report-only — never modifies files, works in any mode. Use when
  the user says "meta audit plan" after plan logic is finalized.
---

# Skill: Plan Structure Meta-Audit

Evaluates whether a plan is structured well enough for an executing agent to immediately grasp the goal, understand the sequence, and execute without backtracking. Does not evaluate logical correctness (that is the plan-audit skill's job).

## When to Activate

- User says "meta audit plan"
- A plan, proposal, or set of proposed changes exists and its logical content is finalized (the plan-audit skill may or may not have run first)
- Works in any IDE mode (plan, agent, ask). This skill is read-only by design.

## Step 1: Evaluate Context Sufficiency

- Could an agent with NO prior conversation context execute this plan?
- Is the "why" (problem statement, goal) clearly stated before the "what" (execution steps)?
- Are rejection decisions explained with reasoning, or just listed?

## Step 2: Evaluate Dependency Ordering

- Map the dependency graph between plan phases/steps
- Are infrastructure items (new files, new vocabulary) created before they are referenced?
- Are rules codified before content patches that should follow those rules?
- Are documentation updates ordered after the changes they document?

## Step 3: Evaluate Agent Readability

- Is there a clear separation between "context for understanding" and "instructions for executing"?
- Are appendices/rationale sections clearly marked as skippable by an executing agent?
- Are shared concepts (used by multiple steps) defined once and referenced, not repeated?
- Is the todo list ordered to match the execution phases?

## Step 4: Evaluate Proportionality

- Is the plan's length proportional to the task complexity?
- Are there sections that could be condensed without losing actionable information?
- Are there implicit assumptions that should be made explicit?

## Step 5: Output

- Structural findings with specific recommendations
- Suggested reordering if dependency violations exist
- Suggested condensation if sections are disproportionately verbose

## What This Skill Does NOT Do

- Does not evaluate the plan's logical correctness (that is the plan-audit skill)
- Does not modify any files (report-only — the user decides whether to restructure)
- Does not generate feedback log entries (Post-Flight: SKIP — audits are meta-work, not task work)
- Does not interact with the orchestrator

## File Map

| File | Purpose | Read When | Write When |
|------|---------|-----------|------------|
| The plan file (`.plan.md`) | The plan being audited | All steps | Never |

This skill reads only the plan itself. It does not need to read the codebase — codebase comparison is the plan-audit skill's job.
