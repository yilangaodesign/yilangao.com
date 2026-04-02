# Engineering Feedback Synthesis — Archived Lessons

> Distilled from 55 archived feedback entries (ENG-001 through ENG-055, plus renumbered duplicates from session-scoped numbering).
> Raw entries preserved in `docs/engineering-feedback-log.md` (lines 580+).
> Read this file when you need historical context beyond the active 30 entries.
> Last synthesized: 2026-04-01

---

## Theme 1: Cross-App Parity — Token Drift and Infrastructure Divergence

**Core lesson:** When the same data (tokens, fonts, components) exists in multiple apps, drift is inevitable without automated sync and enforcement. Manual discipline fails because the connection between files is invisible. The fix is always the same three-step escalation: (1) create a sync script, (2) document the checklist, (3) promote to a hard guardrail when violations recur 3+ times.

**Key entries:** ENG-001, ENG-002, ENG-003, ENG-004, ENG-005, ENG-040, ENG-042 (DS compliance audit)

**Escalation timeline:**
- ENG-001: Token drift discovered → created `sync-tokens.mjs`, documented in engineering.md §3
- ENG-002: Font infrastructure gap (playground missing Geist) → documented cross-app parity principle §6
- ENG-003: Font override recurrence (3rd complaint, inline `fontFamily` overrides in 5 files) → codebase-wide audit, EAP-006
- ENG-004: ScrollSpy missing from playground → expanded §6 checklist to include component previews
- ENG-005: User identified enforcement gap → **promoted to Hard Guardrail #8 in AGENTS.md**
- ENG-040: ScrollSpy DS migration required `transpilePackages` + export path updates — new infrastructure category for upstream-first workflow
- ENG-042 (audit): Brand color drift (`#6c63ff` vs `$portfolio-accent-60`), raw px values → tokens must be retroactively applied to existing consumers

**Not covered by recent entries:** The original token sync script creation story (ENG-001) — how the three-file duplication problem (SCSS → TS → CSS) was discovered and the `sync-tokens.mjs` codegen solution. Recent entries assume the sync infrastructure exists. Also, the ENG-040 `transpilePackages` requirement for consuming source-level (TSX + SCSS module) imports from `node_modules` is a one-time infrastructure decision that newer entries don't re-teach.

---

## Theme 2: CMS Inline Editing — A 27-Entry Feature Arc

**Core lesson:** Building a full inline editing system on top of Payload CMS is a compound engineering problem that spans field-level text editing, array CRUD, collection-level CRUD, save flow reliability, error handling, validation UX, layout mechanics, and data flow parity. The deepest recurring lesson: **every panel "Done" or "Save" button must actually persist to the backend in a single click** — local staging areas that require a second hidden action are guaranteed to cause silent data loss.

**Key entries:** ENG-027 through ENG-039, ENG-041, ENG-048 through ENG-055

**Sub-themes and critical patterns:**

1. **Save flow reliability (ENG-030, ENG-038):** React `save()` callbacks that need the latest state must read from a `ref`, not from closure-captured state. `setFieldValue → save()` in the same event loop sees stale data due to React batching. The `flushSync` + `dirtyRef.current` pattern is the canonical fix. Additionally, `save()` must re-throw errors — swallowing them internally creates silent data loss (ENG-038).

2. **Schema-server restart coupling (ENG-030, ENG-035):** Payload pushes schema changes on startup only. Adding a field to a collection/global without restarting the dev server means the column doesn't exist in Postgres. This caused the same failure three times before Hard Guardrail #15 was established. The schema change and server restart must be treated as atomic.

3. **Conditional rendering vs. empty state (ENG-028):** Inline-editable fields must never hide the editable component when the CMS value is empty — the empty state is exactly when the user needs to populate it. The pattern `{value ? <EditableText> : <p>fallback</p>}` is always wrong for editable fields.

4. **Panel layout mechanics (ENG-032, ENG-034):** Flex column panels need `min-height` on the container and `flex: 1 1 0` on the body. Without `min-height`, the body collapses to zero. Header/footer must be `flex-shrink: 0` with only the body scrolling.

