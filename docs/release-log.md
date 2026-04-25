# Release Log

> **What this file is:** Chronological record of ship-it releases with incidents and lessons learned (last 15 entries). Newest entries first.
>
> **Who reads this:** AI agents when the `ship-it` skill is activated — scan recent entries for recurring pitfalls before starting a new release.
> **Who writes this:** AI agents after each ship-it run via the Post-Release Audit protocol in `ship-it/SKILL.md`.
> **Last updated:** 2026-04-25 (REL-026: Élan 2.13.1, yilangao.com 1.5.1, ASCII Art Studio 0.6.16)

---

## REL-026 — Élan 2.13.1, yilangao.com 1.5.1, ASCII Art Studio 0.6.16 (2026-04-25)

> For current analytics architecture, see `docs/analytics.md`.

**Scope:** 7 files in 1 layer commit (L8 frontend pages/analytics x7) + 1 build-gate fix commit + 1 release commit + 1 dev-patch-bump commit. Layers 0-7, 9-10 empty.
**Semver:** Patch for all three apps (analytics instrumentation only, no UI/API changes).
**Previous release:** Élan 2.13.0, yilangao.com 1.5.0, ASCII Art Studio 0.6.15

**Incidents during release:**
1. **Main site build gate failed (first attempt):** TypeScript error in `use-engagement-tracker.ts` - `Array.from(engagedSlugs)` returns `string[]` which is not assignable to `EventProperties` value type (`string | number | boolean | null | undefined`). Fixed by serializing with `.join(",")`.

**Build gate:** Playground passed on first attempt (~12s compile, ~6s TS). Main site failed once (type error), passed on second attempt (~17s compile, ~9s TS). ASCII Art Studio passed on first attempt (~6s compile, ~4s TS).

**Post-deploy verification:** `vercel projects ls` confirmed both `yilangao-design-system` (playground) and `yilangao-portfolio` (main site at `new.yilangao.com`) updated within 3m of the `main` push.

**Layer classification notes:**
- All 7 files are analytics-related: 2 new hooks (`use-engagement-tracker.ts`, `use-session-tracker.ts`), Mixpanel core updates (`mixpanel.ts`), `AnalyticsProvider.tsx`, and 3 page-level integrations (`ContactClient.tsx`, `ProjectClient.tsx`, `LoginClient.tsx`). Single commit was appropriate given tight coupling.

**Known Pitfall references:** Build gate type error was straightforward (array vs scalar mismatch). Not a new pitfall - the gate caught it as designed.

---

## REL-025 — Élan 2.13.0, yilangao.com 1.5.0, ASCII Art Studio 0.6.15 (2026-04-25)

> For current analytics architecture, see `docs/analytics.md`.

**Scope:** 22 files across 3 dependency-ordered layer commits (L1 docs x8, L7 site components x7, L8 frontend pages x7) + 2 build-gate fix commits + 1 release commit + 1 dev-patch-bump commit. Layers 0, 2-6, 9-10 empty.
**Semver:** Minor for Élan (overhauled interactive visuals) and yilangao.com (new API routes for live data visualization). Patch for ASCII Art Studio (manifest sync only).
**Previous release:** Élan 2.12.0, yilangao.com 1.4.0, ASCII Art Studio 0.6.14

**Incidents during release:**
1. **Main site build gate failed (first attempt):** TypeScript error in `CollaborationLoop.tsx` - `DropdownMenuContent` received an inline `style` prop which is not in its type definition. Also violated Hard Guardrail #1 (no inline styles). Fixed by adding a CSS module class `.transportSpeedDropdown` with the `min-width` rule.
2. **Main site build gate failed (second attempt):** TypeScript error in `MaturityTimeline.tsx` - union type cast `as Record<string, string>` failed because the conditional object has optional `undefined` properties. Fixed by annotating the variable type directly as `Record<string, string>`.

**Build gate:** Playground passed on first attempt (~11s compile, ~6s TS). Main site failed twice, passed on third attempt (~17s compile, ~9s TS). ASCII Art Studio passed on first attempt (~6s compile, ~4s TS).

**Post-deploy verification:** `vercel ls --prod` (default linked project `yilangao-design-system`) showed latest production deployment Ready (58s build) within 4m of the `main` push. Portfolio project (`yilangao-portfolio`) deploys from the same GitHub `main` integration.

