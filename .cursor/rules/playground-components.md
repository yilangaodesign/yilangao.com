---
globs: playground/src/app/components/**
---

# Playground Component Pages — Hard Guardrails

**STOP. Read `.cursor/skills/playground/SKILL.md` before writing any code in this directory.**

## Flush-and-Restart Gate (BLOCKING — runs after EVERY edit)

**You are editing a playground file. When you finish, you MUST flush and restart before responding to the user.** Turbopack HMR does not reliably deliver changes to the playground. This has failed 6+ times. Do not skip this.

1. Kill server: `lsof -ti :4001 | xargs kill -9`
2. Clear cache: `rm -rf playground/.next`
3. Restart: `npm run playground` (background)
4. Wait for 200: `curl -s -o /dev/null -w "%{http_code}" http://localhost:4001/components/<slug>`
5. Verify your change: `curl -s http://localhost:4001/components/<slug> | grep '<string from your edit>'`
6. THEN respond.

## Intent Gate (Central Guardrail)

**BEFORE editing**, classify the task per `AGENTS.md` Engineering guardrail #22 (Intent Gate):
- **Component visual** changes (how the component looks/behaves) → Edit `src/components/`, NOT this file. The playground auto-updates via `@ds/*` imports.
- **Documentation / page structure** changes (demo sections, props tables, code examples, new parity pages) → Edit this file. This is legitimate.
- **Shell** changes (sidebar, layout, IA, theme, ComponentPreview rendering) → Edit `playground/src/components/` or `playground/src/app/layout.tsx`, not this file.
- **Ambiguous** → Ask the user before proceeding.

## Non-Negotiable

1. **NEVER** re-implement a design system component — import it via `@ds/*` (maps to `../src/components/ui/*`) or `@site/*` (maps to `../src/components/*`). A playground page is a thin harness, not a second implementation.
2. **NEVER** hardcode hex values, pixel values, or Tailwind default palette colors (`emerald-600`, `red-500`, etc.) when a design token CSS variable exists in `playground/src/app/globals.css`. Always use `var(--token-name)` references.
3. **NEVER** use inline `style={{}}` — use Tailwind classes or CSS custom properties.
4. **BEFORE completing any page**, verify: all colors use token vars, all spacing uses token vars or Tailwind token classes, no raw arbitrary values when tokens exist. If any check fails, fix it before outputting.
