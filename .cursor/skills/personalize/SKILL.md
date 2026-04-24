---
name: personalize
description: >-
  End-to-end company visitor setup: researches the company/team, creates CMS
  credentials, analyzes case study relevance, writes personalized notes,
  configures the badge, and verifies the full visitor experience. Triggers:
  "personalize", "set up for {company}", "tailor for {company}",
  "prep for {company}".
---

# Skill: Personalize Company

The portfolio shows personalized badges and contextual notes to visitors who
log in with company-specific credentials. This skill automates the full setup
pipeline: research, relevance analysis, CMS configuration, and verification.

## When to Activate

**Trigger phrases:** "personalize", "set up for {company}", "personalize for
{company}", "tailor for {company}", "prep for {company}"

**Do NOT activate for:**
- Editing existing note text on a company that's already set up -> use
  `content-iteration`
- Touching auth/session code or the password gate infrastructure -> use
  `password-gate`
- Manually adding a CMS record through the Payload admin UI -> use
  `password-gate`

**Disambiguation:** If the user says "add a company" while already working
inside the `password-gate` skill, that's a manual CMS operation, not a
personalize trigger. The personalize skill implies the full
research-to-verification pipeline, not a raw CMS insert.

## Intake

Detect what the user provided and which scenario applies. The user may provide
anything from a complete job description to just a person's name. Classify the
input and determine what research is needed.

**Input classification (non-exhaustive, combine as needed):**

| Input | Signal strength | What to do |
|-------|----------------|------------|
| Job description | Richest signal (team, role, problems, values) | Treat as primary research input |
| Company name + team/product | Clear target | Product-level research |
| Company name only | Sufficient for startups; ambiguous for large orgs | Ask which team if large org |
| Company website URL | Good | Extract product focus from site |
| Person's name | Common for cold outreach | Search for person, find company/team |
| Person's name + company | Narrows scope | Search for person's role within company |
| Minimal context | Weakest | Full research from scratch |
| Existing company, update | N/A | Skip to Step 2 (re-research if focus changed) |
| "Review all companies" | N/A | Bulk audit: read case studies once, loop Steps 2-4 |

**Key principle:** Never assume you have complete information. If the input is
ambiguous (e.g. just "Google"), ask one targeted question to narrow scope. But
do NOT block on having a JD.

**CMS pre-check (runs before Step 1):** Query the CMS for existing records
matching the company root. This catches duplicates, surfaces sibling team
entries, and flags stale records before research begins. **Auth required:** all
Payload REST API operations on the Companies collection require the
`payload-token` cookie from an active admin session. See Protocol A (Collision
Detection) and Protocol B (Stale Flagging) below.

## Step 1: Research the Company

This is the foundation. Without understanding what the company does and what
the specific team/role cares about, the relevance analysis is guesswork. The
depth of research scales with how much context the user provided.

### 1a: Identify the target

Parse whatever the user gave you. Determine what you know and what you need to
find out.

- **Person's name:** Web search for them (LinkedIn, company bios, talks, blog
  posts). Identify their company, role, and team. This becomes your starting
  point.
- **Company name for a large org:** Ask which team/product/role before deep
  research. "Cognition" is one product; "Google" is dozens.
- **Startup name you don't recognize:** Expected. Startups are the most common
  case where training data is insufficient. Research is mandatory.
- **JD:** Extract company, team, role title, key responsibilities, required
  skills, and the problems the role is meant to solve. The JD is the most
  reliable input.
- **Website URL:** Fetch and analyze to extract product positioning, value
  propositions, and team structure.

### 1b: Research

Web search to build the Company Profile. Scale depth to uncertainty:

- **Known large company + specific team:** Search for the team's product, its
  design/engineering challenges, recent launches, public design system or blog.
- **Known mid-size company:** Search for product, recent news,
  engineering/design blog, culture signals.
- **Startup or unfamiliar company:** Search deeper: product pages, founder
  interviews, funding announcements, demo videos, changelog/blog, tech stack,
  any design artifacts. For very early-stage companies, the founders'
  backgrounds and previous work may be the best signal.
