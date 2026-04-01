---
globs: playground/src/app/components/**
---

# Playground Component Pages — Hard Guardrails

**STOP. Read `.cursor/skills/playground/SKILL.md` before writing any code in this directory.**

## Intent Gate (Central Guardrail)

**BEFORE editing**, classify the task per `AGENTS.md` Engineering guardrail #18:
- **Component visual** changes (how the component looks/behaves) → Edit `src/components/`, NOT this file. The playground auto-updates via `@ds/*` imports.
- **Documentation / page structure** changes (demo sections, props tables, code examples, new parity pages) → Edit this file. This is legitimate.
- **Shell** changes (sidebar, layout, IA, theme, ComponentPreview rendering) → Edit `playground/src/components/` or `playground/src/app/layout.tsx`, not this file.
- **Ambiguous** → Ask the user before proceeding.

## Non-Negotiable

1. **NEVER** re-implement a design system component — import it via `@ds/*` (maps to `../src/components/ui/*`) or `@site/*` (maps to `../src/components/*`). A playground page is a thin harness, not a second implementation.
2. **NEVER** hardcode hex values, pixel values, or Tailwind default palette colors (`emerald-600`, `red-500`, etc.) when a design token CSS variable exists in `playground/src/app/globals.css`. Always use `var(--token-name)` references.
3. **NEVER** use inline `style={{}}` — use Tailwind classes or CSS custom properties.
4. **BEFORE completing any page**, verify: all colors use token vars, all spacing uses token vars or Tailwind token classes, no raw arbitrary values when tokens exist. If any check fails, fix it before outputting.
