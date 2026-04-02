# Engineering Anti-Patterns

> **What this file is:** A catalog of engineering mistakes that caused incidents or wasted time, documented so they are never repeated. Each anti-pattern includes the trigger, why it's wrong, and the correct alternative.
>
> **Who reads this:** AI agents before making code changes — scan for relevant anti-patterns.
> **Who writes this:** AI agents when an incident reveals a new anti-pattern.
> **Last updated:** 2026-04-02 (EAP-042 ESCALATED: Flush-and-restart is now mandatory default, not fallback — 6+ violations. Previous soft protocol failed repeatedly.)

## Category Index

| Category | Entries | Status | Count |
|----------|---------|--------|-------|
| Cross-App Parity & Token Sync | EAP-001, EAP-004, EAP-005, EAP-007, EAP-028, EAP-041 | 6 active | 6 |
| Playground | EAP-006, EAP-037, EAP-038†, EAP-042, EAP-055 | 5 active | 5 |
| CMS / Payload Schema | EAP-015, EAP-019, EAP-021, EAP-026, EAP-030, EAP-033, EAP-034 | 6 active · 1 resolved | 7 |
| CMS / Inline Edit | EAP-016, EAP-023, EAP-029 | 3 active | 3 |
| Save Flow / Error Handling | EAP-017, EAP-018, EAP-020, EAP-024 | 4 active | 4 |
| Hydration / SSR / React State | EAP-013, EAP-014, EAP-022, EAP-054, EAP-056 | 5 active | 5 |
| Build / Toolchain / CSS | EAP-011, EAP-012, EAP-031, EAP-035, EAP-038‡, EAP-039, EAP-040 | 7 active | 7 |
| Documentation Process | EAP-008, EAP-010, EAP-027, EAP-032 | 4 active | 4 |
| Dev Workflow | EAP-002, EAP-003, EAP-009 | 3 active | 3 |
| Interaction / DOM | EAP-025, EAP-036, EAP-053 | 3 active | 3 |
| Deployment / CI Build | EAP-060 | 1 active | 1 |
| **Total** | | **47 active · 1 resolved** | **48** |

> † EAP-038 "One-Way Playground Experiment" · ‡ EAP-038 "SCSS Modules with `@use` Under Turbopack" — duplicate ID, two distinct entries.

---

## EAP-001: Manual Data Duplication Without Sync

**Status: ACTIVE**

**Trigger:** Defining the same data (colors, tokens, config) in multiple files and relying on manual discipline to keep them in sync.

**Why it's wrong:** Humans and AI agents forget. When `_colors.scss` was expanded with 90 new color values and 11 new semantic tokens, the playground's `tokens.ts` was not updated. The user saw nothing new in the playground UI. The data existed in the source of truth but was invisible in the consuming application. Manual duplication creates drift as a certainty, not a risk.

**Correct alternative:** Establish a codegen pipeline. The canonical data lives in one file; downstream files are generated from it. Run `npm run sync-tokens` after modifying `src/styles/tokens/_colors.scss`. The sync script reads SCSS and regenerates the color portion of `playground/src/lib/tokens.ts`.

**Incident:** ENG-001 (2026-03-29) — Playground token drift after Carbon palette expansion.

---

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

## EAP-006: Hardcoded Inline Font Overrides in Component Previews

**Status: ACTIVE**

**Trigger:** Using `style={{ fontFamily: "system-ui, -apple-system, sans-serif" }}` in component preview/demo code within the playground.

**Why it's wrong:** Inline styles have maximum CSS specificity. When the body correctly sets `font-family: var(--font-sans)` (which resolves to Geist), an inline `fontFamily` override on any element silently replaces Geist with system fonts. The component looks "fine" (text renders), but it's not using the design system font. This is especially insidious because: (a) it produces no error, (b) system-ui on macOS looks similar to Geist Sans, making the difference hard to spot visually, and (c) the fix appears to work at the layout level while individual components secretly override it.

**Correct alternative:** Remove all hardcoded `fontFamily` from inline styles. Let the body's Geist font cascade to all children. If a specific component needs a different font family, use Tailwind utility classes (`font-sans`, `font-mono`) which reference the design tokens. Never use `style={{ fontFamily }}` in the playground.

**Detection:** Run `grep -r "fontFamily" playground/src/ --include="*.tsx"` after any font-related change. There should be zero matches in component pages. The only acceptable location is the typography token page where `f.value` (a CSS variable reference) is used for font previews.

