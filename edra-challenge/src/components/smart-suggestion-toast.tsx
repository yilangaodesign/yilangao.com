"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  useRef,
  useEffect,
  useTransition,
  type ReactNode,
} from "react";
import { X } from "lucide-react";
import type { FolderNode, WorkspaceDocument } from "@/lib/queries";
import { getRegistryByType } from "@/lib/entity-registry";
import { moveDocument } from "@/app/workspace/actions";
import styles from "./smart-suggestion-toast.module.scss";

// ─── Types ────────────────────────────────────────────────────────────────────

type MoveEntry = {
  docId: string;
  sourceFolder: string;
  targetFolder: string;
  projects: string[];
  tags: string[];
};

type Suggestion = {
  primaryText: string;
  secondaryText: string;
  candidates: Array<{ id: string; folderPath: string }>;
  targetFolder: string;
};

type SuggestionContextValue = {
  trackMove: (docId: string, sourcePath: string, targetPath: string) => void;
};

const SuggestionContext = createContext<SuggestionContextValue | null>(null);

export function useSuggestionTracker() {
  return useContext(SuggestionContext);
}

// ─── Entity resolution ────────────────────────────────────────────────────────

function resolveEntityLabel(raw: string): string {
  const projects = getRegistryByType("project");
  const matchById = projects.find(
    (p) => p.id === raw || p.id === `project-${raw}`,
  );
  if (matchById) return matchById.description ?? matchById.label;

  const matchByLabel = projects.find(
    (p) => p.label.toLowerCase() === raw.toLowerCase(),
  );
  if (matchByLabel) return matchByLabel.description ?? matchByLabel.label;

  const tags = getRegistryByType("tag");
  const tagById = tags.find((t) => t.id === raw || t.id === `tag-${raw}`);
  if (tagById) return tagById.description ?? tagById.label;

  const tagByLabel = tags.find(
    (t) => t.label.toLowerCase() === raw.toLowerCase(),
  );
  if (tagByLabel) return tagByLabel.description ?? tagByLabel.label;

  return raw.charAt(0).toUpperCase() + raw.slice(1);
}

// ─── Derivation logic ─────────────────────────────────────────────────────────

const THRESHOLD = 3;

