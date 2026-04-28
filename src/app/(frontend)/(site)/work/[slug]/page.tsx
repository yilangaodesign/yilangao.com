import { notFound } from "next/navigation";
import { getPayloadClient } from "@/lib/payload";
import { extractLexicalText } from "@/lib/lexical";
import { computeReadTime } from "@/lib/read-time";
import { convertLexicalToHTML, defaultHTMLConverters } from "@payloadcms/richtext-lexical/html";
import type { SerializedEditorState } from "lexical";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { getCompanyFromSession } from "@/lib/company-session";
import { getCompanyBySlug } from "@/lib/company-data";
import { isVisibleOnHome } from "@/lib/project-filters";
import { RefreshRouteOnSave } from "@/components/RefreshRouteOnSave";
import type { RawBlock } from "@/lib/extract-content-urls";
import { parseVideoEmbedUrl } from "@/lib/parse-video-embed";
import ProjectClient from "./ProjectClient";
import type { ContentBlock, RenderItem, ImageContentBlock } from "./ProjectClient";

const HERO_METRICS: Record<string, { value: string; label: string; tooltip?: string }> = {
  lacework: {
    value: "58%",
    label: "usability improvement",
    tooltip: "Perceived ease-of-use scores from task-based evaluations with the customer success team. Scores rose from 60 to 95 out of 100.",
  },
  "elan-design-system": {
    value: "~5K",
    label: "knowledge graph edges",
    tooltip: "A typed knowledge graph with ~4,892 edges across 6 relationship types (strengthens, supersedes, narrows, weakens, related, cites). Built from 200+ anti-patterns, 18 skills, and 234 feedback entries across design, engineering, and content. The graph below is live.",
  },
  meteor: {
    value: "95%",
    label: "noise reduction",
    tooltip: "A representative basket review went from ~12,000 spreadsheet rows to ~560 exception flags. The remaining rows are auto-validated.",
  },
};

const COVER_IMAGES: Record<string, string> = {
  "elan-design-system": "/images/elan-cover.svg",
};

const INTERACTIVE_VISUALS: Record<string, Record<string, { component: string; playgroundUrl: string; playgroundLabel: string }>> = {
  "elan-design-system": {
    "Teach Once, Enforce Forever": {
      component: "CollaborationLoop",
      playgroundUrl: "https://yilangao-design-system.vercel.app",
      playgroundLabel: "Explore the full design system",
    },
    "The System Behind the System": {
      component: "SkillMap",
      playgroundUrl: "https://yilangao-design-system.vercel.app",
      playgroundLabel: "Explore the full design system",
    },
    "The Living Graph": {
      component: "GraphCanvas",
      playgroundUrl: "https://yilangao-design-system.vercel.app",
      playgroundLabel: "Explore the full design system",
    },
  },
};

function safeConvertToHtml(value: unknown): string {
  if (!value || typeof value !== 'object') return ''
  try {
    const data = value as SerializedEditorState
    if (!data.root) return ''
    return convertLexicalToHTML({
      converters: defaultHTMLConverters,
      data,
      disableContainer: true,
    })
  } catch {
    return ''
  }
}

// Row-grouping for atomic image blocks. Runs ONCE on the server so SSR and
// client hydration produce identical DOM (EAP-014). A row is "one image with
// rowBreak=true, followed by zero or more images with rowBreak=false"; any
// non-image block terminates the open row. Single-member rows are legal.
function buildRenderItems(blocks: ContentBlock[]): RenderItem[] {
  const items: RenderItem[] = []
  let openRow: Array<{ block: ImageContentBlock; cmsIndex: number }> | null = null
  const flush = () => {
    if (openRow && openRow.length > 0) items.push({ kind: 'row', items: openRow })
    openRow = null
  }
  blocks.forEach((block, cmsIndex) => {
    if (block.blockType !== 'image') {
      flush()
      items.push({ kind: 'block', block, cmsIndex })
      return
    }
    if (block.rowBreak === true || openRow === null) {
      flush()
      openRow = [{ block, cmsIndex }]
    } else {
      openRow.push({ block, cmsIndex })
    }
  })
  flush()
  return items
}

