"use client";

import { Fragment, useEffect } from "react";
import Link from "next/link";
import { StaggerChildren, StaggerItem } from "@/components/ui/StaggerChildren";
import { Divider } from "@/components/ui/Divider";
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
import { siteShellStyles } from "@/components/SiteFooter";
import styles from "./page.module.scss";

type CaseStudy = {
  slug: string;
  headline: string;
  category: string;
  contentFormat?: string;
  subline: string;
  thumbnailUrl?: string;
  thumbnailKind?: "image" | "video";
};

/** Homepage case-study list: surface `contentFormat === "essay"` with a badge. Off until needed again. */
const SHOW_ESSAY_FORMAT_BADGE_ON_HOME = false;

export default function HomeClient({
  caseStudies,
  assetManifest,
  isAdmin,
}: {
  caseStudies: CaseStudy[];
  assetManifest: AssetManifest;
  isAdmin?: boolean;
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
              {caseStudies.map((cs, i) => {
                const isEssay = cs.contentFormat === "essay";
                const prevIsEssay = i > 0 && caseStudies[i - 1].contentFormat === "essay";
                const needsDivider = isEssay && !prevIsEssay && i > 0;

                return (
                  <Fragment key={cs.slug}>
                    {needsDivider && <Divider className={styles.sectionDivider} />}
                    <StaggerItem>
                      <Link href={`/work/${cs.slug}`} className={styles.caseStudyLink} onClick={savePosition} {...getBlockHandlers(i)}>
                        {SHOW_ESSAY_FORMAT_BADGE_ON_HOME && isEssay && (
                          <Badge appearance="neutral" emphasis="minimal" size="sm" shape="squared" className={styles.essayBadge}>
                            Essay
                          </Badge>
                        )}
                        <span className={styles.caseStudyHeadline} data-cursor-text>{cs.headline}</span>
                        {cs.subline ? (
                          <span className={styles.caseStudyBlurb}>{cs.subline}</span>
                        ) : null}
                      </Link>
                    </StaggerItem>
                  </Fragment>
                );
              })}
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
