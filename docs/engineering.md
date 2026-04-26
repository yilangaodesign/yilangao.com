<!-- graph metadata for docs knowledge graph (see docs/knowledge-graph.md) -->
---
type: hub
id: engineering
topics: [engineering, parity, hydration, playground, cms, release]
documents:
  - engineering/localhost-verification.md
  - engineering/port-management.md
  - engineering/token-sync.md
  - engineering/debugging.md
  - engineering/git-branching.md
  - engineering/multi-app-architecture.md
  - engineering/versioning.md
  - engineering/storage.md
  - engineering/deployment.md
  - engineering/media-embeds.md
  - engineering/analytics-instrumentation.md
references:
  - engineering-anti-patterns.md
  - engineering-feedback-log.md
  - port-registry.md
  - architecture.md
---

# Engineering — Accumulated Knowledge

> **What this file is:** The hub of the engineering knowledge base for yilangao.com. Detailed topic sections live in `docs/engineering/*.md` spoke files; this hub contains the Section Index, meta-principles, and the incident frequency map. Every principle here was extracted from real incidents, debugging sessions, and process failures.
>
> **Who reads this:** AI agents routed here by `AGENTS.md` Pre-Flight. Read the Section Index first, then follow the link to the spoke file matching your task.
> **Who writes this:** AI agents after processing engineering feedback via the `engineering-iteration` skill.
> **Last updated:** 2026-04-24 (ENG-209 / EAP-120: Mixpanel crashed when `ProjectClient` tracked in `useEffect` before `AnalyticsProvider` finished `init` in its own `useEffect` (child passive effects run before parent). Appendix frequency map: new row "Client analytics SDK init ordering".)

---

## Section Index — Read This First

| § | Topic | File | Read when |
|---|-------|------|-----------|
| §0 | Engineering Posture | *(this file)* | Always for infra/build work |
| §1 | Localhost Verification | [`docs/engineering/localhost-verification.md`](engineering/localhost-verification.md) | Starting servers, verifying |
| §2 | Port Management | [`docs/engineering/port-management.md`](engineering/port-management.md) | Starting/stopping servers |
| §3 | Token Sync | [`docs/engineering/token-sync.md`](engineering/token-sync.md) | Modifying tokens, sync scripts |
| §4 | Debugging Methodology | [`docs/engineering/debugging.md`](engineering/debugging.md) | Diagnosing issues |
| §5 | Process Principles | *(this file)* | Meta — how to approach changes |
| §6 | Git Branching | [`docs/engineering/git-branching.md`](engineering/git-branching.md) | Branch questions, commits |
| §7 | Cross-App Parity | [`.cursor/skills/cross-app-parity/SKILL.md`](../.cursor/skills/cross-app-parity/SKILL.md) | Adding deps, fonts, infra |
| §8 | Knowledge Enforcement | *(this file)* | Recurring incidents |
| §9 | Multi-App Architecture | [`docs/engineering/multi-app-architecture.md`](engineering/multi-app-architecture.md) | Adding routes, new apps |
| §10 | Versioning (Élan) | [`docs/engineering/versioning.md`](engineering/versioning.md) | Version bumps, releases |
| §11 | CMS-Frontend Parity | [`.cursor/skills/cms-parity/SKILL.md`](../.cursor/skills/cms-parity/SKILL.md) | Adding/renaming CMS fields |
| §12 | Media Storage & Preloading | [`docs/engineering/storage.md`](engineering/storage.md) | Uploading files, storage, asset preloading pipeline |
| §13 | Deployment Verification | [`docs/engineering/deployment.md`](engineering/deployment.md) | Deploying, checking Vercel, build failures |
| §14 | Inline-Edit CRUD Contract | *(this file)* | Any inline-edit primitive (text, array, Lexical, toolbar, managers) |
| §15 | External Video Embeds | [`docs/engineering/media-embeds.md`](engineering/media-embeds.md) | Adding/modifying YouTube/Vimeo/Loom embed support, `videoEmbed` block, parser, poster policy |
| §16 | Analytics Instrumentation | [`docs/engineering/analytics-instrumentation.md`](engineering/analytics-instrumentation.md) | Adding/modifying Mixpanel events, debugging tracking, touching AnalyticsProvider |
| App. | Frequency Map | *(this file)* | Checking recurring patterns |

---

## 0. Engineering Posture

**Treat every change as live.** This is not a static codebase — multiple dev servers, experiments, and the playground may be running simultaneously. Every code change must be verified on localhost. Every process must be aware of what else is running. Every data source must have exactly one canonical definition.

- **Localhost is non-negotiable.** If it's not running and rendering correctly on localhost, the change isn't done.
- **Port awareness is mandatory.** Read `docs/port-registry.md` before starting any server. Never kill processes blindly.
- **Single source of truth for data.** When the same data exists in multiple files, there must be an automated sync mechanism — not human discipline.
- **Verify after every change.** curl the page, check the terminal for errors, spot-check the rendered output.

---

## How to Use This File

1. **Read the Section Index above** — match your task to a section, follow the link to the spoke file or skill.
2. **If the user reports a bug**, activate the `engineering-iteration` skill — it will handle full doc reading.
3. **After resolving an issue**, update the relevant spoke file: strengthen existing principles or add new ones.
4. **Do NOT read the entire file** unless the skill protocol requires it.

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

## 8. Knowledge Enforcement (Rules Layer vs. Docs Layer)

**Severity: Critical** — The cross-app parity category recurred 3 times (ENG-002, ENG-003, ENG-004) despite being documented after the first incident.

### 8.1 The Problem

Engineering principles documented in `docs/engineering.md` are read by agents at session start, but long documents get diluted. The agent retains the general idea but forgets specific checklist items when deep in implementation. This is especially true for cross-cutting concerns (like "also update the playground") that aren't directly related to the task at hand.

### 8.2 The Rule

When the same category of incident occurs **3 or more times**, the fix is not to add more documentation. The fix is to **promote the check from docs to the rules layer**:

