# Engineering Feedback Log — Archive

> **What this file is:** Cold storage of older engineering feedback entries. These have been synthesized
> into `docs/engineering-feedback-synthesis.md` for quick reference.
> Raw entries are preserved here for deep audits only.
> **Archived:** 2026-04-01 (entries ENG-001 through ENG-055)

---

## Session: 2026-03-30 — Inline Edit Guardrail for New Components

#### ENG-049: "Every time you add a new component, you are not making it editable in inline edit"

**Issue:** TestimonialCard was created rendering CMS data (text, name, role) as plain `<p>` and `<span>` elements without `EditableText` wrappers, `id` prop, or `EditButton`. Admin users could see testimonial text on the homepage but couldn't edit it inline. This is the same class of failure that could recur with any new component.

**Root Cause:** No guardrail or anti-pattern existed that explicitly required inline edit support for new CMS-backed components. The CMS-Frontend Parity Checklist covered schema/fetch/UI synchronization but didn't include inline editing as a fourth mandatory layer. The agent treated inline edit as a feature rather than an architectural requirement.

**Resolution:**
1. **Fixed the component:** Updated `TestimonialCard.tsx` to accept `id` and `isAdmin` props. When admin, text/name/role are wrapped in `EditableText` with proper `fieldId`/`target`/`fieldPath`, and an `EditButton` links to the full admin form.
2. **Fixed the data flow:** Updated `page.tsx` to pass `id` from Payload docs. Updated `HomeClient.tsx` to pass `isAdmin` to testimonial cards.
3. **New anti-pattern:** Added EAP-029 ("New Components Rendering CMS Data Without Inline Edit Wiring") with a 6-point checklist.
4. **New hard guardrail:** Added Engineering Hard Guardrail #16 in `AGENTS.md`: "NEVER create a component that renders CMS data without inline edit support."
5. **Updated CMS-Frontend Parity Checklist:** Changed from "three layers" to "four layers" (schema, data fetch, UI, inline edit). Added a new row for "Created a new component rendering CMS data."

**Principle extracted → `engineering.md` / `AGENTS.md`: Inline edit is not optional — it's the fourth layer of the CMS-frontend contract.**

---

## Session: 2026-03-30 — TestimonialCard Component & CMS Integration

#### ENG-048: "Build a testimonial card to mix in with the waterfall gallery"

**Issue:** User requested a new TestimonialCard component that integrates into the homepage masonry grid alongside project cards. Required CMS schema changes, data flow wiring, and a new component.

**Root Cause:** N/A — new feature, not a bug.

**Resolution:**
1. **Schema:** Added `avatar` (upload→media), `linkedinUrl` (text), `showOnHome` (checkbox) fields to `src/collections/Testimonials.ts`. The `showOnHome` flag controls which testimonials appear on the homepage (sidebar position in admin).
2. **Component:** Created `src/components/TestimonialCard.tsx` + `TestimonialCard.module.scss` — standalone card with Geist Pixel Square quotation mark, quote text, avatar (image or initials fallback), name/role attribution, and optional LinkedIn icon button.
3. **Data flow:** Updated `src/app/(frontend)/page.tsx` to fetch testimonials with `showOnHome: true` filter. Updated `HomeClient.tsx` to accept testimonials and interleave them into the masonry grid using an `interleaveGrid()` function that places testimonials every 3–4 project cards.
4. **Seeds:** Updated both `api/seed/route.ts` and `scripts/seed.ts` with new fields.
5. **Playground:** Created `playground/src/app/components/testimonial-card/page.tsx` preview, added sidebar entry under "Content & Media".
6. **Registry:** Added `shared-testimonial-card` entry to `archive/registry.json`.

**CMS-Frontend Parity Check:**
- Schema: `Testimonials.ts` has `text`, `name`, `role`, `avatar`, `linkedinUrl`, `showOnHome`, `order` ✓
- Data fetch: `page.tsx` maps `text`, `name`, `role`, `avatarUrl` (from avatar.url), `linkedinUrl` ✓
- UI: `TestimonialCardProps` type + rendering in `HomeClient.tsx` ✓
- **Note:** Dev server restart required for Payload to recognize new fields.

**Cross-category note:** Also documented as FB-054 (design) for visual design decisions.

**Principle extracted → `engineering.md`: CMS-Frontend Parity Checklist applies to collection field additions.**

---

## Session: 2026-03-30 — Turbopack Cache Corruption

#### ENG-047: "isAdminAuthenticated is not a function — Runtime TypeError in ProjectPage"

**Issue:** Navigating to `/work/lacework` throws a runtime TypeError: `(0, ...isAdminAuthenticated) is not a function`. The error originates in the Turbopack-compiled RSC chunk for `page.tsx`, even though `admin-auth.ts` correctly exports `isAdminAuthenticated` as a named async function and all import sites use the correct named import.

**Root Cause:** Turbopack cache corruption in `.next/`. The compiled module at `[app-rsc]` had a stale reference that didn't match the current export shape of `admin-auth.ts`. The source code was correct — the build artifact was not. This likely resulted from rapid schema restarts and file modifications in the prior session without cache invalidation.

**Resolution:** Killed existing dev server processes on port 4000, deleted `.next/` entirely (`rm -rf .next`), and restarted the dev server. The page compiled cleanly and returned HTTP 200 with correct HTML output including `isAdmin: true` passed to `ProjectClient`.

**Principle extracted → `engineering.md` §4: When a runtime error contradicts correct source code, clear `.next/` before investigating code-level causes.**

---

## Session: 2026-03-29 — Payload Admin IA Improvements

#### ENG-046: "When I click, it just opens my website on localhost, but there is no admin added to view"

**Issue:** Clicking page tiles on the admin dashboard opens the live site, but no admin bar, no inline editing, no edit buttons appear. The site renders as if the user is a public visitor.

**Root Cause:** `isAdminAuthenticated()` in `src/lib/admin-auth.ts` checked for the `payload-token` browser cookie. But Payload's `autoLogin` feature (with `prefillOnly: false`) authenticates at the server level without setting a browser cookie. The cookie is only set when a user manually logs in via `/admin/login`. In dev mode with auto-login, the cookie never exists in the browser — so every frontend page sees `isAdmin = false`.

**Resolution:** Rewrote `isAdminAuthenticated()` to:
1. First check the `payload-token` cookie (works for production manual login)
2. Fall back to checking dev mode (`NODE_ENV !== 'production'`) + auto-login configured (`PAYLOAD_ADMIN_EMAIL` env var set) — returns `true` if both are true

**Anti-pattern extracted → EAP-026: Checking for browser cookies that server-side auth mechanisms never set.**

**Documentation violation note:** This was the 3rd consecutive incident in this session resolved without documenting. See meta-analysis below ENG-044.

---

#### ENG-045: Hydration mismatch — server rendered `<a>`, client rendered `<div>`

**Issue:** After HMR-updating DashboardPages from `<a>` card wrappers to `<div>` card wrappers, the admin panel threw a hydration error: server HTML had `<a>` elements, client JS expected `<div>` elements.

**Root Cause:** HMR updated the client-side bundle but the server-side cached render still used the old component code. Payload admin components are SSR'd and then hydrated — when HMR only updates one side, the mismatch triggers React's hydration error.

**Resolution:** Clean restart with `rm -rf .next` to purge all server and client caches.

**Principle → After changing the DOM structure of a Payload admin component, always clean restart (`rm -rf .next && npm run dev`). HMR alone is insufficient for SSR'd admin components.**

---

#### ENG-044: "It doesn't open the visual inline edit when I click on that tile"

**Issue:** Clicking a page tile on the admin DashboardPages component did not navigate to the live site. Click appeared to do nothing.

**Root Cause:** The component had a `<a>` element (the card) wrapping another `<a>` element (the pencil icon). Nested `<a>` tags are invalid HTML. Browsers handle this by "flattening" the nesting — the inner `<a>` effectively breaks the outer `<a>`, making the click target ambiguous. The result: clicks didn't navigate.

**Resolution:** Changed the card wrapper from `<a>` to `<div role="button">` with `onClick={() => window.open(...)}`. The pencil `<a>` remains as the only anchor element, no longer nested.

**Anti-pattern extracted → EAP-025: Nested `<a>` elements break navigation silently.**

---

#### ENG-043: "How do I open this view? I don't see it. Where is it?"

**Issue:** After adding NavPages to the admin sidebar (ENG-042), user still couldn't find the visual editing entry points. The sidebar was collapsed by default, hiding the Pages section entirely. User explicitly said: "I actually prefer the live preview and inline edit front and center."

**Root Cause:** Sidebar-only navigation is not discoverable when the sidebar starts collapsed. The dashboard — the first thing users see — showed only collection cards (System, Work, Reading, etc.) with no visual editing entry points. The Pages section existed but was behind a hamburger menu. Three failed attempts to make visual editing discoverable (ENG-042's sidebar nav, ViewSiteLink rename) all put the entry point in the wrong place.

**Resolution:**
1. Created `src/components/admin/DashboardPages.tsx` — a `beforeDashboard` component that renders a prominent "Pages" grid at the top of the dashboard, above the collection cards.
2. Each page card's primary action (clicking the card) opens the live site in a new tab for inline editing.
3. Secondary action (pencil icon in card footer) goes to the admin field editor.
4. Had to manually add DashboardPages to `importMap.js` because `payload generate:importmap` fails with ESM top-level await errors.

**Escalation note:** This is the 2nd iteration of the same "can't find visual editing" feedback (ENG-042 was the 1st). The pattern: sidebar-only navigation is insufficient for primary workflows. The dashboard is the only reliable entry point because it's visible by default.

**Cross-category note:** Strong design dimension — IA, discoverability, primary action hierarchy. See design feedback log.

**Principle extracted → The dashboard is the front door. Primary workflows must be on the dashboard, not in the sidebar.**

---

#### ENG-042: "How do I open the edit view for the page where I can visually do the CMS?"

**Issue:** The Payload admin UI had no clear navigation to the visual editing experience. The sidebar showed a flat, ungrouped list of collections with no mapping to pages. The only site link was labeled "Visual Editor" (misleading — it just opened the homepage, not an editor). User forgot the editing flow entirely, proving the IA was undiscoverable.

**Root Cause:** Architectural gap — the admin UI was built incrementally (one `ViewSiteLink` component at a time) without designing the full navigation information architecture. Three specific problems:
1. No "Pages" concept in the sidebar — the mapping of "Home page content → Site Config global", "Work page → Projects collection" was implicit
2. "Visual Editor" label was misleading — it sounded like an in-admin editor but just opened the homepage in a new tab
3. Collections listed flat without grouping — no indication of which collection powers which page

**Resolution:**
1. Created `src/components/admin/NavPages.tsx` — sidebar component (registered in `beforeNavLinks`) showing a "Pages" section. Primary click goes to the admin edit form for each page's data source (where Payload's built-in Live Preview works). Secondary external-link icon opens the live page for inline editing.
2. Added `admin.group` to all 6 collections and the SiteConfig global: Work, Reading, Experiments, Contact, Settings, System.
3. Renamed "Visual Editor" → "Open Live Site" in `ViewSiteLink.tsx` to match what it actually does.
4. Updated `SiteConfig.ts` description to reference the new "Pages" nav section.
5. Restarted dev server to regenerate the Payload import map with the new component.

**Cross-category note:** Also a design dimension (sidebar IA, labeling, discoverability). Documented as design entry in the same session.

**Principle extracted → `engineering.md` §7: Admin IA — always organize collections by page, not by data type. The sidebar should be self-documenting. Every link label must describe what actually happens when you click it.**

---

## Session: 2026-03-29 — Case Study Detail Page Fixes

**Chat:** Current session
**Scope:** `src/app/(frontend)/work/[slug]/ProjectClient.tsx`, `src/app/(frontend)/work/[slug]/page.module.scss`, `src/app/(frontend)/api/update-lacework/route.ts`, `src/collections/Projects.ts`

#### ENG-041: "Collaborators are all stacked into one line"

**Issue:** Multiple collaborator stakeholders (Product Management, Engineering, Customer Success) rendered on a single line instead of separate lines in the case study sidebar.

**Root Cause:** The `EditableArray` component wraps all rendered items in a `createElement(Tag, { className }, items.map(renderItem))` call — defaulting to a plain `<div>`. The rendered items are `<span>` elements (inline by default). While the grandparent `.metaGroup` uses `flex-direction: column`, the `EditableArray` wrapper `<div>` absorbs the spans into a single flex child. Without explicit column layout on the wrapper, spans flow inline.

**Resolution:** Created `.collaboratorList` CSS class (`display: flex; flex-direction: column; gap: spacing-02`) and passed it via `className` prop to `EditableArray`. Wrapped the non-admin fallback path in a `<div className={styles.collaboratorList}>` for parity. The fix is structural — any `EditableArray` rendering stacked items needs an explicit layout class on its wrapper.

**Cross-category note:** Also documented as FB-051 (design) and CF-010 (content).

**Principle extracted → `engineering.md`: When using `EditableArray` to render stacked/column items, always pass a `className` with explicit column layout. The default `<div>` wrapper has no layout — inline children will flow horizontally.**

---

## Session: 2026-03-29 — ScrollSpy Design System Migration

**Chat:** Current session
**Scope:** `next.config.ts`, `@yilangaodesign/design-system/package.json`

#### ENG-040: ScrollSpy design system migration — infrastructure changes

**User observed:** ScrollSpy alignment was broken; user directed that the fix be applied upstream in the design system, not at the portfolio level.

**Root cause:** ScrollSpy was a portfolio-local component, not exported from `@yilangaodesign/design-system`. Portfolio had no `transpilePackages` configured, so source-level imports (TSX + SCSS modules) from node_modules wouldn't compile.

**Resolution:**
1. Added `transpilePackages: ["@yilangaodesign/design-system"]` to `next.config.ts` — enables Next.js to compile TSX and SCSS module imports from the design system package.
2. Updated `@yilangaodesign/design-system/package.json`: added `components` to `files` array, added `"./components/ScrollSpy": "./components/ScrollSpy.tsx"` to `exports` map.
3. Updated portfolio imports in `ProjectClient.tsx` and `AboutClient.tsx` from `@/components/ScrollSpy` to `@yilangaodesign/design-system/components/ScrollSpy`.
4. Restarted dev server to pick up next.config change.

**Cross-category note:** Also documented as FB-050 (design) — alignment fix and upstream principle.

---

## Session: 2026-03-29 — Admin Edit View Bugs Batch

**Chat:** Current session
**Scope:** `src/components/inline-edit/`, `src/globals/SiteConfig.ts`, `src/app/(frontend)/HomeClient.tsx`, `src/payload.config.ts`

#### ENG-039: "Payload admin tabs not synced with visual edit sections"

**Issue:** CMS admin had 6 tabs (Identity, Teams, Links, Labels & Footer, Clients, Experience) that didn't map clearly to the visual edit sections on the frontend. Two tabs were labeled "Experience" after the rename. The "Labels & Footer" tab grouped unrelated fields (aboutLabel, teamsLabel, linksLabel, footerCta) together instead of colocating them with their respective data.

**Root Cause:** The SiteConfig tab structure was organized by field *type* (all labels together, all arrays together) rather than by *page section*. When the frontend evolved (tabs removed, sections renamed), the CMS admin didn't evolve with it.

**Resolution:** Reorganized tabs to mirror frontend page sections: Identity (home sidebar header + footer), Experience (home sidebar experience list + heading), Links (home sidebar links + heading), Clients (contact page), Work History (about page). Eliminated the "Labels & Footer" tab entirely by moving each label into its respective section tab. Added `description` to each tab explaining where its data appears on the live site. Renamed the original "Experience" tab (work history for About page) to "Work History" to avoid collision.

**Principle extracted -> `engineering.md` §11 (CMS-Frontend Data Parity): Tab structure should mirror page sections, not field types.**

**Cross-category note:** Also documented as FB-049 (design) — the missing navigation path from CMS admin to visual editor.

#### ENG-038: "save() catches errors internally, EditableArray never knows save failed"

**Issue:** When saving via `EditableArray.commitPanel()`, the panel always closed after `await ctx.save()`, even if the save had failed. The user thought their edits were saved when they weren't.

**Root Cause:** `InlineEditProvider.save()` caught errors internally (setting `saveError` state) but never re-threw. `commitPanel` awaited `save()` which always resolved successfully, so `setPanelOpen(false)` always fired.

**Resolution:** Made `save()` re-throw the error after setting `saveError`, so callers like `commitPanel` can detect failures and keep the panel open. Updated all direct callers (InlineEditBar button, keyboard shortcut) to catch the re-thrown error gracefully since they already rely on `saveError` state for UI.

**Principle extracted -> `engineering-anti-patterns.md`: Error-swallowing saves create silent data loss.**

#### ENG-037: "editing the email in the footer, when I hit save, it doesn't really save"

**Issue:** Editing the email field in the footer via inline edit and saving appeared to silently fail — the value would revert after save.

**Root Cause:** Two contributing factors: (1) The CMS `email` field used Payload's `type: 'email'` which applies strict email validation. `contentEditable`'s `textContent` can capture trailing whitespace or invisible characters from browser editing, causing the value to fail email validation. (2) Save errors were caught but not always visible if the user had already moved focus.

