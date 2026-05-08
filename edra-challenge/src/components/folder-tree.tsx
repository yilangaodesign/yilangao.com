"use client";

import { useState, useCallback, useMemo, useRef, useEffect, createContext, useContext, useTransition, type MouseEvent as ReactMouseEvent } from "react";
import { createPortal } from "react-dom";
import ChevronRight from "lucide-react/dist/esm/icons/chevron-right";
import ArrowUp from "lucide-react/dist/esm/icons/arrow-up";
import ArrowDown from "lucide-react/dist/esm/icons/arrow-down";
import Folder from "lucide-react/dist/esm/icons/folder";
import FolderOpen from "lucide-react/dist/esm/icons/folder-open";
import FileText from "lucide-react/dist/esm/icons/file-text";
import TriangleAlert from "lucide-react/dist/esm/icons/triangle-alert";
import { Badge } from "@ds/Badge";
import { ExpandCollapse } from "@ds/ExpandCollapse";
import { Tooltip } from "@ds/Tooltip";
import type { FolderNode, WorkspaceDocument } from "@/lib/queries";
import { moveDocument, moveFolder } from "@/app/workspace/actions";
import { useDocumentDrawer } from "./document-drawer";
import { useSuggestionTracker } from "./smart-suggestion-toast";
import styles from "./folder-tree.module.scss";

// ─── Drag-and-drop context ──────────────────────────────────────────────────

type DragPayload =
  | { type: "document"; id: string; title: string; currentPath: string }
  | { type: "folder"; path: string; name: string };

type DndState = {
  dragging: DragPayload | null;
  dropTarget: string | null;
  isPending: boolean;
};

type DndActions = {
  setDragging: (payload: DragPayload | null) => void;
  setDropTarget: (folderPath: string | null) => void;
  handleDrop: (targetFolderPath: string) => void;
};

const DndContext = createContext<(DndState & DndActions) | null>(null);

function useDnd() {
  const ctx = useContext(DndContext);
  if (!ctx) throw new Error("useDnd must be used within DndContext");
  return ctx;
}

// ─── Selection context ────────────────────────────────────────────────────────

type SelectionState = {
  selectedId: string | null;
  setSelectedId: (id: string | null) => void;
};

const SelectionContext = createContext<SelectionState | null>(null);

function useSelection() {
  const ctx = useContext(SelectionContext);
  if (!ctx) throw new Error("useSelection must be used within SelectionContext");
  return ctx;
}

// ─── Sort logic ──────────────────────────────────────────────────────────────

type SortColumn = "name" | "date" | "status";
type SortDir = "asc" | "desc";

const STATUS_PRIORITY: Record<string, number> = {
  deprecated: 0,
  archived: 1,
  obsolete: 2,
  stale: 3,
  "in review": 4,
  draft: 5,
  current: 6,
  active: 7,
};

function statusSortKey(doc: WorkspaceDocument): number {
  const statusP = STATUS_PRIORITY[doc.status] ?? 6;
  const stalenessP = STATUS_PRIORITY[doc.staleness_flag] ?? 7;
  return Math.min(statusP, stalenessP);
}

function compareDocuments(
  a: WorkspaceDocument,
  b: WorkspaceDocument,
  col: SortColumn,
  dir: SortDir,
): number {
  let cmp = 0;
  switch (col) {
    case "name":
      cmp = a.title.localeCompare(b.title);
      break;
    case "date": {
      const da = a.last_modified_date ? new Date(a.last_modified_date).getTime() : 0;
      const db = b.last_modified_date ? new Date(b.last_modified_date).getTime() : 0;
      cmp = da - db;
      break;
    }
    case "status":
      cmp = statusSortKey(a) - statusSortKey(b);
      break;
  }
  return dir === "asc" ? cmp : -cmp;
}

