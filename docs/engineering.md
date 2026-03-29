# Engineering — Accumulated Knowledge

> **What this file is:** The synthesized, authoritative engineering knowledge base for yilangao.com. Every principle here was extracted from real incidents, debugging sessions, and process failures. This is a living document — it grows after every engineering incident.
>
> **Who reads this:** Every AI agent before making any code change.
> **Who writes this:** AI agents after processing engineering feedback via the `engineering-iteration` skill.
> **Last updated:** 2026-03-29

---

## 0. Engineering Posture

**Treat every change as live.** This is not a static codebase — multiple dev servers, experiments, and the playground may be running simultaneously. Every code change must be verified on localhost. Every process must be aware of what else is running. Every data source must have exactly one canonical definition.

- **Localhost is non-negotiable.** If it's not running and rendering correctly on localhost, the change isn't done.
- **Port awareness is mandatory.** Read `docs/port-registry.md` before starting any server. Never kill processes blindly.
- **Single source of truth for data.** When the same data exists in multiple files, there must be an automated sync mechanism — not human discipline.
- **Verify after every change.** curl the page, check the terminal for errors, spot-check the rendered output.

---

## How to Use This File

1. **Before writing any code**, scan the relevant section below.
2. **If the user reports a bug or engineering issue**, check whether an existing principle already covers it — apply the documented fix, don't re-derive.
3. **After resolving an issue**, update this file: strengthen existing principles or add new ones.

---

## 1. Localhost Verification

**Severity: Critical** — Failing to verify on localhost was the root cause of the playground drift incident (ENG-001).

### 1.1 Before Any Work

- Verify the relevant dev server is running and responding.
- Never assume a dev server is still running from a previous session — check the terminal or `lsof`.
- If the server is down, start it before making code changes.

### 1.2 After Any Change

- After modifying tokens, components, or pages: verify the page loads on localhost.
- After modifying data files: verify the data renders in the UI.
- After modifying build config: verify the build completes and the server restarts.

### 1.3 Verification Commands

```bash
# Check if a port is responding
curl -sI http://localhost:4000 | head -1

# Check all running Node.js servers
lsof -i -P -n | grep LISTEN | grep node

# Check specific port
lsof -i :4000 -P -n | grep LISTEN
```

---

## 2. Port Management

**Severity: Critical** — Port conflicts waste time and can kill running services.

### 2.1 Port Assignments

All dev servers use ports in the **4000–5000** range. The canonical ledger is `docs/port-registry.md`.

| Service | Default Port |
|---------|-------------|
| Main site (yilangao.com) | 4000 |
| Playground (design system) | 4001 |

### 2.2 Protocol

1. **Before starting a server:** Read `docs/port-registry.md`. Check if the port is already in use.
2. **Never `kill -9` a port** without first checking what process owns it and whether it's needed.
3. **Never use ports below 4000** — they may belong to other projects on the machine.
4. **After starting/stopping:** Update the port registry ledger.

### 2.3 When Ports Conflict

If the default port is occupied:
1. Check what's running: `lsof -i :4001 -P -n`
2. If it's a stale process, kill it and restart on the default port.
3. If it's a legitimate process, pick the next free port in 4000–5000.
4. Log the temporary port in the registry with a reason.

---

## 3. Single Source of Truth (Token Sync)

**Severity: Critical** — Manual data duplication caused the playground drift incident (ENG-001).

### 3.1 The Problem

Color tokens exist in three locations:
1. `src/styles/tokens/_colors.scss` — **canonical source** (SCSS variables)
2. `playground/src/lib/tokens.ts` — playground UI data (TypeScript)
3. `playground/src/app/globals.css` — Tailwind `@theme` block (CSS custom properties)

### 3.2 The Rule

`_colors.scss` is the single source of truth. When modifying it:

1. Run `npm run sync-tokens` — this regenerates the color portion of `playground/src/lib/tokens.ts` from the SCSS source.
2. Verify the playground page loads and renders the changes: `curl -sI http://localhost:4001/tokens/colors`
3. If adding a new semantic token category, manually update `globals.css` if the token needs a CSS custom property for Tailwind (this mapping includes light/dark variants and is not auto-generated).

### 3.3 Sync Points

| Source | Consumer | Synced How | When to Update |
|--------|----------|-----------|----------------|
| `_colors.scss` | `tokens.ts` (colors) | `npm run sync-tokens` | After any `_colors.scss` change |
| `_colors.scss` | `playground/globals.css` | Manual (light/dark mapping) | When adding semantic tokens that need CSS custom properties |
| `_typography.scss` | `tokens.ts` (typography) | Manual | When adding/changing font stacks, weights, scale |
| `src/app/layout.tsx` (font loading) | `playground/src/app/layout.tsx` | Manual | When adding/changing font packages or CSS variables |
| Root `package.json` (font deps) | `playground/package.json` | Manual | When adding font packages used by both apps |

