"use client";

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { PreloadManager } from "@/lib/preload-manager";
import { applyImageDropIntent, targetInsertIndex } from "@/lib/normalize-image-rows";
import { FadeIn } from "@/components/ui/FadeIn";
import AdminBar from "@/components/AdminBar";
import ScrollSpy from "@/components/ui/ScrollSpy/ScrollSpy";
import type { ScrollSpySection } from "@/components/ui/ScrollSpy/ScrollSpy";
import {
  InlineEditProvider,
  EditableText,
  EditableArray,
  InlineEditBar,
  ImageUploadZone,
  VideoSettings,
  ImageBlockAdminOverlay,
  VideoEmbedInput,
  useBlockManager,
  useBlockKeyboardNav,
  BlockToolbar,
  BetweenBlockInsert,
  BlockInsertMenu,
  LexicalBlockEditor,
} from "@/components/inline-edit";
import type { ApiTarget, FieldDefinition, BlockType } from "@/components/inline-edit";
import { uploadMedia, updateCollectionField } from "@/components/inline-edit/api";
import {
  TokenGrid,
  ComponentShowcase,
  EscalationTimeline,
  InteractionShowcase,
  IncidentDensityMap,
  CollaborationLoop,
  SkillMap,
  MaturityTimeline,
} from "@/components/elan-visuals";
import {
  DndContext,
  DragOverlay,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import type { DragEndEvent, DragOverEvent, DragStartEvent } from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { InfoTooltip, Tooltip } from "@/components/ui/Tooltip";
import MediaRenderer from "@/components/ui/MediaRenderer/MediaRenderer";
import { VideoEmbed } from "@/components/ui/VideoEmbed";
import { Dropzone } from "@/components/ui/Dropzone";
import type { EmbedProvider } from "@/lib/parse-video-embed";
import { track } from "@/lib/analytics/mixpanel";
import elanStyles from "@/components/elan-visuals/elan-visuals.module.scss";
import { siteShellStyles } from "@/components/SiteFooter";
import { EssayHeader } from "@/components/essay/EssayHeader";
import styles from "./page.module.scss";

/* ── Block types (shared with page.tsx server component) ── */

export type ImageContentBlock = {
  id: string
  blockType: 'image'
  url?: string
  mimeType?: string
  mediaId?: string | number
  mediaAlt?: string
  alt?: string
  caption?: string
  rowBreak: boolean
  widthFraction?: number | null
  placeholderLabel?: string
  playbackMode?: 'loop' | 'player'
  audioEnabled?: boolean
  muted?: boolean
  posterUrl?: string
  width?: number
  height?: number
}

export type ContentBlock =
  | { id: string; blockType: 'heading'; text: string; level: 'h2' | 'h3' }
  | { id: string; blockType: 'richText'; body: string; bodyHtml?: string; bodyLexical?: Record<string, unknown> }
  | {
      id: string
      blockType: 'imageGroup'
      layout: string
      images: {
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
      caption?: string
      placeholderLabels?: string[]
    }
  | ImageContentBlock
  | { id: string; blockType: 'divider' }
  | {
      id: string
      blockType: 'hero'
      imageUrl?: string
      mimeType?: string
      caption?: string
      placeholderLabel?: string
      playbackMode?: 'loop' | 'player'
      audioEnabled?: boolean
      muted?: boolean
      posterUrl?: string
      mediaId?: string | number
    }
  | {
      id: string
      blockType: 'videoEmbed'
      url?: string
      provider?: EmbedProvider
      embedUrl?: string
      autoplayUrl?: string
      autoThumbnailUrl?: string
      isVertical?: boolean
      startSeconds?: number
      posterUrl?: string
      caption?: string
      placeholderLabel?: string
    };

// Server-grouped render shape. See `buildRenderItems` in page.tsx.
// A row is a contiguous run of `image` blocks whose first member has
// rowBreak=true; subsequent members with rowBreak=false extend the row.
export type RenderItem =
  | { kind: 'block'; block: ContentBlock; cmsIndex: number }
  | { kind: 'row'; items: Array<{ block: ImageContentBlock; cmsIndex: number }> };

/**
 * Width resolution for a row of atomic image blocks.
 *
 * Rules (see plan §3):
 * 1. If ALL widthFractions are null → equal distribution (each: flex 1 1 0%).
 * 2. If ALL are explicit and sum≈1.0 → use each as flex-basis percent.
 * 3. Mixed nulls + explicits:
 *    - if explicit sum < 1.0 → distribute remainder equally among null members
 *    - if explicit sum >= 1.0 → fall back to equal distribution, warn in dev
 * 4. All explicit but sum off from 1.0 → normalize by sum (defensive).
 */
function resolveRowFlex(widths: Array<number | null | undefined>): string[] {
  const n = widths.length
  if (n === 0) return []
  const normalized = widths.map((w) => (typeof w === 'number' && Number.isFinite(w) ? w : null))
  const explicitIdx = normalized.map((w, i) => (w !== null ? i : -1)).filter((i) => i !== -1)
  const nullCount = n - explicitIdx.length
  const explicitSum = explicitIdx.reduce((s, i) => s + (normalized[i] as number), 0)

  if (nullCount === n) {
    return new Array(n).fill('1 1 0%')
  }
  if (nullCount === 0) {
    const sum = explicitSum
    if (Math.abs(sum - 1) <= 0.01) {
      return normalized.map((w) => `0 0 ${((w as number) * 100).toFixed(4)}%`)
    }
    if (sum > 0) {
      return normalized.map((w) => `0 0 ${(((w as number) / sum) * 100).toFixed(4)}%`)
    }
    return new Array(n).fill('1 1 0%')
  }
  if (explicitSum >= 1) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('[ProjectClient] widthFraction sum >= 1 with null members; falling back to equal distribution')
    }
    return new Array(n).fill('1 1 0%')
  }
  const remainderPer = (1 - explicitSum) / nullCount
  return normalized.map((w) =>
    w === null
      ? `0 0 ${(remainderPer * 100).toFixed(4)}%`
      : `0 0 ${((w as number) * 100).toFixed(4)}%`,
  )
}

type Collaborator = { name: string };
type Tool = { name: string };
type ExternalLink = { label: string; href: string };

type ProjectData = {
  id?: string | number;
  slug?: string;
  title: string;
  category: string;
  contentFormat?: "caseStudy" | "essay";
  publishedAt?: string;
  readTime?: number;
  mediumUrl?: string;
  introBlurbHeadline?: string;
  introBlurbBody?: string;
  introBlurbBodyHtml?: string;
  heroMetric?: { value: string; label: string; tooltip?: string };
  role: string;
  collaborators: Collaborator[];
  duration: string;
  tools: Tool[];
  externalLinks: ExternalLink[];
  content: ContentBlock[];
  renderItems?: RenderItem[];
};

type InteractiveVisualConfig = {
  component: string;
  playgroundUrl: string;
  playgroundLabel: string;
};

type AdjacentProject = {
  slug: string;
  title: string;
} | null;

const COLLABORATOR_FIELDS: FieldDefinition[] = [
  { name: 'name', label: 'Name', type: 'text', required: true },
];

const TOOL_FIELDS: FieldDefinition[] = [
  { name: 'name', label: 'Tool', type: 'text', required: true },
];

const EXT_LINK_FIELDS: FieldDefinition[] = [
  { name: 'label', label: 'Label', type: 'text', required: true },
  { name: 'href', label: 'URL or File', type: 'media-url', required: true },
];

function ArrowLeft() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path d="M8.5 3L4.5 7L8.5 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ArrowRight() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path d="M5.5 3L9.5 7L5.5 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

const VISUAL_COMPONENTS: Record<string, React.ComponentType> = {
  TokenGrid,
  ComponentShowcase,
  EscalationTimeline,
  InteractionShowcase,
  IncidentDensityMap,
  CollaborationLoop,
  SkillMap,
  MaturityTimeline,
};

function InteractiveVisual({ config }: { config: InteractiveVisualConfig }) {
  const Component = VISUAL_COMPONENTS[config.component];
  if (!Component) return null;
  return (
    <div className={styles.interactiveVisualBlock}>
      <Component />
      <a
        href={config.playgroundUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={elanStyles.playgroundLink}
        onClick={() => track("External Link Clicked", {
          destination_url: config.playgroundUrl,
          link_label: config.playgroundLabel,
          context: "case_study_interactive",
        })}
      >
        {config.playgroundLabel}
      </a>
    </div>
  );
}

function DragHandleIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
      <circle cx="4" cy="2.5" r="1" fill="currentColor" />
      <circle cx="8" cy="2.5" r="1" fill="currentColor" />
      <circle cx="4" cy="6" r="1" fill="currentColor" />
      <circle cx="8" cy="6" r="1" fill="currentColor" />
      <circle cx="4" cy="9.5" r="1" fill="currentColor" />
      <circle cx="8" cy="9.5" r="1" fill="currentColor" />
    </svg>
  );
}

type DropEdge = 'before' | 'after' | 'left' | 'right' | null;

