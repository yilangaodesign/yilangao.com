"use client";

import { useExpanded } from "./expandable-content";
import { useDocumentDrawer } from "./document-drawer";
import { RelevanceBadge } from "./relevance-badge";
import type { Relevance } from "@/lib/queries";

interface ActivityRowProps {
  actor: string;
  action: string;
  docTitle: string;
  docId?: string;
  timestamp: string;
  summary: string;
  relatedCount: number;
  relevance: Relevance | null;
}

const ACTION_VERBS: Record<string, string> = {
  commented: "commented on",
  edited: "edited",
  created: "created",
  mentioned_in_slack: "shared",
  linked_in_pr: "linked in PR",
};

function RelativeTime({ date }: { date: string }) {
  const d = new Date(date);
  const now = new Date();
  const nowET = new Date(now.toLocaleString("en-US", { timeZone: "America/New_York" }));
  const dET = new Date(d.toLocaleString("en-US", { timeZone: "America/New_York" }));
  const ms = nowET.getTime() - dET.getTime();
  const hours = Math.floor(ms / (1000 * 60 * 60));
  if (hours < 1) return <span>Just now</span>;
  if (hours < 24) return <span>{hours}h ago</span>;
  const days = Math.floor(hours / 24);
  if (days < 7) return <span>{days}d ago</span>;
  return <span>{Math.floor(days / 7)}w ago</span>;
}

export function ActivityRow({
  actor,
  action,
  docTitle,
  docId,
  timestamp,
  summary,
  relatedCount,
  relevance,
}: ActivityRowProps) {
  const expanded = useExpanded();
  const { openDrawer } = useDocumentDrawer();
  const verb = ACTION_VERBS[action] ?? action;

  const handleClick = docId
    ? () => openDrawer(docId)
    : undefined;

  if (!expanded) {
    return (
      <button
        type="button"
        className="flex items-center gap-2 py-2 w-full text-left cursor-pointer hover:bg-muted/50 rounded-md transition-colors -mx-1 px-1"
        onClick={handleClick}
      >
        <p className="text-[length:var(--type-sm)] text-foreground truncate">
          <span className="font-medium">{actor}</span>
          <span className="text-muted-foreground"> {verb} </span>
          <span className="text-muted-foreground">&lsquo;{docTitle}&rsquo;</span>
        </p>
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
        {relevance && (
          <div className="mb-1">
            <RelevanceBadge label={relevance.label} tier={relevance.tier} />
          </div>
        )}
        <p className="text-[length:var(--type-sm)] text-foreground truncate">
          <span className="font-medium">{actor}</span>
          <span className="text-muted-foreground"> {verb} </span>
          <span>&lsquo;{docTitle}&rsquo;</span>
        </p>
        <p className="text-[length:var(--type-xs)] text-muted-foreground mt-0.5 truncate">
          {summary}
        </p>
      </div>
      <div className="flex flex-col items-end gap-0.5 shrink-0">
        <span className="text-[length:var(--type-xs)] text-muted-foreground">
          <RelativeTime date={timestamp} />
        </span>
        {relatedCount > 2 && (
          <span className="text-[length:var(--type-xs)] text-muted-foreground/60">
            → {relatedCount} related docs
          </span>
        )}
      </div>
    </button>
  );
}
