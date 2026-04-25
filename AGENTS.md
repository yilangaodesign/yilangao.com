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
8. **ALWAYS** name component props, CSS classes, and design tokens by **semantic intent** (when/why to use), never by **visual implementation** (what CSS changes). An agent must be able to decide whether to use a prop from its name alone, in one reasoning step, without knowing the underlying CSS. Bad: `mono` (implementation — "use monospace font"). Good: `metric` (intent — "this labels a statistic"). Bad: `rounded` (implementation). Good: `pill` (intent — "tag/badge shape"). This applies to every new prop, variant, token, and CSS class. See §7.7 in `docs/design.md`.
9. **NEVER** add border-radius to any element on the portfolio website (yilangao.com / main site) — the portfolio identity is zero corner radius on all elements. Badges must use `shape="squared"`. The only exceptions are structural shapes (avatars, progress bars, toggle switches, spinners). Read `docs/design/branding.md` before generating any portfolio UI. See §24 in `docs/design.md`.

**Content:**
1. **NEVER** write a paragraph that exceeds 3 sentences — the target is ~60% visual, ~40% text for case studies. Essay-type content is text-majority. No paragraph exceeds 3 sentences; whitespace between paragraphs is mandatory.
2. **NEVER** lead a case study with process methodology (research → ideate → prototype → test) — lead with the problem and outcome (inverted pyramid)
3. **NEVER** use generic positioning language ("delightful experiences", "user-centered solutions") — every word must be specific enough that it couldn't describe a different designer
4. **NEVER** describe an internal tool with paragraphs when screenshots exist — replace every descriptive paragraph with a full-width screenshot + one-line caption
5. **NEVER** respond to content feedback without FIRST completing all documentation steps — append to `docs/content-feedback-log.md`, check if a new anti-pattern belongs in `docs/content-anti-patterns.md`, update the frequency map in `docs/content.md`. The fix is not done until the documentation is done.
6. **ALWAYS** include a scope statement (2-4 sentences) at the top of every case study that simultaneously communicates: what the company/product does, what you specifically did, and evidence of scale/impact
7. **NEVER** use em dashes (U+2014) in any portfolio text. Use a regular dash surrounded by spaces ( - ) or split into separate sentences. Em dashes are an AI voice tell. See `docs/content/voice-style.md` line 73 and CAP-022. Violated 6+ times in a single writing pass (CFB-022).

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
11. **ALWAYS** flush and restart the playground after ANY playground edit — Turbopack HMR is fundamentally unreliable for the playground (cross-directory `@ds/*` imports, stale WebSocket connections, incremental cache). HMR delivery fails more often than it succeeds. The flush-and-restart is NOT a fallback — it is the mandatory default step. After editing any playground file or any `src/` file consumed by the playground: (1) kill the playground server, (2) `rm -rf playground/.next`, (3) restart the server, (4) curl the page and confirm the specific change is in the HTML response, (5) ONLY THEN report as done. NEVER rely on HMR to deliver changes. NEVER skip the flush. NEVER report a playground edit as done without completing all 5 steps. Violated 6+ times — see EAP-042.
12. **ALWAYS** trace data flow (source → build → server → browser) when debugging visibility issues
13. **NEVER** render `<script>` elements in the React component tree (raw, `dangerouslySetInnerHTML`, or `next/script`) — React 19 warns on all of them. See EAP-013.
14. **NEVER** branch rendered output on `typeof window` or `window.location` in client components — this causes hydration mismatches. Use `useState` + `useEffect` to defer client-only values. See EAP-014.
15. **NEVER** use barrel imports from `lucide-react` in the playground (`import { X } from "lucide-react"`) — Turbopack's `optimizePackageImports` resolves named exports to wrong icon components on server vs client, causing hydration mismatches. Use individual imports: `import X from "lucide-react/dist/esm/icons/x"`. This also applies to any large barrel-export package in `playground/` where SSR parity matters. See EAP-056.
16. **ALWAYS** run the Cross-App Parity Checklist after creating or modifying anything in `src/`
17. **NEVER** merge to `main` without first running `npm run version:release` for each app with unreleased changes — every checkpoint is a versioned release. Check all manifests (`elan.json`, `website.json`, `ascii-studio.json`) to see if `version` differs from `release.version`.
18. **ALWAYS** run the CMS-Frontend Parity Checklist after adding, removing, or renaming any CMS field or frontend data field. A field that exists in one layer but not all three (schema, data fetch, UI) is a bug. See EAP-019.
19. **ALWAYS** run `src/scripts/push-schema.ts` (or equivalent SQL) after adding a new Payload collection — Payload 3's auto-push does NOT work on this project. The admin will 500 with "column does not exist" until the table + `payload_locked_documents_rels` column are created manually. After pushing, restart the dev server. See EAP-062.
20. **NEVER** create a component that renders CMS data without inline edit support — every text field from a Payload collection or global MUST be wrapped in `EditableText` (with `fieldId`, `target`, `fieldPath`) when `isAdmin`. The component MUST accept `id` and `isAdmin` props, and include an `EditButton`. A component that renders CMS text as plain elements is incomplete. See EAP-029.
21. **NEVER** create or modify a playground component page (`playground/src/app/components/*/page.tsx`) without first reading `.cursor/skills/playground/SKILL.md`. Playground pages are thin harnesses that import and render production components — they must never re-implement components in Tailwind, raw HTML, or SVG. See EAP-037.
22. **NEVER** edit a playground component page (`playground/src/app/components/*/page.tsx`) to fix how a component **looks or behaves** — visual/behavioral changes go to the design system source (`src/components/ui/` or `src/components/`). The playground auto-updates via `@ds/*` imports. Before editing any playground file, classify the task:
    - **Component visual** (colors, spacing, sizing, states, animations, interaction behavior) → Edit `src/components/` ONLY — NEVER the playground page
    - **Documentation / page structure** (reordering demo sections, updating props table data, changing code examples, adding new sections, creating a parity page for a new component) → Edit the playground page — this is legitimate
    - **Shell** (sidebar layout, ComponentPreview rendering, playground-wide IA, theme behavior) → Edit `playground/src/components/` or `playground/src/app/layout.tsx`
    - **Ambiguous** → Ask the user before proceeding
    This classification is a **central guardrail** — it applies regardless of which skill or route activated the task (design-iteration, engineering-iteration, or direct playground work). When the user explicitly overrides this gate, document the exception reason and scope before proceeding.