**Resolution:** (1) Changed the `email` field in `SiteConfig.ts` from `type: 'email'` to `type: 'text'` with a custom `validate` function that accepts empty strings and valid email patterns (less strict than Payload's built-in). (2) Added `.trim()` to the value captured from `contentEditable` in `EditableText.tsx` to strip whitespace before saving. (3) Fixed error propagation (ENG-038) so save failures are more visible.

**Principle extracted -> `engineering-anti-patterns.md`: Payload `type: 'email'` with contentEditable is fragile; use `type: 'text'` + custom validation for inline-edited email fields.**

**Cross-category note:** Also documented as FB-047 (design) — footer editing UX was broken.

---

## Session: 2026-03-29 — Drag-and-Reorder Re-Grab Bug

**Chat:** Current session
**Scope:** `src/components/inline-edit/EditableArray.tsx`

#### ENG-036: "bug on the re-grabbing and drag and reorder interaction where, once I have put something somewhere"

**Issue:** After successfully dragging an item to a new position in the `EditableArray` panel, any item that was moved to a different position could no longer be grabbed and dragged again. The drag handle appeared visually correct but was non-functional.

**Root Cause:** `localItems.map()` used `key={index}` for each drag-and-drop row. With index keys, React reuses the same physical DOM nodes after a reorder — it updates props/content in place rather than creating new elements. The browser retains drag-related state on the physical DOM node that participated in the previous drag operation. When the same DOM node (now rendering different item content) is picked up for a second drag, the browser's stale drag state prevents the `dragstart` event from properly initiating a new drag. This is the classic "index-as-key" pitfall applied specifically to draggable elements.

**Resolution:** Introduced a parallel `itemKeys` state (`string[]`) that holds a stable, unique string key per item. Keys are initialized when the panel opens (`openPanel`), reordered in sync with `reorderItem`, filtered in sync with `deleteItem`, and extended in sync with `addItem`. The row render now uses `key={itemKeys[index] ?? index}` — each item's key travels with it through reorders, forcing React to create new DOM nodes at each position rather than reusing them. Browser drag state is therefore always on a fresh element.

**Category:** CMS UX / inline editing — tenth occurrence.

---

## Session: 2026-03-29 — Required Field Blocking Save + Client Validation

**Chat:** Current session
**Scope:** `src/globals/SiteConfig.ts`, `src/app/(frontend)/HomeClient.tsx`, `src/components/inline-edit/EditableArray.tsx`, `src/components/inline-edit/inline-edit.module.scss`

#### ENG-035: "why is URL required?... it's blocking users from completing the user flow"

**Issue (schema):** `socialLinks[].href` was `required: true` in both Payload schema and frontend field definition. This meant users couldn't save a link with just a label (e.g. "Resume" as a placeholder) without also providing a URL. The required constraint blocked the save flow entirely, frustrating users who wanted to save partial progress.

**Issue (validation UX):** The panel had zero client-side validation — no visual indication of which fields are required, no prevention of save attempts with empty required fields, no inline error messages. Users discovered validation failures only after the server rejected the request, with no guidance on what to fix.

**Resolution:**

1. **Schema relaxation:** Removed `required: true` from `socialLinks[].href` in `SiteConfig.ts`. Updated `LINK_FIELDS` in `HomeClient.tsx` to match. Only `label` remains required (a link needs a name; URL can be added later).

2. **Client-side validation in EditableArray:**
   - Added `validationErrors` computed from `localItems` against `requiredFields` — a `Set<string>` of `"index:fieldName"` keys.
   - Added `showValidation` state — errors only appear after the user's first save attempt (not on panel open, to avoid premature nagging).
   - `commitPanel` checks validation before sending to API. If invalid, sets `showValidation` and returns early.
   - "Save & Close" button is disabled when validation is showing and errors exist.
   - Validation state resets when panel closes.

3. **CMS-Frontend Parity:** Both Payload schema and frontend `LINK_FIELDS` updated atomically per the parity checklist.

4. **Server restart (missed, then corrected):** After modifying `SiteConfig.ts`, the dev server was NOT restarted. User hit the same "URL is required" server-side error again because Payload was still running the old schema. This is a repeat of the ENG-030 pattern and a direct violation of **Hard Guardrail #15** ("ALWAYS restart the Payload dev server after modifying any global or collection schema"). The server was restarted after the user reported the continued failure. PID updated to 55573 in port-registry.md.

**Operational lesson:** Guardrail #15 exists precisely because this failure mode has recurred three times now (ENG-030, ENG-035). The schema change and the server restart must be treated as a single atomic operation — the change is not complete until the server has restarted and the schema is live. No amount of code changes matter if the running server doesn't know about them.

**Cross-category note:** Also documented as FB-044 (design — required indicators, inline errors) and CF-008 (content — validation messaging).

**Category:** CMS UX / inline editing — ninth occurrence.

---

## Session: 2026-03-29 — Panel Body Collapsed After Flex Refactor

**Chat:** Current session
**Scope:** `src/components/inline-edit/inline-edit.module.scss`

#### ENG-034: "why is this in such a bad height... content flexbox is in such a bad shape"

**Issue:** After the flex column refactor (ENG-032) to fix sticky header/footer, the Edit Teams panel collapsed to just header + footer with the body area at near-zero height. Items existed but were invisible.

**Root Cause:** The body had `flex: 1 1 0` (flex-basis 0) which is correct for growing into available space — but the panel itself had no `height` or `min-height`, only `max-height: 80vh`. Without a minimum, the flex container collapsed to its content size: header (~44px) + body(0 basis, no content pushing it) + footer (~44px). The body never grew because the panel never gave it space to grow into.

**Resolution:** Added `min-height: min(400px, 60vh)` and `min-width: 320px` to `.arrayPanel`. The body's `flex: 1 1 0` now fills the guaranteed minimum space. This also establishes a responsive floor — on small viewports, `60vh` prevents the panel from becoming too tall for the screen; on large viewports, `400px` ensures usability.

**Category:** CMS UX / inline editing — eighth occurrence. Self-inflicted regression from ENG-032.

**Cross-category note:** Also a design principle — all modal/panel containers need minimum dimension constraints. Documented as FB-043 (design).

---

## Session: 2026-03-29 — Save Error Parsing and Human-Readable Messages

**Chat:** Current session
**Scope:** `src/components/inline-edit/api.ts`, `src/components/inline-edit/InlineEditBar.tsx`, `src/components/inline-edit/inline-edit.module.scss`

#### ENG-033: "Failed to update global:site-config: 400 — {raw JSON}"

**Issue:** When Payload CMS rejects a save due to validation (e.g. a required `href` field is empty), the error thrown by `saveFields` included the full raw JSON response body, producing an unreadable error message like `Failed to update global:site-config: 400 — {"errors":[{"name":"ValidationError",...}]}`.

**Root Cause:** `api.ts` treated the response body as an opaque string and concatenated it into the error message without parsing.

**Resolution:**
1. Added `parsePayloadError()` in `api.ts` that extracts Payload's structured validation errors, translates field labels (e.g. "Links > Social Links 1 > Href" → "Social Link 1 → URL"), and humanizes messages (e.g. "This field is required" → "is required").
2. Added fallback handling for auth errors (401/403), server errors (500+), and non-JSON responses.
3. Final message format: `"Could not save — Social Link 1 → URL is required."` instead of raw JSON.

**Cross-category note:** Also documented as FB-042 (design — error banner visibility) and CF-007 (content — technical jargon in error copy).

**Category:** CMS UX / inline editing — seventh occurrence.

---

## Session: 2026-03-29 — Panel Layout and Drag Reorder

**Chat:** Current session
**Scope:** `src/components/inline-edit/EditableArray.tsx`, `src/components/inline-edit/inline-edit.module.scss`

#### ENG-032: "the CTA for Save and Close is not always visible... why multiple clicks"

**Issue:** Two UX problems with the EditableArray panel: (1) Save & Close button scrolled off-screen with long lists, (2) up/down arrow buttons for reordering were high-friction compared to drag-and-drop.

**Root Cause:** Panel used `overflow-y: auto` on the entire container (header + body + footer scroll as one unit). Reordering used `moveItem(from, ±1)` which only swaps adjacent items.

**Resolution:**
1. Restructured panel to flex column: header (flex-shrink: 0) → body (flex: 1, overflow-y: auto) → footer (flex-shrink: 0). Only body scrolls.
2. Replaced up/down buttons with drag handles using native HTML5 drag-and-drop. New `reorderItem(from, to)` uses splice for arbitrary position moves.
3. Added collapsed view during drag: `.panelDragging` class hides fields/actions, shows single-line summary per item.
4. Removed inline `style={{}}` on "No items" text (guardrail violation), replaced with `.noItemsText` class.

**Cross-category note:** Also documented as FB-041a/b (design) — the primary dimension is UX design (persistent action layer, direct manipulation).

**Category:** CMS UX / inline editing — sixth occurrence.

---

## Session: 2026-03-29 — CMS-Frontend Parity Drift (Systemic)

**Chat:** Current session
**Scope:** `AGENTS.md`, `src/globals/SiteConfig.ts`, `src/app/(frontend)/contact/page.tsx`, `src/app/(frontend)/contact/ContactClient.tsx`

#### ENG-031: "I don't think the actual configuration dashboard is reflecting the additions"

**Issue:** The user reported that fields added to the frontend inline editing UI (like the `period` field on Teams) were not reflected in the Payload admin dashboard. The user identified this as a dangerous architectural discrepancy: changes to one side don't automatically propagate to the other, creating silent data drift.

**Root Cause (architectural — 5th incident in the same category):**
The CMS data stack has three layers that must stay in sync: (1) Payload schema (`SiteConfig.ts`), (2) data fetch layer (`page.tsx`), (3) frontend UI types + inline edit fields (`*Client.tsx`). There was no guardrail, checklist, or automation enforcing that changes to one layer propagated to the others. Additionally, schema changes require a server restart that was never mandated.

Full audit revealed one concrete discrepancy: `clients[].url` existed in the CMS schema but was never wired through the contact page data fetch, TypeScript type, or inline edit fields. The field was invisible to the frontend.

**Resolution (systemic — per escalation triggers, not incremental):**
1. **Fixed the concrete drift:** Added `url` to `ClientEntry` type, `CLIENT_FIELDS`, `contact/page.tsx` fallbacks and data mapping. Client names in the marquee now link to their URLs when provided.
2. **Created CMS-Frontend Parity Checklist** in `AGENTS.md` — a blocking gate (like the Cross-App Parity Checklist) that maps "what you did" to "what you must also do" across all three layers.
3. **Added two new Hard Guardrails** to `AGENTS.md`:
   - #14: ALWAYS run the CMS-Frontend Parity Checklist after any field change.
   - #15: ALWAYS restart the Payload dev server after schema changes.
4. **Added EAP-019** anti-pattern documenting single-layer field changes.

**Principle extracted → `AGENTS.md` CMS-Frontend Parity Checklist:** CMS schema, data fetch, and frontend UI are three layers of a single data contract. A field change to any one layer that doesn't propagate to all three is a bug.

**Category:** CMS UX / inline editing — fifth occurrence (ENG-027→031). Escalation trigger activated: systemic fix applied.

---

## Session: 2026-03-29 — EditableArray Save Flow Bugs

**Chat:** Current session
**Scope:** `src/components/inline-edit/EditableArray.tsx`, `src/components/inline-edit/InlineEditProvider.tsx`, `src/components/inline-edit/inline-edit.module.scss`

#### ENG-030: "My entry for present is never documented or saved"

**Issue:** The user edited Teams in the array panel (added Goldman Sachs URL, set period to "Present"), clicked "Done", but:
1. The data was never persisted to the CMS — the `period` field showed as `null` in the API.
2. The sidebar display didn't update to show "Present" in place of the index number.

**Root Cause (compound — three interacting bugs):**
1. **"Done" didn't save:** The `commitPanel` function only staged changes in a local dirty map via `ctx.setFieldValue()`. The user had to ALSO click "Save" on the InlineEditBar at the bottom — a separate step that was neither discoverable nor expected. The user naturally treated "Done" as "done, save it."
2. **`save()` read stale state:** Even if the bottom-bar Save button was clicked immediately after Done, the `save` callback closed over `dirtyFields` from its `useCallback` dependency. Since `setFieldValue` queues a state update (not synchronous), calling `save()` in the same event loop read the OLD empty `dirtyFields`. The save would silently succeed with zero changes.
3. **Schema not in database:** The `period` field was added to `SiteConfig.ts` but the Payload dev server hadn't been restarted. Payload pushes schema changes on startup only, so the `period` column didn't exist in Postgres. Even a correct save would have stripped the field silently.

**Resolution:**
1. **"Save & Close":** Renamed the button and made `commitPanel` call `flushSync(() => ctx.setFieldValue(...))` followed by `await ctx.save()`. The panel now saves directly to the CMS — one click, no hidden second step.
2. **`save()` reads from ref:** Changed `save()` to read `dirtyRef.current` (a synchronously-updated ref) instead of the `dirtyFields` closure. `setFieldValue` now also updates `dirtyRef.current` inside the state setter callback, ensuring `save()` always sees the latest dirty fields regardless of React's batching.
3. **Removed `registryRef.current.clear()`:** After saving, the old code wiped the field registry. This meant that editing the same array a second time in the same session would silently fail (field not registered → `setFieldValue` returns early). The registry is no longer cleared; stale entries are harmlessly overwritten when components re-register after `router.refresh()`.
4. **Restarted dev server:** Schema sync pushed the `period` column to Postgres.

**Principle extracted:**
- Panel-level "Done" or "Submit" buttons MUST save to the backend — never leave data in a local staging area that requires a second UI action to persist. Users expect the most prominent action button to complete the operation.
- React `save()` callbacks that need the latest state must read from a ref, not from closure-captured state, because `setFieldValue` → `save()` in the same event loop will see stale data due to React batching.
- CMS schema changes require a server restart to take effect in the database. If the agent adds fields to a Payload collection/global, it must also restart the dev server.

**Category:** CMS UX / inline editing — fourth occurrence (see ENG-027, ENG-028, ENG-029).

---

## Session: 2026-03-29 — EditableArray UX and Teams Schema

**Chat:** Current session
**Scope:** `src/components/inline-edit/EditableArray.tsx`, `src/components/inline-edit/inline-edit.module.scss`, `src/globals/SiteConfig.ts`, `src/app/(frontend)/HomeClient.tsx`, `src/app/(frontend)/page.tsx`

#### ENG-029: "It's really unclear about what the second field is"

**Issue:** The EditableArray panel for Teams was confusing in three ways:
1. Input fields had no visible labels — only placeholder text that vanishes when a value is present. With "#" in the URL field, users couldn't tell what the field was for.
2. The user typed period info ("Present", "2023-2024") into the URL field because no period field existed and nothing indicated the field was for URLs.
3. Changes in the panel weren't visually reflected on the sidebar because the sidebar rendered sequential numbers (i+1), not any data from the URL field.

**Root Cause:** The EditableArray panel relied solely on `placeholder` for field identification. When fields had values, there was zero visual indication of what each input was for. The Teams schema also lacked a `period` field, so users had no place to put temporal context.

**Resolution:**
1. Added visible `<label>` elements above each input in the EditableArray panel — styled as small uppercase labels that persist regardless of input state.
2. Added `period` field to the Teams CMS schema (`SiteConfig.ts`) for time context like "2023-2024" or "Present".
3. Updated Teams field definitions to use clearer labels: "Company", "Period", "Website" instead of "Name", "URL".
4. Updated sidebar rendering: shows period (e.g. "Present") instead of sequential index when available; company names link to URLs when a valid URL is provided.

**Principle extracted:** Form fields in editing UIs must always have persistent visible labels — placeholders alone are insufficient because they disappear when a value is present.

**Category:** CMS UX / inline editing — third occurrence (see ENG-027, ENG-028).

---

## Session: 2026-03-29 — Inline Edit Coverage Gaps

**Chat:** Current session
**Scope:** `src/globals/SiteConfig.ts`, `src/app/(frontend)/page.tsx`, `src/app/(frontend)/HomeClient.tsx`

#### ENG-028: "I still cannot edit the section header and also the About section"

**Issue:** Three categories of content on the home page were not editable via inline editing:
1. Bio paragraph — conditional rendering meant when CMS bio was empty (default), the hardcoded Lorem Ipsum fallback rendered without EditableText. Chicken-and-egg: can't populate bio via inline edit because it only shows the editable version when bio is already populated.
2. Section headers ("ABOUT", "TEAMS", "LINKS") — hardcoded strings with no corresponding CMS fields. Nothing to save to.
3. Footer CTA and email — not wrapped in EditableText.

**Root Cause:** 
1. Bio: defensive conditional `{siteConfig.bio ? <EditableText> : <p>hardcoded</p>}` excluded the empty-state path from editing.
2. Section labels: no CMS fields existed — they were static strings in JSX, not data.
3. Footer: simply not wired up during initial integration.

**Resolution:**
1. Removed bio conditional — always renders EditableText, using placeholder text as fallback content when bio is empty.
2. Added four new text fields to `SiteConfig` global (new "Labels & Footer" tab): `aboutLabel`, `teamsLabel`, `linksLabel`, `footerCta` — all with sensible defaults. Wired through `page.tsx` → `HomeClient` as EditableText.
3. Wrapped footer CTA and email as EditableText.

**Principle extracted -> `engineering-anti-patterns.md`:** Inline-editable fields must never have conditional rendering that hides the editable component when the CMS value is empty — the empty state is exactly when the user needs to populate it.

**Category:** CMS UX / inline editing — second occurrence (see ENG-027).

---

## Session: 2026-03-29 — Inline CMS Editing System

**Chat:** Current session
**Scope:** `src/components/inline-edit/` (new), all `*Client.tsx` pages, `page.tsx` data layers

#### ENG-027: Inline CMS editing — Figma-like hover/edit/save on frontend

**Issue:** Content editing required navigating to the Payload admin panel — no way to edit text directly on the live site.

**Resolution:** Built a full inline editing system with these components:
- `InlineEditProvider` — React context managing dirty field state, batched saves, keyboard shortcuts (Cmd+S), and beforeunload warnings.
- `EditableText` — Wraps any text element; shows blue bounding box on hover, activates `contentEditable` on double-click, tracks changes in dirty map.
- `EditableArray` — Floating panel for array CRUD (add/remove/reorder) on teams, links, experience, education, collaborators, tools, etc.
- `InlineEditBar` — Fixed bottom toolbar showing unsaved change count with Save/Discard buttons.
- `api.ts` — Batches dirty fields by API target, calls Payload REST API (PATCH for collections, POST for globals). Wraps richText fields with `makeLexicalParagraph()`.

Integrated across all 6 page types: Home, About, Contact, Experiments, Reading, Work detail. Also wired `site-config.bio` (richText) to the Home page frontend — it was previously defined in the CMS schema but rendered as hardcoded Lorem Ipsum.

**Data shape changes:** ProjectClient collaborators/tools changed from `string[]` to `{name: string}[]` to match CMS format for direct PATCH. ContactClient clients changed from `string[]` to `{name: string}[]`.

**Architecture decision:** Used Payload's built-in REST API with `payload-token` cookie auth (same-origin, auto-sent). No custom API routes needed. Admin-only code is conditionally rendered (not behind dynamic import yet — future optimization).

**Category:** Feature / CMS UX — first occurrence.

---

## Session: 2026-03-29 — Payload Admin Login UX

**Chat:** Current session
**Scope:** `src/payload.config.ts`, `src/collections/Users.ts`, `src/components/admin/EnableAutocomplete.tsx`, `src/app/(payload)/custom.scss`, `.env`

#### ENG-026: Payload admin login friction — no autocomplete, short sessions, no auto-login

**Issue:** Every dev session required manually typing credentials into the Payload admin login page. Browser autocomplete was not offering saved credentials, and sessions expired after 2 hours (Payload default).

**Root Cause:** Three compounding factors: (1) Payload's login form does not set `autocomplete` attributes that browsers need to offer saved credentials; (2) default `tokenExpiration` of 7200 seconds (2 hours) means frequent re-login; (3) no `autoLogin` config was set for local development.

**Fix:**
1. Extended `tokenExpiration` to 30 days (2,592,000 seconds) in the Users collection `auth` config — sessions persist across restarts.
2. Added `admin.autoLogin` gated behind `isDev && PAYLOAD_ADMIN_EMAIL` env var — when both are set, dev bypasses the login page entirely.
3. Created `src/components/admin/EnableAutocomplete.tsx` (`beforeLogin` component) that uses `useEffect` + `MutationObserver` to set `autocomplete="username email"` / `autocomplete="current-password"` on the login form inputs — enables browser credential manager even when autoLogin is off.
4. Added autofill-safe CSS in `custom.scss` to prevent Chrome's blue autofill background from clashing with Payload's dark theme.

**Lesson:** Payload v3's `autoLogin` (with `prefillOnly: false`) is the correct way to skip login in dev. The `beforeLogin` admin component slot is rendered on the login page and can run client-side effects. Token expiration is set on the collection `auth` object, not in the admin config.

---

## Session: 2026-03-29 — Lacework Case Study CMS Implementation

**Chat:** Current session
**Scope:** `src/lib/lexical.ts`, `src/app/(frontend)/work/[slug]/page.tsx`, `src/app/(frontend)/work/[slug]/ProjectClient.tsx`, `src/app/(frontend)/api/update-lacework/route.ts`

#### ENG-025: Lexical richText silently dropped by string type check

**Issue:** The `page.tsx` project page mapped Payload CMS data using `typeof doc.description === "string" ? doc.description : "Project description."`. Since Payload's `richText` field stores Lexical JSON (an object, not a string), all CMS-authored body text was silently replaced with placeholder strings. This meant any content entered through the admin UI would never display.

**Root Cause:** The frontend was written to accept plain strings but the Payload schema defines `description` and section `body` as `richText` (Lexical JSON). The type guard `typeof === "string"` always failed for real CMS content.

**Resolution:**
1. Created `src/lib/lexical.ts` with two utilities:
   - `makeLexicalParagraph(text)` — creates valid Lexical JSON from a plain string (for seeding)
   - `extractLexicalText(value)` — recursively extracts plain text from Lexical JSON objects
2. Updated `page.tsx` to use `extractLexicalText()` instead of the `typeof === "string"` check
3. Created `src/app/(frontend)/api/update-lacework/route.ts` — one-time API endpoint using Payload local API to find-and-update the project record with proper Lexical JSON content
4. Added labeled image placeholder system: `IMAGE_PLACEHOLDERS` constant maps section headings to descriptive labels, `ProjectClient` renders dashed-border skeleton boxes with labels and index numbers

**Principle:** When a CMS field uses structured data (Lexical JSON, Slate, ProseMirror), the frontend must have a proper deserializer — not a `typeof string` check. Silent fallbacks mask the problem until content editors wonder why their text never appears.

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

#### ENG-019: "Module not found: Can't resolve 'src/components/admin/EnableAutocomplete'"

**Issue:** Build error — Turbopack cannot resolve the bare path `src/components/admin/EnableAutocomplete` in the Payload-generated `importMap.js`. The admin panel and any SSR page that touches the import map fail to compile.

**Root Cause:** `payload.config.ts` specified the `beforeLogin` component as `'src/components/admin/EnableAutocomplete'` — a bare string path. Payload copies this string directly into the generated `importMap.js` as an import specifier. Turbopack (unlike Webpack in some configurations) does not resolve bare `src/...` paths — it needs either a path alias (`@/...`) or a relative path (`./...`).

**Resolution:** Changed the path in `payload.config.ts` from `'src/components/admin/EnableAutocomplete'` to `'@/components/admin/EnableAutocomplete'`. The `@/` alias is configured in `tsconfig.json` to map to `./src/*`. The import map was regenerated by the dev server automatically.

**Principle extracted -> `engineering-anti-patterns.md`: Payload admin component paths must use `@/` alias, not bare `src/` paths.**

**Category:** Build / Payload CMS — first occurrence.

---

#### ENG-020: "Hydration failed because the server rendered text didn't match the client"

**Issue:** Recoverable hydration mismatch error on the homepage when logged in as admin. The `EditableText` component rendered different HTML attributes on server vs client — the server produced plain elements (no `data-editable`, no inline-edit class) while the client produced admin-enhanced elements. Additionally, `new Date().toLocaleDateString()` in the footer generated time-dependent output that could differ between server and client.

**Root Cause:** Two separate issues:
1. The `EditableText` and `EditableArray` components checked `ctx?.isAdmin` to decide between a plain branch (non-admin) and an enhanced branch (admin with `data-editable`, `contentEditable`, inline-edit CSS class). During SSR, the `InlineEditContext` resolved to `null` (likely a Turbopack module identity issue between the provider and consumer during SSR bundling), causing the non-admin branch. During client hydration, the context resolved correctly, causing the admin branch. Different branches = different HTML = hydration mismatch.
2. `new Date().toLocaleDateString(...)` was called directly in JSX, producing output that depends on the execution time and locale. If SSR and client hydration disagree on the formatted date, it's a hydration mismatch.

**Resolution:**
1. Added `const [hydrated, setHydrated] = useState(false)` + `useEffect(() => setHydrated(true), [])` to `EditableText.tsx`. Derived `const isAdmin = hydrated && !!ctx?.isAdmin`. This ensures both server and client initially render the non-admin branch (matching), then admin features activate post-mount. Applied the same pattern to `EditableArray.tsx` (which already had a `mounted` state for portal rendering — reused it for the admin guard).
2. Moved `new Date().toLocaleDateString()` in `HomeClient.tsx` to a `useEffect` with `useState("")`, so the footer renders an empty-safe value during SSR and fills in the date after mount.

**Principle extracted -> `engineering-anti-patterns.md` EAP-014 (existing): Already documents the `useState + useEffect` pattern for hydration-safe rendering. This incident is a new instance of the same pattern applied to inline-edit admin branching.**

**Category:** Hydration / SSR — 4th occurrence (ENG-017, ENG-018, ENG-019 were related; EAP-014 already exists).

---

#### ENG-021: "Admin bar blocks navigation buttons, bad practice to overlay content"

**Issue:** The admin bar (`AdminBar`) used `position: fixed; top: 0` which removed it from document flow. Every client page compensated with `style={{ paddingTop: 44 }}` (inline) or `&[data-admin] { padding-top: 44px }` (SCSS). This is fragile: the hardcoded 44px must match the bar's height exactly, the inline style violates AP-003, and if the bar height ever changes, all 6+ pages break silently. The bar also blocked navigation buttons and other interactive elements in the header area.

**Root Cause:** `position: fixed` removes the element from document flow. The pattern of "fixed element + manual padding offset" is the exact anti-pattern documented in AP-004 for sidebars, applied here to a top bar. The same class of problem: fragile coupling between the overlay and every page that must compensate for it.

**Resolution:** Changed both `AdminBar` and `InlineEditBar` from `position: fixed` to `position: sticky`. Sticky positioning keeps elements in the document flow (naturally pushing content) while still sticking to viewport edges during scroll. Removed all compensating hacks:
- `style={{ paddingTop: 44 }}` from HomeClient, AboutClient, ContactClient, ReadingClient, ExperimentsClient
- `data-admin` attribute and `&[data-admin] { padding-top: 44px }` from ProjectClient / page.module.scss
- Removed `left: 0; right: 0` from `.bar` and `.editBar` (sticky elements auto-fill their parent width)

**Cross-category note:** Also documented as FB-050 (design) — the overlay pattern is a UX anti-pattern (blocking interactive elements with non-interactive overlays).

**Category:** CSS Layout / Admin UI — first occurrence of this specific pattern, but related to AP-004 (fixed elements with padding offsets).

---

#### ENG-042: "Design system code updates not reflective of playground in real time"

**Issue:** The user discovered that changes to the main site's `ScrollSpy` component were not being reflected in the playground's version, and vice versa. A full audit revealed multi-directional drift across three codebases: (1) main site `src/components/ScrollSpy.tsx`, (2) playground reusable `playground/src/components/scroll-spy.tsx`, (3) playground demo `playground/src/app/components/scroll-spy/page.tsx`. The playground had correct behavioral patterns (closest-element detection, click/drag dead zone) that were never ported to the main site. The main site had correct visual updates (label color/weight pairing, track gap) that were partially ported to the playground component but not the demo. The playground component also had an AP-031 violation (CSS transform centering on FM-animated label) that the main site had already fixed.

**Root Cause:** Cross-App Parity Checklist was not enforced atomically. Changes were made to one codebase and the corresponding update to the other was either partial or skipped entirely. The three codebases evolved independently: the playground was improved during the initial ScrollSpy implementation session (correct behavior patterns), and the main site was improved during this session (visual polish), but neither was synced back to the other. The playground demo was treated as "close enough" and never updated when the reusable component changed.

**Resolution:**
- **Main site ← Playground behavior:** Ported closest-element `indexFromPointer`, 3px dead zone pattern, `pointerStart` ref, `endInteraction` handler, and `data-notch-index` attributes.
- **Playground demo ← Main site visuals:** Added active/inactive label color and weight differentiation (`text-foreground font-medium` vs `text-muted-foreground/60`).
- **Playground component ← Main site fix:** Fixed AP-031 label centering by replacing `top-1/2 -translate-y-1/2` with `top-0 h-4 flex items-center` (non-transform centering). Added `data-active` to notch container for state propagation.

**Category:** Cross-App Parity — this is the ScrollSpy-specific instance of a systemic process gap: the Cross-App Parity Checklist covers creation and modification but doesn't enforce bidirectional sync when two versions of the same component exist.

---

#### ENG-016: ASCII Art Tool — Standalone App Scaffold

**Issue:** Proactive build — user requested rebuilding the Portrait Halftone ASCII video tool as a standalone Next.js app within the monorepo, following the playground pattern.

**Root Cause:** N/A — new feature build.

**Resolution:** Scaffolded `ascii-tool/` as a third Next.js app in the monorepo: own package.json with ffmpeg.wasm, idb-keyval, geist, next-themes, lucide-react; shared Tailwind v4 tokens via `globals.css` @theme block; COOP/COEP headers in next.config.ts for SharedArrayBuffer (ffmpeg.wasm requirement); port 4002 registered. Engine ported as pure logic modules. Persistence migrated from Express server to localStorage + IndexedDB. MP4 export migrated to @ffmpeg/ffmpeg WASM. Build compiles with zero TypeScript errors.

**Cross-category note:** Also documented as FB-051 (design) — 7 new DS components and 9 missing playground pages built as prerequisite.

**Principle extracted -> `engineering.md` §3.1: Multi-app monorepo pattern — each app owns its dependencies and config but shares design tokens via manually synced globals.css.**

---

#### ENG-017: Undocumented App — Architecture Gap

**Issue:** User feedback — "whenever there is a new app being spun up or added to the repo, this should be documented in the architecture." The ASCII Art Studio was scaffolded without a corresponding entry in `AGENTS.md`'s architecture section, without its own version control manifest, and without a formal onboarding process.

**Root Cause:** No "New App Onboarding Checklist" existed. The agent treated app creation as a code task (scaffold files, install deps) rather than an architecture task (register in docs, establish versioning, update meta-prompt). Port registration was done, but versioning and architecture docs were afterthoughts.

**Resolution:** (1) Added **App Registry** section to `AGENTS.md` — single source of truth for all apps in the monorepo. (2) Created `ascii-studio.json` version manifest with same structure as `elan.json`. (3) Updated `scripts/version-bump.mjs` and `scripts/version-release.mjs` to be data-driven multi-app scripts (APPS config map, backward-compatible). (4) Added `ascii-tool:version:patch/minor/major/release` npm scripts. (5) Created `ascii-tool/src/lib/version.ts` as synced version file. (6) Added **New App Onboarding Checklist** to `AGENTS.md` — 13-step mandatory process. (7) Updated Cross-App Parity Checklist to include ascii-tool. (8) Updated `docs/engineering.md` §9 architecture and route tables. (9) Updated Hard Guardrail 13 to reference multi-app version releases.

**Principle extracted -> `engineering.md` §9: An app that exists in the filesystem but not in the architecture docs is a maintenance hazard. Documentation IS part of the creation workflow, not a post-step.**

---

#### ENG-018: Masonry layout — CSS column-count replaced with JS column distribution

**Issue:** User feedback — masonry tiles were all the same height (forced aspect-ratio), cover images were cropped, and testimonial/project ordering didn't match expectations. CSS `column-count` fills top-to-bottom per column, making "row N, column M" positioning unintuitive for content curation.

**Root Cause:** CSS `column-count` distributes items sequentially into columns (item 1-N/3 in col 1, N/3-2N/3 in col 2, etc.), not left-to-right by row. This means placing an item at "index 2" puts it in column 1 (not column 3), and there's no way to control row/column placement without knowing total item count and heights upfront. Fixed `aspect-ratio` on `.projectHero` combined with `object-fit: cover` on images forced uniform tile heights and cropped thumbnails.

**Resolution:** (1) Replaced CSS `column-count` masonry in `page.module.scss` with a CSS Grid shell (`grid-template-columns: repeat(3, 1fr)`) + JS round-robin distribution in `HomeClient.tsx`. Items distributed via `items.forEach((item, i) => cols[i % columnCount].push(item))`. Each column rendered as a flex column. (2) Responsive column count via `useState(3)` + `useEffect` (768px → 2 cols, <768px → 1 col). Default of 3 matches server render for desktop; mobile gets brief reflow. (3) Removed `aspect-ratio` from `.projectHero`, changed `.projectCoverImg` to `width: 100%; height: auto`. (4) Updated CMS testimonial and project ordering via Payload REST API.

**Cross-category note:** Also documented as FB-052 (design) — visual hierarchy and thumbnail proportions.

**Principle extracted -> `engineering.md` §3: For masonry layouts requiring predictable item positioning, prefer JS-distributed columns over CSS column-count. CSS columns are height-balanced by the browser and don't support row-based addressing.**

---

#### ENG-019: Drag-and-drop tile reordering for homepage masonry grid

**Issue:** User request — need to drag tiles to reorder them in the inline edit view, with changes persisting to the backend.

**Root Cause:** No mechanism existed for curating tile order visually. The `interleaveGrid` function algorithmically placed testimonials among projects, and individual `order` fields on each collection couldn't encode a unified interleaved sequence.

**Resolution:** (1) Added `gridOrder` JSON field to `SiteConfig` global — stores `[{type, id}]` array representing the flat tile sequence. (2) When `gridOrder` exists, `HomeClient` uses it to order items instead of `interleaveGrid`, with new/untracked items appended. (3) Implemented reorder mode (admin only) using `@dnd-kit/core` + `@dnd-kit/sortable`: flat CSS grid with `rectSortingStrategy`, 6-dot drag handles, `DragOverlay` for visual feedback. (4) Save/cancel bar persists the new order to SiteConfig via `POST /api/globals/site-config`. (5) Original `interleaveGrid` preserved as the default fallback when no `gridOrder` is saved.

**Cross-category note:** Also documented as FB-053 (design) — visual curation affordance for homepage grid.

**Principle extracted -> `engineering.md` §3: When multiple collections need a unified ordering that can't be expressed by individual per-collection `order` fields, store the merged sequence as a single JSON field on a global config rather than trying to reverse-engineer separate order spaces.**

---

#### ENG-020: "I cannot drag things still" — DnD listeners on child swallowed by Link

**Issue:** User reported drag-and-drop tiles could not be dragged after the reorder feature (ENG-019) shipped. Clicking the "Reorder tiles" button entered reorder mode, but attempting to drag any tile did nothing.

**Root Cause:** The `@dnd-kit` `useSortable` listeners (`onPointerDown`, etc.) were attached to a 28×28px drag handle `<button>` positioned absolutely inside the tile. But the tile's main content was a Next.js `<Link>` (rendered as `<a>`) that covered the entire card. The `<a>` tag intercepted all pointer events before they reached the handle — clicking anywhere on the tile started link navigation, not a drag. Even when the user managed to click the tiny handle, the `PointerSensor` 5px activation distance meant any slight movement triggered the link navigation before the drag activated.

**Resolution:** (1) Moved `{...attributes}` and `{...listeners}` from the handle `<button>` to the outer wrapper `<div>` — making the entire tile the drag target. (2) Added `pointer-events: none` on `.sortableTileContent` (the div wrapping the card content) to prevent the inner `<Link>` from capturing events. (3) Added `touch-action: none` on the tile for proper pointer capture. (4) Added `user-select: none` to prevent text selection during drag. (5) Changed the handle from a `<button>` to a visual-only `<div>` indicator.

**Cross-category note:** Also documented as FB-054 (design) — affordance failure from a drag handle that was too small and competed with a link overlay.

**Principle extracted -> `engineering.md` §3: When implementing DnD inside components that contain `<Link>` or `<a>` tags, attach drag listeners to the outermost wrapper and apply `pointer-events: none` to the inner clickable content. Never put DnD listeners on a child element inside a Link — the Link's pointer event handling will always win. See also EAP-028.**

---

#### ENG-021: "Drag mode is working, but it doesn't save the actual dragged order"

**Issue:** User dragged tiles into a new order and clicked "Save order." The save appeared to succeed (button showed "Saving…" then the mode exited), but the grid immediately reverted to the pre-drag order. On page reload, the old order was still shown.

**Root Cause:** After the POST to `/api/globals/site-config` succeeded, the save handler called `setReorderMode(false)` — which switched `displayItems` from `orderedItems` (the drag result) back to `gridItems`. But `gridItems` is derived from the `savedGridOrder` **prop**, which comes from the server component (`page.tsx`). The server component had not re-run, so its `savedGridOrder` was stale. No `router.refresh()` was called, so the server never re-fetched the updated `gridOrder` from the CMS. Additionally, the `useEffect` that syncs `orderedItems` with `gridItems` (`if (!reorderMode) setOrderedItems(gridItems)`) immediately overwrote the drag result with the old server data.

**Resolution:** (1) Imported `useRouter` from `next/navigation` and called `router.refresh()` after a successful save — this triggers the server component tree to re-run, re-fetching `gridOrder` from the CMS and sending updated props to the client. (2) Added a `hasPendingSave` flag to bridge the gap between save and server refresh: while the flag is true, `displayItems` continues to show `orderedItems` (the drag result), not the stale `gridItems`. (3) When the refreshed `gridItems` arrives (the `useEffect` fires because the `gridItems` dependency changed), the flag clears and the component transitions to the server-confirmed order. This prevents the "snap back to old order" flash.

**Principle extracted -> `engineering.md` §3: In Next.js App Router, client state changes don't automatically refresh server component props. After any client-side mutation that affects data fetched by a parent server component, call `router.refresh()` to re-run the server tree. When the mutation result must be visible immediately (no flash of stale data), hold optimistic state in the client until the server refresh arrives — use a flag like `hasPendingSave` to bridge the gap.**

---

## Entry Template

```markdown
#### ENG-053: "How do I store assets? Where are thumbnails and resumes stored?"

**Issue:** User discovered that all uploaded media (thumbnails, hero images, avatars) were stored on local disk (`./media/` directory) despite the database being cloud-hosted on Supabase Postgres. This meant files would be lost on redeploy. Additionally, the Media collection only accepted `image/*` MIME types, preventing document uploads (PDFs, resumes).

**Root Cause:** The Payload CMS config had no storage adapter plugin — it defaulted to local `staticDir: 'media'` disk storage. The database (structured metadata) was on Supabase, but actual binary files had no cloud persistence. The `mimeTypes` restriction was set to images-only.

**Resolution:** (1) Installed `@payloadcms/storage-s3` adapter. (2) Configured `s3Storage` plugin in `payload.config.ts` pointing to Supabase Storage's S3-compatible endpoint with `forcePathStyle: true`. (3) Added env vars (`S3_ENDPOINT`, `S3_BUCKET`, `S3_REGION`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`) to `.env`. (4) Expanded `mimeTypes` to include `application/pdf` alongside `image/*`. User still needs to create a `media` bucket in Supabase Dashboard and provide S3 access keys.

**Principle extracted -> `engineering.md` §12: Media & File Storage (Supabase Storage) — new section documenting the storage architecture, S3 adapter configuration, env vars, bucket setup, MIME types, public URL pattern, and verification commands. Also created EAP-032 (architectural changes without engineering.md update) after the user flagged this documentation was initially skipped — 7th occurrence of the documentation-skip pattern.**

---

#### ENG-054: "Cannot add links to LinkedIn icon button on testimonial cards"

**Issue:** User could not edit the LinkedIn URL on testimonial cards via inline editing. The LinkedIn icon was always visible but its URL could only be changed through the Payload admin panel, not the inline editing UI.

**Root Cause:** The `linkedinUrl` field had no inline edit UI. The `TestimonialCard` component rendered the LinkedIn icon as a static link/span, but unlike `text`, `name`, and `role` fields, `linkedinUrl` had no `EditableText` wrapper or any other inline editing mechanism. This is an attribute (URL) rather than visible text, so `EditableText` (which uses `contentEditable`) couldn't be directly applied.

**Resolution:** Added a click-to-edit popover on the LinkedIn icon when admin. Clicking the icon opens a URL input popover with save/cancel. Saves directly via `updateCollectionField('testimonials', id, 'linkedinUrl', value)` — a new API helper added to `inline-edit/api.ts`. The LinkedIn icon also turns accent-colored when a URL is set, providing visual feedback.

**Principle extracted -> inline edit system should cover ALL CMS fields, not just visible text. Attributes like URLs need dedicated editor patterns (popovers, modals) since they aren't displayed as text content.**

---

#### ENG-055: "Cannot upload images for testimonial card avatars inline"

**Issue:** User wanted to upload avatar photos for testimonial cards directly from the inline edit view. The avatar field existed in the CMS schema (`type: 'upload', relationTo: 'media'`) and uploads route to Supabase S3, but there was no inline upload UI.

**Root Cause:** The inline edit system only supported text (`EditableText`) and array (`EditableArray`) editing. File uploads require a different flow: file picker → multipart upload to `/api/media` → relationship update on the parent document. No inline upload component existed.

**Resolution:** (1) Added `uploadMedia(file, alt)` helper to `inline-edit/api.ts` — POSTs `FormData` to `/api/media` and returns `{ id, url }`. (2) Added `updateCollectionField(collection, id, field, value)` helper for direct single-field PATCH updates. (3) Created `AvatarUpload` sub-component inside `TestimonialCard.tsx` — renders hover overlay on avatar, opens native file picker, shows instant preview via blob URL, uploads to Payload media (→ Supabase S3), then updates the testimonial's `avatar` relationship field and refreshes. (4) Added corresponding SCSS styles for the upload overlay and loading spinner.

**Principle extracted -> The inline edit system needs a file upload primitive (`uploadMedia`) alongside its text primitives. The upload → relationship update → refresh pattern applies to any CMS upload field and should be reusable.**

---

#### ENG-056: "Audit all current portfolio and playground parity"

**Issue:** User requested a full audit of whether all main-site components are reflected in the playground design system UI.

**Root Cause:** N/A — proactive audit request.

**Resolution:** Audit completed. All 32 shared UI/layout components have matching playground preview pages and sidebar entries. TestimonialCard is in the playground with a Tailwind-based demo. Gaps found are by-design exclusions (admin chrome, inline edit subsystem, elan-visuals). Registry (`archive/registry.json`) has duplicate IDs and stale `hasPreview` flags — cleanup recommended. No missing components found.

**Principle extracted -> Periodic parity audits catch registry drift before it becomes systemic. The registry's `hasPreview` field should be kept in sync after each playground page creation.**

---

#### ENG-057: "I need the ability to make only certain words bold"

**Issue:** User reported three issues: (1) ⌘B bolds the entire text element, not selected words — no partial bold support. (2) TextFormatBar doesn't reflect selection-level formatting state. (3) Quotation mark on testimonial cards is not editable (can't click it to start editing the quote).

**Root Cause:** (1) `EditableText` ⌘B handler changed `el.style.fontWeight` on the whole element instead of using `document.execCommand('bold')` on the text selection. (2) `TextFormatBar` read element-level `getComputedStyle()` but not selection-level formatting via `queryCommandState`. (3) The quotation mark `<span>` was a separate element from the `EditableText` with no click handler to bridge them.

**Resolution:** (1) Rewrote ⌘B/⌘I in `EditableText.tsx` to detect text selections (`hasTextSelection` helper) and use `document.execCommand('bold'/'italic')` for word-level formatting. Falls back to element-level toggle when no selection. `handleInput` now captures `innerHTML` for `isRichText` fields. (2) Added `selectionBold`/`selectionItalic` properties to `TextFormatBar` state using `document.queryCommandState`. Added `selectionchange` listener to track formatting as the caret moves through formatted text. Bold/italic toolbar buttons also use `execCommand` when a selection exists. (3) Added click handler to quotation mark spans that dispatches a synthetic `dblclick` on the adjacent `[data-editable]` element. Added `.quoteMarkEditable` / `.quoteIconEditable` styles for hover affordance. (4) Changed testimonial `text` field from `textarea` to `richText` in CMS schema so formatting persists. Added `htmlToLexicalDocument()` in `api.ts` to convert HTML with `<b>`/`<i>` tags to Lexical JSON with format bitmasks. Added `lexicalToHtml()` in `lexical.ts` for rendering formatted Lexical content. Added `htmlContent` prop to `EditableText` for round-trip formatted rendering. Updated both home and contact page data fetches to pass `textHtml`.

**Principle extracted -> Inline text formatting requires three synchronized layers: (1) DOM-level `execCommand` for visual formatting within `contentEditable`, (2) selection-state tracking via `queryCommandState` for toolbar state, (3) HTML-to-Lexical and Lexical-to-HTML converters for persistence round-trip. Element-level style toggles are only appropriate for whole-field changes (like changing the element's font size), not for inline formatting.**

---

#### ENG-058: "Raw Lexical JSON displayed in testimonial card after bolding"

**Issue:** After the user bolded words ("product sense", "judgment") in a testimonial quote via inline edit, the card displayed the raw Lexical JSON string `{"root":{"type":"root","format":"","indent":0,...}` instead of the formatted text.

**Root Cause:** Two compounding failures: (1) The schema was changed from `textarea` to `richText` but the dev server was not restarted before the user tested, so Payload still treated `text` as a textarea field. When the inline edit system saved a Lexical JSON object, Payload serialized it to a string. (2) Both `lexicalToHtml()` and `extractLexicalText()` had an early return `if (typeof value === 'string') return value` that passed JSON strings straight through without attempting to parse them.

**Resolution:** (1) Added `ensureParsed()` guard to both `lexicalToHtml()` and `extractLexicalText()` in `src/lib/lexical.ts` — detects strings that look like JSON (`{...}` or `[...]`), attempts `JSON.parse()`, and falls through to normal string handling on failure. This makes both functions robust against stringified Lexical data regardless of how it was stored. (2) Restarted the dev server to sync the richText schema, which changes the DB column from text to JSONB so future saves store proper objects.

**Principle extracted -> Any function that processes CMS data with a `typeof value === 'string'` early return MUST also check for serialized JSON. Schema type changes create a window where old-schema storage can serialize objects to strings, and defensive parsing is the only way to handle both migration states. Additionally: schema changes that require server restarts should be paired with an IMMEDIATE restart — not deferred to the user — because the window between schema change and restart is a data corruption risk.**

---

#### ENG-059: "Conflicting routes at /api/contact build error"

**Issue:** Next.js 16.2.1 build failed with: `Conflicting routes at /api/contact: route at /api/contact/route and route at /(frontend)/api/contact/route`. The app could not start.

**Root Cause:** Stale untracked duplicate files existed directly in `src/app/` that mirrored the canonical routes inside the `src/app/(frontend)/` route group. Since Next.js route groups like `(frontend)` are transparent in the URL, both `src/app/api/contact/route.ts` and `src/app/(frontend)/api/contact/route.ts` resolved to the same `/api/contact` path. The duplicates were likely leftovers from the original project structure before the `(frontend)` route group was introduced. Affected directories: `api/`, `about/`, `blog/`, `contact/`, `experiments/`, `reading/`, `work/`, plus `page.tsx`, `page.module.scss`, and `layout.tsx` at the `src/app/` root.

**Resolution:** Deleted all stale untracked files and directories from `src/app/` that conflicted with their `src/app/(frontend)/` counterparts. The canonical versions in `(frontend)/` were retained as they contained the real CMS-integrated code. Total of 9 files/directories removed.

**Principle extracted -> When restructuring the app directory (e.g., introducing a route group like `(frontend)`), all old route files must be removed — not just moved. Untracked duplicates outside the route group silently conflict because Next.js route groups are URL-transparent. A `git status` check for `??` entries in `src/app/` can catch this class of issue early.**

---

#### ENG-060: Spacing token system migration to One GS multiplier-based naming

**Issue:** Spacing tokens used opaque numeric indices (`$portfolio-spacing-01` through `$portfolio-spacing-13`) that required a lookup table for value resolution. The scale had gaps (no 20px, 56px, 72px steps), forcing magic numbers in components like the sidebar (6px padding). Layout tokens (`layout-01..07`) carried no semantic density information. The naming convention was optimized for human designers using Figma panels, not for AI agents reading source code.

**Root Cause:** The original token system was modeled on IBM Carbon's indexed spacing convention. While the pixel values were correct, the naming abstraction leaked no information about value or intent, making it the worst-case scenario for agent-driven development.

**Resolution:** Full three-tier migration to One GS multiplier-based architecture:
- Tier 1 — Primitives: `$portfolio-spacer-Nx` (25 steps, base unit 8px, from `0-125x` to `20x`). SCSS variables encode decimals as hyphens (`0-5x` for `0.5x`).
- Tier 2 — Layout semantics: `$portfolio-spacer-layout-*` map with descriptive density names (`x-compact` through `xxxx-spacious`), Functional density as default.
- Tier 3 — Utility: `$portfolio-spacer-utility-Nx` for component-internal spacing.
- Legacy aliases (`$portfolio-spacing-NN`, `$portfolio-layout-NN`) preserved as deprecated forwards.
- Button component expanded from 3 to 5 sizes with explicit vertical padding tokens.

**Cross-category note:** Also documented as FB-055 (design) — agent readability rationale and naming convention decision.

**Principle extracted -> Design token naming must be optimized for AI agent comprehension. For spacing: (1) Primitive tokens use multiplier-based names so agents can derive values via arithmetic (`spacer-3x` = 3 x 8 = 24px). (2) Layout tokens use semantic density names so agents can reason about intent (`spacer-layout-standard` vs `spacer-layout-spacious`). (3) Indexed names (`spacing-06`) are never acceptable — they encode neither value nor intent.**

---

#### ENG-061: "Doing all this on the button and making sure"

**Issue:** Button component used hardcoded pixel values (e.g., `px-[14px]`, `h-[44px]`) instead of referencing the established three-tier spacing token system. Several values (30px, 44px, 52px heights; 3px, 5px, 11px, 14px padding) didn't land on any token in the grid.

**Root Cause:** Previous iteration optimized for visual feedback (shrinking padding/heights) without constraining values to the token grid. The spacing token system (`_spacing.scss`) was already established but not exposed as CSS custom properties in the playground, and the button was built with raw pixel values.

**Resolution:**
1. Added two new Tier 3 utility tokens to `_spacing.scss`: `utility-1.75x` (14px) and `utility-2.25x` (18px) for button icon sizes.
2. Exposed all primitive (Tier 1) and utility (Tier 3) spacer tokens as CSS custom properties in `playground/src/app/globals.css` `@theme` block.
3. Snapped all off-grid values to nearest token (heights: 30→32, 44→48, 52→56; padding values realigned accordingly).
4. Replaced every hardcoded pixel spacing class with `var()` token references (e.g., `h-[var(--spacer-6x)]`, `px-[var(--spacer-utility-2x)]`).
5. Ran `npm run sync-tokens` after modifying `_spacing.scss`.

**Cross-category note:** Also documented as FB-056 (design) — visual token alignment and grid conformance.

**Principle extracted -> When building components, ALL spacing values (height, padding, gap, icon padding) must reference established token custom properties via `var()`. If a desired value doesn't exist in the token grid, either snap to the nearest token or add a new Tier 3 utility token — never use a raw pixel value that sits between tokens.**

---

#### ENG-042: "DS compliance audit — token and mixin adoption across portfolio"

**Issue:** Design system tokens and mixins existed but weren't adopted across the portfolio site. Brand color drift (`#6c63ff` vs `$portfolio-accent-60`), raw px values for spacing/breakpoints/typography, missing container tokens for 720px width pattern.

**Root Cause:** The DS was built incrementally after many pages existed. No enforcement mechanism ensured new tokens/mixins were retroactively applied. Pages were "good enough" with raw values that happened to match token values numerically.

**Resolution:**
- Added `$elan-container-content: 720px` to spacing tokens.
- Added `$portfolio-radius-xs: 2px` to elevation tokens.
- Ran `npm run sync-tokens` to propagate changes to playground.
- Cross-category: also documented as FB-065 (design).

**Principle extracted -> When adding new tokens or mixins, audit existing consumers that use equivalent raw values and migrate them in the same commit. A token that exists but isn't adopted provides zero value.**

---

#### ENG-073: "Playground experiments not propagated to production across sessions"

**Issue:** Three design experiments (Button two-axis model, three-tier spacing tokens, semantic typography mixins) were conducted in the playground across multiple sessions but never propagated to production. Production code continued using the old `variant=` Button API, legacy `$portfolio-spacing-NN` token names, and raw `font-size:` declarations while the playground already demonstrated the new patterns. User discovered the drift during a comprehensive audit.

**Root Cause:** The Cross-App Parity Checklist in AGENTS.md was one-directional (production → playground). No rule existed for propagating playground experiments back to production. The engineering-iteration skill and pre-flight routing didn't flag playground→production drift as a category. Each experiment session ended with "playground updated" but no verification that production matched.

**Resolution:**
1. Phase 0: Switched 26 component SCSS files from `@yilangaodesign/design-system/scss` to local `../styles` barrel import (stale published package didn't have new tokens).
2. Phase 1: Rebuilt production Button with two-axis model (appearance × emphasis), 4 sizes (xs/sm/lg/xl), `type="button"` default, bounding-box icon spacing. Rebuilt playground DemoButton to match.
3. Phase 2: Migrated 31 SCSS files from legacy `$portfolio-spacing-NN` / `$portfolio-layout-NN` to new `$portfolio-spacer-*` / `$portfolio-spacer-layout-*` names.
4. Phase 3: Resolved 11px → 12px decision (20 instances), migrated safe typography declarations to semantic mixins.
5. Phase 4: Fixed Slider filled track, Toast variants, Checkbox indeterminate state.
6. Phase 5: Fixed playground shell self-consistency (magic px, hardcoded hex), misleading content, shadow/radius violations.
7. Phase 6: Added bidirectional rows to Cross-App Parity Checklist in AGENTS.md, added EAP-030, updated design.md §14.4 and §15.4.

**Cross-category note:** Also impacts design documentation (FB-067 in design-feedback-log).

**Principle extracted -> `engineering.md`: The Cross-App Parity Checklist is bidirectional. When playground experiments advance a component/token, production MUST be updated in the same session. See EAP-030.**

---

#### ENG-074: "Do not hard code anything. Use the primitives in the system"

**Issue:** User found that the playground DemoButton component used hardcoded pixel values (`h-[48px]`, `px-[16px]`) and non-system colors (Tailwind's `bg-emerald-600`, `bg-red-600`, `hover:opacity-90`) instead of referencing the design system's CSS custom properties. The production Button.module.scss also had raw `rgba()` values instead of overlay tokens for inverse/always-dark/always-light hover states.

**Root Cause:** When the DemoButton was rebuilt during ENG-073's Phase 1b, it was reconstructed from the _plan's numeric values_ rather than from the original token-integrated implementation (which used `var(--spacer-6x)` instead of `h-[48px]`). The original implementation was lost during a `git checkout --` operation. Additionally, the SCSS color system lacked overlay interaction tokens, so production used raw `rgba()` values.

**Resolution:**
1. Added 30+ palette CSS custom properties to `playground/src/app/globals.css` `:root` block (neutral, accent, red, green scales mirroring `_colors.scss`).
2. Added overlay interaction tokens (`--overlay-white-08`, `--overlay-black-04`, etc.) to both `globals.css` and `_colors.scss`.
3. Added motion tokens (`--duration-fast: 110ms`, `--easing-standard`) and line-height overrides (`--leading-tight: 1.1`) to `globals.css`.
4. Added theme-adaptive button state CSS vars (`--btn-neutral-*`, `--btn-highlight-*`) with dark mode overrides in `.dark` block.
5. Converted all DemoButton sizing from raw pixels to `var()` spacer token references.
6. Converted all DemoButton colors from Tailwind defaults/hex to palette CSS var references.
7. Replaced all `rgba()` in production `Button.module.scss` with `$portfolio-overlay-*` SCSS tokens.
8. Fixed line-height discrepancy (Tailwind `leading-tight` = 1.25 → overridden to 1.1 to match `$portfolio-leading-tight`).
9. Added `cursor-pointer` to DemoButton base (matching production `cursor: pointer`).

**Cross-category note:** Also a design issue — the DemoButton's visual output now exactly matches production at the token level.

**Principle extracted -> `engineering.md`: Demo components in the playground MUST reference CSS custom property tokens via `var()`, never hardcoded pixel or hex values. When SCSS tokens exist without CSS var counterparts, add them to `globals.css` before building the demo. See EAP-055.**

---

#### ENG-075: "Do a quick audit on the current playground pages and see if any component"

**Issue:** User requested a comprehensive audit of all playground pages to identify components that are hardcoded or re-implemented instead of being imported from the design system source code. Audit found 16 violations across three severity levels: 3 critical (badge, tabs, dialog re-implemented entirely), 5 high (non-ui components like TestimonialCard, ScrollSpy with CSS/inline-style approximations instead of real imports), 5 medium (motion components using CSS @keyframes demos instead of real framer-motion components), 3 low (raw `<button>` elements instead of `@ds/Button`). No deterministic enforcement architecture existed to prevent future violations.

**Root Cause:** Three compounding gaps: (1) No file-scoped rule triggered when agents touched playground pages, (2) No skill document with architecture rules and import decision trees, (3) No `@site/*` path alias for non-ui components in `src/components/`, making direct import impossible for components outside `src/components/ui/`. Additionally, components in `src/components/` use `@/` internally, which resolves to `playground/src/` in the playground context — breaking their transitive dependencies.

**Resolution:**
1. **Layer 1 — File-scoped rule:** Created `.cursor/rules/playground-components.md` with `playground/src/app/components/**` glob trigger. Forces agents to read the skill before writing code.
2. **Layer 2 — Skill:** Created `.cursor/skills/playground/SKILL.md` with architecture overview, import decision tree, reference implementation pointer (button/page.tsx), composition rules (MUST/MUST NOT), validation checklist, and file map.
3. **Layer 3 — AGENTS.md:** Added Engineering Guardrail #17 (mandatory skill read), Design Guardrail #7 (SVG text prohibition), and Pre-Flight Route #9 (playground routing).
4. **Infrastructure — Path aliases:** Added `@site/*` → `../src/components/*` to `playground/tsconfig.json` for non-ui component imports.
5. **Infrastructure — Bridge files:** Created `playground/src/lib/motion.ts` (motion constants bridge), `playground/src/components/inline-edit/` (CMS stub), `playground/src/components/EditButton.tsx` (admin stub) to resolve `@/` alias conflicts for cross-app imports.
6. **Fixes — 16 violations resolved:**
   - 3 critical: badge, tabs, dialog → replaced re-implementations with `@ds/*` imports
   - 5 high: navigation, footer, theme-toggle → `@site/*` imports; scroll-spy, testimonial-card → `@site/*` imports with bridge files
   - 5 medium: mount-entrance, fade-in, arrow-reveal, marquee, expand-collapse → `@site/*` imports using motion bridge
   - 3 low: toast, dropdown-menu, tooltip → replaced raw `<button>` with `@ds/Button`

**Cross-category note:** Also a design issue — playground demos were showing visually different approximations of production components. See EAP-037.

**Principle extracted -> `engineering.md`: Three-layer enforcement (file-scoped rule + skill + AGENTS.md guardrail) is the pattern for any directory-scoped constraint. Single-layer rules (just a rule, or just a comment) are insufficient — agents need multiple redundant gates. See EAP-037.**

---

#### ENG-076: "Playground Code Enforcement Architecture v3 — three-stage pipeline implementation"

**Issue:** ENG-075 established three layers of enforcement (file-scoped rule, skill, AGENTS.md guardrail) but the agent could still bypass the system via design-iteration or engineering-iteration skill paths. The playground skill also lacked a post-implementation self-check, and ESLint had no hard-coded rules for playground-specific violations.

**Root Cause:** The Intent Gate (classify feedback → route to correct file tree) only existed inside the playground skill, which was only activated via Route #9. Agents entering via design-iteration (Route 4) or engineering-iteration (Route 5) never encountered the classification step. Additionally, there was no ESLint safety net — violations were only caught by agent instructions, not by tooling.

**Resolution:**
1. **Stage 1 — Central Intent Gate:** Added Engineering guardrail #18 to `AGENTS.md` as a top-level, non-bypassable rule. Three-category classification (Component visual / Documentation-structure / Shell) now applies regardless of which skill activated the task. Expanded Route #9 scope to cover `playground/src/components/` and `playground/src/app/layout.tsx`.
2. **Stage 2 — ESLint Safety Net:** Added inline custom ESLint plugin (`playground-enforcement`) to `eslint.config.mjs` scoped to `playground/src/app/components/**/*.tsx`. Four rules: (a) ban `@radix-ui/*` imports, (b) ban `<style>` tags, (c) ban `style={{}}` except on `<svg>` and for `transform`/`opacity`/`animationPlayState`, (d) ban Tailwind default palette colors in `className` with allowlist for `bg-neutral-900`, `bg-neutral-800`. No external dependency — plugin defined inline.
3. **Stage 3 — Evaluation Gate:** Added mandatory post-implementation self-check protocol to playground skill with placement check, stack check, quality check, cleanup, and a 3-attempt loop cap.
4. **Pre-existing cleanup:** Replaced raw `<button>` elements in fade-in and mount-entrance pages with `@ds/Button`. Documented expand-collapse's raw button as an explicit allowlisted exception.
5. **Exception protocol:** Added step-by-step exception handling to playground skill for rare user overrides.
6. **Cross-references:** Updated playground skill and file-scoped rule to reference the central guardrail rather than duplicating it.

**Design decision — inline ESLint plugin over eslint-plugin-tailwindcss:** The plan originally called for `eslint-plugin-tailwindcss`, but the plugin (a) is in beta for Tailwind v4, (b) has no rule for "ban specific valid palette colors," and (c) would add an unstable dependency. A purpose-built inline plugin that only checks `className` JSX attributes provides exactly the detection needed with zero external dependencies.

**Principle extracted -> `engineering.md`: Central guardrails (in AGENTS.md Hard Guardrails) are the only reliable way to enforce cross-skill constraints. Putting a constraint inside a single skill creates a bypass for any path that doesn't activate that skill. See ENG-076.**

---

#### ENG-NNN: "[First 10 words of user message]"

**Issue:** [What the user observed]

**Root Cause:** [Technical reason it happened]

**Resolution:** [What was done to fix it]

**Principle extracted -> `engineering.md` §N.N: [Section reference]**
```

---

## Session: 2026-04-03 — Input component rebuilt without playground page update

### ENG-101: "Where is it? I don't see it in the playground shell."

**Date:** 2026-04-03

**Issue:** Rebuilt the Input component with a dramatically expanded API (emphasis axis, 5 sizes, 5 statuses, leading/trailing icons, prefix/suffix, clearable, description) but did not update the playground documentation page. The playground still showed only the old minimal demos (default, label+helper, error, disabled) with no visibility into the new features.

**Root Cause:** Process failure — the component rebuild in `src/components/ui/Input/` was treated as complete after TypeScript compilation + SCSS compilation + linter checks, without running the Cross-App Parity Checklist or updating the playground page. The playground imports the real component via `@ds/Input` so the component itself auto-updated, but the demos, code examples, and props table remained stale, making the new features invisible.

**Resolution:** Updated `playground/src/app/components/input/page.tsx` with comprehensive demos covering all new axes: emphasis variants, size scale, all 5 status states, addon slots (leading/trailing icons, prefix/suffix, clearable), and description. Updated the PropsTable to document all new props. Ran flush-and-restart protocol per EAP-042.

**Principle extracted -> `engineering-anti-patterns.md` EAP-007, EAP-042: Playground is the documentation surface. A component change is not done until the playground reflects it.**

**Cross-category note:** None — this is purely an engineering process issue.

---

## Session: 2026-04-02 — Payload schema push failure for new collection

#### ENG-099: "Admin returns 500 — `column payload_locked_documents__rels.companies_id does not exist`"

**Issue:** After adding the `companies` collection to `payload.config.ts`, the admin panel returned 500. Payload generated SQL referencing `companies_id` in `payload_locked_documents_rels`, but that column didn't exist in the database.

**Root Cause:** Payload 3.80 with `@payloadcms/db-postgres` does not auto-push schema changes to the database on dev server startup, even with `push: true` in the adapter config. The "Pulling schema from database..." step only introspects — it doesn't push. The Payload CLI (`npx payload migrate:create`) also fails on this project due to Node.js 25 ESM compatibility issues (`ERR_REQUIRE_ASYNC_MODULE`). There is no working path from "add collection to config" to "database has the tables" without manual intervention.

**Resolution:** Created `src/scripts/push-schema.ts` — a standalone script that connects directly to Postgres via `pg` and runs DDL statements to create the `companies` table, `companies_case_study_notes` array table, indexes, and the `companies_id` column on `payload_locked_documents_rels`. Run via `npx tsx src/scripts/push-schema.ts`. Since dev and production share the same Supabase database, this one-time push serves both environments.

**Principle extracted → EAP-062: When adding a new Payload collection, the database schema must be manually updated. Payload 3's `push` option and CLI migrations do not work reliably on this project. Use `src/scripts/push-schema.ts` as a template — create the collection table, any array subtables, indexes, and add the `{collection}_id` column to `payload_locked_documents_rels`. Restart the dev server after pushing.**

---

## Session: 2026-04-02 — Company management dashboard

#### ENG-098: "Migrated password gate data from static JSON to Payload CMS collection + built management dashboard"

**Issue:** Company passwords, themes, and case study notes were stored in a static `src/config/companies.json` file. No UI to manage them — required code changes to add/edit companies. No analytics on login usage.

**Root Cause:** Initial implementation used static JSON for simplicity during the password gate build. The user now needs dynamic management of company access.

**Resolution:** Created `companies` Payload collection with all fields (slug, name, password, active, theme group, caseStudyNotes array, analytics group). Registered in payload.config.ts under "Access Control" admin group. Built a custom Payload admin view (`CompanyDashboard.tsx`) at `/admin/companies-dashboard` with full CRUD, activate/deactivate toggle, password auto-generation, copy URL+password, and analytics display. Migrated all consuming code (`actions.ts`, login `page.tsx`, work `page.tsx`) from JSON imports to Payload DB queries via new `src/lib/company-data.ts` helper. Added `incrementLoginAnalytics()` to track logins. Created seed script (`seed-companies.ts`) for one-time migration. Proxy remains cookie-only validation (no DB dependency). Updated password-gate skill, architecture docs, AGENTS.md guardrail, and file-scoped rule.

---

## Session: 2026-04-01 — Playground NavItem demo links scroll to top

#### ENG-088: "Clicking every NavItem on the component page jumps to the top — it's only a visual demo"

**Issue:** On `/components/nav-item`, every demo `NavItem` was wired with `href="#"`. The browser treats `#` as same-document navigation to an empty fragment, which scrolls the viewport to the top. The user expected static previews with hover/focus styling only, not navigation.

**Root Cause:** Placeholder `href="#"` on all live preview instances in `playground/src/app/components/nav-item/page.tsx`. `NavItem` correctly renders a real `<a>` when `href` is a string, so the default link behavior ran.

**Resolution:** Removed `href="#"` from all demo `NavItem` instances so the component renders as `<button type="button">` (supported API: omit `href` for button mode). Visual states unchanged; clicks no longer change scroll position. Code examples in `ComponentPreview` strings still show real `href` values where link semantics are documented. Verified via fresh `next build` RSC segment: preview nodes use `"$","button"` with `type":"button"`. **Cross-category note:** None (engineering / demo wiring only).

**Principle extracted → EAP-057: Do not use `href="#"` for non-navigating UI demos; use button mode or `preventDefault` with an explicit reason.**

---

## Session: 2026-04-01 — Playground sidebar icon hydration mismatch (Turbopack barrel imports)

#### ENG-087: "Hydration failed — sidebar icon SVG differs between server and client (lucide-react barrel import)"

**Issue:** Console hydration error on every playground page: "Hydration failed because the server rendered HTML didn't match the client." The diff showed the server rendering `lucide-compass` SVG where the client expected `lucide-bell` SVG at the same sidebar nav position. The React component tree correctly showed `<Compass>` at position 4 (nav-layout category), but the server-rendered SVG content was the Bell icon.

**Root Cause:** Turbopack's `optimizePackageImports` (which includes `lucide-react` in its built-in default list) rewrites barrel imports to individual module paths during compilation. However, the server-side and client-side compilation passes resolved **different concrete modules for the same named export**. Specifically:
- Server: `Compass` → resolved to Bell's SVG, `Table2` → Compass's SVG, `Bell` → Table2's SVG (3 icons swapped)
- Client: All icons resolved correctly

This was confirmed by curling the server HTML and comparing icon classes: indices 0-3 and 7-8 were correct, but indices 4-6 (Compass, Table2, Bell) were cyclically rotated. The source code and `componentCategories` array were identical on both sides — the divergence was entirely in Turbopack's module resolution.

**Resolution:**
1. Converted all 56 `lucide-react` barrel imports in `playground/src/components/sidebar.tsx` to individual default imports.
2. Converted all 12 remaining playground files with barrel imports to the same pattern (44 icons total).
3. Added `playground/src/types/lucide-icons.d.ts` TypeScript declaration shim.
4. Added Hard Guardrail #15 in `AGENTS.md`.
5. Added EAP-056: Barrel Imports from Large Packages in Turbopack SSR Components.

**Pattern analysis (10th hydration incident):** All 10 hydration mismatches fall into 3 root cause families:
- **Turbopack server/client bundle divergence** (4: ENG-045, ENG-067, ENG-081, ENG-087) — the build tool produces different output for server and client.
- **typeof window / client-only value branching** (5: ENG-017/018/019, ENG-020, ENG-055, ENG-086) — a value that differs between SSR and client is used in render output.
- **Invalid HTML nesting** (1: ENG-024) — structural violation detected during hydration.

**Principle extracted -> `engineering.md` Appendix: Hydration mismatch frequency updated from 9 to 10. New sub-family: Turbopack barrel import resolution divergence. Promoted to Hard Guardrail #15. See EAP-056.**

---

## Session: 2026-04-01 — Playground sidebar hydration mismatch (className)

#### ENG-086: "Hydration mismatch — sidebar nav className differs between server and client"

**Issue:** Console error on every playground page: "A tree hydrated but some attributes of the server rendered HTML didn't match the client properties." All sidebar nav items (`<a>`, `<button>`) show className attribute mismatches between server-rendered HTML and client properties.

**Root Cause:** `playground/src/components/theme-provider.tsx` `useState` initializer branches on `typeof window === "undefined"` — a direct violation of EAP-014 (guardrail 12b). Server initializes `theme = "light"` (window undefined); client initializes to `localStorage.getItem("theme")` (e.g. `"dark"`). React 19 detects the state divergence during hydration and flags attribute mismatches across the entire descendant tree, including sidebar nav elements that don't themselves consume the theme context.

**Resolution:** Replaced the branching `useState` initializer with a constant `"light"` and added a `useEffect` to sync the stored theme from localStorage after mount. The initial render now matches on both server and client. Cleared `.next` cache and restarted; verified zero hydration errors on fresh page loads.

**Principle extracted -> `engineering.md` §Hydration mismatch frequency: 9th occurrence. EAP-014 continues to surface — `typeof window` in useState initializers is a recurring trap in custom providers that bypass `next-themes`.**

---

## Session: 2026-04-01 — Playground HMR Verification Failure (Recurring)

#### ENG-085: "I don't see the changes... you keep telling me stale cache... this is frustrating"

**Issue:** After editing `playground/src/app/components/button/page.tsx` (changing `space-y-2` to `space-y-3`), the user could not see the change in the browser. This is a recurring pattern across multiple sessions: (1) agent edits a playground file, (2) agent reports the change as done, (3) user sees stale content, (4) agent diagnoses stale cache, kills the server, clears `.next`, restarts, (5) user can finally see the change. The user has been through this cycle multiple times and is rightfully frustrated.

**Root Cause (compound):**
1. **Turbopack HMR unreliability for playground pages:** The playground server (Next.js 16 Turbopack) does not always push file changes to the browser via Hot Module Replacement. The terminal log showed no HMR compilation entry for the edited file, even though the server-side render (verified via curl) DID include the updated class. The browser retained a stale client bundle.
2. **Dead WebSocket connections:** `lsof` showed 5 `CLOSE_WAIT` connections from Chrome to port 4001 — stale HMR WebSocket connections from previous server restarts that were never cleanly closed. These dead connections may prevent the browser's HMR client from receiving update notifications.
3. **Multiple zombie playground processes:** Terminal history showed 7+ playground server starts/restarts in a single session. Each restart creates new server-side state but the browser may hold connections to old servers.
4. **Agent process failure — no post-edit verification:** The agent edited the file, confirmed the edit in the source, and reported it as done — without verifying the change was visible in the browser. This is the critical process gap. The technical issue (HMR unreliability) is a known environmental constraint; the agent's failure to work around it by verifying delivery is the process bug.

**Resolution:**
1. Killed stale playground processes, cleared `.next` cache, restarted server.
2. Verified `space-y-3` is in the fresh server response via curl.
3. Documented as EAP-042 (Reporting Playground Changes Without Verifying Browser Delivery).
4. Added mandatory post-edit verification protocol to engineering principles.

**Recurring pattern analysis:** This is the 4th+ occurrence of "playground change not visible → kill → restart → works." Related incidents: Turbopack cache corruption (ENG-047, ENG-056, ENG-067), HMR-only updates causing SSR divergence (ENG-045). The technical root cause varies (stale cache, HMR failure, dead WebSockets) but the process failure is always the same: **the agent reports the task as complete without verifying the browser received the change.** The technical issue is environmental and may not be fixable; the process issue is entirely within the agent's control.

**Principle extracted → EAP-042: After editing any playground file, the agent MUST verify the change reached the browser before reporting it as done. curl alone is insufficient — it only checks server-side rendering. Use a browser agent to verify, or instruct the user to hard-refresh (Cmd+Shift+R). If the change is not visible after hard refresh, clear `.next` and restart.**

---

## Session: 2026-04-01 — Playground Token Architecture Fix

#### ENG-084: "Playground components blank after SCSS→CSS custom property migration"

**Issue:** After Phase 3 of the One GS Parity Roadmap migrated ~40 component SCSS modules from `$portfolio-*` SCSS variables to `var(--portfolio-*)` CSS custom properties, the playground app (port 4001) rendered components with blank/missing colors. Buttons, badges, inputs — all semantic colors disappeared. Dark mode toggle also had no visible effect on component colors.

**Root Cause:** The main app's `globals.scss` imports `_custom-properties.scss`, which generates all `--portfolio-*` CSS custom properties on `:root` and `[data-theme="dark"]`. The playground's `globals.css` maintained a **separate, manually-duplicated** set of CSS variables using a different namespace (`--ds-*`, `--palette-*`, `--overlay-*`, `--btn-*`). After the migration, components consumed `var(--portfolio-*)` but the playground's CSS only defined `--ds-*` prefixed variables — the `--portfolio-*` namespace resolved to empty, making all semantic colors vanish. Additionally, the playground uses `.dark` class (via `next-themes`) not `[data-theme="dark"]`, so even if the variables had been present, dark mode wouldn't have worked.

**Resolution:**
1. Added `.dark` selector alongside `[data-theme="dark"]` in `src/styles/_custom-properties.scss` — backwards-compatible for both apps.
2. Created `playground/src/app/ds-tokens.scss` (`@use 'custom-properties'`) — leverages the existing `sassOptions.loadPaths` pointing to `src/styles/`.
3. Imported `ds-tokens.scss` before `globals.css` in `playground/src/app/layout.tsx`.
4. Removed all manually-duplicated `--ds-*`, `--palette-*`, `--overlay-*`, `--duration-*`, `--easing-*`, `--btn-*` variables from `playground/src/app/globals.css` (both `:root` and `.dark` blocks). Kept Tailwind shell-specific `--color-*` variables (Phase 2 scope).
5. Verified all component pages compile without SCSS errors (Button, Badge, Input, Dialog — all HTTP 200).

**Principle extracted -> `engineering.md` §3: When the design system token source changes namespace or output format, ALL consuming apps must be updated in the same change. A manually-duplicated variable layer in a consumer app is a maintenance hazard — it drifts silently until a source-side migration breaks it. Consumer apps should import from the single source, not maintain parallel definitions. See ENG-084.**

---

## Session: 2026-04-01 — Design System Runtime Theming API

#### ENG-083: "Token Architecture — One GS Parity Roadmap (4-phase migration)"

**Issue:** Design system lacked dark mode support, missing foundation tokens (borders, opacity, paragraph spacing, decomposed elevation, action states), and had no CSS custom property intermediary layer. Components consumed `$portfolio-*` SCSS variables directly — compile-time values that can't respond to theme changes.

**Root Cause:** The token architecture was designed in a single-mode (light) context. SCSS variables are compile-time by nature — they produce hardcoded hex values in the CSS output. No intermediary CSS custom property layer existed to enable runtime theme switching. Additionally, many components used raw primitive colors directly (e.g., `$portfolio-neutral-20`) rather than semantic tokens, and hardcoded px values instead of token references.

**Resolution:**
1. **Phase 1 — Foundation tokens:** Added `_borders.scss` (border widths), `_opacity.scss`, decomposed elevation tokens, paragraph spacing, missing semantic colors (always-*, icon-disabled, action states). Forwarded in `_index.scss`.
2. **Phase 2 — CSS custom property layer:** Created `_custom-properties.scss` generating `:root` (light) and `[data-theme="dark"]` blocks from SCSS tokens. Wired into `globals.scss`. Added `data-theme="light"` to `<html>`.
3. **Phase 3 — Component migration (5 batches):** Migrated ~40 SCSS module files from `$portfolio-*` SCSS variables to `var(--portfolio-*)` CSS custom properties. Preserved SCSS primitives inside `rgba()`/`darken()` calls (compile-time requirement). Preserved always-dark component sections (AdminBar, format bar, edit bar). Cleaned up `--ds-*` fallback patterns in Table.
4. **Phase 4 — Component-level tokens:** Introduced 43 local `$_` prefix component tokens across 25 components for control heights, icon sizes, max-widths, and structural dimensions. Mapped to spacer tokens where values align with 8px grid.

**Architecture established:**
- SCSS token files remain the **source of truth** (compile-time)
- `_custom-properties.scss` is the **output layer** (runtime, theme-aware)
- Semantic tokens (text, surface, border, action, icon, overlay) swap between modes
- Primitives (typography, spacing, motion, z-index) are mode-invariant but available as CSS custom properties for consistency
- `rgba()` calls on primitives stay as SCSS (compile-time function requirement)
- Component-level `$_` prefix vars give names to hardcoded px values

**Remaining SCSS primitive references (202 total, all documented exceptions):**
- Button: 56 — interaction state color tints (hover/active/pressed per variant)
- inline-edit: 55 — always-dark format bar/edit bar, local aliases, rgba/darken
- elan-visuals: 41 — rgba() calls, status colors, always-dark sections
- AdminBar: 9 — always-dark surface tints, utility spacing
- Badge: 8 — status variant color primitives
- Other: 33 — scattered rgba() exceptions, utility tokens, TypeScript token map

**Principle extracted -> `engineering.md` Frequency Map: SCSS token theme adaptability count updated from 1 to 2.**

---

#### ENG-082: "DS components don't adapt to dark mode — SCSS tokens compile to hardcoded hex values"

**Issue:** Design system SCSS component modules (Card, Input, Table) use Sass variables (`$portfolio-surface-primary`, etc.) that compile to static CSS hex values. When rendered in the playground's `.dark` mode, these components retain light-mode backgrounds, borders, and text colors — creating unreadable contrast mismatches.

**Root Cause:** The SCSS token system (`src/styles/tokens/_colors.scss`) uses Sass `$variables` — compile-time constants that resolve during the build. They cannot respond to runtime class-based theme switching (`.dark`). The main site has no dark mode, so this was never an issue there, but the playground's dark mode exposes the gap.

**Resolution:** Introduced `--ds-*` CSS custom properties as the design system's runtime theming API:
- Added 15 `--ds-*` properties to `playground/src/app/globals.css` (`:root` + `.dark`)
- Updated Card, Input, Table SCSS modules to `var(--ds-*, #{$scss-fallback})`
- Fallback pattern ensures zero regression on the main site (where `--ds-*` are undefined)

**Migration path for remaining components:** Any SCSS module using color/surface/border tokens should follow the same `var(--ds-*, #{$scss-value})` pattern. The `--ds-*` properties are the contract; hosts define them to control theme.

**Cross-category note:** Also documented as FB-070 (design).

---

## Session: 2026-04-01 — Playground sidebar hydration mismatch

#### ENG-081: "Hydration mismatch — SCSS module class names differ between server and client"

**Issue:** The playground sidebar section labels ("Foundations", "Components") caused a hydration mismatch. Server HTML had Tailwind utility classes (`text-xs font-medium tracking-wider uppercase text-sidebar-muted-foreground/...`) while the client rendered CSS module hashes (`sidebar-module-scss-module__sbl2ta__sectionLabel`).

**Root Cause:** A `.module.scss` file was imported in the sidebar component using `@use 'mixins/typography' as *`, which relies on `sassOptions.loadPaths` in `next.config.ts` to resolve the SCSS `@use` path. Turbopack (Next.js 16.2.1 dev) compiled the SCSS module differently on server vs client — the server-side compilation produced expanded utility-like class names while the client produced standard CSS module hashes. Clearing `.next/` did not resolve the issue, confirming this is a Turbopack SCSS module compilation inconsistency, not a stale cache.

**Resolution:** Converted `sidebar.module.scss` → `sidebar.module.css` using CSS custom properties (`var(--type-2xs)`, `var(--color-sidebar-muted-foreground)`) already defined in `globals.css` instead of SCSS `@use`/`@include` mixins. Updated the import in `sidebar.tsx`. Restarted the dev server with a clean `.next/` — hydration mismatch resolved.

**Systemic insight:** SCSS modules with `@use` imports that depend on `sassOptions.loadPaths` are unreliable under Turbopack for server-rendered client components. Plain CSS modules using CSS custom properties are safe. New anti-pattern: EAP-038.

---

## Session: 2026-04-01 — Vercel deployment failure after checkpoint

#### ENG-080: "Vercel deployment failed — Module not found for all @ds/* component imports"

**Issue:** After the Élan 2.0.0 checkpoint merge to main, the Vercel deployment failed with `Command "npm run build" exited with 1`. Build logs showed `Module not found: Can't resolve 'next-themes'`, `framer-motion`, and multiple Radix UI packages — all from files in `src/components/ui/` imported via the `@ds/*` alias.

**Root Cause:** The Vercel project `yilangao-design-system` has `rootDirectory: playground`. Vercel runs `npm install` only in `playground/`, creating `playground/node_modules/`. The `@ds/*` path alias resolves to `../src/components/ui/*` — files outside the playground directory. Next.js 16 uses Turbopack for production builds, and Turbopack resolves `node_modules` relative to each file's location. Files in `../src/` walk up to the repo root looking for `node_modules/`, which doesn't exist on Vercel (only `playground/node_modules/` does). Locally the build worked because the root `node_modules/` existed from the main site's `npm install`.

**Resolution:**
1. Updated Vercel install command via API: `npm install && cd .. && npm install --omit=dev` — ensures `node_modules/` exists at both playground and repo root levels
2. Added 7 missing Radix/cmdk dependencies to `playground/package.json` (`@radix-ui/react-toast`, `@radix-ui/react-checkbox`, `@radix-ui/react-switch`, `@radix-ui/react-tooltip`, `@radix-ui/react-dropdown-menu`, `@radix-ui/react-select`, `cmdk`)
3. Added webpack `resolve.modules` config to `playground/next.config.ts` (belt-and-suspenders for any webpack fallback)
4. Fixed TypeScript error in `src/components/ui/Slider/Slider.tsx` (min/max needed numeric coercion)
5. Redeployed — status: Ready

**Systemic fix:** Added mandatory Build Gate to checkpoint skill (step 3 in `.cursor/skills/checkpoint/SKILL.md`). All apps must build locally before merging to main. Added post-deploy verification polling (step 5). Created `docs/engineering/deployment.md` (§13) documenting Vercel CLI commands, build log retrieval, and common failure patterns.

**Cross-category note:** Also documented as ENG-079 (checkpoint process). Frequency map updated: Version control / release automation now at 4.

---

## Session: 2026-04-01 — Version mismatch and checkpoint release

#### ENG-078: "Playground footer shows 1.1.0 but suggests major — should be 2.0.0"

**Issue:** The playground footer displayed version `1.1.0` alongside a "suggests major" badge. Under semver, a major bump from release `1.0.0` should yield `2.0.0`, not `1.1.0`. The user correctly identified the inconsistency.

**Root Cause:** A previous session ran `version:minor` (bumping `1.0.0 → 1.1.0`), but subsequent work introduced breaking changes (4 component deletions in `playground/src/components/ui/`). The `version-analyze.mjs` script and the `/api/dev-info` route correctly detected the deletions as a `major`-level change, and the `isVersionSufficient` function correctly reported that `1.1.0` did not satisfy a major bump (`majorDiff = 0`). The system was advisory-only — it flagged the mismatch but did not auto-correct, and no one ran `version:auto --apply` or `version:major` to reconcile.

**Resolution:** Ran `npm run version:major` to bump `1.1.0 → 2.0.0`. Verified with `version-analyze.mjs --quiet` that `alreadySufficient: true`. The analysis and display logic were correct — the version simply hadn't been bumped to match.

**Lesson:** When the version-analyze system flags a mismatch, it should be resolved before committing further work. Consider making `version:auto --apply` part of the pre-commit or pre-checkpoint workflow rather than a manual opt-in step.

#### ENG-079: Checkpoint release Élan 2.0.0, ASCII Art Studio 0.1.0

**Issue:** 130 uncommitted files spanning agent docs, new components, playground infrastructure, and build config needed to be committed and deployed.

**Resolution:** Organized 130 files into 8 logical commits following atomic commit principles (docs → deps → new components → component refinements → frontend pages → playground infra → playground pages → version bump). Then executed the full checkpoint procedure per `.cursor/skills/checkpoint/SKILL.md`: stamped releases for both Élan (2.0.0) and ASCII Art Studio (0.1.0), updated CHANGELOG.md, merged `dev → main` (fast-forward), pushed main to trigger Vercel auto-deploy, switched back to dev, bumped to next dev patches (Élan 2.0.1, ASCII Art Studio 0.1.1), pushed dev.

**Cross-category note:** Version control / release automation — second entry. Frequency map updated below.

---

## Session: 2026-04-01 — Local dev not loading; playground HTTP 500

#### ENG-077: "Playground UI, website UI, and Payload UI not loading on localhost"

**Issue:** No processes were listening on ports 4000 or 4001 — `curl` to both failed. After starting `npm run dev` and `npm run playground`, the main site and `/admin` returned HTTP 200, but the playground root returned 500. Turbopack/Sass reported undefined variables: `$portfolio-text-tertiary` and `$portfolio-overlay-black-40` in multiple `src/components/ui/**/*.module.scss` files (imported via the playground sidebar’s barrel import).

**Root Cause:** (1) Dev servers had not been started in this environment (stale entries in `docs/port-registry.md` implied they were running). (2) Component SCSS referenced semantic token names that were never added to `src/styles/tokens/_colors.scss` — the names were plausible (parallel to `$portfolio-text-secondary`, denser overlay step) but missing from the canonical palette.

**Resolution:** Started `npm run dev` (port 4000) and `npm run playground` (port 4001). Added `$portfolio-text-tertiary` (legacy alias → `$portfolio-text-neutral-subtle`) and `$portfolio-overlay-black-40: rgba(0, 0, 0, 0.40)` to `_colors.scss`, ran `npm run sync-tokens`, restarted the playground dev server so Turbopack picked up the token file. Verified HTTP 200 on `http://127.0.0.1:4000/`, `http://127.0.0.1:4000/admin`, and `http://127.0.0.1:4001/`.

**Cross-category note:** Design tokens / naming consistency — any new semantic SCSS name must exist in `tokens/_colors.scss` before use in components.

---

## Session: 2026-03-30 — Playground Cross-App Import Architecture

#### ENG-073: "Playground should derive component demos from production source, not re-implement them"

**Issue:** All 19 component demo pages in the playground contained `Demo*` functions that re-implemented production components in Tailwind — parallel implementations of the same component with the same prop API but different styling systems (SCSS Modules vs Tailwind). When a component changed in `src/components/ui/`, the playground's `Demo*` version had to be manually updated, creating systematic drift.

**Root Cause:** The playground and main site use different CSS pipelines (Tailwind vs SCSS Modules). The original architecture assumed they couldn't share components, so every demo re-implemented the component from scratch in Tailwind. This was never necessary — SCSS Module class names are scoped/hashed and can coexist with Tailwind utilities in the same page.

**Resolution:**
1. Added `@ds/*` TypeScript path alias in `playground/tsconfig.json` mapping to `../src/components/ui/*`
2. Set `turbopack.root` to monorepo root in `playground/next.config.ts` so Turbopack processes files from `src/`
3. Added `sassOptions.loadPaths` pointing to `src/styles/` for SCSS `@use` resolution
4. Migrated all 19 demo pages: removed `Demo*` re-implementations, replaced with direct `import { Component } from "@ds/Component"`
5. Removed `playground/src/components/ui/` (local component copies no longer needed)
6. Updated `docs/engineering.md` §3.3–3.4 with the new architecture

**Principle extracted → `engineering.md` §3.4: Cross-App Component Imports (`@ds/*`)**

**Lines removed:** ~2,400+ lines of Tailwind re-implementation across 19 files. Demo pages are now thin harnesses (import + layout + state + props table).

---

## Session: 2026-03-30 — DAG Canvas Scroll Hijack

#### ENG-072: "The canvas in the harness architecture should not be scrolling when the parent scrolls"

**Issue:** The Architecture DAG (pannable canvas in `EscalationTimeline.tsx`) had an `onWheel` handler that captured all wheel events. Regular scroll (no modifier keys) panned the canvas instead of scrolling the page. When a user scrolled through the case study and their mouse happened to be over the DAG viewport, the page stopped scrolling and the canvas panned instead. This is a scroll hijack — a fundamental UX violation for embedded canvases.

**Root Cause:** The `handleWheel` callback had two branches: Ctrl/Meta+wheel for zoom (correct), and bare wheel for pan (incorrect). The bare-wheel pan branch consumed the event without `preventDefault()`, so it technically didn't block the browser's native scroll, but it still updated canvas pan state in response to scroll, creating a confusing dual-scroll effect where both the page and the canvas moved simultaneously. The `touch-action: none` CSS also blocked native scroll passthrough on touch devices.

**Resolution:**
1. Removed the `onWheel` handler entirely. Pan is now drag-only (pointer down + move). Zoom is buttons and keyboard only (+/- keys, zoom buttons in corner).
2. Changed `touch-action: none` to `touch-action: pan-y` on `.dagViewport` so vertical scroll passes through on touch devices.
3. Scroll events now pass through to the page regardless of cursor position.

**Cross-category note:** Also documented as FB-067 (design) — part of the same session on Token Architecture and canvas interaction.

---

## Session: 2026-03-30 — Checkbox indeterminate icon

#### ENG-071: "Production Checkbox indeterminate should show dash; align with Radix state"

**Issue:** The shared `Checkbox` had a `MinusIcon` branch and root SCSS for `data-state='indeterminate'`, but the indicator chose check vs dash using the React `checked` prop. For uncontrolled usage (`checked` undefined) with `defaultChecked="indeterminate"`, Radix sets internal state and `data-state` on the trigger/indicator while the prop stays undefined — the UI incorrectly rendered the checkmark.

**Root Cause:** Icon selection was driven by props instead of the same source Radix uses for visibility (`CheckboxIndicator` receives `data-state` from context via `getState(context.checked)`).

**Resolution:** Render both glyphs inside `CheckboxPrimitive.Indicator` and show/hide with `.indicator[data-state='checked']` / `.indicator[data-state='indeterminate']` in SCSS. Re-export Radix `CheckedState` as `CheckboxCheckedState`; type `defaultChecked` and callbacks with it. Export `CheckboxCheckedState` from `src/components/ui/index.ts` and `Checkbox/index.ts`.

---

## Session: 2026-03-30 — Breakpoint System Unification

#### ENG-070: "Audit breakpoints — cross-app inconsistency between SCSS tokens and Tailwind defaults"

**Issue:** The three apps in this monorepo use three different breakpoint systems. Main site SCSS uses Carbon values (320/672/1056/1312/1584). Playground and ASCII Tool use Tailwind v4 defaults (640/768/1024/1280/1536) because `globals.css` never overrides `--breakpoint-*`. Additionally, hardcoded values appear in AdminBar (640px), experiments page (768px), and typography comments (768/1200). Every Tailwind responsive utility (`sm:`, `md:`, `lg:`) in the Playground resolves to different pixel values than the same-named SCSS tokens in the main site.

**Root Cause:** When the Playground and ASCII Tool were created, their `globals.css` files were set up with `@theme` blocks for colors, fonts, spacing, and radii — but breakpoints were never included. Tailwind v4 ships with built-in `--breakpoint-*` defaults, so omitting them from `@theme` silently activates the framework defaults instead of the design system tokens. No cross-app parity check existed for breakpoints at the time.

**Resolution:** PLANNED — awaiting user confirmation. The plan includes:
1. Define a unified 6-tier breakpoint scale (375/672/1056/1440/1920/2560) in SCSS tokens
2. Override `--breakpoint-*` in Playground and ASCII Tool `globals.css` to match
3. Replace all hardcoded media query values with token references
4. Resolve the container naming collision (`container-sm` = 672 vs `bp-sm` = 320)
5. Add a breakpoints page to the Playground
6. Update Cross-App Parity Checklist in AGENTS.md to include breakpoint sync

**Cross-category note:** Also documented as FB-064 (design) — full comparative analysis of Carbon, OneGS, and Tailwind breakpoint philosophies.

---

## Session: 2026-03-30 — Version Infrastructure

#### ENG-069: "Footer last updated date is stale; version doesn't auto-detect change scope"

**Issue:** Two related problems: (1) The playground footer's "Last updated" date only reflected the static `release.releasedAt` from `elan.json`, which doesn't update during local development — even though active edits are happening, the date stays frozen at the last deploy date. (2) Version bumps (patch/minor/major) are entirely manual — there's no mechanism to analyze the scope of changes and recommend or apply the appropriate bump level.

**Root Cause:** The version system was designed with a manual-first workflow: `version-bump.mjs` bumps the number, `version-release.mjs` stamps the release. But `releasedAt` only updates on release, and there's no "last modified" concept for the dev cycle. The semver level decision was left entirely to human judgment with no tooling support.

**Resolution:**
1. Created `/api/dev-info` route in the playground — returns live timestamps (git log + uncommitted file check) and change analysis during development (403 in production).
2. Created `useDevInfo()` hook that polls the API every 60s, providing live data to both the footer and sidebar header.
3. Updated the footer to show the live `lastModifiedDate` in dev mode (falls back to static `releasedAt` in production), plus a change analysis badge showing file count and suggested bump level.
4. Updated the sidebar header to show the live version via the same hook.
5. Created `scripts/version-analyze.mjs` — standalone script that diffs against the last release commit, categorizes changes (new/deleted/modified components and tokens), and recommends patch/minor/major. Supports `--apply` for auto-bump and `--quiet` for JSON output.
6. Added `npm run version:analyze` and `npm run version:auto` scripts.

**Principle extracted -> `engineering.md` §10.5–10.8: Automated version analysis, live dev info API, and runtime exposure. Version level should be data-driven, not guesswork. The playground footer is the canary — if the analysis shows stale versioning, it's immediately visible.**

---

## Session: 2026-03-30 — HeroUploadZone Hydration Fix

#### ENG-068: "This modal's height has the same exact issue — adjust viewport"

**Issue:** ProjectEditModal rendered with collapsed height — all content squeezed into a tiny area. The modal had `max-height: 90vh` but no `min-height` or `min-width`, violating the established modal sizing pattern.

**Root Cause:** Repeat of AP-027 (Flex Containers Without Minimum Dimension Constraints). The existing `EditableArray` panel uses `min-height: min(420px, 65vh)` and `min-width: 320px`, but this pattern was not carried over when creating the new `ProjectEditModal`. This is the third occurrence of this anti-pattern (FB-043, FB-045, now ENG-068) — documenting patterns is insufficient without enforcement during new component creation.

**Resolution:** Added `min-height: min(520px, 70vh)`, `min-width: 320px`, and aligned `max-height` to `88vh` (matching the array panel). Increased body padding from `16px 18px` to `18px 20px` and gap from `16px` to `20px` for breathing room.

**Cross-category note:** Also documented as FB-062 (design). Third violation of AP-027.

**Principle extracted -> Every new modal/panel component MUST copy dimension constraints from the established modal template (`min-height`, `min-width`, `max-height`). AP-027 has been violated 3 times — consider extracting a shared SCSS mixin for modal containers.**

---

#### ENG-067: "Hydration failed — HeroUploadZone server/client mismatch"

**Issue:** React hydration error on the home page: "Hydration failed because the server rendered HTML didn't match the client." The diff showed `HeroUploadZone`'s inner `<div>` present on the client but absent from the server-rendered DOM.

**Root Cause:** `HeroUploadZone` was already removed from the source code in ENG-066 (replaced by `ProjectEditModal`), but Turbopack's incremental build cache in `.next/dev/static/chunks/` still contained the old compiled chunk with the component. The browser loaded this stale chunk, which rendered `HeroUploadZone` client-side while the server (using current source) no longer produced its HTML. This server/client divergence caused the hydration mismatch. The original `HeroUploadZone` also had an architectural issue documented in ENG-066: interactive content (`<input type="file">`, `onClick`/`onDrop` handlers) nested inside a `<Link>` (`<a>`) — invalid HTML that compounds hydration problems.

**Resolution:** Cleared the `.next` build cache (`rm -rf .next`) and restarted the dev server. The fresh compilation no longer includes `HeroUploadZone` in any chunk, resolving the mismatch. Documented as EAP-035 (stale Turbopack cache after component removal).

**Principle extracted -> `engineering.md`: After removing a component from source, always clear `.next` and restart. Turbopack's incremental cache does not reliably invalidate removed files. If a hydration error references a component that doesn't exist in `src/`, the issue is stale cache — not source code.**

---

#### ENG-066: "Hover upload blocks navigation; edit button should open modal"

**Issue:** The HeroUploadZone hover overlay on project tiles (1) didn't respond to clicks (file input never triggered), (2) blocked the underlying `<Link>` so users couldn't navigate to the detail page, and (3) the Edit button navigated to the Payload dashboard in a new tab instead of allowing inline editing.

**Root Cause:** The HeroUploadZone was rendered as a full-overlay `<div>` inside a `<Link>`, with `e.stopPropagation()` on click. But the hidden `<input type="file">` inside a portal-less overlay had inconsistent browser focus behavior — `fileRef.current?.click()` silently failed in some contexts. The overlay also captured all pointer events on hover, preventing the `<Link>` from responding to clicks. The Edit button was a separate `EditButton` component that always opened the admin dashboard in a new tab via `window.open`.

**Resolution:** Removed HeroUploadZone entirely. Replaced the EditButton in ProjectCard with a custom inline edit button that opens a new `ProjectEditModal` — a portal-based modal with: (1) cover image preview + upload new + browse existing media grid, (2) title and category text fields, (3) "Open in Dashboard" link + "Save & Close" button. The modal uses a single PATCH request to update all changed fields. Media browser lazy-fetches from `GET /api/media` on first toggle. `heroImageId` was added to the server->client data flow so the modal knows the current image's Payload ID.

**Cross-category note:** Also documented as FB-061 (design) — modal UX pattern for inline project editing.

**Principle extracted -> When admin editing tools are overlaid on navigable elements (links, cards), they must NOT capture pointer events on the navigable surface. Admin actions should be contained in discrete, non-overlapping UI elements (buttons in a corner badge) that open portaled modals, never full-surface overlays.**

---

#### ENG-065: "The footer yilangao@gmail.com doesn't really allow people to click on that"

**Issue:** The footer email address rendered as an `<a>` tag but had no `href` attribute, making it non-clickable. Visitors could not click to open their email client.

**Root Cause:** `EditableText` rendered the element with `as="a"` but did not support forwarding arbitrary HTML attributes like `href`. The component's interface only accepted its own known props, silently dropping anything else.

**Resolution:** (1) Added index signature `[htmlAttr: string]: unknown` to `EditableTextProps` interface. (2) Destructured `...htmlAttrs` rest props in the component. (3) Spread `htmlAttrs` into `createElement` calls in both admin and non-admin render paths. (4) Added `href={`mailto:${siteConfig.email}`}` to the footer email `EditableText` in `HomeClient.tsx`.

**Principle extracted -> When wrapping native HTML elements via polymorphic `as` prop, always forward unknown attributes to the underlying element. A component that accepts `as="a"` but silently drops `href` is a broken abstraction.**

---

## Session: 2026-03-30 — Spacing Token Tier Separation Audit

#### ENG-064: Spacing token audit — primitive/utility tier separation and layout mixin consistency

**Issue:** Audit revealed 5 structural inconsistencies in the spacing token system that reduced agent parseability: (1) oddball fractional multipliers in Tier 1, (2) layout mixins using Tier 1 instead of Tier 2 tokens, (3) incomplete utility documentation, (4) utility tokens back-referencing nonexistent primitives, (5) dead `sass:map` import.

**Root Cause:** Initial migration (ENG-060) correctly established the three-tier architecture but populated Tier 1 with values that only Tier 3 consumers needed. This was carried over from creating matching primitives for every utility value, violating the One GS reference where utility tokens own their component-specific values independently.

**Resolution:**
- Removed 4 oddball primitive tokens (`spacer-0-75x`, `spacer-0-875x`, `spacer-1-25x`, `spacer-1-625x`) from `_spacing.scss` Tier 1 and the `$portfolio-spacer-scale` map. Primitive scale now has 25 clean tokens (was 29).
- Utility tokens own px values directly (e.g., `$portfolio-spacer-utility-0-75x: 6px;` instead of referencing `$portfolio-spacer-0-75x`).
- Layout mixins (`container`, `container-narrow`, `stack`) migrated from Tier 1 primitives to Tier 2 semantic tokens (`spacer-layout-compact`, `spacer-layout-spacious`, `spacer-layout-x-spacious`).
- `design.md` Tier 1 table cleaned (removed 0.75x), Tier 3 table expanded to all 10 tokens.
- `tokens.ts` primitive scale updated to match (removed 4 oddball entries).
- Removed unused `@use 'sass:map'`.

**Verified:** SCSS barrel compiles clean, Button.module.scss compiles clean, playground TypeScript compiles clean. No references to removed primitives anywhere in codebase.

**Principle extracted → `engineering.md` Appendix frequency map: token-tier-separation — 1 occurrence.**

**Cross-category note:** Also documented as FB-060 (design).

---

## Session: 2026-03-30 — Media Upload Integration (Inline Edit + Masonry Tiles)

#### ENG-062: "Masonry tiles have no image upload — cover images are hardcoded"

**Issue:** Homepage project tile cover images were driven by a hardcoded `COVER_IMAGES` map in `page.tsx` (only one slug mapped). The CMS `heroImage` field on Projects was unused for the homepage. Admin users had no way to upload or change cover images from the homepage.

**Root Cause:** The homepage data fetch did not include `heroImage` (no `depth: 1`), and the mapping used `COVER_IMAGES[p.slug] ?? null` instead of the CMS field.

**Resolution:** (1) Removed the hardcoded `COVER_IMAGES` map. (2) Added `depth: 1` to the projects query to populate the `heroImage` relation. (3) Mapped `coverImage` from `(p.heroImage as { url?: string })?.url ?? null`. (4) Created `HeroUploadZone` component: admin-only hover overlay on project tiles that accepts click-to-browse or drag-and-drop image uploads, calls `uploadMedia` + `updateCollectionField('projects', id, 'heroImage', media.id)`, then `router.refresh()`.

**Cross-category note:** Also documented as FB-059 (design — upload affordance on tiles).

**Principle extracted -> `engineering.md` §11: Homepage cover images now flow from CMS `heroImage` field via depth-1 query. No hardcoded image maps.**

---

#### ENG-063: "Inline edit link modals only accept typed URLs — no file upload"

**Issue:** When editing social links or project external links via the `EditableArray` modal, the URL field was a plain `<input type="url">`. Users couldn't upload a file (like a resume PDF) and have the URL auto-populated — they had to upload separately in the Payload admin, copy the URL, then paste it.

**Root Cause:** `FieldDefinition` only supported `'text' | 'email' | 'checkbox' | 'url'` types. No media upload integration existed in the array edit panel.

**Resolution:** (1) Added `'media-url'` to the `FieldDefinition` type union. (2) Created `MediaUrlField` component in `EditableArray.tsx`: renders a URL input alongside an upload button; clicking the button opens a file picker, uploads via `uploadMedia`, and fills the URL field with the returned public URL. (3) Updated `LINK_FIELDS.href` and `EXT_LINK_FIELDS.href` to use `'media-url'` type.

**Cross-category note:** Also documented as CFB-018 (content — link fields should support file uploads).

**Principle extracted -> `engineering.md` §11: Array fields that accept URLs should use `media-url` type when the URL target could be an uploaded file (resumes, deliverables, assets).**

---

## Session: 2026-03-30 — Supabase Storage S3 Rejects Filenames with Special Characters

#### ENG-060: "Cannot upload [Gao_Yilan] Resume_2026.pdf — Something went wrong"

**Issue:** Uploading a PDF via the Payload admin Media collection fails with "Something went wrong." The file never reaches Supabase Storage.

**Root Cause:** Supabase Storage's S3-compatible API rejects object keys containing square brackets (`[]`). The filename `[Gao_Yilan] Resume_2026.pdf` is used verbatim as the S3 key by the `@payloadcms/storage-s3` plugin (via `@payloadcms/plugin-cloud-storage`'s `getIncomingFiles`, which reads `data.filename`). The S3 `PutObject` call returns `InvalidKey` (HTTP 400). Spaces are also problematic — they get URL-encoded to `%5B`/`%5D`/`%20` in the key, which some S3 implementations reject.

