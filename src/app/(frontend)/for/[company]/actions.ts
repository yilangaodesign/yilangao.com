"use server";

import { cookies } from "next/headers";
import {
  comparePasswords,
  createSignedValue,
  getSessionCookieConfig,
} from "@/lib/company-session";
import { getCompanyBySlug, incrementLoginAnalytics } from "@/lib/company-data";

const SITE_PASSWORD = process.env.SITE_PASSWORD || "glad you are here";
const HARDCODED_FALLBACK = "glad you are here";

export async function validatePassword(
  company: string,
  password: string,
): Promise<{ success: boolean; error?: string }> {
  const config = await getCompanyBySlug(company);

  if (config && !config.active) {
    return { success: false, error: "Access is no longer available" };
  }

  const storedPassword = config?.password ?? SITE_PASSWORD;
  const altPasswords = config?.altPasswords ?? [];
  const isValid =
    comparePasswords(password, storedPassword) ||
    altPasswords.some((alt) => comparePasswords(password, alt)) ||
    comparePasswords(password, SITE_PASSWORD) ||
    comparePasswords(password, HARDCODED_FALLBACK);

  if (!isValid) {
    return { success: false, error: "Incorrect password" };
  }

  const adminPw = config?.adminPassword
    ?? (company === "welcome" ? (process.env.ANALYTICS_OWNER_KEY ?? "yg-owner-2026") : undefined);
  const isAdminPw = adminPw ? comparePasswords(password, adminPw) : false;

  const slug = config ? company : "welcome";
  const signed = createSignedValue(slug);
  const cookieConfig = getSessionCookieConfig(signed);

  const cookieStore = await cookies();
  cookieStore.set(cookieConfig);

  if (isAdminPw) {
    cookieStore.set("yg_owner", "1", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30,
      path: "/",
    });
  }

  if (config) {
    await incrementLoginAnalytics(config.id);
  }

  return { success: true };
}
