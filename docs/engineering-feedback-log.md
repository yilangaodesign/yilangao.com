# Engineering Feedback Log

> **What this file is:** Chronological record of every engineering incident and feedback session. Each entry captures the raw issue, the root cause analysis, and what was done. Newest entries first.
>
> **Who reads this:** AI agents at session start (scan recent entries for context), and during incident response (check for recurring patterns).
> **Who writes this:** AI agents after each incident resolution via the `engineering-iteration` skill.
> **Last updated:** 2026-03-29

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

## Entry Template

```markdown
#### ENG-NNN: "[First 10 words of user message]"

**Issue:** [What the user observed]

**Root Cause:** [Technical reason it happened]

**Resolution:** [What was done to fix it]

**Principle extracted -> `engineering.md` §N.N: [Section reference]**
```