**Layer classification notes:**
- L1: All 8 `docs/` files - feedback logs, anti-pattern catalogs, design.md, engineering.md, port-registry.
- L7: All 7 `src/components/elan-visuals/` files - SkillMap, MaturityTimeline, CollaborationLoop (TSX + SCSS).
- L8: 3 new API routes (`/api/antipatterns`, `/api/maturity`, `/api/skills`), 2 project page files, `AnalyticsProvider.tsx`, `mixpanel.ts`.

**Known Pitfall references:** Build gate failures are type-level issues caught by the gate. No new pitfall needed - the gate worked as intended.

---

## REL-024 — Élan 2.12.0, yilangao.com 1.4.0, ASCII Art Studio 0.6.14 (2026-04-25)

> For current analytics architecture, see `docs/analytics.md`.

**Scope:** 13 files across 5 dependency-ordered layer commits (L1 docs x2, L3 deps x2, L5 new components x2, L7 site components x1, L8 frontend pages x6) + 1 release commit + 1 dev-patch-bump commit. Layers 0, 2, 4, 6, 9-10 empty.
**Semver:** Minor for Élan (new component: AnalyticsProvider) and yilangao.com (new feature: Mixpanel + Vercel Analytics). Patch for ASCII Art Studio (manifest sync only).
**Previous release:** Élan 2.11.11, yilangao.com 1.3.11, ASCII Art Studio 0.6.13

**Incidents during release:** None. All three build gates passed on first attempt. Playground ~18s compile + ~6s TS, main site ~21s compile + ~9s TS, ASCII tool ~10s compile + ~4s TS.

**Build gate:** All three apps passed on first attempt.

**Post-deploy verification:** `vercel ls --prod` (default linked project `yilangao-design-system`) showed latest production deployment Ready (1m build) within 3m of the `main` push. Portfolio project (`yilangao-portfolio`) deploys from the same GitHub `main` integration.

**Env var note:** `NEXT_PUBLIC_MIXPANEL_TOKEN` was added to the playground Vercel project via CLI. The main site (`yilangao-portfolio`) needs the same env var added via the Vercel dashboard since CLI targets the playground by default.

**Layer classification notes:**
- L1: `docs/engineering-feedback-log.md`, `docs/port-registry.md`.
- L3: `package.json`, `package-lock.json` (added `@vercel/analytics`, `mixpanel-browser`, `@types/mixpanel-browser`).
- L5: `src/lib/analytics/mixpanel.ts` (new), `src/components/AnalyticsProvider.tsx` (new).
- L7: `src/components/SiteFooter/SiteFooter.tsx` (External Link Clicked tracking).
- L8: `src/app/(frontend)/layout.tsx` (AnalyticsProvider + Vercel Analytics wiring), `HomeClient.tsx` (Case Study Clicked), `ContactClient.tsx` (Contact Form Submitted), `ProjectClient.tsx` (Case Study Viewed + Section Reached + External Link Clicked), `LoginClient.tsx` + `login.module.scss` (minor styling fixes, pre-existing).

---

## REL-023 — Élan 2.11.11, yilangao.com 1.3.11, ASCII Art Studio 0.6.13 (2026-04-24)

**Scope:** 9 files across 3 dependency-ordered layer commits (L0 config x2, L1 docs x1, L8 frontend/CMS x6) + 1 release commit + 1 dev-patch-bump commit. Layers 2-7, 9-10 empty.
**Semver:** Patch for all three apps. yilangao.com 1.3.11: alt passwords migrated from text to array field, universal fallback, welcome-slug guard, dashboard UI. Élan 2.11.11: manifest sync only. ASCII Art Studio 0.6.13: manifest sync only.
**Previous release:** Élan 2.11.10, yilangao.com 1.3.10, ASCII Art Studio 0.6.12

**Incidents during release:** Playground build gate failed on first attempt with `Module not found: Can't resolve 'cmdk'` — the package was listed in `playground/package.json` and present in `node_modules`, but a stale `.next` Turbopack cache caused resolution failure. Fixed by `rm -rf playground/.next` and re-running. No code changes needed.

**Build gate:** Playground ~17s compile + ~9s TS (after cache clear), main site ~25s compile + ~13s TS, ASCII tool ~9s compile + ~5s TS. All passed on second attempt (playground) / first attempt (main + ASCII).

**Post-deploy verification:** `vercel ls --prod` (default linked project `yilangao-design-system`) showed latest production deployment Ready (1m build) within 1m of the `main` push.