- **Person-driven research:** If the entry point was a person, search for their
  public work, talks, writing, open source contributions. This reveals what
  they personally value.

Produce a **Company Profile:**

- What the company/product does (1-2 sentences)
- The specific team or product area (if applicable)
- Core problems they solve for their users (bullet list)
- What the hiring team likely cares about (inferred from JD, product area, or
  role)
- Design/engineering culture signals (blog posts, open source, design system,
  talks)
- Confidence level: High (JD + known company) / Medium (company research only)
  / Low (minimal info, mostly inferred)

### 1c: Checkpoint

Present the Company Profile to the user. Ask: "Does this match your
understanding? Is there a specific angle I should focus on?" Do NOT proceed
until confirmed. The user often knows things that web search cannot surface.

## Step 2: Analyze Case Study Relevance

Read all case study content from the CMS via `GET /api/projects` (the source of
truth for what visitors actually see). The API returns Lexical rich-text JSON,
not plain text. For relevance analysis, use these data sources in priority
order:

1. **Top-level text fields** from the API response: `introBlurbHeadline`,
   `category`, `slug` -- plain strings, strongest signal.
2. **Extracted plain text** from Lexical content blocks using
   `extractLexicalText()` from `src/lib/lexical.ts` if deeper analysis needed.
3. **Home page sublines** from `src/lib/home-case-subline.ts`
   (`HOME_CASE_SUBLINE_BY_SLUG`) -- short human-written summaries.
4. **Hero metrics** hardcoded in
   `src/app/(frontend)/(site)/work/[slug]/page.tsx` (`HERO_METRICS`) --
   quantitative impact data.

For each case study, map its core themes against the Company Profile. Produce a
**Relevance Table:**

| Case Study | Match strength | Connection | Badge? |
|------------|---------------|------------|--------|
| (title) | Strong / Moderate / Weak | (1-2 sentence reason) | Recommended / Not recommended |

Apply these rules:
- **Badge density:** 1 is a precise signal. 2 is acceptable if genuinely
  relevant. 3+ dilutes into a pitch deck. Default to 1.
- **Essay caution:** Flag essays as badge-questionable. Badging an essay implies
  "curated reading" not "demonstrated work." Only badge an essay if the
  connection is exceptionally strong AND it is not the only badged item.
- **Team-specific matching:** Match against the team/product, not the company
  name. A case study about enterprise data visualization is strong for a data
  team, weak for a consumer social team, even within the same company.

## Step 3: Present and Confirm

Show the Relevance Table and badge recommendation to the user. This is a
mandatory checkpoint. The agent recommends but does not unilaterally decide.
Wait for user approval on which case studies get badges and any adjustments to
the reasoning.

## Step 4: Configure the Company

### 4a: CMS Record

If the company is new, create it via Payload REST API (`POST /api/companies`).
**Auth required:** include the `payload-token` cookie from an active admin
session (`-b "payload-token=..."` with curl).

Create the record with:
- `name` -- display name (e.g. "Google Ads", "Cognition")
- `slug` -- URL-safe, lowercase (e.g. `google-ads`, `cognition`)
- `password` -- user provides this or agent suggests one (see Password Taste
  below and `password-gate/SKILL.md` Password Normalization section)
- `active: true`
- `accent` -- hex color from the company's brand
- `greeting` -- **always `"Welcome."`**. See Greeting Contract below.
- `altPasswords` -- if the user mentions having already shared a different
  password (e.g. on a resume or in a prior message), add the distributed
  password as an alt password entry: `altPasswords: [{ value: "the-password" }]`

### 4b: Write Notes

For each approved case study, write the `caseStudyNotes` entry. Notes must
follow `docs/content/voice-style.md` (sentence length, banned words, no em
dashes). Each note should connect the case study's core argument to the
company's specific problem. Push to CMS via `PATCH /api/companies/{id}`.

## Step 5: Verify

The skill does not end at "I updated the CMS." It ends at confirmed rendering.

**Prerequisite:** The main site dev server must be running on port 4000. If
it's not, activate the `boot-up` skill to start it. `SESSION_SECRET` must be
available in the environment (falls back to `PAYLOAD_SECRET`, then
`dev-secret-change-me` in dev).