function compareFolders(a: FolderNode, b: FolderNode, col: SortColumn, dir: SortDir): number {
  let cmp = 0;
  switch (col) {
    case "name":
      cmp = a.name.localeCompare(b.name);
      break;
    case "date": {
      const da = a.lastModified ? new Date(a.lastModified).getTime() : 0;
      const db = b.lastModified ? new Date(b.lastModified).getTime() : 0;
      cmp = da - db;
      break;
    }
    case "status":
      cmp = 0;
      break;
  }
  return dir === "asc" ? cmp : -cmp;
}

function sortNode(node: FolderNode, col: SortColumn, dir: SortDir): FolderNode {
  return {
    ...node,
    children: node.children
      .slice()
      .sort((a, b) => compareFolders(a, b, col, dir))
      .map((c) => sortNode(c, col, dir)),
    documents: node.documents.slice().sort((a, b) => compareDocuments(a, b, col, dir)),
  };
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

const TZ = "America/New_York";

function toETComponents(date: Date) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const get = (t: string) => Number(parts.find((p) => p.type === t)?.value ?? 0);
  return { year: get("year"), month: get("month"), day: get("day") };
}

function etCalendarDay(date: Date): number {
  const { year, month, day } = toETComponents(date);
  return year * 10000 + month * 100 + day;
}

function formatDate(dateStr: string | null): { short: string; full: string } {
  if (!dateStr) return { short: "—", full: "" };
  const d = new Date(dateStr);
  const now = new Date();

  const full = d.toLocaleString("en-US", {
    timeZone: TZ,
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }) + " ET";

  const time = d.toLocaleString("en-US", {
    timeZone: TZ,
    hour: "numeric",
    minute: "2-digit",
  });

  const todayKey = etCalendarDay(now);
  const dateKey = etCalendarDay(d);

  const nowET = new Date(now.toLocaleString("en-US", { timeZone: TZ }));
  const dET = new Date(d.toLocaleString("en-US", { timeZone: TZ }));
  nowET.setHours(0, 0, 0, 0);
  dET.setHours(0, 0, 0, 0);
  const calendarDaysAgo = Math.round((nowET.getTime() - dET.getTime()) / 86_400_000);

  if (todayKey === dateKey) return { short: `Today, ${time}`, full };
  if (calendarDaysAgo === 1) return { short: `Yesterday, ${time}`, full };
  if (calendarDaysAgo > 0 && calendarDaysAgo < 7) {
    const dayName = d.toLocaleDateString("en-US", { timeZone: TZ, weekday: "short" });
    return { short: `${dayName}, ${time}`, full };
  }

  return {
    short: d.toLocaleDateString("en-US", { timeZone: TZ, month: "short", day: "numeric", year: "numeric" }),
    full,
  };
}

// ─── Folder metadata type (replaces hardcoded descriptions) ─────────────────

import type { FolderMeta } from "@/lib/queries";

// ─── Folder summary ─────────────────────────────────────────────────────────

type FolderSummary = {
  totalDocs: number;
  subfolderCount: number;
  description: string | null;
  staleCount: number;
  obsoleteCount: number;
  topProjects: string[];
};

function collectDocs(node: FolderNode): WorkspaceDocument[] {
  const docs: WorkspaceDocument[] = [...node.documents];
  for (const child of node.children) {
    docs.push(...collectDocs(child));
  }
  return docs;
}

function buildSummaryMap(root: FolderNode, folderMeta?: FolderMeta): Map<string, FolderSummary> {
  const map = new Map<string, FolderSummary>();

  function walk(node: FolderNode) {
    const allDocs = collectDocs(node);

    const projCounts = new Map<string, number>();
    let staleCount = 0;
    let obsoleteCount = 0;

    for (const doc of allDocs) {
      if (doc.staleness_flag === "stale") staleCount++;
      if (doc.staleness_flag === "obsolete") obsoleteCount++;
      for (const p of doc.projects ?? []) {
        projCounts.set(p, (projCounts.get(p) ?? 0) + 1);
      }
    }

    const topProjects = [...projCounts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([name]) => name);

    map.set(node.path, {
      totalDocs: node.documentCount,
      subfolderCount: node.children.length,
      description: folderMeta?.get(node.path)?.description ?? null,
      staleCount,
      obsoleteCount,
      topProjects,
    });

    for (const child of node.children) walk(child);
  }

  walk(root);
  return map;
}

