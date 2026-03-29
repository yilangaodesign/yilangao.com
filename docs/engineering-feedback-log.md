# Engineering Feedback Log

> **What this file is:** Chronological record of every engineering incident and feedback session. Each entry captures the raw issue, the root cause analysis, and what was done. Newest entries first.
>
> **Who reads this:** AI agents at session start (scan recent entries for context), and during incident response (check for recurring patterns).
> **Who writes this:** AI agents after each incident resolution via the `engineering-iteration` skill.
> **Last updated:** 2026-03-29 (ENG-024: nested `<a>` hydration error from EditButton inside Link)

---

## Session: 2026-03-29 — Nested Anchor Hydration Error

**Chat:** Current session

#### ENG-024: `<a>` cannot be a descendant of `<a>` — EditButton inside ProjectCard Link

**Issue:** Browser console showed hydration error: `In HTML, <a> cannot be a descendant of <a>`. The `EditButton` component rendered an `<a>` tag, and it was placed inside `ProjectCard` which is wrapped in a Next.js `<Link>` (also an `<a>`).

**Root Cause:** `EditButton` used `<a href="...">` for navigation. When placed inside a `<Link>` component (like on project cards), this created invalid HTML nesting, which React 19 flags as a hydration mismatch.

**Fix:** Changed `EditButton` and `EditGlobalButton` from `<a>` to `<button type="button">`. Navigation now uses `window.open(href, '_blank')` with `e.stopPropagation()` to prevent the parent link from firing. This is valid HTML nesting and opens the admin editor in a new tab.

**Principle:** Any component that might be rendered inside a `<Link>` or `<a>` must never use `<a>` for its own navigation. Use `<button>` with JS navigation instead.

---

## Session: 2026-03-29 — Admin Editing Overlay (Browse & Edit)

**Chat:** Current session
**Scope:** `src/components/AdminBar.tsx`, `src/components/EditButton.tsx`, `src/lib/admin-auth.ts`, all pages

#### ENG-023: Browse-and-Edit Admin Experience

**Issue:** User wanted to browse the actual live site and click edit buttons directly on content, rather than using the admin panel's preview iframe. More intuitive for CMS beginners.

**Solution:** Built an admin overlay system:

1. **`src/lib/admin-auth.ts`** — server-side utility that checks the `payload-token` cookie to determine if the current visitor is a logged-in Payload admin
2. **`src/components/AdminBar.tsx`** — fixed dark toolbar at the top of every page (only visible to admins). Shows:
   - Purple "Admin" badge
   - Context-aware "Edit this page" button (links to the right admin editor for the current page)
   - "Dashboard" button (back to `/admin`)
   - Dismiss button (hides for the session)
3. **`src/components/EditButton.tsx`** — small purple pencil icon that appears on hover over editable content items. Links directly to `/admin/collections/{collection}/{id}` for that specific item.
4. **Every server page** now checks `isAdminAuthenticated()` and passes `isAdmin` + entity IDs to client components
5. **Every client component** conditionally renders `AdminBar` + `EditButton` when `isAdmin` is true

**Coverage:**
- Home: edit buttons on each project card + "Edit Site Config" in admin bar
- About: "Edit Experience & Education" linking to site-config
- Reading: edit button on each book entry
- Contact: edit button on current testimonial + "Manage Testimonials" admin bar
- Experiments: edit button on each experiment row
- Work/[slug]: "Edit [Project Title]" linking directly to that project

**Principle:** For non-technical CMS users, the most intuitive editing flow is "browse the real site, click edit where you see something wrong." The admin dashboard is still there for bulk operations, but the overlay removes the cognitive overhead of mapping "what I see on the site" to "where I find it in the admin panel."

---

## Session: 2026-03-29 — Live Preview Integration

**Chat:** Current session
**Scope:** `src/payload.config.ts`, `src/components/RefreshRouteOnSave.tsx`, all server pages

#### ENG-022: Live Preview for CMS Admin Panel

**Issue:** User wanted to see a preview of the site while editing content in the admin panel, and ideally click elements to edit them directly.

**Solution:** Implemented Payload CMS server-side Live Preview using `@payloadcms/live-preview-react`.

**What was done:**
1. Added `admin.livePreview` config to `payload.config.ts` with URL routing for all collections and globals:
   - Projects → `/work/{slug}`
   - Books → `/reading`
   - Testimonials → `/contact`
   - Experiments → `/experiments`
   - Site Config → `/`
2. Added responsive breakpoints (Mobile 375px, Tablet 768px, Desktop 1440px)
3. Created shared `RefreshRouteOnSave` client component (`src/components/RefreshRouteOnSave.tsx`) — listens for admin save events and triggers `router.refresh()`
4. Added `RefreshRouteOnSave` to all 6 server pages: home, about, reading, contact, experiments, work/[slug]
5. Added `NEXT_PUBLIC_PAYLOAD_URL` and `NEXT_PUBLIC_SITE_URL` env vars

**Principle:** Server-side Live Preview (route refresh on save) is the right pattern for Next.js App Router since the data flows through server components. Client-side `useLivePreview` would require restructuring all client components to accept raw Payload documents. The server approach is simpler and works with the existing architecture.

---

## Session: 2026-03-29 — CMS Collection Parity & Seed Infrastructure

**Chat:** Current session
**Scope:** `src/collections/`, `src/globals/SiteConfig.ts`, `src/payload.config.ts`, seed infrastructure

