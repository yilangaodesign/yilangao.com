# Magic Words

Quick reference for trigger phrases that activate agent skills. Say any of these (or their aliases) to start the corresponding workflow.

> **Naming convention:** Every trigger must contain the noun it acts on. If the verb could apply to multiple skills, the noun disambiguates. (e.g., "pressure test **plan**", "content **stress test**", not just "pressure test" or "stress test".)

> **For agents:** Before adding a new trigger phrase, check this file for collisions. If two skills share a trigger, routing becomes ambiguous.

---

## Release & Deploy

| Say this | What happens | When to use it |
|----------|-------------|----------------|
| **"ship it"** | Analyzes uncommitted changes, batches into dependency-ordered commits, pushes, and hands off to checkpoint for version bump + merge to main. | You have local changes and want to release everything. |
| *Aliases:* "publish", "release everything", "push it live", "deploy everything", "go live" | | |

## Servers

| Say this | What happens | When to use it |
|----------|-------------|----------------|
| **"boot up"** | Probes ports, starts missing dev servers, waits for HTTP 200, updates the port registry. | You want to see the site on localhost. |
| *Aliases:* "start servers", "spin up", "fire up", "I can't see X on localhost" | | |

## Content Authoring

| Say this | What happens | When to use it |
|----------|-------------|----------------|
| **"write up"** | Activates the case study authoring skill (4-phase workflow: Analyze, Plan, Write, Review). Detects whether it's a new case study or a rebuild. | You have raw materials (notes, transcripts, project details) and want a case study, or you want to rebuild an existing one. |
| *Aliases:* "write this up", "draft this", "turn this into a case study", "redo this case study", "rebuild this case study", "apply the new framework to X" | | |

## Quality Gates (Self-Audit)

| Say this | What happens | When to use it |
|----------|-------------|----------------|
| **"pressure test plan"** | Adversarial audit of a plan or proposal against the actual codebase. Runs five checks: misplacement, conflicting logic, internal logic, edge cases, noise. Report-only. | After a plan is generated and you want to pressure-test it before executing. Works in any mode. |
| **"meta audit plan"** | Meta-audit of a plan's organization, sequencing, and readability from an executing agent's perspective. Report-only. | After plan logic is finalized and you want to check if it's structured well for execution. Works in any mode. |
| **"content stress test"** | Re-runs ALL review checks and anti-pattern tests against existing case studies using the current knowledge base. Auto-fixes only deterministic issues (em dashes, missing hero blocks); reports everything else. | After adding new rules or checks, to catch regressions in existing content. Requires write access. |
| *Aliases:* "fresh eyes", "recheck portfolio" | | |

## Knowledge Base Health

| Say this | What happens | When to use it |
|----------|-------------|----------------|
| **"docs health"** | Runs static analysis + AI-powered semantic review of the entire knowledge base. Finds broken references, duplicates, contradictions, orphaned files. | Periodically (every 7 days) or when docs feel inconsistent. |
| *Aliases:* "audit my docs", "check doc health" | | |

---

## Not Magic Words (Automatic Routing)

These phrases aren't triggers you need to memorize. The agent detects them automatically from your feedback and routes to the right skill:

- **"it looks wrong"** / visual complaints → Design iteration
- **"it doesn't work"** / data/build issues → Engineering iteration
- **"it's confusing"** / **"it's unclear"** → Design + Content iteration
- **"it doesn't read well"** → Content iteration
- Touching CMS fields → CMS parity check (automatic)
- Touching `src/` components → Cross-app parity check (automatic)
- Touching playground files → Playground skill (automatic)
- Generating portfolio UI (main site) → Branding reference check (automatic, route 16)
- Touching analytics code → Analytics reference + engineering spoke (automatic, route 17)
