"use client";

import type { ArchiveItem } from "@/lib/archive-manifest";
import { TypeBadge, ExperimentTag } from "./archive-tile";
import { PreviewRenderer } from "@/lib/archive-previews";
import { ArchiveItemMenu } from "./archive-item-menu";

export function ArchiveListRow({
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
  const archivedDate = item.archivedAt
    ? new Date(item.archivedAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : null;

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") onClick(); }}
      className="group flex items-center gap-4 w-full px-3 py-2.5 text-left rounded-sm hover:bg-muted/50 transition-colors border border-transparent hover:border-border cursor-pointer"
    >
      <div className="w-16 h-12 rounded-sm border border-border bg-muted/30 overflow-hidden shrink-0">
        {item.hasPreview ? (
          <div className="origin-top-left scale-[0.25] w-[400%] h-[400%] pointer-events-none">
            <div className="p-4 flex items-center justify-center min-h-full">
              <PreviewRenderer id={item.id} />
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground/30">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <path d="M3 9h18M9 21V9" />
            </svg>
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{item.name}</p>
        <p className="text-xs text-muted-foreground truncate mt-0.5">{item.description}</p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <TypeBadge type={item.type} size="xs" />
        <ExperimentTag experiment={item.experiment} />
      </div>
      {archivedDate && (
        <span className="text-[11px] font-mono text-muted-foreground tabular-nums shrink-0 hidden sm:block">
          {archivedDate}
        </span>
      )}
      <div className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
        <ArchiveItemMenu
          itemId={item.id}
          itemName={item.name}
          onRecover={onRecover}
          onDeleted={onDeleted}
        />
      </div>
    </div>
  );
}
