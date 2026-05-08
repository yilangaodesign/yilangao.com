"use client";

import { Badge } from "@ds/Badge";
import { Divider } from "@ds/Divider";
import { DocumentRow } from "./document-row";
import type { MeetingContext, MeetingGroup } from "@/lib/queries";

function MeetingHeader({ group }: { group: MeetingGroup }) {
  const docCount = group.docs.length;

  return (
    <div className="flex items-baseline justify-between gap-3 pt-3 pb-1">
      <div className="flex items-baseline gap-2 min-w-0">
        {group.status === "now" ? (
          <Badge size="xxs" appearance="highlight" emphasis="bold">
            Now
          </Badge>
        ) : (
          <span className="text-[length:var(--type-base)] font-semibold text-foreground shrink-0">
            {group.time}
          </span>
        )}
        <span className="text-[length:var(--type-sm)] text-muted-foreground truncate">
          {group.title}
        </span>
      </div>
      <span className="text-[length:var(--type-xs)] text-muted-foreground/60 shrink-0 tabular-nums">
        {docCount} {docCount === 1 ? "doc" : "docs"}
      </span>
    </div>
  );
}

function MeetingBlock({ group }: { group: MeetingGroup }) {
  return (
    <div>
      <MeetingHeader group={group} />
      {group.docs.map((doc, i) => (
        <div key={doc.id}>
          <DocumentRow
            title={doc.title}
            category={doc.category}
            project={doc.projects?.[0]?.replace("project-", "") ?? null}
            docId={doc.id}
            secondarySignal={doc.secondarySignal}
            threadHint={doc.threadHint}
            supersededBy={doc.superseded_by}
          />
          {i < group.docs.length - 1 && <Divider />}
        </div>
      ))}
    </div>
  );
}

function MeetingSeparator() {
  return (
    <div
      className="py-1"
      style={{ margin: "0 calc(-1 * var(--portfolio-spacer-3x))" }}
    >
      <Divider />
    </div>
  );
}

export function MeetingSchedule({ context }: { context: MeetingContext }) {
  return (
    <div className="flex flex-col">
      {context.meetings.map((group, i) => (
        <div key={group.time}>
          {i > 0 && <MeetingSeparator />}
          <MeetingBlock group={group} />
        </div>
      ))}
    </div>
  );
}
