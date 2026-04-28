"use client";

import {
  useRef,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
  type CSSProperties,
} from "react";
import CanvasToolbar from "../CanvasToolbar/CanvasToolbar";
import type { CanvasToolbarItem } from "../CanvasToolbar/CanvasToolbar";
import styles from "./canvas.module.scss";

// ── Types ────────────────────────────────────────────────────────────────────

export interface CanvasTransform {
  x: number;
  y: number;
  k: number;
}

export interface CanvasProps {
  children?: ReactNode;
  height?: number;
  /** Dot grid spacing in px (at zoom 1×). */
  gridSpacing?: number;
  /** Dot color — use a low-opacity neutral. */
  gridDotColor?: string;
  /** Dot radius in px at zoom 1× (scales with zoom in the render). */
  gridDotRadius?: number;
  /** Minimum zoom level. */
  minZoom?: number;
  /** Maximum zoom level. */
  maxZoom?: number;
  /** If true, Canvas manages its own zoom/pan. If false (default), Canvas
   *  only renders the grid and cursor states, deferring zoom/pan to the
   *  child (e.g. react-force-graph-2d's built-in d3-zoom). Use `transform`
   *  prop to sync the grid in passthrough mode. */
  manageTransform?: boolean;
  /** External transform to sync the grid with (passthrough mode). */
  transform?: CanvasTransform;
  /** Called when Canvas manages its own transform. */
  onTransformChange?: (t: CanvasTransform) => void;
  /** Toolbar items rendered in a vertical stack at top-right of the canvas. */
  toolbar?: CanvasToolbarItem[];
  /** Callback when a toolbar item is clicked. */
  onToolbarItemClick?: (id: string) => void;
  /** When true, the toolbar's active indicator shows a breathing pulse. */
  toolbarAutoTour?: boolean;
  /** Show the CSS dot grid. Set to false when a child draws its own grid. */
  showGrid?: boolean;
  className?: string;
}

// ── Constants ────────────────────────────────────────────────────────────────

const DEFAULT_HEIGHT = 500;
const DEFAULT_GRID_SPACING = 20;
const DEFAULT_DOT_COLOR = "var(--portfolio-border-subtle)";
const DEFAULT_DOT_RADIUS = 1.5;
const DEFAULT_MIN_ZOOM = 0.1;
const DEFAULT_MAX_ZOOM = 8;

// ── Component ────────────────────────────────────────────────────────────────

