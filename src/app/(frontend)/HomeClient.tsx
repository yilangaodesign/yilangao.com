"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FadeIn } from "@/components/ui/FadeIn";
import { StaggerChildren, StaggerItem } from "@/components/ui/StaggerChildren";
import { BREAKPOINTS } from "@/lib/breakpoints";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from "@dnd-kit/core";
import type { DragStartEvent, DragEndEvent } from "@dnd-kit/core";
import {
  SortableContext,
  rectSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import AdminBar from "@/components/AdminBar";
import ProjectEditModal from "@/components/ProjectEditModal";
import type { ProjectForEdit } from "@/components/ProjectEditModal";
import TestimonialCard from "@/components/ui/TestimonialCard/TestimonialCard";
import type { TestimonialCardProps } from "@/components/ui/TestimonialCard/TestimonialCard";
import {
  InlineEditProvider,
  EditableText,
  EditableArray,
  InlineEditBar,
  DeleteItemButton,
  AddItemCard,
} from "@/components/inline-edit";
import type { ApiTarget, FieldDefinition } from "@/components/inline-edit";
import { Eyebrow } from "@/components/ui/Eyebrow";
import styles from "./page.module.scss";

type Project = {
  id?: string | number;
  slug: string;
  title: string;
  category: string;
  featured: boolean;
  coverImage?: string | null;
  heroImageId?: string | number | null;
};

type Team = { name: string; url: string; period: string };
type SocialLink = { label: string; href: string; external: boolean };
type SiteIdentity = {
  name: string; role: string; location: string; email: string; bio: string;
  bioHtml?: string;
  aboutLabel: string; teamsLabel: string; linksLabel: string; footerCta: string;
};

const SITE_CONFIG_TARGET: ApiTarget = { type: 'global', slug: 'site-config' };

const TEAM_FIELDS: FieldDefinition[] = [
  { name: 'name', label: 'Company', type: 'text', required: true },
  { name: 'period', label: 'Period', type: 'text' },
  { name: 'url', label: 'Website', type: 'url' },
];

const LINK_FIELDS: FieldDefinition[] = [
  { name: 'label', label: 'Label', type: 'text', required: true },
  { name: 'href', label: 'URL or File', type: 'media-url' },
  { name: 'external', label: 'Open in new tab', type: 'checkbox' },
];

function projectTarget(id: string | number): ApiTarget {
  return { type: 'collection', slug: 'projects', id };
}

function ProjectCard({ project, isAdmin, onEdit }: { project: Project; isAdmin?: boolean; onEdit?: (project: Project) => void }) {
  return (
    <Link href={`/work/${project.slug}`} className={`${styles.projectCard} ${project.featured ? styles.projectCardFeatured : ""}`}>
      <div className={styles.projectHero}>
        {project.coverImage ? (
          <img
            src={project.coverImage}
            alt={`${project.title} cover`}
            className={styles.projectCoverImg}
          />
        ) : (
          <div className={styles.projectImage} />
        )}
        {isAdmin && project.id && (
          <div className={styles.cardAdminActions}>
            <button
              type="button"
              className={styles.cardEditBtn}
              title={`Edit ${project.title}`}
              aria-label={`Edit ${project.title}`}
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); onEdit?.(project); }}
            >
              <svg width="12" height="12" viewBox="0 0 14 14" fill="none" aria-hidden>
                <path d="M10.08 1.92a1.5 1.5 0 0 1 2.12 0l.38.38a1.5 1.5 0 0 1 0 2.12L5.5 11.5 2 12.5l1-3.5 7.08-7.08Z" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <DeleteItemButton collection="projects" id={project.id} itemLabel={project.title} />
          </div>
        )}
      </div>
      <div className={styles.projectInfo}>
        <EditableText
          fieldId={`projects:${project.id}:title`}
          target={projectTarget(project.id!)}
          fieldPath="title"
          as="h3"
          className={styles.projectTitle}
          label="Title"
        >
          {project.title}
        </EditableText>
        <EditableText
          fieldId={`projects:${project.id}:category`}
          target={projectTarget(project.id!)}
          fieldPath="category"
          as="span"
          className={styles.projectCategory}
          label="Category"
        >
          {project.category}
        </EditableText>
      </div>
    </Link>
  );
}

type GridItem =
  | { type: "project"; data: Project }
  | { type: "testimonial"; data: TestimonialCardProps };

type GridOrderEntry = { type: string; id: string | number };

