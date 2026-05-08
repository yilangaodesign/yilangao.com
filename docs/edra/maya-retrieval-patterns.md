# Maya's Retrieval Patterns

Derived from the user persona and design challenge context. These inform what the AI-assisted organization system needs to support — both during the initial setup flow and in ongoing use.

---

## Behavioral Cadences

### Reactive & High-Cadence (daily / multiple times per week)

Triggered by meetings, incidents, and staying current as a new lead.

| # | Action | Trigger |
|---|--------|---------|
| 1 | "What's the current state of [project]?" | VP reviews, sprint planning, 1:1s |
| 2 | "Have we seen this before?" (incident pattern match) | Production incidents |
| 3 | "What changed on [project] recently?" | Pre-meeting prep, avoiding looking uninformed |

### Investigative (as needed, variable frequency)

Drilling into specifics when building narratives or when trust breaks.

| # | Action | Trigger |
|---|--------|---------|
| 4 | "Find the [doc type] for [topic]" | Direct lookup — searches before browsing |
| 5 | "What's connected to this?" | Tracing threads across docs (postmortem → ADR → eval) |

### Maintenance-Cadence (weekly / sprint / quarterly)

Workspace hygiene, planning, and onboarding support.

| # | Action | Trigger |
|---|--------|---------|
| 6 | "What's stalled or unresolved?" | Sprint planning prep |
| 7 | "What's outdated or duplicated?" | Trust-breaking moments, hygiene sweeps |
| 8 | "What does a new person need to know about [project]?" | New hire joins (~quarterly) |

---

## Top 4 at Design Challenge Stage

The challenge places Maya at **first-time organization** — before any clustering has happened. She's in discovery and calibration mode, building enough understanding to give the system useful input without spending an hour doing it. All four actions are investigative in nature.

| # | Action | Why at this stage |
|---|--------|-------------------|
| 1 | "Show me documents about [project X]" | Giving the system example data. The model learns organization patterns from examples — her fastest path is to search for a project she knows, grab docs, and say "group like this." |
| 2 | "What types of documents do we have?" | Building a mental model of the landscape before choosing a clustering dimension (topic vs. project vs. doc type vs. recency). Scanning fast, not reading. |
| 3 | "Show me duplicates / docs about the same thing" | Spot-checking the mess to calibrate expectations. Confirms the clustering model will help. Gives the system signal. |
| 4 | "What's been untouched the longest?" | Identifying the stale tail for quick-win archival. Reduces scope from 600 to something manageable before investing in deeper organization. |

---

## Design Implications

- The **input phase** of the flow must support all four stage-specific actions without requiring Maya to know the system's internal model (dimensions, clustering parameters).
- The **output phase** must surface the reactive/high-cadence patterns — once organized, Maya's ongoing use is dominated by project status lookups and incident history.
- **Progressive disclosure** maps directly to her "reasoning on demand" value: default view serves reactive lookups; drill-down serves investigative and maintenance needs.
