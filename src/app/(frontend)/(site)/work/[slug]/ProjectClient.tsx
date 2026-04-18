"use client";

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { PreloadManager } from "@/lib/preload-manager";
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
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import type { DragEndEvent } from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { InfoTooltip } from "@/components/ui/Tooltip";
import MediaRenderer from "@/components/ui/MediaRenderer/MediaRenderer";
import elanStyles from "@/components/elan-visuals/elan-visuals.module.scss";
import { siteShellStyles } from "@/components/SiteFooter";
import styles from "./page.module.scss";

/* ── Block types (shared with page.tsx server component) ── */

export type ContentBlock =
  | { id: string; blockType: 'heading'; text: string; level: 'h2' | 'h3' }
  | { id: string; blockType: 'richText'; body: string; bodyHtml?: string; bodyLexical?: Record<string, unknown> }
  | { id: string; blockType: 'imageGroup'; layout: string; images: { url: string; mimeType?: string; alt?: string; caption?: string }[]; caption?: string; placeholderLabels?: string[] }
  | { id: string; blockType: 'divider' }
  | { id: string; blockType: 'hero'; imageUrl?: string; mimeType?: string; caption?: string; placeholderLabel?: string };

type Collaborator = { name: string };
type Tool = { name: string };
type ExternalLink = { label: string; href: string };