// ─── Column header ───────────────────────────────────────────────────────────

function ColumnHeader({
  label,
  column,
  activeColumn,
  dir,
  onSort,
  className,
}: {
  label: string;
  column: SortColumn;
  activeColumn: SortColumn;
  dir: SortDir;
  onSort: (col: SortColumn) => void;
  className: string;
}) {
  const active = column === activeColumn;

  return (
    <button
      className={`${className} ${styles.headerCell} ${active ? styles.headerCellActive : ""}`}
      onClick={() => onSort(column)}
      aria-sort={active ? (dir === "asc" ? "ascending" : "descending") : undefined}
    >
      <span>{label}</span>
      {active && (
        dir === "asc"
          ? <ArrowUp className={styles.sortIcon} />
          : <ArrowDown className={styles.sortIcon} />
      )}
    </button>
  );
}

// ─── Document row ────────────────────────────────────────────────────────────

function DocumentRow({
  doc,
  depth,
  isRootLevel,
}: {
  doc: WorkspaceDocument;
  depth: number;
  isRootLevel?: boolean;
}) {
  const showStatus = doc.status !== "current";
  const isStale =
    doc.staleness_flag === "stale" || doc.staleness_flag === "obsolete";

  const { dragging, setDragging } = useDnd();
  const { selectedId, setSelectedId } = useSelection();
  const isDragging = dragging?.type === "document" && dragging.id === doc.id;
  const isSelected = selectedId === doc.id;
  const { openDrawer } = useDocumentDrawer();

  const handleDragStart = useCallback(
    (e: React.DragEvent) => {
      const payload: DragPayload = {
        type: "document",
        id: doc.id,
        title: doc.title,
        currentPath: doc.folder_path,
      };
      e.dataTransfer.setData("application/json", JSON.stringify(payload));
      e.dataTransfer.effectAllowed = "move";
      setDragging(payload);
    },
    [doc, setDragging],
  );

  const handleDragEnd = useCallback(() => {
    setDragging(null);
  }, [setDragging]);

  const handleClick = useCallback(
    (e: ReactMouseEvent) => {
      e.stopPropagation();
      setSelectedId(doc.id);
    },
    [doc.id, setSelectedId],
  );

  const handleDoubleClick = useCallback(
    (e: ReactMouseEvent) => {
      e.stopPropagation();
      openDrawer(doc.id);
    },
    [doc.id, openDrawer],
  );

  return (
    <div
      className={`${styles.row} ${isSelected ? styles.rowSelected : ""} ${isDragging ? styles.rowDragging : ""}`}
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
    >
      <div className={styles.cellName} style={{ paddingLeft: `${depth * 20 + 8 + (isRootLevel ? 16 : 0)}px` }}>
        <FileText className={styles.fileIcon} />
        <span className={styles.nameText}>{doc.title}</span>
        {(showStatus || isStale) && (
          <span className={styles.inlineBadges}>
            {showStatus && (
              <Badge
                size="xs"
                appearance={statusAppearance(doc.status)}
                emphasis="subtle"
              >
                {doc.status}
              </Badge>
            )}
            {isStale && (
              <Badge
                size="xs"
                appearance={doc.staleness_flag === "obsolete" ? "negative" : "warning"}
                emphasis="subtle"
              >
                {doc.staleness_flag}
              </Badge>
            )}
          </span>
        )}
      </div>
      <div className={styles.cell}>
        {(() => {
          const fmt = formatDate(doc.last_modified_date);
          return fmt.full ? (
            <Tooltip content={fmt.full} size="sm" side="top">
              <span>{fmt.short}</span>
            </Tooltip>
          ) : (
            <span>{fmt.short}</span>
          );
        })()}
      </div>
      <div className={styles.cell}>
        <span>{doc.last_modified_by ?? "—"}</span>
      </div>
    </div>
  );
}

