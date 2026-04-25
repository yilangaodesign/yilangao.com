# Client Analytics Reference

> **What this file is:** A cross-cutting reference consumed by both engineering and content work streams. It is **not a hub** — it has no spokes of its own. Implementation details live in [`docs/engineering/analytics-instrumentation.md`](engineering/analytics-instrumentation.md); measurement strategy lives in [`docs/content/analytics-measurement.md`](content/analytics-measurement.md). The event registry below is the shared artifact both pillars reference.
>
> **Scope: client analytics only** (Mixpanel + Vercel Analytics). Server-side login analytics (`incrementLoginAnalytics`, `loginCount`, `lastLoginAt` on the Companies collection) is documented in [`docs/architecture.md`](architecture.md) §4.1 and the [`password-gate` skill](../.cursor/skills/password-gate/SKILL.md).
>
> **Last updated:** 2026-04-25 (initial creation from live code audit)

---

## System Overview

Two client-side analytics systems run in parallel:

| System | Package | What it captures |
|---|---|---|
| **Mixpanel** | `mixpanel-browser` | Custom events (12 listed below), company identity, super properties, session recordings, autocapture |
| **Vercel Analytics** | `@vercel/analytics` | Automatic page views, Web Vitals (CLS, FID, LCP, TTFB), route-level performance |

Server-side login analytics (`loginCount`, `lastLoginAt`) is a separate system — see [`docs/architecture.md`](architecture.md) §4.1.

## Data Flow

```
AnalyticsProvider (render-time init, not useEffect)
├── initMixpanel({ disable: isAdmin })
├── registerSuperProps({ is_owner }) — if yg_owner in localStorage
├── identifyCompany(companySlug) — useEffect, skips admin + "welcome"
├── track("Page Viewed") — useEffect on pathname change
├── useSessionTracker(companySlug) — repeat session detection
│
└── Child components call track() directly:
    ├── ProjectClient — Case Study Viewed, Section Reached, External Link Clicked
    ├── useEngagementTracker — Case Study Engaged, Deep Explorer, Case Study Dwell
    ├── HomeClient — Case Study Clicked
    ├── LoginClient — Sign In
    ├── ContactClient — Contact Form Submitted, Error
    └── SiteFooter — External Link Clicked
```

Render-time init is critical: React runs child `useEffect`s before parent `useEffect`s on mount, so if init were in a parent `useEffect`, children calling `track()` in their own `useEffect`s would fire before Mixpanel is ready. See [EAP-120](engineering-anti-patterns.md) for the incident.

## Event Registry

| Event Name | Properties | Firing Condition | Source File |
|---|---|---|---|
| **Sign In** | `login_method`, `success`, `company` | User submits the password form (fires on both success and failure) | `LoginClient.tsx` |
| **Page Viewed** | `page_path` | Every client-side route change (pathname differs from previous) | `AnalyticsProvider.tsx` |
| **Case Study Clicked** | `study_slug`, `position` | User clicks a case study link on the homepage | `HomeClient.tsx` |
| **Case Study Viewed** | `study_slug`, `has_personalization` | Case study page mounts (useEffect on slug) | `ProjectClient.tsx` |
| **Section Reached** | `study_slug`, `section_id`, `section_label` | ScrollSpy detects a new section entering the viewport | `ProjectClient.tsx` |
| **Case Study Engaged** | `case_study`, `content_format`, `dwell_seconds` | 5s active dwell AND scrolled past intro anchor (once per slug per session) | `use-engagement-tracker.ts` |
| **Case Study Dwell** | `case_study`, `content_format`, `dwell_seconds` | Case study unmounts (cleanup effect fires total active time) | `use-engagement-tracker.ts` |
| **Deep Explorer** | `case_studies_engaged`, `total_count` | 2+ distinct slugs reach "Engaged" tier in one session (fires once) | `use-engagement-tracker.ts` |
| **Repeat Session** | `session_number` | Returning visitor (session_count > 1) with qualifying action: 3s dwell OR second page navigation | `use-session-tracker.ts` |
| **External Link Clicked** | `destination_url`, `link_label`, `context` | User clicks an external link; `context` is `case_study_interactive`, `case_study_sidebar`, or `footer` | `ProjectClient.tsx`, `SiteFooter.tsx` |
| **Contact Form Submitted** | `success` | Contact form submit attempt completes (success or failure) | `ContactClient.tsx` |
| **Error** | `error_type`, `error_message`, `page_url` | Network error during contact form submission | `ContactClient.tsx` |

## Mixpanel Configuration

From [`src/lib/analytics/mixpanel.ts`](../src/lib/analytics/mixpanel.ts):

| Setting | Value | Why |
|---|---|---|
| `track_pageview` | `false` | Manual page view tracking in `AnalyticsProvider` gives control over pathname change detection |
| `persistence` | `"localStorage"` | Survives tab close; super properties persist across sessions |
| `autocapture` | `true` | Captures clicks, form submissions, page views automatically (supplements custom events) |
| `record_sessions_percent` | `100` | Full session recording for all visitors (low traffic volume makes sampling unnecessary) |

**Identity model:** `identifyCompany(companySlug)` sets the company slug as the Mixpanel distinct ID, creates a people profile with `company` property, and registers `company` as a super property on all events. The `is_owner` super property flags admin sessions (set from `yg_owner` localStorage flag). Admin sessions have Mixpanel disabled entirely (`initMixpanel({ disable: true })`).

## Where to Go Next

- **Adding or modifying an event?** Read [`docs/engineering/analytics-instrumentation.md`](engineering/analytics-instrumentation.md) for naming conventions, the how-to-add-event checklist, and provider architecture.
- **Interpreting data or deciding what to measure?** Read [`docs/content/analytics-measurement.md`](content/analytics-measurement.md) for event-to-question mapping and the engagement-to-retention-layer model.
- **Server-side login analytics?** Read [`docs/architecture.md`](architecture.md) §4.1 for `incrementLoginAnalytics`, `loginCount`, `lastLoginAt`.