1. Add it to `AGENTS.md` Hard Guardrails (NEVER/ALWAYS list).
2. If it's part of a workflow (e.g., artifact creation), add it as a mandatory step in `AGENTS.md`.
3. Make it an **inline checklist** — not a pointer to a doc file.

### 8.3 Why This Matters

The always-on layer (`AGENTS.md`) is processed by the agent with higher priority and shorter context than doc files. Items in Hard Guardrails are treated as hard gates. Items in docs are treated as reference material. The enforcement hierarchy is:

| Level | Where | Agent behavior |
|-------|-------|----------------|
| **Hard gate** | `AGENTS.md` Hard Guardrails and mandatory protocols | Agent checks these before considering task complete |
| **Soft reference** | `docs/engineering.md`, `docs/design.md` | Agent reads per routing table, may not recall specific items during implementation |
| **Background knowledge** | Feedback logs, anti-patterns catalog | Agent consults when debugging, not proactively |

Recurring incidents should be escalated up this hierarchy until they stop recurring.

---

## 14. Inline-Edit CRUD Contract

Every inline-edit primitive (`EditableText`, `EditableArray`, `LexicalBlockEditor`, `BlockToolbar`, `SectionManager`, `ImageManager`, `CollectionActions`) must honor one contract across Create, Read, Update, Delete, Confirm, Undo, and Keyboard. This is the unification landed in ENG-155 and enforced by EAP-091/092/093.

### 9.1 Confirm (destructive actions)

- **Always** use `ConfirmDelete` (declarative) or `useConfirm()` (imperative) from `@/components/inline-edit` — both render the DS `AlertDialog` on Radix.
- **Never** call `window.confirm`, hand-roll a portal dialog, or reach for a one-off `<Dialog>` for destructive flows.
- Destructive confirm must show: a title, a body that includes the name/preview of the item, a destructive primary button, and a cancel secondary button. Esc + backdrop click cancel.

### 9.2 Toast (success / error / undoable)

- **Always** use `useToast()` from `InlineEditProvider`. Methods: `toast.success`, `toast.error`, `toast.info`, and `toast.undoable({ message, onUndo, duration })`.
- **Never** set a local `error` state on managers or render a hand-rolled live region. The provider owns a single DS `Toast` surface; `#block-live-region` is deleted.
- Structural row-level destructive actions (Lexical paragraph delete, block delete, array-item delete) must use `toast.undoable` with the pre-op snapshot as the `onUndo` payload. Non-optimistic flows (full CMS re-fetch) use `toast.success` only.

### 9.3 Keyboard (unified shortcuts)

- **Delete focused row:** `Cmd/Ctrl-Backspace` — scoped to the focused element (`e.target === e.currentTarget`) so it never steals from text inputs.
- **Move focused row:** `Alt-ArrowUp` / `Alt-ArrowDown` — scoped the same way.
- **Save:** `Cmd/Ctrl-S` (all editors). **Cancel:** `Esc` (closes edit, reverts in-flight dirty state).
- Structural surfaces use `useStructuralShortcuts` from `@/components/inline-edit`. Lexical paragraph shortcuts live inside `ParagraphRowPlugin` and register at `COMMAND_PRIORITY_HIGH` so they preempt default Backspace behavior only on the row handle.
- **Lexical → Lexical programmatic focus:** When `BlockNavPlugin` (or any code) moves the caret from one `LexicalComposer` surface to another, **blur the outgoing editor before touching `window.getSelection()`**. Lexical freezes committed selection `Point`s in dev; overlapping native selection APIs with in-flight reconciliation throws `Cannot assign to read only property 'key' of object '#<Point>'`. Pattern: `queueMicrotask` → `getNearestEditorFromDOMNode(document.activeElement)?.blur()` → `requestAnimationFrame` → `focus()` the target `contenteditable`. See ENG-194 and EAP-118.

### 9.4 Empty states (discoverability)

- **Admin empty `EditableArray`:** render a single full-width CTA chip — `+ Add {label || fieldPath}` — that opens the edit panel with an empty draft.
- **Admin empty `EditableText`:** render a muted italic placeholder — `+ Add {label || fieldPath}` (override via `adminPlaceholder`) — while non-dirty and not editing.
- **Admin empty `ProjectClient.content[]`:** render the existing "Add first block" CTA. No plain "No items."
- Non-admin renders collapse empty regions entirely (no CTA, no placeholder).

### 9.5 Create affordances (consistency)

- Primary: the top-of-panel "Add item" button in `EditableArray` and the between-block `+` affordance in `ProjectClient`.
- Secondary: an inline `+ Add item` chip at the bottom of `EditableArray`'s draft list so users don't have to scroll back up.
- Every Create affordance opens the same editing UI the Update flow uses — no one-off "create-only" surface.

### 9.6 Save / revalidate

- Editors flush via `SaveOnBlurPlugin` (Lexical) or on explicit `Cmd-S`. Managers call `router.refresh()` after a successful PATCH. Because `router.refresh()` re-fetches the tree, undo is scoped to the **pre-refresh** snapshot captured by the calling plugin/manager, not to a post-refresh diff.

### 9.7 Anti-patterns (see catalog)

- **EAP-091:** `window.confirm` or hand-rolled portal in inline-edit paths.
- **EAP-092:** Parallel modal systems instead of reusing `@ds/Dialog` + `@ds/AlertDialog`.
- **EAP-093:** Feature-local toast/announcement system instead of `InlineToastProvider` + `useToast`.

### 9.8 Insert-menu rule (singletons stay out)

A block insert menu must only list block types that are both **(a) valid children of the target stream** and **(b) actually rendered by the stream's rendering loop**. If a type is filtered out of the visible stream (e.g. `contentBlocks.filter(b => b.blockType !== 'X')`) or has a dedicated out-of-stream renderer (e.g. `const heroBlock = p.content.find(...)` rendered in a separate section), it is a **page-level singleton** and must not appear in the generic insert menu.

