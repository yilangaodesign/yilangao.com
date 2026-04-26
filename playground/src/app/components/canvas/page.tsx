"use client";

import { useState, useCallback } from "react";
import { Shell } from "@/components/shell";
import { SectionHeading } from "@/components/token-grid";
import {
  ComponentPreview,
  PropsTable,
  SourcePath,
  SubsectionHeading,
} from "@/components/component-preview";
import { Canvas } from "@ds/Canvas";
import type { CanvasToolbarItem } from "@ds/Canvas";
import Share2 from "lucide-react/dist/esm/icons/share-2";
import Route from "lucide-react/dist/esm/icons/route";
import Activity from "lucide-react/dist/esm/icons/activity";
import ZoomIn from "lucide-react/dist/esm/icons/zoom-in";
import ZoomOut from "lucide-react/dist/esm/icons/zoom-out";
import Crosshair from "lucide-react/dist/esm/icons/crosshair";
import Brush from "lucide-react/dist/esm/icons/brush";

const demoCode = `import { Canvas } from "@ds/Canvas";
import type { CanvasToolbarItem } from "@ds/Canvas";

const toolbar: CanvasToolbarItem[] = [
  { id: "mesh", icon: <MeshIcon />, label: "Mesh", active: true },
  { id: "pathway", icon: <PathIcon />, label: "Pathway" },
  { id: "signal", icon: <SignalIcon />, label: "Signal" },
  { id: "zoom-in", icon: <ZoomInIcon />, label: "Zoom in", separator: true },
  { id: "zoom-out", icon: <ZoomOutIcon />, label: "Zoom out" },
  { id: "fit", icon: <CrosshairIcon />, label: "Center" },
  { id: "organize", icon: <BrushIcon />, label: "Organize" },
];

<Canvas
  height={400}
  manageTransform
  toolbar={toolbar}
  onToolbarItemClick={(id) => handleClick(id)}
>
  <YourContent />
</Canvas>`;

function DemoBox() {
  return (
    <div
      style={{
        position: "absolute",
        left: 80,
        top: 60,
        width: 260,
        padding: "16px 20px",
        display: "flex",
        flexDirection: "column",
        gap: 6,
        border: "1px solid var(--color-border)",
        background: "var(--portfolio-surface-inverse-bold)",
        color: "var(--portfolio-text-inverse-bold)",
        fontSize: 11,
        fontFamily: "var(--portfolio-font-mono, monospace)",
        lineHeight: 1.5,
      }}
    >
      <span style={{ fontWeight: 600, fontSize: 12 }}>Interactions</span>
      <span>Scroll wheel → zoom</span>
      <span>Pinch (trackpad) → zoom</span>
      <span>Two-finger scroll → pan</span>
      <span>Left-drag background → pan</span>
      <span>Middle-click drag → pan</span>
    </div>
  );
}

function CanvasDemo() {
  const [active, setActive] = useState("mesh");

  const toolbar: CanvasToolbarItem[] = [
    { id: "mesh", icon: <Share2 />, label: "Mesh", active: active === "mesh" },
    { id: "pathway", icon: <Route />, label: "Pathway", active: active === "pathway" },
    { id: "signal", icon: <Activity />, label: "Signal", active: active === "signal" },
    { id: "zoom-in", icon: <ZoomIn />, label: "Zoom in", separator: true },
    { id: "zoom-out", icon: <ZoomOut />, label: "Zoom out" },
    { id: "fit", icon: <Crosshair />, label: "Center" },
    { id: "organize", icon: <Brush />, label: "Organize" },
  ];

  const handleClick = useCallback(
    (id: string) => {
      if (id === "mesh" || id === "pathway" || id === "signal") {
        setActive(id);
      }
    },
    [],
  );

  return (
    <Canvas
      height={400}
      manageTransform
      toolbar={toolbar}
      onToolbarItemClick={handleClick}
    >
      <DemoBox />
    </Canvas>
  );
}

