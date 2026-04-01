# Changelog — Élan Design System

All notable changes to the Élan design system are documented in this file.
Format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).
Versioning follows [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.0.0] — 2026-04-01

Major release with 19 new design system components, playground architecture overhaul, and expanded documentation.

### Added

- **19 new design system components**: ArrowReveal, CommandMenu, DescriptionList, ExpandCollapse, FadeIn, Footer, InlineCode, Kbd, Marquee, MountEntrance, NavItem, Navigation, ScrollSpy, Sheet, StaggerChildren, Table, TestimonialCard, ThemeProvider, ThemeToggle
- **Shared hooks**: `useMediaQuery`, `useMounted`, `useSafeTriangle`
- **Shared utilities**: `src/lib/utils.ts`
- **7 new playground component pages**: command-menu, description-list, inline-code, kbd, nav-item, sheet, table
- **Playground inline-edit system**: EditButton, inline-edit provider and components
- **Playground motion utilities**: shared motion token helpers
- **6 new cursor skills**: checkpoint, cms-parity, content-iteration, cross-app-parity, orchestrator, playground
- **Expanded documentation**: hub-and-spoke engineering docs, design topic files, doc audit log

### Changed

- **Playground architecture**: migrated from local component re-implementations to `@ds/*` imports from production source — playground pages are now thin harnesses, not parallel implementations
- **Badge, Button, Card**: refined APIs, updated SCSS modules
- **Color tokens**: updated `_colors.scss` with new semantic tokens (`$portfolio-text-tertiary`, `$portfolio-overlay-black-40`)
- **Frontend pages**: HomeClient, AboutClient, ReadingClient, ProjectClient, motion page updated for new component APIs
- **Playground shell**: sidebar, archive components, component-preview, theme-toggle all updated
- **ESLint config**: updated rules
- **Agent knowledge base**: AGENTS.md rewritten with orchestration, multi-category classification, and refined guardrails

### Removed

- **Playground local component copies**: `playground/src/components/ui/Card/` and `playground/src/components/ui/Input/` deleted in favor of `@ds/*` design system imports (BREAKING)
- **Deprecated ThemeToggle SCSS module**: `src/components/ThemeToggle.module.scss` removed, replaced by `ui/ThemeToggle/` module

### Fixed

- **Version mismatch**: dev version was 1.1.0 (minor) when scope warranted major bump — corrected to 2.0.0

---

## [1.0.0] — 2026-03-29

Initial versioned release. Establishes the full design system, CMS infrastructure, portfolio site, and tooling baseline.

### Added

- **Color tokens**: Full Carbon-influenced palette (gray, blue, teal, green, red, orange, purple, cyan, magenta, yellow) with 13-step scales, plus semantic tokens for text, background, border, interactive, and support roles
- **Typography tokens**: Geist Sans / Geist Mono font stacks, 8-step type scale (12–48 px), 5 weight levels, 5 leading values, 5 tracking values
- **Spacing tokens**: 13-step component spacing scale (2–128 px), 7-step layout spacing scale (16–128 px), 4 container widths
- **Motion tokens**: 4 durations (fast/moderate/slow/slower), 4 easing curves (standard/entrance/exit/expressive), 6-step z-index scale
- **Elevation tokens**: 6-step shadow scale (none–overlay), 7-step radius scale (none–full)
- **Breakpoint tokens**: 5 breakpoints (sm–2xl) with media query helpers and reduced-motion query
- **Mixins**: Interactive (focus-ring, hover-lift, press-scale, reduced-motion), layout (container, stack, grid, sidebar), typography (body, heading, caption, label, mono-data)
- **Components**: FadeIn, StaggerChildren, MountEntrance, ExpandCollapse, ArrowReveal, Marquee, ScrollSpy, AdminBar, EditButton, RefreshRouteOnSave
- **CMS collections**: Experiments, Testimonials (Payload CMS)
- **Portfolio pages**: Home, About, Work/[slug], Contact, Reading, Experiments — all with client-side components
- **Admin tooling**: AdminBar overlay, EditButton shortcut, admin-auth library, API seed route
- **Playground**: Token preview pages (colors, typography, spacing, motion, elevation, breakpoints), component preview pages (ScrollSpy, ThemeToggle), sidebar navigation, theme switching, Élan version footer
- **Token sync pipeline**: `npm run sync-tokens` regenerates playground TypeScript data from SCSS source of truth
- **Versioning infrastructure**: `elan.json` manifest, version bump/release scripts, CHANGELOG
- **Documentation framework**: design.md, engineering.md, content.md with anti-pattern catalogs, feedback logs, and port registry
- **Cursor skills**: design-iteration, engineering-iteration, doc-audit workflows
- **Two-branch model**: dev (working) + main (stable checkpoints) with version-gated merges