**Resolution:** Added a `beforeChange` hook to the Media collection (`src/collections/Media.ts`) that sanitizes filenames before they reach the S3 upload handler. The sanitizer replaces brackets, spaces, and other non-safe characters with hyphens, collapses consecutive hyphens, and preserves the file extension. Applied to both the main filename and all auto-generated size variant filenames.

**Principle extracted -> `engineering.md` §12.3: Filenames uploaded to Supabase Storage must be sanitized to remove S3-incompatible characters (brackets, spaces, special chars). The sanitization hook is a `beforeChange` on the Media collection — it runs before the cloud storage plugin's `afterChange` hook that performs the actual S3 upload.**

---

#### ENG-061: "Upload screen has no validation — same UX feedback pattern"

**Issue:** The Media upload form uses technical field names without explanations ("Alt", "Caption"), provides no validation feedback when filenames contain invalid characters, and shows only a generic "Something went wrong" toast on S3 rejection. The user flagged this as a recurring pattern of poor CMS admin form UX.

**Root Cause:** Payload collections default to bare field configs — no `admin.description`, no `admin.placeholder`, no custom labels. The collection itself lacked an `admin.description` to orient the user. Combined with ENG-060's S3 key rejection, the user hit two failures simultaneously: (1) incomprehensible error, (2) no guidance on what the fields mean.

