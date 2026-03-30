# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

# Hard Guardrails

**Design:**
1. **NEVER** use inline `style={{}}` — always use Tailwind classes or CSS custom properties
2. **NEVER** place CSS resets outside `@layer base` — unlayered resets override all Tailwind utilities
3. **NEVER** use `@theme inline` for themeable values — use `@theme` so dark mode works
4. **NEVER** treat repeated user complaints incrementally — 3+ in the same category means the root cause is architectural
5. **NEVER** skip dark mode verification when touching colors or backgrounds
6. **ALWAYS** use flex layout with in-flow spacers for fixed sidebars — never rely on padding-left offsets

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

# Pre-Flight: Conditional Reading

Before writing code, classify your task. Read ONLY the docs that match — use the Section Index at the top of each doc to target-read, not read everything.

**CRITICAL — Multi-Category Classification (Step 0):**
User feedback is rarely one-dimensional. Before routing, ask: **does this feedback touch more than one category?** A single piece of feedback can simultaneously be:
- **Design** — visual clarity, affordance, layout, form UX, interaction patterns
- **Engineering** — data schema, save flow, API, state management, infrastructure
- **Content** — microcopy, labels, instructions, UX writing, naming

Example: "It's unclear what this field is" is SIMULTANEOUSLY a design issue (no persistent label, no field type differentiation), an engineering issue (missing schema field), and a content issue (label says "url" instead of "Website"). Do NOT force single-category classification. Route to ALL applicable tracks, implement across all of them, and document in all applicable feedback logs during Post-Flight.

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
   → Read `docs/content-feedback-log.md` (recent entries for context).
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

Do NOT read docs that don't match your task. Do NOT read full doc files when only one section is relevant. The Section Index exists so you can target-read.

# Post-Flight: Mandatory Reflection

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

Each app with its own deployment lifecycle has a version manifest (JSON file at the repo root). The version scripts are data-driven — `scripts/version-bump.mjs` and `scripts/version-release.mjs` contain an `APPS` config map. **When adding a new versioned app, register it in both scripts.**

## Manifest Structure (shared across all apps)