// ─── Hover card ─────────────────────────────────────────────────────────────

function FolderHoverCard({
  summary,
  anchorRect,
}: {
  summary: FolderSummary;
  anchorRect: DOMRect;
}) {
  const style: React.CSSProperties = {
    position: "fixed",
    top: anchorRect.bottom + 6,
    left: anchorRect.left,
    zIndex: 10,
  };

  return createPortal(
    <div className={styles.hoverCard} style={style}>
      <div className={styles.hoverCardRow}>
        <span className={styles.hoverCardLabel}>Contents</span>
        <span className={styles.hoverCardValue}>
          {summary.totalDocs} item{summary.totalDocs !== 1 ? "s" : ""}
          {summary.subfolderCount > 0 &&
            `, ${summary.subfolderCount} subfolder${summary.subfolderCount !== 1 ? "s" : ""}`}
        </span>
      </div>

      {summary.description && (
        <div className={styles.hoverCardRow}>
          <span className={styles.hoverCardLabel}>Description</span>
          <span className={styles.hoverCardValue}>
            {summary.description}
          </span>
        </div>
      )}

      {(summary.staleCount > 0 || summary.obsoleteCount > 0) && (
        <div className={styles.hoverCardRow}>
          <span className={styles.hoverCardLabel}>Freshness</span>
          <span className={styles.hoverCardValue}>
            {[
              summary.staleCount > 0 && `${summary.staleCount} stale`,
              summary.obsoleteCount > 0 && `${summary.obsoleteCount} obsolete`,
            ]
              .filter(Boolean)
              .join(", ")}
          </span>
        </div>
      )}

      {summary.topProjects.length > 0 && (
        <div className={styles.hoverCardRow}>
          <span className={styles.hoverCardLabel}>Projects</span>
          <span className={styles.hoverCardValue}>
            {summary.topProjects.join(", ")}
          </span>
        </div>
      )}
    </div>,
    document.body,
  );
}

// ─── Folder row ──────────────────────────────────────────────────────────────

