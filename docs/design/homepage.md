<!-- graph metadata for docs knowledge graph (see docs/knowledge-graph.md) -->
---
type: spoke
id: design-homepage
topics:
  - design
  - portfolio
derivedFrom:
  - design.md
---

# Homepage Design

> Spoke file for `docs/design.md`. Return to the [hub](../design.md) for the Section Index.

## §15 Portfolio Grid Layout

**Source:** Session 2026-03-29, "case studies space is taking up a lot of space, not great for quick scanning"

### 15.1 Scannability Over Showcase

The homepage project grid optimizes for **breadth scanning**, not individual project showcase. A portfolio visitor's first action is assessing the range of work — companies, industries, project types — before committing to read any single case study. The grid must let the eye jump between tiles without sequential scrolling.

**Rule:** The homepage grid uses CSS columns masonry (`column-count`), not CSS Grid with row-based flow. Masonry packs cards efficiently by filling vertical gaps, maximizing the number of tiles visible in a single viewport.

### 15.2 Column Count

| Breakpoint | Columns | Rationale |
|------------|---------|-----------|
| Mobile (< md) | 1 | Single-column for readable card widths on narrow screens |
| Medium (md) | 2 | Enough density for scanning without cramming |
| Large (lg+) | 3 | Maximum density — more columns dilute individual card readability |

The user explicitly stated "two to three columns at maximum." Three columns is the upper bound.

### 15.3 Height Variation for Visual Interest

In a masonry layout, uniform card heights create a rigid grid that negates the waterfall effect. Height variation comes from aspect ratio differentiation:

| Card type | Image aspect ratio | Purpose |
|-----------|-------------------|---------|
| Featured | 4:3 | Slightly taller, draws more attention |
| Regular | 3:2 | Compact, efficient scanning |

Both types occupy the same column width. The height difference creates the waterfall stagger.

### 15.4 Layout Spacing — Enterprise Density

The homepage uses B2B-tight spacing throughout. Every value was audited against the §0 density mandate: if whitespace doesn't serve a clear separation purpose, remove it.

| Element | Token | Value | Rationale |
|---------|-------|-------|-----------|
| Layout top/bottom padding | `spacer-3x` | 24px | Enough to clear browser chrome, no more |
| Layout side padding (desktop) | `spacer-4x` | 32px | Standard layout margin |
| Sidebar-to-content gap | `spacer-4x` | 32px | Clear channel between sidebar and grid |
| Sidebar sections gap | `spacer-4x` | 32px | Separates identity/about/teams/links |
| Column gap | `spacer-1.5x` | 12px | Tight gutter — cards are the focus, not the space between them |
| Card margin-bottom | `spacer-1.5x` | 12px | Matches column gap for uniform density |
| Section label margin | `spacer-1.5x` | 12px | Subordinate label, minimal separation from content |

**Rule:** The first visible content must appear within the top 80px of the viewport. No dead zone at the top.

### 15.5 Card Density

Card info (title + category) uses compact padding: `$portfolio-spacer-1x` (8px) vertical, `$portfolio-spacer-0-25x` (2px) horizontal. The image is the primary visual; the text label is a quick identifier, not a content area.

---

## §16 Homepage Information Architecture

**Source:** Session 2026-03-29, hiring manager audit — "mobile experience squeezes, unnecessary tabs, follow Joseph's denser layout"

### 16.1 The Homepage Is Navigation

The homepage sidebar serves as the primary navigation surface. It does NOT need a separate `<Navigation />` bar — the identity block + Links section fulfill that role. Interior pages (case studies, about, experiments) use the shared `<Navigation />` component for consistency.

**Rule:** Every publicly reachable page must be accessible from the homepage sidebar Links section. If a page isn't worth linking from the sidebar, it shouldn't be a public route.

### 16.2 Navigation Link Set

The portfolio has exactly **two** navigation links: **About** and **Experiments**. These appear:
- In the homepage sidebar Links section (alongside social links)
- In the `<Navigation />` component on interior pages

Removed pages from navigation: Reading (low hiring-signal value), Contact (email CTA in footer is lower friction than a form page), Blog (empty page signals abandonment).

**Rule:** Navigation links must pass the hiring manager signal test: "Does visiting this page increase P(Alive)?" A reading list does not. An experiments page demonstrating technical craft does.

### 16.3 Teams + Links Layout — Context-Dependent Stacking

Teams and Links use a responsive 2-column grid (`.teamsAndLinks`). On **tight screens** (mobile/tablet) they sit side-by-side to conserve vertical space and get to work faster. On **wide screens** (desktop sidebar) they stack vertically — the sidebar has plenty of height and the vertical rhythm reads better.

| Breakpoint | Layout | Rationale |
|------------|--------|-----------|
| Default (< lg) | Side-by-side (`1fr 1fr`) | Save vertical space, work visible sooner |
| Large (lg+) | Stacked (`1fr`) | Sidebar has room; vertical flow matches other sidebar sections |

**Rule:** When the sidebar is the primary content column (mobile), pack information horizontally. When it's a secondary column alongside work (desktop), let it breathe vertically.

### 16.4 Mobile Density

On mobile, the sidebar stacks above the project grid. Every pixel of sidebar height is a pixel of project grid hidden below the fold. Mobile-specific spacing reductions:

| Element | Desktop | Mobile | Rationale |
|---------|---------|--------|-----------|
| Sidebar section gap | `spacing-07` (32px) | `spacing-05` (16px) | Work visible sooner |
| Layout padding | `spacing-06/07` | `spacing-05/04` | Tighter frame |
| Identity gap | `spacing-02` (6px) | `spacing-01` (2px) | Name+role+location are a single unit |
| Section label margin | `spacing-04` (12px) | `spacing-03` (8px) | Labels are subordinate |

**Rule:** Mobile sidebar content must be compact enough that the first project card is visible within ~1.5 screen heights of scrolling. If it takes more, tighten.
