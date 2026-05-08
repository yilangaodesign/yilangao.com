"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import Gauge from "lucide-react/dist/esm/icons/gauge";
import type { FolderNode } from "@/lib/queries";
import { Badge } from "@ds/Badge";

type Tier = "High" | "Moderate" | "Low";

function getTier(avg: number): Tier {
  if (avg >= 0.85) return "High";
  if (avg >= 0.6) return "Moderate";
  return "Low";
}

function getTierAppearance(tier: Tier) {
  if (tier === "High") return "neutral" as const;
  if (tier === "Moderate") return "warning" as const;
  return "negative" as const;
}

function collectConfidences(node: FolderNode): number[] {
  const scores: number[] = [];
  for (const doc of node.documents) {
    if (typeof (doc as any).confidence === "number") {
      scores.push((doc as any).confidence);
    }
  }
  for (const child of node.children) {
    scores.push(...collectConfidences(child));
  }
  return scores;
}

function computeDistribution(scores: number[]) {
  let high = 0;
  let moderate = 0;
  let low = 0;
  for (const s of scores) {
    if (s >= 0.85) high++;
    else if (s >= 0.6) moderate++;
    else low++;
  }
  return { high, moderate, low, total: scores.length };
}

export function ConfidenceChip({
  avgConfidence,
  tree,
}: {
  avgConfidence: number | null;
  tree: FolderNode;
}) {
  const [open, setOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const avg = avgConfidence ?? 1.0;
  const tier = getTier(avg);
  const appearance = getTierAppearance(tier);

  const dist = useMemo(() => {
    const scores = collectConfidences(tree);
    return computeDistribution(scores);
  }, [tree]);

  const pct = dist.total > 0 ? Math.round((dist.high / dist.total) * 100) : 100;

  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(e.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  return (
    <span style={{ position: "relative", display: "inline-flex" }}>
      <button
        ref={triggerRef}
        onClick={() => setOpen((p) => !p)}
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          padding: 0,
          display: "inline-flex",
        }}
        title="View categorization confidence"
      >
        <Badge appearance={appearance} emphasis="subtle" size="xs">
          <Gauge size={12} style={{ marginRight: 3 }} />
          {tier}
        </Badge>
      </button>

      {open && (
        <div
          ref={popoverRef}
          style={{
            position: "absolute",
            top: "calc(100% + 8px)",
            left: 0,
            zIndex: 50,
            minWidth: 260,
            padding: "12px 16px",
            borderRadius: "var(--portfolio-radius-md, 8px)",
            background: "var(--portfolio-surface-primary, #fff)",
            border: "1px solid var(--portfolio-border-primary, #e5e5e5)",
            boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
            fontFamily: "var(--portfolio-font-sans)",
            fontSize: "var(--portfolio-type-xs, 12px)",
            color: "var(--portfolio-text-primary)",
            lineHeight: 1.5,
          }}
        >
          <div style={{ fontWeight: 600, marginBottom: 8, fontSize: "var(--portfolio-type-sm, 13px)" }}>
            Placement confidence
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 4, marginBottom: 10 }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span>High confidence</span>
              <span style={{ fontWeight: 500, fontVariantNumeric: "tabular-nums" }}>{dist.high}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span>Moderate</span>
              <span style={{ fontWeight: 500, fontVariantNumeric: "tabular-nums" }}>{dist.moderate}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span>Low / uncategorized</span>
              <span style={{ fontWeight: 500, fontVariantNumeric: "tabular-nums" }}>{dist.low}</span>
            </div>
          </div>

          <div
            style={{
              padding: "8px 0 0",
              borderTop: "1px solid var(--portfolio-border-primary, #e5e5e5)",
              color: "var(--portfolio-text-secondary)",
            }}
          >
            The AI is confident about {pct}% of placements in this view.
          </div>
        </div>
      )}
    </span>
  );
}
