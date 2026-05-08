"use client";

import {
  Suspense,
  useState,
  useEffect,
  useCallback,
  useRef,
  useTransition,
  createContext,
  useContext,
  type ReactNode,
} from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { createPortal } from "react-dom";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import X from "lucide-react/dist/esm/icons/x";
import Star from "lucide-react/dist/esm/icons/star";
import History from "lucide-react/dist/esm/icons/history";
import ChevronDown from "lucide-react/dist/esm/icons/chevron-down";
import FileText from "lucide-react/dist/esm/icons/file-text";
import ArrowUpRight from "lucide-react/dist/esm/icons/arrow-up-right";
import { Badge } from "@ds/Badge";
import { Avatar } from "@ds/Avatar/Avatar";
import { Tooltip } from "@ds/Tooltip";
import {
  getDocumentDetail,
  toggleBookmark,
  archiveDocument,
  dismissResolution,
  type DocumentDetail,
  type RelatedDoc,
} from "@/app/workspace/actions";
import styles from "./document-drawer.module.scss";

// ─── Context ─────────────────────────────────────────────────────────────────

type DrawerMode = "drawer" | "modal";

type DrawerContextValue = {
  openDrawer: (docId: string) => void;
};

const DrawerContext = createContext<DrawerContextValue | null>(null);

