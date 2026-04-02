"use client";

import { useState } from "react";
import { Shell } from "@/components/shell";
import { SectionHeading } from "@/components/token-grid";
import { ComponentPreview, PropsTable, SourcePath, SubsectionHeading} from "@/components/component-preview";
import { ExpandCollapse } from "@ds/ExpandCollapse/ExpandCollapse";

function ExpandCollapseDemo() {
  const [open, setOpen] = useState(false);

  return (
    <div className="w-full max-w-md">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-4 py-3 rounded-sm border border-border hover:bg-muted/30 transition-colors text-sm font-medium"
      >
        <span>{open ? "Collapse" : "Expand"} Details</span>
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          className="transition-transform"
          aria-hidden="true"
          style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)" }}
        >
          <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      <ExpandCollapse open={open}>
        <div className="p-4 text-sm text-muted-foreground border border-t-0 border-border rounded-b-sm">
          This content animates its height from 0 to auto when opened, and
          back to 0 when closed. The exit animation plays before the element
          unmounts thanks to AnimatePresence. Use for accordions, disclosures,
          and inline detail panels.
        </div>
      </ExpandCollapse>
    </div>
  );
}

const code = `import { ExpandCollapse } from "@/components/ui/ExpandCollapse";

const [open, setOpen] = useState(false);

<button onClick={() => setOpen(o => !o)}>Toggle</button>
<ExpandCollapse open={open}>
  <div>Collapsible content here</div>
</ExpandCollapse>`;

export default function ExpandCollapsePage() {
  return (
    <Shell title="ExpandCollapse">
      <div className="max-w-5xl space-y-10">
        <SectionHeading
          title="ExpandCollapse"
          description="Animated expand/collapse disclosure using AnimatePresence and height: auto. For accordions, inline detail panels, and any toggle-driven content reveal."
        />

        <ComponentPreview
          title="ExpandCollapse"
          description="Wraps content that toggles visibility with a height animation. Uses AnimatePresence so the exit animation plays before unmount."
          code={code}
        >
          <ExpandCollapseDemo />
        </ComponentPreview>

        <div>
          <SubsectionHeading>Props</SubsectionHeading>
          <PropsTable
            props={[
              { name: "open", type: "boolean", description: "Whether the content is visible" },
              { name: "children", type: "ReactNode", description: "Content to reveal/hide" },
              { name: "className", type: "string", description: "Additional CSS classes" },
            ]}
          />
        </div>

        <div>
          <SubsectionHeading>Motion Tokens Used</SubsectionHeading>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex gap-2">
              <span className="text-accent shrink-0">&bull;</span>
              Preset: <code className="text-xs bg-muted px-1.5 py-0.5 rounded-sm font-mono">TRANSITION_EXPAND</code>
            </li>
            <li className="flex gap-2">
              <span className="text-accent shrink-0">&bull;</span>
              Duration: <code className="text-xs bg-muted px-1.5 py-0.5 rounded-sm font-mono">DURATION.slow</code> (0.4s)
            </li>
            <li className="flex gap-2">
              <span className="text-accent shrink-0">&bull;</span>
              Easing: <code className="text-xs bg-muted px-1.5 py-0.5 rounded-sm font-mono">EASING.standard</code>
            </li>
          </ul>
        </div>

        <SourcePath path="src/components/ExpandCollapse.tsx" />
      </div>
    </Shell>
  );
}