**Layer classification notes:**
- L0: `.cursor/skills/password-gate/SKILL.md` (altPasswords array docs, fallback invariants), `.cursor/skills/personalize/SKILL.md` (altPasswords field guidance).
- L1: `docs/engineering-feedback-log.md` (ENG-206 alt password architecture migration).
- L8: `src/collections/Companies.ts` (text to array migration), `src/app/(frontend)/for/[company]/actions.ts` (universal fallback + simplified validation), `src/lib/company-data.ts` (type + mapper), `src/scripts/push-schema.ts` (create array table, drop varchar column, fix greeting default), `src/components/admin/CompanyDashboard.tsx` (alt passwords UI), `src/app/(frontend)/(site)/work/[slug]/page.tsx` (welcome guard).

---

## REL-022 — Élan 2.11.10, yilangao.com 1.3.10, ASCII Art Studio 0.6.12 (2026-04-24)

**Scope:** 8 files across 2 dependency-ordered layer commits (L1 docs x4, L8 frontend/CMS x4) + 1 release commit + 1 dev-patch-bump commit. Layers 0, 2-7, 9-10 empty.
**Semver:** Patch for all three apps. yilangao.com 1.3.10: alt passwords feature for company gate. Élan 2.11.10: manifest sync only. ASCII Art Studio 0.6.12: manifest sync only.
**Previous release:** Élan 2.11.9, yilangao.com 1.3.9, ASCII Art Studio 0.6.11

**Incidents during release:** None. Clean pass through all phases.

**Build gate:** Playground ~22s compile + ~10s TS, main site ~36s compile + ~14s TS, ASCII tool ~10s compile + ~5s TS. All passed first attempt.

**Post-deploy verification:** `vercel ls --prod` (default linked project `yilangao-design-system`) showed latest production deployment Ready (1m build) within 3m of the `main` push.

**Layer classification notes:**
- L1: `docs/engineering-feedback-log.md` (ENG-199 alt passwords), `docs/engineering-anti-patterns.md` (ENG-206 appended to EAP-076), `docs/engineering.md` (frequency map bump), `docs/port-registry.md` (PID update + restart log entry).
- L8: `src/collections/Companies.ts` (new `altPasswords` field), `src/app/(frontend)/for/[company]/actions.ts` (multi-password validation), `src/lib/company-data.ts` (type + data fetch), `src/scripts/push-schema.ts` (ALTER TABLE for alt_passwords column).

---

## REL-021 — Élan 2.11.9, yilangao.com 1.3.9, ASCII Art Studio 0.6.11 (2026-04-24)

**Scope:** 5 files across 2 dependency-ordered layer commits (L1 docs x4, L6 component update x1) + 1 release commit + 1 dev-patch-bump commit. Layers 0, 2-5, 7-10 empty.
**Semver:** Patch for all three apps. Élan 2.11.9: Textarea SCSS cleared. yilangao.com 1.3.9: docs only. ASCII Art Studio 0.6.11: manifest sync only.
**Previous release:** Élan 2.11.8, yilangao.com 1.3.8, ASCII Art Studio 0.6.10

**Incidents during release:** None. Clean pass through all phases.

**Build gate:** Playground ~29s, main site ~44s, ASCII tool ~18s. All passed first attempt.

**Post-deploy verification:** `vercel ls --prod` (default linked project `yilangao-design-system`) showed latest production deployment Ready (58s build) within 4m of the `main` push.

**Layer classification notes:**
- L1: `docs/content-feedback-log.md` (CF-026 through CF-028, Chalk personalization), `docs/engineering-feedback-log.md` (ENG-205), `docs/engineering.md` (frequency map), `docs/port-registry.md` (PIDs + restart log).
- L6: `src/components/ui/Textarea/Textarea.module.scss` (file emptied — styles cleared).

---

## REL-020 — Élan 2.11.8, yilangao.com 1.3.8, ASCII Art Studio 0.6.10 (2026-04-23)

**Scope:** 2 files across 2 dependency-ordered layer commits (L0 config ×1, L8 frontend ×1) + 1 release commit + 1 dev-patch-bump commit. Layers 1-7, 9-10 empty.
**Semver:** Patch for all three apps. Élan 2.11.8: new `personalize` agent skill. yilangao.com 1.3.8: favicon added. ASCII Art Studio 0.6.10: manifest sync only.
**Previous release:** Élan 2.11.7, yilangao.com 1.3.7, ASCII Art Studio 0.6.9

