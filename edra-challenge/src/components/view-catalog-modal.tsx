"use client";

import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import X from "lucide-react/dist/esm/icons/x";
import Search from "lucide-react/dist/esm/icons/search";
import Plus from "lucide-react/dist/esm/icons/plus";
import Check from "lucide-react/dist/esm/icons/check";
import ChevronLeft from "lucide-react/dist/esm/icons/chevron-left";
import ChevronRight from "lucide-react/dist/esm/icons/chevron-right";
import Folder from "lucide-react/dist/esm/icons/folder";
import FolderOpen from "lucide-react/dist/esm/icons/folder-open";
import FileText from "lucide-react/dist/esm/icons/file-text";
import Gauge from "lucide-react/dist/esm/icons/gauge";
import Lock from "lucide-react/dist/esm/icons/lock";
import { Badge } from "@ds/Badge";
import { ExpandCollapse } from "@ds/ExpandCollapse";
import { InfoTooltip, Tooltip } from "@ds/Tooltip";
import type { ViewSummary, FolderPreview } from "@/lib/queries";
import styles from "./view-catalog-modal.module.scss";
import ft from "./folder-tree.module.scss";

const CATEGORY_ORDER: { key: string; label: string }[] = [
  { key: "project", label: "Project & Structure" },
  { key: "people", label: "People & Teams" },
  { key: "temporal", label: "Timeline" },
  { key: "behavioral", label: "Activity & Engagement" },
  { key: "calendar", label: "Calendar" },
  { key: "health", label: "Health & Hygiene" },
  { key: "intent", label: "By Purpose" },
  { key: "sensitivity", label: "Access & Sensitivity" },
  { key: "relationship", label: "Connections" },
  { key: "composite", label: "Smart Views" },
];

function generateSignature(viewId: string): number[] {
  let hash = 0;
  for (const ch of viewId)
    hash = ((hash << 5) - hash + ch.charCodeAt(0)) | 0;
  const len = 5 + Math.abs(hash % 4);
  return Array.from({ length: len }, (_, i) => {
    const seed = Math.abs((hash * (i + 1) * 2654435761) | 0);
    return seed % 3;
  });
}

const DEPTH_WIDTH = [70, 55, 40] as const;
const DEPTH_MARGIN = [0, 14, 28] as const;

const TEAM_SIZE = 20;
const MAX_VISIBLE = 2;

const AVATAR_COLORS = [
  "#6366f1", "#059669", "#d97706", "#dc2626", "#7c3aed",
  "#0891b2", "#be185d", "#4f46e5", "#65a30d", "#ea580c",
] as const;

function avatarColor(initials: string): string {
  let h = 0;
  for (const ch of initials) h = ((h << 5) - h + ch.charCodeAt(0)) | 0;
  return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length];
}

function getCollaboratorInfo(view: ViewSummary) {
  if (view.visibility === "private") return { visible: [], overflow: 0, total: 0 };
  const collabs = view.sharedWith ?? [];
  const visible = collabs.slice(0, MAX_VISIBLE);
  const overflow =
    view.visibility === "team"
      ? TEAM_SIZE - collabs.length
      : Math.max(0, collabs.length - MAX_VISIBLE);
  return { visible, overflow, total: view.visibility === "team" ? TEAM_SIZE : collabs.length };
}

function AvatarGroup({ view }: { view: ViewSummary }) {
  const { visible, overflow } = getCollaboratorInfo(view);
  if (view.visibility === "private") {
    return (
      <span className={styles.lockIcon} aria-label="Private view">
        <Lock size={14} />
      </span>
    );
  }
  if (visible.length === 0) return null;
  return (
    <div className={styles.avatarGroup}>
      {visible.map((m, i) => (
        <span
          key={m.initials}
          className={styles.avatar}
          style={{ background: avatarColor(m.initials), zIndex: visible.length - i }}
        >
          {m.initials}
        </span>
      ))}
      {overflow > 0 && (
        <span className={`${styles.avatar} ${styles.avatarOverflow}`}>
          +{overflow}
        </span>
      )}
    </div>
  );
}