### 3.4 Other Token Files

Typography, spacing, motion, elevation, and breakpoints in `tokens.ts` are still manually maintained. They change infrequently enough that automated sync is not yet warranted. If drift becomes a pattern, extend the sync script.

**Important:** Font-related changes are NOT just data — they also require **infrastructure parity** between the main app and the playground (package installation, `next/font` imports, CSS variable injection). See §6.

---

## 4. Debugging Methodology

### 4.1 Diagnose Before You Patch

When something "doesn't work," the root cause is usually one of:
1. **Data sync issue** — the UI reads from a different source than what was modified.
2. **Process issue** — the server isn't running, crashed, or is on a different port.
3. **Build issue** — the change isn't being picked up by the bundler.
4. **Architecture issue** — the system design makes the failure possible.

Check in this order. Don't skip to "add more code" before verifying the fundamentals.

### 4.2 Incident Response

When a user reports something broken:
1. **Reproduce first** — curl the URL, check the terminal, read error output.
2. **Check the obvious** — is the server running? Is it the right port? Did the file save?
3. **Check data flow** — trace from source file → build → server → browser.
4. **Fix and verify** — make the fix, verify on localhost, document in the engineering feedback log.

---

## 5. Process Principles

### 5.1 One Change, One Verification

Every code change should be followed by a verification step. Don't batch multiple unrelated changes and then discover one of them broke something.

### 5.2 Read the Engineering.md First

Before writing code, read this file. If the user's issue maps to an existing principle, apply the documented solution immediately.

### 5.3 Self-Learning System

This documentation evolves from real incidents. When a new failure mode is discovered:
1. Fix the immediate problem.
2. Document the principle in this file.
3. Document the anti-pattern in `engineering-anti-patterns.md`.
4. If the failure was caused by a process gap, automate the gap away (scripts, rules, guardrails).

---

## 6. Cross-App Infrastructure Parity

**Severity: High** — The playground font gap (ENG-002) was caused by adding infrastructure to the main app without propagating it.

### 6.1 The Problem

This project has two Next.js apps: the main site (`src/`) and the playground (`playground/`). They share design tokens and should present the same visual identity. When a new dependency, font package, or framework feature is added to one app, the other may also need it — but there's no automated check for this.

Font loading is the canonical example: adding `geist` to the root `package.json` and wiring it in `src/app/layout.tsx` does nothing for the playground, which has its own `package.json` and `layout.tsx`.

### 6.2 The Rule

When adding any of the following to the main app, explicitly check whether the playground also needs it:

| Change Type | Main App Location | Playground Equivalent |
|---|---|---|
| Font package | Root `package.json` | `playground/package.json` |
| Font loading (`next/font`) | `src/app/layout.tsx` | `playground/src/app/layout.tsx` |
| CSS variable injection | `<html className={vars}>` | `<html className={vars}>` |
| CSS theme font-family | `src/app/globals.scss` | `playground/src/app/globals.css` |
| New token category | `src/styles/tokens/` | `playground/src/lib/tokens.ts` |

### 6.3 Checklist (After Any Shared Infrastructure Change)

1. Did you add a new dependency that affects visual output? -> Check both `package.json` files.
2. Did you add or change font loading? -> Check both `layout.tsx` files.
3. Did you add CSS variables that tokens reference? -> Check both global CSS files.
4. Does the playground's preview page hardcode values instead of reading from tokens? -> Fix it to use token values.
5. **After any font change:** Run `grep -r "fontFamily" playground/src/ --include="*.tsx"` to find inline overrides. There should be zero hardcoded font families in component pages (ENG-003).

---

## Appendix: Incident Frequency Map

| Pattern | Times Raised | Priority |
|---------|-------------|----------|
| Data sync / token drift | 1 | Critical |
| Cross-app infrastructure parity | 2 | Critical |
| Port management | 0 | Critical |
| Localhost verification | 1 | Critical |
| Build / bundler issues | 0 | High |
| Process automation gaps | 1 | High |

---

## Entry Template (for future updates)

```markdown
## N. [Category Name]

### N.1 [Principle Name]

**Source:** Session YYYY-MM-DD, incident "[first 10 words...]"
**Problem:** [What went wrong]
**Root cause:** [Why it went wrong]
**Rule:** [The principle to follow going forward]
**Implementation:** [Specific code pattern, command, or script to use]
```
