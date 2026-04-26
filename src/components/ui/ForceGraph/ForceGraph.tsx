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
// Hover: emphasized (connected to hovered node)
const LINK_COLOR_EMPHASIS = "rgba(210, 210, 210, 0.5)";
const LINK_WIDTH_EMPHASIS = 1.4;
// Hover: dimmed (not connected to hovered node)
const LINK_COLOR_DIM = "rgba(160, 160, 160, 0.06)";
const LINK_WIDTH_DIM = 0.4;

// Pathway + Signal: semantic link color — Terra = unidirectional, Lumen = bidirectional.
// Inbound/outbound are relative to a node and meaningless at the network level;
// uni- vs bi-directional is an absolute property of the connection itself.
const TERRA_LINK = "rgba(184, 144, 98, 0.3)";
const TERRA_LINK_EMPHASIS = "rgba(184, 144, 98, 0.55)";
const TERRA_ARROW = "rgba(184, 144, 98, 0.7)";
const LUMEN_LINK = "rgba(115, 146, 255, 0.25)";
const LUMEN_LINK_EMPHASIS = "rgba(115, 146, 255, 0.5)";
const LUMEN_ARROW = "rgba(115, 146, 255, 0.65)";

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

function tierAlpha(tier: 1 | 2 | 3, scale: number): number {
  const threshold = TIER_THRESHOLDS[tier];
  if (threshold === 0) return 1;
  if (scale >= threshold + TIER_RAMP) return 1;
  if (scale <= threshold) return 0;
  return (scale - threshold) / TIER_RAMP;
}

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
  className,
}: ForceGraphProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height });
  const [hoveredNode, setHoveredNode] = useState<ForceGraphNode | null>(null);
  const graphRef = useRef<any>(null);
  const isDraggingRef = useRef(false);

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

  // Auto-select the highest-val node when entering Signal view
  useEffect(() => {
    if (viewMode !== "signal") {
      setSignalActiveNodeId(null);
      return;
    }
    // Only auto-select if no active node is set yet
    if (signalActiveNodeId && nodes.some((n) => n.id === signalActiveNodeId)) return;
    let best: ForceGraphNode | null = null;
    for (const n of nodes) {
      if (!best || (n.val ?? 0) > (best.val ?? 0)) best = n;
    }
    if (best) setSignalActiveNodeId(best.id);
  }, [viewMode, nodes]);

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

  // Expose zoom controls to parent via callback refs
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
  }, [onZoomIn, onZoomOut, onFitToView, dimensions.width]);

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
          expandedLinks.push({ ...l, _curveDirection: 1 } as any);
          expandedLinks.push({
            ...l,
            source: l.target,
            target: l.source,
            _curveDirection: -1,
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

  const handleEngineStop = useCallback(() => {
    pinAllNodes();
  }, [pinAllNodes]);

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
  const isProgressive = nodeDisclosure === "progressive";
  const orphanSet = useMemo(() => {
    const set = new Set<string>();
    for (const n of nodes) {
      const neighbors = undirectedAdj.get(n.id);
      if (!neighbors || neighbors.size === 0) set.add(n.id);
    }
    return set;
  }, [nodes, undirectedAdj]);

  const nodeTierMap = useMemo(() => {
    const map = new Map<string, 1 | 2 | 3>();
    for (const n of nodes) {
      const v = n.val ?? 0;
      const t = maxVal > 0 && v > 0 ? v / maxVal : 0;
      map.set(n.id, getNodeTier(t, orphanSet.has(n.id)));
    }
    return map;
  }, [nodes, maxVal, orphanSet]);

  // Compute 1st-degree and 2nd-degree connection counts for the hovered node.
  const hoveredDegreeStats = useMemo(() => {
    if (!hoveredNode) return null;
    const first = undirectedAdj.get(hoveredNode.id);
    if (!first || first.size === 0) return { first: 0, second: 0 };

    const secondSet = new Set<string>();
    for (const neighbor of first) {
      const neighbors2 = undirectedAdj.get(neighbor);
      if (!neighbors2) continue;
      for (const n2 of neighbors2) {
        if (n2 !== hoveredNode.id && !first.has(n2)) {
          secondSet.add(n2);
        }
      }
    }
    return { first: first.size, second: secondSet.size };
  }, [hoveredNode, undirectedAdj]);

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
      if (v === 0) return "rgb(190, 190, 190)"; // orphan: light but visible
      // t=1 (hub) → darkest, t≈0 (leaf) → lightest.
      // pow(0.6) stretches the lower range where most nodes cluster.
      const t = Math.pow(v / maxVal, 0.6);
      const channel = Math.round(200 - t * 160); // hub → 40, leaf → 200
      return `rgb(${channel}, ${channel}, ${channel})`;
    },
    [nodeColor, maxVal],
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

      // Progressive disclosure: skip invisible nodes entirely
      const disclosureAlpha = isProgressive
        ? tierAlpha(nodeTierMap.get(node.id) ?? 3, globalScale)
        : 1;
      if (disclosureAlpha <= 0) return;

      const r = getNodeSize(node);
      const color = getNodeColor(node);
      const isHovered = hoveredNode?.id === node.id;
      const hasHover = hoveredNode !== null;
      const isNeighbor = hoveredNeighborNodes?.has(node.id) ?? false;

      // Start with disclosure alpha as the base
      let alpha = disclosureAlpha;

      // Layer hover dimming on top of disclosure alpha
      if (hasHover && !isNeighbor) {
        alpha *= 0.2;
      } else if (hasHover && isNeighbor && !isHovered) {
        alpha *= 0.9;
      }

      ctx.globalAlpha = alpha;

      ctx.beginPath();
      ctx.arc(node.x, node.y, r, 0, 2 * Math.PI);
      ctx.fillStyle = color;
      ctx.fill();

      if (isHovered) {
        ctx.strokeStyle = "rgba(255, 255, 255, 0.7)";
        ctx.lineWidth = 1.5 / globalScale;
        ctx.stroke();
      } else if (hasHover && isNeighbor) {
        ctx.strokeStyle = "rgba(255, 255, 255, 0.3)";
        ctx.lineWidth = 0.8 / globalScale;
        ctx.stroke();
      }

      ctx.globalAlpha = 1;

      // Canvas labels: only for non-hover label modes (the tooltip handles
      // hovered/neighbor identification). Hover used to trigger labels here but
      // that's redundant with the tooltip and creates visual noise.
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

        ctx.fillStyle = `rgba(255, 255, 255, ${labelAlpha * disclosureAlpha})`;
        ctx.fillText(label, node.x, node.y + r + 2 / globalScale);
      }
    },
    [getNodeColor, getNodeSize, hoveredNode, hoveredNeighborNodes, labelVisibility, labelFont, isProgressive, nodeTierMap],
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

  // Link label: canvas-rendered text along the link midpoint (Mesh view only,
  // hover-only). Uses "after" mode so the library draws the line first.
  const isMesh = viewMode === "mesh";

  const paintLinkLabel = useCallback(
    (link: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
      if (!isMesh) return;
      if (link._curveDirection === -1) return;
      if (!hoveredNeighborLinks) return;
      const srcId = getLinkNodeId(link.source);
      const tgtId = getLinkNodeId(link.target);
      if (!hoveredNeighborLinks.has(`${srcId}→${tgtId}`)) return;

      const text = linkLabelText(link);
      if (!text) return;

      const dAlpha = linkDisclosureAlpha(link);
      if (dAlpha <= 0) return;

      const sx = link.source.x;
      const sy = link.source.y;
      const tx = link.target.x;
      const ty = link.target.y;
      if (sx == null || sy == null || tx == null || ty == null) return;

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
      ctx.fillStyle = `rgba(255, 255, 255, ${0.55 * dAlpha})`;

      ctx.save();
      ctx.translate(mx, my);
      ctx.rotate(angle);
      ctx.fillText(text, 0, -fontSize * 0.8);
      ctx.restore();
    },
    [isMesh, hoveredNeighborLinks, linkDisclosureAlpha],
  );

  const linkColorAccessor = useCallback(
    (link: any) => {
      const dAlpha = linkDisclosureAlpha(link);
      if (dAlpha <= 0) return "rgba(0,0,0,0)";

      const hasHover = hoveredNeighborLinks !== null;
      const connected = hasHover && isLinkConnected(link);

      if (isSignal) {
        const onActive = isOnActivePath(link);
        const onPreview = isOnPreviewPath(link);
        if (onActive && connected) return LINK_COLOR_EMPHASIS;
        if (onActive) return link.bidirectional ? SIGNAL_ACTIVE_LINK_BI : SIGNAL_ACTIVE_LINK;
        if (onPreview) return link.bidirectional ? SIGNAL_PREVIEW_LINK_BI : SIGNAL_PREVIEW_LINK;
        return LINK_COLOR;
      }

      if (isPathway) {
        if (!hasHover) return link.bidirectional ? LUMEN_LINK : TERRA_LINK;
        if (connected) return link.bidirectional ? LUMEN_LINK_EMPHASIS : TERRA_LINK_EMPHASIS;
        return LINK_COLOR_DIM;
      }

      // Mesh view
      if (!hasHover) return LINK_COLOR;
      return connected ? LINK_COLOR_EMPHASIS : LINK_COLOR_DIM;
    },
    [isPathway, isSignal, hoveredNeighborLinks, activatedPathLinks, previewPathLinks, isLinkConnected, isOnActivePath, isOnPreviewPath, linkDisclosureAlpha],
  );

  const linkWidthAccessor = useCallback(
    (link: any) => {
      if (linkDisclosureAlpha(link) <= 0) return 0;

      const hasHover = hoveredNeighborLinks !== null;
      const connected = hasHover && isLinkConnected(link);

      if (isSignal) {
        const onActive = isOnActivePath(link);
        const onPreview = isOnPreviewPath(link);
        if (onActive && connected) return LINK_WIDTH_EMPHASIS;
        if (onActive) return SIGNAL_ACTIVE_WIDTH;
        if (onPreview) return LINK_WIDTH * 0.8;
        return LINK_WIDTH;
      }

      if (isPathway) {
        const base = LINK_WIDTH + (link.confidence ?? 0.5) * 1.2;
        if (!hasHover) return base;
        return connected ? base * 1.3 : LINK_WIDTH_DIM;
      }

      // Mesh view
      if (!hasHover) return LINK_WIDTH;
      return connected ? LINK_WIDTH_EMPHASIS : LINK_WIDTH_DIM;
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
          nodeLabel=""
          nodeCanvasObject={paintNode}
          nodeCanvasObjectMode={() => "replace" as const}
          nodePointerAreaPaint={(node: any, color: string, ctx: CanvasRenderingContext2D) => {
            if (isProgressive) {
              const dAlpha = tierAlpha(nodeTierMap.get(node.id) ?? 3, currentScaleRef.current);
              if (dAlpha <= 0) return;
            }
            const r = getNodeSize(node) * 3 + 4;
            ctx.beginPath();
            ctx.arc(node.x, node.y, r, 0, 2 * Math.PI);
            ctx.fillStyle = color;
            ctx.fill();
          }}
          linkHoverPrecision={8}
          linkLabel={() => ""}
          linkCanvasObject={paintLinkLabel}
          linkCanvasObjectMode={() => "after" as const}
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
          autoPauseRedraw={!isSignal}
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
                {hoveredDegreeStats && hoveredDegreeStats.first > 0 && (
                  <div className={styles.tooltipDegrees}>
                    <span className={styles.tooltipDegreeRow}>
                      <span className={styles.tooltipDegreeValue}>{hoveredDegreeStats.first}</span>
                      <span className={styles.tooltipDegreeLabel}>direct</span>
                    </span>
                    {hoveredDegreeStats.second > 0 && (
                      <span className={styles.tooltipDegreeRow}>
                        <span className={styles.tooltipDegreeValue}>{hoveredDegreeStats.second}</span>
                        <span className={styles.tooltipDegreeLabel}>2nd-degree</span>
                      </span>
                    )}
                  </div>
                )}
                {hoveredDegreeStats && hoveredDegreeStats.first === 0 && (
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