function TileThumbnail({
  viewId,
  isActive,
  onDetailClick,
}: {
  viewId: string;
  isActive: boolean;
  onDetailClick?: () => void;
}) {
  const bars = generateSignature(viewId);
  return (
    <div className={styles.thumbnail}>
      {bars.map((depth, i) => (
        <div
          key={i}
          className={styles.bar}
          style={{
            width: `${DEPTH_WIDTH[depth]}%`,
            marginLeft: DEPTH_MARGIN[depth],
          }}
        />
      ))}
      {isActive && (
        <span className={styles.checkBadge}>
          <Check size={12} strokeWidth={3} />
        </span>
      )}
      <div className={styles.hoverOverlay}>
        <button
          type="button"
          className={styles.hoverLabel}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onDetailClick?.();
          }}
        >
          See View Details
        </button>
      </div>
    </div>
  );
}

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

const REPLACEMENT_POOL = [
  { title: "API Rate-Limit Policy v2", status: "current" },
  { title: "Incident Postmortem — Feb 2025", status: "current" },
  { title: "Data Retention Guidelines", status: "draft" },
  { title: "Feature Flag Rollout Checklist", status: "current" },
  { title: "Accessibility Audit Results Q1", status: "in review" },
  { title: "Cross-Team Handoff Template", status: "current" },
  { title: "Performance Budget Baseline", status: "current" },
  { title: "Design Token Migration Plan", status: "draft" },
  { title: "Vendor Evaluation Matrix", status: "current" },
  { title: "Runbook — Cache Invalidation", status: "current" },
];

function pickReplacement(usedTitles: Set<string>, seed: number): { title: string; status: string } {
  const available = REPLACEMENT_POOL.filter((d) => !usedTitles.has(d.title));
  if (available.length === 0) return REPLACEMENT_POOL[seed % REPLACEMENT_POOL.length];
  return available[seed % available.length];
}

type DocState = {
  title: string;
  status: string;
  confirmed: boolean;
  swapKey: number;
};

function SampleDocRow({
  doc,
  onConfirm,
  onReject,
}: {
  doc: DocState;
  onConfirm: () => void;
  onReject: () => void;
}) {
  return (
    <div
      key={doc.swapKey}
      className={`${ft.row} ${doc.swapKey > 0 ? ft.docRowSwap : ""}`}
    >
      <div className={ft.cellName} style={{ paddingLeft: 28 }}>
        <FileText className={ft.fileIcon} />
        <span className={ft.nameText}>{doc.title}</span>
        {doc.confirmed ? (
          <span className={ft.confirmedLabel}>
            <Check size={11} strokeWidth={3} />
            Confirmed
          </span>
        ) : (
          <span className={ft.docActions}>
            <button
              type="button"
              className={`${ft.actionBtn} ${ft.actionBtnConfirm}`}
              onClick={(e) => { e.stopPropagation(); onConfirm(); }}
              aria-label={`Confirm ${doc.title}`}
            >
              <Check size={13} strokeWidth={2.5} />
            </button>
            <button
              type="button"
              className={`${ft.actionBtn} ${ft.actionBtnReject}`}
              onClick={(e) => { e.stopPropagation(); onReject(); }}
              aria-label={`Replace ${doc.title}`}
            >
              <X size={13} strokeWidth={2.5} />
            </button>
          </span>
        )}
      </div>
      <div className={`${ft.cell} ${ft.cellStatus}`}>
        {doc.status !== "current" && (
          <Badge
            size="xxs"
            appearance={statusAppearance(doc.status)}
            emphasis="subtle"
          >
            {doc.status}
          </Badge>
        )}
      </div>
    </div>
  );
}

