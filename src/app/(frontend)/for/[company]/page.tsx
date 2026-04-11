import { getCompanyFromSession } from "@/lib/company-session";
import { getCompanyBySlug } from "@/lib/company-data";
import { getPayloadClient } from "@/lib/payload";
import { redirect } from "next/navigation";
import { isVisibleOnHome } from "@/lib/project-filters";
import { resolveThumbnailUrl } from "@/lib/resolve-thumbnail-url";
import type { AssetEntry } from "@/lib/extract-content-urls";
import LoginClient from "./LoginClient";

type Props = {
  params: Promise<{ company: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function LoginPage({ params, searchParams }: Props) {
  const { company } = await params;
  const query = await searchParams;

  const isDevPreview =
    process.env.NODE_ENV === "development" && query.preview === "true";

  if (!isDevPreview) {
    const existingSession = await getCompanyFromSession();
    if (existingSession) {
      redirect("/");
    }
  }

  const config = await getCompanyBySlug(company);

  const theme = config && config.active
    ? { accent: config.accent || null, greeting: config.greeting }
    : { accent: null, greeting: "Welcome." };

  let thumbnailPreloads: AssetEntry[] = [];
  try {
    const payload = await getPayloadClient();
    const projectsRes = await payload.find({
      collection: "projects",
      sort: "order",
      limit: 50,
      depth: 1,
    });
    thumbnailPreloads = projectsRes.docs
      .filter((doc) =>
        isVisibleOnHome({
          slug: doc.slug,
          introBlurbHeadline: (doc as Record<string, unknown>).introBlurbHeadline as string | undefined,
        }),
      )
      .map((doc) => {
        const thumb = (doc as Record<string, unknown>).thumbnail as
          | { url?: string; mimeType?: string; sizes?: { thumbnail?: { url?: string } } }
          | null;
        return resolveThumbnailUrl(thumb);
      })
      .filter((entry): entry is AssetEntry => entry !== null);
  } catch {
    // Payload not connected — no preloads
  }

  return (
    <>
      {thumbnailPreloads.map((entry) =>
        entry.kind === "image" ? (
          <link key={entry.url} rel="preload" as="image" href={entry.url} />
        ) : (
          <link key={entry.url} rel="preload" as="video" href={entry.url} fetchPriority="low" />
        ),
      )}
      <LoginClient
        company={company}
        accent={theme.accent}
        greeting={theme.greeting}
      />
    </>
  );
}
