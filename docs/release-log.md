# Release Log

> **What this file is:** Chronological record of ship-it releases with incidents and lessons learned (last 15 entries). Newest entries first.
>
> **Who reads this:** AI agents when the `ship-it` skill is activated — scan recent entries for recurring pitfalls before starting a new release.
> **Who writes this:** AI agents after each ship-it run via the Post-Release Audit protocol in `ship-it/SKILL.md`.
> **Last updated:** 2026-04-23 (REL-016: Élan 2.11.4, yilangao.com 1.3.4, ASCII Art Studio 0.6.6)

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

## REL-011 — Élan 2.10.0, yilangao.com 1.2.0, ASCII Art Studio 0.6.1 (2026-04-21)

**Scope:** ~88 working-tree files across 8 dependency-ordered layer commits, 1 release commit, 2 follow-up commits (1 build-fix, 1 concurrent footer feature), 1 dev patch bump on `dev` after merge (105 files shown in fast-forward diff including release artifacts).
**Semver:** Minor for Élan (2.9.1 → 2.10.0: 3 new DS primitives — `AlertDialog`, `MediaMuteToggle`, `VideoEmbed`). Minor for yilangao.com (1.1.2 → 1.2.0: video embed block, image-group atomic migration, major inline-edit feature expansion — `ConfirmDelete`, `ToastSurface`, `VideoEmbedInput`, `VideoSettings`, `ImageBlockAdminOverlay`). Patch for ASCII Art Studio (0.6.0 → 0.6.1: release sync only, no app code changes).
**Previous release:** Élan 2.9.0, yilangao.com 1.1.1, ASCII Art Studio 0.6.0

**Incidents during release:**
- **Corrupt `playground/node_modules` on first build attempt.** Playground build failed with `ERR_INVALID_PACKAGE_CONFIG` for `next/dist/compiled/text-table/package.json` (file was missing from the compiled bundle — the directory contained only `LICENSE`). Root cause: partial/interrupted install from a prior session. **Resolution:** `rm -rf playground/node_modules playground/.next && npm install` in playground. Rebuild succeeded on retry. Filing as **REL-AP-008** below — this is a new pitfall worth capturing: corrupted node_modules from interrupted installs are not caught by the ship-it Phase 2 clean (which only scans for macOS duplicates and debug logs, not node_modules integrity).
- **Main site TypeScript error in atomic image block.** `ProjectClient.tsx` line 857 passed `img.url` (typed `string | undefined`) to `MediaRenderer`'s required `src: string` prop. TS did not narrow through the `hasMedia = Boolean(img.url)` guard. **Resolution:** added non-null assertion (`src={img.url!}`) in a separate `fix:` commit atop the release commit. Build passed on retry. Same pattern as REL-009 fix #3 (use-cursor-thumbnail non-null after guard) — TypeScript strict mode doesn't narrow through intermediate boolean variables.
- **Concurrent IDE edits landed mid-release.** After the release commit was created, `git status` showed 5 additional modified files (`(site)/layout.tsx`, `api/seed/route.ts`, `scripts/seed.ts`, `docs/engineering-feedback-log.md`, `docs/port-registry.md`) with coherent, isolated footer social-link updates (adding Élan DS / Resume / LinkedIn defaults with URL fallback resolution). These were clearly concurrent user edits, not agent side-effects. **Resolution:** committed as a separate `feat:` commit after the build-fix, then re-ran the main site build gate before merge. Rolled into the same release window. No new pitfall — documenting the pattern: the build gate must re-run when any file changes after the release commit, including concurrent edits.
- **ASCII tool build hung when output was piped through `tail -20`.** First ascii-tool build attempt backgrounded with no output because `tail -20` buffers until EOF. **Resolution:** killed the hung pipe, re-ran with output redirected to a log file (`> /tmp/ascii-build.log 2>&1`), then tailed the log. Build completed in ~7.4min (TypeScript-dominated). No functional failure — documenting as a shell-pipe caveat for long-running builds.
- **Vercel post-deploy poll:** playground (`yilangao-design-system`) deployment was **Queued** ~1m after push, matching REL-008/009/010 pattern. Main site (`yilangao-portfolio`) project is not visible from repo root `vercel ls --prod` per REL-008.

**Build gate:** All three apps passed after the corrupt-node_modules reinstall and the MediaRenderer fix. Main site build ran twice (before and after the concurrent-edit commit) — both passed. Playground ~47s, main site ~46-58s, ASCII tool ~7.9min (dominated by TypeScript).