function gridItemId(item: GridItem): string {
  if (item.type === "project") return `project-${(item.data as Project).id}`;
  return `testimonial-${(item.data as TestimonialCardProps).id}`;
}

function SortableTile({
  item,
}: {
  item: GridItem;
}) {
  const id = gridItemId(item);
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform) ?? undefined,
    transition: transition ?? undefined,
    opacity: isDragging ? 0.4 : 1,
    touchAction: "none",
    cursor: isDragging ? "grabbing" : "grab",
  };

  const blockNav = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={styles.sortableTile}
      {...attributes}
      {...listeners}
    >
      <div className={styles.dragHandle} aria-hidden="true">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <circle cx="4.5" cy="3" r="1" fill="currentColor" />
          <circle cx="9.5" cy="3" r="1" fill="currentColor" />
          <circle cx="4.5" cy="7" r="1" fill="currentColor" />
          <circle cx="9.5" cy="7" r="1" fill="currentColor" />
          <circle cx="4.5" cy="11" r="1" fill="currentColor" />
          <circle cx="9.5" cy="11" r="1" fill="currentColor" />
        </svg>
      </div>
      {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */}
      <div className={styles.sortableTileContent} onClick={blockNav}>
        {item.type === "project" ? (
          <ProjectCard project={item.data as Project} isAdmin={false} />
        ) : (
          <TestimonialCard {...(item.data as TestimonialCardProps)} isAdmin={false} />
        )}
      </div>
    </div>
  );
}

function TilePreview({ item }: { item: GridItem }) {
  return (
    <div className={styles.dragOverlay}>
      {item.type === "project" ? (
        <ProjectCard project={item.data as Project} isAdmin={false} />
      ) : (
        <TestimonialCard {...(item.data as TestimonialCardProps)} isAdmin={false} />
      )}
    </div>
  );
}

function interleaveGrid(projects: Project[], testimonials: TestimonialCardProps[]): GridItem[] {
  if (testimonials.length === 0) {
    return projects.map((p) => ({ type: "project" as const, data: p }));
  }

  const items: GridItem[] = [];
  let pIdx = 0;
  let tIdx = 0;

  // Place first testimonial at position 3 (index 2) so that with
  // round-robin column distribution it lands in column 3, row 1.
  while (pIdx < 2 && pIdx < projects.length) {
    items.push({ type: "project", data: projects[pIdx] });
    pIdx++;
  }
  if (tIdx < testimonials.length) {
    items.push({ type: "testimonial", data: testimonials[tIdx] });
    tIdx++;
  }

  // Spread remaining testimonials at regular intervals
  const remainingProjects = projects.length - pIdx;
  const remainingTestimonials = testimonials.length - tIdx;
  const interval = remainingTestimonials > 0
    ? Math.max(4, Math.ceil(remainingProjects / (remainingTestimonials + 1)))
    : Infinity;

  let count = 0;
  while (pIdx < projects.length) {
    items.push({ type: "project", data: projects[pIdx] });
    pIdx++;
    count++;

    if (count % interval === 0 && tIdx < testimonials.length) {
      items.push({ type: "testimonial", data: testimonials[tIdx] });
      tIdx++;
    }
  }

  while (tIdx < testimonials.length) {
    items.push({ type: "testimonial", data: testimonials[tIdx] });
    tIdx++;
  }

  return items;
}

const NEW_PROJECT_DEFAULTS = {
  title: 'New Project',
  category: 'Category',
  featured: false,
};

const NEW_TESTIMONIAL_DEFAULTS = {
  text: 'New testimonial quote here.',
  name: 'Name',
  role: 'Role, Company',
  showOnHome: true,
};

