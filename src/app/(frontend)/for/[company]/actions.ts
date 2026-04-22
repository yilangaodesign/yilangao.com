"use server";

import { cookies } from "next/headers";
import {
  comparePasswords,
  createSignedValue,
  getSessionCookieConfig,
} from "@/lib/company-session";
import { getCompanyBySlug, incrementLoginAnalytics } from "@/lib/company-data";

const SITE_PASSWORD = process.env.SITE_PASSWORD || "glad you are here";

export async function validatePassword(
  company: string,
  password: string,
): Promise<{ success: boolean; error?: string }> {
  const config = await getCompanyBySlug(company);

  if (config && !config.active) {
    return { success: false, error: "Access is no longer available" };
  }

  const storedPassword = config?.password ?? SITE_PASSWORD;
  const isValid = comparePasswords(password, storedPassword);

  if (!isValid) {
    return { success: false, error: "Incorrect password" };
  }

  const slug = config ? company : "unknown";
  const signed = createSignedValue(slug);
  const cookieConfig = getSessionCookieConfig(signed);

  const cookieStore = await cookies();
  cookieStore.set(cookieConfig);

  if (config) {
    await incrementLoginAnalytics(config.id);
  }

  return { success: true };
}
