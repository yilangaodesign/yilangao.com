"use client";

import { useEffect } from "react";
import Link from "next/link";
import { StaggerChildren, StaggerItem } from "@/components/ui/StaggerChildren";
import { Badge } from "@/components/ui/Badge";
import {
  InlineEditProvider,
  InlineEditBar,
} from "@/components/inline-edit";
import AdminBar from "@/components/AdminBar";
import { CursorThumbnail } from "@/components/CursorThumbnail";
import { useCursorThumbnail } from "@/hooks/use-cursor-thumbnail";
import { PreloadManager } from "@/lib/preload-manager";
import type { AssetManifest } from "@/lib/extract-content-urls";
import { useScrollRestoration } from "@/hooks/use-scroll-restoration";
import { track, canonicalSlug } from "@/lib/analytics/mixpanel";
import { siteShellStyles } from "@/components/SiteFooter";
import styles from "./page.module.scss";

type CaseStudy = {
  slug: string;
  headline: string;
  category: string;
  subline: string;
  thumbnailUrl?: string;
  thumbnailKind?: "image" | "video";
};

export default function HomeClient({
  caseStudies,
  assetManifest,
  isAdmin,
  personalization,
}: {
  caseStudies: CaseStudy[];
  assetManifest: AssetManifest;
  isAdmin?: boolean;
  personalization?: { name: string; slugs: string[] };
}) {
  const { thumbRef, thumbSrc, thumbKind, isVisible, handleError, handleMediaReady, getBlockHandlers } =
    useCursorThumbnail(caseStudies);
  const { savePosition } = useScrollRestoration("home");

  useEffect(() => {
    if (assetManifest.length > 0) {
      PreloadManager.seedManifest(assetManifest);
    }
  }, [assetManifest]);

  const content = (
    <main className={styles.page}>
      <div className={siteShellStyles.contentWrapperTerraSubtle}>
      {isAdmin && <AdminBar editUrl="/admin/globals/site-config" editLabel="Edit Site Config" />}
      <div className={styles.layout}>
        {caseStudies.length > 0 && (
          <nav className={styles.caseStudies} aria-label="Case studies">
            <StaggerChildren className={styles.caseStudyList}>
              {caseStudies.map((cs, i) => (
                <StaggerItem key={cs.slug}>
                  <Link href={`/work/${cs.slug}`} className={styles.caseStudyLink} onClick={() => { savePosition(); track("Case Study Clicked", { study_slug: canonicalSlug(cs.slug), position: i }); }} {...getBlockHandlers(i)}>
                    {personalization?.slugs.includes(cs.slug) && (
                      <Badge appearance="neutral" emphasis="minimal" size="sm" shape="squared" className={styles.personalizationBadge}>
                        for {personalization.name}
                      </Badge>
                    )}
                    <span className={styles.caseStudyHeadline} data-cursor-text>{cs.headline}</span>
                    {cs.subline ? (
                      <span className={styles.caseStudyBlurb}>{cs.subline}</span>
                    ) : null}
                  </Link>
                </StaggerItem>
              ))}
            </StaggerChildren>
          </nav>
        )}
      </div>
      </div>

      {isAdmin && <InlineEditBar />}
    </main>
  );

  const thumbnail = (
    <CursorThumbnail
      src={thumbSrc}
      kind={thumbKind}
      visible={isVisible}
      thumbRef={thumbRef}
      onError={handleError}
      onMediaReady={handleMediaReady}
    />
  );

  if (isAdmin) {
    return (
      <InlineEditProvider isAdmin>
        {content}
        {thumbnail}
      </InlineEditProvider>
    );
  }

  return (
    <>
      {content}
      {thumbnail}
    </>
  );
}
