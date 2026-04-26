<!-- graph metadata for docs knowledge graph (see docs/knowledge-graph.md) -->
---
type: spoke
id: engineering-analytics-instrumentation
topics:
  - engineering
  - analytics
derivedFrom:
  - engineering.md
---

# §16. Analytics Instrumentation

> **What this file is:** Engineering spoke for client-side analytics (Mixpanel + Vercel Analytics). Covers the provider architecture, hook internals, naming conventions, and how to add or modify events.
>
> **Who reads this:** Agents routed here by `AGENTS.md` Pre-Flight route 17 → `docs/analytics.md` → this file.
>
> **Last updated:** 2026-04-25 (initial creation)

---

## Provider Architecture

`AnalyticsProvider` (`src/components/AnalyticsProvider.tsx`) wraps the entire frontend layout. It handles:

1. **Render-time init** — `initMixpanel()` runs during the client render pass (guarded by `typeof window !== "undefined"`), not inside a `useEffect`. This is intentional: React 19 runs child passive effects before parent passive effects on mount. If init were in a parent `useEffect`, child components calling `track()` in their own `useEffect`s would fire before Mixpanel was ready. See **EAP-120** and **ENG-209** for the incident that established this pattern.

2. **Company identification** — `identifyCompany(companySlug)` runs in a `useEffect` when the company slug is available. Skipped for admin sessions and the `"welcome"` slug.

3. **Page view tracking** — `track("Page Viewed", { page_path })` fires in a `useEffect` on `pathname` change.

4. **Session tracking** — `useSessionTracker(companySlug)` is called at the provider level to detect repeat sessions.

**Admin bypass:** When `isAdmin` is true, `initMixpanel({ disable: true })` sets a module-level `disabled` flag. All subsequent `track()`, `identifyCompany()`, and `registerSuperProps()` calls no-op. Admin activity is invisible to Mixpanel.

**Owner flag:** If `yg_owner` exists in localStorage, `registerSuperProps({ is_owner: true })` tags all events. This distinguishes portfolio owner sessions from visitor sessions.

## Hook Internals

### `useEngagementTracker(slug, contentFormat)`

Tracks three tiers of case study engagement:

- **Case Study Engaged** (Tier 4): fires once per slug per session when BOTH conditions are met: (a) 5 seconds of active dwell time, AND (b) user has scrolled past the intro anchor (`#intro`, or first `h2[id]`/`h3[id]`). If no anchor is found, the scroll condition is auto-satisfied (time-only trigger).

- **Deep Explorer** (Tier 5): fires once per session when 2+ distinct slugs reach "Engaged" status. Uses module-level `engagedSlugs` Set that survives SPA navigation.

- **Case Study Dwell**: fires on component unmount with total active dwell time (paused during tab-hidden via `visibilitychange` events).

### `useSessionTracker(companySlug)`

Detects returning visitors and fires **Repeat Session** when `session_count > 1` AND a qualifying action occurs:

- **Qualifying actions:** 3-second dwell timer OR navigation to a second page (pathname change from initial).
- **Session counting:** Uses `sessionStorage` (cleared on tab close) with a `localStorage` timestamp fallback. The 5-minute `IOS_DEDUP_MS` gap prevents iOS Safari from over-counting sessions when it clears `sessionStorage` on app-switch.

## How to Add a New Event

1. **Add the `track()` call** in the appropriate component or hook. Use Title Case for the event name and snake_case for property keys. Include `page_path` or equivalent context when relevant.

2. **Update the event registry** in [`docs/analytics.md`](../analytics.md) — add a row to the Event Registry table with columns: `Event Name (Title Case)` | `Properties (snake_case)` | `Firing condition` | `Source file`. This is enforced by Engineering Guardrail 26 in AGENTS.md and verified by the static parity check in `npm run audit-docs`.

3. **Verify on localhost** — confirm the event fires in the Mixpanel debugger or browser console. Check that the event name and properties match the registry entry.

## Naming Conventions

| Element | Convention | Example |
|---|---|---|
| Event names | Title Case | `Case Study Engaged`, `External Link Clicked` |
| Property keys | snake_case | `study_slug`, `dwell_seconds`, `destination_url` |
| Context values | snake_case | `case_study_interactive`, `footer` |
| Boolean properties | bare name | `success`, `has_personalization` |

**Mandatory context:** Events that can fire on multiple pages should include a `page_path`, `context`, or `study_slug` property so they can be filtered by location in Mixpanel reports.

## Identity Model

| Concept | Implementation | Purpose |
|---|---|---|
| Visitor identity | `mixpanel.identify(companySlug)` | Groups all events from a company under one distinct ID |
| Company profile | `mixpanel.people.set({ company: companySlug })` | Creates a people record for the company |
| Company super property | `mixpanel.register({ company: companySlug })` | Auto-attaches `company` to all subsequent events |
| Owner flag | `registerSuperProps({ is_owner: true })` | Distinguishes owner sessions from visitor sessions |
| Admin bypass | `initMixpanel({ disable: true })` | Suppresses all tracking for Payload admin sessions |

## Cross-References

- **EAP-120** — Client analytics `init` only in parent `useEffect` while children `track` in `useEffect`. The anti-pattern that motivated render-time init.
- **ENG-209** — The incident report for the Mixpanel `before_track` crash.
- **`docs/analytics.md`** — Event registry (the shared artifact this spoke references).
- **`docs/content/analytics-measurement.md`** — How events map to portfolio optimization questions.
