# Engineering — Accumulated Knowledge

> **What this file is:** The synthesized, authoritative engineering knowledge base for yilangao.com. Every principle here was extracted from real incidents, debugging sessions, and process failures. This is a living document — it grows after every engineering incident.
>
> **Who reads this:** AI agents routed here by `AGENTS.md` Pre-Flight. Read the Section Index first, then only the section matching your task.
> **Who writes this:** AI agents after processing engineering feedback via the `engineering-iteration` skill.
> **Last updated:** 2026-03-30 (§10.5–10.8: automated version analysis, live dev info API, runtime exposure)

---

## Section Index — Read This First

| § | Topic | Read when |
|---|-------|-----------|
| §0 | Engineering Posture | Always for infra/build work (~8 lines — read this every time) |
| §1 | Localhost Verification | Starting servers, verifying changes |
| §2 | Port Management | Starting/stopping servers, port conflicts |
| §3 | Single Source of Truth (Token Sync) | Modifying tokens, sync scripts, data flow |
| §4 | Debugging Methodology | Diagnosing any "it doesn't work" issue |
| §5 | Process Principles | Meta — how to approach engineering changes |
| §6 | Git Branching & Session Safety | Branch questions, commits, checkpoints |
| §7 | Cross-App Infrastructure Parity | Adding dependencies, fonts, or infra to either app |
| §8 | Knowledge Enforcement | Recurring incidents, promoting docs to rules layer |
| §9 | Multi-App Architecture & URL Namespace | Adding routes, new apps, or CMS endpoints |
| §10 | Design System Versioning (Élan) | Version bumps, releases, checkpoint workflow |
| §11 | CMS-Frontend Data Parity | Adding/removing/renaming CMS fields, inline edit fields, or frontend types |
| §12 | Media & File Storage (Supabase Storage) | Uploading files, adding upload collections, storage config |
| Appendix | Incident Frequency Map | Checking for recurring incident patterns |

---

## 0. Engineering Posture

**Treat every change as live.** This is not a static codebase — multiple dev servers, experiments, and the playground may be running simultaneously. Every code change must be verified on localhost. Every process must be aware of what else is running. Every data source must have exactly one canonical definition.

- **Localhost is non-negotiable.** If it's not running and rendering correctly on localhost, the change isn't done.
- **Port awareness is mandatory.** Read `docs/port-registry.md` before starting any server. Never kill processes blindly.
- **Single source of truth for data.** When the same data exists in multiple files, there must be an automated sync mechanism — not human discipline.
- **Verify after every change.** curl the page, check the terminal for errors, spot-check the rendered output.

---

## How to Use This File

1. **Read the Section Index above** — match your task to a section, read only that section.
2. **If the user reports a bug**, activate the `engineering-iteration` skill — it will handle full doc reading.
3. **After resolving an issue**, update this file: strengthen existing principles or add new ones.
4. **Do NOT read the entire file** unless the skill protocol requires it.

---

## 1. Localhost Verification

**Severity: Critical** — Failing to verify on localhost was the root cause of the playground drift incident (ENG-001).

### 1.1 Before Any Work

- Verify the relevant dev server is running and responding.
- Never assume a dev server is still running from a previous session — check the terminal or `lsof`.
- If the server is down, start it before making code changes.

### 1.2 After Any Change

- After modifying tokens, components, or pages: verify the page loads on localhost.
- After modifying data files: verify the data renders in the UI.
- After modifying build config: verify the build completes and the server restarts.

### 1.3 Verification Commands

```bash
# Check if a port is responding
curl -sI http://localhost:4000 | head -1

# Check all running Node.js servers
lsof -i -P -n | grep LISTEN | grep node

# Check specific port
lsof -i :4000 -P -n | grep LISTEN
```

---

## 2. Port Management

**Severity: Critical** — Port conflicts waste time and can kill running services.

### 2.1 Port Assignments

All dev servers use ports in the **4000–5000** range. The canonical ledger is `docs/port-registry.md`.

| Service | Default Port |
|---------|-------------|
| Main site (yilangao.com) | 4000 |
| Playground (design system) | 4001 |

### 2.2 Protocol

1. **Before starting a server:** Read `docs/port-registry.md`. Check if the port is already in use.
2. **Never `kill -9` a port** without first checking what process owns it and whether it's needed.
3. **Never use ports below 4000** — they may belong to other projects on the machine.
4. **After starting/stopping:** Update the port registry ledger.

