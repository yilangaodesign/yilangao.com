# Engineering — Accumulated Knowledge

> **What this file is:** The hub of the engineering knowledge base for yilangao.com. Detailed topic sections live in `docs/engineering/*.md` spoke files; this hub contains the Section Index, meta-principles, and the incident frequency map. Every principle here was extracted from real incidents, debugging sessions, and process failures.
>
> **Who reads this:** AI agents routed here by `AGENTS.md` Pre-Flight. Read the Section Index first, then follow the link to the spoke file matching your task.
> **Who writes this:** AI agents after processing engineering feedback via the `engineering-iteration` skill.
> **Last updated:** 2026-03-30 (hub-and-spoke restructure)

---

## Section Index — Read This First

| § | Topic | File | Read when |
|---|-------|------|-----------|
| §0 | Engineering Posture | *(this file)* | Always for infra/build work |
| §1 | Localhost Verification | `docs/engineering/localhost-verification.md` | Starting servers, verifying |
| §2 | Port Management | `docs/engineering/port-management.md` | Starting/stopping servers |
| §3 | Token Sync | `docs/engineering/token-sync.md` | Modifying tokens, sync scripts |
| §4 | Debugging Methodology | `docs/engineering/debugging.md` | Diagnosing issues |
| §5 | Process Principles | *(this file)* | Meta — how to approach changes |
| §6 | Git Branching | `docs/engineering/git-branching.md` | Branch questions, commits |
| §7 | Cross-App Parity | `.cursor/skills/cross-app-parity/SKILL.md` | Adding deps, fonts, infra |
| §8 | Knowledge Enforcement | *(this file)* | Recurring incidents |
| §9 | Multi-App Architecture | `docs/engineering/multi-app-architecture.md` | Adding routes, new apps |
| §10 | Versioning (Élan) | `docs/engineering/versioning.md` | Version bumps, releases |
| §11 | CMS-Frontend Parity | `.cursor/skills/cms-parity/SKILL.md` | Adding/renaming CMS fields |
| §12 | Media Storage | `docs/engineering/storage.md` | Uploading files, storage |
| §13 | Deployment Verification | `docs/engineering/deployment.md` | Deploying, checking Vercel, build failures |
| App. | Frequency Map | *(this file)* | Checking recurring patterns |

---

## 0. Engineering Posture

**Treat every change as live.** This is not a static codebase — multiple dev servers, experiments, and the playground may be running simultaneously. Every code change must be verified on localhost. Every process must be aware of what else is running. Every data source must have exactly one canonical definition.

- **Localhost is non-negotiable.** If it's not running and rendering correctly on localhost, the change isn't done.
- **Port awareness is mandatory.** Read `docs/port-registry.md` before starting any server. Never kill processes blindly.
- **Single source of truth for data.** When the same data exists in multiple files, there must be an automated sync mechanism — not human discipline.
- **Verify after every change.** curl the page, check the terminal for errors, spot-check the rendered output.

---

## How to Use This File

1. **Read the Section Index above** — match your task to a section, follow the link to the spoke file or skill.
2. **If the user reports a bug**, activate the `engineering-iteration` skill — it will handle full doc reading.
3. **After resolving an issue**, update the relevant spoke file: strengthen existing principles or add new ones.
4. **Do NOT read the entire file** unless the skill protocol requires it.

---

## 5. Process Principles

### 5.1 One Change, One Verification

Every code change should be followed by a verification step. Don't batch multiple unrelated changes and then discover one of them broke something.

### 5.2 Read the Engineering.md First

Before writing code, read this file. If the user's issue maps to an existing principle, apply the documented solution immediately.

### 5.3 Self-Learning System

This documentation evolves from real incidents. When a new failure mode is discovered:
1. Fix the immediate problem.
2. Document the principle in this file.
3. Document the anti-pattern in `engineering-anti-patterns.md`.
4. If the failure was caused by a process gap, automate the gap away (scripts, rules, guardrails).

---

## 8. Knowledge Enforcement (Rules Layer vs. Docs Layer)

**Severity: Critical** — The cross-app parity category recurred 3 times (ENG-002, ENG-003, ENG-004) despite being documented after the first incident.

### 8.1 The Problem

Engineering principles documented in `docs/engineering.md` are read by agents at session start, but long documents get diluted. The agent retains the general idea but forgets specific checklist items when deep in implementation. This is especially true for cross-cutting concerns (like "also update the playground") that aren't directly related to the task at hand.

### 8.2 The Rule

When the same category of incident occurs **3 or more times**, the fix is not to add more documentation. The fix is to **promote the check from docs to the rules layer**:

1. Add it to `AGENTS.md` Hard Guardrails (NEVER/ALWAYS list).
2. If it's part of a workflow (e.g., artifact creation), add it as a mandatory step in `AGENTS.md`.
3. Make it an **inline checklist** — not a pointer to a doc file.

### 8.3 Why This Matters

The always-on layer (`AGENTS.md`) is processed by the agent with higher priority and shorter context than doc files. Items in Hard Guardrails are treated as hard gates. Items in docs are treated as reference material. The enforcement hierarchy is:

