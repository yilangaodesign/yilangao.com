# Tooltip

> Spoke file for `docs/design.md`. Return to the [hub](../design.md) for the Section Index.

## Terminology

- **Caret** = the triangular pointer from the tooltip container to the trigger. Radix calls this "Arrow" in its API; we call it "caret" in A-Line design language.
- **Trigger** = the element that activates the tooltip (info icon, button, text, etc.).
- **Placement** = where the tooltip appears relative to the trigger, defined as side + align.
- **Info icon** = the circled "i" icon that signals "hover for more info."

## Positioning

The tooltip uses **Radix's built-in Floating UI as the sole positioning engine**. No custom hooks or manual viewport measurement.

### Smart Defaults

| Component | Default `side` | Default `align` | Rationale |
|-----------|---------------|-----------------|-----------|
| `Tooltip` | `"top"` | `"center"` | Industry convention (Ant, Carbon, Material). |
| `InfoTooltip` | `"top"` | `"start"` | Body extends rightward, away from the text it explains. |

### Caret Inset (arrowPadding)

The caret must never sit flush against the rounded corner of the tooltip container. `arrowPadding` is set to **4px** (`radius-sm`) — equal to the container's border-radius. This guarantees the caret always clears the radius zone, maintaining a crisp geometric separation between the sharp triangle and the rounded box edge.

Exception: `caret="center"` forces dead-center placement with `arrowPadding={0}`, since centering is the explicit intent and the caret will be far from any corner.

This is an instance of the general principle: **overlay pointers on rounded containers must be inset by at least the container's border-radius.** See `docs/design/spacing.md` §1.7.

### How Radix Handles Edge Cases

- **Flipping:** If `side="top"` has no room, Radix flips to `"bottom"` automatically.
- **Shifting:** `sticky="partial"` shifts the tooltip inward when it would bleed past viewport edges. The caret stays connected to the trigger.
- **Collision padding:** Default 8px (`spacer-1x`) safe margin from all viewport edges.
- **Scroll/resize:** Radix updates position internally via Floating UI.

### When to Use Manual Overrides

Pass explicit `side` or `align` only when the layout context is known and the default would be wrong:
- Sidebar nav items: `side="right"` (tooltip should extend into the content area, not over the sidebar).
- Bottom-anchored toolbars: `side="top"` is already the default, but if the toolbar floats at page bottom, confirm the default works.
- Right-to-left layouts: Consider `align="end"` for InfoTooltip.

All other cases should use defaults and let Radix handle edge cases.

## Gap Distance (sideOffset)

| Size | sideOffset | Token | Rationale |
|------|-----------|-------|-----------|
| `sm` | 4px | `spacer-0.5x` | Tight. Icon button labels. |
| `md` | 6px | `spacer-utility-0.75x` | Standard. Comfortable breathing room. |
| `lg` | 8px | `spacer-1x` | Spacious. Larger containers need more gap. |

## Content Guardrails

### Character Limits and Max Lines

| Size | Max chars | Max lines | Writing style |
|------|----------|-----------|---------------|
| `sm` | ~40 | 1 | Fragment. No period. ("Keyboard shortcut") |
| `md` | ~80 | 2 | One sentence. Period optional. ("This key expires after 30 days.") |
| `lg` | ~150 | 4 | One to two sentences. Period required. |

### Writing Rules

- Sentence case (capitalize first word only).
- No em dashes (U+2014). Use regular dashes or split into sentences.
- No redundancy with the label (if the button says "Save", the tooltip should not say "Save your work" but rather "Ctrl+S" or "Saves all unsaved changes").
- No instructions ("Click here to..."). Tooltips explain, they don't instruct.
- No critical information. If the user needs it to complete a task, it belongs in the UI, not a tooltip.
- No interactive content (links, buttons, inputs). Tooltips dismiss on pointer leave.
- No line breaks within `sm` tooltips.

## Icon Pairing (InfoTooltip)

| `contextSize` | Icon size | Token | Tooltip `size` |
|--------------|-----------|-------|---------------|
| `xs` (12px) | 12px | `--portfolio-type-xs` | `sm` |
| `sm` (14px) | 14px | `--portfolio-type-sm` | `sm` |
| `md` (16px) | 16px | `--portfolio-type-base` | `md` |
| `lg` (18px) | 18px | `--portfolio-type-lg` | `md` |
| `xl` (20px) | 20px | `--portfolio-type-xl` | `lg` |

### Icon Style Guidance

- **Line icons** (default): Use on light surfaces, inline with text. The default `Info` icon is line style.
- **Solid icons**: Use on dark surfaces, standalone triggers, or when the icon needs to stand out against a busy background.
- The `icon` slot accepts any ReactNode. The consumer decides which icon to pass.

## Anti-Patterns

### Content

- **Tooltip as documentation.** If it takes more than 2 sentences, it belongs in a help panel or docs page.
- **Label repetition.** A button labeled "Delete" with a tooltip that says "Delete" adds nothing.
- **Interaction instructions.** "Click to open" is an instruction, not information.
- **Links or buttons inside tooltips.** Tooltips dismiss on pointer leave; interactive content is unreachable.
- **Disabled element without explanation.** If a control is disabled, the tooltip should explain why.

### Visual

- **Caret flush against corner.** The caret must never sit in the border-radius zone of the container. `arrowPadding >= radius-sm` (4px) is enforced. If you see the triangle overlapping the rounded corner, the inset is wrong.
- **Covering the trigger.** The tooltip body must never overlap the element that activated it.
- **Covering explained text.** InfoTooltip's `align="start"` default prevents this. Do not change it without reason.
- **Mobile hover.** Tooltips are hover-only. On touch devices, use a different pattern (tap-to-reveal, inline help text).
- **Nested tooltips.** Never nest a tooltip trigger inside another tooltip's content.
- **Info icon on every field.** Reserve InfoTooltip for fields that genuinely need explanation. Overuse creates visual noise.
- **Mixed sizes.** Within a single form or section, use one tooltip size consistently.

### Architecture

- **Provider per instance.** Never wrap individual `<Tooltip>` in its own `<TooltipProvider>`. One Provider at the app root.
- **Custom positioning code.** Never write viewport measurement hooks or manual positioning. Radix handles it.
- **Unnecessary overrides.** Do not pass `side` or `align` unless the default is provably wrong for the layout context.

## AI Agent Decision Tree

When generating a tooltip for a new component:

1. **Does this element need a tooltip at all?** If the label is self-explanatory, skip it. Tooltips for "Save" buttons that say "Save" are noise.
2. **Is this an info icon next to text?** Use `InfoTooltip`. Set `contextSize` to match the adjacent text size.
3. **Is this an AI feature?** Use `appearance="brand"` and consider a custom `icon` (e.g., sparkle).
4. **What size?** Match content length: fragment = `sm`, sentence = `md`, paragraph = `lg`.
5. **Does the default placement work?** For most cases, yes. Only override if you can identify a specific layout reason (sidebar, fixed toolbar, etc.).
6. **Write the content.** Follow writing rules above. No em dashes, no instructions, no label repetition.
7. **Check the anti-patterns list.** Especially: not covering text, not duplicating the label, not putting critical info in a tooltip.
