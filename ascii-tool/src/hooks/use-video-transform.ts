"use client";
import { useState, useCallback, useRef } from 'react';

export interface MediaLayer {
  x: number;
  y: number;
  w: number;
  h: number;
}

export type ResizeCorner = 'nw' | 'ne' | 'sw' | 'se';

export interface SnapGuide {
  axis: 'x' | 'y';
  position: number;
}

interface DragState {
  type: 'pan' | 'resize';
  startClientX: number;
  startClientY: number;
  startLayer: MediaLayer;
  corner?: ResizeCorner;
  aspectRatio: number;
  displayScale: number;
}

export interface VideoTransformHook {
  layer: MediaLayer;
  snapGuides: SnapGuide[];
  isSelected: boolean;
  deselect: () => void;
  setLayer: (l: Partial<MediaLayer>) => void;
  setLayerDirect: (l: MediaLayer) => void;
  fitToCanvas: (canvasW: number, canvasH: number) => void;
  setDisplayScale: (s: number) => void;
  setCanvasSize: (w: number, h: number) => void;
  handlers: {
    onPointerDown: (e: React.PointerEvent) => void;
    onPointerMove: (e: React.PointerEvent) => void;
    onPointerUp: (e: React.PointerEvent) => void;
  };
  handleResizeStart: (
    e: React.PointerEvent,
    corner: ResizeCorner,
  ) => void;
}

interface UseVideoTransformOptions {
  onLayerCommit?: (layer: MediaLayer) => void;
}

const MIN_SIZE = 50;
const SNAP_THRESHOLD = 10;

function computeSnap(
  layer: MediaLayer,
  canvasW: number,
  canvasH: number,
): { snappedLayer: MediaLayer; guides: SnapGuide[] } {
  const guides: SnapGuide[] = [];
  let { x, y, w, h } = layer;

  const objLeft = x;
  const objRight = x + w;
  const objCenterX = x + w / 2;
  const objTop = y;
  const objBottom = y + h;
  const objCenterY = y + h / 2;

  const canvasCX = canvasW / 2;
  const canvasCY = canvasH / 2;

  const xCandidates = [
    { target: 0, obj: objLeft, adjust: (v: number) => v },
    { target: canvasCX, obj: objCenterX, adjust: (v: number) => v - w / 2 },
    { target: canvasW, obj: objRight, adjust: (v: number) => v - w },
  ];

  let bestX: { dist: number; target: number; adjust: (v: number) => number } | null = null;
  for (const c of xCandidates) {
    const dist = Math.abs(c.obj - c.target);
    if (dist < SNAP_THRESHOLD && (!bestX || dist < bestX.dist)) {
      bestX = { dist, target: c.target, adjust: c.adjust };
    }
  }
  if (bestX) {
    x = bestX.adjust(bestX.target);
    guides.push({ axis: 'x', position: bestX.target });
  }

  const yCandidates = [
    { target: 0, obj: objTop, adjust: (v: number) => v },
    { target: canvasCY, obj: objCenterY, adjust: (v: number) => v - h / 2 },
    { target: canvasH, obj: objBottom, adjust: (v: number) => v - h },
  ];

  let bestY: { dist: number; target: number; adjust: (v: number) => number } | null = null;
  for (const c of yCandidates) {
    const dist = Math.abs(c.obj - c.target);
    if (dist < SNAP_THRESHOLD && (!bestY || dist < bestY.dist)) {
      bestY = { dist, target: c.target, adjust: c.adjust };
    }
  }
  if (bestY) {
    y = bestY.adjust(bestY.target);
    guides.push({ axis: 'y', position: bestY.target });
  }

  return { snappedLayer: { x, y, w, h }, guides };
}

