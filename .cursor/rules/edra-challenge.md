---
globs: edra-challenge/**
---

# Edra Challenge — Isolated Namespace

**Read `.cursor/skills/edra/SKILL.md` before doing any substantive work in this directory.**

## Quick Reference

- **Port:** 4003
- **DS access:** `@ds/*` → `../src/components/ui/*`, `@site/*` → `../src/components/*`
- **Challenge docs:** `../docs/edra/`
- **Route:** AGENTS.md route 22 (EXCLUSIVE — Post-Flight is skipped)

## Isolation Boundary

This app is part of an isolated namespace. Feedback from Edra work NEVER goes to:
- `docs/design-feedback-log.md`
- `docs/engineering-feedback-log.md`
- `docs/content-feedback-log.md`
- Any `*-anti-patterns.md` file
- Any hub/spoke doc

All Edra-specific notes stay in `docs/edra/`.
