"use client";

import { useState } from "react";
import { Shell } from "@/components/shell";
import { SectionHeading } from "@/components/token-grid";
import { ComponentPreview, PropsTable } from "@/components/component-preview";
import { cn } from "@/lib/utils";

// ── Demo Toggle (Switch) ────────────────────────────────────────────────────

function DemoToggle({
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
      role="switch"
      aria-checked={checked}
      aria-disabled={disabled}
      disabled={disabled}
      onClick={toggle}
      className={cn("flex items-center gap-3 group", className)}
    >
      <span
        className={cn(
          "relative inline-flex items-center w-9 h-5 rounded-full transition-colors shrink-0",
          checked ? "bg-accent" : "bg-border",
          disabled && "opacity-50 cursor-not-allowed"
        )}
      >
        <span
          className={cn(
            "absolute w-3.5 h-3.5 rounded-full bg-white shadow-sm transition-transform",
            checked ? "translate-x-[18px]" : "translate-x-[3px]"
          )}
        />
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

const basicCode = `<DemoToggle />`;

const labelCode = `<DemoToggle label="Enable notifications" />`;

const controlledCode = `const [dark, setDark] = useState(false);

<DemoToggle
  label="Dark mode"
  checked={dark}
  onCheckedChange={setDark}
/>`;

const disabledCode = `<DemoToggle label="Feature locked" disabled />
<DemoToggle label="Always on" checked disabled />`;

// ── Demos ────────────────────────────────────────────────────────────────────

function BasicDemo() {
  return <DemoToggle />;
}

function LabelDemo() {
  return <DemoToggle label="Enable notifications" />;
}

function ControlledDemo() {
  const [dark, setDark] = useState(false);
  const [autoSave, setAutoSave] = useState(true);

  return (
    <div className="flex flex-col gap-4">
      <DemoToggle label="Dark mode" checked={dark} onCheckedChange={setDark} />
      <DemoToggle
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
      <DemoToggle label="Feature locked" disabled />
      <DemoToggle label="Always on" checked disabled />
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
          description="A switch control for toggling between on/off states. Supports controlled and uncontrolled modes with proper ARIA role=switch."
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
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-3">
            Props
          </h3>
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

        <div className="text-xs font-mono text-muted-foreground p-3 rounded-sm bg-muted/50">
          src/components/ui/Toggle/Toggle.tsx
        </div>
      </div>
    </Shell>
  );
}
