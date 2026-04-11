"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import styles from "./page.module.scss";

// ---------------------------------------------------------------------------
// FONT FAMILY DATA
// ---------------------------------------------------------------------------

interface FontFamily {
  id: string;
  name: string;
  category: string;
  token: string;
  cssVar: string;
  fallbacks: string;
  cssValue: string;
  description: string;
  isVariable: boolean;
  weights: { label: string; value: number }[];
}

const FONT_FAMILIES: FontFamily[] = [
  {
    id: "geist-sans",
    name: "Geist Sans",
    category: "Sans-serif",
    token: "$portfolio-font-sans",
    cssVar: "--font-geist-sans",
    fallbacks: "Inter, system-ui, -apple-system, sans-serif",
    cssValue:
      "var(--font-geist-sans), 'Inter', system-ui, -apple-system, sans-serif",
    description:
      "Vercel's geometric sans-serif, inspired by Swiss typography. Designed for UI, headlines, and body text with excellent legibility at all sizes.",
    isVariable: true,
    weights: [
      { label: "Thin", value: 100 },
      { label: "Extra Light", value: 200 },
      { label: "Light", value: 300 },
      { label: "Regular", value: 400 },
      { label: "Medium", value: 500 },
      { label: "Semi Bold", value: 600 },
      { label: "Bold", value: 700 },
      { label: "Extra Bold", value: 800 },
      { label: "Black", value: 900 },
    ],
  },
  {
    id: "ibm-plex-serif",
    name: "IBM Plex Serif",
    category: "Serif",
    token: "$portfolio-font-serif",
    cssVar: "--font-ibm-plex-serif",
    fallbacks: "Georgia, serif",
    cssValue: "var(--font-ibm-plex-serif), 'Georgia', serif",
    description:
      "IBM's open-source serif typeface, designed for digital interfaces. Pairs naturally with Geist Sans for pull quotes and testimonials. Loaded via Google Fonts with all weights.",
    isVariable: false,
    weights: [
      { label: "Thin", value: 100 },
      { label: "Extra Light", value: 200 },
      { label: "Light", value: 300 },
      { label: "Regular", value: 400 },
      { label: "Medium", value: 500 },
      { label: "Semi Bold", value: 600 },
      { label: "Bold", value: 700 },
    ],
  },
  {
    id: "geist-mono",
    name: "Geist Mono",
    category: "Monospace",
    token: "$portfolio-font-mono",
    cssVar: "--font-geist-mono",
    fallbacks: "JetBrains Mono, ui-monospace, monospace",
    cssValue:
      "var(--font-geist-mono), 'JetBrains Mono', ui-monospace, monospace",
    description:
      "Vercel's monospace companion to Geist Sans. Purpose-built for code, data tables, labels, and technical content. Variable font with weights 100–900.",
    isVariable: true,
    weights: [
      { label: "Thin", value: 100 },
      { label: "Light", value: 300 },
      { label: "Regular", value: 400 },
      { label: "Medium", value: 500 },
      { label: "Bold", value: 700 },
      { label: "Black", value: 900 },
    ],
  },
  {
    id: "geist-pixel-square",
    name: "Geist Pixel Square",
    category: "Display / Pixel",
    token: "$portfolio-font-pixel-square",
    cssVar: "--font-geist-pixel-square",
    fallbacks: "monospace",
    cssValue: "var(--font-geist-pixel-square), monospace",
    description:
      "Bitmap-inspired display typeface built on a strict pixel grid using square-shaped dots. Best for large display sizes, creative headers, and retro/gaming aesthetics.",
    isVariable: false,
    weights: [{ label: "Regular", value: 400 }],
  },
  {
    id: "geist-pixel-grid",
    name: "Geist Pixel Grid",
    category: "Display / Pixel",
    token: "$portfolio-font-pixel-grid",
    cssVar: "--font-geist-pixel-grid",
    fallbacks: "monospace",
    cssValue: "var(--font-geist-pixel-grid), monospace",
    description:
      "Pixel font variant with a crosshatch grid pattern filling each character cell. Creates a textured, screen-like visual effect at display sizes.",
    isVariable: false,
    weights: [{ label: "Regular", value: 400 }],
  },
  {
    id: "geist-pixel-circle",
    name: "Geist Pixel Circle",
    category: "Display / Pixel",
    token: "$portfolio-font-pixel-circle",
    cssVar: "--font-geist-pixel-circle",
    fallbacks: "monospace",
    cssValue: "var(--font-geist-pixel-circle), monospace",
    description:
      "Pixel font variant using circular dots for each pixel. Evokes dot-matrix printers and halftone printing. Works well for experimental headers and creative projects.",
    isVariable: false,
    weights: [{ label: "Regular", value: 400 }],
  },
  {
    id: "geist-pixel-triangle",
    name: "Geist Pixel Triangle",
    category: "Display / Pixel",
    token: "$portfolio-font-pixel-triangle",
    cssVar: "--font-geist-pixel-triangle",
    fallbacks: "monospace",
    cssValue: "var(--font-geist-pixel-triangle), monospace",
    description:
      "Pixel font variant using triangular shapes for each pixel cell. Creates sharp, angular character forms with a unique geometric texture.",
    isVariable: false,
    weights: [{ label: "Regular", value: 400 }],
  },
  {
    id: "geist-pixel-line",
    name: "Geist Pixel Line",
    category: "Display / Pixel",
    token: "$portfolio-font-pixel-line",
    cssVar: "--font-geist-pixel-line",
    fallbacks: "monospace",
    cssValue: "var(--font-geist-pixel-line), monospace",
    description:
      "Pixel font variant using horizontal scan lines. Creates a CRT/retro-monitor aesthetic reminiscent of old terminal displays.",
    isVariable: false,
    weights: [{ label: "Regular", value: 400 }],
  },
];

