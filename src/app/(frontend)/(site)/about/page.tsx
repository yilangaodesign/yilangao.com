import { getPayloadClient } from "@/lib/payload";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { RefreshRouteOnSave } from "@/components/RefreshRouteOnSave";
import AboutClient from "./AboutClient";

const FALLBACK_EXPERIENCE = [
  { role: "Product Designer", company: "Company Name", period: "2024 – Present" },
  { role: "UX Designer", company: "Company Name", period: "2022 – 2024" },
  { role: "Design Intern", company: "Company Name", period: "2021 – 2022" },
];

const FALLBACK_EDUCATION = [
  { degree: "M.S. Human-Computer Interaction", institution: "University Name", period: "2020 – 2022" },
  { degree: "B.A. Design", institution: "University Name", period: "2016 – 2020" },
];

export default async function AboutPage() {
  let experience = FALLBACK_EXPERIENCE;
  let education = FALLBACK_EDUCATION;
  const isAdmin = await isAdminAuthenticated();

  try {
    const payload = await getPayloadClient();
    const config = await payload.findGlobal({ slug: "site-config" });

    if (config?.experience && config.experience.length > 0) {
      experience = config.experience.map((e: { role: string; company: string; period: string }) => ({
        role: e.role,
        company: e.company,
        period: e.period,
      }));
    }

    if (config?.education && config.education.length > 0) {
      education = config.education.map((e: { degree: string; institution: string; period: string }) => ({
        degree: e.degree,
        institution: e.institution,
        period: e.period,
      }));
    }
  } catch {
    // Payload not connected — use fallback data
  }

  return (
    <>
      <RefreshRouteOnSave />
      <AboutClient experience={experience} education={education} isAdmin={isAdmin} />
    </>
  );
}
