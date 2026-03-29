"use client";

import Link from "next/link";
import { FadeIn } from "@yilangaodesign/design-system";
import { StaggerChildren, StaggerItem } from "@yilangaodesign/design-system";
import AdminBar from "@/components/AdminBar";
import EditButton from "@/components/EditButton";
import { EditGlobalButton } from "@/components/EditButton";
import styles from "./page.module.scss";

type Project = {
  id?: number;
  slug: string;
  title: string;
  category: string;
  featured: boolean;
};

type Team = { name: string; url: string };
type SocialLink = { label: string; href: string; external: boolean };
type SiteIdentity = { name: string; role: string; location: string; email: string };

function ProjectCard({ project, isAdmin }: { project: Project; isAdmin?: boolean }) {
  return (
    <Link href={`/work/${project.slug}`} className={`${styles.projectCard} ${project.featured ? styles.projectCardFeatured : ""}`}>
      <div className={styles.projectHero}>
        <div className={styles.projectImage} />
        {isAdmin && project.id && (
          <EditButton collection="projects" id={project.id} label={`Edit ${project.title}`} />
        )}
      </div>
      <div className={styles.projectInfo}>
        <h3 className={styles.projectTitle}>{project.title}</h3>
        <span className={styles.projectCategory}>{project.category}</span>
      </div>
    </Link>
  );
}

export default function HomeClient({
  projects,
  teams,
  links,
  siteConfig,
  isAdmin,
}: {
  projects: Project[];
  teams: Team[];
  links: SocialLink[];
  siteConfig: SiteIdentity;
  isAdmin?: boolean;
}) {
  return (
    <main className={styles.page} style={isAdmin ? { paddingTop: 44 } : undefined}>
      {isAdmin && <AdminBar editUrl="/admin/globals/site-config" editLabel="Edit Site Config" />}
      <div className={styles.layout}>
        <aside className={styles.sidebar}>
          <div className={styles.sidebarInner}>
            <FadeIn>
              <header className={styles.identity}>
                <h1 className={styles.name}>
                  {siteConfig.name}
                  {isAdmin && <EditGlobalButton global="site-config" label="Edit identity" />}
                </h1>
                <p className={styles.role}>{siteConfig.role}</p>
                <p className={styles.location}>{siteConfig.location}</p>
              </header>
            </FadeIn>

            <FadeIn delay={0.1}>
              <section className={styles.about}>
                <h2 className={styles.sectionLabel}>ABOUT</h2>
                <p className={styles.aboutText}>
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod
                  tempor incididunt ut labore et dolore magna aliqua. At the moment,
                  interested in how tools connect with each other, how they act on our
                  behalf, and how we interact with them across different modes. Currently at{" "}
                  <a href="#" className={styles.inlineLink}>Company Name</a>, an applied
                  research lab building AI tooling for software creation. Studied{" "}
                  <a href="#" className={styles.inlineLink}>Design Program</a> and{" "}
                  <a href="#" className={styles.inlineLink}>HCI Program</a> at University
                  Name. If you have an interesting idea,{" "}
                  <a href={`mailto:${siteConfig.email}`} className={styles.inlineLink}>get in touch</a>.
                </p>
              </section>
            </FadeIn>

            <FadeIn delay={0.2}>
              <section className={styles.teams}>
                <h2 className={styles.sectionLabel}>Teams</h2>
                <ul className={styles.teamsList}>
                  {teams.map((team, i) => (
                    <li key={i} className={styles.teamItem}>
                      <a href={team.url} className={styles.teamLink}>
                        {team.name}
                      </a>
                      <span className={styles.teamNum}>{i + 1}</span>
                    </li>
                  ))}
                </ul>
              </section>
            </FadeIn>

            <FadeIn delay={0.3}>
              <section className={styles.links}>
                <h2 className={styles.sectionLabel}>Links</h2>
                <ul className={styles.linksList}>
                  {links.map((link) => (
                    <li key={link.label}>
                      {link.external ? (
                        <a href={link.href} target="_blank" rel="noopener noreferrer" className={styles.externalLink}>
                          {link.label}<span className={styles.arrow}>&#8599;</span>
                        </a>
                      ) : (
                        <Link href={link.href} className={styles.externalLink}>
                          {link.label}<span className={styles.arrow}>&#8599;</span>
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              </section>
            </FadeIn>
          </div>
        </aside>

        <section className={styles.main}>
          <StaggerChildren className={styles.projectGrid}>
            {projects.map((project) => (
              <StaggerItem key={project.slug} className={project.featured ? styles.gridItemFeatured : styles.gridItem}>
                <ProjectCard project={project} isAdmin={isAdmin} />
              </StaggerItem>
            ))}
          </StaggerChildren>
        </section>
      </div>

      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <span className={styles.footerVersion}>v0.2.0</span>
          <span className={styles.footerUpdated}>Last updated {new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" })}</span>
          <div className={styles.footerLinks}>
            {links.filter((l) => l.external).map((link) => (
              <a key={link.label} href={link.href} target="_blank" rel="noopener noreferrer" className={styles.footerLink}>
                {link.label}<span className={styles.arrow}>&#8599;</span>
              </a>
            ))}
          </div>
          <span className={styles.footerCta}>
            Let&apos;s build something together.
          </span>
          <a href={`mailto:${siteConfig.email}`} className={styles.footerEmail}>
            {siteConfig.email}<span className={styles.arrow}>&#8599;</span>
          </a>
        </div>
      </footer>
    </main>
  );
}