### 2.3 When Ports Conflict

If the default port is occupied:
1. Check what's running: `lsof -i :4001 -P -n`
2. If it's a stale process, kill it and restart on the default port.
3. If it's a legitimate process, pick the next free port in 4000–5000.
4. Log the temporary port in the registry with a reason.

---

## 3. Single Source of Truth (Token Sync)

**Severity: Critical** — Manual data duplication caused the playground drift incident (ENG-001).

### 3.1 The Problem

Color tokens exist in three locations:
1. `src/styles/tokens/_colors.scss` — **canonical source** (SCSS variables)
2. `playground/src/lib/tokens.ts` — playground UI data (TypeScript)
3. `playground/src/app/globals.css` — Tailwind `@theme` block (CSS custom properties)

### 3.2 The Rule

`_colors.scss` is the single source of truth. When modifying it:

1. Run `npm run sync-tokens` — this regenerates the color portion of `playground/src/lib/tokens.ts` from the SCSS source.
2. Verify the playground page loads and renders the changes: `curl -sI http://localhost:4001/tokens/colors`
3. If adding a new semantic token category, manually update `globals.css` if the token needs a CSS custom property for Tailwind (this mapping includes light/dark variants and is not auto-generated).

### 3.3 Sync Points

| Source | Consumer | Synced How | When to Update |
|--------|----------|-----------|----------------|
| `_colors.scss` | `tokens.ts` (colors) | `npm run sync-tokens` | After any `_colors.scss` change |
| `_colors.scss` | `playground/globals.css` | Manual (light/dark mapping) | When adding semantic tokens that need CSS custom properties |
| `_typography.scss` | `tokens.ts` (typography) | Manual | When adding/changing font stacks, weights, scale |
| `src/app/layout.tsx` (font loading) | `playground/src/app/layout.tsx` | Manual | When adding/changing font packages or CSS variables |
| Root `package.json` (font deps) | `playground/package.json` | Manual | When adding font packages used by both apps |

### 3.4 Other Token Files

Typography, spacing, motion, elevation, and breakpoints in `tokens.ts` are still manually maintained. They change infrequently enough that automated sync is not yet warranted. If drift becomes a pattern, extend the sync script.

**Important:** Font-related changes are NOT just data — they also require **infrastructure parity** between the main app and the playground (package installation, `next/font` imports, CSS variable injection). See §6.

---

## 4. Debugging Methodology

### 4.1 Diagnose Before You Patch

When something "doesn't work," the root cause is usually one of:
1. **Data sync issue** — the UI reads from a different source than what was modified.
2. **Process issue** — the server isn't running, crashed, or is on a different port.
3. **Build issue** — the change isn't being picked up by the bundler.
4. **Architecture issue** — the system design makes the failure possible.

Check in this order. Don't skip to "add more code" before verifying the fundamentals.

### 4.2 Incident Response

When a user reports something broken:
1. **Reproduce first** — curl the URL, check the terminal, read error output.
2. **Check the obvious** — is the server running? Is it the right port? Did the file save?
3. **Check data flow** — trace from source file → build → server → browser.
4. **Fix and verify** — make the fix, verify on localhost, document in the engineering feedback log.

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

## 6. Git Branching & Session Safety

**Severity: Critical** — Working directly on `main` creates rollback risk. Branch-per-session creates forgotten-merge risk.

### 6.1 Two-Branch Model

This project uses exactly two permanent branches:

| Branch | Purpose | Who writes | When it changes |
|--------|---------|-----------|-----------------|
| `dev` | All ongoing work. Always checked out. | Agent sessions + human | Every commit |
| `main` | Stable checkpoints. Deployed state. | Human-triggered merge only | When user says "checkpoint" or "merge to main" |

No other branches should exist. No feature branches, no session branches, no experiment branches.

### 6.2 Why Not Branch-Per-Session

Multiple agent sessions run concurrently in the same Cursor workspace. They share the same filesystem and git checkout. Creating separate branches provides zero isolation (only one branch can be checked out in a single directory) and creates branch accumulation because there is no reliable "end of session" trigger to merge back.

### 6.3 Agent Protocol — Branch Check Before Writing

Before making any file changes in a session, an agent MUST:

1. Check the current branch: `git branch --show-current`
2. If on `main`, switch to `dev`:
   ```bash
   git checkout dev
   ```
