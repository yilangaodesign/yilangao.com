"use client";

import { useState } from "react";
import { Shell } from "@/components/shell";
import { SectionHeading } from "@/components/token-grid";
import { ComponentPreview, PropsTable } from "@/components/component-preview";

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
          style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)" }}
        >
          <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      <div
        style={{
          overflow: "hidden",
          maxHeight: open ? "200px" : "0px",
          opacity: open ? 1 : 0,
          transition: "max-height 0.4s cubic-bezier(0.2, 0, 0.38, 0.9), opacity 0.4s cubic-bezier(0.2, 0, 0.38, 0.9)",
        }}
      >
        <div className="p-4 text-sm text-muted-foreground border border-t-0 border-border rounded-b-sm">
          This content animates its height from 0 to auto when opened, and
          back to 0 when closed. The exit animation plays before the element
          unmounts thanks to AnimatePresence. Use for accordions, disclosures,
          and inline detail panels.
        </div>
      </div>
    </div>
  );
}

const code = `"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { TRANSITION_EXPAND, getReducedTransition } from "@/lib/motion";

export function ExpandCollapse({
  open,
  children,
  className,
}: {
  open: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  const prefersReduced = useReducedMotion();
  const transition = prefersReduced
    ? getReducedTransition(TRANSITION_EXPAND)
    : TRANSITION_EXPAND;

  return (
    <AnimatePresence initial={false}>
      {open && (
        <motion.div
          className={className}
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={transition}
          style={{ overflow: "hidden" }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}`;

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
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-3">
            Props
          </h3>
          <PropsTable
            props={[
              { name: "open", type: "boolean", description: "Whether the content is visible" },
              { name: "children", type: "ReactNode", description: "Content to reveal/hide" },
              { name: "className", type: "string", description: "Additional CSS classes" },
            ]}
          />
        </div>

        <div>
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-3">
            Motion Tokens Used
          </h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex gap-2">
              <span className="text-accent shrink-0">•</span>
              Preset: <code className="text-xs bg-muted px-1.5 py-0.5 rounded-sm font-mono">TRANSITION_EXPAND</code>
            </li>
            <li className="flex gap-2">
              <span className="text-accent shrink-0">•</span>
              Duration: <code className="text-xs bg-muted px-1.5 py-0.5 rounded-sm font-mono">DURATION.slow</code> (0.4s)
            </li>
            <li className="flex gap-2">
              <span className="text-accent shrink-0">•</span>
              Easing: <code className="text-xs bg-muted px-1.5 py-0.5 rounded-sm font-mono">EASING.standard</code>
            </li>
          </ul>
        </div>

        <div className="text-xs font-mono text-muted-foreground p-3 rounded-sm bg-muted/50">
          src/components/ExpandCollapse.tsx
        </div>
      </div>
    </Shell>
  );
}