// ---------------------------------------------------------------------------
// TYPE SCALE
// ---------------------------------------------------------------------------

const TYPE_SCALE = [
  { token: "$portfolio-type-6xl", value: "3.75rem (60px)", size: "3.75rem" },
  { token: "$portfolio-type-5xl", value: "3rem (48px)", size: "3rem" },
  { token: "$portfolio-type-4xl", value: "2.25rem (36px)", size: "2.25rem" },
  { token: "$portfolio-type-3xl", value: "1.875rem (30px)", size: "1.875rem" },
  { token: "$portfolio-type-2xl", value: "1.5rem (24px)", size: "1.5rem" },
  { token: "$portfolio-type-xl", value: "1.25rem (20px)", size: "1.25rem" },
  { token: "$portfolio-type-lg", value: "1.125rem (18px)", size: "1.125rem" },
  { token: "$portfolio-type-base", value: "1rem (16px)", size: "1rem" },
  { token: "$portfolio-type-sm", value: "0.875rem (14px)", size: "0.875rem" },
  { token: "$portfolio-type-xs", value: "0.75rem (12px)", size: "0.75rem" },
];

const SAMPLE_TEXT = "The quick brown fox jumps over the lazy dog";
const ALPHABET_UPPER = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const ALPHABET_LOWER = "abcdefghijklmnopqrstuvwxyz";
const DIGITS = "0123456789";

// Resolve font-family CSS for a given font ID
function fontFamilyCSS(id: string): string {
  const map: Record<string, string> = {
    "geist-sans":
      "var(--font-geist-sans), 'Inter', system-ui, -apple-system, sans-serif",
    "ibm-plex-serif": "var(--font-ibm-plex-serif), 'Georgia', serif",
    "geist-mono":
      "var(--font-geist-mono), 'JetBrains Mono', ui-monospace, monospace",
    "geist-pixel-square": "var(--font-geist-pixel-square), monospace",
    "geist-pixel-grid": "var(--font-geist-pixel-grid), monospace",
    "geist-pixel-circle": "var(--font-geist-pixel-circle), monospace",
    "geist-pixel-triangle": "var(--font-geist-pixel-triangle), monospace",
    "geist-pixel-line": "var(--font-geist-pixel-line), monospace",
  };
  return map[id] ?? "inherit";
}

// ---------------------------------------------------------------------------
// FONT CARD COMPONENT
// ---------------------------------------------------------------------------