**Layer classification notes:**
- 8 commits across 7 populated layers (L0 Config, L1 Docs, L3 Deps, L5 New primitives + libs + registry, L6 UI updates, L7 Site components, L8 Frontend pages + CMS, L9 Playground). L2 Tokens, L4 Deletions, L10 ASCII tool src were all empty.
- L5 consolidated 3 new DS components, 3 new `src/lib/*.ts` utility files, and the updated `archive/registry.json` into one commit per Phase 1 rules.
- REL-AP-005 clean this time — no stray `src/lib/utils.ts`. All 3 new `src/lib/` files (`migrate-image-groups.ts`, `normalize-image-rows.ts`, `parse-video-embed.ts`) verified as imported and dependency-resolved.
- REL-AP-002 clean — new playground pages for `alert-dialog`, `media-mute-toggle`, `video-embed` all use correct component-preview APIs: `<SubsectionHeading>children</SubsectionHeading>`, `<SourcePath path="..." />`, `<PropsTable props={[...]} />`. Grep-verified before commit.
- REL-AP-003 clean — the 3 new UI component directories were all-new (no mixed new/modified files in the same directory).
- `.mcp.json` (untracked local config) added to `.gitignore` in L0 alongside the Next.js image hostname config. No change to the `.gitignore` posture for dev artifacts.

### REL-AP-008: Corrupt `node_modules` from interrupted prior install

**Occurrences:** 1 (REL-011)

**Trigger:** Playground build fails with
`ERR_INVALID_PACKAGE_CONFIG /playground/node_modules/next/dist/compiled/<sub>/package.json`.
The referenced `package.json` is missing — the directory exists but contains only `LICENSE`. Cause: a prior `npm install` (possibly from a different session or killed mid-flight) left `node_modules` in a partial/corrupt state.

**Failure:** Build gate halts immediately before TypeScript. No recovery from within the build — the install must be repaired.

**Fix:** `rm -rf playground/node_modules playground/.next && npm install` in the playground directory. Rebuild succeeds.

**Preventative check (to add to Phase 2 Clean in a future ship-it revision):** If any `node_modules/next/dist/compiled/*/` directory is missing its `package.json`, reinstall before proceeding. A lightweight version: if a previous session killed an `npm install` mid-flight, reinstall proactively. Keep as a documented pitfall for now; promote to procedure if it occurs again.

---

## REL-010 — Élan 2.9.0, yilangao.com 1.1.1, ASCII Art Studio 0.6.0 (2026-04-17)

**Scope:** 38 working-tree files across 7 dependency-ordered layer commits, 1 release commit, 1 dev patch bump on `dev` after merge (48 files shown in fast-forward diff including release artifacts)
**Semver:** Minor for Élan (2.8.1 → 2.9.0: new playground `sidebar.module.css`, `useScrollRestoration` hook, inline-edit and CursorThumbnail refinements). Patch for yilangao.com (1.1.0 → 1.1.1: homepage, project case study, and Etro seeding route refinements). Minor for ASCII Art Studio (0.5.4 → 0.6.0: new `SegmentedControl` primitive + dev script change).
**Previous release:** Élan 2.8.0, yilangao.com 1.1.0, ASCII Art Studio 0.5.3

**Incidents during release:**
- **REL-AP-005 triggered for the third time.** Untracked `src/lib/utils.ts` (shadcn `cn` + `tailwind-merge`) was present again as dead code with no imports and no `tailwind-merge` in `package.json`. **Resolution:** deleted in Phase 2 clean before staging. This is now the 3rd occurrence (REL-004, REL-005 context, REL-010) — **escalation criterion met, see Escalation Check below.**
- **Phase 2 macOS duplicate load was heavy.** 13 `* 2.*` junk files + a full `src/styles 2/` directory tree were untracked in the working tree from prior macOS Finder or iCloud sync duplication. All deleted in Phase 2 clean with no functional impact.
- **Vercel post-deploy poll:** playground (`yilangao-design-system`) deployment was **Queued** ~1m after push, matching REL-008/REL-009 pattern. Main site (`yilangao-portfolio`) project is not visible from repo root `vercel ls --prod` per REL-008 — `.vercel/project.json` links to playground.

