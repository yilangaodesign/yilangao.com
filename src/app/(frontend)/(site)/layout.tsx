import { Navigation } from "@/components/ui/Navigation";
import { SiteFooter } from "@/components/SiteFooter";
import type { SiteFooterConfig } from "@/components/SiteFooter";
import { getPayloadClient } from "@/lib/payload";
import { extractLexicalText, lexicalToHtml } from "@/lib/lexical";
import { resolveSiteRoleFromCms } from "@/lib/site-role-display";
import styles from "./layout.module.scss";

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

export default async function SiteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  let role = "";
  let footerConfig: SiteFooterConfig = {
    email: "hello@example.com",
    bio: "",
    aboutLabel: "ABOUT",
    teamsLabel: "EXPERIENCE",
    linksLabel: "LINKS",
    teams: FALLBACK_TEAMS,
    links: FALLBACK_LINKS,
  };

  try {
    const payload = await getPayloadClient();
    const config = await payload.findGlobal({ slug: "site-config" });

    if (config) {
      if (config.role) role = config.role;

      const cfg = config as Record<string, unknown>;
      const bioPlain = extractLexicalText(config.bio) || "";
      const bioHtml = lexicalToHtml(config.bio);

      footerConfig = {
        email: config.email ?? footerConfig.email,
        bio: bioPlain,
        bioHtml: bioHtml !== bioPlain ? bioHtml : undefined,
        aboutLabel: (cfg.aboutLabel as string) ?? footerConfig.aboutLabel,
        teamsLabel: (cfg.teamsLabel as string) ?? footerConfig.teamsLabel,
        linksLabel: (cfg.linksLabel as string) ?? footerConfig.linksLabel,
        teams:
          config.teams && config.teams.length > 0
            ? config.teams.map(
                (t: { name: string; url?: string | null; period?: string | null }) => ({
                  name: t.name,
                  url: t.url ?? "#",
                  period: t.period ?? "",
                }),
              )
            : footerConfig.teams,
        links:
          config.socialLinks && config.socialLinks.length > 0
            ? config.socialLinks.map(
                (l: { label: string; href: string; external?: boolean | null }) => ({
                  label: l.label,
                  href: l.href,
                  external: l.external ?? true,
                }),
              )
            : footerConfig.links,
      };
    }
  } catch {
    // Payload not connected — use fallback data
  }

  return (
    <div className={styles.siteWrapper}>
      <Navigation appearance="solid" tagline={resolveSiteRoleFromCms(role)} />
      <div className={styles.contentArea}>
        <div className={styles.contentAreaInner}>
          {children}
        </div>
      </div>
      <SiteFooter siteConfig={footerConfig} />
    </div>
  );
}
