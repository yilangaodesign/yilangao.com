"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, Check, LayoutGrid } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@ds/DropdownMenu";
import { Tooltip } from "@ds/Tooltip";
import { Badge } from "@ds/Badge";
import { ViewCatalogModal } from "./view-catalog-modal";
import type { ViewSummary } from "@/lib/queries";

const PINNED_VIEW_IDS = [
  "by-project",
  "sprint-view",
  "what-broke",
  "needs-attention",
  "vp-review-prep",
] as const;

function displayTier(level: string | null): "High" | "Moderate" | "Low" {
  if (level === "high") return "High";
  if (level === "moderate") return "Moderate";
  if (level === "low") return "Low";
  return "High";
}

function tierAppearance(level: string | null) {
  if (level === "high" || level == null) return "positive" as const;
  if (level === "moderate") return "warning" as const;
  return "negative" as const;
}

function confidenceReasoning(view: ViewSummary): string {
  const pct = view.avgConfidence != null ? Math.round(view.avgConfidence * 100) : 100;
  const level = view.confidenceLevel;

  if (level === "high" || level == null) {
    return `${pct}% avg placement confidence — strong signal alignment across ${view.docCount} docs.`;
  }
  if (level === "moderate") {
    return `${pct}% avg confidence — some placements have weak signal. Review suggested.`;
  }
  return `${pct}% avg confidence — many placements uncertain. Multiple docs lack clear category signals.`;
}

function ViewConfidenceBadge({ view }: { view: ViewSummary }) {
  const level = view.confidenceLevel;
  const tier = displayTier(level);
  const appearance = tierAppearance(level);

  return (
    <Tooltip
      content={confidenceReasoning(view)}
      side="top"
      align="end"
      size="sm"
    >
      <span style={{ display: "inline-flex" }}>
        <Badge
          appearance={appearance}
          emphasis={level === "high" || level == null ? "minimal" : "subtle"}
          size="xxs"
          shape="pill"
        >
          {tier}
        </Badge>
      </span>
    </Tooltip>
  );
}

export function ViewSelector({
  currentViewId,
  allViews,
}: {
  currentViewId: string;
  allViews: ViewSummary[];
}) {
  const router = useRouter();
  const [modalOpen, setModalOpen] = useState(false);

  const currentView = allViews.find((v) => v.id === currentViewId);
  const triggerLabel = currentView?.name ?? "My Workspace";

  const pinnedViews = PINNED_VIEW_IDS.map((id) =>
    allViews.find((v) => v.id === id),
  ).filter((v): v is ViewSummary => v != null);

  const handleClose = useCallback(() => setModalOpen(false), []);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 4,
              background: "none",
              border: "none",
              outline: "none",
              cursor: "pointer",
              padding: "2px 0",
              fontFamily: "var(--portfolio-font-sans)",
              fontSize: "var(--portfolio-type-sm)",
              fontWeight: 500,
              color: "var(--portfolio-text-secondary)",
            }}
          >
            {triggerLabel}
            <ChevronDown size={14} style={{ opacity: 0.5 }} />
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="start" sideOffset={8}>
          {pinnedViews.map((v) => (
            <DropdownMenuItem
              key={v.id}
              leading={
                v.id === currentViewId ? (
                  <Check size={14} />
                ) : (
                  <span style={{ width: 14, display: "inline-block" }} />
                )
              }
              trailing={<ViewConfidenceBadge view={v} />}
              onSelect={() => {
                router.push(`?view=${v.id}`);
              }}
            >
              {v.name}
            </DropdownMenuItem>
          ))}

          <DropdownMenuSeparator />

          <DropdownMenuItem
            leading={<LayoutGrid size={14} />}
            onSelect={() => setModalOpen(true)}
          >
            All views…
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ViewCatalogModal
        open={modalOpen}
        onClose={handleClose}
        views={allViews}
        currentViewId={currentViewId}
      />
    </>
  );
}