**Build gate:** All three apps passed on first attempt. Playground build ~500s, main site build ~1234s (dominated by TypeScript), ASCII tool build ~210s. Same non-blocking Sass `darken()` deprecation warnings in `ProjectEditModal.module.scss` as REL-007/008/009.

**Layer classification notes:**
- 7 commits across 6 populated layers (L0 Config, L1 Docs, L3 Scripts, L5 New primitives, L7 Site components, L8 Frontend pages, L9 Playground). L2 Tokens, L4 Deletions, L6 `src/components/ui/` updates, L10 ASCII tool src were all empty.
- L3 captured a script-only change (`dev: next dev --webpack`) for both playground and ascii-tool — not a dependency add/remove. Template adapted via REL-AP-004 flexibility.
- New `ascii-tool/src/components/ui/segmented-control.tsx` is not yet wired into any ASCII tool page but its imports (`cn` from `@/lib/utils`, `tailwind-merge`, `clsx`) all resolve — passed REL-AP-005 dead code check because dependencies exist. Distinction: REL-AP-005 blocks commits only when imports fail to resolve, not when the component is simply unused.
- `src/hooks/use-scroll-restoration.ts` (new) was classified into L5 (new lib). The matching consumer change (`HomeClient.tsx` importing it) went into L8 — intermediate build state is fine because L5 commits the new file before L8 imports it.

**Escalation check (REL-AP-005, 3rd occurrence):**
REL-AP-005 (dead `src/lib/utils.ts` with missing `tailwind-merge` dependency) has now triggered 3 times. This is a **procedure gap** — the file keeps being regenerated (likely by automated scaffolding tools or editor templates that assume a shadcn/ui setup that this repo does not have). Promotion action: this gap should be addressed by adding a pre-Phase-1 check in the ship-it skill that explicitly looks for `src/lib/utils.ts` (and the twin `src/lib/utils 2.ts`) as a known-to-regenerate artifact, or by adding `src/lib/utils.ts` and `src/lib/utils 2.ts` to `.gitignore` so the file cannot be accidentally committed. Leaving as documented pitfall for now; propose `.gitignore` entry in the next content/engineering iteration session.

---

## REL-009 — Élan 2.8.0, yilangao.com 1.1.0, ASCII Art Studio 0.5.3 (2026-04-11)

**Scope:** 112 files merged to `main` via fast-forward: 11 dependency-ordered layer commits, 1 build-fix commit, 1 release commit, 1 dev patch bump on `dev` after merge
**Semver:** Minor for Élan (2.7.0 → 2.8.0: new CursorThumbnail, SiteFooter components + UI updates). Minor for yilangao.com (1.0.0 → 1.1.0: (site) route group migration, new page utilities). Patch for ASCII Art Studio (0.5.2 → 0.5.3: release sync, no new app code).
**Previous release:** Élan 2.7.0, ASCII Art Studio 0.5.2

**Incidents during release:**
- **Build gate: 3 TypeScript errors.** (1) Archived `archive/homepage-v1/` was not excluded from `tsconfig.json`, causing stale type errors from old `SiteFooter` props. **Resolution:** Added `archive` to tsconfig `exclude` array. (2) New `(site)/work/[slug]/page.tsx` used `slug` property not in `FALLBACK_PROJECT` type. **Resolution:** Added `slug` to fallback object. (3) `use-cursor-thumbnail.ts` had `clearTimeout(leaveTimerRef.current)` where TypeScript couldn't narrow past the null check through a ref. **Resolution:** Added non-null assertion `!` after the guard.
- **Website version:auto false positive.** `version:auto` detected page renames (`(frontend)/about → (frontend)/(site)/about`) as URL breaking changes and recommended Major (1.0.0 → 2.0.0). Route groups don't affect URLs in Next.js. **Resolution:** Manually corrected to Minor (1.1.0). This is a gap in the auto-analyzer's understanding of Next.js route groups.
- **Vercel post-deploy poll:** `vercel ls --prod` from repo root shows playground (Queued at poll time). Main site project not visible from repo root CLI context per REL-008.

**Build gate:** All three apps passed after fix commit. Same non-blocking Sass `darken()` deprecation warnings as REL-007/008.

**Layer classification notes:**
- 11 commits across 8 populated layers (L0 Config, L1 Docs, L2 Tokens, L3 Deps, L5 New Components, L6 UI Updates, L7 Site Components, L8 Frontend Pages split into 3 commits, L9 Playground).
- L8 split into route group migration (51 files), API routes + password gate (9 files), and homepage v1 archive (3 files) to keep commits focused.
- Git detected most `(site)` moves as renames — clean history.
- New lib files verified against REL-AP-005 (all imported by new pages, no third-party dep issues).
- No macOS duplicates or debug logs found in Phase 2 clean.

