---
name: plan-audit
description: >-
  Adversarial audit that compares a proposed plan or proposal against the
  existing codebase and knowledge graph. Finds misplacement, conflicting
  logic, internal inconsistencies, edge cases, and unnecessary noise.
  Report-only — never modifies files, works in any mode. Use when the user
  says "pressure test plan".
---

# Skill: Adversarial Plan Audit

Compares a plan or proposal against the existing codebase and knowledge graph from a contrarian perspective. Produces a structured findings report; never modifies files or makes strategic decisions.

## When to Activate

- User says "pressure test plan"
- A plan, proposal, or set of proposed changes exists in the conversation context (as a `.plan.md` file, as a proposed approach in the conversation, or as changes the agent just described)
- Works in any IDE mode (plan, agent, ask). This skill is read-only by design.

## Step 1: Extract the Plan's Footprint

Parse every file path, section reference, and skill reference mentioned in the plan. Classify the plan's domain(s) using the Pre-Flight routing categories from AGENTS.md:

- References `docs/content/*.md`, case study routes, content skills -> **Content**
- References `src/`, `docs/engineering*.md`, build/infra -> **Engineering**
- References `docs/design*.md`, `src/components/ui/`, `src/styles/` -> **Design**
- Multiple categories -> **Mixed** (read all applicable hub + spoke docs)

## Step 2: Build the Dependency Graph (Depth-1 Only)

For each file the plan modifies, identify files that DIRECTLY reference it (downstream dependents). For each file the plan reads, identify files it DIRECTLY references (upstream dependencies).

**Depth cap: 1 level.** Do not chase transitive dependencies. If A modifies B which is referenced by C which is referenced by D, only read B and C. D is out of scope. Conflicts at depth 2+ surface when those files are next used in a task.

Sources for dependency discovery:
- `AGENTS.md` Pre-Flight routes (which skills read which docs)
- Skill file maps (`## File Map` tables at the bottom of each skill)
- `## Cross-references` sections in spoke docs
- Hub file Section Indexes (`docs/content.md`, `docs/design.md`, `docs/engineering.md`)

## Step 3: Read and Compare

Read every file in the footprint + depth-1 dependency graph. For each proposed change in the plan, compare against what currently exists in the file.

## Step 4: Run the Five-Check Adversarial Audit

| Check | What to look for |
|-------|-----------------|
| Misplacement | Plan puts information in a file where a Pre-Flight-routed agent would NOT look. Would it be more discoverable in a different file? |
| Conflicting logic (plan vs existing) | Plan contradicts a codified rule, anti-pattern, or principle. Redefines a concept that already has a canonical definition elsewhere. |
| Internal unsound logic | Steps within the plan contradict each other. Circular dependencies between phases. |
| Edge cases | Inputs or scenarios that would break the proposed changes. Workflow paths not accounted for. |
| Unnecessary noise | Content that would distract an executing agent. Redundancy with what already exists. Sections that could be shorter. |

## Step 5: Output

- Structured findings table: check name, severity (critical / warning / info), finding, affected files
- Clarifying questions for the user where the finding requires strategic judgment
- For each critical finding: explain the conflict and suggest resolution options

## What This Skill Does NOT Do

- Does not modify any files (report-only)
- Does not execute the plan
- Does not make strategic decisions (defers to user via questions)
- Does not generate feedback log entries (Post-Flight: SKIP — audits are meta-work, not task work)
- Does not interact with the orchestrator

## File Map

| File | Purpose | Read When | Write When |
|------|---------|-----------|------------|
| `AGENTS.md` | Pre-Flight routes, routing vocabulary | Step 1 (domain classification) | Never |
| `docs/content.md` / `design.md` / `engineering.md` | Hub Section Indexes | Step 2 (dependency discovery) | Never |
| `docs/content/*.md` / `design/*.md` | Spoke files | Step 3 (compare against plan) | Never |
| `docs/*-anti-patterns.md` | Anti-pattern catalogs | Step 3 (conflict detection) | Never |
| `.cursor/skills/*/SKILL.md` | Existing skill file maps | Step 2 (dependency discovery) | Never |
| The plan file (`.plan.md`) | The plan being audited | Step 1 (footprint extraction) | Never |
