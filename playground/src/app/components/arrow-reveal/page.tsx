"use client";

import { useState } from "react";
import { Shell } from "@/components/shell";
import { SectionHeading } from "@/components/token-grid";
import { ComponentPreview, PropsTable, SourcePath, SubsectionHeading} from "@/components/component-preview";
import { ArrowReveal } from "@ds/ArrowReveal/ArrowReveal";

function ArrowRevealDemo() {
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <div className="w-full max-w-md space-y-2">
      {["Design Systems", "Interaction Patterns", "Motion Tokens"].map((text, i) => (
        <div
          key={i}
          className="flex items-center justify-between px-4 py-3 rounded-sm border border-border cursor-pointer hover:border-accent/50 transition-colors"
          onMouseEnter={() => setHovered(i)}
          onMouseLeave={() => setHovered(null)}
        >
          <span className="text-sm font-medium">{text}</span>
          <ArrowReveal active={hovered === i}>
            <svg width="16" height="16" viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <path d="M5 10h10m0 0l-4-4m4 4l-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </ArrowReveal>
        </div>
      ))}
    </div>
  );
}

const code = `import { ArrowReveal } from "@/components/ui/ArrowReveal";

<ArrowReveal active={isHovered}>
  <svg>...</svg>
</ArrowReveal>`;

export default function ArrowRevealPage() {
  return (
    <Shell title="ArrowReveal">
      <div className="max-w-5xl space-y-10">
        <SectionHeading
          title="ArrowReveal"
          description="Hover-driven arrow/icon reveal. Shifts children along the x-axis and fades from resting to active opacity. Common 'go to' affordance for list rows and card links."
        />

        <ComponentPreview
          title="ArrowReveal"
          description="Arrow shifts right and fades in on row hover. Configurable shift distance and resting opacity."
          code={code}
        >
          <ArrowRevealDemo />
        </ComponentPreview>

        <div>
          <SubsectionHeading>Props</SubsectionHeading>
          <PropsTable
            props={[
              { name: "active", type: "boolean", description: "Whether the reveal is active (e.g., parent hovered)" },
              { name: "children", type: "ReactNode", description: "Arrow/icon content" },
              { name: "className", type: "string", description: "Additional CSS classes" },
              { name: "xShift", type: "number", default: "4", description: "Horizontal shift in px when active" },
              { name: "restingOpacity", type: "number", default: "0.3", description: "Opacity when inactive" },
            ]}
          />
        </div>

        <div>
          <SubsectionHeading>Motion Tokens Used</SubsectionHeading>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex gap-2">
              <span className="text-accent shrink-0">&bull;</span>
              Preset: <code className="text-xs bg-muted px-1.5 py-0.5 rounded-sm font-mono">TRANSITION_INDICATOR</code>
            </li>
            <li className="flex gap-2">
              <span className="text-accent shrink-0">&bull;</span>
              Duration: <code className="text-xs bg-muted px-1.5 py-0.5 rounded-sm font-mono">DURATION.moderate</code> (0.24s)
            </li>
            <li className="flex gap-2">
              <span className="text-accent shrink-0">&bull;</span>
              Easing: <code className="text-xs bg-muted px-1.5 py-0.5 rounded-sm font-mono">EASING.standard</code>
            </li>
          </ul>
        </div>

        <SourcePath path="src/components/ArrowReveal.tsx" />
      </div>
    </Shell>
  );
}