5. **Form field identification (ENG-029):** Editing UIs must always have persistent visible labels. Placeholders alone are insufficient because they disappear when a value is present.

6. **Drag-and-drop React keys (ENG-036):** `key={index}` on draggable elements causes re-grab failures after reorder. React reuses physical DOM nodes, and the browser retains stale drag state on those nodes. Stable string keys (traveling with items through reorders) are mandatory for DnD lists.

7. **Lexical richText handling (ENG-025):** Payload's `richText` field stores Lexical JSON (an object), not strings. Any `typeof === "string"` guard silently drops real CMS content. Proper deserializers (`extractLexicalText`, `lexicalToHtml`) are required.

8. **Email field validation (ENG-037):** Payload's `type: 'email'` with `contentEditable` is fragile — trailing whitespace from browser editing fails strict validation. Use `type: 'text'` + custom validation + `.trim()`.

9. **Collection-level CRUD (ENG-051):** The inline edit system needs three tiers of mutation: field-level (`EditableText`), array-level (`EditableArray`), and collection-level (`DeleteItemButton`, `AddItemCard`). Each tier was added incrementally in response to user feedback.

10. **File upload integration (ENG-054, ENG-055):** Inline editing must cover ALL CMS fields, not just visible text. Attributes like URLs need popovers; file uploads need the `uploadMedia → relationship update → refresh` pattern.

**Not covered by recent entries:** The save-flow `flushSync + dirtyRef` pattern (ENG-030), the index-as-key drag bug (ENG-036), the Lexical richText deserialization architecture (ENG-025), and the email field `type: 'text'` workaround (ENG-037) are foundational implementation decisions that newer entries don't revisit. The entire ENG-027→039 arc documents the iterative discovery of what a production inline editing system requires — this knowledge is not available elsewhere in the docs.

---

## Theme 3: Documentation Procedure Skips — The Most Violated Guardrail

