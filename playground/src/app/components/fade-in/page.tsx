"use client";

import { useState } from "react";
import { Shell } from "@/components/shell";
import { SectionHeading } from "@/components/token-grid";
import { ComponentPreview, PropsTable, SourcePath, SubsectionHeading} from "@/components/component-preview";
import { Button } from "@ds/Button";
import { FadeIn } from "@ds/FadeIn/FadeIn";
import { StaggerChildren, StaggerItem } from "@ds/StaggerChildren/StaggerChildren";

function FadeInDemo() {
  const [key, setKey] = useState(0);

  return (
    <div className="flex flex-col items-center gap-6 w-full">
      <Button size="sm" emphasis="subtle" onClick={() => setKey((k) => k + 1)}>
        Replay Animation
      </Button>

      <div className="grid grid-cols-3 gap-4 w-full max-w-md" key={key}>
        {[0, 0.1, 0.2].map((delay, i) => (
          <FadeIn key={i} delay={delay}>
            <div className="h-24 rounded-sm bg-accent/20 border border-accent/30 flex items-center justify-center text-sm font-mono text-accent">
              delay={delay}
            </div>
          </FadeIn>
        ))}
      </div>
    </div>
  );
}

function StaggerDemo() {
  const [key, setKey] = useState(0);

  return (
    <div className="flex flex-col items-center gap-6 w-full">
      <Button size="sm" emphasis="subtle" onClick={() => setKey((k) => k + 1)}>
        Replay Stagger
      </Button>

      <StaggerChildren key={key} className="grid grid-cols-4 gap-3 w-full max-w-lg">
        {Array.from({ length: 8 }).map((_, i) => (
          <StaggerItem key={i}>
            <div className="h-16 rounded-sm bg-accent/15 border border-accent/20" />
          </StaggerItem>
        ))}
      </StaggerChildren>
    </div>
  );
}

const fadeInCode = `import { FadeIn } from "@/components/FadeIn";

<FadeIn>
  <div>Fades in on scroll</div>
</FadeIn>

<FadeIn delay={0.2} y={30}>
  <div>Delayed with larger offset</div>
</FadeIn>`;

const staggerCode = `import { StaggerChildren, StaggerItem } from "@/components/StaggerChildren";

<StaggerChildren className="grid grid-cols-4 gap-3">
  {items.map((item) => (
    <StaggerItem key={item.id}>
      <Card>{item.name}</Card>
    </StaggerItem>
  ))}
</StaggerChildren>`;

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
          description="Fades in and slides up when the element enters the viewport. Configurable delay and distance. Press Replay to remount."
          code={fadeInCode}
        >
          <FadeInDemo />
        </ComponentPreview>

        <div>
          <SubsectionHeading>FadeIn Props</SubsectionHeading>
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
          <SubsectionHeading>StaggerChildren Props</SubsectionHeading>
          <PropsTable
            props={[
              { name: "children", type: "ReactNode", description: "StaggerItem children to orchestrate" },
              { name: "className", type: "string", description: "Additional CSS classes" },
              { name: "stagger", type: "number", default: "0.08", description: "Delay between each child reveal (seconds)" },
            ]}
          />
        </div>

        <div>
          <SubsectionHeading>Motion Tokens Used</SubsectionHeading>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex gap-2">
              <span className="text-accent shrink-0">&bull;</span>
              Preset: <code className="text-xs bg-muted px-1.5 py-0.5 rounded-sm font-mono">TRANSITION_ENTER</code> (FadeIn) / <code className="text-xs bg-muted px-1.5 py-0.5 rounded-sm font-mono">TRANSITION_STAGGER_ITEM</code> (StaggerItem)
            </li>
            <li className="flex gap-2">
              <span className="text-accent shrink-0">&bull;</span>
              Respects <code className="text-xs bg-muted px-1.5 py-0.5 rounded-sm font-mono">prefers-reduced-motion</code> via <code className="text-xs bg-muted px-1.5 py-0.5 rounded-sm font-mono">useReducedMotion()</code>
            </li>
          </ul>
        </div>

        <SourcePath path="src/components/FadeIn.tsx · src/components/StaggerChildren.tsx" />
      </div>
    </Shell>
  );
}
