"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import Link from "next/link";
import styles from "./page.module.scss";

// ---------------------------------------------------------------------------
// PLACEHOLDER DATA (all wireframe — content TBD)
// ---------------------------------------------------------------------------

const PROJECT = {
  title: "Case Study Title That Describes the Project Work",
  meta: [
    { label: "Role", value: "Role Description" },
    { label: "Timeline", value: "Q1 – Q2 2026" },
    { label: "Tools", value: "Tool A, Tool B, Tool C" },
    { label: "Client", value: "Client Name" },
  ],
  tags: ["Tag A", "Tag B", "Tag C"],
  stats: [
    { value: "40%", label: "Stat description placeholder" },
    { value: "3x", label: "Stat description placeholder" },
    { value: "12", label: "Stat description placeholder" },
  ],
  sections: [
    {
      heading: "Section Heading One",
      body: [
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
        "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
      ],
      image: true,
    },
    {
      heading: "Section Heading Two",
      body: [
        "Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.",
        "Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt.",
      ],
      quote: {
        text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. This is a highlighted client or stakeholder quote that emphasizes impact.",
        author: "Name Surname",
        role: "Title @ Organization",
      },
    },
    {
      heading: "Section Heading Three",
      body: [
        "At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti quos dolores et quas molestias excepturi sint occaecati cupiditate non provident.",
        "Similique sunt in culpa qui officia deserunt mollitia animi, id est laborum et dolorum fuga. Et harum quidem rerum facilis est et expedita distinctio.",
      ],
      image: true,
    },
    {
      heading: "Section Heading Four",
      body: [
        "Nam libero tempore, cum soluta nobis est eligendi optio cumque nihil impedit quo minus id quod maxime placeat facere possimus, omnis voluptas assumenda est, omnis dolor repellendus.",
        "Temporibus autem quibusdam et aut officiis debitis aut rerum necessitatibus saepe eveniet ut et voluptates repudiandae sint et molestiae non recusandae.",
      ],
      quote: {
        text: "Another impactful quote that demonstrates results or a key insight from the project work.",
        author: "Name Surname",
        role: "Title @ Organization",
      },
    },
    {
      heading: "Results & Reflection",
      body: [
        "Itaque earum rerum hic tenetur a sapiente delectus, ut aut reiciendis voluptatibus maiores alias consequatur aut perferendis doloribus asperiores repellat.",
        "Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae consequatur, vel illum qui dolorem eum fugiat quo voluptas nulla pariatur.",
      ],
      image: true,
    },
  ],
  nextProject: {
    title: "Next Project Title",
    slug: "next-project",
  },
};

// ---------------------------------------------------------------------------
// ANIMATION HELPERS
// ---------------------------------------------------------------------------

function FadeIn({ children, className }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.15, margin: "-40px" });
  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.65, ease: [0.2, 0, 0.38, 0.9] }}
    >
      {children}
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// PAGE
// ---------------------------------------------------------------------------