**Incident:** ENG-003 (2026-03-29) — 3rd complaint about Geist fonts not visible in playground.

---

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

## EAP-007: Adding Components to Main Site Without Playground Preview

**Status: ACTIVE**

**Trigger:** Creating a new reusable component in `src/components/` and integrating it into pages, but not creating a corresponding preview page in the playground (`playground/src/app/components/<slug>/page.tsx`) and not adding it to the sidebar navigation.

**Why it's wrong:** The playground is the design system documentation UI — it's where components are discovered, previewed, and understood. A component that exists in the main site but not the playground is invisible to anyone browsing the design system. It won't appear in search, won't have a code example, won't have a props table, and won't be verifiable in isolation. This is the component-level equivalent of EAP-005 (infrastructure parity).

**Correct alternative:** When creating any new component in `src/components/`:
1. Create a preview page at `playground/src/app/components/<kebab-name>/page.tsx` using the established pattern: `Shell` → `SectionHeading` → `ComponentPreview` (with interactive demo + code) → `PropsTable` → behavior notes → file path footnote.
2. Add the component to the appropriate category in `playground/src/components/sidebar.tsx` `componentCategories` array (this also makes it searchable via Fuse.js).
3. Add an entry to `archive/registry.json`.

**Detection:** After creating any component, verify: `ls playground/src/app/components/<name>/page.tsx` — if it doesn't exist, the component is not in the playground.

**Incident:** ENG-004 (2026-03-29) — ScrollSpy created in main site but missing from playground.

---

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

## EAP-015: Bare `src/` Paths in Payload Admin Config

**Status: ACTIVE**

**Trigger:** Specifying a Payload admin component path (e.g. `beforeLogin`, `afterLogin`, custom views) using a bare string like `'src/components/admin/Foo'`.

**Why it's wrong:** Payload copies the string verbatim into the generated `importMap.js` as an ES import specifier. Turbopack cannot resolve bare `src/...` paths — they're not relative, not aliased, and not in `node_modules`. This causes a `Module not found` build error that blocks both the admin panel and any SSR page touching the import map.

**Correct alternative:** Use the `@/` path alias: `'@/components/admin/Foo'`. The alias is defined in `tsconfig.json` and resolved by both TypeScript and the bundler.

**Incident:** ENG-019

---

## EAP-016: Conditional Rendering That Hides Inline-Editable Empty State

**Status: ACTIVE**

**Trigger:** Using `{cmsValue ? <EditableText>{cmsValue}</EditableText> : <p>hardcoded fallback</p>}` for an inline-editable field.

**Why it's wrong:** When the CMS field is empty (null, undefined, or empty string), the conditional renders the non-editable fallback. The user sees text on the page but can't edit it — the exact moment they need inline editing most (initial population) is the moment it's unavailable. This creates a chicken-and-egg problem: you can't populate the field because the editable component only appears when the field is already populated.

**Correct alternative:** Always render the EditableText component, passing the CMS value or a placeholder string as children: `<EditableText ...>{cmsValue || "Placeholder text"}</EditableText>`. The placeholder is displayed when empty and replaced on first edit.

**Incident:** ENG-028 — bio paragraph on home page was not editable because CMS bio was empty.

---

## EAP-017: Panel "Done" That Only Stages Without Saving

**Status: ACTIVE**

**Trigger:** A modal/panel edit UI has a "Done" or "Close" button that writes changes to local state only, requiring a separate "Save" action elsewhere on the page to actually persist to the backend.

**Why it's wrong:** Users universally expect the primary action button on a panel to complete the operation. A two-step stage-then-save workflow is a dark pattern that guarantees data loss: the user thinks they've saved, navigates away, and their changes vanish. The bottom save bar may be hidden behind the modal or go unnoticed.

**Correct alternative:** Panel action buttons must persist changes directly to the backend. If a global save bar exists for single-field edits (like `contentEditable` text), array panels should bypass it and call the save API directly when the user clicks "Save & Close". Use `flushSync` to ensure React state is current before the API call.

**Incident:** ENG-030 — EditableArray "Done" button staged data but never saved; user lost Teams edits.

---

## EAP-018: React `useCallback` Save That Reads Stale `dirtyFields` Closure

**Status: ACTIVE**

