# Information Architecture

> Spoke file for `docs/design.md`. Return to the [hub](../design.md) for the Section Index.

**Source:** Session 2026-03-29, sidebar taxonomy redesign.

### 11.1 Taxonomy by Design Task, Not Technical Ancestry

Component categories should answer "what kind of design problem am I solving?" — not "what kind of HTML element is this?" This is the difference between a developer's mental model (component types: primitives, atoms, molecules) and a designer's mental model (design tasks: inputting data, giving feedback, navigating).

**Wrong:** "UI Primitives" containing Button, Toast, Select, Card, Input, Divider, Menu — grouped because they are all "basic" components.

**Right:** Button and Card in "Foundational" (base building blocks), Toast in "Feedback & Overlay" (system responses to user action), Select and Input in "Forms & Controls" (data collection), Menu in "Navigation & Menus" (wayfinding).

The canonical question for placement: *"When a designer reaches for this component, what task are they in the middle of?"*

### 11.1b Conceptual Tiers in Navigation

**Source:** Session 2026-03-29, "put overview and styles together."

The sidebar has three conceptual tiers, each with its own section header:

| Tier | Section Header | Contains | Purpose |
|------|---------------|----------|---------|
| **Foundations** | `FOUNDATIONS` | Overview (system identity), Styles (design tokens) | What the system IS — its identity and visual atoms |
| **Components** | `COMPONENTS` | Base, Feedback, Overlay, Data Display | What the system BUILDS — reusable UI pieces |
| **Utility** | (bottom-pinned) | Archive | System housekeeping |

Items within the Foundations tier may be **direct-link** categories (`href` set, `links: []`) — they navigate directly without opening a flyout. This extends the `NavCategory` type with an optional `href` field. The Overview page is the canonical example: it's a page, not a category with sub-pages.

### 11.2 Curation as Authority

A design system that dumps 15 components into one category is a directory listing, not a design opinion. The system's credibility depends on editorial curation — every component having exactly one logical home signals that a human (or an opinionated system) made deliberate placement decisions. When the organization feels auto-generated, consumers won't trust the design guidance either.

### 11.3 Interaction Proximity (Extended Fitts's Law)

Interactive responses (search results, selection menus, confirmation dialogs) should appear adjacent to the trigger element, not at the viewport center. This extends Fitts's Law from §10.1 — the principle applies not just to hit zone sizing but to where the *response* appears:

- **Right:** Flyout panel appears next to the sidebar search icon (0px travel).
- **Wrong:** Centered modal appears at viewport center (300–500px travel from sidebar edge).

The exception is destructive confirmations and global alerts — these earn center-screen placement because they *should* interrupt flow.

### 11.4 Section Dividers for Conceptual Tiers

When a navigation list contains items that belong to different conceptual tiers (tokens vs. components, settings vs. content, system vs. user), insert visual dividers between tiers. These dividers are not decorative — they are semantic signals that declare "what follows is a different kind of thing." Without them, the user must infer the boundary from context, adding cognitive overhead in the exact place where navigation should be effortless.

- Dividers should be data-driven (a `section` field on the category data), not hardcoded in the render logic.
- Use `text-[9px]` uppercase labels when expanded, `border-t` when collapsed — same vertical space in both states.

### 11.5 Naming Collision Avoidance

**Source:** Session 2026-03-29, "Foundational" category vs "Foundations" section header.

When naming categories, tiers, and sections in a navigation hierarchy, **no two labels may share the same root word at visible proximity**. If a section header reads "Foundations," a category within it (or in an adjacent section) must not be "Foundational" — users parse them as related or redundant, undermining the taxonomy's clarity.

**Rules:**
- Audit names at each hierarchical level for shared stems. "Foundations" and "Foundational" share `found-` → collision.
- Prefer short, distinct nouns over adjective forms: "Base" instead of "Foundational" (both mean "bottom layer," but "Base" has no stem overlap with "Foundations").
- This applies cross-tier: a section header collides with any label the user can see simultaneously, not just labels within the same section.

**Incident:** FB-034 (2026-03-29) — "Foundations" section header and "Foundational" component category caused user confusion. Renamed to "Base."

### 11.6 Vertical Real Estate Economy

In a sidebar, every item competes for screen space. Strategies for reducing vertical footprint without reducing capability:

- **Collapse flat lists into expandable categories**: 5 token links as a flat list → 1 "Tokens" category that expands on hover/click. Saves 4 rows.
- **Progressive disclosure via flyouts**: Category icons in collapsed mode reveal link lists on hover. The full list exists but consumes zero vertical space until needed.
- **Group sub-headers inside flyouts**: Add structure within flyouts rather than adding nesting depth to the sidebar itself.
