import { getPayloadClient } from "@/lib/payload";
import { extractLexicalText, lexicalToHtml } from "@/lib/lexical";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { RefreshRouteOnSave } from "@/components/RefreshRouteOnSave";
import HomeClient from "./HomeClient";

const FALLBACK_TEAMS = [
  { name: "Company Name", url: "#", period: "" },
  { name: "Company Name", url: "#", period: "" },
  { name: "Company Name", url: "#", period: "" },
  { name: "Company Name", url: "#", period: "" },
  { name: "Company Name", url: "#", period: "" },
];

const FALLBACK_LINKS = [
  { label: "About", href: "/about", external: false },
  { label: "Experiments", href: "/experiments", external: false },
  { label: "Linkedin", href: "#", external: true },
  { label: "Instagram", href: "#", external: true },
  { label: "Twitter", href: "#", external: true },
];

const FALLBACK_PROJECTS = [
  { slug: "lacework", title: "Lacework", category: "Enterprise SaaS \u00b7 Data Visualization", featured: true },
  { slug: "elan-design-system", title: "\u00c9lan Design System", category: "Design Systems", featured: true },
  { slug: "project-three", title: "Project Title Three", category: "Productivity", featured: false },
  { slug: "project-four", title: "Project Title Four", category: "AI code editor", featured: false },
  { slug: "project-five", title: "Project Title Five", category: "Assistive AI Agents", featured: false },
  { slug: "project-six", title: "Project Title Six", category: "Conversational AI", featured: false },
  { slug: "project-seven", title: "Project Title Seven", category: "Editor Tool", featured: false },
  { slug: "project-eight", title: "Project Title Eight", category: "Data Visualization", featured: false },
  { slug: "project-ten", title: "Project Title Ten", category: "Conversational AI", featured: false },
  { slug: "project-eleven", title: "Project Title Eleven", category: "Productivity Tooling", featured: false },
  { slug: "project-nine", title: "Project Title Nine", category: "Industrial Design", featured: false },
  { slug: "project-twelve", title: "Project Title Twelve", category: "Multiplayer Art", featured: false },
];

const FALLBACK_TESTIMONIALS = [
  {
    text: "Working with Yilan was a transformative experience. The attention to detail and user-centered thinking elevated our product beyond expectations.",
    name: "Sarah Chen",
    role: "VP of Product, Acme Corp",
    linkedinUrl: "#",
  },
  {
    text: "The design system Yilan built for us became the foundation of everything we shipped. It was elegant, scalable, and a joy to work with.",
    name: "Jamie Okafor",
    role: "CTO, Initech",
    linkedinUrl: "#",
  },
];

export default async function Home() {
  let projects: { id?: string | number; slug: string; title: string; introBlurbHeadline?: string; category: string; featured: boolean; coverImage?: string | null; heroImageId?: string | number | null }[] = FALLBACK_PROJECTS;
  let testimonials: { id?: string | number; text: string; textHtml?: string; name: string; role: string; avatarUrl?: string | null; linkedinUrl?: string | null }[] = FALLBACK_TESTIMONIALS;
  let teams = FALLBACK_TEAMS;
  let links = FALLBACK_LINKS;
  let siteConfig = {
    name: "Yilan Gao", role: "UX Designer", location: "City, ST", email: "hello@example.com", bio: "",
    bioHtml: undefined as string | undefined,
    aboutLabel: "ABOUT", teamsLabel: "EXPERIENCE", linksLabel: "LINKS", footerCta: "Let's build something together.",
  };
  let gridOrder: { type: string; id: number }[] | null = null;
  const isAdmin = await isAdminAuthenticated();

  try {
    const payload = await getPayloadClient();

    const projectsRes = await payload.find({
      collection: "projects",
      sort: "order",
      limit: 50,
      depth: 1,
    });

    if (projectsRes.docs.length > 0) {
      projects = projectsRes.docs.map((p) => {
        const hero = p.heroImage as { id?: string | number; url?: string } | null | undefined;
        return {
          id: p.id,
          slug: p.slug,
          title: p.title,
          introBlurbHeadline: (p as Record<string, unknown>).introBlurbHeadline as string | undefined,
          category: p.category,
          featured: p.featured ?? false,
          coverImage: hero?.url ?? null,
          heroImageId: hero?.id ?? null,
        };
      });
    }

    const testimonialsRes = await payload.find({
      collection: "testimonials",
      sort: "order",
      limit: 20,
    });

    if (testimonialsRes.docs.length > 0) {
      testimonials = testimonialsRes.docs.map((t) => {
        const avatar = t.avatar as { url?: string } | null | undefined;
        const textHtml = lexicalToHtml(t.text);
        return {
          id: t.id,
          text: extractLexicalText(t.text),
          textHtml: textHtml !== extractLexicalText(t.text) ? textHtml : undefined,
          name: t.name,
          role: t.role,
          avatarUrl: avatar?.url ?? null,
          linkedinUrl: (t as Record<string, unknown>).linkedinUrl as string | null ?? null,
        };
      });
    }

    const config = await payload.findGlobal({ slug: "site-config" });
    if (config) {
      const cfg = config as Record<string, unknown>;
      const bioPlain = extractLexicalText(config.bio) || "";
      const bioHtml = lexicalToHtml(config.bio);
      siteConfig = {
        name: config.name ?? siteConfig.name,
        role: config.role ?? siteConfig.role,
        location: config.location ?? siteConfig.location,
        email: config.email ?? siteConfig.email,
        bio: bioPlain,
        bioHtml: bioHtml !== bioPlain ? bioHtml : undefined,
        aboutLabel: (cfg.aboutLabel as string) ?? siteConfig.aboutLabel,
        teamsLabel: (cfg.teamsLabel as string) ?? siteConfig.teamsLabel,
        linksLabel: (cfg.linksLabel as string) ?? siteConfig.linksLabel,
        footerCta: (cfg.footerCta as string) ?? siteConfig.footerCta,
      };

      if (config.teams && config.teams.length > 0) {
        teams = config.teams.map((t: { name: string; url?: string | null; period?: string | null }) => ({
          name: t.name,
          url: t.url ?? "#",
          period: t.period ?? "",
        }));
      }

      if (config.socialLinks && config.socialLinks.length > 0) {
        links = config.socialLinks.map((l: { label: string; href: string; external?: boolean | null }) => ({
          label: l.label,
          href: l.href,
          external: l.external ?? true,
        }));
      }

      if (Array.isArray(cfg.gridOrder) && cfg.gridOrder.length > 0) {
        gridOrder = cfg.gridOrder as { type: string; id: number }[];
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
        testimonials={testimonials}
        teams={teams}
        links={links}
        siteConfig={siteConfig}
        isAdmin={isAdmin}
        gridOrder={gridOrder}
      />
    </>
  );
}