function SortableBlock({
  id,
  children,
  isAdmin,
  dropPosition,
}: {
  id: string;
  children: React.ReactNode;
  isAdmin?: boolean;
  dropPosition?: DropEdge;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.35 : 1,
  };

  const wrapperClass = [
    styles.blockWrapper,
    isDragging && styles.blockWrapperDragging,
  ].filter(Boolean).join(' ');

  return (
    <div ref={setNodeRef} style={style} {...attributes} className={wrapperClass}>
      {dropPosition === 'before' && <div className={styles.dropLine} aria-hidden />}
      <div className={styles.sortableInner}>
        {isAdmin && (
          <button
            ref={setActivatorNodeRef}
            {...listeners}
            type="button"
            className={styles.dragHandle}
            aria-label="Drag to reorder"
          >
            <DragHandleIcon />
          </button>
        )}
        <div className={styles.sortableContent}>
          {children}
        </div>
        {/* Vertical landing lines signal "merge into this image's row"
            (left = drop on this image's left edge, right = drop on its
            right edge). Horizontal .dropLine above/below signals split
            into a new row. See ENG-179. */}
        {dropPosition === 'left' && (
          <div className={`${styles.dropLineVertical} ${styles.dropLineVerticalLeft}`} aria-hidden />
        )}
        {dropPosition === 'right' && (
          <div className={`${styles.dropLineVertical} ${styles.dropLineVerticalRight}`} aria-hidden />
        )}
      </div>
      {dropPosition === 'after' && <div className={styles.dropLine} aria-hidden />}
    </div>
  );
}

const LAYOUT_CLASS_MAP: Record<string, string> = {
  'full-width': styles.imageFullWidth,
  'grid-2-equal': styles.imageGrid2,
  'grid-2-left-heavy': styles.imageGridLeftHeavy,
  'grid-2-right-heavy': styles.imageGridRightHeavy,
  'grid-3-bento': styles.imageGrid3,
  'grid-3-equal': styles.imageGrid3Equal,
  'stacked': styles.imageStacked,
};

function getLayoutClass(layout: string, imageCount: number): string {
  if (layout !== 'auto') return LAYOUT_CLASS_MAP[layout] ?? styles.imageBlock;
  if (imageCount === 1) return styles.imageBlock;
  if (imageCount === 2) return styles.imageGrid2;
  return styles.imageGrid3;
}

function getImageSizes(layout: string, imageCount: number): string {
  const effective = layout === 'auto'
    ? (imageCount === 1 ? 'full-width' : imageCount === 2 ? 'grid-2-equal' : 'grid-3-equal')
    : layout;
  if (effective.startsWith('grid-3')) return '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw';
  if (effective.startsWith('grid-2')) return '(max-width: 640px) 100vw, 50vw';
  return '100vw';
}

type ProjectClientProps = {
  project: ProjectData;
  prevProject?: AdjacentProject;
  nextProject?: AdjacentProject;
  isAdmin?: boolean;
  interactiveVisuals?: Record<string, InteractiveVisualConfig>;
  companyNote?: { companyName: string; note: string };
};

