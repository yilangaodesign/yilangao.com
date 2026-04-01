"use client";

import { Shell } from "@/components/shell";
import { SectionHeading } from "@/components/token-grid";
import { ComponentPreview, PropsTable, SourcePath, SubsectionHeading} from "@/components/component-preview";
import { Marquee } from "@ds/Marquee/Marquee";

const ITEMS = ["Token", "Mixin", "Component", "Pattern", "Recipe", "Layout", "Interaction", "Motion"];

const code = `import { Marquee } from "@/components/Marquee";

<Marquee duration={20} pauseOnHover>
  {items.map((item) => (
    <span key={item} className="...">{item}</span>
  ))}
</Marquee>`;

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
          <div className="w-full">
            <Marquee duration={20} pauseOnHover>
              {ITEMS.map((item) => (
                <span
                  key={item}
                  className="flex-shrink-0 flex items-center justify-center min-w-[100px] h-8 px-4 mr-6 bg-muted rounded-sm text-xs font-mono text-muted-foreground whitespace-nowrap"
                >
                  {item}
                </span>
              ))}
            </Marquee>
            <p className="text-xs text-muted-foreground mt-3 text-center">Hover to pause</p>
          </div>
        </ComponentPreview>

        <div>
          <SubsectionHeading>Props</SubsectionHeading>
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
          <SubsectionHeading>Implementation</SubsectionHeading>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex gap-2">
              <span className="text-accent shrink-0">&bull;</span>
              CSS-only: uses <code className="text-xs bg-muted px-1.5 py-0.5 rounded-sm font-mono">@keyframes</code> + <code className="text-xs bg-muted px-1.5 py-0.5 rounded-sm font-mono">translateX(-33.333%)</code> for seamless loop
            </li>
            <li className="flex gap-2">
              <span className="text-accent shrink-0">&bull;</span>
              Edge fade: <code className="text-xs bg-muted px-1.5 py-0.5 rounded-sm font-mono">mask-image</code> gradient
            </li>
            <li className="flex gap-2">
              <span className="text-accent shrink-0">&bull;</span>
              Accessibility: pauses when <code className="text-xs bg-muted px-1.5 py-0.5 rounded-sm font-mono">prefers-reduced-motion: reduce</code> is active
            </li>
          </ul>
        </div>

        <SourcePath path="src/components/Marquee.tsx · src/components/Marquee.module.scss" />
      </div>
    </Shell>
  );
}
