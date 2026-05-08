"use client";

import { ArrowRight } from "lucide-react";
import { RelevanceBadge } from "./relevance-badge";
import { useDocumentDrawer } from "./document-drawer";
import type { BlockingItem } from "@/lib/queries";

export function BlockingRow({ item }: { item: BlockingItem }) {
  const { openDrawer } = useDocumentDrawer();

  const accentColor =
    item.severity === "high"
      ? "var(--color-negative)"
      : item.severity === "medium"
        ? "var(--color-warning)"
        : undefined;

  return (
    <button
      type="button"
      className="flex items-start gap-3 py-3 relative w-full text-left cursor-pointer hover:bg-muted/50 rounded-md transition-colors -mx-1 px-1"
      onClick={() => openDrawer(item.documentId)}
    >
      <div className="flex-1 min-w-0">
        <div className="mb-1">
          <RelevanceBadge
            label={item.relevance.label}
            tier={item.relevance.tier}
          />
        </div>
        <div className="flex items-stretch gap-2">
          {accentColor && (
            <span
              className="w-[2px] rounded-full shrink-0 self-stretch"
              style={{ backgroundColor: accentColor }}
            />
          )}
          <div className="min-w-0">
            <p className="text-[length:var(--type-sm)] font-medium text-foreground truncate">
              {item.title}
            </p>
            <p className="text-[length:var(--type-xs)] text-muted-foreground mt-0.5 line-clamp-2">
              {item.description}
            </p>
          </div>
        </div>
      </div>
      <ArrowRight className="w-3.5 h-3.5 text-muted-foreground shrink-0 mt-1" />
    </button>
  );
}
