# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

# Orchestrator Override

If your context contains the marker `[ORCHESTRATED]`, you are a helper agent
dispatched by the orchestrator. Follow these rules:
- **SKIP** Pre-Flight routing (your routing was already done by the orchestrator)
- **SKIP** Post-Flight documentation (write a stub + draft instead; see dispatch instructions)
- **SKIP** the cross-category check in your skill's Step 1 (the orchestrator already decomposed the request)
- **OBEY** all Hard Guardrails below (these always apply)
- **OBEY** your dispatch instructions (file boundary, server ops, documentation format)

# Hard Guardrails

**Design:**
1. **NEVER** use inline `style={{}}` — always use Tailwind classes or CSS custom properties
2. **NEVER** place CSS resets outside `@layer base` — unlayered resets override all Tailwind utilities
3. **NEVER** use `@theme inline` for themeable values — use `@theme` so dark mode works
4. **NEVER** treat repeated user complaints incrementally — 3+ in the same category means the root cause is architectural
5. **NEVER** skip dark mode verification when touching colors or backgrounds
6. **ALWAYS** use flex layout with in-flow spacers for fixed sidebars — never rely on padding-left offsets
7. **NEVER** use SVG to render text, labels, or component UI — SVG is permitted only for icons, logos, and decorative illustrations. Text in SVG bypasses the typography token system, breaks copy/paste, and is invisible to screen readers.

**Content:**
1. **NEVER** write case study text that exceeds 4 consecutive sentences without a visual break — the target is 80-85% visual, 15-20% text
2. **NEVER** lead a case study with process methodology (research → ideate → prototype → test) — lead with the problem and outcome (inverted pyramid)
3. **NEVER** use generic positioning language ("delightful experiences", "user-centered solutions") — every word must be specific enough that it couldn't describe a different designer
4. **NEVER** describe an internal tool with paragraphs when screenshots exist — replace every descriptive paragraph with a full-width screenshot + one-line caption
5. **NEVER** respond to content feedback without FIRST completing all documentation steps — append to `docs/content-feedback-log.md`, check if a new anti-pattern belongs in `docs/content-anti-patterns.md`, update the frequency map in `docs/content.md`. The fix is not done until the documentation is done.
6. **ALWAYS** include a scope statement (2-4 sentences) at the top of every case study that simultaneously communicates: what the company/product does, what you specifically did, and evidence of scale/impact

**Engineering:**
1. **NEVER** respond to the user after fixing a bug or incident without FIRST completing all documentation steps — append to `docs/engineering-feedback-log.md`, check if a new anti-pattern belongs in `docs/engineering-anti-patterns.md`, update the frequency map in `docs/engineering.md`. The fix is not done until the documentation is done. This applies even when the bug was reported mid-task — pause, document, then respond.
   - **ENFORCEMENT (EAP-027):** Before writing the fix, create the feedback log entry stub (Issue + Root Cause). After the fix, fill in Resolution. Only then compose the response message. This makes documentation a pre-condition, not a deferred post-step. Violated 6 times — behavioral urgency overrides process unless documentation is woven into the fix workflow itself.