---

## REL-008 — Élan 2.7.0, ASCII Art Studio 0.5.2 (2026-04-08)

**Scope:** 46 files merged to `main` (39 working-tree changes plus release artifacts): 8 dependency-ordered layer commits, 1 release commit, 1 dev patch bump on `dev` after merge
**Semver:** Minor — `version:auto` promoted Élan 2.6.1 → 2.7.0 (new `MediaRenderer.module.scss` in a tracked component family); typography token/mixin expansion; DropdownMenu and portfolio/project surface updates
**Previous release:** Élan 2.6.0, ASCII Art Studio 0.5.1

**Incidents during release:**
- **Shell commit-message substitution:** `git commit -m "release: Élan $(node -p \"require('./elan.json')...\")"` failed in `bash` (bad escaping). **Resolution:** amended both the release commit and the post-merge dev-bump commit with literal version strings in the message.
- **Vercel post-deploy poll:** `vercel ls --prod` from repo root targets **yilangao-design-system** (playground) per `.vercel/project.json`; newest production deployment was **Queued** at poll time (~2m after push). **Resolution:** treat as in-flight; re-check dashboard if needed. Main site project (`yilangao-portfolio`) is not shown by default from this working directory.

**Build gate:** All three apps passed (`playground`, root main site, `ascii-tool`) on first attempt. Same non-blocking Sass `darken()` deprecation warnings in `ProjectEditModal.module.scss` as REL-007.

**Layer classification notes:**
- Phase 2 removed untracked macOS duplicate tree `src/styles 2/` (`* 2.*` junk); not merged.
- `npm run sync-tokens` run before ship commits; playground `prebuild` also runs sync-tokens — working tree stayed clean after builds.
- `MediaRenderer` new `.module.scss` grouped with `MediaRenderer.tsx` in one commit (REL-AP-003).
- `CHANGELOG.md` updated for 2.7.0; ASCII 0.5.2 noted as release sync without new app code in this batch.

---

## REL-007 — Élan 2.6.0, ASCII Art Studio 0.5.1 (2026-04-07)

**Scope:** 66 files across 10 layer commits + release commit + dev patch bump
**Semver:** Minor — new MediaRenderer component, 3 elan-visuals (CollaborationLoop, MaturityTimeline, SkillMap), halftone portrait login, new dependencies (d3-hierarchy, three, culori)
**Previous release:** Élan 2.5.0, ASCII Art Studio 0.5.0

**Incidents during release:** None. All 3 build gates passed on first attempt.

**Layer classification notes:**
- Phase 2 caught 6 tracked macOS duplicate files (e.g., `file 2.svg`, `renovate 2.json`) — these were pre-existing tracked junk, not from this session.
- `public/videos/portrait.mp4` (4.4MB) committed as a static asset for the halftone portrait effect. Acceptable size but worth monitoring if more videos are added.
- ASCII Art Studio released as 0.5.1 (patch) with no new changes — just the dev patch counter from REL-006.
- Layer 7 (site components) was the largest code addition: 6 new elan-visual files totaling ~2,400 lines.
- All new files passed the REL-AP-005 dead code check (imports verified for MediaRenderer, elan-visuals, HalftonePortrait, useInteractionVelocity).
- 2 Sass deprecation warnings in main site build (`darken()` in ProjectEditModal.module.scss) — non-blocking, tracked for future cleanup.

---

## REL-006 — Élan 2.5.0, ASCII Art Studio 0.5.0 (2026-04-06)

**Scope:** 104 files across 9 layer commits + release commit + 2 build-gate fix commits + dev patch bump
**Semver:** Minor — new Tooltip subsystem (InfoTooltip, TooltipProvider), block editor for inline editing, Etro API route, expanded content framework
**Previous release:** Élan 2.4.1, ASCII Art Studio 0.4.1

**Incidents during release:**

1. **Build gate failure #1 — type predicate on destructured binding** (TypeScript error)
   `ProjectClient.tsx` used `.filter(({ block }): block is ...` which TypeScript rejects — type predicates cannot reference destructured elements. Fixed by rewriting as `.filter((item): item is ...`.