export function useDocumentDrawer() {
  const ctx = useContext(DrawerContext);
  if (!ctx) return { openDrawer: () => {} };
  return ctx;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function statusAppearance(status: string) {
  switch (status) {
    case "deprecated":
    case "archived":
      return "negative" as const;
    case "draft":
      return "warning" as const;
    case "in review":
      return "highlight" as const;
    default:
      return "neutral" as const;
  }
}

function stalenessAppearance(flag: string) {
  if (flag === "obsolete") return "negative" as const;
  if (flag === "stale") return "warning" as const;
  return "neutral" as const;
}

const TZ_DRAWER = "America/New_York";

function formatFullDate(dateStr: string | null): string {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-US", {
    timeZone: TZ_DRAWER,
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function relativeDate(dateStr: string | null): string {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  const now = new Date();
  const nowET = new Date(now.toLocaleString("en-US", { timeZone: TZ_DRAWER }));
  const dET = new Date(d.toLocaleString("en-US", { timeZone: TZ_DRAWER }));
  nowET.setHours(0, 0, 0, 0);
  dET.setHours(0, 0, 0, 0);
  const diffDays = Math.round((nowET.getTime() - dET.getTime()) / 86_400_000);
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
  return formatFullDate(dateStr);
}

// ─── Overlap summary builder ─────────────────────────────────────────────────

function buildOverlapSummary(
  doc: DocumentDetail,
  related: RelatedDoc,
): string {
  const parts: string[] = [];

  // 1. Active dependency signals — highest priority, risk of breaking workflows
  const deps: string[] = [];
  if (related.linked_in_tickets > 0)
    deps.push(
      `${related.linked_in_tickets} active ticket${related.linked_in_tickets > 1 ? "s" : ""}`,
    );
  if (related.linked_in_prs > 0)
    deps.push(
      `${related.linked_in_prs} PR${related.linked_in_prs > 1 ? "s" : ""}`,
    );
  if (deps.length > 0) {
    parts.push(`That document is still linked in ${deps.join(" and ")}.`);
  }

  // 2. Freshness delta — helps decide which to keep
  const relatedStale =
    related.staleness_flag === "stale" || related.staleness_flag === "obsolete";
  const docStale =
    doc.staleness_flag === "stale" || doc.staleness_flag === "obsolete";
  if (relatedStale && !docStale) {
    parts.push(
      `That document is flagged ${related.staleness_flag}${related.content_age_days ? ` (${related.content_age_days} days old)` : ""} while this one is active.`,
    );
  } else if (!relatedStale && docStale) {
    parts.push(
      `This document is flagged ${doc.staleness_flag} while that one is still active.`,
    );
  } else if (
    related.content_age_days != null &&
    doc.content_age_days != null &&
    Math.abs(related.content_age_days - doc.content_age_days) > 30
  ) {
    const newer =
      related.content_age_days < doc.content_age_days ? "that" : "this";
    parts.push(
      `Content age differs — ${newer} one is more recent (${Math.min(related.content_age_days, doc.content_age_days)} vs ${Math.max(related.content_age_days, doc.content_age_days)} days).`,
    );
  }

  // 3. Shared context — confirms why the system flagged the overlap
  const sharedTags = (doc.tags ?? []).filter((t) =>
    (related.tags ?? []).includes(t),
  );
  if (doc.category === related.category && sharedTags.length > 0) {
    const tagStr = sharedTags.slice(0, 3).join(", ");
    parts.push(
      `Both are ${related.category} docs tagged ${tagStr}.`,
    );
  } else if (doc.category === related.category) {
    parts.push(`Both are ${related.category} documents.`);
  } else if (sharedTags.length > 0) {
    const tagStr = sharedTags.slice(0, 3).join(", ");
    parts.push(`Shares tags: ${tagStr}.`);
  }

  // 4. Recent activity — signals the doc is alive
  if (parts.length < 2 && related.unique_viewers_30d > 3) {
    parts.push(
      `Viewed by ${related.unique_viewers_30d} people in the last 30 days.`,
    );
  }
  if (parts.length < 2 && related.linked_in_slack > 3) {
    parts.push(
      `Mentioned in ${related.linked_in_slack} Slack threads.`,
    );
  }

  if (parts.length === 0) {
    return "Overlapping content detected.";
  }

  return parts.slice(0, 2).join(" ");
}

// ─── DrawerSection (collapsible wrapper) ─────────────────────────────────────

function DrawerSection({
  label,
  summary,
  defaultExpanded = false,
  children,
}: {
  label: string;
  summary?: string;
  defaultExpanded?: boolean;
  children: ReactNode;
}) {
  const [expanded, setExpanded] = useState(defaultExpanded);

  return (
    <div className={styles.drawerSection}>
      <button
        className={styles.sectionToggle}
        onClick={() => setExpanded((v) => !v)}
        aria-expanded={expanded}
      >
        <ChevronDown
          className={styles.sectionChevron}
          data-expanded={expanded}
        />
        <span className={styles.sectionLabel}>{label}</span>
        {!expanded && summary && (
          <span className={styles.sectionSummary}>{summary}</span>
        )}
      </button>
      <div className={styles.sectionBody} data-expanded={expanded}>
        <div className={styles.sectionInner}>{children}</div>
      </div>
    </div>
  );
}

// ─── Drawer content ──────────────────────────────────────────────────────────

function DrawerContent({
  doc,
  onClose,
}: {
  doc: DocumentDetail;
  onClose: () => void;
}) {
  const showStatus = doc.status !== "current";
  const showStaleness =
    doc.staleness_flag === "stale" || doc.staleness_flag === "obsolete";
  const versionHistory = [...(doc.version_history ?? [])].reverse().slice(0, 5);

  const [bookmarked, setBookmarked] = useState(doc.bookmarked_by_me);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const [archived, setArchived] = useState<Set<string>>(new Set());

  const resolutionDocs = doc.relatedDocs.filter(
    (rd) =>
      (rd.link_type === "supersedes" || rd.link_type === "duplicate_of") &&
      !dismissed.has(rd.id) &&
      !archived.has(rd.id),
  );
  const nonResolutionDocs = doc.relatedDocs.filter(
    (rd) => rd.link_type !== "supersedes" && rd.link_type !== "duplicate_of",
  );

  const handleBookmark = useCallback(async () => {
    const result = await toggleBookmark(doc.id);
    if (result.ok && result.bookmarked !== undefined) {
      setBookmarked(result.bookmarked);
    }
  }, [doc.id]);

  const handleArchive = useCallback(
    async (targetId: string, isSelf: boolean) => {
      const result = await archiveDocument(targetId);
      if (result.ok) {
        if (isSelf) {
          setTimeout(onClose, 300);
        } else {
          setArchived((prev) => new Set(prev).add(targetId));
        }
      }
    },
    [onClose],
  );

  const handleKeepBoth = useCallback(
    async (relatedId: string) => {
      const result = await dismissResolution(doc.id, relatedId);
      if (result.ok) {
        setDismissed((prev) => new Set(prev).add(relatedId));
      }
    },
    [doc.id],
  );

  const handleDismiss = useCallback((relatedId: string) => {
    setDismissed((prev) => new Set(prev).add(relatedId));
  }, []);

  return (
    <>
      {/* ── Toolbar ──────────────────────────────────────────────────────── */}
      <div className={styles.toolbar}>
        <button
          className={styles.toolbarBtn}
          onClick={handleBookmark}
          aria-label={bookmarked ? "Remove bookmark" : "Add bookmark"}
        >
          <Star
            className={styles.bookmarkIcon}
            data-active={bookmarked}
          />
        </button>
        <button
          className={`${styles.toolbarBtn} ${styles.historyBtn}`}
          aria-label={`Version history (${doc.version})`}
          title={doc.version}
        >
          <History />
        </button>
        <button
          className={styles.toolbarBtn}
          onClick={onClose}
          aria-label="Close"
        >
          <X />
        </button>
      </div>

      {/* ── Tier 1: Always visible ───────────────────────────────────────── */}
      <div className={styles.tier1}>
        <h2 className={styles.title}>{doc.title}</h2>
        <div className={styles.docId}>{doc.document_id}</div>

        <div className={styles.badgeRow}>
          <Badge size="xs" appearance="neutral" emphasis="subtle">
            {doc.category}
          </Badge>
          {showStatus && (
            <Badge
              size="xs"
              appearance={statusAppearance(doc.status)}
              emphasis="subtle"
            >
              {doc.status}
            </Badge>
          )}
          {showStaleness && (
            <Badge
              size="xs"
              appearance={stalenessAppearance(doc.staleness_flag)}
              emphasis="subtle"
            >
              {doc.staleness_flag}
            </Badge>
          )}
          {doc.sensitivity !== "internal" && (
            <Badge size="xs" appearance="warning" emphasis="subtle">
              {doc.sensitivity}
            </Badge>
          )}
        </div>

        <div className={styles.metaGrid}>
          <span className={styles.metaLabel}>Owner</span>
          <span className={styles.metaValue}>
            <span className={styles.ownerInline}>
              <Avatar size="sm" name={doc.owner} tone="brand" />
              {doc.owner}
            </span>
          </span>

          <span className={styles.metaLabel}>Last modified</span>
          <span className={styles.metaValue}>
            {relativeDate(doc.last_modified_date)}
            {doc.last_modified_by && ` by ${doc.last_modified_by}`}
          </span>

          <span className={styles.metaLabel}>Folder</span>
          <span className={styles.metaValue}>
            {doc.folder_path || "/unsorted"}
          </span>
        </div>
      </div>

      {/* ── Tier 2: Collapsible properties ───────────────────────────────── */}
      <DrawerSection label="Properties">
        <div className={styles.metaGrid}>
          <span className={styles.metaLabel}>Created by</span>
          <span className={styles.metaValue}>{doc.created_by}</span>

          <span className={styles.metaLabel}>Created</span>
          <span className={styles.metaValue}>
            {formatFullDate(doc.created_date)}
          </span>

          <span className={styles.metaLabel}>Version</span>
          <span className={styles.metaValue}>{doc.version}</span>

          {doc.projects?.length > 0 && (
            <>
              <span className={styles.metaLabel}>Projects</span>
              <span className={styles.metaValue}>
                {doc.projects
                  .map((p) => p.replace("project-", ""))
                  .join(", ")}
              </span>
            </>
          )}

          {doc.content_age_days != null && (
            <>
              <span className={styles.metaLabel}>Content age</span>
              <span className={styles.metaValue}>
                {doc.content_age_days} days
              </span>
            </>
          )}

          {doc.review_due_date && (
            <>
              <span className={styles.metaLabel}>Review due</span>
              <span className={styles.metaValue}>
                {formatFullDate(doc.review_due_date)}
              </span>
            </>
          )}

          {doc.last_verified_date && (
            <>
              <span className={styles.metaLabel}>Verified</span>
              <span className={styles.metaValue}>
                {formatFullDate(doc.last_verified_date)}
                {doc.last_verified_by && ` by ${doc.last_verified_by}`}
              </span>
            </>
          )}
        </div>

        {doc.tags?.length > 0 && (
          <div className={styles.tagList}>
            {doc.tags.map((tag) => (
              <span key={tag} className={styles.tag}>
                {tag}
              </span>
            ))}
          </div>
        )}

        {doc.contributors?.length > 0 && (
          <div className={styles.contributorList}>
            {doc.contributors
              .filter((name) => name.length > 1)
              .map((name, i) => (
                <div key={`${i}-${name}`} className={styles.contributorItem}>
                  <Avatar size="sm" name={name} tone="neutral" />
                  <span className={styles.contributorName}>{name}</span>
                </div>
              ))}
          </div>
        )}
      </DrawerSection>

      {/* ── Document content ────────────────────────────────────────────── */}
      {doc.content && (
        <div className={styles.contentSection}>
          <div className={styles.contentBody}>
            <Markdown remarkPlugins={[remarkGfm]}>{doc.content}</Markdown>
          </div>
        </div>
      )}

      {/* ── Related documents ─────────────────────────────────────────────── */}
      {nonResolutionDocs.length > 0 && (
        <div className={styles.relatedSection}>
          <span className={styles.relatedLabel}>Related documents</span>
          <div className={styles.relatedList}>
            {nonResolutionDocs.map((rd) => (
              <div key={rd.id} className={styles.relatedItem}>
                <FileText className={styles.relatedIcon} />
                <Tooltip
                  content={
                    rd.link_type === "references"
                      ? `References — cited as a source or dependency.`
                      : rd.link_type === "informs"
                        ? `Informs — this document's findings shaped that one.`
                        : rd.link_type === "related"
                          ? `Related — shares topics or context.`
                          : `Linked document.`
                  }
                  size="sm"
                  side="top"
                  align="start"
                  delayDuration={600}
                >
                  <span className={styles.relatedTitle}>{rd.title}</span>
                </Tooltip>
                <ArrowUpRight className={styles.relatedArrow} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Resolution ───────────────────────────────────────────────────── */}
      {resolutionDocs.length > 0 && (
        <div className={styles.resolutionSection}>
          <span className={styles.resolutionLabel}>Needs resolution</span>
          {resolutionDocs.map((rd) => (
            <ResolutionCard
              key={rd.id}
              doc={doc}
              related={rd}
              onArchive={handleArchive}
              onKeepBoth={handleKeepBoth}
              onDismiss={handleDismiss}
            />
          ))}
        </div>
      )}

      {/* ── Tier 3: Collapsed sections ───────────────────────────────────── */}
      <DrawerSection
        label="Activity"
        summary={`${doc.total_views} views · ${doc.unique_viewers_30d} viewers (30d) · ${doc.total_edits} edits`}
      >
        <div className={styles.statGrid}>
          <div className={styles.stat}>
            <span className={styles.statNumber}>{doc.total_views}</span>
            <span className={styles.statCaption}>Total views</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statNumber}>
              {doc.unique_viewers_30d}
            </span>
            <span className={styles.statCaption}>Viewers (30d)</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statNumber}>{doc.total_edits}</span>
            <span className={styles.statCaption}>Total edits</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statNumber}>{doc.linked_in_slack}</span>
            <span className={styles.statCaption}>Slack mentions</span>
          </div>
        </div>
      </DrawerSection>

      {versionHistory.length > 0 && (
        <DrawerSection
          label="Version history"
          summary={`${versionHistory.length} version${versionHistory.length !== 1 ? "s" : ""}`}
        >
          <div className={styles.versionList}>
            {versionHistory.map((v) => (
              <div key={v.version} className={styles.versionItem}>
                <span className={styles.versionDot} />
                <span className={styles.versionTag}>{v.version}</span>
                <span>{v.author}</span>
                <span style={{ marginLeft: "auto" }}>
                  {formatFullDate(v.date)}
                </span>
              </div>
            ))}
          </div>
        </DrawerSection>
      )}

      <DrawerSection
        label="Audit"
        summary={
          doc.last_commented_on
            ? `Last comment ${relativeDate(doc.last_commented_on)}`
            : "No comments"
        }
      >
        <div className={styles.metaGrid}>
          {doc.last_commented_on && (
            <>
              <span className={styles.metaLabel}>Last comment</span>
              <span className={styles.metaValue}>
                {relativeDate(doc.last_commented_on)}
                {doc.last_commented_by &&
                  ` by ${doc.last_commented_by}`}
              </span>
            </>
          )}
          <span className={styles.metaLabel}>Linked in PRs</span>
          <span className={styles.metaValue}>{doc.linked_in_prs}</span>

          <span className={styles.metaLabel}>In tickets</span>
          <span className={styles.metaValue}>{doc.linked_in_tickets}</span>
        </div>
      </DrawerSection>
    </>
  );
}

// ─── Resolution card ─────────────────────────────────────────────────────────

function ResolutionCard({
  doc,
  related,
  onArchive,
  onKeepBoth,
  onDismiss,
}: {
  doc: DocumentDetail;
  related: RelatedDoc;
  onArchive: (targetId: string, isSelf: boolean) => void;
  onKeepBoth: (relatedId: string) => void;
  onDismiss: (relatedId: string) => void;
}) {
  const { openDrawer } = useDocumentDrawer();

  const metaLine = [
    related.category,
    relativeDate(related.last_modified_date),
  ]
    .filter(Boolean)
    .join(" · ");

  if (related.link_type === "supersedes") {
    const isNewer = related.direction === "outgoing";
    return (
      <div className={styles.resolutionCard}>
        <div className={styles.resolutionHeader}>
          <FileText className={styles.relatedIcon} />
          <div className={styles.resolutionTitleGroup}>
            <span className={styles.resolutionHeadline}>
              {isNewer ? "Supersedes" : "Superseded by"}
            </span>
            <button
              className={styles.resolutionTitleLink}
              onClick={() => openDrawer(related.id)}
            >
              {related.title}
              <ArrowUpRight className={styles.resolutionLinkArrow} />
            </button>
            {metaLine && (
              <span className={styles.resolutionMeta}>{metaLine}</span>
            )}
          </div>
        </div>
        <p className={styles.resolutionDesc}>
          {buildOverlapSummary(doc, related)}
        </p>
        <div className={styles.resolutionActions}>
          <button
            className={styles.resolutionBtn}
            onClick={() =>
              onArchive(isNewer ? related.id : doc.id, !isNewer)
            }
          >
            {isNewer ? "Archive older version" : "Archive this document"}
          </button>
          <button
            className={styles.resolutionBtnSecondary}
            onClick={() => onKeepBoth(related.id)}
          >
            Keep both
          </button>
          <button
            className={styles.resolutionBtnSecondary}
            onClick={() => onDismiss(related.id)}
          >
            Dismiss
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.resolutionCard}>
      <div className={styles.resolutionHeader}>
        <FileText className={styles.relatedIcon} />
        <div className={styles.resolutionTitleGroup}>
          <span className={styles.resolutionHeadline}>
            Possible duplicate
          </span>
          <button
            className={styles.resolutionTitleLink}
            onClick={() => openDrawer(related.id)}
          >
            {related.title}
            <ArrowUpRight className={styles.resolutionLinkArrow} />
          </button>
          {metaLine && (
            <span className={styles.resolutionMeta}>{metaLine}</span>
          )}
        </div>
      </div>
      <p className={styles.resolutionDesc}>
        {buildOverlapSummary(doc, related)}
      </p>
      <div className={styles.resolutionActions}>
        <button
          className={styles.resolutionBtn}
          onClick={() => onArchive(doc.id, true)}
        >
          Archive this one
        </button>
        <button
          className={styles.resolutionBtn}
          onClick={() => onArchive(related.id, false)}
        >
          Archive that one
        </button>
        <button
          className={styles.resolutionBtnSecondary}
          onClick={() => onKeepBoth(related.id)}
        >
          Keep both
        </button>
        <button
          className={styles.resolutionBtnSecondary}
          onClick={() => onDismiss(related.id)}
        >
          Dismiss
        </button>
      </div>
    </div>
  );
}

// ─── Drawer provider ─────────────────────────────────────────────────────────

export function DocumentDrawerProvider({
  children,
  mode = "drawer",
}: {
  children: React.ReactNode;
  mode?: DrawerMode;
}) {
  return (
    <Suspense fallback={children}>
      <DrawerProviderInner mode={mode}>{children}</DrawerProviderInner>
    </Suspense>
  );
}

function DrawerProviderInner({
  children,
  mode,
}: {
  children: React.ReactNode;
  mode: DrawerMode;
}) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const urlDocId = searchParams.get("doc");

  const [activeDocId, setActiveDocId] = useState<string | null>(urlDocId);
  const [doc, setDoc] = useState<DocumentDetail | null>(null);
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);
  const [clientReady, setClientReady] = useState(false);
  const [isPending, startTransition] = useTransition();
  const panelRef = useRef<HTMLDivElement>(null);
  const prevIdRef = useRef<string | null>(null);

  useEffect(() => {
    setClientReady(true);
  }, []);

  // Sync URL → local state (handles deep-links and back/forward)
  useEffect(() => {
    if (urlDocId && urlDocId !== activeDocId) {
      setActiveDocId(urlDocId);
    } else if (!urlDocId && activeDocId) {
      setActiveDocId(null);
    }
  }, [urlDocId]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (activeDocId && activeDocId !== prevIdRef.current) {
      setDoc(null);
      setMounted(true);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setVisible(true);
        });
      });
      startTransition(async () => {
        const detail = await getDocumentDetail(activeDocId);
        setDoc(detail);
      });
    } else if (!activeDocId && prevIdRef.current) {
      setVisible(false);
      const timer = setTimeout(() => {
        setMounted(false);
        setDoc(null);
      }, 420);
      return () => clearTimeout(timer);
    }
    prevIdRef.current = activeDocId;
  }, [activeDocId, startTransition]);

  useEffect(() => {
    if (visible) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [visible]);

  const openDrawer = useCallback(
    (docId: string) => {
      // Open immediately via local state (don't wait for URL round-trip)
      setActiveDocId(docId);

      // Also update URL for deep-linking and persistence
      const params = new URLSearchParams(searchParams.toString());
      params.set("doc", docId);
      const url = `${pathname}?${params.toString()}`;
      router.replace(url, { scroll: false });
    },
    [searchParams, router, pathname],
  );

  const close = useCallback(() => {
    setActiveDocId(null);

    const params = new URLSearchParams(searchParams.toString());
    params.delete("doc");
    const qs = params.toString();
    const url = qs ? `${pathname}?${qs}` : pathname;
    router.replace(url, { scroll: false });
  }, [searchParams, router, pathname]);

  useEffect(() => {
    if (!visible) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") close();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [visible, close]);

  const ctxValue = { openDrawer };

  return (
    <DrawerContext.Provider value={ctxValue}>
      {children}
      {clientReady &&
        mounted &&
        createPortal(
          <>
            <div
              className={mode === "modal" ? styles.modalBackdrop : styles.backdrop}
              data-open={visible}
              onClick={close}
            />
            <div
              ref={panelRef}
              className={mode === "modal" ? styles.modal : styles.drawer}
              data-open={visible}
              role="dialog"
              aria-label="Document details"
            >
              {isPending ? (
                <div className={styles.body}>
                  <div className={styles.tier1}>
                    <h2 className={styles.title}>Loading…</h2>
                  </div>
                  <div className={styles.loading}>
                    Loading document details…
                  </div>
                </div>
              ) : !doc ? (
                <div className={styles.body}>
                  <div className={styles.toolbar}>
                    <button
                      className={styles.toolbarBtn}
                      onClick={close}
                      aria-label="Close"
                      style={{ marginLeft: "auto" }}
                    >
                      <X />
                    </button>
                  </div>
                  <div className={styles.loading}>
                    Document not found.
                  </div>
                </div>
              ) : (
                <div className={styles.body}>
                  <DrawerContent doc={doc} onClose={close} />
                </div>
              )}
            </div>
          </>,
          document.body,
        )}
    </DrawerContext.Provider>
  );
}