23. **NEVER** modify `src/proxy.ts`, `src/collections/Companies.ts`, `src/lib/company-session.ts`, or `src/lib/company-data.ts` without first reading `.cursor/skills/password-gate/SKILL.md`. These files form the visitor access boundary — incorrect changes can expose the site publicly or lock out all visitors.
24. **ALWAYS** update the playground page when adding a new variant, prop, or visual state to any DS component in `src/components/ui/`. Before writing: (1) read the existing playground page (`playground/src/app/components/<name>/page.tsx`) to understand structure, section ordering, and conventions; (2) add a `ComponentPreview` for the new variant in the logical position; (3) update the `PropsTable`; (4) update Notes if the variant has usage guidance. A variant that exists in code but not in the playground is invisible to consumers. See EAP-082.
25. **ALWAYS** call the content seeding endpoint after modifying any `src/app/(frontend)/api/update-*/route.ts` file. These files are content *definitions*, not content *deployments* — the CMS database is unchanged until the POST endpoint is called. After every edit: (1) `curl -X POST http://localhost:4000/api/update-{slug}` and confirm `action: "updated"` in the response, (2) verify via `curl` or Payload REST API that the new content is present in the CMS, (3) only then report the content edit as done. A saved file with uncalled endpoint is an incomplete task. See EAP-087.
26. **ALWAYS** update the event registry in `docs/analytics.md` when adding or removing a Mixpanel `track()` call. Registry row format: `| Event Name (Title Case) | Properties (snake_case) | Firing condition | Source file |`. The static parity check in `npm run audit-docs` will flag drift.

# Pre-Flight: Conditional Reading

> If `[ORCHESTRATED]` appears in your context, skip Pre-Flight entirely.
> Your routing has been done. Proceed directly to your dispatched task.

Before writing code, classify your task. Read ONLY the docs that match — use the Section Index at the top of each doc to target-read, not read everything. For a quick reference of all magic-word triggers, see [`docs/magic-words.md`](docs/magic-words.md). When adding a new trigger phrase, check that file for collisions first.

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
   → Activate `content-iteration` skill at `.cursor/skills/content-iteration/SKILL.md`.
   → The skill handles full doc reading + feedback log processing.

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
   → **Before any edit**, apply Engineering guardrail #21 (Intent Gate): classify the task as Component visual / Documentation-structure / Shell / Ambiguous. Component visual changes NEVER go to playground pages.