2. **Build gate failure #2 — wrong pretext API** (TypeScript error)
   `TestimonialCard.tsx` called `pretext.layoutNextLineRange()` and `pretext.materializeLineRange()`, which don't exist on the main export (`layout.d.ts`). The correct API is `pretext.layoutNextLine()` which returns a `LayoutLine` with `.text` directly. Fixed by consolidating to `layoutNextLine`.

3. **REL-AP-005 triggered — dead `src/lib/utils.ts`** (caught in Phase 1)
   Same file from REL-004 was re-created — imports `tailwind-merge` (not installed), not imported by anything. Caught during Phase 1 classification per the pitfall check. Deleted before committing.

**Layer classification notes:**
- Largest release to date: 104 files across 9 layers (no empty layers except 4 and 10).
- Layer 1 (Docs) had 33 files — the content framework expansion (14 new doc files).
- Layer 5 applied REL-AP-003 (component family rule) for Tooltip directory.
- Layer 7 (Site components) had 18 files — the block editor subsystem is the largest single feature.
- 8 macOS duplicate junk files cleaned in Phase 2 (same `* 2.*` pattern as REL-004).

**Outcome:** All 3 builds passed after 2 fix commits. Fast-forward merge to main. Playground deployed Ready in 53s. Main site responding 200 at `https://new.yilangao.com`.

---

## REL-005 — Élan 2.4.1, ASCII Art Studio 0.4.1 (2026-04-03)

**Scope:** 15 files across 5 layer commits + release commit
**Semver:** Patch — accent token chroma optimization, rich text paragraph break fix, debug logging cleanup
**Previous release:** Élan 2.4.0, ASCII Art Studio 0.4.0

**Incidents during release:**

1. **ASCII tool build ENOTEMPTY** (transient, not a pitfall)
   `rm -rf ascii-tool/.next` and retry resolved it. Stale `.next/server` directory from a previous build couldn't be cleaned by Next.js.

**Layer classification notes:**
- No new files, no deletions — all 15 files were modifications (M).
- Clean 5-layer split: docs (5), tokens (1), site components (3), frontend pages (4), playground (2).
- No ambiguous classifications this release.

**Outcome:** All 3 builds passed (ASCII tool on second attempt after cache clear). Fast-forward merge to main. Playground deployed Ready in 53s. Main site responding 200 at `https://new.yilangao.com`.

---

## REL-004 — Élan 2.4.0, ASCII Art Studio 0.4.0 (2026-04-03)

**Scope:** 55 files across 7 layer commits + release commit + 1 fix commit
**Semver:** Minor — new site-level components (Footer, Navigation, Marquee, animations, theme), expanded color tokens, playground SCSS module migration
**Previous release:** Élan 2.3.0, ASCII Art Studio 0.3.0

**Incidents during release:**

1. **Build gate caught missing dependency** (new pitfall → REL-AP-005)
   `src/lib/utils.ts` (standard shadcn `cn` utility) imported `tailwind-merge` which was not installed. The file was also not imported by any other file (dead code). Removed the file; main site build passed on retry.

2. **Git push timeout** (transient, not a pitfall)
   First two `git push` attempts failed with `mmap failed: Operation timed out`. Fixed by increasing `http.postBuffer` and `pack.windowMemory` git config. Third attempt succeeded.

**Layer classification notes:**
- `src/lib/utils.ts` was classified as Layer 5 (new lib) and grouped with Layer 7 (site components). It turned out to be dead code — future classification should verify imports for new utility files before including them.
- All 17 macOS duplicate junk files (`* 2.*` pattern + `src/styles 2/` directory) cleaned in Phase 2.

**Outcome:** All 3 builds passed after fix commit. Fast-forward merge to main. Playground deployed Ready in 55s. Main site responding 200 at `https://new.yilangao.com`.

---

## REL-003 — Élan 2.3.0, ASCII Art Studio 0.3.0 (2026-04-03)

**Scope:** 92 files across 12 layer commits + release commit
**Semver:** Minor — new UI components (Eyebrow, Menu, TextRow), company password gate feature, new ASCII engines (dot-grid, image-filters), expanded Input/DropdownMenu/Kbd components
**Previous release:** Élan 2.2.0, ASCII Art Studio 0.2.1

**Incidents during release:**