export function useVideoTransform(options?: UseVideoTransformOptions): VideoTransformHook {
  const [layer, setLayerState] = useState<MediaLayer>({ x: 0, y: 0, w: 800, h: 450 });
  const [snapGuides, setSnapGuides] = useState<SnapGuide[]>([]);
  const [isSelected, setIsSelected] = useState(false);
  const dragRef = useRef<DragState | null>(null);
  const displayScaleRef = useRef(1);
  const canvasSizeRef = useRef({ w: 800, h: 450 });
  const onLayerCommitRef = useRef(options?.onLayerCommit);
  onLayerCommitRef.current = options?.onLayerCommit;

  const setLayer = useCallback((l: Partial<MediaLayer>) => {
    setLayerState((prev) => ({ ...prev, ...l }));
  }, []);

  const setLayerDirect = useCallback((l: MediaLayer) => {
    setLayerState(l);
  }, []);

  const fitToCanvas = useCallback((canvasW: number, canvasH: number) => {
    setLayerState({ x: 0, y: 0, w: canvasW, h: canvasH });
    canvasSizeRef.current = { w: canvasW, h: canvasH };
    setSnapGuides([]);
  }, []);

  const setDisplayScale = useCallback((s: number) => {
    displayScaleRef.current = s;
  }, []);

  const setCanvasSize = useCallback((w: number, h: number) => {
    canvasSizeRef.current = { w, h };
  }, []);

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (e.button !== 0) return;
      const target = e.target as HTMLElement;
      if (target.dataset.resizeHandle) return;

      dragRef.current = {
        type: 'pan',
        startClientX: e.clientX,
        startClientY: e.clientY,
        startLayer: { ...layer },
        aspectRatio: layer.h > 0 ? layer.w / layer.h : 1,
        displayScale: displayScaleRef.current || 1,
      };
      setIsSelected(true);
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
      e.stopPropagation();
      e.preventDefault();
    },
    [layer],
  );

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    const drag = dragRef.current;
    if (!drag) return;

    const ds = drag.displayScale;
    const dx = (e.clientX - drag.startClientX) / ds;
    const dy = (e.clientY - drag.startClientY) / ds;
    const { w: cW, h: cH } = canvasSizeRef.current;

    if (drag.type === 'pan') {
      const raw: MediaLayer = {
        ...drag.startLayer,
        x: drag.startLayer.x + dx,
        y: drag.startLayer.y + dy,
      };
      const { snappedLayer, guides } = computeSnap(raw, cW, cH);
      setLayerState(snappedLayer);
      setSnapGuides(guides);
    } else if (drag.type === 'resize') {
      const corner = drag.corner!;
      const { startLayer, aspectRatio } = drag;
      const isLeft = corner === 'nw' || corner === 'sw';
      const isTop = corner === 'nw' || corner === 'ne';

      let newW: number;
      let newX = startLayer.x;

      if (isLeft) {
        newW = Math.max(MIN_SIZE, startLayer.w - dx);
        newX = startLayer.x + (startLayer.w - newW);
      } else {
        newW = Math.max(MIN_SIZE, startLayer.w + dx);
      }

      const newH = newW / aspectRatio;
      let newY = startLayer.y;
      if (isTop) {
        newY = startLayer.y + (startLayer.h - newH);
      }

      const raw: MediaLayer = { x: newX, y: newY, w: newW, h: newH };
      const { snappedLayer, guides } = computeSnap(raw, cW, cH);
      setLayerState(snappedLayer);
      setSnapGuides(guides);
    }
  }, []);

  const onPointerUp = useCallback(() => {
    dragRef.current = null;
    setSnapGuides([]);
    setLayerState((current) => {
      onLayerCommitRef.current?.(current);
      return current;
    });
  }, []);

  const handleResizeStart = useCallback(
    (e: React.PointerEvent, corner: ResizeCorner) => {
      e.stopPropagation();
      e.preventDefault();

      dragRef.current = {
        type: 'resize',
        startClientX: e.clientX,
        startClientY: e.clientY,
        startLayer: { ...layer },
        corner,
        aspectRatio: layer.h > 0 ? layer.w / layer.h : 1,
        displayScale: displayScaleRef.current || 1,
      };
      setIsSelected(true);

      const wrapper = (e.currentTarget as HTMLElement).parentElement;
      if (wrapper) wrapper.setPointerCapture(e.pointerId);
    },
    [layer],
  );

  const deselect = useCallback(() => {
    setIsSelected(false);
  }, []);

  return {
    layer,
    snapGuides,
    isSelected,
    deselect,
    setLayer,
    setLayerDirect,
    fitToCanvas,
    setDisplayScale,
    setCanvasSize,
    handlers: { onPointerDown, onPointerMove, onPointerUp },
    handleResizeStart,
  };
}
