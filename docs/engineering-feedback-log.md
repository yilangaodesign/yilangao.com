# Engineering Feedback Log

> **What this file is:** Chronological record of recent engineering incidents and feedback sessions (last 30 entries). Newest entries first.
>
> **Who reads this:** AI agents at session start (scan recent entries for context), and during incident response (check for recurring patterns).
> **Who writes this:** AI agents after each incident resolution via the `engineering-iteration` skill.
> **Last updated:** 2026-04-02 (ENG-096: Vercel build failures on first production deploy of main site)
>
> **For agent skills:** Read only the first 30 lines of this file (most recent entries) for pattern detection.
> **Older entries:** Synthesized in `docs/engineering-feedback-synthesis.md`. Raw archive in `docs/engineering-feedback-log-archive.md`.

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