1. **Branch switch blocked by uncommitted sync target** (→ REL-AP-001, occurrence #2)
   Playground build's `prebuild` step ran `sync-tokens.mjs`, which regenerated `playground/src/lib/tokens.ts` with 2 new lines. This file wasn't staged in the release commit. `git checkout main` failed. Fixed by amending the release commit to include the sync output.

**Layer classification notes:**
- Company password gate files (9 files spanning collections, lib, scripts, admin components, and frontend pages) were grouped as a single feature commit (Layer 7a) rather than splitting across Layers 5/7/8 — cohesive feature commits are easier to review.
- CMS collection admin group changes (Books, Experiments, Projects, Testimonials all changing `group` to "Content") were grouped with frontend pages in Layer 8 since they're trivial label changes.

**Outcome:** All 3 builds passed on first attempt. Fast-forward merge to main. Playground deployed Ready in 55s. Main site responding 200 at `https://new.yilangao.com`.

---

## REL-002 — Main site deployed to new.yilangao.com (2026-04-02)

**Scope:** First production deployment of the portfolio site. Documentation updates (4 files) + build fixes (5 files).
**Vercel project:** `yilangao-portfolio` (root dir `.`, production branch `main`)
**Domain:** `new.yilangao.com` (Cloudflare CNAME → `cname.vercel-dns.com`, grey cloud / DNS-only)

**Incidents during deployment:**

1. **Build failure #1 — Payload `importMap.js` gitignored** (→ ENG-096, EAP-060)
   Payload auto-generates `importMap.js` during local dev. The file was in `.gitignore`, so it never reached GitHub. Vercel build failed with `Module not found: Can't resolve '../importMap'` in three Payload admin files. Fixed by removing from `.gitignore` and committing the generated file.

2. **Build failure #2 — `resend` not in `package.json`** (→ ENG-096)
   The contact route used `await import("resend")` with a runtime guard and `@ts-expect-error`. Turbopack resolves all imports at build time regardless of runtime conditions. Fixed by adding `resend` to `package.json` and removing the `@ts-expect-error`.

**Documentation updates shipped with deployment:**
- `docs/architecture.md` §4: production deployment table, domain/DNS architecture, source code security, staged migration rationale, build boundaries
- `docs/engineering/deployment.md`: main site Vercel mapping, DNS config, env vars
- `docs/engineering/multi-app-architecture.md`: Section 9.6 production build boundaries
- `AGENTS.md`: App Registry with production URLs, Vercel project names, hosting columns

**Outcome:** Build succeeded after fix commit. Production deployment Ready in ~2 minutes. Domain verified, SSL provisioned by Vercel. Site accessible at `https://new.yilangao.com`.

---

## REL-001 — Élan 2.2.0, ASCII Art Studio 0.2.1 (2026-04-02)

**Scope:** 78 files across 10 layer commits + 2 build-gate fix commits + release/sync commits
**Semver:** Minor — new VerticalNav component, NavItem sub-components (NavItemChildren, NavItemTrigger), expanded design tokens (colors, motion, typography), Checkbox API expansion
**Previous release:** Élan 2.1.0, ASCII Art Studio 0.2.0

**Incidents during release:**

1. **Build gate failure #1 — wrong `SubsectionHeading` API** (→ REL-AP-002)
   Vertical-nav playground page passed `title` and `description` props to `SubsectionHeading`, which only accepts `children: string`. Fixed by replacing with `<SubsectionHeading>Subcomponents</SubsectionHeading>` and a separate `<p>` for the description.

2. **Build gate failure #2 — wrong `SourcePath` API** (→ REL-AP-002)
   Same page used `<SourcePath>path here</SourcePath>` (children) instead of `<SourcePath path="..." />`. Fixed by switching to the `path` prop.

3. **Branch switch blocked by uncommitted sync targets** (→ REL-AP-001)
   After `npm run version:release`, the auto-synced files (`playground/src/lib/elan.ts`, `ascii-tool/src/lib/version.ts`) were modified but not staged. `git checkout main` failed with "local changes would be overwritten." Fixed by committing sync targets before checkout.

**Layer classification notes:**
- NavItem files (new sub-components + modified parent) were grouped together in Layer 5 rather than splitting new files into Layer 5 and modified files into Layer 6. Component families should stay together. (→ REL-AP-003)
- Layer 3 (Dependencies) was a removal (tailwind-merge), not an addition. Template message adapted. (→ REL-AP-004)

**Outcome:** All 3 builds passed after fixes. Fast-forward merge to main. Vercel deploy status: Ready in ~2 minutes.

---