export default function HomeClient({
  projects,
  testimonials = [],
  teams,
  links,
  siteConfig,
  isAdmin,
  gridOrder: savedGridOrder,
}: {
  projects: Project[];
  testimonials?: TestimonialCardProps[];
  teams: Team[];
  links: SocialLink[];
  siteConfig: SiteIdentity;
  isAdmin?: boolean;
  gridOrder?: GridOrderEntry[] | null;
}) {
  const allProjectItems: GridItem[] = useMemo(
    () => projects.map((p) => ({ type: "project" as const, data: p })),
    [projects],
  );
  const allTestimonialItems: GridItem[] = useMemo(
    () => testimonials.map((t) => ({ type: "testimonial" as const, data: t })),
    [testimonials],
  );

  const gridItems = useMemo(() => {
    if (savedGridOrder && savedGridOrder.length > 0) {
      const lookup = new Map<string, GridItem>();
      for (const item of allProjectItems) lookup.set(gridItemId(item), item);
      for (const item of allTestimonialItems) lookup.set(gridItemId(item), item);
      const ordered: GridItem[] = [];
      for (const entry of savedGridOrder) {
        const key = `${entry.type}-${entry.id}`;
        const found = lookup.get(key);
        if (found) {
          ordered.push(found);
          lookup.delete(key);
        }
      }
      for (const remaining of lookup.values()) ordered.push(remaining);
      return ordered;
    }
    return interleaveGrid(projects, testimonials);
  }, [savedGridOrder, projects, testimonials, allProjectItems, allTestimonialItems]);

  // ── Project edit modal (admin only) ────────────────────────────────────────
  const router = useRouter();
  const [editingProject, setEditingProject] = useState<ProjectForEdit | null>(null);

  const openProjectEditor = useCallback((p: Project) => {
    if (!p.id) return;
    setEditingProject({
      id: p.id,
      title: p.title,
      category: p.category,
      coverImage: p.coverImage ?? null,
      heroImageId: p.heroImageId ?? null,
    });
  }, []);

  const closeProjectEditor = useCallback(() => {
    setEditingProject(null);
  }, []);

  const handleProjectSaved = useCallback(() => {
    setEditingProject(null);
    router.refresh();
  }, [router]);

  // ── Reorder mode (admin only) ──────────────────────────────────────────────
  const [reorderMode, setReorderMode] = useState(false);
  const [orderedItems, setOrderedItems] = useState<GridItem[]>(gridItems);
  const [activeItem, setActiveItem] = useState<GridItem | null>(null);
  const [saving, setSaving] = useState(false);
  const [hasPendingSave, setHasPendingSave] = useState(false);
  const originalOrderRef = useRef<GridItem[]>(gridItems);

  useEffect(() => {
    if (hasPendingSave) {
      setHasPendingSave(false);
      return;
    }
    if (!reorderMode) setOrderedItems(gridItems);
  }, [gridItems, reorderMode, hasPendingSave]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  );

  const sortableIds = useMemo(
    () => orderedItems.map(gridItemId),
    [orderedItems],
  );

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const item = orderedItems.find((it) => gridItemId(it) === event.active.id);
    setActiveItem(item ?? null);
  }, [orderedItems]);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    setActiveItem(null);
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    setOrderedItems((prev) => {
      const oldIdx = prev.findIndex((it) => gridItemId(it) === active.id);
      const newIdx = prev.findIndex((it) => gridItemId(it) === over.id);
      if (oldIdx === -1 || newIdx === -1) return prev;
      return arrayMove(prev, oldIdx, newIdx);
    });
  }, []);

  const enterReorder = useCallback(() => {
    originalOrderRef.current = orderedItems;
    setReorderMode(true);
  }, [orderedItems]);

  const cancelReorder = useCallback(() => {
    setOrderedItems(originalOrderRef.current);
    setReorderMode(false);
  }, []);

  const saveReorder = useCallback(async () => {
    setSaving(true);
    const newGridOrder: GridOrderEntry[] = orderedItems.map((item) => {
      if (item.type === "project") return { type: "project", id: (item.data as Project).id! };
      return { type: "testimonial", id: (item.data as TestimonialCardProps).id! };
    });
    try {
      await fetch("/api/globals/site-config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gridOrder: newGridOrder }),
      });
      setHasPendingSave(true);
      setReorderMode(false);
      router.refresh();
    } catch (err) {
      console.error("Failed to save grid order", err);
    } finally {
      setSaving(false);
    }
  }, [orderedItems, router]);

  // ── Column distribution ───────────────────────────────────────────────────
  const displayItems = reorderMode || hasPendingSave ? orderedItems : gridItems;

  const [columnCount, setColumnCount] = useState(3);
  useEffect(() => {
    function update() {
      const w = window.innerWidth;
      if (w >= BREAKPOINTS.md) setColumnCount(3);
      else if (w >= BREAKPOINTS.sm) setColumnCount(2);
      else setColumnCount(1);
    }
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const columns = useMemo(() => {
    if (columnCount === 1) return [displayItems];
    const cols: GridItem[][] = Array.from({ length: columnCount }, () => []);
    displayItems.forEach((item, i) => {
      cols[i % columnCount].push(item);
    });
    return cols;
  }, [displayItems, columnCount]);

  const projectDefaults = useMemo(() => ({
    ...NEW_PROJECT_DEFAULTS,
    slug: `new-project-${Date.now()}`,
    order: projects.length + 1,
  }), [projects.length]);
  const testimonialDefaults = useMemo(() => ({
    ...NEW_TESTIMONIAL_DEFAULTS,
    order: testimonials.length + 1,
  }), [testimonials.length]);
  const content = (
    <main className={styles.page}>
      {isAdmin && <AdminBar editUrl="/admin/globals/site-config" editLabel="Edit Site Config" />}
      <div className={styles.layout}>
        <aside className={styles.sidebar}>
          <div className={styles.sidebarInner}>
            <FadeIn>
              <header className={styles.identity}>
                <EditableText
                  fieldId="sc:name"
                  target={SITE_CONFIG_TARGET}
                  fieldPath="name"
                  as="h1"
                  className={styles.name}
                  label="Name"
                >
                  {siteConfig.name}
                </EditableText>
                <EditableText
                  fieldId="sc:role"
                  target={SITE_CONFIG_TARGET}
                  fieldPath="role"
                  as="p"
                  className={styles.role}
                  label="Role"
                >
                  {siteConfig.role}
                </EditableText>
                <EditableText
                  fieldId="sc:location"
                  target={SITE_CONFIG_TARGET}
                  fieldPath="location"
                  as="p"
                  className={styles.location}
                  label="Location"
                >
                  {siteConfig.location}
                </EditableText>
              </header>
            </FadeIn>

            <FadeIn delay={0.1}>
              <section className={styles.about}>
                <Eyebrow as="h2" className={styles.sectionLabel}>
                  <EditableText
                    fieldId="sc:aboutLabel"
                    target={SITE_CONFIG_TARGET}
                    fieldPath="aboutLabel"
                    label="Section Label"
                  >
                    {siteConfig.aboutLabel}
                  </EditableText>
                </Eyebrow>
                <EditableText
                  fieldId="sc:bio"
                  target={SITE_CONFIG_TARGET}
                  fieldPath="bio"
                  as="p"
                  className={styles.aboutText}
                  multiline
                  isRichText
                  htmlContent={siteConfig.bioHtml}
                  label="Bio"
                >
                  {siteConfig.bio || "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. At the moment, interested in how tools connect with each other, how they act on our behalf, and how we interact with them across different modes."}
                </EditableText>
              </section>
            </FadeIn>

            <FadeIn delay={0.2}>
              <div className={styles.teamsAndLinks}>
                <section className={styles.teams}>
                  <Eyebrow as="h2" className={styles.sectionLabel}>
                    <EditableText
                      fieldId="sc:teamsLabel"
                      target={SITE_CONFIG_TARGET}
                      fieldPath="teamsLabel"
                      label="Section Label"
                    >
                      {siteConfig.teamsLabel}
                    </EditableText>
                  </Eyebrow>
                  <EditableArray<Team>
                    fieldId="sc:teams"
                    target={SITE_CONFIG_TARGET}
                    fieldPath="teams"
                    items={teams}
                    itemFields={TEAM_FIELDS}
                    label="Experience"
                    renderItem={(team, i) => (
                      <li key={i} className={styles.teamItem}>
                        {team.url && team.url !== '#' ? (
                          <a href={team.url} target="_blank" rel="noopener noreferrer" className={styles.teamLink}>
                            {team.name}<span className={styles.arrow}>&#8599;</span>
                          </a>
                        ) : (
                          <span className={styles.teamLink}>{team.name}</span>
                        )}
                        <span className={styles.teamNum}>{team.period || (i + 1)}</span>
                      </li>
                    )}
                    as="ul"
                    className={styles.teamsList}
                  />
                </section>

                <section className={styles.links}>
                  <Eyebrow as="h2" className={styles.sectionLabel}>
                    <EditableText
                      fieldId="sc:linksLabel"
                      target={SITE_CONFIG_TARGET}
                      fieldPath="linksLabel"
                      label="Section Label"
                    >
                      {siteConfig.linksLabel}
                    </EditableText>
                  </Eyebrow>
                  <EditableArray<SocialLink>
                    fieldId="sc:socialLinks"
                    target={SITE_CONFIG_TARGET}
                    fieldPath="socialLinks"
                    items={links}
                    itemFields={LINK_FIELDS}
                    label="Links"
                    newItemDefaults={{ external: true } as Partial<SocialLink>}
                    renderItem={(link) => (
                      <li key={link.label}>
                        {link.external ? (
                          <a href={link.href} target="_blank" rel="noopener noreferrer" className={styles.externalLink}>
                            {link.label}<span className={styles.arrow}>&#8599;</span>
                          </a>
                        ) : (
                          <Link href={link.href} className={styles.externalLink}>
                            {link.label}<span className={styles.arrow}>&#8599;</span>
                          </Link>
                        )}
                      </li>
                    )}
                    as="ul"
                    className={styles.linksList}
                  />
                </section>
              </div>
            </FadeIn>
          </div>
        </aside>

        <section className={styles.main}>
          {reorderMode ? (
            <>
              <div className={styles.reorderBar}>
                <span className={styles.reorderLabel}>Drag tiles to reorder</span>
                <div className={styles.reorderActions}>
                  <button
                    type="button"
                    className={styles.reorderCancel}
                    onClick={cancelReorder}
                    disabled={saving}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className={styles.reorderSave}
                    onClick={saveReorder}
                    disabled={saving}
                  >
                    {saving ? "Saving…" : "Save order"}
                  </button>
                </div>
              </div>
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
              >
                <SortableContext items={sortableIds} strategy={rectSortingStrategy}>
                  <div className={styles.reorderGrid}>
                    {orderedItems.map((item) => (
                      <SortableTile
                        key={gridItemId(item)}
                        item={item}
                      />
                    ))}
                  </div>
                </SortableContext>
                <DragOverlay dropAnimation={null}>
                  {activeItem ? <TilePreview item={activeItem} /> : null}
                </DragOverlay>
              </DndContext>
            </>
          ) : (
            <>
              {isAdmin && (
                <div className={styles.reorderBar}>
                  <button
                    type="button"
                    className={styles.reorderToggle}
                    onClick={enterReorder}
                  >
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                      <path d="M2 4h10M2 7h10M2 10h10" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                    </svg>
                    Reorder tiles
                  </button>
                </div>
              )}
              <StaggerChildren className={styles.masonryGrid}>
                {columns.map((col, colIdx) => (
                  <div key={colIdx} className={styles.masonryColumn}>
                    {col.map((item, i) =>
                      item.type === "project" ? (
                        <StaggerItem key={`p-${(item.data as Project).slug}`} className={(item.data as Project).featured ? styles.gridItemFeatured : styles.gridItem}>
                          <ProjectCard project={item.data as Project} isAdmin={isAdmin} onEdit={openProjectEditor} />
                        </StaggerItem>
                      ) : (
                        <StaggerItem key={`t-${colIdx}-${i}`} className={styles.gridItem}>
                          <TestimonialCard {...(item.data as TestimonialCardProps)} isAdmin={isAdmin} />
                        </StaggerItem>
                      )
                    )}
                  </div>
                ))}
              </StaggerChildren>
              {isAdmin && (
                <div className={styles.masonryGrid}>
                  <div className={styles.masonryColumn}>
                    <StaggerItem className={styles.gridItem}>
                      <AddItemCard
                        collection="projects"
                        defaults={projectDefaults}
                        label="Add project"
                        openAfterCreate
                      />
                    </StaggerItem>
                  </div>
                  <div className={styles.masonryColumn}>
                    <StaggerItem className={styles.gridItem}>
                      <AddItemCard
                        collection="testimonials"
                        defaults={testimonialDefaults}
                        label="Add testimonial"
                      />
                    </StaggerItem>
                  </div>
                </div>
              )}
            </>
          )}
        </section>
      </div>

      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <EditableText
            fieldId="sc:footerCta"
            target={SITE_CONFIG_TARGET}
            fieldPath="footerCta"
            as="span"
            className={styles.footerCta}
            label="Footer CTA"
          >
            {siteConfig.footerCta}
          </EditableText>
          <EditableText
            fieldId="sc:email"
            target={SITE_CONFIG_TARGET}
            fieldPath="email"
            as="a"
            href={`mailto:${siteConfig.email}`}
            className={styles.footerEmail}
            label="Email"
          >
            {siteConfig.email}
          </EditableText>
        </div>
      </footer>

      {isAdmin && <InlineEditBar />}
      {editingProject && (
        <ProjectEditModal
          project={editingProject}
          onClose={closeProjectEditor}
          onSaved={handleProjectSaved}
        />
      )}
    </main>
  );

  if (isAdmin) {
    return (
      <InlineEditProvider isAdmin>
        {content}
      </InlineEditProvider>
    );
  }

  return content;
}
