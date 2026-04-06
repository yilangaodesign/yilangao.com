"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { FadeIn } from "@/components/ui/FadeIn";
import { StaggerChildren, StaggerItem } from "@/components/ui/StaggerChildren";
import { MountEntrance } from "@/components/ui/MountEntrance/MountEntrance";
import { ExpandCollapse } from "@/components/ui/ExpandCollapse/ExpandCollapse";
import { ArrowReveal } from "@/components/ui/ArrowReveal/ArrowReveal";
import { Marquee } from "@/components/ui/Marquee/Marquee";
import {
  DURATION,
  EASING,
  STAGGER_INTERVAL,
  ENTRANCE_Y,
} from "@/lib/motion";
import { Eyebrow } from "@/components/ui/Eyebrow";
import styles from "./page.module.scss";

// ── Token data for tables ────────────────────────────────────────────────────

const DURATIONS = [
  { name: "fast", scss: "$portfolio-duration-fast", ts: "DURATION.fast", value: `${DURATION.fast * 1000}ms`, use: "Hover, focus, color shifts" },
  { name: "moderate", scss: "$portfolio-duration-moderate", ts: "DURATION.moderate", value: `${DURATION.moderate * 1000}ms`, use: "Transitions: border, bg, layout" },
  { name: "slow", scss: "$portfolio-duration-slow", ts: "DURATION.slow", value: `${DURATION.slow * 1000}ms`, use: "Scale, translate, expand/collapse" },
  { name: "slower", scss: "$portfolio-duration-slower", ts: "DURATION.slower", value: `${DURATION.slower * 1000}ms`, use: "Entrance choreography" },
];

const EASINGS = [
  { name: "standard", scss: "$portfolio-easing-standard", value: EASING.standard.join(", "), desc: "General-purpose, symmetrical deceleration" },
  { name: "entrance", scss: "$portfolio-easing-entrance", value: EASING.entrance.join(", "), desc: "Starts at rest, decelerates into view" },
  { name: "exit", scss: "$portfolio-easing-exit", value: EASING.exit.join(", "), desc: "Accelerates out of view" },
  { name: "expressive", scss: "$portfolio-easing-expressive", value: EASING.expressive.join(", "), desc: "Dramatic overshoot for personality" },
];

const MARQUEE_ITEMS = [
  "Token", "Mixin", "Component", "Pattern", "Recipe", "Layout", "Interaction", "Motion",
];

// ── Easing animation component ───────────────────────────────────────────────

function EasingDemo({ name, value, desc }: { name: string; value: string; desc: string }) {
  const [playing, setPlaying] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  function play() {
    setPlaying(false);
    clearTimeout(timerRef.current);
    requestAnimationFrame(() => {
      setPlaying(true);
      timerRef.current = setTimeout(() => setPlaying(false), 800);
    });
  }

  return (
    <div className={styles.easingCard} onClick={play} style={{ cursor: "pointer" }}>
      <div className={styles.easingName}>{name}</div>
      <div className={styles.easingValue}>cubic-bezier({value})</div>
      <div className={styles.easingTrack}>
        <div
          className={styles.easingDot}
          style={{
            left: playing ? "calc(100% - 12px)" : "0px",
            transition: playing
              ? `left 800ms cubic-bezier(${value})`
              : "none",
          }}
        />
      </div>
      <div className={styles.demoNote} style={{ marginTop: 8 }}>{desc}</div>
    </div>
  );
}

// ── Scroll-nav demo ──────────────────────────────────────────────────────────

function ScrollNavDemo() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [scrolled, setScrolled] = useState(false);

  const onScroll = useCallback(() => {
    if (scrollRef.current) {
      setScrolled(scrollRef.current.scrollTop > 40);
    }
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [onScroll]);

  return (
    <div className={styles.scrollNavDemo} ref={scrollRef}>
      <div className={`${styles.scrollNavBar} ${scrolled ? styles.scrollNavScrolled : ""}`}>
        <span>Logo</span>
        <span style={{ fontSize: 12, opacity: 0.5 }}>
          {scrolled ? "Scrolled" : "Top"}
        </span>
      </div>
      <div className={styles.scrollNavContent}>
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className={styles.scrollNavBlock} />
        ))}
      </div>
    </div>
  );
}

