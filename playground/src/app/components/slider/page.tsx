"use client";

import { useState } from "react";
import { Shell } from "@/components/shell";
import { SectionHeading } from "@/components/token-grid";
import { ComponentPreview, PropsTable } from "@/components/component-preview";
import { cn } from "@/lib/utils";

function DemoSlider({
  label,
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  showValue = false,
  suffix = "",
  disabled = false,
  className,
}: {
  label?: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  showValue?: boolean;
  suffix?: string;
  disabled?: boolean;
  className?: string;
}) {
  const pct = ((value - min) / (max - min)) * 100;
  const trackH = "h-1";
  const thumbSize =
    "[&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:w-3.5";

  return (
    <div className={cn("flex flex-col gap-1.5 w-full", className)}>
      {(label || showValue) && (
        <div className="flex items-baseline justify-between gap-2">
          {label && (
            <label className="text-sm font-medium text-foreground">
              {label}
            </label>
          )}
          {showValue && (
            <span className="text-xs font-mono text-muted-foreground tabular-nums">
              {value}
              {suffix}
            </span>
          )}
        </div>
      )}
      <div className={cn("relative w-full", disabled && "opacity-50")}>
        <div
          className={cn(
            "absolute inset-y-0 my-auto rounded-full bg-muted w-full",
            trackH
          )}
        />
        <div
          className={cn(
            "absolute inset-y-0 my-auto rounded-full bg-accent",
            trackH
          )}
          style={{ width: `${pct}%` }}
        />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          disabled={disabled}
          className={cn(
            "relative w-full appearance-none bg-transparent cursor-pointer",
            "[&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-foreground [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-background [&::-webkit-slider-thumb]:shadow-sm [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:hover:scale-110",
            thumbSize,
            disabled && "pointer-events-none cursor-not-allowed"
          )}
        />
      </div>
    </div>
  );
}

const basicCode = `import { Slider } from "@/components/ui/Slider/Slider";

<Slider value={50} onChange={(v) => setValue(v)} />`;

const labelValueCode = `import { Slider } from "@/components/ui/Slider/Slider";

<Slider
  label="Volume"
  value={72}
  showValue
  suffix="%"
  onChange={(v) => setValue(v)}
/>`;

const disabledCode = `import { Slider } from "@/components/ui/Slider/Slider";

<Slider label="Locked" value={35} showValue disabled />`;

export default function SliderPage() {
  const [basic, setBasic] = useState(50);
  const [volume, setVolume] = useState(72);

  return (
    <Shell title="Slider">
      <div className="max-w-5xl space-y-10">
        <SectionHeading
          title="Slider"
          description="Range input for selecting a numeric value within a bounded interval. Renders a styled track, filled region, and draggable thumb."
        />

        <ComponentPreview
          title="Basic"
          description="Minimal slider with no label — drag or click to set a value."
          code={basicCode}
        >
          <div className="w-full max-w-md">
            <DemoSlider value={basic} onChange={setBasic} />
          </div>
        </ComponentPreview>

        <ComponentPreview
          title="Label and value display"
          description="Shows a label on the left and the current value with an optional suffix on the right."
          code={labelValueCode}
        >
          <div className="w-full max-w-md">
            <DemoSlider
              label="Volume"
              value={volume}
              onChange={setVolume}
              showValue
              suffix="%"
            />
          </div>
        </ComponentPreview>

        <ComponentPreview
          title="Disabled"
          description="Disabled sliders reduce opacity and block interaction."
          code={disabledCode}
        >
          <div className="w-full max-w-md">
            <DemoSlider label="Locked" value={35} onChange={() => {}} showValue disabled />
          </div>
        </ComponentPreview>

        <div>
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-3">
            Props
          </h3>
          <PropsTable
            props={[
              {
                name: "label",
                type: "string",
                description: "Optional text label above the slider track.",
              },
              {
                name: "value",
                type: "number",
                description: "Current value of the slider.",
              },
              {
                name: "onChange",
                type: "(value: number) => void",
                description: "Called with the new numeric value on input.",
              },
              {
                name: "min",
                type: "number",
                default: "0",
                description: "Minimum bound of the range.",
              },
              {
                name: "max",
                type: "number",
                default: "100",
                description: "Maximum bound of the range.",
              },
              {
                name: "step",
                type: "number",
                default: "1",
                description: "Step increment between values.",
              },
              {
                name: "showValue",
                type: "boolean",
                default: "false",
                description:
                  "Display the current numeric value beside the label.",
              },
              {
                name: "suffix",
                type: "string",
                default: '""',
                description:
                  'Unit suffix appended to the displayed value (e.g. "%", "px").',
              },
              {
                name: "disabled",
                type: "boolean",
                default: "false",
                description: "Disables the slider and reduces opacity.",
              },
            ]}
          />
        </div>

        <div className="text-xs font-mono text-muted-foreground p-3 rounded-sm bg-muted/50">
          src/components/ui/Slider/Slider.tsx
        </div>
      </div>
    </Shell>
  );
}
