import { cookies } from "next/headers";
import { createHmac, timingSafeEqual } from "crypto";

const COOKIE_NAME = "portfolio_session";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

function getSecret(): string {
  return process.env.SESSION_SECRET || process.env.PAYLOAD_SECRET || "dev-secret-change-me";
}

function sign(value: string): string {
  const hmac = createHmac("sha256", getSecret());
  hmac.update(value);
  return `${value}.${hmac.digest("base64url")}`;
}

/**
 * Verify a signed cookie value and return the original payload, or null if invalid.
 * Safe to call from proxy.ts (no next/headers dependency).
 */
export function verifySessionValue(signed: string): string | null {
  const dotIndex = signed.lastIndexOf(".");
  if (dotIndex === -1) return null;

  const value = signed.slice(0, dotIndex);
  const expected = sign(value);

  const a = Buffer.from(signed);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return null;

  try {
    if (timingSafeEqual(a, b)) return value;
  } catch {
    return null;
  }
  return null;
}

/**
 * Read the session cookie via next/headers and return the company slug, or null.
 * Only usable in Server Components / Server Actions / Route Handlers.
 */
export async function getCompanyFromSession(): Promise<string | null> {
  const cookieStore = await cookies();
  const raw = cookieStore.get(COOKIE_NAME)?.value;
  if (!raw) return null;
  return verifySessionValue(raw);
}

export function createSignedValue(company: string): string {
  return sign(company);
}

export function getSessionCookieConfig(signedValue: string) {
  return {
    name: COOKIE_NAME,
    value: signedValue,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    maxAge: COOKIE_MAX_AGE,
    path: "/",
  };
}

const CONTRACTIONS: [RegExp, string][] = [
  [/you[\u0027\u2018\u2019\u02BC]?re/g, "you are"],
  [/we[\u0027\u2018\u2019\u02BC]?re/g, "we are"],
  [/they[\u0027\u2018\u2019\u02BC]?re/g, "they are"],
  [/it[\u0027\u2018\u2019\u02BC]?s/g, "it is"],
  [/i[\u0027\u2018\u2019\u02BC]?m/g, "i am"],
  [/don[\u0027\u2018\u2019\u02BC]?t/g, "do not"],
  [/can[\u0027\u2018\u2019\u02BC]?t/g, "can not"],
  [/won[\u0027\u2018\u2019\u02BC]?t/g, "will not"],
];

function normalizePassword(raw: string): string {
  let s = raw.toLowerCase();
  for (const [pattern, expansion] of CONTRACTIONS) {
    s = s.replace(pattern, expansion);
  }
  s = s.replace(/[\u0027\u2018\u2019\u02BC]/g, "");
  s = s.replace(/[-_\s]/g, "");
  return s;
}

export function comparePasswords(input: string, stored: string): boolean {
  const a = Buffer.from(normalizePassword(input));
  const b = Buffer.from(normalizePassword(stored));
  if (a.length !== b.length) return false;
  try {
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

export { COOKIE_NAME };
