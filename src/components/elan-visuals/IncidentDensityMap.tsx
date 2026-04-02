"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/Badge";
import styles from "./elan-visuals.module.scss";

type Category = {
  name: string;
  total: number;
  documented: number;
  audited: number;
  guardrailed: number;
  insight: string;
};

const CATEGORIES: Category[] = [
  {
    name: "Inline Edit System",
    total: 10,
    documented: 5,
    audited: 3,
    guardrailed: 2,
    insight: "Every new CMS component must support inline editing — promoted to hard guardrail after 3rd violation",
  },
  {
    name: "Documentation Gaps",
    total: 9,
    documented: 4,
    audited: 2,
    guardrailed: 3,
    insight: "Fixes shipped without updating knowledge base — documentation became a pre-condition, not a post-step",
  },
  {
    name: "Cross-App Parity",
    total: 8,
    documented: 3,
    audited: 3,
    guardrailed: 2,
    insight: "Same infrastructure oversight recurring across 3 apps — created blocking cross-app checklist",
  },
  {
    name: "CMS \u2194 Frontend Sync",
    total: 7,
    documented: 2,
    audited: 3,
    guardrailed: 2,
    insight: "Schema, data fetch, and UI diverging silently across 4 layers — atomic update gate",
  },
  {
    name: "Component Interaction",
    total: 7,
    documented: 5,
    audited: 2,
    guardrailed: 0,
    insight: "ScrollSpy alone: 7 anti-patterns, 4 iterations — pointer mapping, dead zones, Framer Motion conflicts",
  },
  {
    name: "React State & Closures",
    total: 6,
    documented: 4,
    audited: 2,
    guardrailed: 0,
    insight: "Stale closures, index-as-key, hydration mismatches — each fix became a documented anti-pattern",
  },
];

export default function IncidentDensityMap() {
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <div className={styles.visualContainer}>
      <div className={styles.densityMap}>
        {CATEGORIES.map((cat) => {
          const isExpanded = expanded === cat.name;
          return (
            <button
              key={cat.name}
              className={`${styles.densityRow} ${isExpanded ? styles.densityRowExpanded : ""}`}
              onClick={() => setExpanded(isExpanded ? null : cat.name)}
              aria-expanded={isExpanded}
              aria-label={`${cat.name}: ${cat.total} incidents. ${cat.guardrailed} guardrailed, ${cat.audited} audited, ${cat.documented} documented.`}
            >
              <div className={styles.densityHeader}>
                <span className={styles.densityName}>{cat.name}</span>
                <div className={styles.densityDots} aria-hidden="true">
                  {Array.from({ length: cat.guardrailed }, (_, i) => (
                    <span key={`g-${i}`} className={`${styles.densityDot} ${styles.densityDotGuardrailed}`} />
                  ))}
                  {Array.from({ length: cat.audited }, (_, i) => (
                    <span key={`a-${i}`} className={`${styles.densityDot} ${styles.densityDotAudited}`} />
                  ))}
                  {Array.from({ length: cat.documented }, (_, i) => (
                    <span key={`d-${i}`} className={`${styles.densityDot} ${styles.densityDotDocumented}`} />
                  ))}
                </div>
                <span className={styles.densityCount}>{cat.total}</span>
                {cat.guardrailed > 0 && (
                  <Badge appearance="highlight" emphasis="subtle" size="xxs" mono>guardrailed</Badge>
                )}
              </div>
              {isExpanded && (
                <div className={styles.densityInsight}>
                  {cat.insight}
                </div>
              )}
            </button>
          );
        })}
        <div className={styles.densityLegend}>
          <span className={styles.densityLegendItem}>
            <span className={`${styles.densityDot} ${styles.densityDotGuardrailed}`} aria-hidden="true" /> guardrailed
          </span>
          <span className={styles.densityLegendItem}>
            <span className={`${styles.densityDot} ${styles.densityDotAudited}`} aria-hidden="true" /> audited
          </span>
          <span className={styles.densityLegendItem}>
            <span className={`${styles.densityDot} ${styles.densityDotDocumented}`} aria-hidden="true" /> documented
          </span>
        </div>
      </div>
    </div>
  );
}
