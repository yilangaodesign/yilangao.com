import { getPayloadClient } from "@/lib/payload";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { RefreshRouteOnSave } from "@/components/RefreshRouteOnSave";
import { HOME_CASE_SUBLINE_BY_SLUG } from "@/lib/home-case-subline";
import { isVisibleOnHome } from "@/lib/project-filters";
import { resolveThumbnailUrl } from "@/lib/resolve-thumbnail-url";
import { extractContentUrls } from "@/lib/extract-content-urls";
import type { AssetManifest, RawBlock } from "@/lib/extract-content-urls";
import HomeClient from "./HomeClient";

export default async function Home() {
  let caseStudies: {
    slug: string;
    headline: string;
    category: string;
    contentFormat?: string;
    subline: string;
    thumbnailUrl?: string;
    thumbnailKind?: "image" | "video";
  }[] = [];
  let assetManifest: AssetManifest = [];
  const isAdmin = await isAdminAuthenticated();

  try {
    const payload = await getPayloadClient();

    const projectsRes = await payload.find({
      collection: "projects",
      sort: "order",
      limit: 50,
      depth: 2,
    });

    if (projectsRes.docs.length > 0) {
      const filtered = projectsRes.docs.filter((doc) =>
        isVisibleOnHome({
          slug: doc.slug,
          introBlurbHeadline: (doc as Record<string, unknown>).introBlurbHeadline as string | undefined,
        }),
      );

      caseStudies = filtered.map((doc) => {
        const thumb = (doc as Record<string, unknown>).thumbnail as
          | { url?: string; mimeType?: string; sizes?: { thumbnail?: { url?: string } } }
          | null;
        const resolved = resolveThumbnailUrl(thumb);
        return {
          slug: doc.slug,
          headline: (doc as Record<string, unknown>).introBlurbHeadline as string,
          category: (doc.category as string) ?? "",
          contentFormat: (doc as Record<string, unknown>).contentFormat as string | undefined,
          subline: HOME_CASE_SUBLINE_BY_SLUG[doc.slug] ?? "",
          thumbnailUrl: resolved?.url,
          thumbnailKind: resolved?.kind,
        };
      });

      assetManifest = filtered.map((doc) => {
        const rawBlocks = (doc.content ?? []) as RawBlock[];
        const { hero, content } = extractContentUrls(rawBlocks);
        return { slug: doc.slug, hero, content };
      });
    }
  } catch {
    // Payload not connected — use fallback data
  }

  return (
    <>
      <RefreshRouteOnSave />
      <HomeClient
        caseStudies={caseStudies}
        assetManifest={assetManifest}
        isAdmin={isAdmin}
      />
    </>
  );
}