**Resolution:** Added human-readable labels, descriptions with plain-language explanations, placeholder examples, and a collection-level description explaining the upload process. This complements ENG-060's filename sanitization by making the system transparent.

**Cross-category note:** Also documented as FB-058 (design — form UX) and CFB-017 (content — field microcopy).

**Principle extracted -> `engineering.md` §12.3 addendum: Every Payload field on an upload collection must include `label`, `admin.description`, and `admin.placeholder`. The collection itself must include `admin.description` explaining the upload process and any automatic transformations (like filename sanitization). This is the CMS admin form UX standard — no bare fields.**

---

## Session: 2026-03-30 — Turbopack Cache Corruption Causes Phantom Route Conflicts

#### ENG-056: "/work/elan-design-system HTTP ERROR 404"

**Issue:** All `/work/*` routes returned 404. Server logs showed "Conflicting routes" and "You cannot have two parallel pages that resolve to the same path" errors for every `(frontend)` page route (`about`, `blog`, `contact`, `experiments`, `reading`, `work`). The errors claimed routes existed at bare paths (`/about`, `/work`) outside the `(frontend)` route group, but no such files existed on disk. Other routes (`/`, `/about`, `/contact`) intermittently worked while `/work/*` consistently 404'd.

**Root Cause:** Corrupted Turbopack filesystem cache in `.next/`. The `.next/` directory contained stale route manifests from a previous dev session (the server had been running for ~8 hours). The Turbopack cache had already self-detected an internal error earlier ("Turbopack's filesystem cache has been deleted because we previously detected an internal error in Turbopack"), but the corruption persisted across the dev session. The phantom route conflicts were artifacts of the corrupted cache — the actual file structure had no duplicate routes.

