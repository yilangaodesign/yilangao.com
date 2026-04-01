"use client";

import { useState } from "react";
import { Shell } from "@/components/shell";
import { SectionHeading } from "@/components/token-grid";
import { ComponentPreview, PropsTable, SourcePath, SubsectionHeading} from "@/components/component-preview";
import { Input } from "@ds/Input";

const defaultCode = `import { Input } from "@ds/Input";

export function DefaultInputExample() {
  const [value, setValue] = useState("");

  return (
    <Input
      placeholder="Email address"
      value={value}
      onChange={(e) => setValue(e.target.value)}
      autoComplete="off"
    />
  );
}`;

const labelHelperCode = `import { Input } from "@ds/Input";

export function LabeledInputExample() {
  return (
    <Input
      label="Display name"
      helperText="This is shown on your public profile."
      placeholder="Jane Doe"
    />
  );
}`;

const errorCode = `import { Input } from "@ds/Input";

export function InputErrorExample() {
  return (
    <Input
      label="Password"
      type="password"
      error="Must be at least 8 characters."
      defaultValue="short"
    />
  );
}`;

const disabledCode = `import { Input } from "@ds/Input";

export function DisabledInputExample() {
  return (
    <Input
      label="Account ID"
      value="usr_01HZ..."
      disabled
      readOnly
    />
  );
}`;

function DefaultDemo() {
  const [value, setValue] = useState("");

  return (
    <div className="w-full max-w-md">
      <Input
        placeholder="Email address"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        autoComplete="off"
        className="w-full"
      />
    </div>
  );
}

function LabelHelperDemo() {
  return (
    <div className="w-full max-w-md">
      <Input
        label="Display name"
        helperText="This is shown on your public profile."
        placeholder="Jane Doe"
        className="w-full"
      />
    </div>
  );
}

function ErrorDemo() {
  return (
    <div className="w-full max-w-md">
      <Input
        label="Password"
        type="password"
        error="Must be at least 8 characters."
        defaultValue="short"
        className="w-full"
      />
    </div>
  );
}

function DisabledDemo() {
  return (
    <div className="w-full max-w-md">
      <Input
        label="Account ID"
        value="usr_01HZ..."
        disabled
        readOnly
        className="w-full"
      />
    </div>
  );
}

export default function InputPage() {
  return (
    <Shell title="Input">
      <div className="max-w-5xl space-y-10">
        <SectionHeading
          title="Input"
          description="Text field with optional label, helper text, and error state. Forwards all standard input attributes and wires aria-invalid, aria-describedby, and ids for assistive technologies."
        />

        <ComponentPreview
          title="Default"
          description="Unlabeled input with placeholder. Use controlled state when you need to read or validate the value."
          code={defaultCode}
        >
          <DefaultDemo />
        </ComponentPreview>

        <ComponentPreview
          title="Label and helper text"
          description="Shows a label above the field and muted helper copy below when there is no error."
          code={labelHelperCode}
        >
          <LabelHelperDemo />
        </ComponentPreview>

        <ComponentPreview
          title="Error state"
          description="Sets aria-invalid and shows the error message instead of helper text."
          code={errorCode}
        >
          <ErrorDemo />
        </ComponentPreview>

        <ComponentPreview
          title="Disabled"
          description="Disabled inputs use reduced interaction styles and ignore pointer events."
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
                description: "Optional text label rendered above the control",
              },
              {
                name: "helperText",
                type: "string",
                description: "Muted hint below the field (hidden when error is set)",
              },
              {
                name: "error",
                type: "string",
                description: "Error message; sets error styling and aria-invalid",
              },
              {
                name: "(HTML input attributes)",
                type: "InputHTMLAttributes<HTMLInputElement>",
                description:
                  "Forwarded to the underlying input: placeholder, disabled, type, name, value, defaultValue, onChange, autoComplete, readOnly, and more.",
              },
            ]}
          />
        </div>

        <SourcePath path="@ds/Input" />
      </div>
    </Shell>
  );
}
