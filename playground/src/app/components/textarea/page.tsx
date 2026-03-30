"use client";

import { useState } from "react";
import { Shell } from "@/components/shell";
import { SectionHeading } from "@/components/token-grid";
import { ComponentPreview, PropsTable } from "@/components/component-preview";
import { cn } from "@/lib/utils";

// ── Demo Textarea ────────────────────────────────────────────────────────────

function DemoTextarea({
  label,
  helperText,
  error,
  disabled,
  className,
  id: idProp,
  ...rest
}: {
  label?: string;
  helperText?: string;
  error?: string;
  disabled?: boolean;
  className?: string;
  id?: string;
} & React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const id = idProp || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);
  const hasError = !!error;

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-foreground">
          {label}
        </label>
      )}
      <textarea
        id={id}
        disabled={disabled}
        aria-invalid={hasError || undefined}
        aria-describedby={hasError ? `${id}-error` : helperText ? `${id}-helper` : undefined}
        className={cn(
          "w-full min-h-[100px] px-3 py-2 text-sm font-sans bg-background border rounded-sm transition-colors resize-y",
          "placeholder:text-muted-foreground/50",
          "focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent",
          hasError
            ? "border-red-500 focus:ring-red-500/30 focus:border-red-500"
            : "border-border",
          disabled && "opacity-50 cursor-not-allowed bg-muted"
        )}
        {...rest}
      />
      {hasError && (
        <p id={`${id}-error`} className="text-xs text-red-500">
          {error}
        </p>
      )}
      {!hasError && helperText && (
        <p id={`${id}-helper`} className="text-xs text-muted-foreground">
          {helperText}
        </p>
      )}
    </div>
  );
}

// ── Code snippets ────────────────────────────────────────────────────────────

const basicCode = `<DemoTextarea
  placeholder="Type something..."
  value={value}
  onChange={(e) => setValue(e.target.value)}
/>`;

const labelCode = `<DemoTextarea
  label="Bio"
  placeholder="Tell us about yourself"
/>`;

const helperCode = `<DemoTextarea
  label="Description"
  helperText="Markdown is supported. Keep it under 500 characters."
  placeholder="Project description..."
/>`;

const errorCode = `<DemoTextarea
  label="Cover letter"
  error="This field is required."
  defaultValue=""
/>`;

const disabledCode = `<DemoTextarea
  label="Notes"
  value="This content is locked."
  disabled
/>`;

// ── Demos ────────────────────────────────────────────────────────────────────

function BasicDemo() {
  const [value, setValue] = useState("");
  return (
    <div className="w-full max-w-md">
      <DemoTextarea
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
      <DemoTextarea label="Bio" placeholder="Tell us about yourself" />
    </div>
  );
}

function HelperDemo() {
  return (
    <div className="w-full max-w-md">
      <DemoTextarea
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
      <DemoTextarea
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
      <DemoTextarea label="Notes" value="This content is locked." disabled />
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
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-3">
            Props
          </h3>
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

        <div className="text-xs font-mono text-muted-foreground p-3 rounded-sm bg-muted/50">
          src/components/ui/Textarea/Textarea.tsx
        </div>
      </div>
    </Shell>
  );
}