#### ENG-021: "Admin view doesn't reflect the website structure"

**Issue:** The user opened the Payload admin panel and saw only 4 collections (Users, Media, Projects, Books) + 1 global (SiteConfig), but the frontend website has 10+ pages. Several pages (Contact, Experiments) had 100% hardcoded content with no CMS representation. Even CMS-connected pages showed placeholder data because collections were empty.

**Root Cause:** Two gaps: (1) Missing CMS collections — Testimonials, Experiments, and Clients had no schema in Payload, so the admin panel couldn't manage that content. (2) Empty database — even for collections that existed (Projects, Books), no seed data was present, so the admin felt hollow and non-functional to a CMS newcomer.

**Fix:**
1. Created `Testimonials` collection (`src/collections/Testimonials.ts`) — text, name, role, order
2. Created `Experiments` collection (`src/collections/Experiments.ts`) — num, title, slug, description, tags, date, order
3. Added `clients` array to `SiteConfig` global — name, url
4. Registered both new collections in `payload.config.ts`
5. Split Contact page into server/client pattern (`page.tsx` + `ContactClient.tsx`) to fetch testimonials + clients from CMS
6. Split Experiments page into server/client pattern (`page.tsx` + `ExperimentsClient.tsx`) to fetch experiments from CMS
7. Created API seed route (`/api/seed`) that populates all collections with dummy data (12 projects, 25 books, 5 testimonials, 6 experiments, 10 clients, full site config)

**Principle:** Every frontend content section must have a CMS counterpart. If a page exists in the route tree, its editable content must be manageable from the admin panel. Hardcoded content arrays are acceptable as fallbacks, not as the primary data source.

---

## Session: 2026-03-29 — Verification Gap Escalation

**Chat:** Current session
**Scope:** `AGENTS.md`, process discipline

#### ENG-020: "Why are there so many constant-like errors that I have to tell you?"

**Issue:** The user had to manually copy-paste three consecutive console errors (ENG-017 script tag, ENG-018 script tag again, ENG-019 script tag + hydration mismatch) because the agent reported each fix as complete without checking the browser console. Every one of these errors was immediately visible on page load — the user shouldn't have had to report any of them.

**Root Cause:** The agent's verification step was `curl -sI localhost:4001 | head -3` — which only checks HTTP status codes. React 19 console warnings, hydration mismatches, and runtime errors do not appear in HTTP responses. They only appear in the browser's JavaScript console. The agent treated "server returns 200" as "task is verified," when the actual standard should be "browser console is clean."

Guardrail #10 ("ALWAYS verify changes on localhost after implementation") was too vague — it didn't specify *what* to verify or *how*. The agent interpreted it as a server-level check, not a browser-level check.

**Resolution:**
1. Tightened guardrail #10 in `AGENTS.md` to explicitly require browser-level verification (console errors, hydration mismatches, runtime warnings) for any React component change — `curl` is insufficient.
2. Added guardrails 12a and 12b for the two specific React 19 patterns that caused this chain: no `<script>` elements in the component tree, no `typeof window` branches in rendered output.

**Meta-lesson:** This is the same escalation pattern as ENG-012 (documentation skips) and ENG-005 (cross-app parity). A guardrail existed but was underspecified, so the agent found a technically-compliant but practically-useless way to satisfy it. When a guardrail allows the agent to "pass" without actually catching the problem, the guardrail needs to be made more specific — not just repeated.

**Category:** Process / verification discipline — escalation (3 user-reported errors that should have been self-caught).

---

## Session: 2026-03-29 — React 19 Script Tag & Hydration Mismatch (Third Attempt)

**Chat:** Current session
**Scope:** `playground/src/app/layout.tsx`, `playground/src/components/shell.tsx`

#### ENG-019: "Console Error — script tag warning persists with next/script; hydration mismatch in DesignSystemFootnote"

**Issue:** Two console errors:
1. The React 19 script tag warning persisted even after ENG-018's fix (replacing `dangerouslySetInnerHTML` with `next/script` `beforeInteractive`). Stack trace: `<Script>` → `RootLayout`.
2. Hydration mismatch in `DesignSystemFootnote`: server rendered "Design System last updated..." but client rendered "Local Dev · Design System last updated..." because `isLocalDev()` branched on `typeof window`.

**Root Cause:**
1. **Script:** `next/script` with `strategy="beforeInteractive"` still renders a `<script>` element in the React component tree. React 19 warns about ANY `<script>` element during hydration — no wrapper or strategy avoids it. This was the third failed approach (ENG-017: `next-themes`, ENG-018: `dangerouslySetInnerHTML`, ENG-019: `next/script`).
2. **Hydration:** `isLocalDev()` returns `false` on server (`typeof window === "undefined"`) and `true` on client (localhost). Different rendered text → mismatch.

**Resolution:**
1. **Removed the script entirely** from `layout.tsx`. The custom `ThemeProvider` already reads localStorage and applies the `dark` class via `useEffect`. `<html suppressHydrationWarning>` handles the class mutation. Accepting a one-frame flash is the only approach that avoids React 19 warnings.
2. **Fixed hydration mismatch** with `useState(false)` + `useEffect` to detect localhost after mount. Initial render matches server; client updates after hydration.

