"use client";

import { useState } from "react";
import { Shell } from "@/components/shell";
import { SectionHeading } from "@/components/token-grid";
import { ComponentPreview, PropsTable } from "@/components/component-preview";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

// ── Demo Checkbox ────────────────────────────────────────────────────────────

function DemoCheckbox({
  label,
  checked: controlledChecked,
  defaultChecked = false,
  onCheckedChange,
  disabled,
  className,
}: {
  label?: string;
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
}) {
  const [internalChecked, setInternalChecked] = useState(defaultChecked);
  const isControlled = controlledChecked !== undefined;
  const checked = isControlled ? controlledChecked : internalChecked;

  function toggle() {
    if (disabled) return;
    const next = !checked;
    if (!isControlled) setInternalChecked(next);
    onCheckedChange?.(next);
  }

  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      aria-disabled={disabled}
      disabled={disabled}
      onClick={toggle}
      className={cn("flex items-center gap-2.5 group", className)}
    >
      <span
        className={cn(
          "flex items-center justify-center w-4 h-4 rounded-sm border transition-colors shrink-0",
          checked
            ? "bg-accent border-accent text-white"
            : "border-border bg-background group-hover:border-accent/50",
          disabled && "opacity-50 cursor-not-allowed"
        )}
      >
        {checked && <Check className="w-3 h-3" strokeWidth={3} />}
      </span>
      {label && (
        <span
          className={cn(
            "text-sm text-foreground select-none",
            disabled && "opacity-50"
          )}
        >
          {label}
        </span>
      )}
    </button>
  );
}

// ── Code snippets ────────────────────────────────────────────────────────────

const basicCode = `<DemoCheckbox />`;

const labelCode = `<DemoCheckbox label="Accept terms and conditions" />`;

const checkedCode = `const [agreed, setAgreed] = useState(true);

<DemoCheckbox
  label="Send me updates"
  checked={agreed}
  onCheckedChange={setAgreed}
/>`;

const disabledCode = `<DemoCheckbox label="Cannot change this" disabled />
<DemoCheckbox label="Locked on" checked disabled />`;

// ── Demos ────────────────────────────────────────────────────────────────────

function BasicDemo() {
  return <DemoCheckbox />;
}

function LabelDemo() {
  return <DemoCheckbox label="Accept terms and conditions" />;
}

function CheckedDemo() {
  const [agreed, setAgreed] = useState(true);
  const [newsletter, setNewsletter] = useState(false);

  return (
    <div className="flex flex-col gap-3">
      <DemoCheckbox
        label="Send me updates"
        checked={agreed}
        onCheckedChange={setAgreed}
      />
      <DemoCheckbox
        label="Subscribe to newsletter"
        checked={newsletter}
        onCheckedChange={setNewsletter}
      />
      <p className="text-xs text-muted-foreground mt-1">
        Updates: {agreed ? "yes" : "no"} · Newsletter: {newsletter ? "yes" : "no"}
      </p>
    </div>
  );
}

function DisabledDemo() {
  return (
    <div className="flex flex-col gap-3">
      <DemoCheckbox label="Cannot change this" disabled />
      <DemoCheckbox label="Locked on" checked disabled />
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
          description="A binary toggle rendered as a styled checkbox with optional label. Supports controlled and uncontrolled modes with proper ARIA attributes."
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
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-3">
            Props
          </h3>
          <PropsTable
            props={[
              {
                name: "label",
                type: "string",
                description: "Optional text label rendered next to the checkbox",
              },
              {
                name: "checked",
                type: "boolean",
                description: "Controlled checked state",
              },
              {
                name: "defaultChecked",
                type: "boolean",
                default: "false",
                description: "Initial checked state (uncontrolled)",
              },
              {
                name: "onCheckedChange",
                type: "(checked: boolean) => void",
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

        <div className="text-xs font-mono text-muted-foreground p-3 rounded-sm bg-muted/50">
          src/components/ui/Checkbox/Checkbox.tsx
        </div>
      </div>
    </Shell>
  );
}
