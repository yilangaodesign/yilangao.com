import { Card, CardBody } from "@ds/Card";
import { Eyebrow } from "@ds/Eyebrow";
import { Divider } from "@ds/Divider";
import { SearchZone } from "@/components/search-zone";
import { HeroSpacer } from "@/components/hero-spacer";
import { ScrollFade } from "@/components/scroll-fade";
import { StickyHero } from "@/components/sticky-hero";
import { ExpandableContent } from "@/components/expandable-content";
import { HomeContent } from "@/components/home-content";
import { MeetingSchedule } from "@/components/meeting-schedule";
import { ActivityFeed } from "@/components/activity-feed";
import { BlockingRow } from "@/components/blocking-row";
import { DocumentDrawerProvider } from "@/components/document-drawer";
import {
  getMeetingContext,
  getRecentActivity,
  getBlockingItems,
} from "@/lib/queries";

export default async function HomePage() {
  const [meetingCtx, activity, blockingItems] = await Promise.all([
    getMeetingContext(),
    getRecentActivity(10),
    getBlockingItems(),
  ]);

  const heroContent = (
    <StickyHero>
      <ScrollFade threshold={10} className="self-start w-full mb-5">
        <h1 className="text-[length:var(--type-4xl)] font-serif font-semibold tracking-tight">
          Where to, Maya?
        </h1>
      </ScrollFade>
      <SearchZone />
    </StickyHero>
  );

  const mainContent = (
    <ExpandableContent>
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-5 w-full px-6 pt-6 pb-8">
        {/* For Your Meetings */}
        <div className="flex flex-col gap-2">
          <Eyebrow size="sm">{meetingCtx.eyebrow}</Eyebrow>
          <Card className="flex-1">
            <CardBody>
              <MeetingSchedule context={meetingCtx} />
            </CardBody>
          </Card>
        </div>

        {/* Needs Your Call */}
        <div className="flex flex-col gap-2">
          <Eyebrow size="sm">Needs your call</Eyebrow>
          <Card className="flex-1">
            <CardBody>
              {blockingItems.length === 0 ? (
                <p className="text-[length:var(--type-sm)] text-muted-foreground py-4">
                  Nothing blocking right now.
                </p>
              ) : (
                <div className="flex flex-col">
                  {blockingItems.map((item, i) => (
                    <div key={item.id}>
                      <BlockingRow item={item} />
                      {i < blockingItems.length - 1 && <Divider />}
                    </div>
                  ))}
                </div>
              )}
            </CardBody>
          </Card>
        </div>
      </section>

      {/* Since You Were Last Here */}
      <section className="w-full px-6 pb-8">
        <div className="flex flex-col gap-2">
          <Eyebrow size="sm">Since you were last here</Eyebrow>
          <Card>
            <CardBody>
              {activity.length === 0 ? (
                <p className="text-[length:var(--type-sm)] text-muted-foreground py-4">
                  No recent activity to show.
                </p>
              ) : (
                <ActivityFeed events={activity} />
              )}
            </CardBody>
          </Card>
        </div>
      </section>
    </ExpandableContent>
  );

  return (
    <DocumentDrawerProvider mode="modal">
      <div className="flex flex-col items-center w-full">
        <HeroSpacer />
        <HomeContent hero={heroContent} content={mainContent} />
      </div>
    </DocumentDrawerProvider>
  );
}