**Escalation note:** This is the 3rd attempt (ENG-017 → ENG-018 → ENG-019) to fix the same warning. Each previous fix introduced a new variation. The root principle: **React 19 does not want `<script>` elements in the component tree, period.** No wrapper, placement, or strategy changes this.

**Anti-patterns:** EAP-013 corrected (third time), EAP-014 added (hydration mismatch from window checks)

**Category:** Build / framework compat — escalation (3rd occurrence).

---

## Session: 2026-03-29 — React 19 Script Tag Warning (ENG-018, Follow-up to ENG-017)

**Chat:** Current session
**Scope:** `playground/src/app/layout.tsx`

#### ENG-018: "Console Error — script tag in layout.tsx:38 after dangerouslySetInnerHTML fix"

**Issue:** ENG-017's fix moved the script to layout `<head>` with `dangerouslySetInnerHTML`. React 19 still warned.

**Resolution (superseded by ENG-019):** Replaced with `next/script` `beforeInteractive`. This also failed — see ENG-019.

**Category:** Build / framework compat — superseded by ENG-019.

---

## Session: 2026-03-29 — React 19 Script Tag Warning (next-themes)

**Chat:** Current session
**Scope:** Playground ThemeProvider, React 19 compatibility

#### ENG-017: "Console Error — Encountered a script tag while rendering React component"

**Issue:** The playground console logged a React 19 warning: "Encountered a script tag while rendering React component. Scripts inside React components are never executed when rendering on the client. Consider using template tag instead." The error originated from `next-themes`'s `ThemeProvider`, which injects an inline `<script>` tag to prevent flash of incorrect theme (FOUC). React 19 warns about `<script>` tags in client components because they won't execute during client-side rendering.

