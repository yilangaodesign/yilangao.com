"use client";

import { InfoTooltip } from "../ui/Tooltip/InfoTooltip";
import styles from "./eval-comparison-grid.module.scss";

const ARMS = [
  {
    label: "No Docs",
    tip: "Claude with no project documentation — pure model knowledge only.",
  },
  {
    label: "Flat Docs",
    tip: "The pre-revamp setup: markdown files with keyword search, no linking or structure.",
  },
  {
    label: "Linked Graph",
    tip: "The new system: ~5K edges connecting every rule, pattern, and anti-pattern so the agent can traverse context.",
  },
] as const;

const DATA = [
  {
    label: "Subtle tasks (6)",
    values: [0, 0, 71.7],
    highlight: true,
  },
  {
    label: "Obvious tasks (6)",
    values: [23.3, 20.0, 56.7],
    highlight: false,
  },
] as const;

function formatPct(v: number): string {
  if (v === 0) return "0%";
  return `${Math.round(v)}%`;
}

export default function EvalComparisonGrid() {
  return (
    <div className={styles.grid}>
      <div className={styles.header}>
        <span className={styles.headerLabel}>Found Right Principle</span>
        {ARMS.map((arm) => (
          <span key={arm.label} className={styles.headerLabel}>
            {arm.label}
            <InfoTooltip content={arm.tip} contextSize="xs" side="top" />
          </span>
        ))}
      </div>

      {DATA.map((row) => (
        <div
          key={row.label}
          className={row.highlight ? styles.rowHighlight : styles.row}
        >
          <span className={styles.rowLabel}>{row.label}</span>
          {row.values.map((v, i) => (
            <span
              key={ARMS[i].label}
              className={
                v === 0
                  ? styles.cellZero
                  : row.highlight && i === 2
                    ? styles.cellAccent
                    : styles.cell
              }
            >
              <span className={styles.mobileLabel}>{ARMS[i].label}: </span>
              {formatPct(v)}
            </span>
          ))}
        </div>
      ))}

      <div className={styles.footer}>
        <div className={styles.methodology}>
          12 tasks · 3 arms · 10 runs each · 3 blind judges · 520 scored generations
        </div>
      </div>
    </div>
  );
}
