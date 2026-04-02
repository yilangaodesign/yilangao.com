# Multi-App Architecture & URL Namespace Separation

> Spoke file for `docs/engineering.md`. Return to the [hub](../engineering.md) for the Section Index.

**Source:** User feedback, 2026-03-29 — "Why is the admin part using the same localhost? You might not want to use the same kind of URL for both the CMS and the design system."

## 9.1 The Current Architecture

This project runs four distinct concerns across three Next.js processes:

| Concern | Audience | Port | Route space | Process |
|---------|----------|------|-------------|---------|
| Public portfolio | Visitors | 4000 | `/`, `/reading`, etc. | Main site |
| CMS admin panel | Site owner (editor) | 4000 | `/admin/*` | Main site (shared) |
| Design system playground | Developers/designers | 4001 | `/tokens/*`, `/components/*` | Playground (separate) |
| ASCII Art Studio | Public users | 4002 | `/` (single-page) | ASCII tool (separate) |

The CMS admin and public site share a process and URL namespace. This is a **Payload CMS 3 design constraint** — Payload embeds into your Next.js app and serves admin UI at a configurable route prefix (default `/admin`). The ASCII Art Studio is a fully standalone app with its own dependencies (ffmpeg.wasm, idb-keyval) and its own version manifest (`ascii-studio.json`).

## 9.2 Known Trade-offs

**Shared process (portfolio + CMS on port 4000):**
- In production, `/admin` login page is publicly accessible (though auth-gated)
- Admin panel CSS/JS bundles are included in the production build even for public visitors
- A CMS crash or heavy admin operation can affect public page performance
- Route namespace collision risk if the portfolio ever needs `/admin` for portfolio content

**Separate process (playground on port 4001):**
- Clean separation — design system tooling never interferes with the live site
- Can be developed, started, and stopped independently
- Different deployment story (playground is dev-only, not deployed to production)

## 9.3 Architectural Decision Record

**Decision:** Accept Payload's embedded architecture for now. The trade-offs are manageable at current scale.

**When to revisit:**
- If the admin panel causes measurable performance impact on public pages
- If a third audience/concern needs to share port 4000 (the namespace is already at capacity with two)
- If the project moves to a multi-service deployment (e.g., separate CMS API server)

**Mitigation for production:**
- Add Next.js middleware to restrict `/admin` access by IP or auth header
- Consider `output: 'standalone'` builds that tree-shake unused admin routes from the public bundle (Payload's roadmap may address this)

## 9.4 The Principle — One Port, One Audience

Each port should ideally serve **one audience with one mental model**. When a port serves two audiences (visitors + editors), the risk of namespace collision, performance crosstalk, and deployment coupling increases. The playground gets this right (port 4001, developers only). The main site violates it out of framework necessity (Payload embeds into Next.js).

When adding new routes or concerns in the future:
1. **Ask first:** Who is the audience? Is it the same audience as an existing port?
2. **If different audience:** Prefer a new port (4002+) over cramming into an existing namespace.
3. **If same audience but different concern:** Use clear route prefixes and document the namespace allocation.

## 9.5 Route Namespace Allocation (Living Reference)

| Port | Prefix | Owner | Purpose |
|------|--------|-------|---------|
| 4000 | `/` | Portfolio | Public pages |
| 4000 | `/admin` | Payload CMS | Content management (framework-mandated) |
| 4000 | `/api` | Payload CMS | CMS REST/GraphQL API |
| 4001 | `/tokens` | Playground | Design token previews |
| 4001 | `/components` | Playground | Component previews |
| 4002 | `/` | ASCII Art Studio | Single-page ASCII art/video tool |

Update this table when adding new route prefixes or services. See also the **App Registry** in `AGENTS.md` for the authoritative list of all apps.

## 9.6 Production Build Boundaries

When Vercel builds the root Next.js app (`next build` at repo root), the build
includes **only** what the root `package.json` and `next.config.ts` reference:

| Included in root build | Why |
|------------------------|-----|
| `src/app/(frontend)/` — portfolio pages | Root app's page routes |
| `src/app/(payload)/` — CMS admin + API | Root app's page routes (Payload embedded) |
| `src/components/` — UI components, admin, inline-edit | Imported by pages above |
| `src/styles/` — SCSS tokens, mixins, custom properties | Imported by components above |
| `public/` — static assets at repo root | Next.js convention |

| NOT included in root build | Why |
|---------------------------|-----|
| `playground/` | Separate `package.json` + `next.config.ts` — requires its own Vercel project with root dir `playground/` |
| `ascii-tool/` | Separate `package.json` + `next.config.ts` — requires its own Vercel project with root dir `ascii-tool/` |

This boundary is **structural** (separate `package.json`, separate `next.config.ts`),
not configured. No build settings, `vercel.json`, or ignore patterns are needed to
exclude them — Next.js simply does not traverse into sibling app directories.

**Source code security:** The Élan DS components (`src/components/ui/`) ship as
compiled, minified, tree-shaken code inside the website build. SCSS source files,
token architecture, component TSX, and design system organizational structure are
never exposed to browsers or crawlers. Only compiled CSS (with hashed class names),
minified client JS, and HTML structure are publicly visible. Server Components are
never sent to the browser at all.

See `docs/architecture.md` §4 for the full deployment map and DNS configuration.
