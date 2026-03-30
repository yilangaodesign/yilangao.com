"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Shell } from "@/components/shell";
import { SectionHeading } from "@/components/token-grid";
import { ComponentPreview, PropsTable } from "@/components/component-preview";
import { cn } from "@/lib/utils";
import { ChevronDown, Check } from "lucide-react";

// ── Types ────────────────────────────────────────────────────────────────────

type SelectOption = {
  value: string;
  label: string;
  disabled?: boolean;
  group?: string;
};

// ── Demo Select ──────────────────────────────────────────────────────────────

function DemoSelect({
  label,
  helperText,
  error,
  placeholder = "Select an option",
  options,
  value,
  onChange,
  disabled,
  className,
}: {
  label?: string;
  helperText?: string;
  error?: string;
  placeholder?: string;
  options: SelectOption[];
  value?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [internalValue, setInternalValue] = useState(value || "");
  const containerRef = useRef<HTMLDivElement>(null);
  const hasError = !!error;
  const selected = internalValue || value || "";
  const selectedLabel = options.find((o) => o.value === selected)?.label;

  const handleSelect = useCallback(
    (val: string) => {
      setInternalValue(val);
      onChange?.(val);
      setOpen(false);
    },
    [onChange]
  );

  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (!containerRef.current?.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  useEffect(() => {
    if (value !== undefined) setInternalValue(value);
  }, [value]);

  const groupedOptions = options.reduce<{ group: string; items: SelectOption[] }[]>(
    (acc, opt) => {
      const groupName = opt.group || "";
      const existing = acc.find((g) => g.group === groupName);
      if (existing) {
        existing.items.push(opt);
      } else {
        acc.push({ group: groupName, items: [opt] });
      }
      return acc;
    },
    []
  );

  return (
    <div className={cn("flex flex-col gap-1.5", className)} ref={containerRef}>
      {label && (
        <label className="text-sm font-medium text-foreground">{label}</label>
      )}
      <div className="relative">
        <button
          type="button"
          onClick={() => !disabled && setOpen(!open)}
          disabled={disabled}
          className={cn(
            "flex items-center justify-between w-full h-9 px-3 text-sm bg-background border rounded-sm transition-colors",
            "focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent",
            hasError
              ? "border-red-500 focus:ring-red-500/30 focus:border-red-500"
              : "border-border",
            disabled && "opacity-50 cursor-not-allowed bg-muted",
            !selectedLabel && "text-muted-foreground/50"
          )}
        >
          <span className="truncate">{selectedLabel || placeholder}</span>
          <ChevronDown
            className={cn(
              "w-3.5 h-3.5 text-muted-foreground transition-transform shrink-0 ml-2",
              open && "rotate-180"
            )}
          />
        </button>

        {open && (
          <div className="absolute z-50 w-full mt-1 bg-background border border-border rounded-sm shadow-lg overflow-hidden">
            <div className="max-h-[200px] overflow-y-auto py-1">
              {groupedOptions.map((group) => (
                <div key={group.group}>
                  {group.group && (
                    <div className="px-3 py-1.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground/60">
                      {group.group}
                    </div>
                  )}
                  {group.items.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      disabled={opt.disabled}
                      onClick={() => !opt.disabled && handleSelect(opt.value)}
                      className={cn(
                        "flex items-center w-full px-3 py-1.5 text-sm transition-colors text-left",
                        opt.disabled
                          ? "opacity-40 cursor-not-allowed text-muted-foreground"
                          : selected === opt.value
                            ? "bg-accent/10 text-accent font-medium"
                            : "text-foreground hover:bg-muted"
                      )}
                    >
                      <span className="flex-1 truncate">{opt.label}</span>
                      {selected === opt.value && (
                        <Check className="w-3.5 h-3.5 shrink-0 text-accent" />
                      )}
                    </button>
                  ))}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      {hasError && <p className="text-xs text-red-500">{error}</p>}
      {!hasError && helperText && (
        <p className="text-xs text-muted-foreground">{helperText}</p>
      )}
    </div>
  );
}

// ── Option data ──────────────────────────────────────────────────────────────

const fruits: SelectOption[] = [
  { value: "apple", label: "Apple" },
  { value: "banana", label: "Banana" },
  { value: "cherry", label: "Cherry" },
  { value: "dragonfruit", label: "Dragonfruit" },
  { value: "elderberry", label: "Elderberry" },
];

const withDisabled: SelectOption[] = [
  { value: "active", label: "Active" },
  { value: "pending", label: "Pending" },
  { value: "archived", label: "Archived", disabled: true },
  { value: "deleted", label: "Deleted", disabled: true },
];

const grouped: SelectOption[] = [
  { value: "react", label: "React", group: "Frontend" },
  { value: "vue", label: "Vue", group: "Frontend" },
  { value: "svelte", label: "Svelte", group: "Frontend" },
  { value: "node", label: "Node.js", group: "Backend" },
  { value: "deno", label: "Deno", group: "Backend" },
  { value: "bun", label: "Bun", group: "Backend" },
];

// ── Code snippets ────────────────────────────────────────────────────────────

const basicCode = `<DemoSelect
  options={fruits}
  value={value}
  onChange={setValue}
  placeholder="Pick a fruit"
/>`;

const labelCode = `<DemoSelect
  label="Fruit"
  options={fruits}
  placeholder="Pick a fruit"
/>`;

const placeholderCode = `<DemoSelect
  label="Status"
  placeholder="Choose a status..."
  options={withDisabled}
/>`;

const disabledItemsCode = `<DemoSelect
  label="Status"
  options={[
    { value: "active", label: "Active" },
    { value: "pending", label: "Pending" },
    { value: "archived", label: "Archived", disabled: true },
    { value: "deleted", label: "Deleted", disabled: true },
  ]}
/>`;

const groupedCode = `<DemoSelect
  label="Framework"
  options={[
    { value: "react", label: "React", group: "Frontend" },
    { value: "vue", label: "Vue", group: "Frontend" },
    { value: "node", label: "Node.js", group: "Backend" },
    { value: "deno", label: "Deno", group: "Backend" },
  ]}
/>`;

// ── Demos ────────────────────────────────────────────────────────────────────

function BasicDemo() {
  const [value, setValue] = useState("");
  return (
    <div className="w-full max-w-xs">
      <DemoSelect
        options={fruits}
        value={value}
        onChange={setValue}
        placeholder="Pick a fruit"
      />
    </div>
  );
}

function LabelDemo() {
  return (
    <div className="w-full max-w-xs">
      <DemoSelect label="Fruit" options={fruits} placeholder="Pick a fruit" />
    </div>
  );
}

function PlaceholderDemo() {
  return (
    <div className="w-full max-w-xs">
      <DemoSelect
        label="Status"
        placeholder="Choose a status..."
        helperText="Select the current item status."
        options={withDisabled}
      />
    </div>
  );
}

function DisabledItemsDemo() {
  return (
    <div className="w-full max-w-xs">
      <DemoSelect
        label="Status"
        options={withDisabled}
        placeholder="Select status"
      />
    </div>
  );
}

function GroupedDemo() {
  return (
    <div className="w-full max-w-xs">
      <DemoSelect
        label="Framework"
        options={grouped}
        placeholder="Choose a framework"
      />
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function SelectPage() {
  return (
    <Shell title="Select">
      <div className="max-w-5xl space-y-10">
        <SectionHeading
          title="Select"
          description="Custom dropdown select with keyboard support, disabled items, and option groups. Built with native elements and Tailwind for full styling control."
        />

        <ComponentPreview
          title="Basic"
          description="Controlled select with a list of options."
          code={basicCode}
        >
          <BasicDemo />
        </ComponentPreview>

        <ComponentPreview
          title="With label"
          description="A text label is rendered above the trigger."
          code={labelCode}
        >
          <LabelDemo />
        </ComponentPreview>

        <ComponentPreview
          title="With placeholder and helper text"
          description="Placeholder shown when no value is selected; helper text below."
          code={placeholderCode}
        >
          <PlaceholderDemo />
        </ComponentPreview>

        <ComponentPreview
          title="With disabled items"
          description="Individual options can be disabled while the select remains interactive."
          code={disabledItemsCode}
        >
          <DisabledItemsDemo />
        </ComponentPreview>

        <ComponentPreview
          title="With groups"
          description="Options organized into labeled groups via the group property."
          code={groupedCode}
        >
          <GroupedDemo />
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
                description: "Optional text label rendered above the trigger",
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
                  "Error message; shows destructive styling",
              },
              {
                name: "placeholder",
                type: "string",
                default: '"Select an option"',
                description: "Placeholder text shown when no value is selected",
              },
              {
                name: "value",
                type: "string",
                description: "Controlled selected value",
              },
              {
                name: "onChange",
                type: "(value: string) => void",
                description: "Called when a new option is selected",
              },
              {
                name: "disabled",
                type: "boolean",
                default: "false",
                description: "Disables the entire select",
              },
              {
                name: "options",
                type: "SelectOption[]",
                description:
                  "Array of { value, label, disabled?, group? } objects",
              },
            ]}
          />
        </div>

        <div className="text-xs font-mono text-muted-foreground p-3 rounded-sm bg-muted/50">
          src/components/ui/Select/Select.tsx
        </div>
      </div>
    </Shell>
  );
}