**Resolution:** Killed the dev server (PID 58495), deleted the entire `.next/` directory (`rm -rf .next`), and restarted with `npm run dev`. Fresh compilation resolved all route conflicts — zero "Duplicate page" or "Conflicting routes" errors in the new server log, and `/work/elan-design-system` returned 200 OK with correct content.

**Principle extracted → frequency map update: Turbopack cache corruption 1 → 2. Same class as ENG-047. Rule reinforced: when route errors or runtime behavior contradicts the file structure on disk, clear `.next/` and restart before investigating code.**

**Cross-category note:** None — purely an infrastructure/cache issue.

---

## Session: 2026-03-30 — TestimonialCard Hydration Mismatch

#### ENG-055: "Hydration failed — AvatarUpload server/client mismatch"

**Issue:** Hydration failed on the home page. Server rendered `<span className="avatarInitials">` (non-admin path) but the client rendered `<div className="avatarUploadWrap">` (admin AvatarUpload component). The `canEdit` flag — derived from `isAdmin && id != null` — evaluated differently during SSR vs client hydration, causing the avatar section of `TestimonialCard` to produce structurally different DOM trees.

**Root Cause:** The `TestimonialCard` component conditionally renders completely different DOM structures based on `canEdit`: a `<span>` for non-admin vs a `<div>` wrapper (AvatarUpload) for admin. When `isAdmin` evaluates differently between the server HTML render and the client hydration pass (possible due to Next.js 16/Turbopack HTML caching, streaming, or cookie availability timing), the DOM structures diverge at the first element. This is a variant of EAP-014 (server/client branch causing hydration mismatch) — the branching variable is `isAdmin` rather than `typeof window`, but the structural outcome is identical.

