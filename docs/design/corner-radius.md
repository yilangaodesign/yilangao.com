# Corner Radius (B2B Sharp)

> Spoke file for `docs/design.md`. Return to the [hub](../design.md) for the Section Index.

**Severity: High** — Excessive rounding undermines the professional, tool-like aesthetic expected in B2B products.

### 8.1 Radius Scale

| Class | Value | Use |
|-------|-------|-----|
| `rounded-none` | 0px | Tables, full-bleed containers, dividers |
| `rounded-sm` | 2px | **Default for everything** — buttons, cards, inputs, nav links, badges, code blocks, interactive elements |
| `rounded` | 4px | Rarely — only when a slightly softer edge is intentional (e.g., modal dialogs) |
| `rounded-full` | 9999px | **Only** for progress bars, pills, and avatars where the shape is structural |

### 8.2 Rules

- **Never use `rounded-md` (6px), `rounded-lg` (8px), `rounded-xl` (12px), or `rounded-2xl` (16px).** These are consumer-grade radii that look out of place in a B2B tool.
- The default for any new element is `rounded-sm` (2px). If you're unsure, use `rounded-sm`.
- `rounded-full` is reserved for elements whose identity depends on being circular or pill-shaped.
- When in doubt, prefer sharper. A 0px corner is always acceptable; an 8px corner rarely is.

### 8.3 Rationale

B2B products communicate precision, density, and utility. Large corner radii signal friendliness and approachability — appropriate for consumer apps but incongruent with professional tools. The 0–2px range keeps edges crisp while avoiding the harshness of perfectly square corners.