**Incidents during release:**
- Git orphaned branch: local `dev` had no commits (orphaned from `origin/dev`). Required `git reset --soft origin/dev` to re-attach, then `git reset HEAD` to rebuild the index. Root cause: unknown (likely a prior interrupted operation). Not a recurring pitfall - one-time recovery.
- Phantom `M` files in `git status`: multiple files showed as modified with zero content diff (stat-cache mismatches). Did not affect commits. Known macOS behavior.
- 16 macOS duplicate files (`* 2.*` pattern) found and deleted in Phase 2.

**Build gate:** Playground ~42s, main site ~65s, ASCII tool ~39s. All passed first attempt.

**Post-deploy verification:** `vercel ls --prod` (default linked project `yilangao-design-system`) showed latest production deployment Ready within 3m of the `main` push.

**Layer classification notes:**
- L0: `.cursor/skills/personalize/SKILL.md` (new agent skill for company visitor personalization pipeline).
- L8: `src/app/(frontend)/favicon.ico` (new static asset).

---

## REL-019 — Élan 2.11.7, yilangao.com 1.3.7, ASCII Art Studio 0.6.9 (2026-04-23)

**Scope:** 9 files across 2 dependency-ordered layer commits (L1 docs ×5, L7/L8 source ×4) + 1 release commit + 1 dev-patch-bump commit. Layers 0, 2-6, 9-10 empty.
**Semver:** Patch for all three apps. Élan 2.11.7: CollaborationLoop accent neutralization (22 accent→neutral conversions per Lumen Scarcity Principle), step nav alignment fix, transport divider removal, callout padding reduction, stale image placeholder removal from Elan content. yilangao.com 1.3.7: same feature set. ASCII Art Studio 0.6.9: manifest sync only.
**Previous release:** Élan 2.11.6, yilangao.com 1.3.6, ASCII Art Studio 0.6.8

**Incidents during release:** None. Clean run — all three build gates passed on first attempt.

**Build gate:** Playground ~22s, main site ~31s, ASCII tool ~13s.

**Post-deploy verification:** `vercel ls --prod` (default linked project `yilangao-design-system`) showed latest production deployment Ready within 1m of the `main` push.

**Layer classification notes:**
- L1: Design feedback (FB-178/179 accent neutralization + step alignment, FB-087 callout padding), content feedback (CF-025 Cognition wording), design anti-patterns (AP-071 accent as highlight), design.md frequency map update, engineering feedback log update.
- L7/L8 combined: `CollaborationLoop.tsx` (step number removal), `collaboration-loop.module.scss` (22 accent→neutral, transport cleanup, step nav padding), `page.module.scss` (callout padding 4x/5x→3x), `update-elan/route.ts` (remove stale imagePlaceholders array).

---

## REL-018 — Élan 2.11.6, yilangao.com 1.3.6, ASCII Art Studio 0.6.8 (2026-04-23)

**Scope:** 23 files across 3 dependency-ordered layer commits (L0 config ×4, L1 docs ×12, L8 frontend ×7) + 1 release commit + 1 dev-patch-bump commit. Layers 2-7, 9-10 empty.
**Semver:** Patch for all three apps. Élan 2.11.6: personalization badge on home page, Élan headline rewrite, fallback route rename (unknown → welcome), session re-auth fix. yilangao.com 1.3.6: same feature set. ASCII Art Studio 0.6.8: manifest sync only.
**Previous release:** Élan 2.11.5, yilangao.com 1.3.5, ASCII Art Studio 0.6.7

**Incidents during release:** None. Clean run — all three build gates passed on first attempt.

**Build gate:** Playground ~27s (including token sync prebuild), main site ~60s, ASCII tool ~15s.

**Post-deploy verification:** `vercel ls --prod` (default linked project `yilangao-design-system`) showed latest production deployment Ready within 4m of the `main` push. Portfolio project (`yilangao-portfolio`) deploys from the same GitHub `main` integration.

