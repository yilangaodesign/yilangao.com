"use client";

import { Fragment, useState, useMemo, useRef, useEffect, useLayoutEffect } from "react";
import { flushSync } from "react-dom";
import { treemap, treemapSquarify, hierarchy } from "d3-hierarchy";
import styles from "./skill-map.module.scss";
import type { AntipatternData } from "@/app/(frontend)/api/antipatterns/route";
import type { SkillsData, LiveSkillPhase } from "@/app/(frontend)/api/skills/route";

// Skill card data is fetched live from /api/skills which reads
// .cursor/skills/*/SKILL.md at request time. Types live in the route file.

// Static fallback used while the live fetch is in-flight.
// Mirrors the API's PHASE_MAP so the layout is stable before data arrives.
const FALLBACK_PHASES: LiveSkillPhase[] = [
  { label: "Input",   skills: [] },
  { label: "Work",    skills: [] },
  { label: "Gates",   skills: [] },
  { label: "Release", skills: [] },
];

// ── Treemap types ─────────────────────────────────────────────────────────────

type LiveCategory = {
  name: string;
  domain: "design" | "engineering" | "content";
  value: number;
  /** Titles of the 3 most recent APs for this category (from the API). */
  topThree: string[];
};

type DomainTotals = {
  design: number;
  engineering: number;
  content: number;
  grand: number;
};

// ── Domain styles / labels ────────────────────────────────────────────────────

const DOMAIN_STYLES: Record<string, { block: string; dot: string }> = {
  design: { block: styles.domainDesign, dot: styles.legendDotDesign },
  engineering: { block: styles.domainEngineering, dot: styles.legendDotEngineering },
  content: { block: styles.domainContent, dot: styles.legendDotContent },
};

const DOMAIN_LABELS: Record<string, string> = {
  design: "Design",
  engineering: "Engineering",
  content: "Content",
};

// ── Helper: build flat category list from API response ────────────────────────

function flatCategoriesFromData(data: AntipatternData): LiveCategory[] {
  return data.domains.flatMap((d) =>
    d.categories.map((c) => ({
      name: c.name,
      domain: d.domain,
      value: c.count,
      topThree: c.topThree ?? [],
    }))
  );
}

function domainTotalsFromData(data: AntipatternData): DomainTotals {
  const design = data.domains.find((d) => d.domain === "design")?.total ?? 0;
  const engineering = data.domains.find((d) => d.domain === "engineering")?.total ?? 0;
  const content = data.domains.find((d) => d.domain === "content")?.total ?? 0;
  return { design, engineering, content, grand: design + engineering + content };
}

// ── Operations view ──────────────────────────────────────────────────────────

function OperationsGrid() {
  const [expanded, setExpanded] = useState<string | null>(null);
  const [phases, setPhases] = useState<LiveSkillPhase[]>(FALLBACK_PHASES);
  const [total, setTotal] = useState(0);
  const [gridFixedHeight, setGridFixedHeight] = useState<number | undefined>(undefined);
  const gridRef = useRef<HTMLDivElement | null>(null);
  const measuredRef = useRef(false);

  useEffect(() => {
    fetch("/api/skills")
      .then((r) => r.json())
      .then((data: SkillsData) => {
        setPhases(data.phases);
        setTotal(data.total);
      })
      .catch(() => {
        // Leave fallback in place on error
      });
  }, []);

  // One-time measurement pass: expand each card, measure the tallest grid
  // height, then lock that value so the grid never shifts on expand/collapse.
  // The measurement runs inside a microtask so flushSync executes outside
  // React's commit phase (React 19 forbids flushSync during lifecycle methods).
  // Microtasks fire after the current task ends but before the browser paints,
  // so intermediate expansion states remain invisible.
  useLayoutEffect(() => {
    if (measuredRef.current) return;
    if (phases.every((p) => p.skills.length === 0)) return;

    const el = gridRef.current;
    if (!el) return;

    measuredRef.current = true;

    queueMicrotask(() => {
      const allNames = phases.flatMap((p) => p.skills.map((s) => s.name));
      let maxH = el.offsetHeight;

      for (const name of allNames) {
        flushSync(() => setExpanded(name));
        const h = el.offsetHeight;
        if (h > maxH) maxH = h;
      }

      flushSync(() => setExpanded(null));
      setGridFixedHeight(maxH);
    });
  }, [phases]);

  return (
    <div
      ref={gridRef}
      className={styles.operationsGrid}
      style={gridFixedHeight !== undefined ? { height: gridFixedHeight, overflowY: 'hidden' } : undefined}
      role="list"
      aria-label={
        total > 0
          ? `${total} skills in workflow order: input, work, gates, release`
          : "Skills organized by workflow phase"
      }
    >
      {phases.map((phase, i) => (
        <Fragment key={phase.label}>
          <div className={styles.categoryColumn} role="listitem">
            <div className={styles.categoryHeader}>
              {phase.label}
            </div>
            {phase.skills.map((skill) => {
              const isExpanded = expanded === skill.name;
              return (
                <button
                  key={skill.name}
                  className={`${styles.skillCard} ${isExpanded ? styles.skillCardExpanded : ""}`}
                  onClick={() => setExpanded(isExpanded ? null : skill.name)}
                  aria-expanded={isExpanded}
                >
                  <span className={styles.skillName}>{skill.name}</span>
                  {skill.trigger && (
                    <span className={styles.skillTrigger}>{skill.trigger}</span>
                  )}
                  {isExpanded && skill.description && (
                    <span className={styles.skillDetail}>{skill.description}</span>
                  )}
                </button>
              );
            })}
          </div>
          {i < phases.length - 1 && (
            <div className={styles.phaseConnector} aria-hidden="true">→</div>
          )}
        </Fragment>
      ))}
    </div>
  );
}

