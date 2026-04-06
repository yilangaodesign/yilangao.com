# Engineering — Accumulated Knowledge

> **What this file is:** The hub of the engineering knowledge base for yilangao.com. Detailed topic sections live in `docs/engineering/*.md` spoke files; this hub contains the Section Index, meta-principles, and the incident frequency map. Every principle here was extracted from real incidents, debugging sessions, and process failures.
>
> **Who reads this:** AI agents routed here by `AGENTS.md` Pre-Flight. Read the Section Index first, then follow the link to the spoke file matching your task.
> **Who writes this:** AI agents after processing engineering feedback via the `engineering-iteration` skill.
> **Last updated:** 2026-04-04 (ENG-117: Turbopack routes-manifest missing; switched to webpack; EAP-069 added)

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
| Data sync / token drift | 3 | **Critical — ENG-084. Playground maintained manually-duplicated `--ds-*` namespace; migrating source to `--portfolio-*` broke all consumer color resolution. Consumer apps must import from single source, not maintain parallel definitions. Grid reorder (2026-04-05): dual ordering systems (gridOrder + per-project order field) silently diverged. See EAP-070.** |
| Cross-app infrastructure parity | 3 | Critical |
| Rules-layer enforcement gap | 1 | Critical |
| Port management | 0 | Critical |
| Localhost verification | 1 | Critical |
| Build / bundler issues (React 19 compat) | 5 | **Critical — 3 failed fixes (ENG-017→018→019). Rule: no `<script>` in React tree. See EAP-013. ENG-117: Turbopack 16.2.x missing routes-manifest.json — switched main site to `--webpack` until upstream fix. See EAP-069.** |
| Turbopack cache / HMR delivery failure | 6+ | **Critical — ESCALATED TWICE. ENG-047, ENG-056, ENG-067, ENG-085, ENG-094, ENG-095 + undocumented. Previous "soft" protocol (curl → hard-refresh → flush as fallback) failed 6+ times because the agent stopped at step 1-2 and reported success. AGENTS.md #11 REWRITTEN: flush-and-restart is now the MANDATORY DEFAULT, not a fallback. After ANY playground edit: kill server → `rm -rf playground/.next` → restart → curl verify → report done. No HMR reliance. No exceptions. See EAP-042 (escalated).** |
| Verification gap (reporting done without browser check) | 3 | **Critical — promoted to Hard Guardrail #10 (ENG-020). curl ≠ verification.** |
| Process automation gaps | 1 | High |
| Documentation procedure skips | 3 | **Critical — promoted to Hard Guardrail #1 (ENG-012)** |
| Zombie server processes | 2 | **High — ENG-116. TCP listen ≠ HTTP health. Servers ran for hours/days, accepted TCP connections but never responded to HTTP. Boot-up probe must use `curl --max-time 5` not `lsof`/`nc`. See EAP-068.** |
| External service placeholder configs | 1 | High |
| Node.js version / CLI tool compat | 1 | High — Node 25 breaks Payload CLI (ENG-015); use Node 22 LTS if CLI needed |
| Git branching / session safety | 1 | Critical |
| URL namespace / multi-app architecture | 1 | High — documented as ADR, revisit if a third concern lands on port 4000 |
| CMS UX / inline editing | 33 | **Critical — ESCALATED. ENG-027→039, ENG-042→046, ENG-049→051, ENG-054→058, ENG-062→063, ENG-066→068, ENG-105, ENG-110, ENG-111, ENG-114, ENG-115, ENG-123. ENG-123: Hero image upload writes to legacy heroImage field but case study page reads from hero content block — image visible in home thumbnail but not on case study page. Filename collision also prevented upload. See ENG-123.** |
| Hydration mismatch (SSR/CSR divergence) | 10 | **Critical — ESCALATED. ENG-017/18/19/20, ENG-045, ENG-055, ENG-067, ENG-081, ENG-086, ENG-087. Three root cause families: (1) Turbopack bundle divergence — barrel import resolution (EAP-056), SCSS @use compilation (EAP-038), stale cache (EAP-035); (2) typeof window branching (EAP-014); (3) invalid HTML nesting. Barrel imports from lucide-react now banned via Hard Guardrail #15. See EAP-056.** |
| Documentation procedure skips | 7 | **Critical — ESCALATED AGAIN. ENG-008/012 (EAP-010), ENG-044/045/046 (EAP-027), ENG-053 (EAP-032). 7th occurrence. Architectural changes trigger same skip pattern as bug fixes — "get it working" urgency overrides documentation even for non-urgent infrastructure work.** |
| Design system migration / upstream-first workflow | 1 | High — ENG-040. ScrollSpy promoted to DS; required `transpilePackages` + export path. |
| Admin IA / discoverability | 4 | **High — ENG-042/043/046/100. ENG-100: Full IA restructure — 7 groups → 3, NavPages trimmed to Quick Links (Company Access + Open Live Site), ViewSiteLink absorbed, breadcrumb added to CompanyDashboard. See architecture.md §4.2.** |
| Infrastructure / storage architecture | 3 | High — ENG-053. Supabase Storage added for cloud file persistence. ENG-055: Added `uploadMedia` API helper for inline file uploads via S3. ENG-060: Filename sanitization for S3-incompatible chars. |
| Version control / release automation | 4 | **Critical — ENG-069/078/079/080. ENG-080: Vercel build failed after checkpoint — monorepo @ds/* imports couldn't resolve node_modules on Vercel (Turbopack resolves relative to file location). Fixed via dual install command + build gate. Build gate now mandatory pre-merge step.** |
| Radix primitive internal state vs mirrored props | 1 | Medium — ENG-071. Checkbox indeterminate icon branched on React `checked` while uncontrolled `defaultChecked="indeterminate"` leaves prop undefined; UI must follow `CheckboxIndicator` `data-state` (or context), not props alone. |
| Scroll hijack on embedded canvas | 1 | High — ENG-072. onWheel handler on embedded DAG canvas intercepted page scroll. Embedded canvases must never capture wheel events; pan via drag only. See EAP-036. |
| Playground ↔ production drift (one-way experiment) | 4 | **Critical — ENG-073, ENG-074, ENG-101, ENG-102. Drift from non-propagation AND from rebuilding demos with hardcoded values instead of token references. ENG-101: Input rebuilt without updating playground. ENG-102: Label created without any playground page/sidebar entry. See EAP-007, EAP-030, EAP-055.** |
| Playground component re-implementation drift | 3 | **Resolved — ENG-073/075/076. Three-stage enforcement pipeline: (1) Central Intent Gate in AGENTS.md #18 blocks component visual edits to playground, (2) ESLint inline plugin catches forbidden patterns in playground pages, (3) Evaluation Gate with correction loop in playground skill. See EAP-037.** |
| SCSS token theme adaptability | 2 | **Resolved — ENG-082/083. Full CSS custom property output layer (`_custom-properties.scss`) now generates `:root` (light) and `[data-theme="dark"]` blocks. ~40 SCSS modules migrated from `$portfolio-*` to `var(--portfolio-*)`. 43 component-level `$_` tokens introduced for hardcoded px values. Remaining 202 SCSS refs are documented exceptions (rgba(), always-dark surfaces, interaction state tints).** |
| Playground demo placeholder links | 3 | **High — ENG-088/089/090. ENG-088: `href="#"` scrolls to top. ENG-089: removing `href` broke NavItem layout because SCSS doesn't reset `<button>` UA defaults. ENG-090: resolved with `onClick={prevent}` + `"use client"` — keeps `<a>` rendering for correct SCSS while suppressing navigation. See EAP-057.** |
| Token expansion (motion) | 1 | Low — ENG-091. Added `$portfolio-duration-nav` (200ms) and `$portfolio-easing-nav` (ease-out) for navigation spatial transitions. Fills gap between fast (110ms) and moderate (240ms). |
| Fixed-position component in preview container | 1 | High — ENG-092. Embedding `position: fixed` + `createPortal(body)` layout components in playground preview divs causes DOM escape. Layout components demo via code + subcomponent previews only. See EAP-058. |
| Component duplication / shadow implementation | 1 | High — ENG-093. VerticalNavCategory reimplemented ~80% of NavItem's visual DNA with 11 parallel SCSS classes. Resolved by adding `expanded` state to NavItem + creating NavItemTrigger/NavItemChildren primitives. Layout components must compose — never reimplement — the nav item primitive. |
| Component API prop pass-through gap | 1 | Medium — ENG-094. NavItemTrigger lacked `badge` prop pass-through to NavItem. Wrapper components must forward all visual props of the inner primitive they compose. |
| CSS alignment inconsistency (.badge vs .trailing) | 1 | Medium — ENG-094. `.badge` had `margin-inline-start: auto` but `.trailing` didn't. Both right-aligned slots should use the same CSS mechanism. |
| Deployment / Vercel build | 2 | **High — ENG-096/097. ENG-096: First deploy failed (gitignored `importMap.js` + missing `resend` dep). ENG-097: Playground proxy collision — `turbopack.root: monorepoRoot` caused Next.js 16 to detect main site's `proxy.ts` in playground build. See EAP-060, EAP-061.** |
| CMS data migration (JSON → collection) | 1 | Low — ENG-098. Password gate data migrated from static `companies.json` to Payload `companies` collection. Custom admin dashboard built. Seed script for one-time migration. |
| Migration scaffold loss | 1 | High — ENG-118. Sections→blocks migration dropped the image placeholder system because it lived in a separate layer (`page.tsx` static map, not CMS schema). Migration checklists must audit scaffold/placeholder/preview layers alongside data and render layers. |
| Payload schema push failure | 2 | **High — ENG-099, ENG-109. Payload 3's `push` option and CLI both non-functional on this project. New collections require manual SQL push via `src/scripts/push-schema.ts`. Column type changes (e.g., text→richText = varchar→jsonb) need explicit `USING` cast — auto-push failure crashes the entire site via `payloadInitError`. See EAP-062, EAP-063.** |
| Payload import map stale after component removal | 1 | **High — ENG-100. Deleting an admin component without cleaning `importMap.js` crashes the admin panel with 500. See EAP-063.** |

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
