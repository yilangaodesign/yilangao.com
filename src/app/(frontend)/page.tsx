import { getPayloadClient } from "@/lib/payload";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { RefreshRouteOnSave } from "@/components/RefreshRouteOnSave";
import HomeClient from "./HomeClient";

const FALLBACK_TEAMS = [
  { name: "Company Name", url: "#" },
  { name: "Company Name", url: "#" },
  { name: "Company Name", url: "#" },
  { name: "Company Name", url: "#" },
  { name: "Company Name", url: "#" },
];

const FALLBACK_LINKS = [
  { label: "Reading", href: "/reading", external: false },
  { label: "Linkedin", href: "#", external: true },
  { label: "Instagram", href: "#", external: true },
  { label: "Twitter", href: "#", external: true },
];

const FALLBACK_PROJECTS = [
  { slug: "project-one", title: "Project Title One", category: "Digital toolmaking", featured: true },
  { slug: "project-two", title: "Project Title Two", category: "Consumer Product", featured: true },
  { slug: "project-three", title: "Project Title Three", category: "Productivity", featured: true },
  { slug: "project-four", title: "Project Title Four", category: "AI code editor", featured: false },
  { slug: "project-five", title: "Project Title Five", category: "Assistive AI Agents", featured: false },
  { slug: "project-six", title: "Project Title Six", category: "Conversational AI", featured: false },
  { slug: "project-seven", title: "Project Title Seven", category: "Editor Tool", featured: false },
  { slug: "project-eight", title: "Project Title Eight", category: "Data Visualization", featured: false },
  { slug: "project-nine", title: "Project Title Nine", category: "Industrial Design", featured: false },
  { slug: "project-ten", title: "Project Title Ten", category: "Conversational AI", featured: false },
  { slug: "project-eleven", title: "Project Title Eleven", category: "Productivity Tooling", featured: false },
  { slug: "project-twelve", title: "Project Title Twelve", category: "Multiplayer Art", featured: false },
];

export default async function Home() {
  let projects: { id?: number; slug: string; title: string; category: string; featured: boolean }[] = FALLBACK_PROJECTS;
  let teams = FALLBACK_TEAMS;
  let links = FALLBACK_LINKS;
  let siteConfig = { name: "Yilan Gao", role: "UX Designer", location: "City, ST", email: "hello@example.com" };
  const isAdmin = await isAdminAuthenticated();

  try {
    const payload = await getPayloadClient();

    const projectsRes = await payload.find({
      collection: "projects",
      sort: "order",
      limit: 50,
    });

    if (projectsRes.docs.length > 0) {
      projects = projectsRes.docs.map((p) => ({
        id: p.id,
        slug: p.slug,
        title: p.title,
        category: p.category,
        featured: p.featured ?? false,
      }));
    }

    const config = await payload.findGlobal({ slug: "site-config" });
    if (config) {
      siteConfig = {
        name: config.name ?? siteConfig.name,
        role: config.role ?? siteConfig.role,
        location: config.location ?? siteConfig.location,
        email: config.email ?? siteConfig.email,
      };

      if (config.teams && config.teams.length > 0) {
        teams = config.teams.map((t: { name: string; url?: string | null }) => ({
          name: t.name,
          url: t.url ?? "#",
        }));
      }

      if (config.socialLinks && config.socialLinks.length > 0) {
        links = config.socialLinks.map((l: { label: string; href: string; external?: boolean | null }) => ({
          label: l.label,
          href: l.href,
          external: l.external ?? true,
        }));
      }
    }
  } catch {
    // Payload not connected — use fallback data
  }

  return (
    <>
      <RefreshRouteOnSave />
      <HomeClient
        projects={projects}
        teams={teams}
        links={links}
        siteConfig={siteConfig}
        isAdmin={isAdmin}
      />
    </>
  );
}
