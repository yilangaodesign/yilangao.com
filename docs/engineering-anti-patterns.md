# Engineering Anti-Patterns

> **What this file is:** A catalog of engineering mistakes that caused incidents or wasted time, documented so they are never repeated. Each anti-pattern includes the trigger, why it's wrong, and the correct alternative.
>
> **Who reads this:** AI agents before making code changes — scan for relevant anti-patterns.
> **Who writes this:** AI agents when an incident reveals a new anti-pattern.
> **Last updated:** 2026-03-29

---

## EAP-001: Manual Data Duplication Without Sync

**Trigger:** Defining the same data (colors, tokens, config) in multiple files and relying on manual discipline to keep them in sync.

**Why it's wrong:** Humans and AI agents forget. When `_colors.scss` was expanded with 90 new color values and 11 new semantic tokens, the playground's `tokens.ts` was not updated. The user saw nothing new in the playground UI. The data existed in the source of truth but was invisible in the consuming application. Manual duplication creates drift as a certainty, not a risk.

**Correct alternative:** Establish a codegen pipeline. The canonical data lives in one file; downstream files are generated from it. Run `npm run sync-tokens` after modifying `src/styles/tokens/_colors.scss`. The sync script reads SCSS and regenerates the color portion of `playground/src/lib/tokens.ts`.

**Incident:** ENG-001 (2026-03-29) — Playground token drift after Carbon palette expansion.

---

## EAP-002: Killing Ports Without Checking What's Running

**Trigger:** Running `lsof -ti:PORT | xargs kill -9` as a first resort when a port conflict occurs.

**Why it's wrong:** The process on that port may be a legitimate dev server from another terminal session, another project, or even a production preview. Killing it blindly wastes the time of whoever was using it and can corrupt in-progress builds or lose unsaved state.

**Correct alternative:**
1. Check what's on the port: `lsof -i :PORT -P -n | head -5`
2. Identify the process — is it yours? Is it needed?
3. If stale, kill it. If legitimate, pick a different port.
4. Always read `docs/port-registry.md` first.

---

## EAP-003: Assuming Dev Servers Persist Across Sessions

**Trigger:** Making code changes and expecting them to be visible without verifying the dev server is running.

**Why it's wrong:** Dev servers crash, terminals close, machines restart. A server that was running in a previous chat session may be dead. If the agent makes changes but doesn't verify on localhost, the user discovers the issue — wasting their time and eroding trust.

**Correct alternative:** At the start of any session involving UI work, verify the relevant dev server is running:
```bash
lsof -i -P -n | grep LISTEN | grep node
```
If no server is running on the expected port, start it before making changes.

---

## EAP-004: Modifying Source of Truth Without Updating Consumers

**Trigger:** Editing a canonical file (e.g., `_colors.scss`) without updating all files that consume or mirror its data.

**Why it's wrong:** The system appears to work because the source file is correct. But the user sees the downstream output (playground, website, component library), which is stale. The disconnect between "I made the change" and "the user sees the change" is the fundamental failure mode.

**Correct alternative:** Every canonical file must have a documented list of its consumers and a sync mechanism:

| Source | Consumers | Sync |
|--------|-----------|------|
| `src/styles/tokens/_colors.scss` | `playground/src/lib/tokens.ts` | `npm run sync-tokens` |
| `src/styles/tokens/_colors.scss` | `playground/src/app/globals.css` | Manual (light/dark mapping) |
| `src/app/layout.tsx` (font loading) | `playground/src/app/layout.tsx` | Manual — see §6 in `engineering.md` |
| Root `package.json` (font deps) | `playground/package.json` | Manual — see §6 in `engineering.md` |

After modifying any source, run its sync mechanism and verify each consumer.

---

## EAP-005: Adding Infrastructure to One App Without Propagating to Co-Deployed Apps

**Trigger:** Installing a font package, adding `next/font` loading, or injecting CSS variables in the main app (`src/`) without doing the equivalent in the playground (`playground/`).

**Why it's wrong:** The main app and the playground are separate Next.js apps with independent `package.json` files, layouts, and CSS. Adding a dependency or font pipeline to one does not affect the other. The playground renders design tokens — if the fonts those tokens reference aren't loaded, every font preview silently falls back to generic system fonts. The playground *appears* to work (no errors, no crashes), but the visual output is wrong. This is especially insidious because the token *data* can be correct (`var(--font-geist-sans)`) while the CSS variable is undefined, causing silent fallback.

**Correct alternative:** Treat font and infrastructure changes as a two-app operation:
1. Install the package in both `package.json` files.
2. Add the `next/font` import and CSS variable injection in both `layout.tsx` files.
3. Update both global CSS files to reference the new font variables.
4. Verify the playground preview pages actually render with the new fonts (check response headers for font preload links).
5. Consult the checklist in `engineering.md` §6.3.

**Incident:** ENG-002 (2026-03-29) — Geist fonts loaded in main app but invisible in playground.

---

## EAP-006: Hardcoded Inline Font Overrides in Component Previews

**Trigger:** Using `style={{ fontFamily: "system-ui, -apple-system, sans-serif" }}` in component preview/demo code within the playground.

**Why it's wrong:** Inline styles have maximum CSS specificity. When the body correctly sets `font-family: var(--font-sans)` (which resolves to Geist), an inline `fontFamily` override on any element silently replaces Geist with system fonts. The component looks "fine" (text renders), but it's not using the design system font. This is especially insidious because: (a) it produces no error, (b) system-ui on macOS looks similar to Geist Sans, making the difference hard to spot visually, and (c) the fix appears to work at the layout level while individual components secretly override it.

**Correct alternative:** Remove all hardcoded `fontFamily` from inline styles. Let the body's Geist font cascade to all children. If a specific component needs a different font family, use Tailwind utility classes (`font-sans`, `font-mono`) which reference the design tokens. Never use `style={{ fontFamily }}` in the playground.

**Detection:** Run `grep -r "fontFamily" playground/src/ --include="*.tsx"` after any font-related change. There should be zero matches in component pages. The only acceptable location is the typography token page where `f.value` (a CSS variable reference) is used for font previews.

**Incident:** ENG-003 (2026-03-29) — 3rd complaint about Geist fonts not visible in playground.

---

## Entry Template

```markdown
## EAP-NNN: [Short Name]

**Trigger:** [What action or pattern triggers this]

**Why it's wrong:** [The technical and process reason]

**Correct alternative:** [What to do instead]

**Incident:** [Optional — reference to ENG-NNN]
```
