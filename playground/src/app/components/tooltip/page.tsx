"use client";

import { Shell } from "@/components/shell";
import { SectionHeading } from "@/components/token-grid";
import {
  ComponentPreview,
  PropsTable,
  SourcePath,
  SubsectionHeading,
} from "@/components/component-preview";
import { Tooltip, InfoTooltip } from "@ds/Tooltip";
import { Button } from "@ds/Button";
import { TextRow } from "@ds/TextRow";

const basicCode = `<Tooltip content="Save your progress">
  <Button appearance="neutral" emphasis="regular">Hover me</Button>
</Tooltip>`;

const appearanceCode = `<Tooltip content="Dark on light" appearance="inverse">...</Tooltip>
<Tooltip content="Soft neutral" appearance="neutral">...</Tooltip>
<Tooltip content="AI-powered insight" appearance="brand">...</Tooltip>`;

const sizesCode = `<Tooltip content="Label" size="sm">...</Tooltip>
<Tooltip content="Short sentence here." size="md">...</Tooltip>
<Tooltip content="Longer explanation that wraps to multiple lines for detailed context." size="lg">...</Tooltip>`;

const collisionCode = `{/* Triggers at edges — Radix flips/shifts automatically */}
<Tooltip content="I flip to bottom if needed">
  <Button>Top edge</Button>
</Tooltip>`;

const caretCode = `<Tooltip content="With caret" caret>...</Tooltip>
<Tooltip content="No caret" caret={false}>...</Tooltip>
<Tooltip content="Centered caret" caret="center">...</Tooltip>`;

const infoTooltipCode = `<InfoTooltip content="Expires after 30 days." contextSize="sm" />
<InfoTooltip content="Standard info tooltip." contextSize="md" />
<InfoTooltip content="AI-generated summary based on your recent activity." contextSize="lg" appearance="brand" />`;

const overrideCode = `<Tooltip content="Always on the right" side="right">
  <Button>Right side</Button>
</Tooltip>
<Tooltip content="Always below" side="bottom">
  <Button>Bottom side</Button>
</Tooltip>`;

const delayCode = `<Tooltip content="Instant" delayDuration={0}>...</Tooltip>
<Tooltip content="Default (300ms)">...</Tooltip>
<Tooltip content="Slow reveal" delayDuration={800}>...</Tooltip>`;

