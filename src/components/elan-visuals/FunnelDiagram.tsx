"use client";

import { useState } from "react";
import styles from "./elan-visuals.module.scss";

const STAGES = [
  {
    name: "Impression",
    time: "0–5s",
    signal: "Role clarity + professional credibility",
    drop: "Unclear positioning, visual noise",
    width: 100,
  },
  {
    name: "Relevance",
    time: "5–15s",
    signal: "Domain or problem-space match",
    drop: "Projects don't map to role",
    width: 82,
  },
  {
    name: "Engagement",
    time: "15–60s",
    signal: "Problem framing + ownership evidence",
    drop: "Buries the lede; opens with process",
    width: 64,
  },
  {
    name: "Evaluation",
    time: "1–3 min",
    signal: "Decision quality + impact + thinking",
    drop: "Describes what, not why",
    width: 46,
  },
  {
    name: "Conversion",
    time: "3+ min",
    signal: "Confidence this person can do the job",
    drop: "Portfolio was 'fine' but not memorable",
    width: 28,
  },
];

export default function FunnelDiagram() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <div className={styles.visualContainer}>
      <div className={styles.funnel}>
        {STAGES.map((stage, i) => (
          <div
            key={stage.name}
            className={`${styles.funnelStage} ${hoveredIndex === i ? styles.funnelStageActive : ""}`}
            onMouseEnter={() => setHoveredIndex(i)}
            onMouseLeave={() => setHoveredIndex(null)}
          >
            <div className={styles.funnelBar} style={{ width: `${stage.width}%` }}>
              <span className={styles.funnelStageName}>{stage.name}</span>
              <span className={styles.funnelStageTime}>{stage.time}</span>
            </div>
            {hoveredIndex === i && (
              <div className={styles.funnelDetail}>
                <div className={styles.funnelDetailRow}>
                  <span className={styles.funnelDetailLabel}>Signal sought</span>
                  <span className={styles.funnelDetailValue}>{stage.signal}</span>
                </div>
                <div className={styles.funnelDetailRow}>
                  <span className={styles.funnelDetailLabel}>Drop-off cause</span>
                  <span className={styles.funnelDetailValue}>{stage.drop}</span>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
