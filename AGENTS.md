<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

<!-- BEGIN:architecture -->
# Architecture

**Full architecture doc:** [`docs/architecture.md`](docs/architecture.md)

Read this doc before making structural changes. It covers:
- How the design system package, main site, and playground UI relate
- Publishing flow (GitHub Packages → Renovate → consumer PRs)
- Deployment strategy (main site + playground as separate Vercel projects)
- Known architectural tensions (dual token sources, missing package dep, playground coupling)
<!-- END:architecture -->

<!-- BEGIN:shared-design-system -->
# Centralized Design System (npm package)

The design system is published as **`@yilangaodesign/design-system`** on GitHub
Packages. Source repo: https://github.com/yilangaodesign/design-system

This project consumes the package — it does NOT own the tokens or mixins locally.
To modify the design system, make changes in the design-system repo, publish a
new version, then update the dependency here.

- **SCSS barrel**: `@use '@yilangaodesign/design-system/scss' as *`
- **SCSS sub-modules**: `@use '@yilangaodesign/design-system/scss/tokens/colors' as *`
- **CSS custom properties**: `@import '@yilangaodesign/design-system/css/tokens'`
- **React components**: `import { FadeIn } from '@yilangaodesign/design-system'`
- **Design docs**: shipped with the package under `docs/`

**Local `src/styles/` still exists** for site-specific overrides and mixins not
yet promoted to the shared package. When adding new tokens/mixins, decide
whether they belong in the package (shared across projects) or locally.

**Renovate** is configured (`renovate.json`) to auto-create PRs when a new
version of the design system is published. Review the changelog and merge.
<!-- END:shared-design-system -->

<!-- BEGIN:archive-rules -->
# Archive — Cold Storage

`/archive/` contains explored-but-shelved code (components, tokens, styles,
pages) from past experiments.

**Agent rules:**
1. Do NOT reference or import anything from `/archive/` unless the user
   explicitly asks you to look at past explorations.
2. Do NOT include `/archive/` contents in search results during normal work.
3. When the user decides to shelve code, move it to the appropriate
   `archive/experiment-XX/` or `archive/shared/` subdirectory and add a brief
   comment at the top of the file noting its origin and why it was shelved.

See `archive/README.md` for the full convention.
<!-- END:archive-rules -->

<!-- BEGIN:component-registry -->
# Component Registry

`archive/registry.json` is the **single source of truth** for all design system
artifacts — both active and archived. Every component, token, style, and page
must have an entry in this file.

## When creating a new artifact

Add an entry to `archive/registry.json` with these required fields:

```json
{
  "id": "<experiment>-<kebab-name>",
  "name": "Human-Readable Name",
  "type": "Component | Page | Token | Style",
  "experiment": "experiment-XX | shared",
  "status": "active",
  "description": "What this artifact does.",
  "sourcePath": "src/path/to/file",
  "createdAt": "<ISO 8601 timestamp>",
  "createdBy": "user | cursor",
  "origin": {
    "type": "custom | library | hybrid",
    "library": "Library Name (if applicable)",
    "url": "https://library-url (if applicable)"
  },
  "tags": ["relevant", "tags"],
  "hasPreview": false
}
```

## When archiving an artifact

Set `status` to `"archived"` and populate the archive-specific fields:
`archivePath`, `archivedAt`, `archivedBy`, `reason`. Move the file from `src/`
to the appropriate `archive/` subdirectory.

## When restoring an artifact

Set `status` back to `"active"` and remove the archive-specific fields. Move
the file from `archive/` back to its `sourcePath`.

## Origin types

- **custom**: Built from scratch, no external library dependency
- **library**: Thin wrapper or direct usage of an open-source library
- **hybrid**: Custom code built on top of a library (e.g., custom animation
  component using Framer Motion)
<!-- END:component-registry -->

<!-- BEGIN:port-registry -->
# Port Registry

**Live ledger:** [`docs/port-registry.md`](docs/port-registry.md)

All dev servers in this project MUST use ports in the **4000–5000** range.
Ports below 4000 (e.g. 3000, 3001) are reserved for other projects and must
NEVER be used.

**Agent protocol — follow every time, no exceptions:**

1. **Before starting any server:** Read `docs/port-registry.md` to check
   the service's default port and current state.
2. **After starting a server:** Update the ledger — set `Current Port`,
   `Status` to `running`, record the `PID`, and append a Change Log entry.
3. **After stopping a server:** Update the ledger — set `Current Port` to
   `—`, `Status` to `stopped`, clear the `PID`, and append a Change Log entry.
4. **If the default port is occupied:** Pick the next free port in 4000–5000,
   start the service there, set `Status` to `temporary`, and record the
   reason in both the `Notes` column and the Change Log.
5. **When the conflict resolves:** Move back to the default port, update
   status to `running`, and log the change.
6. **NEVER** start a server on a port outside 4000–5000.
7. **NEVER** kill processes on ports outside 4000–5000 unless explicitly asked.
<!-- END:port-registry -->

<!-- BEGIN:design-system-rules -->
# Design System Feedback Loop

Before any UI work, read the design docs shipped with `@yilangaodesign/design-system`:
- `node_modules/@yilangaodesign/design-system/docs/design.md`
- `node_modules/@yilangaodesign/design-system/docs/design-anti-patterns.md`

When processing user design feedback, activate the skill at
`.cursor/skills/design-iteration/SKILL.md`. After resolving feedback, update
the design docs in the **design-system repo** (not this repo) so all consumers
benefit. See `.cursor/rules/design-system.mdc` for full protocol.
<!-- END:design-system-rules -->

<!-- BEGIN:engineering-feedback-loop -->
# Engineering Feedback Loop

Before any code work, read `docs/engineering.md` and
`docs/engineering-anti-patterns.md`. When the user reports a bug,
broken feature, data sync issue, or process failure, activate the skill at
`.cursor/skills/engineering-iteration/SKILL.md`. After resolving the
issue, always update the engineering docs. See
`.cursor/rules/engineering.mdc` for full protocol.

**Dual-track routing:** Design issues ("it looks wrong") go to the design
track. Engineering issues ("it doesn't work / show up") go to the
engineering track. See the routing table in `.cursor/rules/engineering.mdc`.

**Token sync:** Tokens now live in the `@yilangaodesign/design-system` package.
To modify tokens, update the design-system repo and publish a new version.
After updating the dependency here, run `npm run sync-tokens` if the
playground needs regenerated token bindings.
<!-- END:engineering-feedback-loop -->