10. **Am I touching CMS fields or frontend data fields?**
    → Activate `cms-parity` skill at `.cursor/skills/cms-parity/SKILL.md`.

11. **Am I doing a checkpoint, merge to main, or deploy?**
    → If changes are already committed on `dev`: activate `checkpoint` skill directly at `.cursor/skills/checkpoint/SKILL.md`.
    → If there are uncommitted changes and the user wants to release: activate `ship-it` skill instead (it will hand off to checkpoint after committing).

12. **Am I creating or modifying components in `src/`?**
    → Activate `cross-app-parity` skill at `.cursor/skills/cross-app-parity/SKILL.md`.

13. **Am I shipping / releasing / publishing all local changes?**
    (triggers: "ship it", "publish", "release everything", "push it live", "deploy everything", "go live")
    → Activate `ship-it` skill at `.cursor/skills/ship-it/SKILL.md`.
    → This skill handles diff analysis, commit batching, and hands off to `checkpoint` for the release pipeline.

14. **Am I starting / booting dev servers?**
    (triggers: "boot up", "start servers", "spin up", "fire up", or "I can't see X on localhost")
    → Activate `boot-up` skill at `.cursor/skills/boot-up/SKILL.md`.
    → Probes ports, starts what's missing, waits for HTTP 200, updates the port registry.

15. **Am I writing a new case study from raw materials, or rebuilding an existing one?**
    (triggers: "write up", "write this up", "draft this", "turn this into a case study",
    "redo/rebuild/rethink this case study", "apply the new framework to X",
    "this case study doesn't work", or user provides raw notes/transcripts/project details)
    → Activate `case-study-authoring` skill at `.cursor/skills/case-study-authoring/SKILL.md`.
    → The skill's intake protocol detects the scenario and routes to the correct entry point.
    → If the rebuild involves new interactive components (Tier 3 artifacts), the skill
      may trigger the orchestrator for cross-category dispatch.

16. **Am I doing any work on the portfolio website (main site) — UI, content, or strategy?**
    (any file under `src/app/(frontend)/(site)/`, or any component in `src/components/` consumed by the main site, or any content/strategy work for the portfolio)
    → Read `docs/design/branding.md`.
    → The branding reference contains brand identity (position, personality, edges), taste and tradition, atmospheric dials, visual identity rules (zero corner radius, Badge shape overrides, etc.), and the proof map.
    → This route is **mandatory** for all portfolio work. It is **additive to** Route 3 (content routing) and Route 1 (design routing) — read `branding.md` in addition to your category-specific docs, not instead of them.

17. **Am I touching site analytics, Mixpanel, visitor tracking, or event instrumentation?**
    → Read `docs/analytics.md` first (event registry, config summary, data flow).
    → Then follow to `docs/engineering/analytics-instrumentation.md` for instrumentation work, or `docs/content/analytics-measurement.md` for measurement strategy.
    → For server-side login analytics (`incrementLoginAnalytics`, `loginCount`), see `docs/architecture.md` §4.1 instead.

Do NOT read docs that don't match your task. Do NOT read full doc files when only one section is relevant. The Section Index exists so you can target-read.

# Self-Audit Protocol

> These routes activate in ANY mode when the user requests quality evaluation
> of a plan, proposal, or existing content. They are quality gates on the
> agent's output, not on the work the output describes.
>
> Pre-Flight handles task routing ("what work am I doing?").
> Self-Audit Protocol handles output evaluation ("is my output sound?").
> Mid-Flight handles implementation verification ("did the code land?").
> Post-Flight handles documentation ("what did I learn?").
>
> Workflows 1 and 2 are read-only by design and work in any mode.
> Workflow 3 requires write access; if in a read-only mode, note the
> requirement and let the user/system handle the transition.

18. **Is the user asking me to adversarially audit a plan or proposal?**
    (triggers: "pressure test plan")
    → Activate `plan-audit` skill at `.cursor/skills/plan-audit/SKILL.md`.
    → Prerequisite: a plan, proposal, or set of proposed changes exists in context.
    → Mode: any (read-only skill).

19. **Is the user asking me to check a plan's structure and sequencing?**
    (triggers: "meta audit plan")
    → Activate `plan-structure` skill at `.cursor/skills/plan-structure/SKILL.md`.
    → Prerequisite: a plan or proposal exists and its logical content is finalized.
    → Mode: any (read-only skill).