function FolderItem({
  node,
  depth,
  defaultOpen,
  summaryMap,
}: {
  node: FolderNode;
  depth: number;
  defaultOpen: boolean;
  summaryMap: Map<string, FolderSummary>;
}) {
  const isUncategorized = node.path === "/uncategorized" || node.path.endsWith("/uncategorized");
  const hasContent = node.children.length > 0 || node.documents.length > 0;
  const [open, setOpen] = useState(isUncategorized ? hasContent : defaultOpen);
  const toggle = useCallback(() => setOpen((prev) => !prev), []);

  const nameRef = useRef<HTMLSpanElement>(null);
  const [hoverVisible, setHoverVisible] = useState(false);
  const [anchorRect, setAnchorRect] = useState<DOMRect | null>(null);
  const showTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const summary = summaryMap.get(node.path);
  const canHover = !!summary && summary.totalDocs > 0;

  const handleMouseEnter = useCallback(() => {
    if (!canHover) return;
    if (hideTimer.current) {
      clearTimeout(hideTimer.current);
      hideTimer.current = null;
    }
    showTimer.current = setTimeout(() => {
      if (nameRef.current) {
        setAnchorRect(nameRef.current.getBoundingClientRect());
      }
      setHoverVisible(true);
    }, 750);
  }, [canHover]);

  const handleMouseLeave = useCallback(() => {
    if (showTimer.current) {
      clearTimeout(showTimer.current);
      showTimer.current = null;
    }
    hideTimer.current = setTimeout(() => {
      setHoverVisible(false);
    }, 100);
  }, []);

  useEffect(() => {
    return () => {
      if (showTimer.current) clearTimeout(showTimer.current);
      if (hideTimer.current) clearTimeout(hideTimer.current);
    };
  }, []);

  // ── Drag-and-drop ──────────────────────────────────────────────────────────

  const { selectedId, setSelectedId } = useSelection();
  const isSelected = selectedId === `folder:${node.path}`;

  const { dragging, dropTarget, setDragging, setDropTarget, handleDrop } = useDnd();
  const isDragging = dragging?.type === "folder" && dragging.path === node.path;
  const isDropTarget = dropTarget === node.path;
  const expandTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const canAcceptDrop = useCallback(
    (payload: DragPayload | null) => {
      if (!payload) return false;
      if (payload.type === "document") {
        return payload.currentPath !== node.path;
      }
      if (payload.type === "folder") {
        if (payload.path === node.path) return false;
        const parentOfDragged = payload.path.substring(0, payload.path.lastIndexOf("/")) || "/";
        if (parentOfDragged === node.path) return false;
        if (node.path.startsWith(payload.path + "/")) return false;
        return true;
      }
      return false;
    },
    [node.path],
  );

  const handleDragStart = useCallback(
    (e: React.DragEvent) => {
      const payload: DragPayload = { type: "folder", path: node.path, name: node.name };
      e.dataTransfer.setData("application/json", JSON.stringify(payload));
      e.dataTransfer.effectAllowed = "move";
      setDragging(payload);
    },
    [node.path, node.name, setDragging],
  );

  const handleDragEnd = useCallback(() => {
    setDragging(null);
    setDropTarget(null);
    if (expandTimer.current) {
      clearTimeout(expandTimer.current);
      expandTimer.current = null;
    }
  }, [setDragging, setDropTarget]);

  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      if (!canAcceptDrop(dragging)) return;
      e.stopPropagation();
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
      setDropTarget(node.path);

      if (!open && hasContent && !expandTimer.current) {
        expandTimer.current = setTimeout(() => {
          setOpen(true);
          expandTimer.current = null;
        }, 600);
      }
    },
    [dragging, canAcceptDrop, node.path, setDropTarget, open, hasContent],
  );

  const handleDragLeave = useCallback(
    (e: React.DragEvent) => {
      const row = e.currentTarget as HTMLElement;
      const related = e.relatedTarget as Node | null;
      if (related && row.contains(related)) return;
      if (dropTarget === node.path) setDropTarget(null);
      if (expandTimer.current) {
        clearTimeout(expandTimer.current);
        expandTimer.current = null;
      }
    },
    [dropTarget, node.path, setDropTarget],
  );

  const handleDropOnFolder = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (expandTimer.current) {
        clearTimeout(expandTimer.current);
        expandTimer.current = null;
      }
      if (canAcceptDrop(dragging)) {
        handleDrop(node.path);
      }
    },
    [dragging, canAcceptDrop, handleDrop, node.path],
  );

  useEffect(() => {
    return () => {
      if (expandTimer.current) clearTimeout(expandTimer.current);
    };
  }, []);

  const rowClasses = [
    styles.row,
    styles.folderRow,
    isSelected && styles.rowSelected,
    isDragging && styles.rowDragging,
    isDropTarget && styles.rowDropTarget,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <>
      <div
        className={rowClasses}
        onClick={(e) => {
          e.stopPropagation();
          setSelectedId(`folder:${node.path}`);
          if (hasContent) toggle();
        }}
        role="button"
        tabIndex={0}
        aria-expanded={hasContent ? open : undefined}
        draggable
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDropOnFolder}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setSelectedId(`folder:${node.path}`);
            if (hasContent) toggle();
          }
        }}
      >
        <div
          className={styles.cellName}
          style={{ paddingLeft: `${depth * 20 + 8}px` }}
        >
          <ChevronRight
            className={`${styles.chevron} ${open ? styles.chevronOpen : ""} ${!hasContent ? styles.chevronHidden : ""}`}
          />
          {isUncategorized ? (
            <TriangleAlert className={`${styles.folderIcon} ${styles.uncategorizedIcon}`} />
          ) : open ? (
            <FolderOpen className={styles.folderIcon} />
          ) : (
            <Folder className={styles.folderIcon} />
          )}
          {isUncategorized ? (
            <Tooltip content="Documents the AI wasn't confident about categorizing" size="sm" side="top">
              <span
                ref={nameRef}
                className={`${styles.nameText} ${styles.uncategorizedName}`}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
              >
                {node.name}
              </span>
            </Tooltip>
          ) : (
            <span
              ref={nameRef}
              className={styles.nameText}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              {node.name}
            </span>
          )}
          {summary && (summary.staleCount > 0 || summary.obsoleteCount > 0) && (
            <span className={styles.inlineBadges}>
              {summary.staleCount > 0 && (
                <Badge size="xs" appearance="warning" emphasis="subtle">
                  {summary.staleCount} stale
                </Badge>
              )}
              {summary.obsoleteCount > 0 && (
                <Badge size="xs" appearance="negative" emphasis="subtle">
                  {summary.obsoleteCount} obsolete
                </Badge>
              )}
            </span>
          )}
        </div>
        <div className={styles.cell}>
          {(() => {
            const fmt = formatDate(node.lastModified);
            return fmt.full ? (
              <Tooltip content={fmt.full} size="sm" side="top">
                <span>{fmt.short}</span>
              </Tooltip>
            ) : (
              <span>{fmt.short}</span>
            );
          })()}
        </div>
        <div className={styles.cell} />
      </div>

      {hoverVisible && summary && anchorRect && (
        <FolderHoverCard summary={summary} anchorRect={anchorRect} />
      )}

      <ExpandCollapse open={open}>
        <div>
          {node.children.map((child) => (
            <FolderItem
              key={child.path}
              node={child}
              depth={depth + 1}
              defaultOpen={false}
              summaryMap={summaryMap}
            />
          ))}
          {node.documents.map((doc) => (
            <DocumentRow key={doc.id} doc={doc} depth={depth + 1} />
          ))}
        </div>
      </ExpandCollapse>
    </>
  );
}

