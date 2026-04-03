# Password Gate — Architecture Reference

> **Read this before modifying:** `src/proxy.ts`, `src/collections/Companies.ts`,
> `src/lib/company-session.ts`, `src/lib/company-data.ts`, or any file under `src/app/(frontend)/for/`.

## System Overview

The main site is behind a server-side password gate. All unauthenticated requests
are intercepted by `src/proxy.ts` and redirected to `/for/unknown` (or `/for/[company]`
if the visitor has a company-specific URL).

**This is a security boundary.** Incorrect changes can expose the site publicly or
lock out all visitors (including the Payload CMS admin if `/admin` is accidentally gated).

## Data Storage

Company data lives in the **Payload CMS `companies` collection** (Supabase Postgres).
This replaced the earlier static `src/config/companies.json` file.

The collection is managed via:
- **Payload default list/edit UI** at `/admin/collections/companies`
- **Custom dashboard** at `/admin/companies-dashboard` — table with quick actions (toggle active, copy URL+password, auto-generate password, delete)

## Data Flow

```
1. Visitor → GET /for/google
2. proxy.ts → /for/* allowed through
3. Login page renders → fetches company from Payload DB → applies theme
4. Visitor → POST password via server action
5. Server action validates password against DB (constant-time comparison)
6. If valid → set portfolio_session cookie (HMAC-signed, company=google)
7. Server action → increment loginCount + update lastLoginAt in DB
8. Redirect to /
9. proxy.ts → reads cookie, verifies HMAC, sets x-company header
   (proxy does NOT query DB — cookie-only validation, Option A)
10. Page renders → case study reads session → fetches company from DB → renders callout
```

## Files

| File | Purpose |
|------|---------|
| `src/collections/Companies.ts` | Payload collection definition — all company fields |
| `src/proxy.ts` | Next.js 16 proxy — intercepts all requests, checks session cookie |
| `src/lib/company-session.ts` | Cookie sign/verify/read, password comparison utilities |
| `src/lib/company-data.ts` | Payload queries — `getCompanyBySlug()`, `incrementLoginAnalytics()` |
| `src/app/(frontend)/for/[company]/page.tsx` | Server component — looks up company in DB, redirects if already authenticated |
| `src/app/(frontend)/for/[company]/LoginClient.tsx` | Client component — themed login form |
| `src/app/(frontend)/for/[company]/actions.ts` | Server action — validates password against DB, sets session cookie, tracks analytics |
| `src/app/(frontend)/for/[company]/login.module.scss` | Login page styles |
| `src/app/(frontend)/work/[slug]/page.tsx` | Reads company session, fetches case study notes from DB |
| `src/app/(frontend)/work/[slug]/ProjectClient.tsx` | Renders the `companyNote` callout |
| `src/components/admin/CompanyDashboard.tsx` | Custom Payload admin view — management dashboard |
| `src/scripts/seed-companies.ts` | One-time migration from companies.json → Payload |

## Company Collection Schema

| Field | Type | Notes |
|-------|------|-------|
| `slug` | text, unique, indexed | URL segment: `/for/{slug}` |
| `name` | text, required | Display name |
| `password` | text, required | Shared with hiring manager |
| `active` | checkbox, default true | Inactive companies can't log in |
| `accent` | text | Hex color for login page |
| `greeting` | text | Heading on login page |
| `logo` | upload (media) | Future use |
| `backgroundImage` | upload (media) | Future use |
| `layoutVariant` | select | Currently: 'centered'. Future: 'split', 'fullbleed' |
| `caseStudyNotes` | array | `{ projectSlug, note }` pairs |
| `lastLoginAt` | date, read-only | Updated on each login |
| `loginCount` | number, read-only | Incremented on each login |

### Adding a New Company

1. Go to `/admin/companies-dashboard` or `/admin/collections/companies`
2. Click "Add Company" — fill in name, slug, password, accent, greeting
3. Add case study notes (projectSlug must match Projects collection slugs)
4. The company is immediately available — no build or restart needed

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

## Proxy ↔ Database Architecture

The proxy uses **cookie-only validation** (Option A from the architecture plan):
- The proxy only verifies the HMAC signature on the cookie — it never queries the database
- If a company is deactivated, new logins are refused (the server action checks `active`)
- Existing sessions expire naturally (30 days)
- For immediate session revocation, change `SESSION_SECRET` (nuclear option) or implement a blocklist (Phase 2)

This approach keeps the proxy fast and free of database dependencies.

## Login Page Theming

The login page at `/for/[company]` is styled with a CSS custom property `--accent-color`
set from the company's `accent` field. This drives the input focus ring, submit button
background, and accent bar color.

If the company slug doesn't match any DB entry (or the company is inactive), the page
falls back to a generic unbranded login with a neutral gray accent.

### Phase 2: Layout Variants

The `layoutVariant` field supports future expansion:
- `centered` (current) — card centered on page
- `split` (future) — two-column layout with company branding on one side
- `fullbleed` (future) — full-screen background with overlay login

The login page will select a React layout component based on this field.

## Case Study Notes

When a visitor with a company session views `/work/[slug]`:

1. `page.tsx` reads the company slug from the session cookie
2. Fetches the company record from Payload DB via `getCompanyBySlug()`
3. Searches `caseStudyNotes` array for a matching `projectSlug`
4. If found, passes `{ companyName, note }` to `ProjectClient`
5. `ProjectClient` renders an aside with "Why this matters to [Company]" heading

The callout renders between the project description and the first content section.

## Management Dashboard

Custom Payload admin view at `/admin/companies-dashboard`. Features:

- Company table with name, slug, status, last login, login count
- Quick activate/deactivate toggle (single click)
- Auto-generate password button (`{slug}-preview-{year}` pattern)
- Copy URL + password to clipboard (formatted text)
- Full CRUD (add/edit/delete with confirmation)
- Accent color swatch per company

Accessible via the "Company Access" link in the admin sidebar navigation.

## Future AI Extension

The plan supports live AI generation of case study notes. To implement:

1. Add an `aiNotes: true` flag to the company collection schema
2. Create an API route that generates notes per company/slug pair using AI
3. Cache the generated notes (avoid re-generating on every page load)
4. In the case study page: if no matching `caseStudyNotes` entry exists but `aiNotes` is
   enabled, call the API route instead
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
8. **Check `/admin/companies-dashboard`** — should show the management dashboard

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
