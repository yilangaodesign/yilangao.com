"use client";

import { useState } from "react";
import { Shell } from "@/components/shell";
import { SectionHeading } from "@/components/token-grid";
import { ComponentPreview, PropsTable, SourcePath, SubsectionHeading} from "@/components/component-preview";
import { Textarea } from "@ds/Textarea";

// ── Code snippets ────────────────────────────────────────────────────────────

const basicCode = `import { Textarea } from "@ds/Textarea";

<Textarea
  placeholder="Type something..."
  value={value}
  onChange={(e) => setValue(e.target.value)}
/>`;

const labelCode = `<Textarea
  label="Bio"
  placeholder="Tell us about yourself"
/>`;

const helperCode = `<Textarea
  label="Description"
  helperText="Markdown is supported. Keep it under 500 characters."
  placeholder="Project description..."
/>`;

const errorCode = `<Textarea
  label="Cover letter"
  error="This field is required."
  defaultValue=""
/>`;

const disabledCode = `<Textarea
  label="Notes"
  value="This content is locked."
  disabled
/>`;

// ── Demos ────────────────────────────────────────────────────────────────────

function BasicDemo() {
  const [value, setValue] = useState("");
  return (
    <div className="w-full max-w-md">
      <Textarea
        placeholder="Type something..."
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
    </div>
  );
}

function LabelDemo() {
  return (
    <div className="w-full max-w-md">
      <Textarea label="Bio" placeholder="Tell us about yourself" />
    </div>
  );
}

function HelperDemo() {
  return (
    <div className="w-full max-w-md">
      <Textarea
        label="Description"
        helperText="Markdown is supported. Keep it under 500 characters."
        placeholder="Project description..."
      />
    </div>
  );
}

function ErrorDemo() {
  return (
    <div className="w-full max-w-md">
      <Textarea
        label="Cover letter"
        error="This field is required."
        defaultValue=""
      />
    </div>
  );
}

function DisabledDemo() {
  return (
    <div className="w-full max-w-md">
      <Textarea label="Notes" value="This content is locked." disabled />
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function TextareaPage() {
  return (
    <Shell title="Textarea">
      <div className="max-w-5xl space-y-10">
        <SectionHeading
          title="Textarea"
          description="Multi-line text input with optional label, helper text, and error state. Resizable by default and forwards all standard textarea attributes."
        />

        <ComponentPreview
          title="Basic"
          description="Unlabeled textarea with placeholder and controlled state."
          code={basicCode}
        >
          <BasicDemo />
        </ComponentPreview>

        <ComponentPreview
          title="With label"
          description="A label is rendered above the textarea and associated via htmlFor/id."
          code={labelCode}
        >
          <LabelDemo />
        </ComponentPreview>

        <ComponentPreview
          title="With helper text"
          description="Muted helper copy below the field, hidden when an error is set."
          code={helperCode}
        >
          <HelperDemo />
        </ComponentPreview>

        <ComponentPreview
          title="Error state"
          description="Sets aria-invalid, shows destructive border color and error message."
          code={errorCode}
        >
          <ErrorDemo />
        </ComponentPreview>

        <ComponentPreview
          title="Disabled"
          description="Disabled textareas use reduced opacity and ignore pointer events."
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
                description:
                  "Muted hint below the field (hidden when error is set)",
              },
              {
                name: "error",
                type: "string",
                description:
                  "Error message; sets error styling and aria-invalid",
              },
              {
                name: "disabled",
                type: "boolean",
                default: "false",
                description: "Disables the textarea",
              },
              {
                name: "(HTML textarea attributes)",
                type: "TextareaHTMLAttributes<HTMLTextAreaElement>",
                description:
                  "Forwarded to the underlying textarea: placeholder, rows, cols, name, value, defaultValue, onChange, readOnly, maxLength, and more.",
              },
            ]}
          />
        </div>

        <SourcePath path="@ds/Textarea" />
      </div>
    </Shell>
  );
}