// ── Main page ────────────────────────────────────────────────────────────────

export default function MotionPlaygroundPage() {
  const [expandOpen, setExpandOpen] = useState(false);
  const [staggerKey, setStaggerKey] = useState(0);
  const [hoveredArrow, setHoveredArrow] = useState<number | null>(null);

  return (
    <div className={styles.page}>
      {/* Nav */}
      <nav className={styles.nav}>
        <Link href="/" className={styles.navName}>Yilan Gao</Link>
        <span className={styles.navLabel}>Motion &amp; Interaction</span>
      </nav>

      <div className={styles.container}>
        {/* Intro */}
        <header className={styles.intro}>
          <h1 className={styles.pageTitle}>Motion &amp; Interaction</h1>
          <p className={styles.pageDesc}>
            Canonical motion tokens, animation components, and interaction patterns
            for yilangao.com. Every value here mirrors the SCSS tokens in{" "}
            <code>_motion.scss</code> and the TS constants in{" "}
            <code>src/lib/motion.ts</code>.
          </p>
        </header>

        {/* ─── SECTION 1: TOKENS ─────────────────────────────────────── */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>1. Motion Tokens</h2>
          <p className={styles.sectionDesc}>
            Four durations and four easing curves, sourced from the IBM Carbon
            productive motion set. Available in SCSS via{" "}
            <code>@use &apos;@/styles&apos; as *</code> and in TS via{" "}
            <code>import {"{"} DURATION, EASING {"}"} from &apos;@/lib/motion&apos;</code>.
          </p>

          {/* Durations */}
          <div className={styles.demo}>
            <Eyebrow as="div" className={styles.demoLabel}>Durations</Eyebrow>
            <table className={styles.tokenTable}>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>SCSS</th>
                  <th>TS</th>
                  <th>Value</th>
                  <th>Use</th>
                </tr>
              </thead>
              <tbody>
                {DURATIONS.map((d) => (
                  <tr key={d.name}>
                    <td><span className={styles.tokenName}>{d.name}</span></td>
                    <td><code>{d.scss}</code></td>
                    <td><code>{d.ts}</code></td>
                    <td>{d.value}</td>
                    <td>{d.use}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Easings */}
          <div className={styles.demo}>
            <Eyebrow as="div" className={styles.demoLabel}>Easing Curves — click to preview</Eyebrow>
            <div className={styles.easingGrid}>
              {EASINGS.map((e) => (
                <EasingDemo key={e.name} name={e.name} value={e.value} desc={e.desc} />
              ))}
            </div>
          </div>
        </section>

        {/* ─── SECTION 2: ENTRANCE ANIMATIONS ────────────────────────── */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>2. Entrance Animations</h2>
          <p className={styles.sectionDesc}>
            Framer Motion components for revealing content. All use shared
            constants from <code>src/lib/motion.ts</code> and respect{" "}
            <code>prefers-reduced-motion</code>.
          </p>

          {/* MountEntrance */}
          <div className={styles.demo}>
            <Eyebrow as="div" className={styles.demoLabel}>Component</Eyebrow>
            <div className={styles.demoTitle}>MountEntrance</div>
            <div className={styles.demoMeta}>
              src/components/MountEntrance.tsx · duration: {DURATION.slower}s · ease: entrance · y: {ENTRANCE_Y}px
            </div>
            <div className={styles.demoArea}>
              <MountEntrance>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 14, fontWeight: 500 }}>Page-load entrance</div>
                  <div style={{ fontSize: 12, opacity: 0.5, marginTop: 4 }}>
                    Plays on mount — not scroll-triggered
                  </div>
                </div>
              </MountEntrance>
            </div>
            <div className={styles.demoNote}>
              Use for hero sections and above-the-fold content that should animate on page load.
            </div>
          </div>

          {/* FadeIn */}
          <div className={styles.demo}>
            <Eyebrow as="div" className={styles.demoLabel}>Component</Eyebrow>
            <div className={styles.demoTitle}>FadeIn</div>
            <div className={styles.demoMeta}>
              src/components/FadeIn.tsx · duration: {DURATION.slower}s · ease: entrance · y: {ENTRANCE_Y}px · scroll-triggered
            </div>
            <div className={styles.demoArea}>
              <FadeIn>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 14, fontWeight: 500 }}>Scroll into view to reveal</div>
                  <div style={{ fontSize: 12, opacity: 0.5, marginTop: 4 }}>
                    useInView · once: true · amount: 0.1
                  </div>
                </div>
              </FadeIn>
            </div>
            <div className={styles.demoNote}>
              Use for content below the fold that should reveal as the user scrolls.
            </div>
          </div>

          {/* StaggerChildren */}
          <div className={styles.demo}>
            <Eyebrow as="div" className={styles.demoLabel}>Component</Eyebrow>
            <div className={styles.demoTitle}>StaggerChildren + StaggerItem</div>
            <div className={styles.demoMeta}>
              src/components/StaggerChildren.tsx · stagger: {STAGGER_INTERVAL}s · item duration: {DURATION.slow}s
            </div>
            <div className={styles.demoAreaTall}>
              <button className={styles.trigger} onClick={() => setStaggerKey((k) => k + 1)}>
                Replay
              </button>
              <StaggerChildren key={staggerKey} className={styles.staggerGrid}>
                {Array.from({ length: 8 }).map((_, i) => (
                  <StaggerItem key={i}>
                    <div className={styles.staggerBox} />
                  </StaggerItem>
                ))}
              </StaggerChildren>
            </div>
            <div className={styles.demoNote}>
              Children animate in sequence. Configurable stagger interval via the stagger prop.
            </div>
          </div>
        </section>

        {/* ─── SECTION 3: HOVER INTERACTIONS ─────────────────────────── */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>3. Hover Interactions</h2>
          <p className={styles.sectionDesc}>
            CSS-based hover patterns defined as SCSS mixins in{" "}
            <code>src/styles/mixins/_interactive.scss</code>. All token-backed.
          </p>

          {/* Link color */}
          <div className={styles.demo}>
            <Eyebrow as="div" className={styles.demoLabel}>Mixin</Eyebrow>
            <div className={styles.demoTitle}>link-color + link-underline</div>
            <div className={styles.demoMeta}>@include link-color · @include link-underline · duration: fast</div>
            <div className={styles.demoArea}>
              <div className={styles.sampleLinksRow}>
                <a href="#" className={styles.sampleLink} onClick={(e) => e.preventDefault()}>
                  Color transition
                </a>
                <a href="#" className={styles.sampleLinkUnderline} onClick={(e) => e.preventDefault()}>
                  Animated underline
                </a>
              </div>
            </div>
          </div>

          {/* Hover-lift */}
          <div className={styles.demo}>
            <Eyebrow as="div" className={styles.demoLabel}>Mixin</Eyebrow>
            <div className={styles.demoTitle}>hover-lift</div>
            <div className={styles.demoMeta}>@include hover-lift · translateY(-4px) + shadow-lg · duration: moderate</div>
            <div className={styles.demoArea}>
              <div className={styles.sampleCard}>
                <div className={styles.sampleCardImage} />
                <div className={styles.sampleCardBody}>
                  <div className={styles.sampleCardTitle}>Card Title</div>
                  <div className={styles.sampleCardCategory}>Category</div>
                </div>
              </div>
            </div>
          </div>

          {/* Micro-lift */}
          <div className={styles.demo}>
            <Eyebrow as="div" className={styles.demoLabel}>Mixin</Eyebrow>
            <div className={styles.demoTitle}>hover-micro-lift</div>
            <div className={styles.demoMeta}>@include hover-micro-lift · translateY(-1px) + opacity · duration: fast</div>
            <div className={styles.demoArea}>
              <div className={styles.hoverRow}>
                <button className={styles.sampleButton}>Send Message</button>
                <button className={styles.sampleButton} disabled>Disabled</button>
              </div>
            </div>
            <div className={styles.demoNote}>
              Lighter variant of hover-lift for buttons and CTAs. Includes :disabled state.
            </div>
          </div>

          {/* Hover-scale */}
          <div className={styles.demo}>
            <Eyebrow as="div" className={styles.demoLabel}>Mixin</Eyebrow>
            <div className={styles.demoTitle}>hover-scale</div>
            <div className={styles.demoMeta}>@include hover-scale($scale: 1.02) · duration: slow</div>
            <div className={styles.demoArea}>
              <div className={styles.hoverRow}>
                <div className={styles.scaleThumb} />
              </div>
            </div>
          </div>

          {/* Compound card hover */}
          <div className={styles.demo}>
            <Eyebrow as="div" className={styles.demoLabel}>Mixin</Eyebrow>
            <div className={styles.demoTitle}>compound-card-hover</div>
            <div className={styles.demoMeta}>
              @include compound-card-hover(&apos;.image&apos;, &apos;.title&apos;) · parent hover → child image scales + title recolors
            </div>
            <div className={styles.demoArea}>
              <div className={styles.compoundCard}>
                <div className={styles.compoundImage} />
                <div className={styles.compoundTitle}>Project Title</div>
              </div>
            </div>
            <div className={styles.demoNote}>
              Coordinated hover: parent card triggers scale on its image child and color change on its title child.
            </div>
          </div>

          {/* Arrow reveal */}
          <div className={styles.demo}>
            <Eyebrow as="div" className={styles.demoLabel}>Component</Eyebrow>
            <div className={styles.demoTitle}>ArrowReveal</div>
            <div className={styles.demoMeta}>
              src/components/ArrowReveal.tsx · xShift: 4px · duration: moderate
            </div>
            <div className={styles.demoAreaTall} style={{ gap: 8 }}>
              {["Item One", "Item Two", "Item Three"].map((text, i) => (
                <div
                  key={i}
                  className={styles.arrowRow}
                  onMouseEnter={() => setHoveredArrow(i)}
                  onMouseLeave={() => setHoveredArrow(null)}
                >
                  <span className={styles.arrowRowText}>{text}</span>
                  <ArrowReveal active={hoveredArrow === i}>
                    <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
                      <path d="M5 10h10m0 0l-4-4m4 4l-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </ArrowReveal>
                </div>
              ))}
            </div>
            <div className={styles.demoNote}>
              Arrow shifts right and fades in on row hover. Common &ldquo;go to&rdquo; affordance for list items.
            </div>
          </div>

          {/* Form focus */}
          <div className={styles.demo}>
            <Eyebrow as="div" className={styles.demoLabel}>Mixin</Eyebrow>
            <div className={styles.demoTitle}>form-field-focus</div>
            <div className={styles.demoMeta}>@include form-field-focus · border-color + box-shadow · duration: fast</div>
            <div className={styles.demoArea}>
              <input className={styles.sampleInput} placeholder="Click to focus..." />
            </div>
          </div>
        </section>

        {/* ─── SECTION 4: LAYOUT ANIMATIONS ──────────────────────────── */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>4. Layout Animations</h2>
          <p className={styles.sectionDesc}>
            Patterns that animate layout changes: height shifts, infinite
            scrolling, and scroll-driven chrome.
          </p>

          {/* ExpandCollapse */}
          <div className={styles.demo}>
            <Eyebrow as="div" className={styles.demoLabel}>Component</Eyebrow>
            <div className={styles.demoTitle}>ExpandCollapse</div>
            <div className={styles.demoMeta}>
              src/components/ExpandCollapse.tsx · AnimatePresence + height: auto · duration: slow
            </div>
            <div className={styles.demoAreaTall} style={{ justifyContent: "flex-start" }}>
              <button className={styles.trigger} onClick={() => setExpandOpen((o) => !o)}>
                {expandOpen ? "Collapse" : "Expand"}
              </button>
              <ExpandCollapse open={expandOpen}>
                <div className={styles.expandContent}>
                  This content animates its height from 0 to auto when opened,
                  and back to 0 when closed. The exit animation plays before the
                  element unmounts thanks to AnimatePresence. Use for
                  accordions, disclosures, and inline detail panels.
                </div>
              </ExpandCollapse>
            </div>
          </div>

          {/* Marquee */}
          <div className={styles.demo}>
            <Eyebrow as="div" className={styles.demoLabel}>Component</Eyebrow>
            <div className={styles.demoTitle}>Marquee</div>
            <div className={styles.demoMeta}>
              src/components/Marquee.tsx · CSS @keyframes · default: 25s linear infinite · pause on hover
            </div>
            <div className={styles.demoArea} style={{ padding: 0 }}>
              <Marquee duration={20}>
                {MARQUEE_ITEMS.map((item) => (
                  <span key={item} className={styles.marqueeItem}>{item}</span>
                ))}
              </Marquee>
            </div>
            <div className={styles.demoNote}>
              Pure CSS animation with edge-fade masks. Hover to pause. Children tripled internally for seamless loop.
            </div>
          </div>

          {/* Scroll-driven nav */}
          <div className={styles.demo}>
            <Eyebrow as="div" className={styles.demoLabel}>Pattern</Eyebrow>
            <div className={styles.demoTitle}>Scroll-Driven Nav Chrome</div>
            <div className={styles.demoMeta}>
              React state (scrollY {">"} threshold) + CSS transition · duration: moderate
            </div>
            <div className={styles.demoAreaScroll}>
              <ScrollNavDemo />
            </div>
            <div className={styles.demoNote}>
              Scroll listener toggles a CSS class that transitions padding, background, and shadow.
              Used on the Experiments page nav pill.
            </div>
          </div>
        </section>

        {/* ─── SECTION 5: GLOBAL BEHAVIORS ───────────────────────────── */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>5. Global Behaviors</h2>

          <div className={styles.demo}>
            <Eyebrow as="div" className={styles.demoLabel}>Global CSS</Eyebrow>
            <div className={styles.demoTitle}>scroll-behavior: smooth</div>
            <div className={styles.demoMeta}>src/app/globals.scss · applied to html element</div>
            <div className={styles.demoArea}>
              <div style={{ textAlign: "center", fontSize: 12, lineHeight: 1.6 }}>
                Native smooth-scrolling for anchor navigation.<br />
                Override per-element with <code>scroll-behavior: auto</code> for instant jumps.
              </div>
            </div>
          </div>

          <div className={styles.demo}>
            <Eyebrow as="div" className={styles.demoLabel}>Mixin</Eyebrow>
            <div className={styles.demoTitle}>prefers-reduced-motion</div>
            <div className={styles.demoMeta}>@include reduced-motion · _interactive.scss</div>
            <div className={styles.demoArea}>
              <div style={{ textAlign: "center", fontSize: 12, lineHeight: 1.6 }}>
                All Framer components use <code>useReducedMotion()</code>.<br />
                CSS mixin zeroes animation/transition durations and resets scroll-behavior.<br />
                Apply to any element: <code>@include reduced-motion;</code>
              </div>
            </div>
          </div>
        </section>

        <Button
          href="/"
          appearance="neutral"
          emphasis="minimal"
          size="sm"
          leadingIcon={
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <path d="M8.5 3L4.5 7L8.5 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          }
        >
          Back to Home
        </Button>
      </div>
    </div>
  );
}