type ProjectData = {
  id?: string | number;
  slug?: string;
  title: string;
  category: string;
  introBlurbHeadline?: string;
  introBlurbBody?: string;
  introBlurbBodyHtml?: string;
  description: string;
  descriptionHtml?: string;
  descriptionLexical?: Record<string, unknown>;
  heroMetric?: { value: string; label: string; tooltip?: string };
  inlineLinks?: Record<string, string>;
  role: string;
  collaborators: Collaborator[];
  duration: string;
  tools: Tool[];
  externalLinks: ExternalLink[];
  content: ContentBlock[];
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

function renderTextWithLinks(text: string, links: Record<string, string>) {
  if (!links || Object.keys(links).length === 0) return <>{text}</>;

  const escaped = Object.keys(links)
    .sort((a, b) => b.length - a.length)
    .map((k) => k.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  const pattern = new RegExp(`(${escaped.join("|")})`);
  const parts = text.split(pattern);

  return (
    <>
      {parts.map((part, i) => {
        const href = links[part];
        if (href) {
          return (
            <a key={i} href={href} target="_blank" rel="noopener noreferrer" className={styles.inlineLink}>
              {part}<span className={styles.arrow}>&#8599;</span>
            </a>
          );
        }
        return <span key={i}>{part}</span>;
      })}
    </>
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

function SortableBlock({
  id,
  children,
  isAdmin,
}: {
  id: string;
  children: React.ReactNode;
  isAdmin?: boolean;
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
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} className={styles.blockWrapper}>
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
      </div>
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

export default function ProjectClient({
  project,
  prevProject,
  nextProject,
  isAdmin,
  interactiveVisuals,
  companyNote,
}: {
  project: ProjectData;
  prevProject?: AdjacentProject;
  nextProject?: AdjacentProject;
  isAdmin?: boolean;
  interactiveVisuals?: Record<string, InteractiveVisualConfig>;
  companyNote?: { companyName: string; note: string };
}) {
  const p = project;
  const router = useRouter();

  useLayoutEffect(() => {
    window.scrollTo(0, 0);
  }, [p.slug]);

  useEffect(() => {
    if (p.slug) {
      PreloadManager.bump(p.slug);
    }
  }, [p.slug]);

  const projectTarget: ApiTarget | undefined = useMemo(
    () => p.id ? { type: 'collection', slug: 'projects', id: p.id } : undefined,
    [p.id],
  );

  const heroBlock = useMemo(
    () => p.content.find((b): b is ContentBlock & { blockType: 'hero' } => b.blockType === 'hero'),
    [p.content],
  );

  const heroBlockIndex = useMemo(
    () => p.content.findIndex(b => b.blockType === 'hero'),
    [p.content],
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
    () => p.content
      .map((b, i) => ({ block: b, originalIndex: i }))
      .filter(({ block }) => block.blockType !== 'hero'),
    [p.content],
  );

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

  const blockMgr = useBlockManager(projectTarget)
  const blockNav = useBlockKeyboardNav(blockMgr.addBlock, blockMgr.deleteBlock, contentBlocks.length)

  const dndSensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
  )
  const blockIds = useMemo(
    () => contentBlocks.map(({ block }, i) => block.id || `block-${i}`),
    [contentBlocks],
  )
  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event
      if (!over || active.id === over.id) return
      const oldIndex = blockIds.indexOf(String(active.id))
      const newIndex = blockIds.indexOf(String(over.id))
      if (oldIndex === -1 || newIndex === -1) return
      blockMgr.reorderBlock(oldIndex, newIndex)
    },
    [blockIds, blockMgr],
  )

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
    const displayIdx = dropInsertIndex ?? contentBlocks.length
    setDropInsertIndex(null)

    const cmsIdx = displayIdx < contentBlocks.length
      ? contentBlocks[displayIdx].originalIndex
      : (contentBlocks.length > 0 ? contentBlocks[contentBlocks.length - 1].originalIndex + 1 : 0)

    const files = Array.from(e.dataTransfer.files).filter((f) => f.type.startsWith('image/') || f.type.startsWith('video/'))
    if (files.length === 0) return

    blockMgr.addBlock('imageGroup', cmsIdx)
    setTimeout(async () => {
      for (const file of files) {
        await blockMgr.addImageToBlock(cmsIdx, file)
      }
    }, 500)
  }, [dropInsertIndex, contentBlocks, blockMgr])

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

      <div className={styles.layout}>
        {/* ── LEFT SIDEBAR ── */}
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
                  {(projectTarget || p.externalLinks.length > 0) && (
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
                          <a key={i} href={link.href} target="_blank" rel="noopener noreferrer" className={styles.metaLink}>
                            {link.label}<span className={styles.arrow}>&#8599;</span>
                          </a>
                        )}
                      />
                    ) : (
                      <div className={styles.metaLinks}>
                        {p.externalLinks.map((link, i) => (
                          <a key={i} href={link.href} target="_blank" rel="noopener noreferrer" className={styles.metaLink}>
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

        {/* ── RIGHT CONTENT ── */}
        <main className={styles.content}>
          {p.introBlurbHeadline && (
            <FadeIn>
              <div id="intro" className={styles.introBlurb}>
                {projectTarget ? (
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

          {p.introBlurbHeadline && (
            <hr className={styles.articleSeparator} />
          )}

          {p.description && (
            <FadeIn>
              <div id="overview" className={styles.legacyDescription}>
                {isAdmin && projectTarget && p.descriptionLexical ? (
                  <LexicalBlockEditor
                    initialState={p.descriptionLexical as unknown as import('lexical').SerializedEditorState}
                    target={projectTarget}
                    fieldPath="description"
                    className={styles.legacyDescriptionText}
                  />
                ) : p.descriptionHtml ? (
                  <div className={styles.legacyDescriptionText} dangerouslySetInnerHTML={{ __html: p.descriptionHtml }} />
                ) : (
                  <p className={styles.legacyDescriptionText}>
                    {renderTextWithLinks(p.description, p.inlineLinks ?? {})}
                  </p>
                )}
              </div>
            </FadeIn>
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

          {/* Screen reader live region for block operations */}
          <div id="block-live-region" className="sr-only" aria-live="polite" aria-atomic="true" />

          {/* ── BLOCK RENDERER ── */}
          <DndContext id="project-blocks" sensors={dndSensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={blockIds} strategy={verticalListSortingStrategy}>
          <div
            ref={blockListRef}
            className={[styles.blockList, isDraggingOver && styles.blockListDragOver].filter(Boolean).join(' ')}
            role="list"
            onDragEnter={handleContentDragEnter}
            onDragOver={handleContentDragOver}
            onDragLeave={handleContentDragLeave}
            onDrop={handleContentDrop}
          >
            {contentBlocks.map(({ block, originalIndex }, blockIndex) => {
              const cmsIndex = originalIndex;
              const blockContent = (() => {
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
                                    <MediaRenderer src={img.url} mimeType={img.mimeType} alt={img.alt || lbl} className={styles.sectionImg} sizes={getImageSizes(block.layout, block.placeholderLabels!.length)} />
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
                                      <div className={styles.imageOverlay}>
                                        <button
                                          type="button"
                                          className={styles.imageOverlayBtn}
                                          onClick={() => blockMgr.moveImageInBlock(cmsIndex, idx, -1)}
                                          disabled={blockMgr.busy || idx === 0}
                                          aria-label="Move image left"
                                        >◂</button>
                                        <button
                                          type="button"
                                          className={styles.imageOverlayBtn}
                                          onClick={() => blockMgr.moveImageInBlock(cmsIndex, idx, 1)}
                                          disabled={blockMgr.busy || idx === block.images.length - 1}
                                          aria-label="Move image right"
                                        >▸</button>
                                        <button
                                          type="button"
                                          className={[styles.imageOverlayBtn, styles.imageOverlayBtnDanger].join(' ')}
                                          onClick={() => blockMgr.removeImageFromBlock(cmsIndex, idx)}
                                          disabled={blockMgr.busy}
                                          aria-label="Remove image"
                                        >✕</button>
                                      </div>
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
                                  <MediaRenderer src={img.url} mimeType={img.mimeType} alt={img.alt || `Image ${idx + 1}`} className={styles.sectionImg} sizes={getImageSizes(block.layout, block.images.length)} />
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
                                    <div className={styles.imageOverlay}>
                                      <button
                                        type="button"
                                        className={styles.imageOverlayBtn}
                                        onClick={() => blockMgr.moveImageInBlock(cmsIndex, idx, -1)}
                                        disabled={blockMgr.busy || idx === 0}
                                        aria-label="Move image left"
                                      >◂</button>
                                      <button
                                        type="button"
                                        className={styles.imageOverlayBtn}
                                        onClick={() => blockMgr.moveImageInBlock(cmsIndex, idx, 1)}
                                        disabled={blockMgr.busy || idx === block.images.length - 1}
                                        aria-label="Move image right"
                                      >▸</button>
                                      <button
                                        type="button"
                                        className={[styles.imageOverlayBtn, styles.imageOverlayBtnDanger].join(' ')}
                                        onClick={() => blockMgr.removeImageFromBlock(cmsIndex, idx)}
                                        disabled={blockMgr.busy}
                                        aria-label="Remove image"
                                      >✕</button>
                                    </div>
                                  )}
                                </figure>
                              ))}
                            </div>
                            {isAdmin && (
                              <button
                                type="button"
                                className={styles.addBlockBtn}
                                onClick={handleFileSelect}
                                disabled={blockMgr.busy}
                              >
                                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                                  <path d="M7 2v10M2 7h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                                </svg>
                                Add image
                              </button>
                            )}
                          </>
                        ) : isAdmin ? (
                          <div
                            className={styles.dropZone}
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={handleFileDrop}
                            onClick={handleFileSelect}
                            role="button"
                            tabIndex={0}
                            aria-label="Drop images or click to upload"
                            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleFileSelect(); } }}
                          >
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                              <rect x="2" y="2" width="20" height="20" rx="3" stroke="currentColor" strokeWidth="1.5" />
                              <path d="M12 8v8M8 12h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                            </svg>
                            <span>Drop images or click to browse</span>
                          </div>
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

                  case 'divider':
                    return <hr className={styles.divider} />;

                  default:
                    return null;
                }
              })();

              const headingId = block.blockType === 'heading' ? slugify((block as ContentBlock & { blockType: 'heading' }).text) : undefined;

              const sortableId = block.id || `block-${blockIndex}`
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
                    onKeyDown={isAdmin ? (e) => {
                      if (e.altKey && e.key === 'ArrowUp') { e.preventDefault(); blockMgr.moveBlock(cmsIndex, -1); }
                      if (e.altKey && e.key === 'ArrowDown') { e.preventDefault(); blockMgr.moveBlock(cmsIndex, 1); }
                    } : undefined}
                  >
                    {isAdmin && projectTarget && (
                      <BlockToolbar
                        index={blockIndex}
                        total={contentBlocks.length}
                        blockType={block.blockType}
                        onMoveUp={() => blockMgr.moveBlock(cmsIndex, -1)}
                        onMoveDown={() => blockMgr.moveBlock(cmsIndex, 1)}
                        onDelete={() => blockMgr.deleteBlock(cmsIndex)}
                        onInsertAbove={(type: BlockType) => blockMgr.addBlock(type, cmsIndex)}
                        onLayoutChange={
                          block.blockType === 'imageGroup'
                            ? (layout) => blockMgr.patchBlockField(cmsIndex, 'layout', layout)
                            : undefined
                        }
                        currentLayout={block.blockType === 'imageGroup' ? (block as ContentBlock & { blockType: 'imageGroup' }).layout : undefined}
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
                      onInsert={(type: BlockType) => blockMgr.addBlock(type, cmsIndex + 1)}
                      busy={blockMgr.busy}
                    />
                  )}
                  {isDraggingOver && dropInsertIndex === blockIndex + 1 && (
                    <div className={styles.dropIndicator} aria-hidden />
                  )}
                </>
              )

              if (isAdmin) {
                return (
                  <SortableBlock key={sortableId} id={sortableId} isAdmin>
                    {blockInner}
                  </SortableBlock>
                )
              }

              return <div key={sortableId} className={styles.blockItem}>{blockInner}</div>;
            })}
          </div>
          </SortableContext>
          </DndContext>

          {isAdmin && projectTarget && contentBlocks.length === 0 && (
            <BlockInsertMenu onInsert={(type: BlockType) => blockMgr.addBlock(type)} disabled={blockMgr.busy}>
              <button type="button" className={styles.addBlockBtn} disabled={blockMgr.busy}>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                  <path d="M7 2v10M2 7h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
                Add first block
              </button>
            </BlockInsertMenu>
          )}

          {blockMgr.error && (
            <p className={styles.blockError}>{blockMgr.error}</p>
          )}

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

  if (isAdmin) {
    return (
      <InlineEditProvider isAdmin>
        {page}
      </InlineEditProvider>
    );
  }

  return page;
}