| Field | Meaning |
|---|---|
| `version` | The development version (what `dev` branch is building toward) |
| `release.version` | The deployed version (what's live on Vercel from `main`) |
| `release.name` | Display name, e.g. "Élan 1.0.0" or "ASCII Art Studio 0.1.0" |
| `release.releasedAt` | ISO 8601 timestamp of last deploy |

## Registered Apps

| App | Manifest | Sync target | Version commands |
|-----|----------|-------------|------------------|
| **Élan** (design system + portfolio) | `elan.json` | `playground/src/lib/elan.ts` | `npm run version:patch/minor/major/release/analyze/auto` |
| **ASCII Art Studio** | `ascii-studio.json` | `ascii-tool/src/lib/version.ts` | `npm run ascii-tool:version:patch/minor/major/release` |

## Semver Policy (applies to all apps)

- **Patch** (x.y.Z): Bug fixes, value tweaks, minor component adjustments
- **Minor** (x.Y.0): New features, new components, non-breaking additions
- **Major** (X.0.0): Breaking changes, API changes, architectural shifts

## Checkpoint Workflow

When the user says "checkpoint", "merge to main", or "deploy":

```bash
# 1. Verify version level is appropriate (auto-bumps if needed)
npm run version:auto                       # Analyzes git diff → applies patch/minor/major if needed

# 2. Release ALL apps that have unreleased changes
npm run version:release                    # Élan
npm run ascii-tool:version:release         # ASCII Art Studio (skip if no changes)

git add elan.json ascii-studio.json
git commit -m "release: Élan $(node -p \"require('./elan.json').release.version\"), ASCII Art Studio $(node -p \"require('./ascii-studio.json').release.version\")"
git checkout main
git merge dev
git push origin main
git checkout dev

# 3. Bump all released apps to next dev patch
npm run version:patch
npm run ascii-tool:version:patch

git add elan.json ascii-studio.json
git commit -m "chore: begin Élan $(node -p \"require('./elan.json').version\"), ASCII Art Studio $(node -p \"require('./ascii-studio.json').version\")"
git push origin dev
```

**Runtime exposure:**
- Main site: `<meta name="generator">` tag contains the Élan release version
- Playground footer: shows live version, "last updated" date (live in dev via `/api/dev-info`, static in production), and change analysis badge (e.g., "22 changes · suggests minor")
- Playground sidebar header: shows `Élan {version}` — live-updated in dev mode
- ASCII Art Studio: version accessible via `ascii-tool/src/lib/version.ts`

**Changelog:** `CHANGELOG.md` at repo root tracks what changed in each version for all apps. Prefix entries with the app name.

# Cross-App Parity Checklist

This project has THREE Next.js apps: main site (`src/`), playground (`playground/`), and ASCII Art Studio (`ascii-tool/`). **This is a blocking gate — run after every creation or modification.**

| What you did | What you MUST also do |
|---|---|
| Created a new component in `src/components/` | Create `playground/src/app/components/<slug>/page.tsx` preview AND add sidebar entry in `playground/src/components/sidebar.tsx` |
| Modified a component in `src/components/` | Update `playground/src/components/<name>.tsx` (reusable version) AND `playground/src/app/components/<slug>/page.tsx` (demo). All three must stay in sync — behavior, visuals, and interaction patterns. See EAP-028. |
| Added a font or dependency to root `package.json` | Add to `playground/package.json` too, wire in `playground/src/app/layout.tsx` |
| Changed font loading in `src/app/(frontend)/layout.tsx` | Mirror in `playground/src/app/layout.tsx` |
| Added CSS variables or tokens | Update `playground/src/app/globals.css` AND `ascii-tool/src/app/globals.css` if needed |
| Modified `src/styles/tokens/` | Run `npm run sync-tokens` to update `playground/src/lib/tokens.ts` |
| Modified `src/styles/tokens/_breakpoints.scss` | Update `--breakpoint-*` in BOTH `playground/src/app/globals.css` AND `ascii-tool/src/app/globals.css` `@theme` blocks. See AP-038 for why mixed breakpoint systems are an anti-pattern. |
| Modified a DS component used by ASCII Art Studio | Update the Tailwind version in `ascii-tool/src/components/ui/` to match |
| Modified a playground `Demo*` component or conducted a design experiment in playground | Update the corresponding production component in `src/components/ui/` to match the experiment's outcome. Document the decision. See EAP-030. |
| Conducted a design experiment that changes token values or component API | Document the outcome in `docs/design-feedback-log.md` AND propagate to production in the same session |
| Added a new app to the monorepo | Follow the **New App Onboarding Checklist** below |

# New App Onboarding Checklist

When adding a new Next.js app to this monorepo, **all steps are mandatory**. An app that exists without being documented is a maintenance hazard.

| Step | What to do | Where |
|------|-----------|-------|
| 1 | Create the app directory with `package.json`, `next.config.ts`, `tsconfig.json`, `postcss.config.mjs` | `<app-dir>/` |
| 2 | Copy and adapt `globals.css` from playground (synced design tokens via `@theme`) | `<app-dir>/src/app/globals.css` |
| 3 | Wire Geist fonts + ThemeProvider in `layout.tsx` | `<app-dir>/src/app/layout.tsx` |
| 4 | Register the port in `docs/port-registry.md` | Port 4000–5000 range |
| 5 | Add `npm run <app-name>` script to root `package.json` | Root `package.json` |
| 6 | **Add to the App Registry table in `AGENTS.md`** | This file, App Registry section |
| 7 | Create a version manifest (`<app-name>.json`) at the repo root if the app has its own release cycle | Root |
| 8 | Register the app in `scripts/version-bump.mjs` and `scripts/version-release.mjs` APPS config | Scripts |
| 9 | Add version bump scripts to root `package.json` (`<app>:version:patch/minor/major/release`) | Root `package.json` |
| 10 | Create a synced version TS file (`<app-dir>/src/lib/version.ts`) and register it as a sync target | App + scripts |
| 11 | Update the Cross-App Parity Checklist to include the new app | This file |
| 12 | Update `docs/engineering.md` §9 route namespace table | `docs/engineering.md` |
| 13 | Document in `docs/engineering-feedback-log.md` | Feedback log |

**Why this exists:** The ASCII Art Studio was the first app added after the initial two (main site + playground). Without this checklist, port registration, version control setup, and architecture documentation were done as afterthoughts rather than as part of the app creation workflow. This checklist makes those steps a first-class requirement.

# CMS-Frontend Parity Checklist

CMS data flows through a **three-layer stack**. A change to any one layer MUST be accompanied by changes to the other two. **This is a blocking gate — run after every field addition, removal, or rename.**

**The four layers:**
1. **Schema** — `src/globals/*.ts` or `src/collections/*.ts` (what the Payload admin panel shows)
2. **Data fetch** — `src/app/(frontend)/*/page.tsx` (server component that fetches from CMS and passes to client — MUST include `id`)
3. **UI** — `src/app/(frontend)/*Client.tsx` (TypeScript types, inline edit `*_FIELDS` definitions, rendering)
4. **Inline edit** — Every CMS text field wrapped in `EditableText` when admin, with `EditButton` for full admin access

| What you did | What you MUST also do |
|---|---|
| Added a field to a Payload global/collection schema | 1. Add to the `page.tsx` data fetch mapping (incl. `id` and fallbacks). 2. Add to the `*Client.tsx` TypeScript type. 3. Add to the inline edit `*_FIELDS` array. 4. Render in the component. 5. Wrap with `EditableText` when admin. 6. **Restart the dev server.** |
| Added a field to a frontend type or inline edit fields | 1. Add to the Payload schema (`src/globals/` or `src/collections/`). 2. Add to the `page.tsx` data fetch mapping. 3. **Restart the dev server.** |
| Modified the `page.tsx` data fetch | 1. Verify the Payload schema has the field. 2. Verify the client type and inline edit fields match. |
| Renamed or changed a field's type | Update **all four layers** atomically. |
| Removed a field | Remove from all four layers. |
| Created a new component rendering CMS data | 1. Accept `id` and `isAdmin` props. 2. Wrap text fields in `EditableText` when admin. 3. Add `EditButton`. 4. Pass `id` from server fetch. 5. Pass `isAdmin` from parent. See EAP-029. |

**Quick verification:** After any field change, run `curl -s http://localhost:4000/api/globals/<slug> | python3 -m json.tool` and confirm every field in the JSON response matches the frontend TypeScript type.

**Why this exists:** CMS schema, data fetch, and frontend UI are three separate manual maintenance points. Without atomic updates, fields silently drift: the admin panel shows a field the frontend ignores, or the frontend renders a field the CMS doesn't persist. Five incidents in one session (ENG-027 through ENG-031) proved incremental patching doesn't work — this checklist prevents the class of failure.

# Token Sync Protocol

When modifying any file in `src/styles/tokens/`:
1. Make the change in the SCSS source of truth
2. Run `npm run sync-tokens` to regenerate playground data
3. Verify: `curl -sI http://localhost:4001/tokens/colors`
4. If adding new semantic tokens, update `playground/src/app/globals.css`

# Component Registry

`archive/registry.json` is the **single source of truth** for all design system artifacts.

**When creating a new artifact — all three steps are mandatory:**

**Step 1: Registry entry** — Add to `archive/registry.json`:
```json
{
  "id": "<experiment>-<kebab-name>",
  "name": "Human-Readable Name",
  "type": "Component | Page | Token | Style",
  "experiment": "experiment-XX | shared",
  "status": "active",
  "description": "What this artifact does.",
  "sourcePath": "src/path/to/file",
  "createdAt": "<ISO 8601 timestamp>",
  "createdBy": "user | cursor",
  "origin": { "type": "custom | library | hybrid", "library": "...", "url": "..." },
  "tags": ["relevant", "tags"],
  "hasPreview": false
}
```

**Step 2: Playground preview** (Components only) —
Create page at `playground/src/app/components/<kebab-name>/page.tsx` and add sidebar entry in `playground/src/components/sidebar.tsx`. A component without a preview is incomplete.

**Step 3: Cross-app parity check** — Run the checklist above.

**Archiving:** Set `status` to `"archived"`, populate `archivePath`/`archivedAt`/`archivedBy`/`reason`, move file to `archive/`.
**Restoring:** Set `status` to `"active"`, remove archive fields, move back to `sourcePath`.
**Origin types:** `custom` (from scratch) · `library` (wrapper/direct usage) · `hybrid` (custom + library)

# Archive — Cold Storage

`/archive/` contains explored-but-shelved code from past experiments.
1. Do NOT reference or import from `/archive/` unless the user explicitly asks.
2. Do NOT include `/archive/` contents in search results during normal work.
3. When shelving: move to `archive/experiment-XX/` or `archive/shared/`, add a comment noting origin and reason.

See `archive/README.md` for the full convention.