3. If `dev` does not exist (should never happen), create it from `main`:
   ```bash
   git checkout -b dev main
   ```

This is a **hard gate** — no files should be written until the agent is confirmed on `dev`.

**NEVER create new branches.** Never run `git checkout -b`. The only branches are `dev` and `main`.

### 6.4 Concurrent Session Safety

All agent sessions in the same Cursor workspace share the same `dev` branch and filesystem. Isolation comes from **task partitioning**, not branching:

- Concurrent agents should work on **different files**. Two agents editing the same file simultaneously will cause overwrites regardless of branching strategy.
- If two tasks require modifying the same file, serialize them — finish one before starting the other.

### 6.5 Checkpoint Workflow (Merging to `main`)

When the user says "checkpoint", "merge to main", or "deploy":

```bash
# 1. Stamp the release version
npm run version:release
git add elan.json
git commit -m "release: Élan $(node -p \"require('./elan.json').release.version\")"

# 2. Merge to main and push
git checkout main
git merge dev
git push origin main

# 3. Return to dev and bump to next patch
git checkout dev
npm run version:patch
git add elan.json
git commit -m "chore: begin Élan $(node -p \"require('./elan.json').version\")"
git push origin dev
```

After this, `main` reflects the latest stable state with a stamped Élan release. If Vercel is connected, it auto-deploys from `main`. The agent then continues working on `dev` with the version already bumped to the next patch.

### 6.6 Rollback

If `dev` gets into a bad state, it can be reset to the last checkpoint:

```bash
git checkout dev
git reset --hard main
```

This discards all work on `dev` since the last merge to `main`. Use with caution.

### 6.7 What If I'm on `main` with Uncommitted Changes?

Move them to `dev` without losing work:

```bash
git stash
git checkout dev
git stash pop
```

---

## 7. Cross-App Infrastructure Parity

**Severity: Critical** — The playground font gap (ENG-002) was caused by adding infrastructure to the main app without propagating it.

### 6.1 The Problem

This project has two Next.js apps: the main site (`src/`) and the playground (`playground/`). They share design tokens and should present the same visual identity. When a new dependency, font package, or framework feature is added to one app, the other may also need it — but there's no automated check for this.

Font loading is the canonical example: adding `geist` to the root `package.json` and wiring it in `src/app/layout.tsx` does nothing for the playground, which has its own `package.json` and `layout.tsx`.

### 6.2 The Rule

When adding any of the following to the main app, explicitly check whether the playground also needs it:

| Change Type | Main App Location | Playground Equivalent |
|---|---|---|
| Font package | Root `package.json` | `playground/package.json` |
| Font loading (`next/font`) | `src/app/layout.tsx` | `playground/src/app/layout.tsx` |
| CSS variable injection | `<html className={vars}>` | `<html className={vars}>` |
| CSS theme font-family | `src/app/globals.scss` | `playground/src/app/globals.css` |
| New token category | `src/styles/tokens/` | `playground/src/lib/tokens.ts` |
| **New reusable component** | `src/components/Foo.tsx` | `playground/src/app/components/foo/page.tsx` + sidebar entry in `sidebar.tsx` |

### 6.3 Checklist (After Any Shared Infrastructure Change)

1. Did you add a new dependency that affects visual output? -> Check both `package.json` files.
2. Did you add or change font loading? -> Check both `layout.tsx` files.
3. Did you add CSS variables that tokens reference? -> Check both global CSS files.
4. Does the playground's preview page hardcode values instead of reading from tokens? -> Fix it to use token values.
5. **After any font change:** Run `grep -r "fontFamily" playground/src/ --include="*.tsx"` to find inline overrides. There should be zero hardcoded font families in component pages (ENG-003).
6. **After creating any new component in `src/components/`:** Create a playground preview page at `playground/src/app/components/<slug>/page.tsx` and add a sidebar entry in `playground/src/components/sidebar.tsx`. Also add an entry to `archive/registry.json` (ENG-004).

### 6.4 Experiment Propagation Protocol (Bidirectional Sync)

**Severity: Critical** — Three playground experiments (Button, Spacing, Typography) were conducted across sessions without propagating to production, causing a multi-phase alignment effort (ENG-072, EAP-030).

The Cross-App Parity Checklist in `AGENTS.md` is **bidirectional**. It applies in both directions:

