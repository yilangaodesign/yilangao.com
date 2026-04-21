"use client";

import { useState } from "react";
import { Shell } from "@/components/shell";
import { SectionHeading } from "@/components/token-grid";
import {
  ComponentPreview,
  PropsTable,
  SourcePath,
  SubsectionHeading,
} from "@/components/component-preview";
import { MediaMuteToggle } from "@ds/MediaMuteToggle";

// ── Code snippets ────────────────────────────────────────────────────────────

const basicCode = `import { MediaMuteToggle } from "@ds/MediaMuteToggle";

const [muted, setMuted] = useState(false);

<MediaMuteToggle muted={muted} onMutedChange={setMuted} />`;

const overlayCode = `// Typical usage: absolute-positioned at the bottom-right of a video wrapper
<div className="relative">
  <video src="..." autoPlay loop playsInline muted={muted} />
  <MediaMuteToggle
    className="absolute right-2 bottom-2"
    muted={muted}
    onMutedChange={setMuted}
    mediaLabel="Product walkthrough"
  />
</div>`;

const sizeCode = `<MediaMuteToggle size="sm" muted={muted} onMutedChange={setMuted} />
<MediaMuteToggle size="md" muted={muted} onMutedChange={setMuted} />`;

// ── Demos ────────────────────────────────────────────────────────────────────

const videoStage =
  "relative w-80 h-44 flex items-center justify-center text-xs text-neutral-400 bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900";

function BasicDemo() {
  const [muted, setMuted] = useState(false);
  return (
    <div className={videoStage}>
      <span>Video surface ({muted ? "muted" : "unmuted"})</span>
      <MediaMuteToggle
        className="absolute right-2 bottom-2"
        muted={muted}
        onMutedChange={setMuted}
        mediaLabel="demo video"
      />
    </div>
  );
}

function SizeDemo() {
  const [muted, setMuted] = useState(false);
  return (
    <div className="flex items-center gap-4 bg-neutral-900 p-4">
      <MediaMuteToggle
        size="sm"
        muted={muted}
        onMutedChange={setMuted}
        mediaLabel="small demo"
      />
      <MediaMuteToggle
        size="md"
        muted={muted}
        onMutedChange={setMuted}
        mediaLabel="medium demo"
      />
      <span className="text-xs text-neutral-400">
        State: {muted ? "muted" : "unmuted"}
      </span>
    </div>
  );
}

function OverlayDemo() {
  const [muted, setMuted] = useState(true);
  return (
    <div className="flex flex-col gap-3">
      <div className={videoStage}>
        <MediaMuteToggle
          className="absolute right-2 bottom-2"
          muted={muted}
          onMutedChange={setMuted}
          mediaLabel="controlled demo"
        />
      </div>
      <p className="text-xs text-muted-foreground">
        External state: {muted ? "muted" : "unmuted"}
      </p>
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function MediaMuteTogglePage() {
  return (
    <Shell title="MediaMuteToggle">
      <div className="max-w-5xl space-y-10">
        <SectionHeading
          title="MediaMuteToggle"
          description="Viewer-facing mute/unmute control for videos. Icon-only button with a translucent overlay background, intended to be absolute-positioned in the corner of a video surface. Used by MediaRenderer on loop videos where the editor has opted into sound."
        />

        <ComponentPreview
          title="Basic"
          description="Controlled toggle rendered over a mock video surface."
          code={basicCode}
        >
          <BasicDemo />
        </ComponentPreview>

        <ComponentPreview
          title="Overlay placement"
          description="Typical integration: absolute-positioned at the bottom-right of the video wrapper, sharing the `muted` state with the underlying <video> element."
          code={overlayCode}
        >
          <OverlayDemo />
        </ComponentPreview>

        <ComponentPreview
          title="Sizes"
          description="sm (28×28) for tight surfaces, md (32×32) as the default."
          code={sizeCode}
        >
          <SizeDemo />
        </ComponentPreview>

        <div>
          <SubsectionHeading>Props</SubsectionHeading>
          <PropsTable
            props={[
              {
                name: "muted",
                type: "boolean",
                description:
                  "Controlled muted state. The consumer should pass the same value to the <video> element's muted prop.",
              },
              {
                name: "onMutedChange",
                type: "(next: boolean) => void",
                description:
                  "Called with the inverted state when the button is clicked. The consumer persists the new value.",
              },
              {
                name: "size",
                type: '"sm" | "md"',
                default: '"md"',
                description: "Square button size. sm is 28px, md is 32px.",
              },
              {
                name: "mediaLabel",
                type: "string",
                description:
                  "Optional short description of the media (e.g., alt text) appended to the aria-label for context — 'Mute {mediaLabel}' / 'Unmute {mediaLabel}'.",
              },
              {
                name: "className",
                type: "string",
                description:
                  "Forwarded to the root button. Parents typically use this for absolute positioning within a media wrapper.",
              },
            ]}
          />
        </div>

        <SourcePath path="@ds/MediaMuteToggle" />
      </div>
    </Shell>
  );
}