function deriveSuggestion(
  moveLog: MoveEntry[],
  tree: FolderNode,
): Suggestion | null {
  const grouped = new Map<string, MoveEntry[]>();
  for (const entry of moveLog) {
    const key = `${entry.sourceFolder}→${entry.targetFolder}`;
    const arr = grouped.get(key) ?? [];
    arr.push(entry);
    grouped.set(key, arr);
  }

  let bestGroup: MoveEntry[] | null = null;
  for (const entries of grouped.values()) {
    if (entries.length >= THRESHOLD) {
      if (!bestGroup || entries.length > bestGroup.length) {
        bestGroup = entries;
      }
    }
  }

  // Fallback: group by target only for uncategorized/unsorted moves.
  // Catches the trend when docs come from different source folders.
  if (!bestGroup) {
    const byTarget = new Map<string, MoveEntry[]>();
    for (const entry of moveLog) {
      const t = entry.targetFolder;
      if (t !== "/unsorted" && t !== "/uncategorized") continue;
      const arr = byTarget.get(t) ?? [];
      arr.push(entry);
      byTarget.set(t, arr);
    }
    for (const entries of byTarget.values()) {
      if (entries.length >= THRESHOLD) {
        if (!bestGroup || entries.length > bestGroup.length) {
          bestGroup = entries;
        }
      }
    }
  }

  if (!bestGroup) return null;

  const { targetFolder } = bestGroup[0];
  const isUnsorted = targetFolder === "/unsorted" || targetFolder === "/uncategorized";

  const movedIds = new Set(bestGroup.map((e) => e.docId));
  const sourceFolders = [...new Set(bestGroup.map((e) => e.sourceFolder))];
  const sourceIsUncategorized = sourceFolders.some(
    (f) => f === "/unsorted" || f === "/uncategorized",
  );
  const sourceDocsRaw = sourceFolders.flatMap((f) => collectDocsFromFolder(tree, f));
  const seen = new Set<string>();
  const sourceDocs = sourceDocsRaw.filter((d) => {
    if (seen.has(d.id)) return false;
    seen.add(d.id);
    return true;
  });
  const remaining = sourceDocs.filter((d) => !movedIds.has(d.id));

  if (remaining.length === 0) return null;

  if (isUnsorted) {
    // Scenario B: find entity the remaining docs share but moved docs lack
    const remainingEntities = entityFrequency(remaining);
    const movedEntities = entitySet(bestGroup);

    let bestEntity: string | null = null;
    let bestScore = 0;
    for (const [entity, count] of remainingEntities) {
      if (!movedEntities.has(entity) && count > bestScore) {
        bestEntity = entity;
        bestScore = count;
      }
    }

    if (!bestEntity) return null;

    const candidates = remaining.filter(
      (d) => !d.projects.includes(bestEntity!) && !d.tags.includes(bestEntity!),
    );

    if (candidates.length === 0) return null;

    const label = resolveEntityLabel(bestEntity);
    const n = candidates.length;
    const primaryText = `${n} more doc${n === 1 ? "" : "s"} unrelated to "${label}" — move to Uncategorized?`;
    const secondaryText = `Based on the ${bestGroup.length} you just reorganized`;

    return {
      primaryText,
      secondaryText,
      candidates: candidates.map((d) => ({ id: d.id, folderPath: d.folder_path })),
      targetFolder,
    };
  } else {
    // Scenario A: find entity the moved docs share that remaining docs also have
    const movedEntities = entityFrequency(
      bestGroup.map((e) => ({ projects: e.projects, tags: e.tags })),
    );

    let bestEntity: string | null = null;
    let bestScore = 0;
    for (const [entity, count] of movedEntities) {
      if (count > bestScore) {
        bestEntity = entity;
        bestScore = count;
      }
    }

    if (bestEntity) {
      const candidates = remaining.filter(
        (d) => d.projects.includes(bestEntity!) || d.tags.includes(bestEntity!),
      );

      if (candidates.length > 0) {
        const label = resolveEntityLabel(bestEntity);
        const folderName = targetFolder.split("/").filter(Boolean).pop() ?? "folder";
        const displayFolder = folderName.charAt(0).toUpperCase() + folderName.slice(1);
        const n = candidates.length;
        const primaryText = `${n} more doc${n === 1 ? "" : "s"} also tagged "${label}" — move to ${displayFolder}?`;
        const secondaryText = `Based on the ${bestGroup.length} you just reorganized`;

        return {
          primaryText,
          secondaryText,
          candidates: candidates.map((d) => ({ id: d.id, folderPath: d.folder_path })),
          targetFolder,
        };
      }
    }

    // Scenario A fallback: source is uncategorized but entity matching found
    // no candidates — find the dominant entity among remaining docs instead
    if (sourceIsUncategorized) {
      const remainingEntities = entityFrequency(remaining);
      let topEntity: string | null = null;
      let topCount = 0;
      for (const [entity, count] of remainingEntities) {
        if (count > topCount) {
          topEntity = entity;
          topCount = count;
        }
      }

      if (topEntity && topCount >= 2) {
        const matchingRemaining = remaining.filter(
          (d) => d.projects.includes(topEntity!) || d.tags.includes(topEntity!),
        );

        if (matchingRemaining.length > 0) {
          const label = resolveEntityLabel(topEntity);
          const n = matchingRemaining.length;
          const primaryText = `${n} "${label}" doc${n === 1 ? "" : "s"} still in Uncategorized — review next?`;
          const secondaryText = `Based on the ${bestGroup.length} you just reorganized`;

          return {
            primaryText,
            secondaryText,
            candidates: matchingRemaining.map((d) => ({ id: d.id, folderPath: d.folder_path })),
            targetFolder,
          };
        }
      }
    }

    return null;
  }
}

function collectDocsFromFolder(tree: FolderNode, path: string): WorkspaceDocument[] {
  const node = findFolder(tree, path);
  if (!node) return [];
  return collectAllDocs(node);
}

function findFolder(node: FolderNode, path: string): FolderNode | null {
  if (node.path === path) return node;
  for (const child of node.children) {
    const found = findFolder(child, path);
    if (found) return found;
  }
  return null;
}

function collectAllDocs(node: FolderNode): WorkspaceDocument[] {
  const docs = [...node.documents];
  for (const child of node.children) {
    docs.push(...collectAllDocs(child));
  }
  return docs;
}

function entityFrequency(docs: Array<{ projects: string[]; tags: string[] }>): Map<string, number> {
  const freq = new Map<string, number>();
  for (const doc of docs) {
    for (const p of doc.projects) freq.set(p, (freq.get(p) ?? 0) + 1);
    for (const t of doc.tags) freq.set(t, (freq.get(t) ?? 0) + 1);
  }
  return freq;
}

function entitySet(entries: MoveEntry[]): Set<string> {
  const s = new Set<string>();
  for (const e of entries) {
    for (const p of e.projects) s.add(p);
    for (const t of e.tags) s.add(t);
  }
  return s;
}

// ─── Provider ─────────────────────────────────────────────────────────────────