**Layer classification notes:**
- L0: Agent skills (`boot-up`, `password-gate`), `architecture.md`, `deployment.md` — all renaming `unknown` → `welcome`.
- L1: Content feedback (CFB-042 Élan headline rewrite), design feedback (FB-176/177 personalization badge + Lumen scarcity), engineering feedback (ENG-202/203 session identity), branding §9, portfolio coherence manifest, personal-voice T10 broadening.
- L8: `HomeClient.tsx` (personalization badge replaces dead essay badge), `page.module.scss` (renamed class), `page.tsx` (server-side personalization data fetch), `actions.ts` + `page.tsx` (session slug rename), `case-study-intro-headline.ts` (Élan headline), `proxy.ts` (fallback route rename).

---

## REL-017 — Élan 2.11.5, yilangao.com 1.3.5, ASCII Art Studio 0.6.7 (2026-04-23)

**Scope:** 9 files across 3 dependency-ordered layer commits (L1 docs ×2, L7 site components ×2, L8 frontend pages ×5) + 1 release commit + 1 dev-patch-bump commit. Layers 0, 2-6, 9-10 empty.
**Semver:** Patch for all three apps. Élan 2.11.5: CollaborationLoop transport strip spacing (FB-175), SkillMap min-width overflow fix. yilangao.com 1.3.5: brand favicon SVG replaces default Vercel favicon.ico, explicit icons metadata in layout. ASCII Art Studio 0.6.7: manifest sync only.
**Previous release:** Élan 2.11.4, yilangao.com 1.3.4, ASCII Art Studio 0.6.6

**Incidents during release:** None. Clean run — all three build gates passed on first attempt.

**Build gate:** Playground ~33s (including token sync prebuild), main site ~41s, ASCII tool ~23s.

**Post-deploy verification:** `vercel ls --prod` (default linked project `yilangao-design-system`) showed latest production deployment Ready within 3m of the `main` push. Portfolio project (`yilangao-portfolio`) deploys from the same GitHub `main` integration.

**Layer classification notes:**
- L1: `docs/design-feedback-log.md` (FB-175), `docs/engineering-feedback-log.md` (ENG-198).
- L7: `collaboration-loop.module.scss` (transport gaps widened to `1x`), `skill-map.module.scss` (`min-width: 120px` → `min-width: 0`).
- L8: `favicon.ico` ×2 (deleted), `icon.svg` ×2 (new brand SVG), `layout.tsx` (icons metadata).

---

## REL-016 — Élan 2.11.4, yilangao.com 1.3.4, ASCII Art Studio 0.6.6 (2026-04-23)

**Scope:** 14 files across 4 dependency-ordered layer commits (L1 docs ×5, L5 new lib ×1, L7 site components ×4, L8 frontend pages ×4) + 1 release commit + 1 dev-patch-bump commit. Layers 0, 2-4, 6, 9-10 empty.
**Semver:** Patch for all three apps. Élan 2.11.4: link toolbar popover (FB-174/ENG-198), block toolbar positioning fix (FB-173), bidirectional Lexical-Payload link normalization (EAP-119/ENG-195–197), removed ClickableLinkPlugin. yilangao.com 1.3.4: resume URL update, Élan scope statement hyperlink. ASCII Art Studio 0.6.6: manifest sync only.
**Previous release:** Élan 2.11.3, yilangao.com 1.3.3, ASCII Art Studio 0.6.5

**Incidents during release:** None. Clean run — all three build gates passed on first attempt.

**Build gate:** Playground ~26s (including token sync prebuild), main site ~36s, ASCII tool ~12s.

**Post-deploy verification:** `vercel ls --prod` (default linked project `yilangao-design-system`) showed latest production deployment queued within 1m of the `main` push. Portfolio project (`yilangao-portfolio`) deploys from the same GitHub `main` integration.

**Layer classification notes:**
- L1: `docs/design-feedback-log.md` (FB-173, FB-174), `docs/engineering-feedback-log.md` (ENG-195–198), `docs/engineering-anti-patterns.md` (EAP-119), `docs/engineering.md` (frequency map), `docs/port-registry.md` (PID update).
- L5: `src/lib/normalize-lexical-links.ts` (new file — bidirectional transforms between `@lexical/link` and Payload `LinkNode` shapes).
- L7: `LexicalToolbar.tsx` (link popover), `LexicalBlockEditor.tsx` (normalize/denormalize wiring, removed ClickableLinkPlugin), `inline-edit.module.scss` (block toolbar centering, link popover styles, cursor:text on editable links), `content-helpers.ts` (normalize/denormalize wiring for markdown conversion).
- L8: `layout.tsx` (resume URL), `seed/route.ts` (resume URL), `update-elan/route.ts` (scope statement hyperlink), `seed.ts` (resume URL).

