"use client";

import { useState } from "react";
import { Shell } from "@/components/shell";
import { SectionHeading } from "@/components/token-grid";
import { ComponentPreview, PropsTable, SourcePath, SubsectionHeading} from "@/components/component-preview";
import { ScrubInput } from "@ds/ScrubInput";

const basicCode = `import { ScrubInput } from "@ds/ScrubInput";

<ScrubInput value={50} onChange={(v) => setValue(v)} />`;

const labelCode = `import { ScrubInput } from "@ds/ScrubInput";

<ScrubInput
  label="Opacity"
  value={80}
  min={0}
  max={100}
  onChange={(v) => setValue(v)}
/>`;

const suffixCode = `import { ScrubInput } from "@ds/ScrubInput";

<ScrubInput
  label="Border radius"
  value={8}
  min={0}
  max={32}
  suffix="px"
  onChange={(v) => setValue(v)}
/>`;

const disabledCode = `import { ScrubInput } from "@ds/ScrubInput";

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
            <ScrubInput value={basic} onChange={setBasic} />
          </div>
        </ComponentPreview>

        <ComponentPreview
          title="With label"
          description="A label provides context above the control."
          code={labelCode}
        >
          <div className="flex items-center justify-center w-full">
            <ScrubInput
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
            <ScrubInput
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
            <ScrubInput
              label="Locked"
              value={24}
              suffix="px"
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

        <SourcePath path="src/components/ui/ScrubInput/ScrubInput.tsx" />
      </div>
    </Shell>
  );
}