function PreviewFolder({
  folder,
  onConfirmedChange,
}: {
  folder: FolderPreview;
  onConfirmedChange?: (folderName: string, confirmed: number, total: number) => void;
}) {
  const [open, setOpen] = useState(false);
  const hasDocs = folder.docCount > 0;

  const [docs, setDocs] = useState<DocState[]>(() =>
    folder.sampleDocs.map((d) => ({ ...d, confirmed: false, swapKey: 0 })),
  );
  const swapCounter = useRef(0);

  const handleConfirm = useCallback((index: number) => {
    setDocs((prev) => {
      const next = prev.map((d, i) => (i === index ? { ...d, confirmed: true } : d));
      onConfirmedChange?.(folder.name, next.filter((d) => d.confirmed).length, next.length);
      return next;
    });
  }, [folder.name, onConfirmedChange]);

  const handleReject = useCallback((index: number) => {
    setDocs((prev) => {
      const usedTitles = new Set(prev.map((d) => d.title));
      swapCounter.current += 1;
      const replacement = pickReplacement(usedTitles, swapCounter.current + index);
      return prev.map((d, i) =>
        i === index
          ? { ...replacement, confirmed: false, swapKey: swapCounter.current }
          : d,
      );
    });
  }, []);

  return (
    <>
      <div
        className={`${ft.row} ${ft.folderRow}`}
        onClick={hasDocs ? () => setOpen((v) => !v) : undefined}
        role={hasDocs ? "button" : undefined}
        tabIndex={hasDocs ? 0 : undefined}
        aria-expanded={hasDocs ? open : undefined}
      >
        <div className={ft.cellName} style={{ paddingLeft: 8 }}>
          <ChevronRight
            className={`${ft.chevron} ${open ? ft.chevronOpen : ""} ${!hasDocs ? ft.chevronHidden : ""}`}
          />
          {open ? (
            <FolderOpen className={ft.folderIcon} />
          ) : (
            <Folder className={ft.folderIcon} />
          )}
          <span className={ft.nameText}>{folder.name}</span>
        </div>
        <div className={ft.cell}>
          {folder.docCount} item{folder.docCount !== 1 ? "s" : ""}
        </div>
      </div>

      <ExpandCollapse open={open}>
        <div>
          {docs.map((doc, i) => (
            <SampleDocRow
              key={`${doc.title}-${doc.swapKey}`}
              doc={doc}
              onConfirm={() => handleConfirm(i)}
              onReject={() => handleReject(i)}
            />
          ))}
        </div>
      </ExpandCollapse>
    </>
  );
}

const CONFIDENCE_ANGLE: Record<string, number> = { low: 0.25, moderate: 0.55, high: 0.9 };

function GaugeAnimation({ from, to }: { from: string; to: string }) {
  const r = 18;
  const cx = 24;
  const cy = 28;
  const circumference = Math.PI * r;

  const fromPct = CONFIDENCE_ANGLE[from] ?? 0.25;
  const toPct = CONFIDENCE_ANGLE[to] ?? 0.9;

  const fromColor = from === "low" ? "var(--portfolio-text-negative)" : "var(--portfolio-text-warning)";
  const toColor = to === "high" ? "var(--portfolio-text-positive)" : "var(--portfolio-text-warning)";

  const [animated, setAnimated] = useState(false);
  useEffect(() => {
    const t = requestAnimationFrame(() => setAnimated(true));
    return () => cancelAnimationFrame(t);
  }, []);

  const dashoffset = animated
    ? circumference * (1 - toPct)
    : circumference * (1 - fromPct);

  const arcPath = `M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`;

  return (
    <svg viewBox="0 0 48 32" className={styles.gaugeWrapper}>
      <path d={arcPath} className={`${styles.gaugeArc} ${styles.gaugeTrack}`} />
      <path
        d={arcPath}
        className={`${styles.gaugeArc} ${styles.gaugeFill}`}
        stroke={animated ? toColor : fromColor}
        strokeDasharray={circumference}
        strokeDashoffset={dashoffset}
      />
    </svg>
  );
}