function FontCard({ font }: { font: FontFamily }) {
  const family = fontFamilyCSS(font.id);

  return (
    <div className={styles.fontCard}>
      <div className={styles.fontCardHeader}>
        <div className={styles.fontMeta}>
          <h3 className={styles.fontName}>{font.name}</h3>
          <div className={styles.fontCategory}>{font.category}</div>
          <code className={styles.fontToken}>{font.token}</code>
          <div className={styles.fontFallbacks}>
            <strong>CSS:</strong> {font.cssValue}
          </div>
        </div>
      </div>

      <div className={styles.fontCardBody}>
        {/* Large specimen */}
        <div className={styles.specimen}>
          <div className={styles.specimenLabel}>Display · 48px</div>
          <div
            className={styles.specimenText}
            style={{ fontFamily: family, fontSize: "3rem", fontWeight: 400 }}
          >
            Ag
          </div>
        </div>

        {/* Sentence specimen */}
        <div className={styles.specimen}>
          <div className={styles.specimenLabel}>Sentence · 20px</div>
          <div
            className={styles.specimenText}
            style={{ fontFamily: family, fontSize: "1.25rem", fontWeight: 400 }}
          >
            {SAMPLE_TEXT}
          </div>
        </div>

        {/* Character set */}
        <div className={styles.specimen}>
          <div className={styles.specimenLabel}>Character Set</div>
          <div
            className={styles.alphabet}
            style={{ fontFamily: family }}
          >
            {ALPHABET_UPPER}
            <br />
            {ALPHABET_LOWER}
            <br />
            {DIGITS}
          </div>
        </div>

        {/* Weights */}
        {font.weights.length > 1 && (
          <div className={styles.specimen}>
            <div className={styles.specimenLabel}>
              Weights{font.isVariable ? " (Variable)" : ""}
            </div>
            <div className={styles.weightGrid}>
              {font.weights.map((w) => (
                <div key={w.value} className={styles.weightItem}>
                  <div className={styles.weightValue}>
                    {w.label} · {w.value}
                  </div>
                  <div
                    className={styles.weightSample}
                    style={{
                      fontFamily: family,
                      fontWeight: w.value,
                    }}
                  >
                    Hamburgefonts
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Description */}
        <div className={styles.specimen}>
          <div className={styles.specimenLabel}>About</div>
          <p
            style={{
              fontFamily:
                "var(--font-geist-sans), 'Inter', system-ui, sans-serif",
              fontSize: "0.875rem",
              lineHeight: 1.6,
              color: "var(--portfolio-text-secondary, #525252)",
            }}
          >
            {font.description}
          </p>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// MIXING PLAYGROUND
// ---------------------------------------------------------------------------

function MixingPlayground() {
  const fontOptions = FONT_FAMILIES.map((f) => ({
    id: f.id,
    label: f.name,
  }));

  const [headingFont, setHeadingFont] = useState("geist-sans");
  const [bodyFont, setBodyFont] = useState("ibm-plex-serif");
  const [monoFont, setMonoFont] = useState("geist-mono");
  const [labelFont, setLabelFont] = useState("geist-sans");

  return (
    <div className={styles.playground}>
      <div className={styles.playgroundControls}>
        <div className={styles.controlGroup}>
          <label className={styles.controlLabel}>Heading</label>
          <select
            className={styles.controlSelect}
            value={headingFont}
            onChange={(e) => setHeadingFont(e.target.value)}
          >
            {fontOptions.map((f) => (
              <option key={f.id} value={f.id}>
                {f.label}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.controlGroup}>
          <label className={styles.controlLabel}>Body</label>
          <select
            className={styles.controlSelect}
            value={bodyFont}
            onChange={(e) => setBodyFont(e.target.value)}
          >
            {fontOptions.map((f) => (
              <option key={f.id} value={f.id}>
                {f.label}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.controlGroup}>
          <label className={styles.controlLabel}>Code / Data</label>
          <select
            className={styles.controlSelect}
            value={monoFont}
            onChange={(e) => setMonoFont(e.target.value)}
          >
            {fontOptions.map((f) => (
              <option key={f.id} value={f.id}>
                {f.label}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.controlGroup}>
          <label className={styles.controlLabel}>Label / Caption</label>
          <select
            className={styles.controlSelect}
            value={labelFont}
            onChange={(e) => setLabelFont(e.target.value)}
          >
            {fontOptions.map((f) => (
              <option key={f.id} value={f.id}>
                {f.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className={styles.playgroundPreview}>
        <div
          className={styles.previewLabel}
          style={{
            fontFamily: fontFamilyCSS(labelFont),
            fontSize: "0.75rem",
            fontWeight: 500,
          }}
        >
          Case Study — March 2026
        </div>

        <h2
          className={styles.previewHeading}
          style={{
            fontFamily: fontFamilyCSS(headingFont),
            fontSize: "clamp(1.5rem, 3vw, 2.25rem)",
            fontWeight: 600,
          }}
        >
          Redesigning the Dashboard Experience
        </h2>

        <p
          className={styles.previewBody}
          style={{
            fontFamily: fontFamilyCSS(bodyFont),
            fontSize: "1rem",
          }}
        >
          The existing analytics dashboard suffered from information overload.
          Users struggled to find the metrics that mattered most. Through
          iterative research and prototyping, we reduced cognitive load by 40%
          while surfacing actionable insights.
        </p>

        <div
          className={styles.previewMono}
          style={{
            fontFamily: fontFamilyCSS(monoFont),
            fontSize: "0.75rem",
          }}
        >
          <div style={{ marginBottom: "4px", opacity: 0.6 }}>
            // Performance metrics
          </div>
          load_time: 1.2s → 0.4s (−67%)
          <br />
          task_completion: 72% → 94%
          <br />
          error_rate: 8.3% → 1.1%
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// PAGE
// ---------------------------------------------------------------------------

export default function TypographyPage() {
  const coreFonts = FONT_FAMILIES.filter(
    (f) => !f.id.startsWith("geist-pixel")
  );
  const pixelFonts = FONT_FAMILIES.filter((f) =>
    f.id.startsWith("geist-pixel")
  );

  return (
    <main className={styles.page}>
      <nav className={styles.nav}>
        <Link href="/" className={styles.navName}>
          Yilan Gao
        </Link>
        <span className={styles.navLabel}>Typography</span>
      </nav>

      <div className={styles.container}>
        {/* Header */}
        <header className={styles.pageHeader}>
          <h1 className={styles.pageTitle}>Typography</h1>
          <p className={styles.pageDesc}>
            All available font families, their actual names, SCSS tokens, CSS
            fallback chains, and specimens. Use the mixing playground at the
            bottom to audition different font pairings.
          </p>
        </header>

        {/* Core fonts */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Core Fonts</h2>
            <span className={styles.sectionCount}>
              {coreFonts.length} families
            </span>
          </div>
          {coreFonts.map((font) => (
            <FontCard key={font.id} font={font} />
          ))}
        </section>

        {/* Pixel fonts */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Geist Pixel Variants</h2>
            <span className={styles.sectionCount}>
              {pixelFonts.length} variants
            </span>
          </div>
          {pixelFonts.map((font) => (
            <FontCard key={font.id} font={font} />
          ))}
        </section>

        {/* Type Scale */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Type Scale</h2>
            <span className={styles.sectionCount}>
              {TYPE_SCALE.length} sizes
            </span>
          </div>
          <table className={styles.scaleTable}>
            <tbody>
              {TYPE_SCALE.map((s) => (
                <tr key={s.token} className={styles.scaleRow}>
                  <td className={`${styles.scaleCell} ${styles.scaleMeta}`}>
                    <span className={styles.scaleToken}>{s.token}</span>
                    <span className={styles.scaleValue}>{s.value}</span>
                  </td>
                  <td className={styles.scaleCell}>
                    <span
                      className={styles.scaleSample}
                      style={{ fontSize: s.size }}
                    >
                      {SAMPLE_TEXT}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        {/* Mixing Playground */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Font Mixing Playground</h2>
          </div>
          <p
            style={{
              fontSize: "0.875rem",
              lineHeight: 1.6,
              color: "var(--portfolio-text-secondary, #525252)",
              marginBottom: "16px",
            }}
          >
            Select different fonts for each role to preview how they pair
            together in a realistic layout.
          </p>
          <MixingPlayground />
        </section>
      </div>

      <footer className={styles.footer}>
        <Button
          href="/"
          appearance="neutral"
          emphasis="minimal"
          size="sm"
          onColor
          leadingIcon={
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <path d="M8.5 3L4.5 7L8.5 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          }
        >
          Back to Home
        </Button>
      </footer>
    </main>
  );
}
