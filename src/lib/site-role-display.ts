/**
 * Site Config `role`: top-nav tagline and home identity line.
 * Keep in sync with Payload `site-config.role` defaults and seeds.
 */
export const SITE_ROLE_DISPLAY =
  "Designer, AI Systems & Experience · Goldman Sachs";

/** Normalize legacy CMS values so nav/home match the canonical line without a DB patch. */
export function resolveSiteRoleFromCms(stored: string | undefined | null): string {
  const t = (stored ?? "").trim();
  if (!t) return SITE_ROLE_DISPLAY;
  if (t === "AI Native Product Builder") return SITE_ROLE_DISPLAY;
  if (t === "AI-Native Product Builder. Currently at Goldman Sachs") return SITE_ROLE_DISPLAY;
  if (t === "Designer, AI Systems & Experience | Goldman Sachs") return SITE_ROLE_DISPLAY;
  return t;
}
