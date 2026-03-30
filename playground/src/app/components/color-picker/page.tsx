"use client";

import { useState } from "react";
import { Shell } from "@/components/shell";
import { SectionHeading } from "@/components/token-grid";
import { ComponentPreview, PropsTable } from "@/components/component-preview";
import { cn } from "@/lib/utils";

function DemoColorPicker({
  label,
  value,
  onChange,
  disabled = false,
  className,
}: {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      {label && (
        <label className="text-sm font-medium text-foreground">{label}</label>
      )}
      <div
        className={cn(
          "inline-flex items-center gap-2 h-10 px-2 border border-border rounded-sm bg-background transition-colors",
          disabled && "opacity-50 pointer-events-none cursor-not-allowed",
          !disabled && "hover:border-foreground/30"
        )}
      >
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className="w-7 h-7 rounded-sm border border-border cursor-pointer bg-transparent [&::-webkit-color-swatch-wrapper]:p-0 [&::-webkit-color-swatch]:rounded-sm [&::-webkit-color-swatch]:border-none"
        />
        <input
          type="text"
          value={value}
          onChange={(e) => {
            const v = e.target.value;
            if (/^#[0-9a-fA-F]{0,6}$/.test(v) || v === "#") onChange(v);
          }}
          disabled={disabled}
          className="w-20 bg-transparent text-sm font-mono text-foreground outline-none placeholder:text-muted-foreground"
          spellCheck={false}
        />
      </div>
    </div>
  );
}

const basicCode = `import { ColorPicker } from "@/components/ui/ColorPicker/ColorPicker";

<ColorPicker
  value="#6366f1"
  onChange={(color) => console.log(color)}
/>`;

const labelCode = `import { ColorPicker } from "@/components/ui/ColorPicker/ColorPicker";

<ColorPicker
  label="Brand color"
  value="#6366f1"
  onChange={(color) => console.log(color)}
/>`;

const disabledCode = `import { ColorPicker } from "@/components/ui/ColorPicker/ColorPicker";

<ColorPicker
  label="Locked color"
  value="#94a3b8"
  onChange={() => {}}
  disabled
/>`;

export default function ColorPickerPage() {
  const [basic, setBasic] = useState("#6366f1");
  const [labeled, setLabeled] = useState("#10b981");
  const [disabled] = useState("#94a3b8");

  return (
    <Shell title="Color Picker">
      <div className="max-w-5xl space-y-10">
        <SectionHeading
          title="Color Picker"
          description="Compact color selector combining a native color swatch with a hex text input. Useful for theme customization and token editing."
        />

        <ComponentPreview
          title="Basic"
          description="Minimal color picker with swatch and hex input synced together."
          code={basicCode}
        >
          <div className="flex items-center justify-center w-full">
            <DemoColorPicker value={basic} onChange={setBasic} />
          </div>
        </ComponentPreview>

        <ComponentPreview
          title="With label"
          description="A label above the control adds context for form use."
          code={labelCode}
        >
          <div className="flex items-center justify-center w-full">
            <DemoColorPicker
              label="Brand color"
              value={labeled}
              onChange={setLabeled}
            />
          </div>
        </ComponentPreview>

        <ComponentPreview
          title="Disabled"
          description="Disabled state reduces opacity and blocks pointer events."
          code={disabledCode}
        >
          <div className="flex items-center justify-center w-full">
            <DemoColorPicker
              label="Locked color"
              value={disabled}
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
                description: "Optional text label rendered above the control.",
              },
              {
                name: "value",
                type: "string",
                description: "Current hex color value (e.g. '#6366f1').",
              },
              {
                name: "onChange",
                type: "(value: string) => void",
                description: "Called with the new hex string on every change.",
              },
              {
                name: "disabled",
                type: "boolean",
                default: "false",
                description: "Disables both the swatch and text input.",
              },
              {
                name: "className",
                type: "string",
                description: "Additional classes for the wrapper element.",
              },
            ]}
          />
        </div>

        <div className="text-xs font-mono text-muted-foreground p-3 rounded-sm bg-muted/50">
          src/components/ui/ColorPicker/ColorPicker.tsx
        </div>
      </div>
    </Shell>
  );
}
