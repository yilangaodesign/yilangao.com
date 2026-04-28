"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { Canvas } from "@/components/ui/Canvas";
import { ForceGraph } from "@/components/ui/ForceGraph";
import type { CanvasTransform, CanvasToolbarItem } from "@/components/ui/Canvas";
import type { ForceGraphNode, ForceGraphViewMode } from "@/components/ui/ForceGraph";
import { Share2, Route, Activity, ZoomIn, ZoomOut, Crosshair } from "lucide-react";
import styles from "./elan-visuals.module.scss";

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

const VIEW_MODES: ForceGraphViewMode[] = ["signal", "pathway", "mesh"];
const VIEW_PHASE_DURATION = 6000;
const HUB_ROTATION_INTERVAL = 3000;
const ORPHAN_SAMPLE_SIZE = 4;

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function GraphCanvas() {
  const [data, setData] = useState<ApiData | null>(null);
  const [error, setError] = useState(false);
  const [viewMode, setViewMode] = useState<ForceGraphViewMode>("signal");
  const [canvasTransform, setCanvasTransform] = useState<CanvasTransform>({
    x: 0,
    y: 0,
    k: 1,
  });

  const zoomInRef = useRef<(() => void) | null>(null);
  const zoomOutRef = useRef<(() => void) | null>(null);
  const fitRef = useRef<(() => void) | null>(null);

  // Auto-transition state
  const containerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [tourStopped, setTourStopped] = useState(false);
  const [signalSourceOverride, setSignalSourceOverride] = useState<string | undefined>(undefined);
  const phaseIndexRef = useRef(0); // 0=signal, 1=pathway, 2=mesh
  const hubQueueRef = useRef<string[]>([]);
  const hubQueueIndexRef = useRef(0);
  const phaseTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const hubTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

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
    return () => {
      cancelled = true;
    };
  }, []);

  // Build the hub queue from loaded data
  const hubPool = useMemo(() => {
    if (!data) return [];
    const vals = data.nodes.map((n) => n.val ?? 0);
    const median = vals.length > 0
      ? [...vals].sort((a, b) => a - b)[Math.floor(vals.length / 2)]
      : 0;
    const hubs = data.nodes.filter((n) => (n.val ?? 0) > median).map((n) => n.id);
    const orphans = data.nodes.filter((n) => (n.val ?? 0) === 0).map((n) => n.id);
    const sampledOrphans = shuffleArray(orphans).slice(0, ORPHAN_SAMPLE_SIZE);
    return [...hubs, ...sampledOrphans];
  }, [data]);

  useEffect(() => {
    if (hubPool.length > 0) {
      hubQueueRef.current = shuffleArray(hubPool);
      hubQueueIndexRef.current = 0;
    }
  }, [hubPool]);

  // IntersectionObserver for viewport visibility
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { threshold: 0.3 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const clearTimers = useCallback(() => {
    if (phaseTimerRef.current) {
      clearInterval(phaseTimerRef.current);
      phaseTimerRef.current = null;
    }
    if (hubTimerRef.current) {
      clearInterval(hubTimerRef.current);
      hubTimerRef.current = null;
    }
  }, []);

  const advanceHub = useCallback(() => {
    if (hubQueueRef.current.length === 0) return;
    hubQueueIndexRef.current++;
    if (hubQueueIndexRef.current >= hubQueueRef.current.length) {
      hubQueueRef.current = shuffleArray(hubQueueRef.current);
      hubQueueIndexRef.current = 0;
    }
    setSignalSourceOverride(hubQueueRef.current[hubQueueIndexRef.current]);
  }, []);

  const startHubRotation = useCallback(() => {
    if (hubTimerRef.current) clearInterval(hubTimerRef.current);
    // Set the first hub immediately
    if (hubQueueRef.current.length > 0) {
      setSignalSourceOverride(hubQueueRef.current[hubQueueIndexRef.current]);
    }
    hubTimerRef.current = setInterval(advanceHub, HUB_ROTATION_INTERVAL);
  }, [advanceHub]);

  const stopHubRotation = useCallback(() => {
    if (hubTimerRef.current) {
      clearInterval(hubTimerRef.current);
      hubTimerRef.current = null;
    }
    setSignalSourceOverride(undefined);
  }, []);

  // Main auto-transition loop
  useEffect(() => {
    if (!data || !isVisible || tourStopped) {
      clearTimers();
      return;
    }

    // Start at the current phase
    const currentMode = VIEW_MODES[phaseIndexRef.current];
    setViewMode(currentMode);
    if (currentMode === "signal") {
      startHubRotation();
    }

    phaseTimerRef.current = setInterval(() => {
      stopHubRotation();
      phaseIndexRef.current = (phaseIndexRef.current + 1) % VIEW_MODES.length;
      const nextMode = VIEW_MODES[phaseIndexRef.current];
      setViewMode(nextMode);
      if (nextMode === "signal") {
        startHubRotation();
      }
    }, VIEW_PHASE_DURATION);

    return clearTimers;
  }, [data, isVisible, tourStopped, clearTimers, startHubRotation, stopHubRotation]);

  const toolbarItems: CanvasToolbarItem[] = [
    { id: "signal", icon: <Activity />, label: "Signal", active: viewMode === "signal" },
    { id: "pathway", icon: <Route />, label: "Pathway", active: viewMode === "pathway" },
    { id: "mesh", icon: <Share2 />, label: "Mesh", active: viewMode === "mesh" },
    { id: "zoom-in", icon: <ZoomIn />, label: "Zoom in", separator: true },
    { id: "zoom-out", icon: <ZoomOut />, label: "Zoom out" },
    { id: "fit", icon: <Crosshair />, label: "Center" },
  ];

  const handleToolbarClick = useCallback((id: string) => {
    switch (id) {
      case "mesh":
      case "pathway":
      case "signal": {
        const mode = id as ForceGraphViewMode;
        setViewMode(mode);
        // Toolbar switch resets the loop timer to the user's selection
        if (!tourStopped) {
          phaseIndexRef.current = VIEW_MODES.indexOf(mode);
          // Restart the phase timer from this point
          if (phaseTimerRef.current) clearInterval(phaseTimerRef.current);
          stopHubRotation();
          if (mode === "signal") startHubRotation();
          phaseTimerRef.current = setInterval(() => {
            stopHubRotation();
            phaseIndexRef.current = (phaseIndexRef.current + 1) % VIEW_MODES.length;
            const nextMode = VIEW_MODES[phaseIndexRef.current];
            setViewMode(nextMode);
            if (nextMode === "signal") startHubRotation();
          }, VIEW_PHASE_DURATION);
        }
        break;
      }
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
  }, [tourStopped, startHubRotation, stopHubRotation]);

  const handleNodeClick = useCallback((node: ForceGraphNode) => {
    if (viewMode === "signal") {
      setTourStopped(true);
      clearTimers();
    }
  }, [viewMode, clearTimers]);

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
      <div ref={containerRef} className={styles.visualContainer}>
        <div className={styles.visualBody} style={{ height: 460 }} />
      </div>
    );
  }

  return (
    <div ref={containerRef} className={styles.visualContainer} style={{ position: "relative" }}>
      <Canvas
        height={460}
        showGrid={false}
        transform={canvasTransform}
        toolbar={toolbarItems}
        onToolbarItemClick={handleToolbarClick}
        toolbarAutoTour={!tourStopped}
        className={styles.canvasGrab}
      >
        <ForceGraph
          nodes={data.nodes}
          links={data.links}
          height={460}
          labelVisibility="hubs"
          labelFont="mono"
          labelBackground
          nodeDisclosure="all"
          minNodeScreenRadius={2}
          minInitialZoom={0.6}
          enableZoom
          enablePan
          viewMode={viewMode}
          signalSourceOverride={signalSourceOverride}
          onNodeClick={handleNodeClick}
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
          onFitToView={handleFitToView}
          onTransformChange={setCanvasTransform}
        />
      </Canvas>
    </div>
  );
}
