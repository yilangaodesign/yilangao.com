# Engineering Feedback Log

> **What this file is:** Chronological record of recent engineering incidents and feedback sessions (last 30 entries). Newest entries first.
>
> **Who reads this:** AI agents at session start (scan recent entries for context), and during incident response (check for recurring patterns).
> **Who writes this:** AI agents after each incident resolution via the `engineering-iteration` skill.
> **Last updated:** 2026-04-08 (ENG-134: Corrupted node_modules caused webpack dev server to fail generating build artifacts)
>
> **For agent skills:** Read only the first 30 lines of this file (most recent entries) for pattern detection.
> **Older entries:** Synthesized in `docs/engineering-feedback-synthesis.md`. Raw archive in `docs/engineering-feedback-log-archive.md`.

---

### ENG-134: Corrupted node_modules caused webpack dev server to fail generating build artifacts

**Date:** 2026-04-08

**Issue:** After killing and restarting the main site dev server, webpack mode consistently returned 500 on every page. The `.next/dev/server/middleware-manifest.json`, `routes-manifest.json`, `_document.js`, and `webpack-runtime.js` were never generated. Webpack cache pack strategy also failed with ENOENT on rename operations (`0.pack.gz_ -> 0.pack.gz`). Both webpack and Turbopack modes exhibited the same missing-manifest failure. Turbopack additionally crashed with `CPU doesn't support bmi2 instructions` from the `qfilter` crate.

**Root Cause:** The `node_modules` directory contained corrupted or stale webpack build artifacts (possibly from a partial previous install or interrupted session). When `node_modules/.cache` was cleared, the corruption in the main packages persisted. The webpack bundler silently failed to emit its output files, and since Next.js reports "Ready in 500ms" before any compilation actually happens (compilation is lazy, triggered by the first request), the server appeared healthy but returned 500 on every actual page load.

**Resolution:** Full `rm -rf node_modules && npm install` resolved the issue. After reinstall, webpack compiled normally and all pages returned 200. Clearing only `.next` and `node_modules/.cache` was insufficient — the corruption was in the package artifacts themselves.

**Lesson:** When the webpack dev server silently fails to generate ANY manifests (`middleware-manifest.json`, `routes-manifest.json`, `build-manifest.json`), and clearing `.next` doesn't help, the issue is likely corrupted `node_modules`. A full `rm -rf node_modules && npm install` should be the next escalation step, not repeated `.next` cache clears. The "Ready in Xms" message from Next.js dev only indicates the HTTP listener is up — it says nothing about whether the bundler can actually compile.

---

### ENG-133: Payload CMS schema push prompt hangs dev server in non-interactive shell

**Date:** 2026-04-08

**Issue:** The main site dev server appeared stuck and unresponsive. Initial requests returned 200, but subsequent requests hung indefinitely. The server output showed "Pulling schema from database..." completing, then a destructive schema change prompt: "You're about to delete company_name column in projects table with 6 items — Accept warnings and push schema to database? (y/N)". Since the server was started from a non-interactive background shell, no input could be provided, blocking the entire process.

**Root Cause:** The `company_name` field had been removed from the `Projects` Payload collection schema in code, but the database column still existed. Payload's auto-push on dev startup detected the drift and prompted for confirmation before the destructive column drop. In a non-interactive environment, this prompt blocks forever.

**Resolution:** Connected directly to the database via `pg.Client` and ran `ALTER TABLE projects DROP COLUMN company_name`. After dropping the stale column, Payload's schema pull found no drift and the server started cleanly without prompting.

**Lesson:** When removing fields from Payload collections, always drop the corresponding database column BEFORE restarting the dev server. Payload's schema push prompt cannot be auto-accepted in non-interactive environments. Add column drops to `src/scripts/push-schema.ts` or execute them directly before starting the server. The pattern: (1) modify collection schema, (2) drop column via SQL, (3) restart dev server. Never rely on Payload's interactive prompt to handle schema drift in automated/background shells.

---

### ENG-132: Masonry grid layout shift - missing skeleton dimensions

**Issue:** Homepage masonry tiles cause layout shift (CLS) when cover assets load. The `MediaRenderer` component rendered bare `<img>` / `<video>` elements with no reserved height, so the tile jumped from 0px to the asset's natural height on load.

**Root Cause:** Two data-flow gaps: (1) `page.tsx` fetched media objects with `depth: 1` (which includes `width`/`height` from Payload) but only extracted `url` and `mimeType`, dropping dimensions. (2) `MediaRenderer` was a stateless passthrough with no loading state or dimension-aware sizing.

**Resolution:** Three-layer fix across the data pipeline:
1. **Server** (`page.tsx`): Extract `width`/`height` from the Payload media object and pass as `coverWidth`/`coverHeight`.
2. **Client** (`HomeClient.tsx`): Thread `coverWidth`/`coverHeight` through the `Project` type and `ProjectCard` into `MediaRenderer`.
3. **Component** (`MediaRenderer.tsx`): When dimensions are provided, render a wrapper `<div>` with CSS `aspect-ratio: W / H` that reserves the exact space. A shimmer skeleton fills the space. The asset fades in on load. Falls back to old bare-element behavior when no dimensions are available (backward compatible).

**Lesson:** Any CMS media pipeline that feeds into a layout-sensitive context (masonry, variable-height grids) must carry dimensions from storage through to the renderer. The pattern: server extracts `width`/`height` from the media doc, client threads them through, component uses `aspect-ratio` to reserve space. This is a CLS prevention fundamental.

---

### ENG-131: Site name inline font/weight edits did not persist after save

**Date:** 2026-04-07

**Issue:** On the home page sidebar, editing the identity `name` (`EditableText` on global `site-config.name`) and changing font or weight showed the update while the field was focused, but after blur + save + refresh the formatting reverted to the CMS default.

