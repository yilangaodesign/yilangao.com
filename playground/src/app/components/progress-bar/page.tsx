"use client";

import { useState, useEffect } from "react";
import { Shell } from "@/components/shell";
import { SectionHeading } from "@/components/token-grid";
import { ComponentPreview, PropsTable } from "@/components/component-preview";
import { cn } from "@/lib/utils";

function DemoProgressBar({
  value = 0,
  max = 100,
  indeterminate = false,
  label,
  showValue = false,
  size = "md",
  className,
}: {
  value?: number;
  max?: number;
  indeterminate?: boolean;
  label?: string;
  showValue?: boolean;
  size?: "sm" | "md";
  className?: string;
}) {
  const pct = indeterminate ? 0 : Math.min(100, (value / max) * 100);
  const trackH = size === "sm" ? "h-1" : "h-2";

  return (
    <div className={cn("w-full", className)} role="progressbar" aria-valuenow={indeterminate ? undefined : value} aria-valuemin={0} aria-valuemax={max}>
      {(label || showValue) && (
        <div className="flex items-baseline justify-between gap-2 mb-1.5">
          {label && (
            <span className="text-sm font-medium text-foreground">{label}</span>
          )}
          {showValue && !indeterminate && (
            <span className="text-xs font-mono text-muted-foreground tabular-nums">
              {Math.round(pct)}%
            </span>
          )}
        </div>
      )}
      <div className={cn("w-full rounded-full bg-muted overflow-hidden", trackH)}>
        {indeterminate ? (
          <div
            className={cn(
              "h-full w-1/3 rounded-full bg-accent animate-[indeterminate_1.5s_ease-in-out_infinite]"
            )}
          />
        ) : (
          <div
            className={cn(
              "h-full rounded-full bg-accent transition-[width] duration-300 ease-out"
            )}
            style={{ width: `${pct}%` }}
          />
        )}
      </div>
    </div>
  );
}

const determinateCode = `import { ProgressBar } from "@/components/ui/ProgressBar/ProgressBar";

<ProgressBar value={25} />
<ProgressBar value={50} />
<ProgressBar value={75} />
<ProgressBar value={100} />`;

const indeterminateCode = `import { ProgressBar } from "@/components/ui/ProgressBar/ProgressBar";

<ProgressBar indeterminate />`;

const labelCode = `import { ProgressBar } from "@/components/ui/ProgressBar/ProgressBar";

<ProgressBar label="Uploading" value={64} showValue />`;

const sizesCode = `import { ProgressBar } from "@/components/ui/ProgressBar/ProgressBar";

<ProgressBar size="sm" label="Small" value={45} showValue />
<ProgressBar size="md" label="Medium" value={45} showValue />`;

export default function ProgressBarPage() {
  const [animated, setAnimated] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setAnimated((prev) => (prev >= 100 ? 0 : prev + 2));
    }, 80);
    return () => clearInterval(timer);
  }, []);

  return (
    <Shell title="Progress Bar">
      <div className="max-w-5xl space-y-10">
        <SectionHeading
          title="Progress Bar"
          description="Horizontal progress indicator for determinate and indeterminate loading states. Shows a filled track with optional label and percentage."
        />

        <ComponentPreview
          title="Determinate"
          description="Static progress values. The fill width transitions smoothly on change."
          code={determinateCode}
        >
          <div className="w-full max-w-md space-y-5">
            <DemoProgressBar value={25} />
            <DemoProgressBar value={50} />
            <DemoProgressBar value={75} />
            <DemoProgressBar value={100} />
          </div>
        </ComponentPreview>

        <ComponentPreview
          title="Indeterminate"
          description="Animated shimmer for unknown-duration operations."
          code={indeterminateCode}
        >
          <div className="w-full max-w-md">
            <DemoProgressBar indeterminate />
          </div>
        </ComponentPreview>

        <ComponentPreview
          title="With label and value"
          description="Label on the left, percentage on the right. The value auto-animates in this demo."
          code={labelCode}
        >
          <div className="w-full max-w-md">
            <DemoProgressBar
              label="Uploading"
              value={animated}
              showValue
            />
          </div>
        </ComponentPreview>

        <ComponentPreview
          title="Sizes"
          description="Two track heights: sm (4px) and md (8px)."
          code={sizesCode}
        >
          <div className="w-full max-w-md space-y-6">
            <DemoProgressBar size="sm" label="Small" value={45} showValue />
            <DemoProgressBar size="md" label="Medium" value={45} showValue />
          </div>
        </ComponentPreview>

        <div>
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-3">
            Props
          </h3>
          <PropsTable
            props={[
              {
                name: "value",
                type: "number",
                default: "0",
                description: "Current progress value.",
              },
              {
                name: "max",
                type: "number",
                default: "100",
                description: "Maximum value representing 100% completion.",
              },
              {
                name: "indeterminate",
                type: "boolean",
                default: "false",
                description:
                  "Switches to an animated shimmer for unknown-duration tasks.",
              },
              {
                name: "label",
                type: "string",
                description:
                  "Optional text label displayed above the track on the left.",
              },
              {
                name: "showValue",
                type: "boolean",
                default: "false",
                description:
                  "Show the percentage value above the track on the right.",
              },
              {
                name: "size",
                type: '"sm" | "md"',
                default: '"md"',
                description: "Track height: sm (4px) or md (8px).",
              },
            ]}
          />
        </div>

        <div className="text-xs font-mono text-muted-foreground p-3 rounded-sm bg-muted/50">
          src/components/ui/ProgressBar/ProgressBar.tsx
        </div>
      </div>
    </Shell>
  );
}
