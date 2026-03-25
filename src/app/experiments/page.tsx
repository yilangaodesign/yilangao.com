"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import styles from "./page.module.scss";

// ---------------------------------------------------------------------------
// DATA
// ---------------------------------------------------------------------------

interface Experiment {
  id: string;
  num: string;
  title: string;
  description: string;
  tags: string[];
  date: string;
}

const EXPERIMENTS: Experiment[] = [
  {
    id: "ascii-shader",
    num: "01",
    title: "ASCII Shader Engine",
    description:
      "Real-time WebGL shader that converts any video feed into dynamic ASCII art. Built with custom GLSL fragment shaders and a character-density mapping algorithm.",
    tags: ["WebGL", "GLSL", "Creative Coding"],
    date: "Mar 2026",
  },
  {
    id: "generative-grid",
    num: "02",
    title: "Generative Grid System",
    description:
      "A procedurally generated layout engine that creates unique editorial compositions on every page load, inspired by Swiss design and computational art.",
    tags: ["Generative Art", "Canvas API", "Typography"],
    date: "Feb 2026",
  },
  {
    id: "spatial-audio",
    num: "03",
    title: "Spatial Audio Visualizer",
    description:
      "3D audio-reactive environment built with Three.js and the Web Audio API. Sound frequency data drives particle behavior, color fields, and camera movement in real time.",
    tags: ["Three.js", "Web Audio", "3D"],
    date: "Jan 2026",
  },
  {
    id: "scroll-physics",
    num: "04",
    title: "Scroll Physics Playground",
    description:
      "An exploration of inertia, spring dynamics, and momentum-based scroll interactions. Each section demonstrates a different physics model driving UI transitions.",
    tags: ["Framer Motion", "Physics", "Interaction"],
    date: "Dec 2025",
  },
  {
    id: "type-morph",
    num: "05",
    title: "Typographic Morphing",
    description:
      "Variable font axes animated through scroll and cursor position. Letterforms continuously morph between weight, width, and optical size in response to user input.",
    tags: ["Variable Fonts", "CSS", "Animation"],
    date: "Nov 2025",
  },
  {
    id: "data-sculpture",
    num: "06",
    title: "Data Sculpture",
    description:
      "Transforms live API data streams into abstract 3D forms. Each data point influences geometry, material, and light — turning numbers into a living sculpture.",
    tags: ["Three.js", "Data Viz", "API"],
    date: "Oct 2025",
  },
];

// ---------------------------------------------------------------------------
// ROW COMPONENT
// ---------------------------------------------------------------------------

function ExperimentRow({
  item,
  index,
  isActive,
  onHover,
}: {
  item: Experiment;
  index: number;
  isActive: boolean;
  onHover: (id: string | null) => void;
}) {
  const ref = useRef<HTMLAnchorElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.2 });

  return (
    <motion.a
      ref={ref}
      href={`/experiments/${item.id}`}
      className={`${styles.row} ${isActive ? styles.rowActive : ""}`}
      onMouseEnter={() => onHover(item.id)}
      onMouseLeave={() => onHover(null)}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.08, ease: [0.2, 0, 0.38, 0.9] }}
    >
      {/* Thumbnail — left side */}
      <div className={styles.rowThumb}>
        <motion.div
          className={styles.thumbInner}
          animate={{ scale: isActive ? 1.04 : 1 }}
          transition={{ duration: 0.4, ease: [0.2, 0, 0.38, 0.9] }}
        />
      </div>

      {/* Number */}
      <span className={styles.rowNum}>({item.num})</span>

      {/* Title + description + tags */}
      <div className={styles.rowBody}>
        <h3 className={styles.rowTitle}>{item.title}</h3>
        <AnimatePresence>
          {isActive && (
            <motion.p
              className={styles.rowDesc}
              initial={{ opacity: 0, height: 0, marginTop: 0 }}
              animate={{ opacity: 1, height: "auto", marginTop: 12 }}
              exit={{ opacity: 0, height: 0, marginTop: 0 }}
              transition={{ duration: 0.35, ease: [0.2, 0, 0.38, 0.9] }}
            >
              {item.description}
            </motion.p>
          )}
        </AnimatePresence>
        <div className={styles.rowTags}>
          {item.tags.map((t) => (
            <span key={t} className={styles.tag}>
              {t}
            </span>
          ))}
        </div>
      </div>

      {/* Date */}
      <span className={styles.rowDate}>{item.date}</span>

      {/* Arrow */}
      <motion.div
        className={styles.rowArrow}
        animate={{ x: isActive ? 4 : 0, opacity: isActive ? 1 : 0.3 }}
        transition={{ duration: 0.3 }}
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path
            d="M5 10h10m0 0l-4-4m4 4l-4 4"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </motion.div>
    </motion.a>
  );
}

// ---------------------------------------------------------------------------
// PAGE
// ---------------------------------------------------------------------------

export default function ExperimentsPage() {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [navState, setNavState] = useState<"top" | "scrolled">("top");

  const onScroll = useCallback(() => {
    setNavState(window.scrollY > 60 ? "scrolled" : "top");
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [onScroll]);

  return (
    <div className={styles.page}>
      {/* Nav */}
      <header
        className={`${styles.nav} ${navState === "scrolled" ? styles.navScrolled : ""}`}
      >
        <div className={styles.navPill}>
          <a href="/" className={styles.logo}>
            Logo.
          </a>
          <nav className={styles.navLinks}>
            <a href="/#work" className={styles.navLink}>Link</a>
            <a href="/#testimonials" className={styles.navLink}>Link</a>
            <a href="/experiments" className={`${styles.navLink} ${styles.navLinkActive}`}>
              Link
            </a>
            <a href="/contact" className={styles.navCta}>Link</a>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className={styles.hero}>
        <motion.div
          className={styles.heroInner}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.2, 0, 0.38, 0.9] }}
        >
          <span className={styles.label}>Experiments & Side Projects</span>
          <h1 className={styles.heading}>
            Coding Experiments<br />
            <span className={styles.headingItalic}>&amp; Thought Pieces</span>
          </h1>
          <p className={styles.sub}>
            A collection of creative coding explorations, interaction prototypes,
            and technical deep-dives — built for curiosity, not clients.
          </p>
        </motion.div>
      </section>

      {/* List */}
      <section className={styles.list}>
        <div className={styles.listInner}>
          {EXPERIMENTS.map((item, i) => (
            <ExperimentRow
              key={item.id}
              item={item}
              index={i}
              isActive={activeId === item.id}
              onHover={setActiveId}
            />
          ))}
        </div>
      </section>

      {/* Footer CTA */}
      <section className={styles.footerCta}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, ease: [0.2, 0, 0.38, 0.9] }}
        >
          <p className={styles.footerCtaText}>More experiments coming soon.</p>
          <a href="/" className={styles.backLink}>
            &larr; Back to Home
          </a>
        </motion.div>
      </section>
    </div>
  );
}