**Root Cause:** `EditableText` reads non-`isRichText` values with `(el.textContent ?? '').trim()`. Inline bold/weight/font changes from `contenteditable` only affect HTML (e.g. `<strong>`, `<span style="...">`). `textContent` strips that markup, so the captured value often matched the original plain string. The inline-edit registry then did not treat the field as dirty (or normalized away the change), and `saveFields` skipped the update. Rich text (`isRichText`) already used `innerHTML` and Lexical conversion; the site `name` field is Payload `text`, not `richText`.

**Resolution:** Added optional `inlineTypography` on `EditableText` to capture `innerHTML` for plain `text` fields that intentionally store a small HTML fragment string. Added `storedValue` so `originalValue` matches the full CMS string when `children` is a plain-text projection. Added `plainTextFromInlineHtml()` in `src/lib/lexical.ts` for stable display/children. Wired the home identity name to `storedValue`, `htmlContent` when the value includes tags, `inlineTypography`, and plain children for visitors and previews.

**Lesson:** Any `contenteditable` surface that allows inline markup must persist markup from the same source the browser uses (`innerHTML` or a structured editor state), not `textContent`, unless the product explicitly strips formatting. For Payload `text` fields that store HTML fragments, use an explicit opt-in (`inlineTypography`) rather than changing the default for all plain fields.

---

### ENG-130: Supabase Row-Level Security disabled on all public tables

**Date:** 2026-04-07

**Issue:** Supabase sent a critical security advisory: all 33 tables in the `public` schema had Row-Level Security (RLS) disabled. Because Supabase exposes the `public` schema via its REST API (PostgREST) by default, anyone with the project URL and the anonymous API key could read, edit, and delete all data - including the `users` table containing `hash`, `salt`, `email`, and `reset_password_token` columns.

**Root Cause:** Payload CMS creates tables in the `public` schema via its postgres adapter. Payload does not enable RLS on tables it creates because it connects as the `postgres` superuser role (which bypasses RLS). However, Supabase's architecture exposes the `public` schema through a second access path - the PostgREST API using `anon` and `authenticated` roles. Without RLS, these roles have unrestricted access to all tables. This is a platform-level architectural mismatch: Payload assumes it's the only access path to its tables, but Supabase provides additional API access by default.

**Resolution:** Enabled RLS on all 33 public tables via `ALTER TABLE public."<table>" ENABLE ROW LEVEL SECURITY`. No RLS policies were added because:
1. Payload connects via the `postgres` superuser role (through the Supavisor pooler), which automatically bypasses RLS
2. No application code uses Supabase's PostgREST API - all data access goes through Payload's server-side queries
3. With RLS enabled and no policies, the `anon`/`authenticated` roles are completely blocked from all tables

Verified: all 33 tables show `rowsecurity = true` in `pg_tables`, Payload CMS continues to function normally.

**Lesson:** When using Supabase as a Postgres host for a framework that manages its own tables (Payload, Prisma, Drizzle, etc.), always enable RLS on all public-schema tables immediately after creation. Supabase's PostgREST API is always active and exposes `public` tables to the `anon` key by default. This is not a bug in either system - it's an architectural mismatch between "Postgres as a database" (Payload's model) and "Postgres as a backend" (Supabase's model). Future collections added via `src/scripts/push-schema.ts` should include `ALTER TABLE ... ENABLE ROW LEVEL SECURITY` in the DDL.

---

### ENG-129: Elan interactive components (CollaborationLoop, SkillMap, MaturityTimeline)

**Date:** 2026-04-06

**Issue:** The Elan Design System case study page needed three interactive visualization components to illustrate the human-agent collaboration architecture. No existing components existed; the page had 5 existing elan-visuals but these three were planned and wired but unbuilt.

**Root Cause:** Greenfield implementation. INTERACTIVE_VISUALS map in `page.tsx` already referenced `CollaborationLoop`, `SkillMap`, and `MaturityTimeline` by name, but VISUAL_COMPONENTS in `ProjectClient.tsx` had no matching entries. The components simply didn't exist yet.

**Resolution:**
- Added Category Index table to `docs/content-anti-patterns.md` (prerequisite for SkillMap treemap - grouped 28 CAPs into 6 categories)
- Installed `d3-hierarchy` + `@types/d3-hierarchy` for squarified treemap layout
- Built `CollaborationLoop.tsx` + SCSS module: 8-step sequential correction lifecycle with step dots, track fill, and detail panel showing real file paths and code excerpts
- Built `SkillMap.tsx` + SCSS module: dual-view (Tabs) with Operations card grid (16 skills in 5 categories, click-to-expand) and Knowledge treemap (d3-hierarchy squarified, 3 domains, hover tooltips)
- Built `MaturityTimeline.tsx` + SCSS module: stacked bar chart with severity/domain toggle, milestone annotations, hover popovers
- Each new component has its own `.module.scss` file (existing 5 keep shared file) per plan decision for maintainability
- All 3 registered in `index.ts` barrel and `VISUAL_COMPONENTS` map in `ProjectClient.tsx`
- CMS materialized via `POST /api/update-elan`, TypeScript compiles cleanly, cross-app parity check passed (elan-visuals exempt from EAP-007 per precedent)

**Lesson:** Splitting SCSS into per-component modules for new components while preserving the shared file for existing ones is a pragmatic trade-off: existing code isn't disrupted, but new work benefits from better isolation. The d3-hierarchy approach (compute layout, render with DOM/CSS) avoids pulling in a full charting library while getting mathematically correct treemap proportions.

---

### ENG-128: Media separation + video upload pipeline

**Date:** 2026-04-06

**Issue:** Two structural problems: (1) The masonry view thumbnail and case study hero shared the same `heroImage` field - uploading from either surface wrote to the same CMS field, making them inseparable. (2) The media pipeline only accepted `image/*` and `application/pdf` - no video support, and all rendering locations used hardcoded `<img>` tags.

**Root Cause:** The `heroImage` field on `Projects` was originally the only image field. When content blocks were added with their own `hero` block type, the homepage still read from `heroImage`, and `replaceHeroImage` wrote to both the block and the legacy field. No `thumbnail` field existed. The `Media` collection MIME allowlist and all upload zones were image-only by design.

