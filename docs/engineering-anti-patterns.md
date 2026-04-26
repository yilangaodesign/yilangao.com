<!-- graph metadata for docs knowledge graph (see docs/knowledge-graph.md) -->
---
type: anti-pattern
id: engineering-anti-patterns
topics:
  - engineering
  - guardrail
enforces:
  - engineering.md
references:
  - engineering-feedback-log.md
---

# Engineering Anti-Patterns

> **What this file is:** A catalog of engineering mistakes that caused incidents or wasted time, documented so they are never repeated. Each anti-pattern includes the trigger, why it's wrong, and the correct alternative.
>
> **Who reads this:** AI agents before making code changes — scan for relevant anti-patterns.
> **Who writes this:** AI agents when an incident reveals a new anti-pattern.
> **Last updated:** 2026-04-26 (EAP-123: Missing `prose-paragraph-spacing` on HTML prose container — CSS resets strip `<p>` margins, so Lexical richText containers render paragraphs flush unless the container class explicitly includes `@include prose-paragraph-spacing`. Mixin created in `src/styles/mixins/_layout.scss`, applied to `.introBlurbBody`, `.sectionBody`, `.sliderText`. Orphaned `.legacyDescriptionText` deleted. ENG-202, ENG-203. Prior: EAP-122: Audit invariants and their enforcer constants drifting silently — spec doc and enforcer script re-declare the same threshold, the enforcer is softened in-place when reality bites, but the spec is never updated. Both halves continue passing their own self-checks because the enforcer evaluates against itself, not the doc. Fix: single source of truth (enforcer reads doc at runtime); fallback policy (round actual down to nearest 5%, update spec, never soften the constant in place); empirical-floor formulas tested before being locked. ENG-230. Prior: 2026-04-24 (EAP-121 updated: absolute popovers on stacked charts must not sit under a parent `overflow: hidden` (ENG-211); add a hover bridge or `overflow: visible` + verify paint order. Prior: EAP-121: Stacked chart tooltips — per-segment `onMouseLeave` + popover anchored above thin hit targets clears hover as soon as the pointer moves toward the label or tooltip (`pointer-events: none` does not bridge the gap). Fix: `onPointerMove` / `onPointerLeave` on the parent stack with Y-based segment resolution (heights sum to stack pixel height) and side-anchored popover. ENG-210. Prior: EAP-120: Client analytics `init` only in parent `useEffect` while children call `track` in `useEffect` — passive effects run child-before-parent on mount; Mixpanel threw on `before_track` before `init`. Fix: render-time `init` in provider + `initialized` guards on wrappers. ENG-209. Prior: EAP-119 updated: added read-path counterpart `denormalizePayloadLinks()` — CMS data in Payload link format (`{ fields: { url } }`) must be converted back to `@lexical/link` format (`{ url }`) before passing to `LexicalComposer`'s `editorState`, otherwise `LinkNode.__url` is undefined and `MarkdownShortcutsPlugin` crashes with "Cannot read properties of undefined (reading 'match')". ENG-197. Prior: EAP-119 original: `markdownToLexical()` produces `@lexical/link` `LinkNode` serialization (`{ type: "link", url }`) which is incompatible with Payload's `convertLexicalToHTML` `LinkHTMLConverter` that reads `node.fields.url`. Fix: `normalizePayloadLinks()` post-conversion transform inside `markdownToLexical()`. ENG-195. Prior: EAP-118: Programmatic cross-block focus in a multi-`LexicalComposer` page without blurring the outgoing Lexical editor before native `window.getSelection()` calls — overlaps Lexical's frozen committed `Point`s and throws `Cannot assign to read only property 'key' of object '#<Point>'`. Fix: `queueMicrotask` + `getNearestEditorFromDOMNode(activeElement)?.blur()` + `requestAnimationFrame` + target `focus()`. ENG-194. Prior: EAP-117: Uploading macOS-native HEVC (`hvc1`) / QuickTime-branded MP4s without transcoding — macOS screen capture / QuickTime Player / Screen.Studio / iOS exports all emit H.265 with codec tag `hvc1` inside a `major_brand=qt  ` container. Safari on macOS/iOS decodes `hvc1` natively via VideoToolbox, so the author sees the video play fine on their machine. **Every other browser stack (Chrome/Edge on non-Apple hardware, Firefox on every OS, Edge without the paid HEVC extension) cannot decode `hvc1`.** In Chromium the typical failure mode is that the first IDR frame decodes via a software fallback — so `<video>.readyState >= 2` fires and our `MediaRenderer` skeleton clears — and then every subsequent frame fails to decode with no error thrown. The visible symptom is "frozen on the first frame." The entire runtime stack (video element attributes, MediaRenderer component, Supabase `content-type` / `accept-ranges` / CDN headers) is correct in this failure; the defect lives in the MP4 container itself. ENG-192 surfaced this on every case-study video — 14/14 files in the `media` bucket were `hevc|hvc1|qt  ` with `moov` at the end of the file. Correct alternative: every `.mp4` uploaded to the `media` bucket MUST be H.264 (`avc1`) + AAC (or `-an`) + `mp42` major brand + fast-start (`moov` before `mdat`). Author-side normalization: `ffmpeg -i in.mp4 -c:v libx264 -crf 20 -preset slow -pix_fmt yuv420p -c:a aac -b:a 128k -movflags +faststart -brand mp42 out.mp4`. Pre-upload verification: `ffprobe -v error -show_entries stream=codec_name,codec_tag_string -show_entries format=major_brand some.mp4` must return `h264 / avc1 / mp42`. Local "plays fine" verification is a false positive when the author is on macOS and every downstream viewer is not — media verification must include a non-Apple browser path or an `ffprobe codec_tag` assertion. Server-side transcoding deliberately not adopted: Vercel serverless lacks ffmpeg; managed video (Mux / Cloudflare Stream) is overkill for a ~14-video portfolio; current guardrail is doc-level (`docs/engineering/storage.md` §12.4.1). Follow-up if video volume grows: Payload `beforeChange` hook on the `Media` collection that parses the first ~64 KB of the upload, reads the `ftyp` atom, and rejects `codec_tag_string=hvc1` or `major_brand=qt  ` — no transcoding, soft block at the admin layer. Media & Asset Delivery category 3 → 4.) Prior: EAP-116: Hover-reveal rule scoped to a CSS Module that doesn't own the triggering class — a selector written in module A references `.foo` (hoping to match an element whose `className` comes from module B) and compiles to `.A_foo__HASH_A:hover .A_target__HASH`, which matches nothing in the DOM. No lint or compile warning fires because Sass sees valid identifiers; CSS Modules hash each source file's class names independently; the mismatch between "selector" and "element class" is only observable at render-time by absence of effect. `BlockToolbar` was permanently invisible and non-interactive on every case-study page because its hover-reveal lived in `inline-edit.module.scss` but the wrapper carried `styles.blockWrapper` from `page.module.scss`. The correct pattern — already used by the sibling `.sectionToolbar` in the same file — anchors the reveal to an unscoped data-attribute (`[data-block-admin]:hover > &, [data-block-admin]:focus-within > &`) which survives CSS-Module hashing by construction. Whenever a CSS-Module-scoped toolbar / overlay / menu must reveal on hover/focus of a wrapper whose class is owned by a different module, the reveal selector MUST be anchored to an HTML data-attribute, not to a class name. The data-attribute is the portable anchor; the class name is not. Selector-side mirror of EAP-102 (class-name-from-the-wrong-module silent bug — `styles.foo` resolves to `undefined` when the imported module doesn't export `foo`): EAP-102 covers "element receives no class"; EAP-116 covers "element receives a class but is targeted by a selector in a module that hashes its identifier differently." ENG-190. Build / Toolchain / CSS category 14 → 15.) Prior: EAP-115: Fix verification deferred to "next live session" under Webpack HMR staleness — when a fix touches structural React patterns inside a client component (hook shape changes like `useMemo` → `useState`, added refs, restructured `useEffect` dep arrays, reordered imports from `react`), Next.js 16 Webpack HMR silently fails to deliver the new module graph to the running browser. If the dev-server process is older than the fix, and the fix closeout defers browser verification to "next live session" while relying on HTTP 200 + server logs, the user perceives the fix as not working because the runtime never received it. Safeguard: any fix that changes React hook shape inside a client component MUST force a clean dev-server restart (kill the process, `rm -rf .next`, re-start) and MUST verify the fix markers are present in the compiled chunk (grep for a distinctive string from the edit inside `.next/dev/static/chunks/...`) before the fix is marked resolved. ENG-189, strengthens EAP-042 (Turbopack/playground equivalent) and EAP-113 (grep-for-rule without behavioral check). ENG-188's TypeErrors recurred verbatim because the main-site dev server had been running 12h23m — it booted before the ENG-188 edits landed, and Webpack HMR never delivered the structural changes. Fresh restart + bundle-content grep confirmed the fix IS live. Verification Discipline category 1 → 2.) Prior: EAP-114: Lexical `initialConfig` with `useMemo` + Lexical plugin commands registered on non-stable effect deps — React 19 StrictMode double-invokes the first render pass and reuses `useMemo` results across both mounts, making two mount attempts share the same `LexicalEditor` config; separately, plugin `useEffect`s that call `editor.registerCommand(...)` and include props/callbacks with fresh-each-render identity tear down and re-register commands on every parent render, which interleaves with in-flight updates and transforms against Lexical 0.41's frozen committed selection, producing `Cannot assign to read only property '_cachedNodes' of object '#<RangeSelection>'` and `Cannot assign to read only property 'key' of object '#<Point>'`. Caught by `LexicalErrorBoundary`, so editors keep working — but loud console noise that indicates a real timing hazard on markdown shortcuts and undo/redo. Canonical fix per Lexical maintainer etrepum (facebook/lexical#6040): use `useState(() => config)` for `initialConfig`, not `useMemo`; and route all non-editor deps through refs so command-registration effects depend only on `[editor]`. Payload 3.80–3.83 pin Lexical 0.41.0 in `dependencies`, so upgrading Lexical in isolation would duplicate the package — the anti-pattern must be addressed on the integration side. ENG-188. CMS / Inline Edit category 8 → 9.) Prior: EAP-113: Verification by grep-for-expected-rule without behavioral check — a same-day fix can ship a false positive when the verification step confirms the intended CSS rule is present in the compiled bundle but never reloads the page to confirm the rule produces the intended behavior. ENG-183's verification grep-extracted `border-width: 2px` inside `:focus-within` and declared success; it did not notice that the surrounding token (`$portfolio-border-width-regular`) had silently become `2px` since the fix was originally designed, rendering the override a no-op AND the adjacent `--_border-offset: 0 → 1` flip an active jitter source. ENG-184 paid the cost hours later. Safeguard: any CSS-behavior fix must be verified by loading the page and observing the behavior, not by grep-extracting the rule. A rule's rendered effect depends on every token it references, every cascade that follows it, and the current DOM state hierarchy — none of which a grep can see. Also: EAP-112 strengthened — a revert of a refactor regression must re-read the matching anti-pattern file (if one was promoted) before authoring the new code; the anti-pattern may explicitly forbid what the revert is about to restore, as happened with AP-057 and ENG-183.) Prior: EAP-112: Token-renaming refactor silently drops companion state-override declarations — when a sweep converts literal CSS values to token references (e.g. `border: 1px solid` → `border: $portfolio-border-width-regular solid`) adjacent lines that encode state-specific overrides (`border-width: 2px` on `:focus-within`) or scoped CSS custom properties (`--_border-offset: 1px` inside `:focus-within`) can read as redundant and get pruned. These are behavioral overrides, not duplicate declarations. Safeguard: for any component whose recent feedback log entries describe a state-specific value change, a refactor PR must show the state override is still present or explain why it was removed. Failure shape: a one-file minor diff that silently removes a behavioral override shortly after a documented fix for that exact behavior — here, `fde660a` dropped FB-088's `border-width: 2px` and mis-scoped `--_border-offset: 1px` from both `.regular` and `.minimal` `:focus-within` blocks, collapsing the Input's resting/hover/focus hierarchy to identical 1px borders and permanently shrinking padding by 1px on all four sides. Prevention: pair-review the pre-refactor test expectations, not just the post-refactor tokenization. ENG-183.) Prior: EAP-110: Reorder-only DnD on a 2-D layout — DnD handlers read only `over.id` and call a pure-reorder primitive, so any operation that needs to change a *relationship* between dragged and target (join a row, split a row, nest, re-parent) silently no-ops. Fires whenever the data model has a relationship bit (row/column/parent pointer) and the layout is 2-D. Fix requires three coordinated changes: (1) intent capture in `handleDragOver` reading `dx`/`dy` between `active.rect` and `over.rect` centers, (2) an atomic transform primitive that does splice + bit flip in one patch, not splice + post-hoc normalize, (3) expanded `dropPosition` vocabulary (`'before' | 'after' | 'left' | 'right'`) so the visual hint can reflect the intent on the axis that matches the layout. ENG-179.) Prior: EAP-108: Gated todo never re-probed after the gate clears — a task blocked on an operational condition (dev server down, data not yet migrated, external quota) gets marked `pending`/`blocked` and the work moves on. When the gating condition later resolves, nothing automatically re-probes; the gated todo sits indefinitely and the feature it gates ships as "done from the code side" while the runtime is still broken. ENG-176 landed a per-image DnD refactor that required the imageGroup → atomic migration to have run; the `run-migration` todo was gated on the EAP-042 dev-server instability and never re-probed when the server recovered. Result: the user tested on live imageGroup data and saw zero DnD change because none of the atomic-image render branches were reachable. Prevention: when declaring a feature complete, re-check every gated todo that mentions the feature's runtime dependencies; a gated todo is feature-incomplete, not workstream-complete. ENG-177. EAP-109: Flat-model migration drops empty slots from a union-ish source model — when moving from (container with N filled children + M scaffold slots) to (flat sequence of atoms), picking `N if N > 0 else M` silently drops the scaffold slots the moment any child is filled. The migration looks clean on empty and fully filled containers but deletes author-declared slot intent on partially filled ones — exactly the most common live state. Fix: iterate `max(N, M)`; emit filled slots with media and empty slots with their label. Prevention: before a union-to-flat migration ships, write out the transform against (a) empty, (b) partially filled, (c) fully filled, (d) over-scaffolded (more labels than images) — and verify each case individually. ENG-177.) Prior: EAP-107: Sortable unit locked to the visual unit rather than the data unit — after the atomic-image migration, `displayIds` and `handleDragEnd` in `ProjectClient.tsx` emitted one id per display-item (one per row-of-N-images) even though the data atom was a single `image` block. Drag worked mechanically but users could not move individual images inside a row, pull one out to split, or reorder within. Three iterations (ENG-171 merge heuristic → ENG-174 revert → ENG-175 optimistic state) all validated block-level DnD against the wrong target. Fix: flattened `displayIds` to one id per `contentBlocks` entry; added `blockIdToCmsIndex`; rewrote `handleDragEnd` as a single-block move; wrapped each image inside a multi-image row in its own `<SortableBlock>`; switched to `rectSortingStrategy`; added `normalizeImageRowBreaks` helper invoked from both reorder primitives in `useBlockManager`. Lesson: at DnD design time, the sortable id list must be flat at the data-atom level. If the data atom is smaller than the visual container, locking the sortable to the container permanently splits what should be a single affordance into a drag + parallel surface (buttons, heuristics). Grouping is a rendering concern; sortability is a data concern. ENG-176.) Prior: EAP-106: Heuristic whose discriminating signal is invariant across the dominant data distribution — ENG-171 shipped a merge-on-drop heuristic that compared horizontal centers of the dragging row and the over row, with the assumption that side-drops would show a different horizontal offset than above/below-drops. After the atomic-image migration, every image block defaults to `rowBreak: true` so every row renders at full page width, giving every pair of rows identical horizontal centers. The heuristic fired on 100% of drops, silently rerouting every reorder into a merge. Fix: reverted the merge branch in `handleDragEnd`; drag is reorder-only. `mergeImageRangeIntoRow` retained in `useBlockManager` for a future explicit merge UI. Lesson: before shipping a heuristic, write down its discriminating signal's variance on the dominant data distribution — when variance is near zero, switch to explicit UI rather than stacking defensive gates. ENG-174.) Prior: EAP-105: Integer scaffolding values carried forward without re-ranking — the `order` field on every project's `update-*/route.ts` was set once at scaffold time and never revisited. New projects claimed the next free integer; old projects kept their original rank. Result: the home page's case-study order encoded CMS-migration sequence rather than portfolio narrative priority for ~21 days. Any integer-ranking field that lives across N files MUST be re-validated against the full set whenever any one file changes. ENG-168 / CFB-038 / CAP-031.) Prior: EAP-102 (class-name-from-the-wrong-module silent bug — `styles.foo` resolves to `undefined` when the imported CSS Module doesn't export `foo`. Browser and compiler stay silent; the rule looks right, the DOM looks unstyled. EAP-103: hand-rolled `<button>` / `<div onClick>` in admin or CMS overlay surfaces — every destructive or state-mutating control inside an inline-edit overlay must compose `@ds/Button`, `@ds/DropdownMenu`, `@ds/Tooltip`, and the destructive path must go through §14 (`useConfirm` + `toast.undoable`); ENG-162.) Prior: EAP-101 (sparse-array PATCH bodies from `setNested({}, fieldPath, value)` on array-indexed paths serialize with leading `null`s and crash Payload with HTTP 500; ENG-165.)

## Category Index

| Category | Entries | Status | Count |
|----------|---------|--------|-------|
| Cross-App Parity & Token Sync | EAP-001, EAP-004, EAP-005, EAP-007, EAP-028, EAP-041 | 6 active | 6 |
| Playground | EAP-006, EAP-037, EAP-038†, EAP-042, EAP-055 | 5 active | 5 |
| CMS / Payload Schema | EAP-015, EAP-019, EAP-021, EAP-026, EAP-030, EAP-033, EAP-034, EAP-062, EAP-090 | 8 active · 1 resolved | 9 |
| CMS / Inline Edit | EAP-016, EAP-023, EAP-029, EAP-091, EAP-092, EAP-093, EAP-102, EAP-103, EAP-114, EAP-118 | 10 active | 10 |
| Save Flow / Error Handling | EAP-017, EAP-018, EAP-020, EAP-024, EAP-101 | 5 active | 5 |
| Hydration / SSR / React State | EAP-013, EAP-014, EAP-022, EAP-054, EAP-056, EAP-120 | 6 active | 6 |
| Build / Toolchain / CSS | EAP-011, EAP-012, EAP-031, EAP-035, EAP-038‡, EAP-039, EAP-040, EAP-069, EAP-072, EAP-077, EAP-078, EAP-080, EAP-088, EAP-112, EAP-116, EAP-123 | 16 active | 16 |
| Verification Discipline | EAP-113, EAP-115, EAP-122 | 3 active | 3 |
| Documentation Process | EAP-008, EAP-010, EAP-027, EAP-032, EAP-094 | 5 active | 5 |
| Dev Workflow | EAP-002, EAP-003, EAP-009, EAP-068, EAP-073, EAP-108 | 6 active | 6 |
| Interaction / DOM | EAP-025, EAP-036, EAP-053, EAP-106, EAP-107, EAP-110, EAP-121 | 7 active | 7 |
| Deployment / CI Build | EAP-060, EAP-061, EAP-079 | 3 active | 3 |
| Media & Asset Delivery | EAP-098, EAP-099, EAP-100, EAP-117 | 4 active | 4 |
| Data Migration | EAP-109 | 1 active | 1 |
| **Total** | | **77 active · 1 resolved** | **78** |

> † EAP-038 "One-Way Playground Experiment" · ‡ EAP-038 "SCSS Modules with `@use` Under Turbopack" — duplicate ID, two distinct entries.

---

<a id="eap-123"></a>
## EAP-123: Missing `prose-paragraph-spacing` on HTML prose container

**Status: ACTIVE**

**Trigger:** Creating a new CSS class that wraps `dangerouslySetInnerHTML={{ __html: ...Html }}` from a Payload Lexical field or any other HTML-rendered prose.

**Why it's wrong:** The site's CSS resets strip browser-default paragraph margins. Lexical richText emits separate `<p>` elements for each paragraph, but without explicit `p + p` spacing on the container, they render flush - paragraphs are semantically separate but visually merged into a wall of text. This was caught on `.introBlurbBody` (ENG-202) and fixed inline, but the same bug existed on `.sectionBody` and `.sliderText`.

**Correct alternative:** Add `@include prose-paragraph-spacing;` to the class. The mixin lives in `src/styles/mixins/_layout.scss` and defaults to `$portfolio-spacer-3x` (24px). Pass a smaller `$gap` for smaller text sizes (e.g., `$portfolio-spacer-2x` for `body-sm`).

**Note:** Components using CSS custom properties (e.g. `TestimonialCard` via the design system package) cannot import this SCSS mixin. They must handle `p` spacing locally.

**Incident:** ENG-202 (2026-04-26, intro blurb). ENG-203 (2026-04-26, systematic fix across all containers).

---

<a id="eap-120"></a>
## EAP-120: Client analytics `init` only in a parent `useEffect` while children `track` in `useEffect`

**Status: ACTIVE**

**Trigger:** A root provider calls `analyticsSDK.init(...)` inside `useEffect`, while a deeply nested page component calls `analyticsSDK.track(...)` inside its own `useEffect` on mount.

**Why it's wrong:** On mount, React runs passive effects **depth-first from child to parent**. The child's `track()` runs before the parent's `init()` effect, so the SDK's internal state (e.g. Mixpanel's hook table) is still uninitialized and `track` throws.

**Correct alternative:** Run `init` during the provider's **client render** (guarded with `typeof window !== "undefined"`) so it completes before children render and before any `useEffect` in the subtree runs. Optionally add `if (!initialized) return` at the boundary of every public `track`/`identify` wrapper so missing-provider call sites fail closed without throwing.

**Incident:** ENG-209 (2026-04-24, `mixpanel-browser` `before_track` undefined).

---

<a id="eap-121"></a>
## EAP-121: Stacked-segment `mouseLeave` + tooltip anchored outside the hit target

**Status: ACTIVE**

**Trigger:** A stacked column chart (flex `column-reverse` or similar) renders one DOM node per slice, each with `onMouseEnter` / `onMouseLeave` to toggle a tooltip. The tooltip is `position: absolute` with `bottom: calc(100% + Npx)` (above the slice) and `pointer-events: none`.

**Why it's wrong:** The slice’s painted height is often only a few pixels to tens of pixels tall. The moment the user moves the cursor vertically toward the tooltip, the pointer leaves the slice’s box and `mouseLeave` fires, clearing state before the tooltip can be read. `pointer-events: none` on the tooltip means the tooltip does not extend the interactive surface.

**Correct alternative:** Attach `onPointerMove` and `onPointerLeave` to the **parent stack** container. From `getBoundingClientRect()` and `clientY`, compute which segment the pointer sits in using cumulative heights proportional to values; add any floating-point remainder to the last slice so the partition covers the full stack height. Anchor the tooltip where it stays visible: ensure **no ancestor** between the popover and the viewport uses `overflow: hidden` that clips the popover’s paint box (`overflow: visible` on the stack and chart row is typical). If the tooltip sits **above** the stack, add an invisible **hover bridge** (extra absolutely positioned child or padding box) so the pointer path from segment to tooltip does not fire `pointerLeave` on the stack. Side anchoring (`left: 100%`) is fine only after verifying overflow and horizontal room.

**Incident:** ENG-210 (2026-04-24, `MaturityTimeline` value popover flashed and disappeared). ENG-211 (2026-04-24, popover clipped to invisibility by `.barStack { overflow: hidden }` after side positioning).

---

<a id="eap-122"></a>
## EAP-122: Audit invariants and their enforcer constants drifting silently

**Status: ACTIVE**

**Trigger:** A spec doc (e.g. `docs/knowledge-graph.md` §17) declares a quality target as a hardcoded number ("75% raw tagging rate"), and a separate enforcer script (`scripts/audit-docs.mjs`) re-declares the same number as a hardcoded constant (`MIN_RAW_RATE = 0.75`). Over time, the two values drift — the script is softened in-place when the target proves unachievable, but the spec doc is never updated. Both halves continue to "pass" their own self-checks: the spec reads as authoritative, the enforcer reports green, and no failure surface exposes the gap.

**Why it's wrong:** The spec and the enforcer encode the same invariant in two places without a shared source. When reality forces one side to change, the other side does not change in lockstep — and there is no mechanism to detect the drift. In Plan B the enforcer was softened from 0.75 → 0.35 to make the audit pass at 43.3%, but the spec still claimed 75%. Anyone reading the spec saw a strict standard; anyone reading the audit output saw a passing system; both readers were misled. The drift was invisible because the enforcer evaluated against itself, not against the doc. This is a class of bug that survives every individual audit run because both halves are internally consistent.

**Correct alternative:**

1. **Single source of truth.** The spec doc is the authority. The enforcer reads thresholds from the doc at runtime — never re-declares them. In `audit-docs.mjs` this is `loadTaggingInvariants()` parsing the §17 invariants table.

2. **Fallback policy when reality forces a softening.** If the empirical floor is unachievable:
   - Round the *actual achieved rate* down to the nearest 5%.
   - Update the **spec** to that floor, with a dated note explaining why.
   - The enforcer automatically picks up the new floor on the next run.
   - Never soften the constant in place. Never let the spec say one thing and the enforcer enforce another.

3. **Drift detection.** If a value must be hardcoded in both places (e.g. for performance), add a startup assertion that compares the two and fails loudly on mismatch. Better: structure the system so duplication is impossible.

4. **Empirical-floor formulas should be tested before being locked.** Plan B's original 75% target came from a formula that assumed full forward-matching coverage; in practice, only ~40% of feedback entries have a defensible AP citation. Before locking a target, sample the workload and confirm the formula's output is achievable.

**Incident:** ENG-230 (2026-04-26, Plan B remediation). The enforcer constant `MIN_RAW_RATE = 0.35` had drifted from the spec's locked 75% target by 40 percentage points. The audit had been "passing" at 43.3% achieved rate for weeks. Adversarial audit caught the gap; resolution sourced thresholds from the doc, applied the fallback policy to set the floor at 40%, and added the empirical-formula bug as a documented note in §17.

**Cross-reference:** Strengthens **EAP-027** (mandatory documentation after every fix) — when a fix softens a threshold, the spec doc MUST be updated in the same commit. Reinforces **EAP-115** (verification by grep without behavioral check) — an audit that evaluates against itself is a structural variant of grep-checking the rule's presence without exercising the rule's intent.

---

<a id="eap-119"></a>
## EAP-119: Using `@lexical/link` `LinkNode` for Content Rendered by Payload's `convertLexicalToHTML`

**Status: ACTIVE**

**Trigger:** `markdownToLexical()` (or any headless Lexical editor that registers `@lexical/link`'s `LinkNode`) produces serialized JSON with link nodes shaped `{ type: "link", url: "...", target, rel, title }`. This JSON is stored in Payload and later rendered by `convertLexicalToHTML` with `defaultHTMLConverters`, whose `LinkHTMLConverter` reads `node.fields.url`, `node.fields.linkType`, and `node.fields.newTab` (Payload's own `LinkNode` shape: `{ type: "link", fields: { url, linkType, newTab } }`).

**Why it's wrong:** Both `@lexical/link` and `@payloadcms/richtext-lexical` export a class named `LinkNode` with the Lexical type string `"link"`. The HTML converter matches on `node.type`, so it finds the converter, but then accesses `node.fields.url` which is `undefined` on `@lexical/link`-style nodes. The result is `<a href="">` with an empty href. No error is thrown. The failure is silent and only visible by inspecting the rendered HTML.

**Correct alternative:** Bidirectional transforms in `src/lib/normalize-lexical-links.ts`:
- **Write path (Lexical -> Payload):** `normalizePayloadLinks()` reshapes `{ type: "link", url }` into `{ type: "link", fields: { url, linkType, newTab } }`. Wired into `markdownToLexical()` (seeding, ENG-195) and `save()` in `LexicalBlockEditor.tsx` (admin editing, ENG-196).
- **Read path (Payload -> Lexical):** `denormalizePayloadLinks()` reshapes `{ type: "link", fields: { url } }` back into `{ type: "link", url, target, rel }`. Wired into `LexicalBlockEditor.tsx` `editorState` init (ENG-197) and `lexicalToMarkdown()` in `content-helpers.ts` (ENG-197).
Both transforms are idempotent, pure functions with no Lexical runtime dependency.

**Prevention:** When two libraries use the same Lexical node type string with incompatible serialization contracts, the integration layer needs transforms in BOTH directions — one for each data flow. A write-path-only bridge (ENG-195/196) leaves the read path broken. Audit all data flows (write, read, headless parse) when adding a bridge transform. Type-string matching masks format mismatches between libraries.

**Incident:** ENG-195 (2026-04-23, write path). ENG-197 (2026-04-23, read path — "Cannot read properties of undefined (reading 'match')" in `LexicalBlockEditor` when loading CMS richText blocks containing links).

---

<a id="eap-117"></a>
## EAP-117: Uploading macOS-Native HEVC (`hvc1`) / QuickTime-Branded MP4s Without Transcoding

**Status: ACTIVE**

**Trigger:** An `.mp4` file is uploaded to the `media` Payload collection (Supabase Storage backend) without first being transcoded to browser-portable H.264. The file comes from macOS screen capture, QuickTime Player, Screen.Studio, an iOS export, or any other Apple-native tool that defaults to H.265/HEVC inside a QuickTime-branded container. `ffprobe` reports `codec_name=hevc`, `codec_tag_string=hvc1`, `major_brand=qt  ` (or `iso6` without `mp42`), and typically `moov` at the end of the file.

**Why it's wrong:**

- **`hvc1` is not universally supported.** Safari on macOS/iOS decodes `hvc1` natively via Apple's VideoToolbox. Every other major browser stack cannot:
  - **Chrome / Edge on Windows & Linux:** no `hvc1` support out of the box (HEVC is hardware-gated, and the Chromium media stack does not expose the `hvc1` bitstream format to hardware decoders on those platforms).
  - **Firefox on every OS:** no HEVC support (patent/licensing policy).
  - **Edge on Windows with the "HEVC Video Extensions" Microsoft Store add-on:** possible, but it's a paid extension the viewer has to install.
  - **Chrome on Android:** device-dependent; most phones expose HEVC hardware decode but Chrome's media pipeline is inconsistent.
- **The failure mode is silent and misleading.** In Chromium on non-Apple hardware, the first IDR frame often decodes via a software fallback, which means `<video>.readyState >= HAVE_CURRENT_DATA` fires, `MediaRenderer`'s `onLoadedData` clears the skeleton, and the element appears loaded. Every subsequent frame then fails to decode — no `error` event, no console output, no network error, just a frozen first frame. The entire surrounding stack (video attributes, React component, Supabase HTTP response) is correct during this failure.
- **Local "plays fine" verification is a false positive.** The author is on macOS and sees the video play in Safari or Chromium-on-Apple-Silicon (which can decode `hvc1` via the system decoder). Every downstream viewer who is not on macOS sees a broken video. The author's local test is *worse* than no verification because it signals green.
- **`major_brand=qt  ` compounds the problem.** Even in environments that can decode HEVC, the QuickTime brand (no `mp42` / `isom` compatible brand listed) can throw strict media stacks into a fallback parser path. A proper MP4 should carry `mp42` or `isom` as major brand (or as a compatible brand) to advertise "this is a general-purpose MP4, not Apple-specific."
- **`moov` at end (non-fast-start) is a secondary issue.** The CDN supports range requests so modern browsers handle it, but initial playback latency is longer and some older stacks struggle. Not fatal on its own, but should be fixed alongside the codec in the same transcode step.

**Documented incident:** ENG-192 (2026-04-22). User reported a case-study loop video (`LW-IA-Motion-1776835105622.mp4` on `/work/lacework-ia`) frozen on the first frame in production. Diagnostic: `ffprobe` on the public Supabase URL returned `hevc | hvc1 | qt  | moov-at-offset-5838298-of-5860497-bytes`. Spot-probed 8 of the 14 `.mp4` files in the `media` bucket; all 8 matched the same profile. Treated as a systemic upload-pipeline defect: batch re-encoded all 14 videos via `ffmpeg -c:v libx264 -crf 20 -preset fast -pix_fmt yuv420p -c:a aac -b:a 128k -movflags +faststart -brand mp42` (silent videos used `-an` in place of the AAC pipeline), re-uploaded via boto3 against `S3_ENDPOINT` under the same object keys so every CMS media reference stayed valid. Per-file re-encode wall time ≈1s on Apple Silicon; source 38.1 MB → output 27.5 MB.

**Correct alternative:**

1. **Author-side normalization before every `.mp4` upload.** Run the portfolio's canonical ffmpeg command (also documented in `docs/engineering/storage.md` §12.4.1):

   ```bash
   ffmpeg -i input.mp4 \
     -c:v libx264 -crf 20 -preset slow -pix_fmt yuv420p \
     -c:a aac -b:a 128k \
     -movflags +faststart -brand mp42 \
     output.mp4
   ```

   For silent captures (UI-motion loops with no audio track on the source), replace the audio pipeline with `-an` rather than synthesizing a silent AAC stream. For files that are already H.264 but have the wrong brand or trailing `moov`, use the faster remux path `ffmpeg -i in.mp4 -c copy -movflags +faststart -brand mp42 out.mp4` — no re-encode, near-instant.

2. **Pre-upload assertion.** Before marking a video-upload task done, run:

   ```bash
   ffprobe -v error \
     -show_entries stream=codec_name,codec_tag_string \
     -show_entries format=major_brand \
     -of default=noprint_wrappers=0 some.mp4
   ```

   Must return `codec_name=h264`, `codec_tag_string=avc1`, and `major_brand=mp42`. Any other combination blocks the upload.

3. **Cross-browser smoke test for any video-related change.** Local verification must include at least one non-Safari, non-macOS-Chromium browser path — either open the page in Firefox on the same Mac (Firefox does not use Apple's HEVC decoder regardless of host OS), or `ffprobe` the served URL and assert the codec tag is `avc1`. Relying on the author's default browser on the author's default machine is the exact failure mode this entry exists to prevent.

4. **Systemic prevention if video volume grows.** The current strategy is doc-level guardrail + author-side normalization because Vercel serverless doesn't ship ffmpeg, and a managed video pipeline (Mux, Cloudflare Stream) is overkill for a ~14-video portfolio. The next step, if video count ever materially grows or if a non-engineer starts authoring content, is a Payload `beforeChange` hook on the `Media` collection that parses the first ~64 KB of the upload (enough to see the `ftyp` atom) and rejects uploads with `codec_tag_string=hvc1` or with `major_brand=qt  ` and no `mp42`/`isom` compatible brand. This is a codec sniff, not a transcode — it runs entirely in the existing serverless budget and blocks the defect at the point of upload rather than at the point of playback.

**Failure shape:** (1) author records on macOS → file has `hvc1` + `qt  ` + trailing `moov`; (2) author uploads file to Payload admin without transcoding; (3) author previews on their own Mac in Safari or macOS-Chromium → video plays → author marks the task done; (4) production visitor on Windows/Linux/Firefox/Android opens the page → first frame decodes via fallback → every subsequent frame fails → visitor sees a frozen poster with no error; (5) the entire React / CDN / HTTP stack is correct, so debugging chases the component tree instead of the media container.

**Detection commands:**

```bash
# 1. List every .mp4 in the media bucket and print codec + brand.
#    Run from the repo root. Requires the main-site dev server or a Payload REST key.
curl -s "http://localhost:4000/api/media?limit=200" | \
  python3 -c "import json,sys; \
    docs=json.load(sys.stdin).get('docs',[]); \
    [print(d['filename']) for d in docs if (d.get('mimeType') or '').startswith('video/')]" | \
  while read f; do \
    curl -s "https://lrjliluvnkciwnyshexq.supabase.co/storage/v1/object/public/media/$f" \
      -o /tmp/_probe.mp4 && \
    line=$(ffprobe -v error \
      -show_entries stream=codec_tag_string \
      -show_entries format=major_brand \
      -of default=noprint_wrappers=1:nokey=1 /tmp/_probe.mp4 | paste -sd '|' -); \
    echo "$f | $line"; \
  done

# 2. Any row whose line does NOT match ^.*\|avc1\|.*\|mp42$ is a defect.
```

---

<a id="eap-116"></a>
## EAP-116: Hover-Reveal Rule Scoped to a CSS Module That Doesn't Own the Triggering Class

**Status: ACTIVE**

**Trigger:** A descendant element (toolbar, overlay, menu, tooltip) is styled in `featureA.module.scss` with `opacity: 0` + `pointer-events: none` by default and is revealed on hover/focus of a wrapper element. The author writes the reveal as a class combinator inside the same module — `.wrapper:hover .child { opacity: 1; pointer-events: auto }` — and the wrapper element in JSX gets its class from a *different* CSS Module (`import pageStyles from './page.module.scss'; <div className={pageStyles.wrapper}>`). The author assumes the `.wrapper` identifier in the selector will match the DOM's class; it does not.

**Why it's wrong:**

- **CSS Modules hash each source file's class names independently.** `.wrapper` in `featureA.module.scss` compiles to `featureA_wrapper__HASH_A`; `.wrapper` in `page.module.scss` compiles to `page_wrapper__HASH_B`. The selector `.wrapper:hover .child` in `featureA.module.scss` becomes `featureA_wrapper__HASH_A:hover featureA_child__HASH_C` — it matches any DOM element that has the `featureA_wrapper__HASH_A` class. If no element in the app ever receives `featureA.wrapper` (because the JSX imports the wrapper class from `page.module.scss`), the selector is dead code: syntactically valid, never matches, no warning.
- **No lint or compile-time signal fires.** Sass sees `.wrapper` as a valid identifier; CSS Modules hashes it regardless of whether the identifier is ever consumed; the compiled CSS is valid; the browser resolves the selector against the live DOM, finds nothing, and silently yields. The only observable failure is behavioral — "the overlay never appears" — and the overlay's baseline styles (opacity 0, pointer-events none) are themselves working correctly, so debugging reads as "the overlay is hidden, why?" instead of "the reveal rule never matches."
- **Grep-on-source misleads.** Searching the repo for `.wrapper` finds the selector in `featureA.module.scss` and the JSX className in `ProjectClient.tsx`, both referencing the string `wrapper`. A source-level review looks consistent. The bug only surfaces when you extract the *compiled* CSS from `.next/dev/static/css/...` and observe that the selector's hash prefix doesn't match the DOM element's hash prefix. This is the same diagnostic step EAP-102 requires, but applied to the selector side rather than the element side.
- **The fix pattern was already present in the same file and was not followed.** `inline-edit.module.scss` had a parallel `.sectionToolbar` with the correct pattern: `[data-section-admin]:hover > & { opacity: 1; pointer-events: auto }`. The author of `.blockToolbar` copied the default-hidden rule but wrote the reveal as a local class combinator. Anti-pattern is therefore not just "you wrote the wrong thing" — it's "you wrote the wrong thing next to a demonstration of the right thing."

**Documented incident:** ENG-190 (2026-04-21). `BlockToolbar` (insert-above, move-up/down, H-level, delete) was mounted on every case-study admin view but permanently invisible and non-interactive. User reported inability to delete the ETRO scope-statement block. Delete logic (`useBlockManager.deleteBlock` / `confirmDeleteBlock` / `BlockToolbar.onClick`) was entirely correct — the button never received pointer events because the compiled CSS anchor `.inline-edit_blockWrapper__78R_Q:hover .inline-edit_blockToolbar__W7mD7` matched no element in the DOM. The real wrapper class was `page_blockWrapper__KOHF3`.

**Correct alternative:**

1. **Anchor cross-module reveal rules to an HTML data-attribute on the wrapper.** `[data-block-admin]:hover > &, [data-block-admin]:focus-within > & { opacity: 1; pointer-events: auto }` inside the child's declaration. The data-attribute is an unscoped global identifier; it survives CSS-Module hashing; it matches the wrapper regardless of which module owns the wrapper's class.
2. **Set the data-attribute at the JSX level, conditionally on the state that should activate the reveal.** `<div {...(isAdmin ? { 'data-block-admin': '' } : {})}>` — public viewers never carry the attribute and therefore never see hover-active admin controls. Keep the wrapper's class from `page.module.scss` intact; the two styling systems coexist cleanly.
3. **When two similar hover-reveal patterns exist in the same module and one is correct (uses data-attribute), the other must be too.** Before writing a new `:hover` reveal for any child of a wrapper that could live in a different module, grep the file for existing `[data-*]:hover > &` patterns and mirror them.
4. **Bundle-content verification for CSS-Module fixes.** After the fix, flush the dev server's CSS cache (`rm -rf .next` on the main site, `rm -rf playground/.next` on the playground), restart, force a compile of the affected page, and `grep` the compiled CSS for the portable anchor. Example: `grep "data-block-admin" .next/dev/static/css/.../page.css` must return the expected rule text — not just the attribute name, but the full `[data-block-admin]:hover > .FEATUREA_child__HASH, [data-block-admin]:focus-within > .FEATUREA_child__HASH { opacity: 1; pointer-events: auto }`.

**Failure shape:** (1) a CSS Module defines a default-hidden child and relies on `.wrapper:hover &` to reveal it; (2) the wrapper's JSX class comes from a different module; (3) no lint, no compile warning, no console error; (4) the user reports "the control doesn't work" and debugging chases the control's logic instead of its visibility; (5) compiled CSS grep reveals the selector references a hash-prefix that matches no DOM element. This is the selector-side mirror of EAP-102 (element-side: `styles.foo` resolves to `undefined` when the imported module doesn't export `foo`).

**Detection script:**
```bash
# For any CSS Module whose selectors reference class names in their own module:
# if the matching JSX imports that class name from a different module, flag it.
# Heuristic: grep for `.foo:hover .bar` combinators in any `*.module.scss`, then
# confirm that `styles.foo` (from the same module's default import) is consumed
# somewhere in the JSX tree under the same wrapper as `styles.bar`.
# A manual pre-flight check suffices for now; automating is tractable but not
# yet wired.
```

---

<a id="eap-115"></a>
## EAP-115: Fix Verification Deferred to "Next Live Session" Under Webpack HMR Staleness

**Status: ACTIVE**

**Trigger:** A fix touches structural React patterns inside a client component — hook shape changes (`useMemo` → `useState`, `useState` → `useRef`), added/removed refs, restructured `useEffect` dep arrays, reordered imports from `react`, or any edit that changes the component's hook-call identity/order across renders. The closeout marks the fix resolved based on (a) the edit appearing on disk (`git diff`, re-reading the file), (b) HTTP 200 from a `curl` against the page, (c) clean server logs. The dev-server process is older than the fix (booted before the edit landed). The matching browser tab was opened before the edit landed and has a stale chunk cached by its HMR WebSocket.

Manifests as: the exact same bug re-reported by the user in a subsequent session / message, verbatim error string, same page, same steps — creating the appearance that the fix was insufficient. The actual cause is that the fix shipped correctly but Next.js 16 Webpack HMR never delivered the new module graph; the running browser is executing pre-fix compiled JavaScript.

**Why it's wrong:**

- **`curl` + server logs prove nothing about a React client-component fix.** Runtime errors from client components fire in the browser, not on the server. Server-side rendering exercises only the initial render path; it does not run the `useEffect` chains, Lexical plugin registrations, or interactive event handlers where the bug lives. HTTP 200 means the server produced markup; it does not mean the browser will produce the same markup (hydration), nor that interactive behavior matches the source.
- **Webpack HMR in Next.js 16 is not reliable for structural React changes.** The project defaults to Webpack (`next dev --webpack`) and Webpack HMR's default heuristic assumes hook-call identity is stable. When a fix changes `useMemo(x, [y])` → `useState(() => x)` inside a client component, Webpack's module graph records the same module ID but the hook call-order is different — React fast refresh either silently discards the HMR update (keeping the old module live in the running editor instance) or re-mounts the component with stale closure bindings. Either way, the runtime does not receive the fix until the dev server is killed and `.next` is deleted.
- **Dev-server age is a load-bearing invariant that was never captured.** The main-site `next dev` process can run for 12+ hours across multiple coding sessions as the editor refactors client components. Nothing in the project's existing guardrails flagged "your dev server is older than your fix; HMR may not have delivered it." EAP-042 covers exactly this failure mode for Turbopack/playground, but the main site is Webpack, so the guardrail was interpreted as not applying. This gap is the anti-pattern.
- **"Deferred to next live session" is not a mitigation.** Hard Guardrail #10 requires browser-level verification before marking a fix resolved. A closeout that writes "deferred to next live session" is a documented shortcut around the guardrail, not a plan. The "next live session" is rarely a dedicated verification pass — it's the next time the user surfaces a symptom, which by construction is either "the fix worked" (never communicated) or "the fix didn't work" (the entire verification burden now falls on the user, who cannot distinguish "fix is broken" from "HMR is stale").

**Documented incident:** ENG-189 (2026-04-22). ENG-188 shipped a canonical Lexical maintainer-recommended fix (`useMemo(initialConfig, [fieldPath])` → `useState(() => config)` in `LexicalBlockEditor.tsx`, four `useRef`s added for plugin non-editor deps, two `useEffect` dep arrays collapsed to `[editor]`, a `useMemo` wrap added around `useBlockKeyboardNav`'s return object). Verification ended at HTTP 200 + server-log grep. Browser verification was explicitly deferred to "next live session." The next live session was a user message ~10 minutes later reporting the exact same two `TypeError`s — identical error strings, same page. Root cause was the 12h23m main-site dev server: it had booted before the ENG-188 edits landed, Webpack HMR never delivered the structural hook-shape change, and the browser was executing the pre-fix bundle. Clean restart + `.next` deletion + compiled-chunk grep for the four distinctive `navRef` / `blockIndexRef` / `targetRef` / `fieldPathRef` names confirmed the fix was in the served bundle post-restart. The fix itself was correct; the delivery step was skipped.

**Correct alternative:**

1. **Any fix that changes React hook shape inside a client component forces a clean dev-server restart.** Kill the dev process on the affected port (`lsof -ti :4000 | xargs kill -9`), delete `.next/` (or `playground/.next/` as applicable), re-start the dev server, wait for Ready, force a compile of the affected page with `curl`. Do this as part of the fix workflow, not as a "nice to have." The restart is the default, not the escape hatch.
2. **Bundle-content verification replaces grep-on-source verification for client-component fixes.** Grep the compiled chunk under `.next/dev/static/chunks/...` for a distinctive string from the edit (a new variable name, a unique comment, a changed template literal). If the marker is not present, the bundle did not absorb the change and further restart / cache-clearing is required. If the marker IS present, the fix is live in the served JavaScript — independent of any browser tab's cached state.
3. **Browser verification is mandatory for any client-component hook-shape change.** If a browser-use subagent or equivalent is available, open the page, exercise the affected surface, and read the console for the specific error strings. If no automation is available, ask the user to hard-refresh the tab (Cmd-Shift-R) against the freshly-restarted server and report back — this is different from "please hard refresh" as a generic deflection, because the restart + bundle grep have already proven the fix is live; the refresh is just purging the browser's HMR chunk cache.
4. **"Deferred to next live session" is banned as a fix-closeout phrase.** If runtime verification cannot complete in the current session, the fix is not resolved; it is in-flight. Feedback log entries for in-flight fixes stay labeled "Resolution pending (browser verification)" and the next session re-opens that entry rather than starting a fresh ID.

**Why the Turbopack guardrail didn't transfer:** EAP-042 mandates flush-and-restart for the playground because Turbopack HMR is explicitly unreliable. Webpack HMR on the main site is documented as *more* reliable than Turbopack, and the project's default mental model treated Webpack HMR as trustworthy. That mental model is correct for most changes — component content edits, CSS, new files, deleting code. It is NOT correct for structural hook-shape changes in client components, which is a narrower class than "any client-component edit." EAP-115 is specifically about this narrow class.

**Failure shape:** (1) structural hook-shape edit to a client component, (2) dev server is older than the edit, (3) fix closeout relies on server-side signals (HTTP 200, log grep, `git diff`), (4) "deferred to next live session" on browser verification, (5) next user message reports the same bug verbatim. The fourth and fifth points are the observable signature.

**Prevention checklist for any fix that changes hook shape in a client component:**
- [ ] Kill dev-server process on affected port before declaring fix resolved.
- [ ] `rm -rf .next` (or the app-specific `<app>/.next`).
- [ ] Re-start dev server, wait for Ready.
- [ ] `curl` the page to force fresh compile, confirm HTTP 200.
- [ ] Grep `.next/dev/static/chunks/<route>/page.js` for a distinctive marker from the edit.
- [ ] If browser automation available: open page, exercise affected path, inspect console.
- [ ] If not: explicitly ask user to hard-refresh (Cmd-Shift-R) and report back within the same session.
- [ ] Do NOT write "deferred to next live session" in the feedback log closeout.

**Incident:** ENG-189 (2026-04-22).

---

<a id="eap-114"></a>
## EAP-114: Lexical `initialConfig` via `useMemo` + Plugin Commands Registered on Non-Stable Effect Deps (React 19 StrictMode Frozen-Selection Errors)

**Status: ACTIVE**

**Trigger:** Custom Lexical editor in a React 19 / Next.js 16 app where (a) `LexicalComposer`'s `initialConfig` is created with `useMemo`, or (b) a custom Lexical plugin component registers commands in a `useEffect` whose dep array includes a prop or callback that is re-referenced across renders (e.g., a fresh object literal returned from a hook each render, or a prop derived from parent state). Manifests as console `TypeError`s of the form:

- `Cannot assign to read only property '_cachedNodes' of object '#<RangeSelection>'`
- `Cannot assign to read only property 'key' of object '#<Point>'`
- `Cannot assign to read only property 'dirty' of object '#<RangeSelection>'`

The errors fire from inside Lexical internals (`setCachedNodes`, `Point.set`, `getWritable`, reconcile/transform paths) and are caught by `LexicalErrorBoundary`, so the editor keeps working — but they're loud console noise and indicate a real timing hazard.

**Why it's wrong:**

- React 19 StrictMode (default-on in Next.js 16 dev) double-invokes the first render pass. Per the React changelog and Lexical maintainer etrepum in facebook/lexical#6040: *"`useMemo` and `useCallback` will reuse the memoized results from the first render during the second render. Previously, separate `LexicalEditor` instances would be created for first and second renders, but now they are sharing the same `LexicalEditor` so chaos ensues."* The recommended canonical fix is `useState(() => config)` — the lazy initializer runs once per actual mount, and Lexical's internal `useState(() => createEditor())` then wires up cleanly.
- Lexical 0.41 dev-mode freezes the committed `EditorState`'s selection objects (`anchor`, `focus`, and the `RangeSelection` itself) via `Object.freeze()` to catch accidental mutations of prior state. When an effect re-registers commands while a transform or update is in flight (teardown → register interleaves with `$beginUpdate` / `$applyTransforms`), a command handler can end up running against the frozen prior-state selection and try to mutate it — producing the errors above. Undo/redo and markdown-shortcut transforms are the two most common surfaces (facebook/lexical#6290, #6843).
- Our codebase is pinned to Lexical 0.41 by Payload 3.80's `dependencies` (not peerDeps), so the Lexical-side fixes in 0.42+ (#7836 cache coherency, #8230 strict-mode commands-log cleanup) cannot be adopted in isolation without duplicating Lexical in the bundle. The fix must be on *our* integration code.

**Documented incident:** ENG-188 (2026-04-21). `src/components/inline-edit/LexicalBlockEditor.tsx` used `useMemo([fieldPath])` for `initialConfig`; `BlockNavPlugin` re-registered KEY_BACKSPACE/ARROW_UP/ARROW_DOWN on every parent render because its `nav` prop (from `useBlockKeyboardNav`) was a fresh `{ ... }` literal each render; `SaveOnBlurPlugin` re-registered `BLUR_COMMAND` on every parent render because `target` and `fieldPath` were in the dep array. On the `/work/[slug]` case-study editor, frequent parent-state churn (DnD, toasts, inline-edit state) drove the re-registration loop, and the frozen-selection errors surfaced on markdown shortcuts and undo/redo.

**Correct alternative:**

1. **Use `useState(() => config)` for `LexicalComposer`'s `initialConfig`**, not `useMemo`. The lazy initializer runs once per mount; StrictMode double-render cannot alias configs across mount attempts. Treat `initialState` and `namespace` as mount-time constants; if they need to change, remount via a React `key` on the parent.
2. **Lexical plugin effects that call `editor.registerCommand(...)` or add DOM listeners to the root must depend only on `[editor]`** (plus stable refs — `useRef` / `RefObject` have identity stability by definition). All other values (callbacks, props, state reads) go through refs: keep a `fooRef = useRef(foo)`, update it in a separate `useEffect(() => { fooRef.current = foo }, [foo])`, and read `fooRef.current` inside the command handler. Commands then register exactly once per editor instance.
3. **When returning a callback object from a custom hook** (e.g., `useBlockKeyboardNav` returning `{ onBackspace, onUp, onDown }`), wrap the object in `useMemo` over the same deps as the callbacks, so consumers get stable identity. This matters any time a downstream consumer has the object in an effect dep array — which plugins often do.
4. **If you must have an effect re-run when a prop changes**, split it: a stable-dep effect that registers the command, and a separate effect that updates a ref the handler reads. Never re-register a Lexical command in response to a prop change if the command handler can read the new value from a ref.

**Why Lexical 0.42+ is not a safer default here:** Even when Lexical 0.42 is adopted, the *user-code* patterns above (memoized config, command churn on parent re-renders) remain hazardous. Payload 3.80–3.83 pin Lexical to exactly 0.41.0, so upgrading Lexical in isolation would produce two Lexical instances (one for admin, one for frontend) — a worse failure mode. The anti-pattern is the code shape, not the Lexical version.

**Failure shape:** Custom Lexical plugin with `useEffect(() => { ... editor.registerCommand(...); return () => unregister(); }, [editor, somePropOrCallback])` where `somePropOrCallback` is a fresh reference across parent renders, + `LexicalComposer initialConfig` built with `useMemo`. StrictMode double-mount + command teardown/register churn + frozen committed selection = the two TypeErrors above firing from Lexical internals, caught by `LexicalErrorBoundary`, editor keeps working, console fills up with noise.

**Prevention:** When writing a Lexical plugin component, the command-registration effect's dep array MUST contain only `[editor]` and values with referentially stable identity (refs, values from `useLexicalComposerContext`, module-scoped constants). If a code-review diff adds any other value to that dep array, the reviewer must either (a) prove stable identity, (b) refactor the new value through a ref, or (c) justify the churn. The `initialConfig` prop of `LexicalComposer` MUST be built with `useState(() => ...)`, never `useMemo`.

**Incident:** ENG-188 (2026-04-21).

<a id="eap-118"></a>
## EAP-118: Native `Selection` moves across Lexical editors without blurring the outgoing surface

**Status: ACTIVE**

**Trigger:** A page mounts **multiple** `LexicalComposer` instances (one per rich-text block). A keyboard bridge (`BlockNavPlugin`, custom command, or structural shortcut) calls `element.focus()` and then `window.getSelection().selectAllChildren` / `collapseToEnd` on the next block's `contenteditable` **in the same turn** or first animation frame after a Lexical command returns, without explicitly blurring the editor that still owns the active Lexical root.

**Why it's wrong:** After each update, Lexical dev mode freezes the committed `RangeSelection`'s `anchor` and `focus` `Point`s (`Object.freeze`). If native DOM selection APIs run while Lexical is still reconciling or mapping DOM selection onto the prior state's selection, internal code paths can call `Point.set` on those frozen objects, producing `Cannot assign to read only property 'key' of object '#<Point>'`. This is **orthogonal** to EAP-114's command-churn pattern — ENG-188 can be fully fixed and this path can still fire.

**Correct alternative:** Defer with `queueMicrotask` (or `setTimeout(0)`), call `getNearestEditorFromDOMNode(document.activeElement)?.blur()` from the public `lexical` export, then `requestAnimationFrame` before `focus()` plus native selection placement on the target editor.

**Prevention:** Any helper that moves focus between Lexical roots must document this ordering in its module comment and must not call `selectAllChildren` until the outgoing Lexical surface has blurred.

**Incident:** ENG-194 (2026-04-23).

---

<a id="eap-112"></a>
## EAP-112: Token-Renaming Refactor Silently Drops Companion State Overrides

**Status: ACTIVE**

**Trigger:** A refactor sweep converts literal CSS values to design-system token references (e.g. `border: 1px solid X` → `border: $portfolio-border-width-regular solid X`) across a batch of component SCSS files. Adjacent lines that encode *state-specific* overrides (`border-width: 2px` on `:focus-within`, `box-shadow: none` on `:active`, `transform: scale(0.98)` on `:active`, etc.) or scoped CSS custom properties (a `--_offset: 1px` declared inside a pseudo-class selector) read as duplicate or "already handled" and get pruned alongside the rename.

**Why it's wrong:** The pruned lines are not redundant — they encode a *behavioral* difference between states. A token-renaming refactor is supposed to be a no-op for rendered pixels; silently dropping a state override changes behavior without the commit, the PR description, or the subsequent test pass ever acknowledging the change. The component then renders a single-state visual where it used to render a multi-state hierarchy, and the regression is invisible to smoke tests that only load the default state. The failure is *particularly insidious* when the dropped override was itself the resolution of a prior documented feedback entry — the loop closes silently in the wrong direction.

**Documented incident:** `fde660a` (2026-04-11, "refactor: update UI component styles and APIs") altered `src/components/ui/Input/Input.module.scss` with a 10-line diff that (a) renamed `1px` → `$portfolio-border-width-regular` and (b) dropped the `border-width: 2px` focus override plus hoisted `--_border-offset: 1px` out of the `:focus-within` block to the container root. FB-088 (2026-04-03, eight days prior) had explicitly shipped a three-state resting/hover/focus grammar with exactly those declarations. Nobody noticed until a user reported the missing thickness variation ten days after the refactor — at which point the fix was a clean revert plus this anti-pattern.

**Correct alternative:**

1. **Read the component's recent feedback log entries before refactoring its styles.** If any recent entry documents a state-specific value change on the component being refactored (search patterns: `border-width`, `box-shadow`, `transform`, `opacity`, `padding-` on `:hover`, `:focus`, `:active`, `:focus-within`, `[data-state=...]`), every line that encodes those state-specific values is load-bearing.
2. **Preserve state-specific overrides as a hard constraint of the refactor.** A token-renaming diff must only change the *source* of a value (literal → token), not the *applicability* of a declaration (dropping a selector, hoisting a scoped variable, collapsing multiple blocks into one).
3. **When a CSS custom property is declared inside a pseudo-class selector, treat its placement as intentional.** Moving `--_foo: Npx` from inside `&:focus-within { ... }` up to the parent ruleset converts a conditional flip into a constant — almost always a behavioral change, rarely a cleanup.
4. **Pair-review the pre-refactor behavior, not just the post-refactor diff.** The diff review question is "does this still do what it did before?" — not "does this compile?"

**Incident:** ENG-183 (2026-04-21) — Input's FB-088 three-state border hierarchy silently reverted by a token-renaming refactor.

**Amendment (2026-04-21, post-ENG-184):** A *revert* of a refactor regression must re-read the matching anti-pattern file before authoring the new code. The anti-pattern may explicitly forbid what the revert is about to restore. ENG-183 reverted `fde660a` and attempted to restore FB-088's original `border-width: 1px → 2px` three-state grammar — but AP-057 had been promoted *specifically to forbid* that grammar after ENG-136 proved it caused jitter in flex-centered parents. ENG-183 restored the anti-pattern, shipping a fresh jitter regression hours before the user reported it (ENG-184). The revert is not a mechanical undo — it is a fresh authoring task subject to the full Pre-Flight doc reading (§ anti-patterns, § feedback log, § design principles) just like any other change to the same component.

---

<a id="eap-113"></a>
## EAP-113: Verification by Grep-for-Expected-Rule Without Behavioral Check

**Status: ACTIVE**

**Trigger:** Confirming a CSS, config, or serialization fix by running `grep` / `rg` / a programmatic string-extract against the *output* of the build (compiled CSS bundle, generated JSON, rendered HTML) to check that the intended rule or property is present, then declaring the fix verified — without loading the page in a browser and observing the behavior.

**Why it's wrong:** A rule's rendered effect depends on every token it references, every cascade rule that follows it, the current DOM state hierarchy, and the computed context of its parent. Grep sees the rule's *presence*, not its *effect*. The most common failure shape: the rule references a CSS custom property or SCSS variable whose value has silently changed since the rule was designed, so the grep-confirmed declaration now produces a completely different pixel result than the author assumed. Second most common: a later rule in the cascade overrides the grep-target rule; third most common: the rule applies but the parent container context (flex alignment, grid template) interprets the change differently than the author pictured. Grep cannot see any of these.

**Documented incident:** ENG-183 (2026-04-21) verified its Input `:focus-within` border-width fix by curl-fetching the compiled playground CSS and grep-extracting the four expected rules:

```
.Input_regular__…:focus-within:not(…)  { border-width: 2px; border-color: bold; --_border-offset: 1px }
.Input_regular__…:hover:not(…)         { border-width: 2px; border-color: bold; --_border-offset: 1px }
.Input_minimal__…:focus-within:not(…)  { border-bottom-width: 2px; border-bottom-color: bold; padding-bottom: calc(py - 1px) }
.Input_minimal__…:hover:not(…)         { border-bottom-width: 2px; border-bottom-color: bold; padding-bottom: calc(py - 1px) }
```

All four present — declared verified. Not checked: the *base* `.Input_regular__… .Input_inputContainer__…` rule had evolved to `border: $portfolio-border-width-regular solid …` where `$portfolio-border-width-regular` now resolved to `2px` (raised from `1px` by ENG-136). So the `border-width: 2px` override in the grep-confirmed focus rule was a no-op — the resting state was already 2px — and the `--_border-offset: 0px → 1px` flip was the only surviving behavioral change. That flip shrank padding by 1px on all four sides on state change, producing the jitter in every flex-centered parent that consumed the Input. The page was never loaded, so the jitter was never seen.

**Correct alternative:**

1. **Never declare a CSS-behavior fix verified on grep alone.** The minimum bar is: load the affected page in a browser (via `browser-use` subagent or equivalent), trigger every state the fix touches (hover, focus, active, checked, disabled), and observe for layout shift, color bleed, and cascade regressions on the target element *and its siblings*. Pay special attention to parent containers with `justify-content`, `align-items`, `grid`, `flex-centered` — they propagate size changes to siblings.
2. **Trace every token reference in the fix.** If the fixed rule mentions a `$variable` or `var(--custom-prop)`, confirm the current resolved value matches the author's mental model. Tokens drift — the value that was `1px` when the fix was designed may be `2px` now.
3. **When the fix was itself a revert of a refactor regression, trace forward: what changed between when the old behavior worked and now?** Token values, adjacent rules, and cascade relationships may all have moved. The "old working CSS" does not necessarily still work in the current context.
4. **For components with documented jitter history, specifically test the flex-centered consumption path.** The component-in-isolation might look fine while the same component in `ComponentPreview` (a flex-centered container) or in a centered card jitters. The playground's own preview pane is exactly such a container — load the playground component page, not just the raw unit.

**Incident:** ENG-184 (2026-04-21) — ENG-183's fix verified by CSS grep alone; the grep-confirmed rules produced invisible thickness change AND active jitter because the `$portfolio-border-width-regular` token had silently moved from `1px` to `2px` since FB-088's original fix. The user discovered the regression the same afternoon.

---

<a id="eap-001"></a>
## EAP-001: Manual Data Duplication Without Sync

**Status: ACTIVE**

**Trigger:** Defining the same data (colors, tokens, config) in multiple files and relying on manual discipline to keep them in sync.

**Why it's wrong:** Humans and AI agents forget. When `_colors.scss` was expanded with 90 new color values and 11 new semantic tokens, the playground's `tokens.ts` was not updated. The user saw nothing new in the playground UI. The data existed in the source of truth but was invisible in the consuming application. Manual duplication creates drift as a certainty, not a risk.

**Correct alternative:** Establish a codegen pipeline. The canonical data lives in one file; downstream files are generated from it. Run `npm run sync-tokens` after modifying `src/styles/tokens/_colors.scss`. The sync script reads SCSS and regenerates the color portion of `playground/src/lib/tokens.ts`.

**Incident:** ENG-001 (2026-03-29) — Playground token drift after Carbon palette expansion.

---

<a id="eap-002"></a>
## EAP-002: Killing Ports Without Checking What's Running

**Status: ACTIVE**

**Trigger:** Running `lsof -ti:PORT | xargs kill -9` as a first resort when a port conflict occurs.

**Why it's wrong:** The process on that port may be a legitimate dev server from another terminal session, another project, or even a production preview. Killing it blindly wastes the time of whoever was using it and can corrupt in-progress builds or lose unsaved state.

**Correct alternative:**
1. Check what's on the port: `lsof -i :PORT -P -n | head -5`
2. Identify the process — is it yours? Is it needed?
3. If stale, kill it. If legitimate, pick a different port.
4. Always read `docs/port-registry.md` first.

---

<a id="eap-003"></a>
## EAP-003: Assuming Dev Servers Persist Across Sessions

**Status: ACTIVE**

**Trigger:** Making code changes and expecting them to be visible without verifying the dev server is running.

**Why it's wrong:** Dev servers crash, terminals close, machines restart. A server that was running in a previous chat session may be dead. If the agent makes changes but doesn't verify on localhost, the user discovers the issue — wasting their time and eroding trust.

**Correct alternative:** At the start of any session involving UI work, verify the relevant dev server is running:
```bash
lsof -i -P -n | grep LISTEN | grep node
```
If no server is running on the expected port, start it before making changes.

---

<a id="eap-004"></a>
## EAP-004: Modifying Source of Truth Without Updating Consumers

**Status: ACTIVE**

**Trigger:** Editing a canonical file (e.g., `_colors.scss`) without updating all files that consume or mirror its data.

**Why it's wrong:** The system appears to work because the source file is correct. But the user sees the downstream output (playground, website, component library), which is stale. The disconnect between "I made the change" and "the user sees the change" is the fundamental failure mode.

**Correct alternative:** Every canonical file must have a documented list of its consumers and a sync mechanism:

| Source | Consumers | Sync |
|--------|-----------|------|
| `src/styles/tokens/_colors.scss` | `playground/src/lib/tokens.ts` | `npm run sync-tokens` |
| `src/styles/tokens/_colors.scss` | `playground/src/app/globals.css` | Manual (light/dark mapping) |
| `src/app/layout.tsx` (font loading) | `playground/src/app/layout.tsx` | Manual — see §6 in `engineering.md` |
| Root `package.json` (font deps) | `playground/package.json` | Manual — see §6 in `engineering.md` |

After modifying any source, run its sync mechanism and verify each consumer.

---

<a id="eap-005"></a>
## EAP-005: Adding Infrastructure to One App Without Propagating to Co-Deployed Apps

**Status: ACTIVE**

**Trigger:** Installing a font package, adding `next/font` loading, or injecting CSS variables in the main app (`src/`) without doing the equivalent in the playground (`playground/`).

**Why it's wrong:** The main app and the playground are separate Next.js apps with independent `package.json` files, layouts, and CSS. Adding a dependency or font pipeline to one does not affect the other. The playground renders design tokens — if the fonts those tokens reference aren't loaded, every font preview silently falls back to generic system fonts. The playground *appears* to work (no errors, no crashes), but the visual output is wrong. This is especially insidious because the token *data* can be correct (`var(--font-geist-sans)`) while the CSS variable is undefined, causing silent fallback.

**Correct alternative:** Treat font and infrastructure changes as a two-app operation:
1. Install the package in both `package.json` files.
2. Add the `next/font` import and CSS variable injection in both `layout.tsx` files.
3. Update both global CSS files to reference the new font variables.
4. Verify the playground preview pages actually render with the new fonts (check response headers for font preload links).
5. Consult the checklist in `engineering.md` §6.3.

**Incident:** ENG-002 (2026-03-29) — Geist fonts loaded in main app but invisible in playground.

---

<a id="eap-006"></a>
## EAP-006: Hardcoded Inline Font Overrides in Component Previews

**Status: ACTIVE**

**Trigger:** Using `style={{ fontFamily: "system-ui, -apple-system, sans-serif" }}` in component preview/demo code within the playground.

**Why it's wrong:** Inline styles have maximum CSS specificity. When the body correctly sets `font-family: var(--font-sans)` (which resolves to Geist), an inline `fontFamily` override on any element silently replaces Geist with system fonts. The component looks "fine" (text renders), but it's not using the design system font. This is especially insidious because: (a) it produces no error, (b) system-ui on macOS looks similar to Geist Sans, making the difference hard to spot visually, and (c) the fix appears to work at the layout level while individual components secretly override it.

**Correct alternative:** Remove all hardcoded `fontFamily` from inline styles. Let the body's Geist font cascade to all children. If a specific component needs a different font family, use Tailwind utility classes (`font-sans`, `font-mono`) which reference the design tokens. Never use `style={{ fontFamily }}` in the playground.

**Detection:** Run `grep -r "fontFamily" playground/src/ --include="*.tsx"` after any font-related change. There should be zero matches in component pages. The only acceptable location is the typography token page where `f.value` (a CSS variable reference) is used for font previews.

**Incident:** ENG-003 (2026-03-29) — 3rd complaint about Geist fonts not visible in playground.

---

<a id="eap-008"></a>
## EAP-008: Documenting Recurring Fixes in Docs Instead of Promoting to Rules

**Status: ACTIVE**

**Trigger:** A category of incident occurs 3+ times. Each time, the fix is documented in `docs/engineering.md` or `docs/engineering-anti-patterns.md`, but the check is never promoted to the rules layer (`AGENTS.md` Hard Guardrails or mandatory protocols).

**Why it's wrong:** Doc files are reference material — the agent reads them at session start but doesn't re-check them mid-task. The rules layer is the enforcement mechanism — items in Critical Guardrails are treated as hard gates the agent checks before considering work complete. Leaving a recurring fix in the docs layer means the agent "knows" the principle but doesn't enforce it. The knowledge exists but isn't actionable at the right moment.

**Correct alternative:** When the same category of incident occurs 3+ times:
1. Stop adding to docs.
2. Add a NEVER/ALWAYS rule to `AGENTS.md` Hard Guardrails.
3. If the check is part of a workflow (e.g., creating artifacts), add it as a mandatory step in `AGENTS.md`.
4. Make it an inline checklist in the rules — not a pointer to "go read this section of this doc."

**Incident:** ENG-005 (2026-03-29) — Cross-app parity failures recurred 3 times despite being documented after incident #1.

---

<a id="eap-007"></a>
## EAP-007: Adding Components to Main Site Without Playground Preview

**Status: ACTIVE**

**Trigger:** Creating a new reusable component in `src/components/` and integrating it into pages, but not creating a corresponding preview page in the playground (`playground/src/app/components/<slug>/page.tsx`) and not adding it to the sidebar navigation. **Also applies to rebuilding an existing component with a significantly expanded API** — the playground page exists but its demos, code examples, and PropsTable are stale and don't cover the new features.

**Why it's wrong:** The playground is the design system documentation UI — it's where components are discovered, previewed, and understood. A component that exists in the main site but not the playground is invisible to anyone browsing the design system. It won't appear in search, won't have a code example, won't have a props table, and won't be verifiable in isolation. This is the component-level equivalent of EAP-005 (infrastructure parity). When a component is rebuilt with many new props, the playground auto-imports the new code via `@ds/*`, but the demos and PropsTable still show the old minimal API — making the new features invisible.

**Correct alternative:** When creating or **significantly rebuilding** any component in `src/components/`:
1. Create or update the preview page at `playground/src/app/components/<kebab-name>/page.tsx` using the established pattern: `Shell` → `SectionHeading` → `ComponentPreview` (with interactive demo + code) → `PropsTable` → behavior notes → file path footnote.
2. When rebuilding: update ALL demos to cover new axes/props, update the PropsTable to document new props, update the SectionHeading description.
3. Add the component to the appropriate category in `playground/src/components/sidebar.tsx` `componentCategories` array (this also makes it searchable via Fuse.js).
4. Add an entry to `archive/registry.json`.

**Detection:** After creating or rebuilding any component: (1) verify playground page exists, (2) compare the component's exported props against the PropsTable entries — any prop not in the table is undocumented.

**Incident:** ENG-004 (2026-03-29) — ScrollSpy created in main site but missing from playground. ENG-101 (2026-04-03) — Input rebuilt with 15+ new props but playground page left showing old 3-prop API.

---

<a id="eap-009"></a>
## EAP-009: Working Directly on `main`

**Status: ACTIVE**

**Trigger:** Starting a coding session and making changes without first creating a feature branch, leaving all work as uncommitted modifications on `main`.

**Why it's wrong:** Three compounding risks:

1. **No rollback boundary.** If the session produces a regression, there's no clean way to revert without manually undoing changes. `main` is in a state that's neither the old version nor a coherent new version.
2. **Concurrent session conflicts.** If a second agent or the user starts a parallel session, both are modifying `main` simultaneously. Git has no mechanism to warn them — the first to commit wins, the second discovers conflicts.
3. **Broken deployment invariant.** `main` should always be deployable. Uncommitted WIP on `main` means you cannot confidently deploy at any moment.

**Correct alternative:** Before making any file changes:
1. Check the current branch: `git branch --show-current`
2. If on `main`, switch to `dev`: `git checkout dev`
3. All work happens on `dev`. Never create new branches.
4. `main` only changes when the user explicitly requests a checkpoint merge.

If you've already made changes on `main`, move them without loss:
```bash
git stash
git checkout dev
git stash pop
```

**Incident:** ENG-006 (2026-03-29) — 15 components, Radix dependency, architecture docs, and playground changes made directly on `main` without a branch, creating rollback risk and blocking safe parallel work.

---

<a id="eap-010"></a>
## EAP-010: Fixing Incidents Without Following Documentation Procedures

**Status: ACTIVE**

**Trigger:** A user reports a bug or build failure mid-task. The agent fixes the immediate problem but does not follow the engineering-iteration skill (Step 5: Close the Loop) — no feedback log entry, no anti-pattern documentation, no engineering.md update.

**Why it's wrong:** The fix itself is only half the value. The other half is the knowledge captured by documentation: what broke, why, and how to prevent it. When an agent context-switches from a current task to fix a bug and skips the documentation step, the incident becomes invisible. The next agent session has no record of it. If the same class of failure recurs, there's no history to detect the pattern.

**Correct alternative:** When a user reports a bug mid-task, treat it as a full engineering incident:
1. Pause the current task (mentally bookmark where you were).
2. Route through the engineering-iteration skill — all 5 steps, including Step 5 (Close the Loop).
3. Document the incident in `docs/engineering-feedback-log.md`.
4. Check if it warrants a new anti-pattern in `docs/engineering-anti-patterns.md`.
5. Resume the original task.

Context-switching does not exempt the agent from documentation procedures.

**Incident:** ENG-008, ENG-012 (2026-03-29) — Occurred 3 times in one session. Escalated to Hard Guardrail #1 in `AGENTS.md`: "NEVER respond to the user after fixing a bug or incident without FIRST completing all documentation steps."

---

<a id="eap-011"></a>
## EAP-011: Node.js Built-in Imports in next.config.ts (Next.js 16)

**Status: ACTIVE**

**Trigger:** Importing Node.js built-in modules (`path`, `url`, `fs`, etc.) in `next.config.ts` when using Next.js 16.

**Why it's wrong:** Next.js 16 compiles `next.config.ts` into `next.config.compiled.js` via a bundler. When the bundler encounters Node.js built-in imports, it emits CommonJS-style `require()` and `exports` in the output. However, the compiled file is executed in an ESM scope, causing `ReferenceError: exports is not defined in ES module scope`. The server starts, reports "Ready", and then immediately crashes — making it look like a runtime error rather than a config error.

**Correct alternative:**
1. Do not import Node.js built-ins (`path`, `url`, `fs`) in `next.config.ts`.
2. If you need `__dirname`, use `import.meta.dirname` (available in Node.js 21.2+) — but only if the config compilation supports it.
3. For `sassOptions.includePaths`, modern sass resolves `@use` from `node_modules` automatically — the explicit `includePaths` pointing to `node_modules` is unnecessary.
4. Keep `next.config.ts` minimal: type imports and framework wrappers (like `withPayload`) only.

**Detection:** If `npm run dev` starts ("Ready") then immediately crashes with "exports is not defined", check `next.config.ts` for Node.js built-in imports.

**Incident:** ENG-007 (2026-03-29) — `import path from "path"` and `import { fileURLToPath } from "url"` in next.config.ts caused immediate crash on Next.js 16.2.1.

---

<a id="eap-012"></a>
## EAP-012: Installing Alternate Node Versions via Brew Without Checking Shared Library Impact

**Status: ACTIVE**

**Trigger:** Running `brew install node@22` when `node` (v25) is already installed and linked. Brew upgrades shared dependencies (e.g., `simdjson`) to versions incompatible with the existing linked Node.

**Why it's wrong:** Brew's dependency resolution for the new formula can upgrade shared C libraries (simdjson, icu4c, etc.) that the existing linked Node binary was compiled against. This breaks the primary `node` binary with `dyld: Library not loaded` errors, making `npm`, `npx`, and all Node-dependent commands crash.

**Correct alternative:**
1. Use `nvm` or `fnm` for managing multiple Node versions — they install self-contained binaries that don't share system libraries.
2. If using brew, run `brew reinstall node` immediately after installing an alternate version to rebuild against the updated shared libraries.
3. Always verify `node --version && npm --version` work after any brew node-related install.

**Incident:** ENG-015 — `brew install node@22` broke Node 25 via simdjson library version mismatch.

---

<a id="eap-013"></a>
## EAP-013: Script Tags in React 19 / Next.js 16 Component Trees

**Status: ACTIVE**

**Trigger:** Rendering a `<script>` element in any React component tree — via raw `<script>`, `dangerouslySetInnerHTML`, or `next/script` (`<Script>`).

**Why it's wrong:** React 19 warns about `<script>` tags during client-side hydration. **Every approach that puts a script element in the React tree triggers this warning:**
1. `<script dangerouslySetInnerHTML>` — warned in both server and client components (ENG-017, ENG-018)
2. `<Script>` from `next/script` — still renders a `<script>` element in the tree (ENG-018 follow-up)
3. Third-party libraries like `next-themes` that inject `<script>` elements (ENG-017 original)

This was misdiagnosed twice: first recommending `dangerouslySetInnerHTML` in server components, then recommending `next/script`. Both still trigger the warning.

**Correct alternative:** Do not render any `<script>` element in the React tree. For theme initialization (preventing dark mode flash):
1. Use a custom `ThemeProvider` that reads localStorage and applies the class via `useEffect`.
2. Add `suppressHydrationWarning` to `<html>` so the theme class mutation doesn't cause hydration errors.
3. Accept a one-frame flash on initial load — imperceptible in practice, and the only approach that avoids React 19 warnings.

If a blocking script is truly required (analytics, third-party SDK), use `next/script` with `strategy="afterInteractive"` or `lazyOnload` — these inject scripts after hydration and avoid the warning. `beforeInteractive` still triggers it.

**Incident:** ENG-017, ENG-018, ENG-019 — three attempts to fix the same warning, each time discovering a new approach also fails.

---

<a id="eap-014"></a>
## EAP-014: Server/Client Branch Causing Hydration Mismatch

**Status: ACTIVE**

**Trigger:** Using `typeof window !== "undefined"` or `window.location` to conditionally render different text or elements in a client component.

**Why it's wrong:** During SSR, `window` is undefined, so the server renders one branch. During client hydration, `window` exists, so the client renders the other branch. React detects the mismatch and throws a recoverable error: "Hydration failed because the server rendered text didn't match the client." The page still works (React re-renders the client tree), but it's a performance hit and a console error.

**Correct alternative:** Use `useState` with a server-safe default + `useEffect` to detect client-only values after mount:
```tsx
const [isLocal, setIsLocal] = useState(false);
useEffect(() => {
  setIsLocal(window.location.hostname === "localhost");
}, []);
```

The initial render matches the server (false). After mount, `useEffect` updates to the correct client value. No hydration mismatch.

**Incident:** ENG-019 — `DesignSystemFootnote` branched on `window.location.hostname`, causing "Local Dev" prefix to appear on client but not server.

---

<a id="eap-015"></a>
## EAP-015: Bare `src/` Paths in Payload Admin Config

**Status: ACTIVE**

**Trigger:** Specifying a Payload admin component path (e.g. `beforeLogin`, `afterLogin`, custom views) using a bare string like `'src/components/admin/Foo'`.

**Why it's wrong:** Payload copies the string verbatim into the generated `importMap.js` as an ES import specifier. Turbopack cannot resolve bare `src/...` paths — they're not relative, not aliased, and not in `node_modules`. This causes a `Module not found` build error that blocks both the admin panel and any SSR page touching the import map.

**Correct alternative:** Use the `@/` path alias: `'@/components/admin/Foo'`. The alias is defined in `tsconfig.json` and resolved by both TypeScript and the bundler.

**Incident:** ENG-019

---

<a id="eap-016"></a>
## EAP-016: Conditional Rendering That Hides Inline-Editable Empty State

**Status: ACTIVE**

**Trigger:** Using `{cmsValue ? <EditableText>{cmsValue}</EditableText> : <p>hardcoded fallback</p>}` for an inline-editable field.

**Why it's wrong:** When the CMS field is empty (null, undefined, or empty string), the conditional renders the non-editable fallback. The user sees text on the page but can't edit it — the exact moment they need inline editing most (initial population) is the moment it's unavailable. This creates a chicken-and-egg problem: you can't populate the field because the editable component only appears when the field is already populated.

**Correct alternative:** Always render the EditableText component, passing the CMS value or a placeholder string as children: `<EditableText ...>{cmsValue || "Placeholder text"}</EditableText>`. The placeholder is displayed when empty and replaced on first edit.

**Incident:** ENG-028 — bio paragraph on home page was not editable because CMS bio was empty.

---

<a id="eap-017"></a>
## EAP-017: Panel "Done" That Only Stages Without Saving

**Status: ACTIVE**

**Trigger:** A modal/panel edit UI has a "Done" or "Close" button that writes changes to local state only, requiring a separate "Save" action elsewhere on the page to actually persist to the backend.

**Why it's wrong:** Users universally expect the primary action button on a panel to complete the operation. A two-step stage-then-save workflow is a dark pattern that guarantees data loss: the user thinks they've saved, navigates away, and their changes vanish. The bottom save bar may be hidden behind the modal or go unnoticed.

**Correct alternative:** Panel action buttons must persist changes directly to the backend. If a global save bar exists for single-field edits (like `contentEditable` text), array panels should bypass it and call the save API directly when the user clicks "Save & Close". Use `flushSync` to ensure React state is current before the API call.

**Incident:** ENG-030 — EditableArray "Done" button staged data but never saved; user lost Teams edits.

---

<a id="eap-018"></a>
## EAP-018: React `useCallback` Save That Reads Stale `dirtyFields` Closure

**Status: ACTIVE**

**Trigger:** A `save()` function created with `useCallback(..., [dirtyFields])` that reads `dirtyFields` from its closure, called immediately after a `setFieldValue()` that queues a state update.

**Why it's wrong:** React 18+ batches state updates. `setFieldValue()` queues a `setDirtyFields(prev => ...)` update but doesn't apply it synchronously. The `save()` callback still sees the OLD `dirtyFields` from the previous render. It saves zero changes and succeeds silently. This is especially insidious because there's no error — the save just does nothing.

**Correct alternative:** Maintain a `dirtyRef = useRef(dirtyFields)` that is updated synchronously inside the state setter: `setDirtyFields(prev => { ...; dirtyRef.current = next; return next })`. The `save()` function reads from `dirtyRef.current`, which always has the latest value regardless of React's batching schedule. This makes `save()` callable immediately after `setFieldValue()`.

**Incident:** ENG-030 — `save()` silently saved zero changes because `dirtyFields` closure was stale.

---

<a id="eap-019"></a>
## EAP-019: Single-Layer CMS Field Changes

**Status: ACTIVE**

**Trigger:** Adding a field to the Payload schema, or to the frontend TypeScript type / inline edit fields, without updating all three layers of the CMS data stack (schema → data fetch → UI).

**Why it's wrong:** CMS data flows through three layers that form a single contract: (1) Payload schema defines what the admin panel shows and the database stores, (2) the `page.tsx` data fetch maps CMS data to props, (3) the `*Client.tsx` TypeScript types + inline edit `*_FIELDS` definitions control what the frontend renders and what's editable. A field added to only one or two layers creates silent drift:
- Schema has it, frontend doesn't → admin panel shows a field the user fills in, but it never appears on the site.
- Frontend has it, schema doesn't → inline edit lets you type, but save silently drops the value (field doesn't exist in DB).
- Data fetch skips it → CMS has the data, frontend type expects it, but it's always undefined/empty.

This class of bug is especially dangerous because there are no error messages — the system "works" but silently loses data.

**Correct alternative:** Run the **CMS-Frontend Parity Checklist** (in `AGENTS.md`) after every field change. The checklist maps what you did → what you must also do across all three layers. After schema changes, always restart the dev server (Payload syncs DB schema on startup only).

**Incident:** ENG-031 (systemic, 5th in category) — `clients[].url` existed in CMS but not in frontend; `teams[].period` existed in code but not in running DB due to missing server restart.

---

<a id="eap-020"></a>
## EAP-020: Raw API Response Bodies as User-Facing Error Messages

**Status: ACTIVE**

**Trigger:** Throwing `new Error(\`Failed: ${response.status} — ${await response.text()}\`)` and displaying the result directly in the UI.

**Why it's wrong:** The raw response body from Payload (or any API) is a structured JSON object with internal field paths, validation error arrays, and technical terminology. Users see gibberish. The error message is designed for server logs, not for the person trying to save their work. This violates the separation between internal diagnostics and user-facing communication.

**Correct pattern:** Parse the structured error response, extract the user-relevant parts (which field, what's wrong), translate internal names to UI-visible labels, and assemble a natural-language sentence. Keep the raw response available in console logs for debugging, but never surface it in the UI.

**Example:**
- Bad: `Failed to update global:site-config: 400 — {"errors":[{"name":"ValidationError","data":{"errors":[{"label":"Links > Social Links 1 > Href","message":"This field is required"}]}}]}`
- Good: `Could not save — Social Link 1 → URL is required.`

---

<a id="eap-021"></a>
## EAP-021: Over-Zealous Required Constraints That Block Partial Saves

**Status: ACTIVE**

**Trigger:** Marking CMS fields as `required: true` based on data completeness ideals rather than user flow requirements.

**Why it's wrong:** A required field that blocks saving forces the user to complete the entire form in one session. This prevents partial progress — users can't save a placeholder item (e.g. a link with a label but no URL yet) and come back later. The "required" constraint should reflect whether the system genuinely cannot function without the value, not whether the value is "nice to have." For a link, a missing URL means the link isn't clickable yet — but the label is still meaningful as a placeholder.

**Correct pattern:** Only mark a field as `required` if the item is meaningless without it (e.g. a link without a label has no identity). All other fields should be optional at the schema level. Use client-side UI cues (asterisks, inline hints) to indicate which fields are recommended, without preventing saves.

**Example:**
- Bad: `socialLinks[].href` is `required: true` → user can't save "Resume" as a link placeholder
- Good: `socialLinks[].label` is `required: true` (a link needs a name), `href` is optional (URL can be added later)

---

<a id="eap-022"></a>
## EAP-022: Index-as-Key on Draggable Lists Breaks Re-Grab

**Status: ACTIVE**

**Trigger:** Using `key={index}` in `Array.map()` for a drag-and-drop reorderable list.

**Why it's wrong:** When items are reordered, React reconciles by key. With `key={index}`, keys never change (0, 1, 2, …) so React reuses the same physical DOM nodes — it updates their props/content rather than creating new elements. The browser retains drag state on the physical DOM node that just completed a drag operation. On the next drag attempt, that node's stale browser drag state prevents `dragstart` from initiating properly. The drag handle appears visually correct but is non-functional for any item that changed position.

**Correct alternative:** Maintain a parallel `itemKeys` state array of stable, unique string IDs (e.g. `fieldId-item-${Date.now()}-${i}`). Initialize keys when the list opens, and keep them in sync with every mutation: reorder the keys array in `reorderItem`, filter it in `deleteItem`, extend it in `addItem`. Use `key={stableKey}` in the render so React creates a fresh DOM node at each position after a reorder.

**Incident:** ENG-036 (2026-03-29) — Drag handle non-functional after first reorder in EditableArray panel.

---

<a id="eap-023"></a>
## EAP-023: Payload `type: 'email'` with contentEditable Inline Editing

**Status: ACTIVE**

**Trigger:** Using Payload's `type: 'email'` field type for a value that is edited inline via `contentEditable`.

**Why it's wrong:** `contentEditable` captures `textContent` from the DOM, which may include trailing whitespace, zero-width spaces, or browser-injected invisible characters. Payload's built-in `email` validator is strict and rejects these. The save silently fails (or shows an error the user doesn't understand), making it appear that inline editing "doesn't work" for email fields.

**Correct alternative:** Use `type: 'text'` with a custom `validate` function that trims whitespace before validation and uses a permissive email regex. Also add `.trim()` to the value captured from `contentEditable` before passing it to the dirty state.

**Incident:** ENG-037 (2026-03-29) — Footer email save appeared to silently fail.

---

<a id="eap-024"></a>
## EAP-024: Error-Swallowing Save Functions

**Status: ACTIVE**

**Trigger:** A `save()` function that catches all errors internally (setting error state) without re-throwing, while callers `await save()` expecting to detect failure.

**Why it's wrong:** Callers like `EditableArray.commitPanel()` use `try/catch` or conditional logic after `await save()` to decide what to do next (e.g., close the panel on success, keep it open on failure). If `save()` catches internally and never re-throws, it always resolves successfully from the caller's perspective. The caller closes the panel, the user thinks the save worked, but it didn't. This is a silent data loss pattern.

**Correct alternative:** `save()` should both set error state (for reactive UI like error bars) AND re-throw the error (for imperative callers). Callers that don't need failure handling (like keyboard shortcuts) should add `.catch(() => {})`.

**Incident:** ENG-038 (2026-03-29) — EditableArray panel closed even when save failed.

<a id="eap-025"></a>
## EAP-025: Nested Anchor Elements

**Status: ACTIVE**

**Trigger:** Wrapping one `<a>` element inside another `<a>` element — e.g. a card link containing a secondary action link.

**Why it's wrong:** Nested `<a>` tags are invalid HTML per the spec. Browsers "flatten" the nesting by closing the outer `<a>` before the inner one, creating unpredictable click targets. The result is that clicks on the card do nothing, or navigate to the wrong destination. There are no console errors — the failure is completely silent.

**Correct alternative:** Use a `<div role="button">` with `onClick` + `onKeyDown` for the outer container, and a single `<a>` for the inner link. Use `e.stopPropagation()` on the inner link to prevent the card's click handler from firing.

**Incident:** ENG-044 — DashboardPages card `<a>` wrapping pencil `<a>` caused clicks to silently fail.

---

<a id="eap-026"></a>
## EAP-026: Cookie-Based Auth Check When Auth Mechanism Doesn't Set Cookies

**Status: ACTIVE**

**Trigger:** Using `cookies().get('payload-token')` to detect whether the user is a Payload admin, when the actual authentication mechanism (auto-login in dev) authenticates server-side without setting a browser cookie.

**Why it's wrong:** Payload's `autoLogin` with `prefillOnly: false` authenticates requests at the framework level — it never issues a `Set-Cookie` header. The `payload-token` cookie only exists when a user manually logs in via the `/admin/login` form. Checking for a cookie that is never set means the auth check always returns `false` in the most common dev workflow. The admin UI (inline editing, admin bar) is permanently hidden, with no error or indication of why.

**Correct alternative:** Layer the auth check:
1. First, check the `payload-token` cookie (covers production manual login).
2. Fall back to checking environment signals: `NODE_ENV !== 'production' && PAYLOAD_ADMIN_EMAIL` is set → auto-login is configured, so the admin UI should be active.
3. Optionally, call Payload's auth API (`payload.auth({ headers })`) for a definitive server-side check.

**Incident:** ENG-046 — Inline editing never activated on the live site despite auto-login being configured.

---

<a id="eap-027"></a>
## EAP-027: Documentation Skips During Rapid-Fire Debugging

**Status: ACTIVE**

**Trigger:** A user reports an issue. The agent fixes it and responds. The user immediately reports another issue (often caused by the first fix). The agent enters a tight fix→respond→fix→respond loop. Documentation is deferred "until the chain of issues is resolved." The chain ends but documentation never happens.

**Why it's wrong:** This is a violation of Hard Guardrail #1 ("NEVER respond to the user after fixing a bug without FIRST completing all documentation steps"). The guardrail already exists. The failure is behavioral, not informational — the agent knows the rule but doesn't follow it under time pressure. Each undocumented incident is lost knowledge. When 3 incidents go undocumented in sequence (as in ENG-044→045→046), the cumulative knowledge loss is substantial: root causes, anti-patterns, and principles that would prevent future occurrences are never captured.

**Why it recurs despite EAP-010 and Hard Guardrail #1:** The rule says "NEVER respond without FIRST documenting." But the agent's behavioral priority system ranks "resolve the user's frustration" higher than "follow documentation procedure." When the user is visibly frustrated ("This is so frustrating and so bad"), the urgency signal overrides the process gate. The rule exists in the right place (Hard Guardrails) but lacks a structural mechanism to enforce it.

**Correct alternative:** The documentation step must be baked into the fix workflow itself, not treated as a separate post-fix step. Specifically:
1. Before writing the code fix, create the feedback log entry stub with Issue + Root Cause.
2. After the fix, fill in the Resolution section and check for anti-patterns.
3. Only then respond to the user.

This makes documentation a pre-condition of the response, not a post-condition.

**Incident:** ENG-044, ENG-045, ENG-046 (2026-03-30) — 3 consecutive incidents resolved without any documentation. 6th occurrence of this pattern across the project (also ENG-008, ENG-012 per EAP-010).

**8th occurrence (2026-04-09):** ENG-142. After a large documentation catch-up (FB-126–130, ENG-136–139), the agent made 6 consecutive changes without documenting any of them. The catch-up batch was treated as a "one-time event" rather than resetting the per-change documentation habit. The trigger was the same: small, "obvious" fixes ("just a token swap", "just a left alignment change") that individually felt too minor for Post-Flight, but collectively represented significant design/engineering decisions.

**9th occurrence (2026-04-09):** ENG-110. Two consecutive fixes in one session (navbar background → Terra10, home page contentWrapper → Terra10) shipped without Post-Flight. The enforcement mechanism from the 6th occurrence (Hard Guardrail #1 sub-rule: "Before writing the fix, create the feedback log entry stub") was not invoked either time. The agent did not even create the stub. This reveals that the structural enforcement is itself unstructured — it relies on the agent remembering to invoke it, which is the same failure mode it was designed to prevent. The task was perceived as trivial ("just a token swap"), which is the exact rationalization documented in the 8th occurrence. Same session, same pattern, same excuse. The enforcement mechanism needs to be elevated from a process instruction to something that interrupts the agent's workflow (e.g., a pre-commit hook, a checklist gating tool use, or a mandatory first step in every task regardless of perceived triviality).

**10th occurrence (2026-04-09):** ENG-146. 5 consecutive architectural changes across one conversation — archiving homepage-v1, removing the masonry grid, moving sidebar content to footer, moving role tagline to nav, restructuring footer layout — all shipped without Post-Flight. **New failure variant:** previous occurrences involved small fixes perceived as "too trivial." This time, the changes were large and deliberate, but perceived as "too in-progress." The agent's mental model was "we're in the middle of building something; I'll document when it's done." But conversational flow has no natural endpoint — each user message adds another change. The "I'll document later" boundary recedes with every new request.

**Pattern summary across 10 occurrences:**
- Occurrences 1-7: Rapid-fire debugging loops (urgency overrides process)
- Occurrences 8-9: Small fixes perceived as too trivial
- Occurrence 10: Large changes perceived as too in-progress

All three rationalizations produce identical outcomes: zero documentation. The common thread is that documentation is treated as a separate activity that can be deferred, rather than an integral part of every response. The enforcement mechanism (Hard Guardrail #1 + EAP-027 sub-rule) has been in place since the 6th occurrence and has been violated every single time since. It is not being read, not being remembered, and not being followed. **The mechanism is dead text.** A fundamentally different approach is needed — one that does not depend on the agent choosing to remember.

---

<a id="eap-028"></a>
## EAP-028: Partial Cross-App Sync on Shared Components

**Status: ACTIVE**

**Trigger:** Modifying a component that exists in both `src/components/` and `playground/src/components/` (or its demo page) but only updating one version and not the other.

**Why it's wrong:** The playground is the design system's public documentation surface. When the playground shows outdated behavior or visuals, it teaches consumers the wrong patterns. Worse, when two versions of the same component diverge over multiple sessions, the drift compounds: each version accumulates fixes the other lacks, making reconciliation increasingly expensive. In this case, the main site had outdated behavior (linear interpolation, no dead zone) while the playground had outdated visuals (no label differentiation, AP-031 centering bug) — neither was the "correct" version.

**Correct alternative:** Every change to a shared component must be applied to ALL codebases atomically in the same session. The Cross-App Parity Checklist covers creation but should be extended to cover modification: "Did I change `src/components/X`? → Check `playground/src/components/X` and `playground/src/app/components/X/page.tsx`." The demo page (`page.tsx`) is a third sync target that is easy to forget.

**Incident:** ENG-042 (2026-03-30) — ScrollSpy had 6 discrepancies across 3 codebases after 2 sessions of partial updates.

<a id="eap-029"></a>
## EAP-029: New Components Rendering CMS Data Without Inline Edit Wiring

**Status: ACTIVE**

**Trigger:** Creating a new component that renders data from a Payload collection or global, but not wrapping its text fields with `EditableText`, not passing `id`/`isAdmin`, and not including an `EditButton`.

**Why it's wrong:** The inline edit system is a core feature of this site — every piece of CMS-backed text should be editable in-place when the admin is logged in. A component that renders CMS data as plain `<span>` or `<p>` tags creates a dead zone: the admin sees text they should be able to edit but can't. This forces them to leave the page, find the item in the Payload admin panel, edit it there, and come back. It defeats the purpose of inline editing.

The failure mode is especially insidious because the component *looks correct* to the developer — it renders the right data. The missing affordance is invisible unless you're logged in as admin and trying to edit.

**Correct alternative:** When creating any component that renders CMS data:

1. **Accept `id` and `isAdmin` in props** — the server component must pass the document ID.
2. **Make it a client component** (`"use client"`) if it uses `EditableText` (hooks require client context).
3. **Wrap every text field** with `EditableText` when `isAdmin && id`:
   - `fieldId`: `{collection}:{id}:{fieldName}` (unique per field per document)
   - `target`: `{ type: 'collection', slug: '{collection}', id }`
   - `fieldPath`: exact Payload field name
4. **Add `EditButton`** for full admin panel access.
5. **Fall back to plain elements** when not admin (for SSR / non-admin visitors).

**Checklist (add to CMS-Frontend Parity Checklist):**

| Layer | What to verify |
|-------|---------------|
| Props | Component accepts `id?: number` and `isAdmin?: boolean` |
| Target | `ApiTarget` helper function exists for the collection |
| Fields | Every CMS-sourced text field wrapped in `EditableText` when admin |
| Edit button | `EditButton` present with correct `collection` and `id` |
| Data flow | Server `page.tsx` passes `id` from Payload docs |
| Parent | Parent component passes `isAdmin` down |

**Incident:** ENG-049 — TestimonialCard created with plain `<p>` and `<span>` tags, no inline edit support.

---

<a id="eap-030"></a>
## EAP-030: Filtering on Newly-Added Fields That Have No Data Yet

**Status: ACTIVE**

**Trigger:** Adding a new boolean/enum field to a Payload collection schema and immediately using it as a `where` filter in a query (e.g., `where: { showOnHome: { equals: true } }`).

**Why it's wrong:** When a new field is added to the schema, existing documents in the database don't have it. Even after a server restart, the field defaults to `false`/`null`/`undefined` for all pre-existing documents. A query filtering for `field === true` returns 0 results — silently dropping all existing data from the feature. The consuming code falls back to hardcoded data (which lacks CMS document IDs), breaking downstream features like inline editing that depend on real document IDs.

This is especially insidious because: (a) no errors are thrown, (b) the page still renders (with fallback data), (c) the query is logically correct for future documents, and (d) the developer doesn't realize existing data was silently excluded.

**Correct alternative:** When adding a new filter field:
1. **Don't filter on it immediately.** Deploy the field, let the admin populate it, then add the filter in a subsequent change.
2. **Or use an inclusive default.** If the field controls visibility, default it to `true` (opt-out model) rather than `false` (opt-in model) so existing documents aren't excluded.
3. **Or add a migration step.** After adding the field, bulk-update existing documents to set the desired default: `await payload.update({ collection, where: {}, data: { showOnHome: true } })`.

**Incident:** ENG-050 — `showOnHome: { equals: true }` filter on homepage returned 0 testimonials because existing DB docs didn't have the field set, falling back to data without CMS IDs, which disabled inline editing.

---

<a id="eap-031"></a>
## EAP-031: Bare `*` Selector in CSS Modules

**Status: ACTIVE**

**Trigger:** Writing a `*` or `*::before` selector at the top level (or inside `@media`) in a `.module.scss` file.

**Why it's wrong:** CSS Modules requires every selector to contain at least one locally-scoped class or ID. A bare `*` selector is global-scope and cannot be hashed. Turbopack/webpack will reject it at build time: `Selector "*" is not pure. Pure selectors must contain at least one local class or id.`

**Correct alternative:** Scope the wildcard under a local class. Use `:where(*)` inside the local class to keep specificity at 0:
```scss
.container {
  @media (prefers-reduced-motion: reduce) {
    &, & :where(*) {
      transition-duration: 0s !important;
    }
  }
}
```

**Incident:** ENG-052 — `prefers-reduced-motion` rule with `*` selector broke Turbopack compilation for the Élan case study page.

---

<a id="eap-053"></a>
## EAP-053: DnD Listeners on Child Element Inside a Link Wrapper

**Status: ACTIVE**

**Trigger:** Placing `@dnd-kit` (or any DnD library) `useSortable` listeners on a `<button>` or `<div>` that is a sibling or child of a `<Link>`/`<a>` element, where the link covers the same visual area as the intended drag target.

**Why it's wrong:** `<a>` tags and Next.js `<Link>` components capture pointer events (mousedown, pointerdown) and initiate navigation. Even with `z-index` layering, the browser's event dispatch reaches the link before or alongside the drag listener. The drag activation constraint (e.g., `distance: 5`) gives the link enough time to trigger navigation. Result: the drag never activates — the page navigates instead.

**Correct alternative:** Attach DnD listeners to the outermost wrapper element. Apply `pointer-events: none` to the inner content that contains links. Add `touch-action: none` and `user-select: none` on the drag wrapper. The drag handle icon becomes a visual indicator only — not the interactive target.

```tsx
// ✅ Correct: listeners on outer wrapper, inner content blocked
<div ref={setNodeRef} {...attributes} {...listeners} style={{ touchAction: "none" }}>
  <div className={styles.dragHandle} aria-hidden="true">⋮⋮</div>
  <div style={{ pointerEvents: "none" }}>
    <Link href={...}>...</Link>
  </div>
</div>

// ❌ Wrong: listeners on handle, link swallows events
<div ref={setNodeRef}>
  <button {...attributes} {...listeners}>⋮⋮</button>
  <Link href={...}>...</Link>  {/* captures all pointer events */}
</div>
```

**Incident:** ENG-020 — "I cannot drag things still"

---

<a id="eap-054"></a>
## EAP-054: Client Mutation Without router.refresh() in App Router

**Status: ACTIVE**

**Trigger:** A client component POSTs/PATCHes data to the backend (e.g., CMS global, collection item) and then updates local React state (e.g., exits a modal, clears a form) — but does **not** call `router.refresh()` to re-run the parent server component that originally fetched the data.

**Why it's wrong:** In Next.js App Router, server component props are computed once per navigation/refresh. A client-side `fetch()` to the API updates the database but does NOT trigger the server component tree to re-run. The client component still holds the stale props from the original server render. Any local state derived from those props (e.g., `useMemo` on `savedGridOrder`) will show the old data. The mutation "succeeds" silently while the UI reverts.

**Correct alternative:** After a successful client-side mutation, always call `router.refresh()` (from `next/navigation`). If the UI must reflect the change immediately (no flash of stale data), hold the optimistic result in local state and bridge until the refresh arrives:

```tsx
const [hasPendingSave, setHasPendingSave] = useState(false);

async function save(newData) {
  await fetch("/api/...", { method: "POST", body: JSON.stringify(newData) });
  setHasPendingSave(true);   // hold optimistic state
  setEditMode(false);
  router.refresh();           // tell server to re-fetch
}

useEffect(() => {
  if (hasPendingSave) { setHasPendingSave(false); return; }
  setLocalData(serverProp);  // sync when server data arrives
}, [serverProp, hasPendingSave]);

const display = hasPendingSave ? optimisticData : serverProp;
```

**Incident:** ENG-021 — grid order saved to CMS but UI reverted to stale order because `router.refresh()` was never called.

---

<a id="eap-032"></a>
## EAP-032: Architectural Changes Without engineering.md Update

**Status: ACTIVE**

**Trigger:** Making a significant infrastructure or architecture change (adding a storage adapter, changing the database, adding a new service layer) and only logging it in the feedback log without updating `engineering.md` with the architectural principle and operational details.

**Why it's wrong:** The feedback log is an incident history — it records what happened. `engineering.md` is the operational knowledge base — it tells future agents how the system works and what rules to follow. An architectural change documented only in the feedback log is effectively invisible: no agent will proactively read the feedback log before making infrastructure decisions. The feedback log entry for ENG-053 said "Supabase Storage was added" but didn't create a new section in `engineering.md` explaining the storage architecture, the env vars needed, the bucket configuration, the public URL pattern, or the verification steps. A future agent adding a new upload collection would have no guidance.

This is a variant of EAP-027 (documentation skips during rapid-fire debugging), but applied to non-urgent work. The behavioral pattern is the same: the agent prioritizes "getting it working" (install adapter → configure → test → confirm) and treats documentation as a deferred post-step rather than an integral part of the change. The fact that this was infrastructure work (no user frustration, no time pressure) makes the skip worse — there was no urgency to excuse it.

**Correct alternative:** For any architectural or infrastructure change:
1. Before implementing, draft the `engineering.md` section header and outline (what section, what subsections).
2. After implementing and verifying, fill in the section with: architecture diagram/table, configuration details, env vars, rules, verification commands.
3. Update the Section Index at the top of `engineering.md`.
4. Only then report the task as done.

**Incident:** ENG-053 (2026-03-30) — Supabase Storage adapter added and verified, but `engineering.md` §12 was not created until the user called it out. 7th documentation skip overall.

---

<a id="eap-033"></a>
## EAP-033: Schema Type Change Without Immediate Server Restart

**Status: ACTIVE**

**Trigger:** Changing a Payload field type (e.g. `textarea` → `richText`) in the collection schema file without immediately restarting the dev server before the user can interact with the changed field.

**Why it's wrong:** Payload syncs the database schema only at startup. Between the code change and the restart, the old schema is still active. If the inline edit system saves data in the new format (e.g. Lexical JSON for richText), Payload stores it according to the old field type (e.g. serializes the object to a string for textarea). This creates corrupted data — a JSON object stored as a string — that breaks all downstream consumers expecting either a plain string or a parsed object.

**Correct alternative:** When changing a field's type in a Payload collection or global schema, immediately restart the dev server as part of the same operation. Never defer the restart to the user. The restart is not optional — it's part of the atomic schema change. Additionally, add `ensureParsed()` guards to any function processing CMS data with early `typeof === 'string'` returns, as defensive programming against this exact migration window.

**Incident:** ENG-058 (2026-03-30) — Testimonial `text` changed from textarea to richText. User saved formatted text before restart. Raw Lexical JSON displayed in card.

---

<a id="eap-034"></a>
## EAP-034: S3-Compatible Storage Without Filename Sanitization — RESOLVED

**Status: RESOLVED** — `beforeChange` hook added to all upload collections to sanitize filenames (strip brackets, replace special chars, collapse hyphens) before S3 upload. See ENG-060.

---

<a id="eap-035"></a>
## EAP-035: Stale Turbopack Cache After Component Removal

**Status: ACTIVE**

**Trigger:** Removing a component from source code while the dev server is running (or was previously running), and not clearing the `.next` cache before restarting.

**Why it's wrong:** Turbopack's incremental build cache retains compiled chunks from previous builds. When a component is removed from source (not just modified), the old compiled chunk may persist in `.next/dev/static/chunks/`. If the browser has the old chunk cached or the server serves it from the stale build, the removed component still renders client-side. This causes hydration mismatches because the server no longer produces the component's HTML, but the client bundle still contains and executes it. The error points to a component that doesn't exist in the source — a debugging dead-end that wastes significant investigation time.

**Correct alternative:** After removing a component (especially one involved in hydration-sensitive rendering like admin-only UI inside links), clear the build cache and restart:
```bash
rm -rf .next && npm run dev
```
A simple server restart is not sufficient — Turbopack may rebuild from its cache. The full `rm -rf .next` ensures a clean compilation.

**Detection:** If a hydration error references a component that `grep -r` cannot find in `src/`, the issue is almost certainly a stale cache.

**Incident:** ENG-067 — `HeroUploadZone` was removed in ENG-066 but Turbopack cache still served the old compiled chunk, causing hydration mismatch.

---

<a id="eap-036"></a>
## EAP-036: Scroll Hijack on Embedded Canvas via onWheel Handler

**Status: ACTIVE**

**Trigger:** Adding an `onWheel` handler to an embedded canvas/viewport element that pans the canvas on bare wheel (non-modifier-key) scroll events.

**Why it's wrong:** When a user scrolls through a page and their cursor passes over an embedded canvas, the wheel events get intercepted by the canvas handler. The page stops scrolling (or scroll becomes erratic as both page and canvas respond). This is a scroll hijack — the user's intent is to scroll the page, not to pan an embedded widget. Infinite canvases (Figma, Miro, Google Maps) occupy the full viewport — they OWN the scroll. Embedded canvases inside scrollable pages must defer to the page's scroll.

**Correct alternative:** Embedded canvases should pan via drag only (pointer down + move). Zoom should be via explicit controls (buttons, keyboard shortcuts). `onWheel` should be removed entirely. Set `touch-action: pan-y` on the canvas viewport to allow vertical scroll passthrough on touch devices. Reserve `onWheel` + `e.preventDefault()` for full-page canvas apps where the canvas IS the page.

**Incident:** ENG-072 — Architecture DAG in case study intercepted page scroll with `onWheel` pan handler.

---

<a id="eap-038"></a>
## EAP-038: One-Way Playground Experiment

**Status: ACTIVE**

**Trigger:** A design experiment (button API, spacing tokens, typography mixins) is conducted in the playground without propagating the results to production, or vice versa.

**Why it's wrong:** The playground and production are two independent Next.js apps with manually synchronized code. When a component or token is updated in one app without updating the other, they silently drift. The drift compounds across sessions — by the time it's noticed, the gap requires a full audit and multi-phase migration instead of a simple same-session update. Three separate experiments (Button two-axis model, three-tier spacing tokens, semantic typography mixins) all fell into this trap in March 2026, each requiring significant rework to reconcile.

**Correct alternative:** Every playground experiment that changes a component's API, visual behavior, or token usage MUST be propagated to the corresponding production component in the same session. The Cross-App Parity Checklist in AGENTS.md is bidirectional — it includes playground→production rows. Before ending a session that touched playground Demo* components, run the parity checklist.

**Incident:** ENG-073 — Three playground experiments (Button, Spacing, Typography) conducted across multiple sessions were never propagated to production, requiring a 6-phase alignment plan.

---

<a id="eap-055"></a>
## EAP-055: Hardcoded Pixels/Hex in Playground Tailwind When Token CSS Vars Exist

**Status: ACTIVE**

**Trigger:** Building a playground Demo* component using Tailwind arbitrary values with raw pixel or hex values (e.g., `h-[48px]`, `bg-[#161616]`, `bg-emerald-600`) when the corresponding design system CSS custom properties exist or could be trivially added.

**Why it's wrong:** The playground's purpose is to demonstrate the design system — a demo component that bypasses the token layer defeats that purpose. Hardcoded values silently diverge from token source-of-truth if tokens change. They also lose dark-mode adaptivity and make the playground useless as a visual regression tool. Tailwind's default palette colors (emerald, red) are NOT the design system — they have different hue/saturation than the Carbon-sourced palette.

**Correct alternative:** Before building a Demo* component, verify that all needed tokens are exposed as CSS custom properties in `playground/src/app/globals.css`. If a token exists in SCSS but not as a CSS var, add it. Then use `var()` references: `h-[var(--spacer-6x)]` not `h-[48px]`, `bg-[var(--palette-green-60)]` not `bg-emerald-600`. For theme-adaptive states, create semantic CSS vars with `.dark` overrides.

**Incident:** ENG-074 — DemoButton rebuilt with hardcoded pixels and Tailwind default colors instead of token references, requiring full re-tokenization of sizing (20 values), colors (28 values), motion (2 values), and overlay states (8 values).

---

<a id="eap-037"></a>
## EAP-037: Re-implementing Production Components in Playground Tailwind

**Status: ACTIVE**

**Trigger:** Creating a `DemoButton`, `DemoSlider`, etc. function in a playground demo page that re-implements the production component's behavior and appearance using Tailwind classes, CSS `@keyframes`, or inline `style={{}}` instead of importing the production component.

**Why it's wrong:** This creates parallel implementations of the same component with the same prop API but different CSS systems. Every production component change requires a manual update to the playground's `Demo*` version. With 19+ components, drift is guaranteed — the playground shows a stale or divergent version of the component. Over 2,400 lines of Tailwind re-implementation accumulated before the pattern was recognized. A second audit (ENG-075) found 16 pages still violated the rule even after ENG-073, covering ui components, non-ui site components, motion primitives, and trigger buttons.

**Correct alternative:** Import the production component directly:
- `@ds/*` for `src/components/ui/` components (TypeScript path alias → `../src/components/ui/*`)
- `@site/*` for `src/components/` components (TypeScript path alias → `../src/components/*`)
- Bridge files in `playground/src/lib/` and `playground/src/components/` for `@/` alias resolution conflicts

SCSS Module class names are scoped/hashed and coexist with Tailwind utilities without conflicts. Demo pages should be thin harnesses: import + layout + state + PropsTable. Never write component styling in a demo page.

**Enforcement:** Three-stage pipeline prevents recurrence:
1. **Intent Gate** (AGENTS.md Engineering Guardrail #18) — central, non-bypassable classification. Component visual changes go to `src/components/`, never playground pages. Documentation/structure edits and shell edits are explicitly allowed.
2. **ESLint Safety Net** (`eslint.config.mjs` scoped override) — inline custom plugin bans `@radix-ui/*` imports, `<style>` tags, most `style={{}}`, and Tailwind default palette colors in playground component pages.
3. **Evaluation Gate** (playground skill) — mandatory post-implementation self-check. Agent verifies placement, tech stack match, and visual quality with a 3-attempt correction loop.

Supporting layers: File-scoped rule (`.cursor/rules/playground-components.md`), Skill (`.cursor/skills/playground/SKILL.md`), AGENTS.md Guardrail #17 (mandatory skill read).

**Incident:** ENG-073 (2026-03-30) — initial migration. ENG-075 (2026-03-30) — comprehensive audit + three-layer enforcement. ENG-076 (2026-03-30) — three-stage pipeline (Intent Gate + ESLint + Evaluation Gate).

---

<a id="eap-038-b"></a>
## EAP-038: SCSS Modules with `@use` Imports Under Turbopack

**Status: ACTIVE**

**Trigger:** Creating a `.module.scss` file that uses `@use` to import SCSS mixins/tokens via `sassOptions.loadPaths`, then importing it in a `'use client'` component.

**Why it's wrong:** Turbopack (Next.js 16.x dev mode) compiles SCSS modules separately for server-side rendering and client-side rendering. When the SCSS file depends on `sassOptions.loadPaths` for `@use` resolution, the two compilations can produce different CSS module class name mappings, causing a hydration mismatch. The server HTML receives one set of class names while the client JS expects another.

**Correct alternative:** Use plain `.module.css` files with CSS custom properties (`var(--token-name)`) instead of SCSS `@use`/`@include` mixins. CSS custom properties defined in `globals.css` are available everywhere without build-time path resolution. Reserve `.scss` files for non-module use cases (global styles, `@layer` blocks) where server/client parity is not required.

**Incident:** ENG-081 (2026-04-01) — Playground sidebar section labels hydration mismatch.

---

<a id="eap-056"></a>
## EAP-056: Barrel Imports from Large Packages in Turbopack SSR Components

**Status: ACTIVE**

**Trigger:** Using barrel imports (`import { Foo, Bar } from "large-package"`) in a `"use client"` component that is server-side rendered by Turbopack, where `large-package` is in Next.js's `optimizePackageImports` default list (e.g., `lucide-react`, `@radix-ui/*`, `date-fns`, `lodash-es`).

**Why it's wrong:** Turbopack's `optimizePackageImports` rewrites barrel imports to individual module imports automatically, but the server-side and client-side bundles may resolve the **same named export to different concrete modules**. For `lucide-react` (v0.469.0, 3,496 icon files), this caused `Compass` to resolve to the Bell icon on the server and the correct Compass icon on the client — a hydration mismatch that is invisible in source code and only detectable by comparing server HTML against client render.

The bug is positional — icons at indices 0-3 and 7-8 resolved correctly; only indices 4-6 (Bell, Compass, Table2) were swapped. This suggests the optimization pass processes import specifiers in a non-deterministic order that differs between the server and client compilation passes.

**Correct alternative:** Use individual default imports that bypass the optimization entirely:
```tsx
import Compass from "lucide-react/dist/esm/icons/compass";
import Bell from "lucide-react/dist/esm/icons/bell";
```

Add a TypeScript declaration for the wildcard import path:
```ts
// playground/src/types/lucide-icons.d.ts
declare module "lucide-react/dist/esm/icons/*" {
  import type { LucideIcon } from "lucide-react";
  const icon: LucideIcon;
  export default icon;
}
```

**Detection:** `grep -r 'from "lucide-react"' playground/src/` should return zero matches. Any barrel import is a potential hydration mismatch.

**Scope:** This guardrail applies to the **playground** app specifically because it uses Turbopack SSR with `turbopack.root` set to the monorepo root. The main site may also be affected but hasn't exhibited the bug. When in doubt, use individual imports for any package with 100+ exports.

**Incident:** ENG-087 (2026-04-01) — Playground sidebar icons rendered wrong SVGs on server (Bell where Compass should be), causing persistent hydration mismatch on every page load.

---

## Entry Template

```markdown

<a id="eap-039"></a>
## EAP-039: SCSS Compile-Time Tokens as Sole Color Source in Themeable Components

**Status: ACTIVE**

**Trigger:** Writing `.module.scss` that uses `$portfolio-*` SCSS variables for all color/surface/border values, without `var()` fallback, when the component will render in the playground or any context with runtime theme switching.

**Why it's wrong:** Sass variables resolve at compile time to static hex values (e.g., `$portfolio-surface-primary` → `#FFFFFF`). The compiled CSS cannot respond to runtime class-based theme switching (`.dark`). When the playground toggles dark mode, SCSS-only components retain light-mode colors, creating contrast mismatches.

**Correct alternative:**
```scss
background-color: var(--ds-surface-primary, #{$portfolio-surface-primary});
```
The `--ds-*` custom property adapts at runtime; the SCSS interpolation `#{$scss-var}` provides a fallback for hosts that don't define the property (main site). See `playground/src/app/globals.css` for the full `--ds-*` token set with `.dark` overrides.

**Incident:** ENG-082 — Card/Input/Table dark mode adaptation

---

<a id="eap-040"></a>
## EAP-040: Using SCSS Primitives Where Semantic Tokens Exist

**Trigger:** Writing `$portfolio-neutral-20` (a primitive) for a border instead of `var(--portfolio-border-subtle)` (a semantic token), or using `$portfolio-neutral-00` for a surface instead of `var(--portfolio-surface-primary)`.

**Why it's wrong:** Primitives don't swap in dark mode. Semantic CSS custom properties do. Using a primitive where a semantic token exists defeats the theme architecture. The component will display light-mode colors in dark mode.

**Correct alternative:** Use `var(--portfolio-*)` semantic CSS custom properties for all theme-aware values. Only use SCSS primitives when: (a) inside `rgba()`/`darken()`/other compile-time functions, (b) intentionally building an always-dark/always-light surface, or (c) using specific color tints without a semantic equivalent (document the exception in the component).

**Incident:** ENG-083 — full codebase migration from SCSS vars to CSS custom properties.

---

<a id="eap-041"></a>
## EAP-041: Manually Duplicating Design System Token Variables in Consumer Apps

**Trigger:** Creating a separate set of CSS custom properties (e.g., `--ds-*`, `--palette-*`) in a consumer app's stylesheet that mirrors the design system's source tokens, instead of importing from the single source.

**Why it's wrong:** Duplicated variable definitions drift silently from the source. When the source changes namespace (e.g., `--ds-*` → `--portfolio-*`), output format, or adds new tokens, the consumer's copy becomes stale. Components start resolving to empty values without any build error, making the failure invisible until visual regression is noticed. The duplication also means dark mode overrides must be maintained in two places — they inevitably diverge.

**Correct alternative:** Consumer apps import the design system's compiled CSS custom properties from the single source. In a monorepo, this means an SCSS file that `@use`s the source `_custom-properties.scss` (leveraging `sassOptions.loadPaths`). For external consumers, this means `@import '@yilangaodesign/design-system/css/tokens'`. No consumer should define `--portfolio-*` variables — they come from one place.

**Incident:** ENG-084 — playground's manually-duplicated `--ds-*`/`--palette-*` variables broke after SCSS→CSS custom property migration changed all components to `var(--portfolio-*)`.

---

<a id="eap-042"></a>
## EAP-042: Reporting Playground Changes as Done Without Flushing Cache and Restarting

**Status: ACTIVE — ESCALATED (6+ violations)**

**Trigger:** Editing a playground file (or any `src/` file consumed by the playground) and reporting the task as complete without flushing the Turbopack cache and restarting the server.

**Why it's wrong:** Turbopack's Hot Module Replacement (HMR) in the playground is **fundamentally unreliable**. HMR delivery fails more often than it succeeds. Multiple environmental factors cause the browser to show stale content:
1. **HMR doesn't trigger:** The file watcher may not detect the change, or the WebSocket push may fail silently.
2. **Dead WebSocket connections:** Previous server restarts leave `CLOSE_WAIT` connections.
3. **Turbopack incremental cache:** `.next/` retains compiled chunks that may not invalidate correctly, especially for files with cross-directory imports (`@ds/*` → `../src/components/`).
4. **Browser cache:** Even with fresh server output, the browser may serve a cached page.

These are not edge cases — they are the **default behavior**. The previous version of this protocol treated flush-and-restart as a fallback. That approach failed 6+ times because the agent kept hoping HMR would work and only flushed when the user complained. The user should NEVER have to ask for this.

**Correct alternative — mandatory flush-and-restart protocol (no exceptions):**

After editing ANY playground file or ANY `src/` file consumed by the playground:

1. **Kill** the playground server process.
2. **Delete** the Turbopack cache: `rm -rf playground/.next`
3. **Restart** the server: `npm run playground`
4. **Wait** for the server to be ready (poll with `curl` until HTTP 200).
5. **Verify** the specific change appears in the HTML response (grep for a distinctive string from the edit).
6. **Only then** report the task as done.

Do NOT skip any step. Do NOT try HMR first. Do NOT tell the user to "hard refresh" as the primary strategy. The flush-and-restart IS the verification — it costs 10 seconds and eliminates 100% of the stale-cache incidents.

**Why the previous protocol failed:** The old protocol was: curl → tell user to hard-refresh → if still broken, then flush. This three-step escalation path introduced two failure points (curl succeeds but browser is stale; user hard-refreshes but WebSocket is dead) before reaching the step that actually works. The agent repeatedly stopped at step 1 or 2 and reported success. The root cause was treating the flush as expensive/disruptive when it's actually cheap (10s) compared to the user's debugging time (minutes).

**ENFORCEMENT:** AGENTS.md Hard Guardrail #11 now mandates flush-and-restart as the default — not the fallback. Any agent that reports a playground edit as done without completing all 6 steps above is in violation.

**Recurring pattern:** 6+ occurrences across sessions (ENG-085, ENG-094, plus 4+ undocumented). User has explicitly called out the repetition multiple times: "This process has been repeated again and again and again. I have to ask you multiple times to redo this, and you don't seem to have learned the lesson."

---

<a id="eap-057"></a>
## EAP-057: Placeholder `href="#"` on Static Component Demos

**Trigger:** Playground or docs pages render link-styled components with `href="#"` (or `href=""`) so "something is focusable," but the demo must not navigate.

**Why it's wrong:** `href="#"` triggers fragment navigation on the current URL. Browsers scroll to the top (or toggle history), which feels like a broken interaction and confuses users reviewing visual-only previews.

**Instead:** Omit `href` when the component supports button mode (e.g. `NavItem` → `<button type="button">`) — **but only after verifying the component's SCSS fully resets `<button>` UA defaults** (font, padding, text-align, line-height). If the SCSS does not normalize `<a>` vs `<button>`, removing `href` will cause visible layout breakage because browser default button styles interfere with the component's flex layout. **Keep `href="#"` with `onClick={(e) => e.preventDefault()}` as the safe fallback** until the component's SCSS is updated to include button resets.

**Incident:** ENG-088 (2026-04-01), ENG-089 (2026-04-02) — `playground/src/app/components/nav-item/page.tsx`. ENG-089: bulk `href` removal broke NavItem icon-label spacing across all playground sections. Reverted.

---

<a id="eap-058"></a>
## EAP-058: Embedding Fixed-Position Layout Components in Preview Containers

**Trigger:** Creating a playground demo page that renders a full-page layout component (`position: fixed`, `createPortal(document.body)`) inside a bounded preview `<div>`.

**Why it's wrong:** `position: fixed` escapes all ancestor containers — CSS `overflow: hidden` and inline style overrides don't contain it. `createPortal(document.body)` renders DOM nodes at the body level regardless of the React tree structure. The result: the layout component's panels (sidebars, slivers, backdrops) cover the real page, including the playground shell's own navigation. Inline style hacks (`style={{ position: "relative" }}`) lose to SCSS module specificity.

**Correct alternative:** For full-page layout components (VerticalNav, AppShell, etc.): (1) demonstrate embeddable subcomponents individually (section dividers, group headers, nav items), (2) show the full composition API via code examples only, (3) point users to the layout component's actual usage (e.g., "this playground's sidebar IS the live demo"). Never instantiate the layout root component inside a `ComponentPreview`.

**Incident:** ENG-092 (2026-04-02) — `playground/src/app/components/vertical-nav/page.tsx`. `MiniSidebarDemo` embedded `VerticalNav` + `SliverPortal` inside a 400px div. Sliver portaled to body at `position: fixed; top: 0; left: 200px; height: 100vh`, covering the entire playground shell sidebar.

---

<a id="eap-058-b"></a>
## EAP-058: Assuming spacer-NNx exists without utility- prefix

**Trigger:** Writing `$portfolio-spacer-0-75x` or other sub-grid spacer values without the `utility-` prefix.

**Why it's wrong:** Sub-grid spacer tokens (those not on the 8px base grid) use a `utility-` prefix: `$portfolio-spacer-utility-0-75x`, `$portfolio-spacer-utility-1-25x`, etc. The non-utility shorthand does not exist and causes SCSS compilation failure.

**Correct alternative:** Always check the spacer token file or use the `utility-` prefix for non-grid-aligned values (0.75x, 0.875x, 1.25x, 1.75x, 2.25x, etc.).

**Incident:** ENG-095 (2026-04-02) — 20 instances of `$portfolio-spacer-0-75x` caused build failure.

---

<a id="eap-059"></a>
## EAP-059: Using SCSS variables in Payload admin SCSS files

**Trigger:** Bulk-replacing CSS values with `$portfolio-*` SCSS variables in files under `src/components/admin/`.

**Why it's wrong:** Payload admin SCSS files don't `@use` the DS styles barrel. They use Payload's `--theme-*` CSS custom properties. Injecting an SCSS variable without the `@use` import causes an "undefined variable" compilation error.

**Correct alternative:** In admin-scoped SCSS files, use CSS custom properties (`var(--portfolio-*)`) instead of SCSS variables.

**Incident:** ENG-095 (2026-04-02) — `NavPages.module.scss` build failure from `$portfolio-type-2xs` without import.

---

<a id="eap-060"></a>
## EAP-060: Gitignored Files That the Build Depends On

**Trigger:** A framework or tool generates a file locally during development (e.g., Payload's `importMap.js`), and that file is in `.gitignore`. The local build works because the file exists, but CI/CD (Vercel) fails because the clean checkout doesn't have it.

**Why it's wrong:** CI builds from a clean git checkout. If a file isn't committed, it doesn't exist in CI — regardless of whether it exists on your machine. The local dev environment masks this failure because the file persists across runs.

**Correct alternative:** If a build-time dependency is generated by a framework, it must be committed to the repo. Remove it from `.gitignore`. If the file changes frequently (and you're worried about noise), add a `prebuild` script that regenerates it — but the file must still be committed as a baseline.

**Verification:** Run `next build` in a clean checkout (or `git stash --include-untracked && next build && git stash pop`) to catch missing files before they break CI.

**Incident:** ENG-096 (2026-04-02) — Payload's `importMap.js` was gitignored, causing three `Module not found` errors on first Vercel deploy. Also: `resend` was dynamically imported but not in `package.json` — Turbopack resolves all imports at build time.

---

<a id="eap-061"></a>
## EAP-061: File Conventions Leak Across Monorepo Apps via turbopack.root

**Trigger:** Adding a Next.js 16 file convention (e.g., `proxy.ts`, `layout.tsx`) to one app in a monorepo where another app uses `turbopack: { root: monorepoRoot }` in its `next.config.ts`.

**Why it's wrong:** `turbopack.root` extends Turbopack's file resolution to the parent directory. This is intended for module imports (`@ds/*` → `../src/`), but it also affects file convention detection. Next.js scans for `proxy.ts` at the level of `app/`, and if the root is the monorepo, it finds proxy files from sibling apps. Those files import modules that don't exist in the current app, breaking the build.

**Correct alternative:** When adding a file convention to any monorepo app, check if sibling apps have `turbopack.root` overrides. If so, create a no-op version of that file convention in the sibling app to shadow the parent. Example: `playground/src/proxy.ts` returning `NextResponse.next()`.

**Incident:** ENG-097 (2026-04-02) — Main site's `src/proxy.ts` (password gate) was detected by the playground's build via `turbopack.root: monorepoRoot`. Build failed because `@/lib/company-session` doesn't exist in `playground/src/lib/`.

---

<a id="eap-062"></a>
## EAP-062: Adding a Payload Collection Without Manual Schema Push

**Trigger:** Adding a new collection to `payload.config.ts` and expecting the database to auto-update on dev server restart.

**Why it's wrong:** Payload 3.80 with `@payloadcms/db-postgres` does not auto-push schema changes to the database on startup. The `push: true` adapter option and the Payload CLI (`npx payload migrate:create`) both fail on this project — the option silently does nothing, and the CLI crashes with `ERR_REQUIRE_ASYNC_MODULE` on Node.js 25. The dev server starts, Payload generates SQL referencing the new collection's columns (e.g., `companies_id` in `payload_locked_documents_rels`), and the query fails with "column does not exist."

**Correct alternative:** After adding a new collection to the Payload config, manually push the schema to the database using `src/scripts/push-schema.ts` as a template. Required DDL for each new collection:
1. Create the collection table with all fields
2. Create any array subtables (e.g., `{collection}_case_study_notes`)
3. Create indexes (unique, foreign key, ordering)
4. Add `{collection}_id` column to `payload_locked_documents_rels` (Payload's internal document locking system references every collection)
5. Restart the dev server

Since dev and production share the same Supabase database, one push covers both environments.

**Incident:** ENG-099 (2026-04-02) — Admin returned 500 after adding `companies` collection. `payload_locked_documents__rels.companies_id` did not exist.

---

<a id="eap-063"></a>
## EAP-063: Deleting a Payload Admin Component Without Cleaning the Import Map

**Trigger:** Removing a component from `payload.config.ts` admin components (e.g., deleting `afterNavLinks: ['@/components/admin/ViewSiteLink']`) but not updating the generated `importMap.js`.

**Why it's wrong:** Payload generates `src/app/(payload)/admin/importMap.js` based on the config, but the generated file isn't always regenerated when components are removed. The stale import causes a "Module not found" error that crashes the entire admin panel with a 500 response.

**Correct alternative:**
1. Remove the component from `payload.config.ts`
2. Delete the component file(s)
3. Open `src/app/(payload)/admin/importMap.js` and manually remove the `import` line and the corresponding entry in the `importMap` object
4. Delete `.next/` cache
5. Restart the dev server
6. Verify HTTP 200 on `/admin`

**Incident:** ENG-100 (2026-04-02) — Admin returned 500 after removing ViewSiteLink from afterNavLinks. The import map still referenced the deleted component.

---

<a id="eap-064"></a>
## EAP-064: `transition: all` on Interactive Controls with Conditional DOM Children

**Trigger:** Using `transition: all` (or a mixin that expands to it) on an element whose children are conditionally mounted/unmounted by a headless UI library (Radix, Headless UI, etc.).

**Why it's wrong:** When a child element mounts or unmounts, the browser briefly recalculates layout on the parent. `transition: all` animates even momentary layout-related property changes during this DOM churn, making the recalculation visible as a size glitch or flicker. Fixed `width`/`height` on the parent does NOT fully prevent this — the transition can still animate intermediate states.

**Correct alternative:** Enumerate only the visual properties that should transition: `transition: background-color Xms ease, border-color Xms ease, box-shadow Xms ease`. If the child must mount/unmount, also consider `forceMount` (Radix) or `static` (Headless UI) to keep the element always in the DOM and control visibility via CSS `data-state` or `data-headlessui-state` selectors.

**Incident:** ENG-104 (2026-04-03) — Checkbox height fluctuated on toggle due to Radix Indicator mount/unmount + `transition: all`.

---

<a id="eap-065"></a>
## EAP-065: `EditableText isRichText` Without `htmlContent` Prop

**Trigger:** Adding `isRichText` and `multiline` to an `EditableText` instance but only passing `extractLexicalText()` as `children`, without computing and passing `lexicalToHtml()` as `htmlContent`.

**Why it's wrong:** `extractLexicalText()` returns plain text with `\n` between paragraphs. HTML renders `\n` as whitespace, so multi-paragraph content collapses into a single block after save + `router.refresh()`. The `htmlContent` prop is what enables `EditableText` to render formatting (including paragraph breaks) via `dangerouslySetInnerHTML` in both admin and non-admin modes.

**Correct alternative:** For every `EditableText` with `isRichText`, the server component must:
1. Compute `const html = lexicalToHtml(field)`
2. Pass `htmlContent={html !== plainText ? html : undefined}` to the component
3. Follow the testimonials pattern (see `page.tsx` testimonials mapping)

Also update the non-admin rendering fallback to use `dangerouslySetInnerHTML` when HTML content is available.

**Incident:** ENG-105 (2026-04-03) — Description, section bodies, and bio all lost paragraph breaks after save.

---

<a id="eap-073"></a>
## EAP-073: `EditableText` without `inlineTypography` while applying inline HTML formatting on a Payload `text` field

**Trigger:** Using default `EditableText` on a `text` field while the admin can apply bold, font weight, or font family via `contenteditable` (keyboard shortcuts or token toolbar), expecting the change to persist.

**Why it's wrong:** Default `handleInput` uses `textContent`, which drops all inline markup. The preview may still show formatting until blur, but the value committed to the dirty map matches the old plain string, so save skips or overwrites with plain text.

**Correct alternative:** If the field stores an HTML fragment in a `text` column, pass `inlineTypography` so `innerHTML` is captured, pass `storedValue` for accurate dirty comparison when `children` is a plain projection, pass `htmlContent` when the stored value includes tags, and use `plainTextFromInlineHtml()` for `children` where needed. If the field should be true Lexical rich text, use Payload `richText` + `isRichText` instead.

**Incident:** ENG-131 (2026-04-07) — Site identity name formatting did not persist after inline edit save.

---

<a id="eap-063-b"></a>
## EAP-063: Element-level inline style on contentEditable root for per-word formatting

**Trigger:** Setting `el.style.fontWeight`, `el.style.fontStyle`, or similar CSS properties directly on a `contentEditable` element to toggle formatting (bold, italic, etc.).

**Why it's wrong:** CSS inline styles on the root element override all child elements via the cascade. If `el.style.fontWeight = '700'` is set, inner `<strong>` tags become invisible (text is already 700). Users can no longer selectively un-bold individual words because removing `<strong>` doesn't reduce the weight below the parent's inline 700. This creates a one-way formatting trap.

**Correct alternative:** Always use `document.execCommand('bold')` for bold toggling — it adds/removes semantic `<strong>` tags that can be individually manipulated. For the no-selection case (toggle all content), select all content first (`range.selectNodeContents(el)` → `execCommand('bold')` → `range.collapse(false)`), then clear any leftover `el.style.fontWeight` with `el.style.removeProperty('font-weight')`. For non-binary formatting (font-weight, font-size, font-family, color), use `<span style="...">` wrappers via `range.extractContents()` + `range.insertNode()`.

**Incident:** ENG-107 (2026-04-04) — Bold/italic formatting on individual words didn't work in case study inline editor.

---

<a id="eap-063-c"></a>
## EAP-063: Payload column type change without manual USING clause

**Trigger:** Changing a Payload collection field type from `text` to `richText` (varchar → jsonb) without running a manual ALTER TABLE with `USING` clause.

**Why it's wrong:** Payload's auto-schema-push attempts `ALTER COLUMN SET DATA TYPE jsonb` which PostgreSQL rejects for varchar → jsonb conversion. The resulting `payloadInitError` propagates through React Server Components to the browser as an uncaught error, crashing React hydration across the ENTIRE site — not just the affected collection. The symptom (inline editing broken) is completely disconnected from the cause (unrelated testimonials table).

**Correct alternative:** When changing a Payload field type that maps to an incompatible PostgreSQL column type, add a manual migration to `src/scripts/push-schema.ts` with the explicit USING cast: `ALTER TABLE "table" ALTER COLUMN "col" TYPE jsonb USING col::jsonb`. Run this BEFORE restarting the dev server.

**Incident:** ENG-109 (2026-04-03) — Inline editing completely broken site-wide because testimonials.text type mismatch crashed Payload init.

---

<a id="eap-066"></a>
## EAP-066: contentEditable + document.execCommand for Rich Text Editing

**Trigger:** Building or maintaining a rich text editing surface using the browser's native `contentEditable` attribute and `document.execCommand()` API.

**Why it's wrong:** `document.execCommand` is deprecated and behaves inconsistently across browsers. The round-trip pipeline (user edit → HTML extraction → parse to structured format → save → load → re-render) is inherently lossy — formatting degrades at each step. Bold/italic applies to the wrong scope, undo/redo doesn't work, and selection state is unreliable. When the storage format is Lexical JSON (as in Payload CMS), the HTML ↔ Lexical conversion adds a second lossy translation layer.

**Correct alternative:** Mount a Lexical editor instance directly. Since Payload already stores Lexical JSON, per-block `LexicalComposer` components eliminate the conversion pipeline entirely — user edits produce Lexical state that serializes directly to the storage format. Use DS components for the toolbar UI.

**Incident:** Block Editor Enhancement (2026-04-04) — richText blocks used `contentEditable` + `execCommand`, causing formatting loss, whole-block formatting, no undo/redo.

---

<a id="eap-067"></a>
## EAP-067: Rich Text HTML Inside Phrasing Elements (`<p>`, `<span>`)

**Trigger:** Using `as="p"` or `as="span"` on `EditableText` with `isRichText`/`htmlContent`, or wrapping CMS-generated HTML in `<p dangerouslySetInnerHTML>`.

**Why it's wrong:** Rich text from Payload's Lexical-to-HTML conversion always contains block-level elements (`<p>`, `<h2>`, `<ul>`, etc.). Wrapping them in a `<p>` produces `<p><p>...</p></p>` — illegal per HTML spec. The browser auto-closes the outer `<p>` when it encounters the inner one, restructuring the DOM. React hydration then fails because the server-rendered tree differs from the client-expected tree. The error manifests as `__html` content mismatch (server has content, client shows `""`).

**Correct alternative:** Use `as="div"` (or another flow container) for any `EditableText` with `isRichText`. For non-admin fallbacks, use `<div dangerouslySetInnerHTML>` instead of `<p dangerouslySetInnerHTML>`. Only use `<p>` when the content is guaranteed to be plain text (no nested block elements).

**Incident:** ENG-111 (2026-04-04) — `/work/meteor` hydration failure on description field.

---

<a id="eap-068"></a>
## EAP-068: Treating TCP Listen as a Health Check for Dev Servers

**Status: ACTIVE**

**Trigger:** Using `lsof`, `nc`, or `ss` to confirm a port is occupied and concluding the dev server is healthy.

**Why it's wrong:** A Next.js dev server can enter a zombie state where the Node.js process keeps the TCP socket open (kernel accepts connections) but never processes HTTP requests. This happens after long idle periods, machine sleep/wake cycles, or resource exhaustion. `lsof -i :PORT` shows LISTEN, `nc -z` succeeds, but `curl` hangs forever. The boot-up procedure reports "already running" while the user sees a blank page that never loads.

**Correct alternative:** Always probe with an HTTP request that has a timeout:
```bash
curl -s -o /dev/null -w "%{http_code}" --max-time 5 http://localhost:<PORT>/
```
If the response is not `200` or `3xx` within 5 seconds, the server is dead regardless of what `lsof` says. Kill it, clear `.next`, and restart. Use `localhost` (not `127.0.0.1`) in all dev URLs to match how users access the server.

**Incident:** ENG-116 (2026-04-04) — Three servers accepted TCP but hung on HTTP for 6 min to 3+ days.

---

<a id="eap-069"></a>
## EAP-069: Running Next.js 16.2.x Dev Server with Turbopack (Default)

**Status: ACTIVE (temporary — remove when Turbopack fix ships)**

**Trigger:** Running `next dev` on Next.js 16.2.0 or 16.2.1, which defaults to Turbopack.

**Why it's wrong:** Turbopack in Next.js 16.2.x has a regression where `.next/dev/routes-manifest.json` is never generated. Static routes (`/`) work, but all dynamic routes (`/work/[slug]`, etc.) fail with `ENOENT: no such file or directory`. The error returns HTTP 500 to the browser ("this page isn't working"). This is a known upstream bug (vercel/next.js#91609, #91864).

**Correct alternative:** Use the `--webpack` flag until the bug is fixed:
```json
"dev": "next dev --port 4000 --webpack"
```
Webpack generates the routes manifest correctly. Monitor Next.js releases for a Turbopack fix, then revert to the default bundler.

**Incident:** ENG-117 (2026-04-04) — All `/work/*` case study pages returned 500.

---

<a id="eap-070"></a>
## EAP-070: Uploading media with original filenames (collision on unique constraint)

**Status: RESOLVED**

**Trigger:** Calling `uploadMedia()` with files whose names, after sanitization, match an existing media entry's filename.

**Why it's wrong:** Payload's upload collections enforce unique filenames. Common file naming patterns (macOS screenshots, "image.png", "hero.png") produce identical sanitized names. The second upload fails with "A field value must be unique." This is especially confusing because the error appears on the *project save*, not the media upload step, due to how `ImageUploadZone` chains the two operations.

**Correct alternative:** Append a timestamp (or other unique suffix) to the filename stem before uploading: `${stem}-${Date.now()}${ext}`. This is now the default behavior in `uploadMedia()`.

**Incident:** ENG-123 (2026-04-06)

---

<a id="eap-071"></a>
## EAP-071: Writing to legacy fields when content blocks have replaced them

**Status: ACTIVE**

**Trigger:** An upload, inline edit, or API write that targets a legacy/deprecated field (e.g., `heroImage`) when the data model has migrated to a new structure (e.g., hero content blocks).

**Why it's wrong:** The read path may prioritize the new structure. If the new structure exists (even empty), the legacy field is never reached. Data appears saved (the legacy field is populated) but never displays. This creates a "ghost write" — the write succeeds, the thumbnail updates (because it reads from the legacy field), but the detail page doesn't show the change.

**Correct alternative:** Always write to the canonical field in the current data model. If backward compatibility requires it, write to both. If the legacy field is still in use by other views (e.g., home page thumbnails), add a fallback merge in the read path that fills empty new-structure fields from the legacy field.

**Incident:** ENG-123 (2026-04-06)

---

**Anti-pattern: Using `setNested()` with array-indexed field paths for Payload PATCH requests**

**Status: ACTIVE**

**Trigger:** Calling `updateCollectionField()` (or any function that uses `setNested`) with a field path like `content.2.body` that contains a numeric array index.

**Why it's wrong:** `setNested()` builds the request body by creating intermediate objects/arrays. When the path contains a numeric index (e.g., `content.2.body`), it creates a sparse JavaScript array: `[undefined, undefined, {body: ...}]`. JSON.stringify converts this to `[null, null, {body: ...}]`. Payload CMS receives this as the entire array value and rejects it (HTTP 500) because the null entries are invalid blocks. The data is never persisted, but the client-side editor still shows the edit, creating a "phantom save" that reverts on refresh.

**Correct alternative:** For array-element updates, use the fetch-modify-save pattern: (1) GET the current document, (2) clone the array and patch only the target element, (3) PATCH the full array field (e.g., field `content` with the complete array). This is what `useBlockManager.patchContent` already does correctly.

**Incident:** ENG-121 (2026-04-04) — LexicalBlockEditor edits silently failed to persist.

---

**Anti-pattern: Dual ordering systems without sync (EAP-070)**

**Status: RESOLVED**

**Trigger:** A single conceptual sequence (e.g., project ordering) is stored in two independent locations (e.g., `gridOrder` in a global config AND per-document `order` fields), and a mutation only updates one.

**Why it's wrong:** Features that read from different representations of the same sequence silently diverge. The homepage grid shows one order, the case study prev/next navigation shows another. The user sees correct ordering in one place and stale ordering in another, with no error or warning. This is a class of "split-brain" data bugs that only surface through user confusion.

**Correct alternative:** When the same sequence is consumed by multiple features, mutations must update all representations atomically. Either: (a) write to all stores in the same save operation, or (b) designate one store as canonical and derive all reads from it. Option (a) is simpler when the number of consumers is small and known.

**Incident:** Grid reorder (2026-04-05) — masonry view drag saved `gridOrder` but not project `order` fields, causing case study navigation to ignore reordering.

---

<a id="eap-072"></a>
## EAP-072: SVG fill="currentColor" stale after client-side navigation

**Status: ACTIVE**

**Trigger:** An SVG component uses `fill="currentColor"` (HTML attribute) to inherit color from a CSS module class, and the component renders after a client-side navigation (`router.push()`, `<Link>`) from a different route.

**Why it's wrong:** When a component renders after client-side navigation, its CSS module is loaded dynamically via JavaScript. The SVG's `fill="currentColor"` attribute resolves during initial render before the module stylesheet arrives, caching the inherited text color (typically near-black from `body`). When the stylesheet loads and sets the CSS `color` property, browsers do not re-resolve `currentColor` in already-resolved SVG fill attributes. Properties without inherited defaults (like `background-color`) are unaffected because there's no stale value to cache. This makes the bug intermittent and route-dependent: direct navigation works (CSS in initial HTML), client-side navigation doesn't.

**Correct alternative:** When an SVG component's fill color comes from a CSS module class, always add an explicit CSS `fill` rule targeting **`path` (or other painted shape) elements** in the module. CSS `fill` on `<path>` is re-evaluated when stylesheets load and on `:hover` / theme changes, unlike `currentColor` baked into SVG HTML attributes. Prefer `path { fill: … }` over relying on `svg { fill: … }` alone when the root `<svg>` still has `fill="currentColor"` — the latter pattern failed for TestimonialCard LinkedIn hover accent (ENG-127). Keep `fill="currentColor"` in the HTML as a fallback for pre-CSS render:

```scss
.icon {
  color: var(--portfolio-text-terra);

  path {
    fill: var(--portfolio-text-terra);
  }
}
```

**Scope:** Any SVG using `fill="currentColor"` that renders on a page reached via client-side navigation. On this site, the password gate (`/for/[company]` → `router.push("/")`) makes the homepage the primary risk area. Admin-only components (inline edit, modals) are lower risk since they load with their own route CSS.

**Incident:** ENG-126 (2026-04-06) — TestimonialCard quotation marks rendered black instead of Terra amber on the main site.

---

<a id="eap-073-b"></a>
## EAP-073: Implementing Before Diagnosing Visual Bugs

**Trigger:** A user reports a visual bug (e.g., "the image doesn't fill the slot"). The agent writes a CSS fix immediately.

**Why it's wrong:** Without diagnosing WHAT the browser actually renders, the agent has no way to distinguish between: (a) the CSS isn't being applied (specificity, cache, class mismatch), (b) the CSS is applied but produces wrong output (layout model misunderstanding), or (c) the visual appearance is correct but the content itself (e.g., the image composition) creates the perceived gap. Four consecutive implementation attempts — `position: absolute`, `next/image fill`, `background-image`, then diagnostic — wasted the user's time because the first three all targeted the same hypothesis without testing it.

**Correct approach:**
1. **Step 1 (diagnostic):** Add `background: magenta` (or similar high-contrast color) to the container to determine whether the gap is the container background showing through (CSS issue) or the image's own content (not a CSS issue).
2. **Step 2 (hypothesis):** Based on the diagnostic, form a targeted hypothesis.
3. **Step 3 (implement):** Apply the minimal fix that addresses the confirmed root cause.

**Also wrong:** Escalating to worse engineering practices (`background-image` for CMS content, inline styles) when simpler approaches don't work. Complexity escalation without diagnosis is a sign of guessing, not debugging.

**Incident:** FB-122 (2026-04-06) — Hero image gap reported 5 times across 4 failed CSS fixes.

---

<a id="eap-075"></a>
## EAP-075: Payload Schema Drift Hanging Non-Interactive Dev Server

**Trigger:** A field is removed from a Payload collection schema in code, but the corresponding database column is not dropped. The dev server is started in a non-interactive shell (background process, CI, agent-controlled terminal).

**Why it's wrong:** Payload's auto-push detects the schema drift and prompts interactively: "You're about to delete X column — Accept? (y/N)". In a non-interactive environment, this prompt blocks the entire Node.js process forever. The server accepts TCP connections but never responds to HTTP requests, making it look like a zombie server rather than a blocked prompt.

**Correct approach:**
1. When removing a field from a Payload collection, always drop the column via SQL BEFORE restarting the dev server: `ALTER TABLE <table> DROP COLUMN <column>`.
2. Add column drops to `src/scripts/push-schema.ts` as `DO $$ BEGIN ... EXCEPTION WHEN undefined_column THEN NULL; END $$` blocks.
3. If the server hangs on "Pulling schema from database..." and then stops producing output, check for an interactive prompt by reading the full terminal output — the prompt may be hidden by spinner ANSI codes.

**Incident:** ENG-133 (2026-04-08) — `company_name` column removed from Projects schema but not from DB. Payload prompted for destructive schema push, blocking the server in a background shell.

---

<a id="eap-076"></a>
## EAP-076: Repeated `.next` Cache Clears When node_modules Is Corrupted

**Trigger:** The webpack dev server returns 500 on every page. The agent clears `.next` and restarts, gets the same error, clears `.next` again, tries Turbopack, gets the same error — repeatedly escalating cache clears without addressing the actual corruption source.

**Why it's wrong:** When BOTH webpack and Turbopack fail with the same symptom (missing manifests, missing runtime files), the problem is not in the `.next` build cache — it's in the source artifacts that the bundler uses to generate those files. Clearing `.next` only removes the output; if the input (node_modules) is corrupted, the output will be identically broken on every rebuild.

**Correct approach:**
1. If clearing `.next` doesn't fix a bundler failure, escalate immediately to `rm -rf node_modules && npm install`.
2. Diagnostic signal: if the error mentions missing files that the bundler should GENERATE (manifests, runtime.js, _document.js), but the `.next` directory is empty or freshly cleared, the bundler itself is broken — not the cache.
3. Never clear `.next` more than twice for the same error. The second clear is already redundant; a third is wasted time.
4. Next.js's "Ready in Xms" only means the HTTP listener is bound. It does NOT mean the bundler is functional. Always verify with an actual page request.

**Incident:** ENG-134 (2026-04-08) — Four `.next` clears and two bundler mode switches before identifying corrupted node_modules as the root cause. ENG-206 (2026-04-24) — Boot up; main site HTTP 500 with webpack ENOENT on manifests and `layout.js` chunks; `.next` wipe + restart did not recover; `rm -rf node_modules .next` + `npm install` did.

---

<a id="eap-074"></a>
## EAP-074: Deleting Capacity Metadata on First Content Mutation / Multi-Layer Data Stripping

**Trigger:** A data structure has both "capacity" metadata (e.g., `placeholderLabels` defining how many slots exist) and "content" data (e.g., `images` array). The metadata is stripped at multiple independent layers: a mutation function deletes it, a server-side mapping conditionally excludes it, and the client renders a binary all-or-nothing view.

**Why it's wrong:** The capacity metadata defines the total structure (how many slots, what each slot represents). When multiple layers independently decide to strip it, fixing one layer is insufficient - the bug appears unchanged because another layer still drops the data. This makes debugging deceptive: "I fixed it but it still doesn't work" leads to confusion about whether the fix was correct.

**Correct approach:**
1. Never delete capacity/schema metadata during content mutations. The metadata is structural, not transient.
2. Server-side mapping functions should pass metadata through unconditionally. Filtering decisions belong in the rendering layer, not the data layer.
3. Rendering should iterate over the capacity metadata (e.g., `placeholderLabels.map`) and check per-slot whether content exists, not branch on a single boolean (`images.length > 0`).
4. When debugging a "fix didn't work" report, trace the full data path: mutation -> storage -> fetch -> mapping -> rendering. Each layer can independently filter, transform, or discard data.
5. Descriptive metadata (like placeholder labels) that becomes content metadata (like alt text) should be transferred at the point of content creation, not discarded.

**Incident:** ENG-132 (2026-04-07) — Three independent layers stripped `placeholderLabels`: CMS mutation (`delete`), server mapping (conditional `undefined`), client rendering (binary conditional). Fixing only the first layer appeared to have no effect.

<a id="eap-073-c"></a>
## EAP-073: Progressive Enhancement That Strips Content Formatting

**Trigger:** A component has an HTML-native rendering path (e.g., `dangerouslySetInnerHTML` with rich HTML) and a JS-enhanced rendering path (e.g., a text-wrapping library that operates on plain text). The JS path activates after mount and replaces the HTML path, stripping formatting in the process.

**Why it's wrong:** The JS enhancement is meant to improve layout (e.g., text wrapping around an SVG), but it operates on plain text extracted from rich content. When it takes over, `<strong>`, `<em>`, paragraph breaks, and other formatting are silently lost. The issue is environment-dependent: if the JS enhancement fails or runs slower in dev mode, the HTML path stays active and formatting appears correct locally, but breaks on the deployed site where JS succeeds.

**Correct approach:**
1. When rich HTML content (`textHtml`) is available, skip the JS text-wrapping enhancement entirely and rely on CSS-native wrapping (e.g., `float: left` on the element the text wraps around). CSS float wrapping preserves all HTML formatting.
2. Reserve JS text-wrapping for plain text only (when no `textHtml` exists).
3. If JS wrapping must support rich text, it should operate on the HTML string (preserving tags) rather than the plain text extraction.

**Incident:** ENG-104 (2026-04-08) — `@chenglou/pretext` text-wrapping replaced `dangerouslySetInnerHTML` with bold and paragraph markup, stripping both on the deployed site. Local dev showed formatting because pretext didn't activate.

<a id="eap-077"></a>
## EAP-077: Assuming CSS Can Fix `<input>` Native Text Clipping for Oversized Serif Fonts

**Trigger:** A serif font at display scale (2rem+) is used inside a native `<input>` element. Glyphs with negative left side-bearing (serif hooks, tittles) appear clipped at the leftmost pixel.

**Why it's wrong:** The `<input>` element has browser-internal text clipping at the text origin. This boundary moves WITH padding — `padding-left` shifts both the text and the clip boundary by the same amount. No CSS property fixes this:
- `padding-left` — moves clip boundary with the text (confirmed up to 20px)
- `overflow: visible` on the input — browsers ignore it for replaced elements
- `overflow: visible` on all parent divs — the clip is internal to `<input>`, not from parent overflow
- `box-sizing: border-box` — no effect on internal clip behavior
- `text-indent` — same behavior as padding (clip boundary follows)

This was confirmed through 6+ iterative attempts in a single session. The failure mode is insidious because the text visibly shifts (proving padding applies), but the clip persists (proving the clip boundary is coupled to the text origin, not the element edge).

**Correct approach:** Text overlay pattern:
1. Set `color: transparent` on the `<input>` (hides native text rendering)
2. Set `caret-color: var(--text-color)` (keeps cursor visible for editing UX)
3. Render a sibling `<span>` with `position: absolute` displaying the same value
4. The `<span>` uses standard DOM text rendering with no internal clip boundary
5. Handle `::selection` on the input: `background: [brand-color]; color: transparent` to show branded highlight without double-text

**When it matters:** Only when (a) using serif fonts with prominent glyphs at display scale AND (b) the glyph is the first character AND (c) the glyph has negative left side-bearing. Sans-serif fonts at normal sizes (16-18px) are fine.

**Incident:** ENG-139 (2026-04-08) — IBM Plex Serif "j" at 2.75rem clipped in login password input. Six CSS-only fix attempts failed before the text overlay pattern resolved it.

<a id="eap-078"></a>
## EAP-078: Using `min-height` to Reserve Space for Conditional Content in Flex-Centered Layouts

**Trigger:** A container inside a flex-centered parent uses `min-height` to "reserve space" for conditionally rendered content (error messages, tooltips, expanding sections).

**Why it's wrong:** `min-height` sets a floor but does not cap growth. If the conditional content makes the container even 1px taller than the `min-height` value, the container grows, the parent recalculates centering, and all siblings shift. The exact token math is fragile — rounding, sub-pixel rendering, or slightly different font metrics across browsers can push the content past the `min-height` threshold.

**Correct approach:** Use fixed `height` with `overflow: visible`:
```css
.container {
  height: 100px;      /* always contributes exactly 100px to parent layout */
  overflow: visible;   /* conditional content still renders, just doesn't affect flow */
}
```
The parent layout always sees a constant box. Any content that exceeds the height overflows visually but doesn't push siblings.

**Incident:** ENG-137 (2026-04-08) — Login page `inputArea` with `min-height: 90px` grew to ~94px when error text appeared, shifting the vertically centered card up/down. Changed to `height: 100px; overflow: visible`.

<a id="eap-079"></a>
## EAP-079: Adding a Public Asset Directory Without Updating the Proxy Allowlist

**Trigger:** A new directory is created under `public/` (e.g., `/videos/`) and referenced by a page that unauthenticated users see (e.g., the login page), but the directory path is not added to the proxy's static asset passthrough list in `src/proxy.ts`.

**Why it's wrong:** The password gate proxy (`src/proxy.ts`) redirects all unauthenticated requests to `/for/welcome` unless the path is in the allowlist. Static assets in `/_next/`, `/images/`, `/media/` are allowlisted, but new directories are not. The asset request receives a 307 redirect to an HTML login page instead of the actual file. For video/media assets consumed by JavaScript (WebGL textures, `<video>` elements), this fails silently — the element receives HTML content, can't parse it, and renders nothing. No error is thrown in the console.

**Correct approach:** Whenever adding a new `public/` directory:
1. Add `pathname.startsWith("/your-directory/")` to the proxy allowlist in `src/proxy.ts`
2. Verify with `curl -s -o /dev/null -w "%{http_code}" "http://localhost:4000/your-directory/file.ext"` — must return 200, not 307
3. Test in incognito (no session cookie) to confirm unauthenticated access works

**Incident:** ENG-140 (2026-04-09) — `/videos/portrait.mp4` returned 307 in incognito, leaving the halftone portrait canvas blank.

<a id="eap-080"></a>
## EAP-080: Adding `overflow: hidden` to Display-Scale Serif Text Without Glyph Padding

**Trigger:** Adding `overflow: hidden` (for any reason — truncation, width constraint, scroll containment) to an element that renders serif text at display scale (2rem+).

**Why it's wrong:** This is a re-manifestation of EAP-077 (native `<input>` text clipping). The original anti-pattern documented that `<input>` elements have unfixable internal clip boundaries. EAP-080 extends this: `overflow: hidden` on ANY element creates the same clip boundary. With `line-height: 1`, the element's box is exactly the font-size height. Serif ascender overshoots (tittles, hooks) extend above the box, and descender overshoots extend below. `overflow: hidden` clips both. The agent documented EAP-077 in the same session, then immediately violated the principle by adding `overflow: hidden` to a `<span>` rendering the same text.

**Correct approach:** When adding `overflow: hidden` to display-scale serif text:
1. Add internal padding to the element: `padding-top: ~6px` for ascender overshoots, `padding-bottom: ~4px` for descenders
2. Adjust `top`/positioning to compensate for the added padding
3. Visually verify with characters that have prominent overshoots: j, f, g, y, Q

**Incident:** ENG-141 (2026-04-09) — `.typedText` given `overflow: hidden` for long-password truncation, immediately clipping the "j" tittle that FB-129/ENG-139 had just fixed.

<a id="eap-081"></a>
## EAP-081: Relocating a CMS-Rendered Element by Copying SCSS Class Values Instead of Rendered Output

**Trigger:** Moving an element that uses `EditableText` (or any CMS-backed component) with `htmlContent`, `inlineTypography`, or rich text props from one component to another.

**Why it's wrong:** `EditableText` with `htmlContent` or `inlineTypography` allows CMS-stored rich text to completely override the SCSS class defaults (font-family, font-weight, color, etc.). The SCSS class is a fallback, not the visual truth. Copying the SCSS class values produces a visually different element — the agent reads `font-family: sans; font-weight: bold` from the stylesheet and applies those, while the actual rendered element was `font-family: serif; font-weight: 400` because the CMS content overrode the class. This is a special case of the broader principle in Hard Guardrail Engineering #12 ("ALWAYS trace data flow: source → build → server → browser when debugging visibility issues") — it applies equally when constructing, not just debugging.

**Correct approach:** When relocating any element that renders CMS data:
1. Identify override-capable props: `htmlContent`, `inlineTypography`, `dangerouslySetInnerHTML`, rich text fields
2. If any exist, the SCSS class does NOT fully describe the output — check the rendered DOM or ask
3. Match the rendered visual properties (font, weight, size, color), not the SCSS class defaults
4. If the destination component won't use `EditableText`, bake the actual visual values directly into its SCSS

**Signals that SCSS class values are unreliable:**
- `htmlContent` prop is present (CMS stores formatted HTML)
- `inlineTypography` prop is `true` (CMS controls font styling)
- `isRichText` prop is `true` (Lexical rich text field)
- `storedValue` differs from `children` (stored value has HTML, children has plain text)

**Incident:** ENG-105 (2026-04-09) — Name moved from sidebar to nav; `.name` class had `sans/bold` but CMS rendered `serif/regular` via `htmlContent` + `inlineTypography`. Three correction rounds needed.

<a id="eap-082"></a>
## EAP-082: Adding a Variant/Prop to a DS Component Without Updating the Playground Page

**Trigger:** Adding a new variant, prop, or visual state to any component in `src/components/ui/`.

**Why it's wrong:** The playground is the living documentation for the design system. A variant that exists in code but not in the playground is invisible to other consumers. The agent's workflow had no catch for this — the playground skill only activated when directly editing playground files, and the cross-app parity checklist only covered component creation and token sync, not variant additions.

**Correct approach:** Whenever adding a new variant, prop, or visual state to a DS component:
1. **Read** the corresponding playground page (`playground/src/app/components/<name>/page.tsx`) FIRST to understand existing structure, section ordering, and conventions
2. **Add** a new `ComponentPreview` section for the variant, placed in the logical position relative to existing previews
3. **Update** the `PropsTable` with the new prop name, type, default, and description
4. **Update** any Notes section if the variant has usage guidance

**Signals that playground documentation is needed:**
- New prop added to a component's TypeScript interface
- New SCSS modifier class (e.g., `&.solid`, `&.compact`)
- New exported type (e.g., `NavigationAppearance`)
- New visual state not previously documented

**Incident:** ENG-106 (2026-04-09) — `solid` appearance variant added to Navigation, playground page not updated until user prompted.

<a id="eap-083"></a>
## EAP-083: Overriding a Pressure-Tested Architectural Decision Without Checking History

**Trigger:** An agent replaces a rendering/infrastructure approach (buffer strategy, compositing method, UV mapping, state management pattern) with a "better" alternative without searching the project history for why the current approach was chosen.

**Why it's dangerous:** Architectural decisions in this project are often the surviving option from a pressure-tested set of alternatives. The current approach may look suboptimal in isolation, but it was chosen because the alternatives caused specific, documented problems (shader distortion, sync issues, hydration mismatches, etc.). Replacing it without understanding the rejection reasons reintroduces the exact problems that were already identified and solved.

**Correct approach:**
1. Before changing any rendering architecture, **search agent transcripts and feedback logs** for the history of the current implementation
2. If the current approach was pressure-tested, **read the audit findings** that led to the decision
3. If you still believe a different approach is better, **explain why the original rejection reasons don't apply** before proceeding
4. Parameter tuning (values, curves, thresholds) within an existing architecture is safe; structural changes (buffer strategy, compositing method, UV mapping) require history review

**Incident:** ENG-108 (2026-04-09) — Replaced the pressure-tested fixed square buffer + `object-fit: cover` with ResizeObserver + dynamic sizing + getVideoUV remapping. This was the exact approach rejected in the original halftone portrait audit (finding #2). Caused severe portrait distortion.

<a id="eap-084"></a>
## EAP-084: Portalling Directly to `document.body`

**Trigger:** Using `createPortal(element, document.body)` to render an element outside the React tree.

**Why it's dangerous:** React doesn't own `document.body` — other scripts, HMR, and React's own reconciliation can modify its children. On unmount, React calls `parentNode.removeChild(child)`, but if the DOM has been mutated by something other than React, `parentNode` can be null, throwing `TypeError: Cannot read properties of null (reading 'removeChild')`. This is especially common during Webpack HMR, route transitions, and StrictMode double-renders.

**Correct approach:** Create a dedicated container `<div>` in a `useEffect`, append it to `document.body`, and portal into the container. The cleanup function removes the container with a null-check (`if (el.parentNode) el.parentNode.removeChild(el)`). React fully owns the container's children, so `removeChild` always has a valid target.

**Incident:** ENG-111 (2026-04-10) — `CursorThumbnail` used `createPortal(el, document.body)` and threw `removeChild` TypeError on HMR/unmount.

<a id="eap-085"></a>
## EAP-085: Using `transform: translate()` with CSS Individual `scale` Property

**Trigger:** Positioning an element with `el.style.transform = "translate(x, y)"` while also animating the CSS individual `scale` property (e.g., `scale: 0` → `scale: 1`).

**Why it's dangerous:** CSS individual transform properties compose in a fixed order: `translate → rotate → scale → transform`. The `transform` shorthand is applied AFTER `scale` in the rendering pipeline, so scale multiplies translate values. At `scale: 0`, `transform: translate(500px, 300px)` resolves to `(0, 0)` — the element collapses to the viewport origin. During the `scale` transition, the element slides from (0, 0) to (x, y) instead of growing in-place. This is extremely non-obvious because the positioning "works" at `scale: 1` — the bug only manifests during the transition.

**Correct approach:** Use the individual CSS `translate` property (`el.style.translate = "x y"`) for positioning. Individual `translate` is step 3 in the composition order (before `scale` at step 5), so position is independent of scale value. Alternatively, put both position and scale inside the `transform` shorthand in the correct order: `transform: translate(x, y) scale(s)` — but this prevents transitioning scale independently via CSS.

**Incident:** ENG-113 (2026-04-10) — Cursor thumbnail flew from top-left viewport corner instead of growing from cursor position. Three fix attempts (React timing, pre-positioning, stable wrapper div) all failed because the root cause was CSS composition order, not DOM lifecycle.

<a id="eap-087"></a>
## EAP-087: Modifying a Content Seeding Route Without Calling the Endpoint

**Trigger:** Editing any `src/app/(frontend)/api/update-*/route.ts` file (content constants, block structure, blurb, scope, section headings) without calling the corresponding POST endpoint to push the changes to the CMS database.

**Why it's dangerous:** These route files are content *definitions*, not content *deployments*. The file can be saved, linted, and committed while the CMS database still contains the old content. The agent reports the task as done, the user navigates to the page, and sees stale content. The disconnect is invisible during implementation because the agent never verifies the frontend output.

**Correct approach:** After modifying any `update-*` route file: (1) call the POST endpoint (`curl -X POST http://localhost:4000/api/update-{slug}`), (2) confirm the response shows `action: "updated"`, (3) verify via Payload REST API or frontend curl that the new content is present. All three steps are mandatory before reporting the content edit as done.

**Applies to:** `update-etro`, `update-meteor`, `update-lacework`, `update-elan`, and any future `update-*` seeding routes.

**Incident:** ENG-149 (2026-04-12) — Entire ETRO essay rewrite (9 tasks, 5 sections, blurb, scope) completed without ever calling the endpoint. User saw unchanged content on the live page.

<a id="eap-086"></a>
## EAP-086: Per-Frame Collision Detection Feeding Variable Offsets into a Fixed-Range Lerp

**Trigger:** Running `getBoundingClientRect()` collision checks every frame in a RAF loop and using the result to modify an offset that's smoothed by a lerp designed for small, binary flips.

**Why it's dangerous:** The lerp system (e.g., `FLIP_EASING = 0.12`) is tuned for flipping between two values close together (e.g., +16px and -176px for viewport edge flips). Feeding it collision-avoidance offsets that can be 100-300px from the cursor creates three failures: (1) the lerp takes 40+ frames to converge on the large target, making the thumbnail feel detached; (2) the collision check runs against the *target* offset while the *rendered* position uses the *lerped* offset, causing frame-to-frame oscillation where the check alternates between "needs avoidance" and "avoidance resolved"; (3) multiple `getBoundingClientRect()` calls per frame forces layout recalculation inside the animation loop.

**Correct approach:** For element-avoidance near a cursor-following element: (1) compute the avoidance zone once on `pointerenter` and commit to a fixed offset for the duration of the hover, or (2) use opacity reduction on overlap instead of repositioning, or (3) use a separate post-processing nudge with its own easing, applied after all other position calculations, checking overlap against the un-nudged natural position to prevent oscillation.

**Incident:** ENG-114 (2026-04-11) — Text-avoidance collision detection made the cursor thumbnail stop following the cursor. Reverted, then re-implemented using approach (3): a separate `nudgeRef` with `NUDGE_EASING = 0.3`, cached text rects on `pointerenter`, overlap checked against natural position only.

**Update (2026-04-11, ENG-116):** Approach (3) was itself superseded by a deterministic "horizontal rail" model. When the element's vertical position is fully determined by another element's rect (not the cursor), the correct approach is to compute position as a single formula (`headlineRect.bottom + RAIL_GAP`) rather than adding avoidance layers. The nudge system, text-rect collection, and cursor y lerp were all removed. The anti-pattern remains valid for cases where the positioned element genuinely tracks the cursor in both axes — but for cursor-following UI where one axis is anchor-determined, prefer deterministic positioning over collision avoidance.

<a id="eap-088"></a>
## EAP-088: Archiving a Page by Copying Instead of Deleting the Original

**Trigger:** When a page is "archived" (e.g., copied to `archive/<feature>/pages/`), the originals under `src/app/.../page.tsx` and its co-located `*Client.tsx` are left in place and marked as untracked in git.

**Why it's dangerous:** Next.js App Router **route groups** (folder names in parentheses, e.g. `(site)`) do not contribute URL segments. Two sibling files — `src/app/(frontend)/page.tsx` and `src/app/(frontend)/(site)/page.tsx` — therefore both bind to `/`. Next.js webpack dev mode does **not** throw a "conflicting page" error for this configuration; it silently chooses the shallower file. The archival appears successful (new page code exists, old page lives in `archive/`), but the **old page is still what production serves**. The bug survives every reload, every `.next` flush, every restart, because the file system itself is the source of truth. It can persist invisibly for days — ENG-151 lived for 8 days after ENG-145 "archived" the v1 homepage.

**Correct approach:** Archival means **move**, not **copy**. After copying files into `archive/`, delete the originals and verify:
1. `git status` shows the old paths as deleted (not just untracked).
2. Curl the route with a distinctive string from the *new* page (not a shared nav/footer element) and grep the response. Example: for a homepage swap, grep for a class name that only exists in the new `HomeClient.tsx`, not `"Yilan Gao"` which would appear in both.
3. Grep the whole `src/app/` tree for duplicate `page.tsx` at the same URL resolution. In particular, remember that `app/X/page.tsx` and `app/X/(group)/page.tsx` resolve to the same URL.

**Incident:** ENG-151 (2026-04-17) — Old `src/app/(frontend)/page.tsx` + `HomeClient.tsx` (v1 masonry homepage) remained on disk after ENG-145 (2026-04-09) copied them into `archive/homepage-v1/pages/`. Both shadowed the canonical `src/app/(frontend)/(site)/page.tsx`. User reported the wrong homepage was served on localhost:4000 after `boot up`. Fix: deleted the two shadowing files; new homepage served immediately after cache flush.

---

<a id="eap-089"></a>
## EAP-089: Gating Admin-Only UI on a Plumbing Prop That Happens to Be Truthy

**Trigger:** A UI section that should only render for admins (or only render when it has data, for visitors) is wrapped in `{(someTargetProp || value) && (...)}` where `someTargetProp` is a plumbing object like `editTarget`, `projectTarget`, `cmsId` — something whose truthiness mostly tracks "we have enough info to save this field," not "the current viewer is an admin."

**Why it's wrong:** Plumbing props and mode flags look similar in code but diverge on the published site. `projectTarget = p.id ? { type: 'collection', slug: 'projects', id: p.id } : undefined` is truthy for *every* project that has an id — which is every published project. A guard like `{(projectTarget || items.length > 0) && (...)}` therefore **always renders**, whether the viewer is admin or not. The first time the author writes it, the behavior looks correct because they test it in admin mode and see the section. The bug only surfaces on the published site when an optional field is empty — by which time the author is long gone from the code. The archive shows this class of bug regressing: an earlier fix (2026-04-08) used `projectTarget` as shorthand for "editing mode" and shipped a guard that never actually hid anything. The error is impossible to catch by local testing in admin mode; it requires either an explicit visitor-mode test or an explicit type distinction between "plumbing" and "mode."

**Correct alternative:** The only correct gate for "this element should appear in admin mode but not on the published site" is the explicit mode flag — in this codebase, the `isAdmin` prop. Use `{(isAdmin || <field has data>) && (...)}` for optional meta fields. For the editable-vs-plain fallback *inside* a rendered section, combine both: `{isAdmin && projectTarget ? <EditableText …/> : <span …/>}`. `projectTarget` stays in the conjunction because the editable component literally requires the target plumbing; `isAdmin` makes the mode gate explicit and visible.

**Naming rule:** Props named `*Target`, `*Id`, `cms*` describe *what the component can save to*, not *who is looking*. Mode flags are named `isAdmin`, `isEditing`, `mode === 'edit'` — they describe the viewer. Never substitute one for the other, even when they happen to coincide in your test environment.

**Incident:** ENG-153 (2026-04-19) — Case study sidebar "LINKS" eyebrow rendered on the published site for a project with no external links. The guard `(projectTarget || p.externalLinks.length > 0)` always evaluated to `true` because `projectTarget` was defined for every project with an id. Also applied to Role / Collaborators / Duration / Tools in the same sidebar (they happened to always have values on existing projects, so no visible regression — but the same mis-gate was there). Fix: replaced `projectTarget` with `isAdmin` in all five `metaGroup` render gates and in the inner editable-vs-plain branches.

---

<a id="eap-090"></a>
## EAP-090: Parallel Content Pipelines on a Block-Editor Page

**Trigger:** A page that already has a typed block array (`content[]`) with full inline-edit chrome (insert above/below, move, delete, change type) *also* renders a user-content paragraph from a separate top-level field, via its own dedicated render path. Common shapes: a "legacy" or "predecessor" field (`description`, `excerpt`, `intro`, `sections`) that shipped before the block system landed, kept "for now" as a fast render path, never reconciled. Another shape: a "canonical" field whose author thought it was too important to express as just another block.

**Why it's wrong:** The block editor's affordances are architecturally bound to the block array. `BlockToolbar`, `BetweenBlockInsert`, `addBlock`, `moveBlock`, and every hover UI reads positions and types from `content[]`. Anything rendered outside that array is permanently invisible to the block UI — no amount of CSS or JSX wrapping can retroactively attach toolbar chrome to a paragraph that doesn't have an index in the block list. Users discover this as "I can't insert a block above this paragraph" (hover has no `BetweenBlockInsert` there) or "I can't delete/move this paragraph" (no `BlockToolbar` wraps it). The cost compounds: every new block type, every new toolbar action, every new keyboard shortcut has to be retrofitted against the legacy path, or the page has two inconsistent editing experiences forever. And because the legacy field is usually rendered at a fixed position (top of page, above `content[]`), users can't even move the block list *above* the legacy field, so the page layout itself is frozen.

**Correct alternative:** One content pipeline per page. If a page uses `content[]`, every user-editable text paragraph on that page lives inside `content[]`. Three options:
1. **Prefer: synthesize from seeding.** Make the seeding helper (e.g. `createCaseStudyBlocks`) always synthesize a well-known block at a known index (`content[0]` or `content[1]` after hero). Callers pass raw markdown, the helper emits a standard `richText` block. Users see it as an ordinary block, with full affordances. This is how scope statements are handled post-ENG-154.
2. **If the content has distinct semantics:** Add a new `blockType` to the blocks config (e.g. `blockType: 'scopeStatement'`). Gives type-safe rendering, distinct styling, and still lives in `content[]` with full block affordances. Heavier — requires a new Payload block schema, a new renderer branch, and parity updates.
3. **Do not:** Add a second top-level richText field and render it inline. That's exactly the pattern this anti-pattern prohibits.

**Migration pattern for legacy fields:** When an old top-level field already has data in production, write a one-time, idempotent migration endpoint: for each document, if the legacy field has content, insert a new block at the canonical index and clear the legacy field. Check idempotency by plain-text match of the target index. Gate with `NODE_ENV !== 'production'` or a dev-only secret. After migration, delete the render path and hide the field in the admin (`admin: { condition: () => false }`) — do **not** remove from schema, so the migration can read existing rows and rollback is possible.

**Incident:** ENG-154 (2026-04-19) — Case study pages rendered a scope-statement paragraph from the top-level `description` field, at a fixed position between hero and `content[]`. Hovering it showed no `BetweenBlockInsert` above (there was no "above" in the block system), no `BlockToolbar`, no way to change type or move it. Root cause: `ProjectClient.tsx` had a dedicated `{p.description && <FadeIn><div id="overview">…</div></FadeIn>}` branch outside the block loop. The identical pattern had already been resolved once for a legacy `sections` field, but the general principle wasn't codified. Fix: migrated every project's `description` into `content[heroIdx+1]` as a `richText` block via `/api/migrate-description-to-block`, taught `createCaseStudyBlocks` to always emit the scope statement as a managed block, deleted the render branch in `ProjectClient.tsx`, hid the field in the schema. Every case study now has exactly one content pipeline.

---

<a id="eap-094"></a>
## EAP-094: Trusting a Continuation Summary Over the Filesystem

**Trigger:** A session resumes or compacts context, producing a summary that describes past work as "completed." The agent then proceeds to the next step (verification, response, new task) without actually reading the files the summary claims were edited. The summary is treated as ground truth about the state of the filesystem.

**Why it's wrong:** Continuation summaries describe *intent and belief*, not disk state. They're produced from the agent's memory of what it said it would do, not from a post-hoc `git diff`. When an edit was planned but interrupted, or was attempted but failed silently (e.g. a tool call that didn't land, a multi-step edit where only the first step completed before compaction), the summary will still list it as completed — because the agent *intended* it to be completed. The agent then writes a response to the user that asserts the edit as a fact. The user discovers the missing edit in the UI; the trust cost is high and recurring.

**The specific failure shape from ENG-156:** After a summary claimed "deleted legacy `description` render path from `ProjectClient.tsx`," the agent moved directly to verification without `git diff` or `Grep` against the file. The verification step then picked a generic structural marker (`data-block-index` count, HTTP 200) that passes whether or not the deletion actually happened. The response to the user claimed "legacy description is gone" while the literal `<p class="legacyDescriptionText">Project description.</p>` element was still served on every case study — including being *supplied* by an unrelated fallback string in `page.tsx` (`descPlain = extractLexicalText(doc.description) || "Project description."`) that was also described as deleted but wasn't.

**Correct alternative — three-part ground-truth check at every session boundary:**
1. **Before trusting any "completed" bullet in a summary, `git diff <file>` or `Grep` for the strings the edit was supposed to remove/add.** If the diff doesn't contain the expected change, the edit didn't land — redo it, don't assume.
2. **Verify for the bug, not for the framework.** If the user complained about a specific element (`legacyDescriptionText`, a particular text string, a specific class), `curl` and grep for *that*. Generic markers (HTTP 200, block count, "page renders") confirm the page is alive, not that the specific bug is fixed. The correct verification question is always: "would the user's original complaint still be true after my change?" — and the test has to target the exact thing they complained about.
3. **Distinguish "the edit is described in my summary" from "the edit is in the working tree."** These are different propositions and only one of them is a fact. A summary bullet is never sufficient evidence that a file changed on disk.

**Related anti-patterns:** EAP-010 / EAP-027 (documentation as pre-condition — the documentation half of this failure). EAP-020 family (verification gaps — this is the post-resumption variant). Hard Guardrail #10 (localhost verification — this is the specific reinforcement that structural markers don't substitute for distinctive-string grep).

**Incident:** ENG-156 (2026-04-19) — User reported seeing `<p>Project description.</p>` on every case study under `#overview`, with no editing affordances, immediately after ENG-154 was reported resolved. Root cause: two files (`ProjectClient.tsx`, `page.tsx`) described as edited in the continuation summary were never actually touched. The placeholder text `"Project description."` was even being supplied by a fallback in `page.tsx` that the summary claimed had been removed. Verification in the prior turn grepped for `data-block-index` (which passed trivially) instead of `legacyDescription` or `"Project description"` (which would have immediately exposed the regression). Fix: reread both files, executed the real deletions, grepped for the exact bug strings across all four case studies — zero matches confirms the fix. Pattern recorded because this is the second instance in two sessions where a continuation summary's completion claim was accepted without a filesystem check.

---

<a id="eap-091"></a>
## EAP-091: Using `window.confirm` (or Hand-Rolled Portals) in Inline-Edit Paths

**Trigger:** A destructive inline-edit action (delete block / section / image / array item / row) falls back to `window.confirm("…")`, a hand-rolled `createPortal` dialog, or an ad-hoc confirmation state per component.

**Why it's wrong:** Browser `window.confirm` is not themable, not focus-trapped, not announceable to screen readers beyond the browser default, and blocks the main thread. A hand-rolled portal dialog looks correct in one component but drifts — its a11y attributes, focus management, backdrop click behavior, keyboard shortcuts, and styles diverge from every other confirmation surface in the app. Four primitives each with their own confirmation means four different looks, four different keyboard contracts, and four separate places to find a bug when one of them misbehaves. A single DS `AlertDialog` on Radix primitives gives us focus trap, `role="alertdialog"`, themed surfaces, and a single place to change the look.

**Correct alternative:** Import the declarative `ConfirmDelete` (for one-off triggers) or the imperative `useConfirm()` hook (for flows where the confirm has to be awaited inside an async operation) from `src/components/inline-edit/`. Both are mounted under `ConfirmProvider` inside `InlineEditProvider`, so any descendant can call `await confirm({ title, description })` and get a boolean back. Never import `window.confirm` from anywhere in `src/components/inline-edit/` — treat it as a banned API in that tree.

**Incident:** ENG-155 (2026-04-19) — `SectionManager.deleteSection`, `ImageManager.deleteImage`, `CollectionActions.DeleteItemButton`, and `useBlockManager.deleteBlock` all had different confirmation behavior: the first two used `window.confirm`, the third used a hand-rolled portal, and the fourth had no confirmation at all. Migrated every destructive delete to `useConfirm()` / `ConfirmDelete` backed by the new DS `AlertDialog` component. `useBlockManager` gained a `confirmDeleteBlock` async wrapper so toolbar triggers go through confirm while keyboard-at-start fall-through deletes (empty-block merge) can still go direct.

---

<a id="eap-092"></a>
## EAP-092: Building Parallel Modal Systems Instead of Reusing `@ds/Dialog` + `@ds/AlertDialog`

**Trigger:** A feature needs a modal (edit panel, picker, confirmation). Instead of reaching for the DS dialog primitives, the agent builds a new overlay: a fixed-position `<div>` with a manual backdrop, its own open state, its own escape-key handling, and its own focus management.

**Why it's wrong:** Modals are high-leverage surfaces for consistency — bad ones are immediately visible and a11y-hostile. Radix Dialog / AlertDialog give us focus trap, `aria-labelledby`, Escape to close, backdrop click, scroll-lock, and portal semantics in ~3 lines of usage. A parallel system that re-implements even one of those incorrectly (a missing focus trap, a backdrop that closes a destructive confirm too eagerly) is a regression. Worse, every parallel modal has to be individually audited when the brand changes, because it doesn't consume shared tokens.

**Correct alternative:** Use `@ds/Dialog` for dismissable modals where any action (including backdrop click) is safe (edit panels, pickers, inline popovers). Use `@ds/AlertDialog` for destructive confirmation — it intentionally does **not** close on backdrop click, because a stray click shouldn't delete a block. If a new primitive is genuinely needed (rare), promote it to `@ds/*` first, then consume it — never inline a modal in a feature directory.

**Incident:** ENG-155 (2026-04-19) — `CollectionActions` had a hand-rolled portal dialog with a manual backdrop and keyboard handler that predated the existence of a DS confirmation primitive. Replaced by adding `AlertDialog` to the DS, registering it in `archive/registry.json`, shipping a playground page at `playground/src/app/components/alert-dialog/page.tsx`, and refactoring `DeleteItemButton` onto `ConfirmDelete`. The old CSS block in `inline-edit.module.scss` was removed so nothing in the tree could fall back to the parallel system.

---

<a id="eap-093"></a>
## EAP-093: Building a Second Toast / Announcement System Inside a Feature

**Trigger:** A feature needs to announce a success, an error, an undoable action, or a long-running state. Instead of using the shared toast surface, it invents a local pattern: a `setError` state rendered as a `<span>` next to the control, a `#live-region` `aria-live` div, or a per-component banner.

**Why it's wrong:** Three consequences, in order of how often they bite: (1) **Errors disappear with the component** — if the element unmounts during the operation that failed, the error has no render target. (2) **Screen reader behavior is inconsistent** — some paths announce via `aria-live`, some via `role="status"`, some not at all. (3) **Undo is impossible** — local error state can't express "I did a thing, you have N seconds to undo it" because it has no timing model or action slot. A shared toast system with `success` / `error` / `info` / `undoable` solves all three.

**Correct alternative:** Call `const toast = useToast()` inside any component under `InlineEditProvider` and use `toast.success(msg)`, `toast.error(msg)`, `toast.info(msg, { description, duration })`, or `toast.undoable({ message, onUndo, duration })` for destructive structural ops. Deletions of content rows (Lexical paragraphs, array items, blocks) should prefer `toast.undoable` so the admin can recover from a mistake without navigating through the CMS. Never create a new "live region" div or per-component error span.

**Incident:** ENG-155 (2026-04-19) — `useBlockManager`, `SectionManager`, `ImageManager`, `ImageUploadZone`, and `CollectionActions.AddItemCard` each had a local `error` state rendered inline, plus a parallel `#block-live-region` div for screen readers. Added `InlineToastProvider` + `useToast()` on `@radix-ui/react-toast`, mounted inside `InlineEditProvider` (wraps `ConfirmProvider`). Replaced every `setError` call with a `toast.error()`, deleted `#block-live-region`, and added `toast.undoable` for Lexical paragraph deletes (`ParagraphRowPlugin` snapshots the editor state before delete and replays it on undo). Every structural error now flows through one announced, accessible, dismissable surface.

<a id="eap-098"></a>
## EAP-098: Serving Supabase Storage Uploads Through Payload's `/api/media/file/*` Proxy

**Status: ACTIVE**

**Trigger:** Using `@payloadcms/storage-s3` against Supabase Storage with the shorthand `collections: { media: true }`, so `media.url` resolves to `/api/media/file/<filename>` (Payload's access-control proxy) instead of the direct Supabase public URL.

**Why it's wrong:** Three compounding consequences:

1. **Video never plays on refresh.** Payload's Node static handler streams binaries through the app process without advertising `accept-ranges: bytes`. Browsers that can't range-request a video either restart the download from byte 0 on every seek or give up waiting for metadata. Anything over a few MB stalls — the skeleton placeholder stays up forever.
2. **Zero CDN benefit.** Every media read is an app-server request on the site's own domain, sharing the process with authenticated CMS traffic. Cloudflare's cache in front of Supabase never sees the request, so there's no edge caching, no ETag validation, no `Cache-Control` benefit. Frontend asset preloading (`PreloadManager`) is also defeated — the "cached" binary is only cached in JS memory, not on disk.
3. **Hard 404s on filename-drift.** Payload's static handler resolves by looking up a media doc whose `filename` equals the URL segment. Any mismatch — a rename hook that didn't re-save, a legacy record with a different filename in the column, case sensitivity, URL-encoding — returns 404. The symptom is indistinguishable from "file missing from storage" even though the file exists in the bucket.

**Correct alternative:** In `src/payload.config.ts`, the `media` entry of `s3Storage({ collections })` must be an **object** with both flags:

```ts
s3Storage({
  collections: {
    media: {
      disablePayloadAccessControl: true,
      generateFileURL: ({ filename, prefix }) => {
        const bucket = process.env.S3_BUCKET || 'media'
        const publicBase = (process.env.S3_ENDPOINT || '').replace(
          '/storage/v1/s3',
          '/storage/v1/object/public',
        )
        return [publicBase, bucket, prefix, filename]
          .filter(Boolean)
          .join('/')
          .replace(/([^:])\/\/+/g, '$1/')
      },
    },
  },
  ...
})
```

`disablePayloadAccessControl: true` alone is insufficient for Supabase: the plugin's default URL builder produces `<endpoint>/<bucket>/<filename>`, which for Supabase points at the authenticated S3 API path (`/storage/v1/s3/…`). Anonymous reads against that path return 400. The custom `generateFileURL` rewrites it to the public CDN path (`/storage/v1/object/public/…`). `getAfterReadHook` in `@payloadcms/plugin-cloud-storage` recomputes `url` on every read from the stored `filename`, so there is no DB migration.

**Detection:**

```bash
rg '/api/media/file/' src/ --type tsx --type ts --type jsx --type js  # should return 0 matches in rendered output
curl -s "http://localhost:4000/api/media?limit=3&depth=0" | rg '"url":"[^"]*"'
# every url must start with https://<project-ref>.supabase.co/storage/v1/object/public/
curl -sI "$(video_src_from_DOM)" | rg 'accept-ranges: bytes'
# must exist
```

**Incident:** ENG-160 (2026-04-19) — A 6.8MB `<video>` played fine right after upload (admin was serving from an in-memory Object URL) but stalled indefinitely after refresh, because the persisted `media.url` was the Payload-proxied path, which returned 404 from the static handler for that specific filename and wouldn't have streamed with Range support even if it had matched. Fixed by adding `disablePayloadAccessControl: true` + a custom `generateFileURL` to the `media` collection. All existing records immediately recomputed to direct Supabase URLs on next read.

**Principle:** Static binary delivery must take the shortest, most cacheable path from origin to browser. Routing every media read through the app server is a regression in the best case and a hard 404 in the worst case. If the storage provider exposes a public URL, `url` must resolve to that public URL — never to any endpoint under the app's own domain.

<a id="eap-101"></a>
## EAP-101: Sparse-Array PATCH from `setNested` on Indexed FieldPaths

**Status: ACTIVE**

**Trigger:** A "dirty field" inline-edit save flow (like `saveFields` in `src/components/inline-edit/api.ts`) builds each request body by calling `setNested({}, fieldPath, value)` for every queued change and PATCHing the result. For any fieldPath that traverses an array (`content.8.images.2.caption`, `heroMetric.labelList.0.text`, etc.), `setNested` creates `[]` / `{}` holders on demand and writes the value at a numeric slot. Empty leading slots become sparse — `JSON.stringify` serializes them as `null`, and the PATCH body arrives at Payload looking like `{"content":[null,null,...,{"images":[null,null,{"caption":"…"}]}]}`. Payload treats the top-level array as a full replacement, validates each entry, cannot match `null` to any block schema, and returns HTTP 500 with the generic `{"errors":[{"message":"Something went wrong."}]}` that surfaces in the inline-edit toast as "Could not save — the server encountered an error."

**Why it's wrong:** Arrays in JSON have no "merge" or "sparse patch" semantics. A path-based write against a fresh `{}` is only safe when the path passes exclusively through object keys — there is no way to express "update index 2 of this array while leaving 0 and 1 untouched" in a JSON body alone. Payload's PATCH handler for blocks fields replaces the entire array; feeding it a sparse array erases the real blocks you meant to preserve and fails validation on the leading `null`s. The same bug would surface on any project with more than one existing block — it's latent until an editor opens a nested field and hits ⌘S.

The failure is especially sneaky because:

- **Flat fields work fine.** Edits to `title`, `category`, or `introBlurbHeadline` never trigger this path, so the save flow looks healthy until someone touches a caption or a heading inside `content[*]`.
- **The network tab shows one failed PATCH**, not a cascade. The response body is the opaque `"Something went wrong."` with no stack, no field label, no hint pointing at the body shape.
- **The block manager quietly does the right thing**, making the inline-edit drift invisible in code review. `useBlockManager.patchContent` already fetches the doc, mutates the full `content` array, and PATCHes it whole — so every "structural" block operation (add/move/delete/replace) succeeds and gives the false impression that nested PATCHes work.

**Correct alternative:** When any dirty field's `fieldPath` contains a numeric segment, fetch the current document first, mutate the fetched object with `setNested` for every dirty field, then extract only the touched top-level keys and PATCH that subset. This is the "read–modify–write" pattern `useBlockManager.patchContent` uses; the inline-edit save flow must stay in parity with it.

```ts
function hasArrayIndex(path: string): boolean {
  return /\.\d+(\.|$)/.test(path)
}

// inside saveFields, per group:
const needsBase = fields.some((f) => hasArrayIndex(f.fieldPath))

let base: Record<string, unknown> = {}
if (needsBase) {
  const getRes = await fetch(buildEndpoint(target), { credentials: 'include' })
  if (!getRes.ok) throw new Error(parsePayloadError(await getRes.text(), getRes.status))
  base = await getRes.json()
}

for (const field of fields) {
  setNested(base, field.fieldPath, coerce(field))
}

let body: Record<string, unknown>
if (needsBase) {
  const topKeys = new Set(fields.map((f) => f.fieldPath.split('.')[0]))
  body = Object.fromEntries(Array.from(topKeys).map((k) => [k, base[k]]).filter(([, v]) => v !== undefined))
} else {
  body = base
}
```

Flat-only saves still skip the extra GET so the happy path stays cheap. The top-key extraction guarantees Payload response metadata (`id`, `updatedAt`, `createdAt`, relationships we didn't mean to touch) is never round-tripped back into the PATCH.

**Detection:**

```bash
# Any save pipeline building a body with setNested({}, ...) on a path that includes a numeric segment
rg -nP 'setNested\(\{\}?\s*,\s*[^,]+\.\d' src/ --type ts --type tsx

# Repro directly against a case-study project:
curl -s -b <cookies> -X PATCH http://127.0.0.1:4000/api/projects/<id> \
  -H 'Content-Type: application/json' \
  -d '{"content":[null,null,{"images":[null,{"caption":"x"}]}]}' -w 'HTTP %{http_code}\n'
# A healthy save path NEVER produces a body like this. HTTP 500 here is the smoking gun.

# On a failing save, the server log will show `PATCH /api/projects/<id> 500 in …ms`
grep -E 'PATCH /api/projects/[0-9]+ 500' <dev-server-log>
```

**Incident:** ENG-165 (2026-04-19) — User edited the caption of image 2 inside image-group block 8 on `/work/meteor` ("Upstream cascade: basket management as the highest-leverage intervention point"), hit ⌘S, saw the red toast "Could not save — the server encountered an error." Network tab showed `PATCH /api/projects/2 → 500 {"errors":[{"message":"Something went wrong."}]}`. Reproduced with curl: sparse body `{"content":[null,null,...,{"images":[null,null,{"caption":"TEST"}]}]}` → HTTP 500; the same caption change sent inside the full 15-block array → HTTP 200. Fixed `saveFields` in `src/components/inline-edit/api.ts` by adding `hasArrayIndex` branching + read–modify–write on array-indexed saves, then extracting only the touched top-level keys. Verified post-fix by PATCHing the full content array with a caption mutation and confirming the value round-tripped via GET; caption then restored to its original value.

**Principle:** A PATCH body built by walking a dot-path into a fresh `{}` is a **flat-field-only** construct. The moment any fieldPath traverses an array, the only safe body is one built on top of the real document — either the full document, or a subset of top-level keys whose arrays have been mutated in place. Treat "fieldPath contains a numeric segment" as the single condition that forks the save flow into read–modify–write. Keep the two inline-edit paths — `useBlockManager.patchContent` and `saveFields` — visibly parallel so this parity doesn't drift again.

---

<a id="eap-100"></a>
## EAP-100: Passing a Pre-Shrunk CMS Derivative as the Source of `<Image fill sizes="100vw">`

**Status: ACTIVE**

**Trigger:** A server-component data mapper (e.g., `mapContentBlocks` in `src/app/(frontend)/(site)/work/[slug]/page.tsx`) chooses a Payload image derivative — `media.sizes.card.url` (768×512), `media.sizes.hero.url` (1920-wide), etc. — as the URL handed to `<MediaRenderer>` / `<Image fill sizes="100vw">`. The intent is usually "serve a smaller image for performance," but the rendering component is `next/image` with `fill` + a viewport-wide `sizes` hint.

**Why it's wrong:** `next/image` is its own image optimizer. When given a source URL, it generates an entire responsive `srcset` at every device width in `next.config.ts` (default up to `w=3840`) by requesting `/_next/image?url=<source>&w=<N>`. If the `<source>` is already a pre-shrunk derivative, the optimizer **upscales** that derivative to fill the large widths:

- `card` (768×512) → requested at `w=3840` = **5× upscale** = heavy pixelation / softness on any wide Retina display. The user reads this as "my uploads look blurry."
- `hero` (1920-wide) → requested at `w=3840` = 2× upscale on Retina = borderline-acceptable but still worse than the original.

Payload's image derivatives exist for use cases where the rendered box is **fixed and known** — admin thumbnails, email templates, legacy `<img width=…>` sites. They are the wrong source for `<Image fill>` because that mode intentionally delegates sizing to Next.js. The correct behavior is: give `next/image` the **largest available source** (the original upload), and let it generate the smaller derivatives it actually needs.

The bug compounds because it's **invisible in development**: the rendered figure is the correct shape (EAP-095 is resolved, `width`/`height` flow through), the network waterfall looks normal, HTTP is 200, and the only diagnostic signal is the browser dev warning `Image with src "…" has "fill" prop and "sizes" prop of "100vw", but image is not rendered at full viewport width.` That warning points at `sizes` — a secondary bandwidth concern — and buries the real cost (source resolution).

**Correct alternative:**

1. On the data path, pass the **original upload URL** (`media.url`) to the renderer. Do not prefer a `sizes.card` / `sizes.hero` derivative just because it exists.
2. Pass the **original dimensions** (`media.width`, `media.height`) so the wrapper's `aspect-ratio` matches the source and EAP-095 stays resolved.
3. Keep Payload derivatives configured (they're cheap, and admin/email still uses them), but never reach for them on the public render path that uses `<Image fill>`.
4. Separately, if the Next.js dev warning about `sizes="100vw"` fires for a block that isn't viewport-wide, tighten the `sizes` prop to reflect the actual layout (e.g., `"(min-width: 768px) 800px, 100vw"`) — but understand this is a **bandwidth optimization**, not a blur fix. The blur is fixed by the source URL swap above.

**Detection:**

```bash
# Any data path reaching for `card` or `hero` derivatives before a Next.js Image render
rg -n 'sizes\?\.(card|hero)' src/ --type ts --type tsx

# Rendered HTML should point at originals (no `-NNNxNNN.(jpg|png)` suffix on Payload-generated derivatives)
curl -s <page-url> | rg -oE '_next/image\?url=[^&"]+' | head -5

# Dev-server canary (non-blocking warning, but correlated)
grep -E 'is not rendered at full viewport width' <dev-server-log>
```

**Incident:** ENG-163 (2026-04-19) — User reported "the images I upload show a very blurry preview." Inspecting a case-study image showed the served URL was `GS-Lifecycle-Map-…-768x512.jpg` (the `card` derivative), then Next.js requested `&w=3840&q=75`. `mapContentBlocks` preferred `media.sizes.card ?? media.sizes.hero` as the source for the `imageGroup` block, and the `hero` block preferred `media.sizes.hero.url`. Fixed by dropping the derivative preference and passing `media.url` / `media.width` / `media.height` directly. Also cleaned up `src/lib/extract-content-urls.ts` (preload pipeline) which mirrored the same inversion (`sizes?.card ?? sizes?.hero`). Verified in the dev-server log: the rendered image `src` switched from `…-1776651572573-768x512.png` to `…-1776651572573.png` (original) after save. `resolveThumbnailUrl` is intentionally left reaching for the `thumbnail` derivative — it serves small 400×300 card tiles on the index page, which is a legitimate fixed-size use case for derivatives.

**Principle:** Do not pre-optimize for `next/image`. `<Image fill sizes="…">` asks Next.js to generate the responsive ladder; the correct source for that ladder is the **highest-resolution available original**, not a CMS-side derivative. Picking a derivative short-circuits the optimizer and forces an upscale. Derivatives are for fixed-size render paths (admin thumbnails, email), not for `fill` layouts.

<a id="eap-095"></a>
## EAP-095: Dropping `width` / `height` on the Data Path That Feeds `<Image fill>`

**Status: ACTIVE**

**Trigger:** A component like `MediaRenderer` uses `next/image` with the `fill` prop and applies `aspect-ratio` to its wrapper only when it receives `width` + `height` props. A server-component data mapper (e.g., `mapContentBlocks` in `src/app/(frontend)/(site)/work/[slug]/page.tsx`) shapes a `url` / `alt` / `caption` / `mimeType` payload from Payload's populated media and normalizes it into the client's `ContentBlock` type — but forgets to carry `media.width` / `media.height` through the transform (or through the `images[]` type on the client side).

**Why it's wrong:** `<Image fill>` sizes itself to its parent. Without `aspect-ratio` (or an explicit height) on the parent, the parent collapses to `height: 0` and the image renders invisible while appearing to have "uploaded successfully" — the POST returned 201, `media.url` is valid, the figure exists in the DOM, and nothing surfaces as an error. The only signal is the next/image dev warning `Image with src "…" has "fill" and a height value of 0`, which is easy to miss against any moderately noisy dev log.

The failure mode is especially sneaky when the empty placeholder state (`.labeledPlaceholder`) had its own `aspect-ratio` while the filled state (`.sectionFigure`) did not — swapping the two on upload switches the layout contract underneath the user without any visible signal. Existing "working" image groups may also all happen to be `<video>` elements that have intrinsic dimensions and route around the bug, leaving the first true image upload as the one that finally trips it.

**Correct alternative:**

1. On the data path, forward `media.width` / `media.height` (prefer the derived size's own dimensions when you're serving a derived URL — e.g., `media.sizes.card.width` / `.height` for a card-sized URL — so the aspect ratio matches the URL actually being served).
2. Extend every intermediate type (server-to-client `ContentBlock`, component props, mapper return types) to carry `width?` / `height?`.
3. At the render site, pass both to the `<MediaRenderer>` (or equivalent) call so its wrapper can set `aspect-ratio: ${width} / ${height}` and give `<Image fill>` a real box to lay out in.
4. For a placeholder ↔ filled swap, ensure the placeholder state and the filled state share an aspect-ratio contract (either both declare one, or both respond to the same data-driven dimensions). Do not let the swap silently drop the layout constraint.

**Detection:**

```bash
# Any call site passing src but not width/height into a fill-based renderer
rg -nP '<MediaRenderer[^>]*\bsrc=' --type tsx --type ts | rg -v 'width=' | rg -v 'height='

# Browser/dev-server warning (the canary)
grep -E 'has "fill" and a height value of 0' <dev-server-log>

# In rendered HTML of a block page, confirm wrappers get an aspect-ratio style
curl -s <page-url> | rg -oE 'style="aspect-ratio:[^"]+"' | sort -u
```

**Incident:** ENG-161 (2026-04-19) — Uploading `GS-Lifecycle-Map-…-768x512.jpg` into a placeholder-labeled slot inside an image-group block on the `meteor` project saved the record correctly, but the image rendered invisible. `mapContentBlocks` forwarded `url` / `alt` / `caption` / `mimeType` / `playbackMode` / `posterUrl` into the client-side `imageGroup.images[]` payload but dropped `width` / `height`. `MediaRenderer` therefore produced a wrapper with `width: 100%; height: 100%` but no aspect-ratio, the parent `figure` had no explicit height, and `<Image fill>` reported "height value of 0." Fixed by (a) extending the `media` type in `mapContentBlocks` to include `width` / `height` / `sizes.card.width|height` / `sizes.hero.width|height`, (b) preferring `derivedSize.width` / `.height` over raw `media.width` / `.height` when serving a derived URL, (c) extending `ContentBlock` `imageGroup.images[]` in `ProjectClient.tsx` with `width?` / `height?`, and (d) passing both to the `<MediaRenderer>` call in both the placeholder-grid and non-placeholder render branches. Verified `style="aspect-ratio:768 / 512"` present in rendered HTML and the dev-log warning no longer fires.

**Principle:** Dimensions are load-bearing metadata for `<Image fill>`, not decoration. Any component that renders with `fill` must treat `width` / `height` as a required data contract, and every boundary those values cross — Payload schema, server fetch, normalization, client types, component props — must preserve them. The "height value of 0" warning is a data-flow bug, not a CSS bug: do not reach for `min-height` or a fixed wrapper height to paper over it; fix the missing dimensions at the layer that dropped them.

<a id="eap-099"></a>
## EAP-099: Gating on JSX `onLoad` / `onLoadedData` for an SSR'd Media Element

**Status: ACTIVE**

**Trigger:** A client component renders a server-rendered `<video>`, `<audio>`, bare `<img>`, or `<iframe>` that starts fetching bytes as soon as the HTML is parsed. The component uses `useState(false)` to track "loaded," flips it true only inside a JSX `onLoad` / `onLoadedData` handler, and gates visibility (often `opacity: 0` → `opacity: 1`) on that state.

**Why it's wrong:** The native element begins work during HTML parse. React's synthetic `onLoad` / `onLoadedData` handler attaches during commit, which happens after hydration, which happens after the JS bundle downloads, parses, and executes. For any asset served from a CDN — or that hits the browser's disk cache on refresh — the native `load` / `loadeddata` event routinely fires **before** React attaches its listener. The JSX handler then never runs, the "loaded" state stays `false` forever, and the asset is stuck invisible while being fully decoded and, for videos, already playing.

The bug is especially invisible because:

- Nothing in the console complains — the asset loaded successfully.
- The network tab shows `200 OK`, proper Range responses, and reasonable timings.
- Debugging from the server side (`curl` the HTML, check `src`) confirms everything is correct.
- The only symptom is "the skeleton never goes away," which looks identical to the network-layer failure mode it was supposed to indicate.

**Correct alternative:** Always assume the event may have already fired. Pair the JSX handler with a post-mount ref-based check, and (for video/audio) subscribe via native `addEventListener` as a fallback:

```tsx
const ref = useRef<HTMLVideoElement | null>(null);
const [loaded, setLoaded] = useState(false);

useEffect(() => {
  const el = ref.current;
  if (!el) return;
  if (el.readyState >= 2) { // HAVE_CURRENT_DATA
    setLoaded(true);
    return;
  }
  const reveal = () => setLoaded(true);
  el.addEventListener('loadeddata', reveal, { once: true });
  el.addEventListener('loadedmetadata', reveal, { once: true });
  return () => {
    el.removeEventListener('loadeddata', reveal);
    el.removeEventListener('loadedmetadata', reveal);
  };
}, [src]);

return <video ref={ref} src={src} onLoadedData={() => setLoaded(true)} ... />;
```

Readiness constants:

| Element | "Already ready" check |
|---------|----------------------|
| `<video>` / `<audio>` | `el.readyState >= 2` (HAVE_CURRENT_DATA) — first frame / first chunk decoded |
| `<img>` (raw) | `el.complete && el.naturalWidth > 0` |
| `<iframe>` | `el.contentDocument?.readyState === 'complete'` (same-origin only) |

`next/image` handles this correctly internally — its `onLoad` fires on mount for cached images — so images routed through `next/image` don't need the pattern. It's only bare native elements that require the guard.

**Detection:**

```bash
# Any client component that gates on onLoad/onLoadedData without reading readyState
rg -nP 'onLoad(edData)?=\s*\{' src/components --type tsx -l | \
  xargs -I {} sh -c 'rg -L "readyState|\.complete" {} && echo "SUSPECT: {}"'

# Manual browser check: hard-refresh a page with a cached CDN media asset and
# confirm the skeleton dismisses within one frame.
```

**Incident:** ENG-160 follow-up (2026-04-19) — After fixing `media.url` to resolve to a direct Supabase CDN URL (EAP-098), the Cloudflare-cached video began firing `loadeddata` *before* React hydrated `MediaRenderer`. The JSX `onLoadedData` handler never ran, the `.loaded` class was never applied, and `.media { opacity: 0 }` kept the already-playing video invisible indefinitely. Fixed by adding a `videoRef` + `useEffect` that checks `readyState >= 2` on mount and subscribes to `loadeddata` / `loadedmetadata` via native `addEventListener`. The previous (broken) `/api/media/file/*` URL masked this for months because the event never fired in the first place.

**Principle:** In a hydrated app, any state derived from a DOM event on an SSR'd native element must also be derivable from the element's readiness properties at mount time. If the only way to reach a given UI state is via an event that the element fires at its own discretion, the UI is at the mercy of a race between HTML parsing and JS hydration — and on a good network, the element wins every time.

<a id="eap-102"></a>
## EAP-102: Class-Name-From-The-Wrong-Module Silent Bug

**Status: ACTIVE**

**Trigger:** A component imports a CSS Module (`import styles from './X.module.scss'`) and references class names on the imported object (`styles.foo`, `styles.imageOverlayBtn`). The rules with those names actually live in a **different** module (e.g., `../../components/inline-edit/inline-edit.module.scss`) that no TSX file imports those specific keys from.

**Why it's wrong:** CSS Modules are compiled to an object keyed by the class names declared in the imported `.module.scss` file. Accessing a key that doesn't exist returns `undefined`, not a compile error, not a lint warning, and not a runtime console message. `className={undefined}` renders as a missing attribute. The browser falls back to the user-agent stylesheet and the surface looks "native" — a bare `<button>` with default border-radius and system fonts, a `<div>` with no background, etc. Every layer says the code is fine:

- TypeScript: `styles.foo` is typed `string | undefined` and accepts any key.
- ESLint: no rule fires.
- CSS compiler: the orphaned rules in the sibling module compile and are served; nothing references them, so nothing marks them dead.
- Browser dev tools: "Matched Selectors" is empty — but that's what you'd expect if the bug were in the selector, not the `className=`.

The surface looks wrong and the developer starts editing SCSS that is already correct. The real fix is at the import statement.

**Correct alternative:**

1. Every `styles.X` access must resolve to an exported key in the specific module that's imported at the top of the file. If you want the rules from another module, either (a) move them into the imported module, or (b) import the other module under a distinct alias (`import overlay from '../../components/inline-edit/inline-edit.module.scss'` → `className={overlay.imageOverlay}`).
2. Prefer **co-locating** styles next to the component that owns them — a `FooComponent.tsx` with a sibling `FooComponent.module.scss`. A component that has to reach across directories for its own class names has its import layer in the wrong place.
3. When an admin chrome surface looks like the browser default, grep the imported module first for the class key, then the rules. If the key isn't in the module, the rules are orphaned and the `className=` is `undefined` — fix the import, don't touch the rules.

**Detection:**

```bash
# List every (filename, className used) pair and diff against what the file's *imported* module actually exports.
# Quick heuristic: grep className references inside a file, then grep the imported .module.scss for matching keys.
rg -nP "styles\\.[A-Za-z0-9_]+" src/app/\(frontend\)/\(site\)/work/\[slug\]/ProjectClient.tsx -o | sort -u
rg -nP "^\\.[A-Za-z0-9_]+" src/app/\(frontend\)/\(site\)/work/\[slug\]/page.module.scss -o | sort -u
# Class names referenced but not defined in the imported file are the silent-bug candidates.

# DOM-side confirmation once suspected:
# Inspect the element → check "Computed" has no class names from the expected module → check the `.className` DOM prop — if it reads `undefined undefined …` the key lookup is broken.
```

**Incident:** ENG-162 (2026-04-19) — The inline-edit image-block admin overlay in `ProjectClient.tsx` was rendering as bare unstyled `<button>` glyphs. The image-overlay and "Add image" / drop-zone rules were defined in `src/components/inline-edit/inline-edit.module.scss` (lines 1585–1656) but `ProjectClient.tsx` imports `styles` from `./page.module.scss`. Every `className={styles.imageOverlayBtn}` / `styles.dropZone` / `styles.addBlockBtn` resolved to `undefined`. The fix was structural, not stylistic: rebuild the overlay and empty state out of DS primitives (`Button`, `Tooltip`, `DropdownMenu`, `Dropzone`) with co-located SCSS (`ImageBlockAdminOverlay.module.scss`, `VideoSettings.module.scss`), and delete the orphaned rules from `inline-edit.module.scss`. See also EAP-103 (the companion pattern: raw `<button>` in admin overlays).

**Principle:** A CSS Module object is a strict keyspace. `styles.foo` being `undefined` is not "the rule isn't applying" — it is "the key isn't in this module." When an admin surface looks like the browser default, the first hypothesis is `className=undefined`, and the first file to open is the import statement, not the stylesheet the rules appear to live in.

<a id="eap-103"></a>
## EAP-103: Hand-Rolled Native Buttons in Admin / CMS Overlay Surfaces

**Status: ACTIVE**

**Trigger:** A newly-built admin chrome surface — inline-edit overlay, CMS action bar, hover-reveal toolbar — ships with raw DOM elements: `<button>` for reorder / replace / delete glyphs, `<div onClick>` for a drop zone, hand-pilled `<button>` for a Loop / Player toggle, a bare `<button>` for "Add item." No `@/components/ui/Button`, `@/components/ui/ButtonSelect`, `@/components/ui/Tooltip`, `@/components/ui/DropdownMenu`, or `@/components/ui/Dropzone` is imported or composed. The destructive path (delete) runs on a single click with no `AlertDialog` and no `toast.undoable`.

**Why it's wrong:** Admin/CMS overlays are **inside the product**, not in a separate admin shell. They inherit every portfolio-wide rule — zero border-radius (Hard Guardrail #9), focus-visible ring tokens, motion tokens, hover/active state tokens, `data-theme` dark-mode variants — and every §14 CRUD contract rule (destructive confirm, undoable toast, unified keyboard shortcuts). Raw `<button>` / `<div onClick>` skips all of it:

- **Branding violations by construction.** User-agent `<button>` has a non-zero radius on macOS and iOS (system theme), a system font, a gradient background, and an ad-hoc focus ring. None of that matches the portfolio DS. The bug reproduces 100% of the time on admin surfaces on Safari.
- **Accessibility gaps.** No `Tooltip` means icon-only buttons have no discoverable label beyond `aria-label`; no `focusable` semantics on a `<div onClick>`; no keyboard activation on non-button elements; no `disabled` state visual.
- **CRUD contract violations.** EAP-091 / EAP-092 / EAP-093 (the `useConfirm` / `@ds/AlertDialog` / `useToast` triad) are impossible to enforce on ad-hoc controls — there's nowhere for the lint rule to hook into.
- **Drift from the playground and main-site button surfaces.** An admin overlay that uses raw buttons can't be demoed, can't be parity-checked against `@/components/ui/Button`, and breaks the "everything on the portfolio is in the DS" contract.

Every hand-rolled admin control is, in practice, a miniature re-implementation of `@/components/ui/Button`, but worse on every axis. Writing one is the sign that the consuming file didn't treat admin chrome as DS consumers; it treated them as escape hatches from the DS.

**Correct alternative:**

1. Every clickable admin control composes `@/components/ui/Button` (`iconOnly`, `size="xs" | "sm"`, `appearance="neutral" | "destructive"`, `emphasis="bold" | "subtle"`). Icon-only buttons wrap in `@/components/ui/Tooltip` for labels.
2. Mode switches (Loop / Player, View / Edit, 1× / 2×) use `@/components/ui/ButtonSelect` — not pilled raw buttons.
3. Overflow menus (Muted toggle, Change poster, Remove poster) use `@/components/ui/DropdownMenu` — not bespoke popovers.
4. Drop zones use `@/components/ui/Dropzone` — not `<div onDrop>`.
5. Destructive actions go through `useConfirm()` for the AlertDialog and `toast.undoable(...)` for the undo path. The pre-op snapshot is captured by the caller (usually a block manager) and passed as `onUndo`.
6. Co-locate overlay SCSS next to the overlay TSX (`FooOverlay.tsx` + `FooOverlay.module.scss`) so the rules can't drift into an orphaned module (see EAP-102).

**Detection:**

```bash
# Raw <button> anywhere under the inline-edit overlay surfaces
rg -nP "<button(\s|>)" src/components/inline-edit/ src/app/\(frontend\)/\(site\)/ | rg -v "node_modules"

# <div onClick= inside the inline-edit tree (drop zones, clickable tiles)
rg -nP "<div[^>]*onClick=" src/components/inline-edit/ src/app/\(frontend\)/\(site\)/

# Any admin-overlay file without a Button / DropdownMenu / Tooltip import
rg -L "from '@/components/ui/(Button|DropdownMenu|Tooltip|ButtonSelect|Dropzone)'" src/components/inline-edit/*.tsx | rg -v "types.ts|index.ts|api.ts|hooks.ts"
```

**Incident:** ENG-162 (2026-04-19) — The `imageGroup` admin overlay in `ProjectClient.tsx` used raw `<button>` glyphs (`◂ ▸ ✕`) for reorder/replace/delete, a raw `<button>` for "Add image" / "Add first block," and a bare `<div>` for the empty-state drop zone. `VideoPlaybackToggle` was a hand-pilled `<button>` pair for Loop / Player. None of them composed DS primitives; the delete action ran on a single click with no confirm and no undoable toast. Resolved by replacing every one with DS primitives: `ImageBlockAdminOverlay` (DS `Button iconOnly xs` + `Tooltip`), `VideoSettings` (DS `ButtonSelect` + `DropdownMenu` with `Muted` toggle + poster-frame actions), empty-state `<Dropzone>`, `<Button>` for "Add image" / "Add first block," `useBlockManager.confirmRemoveImage` running `useConfirm` + `toast.undoable`. The silent-styling layer of the same bug is documented separately as EAP-102.

**Principle:** Inline-edit and CMS overlays are first-class DS consumers, not escape hatches from the DS. Every clickable element inside one must compose a DS primitive — `Button`, `ButtonSelect`, `DropdownMenu`, `Tooltip`, `Dropzone` — and every destructive action must honor §14 (`useConfirm` + `toast.undoable`). A raw `<button>` in an admin overlay is presumptively a bug: it's breaking branding, accessibility, and the CRUD contract simultaneously, by construction.

<a id="eap-105"></a>
## EAP-105: Integer Scaffolding Values Carried Forward Without Re-Ranking

**Status: ACTIVE**

**Trigger:** A ranking field (`order`, `priority`, `position`, `rank`, `sortIndex`) is defined per-row inside N co-located files — one file per row — instead of in a single manifest. When a new row is added, the author picks "the next free integer" without re-evaluating whether the existing rows are still in the right relative order. Over weeks/months, the visible surface consumes `sort: "<field>"` but the values encode *when each row was scaffolded* instead of *where it belongs in the ranking*. Nothing breaks visibly; the bug presents only as "why is this one at the top?" from someone who knows the intended ranking.

Concrete canonical shape in this codebase: each case study's `order` lives in its own `src/app/(frontend)/api/update-<slug>/route.ts`. The home page at `src/app/(frontend)/(site)/page.tsx` queries `payload.find({ collection: "projects", sort: "order" })`. There is no `order-manifest.ts`, no single file where the ranking decision is recorded. Any re-ranking is an N-file coordinated edit across the fleet of `update-*/route.ts` files plus N POST calls to the seeding endpoints.

**Why it's wrong:**

1. **No single source of truth for the ranking.** Reading one `update-X/route.ts` file tells you nothing about where X sits relative to the rest. An author adding a new case study cannot answer "what order should this be?" without opening every other `update-*/route.ts` file or running a `rg`. In practice, they pick the next free integer.
2. **Scaffold convention becomes production data.** The scaffolded default — "set `order: N+1` where N is the current max" — was fine as a placeholder but becomes the production ranking the moment the file ships. There is no step in the authoring flow where the author is forced to reconsider the existing integers.
3. **Drift is invisible.** The data model doesn't encode a constraint ("the top-ranked case study must be the strongest piece"). The CMS accepts any integers. The visible surface renders them in order. The mismatch between the integers and the author's actual narrative priority only surfaces when someone reads the home page and says "wait, why is X first?"
4. **Re-ranking is expensive.** Changing the order requires editing N files, calling N POST endpoints (Hard Guardrail #25), and verifying the resulting order in the CMS. That expense discourages periodic re-ranking even when the author knows the current order is wrong.

**Correct alternative:**

1. **Always audit the full ranking when adding or editing any ranked row.** When creating or touching any `update-*/route.ts` that defines an `order` integer, run `rg "order: \d+" 'src/app/(frontend)/api/update-'*'/route.ts'` across the fleet and confirm the full sequence reflects the current intended ranking. If it doesn't, re-rank in the same session — do not ship a new row while the existing ones are stale.
2. **Prefer a single manifest for any cross-row ranking.** When a ranking is shared across N rows, it belongs in one file. Candidate shapes: `src/config/project-order.ts` exporting `PROJECT_ORDER: Record<string, number>`, or a `Globals` entry in Payload. Keeping the ranking in the same file where it's consumed makes the decision visible and the drift impossible to sustain.
3. **Add a CI / gate check.** A simple `rg` script in a pre-merge step can assert that the integers are strictly increasing and that no two rows share an `order` value. Duplicate integers are a silent ordering bug — the visible order depends on Payload's secondary sort, which the author did not choose.
4. **Document the ranking decision at the point of authoring.** The case-study-authoring skill should prompt: "At which position should this case study sit on the home page?" and show the current ranking before asking. Without that prompt, the default path is always "append at the bottom" or "claim whatever integer the scaffold wrote."

**Detection:**

```bash
# Dump the current ranking across all project seeding routes
rg -nP 'order:\s*\d+' 'src/app/(frontend)/api/update-'*'/route.ts'

# Or, live, from the CMS (main site dev server on :4000):
curl -sS 'http://localhost:4000/api/projects?sort=order&limit=50&depth=0' \
  | python3 -c "import sys,json; [print(p.get('order'), p.get('slug')) for p in json.load(sys.stdin).get('docs',[])]"
```

If the printed order does not match the author's narrative priority when read aloud, the ranking is stale.

**Incident:** ENG-168 (2026-04-20) — The home case-study grid rendered Lacework → Élan → Meteor (Goldman Sachs). The user flagged that Goldman Sachs should lead. `git log --follow -p` on every `update-*/route.ts` showed the `order` integers had been stable since the Mar 30 scaffold (`d9bb2d3`): Lacework was the first case study migrated into the CMS and got `order: 1` by default; Meteor was added later at `order: 3` because that was "the next free integer," not because position 3 was the intended ranking. No commit ever demoted Meteor — the scaffolded default simply persisted. Fixed by swapping Meteor → `order: 1` and Lacework → `order: 2` in the two seeding routes, re-POSTing both endpoints, and verifying via `GET /api/projects?sort=order`.

**Principle:** An integer ranking field scattered across N files is a maintenance hazard disguised as a data model. The moment a scaffold writes `order: N+1` without asking whether N+1 is correct relative to the existing rows, the ranking is silently drifting from the author's intent. Re-ranking must happen every time a ranked row is created or touched, not only when someone points out the result is wrong. When possible, collapse the ranking into a single manifest so the decision is visible and the drift is impossible to sustain.

---

<a id="eap-106"></a>
## EAP-106: Heuristic Whose Discriminating Signal Is Invariant Across the Dominant Data Distribution

**Status: ACTIVE**

**Trigger:** A conditional behavior ("do X when the user's intent looks like A, otherwise do Y") is decided by a heuristic whose discriminating signal is a property that *happens to vary in the example cases you reasoned through* but is *constant across the dominant distribution of real data*. The heuristic therefore fires on 100% of real inputs (or 0%), not on the subset it was designed for.

Concrete canonical shape in this codebase: in `handleDragEnd` (ENG-171), the author's goal was a Figma-like drag where side-drops merge and above/below drops reorder. The heuristic: "check whether the dragging element's horizontal center is within 25% of the over target's width from the over target's center." Reasoned through on a whiteboard with rows of different widths, this looks sound. Run on the actual post-migration data — every atomic image block defaults to `rowBreak: true`, so every row is full-page-width, so every pair of rows has *identical* horizontal centers — and the check is trivially true for every drop. Merge fires on 100% of drags, reorder never runs.

The bug is not in the formula. The formula is correct in the abstract. The bug is that the formula's discriminating input (horizontal-center distance) has zero variance in the dominant case.

**Why it's wrong:**

1. **Whiteboard validation masks distribution-invariance.** When you reason through a heuristic on hand-picked examples — "narrow row onto wide row," "narrow row above wide row" — you are picking examples where the discriminating signal *does* vary. Real data may pick from a subspace where it doesn't. Example cases show the heuristic works *in principle*; they don't show it works *in production*.
2. **Silent 100%-fire failures are the worst kind.** A heuristic that fires in 0% of cases gets reported immediately ("the feature doesn't work at all"). A heuristic that fires in 100% of cases looks like the feature is wired up — every drop produces a response — but the response is always the wrong branch. The user attributes it to "drag feels broken" rather than "intent detection is broken," which takes longer to diagnose.
3. **Defensive gates stacked on a broken primary signal don't rescue it.** The ENG-171 implementation added a vertical-overlap gate to guard against above/below drops being mis-classified as merges. That gate is also defeated in the dominant case, because dnd-kit's sortable strategy creates a gap at the drop position by shifting neighbors — the active element's translated rect always overlaps the nearest neighbor at release. Adding more weak gates to cover a broken primary signal produces a combinatorially complex check that still fires on 100% of cases.

**Correct alternative:**

1. **Enumerate the dominant data distribution before committing a heuristic.** Before writing the discriminator, ask: "In the most common shape of real data my users will see, what range of values will this signal take?" If the signal is constant or nearly constant across that shape, the heuristic is a no-op regardless of how elegant the math is. Pick a different signal or defer the feature to an explicit UI.
2. **Prefer explicit UI over inferred intent when intent cannot be cleanly discriminated.** When a gesture has multiple valid interpretations (reorder vs merge) and the available signals don't separate them cleanly, *show the user the choice* rather than guessing. A dedicated drop zone that only appears during drag, a toolbar button, or a keyboard modifier (e.g., hold Shift to merge) all carry explicit intent the user controls. The user stays in charge and the code has no ambiguity to resolve.
3. **Validate heuristics against production-shaped state, not synthetic examples.** The runtime evidence you need is "what does this heuristic return on the actual rows this page renders?" On this project that means running the migration, loading a case study with a realistic mix of row configurations, and logging the heuristic's output for every drag. When runtime validation is blocked (e.g., EAP-042 dev-server crash), the correct move is to *not ship* intent inference and instead ship the simpler, auditable behavior — reorder only. Defer intent inference to the iteration that can validate it.
4. **Separate the primitive from the trigger.** `useBlockManager.mergeImageRangeIntoRow` is a valid, tested primitive. The bug was not in the primitive — it was in the trigger that decided when to call it. Keep the primitive; rewire it to an explicit UI later. This preserves the forward progress without keeping the broken auto-inference in the drag path.

**Detection:**

- **During review:** Any `if (heuristic) doA() else doB()` block where the heuristic depends on geometric or statistical properties of user data needs a written answer to "what does this heuristic return on the canonical data case?" Not an example-set answer. A distribution answer.
- **Post-incident:** Search for recent heuristics whose inputs are positional/geometric (pointer position, element rect, delta) and check whether the dominant layout (after migrations, after the common author flow, on mobile) forces those inputs into a narrow range.

**Incident:** ENG-174 (2026-04-19) — After the atomic-image migration converted all `imageGroup` blocks into single-image `image` blocks with `rowBreak: true`, every row rendered at full page width. The ENG-171 merge-intent heuristic (`|srcCenterX - dstCenterX| <= overRect.width * 0.25`) was trivially satisfied for every drop because all rows had identical centers. Every reorder silently routed to `mergeImageRangeIntoRow`, which flipped the moved block's `rowBreak` to `false` and positioned it adjacent to the destination row rather than at the drop position. User-visible symptom: "drag doesn't work." Resolution: reverted the merge branch; `handleDragEnd` now reorders exclusively. `mergeImageRangeIntoRow` retained in `useBlockManager` for a future explicit merge UI (dedicated drop zone, toolbar button, or keyboard modifier) that can be runtime-validated when EAP-042 unblocks.

**Principle:** A heuristic that decides between two branches is only as good as the variance in its discriminating signal across the data it will actually see. When the signal is constant on the dominant distribution, the heuristic is structurally broken even if the math is right. Before shipping a heuristic-based behavior, the answer to "what is the variance of this signal across the real workload?" must be written down, not hand-waved. When the answer is "near zero," the correct response is explicit UI, not more gates.

---

<a id="eap-107"></a>
## EAP-107: Sortable Unit Locked to the Visual Unit Rather Than the Data Unit

**Status: ACTIVE**

**Trigger:** You are adding drag-and-drop to a data model where multiple data atoms render inside one visual container (rows, grids, sections, groupings). The implementation assigns one sortable id per **visual container** rather than one per **data atom**, so the entire group drags as a single unit. Subsequent user requests to "rearrange within the group," "pull an item out of the group," or "split the group" cannot be satisfied by drag and require a second control surface — either a heuristic that tries to detect sub-element intent from drag coordinates, or a parallel UI (buttons, menus, keyboard shortcuts) that duplicates what drag should have done.

Concrete canonical shape in this codebase: after the atomic-image migration, each image became its own `image` block in `content[]` (data atoms). On render, consecutive `image` blocks whose second+ members have `rowBreak: false` grouped into a single `imageRow` flex container (visual container). The sortable layer indexed by `displayItems` emitted one id per container: `row:<first-member-id>` for rows, `<block-id>` for single blocks. A row of three images exposed exactly **one** draggable id to `@dnd-kit`. The drag handle moved all three; `handleDragEnd` called `reorderBlockRange(fromStart, count, toStart)` with `count = 3`. There was no code path that moved image #2 of a three-image row — no such path *could* exist without restructuring the sortable, because no sortable id existed for it. Every follow-up feature request ("drag image out of a row to split it," "reorder within a row," "move one image to another row") was blocked at the foundation. ENG-171 attempted to patch this by adding a merge-on-drop heuristic that detected "drop onto a row" from pointer coordinates (→ EAP-106). That heuristic was a symptom of the mis-scoped sortable, not a fix. ENG-175 added optimistic state, which made the wrong behavior faster but didn't make it right. Only when the sortable was re-scoped — one id per `contentBlocks` entry, flat across rows — did per-image drag become expressible at all.

**Why it's wrong:**

1. **The sortable layer decides what the user can express, before any heuristic runs.** If the sortable has no id for image #2-of-3, no amount of intent detection, no keyboard modifier, no drop-zone magic can let the user drag image #2 separately. The `@dnd-kit` events never fire for sub-elements. Any sub-element UX must be implemented *around* drag (as parallel buttons/menus), permanently splitting what should be a single affordance into two surfaces.
2. **Visual grouping is a rendering concern, not a sortability concern.** A row of three images is a *visual layout* — flexbox, widthFractions, caption alignment. It is not a *data relationship*; the three images are still three independent blocks in `content[]`. Locking the sortable to the visual container encodes a structural rule that doesn't exist in the data. When the visual container is purely derived state (as `displayItems.kind === 'row'` is — it's computed from consecutive image blocks' `rowBreak` flags at render time), locking sortability to that derived state is a category error.
3. **The wrong scoping produces infinitely forking UX debt.** Once the sortable is coarse-grained, every new user request ("drag out," "split," "move within row") becomes a one-off feature that needs its own affordance. Those affordances accumulate: merge-on-drop heuristic, merge button in toolbar, split button in overlay, keyboard-shortcut splitter, row-aware reorder primitive, row-aware move-left/move-right. Each is engineering effort; each is cognitive load for the author; none are composable because they emerged individually. The single refactor to flat sortability collapses all of them into "drag the image."
4. **Migrations that change the data unit without re-scoping the sortable silently break the feature.** This project moved from `imageGroup` (container block with a children array) to atomic `image` (independent blocks grouped by `rowBreak`). The data unit shrank from "group" to "image." The sortable layer was carried forward from the `imageGroup` era (one drag per container) without re-asking "what is the atom now?" The migration correctly updated schema, seed routes, render, and inline-edit primitives — everything except the DnD scope. Atoms at the data layer, groups at the DnD layer: feature broken, visibly.

**Correct alternative:**

1. **At DnD design time, ask: "can the user ever want to drag a sub-element of this sortable?"** If yes, the sortable unit must be the sub-element. Design the visual grouping as a rendering concern *around* the flat sortable — an outer flex container whose children are each individual SortableBlocks — not as a separate sortable layer above individual items.
2. **Emit one sortable id per data atom.** For any data model where `content[]` is a flat array of blocks, the sortable id list should be `content.filter(isDraggable).map(block => block.id)` — not some derived grouping of those blocks. Grouping is applied at render via `displayItems` (or equivalent) purely for visual wrappers; the sortable never sees the grouping.
3. **Normalize grouping invariants after every reorder.** When grouping is derived from a flag on each atom (e.g., `rowBreak: boolean` on images), a reorder can land an atom in a neighborhood that violates the invariant (e.g., an image with `rowBreak: false` ends up as the first block in a non-image neighborhood). Apply an invariant-restoring normalizer after each reorder so the derived grouping stays consistent: see `src/lib/normalize-image-rows.ts` for the `normalizeImageRowBreaks` helper — a single pass that promotes the first image of each image run to `rowBreak: true`. The normalizer also gives "drag-to-split" for free: dragging an image out of a row into a non-image neighborhood automatically starts a new row.
4. **When a sortable is already coarse-grained in production and a feature request reveals the mis-scoping, re-scope the sortable before accepting the request.** Don't bolt on heuristics, don't add parallel buttons. The symptom is the feature request; the cause is the sortable unit. Fix the cause. EAP-106 is what happens when you bolt instead of re-scope.

**Detection:**

- **During design:** For any DnD feature, write down the data atom and the visual unit side-by-side. If they differ, the sortable must be the data atom. Add a one-liner in the PR description: "Sortable unit = <data atom>; visual grouping = <derived>."
- **During implementation review:** Inspect the code that builds the sortable id list. If the list is derived from a rendering grouping (`displayItems.map`, `rows.map`, etc.), that's the wrong layer. It should be derived from the content/data array directly (`content.map`, `blocks.filter`, etc.).
- **Post-migration:** When changing the data model (splitting a container into atoms, flattening nested structures, migrating schema), explicitly audit the DnD scope. Check that the sortable id list's cardinality tracks the new atom count, not the old container count.

**Incident:** ENG-176 (2026-04-20) — After the atomic-image migration (ENG-163 to ENG-171), the sortable layer continued to emit one id per row of images. ENG-171 attempted to paper over this with a merge-on-drop heuristic (→ EAP-106). ENG-174 reverted the heuristic but left the coarse-grained sortable intact. ENG-175 added optimistic state, which confirmed block-level DnD worked mechanically but didn't address the user's actual request (per-image drag). Only in ENG-176 did the sortable get flattened to one id per block and the row render branch wrap each image in its own `SortableBlock`, with `normalizeImageRowBreaks` healing row-head invariants after each move. Four iterations, one scope miss, three false resolutions.

**Principle:** The sortable unit is a contract with the user about what they can move. If the data model supports finer-grained movement than the sortable, the feature is structurally incomplete regardless of how polished the DnD interactions look. Before shipping DnD on a grouped layout, the sortable's atom must match the data model's atom — grouping is visual, sortability is structural, and the two must not be conflated.

---

<a id="eap-108"></a>
## EAP-108: Gated Todo Never Re-Probed After the Gate Clears

**Status: ACTIVE**

**Trigger:** A task in the todo list depends on an operational condition that cannot be satisfied at the time the task is created — dev server is crashing, a migration must run first, an external service has a quota block, credentials aren't provisioned, a seed endpoint requires a running instance. The task is marked `blocked` / `pending` / `deferred` and the rest of the workstream moves on. When the gating condition later resolves (dev server recovers, next session starts, quota resets), nothing automatically re-probes the condition. The gated todo sits in `pending` indefinitely and the feature it gates ships as "done from the code side" while the runtime behavior is still broken against live data.

Concrete canonical shape in this codebase: the atomic-image migration had three sequential tasks — (1) implement per-image DnD refactor, (2) run `POST /api/migrate-image-groups` against live CMS data, (3) delete the legacy `imageGroup` schema/code paths. Task #2 was marked blocked on the EAP-042 dev-server instability window. Task #1 landed as ENG-176 with the note "runtime verification deferred." Later, when the dev server recovered, nothing re-probed task #2 — it was still in the todo list as `pending`, but no signal fired to re-run it. The user opened `/work/meteor` and saw 3 live `imageGroup` blocks; the atomic-image render branches (the entire ENG-176 refactor) were unreachable from their content because `blockType === 'imageGroup'` falls through to the legacy render path. The DnD refactor was 100% merged and 0% reachable.

**Why it's wrong:**

1. **"Blocked" decays into "silently abandoned" when no alerting mechanism re-probes.** A todo that says `blocked: dev server crashing` is actionable information when the dev server is still crashing. It becomes invisible the moment the session ends or the server recovers — no observer will notice the gate cleared.
2. **Feature-completeness is a whole-system property, not a whole-codebase property.** Code merged = code exists. Feature delivered = code + migrated data + user-visible runtime behavior. A feature that requires a migration to run is not delivered when the code merges; it is delivered when the runtime against migrated data produces the advertised behavior. Treating these as separate is a category error — from the user's point of view, "shipped code that requires a migration I haven't run" and "nothing changed" are indistinguishable.
3. **Gated todos create false confidence at feature-complete time.** The developer, reviewing the todo list before reporting "done," sees `[x] implement refactor` and `[ ] run migration (blocked)`. The checked box looks like progress; the blocked box looks like a tracked dependency. In fact the blocked box is an open failure mode that will bite at runtime regardless of whether it's labeled.

**Correct alternative:**

1. **Re-probe every gated operational task before declaring the containing feature done.** When a feature depends on a migration, seed, or external operation that was originally gated, the last step of the feature must be: re-check the gate, run the operation, verify its effect against real data. Don't assume a gate that was closed is still closed — probe it.
2. **Fuse the feature and its operational dependency in the todo list.** Instead of two separate todos ("implement" + "run migration"), write one with explicit sub-steps: "implement + migrate + verify against /work/meteor." A single checked box should mean the whole thing works end-to-end. If the migration sub-step is blocked, the feature is blocked — don't check the outer box.
3. **When a gate is identified, name the condition that will signal it has cleared.** Not "blocked — dev server down" but "blocked — retry when `curl localhost:4000/api/projects?limit=1` returns 200." A testable re-probe instruction means any future session can reliably check whether the gate is still active without context reconstruction.
4. **For features that require migrated data, the verification step is "the migration ran AND the feature behaves correctly on migrated data," not "the code compiles."** HTTP 200 on the feature's page isn't sufficient — the feature's user-visible behavior must be verified against post-migration content.

**Detection:**

- **At feature-complete time:** Grep the active todo list for any item containing words like "migration," "seed," "backfill," "run script," "operational," or "after [N] unblocks." Each hit is a candidate gated dependency that needs re-probing before reporting done.
- **During incident review:** When a user reports "I tried the feature and nothing changed," check whether any migration, seed, or one-shot operation was expected to run and whether it actually did. Before diving into the code, inspect live data against the code's assumptions.

**Incident:** ENG-177 (2026-04-20) — User tested the ENG-176 per-image DnD feature on `/work/meteor`, reported "I STILL cannot drag the individual image slots." The code was correct and merged; the feature was unreachable because the imageGroup → atomic migration (gated on EAP-042) had never run against the live CMS. Inspecting live data confirmed 3 `imageGroup` blocks with 13 filled and 2 empty placeholder slots — zero atomic `image` blocks. Fix: run the dry-run, audit its output, fix the transform's empty-slot handling (→ EAP-109), run the real migration, verify post-migration state. Entire ENG-176 refactor became reachable only after this step. ~24 hours of "shipped" feature behavior was indistinguishable from "not shipped" to the user.

**Principle:** A feature that requires an operational step is not complete when the code lands. It is complete when the operational step has run against real data and the feature's user-visible behavior has been verified against the resulting state. Gated todos must be re-probed at feature-complete time, not just at session-start time; a gate that cleared silently is the most expensive kind of pending work.

---

<a id="eap-109"></a>
## EAP-109: Flat-Model Migration Drops Empty Slots From a Union-ish Source Model

**Status: ACTIVE**

**Trigger:** You are writing a migration from a container data model (a parent block with a children array *and* a parallel scaffold-label array that defines intended slots) to a flat atomic model (one block per slot). The transform iterates one source array or the other with an if/else: `const count = children.length > 0 ? children.length : labels.length`. On fully populated containers the transform produces N atoms; on empty containers it produces M atoms; on **partially populated** containers — the most common live state — it produces only N atoms and silently drops the `M - N` unfilled scaffold slots, destroying author-declared intent.

Concrete canonical shape in this codebase: the `imageGroup` block had two parallel arrays — `images` (filled media references) and `placeholderLabels` (intended slot labels like "Before & After" or "Lifecycle map"). Authors often set up 5 labeled slots but filled only 3, leaving 2 empty drop-zones visible on the admin page. The `transformImageGroup` function in `src/lib/migrate-image-groups.ts` had `const useImages = images.length > 0; const count = useImages ? images.length : labels.length`. On Meteor's first imageGroup (3 filled images + 5 placeholder labels), the migration would have emitted 3 atomic image blocks and dropped 2 labeled slots. The user had asked for per-image drag on all slots including empty ones — the migration would have silently violated that by converting "5 slots, 3 filled" into "3 slots, 3 filled," erasing 2 authoring decisions per group with no warning.

**Why it's wrong:**

1. **Parallel source arrays encode different facts, not duplicate facts.** In the imageGroup model, `images[]` encoded "what is actually here right now" and `placeholderLabels[]` encoded "what the author planned to put here." These are not the same dimension — a filled group has data in one, an unfilled-but-scaffolded group has data in the other, a partially filled group has data in both with different indices. A migration that treats them as "one or the other" picks only one dimension of author intent to preserve.
2. **Empty slots are author-declared intent, not cleanup debt.** A label like "Before: the daily email-and-spreadsheet review loop with BNY vendor" is a research note the author made about what should go there. Dropping it during migration means the author has to re-research, re-write, and re-label that slot — pure regression of their work. The migration should preserve every slot because every slot is work that was done.
3. **The most common live state is the most vulnerable.** Empty containers and fully populated containers both round-trip correctly through the bad transform. Partially populated containers — which is the dominant real state in any author workflow where writing happens over time — hit the exact case where the bug fires. The worse the workflow, the more common the state, the more damage the migration does.

**Correct alternative:**

1. **Iterate `max(N, M)` slots, not `N || M`.** The total slot count for any position-indexed union-ish source model is the maximum of the parallel arrays' lengths, because the arrays index the same positions; either array can extend the other.
2. **For each slot, derive the atom from whichever parallel array has data at that index, defaulting the others.** Filled slot (`images[i]` present) → atom with media and optional caption. Empty slot (`labels[i]` present, `images[i]` absent) → atom with `placeholderLabel` and no media. Both arrays empty at position `i` (shouldn't happen if max was used, but defensive default) → empty atom with neutral defaults.
3. **Enumerate all four container states during migration review.** Before merging the migration, run the transform (or dry-run it) against: (a) empty container (0 filled, 0 labeled) → should emit 0 atoms; (b) partially filled container (N filled, M > N labeled) → should emit M atoms; (c) fully filled container (N filled, 0 labeled OR N labeled) → should emit N atoms with no label bleed; (d) over-scaffolded container (0 filled, M labeled) → should emit M empty atoms. If any row in that table is wrong, the transform is wrong.
4. **Verify post-migration counts match pre-migration intent counts, not pre-migration fill counts.** Meteor pre-migration: 3 imageGroups, 21 total slots (sum of `max(images.length, placeholderLabels.length)`). Post-migration atom count under the correct transform: 15 (hero stays separate). Under the incorrect transform: 13 (loses 2 empty slots). The discrepancy is the migration's silent data loss — spotting it requires comparing the right counts.

**Detection:**

- **During migration code review:** Search for `useX ? X : Y` patterns where X and Y are parallel source arrays. Ask: "if X has data AND Y has data at higher indices, does the transform reach those higher indices?" If not, the transform has a silent-drop case.
- **Before merging the migration:** Write the four-state table described above and verify each row against the transform output. If the migration touches live data and any row is wrong, the migration is not ready to ship.
- **Post-migration:** Spot-check a partially populated container in the migrated data. Count the atoms. Compare against `max(filled, labeled)` in the pre-migration state. A mismatch indicates EAP-109.

**Incident:** ENG-177 (2026-04-20) — The imageGroup → atomic migration transform was `useImages ? images.length : labels.length`. Meteor's first imageGroup had 3 filled images + 5 placeholder labels. Dry-run output showed `imagesEmitted: 13` total across 3 groups — a loss of 2 empty slots per the over-scaffolded group. Fix: changed to `Math.max(images.length, labels.length)`; iterate slot-wise; emit filled slots with media and empty slots with their `placeholderLabel`. Dry-run re-ran: `imagesEmitted: 15` — matching the expected max-slot count. Then ran the real migration and verified via Payload REST API that both filled and empty atomic slots exist with the correct label text preserved on empty ones ("Before: the daily email-and-spreadsheet review loop with BNY vendor", "After: Meteor auto-generated basket with flagged exception rows", etc.).

**Principle:** When a migration moves from a container-with-parallel-arrays model to a flat model, the target atom count equals the total slot count, which equals the maximum of the parallel arrays' lengths — never a single array's length in isolation. Empty slots in the source model are author intent. They survive the migration as empty atoms; they do not get silently cleaned up. Verification before shipping a union-to-flat migration requires running the transform against every combination of (filled subset, labeled subset) and confirming the emitted atom count equals the union cardinality.

---

<a id="eap-110"></a>
## EAP-110: Reorder-Only DnD on a 2-D Layout

**Status: ACTIVE**

**Trigger:** A drag-and-drop system is wired up on a 2-D layout (grid, row/column composition, masonry, anything where the dragged item can be adjacent to the drop target on two different axes) and the DnD handlers read only `over.id` at drop time. `handleDragEnd` looks something like:

```ts
const fromIdx = getIndex(active.id)
const toIdx = getIndex(over.id)
reorder(fromIdx, toIdx)
```

Pure reorder works. Any operation that requires changing a *relationship* between the dragged item and the drop target — joining them into a shared container, splitting them out of one, nesting one inside the other — silently no-ops because the relationship bit (here `rowBreak: boolean`) is never set by the drop, only by explicit toolbar UI or a schema default.

Concrete canonical shape in this codebase: `ProjectClient.tsx` DnD after the atomic-image migration. Per-image sortability worked (ENG-176). The data model had `rowBreak: boolean` on each `image` block as the row-membership bit — `rowBreak: true` opens a new row, `rowBreak: false` continues the previous row. `handleDragEnd` spliced blocks via `useBlockManager.reorderBlockRange` + `normalizeImageRowBreaks`, which is a one-direction repair: it promotes orphaned followers to row-heads but never demotes a head to a follower. Result: dragging image A next to image B never merged them (both kept `rowBreak: true`); dragging an image out of a multi-image row never split it (its `rowBreak` stayed `false`, the row kept it as a member). The author's only escape was to open the Payload admin and flip the bit manually.

**Why it's wrong:**

1. **`rectSortingStrategy` exposes a 2-D pointer signal; `over.id` throws it away.** At `handleDragOver` and `handleDragEnd` time, `@dnd-kit` provides `active.rect.current.translated` (the dragged block's current translated rect) and `over.rect` (the drop target's rect). The center-delta `dx = activeCenter.x - overCenter.x`, `dy = activeCenter.y - overCenter.y` distinguishes horizontal adjacency (`|dx| > |dy|` → drop is to the left/right of target → intent-within-row / merge) from vertical adjacency (`|dy| > |dx|` → drop is above/below → intent-between-rows / split). The 1-D list index collapses both cases into `toIdx = overIdx` (or `overIdx + 1`), discarding exactly the discriminator.
2. **"Drop position" vocabulary needs to match layout dimensionality.** A `dropPosition: 'before' | 'after'` prop reflects a 1-D sort contract. On a 2-D layout the vocabulary must expand to `'before' | 'after' | 'left' | 'right'` (or an equivalent pair encoding axis + side). Without the richer vocabulary, the visual hint cannot reflect the intent even if the handlers compute it — the author sees a horizontal line where a vertical one should appear, breaks their mental model of what will happen, and learns to distrust the affordance.
3. **Transform primitives must set the relationship bit atomically with the splice.** Even with intent captured, routing merge drops through a pure-reorder `reorderBlockRange` means the patch lands with the bit unchanged, a post-hoc normalizer runs and can't tell "this drop should demote" from "this reorder shouldn't touch membership," and the UI renders the wrong row layout. The primitive that handles the drop must take `intent` as a parameter and set the bit in the same patch — anything else races the optimistic update against the normalizer.

**Correct alternative:**

1. **Capture intent in `handleDragOver`, not `handleDragEnd`.** Compute `dx`/`dy` between active and over rect centers every time the pointer crosses a cell boundary. Derive `{ intent: 'merge' | 'split', side: 'left' | 'right' | 'top' | 'bottom' }` and store it in state. `handleDragEnd` reads this state; `handleDragOver`'s role is both to keep it fresh AND to let the render loop draw a visual hint that reflects the live decision.
2. **Expand the `dropPosition` vocabulary to match the layout.** On a 2-D layout, a visual drop hint needs an axis (horizontal line for split / vertical line for merge) and a side (before/after for split; left/right for merge). Wire the render loop so that `dropPosition` reads from the intent state, not from a single-axis from/to comparison.
3. **Build a single atomic transform that does splice + bit flip.** In this codebase, `applyImageDropIntent(blocks, fromCmsIdx, postRemovalToIdx, intent)` performs the splice and then sets `rowBreak` on the moved block AND adjusts neighbors: on merge, if the preceding block is an image, demote the moved block's `rowBreak` to `false`; if no preceding image, set it to `true` and demote the follower's `rowBreak` from `true` to `false` so two solos fuse. On split, set the moved block's `rowBreak` to `true` and promote the follower from `false` to `true` so the source row doesn't swallow the next block. The transform is a pure function run identically on the optimistic client state and the server patch, matching the ENG-175 single-source-of-truth contract. A final `normalizeImageRowBreaks` pass defends the "first image after a non-image is a row head" invariant against edge cases.
4. **Side-aware insertion index, not the generic `from < to ? to-1 : to` shift.** The post-removal insertion index depends on which side of the target the drop lands: `right` / `bottom` → `overIdx + 1`, `left` / `top` → `overIdx`. Then the standard `fromIdx < insertIdx ? insertIdx - 1 : insertIdx` removal shift applies. Using `fromCmsIdx < toCmsIdx ? toCmsIdx - 1 : toCmsIdx` unconditionally collapses merge-left and merge-right onto the same final index and breaks whichever direction doesn't match the reorder heuristic.

**Detection:**

- **During DnD review:** Search `handleDragEnd` for the triple — uses only `over.id`, computes `toIdx` from list position alone, calls a pure-reorder primitive. If yes, and the data model has any relationship bits (row/column/parent pointers), the DnD is reorder-only by construction.
- **Data-model signal:** Any schema field of the form `<membership>Break: boolean`, `parentId: string | null`, `groupId: string | null`, `columnIndex: number` on an array element IS a relationship bit. If users cannot change that bit by dragging, they must change it via explicit toolbar UI — silent no-op drops on a layout that looks 2-D is EAP-110.
- **Empirical test:** Try four drops on a 2-D layout. (a) Drag a solo item next to another solo item — do they form a shared row? (b) Drag an item from a multi-item row to a gap — does it split? (c) Reorder within a row — does position change without affecting row membership? (d) Reorder between rows — does position change without breaking adjacent row structure? Any "no" is EAP-110 on the operation that should be producing the relationship change.

**Incident:** ENG-179 (2026-04-20) — User tested ENG-176 per-image DnD on `/work/meteor` and reported that individual image reorder worked but "form rows by dragging" and "break rows by dragging" both silently no-op'd. Root cause was all three failures compounding: `handleDragOver`/`handleDragEnd` read only `over.id`; `reorderBlockRange` + `normalizeImageRowBreaks` had no demote path for merge; `SortableBlock.dropPosition` was `'before' | 'after' | null` with no vertical-line vocabulary. Fix landed the intent capture + `applyImageDropIntent` transform + `reorderImageWithDropIntent` server primitive + expanded `DropEdge = 'before' | 'after' | 'left' | 'right' | null` with a vertical `.dropLineVertical` accent bar at the merge-side gutter. Verified on localhost: merge forms shared rows, split pulls images out, pure reorder still works.

**Principle:** Drag-and-drop on a 2-D layout must read a 2-D pointer signal. `rectSortingStrategy` gives you `active.rect` and `over.rect`; collapsing them to a single list index at drop time throws away the dimension that distinguishes adjacency-within-container (merge / nest) from adjacency-between-containers (split / peer). Intent capture lives in `handleDragOver` so the visual hint can reflect it live; transform primitives set the relationship bit atomically with the splice; the `dropPosition` vocabulary must be rich enough to distinguish each intent visually. When the data model has a relationship bit and the layout is 2-D, "reorder" is always a subset of the valid operations — never the whole contract.

---

<a id="eap-118-b"></a>
### EAP-118: Session-existence check without identity match on re-auth pages

**Status:** Active
**Category:** Auth / Session Management
**First observed:** ENG-203 (2026-04-23)
**Occurrences:** 1

**Pattern:** A login or re-authentication page checks `if (existingSession)` to skip the login form, but doesn't compare the session identity against the target resource (the company slug in the URL). Any prior session - even one for a different identity - causes the page to redirect away, silently preventing the user from authenticating as the intended identity.

**Why it fails:** The check conflates "has a session" with "has the right session." In a multi-identity system (visitor → unknown → cognition), a prior "unknown" session is truthy but doesn't authorize access to company-specific features. The redirect fires before the user sees the login form, so from their perspective the feature simply doesn't work.

**Correct alternative:** Compare the session identity against the page's target: `if (existingSession && existingSession === targetIdentity)`. Only skip the login form when the session already matches what the page would set. For mismatched sessions, show the form so the user can upgrade their session.

**Detection:** Search for `redirect("/")` or `redirect(...)` in login/auth page server components where the guard is a bare truthy check on a session value without comparing it to the route parameter.

**Incident:** ENG-203 — User visited `/for/cognition` with a prior "unknown" session cookie. The login page server component checked `if (existingSession)` → truthy → redirected to `/`. User never saw the login form, never entered the password, cookie stayed "unknown", home page showed no personalization badge. Fixed to `if (existingSession && existingSession === company)`.

---

<a id="eap-119-b"></a>
### EAP-119: Single-layer client-side storage for cross-session identity tagging

**Status:** Active
**Category:** Analytics / Identity
**First observed:** ENG-202 (2026-04-25)
**Occurrences:** 1

**Pattern:** Using `localStorage` as the sole mechanism to tag a device/user identity across sessions. Fails silently in any incognito/private browsing mode because localStorage is ephemeral.

**Why it fails:** Safari Private Browsing, Chrome Incognito, and Firefox Private Browsing all create isolated localStorage scopes that are destroyed when the session ends. Any identity stored there is lost. Additionally, Mixpanel's `persistence: "localStorage"` option means `$device_id` also resets in incognito, so device ID matching fails too.

**Correct alternative:** Use multiple independent detection layers. Server-set httpOnly cookies survive across tabs within a session (even in incognito). Login-flow tagging (setting a cookie when the user authenticates with a special password) is the most reliable mechanism because it piggybacks on the authentication action the user is already performing. Use `mixpanel.get_property('$device_id')` (not `get_distinct_id()`) for device matching, since `distinct_id` changes after `identify()`.

**Detection:** Search for `localStorage.setItem` or `localStorage.getItem` used as the sole mechanism for tagging identity properties that must persist across browser modes.

**Incident:** ENG-202 — Owner device activity polluted Mixpanel reports because `localStorage.getItem("yg_owner")` was the only check. Failed on iPhone incognito and MacBook incognito. Fixed with four-layer detection (admin password, server cookie URL, known device ID, Payload admin).

---

<a id="eap-124"></a>
### EAP-124: Multiple instances of a mutation-in-place canvas library sharing the same data arrays

**Status:** Active
**Category:** Data Visualization / React Integration
**First observed:** ENG-234 (2026-04-26)
**Occurrences:** 1

**Pattern:** Passing the same node/link arrays to multiple ForceGraph (or similar d3-force-based) component instances on the same page. Libraries like `force-graph` and `d3-force` mutate data objects in-place (adding `x`, `y`, `fx`, `fy`, `__indexColor`, `__photons`, etc.). When multiple instances share the same objects, one instance's cleanup (`delete link.__photons`) destroys another instance's state. The bug is invisible in single-instance testing and manifests as features (particles, pinning, labels) silently not working.

**Why it fails:** The kapsule's `updDataPhotons` function runs on every `graphData` setter call. For instances with `linkDirectionalParticles=0`, it deletes `__photons` from every link. Since all instances reference the same link objects, this deletion affects ALL instances. Additionally, `react-kapsule` only exposes methods listed in `methodNames` (not `graphData`), so `graphRef.current.graphData()` returns undefined - breaking any imperative workaround.

**Correct alternative:** Deep-clone nodes and links inside the component: `useMemo(() => ({ nodes: nodes.map(n => ({...n})), links: links.map(l => ({...l})) }), [nodes, links])`. Each instance gets its own objects. Use the cloned arrays (not the original props) for any callback that needs hydrated data (pinAllNodes, emitParticle burst).

**Detection:** Multiple `<ForceGraph>` (or `<ForceGraph2D>`, `<ForceGraph3D>`) instances on the same page receiving the same `nodes`/`links` array references. Also: any `graphRef.current.graphData()` call (method not on ref).

**Incident:** ENG-234 — Signal view particles were invisible across 6+ debugging attempts. The Mesh instance's `linkDirectionalParticles=0` kept deleting `__photons` from shared link objects before the Signal instance could render them.
