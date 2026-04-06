# Engineering Feedback Log

> **What this file is:** Chronological record of recent engineering incidents and feedback sessions (last 30 entries). Newest entries first.
>
> **Who reads this:** AI agents at session start (scan recent entries for context), and during incident response (check for recurring patterns).
> **Who writes this:** AI agents after each incident resolution via the `engineering-iteration` skill.
> **Last updated:** 2026-04-06 (ENG-125: Hero image re-upload missing + dimension mismatch)
>
> **For agent skills:** Read only the first 30 lines of this file (most recent entries) for pattern detection.
> **Older entries:** Synthesized in `docs/engineering-feedback-synthesis.md`. Raw archive in `docs/engineering-feedback-log-archive.md`.

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