1. Generate a signed session cookie for the company (using `SESSION_SECRET`)
2. Curl the home page with the cookie; confirm correct badge count and
   placement
3. Curl each badged case study's detail page; confirm the "Why this matters to
   {Company}" aside renders with the note text
4. If the login page redirects away with a mismatched session (EAP-118), flag it
5. Report: badge count, which case studies are badged, login URL for the user
   to test manually

## Guardrails

**Quick reference (scan before every run):**

| Rule | Value |
|------|-------|
| Max badges per company | **2** (default 1) |
| Badge style | `neutral/minimal/sm/squared` -- never Lumen accent |
| Slug format | lowercase, hyphen-separated -- team-scoped for multi-team |
| Generic slug | `welcome` (not "unknown") -- never gets badges |
| Test slug | `admintest` -- evergreen admin test account, never retires, never gets badges or notes |
| Stale threshold | **12 weeks** (3 months) |
| Greeting | **Always `"Welcome."`** -- never `"Hi, {Company} team"` or any variant |
| Password | Human-sounding, completes the greeting -- never `slug-preview-year` patterns |
| Alt passwords | Optional, set when multiple passwords may have been distributed (e.g. on a resume) |
| Dev server | Must be running on port 4000 before Step 5 |
| Payload auth | `payload-token` cookie required for all CMS API calls |

**Badge limits:**
- Hard cap of 2 per company. Default 1. Allow 2 only when both are genuinely
  strong AND one is not an essay. If 3+ match, present all but recommend top 2.
- Style is always `neutral/minimal/sm/squared` per `branding.md` section 9.
  Never Lumen accent (section 9.4).
- One badge type per case study maximum (section 9.5).
- `"welcome"` sessions never get badges; empty notes never produce badges.
- `"admintest"` is a permanent test account. Never badge it, never add notes,
  never deactivate it, never flag it as stale. It exists for the owner to test
  the generic visitor experience.

**Slug naming:**
- URL-safe, lowercase, hyphen-separated.
- Bare name for single-product companies: `cognition`, `stripe`, `linear`.
- Company-team for multi-team: `google-ads`, `google-search`, `meta-instagram`.
- Never use the bare company name for a known multi-team company.
- Display `name` mirrors the slug pattern ("Google Ads").

**Greeting contract:**
The `greeting` field is **always `"Welcome."`** for every company. No exceptions.
`LoginClient` strips the trailing period and adds a comma, rendering `"Welcome,"`
on screen. The visitor's password then completes the sentence visually:
`Welcome, stainless`. The greeting is the fixed half of a two-part sentence -
the password is the variable half. Never set greeting to `"Hi, {Company} team"`,
`"Hello, {name}"`, or any company-specific variant. The personalization lives in
the password, not the greeting.

**Password taste:**
The password completes the greeting sentence on the login page. A visitor reads
"Welcome," and types something that feels like a personal response -
not a machine-generated access token. The password is a first impression.
- **Good:** the company name itself (`stainless`), a short phrase that sounds
  human (`glad you are here`, `Joseph`), a founder's name, a product name the
  team would recognize.
- **Bad:** `{slug}-preview-{year}`, `{company}_access`, `welcome-{company}`,
  anything with hyphens/underscores/numbers that reads like a generated
  credential. If it looks like a slug or a CI variable, it fails.
- **Default when user doesn't provide one:** use the company name (slug-cased
  for storage, but normalization makes casing and spacing irrelevant at
  comparison time). For single-word companies this is the cleanest option.
- Normalized at comparison time (see `password-gate/SKILL.md` Password
  Normalization section) - casing, spacing, hyphens, and contractions are all
  forgiven. "Stainless", "stainless", "STAINLESS" all match.

**Password lifecycle:**
- Always check for existing records before creating. Never silently overwrite.
- Re-application: present existing record details, ask before modifying.
- Slug rename: warn user about note delivery breakage for active sessions. Only
  rename if stale or zero logins.

For detailed sub-procedures, see the **Protocols** section below.

## Operating Under Orchestrator Dispatch

When `[ORCHESTRATED]` appears in your context:
- BEFORE implementation: write a 2-line stub to the feedback log using the
  pre-assigned ID from dispatch instructions.