function ContentPreview({
  view,
  onAllConfirmed,
}: {
  view: ViewSummary;
  onAllConfirmed?: (allDone: boolean) => void;
}) {
  const previews = view.folderPreviews ?? [];
  if (previews.length === 0) return null;

  const remainingFolders = view.folderCount - previews.length;
  const totalSampleDocs = previews.reduce((sum, f) => sum + f.sampleDocs.length, 0);
  const progressRef = useRef(new Map<string, { confirmed: number; total: number }>());
  const firedRef = useRef(false);
  const [allConfirmed, setAllConfirmed] = useState(false);

  const handleFolderConfirmedChange = useCallback(
    (folderName: string, confirmed: number, total: number) => {
      progressRef.current.set(folderName, { confirmed, total });
      let totalConfirmed = 0;
      let totalTracked = 0;
      for (const v of progressRef.current.values()) {
        totalConfirmed += v.confirmed;
        totalTracked += v.total;
      }
      const allDone = totalTracked >= totalSampleDocs && totalConfirmed >= totalTracked;
      if (allDone && !firedRef.current) {
        firedRef.current = true;
        setAllConfirmed(true);
        onAllConfirmed?.(true);
      }
    },
    [totalSampleDocs, onAllConfirmed],
  );

  const originalLevel = view.confidenceLevel ?? "high";
  const boostedLevel = bumpConfidence(view.confidenceLevel);

  return (
    <>
      {allConfirmed ? (
        <div className={styles.celebrationBanner}>
          <GaugeAnimation from={originalLevel} to={boostedLevel} />
          <div className={styles.celebrationText}>
            <span className={styles.celebrationTitle}>
              Thanks for confirming!
            </span>
            <span className={styles.celebrationSub}>
              Confidence updated from {displayTier(originalLevel)} to {displayTier(boostedLevel)}.
            </span>
          </div>
        </div>
      ) : (
        <p className={styles.validationPrompt}>
          Do these sample documents look like they belong in this view?
        </p>
      )}
      <div className={`${ft.tree} ${ft.treeCompact}`}>
        <div className={ft.headerRow}>
          <div className={`${ft.cellName} ${ft.headerCell}`}>Name</div>
          <div className={`${ft.cell} ${ft.headerCell}`}>Contents</div>
        </div>
      {previews.map((folder) => (
        <PreviewFolder
          key={folder.name}
          folder={folder}
          onConfirmedChange={handleFolderConfirmedChange}
        />
      ))}
      {remainingFolders > 0 && (
        <div className={ft.row}>
          <div className={ft.cellName} style={{ paddingLeft: 8 }}>
            <span className={ft.nameText} style={{ color: "var(--portfolio-text-secondary)" }}>
              + {remainingFolders} more folder{remainingFolders > 1 ? "s" : ""}
            </span>
          </div>
          <div className={ft.cell} />
        </div>
      )}
    </div>
    </>
  );
}

const EVIDENCE_DETAIL_POOL = [
  'Jun 7 Sprint Planning agenda references "API rate-limit policy"',
  "Aug 10 Design Review invite links 3 docs from this view",
  'Jul 22 Retro notes mention "cache invalidation runbook"',
  "Sep 3 Stakeholder Sync shared the vendor evaluation doc",
  "Jun 14 On-call Handoff includes incident postmortem link",
  'Aug 28 Architecture Review agenda item: "token migration"',
  "Jul 9 Weekly Standup notes tag performance budget baseline",
  "Oct 1 Launch Readiness checklist references feature flag rollout",
  "Sep 18 Accessibility Review cites audit results Q1",
  "Jun 30 Cross-team Handoff meeting attached the template doc",
  'Aug 5 Product Sync agenda mentions "data retention"',
  "Jul 17 Security Review invite includes access-control docs",
];

function pickEvidenceDetails(viewId: string, count: number): string[] {
  let hash = 0;
  for (const ch of viewId)
    hash = ((hash << 5) - hash + ch.charCodeAt(0)) | 0;
  const result: string[] = [];
  const used = new Set<number>();
  for (let i = 0; result.length < count && i < EVIDENCE_DETAIL_POOL.length; i++) {
    const idx = Math.abs((hash * (i + 1) * 2654435761) | 0) % EVIDENCE_DETAIL_POOL.length;
    if (!used.has(idx)) {
      used.add(idx);
      result.push(EVIDENCE_DETAIL_POOL[idx]);
    }
  }
  return result;
}

