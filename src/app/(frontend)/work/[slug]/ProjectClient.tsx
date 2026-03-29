"use client";

import { useMemo } from "react";
import { FadeIn } from "@yilangaodesign/design-system";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import ScrollSpy from "@/components/ScrollSpy";
import AdminBar from "@/components/AdminBar";
import type { ScrollSpySection } from "@/components/ScrollSpy";
import styles from "./page.module.scss";

type ProjectSection = {
  heading: string;
  body: string;
  imageCount: number;
  caption: string | null;
};

type ProjectData = {
  id?: number;
  title: string;
  category: string;
  description: string;
  role: string;
  collaborators: string[];
  duration: string;
  tools: string[];
  externalLinks: { label: string; href: string }[];
  sections: ProjectSection[];
};

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export default function ProjectClient({ project, isAdmin }: { project: ProjectData; isAdmin?: boolean }) {
  const p = project;

  const spySections: ScrollSpySection[] = useMemo(
    () =>
      p.sections.map((s) => ({
        id: slugify(s.heading),
        label: s.heading,
      })),
    [p.sections],
  );

  const editUrl = p.id ? `/admin/collections/projects/${p.id}` : '/admin/collections/projects'

  return (
    <article className={styles.page} style={isAdmin ? { paddingTop: 44 } : undefined}>
      {isAdmin && <AdminBar editUrl={editUrl} editLabel={`Edit "${p.title}"`} />}
      <Navigation />
      <ScrollSpy sections={spySections} />

      <FadeIn>
        <div className={styles.heroImage} />
      </FadeIn>

      <div className={styles.container}>
        <FadeIn>
          <header className={styles.header}>
            <div className={styles.headerLeft}>
              <h1 className={styles.title}>{p.title}</h1>
              <span className={styles.category}>{p.category}</span>
            </div>
          </header>
        </FadeIn>

        <FadeIn>
          <div className={styles.intro}>
            <p className={styles.description}>{p.description}</p>
            <aside className={styles.meta}>
              <div className={styles.metaGroup}>
                <span className={styles.metaLabel}>Role</span>
                <span className={styles.metaValue}>{p.role}</span>
              </div>
              <div className={styles.metaGroup}>
                <span className={styles.metaLabel}>Collaborators</span>
                {p.collaborators.map((c) => (
                  <span key={c} className={styles.metaValue}>{c}</span>
                ))}
              </div>
              <div className={styles.metaGroup}>
                <span className={styles.metaLabel}>Duration</span>
                <span className={styles.metaValue}>{p.duration}</span>
              </div>
              <div className={styles.metaGroup}>
                <span className={styles.metaLabel}>Tools</span>
                <div className={styles.toolTags}>
                  {p.tools.map((t) => (
                    <span key={t} className={styles.toolTag}>{t}</span>
                  ))}
                </div>
              </div>
              <div className={styles.metaLinks}>
                {p.externalLinks.map((link) => (
                  <a key={link.label} href={link.href} target="_blank" rel="noopener noreferrer" className={styles.metaLink}>
                    {link.label}
                  </a>
                ))}
              </div>
            </aside>
          </div>
        </FadeIn>

        <hr className={styles.divider} />

        {p.sections.map((section, i) => (
          <section key={i} id={slugify(section.heading)} className={styles.contentSection}>
            <FadeIn>
              <h2 className={styles.sectionHeading}>{section.heading}</h2>
              <p className={styles.sectionBody}>{section.body}</p>
            </FadeIn>

            <FadeIn>
              {section.imageCount === 1 && (
                <div className={styles.imageBlock}>
                  <div className={styles.imagePlaceholder} />
                </div>
              )}
              {section.imageCount === 2 && (
                <div className={styles.imageGrid2}>
                  <div className={styles.imagePlaceholder} />
                  <div className={styles.imagePlaceholder} />
                </div>
              )}
              {section.imageCount >= 3 && (
                <div className={styles.imageGrid3}>
                  <div className={styles.imagePlaceholderWide} />
                  <div className={styles.imagePlaceholder} />
                  <div className={styles.imagePlaceholder} />
                </div>
              )}
              {section.caption && (
                <p className={styles.imageCaption}>{section.caption}</p>
              )}
            </FadeIn>

            {i < p.sections.length - 1 && <hr className={styles.divider} />}
          </section>
        ))}
      </div>

      <Footer />
    </article>
  );
}
