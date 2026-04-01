# Typography System

> Spoke file for `docs/design.md`. Return to the [hub](../design.md) for the Section Index.

**Severity: Foundational** — Typography tokens and semantic mixins define the hierarchy, density, and readability of every screen. This section codifies font role assignments, the mixin catalogue, pairing rules, and enterprise compact guidelines. Informed by an audit of Goldman Sachs OneGS and IBM Carbon design systems.

**Source files:**
- Tokens: `src/styles/tokens/_typography.scss`
- Mixins: `src/styles/mixins/_typography.scss`
- Playground mirror: `playground/src/lib/tokens.ts`

### 18.1 Font Role Assignments

Every font family has exactly one permitted role. Using a font outside its role is a bug.

| Font | Token | Role | Permitted contexts |
|------|-------|------|--------------------|
| **Geist Sans** | `$portfolio-font-sans` | Primary UI | Headings, subtitles, body, labels, captions, stats, legal, helper text — all interface text |
| **Georgia** | `$portfolio-font-serif` | Quotes only | Pull quotes, block quotes, testimonial text, case study epigraphs. NEVER headings, body, or labels. Even more selective than OneGS (which uses serif for headlines). |
| **Geist Mono** | `$portfolio-font-mono` | Code only | Code blocks, inline code, terminal output, build hashes. NEVER data numbers, table columns, or stats. Use `font-variant-numeric: tabular-nums` on Geist Sans for numeric alignment. |
| **Geist Pixel \*** | `$portfolio-font-pixel-*` | Decorative accent | NEVER in interface elements. Only with explicit user instruction. No semantic mixins exist for pixel fonts. |

### 18.2 Semantic Mixin Catalogue (28 mixins, 9 categories)

All mixins are in `src/styles/mixins/_typography.scss`. Usage: `@include heading-1;`

#### Headings — Geist Sans

| Mixin | Size | Weight | Leading | Tracking | Use |
|-------|------|--------|---------|----------|-----|
| `heading-display` | 6xl (60px) | Bold 700 | Tight 1.1 | Tight -0.02em | Hero sections |
| `heading-1` | 5xl (48px) | Bold 700 | Tight 1.1 | Tight -0.02em | Page titles |
| `heading-2` | 4xl (36px) | Semibold 600 | Snug 1.25 | Tight -0.02em | Section titles |
| `heading-3` | 3xl (30px) | Semibold 600 | Snug 1.25 | Normal | Subsection titles |

Fluid variants available: `heading-display-fluid`, `heading-1-fluid`, `heading-2-fluid`, `heading-3-fluid` — use `clamp()` to scale between mobile and desktop.

#### Subtitles — Geist Sans (adopted from OneGS)

| Mixin | Size | Weight | Leading | Use |
|-------|------|--------|---------|-----|
| `subtitle-1` | xl (20px) | Semibold 600 | Snug 1.25 | Section subheading |
| `subtitle-1-bold` | xl (20px) | Bold 700 | Snug 1.25 | Emphasized subheading |
| `subtitle-2` | lg (18px) | Medium 500 | Snug 1.25 | Card/component subheading |
| `subtitle-2-bold` | lg (18px) | Bold 700 | Snug 1.25 | Emphasized card subheading |
| `subtitle-3` | base (16px) | Medium 500 | Snug 1.25 | Inline subheading |
| `subtitle-3-bold` | base (16px) | Bold 700 | Snug 1.25 | Emphasized inline subheading |

#### Body — Geist Sans (weight matrix from OneGS, compact from Carbon)