20. **Is the user asking me to stress-test existing content?**
    (triggers: "content stress test", "fresh eyes", "recheck portfolio")
    → Activate `stress-test` skill at `.cursor/skills/stress-test/SKILL.md`.
    → Mode: requires write access (modifies files, pushes to CMS).

# Mid-Flight: Verification Gate

> **This gate runs AFTER implementation and BEFORE responding to the user or starting Post-Flight.**
> You CANNOT skip this. You CANNOT respond to the user until every applicable check passes.
> This exists because documentation alone does not change behavior — 6+ violations of playground verification prove that guardrails in reference files get forgotten mid-task. This gate is positioned at the point of failure: the moment between "I finished coding" and "I'm about to respond."

**Check 1 — Playground delivery (if you touched ANY file under `playground/` or any `src/` file imported by the playground):**
1. Kill the playground server (`lsof -ti :4001 | xargs kill -9`)
2. Delete cache (`rm -rf playground/.next`)
3. Restart (`npm run playground`, background it)
4. Wait for HTTP 200 on the affected page
5. `curl` the page and grep for a distinctive string from your edit to confirm it's in the response
6. Only then proceed to Post-Flight / respond

**Check 2 — Main site delivery (if you touched `src/` files that affect the main site):**
1. Verify the main site dev server is running on port 4000
2. `curl` the affected page and confirm HTTP 200

**Check 3 — Content seeding delivery (if you touched any `src/app/(frontend)/api/update-*/route.ts` file):**
1. Call `curl -X POST http://localhost:4000/api/update-{slug}` for each modified seeding route
2. Confirm the response contains `"action": "updated"` (not an error)
3. Verify via Payload REST API (`curl http://localhost:4000/api/projects?where[slug][equals]={slug}`) that at least one distinctive string from your edit is present in the CMS data
4. Only then proceed to Post-Flight / respond

**If a check fails, fix it before proceeding. Do NOT document or respond with "please hard refresh."**

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

**Feedback log cap (30 entries):** After appending a new entry, if the active log exceeds 30 entries, archive the oldest entry to the corresponding archive file (`docs/*-feedback-log-archive.md`) and update the synthesis file (`docs/*-feedback-synthesis.md`) if the archived entry reveals a pattern not yet captured. The synthesis files are the distilled lessons from all archived entries — they ensure historical knowledge survives archival.

**Why this exists:** The default execution loop is explore → implement → verify → report. That loop captures what was *done* but not what was *learned*. Every task — even proactive work that isn't responding to a complaint — generates design, engineering, or content knowledge. Without a mandatory reflection gate, that knowledge evaporates at session end. Forcing single-category classification compounds the loss — a design insight captured only in the engineering log is invisible to future design work.

# App Registry

This monorepo contains multiple Next.js apps. **This is the single source of truth for what exists.** Before creating a new app, consult this table. Before starting any server, check the port column.

| App | Directory | Port | Version manifest | Script | Audience | Production URL | Vercel Project | Hosting |
|-----|-----------|------|------------------|--------|----------|---------------|----------------|---------|
| **Main site** | `src/` (root) | 4000 | `website.json` | `npm run dev` | Visitors, editors | `new.yilangao.com` (interim) | `yilangao-portfolio` | Vercel |
| **Playground** | `playground/` | 4001 | — (reads `elan.json` via synced `elan.ts`) | `npm run playground` | Developers/designers | — | `yilangao-design-system` | Vercel |
| **ASCII Art Studio** | `ascii-tool/` | 4002 | `ascii-studio.json` | `npm run ascii-tool` | Public users | — | — | Not deployed |

**Pattern:** Each app owns its own `package.json`, `next.config.ts`, `tsconfig.json`, and `postcss.config.mjs`. Design tokens are shared via manually synced `globals.css` (Tailwind `@theme` block). Each app may have its own version manifest at the repo root.

**Hosting:** All deployed apps use Vercel. Domain DNS is managed by Cloudflare (`yilangao.com` zone). The root domain currently 301-redirects to a Figma prototype; `new.yilangao.com` is a CNAME to `cname.vercel-dns.com` (grey cloud / DNS-only). See `docs/architecture.md` §4 and `docs/engineering/deployment.md` for full DNS and env var configuration.

**`.vercel/project.json` at repo root** links to the **Playground** project (`yilangao-design-system`), NOT the main site. Do not confuse them when running Vercel CLI commands.

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
