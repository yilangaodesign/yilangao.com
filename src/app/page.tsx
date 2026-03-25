"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import {
  motion,
  useScroll,
  useSpring,
  useTransform,
  useMotionValue,
  useInView,
  MotionValue,
} from "framer-motion";
import styles from "./page.module.scss";

// ---------------------------------------------------------------------------
// SCROLL-DRIVEN WORD REVEAL (gray → black per word as you scroll)
// ---------------------------------------------------------------------------

function easeOutQuad(t: number): number {
  return 1 - (1 - t) ** 2;
}

function WordReveal({ text, scrollYProgress }: { text: string; scrollYProgress: MotionValue<number> }) {
  const words = text.split(" ");
  // heroWrap=400vh, heroSticky=100vh → 300vh sticky phase.
  // Words finish at 0.5 → remaining 50% (~150vh) is dwell time.
  // easeOutQuad pacing: scrolling DOWN reveals words quickly at first then
  // gradually slows toward the end. Scrolling back UP, the reverse applies —
  // words start changing slowly then accelerate.
  const revealEnd = 0.5;
  return (
    <p className={styles.heroText}>
      {words.map((word, i) => {
        const start = easeOutQuad(i / words.length) * revealEnd;
        const end = easeOutQuad((i + 1) / words.length) * revealEnd;
        return <Word key={i} word={word} range={[start, end]} progress={scrollYProgress} />;
      })}
    </p>
  );
}

function Word({ word, range, progress }: { word: string; range: [number, number]; progress: MotionValue<number> }) {
  const opacity = useTransform(progress, range, [0.15, 1]);
  return (
    <motion.span className={styles.heroWord} style={{ opacity }}>
      {word}{" "}
    </motion.span>
  );
}

// ---------------------------------------------------------------------------
// ANIMATED COUNTER
// ---------------------------------------------------------------------------

function Counter({ end, suffix = "+", active }: { end: number; suffix?: string; active: boolean }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!active) return;
    const duration = 1800;
    const startTime = performance.now();
    const step = (t: number) => {
      const p = Math.min((t - startTime) / duration, 1);
      setCount(Math.floor((1 - Math.pow(1 - p, 3)) * end));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [active, end]);
  return <>{count}{suffix}</>;
}

// ---------------------------------------------------------------------------
// SCROLL-TRIGGERED SECTION WRAPPER
// ---------------------------------------------------------------------------

function FadeSection({ children, className, id }: { children: React.ReactNode; className?: string; id?: string }) {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.15, margin: "-40px" });
  return (
    <section ref={ref} id={id} className={className}>
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.7, ease: [0.2, 0, 0.38, 0.9] }}
      >
        {children}
      </motion.div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// STAGGER CHILDREN WRAPPER
// ---------------------------------------------------------------------------

function StaggerGroup({ children, className }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.15 });
  return (
    <motion.div
      ref={ref}
      className={className}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.1 } } }}
    >
      {children}
    </motion.div>
  );
}

function StaggerChild({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div
      className={className}
      variants={{
        hidden: { opacity: 0, y: 40 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.2, 0, 0.38, 0.9] } },
      }}
    >
      {children}
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// AUTO-SCROLLING TESTIMONIAL TRACK
// ---------------------------------------------------------------------------