**Resolution:**
- Added a new `thumbnail` upload field to `Projects.ts` (independent of `heroImage`)
- Homepage data fetch reads `thumbnail` first with `heroImage` fallback (migration path)
- `ProjectEditModal` now writes to `thumbnail` instead of `heroImage`
- `replaceHeroImage` no longer writes to the legacy `heroImage` field
- `heroImage` field hidden in admin with `condition: () => false`
- `Media.ts` mimeTypes expanded to `['image/*', 'video/*', 'application/pdf']`
- Created `MediaRenderer` component that renders `<video autoPlay muted loop playsInline>` for video MIME types, `<img>` otherwise
- All upload zones (`ImageUploadZone`, `SectionImageUpload`, `ProjectEditModal`, hero replace) accept `image/*,video/*`
- `mimeType` threaded through both data pipelines (homepage + case study page)
- All 4 rendering locations (masonry card, hero, image groups, modal preview) use `MediaRenderer`
- `push-schema.ts` updated to add `thumbnail_id` column

**Lesson:** When a CMS field serves double duty (homepage card + case study hero), it should be split into two fields rather than sharing one. The coupling was invisible until the user wanted different assets in each location. Migration path (fallback to old field) prevents data loss during the transition.

Cross-ref: FB-122 (design feedback log - always-on skeleton, same session)

---

### ENG-127: TestimonialCard LinkedIn icon — Lumen hover not visible (EAP-072 follow-up)

**Date:** 2026-04-06

**Issue:** After styling the LinkedIn control for default black and hover Lumen (`--portfolio-accent-60`), the brand blue did not show on hover in practice (including dark mode). User suspected the same SVG coloring failure as ENG-126.

**Root Cause:** ENG-126 fixed quotation marks with explicit CSS `fill` on `<path>`. The LinkedIn follow-up only set `fill` on the `<svg>` element. The icon still declares `fill="currentColor"` on the root `<svg>`. That attribute-driven `currentColor` resolution can remain decoupled from later CSS updates the same way as path-level `currentColor` — `svg { fill: var(...) }` alone did not reliably drive the painted path through hover / theme in this component.

**Resolution:** Moved LinkedIn fills to **`svg path`** for default and `:hover` (Lumen `accent-60`), with `transition: fill` on the path. Matches the EAP-072 pattern used for `QuoteMark` paths.

**Anti-pattern:** EAP-072 (clarified in anti-patterns doc) — prefer explicit `path { fill }`, not only `svg { fill }`, when the SVG uses `fill="currentColor"` on the root.

**Files changed:** `src/components/ui/TestimonialCard/TestimonialCard.module.scss`, `docs/engineering-anti-patterns.md`

**Cross-category note:** Related to design LinkedIn color request; same technical class as ENG-126.

---

### ENG-126: SVG fill="currentColor" stale after client-side navigation (EAP-072)

**Date:** 2026-04-06

