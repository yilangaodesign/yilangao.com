"use client";

import {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
  useImperativeHandle,
  forwardRef,
  type ReactNode,
  type KeyboardEvent,
} from "react";
import Plus from "lucide-react/dist/esm/icons/plus";
import Search from "lucide-react/dist/esm/icons/search";
import Clock from "lucide-react/dist/esm/icons/clock";
import Bookmark from "lucide-react/dist/esm/icons/bookmark";
import ImagePlus from "lucide-react/dist/esm/icons/image-plus";
import Calendar from "lucide-react/dist/esm/icons/calendar";
import X from "lucide-react/dist/esm/icons/x";
import Folder from "lucide-react/dist/esm/icons/folder";
import User from "lucide-react/dist/esm/icons/user";
import File from "lucide-react/dist/esm/icons/file";
import Building from "lucide-react/dist/esm/icons/building";
import Tag from "lucide-react/dist/esm/icons/tag";
import AlertTriangle from "lucide-react/dist/esm/icons/alert-triangle";
import Circle from "lucide-react/dist/esm/icons/circle";
import ArrowRight from "lucide-react/dist/esm/icons/arrow-right";
import { Button } from "@ds/Button";
import { Badge } from "@ds/Badge";
import { Menu, MenuItem, MenuLabel, MenuSeparator } from "@ds/Menu";
import FileText from "lucide-react/dist/esm/icons/file-text";
import {
  detectEntities,
  getRegistryByType,
  ALL_ENTITY_TYPES,
  ENTITY_ICONS,
  type EntityEntry,
  type EntityType,
  type DetectedEntity,
} from "@/lib/entity-registry";
import { computeGhostSuggestion } from "@/lib/type-ahead";
import {
  getDimensionsForFamily,
  type GroupByDimension,
} from "@/lib/groupby-dimensions";
import {
  searchDocuments,
  type SearchResult,
} from "@/app/workspace/actions";
import styles from "./search-input.module.css";

const DIMENSION_ICONS: Record<string, typeof Folder> = {
  folder: Folder,
  user: User,
  file: File,
  clock: Clock,
  building: Building,
  tag: Tag,
  alert: AlertTriangle,
  circle: Circle,
  calendar: Calendar,
};

/* ─── Constants ────────────────────────────────────────────────── */

const PROMPTS = [
  "Show me everything about Atlas",
  "Incident reports grouped by theme",
  "Liam O'Brien's docs that need reassigning",
  "Stale runbooks grouped by owner",
  "All ADRs still in draft or review",
];

const COMPACT_PLACEHOLDER = "Search docs, ask questions, filter by label\u2026";
const COMPACT_SCROLL_THRESHOLD = 5;
const ENTITY_DEBOUNCE_MS = 150;

const TYPE_SPEED = 45;
const DELETE_SPEED = 25;
const PAUSE_AFTER_TYPE = 2200;
const PAUSE_AFTER_DELETE = 400;

/* ─── Hooks ────────────────────────────────────────────────────── */

function useDebouncedValue(value: string, delay: number): string {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

/* ─── Sub-components ───────────────────────────────────────────── */

function EntityPill({
  entity,
  onDismiss,
}: {
  entity: EntityEntry;
  onDismiss: () => void;
}) {
  return (
    <span className={styles.pill}>
      <span className={styles.pillType}>{entity.type}</span>
      {entity.label}
      <button
        type="button"
        className={styles.pillDismiss}
        onClick={(e) => {
          e.stopPropagation();
          onDismiss();
        }}
        aria-label={`Remove ${entity.label}`}
      >
        <X size={10} />
      </button>
    </span>
  );
}

function DisambiguationPopover({
  entity,
  left,
  activeIndex,
  onSelect,
  onDismiss,
  below,
}: {
  entity: DetectedEntity;
  left: number;
  activeIndex: number;
  onSelect: (entry: EntityEntry) => void;
  onDismiss: () => void;
  below?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: globalThis.MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onDismiss();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onDismiss]);

  const candidates = entity.candidates.slice(0, 5);

  return (
    <div
      ref={ref}
      className={`${styles.disambigPopover} ${below ? styles.disambigPopoverBelow : ""}`}
      style={{ left }}
      role="listbox"
      aria-label={`Disambiguate "${entity.text}"`}
      onMouseDown={(e) => e.preventDefault()}
    >
      <div className={styles.disambigHeader}>
        {entity.text} (disambiguate)
      </div>
      {candidates.map((candidate, i) => (
        <div
          key={candidate.id}
          className={`${styles.disambigRow} ${i === activeIndex ? styles.disambigRowActive : ""}`}
          role="option"
          aria-selected={i === activeIndex}
          onClick={() => onSelect(candidate)}
          onMouseDown={(e) => e.preventDefault()}
        >
          <span className={styles.disambigDot} />
          <div className={styles.disambigContent}>
            <div className={styles.disambigName}>
              {candidate.label}
              <span className={styles.disambigTypeBadge}>{candidate.type}</span>
            </div>
            <div className={styles.disambigDesc}>{candidate.description}</div>
          </div>
          <span className={styles.disambigCount}>
            {candidate.count} {candidate.type === "tag" ? "uses" : "docs"}
          </span>
        </div>
      ))}
    </div>
  );
}

/* ─── Types for inline confirmed entities ─────────────────────── */

