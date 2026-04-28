"use client";

import {
  useRef,
  useState,
  useCallback,
  useEffect,
  useMemo,
} from "react";
import dynamic from "next/dynamic";
import styles from "./force-graph.module.scss";

const ForceGraph2D = dynamic(() => import("react-force-graph-2d"), {
  ssr: false,
});

// ── Types ────────────────────────────────────────────────────────────────────

export type ForceGraphViewMode = "mesh" | "pathway" | "signal";

export interface ForceGraphNode {
  id: string;
  label?: string;
  group?: string;
  val?: number;
  x?: number;
  y?: number;
  fx?: number;
  fy?: number;
}

export interface ForceGraphLink {
  source: string | ForceGraphNode;
  target: string | ForceGraphNode;
  edgeType?: string;
  confidence?: number;
  bidirectional?: boolean;
}

export interface ForceGraphTransform {
  x: number;
  y: number;
  k: number;
}

export interface ForceGraphProps {
  nodes: ForceGraphNode[];
  links: ForceGraphLink[];
  height?: number;
  nodeColor?: (node: ForceGraphNode) => string;
  onNodeHover?: (node: ForceGraphNode | null) => void;
  onNodeClick?: (node: ForceGraphNode) => void;
  labelVisibility?: "all" | "hubs" | "none";
  labelFont?: "mono" | "sans";
  enableNodeDrag?: boolean;
  enableZoom?: boolean;
  enablePan?: boolean;
  viewMode?: ForceGraphViewMode;
  /** When "progressive", only hub + orphan nodes are visible at default zoom;
   *  mid-tier and leaf nodes fade in as the user zooms in. */
  nodeDisclosure?: "all" | "progressive";
  onZoomIn?: (fn: () => void) => void;
  onZoomOut?: (fn: () => void) => void;
  onFitToView?: (fn: () => void) => void;
  /** Fires on every zoom/pan change — use to sync an external grid. */
  onTransformChange?: (t: ForceGraphTransform) => void;
  /** Draw a background pill behind hub labels for legibility on busy graphs. */
  labelBackground?: boolean;
  /** Minimum on-screen radius (in CSS px) so nodes stay visible at any zoom. */
  minNodeScreenRadius?: number;
  /** Floor for the initial zoomToFit scale — prevents starting too zoomed out. */
  minInitialZoom?: number;
  /** Draw a dot grid directly on the canvas so it moves in lockstep with content.
   *  When set, the host Canvas component should hide its own CSS grid. */
  gridDotColor?: string;
  /** Grid spacing in graph-space px at zoom 1×. Default 20. */
  gridSpacing?: number;
  /** Grid dot radius at zoom 1×. Default 1.5. */
  gridDotRadius?: number;
  /** Override the active signal source node. When set and in Signal mode,
   *  this takes priority over the internal highest-val auto-selection. */
  signalSourceOverride?: string;
  className?: string;
}

// ── Constants ────────────────────────────────────────────────────────────────

const DEFAULT_HEIGHT = 500;
const HUB_VAL_THRESHOLD = 20;
const DEFAULT_NODE_COLOR = "rgba(160, 160, 160, 0.6)";

// ── Link colors ─────────────────────────────────────────────────────────────
// Resting state (no hover)
const LINK_COLOR = "rgba(160, 160, 160, 0.15)";
const LINK_WIDTH = 0.6;
// Hover: emphasized (connected to hovered node) — two-layer: glow (library) + core (overlay)
const LINK_EMPHASIS_WIDTH = 4.0;
const LINK_EMPHASIS_CORE_WIDTH = 0.5;
// Hover: dimmed (not connected to hovered node)
const LINK_COLOR_DIM = "rgba(160, 160, 160, 0.06)";
const LINK_WIDTH_DIM = 0.4;

// Pathway + Signal: semantic link color — Terra = unidirectional, Lumen = bidirectional.
// Inbound/outbound are relative to a node and meaningless at the network level;
// uni- vs bi-directional is an absolute property of the connection itself.
const TERRA_LINK = "rgba(184, 144, 98, 0.3)";
const TERRA_LINK_EMPHASIS_GLOW = "rgba(184, 144, 98, 0.18)";
const TERRA_LINK_EMPHASIS_CORE = "rgb(184, 144, 98)";
const TERRA_ARROW = "rgb(184, 144, 98)";
const LUMEN_LINK = "rgba(115, 146, 255, 0.25)";
const LUMEN_LINK_EMPHASIS_GLOW = "rgba(115, 146, 255, 0.15)";
const LUMEN_LINK_EMPHASIS_CORE = "rgb(115, 146, 255)";
const LUMEN_ARROW = "rgb(115, 146, 255)";

// ── Signal view: active path vs preview path ────────────────────────────────
const SIGNAL_ACTIVE_LINK = "rgba(184, 144, 98, 0.35)";
const SIGNAL_ACTIVE_LINK_BI = "rgba(115, 146, 255, 0.3)";
const SIGNAL_ACTIVE_WIDTH = 1.0;
const SIGNAL_PREVIEW_LINK = "rgba(184, 144, 98, 0.15)";
const SIGNAL_PREVIEW_LINK_BI = "rgba(115, 146, 255, 0.12)";

// ── Particle constants ──────────────────────────────────────────────────────
// Time-based speed: calibrated at 60fps. Delta compensation in the rAF loop
// ensures constant visual velocity regardless of actual frame rate.
const TARGET_SPEED_PER_SECOND = 0.005 * 60;
const PARTICLE_WIDTH = 2;

// Wave emission: particles fire in organic bursts rather than uniform intervals.
// A sine-wave modulates emission probability over time, creating crest/trough
// cycles. Per-link phase offsets stagger firing so links don't all pulse together.
const WAVE_PERIOD_MS = 2800;
const WAVE_EMIT_INTERVAL_MS = 180;
const WAVE_MIN_PROBABILITY = 0.02;
const WAVE_MAX_PROBABILITY = 0.55;
const SPEED_VARIATION = 0.25;

// Physics: high decay = fast settle. warmupTicks runs synchronously before
// first paint so initial layout is unaffected. After drag, the high decay
// makes the released node snap back near-instantly.
const ALPHA_DECAY = 0.12;
const VELOCITY_DECAY = 0.55;

// ── Progressive disclosure thresholds ────────────────────────────────────────
// Tier 1 (hubs + orphans): always visible.
// Tier 2 (mid-tier): fades in at globalScale >= 0.8.
// Tier 3 (leaves): fades in at globalScale >= 1.5.
const TIER_THRESHOLDS: Record<number, number> = { 1: 0, 2: 0.8, 3: 1.5 };
const TIER_RAMP = 0.4; // zoom range over which opacity ramps 0→1

function getNodeTier(
  normalizedVal: number,
  isOrphan: boolean,
): 1 | 2 | 3 {
  if (isOrphan) return 1;
  if (normalizedVal > 0.6) return 1;
  if (normalizedVal > 0.2) return 2;
  return 3;
}

// Evaluate a cubic-bezier at parameter t (decasteljau on y-component).
// p1y, p2y are the y-coordinates of the two control points (x is uniform).
function cubicBezierY(t: number, p1y: number, p2y: number): number {
  const inv = 1 - t;
  return 3 * inv * inv * t * p1y + 3 * inv * t * t * p2y + t * t * t;
}

// Approximate the y-value of a cubic-bezier(p1x, p1y, p2x, p2y) at a given
// x-value using Newton's method. This maps a linear progress (x) through
// the easing curve to produce the eased value (y).
function sampleCubicBezier(
  x: number,
  p1x: number,
  p1y: number,
  p2x: number,
  p2y: number,
): number {
  if (x <= 0) return 0;
  if (x >= 1) return 1;
  let t = x;
  for (let i = 0; i < 8; i++) {
    const inv = 1 - t;
    const currentX = 3 * inv * inv * t * p1x + 3 * inv * t * t * p2x + t * t * t;
    const dx = currentX - x;
    if (Math.abs(dx) < 1e-6) break;
    const slope = 3 * inv * inv * p1x + 6 * inv * t * (p2x - p1x) + 3 * t * t * (1 - p2x);
    if (Math.abs(slope) < 1e-6) break;
    t -= dx / slope;
  }
  return cubicBezierY(t, p1y, p2y);
}