| Direction | Trigger | Required Action |
|-----------|---------|-----------------|
| Production → Playground | Modified a component in `src/components/` | Update playground Demo* and demo page to match |
| Playground → Production | Modified a Demo* component or conducted a design experiment | Update production `src/components/ui/` to match the experiment's outcome |
| Either direction | Changed a token value or component API | Document the decision in the appropriate feedback log |

**End-of-session verification:** Before ending any session that touched DS components or tokens, run the full parity checklist from `AGENTS.md` in BOTH directions. A session is not complete until both apps reflect the same design decisions.

---

## 8. Knowledge Enforcement (Rules Layer vs. Docs Layer)

**Severity: Critical** — The cross-app parity category recurred 3 times (ENG-002, ENG-003, ENG-004) despite being documented after the first incident.

### 7.1 The Problem

Engineering principles documented in `docs/engineering.md` are read by agents at session start, but long documents get diluted. The agent retains the general idea but forgets specific checklist items when deep in implementation. This is especially true for cross-cutting concerns (like "also update the playground") that aren't directly related to the task at hand.

### 7.2 The Rule

When the same category of incident occurs **3 or more times**, the fix is not to add more documentation. The fix is to **promote the check from docs to the rules layer**:

1. Add it to `AGENTS.md` Hard Guardrails (NEVER/ALWAYS list).
2. If it's part of a workflow (e.g., artifact creation), add it as a mandatory step in `AGENTS.md`.
3. Make it an **inline checklist** — not a pointer to a doc file.

### 7.3 Why This Matters

The always-on layer (`AGENTS.md`) is processed by the agent with higher priority and shorter context than doc files. Items in Hard Guardrails are treated as hard gates. Items in docs are treated as reference material. The enforcement hierarchy is:

| Level | Where | Agent behavior |
|-------|-------|----------------|
| **Hard gate** | `AGENTS.md` Hard Guardrails and mandatory protocols | Agent checks these before considering task complete |
| **Soft reference** | `docs/engineering.md`, `docs/design.md` | Agent reads per routing table, may not recall specific items during implementation |
| **Background knowledge** | Feedback logs, anti-patterns catalog | Agent consults when debugging, not proactively |

Recurring incidents should be escalated up this hierarchy until they stop recurring.

---

## 9. Multi-App Architecture & URL Namespace Separation

**Source:** User feedback, 2026-03-29 — "Why is the admin part using the same localhost? You might not want to use the same kind of URL for both the CMS and the design system."

### 9.1 The Current Architecture

This project runs four distinct concerns across three Next.js processes:

| Concern | Audience | Port | Route space | Process |
|---------|----------|------|-------------|---------|
| Public portfolio | Visitors | 4000 | `/`, `/reading`, etc. | Main site |
| CMS admin panel | Site owner (editor) | 4000 | `/admin/*` | Main site (shared) |
| Design system playground | Developers/designers | 4001 | `/tokens/*`, `/components/*` | Playground (separate) |
| ASCII Art Studio | Public users | 4002 | `/` (single-page) | ASCII tool (separate) |

The CMS admin and public site share a process and URL namespace. This is a **Payload CMS 3 design constraint** — Payload embeds into your Next.js app and serves admin UI at a configurable route prefix (default `/admin`). The ASCII Art Studio is a fully standalone app with its own dependencies (ffmpeg.wasm, idb-keyval) and its own version manifest (`ascii-studio.json`).

### 9.2 Known Trade-offs

**Shared process (portfolio + CMS on port 4000):**
- In production, `/admin` login page is publicly accessible (though auth-gated)
- Admin panel CSS/JS bundles are included in the production build even for public visitors
- A CMS crash or heavy admin operation can affect public page performance
- Route namespace collision risk if the portfolio ever needs `/admin` for portfolio content

**Separate process (playground on port 4001):**
- Clean separation — design system tooling never interferes with the live site
- Can be developed, started, and stopped independently
- Different deployment story (playground is dev-only, not deployed to production)

### 9.3 Architectural Decision Record

**Decision:** Accept Payload's embedded architecture for now. The trade-offs are manageable at current scale.

**When to revisit:**
- If the admin panel causes measurable performance impact on public pages
- If a third audience/concern needs to share port 4000 (the namespace is already at capacity with two)
- If the project moves to a multi-service deployment (e.g., separate CMS API server)