| Level | Where | Agent behavior |
|-------|-------|----------------|
| **Hard gate** | `AGENTS.md` Hard Guardrails and mandatory protocols | Agent checks these before considering task complete |
| **Soft reference** | `docs/engineering.md`, `docs/design.md` | Agent reads per routing table, may not recall specific items during implementation |
| **Background knowledge** | Feedback logs, anti-patterns catalog | Agent consults when debugging, not proactively |

Recurring incidents should be escalated up this hierarchy until they stop recurring.

---

## Appendix: Incident Frequency Map

| Pattern | Times Raised | Priority |
|---------|-------------|----------|
| Data sync / token drift | 1 | Critical |
| Cross-app infrastructure parity | 3 | Critical |
| Rules-layer enforcement gap | 1 | Critical |
| Port management | 0 | Critical |
| Localhost verification | 1 | Critical |
| Build / bundler issues (React 19 compat) | 4 | **Critical — 3 failed fixes (ENG-017→018→019). Rule: no `<script>` in React tree. See EAP-013.** |
| Turbopack cache corruption | 3 | **High — ENG-047, ENG-056, ENG-067. Stale `.next/` caused runtime TypeError (047), phantom route conflicts with 404s (056), and ghost hydration mismatch from removed component (067). Rule: clear `.next/` when runtime error contradicts source or file structure. See EAP-035.** |
| Verification gap (reporting done without browser check) | 3 | **Critical — promoted to Hard Guardrail #10 (ENG-020). curl ≠ verification.** |
| Process automation gaps | 1 | High |
| Documentation procedure skips | 3 | **Critical — promoted to Hard Guardrail #1 (ENG-012)** |
| Zombie server processes | 1 | High |
| External service placeholder configs | 1 | High |
| Node.js version / CLI tool compat | 1 | High — Node 25 breaks Payload CLI (ENG-015); use Node 22 LTS if CLI needed |
| Git branching / session safety | 1 | Critical |
| URL namespace / multi-app architecture | 1 | High — documented as ADR, revisit if a third concern lands on port 4000 |
| CMS UX / inline editing | 27 | **Critical — ESCALATED. ENG-027→039, ENG-042→046, ENG-049→051, ENG-054→058, ENG-062→063, ENG-066→068. ENG-068: ProjectEditModal missing min-height (AP-027 violated 3rd time). Modal dimension template now documented.** |
| Hydration mismatch (SSR/CSR divergence) | 7 | **Critical — ENG-017/18/19/20, ENG-045, ENG-055, ENG-067. Rule: never branch on client-only values; defer admin-conditional DOM with mounted-state pattern. Stale cache can also cause ghost mismatches (EAP-035). See EAP-014.** |
| Documentation procedure skips | 7 | **Critical — ESCALATED AGAIN. ENG-008/012 (EAP-010), ENG-044/045/046 (EAP-027), ENG-053 (EAP-032). 7th occurrence. Architectural changes trigger same skip pattern as bug fixes — "get it working" urgency overrides documentation even for non-urgent infrastructure work.** |
| Design system migration / upstream-first workflow | 1 | High — ENG-040. ScrollSpy promoted to DS; required `transpilePackages` + export path. |
| Admin IA / discoverability | 3 | **High — ENG-042/043/046. Sidebar nav insufficient; dashboard is the only reliable entry point. Auto-login cookie gap masked the whole inline editing system.** |
| Infrastructure / storage architecture | 3 | High — ENG-053. Supabase Storage added for cloud file persistence. ENG-055: Added `uploadMedia` API helper for inline file uploads via S3. ENG-060: Filename sanitization for S3-incompatible chars. |
| Version control / release automation | 4 | **Critical — ENG-069/078/079/080. ENG-080: Vercel build failed after checkpoint — monorepo @ds/* imports couldn't resolve node_modules on Vercel (Turbopack resolves relative to file location). Fixed via dual install command + build gate. Build gate now mandatory pre-merge step.** |
| Radix primitive internal state vs mirrored props | 1 | Medium — ENG-071. Checkbox indeterminate icon branched on React `checked` while uncontrolled `defaultChecked="indeterminate"` leaves prop undefined; UI must follow `CheckboxIndicator` `data-state` (or context), not props alone. |
| Scroll hijack on embedded canvas | 1 | High — ENG-072. onWheel handler on embedded DAG canvas intercepted page scroll. Embedded canvases must never capture wheel events; pan via drag only. See EAP-036. |
| Playground ↔ production drift (one-way experiment) | 2 | **Critical — ENG-073, ENG-074. Drift from non-propagation AND from rebuilding demos with hardcoded values instead of token references. See EAP-030, EAP-055.** |
| Playground component re-implementation drift | 3 | **Resolved — ENG-073/075/076. Three-stage enforcement pipeline: (1) Central Intent Gate in AGENTS.md #18 blocks component visual edits to playground, (2) ESLint inline plugin catches forbidden patterns in playground pages, (3) Evaluation Gate with correction loop in playground skill. See EAP-037.** |

---

## Entry Template (for future updates)

```markdown
## N. [Category Name]

### N.1 [Principle Name]

**Source:** Session YYYY-MM-DD, incident "[first 10 words...]"
**Problem:** [What went wrong]
**Root cause:** [Why it went wrong]
**Rule:** [The principle to follow going forward]
**Implementation:** [Specific code pattern, command, or script to use]
```