function AutoScrollTrack({ children }: { children: React.ReactNode }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const pausedRef = useRef(false);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    let pos = 0;
    let id: number;
    const animate = () => {
      if (!pausedRef.current) {
        pos -= 0.5;
        if (Math.abs(pos) >= track.scrollWidth / 2) pos = 0;
        track.style.transform = `translateX(${pos}px)`;
      }
      id = requestAnimationFrame(animate);
    };
    id = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(id);
  }, []);

  return (
    <div
      className={styles.carouselViewport}
      onMouseEnter={() => { pausedRef.current = true; }}
      onMouseLeave={() => { pausedRef.current = false; }}
    >
      <div ref={trackRef} className={styles.carouselTrack}>
        {children}
        {children}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// PAGE
// ---------------------------------------------------------------------------

const HERO_TEXT =
  "Lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua ut enim ad minim veniam quis nostrud exercitation ullamco laboris.";

const JOURNEY_CARDS = [
  { id: "01", title: "Card Title One", desc: "Lorem ipsum dolor sit amet, consectetur adipiscing elit." },
  { id: "02", title: "Card Title Two", desc: "Sed do eiusmod tempor incididunt ut labore et dolore magna." },
  { id: "03", title: "Card Title Three", desc: "Ut enim ad minim veniam, quis nostrud exercitation ullamco." },
];

const SERVICES = [
  { num: "01", title: "Service Category", items: ["Item A", "Item B", "Item C", "Item D", "Item E"] },
  { num: "02", title: "Service Category", items: ["Item A", "Item B", "Item C", "Item D", "Item E"] },
  { num: "03", title: "Service Category", items: ["Item A", "Item B", "Item C", "Item D", "Item E"] },
  { num: "04", title: "Service Category", items: ["Item A", "Item B", "Item C", "Item D", "Item E"] },
  { num: "05", title: "Service Category", items: ["Item A", "Item B", "Item C", "Item D"] },
  { num: "06", title: "Service Category", items: ["Item A", "Item B", "Item C", "Item D", "Item E", "Item F"] },
];

const PROJECTS = [
  { slug: "project-one", title: "Project Title One", subtitle: "Lorem ipsum dolor sit amet consectetur", tags: ["Tag A", "Tag B", "Tag C"] },
  { slug: "project-two", title: "Project Title Two", subtitle: "Sed do eiusmod tempor incididunt ut labore", tags: ["Tag A", "Tag B"] },
  { slug: "project-three", title: "Project Title Three", subtitle: "Ut enim ad minim veniam quis nostrud", tags: ["Tag A", "Tag B", "Tag C"] },
  { slug: "project-four", title: "Project Title Four", subtitle: "Duis aute irure dolor in reprehenderit", tags: ["Tag A", "Tag B"] },
  { slug: "project-five", title: "Project Title Five", subtitle: "Excepteur sint occaecat cupidatat non proident", tags: ["Tag A", "Tag B", "Tag C"] },
];

const TESTIMONIALS = [
  { quote: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore.", name: "Name Surname", role: "Role @ Company", linkedin: "#" },
  { quote: "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo.", name: "Name Surname", role: "Role @ Company", linkedin: "#" },
  { quote: "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.", name: "Name Surname", role: "Role @ Company", linkedin: "#" },
  { quote: "Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est.", name: "Name Surname", role: "Role @ Company" },
  { quote: "Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit sed quia consequuntur.", name: "Name Surname", role: "Role @ Company" },
];

const STATS = [
  { num: 10, suffix: "+", label: "Stat Label", desc: "Lorem ipsum dolor sit amet, consectetur adipiscing elit." },
  { num: 25, suffix: "+", label: "Stat Label", desc: "Sed do eiusmod tempor incididunt ut labore et dolore magna." },
  { num: 8, suffix: "+", label: "Stat Label", desc: "Ut enim ad minim veniam, quis nostrud exercitation." },
];




function ContactSection() {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.1 });
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("sending");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error();
      setStatus("sent");
      setForm({ name: "", email: "", message: "" });
    } catch {
      setStatus("error");
    }
  };

  return (
    <section ref={ref} className={styles.darkCard}>
      <div className={styles.darkCardBg} />
      <motion.div
        className={styles.darkCardContent}
        initial={{ opacity: 0, y: 50 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.7, ease: [0.2, 0, 0.38, 0.9] }}
      >
        <h2 className={styles.darkCardHeading}>Heading Line One</h2>
        <h2 className={styles.darkCardHeading}>
          <span className={styles.splashItalic}>Heading Line Two</span>
        </h2>

        <form className={styles.contactForm} onSubmit={handleSubmit}>
          <div className={styles.formRow}>
            <div className={styles.formField}>
              <input
                type="text"
                required
                className={styles.formInput}
                placeholder="Your name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div className={styles.formField}>
              <input
                type="email"
                required
                className={styles.formInput}
                placeholder="you@example.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
          </div>
          <div className={styles.formField}>
            <textarea
              required
              rows={4}
              className={styles.formTextarea}
              placeholder="Tell me about your project..."
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
            />
          </div>
          <button
            type="submit"
            className={styles.formSubmitLight}
            disabled={status === "sending"}
          >
            {status === "sending" ? "Sending..." : status === "sent" ? "Sent!" : "Get In Touch"}
          </button>
          {status === "error" && (
            <p className={styles.formError}>Something went wrong. Please try again.</p>
          )}
        </form>

        {/* Integrated footer inside the dark card */}
        <div className={styles.darkCardFooter}>
          <span className={styles.darkFooterCopy}>&copy; 2026 Name | All Rights Reserved</span>
          <a href="mailto:hello@example.com" className={styles.darkFooterEmail}>hello@example.com</a>
          <nav className={styles.darkFooterNav}>
            <a href="#services">Services</a>
            <a href="#work">Featured Work</a>
            <a href="#testimonials">Testimonials</a>
          </nav>
        </div>
      </motion.div>
    </section>
  );
}