**Trigger:** A `save()` function created with `useCallback(..., [dirtyFields])` that reads `dirtyFields` from its closure, called immediately after a `setFieldValue()` that queues a state update.

**Why it's wrong:** React 18+ batches state updates. `setFieldValue()` queues a `setDirtyFields(prev => ...)` update but doesn't apply it synchronously. The `save()` callback still sees the OLD `dirtyFields` from the previous render. It saves zero changes and succeeds silently. This is especially insidious because there's no error — the save just does nothing.

**Correct alternative:** Maintain a `dirtyRef = useRef(dirtyFields)` that is updated synchronously inside the state setter: `setDirtyFields(prev => { ...; dirtyRef.current = next; return next })`. The `save()` function reads from `dirtyRef.current`, which always has the latest value regardless of React's batching schedule. This makes `save()` callable immediately after `setFieldValue()`.

**Incident:** ENG-030 — `save()` silently saved zero changes because `dirtyFields` closure was stale.

---

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

## EAP-020: Raw API Response Bodies as User-Facing Error Messages

**Status: ACTIVE**

**Trigger:** Throwing `new Error(\`Failed: ${response.status} — ${await response.text()}\`)` and displaying the result directly in the UI.

**Why it's wrong:** The raw response body from Payload (or any API) is a structured JSON object with internal field paths, validation error arrays, and technical terminology. Users see gibberish. The error message is designed for server logs, not for the person trying to save their work. This violates the separation between internal diagnostics and user-facing communication.

