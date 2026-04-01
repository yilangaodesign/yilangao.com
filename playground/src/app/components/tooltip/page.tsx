"use client";

import { Shell } from "@/components/shell";
import { SectionHeading } from "@/components/token-grid";
import { ComponentPreview, PropsTable, SourcePath, SubsectionHeading} from "@/components/component-preview";
import { Tooltip } from "@ds/Tooltip";
import { Button } from "@ds/Button";

const basicCode = `<Tooltip content="Save your progress" side="top">
  <Button appearance="neutral" emphasis="regular">Hover me</Button>
</Tooltip>`;

const positionsCode = `<Tooltip content="Top" side="top">...</Tooltip>
<Tooltip content="Bottom" side="bottom">...</Tooltip>
<Tooltip content="Left" side="left">...</Tooltip>
<Tooltip content="Right" side="right">...</Tooltip>`;

const delayCode = `<Tooltip content="Instant" delayDuration={0}>...</Tooltip>
<Tooltip content="300ms" delayDuration={300}>...</Tooltip>
<Tooltip content="800ms" delayDuration={800}>...</Tooltip>`;

export default function TooltipPage() {
  return (
    <Shell title="Tooltip">
      <div className="max-w-5xl space-y-10">
        <SectionHeading
          title="Tooltip"
          description="Hover-triggered informational popover with directional arrow. Supports configurable delay and placement."
        />

        <ComponentPreview
          title="Basic"
          description="Hover over the button to reveal a tooltip above the trigger."
          code={basicCode}
        >
          <Tooltip content="Save your progress" side="top">
            <Button appearance="neutral" emphasis="regular">Hover me</Button>
          </Tooltip>
        </ComponentPreview>

        <ComponentPreview
          title="Positions"
          description="Tooltip placement on all four sides of the trigger."
          code={positionsCode}
        >
          <div className="flex flex-wrap items-center gap-6">
            <Tooltip content="Top tooltip" side="top">
              <Button appearance="neutral" emphasis="regular">Top</Button>
            </Tooltip>
            <Tooltip content="Bottom tooltip" side="bottom">
              <Button appearance="neutral" emphasis="regular">Bottom</Button>
            </Tooltip>
            <Tooltip content="Left tooltip" side="left">
              <Button appearance="neutral" emphasis="regular">Left</Button>
            </Tooltip>
            <Tooltip content="Right tooltip" side="right">
              <Button appearance="neutral" emphasis="regular">Right</Button>
            </Tooltip>
          </div>
        </ComponentPreview>

        <ComponentPreview
          title="With delay"
          description="Custom delay durations before the tooltip appears."
          code={delayCode}
        >
          <div className="flex flex-wrap items-center gap-6">
            <Tooltip content="Instant" side="top" delayDuration={0}>
              <Button appearance="neutral" emphasis="regular">0ms</Button>
            </Tooltip>
            <Tooltip content="Default delay" side="top" delayDuration={300}>
              <Button appearance="neutral" emphasis="regular">300ms</Button>
            </Tooltip>
            <Tooltip content="Slow reveal" side="top" delayDuration={800}>
              <Button appearance="neutral" emphasis="regular">800ms</Button>
            </Tooltip>
          </div>
        </ComponentPreview>

        <div>
          <SubsectionHeading>Props</SubsectionHeading>
          <PropsTable
            props={[
              {
                name: "content",
                type: "ReactNode",
                description: "Text or element displayed inside the tooltip.",
              },
              {
                name: "children",
                type: "ReactNode",
                description: "The trigger element that activates the tooltip on hover.",
              },
              {
                name: "side",
                type: '"top" | "bottom" | "left" | "right"',
                default: '"top"',
                description: "Which side of the trigger the tooltip appears on.",
              },
              {
                name: "align",
                type: '"start" | "center" | "end"',
                default: '"center"',
                description: "Alignment along the side axis.",
              },
              {
                name: "delayDuration",
                type: "number",
                default: "300",
                description: "Delay in milliseconds before tooltip appears.",
              },
            ]}
          />
        </div>

        <SourcePath path="src/components/ui/Tooltip" />
      </div>
    </Shell>
  );
}