// ProjectClientBody is the body of the case-study page. It is split out from
// the default export so that `InlineEditProvider` (which mounts
// `ConfirmProvider` and `InlineToastProvider`) can wrap this component from
// the OUTSIDE — a prerequisite for `useBlockManager()` below, whose call to
// `useConfirm()` must resolve against the real context, not the no-op
// fallback. See ENG-185.
function ProjectClientBody({
  project,
  prevProject,
  nextProject,
  isAdmin,
  interactiveVisuals,
  companyNote,
}: ProjectClientProps) {
  const p = project;
  const isEssay = p.contentFormat === "essay";
  const router = useRouter();

  useLayoutEffect(() => {
    window.scrollTo(0, 0);
  }, [p.slug]);

  useEffect(() => {
    if (p.slug) {
      PreloadManager.bump(p.slug);
    }
  }, [p.slug]);

  // Optimistic local mirror of `p.content`. `patchContent` in
  // `useBlockManager` has a ~3–5s roundtrip (GET → PATCH → router.refresh),
  // during which the server-driven `p.content` prop is stale. Without a
  // local override the drag-released block snaps back visually until the
  // refresh completes, making DnD feel broken (ENG-175). When set,
  // `optimisticContent` takes precedence until fresh server content
  // arrives, at which point the effect below clears it so the server
  // remains the source of truth.
  const [optimisticContent, setOptimisticContent] = useState<ContentBlock[] | null>(null);
  useEffect(() => {
    setOptimisticContent(null);
  }, [p.content]);
  const activeContent = optimisticContent ?? p.content;

  const projectTarget: ApiTarget | undefined = useMemo(
    () => p.id ? { type: 'collection', slug: 'projects', id: p.id } : undefined,
    [p.id],
  );

  const heroBlock = useMemo(
    () => activeContent.find((b): b is ContentBlock & { blockType: 'hero' } => b.blockType === 'hero'),
    [activeContent],
  );

  const heroBlockIndex = useMemo(
    () => activeContent.findIndex(b => b.blockType === 'hero'),
    [activeContent],
  );

  const heroFileRef = useRef<HTMLInputElement>(null);
  const [heroUploading, setHeroUploading] = useState(false);

  const replaceHeroImage = useCallback(async (file: File) => {
    if ((!file.type.startsWith('image/') && !file.type.startsWith('video/')) || !p.id) return;
    setHeroUploading(true);
    try {
      const media = await uploadMedia(file, file.name.replace(/\.[^.]+$/, ''));
      if (heroBlockIndex >= 0) {
        const res = await fetch(`/api/projects/${p.id}`, { credentials: 'include' });
        if (!res.ok) throw new Error('Failed to fetch project');
        const json = await res.json();
        const blocks = [...(json.content ?? [])] as Record<string, unknown>[];
        blocks[heroBlockIndex] = { ...blocks[heroBlockIndex], image: media.id };
        await updateCollectionField('projects', p.id, 'content', blocks);
      }
      router.refresh();
    } catch {
      // Upload errors surface via the block manager pattern
    } finally {
      setHeroUploading(false);
    }
  }, [p.id, heroBlockIndex, router]);

  const handleHeroFileChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) replaceHeroImage(file);
    if (e.target) e.target.value = '';
  }, [replaceHeroImage]);

  const contentBlocks = useMemo(
    () => activeContent
      .map((b, i) => ({ block: b, originalIndex: i }))
      .filter(({ block }) => block.blockType !== 'hero'),
    [activeContent],
  );

  // `displayItems` is the unit the render loop iterates over. A displayItem is
  // either a single non-image block, a single atomic image block, or a "row"
  // (contiguous run of atomic image blocks forming a horizontal layout). The
  // server computes `p.renderItems` from the unfiltered `content` array; we
  // strip hero blocks here to match `contentBlocks`. Client fallback derives
  // the same structure if the server payload predates this field.
  const displayItems = useMemo<RenderItem[]>(() => {
    // When we have an optimistic override, re-derive row grouping from the
    // client-side `contentBlocks` (which already mirrors `optimisticContent`).
    // The server's `p.renderItems` references the pre-reorder `cmsIndex`es
    // and would misalign the row boundaries until the next refresh completes.
    if (optimisticContent === null && p.renderItems && p.renderItems.length > 0) {
      return p.renderItems.filter((item) => {
        if (item.kind === 'block') return item.block.blockType !== 'hero'
        return true
      })
    }
    const items: RenderItem[] = []
    let openRow: Array<{ block: ImageContentBlock; cmsIndex: number }> | null = null
    const flush = () => {
      if (openRow && openRow.length > 0) items.push({ kind: 'row', items: openRow })
      openRow = null
    }
    contentBlocks.forEach(({ block, originalIndex }) => {
      if (block.blockType !== 'image') {
        flush()
        items.push({ kind: 'block', block, cmsIndex: originalIndex })
        return
      }
      const img = block as ImageContentBlock
      if (img.rowBreak === true || openRow === null) {
        flush()
        openRow = [{ block: img, cmsIndex: originalIndex }]
      } else {
        openRow.push({ block: img, cmsIndex: originalIndex })
      }
    })
    flush()
    return items
  }, [p.renderItems, contentBlocks, optimisticContent])

  const spySections: ScrollSpySection[] = useMemo(
    () => [
      { id: 'intro', label: 'Overview' },
      ...contentBlocks
        .filter((item): item is { block: ContentBlock & { blockType: 'heading' }; originalIndex: number } => item.block.blockType === 'heading')
        .map(({ block }) => ({
          id: slugify(block.text),
          label: block.text,
        })),
    ],
    [contentBlocks],
  );

  useEffect(() => {
    track("Case Study Viewed", {
      study_slug: p.slug,
      has_personalization: !!companyNote,
    });
  }, [p.slug, companyNote]);

  const firedSections = useRef(new Set<string>());
  useEffect(() => {
    firedSections.current.clear();
    const elements = spySections
      .map((s) => document.getElementById(s.id))
      .filter(Boolean) as HTMLElement[];
    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const el = entry.target as HTMLElement;
          const section = spySections.find((s) => s.id === el.id);
          if (section && !firedSections.current.has(section.id)) {
            firedSections.current.add(section.id);
            track("Section Reached", {
              study_slug: p.slug,
              section_id: section.id,
              section_label: section.label,
            });
          }
        }
      },
      { rootMargin: "-20% 0px -60% 0px", threshold: 0 },
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [spySections, p.slug]);

  const blockMgr = useBlockManager(projectTarget)
  // Keyboard nav targets `[data-block-index="${displayIndex}"]` wrappers, so
  // the bounds check must use the display-item count, not the raw block count.
  // With atomic image rows (N members → 1 display item) the two diverge.
  const blockNav = useBlockKeyboardNav(blockMgr.deleteBlock, displayItems.length)

  const dndSensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
  )
  // DnD operates on individual blocks — every image inside a row is its own
  // sortable so users can reorder or split rows by dragging. The flat id
  // list preserves the linear CMS order; visual row grouping is handled
  // purely at render time (see the row branch in the render loop below).
  // ENG-176: the earlier "row as single unit" scheme prevented intra-row
  // rearrangement, which was the original intent of the atomic image
  // migration.
  const displayIds = useMemo(
    () => contentBlocks.map(({ block, originalIndex }) => block.id || `block-${originalIndex}`),
    [contentBlocks],
  )

  // Map from sortable id back to the CMS-content index. Used by
  // `handleDragEnd` to translate drag ids (block ids) into `content[]`
  // positions for the splice transform.
  const blockIdToCmsIndex = useMemo(() => {
    const m = new Map<string, number>()
    contentBlocks.forEach(({ block, originalIndex }) => {
      m.set(block.id || `block-${originalIndex}`, originalIndex)
    })
    return m
  }, [contentBlocks])

  const [activeDragId, setActiveDragId] = useState<string | null>(null)
  const [overDragId, setOverDragId] = useState<string | null>(null)
  // Intent captured during drag — 'merge' means the dragged image will
  // join the over-target's row (rowBreak=false); 'split' means it
  // becomes its own row head (rowBreak=true). `side` drives the visual
  // indicator on the target block. Null when no merge/split decision
  // applies (e.g. dragging a non-image block, or dragging over self).
  // See ENG-179.
  const [dropIntent, setDropIntent] = useState<{
    intent: 'merge' | 'split'
    side: 'left' | 'right' | 'top' | 'bottom'
  } | null>(null)

  const activeDragFilterIndex = activeDragId ? displayIds.indexOf(activeDragId) : -1
  const overDragFilterIndex = overDragId ? displayIds.indexOf(overDragId) : -1

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveDragId(String(event.active.id))
    setOverDragId(String(event.active.id))
    setDropIntent(null)
  }, [])

  // Drop-intent detection from pointer geometry. dnd-kit hands us both
  // the translated active rect and the target's static rect on every
  // drag-over frame; the sign and magnitude of their center-delta
  // encodes which edge the author is aiming at. |dx| > |dy| = the
  // dragged block is primarily horizontally-displaced from the target,
  // i.e. the author is trying to place it BESIDE — merge. Otherwise
  // it's above/below — split. Merge only makes sense when landing on
  // another image (non-image neighbors are always vertical in this
  // layout), so non-image targets collapse to split.
  const handleDragOver = useCallback(
    (event: DragOverEvent) => {
      const { active, over } = event
      if (!over) {
        setOverDragId(null)
        setDropIntent(null)
        return
      }
      setOverDragId(String(over.id))
      if (active.id === over.id) {
        setDropIntent(null)
        return
      }
      const activeTranslated = active.rect.current?.translated
      const overRect = over.rect
      if (!activeTranslated) {
        setDropIntent(null)
        return
      }
      const ax = (activeTranslated.left + activeTranslated.right) / 2
      const ay = (activeTranslated.top + activeTranslated.bottom) / 2
      const ox = (overRect.left + overRect.right) / 2
      const oy = (overRect.top + overRect.bottom) / 2
      const dx = ax - ox
      const dy = ay - oy

      const overCmsIdx = blockIdToCmsIndex.get(String(over.id))
      const overBlock = overCmsIdx !== undefined ? activeContent[overCmsIdx] : undefined
      const isOverImage = overBlock?.blockType === 'image'
      const activeCmsIdx = blockIdToCmsIndex.get(String(active.id))
      const activeBlock = activeCmsIdx !== undefined ? activeContent[activeCmsIdx] : undefined
      const isActiveImage = activeBlock?.blockType === 'image'

      if (isOverImage && isActiveImage && Math.abs(dx) > Math.abs(dy)) {
        setDropIntent({ intent: 'merge', side: dx > 0 ? 'right' : 'left' })
      } else {
        setDropIntent({ intent: 'split', side: dy > 0 ? 'bottom' : 'top' })
      }
    },
    [blockIdToCmsIndex, activeContent],
  )

  const handleDragCancel = useCallback(() => {
    setActiveDragId(null)
    setOverDragId(null)
    setDropIntent(null)
  }, [])

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const currentIntent = dropIntent
      setActiveDragId(null)
      setOverDragId(null)
      setDropIntent(null)
      const { active, over } = event
      if (!over || active.id === over.id) return
      const fromCmsIdx = blockIdToCmsIndex.get(String(active.id))
      const toCmsIdx = blockIdToCmsIndex.get(String(over.id))
      if (fromCmsIdx === undefined || toCmsIdx === undefined || fromCmsIdx === toCmsIdx) return
      // Side-aware target insertion. Merge-right / split-below place the
      // moved block immediately after the target; merge-left / split-
      // above place it at the target's slot (pushing target down). The
      // prior `fromCmsIdx < toCmsIdx ? toCmsIdx - 1 : toCmsIdx` formula
      // was side-unaware and collapsed both cases into one, which broke
      // the merge-onto-left-edge scenario (ENG-179).
      const sideForInsert = currentIntent?.side ?? (fromCmsIdx < toCmsIdx ? 'bottom' : 'top')
      const preRemovalInsertIdx = targetInsertIndex(toCmsIdx, sideForInsert)
      const postRemovalToIdx =
        fromCmsIdx < preRemovalInsertIdx ? preRemovalInsertIdx - 1 : preRemovalInsertIdx

      const activeBlock = activeContent[fromCmsIdx]
      const isActiveImage = activeBlock?.blockType === 'image'

      // Non-image drag: pure reorder path (no rowBreak semantics apply).
      // Image drag: explicit merge/split intent transform — see ENG-179
      // for why the prior "reorder + normalizer" path could not produce
      // merge (never demoted head → follower) or split-when-landing-
      // beside-image (never promoted follower → head without a non-image
      // neighbor).
      if (isActiveImage && currentIntent) {
        const intent = currentIntent.intent
        setOptimisticContent((prev) => {
          const source = prev ?? activeContent
          return applyImageDropIntent(
            source as ContentBlock[],
            fromCmsIdx,
            postRemovalToIdx,
            intent,
          ) as ContentBlock[]
        })
        blockMgr.reorderImageWithDropIntent(fromCmsIdx, postRemovalToIdx, intent)
      } else {
        // Non-image drag OR image drag without a captured intent (e.g. a
        // touch-only interaction where dragOver didn't fire): fall back
        // to pure reorder + row-head normalization. `applyImageDropIntent`
        // with intent='split' is a safe no-op on non-image blocks (no
        // rowBreak field exists to touch) and a conservative default for
        // images (preserves existing row-head invariant without demoting
        // the head).
        setOptimisticContent((prev) => {
          const source = prev ?? activeContent
          return applyImageDropIntent(
            source as ContentBlock[],
            fromCmsIdx,
            postRemovalToIdx,
            'split',
          ) as ContentBlock[]
        })
        blockMgr.reorderBlockRange(fromCmsIdx, 1, postRemovalToIdx)
      }
    },
    [blockIdToCmsIndex, blockMgr, activeContent, dropIntent],
  )

  // `activeDragFilterIndex` is a position in the flat, per-block `displayIds`
  // — i.e. an index into `contentBlocks`. Resolve directly to the block for
  // the drag ghost label rather than going through `displayItems` (which is
  // per-display-item, not per-block).
  const activeDragBlock =
    activeDragFilterIndex >= 0 ? contentBlocks[activeDragFilterIndex]?.block : undefined
  const activeDragLabel = useMemo(() => {
    if (!activeDragBlock) return null
    switch (activeDragBlock.blockType) {
      case 'heading': return activeDragBlock.text || 'Heading'
      case 'richText': return 'Text block'
      case 'imageGroup': return `Image group · ${activeDragBlock.images?.length ?? 0} images`
      case 'image': return 'Image'
      case 'divider': return 'Divider'
      case 'videoEmbed': return 'Video embed'
      case 'hero': return 'Hero'
      default: return 'Block'
    }
  }, [activeDragBlock])

  const [isDraggingOver, setIsDraggingOver] = useState(false)
  const [dropInsertIndex, setDropInsertIndex] = useState<number | null>(null)
  const dragCounter = useRef(0)
  const blockListRef = useRef<HTMLDivElement>(null)

  const detectDropIndex = useCallback((clientY: number): number => {
    const blockEls = blockListRef.current?.querySelectorAll('[data-block-index]')
    if (!blockEls || blockEls.length === 0) return 0
    for (let i = 0; i < blockEls.length; i++) {
      const rect = blockEls[i].getBoundingClientRect()
      const mid = rect.top + rect.height / 2
      if (clientY < mid) return i
    }
    return blockEls.length
  }, [])

  const handleContentDragEnter = useCallback((e: React.DragEvent) => {
    if (!isAdmin || !e.dataTransfer.types.includes('Files')) return
    e.preventDefault()
    dragCounter.current++
    if (dragCounter.current === 1) setIsDraggingOver(true)
  }, [isAdmin])

  const handleContentDragOver = useCallback((e: React.DragEvent) => {
    if (!isAdmin || !isDraggingOver) return
    e.preventDefault()
    e.dataTransfer.dropEffect = 'copy'
    setDropInsertIndex(detectDropIndex(e.clientY))
  }, [isAdmin, isDraggingOver, detectDropIndex])

  const handleContentDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    dragCounter.current--
    if (dragCounter.current === 0) {
      setIsDraggingOver(false)
      setDropInsertIndex(null)
    }
  }, [])

  const handleContentDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault()
    dragCounter.current = 0
    setIsDraggingOver(false)
    const displayIdx = dropInsertIndex ?? displayItems.length
    setDropInsertIndex(null)

    // Translate the display-item index to an unfiltered CMS index. For row
    // items the anchor is the first member's cmsIndex; for the tail case
    // (dropping past the last item) we use the last item's cmsIndex + count.
    const getItemStart = (it: RenderItem) =>
      it.kind === 'block' ? it.cmsIndex : it.items[0].cmsIndex
    const getItemCount = (it: RenderItem) => (it.kind === 'block' ? 1 : it.items.length)
    const cmsIdx = displayIdx < displayItems.length
      ? getItemStart(displayItems[displayIdx])
      : (displayItems.length > 0
          ? getItemStart(displayItems[displayItems.length - 1]) + getItemCount(displayItems[displayItems.length - 1])
          : 0)

    const files = Array.from(e.dataTransfer.files).filter((f) => f.type.startsWith('image/') || f.type.startsWith('video/'))
    if (files.length === 0) return

    // Atomic multi-file insert: uploads in parallel, then commits all
    // new `image` blocks in one patch so the row identity (first block
    // rowBreak=true, rest false) is deterministic regardless of upload
    // order. Replaces the legacy imageGroup-then-loop path which both
    // emitted the wrong block type for the atomic model and raced on
    // rowBreak assignment (see useBlockManager.insertAtomicImageBlocks
    // comment for the pressure-test rationale).
    await blockMgr.insertAtomicImageBlocks(cmsIdx, files)
  }, [dropInsertIndex, displayItems, blockMgr])

  // Single-atomic-image figure renderer. Shared between the `case 'image':`
  // branch (standalone block path) and the `kind: 'row'` branch (multi-image
  // row path). Keeping this as a helper avoids duplicating ~70 lines of JSX
  // in two render sites. Caption/alt/media rendering semantics match the
  // legacy `imageGroup` figure — the only difference is that each figure
  // here is its own block in the CMS, so actions anchor to `imgCmsIndex`.
  const renderAtomicImageFigure = useCallback(
    (img: ImageContentBlock, imgCmsIndex: number): React.ReactNode => {
      const hasMedia = Boolean(img.url)
      const altText = img.alt || img.mediaAlt || img.caption || img.placeholderLabel || 'Image'
      const handleReplace = (file: File) => {
        if (!projectTarget || !p.id) return
        void (async () => {
          try {
            const media = await uploadMedia(file, altText)
            const res = await fetch(`/api/${projectTarget.slug}/${p.id}`, { credentials: 'include' })
            if (!res.ok) throw new Error('Failed to fetch project')
            const json = await res.json()
            const blocks = [...(json.content ?? [])] as Record<string, unknown>[]
            const b = { ...blocks[imgCmsIndex] }
            b.image = media.id
            // The `placeholderLabel` field's admin condition hides it
            // once `image` is set, but the stored value survives unless
            // we explicitly clear it. Leaving it behind would render
            // twice (once as the image's own alt-source, once in the
            // dormant Payload field) and create confusion during future
            // replace flows — clear it here so the slot stops being
            // "labeled" the moment it becomes "filled."
            b.placeholderLabel = ''
            blocks[imgCmsIndex] = b
            await updateCollectionField(projectTarget.slug, p.id!, 'content', blocks)
            router.refresh()
          } catch (e) {
            console.error('[atomic-image] replace failed', e)
          }
        })()
      }
      return (
        <FadeIn>
          {hasMedia ? (
            <figure className={styles.sectionFigure}>
              <MediaRenderer
                src={img.url!}
                mimeType={img.mimeType}
                playbackMode={img.playbackMode}
                audioEnabled={img.audioEnabled}
                muted={img.muted}
                posterUrl={img.posterUrl}
                width={img.width}
                height={img.height}
                alt={altText}
                className={styles.sectionImg}
              />
              {isAdmin && img.mediaId && img.mimeType?.startsWith('video/') ? (
                <VideoSettings
                  mediaId={img.mediaId}
                  playbackMode={img.playbackMode}
                  audioEnabled={img.audioEnabled}
                  muted={img.muted}
                  posterUrl={img.posterUrl}
                  className={styles.figPlaybackToggle}
                />
              ) : null}
              {isAdmin && projectTarget ? (
                <EditableText
                  fieldId={`proj:${p.id}:content.${imgCmsIndex}.caption`}
                  target={projectTarget}
                  fieldPath={`content.${imgCmsIndex}.caption`}
                  as="figcaption"
                  className={styles.figCaption}
                  label="Image caption"
                >
                  {img.caption || ''}
                </EditableText>
              ) : img.caption ? (
                <figcaption className={styles.figCaption}>{img.caption}</figcaption>
              ) : null}
              {isAdmin && (
                <ImageBlockAdminOverlay
                  busy={blockMgr.busy}
                  onReplace={handleReplace}
                  onDelete={() => blockMgr.confirmDeleteBlock(imgCmsIndex, 'image')}
                />
              )}
            </figure>
          ) : isAdmin && projectTarget ? (
            // Empty atomic image slot. The Dropzone itself is the fill
            // affordance (click = file picker, drag = upload). The
            // overlaid trash button is the remove affordance — without
            // it, empty slots inside a multi-image row had zero delete
            // path because the outer `BlockToolbar` is suppressed for
            // `isMultiImageRow` and the per-member wrapper is
            // drag-only (ENG-180 / FB-160).
            <div className={styles.emptySlotWrapper}>
              <Dropzone
                accept="image/*,video/*"
                multiple={false}
                disabled={blockMgr.busy}
                onFiles={(files) => {
                  const file = files[0]
                  if (file) handleReplace(file)
                }}
              >
                {img.placeholderLabel ? (
                  <div className={styles.atomicSlotLabel}>
                    <span className={styles.placeholderLabel}>{img.placeholderLabel}</span>
                    <span className={styles.placeholderHint}>
                      Drop an image here or click to upload
                    </span>
                  </div>
                ) : undefined}
              </Dropzone>
              <div className={styles.emptySlotActions}>
                <Tooltip content="Delete slot" size="sm">
                  <Button
                    type="button"
                    appearance="negative"
                    emphasis="bold"
                    size="xs"
                    iconOnly
                    onColor
                    leadingIcon={
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                        <path
                          d="M2.5 3.5h7M4.5 3.5V2.5a1 1 0 011-1h1a1 1 0 011 1v1M3.5 3.5v6a1 1 0 001 1h3a1 1 0 001-1v-6"
                          stroke="currentColor"
                          strokeWidth="1.4"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    }
                    onClick={(e) => {
                      e.stopPropagation()
                      void blockMgr.confirmDeleteBlock(imgCmsIndex, 'image')
                    }}
                    disabled={blockMgr.busy}
                    aria-label="Delete slot"
                  />
                </Tooltip>
              </div>
            </div>
          ) : (
            <div className={styles.imagePlaceholder} />
          )}
        </FadeIn>
      )
    },
    [projectTarget, p.id, isAdmin, blockMgr, router],
  )

  const editUrl = p.id ? `/admin/collections/projects/${p.id}` : '/admin/collections/projects';

  const page = (
    <article className={styles.page}>
      <div className={siteShellStyles.contentWrapperNeutralMinimal}>
      {isAdmin && <AdminBar editUrl={editUrl} editLabel={`Edit "${p.title}"`} />}
      <ScrollSpy sections={spySections} />

      {/* ── FULL-WIDTH HERO SPLASH ── */}
      <FadeIn>
        <section className={styles.heroSection}>
          <div className={styles.heroInner}>
            {heroBlock?.imageUrl ? (
              <>
                <MediaRenderer
                  src={heroBlock.imageUrl}
                  mimeType={heroBlock.mimeType}
                  playbackMode={heroBlock.playbackMode}
                  audioEnabled={heroBlock.audioEnabled}
                  muted={heroBlock.muted}
                  posterUrl={heroBlock.posterUrl}
                  alt={`${p.title} — case study cover`}
                  className={styles.heroImg}
                  priority
                  sizes="100vw"
                />
                {isAdmin && p.id && (
                  <>
                    <div
                      className={styles.heroReplaceOverlay}
                      onClick={() => heroFileRef.current?.click()}
                      onDrop={(e) => {
                        e.preventDefault();
                        const file = e.dataTransfer.files[0];
                        if (file) replaceHeroImage(file);
                      }}
                      onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'copy'; }}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') heroFileRef.current?.click(); }}
                      aria-label="Replace hero image"
                    >
                      <span className={styles.heroReplaceLabel}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                          <path d="M12 16V4M12 4L8 8M12 4L16 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                          <path d="M20 16v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        {heroUploading ? 'Uploading…' : 'Replace image'}
                      </span>
                    </div>
                    <input
                      ref={heroFileRef}
                      type="file"
                      accept="image/*,video/*"
                      onChange={handleHeroFileChange}
                      tabIndex={-1}
                      hidden
                    />
                    {heroBlock.mediaId && heroBlock.mimeType?.startsWith('video/') ? (
                      <div className={styles.heroPlaybackToggleWrap}>
                        <VideoSettings
                          mediaId={heroBlock.mediaId}
                          playbackMode={heroBlock.playbackMode}
                          audioEnabled={heroBlock.audioEnabled}
                          muted={heroBlock.muted}
                          posterUrl={heroBlock.posterUrl}
                        />
                      </div>
                    ) : null}
                  </>
                )}
              </>
            ) : isAdmin && p.id ? (
              <ImageUploadZone
                collection="projects"
                docId={p.id}
                fieldPath="heroImage"
                label="Drop hero image or click to upload"
                className={styles.heroUploadZone}
              />
            ) : (
              isAdmin && (
                <span className={styles.heroImageLabel}>
                  {heroBlock?.placeholderLabel ?? 'Hero — Case study cover image'}
                </span>
              )
            )}
          </div>
        </section>
      </FadeIn>

      <div className={isEssay ? styles.layoutEssay : styles.layout}>
        {/* ── LEFT SIDEBAR (case-study only) ── */}
        {!isEssay && (
        <aside className={styles.sidebar}>
          <div className={styles.sidebarInner}>
            <FadeIn delay={0.05}>
              <div className={styles.sidebarCard}>
                <div className={styles.projectIdentity}>
                  {projectTarget ? (
                    <EditableText
                      fieldId={`proj:${p.id}:title`}
                      target={projectTarget}
                      fieldPath="title"
                      as="h2"
                      className={styles.title}
                      label="App Name"
                    >
                      {p.title}
                    </EditableText>
                  ) : (
                    <h2 className={styles.title}>{p.title}</h2>
                  )}
                  {projectTarget ? (
                    <EditableText
                      fieldId={`proj:${p.id}:category`}
                      target={projectTarget}
                      fieldPath="category"
                      as="span"
                      className={styles.category}
                      label="Category"
                    >
                      {p.category}
                    </EditableText>
                  ) : (
                    <span className={styles.category}>{p.category}</span>
                  )}
                </div>

                {p.heroMetric && (
                  <div className={styles.heroMetric}>
                    <span className={styles.heroMetricValue}>{p.heroMetric.value}</span>
                    <div className={styles.heroMetricLabelRow}>
                      <span className={styles.heroMetricLabel}>{p.heroMetric.label}</span>
                      {p.heroMetric.tooltip && (
                        <InfoTooltip
                          content={p.heroMetric.tooltip}
                          contextSize="sm"
                        />
                      )}
                    </div>
                  </div>
                )}

                <div className={styles.meta}>
                  <div className={styles.metaGroup}>
                    <Eyebrow className={styles.metaLabel}>Role</Eyebrow>
                    {projectTarget ? (
                      <EditableText
                        fieldId={`proj:${p.id}:role`}
                        target={projectTarget}
                        fieldPath="role"
                        as="span"
                        className={styles.metaValue}
                        label="Role"
                      >
                        {p.role}
                      </EditableText>
                    ) : (
                      <span className={styles.metaValue}>{p.role}</span>
                    )}
                  </div>
                  <div className={styles.metaGroup}>
                    <Eyebrow className={styles.metaLabel}>Collaborators</Eyebrow>
                    {projectTarget ? (
                      <EditableArray<Collaborator>
                        fieldId={`proj:${p.id}:collaborators`}
                        target={projectTarget}
                        fieldPath="collaborators"
                        items={p.collaborators}
                        itemFields={COLLABORATOR_FIELDS}
                        label="Collaborators"
                        className={styles.collaboratorList}
                        renderItem={(c, i) => (
                          <span key={i} className={styles.metaValue}>{c.name}</span>
                        )}
                      />
                    ) : (
                      <div className={styles.collaboratorList}>
                        {p.collaborators.map((c, i) => (
                          <span key={i} className={styles.metaValue}>{c.name}</span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className={styles.metaGroup}>
                    <Eyebrow className={styles.metaLabel}>Duration</Eyebrow>
                    {projectTarget ? (
                      <EditableText
                        fieldId={`proj:${p.id}:duration`}
                        target={projectTarget}
                        fieldPath="duration"
                        as="span"
                        className={styles.metaValue}
                        label="Duration"
                      >
                        {p.duration}
                      </EditableText>
                    ) : (
                      <span className={styles.metaValue}>{p.duration}</span>
                    )}
                  </div>
                  <div className={styles.metaGroup}>
                    <Eyebrow className={styles.metaLabel}>Tools</Eyebrow>
                    {projectTarget ? (
                      <EditableArray<Tool>
                        fieldId={`proj:${p.id}:tools`}
                        target={projectTarget}
                        fieldPath="tools"
                        items={p.tools}
                        itemFields={TOOL_FIELDS}
                        label="Tools"
                        className={styles.toolTags}
                        renderItem={(t, i) => (
                          <Badge key={i} appearance="neutral" emphasis="regular" size="sm" shape="squared">{t.name}</Badge>
                        )}
                      />
                    ) : (
                      <div className={styles.toolTags}>
                        {p.tools.map((t, i) => (
                          <Badge key={i} appearance="neutral" emphasis="regular" size="sm" shape="squared">{t.name}</Badge>
                        ))}
                      </div>
                    )}
                  </div>
                  {(isAdmin || p.externalLinks.length > 0) && (
                  <div className={styles.metaGroup}>
                    <Eyebrow className={styles.metaLabel}>Links</Eyebrow>
                    {projectTarget ? (
                      <EditableArray<ExternalLink>
                        fieldId={`proj:${p.id}:externalLinks`}
                        target={projectTarget}
                        fieldPath="externalLinks"
                        items={p.externalLinks}
                        itemFields={EXT_LINK_FIELDS}
                        label="Links"
                        className={styles.metaLinks}
                        renderItem={(link, i) => (
                          <a key={i} href={link.href} target="_blank" rel="noopener noreferrer" className={styles.metaLink}
                            onClick={() => track("External Link Clicked", {
                              destination_url: link.href,
                              link_label: link.label,
                              context: "case_study_sidebar",
                            })}
                          >
                            {link.label}<span className={styles.arrow}>&#8599;</span>
                          </a>
                        )}
                      />
                    ) : (
                      <div className={styles.metaLinks}>
                        {p.externalLinks.map((link, i) => (
                          <a key={i} href={link.href} target="_blank" rel="noopener noreferrer" className={styles.metaLink}
                            onClick={() => track("External Link Clicked", {
                              destination_url: link.href,
                              link_label: link.label,
                              context: "case_study_sidebar",
                            })}
                          >
                            {link.label}<span className={styles.arrow}>&#8599;</span>
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                  )}
                </div>
              </div>
            </FadeIn>
          </div>
        </aside>
        )}

        {/* ── RIGHT CONTENT ── */}
        <main className={isEssay ? styles.contentEssay : styles.content}>
          {isEssay && (
            <FadeIn>
              <EssayHeader
                category={p.category}
                publishedAt={p.publishedAt}
                readTime={p.readTime ?? 1}
                mediumUrl={p.mediumUrl}
                headline={
                  p.introBlurbHeadline ? (
                    projectTarget ? (
                      <EditableText
                        fieldId={`proj:${p.id}:introBlurbHeadline`}
                        target={projectTarget}
                        fieldPath="introBlurbHeadline"
                        as="h1"
                        className={styles.introBlurbHeadline}
                        label="Essay Title"
                        singleClickEdit
                      >
                        {p.introBlurbHeadline}
                      </EditableText>
                    ) : (
                      <h1 className={styles.introBlurbHeadline}>{p.introBlurbHeadline}</h1>
                    )
                  ) : null
                }
              />
            </FadeIn>
          )}

          {p.introBlurbHeadline && (
            <FadeIn>
              <div id="intro" className={styles.introBlurb}>
                {!isEssay && (
                  projectTarget ? (
                    <EditableText
                      fieldId={`proj:${p.id}:introBlurbHeadline`}
                      target={projectTarget}
                      fieldPath="introBlurbHeadline"
                      as="h1"
                      className={styles.introBlurbHeadline}
                      label="Case Study Title"
                      singleClickEdit
                    >
                      {p.introBlurbHeadline}
                    </EditableText>
                  ) : (
                    <h1 className={styles.introBlurbHeadline}>{p.introBlurbHeadline}</h1>
                  )
                )}
                {p.introBlurbBody && (
                  projectTarget ? (
                    <EditableText
                      fieldId={`proj:${p.id}:introBlurbBody`}
                      target={projectTarget}
                      fieldPath="introBlurbBody"
                      as="div"
                      className={styles.introBlurbBody}
                      multiline
                      isRichText
                      htmlContent={p.introBlurbBodyHtml}
                      label="Intro Blurb Body"
                    >
                      {p.introBlurbBody}
                    </EditableText>
                  ) : p.introBlurbBodyHtml ? (
                    <div className={styles.introBlurbBody} dangerouslySetInnerHTML={{ __html: p.introBlurbBodyHtml }} />
                  ) : (
                    <p className={styles.introBlurbBody}>{p.introBlurbBody}</p>
                  )
                )}
              </div>
            </FadeIn>
          )}

          {p.introBlurbHeadline && !isEssay && (
            <hr className={styles.articleSeparator} />
          )}

          {companyNote && (
            <FadeIn>
              <aside className={styles.companyCallout}>
                <Eyebrow className={styles.companyCalloutLabel}>
                  Why this matters to {companyNote.companyName}
                </Eyebrow>
                <p className={styles.companyCalloutText}>
                  {companyNote.note}
                </p>
              </aside>
            </FadeIn>
          )}

          {/* Block operations announce via Radix Toast (InlineToastProvider). */}

          {/* ── BLOCK RENDERER ── */}
          <DndContext
            id="project-blocks"
            sensors={dndSensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
            onDragCancel={handleDragCancel}
          >
          <SortableContext items={displayIds} strategy={rectSortingStrategy}>
          <div
            ref={blockListRef}
            className={[styles.blockList, isDraggingOver && styles.blockListDragOver].filter(Boolean).join(' ')}
            role="list"
            onDragEnter={handleContentDragEnter}
            onDragOver={handleContentDragOver}
            onDragLeave={handleContentDragLeave}
            onDrop={handleContentDrop}
          >
            {displayItems.map((item, blockIndex) => {
              // For a row, the "anchor" block (used for the toolbar, keyboard
              // nav, drop-indicator anchoring, and BetweenBlockInsert targets)
              // is the first row member. Per-member figure rendering happens
              // inside the `isRow` branch of `blockContent` below.
              const isRow = item.kind === 'row'
              const block: ContentBlock = isRow ? item.items[0].block : item.block
              const cmsIndex: number = isRow ? item.items[0].cmsIndex : item.cmsIndex
              const isMultiImageRow = isRow && item.items.length > 1
              const blockContent = isRow
                ? (() => {
                    const flexValues = resolveRowFlex(item.items.map(({ block: b }) => b.widthFraction))
                    return (
                      <div className={styles.imageRow}>
                        {item.items.map(({ block: memberBlock, cmsIndex: memberCmsIndex }, memberIdx) => {
                          const memberFigure = renderAtomicImageFigure(memberBlock, memberCmsIndex)
                          // ENG-176: inside multi-image rows, each image is
                          // its own sortable so users can reorder within a
                          // row or drag an image out to split the row.
                          // Single-image rows keep the outer SortableBlock
                          // (wrapping the whole display-item) so there's no
                          // redundant sortable nesting.
                          let wrapped: React.ReactNode = memberFigure
                          if (isAdmin && isMultiImageRow) {
                            const memberId = memberBlock.id || `block-${memberCmsIndex}`
                            const memberSortableIdx = displayIds.indexOf(memberId)
                            let memberDropPos: DropEdge = null
                            if (
                              activeDragId &&
                              overDragFilterIndex !== -1 &&
                              overDragFilterIndex === memberSortableIdx &&
                              activeDragFilterIndex !== memberSortableIdx
                            ) {
                              // Dropdown edge for per-member target is driven by
                              // pointer-derived intent (ENG-179). Merge →
                              // vertical line at left/right of the hovered
                              // member; split → horizontal line above/below.
                              memberDropPos = dropIntent
                                ? dropIntent.intent === 'merge'
                                  ? dropIntent.side === 'right' ? 'right' : 'left'
                                  : dropIntent.side === 'bottom' ? 'after' : 'before'
                                : activeDragFilterIndex > overDragFilterIndex ? 'before' : 'after'
                            }
                            wrapped = (
                              <SortableBlock id={memberId} isAdmin dropPosition={memberDropPos}>
                                {memberFigure}
                              </SortableBlock>
                            )
                          }
                          return (
                            <div
                              key={memberBlock.id || `${memberCmsIndex}`}
                              className={styles.imageRowItem}
                              style={{ flex: flexValues[memberIdx] }}
                            >
                              {wrapped}
                            </div>
                          )
                        })}
                      </div>
                    )
                  })()
                : (() => {
                switch (block.blockType) {
                  case 'heading': {
                    const visualConfig = interactiveVisuals?.[block.text];
                    const Tag = block.level === 'h3' ? 'h3' : 'h2';
                    return (
                      <>
                        <FadeIn>
                          {projectTarget ? (
                            <EditableText
                              fieldId={`proj:${p.id}:content.${cmsIndex}.text`}
                              target={projectTarget}
                              fieldPath={`content.${cmsIndex}.text`}
                              as={Tag}
                              className={styles.sectionHeading}
                              label="Heading"
                              singleClickEdit
                            >
                              {block.text}
                            </EditableText>
                          ) : (
                            <Tag className={styles.sectionHeading}>{block.text}</Tag>
                          )}
                        </FadeIn>
                        {visualConfig && (
                          <FadeIn>
                            <InteractiveVisual config={visualConfig} />
                          </FadeIn>
                        )}
                      </>
                    );
                  }

                  case 'richText':
                    return (
                      <FadeIn>
                        {isAdmin && projectTarget && block.bodyLexical ? (
                          <LexicalBlockEditor
                            initialState={block.bodyLexical as unknown as import('lexical').SerializedEditorState}
                            target={projectTarget}
                            fieldPath={`content.${cmsIndex}.body`}
                            className={styles.sectionBody}
                            blockIndex={blockIndex}
                            nav={blockNav}
                          />
                        ) : block.bodyHtml ? (
                          <div className={styles.sectionBody} dangerouslySetInnerHTML={{ __html: block.bodyHtml }} />
                        ) : (
                          <p className={styles.sectionBody}>{block.body}</p>
                        )}
                      </FadeIn>
                    );

                  case 'imageGroup': {
                    const handleFileDrop = (e: React.DragEvent) => {
                      e.preventDefault()
                      const files = Array.from(e.dataTransfer.files)
                      ;(async () => {
                        for (const file of files) {
                          await blockMgr.addImageToBlock(cmsIndex, file)
                        }
                      })()
                    }
                    const handleFileSelect = () => {
                      const input = document.createElement('input')
                      input.type = 'file'
                      input.accept = 'image/*,video/*'
                      input.multiple = true
                      input.onchange = () => {
                        const files = Array.from(input.files ?? [])
                        ;(async () => {
                          for (const file of files) {
                            await blockMgr.addImageToBlock(cmsIndex, file)
                          }
                        })()
                      }
                      input.click()
                    }
                    return (
                      <FadeIn>
                        {block.placeholderLabels && block.placeholderLabels.length > 0 ? (
                          <div
                            className={styles.placeholderGrid}
                            onDragOver={isAdmin ? (e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'copy' } : undefined}
                            onDrop={isAdmin ? handleFileDrop : undefined}
                          >
                            {block.placeholderLabels.map((lbl, idx) => {
                              const img = block.images[idx];
                              if (img) {
                                return (
                                  <figure
                                    key={idx}
                                    className={[
                                      styles.sectionFigure,
                                      idx === 0 && block.placeholderLabels!.length >= 3 ? styles.slotWide : '',
                                    ].filter(Boolean).join(' ')}
                                  >
                                    <MediaRenderer src={img.url} mimeType={img.mimeType} playbackMode={img.playbackMode} audioEnabled={img.audioEnabled} muted={img.muted} posterUrl={img.posterUrl} width={img.width} height={img.height} alt={img.alt || lbl} className={styles.sectionImg} sizes={getImageSizes(block.layout, block.placeholderLabels!.length)} />
                                    {isAdmin && img.mediaId && img.mimeType?.startsWith('video/') ? (
                                      <VideoSettings
                                        mediaId={img.mediaId}
                                        playbackMode={img.playbackMode}
                                        audioEnabled={img.audioEnabled}
                                        muted={img.muted}
                                        posterUrl={img.posterUrl}
                                        className={styles.figPlaybackToggle}
                                      />
                                    ) : null}
                                    {isAdmin && projectTarget ? (
                                      <EditableText
                                        fieldId={`proj:${p.id}:content.${cmsIndex}.images.${idx}.caption`}
                                        target={projectTarget}
                                        fieldPath={`content.${cmsIndex}.images.${idx}.caption`}
                                        as="figcaption"
                                        className={styles.figCaption}
                                        label={`${lbl} caption`}
                                      >
                                        {img.caption || ''}
                                      </EditableText>
                                    ) : img.caption ? (
                                      <figcaption className={styles.figCaption}>{img.caption}</figcaption>
                                    ) : null}
                                    {isAdmin && (
                                      <ImageBlockAdminOverlay
                                        canMoveLeft={idx > 0}
                                        canMoveRight={idx < block.images.length - 1}
                                        busy={blockMgr.busy}
                                        onMoveLeft={() => blockMgr.moveImageInBlock(cmsIndex, idx, -1)}
                                        onMoveRight={() => blockMgr.moveImageInBlock(cmsIndex, idx, 1)}
                                        onReplace={(file) => blockMgr.replaceImageInBlock(cmsIndex, idx, file)}
                                        onDelete={() =>
                                          blockMgr.confirmRemoveImage(cmsIndex, idx, {
                                            filename: img.alt,
                                            thumbnailUrl: img.url,
                                            alt: img.alt,
                                          })
                                        }
                                      />
                                    )}
                                  </figure>
                                );
                              }
                              return (
                                <div
                                  key={idx}
                                  className={idx === 0 && block.placeholderLabels!.length >= 3
                                    ? styles.labeledPlaceholderWide : styles.labeledPlaceholder}
                                  onClick={isAdmin ? handleFileSelect : undefined}
                                  role={isAdmin ? 'button' : undefined}
                                  tabIndex={isAdmin ? 0 : undefined}
                                >
                                  {isAdmin && (
                                    <button
                                      type="button"
                                      className={styles.placeholderRemove}
                                      aria-label={`Remove slot "${lbl}"`}
                                      disabled={blockMgr.busy}
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        void blockMgr.removePlaceholderSlot(cmsIndex, idx)
                                      }}
                                      onKeyDown={(e) => e.stopPropagation()}
                                    >
                                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                                        <path d="M3 3l6 6M9 3l-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                                      </svg>
                                    </button>
                                  )}
                                  <span className={styles.placeholderLabel}>{lbl}</span>
                                  <span className={styles.placeholderIndex}>
                                    Image {idx + 1} of {block.placeholderLabels!.length}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        ) : block.images.length > 0 ? (
                          <>
                            <div
                              className={getLayoutClass(block.layout, block.images.length)}
                              onDragOver={isAdmin ? (e) => { e.preventDefault(); e.stopPropagation(); e.dataTransfer.dropEffect = 'copy' } : undefined}
                              onDrop={isAdmin ? (e) => { e.stopPropagation(); handleFileDrop(e) } : undefined}
                            >
                              {block.images.map((img, idx) => (
                                <figure key={idx} className={styles.sectionFigure}>
                                  <MediaRenderer src={img.url} mimeType={img.mimeType} playbackMode={img.playbackMode} audioEnabled={img.audioEnabled} muted={img.muted} posterUrl={img.posterUrl} width={img.width} height={img.height} alt={img.alt || `Image ${idx + 1}`} className={styles.sectionImg} sizes={getImageSizes(block.layout, block.images.length)} />
                                  {isAdmin && img.mediaId && img.mimeType?.startsWith('video/') ? (
                                    <VideoSettings
                                      mediaId={img.mediaId}
                                      playbackMode={img.playbackMode}
                                      audioEnabled={img.audioEnabled}
                                      muted={img.muted}
                                      posterUrl={img.posterUrl}
                                      className={styles.figPlaybackToggle}
                                    />
                                  ) : null}
                                  {isAdmin && projectTarget ? (
                                    <EditableText
                                      fieldId={`proj:${p.id}:content.${cmsIndex}.images.${idx}.caption`}
                                      target={projectTarget}
                                      fieldPath={`content.${cmsIndex}.images.${idx}.caption`}
                                      as="figcaption"
                                      className={styles.figCaption}
                                      label={`Image ${idx + 1} caption`}
                                    >
                                      {img.caption || ''}
                                    </EditableText>
                                  ) : img.caption ? (
                                    <figcaption className={styles.figCaption}>{img.caption}</figcaption>
                                  ) : null}
                                  {isAdmin && (
                                    <ImageBlockAdminOverlay
                                      canMoveLeft={idx > 0}
                                      canMoveRight={idx < block.images.length - 1}
                                      busy={blockMgr.busy}
                                      onMoveLeft={() => blockMgr.moveImageInBlock(cmsIndex, idx, -1)}
                                      onMoveRight={() => blockMgr.moveImageInBlock(cmsIndex, idx, 1)}
                                      onReplace={(file) => blockMgr.replaceImageInBlock(cmsIndex, idx, file)}
                                      onDelete={() =>
                                        blockMgr.confirmRemoveImage(cmsIndex, idx, {
                                          filename: img.alt,
                                          thumbnailUrl: img.url,
                                          alt: img.alt,
                                        })
                                      }
                                    />
                                  )}
                                </figure>
                              ))}
                            </div>
                            {isAdmin && (
                              <div className={styles.addImageRow}>
                                <Button
                                  type="button"
                                  appearance="neutral"
                                  emphasis="subtle"
                                  size="sm"
                                  onClick={handleFileSelect}
                                  disabled={blockMgr.busy}
                                  leadingIcon={
                                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                                      <path d="M7 2v10M2 7h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                                    </svg>
                                  }
                                >
                                  Add image
                                </Button>
                              </div>
                            )}
                          </>
                        ) : isAdmin ? (
                          <Dropzone
                            accept="image/*,video/*"
                            multiple
                            disabled={blockMgr.busy}
                            onFiles={(files) => {
                              ;(async () => {
                                for (const file of files) {
                                  await blockMgr.addImageToBlock(cmsIndex, file)
                                }
                              })()
                            }}
                          />
                        ) : (
                          <div className={styles.imagePlaceholder} />
                        )}
                        {block.caption && projectTarget ? (
                          <EditableText
                            fieldId={`proj:${p.id}:content.${cmsIndex}.caption`}
                            target={projectTarget}
                            fieldPath={`content.${cmsIndex}.caption`}
                            as="p"
                            className={styles.imageCaption}
                            label="Group caption"
                          >
                            {block.caption}
                          </EditableText>
                        ) : block.caption ? (
                          <p className={styles.imageCaption}>{block.caption}</p>
                        ) : null}
                      </FadeIn>
                    );
                  }

                  case 'image':
                    return renderAtomicImageFigure(block as ImageContentBlock, cmsIndex)

                  case 'divider':
                    return <hr className={styles.divider} />;

                  case 'videoEmbed': {
                    const hasParsed = !!block.embedUrl && !!block.provider && !!block.autoplayUrl;
                    return (
                      <FadeIn>
                        {hasParsed ? (
                          <figure className={styles.sectionFigure}>
                            <VideoEmbed
                              provider={block.provider!}
                              embedUrl={block.embedUrl!}
                              autoplayUrl={block.autoplayUrl!}
                              posterUrl={block.posterUrl}
                              autoThumbnailUrl={block.autoThumbnailUrl}
                              isVertical={block.isVertical}
                              caption={block.caption}
                            />
                            {isAdmin && projectTarget ? (
                              <EditableText
                                fieldId={`proj:${p.id}:content.${cmsIndex}.caption`}
                                target={projectTarget}
                                fieldPath={`content.${cmsIndex}.caption`}
                                as="figcaption"
                                className={styles.figCaption}
                                label="Video embed caption"
                              >
                                {block.caption || ''}
                              </EditableText>
                            ) : block.caption ? (
                              <figcaption className={styles.figCaption}>{block.caption}</figcaption>
                            ) : null}
                            {isAdmin && projectTarget && p.id ? (
                              <VideoEmbedInput
                                projectId={p.id}
                                blockIndex={cmsIndex}
                                currentUrl={block.url}
                              />
                            ) : null}
                          </figure>
                        ) : isAdmin && projectTarget && p.id ? (
                          <div className={styles.videoEmbedPlaceholder}>
                            {projectTarget ? (
                              <EditableText
                                fieldId={`proj:${p.id}:content.${cmsIndex}.placeholderLabel`}
                                target={projectTarget}
                                fieldPath={`content.${cmsIndex}.placeholderLabel`}
                                as="span"
                                className={styles.placeholderLabel}
                                label="Video embed label"
                              >
                                {block.placeholderLabel || 'Video embed'}
                              </EditableText>
                            ) : (
                              <span className={styles.placeholderLabel}>
                                {block.placeholderLabel || 'Video embed'}
                              </span>
                            )}
                            <VideoEmbedInput
                              projectId={p.id}
                              blockIndex={cmsIndex}
                              currentUrl={block.url}
                            />
                          </div>
                        ) : null}
                      </FadeIn>
                    );
                  }

                  default:
                    return null;
                }
              })();

              const headingId = block.blockType === 'heading' ? slugify((block as ContentBlock & { blockType: 'heading' }).text) : undefined;

              // For single-sortable display items, the sortable id is the
              // block's own id. For multi-image rows there's no outer
                // SortableBlock — each member has its own id (resolved inside
              // blockContent above), so this id is used only as a React key.
              const sortableId = isRow
                ? (item.items[0].block.id || `block-${item.items[0].cmsIndex}`)
                : (block.id || `block-${cmsIndex}`)
              const blockInner = (
                <>
                  {isDraggingOver && dropInsertIndex === blockIndex && (
                    <div className={styles.dropIndicator} aria-hidden />
                  )}
                  {isAdmin && blockIndex === 0 && !isDraggingOver && (
                    <BetweenBlockInsert
                      onInsert={(type: BlockType) => blockMgr.addBlock(type, cmsIndex)}
                      busy={blockMgr.busy}
                    />
                  )}
                  <div
                    id={headingId}
                    className={isAdmin ? styles.blockWrapper : styles.blockItem}
                    role="listitem"
                    tabIndex={isAdmin ? 0 : undefined}
                    data-block-index={blockIndex}
                    // The BlockToolbar lives inside this wrapper and is
                    // revealed via `[data-block-admin]:hover > &` in
                    // `inline-edit.module.scss`. We use a data-attribute
                    // rather than a CSS-module class because the wrapper
                    // class itself comes from `page.module.scss` — an
                    // inline-edit-module `.blockWrapper:hover` selector
                    // never matches in the compiled CSS. See ENG-190 /
                    // EAP-115.
                    {...(isAdmin ? { 'data-block-admin': '' } : {})}
                    onKeyDown={isAdmin ? (e) => {
                      if (e.target !== e.currentTarget) return
                      if (e.altKey && e.key === 'ArrowUp') { e.preventDefault(); blockMgr.moveBlock(cmsIndex, -1); return }
                      if (e.altKey && e.key === 'ArrowDown') { e.preventDefault(); blockMgr.moveBlock(cmsIndex, 1); return }
                      if ((e.metaKey || e.ctrlKey) && e.key === 'Backspace') {
                        e.preventDefault();
                        blockMgr.confirmDeleteBlock(cmsIndex, block.blockType);
                      }
                    } : undefined}
                  >
                    {isAdmin && projectTarget && !isMultiImageRow && (
                      <BlockToolbar
                        index={blockIndex}
                        total={displayItems.length}
                        blockType={block.blockType}
                        onMoveUp={() => blockMgr.moveBlock(cmsIndex, -1)}
                        onMoveDown={() => blockMgr.moveBlock(cmsIndex, 1)}
                        onDelete={() => blockMgr.confirmDeleteBlock(cmsIndex, block.blockType)}
                        onInsertAbove={(type: BlockType) => blockMgr.addBlock(type, cmsIndex)}
                        onLevelChange={
                          block.blockType === 'heading'
                            ? (level) => blockMgr.patchBlockField(cmsIndex, 'level', level)
                            : undefined
                        }
                        currentLevel={block.blockType === 'heading' ? (block as ContentBlock & { blockType: 'heading' }).level : undefined}
                        busy={blockMgr.busy}
                      />
                    )}
                    {blockContent}
                  </div>
                  {isAdmin && !isDraggingOver && (
                    <BetweenBlockInsert
                      onInsert={(type: BlockType) => {
                        // After-block insert: for a row, insert after the LAST
                        // row member in CMS order so new blocks land below the
                        // entire row, not between members.
                        const tailCmsIndex = isRow
                          ? item.items[item.items.length - 1].cmsIndex + 1
                          : cmsIndex + 1
                        blockMgr.addBlock(type, tailCmsIndex)
                      }}
                      busy={blockMgr.busy}
                    />
                  )}
                  {isDraggingOver && dropInsertIndex === blockIndex + 1 && (
                    <div className={styles.dropIndicator} aria-hidden />
                  )}
                </>
              )

              if (isAdmin) {
                // Multi-image rows delegate sortability to per-member
                // SortableBlocks rendered inside `blockContent`, so the
                // outer wrapper is a plain div. Single-image rows and
                // non-image blocks still use a single outer SortableBlock.
                if (isMultiImageRow) {
                  return <div key={sortableId} className={styles.blockItem}>{blockInner}</div>
                }
                // Drop indicator: when dragging, mark the target block with a
                // visible line on the side the source will land on. Reasoning:
                // verticalListSortingStrategy already slides items to make
                // room, but the animation is subtle enough that users read it
                // as "nothing happened." An explicit accent line removes the
                // ambiguity. FB-105/AP-035 established that DnD in this
                // codebase needs a primary affordance stronger than motion.
                const singleSortableIdx = displayIds.indexOf(sortableId)
                let dropPosition: DropEdge = null
                if (
                  activeDragId &&
                  overDragFilterIndex !== -1 &&
                  overDragFilterIndex === singleSortableIdx &&
                  activeDragFilterIndex !== singleSortableIdx
                ) {
                  // Merge intent → vertical line on the side the pointer
                  // is aimed at (left / right); split intent → horizontal
                  // line above / below. Falls back to index-direction
                  // when intent isn't resolved yet (initial frames of a
                  // drag before dragOver fires). See ENG-179.
                  dropPosition = dropIntent
                    ? dropIntent.intent === 'merge'
                      ? dropIntent.side === 'right' ? 'right' : 'left'
                      : dropIntent.side === 'bottom' ? 'after' : 'before'
                    : activeDragFilterIndex > overDragFilterIndex ? 'before' : 'after'
                }
                return (
                  <SortableBlock key={sortableId} id={sortableId} isAdmin dropPosition={dropPosition}>
                    {blockInner}
                  </SortableBlock>
                )
              }

              return <div key={sortableId} className={styles.blockItem}>{blockInner}</div>;
            })}
          </div>
          </SortableContext>
          {isAdmin && (
            <DragOverlay dropAnimation={null}>
              {activeDragLabel ? (
                <div className={styles.dragGhost}>
                  <span className={styles.dragGhostHandle} aria-hidden>
                    <DragHandleIcon />
                  </span>
                  <span className={styles.dragGhostLabel}>{activeDragLabel}</span>
                </div>
              ) : null}
            </DragOverlay>
          )}
          </DndContext>

          {isAdmin && projectTarget && contentBlocks.length === 0 && (
            <div className={styles.addFirstBlockRow}>
              <BlockInsertMenu onInsert={(type: BlockType) => blockMgr.addBlock(type)} disabled={blockMgr.busy}>
                <Button
                  type="button"
                  appearance="neutral"
                  emphasis="subtle"
                  size="sm"
                  disabled={blockMgr.busy}
                  leadingIcon={
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                      <path d="M7 2v10M2 7h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                  }
                >
                  Add first block
                </Button>
              </BlockInsertMenu>
            </div>
          )}

          {/* Errors surface via toast (Phase 3 — InlineToastProvider). */}

          {/* ── PREV / NEXT NAVIGATION ── */}
          {(prevProject || nextProject) && (
            <nav className={styles.projectNav} aria-label="Case study navigation">
              <div className={styles.projectNavInner}>
                {prevProject ? (
                  <Button
                    href={`/work/${prevProject.slug}`}
                    appearance="neutral"
                    emphasis="minimal"
                    size="sm"
                    onColor
                    leadingIcon={<ArrowLeft />}
                    className={styles.projectNavLink}
                  >
                    <div className={styles.projectNavText}>
                      <Eyebrow className={styles.projectNavLabel}>Previous</Eyebrow>
                      <span className={styles.projectNavTitle}>{prevProject.title}</span>
                    </div>
                  </Button>
                ) : (
                  <div />
                )}
                {nextProject ? (
                  <Button
                    href={`/work/${nextProject.slug}`}
                    appearance="neutral"
                    emphasis="minimal"
                    size="sm"
                    onColor
                    trailingIcon={<ArrowRight />}
                    className={`${styles.projectNavLink} ${styles.projectNavLinkNext}`}
                  >
                    <div className={styles.projectNavText}>
                      <Eyebrow className={styles.projectNavLabel}>Next</Eyebrow>
                      <span className={styles.projectNavTitle}>{nextProject.title}</span>
                    </div>
                  </Button>
                ) : (
                  <div />
                )}
              </div>
            </nav>
          )}
        </main>
      </div>
      </div>

      {isAdmin && <InlineEditBar />}
    </article>
  );

  return page;
}

// Top-level wrapper mounts `InlineEditProvider` BEFORE the body renders, so
// `useBlockManager()` inside the body sees the real `ConfirmProvider` and
// `InlineToastProvider` contexts. Without this split, `useConfirm()` silently
// fell back to `NOOP_CONFIRM`, making every `confirmDeleteBlock(...)` resolve
// to `false` — the trash button in empty atomic-image slots (and every other
// delete path routed through `blockMgr.confirmDeleteBlock`) appeared to do
// nothing. See ENG-185.
export default function ProjectClient(props: ProjectClientProps) {
  if (props.isAdmin) {
    return (
      <InlineEditProvider isAdmin>
        <ProjectClientBody {...props} />
      </InlineEditProvider>
    );
  }
  return <ProjectClientBody {...props} />;
}