**Resolution:** Applied the EAP-014 deferred-mount pattern to `TestimonialCard`. Added `const [mounted, setMounted] = useState(false)` with a `useEffect(() => { setMounted(true) }, [])`, then gated admin features with `const canEdit = mounted && isAdmin && id != null`. This ensures:
- Server SSR: `mounted=false` → `canEdit=false` → renders non-admin DOM (plain `<span>`)
- Client hydration (initial): `mounted=false` → `canEdit=false` → matches server HTML exactly
- Client after mount: `mounted=true` → `canEdit=true` → re-renders with admin features (AvatarUpload, EditableText, etc.)

The brief flash of non-admin content is imperceptible since admin features appear within one frame after mount.

**Principle extracted → `engineering.md` §11: Any client component that conditionally renders structurally different DOM based on `isAdmin` must defer the admin branch using the mounted-state pattern (EAP-014) to prevent hydration mismatches.**

**Cross-category note:** None — this is purely an engineering/React hydration issue.

---

## Session: 2026-03-30 — Élan Case Study CMS Data Sync

#### ENG-054: "I don't see the DAG at all here — what's going on? Check the bugs."

**Issue:** The Agent Harness Architecture (DAG) and Systemic Pattern Map visuals were completely invisible on the Élan case study page. The user expected to see the interactive DAG from a previous conversation but it wasn't rendering at all.

**Root Cause:** The `update-elan` API route (`src/app/(frontend)/api/update-elan/route.ts`) was updated with new section headings ("Agent Harness Architecture", "Systemic Pattern Map") in a previous session, but the route was never re-executed against the CMS database. The CMS still contained old headings from the original creation: "Self-Healing Process" and "Feedback-Driven Component Library." The interactive visual rendering in `ProjectClient.tsx` uses exact string matching: `interactiveVisuals?.[section.heading]`. When the CMS heading "Self-Healing Process" doesn't match the INTERACTIVE_VISUALS key "Agent Harness Architecture", the visual silently returns `undefined` and nothing renders — no error, no fallback.

**Resolution:**
1. Updated the `update-elan` route with the correct restructured section headings and content
2. Updated `INTERACTIVE_VISUALS` in `page.tsx` to match the new section headings
3. Re-ran the route to sync CMS data
4. Verified visuals render on localhost

**Principle extracted → `engineering.md`: When the `update-elan` route or any CMS seed data is modified, the route MUST be re-executed to sync the database. The INTERACTIVE_VISUALS mapping uses exact heading string matching — a heading mismatch silently drops the visual with no error.**

**Cross-category note:** Also documented as CFB-014 (content — the broader case study restructuring that motivated the heading changes).

---

## Session: 2026-03-30 — Collection CRUD for Inline Edit

#### ENG-052: DAG rebuild — CSS module purity constraint and reduced-motion scoping

**Issue:** After rebuilding the ArchitectureDag as a pannable canvas and adding `prefers-reduced-motion` to the SCSS module, Turbopack rejected the CSS: `Selector "*" is not pure. Pure selectors must contain at least one local class or id.` The `*` wildcard in `@media (prefers-reduced-motion: reduce) { * { transition-duration: 0s !important; } }` violated CSS Modules' purity requirement.

**Root Cause:** CSS Modules enforce that every selector contains at least one locally-scoped class or ID. A bare `*` selector is globally-scoped, which CSS Modules cannot hash. This applies even inside `@media` blocks.

**Resolution:** Scoped the reduced-motion rule under `.visualContainer` using `:where(*)` — the parent class provides the local scope, and `:where()` keeps specificity at 0 so it doesn't override component-level styles unexpectedly:
```scss
.visualContainer {
  @media (prefers-reduced-motion: reduce) {
    &, & :where(*) { transition-duration: 0s !important; animation-duration: 0s !important; }
  }
}
```

**Cross-category note:** Also documented as FB-055 (design) — DAG rebuild and §17 accessibility policy establishment.

**Principle extracted -> `engineering.md` §3: In CSS Modules, every selector must contain at least one local class/ID. Use `:where()` to wrap global selectors within a locally-scoped parent.**

---

#### ENG-051: "I don't have the ability to remove, delete, or add extra case studies or testimonials in the inline edit view"

**Issue:** The inline edit system supported editing fields on existing documents and managing array fields on globals (teams, social links, clients via `EditableArray`), but there was no way to create or delete entire collection documents (projects, testimonials) from the frontend inline edit view. Admin users had to navigate to the Payload CMS admin panel for any add/remove operations.

**Root Cause:** Architectural gap — the inline edit system was designed for field-level mutations only (`EditableText` for text, `EditableArray` for arrays on globals). Collection-level CRUD operations (POST/DELETE to Payload REST API) were never wired into the frontend admin flow.

**Resolution:**
1. Added `createCollectionItem` and `deleteCollectionItem` functions to `src/components/inline-edit/api.ts` — these call Payload's REST API (POST for create, DELETE for delete) with `credentials: 'include'` for admin session auth.
2. Created `CollectionActions.tsx` with two components:
   - `DeleteItemButton`: trash icon that appears on hover (matching `EditButton` pattern), triggers a confirmation dialog before deleting.
   - `AddItemCard`: dashed-border card with "+" icon that creates a new document with sensible defaults, optionally opens the admin panel for the new item.
3. Integrated into `HomeClient.tsx`: each project card now shows both Edit and Delete buttons; "Add project" and "Add testimonial" cards appear at the end of the masonry grid.
4. Integrated into `TestimonialCard.tsx`: delete button alongside existing edit button.
5. Integrated into `ContactClient.tsx`: delete button on the current testimonial slider item, add testimonial button below the slider.
6. Both actions trigger `router.refresh()` after completion to re-fetch server data.

**Principle extracted → `engineering.md` §11: The inline edit system now supports three tiers of mutation: field-level (EditableText), array-level (EditableArray), and collection-level (DeleteItemButton, AddItemCard).**

---

## Session: 2026-03-30 — Testimonial Inline Edit Still Broken (Data Flow)

#### ENG-050: "I still cannot edit in the inline visual edit mode for the user testimonial card"

