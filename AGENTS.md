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
13. **NEVER** merge to `main` without first running `npm run version:release` — every checkpoint is a versioned release

# Pre-Flight: Conditional Reading

Before writing code, classify your task and read ONLY the matching docs. Do NOT read everything — read the Section Index at the top of the target doc, then ONLY the section that matches your task.

1. **Am I touching UI, visuals, spacing, interaction, or components?**
   → Read `docs/design.md` Section Index (top of file), then the section matching your task.
   → Read `docs/design-anti-patterns.md`.

2. **Am I touching infra, build, data sync, ports, or git?**
   → Read `docs/engineering.md` Section Index (top of file), then the section matching your task.
   → Read `docs/engineering-anti-patterns.md`.

3. **Am I touching portfolio copy, case studies, project descriptions, about page text, or content strategy?**
   → Read `docs/content.md` Section Index (top of file), then the section matching your task.
   → Read `docs/content-anti-patterns.md`.

4. **Is the user giving design feedback (visual complaints, spacing, interaction, "it looks wrong")?**
   → Activate `design-iteration` skill at `.cursor/skills/design-iteration/SKILL.md`.
   → The skill handles full doc reading + feedback log processing.

5. **Is the user reporting a bug or engineering issue ("it doesn't work", "it's broken")?**
   → Activate `engineering-iteration` skill at `.cursor/skills/engineering-iteration/SKILL.md`.
   → The skill handles full doc reading + incident processing.

6. **Is the user giving content feedback ("the copy doesn't work", "this doesn't read well", "rewrite this", "the case study needs work")?**
   → Read `docs/content.md` (full file — content docs are shorter than design/engineering).
   → Read `docs/content-anti-patterns.md`.
   → Read `docs/content-feedback-log.md` (recent entries for context).
   → Process feedback, implement changes, then close the loop per Post-Flight.

7. **Am I starting or stopping a server?**
   → Read `docs/port-registry.md`.

8. **Ambiguous: "it looks wrong"** → Design track (option 4).
   **Ambiguous: "it doesn't work"** → Engineering track (option 5).
   **Ambiguous: "it doesn't read well" / "the story isn't clear"** → Content track (option 6).

9. **Is it time for a doc audit?** (check `docs/doc-audit-log.md` — if last audit was 7+ days ago or the file doesn't exist, suggest running one)
   → Activate `doc-audit` skill at `.cursor/skills/doc-audit/SKILL.md`.

Do NOT read docs that don't match your task. Do NOT read full doc files when only one section is relevant. The Section Index exists so you can target-read.

# Post-Flight: Mandatory Reflection

**After completing any design, engineering, or content work**, close the loop. This is not optional — skipping it means the knowledge generated by the task is lost.

**Design work (Routes 1 or 4 above):**
1. Append to `docs/design-feedback-log.md` — what was the intent, what was decided, what was learned.
2. Update `docs/design.md` if the work reveals a new principle, refines an existing one, or establishes a policy.
3. Update `docs/design-anti-patterns.md` if the work exposed a pattern to avoid.

**Engineering work (Routes 2 or 5 above):**
1. Append to `docs/engineering.md` if the work reveals a new operational principle.
2. Update `docs/engineering-anti-patterns.md` if a failure mode was encountered.

**Content work (Routes 3 or 6 above):**
1. Append to `docs/content-feedback-log.md` — what was the intent, what was decided, what was learned.
2. Update `docs/content.md` if the work reveals a new content principle, refines an existing one, or establishes a policy.
3. Update `docs/content-anti-patterns.md` if the work exposed a content pattern to avoid.

**Why this exists:** The default execution loop is explore → implement → verify → report. That loop captures what was *done* but not what was *learned*. Every task — even proactive work that isn't responding to a complaint — generates design, engineering, or content knowledge. Without a mandatory reflection gate, that knowledge evaporates at session end.

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

# Design System Versioning — Élan

The design system is named **Élan** and follows semantic versioning. `elan.json` at the repo root is the single source of truth.

| Field | Meaning |
|---|---|
| `version` | The development version (what `dev` branch is building toward) |
| `release.version` | The deployed version (what's live on Vercel from `main`) |
| `release.name` | Display name, e.g. "Élan 1.0.0" |
| `release.releasedAt` | ISO 8601 timestamp of last deploy |

**Semver policy:**
- **Patch** (1.0.x): Token value changes, bug fixes, minor component tweaks
- **Minor** (1.x.0): New tokens, new components, new playground pages, non-breaking additions
- **Major** (x.0.0): Breaking token renames/removals, component API changes, architectural shifts

**Version bump commands:**
- `npm run version:patch` / `npm run version:minor` / `npm run version:major` — bump the dev version in `elan.json`
- `npm run version:release` — promote dev version to release (stamps `release.version`, `release.name`, `release.releasedAt`)

**Checkpoint workflow (updated):**
When the user says "checkpoint", "merge to main", or "deploy":

```bash
npm run version:release          # promote dev version → release
git add elan.json
git commit -m "release: Élan $(node -p \"require('./elan.json').release.version\")"
git checkout main
git merge dev
git push origin main
git checkout dev
npm run version:patch             # bump dev to next patch
git add elan.json
git commit -m "chore: begin Élan $(node -p \"require('./elan.json').version\")"
git push origin dev
```

**Runtime exposure:**
- Main site: `<meta name="generator">` tag contains the release version
- Playground: page-level footnote (in the Shell component) shows version and last-updated date on every page

**Changelog:** `CHANGELOG.md` at repo root tracks what changed in each version. Update it as part of every version bump.

# Cross-App Parity Checklist

This project has TWO Next.js apps: main site (`src/`) and playground (`playground/`). **This is a blocking gate — run after every creation or modification.**

| What you did | What you MUST also do |
|---|---|
| Created a new component in `src/components/` | Create `playground/src/app/components/<slug>/page.tsx` preview AND add sidebar entry in `playground/src/components/sidebar.tsx` |
| Added a font or dependency to root `package.json` | Add to `playground/package.json` too, wire in `playground/src/app/layout.tsx` |
| Changed font loading in `src/app/(frontend)/layout.tsx` | Mirror in `playground/src/app/layout.tsx` |
| Added CSS variables or tokens | Update `playground/src/app/globals.css` if needed |
| Modified `src/styles/tokens/` | Run `npm run sync-tokens` to update `playground/src/lib/tokens.ts` |

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