export default function Home() {
  // Splash hero shrink on scroll — one-way lock: once it becomes a card,
  // it stays a card permanently (no reverse animation when scrolling back up).
  const splashRef = useRef<HTMLDivElement>(null);
  const cardLockedRef = useRef(false);
  const { scrollYProgress: splashProgress } = useScroll({
    target: splashRef,
    offset: ["start start", "end start"],
  });

  useEffect(() => {
    return splashProgress.on("change", (v) => {
      if (!cardLockedRef.current && v > 0.5) cardLockedRef.current = true;
    });
  }, [splashProgress]);

  const CARD_INSET = 16;
  const splashInset = useTransform(splashProgress, (v) => {
    if (cardLockedRef.current) return CARD_INSET;
    const t = Math.min(v / 0.55, 1);
    return t * CARD_INSET;
  });
  const splashWidth = useTransform(splashInset, (v) => `calc(100% - ${v * 2}px)`);
  const splashHeight = useTransform(splashInset, (v) => `calc(100vh - ${v * 2}px)`);
  const splashRadius = useTransform(splashProgress, (v) => {
    if (cardLockedRef.current) return 24;
    const t = Math.min(v / 0.55, 1);
    return t * 24;
  });

  // Content sheet pulls upward faster than scroll (handrail effect) with ease-out
  const rawContentSheetY = useTransform(
    splashProgress,
    [0, 0.35, 0.75, 1],
    [0, -25, -50, -60],
  );
  const contentSheetY = useSpring(rawContentSheetY, { stiffness: 50, damping: 20, mass: 0.7 });

  // Text-reveal scroll tracking.
  // offset ["start start","end end"] maps progress 0→1 to exactly
  // heroWrap_height − viewport_height = 100vh, matching the sticky phase.
  const textRevealRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress: rawScrollYProgress } = useScroll({
    target: textRevealRef,
    offset: ["start start", "end end"],
  });
  // Direction-aware smoothing: scrolling down gets a heavy, weighted trail;
  // scrolling back up responds almost immediately.
  const scrollYProgress = useMotionValue(0);
  useEffect(() => {
    let rafId: number;
    function tick() {
      const raw = rawScrollYProgress.get();
      const current = scrollYProgress.get();
      const diff = raw - current;
      if (Math.abs(diff) > 0.00005) {
        const speed = diff > 0 ? 0.035 : 0.22;
        scrollYProgress.set(current + diff * speed);
      }
      rafId = requestAnimationFrame(tick);
    }
    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [rawScrollYProgress, scrollYProgress]);

  // Stats counter trigger
  const statsRef = useRef<HTMLElement>(null);
  const statsInView = useInView(statsRef, { once: true, amount: 0.3 });

  // Nav states: "splash" (on hero, light text) → "scrolled" (compact, frosted, dark text)
  const [navState, setNavState] = useState<"splash" | "scrolled">("splash");
  const onScroll = useCallback(() => {
    setNavState(window.scrollY > window.innerHeight * 0.7 ? "scrolled" : "splash");
  }, []);
  useEffect(() => {
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [onScroll]);

  // Mobile nav
  const [mobileOpen, setMobileOpen] = useState(false);

  // Case-studies dropdown
  const [csOpen, setCsOpen] = useState(false);
  const [mobileCs, setMobileCs] = useState(false);
  const csRef = useRef<HTMLDivElement>(null);
  const csCloseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const csScheduleClose = useCallback(() => {
    csCloseTimer.current = setTimeout(() => setCsOpen(false), 120);
  }, []);

  const csCancelClose = useCallback(() => {
    if (csCloseTimer.current) clearTimeout(csCloseTimer.current);
  }, []);

  useEffect(() => {
    if (!csOpen) return;
    const close = (e: MouseEvent) => {
      if (csRef.current && !csRef.current.contains(e.target as Node)) setCsOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [csOpen]);

  const caseStudies = SERVICES.slice(0, 4);

  return (
    <>
      {/* ── FLOATING NAV (always visible, adapts on scroll) ───── */}
      <header className={`${styles.nav} ${navState === "scrolled" ? styles.navScrolled : styles.navOnSplash}`}>
        <div className={styles.navPill}>
          <a href="#" className={styles.logo}>Logo.</a>
          <nav className={styles.navLinks}>
            <a href="#services" className={styles.navLink}>Link</a>
            <div ref={csRef} className={styles.navDropdown} onMouseLeave={csScheduleClose} onMouseEnter={csCancelClose}>
                <button
                className={`${styles.navLink} ${styles.navDropdownTrigger}`}
                onClick={() => setCsOpen(!csOpen)}
                aria-expanded={csOpen}
              >
                Services
                <svg className={`${styles.chevron} ${csOpen ? styles.chevronOpen : ""}`} width="10" height="6" viewBox="0 0 10 6" fill="none">
                  <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              {csOpen && (
                <div className={styles.dropdownPanel} onMouseEnter={csCancelClose} onMouseLeave={csScheduleClose}>
                  {caseStudies.map((s) => (
                    <a key={s.num} href={`#services`} className={styles.dropdownItem} onClick={() => setCsOpen(false)}>
                      {s.title}
                    </a>
                  ))}
                </div>
              )}
            </div>
            <a href="#testimonials" className={styles.navLink}>Link</a>
            <a href="/contact" className={styles.navCta}>Link</a>
          </nav>
          <button className={styles.burger} onClick={() => setMobileOpen(!mobileOpen)} aria-label="Menu">
            <span className={`${styles.burgerBar} ${mobileOpen ? styles.burgerOpen : ""}`} />
            <span className={`${styles.burgerBar} ${mobileOpen ? styles.burgerOpen : ""}`} />
          </button>
        </div>
        {mobileOpen && (
          <div className={styles.mobileMenu}>
            <a href="#services" onClick={() => setMobileOpen(false)}>Link</a>
            <button className={styles.mobileDropdownTrigger} onClick={() => setMobileCs(!mobileCs)}>
              Services
              <svg className={`${styles.chevron} ${mobileCs ? styles.chevronOpen : ""}`} width="10" height="6" viewBox="0 0 10 6" fill="none">
                <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            {mobileCs && (
              <div className={styles.mobileDropdownItems}>
                {caseStudies.map((s) => (
                  <a key={s.num} href="#services" onClick={() => { setMobileOpen(false); setMobileCs(false); }}>
                    {s.title}
                  </a>
                ))}
              </div>
            )}
            <a href="#testimonials" onClick={() => setMobileOpen(false)}>Link</a>
            <a href="/contact" onClick={() => setMobileOpen(false)}>Link</a>
          </div>
        )}
      </header>

      {/* ── SPLASH HERO (full-screen, shrinks on scroll) ──────── */}
      <div ref={splashRef} className={styles.splashWrap}>
        <motion.div
          className={styles.splashBox}
          style={{
            top: splashInset,
            width: splashWidth,
            height: splashHeight,
            borderRadius: splashRadius,
          }}
        >
          <div className={styles.splashContent}>
            <h1 className={styles.splashHeading}>
              Heading Line One<br />
              <span className={styles.splashItalic}>Line Two Here</span>
            </h1>
            <p className={styles.splashSub}>Subheading text goes here.</p>
          </div>
          <div className={styles.splashFooter}>
            <span className={styles.splashMeta}>00:00 AM</span>
            <motion.div
              className={styles.splashScrollWrap}
              animate={{ y: [0, 8, -2, 0] }}
              transition={{ duration: 1.4, ease: [0.42, 0, 0.58, 1], times: [0, 0.45, 0.75, 1], repeat: Infinity, repeatDelay: 0.6 }}
            >
              <span className={styles.splashScroll}>Scroll to Explore</span>
              <svg className={styles.scrollArrow} width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M8 3v8m0 0l-3-3m3 3l3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </motion.div>
            <span className={styles.splashMeta}>LOC, CTY</span>
          </div>
        </motion.div>
      </div>

      {/* ── CONTENT SHEET (slides up over the splash like a paper overlay) ── */}
      <motion.div className={styles.contentSheet} style={{ y: contentSheetY }}>

      {/* ── TEXT REVEAL (scroll-driven gray→black word reveal) ── */}
      <div ref={textRevealRef} className={styles.heroWrap}>
        <div className={styles.heroSticky}>
          <div className={styles.heroContent}>
            <WordReveal text={HERO_TEXT} scrollYProgress={scrollYProgress} />
          </div>
        </div>
      </div>

      {/* ── JOURNEY CARDS ────────────────────────────────────── */}
      <section className={styles.section} id="services">
        <div className={styles.container}>
          <FadeSection>
            <span className={styles.sectionLabel}>Label Text</span>
            <h2 className={styles.sectionHeading}>Section Heading<br />Goes Here</h2>
          </FadeSection>
          <StaggerGroup className={styles.journeyGrid}>
            {JOURNEY_CARDS.map((c) => (
              <StaggerChild key={c.id} className={styles.journeyCard}>
                <span className={styles.cardNum}>{c.id}</span>
                <h3 className={styles.cardTitle}>{c.title}</h3>
                <p className={styles.cardDesc}>{c.desc}</p>
              </StaggerChild>
            ))}
          </StaggerGroup>
        </div>
      </section>

      {/* ── TRUST BAR (infinite horizontal scroll) ─────────── */}
      <section className={styles.trustBar}>
        <span className={styles.trustLabel}>Trusted by NN+ Organizations</span>
        <div className={styles.marqueeViewport}>
          <div className={styles.marqueeTrack}>
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={`a-${i}`} className={styles.logoBlock}>Logo {i + 1}</div>
            ))}
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={`b-${i}`} className={styles.logoBlock}>Logo {i + 1}</div>
            ))}
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={`c-${i}`} className={styles.logoBlock}>Logo {i + 1}</div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURED WORK (full-width stacked cards) ──────────── */}
      <section className={styles.section} id="work">
        <div className={styles.container}>
          <FadeSection>
            <span className={styles.sectionLabel}>Label Text</span>
            <h2 className={styles.sectionHeading}>Section Heading</h2>
            <p className={styles.sectionSub}>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
          </FadeSection>
          <StaggerGroup className={styles.workStack}>
            {PROJECTS.map((p, i) => (
              <StaggerChild key={i}>
                <a href={`/work/${p.slug}`} className={styles.workCard}>
                  <div className={styles.workImage}>
                    <div className={styles.workOverlay}>
                      <h3 className={styles.workTitle}>{p.title}</h3>
                      <p className={styles.workSub}>{p.subtitle}</p>
                      <div className={styles.workTags}>
                        {p.tags.map((t) => <span key={t} className={styles.pill}>{t}</span>)}
                      </div>
                    </div>
                  </div>
                </a>
              </StaggerChild>
            ))}
          </StaggerGroup>
        </div>
      </section>

      {/* ── SERVICES GRID ────────────────────────────────────── */}
      <section className={styles.sectionAlt}>
        <div className={styles.container}>
          <FadeSection>
            <span className={styles.sectionLabel}>Label Text</span>
            <h2 className={styles.sectionHeading}>Section Heading<br />Goes Here</h2>
          </FadeSection>
          <StaggerGroup className={styles.servicesGrid}>
            {SERVICES.map((s) => (
              <StaggerChild key={s.num} className={styles.serviceBlock}>
                <span className={styles.serviceNum}>({s.num})</span>
                <h3 className={styles.serviceTitle}>{s.title}</h3>
                <ul className={styles.serviceList}>
                  {s.items.map((item, j) => <li key={j}>{item}</li>)}
                </ul>
              </StaggerChild>
            ))}
          </StaggerGroup>
        </div>
      </section>

      {/* ── CTA BANNER ───────────────────────────────────────── */}
      <FadeSection className={styles.ctaBanner}>
        <div className={styles.container}>
          <a href="/contact" className={styles.ctaButton}>Call To Action Label</a>
        </div>
      </FadeSection>

      {/* ── TESTIMONIALS CAROUSEL ────────────────────────────── */}
      <section className={styles.sectionAlt} id="testimonials">
        <div className={styles.container}>
          <FadeSection>
            <span className={styles.sectionLabel}>Label Text</span>
            <h2 className={styles.sectionHeading}>Section Heading</h2>
            <p className={styles.sectionSub}>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
          </FadeSection>
        </div>
        <AutoScrollTrack>
          {TESTIMONIALS.map((t, i) => (
            <div key={i} className={styles.testimonialCard}>
              <blockquote className={styles.testimonialQuote}>&ldquo;{t.quote}&rdquo;</blockquote>
              <div className={styles.testimonialFooter}>
                <div className={styles.testimonialAttrib}>
                  <div className={styles.avatar} />
                  <div>
                    <p className={styles.attribName}>{t.name}</p>
                    <p className={styles.attribRole}>{t.role}</p>
                  </div>
                </div>
                <a href={t.linkedin} target="_blank" rel="noopener noreferrer" className={styles.linkedinIcon} aria-label={`${t.name} on LinkedIn`}>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                    <path d="M13.6 0H2.4C1.08 0 0 1.08 0 2.4v11.2C0 14.92 1.08 16 2.4 16h11.2c1.32 0 2.4-1.08 2.4-2.4V2.4C16 1.08 14.92 0 13.6 0zM4.96 13.6H2.56V6.08h2.4v7.52zM3.76 5.04c-.8 0-1.36-.56-1.36-1.28 0-.72.56-1.28 1.36-1.28s1.36.56 1.36 1.28c0 .72-.56 1.28-1.36 1.28zm9.84 8.56h-2.4V9.92c0-.88-.32-1.52-1.12-1.52-.64 0-.96.4-1.12.8-.08.16-.08.4-.08.56v3.84H6.48V6.08h2.4v1.04c.32-.48.88-1.2 2.16-1.2 1.52 0 2.72 1.04 2.72 3.28v4.4h-.16z" />
                  </svg>
                </a>
              </div>
            </div>
          ))}
        </AutoScrollTrack>
      </section>

      {/* ── STATS ────────────────────────────────────────────── */}
      <section className={styles.statsSection} ref={statsRef}>
        <div className={styles.container}>
          <StaggerGroup className={styles.statsGrid}>
            {STATS.map((s, i) => (
              <StaggerChild key={i} className={styles.statBlock}>
                <span className={styles.statNum}>
                  <Counter end={s.num} suffix={s.suffix} active={statsInView} />
                </span>
                <h3 className={styles.statLabel}>{s.label}</h3>
                <p className={styles.statDesc}>{s.desc}</p>
              </StaggerChild>
            ))}
          </StaggerGroup>
        </div>
      </section>

      {/* ── CONTACT PROFILES ─────────────────────────────── */}
      <FadeSection className={styles.section} id="contact">
        <div className={styles.container}>
          <div className={styles.contactProfilesGrid}>
            <div className={styles.profilePlaceholder} />
            <div className={styles.contactRight}>
              <span className={styles.sectionLabel}>Label Text</span>
              <h2 className={styles.sectionHeading}>Section Heading<br />Goes Here</h2>
            </div>
          </div>
        </div>
      </FadeSection>

      {/* ── CONTACT FORM CARD (dark bg + form + footer) ──────── */}
      <div className={styles.darkCardWrap}>
        <ContactSection />
      </div>

      </motion.div>{/* end contentSheet */}
    </>
  );
}