---

## REL-015 — Élan 2.11.3, yilangao.com 1.3.3, ASCII Art Studio 0.6.5 (2026-04-23)

**Scope:** 10 files across 3 dependency-ordered layer commits (L1 docs ×4, L7 site components ×5, L8 frontend pages ×1) + 1 release commit + 1 dev-patch-bump commit. Layers 0, 2-6, 9-10 empty.
**Semver:** Patch for all three apps. Élan 2.11.3: Lexical cross-block focus fix (ENG-194), elan-visuals style refinements (FB-171 toggle sizing, CollaborationLoop refactor, SkillMap dead styles). yilangao.com 1.3.3: essay badge feature flag (FB-172). ASCII Art Studio 0.6.5: manifest sync only.
**Previous release:** Élan 2.11.2, yilangao.com 1.3.2, ASCII Art Studio 0.6.4

**Incidents during release:** None. Clean run — all three build gates passed on first attempt.

**Build gate:** Playground ~24s (including token sync prebuild), main site ~33s, ASCII tool ~13s.

**Post-deploy verification:** `vercel ls --prod` (default linked project `yilangao-design-system`) showed latest production deployment queued within 1m of the `main` push. Portfolio project (`yilangao-portfolio`) deploys from the same GitHub `main` integration.

**Layer classification notes:**
- L1: `docs/design-feedback-log.md` (FB-171, FB-172), `docs/engineering-feedback-log.md` (ENG-194), `docs/engineering-anti-patterns.md` (EAP update for Lexical focus), `docs/engineering.md` (§14.9.3 principle).
- L7: `CollaborationLoop.tsx` (refactor), `collaboration-loop.module.scss` (cleanup), `maturity-timeline.module.scss` (toggle sizing), `skill-map.module.scss` (dead style removal), `useBlockKeyboardNav.ts` (Lexical blur-before-focus fix).
- L8: `HomeClient.tsx` (essay badge feature flag).

---

## REL-014 — Élan 2.11.2, yilangao.com 1.3.2, ASCII Art Studio 0.6.4 (2026-04-22)

**Scope:** 3 files across 2 dependency-ordered layer commits (L1 docs, L8 frontend) + 1 release commit + 1 dev-patch-bump commit. The fast-forward merge to `main` also included pending commit `161f4e6` (REL-013 post-release audit: `docs/release-log.md`, `docs/design-feedback-log.md`) that had existed on `dev` but not yet on `main`. L2–L7, L9–L10 empty for this session’s authored work.
**Semver:** Patch for all three apps. yilangao.com: essay layout (`$elan-container-narrow` → `$elan-container-content`) per FB-170. Élan 2.11.2 and ASCII Art Studio 0.6.4 are manifest sync releases (no DS component or ascii-tool source edits in this checkpoint).
**Previous release:** Élan 2.11.1, yilangao.com 1.3.1, ASCII Art Studio 0.6.3

**Incidents during release:** None. `CHANGELOG.md` updated in the release commit (not left to an implicit follow-up).

**Build gate:** All three apps passed on first attempt (playground ~23s including token sync prebuild, main site ~34s, ASCII tool ~12s).

**Post-deploy verification:** `vercel ls --prod` (default linked project `yilangao-design-system`) showed latest production deployment `● Ready` in ~1m build time after the `main` push. Portfolio project (`yilangao-portfolio`) deploys from the same GitHub `main` integration; not queried via CLI because root `.vercel/project.json` targets the playground.

**Layer classification notes:**
- L1: `docs/content/case-study.md` (essay sidebar variant copy), `docs/design-feedback-log.md` (FB-170 entry).
- L8: `src/app/(frontend)/(site)/work/[slug]/page.module.scss` (`.layoutEssay` / `.contentEssay` max-width tokens).

---

## REL-013 — Élan 2.11.1, yilangao.com 1.3.1, ASCII Art Studio 0.6.3 (2026-04-22)

**Scope:** 1 file across 1 dependency-ordered layer commit (L8) + 1 release commit + 1 dev-patch-bump commit. All other layers empty.
**Semver:** Patch for all three apps. yilangao.com: SCSS-only fix to login page `.inner` container (removed 80vw ultra-wide breakpoint). Élan and ASCII Art Studio: release sync only, no app code changes.
**Previous release:** Élan 2.11.0, yilangao.com 1.3.0, ASCII Art Studio 0.6.2

