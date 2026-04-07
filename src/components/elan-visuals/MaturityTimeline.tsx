"use client";

import { useState } from "react";
import styles from "./maturity-timeline.module.scss";

// ── Data ─────────────────────────────────────────────────────────────────────

type SeverityData = {
  period: string;
  fundamental: number;
  structural: number;
  refinement: number;
  milestone?: string;
};

type DomainData = {
  period: string;
  design: number;
  engineering: number;
  content: number;
  milestone?: string;
};

const SEVERITY_DATA: SeverityData[] = [
  { period: "Sessions 1-5", fundamental: 12, structural: 2, refinement: 1 },
  { period: "Sessions 6-10", fundamental: 8, structural: 3, refinement: 1, milestone: "Escalation protocol introduced" },
  { period: "Sessions 11-15", fundamental: 5, structural: 3, refinement: 2 },
  { period: "Sessions 16-20", fundamental: 3, structural: 3, refinement: 2 },
  { period: "Sessions 21-30", fundamental: 1, structural: 2, refinement: 3, milestone: "First zero-fundamental session" },
  { period: "Sessions 31-40+", fundamental: 0, structural: 1, refinement: 2 },
];

const DOMAIN_DATA: DomainData[] = [
  { period: "Sessions 1-5", design: 8, engineering: 5, content: 2 },
  { period: "Sessions 6-10", design: 5, engineering: 4, content: 3, milestone: "Escalation protocol introduced" },
  { period: "Sessions 11-15", design: 4, engineering: 4, content: 2 },
  { period: "Sessions 16-20", design: 3, engineering: 3, content: 2 },
  { period: "Sessions 21-30", design: 2, engineering: 2, content: 2, milestone: "First zero-fundamental session" },
  { period: "Sessions 31-40+", design: 1, engineering: 1, content: 1 },
];

type ViewMode = "severity" | "domain";

const SEVERITY_KEYS = ["fundamental", "structural", "refinement"] as const;
const DOMAIN_KEYS = ["design", "engineering", "content"] as const;

const SEVERITY_LABELS: Record<string, string> = {
  fundamental: "Fundamental",
  structural: "Structural",
  refinement: "Refinement",
};

const DOMAIN_LABELS: Record<string, string> = {
  design: "Design",
  engineering: "Engineering",
  content: "Content",
};

const SEVERITY_STYLES: Record<string, { segment: string; legend: string }> = {
  fundamental: { segment: styles.severityFundamental, legend: styles.legendFundamental },
  structural: { segment: styles.severityStructural, legend: styles.legendStructural },
  refinement: { segment: styles.severityRefinement, legend: styles.legendRefinement },
};

const DOMAIN_STYLES: Record<string, { segment: string; legend: string }> = {
  design: { segment: styles.domainDesign, legend: styles.legendDesign },
  engineering: { segment: styles.domainEngineering, legend: styles.legendEngineering },
  content: { segment: styles.domainContent, legend: styles.legendContent },
};

// ── Component ────────────────────────────────────────────────────────────────

export default function MaturityTimeline() {
  const [mode, setMode] = useState<ViewMode>("severity");
  const [hoveredSegment, setHoveredSegment] = useState<{
    barIndex: number;
    key: string;
  } | null>(null);

  const data = mode === "severity" ? SEVERITY_DATA : DOMAIN_DATA;
  const keys = mode === "severity" ? SEVERITY_KEYS : DOMAIN_KEYS;
  const labels = mode === "severity" ? SEVERITY_LABELS : DOMAIN_LABELS;
  const segStyles = mode === "severity" ? SEVERITY_STYLES : DOMAIN_STYLES;

  const maxTotal = Math.max(
    ...data.map((d) =>
      keys.reduce((sum, k) => sum + ((d as any)[k] as number), 0)
    )
  );

  return (
    <div
      className={styles.container}
      role="region"
      aria-label="Correction maturity timeline showing decreasing corrections over sessions"
    >
      <div className={styles.controls}>
        <div className={styles.toggleGroup} role="radiogroup" aria-label="View mode">
          <button
            className={`${styles.toggleButton} ${mode === "severity" ? styles.toggleButtonActive : ""}`}
            onClick={() => setMode("severity")}
            role="radio"
            aria-checked={mode === "severity"}
          >
            By severity
          </button>
          <button
            className={`${styles.toggleButton} ${mode === "domain" ? styles.toggleButtonActive : ""}`}
            onClick={() => setMode("domain")}
            role="radio"
            aria-checked={mode === "domain"}
          >
            By domain
          </button>
        </div>
      </div>

      <div className={styles.chart}>
        <div className={styles.chartArea}>
          {data.map((bar, bi) => {
            const total = keys.reduce(
              (sum, k) => sum + ((bar as any)[k] as number),
              0
            );
            const barHeightPct = maxTotal > 0 ? (total / maxTotal) * 100 : 0;

            return (
              <div key={bar.period} className={styles.barColumn}>
                {bar.milestone && (
                  <span className={styles.milestoneMarker}>
                    {bar.milestone}
                  </span>
                )}

                <span className={styles.barCount}>{total}</span>

                <div
                  className={styles.barStack}
                  style={{ height: `${barHeightPct}%` }}
                >
                  {keys.map((key) => {
                    const value = (bar as any)[key] as number;
                    if (value === 0) return null;
                    const segPct = total > 0 ? (value / total) * 100 : 0;
                    const isHovered =
                      hoveredSegment?.barIndex === bi &&
                      hoveredSegment?.key === key;

                    return (
                      <div
                        key={key}
                        className={`${styles.barSegment} ${segStyles[key]?.segment ?? ""}`}
                        style={{ height: `${segPct}%` }}
                        onMouseEnter={() =>
                          setHoveredSegment({ barIndex: bi, key })
                        }
                        onMouseLeave={() => setHoveredSegment(null)}
                      >
                        {isHovered && (
                          <div className={styles.popover}>
                            {labels[key]}: {value}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                <span className={styles.barLabel}>
                  {bar.period.replace("Sessions ", "")}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div className={styles.legend}>
        {keys.map((key) => (
          <span key={key} className={styles.legendItem}>
            <span
              className={`${styles.legendDot} ${segStyles[key]?.legend ?? ""}`}
            />
            {labels[key]}
          </span>
        ))}
      </div>
    </div>
  );
}
