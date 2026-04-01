"use client";

import type { ArchiveItem, ItemType } from "@/lib/archive-manifest";
import { PreviewRenderer } from "@/lib/archive-previews";
import { ArchiveItemMenu } from "./archive-item-menu";
import { Badge, Card } from "@ds/index";
import type { BadgeVariant } from "@ds/index";

const TYPE_VARIANT_MAP: Record<ItemType, BadgeVariant> = {
  Component: "info",
  Page: "info",
  Token: "warning",
  Style: "success",
};

export function TypeBadge({ type, size = "sm" }: { type: ItemType; size?: "sm" | "xs" }) {
  return (
    <Badge variant={TYPE_VARIANT_MAP[type]} shape="squared" mono size={size === "sm" ? "xs" : "xs"}>
      {type}
    </Badge>
  );
}

export function ExperimentTag({ experiment }: { experiment: string }) {
  return (
    <Badge variant="muted" shape="squared" mono size="xs">
      {experiment}
    </Badge>
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
    <Card
      interactive
      className="group relative text-left w-full cursor-pointer"
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") onClick(); }}
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
    </Card>
  );
}
