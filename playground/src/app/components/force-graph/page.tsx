"use client";

import { Shell } from "@/components/shell";
import { SectionHeading } from "@/components/token-grid";
import {
  ComponentPreview,
  PropsTable,
  SourcePath,
  SubsectionHeading,
} from "@/components/component-preview";
import { ForceGraph } from "@ds/ForceGraph";
import type { ForceGraphNode, ForceGraphLink } from "@ds/ForceGraph";

const DEMO_NODES: ForceGraphNode[] = [
  { id: "core", label: "Core", group: "hub", val: 12 },
  { id: "auth", label: "Auth", group: "hub", val: 8 },
  { id: "api", label: "API", group: "hub", val: 10 },
  { id: "db", label: "Database", group: "service", val: 6 },
  { id: "cache", label: "Cache", group: "service", val: 4 },
  { id: "queue", label: "Queue", group: "service", val: 3 },
  { id: "logger", label: "Logger", group: "util", val: 5 },
  { id: "config", label: "Config", group: "util", val: 4 },
  { id: "metrics", label: "Metrics", group: "util", val: 3 },
  { id: "users", label: "Users", group: "module", val: 5 },
  { id: "billing", label: "Billing", group: "module", val: 4 },
  { id: "notifications", label: "Notifications", group: "module", val: 3 },
  { id: "search", label: "Search", group: "module", val: 3 },
  { id: "uploads", label: "Uploads", group: "module", val: 2 },
  { id: "analytics", label: "Analytics", group: "module", val: 2 },
  { id: "gateway", label: "Gateway", group: "service", val: 6 },
  { id: "cdn", label: "CDN", group: "service", val: 2 },
  { id: "scheduler", label: "Scheduler", group: "util", val: 2 },
  { id: "health", label: "Health", group: "util", val: 1 },
  { id: "migrate", label: "Migrate", group: "util", val: 1 },
  { id: "deprecated", label: "Deprecated", group: "util", val: 0 },
  { id: "legacy-auth", label: "Legacy Auth", group: "util", val: 0 },
  { id: "sandbox", label: "Sandbox", group: "util", val: 0 },
];

// Each link appears once. Bidirectional links are expanded into paired arrows
// by ForceGraph internally. No duplicate A->B and B->A pairs needed.
const DEMO_LINKS: ForceGraphLink[] = [
  // Bidirectional (Lumen color, two curved arrows)
  { source: "core", target: "auth", edgeType: "reference", confidence: 0.9, bidirectional: true },
  { source: "core", target: "api", edgeType: "reference", confidence: 0.85, bidirectional: true },
  { source: "api", target: "gateway", edgeType: "reference", confidence: 0.75, bidirectional: true },
  { source: "billing", target: "users", edgeType: "reference", confidence: 0.7, bidirectional: true },
  { source: "analytics", target: "metrics", edgeType: "reference", confidence: 0.7, bidirectional: true },
  // Unidirectional (Terra color, single straight arrow)
  { source: "core", target: "db", edgeType: "reference", confidence: 0.7, bidirectional: false },
  { source: "core", target: "logger", edgeType: "documents", confidence: 0.5, bidirectional: false },
  { source: "core", target: "config", edgeType: "enforces", confidence: 0.6, bidirectional: false },
  { source: "api", target: "auth", edgeType: "reference", confidence: 0.8, bidirectional: false },
  { source: "api", target: "cache", edgeType: "reference", confidence: 0.6, bidirectional: false },
  { source: "auth", target: "db", edgeType: "reference", confidence: 0.9, bidirectional: false },
  { source: "auth", target: "cache", edgeType: "derives", confidence: 0.5, bidirectional: false },
  { source: "db", target: "migrate", edgeType: "triggers", confidence: 0.3, bidirectional: false },
  { source: "db", target: "cache", edgeType: "reference", confidence: 0.4, bidirectional: false },
  { source: "users", target: "auth", edgeType: "reference", confidence: 0.8, bidirectional: false },
  { source: "users", target: "db", edgeType: "documents", confidence: 0.7, bidirectional: false },
  { source: "users", target: "notifications", edgeType: "trigger", confidence: 0.6, bidirectional: false },
  { source: "billing", target: "db", edgeType: "reference", confidence: 0.65, bidirectional: false },
  { source: "billing", target: "queue", edgeType: "trigger", confidence: 0.5, bidirectional: false },
  { source: "notifications", target: "queue", edgeType: "trigger", confidence: 0.7, bidirectional: false },
  { source: "notifications", target: "logger", edgeType: "documents", confidence: 0.3, bidirectional: false },
  { source: "search", target: "db", edgeType: "reference", confidence: 0.6, bidirectional: false },
  { source: "search", target: "cache", edgeType: "reference", confidence: 0.5, bidirectional: false },
  { source: "uploads", target: "cdn", edgeType: "enforces", confidence: 0.8, bidirectional: false },
  { source: "uploads", target: "db", edgeType: "reference", confidence: 0.4, bidirectional: false },
  { source: "analytics", target: "db", edgeType: "reference", confidence: 0.5, bidirectional: false },
  { source: "gateway", target: "cache", edgeType: "derives", confidence: 0.4, bidirectional: false },
  { source: "scheduler", target: "queue", edgeType: "trigger", confidence: 0.6, bidirectional: false },
  { source: "health", target: "core", edgeType: "documents", confidence: 0.3, bidirectional: false },
  { source: "metrics", target: "logger", edgeType: "reference", confidence: 0.4, bidirectional: false },
];

// Node colors are derived from val (degree) by the ForceGraph component
// automatically — brighter = higher hierarchy, dimmer = lower hierarchy.