export default function CaseStudyPage() {
  const p = PROJECT;

  return (
    <article className={styles.page}>
      <header className={styles.nav}>
        <div className={styles.navInner}>
          <Link href="/" className={styles.navLogo}>Logo.</Link>
          <nav className={styles.navLinks}>
            <Link href="/#services" className={styles.navLink}>Link</Link>
            <Link href="/#work" className={styles.navLink}>Link</Link>
            <Link href="/#testimonials" className={styles.navLink}>Link</Link>
            <Link href="/contact" className={styles.navCta}>Link</Link>
          </nav>
        </div>
      </header>
      <div className={styles.layout}>

        {/* ── STICKY SIDEBAR (left) ────────────────────────────── */}
        <aside className={styles.sidebar}>
          <div className={styles.sidebarInner}>
            <Link href="/#work" className={styles.backLink}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Back to Work
            </Link>

            <div className={styles.thumbRow}>
              <Link href="/work/prev-project" className={styles.thumbCard}>
                <div className={styles.thumbImage} />
                <span className={styles.thumbLabel}>Previous</span>
                <span className={styles.thumbTitle}>Project Title</span>
              </Link>
              <Link href={`/work/${p.nextProject.slug}`} className={styles.thumbCard}>
                <div className={styles.thumbImage} />
                <span className={styles.thumbLabel}>Next</span>
                <span className={styles.thumbTitle}>{p.nextProject.title}</span>
              </Link>
            </div>

            <div className={styles.sidebarMeta}>
              {p.meta.map((m) => (
                <div key={m.label} className={styles.metaItem}>
                  <span className={styles.metaLabel}>{m.label}</span>
                  <span className={styles.metaValue}>{m.value}</span>
                </div>
              ))}
            </div>

            <div className={styles.sidebarCta}>
              <p className={styles.sidebarCtaText}>Interested in working together?</p>
              <Link href="/#contact" className={styles.sidebarCtaButton}>Get In Touch</Link>
            </div>
          </div>
        </aside>

        {/* ── MAIN CONTENT (right, scrollable) ─────────────────── */}
        <main className={styles.content}>

          {/* Hero title + tags */}
          <header className={styles.hero}>
            <h1 className={styles.heroTitle}>{p.title}</h1>
            <div className={styles.heroTags}>
              {p.tags.map((t) => (
                <span key={t} className={styles.tag}>{t}</span>
              ))}
            </div>
          </header>

          {/* Key stat callout */}
          <FadeIn>
            <div className={styles.statsRow}>
              {p.stats.map((s, i) => (
                <div key={i} className={styles.stat}>
                  <span className={styles.statValue}>{s.value}</span>
                  <span className={styles.statLabel}>{s.label}</span>
                </div>
              ))}
            </div>
          </FadeIn>

          {/* Hero image */}
          <FadeIn>
            <div className={styles.heroImage} />
          </FadeIn>

          {/* Intro */}
          <FadeIn>
            <p className={styles.introText}>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod
              tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam,
              quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
              Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu
              fugiat nulla pariatur.
            </p>
          </FadeIn>

          {/* Content sections */}
          {p.sections.map((s, i) => (
            <section key={i} className={styles.contentSection}>
              <FadeIn>
                <h2 className={styles.sectionHeading}>{s.heading}</h2>
                {s.body.map((para, j) => (
                  <p key={j} className={styles.bodyText}>{para}</p>
                ))}
              </FadeIn>

              {s.quote && (
                <FadeIn>
                  <blockquote className={styles.pullQuote}>
                    <p className={styles.pullQuoteText}>&ldquo;{s.quote.text}&rdquo;</p>
                    <footer className={styles.pullQuoteAttrib}>
                      <span className={styles.pullQuoteName}>{s.quote.author}</span>
                      <span className={styles.pullQuoteRole}>{s.quote.role}</span>
                    </footer>
                  </blockquote>
                </FadeIn>
              )}

              {s.image && (
                <FadeIn>
                  <div className={styles.sectionImage} />
                </FadeIn>
              )}
            </section>
          ))}

          {/* Bottom CTA */}
          <FadeIn className={styles.bottomCta}>
            <h2 className={styles.ctaHeading}>Like what you see?</h2>
            <p className={styles.ctaSub}>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
            <Link href="/#contact" className={styles.ctaButton}>Get In Touch</Link>
          </FadeIn>

          {/* Next project */}
          <FadeIn>
            <Link href={`/work/${p.nextProject.slug}`} className={styles.nextProject}>
              <span className={styles.nextLabel}>Next Project</span>
              <span className={styles.nextTitle}>{p.nextProject.title}</span>
              <svg className={styles.nextArrow} width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M5 12h14m0 0l-5-5m5 5l-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
          </FadeIn>
        </main>
      </div>
    </article>
  );
}
