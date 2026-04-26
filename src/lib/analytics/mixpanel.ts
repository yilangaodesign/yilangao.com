import mixpanel from "mixpanel-browser";

type EventProperties = Record<string, string | number | boolean | null | undefined>;

let initialized = false;
let disabled = false;

/**
 * Initialize Mixpanel. No-ops when the token is missing or `disable` is true.
 * Safe to call multiple times — subsequent calls are ignored.
 */
export function initMixpanel(opts?: { disable?: boolean }) {
  if (initialized) return;
  if (opts?.disable) {
    disabled = true;
    initialized = true;
    return;
  }

  const token = process.env.NEXT_PUBLIC_MIXPANEL_TOKEN;
  if (!token) {
    disabled = true;
    initialized = true;
    return;
  }

  mixpanel.init(token, {
    track_pageview: false,
    persistence: "localStorage",
    autocapture: true,
    record_sessions_percent: 100,
  });

  initialized = true;
}

/**
 * Identify a visitor by company slug. Sets the company as a super property
 * so it auto-attaches to all subsequent events.
 */
export function identifyCompany(companySlug: string) {
  if (!initialized || disabled) return;
  mixpanel.identify(companySlug);
  mixpanel.people.set({ company: companySlug });
  mixpanel.register({ company: companySlug });
}

/**
 * Track an event. No-ops when Mixpanel is disabled (admin or missing token).
 */
export function track(event: string, properties?: EventProperties) {
  if (!initialized || disabled) return;
  mixpanel.track(event, properties);
}

/**
 * Register super properties that auto-attach to all subsequent events.
 * No-ops when Mixpanel is disabled (admin or missing token).
 */
export function registerSuperProps(props: Record<string, string | number | boolean>) {
  if (!initialized || disabled) return;
  mixpanel.register(props);
}

/**
 * Return the stable Mixpanel device ID for this browser/device.
 * Unlike `get_distinct_id()`, this value does NOT change after `identify()`.
 */
export function getDeviceId(): string | null {
  if (!initialized || disabled) return null;
  return mixpanel.get_property('$device_id') ?? null;
}
