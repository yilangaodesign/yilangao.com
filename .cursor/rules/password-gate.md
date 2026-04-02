---
globs:
  - src/proxy.ts
  - src/config/companies.json
  - src/lib/company-session.ts
  - src/app/(frontend)/for/**
---

STOP — read `.cursor/skills/password-gate/SKILL.md` before making any changes.

The password gate is a security boundary. Changes to `proxy.ts`, company config, or the login flow affect all visitor access. Incorrect changes can expose the site publicly or lock out all visitors.

Key constraints:
- `proxy.ts` MUST allow `/admin/*` and `/api/*` through — Payload CMS depends on it
- Session cookies are HMAC-signed — changing the signing logic invalidates all existing sessions
- Company passwords are server-side only — never send them to the client
- The `validatePassword` server action uses constant-time comparison — do not replace with `===`