**Incidents during release:**
- **Unexpected uncommitted doc files after release scripts.** After running `npm run version:release` and `npm run website:version:release`, `git diff --name-only` showed `docs/design.md` and `docs/design/responsive.md` as modified — these files were NOT shown in Phase 1 analysis (`git diff --name-status` only listed `login.module.scss`). Root cause unclear — possibly Post-Flight docs written by a previous session that were left uncommitted before `ship-it` was invoked, then became visible via a git-index state change. **Resolution:** the doc changes were legitimate FB-169 Post-Flight documentation, so they were included in the release commit. No functional impact.

**Build gate:** All three apps passed on first attempt. Playground ~27s, main site ~33s, ASCII tool ~12s (static only, no code changes).

**Layer classification notes:**
- Single file in L8 (Frontend pages): `src/app/(frontend)/for/[company]/login.module.scss`.
- No playground pages, no new components, no token changes — minimal release.
- Vercel portfolio (`yilangao-portfolio`) went Queued → Ready in ~3m. Playground (`yilangao-design-system`) was Ready within 1m of the push.

**Pattern note (Phase 1 doc-state gap):** Phase 1 uses `git diff --name-status` to enumerate changed files, but this compares working tree to HEAD and won't catch files that were modified in a prior session, partially staged, or written by pre-commit hooks without being re-dirtied. Consider adding `git diff --cached --name-status` to Phase 1 to catch staged-but-not-working-tree changes.

---

## REL-012 — Élan 2.11.0, yilangao.com 1.3.0, ASCII Art Studio 0.6.2 (2026-04-22)

**Scope:** 39 files across 6 dependency-ordered layer commits (L0, L1, L5, L6, L7, L8) + 1 release commit + 1 dev-patch-bump commit. L2 Tokens, L3 Deps, L4 Deletions, L9 Playground, L10 ASCII tool src were all empty.
**Semver:** Minor for Élan (2.10.0 → 2.11.0: new Essay component family — EssayHeader, EssayMeta — and read-time utility). Minor for yilangao.com (1.2.0 → 1.3.0: essay components on project pages, elan-visuals updates, inline-edit improvements, company session changes, push-schema updates). Patch for ASCII Art Studio (0.6.1 → 0.6.2: release sync only, no app code changes).
**Previous release:** Élan 2.10.0, yilangao.com 1.2.0, ASCII Art Studio 0.6.1

**Incidents during release:**
- **website-version.ts sync target left uncommitted.** `npm run website:version:release` auto-synced `src/lib/website-version.ts` but this file was not included in the release commit's `git add` command (it is not listed in the checkpoint skill's Registered Apps table). `git checkout main` refused with "local changes would be overwritten." **Resolution:** amended the release commit to include `src/lib/website-version.ts`, force-pushed dev, then proceeded. This is a REL-AP-001 variant — the existing pitfall covers manifest JSON + `playground/src/lib/elan.ts` + `ascii-tool/src/lib/version.ts`, but the website also has a TypeScript sync target at `src/lib/website-version.ts` that is not documented. Filing as pattern note below.

**Build gate:** All three apps passed on first attempt. Playground ~29s, main site ~32s, ASCII tool ~34s (fast — no code changes).

**Layer classification notes:**
- L5 absorbed all 5 new files: `src/components/essay/EssayHeader.tsx`, `EssayHeader.module.scss`, `EssayMeta.tsx`, `EssayMeta.module.scss`, and `src/lib/read-time.ts`.
- REL-AP-005 clean — verified `read-time.ts` imported by `page.tsx`; `EssayHeader`/`EssayMeta` imported by `ProjectClient.tsx`.
- No L9 playground pages — no new playground commits required.
- Vercel playground (`yilangao-design-system`) went Queued → Ready in ~4m, matching pattern from previous releases.

**Pattern note (website sync target):** `src/lib/website-version.ts` is the TypeScript sync target for `website.json`, analogous to `playground/src/lib/elan.ts` for `elan.json`. The checkpoint skill's release commit `git add` command and REL-AP-001 guidance do not currently include it. After 2 releases involving website changes, this will need to be promoted to the checkpoint skill and REL-AP-001 fix.

---

---

> **Archived entries:** REL-001 through REL-011 moved to `docs/release-log-archive.md` (2026-04-25, cap enforcement).
