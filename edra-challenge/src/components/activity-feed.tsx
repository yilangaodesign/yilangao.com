"use client";

import { Divider } from "@ds/Divider";
import { ActivityRow } from "./activity-row";
import type { ActivityEvent } from "@/lib/queries";

function groupEventsByTime(events: ActivityEvent[]): { label: string; events: ActivityEvent[] }[] {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const yesterdayStart = new Date(todayStart);
  yesterdayStart.setDate(yesterdayStart.getDate() - 1);

  const today: ActivityEvent[] = [];
  const yesterday: ActivityEvent[] = [];
  const thisWeek: ActivityEvent[] = [];

  for (const event of events) {
    const ts = new Date(event.timestamp).getTime();
    if (ts >= todayStart.getTime()) today.push(event);
    else if (ts >= yesterdayStart.getTime()) yesterday.push(event);
    else thisWeek.push(event);
  }

  const groups: { label: string; events: ActivityEvent[] }[] = [];
  if (today.length) groups.push({ label: "Today", events: today });
  if (yesterday.length) groups.push({ label: "Yesterday", events: yesterday });
  if (thisWeek.length) groups.push({ label: "This week", events: thisWeek });
  return groups;
}

export function ActivityFeed({ events }: { events: ActivityEvent[] }) {
  const groups = groupEventsByTime(events);

  return (
    <div className="flex flex-col">
      {groups.map((group, gi) => (
        <div key={group.label}>
          {gi > 0 && <Divider />}
          <p className="text-[length:var(--type-base)] font-semibold text-foreground pt-2 pb-1">
            {group.label}
          </p>
          {group.events.map((event, i) => (
            <div key={event.id}>
              <ActivityRow
                actor={event.actor}
                action={event.action}
                docTitle={event.doc_title}
                docId={event.document_id}
                timestamp={event.timestamp}
                summary={event.summary}
                relatedCount={event.relatedCount}
                relevance={event.relevance}
              />
              {i < group.events.length - 1 && <Divider />}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
