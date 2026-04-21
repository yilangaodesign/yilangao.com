import { Navigation } from "@/components/ui/Navigation";
import { SiteFooter } from "@/components/SiteFooter";
import type { SiteFooterConfig } from "@/components/SiteFooter";
import { getPayloadClient } from "@/lib/payload";
import { extractLexicalText, lexicalToHtml } from "@/lib/lexical";
import { resolveSiteRoleFromCms } from "@/lib/site-role-display";
import styles from "./layout.module.scss";

/** Canonical targets when CMS `href` is empty or when using layout fallbacks. */
const FOOTER_LINK_DEFAULTS_BY_LABEL: Record<
  string,
  { href: string; external: boolean }
> = {
  "Élan Design System": {
    href: "https://yilangao-design-system.vercel.app/",
    external: true,
  },
  Resume: {
    href: "https://drive.google.com/file/d/1IMSeearuPglNJV8MH20Z-BCnhi2idITz/view?usp=sharing",
    external: true,
  },
  Linkedin: {
    href: "https://www.linkedin.com/in/yilangao/",
    external: true,
  },
};

function resolveFooterSocialLink(l: {
  label: string;
  href: string;
  external?: boolean | null;
}) {
  const trimmed = (l.href ?? "").trim();
  if (trimmed) {
    return { label: l.label, href: trimmed, external: l.external ?? true };
  }
  const def = FOOTER_LINK_DEFAULTS_BY_LABEL[l.label];
  if (def) {
    return { label: l.label, href: def.href, external: def.external };
  }
  return { label: l.label, href: trimmed, external: l.external ?? true };
}

const FALLBACK_TEAMS = [
  { name: "Company Name", url: "#", period: "" },
  { name: "Company Name", url: "#", period: "" },
  { name: "Company Name", url: "#", period: "" },
  { name: "Company Name", url: "#", period: "" },
  { name: "Company Name", url: "#", period: "" },
];

const FALLBACK_LINKS = (
  Object.entries(FOOTER_LINK_DEFAULTS_BY_LABEL) as [
    string,
    { href: string; external: boolean },
  ][]
).map(([label, rest]) => ({ label, ...rest }));

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
            ? config.socialLinks.map((l: { label: string; href: string; external?: boolean | null }) =>
                resolveFooterSocialLink(l),
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
