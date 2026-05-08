---
name: edra
description: >-
  Edra design challenge namespace. Provides challenge context, design system
  access rules, and isolation guardrails that prevent Edra feedback from
  bleeding into the main project knowledge base. Activate for any work on
  edra-challenge/ or docs/edra/.
---

# Skill: Edra Design Challenge

## When to Activate

- User says "edra", "edra challenge", or "edra design challenge"
- Any file under `edra-challenge/` or `docs/edra/` is being created/modified/read for task context
- AGENTS.md route 22 fires

**Do NOT activate** on generic phrases like "workspace organization" — that's the challenge topic, not an Edra-specific trigger.

## Challenge Context

Edra is a note-taking/docs app (similar to Notion). The design challenge asks you to design the end-to-end experience for organizing a messy workspace with AI-powered clustering.

**Full brief:** `docs/edra/take-home-brief.md`

**Deliverables:**
1. User Flow (1 page)
2. Key Screens (3-5, mid-fidelity, annotated)
3. One Key Moment in High Fidelity (1-2 screens)
4. Rationale (half page max)

**Evaluation criteria:** intuitive UX for complex AI capabilities, progressive disclosure, trust/control/human-AI handoff, coherent flow design.

**All Edra reference documents:** `docs/edra/` — check this directory for any additional briefs, specs, or feedback docs.

## Design System Access

The `edra-challenge/` app imports from the main design system via path aliases:

| Alias | Resolves to |
|-------|------------|
| `@ds/*` | `../src/components/ui/*` |
| `@site/*` | `../src/components/*` |
| `@lib/*` | `../src/lib/*` |
| `@hooks/*` | `../src/hooks/*` |

Port: **4003** (`npm run edra-challenge`)

## Isolation Guardrails (CRITICAL)

This namespace is **isolated from the main knowledge base**. The connection is one-directional: Edra can READ from main, but NEVER WRITES back.

### NEVER do the following for Edra work:

- Append to `docs/design-feedback-log.md`
- Append to `docs/engineering-feedback-log.md`
- Append to `docs/content-feedback-log.md`
- Update `docs/design-anti-patterns.md`
- Update `docs/engineering-anti-patterns.md`
- Update `docs/content-anti-patterns.md`
- Update any hub doc (`docs/design.md`, `docs/engineering.md`, `docs/content.md`)
- Run Post-Flight reflection (route 22 is EXCLUSIVE — Post-Flight is SKIPPED)

### All Edra-specific notes stay in `docs/edra/`

If you learn something from Edra work that needs documenting, put it in `docs/edra/`. Examples:
- `docs/edra/feedback.md` — design feedback specific to the Edra challenge
- `docs/edra/decisions.md` — design decisions and rationale
- `docs/edra/notes.md` — working notes, references, research

### MAY read from main knowledge base:

- Design patterns and principles (`docs/design.md`)
- Token system and component APIs (`src/styles/`, `src/components/ui/`)
- Engineering patterns for the Next.js app setup
- Any shared utility or hook

## Post-Flight Override

When route 22 fires, Post-Flight is **SKIPPED entirely**. This is not a bug — it's the isolation boundary. Edra work generates no entries in main feedback logs, no anti-pattern updates, no hub/spoke modifications.