**Mitigation for production:**
- Add Next.js middleware to restrict `/admin` access by IP or auth header
- Consider `output: 'standalone'` builds that tree-shake unused admin routes from the public bundle (Payload's roadmap may address this)

### 9.4 The Principle — One Port, One Audience

Each port should ideally serve **one audience with one mental model**. When a port serves two audiences (visitors + editors), the risk of namespace collision, performance crosstalk, and deployment coupling increases. The playground gets this right (port 4001, developers only). The main site violates it out of framework necessity (Payload embeds into Next.js).

When adding new routes or concerns in the future:
1. **Ask first:** Who is the audience? Is it the same audience as an existing port?
2. **If different audience:** Prefer a new port (4002+) over cramming into an existing namespace.
3. **If same audience but different concern:** Use clear route prefixes and document the namespace allocation.

### 9.5 Route Namespace Allocation (Living Reference)

| Port | Prefix | Owner | Purpose |
|------|--------|-------|---------|
| 4000 | `/` | Portfolio | Public pages |
| 4000 | `/admin` | Payload CMS | Content management (framework-mandated) |
| 4000 | `/api` | Payload CMS | CMS REST/GraphQL API |
| 4001 | `/tokens` | Playground | Design token previews |
| 4001 | `/components` | Playground | Component previews |
| 4002 | `/` | ASCII Art Studio | Single-page ASCII art/video tool |

Update this table when adding new route prefixes or services. See also the **App Registry** in `AGENTS.md` for the authoritative list of all apps.

---

## 10. Design System Versioning (Élan)

**Source:** Session 2026-03-29 — "Let's start doing version control for the design system."

### 10.1 Overview

The design system is named **Élan** and uses semantic versioning (major.minor.patch). The single source of truth is `elan.json` at the repo root.

The two-branch model maps directly onto the version lifecycle:
- `dev` branch carries the **development version** — the next version being built
- `main` branch carries the **released version** — what's deployed on Vercel

### 10.2 Manifest Structure (`elan.json`)

| Field | Purpose |
|---|---|
| `name` | Always "Élan" |
| `version` | Development version (always >= `release.version`) |
| `release.version` | Currently deployed version |
| `release.name` | Display name, e.g. "Élan 1.0.0" |
| `release.releasedAt` | ISO 8601 timestamp of last deploy |

### 10.3 Semver Policy

| Level | When to use | Examples |
|---|---|---|
| **Patch** (1.0.x) | Token value changes, bug fixes, minor component tweaks | Adjust a color hex, fix a mixin edge case |
| **Minor** (1.x.0) | New tokens, new components, new playground pages, non-breaking additions | Add a new semantic color role, create a new component |
| **Major** (x.0.0) | Breaking token renames/removals, component API changes, architectural shifts | Rename `$portfolio-*` prefix, restructure token files |

### 10.4 Commands

| Command | Effect |
|---|---|
| `npm run version:patch` | Bump dev version patch number |
| `npm run version:minor` | Bump dev version minor number |
| `npm run version:major` | Bump dev version major number |
| `npm run version:release` | Promote `version` → `release.version`, stamp `releasedAt` |
| `npm run version:analyze` | Analyze git diff since last release and recommend a bump level |
| `npm run version:auto` | Analyze + auto-apply the recommended bump |

### 10.5 Automated Version Analysis (`scripts/version-analyze.mjs`)

The analysis script scans git diff since the last release and categorizes changes to determine the appropriate semver bump:

| Signal | Bump Level | Example |
|---|---|---|
| Component file(s) deleted | **Major** | Removed a shared component |
| Component file(s) renamed | **Major** | Changed import paths |
| Token file(s) deleted | **Major** | Removed a token category |
| New component file(s) added | **Minor** | Created a new DS component |
| 3+ token files AND 5+ component files modified | **Minor** | Broad design refresh |
| 15+ total DS files changed | **Minor** | Large scope of work |
| Everything else | **Patch** | Value tweaks, bug fixes |

The script checks if the current dev version already satisfies the recommended level (e.g., if analysis says "minor" and version is already 1.1.0 vs release 1.0.0, no bump needed).

**Usage patterns:**
- Run `npm run version:analyze` periodically to check if the current version is appropriate.
- Run `npm run version:auto` to let the script decide and apply the bump.
- The playground footer also displays the analysis in real-time during development (via `/api/dev-info`).

### 10.6 Release Workflow

Integrated into the checkpoint workflow (§6.5). Before merging to `main`:
1. Run `npm run version:analyze` to verify the version level is appropriate
2. Run `npm run version:auto` if it recommends a bump
3. Run `npm run version:release` to stamp the release
4. Commit the updated `elan.json`
5. Merge to `main` and push
6. Return to `dev`, bump to next patch, commit

### 10.7 Runtime Exposure

- **Main site:** `<meta name="generator" content="Élan x.x.x">` in the HTML head (release version, from `elan.json`)
- **Playground footer:** Shows version, live "last updated" date (via `/api/dev-info` in dev, static `releasedAt` in production), and change analysis summary
- **Playground sidebar header:** Shows `Élan {version}` — live-updated in dev mode via the same API

### 10.8 Live Dev Info API (`playground/src/app/api/dev-info/route.ts`)

In development mode, the playground exposes `/api/dev-info` which returns:
- `lastModified` — ISO timestamp of the most recent DS file change (git log + uncommitted check)
- `lastModifiedDate` — date portion for display
- `currentVersion` / `releaseVersion` — from `elan.json`
- `analysis` — same change analysis as the standalone script

The `useDevInfo()` hook (`playground/src/hooks/use-dev-info.ts`) polls this endpoint every 60 seconds and provides the data to the Shell footer and Sidebar header components. In production, the endpoint returns 403 and components fall back to the static `elan.ts` data.

### 10.7 Changelog

`CHANGELOG.md` at repo root follows [Keep a Changelog](https://keepachangelog.com/) format. Update it when bumping versions — document what was Added, Changed, Removed, or Fixed.

---

## 11. CMS-Frontend Data Parity

**Source:** Session 2026-03-29, five incidents in the CMS UX / inline editing category (ENG-027→031). Escalation trigger activated.

### 11.1 The Three-Layer Contract

CMS data flows through three layers that form a single contract. All three must be modified atomically when a field changes:

1. **Schema layer** — `src/globals/*.ts` or `src/collections/*.ts`. Defines what the Payload admin panel shows and what the database stores.
2. **Data fetch layer** — `src/app/(frontend)/*/page.tsx`. Server components that call `payload.findGlobal()` or `payload.find()` and map CMS data to typed props.
3. **UI layer** — `src/app/(frontend)/*Client.tsx`. TypeScript types, inline edit `*_FIELDS` definitions, and rendering logic.

### 11.2 Rules

1. **Every CMS field must exist in all three layers.** A field in the schema but not the UI is invisible to the frontend. A field in the UI but not the schema is a save that silently drops data.
2. **Schema changes require a server restart.** Payload pushes schema to the database only on startup. Without a restart, the column doesn't exist and the API silently strips the field. This is not optional — add it to your task sequence.
3. **Inline edit `*_FIELDS` must mirror the schema exactly.** Every field the user can edit in the panel must correspond to a real CMS field, and every CMS field should be editable (unless intentionally read-only).
4. **Fallback data in `page.tsx` must include all fields.** Fallback objects that omit a field (e.g., `{ name: "X" }` when the type requires `{ name: "X", url: "" }`) will cause TypeScript and rendering issues.

### 11.3 Checklist

See `AGENTS.md` → "CMS-Frontend Parity Checklist" for the blocking-gate table.

### 11.4 Verification

After any field change, run:
```bash
curl -s http://localhost:4000/api/globals/<slug> | python3 -m json.tool
```
Confirm every field in the JSON matches the frontend TypeScript type.

### 11.5 Inline Edit Mutation Tiers

The inline edit system supports three tiers of CMS mutation from the frontend:

1. **Field-level** — `EditableText` edits a single text/richText field on an existing document via `PATCH /api/{collection}/{id}` or `POST /api/globals/{slug}`.
2. **Array-level** — `EditableArray` manages array fields on globals (add, remove, reorder items) with a modal panel, then saves the entire array via the same global PATCH.
3. **Collection-level** — `AddItemCard` creates new collection documents (`POST /api/{collection}`) and `DeleteItemButton` removes them (`DELETE /api/{collection}/{id}`), both with confirmation UX and `router.refresh()` after completion.

All three tiers use `credentials: 'include'` to authenticate via the `payload-token` session cookie. Tier 3 is independent of the `InlineEditProvider` dirty-field system — it operates directly on Payload's REST API.

---

## 12. Media & File Storage (Supabase Storage)

**Source:** Session 2026-03-30, ENG-053 — "How do I store assets? Where are thumbnails and resumes stored?"

### 12.1 Architecture

All uploaded files (images, PDFs, documents) are stored in **Supabase Storage** via the `@payloadcms/storage-s3` adapter. Supabase Storage exposes an S3-compatible API, so the adapter connects with `forcePathStyle: true`.

| Layer | Service | What it stores |
|-------|---------|---------------|
| **Structured data** | Supabase Postgres (`DATABASE_URL`) | CMS records, file metadata (filename, dimensions, alt text, MIME type) |
| **Binary files** | Supabase Storage (`S3_ENDPOINT`) | Actual images, PDFs, and documents |
| **CDN** | Cloudflare (via Supabase) | Public file delivery with caching |

### 12.2 Configuration

The S3 adapter is configured in `src/payload.config.ts` as a plugin:

```ts
s3Storage({
  collections: { media: true },
  bucket: process.env.S3_BUCKET || 'media',
  config: {
    credentials: {
      accessKeyId: process.env.S3_ACCESS_KEY_ID || '',
      secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || '',
    },
    region: process.env.S3_REGION || 'us-east-1',
    endpoint: process.env.S3_ENDPOINT,
    forcePathStyle: true,
  },
})
```

Required environment variables (in `.env`):

| Variable | Source |
|----------|--------|
| `S3_ENDPOINT` | Supabase Dashboard → Settings → Storage → S3 Connection |
| `S3_BUCKET` | Name of the storage bucket (currently `media`) |
| `S3_REGION` | Supabase project region (currently `us-east-1`) |
| `S3_ACCESS_KEY_ID` | Supabase Dashboard → Settings → Storage → S3 Connection |
| `S3_SECRET_ACCESS_KEY` | Supabase Dashboard → Settings → Storage → S3 Connection |

### 12.3 Rules

1. **No local `media/` directory in production.** The S3 adapter disables local storage. Files go directly to Supabase Storage.
2. **Supabase bucket must be set to Public** for images to be served via CDN URLs.
3. **MIME types:** The Media collection accepts `image/*` and `application/pdf`. To add new file types, update `mimeTypes` in `src/collections/Media.ts`.
4. **Image sizes:** Payload auto-generates three variants via `sharp`: thumbnail (400x300), card (768x512), hero (1920w). These are stored alongside the original in Supabase Storage.
5. **When adding a new collection with uploads**, add it to the `s3Storage` plugin's `collections` map.
6. **Filenames are sanitized before upload.** Supabase Storage's S3 API rejects object keys with square brackets, curly braces, and certain special characters. A `beforeChange` hook on the Media collection strips brackets, replaces spaces and special chars with hyphens, and collapses consecutive hyphens. This runs before the cloud storage plugin's `afterChange` hook, which reads `data.filename` for the S3 key. (ENG-060)
7. **Every field must have `label`, `admin.description`, and `admin.placeholder`.** Bare fields with technical names ("alt", "caption") are incomprehensible to non-technical users. Every Payload field on an upload collection must include a human-readable label, a one-sentence description, and a placeholder example. The collection itself must include `admin.description` explaining the upload process and automatic transformations. (ENG-061)

### 12.4 Public URL Pattern

Files uploaded to the `media` bucket are publicly accessible at:
```
https://<project-ref>.supabase.co/storage/v1/object/public/media/<filename>
```

### 12.5 Verification

After uploading a file via the Payload admin panel or API:
```bash
# Check the file exists in Supabase Storage
curl -sI "https://lrjliluvnkciwnyshexq.supabase.co/storage/v1/object/public/media/<filename>"

# Verify no local file was created
ls media/<filename>  # should return "No such file or directory"
```

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
| Version control / release automation | 1 | High — ENG-069. Stale footer dates and manual-only bumps. Added `/api/dev-info` live endpoint + `version-analyze.mjs` auto-bump script. |
| Radix primitive internal state vs mirrored props | 1 | Medium — ENG-071. Checkbox indeterminate icon branched on React `checked` while uncontrolled `defaultChecked="indeterminate"` leaves prop undefined; UI must follow `CheckboxIndicator` `data-state` (or context), not props alone. |
| Scroll hijack on embedded canvas | 1 | High — ENG-072. onWheel handler on embedded DAG canvas intercepted page scroll. Embedded canvases must never capture wheel events; pan via drag only. See EAP-036. |
| Playground ↔ production drift (one-way experiment) | 2 | **Critical — ENG-073, ENG-074. Drift from non-propagation AND from rebuilding demos with hardcoded values instead of token references. See EAP-030, EAP-055.** |

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