**Issue:** Despite adding `EditableText` wrappers, `id`, and `isAdmin` props to TestimonialCard (ENG-049), the user still cannot edit testimonials inline on the homepage. The cards render as plain non-editable text.

**Root Cause:** The server component queries `where: { showOnHome: { equals: true } }`, but the `showOnHome` field was newly added to the schema. Existing testimonials in the database either: (a) don't have the field at all (server not restarted since schema change), or (b) have it defaulting to `false`/`undefined`. Either way, the query returns 0 documents. The code falls back to `FALLBACK_TESTIMONIALS` which have no `id` property. In the component, `canEdit = isAdmin && id != null` evaluates to `false`, so plain `<p>`/`<span>` elements render instead of `EditableText`. The inline edit code was correct but never reached because the data pipeline short-circuited it.

This is an instance of EAP-016 (conditional rendering hiding inline-editable empty state) combined with a new pattern: **filtering on a newly-added field that has no data yet silently breaks the entire feature**.

**Resolution:** Removed the `showOnHome` filter from the homepage testimonials query. All testimonials now appear on the homepage with their CMS document IDs, enabling inline editing. The `showOnHome` field remains in the schema for future use as an admin-side curation tool, but the homepage no longer gates on it.

**Principle extracted → EAP-030: Filtering on newly-added fields breaks features that depend on the filtered data.**

---

## Session: 2026-04-02 — NavItem Visual Breakage from href Removal

#### ENG-089: "All the navigation bar items are fucked up — spacing between icon and label is broken"

**Issue:** Every NavItem on the playground nav-item page had broken internal layout — the spacing between the icon and label was wrong across all sections (Sizes, States, With Badge, etc.).

**Root Cause:** A previous session (ENG-088 / EAP-057) recommended removing `href="#"` from playground NavItem demos to avoid fragment navigation scroll-to-top. The `href` removal switched NavItem from rendering `<a>` to `<button>`. However, NavItem's SCSS (`NavItem.module.scss`) does not fully reset browser-default `<button>` styles (font, padding, text-align, line-height). The browser's UA stylesheet for `<button>` interfered with the component's flex layout, causing visible spacing distortion between icon and label. The anti-pattern recommendation was semantically correct but visually destructive.

**Resolution:** Reverted `playground/src/app/components/nav-item/page.tsx` to committed state via `git checkout HEAD --`. All `href="#"` props restored. Updated EAP-057 with a caveat: don't remove `href` from playground demos unless the component's SCSS fully normalizes `<a>` vs `<button>` rendering. The proper fix is to add button style resets to `NavItem.module.scss`, after which `href="#"` can be safely removed.

**Principle extracted → EAP-057 updated: Anti-pattern recommendations must be visually verified before bulk application. Semantic correctness ≠ visual correctness when browser UA stylesheets differ between element types.**

---

## Session: 2026-04-02 — NavItem Playground: preventDefault + Visual Spacing

#### ENG-090: "I don't want clicking NavItem in the playground to navigate anywhere"

**Issue:** After restoring `href="#"` (ENG-089), clicking any NavItem in the playground triggered fragment navigation — scrolling the page to the top. The user wanted non-navigating demos that still render as `<a>` (for correct SCSS styling).

**Root Cause:** `href="#"` is a valid fragment link that scrolls to the document top. The page was a Server Component, so event handlers (`onClick`) couldn't be passed as props. The NavItem component's SCSS styles for `<a>` vs `<button>` rendering are not normalized (ENG-089), so removing `href` to use button mode would re-break the layout.

**Resolution:** (1) Added `"use client"` directive to the playground page (consistent with most other playground pages). (2) Defined a shared `prevent` handler: `const prevent = (e: MouseEvent) => e.preventDefault()`. (3) Added `onClick={prevent}` to all 17 NavItem instances that use `href="#"`. This keeps the `<a>` rendering path (correct SCSS) while suppressing navigation. Zero visual impact — only behavioral.

**Cross-category note:** Also documented as FB-053 (design) for the badge overlay visual spacing issue resolved in the same session.

---

## Session: 2026-04-02 — VerticalNav Component & Motion Token Addition

#### ENG-091: VerticalNav compound component creation with new motion tokens

**Issue:** The playground sidebar was a monolithic ~1000-line Tailwind implementation that couldn't be reused. Need a design system component that mirrors its exact structure, spacing, and interaction model using only DS tokens.

**Root Cause:** The sidebar was built as playground-specific code with Tailwind utility classes and playground-scoped CSS custom properties (`--color-sidebar-*`). No reusable DS component existed for vertical navigation.

**Resolution:**
1. Created `src/components/ui/VerticalNav/` compound component (VerticalNavProvider, VerticalNav, Header, Content, Section, Group, Category, Footer, SliverPortal) using exclusively DS SCSS tokens.
2. Added `$portfolio-duration-nav: 200ms` and `$portfolio-easing-nav: ease-out` to `_motion.scss` + `_custom-properties.scss`. These fill the gap between `fast` (110ms) and `moderate` (240ms) for spatial navigation transitions (sidebar width, sliver slide).
3. Extended NavItem with `activeAppearance` prop (`"neutral"` | `"brand"`) and polymorphic `as` prop.
4. Z-index mapping: sidebar → `$portfolio-z-sticky` (200), sliver/backdrop → `$portfolio-z-dropdown` (100), search portals → `$portfolio-z-overlay` (300). No new z-tiers needed.
5. Registered in `archive/registry.json`, ran `npm run sync-tokens`.

**Cross-category note:** Also documented as FB-054 (design) for the NavItem brand active variant and 4-state model alignment.

---

## Session: 2026-04-02 — VerticalNav Playground Demo Portal Escape

#### ENG-092: "The hover-to-reveal sliver is covering the whole page — it's showing up in the actual playground shell's sidebar"

**Issue:** The VerticalNav playground demo page embedded the full `VerticalNav` component (which uses `position: fixed` + `createPortal(document.body)`) inside a 400px preview container. When hovering a category, the `SliverPortal` portaled to `<body>` with `position: fixed; top: 0; left: 200px; height: 100vh`, escaping the demo container and covering the real playground shell sidebar. The `VerticalNav` root `<aside>` also used `position: fixed`, breaking out of the preview div.

**Root Cause:** VerticalNav is a full-page layout component — its `position: fixed` and `createPortal(document.body)` are by design (it IS the shell). Attempting to embed it inside a small preview div with inline style overrides (`style={{ position: "relative" }}`) doesn't work: SCSS module specificity wins, and portals always escape to body regardless.

**Resolution:** Removed the `MiniSidebarDemo` entirely. Replaced with safe, embeddable demonstrations of individual subcomponents: `VerticalNavSection` (section dividers), `VerticalNavGroup` (sub-headers), NavItem active variants (brand vs neutral), and static category button states. The "Full Composition" section shows the API via code example and directs users to the playground's own sidebar as the live demo. Cleared `.next/` and restarted to flush Turbopack cache.

**Principle:** Full-page layout components (`position: fixed`, portal-based) cannot be embedded in preview containers. Their playground pages should demonstrate embeddable subcomponents and document the full composition via code — the layout component's own usage as the shell IS the demo.

---

## Session: 2026-04-02 — NavItem Tiered Architecture Refactor

#### ENG-093: VerticalNavCategory shadow implementation elimination via NavItem composition

**Issue:** VerticalNavCategory was a parallel implementation of NavItem — raw `<button>` with 11 dedicated SCSS classes that duplicated ~80% of NavItem's visual DNA. NavItem lacked the `expanded` visual state, forcing VerticalNav to build it independently as `.categoryExpanded`. No parent/children tier existed at the primitive level.

**Root Cause:** NavItem was designed as a leaf-only component. When VerticalNav needed expandable parent behavior, it built it from scratch rather than extending NavItem. This created a maintenance hazard: any visual change to NavItem's base styles (spacing, typography, hover treatment) would need to be manually replicated in VerticalNav's category styles.

**Resolution:**
1. Added `expanded?: boolean` prop to NavItem + `.expanded` SCSS class (completing the 4-state model from §4.5b).
2. Created `NavItemTrigger` component in the NavItem family — composes NavItem internally, adds auto-chevron + controlled/uncontrolled expand/collapse.
3. Created `NavItemChildren` component — animated height transition container using `requestAnimationFrame` for expand/collapse with the nav motion token (200ms ease-out).
4. Refactored `VerticalNavCategory` to render `NavItem` (not raw `<button>`) with `activeAppearance="brand"` and `expanded` props. Mobile accordion now uses `NavItemChildren` instead of a raw `<div className={styles.mobileSubmenu}>`.
5. Deleted 11 duplicate SCSS classes from `VerticalNav.module.scss` (`categoryButton`, `categoryCollapsed`, `categoryActive`, `categoryExpanded`, `categoryDisabled`, `categoryIcon`, `categoryLabel`, `chevron`, `chevronRotated`, `mobileSubmenu`, plus removed unused `$_nav-icon-size` and `$_nav-chevron-size` tokens). Replaced with a single `.categoryItem` override class.
6. Updated NavItem barrel exports with `NavItemTrigger`, `NavItemChildren`, and their types.
7. Updated both playground pages (NavItem and VerticalNav) with new sections.

**Cross-category note:** Also documented as FB-055 (design) for the tiered NavItem architecture pattern.

---

## Session: 2026-04-02 — NavItemTrigger Badge Support + Trailing Spacing Fix

#### ENG-094: "Trailing slot right-alignment inconsistent with badge slot — NavItemTrigger missing badge prop"

**Issue:** Three issues reported: (1) "Expanded" state demo showed no chevron indicator. (2) NavItemTrigger had no `badge` prop — expandable items couldn't carry badges. (3) Spacing between icon/label/chevron was inconsistent with badge section because `.trailing` lacked `margin-inline-start: auto`.

**Root Cause:** (1) Demo used bare `<NavItem expanded>` instead of `<NavItemTrigger>`. (2) `NavItemTrigger` was built as a minimal wrapper and didn't pass `badge` through to NavItem. (3) `.badge` had `margin-inline-start: auto` for explicit right-alignment, but `.trailing` relied only on `.label { flex: 1 }` — both mechanisms push right, but the inconsistency caused visual discrepancy in edge cases.

**Resolution:**
1. Added `badge?: ReactNode` to `NavItemTriggerProps` interface, destructured in component, passed to `NavItem`'s `badge` prop. Badge renders between label and chevron in the flex layout.
2. Added `margin-inline-start: auto` to `.trailing` in `NavItem.module.scss`, matching `.badge` pattern.
3. Updated "Four Visual States" demo to use `NavItemTrigger` for expanded state.
4. Added "Expandable with Badge" demo section with all three sizes.
5. Updated NavItemTrigger props table with `badge` entry.

**Cross-category note:** Also documented as FB-056 (design) for the visual state and demo completeness feedback.

---

## Session: 2026-04-02 — Playground Flush-and-Restart Protocol Escalation

#### ENG-095: "I have to ask you multiple times to redo this, and you don't seem to have learned the lesson"

**Issue:** After implementing NavItem playground fixes (expanded chevron, badge section, spacing), the agent reported the task as done without flushing the Turbopack cache and restarting the playground server. The user could not see any changes. This is the 6th+ occurrence of this pattern.

**Root Cause:** AGENTS.md guardrail #11 and EAP-042 documented the Turbopack HMR unreliability but treated cache-flush + restart as a fallback escalation path (curl → hard-refresh → if still broken, then flush). The agent repeatedly stopped at the "tell user to hard-refresh" step and reported success, forcing the user to complain before the flush happened. The three-step escalation protocol was fundamentally flawed: it optimized for the rare case where HMR works, when the common case is that it doesn't.

**Resolution:**
1. **AGENTS.md guardrail #11 rewritten:** Flush-and-restart is now the mandatory DEFAULT — not a fallback. The 5-step protocol is: kill server → `rm -rf playground/.next` → restart → wait for 200 → verify change in HTML → report done. No exceptions. No "try HMR first."
2. **EAP-042 escalated:** Status changed to ACTIVE — ESCALATED (6+ violations). Previous protocol explicitly documented as failed. New enforcement wording added. User quote included to emphasize severity.
3. **Lesson:** When a guardrail allows a "try the easy thing first" path, and the easy thing fails consistently, the guardrail must be rewritten to eliminate the easy path. Soft escalation protocols don't work when the failure is the default case, not the exception.

---

### ENG-095: DS Parity Remediation — token sync, build verification, dependency cleanup

**Issue:** Site SCSS used hardcoded px/rgba/z-index values instead of DS tokens, creating maintenance drift. Dead `src/styles 2/` directory and unused `tailwind-merge`/`clsx` deps were present.

**Root Cause:** Site code predated the DS token expansion. No enforcement mechanism existed to prevent raw CSS values when tokens were available.

**Resolution:**
1. Added `$portfolio-type-4xs` (9px) to type scale; added 12 new overlay-white tokens (04, 05, 06, 07, 30, 35, 40, 45, 50, 60, 65, 75). Ran `npm run sync-tokens` after each token file change.
2. Bulk-replaced `font-size: 10px` (28 instances) and `font-size: 9px` (5 instances) across 6 files. Replaced 9 hardcoded z-index values across 6 files.
3. Updated `_custom-properties.scss` overlay sections to reference SCSS variables instead of hardcoding rgba values.
4. Fixed build error: `$portfolio-spacer-0-75x` doesn't exist — corrected 20 instances to `$portfolio-spacer-utility-0-75x`. Fixed `NavPages.module.scss` which lacks `@use` — changed SCSS var to CSS custom property.
5. Deleted `src/styles 2/` (dead duplicate). Removed `tailwind-merge`, `clsx` deps and `src/lib/utils.ts`.
6. Build verified clean (`next build` exit 0).

**Lesson:** Payload admin SCSS files under `(payload)/` don't import the DS styles barrel — they use CSS custom properties directly. When bulk-replacing SCSS variables in admin components, use `var(--portfolio-*)` not `$portfolio-*`. Also, `$portfolio-spacer-utility-*` tokens have the `utility-` prefix for sub-grid values — never assume the shorthand exists.

**Cross-category note:** Also documented as FB-057 (design).

---

### ENG-096: Vercel build failures on first production deploy of main site

**Issue:** First deploy of the main site to Vercel (`yilangao-portfolio`) failed with three `Module not found` errors for `../importMap` in Payload admin files, and one `Module not found` for `resend` in the contact API route.

**Root Cause:** Two distinct issues:
1. Payload CMS auto-generates `importMap.js` during local dev, but it was in `.gitignore`. The file existed locally but never reached GitHub, so Vercel's clean checkout couldn't find it.
2. The contact route used `await import("resend")` behind a runtime guard (`if (!process.env.RESEND_API_KEY)`), with `@ts-expect-error` since `resend` wasn't in `package.json`. Turbopack resolves all imports at build time regardless of runtime conditions — the guard doesn't matter.

**Resolution:**
1. Removed `/src/app/(payload)/admin/importMap.js` from `.gitignore` and committed the generated file.
2. Added `resend` as a real dependency in `package.json`. Removed the `@ts-expect-error` comment.
3. Build succeeded on retry. Production deployment Ready in ~2 minutes.

**Lesson:** Local dev environments mask two categories of build failure: (a) framework-generated files that exist locally but aren't committed (test with a clean `git clone` + `next build`), and (b) dynamic imports that Turbopack resolves statically — there's no such thing as a "runtime-only" import in the build step. See EAP-060.

---

### ENG-097: Playground build failure — parent proxy.ts collision via turbopack.root