type InlineConfirmedEntity = {
  entry: EntityEntry;
  start: number;
  end: number;
};

/* ─── Text overlay renderer ────────────────────────────────────── */

type OverlayMarker = {
  start: number;
  end: number;
  kind: "detected" | "confirmed";
  detected?: DetectedEntity;
  confirmed?: InlineConfirmedEntity;
};

function renderOverlaySegments(
  text: string,
  entities: DetectedEntity[],
  inlineConfirmed: InlineConfirmedEntity[],
  onEntityHover: (entity: DetectedEntity, rect: DOMRect) => void,
  onEntityLeave: () => void,
  onInlineDismiss: (ic: InlineConfirmedEntity) => void,
): ReactNode[] {
  const hasInlinePills = inlineConfirmed.length > 0;
  const textClass = hasInlinePills ? styles.overlayTextVisible : styles.overlayText;
  const entityClass = hasInlinePills ? styles.entityHighlightVisible : styles.entityHighlight;

  if (!text || (entities.length === 0 && inlineConfirmed.length === 0)) {
    return [
      <span key="all" className={textClass}>
        {text}
      </span>,
    ];
  }

  const markers: OverlayMarker[] = [
    ...inlineConfirmed.map((ic) => ({
      start: ic.start,
      end: ic.end,
      kind: "confirmed" as const,
      confirmed: ic,
    })),
    ...entities
      .filter((e) => !inlineConfirmed.some((ic) => e.start >= ic.start && e.end <= ic.end))
      .map((e) => ({
        start: e.start,
        end: e.end,
        kind: "detected" as const,
        detected: e,
      })),
  ].sort((a, b) => a.start - b.start);

  const segments: ReactNode[] = [];
  let lastEnd = 0;

  for (const marker of markers) {
    if (marker.start > lastEnd) {
      segments.push(
        <span key={`t-${lastEnd}`} className={textClass}>
          {text.slice(lastEnd, marker.start)}
        </span>,
      );
    }

    if (marker.kind === "confirmed" && marker.confirmed) {
      const ic = marker.confirmed;
      segments.push(
        <span key={`ic-${ic.start}`} className={styles.inlinePill}>
          <span className={styles.inlinePillType}>{ic.entry.type}</span>
          {ic.entry.label}
          <button
            type="button"
            className={styles.inlinePillDismiss}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => onInlineDismiss(ic)}
          >
            <X size={10} />
          </button>
        </span>,
      );
    } else if (marker.kind === "detected" && marker.detected) {
      const entity = marker.detected;
      segments.push(
        <span
          key={`e-${entity.start}`}
          className={entityClass}
          onMouseEnter={(e) => {
            const rect = (e.target as HTMLElement).getBoundingClientRect();
            onEntityHover(entity, rect);
          }}
          onMouseLeave={onEntityLeave}
        >
          {text.slice(entity.start, entity.end)}
        </span>,
      );
    }

    lastEnd = marker.end;
  }

  if (lastEnd < text.length) {
    segments.push(
      <span key={`t-${lastEnd}`} className={textClass}>
        {text.slice(lastEnd)}
      </span>,
    );
  }

  return segments;
}

/* ─── Main component ───────────────────────────────────────────── */

export interface SearchInputHandle {
  addEntity: (entity: EntityEntry) => void;
  setQuery: (query: string) => void;
  appendText: (text: string) => void;
  clear: () => void;
}

interface SearchInputProps {
  onFocusChange?: (focused: boolean) => void;
  onActiveChange?: (active: boolean) => void;
  onResultSelect?: (docId: string) => void;
  onGroupByNavigate?: (viewId: string) => void;
  onPromptSubmit?: (query: string) => void;
  compact?: boolean;
  viewId?: string;
  hidePlusMenu?: boolean;
  autoFocus?: boolean;
  disabled?: boolean;
}