export default function CanvasPage() {
  return (
    <Shell title="Canvas">
      <div className="max-w-5xl space-y-10">
        <SectionHeading
          title="Canvas"
          description="Pannable, zoomable surface with a dot-grid background and an integrated toolbar. Trackpad pinch and mouse wheel zoom, two-finger scroll pan, left-drag and middle-click drag pan on empty space. The toolbar sits in the top-right corner."
        />

        <SourcePath path="src/components/ui/Canvas/Canvas.tsx" />

        <ComponentPreview
          title="Canvas with toolbar"
          description="Managed mode with an integrated toolbar showing view-mode switches and zoom controls. Hover toolbar items to see tooltips."
          code={demoCode}
          flush
        >
          <CanvasDemo />
        </ComponentPreview>

        <div>
          <SubsectionHeading>Props</SubsectionHeading>
          <PropsTable
            props={[
              { name: "children", type: "ReactNode", default: "—", description: "Content rendered inside the canvas." },
              { name: "height", type: "number", default: "500", description: "Container height in px." },
              { name: "manageTransform", type: "boolean", default: "false", description: "When true, Canvas handles zoom and pan internally." },
              { name: "toolbar", type: "CanvasToolbarItem[]", default: "—", description: "Toolbar items rendered in a vertical stack at top-right of the canvas." },
              { name: "onToolbarItemClick", type: "(id: string) => void", default: "—", description: "Callback when a toolbar item is clicked." },
              { name: "transform", type: "CanvasTransform", default: "—", description: "External transform {x, y, k} to sync the grid (passthrough mode)." },
              { name: "onTransformChange", type: "(t: CanvasTransform) => void", default: "—", description: "Called when Canvas manages its own transform." },
              { name: "minZoom", type: "number", default: "0.1", description: "Minimum zoom level (managed mode)." },
              { name: "maxZoom", type: "number", default: "8", description: "Maximum zoom level (managed mode)." },
              { name: "gridSpacing", type: "number", default: "20", description: "World-space distance between dots at zoom 1x. Auto-doubles when zoomed out." },
              { name: "gridDotColor", type: "string", default: "var(--color-border)", description: "Dot fill color. Uses a theme-aware token by default." },
              { name: "gridDotRadius", type: "number", default: "1.5", description: "Dot radius at zoom 1x. Scales with zoom, clamped 1-4px." },
              { name: "className", type: "string", default: "—", description: "Additional CSS class." },
            ]}
          />
        </div>

        <div>
          <SubsectionHeading>CanvasToolbarItem</SubsectionHeading>
          <PropsTable
            props={[
              { name: "id", type: "string", default: "—", description: "Unique identifier for the item." },
              { name: "icon", type: "ReactNode", default: "—", description: "16px icon rendered inside the button." },
              { name: "label", type: "string", default: "—", description: "Tooltip text and aria-label." },
              { name: "active", type: "boolean", default: "false", description: "Whether the item is in active/selected state." },
              { name: "separator", type: "boolean", default: "false", description: "Renders a horizontal divider above this item." },
            ]}
          />
        </div>

        <div>
          <SubsectionHeading>Notes</SubsectionHeading>
          <ul className="text-sm text-muted-foreground space-y-2 list-disc pl-5">
            <li>
              <strong className="text-foreground">Managed mode</strong> — Uses a native non-passive{" "}
              <code>wheel</code> listener. Mouse wheel zooms; trackpad pinch zooms; two-finger scroll
              pans. Left-drag and middle-click drag on the background pan. Interactive children receive
              pointer events normally.
            </li>
            <li>
              <strong className="text-foreground">Passthrough mode</strong> (default) — Canvas draws the
              grid only. Pan and zoom live in the child. Pass <code>transform</code> from your
              child&apos;s callback so dots stay aligned.
            </li>
            <li>
              The grid auto-doubles spacing when zoomed far out to prevent dots from merging.
            </li>
            <li>
              Cursor shows <code>grab</code> / <code>grabbing</code> in managed mode only.
            </li>
          </ul>
        </div>
      </div>
    </Shell>
  );
}