**Correct pattern:** Parse the structured error response, extract the user-relevant parts (which field, what's wrong), translate internal names to UI-visible labels, and assemble a natural-language sentence. Keep the raw response available in console logs for debugging, but never surface it in the UI.

**Example:**
- Bad: `Failed to update global:site-config: 400 — {"errors":[{"name":"ValidationError","data":{"errors":[{"label":"Links > Social Links 1 > Href","message":"This field is required"}]}}]}`
- Good: `Could not save — Social Link 1 → URL is required.`

---

## EAP-021: Over-Zealous Required Constraints That Block Partial Saves

**Status: ACTIVE**

**Trigger:** Marking CMS fields as `required: true` based on data completeness ideals rather than user flow requirements.

**Why it's wrong:** A required field that blocks saving forces the user to complete the entire form in one session. This prevents partial progress — users can't save a placeholder item (e.g. a link with a label but no URL yet) and come back later. The "required" constraint should reflect whether the system genuinely cannot function without the value, not whether the value is "nice to have." For a link, a missing URL means the link isn't clickable yet — but the label is still meaningful as a placeholder.

**Correct pattern:** Only mark a field as `required` if the item is meaningless without it (e.g. a link without a label has no identity). All other fields should be optional at the schema level. Use client-side UI cues (asterisks, inline hints) to indicate which fields are recommended, without preventing saves.

**Example:**
- Bad: `socialLinks[].href` is `required: true` → user can't save "Resume" as a link placeholder
- Good: `socialLinks[].label` is `required: true` (a link needs a name), `href` is optional (URL can be added later)

---

## EAP-022: Index-as-Key on Draggable Lists Breaks Re-Grab

**Status: ACTIVE**

**Trigger:** Using `key={index}` in `Array.map()` for a drag-and-drop reorderable list.

**Why it's wrong:** When items are reordered, React reconciles by key. With `key={index}`, keys never change (0, 1, 2, …) so React reuses the same physical DOM nodes — it updates their props/content rather than creating new elements. The browser retains drag state on the physical DOM node that just completed a drag operation. On the next drag attempt, that node's stale browser drag state prevents `dragstart` from initiating properly. The drag handle appears visually correct but is non-functional for any item that changed position.

**Correct alternative:** Maintain a parallel `itemKeys` state array of stable, unique string IDs (e.g. `fieldId-item-${Date.now()}-${i}`). Initialize keys when the list opens, and keep them in sync with every mutation: reorder the keys array in `reorderItem`, filter it in `deleteItem`, extend it in `addItem`. Use `key={stableKey}` in the render so React creates a fresh DOM node at each position after a reorder.

**Incident:** ENG-036 (2026-03-29) — Drag handle non-functional after first reorder in EditableArray panel.

---

## EAP-023: Payload `type: 'email'` with contentEditable Inline Editing

**Status: ACTIVE**

**Trigger:** Using Payload's `type: 'email'` field type for a value that is edited inline via `contentEditable`.

**Why it's wrong:** `contentEditable` captures `textContent` from the DOM, which may include trailing whitespace, zero-width spaces, or browser-injected invisible characters. Payload's built-in `email` validator is strict and rejects these. The save silently fails (or shows an error the user doesn't understand), making it appear that inline editing "doesn't work" for email fields.

**Correct alternative:** Use `type: 'text'` with a custom `validate` function that trims whitespace before validation and uses a permissive email regex. Also add `.trim()` to the value captured from `contentEditable` before passing it to the dirty state.

**Incident:** ENG-037 (2026-03-29) — Footer email save appeared to silently fail.

---

## EAP-024: Error-Swallowing Save Functions

**Status: ACTIVE**

**Trigger:** A `save()` function that catches all errors internally (setting error state) without re-throwing, while callers `await save()` expecting to detect failure.

**Why it's wrong:** Callers like `EditableArray.commitPanel()` use `try/catch` or conditional logic after `await save()` to decide what to do next (e.g., close the panel on success, keep it open on failure). If `save()` catches internally and never re-throws, it always resolves successfully from the caller's perspective. The caller closes the panel, the user thinks the save worked, but it didn't. This is a silent data loss pattern.

**Correct alternative:** `save()` should both set error state (for reactive UI like error bars) AND re-throw the error (for imperative callers). Callers that don't need failure handling (like keyboard shortcuts) should add `.catch(() => {})`.

**Incident:** ENG-038 (2026-03-29) — EditableArray panel closed even when save failed.

## EAP-025: Nested Anchor Elements

**Status: ACTIVE**

**Trigger:** Wrapping one `<a>` element inside another `<a>` element — e.g. a card link containing a secondary action link.

**Why it's wrong:** Nested `<a>` tags are invalid HTML per the spec. Browsers "flatten" the nesting by closing the outer `<a>` before the inner one, creating unpredictable click targets. The result is that clicks on the card do nothing, or navigate to the wrong destination. There are no console errors — the failure is completely silent.

**Correct alternative:** Use a `<div role="button">` with `onClick` + `onKeyDown` for the outer container, and a single `<a>` for the inner link. Use `e.stopPropagation()` on the inner link to prevent the card's click handler from firing.

**Incident:** ENG-044 — DashboardPages card `<a>` wrapping pencil `<a>` caused clicks to silently fail.

---

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

---

## EAP-028: Partial Cross-App Sync on Shared Components

**Status: ACTIVE**

**Trigger:** Modifying a component that exists in both `src/components/` and `playground/src/components/` (or its demo page) but only updating one version and not the other.

**Why it's wrong:** The playground is the design system's public documentation surface. When the playground shows outdated behavior or visuals, it teaches consumers the wrong patterns. Worse, when two versions of the same component diverge over multiple sessions, the drift compounds: each version accumulates fixes the other lacks, making reconciliation increasingly expensive. In this case, the main site had outdated behavior (linear interpolation, no dead zone) while the playground had outdated visuals (no label differentiation, AP-031 centering bug) — neither was the "correct" version.

**Correct alternative:** Every change to a shared component must be applied to ALL codebases atomically in the same session. The Cross-App Parity Checklist covers creation but should be extended to cover modification: "Did I change `src/components/X`? → Check `playground/src/components/X` and `playground/src/app/components/X/page.tsx`." The demo page (`page.tsx`) is a third sync target that is easy to forget.

**Incident:** ENG-042 (2026-03-30) — ScrollSpy had 6 discrepancies across 3 codebases after 2 sessions of partial updates.

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

## EAP-033: Schema Type Change Without Immediate Server Restart

**Status: ACTIVE**

**Trigger:** Changing a Payload field type (e.g. `textarea` → `richText`) in the collection schema file without immediately restarting the dev server before the user can interact with the changed field.

**Why it's wrong:** Payload syncs the database schema only at startup. Between the code change and the restart, the old schema is still active. If the inline edit system saves data in the new format (e.g. Lexical JSON for richText), Payload stores it according to the old field type (e.g. serializes the object to a string for textarea). This creates corrupted data — a JSON object stored as a string — that breaks all downstream consumers expecting either a plain string or a parsed object.

**Correct alternative:** When changing a field's type in a Payload collection or global schema, immediately restart the dev server as part of the same operation. Never defer the restart to the user. The restart is not optional — it's part of the atomic schema change. Additionally, add `ensureParsed()` guards to any function processing CMS data with early `typeof === 'string'` returns, as defensive programming against this exact migration window.

**Incident:** ENG-058 (2026-03-30) — Testimonial `text` changed from textarea to richText. User saved formatted text before restart. Raw Lexical JSON displayed in card.

---

## EAP-034: S3-Compatible Storage Without Filename Sanitization — RESOLVED

**Status: RESOLVED** — `beforeChange` hook added to all upload collections to sanitize filenames (strip brackets, replace special chars, collapse hyphens) before S3 upload. See ENG-060.

---

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

## EAP-036: Scroll Hijack on Embedded Canvas via onWheel Handler

**Status: ACTIVE**

**Trigger:** Adding an `onWheel` handler to an embedded canvas/viewport element that pans the canvas on bare wheel (non-modifier-key) scroll events.

**Why it's wrong:** When a user scrolls through a page and their cursor passes over an embedded canvas, the wheel events get intercepted by the canvas handler. The page stops scrolling (or scroll becomes erratic as both page and canvas respond). This is a scroll hijack — the user's intent is to scroll the page, not to pan an embedded widget. Infinite canvases (Figma, Miro, Google Maps) occupy the full viewport — they OWN the scroll. Embedded canvases inside scrollable pages must defer to the page's scroll.

**Correct alternative:** Embedded canvases should pan via drag only (pointer down + move). Zoom should be via explicit controls (buttons, keyboard shortcuts). `onWheel` should be removed entirely. Set `touch-action: pan-y` on the canvas viewport to allow vertical scroll passthrough on touch devices. Reserve `onWheel` + `e.preventDefault()` for full-page canvas apps where the canvas IS the page.

**Incident:** ENG-072 — Architecture DAG in case study intercepted page scroll with `onWheel` pan handler.

---

## EAP-038: One-Way Playground Experiment

**Status: ACTIVE**

**Trigger:** A design experiment (button API, spacing tokens, typography mixins) is conducted in the playground without propagating the results to production, or vice versa.

**Why it's wrong:** The playground and production are two independent Next.js apps with manually synchronized code. When a component or token is updated in one app without updating the other, they silently drift. The drift compounds across sessions — by the time it's noticed, the gap requires a full audit and multi-phase migration instead of a simple same-session update. Three separate experiments (Button two-axis model, three-tier spacing tokens, semantic typography mixins) all fell into this trap in March 2026, each requiring significant rework to reconcile.

**Correct alternative:** Every playground experiment that changes a component's API, visual behavior, or token usage MUST be propagated to the corresponding production component in the same session. The Cross-App Parity Checklist in AGENTS.md is bidirectional — it includes playground→production rows. Before ending a session that touched playground Demo* components, run the parity checklist.

**Incident:** ENG-073 — Three playground experiments (Button, Spacing, Typography) conducted across multiple sessions were never propagated to production, requiring a 6-phase alignment plan.

---

## EAP-055: Hardcoded Pixels/Hex in Playground Tailwind When Token CSS Vars Exist

**Status: ACTIVE**

**Trigger:** Building a playground Demo* component using Tailwind arbitrary values with raw pixel or hex values (e.g., `h-[48px]`, `bg-[#161616]`, `bg-emerald-600`) when the corresponding design system CSS custom properties exist or could be trivially added.

**Why it's wrong:** The playground's purpose is to demonstrate the design system — a demo component that bypasses the token layer defeats that purpose. Hardcoded values silently diverge from token source-of-truth if tokens change. They also lose dark-mode adaptivity and make the playground useless as a visual regression tool. Tailwind's default palette colors (emerald, red) are NOT the design system — they have different hue/saturation than the Carbon-sourced palette.

**Correct alternative:** Before building a Demo* component, verify that all needed tokens are exposed as CSS custom properties in `playground/src/app/globals.css`. If a token exists in SCSS but not as a CSS var, add it. Then use `var()` references: `h-[var(--spacer-6x)]` not `h-[48px]`, `bg-[var(--palette-green-60)]` not `bg-emerald-600`. For theme-adaptive states, create semantic CSS vars with `.dark` overrides.

**Incident:** ENG-074 — DemoButton rebuilt with hardcoded pixels and Tailwind default colors instead of token references, requiring full re-tokenization of sizing (20 values), colors (28 values), motion (2 values), and overlay states (8 values).

---

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

## EAP-038: SCSS Modules with `@use` Imports Under Turbopack

**Status: ACTIVE**

**Trigger:** Creating a `.module.scss` file that uses `@use` to import SCSS mixins/tokens via `sassOptions.loadPaths`, then importing it in a `'use client'` component.

**Why it's wrong:** Turbopack (Next.js 16.x dev mode) compiles SCSS modules separately for server-side rendering and client-side rendering. When the SCSS file depends on `sassOptions.loadPaths` for `@use` resolution, the two compilations can produce different CSS module class name mappings, causing a hydration mismatch. The server HTML receives one set of class names while the client JS expects another.

**Correct alternative:** Use plain `.module.css` files with CSS custom properties (`var(--token-name)`) instead of SCSS `@use`/`@include` mixins. CSS custom properties defined in `globals.css` are available everywhere without build-time path resolution. Reserve `.scss` files for non-module use cases (global styles, `@layer` blocks) where server/client parity is not required.

**Incident:** ENG-081 (2026-04-01) — Playground sidebar section labels hydration mismatch.

---

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

## EAP-040: Using SCSS Primitives Where Semantic Tokens Exist

**Trigger:** Writing `$portfolio-neutral-20` (a primitive) for a border instead of `var(--portfolio-border-subtle)` (a semantic token), or using `$portfolio-neutral-00` for a surface instead of `var(--portfolio-surface-primary)`.

**Why it's wrong:** Primitives don't swap in dark mode. Semantic CSS custom properties do. Using a primitive where a semantic token exists defeats the theme architecture. The component will display light-mode colors in dark mode.

**Correct alternative:** Use `var(--portfolio-*)` semantic CSS custom properties for all theme-aware values. Only use SCSS primitives when: (a) inside `rgba()`/`darken()`/other compile-time functions, (b) intentionally building an always-dark/always-light surface, or (c) using specific color tints without a semantic equivalent (document the exception in the component).

**Incident:** ENG-083 — full codebase migration from SCSS vars to CSS custom properties.

---

## EAP-041: Manually Duplicating Design System Token Variables in Consumer Apps

**Trigger:** Creating a separate set of CSS custom properties (e.g., `--ds-*`, `--palette-*`) in a consumer app's stylesheet that mirrors the design system's source tokens, instead of importing from the single source.

**Why it's wrong:** Duplicated variable definitions drift silently from the source. When the source changes namespace (e.g., `--ds-*` → `--portfolio-*`), output format, or adds new tokens, the consumer's copy becomes stale. Components start resolving to empty values without any build error, making the failure invisible until visual regression is noticed. The duplication also means dark mode overrides must be maintained in two places — they inevitably diverge.

**Correct alternative:** Consumer apps import the design system's compiled CSS custom properties from the single source. In a monorepo, this means an SCSS file that `@use`s the source `_custom-properties.scss` (leveraging `sassOptions.loadPaths`). For external consumers, this means `@import '@yilangaodesign/design-system/css/tokens'`. No consumer should define `--portfolio-*` variables — they come from one place.

**Incident:** ENG-084 — playground's manually-duplicated `--ds-*`/`--palette-*` variables broke after SCSS→CSS custom property migration changed all components to `var(--portfolio-*)`.

---

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

## EAP-057: Placeholder `href="#"` on Static Component Demos

**Trigger:** Playground or docs pages render link-styled components with `href="#"` (or `href=""`) so "something is focusable," but the demo must not navigate.

**Why it's wrong:** `href="#"` triggers fragment navigation on the current URL. Browsers scroll to the top (or toggle history), which feels like a broken interaction and confuses users reviewing visual-only previews.

**Instead:** Omit `href` when the component supports button mode (e.g. `NavItem` → `<button type="button">`) — **but only after verifying the component's SCSS fully resets `<button>` UA defaults** (font, padding, text-align, line-height). If the SCSS does not normalize `<a>` vs `<button>`, removing `href` will cause visible layout breakage because browser default button styles interfere with the component's flex layout. **Keep `href="#"` with `onClick={(e) => e.preventDefault()}` as the safe fallback** until the component's SCSS is updated to include button resets.

**Incident:** ENG-088 (2026-04-01), ENG-089 (2026-04-02) — `playground/src/app/components/nav-item/page.tsx`. ENG-089: bulk `href` removal broke NavItem icon-label spacing across all playground sections. Reverted.

---

## EAP-058: Embedding Fixed-Position Layout Components in Preview Containers

**Trigger:** Creating a playground demo page that renders a full-page layout component (`position: fixed`, `createPortal(document.body)`) inside a bounded preview `<div>`.

**Why it's wrong:** `position: fixed` escapes all ancestor containers — CSS `overflow: hidden` and inline style overrides don't contain it. `createPortal(document.body)` renders DOM nodes at the body level regardless of the React tree structure. The result: the layout component's panels (sidebars, slivers, backdrops) cover the real page, including the playground shell's own navigation. Inline style hacks (`style={{ position: "relative" }}`) lose to SCSS module specificity.

**Correct alternative:** For full-page layout components (VerticalNav, AppShell, etc.): (1) demonstrate embeddable subcomponents individually (section dividers, group headers, nav items), (2) show the full composition API via code examples only, (3) point users to the layout component's actual usage (e.g., "this playground's sidebar IS the live demo"). Never instantiate the layout root component inside a `ComponentPreview`.

**Incident:** ENG-092 (2026-04-02) — `playground/src/app/components/vertical-nav/page.tsx`. `MiniSidebarDemo` embedded `VerticalNav` + `SliverPortal` inside a 400px div. Sliver portaled to body at `position: fixed; top: 0; left: 200px; height: 100vh`, covering the entire playground shell sidebar.

---

## EAP-058: Assuming spacer-NNx exists without utility- prefix

**Trigger:** Writing `$portfolio-spacer-0-75x` or other sub-grid spacer values without the `utility-` prefix.

**Why it's wrong:** Sub-grid spacer tokens (those not on the 8px base grid) use a `utility-` prefix: `$portfolio-spacer-utility-0-75x`, `$portfolio-spacer-utility-1-25x`, etc. The non-utility shorthand does not exist and causes SCSS compilation failure.

**Correct alternative:** Always check the spacer token file or use the `utility-` prefix for non-grid-aligned values (0.75x, 0.875x, 1.25x, 1.75x, 2.25x, etc.).

**Incident:** ENG-095 (2026-04-02) — 20 instances of `$portfolio-spacer-0-75x` caused build failure.

---

## EAP-059: Using SCSS variables in Payload admin SCSS files

**Trigger:** Bulk-replacing CSS values with `$portfolio-*` SCSS variables in files under `src/components/admin/`.

**Why it's wrong:** Payload admin SCSS files don't `@use` the DS styles barrel. They use Payload's `--theme-*` CSS custom properties. Injecting an SCSS variable without the `@use` import causes an "undefined variable" compilation error.

**Correct alternative:** In admin-scoped SCSS files, use CSS custom properties (`var(--portfolio-*)`) instead of SCSS variables.

**Incident:** ENG-095 (2026-04-02) — `NavPages.module.scss` build failure from `$portfolio-type-2xs` without import.

---

## EAP-060: Gitignored Files That the Build Depends On

**Trigger:** A framework or tool generates a file locally during development (e.g., Payload's `importMap.js`), and that file is in `.gitignore`. The local build works because the file exists, but CI/CD (Vercel) fails because the clean checkout doesn't have it.

**Why it's wrong:** CI builds from a clean git checkout. If a file isn't committed, it doesn't exist in CI — regardless of whether it exists on your machine. The local dev environment masks this failure because the file persists across runs.

**Correct alternative:** If a build-time dependency is generated by a framework, it must be committed to the repo. Remove it from `.gitignore`. If the file changes frequently (and you're worried about noise), add a `prebuild` script that regenerates it — but the file must still be committed as a baseline.

**Verification:** Run `next build` in a clean checkout (or `git stash --include-untracked && next build && git stash pop`) to catch missing files before they break CI.

**Incident:** ENG-096 (2026-04-02) — Payload's `importMap.js` was gitignored, causing three `Module not found` errors on first Vercel deploy. Also: `resend` was dynamically imported but not in `package.json` — Turbopack resolves all imports at build time.

---

## EAP-NNN: [Short Name]

**Trigger:** [What action or pattern triggers this]

**Why it's wrong:** [The technical and process reason]

**Correct alternative:** [What to do instead]

**Incident:** [Optional — reference to ENG-NNN]
```
