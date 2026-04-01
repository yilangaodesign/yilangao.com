"use client";

import { useState } from "react";
import { Shell } from "@/components/shell";
import { SectionHeading } from "@/components/token-grid";
import { ComponentPreview, PropsTable, SourcePath, SubsectionHeading} from "@/components/component-preview";
import { ColorPicker } from "@ds/ColorPicker";

const basicCode = `import { ColorPicker } from "@ds/ColorPicker";

<ColorPicker
  value="#6366f1"
  onChange={(color) => console.log(color)}
/>`;

const labelCode = `import { ColorPicker } from "@ds/ColorPicker";

<ColorPicker
  label="Brand color"
  value="#6366f1"
  onChange={(color) => console.log(color)}
/>`;

const disabledCode = `import { ColorPicker } from "@ds/ColorPicker";

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
            <ColorPicker value={basic} onChange={setBasic} />
          </div>
        </ComponentPreview>

        <ComponentPreview
          title="With label"
          description="A label above the control adds context for form use."
          code={labelCode}
        >
          <div className="flex items-center justify-center w-full">
            <ColorPicker
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
            <ColorPicker
              label="Locked color"
              value={disabled}
              onChange={() => {}}
              disabled
            />
          </div>
        </ComponentPreview>

        <div>
          <SubsectionHeading>Props</SubsectionHeading>
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

        <SourcePath path="src/components/ui/ColorPicker/ColorPicker.tsx" />
      </div>
    </Shell>
  );
}