| Mixin | Size | Weight | Leading | Use |
|-------|------|--------|---------|-----|
| `body-lg` | lg (18px) | Regular 400 | Normal 1.5 | Editorial, long-form |
| `body-lg-light` | lg (18px) | Light 300 | Normal 1.5 | Secondary/supporting large text |
| `body-base` | base (16px) | Regular 400 | Normal 1.5 | Standard body |
| `body-base-medium` | base (16px) | Medium 500 | Normal 1.5 | Emphasized body inline |
| `body-base-light` | base (16px) | Light 300 | Normal 1.5 | Secondary body |
| `body-sm` | sm (14px) | Regular 400 | Normal 1.5 | Dense UI body |
| `body-sm-medium` | sm (14px) | Medium 500 | Normal 1.5 | Emphasized small text |
| `body-compact` | sm (14px) | Regular 400 | Compact 1.15 | Dense panels, sidebars, data tables |
| `body-compact-xs` | xs (12px) | Regular 400 | Compact 1.15 | Very dense tables, metadata rows |

#### Quotes — Georgia (adopted from OneGS + Carbon)

| Mixin | Size | Weight | Leading | Use |
|-------|------|--------|---------|-----|
| `quote-lg` | 2xl (24px) | Regular 400 | Relaxed 1.625 | Pull quotes, testimonials |
| `quote-base` | xl (20px) | Regular 400 | Relaxed 1.625 | Inline block quotes |
| `quote-sm` | lg (18px) | Regular 400 | Relaxed 1.625 | Small quotes, attribution |

All quote mixins set `font-style: italic`.

#### Captions — Geist Sans (from OneGS)

| Mixin | Size | Weight | Leading | Use |
|-------|------|--------|---------|-----|
| `caption` | xs (12px) | Regular 400 | Normal 1.5 | Image captions, timestamps |
| `caption-sm` | 2xs (8px) | Regular 400 | Compact 1.15 | Metadata, dense table secondary info |

#### Labels — Geist Sans

| Mixin | Size | Weight | Leading | Use |
|-------|------|--------|---------|-----|
| `label` | xs (12px) | Medium 500 | Normal 1.5 | Uppercase, wider tracking. Field labels, category tags. |

#### Utility — Geist Sans (from Carbon)

| Mixin | Size | Weight | Leading | Color | Use |
|-------|------|--------|---------|-------|-----|
| `helper-text` | xs (12px) | Regular 400 | Normal 1.5 | Helper (subtle) | Form descriptions below fields |
| `legal` | xs (12px) | Regular 400 | Normal 1.5 | Secondary | Footer copyright, disclaimers |

#### Code — Geist Mono (replaces former `mono-data`)

| Mixin | Size | Weight | Leading | Use |
|-------|------|--------|---------|-----|
| `code-lg` | base (16px) | Regular 400 | Normal 1.5 | Code blocks, large snippets |
| `code-base` | sm (14px) | Regular 400 | Normal 1.5 | Inline code, terminal output |
| `code-sm` | xs (12px) | Regular 400 | Compact 1.15 | Annotations, build hashes |

#### Stats — Geist Sans (adapted from OneGS)

| Mixin | Size | Weight | Leading | Use |
|-------|------|--------|---------|-----|
| `stat-lg` | 7xl (72px) | Light 300 | Tight 1.1 | Hero numbers, KPI dashboards |
| `stat-base` | 5xl (48px) | Light 300 | Tight 1.1 | Secondary stat callouts |
| `stat-sm` | 3xl (30px) | Medium 500 | Snug 1.25 | Tertiary stat callouts |

All stat mixins set `font-variant-numeric: tabular-nums`.

Fluid variants available: `stat-lg-fluid`, `stat-base-fluid`.

### 18.3 Pairing Rules (adopted from Carbon)

Use these pairings to maintain consistent vertical rhythm:

| Heading | Pairs with body | Context |
|---------|----------------|---------|
| `heading-display` | `body-lg` | Hero sections, landing pages |
| `heading-1` | `body-lg` or `body-base` | Page-level content |
| `heading-2` | `body-base` | Section content |
| `heading-3` | `body-sm` or `body-compact` | Subsections, cards |
| `subtitle-1` | `body-base` | Feature descriptions |
| `subtitle-2` | `body-sm` | Card content |
| `subtitle-3` | `body-compact` or `body-compact-xs` | Dense list items, table headers |

### 18.4 Enterprise Compact Guidelines

