"use client";

import { useState } from "react";
import { Shell } from "@/components/shell";
import { SectionHeading } from "@/components/token-grid";
import { ComponentPreview, PropsTable, SourcePath, SubsectionHeading} from "@/components/component-preview";
import { Checkbox } from "@ds/Checkbox";
import type { CheckboxCheckedState } from "@ds/Checkbox";

// ── Code snippets ────────────────────────────────────────────────────────────

const basicCode = `import { Checkbox } from "@ds/Checkbox";

<Checkbox />`;

const labelCode = `<Checkbox label="Accept terms and conditions" />`;

const checkedCode = `const [agreed, setAgreed] = useState<CheckboxCheckedState>(true);

<Checkbox
  label="Send me updates"
  checked={agreed}
  onCheckedChange={setAgreed}
/>`;

const disabledCode = `<Checkbox label="Cannot change this" disabled />
<Checkbox label="Locked on" checked disabled />`;

// ── Demos ────────────────────────────────────────────────────────────────────

function BasicDemo() {
  return <Checkbox />;
}

function LabelDemo() {
  return <Checkbox label="Accept terms and conditions" />;
}

function CheckedDemo() {
  const [agreed, setAgreed] = useState<CheckboxCheckedState>(true);
  const [newsletter, setNewsletter] = useState<CheckboxCheckedState>(false);

  return (
    <div className="flex flex-col gap-3">
      <Checkbox
        label="Send me updates"
        checked={agreed}
        onCheckedChange={setAgreed}
      />
      <Checkbox
        label="Subscribe to newsletter"
        checked={newsletter}
        onCheckedChange={setNewsletter}
      />
      <p className="text-xs text-muted-foreground mt-1">
        Updates: {agreed === true ? "yes" : "no"} · Newsletter: {newsletter === true ? "yes" : "no"}
      </p>
    </div>
  );
}

function DisabledDemo() {
  return (
    <div className="flex flex-col gap-3">
      <Checkbox label="Cannot change this" disabled />
      <Checkbox label="Locked on" checked disabled />
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function CheckboxPage() {
  return (
    <Shell title="Checkbox">
      <div className="max-w-5xl space-y-10">
        <SectionHeading
          title="Checkbox"
          description="A binary toggle rendered as a styled checkbox with optional label. Built on Radix UI primitives with support for controlled, uncontrolled, and indeterminate states."
        />

        <ComponentPreview
          title="Basic"
          description="Unlabeled checkbox, toggles on click."
          code={basicCode}
        >
          <BasicDemo />
        </ComponentPreview>

        <ComponentPreview
          title="With label"
          description="A text label is rendered inline next to the checkbox."
          code={labelCode}
        >
          <LabelDemo />
        </ComponentPreview>

        <ComponentPreview
          title="Controlled checked states"
          description="Use the checked prop and onCheckedChange callback for controlled state."
          code={checkedCode}
        >
          <CheckedDemo />
        </ComponentPreview>

        <ComponentPreview
          title="Disabled"
          description="Disabled checkboxes show reduced opacity and ignore clicks."
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
                description: "Optional text label rendered next to the checkbox",
              },
              {
                name: "checked",
                type: "CheckboxCheckedState",
                description: 'Controlled checked state (boolean or "indeterminate")',
              },
              {
                name: "defaultChecked",
                type: "CheckboxCheckedState",
                default: "false",
                description: "Initial checked state (uncontrolled)",
              },
              {
                name: "onCheckedChange",
                type: "(checked: CheckboxCheckedState) => void",
                description: "Called when the checked state changes",
              },
              {
                name: "disabled",
                type: "boolean",
                default: "false",
                description: "Disables the checkbox",
              },
            ]}
          />
        </div>

        <SourcePath path="@ds/Checkbox" />
      </div>
    </Shell>
  );
}