- Follow Steps 1-5 as normal (skip the cross-category check).
- Replace documentation with:
  1. `## Draft Documentation` section in your response
  2. `## Files Modified` section listing every file created or changed
  3. `## Server Operations Needed` section if applicable
- Do NOT write to any `docs/` files other than the initial stub.

## Protocols

Detailed sub-procedures referenced by Guardrails and Intake. Consult when
executing the specific protocol; skip on a general read-through.

### Protocol A: Collision Detection

Runs during the Intake CMS pre-check.

1. `GET /api/companies?where[slug][like]={companyRoot}%` (starts-with query).
   For hyphenated company names (e.g. `twenty-two-labs`), use the full company
   slug as the root, not just the first segment.
2. For each match, read `createdAt`, `updatedAt`, `lastLoginAt`, `loginCount`.
3. Present grouped by company root: "Google family: google-ads (active, 3
   logins), google-search (active, 0 logins)."
4. Ask: "Adding a new team, or updating one of these?"
5. New team -> proceed with team-scoped slug. Same record -> update flow.

### Protocol B: Stale Company Flagging

Runs during the Intake CMS pre-check.

- Skip evergreen slugs (`welcome`, `admintest`) -- these never go stale.
- Flag any other company matching: (A) `lastLoginAt` older than 12 weeks, OR (B)
  `lastLoginAt` null AND `createdAt` older than 12 weeks.
- Present with full timeline: "{name} -- created {date}, modified {date}, last
  login {date or 'never'}. Deactivate, update, or leave?"
- Agent never deactivates without explicit user approval.
- Deactivation: `PATCH active: false`. Existing sessions expire naturally
  (30-day cookie).

### Protocol C: Timestamp Awareness

Three timestamps, no schema changes needed:

| Field | Source | Meaning |
|-------|--------|---------|
| `createdAt` | Payload auto | When the record was first created |
| `updatedAt` | Payload auto | When any field was last modified (not password-specific) |
| `lastLoginAt` | Explicit field | When a visitor last used credentials |

Surface all three when presenting existing records. `updatedAt` recent +
`lastLoginAt` old = agent updated the record but no visitor has logged in yet.

### Protocol D: Multi-Team Version Tracking

Each team is its own CMS record, independent, grouped by slug prefix
convention. No parent-child schema relationship.

- Note which existing entries belong to the same company in the Company Profile
  (Step 1).
- During relevance analysis (Step 2), flag if a case study is already badged
  for a sibling team to avoid redundancy.

## File Map

| File | Purpose | Read | Write |
|------|---------|------|-------|
| `.cursor/skills/password-gate/SKILL.md` | Auth architecture, schema, password normalization | Always (Step 1) | Never |
| `src/collections/Companies.ts` | Payload collection definition | Step 4a (new record) | Never |
| `docs/design/branding.md` section 9 | Badge design rationale, Lumen scoping | Always (Step 2) | Only if badge policy changes |
| `docs/content/voice-style.md` | Note writing rules | Step 4b | Never |
| `src/lib/company-data.ts` | `getCompanyBySlug()`, `CompanyRecord` type | Step 1 | Never |
| `src/lib/company-session.ts` | Cookie signing for verification | Step 5 | Never |
| `src/lib/lexical.ts` | `extractLexicalText()` | Step 2 (deep analysis) | Never |
| `src/lib/home-case-subline.ts` | `HOME_CASE_SUBLINE_BY_SLUG` | Step 2 | Never |
| Payload REST API (`GET /api/projects`) | Case study content (Lexical JSON) | Step 2 | Never |
| `src/app/(frontend)/(site)/page.tsx` | Home page personalization logic | Step 5 verify | Never |
| `src/app/(frontend)/(site)/HomeClient.tsx` | Badge rendering | Step 5 verify | Never |
| `src/app/(frontend)/(site)/work/[slug]/page.tsx` | Detail page note rendering | Step 5 verify | Never |
| Payload REST API (`/api/companies`) | CMS company data | Intake pre-check, Step 5 | Step 4a POST / Step 4b PATCH |
