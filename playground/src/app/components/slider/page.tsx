"use client";

import { useState } from "react";
import { Shell } from "@/components/shell";
import { SectionHeading } from "@/components/token-grid";
import { ComponentPreview, PropsTable, SourcePath, SubsectionHeading} from "@/components/component-preview";
import { Slider } from "@ds/Slider";

const basicCode = `import { Slider } from "@ds/Slider";

<Slider value={50} onChange={(v) => setValue(v)} />`;

const labelValueCode = `import { Slider } from "@ds/Slider";

<Slider
  label="Volume"
  value={72}
  showValue
  suffix="%"
  onChange={(v) => setValue(v)}
/>`;

const disabledCode = `import { Slider } from "@ds/Slider";

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
            <Slider value={basic} onChange={setBasic} />
          </div>
        </ComponentPreview>

        <ComponentPreview
          title="Label and value display"
          description="Shows a label on the left and the current value with an optional suffix on the right."
          code={labelValueCode}
        >
          <div className="w-full max-w-md">
            <Slider
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
            <Slider label="Locked" value={35} onChange={() => {}} showValue disabled />
          </div>
        </ComponentPreview>

        <div>
          <SubsectionHeading>Props</SubsectionHeading>
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

        <SourcePath path="src/components/ui/Slider/Slider.tsx" />
      </div>
    </Shell>
  );
}