2. **NEVER** make file changes while on `main` — check `git branch --show-current` first; if on `main`, switch to `dev` (`git checkout dev`). All work happens on `dev`.
3. **NEVER** create new git branches. The only branches are `dev` (working) and `main` (stable checkpoints).
4. **NEVER** switch branches during a session unless the user explicitly asks for a checkpoint merge to `main`.
5. **NEVER** modify `src/styles/tokens/` without running `npm run sync-tokens` afterward
6. **NEVER** start a dev server without first reading `docs/port-registry.md`
7. **NEVER** kill a process on a port without checking what it is first
8. **NEVER** use ports below 4000 — they are reserved for other projects
9. **NEVER** assume a dev server from a previous session is still running — verify it
10. **ALWAYS** verify changes on localhost after implementation — HTTP 200 is NOT sufficient. For any change that touches React components, open the page in the browser (via `browser-use` subagent or equivalent) and check for console errors, hydration mismatches, and runtime warnings BEFORE reporting the task as done. `curl` only checks the server; React errors only appear in the browser.
11. **ALWAYS** trace data flow (source → build → server → browser) when debugging visibility issues
12a. **NEVER** render `<script>` elements in the React component tree (raw, `dangerouslySetInnerHTML`, or `next/script`) — React 19 warns on all of them. See EAP-013.
12b. **NEVER** branch rendered output on `typeof window` or `window.location` in client components — this causes hydration mismatches. Use `useState` + `useEffect` to defer client-only values. See EAP-014.
12. **ALWAYS** run the Cross-App Parity Checklist after creating or modifying anything in `src/`
13. **NEVER** merge to `main` without first running `npm run version:release` for each app with unreleased changes — every checkpoint is a versioned release. Check all manifests (`elan.json`, `ascii-studio.json`, etc.) to see if `version` differs from `release.version`.
14. **ALWAYS** run the CMS-Frontend Parity Checklist after adding, removing, or renaming any CMS field or frontend data field. A field that exists in one layer but not all three (schema, data fetch, UI) is a bug. See EAP-019.
15. **ALWAYS** restart the Payload dev server after modifying any global or collection schema — Payload syncs the database schema only on startup. A schema change without a server restart means the field silently does not exist.
16. **NEVER** create a component that renders CMS data without inline edit support — every text field from a Payload collection or global MUST be wrapped in `EditableText` (with `fieldId`, `target`, `fieldPath`) when `isAdmin`. The component MUST accept `id` and `isAdmin` props, and include an `EditButton`. A component that renders CMS text as plain elements is incomplete. See EAP-029.
17. **NEVER** create or modify a playground component page (`playground/src/app/components/*/page.tsx`) without first reading `.cursor/skills/playground/SKILL.md`. Playground pages are thin harnesses that import and render production components — they must never re-implement components in Tailwind, raw HTML, or SVG. See EAP-037.
18. **NEVER** edit a playground component page (`playground/src/app/components/*/page.tsx`) to fix how a component **looks or behaves** — visual/behavioral changes go to the design system source (`src/components/ui/` or `src/components/`). The playground auto-updates via `@ds/*` imports. Before editing any playground file, classify the task:
    - **Component visual** (colors, spacing, sizing, states, animations, interaction behavior) → Edit `src/components/` ONLY — NEVER the playground page
    - **Documentation / page structure** (reordering demo sections, updating props table data, changing code examples, adding new sections, creating a parity page for a new component) → Edit the playground page — this is legitimate
    - **Shell** (sidebar layout, ComponentPreview rendering, playground-wide IA, theme behavior) → Edit `playground/src/components/` or `playground/src/app/layout.tsx`
    - **Ambiguous** → Ask the user before proceeding
    This classification is a **central guardrail** — it applies regardless of which skill or route activated the task (design-iteration, engineering-iteration, or direct playground work). When the user explicitly overrides this gate, document the exception reason and scope before proceeding.

# Pre-Flight: Conditional Reading

> If `[ORCHESTRATED]` appears in your context, skip Pre-Flight entirely.
> Your routing has been done. Proceed directly to your dispatched task.

Before writing code, classify your task. Read ONLY the docs that match — use the Section Index at the top of each doc to target-read, not read everything.

**CRITICAL — Multi-Category Classification (Step 0):**
User feedback is rarely one-dimensional. Before routing, ask: **does this feedback touch more than one category?** A single piece of feedback can simultaneously be:
- **Design** — visual clarity, affordance, layout, form UX, interaction patterns
- **Engineering** — data schema, save flow, API, state management, infrastructure
- **Content** — microcopy, labels, instructions, UX writing, naming

Example: "It's unclear what this field is" is SIMULTANEOUSLY a design issue (no persistent label, no field type differentiation), an engineering issue (missing schema field), and a content issue (label says "url" instead of "Website"). Do NOT force single-category classification. Route to ALL applicable tracks, implement across all of them, and document in all applicable feedback logs during Post-Flight.

**Multi-Task Detection (Step 0 continued):**
After classifying categories, check: does this message contain **3+ distinct tasks**,
OR **2 distinct tasks where at least one involves creating a new component, page,
or CMS collection from scratch**?
Signals: numbered lists, "and then", "also", comma-separated, session agendas.
A single complaint spanning multiple categories is NOT multi-task — Step 0's
multi-category routing handles it with the existing single-agent flow.
If YES → activate the orchestrator at `.cursor/skills/orchestrator/SKILL.md`.
Pre-Flight routes 1-12 do NOT run — the orchestrator handles all routing,
skill assignment, and gate identification internally.

**Task-based routing (pick all that apply):**

1. **Am I touching UI, visuals, spacing, interaction, or components?**
   → Read `docs/design.md` Section Index (top of file), then the section matching your task.
   → Read `docs/design-anti-patterns.md`.

2. **Am I touching infra, build, data sync, ports, or git?**
   → Read `docs/engineering.md` Section Index (top of file), then the section matching your task.
   → Read `docs/engineering-anti-patterns.md`.