function EvidenceSummary({ view }: { view: ViewSummary }) {
  const lines = view.evidenceSummary;
  if (!lines || lines.length === 0) return null;

  const details = pickEvidenceDetails(view.id, 3);

  return (
    <div className={styles.detailSection}>
      <h4 className={styles.detailSectionTitle}>Evidence</h4>
      <div className={styles.evidenceLines}>
        {lines.map((line) => (
          <div key={line.label} className={styles.evidenceLine}>
            <span className={styles.evidenceValue}>{line.value}</span>
            <span>{line.label}</span>
          </div>
        ))}
      </div>
      {details.length > 0 && (
        <ul className={styles.evidenceDetails}>
          {details.map((d) => (
            <li key={d} className={styles.evidenceDetail}>{d}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

function SharingLabel({ view }: { view: ViewSummary }) {
  if (view.isSystem && view.visibility === "private") {
    return <span className={styles.sharingLine}>Generated for you</span>;
  }
  if (view.visibility === "team") {
    return <span className={styles.sharingLine}>Team-wide</span>;
  }
  if (view.visibility === "private") {
    return <span className={styles.sharingLine}>Private to you</span>;
  }
  const names = (view.sharedWith ?? []).map((c) => c.name);
  if (names.length === 0) return null;
  const shown = names.slice(0, 3);
  const rest = names.length - shown.length;
  return (
    <ul className={styles.sharingList}>
      {shown.map((name) => (
        <li key={name} className={styles.sharingName}>{name}</li>
      ))}
      {rest > 0 && <li className={styles.sharingOverflow}>and {rest} other{rest > 1 ? "s" : ""}</li>}
    </ul>
  );
}

function bumpConfidence(level: string | null): "high" | "moderate" | "low" {
  if (level === "low") return "moderate";
  if (level === "moderate") return "high";
  return "high";
}

function displayTier(level: string | null): "High" | "Moderate" | "Low" {
  if (level === "high") return "High";
  if (level === "moderate") return "Moderate";
  if (level === "low") return "Low";
  return "High";
}

function tierAppearance(level: string | null) {
  if (level === "high") return "positive" as const;
  if (level === "moderate") return "warning" as const;
  return "negative" as const;
}

function confidenceReasoning(level: string | null, docCount: number, avgConfidence: number | null): string {
  const pct = avgConfidence != null ? Math.round(avgConfidence * 100) : 100;

  if (level === "high" || level == null) {
    return `${pct}% avg placement confidence — strong signal alignment across ${docCount} docs.`;
  }
  if (level === "moderate") {
    return `${pct}% avg confidence — some placements have weak signal. Review suggested.`;
  }
  return `${pct}% avg confidence — many placements uncertain. Multiple docs lack clear category signals.`;
}

function ViewDetail({
  view,
  categoryLabel,
  totalDocCount,
  onBack,
  onClose,
}: {
  view: ViewSummary;
  categoryLabel: string;
  totalDocCount: number;
  onBack: () => void;
  onClose: () => void;
}) {
  const scopeText = view.isFiltered
    ? `${view.docCount} of ${totalDocCount} documents`
    : `All ${view.docCount} documents`;

  const [boosted, setBoosted] = useState(false);
  const effectiveLevel = boosted
    ? bumpConfidence(view.confidenceLevel)
    : (view.confidenceLevel ?? "high");

  const handleAllConfirmed = useCallback(() => {
    setBoosted(true);
  }, []);

  return (
    <>
      <div className={styles.header}>
        <div className={styles.detailBreadcrumb}>
          <button
            type="button"
            className={styles.backBtn}
            onClick={onBack}
            aria-label="Back to all views"
          >
            <ChevronLeft size={16} />
          </button>
          <span className={styles.breadcrumbText}>
            {categoryLabel}
          </span>
        </div>
        <button className={styles.closeBtn} onClick={onClose} aria-label="Close">
          <X size={18} />
        </button>
      </div>

      <div className={styles.detailBody}>
        <div className={styles.detailInfo}>
          <h3 className={styles.detailViewName}>{view.name}</h3>
          {view.description && (
            <div className={styles.detailSection}>
              <h4 className={styles.detailSectionTitle}>
                About this view
                <InfoTooltip
                  content={view.sourceTooltip ?? "A short summary of what this view surfaces and why it exists"}
                  contextSize="xs"
                  side="top"
                  align="start"
                />
              </h4>
              <p className={styles.detailDesc}>{view.description}</p>
            </div>
          )}

          <div className={styles.detailSection}>
            <h4 className={styles.detailSectionTitle}>Scope</h4>
            <div className={styles.detailScope}>
              <span className={styles.scopeBadge}>
                {view.isFiltered ? "Filtered" : "Full corpus"}
              </span>
              {scopeText}
            </div>
          </div>

          <div className={styles.detailSection}>
            <h4 className={styles.detailSectionTitle}>Confidence</h4>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Tooltip
                content={confidenceReasoning(effectiveLevel, view.docCount, view.avgConfidence)}
                side="top"
                align="start"
                size="sm"
              >
                <span style={{ display: "inline-flex" }}>
                  <Badge
                    appearance={tierAppearance(effectiveLevel)}
                    emphasis={effectiveLevel === "high" ? "minimal" : "subtle"}
                    size="xs"
                    shape="pill"
                  >
                    <Gauge size={11} style={{ marginRight: 3 }} />
                    {displayTier(effectiveLevel)}
                  </Badge>
                </span>
              </Tooltip>
            </div>
          </div>

          {view.topFolders.length > 0 && (
            <div className={styles.detailSection}>
              <h4 className={styles.detailSectionTitle}>Folders</h4>
              <div className={styles.folderChips}>
                {view.topFolders.map((name) => (
                  <span key={name} className={styles.folderChip}>{name}</span>
                ))}
              </div>
              {view.folderCount > view.topFolders.length && (
                <span className={styles.folderMore}>
                  + {view.folderCount - view.topFolders.length} more folder
                  {view.folderCount - view.topFolders.length > 1 ? "s" : ""}
                </span>
              )}
            </div>
          )}

          <EvidenceSummary view={view} />

          <div className={styles.detailSection}>
            <h4 className={styles.detailSectionTitle}>Sharing</h4>
            <SharingLabel view={view} />
          </div>
        </div>

        <div className={styles.detailPreview}>
          <ContentPreview view={view} onAllConfirmed={handleAllConfirmed} />
        </div>
      </div>

      <div className={styles.footer}>
        <button
          type="button"
          className={styles.applyBtn}
          onClick={() => {
            window.location.href = `?view=${view.id}`;
          }}
        >
          Apply View
        </button>
      </div>
    </>
  );
}

const SCRATCH_OPTIONS = [
  { id: "blank", label: "Start from scratch", description: "Blank view" },
  { id: "outline", label: "Start with an outline", description: "Summarize a folder" },
  { id: "template", label: "Make a template", description: "Create a reusable view" },
] as const;

export function ViewCatalogModal({
  open,
  onClose,
  views,
  currentViewId,
}: {
  open: boolean;
  onClose: () => void;
  views: ViewSummary[];
  currentViewId: string;
}) {
  const [detailViewId, setDetailViewId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const handleClose = useCallback(() => {
    setDetailViewId(null);
    setSearchQuery("");
    onClose();
  }, [onClose]);

  useEffect(() => {
    if (!open) {
      setDetailViewId(null);
      setSearchQuery("");
      return;
    }
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (detailViewId) {
          setDetailViewId(null);
        } else {
          handleClose();
        }
      }
    };
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [open, detailViewId, handleClose]);

  const filteredViews = useMemo(() => {
    if (!searchQuery.trim()) return views;
    const q = searchQuery.toLowerCase();
    return views.filter(
      (v) =>
        v.name.toLowerCase().includes(q) ||
        (v.description?.toLowerCase().includes(q) ?? false),
    );
  }, [views, searchQuery]);

  const systemViews = useMemo(
    () => filteredViews.filter((v) => v.isSystem),
    [filteredViews],
  );

  const userViews = useMemo(
    () => filteredViews.filter((v) => !v.isSystem),
    [filteredViews],
  );

  if (!open) return null;

  const viewsByCategory = new Map<string, ViewSummary[]>();
  const categoryLabelMap = new Map<string, string>();
  for (const { key, label } of CATEGORY_ORDER) categoryLabelMap.set(key, label);
  for (const v of userViews) {
    const list = viewsByCategory.get(v.category) ?? [];
    list.push(v);
    viewsByCategory.set(v.category, list);
  }

  const detailView = detailViewId ? views.find((v) => v.id === detailViewId) : null;

  const totalDocCount = views.reduce(
    (max, v) => (!v.isFiltered && v.docCount > max ? v.docCount : max),
    0,
  );

  return (
    <div className={styles.overlay} onClick={handleClose}>
      <div className={styles.dialog} onClick={(e) => e.stopPropagation()}>
        {detailView ? (
          <ViewDetail
            view={detailView}
            categoryLabel={categoryLabelMap.get(detailView.category) ?? detailView.category}
            totalDocCount={totalDocCount}
            onBack={() => setDetailViewId(null)}
            onClose={handleClose}
          />
        ) : (
          <>
            <div className={styles.header}>
              <div className={styles.searchBar}>
                <Search size={16} className={styles.searchIcon} />
                <input
                  className={styles.searchInput}
                  type="text"
                  placeholder="Search templates"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoFocus
                />
              </div>
              <button
                className={styles.closeBtn}
                onClick={handleClose}
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            <div className={styles.body}>
              {!searchQuery.trim() && (
                <section className={styles.scratchSection}>
                  <div className={styles.scratchRow}>
                    {SCRATCH_OPTIONS.map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        className={styles.scratchCard}
                      >
                        <Plus size={16} className={styles.scratchIcon} />
                        <div className={styles.scratchText}>
                          <span className={styles.scratchLabel}>{opt.label}</span>
                          <span className={styles.scratchDesc}>{opt.description}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </section>
              )}

              {systemViews.length > 0 && (
                <section className={styles.categorySection}>
                  <h3 className={styles.categoryHeading}>Defaults</h3>
                  <div className={styles.tileRow}>
                    {systemViews.map((v) => {
                      const isActive = v.id === currentViewId;
                      return (
                        <a
                          key={v.id}
                          href={`?view=${v.id}`}
                          className={`${styles.tile} ${isActive ? styles.tileActive : ""}`}
                        >
                          <TileThumbnail
                            viewId={v.id}
                            isActive={isActive}
                            onDetailClick={() => setDetailViewId(v.id)}
                          />
                          <div className={styles.tileFooter}>
                            <span className={styles.tileLabel}>{v.name}</span>
                            <AvatarGroup view={v} />
                          </div>
                        </a>
                      );
                    })}
                  </div>
                </section>
              )}

              {CATEGORY_ORDER.map(({ key, label }) => {
                const categoryViews = viewsByCategory.get(key);
                if (!categoryViews?.length) return null;
                return (
                  <section key={key} className={styles.categorySection}>
                    <h3 className={styles.categoryHeading}>{label}</h3>
                    <div className={styles.tileRow}>
                      {categoryViews.map((v) => {
                        const isActive = v.id === currentViewId;
                        return (
                          <a
                            key={v.id}
                            href={`?view=${v.id}`}
                            className={`${styles.tile} ${isActive ? styles.tileActive : ""}`}
                          >
                            <TileThumbnail
                              viewId={v.id}
                              isActive={isActive}
                              onDetailClick={() => setDetailViewId(v.id)}
                            />
                            <div className={styles.tileFooter}>
                              <span className={styles.tileLabel}>{v.name}</span>
                              <AvatarGroup view={v} />
                            </div>
                          </a>
                        );
                      })}
                    </div>
                  </section>
                );
              })}

              {filteredViews.length === 0 && searchQuery.trim() && (
                <div className={styles.emptySearch}>
                  No views matching &ldquo;{searchQuery}&rdquo;
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