// ─── Tree root ───────────────────────────────────────────────────────────────

export function FolderTree({ root, folderMeta, viewId }: { root: FolderNode; folderMeta?: FolderMeta; viewId?: string }) {
  const [sortCol, setSortCol] = useState<SortColumn>("name");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [isPending, startTransition] = useTransition();

  const [dragging, setDragging] = useState<DragPayload | null>(null);
  const [dropTarget, setDropTarget] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const suggestionTracker = useSuggestionTracker();

  const handleDrop = useCallback(
    (targetFolderPath: string) => {
      if (!dragging) return;
      const payload = dragging;
      setDragging(null);
      setDropTarget(null);

      if (payload.type === "document") {
        suggestionTracker?.trackMove(payload.id, payload.currentPath, targetFolderPath);
      }

      startTransition(async () => {
        if (payload.type === "document") {
          await moveDocument(payload.id, targetFolderPath, viewId, payload.currentPath);
        } else if (payload.type === "folder") {
          await moveFolder(payload.path, targetFolderPath);
        }
      });
    },
    [dragging, startTransition, suggestionTracker, viewId],
  );

  // ── Drag-outside-to-unfile ────────────────────────────────────────────────

  const treeRef = useRef<HTMLDivElement>(null);
  const badgeRef = useRef<HTMLDivElement>(null);
  const isOutsideRef = useRef(false);
  const handleDropRef = useRef(handleDrop);
  const viewIdRef = useRef(viewId);
  const [isOutside, setIsOutside] = useState(false);

  handleDropRef.current = handleDrop;
  viewIdRef.current = viewId;

  useEffect(() => {
    if (!dragging) return;

    const alreadyUnsorted =
      (dragging.type === "document" && (dragging.currentPath === "/unsorted" || dragging.currentPath === "/uncategorized")) ||
      (dragging.type === "folder" && (dragging.path.startsWith("/unsorted") || dragging.path.startsWith("/uncategorized")));
    if (alreadyUnsorted) return;

    function onDragOver(e: DragEvent) {
      e.preventDefault();
      e.dataTransfer!.dropEffect = "move";

      const outside = !treeRef.current?.contains(e.target as Node);

      if (outside !== isOutsideRef.current) {
        isOutsideRef.current = outside;
        setIsOutside(outside);
      }

      if (outside && badgeRef.current) {
        badgeRef.current.style.transform =
          `translate(${e.clientX + 16}px, ${e.clientY + 16}px)`;
      }
    }

    function onDrop(e: DragEvent) {
      if (!treeRef.current?.contains(e.target as Node)) {
        e.preventDefault();
        e.stopPropagation();
        handleDropRef.current(viewIdRef.current ? "/uncategorized" : "/unsorted");
      }
    }

    document.addEventListener("dragover", onDragOver);
    document.addEventListener("drop", onDrop);

    return () => {
      document.removeEventListener("dragover", onDragOver);
      document.removeEventListener("drop", onDrop);
      isOutsideRef.current = false;
      setIsOutside(false);
    };
  }, [dragging]);

  // ── Context + sorting ─────────────────────────────────────────────────────

  const dndValue = useMemo(
    () => ({ dragging, dropTarget, isPending, setDragging, setDropTarget, handleDrop }),
    [dragging, dropTarget, isPending, setDragging, setDropTarget, handleDrop],
  );

  const selectionValue = useMemo(
    () => ({ selectedId, setSelectedId }),
    [selectedId],
  );

  const handleSort = useCallback(
    (col: SortColumn) => {
      if (col === sortCol) {
        setSortDir((d) => (d === "asc" ? "desc" : "asc"));
      } else {
        setSortCol(col);
        setSortDir(col === "date" ? "desc" : "asc");
      }
    },
    [sortCol],
  );

  const sorted = useMemo(() => sortNode(root, sortCol, sortDir), [root, sortCol, sortDir]);
  const summaryMap = useMemo(() => buildSummaryMap(sorted, folderMeta), [sorted, folderMeta]);

  const handleRootDragOver = useCallback(
    (e: React.DragEvent) => {
      if (!dragging) return;
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
      setDropTarget("/");
    },
    [dragging],
  );

  const handleRootDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      if (dragging) handleDrop("/");
    },
    [dragging, handleDrop],
  );

  return (
    <DndContext.Provider value={dndValue}>
      <SelectionContext.Provider value={selectionValue}>
      <div
        ref={treeRef}
        className={`${styles.tree} ${isPending ? styles.treePending : ""}`}
        role="tree"
        aria-label="Workspace folders"
        onDragOver={handleRootDragOver}
        onDrop={handleRootDrop}
      >
        <div className={styles.headerRow}>
          <ColumnHeader label="Name" column="name" activeColumn={sortCol} dir={sortDir} onSort={handleSort} className={styles.cellName} />
          <ColumnHeader label="Date Modified" column="date" activeColumn={sortCol} dir={sortDir} onSort={handleSort} className={styles.cell} />
          <div className={`${styles.cell} ${styles.headerCell}`} aria-label="Modified By">
            <span>Modified By</span>
          </div>
        </div>

        {sorted.children.map((child) => (
          <FolderItem
            key={child.path}
            node={child}
            depth={0}
            defaultOpen={child.path === "/unsorted"}
            summaryMap={summaryMap}
          />
        ))}
        {sorted.documents.map((doc) => (
          <DocumentRow key={doc.id} doc={doc} depth={0} isRootLevel />
        ))}
      </div>

      {isOutside && dragging && createPortal(
        <div ref={badgeRef} className={styles.cursorBadge}>
          <FolderOpen className={styles.cursorBadgeIcon} />
          Move to Uncategorized
        </div>,
        document.body,
      )}
      </SelectionContext.Provider>
    </DndContext.Provider>
  );
}