**Core lesson:** The agent's natural execution loop is `fix → verify → respond`. Documentation is a post-response afterthought that gets dropped when context-switching to the user's next question. The only fix that worked was promoting documentation to a **pre-condition** of the response (Hard Guardrail #1), and later adding an enforcement mechanism (EAP-027) that requires creating the feedback log stub **before** writing the fix.

**Key entries:** ENG-008, ENG-012, ENG-044, ENG-045, ENG-046, ENG-053

**Escalation timeline:**
- ENG-008: First documentation skip flagged by user → documented EAP-010
- ENG-012: 3rd occurrence → **promoted to Hard Guardrail #1** ("NEVER respond without FIRST completing documentation")
- ENG-044/045/046: Three consecutive fixes in one session, all undocumented → EAP-027 ("create stub before fix")
- ENG-053: Storage architecture added without engineering.md update → 7th occurrence

**Not covered by recent entries:** The meta-lesson that documentation skips recur even after being promoted to the #1 guardrail. The EAP-027 enforcement mechanism (stub-first workflow) was the innovation that finally made documentation happen reliably. This behavioral pattern — urgency overriding process even for non-urgent work — is a persistent agent failure mode worth remembering.

---

## Theme 4: Hydration Mismatches — The React 19 / Turbopack Trap

**Core lesson:** React 19 hydration is strict. Three patterns cause mismatches: (1) `<script>` elements in client component trees (no wrapper or strategy avoids the warning), (2) branching on `typeof window` or any client-only value in rendered output, (3) Turbopack cache serving stale compiled chunks that diverge from current source. The universal fix for client-only values is the `useState(false) + useEffect(() => setMounted(true))` deferred-mount pattern.

**Key entries:** ENG-017, ENG-018, ENG-019, ENG-024, ENG-045, ENG-055

**Sub-patterns:**

1. **React 19 script tags (ENG-017→018→019):** Three consecutive failed fixes. `next-themes` → custom provider + `<head>` script via `dangerouslySetInnerHTML` → `next/script beforeInteractive` → **remove the script entirely**. The only solution: accept a one-frame theme flash and use `<html suppressHydrationWarning>`.

2. **Admin conditional branching (ENG-055):** `canEdit = isAdmin && id` evaluates differently on server vs client (cookie timing, context resolution). The mounted-state pattern gates admin features: server and client both render non-admin initially, then admin features activate post-mount.

3. **Nested anchors (ENG-024):** `<a>` inside `<a>` is invalid HTML. Browser "flattens" nesting, making clicks ambiguous. Components rendered inside `<Link>` must use `<button>` with JS navigation.

4. **HMR-only cache divergence (ENG-045):** HMR updates client bundle but not server cache for SSR'd admin components. After changing DOM structure of SSR'd components, always `rm -rf .next && restart`.

**Not covered by recent entries:** The three-attempt script tag chain (ENG-017→018→019) is a valuable cautionary tale about iterative fixes that each introduce a new variation of the same problem. Recent entries reference EAP-013/014 but don't retell the discovery story. The nested anchor pattern (ENG-024) and the `<button>` + JS navigation workaround are also not revisited.

---

## Theme 5: Admin IA and Discoverability

**Core lesson:** The Payload admin dashboard is the only reliable entry point for admin workflows. Sidebar-only navigation fails because: (a) the sidebar starts collapsed, hiding new sections, and (b) users don't form mental models of sidebar structure. Three iterations (ENG-042→043→046) were needed to discover that the dashboard — visible by default — is where primary workflows must live. The auto-login cookie gap (ENG-046) masked the entire inline editing system in dev mode.

**Key entries:** ENG-042, ENG-043, ENG-044, ENG-046

**Key patterns:**
- ENG-042: Sidebar IA redesign — organized collections by page, not data type; renamed misleading labels
- ENG-043: Created `DashboardPages` as `beforeDashboard` component — the "front door" pattern
- ENG-044: Nested `<a>` tags broke tile click navigation silently
- ENG-046: `isAdminAuthenticated()` checked for a cookie that `autoLogin` never sets — server-level auth vs browser-level auth disconnect

**Not covered by recent entries:** The dashboard-as-front-door principle and the `DashboardPages` beforeDashboard pattern are foundational IA decisions not revisited by newer entries. The auto-login cookie gap (ENG-046) is a one-time Payload configuration lesson that remains relevant for any dev environment reset.

---

## Theme 6: Turbopack Cache Corruption

**Core lesson:** Turbopack's incremental cache in `.next/` can become corrupted after rapid schema restarts, long-running sessions, or component removals. Symptoms include: runtime TypeErrors on correct source code, phantom route conflicts, stale compiled chunks causing hydration mismatches. The universal diagnostic: **if runtime behavior contradicts source code, clear `.next/` before investigating code-level causes.**

**Key entries:** ENG-007, ENG-045, ENG-047

**Not covered by recent entries:** Recent entries (ENG-056, ENG-067, ENG-085) continue to encounter Turbopack cache issues, so this theme is well-covered by active entries. However, the original ENG-007 — where `next.config.ts` Node.js built-in imports (`path`, `fileURLToPath`) caused an ESM/CJS scope mismatch in `next.config.compiled.js` — is a unique Next.js 16 configuration pitfall not repeated in recent entries.

---

## Theme 7: Verification Gap — curl ≠ Browser Check

**Core lesson:** HTTP 200 from `curl` does not mean the page works. React 19 console warnings, hydration mismatches, and runtime errors only appear in the browser's JavaScript console. The agent's verification step must include browser-level checks, not just server-level status codes. This was escalated to Hard Guardrail #10 after three consecutive user-reported errors that should have been self-caught.

**Key entries:** ENG-017, ENG-018, ENG-019, ENG-020

**Not covered by recent entries:** The principle is now embedded in guardrails and recent entries follow it, but the original escalation story (three user-reported errors in sequence, each time the agent said "fixed") is worth remembering as motivation for why the guardrail exists.

---

## Theme 8: Payload CMS Configuration and Onboarding

**Core lesson:** Payload v3 embedded in Next.js has specific configuration requirements that are not obvious from documentation: Supabase connection must use Transaction Pooler (IPv6 issues with direct connection); `autoLogin` authenticates at server level without setting browser cookies; `generate:importmap` fails on Node.js 25 (use Node 22 LTS); admin component paths must use `@/` alias, not bare `src/` paths; token expiration defaults to 2 hours (extend to 30 days for dev); richText fields store Lexical JSON objects, not strings.

**Key entries:** ENG-013, ENG-015, ENG-019 (importMap path), ENG-021, ENG-022, ENG-025, ENG-026

**Not covered by recent entries:** These are all foundational setup decisions from the initial CMS integration session. None are revisited by recent entries because the configuration has been stable. However, if the Payload version is upgraded, the Node.js version changes, or the database is reconnected, all of these lessons become immediately relevant again. Particularly:
- ENG-013: Supabase Transaction Pooler vs Direct connection (IPv6/IPv4)
- ENG-015: Node.js 25 breaks `payload generate:importmap` (use Node 22 with temporary `"type": "module"`)
- ENG-025: Lexical richText deserializer architecture (`extractLexicalText`, `makeLexicalParagraph`)
- ENG-026: `autoLogin` + `beforeLogin` MutationObserver for browser autocomplete

---

## Theme 9: CMS-Frontend Data Parity

**Core lesson:** The CMS data stack has three (now four) layers that must stay in sync: (1) Payload schema, (2) data fetch layer, (3) frontend UI types + rendering, (4) inline edit wiring. A field that exists in one layer but not all four is a bug. This was discovered through 5+ incidents of silent data drift before being codified as the CMS-Frontend Parity Checklist (ENG-031) and Hard Guardrails #14 and #15.

**Key entries:** ENG-028, ENG-030, ENG-031, ENG-035, ENG-039, ENG-049, ENG-050

**Critical sub-patterns:**
- ENG-031: The systemic fix — created the parity checklist, established the "three layers of a single data contract" principle
- ENG-039: CMS admin tabs must mirror frontend page sections, not field types
- ENG-049: Inline edit is the fourth layer — escalated to Hard Guardrail #16
- ENG-050: Filtering on newly-added fields with no data silently breaks features (EAP-030)

**Not covered by recent entries:** The original parity architecture creation (ENG-031) and the tab organization principle (ENG-039) are not revisited. The ENG-050 lesson about filtering on newly-added fields is a subtle data flow trap that has high re-occurrence potential.

---

## Theme 10: Layout and CSS Architecture Patterns

**Core lesson:** Three CSS architecture lessons recur: (1) flex containers need minimum dimension constraints — without `min-height`, body collapses to zero (violated 3+ times, see AP-027); (2) `position: fixed` elements must never be compensated with manual padding offsets — use `position: sticky` instead; (3) CSS `column-count` fills columns top-to-bottom, not left-to-right by row — use JS-distributed columns for predictable item positioning.

**Key entries:** ENG-032, ENG-034, ENG-041, ENG-018 (masonry), ENG-021 (admin bar), ENG-052

**Additional patterns:**
- ENG-041: `EditableArray` wrapper `<div>` has no layout — inline children flow horizontally unless explicit column layout is applied via `className`
- ENG-052: CSS Modules enforce selector purity — bare `*` selector is globally-scoped and rejected. Use `:where(*)` inside a locally-scoped parent.

**Not covered by recent entries:** The masonry layout JS distribution pattern (ENG-018) and the `EditableArray` wrapper layout trap (ENG-041) are not revisited. The CSS module purity constraint (ENG-052) with the `:where()` workaround is a one-time discovery useful for any future `@media (prefers-reduced-motion)` implementations.

---

## Theme 11: Git Branching and Version Control

**Core lesson:** All work happens on `dev`. Never write to `main`. When the user asks to merge, it's a versioned checkpoint. Version bumps should be data-driven (automated analysis of change scope) rather than manual guesswork.

**Key entries:** ENG-006, ENG-016 (versioning)

**Not covered by recent entries:** The original git branching protocol establishment (ENG-006) is a one-time event. The version control system design (ENG-016: `elan.json`, `version-bump.mjs`, `version-release.mjs`, playground sync via `elan.ts`) is foundational infrastructure not revisited by recent entries.

---

## Theme 12: DnD Inside Navigable Elements

**Core lesson:** When implementing drag-and-drop inside components that contain `<Link>` or `<a>` tags, attach drag listeners to the outermost wrapper and apply `pointer-events: none` to inner clickable content. Never put DnD listeners on a child element inside a Link — the Link's pointer event handling always wins. After a successful drag-and-save, call `router.refresh()` to re-run the server component tree, and hold optimistic state via a `hasPendingSave` flag to prevent flash of stale data.

**Key entries:** ENG-019 (tile reordering), ENG-020 (DnD listeners swallowed by Link), ENG-021 (save doesn't persist)

**Not covered by recent entries:** The complete DnD-inside-Link pattern (pointer-events isolation, router.refresh optimistic bridge) is not revisited by any recent entry. This is a reusable pattern for any future sortable grid built on `@dnd-kit` inside linked cards.

---

## Theme 13: External Service Configuration

**Core lesson:** Guard external service connections at the client wrapper level, not at each call site. A placeholder `DATABASE_URL` caused 7-second page loads and unhandled rejections. The `isDatabaseConfigured()` guard in `getPayloadClient()` catches this once, benefiting all pages.

**Key entries:** ENG-009, ENG-013, ENG-053

**Not covered by recent entries:** The `isDatabaseConfigured()` guard pattern (ENG-009) and the Supabase Storage S3 adapter configuration (ENG-053) are infrastructure decisions not revisited.

---

## Repetitive Issues (Escalation History)

### 1. Documentation Procedure Skips (7 occurrences → resolved)
**Entries:** ENG-008, ENG-012, ENG-044, ENG-045, ENG-046, ENG-053, plus ENG-073
**What finally fixed it:** Three escalations: (1) promoted to Hard Guardrail #1 (ENG-012), (2) added EAP-027 enforcement — create feedback log stub BEFORE writing the fix (after ENG-046), (3) recognized that architectural changes trigger the same skip pattern as bug fixes (ENG-053). The stub-first workflow made documentation a pre-condition rather than a deferred post-step.

### 2. Cross-App Parity Failures (5 occurrences → resolved)
**Entries:** ENG-001, ENG-002, ENG-003, ENG-004, ENG-005
**What finally fixed it:** ENG-005 promoted the parity checklist from docs to Hard Guardrail #8 with an inline checklist (not a pointer to a doc). The agent treats Hard Guardrails as blocking gates; doc-level references are treated as optional reading.

### 3. React 19 Script Tag Warning (3 failed fixes → resolved)
**Entries:** ENG-017, ENG-018, ENG-019
**What finally fixed it:** Removing the script entirely. `next-themes` → `dangerouslySetInnerHTML` → `next/script` all failed. React 19 does not want `<script>` elements in the component tree, period. Custom ThemeProvider + `<html suppressHydrationWarning>` + accepting one-frame flash is the only approach.

### 4. CMS-Frontend Parity Drift (5 occurrences → resolved)
**Entries:** ENG-027, ENG-028, ENG-029, ENG-030, ENG-031
**What finally fixed it:** ENG-031 created the CMS-Frontend Parity Checklist and Hard Guardrails #14 (always run checklist after field changes) and #15 (always restart dev server after schema changes). Later extended to four layers with Hard Guardrail #16 (inline edit support mandatory).

### 5. Payload Schema Change Without Server Restart (3 occurrences → resolved)
**Entries:** ENG-030, ENG-035, and one undocumented in ENG-050
**What finally fixed it:** Hard Guardrail #15 established the "schema change + restart = atomic operation" rule. The failure was subtle because the old server continued to work — it just silently ignored the new fields.

### 6. Verification Gap — Reporting Done Without Browser Check (3 occurrences → resolved)
**Entries:** ENG-017, ENG-018, ENG-019, ENG-020
**What finally fixed it:** Hard Guardrail #10 rewritten to explicitly require browser-level verification (not just `curl`). Added guardrails 12a (no `<script>` in React tree) and 12b (no `typeof window` branches).

---

## Lessons Not Covered by Recent Entries

These principles from early sessions haven't been re-learned in ENG-056→086. They represent edge cases, one-off discoveries, and foundational decisions still worth remembering.

### Foundational Infrastructure
1. **Supabase Transaction Pooler (ENG-013):** Direct connections resolve to IPv6, which fails on many networks. Always use the Transaction Pooler string (port 6543). Relevant if the database connection is ever reconfigured.
2. **Node.js 25 + Payload CLI (ENG-015):** `payload generate:importmap` fails on Node 25 due to ESM interop issues. Use Node 22 LTS with temporary `"type": "module"` in package.json. Relevant for any future importMap regeneration.
3. **Next.js 16 config compilation (ENG-007):** Node.js built-in imports (`path`, `url`) in `next.config.ts` cause ESM/CJS scope mismatch in the compiled config. The `sassOptions.includePaths` pointing to `node_modules` was unnecessary with modern sass.
4. **URL namespace ADR (ENG-014):** Payload CMS shares `localhost:4000` with the public site. This was accepted as an architectural constraint with documented revisit triggers.

### CMS Implementation Patterns
5. **Lexical richText deserializer (ENG-025):** `makeLexicalParagraph(text)` and `extractLexicalText(value)` are the canonical utilities. Any `typeof === "string"` guard on a richText field will silently drop real CMS content.
6. **Payload `autoLogin` cookie gap (ENG-046):** `autoLogin` with `prefillOnly: false` authenticates at the server level without setting a browser cookie. `isAdminAuthenticated()` must check both the cookie AND dev-mode auto-login config.
7. **Payload admin tabs should mirror page sections (ENG-039):** Organizing admin tabs by field type ("Labels & Footer") rather than page section ("Identity", "Experience", "Links") makes the CMS admin confusing. Tab structure = page structure.

### React / CSS Patterns
8. **Save flow `flushSync + dirtyRef` (ENG-030):** When `setFieldValue → save()` fires in the same event loop, React batching means `save()` reads stale state. The fix: `save()` reads from `dirtyRef.current` (synchronously updated ref), and `commitPanel` uses `flushSync`.
9. **Index-as-key drag bug (ENG-036):** React reuses DOM nodes with index keys after reorder. Browser drag state persists on the physical node. Stable string keys that travel with items through reorders are mandatory for DnD lists.
10. **DnD inside Link components (ENG-019→020→021 renumbered):** Attach drag listeners to outermost wrapper, `pointer-events: none` on inner `<Link>`. After save, `router.refresh()` + `hasPendingSave` flag bridges the gap between client mutation and server refresh.
11. **CSS `column-count` vs JS distribution (ENG-018 renumbered):** CSS columns fill top-to-bottom per column, not left-to-right by row. For predictable item positioning in masonry grids, use JS round-robin distribution into flex columns.
12. **CSS module selector purity (ENG-052):** Bare `*` selectors are rejected by CSS Modules. Use `:where(*)` inside a locally-scoped parent class for global-like selectors (e.g., `prefers-reduced-motion` blanket rules).
13. **Polymorphic `as` prop must forward attributes (ENG-065 active, but the pattern from ENG-024/ENG-044 is foundational):** A component that accepts `as="a"` but silently drops `href` is a broken abstraction. Always spread `...htmlAttrs` into `createElement`.

### Process Patterns
14. **Rules layer hierarchy (ENG-005, ENG-012):** Hard Guardrails > Docs > Feedback Logs. When the same incident recurs 3+ times, promote from docs to Hard Guardrails. Knowledge in docs gets diluted; knowledge in guardrails gets enforced.
15. **Context-switch documentation break (ENG-008):** When a user reports a bug mid-task, the bug is a full engineering incident — not a footnote. It requires the complete engineering-iteration protocol regardless of what task was interrupted.
