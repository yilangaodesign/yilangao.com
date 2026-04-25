'use client'

import Link from "next/link";
import { EditableText, EditableArray } from "@/components/inline-edit";
import type { ApiTarget, FieldDefinition } from "@/components/inline-edit";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { track } from "@/lib/analytics/mixpanel";
import styles from "./SiteFooter.module.scss";

export const SITE_CONFIG_FOOTER_TARGET: ApiTarget = { type: "global", slug: "site-config" };

type Team = { name: string; url: string; period: string };
type SocialLink = { label: string; href: string; external: boolean };

export type SiteFooterConfig = {
  email: string;
  bio?: string;
  bioHtml?: string;
  aboutLabel?: string;
  teamsLabel?: string;
  linksLabel?: string;
  teams?: Team[];
  links?: SocialLink[];
};

const TEAM_FIELDS: FieldDefinition[] = [
  { name: 'name', label: 'Company', type: 'text', required: true },
  { name: 'period', label: 'Period', type: 'text' },
  { name: 'url', label: 'Website', type: 'url' },
];

const LINK_FIELDS: FieldDefinition[] = [
  { name: 'label', label: 'Label', type: 'text', required: true },
  { name: 'href', label: 'URL or File', type: 'media-url' },
  { name: 'external', label: 'Open in new tab', type: 'checkbox' },
];

export function SiteFooter({ siteConfig }: { siteConfig: SiteFooterConfig }) {
  const teams = siteConfig.teams ?? [];
  const links = siteConfig.links ?? [];

  return (
    <footer className={styles.footer}>
      <div className={styles.footerInner}>
        <div className={styles.footerColumns}>
          <section className={`${styles.footerColumn} ${styles.footerColumnAbout}`}>
            <Eyebrow as="h2" className={styles.columnLabel}>
              <EditableText
                fieldId="sc:aboutLabel"
                target={SITE_CONFIG_FOOTER_TARGET}
                fieldPath="aboutLabel"
                label="Section Label"
              >
                {siteConfig.aboutLabel ?? "ABOUT"}
              </EditableText>
            </Eyebrow>
            <EditableText
              fieldId="sc:bio"
              target={SITE_CONFIG_FOOTER_TARGET}
              fieldPath="bio"
              as="p"
              className={styles.footerBio}
              multiline
              isRichText
              htmlContent={siteConfig.bioHtml}
              label="Bio"
            >
              {siteConfig.bio || ""}
            </EditableText>
          </section>

          {teams.length > 0 && (
            <section className={styles.footerColumn}>
              <Eyebrow as="h2" className={styles.columnLabel}>
                <EditableText
                  fieldId="sc:teamsLabel"
                  target={SITE_CONFIG_FOOTER_TARGET}
                  fieldPath="teamsLabel"
                  label="Section Label"
                >
                  {siteConfig.teamsLabel ?? "EXPERIENCE"}
                </EditableText>
              </Eyebrow>
              <EditableArray<Team>
                fieldId="sc:teams"
                target={SITE_CONFIG_FOOTER_TARGET}
                fieldPath="teams"
                items={teams}
                itemFields={TEAM_FIELDS}
                label="Experience"
                renderItem={(team, i) => (
                  <li key={i} className={styles.teamItem}>
                    {team.url && team.url !== '#' ? (
                      <a href={team.url} target="_blank" rel="noopener noreferrer" className={styles.teamLink}
                        onClick={() => track("External Link Clicked", {
                          destination_url: team.url,
                          link_label: team.name,
                          context: "footer",
                        })}
                      >
                        {team.name}<span className={styles.arrow}>&#8599;</span>
                      </a>
                    ) : (
                      <span className={styles.teamLink}>{team.name}</span>
                    )}
                    <span className={styles.teamPeriod}>{team.period || (i + 1)}</span>
                  </li>
                )}
                as="ul"
                className={styles.teamsList}
              />
            </section>
          )}

          {links.length > 0 && (
            <section className={styles.footerColumn}>
              <Eyebrow as="h2" className={styles.columnLabel}>
                <EditableText
                  fieldId="sc:linksLabel"
                  target={SITE_CONFIG_FOOTER_TARGET}
                  fieldPath="linksLabel"
                  label="Section Label"
                >
                  {siteConfig.linksLabel ?? "LINKS"}
                </EditableText>
              </Eyebrow>
              <EditableArray<SocialLink>
                fieldId="sc:socialLinks"
                target={SITE_CONFIG_FOOTER_TARGET}
                fieldPath="socialLinks"
                items={links}
                itemFields={LINK_FIELDS}
                label="Links"
                newItemDefaults={{ external: true } as Partial<SocialLink>}
                renderItem={(link) => (
                  <li key={link.label} className={styles.linkItem}>
                    {link.external ? (
                      <a href={link.href} target="_blank" rel="noopener noreferrer" className={styles.externalLink}
                        onClick={() => track("External Link Clicked", {
                          destination_url: link.href,
                          link_label: link.label,
                          context: "footer",
                        })}
                      >
                        {link.label}<span className={styles.arrow}>&#8599;</span>
                      </a>
                    ) : (
                      <Link href={link.href} className={styles.externalLink}
                        onClick={() => track("External Link Clicked", {
                          destination_url: link.href,
                          link_label: link.label,
                          context: "footer",
                        })}
                      >
                        {link.label}<span className={styles.arrow}>&#8599;</span>
                      </Link>
                    )}
                  </li>
                )}
                as="ul"
                className={styles.linksList}
              />
            </section>
          )}

          <section className={styles.footerColumn}>
            <Eyebrow as="h2" className={styles.columnLabel}>Contact</Eyebrow>
            <EditableText
              fieldId="sc:email"
              target={SITE_CONFIG_FOOTER_TARGET}
              fieldPath="email"
              as="a"
              href={`mailto:${siteConfig.email}`}
              className={styles.footerEmail}
              label="Email"
            >
              {siteConfig.email}
            </EditableText>
          </section>
        </div>
      </div>
    </footer>
  );
}
