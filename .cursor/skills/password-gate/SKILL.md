# Password Gate — Architecture Reference

> **Read this before modifying:** `src/proxy.ts`, `src/config/companies.json`,
> `src/lib/company-session.ts`, or any file under `src/app/(frontend)/for/`.

## System Overview

The main site is behind a server-side password gate. All unauthenticated requests
are intercepted by `src/proxy.ts` and redirected to `/for/unknown` (or `/for/[company]`
if the visitor has a company-specific URL).

**This is a security boundary.** Incorrect changes can expose the site publicly or
lock out all visitors (including the Payload CMS admin if `/admin` is accidentally gated).

## Data Flow

```
1. Visitor → GET /for/google
2. proxy.ts → /for/* allowed through
3. Login page renders (themed for Google)
4. Visitor → POST password via server action
5. Server action validates password (constant-time comparison)
6. If valid → set portfolio_session cookie (HMAC-signed, company=google)
7. Redirect to /
8. proxy.ts → reads cookie, verifies HMAC, sets x-company header
9. Page renders → case study reads session → renders "Why this matters to Google" callout
```

## Files

| File | Purpose |
|------|---------|
| `src/proxy.ts` | Next.js 16 proxy — intercepts all requests, checks session cookie |
| `src/config/companies.json` | Company passwords, themes (accent + greeting), case study notes |
| `src/lib/company-session.ts` | Cookie sign/verify/read, password comparison utilities |
| `src/app/(frontend)/for/[company]/page.tsx` | Server component — looks up company config, redirects if already authenticated |
| `src/app/(frontend)/for/[company]/LoginClient.tsx` | Client component — themed login form |
| `src/app/(frontend)/for/[company]/actions.ts` | Server action — validates password, sets session cookie |
| `src/app/(frontend)/for/[company]/login.module.scss` | Login page styles |
| `src/app/(frontend)/work/[slug]/page.tsx` | Reads company session for case study callout |
| `src/app/(frontend)/work/[slug]/ProjectClient.tsx` | Renders the `companyNote` callout |

## Company Config Schema

```json
{
  "slug": {
    "name": "Company Name",
    "password": "unique-password-string",
    "theme": {
      "accent": "#hex-color",
      "greeting": "Hi, Company team"
    },
    "caseStudyNotes": {
      "project-slug": "Relevance note text..."
    }
  }
}
```

### Adding a New Company

1. Add a new key to `src/config/companies.json` with the fields above
2. The password should be unique and not easily guessable
3. `caseStudyNotes` keys must match project slugs from the CMS
4. No server restart needed — the config is imported at build time and hot-reloaded in dev

## Session Cookie

- **Name:** `portfolio_session`
- **Value:** `{company_slug}.{hmac_base64url}` (signed with `SESSION_SECRET`)
- **Attributes:** HTTP-only, Secure (production), SameSite=Lax, 30-day expiry, path=/
- **Verification:** `verifySessionValue()` in `company-session.ts` — constant-time HMAC comparison
- **Secret:** `SESSION_SECRET` env var (falls back to `PAYLOAD_SECRET`, then `dev-secret-change-me`)

## Proxy Allowlist

The proxy allows these paths through without a session cookie:

| Path Pattern | Reason |
|-------------|--------|
| `/for/*` | Login pages |
| `/admin/*` | Payload CMS admin (has its own auth) |
| `/api/*` | Payload CMS API routes |
| `/_next/*` | Next.js static assets and internals |
| `/images/*`, `/media/*` | Static media files |
| `/favicon.ico`, `/robots.txt`, `/sitemap.xml` | Metadata files |

**Everything else requires a valid session cookie.**

## Login Page Theming

The login page at `/for/[company]` is styled with a CSS custom property `--accent-color`
set from the company's `theme.accent`. This drives the input focus ring, submit button
background, and accent bar color.

If the company slug doesn't match any config entry, the page falls back to a generic
unbranded login with a neutral gray accent.

## Case Study Notes

When a visitor with a company session views `/work/[slug]`:

1. `page.tsx` reads the company from the session cookie
2. Looks up `companies[company].caseStudyNotes[slug]`
3. If found, passes `{ companyName, note }` to `ProjectClient`
4. `ProjectClient` renders an aside with "Why this matters to [Company]" heading

The callout renders between the project description and the first content section.

## Future AI Extension

The plan supports live AI generation of case study notes. To implement:

1. Add `aiNotes: true` flag to the company config
2. Create an API route that generates notes per company/slug pair using AI
3. Cache the generated notes (avoid re-generating on every page load)
4. In the case study page: if `caseStudyNotes[slug]` is empty but `aiNotes` is enabled,
   call the API route instead
5. The `companyNote` prop on `ProjectClient` doesn't change — it receives the same
   `{ companyName, note }` regardless of whether the note is static or AI-generated

## Testing Protocol

After any change to the password gate system:

1. **Clear cookies** for the site domain
2. **Visit `/`** — should redirect to `/for/unknown`
3. **Visit `/for/google`** — should show themed login page with Google accent color
4. **Enter wrong password** — should show error, not redirect
5. **Enter correct password** — should redirect to `/`, site should render normally
6. **Visit a case study** — if the company has a matching note, the callout should appear
7. **Check `/admin`** — should NOT require a password (Payload's own auth applies)

## Env Vars

| Variable | Required | Default | Purpose |
|----------|----------|---------|---------|
| `SESSION_SECRET` | Recommended | Falls back to `PAYLOAD_SECRET` | Signs session cookies |
| `SITE_PASSWORD` | Optional | `preview-2026` | Fallback password for unknown companies |

Both must be set in the Vercel dashboard for the `yilangao-portfolio` project.

## Cross-App Consideration

The playground's `turbopack.root` is set to the monorepo root so `@ds/*` imports
resolve correctly. This causes Next.js 16 to detect file conventions (like `proxy.ts`)
from the monorepo root, not just from `playground/`. A no-op `playground/src/proxy.ts`
shadows the main site's proxy to prevent the collision. See EAP-061.

If you rename or move `src/proxy.ts`, verify the playground build still passes.