**Issue:** TestimonialCard quotation mark SVG rendered near-black on the main site despite CSS module setting `color: var(--portfolio-text-terra)` (#915000, warm amber). The same component rendered correctly in the playground. Background-color and sizing from the same CSS module worked fine.

**Root Cause:** The password gate forces all visitors through `/for/[company]`, then client-side navigates (`router.push("/")`) to the homepage. The homepage CSS module (containing TestimonialCard styles) is always loaded dynamically via JS after navigation, never in the initial HTML. SVG `fill="currentColor"` (HTML attribute) resolves during initial render when `color` is still inherited near-black (#161616 from body). When the CSS module loads and sets `color: var(--portfolio-text-terra)`, the `color` property updates, but **browsers don't re-resolve `currentColor` in already-resolved SVG `fill` HTML attributes.** Properties without inherited defaults (like `background-color`) don't suffer this issue because there's no stale value to cache.

**Why playground worked:** The playground loads the component directly on its own page, so the CSS module is in the initial HTML response. `currentColor` resolves correctly on first render.

**Resolution:** Added explicit CSS `fill` rules targeting SVG `<path>` elements instead of relying on `currentColor` inheritance. CSS `fill` properties are re-evaluated when stylesheets load. Applied to: quoteMark visitor mode (`.quoteMark path`), admin hover (`.quoteMarkEditable:hover path`), and LinkedIn icon (`.linkedinBtn svg` + hover/linked states). Kept `fill="currentColor"` in HTML as fallback for pre-CSS render.

**Anti-pattern:** EAP-072 — Never rely solely on SVG `fill="currentColor"` to pick up a CSS module's `color` value when the component may render after client-side navigation. Always add a CSS `fill` rule on the SVG element or its `path` children.

**Files changed:** `src/components/ui/TestimonialCard/TestimonialCard.module.scss`

**Cross-category note:** Also documented as FB-117 (design) for the visual change from neutral to Terra palette.

---

### ENG-125: Hero image re-upload missing + dimension mismatch

**Date:** 2026-04-06

**Issue:** Two hero image problems: (1) After uploading a hero image, there is no way to re-upload/replace it. (2) Uploaded image dimensions don't match the placeholder container, causing blank space or inconsistent sizing.

**Root Cause:** (1) The hero section JSX had a ternary that rendered `<img>` when an image existed and `<ImageUploadZone>` only when no image existed. Once uploaded, the upload affordance disappeared. (2) `.heroSkeleton` had `aspect-ratio: 16/9` but `.heroInner` (which wraps existing images) had no aspect ratio constraint. `.heroImg` used `height: auto` which let the image render at its natural proportions, creating container-size jumps. Related to ENG-123 (hero image upload flow), same area.

**Resolution:**
1. **Re-upload overlay** (ProjectClient.tsx): When admin + image exists, renders a hover overlay (`heroReplaceOverlay`) on top of the image with a hidden file input. Clicking or dropping uploads a new file, updates both the hero content block's `image` field and the legacy `heroImage` field, then refreshes. Added `heroBlockIndex` tracking, `replaceHeroImage` callback, and `heroFileRef` + `heroUploading` state.
2. **Dimension auto-fit** (page.module.scss): Moved `aspect-ratio: 16/9` and `overflow: hidden` from `.heroSkeleton` to `.heroInner` so the container always maintains 16:9 regardless of image content. Changed `.heroImg` from `height: auto` to `height: 100%; object-fit: cover`. Images that don't match 16:9 now get cropped, making proportion issues immediately visible.

**Cross-category note:** Also documented as FB-115 (design) for image container consistency and upload affordance.

**Files modified:** `src/app/(frontend)/work/[slug]/ProjectClient.tsx`, `src/app/(frontend)/work/[slug]/page.module.scss`.

---

### ENG-124: Button component polymorphic upgrade for link support

**Date:** 2026-04-06

**Issue:** The DS `Button` component (`src/components/ui/Button/Button.tsx`) only rendered `<button>` elements. Navigation links (back, prev/next) across the site bypassed the DS by using plain `<Link>` with custom CSS, creating a consistency gap.

**Root Cause:** The `ButtonProps` type only extended `ButtonHTMLAttributes<HTMLButtonElement>`. There was no mechanism for the component to render as a link element.

**Resolution:** Made `Button` polymorphic via discriminated union types: `ButtonAsButton` (no `href`, renders `<button>`) and `ButtonAsLink` (`href` required, renders `<Link>` for internal or `<a>` for external URLs). Added `text-decoration: none` to the base `.button` CSS class for link rendering. Replaced 6 instances across 4 files: `ProjectClient.tsx` (back + prev + next), `ExperimentsClient.tsx`, `motion/page.tsx`, `typography/page.tsx`. Removed unused `Link` import from `ProjectClient.tsx`.

**Cross-category note:** Also documented as FB-112 (design) for DS component consistency.

**Files modified:** `src/components/ui/Button/Button.tsx`, `src/components/ui/Button/Button.module.scss`, `src/app/(frontend)/work/[slug]/ProjectClient.tsx`, `src/app/(frontend)/experiments/ExperimentsClient.tsx`, `src/app/(frontend)/design-system/motion/page.tsx`, `src/app/(frontend)/typography/page.tsx`.

---

### ENG-123: Hero image upload — uniqueness error + display disconnect

**Date:** 2026-04-06

**Issue:** Two problems with hero image upload on case study pages: (1) Uploading images via the hero ImageUploadZone fails with "Could not save - A field value must be unique" when the sanitized filename matches an existing media entry. (2) After a successful upload, the image appears in the home page thumbnail (which reads the legacy heroImage field) but not on the actual case study page.

**Root Cause:** (1) `uploadMedia()` used the original filename for the Payload media entry. Payload's media collection enforces unique filenames. Common filenames (e.g., "Screenshot 2026-04-05 at 19.04.17.png") collide after sanitization. (2) The ImageUploadZone writes to the legacy heroImage field. The case study page.tsx reads from the hero content block's image field first, and only falls back to heroImage when NO hero content block exists. Projects with a hero content block (even one with no image) never reach the heroImage fallback path.

**Resolution:**
1. **Filename dedup** (api.ts): `uploadMedia()` now appends a `Date.now()` timestamp to the stem of every uploaded filename (e.g., hero-1743897600000.png). Prevents collisions without server-side dedup.
2. **Hero fallback merge** (work/[slug]/page.tsx): When a hero content block exists but has no imageUrl, the server-side mapper now fills it with the legacy heroImage URL. Previously the fallback only fired when no hero block existed at all.

**Pattern:** Data model migration gap - architecture moved from heroImage (top-level upload field) to hero content blocks, but the upload path still wrote to the old field and the read path had a gap in the fallback chain.

**Lesson:** When migrating from legacy fields to new content structures, audit all three legs: (1) the write path, (2) the read/display path, and (3) the fallback path. A gap in any one leg creates a "writes but doesn't display" bug.

---

### ENG-122: InfoTooltip integration on hero metrics

**Issue:** Hero metrics on case study pages display a big number and a label but offer no explanation of how the metric was derived. User requested adding tooltips to provide non-invasive methodology context.

**Root Cause:** The `heroMetric` data structure (`{ value, label }`) had no field for tooltip content, and the rendering code displayed only static text without any interactive element.

**Resolution:**
1. Extended `HERO_METRICS` map in `page.tsx` with optional `tooltip` field (string).
2. Added tooltip content for Lacework ("Perceived ease-of-use scores...") and Meteor ("A representative basket review...").
3. Updated `ProjectClient.tsx` type to include `tooltip?: string`.
4. Imported `InfoTooltip` from `@/components/ui/Tooltip` and rendered it alongside the metric label in a new `.heroMetricLabelRow` flex wrapper.
5. Added `.heroMetricLabelRow` SCSS class (`display: flex; align-items: center; gap: spacer-0.5x`).
6. Elan Design System metric intentionally has no tooltip (self-anchoring count).

**Files changed:** `page.tsx`, `ProjectClient.tsx`, `page.module.scss` (all in `src/app/(frontend)/work/[slug]/`).

**Cross-category note:** Also documented as CF-020 (content - tooltip copy and metric taxonomy) and in design log (tooltip as a UI pattern for metrics).

---

### ENG-121: LexicalBlockEditor save-on-blur silently fails for array-indexed fields

**Issue:** Editing rich text blocks in case study content (LexicalBlockEditor) appeared to save on blur but reverted on page refresh. No error was ever shown to the user.

**Root Cause:** Two compounding bugs: (1) `setNested()` in `api.ts` creates a sparse array when the field path contains an array index (e.g., `content.2.body` produces `[null, null, {body: ...}]`). Payload CMS rejects this with HTTP 500 because the null entries lack required `blockType` fields. (2) The `save()` function in `LexicalBlockEditor.tsx` was fire-and-forget - it called `updateCollectionField()` without `await` or `.catch()`, so the 500 error was silently swallowed.

**Resolution:** Changed `save()` to detect array-indexed field paths via regex (`/^(\w+)\.(\d+)\.(.+)$/`). When detected, it fetches the current document, patches only the specific array element, and sends the full array back - the same pattern `useBlockManager.patchContent` already uses. Also added `.catch()` to the blur and Cmd+S save handlers so future errors are logged to the console instead of silently lost.

**Lesson:** Fire-and-forget async calls that appear to succeed (no visible error) are the hardest bugs to diagnose. Any function that writes to the backend should either `await` its result or attach a `.catch()` that surfaces the error. The `setNested` utility is also fundamentally unsuited for partial array updates - always fetch-modify-save for array fields.

---

### ENG-120: Title semantic split - introBlurbHeadline drives homepage card

**Issue:** The `title` CMS field was used for both the app name and the homepage card title. The creative case study headline (`introBlurbHeadline`) was only visible inside the case study, wasting its hook value.

**Root Cause:** Original data model treated `title` as the universal display name. When `introBlurbHeadline` was added for the case study intro blurb, the homepage card was never updated to use it.

**Resolution:**
1. `page.tsx` (homepage): added `introBlurbHeadline` to project data mapping, updated project type.
2. `HomeClient.tsx`: card `EditableText` switched from `fieldPath="title"` to `fieldPath="introBlurbHeadline"`, with fallback display `{project.introBlurbHeadline || project.title}`. Updated `openProjectEditor` to pass `introBlurbHeadline`.
3. `ProjectClient.tsx`: sidebar title label changed to "App Name", intro blurb headline label changed to "Case Study Title".
4. `ProjectEditModal.tsx`: added `introBlurbHeadline` to `ProjectForEdit` interface, added state management, added "Case Study Title" form field, included in save body. "Title" label renamed to "App Name".
5. `Projects.ts`: updated admin descriptions for both fields.
6. DB fix: PATCH Lacework `title` from "I saved the page..." back to "Lacework".

**Data flow:** Homepage card title now reads `introBlurbHeadline` (falls back to `title`). Editing the card title on the homepage or the intro blurb headline on the case study page both edit the same `introBlurbHeadline` field. The `title` field is the app name, displayed in sidebar h1 and prev/next nav only.

**Cross-category note:** Also documented as FB-106 (design) and CFB-026 (content).

---

### ENG-119: Scope statement Lexical data flow + editing UX parity

**Issue:** The scope statement (description field) used `EditableText` (plain contenteditable) for editing while section bodies used `LexicalBlockEditor`. Both are Lexical richText fields in the CMS, but `descriptionLexical` was never passed from `page.tsx` to `ProjectClient.tsx`.

**Root cause:** Data flow gap. `page.tsx` extracted `descPlain` and `descHtml` from `doc.description` but never passed the raw Lexical JSON needed by `LexicalBlockEditor`.

**Resolution:** Added `descriptionLexical` to the project data flow (`page.tsx` → `ProjectClient.tsx`). Switched scope statement admin rendering from `EditableText` to `LexicalBlockEditor`. Both body text areas now use the same Lexical editing UX.

**Cross-category note:** Also a design issue (font size mismatch between the two areas). Documented as FB-104.

---

### ENG-118: Restore image skeleton system (placeholderLabels)

**Issue:** During the migration from `sections[]` to typed `content` blocks, the image placeholder/skeleton system was dropped entirely. The old `IMAGE_PLACEHOLDERS` map in `page.tsx` (commit `d9bb2d3`) provided labeled placeholder boxes so users knew which images to upload where. The new blocks system had no equivalent. Three compounding causes: CMS schema required real image IDs (`required: true`), the helper API had no placeholder concept, and the authoring skill workflow docs never instructed agents to create placeholder blocks.

**Root cause:** Migration gap. When `sections[]` became `content` blocks, the scaffold layer (labeled image skeletons) was dropped without a replacement. The SCSS styles (`.placeholderGrid`, `.labeledPlaceholder`) survived but went unused. Additionally, `content-helpers.ts` used stale layout shorthand values (`'full'`, `'leftHeavy'`) that didn't match CMS schema or frontend render map values.

**Resolution:**
- Added `placeholderLabels` (json field) to `imageGroup` block in `Projects.ts` (auto-pushed by Payload)
- Fixed layout type mismatch in `CaseStudySection` interface to use CMS-native values (`full-width`, `grid-2-equal`, etc.)
- Added `imagePlaceholders` field to `CaseStudySection`, updated `createCaseStudyBlocks()` to emit one imageGroup per section with `placeholderLabels` when no real images exist
- Updated `readBlocksAsMarkdown()` to represent placeholders as `> [IMAGE PLACEHOLDER: label]`
- Updated `mapContentBlocks()` in `page.tsx` to pass `placeholderLabels` through to frontend
- Updated `ProjectClient.tsx` to render labeled skeleton grid using existing SCSS classes
- Updated `addImageToBlock` in `useBlockManager.ts` to clear `placeholderLabels` on first real image upload
- Updated authoring skill workflow (Phase 2 + Phase 3) with image skeleton planning and materialization
- Added Check 15 (Visual density) to case-study-review.md, removed hardcoded "14 checks" count
- Updated narrative-arc.md Tier 1 definition and visual-economy.md with generation guidance

**Lesson:** When migrating a data model, audit the full rendering pipeline end-to-end: schema → helper → server-side mapping → client-side render → admin upload flow. The image skeleton system was invisible in the CMS schema diff because it lived in a separate layer (`page.tsx` static map) that wasn't part of the formal migration checklist. Migration checklists should include "scaffold/placeholder/preview" layers alongside data and render layers.

---

### ENG-117: Turbopack routes-manifest.json missing breaks all dynamic routes

**Issue:** User reported "this page isn't working" on `http://localhost:4000/work/lacework` and expected other case study pages to have the same problem. Server returned 500 for all `/work/[slug]` routes while the home page `/` worked fine.

**Root Cause:** Next.js 16.2.1 Turbopack does not generate `.next/dev/routes-manifest.json` during development. The file is required for resolving dynamic routes. Static routes (like `/`) work because they don't need the manifest, but any parameterized route (`/work/[slug]`) fails with `ENOENT: no such file or directory, open '.next/dev/routes-manifest.json'`. This is a known Turbopack regression in 16.2.x (GitHub vercel/next.js#91609, #91864). The `--webpack` bundler generates the manifest correctly.

**Resolution:** Switched the main site dev script from `next dev --port 4000` (Turbopack default) to `next dev --port 4000 --webpack`. All dynamic routes now compile and serve correctly. This is a temporary workaround until the Turbopack bug is fixed in a future Next.js release.

**Principle extracted -> `engineering-anti-patterns.md` EAP-069: Turbopack routes-manifest regression in Next.js 16.2.x**

---

### ENG-116: Zombie Next.js servers accept TCP but hang on HTTP requests

**Issue:** User clicked localhost links and pages never loaded. Agent's boot-up probe using `nc` and `lsof` confirmed TCP listeners on ports 4000, 4001, and 4002, but `curl` requests hung indefinitely. Servers appeared alive but were unresponsive. Additionally, agent used `127.0.0.1` in URLs instead of the standard `localhost`.

**Root Cause:** The three Next.js dev server processes (PIDs 28348, 64678, 19795) had been running for 6 minutes to 3+ days from previous sessions. Over time they entered a zombie state where the Node.js process still held the TCP socket open (accepting connections at the kernel level) but was no longer processing HTTP requests. The initial boot-up probe relied on `lsof` (port occupied) and `nc` (TCP connect succeeds) as health indicators, but neither test exercises the HTTP layer. A process can accept TCP connections without ever responding to them.

**Resolution:** Killed all three stale processes (`kill -9`), cleared `.next` caches for all three apps, restarted fresh. All servers responded to `curl http://localhost:<port>/` within 12 seconds. URLs now use `localhost` instead of `127.0.0.1`.

**Principle extracted -> `engineering-anti-patterns.md` EAP-063: TCP-level checks are not health checks**

---

### ENG-115: Hero image below intro blurb — block list position vs. template position

**Issue:** Hero image renders after introBlurb, description, and companyNote because it's a block in the `content` array. User wants hero image always above the intro blurb as a fixed template element.

**Root Cause:** The hero block type was treated like any other content block. No extraction logic separated it from the block list. The template rendering order placed all blocks after the intro sections.

**Cross-category note:** Also documented as FB-101 (design).

**Resolution:** Extracted hero from content blocks with `useMemo`, rendering it at the top of `<main>` before introBlurb. Created `contentBlocks` array that filters out hero blocks, preserving `originalIndex` for CMS field path references. All `blockMgr` operations now use `cmsIndex` (original array position) rather than display `blockIndex` to prevent off-by-one writes. Template change applies to all case studies automatically.

---

### ENG-114: Lexical toolbar invisible — undefined CSS token references

**Issue:** User reported "Bad UI, edit modal clashing with content." The LexicalToolbar (floating rich text format bar) rendered with a transparent background, making buttons appear directly on top of content text.

**Root Cause:** `.lexToolbar` referenced `var(--portfolio-bg-elevated)` and `.lexToolbarBtn:hover` referenced `var(--portfolio-bg-subtle)` — both CSS custom properties that don't exist in the design token system. They resolve to `initial` (transparent). The correct tokens are `--portfolio-surface-primary` and `--portfolio-surface-secondary`.

**Cross-category note:** Also documented as FB-100 (design).

**Resolution:** Replaced three undefined CSS custom properties in `inline-edit.module.scss`:
- `.lexToolbar` background: `var(--portfolio-bg-elevated)` → `var(--portfolio-surface-primary)`
- `.lexToolbarBtn:hover` background: `var(--portfolio-bg-subtle)` → `var(--portfolio-surface-secondary)`
- `.lexCode` background: `var(--portfolio-bg-subtle)` → `var(--portfolio-surface-secondary)`
Also replaced hardcoded `z-index: 100` with `var(--portfolio-z-dropdown)` and `box-shadow` with `var(--portfolio-shadow-lg)` to use the token system consistently.

---

### ENG-113: Lexical MarkdownShortcuts missing `CodeNode` dependency

**Date:** 2026-04-04

**Issue:** Runtime error on case study pages with richText blocks: "MarkdownShortcuts: missing dependency code for transformer. Ensure node dependency is included in editor initial config."

**Root Cause:** `LexicalBlockEditor` uses `TRANSFORMERS` from `@lexical/markdown` (which includes the `CODE` block transformer) but `EDITOR_NODES` didn't include `CodeNode`. The `registerMarkdownShortcuts` function validates that all node dependencies for each transformer are registered.

**Resolution:** Added `CodeNode` from `@lexical/code` to the `EDITOR_NODES` array. The package was already installed as a transitive dependency of `@payloadcms/richtext-lexical`.

**Lesson:** When using `TRANSFORMERS` (the full set) from `@lexical/markdown`, every transformer's node dependency must be in the editor config. If you don't want to support a transformer's node type, build a custom transformer list instead.

---

### ENG-112: DndContext `aria-describedby` hydration mismatch on case study blocks

**Date:** 2026-04-04

**Issue:** Hydration attribute mismatch on every `SortableBlock` — server rendered `aria-describedby="DndDescribedBy-0"` but client expected `DndDescribedBy-2`.

**Root Cause:** `@dnd-kit/core`'s `DndContext` uses an auto-incrementing counter for its accessibility ID. The counter value differs between server SSR and client hydration because other components (or React strict mode) increment it on the client before `ProjectClient` mounts.

**Resolution:** Added `id="project-blocks"` prop to `DndContext`, which produces a stable `DndDescribedBy-project-blocks` instead of the counter-based ID.

**Lesson:** Always pass a stable `id` to `DndContext` in SSR environments. The auto-generated counter-based ID is inherently non-deterministic across server/client boundaries.

---

### ENG-111: Rich text hydration mismatch — `<p>` inside `<p>` on case study description

**Date:** 2026-04-04

**Issue:** Hydration failure on `/work/meteor` — server-rendered HTML didn't match client. React reported `dangerouslySetInnerHTML.__html` differed: server had the full description HTML, client had `""`.

**Root Cause:** `EditableText` was rendered with `as="p"` for rich text fields (`description`, `introBlurbBody`) whose `htmlContent` contains block-level `<p>` tags from Payload's Lexical-to-HTML conversion. This produced `<p><p><strong>...</strong></p></p>` — illegal per the HTML spec. The browser's parser auto-closes the outer `<p>` when it encounters the inner `<p>`, restructuring the DOM. React's hydration then sees a different tree than what it rendered on the server.

**Resolution:** Changed `as="p"` to `as="div"` for all `EditableText` instances that use `isRichText` + `htmlContent` (description, introBlurbBody). Also changed the non-admin fallback paths from `<p dangerouslySetInnerHTML>` to `<div dangerouslySetInnerHTML>` for the same fields. Plain-text fallbacks (`<p>{text}</p>`) remain unchanged since they contain no nested block elements.

**Lesson:** Rich text HTML from CMS (Lexical → HTML) always contains block-level elements (`<p>`, `<h2>`, etc.). The wrapper element for `dangerouslySetInnerHTML` must be a flow container (`div`) not a phrasing element (`p`, `span`). This is an instance of EAP-014 (hydration mismatches from invalid HTML).

---

## Session: 2026-04-04 — Inline edit system enhancements

### ENG-107: Inline edit system — Lexical style round-trip, selection formatting, section CRUD, image upload

**Issue:** Multiple inline editing limitations reported: (1) Bold/italic couldn't be applied to individual words — entire text block toggled. (2) No font family or color selection. (3) Case study sections couldn't be added/reordered/deleted without code changes. (4) Images couldn't be uploaded directly from the inline editor. (5) Hero image used a static map instead of CMS data.

**Root Cause:**
1. **Formatting:** `toggleBold`/`toggleItalic` in `TextFormatBar` and `EditableText` used `el.style.fontWeight`/`el.style.fontStyle` for no-selection case, overriding all child `<strong>`/`<em>` tags via CSS cascade.
2. **Style preservation:** `htmlToLexicalDocument()` only extracted formatting from semantic tags (B, I, U, S), ignoring inline `style` attributes. `lexicalToHtml()` only emitted format bitmask tags, not `style` fields.
3. **Section management:** No CRUD API existed for sections; `ProjectClient.tsx` rendered sections as a static loop.
4. **Image upload:** No upload component existed; hero image used `COVER_IMAGES` static map.

**Resolution:**
1. **Lexical style round-trip** (`api.ts`, `lexical.ts`): Added `extractInlineStyle()` to parse `font-family` and `color` from inline styles and `<font color>` elements. Modified `collectTextNodes()` to propagate styles. Updated `mergeAdjacentNodes()` to check both `format` and `style`. Updated `lexicalToHtml()` to emit `<span style="...">` when a text node has a `style` field.
2. **Selection-level formatting** (`TextFormatBar.tsx`, `EditableText.tsx`): Replaced `el.style.fontWeight`/`el.style.fontStyle` with `selectAllContent()` + `execCommand('bold'/'italic')` for no-selection case. Added `wrapSelectionWithStyle()` helper for font-weight, font-size, font-family, and color. Bold toggle now clears `el.style.fontWeight` to prevent cascade conflicts.
3. **Font family picker** (`token-map.ts`, `TextFormatBar.tsx`): Added `FONT_FAMILY_SCALE` (8 entries) and `matchFontFamily()`. Dropdown uses selection-aware `wrapSelectionWithStyle('font-family', css)`.
4. **Color picker** (`TextFormatBar.tsx`): Converted read-only color swatch to dropdown of `COLOR_TOKENS`. Uses `execCommand('foreColor')` for selection-aware color.
5. **Section CRUD** (`SectionManager.tsx`, `ProjectClient.tsx`): Created `useSectionManager` hook with `addSection`/`deleteSection`/`moveSection` that PATCH the project's `sections` array. `SectionToolbar` renders per-section move/delete controls. `AddSectionButton` at sections end.
6. **Image upload** (`ImageUploadZone.tsx`, `ProjectClient.tsx`): Created `ImageUploadZone` (hero image) and `SectionImageUpload` (section images) with drag-and-drop + click-to-upload. Upload via `POST /api/media`, then PATCH the project field.
7. **Hero image from CMS** (`page.tsx`): Extracted `heroImageUrl` from `doc.heroImage` relation. Falls back to `COVER_IMAGES` static map if CMS has no hero image.

**Cross-category note:** Also documented as FB-099 (design — toolbar accessibility, contrast fix, font/color pickers).

**Lesson:** `el.style.fontWeight` on a contentEditable root creates a cascade conflict that makes per-word bold toggling impossible. Always use semantic tags (`<strong>`, `<em>`) or `<span>` wrappers for formatting within contentEditable — never apply formatting as an inline style on the root element itself. This applies to any CSS property where per-word granularity is needed.

---

## Session: 2026-04-03 — Sidebar SCSS module migration

### ENG-106: Sidebar .module.css → .module.scss migration (build verification)

**Issue:** Sidebar shell refactored from Tailwind utility classes to full SCSS module with Élan DS tokens. Module renamed from `.css` to `.scss`, requiring build-chain verification.

**Root cause:** Proactive refactoring — not a bug. Engineering dimension of FB-098.

**Resolution:** Deleted `sidebar.module.css`, created `sidebar.module.scss` with `@use 'mixins/...'` and `@use 'tokens/...'` imports (resolved via `sassOptions.loadPaths` → `src/styles/`). Import in TSX changed from `styles` to `s` alias. Full flush-and-restart verified: HTTP 200 on `/` and `/components/button`, class names in rendered HTML confirmed as SCSS module hashes with no Tailwind remnants.

**Cross-category note:** Also documented as FB-098 (design).

---

## Session: 2026-04-03 — Checkbox height fluctuation on toggle

### ENG-105: Paragraph breaks lost in inline edit after save

**Date:** 2026-04-03

**Issue:** Rich text fields (description, section bodies, bio) lost paragraph separation after saving in admin inline edit mode. While editing, line breaks were visible, but after save + router refresh they collapsed into a single block of text.

**Root Cause:** Server components used `extractLexicalText()` (which returns plain text with `\n` newlines) to pass data to `EditableText`, but never passed `lexicalToHtml()` as the `htmlContent` prop. After save, `router.refresh()` re-fetched server data, and `\n` characters in plain text are invisible in HTML rendering. The testimonial fields already handled this correctly — the pattern existed but wasn't applied consistently.

**Resolution:** Added `lexicalToHtml()` computation on the server for all rich text fields (project description, section bodies, bio) and passed the result as `htmlContent` to `EditableText`. Updated non-admin rendering paths to use `dangerouslySetInnerHTML` when HTML content is available. Also cleaned up debug logging blocks left from a prior investigation session.

**Lesson:** Every `EditableText` with `isRichText` must also receive `htmlContent` from the server. Plain text (`extractLexicalText`) is only for fallback display and dirty-checking — the HTML representation is required for preserving formatting across save cycles. See EAP-065.

---

### ENG-104: Checkbox visually fluctuates in height when toggling checked state

**Date:** 2026-04-03

**Issue:** Checkbox component exhibited a visible height/size fluctuation when toggling between unchecked and checked states.

**Root cause:** Radix `CheckboxPrimitive.Indicator` without `forceMount` removes/adds the indicator span from the DOM on every state change. Combined with `transition: all` on the parent button, the DOM mount/unmount triggered a brief animated layout recalculation visible as a size glitch.

**Resolution (two iterations):**
First attempt: added `forceMount` to `CheckboxPrimitive.Indicator`, narrowed `transition: all` to specific properties, added `overflow: hidden`. This eliminated the DOM mount/unmount but the Presence component's `ResizeObserver`, animation event listeners, and internal state machine still caused sub-frame layout jitter.

Final fix: bypassed `CheckboxPrimitive.Indicator` entirely. Icons are now direct children of `CheckboxPrimitive.Root` (the button), absolutely positioned with `opacity: 0/1` toggling via CSS `data-state` selectors on the button itself. Added `position: relative` to `.checkbox` to contain the absolute icons. Zero Radix animation/presence machinery involved — the only thing that changes on toggle is `data-state`, `background-color`, `border-color`, and icon `opacity`.

**Lesson:** Radix's `Indicator`/`Presence` pattern is designed for entrance/exit animations. If you don't need animations and want rock-solid layout stability, skip the Indicator and render icons directly as children of the Root, using CSS `data-state` selectors for visibility. The Presence component's `ResizeObserver` + animation state machine + event listeners add overhead that can cause sub-frame jitter even with `forceMount`.

**Cross-category note:** Also documented as FB-095 (design) — transition specificity rule.

---

## Session: 2026-04-03 — sync-tokens script enhanced for dark mode

#### ENG-103: sync-tokens.mjs only parsed light mode; dark mode token values missing from playground

**Issue:** The `sync-tokens.mjs` script generated `tokens.ts` with only light mode hex values. Dark mode overrides from `_custom-properties.scss` were never read or output. This meant the playground colors page couldn't document dark theme token values.

**Root cause:** The script was scoped to `_colors.scss` only (SCSS variable definitions). Dark mode values live in `_custom-properties.scss` under the `[data-theme="dark"]` block as CSS custom property overrides. The script had no awareness of this second file.

**Resolution:** Added `parseDarkOverrides()` to `sync-tokens.mjs` that reads `_custom-properties.scss`, extracts all `--portfolio-*` overrides from the dark theme block, resolves `#{$portfolio-*}` references to hex via the palette lookup, and maps them back to token names. Every `EmphasisToken` and `SemanticToken` now carries an optional `darkValue` field. The sync script is now the single source of truth for both light and dark token values.

**Cross-category note:** Also documented as FB-087 (design) — playground colors page restructure.

---

## Session: 2026-04-03 — Label component created without playground page or sidebar entry

### ENG-102: "I don't see the label component being there in the playground shell"

**Date:** 2026-04-03

**Issue:** Created the `Label` component (`src/components/ui/Label/`) with full implementation (6 sizes, 2 emphasis levels, polymorphic `as` prop, 5 slot types) and added it to the main site's UI barrel export. Did not create a playground page, did not add it to the sidebar navigation, and did not add it to `archive/registry.json`. The component was invisible in the playground.

**Root Cause:** Same as ENG-101 — process failure. The component creation was treated as complete after TypeScript compilation + linter checks, without running the Cross-App Parity Checklist. This is the 3rd occurrence of EAP-007 in this project (ENG-004: ScrollSpy, ENG-101: Input rebuild, ENG-102: Label creation). The pattern is consistent: the agent considers the component "done" after it compiles and exports, without checking the playground surface.

**Resolution:** Created `playground/src/app/components/label/page.tsx` with 7 demo sections (Size x Emphasis matrix, Leading Content, Secondary Text, Trailing Content, Info Tooltip Slot, Polymorphic Rendering, Full Composition) plus a complete PropsTable documenting all 11 props. Added sidebar entry in the "Base > Inline" group. Added registry entry in `archive/registry.json`. Ran the mandatory flush-and-restart protocol (EAP-042): killed server, deleted `.next`, restarted, verified HTTP 200 and confirmed all section headings + SCSS module classes present in the HTML response.

**Principle extracted -> EAP-007 (3rd violation): The three occurrences share a common behavioral gap — the "definition of done" for component work stops at compilation, not at visibility. EAP-007 already documents this but the agent continues to skip the playground step. The Cross-App Parity Checklist exists in AGENTS.md but is not being run at end-of-task.**

**Cross-category note:** None — this is purely an engineering process issue.

---
