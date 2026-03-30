"use client";

import { useState, useRef, useCallback } from "react";
import { Shell } from "@/components/shell";
import { SectionHeading } from "@/components/token-grid";
import { ComponentPreview, PropsTable } from "@/components/component-preview";
import { cn } from "@/lib/utils";
import { Minus, Plus } from "lucide-react";

function DemoScrubInput({
  label,
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  suffix,
  disabled = false,
  className,
}: {
  label?: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  suffix?: string;
  disabled?: boolean;
  className?: string;
}) {
  const scrubRef = useRef<HTMLDivElement>(null);
  const startX = useRef(0);
  const startVal = useRef(0);

  const clamp = useCallback(
    (v: number) => Math.min(max, Math.max(min, Math.round(v / step) * step)),
    [min, max, step]
  );

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (disabled) return;
      e.preventDefault();
      startX.current = e.clientX;
      startVal.current = value;
      const el = scrubRef.current;
      if (!el) return;

      const onMove = (ev: PointerEvent) => {
        const delta = ev.clientX - startX.current;
        const sensitivity = step < 1 ? 0.5 : 1;
        onChange(clamp(startVal.current + delta * sensitivity * step));
      };
      const onUp = () => {
        document.removeEventListener("pointermove", onMove);
        document.removeEventListener("pointerup", onUp);
      };
      document.addEventListener("pointermove", onMove);
      document.addEventListener("pointerup", onUp);
    },
    [disabled, value, step, clamp, onChange]
  );

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      {label && (
        <label className="text-sm font-medium text-foreground">{label}</label>
      )}
      <div
        className={cn(
          "inline-flex items-center h-10 border border-border rounded-sm bg-background overflow-hidden transition-colors",
          disabled && "opacity-50 pointer-events-none cursor-not-allowed",
          !disabled && "hover:border-foreground/30"
        )}
      >
        <button
          type="button"
          onClick={() => onChange(clamp(value - step))}
          disabled={disabled}
          className="flex items-center justify-center w-8 h-full border-r border-border text-muted-foreground hover:bg-muted hover:text-foreground transition-colors disabled:pointer-events-none"
          aria-label="Decrease"
        >
          <Minus className="w-3.5 h-3.5" />
        </button>

        <div
          ref={scrubRef}
          onPointerDown={handlePointerDown}
          className={cn(
            "flex items-center justify-center gap-1 px-3 select-none min-w-[4rem] h-full",
            !disabled && "cursor-ew-resize"
          )}
        >
          <span className="text-sm font-mono tabular-nums text-foreground">
            {value}
          </span>
          {suffix && (
            <span className="text-xs font-mono text-muted-foreground">
              {suffix}
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={() => onChange(clamp(value + step))}
          disabled={disabled}
          className="flex items-center justify-center w-8 h-full border-l border-border text-muted-foreground hover:bg-muted hover:text-foreground transition-colors disabled:pointer-events-none"
          aria-label="Increase"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

const basicCode = `import { ScrubInput } from "@/components/ui/ScrubInput/ScrubInput";

<ScrubInput value={50} onChange={(v) => setValue(v)} />`;

const labelCode = `import { ScrubInput } from "@/components/ui/ScrubInput/ScrubInput";

<ScrubInput
  label="Opacity"
  value={80}
  min={0}
  max={100}
  onChange={(v) => setValue(v)}
/>`;

const suffixCode = `import { ScrubInput } from "@/components/ui/ScrubInput/ScrubInput";

<ScrubInput
  label="Border radius"
  value={8}
  min={0}
  max={32}
  suffix="px"
  onChange={(v) => setValue(v)}
/>`;

const disabledCode = `import { ScrubInput } from "@/components/ui/ScrubInput/ScrubInput";

<ScrubInput label="Locked" value={24} suffix="px" disabled />`;

export default function ScrubInputPage() {
  const [basic, setBasic] = useState(50);
  const [opacity, setOpacity] = useState(80);
  const [radius, setRadius] = useState(8);

  return (
    <Shell title="Scrub Input">
      <div className="max-w-5xl space-y-10">
        <SectionHeading
          title="Scrub Input"
          description="Numeric input with drag-to-scrub interaction and stepper buttons. Drag horizontally on the value to scrub, or use the +/− buttons for precise increments."
        />

        <ComponentPreview
          title="Basic"
          description="Minimal scrub input — drag the value or click the stepper buttons."
          code={basicCode}
        >
          <div className="flex items-center justify-center w-full">
            <DemoScrubInput value={basic} onChange={setBasic} />
          </div>
        </ComponentPreview>

        <ComponentPreview
          title="With label"
          description="A label provides context above the control."
          code={labelCode}
        >
          <div className="flex items-center justify-center w-full">
            <DemoScrubInput
              label="Opacity"
              value={opacity}
              min={0}
              max={100}
              onChange={setOpacity}
            />
          </div>
        </ComponentPreview>

        <ComponentPreview
          title="With suffix"
          description="A suffix unit is displayed next to the value."
          code={suffixCode}
        >
          <div className="flex items-center justify-center w-full">
            <DemoScrubInput
              label="Border radius"
              value={radius}
              min={0}
              max={32}
              suffix="px"
              onChange={setRadius}
            />
          </div>
        </ComponentPreview>

        <ComponentPreview
          title="Disabled"
          description="Disabled state prevents scrubbing and stepper interaction."
          code={disabledCode}
        >
          <div className="flex items-center justify-center w-full">
            <DemoScrubInput
              label="Locked"
              value={24}
              suffix="px"
              onChange={() => {}}
              disabled
            />
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
                description: "Optional text label above the control.",
              },
              {
                name: "value",
                type: "number",
                description: "Current numeric value.",
              },
              {
                name: "onChange",
                type: "(value: number) => void",
                description: "Called with the new value on scrub or step.",
              },
              {
                name: "min",
                type: "number",
                default: "0",
                description: "Minimum allowed value.",
              },
              {
                name: "max",
                type: "number",
                default: "100",
                description: "Maximum allowed value.",
              },
              {
                name: "step",
                type: "number",
                default: "1",
                description: "Increment for each step or scrub pixel.",
              },
              {
                name: "suffix",
                type: "string",
                description:
                  'Unit suffix displayed after the value (e.g. "px", "%").',
              },
              {
                name: "disabled",
                type: "boolean",
                default: "false",
                description:
                  "Disables scrubbing, steppers, and reduces opacity.",
              },
            ]}
          />
        </div>

        <div className="text-xs font-mono text-muted-foreground p-3 rounded-sm bg-muted/50">
          src/components/ui/ScrubInput/ScrubInput.tsx
        </div>
      </div>
    </Shell>
  );
}