Violating this produces a silent no-op: the menu inserts the block into `content`, `router.refresh()` runs, but the user sees no reaction because the new block is filtered out or shadowed by the existing singleton. See ENG-159 (`hero` in `BlockToolbar.BLOCK_TYPES`) and EAP-097 candidate.

- Singletons are managed by a **dedicated region UI** (upload zone, replace overlay, identity card), not by the repeatable-block machinery.
- `BlockType` unions may still include singleton types for persistence and migration; the restriction is on the **insert UI**, not on the data model.

### 9.9 Imported CSS Module must own the class names used

- Every `styles.X` access must resolve to an exported key in the **specific CSS Module imported at the top of the file**. `styles` is a strict keyspace — a missing key returns `undefined`, renders as a bare HTML element, and fails silently through every layer of the toolchain (no type error, no lint warning, no browser console message).
- Prefer **co-locating** an overlay's SCSS next to its component (`FooOverlay.tsx` + `FooOverlay.module.scss`) so the rules can't drift into an orphaned sibling module.
- When an admin chrome surface looks like the browser default, the first hypothesis is `className={undefined}`: grep the imported module for the key, not the CSS rules. If the key is in a different module, the import is wrong, not the rules. See EAP-102.

### 9.10 Admin overlays compose DS primitives only

- Every clickable control inside an inline-edit / CMS overlay composes a DS primitive: `@/components/ui/Button` (icon-only buttons wrapped in `@/components/ui/Tooltip`), `@/components/ui/ButtonSelect` for mode switches, `@/components/ui/DropdownMenu` for overflow menus, `@/components/ui/Dropzone` for drop targets. Raw `<button>`, `<div onClick>`, and hand-rolled popovers are presumptively bugs in this surface — they violate Hard Guardrail #9 (non-zero radius from the UA stylesheet), miss focus/tooltip semantics, and side-step §14's CRUD contract.
- Destructive overlay actions (image delete, block delete, array-item delete) run through `useConfirm()` for the `AlertDialog` and `toast.undoable(...)` for the undo path. The pre-op snapshot is captured by the manager that owns the data (usually `useBlockManager`) and passed as `onUndo`. A one-click destructive overlay is a §14 violation regardless of how "minor" the delete looks.
- This is the overlay analogue of EAP-029 (every CMS text field wraps `EditableText`): just as no text field ships without inline-edit wiring, no overlay control ships without a DS primitive backing it. See EAP-103.

---

## Appendix: Incident Frequency Map

