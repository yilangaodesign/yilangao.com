"use client";

import { useState } from "react";
import { Shell } from "@/components/shell";
import { SectionHeading } from "@/components/token-grid";
import { ComponentPreview, PropsTable } from "@/components/component-preview";

function MountEntranceDemo() {
  const [key, setKey] = useState(0);

  return (
    <div className="flex flex-col items-center gap-6 w-full">
      <button
        onClick={() => setKey((k) => k + 1)}
        className="px-4 py-2 text-sm font-medium rounded-sm bg-muted hover:bg-muted/80 transition-colors"
      >
        Replay Animation
      </button>

      <div key={key} className="w-full max-w-sm text-center">
        <div
          className="p-6 rounded-sm border border-accent/30 bg-accent/10"
          style={{
            animation: "mountFadeUp 0.6s cubic-bezier(0, 0, 0.38, 0.9) both",
          }}
        >
          <p className="text-sm font-medium">Hero Section</p>
          <p className="text-xs text-muted-foreground mt-1">Plays on mount — not scroll-triggered</p>
        </div>
      </div>

      <style>{`
        @keyframes mountFadeUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}

const code = `"use client";

import { motion, useReducedMotion } from "framer-motion";
import {
  TRANSITION_ENTER,
  ENTRANCE_Y,
  getReducedTransition,
} from "@/lib/motion";

export function MountEntrance({
  children,
  className,
  delay = 0,
  y = ENTRANCE_Y,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  y?: number;
}) {
  const prefersReduced = useReducedMotion();
  const transition = prefersReduced
    ? getReducedTransition(TRANSITION_ENTER)
    : { ...TRANSITION_ENTER, delay };

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: prefersReduced ? 0 : y }}
      animate={{ opacity: 1, y: 0 }}
      transition={transition}
    >
      {children}
    </motion.div>
  );
}`;

export default function MountEntrancePage() {
  return (
    <Shell title="MountEntrance">
      <div className="max-w-5xl space-y-10">
        <SectionHeading
          title="MountEntrance"
          description="Page-load entrance animation (non-scroll-triggered). Unlike FadeIn (which waits for scroll into view), MountEntrance plays immediately on mount — for hero sections and above-the-fold content."
        />

        <ComponentPreview
          title="MountEntrance"
          description="Fades in and slides up immediately when the component mounts. Respects prefers-reduced-motion."
          code={code}
        >
          <MountEntranceDemo />
        </ComponentPreview>

        <div>
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-3">
            Props
          </h3>
          <PropsTable
            props={[
              { name: "children", type: "ReactNode", description: "Content to reveal" },
              { name: "className", type: "string", description: "Additional CSS classes" },
              { name: "delay", type: "number", default: "0", description: "Animation delay in seconds" },
              { name: "y", type: "number", default: "20", description: "Starting vertical offset in pixels" },
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
              Easing: <code className="text-xs bg-muted px-1.5 py-0.5 rounded-sm font-mono">EASING.entrance</code> — maps to <code className="text-xs bg-muted px-1.5 py-0.5 rounded-sm font-mono">$portfolio-easing-entrance</code>
            </li>
            <li className="flex gap-2">
              <span className="text-accent shrink-0">•</span>
              Duration: <code className="text-xs bg-muted px-1.5 py-0.5 rounded-sm font-mono">DURATION.slower</code> (0.6s) — <code className="text-xs bg-muted px-1.5 py-0.5 rounded-sm font-mono">$portfolio-duration-slower</code>
            </li>
            <li className="flex gap-2">
              <span className="text-accent shrink-0">•</span>
              Preset: <code className="text-xs bg-muted px-1.5 py-0.5 rounded-sm font-mono">TRANSITION_ENTER</code>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-3">
            vs FadeIn
          </h3>
          <div className="rounded-sm border border-border overflow-x-auto">
            <table className="w-full text-sm min-w-[400px]">
              <thead>
                <tr className="bg-muted/50 border-b border-border">
                  <th className="px-4 py-2.5 text-left font-medium text-muted-foreground"></th>
                  <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">MountEntrance</th>
                  <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">FadeIn</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-border">
                  <td className="px-4 py-2.5 font-medium">Trigger</td>
                  <td className="px-4 py-2.5 text-muted-foreground">Component mount</td>
                  <td className="px-4 py-2.5 text-muted-foreground">Scroll into viewport</td>
                </tr>
                <tr className="border-b border-border">
                  <td className="px-4 py-2.5 font-medium">Best for</td>
                  <td className="px-4 py-2.5 text-muted-foreground">Hero, above-the-fold</td>
                  <td className="px-4 py-2.5 text-muted-foreground">Below-the-fold sections</td>
                </tr>
                <tr>
                  <td className="px-4 py-2.5 font-medium">useInView</td>
                  <td className="px-4 py-2.5 text-muted-foreground">No</td>
                  <td className="px-4 py-2.5 text-muted-foreground">Yes (once, amount: 0.1)</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="text-xs font-mono text-muted-foreground p-3 rounded-sm bg-muted/50">
          src/components/MountEntrance.tsx
        </div>
      </div>
    </Shell>
  );
}
