"use client";

import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import styles from "./maturity-timeline.module.scss";
import type {
  MaturityData,
  DayBreakdown,
} from "@/app/(frontend)/api/maturity/route";

// ── Tooltip helpers ──────────────────────────────────────────────────────────

type TooltipState = {
  x: number;
  dayIndex: number;
} | null;

const TOOLTIP_HALF_PX = 75;

function clampTooltipX(x: number, containerWidthPx: number): number {
  const edge = 8;
  const half = TOOLTIP_HALF_PX;
  const minX = edge + half;
  const maxX = containerWidthPx - edge - half;
  if (maxX <= minX) return containerWidthPx / 2;
  return Math.min(Math.max(x, minX), maxX);
}

// ── View mode ─────────────────────────────────────────────────────────────────

type ViewMode = "severity" | "domain" | "recurrence";

const SEVERITY_KEYS = ["fundamental", "structural", "refinement"] as const;
const DOMAIN_KEYS = ["engineering", "design", "content"] as const;
const RECURRENCE_KEYS = ["recurrent", "approximate", "novel"] as const;

const SEVERITY_LABELS: Record<string, string> = {
  fundamental: "Fundamental",
  structural: "Structural",
  refinement: "Refinement",
};

const DOMAIN_LABELS: Record<string, string> = {
  design: "Design",
  engineering: "Engineering",
  content: "Content",
};