| Pattern | Times Raised | Priority |
|---------|-------------|----------|
| Data sync / token drift | 3 | **Critical — ENG-084. Playground maintained manually-duplicated `--ds-*` namespace; migrating source to `--portfolio-*` broke all consumer color resolution. Consumer apps must import from single source, not maintain parallel definitions. Grid reorder (2026-04-05): dual ordering systems (gridOrder + per-project order field) silently diverged. See EAP-070.** |
| Cross-app infrastructure parity | 3 | Critical |
| Rules-layer enforcement gap | 1 | Critical |
| Port management | 0 | Critical |
| Localhost verification | 1 | Critical |
| Build / bundler issues (React 19 compat) | 8 | **Critical — 3 failed fixes (ENG-017→018→019). Rule: no `<script>` in React tree. See EAP-013. ENG-117: Turbopack 16.2.x missing routes-manifest.json — switched main site to `--webpack` until upstream fix. See EAP-069. ENG-126 / ENG-127: SVG `fill="currentColor"` stale after client-side navigation. See EAP-072. ENG-134 / ENG-206: Corrupted `node_modules` or broken webpack dev output (missing manifests/chunks, ENOENT). Full `rm -rf node_modules .next && npm install` required — clearing `.next` alone was insufficient. See EAP-076.** |
| Native `<input>` text clipping (serif at display scale) | 2 | **High — RECURRED. ENG-139: original discovery. ENG-141: regression from adding `overflow: hidden` to the same overlay that was created to solve the original problem. Same constraint, different code path. See EAP-077, EAP-080.** |
| Proxy allowlist gap (new public asset directory) | 1 | **High — ENG-140. `/videos/` not in proxy passthrough, 307-redirected in incognito. See EAP-079.** |
| Flex-centered layout shift from conditional content | 2 | **High — ENG-137. `min-height` allows growth; use fixed `height` + `overflow: visible`. See EAP-078.** |
| CSS module cross-component specificity | 1 | **Medium — ENG-138. Component internal compound selectors (`.lg.minimal .child`) exceed page-level attribute selectors. Use `!important` for legitimate page overrides.** |
| CSS Module cross-file selector scoping | 1 | **High — ENG-190. A selector written in `featureA.module.scss` referencing `.wrapper` is hashed to `featureA_wrapper__HASH_A` — so it only matches elements that received the class from `featureA.module.scss`. If the wrapper `<div>` in JSX imports its class from a *different* module (`page.module.scss` → `page_wrapper__HASH_B`), the selector matches nothing. No lint, no compile warning, no runtime error — just an overlay/toolbar/menu that never reveals on hover. `BlockToolbar` was permanently invisible on every case-study page because its hover-reveal lived in `inline-edit.module.scss` but the wrapper's class came from `page.module.scss`. Symptom read as "delete button doesn't work" but delete logic was fine — the button never received pointer events because `opacity: 0; pointer-events: none` never flipped. Fix pattern already existed in the same module for `.sectionToolbar`: anchor reveal to an unscoped HTML data-attribute (`[data-block-admin]:hover > &`) which survives CSS-Module hashing. Selector-side mirror of EAP-102. See EAP-116.** |
| Turbopack cache / HMR delivery failure | 6+ | **Critical — ESCALATED TWICE. ENG-047, ENG-056, ENG-067, ENG-085, ENG-094, ENG-095 + undocumented. Previous "soft" protocol (curl → hard-refresh → flush as fallback) failed 6+ times because the agent stopped at step 1-2 and reported success. AGENTS.md #11 REWRITTEN: flush-and-restart is now the MANDATORY DEFAULT, not a fallback. After ANY playground edit: kill server → `rm -rf playground/.next` → restart → curl verify → report done. No HMR reliance. No exceptions. See EAP-042 (escalated).** |
| Verification gap (reporting done without browser check) | 4 | **Critical — promoted to Hard Guardrail #10 (ENG-020). curl ≠ verification. ENG-189: 4th occurrence. ENG-188 closed with "browser verification deferred to next live session" — the next live session was the user re-reporting the identical bug 10 minutes later, because the 12h23m-old Webpack dev server had never delivered the structural React hook-shape changes. "Deferred verification" is a documented shortcut around Hard Guardrail #10, not a mitigation. EAP-115 now bans the phrase "deferred to next live session" as a closeout and mandates clean dev-server restart + compiled-chunk grep for any client-component hook-shape change.** |
| Process automation gaps | 1 | High |
| Documentation procedure skips | 3 | **Critical — promoted to Hard Guardrail #1 (ENG-012)** |
| Zombie server processes | 3 | **High — ENG-116, ENG-205. TCP listen ≠ HTTP health. Servers ran for hours/days, accepted TCP connections but never responded to HTTP. Boot-up probe must use `curl --max-time` not `lsof`/`nc`. See EAP-068.** |
| External service placeholder configs | 1 | High |
| Node.js version / CLI tool compat | 1 | High — Node 25 breaks Payload CLI (ENG-015); use Node 22 LTS if CLI needed |
| Git branching / session safety | 1 | Critical |
| URL namespace / multi-app architecture | 1 | High — documented as ADR, revisit if a third concern lands on port 4000 |
| CMS UX / inline editing | 54 | **Critical — ESCALATED. ENG-027→039, ENG-042→046, ENG-049→051, ENG-054→058, ENG-062→063, ENG-066→068, ENG-105, ENG-110, ENG-111, ENG-114, ENG-115, ENG-123, ENG-131, ENG-132, ENG-105(relocation), ENG-155, ENG-157, ENG-158, ENG-159, ENG-162, ENG-176, ENG-177, ENG-179, ENG-188, ENG-189, ENG-194, ENG-195, ENG-196, ENG-197, ENG-198, ENG-199, ENG-200. ENG-197: Read-path counterpart of ENG-195/196 — CMS stores links in Payload format (`{ fields: { url } }`), but `@lexical/link`'s `LinkNode.updateFromJSON` reads top-level `url`. Editor crashed with "Cannot read properties of undefined (reading 'match')" when `MarkdownShortcutsPlugin` called `getURL().match(...)` on the undefined `__url`. Fix: `denormalizePayloadLinks()` before passing `initialState` to `LexicalComposer`. Also applied in `lexicalToMarkdown()`. EAP-119 updated. ENG-196: Same `@lexical/link` → Payload serialization mismatch as ENG-195 but on the inline-edit save path. `LexicalBlockEditor.save()` now runs `normalizePayloadLinks()` before writing. Extracted the function into `src/lib/normalize-lexical-links.ts` (client-safe, no headless editor dependency). Prior: ENG-195: `markdownToLexical()` produces `@lexical/link` `LinkNode` serialization incompatible with Payload's `convertLexicalToHTML` — `node.url` vs `node.fields.url` format mismatch. Fix: `normalizePayloadLinks()` post-conversion transform. EAP-119. Prior: ENG-189: Recurrence of ENG-188's two `TypeError`s — the fix was correct on disk but never reached the browser runtime. 12h23m-old main-site `next dev --webpack` process had booted before the ENG-188 edits landed; Next.js 16.2.1 Webpack HMR silently failed to deliver the structural React hook-shape changes (`useMemo` → `useState(() => config)`, four `useRef`s, `useEffect` dep arrays collapsed from 5 values → `[editor]`, `react` imports reordered). Compounding: ENG-188's closeout deferred browser verification to "next live session" and relied on HTTP 200 + server logs — which never exercise client-component hook chains. Fix: clean kill + `rm -rf .next` + restart + fresh compile, then bundle-content grep of `.next/dev/static/chunks/app/(frontend)/(site)/work/[slug]/page.js` confirmed all four ref names (`navRef`, `blockIndexRef`, `targetRef`, `fieldPathRef`) present in the served JavaScript. Defensive second-pass audit of every Lexical selection call site confirmed no remaining mutation path. Promoted EAP-115: fix-verification deferred to "next live session" under Webpack HMR staleness. Rule now in place: any fix that changes React hook shape inside a client component MUST force a clean dev-server restart and bundle-content grep verification before the fix is marked resolved. "Deferred to next live session" is banned as a closeout phrase. ENG-188: Two console `TypeError`s from the custom inline-edit Lexical stack — `Cannot assign to read only property '_cachedNodes' of object '#<RangeSelection>'` and `Cannot assign to read only property 'key' of object '#<Point>'` — surfacing the React 19 StrictMode + Lexical 0.41 interleave hazard. Three code shapes compounded: `LexicalComposer initialConfig` built with `useMemo` (StrictMode's first-render double-invocation reuses memoized values across both mount attempts, aliasing configs — per Lexical maintainer etrepum in facebook/lexical#6040, the canonical pattern is `useState(() => config)`), plugin `useEffect`s that call `editor.registerCommand(...)` with dep arrays containing non-stable values (`nav`, `target`, `fieldPath` — all fresh references each parent render, causing command teardown/re-register loops that interleaved with in-flight updates against Lexical's frozen committed selection), and `useBlockKeyboardNav` returning a fresh `{ ... }` object literal each render. Fix: `useState(() => ({...}))` for `initialConfig`; refs for all non-editor deps inside `BlockNavPlugin` and `SaveOnBlurPlugin` so command-registration effects depend on `[editor]` only; `useMemo` wrap around `useBlockKeyboardNav`'s return object. Cannot upgrade Lexical to 0.42 in isolation — Payload 3.80–3.83 pin Lexical 0.41.0 in `dependencies`, so a resolution override would duplicate the package in the bundle. Promoted EAP-114 with the full pattern catalog and correct-alternative rubric for future Lexical plugin authoring. ENG-179: Per-image DnD reorder worked but "form rows by dragging" / "break rows by dragging" silently no-op'd — three compounding gaps, all load-bearing together. (1) Intent blindness: `handleDragOver` / `handleDragEnd` read only `over.id`, collapsing the 2-D `rectSortingStrategy` drop zone into a 1-D list index and discarding `dx`/`dy` between `active.rect` and `over.rect` centers — the only signal that distinguishes adjacency-within-row (merge) from adjacency-between-rows (split). (2) Transform gap: `reorderBlockRange` + `normalizeImageRowBreaks` was one-directional — it promotes orphaned followers to row-heads but never demotes heads to followers, so `rowBreak: true → false` (the merge operation) had no patch path. (3) Affordance gap: `SortableBlock.dropPosition` was `'before' | 'after' | null`, so even if the first two gaps were fixed, the author couldn't see whether a drop would merge or split before committing it. Fix: `dropIntent: { intent: 'merge' | 'split', side: 'left' | 'right' | 'top' | 'bottom' } | null` state captured in `handleDragOver` from `dx`/`dy` between rect centers (image-on-image + `|dx| > |dy|` → merge-side, else split-side); new `applyImageDropIntent(blocks, fromCmsIdx, postRemovalToIdx, intent)` in `src/lib/normalize-image-rows.ts` performs splice + neighborhood-aware `rowBreak` flip (merge → `rowBreak: false` when preceded by image, else `true` and demote the next row-head to fuse two solos; split → `rowBreak: true` and promote the follower to prevent row swallow); new `useBlockManager.reorderImageWithDropIntent(fromIdx, toIdx, intent)` wraps `patchContent` with the same transform so optimistic mirror and server patch run the identical pure function (ENG-175 single-source-of-truth contract); expanded `DropEdge = 'before' | 'after' | 'left' | 'right' | null` with `.dropLineVertical` + `.dropLineVerticalLeft` / `.dropLineVerticalRight` in `page.module.scss` — 2px accent pulsing vertical line at -4px gutter on the merge side. Side-aware `targetInsertIndex(overIdx, side)` replaced the side-unaware `fromCmsIdx < toCmsIdx ? toCmsIdx - 1 : toCmsIdx` formula that had collapsed merge-right and merge-left onto the same index. Verified on localhost: solo+solo → shared row, image-out-of-row → new row, within-row reorder unchanged. Promoted EAP-110 (reorder-only DnD on a 2-D layout — DnD handlers that read only `over.id` and call a pure-reorder primitive silently no-op every relationship-change operation the data model can express; fix requires intent capture in `handleDragOver`, an atomic splice+flip transform, and a `dropPosition` vocabulary rich enough to distinguish each intent visually). ENG-177: Per-image DnD feature shipped code-complete in ENG-176 but remained invisible because the imageGroup → atomic migration (`POST /api/migrate-image-groups`) had never run — the todo was gated on EAP-042 dev-server instability and nothing re-probed the gate when the server recovered. User reported "I STILL cannot drag the individual image slots" because `/work/meteor` still rendered 3 live `imageGroup` blocks (legacy render path, zero sortable wrappers), not atomic `image` blocks. Compounding the gate miss: the migration transform itself would have silently dropped empty placeholder slots from partially-filled groups (`useImages ? images.length : labels.length`), violating the user's second ask ("drag empty image slots too"). Fix: reworked `transformImageGroup` to `Math.max(images.length, labels.length)`, emit one atomic per slot, carry `placeholderLabel` forward on empty slots only; ran the actual migration (5 projects touched, Meteor 3 groups → 15 atoms); updated `renderAtomicImageFigure` to show the `placeholderLabel` inside the empty-slot Dropzone with a hint line so authors recognize scaffold slots; `handleReplace` now clears `placeholderLabel` when image is set (matches schema's admin condition and keeps label state a pure function of fill state). Promoted EAP-108 (gated todo never re-probed after the gate clears — a feature that depends on an operational step is not complete when the code lands, it is complete when the operational step has run against real data and user-visible behavior is verified) and EAP-109 (flat-model migration drops empty slots from a union-ish source model — iterate `max(N, M)`, not `N || M`; every parallel source array encodes a different dimension of author intent, and all must survive). ENG-162: Image-block admin overlay rebuilt on DS primitives (`ImageBlockAdminOverlay` for reorder/replace/delete, `VideoSettings` for Loop/Player + Muted + poster-frame) after every raw `<button>` and `<div>` drop-zone rendered unstyled and bypassed the §14 CRUD contract. Root-cause pair: EAP-102 (class-name-from-the-wrong-module silent bug — `ProjectClient.tsx` imported `styles` from `page.module.scss` but the `.imageOverlayBtn` / `.dropZone` / `.addBlockBtn` rules lived in `inline-edit.module.scss`, so every `className=` resolved to `undefined`) and EAP-103 (raw `<button>` / `<div onClick>` in admin overlays violates Hard Guardrail #9 and skips `useConfirm` + `toast.undoable` by construction). Added §14.9 (imported module must own the class keys) and §14.10 (admin overlays compose DS primitives only). ENG-159: "Hero Image" was a silent no-op in the generic block insert menu because hero is a page-level singleton filtered out of the repeatable-block stream — removed from `BLOCK_TYPES`. See EAP-097 candidate and §14 Insert-Menu Rule. ENG-174: ENG-171's merge-on-drop heuristic in `handleDragEnd` fired on 100% of drops after the atomic-image migration — every `image` block defaults to `rowBreak: true`, making every row full-page-width with identical horizontal centers, so the discriminating signal had zero variance. Reverted to reorder-only; `mergeImageRangeIntoRow` retained for future explicit merge UI. Promoted EAP-106 (heuristic whose discriminating signal is invariant across the dominant data distribution). ENG-176: Per-image DnD scoping miss — `displayIds` and `handleDragEnd` emitted one sortable id per visual row of images, so users could reorder whole rows but could not move individual images inside a multi-image row or pull one out to split. Three prior iterations (ENG-171 merge heuristic → ENG-174 revert → ENG-175 optimistic state) all validated block-level DnD against the wrong target. Fix: flattened `displayIds` to one id per `contentBlocks` entry, wrapped each image inside a multi-image row in its own `<SortableBlock>`, switched to `rectSortingStrategy`, added `normalizeImageRowBreaks` invoked from `useBlockManager.reorderBlock` / `reorderBlockRange` to auto-heal `rowBreak: true` on the first image of each run (drag-to-split for free). Promoted EAP-107 (sortable unit locked to the visual unit rather than the data unit).** |
| Hydration mismatch (SSR/CSR divergence) | 10 | **Critical — ESCALATED. ENG-017/18/19/20, ENG-045, ENG-055, ENG-067, ENG-081, ENG-086, ENG-087. Three root cause families: (1) Turbopack bundle divergence — barrel import resolution (EAP-056), SCSS @use compilation (EAP-038), stale cache (EAP-035); (2) typeof window branching (EAP-014); (3) invalid HTML nesting. Barrel imports from lucide-react now banned via Hard Guardrail #15. See EAP-056.** |
| Client analytics SDK init ordering | 1 | **High — ENG-209. `mixpanel.init` only in parent `useEffect` while nested pages call `track` in `useEffect` — React runs child effects first, so `track` executed before init and Mixpanel threw on internal `before_track`. Fix: client-render-time `initMixpanel` in `AnalyticsProvider` (after `typeof window` guard) plus guards on `track` and `identifyCompany` when not initialized or disabled. See EAP-120.** |
| Stacked chart segment hover + tooltip | 2 | **Medium — ENG-210 / ENG-211. ENG-210: per-segment `onMouseLeave` + popover above thin slices caused flash; fix stack-level `onPointerMove` + height partition. ENG-211: follow-up side-anchored popover was fully clipped by `.barStack { overflow: hidden }`; restored above-segment placement, `overflow: visible` on stack/chart/column, and a 56px `.barStackHoverBridge` so the pointer can reach the tooltip without clearing hover. See EAP-121.** |
| Data viz tooltip clipping (`overflow: hidden`) | 1 | **Medium — ENG-212. SkillMap treemap: absolute tooltip + `translate(-50%)` clipped by `.treemapContainer { overflow: hidden }`. Fix: `overflow: visible` on container + legend wrapper, clamp anchor X, `max-width` + wrap on tooltip chip.** |
| Live data feed for elan-visuals | 1 | **Medium — ENG-213. SkillMap treemap hardcoded anti-pattern counts (136 stale vs 178 live). Created `/api/antipatterns` route that parses `## Category Index` tables from all 3 anti-pattern docs at request time (`s-maxage=60`). Component fetches on mount and renders live proportions.** |
| Documentation procedure skips | 10 | **Critical — ESCALATED AGAIN. ENG-008/012 (EAP-010), ENG-044/045/046 (EAP-027), ENG-053 (EAP-032), ENG-142 (8th), ENG-110 (9th), ENG-146 (10th). 10th occurrence introduces a new failure variant: large changes perceived as "too in-progress" (vs. previous "too trivial"). Three distinct rationalizations now documented (urgency, triviality, in-progress), all producing identical zero-documentation outcomes. The Hard Guardrail + EAP-027 enforcement mechanism has been violated every occurrence since it was introduced. It is dead text. Needs fundamentally different approach — not more instructions, but workflow interruption.** |
| Continuation summary trusted over filesystem | 1 | **High — ENG-156. After a context compaction, edits described in the summary as "completed" were never actually written to disk. Verification grepped for generic markers (block-index count, HTTP 200) instead of the specific bug string, so the regression shipped to the user. Fix: `git diff` / `Grep` any file a summary claims was edited before accepting the claim; verify for the exact thing the user complained about, not for the framework around it. See EAP-094.** |
| Design system migration / upstream-first workflow | 1 | High — ENG-040. ScrollSpy promoted to DS; required `transpilePackages` + export path. |
| Admin IA / discoverability | 4 | **High — ENG-042/043/046/100. ENG-100: Full IA restructure — 7 groups → 3, NavPages trimmed to Quick Links (Company Access + Open Live Site), ViewSiteLink absorbed, breadcrumb added to CompanyDashboard. See architecture.md §4.2.** |
| Infrastructure / storage architecture | 8 | High — ENG-053 / ENG-192 (codec guardrail). Supabase Storage added for cloud file persistence. ENG-055: Added `uploadMedia` API helper for inline file uploads via S3. ENG-060: Filename sanitization for S3-incompatible chars. ENG-135: Image loading optimization — `next/image` with Supabase `remotePatterns`, Payload derived sizes on frontend, responsive `sizes` hints, priority for LCP images. ENG-152: Video + GIF support — per-asset `playbackMode` + `poster` on Media, GIF `unoptimized` branch in MediaRenderer, fetch `depth: 3` for nested poster relationship. **ENG-160: Uploads must bypass Payload's `/api/media/file/*` proxy — the plugin shorthand `collections: { media: true }` routes every read through the Node app server, breaking video Range support, defeating the CDN, and 404ing on filename mismatch. Use `disablePayloadAccessControl: true` + custom `generateFileURL` rewriting `/storage/v1/s3` → `/storage/v1/object/public`. See EAP-098.** ENG-153: External video embeds — new `videoEmbed` block type for YouTube/Vimeo/Loom URLs via Path A (standalone block) instead of Path B (extending `Media` collection). Parser: `src/lib/parse-video-embed.ts` (regex-only, isomorphic). Component: `src/components/ui/VideoEmbed/` (click-to-load iframe, poster precedence, privacy-mode hosts). Accepted gap: no grid-mixing inside `imageGroup` cells. See `docs/engineering/media-embeds.md`. |
| Asset preloading / session caching | 1 | Medium — ENG-115. Progressive preloading pipeline: login page `<link rel="preload">` for thumbnails, homepage `PreloadManager.seedManifest()` for case study assets (heroes Tier 1, content Tier 2), case study `bump()` for priority promotion. Module-level singleton survives client-side navigations. |
| Cursor thumbnail positioning / competing systems | 2 | **High — ENG-114, ENG-116.** ENG-114: per-frame collision detection broke cursor following (see EAP-086). ENG-116: four competing y-position systems (lerp, preference, clamp, nudge) created irreconcilable conflicts. Resolved by replacing all with a deterministic horizontal rail model — one formula, no avoidance layers. Pattern: incremental positioning rules without a unified model always diverge. |
| Version control / release automation | 4 | **Critical — ENG-069/078/079/080. ENG-080: Vercel build failed after checkpoint — monorepo @ds/* imports couldn't resolve node_modules on Vercel (Turbopack resolves relative to file location). Fixed via dual install command + build gate. Build gate now mandatory pre-merge step.** |
| Radix primitive internal state vs mirrored props | 1 | Medium — ENG-071. Checkbox indeterminate icon branched on React `checked` while uncontrolled `defaultChecked="indeterminate"` leaves prop undefined; UI must follow `CheckboxIndicator` `data-state` (or context), not props alone. |
| Scroll hijack on embedded canvas | 1 | High — ENG-072. onWheel handler on embedded DAG canvas intercepted page scroll. Embedded canvases must never capture wheel events; pan via drag only. See EAP-036. |
| Playground ↔ production drift (one-way experiment) | 5 | **Critical — ESCALATED. ENG-073, ENG-074, ENG-101, ENG-102, ENG-106. Drift from non-propagation AND from rebuilding demos with hardcoded values instead of token references. ENG-106: New variant (`solid` on Navigation) added without updating playground — no mechanism caught it. Hard Guardrail #24 added: ALWAYS update playground when adding variants/props to DS components. See EAP-007, EAP-030, EAP-055, EAP-082.** |
| Playground component re-implementation drift | 3 | **Resolved — ENG-073/075/076. Three-stage enforcement pipeline: (1) Central Intent Gate in AGENTS.md #18 blocks component visual edits to playground, (2) ESLint inline plugin catches forbidden patterns in playground pages, (3) Evaluation Gate with correction loop in playground skill. See EAP-037.** |
| SCSS token theme adaptability | 2 | **Resolved — ENG-082/083. Full CSS custom property output layer (`_custom-properties.scss`) now generates `:root` (light) and `[data-theme="dark"]` blocks. ~40 SCSS modules migrated from `$portfolio-*` to `var(--portfolio-*)`. 43 component-level `$_` tokens introduced for hardcoded px values. Remaining 202 SCSS refs are documented exceptions (rgba(), always-dark surfaces, interaction state tints).** |
| Playground demo placeholder links | 3 | **High — ENG-088/089/090. ENG-088: `href="#"` scrolls to top. ENG-089: removing `href` broke NavItem layout because SCSS doesn't reset `<button>` UA defaults. ENG-090: resolved with `onClick={prevent}` + `"use client"` — keeps `<a>` rendering for correct SCSS while suppressing navigation. See EAP-057.** |
| Token expansion (motion) | 1 | Low — ENG-091. Added `$portfolio-duration-nav` (200ms) and `$portfolio-easing-nav` (ease-out) for navigation spatial transitions. Fills gap between fast (110ms) and moderate (240ms). |
| Fixed-position component in preview container | 1 | High — ENG-092. Embedding `position: fixed` + `createPortal(body)` layout components in playground preview divs causes DOM escape. Layout components demo via code + subcomponent previews only. See EAP-058. |
| Component duplication / shadow implementation | 1 | High — ENG-093. VerticalNavCategory reimplemented ~80% of NavItem's visual DNA with 11 parallel SCSS classes. Resolved by adding `expanded` state to NavItem + creating NavItemTrigger/NavItemChildren primitives. Layout components must compose — never reimplement — the nav item primitive. |
| Component API prop pass-through gap | 1 | Medium — ENG-094. NavItemTrigger lacked `badge` prop pass-through to NavItem. Wrapper components must forward all visual props of the inner primitive they compose. |
| CSS alignment inconsistency (.badge vs .trailing) | 1 | Medium — ENG-094. `.badge` had `margin-inline-start: auto` but `.trailing` didn't. Both right-aligned slots should use the same CSS mechanism. |
| Deployment / Vercel build | 2 | **High — ENG-096/097. ENG-096: First deploy failed (gitignored `importMap.js` + missing `resend` dep). ENG-097: Playground proxy collision — `turbopack.root: monorepoRoot` caused Next.js 16 to detect main site's `proxy.ts` in playground build. See EAP-060, EAP-061.** |
| CMS data migration (JSON → collection) | 1 | Low — ENG-098. Password gate data migrated from static `companies.json` to Payload `companies` collection. Custom admin dashboard built. Seed script for one-time migration. |
| Auth / session identity mismatch | 1 | Medium — ENG-203. Login page checked `if (existingSession)` instead of `if (existingSession === company)`, silently preventing re-auth when the session was for a different identity. See EAP-118. |
| Migration scaffold loss | 1 | High — ENG-118. Sections→blocks migration dropped the image placeholder system because it lived in a separate layer (`page.tsx` static map, not CMS schema). Migration checklists must audit scaffold/placeholder/preview layers alongside data and render layers. |
| Payload schema push failure | 3 | **High — ENG-099, ENG-109, ENG-133. Payload 3's `push` option and CLI both non-functional on this project. New collections require manual SQL push via `src/scripts/push-schema.ts`. Column type changes need explicit `USING` cast. ENG-133: Payload's interactive schema push prompt hangs non-interactive shells when a column is removed from schema but not from DB. Always drop stale columns via SQL before restarting. See EAP-062, EAP-063.** |
| Payload import map stale after component removal | 1 | **High — ENG-100. Deleting an admin component without cleaning `importMap.js` crashes the admin panel with 500. See EAP-063.** |
| Database security (Supabase RLS) | 1 | High — ENG-130. All 33 Payload-created tables in `public` schema had RLS disabled, exposing data (including password hashes) via Supabase PostgREST API. Fixed by enabling RLS on all tables. Future collections created via `push-schema.ts` must include `ENABLE ROW LEVEL SECURITY`. |
| Portal to document.body | 1 | Medium — ENG-111. `createPortal(el, document.body)` throws `removeChild` TypeError on unmount. Always create an intermediate container `<div>` that React owns. See EAP-084. |
| CSS transform composition order | 1 | High — ENG-113. `transform: translate()` values get scaled when combined with CSS individual `scale` property. Use individual `translate` property instead. See EAP-085. |
| Per-frame collision in lerp loop | 1 | High — ENG-114. Variable-magnitude offsets from per-frame collision detection broke cursor-following lerp system. Never feed continuous avoidance offsets into a binary-flip lerp. See EAP-086. |
| Data source divergence between views | 1 | Medium — ENG-117. Prev/next nav used raw CMS order; home page applied `isVisibleOnHome` filter. Navigation sequences must derive from the same source of truth as the list they represent. |
| Content seeding route not called after edit | 1 | **Critical — ENG-149. Content seeding routes (`update-*`) are definitions, not deployments. Editing the file without calling the POST endpoint leaves the CMS database unchanged. Hard Guardrail #25 + Mid-Flight Check 3 added. See EAP-087.** |
| Integer ranking field scattered across per-row files | 1 | **High — ENG-168. The `order` integer for each case study lives in its own `update-*/route.ts`; new rows claim "the next free integer" and the existing rows are never re-ranked. Home case-study order drifted from CMS-migration sequence (Lacework at 1, Meteor at 3) for ~21 days until the user noticed. Fix requires N-file edit + N POST calls. Promoted EAP-105 (integer scaffolding values carried forward without re-ranking). Cross-category with CFB-038 / CAP-031. Detection: `rg 'order: \d+' 'src/app/(frontend)/api/update-'*'/route.ts'` whenever any seeding route is touched.** |
| Parallel content pipelines on a block-editor page | 2 | **High — ENG-118 (sections→blocks migration), ENG-154 (description→blocks migration). Legacy top-level content fields (`sections`, `description`) rendered outside `content[]` are invisible to the block editor's affordances (insert above/below, move, delete). Every user-editable paragraph on a block-editor page must live in `content[]`. See EAP-090.** |
| Dimension metadata dropped on `<Image fill>` data path | 1 | **High — ENG-161. Uploading an image into a placeholder-labeled image-group slot rendered invisible because `mapContentBlocks` in `work/[slug]/page.tsx` forwarded url/alt/caption/mimeType but dropped `media.width` / `media.height`. `MediaRenderer`'s wrapper only sets `aspect-ratio` when width+height are passed, so `<Image fill>` collapsed to height 0. Fixed by carrying width/height (prefer derived-size dimensions) through the server mapper and `ContentBlock` type into both `<MediaRenderer>` call sites in `ProjectClient.tsx`. The next/image `"height value of 0"` warning is a data-flow bug, not a CSS bug. See EAP-095.** |
| Sparse-array PATCH from `setNested` on indexed fieldPaths | 1 | **High — ENG-165. Inline-edit `saveFields` built PATCH bodies with `setNested({}, path, value)`, producing sparse arrays that JSON-serialize as leading `null`s. Payload rejects `null` block entries with a generic HTTP 500 ("Something went wrong"), which surfaces in the inline-edit toast as "Could not save — the server encountered an error." Flat fields (`title`, `category`) work fine because they never traverse arrays; the bug was latent until an editor hit ⌘S on any `content[*]`-nested field (caption, heading text). Fixed by branching on `hasArrayIndex(path)` and doing read–modify–write on the full document before PATCHing, then extracting only the touched top-level keys — the same pattern `useBlockManager.patchContent` already used. See EAP-101.** |
| React provider mounted in own return, hooks consumed in own body | 1 | **Critical — ENG-185. `ProjectClient` called `useBlockManager` (→ `useConfirm` / `useToast`) at the top of its function body, then mounted `<InlineEditProvider>` inside its returned JSX. Because hooks run during the parent's render phase before the returned subtree mounts, `useContext` resolved to `null` and `useConfirm` fell through to `NOOP_CONFIRM` which resolves `Promise<boolean>` to `false` — making every `confirmDeleteBlock` silently no-op across the empty-slot trash icon, filled-image delete overlay, block toolbar Delete, and `Cmd/Ctrl-Backspace`. ENG-180's "verification" claim was never walked through admin login; the regression surfaced on the user's first real editing session. Fix: split into `ProjectClient` (wrapper, mounts `InlineEditProvider`) and `ProjectClientBody` (body, calls the hooks). Promoted EAP-114 — any client component that calls `useBlockManager` / `useConfirm` / `useToast` / `useInlineEdit` must NEVER mount the corresponding provider in its own return; the provider is always supplied by a different component higher in the tree.** |
| Pre-shrunk CMS derivative used as `<Image fill>` source | 1 | **High — ENG-163. `mapContentBlocks` (both `imageGroup` and `hero` paths) and `extract-content-urls.ts` preferred Payload's `sizes.card` (768×512) / `sizes.hero` (1920) URL as the `src` for `<Image fill sizes="100vw">`. Next.js Image then upscaled that pre-shrunk source up to `w=3840`, producing 5× upscaling on Retina and the "blurry upload" user complaint. Fixed by passing `media.url` + original `media.width` / `media.height` so Next.js generates its own responsive ladder from the high-res original. `resolve-thumbnail-url.ts` (index-page card tiles, fixed 400×300) is intentionally left using the `thumbnail` derivative. See EAP-100. Distinct from EAP-095: EAP-095 = wrapper geometry; EAP-100 = source pixels.** |

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
