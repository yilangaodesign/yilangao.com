"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import Link from "next/link";
import AdminBar from "@/components/AdminBar";
import EditButton from "@/components/EditButton";
import {
  InlineEditProvider,
  EditableText,
  InlineEditBar,
} from "@/components/inline-edit";
import type { ApiTarget } from "@/components/inline-edit";
import { Badge } from "@/components/ui/Badge";
import styles from "./page.module.scss";

export interface Experiment {
  id: string;
  cmsId?: number;
  num: string;
  title: string;
  description: string;
  tags: string[];
  date: string;
}

function experimentTarget(cmsId: number): ApiTarget {
  return { type: 'collection', slug: 'experiments', id: cmsId };
}

function ExperimentRow({
  item,
  index,
  isActive,
  onHover,
  isAdmin,
}: {
  item: Experiment;
  index: number;
  isActive: boolean;
  onHover: (id: string | null) => void;
  isAdmin?: boolean;
}) {
  const ref = useRef<HTMLAnchorElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.2 });

  const target = item.cmsId ? experimentTarget(item.cmsId) : undefined;

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
      <div className={styles.rowThumb}>
        <motion.div
          className={styles.thumbInner}
          animate={{ scale: isActive ? 1.04 : 1 }}
          transition={{ duration: 0.4, ease: [0.2, 0, 0.38, 0.9] }}
        />
      </div>

      <span className={styles.rowNum}>({item.num})</span>

      <div className={styles.rowBody}>
        <h3 className={styles.rowTitle}>
          {target ? (
            <EditableText
              fieldId={`exp:${item.cmsId}:title`}
              target={target}
              fieldPath="title"
              as="span"
              label="Title"
            >
              {item.title}
            </EditableText>
          ) : (
            item.title
          )}
          {isAdmin && item.cmsId && <EditButton collection="experiments" id={item.cmsId} label={`Edit ${item.title}`} />}
        </h3>
        <AnimatePresence>
          {isActive && (
            <motion.p
              className={styles.rowDesc}
              initial={{ opacity: 0, height: 0, marginTop: 0 }}
              animate={{ opacity: 1, height: "auto", marginTop: 12 }}
              exit={{ opacity: 0, height: 0, marginTop: 0 }}
              transition={{ duration: 0.35, ease: [0.2, 0, 0.38, 0.9] }}
            >
              {target ? (
                <EditableText
                  fieldId={`exp:${item.cmsId}:description`}
                  target={target}
                  fieldPath="description"
                  as="span"
                  multiline
                  label="Description"
                >
                  {item.description}
                </EditableText>
              ) : (
                item.description
              )}
            </motion.p>
          )}
        </AnimatePresence>
        <div className={styles.rowTags}>
          {item.tags.map((t) => (
            <Badge key={t} appearance="always-light" emphasis="regular" size="sm" shape="pill" mono className={styles.tag}>{t}</Badge>
          ))}
        </div>
      </div>

      <span className={styles.rowDate}>{item.date}</span>

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

export default function ExperimentsClient({ experiments, isAdmin }: { experiments: Experiment[]; isAdmin?: boolean }) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [navState, setNavState] = useState<"top" | "scrolled">("top");

  const onScroll = useCallback(() => {
    setNavState(window.scrollY > 60 ? "scrolled" : "top");
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [onScroll]);

  const page = (
    <div className={styles.page}>
      {isAdmin && <AdminBar editUrl="/admin/collections/experiments" editLabel="Manage Experiments" />}
      <header className={`${styles.nav} ${navState === "scrolled" ? styles.navScrolled : ""}`}>
        <div className={styles.navPill}>
          <Link href="/" className={styles.logo}>Yilan Gao</Link>
          <nav className={styles.navLinks}>
            <Link href="/about" className={styles.navLink}>About</Link>
            <Link href="/experiments" className={`${styles.navLink} ${styles.navLinkActive}`}>Experiments</Link>
          </nav>
        </div>
      </header>

      <section className={styles.hero}>
        <motion.div
          className={styles.heroInner}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.2, 0, 0.38, 0.9] }}
        >
          <span className={styles.label}>Experiments &amp; Side Projects</span>
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

      <section className={styles.list}>
        <div className={styles.listInner}>
          {experiments.map((item, i) => (
            <ExperimentRow
              key={item.id}
              item={item}
              index={i}
              isActive={activeId === item.id}
              onHover={setActiveId}
              isAdmin={isAdmin}
            />
          ))}
        </div>
      </section>

      <section className={styles.footerCta}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, ease: [0.2, 0, 0.38, 0.9] }}
        >
          <p className={styles.footerCtaText}>More experiments coming soon.</p>
          <Link href="/" className={styles.backLink}>&larr; Back to Home</Link>
        </motion.div>
      </section>

      {isAdmin && <InlineEditBar />}
    </div>
  );

  if (isAdmin) {
    return (
      <InlineEditProvider isAdmin>
        {page}
      </InlineEditProvider>
    );
  }

  return page;
}