const RECURRENCE_LABELS: Record<string, string> = {
  recurrent: "Recurrent (cited AP)",
  approximate: "Approximate (loose match)",
  novel: "Novel (uncategorized)",
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function rollingMedian(values: number[], window: number): number[] {
  const result: number[] = [];
  const half = Math.floor(window / 2);
  for (let i = 0; i < values.length; i++) {
    const start = Math.max(0, i - half);
    const end = Math.min(values.length - 1, i + half);
    const slice = values.slice(start, end + 1).sort((a, b) => a - b);
    const mid = Math.floor(slice.length / 2);
    result.push(
      slice.length % 2 === 0
        ? (slice[mid - 1] + slice[mid]) / 2
        : slice[mid]
    );
  }
  return result;
}

// ── Component ────────────────────────────────────────────────────────────────

export default function MaturityTimeline() {
  const [mode, setMode] = useState<ViewMode>("severity");
  const [hoveredDay, setHoveredDay] = useState<number | null>(null);
  const [trendHovered, setTrendHovered] = useState(false);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [liveData, setLiveData] = useState<MaturityData | null>(null);
  const chartRef = useRef<HTMLDivElement | null>(null);

  // Always-mounted tooltip: animate height/opacity/scale instead of mount/unmount
  const [tooltip, setTooltip] = useState<TooltipState>(null);
  const tooltipContentRef = useRef<HTMLDivElement>(null);
  const [tooltipH, setTooltipH] = useState(0);
  const lastTooltipXRef = useRef(0);
  const [tooltipOrigin, setTooltipOrigin] = useState("50% 100%");

  useEffect(() => {
    const el = tooltipContentRef.current;
    if (!el) return;
    if (!tooltip) {
      setTooltipH(0);
      return;
    }
    const raf = requestAnimationFrame(() => {
      setTooltipH(el.scrollHeight);
    });
    return () => cancelAnimationFrame(raf);
  }, [tooltip]);

  if (tooltip) {
    lastTooltipXRef.current = tooltip.x;
  }

  useEffect(() => {
    fetch("/api/maturity")
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json() as Promise<MaturityData>;
      })
      .then((d) => setLiveData(d))
      .catch(() => {});
  }, []);

  const days: DayBreakdown[] = liveData?.days ?? [];

  const keys =
    mode === "severity" ? SEVERITY_KEYS
    : mode === "domain" ? DOMAIN_KEYS
    : RECURRENCE_KEYS;
  const labels =
    mode === "severity" ? SEVERITY_LABELS
    : mode === "domain" ? DOMAIN_LABELS
    : RECURRENCE_LABELS;

  const maxTotal = useMemo(
    () => (days.length === 0 ? 1 : Math.max(...days.map((d) => d.total))),
    [days]
  );

  const medianLine = useMemo(() => {
    if (days.length < 2) return [];
    const windowSize = Math.max(3, Math.round(days.length * 0.25));
    return rollingMedian(
      days.map((d) => d.total),
      windowSize
    );
  }, [days]);

  const segClasses: Record<string, string> =
    mode === "severity"
      ? { fundamental: styles.accentDark, structural: styles.accentMid, refinement: styles.accentLight }
      : mode === "domain"
      ? { engineering: styles.domainEngineering, design: styles.domainDesign, content: styles.domainContent }
      : { recurrent: styles.recurrenceDark, approximate: styles.recurrenceMid, novel: styles.recurrenceLight };

  const legendClasses: Record<string, string> =
    mode === "severity"
      ? { fundamental: styles.legendAccentDark, structural: styles.legendAccentMid, refinement: styles.legendAccentLight }
      : mode === "domain"
      ? { engineering: styles.legendEngineering, design: styles.legendDesign, content: styles.legendContent }
      : { recurrent: styles.legendRecurrenceDark, approximate: styles.legendRecurrenceMid, novel: styles.legendRecurrenceLight };

  const buildDayLabel = liveData
    ? `${liveData.totalBuildDays} build days`
    : "build days";

  // SVG geometry for the trend line
  const chartHeight = 220;
  const trendPadTop = 20;
  const trendPadBottom = 0;
  const usableH = chartHeight - trendPadTop - trendPadBottom;

  // Y-axis scale: round up to a nice ceiling, compute gridline positions
  const yCeiling = useMemo(() => {
    if (maxTotal <= 5) return 5;
    return Math.ceil(maxTotal / 5) * 5;
  }, [maxTotal]);

  const yGridLines = useMemo(() => {
    const step = yCeiling <= 15 ? 5 : 10;
    const lines: number[] = [];
    for (let v = step; v <= yCeiling; v += step) lines.push(v);
    return lines;
  }, [yCeiling]);

  function yFromVal(val: number): number {
    if (yCeiling === 0) return chartHeight;
    return trendPadTop + usableH * (1 - val / yCeiling);
  }

  // X-axis ceiling: next multiple of 5 above actual day count
  const xCeiling = useMemo(() => {
    if (days.length === 0) return 5;
    return Math.ceil(days.length / 5) * 5;
  }, [days]);

  const trendPoints = medianLine
    .map((val, i) => {
      const x = ((i + 0.5) / xCeiling) * 100;
      const y = yFromVal(val);
      return `${x},${y}`;
    })
    .join(" ");

  // Resolve pointer clientX to the nearest day index within the chart
  const resolveDayFromPointer = useCallback(
    (clientX: number) => {
      const el = chartRef.current;
      if (!el || xCeiling === 0) return null;
      const rect = el.getBoundingClientRect();
      const relX = clientX - rect.left;
      const pct = relX / rect.width;
      const idx = Math.round(pct * xCeiling - 0.5);
      if (idx < 0 || idx >= days.length) return null;
      return idx;
    },
    [xCeiling, days.length]
  );

  // Hovered day's median trend value and position (for the crosshair dot)
  const hoveredMedian = hoveredDay !== null && medianLine.length > hoveredDay
    ? medianLine[hoveredDay]
    : null;
  const hoveredX = hoveredDay !== null && xCeiling > 0
    ? ((hoveredDay + 0.5) / xCeiling) * 100
    : null;
  const hoveredY = hoveredMedian !== null ? yFromVal(hoveredMedian) : null;

  return (
    <div
      className={styles.container}
      role="region"
      aria-label={`Correction maturity timeline — ${buildDayLabel}, showing trend by ${mode}`}
      onClick={(e) => {
        if (activeFilter && (e.target as HTMLElement).closest(`.${styles.legendFilter}`) === null) {
          setActiveFilter(null);
        }
      }}
    >
      <div className={styles.controls}>
        <div className={styles.toggleGroup} role="radiogroup" aria-label="View mode">
          <button
            className={`${styles.toggleButton} ${mode === "severity" ? styles.toggleButtonActive : ""}`}
            onClick={() => { setMode("severity"); setActiveFilter(null); }}
            role="radio"
            aria-checked={mode === "severity"}
          >
            By severity
          </button>
          <button
            className={`${styles.toggleButton} ${mode === "domain" ? styles.toggleButtonActive : ""}`}
            onClick={() => { setMode("domain"); setActiveFilter(null); }}
            role="radio"
            aria-checked={mode === "domain"}
          >
            By domain
          </button>
          <button
            className={`${styles.toggleButton} ${mode === "recurrence" ? styles.toggleButtonActive : ""}`}
            onClick={() => { setMode("recurrence"); setActiveFilter(null); }}
            role="radio"
            aria-checked={mode === "recurrence"}
          >
            By recurrence
          </button>
        </div>
      </div>

      <div className={styles.visualizationWithLegend}>
        {liveData === null && (
          <div className={styles.chartLoading} aria-label="Loading maturity data" />
        )}

        <div className={styles.chartWithAxis} style={liveData === null ? { display: "none" } : undefined}>
          {/* Y-axis labels */}
          <div className={styles.yAxis} style={{ height: chartHeight }}>
            {yGridLines.map((v) => (
              <span
                key={v}
                className={styles.yLabel}
                style={{ bottom: `${(v / yCeiling) * (usableH / chartHeight) * 100}%` }}
              >
                {v}
              </span>
            ))}
            <span className={styles.yLabel} style={{ bottom: 0 }}>0</span>
          </div>

          <div
            ref={chartRef}
            className={styles.combinedChart}
            style={{ height: chartHeight }}
            onMouseLeave={(e) => {
              const rect = chartRef.current?.getBoundingClientRect();
              if (rect) {
                const xFrac = (e.clientX - rect.left) / rect.width;
                setTooltipOrigin(`${xFrac < 0.5 ? "0%" : "100%"} 100%`);
              }
              setTooltip(null);
              setHoveredDay(null);
              setTrendHovered(false);
            }}
          >
            {/* Y-axis gridlines (HTML, faint horizontal lines) */}
            {yGridLines.map((v) => (
              <div
                key={v}
                className={styles.yGridLine}
                style={{ top: yFromVal(v) }}
              />
            ))}
            <div className={styles.yGridLine} style={{ top: yFromVal(0) }} />

            {/* Stacked bars — one per slot (real days + empty future slots) */}
            <div className={`${styles.barsLayer} ${trendHovered ? styles.barsLayerDimmed : ""}`}>
              {Array.from({ length: xCeiling }, (_, i) => {
                const day = i < days.length ? days[i] : null;
                const barH = day && yCeiling > 0 ? (day.total / yCeiling) * 100 : 0;

                return (
                  <div
                    key={i}
                    className={styles.dayColumn}
                    onPointerEnter={(e) => {
                      if (!day) return;
                      setHoveredDay(i);
                      setTooltipOrigin("50% 100%");
                      const rect = chartRef.current?.getBoundingClientRect();
                      if (!rect) return;
                      setTooltip({
                        x: clampTooltipX(e.clientX - rect.left, rect.width),
                        dayIndex: i,
                      });
                    }}
                    onPointerMove={(e) => {
                      if (!day) return;
                      const rect = chartRef.current?.getBoundingClientRect();
                      if (!rect) return;
                      setTooltip((prev) =>
                        prev
                          ? { ...prev, x: clampTooltipX(e.clientX - rect.left, rect.width), dayIndex: i }
                          : null
                      );
                    }}
                    onPointerLeave={() => {
                      setHoveredDay(null);
                    }}
                  >
                    {day && (
                      <div className={styles.dayBar} style={{ height: `${barH}%` }}>
                        {keys.map((key) => {
                          const value = (day as Record<string, unknown>)[key] as number;
                          if (value === 0) return null;
                          const segPct = day.total > 0 ? (value / day.total) * 100 : 0;
                          const isDimmed = activeFilter !== null && activeFilter !== key;
                          return (
                            <div
                              key={key}
                              className={`${styles.daySegment} ${segClasses[key] ?? ""} ${isDimmed ? styles.segmentDimmed : ""}`}
                              style={{ height: `${segPct}%` }}
                            />
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* SVG overlay: trend line + hover crosshair */}
            {medianLine.length > 1 && (
              <svg
                className={styles.trendOverlay}
                viewBox={`0 0 100 ${chartHeight}`}
                preserveAspectRatio="none"
                aria-hidden="true"
              >
                {/* Invisible wide hit target for the trend line */}
                <polyline
                  className={styles.trendHitTarget}
                  points={trendPoints}
                  fill="none"
                  vectorEffect="non-scaling-stroke"
                  onPointerEnter={(e) => {
                    setTrendHovered(true);
                    const idx = resolveDayFromPointer(e.clientX);
                    setHoveredDay(idx);
                    setTooltipOrigin("50% 100%");
                    const rect = chartRef.current?.getBoundingClientRect();
                    if (!rect || idx === null) return;
                    setTooltip({
                      x: clampTooltipX(e.clientX - rect.left, rect.width),
                      dayIndex: idx,
                    });
                  }}
                  onPointerMove={(e) => {
                    const idx = resolveDayFromPointer(e.clientX);
                    setHoveredDay(idx);
                    const rect = chartRef.current?.getBoundingClientRect();
                    if (!rect || idx === null) return;
                    setTooltip((prev) =>
                      prev
                        ? { ...prev, x: clampTooltipX(e.clientX - rect.left, rect.width), dayIndex: idx }
                        : null
                    );
                  }}
                  onPointerLeave={() => {
                    setTrendHovered(false);
                    setHoveredDay(null);
                  }}
                />
                <polyline
                  className={styles.trendLine}
                  points={trendPoints}
                  fill="none"
                  vectorEffect="non-scaling-stroke"
                />
                {hoveredX !== null && (
                  <line
                    className={styles.crosshairLine}
                    x1={hoveredX}
                    y1={trendPadTop}
                    x2={hoveredX}
                    y2={chartHeight}
                    vectorEffect="non-scaling-stroke"
                  />
                )}
              </svg>
            )}

            {/* Hover crosshair dot + median value (HTML to avoid SVG non-uniform scaling) */}
            {hoveredX !== null && hoveredY !== null && (
              <div
                className={styles.crosshairDot}
                style={{ left: `${hoveredX}%`, top: hoveredY }}
              />
            )}
            {trendHovered && hoveredX !== null && hoveredY !== null && hoveredMedian !== null && (
              <span
                className={styles.crosshairLabel}
                style={{ left: `${hoveredX}%`, top: hoveredY - 28 }}
              >
                {Math.round(hoveredMedian * 10) / 10}
              </span>
            )}

            {/* Always-mounted tooltip: anchor + animated visual */}
            <div
              className={styles.tooltipAnchor}
              style={{
                left: tooltip ? tooltip.x : lastTooltipXRef.current,
                top: trendPadTop,
              }}
            >
              <div
                className={styles.tooltip}
                style={{
                  height: tooltipH,
                  opacity: tooltip ? 1 : 0,
                  transform: `scale(${tooltip ? 1 : 0})`,
                  transformOrigin: tooltipOrigin,
                }}
              >
                <div ref={tooltipContentRef} className={styles.tooltipInner}>
                  {tooltip && tooltip.dayIndex < days.length && (() => {
                    const day = days[tooltip.dayIndex];
                    return (
                      <>
                        <span className={styles.tooltipTitle}>Day {day.day}</span>
                        {keys.map((key) => {
                          const value = (day as Record<string, unknown>)[key] as number;
                          return (
                            <span key={key} className={styles.tooltipRow}>
                              <span
                                className={`${styles.tooltipDot} ${segClasses[key] ?? ""}`}
                              />
                              {labels[key]}: {value}
                            </span>
                          );
                        })}
                        <span className={styles.tooltipTotal}>Total: {day.total}</span>
                      </>
                    );
                  })()}
                </div>
              </div>
            </div>
          </div>

          {/* X-axis: day numbers (extends to xCeiling), aligned under the chart area */}
          {days.length > 0 && (
            <div className={styles.xAxis}>
              {Array.from({ length: xCeiling }, (_, i) => {
                const dayNum = i + 1;
                const showLabel =
                  xCeiling <= 20 ||
                  i === 0 ||
                  dayNum % 5 === 0;
                return (
                  <span key={dayNum} className={styles.xLabel}>
                    {showLabel ? dayNum : ""}
                  </span>
                );
              })}
            </div>
          )}
        </div>

        {/* Legend (clickable filters) */}
        <div className={styles.legend}>
          {keys.map((key) => {
            const isActive = activeFilter === key;
            const isDimmed = activeFilter !== null && !isActive;
            return (
              <button
                key={key}
                className={`${styles.legendFilter} ${isActive ? styles.legendFilterActive : ""} ${isDimmed ? styles.legendFilterDimmed : ""}`}
                onClick={() => setActiveFilter(isActive ? null : key)}
              >
                <span
                  className={`${styles.legendDot} ${legendClasses[key] ?? ""}`}
                />
                <span className={styles.legendFilterLabel} data-label={labels[key]}>
                  {labels[key]}
                </span>
              </button>
            );
          })}
          <span className={styles.legendItem}>
            <span className={styles.legendTrendLine} />
            Median trend
          </span>
        </div>
      </div>
    </div>
  );
}
