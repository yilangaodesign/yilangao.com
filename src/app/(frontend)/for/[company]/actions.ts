"use server";

import { cookies } from "next/headers";
import {
  comparePasswords,
  createSignedValue,
  getSessionCookieConfig,
} from "@/lib/company-session";
import companiesData from "@/config/companies.json";

type CompanyConfig = {
  name: string;
  password: string;
  theme: { accent: string; greeting: string };
  caseStudyNotes: Record<string, string>;
};

const companies = companiesData as Record<string, CompanyConfig>;

const SITE_PASSWORD = process.env.SITE_PASSWORD || "preview-2026";

export async function validatePassword(
  company: string,
  password: string,
): Promise<{ success: boolean; error?: string }> {
  const config = companies[company];

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

  return { success: true };
}