export default function TooltipPage() {
  return (
    <Shell title="Tooltip">
      <div className="max-w-5xl space-y-10">
        <SectionHeading
          title="Tooltip"
          description="Hover-triggered informational overlay with directional caret. Uses Radix-native collision detection for smart positioning. Includes InfoTooltip helper for icon+tooltip composition."
        />

        {/* 1. Basic */}
        <ComponentPreview
          title="Basic"
          description="Default tooltip with no explicit placement props. Appears above, centered."
          code={basicCode}
        >
          <Tooltip content="Save your progress">
            <Button appearance="neutral" emphasis="regular">
              Hover me
            </Button>
          </Tooltip>
        </ComponentPreview>

        {/* 2. Appearance */}
        <ComponentPreview
          title="Appearance"
          description="Three appearance variants: inverse (default), neutral, and brand."
          code={appearanceCode}
        >
          <div className="flex flex-wrap items-center gap-6">
            <Tooltip content="Dark on light" appearance="inverse">
              <Button appearance="neutral" emphasis="regular">
                Inverse
              </Button>
            </Tooltip>
            <Tooltip content="Soft neutral" appearance="neutral">
              <Button appearance="neutral" emphasis="regular">
                Neutral
              </Button>
            </Tooltip>
            <Tooltip content="AI-powered insight" appearance="brand">
              <Button appearance="neutral" emphasis="regular">
                Brand
              </Button>
            </Tooltip>
          </div>
        </ComponentPreview>

        {/* 3. Sizes */}
        <ComponentPreview
          title="Sizes"
          description="Small (single label), medium (short sentence), large (multi-line)."
          code={sizesCode}
        >
          <div className="flex flex-wrap items-center gap-6">
            <Tooltip content="Label" size="sm">
              <Button appearance="neutral" emphasis="regular">
                Small
              </Button>
            </Tooltip>
            <Tooltip content="Short sentence here." size="md">
              <Button appearance="neutral" emphasis="regular">
                Medium
              </Button>
            </Tooltip>
            <Tooltip
              content="Longer explanation that wraps to multiple lines for detailed context."
              size="lg"
            >
              <Button appearance="neutral" emphasis="regular">
                Large
              </Button>
            </Tooltip>
          </div>
        </ComponentPreview>

        {/* 4. Collision Demo */}
        <ComponentPreview
          title="Collision handling"
          description="Triggers at viewport edges. Radix flips side and shifts alignment automatically. No manual placement props."
          code={collisionCode}
        >
          <div className="flex justify-between items-start w-full">
            <Tooltip content="Near the left edge — Radix shifts right">
              <Button appearance="neutral" emphasis="regular">
                Left edge
              </Button>
            </Tooltip>
            <Tooltip content="Centered — default positioning">
              <Button appearance="neutral" emphasis="regular">
                Center
              </Button>
            </Tooltip>
            <Tooltip content="Near the right edge — Radix shifts left">
              <Button appearance="neutral" emphasis="regular">
                Right edge
              </Button>
            </Tooltip>
          </div>
        </ComponentPreview>

        {/* 5. Caret Variants */}
        <ComponentPreview
          title="Caret variants"
          description="Caret visible (default), hidden, or forced to center."
          code={caretCode}
        >
          <div className="flex flex-wrap items-center gap-6">
            <Tooltip content="Default caret" caret>
              <Button appearance="neutral" emphasis="regular">
                Caret on
              </Button>
            </Tooltip>
            <Tooltip content="No caret shown" caret={false}>
              <Button appearance="neutral" emphasis="regular">
                Caret off
              </Button>
            </Tooltip>
            <Tooltip content="Caret forced to center" caret="center">
              <Button appearance="neutral" emphasis="regular">
                Caret center
              </Button>
            </Tooltip>
          </div>
        </ComponentPreview>

        {/* 6. InfoTooltip Composition */}
        <ComponentPreview
          title="InfoTooltip"
          description="Composed helper: icon + tooltip with auto-sizing from contextSize. Defaults to side=top, align=start (extends away from text)."
          code={infoTooltipCode}
        >
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <TextRow size="sm" emphasis="bold">
                API Key
              </TextRow>
              <InfoTooltip
                content="Expires after 30 days."
                contextSize="sm"
              />
            </div>
            <div className="flex items-center gap-2">
              <TextRow size="md" emphasis="bold">
                Webhook URL
              </TextRow>
              <InfoTooltip
                content="Standard info tooltip with medium context."
                contextSize="md"
              />
            </div>
            <div className="flex items-center gap-2">
              <TextRow size="lg" emphasis="bold">
                Smart Summary
              </TextRow>
              <InfoTooltip
                content="AI-generated summary based on your recent activity."
                contextSize="lg"
                appearance="brand"
              />
            </div>
          </div>
        </ComponentPreview>

        {/* 7. Manual Override */}
        <ComponentPreview
          title="Manual override"
          description="Explicit side and align for cases where the default doesn't fit the layout."
          code={overrideCode}
        >
          <div className="flex flex-wrap items-center gap-6">
            <Tooltip content="Always on the right" side="right">
              <Button appearance="neutral" emphasis="regular">
                Right side
              </Button>
            </Tooltip>
            <Tooltip content="Always below" side="bottom">
              <Button appearance="neutral" emphasis="regular">
                Bottom side
              </Button>
            </Tooltip>
            <Tooltip content="Left, aligned end" side="left" align="end">
              <Button appearance="neutral" emphasis="regular">
                Left / end
              </Button>
            </Tooltip>
          </div>
        </ComponentPreview>

        {/* 8. Delay */}
        <ComponentPreview
          title="Delay"
          description="Custom delay durations. Move between tooltips quickly to see skip-delay behavior."
          code={delayCode}
        >
          <div className="flex flex-wrap items-center gap-6">
            <Tooltip content="Instant" delayDuration={0}>
              <Button appearance="neutral" emphasis="regular">
                0ms
              </Button>
            </Tooltip>
            <Tooltip content="Default delay">
              <Button appearance="neutral" emphasis="regular">
                300ms
              </Button>
            </Tooltip>
            <Tooltip content="Slow reveal" delayDuration={800}>
              <Button appearance="neutral" emphasis="regular">
                800ms
              </Button>
            </Tooltip>
          </div>
        </ComponentPreview>

        {/* 9. Props Tables */}
        <div>
          <SubsectionHeading>Tooltip Props</SubsectionHeading>
          <PropsTable
            props={[
              {
                name: "content",
                type: "ReactNode",
                description:
                  "Text or element displayed inside the tooltip.",
              },
              {
                name: "children",
                type: "ReactNode",
                description:
                  "Trigger element that activates the tooltip on hover/focus.",
              },
              {
                name: "size",
                type: '"sm" | "md" | "lg"',
                default: '"md"',
                description:
                  "Controls max-width, padding, font size, and caret dimensions.",
              },
              {
                name: "appearance",
                type: '"inverse" | "neutral" | "brand"',
                default: '"inverse"',
                description:
                  "Visual style. Inverse for dark-on-light, neutral for soft, brand for AI features.",
              },
              {
                name: "caret",
                type: 'boolean | "center"',
                default: "true",
                description:
                  'Show/hide the triangular caret. "center" forces caret to center of tooltip.',
              },
              {
                name: "side",
                type: '"top" | "right" | "bottom" | "left"',
                default: '"top"',
                description:
                  "Preferred side. Radix flips automatically if no room.",
              },
              {
                name: "align",
                type: '"start" | "center" | "end"',
                default: '"center"',
                description:
                  "Alignment along the side axis. Radix shifts if it would overflow.",
              },
              {
                name: "delayDuration",
                type: "number",
                default: "300",
                description:
                  "Delay in ms before tooltip appears. Overrides the Provider default.",
              },
              {
                name: "collisionPadding",
                type: "number",
                default: "8",
                description:
                  "Safe margin from viewport edges (spacer-1x).",
              },
            ]}
          />
        </div>

        <div>
          <SubsectionHeading>InfoTooltip Props</SubsectionHeading>
          <PropsTable
            props={[
              {
                name: "content",
                type: "ReactNode",
                description: "Tooltip content text.",
              },
              {
                name: "contextSize",
                type: '"xs" | "sm" | "md" | "lg" | "xl"',
                default: '"md"',
                description:
                  "Text size the icon sits next to. Auto-derives icon size and tooltip size.",
              },
              {
                name: "icon",
                type: "ReactNode",
                description:
                  "Custom icon slot. Defaults to a circled info icon. Pass any ReactNode.",
              },
              {
                name: "size",
                type: '"sm" | "md" | "lg"',
                description:
                  "Override auto-derived tooltip size from contextSize.",
              },
              {
                name: "appearance",
                type: '"inverse" | "neutral" | "brand"',
                default: '"inverse"',
                description: "Tooltip appearance variant.",
              },
              {
                name: "side",
                type: '"top" | "right" | "bottom" | "left"',
                default: '"top"',
                description: "Preferred side (same as Tooltip).",
              },
              {
                name: "align",
                type: '"start" | "center" | "end"',
                default: '"start"',
                description:
                  'Defaults to "start" (extends away from text). Different from base Tooltip.',
              },
              {
                name: "delayDuration",
                type: "number",
                description: "Override Provider delay.",
              },
            ]}
          />
        </div>

        <SourcePath path="src/components/ui/Tooltip" />
      </div>
    </Shell>
  );
}