This is a B2B enterprise SaaS product. Dense, compact UI is the norm.

**When 8px (2xs) is acceptable:**
- `caption-sm`: metadata rows in data tables, secondary timestamps, build version strings
- Contexts where the information is supplementary and the user is not expected to read continuously

**When 12px (xs) is the floor:**
- `caption`, `label`, `helper-text`, `legal`, `code-sm`: any text the user needs to read and act on
- Form labels, error messages, navigation items

**When 14px (sm) is the default:**
- `body-sm`, `body-compact`, `code-base`: standard dense UI body text
- Table cell content, sidebar items, dropdown options

**Productive vs Expressive contexts (concept from Carbon):**
- **Productive contexts** (admin panels, data tables, settings, edit mode): prefer `body-sm`, `body-compact`, `body-compact-xs`, `caption-sm`, `subtitle-3`
- **Expressive contexts** (case studies, about page, testimonials): prefer `body-lg`, `body-base`, `quote-lg`, `heading-display-fluid`, `stat-lg-fluid`

### 18.5 Type Scale Reference

| Token | rem | px | Added in |
|-------|-----|-----|----------|
| `$portfolio-type-2xs` | 0.5 | 8 | Typography revamp (OneGS minimum) |
| `$portfolio-type-xs` | 0.75 | 12 | Original |
| `$portfolio-type-sm` | 0.875 | 14 | Original |
| `$portfolio-type-base` | 1 | 16 | Original |
| `$portfolio-type-lg` | 1.125 | 18 | Original |
| `$portfolio-type-xl` | 1.25 | 20 | Original |
| `$portfolio-type-2xl` | 1.5 | 24 | Original |
| `$portfolio-type-3xl` | 1.875 | 30 | Original |
| `$portfolio-type-4xl` | 2.25 | 36 | Original |
| `$portfolio-type-5xl` | 3 | 48 | Original |
| `$portfolio-type-6xl` | 3.75 | 60 | Original |
| `$portfolio-type-7xl` | 4.5 | 72 | Typography revamp (stat display) |
| `$portfolio-type-8xl` | 6 | 96 | Typography revamp (hero stat display) |

### 18.6 Weight Reference

| Token | Value | Added in |
|-------|-------|----------|
| `$portfolio-weight-thin` | 100 | Typography revamp |
| `$portfolio-weight-extralight` | 200 | Typography revamp |
| `$portfolio-weight-light` | 300 | Original |
| `$portfolio-weight-regular` | 400 | Original |
| `$portfolio-weight-medium` | 500 | Original |
| `$portfolio-weight-semibold` | 600 | Original |
| `$portfolio-weight-bold` | 700 | Original |

### 18.7 Migration Candidates (Phase 6 — Incremental)

These components use raw typography tokens where semantic mixins would be more appropriate. Migrate them as each component is touched for other work.

**Serif in non-quote contexts (violates font role rules):**
- `src/app/(frontend)/contact/page.module.scss` — `.heading` uses serif for a decorative heading. Should evaluate switching to `heading-2-fluid` (sans) or `quote-lg` if the intent is editorial.
- `src/app/(frontend)/contact/page.module.scss` — `.quoteIcon` uses serif for a quote mark glyph. Acceptable as decorative accent.
- `src/app/(frontend)/experiments/page.module.scss` — `.heading` and `.rowTitle` use serif for display headings. Should evaluate switching to heading-fluid variants (sans).

**Mono in non-code contexts:**
- Most mono usage across the codebase (`elan-visuals`, `page.module.scss`, etc.) is for code-like annotations, token names, and technical metadata. These are legitimate code contexts per the typography rules. No migration needed.

**Components with hardcoded px sizes instead of tokens:**
- `src/components/elan-visuals/elan-visuals.module.scss` — many instances of `font-size: 10px`, `9px`. These should eventually use `$portfolio-type-2xs` (8px) or `$portfolio-type-xs` (12px) depending on density needs.
- Various components using `font-size: 11px` — not on the token scale. Evaluate case-by-case.
