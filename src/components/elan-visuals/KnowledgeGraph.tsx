"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Canvas } from "@/components/ui/Canvas";
import { ForceGraph } from "@/components/ui/ForceGraph";
import type { CanvasTransform, CanvasToolbarItem } from "@/components/ui/Canvas";
import type { ForceGraphNode, ForceGraphViewMode } from "@/components/ui/ForceGraph";
import styles from "./elan-visuals.module.scss";

// Inline SVG icons to avoid lucide-react dependency (main site doesn't have it)
const iconProps = { width: 16, height: 16, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };

function IconMesh() {
  return (
    <svg {...iconProps}>
      <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
    </svg>
  );
}

function IconRoute() {
  return (
    <svg {...iconProps}>
      <circle cx="6" cy="19" r="3" /><circle cx="18" cy="5" r="3" />
      <path d="M12 19h4.5a3.5 3.5 0 0 0 0-7h-9a3.5 3.5 0 0 1 0-7H12" />
    </svg>
  );
}

function IconActivity() {
  return (
    <svg {...iconProps}>
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
    </svg>
  );
}

function IconZoomIn() {
  return (
    <svg {...iconProps}>
      <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
      <line x1="11" y1="8" x2="11" y2="14" /><line x1="8" y1="11" x2="14" y2="11" />
    </svg>
  );
}

function IconZoomOut() {
  return (
    <svg {...iconProps}>
      <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
      <line x1="8" y1="11" x2="14" y2="11" />
    </svg>
  );
}

function IconCrosshair() {
  return (
    <svg {...iconProps}>
      <circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" />
      <line x1="12" y1="2" x2="12" y2="6" /><line x1="12" y1="18" x2="12" y2="22" />
      <line x1="2" y1="12" x2="6" y2="12" /><line x1="18" y1="12" x2="22" y2="12" />
    </svg>
  );
}

type ApiLink = {
  source: string;
  target: string;
  edgeType: string;
  confidence: number;
  bidirectional: boolean;
};

type ApiData = {
  nodes: ForceGraphNode[];
  links: ApiLink[];
};

// Node colors are derived from val (degree) by the ForceGraph component
// itself — no GROUP_COLORS map needed. The component uses sqrt-scaled
// brightness from darkest (leaf) to brightest (hub) in the neutral family.

export default function KnowledgeGraph() {
  const [data, setData] = useState<ApiData | null>(null);
  const [error, setError] = useState(false);
  const [viewMode, setViewMode] = useState<ForceGraphViewMode>("mesh");
  const [canvasTransform, setCanvasTransform] = useState<CanvasTransform>({ x: 0, y: 0, k: 1 });

  const zoomInRef = useRef<(() => void) | null>(null);
  const zoomOutRef = useRef<(() => void) | null>(null);
  const fitRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/knowledge-graph")
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((d: ApiData) => {
        if (cancelled) return;
        const connectedNodes = d.nodes.filter((n) => (n.val ?? 0) > 0);
        const connectedIds = new Set(connectedNodes.map((n) => n.id));
        const connectedLinks = d.links.filter(
          (l) => connectedIds.has(l.source) && connectedIds.has(l.target),
        );
        setData({ nodes: connectedNodes, links: connectedLinks });
      })
      .catch(() => {
        if (!cancelled) setError(true);
      });
    return () => { cancelled = true; };
  }, []);

  const toolbarItems: CanvasToolbarItem[] = [
    { id: "mesh", icon: <IconMesh />, label: "Mesh", active: viewMode === "mesh" },
    { id: "pathway", icon: <IconRoute />, label: "Pathway", active: viewMode === "pathway" },
    { id: "signal", icon: <IconActivity />, label: "Signal", active: viewMode === "signal" },
    { id: "zoom-in", icon: <IconZoomIn />, label: "Zoom in", separator: true },
    { id: "zoom-out", icon: <IconZoomOut />, label: "Zoom out" },
    { id: "fit", icon: <IconCrosshair />, label: "Center" },
  ];

  const handleToolbarClick = useCallback((id: string) => {
    switch (id) {
      case "mesh":
      case "pathway":
      case "signal":
        setViewMode(id as ForceGraphViewMode);
        break;
      case "zoom-in":
        zoomInRef.current?.();
        break;
      case "zoom-out":
        zoomOutRef.current?.();
        break;
      case "fit":
        fitRef.current?.();
        break;
    }
  }, []);

  const handleZoomIn = useCallback((fn: () => void) => {
    zoomInRef.current = fn;
  }, []);

  const handleZoomOut = useCallback((fn: () => void) => {
    zoomOutRef.current = fn;
  }, []);

  const handleFitToView = useCallback((fn: () => void) => {
    fitRef.current = fn;
  }, []);

  if (error) return null;

  if (!data) {
    return (
      <div className={styles.visualContainer}>
        <div className={styles.visualBody} style={{ height: 500 }} />
      </div>
    );
  }

  return (
    <div className={styles.visualContainer} style={{ position: "relative" }}>
      <Canvas
        height={500}
        transform={canvasTransform}
        toolbar={toolbarItems}
        onToolbarItemClick={handleToolbarClick}
      >
        <ForceGraph
          nodes={data.nodes}
          links={data.links}
          height={500}
          labelVisibility="hubs"
          labelFont="mono"
          nodeDisclosure="progressive"
          enableZoom
          enablePan
          viewMode={viewMode}
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
          onFitToView={handleFitToView}
          onTransformChange={setCanvasTransform}
        />
      </Canvas>
    </div>
  );
}
