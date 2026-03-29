"use client";

import { Shell } from "@/components/shell";
import { SectionHeading } from "@/components/token-grid";
import { ComponentPreview, PropsTable } from "@/components/component-preview";

const ITEMS = ["Token", "Mixin", "Component", "Pattern", "Recipe", "Layout", "Interaction", "Motion"];

function MarqueeDemo() {
  const tripled = [...ITEMS, ...ITEMS, ...ITEMS];

  return (
    <div className="w-full">
      <div
        className="overflow-hidden"
        style={{
          maskImage: "linear-gradient(to right, transparent 0%, black 6%, black 94%, transparent 100%)",
          WebkitMaskImage: "linear-gradient(to right, transparent 0%, black 6%, black 94%, transparent 100%)",
        }}
      >
        <div
          className="flex w-max"
          style={{ animation: "marqueeSlide 20s linear infinite" }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.animationPlayState = "paused"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.animationPlayState = "running"; }}
        >
          {tripled.map((item, i) => (
            <span
              key={`${item}-${i}`}
              className="flex-shrink-0 flex items-center justify-center min-w-[100px] h-8 px-4 mr-6 bg-muted rounded-sm text-xs font-mono text-muted-foreground whitespace-nowrap"
            >
              {item}
            </span>
          ))}
        </div>
      </div>
      <p className="text-xs text-muted-foreground mt-3 text-center">Hover to pause</p>

      <style>{`
        @keyframes marqueeSlide {
          0% { transform: translateX(0); }
          100% { transform: translateX(-33.333%); }
        }
      `}</style>
    </div>
  );
}

const code = `"use client";

import { useRef, useEffect, useState } from "react";
import styles from "./Marquee.module.scss";

export function Marquee({
  children,
  className,
  duration = 25,
  pauseOnHover = true,
}: {
  children: React.ReactNode;
  className?: string;
  duration?: number;
  pauseOnHover?: boolean;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  return (
    <div className={\`\${styles.viewport} \${className ?? ""}\`}>
      <div
        ref={trackRef}
        className={styles.track}
        data-pause={pauseOnHover ? "" : undefined}
        style={{
          animationDuration: \`\${duration}s\`,
          animationPlayState: reducedMotion ? "paused" : undefined,
        }}
      >
        {children}
        {children}
        {children}
      </div>
    </div>
  );
}`;

export default function MarqueePage() {
  return (
    <Shell title="Marquee">
      <div className="max-w-5xl space-y-10">
        <SectionHeading
          title="Marquee"
          description="Infinite horizontal marquee with pause-on-hover and edge-fade masks. Pure CSS animation — no Framer Motion dependency. Children tripled internally for seamless loop."
        />

        <ComponentPreview
          title="Marquee"
          description="CSS @keyframes infinite scroll with edge-gradient masks. Pauses on hover. Respects prefers-reduced-motion."
          code={code}
        >
          <MarqueeDemo />
        </ComponentPreview>

        <div>
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-3">
            Props
          </h3>
          <PropsTable
            props={[
              { name: "children", type: "ReactNode", description: "Content to scroll (automatically tripled)" },
              { name: "className", type: "string", description: "Additional CSS classes" },
              { name: "duration", type: "number", default: "25", description: "Duration in seconds for one full cycle" },
              { name: "pauseOnHover", type: "boolean", default: "true", description: "Pause animation on hover" },
            ]}
          />
        </div>

        <div>
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-3">
            Implementation
          </h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex gap-2">
              <span className="text-accent shrink-0">•</span>
              CSS-only: uses <code className="text-xs bg-muted px-1.5 py-0.5 rounded-sm font-mono">@keyframes</code> + <code className="text-xs bg-muted px-1.5 py-0.5 rounded-sm font-mono">translateX(-33.333%)</code> for seamless loop
            </li>
            <li className="flex gap-2">
              <span className="text-accent shrink-0">•</span>
              Edge fade: <code className="text-xs bg-muted px-1.5 py-0.5 rounded-sm font-mono">mask-image</code> gradient (transparent → black → transparent)
            </li>
            <li className="flex gap-2">
              <span className="text-accent shrink-0">•</span>
              Pause: <code className="text-xs bg-muted px-1.5 py-0.5 rounded-sm font-mono">animation-play-state: paused</code> on hover via data attribute
            </li>
            <li className="flex gap-2">
              <span className="text-accent shrink-0">•</span>
              Accessibility: pauses when <code className="text-xs bg-muted px-1.5 py-0.5 rounded-sm font-mono">prefers-reduced-motion: reduce</code> is active
            </li>
          </ul>
        </div>

        <div className="text-xs font-mono text-muted-foreground p-3 rounded-sm bg-muted/50">
          src/components/Marquee.tsx, src/components/Marquee.module.scss
        </div>
      </div>
    </Shell>
  );
}
