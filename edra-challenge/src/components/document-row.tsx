"use client";

import { Badge } from "@ds/Badge";
import { useExpanded } from "./expandable-content";
import { useDocumentDrawer } from "./document-drawer";

interface DocumentRowProps {
  title: string;
  category: string;
  project: string | null;
  docId?: string;
  secondarySignal?: string | null;
  threadHint?: string | null;
  supersededBy?: string | null;
}

export function DocumentRow({
  title,
  category,
  project,
  docId,
  secondarySignal,
  threadHint,
  supersededBy,
}: DocumentRowProps) {
  const expanded = useExpanded();
  const { openDrawer } = useDocumentDrawer();

  const handleClick = docId
    ? () => openDrawer(docId)
    : undefined;

  if (!expanded) {
    return (
      <button
        type="button"
        className="flex items-center gap-3 py-3 w-full text-left cursor-pointer hover:bg-muted/50 rounded-md transition-colors -mx-1 px-1"
        onClick={handleClick}
      >
        <div className="min-w-0 flex-1">
          <p className="text-[length:var(--type-sm)] font-medium text-foreground truncate">
            {title}
          </p>
        </div>
      </button>
    );
  }

  return (
    <button
      type="button"
      className="flex items-start justify-between gap-3 py-3 w-full text-left cursor-pointer hover:bg-muted/50 rounded-md transition-colors -mx-1 px-1"
      onClick={handleClick}
    >
      <div className="min-w-0 flex-1">
        <p className="text-[length:var(--type-sm)] font-medium text-foreground truncate">
          {title}
        </p>
        <div className="flex items-center gap-1.5 mt-1">
          <Badge size="xxs" appearance="neutral" emphasis="subtle">
            {category}
          </Badge>
          {project && (
            <span className="text-[length:var(--type-xs)] text-muted-foreground">
              {project}
            </span>
          )}
        </div>
      </div>
      <div className="flex flex-col items-end gap-1 shrink-0 max-w-[180px]">
        {secondarySignal && (
          <span className="text-[length:var(--type-xs)] text-muted-foreground text-right leading-tight">
            {secondarySignal}
          </span>
        )}
        {threadHint && (
          <span className="text-[length:var(--type-xs)] text-muted-foreground/60">
            {threadHint}
          </span>
        )}
        {supersededBy && (
          <span className="text-[length:var(--type-xs)] text-accent">
            Superseded by newer version
          </span>
        )}
      </div>
    </button>
  );
}
