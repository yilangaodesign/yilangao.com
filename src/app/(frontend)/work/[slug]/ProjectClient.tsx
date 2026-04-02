"use client";

import { useMemo } from "react";
import Link from "next/link";
import { FadeIn } from "@/components/ui/FadeIn";
import AdminBar from "@/components/AdminBar";
import ScrollSpy from "@/components/ui/ScrollSpy/ScrollSpy";
import type { ScrollSpySection } from "@/components/ui/ScrollSpy/ScrollSpy";
import {
  InlineEditProvider,
  EditableText,
  EditableArray,
  InlineEditBar,
} from "@/components/inline-edit";
import type { ApiTarget, FieldDefinition } from "@/components/inline-edit";
import {
  TokenGrid,
  ComponentShowcase,
  EscalationTimeline,
  InteractionShowcase,
  IncidentDensityMap,
} from "@/components/elan-visuals";
import elanStyles from "@/components/elan-visuals/elan-visuals.module.scss";
import styles from "./page.module.scss";

type ProjectSection = {
  heading: string;
  body: string;
  imageCount: number;
  imagePlaceholders: string[];
  caption: string | null;
};

type Collaborator = { name: string };
type Tool = { name: string };
type ExternalLink = { label: string; href: string };

type ProjectData = {
  id?: number;
  title: string;
  category: string;
  description: string;
  heroMetric?: { value: string; label: string };
  inlineLinks?: Record<string, string>;
  role: string;
  collaborators: Collaborator[];
  duration: string;
  tools: Tool[];
  externalLinks: ExternalLink[];
  sections: ProjectSection[];
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

function ExternalIcon() {
  return (
    <svg className={styles.externalIcon} width="8" height="8" viewBox="0 0 12 12" fill="none" aria-hidden="true">
      <path d="M3.5 1.5H10.5V8.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M10.5 1.5L1.5 10.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

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
              {part}
              <ExternalIcon />
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
        <ExternalIcon />
      </a>
    </div>
  );
}

export default function ProjectClient({
  project,
  prevProject,
  nextProject,
  isAdmin,
  interactiveVisuals,
  coverImage,
}: {
  project: ProjectData;
  prevProject?: AdjacentProject;
  nextProject?: AdjacentProject;
  isAdmin?: boolean;
  interactiveVisuals?: Record<string, InteractiveVisualConfig>;
  coverImage?: string;
}) {
  const p = project;

  const projectTarget: ApiTarget | undefined = useMemo(
    () => p.id ? { type: 'collection', slug: 'projects', id: p.id } : undefined,
    [p.id],
  );

  const spySections: ScrollSpySection[] = useMemo(
    () =>
      p.sections.map((s) => ({
        id: slugify(s.heading),
        label: s.heading,
      })),
    [p.sections],
  );

  const editUrl = p.id ? `/admin/collections/projects/${p.id}` : '/admin/collections/projects';

  const page = (
    <article className={styles.page}>
      {isAdmin && <AdminBar editUrl={editUrl} editLabel={`Edit "${p.title}"`} />}
      <ScrollSpy sections={spySections} />

      <div className={styles.layout}>
        {/* ── LEFT SIDEBAR ── */}
        <aside className={styles.sidebar}>
          <div className={styles.sidebarInner}>
            <FadeIn>
              <Link href="/" className={styles.backLink}>
                <ArrowLeft />
                <span>Back</span>
              </Link>
            </FadeIn>

            <FadeIn delay={0.05}>
              <div className={styles.projectIdentity}>
                {projectTarget ? (
                  <EditableText
                    fieldId={`proj:${p.id}:title`}
                    target={projectTarget}
                    fieldPath="title"
                    as="h1"
                    className={styles.title}
                    label="Title"
                  >
                    {p.title}
                  </EditableText>
                ) : (
                  <h1 className={styles.title}>{p.title}</h1>
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
            </FadeIn>

            {p.heroMetric && (
              <FadeIn delay={0.1}>
                <div className={styles.heroMetric}>
                  <span className={styles.heroMetricValue}>{p.heroMetric.value}</span>
                  <span className={styles.heroMetricLabel}>{p.heroMetric.label}</span>
                </div>
              </FadeIn>
            )}

            <FadeIn delay={0.15}>
              <div className={styles.meta}>
                <div className={styles.metaGroup}>
                  <span className={styles.metaLabel}>Role</span>
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
                  <span className={styles.metaLabel}>Collaborators</span>
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
                  <span className={styles.metaLabel}>Duration</span>
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
                  <span className={styles.metaLabel}>Tools</span>
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
                        <span key={i} className={styles.toolTag}>{t.name}</span>
                      )}
                    />
                  ) : (
                    <div className={styles.toolTags}>
                      {p.tools.map((t, i) => (
                        <span key={i} className={styles.toolTag}>{t.name}</span>
                      ))}
                    </div>
                  )}
                </div>
                <div className={styles.metaLinks}>
                  {projectTarget ? (
                    <EditableArray<ExternalLink>
                      fieldId={`proj:${p.id}:externalLinks`}
                      target={projectTarget}
                      fieldPath="externalLinks"
                      items={p.externalLinks}
                      itemFields={EXT_LINK_FIELDS}
                      label="Links"
                      renderItem={(link, i) => (
                        <a key={i} href={link.href} target="_blank" rel="noopener noreferrer" className={styles.metaLink}>
                          {link.label}
                          <ExternalIcon />
                        </a>
                      )}
                    />
                  ) : (
                    p.externalLinks.map((link, i) => (
                      <a key={i} href={link.href} target="_blank" rel="noopener noreferrer" className={styles.metaLink}>
                        {link.label}
                        <ExternalIcon />
                      </a>
                    ))
                  )}
                </div>
              </div>
            </FadeIn>
          </div>
        </aside>

        {/* ── RIGHT CONTENT ── */}
        <main className={styles.content}>
          <FadeIn>
            <div className={styles.heroImage}>
              {coverImage ? (
                <img
                  src={coverImage}
                  alt={`${p.title} — case study cover`}
                  className={styles.heroImg}
                />
              ) : (
                <div className={styles.heroImagePlaceholder}>
                  <span className={styles.heroImageLabel}>Hero — Final Design Outcome</span>
                </div>
              )}
            </div>
          </FadeIn>

          <FadeIn>
            <div className={styles.description}>
              {projectTarget ? (
                <EditableText
                  fieldId={`proj:${p.id}:description`}
                  target={projectTarget}
                  fieldPath="description"
                  as="p"
                  className={styles.descriptionText}
                  multiline
                  isRichText
                  label="Description"
                >
                  {p.description}
                </EditableText>
              ) : (
                <p className={styles.descriptionText}>
                  {renderTextWithLinks(p.description, p.inlineLinks ?? {})}
                </p>
              )}
            </div>
          </FadeIn>

          {p.sections.map((section, i) => (
            <section key={i} id={slugify(section.heading)} className={styles.contentSection}>
              <FadeIn>
                {projectTarget ? (
                  <>
                    <EditableText
                      fieldId={`proj:${p.id}:sections.${i}.heading`}
                      target={projectTarget}
                      fieldPath={`sections.${i}.heading`}
                      as="h2"
                      className={styles.sectionHeading}
                      label={`Section ${i + 1} Heading`}
                    >
                      {section.heading}
                    </EditableText>
                    <EditableText
                      fieldId={`proj:${p.id}:sections.${i}.body`}
                      target={projectTarget}
                      fieldPath={`sections.${i}.body`}
                      as="p"
                      className={styles.sectionBody}
                      multiline
                      isRichText
                      label={`Section ${i + 1} Body`}
                    >
                      {section.body}
                    </EditableText>
                  </>
                ) : (
                  <>
                    <h2 className={styles.sectionHeading}>{section.heading}</h2>
                    <p className={styles.sectionBody}>{section.body}</p>
                  </>
                )}
              </FadeIn>

              <FadeIn>
                {interactiveVisuals?.[section.heading] && (
                  <InteractiveVisual config={interactiveVisuals[section.heading]} />
                )}

                {!interactiveVisuals?.[section.heading] && section.imageCount === 1 && (
                  <div className={styles.imageBlock}>
                    <div className={styles.imagePlaceholder} />
                  </div>
                )}
                {!interactiveVisuals?.[section.heading] && section.imageCount === 2 && (
                  <div className={styles.imageGrid2}>
                    <div className={styles.imagePlaceholder} />
                    <div className={styles.imagePlaceholder} />
                  </div>
                )}
                {!interactiveVisuals?.[section.heading] && section.imageCount >= 3 && (
                  <div className={styles.imageGrid3}>
                    <div className={styles.imagePlaceholderWide} />
                    <div className={styles.imagePlaceholder} />
                    <div className={styles.imagePlaceholder} />
                  </div>
                )}

                {!interactiveVisuals?.[section.heading] && section.imageCount === 0 && section.imagePlaceholders.length > 0 && (
                  <div className={styles.placeholderGrid}>
                    {section.imagePlaceholders.map((lbl, idx) => (
                      <div
                        key={idx}
                        className={idx === 0 && section.imagePlaceholders.length >= 3 ? styles.labeledPlaceholderWide : styles.labeledPlaceholder}
                      >
                        <span className={styles.placeholderLabel}>{lbl}</span>
                        <span className={styles.placeholderIndex}>Image {idx + 1} of {section.imagePlaceholders.length}</span>
                      </div>
                    ))}
                  </div>
                )}

                {section.caption && projectTarget ? (
                  <EditableText
                    fieldId={`proj:${p.id}:sections.${i}.caption`}
                    target={projectTarget}
                    fieldPath={`sections.${i}.caption`}
                    as="p"
                    className={styles.imageCaption}
                    label={`Section ${i + 1} Caption`}
                  >
                    {section.caption}
                  </EditableText>
                ) : section.caption ? (
                  <p className={styles.imageCaption}>{section.caption}</p>
                ) : null}
              </FadeIn>

              {i < p.sections.length - 1 && <hr className={styles.divider} />}
            </section>
          ))}

          {/* ── PREV / NEXT NAVIGATION ── */}
          {(prevProject || nextProject) && (
            <nav className={styles.projectNav} aria-label="Case study navigation">
              <div className={styles.projectNavInner}>
                {prevProject ? (
                  <Link href={`/work/${prevProject.slug}`} className={styles.projectNavLink}>
                    <ArrowLeft />
                    <div className={styles.projectNavText}>
                      <span className={styles.projectNavLabel}>Previous</span>
                      <span className={styles.projectNavTitle}>{prevProject.title}</span>
                    </div>
                  </Link>
                ) : (
                  <div />
                )}
                {nextProject ? (
                  <Link href={`/work/${nextProject.slug}`} className={`${styles.projectNavLink} ${styles.projectNavLinkNext}`}>
                    <div className={styles.projectNavText}>
                      <span className={styles.projectNavLabel}>Next</span>
                      <span className={styles.projectNavTitle}>{nextProject.title}</span>
                    </div>
                    <ArrowRight />
                  </Link>
                ) : (
                  <div />
                )}
              </div>
            </nav>
          )}
        </main>
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
