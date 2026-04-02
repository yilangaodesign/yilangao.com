"use client";

import { useState } from "react";
import { Shell } from "@/components/shell";
import { SectionHeading } from "@/components/token-grid";
import { ComponentPreview, PropsTable, SourcePath, SubsectionHeading} from "@/components/component-preview";
import { Button } from "@ds/Button";
import { MountEntrance } from "@ds/MountEntrance/MountEntrance";

function MountEntranceDemo() {
  const [key, setKey] = useState(0);

  return (
    <div className="flex flex-col items-center gap-6 w-full">
      <Button size="sm" emphasis="subtle" onClick={() => setKey((k) => k + 1)}>
        Replay Animation
      </Button>

      <div key={key} className="w-full max-w-sm text-center">
        <MountEntrance>
          <div className="p-6 rounded-sm border border-accent/30 bg-accent/10">
            <p className="text-sm font-medium">Hero Section</p>
            <p className="text-xs text-muted-foreground mt-1">Plays on mount — not scroll-triggered</p>
          </div>
        </MountEntrance>
      </div>
    </div>
  );
}

const code = `import { MountEntrance } from "@/components/ui/MountEntrance";

<MountEntrance>
  <div>Hero content — fades up on mount</div>
</MountEntrance>

<MountEntrance delay={0.2} y={30}>
  <div>Delayed entrance with larger offset</div>
</MountEntrance>`;

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
          description="Fades in and slides up immediately when the component mounts. Press Replay to remount. Respects prefers-reduced-motion."
          code={code}
        >
          <MountEntranceDemo />
        </ComponentPreview>

        <div>
          <SubsectionHeading>Props</SubsectionHeading>
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
          <SubsectionHeading>Motion Tokens Used</SubsectionHeading>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex gap-2">
              <span className="text-accent shrink-0">&bull;</span>
              Preset: <code className="text-xs bg-muted px-1.5 py-0.5 rounded-sm font-mono">TRANSITION_ENTER</code>
            </li>
            <li className="flex gap-2">
              <span className="text-accent shrink-0">&bull;</span>
              Duration: <code className="text-xs bg-muted px-1.5 py-0.5 rounded-sm font-mono">DURATION.slower</code> (0.6s)
            </li>
            <li className="flex gap-2">
              <span className="text-accent shrink-0">&bull;</span>
              Easing: <code className="text-xs bg-muted px-1.5 py-0.5 rounded-sm font-mono">EASING.entrance</code>
            </li>
          </ul>
        </div>

        <div>
          <SubsectionHeading>vs FadeIn</SubsectionHeading>
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

        <SourcePath path="src/components/MountEntrance.tsx" />
      </div>
    </Shell>
  );
}