**Issue:** After adding `src/proxy.ts` (password gate) to the main site, the playground's Vercel build failed with `Module not found: Can't resolve '@/lib/company-session'` in `./src/proxy.ts`. The playground was detecting and trying to build the main site's proxy file.

**Root Cause:** The playground's `next.config.ts` sets `turbopack: { root: monorepoRoot }` (one level above `playground/`) so that `@ds/*` imports to `../src/components/ui/*` resolve correctly. This causes Next.js 16's proxy file detection to scan from the monorepo root, where it finds `src/proxy.ts`. The proxy imports `@/lib/company-session`, which resolves to `playground/src/lib/company-session` in the playground's context — a file that doesn't exist.

**Resolution:** Created a no-op `playground/src/proxy.ts` that simply returns `NextResponse.next()`. This shadows the parent proxy and prevents the collision. The playground has no authentication gate — it's a design system documentation tool.

**Lesson:** When a monorepo app sets `turbopack.root` to a parent directory, ALL file conventions detected by Next.js 16 (proxy.ts, layout.tsx, etc.) may be resolved from that parent root, not just module imports. Adding a new file convention to any app in the monorepo requires checking whether sibling apps with `turbopack.root` overrides will accidentally pick it up. See EAP-061.

---

### ENG-098: Password gate migrated from static JSON to Payload CMS Companies collection

**Date:** 2026-04-02

**Issue:** Company password configurations were stored in a static `src/config/companies.json` file with no UI for management. Adding/editing companies required code changes and redeployment.

**Resolution:** Created a Payload CMS `Companies` collection with full CRUD, custom admin dashboard (`CompanyDashboard.tsx`), and analytics tracking (login count, last login). Updated proxy, login pages, and case study pages to read from Payload instead of JSON.

**Lesson:** Payload custom admin views (`admin.components.views`) are effective for building tool UIs that need Payload's auth but aren't standard collection CRUD. The REST API (`/api/companies`) provides a clean data layer for client-side dashboards.

---

### ENG-099: Payload 3 schema push doesn't auto-execute for new collections

**Date:** 2026-04-02

**Issue:** After adding the `Companies` collection, the dev server failed with "column payload_locked_documents__rels.companies_id does not exist". Payload's `db-postgres` adapter did not automatically create the required tables/columns.

**Resolution:** Created `src/scripts/push-schema.ts` — a standalone script that connects directly to PostgreSQL and executes the DDL statements to create tables, indexes, and alter `payload_locked_documents_rels`. Must be run once after adding any new collection. See EAP-062.

**Lesson:** Payload 3.80's auto-push for new collections is unreliable. Always run the manual schema push script after adding collections. The Payload CLI (`npx payload migrate:create`) fails under Node.js 25 ESM due to `ERR_REQUIRE_ASYNC_MODULE`.

---

### ENG-100: Payload admin IA restructured — consolidated groups, simplified navigation

**Date:** 2026-04-02

**Issue:** The admin panel had 7 sidebar groups (one per collection), three overlapping navigation systems (DashboardPages cards, NavPages sidebar links, Payload's default collection nav), and a Company Dashboard with no breadcrumb/back navigation. ViewSiteLink was redundant with NavPages.

**Resolution:**
1. Consolidated sidebar groups from 7 to 3: Content (Projects, Books, Testimonials, Experiments), Settings (Site Config, Companies), System (Users, Media).
2. Simplified NavPages to "Quick Links" with only 2 items: Company Access and Open Live Site (absorbed ViewSiteLink).
3. Deleted ViewSiteLink component and removed from `payload.config.ts` `afterNavLinks`.
4. Added breadcrumb navigation to CompanyDashboard ("Dashboard / Company Access").
5. Added Company Access card to DashboardPages for complete dashboard coverage.
6. Added `layoutVariant` select control to CompanyDashboard form.
7. Manually updated Payload's generated `importMap.js` to remove the deleted ViewSiteLink reference.

**Lesson:** Payload's `importMap.js` is auto-generated but doesn't always regenerate when components are removed from config. After deleting an admin component, always check and manually clean the import map, then restart with a cleared `.next` cache. Without this, the admin panel returns 500 with a "Module not found" error.

---

### ENG-108: Image management and section layout controls for inline editor

**Date:** 2026-04-03

**Issue:** The inline editing system supported uploading images to sections but had no controls for deleting images, reordering them, choosing layout styles, adding per-image captions, or toggling section dividers. All image layout was hardcoded by count, dividers were always rendered, and captions were section-level only.

**Resolution:**
1. **Schema:** Added `layout` (select, 8 options), `showDivider` (checkbox), and per-image `caption` (text) fields to the Projects sections schema in `Projects.ts`. Pushed via `push-schema.ts` ALTER TABLE statements.
2. **Server data flow:** Updated `page.tsx` section mapping to pass through `layout`, `showDivider`, and per-image data as `images: Array<{ url, caption? }>` (replacing flat `imageUrls: string[]`). Updated `ProjectSection` type in `ProjectClient.tsx`.
3. **ImageManager component:** Created `ImageManager.tsx` with per-image admin overlay (delete, move left/right, replace, add) using the same `patchSections` pattern as `SectionManager`.
4. **Layout picker:** Added layout preset selector to `SectionToolbar` with 8 layout options. Added CSS grid classes (`imageGridLeftHeavy`, `imageGridRightHeavy`, `imageGrid3Equal`, `imageStacked`, `imageFullWidth`) to `page.module.scss`. Layout selection logic uses the CMS `layout` field, falling back to count-based auto when set to `'auto'`.
5. **Divider toggle:** Added `showDivider` toggle to `SectionToolbar` and conditional divider rendering in `ProjectClient`.
6. **Per-image captions:** Wrapped each image in `<figure>` with `<figcaption>`. Admin mode renders `EditableText` targeting `sections[i].images[j].caption`; visitor mode renders plain `<figcaption>`.
7. **SectionManager refactor:** Added `patchSectionField` to `useSectionManager` for field-level patches (layout, showDivider). Updated `addSection` defaults to include `layout: 'auto'` and `showDivider: true`.

**Lesson:** When adding new fields to Payload array sub-tables, the push-schema script needs explicit ALTER TABLE statements with `DO $$ BEGIN ... EXCEPTION WHEN duplicate_column` guards. The table naming convention is `{collection}_{arrayField}` for top-level arrays and `{collection}_{arrayField}_{subArrayField}` for nested arrays (e.g., `projects_sections_images`).

---

### ENG-109: Payload crash on startup — testimonials.text column type mismatch kills inline editing

**Date:** 2026-04-03

**Issue:** Inline editing was completely broken — double-clicking text fields didn't enter edit mode, the format bar didn't appear, and image management controls were invisible. The admin banner showed correctly, confirming `isAdmin=true`, but all client-side interactivity was dead.

**Root Cause:** Payload's auto-schema-push on startup was trying to `ALTER TABLE "testimonials" ALTER COLUMN "text" SET DATA TYPE jsonb` but PostgreSQL rejected it because varchar can't be automatically cast to jsonb. This caused `payloadInitError: true`, which propagated as an `Uncaught Error` to the browser via React Server Components. The browser-side error crashed React hydration, preventing all event handlers from being attached — so the page rendered (server HTML) but nothing was interactive.

Secondary issue: the Sass `darken()` function was deprecated, producing warnings that cluttered logs but didn't block compilation.

**Resolution:**
1. Manually ran `ALTER TABLE "testimonials" ALTER COLUMN "text" TYPE jsonb USING text::jsonb` to fix the column type with an explicit cast.
2. Killed dev server, cleared `.next` cache, restarted — Payload initialized cleanly.
3. Replaced deprecated `darken($accent, 6%)` with `$portfolio-accent-70` token (2 occurrences in inline-edit SCSS).
4. Verified: Payload API returns 200, project data includes new fields (`layout`, `showDivider`), no errors in server logs.

**Lesson:** When Payload's auto-schema-push fails (e.g., incompatible column type change), the error doesn't just affect the admin panel — it propagates through React Server Components as an uncaught browser error that kills ALL client-side interactivity on the entire site. The symptom (editing doesn't work) is disconnected from the cause (unrelated table migration failure). Always check `payloadInitError` in server logs when client-side features silently break.

---

### ENG-110: Block editor redesign — section model to content blocks architecture

**Date:** 2026-04-04

**Issue:** The inline editing system was built on a rigid section model where each section was a fixed tuple of `(heading + body + images[] + caption + layout + showDivider)`. Every user complaint traced back to this structural rigidity: can't add standalone text blocks, can't move content above the hero, can't reorder content within a section, adding a section forces a divider, layout selector doesn't affect empty image slots.

**Root Cause:** Architectural — the CMS schema imposed a fixed content structure that couldn't accommodate the user's compositional needs. Incremental fixes would never resolve the fundamental ordering and flexibility complaints.

**Resolution:**
1. **Schema migration:** Added a `content: blocks` field to `Projects.ts` with 5 block types: `heading` (text + level), `richText` (Lexical body), `imageGroup` (layout + images[] + caption), `divider` (no fields), `hero` (image + caption). Payload auto-pushed the new block tables successfully.
2. **Data migration:** Wrote `src/scripts/migrate-sections-to-blocks.ts` that converts each project's `sections` array → ordered blocks. Safe to re-run (skips projects with existing content blocks). Migrated all 9 projects.
3. **Rendering pipeline:** Rewrote `page.tsx` to map raw Payload blocks to a typed `ContentBlock` union, and `ProjectClient.tsx` to render blocks via a switch-based block renderer. ScrollSpy sections derived from heading blocks.
4. **Block editor chrome:** Created `BlockToolbar` (per-block floating toolbar using DS `Button`, `DropdownMenu`, `Tooltip`), `BetweenBlockInsert` (Notion-style "+" affordance between blocks), and `BlockInsertMenu` (dropdown with all 5 block types).
5. **Block manager hook:** `useBlockManager.ts` — CRUD operations (add/delete/move/patchField) for the blocks array, plus image operations (add/remove/reorder within imageGroup blocks). All operations fetch current state, transform, and PATCH back.
6. **Accessibility:** `role="list"/"listitem"`, `role="toolbar"` on block toolbars, `aria-label` on all icon-only buttons, `Alt+ArrowUp/Down` keyboard reorder, `aria-live="polite"` live region for announcements, `tabIndex` focus management, keyboard-accessible drop zone.
7. **Legacy compatibility:** Old `sections` field retained but conditionally hidden in admin when `content` blocks exist. `heroImage` field also conditionally hidden when populated.

**Lesson:** When user complaints about a content editing system are all structural (ordering, composition, flexibility), the fix is architectural (schema redesign), not incremental (patching the existing model). Payload's `blocks` field type is the idiomatic solution for flexible content — it provides discriminated union storage with per-type tables, exactly matching the polymorphic block pattern.

**Cross-category note:** Also documented as FB-102 (design).

---

#### ENG-104: "Intro blurb CMS fields + frontend rendering + inline edit support"

**Issue:** Adding two new top-level fields (`introBlurbHeadline`, `introBlurbBody`) to the Projects CMS collection and wiring them through the full data pipeline: Payload schema → server-side extraction → client rendering → inline edit support.

**Root Cause:** Content strategy required a new "trailer" component between the hero and scope statement on case study pages. No CMS fields existed for this content; no rendering logic existed in the frontend.

**Resolution:**
1. Added `introBlurbHeadline` (text) and `introBlurbBody` (richText) fields to `Projects.ts` Content tab, before `description`.
2. Updated `description` admin label from "Case study intro paragraph" to "Scope statement (2-4 sentences)."
3. Updated `page.tsx` data extraction to include the new fields (plain text + HTML conversion via `safeConvertToHtml`).
4. Updated `ProjectData` type and `ProjectClient.tsx` rendering with `EditableText` wrappers for inline edit support.
5. Added SCSS styles (`.introBlurb`, `.introBlurbHeadline`, `.introBlurbBody`) using existing design tokens.
6. Ran `push-schema.ts` to update the database.

**Cross-category note:** Also documented as CF-012 (content) — this is the engineering implementation of the intro blurb integration, luxury positioning, and three thermal zones content strategy.

---

### Block Editor Enhancement — Per-Block Lexical + Markdown Adapter

**Date:** 2026-04-04

**Issue:** The content editing UX inside case study richText blocks was lossy and unreliable: formatting was lost on save/load due to the `contentEditable` → `document.execCommand` → HTML → Lexical JSON round-trip pipeline. Undo/redo didn't work. Bold/italic applied to the whole block instead of selected text. No cross-block keyboard flow. No direct image dropping. No drag-to-reorder. Agent content creation was consuming ~200-250 tokens per richText paragraph (raw Lexical JSON) when 30-50 tokens (Markdown) would suffice.

**Root Cause:** The editing layer used browser-native `contentEditable` + `document.execCommand` (deprecated API), converting user edits to HTML, then parsing HTML back to Lexical JSON for storage. This pipeline was inherently lossy — complex formatting, styles, and structure degraded at each conversion step. Additionally, agents had no efficient way to read/write richText block content since the only format was verbose Lexical JSON.

**Resolution (7 phases):**
1. **Phase 0 — Markdown adapter:** Created `src/lib/content-helpers.ts` with `markdownToLexical`/`lexicalToMarkdown` (using `@lexical/headless` + `@lexical/markdown`) for 8x more token-efficient agent content authoring. Added `createCaseStudyBlocks` and `readBlocksAsMarkdown` agent helpers. Updated `case-study-authoring` skill Phase 3 to reference current `content: blocks[]` schema.
2. **Phase 1 — Per-block Lexical:** Created `LexicalBlockEditor.tsx` (mounts a Lexical `LexicalComposer` per richText block) and `LexicalToolbar.tsx` (floating toolbar using DS `ButtonSelect`, `DropdownMenu`, `ColorPicker`, `Tooltip`). Updated save path to accept Lexical JSON directly (skipping HTML conversion). Passes raw `bodyLexical` from server to client for admin rendering.
3. **Phase 2 — Cross-block keyboard:** Created `useBlockKeyboardNav` hook — Enter at end creates new richText block, Backspace in empty block deletes it, ArrowUp/Down cross block boundaries.
4. **Phase 3 — Direct image dropping:** Native drag events on content area with positional block detection. Drop indicator line shows insertion point. Existing imageGroup grids accept additional drops.
5. **Phase 4 — Block drag-to-reorder:** `@dnd-kit/sortable` wraps block list. Drag handle appears on hover. Added `reorderBlock` method to `useBlockManager` for single-operation array moves.
6. **Phase 5 — Chrome polish:** Single-click edit mode for headings (`singleClickEdit` prop on `EditableText`). Fixed inline `style` in `BlockToolbar` (replaced with `.levelLabel` class). Filled imageGroup grids accept drops.
7. **Phase 6 — Server rendering:** Replaced custom `lexicalToHtml` with Payload's `convertLexicalToHTML` from `@payloadcms/richtext-lexical/html` for full-fidelity visitor rendering.

**Key architectural decisions:**
- Lexical pinned at 0.41.0 to match `@payloadcms/richtext-lexical` 3.80.0's internal version
- Only standard Lexical nodes used (paragraph, text, linebreak) — no custom nodes, ensuring Payload admin compatibility
- Blocks architecture preserved — agents still CRUD flat JSON blocks via Payload REST API
- `TextFormatBar.tsx` deprecated for richText blocks but still available for plain `EditableText` fields

**Lesson:** When the storage model is right but the editing layer is wrong, replace the editing layer surgically. The `contentEditable` + `execCommand` approach was the single broken component — everything else (block CRUD, image management, section navigation) just needed UX polish. A full Lexical migration would have required rewriting all content strategy skills and agents for marginal human UX benefit.

---

### Hero Image Skeleton — Mandatory First Block for All Case Studies

**Date:** 2026-04-04

**Issue:** Case studies created by the authoring skill had no hero image block. The hero placeholder was only rendered when a hero block existed in CMS data, but `createCaseStudyBlocks` only emitted one when `heroImageId` was provided (i.e., never for new case studies). The authoring skill had no enforcement point for hero presence.

**Root Cause:** Gap between the CMS data model (hero block required `image` as NOT NULL) and the authoring workflow (no images exist at authoring time). The skill couldn't create a placeholder hero because the DB constraint prevented it.

**Resolution (6 layers):**
1. **CMS schema** (`Projects.ts`): Made hero `image` field not required. Added `placeholderLabel` text field (conditionally visible when no image).
2. **Database** (`push-schema.ts`): `ALTER TABLE projects_blocks_hero ALTER COLUMN image_id DROP NOT NULL` + `ADD COLUMN placeholder_label varchar`.
3. **Content helpers** (`content-helpers.ts`): `createCaseStudyBlocks` now ALWAYS emits a hero block as the first block. `heroPlaceholderLabel` option sets the label (defaults to "Hero — Case study cover image").
4. **Server mapper** (`page.tsx`): Passes `placeholderLabel` through on hero blocks.
5. **Client renderer** (`ProjectClient.tsx`): Hero section renders unconditionally (no `heroBlock &&` guard). Dynamic label from block data replaces hardcoded text.
6. **Skill + review** (`case-study-authoring/SKILL.md`, `case-study-review.md`): Hero is mandatory in Phase 2 artifact mapping, Phase 3 materialization, Phase 4 quality checks (new Check 16).

**Lesson:** Skeleton placeholders need the same enforcement chain as real content. A placeholder that only works "when configured" will be skipped by default. The fix is to make the helper function emit it unconditionally, so agents can't forget it. Code enforcement > prompt enforcement.

---

### Grid Reorder Disconnected from Case Study Navigation Order

**Date:** 2026-04-05

**Issue:** Masonry grid drag-and-drop reorder on the homepage only saved the display order to `site-config.gridOrder`. The case study prev/next navigation buttons derived their sequence from each project's `order` field in the CMS. Dragging tiles in the masonry view had no effect on the navigation sequence within case studies.

**Root Cause:** Two independent ordering systems serving the same conceptual sequence. `gridOrder` (in site-config global) controlled homepage tile display order. The `order` field (on each project document) controlled case study prev/next navigation. The `saveReorder` function only updated `gridOrder`, leaving individual project `order` fields stale.

**Resolution:** Modified `saveReorder` in `HomeClient.tsx` to also update each project's `order` field after saving `gridOrder`. Projects are extracted from the ordered items (filtering out testimonials), and each project gets a PATCH request setting `order` to its 1-based position in the sequence. The existing prev/next navigation logic in `page.tsx` (which queries by `order` field) then automatically reflects the masonry order.

**Lesson:** When the same conceptual sequence (project ordering) is consumed by multiple features (homepage grid, case study navigation), mutations to that sequence must update all representations atomically. A display-only save that doesn't propagate to the data model creates a silent desync. Anti-pattern: EAP-070 (Dual ordering systems without sync).

---

### TestimonialCard pretext API mismatch

**Date:** 2026-04-05

**Issue:** Runtime TypeError: `pretext.layoutNextLineRange is not a function` in `TestimonialCard.tsx` useEffect. The quote-mark text wrapping logic called nonexistent functions on the `@chenglou/pretext` library.

**Root Cause:** The code called `pretext.layoutNextLineRange()` and `pretext.materializeLineRange()`, but the installed version (0.0.4) exports `layoutNextLine()` which returns a `LayoutLine` object directly (with `.text`, `.width`, `.start`, `.end`). The two-step range-then-materialize pattern doesn't exist in this API.

**Resolution:** Replaced `layoutNextLineRange` + `materializeLineRange` with the single `layoutNextLine` call. The returned `LayoutLine` already contains `text` and `end` cursor, so no materialization step is needed.

**Lesson:** When using dynamic imports of niche libraries, verify the actual exported API against `dist/*.d.ts` before writing call sites. Type declarations are the source of truth for what a package actually exports, especially for pre-1.0 packages where APIs shift between versions.

---

### Login page inaccessible during UI iteration

**Date:** 2026-04-06

**Issue:** User needed to make UI edits to the login page (`/for/[company]`) but couldn't view it on localhost because they were already authenticated. The server component redirects authenticated visitors to `/` before the login form renders. The login page was also missing from the boot-up skill and port registry, so "boot up" didn't surface its URL.

**Root Cause:** The login page's server component unconditionally checks for an existing session and redirects away, with no development bypass. Additionally, the boot-up procedure only tracked server processes (main site, playground, ASCII Art Studio) and had no concept of key pages that need to be accessible for development work.

**Resolution:** Added a `?preview=true` query param bypass in `src/app/(frontend)/for/[company]/page.tsx` that skips the session redirect when `NODE_ENV === "development"`. Updated the boot-up skill to include a "Key Pages" table, added the login page to the port registry as a key page, and documented the dev preview mode in the password gate skill. Now "boot up" always surfaces the login page URL in its report.

**Lesson:** Dev servers aren't the only things developers need access to. Pages behind authentication gates need documented dev-mode bypass routes. The boot-up skill should track not just processes/ports but also key pages that are part of the active development surface.

---

### Login page rebuilt components instead of using DS

**Date:** 2026-04-06

**Issue:** The login page (`/for/[company]`) re-implemented Input, Button, and Eyebrow components from scratch in page-level SCSS instead of using the design system components from `src/components/ui/`. It also had 12+ hardcoded values (border-radius, opacity, transitions, letter-spacing, dimensions) bypassing the token system.

**Root Cause:** The login page was built before the DS Input and Button components existed (or before they reached feature parity). Once the DS components matured, the login page was never migrated. No audit process existed to catch pages using raw HTML where DS components are available.

**Resolution:** Replaced raw `<input>` with DS `<Input>`, raw `<button>` with DS `<Button>`. Removed 60+ lines of re-implemented component SCSS (`.inputGroup`, `.label`, `.input`, `.submit`, `.error`). Replaced all hardcoded values with tokens (`--portfolio-radius-xs`, `$portfolio-spacer-4x`, `$portfolio-border-width-thick`, `--portfolio-opacity-hover`, `--portfolio-action-brand-bold`). Per-company accent theming preserved via scoped CSS custom property overrides.

**Lesson:** Pages built before DS components mature will silently drift from the system unless there's a periodic audit. Consider adding a DS compliance linter or checklist for pages that render form elements — any raw `<input>`, `<button>`, or `<select>` outside of `src/components/ui/` is a candidate for migration. Cross-category note: also documented in design feedback log.

---

### Halftone portrait component ported to login page

**Date:** 2026-04-06

**Issue:** The login page needed a visual anchor - an interactive halftone portrait canvas from a separate Vite project (Portrait Halftone) needed to be integrated as the left pane of a split login layout.

**Root Cause:** The HalftonePortrait component lived in an external Vite project using `?raw` shader imports and `import * as THREE`. These patterns are incompatible with Next.js webpack: Vite's `?raw` suffix doesn't work, and wildcard Three.js imports bloat the bundle (~600 KB). The component also used `forwardRef`/`useImperativeHandle` and download controls not needed for the login page.

**Resolution:**
- Installed `three` + `@types/three` as dependencies
- Created `HalftonePortrait.tsx` and `useInteractionVelocity.ts` colocated with the login page (`src/app/(frontend)/for/[company]/`) - page-specific, not in `src/components/`
- Inlined GLSL shaders as template literal string constants (vertex: 6 lines, fragment: 416 lines) to avoid Vite's `?raw` imports
- Used named Three.js imports (`WebGLRenderer`, `Scene`, etc.) for tree-shaking
- Removed `forwardRef`, `useImperativeHandle`, download button, video control methods
- Loaded via `next/dynamic` with `ssr: false` to prevent Three.js SSR crashes
- Added `matchMedia` guard (`min-width: 769px`) so the canvas is never mounted on mobile, preventing 4.6 MB video download and WebGL resource allocation
- Canvas renders at fixed 1200x1200; CSS `object-fit: cover` fills the tall pane
- Preserved `prefers-reduced-motion` behavior (freezes animation)
- Copied portrait video (4.6 MB, 10s loop) to `public/videos/portrait.mp4`
- Updated SCSS to split layout with `.canvasPane` (50% width) and `.formPane` (flex: 1)
- Removed accent bar from markup and SCSS
- Updated Button specificity chain to `.page .formPane .card .submit` to account for new DOM nesting

**Lesson:** When porting WebGL components between bundlers, the main friction points are shader loading (Vite `?raw` vs webpack loaders vs inline strings) and barrel imports (tree-shaking matters at ~600 KB). Inlining shaders as string constants is the most portable approach - works in any bundler with zero config. The `next/dynamic` + `matchMedia` pattern for conditionally mounting heavy client-only components is a reusable pattern for any route that includes WebGL, maps, or large media - it prevents both SSR crashes and mobile bandwidth waste. Cross-category note: also documented in design feedback log.

---

### Image upload to slotted placeholder grid wipes sibling slots + alt text lost

**Date:** 2026-04-07

**Issue:** Two coupled problems: (1) Uploading an image to one placeholder slot in an `imageGroup` block with `placeholderLabels` caused all other placeholder slots to disappear. The user expected independent slots where filling one leaves the rest intact. (2) The descriptive placeholder label text (e.g., "Lifecycle map: four ETF management stages") was not preserved as the uploaded image's alt text.

**Root Cause:** Three layers of data loss:
1. **CMS mutation** (`useBlockManager.addImageToBlock`): ran `delete block.placeholderLabels` after appending the first image, permanently destroying slot metadata in the database.
2. **Server mapping** (`page.tsx mapContentBlocks` line 130): `placeholderLabels: images.length === 0 ? (b.placeholderLabels ?? undefined) : undefined` - explicitly stripped `placeholderLabels` from data sent to the client when any images existed. Even after fixing (1), the server still dropped the labels.
3. **Alt text pipeline**: `addImageToBlock` called `uploadMedia(file, file.name.replace(...))` using the filename as alt text instead of the meaningful placeholder label. Additionally, the `mapContentBlocks` image mapping didn't extract `alt` from Payload's media object, and the `ContentBlock` type didn't include `alt`.
4. **Binary rendering** (`ProjectClient.tsx`): conditional was `block.images.length > 0 ? (images only) : placeholderLabels ? (placeholders only)`. No mixed state possible.

**Resolution:**
- Removed `delete block.placeholderLabels` from `useBlockManager.ts`.
- Fixed `mapContentBlocks` to always pass `placeholderLabels` regardless of image count.
- Changed `addImageToBlock` to read the block's `placeholderLabels` from CMS data and use `labels[images.length]` (the label for the slot being filled) as the alt text, falling back to filename.
- Added `alt` to the media extraction in `mapContentBlocks` and to the `ContentBlock` image type.
- Updated rendering to use `img.alt || lbl` (stored alt with placeholder label fallback) in both slotted and non-slotted views.
- Restructured the imageGroup rendering conditional to check `placeholderLabels` first, iterating per-slot with mixed image/placeholder rendering.
- Added `.slotWide` CSS class for image figures replacing the first wide placeholder slot.
- Click-to-upload handlers moved to individual empty placeholder divs.

**Lesson:** Data loss bugs compound across layers. Fixing a mutation (layer 1) is insufficient if a mapping function (layer 2) independently strips the same data. When debugging "the fix didn't work," trace the full data path: mutation -> storage -> fetch -> mapping -> rendering. Each layer can independently filter, transform, or discard data. Also: placeholder label text is the image description - treat it as the canonical alt text when uploading, not a disposable UI label.

---

### Illustrations case study scaffold never populated

**Date:** 2026-04-08

**Issue:** The Illustrations case study page was a bare scaffold with placeholder data from initial creation. Missing: `introBlurbHeadline`, `introBlurbBody`, `description`, hero content block. The slug was still `project-ten` (auto-generated). Collaborators were "Name Surname" / "Design Team", external link was `href="#"`. On the homepage masonry grid, the card title fell back to the app name ("Illustrations") because `introBlurbHeadline` was null, making the card title and sidebar title identical.

**Root Cause:** New projects are created with generic placeholder data via the `AddItemCard` component defaults. There is no onboarding checklist or completeness indicator to flag unpopulated projects. The slug auto-generation uses `new-project-${Date.now()}` (later manually changed to `project-ten`), not a semantic slug.

**Resolution:**
- Updated slug from `project-ten` to `illustrations` via CMS API.
- Prepended a `hero` content block with `placeholderLabel` matching the pattern of other case studies.
- Cleared broken placeholder data: removed `href="#"` external link, cleared generic collaborator names.
- Content fields (`introBlurbHeadline`, `introBlurbBody`, `description`, content blocks) left for manual CMS authoring.

**Lesson:** New project scaffolds should be audited before the portfolio is shown to visitors. The `introBlurbHeadline || title` fallback in the homepage card is correct defensive coding, but when both display the same string it signals incomplete data. Consider adding a visual "draft" indicator in admin mode for projects missing critical fields (introBlurbHeadline, description, hero image).

---

### Case study sidebar shows empty "Links" section when no links exist

**Date:** 2026-04-08

**Issue:** The "LINKS" label in the case study sidebar renders even when a project has no external links, leaving a dangling label with no content beneath it on the public page.

**Root Cause:** The Links `metaGroup` div was unconditionally rendered in `ProjectClient.tsx` (lines 652-678). Unlike other meta fields (role, duration, tools) that always have fallback data, `externalLinks` can legitimately be an empty array for projects that don't have relevant external URLs.

**Resolution:** Wrapped the Links `metaGroup` in `{(projectTarget || p.externalLinks.length > 0) && (...)}`. In admin/editing mode (`projectTarget` truthy), the section always renders so links can be added via inline edit. In visitor mode, it only renders when links exist.

**Lesson:** Optional metadata fields in sidebar templates should always be conditionally rendered. The pattern `{(isEditing || items.length > 0) && ...}` should be the default for any list-type meta field. Audit other meta groups (collaborators, tools) for the same issue if they can also be empty.

---
