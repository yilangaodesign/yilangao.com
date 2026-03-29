"use client";

import { useState } from "react";
import { Shell } from "@/components/shell";
import { SectionHeading } from "@/components/token-grid";
import { ComponentPreview, PropsTable } from "@/components/component-preview";

function FadeInDemo() {
  const [key, setKey] = useState(0);

  return (
    <div className="flex flex-col items-center gap-6 w-full">
      <button
        onClick={() => setKey((k) => k + 1)}
        className="px-4 py-2 text-sm font-medium rounded-sm bg-muted hover:bg-muted/80 transition-colors"
      >
        Replay Animation
      </button>

      <div className="grid grid-cols-3 gap-4 w-full max-w-md" key={key}>
        {[0, 0.1, 0.2].map((delay, i) => (
          <div
            key={i}
            className="h-24 rounded-sm bg-accent/20 border border-accent/30 flex items-center justify-center text-sm font-mono text-accent"
            style={{
              animation: `fadeInUp 0.6s cubic-bezier(0.2, 0, 0.38, 0.9) ${delay}s both`,
            }}
          >
            delay={delay}
          </div>
        ))}
      </div>

      <style>{`
        @keyframes fadeInUp {
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

function StaggerDemo() {
  const [key, setKey] = useState(0);

  return (
    <div className="flex flex-col items-center gap-6 w-full">
      <button
        onClick={() => setKey((k) => k + 1)}
        className="px-4 py-2 text-sm font-medium rounded-sm bg-muted hover:bg-muted/80 transition-colors"
      >
        Replay Stagger
      </button>

      <div className="grid grid-cols-4 gap-3 w-full max-w-lg" key={key}>
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="h-16 rounded-sm bg-accent/15 border border-accent/20"
            style={{
              animation: `fadeInUp 0.5s cubic-bezier(0.2, 0, 0.38, 0.9) ${i * 0.08}s both`,
            }}
          />
        ))}
      </div>
    </div>
  );
}

const fadeInCode = `"use client";

import { useRef } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import {
  TRANSITION_ENTER,
  ENTRANCE_Y,
  getReducedTransition,
} from "@/lib/motion";

export function FadeIn({
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
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.1 });
  const prefersReduced = useReducedMotion();

  const transition = prefersReduced
    ? getReducedTransition(TRANSITION_ENTER)
    : { ...TRANSITION_ENTER, delay };

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, y: prefersReduced ? 0 : y }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={transition}
    >
      {children}
    </motion.div>
  );
}`;

const staggerCode = `"use client";

import { useRef } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import {
  STAGGER_INTERVAL,
  TRANSITION_STAGGER_ITEM,
  ENTRANCE_Y,
  getReducedTransition,
} from "@/lib/motion";

export function StaggerChildren({
  children,
  className,
  stagger = STAGGER_INTERVAL,
}: {
  children: React.ReactNode;
  className?: string;
  stagger?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.05 });
  const prefersReduced = useReducedMotion();
  return (
    <motion.div
      ref={ref}
      className={className}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={{
        hidden: {},
        visible: {
          transition: { staggerChildren: prefersReduced ? 0 : stagger },
        },
      }}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const prefersReduced = useReducedMotion();
  const transition = prefersReduced
    ? getReducedTransition(TRANSITION_STAGGER_ITEM)
    : TRANSITION_STAGGER_ITEM;

  return (
    <motion.div
      className={className}
      variants={{
        hidden: { opacity: 0, y: prefersReduced ? 0 : ENTRANCE_Y },
        visible: { opacity: 1, y: 0, transition },
      }}
    >
      {children}
    </motion.div>
  );
}`;

export default function FadeInPage() {
  return (
    <Shell title="FadeIn">
      <div className="max-w-5xl space-y-10">
        <SectionHeading
          title="FadeIn & Stagger"
          description="Scroll-triggered animation primitives using Framer Motion. FadeIn reveals on viewport entry; StaggerChildren orchestrates sequential reveals for lists and grids."
        />

        <ComponentPreview
          title="FadeIn"
          description="Fades in and slides up when the element enters the viewport. Configurable delay and distance."
          code={fadeInCode}
        >
          <FadeInDemo />
        </ComponentPreview>

        <div>
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-3">
            FadeIn Props
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

        <ComponentPreview
          title="StaggerChildren + StaggerItem"
          description="Wraps children to reveal them one at a time with a configurable stagger interval."
          code={staggerCode}
        >
          <StaggerDemo />
        </ComponentPreview>

        <div>
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-3">
            StaggerChildren Props
          </h3>
          <PropsTable
            props={[
              { name: "children", type: "ReactNode", description: "StaggerItem children to orchestrate" },
              { name: "className", type: "string", description: "Additional CSS classes" },
              { name: "stagger", type: "number", default: "0.08", description: "Delay between each child reveal (seconds)" },
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
              Preset: <code className="text-xs bg-muted px-1.5 py-0.5 rounded-sm font-mono">TRANSITION_ENTER</code> (FadeIn) / <code className="text-xs bg-muted px-1.5 py-0.5 rounded-sm font-mono">TRANSITION_STAGGER_ITEM</code> (StaggerItem)
            </li>
            <li className="flex gap-2">
              <span className="text-accent shrink-0">•</span>
              Easing: <code className="text-xs bg-muted px-1.5 py-0.5 rounded-sm font-mono">EASING.entrance</code> — maps to <code className="text-xs bg-muted px-1.5 py-0.5 rounded-sm font-mono">$portfolio-easing-entrance</code>
            </li>
            <li className="flex gap-2">
              <span className="text-accent shrink-0">•</span>
              Duration: <code className="text-xs bg-muted px-1.5 py-0.5 rounded-sm font-mono">DURATION.slower</code> (0.6s) / <code className="text-xs bg-muted px-1.5 py-0.5 rounded-sm font-mono">DURATION.slow</code> (0.4s)
            </li>
            <li className="flex gap-2">
              <span className="text-accent shrink-0">•</span>
              Respects <code className="text-xs bg-muted px-1.5 py-0.5 rounded-sm font-mono">prefers-reduced-motion</code> via <code className="text-xs bg-muted px-1.5 py-0.5 rounded-sm font-mono">useReducedMotion()</code>
            </li>
          </ul>
        </div>

        <div className="text-xs font-mono text-muted-foreground p-3 rounded-sm bg-muted/50">
          src/components/FadeIn.tsx, src/components/StaggerChildren.tsx
        </div>
      </div>
    </Shell>
  );
}