**Root Cause:** `next-themes` renders a `<script>` element inside a client component (`ThemeProvider`). This script is designed to run during SSR to set the theme class on `<html>` before hydration. In React 19, client-side rendering explicitly warns about script tags in the component tree, even though the script already executed during SSR. As of March 2026, `next-themes` has not released a fix for this (GitHub issues #337, #385 remain open).

**Resolution:**
1. Replaced `next-themes`'s `ThemeProvider` with a custom implementation at `playground/src/components/theme-provider.tsx` that provides the same API (`useTheme()` → `{ theme, setTheme }`) without rendering any `<script>` tags in the client component tree.
2. Moved the FOUC-prevention script to `playground/src/app/layout.tsx` inside `<head>` using `dangerouslySetInnerHTML`. Since the layout is a server component, this `<script>` is rendered server-side and doesn't trigger the React 19 warning.
3. Updated `theme-toggle.tsx` and the theme-toggle preview page to import from the custom provider instead of `next-themes`.
4. `next-themes` is no longer imported anywhere in the playground. The dependency remains in `package.json` but can be removed in a future cleanup.

**Principle extracted -> `engineering-anti-patterns.md` EAP-013: Third-party script injection in client components**

**Category:** Build / framework compat — first occurrence.

---

## Session: 2026-03-29 — Node.js 25 + Payload CLI Incompatibility

**Chat:** Current session
**Scope:** Payload CMS import map generation, Node.js 25, tsx

### ENG-015: `payload generate:importmap` Fails on Node.js 25

**Trigger:** Admin panel showed console error: `PayloadComponent not found in importMap` for `@payloadcms/next/rsc#CollectionCards`. The `importMap.js` file was empty (`export const importMap = {}`).

**Root cause (multi-layered Node 25 incompatibility):**
1. **`@next/env` CJS/ESM interop** — Payload's `loadEnv.js` does `import nextEnvImport from '@next/env'` but `@next/env` is CJS. In Node 25, the default import is `undefined`.
2. **tsx extensionless resolution** — tsx v4.21.0 on Node 25 cannot resolve `./collections/Users` without a file extension, even though this works in earlier Node versions.
3. **Top-level await in ESM graph** — Even with extensions fixed, tsx tries to `require()` the config tree (CJS mode) but hits `ERR_REQUIRE_ASYNC_MODULE` because dependencies use top-level `await`.

**Resolution (multi-step):**
1. `brew install node@22` to get a Node version with less strict ESM enforcement
2. Temporarily added `"type": "module"` to `package.json` to force ESM loading (avoids `ERR_REQUIRE_ASYNC_MODULE`)
3. Temporarily changed extensionless imports to `.ts` extensions in `payload.config.ts` (tsx 4.21.0 doesn't resolve extensionless `.ts` files)
4. Ran `/usr/local/opt/node@22/bin/node ./node_modules/.bin/payload generate:importmap` — successfully generated the full import map (24 components from lexical editor + CollectionCards)
5. Restored `package.json` (removed `"type": "module"`), kept `.ts` extensions in `payload.config.ts` (Turbopack handles them fine)
6. `brew reinstall node` to fix broken simdjson shared library that Node 22 installation had overwritten

**Root causes documented:**
- tsx 4.21.0 cannot resolve extensionless `.ts` imports (bug in current tsx release)
- `@next/env` has CJS/ESM default-export interop issue when loaded via ESM import in Node 25
- tsx loads `payload.config.ts` via CJS `require()` without `"type": "module"`, which fails on ESM graphs with top-level await

**For future `generate:importmap` runs:** Use Node 22 with `"type": "module"` temporarily added to `package.json`.

---

## Session: 2026-03-29 — URL Namespace Architecture Feedback

**Chat:** Current session
**Scope:** `docs/engineering.md` §9

### ENG-014: CMS Admin Sharing URL Namespace with Public Site

**Trigger:** User asked: "Why is the admin part using the same localhost as the playground? You might not want to use the same kind of URL for both the CMS and the design system."

**Root cause (architectural, not a bug):** Payload CMS 3 embeds into Next.js — the admin panel at `/admin` shares the same process and URL namespace as the public portfolio on port 4000. This was accepted without documenting the trade-off or establishing a namespace allocation policy.

**Resolution:** Documented as an Architectural Decision Record in `engineering.md` §9. Established the "One Port, One Audience" principle and a living Route Namespace Allocation table. The current state is accepted (Payload's architecture mandates it) but the decision has clear revisit triggers.

**Self-improvement insight:** When integrating a framework that imposes architectural constraints (like Payload embedding into Next.js), explicitly document the constraint and its trade-offs at integration time — don't wait for someone to ask "why is it like this?" The architectural decision should be made consciously, not by default.

**Principle extracted -> `engineering.md` §9: Multi-App Architecture & URL Namespace Separation**

---

## Session: 2026-03-29 — Supabase Postgres Onboarding

**Chat:** Current session
**Scope:** `.env`, `src/payload.config.ts`, `src/lib/payload.ts`

### ENG-013: Supabase Direct Connection IPv6 Failure

**Trigger:** Connected real Supabase DATABASE_URL (direct connection, port 5432). Payload failed with `EHOSTUNREACH` — DNS resolved to an IPv6 address the local network couldn't reach.

**Root cause:** Supabase direct connections resolve to IPv6 by default. Many home/office networks don't support IPv6 routing to AWS. The Transaction Pooler connection string (port 6543, different hostname) resolves to IPv4.

**Resolution:** Switched from direct connection string (`db.<ref>.supabase.co:5432`) to Transaction Pooler string (`aws-1-us-east-1.pooler.supabase.com:6543`). Payload connected immediately, pulled schema, and served both `/` and `/admin` with 200.

**Principle extracted:** When configuring Supabase Postgres for local dev, always prefer the **Transaction Pooler** connection string over Direct. Direct connections may fail on IPv6-limited networks. Pooler also handles connection limits better for serverless (Vercel).

---

## Session: 2026-03-29 — Systemic Documentation Skip (Escalation to Hard Guardrail)

**Chat:** Current session
**Scope:** `AGENTS.md`, `docs/engineering-feedback-log.md`, `docs/engineering-anti-patterns.md`, `docs/engineering.md`, `src/lib/payload.ts`
**Duration:** 4 incidents (3 undocumented fixes + 1 systemic escalation)

### Incidents

---

#### ENG-009: "Console Error — undefined — unhandledRejection"

**Issue:** Three console errors (`undefined`, `unhandledRejection: undefined`) appeared in the browser on every page load of the main site. The errors pointed to the `Home` server component.

**Root Cause:** `.env` contained a placeholder `DATABASE_URL` (`db.YOUR_PROJECT.supabase.co`). Payload CMS attempted to connect to this nonexistent host on every request. The connection attempt created internal unhandled promise rejections inside Payload's `BasePayload.init()` that escaped the page component's try/catch — the rejections fired at the Postgres driver level before the promise chain reached user code.

**Resolution:**
1. Added a `isDatabaseConfigured()` guard in `src/lib/payload.ts` that checks for placeholder markers (`YOUR_PASSWORD`, `YOUR_PROJECT`) in `DATABASE_URL`.
2. When the database is not configured, `getPayloadClient()` throws immediately — before Payload ever opens a socket. This throw is caught cleanly by each page's existing try/catch, and fallback data is used.
3. All 4 pages (`/`, `/work/[slug]`, `/reading`, `/about`) benefit from this single guard — no per-page changes needed.
4. Page load time improved from 7.1s (with failed Postgres connection) to 112ms.

**Principle extracted -> Guard external service connections at the client wrapper level, not at each call site**

---

#### ENG-010: "Hey, this localhost is not running" / "Please fix. I can't see either Playground or my portfolio website"

**Issue:** User ran `npm run dev` in their terminal and got `EADDRINUSE: address already in use :::4000`. Neither the portfolio site nor the playground was accessible in the browser despite processes occupying both ports.

**Root Cause:** Zombie Node processes from a previous agent session (PIDs 55939, 55940) were holding ports 4000 and 4001 but not responding to HTTP requests. The port registry (`docs/port-registry.md`) listed old PIDs as "running" — stale data from a session whose processes had become unresponsive. The user's terminal couldn't start a new server because the zombie held the port, but the zombie couldn't serve requests.

**Resolution:**
1. Force-killed zombie processes (`kill -9`).
2. Restarted both servers fresh (`npm run dev` on 4000, `npm run playground` on 4001).
3. Verified both respond with HTTP 200.
4. Updated port registry with new PIDs.

**Principle extracted -> EAP-003 (re-confirmed): dev servers from previous sessions must be verified, not assumed. Port registry PIDs are stale indicators, not health guarantees.**

---

#### ENG-011: "It's not loading. Playground"

**Issue:** User reported the playground wasn't loading. The playground was in fact running and responding on port 4001, but the user expected it at `localhost:4000` or `localhost:4000/playground`.

**Root Cause:** The two-app architecture (main site on 4000, playground on 4001) is not surfaced to the user at the point of need. The port registry documents it, but the user doesn't read the port registry — they expect the agent to tell them where to look. The agent confirmed the server was healthy but didn't proactively provide the URL.

**Resolution:** Clarified that the playground is a separate app at `http://localhost:4001`. This is an information surfacing gap, not a technical bug.

**Principle extracted -> When confirming servers are running, always provide the full clickable URLs. Don't assume the user knows which port maps to which app.**

---

#### ENG-012: "You need to document things. Why are you not following it? Check the root cause and fix it."

**Issue:** User identified that ENG-009, ENG-010, and ENG-011 were all fixed without any documentation — no engineering feedback log entries, no anti-pattern updates, no frequency map changes. This is the 3rd time in this session the user has called out the documentation skip pattern (after ENG-008).

**Root Cause:** Architectural enforcement gap. The Post-Flight section in `AGENTS.md` says documentation is "not optional," and the engineering-iteration skill has a full Step 5 protocol. But neither is enforced as a hard gate. The agent's execution loop is: fix → verify → respond to user. Documentation is a post-response afterthought that gets dropped when the agent context-switches to the user's next question. The knowledge exists in docs and skills, but it's not in the Hard Guardrails — the only section the agent treats as a blocking gate.

**Resolution:**
1. **Promoted to Hard Guardrail #1** in `AGENTS.md` Engineering section: "NEVER respond to the user after fixing a bug or incident without FIRST completing all documentation steps." This is now the first engineering guardrail — it fires before any other check.
2. Retroactively documented ENG-009, ENG-010, ENG-011 (this entry).
3. Updated frequency map: "Documentation procedure skips" → 3+ occurrences, promoted to Critical.

**Principle extracted -> `AGENTS.md` Hard Guardrail #1: Documentation is a blocking gate, not a post-response task. The fix is not done until the log entry exists.**

**Meta-lesson:** This is the same pattern as ENG-005 (cross-app parity failures). Knowledge in docs gets forgotten; knowledge in Hard Guardrails gets enforced. When the same failure category recurs 3+ times, the only fix is promotion to the rules layer. This session proved the principle applies to the agent's own process discipline, not just technical operations.

---

## Session: 2026-03-29 — next.config.ts Build Failure & Procedural Skip

**Chat:** Current session
**Scope:** `next.config.ts`, `scripts/audit-docs.mjs`, `docs/engineering-anti-patterns.md`
**Duration:** 2 incidents (1 build failure + 1 meta-process failure)

### Incidents

---

#### ENG-007: "Hey, this localhost is not running. What's going on?"

**Issue:** Main site dev server crashed immediately after startup with `ReferenceError: exports is not defined in ES module scope` from `next.config.compiled.js:2:23`. Playground was also not running. User discovered this from the terminal, not from any automated check.

**Root Cause:** `next.config.ts` imported Node.js built-in modules (`path`, `fileURLToPath` from `url`) to construct `__dirname` for the `sassOptions.includePaths` setting. Next.js 16's config compiler bundles these imports into `next.config.compiled.js`, but the bundler emits CommonJS `exports` syntax while the compiled file is executed in an ESM scope. The `path` and `url` imports were the trigger — `withPayload` alone works fine.

The `sassOptions.includePaths` pointing to `node_modules` was unnecessary — modern sass resolves `@use` from `node_modules` automatically. The config was carrying legacy boilerplate that became a breaking incompatibility in Next.js 16.

**Resolution:**
1. Removed `path` and `fileURLToPath` imports from `next.config.ts`.
2. Removed `sassOptions.includePaths` (unnecessary with modern sass).
3. Verified server starts and serves pages correctly (`curl` returns 200 with full HTML + all SCSS styles).
4. Started both main site (4000) and playground (4001).
5. Added server health check to `scripts/audit-docs.mjs` — reads `docs/port-registry.md` and HTTP-pings every service marked "running". This would have caught this issue.

**Principle extracted -> `engineering-anti-patterns.md` EAP-011: Node.js Built-in Imports in next.config.ts**

---

#### ENG-008: "Why did you not document that in your engineering record?"

**Issue:** After fixing ENG-007 (next.config.ts build failure), the agent did not follow the engineering-iteration skill's Step 5 (Close the Loop). No entry was added to the engineering feedback log, no anti-pattern was documented, no engineering.md update was made. The agent treated a build failure as a quick fix rather than an engineering incident requiring full documentation.

**Root Cause:** The agent was in the middle of implementing the doc-audit system (a tooling task) when the user reported the build failure as a follow-up question. The agent context-switched to fix the immediate problem but did not re-route through the engineering-iteration skill. The Pre-Flight routing in AGENTS.md says "it doesn't work" → engineering track, but the agent treated it as a sidebar fix instead of an incident.

**Resolution:**
1. Documented ENG-007 and ENG-008 in this feedback log (retroactively).
2. Added EAP-010 to `engineering-anti-patterns.md` for the pattern of fixing incidents without following documentation procedures.
3. Added EAP-011 to `engineering-anti-patterns.md` for Node.js built-in imports in Next.js 16 configs.

**Principle extracted -> `engineering-anti-patterns.md` EAP-010: Fixing Incidents Without Following Documentation Procedures**

**Meta-lesson:** When a user reports a bug mid-task, the bug is an engineering incident — not a footnote to the current task. It requires the full engineering-iteration protocol: reproduce, diagnose, fix, document. Context-switching doesn't exempt the agent from closing the loop.

---

## Session: 2026-03-29 — Rules Layer Enforcement Gap (Meta-Fix)

**Chat:** Current session
**Scope:** `AGENTS.md` (formerly also `.cursor/rules/engineering.mdc`, now consolidated)
**Duration:** Escalation from ENG-004

### Incidents

---

#### ENG-005: "From the meta prompt layer, you did not instruct the agent to check every context first"

**Issue:** User identified that the root cause of the recurring cross-app parity failures (ENG-002, ENG-003, ENG-004) was not missing knowledge but missing enforcement. The principles were documented in `docs/engineering.md` §6, but the always-on rules did not force the agent to internalize and execute the cross-app parity checklist before considering a task complete.

**Root Cause:** Architectural gap between knowledge and enforcement:
1. The always-on Hard Guardrails had 7 NEVER/ALWAYS rules — none about cross-app parity. The agent treats these as hard gates. Everything else in `docs/engineering.md` is "read and hopefully remember."
2. `AGENTS.md` component registry section only required `registry.json` entry — no mention of playground preview or sidebar entry. The agent followed what was explicit and skipped what wasn't.
3. The knowledge existed in `docs/engineering.md` §6 but was never promoted to the rules layer where it would be enforced every session.

**Resolution:**
1. Added guardrail #8 to `AGENTS.md` Hard Guardrails: "ALWAYS run the Cross-App Parity Checklist after creating or modifying anything in `src/`"
2. Added a full Cross-App Parity Checklist table directly in `AGENTS.md` — not a pointer to a doc, but the actual checklist with specific "what you did → what you MUST also do" rows.
3. Rewrote `AGENTS.md` "When creating a new artifact" to be a 3-step mandatory protocol: (1) registry entry, (2) playground preview page + sidebar entry for components, (3) cross-app parity check.
4. Added context note explaining WHY this checklist exists (referencing ENG-002/003/004 as the pattern).

**Principle extracted -> `AGENTS.md`: Cross-App Parity Checklist is now a hard guardrail, not a soft doc reference**

**Meta-lesson:** When the same category of incident recurs 3+ times, the fix isn't adding more documentation — it's promoting the check from a "read this doc" instruction to an explicit, inline guardrail in the rules layer. Knowledge that lives only in docs gets diluted; knowledge in the Critical Guardrails section gets enforced.

---

## Session: 2026-03-29 — ScrollSpy Component Missing from Playground

**Chat:** Current session
**Scope:** `playground/src/app/components/scroll-spy/page.tsx`, `playground/src/components/sidebar.tsx`, `docs/engineering-anti-patterns.md`, `docs/engineering.md`
**Duration:** 1 incident

### Incidents

---

#### ENG-004: "Why did you not update that in the playground library?"

**Issue:** ScrollSpy component was created in `src/components/ScrollSpy.tsx` and integrated into two main site pages (AboutClient, ProjectClient) but was not added to the playground's component preview section. The playground — the design system documentation UI — had no preview page, no sidebar entry, and no searchable reference for the new component.

**Root Cause:** Same category as ENG-002 and ENG-003: cross-app parity failure (EAP-005). The agent created the component in the main site and updated the `archive/registry.json` but did not propagate to the playground. This despite the principle being documented in `engineering.md` §6 and the anti-pattern being documented in EAP-005. The checklist in §6.3 was not followed.

**Why this recurred:** The existing §6 checklist focuses on infrastructure parity (dependencies, fonts, CSS variables) but does not explicitly require that **new components get a playground preview page**. The principle was documented for infrastructure but not for component visibility. This is a gap in the checklist.

**Resolution:**
1. Created `playground/src/app/components/scroll-spy/page.tsx` with interactive demo, code preview, props table, behavior docs, and consumer list.
2. Added ScrollSpy to the "Interaction" category in `playground/src/components/sidebar.tsx` (making it discoverable via nav and search).
3. Updated `engineering.md` §6.2 to include component preview pages as a cross-app parity item.
4. Added EAP-007 to `engineering-anti-patterns.md` for the pattern of adding components without playground previews.
5. Updated frequency map.

**Principle extracted -> `engineering.md` §6.2: Cross-App Infrastructure Parity — now includes component previews**

**Anti-pattern extracted -> `engineering-anti-patterns.md` EAP-007: Adding Components Without Playground Preview**

---

## Session: 2026-03-29 — Geist Font Override Eradication (Escalation)

**Chat:** [Geist font recurring complaint](81f0bd8d-0345-426b-b268-0b64bc062e6f)
**Scope:** `playground/src/app/components/navigation/page.tsx`, `playground/src/app/components/footer/page.tsx`, `playground/src/app/components/theme-toggle/page.tsx`, `playground/src/lib/archive-previews.tsx`, `playground/src/app/layout.tsx`, `playground/src/lib/tokens.ts`, `playground/src/app/tokens/typography/page.tsx`
**Duration:** 1 incident (3rd complaint in this category — escalated to architectural fix)

### Incidents

---

#### ENG-003: "Where is Vercel's Geist font in the playground UI? I have said multiple times this is a recurring issue"

**Issue:** User reported for the 3rd time across separate sessions that Geist fonts were not showing in the playground UI. Previous fix (ENG-002) had correctly wired font loading in the layout, globals CSS, and typography page — but inline `fontFamily: "system-ui"` overrides in 5 component preview files were silently overriding Geist on every component page. Additionally, Geist Pixel variants (5 display fonts) were never added to the playground despite being available in the main app.

**Root Cause:** Two compounding issues:
1. **Hardcoded inline `fontFamily` overrides** — `NavigationDemo`, `FooterDemo`, `ThemeToggleDemo`, `NavigationPreview`, and `FooterPreview` all had `style={{ fontFamily: "system-ui, -apple-system, sans-serif" }}`. These inline styles have maximum CSS specificity and override the body's `font-family: var(--font-sans)` which correctly resolved to Geist. The previous fix (ENG-002) addressed the typography token page but did not audit other files.
2. **Incomplete cross-app parity** — ENG-002 added Geist Sans and Mono to the playground but omitted the 5 Pixel variants that were installed in the main app. The playground's `tokens.ts` only listed 3 font stacks (Sans, Serif, Mono) while the main app had 8.

**Why this recurred:** ENG-002's fix was scoped too narrowly. The audit only checked `layout.tsx`, `globals.css`, and the typography page. It did not run a codebase-wide search for hardcoded `fontFamily` inline styles. The engineering docs (EAP-005) documented the correct principle ("treat font changes as a two-app operation") but the implementation didn't follow through on auditing ALL files.

**Resolution:**
1. Removed `fontFamily: "system-ui..."` from all 5 files (navigation, footer, theme-toggle component pages + archive-previews). Body's Geist font now cascades correctly to all previews.
2. Added all 5 Geist Pixel variants to `playground/src/app/layout.tsx` (matching main app parity).
3. Expanded `playground/src/lib/tokens.ts` font stacks from 3 to 8 (Sans, Mono, 5 Pixel variants, Serif), with explicit `category` and `name` fields.
4. Updated typography page to display font name, category, full CSS value, and token for each font stack.
5. Ran codebase-wide grep to confirm zero remaining hardcoded `fontFamily` inline styles.
6. Verified all 7 Geist fonts preloading in response headers across multiple pages.

**Principle extracted -> `engineering-anti-patterns.md` EAP-006: Hardcoded Inline Font Overrides in Component Previews**

**Escalation note:** This was the 3rd complaint in the "Geist font not visible" category. Per the design-iteration escalation protocol, this was treated as architectural rather than incremental. The root cause was not a missing fix but an incomplete audit scope.

---

## Session: 2026-03-29 — Playground Font Loading Gap

**Chat:** [Vercel typography missing in playground](493d75d5-2a50-4c5f-82e9-c74c48209057)
**Scope:** `playground/package.json`, `playground/src/app/layout.tsx`, `playground/src/app/globals.css`, `playground/src/app/tokens/typography/page.tsx`
**Duration:** 1 incident

### Incidents

---

#### ENG-002: "I asked to have the Vercel typography installed, and I don't see it in the playground"

**Issue:** Geist (Vercel) fonts were installed and fully wired in the main app (`src/app/layout.tsx` imports `geist/font/sans`, `geist/font/mono`, injects CSS variables via `className`), but the playground showed generic system fonts. The typography token page previewed fonts using hardcoded `system-ui` fallbacks instead of the actual Geist faces.

**Root Cause:** Four compounding gaps:
1. The `geist` package was never added to `playground/package.json` — only the root `package.json`.
2. `playground/src/app/layout.tsx` had no `next/font` imports and no CSS variable injection, so `--font-geist-sans` / `--font-geist-mono` were never defined.
3. `playground/src/app/globals.css` hardcoded `"Inter"` and `"JetBrains Mono"` instead of referencing the Geist CSS variables.
4. The typography preview page hardcoded `system-ui` / `ui-monospace` fallbacks instead of using the actual token values.

**Why the feedback loop missed it:** The engineering feedback loop (ENG-001, §3) was designed around **data sync** — token values drifting between SCSS and TypeScript. This is a different category: **cross-app infrastructure parity**. A dependency and font-loading pipeline was added to the main app but never replicated in the playground. The sync script (`sync-tokens.mjs`) explicitly skips non-color tokens, and `engineering.md` §3.4 deferred typography sync as "not yet warranted." No checklist existed for verifying that infrastructure changes to one app are propagated to the other.

**Resolution:**
1. Added `geist` to `playground/package.json` dependencies.
2. Updated `playground/src/app/layout.tsx` to import `GeistSans` and `GeistMono`, inject CSS variables via `<html className>`.
3. Updated `playground/src/app/globals.css` `--font-sans` / `--font-mono` to reference `var(--font-geist-sans)` / `var(--font-geist-mono)` with existing fonts as fallbacks.
4. Fixed typography preview page to use actual token `f.value` instead of hardcoded system fonts.
5. Verified fonts preloading in response headers: `GeistMono_Variable` and `Geist_Variable`.
6. Added new engineering principle §6 (Cross-App Infrastructure Parity) to `engineering.md`.
7. Added anti-pattern EAP-005 to `engineering-anti-patterns.md`.
8. Updated consumer/sync table in `engineering.md` §3.3 to include font loading.

**Principle extracted -> `engineering.md` §6: Cross-App Infrastructure Parity**

**Anti-pattern extracted -> `engineering-anti-patterns.md` EAP-005: Adding Infrastructure to One App Without Propagating to Co-Deployed Apps**

---

## Session: 2026-03-29 — Playground Token Drift

**Chat:** [Carbon color expansion & playground sync](current-session)
**Scope:** `src/styles/tokens/_colors.scss`, `playground/src/lib/tokens.ts`, `playground/src/app/tokens/colors/page.tsx`
**Duration:** 1 incident

### Incidents

---

#### ENG-001: "Why do I not see any of those new colors being rendered in my Playground UI?"

**Issue:** After expanding the color palette in `_colors.scss` with 9 new color families (90 values) and 11 new semantic tokens, the playground's Colors page showed only the original accent, neutral, and 2 support colors. None of the new colors were visible.

**Root Cause:** The playground does not read from `_colors.scss`. It reads from a hardcoded TypeScript data file (`playground/src/lib/tokens.ts`) that was a **manual copy** of the SCSS values. When the SCSS was expanded, the TS file was not updated. There was no automated sync mechanism, no rule requiring the update, and no verification step.

Additionally, a third file (`playground/src/app/globals.css`) contains yet another copy of color values as CSS custom properties for Tailwind's `@theme` block. Three independent copies of the same data with no automated sync.

**Resolution:**
1. Manually updated `playground/src/lib/tokens.ts` with all new color families and semantic tokens.
2. Updated `playground/src/app/tokens/colors/page.tsx` to render the new extended palette sections.
3. Identified the systemic issue: created this engineering feedback loop (parallel to the design feedback loop).
4. Created `scripts/sync-tokens.mjs` codegen script to automate SCSS → TS synchronization.
5. Added `npm run sync-tokens` to `package.json`.
6. Documented in `engineering.md` §3 (Single Source of Truth) and `engineering-anti-patterns.md` EAP-001, EAP-004.

**Principle extracted -> `engineering.md` §3: Single Source of Truth (Token Sync)**

**Anti-patterns extracted -> `engineering-anti-patterns.md` EAP-001: Manual Data Duplication Without Sync, EAP-004: Modifying Source of Truth Without Updating Consumers**

---

### Session Meta-Analysis

**Core lesson:** When data exists in multiple files, there must be an automated mechanism to keep them in sync. Manual discipline fails — not because of incompetence, but because the connection between files is invisible unless documented and enforced.

**Systemic fix:** Created the engineering feedback loop (skill, rules, docs) to catch non-design issues that the existing design feedback loop cannot. Added codegen script for token sync.

---

#### ENG-006: "When I want to merge this into main, what should I do?"

**Issue:** All work for the foundational UI component set (15 components, Radix dependencies, architecture docs, playground changes) was done directly on `main` without creating a feature branch. The user identified this as a process gap that would be dangerous with concurrent agent sessions.

**Root Cause:** No branching protocol existed in the engineering docs, AGENTS.md, or rules layer. Agents defaulted to working on whatever branch was checked out — which was `main`.

**Resolution:**
1. Added §6 "Git Branching & Session Safety" to `docs/engineering.md` with the rule: never write to `main`, always use feature branches.
2. Added EAP-009 to `docs/engineering-anti-patterns.md`.
3. **Promoted to hard guardrail** in both `AGENTS.md` and `.cursor/rules/engineering.mdc`: "NEVER make file changes while on `main`" — this is rule #1 in the Engineering guardrails, so it fires before any other engineering check.
4. Documented the recovery path for when changes are already on `main` (create branch, changes travel with you).

**Principle extracted -> `engineering.md` §6: Git Branching & Session Safety**

**Category:** Process / session safety — first occurrence, immediately promoted to hard guardrail due to severity.

---

#### ENG-016: "Let's start doing version control for the design system"

**Issue:** The design system had no versioning. There was no way to know what version was deployed on Vercel, when it was last released, or what changed between deployments. The `package.json` version fields (`0.1.0`) were placeholder values with no operational meaning.

**Root Cause:** Versioning was never established as infrastructure. The two-branch model (`dev`/`main`) implicitly separated "in progress" from "deployed" but without version metadata, the distinction was invisible.

**Resolution:**
1. Created `elan.json` at repo root — single source of truth for Élan design system version metadata (dev version + release version with name and timestamp).
2. Created `CHANGELOG.md` following Keep a Changelog format with 1.0.0 baseline.
3. Created `scripts/version-bump.mjs` (patch/minor/major) and `scripts/version-release.mjs` (promote to release) with automatic sync to `playground/src/lib/elan.ts`.
4. Added `npm run version:{patch,minor,major,release}` scripts to `package.json`.
5. Added `<meta name="generator" content="Élan x.x.x">` to the main site layout.
6. Added version label to playground sidebar footer.
7. Updated `AGENTS.md` with versioning protocol + hard guardrail (rule #13: never merge without version:release).
8. Updated `docs/engineering.md` §6.5 checkpoint workflow and added §10 for versioning.

**Architectural note:** The playground can't import JSON from the parent directory (Turbopack won't resolve outside the app root). Solution: `playground/src/lib/elan.ts` is auto-generated by the version scripts, keeping it in sync without manual effort.

**Principle extracted -> `engineering.md` §10: Design System Versioning (Élan)**

**Category:** Infrastructure / versioning — first occurrence.

---

## Entry Template

```markdown
#### ENG-NNN: "[First 10 words of user message]"

**Issue:** [What the user observed]

**Root Cause:** [Technical reason it happened]

**Resolution:** [What was done to fix it]

**Principle extracted -> `engineering.md` §N.N: [Section reference]**
```
