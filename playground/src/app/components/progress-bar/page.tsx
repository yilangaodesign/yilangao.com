"use client";

import { useState, useEffect } from "react";
import { Shell } from "@/components/shell";
import { SectionHeading } from "@/components/token-grid";
import { ComponentPreview, PropsTable, SourcePath, SubsectionHeading} from "@/components/component-preview";
import { ProgressBar } from "@ds/ProgressBar";

const determinateCode = `import { ProgressBar } from "@ds/ProgressBar";

<ProgressBar value={25} />
<ProgressBar value={50} />
<ProgressBar value={75} />
<ProgressBar value={100} />`;

const indeterminateCode = `import { ProgressBar } from "@ds/ProgressBar";

<ProgressBar indeterminate />`;

const labelCode = `import { ProgressBar } from "@ds/ProgressBar";

<ProgressBar label="Uploading" value={64} showValue />`;

const sizesCode = `import { ProgressBar } from "@ds/ProgressBar";

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
            <ProgressBar value={25} />
            <ProgressBar value={50} />
            <ProgressBar value={75} />
            <ProgressBar value={100} />
          </div>
        </ComponentPreview>

        <ComponentPreview
          title="Indeterminate"
          description="Animated shimmer for unknown-duration operations."
          code={indeterminateCode}
        >
          <div className="w-full max-w-md">
            <ProgressBar indeterminate />
          </div>
        </ComponentPreview>

        <ComponentPreview
          title="With label and value"
          description="Label on the left, percentage on the right. The value auto-animates in this demo."
          code={labelCode}
        >
          <div className="w-full max-w-md">
            <ProgressBar
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
            <ProgressBar size="sm" label="Small" value={45} showValue />
            <ProgressBar size="md" label="Medium" value={45} showValue />
          </div>
        </ComponentPreview>

        <div>
          <SubsectionHeading>Props</SubsectionHeading>
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

        <SourcePath path="src/components/ui/ProgressBar/ProgressBar.tsx" />
      </div>
    </Shell>
  );
}
