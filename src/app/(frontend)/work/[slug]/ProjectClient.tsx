"use client";

import { FadeIn } from "@yilangaodesign/design-system";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import styles from "./page.module.scss";

type ProjectSection = {
  heading: string;
  body: string;
  imageCount: number;
  caption: string | null;
};

type ProjectData = {
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

export default function ProjectClient({ project }: { project: ProjectData }) {
  const p = project;

  return (
    <article className={styles.page}>
      <Navigation />

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
          <section key={i} className={styles.contentSection}>
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