// ── Knowledge treemap ────────────────────────────────────────────────────────

type TooltipState = {
  x: number;
  y: number;
  domain: string;
  category: string;
  count: number;
  topThree: string[];
} | null;

/** Tooltip is fixed 240px wide with `translate(-50%, -100%)`; clamp anchor so tooltip stays in container. */
const TREEMAP_TOOLTIP_CLAMP_HALF_PX = 120;

function clampTreemapTooltipX(x: number, containerWidthPx: number): number {
  const edge = 8;
  const half = TREEMAP_TOOLTIP_CLAMP_HALF_PX;
  const minX = edge + half;
  const maxX = containerWidthPx - edge - half;
  if (maxX <= minX) return containerWidthPx / 2;
  return Math.min(Math.max(x, minX), maxX);
}

type KnowledgeTreemapProps = {
  categories: LiveCategory[];
  totals: DomainTotals;
};

/**
 * Tile layout modes, classified from measured pixel dimensions:
 *  column  — normal tiles: label top-left, count bottom-right.
 *  row     — vertical slivers: label-only on a single horizontal line.
 *            Label uses the same type-xs as column mode — no downscaling.
 *            Count is suppressed (available in the tooltip).
 *  silent  — tiles physically too small for any text; colour-only.
 *
 * Design principle (AP-072): orientation-driven content layout.
 * A vertical sliver (h > w × SLIVER_RATIO) switches to a single-line
 * horizontal label. Micro-fonts are never used — if a tile cannot
 * accommodate normal text it shows nothing rather than illegible text.
 * Users can compromise on proportional accuracy; they cannot read 8px
 * text on a saturated colour surface.
 */
// Minimum height for one line of type-xs (12px) plus minimal padding.
const TILE_MIN_LINE_PX = 16;

// Below this width, the tile is truly too narrow for even "…" — silent.
// Set to 20px so a 31px-wide sliver gets row mode instead of blank.
const TILE_SILENT_W_PX = 20;

// Column mode needs TWO lines: label (type-xs ≈ 16px) + count (type-2xs
// ≈ 14px) + padding (8px) ≈ 38px. Below this, suppress the count.
const TILE_MIN_TWO_LINE_PX = 38;

// When height exceeds width by this factor, use row (single-line) layout.
const TILE_SLIVER_RATIO = 1.5;

type TileMode = "column" | "row" | "silent";

function classifyTile(pxW: number, pxH: number): TileMode {
  // Too short for any line of text regardless of width.
  if (pxH < TILE_MIN_LINE_PX) return "silent";
  // Too narrow even for a truncated label — truly blank.
  if (pxW < TILE_SILENT_W_PX) return "silent";
  // Sliver orientation OR too short for two stacked lines → row.
  if (pxH / pxW > TILE_SLIVER_RATIO || pxH < TILE_MIN_TWO_LINE_PX) return "row";
  return "column";
}