// Easing curve from the motion token system: EASING.expressive (0.4, 0.14, 0.3, 1).
// Produces a slight overshoot before settling - used for organic grow-in.
const EASE_P1X = 0.4;
const EASE_P1Y = 0.14;
const EASE_P2X = 0.3;
const EASE_P2Y = 1;

// ── Time-based spring animation for progressive disclosure ──────────────────
// Duration of the grow-in animation (ms). Matches DURATION.slow from motion tokens.
const DISCLOSURE_DURATION_MS = 400;
// Peak overshoot fraction above 1.0 (0.12 = nodes grow 12% past final size).
const SCALE_OVERSHOOT = 0.12;

// Whether a node's tier is above the zoom threshold (should be visible).
function isTierVisible(tier: 1 | 2 | 3, scale: number): boolean {
  return scale >= TIER_THRESHOLDS[tier];
}

// Time-based spring curve: maps t (0→1) to a value that overshoots then settles.
// Used for both alpha and scale during grow-in.
function springCurve(t: number): number {
  if (t <= 0) return 0;
  if (t >= 1) return 1;
  const eased = sampleCubicBezier(t, EASE_P1X, EASE_P1Y, EASE_P2X, EASE_P2Y);
  return eased;
}

function springScaleCurve(t: number): number {
  if (t <= 0) return 0;
  if (t >= 1) return 1;
  const eased = sampleCubicBezier(t, EASE_P1X, EASE_P1Y, EASE_P2X, EASE_P2Y);
  const bounce = Math.sin(eased * Math.PI) * SCALE_OVERSHOOT * (1 - eased * eased);
  return eased + bounce;
}

// Legacy zoom-based ramp kept for link disclosure (links don't need spring animation)
function tierAlpha(tier: 1 | 2 | 3, scale: number): number {
  const threshold = TIER_THRESHOLDS[tier];
  if (threshold === 0) return 1;
  if (scale >= threshold + TIER_RAMP) return 1;
  if (scale <= threshold) return 0;
  return (scale - threshold) / TIER_RAMP;
}

// Stable reference for linkCanvasObjectMode — avoids re-triggering the kapsule
// on every render. Must be a function (accessorFn treats strings as property names).
const linkCanvasAfterMode = () => "after" as const;
const nodeCanvasReplaceMode = () => "replace" as const;
const emptyLinkLabel = () => "";

// ── Link label helpers ───────────────────────────────────────────────────────

const EDGE_TYPE_ABBR: Record<string, string> = {
  reference: "ref",
  references: "ref",
  referencedBy: "ref",
  trigger: "trig",
  triggers: "trig",
  triggeredBy: "trig",
  documents: "doc",
  documentedBy: "doc",
  enforces: "enf",
  enforcedBy: "enf",
  derivedFrom: "der",
  derives: "der",
  supersedes: "sup",
  supersededBy: "sup",
};