function mapContentBlocks(rawBlocks: RawBlock[]): ContentBlock[] {
  return rawBlocks.map((b) => {
    const base = { id: b.id ?? '' }
    switch (b.blockType) {
      case 'heading':
        return { ...base, blockType: 'heading' as const, text: b.text ?? '', level: (b.level ?? 'h2') as 'h2' | 'h3' }
      case 'richText': {
        const plain = extractLexicalText(b.body) || ''
        const html = safeConvertToHtml(b.body)
        const bodyLexical = b.body && typeof b.body === 'object' ? (b.body as Record<string, unknown>) : undefined
        return { ...base, blockType: 'richText' as const, body: plain, bodyHtml: html !== plain ? html : undefined, bodyLexical }
      }
      case 'imageGroup': {
        const images = (b.images ?? [])
          .map((img) => {
            const media = img.image as {
              url?: string
              mimeType?: string
              alt?: string
              width?: number | null
              height?: number | null
              playbackMode?: 'loop' | 'player' | null
              audioEnabled?: boolean | null
              muted?: boolean | null
              poster?: { url?: string } | null
            } | null
            // Use the original upload URL and let Next.js Image's optimizer
            // generate the responsive srcset. Using Payload's pre-shrunk `card`
            // derivative (768×512) as the source caused extreme upscaling on
            // Retina/wide screens and visibly blurry images. See ENG-163.
            const url = media?.url ?? null
            if (!url) return null
            const width = media?.width ?? undefined
            const height = media?.height ?? undefined
            return {
              url,
              mimeType: media?.mimeType ?? undefined,
              alt: media?.alt ?? undefined,
              caption: img.caption ?? undefined,
              playbackMode: media?.playbackMode ?? undefined,
              audioEnabled: typeof media?.audioEnabled === 'boolean' ? media.audioEnabled : undefined,
              muted: typeof media?.muted === 'boolean' ? media.muted : undefined,
              posterUrl: media?.poster?.url ?? undefined,
              mediaId: typeof (media as { id?: string | number } | null)?.id !== 'undefined' ? (media as { id?: string | number }).id : undefined,
              width: typeof width === 'number' ? width : undefined,
              height: typeof height === 'number' ? height : undefined,
            }
          })
          .filter(Boolean) as {
            url: string
            mimeType?: string
            alt?: string
            caption?: string
            playbackMode?: 'loop' | 'player'
            audioEnabled?: boolean
            muted?: boolean
            posterUrl?: string
            mediaId?: string | number
            width?: number
            height?: number
          }[]
        return {
          ...base,
          blockType: 'imageGroup' as const,
          layout: b.layout ?? 'auto',
          images,
          caption: b.caption ?? undefined,
          placeholderLabels: b.placeholderLabels ?? undefined,
        }
      }
      case 'image': {
        const media = b.image as {
          id?: string | number
          url?: string
          mimeType?: string
          alt?: string
          width?: number | null
          height?: number | null
          playbackMode?: 'loop' | 'player' | null
          audioEnabled?: boolean | null
          muted?: boolean | null
          poster?: { url?: string } | null
        } | null
        const url = media?.url ?? undefined
        const width = media?.width ?? undefined
        const height = media?.height ?? undefined
        return {
          ...base,
          blockType: 'image' as const,
          url,
          mimeType: media?.mimeType ?? undefined,
          mediaId: media?.id ?? undefined,
          mediaAlt: media?.alt ?? undefined,
          alt: (b.alt as string | null | undefined) ?? undefined,
          caption: b.caption ?? undefined,
          rowBreak: b.rowBreak === false ? false : true,
          widthFraction: typeof b.widthFraction === 'number' ? b.widthFraction : null,
          placeholderLabel: b.placeholderLabel ?? undefined,
          playbackMode: media?.playbackMode ?? undefined,
          audioEnabled: typeof media?.audioEnabled === 'boolean' ? media.audioEnabled : undefined,
          muted: typeof media?.muted === 'boolean' ? media.muted : undefined,
          posterUrl: media?.poster?.url ?? undefined,
          width: typeof width === 'number' ? width : undefined,
          height: typeof height === 'number' ? height : undefined,
        } satisfies ImageContentBlock
      }
      case 'divider':
        return { ...base, blockType: 'divider' as const }
      case 'hero': {
        const heroMedia = b.image as {
          id?: string | number
          url?: string
          mimeType?: string
          playbackMode?: 'loop' | 'player' | null
          audioEnabled?: boolean | null
          muted?: boolean | null
          poster?: { url?: string } | null
        } | null
        // Same rationale as imageGroup: use the original upload and let
        // Next.js generate responsive derivatives. Payload's `hero` size
        // caps at 1920 and still forced a 2× upscale on 3840-wide Retina
        // targets. See ENG-163.
        return {
          ...base,
          blockType: 'hero' as const,
          imageUrl: heroMedia?.url ?? undefined,
          mimeType: heroMedia?.mimeType ?? undefined,
          caption: b.caption ?? undefined,
          placeholderLabel: b.placeholderLabel as string | undefined,
          playbackMode: heroMedia?.playbackMode ?? undefined,
          audioEnabled: typeof heroMedia?.audioEnabled === 'boolean' ? heroMedia.audioEnabled : undefined,
          muted: typeof heroMedia?.muted === 'boolean' ? heroMedia.muted : undefined,
          posterUrl: heroMedia?.poster?.url ?? undefined,
          mediaId: heroMedia?.id ?? undefined,
        }
      }
      case 'videoEmbed': {
        const rawUrl = typeof b.url === 'string' ? b.url : ''
        const parsed = rawUrl ? parseVideoEmbedUrl(rawUrl) : null
        const posterUrl = b.poster?.url ?? undefined
        return {
          ...base,
          blockType: 'videoEmbed' as const,
          url: rawUrl || undefined,
          provider: parsed?.provider,
          embedUrl: parsed?.embedUrl,
          autoplayUrl: parsed?.autoplayUrl,
          autoThumbnailUrl: parsed?.autoThumbnailUrl ?? undefined,
          isVertical: parsed?.isVertical ?? false,
          startSeconds: parsed?.startSeconds,
          posterUrl,
          caption: b.caption ?? undefined,
          placeholderLabel: b.placeholderLabel as string | undefined,
        }
      }
      default:
        if (process.env.NODE_ENV !== 'production') {
          console.warn(`[work/[slug]] Unknown content blockType "${b.blockType}" — coerced to divider. Frontend may be behind CMS schema.`)
        }
        return { ...base, blockType: 'divider' as const }
    }
  })
}