function KnowledgeTreemap({ categories, totals }: KnowledgeTreemapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [tooltip, setTooltip] = useState<TooltipState>(null);
  const [hoveredKey, setHoveredKey] = useState<string | null>(null);
  const [containerPx, setContainerPx] = useState({ w: 676, h: 380 });

  // Always-mounted tooltip: animate height between content sizes rather than
  // mount/unmount. Height is measured from the inner content div so CSS can
  // transition between exact pixel values (height: auto doesn't transition).
  // rAF ensures the browser paints the "before" height before we set the "after"
  // value — without it both happen in the same frame and no transition fires.
  const tooltipContentRef = useRef<HTMLDivElement>(null);
  const [tooltipH, setTooltipH] = useState(0);

  // Track the last known tooltip anchor position so the dismiss animation
  // stays at the correct location rather than jumping to (0,0).
  const lastTooltipPosRef = useRef({ x: 0, y: 0 });
  // `tooltipOrigin` is the CSS transform-origin for the scale animation:
  // - '50% 100%' (bottom-center, near cursor) when appearing
  // - corner nearest the container exit point when dismissing
  const [tooltipOrigin, setTooltipOrigin] = useState('50% 100%');

  useEffect(() => {
    const el = tooltipContentRef.current;
    if (!el) return;
    if (!tooltip) {
      // Collapse immediately so the CSS transition runs from current → 0.
      setTooltipH(0);
      return;
    }
    // Defer one frame: the browser must paint the current height before we
    // change it, otherwise the transition has no "from" value and won't fire.
    const raf = requestAnimationFrame(() => {
      setTooltipH(el.scrollHeight);
    });
    return () => cancelAnimationFrame(raf);
  }, [tooltip]);

  // Track container pixel dimensions for accurate tile classification.
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      setContainerPx({ w: entry.contentRect.width, h: entry.contentRect.height });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const layout = useMemo(() => {
    if (categories.length === 0) return [];

    const root = hierarchy({
      name: "root",
      children: categories,
    }).sum((d: any) => d.value || 0);

    const tm = treemap<any>()
      .size([1, 1])
      .tile(treemapSquarify)
      .round(false)
      .padding(0);

    tm(root);
    return root.leaves();
  }, [categories]);

  const ariaLabel = `Anti-pattern distribution across design, engineering, and content domains. Design: ${totals.design}, Engineering: ${totals.engineering}, Content: ${totals.content}.`;

  // Keep lastTooltipPosRef in sync during live tracking so the dismiss
  // animation stays anchored at the last cursor position.
  if (tooltip) {
    lastTooltipPosRef.current = { x: tooltip.x, y: tooltip.y };
  }

  return (
    <div className={styles.visualizationWithLegend}>
      <div
        ref={containerRef}
        className={styles.treemapContainer}
        onMouseLeave={(e) => {
          // Determine which corner of the container the mouse exited through
          // and use it as the scale-shrink anchor point on the tooltip.
          const rect = containerRef.current?.getBoundingClientRect();
          if (rect) {
            const xFrac = (e.clientX - rect.left) / rect.width;
            const yFrac = (e.clientY - rect.top) / rect.height;
            setTooltipOrigin(
              `${xFrac < 0.5 ? '0%' : '100%'} ${yFrac < 0.5 ? '0%' : '100%'}`
            );
          }
          setTooltip(null);
          setHoveredKey(null);
        }}
        role="img"
        aria-label={ariaLabel}
      >
        {layout.map((leaf: any, i: number) => {
          const domain = leaf.data.domain as string;
          const x0 = leaf.x0 * 100;
          const y0 = leaf.y0 * 100;
          const w = (leaf.x1 - leaf.x0) * 100;
          const h = (leaf.y1 - leaf.y0) * 100;
          const key = `${domain}-${leaf.data.name}-${i}`;
          const isHovered = hoveredKey === key;
          const isDimmed = hoveredKey !== null && !isHovered;

          // Classify tile based on measured pixel dimensions (AP-072).
          const pxW = (w / 100) * containerPx.w;
          const pxH = (h / 100) * containerPx.h;
          const tileMode = classifyTile(pxW, pxH);

          return (
            <div
              key={key}
              className={[
                styles.treemapBlock,
                DOMAIN_STYLES[domain]?.block ?? "",
                tileMode === "row" ? styles.treemapBlockRow : "",
                isHovered ? styles.treemapBlockHovered : "",
                isDimmed ? styles.treemapBlockDimmed : "",
              ]
                .filter(Boolean)
                .join(" ")}
              style={{
                left: `${x0}%`,
                top: `${y0}%`,
                width: `${w}%`,
                height: `${h}%`,
              }}
              onMouseEnter={(e) => {
                setHoveredKey(key);
                // Reset origin to bottom-center (near cursor) so the tooltip
                // grows from the cursor position when appearing fresh.
                setTooltipOrigin('50% 100%');
                const rect = containerRef.current?.getBoundingClientRect();
                if (!rect) return;
                const rawX = e.clientX - rect.left;
                setTooltip({
                  x: clampTreemapTooltipX(rawX, rect.width),
                  y: e.clientY - rect.top,
                  domain: DOMAIN_LABELS[domain] ?? domain,
                  category: leaf.data.name,
                  count: leaf.data.value,
                  topThree: leaf.data.topThree ?? [],
                });
              }}
              onMouseMove={(e) => {
                const rect = containerRef.current?.getBoundingClientRect();
                if (!rect) return;
                const rawX = e.clientX - rect.left;
                setTooltip((prev) =>
                  prev
                    ? {
                        ...prev,
                        x: clampTreemapTooltipX(rawX, rect.width),
                        y: e.clientY - rect.top,
                      }
                    : null
                );
              }}
              onMouseLeave={() => {
                // Only clear the tile highlight — do NOT clear tooltip here.
                // The tooltip stays visible while moving between tiles and only
                // dismisses when the mouse exits the entire container.
                setHoveredKey(null);
              }}
            >
              {/* silent: truly too small — colour only, no text */}
              {(tileMode === "column" || tileMode === "row") && (
                <>
                  {/* Label is always the hero — top-left (column) or left (row) */}
                  <span className={styles.treemapLabel}>{leaf.data.name}</span>
                  {/*
                   * Count in column mode only, and only when the tile is tall
                   * enough for two stacked lines. Row-mode slivers show label
                   * only — count is available in the tooltip.
                   */}
                  {tileMode === "column" && pxH >= TILE_MIN_TWO_LINE_PX && (
                    <span className={styles.treemapCount}>{leaf.data.value}</span>
                  )}
                </>
              )}
            </div>
          );
        })}

        {/* Tooltip anchor: handles absolute positioning + translate(-50%,-100%).
            Uses lastTooltipPosRef when dismissed so the retract animation stays
            at the last cursor position instead of jumping to (0,0). */}
        <div
          className={styles.treemapTooltipAnchor}
          style={{
            left: tooltip ? tooltip.x : lastTooltipPosRef.current.x,
            top: tooltip ? tooltip.y : lastTooltipPosRef.current.y,
          }}
        >
        {/* Tooltip visual: handles height, opacity, and the corner-retract scale.
            transform-origin is set per-dismiss to the container exit quadrant so
            the tooltip appears to retract toward where the mouse left. */}
        <div
          className={styles.treemapTooltip}
          style={{
            height: tooltipH,
            opacity: tooltip ? 1 : 0,
            transform: `scale(${tooltip ? 1 : 0})`,
            transformOrigin: tooltipOrigin,
          }}
        >
          <div ref={tooltipContentRef} className={styles.treemapTooltipInner}>
            {tooltip && (
              <>
                {/* Top: explains what the bullets below are */}
                <span className={styles.treemapTooltipHeader}>Top examples</span>

                {/* Middle: the 3 most recent anti-patterns for this category */}
                {tooltip.topThree.length > 0 && (
                  <ul className={styles.treemapTooltipList}>
                    {tooltip.topThree.map((ap, idx) => (
                      <li key={idx} className={styles.treemapTooltipItem}>{ap}</li>
                    ))}
                  </ul>
                )}

                {/* Bottom: domain + count — the "where" and "how many" */}
                <div className={styles.treemapTooltipFooter}>
                  <span className={styles.treemapTooltipDomain}>{tooltip.domain.toUpperCase()}</span>
                  <span className={styles.treemapTooltipCount}>{tooltip.count} anti-patterns</span>
                </div>
              </>
            )}
          </div>
        </div>
        </div>{/* end treemapTooltipAnchor */}
      </div>

      <div className={styles.legend}>
        {Object.entries(DOMAIN_LABELS).map(([key, label]) => (
          <span key={key} className={styles.legendItem}>
            <span className={`${styles.legendDot} ${DOMAIN_STYLES[key]?.dot ?? ""}`} />
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}

// ── Composed component ───────────────────────────────────────────────────────

export default function SkillMap() {
  const [liveData, setLiveData] = useState<AntipatternData | null>(null);
  const [fetchError, setFetchError] = useState(false);

  useEffect(() => {
    fetch("/api/antipatterns")
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json() as Promise<AntipatternData>;
      })
      .then((data) => setLiveData(data))
      .catch(() => setFetchError(true));
  }, []);

  const categories: LiveCategory[] = liveData ? flatCategoriesFromData(liveData) : [];
  const totals: DomainTotals = liveData
    ? domainTotalsFromData(liveData)
    : { design: 0, engineering: 0, content: 0, grand: 0 };

  const knowledgeLabel =
    liveData
      ? `Knowledge (${liveData.grandTotal} anti-patterns)`
      : fetchError
      ? "Knowledge (anti-patterns)"
      : "Knowledge";

  return (
    <div className={styles.container}>
      <section className={styles.section}>
        <h3 className={styles.sectionHeader}>Operations (16 skills)</h3>
        <OperationsGrid />
      </section>
      <section className={styles.section}>
        <h3 className={styles.sectionHeader}>{knowledgeLabel}</h3>
        {categories.length > 0 ? (
          <KnowledgeTreemap categories={categories} totals={totals} />
        ) : !fetchError ? (
          <div className={styles.treemapLoading} aria-label="Loading anti-pattern data" />
        ) : null}
      </section>
    </div>
  );
}