3. **Am I touching portfolio copy, case studies, project descriptions, about page text, or content strategy?**
   → Read `docs/content.md` Section Index (top of file), then the section matching your task.
   → Read `docs/content-anti-patterns.md`.

**Feedback-based routing (pick all that apply — these are NOT mutually exclusive):**

4. **Is there a design dimension? (visual complaints, spacing, interaction, form UX, affordances, "it looks wrong", "it's confusing")**
   → Activate `design-iteration` skill at `.cursor/skills/design-iteration/SKILL.md`.
   → The skill handles full doc reading + feedback log processing.

5. **Is there an engineering dimension? (data not saving, schema issues, build errors, "it doesn't work", "it's broken")**
   → Activate `engineering-iteration` skill at `.cursor/skills/engineering-iteration/SKILL.md`.
   → The skill handles full doc reading + incident processing.

6. **Is there a content dimension? (poor labels, unclear copy, UX microcopy, naming, "this doesn't read well", "it's unclear")**
   → Read `docs/content.md` (full file — content docs are shorter than design/engineering).
   → Read `docs/content-anti-patterns.md`.
   → Read the first 30 lines of `docs/content-feedback-log.md` (most recent entries for context).
   → Process feedback, implement changes, then close the loop per Post-Flight.

**Disambiguation defaults (when you're uncertain about a dimension):**
- "it looks wrong" → always includes Design
- "it doesn't work" → always includes Engineering
- "it's confusing" / "it's unclear" → always includes Design + Content; check if Engineering too
- "it doesn't read well" / "the story isn't clear" → always includes Content
- Form/input/editing complaints → always includes Design + Engineering; usually Content too

7. **Am I starting or stopping a server?**
   → Read `docs/port-registry.md`.

8. **Is it time for a doc audit?** (check `docs/doc-audit-log.md` — if last audit was 7+ days ago or the file doesn't exist, suggest running one)
   → Activate `doc-audit` skill at `.cursor/skills/doc-audit/SKILL.md`.

9. **Am I touching the playground? (any file under `playground/src/app/components/`, `playground/src/components/`, or `playground/src/app/layout.tsx`)**
   → Activate `playground` skill at `.cursor/skills/playground/SKILL.md`.
   → The skill handles architecture rules, composition rules, import decision tree, and post-build parity.
   → This route is **mandatory** — a file-scoped rule (`.cursor/rules/playground-components.md`) also fires automatically when touching component pages, but the skill must be read in full before writing any code.
   → **Before any edit**, apply Engineering guardrail #18 (Intent Gate): classify the task as Component visual / Documentation-structure / Shell / Ambiguous. Component visual changes NEVER go to playground pages.

10. **Am I touching CMS fields or frontend data fields?**
    → Activate `cms-parity` skill at `.cursor/skills/cms-parity/SKILL.md`.

11. **Am I doing a checkpoint, merge to main, or deploy?**
    → Activate `checkpoint` skill at `.cursor/skills/checkpoint/SKILL.md`.

12. **Am I creating or modifying components in `src/`?**
    → Activate `cross-app-parity` skill at `.cursor/skills/cross-app-parity/SKILL.md`.

Do NOT read docs that don't match your task. Do NOT read full doc files when only one section is relevant. The Section Index exists so you can target-read.

# Post-Flight: Mandatory Reflection

> If the orchestrator is active for this task, Post-Flight is handled by
> the orchestrator's Phase 5 (document.md). Do not run Post-Flight separately
> for orchestrated work. Non-orchestrated tasks in the same session still
> follow normal Post-Flight.

**After completing any design, engineering, or content work**, close the loop. This is not optional — skipping it means the knowledge generated by the task is lost.

**CRITICAL — Multi-Category Documentation:**
If Pre-Flight Step 0 identified multiple categories, you MUST document in ALL applicable logs. A single piece of feedback that spans design + engineering + content requires entries in all three feedback logs plus updates to all applicable anti-pattern files. Each log entry should include a **"Cross-category note"** referencing the entries in the other logs (e.g., "Also documented as FB-040 (design) and ENG-029 (engineering)"). Never document only the "primary" category and skip the others.

**Design work (Routes 1 or 4 above):**
1. Append to `docs/design-feedback-log.md` — what was the intent, what was decided, what was learned.
2. Update `docs/design.md` if the work reveals a new principle, refines an existing one, or establishes a policy.
3. Update `docs/design-anti-patterns.md` if the work exposed a pattern to avoid.

**Engineering work (Routes 2 or 5 above):**
1. Append to `docs/engineering-feedback-log.md` — what the user observed, root cause, resolution.
2. Update `docs/engineering.md` if the work reveals a new operational principle.
3. Update `docs/engineering-anti-patterns.md` if a failure mode was encountered.
4. Update the frequency map in `docs/engineering.md` Appendix.

**Content work (Routes 3 or 6 above):**
1. Append to `docs/content-feedback-log.md` — what was the intent, what was decided, what was learned.
2. Update `docs/content.md` if the work reveals a new content principle, refines an existing one, or establishes a policy.
3. Update `docs/content-anti-patterns.md` if the work exposed a content pattern to avoid.

**Why this exists:** The default execution loop is explore → implement → verify → report. That loop captures what was *done* but not what was *learned*. Every task — even proactive work that isn't responding to a complaint — generates design, engineering, or content knowledge. Without a mandatory reflection gate, that knowledge evaporates at session end. Forcing single-category classification compounds the loss — a design insight captured only in the engineering log is invisible to future design work.

# App Registry

This monorepo contains multiple Next.js apps. **This is the single source of truth for what exists.** Before creating a new app, consult this table. Before starting any server, check the port column.

| App | Directory | Port | Version manifest | Script | Audience | Description |
|-----|-----------|------|------------------|--------|----------|-------------|
| **Main site** | `src/` (root) | 4000 | `elan.json` | `npm run dev` | Visitors, editors | Portfolio + Payload CMS admin |
| **Playground** | `playground/` | 4001 | — (reads `elan.json` via synced `elan.ts`) | `npm run playground` | Developers/designers | Design system component previews + token explorer |
| **ASCII Art Studio** | `ascii-tool/` | 4002 | `ascii-studio.json` | `npm run ascii-tool` | Public users | Standalone ASCII art/video creative tool |

**Pattern:** Each app owns its own `package.json`, `next.config.ts`, `tsconfig.json`, and `postcss.config.mjs`. Design tokens are shared via manually synced `globals.css` (Tailwind `@theme` block). Each app may have its own version manifest at the repo root.

**When this table gets out of date:** If you encounter an app directory that isn't listed here, stop and update this table before proceeding. An undocumented app is a maintenance hazard.

# Design System Package

Published as **`@yilangaodesign/design-system`** on GitHub Packages.
Source repo: https://github.com/yilangaodesign/design-system

| Import type | Path |
|---|---|
| SCSS barrel | `@use '@yilangaodesign/design-system/scss' as *` |
| SCSS sub-module | `@use '@yilangaodesign/design-system/scss/tokens/colors' as *` |
| CSS custom properties | `@import '@yilangaodesign/design-system/css/tokens'` |
| React components | `import { FadeIn } from '@yilangaodesign/design-system'` |

Local `src/styles/` exists for site-specific overrides not yet promoted to the package.
`docs/design.md` is the canonical working copy — update it in-session, then periodically publish to the package.

# Multi-App Versioning

Each app with its own deployment lifecycle has a version manifest at the repo root. For the full versioning workflow, semver policy, and checkpoint procedure, activate the `checkpoint` skill at `.cursor/skills/checkpoint/SKILL.md`.

# Cross-App Parity Checklist

**This is a blocking gate — run after every creation or modification in `src/`.** Activate the `cross-app-parity` skill at `.cursor/skills/cross-app-parity/SKILL.md`.

# New App Onboarding Checklist

When adding a new Next.js app, follow the checklist in the `cross-app-parity` skill at `.cursor/skills/cross-app-parity/SKILL.md` §4.

# CMS-Frontend Parity Checklist

**This is a blocking gate — run after every field addition, removal, or rename.** Activate the `cms-parity` skill at `.cursor/skills/cms-parity/SKILL.md`.

# Token Sync Protocol

When modifying any file in `src/styles/tokens/`, follow the sync protocol in the `cross-app-parity` skill at `.cursor/skills/cross-app-parity/SKILL.md` §2.

# Component Registry

`archive/registry.json` is the single source of truth for all design system artifacts. For the full creation/archiving protocol, see the `cross-app-parity` skill at `.cursor/skills/cross-app-parity/SKILL.md` §3.

# Archive — Cold Storage

`/archive/` contains explored-but-shelved code from past experiments.
1. Do NOT reference or import from `/archive/` unless the user explicitly asks.
2. Do NOT include `/archive/` contents in search results during normal work.
3. When shelving: move to `archive/experiment-XX/` or `archive/shared/`, add a comment noting origin and reason.

See `archive/README.md` for the full convention.
