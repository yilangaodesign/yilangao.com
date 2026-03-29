"use client";

import { cn } from "@/lib/utils";
import type { ArchiveItem, ItemType } from "@/lib/archive-manifest";
import { PreviewRenderer } from "@/lib/archive-previews";
import { ArchiveItemMenu } from "./archive-item-menu";

const TYPE_COLORS: Record<ItemType, { bg: string; text: string }> = {
  Component: { bg: "bg-blue-100 dark:bg-blue-950", text: "text-blue-700 dark:text-blue-300" },
  Page: { bg: "bg-cyan-100 dark:bg-cyan-950", text: "text-cyan-700 dark:text-cyan-300" },
  Token: { bg: "bg-amber-100 dark:bg-amber-950", text: "text-amber-700 dark:text-amber-300" },
  Style: { bg: "bg-green-100 dark:bg-green-950", text: "text-green-700 dark:text-green-300" },
};

export function TypeBadge({ type, size = "sm" }: { type: ItemType; size?: "sm" | "xs" }) {
  const colors = TYPE_COLORS[type];
  return (
    <span
      className={cn(
        "inline-block font-mono font-medium tracking-wider uppercase rounded-sm shrink-0",
        size === "sm" ? "text-[10px] px-1.5 py-0.5" : "text-[9px] px-1 py-px",
        colors.bg,
        colors.text
      )}
    >
      {type}
    </span>
  );
}

export function ExperimentTag({ experiment }: { experiment: string }) {
  return (
    <span className="inline-block text-[10px] font-mono text-muted-foreground bg-muted px-1.5 py-0.5 rounded-sm">
      {experiment}
    </span>
  );
}

export function ArchiveTile({
  item,
  onClick,
  onRecover,
  onDeleted,
}: {
  item: ArchiveItem;
  onClick: () => void;
  onRecover: () => void;
  onDeleted: () => void;
}) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") onClick(); }}
      className="group relative text-left w-full rounded-sm border border-border hover:border-foreground/20 transition-colors overflow-hidden bg-background cursor-pointer"
    >
      <div className="relative h-36 bg-muted/30 overflow-hidden">
        {item.hasPreview ? (
          <div className="origin-top-left scale-50 w-[200%] h-[200%] pointer-events-none">
            <div className="p-4 flex items-center justify-center min-h-full">
              <PreviewRenderer id={item.id} />
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="flex flex-col items-center gap-1.5 text-muted-foreground/40">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <path d="M3 9h18M9 21V9" />
              </svg>
              <span className="text-[10px] font-mono uppercase tracking-wider">{item.type}</span>
            </div>
          </div>
        )}
        <div className="absolute top-1.5 right-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <ArchiveItemMenu
            itemId={item.id}
            itemName={item.name}
            onRecover={onRecover}
            onDeleted={onDeleted}
          />
        </div>
      </div>
      <div className="px-3 py-2.5 border-t border-border space-y-1.5">
        <p className="text-sm font-medium truncate group-hover:text-foreground transition-colors">
          {item.name}
        </p>
        <div className="flex items-center gap-1.5 flex-wrap">
          <TypeBadge type={item.type} size="xs" />
          <ExperimentTag experiment={item.experiment} />
        </div>
      </div>
    </div>
  );
}