const FALLBACK_BLOCKS: ContentBlock[] = [
  { id: 'fb-0', blockType: 'hero', imageUrl: undefined, caption: undefined },
  { id: 'fb-1', blockType: 'heading', text: 'Section Heading One', level: 'h2' },
  { id: 'fb-2', blockType: 'richText', body: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.' },
  { id: 'fb-3', blockType: 'heading', text: 'Section Heading Two', level: 'h2' },
  { id: 'fb-4', blockType: 'richText', body: 'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore.' },
]

const FALLBACK_PROJECT = {
  slug: "" as string | undefined,
  title: "Project Title",
  category: "Digital toolmaking",
  contentFormat: "caseStudy" as "caseStudy" | "essay",
  publishedAt: undefined as string | undefined,
  readTime: 1 as number,
  mediumUrl: undefined as string | undefined,
  introBlurbHeadline: undefined as string | undefined,
  introBlurbBody: undefined as string | undefined,
  introBlurbBodyHtml: undefined as string | undefined,
  heroMetric: undefined as { value: string; label: string; tooltip?: string } | undefined,
  role: "Product Designer",
  collaborators: [{ name: "Name Surname" }, { name: "Name Surname" }, { name: "Design Team" }],
  duration: "~6 months",
  tools: [{ name: "Figma" }, { name: "React" }],
  externalLinks: [
    { label: "Website", href: "#" },
    { label: "Twitter", href: "#" },
  ],
  content: FALLBACK_BLOCKS,
  renderItems: FALLBACK_BLOCKS.map((block, i) => ({ kind: 'block' as const, block, cmsIndex: i })) as RenderItem[],
};

type AdjacentProject = { slug: string; title: string } | null;

type Props = {
  params: Promise<{ slug: string }>;
};

export default async function ProjectPage({ params }: Props) {
  const { slug } = await params;

  let project: typeof FALLBACK_PROJECT & { id?: string | number } = FALLBACK_PROJECT;
  let prevProject: AdjacentProject = null;
  let nextProject: AdjacentProject = null;
  const isAdmin = await isAdminAuthenticated();

  try {
    const payload = await getPayloadClient();

    const res = await payload.find({
      collection: "projects",
      where: { slug: { equals: slug } },
      limit: 1,
      depth: 3,
    });

    if (res.docs.length > 0) {
      const doc = res.docs[0];

      const introBlurbHeadline = (doc as Record<string, unknown>).introBlurbHeadline as string | undefined;
      const introBlurbBodyPlain = extractLexicalText((doc as Record<string, unknown>).introBlurbBody) || undefined;
      const introBlurbBodyHtml = safeConvertToHtml((doc as Record<string, unknown>).introBlurbBody) || undefined;

      const rawBlocks = (doc.content ?? []) as RawBlock[]
      const contentBlocks = mapContentBlocks(rawBlocks)
      // renderItems is grouped server-side; see note above buildRenderItems

      const heroImg = doc.heroImage as { url?: string } | string | null | undefined;
      const legacyHeroUrl = typeof heroImg === 'object' && heroImg?.url ? heroImg.url : undefined;
      const coverImageUrl = legacyHeroUrl ?? COVER_IMAGES[doc.slug] ?? undefined;

      const heroBlockIdx = contentBlocks.findIndex((b) => b.blockType === 'hero');
      if (coverImageUrl) {
        if (heroBlockIdx === -1) {
          contentBlocks.unshift({ id: 'legacy-hero', blockType: 'hero', imageUrl: coverImageUrl, caption: undefined })
        } else if (!(contentBlocks[heroBlockIdx] as { imageUrl?: string }).imageUrl) {
          contentBlocks[heroBlockIdx] = { ...contentBlocks[heroBlockIdx], imageUrl: coverImageUrl } as ContentBlock
        }
      }

      const rawContentFormat = (doc as Record<string, unknown>).contentFormat;
      const contentFormat: "caseStudy" | "essay" = rawContentFormat === "essay" ? "essay" : "caseStudy";
      const publishedAtRaw = (doc as Record<string, unknown>).publishedAt;
      const publishedAt = typeof publishedAtRaw === "string" && publishedAtRaw ? publishedAtRaw : undefined;
      const readTimeOverrideRaw = (doc as Record<string, unknown>).readTimeMinutesOverride;
      const readTimeOverride =
        typeof readTimeOverrideRaw === "number" && readTimeOverrideRaw > 0 ? readTimeOverrideRaw : null;
      const mediumUrlRaw = (doc as Record<string, unknown>).mediumUrl;
      const mediumUrl = typeof mediumUrlRaw === "string" && mediumUrlRaw.trim() ? mediumUrlRaw.trim() : undefined;
      const readTime = readTimeOverride ?? computeReadTime(contentBlocks, introBlurbBodyPlain, introBlurbHeadline);

      project = {
        id: doc.id,
        slug: doc.slug,
        title: doc.title,
        category: doc.category,
        contentFormat,
        publishedAt,
        readTime,
        mediumUrl,
        introBlurbHeadline: introBlurbHeadline || undefined,
        introBlurbBody: introBlurbBodyPlain,
        introBlurbBodyHtml: introBlurbBodyHtml && introBlurbBodyHtml !== introBlurbBodyPlain ? introBlurbBodyHtml : undefined,
        heroMetric: HERO_METRICS[doc.slug] ?? undefined,
        role: doc.role ?? "Designer",
        collaborators: doc.collaborators?.map((c: { name: string }) => ({ name: c.name })) ?? [],
        duration: doc.duration ?? "",
        tools: doc.tools?.map((t: { name: string }) => ({ name: t.name })) ?? [],
        externalLinks: doc.externalLinks?.map((l: { label: string; href: string }) => ({
          label: l.label,
          href: l.href,
        })) ?? [],
        content: contentBlocks,
        renderItems: buildRenderItems(contentBlocks),
      };

      const allRes = await payload.find({
        collection: "projects",
        sort: "order",
        limit: 100,
        depth: 0,
      });

      const homeVisible = allRes.docs.filter((d) =>
        isVisibleOnHome({
          slug: d.slug,
          introBlurbHeadline: (d as Record<string, unknown>).introBlurbHeadline as string | undefined,
        }),
      );

      const currentIdx = homeVisible.findIndex((d) => d.slug === doc.slug);
      if (currentIdx > 0) {
        const prev = homeVisible[currentIdx - 1];
        prevProject = { slug: prev.slug, title: prev.title };
      }
      if (currentIdx !== -1 && currentIdx < homeVisible.length - 1) {
        const next = homeVisible[currentIdx + 1];
        nextProject = { slug: next.slug, title: next.title };
      }
    } else {
      notFound();
    }
  } catch {
    // Payload not connected — use fallback data
  }

  const interactiveVisuals = INTERACTIVE_VISUALS[slug] ?? undefined;

  let companyNote: { companyName: string; note: string } | undefined;
  const companySess = await getCompanyFromSession();
  if (companySess && companySess !== "welcome") {
    const companyConfig = await getCompanyBySlug(companySess);
    if (companyConfig) {
      const noteEntry = companyConfig.caseStudyNotes.find((n) => n.projectSlug === slug);
      if (noteEntry) {
        companyNote = { companyName: companyConfig.name, note: noteEntry.note };
      }
    }
  }

  return (
    <>
      <RefreshRouteOnSave />
      <ProjectClient
        project={project}
        prevProject={prevProject}
        nextProject={nextProject}
        isAdmin={isAdmin}
        interactiveVisuals={interactiveVisuals}
        companyNote={companyNote}
      />
    </>
  );
}
