"use client";

import { useState } from "react";
import { Shell } from "@/components/shell";
import { SectionHeading } from "@/components/token-grid";
import { ComponentPreview, PropsTable, SourcePath, SubsectionHeading} from "@/components/component-preview";
import { Toggle } from "@ds/Toggle";

// ── Code snippets ────────────────────────────────────────────────────────────

const basicCode = `import { Toggle } from "@ds/Toggle";

<Toggle />`;

const labelCode = `<Toggle label="Enable notifications" />`;

const controlledCode = `const [dark, setDark] = useState(false);

<Toggle
  label="Dark mode"
  checked={dark}
  onCheckedChange={setDark}
/>`;

const disabledCode = `<Toggle label="Feature locked" disabled />
<Toggle label="Always on" checked disabled />`;

// ── Demos ────────────────────────────────────────────────────────────────────

function BasicDemo() {
  return <Toggle />;
}

function LabelDemo() {
  return <Toggle label="Enable notifications" />;
}

function ControlledDemo() {
  const [dark, setDark] = useState(false);
  const [autoSave, setAutoSave] = useState(true);

  return (
    <div className="flex flex-col gap-4">
      <Toggle label="Dark mode" checked={dark} onCheckedChange={setDark} />
      <Toggle
        label="Auto-save"
        checked={autoSave}
        onCheckedChange={setAutoSave}
      />
      <p className="text-xs text-muted-foreground mt-1">
        Dark: {dark ? "on" : "off"} · Auto-save: {autoSave ? "on" : "off"}
      </p>
    </div>
  );
}

function DisabledDemo() {
  return (
    <div className="flex flex-col gap-4">
      <Toggle label="Feature locked" disabled />
      <Toggle label="Always on" checked disabled />
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function TogglePage() {
  return (
    <Shell title="Toggle">
      <div className="max-w-5xl space-y-10">
        <SectionHeading
          title="Toggle"
          description="A switch control for toggling between on/off states. Built on Radix UI primitives with support for controlled and uncontrolled modes and proper ARIA role=switch."
        />

        <ComponentPreview
          title="Basic"
          description="Unlabeled toggle switch."
          code={basicCode}
        >
          <BasicDemo />
        </ComponentPreview>

        <ComponentPreview
          title="With label"
          description="A text label is rendered inline next to the switch."
          code={labelCode}
        >
          <LabelDemo />
        </ComponentPreview>

        <ComponentPreview
          title="Controlled"
          description="Use checked + onCheckedChange for controlled state."
          code={controlledCode}
        >
          <ControlledDemo />
        </ComponentPreview>

        <ComponentPreview
          title="Disabled"
          description="Disabled toggles show reduced opacity and ignore interaction."
          code={disabledCode}
        >
          <DisabledDemo />
        </ComponentPreview>

        <div>
          <SubsectionHeading>Props</SubsectionHeading>
          <PropsTable
            props={[
              {
                name: "label",
                type: "string",
                description: "Optional text label rendered next to the switch",
              },
              {
                name: "checked",
                type: "boolean",
                description: "Controlled on/off state",
              },
              {
                name: "defaultChecked",
                type: "boolean",
                default: "false",
                description: "Initial state (uncontrolled)",
              },
              {
                name: "onCheckedChange",
                type: "(checked: boolean) => void",
                description: "Called when the toggle state changes",
              },
              {
                name: "disabled",
                type: "boolean",
                default: "false",
                description: "Disables the toggle",
              },
            ]}
          />
        </div>

        <SourcePath path="@ds/Toggle" />
      </div>
    </Shell>
  );
}
