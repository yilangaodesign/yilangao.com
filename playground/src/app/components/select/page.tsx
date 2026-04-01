"use client";

import { useState } from "react";
import { Shell } from "@/components/shell";
import { SectionHeading } from "@/components/token-grid";
import { ComponentPreview, PropsTable, SourcePath, SubsectionHeading} from "@/components/component-preview";
import { Select, SelectItem, SelectGroup, SelectLabel } from "@ds/Select";

// ── Code snippets ────────────────────────────────────────────────────────────

const basicCode = `import { Select, SelectItem } from "@ds/Select";

<Select value={value} onValueChange={setValue} placeholder="Pick a fruit">
  <SelectItem value="apple">Apple</SelectItem>
  <SelectItem value="banana">Banana</SelectItem>
  <SelectItem value="cherry">Cherry</SelectItem>
</Select>`;

const labelCode = `<Select label="Fruit" placeholder="Pick a fruit">
  <SelectItem value="apple">Apple</SelectItem>
  <SelectItem value="banana">Banana</SelectItem>
  <SelectItem value="cherry">Cherry</SelectItem>
</Select>`;

const placeholderCode = `<Select
  label="Status"
  placeholder="Choose a status..."
  helperText="Select the current item status."
>
  <SelectItem value="active">Active</SelectItem>
  <SelectItem value="pending">Pending</SelectItem>
  <SelectItem value="archived" disabled>Archived</SelectItem>
  <SelectItem value="deleted" disabled>Deleted</SelectItem>
</Select>`;

const disabledItemsCode = `<Select label="Status" placeholder="Select status">
  <SelectItem value="active">Active</SelectItem>
  <SelectItem value="pending">Pending</SelectItem>
  <SelectItem value="archived" disabled>Archived</SelectItem>
  <SelectItem value="deleted" disabled>Deleted</SelectItem>
</Select>`;

const groupedCode = `import { Select, SelectItem, SelectGroup, SelectLabel } from "@ds/Select";

<Select label="Framework" placeholder="Choose a framework">
  <SelectGroup>
    <SelectLabel>Frontend</SelectLabel>
    <SelectItem value="react">React</SelectItem>
    <SelectItem value="vue">Vue</SelectItem>
  </SelectGroup>
  <SelectGroup>
    <SelectLabel>Backend</SelectLabel>
    <SelectItem value="node">Node.js</SelectItem>
    <SelectItem value="deno">Deno</SelectItem>
  </SelectGroup>
</Select>`;

// ── Demos ────────────────────────────────────────────────────────────────────

function BasicDemo() {
  const [value, setValue] = useState("");
  return (
    <div className="w-full max-w-xs">
      <Select value={value} onValueChange={setValue} placeholder="Pick a fruit">
        <SelectItem value="apple">Apple</SelectItem>
        <SelectItem value="banana">Banana</SelectItem>
        <SelectItem value="cherry">Cherry</SelectItem>
        <SelectItem value="dragonfruit">Dragonfruit</SelectItem>
        <SelectItem value="elderberry">Elderberry</SelectItem>
      </Select>
    </div>
  );
}

function LabelDemo() {
  return (
    <div className="w-full max-w-xs">
      <Select label="Fruit" placeholder="Pick a fruit">
        <SelectItem value="apple">Apple</SelectItem>
        <SelectItem value="banana">Banana</SelectItem>
        <SelectItem value="cherry">Cherry</SelectItem>
        <SelectItem value="dragonfruit">Dragonfruit</SelectItem>
        <SelectItem value="elderberry">Elderberry</SelectItem>
      </Select>
    </div>
  );
}

function PlaceholderDemo() {
  return (
    <div className="w-full max-w-xs">
      <Select
        label="Status"
        placeholder="Choose a status..."
        helperText="Select the current item status."
      >
        <SelectItem value="active">Active</SelectItem>
        <SelectItem value="pending">Pending</SelectItem>
        <SelectItem value="archived" disabled>Archived</SelectItem>
        <SelectItem value="deleted" disabled>Deleted</SelectItem>
      </Select>
    </div>
  );
}

function DisabledItemsDemo() {
  return (
    <div className="w-full max-w-xs">
      <Select label="Status" placeholder="Select status">
        <SelectItem value="active">Active</SelectItem>
        <SelectItem value="pending">Pending</SelectItem>
        <SelectItem value="archived" disabled>Archived</SelectItem>
        <SelectItem value="deleted" disabled>Deleted</SelectItem>
      </Select>
    </div>
  );
}

function GroupedDemo() {
  return (
    <div className="w-full max-w-xs">
      <Select label="Framework" placeholder="Choose a framework">
        <SelectGroup>
          <SelectLabel>Frontend</SelectLabel>
          <SelectItem value="react">React</SelectItem>
          <SelectItem value="vue">Vue</SelectItem>
          <SelectItem value="svelte">Svelte</SelectItem>
        </SelectGroup>
        <SelectGroup>
          <SelectLabel>Backend</SelectLabel>
          <SelectItem value="node">Node.js</SelectItem>
          <SelectItem value="deno">Deno</SelectItem>
          <SelectItem value="bun">Bun</SelectItem>
        </SelectGroup>
      </Select>
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
          description="Accessible dropdown select built on Radix UI primitives with keyboard navigation, disabled items, and option groups."
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
          description="Options organized into labeled groups via SelectGroup and SelectLabel."
          code={groupedCode}
        >
          <GroupedDemo />
        </ComponentPreview>

        <div>
          <SubsectionHeading>Props</SubsectionHeading>
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
                default: '"Select…"',
                description: "Placeholder text shown when no value is selected",
              },
              {
                name: "value",
                type: "string",
                description: "Controlled selected value",
              },
              {
                name: "onValueChange",
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
                name: "children",
                type: "ReactNode",
                description:
                  "SelectItem, SelectGroup, SelectLabel, and SelectSeparator elements",
              },
            ]}
          />
        </div>

        <SourcePath path="@ds/Select" />
      </div>
    </Shell>
  );
}