export function SuggestionProvider({
  tree,
  viewId,
  children,
}: {
  tree: FolderNode;
  viewId?: string;
  children: ReactNode;
}) {
  const [suggestion, setSuggestion] = useState<Suggestion | null>(null);
  const moveLogRef = useRef<MoveEntry[]>([]);
  const treeRef = useRef(tree);
  const suggestionRef = useRef(suggestion);
  const viewIdRef = useRef(viewId);
  treeRef.current = tree;
  suggestionRef.current = suggestion;
  viewIdRef.current = viewId;

  const trackMove = useCallback(
    (docId: string, sourcePath: string, targetPath: string) => {
      const sourceDocs = collectDocsFromFolder(treeRef.current, sourcePath);
      const doc = sourceDocs.find((d) => d.id === docId);

      const entry: MoveEntry = {
        docId,
        sourceFolder: sourcePath,
        targetFolder: targetPath,
        projects: doc?.projects ?? [],
        tags: doc?.tags ?? [],
      };

      moveLogRef.current = [...moveLogRef.current, entry];

      const result = deriveSuggestion(moveLogRef.current, treeRef.current);
      if (result && !suggestionRef.current) {
        setSuggestion(result);
      }
    },
    [],
  );

  const dismiss = useCallback(() => {
    setSuggestion(null);
    moveLogRef.current = [];
  }, []);

  const ctxValue = useMemo(() => ({ trackMove }), [trackMove]);

  return (
    <SuggestionContext.Provider value={ctxValue}>
      {children}
      {suggestion && (
        <SmartSuggestionToast
          suggestion={suggestion}
          viewId={viewIdRef.current}
          onDismiss={dismiss}
        />
      )}
    </SuggestionContext.Provider>
  );
}

// ─── Toast component ──────────────────────────────────────────────────────────

const COUNTDOWN_MS = 15_000;
const RING_RADIUS = 11;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

function SmartSuggestionToast({
  suggestion,
  viewId,
  onDismiss,
}: {
  suggestion: Suggestion;
  viewId?: string;
  onDismiss: () => void;
}) {
  const [exiting, setExiting] = useState(false);
  const [executing, setExecuting] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [, startTransition] = useTransition();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const elapsedRef = useRef(0);
  const startedAtRef = useRef(Date.now());

  const handleClose = useCallback(() => {
    setExiting(true);
    setTimeout(onDismiss, 150);
  }, [onDismiss]);

  const startTimer = useCallback(() => {
    const remaining = COUNTDOWN_MS - elapsedRef.current;
    if (remaining <= 0) {
      handleClose();
      return;
    }
    startedAtRef.current = Date.now();
    timerRef.current = setTimeout(handleClose, remaining);
  }, [handleClose]);

  const pauseTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    elapsedRef.current += Date.now() - startedAtRef.current;
  }, []);

  useEffect(() => {
    startTimer();
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [startTimer]);

  const handleMouseEnter = useCallback(() => {
    setHovered(true);
    pauseTimer();
  }, [pauseTimer]);

  const handleMouseLeave = useCallback(() => {
    setHovered(false);
    startTimer();
  }, [startTimer]);

  const handleReorganize = useCallback(() => {
    if (executing) return;
    setExecuting(true);

    startTransition(async () => {
      const promises = suggestion.candidates.map((c) =>
        moveDocument(c.id, suggestion.targetFolder, viewId, c.folderPath),
      );
      await Promise.all(promises);
      setTimeout(() => {
        setExiting(true);
        setTimeout(onDismiss, 150);
      }, 200);
    });
  }, [executing, suggestion, viewId, onDismiss, startTransition]);

  return (
    <div className={styles.wrapper}>
      <div
        className={`${styles.toast} ${exiting ? styles.exiting : ""} ${hovered ? styles.paused : ""}`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div className={styles.body}>
          <span className={styles.primary}>{suggestion.primaryText}</span>
          <span className={styles.secondary}>{suggestion.secondaryText}</span>
        </div>

        <div className={styles.actions}>
          <button
            className={styles.close}
            onClick={handleClose}
            aria-label="Dismiss suggestion"
          >
            <svg className={styles.ring} viewBox="0 0 28 28">
              <circle
                className={styles.ringTrack}
                cx="14"
                cy="14"
                r={RING_RADIUS}
              />
              <circle
                className={styles.ringProgress}
                cx="14"
                cy="14"
                r={RING_RADIUS}
                strokeDasharray={RING_CIRCUMFERENCE}
                strokeDashoffset={0}
                style={{ "--ring-circumference": `${RING_CIRCUMFERENCE}px` } as React.CSSProperties}
              />
            </svg>
            <X className={styles.icon} />
          </button>

          <button
            className={`${styles.cta} ${executing ? styles.executing : ""}`}
            onClick={handleReorganize}
            disabled={executing}
          >
            {executing ? "Moved" : "Move"}
          </button>
        </div>
      </div>
    </div>
  );
}