function linkLabelText(link: ForceGraphLink): string | null {
  const abbr = link.edgeType
    ? EDGE_TYPE_ABBR[link.edgeType] ?? link.edgeType.slice(0, 4)
    : null;
  const conf = link.confidence != null
    ? link.confidence.toFixed(1)
    : null;
  if (abbr && conf) return `${abbr} ${conf}`;
  if (abbr) return abbr;
  if (conf) return conf;
  return null;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function getLinkNodeId(end: string | ForceGraphNode): string {
  return typeof end === "object" ? end.id : end;
}

// ── Component ────────────────────────────────────────────────────────────────

export default function ForceGraph({
  nodes,
  links,
  height = DEFAULT_HEIGHT,
  nodeColor,
  onNodeHover,
  onNodeClick,
  labelVisibility = "hubs",
  labelFont = "mono",
  enableNodeDrag = true,
  enableZoom = false,
  enablePan = true,
  viewMode = "mesh",
  nodeDisclosure = "all",
  onZoomIn,
  onZoomOut,
  onFitToView,
  onTransformChange,
  labelBackground = false,
  minNodeScreenRadius = 0,
  minInitialZoom = 0,
  gridDotColor,
  gridSpacing = 20,
  gridDotRadius = 1.5,
  signalSourceOverride,
  className,
}: ForceGraphProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height });
  const [hoveredNode, setHoveredNode] = useState<ForceGraphNode | null>(null);
  const graphRef = useRef<any>(undefined);
  const [graphMounted, setGraphMounted] = useState(false);
  useEffect(() => {
    if (graphRef.current && !graphMounted) setGraphMounted(true);
  });
  const isDraggingRef = useRef(false);
  const isProgressive = nodeDisclosure === "progressive";

  // Time-based disclosure animation: tracks when each node first becomes visible.
  // Key = nodeId, value = timestamp (ms) when the node crossed its tier threshold.
  // Cleared when the node goes back below threshold (zoom out).
  const disclosureStartRef = useRef(new Map<string, number>());
  // Animation pump: drives repaints while any disclosure animation is in-flight.
  const disclosureRafRef = useRef<number | null>(null);
  const [disclosureAnimating, setDisclosureAnimating] = useState(false);

  // Theme detection: watch <html> class for "dark" to flip brightness hierarchy.
  const [isDark, setIsDark] = useState(false);
  useEffect(() => {
    const html = document.documentElement;
    const check = () => setIsDark(html.classList.contains("dark"));
    check();
    const observer = new MutationObserver(check);
    observer.observe(html, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  // Clean up disclosure animation RAF on unmount
  useEffect(() => {
    return () => {
      if (disclosureRafRef.current) {
        cancelAnimationFrame(disclosureRafRef.current);
      }
    };
  }, []);

  // Resolved background color for masking hollow (sink) node interiors.
  // Walks up the DOM to find the first non-transparent background.
  const bgColorRef = useRef("#ffffff");
  useEffect(() => {
    let el: HTMLElement | null = containerRef.current;
    while (el) {
      const bg = getComputedStyle(el).backgroundColor;
      if (bg && bg !== "rgba(0, 0, 0, 0)" && bg !== "transparent") {
        bgColorRef.current = bg;
        return;
      }
      el = el.parentElement;
    }
    bgColorRef.current = isDark ? "#1e1e1e" : "#ffffff";
  }, [isDark]);

  // Resolved grid dot color (CSS variable → computed rgb value).
  const resolvedGridColorRef = useRef<string | null>(null);
  useEffect(() => {
    if (!gridDotColor || !containerRef.current) {
      resolvedGridColorRef.current = null;
      return;
    }
    const probe = document.createElement("div");
    probe.style.color = gridDotColor;
    containerRef.current.appendChild(probe);
    resolvedGridColorRef.current = getComputedStyle(probe).color;
    probe.remove();
  }, [gridDotColor]);

  // Draw a dot grid directly on the ForceGraph canvas (onRenderFramePre) so
  // the grid moves in perfect lockstep with nodes/links — no React-state lag.
  const MIN_GRID_SCREEN_SPACING = 16;
  const paintGrid = useCallback(
    (ctx: CanvasRenderingContext2D, globalScale: number) => {
      const color = resolvedGridColorRef.current;
      if (!color) return;

      const dpr = window.devicePixelRatio || 1;
      const cssW = ctx.canvas.width / dpr;
      const cssH = ctx.canvas.height / dpr;

      // Extract pan offset from the current canvas transform.
      const xform = ctx.getTransform();
      const tx = xform.e / dpr;
      const ty = xform.f / dpr;

      ctx.save();
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // Same multi-level spacing algorithm as the Canvas CSS grid.
      let spacing = gridSpacing;
      while (spacing * globalScale < MIN_GRID_SCREEN_SPACING) {
        spacing *= 2;
      }
      const step = spacing * globalScale;
      const dotR = Math.min(4, Math.max(1, gridDotRadius * globalScale));
      const ox = ((tx % step) + step) % step;
      const oy = ((ty % step) + step) % step;

      ctx.fillStyle = color;
      ctx.beginPath();
      for (let y = oy; y < cssH + step; y += step) {
        for (let x = ox; x < cssW + step; x += step) {
          ctx.moveTo(x + dotR, y);
          ctx.arc(x, y, dotR, 0, Math.PI * 2);
        }
      }
      ctx.fill();

      ctx.restore();
    },
    [gridSpacing, gridDotRadius],
  );

  // Track whether the tooltip is being sustained by a link hover rather than
  // a direct node hover. When the cursor moves from a node onto one of its
  // connected links, we keep showing the node's tooltip.
  const linkSustainedNodeRef = useRef<ForceGraphNode | null>(null);

  // Signal view: the "active" node whose path always shows particles.
  // Defaults to the highest-val node. Click a different node to switch.
  const [signalActiveNodeId, setSignalActiveNodeId] = useState<string | null>(null);

  // Frame-rate compensation: track time between animation frames so particle
  // speed stays visually constant across 60fps browsers and throttled webviews.
  const lastFrameTimeRef = useRef(0);
  const frameSpeedRef = useRef(TARGET_SPEED_PER_SECOND / 60);

  // ── Animated tooltip state (mirrors SkillMap treemap pattern) ────────────
  const tooltipContentRef = useRef<HTMLDivElement>(null);
  const [tooltipH, setTooltipH] = useState(0);
  const lastTooltipPosRef = useRef({ x: 0, y: 0 });
  const [tooltipOrigin, setTooltipOrigin] = useState("50% 100%");

  // Compute tooltip screen position from hovered node's graph coordinates
  const tooltipScreenPos = useMemo(() => {
    if (!hoveredNode || !graphRef.current) return null;
    const g = graphRef.current;
    const coords = g.graph2ScreenCoords?.(hoveredNode.x ?? 0, hoveredNode.y ?? 0);
    if (!coords) return null;
    return { x: coords.x, y: coords.y };
  }, [hoveredNode, hoveredNode?.x, hoveredNode?.y]);

  // Keep last-known position in sync so dismiss animation stays anchored
  if (tooltipScreenPos) {
    lastTooltipPosRef.current = tooltipScreenPos;
  }

  // Animate tooltip height: measure scrollHeight after content changes,
  // defer one rAF so the browser paints the "before" height first.
  useEffect(() => {
    const el = tooltipContentRef.current;
    if (!el) return;
    if (!hoveredNode) {
      setTooltipH(0);
      return;
    }
    const raf = requestAnimationFrame(() => {
      setTooltipH(el.scrollHeight);
    });
    return () => cancelAnimationFrame(raf);
  }, [hoveredNode]);

  useEffect(() => {
    if (!containerRef.current) return;
    const ro = new ResizeObserver(([entry]) => {
      setDimensions({ width: entry.contentRect.width, height });
    });
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, [height]);

  // When zoom is enabled, prevent wheel events from scrolling the page.
  // Must be a native listener with { passive: false } — React's onWheel
  // is passive and cannot call preventDefault().
  useEffect(() => {
    if (!enableZoom) return;
    const el = containerRef.current;
    if (!el) return;
    const stop = (e: WheelEvent) => e.preventDefault();
    el.addEventListener("wheel", stop, { passive: false });
    return () => el.removeEventListener("wheel", stop);
  }, [enableZoom]);

  // Auto-select the active signal node when entering Signal view.
  // When signalSourceOverride is set, it takes priority over auto-selection.
  useEffect(() => {
    if (viewMode !== "signal") {
      setSignalActiveNodeId(null);
      return;
    }
    if (signalSourceOverride && nodes.some((n) => n.id === signalSourceOverride)) {
      setSignalActiveNodeId(signalSourceOverride);
      return;
    }
    if (signalActiveNodeId && nodes.some((n) => n.id === signalActiveNodeId)) return;
    let best: ForceGraphNode | null = null;
    for (const n of nodes) {
      if (!best || (n.val ?? 0) > (best.val ?? 0)) best = n;
    }
    if (best) setSignalActiveNodeId(best.id);
  }, [viewMode, nodes, signalSourceOverride]);

  // Resolve the active node object from the ID
  const signalActiveNode = useMemo(() => {
    if (!signalActiveNodeId) return null;
    return nodes.find((n) => n.id === signalActiveNodeId) ?? null;
  }, [signalActiveNodeId, nodes]);

  // Signal mode: keep animation loop alive and measure frame delta for
  // time-based particle speed. The rAF loop updates frameSpeedRef so the
  // speed accessor always returns the correct per-frame increment.
  useEffect(() => {
    if (viewMode !== "signal") return;
    const g = graphRef.current;
    if (g) g.resumeAnimation();

    let rafId: number;
    const tick = (now: number) => {
      const prev = lastFrameTimeRef.current;
      if (prev > 0) {
        const dtSec = Math.min((now - prev) / 1000, 0.1); // cap at 100ms to prevent jumps
        frameSpeedRef.current = TARGET_SPEED_PER_SECOND * dtSec;
      }
      lastFrameTimeRef.current = now;
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafId);
      lastFrameTimeRef.current = 0;
    };
  }, [viewMode]);

  // Expose zoom controls to parent via callback refs.
  // graphMounted triggers re-run when the dynamic import finishes loading.
  useEffect(() => {
    if (!graphRef.current) return;
    const g = graphRef.current;

    onZoomIn?.(() => {
      const current = g.zoom();
      g.zoom(current * 1.5, 300);
    });

    onZoomOut?.(() => {
      const current = g.zoom();
      g.zoom(current / 1.5, 300);
    });

    onFitToView?.(() => {
      g.zoomToFit(400);
    });
  }, [onZoomIn, onZoomOut, onFitToView, dimensions.width, graphMounted]);

  // Deep-clone nodes and links so each ForceGraph instance owns its own objects.
  // Without this, multiple instances sharing the same arrays will clobber each
  // other's internal state (e.g. __photons, fx/fy) because d3-force and the
  // kapsule mutate link/node objects in place.
  //
  // Bidirectional links are expanded into two paired links (forward + reverse)
  // with slight curvature so both arrows are visible in Pathway mode. Each
  // pair shares the same bidirectional=true flag for color coding.
  const graphData = useMemo(
    () => {
      const expandedLinks: ForceGraphLink[] = [];
      for (const l of links) {
        if (l.bidirectional) {
          expandedLinks.push({ ...l, _curveDirection: 1, _isReverse: false } as any);
          expandedLinks.push({
            ...l,
            source: l.target,
            target: l.source,
            _curveDirection: 1,
            _isReverse: true,
          } as any);
        } else {
          expandedLinks.push({ ...l });
        }
      }
      return {
        nodes: nodes.map((n) => ({ ...n })),
        links: expandedLinks,
      };
    },
    [nodes, links],
  );

  // Pin every node so the layout is permanently frozen after warmup.
  // d3-force mutates the cloned node objects in-place (adding x, y).
  const pinAllNodes = useCallback(() => {
    for (const node of graphData.nodes as any[]) {
      if (node.x != null) node.fx = node.x;
      if (node.y != null) node.fy = node.y;
    }
  }, [graphData]);

  // Auto-fit the graph to fill the container once after the initial layout.
  const initialFitDoneRef = useRef(false);
  useEffect(() => {
    initialFitDoneRef.current = false;
  }, [graphData]);

  const handleEngineStop = useCallback(() => {
    pinAllNodes();
    if (!initialFitDoneRef.current && graphRef.current) {
      initialFitDoneRef.current = true;
      const g = graphRef.current;
      g.zoomToFit(400, 40);

      // After zoomToFit settles, clamp the scale into the desired range.
      // Progressive mode: cap to keep only tier-1 nodes visible.
      // minInitialZoom: floor to keep nodes readable on dense graphs.
      const maxClamp = isProgressive ? TIER_THRESHOLDS[2] * 0.9 : Infinity;
      const minClamp = minInitialZoom;

      if (maxClamp < Infinity || minClamp > 0) {
        setTimeout(() => {
          const currentZoom = g.zoom();
          const clamped = Math.min(maxClamp, Math.max(minClamp, currentZoom));
          if (clamped !== currentZoom) {
            g.zoom(clamped, 400);
          }
        }, 420);
      }
    }
  }, [pinAllNodes, isProgressive, minInitialZoom]);

  // During drag: the library handles moving the node via fx/fy internally.
  // We just mark that a drag is happening.
  const handleNodeDrag = useCallback((node: any) => {
    isDraggingRef.current = true;
  }, []);

  // On release: unpin ONLY the dragged node and reheat so the simulation
  // springs it back. All other nodes stay pinned — only this one moves.
  const handleNodeDragEnd = useCallback((node: any) => {
    node.fx = undefined;
    node.fy = undefined;
    isDraggingRef.current = false;
    const g = graphRef.current;
    if (g) {
      g.d3ReheatSimulation();
    }
  }, []);

  // Build adjacency sets for hover emphasis — applies to ALL view modes.
  // hoveredNeighborLinks: link keys directly connected to the hovered node.
  // hoveredNeighborNodes: node IDs directly connected to the hovered node.
  const { hoveredNeighborLinks, hoveredNeighborNodes } = useMemo(() => {
    if (!hoveredNode) return { hoveredNeighborLinks: null, hoveredNeighborNodes: null };
    const linkSet = new Set<string>();
    const nodeSet = new Set<string>();
    nodeSet.add(hoveredNode.id);
    for (const link of graphData.links) {
      const srcId = getLinkNodeId(link.source);
      const tgtId = getLinkNodeId(link.target);
      if (srcId === hoveredNode.id || tgtId === hoveredNode.id) {
        linkSet.add(`${srcId}→${tgtId}`);
        nodeSet.add(srcId);
        nodeSet.add(tgtId);
      }
    }
    return { hoveredNeighborLinks: linkSet, hoveredNeighborNodes: nodeSet };
  }, [hoveredNode, graphData.links]);

  // Undirected adjacency map from original links (not expanded). Used for
  // tooltip degree stats. Bidirectional links count as one connection.
  const undirectedAdj = useMemo(() => {
    const adj = new Map<string, Set<string>>();
    for (const link of links) {
      const src = typeof link.source === "object" ? link.source.id : link.source;
      const tgt = typeof link.target === "object" ? link.target.id : link.target;
      if (!adj.has(src)) adj.set(src, new Set());
      if (!adj.has(tgt)) adj.set(tgt, new Set());
      adj.get(src)!.add(tgt);
      adj.get(tgt)!.add(src);
    }
    return adj;
  }, [links]);

  // Max node val — used for normalizing color, size, and tier calculations.
  const maxVal = useMemo(() => {
    let m = 1;
    for (const n of nodes) {
      if ((n.val ?? 0) > m) m = n.val!;
    }
    return m;
  }, [nodes]);

  // Track current zoom scale for link visibility in progressive disclosure.
  // Updated every frame inside paintNode (which receives globalScale).
  const currentScaleRef = useRef(1);

  // Progressive disclosure: precompute each node's tier (1/2/3) so paintNode
  // and link accessors can look up visibility without recomputing.
  const orphanSet = useMemo(() => {
    const set = new Set<string>();
    for (const n of nodes) {
      const neighbors = undirectedAdj.get(n.id);
      if (!neighbors || neighbors.size === 0) set.add(n.id);
    }
    return set;
  }, [nodes, undirectedAdj]);

  // Sink nodes: inbound-only, zero outbound, zero bidirectional.
  // These nodes will not fire particles in Signal view. Computed from
  // the original links (before bidirectional expansion).
  const sinkSet = useMemo(() => {
    const outDeg = new Map<string, number>();
    const inDeg = new Map<string, number>();
    const biDeg = new Map<string, number>();
    for (const link of links) {
      const src = typeof link.source === "object" ? link.source.id : link.source;
      const tgt = typeof link.target === "object" ? link.target.id : link.target;
      if (link.bidirectional) {
        biDeg.set(src, (biDeg.get(src) ?? 0) + 1);
        biDeg.set(tgt, (biDeg.get(tgt) ?? 0) + 1);
      } else {
        outDeg.set(src, (outDeg.get(src) ?? 0) + 1);
        inDeg.set(tgt, (inDeg.get(tgt) ?? 0) + 1);
      }
    }
    const set = new Set<string>();
    for (const n of nodes) {
      const o = outDeg.get(n.id) ?? 0;
      const b = biDeg.get(n.id) ?? 0;
      const i = inDeg.get(n.id) ?? 0;
      if (o === 0 && b === 0 && i > 0) set.add(n.id);
    }
    return set;
  }, [nodes, links]);

  const nodeTierMap = useMemo(() => {
    const map = new Map<string, 1 | 2 | 3>();
    for (const n of nodes) {
      const v = n.val ?? 0;
      const t = maxVal > 0 && v > 0 ? v / maxVal : 0;
      map.set(n.id, getNodeTier(t, orphanSet.has(n.id)));
    }
    return map;
  }, [nodes, maxVal, orphanSet]);

  // Compute 1st-degree (with directional split) and 2nd-degree connection
  // counts for the hovered node. Directional split at 1st-degree reinforces
  // the sink affordance (hollow = zero outbound).
  const hoveredDegreeStats = useMemo(() => {
    if (!hoveredNode) return null;
    const first = undirectedAdj.get(hoveredNode.id);
    if (!first || first.size === 0)
      return { total: 0, inCount: 0, outCount: 0, biCount: 0 };

    let inOnly = 0;
    let outOnly = 0;
    let bi = 0;
    for (const link of links) {
      const src = typeof link.source === "object" ? link.source.id : link.source;
      const tgt = typeof link.target === "object" ? link.target.id : link.target;
      if (link.bidirectional) {
        if (src === hoveredNode.id || tgt === hoveredNode.id) bi++;
      } else {
        if (src === hoveredNode.id) outOnly++;
        if (tgt === hoveredNode.id) inOnly++;
      }
    }

    return { total: inOnly + outOnly + bi, inCount: inOnly, outCount: outOnly, biCount: bi };
  }, [hoveredNode, undirectedAdj, links]);

  // Build forward adjacency map once (shared by active path + preview path BFS).
  // Uses graphData.links which already includes expanded reverse links for
  // bidirectional pairs, so no manual reverse-key logic is needed.
  const forwardAdj = useMemo(() => {
    if (viewMode !== "signal") return null;
    const adj = new Map<string, { tgt: string; key: string }[]>();
    for (const link of graphData.links) {
      const srcId = getLinkNodeId(link.source);
      const tgtId = getLinkNodeId(link.target);
      const key = `${srcId}→${tgtId}`;
      if (!adj.has(srcId)) adj.set(srcId, []);
      adj.get(srcId)!.push({ tgt: tgtId, key });
    }
    return adj;
  }, [viewMode, graphData.links]);

  // BFS helper: returns set of link keys reachable from a given node
  const buildPathLinks = useCallback(
    (startId: string): Set<string> => {
      if (!forwardAdj) return new Set();
      const set = new Set<string>();
      const visited = new Set<string>();
      const queue = [startId];
      visited.add(startId);
      while (queue.length > 0) {
        const nodeId = queue.shift()!;
        const neighbors = forwardAdj.get(nodeId);
        if (!neighbors) continue;
        for (const { tgt, key } of neighbors) {
          set.add(key);
          if (!visited.has(tgt)) {
            visited.add(tgt);
            queue.push(tgt);
          }
        }
      }
      return set;
    },
    [forwardAdj],
  );

  // Signal view: the ACTIVE path always shows particles (from signalActiveNode)
  const activatedPathLinks = useMemo(() => {
    if (viewMode !== "signal" || !signalActiveNode) return null;
    const s = buildPathLinks(signalActiveNode.id);
    return s.size > 0 ? s : null;
  }, [viewMode, signalActiveNode, buildPathLinks]);

  // Signal view: the PREVIEW path shows translucent particles on hover
  // (only when hovering a node that isn't the active node)
  const previewPathLinks = useMemo(() => {
    if (viewMode !== "signal" || !hoveredNode) return null;
    if (hoveredNode.id === signalActiveNodeId) return null;
    const s = buildPathLinks(hoveredNode.id);
    return s.size > 0 ? s : null;
  }, [viewMode, hoveredNode, signalActiveNodeId, buildPathLinks]);

  const getNodeColor = useCallback(
    (node: ForceGraphNode) => {
      if (nodeColor) return nodeColor(node);
      const v = node.val ?? 0;
      if (v === 0) return isDark ? "rgb(190, 190, 190)" : "rgb(140, 140, 140)";
      // Contrast-first hierarchy: the most important node (hub) gets the
      // highest contrast against the background. On dark backgrounds that
      // means lightest; on light backgrounds that means darkest.
      const t = Math.pow(v / maxVal, 0.6);
      if (isDark) {
        const channel = Math.round(80 + t * 170); // hub → 250, leaf → 80
        return `rgb(${channel}, ${channel}, ${channel})`;
      }
      const channel = Math.round(200 - t * 160); // hub → 40, leaf → 200
      return `rgb(${channel}, ${channel}, ${channel})`;
    },
    [nodeColor, maxVal, isDark],
  );

  const getNodeSize = useCallback(
    (node: ForceGraphNode) => {
      const v = node.val ?? 0;
      // Three discrete sizes. Orphans use the small tier.
      const t = v === 0 ? 0 : v / maxVal;
      if (t > 0.6) return 2.4;  // large  (top hubs)
      if (t > 0.2) return 1.8;  // medium (mid-tier)
      return 1.3;                // small  (leaves + orphans)
    },
    [maxVal],
  );

  // Smart tooltip placement: position the tooltip on the side opposite to the
  // densest cluster of connected links so it doesn't occlude active paths.
  const tooltipQuadrantRef = useRef<"tl" | "tr" | "bl" | "br">("tl");

  const computeQuadrant = useCallback(
    (node: ForceGraphNode): "tl" | "tr" | "bl" | "br" => {
      if (node.x == null || node.y == null) return "tl";

      // Count how many connected links pass through each quadrant relative
      // to the hovered node. Pick the quadrant with the fewest links.
      const density: Record<string, number> = { tl: 0, tr: 0, bl: 0, br: 0 };

      for (const link of links) {
        const srcId = getLinkNodeId(link.source);
        const tgtId = getLinkNodeId(link.target);
        if (srcId !== node.id && tgtId !== node.id) continue;
        const otherId = srcId === node.id ? tgtId : srcId;
        const other = graphData.nodes.find((n: any) => n.id === otherId);
        if (!other || other.x == null || other.y == null) continue;

        const odx = other.x - node.x!;
        const ody = other.y - node.y!;

        // A link going to the top-right means a tooltip in "tr" would overlap it.
        // Increment the quadrant(s) the neighbor falls into.
        if (odx <= 0 && ody <= 0) density.tl += 1;
        else if (odx > 0 && ody <= 0) density.tr += 1;
        else if (odx <= 0 && ody > 0) density.bl += 1;
        else density.br += 1;

        // Links near an axis boundary also partially threaten adjacent quadrants.
        // Use a 20-degree cone: if the angle is within ~20deg of an axis,
        // add a fractional penalty to the neighboring quadrant.
        const angle = Math.atan2(ody, odx);
        const absCos = Math.abs(Math.cos(angle));
        const absSin = Math.abs(Math.sin(angle));
        const axisPenalty = 0.5;
        if (absCos > 0.94) {
          // Near horizontal axis — penalize the quadrant above and below
          if (odx > 0) { density.tr += axisPenalty; density.br += axisPenalty; }
          else { density.tl += axisPenalty; density.bl += axisPenalty; }
        }
        if (absSin > 0.94) {
          // Near vertical axis — penalize left and right
          if (ody > 0) { density.bl += axisPenalty; density.br += axisPenalty; }
          else { density.tl += axisPenalty; density.tr += axisPenalty; }
        }
      }

      // Pick the quadrant with the lowest density
      const quadrants: Array<"tl" | "tr" | "bl" | "br"> = ["tl", "tr", "bl", "br"];
      quadrants.sort((a, b) => density[a] - density[b]);
      return quadrants[0];
    },
    [links, graphData.nodes],
  );

  // Quadrant → transform-origin mapping: the tooltip grows/shrinks from the
  // corner nearest to the hovered node.
  const QUADRANT_ORIGIN: Record<string, string> = {
    tl: "100% 100%", // tooltip is top-left → origin bottom-right (near node)
    tr: "0% 100%",   // tooltip is top-right → origin bottom-left
    bl: "100% 0%",   // tooltip is bottom-left → origin top-right
    br: "0% 0%",     // tooltip is bottom-right → origin top-left
  };

  const handleNodeHover = useCallback(
    (node: ForceGraphNode | null, _prevNode: ForceGraphNode | null) => {
      if (node) {
        // Entering a node or moving between nodes: clear link-sustained state
        linkSustainedNodeRef.current = null;
        const isNew = !hoveredNode || hoveredNode.id !== node.id;
        if (isNew) {
          const q = computeQuadrant(node);
          tooltipQuadrantRef.current = q;
          setTooltipOrigin(QUADRANT_ORIGIN[q]);
        }
        setHoveredNode(node);
        onNodeHover?.(node);
      } else if (hoveredNode) {
        // Leaving a node: don't dismiss immediately. Give onLinkHover a
        // chance to fire on the same frame. Use a microtask so link hover
        // can set linkSustainedNodeRef before we check it.
        const departingNode = hoveredNode;
        linkSustainedNodeRef.current = null;
        requestAnimationFrame(() => {
          if (linkSustainedNodeRef.current?.id === departingNode.id) {
            // Link hover sustained this node — keep tooltip visible
            return;
          }
          // Nothing sustained: dismiss
          setHoveredNode(null);
          onNodeHover?.(null);
        });
      }
    },
    [onNodeHover, hoveredNode, computeQuadrant],
  );

  // When the cursor moves onto a link, check if it connects to the currently
  // hovered node. If so, sustain that node's tooltip. If the link connects to
  // a different node pair entirely, dismiss.
  const handleLinkHover = useCallback(
    (link: ForceGraphLink | null) => {
      if (!link) {
        // Cursor left a link for blank canvas — dismiss if not on a node
        if (linkSustainedNodeRef.current) {
          linkSustainedNodeRef.current = null;
          setHoveredNode(null);
          onNodeHover?.(null);
        }
        return;
      }
      const srcId = getLinkNodeId(link.source);
      const tgtId = getLinkNodeId(link.target);
      const currentId = hoveredNode?.id;

      if (currentId && (srcId === currentId || tgtId === currentId)) {
        // Link connects to the currently hovered node — sustain tooltip
        linkSustainedNodeRef.current = hoveredNode;
      } else {
        // Link connects to a different node — show the nearest endpoint
        const srcNode = graphData.nodes.find((n: any) => n.id === srcId);
        if (srcNode) {
          linkSustainedNodeRef.current = srcNode;
          const q = computeQuadrant(srcNode);
          tooltipQuadrantRef.current = q;
          setTooltipOrigin(QUADRANT_ORIGIN[q]);
          setHoveredNode(srcNode);
          onNodeHover?.(srcNode);
        }
      }
    },
    [hoveredNode, onNodeHover, graphData.nodes, computeQuadrant],
  );

  // Signal view: click a node to make it the new active signal source
  const handleNodeClick = useCallback(
    (node: ForceGraphNode) => {
      if (viewMode === "signal") {
        setSignalActiveNodeId(node.id);
      }
      onNodeClick?.(node);
    },
    [viewMode, onNodeClick],
  );

  const paintNode = useCallback(
    (node: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
      currentScaleRef.current = globalScale;

      const nodeTier = nodeTierMap.get(node.id) ?? 3;

      let disclosureAlpha = 1;
      let sizeScale = 1;

      if (isProgressive && nodeTier !== 1) {
        const visible = isTierVisible(nodeTier, globalScale);
        const startMap = disclosureStartRef.current;
        const now = performance.now();

        if (visible) {
          if (!startMap.has(node.id)) {
            startMap.set(node.id, now);
          }
          const elapsed = now - startMap.get(node.id)!;
          const t = Math.min(elapsed / DISCLOSURE_DURATION_MS, 1);
          disclosureAlpha = springCurve(t);
          sizeScale = springScaleCurve(t);

          // While any node is mid-animation, keep canvas repainting every
          // frame by toggling autoPauseRedraw off (via React state → prop).
          if (t < 1 && !disclosureRafRef.current) {
            setDisclosureAnimating(true);
            const checkDone = () => {
              const stillAnimating = Array.from(startMap.values()).some(
                (s) => performance.now() - s < DISCLOSURE_DURATION_MS,
              );
              if (stillAnimating) {
                disclosureRafRef.current = requestAnimationFrame(checkDone);
              } else {
                setDisclosureAnimating(false);
                disclosureRafRef.current = null;
              }
            };
            disclosureRafRef.current = requestAnimationFrame(checkDone);
          }
        } else {
          startMap.delete(node.id);
          return;
        }
      }
      if (disclosureAlpha <= 0) return;

      const baseR = getNodeSize(node) * sizeScale;
      if (baseR <= 0) return;
      const r = minNodeScreenRadius > 0
        ? Math.max(baseR, minNodeScreenRadius / globalScale)
        : baseR;

      const color = getNodeColor(node);
      const isHovered = hoveredNode?.id === node.id;
      const hasHover = hoveredNode !== null;
      const isNeighbor = hoveredNeighborNodes?.has(node.id) ?? false;

      let alpha = disclosureAlpha;

      if (hasHover && !isNeighbor) {
        alpha *= 0.2;
      } else if (hasHover && isNeighbor && !isHovered) {
        alpha *= 0.9;
      }

      ctx.globalAlpha = alpha;

      const isSink = sinkSet.has(node.id);

      if (isSink) {
        ctx.beginPath();
        ctx.arc(node.x, node.y, r, 0, 2 * Math.PI);
        ctx.fillStyle = bgColorRef.current;
        ctx.fill();
        ctx.beginPath();
        ctx.arc(node.x, node.y, r, 0, 2 * Math.PI);
        ctx.strokeStyle = color;
        ctx.lineWidth = 1.2 / globalScale;
        ctx.stroke();
      } else {
        ctx.beginPath();
        ctx.arc(node.x, node.y, r, 0, 2 * Math.PI);
        ctx.fillStyle = color;
        ctx.fill();
      }

      if (isHovered) {
        ctx.strokeStyle = isDark ? "rgba(255, 255, 255, 0.7)" : "rgba(0, 0, 0, 0.5)";
        ctx.lineWidth = 1.5 / globalScale;
        ctx.stroke();
      } else if (hasHover && isNeighbor) {
        ctx.strokeStyle = isDark ? "rgba(255, 255, 255, 0.3)" : "rgba(0, 0, 0, 0.2)";
        ctx.lineWidth = 0.8 / globalScale;
        ctx.stroke();
      }

      ctx.globalAlpha = 1;

      const shouldLabel =
        labelVisibility === "all" ||
        (labelVisibility === "hubs" &&
          (node.val ?? 0) >= HUB_VAL_THRESHOLD);

      if (shouldLabel && globalScale > 0.6 && disclosureAlpha > 0.3) {
        const label = node.label ?? node.id;
        const fontSize = Math.max(10 / globalScale, 2);
        const computedFont = getComputedStyle(document.documentElement)
          .getPropertyValue(
            labelFont === "mono" ? "--font-geist-mono" : "--font-geist-sans",
          )
          .trim();
        const fontFamily = computedFont || (labelFont === "mono" ? "monospace" : "sans-serif");
        ctx.font = `${fontSize}px ${fontFamily}`;
        ctx.textAlign = "center";
        ctx.textBaseline = "top";

        let labelAlpha = 0.55;
        if (hasHover && !isNeighbor) labelAlpha = 0.15;

        const labelY = node.y + r + 2 / globalScale;

        if (labelBackground) {
          const metrics = ctx.measureText(label);
          const padX = 3 / globalScale;
          const padY = 1.5 / globalScale;
          const bgW = metrics.width + padX * 2;
          const bgH = fontSize + padY * 2;
          const bgR = 2 / globalScale;
          const bgX = node.x - bgW / 2;
          const bgY = labelY - padY;

          ctx.save();
          ctx.globalAlpha = 0.85 * disclosureAlpha;
          ctx.fillStyle = bgColorRef.current;
          ctx.beginPath();
          ctx.roundRect(bgX, bgY, bgW, bgH, bgR);
          ctx.fill();
          ctx.restore();
        }

        const labelChannel = isDark ? 255 : 0;
        ctx.fillStyle = `rgba(${labelChannel}, ${labelChannel}, ${labelChannel}, ${labelAlpha * disclosureAlpha})`;
        ctx.fillText(label, node.x, labelY);
      }
    },
    [getNodeColor, getNodeSize, hoveredNode, hoveredNeighborNodes, labelVisibility, labelFont, isProgressive, nodeTierMap, sinkSet, isDark, labelBackground, minNodeScreenRadius],
  );

  // View-mode-specific accessors
  const isPathway = viewMode === "pathway";
  const isSignal = viewMode === "signal";

  // Helper: compute the minimum tier alpha of a link's endpoints.
  // When progressive disclosure is active, links to invisible nodes are hidden.
  const linkDisclosureAlpha = useCallback(
    (link: any): number => {
      if (!isProgressive) return 1;
      const scale = currentScaleRef.current;
      const srcId = getLinkNodeId(link.source);
      const tgtId = getLinkNodeId(link.target);
      const srcAlpha = tierAlpha(nodeTierMap.get(srcId) ?? 3, scale);
      const tgtAlpha = tierAlpha(nodeTierMap.get(tgtId) ?? 3, scale);
      return Math.min(srcAlpha, tgtAlpha);
    },
    [isProgressive, nodeTierMap],
  );

  // Helper: check if a link is connected to the hovered node
  const isLinkConnected = useCallback(
    (link: any): boolean => {
      if (!hoveredNeighborLinks) return false;
      const srcId = getLinkNodeId(link.source);
      const tgtId = getLinkNodeId(link.target);
      return hoveredNeighborLinks.has(`${srcId}→${tgtId}`);
    },
    [hoveredNeighborLinks],
  );

  // Helper: check if a link is on the active signal path
  const isOnActivePath = useCallback(
    (link: any): boolean => {
      if (!activatedPathLinks) return false;
      const srcId = getLinkNodeId(link.source);
      const tgtId = getLinkNodeId(link.target);
      return activatedPathLinks.has(`${srcId}→${tgtId}`);
    },
    [activatedPathLinks],
  );

  // Helper: check if a link is on the preview (hovered) signal path
  const isOnPreviewPath = useCallback(
    (link: any): boolean => {
      if (!previewPathLinks) return false;
      const srcId = getLinkNodeId(link.source);
      const tgtId = getLinkNodeId(link.target);
      return previewPathLinks.has(`${srcId}→${tgtId}`);
    },
    [previewPathLinks],
  );

  // Custom link overlay: draws AFTER the library's default line.
  // Two responsibilities:
  //   1. Hover emphasis core: solid thin core stroke on top of the library's
  //      wide translucent glow line (all three views).
  //   2. Mesh labels: edge type + confidence text at the link midpoint.
  const isMesh = viewMode === "mesh";

  // Theme-aware neutral emphasis colors (Mesh + Signal core line).
  const meshEmphasisCore = isDark ? "rgb(210, 210, 210)" : "rgb(60, 60, 60)";

  const hoveredNeighborLinksRef = useRef<Set<string> | null>(null);
  hoveredNeighborLinksRef.current = hoveredNeighborLinks;

  const paintLinkOverlay = useCallback(
    (link: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
      const sx = link.source.x;
      const sy = link.source.y;
      const tx = link.target.x;
      const ty = link.target.y;
      if (sx == null || sy == null || tx == null || ty == null) return;

      const hoverLinks = hoveredNeighborLinksRef.current;
      const srcId = getLinkNodeId(link.source);
      const tgtId = getLinkNodeId(link.target);
      const isConnected = hoverLinks?.has(`${srcId}→${tgtId}`) ?? false;

      // 1. Hover emphasis: thin solid core on top of the library's wide glow (all views)
      if (isConnected) {
        let coreColor: string;
        if (isPathway || isSignal) {
          coreColor = link.bidirectional
            ? LUMEN_LINK_EMPHASIS_CORE
            : TERRA_LINK_EMPHASIS_CORE;
        } else {
          coreColor = meshEmphasisCore;
        }
        ctx.beginPath();
        const cp = link.__controlPoints;
        if (cp) {
          ctx.moveTo(sx, sy);
          ctx.quadraticCurveTo(cp[0], cp[1], tx, ty);
        } else {
          ctx.moveTo(sx, sy);
          ctx.lineTo(tx, ty);
        }
        ctx.strokeStyle = coreColor;
        ctx.lineWidth = LINK_EMPHASIS_CORE_WIDTH;
        ctx.stroke();
      }

      // 2. Mesh link labels (hover-only, skip reverse of bidir pairs)
      if (isMesh && !link._isReverse && isConnected) {
        const text = linkLabelText(link);
        if (!text) return;

        const dAlpha = linkDisclosureAlpha(link);
        if (dAlpha <= 0) return;

        const mx = (sx + tx) / 2;
        const my = (sy + ty) / 2;
        let angle = Math.atan2(ty - sy, tx - sx);
        if (angle > Math.PI / 2 || angle < -Math.PI / 2) angle += Math.PI;

        const fontSize = Math.max(8 / globalScale, 1.5);
        const computedFont = getComputedStyle(document.documentElement)
          .getPropertyValue("--font-geist-mono")
          .trim();
        const fontFamily = computedFont || "monospace";
        ctx.font = `${fontSize}px ${fontFamily}`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillStyle = `rgba(100, 100, 100, ${0.7 * dAlpha})`;

        ctx.save();
        ctx.translate(mx, my);
        ctx.rotate(angle);
        ctx.fillText(text, 0, -fontSize * 0.8);
        ctx.restore();
      }
    },
    [isMesh, isPathway, isSignal, meshEmphasisCore, linkDisclosureAlpha],
  );

  // Theme-aware mesh link colors: neutral gray that contrasts with the background.
  const meshLinkColor = isDark ? LINK_COLOR : "rgba(80, 80, 80, 0.18)";
  const meshLinkDim = isDark ? LINK_COLOR_DIM : "rgba(80, 80, 80, 0.06)";
  // Glow layer for two-layer hover emphasis (Mesh + Signal)
  const meshEmphasisGlow = isDark ? "rgba(210, 210, 210, 0.12)" : "rgba(40, 40, 40, 0.10)";

  const linkColorAccessor = useCallback(
    (link: any) => {
      const dAlpha = linkDisclosureAlpha(link);
      if (dAlpha <= 0) return "rgba(0,0,0,0)";

      const hasHover = hoveredNeighborLinks !== null;
      const connected = hasHover && isLinkConnected(link);

      if (isSignal) {
        const onActive = isOnActivePath(link);
        const onPreview = isOnPreviewPath(link);
        if (onActive && connected) return link.bidirectional ? LUMEN_LINK_EMPHASIS_GLOW : TERRA_LINK_EMPHASIS_GLOW;
        if (onActive) return link.bidirectional ? SIGNAL_ACTIVE_LINK_BI : SIGNAL_ACTIVE_LINK;
        if (onPreview) return link.bidirectional ? SIGNAL_PREVIEW_LINK_BI : SIGNAL_PREVIEW_LINK;
        return meshLinkColor;
      }

      if (isPathway) {
        if (!hasHover) return link.bidirectional ? LUMEN_LINK : TERRA_LINK;
        if (connected) return link.bidirectional ? LUMEN_LINK_EMPHASIS_GLOW : TERRA_LINK_EMPHASIS_GLOW;
        return meshLinkDim;
      }

      // Mesh view
      if (!hasHover) return meshLinkColor;
      return connected ? meshEmphasisGlow : meshLinkDim;
    },
    [isPathway, isSignal, hoveredNeighborLinks, activatedPathLinks, previewPathLinks, isLinkConnected, isOnActivePath, isOnPreviewPath, linkDisclosureAlpha, meshLinkColor, meshEmphasisGlow, meshLinkDim],
  );

  const linkWidthAccessor = useCallback(
    (link: any) => {
      if (linkDisclosureAlpha(link) <= 0) return 0;

      const hasHover = hoveredNeighborLinks !== null;
      const connected = hasHover && isLinkConnected(link);

      if (isSignal) {
        const onActive = isOnActivePath(link);
        const onPreview = isOnPreviewPath(link);
        if (onActive && connected) return LINK_EMPHASIS_WIDTH;
        if (onActive) return SIGNAL_ACTIVE_WIDTH;
        if (onPreview) return LINK_WIDTH * 0.8;
        return LINK_WIDTH;
      }

      if (isPathway) {
        const base = LINK_WIDTH + (link.confidence ?? 0.5) * 1.2;
        if (!hasHover) return base;
        return connected ? base * 2.5 : LINK_WIDTH_DIM;
      }

      // Mesh view
      if (!hasHover) return LINK_WIDTH;
      return connected ? LINK_EMPHASIS_WIDTH : LINK_WIDTH_DIM;
    },
    [isPathway, isSignal, hoveredNeighborLinks, activatedPathLinks, previewPathLinks, isLinkConnected, isOnActivePath, isOnPreviewPath, linkDisclosureAlpha],
  );

  const arrowLength = isPathway
    ? (link: any) => {
        const hasHover = hoveredNeighborLinks !== null;
        if (hasHover && !isLinkConnected(link)) return 0;
        return 3 + (link.confidence ?? 0.5) * 5;
      }
    : 0;

  const arrowColorAccessor = isPathway
    ? (link: any) => (link.bidirectional ? LUMEN_ARROW : TERRA_ARROW)
    : "rgba(0,0,0,0)";

  // Signal view: emit particles along the active path (always) and the
  // preview path (on hover). Uses refs so the interval callback reads current
  // values without re-mounting on every hover change.
  const activatedPathRef = useRef<Set<string> | null>(null);
  activatedPathRef.current = activatedPathLinks;
  const previewPathRef = useRef<Set<string> | null>(null);
  previewPathRef.current = previewPathLinks;

  // Stable per-link phase offsets for wave emission. Each link gets a
  // deterministic but pseudo-random offset so bursts ripple across the
  // graph instead of pulsing in unison.
  const linkPhaseMap = useMemo(() => {
    const map = new Map<string, number>();
    for (const link of graphData.links) {
      const srcId = getLinkNodeId(link.source);
      const tgtId = getLinkNodeId(link.target);
      const key = `${srcId}→${tgtId}`;
      let hash = 0;
      for (let i = 0; i < key.length; i++) {
        hash = ((hash << 5) - hash + key.charCodeAt(i)) | 0;
      }
      map.set(key, (Math.abs(hash) % 1000) / 1000);
    }
    return map;
  }, [graphData.links]);

  useEffect(() => {
    if (viewMode !== "signal") return;

    const emit = () => {
      const g = graphRef.current;
      if (!g) return;
      const activePath = activatedPathRef.current;
      const previewPath = previewPathRef.current;
      if (!activePath && !previewPath) return;

      const now = performance.now();

      for (const link of graphData.links) {
        const srcId = getLinkNodeId(link.source);
        const tgtId = getLinkNodeId(link.target);
        const key = `${srcId}→${tgtId}`;
        if (!activePath?.has(key) && !previewPath?.has(key)) continue;

        const phase = linkPhaseMap.get(key) ?? 0;
        const waveT = ((now / WAVE_PERIOD_MS) + phase) * Math.PI * 2;
        const waveFactor = (Math.sin(waveT) + 1) / 2; // 0..1
        const prob = WAVE_MIN_PROBABILITY + waveFactor * (WAVE_MAX_PROBABILITY - WAVE_MIN_PROBABILITY);

        if (Math.random() < prob) {
          g.emitParticle(link);
        }
      }
    };
    const id = setInterval(emit, WAVE_EMIT_INTERVAL_MS);
    return () => clearInterval(id);
  }, [viewMode, graphData, linkPhaseMap]);

  const particleColorAccessor = useCallback(
    (link: any) => {
      const srcId = getLinkNodeId(link.source);
      const tgtId = getLinkNodeId(link.target);
      const key = `${srcId}→${tgtId}`;
      const onPreview = previewPathRef.current?.has(key) && !activatedPathRef.current?.has(key);
      if (onPreview) {
        return link.bidirectional ? "rgba(115, 146, 255, 0.4)" : "rgba(184, 144, 98, 0.4)";
      }
      return link.bidirectional ? "rgba(115, 146, 255, 0.85)" : "rgba(184, 144, 98, 0.85)";
    },
    [],
  );

  // Time-based speed with subtle variation: base speed from the rAF delta
  // loop, plus a per-call jitter so particles within the same burst don't
  // travel in lockstep. The variation creates a slight accordion effect
  // where particles cluster and spread organically.
  const particleSpeedAccessor = useCallback(
    () => {
      const base = frameSpeedRef.current;
      const jitter = 1 + (Math.random() - 0.5) * 2 * SPEED_VARIATION;
      return base * jitter;
    },
    [],
  );

  // Tooltip position: use live coords when hovered, last-known when dismissing
  const anchorX = tooltipScreenPos?.x ?? lastTooltipPosRef.current.x;
  const anchorY = tooltipScreenPos?.y ?? lastTooltipPosRef.current.y;
  const isTooltipVisible = hoveredNode !== null;

  return (
    <div
      ref={containerRef}
      className={[styles.container, className].filter(Boolean).join(" ")}
    >
      {dimensions.width > 0 && (
        <ForceGraph2D
          ref={graphRef}
          graphData={graphData}
          width={dimensions.width}
          height={dimensions.height}
          autoPauseRedraw={!disclosureAnimating && !isSignal}
          nodeLabel=""
          nodeCanvasObject={paintNode}
          nodeCanvasObjectMode={nodeCanvasReplaceMode}
          nodePointerAreaPaint={(node: any, color: string, ctx: CanvasRenderingContext2D) => {
            const nodeTier = nodeTierMap.get(node.id) ?? 3;
            if (isProgressive && nodeTier !== 1) {
              if (!isTierVisible(nodeTier, currentScaleRef.current)) return;
              if (!disclosureStartRef.current.has(node.id)) return;
              const elapsed = performance.now() - disclosureStartRef.current.get(node.id)!;
              const t = Math.min(elapsed / DISCLOSURE_DURATION_MS, 1);
              if (t <= 0) return;
            }
            const r = getNodeSize(node) * 3 + 4;
            ctx.beginPath();
            ctx.arc(node.x, node.y, r, 0, 2 * Math.PI);
            ctx.fillStyle = color;
            ctx.fill();
          }}
          linkHoverPrecision={8}
          linkLabel={emptyLinkLabel}
          linkCanvasObject={paintLinkOverlay}
          linkCanvasObjectMode={linkCanvasAfterMode}
          linkColor={linkColorAccessor}
          linkWidth={linkWidthAccessor}
          linkDirectionalArrowLength={arrowLength}
          linkDirectionalArrowColor={arrowColorAccessor}
          linkCurvature={(link: any) => {
            if (!isPathway && !isSignal) return 0;
            return link._curveDirection ? 0.15 * link._curveDirection : 0;
          }}
          linkDirectionalParticles={0}
          linkDirectionalParticleSpeed={particleSpeedAccessor}
          linkDirectionalParticleWidth={PARTICLE_WIDTH}
          linkDirectionalParticleColor={particleColorAccessor}
          onNodeHover={handleNodeHover as any}
          onLinkHover={handleLinkHover as any}
          onNodeClick={handleNodeClick as any}
          onNodeDrag={handleNodeDrag}
          onNodeDragEnd={handleNodeDragEnd}
          enableNodeDrag={enableNodeDrag}
          enableZoomInteraction={enableZoom}
          enablePanInteraction={enablePan}
          onZoom={onTransformChange}
          warmupTicks={200}
          cooldownTicks={200}
          d3AlphaDecay={ALPHA_DECAY}
          d3VelocityDecay={VELOCITY_DECAY}
          onEngineStop={handleEngineStop}
          onRenderFramePre={gridDotColor ? paintGrid : undefined}
          backgroundColor="rgba(0,0,0,0)"
        />
      )}

      {/* Always-mounted animated tooltip (matches SkillMap treemap pattern).
          Anchor handles position + translate; visual handles height/opacity/scale. */}
      <div
        className={styles.tooltipAnchor}
        style={{
          left: anchorX,
          top: anchorY,
          transform:
            tooltipQuadrantRef.current === "tl" ? "translate(-100%, -100%) translate(-8px, -8px)" :
            tooltipQuadrantRef.current === "tr" ? "translate(0%, -100%) translate(8px, -8px)" :
            tooltipQuadrantRef.current === "bl" ? "translate(-100%, 0%) translate(-8px, 8px)" :
                                                   "translate(0%, 0%) translate(8px, 8px)",
        }}
      >
        <div
          className={styles.tooltipVisual}
          style={{
            height: tooltipH,
            opacity: isTooltipVisible ? 1 : 0,
            transform: `scale(${isTooltipVisible ? 1 : 0})`,
            transformOrigin: tooltipOrigin,
          }}
        >
          <div ref={tooltipContentRef} className={styles.tooltipInner}>
            {hoveredNode && (
              <>
                <span className={styles.tooltipId}>
                  {hoveredNode.id}
                </span>
                {hoveredNode.group && (
                  <span className={styles.tooltipBadge}>
                    {hoveredNode.group}
                  </span>
                )}
                {hoveredNode.label && hoveredNode.label !== hoveredNode.id && (
                  <span className={styles.tooltipDesc}>
                    {hoveredNode.label}
                  </span>
                )}
                {hoveredDegreeStats && hoveredDegreeStats.total > 0 && (
                  <div className={styles.tooltipDegrees}>
                    <span className={styles.tooltipDegreeValue}>{hoveredDegreeStats.total}</span>
                    <span className={styles.tooltipDegreeSplit}>
                      ({[
                        hoveredDegreeStats.inCount > 0 && `${hoveredDegreeStats.inCount} in`,
                        hoveredDegreeStats.outCount > 0 && `${hoveredDegreeStats.outCount} out`,
                        hoveredDegreeStats.biCount > 0 && `${hoveredDegreeStats.biCount} bi`,
                      ].filter(Boolean).join(" / ")})
                    </span>
                  </div>
                )}
                {hoveredDegreeStats && hoveredDegreeStats.total === 0 && (
                  <span className={styles.tooltipOrphan}>orphan</span>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

ForceGraph.displayName = "ForceGraph";
