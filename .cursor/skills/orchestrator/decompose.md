# Phase 2: Decompose + Plan

## Parsing the User Message into Discrete Tasks

**Signals for distinct tasks:**
- Numbered lists
- "and then", "also", comma-separated requests
- Session agendas ("today I want to...")
- Multiple sentences about different screens/features

**NOT distinct tasks:**
- Single feedback touching multiple categories (Step 0 handles this)
- A single complaint that spans design + engineering + content dimensions

For each task identified:
1. Identify its category (design, engineering, content, or mixed)
2. Predict which files it will read and write
3. Determine risk level (low: familiar pattern; high: new component/schema)

## Dependency Rules

- **Parallel** ONLY if write-file sets don't overlap
- Same-category tasks CAN run in parallel (pre-assigned IDs prevent stub collisions)
- If Task B reads a file Task A writes, B waits for A
- Tasks requiring a server restart are flagged — helpers report the need but do NOT restart themselves
- Documentation is always handled by the orchestrator (Phase 5), never by helpers
- **Checkpoint and doc-audit tasks MUST run last and exclusively** — they touch the entire repo or all doc files and cannot safely parallelize with anything

## Gate Identification Table

Replaces Pre-Flight routes 9/10/12 for orchestrated work. Based on which files
a task writes to, identify which gates apply:

| Task writes to                              | Gate that applies      | Gate skill file                             |
|---------------------------------------------|------------------------|---------------------------------------------|
| `src/components/ui/*` or `src/components/*` | Cross-app parity       | `.cursor/skills/cross-app-parity/SKILL.md`  |
| `src/globals/*` or `src/collections/*`      | CMS parity             | `.cursor/skills/cms-parity/SKILL.md`        |
| `playground/src/app/components/*`           | Playground validation  | `.cursor/skills/playground/SKILL.md`        |
| `src/styles/tokens/*`                       | Token sync             | Run `npm run sync-tokens` (server op)       |

These gates are NOT sent to helpers. The orchestrator runs them in Phase 4
after all implementation helpers have returned.

## Dispatchable Skills

| Skill | When to dispatch | Notes |
|-------|-----------------|-------|
| `content-iteration` | Specific content feedback on existing text | Standard content fixes |
| `design-iteration` | Visual, spacing, interaction feedback | Standard design fixes |
| `engineering-iteration` | Data, build, infra issues | Standard engineering fixes |
| `case-study-authoring` | Full case study creation or rebuild | Dual-entry (1a: raw materials, 1b: rebuild). If the authoring task identifies Tier 3 interactive artifacts (new components to build), the orchestrator must dispatch BOTH a content helper (authoring skill) and an engineering helper (component creation from the interactive component spec). |

## Output

After decomposition, produce:
1. A list of discrete tasks with categories and predicted file sets
2. A dependency graph (which tasks can parallel, which must sequence)
3. A list of applicable gates (from the table above)
4. Any tasks flagged for server operations