export const SearchInput = forwardRef<SearchInputHandle, SearchInputProps>(
  function SearchInput({ onFocusChange, onActiveChange, onResultSelect, onGroupByNavigate, onPromptSubmit, compact: compactProp, viewId, hidePlusMenu, autoFocus, disabled }, handle) {
  const [value, setValue] = useState("");
  const [confirmedEntities, setConfirmedEntities] = useState<EntityEntry[]>([]);
  const [inlineConfirmed, setInlineConfirmed] = useState<InlineConfirmedEntity[]>([]);
  const [isFocused, setIsFocused] = useState(false);
  const [isCompact, setIsCompact] = useState(!!compactProp);
  const [isHovered, setIsHovered] = useState(false);

  /* Search results state */
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searchIndex, setSearchIndex] = useState(0);
  const [isSearching, setIsSearching] = useState(false);
  const searchAbort = useRef<AbortController | null>(null);

  /* Idle typing animation state */
  const [displayText, setDisplayText] = useState("");
  const indexRef = useRef(0);
  const phaseRef = useRef<"typing" | "pausing" | "deleting" | "waiting">("typing");
  const charRef = useRef(0);

  /* Disambiguation state */
  const [disambigEntity, setDisambigEntity] = useState<DetectedEntity | null>(null);
  const [disambigLeft, setDisambigLeft] = useState(0);
  const [disambigIndex, setDisambigIndex] = useState(0);
  const disambigOpen = disambigEntity !== null;

  /* Inline chip selector (shows entity picker as popover when @type/ is Tab-accepted) */
  const [inlineChipType, setInlineChipType] = useState<EntityType | null>(null);
  const [chipSearchQuery, setChipSearchQuery] = useState("");
  const chipInputRef = useRef<HTMLInputElement>(null);

  /* @ autocomplete menu state */
  const [atMenuIndex, setAtMenuIndex] = useState(0);
  const [atMenuDismissed, setAtMenuDismissed] = useState(false);
  const lastCompletionValue = useRef("");

  /* Ghost suggestion chain depth (resets on user keystrokes, increments on Tab-accept) */
  const suggestionDepth = useRef(0);

  /* GroupBy dimension picker state */
  const [groupByOpen, setGroupByOpen] = useState(false);
  const [groupByDimensionId, setGroupByDimensionId] = useState<string | null>(null);
  const [groupByFamily, setGroupByFamily] = useState<string>("General");
  const [groupByIndex, setGroupByIndex] = useState(0);
  const groupByRef = useRef<HTMLDivElement>(null);

  /* Hover timer for disambiguation */
  const hoverTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* Popover placement: "above" when search bar is centered, "below" when pinned to top */
  const [popoverBelow, setPopoverBelow] = useState(false);

  /* Refs */
  const inputRef = useRef<HTMLInputElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  /* ─── Popover placement detection ─────────────────────────── */

  const updatePopoverPlacement = useCallback(() => {
    if (!wrapperRef.current) return;
    const rect = wrapperRef.current.getBoundingClientRect();
    const spaceAbove = rect.top;
    const spaceBelow = window.innerHeight - rect.bottom;
    setPopoverBelow(spaceBelow > spaceAbove);
  }, []);

  useEffect(() => {
    if (!isFocused) return;
    updatePopoverPlacement();
    window.addEventListener("scroll", updatePopoverPlacement, { passive: true });
    window.addEventListener("resize", updatePopoverPlacement, { passive: true });
    return () => {
      window.removeEventListener("scroll", updatePopoverPlacement);
      window.removeEventListener("resize", updatePopoverPlacement);
    };
  }, [isFocused, updatePopoverPlacement]);

  /* ─── Imperative handle for parent access ─────────────────── */

  useImperativeHandle(handle, () => ({
    addEntity: (entity: EntityEntry) => {
      setConfirmedEntities((prev) => [...prev, entity]);
      inputRef.current?.focus();
    },
    setQuery: (query: string) => {
      setValue(query);
      inputRef.current?.focus();
    },
    appendText: (text: string) => {
      setValue((prev) => {
        const sep = prev && !/\s$/.test(prev) ? " " : "";
        return prev + sep + text;
      });
      inputRef.current?.focus();
    },
  }));

  /* ─── Report active state (has content or entities) ──────── */

  useEffect(() => {
    onActiveChange?.(!!value || confirmedEntities.length > 0);
  }, [value, confirmedEntities.length, onActiveChange]);

  /* ─── Debounced entity detection ──────────────────────────── */

  const debouncedValue = useDebouncedValue(value, ENTITY_DEBOUNCE_MS);
  const detectedEntities = useMemo(
    () => detectEntities(debouncedValue),
    [debouncedValue],
  );

  /* ─── Fuzzy document search ──────────────────────────────── */

  const debouncedSearchQuery = useDebouncedValue(value, 250);

  useEffect(() => {
    const query = debouncedSearchQuery.trim();

    if (!query || query.length < 2 || !isFocused || inlineChipType) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    if (value.match(/@\w*$/)) {
      setSearchResults([]);
      return;
    }

    if (searchAbort.current) searchAbort.current.abort();
    const controller = new AbortController();
    searchAbort.current = controller;

    setIsSearching(true);
    searchDocuments(query, viewId).then((results) => {
      if (controller.signal.aborted) return;
      setSearchResults(results);
      setSearchIndex(0);
      setIsSearching(false);
    });

    return () => controller.abort();
  }, [debouncedSearchQuery, isFocused, inlineChipType]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ─── @ autocomplete menu derived state ──────────────────── */

  const atMenuItems = useMemo(() => {
    if (!isFocused || inlineChipType) return [];
    const m = value.match(/@(\w*)$/);
    if (!m) return [];
    const prefix = "@" + m[1].toLowerCase();
    return ALL_ENTITY_TYPES.filter(t => t.label.toLowerCase().startsWith(prefix));
  }, [value, isFocused, inlineChipType]);

  const atMenuOpen = atMenuItems.length > 0 && !atMenuDismissed;

  const searchResultsOpen = searchResults.length > 0 && isFocused && !disambigOpen && !inlineChipType && !atMenuOpen && !groupByOpen;

  useEffect(() => { setAtMenuIndex(0); }, [atMenuItems.length]);

  /* ─── GroupBy click-outside dismiss ──────────────────────── */

  useEffect(() => {
    if (!groupByOpen) return;
    function handleClickOutside(e: globalThis.MouseEvent) {
      if (
        groupByRef.current && !groupByRef.current.contains(e.target as Node) &&
        wrapperRef.current && !wrapperRef.current.contains(e.target as Node)
      ) {
        setGroupByOpen(false);
        suggestionDepth.current = 0;
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [groupByOpen]);

  /* ─── Detect completed @type/ token ────────────────────── */

  useEffect(() => {
    if (inlineChipType) return;
    if (value === lastCompletionValue.current) return;
    const m = value.match(/@(\w+)\/$/);
    if (!m) return;
    if (/grouped by\s*$/i.test(value.slice(0, m.index))) return;
    const typeName = m[1].toLowerCase();
    const match = ALL_ENTITY_TYPES.find(t => t.type === typeName);
    if (match) {
      lastCompletionValue.current = value;
      setInlineChipType(match.type);
      setChipSearchQuery("");
    }
  }, [value, inlineChipType]);

  /* ─── Ghost suggestion (type-ahead) ──────────────────────── */

  const ghostSuggestion = useMemo(() => {
    if (disambigOpen || atMenuOpen) return null;
    if (!value.trim()) return null;
    return computeGhostSuggestion(value, confirmedEntities, suggestionDepth.current);
  }, [value, confirmedEntities, disambigOpen, atMenuOpen]);

  /* ─── Scroll compaction ───────────────────────────────────── */

  useEffect(() => {
    if (compactProp) return;
    function onScroll() {
      if (window.scrollY >= COMPACT_SCROLL_THRESHOLD) {
        setIsCompact(true);
        window.removeEventListener("scroll", onScroll);
      }
    }
    if (window.scrollY >= COMPACT_SCROLL_THRESHOLD) {
      setIsCompact(true);
      return;
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [compactProp]);

  /* ─── Idle typing animation ───────────────────────────────── */

  const showGhost = !value && !isFocused && !isCompact && confirmedEntities.length === 0;

  useEffect(() => {
    if (isFocused || value || isHovered || isCompact || confirmedEntities.length > 0) return;

    let timeout: ReturnType<typeof setTimeout>;

    function tick() {
      const currentPrompt = PROMPTS[indexRef.current];
      const phase = phaseRef.current;

      if (phase === "typing") {
        charRef.current++;
        setDisplayText(currentPrompt.slice(0, charRef.current));
        if (charRef.current >= currentPrompt.length) {
          phaseRef.current = "pausing";
          timeout = setTimeout(tick, PAUSE_AFTER_TYPE);
        } else {
          timeout = setTimeout(tick, TYPE_SPEED);
        }
      } else if (phase === "pausing") {
        phaseRef.current = "deleting";
        timeout = setTimeout(tick, 0);
      } else if (phase === "deleting") {
        charRef.current--;
        setDisplayText(currentPrompt.slice(0, charRef.current));
        if (charRef.current <= 0) {
          phaseRef.current = "waiting";
          timeout = setTimeout(tick, PAUSE_AFTER_DELETE);
        } else {
          timeout = setTimeout(tick, DELETE_SPEED);
        }
      } else if (phase === "waiting") {
        indexRef.current = (indexRef.current + 1) % PROMPTS.length;
        phaseRef.current = "typing";
        timeout = setTimeout(tick, 0);
      }
    }

    timeout = setTimeout(tick, 600);
    return () => clearTimeout(timeout);
  }, [isFocused, value, isHovered, isCompact, confirmedEntities.length]);

  /* ─── Event handlers ──────────────────────────────────────── */

  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
    const prompt = PROMPTS[indexRef.current];
    setDisplayText(prompt);
    charRef.current = prompt.length;
    phaseRef.current = "pausing";
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
  }, []);

  const handleOverlayClick = useCallback(() => {
    const prompt = PROMPTS[indexRef.current];
    setValue(prompt);
    setIsHovered(false);
    inputRef.current?.focus();
  }, []);

  const focusInput = useCallback(() => {
    inputRef.current?.focus();
  }, []);

  const removeEntity = useCallback((entity: EntityEntry) => {
    setConfirmedEntities((prev) => prev.filter((e) => e.id !== entity.id));
  }, []);

  const removeInlineConfirmed = useCallback((ic: InlineConfirmedEntity) => {
    setValue((prev) => prev.slice(0, ic.start) + prev.slice(ic.end));
    setInlineConfirmed((prev) => {
      const removed = prev.filter((x) => x.start !== ic.start || x.end !== ic.end);
      const shift = ic.end - ic.start;
      return removed.map((x) =>
        x.start > ic.start ? { ...x, start: x.start - shift, end: x.end - shift } : x,
      );
    });
  }, []);

  const confirmEntity = useCallback(
    (detected: DetectedEntity, selected: EntityEntry) => {
      const label = selected.label;
      const before = value.slice(0, detected.start);
      const after = value.slice(detected.end);
      const newValue = before + label + after;
      setValue(newValue);
      setInlineConfirmed((prev) => [
        ...prev,
        { entry: selected, start: detected.start, end: detected.start + label.length },
      ]);
      setDisambigEntity(null);
      setDisambigIndex(0);
      inputRef.current?.focus();
    },
    [value],
  );

  const handleSearchSelect = useCallback(
    (result: SearchResult) => {
      onResultSelect?.(result.id);
      setSearchResults([]);
    },
    [onResultSelect],
  );

  const handleGroupBySelect = useCallback(
    (dim: GroupByDimension) => {
      setGroupByOpen(false);
      suggestionDepth.current = 0;
      if (dim.viewId && onGroupByNavigate) {
        onGroupByNavigate(dim.viewId);
      } else if (!dim.viewId && onPromptSubmit) {
        onPromptSubmit(value);
      }
    },
    [onGroupByNavigate, onPromptSubmit, value],
  );

  const handleEntityHover = useCallback(
    (entity: DetectedEntity, rect: DOMRect) => {
      if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
      hoverTimerRef.current = setTimeout(() => {
        if (!wrapperRef.current) return;
        const wrapperRect = wrapperRef.current.getBoundingClientRect();
        setDisambigLeft(rect.left - wrapperRect.left);
        setDisambigEntity(entity);
        setDisambigIndex(0);
      }, 200);
    },
    [],
  );

  const handleEntityLeave = useCallback(() => {
    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current);
      hoverTimerRef.current = null;
    }
  }, []);

  const selectAtMenuItem = useCallback(
    (item: (typeof ALL_ENTITY_TYPES)[number]) => {
      setValue((prev) => prev.replace(/@\w*$/, item.label));
      setInlineChipType(item.type);
      setChipSearchQuery("");
      setAtMenuDismissed(false);
    },
    [],
  );

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      /* @ autocomplete menu takes priority */
      if (atMenuOpen) {
        if (e.key === "ArrowDown") {
          e.preventDefault();
          setAtMenuIndex((i) => Math.min(i + 1, atMenuItems.length - 1));
        } else if (e.key === "ArrowUp") {
          e.preventDefault();
          setAtMenuIndex((i) => Math.max(i - 1, 0));
        } else if (e.key === "Enter" || (e.key === "Tab" && !e.shiftKey)) {
          e.preventDefault();
          selectAtMenuItem(atMenuItems[atMenuIndex]);
        } else if (e.key === "Escape") {
          e.preventDefault();
          setAtMenuDismissed(true);
        }
        return;
      }

      /* Search results navigation */
      if (searchResultsOpen) {
        if (e.key === "ArrowDown") {
          e.preventDefault();
          setSearchIndex((i) => Math.min(i + 1, searchResults.length - 1));
          return;
        } else if (e.key === "ArrowUp") {
          e.preventDefault();
          setSearchIndex((i) => Math.max(i - 1, 0));
          return;
        } else if (e.key === "Enter") {
          e.preventDefault();
          handleSearchSelect(searchResults[searchIndex]);
          return;
        } else if (e.key === "Escape") {
          e.preventDefault();
          setSearchResults([]);
          return;
        }
      }

      if (e.key === "Tab" && ghostSuggestion && !e.shiftKey) {
        e.preventDefault();
        suggestionDepth.current += 1;

        if (ghostSuggestion.groupByDimension) {
          setValue((prev) => prev + ghostSuggestion.text);
          setGroupByOpen(true);
          setGroupByDimensionId(ghostSuggestion.groupByDimension);
          setGroupByFamily(ghostSuggestion.family);
          setGroupByIndex(0);
        } else {
          const chipMatch = ghostSuggestion.text.match(/@(\w+)\//);
          setValue((prev) => prev + ghostSuggestion.text);
          if (chipMatch) {
            setInlineChipType(chipMatch[1] as EntityType);
            setChipSearchQuery("");
          }
        }
      }

      if (groupByOpen) {
        const dims = getDimensionsForFamily(groupByFamily, groupByDimensionId ?? undefined);
        if (e.key === "ArrowDown") {
          e.preventDefault();
          setGroupByIndex((i) => Math.min(i + 1, dims.length - 1));
        } else if (e.key === "ArrowUp") {
          e.preventDefault();
          setGroupByIndex((i) => Math.max(i - 1, 0));
        } else if (e.key === "Enter") {
          e.preventDefault();
          const selected = dims[groupByIndex];
          if (selected) handleGroupBySelect(selected);
        } else if (e.key === "Escape") {
          e.preventDefault();
          setGroupByOpen(false);
          suggestionDepth.current = 0;
        }
        return;
      }

      if (disambigOpen) {
        const candidates = disambigEntity!.candidates.slice(0, 5);
        if (e.key === "ArrowDown") {
          e.preventDefault();
          setDisambigIndex((prev) => Math.min(prev + 1, candidates.length - 1));
        } else if (e.key === "ArrowUp") {
          e.preventDefault();
          setDisambigIndex((prev) => Math.max(prev - 1, 0));
        } else if (e.key === "Enter") {
          e.preventDefault();
          confirmEntity(disambigEntity!, candidates[disambigIndex]);
        } else if (e.key === "Escape") {
          e.preventDefault();
          setDisambigEntity(null);
        }
      }

      if ((e.key === "Backspace" || e.key === "Delete") && inlineConfirmed.length > 0) {
        const selStart = inputRef.current?.selectionStart ?? 0;
        const selEnd = inputRef.current?.selectionEnd ?? 0;
        const hasSelection = selStart !== selEnd;

        let delStart: number;
        let delEnd: number;
        if (hasSelection) {
          delStart = selStart;
          delEnd = selEnd;
        } else if (e.key === "Backspace") {
          if (selStart === 0) {
            // Nothing to delete; fall through to bar-pill guard below
            if (!value && confirmedEntities.length > 0) {
              e.preventDefault();
              setConfirmedEntities((prev) => prev.slice(0, -1));
              setInlineConfirmed([]);
            }
            return;
          }
          delStart = selStart - 1;
          delEnd = selStart;
        } else {
          if (selStart >= value.length) return;
          delStart = selStart;
          delEnd = selStart + 1;
        }

        e.preventDefault();

        const overlapping = inlineConfirmed.filter(
          (ic) => ic.start < delEnd && ic.end > delStart
        );

        if (overlapping.length > 0) {
          const fullStart = Math.min(delStart, ...overlapping.map((ic) => ic.start));
          const fullEnd = Math.max(delEnd, ...overlapping.map((ic) => ic.end));
          const shift = fullEnd - fullStart;

          setValue((prev) => prev.slice(0, fullStart) + prev.slice(fullEnd));
          setInlineConfirmed((prev) => {
            const remaining = prev.filter(
              (ic) => ic.end <= fullStart || ic.start >= fullEnd
            );
            return remaining.map((ic) =>
              ic.start >= fullEnd
                ? { ...ic, start: ic.start - shift, end: ic.end - shift }
                : ic
            );
          });
          requestAnimationFrame(() => {
            inputRef.current?.setSelectionRange(fullStart, fullStart);
          });
        } else {
          const shift = delEnd - delStart;
          setValue((prev) => prev.slice(0, delStart) + prev.slice(delEnd));
          setInlineConfirmed((prev) =>
            prev.map((ic) =>
              ic.start >= delEnd
                ? { ...ic, start: ic.start - shift, end: ic.end - shift }
                : ic
            )
          );
          requestAnimationFrame(() => {
            inputRef.current?.setSelectionRange(delStart, delStart);
          });
        }
        return;
      }

      if (e.key === "Enter" && onPromptSubmit && value.trim() && !disabled && !searchResultsOpen && !disambigOpen && !atMenuOpen && !groupByOpen) {
        e.preventDefault();
        onPromptSubmit(value);
        return;
      }

      if (
        e.key === "Backspace" &&
        !value &&
        confirmedEntities.length > 0
      ) {
        e.preventDefault();
        setConfirmedEntities((prev) => prev.slice(0, -1));
        setInlineConfirmed([]);
      }
    },
    [atMenuOpen, atMenuItems, atMenuIndex, selectAtMenuItem, searchResultsOpen, searchResults, searchIndex, handleSearchSelect, ghostSuggestion, groupByOpen, groupByFamily, groupByDimensionId, groupByIndex, handleGroupBySelect, disambigOpen, disambigEntity, disambigIndex, confirmEntity, value, confirmedEntities.length, inlineConfirmed, onPromptSubmit],
  );

  /* ─── Plus menu ───────────────────────────────────────────── */

  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    function handleClickOutside(e: globalThis.MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]);

  const selectQuery = useCallback((query: string) => {
    setValue(query);
    setMenuOpen(false);
    inputRef.current?.focus();
  }, []);

  /* ─── Inline chip selector logic ──────────────────────────── */

  const chipPopoverRef = useRef<HTMLDivElement>(null);
  const [chipActiveIndex, setChipActiveIndex] = useState(0);

  const chipEntries = useMemo(() => {
    if (!inlineChipType) return [];
    const all = getRegistryByType(inlineChipType);
    if (!chipSearchQuery.trim()) return all.slice(0, 10);
    const q = chipSearchQuery.toLowerCase();
    return all.filter((e) => e.label.toLowerCase().includes(q)).slice(0, 10);
  }, [inlineChipType, chipSearchQuery]);

  useEffect(() => {
    setChipActiveIndex(0);
  }, [chipSearchQuery, inlineChipType]);

  const closeChipPopover = useCallback(() => {
    setInlineChipType(null);
    setChipSearchQuery("");
    inputRef.current?.focus();
  }, []);

  const selectChipEntry = useCallback(
    (entry: EntityEntry) => {
      const currentVal = inputRef.current?.value ?? "";
      const match = currentVal.match(/@\w+\/\s*$/);
      if (!match || match.index === undefined) {
        closeChipPopover();
        return;
      }
      const start = match.index;
      const label = entry.label;
      const newVal = currentVal.slice(0, start) + label + " ";
      setValue(newVal);
      setInlineConfirmed((old) => [
        ...old,
        { entry, start, end: start + label.length },
      ]);
      closeChipPopover();
    },
    [closeChipPopover],
  );

  useEffect(() => {
    if (!inlineChipType) return;
    function handleClick(e: globalThis.MouseEvent) {
      if (
        chipPopoverRef.current &&
        !chipPopoverRef.current.contains(e.target as Node) &&
        wrapperRef.current &&
        !wrapperRef.current.contains(e.target as Node)
      ) {
        closeChipPopover();
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [inlineChipType, closeChipPopover]);

  useEffect(() => {
    if (inlineChipType && chipInputRef.current) {
      chipInputRef.current.focus();
    }
  }, [inlineChipType]);

  /* ─── Placeholder logic ───────────────────────────────────── */

  const placeholder = showGhost
    ? ""
    : isCompact && !isFocused && !value
      ? COMPACT_PLACEHOLDER
      : "Type to search...";

  /* ─── Render ──────────────────────────────────────────────── */

  return (
    <div ref={wrapperRef} className={styles.wrapper}>
      {/* Plus button */}
      {!hidePlusMenu && (
        <Button
          iconOnly
          size="xs"
          emphasis="minimal"
          className={styles.plusTrigger}
          aria-label="Actions menu"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((prev) => !prev)}
        >
          <Plus size={16} />
        </Button>
      )}

      {/* Plus menu popover */}
      {!hidePlusMenu && menuOpen && (
        <div ref={menuRef} className={styles.menuPopover}>
          <Menu size="sm">
            <MenuLabel>Search history</MenuLabel>
            <MenuItem
              leading={<Clock size={16} />}
              onClick={() => selectQuery("atlas postmortems")}
            >
              atlas postmortems
            </MenuItem>
            <MenuItem
              leading={<Clock size={16} />}
              onClick={() => selectQuery("retrieval-v2 eval results")}
            >
              retrieval-v2 eval results
            </MenuItem>
            <MenuItem
              leading={<Clock size={16} />}
              onClick={() => selectQuery("PII incident guardrails")}
            >
              PII incident guardrails
            </MenuItem>
            <MenuSeparator />
            <MenuItem leading={<Bookmark size={16} />}>
              Save to new view
            </MenuItem>
            <MenuItem leading={<ImagePlus size={16} />}>
              Add files or photos
            </MenuItem>
            <MenuSeparator />
            <MenuLabel>Apps</MenuLabel>
            <MenuItem leading={<Calendar size={16} />}>
              Google Calendar
            </MenuItem>
            <MenuItem
              leading={
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
                  <path d="M2 3.5h5.5v9H2V3.5Zm6.5 0H14v9H8.5V3.5Z" fill="currentColor" opacity="0.8" />
                  <path d="M5.25 7.25 4 8.5l1.25 1.25M10.75 7.25 12 8.5l-1.25 1.25" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              }
            >
              Jira
            </MenuItem>
          </Menu>
        </div>
      )}

      {/* Tag-input hybrid container */}
      <div
        className={`${styles.tagContainer} ${isFocused ? styles.tagContainerFocused : ""} ${hidePlusMenu ? styles.tagContainerNoPad : ""}`}
        onClick={focusInput}
      >
        {/* Confirmed entity pills */}
        {confirmedEntities.map((entity) => (
          <EntityPill
            key={entity.id}
            entity={entity}
            onDismiss={() => removeEntity(entity)}
          />
        ))}

        {/* Text input area */}
        <div className={styles.textArea}>
          {/* Native input */}
          <input
            ref={inputRef}
            className={`${styles.nativeInput} ${inlineConfirmed.length > 0 ? styles.nativeInputHidden : ""}`}
            type="text"
            value={value}
            placeholder={placeholder}
            disabled={disabled}
            autoFocus={autoFocus}
            onChange={(e) => {
              const newVal = e.target.value;
              setValue(newVal);
              suggestionDepth.current = 0;
              setAtMenuDismissed(false);

              if (inlineConfirmed.length > 0) {
                setInlineConfirmed((prev) => {
                  const result: InlineConfirmedEntity[] = [];
                  let searchFrom = 0;
                  const sorted = [...prev].sort((a, b) => a.start - b.start);
                  for (const ic of sorted) {
                    const idx = newVal.indexOf(ic.entry.label, searchFrom);
                    if (idx !== -1) {
                      result.push({ ...ic, start: idx, end: idx + ic.entry.label.length });
                      searchFrom = idx + ic.entry.label.length;
                    }
                  }
                  return result;
                });
              }
            }}
            onFocus={() => {
              setIsFocused(true);
              onFocusChange?.(true);
            }}
            onBlur={() => {
              setIsFocused(false);
              onFocusChange?.(false);
              if (!disambigOpen) setDisambigEntity(null);
              if (groupByOpen) {
                setGroupByOpen(false);
                suggestionDepth.current = 0;
              }
            }}
            onKeyDown={handleKeyDown}
            aria-label="Search documents"
            aria-autocomplete="list"
            aria-expanded={disambigOpen}
          />

          {/* Text overlay: mirrors input with entity underlines + ghost text */}
          {(value || ghostSuggestion) && !showGhost && (
            <div className={styles.textOverlay} aria-hidden="true">
              {renderOverlaySegments(
                value,
                detectedEntities,
                inlineConfirmed,
                handleEntityHover,
                handleEntityLeave,
                removeInlineConfirmed,
              )}
              {ghostSuggestion && (
                <span className={styles.ghostSuggestion}>
                  {ghostSuggestion.text}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Search icon */}
        <span className={styles.searchIcon}>
          <Search size={20} />
        </span>
      </div>

      {/* Disambiguation popover */}
      {disambigOpen && (
        <DisambiguationPopover
          entity={disambigEntity!}
          left={disambigLeft}
          activeIndex={disambigIndex}
          onSelect={(entry) => confirmEntity(disambigEntity!, entry)}
          onDismiss={() => setDisambigEntity(null)}
          below={popoverBelow}
        />
      )}

      {/* Inline chip selector popover */}
      {inlineChipType && (
        <div
          ref={chipPopoverRef}
          className={`${styles.chipPopover} ${popoverBelow ? styles.chipPopoverBelow : ""}`}
          onMouseDown={(e) => e.preventDefault()}
        >
          <div className={styles.chipPopoverSearch}>
            <Search size={14} />
            <input
              ref={chipInputRef}
              className={styles.chipPopoverInput}
              placeholder={`Search ${inlineChipType}...`}
              value={chipSearchQuery}
              onChange={(e) => setChipSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "ArrowDown") {
                  e.preventDefault();
                  setChipActiveIndex((i) => Math.min(i + 1, chipEntries.length - 1));
                } else if (e.key === "ArrowUp") {
                  e.preventDefault();
                  setChipActiveIndex((i) => Math.max(i - 1, 0));
                } else if (e.key === "Enter" && chipEntries.length > 0) {
                  e.preventDefault();
                  selectChipEntry(chipEntries[chipActiveIndex]);
                } else if (e.key === "Escape") {
                  e.preventDefault();
                  closeChipPopover();
                }
              }}
            />
          </div>
          <div className={styles.chipPopoverList}>
            {chipEntries.map((entry, i) => (
              <div
                key={entry.id}
                className={`${styles.chipPopoverRow} ${i === chipActiveIndex ? styles.chipPopoverRowActive : ""}`}
                role="option"
                aria-selected={i === chipActiveIndex}
                onClick={() => selectChipEntry(entry)}
                onMouseDown={(e) => e.preventDefault()}
              >
                <span className={styles.chipPopoverLabel}>{entry.label}</span>
                {entry.description && (
                  <span className={styles.chipPopoverMeta}>{entry.description}</span>
                )}
              </div>
            ))}
            {chipEntries.length === 0 && (
              <div className={styles.chipPopoverRow} style={{ cursor: "default", opacity: 0.5 }}>
                <span className={styles.chipPopoverLabel}>No matches</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* GroupBy dimension picker popover */}
      {groupByOpen && (
        <div
          ref={groupByRef}
          className={`${styles.chipPopover} ${popoverBelow ? styles.chipPopoverBelow : ""}`}
          onMouseDown={(e) => e.preventDefault()}
        >
          <div className={styles.groupByHeader}>Group by</div>
          <div className={styles.chipPopoverList}>
            {getDimensionsForFamily(groupByFamily, groupByDimensionId ?? undefined).map((dim, i) => {
              const Icon = DIMENSION_ICONS[dim.icon];
              const isDisabled = !dim.viewId && !onPromptSubmit;
              return (
                <div
                  key={dim.id}
                  className={`${styles.chipPopoverRow} ${i === groupByIndex ? styles.chipPopoverRowActive : ""} ${isDisabled ? styles.groupByRowDisabled : ""}`}
                  role="option"
                  aria-selected={i === groupByIndex}
                  onClick={() => !isDisabled && handleGroupBySelect(dim)}
                  onMouseEnter={() => !isDisabled && setGroupByIndex(i)}
                  onMouseDown={(e) => e.preventDefault()}
                >
                  {Icon && <Icon size={14} />}
                  <span className={styles.chipPopoverLabel}>{dim.label}</span>
                  <span className={styles.groupByDescription}>{dim.description}</span>
                  <span className={styles.groupByAction}>
                    {dim.viewId ? (
                      <>Open &ldquo;{dim.viewName}&rdquo; in workspace <ArrowRight size={12} /></>
                    ) : onPromptSubmit ? (
                      <>Build custom view <ArrowRight size={12} /></>
                    ) : null}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* @ autocomplete menu popover */}
      {atMenuOpen && (
        <div className={`${styles.chipPopover} ${popoverBelow ? styles.chipPopoverBelow : ""}`} onMouseDown={(e) => e.preventDefault()}>
          <div className={styles.chipPopoverList}>
            {atMenuItems.map((item, i) => {
              const Icon = ENTITY_ICONS[item.icon];
              return (
                <div
                  key={item.type}
                  className={`${styles.chipPopoverRow} ${i === atMenuIndex ? styles.chipPopoverRowActive : ""}`}
                  onClick={() => selectAtMenuItem(item)}
                  onMouseDown={(e) => e.preventDefault()}
                >
                  {Icon && <Icon size={14} />}
                  <span className={styles.chipPopoverLabel}>{item.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Search results dropdown */}
      {searchResultsOpen && (
        <div className={styles.searchResults} onMouseDown={(e) => e.preventDefault()}>
          <div className={styles.searchResultsHeader}>
            Documents
            {isSearching && <span className={styles.searchResultsSpinner} />}
          </div>
          <div className={styles.searchResultsList}>
            {searchResults.map((result, i) => {
              const c = result.confidence;
              const tier = c >= 0.85 ? "High" : c >= 0.6 ? "Moderate" : "Low";
              const appearance = c >= 0.85 ? ("positive" as const) : c >= 0.6 ? ("warning" as const) : ("negative" as const);
              const emphasis = c >= 0.85 ? ("minimal" as const) : ("subtle" as const);

              return (
                <div
                  key={result.id}
                  className={`${styles.searchResultRow} ${i === searchIndex ? styles.searchResultRowActive : ""}`}
                  role="option"
                  aria-selected={i === searchIndex}
                  onClick={() => handleSearchSelect(result)}
                  onMouseEnter={() => setSearchIndex(i)}
                >
                  <FileText size={14} className={styles.searchResultIcon} />
                  <div className={styles.searchResultContent}>
                    <span className={styles.searchResultTitle}>{result.title}</span>
                    <span className={styles.searchResultMeta}>
                      {result.category}
                      {result.owner && <> &middot; {result.owner}</>}
                    </span>
                  </div>
                  <Badge appearance={appearance} emphasis={emphasis} size="xxs" shape="pill">
                    {tier}
                  </Badge>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Idle ghost text overlay (typing animation) */}
      {showGhost && (
        <div
          className={styles.overlay}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onClick={handleOverlayClick}
        >
          <span
            className={`${styles.ghostText} ${isHovered ? styles.breathing : ""}`}
          >
            {displayText}
          </span>
        </div>
      )}
    </div>
  );
});
