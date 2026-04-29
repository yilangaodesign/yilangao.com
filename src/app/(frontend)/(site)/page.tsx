import { getPayloadClient } from "@/lib/payload";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { getCompanyFromSession } from "@/lib/company-session";
import { getCompanyBySlug } from "@/lib/company-data";
import { RefreshRouteOnSave } from "@/components/RefreshRouteOnSave";
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
    subline: string;
    thumbnailUrl?: string;
    thumbnailKind?: "image" | "video";
  }[] = [];
  let assetManifest: AssetManifest = [];
  const isAdmin = await isAdminAuthenticated();

  let personalization: { name: string; slugs: string[] } | undefined;
  try {
    const companySlug = await getCompanyFromSession();
    if (companySlug && companySlug !== "welcome") {
      const company = await getCompanyBySlug(companySlug);
      if (company) {
        const slugs = company.caseStudyNotes
          .filter((n) => n.note?.trim())
          .map((n) => n.projectSlug);
        if (slugs.length > 0) {
          personalization = { name: company.name, slugs };
        }
      }
    }
  } catch {
    // Company lookup failure — degrade to no badges
  }

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
          subline: (doc.category as string) ?? "",
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
        personalization={personalization}
      />
    </>
  );
}
