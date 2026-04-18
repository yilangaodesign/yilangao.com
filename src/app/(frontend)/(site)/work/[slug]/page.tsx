import { notFound } from "next/navigation";
import { getPayloadClient } from "@/lib/payload";
import { extractLexicalText } from "@/lib/lexical";
import { convertLexicalToHTML, defaultHTMLConverters } from "@payloadcms/richtext-lexical/html";
import type { SerializedEditorState } from "lexical";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { getCompanyFromSession } from "@/lib/company-session";
import { getCompanyBySlug } from "@/lib/company-data";
import { isVisibleOnHome } from "@/lib/project-filters";
import { RefreshRouteOnSave } from "@/components/RefreshRouteOnSave";
import type { RawBlock } from "@/lib/extract-content-urls";
import ProjectClient from "./ProjectClient";
import type { ContentBlock } from "./ProjectClient";

const HERO_METRICS: Record<string, { value: string; label: string; tooltip?: string }> = {
  lacework: {
    value: "58%",
    label: "usability improvement",
    tooltip: "Perceived ease-of-use scores from task-based evaluations with the customer success team. Scores rose from 60 to 95 out of 100.",
  },
  "elan-design-system": {
    value: "15 \u2192 3",
    label: "Avg corrections / session",
    tooltip: "Correction density across 40+ sessions over 8 days. Early sessions averaged 15 fundamental corrections (wrong tokens, inverted hierarchy, generic positioning). Late sessions averaged 3 refinement-level adjustments (voice register, headline technique, portfolio diversity).",
  },
  meteor: {
    value: "95%",
    label: "noise reduction",
    tooltip: "A representative basket review went from ~12,000 spreadsheet rows to ~560 exception flags. The remaining rows are auto-validated.",
  },
};

const INLINE_LINKS: Record<string, Record<string, string>> = {
  lacework: {
    "Lacework": "https://www.lacework.net",
    "Fortinet": "https://www.fortinet.com",
    "FortiCNAPP": "https://www.fortinet.com/products/cloud-security/forticnapp",
    "Snowflake": "https://www.snowflake.com",
    "LendingTree": "https://www.lendingtree.com",
  },
  "elan-design-system": {
    "IBM Carbon": "https://carbondesignsystem.com",
    "Radix UI": "https://www.radix-ui.com",
    "Framer Motion": "https://www.framer.com/motion",
    "Geist": "https://vercel.com/font",
  },
  meteor: {
    "Goldman Sachs": "https://www.goldmansachs.com",
  },
};

const COVER_IMAGES: Record<string, string> = {
  "elan-design-system": "/images/elan-cover.svg",
};