export default function Canvas({
  children,
  height = DEFAULT_HEIGHT,
  gridSpacing = DEFAULT_GRID_SPACING,
  gridDotColor = DEFAULT_DOT_COLOR,
  gridDotRadius = DEFAULT_DOT_RADIUS,
  minZoom = DEFAULT_MIN_ZOOM,
  maxZoom = DEFAULT_MAX_ZOOM,
  manageTransform = false,
  transform: externalTransform,
  onTransformChange,
  toolbar,
  onToolbarItemClick,
  toolbarAutoTour,
  showGrid = true,
  className,
}: CanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const transformLayerRef = useRef<HTMLDivElement>(null);
  const [internalTransform, setInternalTransform] = useState<CanvasTransform>({
    x: 0,
    y: 0,
    k: 1,
  });
  const isPanningRef = useRef(false);
  const [isPanningState, setIsPanningState] = useState(false);
  const [toolbarHovered, setToolbarHovered] = useState(false);
  const panStartRef = useRef({ x: 0, y: 0, tx: 0, ty: 0 });
  const transformRef = useRef(internalTransform);
  const minZoomRef = useRef(minZoom);
  const maxZoomRef = useRef(maxZoom);

  useEffect(() => {
    transformRef.current = internalTransform;
  }, [internalTransform]);

  useEffect(() => {
    minZoomRef.current = minZoom;
    maxZoomRef.current = maxZoom;
  }, [minZoom, maxZoom]);

  const t = manageTransform ? internalTransform : (externalTransform ?? { x: 0, y: 0, k: 1 });

  const toolbarRef = useRef<HTMLDivElement>(null);

  // Helper: is this event target the canvas background (not an interactive child)?
  // Any click that isn't inside the toolbar or an opted-in child (pointer-events: auto)
  // is treated as background — eligible for pan.
  const isBackgroundHit = useCallback((target: EventTarget | null): boolean => {
    const el = containerRef.current;
    if (!el || !(target instanceof Node)) return false;
    if (toolbarRef.current?.contains(target)) return false;
    const t = target as HTMLElement;
    if (t.closest?.("[data-canvas-interactive]")) return false;
    return true;
  }, []);

  // ── ALL wheel/pointer handling via native listeners (non-passive) ─────────
  useEffect(() => {
    if (!manageTransform) return;
    const el = containerRef.current;
    if (!el) return;

    // ── Wheel ────────────────────────────────────────────────────────────────
    // Mouse wheel (no ctrlKey) → zoom anchored at cursor.
    // Trackpad pinch (ctrlKey in Chrome) → zoom anchored at cursor.
    // Trackpad two-finger scroll (no ctrlKey, has deltaX) → pan.
    // When the cursor is outside the canvas rect, let the page scroll normally.
    const onWheel = (e: WheelEvent) => {
      const rect = el.getBoundingClientRect();
      const pointerX = e.clientX - rect.left;
      const pointerY = e.clientY - rect.top;

      // If the pointer is outside the canvas, don't capture — let the page scroll.
      if (pointerX < 0 || pointerY < 0 || pointerX > rect.width || pointerY > rect.height) return;

      const zMin = minZoomRef.current;
      const zMax = maxZoomRef.current;

      // Trackpad pinch (Chrome sets ctrlKey) OR mouse scroll wheel (no ctrlKey,
      // deltaX ≈ 0): both zoom. The distinction is that trackpad two-finger
      // scroll has significant deltaX — that's pan instead.
      const isTrackpadPan = !e.ctrlKey && Math.abs(e.deltaX) > 0;

      if (isTrackpadPan) {
        // Two-finger scroll on trackpad → pan
        e.preventDefault();
        e.stopPropagation();
        let dx = e.deltaX;
        let dy = e.deltaY;
        if (e.deltaMode === 1) { dx *= 16; dy *= 16; }
        else if (e.deltaMode === 2) { dx *= 100; dy *= 100; }
        setInternalTransform((prev) => ({
          ...prev,
          x: prev.x - dx,
          y: prev.y - dy,
        }));
        return;
      }

      // Mouse wheel OR trackpad pinch → zoom anchored at cursor position
      e.preventDefault();
      e.stopPropagation();
      let dy = e.deltaY;
      if (e.deltaMode === 1) dy *= 16;
      else if (e.deltaMode === 2) dy *= 100;

      setInternalTransform((prev) => {
        const newK = Math.min(zMax, Math.max(zMin, prev.k * Math.pow(2, -dy * 0.01)));
        const ratio = newK / prev.k;
        return {
          k: newK,
          x: pointerX - (pointerX - prev.x) * ratio,
          y: pointerY - (pointerY - prev.y) * ratio,
        };
      });
    };

    // ── Pointer: left-click drag or middle-click drag on background → pan ───
    const onPointerDown = (e: PointerEvent) => {
      // Only left (0) or middle (1) button
      if (e.button !== 0 && e.button !== 1) return;
      // Only start pan on the canvas background, not on interactive children
      if (!isBackgroundHit(e.target)) return;

      e.preventDefault();
      el.setPointerCapture(e.pointerId);

      isPanningRef.current = true;
      setIsPanningState(true);
      const cur = transformRef.current;
      panStartRef.current = {
        x: e.clientX,
        y: e.clientY,
        tx: cur.x,
        ty: cur.y,
      };
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!isPanningRef.current) return;
      const dx = e.clientX - panStartRef.current.x;
      const dy = e.clientY - panStartRef.current.y;
      setInternalTransform((prev) => ({
        ...prev,
        x: panStartRef.current.tx + dx,
        y: panStartRef.current.ty + dy,
      }));
    };

    const onPointerUp = () => {
      if (!isPanningRef.current) return;
      isPanningRef.current = false;
      setIsPanningState(false);
    };

    // Prevent default context menu on middle-click
    const onAuxClick = (e: MouseEvent) => {
      if (e.button === 1) e.preventDefault();
    };

    el.addEventListener("wheel", onWheel, { passive: false });
    el.addEventListener("pointerdown", onPointerDown);
    el.addEventListener("pointermove", onPointerMove);
    el.addEventListener("pointerup", onPointerUp);
    el.addEventListener("pointercancel", onPointerUp);
    el.addEventListener("auxclick", onAuxClick);

    return () => {
      el.removeEventListener("wheel", onWheel);
      el.removeEventListener("pointerdown", onPointerDown);
      el.removeEventListener("pointermove", onPointerMove);
      el.removeEventListener("pointerup", onPointerUp);
      el.removeEventListener("pointercancel", onPointerUp);
      el.removeEventListener("auxclick", onAuxClick);
    };
  }, [manageTransform, isBackgroundHit]);

  // ── Built-in toolbar actions for managed mode ──────────────────────────────
  const ZOOM_STEP = 1.4;

  const handleToolbarClick = useCallback(
    (id: string) => {
      if (manageTransform) {
        const el = containerRef.current;
        const zMin = minZoomRef.current;
        const zMax = maxZoomRef.current;

        if (id === "zoom-in" || id === "zoom-out") {
          const factor = id === "zoom-in" ? ZOOM_STEP : 1 / ZOOM_STEP;
          setInternalTransform((prev) => {
            const newK = Math.min(zMax, Math.max(zMin, prev.k * factor));
            const ratio = newK / prev.k;
            const cx = el ? el.clientWidth / 2 : 0;
            const cy = el ? el.clientHeight / 2 : 0;
            return {
              k: newK,
              x: cx - (cx - prev.x) * ratio,
              y: cy - (cy - prev.y) * ratio,
            };
          });
          return;
        }

        if (id === "fit") {
          const layer = transformLayerRef.current;
          if (!el || !layer) {
            setInternalTransform({ x: 0, y: 0, k: 1 });
            return;
          }

          const viewW = el.clientWidth;
          const viewH = el.clientHeight;
          const children = Array.from(layer.children) as HTMLElement[];

          if (children.length === 0) {
            setInternalTransform({ x: 0, y: 0, k: 1 });
            return;
          }

          // Compute bounding box of all children in world-space
          let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
          for (const child of children) {
            const l = child.offsetLeft;
            const t = child.offsetTop;
            minX = Math.min(minX, l);
            minY = Math.min(minY, t);
            maxX = Math.max(maxX, l + child.offsetWidth);
            maxY = Math.max(maxY, t + child.offsetHeight);
          }

          const contentW = maxX - minX;
          const contentH = maxY - minY;
          const PAD = 48;
          const fitK = Math.min(
            zMax,
            Math.max(zMin, Math.min(
              (viewW - PAD * 2) / Math.max(contentW, 1),
              (viewH - PAD * 2) / Math.max(contentH, 1),
            )),
          );

          const cx = minX + contentW / 2;
          const cy = minY + contentH / 2;

          setInternalTransform({
            k: fitK,
            x: viewW / 2 - cx * fitK,
            y: viewH / 2 - cy * fitK,
          });
          return;
        }
      }

      onToolbarItemClick?.(id);
    },
    [manageTransform, onToolbarItemClick],
  );

  // Notify parent of managed transform changes
  useEffect(() => {
    if (manageTransform) {
      onTransformChange?.(internalTransform);
    }
  }, [manageTransform, internalTransform, onTransformChange]);

  // ── Grid: multi-level spacing like FigJam ──────────────────────────────────
  // When zoomed out, raw spacing (gridSpacing * k) gets tiny and dots merge
  // into a solid fill. Fix: double the spacing repeatedly until the on-screen
  // gap is >= MIN_SCREEN_SPACING. Dot radius scales with the effective
  // multiplier so dots stay proportional, clamped to 1–4px.
  const MIN_SCREEN_SPACING = 16;
  let effectiveSpacing = gridSpacing;
  while (effectiveSpacing * t.k < MIN_SCREEN_SPACING) {
    effectiveSpacing *= 2;
  }
  const scaledSpacing = effectiveSpacing * t.k;
  const scaledDotR = Math.min(4, Math.max(1, gridDotRadius * t.k));
  const offsetX = ((t.x % scaledSpacing) + scaledSpacing) % scaledSpacing;
  const offsetY = ((t.y % scaledSpacing) + scaledSpacing) % scaledSpacing;

  const gridVars = {
    "--canvas-grid-step": `${scaledSpacing}px`,
    "--canvas-dot-r": `${scaledDotR}px`,
    "--canvas-grid-ox": `${offsetX}px`,
    "--canvas-grid-oy": `${offsetY}px`,
    "--canvas-dot-color": gridDotColor,
  } as CSSProperties;

  const cursorClass = isPanningState ? styles.cursorGrabbing : styles.cursorGrab;

  return (
    <div
      ref={containerRef}
      className={
        [styles.canvas, manageTransform ? styles.canvasManaged : "", manageTransform ? cursorClass : "", className]
          .filter(Boolean)
          .join(" ")
      }
      style={{ height }}
    >
      {showGrid && <div ref={gridRef} className={styles.grid} style={gridVars} />}
      <div
        ref={contentRef}
        className={[styles.content, manageTransform ? styles.contentManaged : ""].filter(Boolean).join(" ")}
        style={toolbarHovered ? { pointerEvents: "none" } : undefined}
      >
        {manageTransform ? (
          <div
            ref={transformLayerRef}
            className={styles.transformLayer}
            style={{
              transform: `translate(${t.x}px, ${t.y}px) scale(${t.k})`,
            }}
          >
            {children}
          </div>
        ) : (
          children
        )}
      </div>
      {toolbar && toolbar.length > 0 && (
        <div
          ref={toolbarRef}
          onPointerEnter={() => setToolbarHovered(true)}
          onPointerLeave={() => setToolbarHovered(false)}
        >
          <CanvasToolbar items={toolbar} onItemClick={handleToolbarClick} autoTour={toolbarAutoTour} />
        </div>
      )}
    </div>
  );
}

Canvas.displayName = "Canvas";