const defaultCode = `import { ForceGraph } from "@ds/ForceGraph";

<ForceGraph
  nodes={nodes}
  links={links}
  height={400}
/>`;

const pathwayCode = `import { ForceGraph } from "@ds/ForceGraph";

<ForceGraph
  nodes={nodes}
  links={links}
  height={400}
  viewMode="pathway"
/>`;

const signalCode = `import { ForceGraph } from "@ds/ForceGraph";

// Auto-activates the hub node. Hover to preview; click to switch.
<ForceGraph
  nodes={nodes}
  links={links}
  height={400}
  viewMode="signal"
/>`;

const hubLabelsCode = `<ForceGraph
  nodes={nodes}
  links={links}
  height={400}
  labelVisibility="hubs"
  labelFont="mono"
/>`;

const progressiveCode = `import { ForceGraph } from "@ds/ForceGraph";

// Hubs + orphans always visible. Mid-tier fades in at ~0.8x zoom.
// Leaves fade in at ~1.5x zoom. Scroll to reveal detail.
<ForceGraph
  nodes={nodes}
  links={links}
  height={400}
  nodeDisclosure="progressive"
  enableZoom
/>`;

export default function ForceGraphPage() {
  return (
    <Shell title="ForceGraph">
      <div className="max-w-5xl space-y-10">
        <SectionHeading
          title="ForceGraph"
          description="Interactive force-directed graph visualization with pan, zoom, and hover tooltips. Renders on HTML5 Canvas for performance with large datasets. Supports three view modes: Mesh (topology), Pathway (direction), and Signal (dynamics)."
        />

        <ComponentPreview
          title="Mesh (default)"
          description="Undirected links, uniform color. Shows pure topology. Hover a node to see link labels (edge type + confidence) oriented along each path. Zoom is disabled by default (use CanvasToolbar for zoom controls)."
          code={defaultCode}
        >
          <ForceGraph
            nodes={DEMO_NODES}
            links={DEMO_LINKS}
            height={400}
          />
        </ComponentPreview>

        <ComponentPreview
          title="Pathway"
          description="Directional arrows scaled by confidence. Terra = unidirectional links, Lumen = bidirectional links. Thicker = higher confidence."
          code={pathwayCode}
        >
          <ForceGraph
            nodes={DEMO_NODES}
            links={DEMO_LINKS}
            height={400}
            viewMode="pathway"
          />
        </ComponentPreview>

        <ComponentPreview
          title="Signal"
          description="Always-active signal propagation. The hub node's path fires particles by default. Hover another node to preview its path (translucent particles). Click to switch the active source."
          code={signalCode}
        >
          <ForceGraph
            nodes={DEMO_NODES}
            links={DEMO_LINKS}
            height={400}
            viewMode="signal"
          />
        </ComponentPreview>

        <ComponentPreview
          title="Progressive disclosure"
          description="At default zoom, only hubs and orphans are visible. Zoom in to reveal mid-tier nodes (at ~0.8x), then leaf nodes (at ~1.5x). Orphans are always visible because they signal disconnected knowledge."
          code={progressiveCode}
        >
          <ForceGraph
            nodes={DEMO_NODES}
            links={DEMO_LINKS}
            height={400}
            nodeDisclosure="progressive"
            enableZoom
          />
        </ComponentPreview>

        <div>
          <SubsectionHeading>Props</SubsectionHeading>
          <PropsTable
            props={[
              { name: "nodes", type: "ForceGraphNode[]", default: "—", description: "Array of node objects with id, optional label, group, and val." },
              { name: "links", type: "ForceGraphLink[]", default: "—", description: "Array of link objects with source, target, and optional edgeType, confidence, bidirectional." },
              { name: "height", type: "number", default: "500", description: "Height of the canvas in pixels." },
              { name: "nodeColor", type: "(node) => string", default: "gray", description: "Callback returning a CSS color string for each node." },
              { name: "onNodeHover", type: "(node | null) => void", default: "—", description: "Callback fired when hovering over a node." },
              { name: "onNodeClick", type: "(node) => void", default: "—", description: "Callback fired when clicking a node." },
              { name: "labelVisibility", type: "'all' | 'hubs' | 'none'", default: "'hubs'", description: "When to show node labels. 'hubs' shows only high-val nodes at default zoom." },
              { name: "labelFont", type: "'mono' | 'sans'", default: "'mono'", description: "Font family for canvas-rendered node labels." },
              { name: "enableNodeDrag", type: "boolean", default: "true", description: "Allow dragging individual nodes. Dragged nodes spring back to equilibrium on release (Obsidian-style)." },
              { name: "viewMode", type: "'mesh' | 'pathway' | 'signal'", default: "'mesh'", description: "Rendering mode. Mesh = topology, Pathway = directional arrows, Signal = on-demand particles." },
              { name: "nodeDisclosure", type: "'all' | 'progressive'", default: "'all'", description: "When 'progressive', only hub + orphan nodes visible at default zoom; mid-tier and leaf nodes fade in as user zooms in." },
              { name: "onZoomIn", type: "(fn) => void", default: "—", description: "Receives a zoom-in callback to wire to external controls." },
              { name: "onZoomOut", type: "(fn) => void", default: "—", description: "Receives a zoom-out callback to wire to external controls." },
              { name: "onFitToView", type: "(fn) => void", default: "—", description: "Receives a fit-to-view callback to wire to external controls." },
              { name: "className", type: "string", default: "—", description: "Additional CSS class for the container." },
            ]}
          />
        </div>

        <SourcePath path="src/components/ui/ForceGraph/ForceGraph.tsx · src/components/ui/ForceGraph/force-graph.module.scss" />
      </div>
    </Shell>
  );
}