const INTERACTIVE_VISUALS: Record<string, Record<string, { component: string; playgroundUrl: string; playgroundLabel: string }>> = {
  "elan-design-system": {
    "Not the Components": {
      component: "CollaborationLoop",
      playgroundUrl: "https://yilangao-design-system.vercel.app",
      playgroundLabel: "Explore the full design system \u2192",
    },
    "The System Behind the System": {
      component: "SkillMap",
      playgroundUrl: "https://yilangao-design-system.vercel.app",
      playgroundLabel: "Explore the full design system \u2192",
    },
    "The Rising Floor": {
      component: "MaturityTimeline",
      playgroundUrl: "https://yilangao-design-system.vercel.app",
      playgroundLabel: "Explore the full design system \u2192",
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
            const media = img.image as { url?: string; mimeType?: string; alt?: string; sizes?: { card?: { url?: string }; hero?: { url?: string } } } | null
            const isVid = media?.mimeType?.startsWith('video/')
            const derivedUrl = !isVid ? (media?.sizes?.card?.url ?? media?.sizes?.hero?.url) : null
            const url = derivedUrl ?? media?.url ?? null
            if (!url) return null
            return { url, mimeType: media?.mimeType ?? undefined, alt: media?.alt ?? undefined, caption: img.caption ?? undefined }
          })
          .filter(Boolean) as { url: string; mimeType?: string; alt?: string; caption?: string }[]
        return {
          ...base,
          blockType: 'imageGroup' as const,
          layout: b.layout ?? 'auto',
          images,
          caption: b.caption ?? undefined,
          placeholderLabels: b.placeholderLabels ?? undefined,
        }
      }
      case 'divider':
        return { ...base, blockType: 'divider' as const }
      case 'hero': {
        const heroMedia = b.image as { url?: string; mimeType?: string; sizes?: { hero?: { url?: string } } } | null
        const isVid = heroMedia?.mimeType?.startsWith('video/')
        const heroDerivUrl = !isVid ? heroMedia?.sizes?.hero?.url : null
        return {
          ...base,
          blockType: 'hero' as const,
          imageUrl: heroDerivUrl ?? heroMedia?.url ?? undefined,
          mimeType: heroMedia?.mimeType ?? undefined,
          caption: b.caption ?? undefined,
          placeholderLabel: b.placeholderLabel as string | undefined,
        }
      }
      default:
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
  introBlurbHeadline: undefined as string | undefined,
  introBlurbBody: undefined as string | undefined,
  introBlurbBodyHtml: undefined as string | undefined,
  description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
  descriptionHtml: undefined as string | undefined,
  descriptionLexical: undefined as Record<string, unknown> | undefined,
  heroMetric: undefined as { value: string; label: string; tooltip?: string } | undefined,
  inlineLinks: {} as Record<string, string>,
  role: "Product Designer",
  collaborators: [{ name: "Name Surname" }, { name: "Name Surname" }, { name: "Design Team" }],
  duration: "~6 months",
  tools: [{ name: "Figma" }, { name: "React" }],
  externalLinks: [
    { label: "Website", href: "#" },
    { label: "Twitter", href: "#" },
  ],
  content: FALLBACK_BLOCKS,
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
      depth: 2,
    });

    if (res.docs.length > 0) {
      const doc = res.docs[0];
      const descPlain = extractLexicalText(doc.description) || "Project description.";
      const descHtml = safeConvertToHtml(doc.description);

      const introBlurbHeadline = (doc as Record<string, unknown>).introBlurbHeadline as string | undefined;
      const introBlurbBodyPlain = extractLexicalText((doc as Record<string, unknown>).introBlurbBody) || undefined;
      const introBlurbBodyHtml = safeConvertToHtml((doc as Record<string, unknown>).introBlurbBody) || undefined;

      const rawBlocks = (doc.content ?? []) as RawBlock[]
      const contentBlocks = mapContentBlocks(rawBlocks)

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

      project = {
        id: doc.id,
        slug: doc.slug,
        title: doc.title,
        category: doc.category,
        introBlurbHeadline: introBlurbHeadline || undefined,
        introBlurbBody: introBlurbBodyPlain,
        introBlurbBodyHtml: introBlurbBodyHtml && introBlurbBodyHtml !== introBlurbBodyPlain ? introBlurbBodyHtml : undefined,
        description: descPlain,
        descriptionHtml: descHtml !== descPlain ? descHtml : undefined,
        descriptionLexical: doc.description && typeof doc.description === 'object' ? (doc.description as Record<string, unknown>) : undefined,
        heroMetric: HERO_METRICS[doc.slug] ?? undefined,
        inlineLinks: INLINE_LINKS[doc.slug] ?? {},
        role: doc.role ?? "Designer",
        collaborators: doc.collaborators?.map((c: { name: string }) => ({ name: c.name })) ?? [],
        duration: doc.duration ?? "",
        tools: doc.tools?.map((t: { name: string }) => ({ name: t.name })) ?? [],
        externalLinks: doc.externalLinks?.map((l: { label: string; href: string }) => ({
          label: l.label,
          href: l.href,
        })) ?? [],
        content: contentBlocks,
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
  if (companySess) {
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
