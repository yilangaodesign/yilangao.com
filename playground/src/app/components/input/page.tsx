"use client";

import { useState } from "react";
import Search from "lucide-react/dist/esm/icons/search";
import Mail from "lucide-react/dist/esm/icons/mail";
import Eye from "lucide-react/dist/esm/icons/eye";
import { Shell } from "@/components/shell";
import { SectionHeading } from "@/components/token-grid";
import { ComponentPreview, PropsTable, SourcePath, SubsectionHeading } from "@/components/component-preview";
import ScrollSpy from "@/components/scroll-spy";
import { Input } from "@ds/Input";
import { Kbd } from "@ds/index";
import type { InputSize, InputEmphasis, InputStatus } from "@ds/Input";

const SIZES: InputSize[] = ["xs", "sm", "md", "lg", "xl"];
const EMPHASES: InputEmphasis[] = ["regular", "minimal"];
const STATUSES: InputStatus[] = ["none", "loading", "success", "error", "warning", "brand"];

const scrollSpySections = [
  { id: "default", label: "Default" },
  { id: "emphasis", label: "Emphasis" },
  { id: "sizes", label: "Sizes" },
  { id: "status", label: "Status" },
  { id: "label-helper", label: "Label & Helper" },
  { id: "addons", label: "Addon Slots" },
  { id: "clearable", label: "Clearable" },
  { id: "disabled-readonly", label: "Disabled & Read Only" },
  { id: "props", label: "Props" },
];

const defaultCode = `import { Input } from "@ds/Input";

<Input placeholder="Email address" />`;

const emphasisCode = `import { Input } from "@ds/Input";

<Input emphasis="regular" label="Regular" placeholder="Bordered box" />
<Input emphasis="minimal" label="Minimal" placeholder="Bottom border only" />`;

const sizesCode = `import { Input } from "@ds/Input";

<Input size="xs" placeholder="Extra small" />
<Input size="sm" placeholder="Small" />
<Input size="md" placeholder="Medium" />
<Input size="lg" placeholder="Large (default)" />
<Input size="xl" placeholder="Extra large" />`;

const statusCode = `import { Input } from "@ds/Input";

<Input status="loading" label="Loading" defaultValue="Validating..." feedbackMessage="Checking availability" />
<Input status="success" label="Success" defaultValue="available-username" feedbackMessage="Username is available" />
<Input status="error" label="Error" defaultValue="short" feedbackMessage="Must be at least 8 characters" />
<Input status="warning" label="Warning" defaultValue="admin" feedbackMessage="This username is reserved" />
<Input status="brand" label="Brand" placeholder="Search..." leadingIcon={<Search />} />`;

const labelHelperCode = `import { Input } from "@ds/Input";

<Input
  label="Display name"
  helperText="This is shown on your public profile."
  placeholder="Jane Doe"
/>`;

const addonsCode = `import { Input } from "@ds/Input";
import { Kbd } from "@ds/index";

{/* Leading icon */}
<Input leadingIcon={<Search />} placeholder="Search..." />

{/* Prefix and suffix */}
<Input prefix="$" suffix="USD" placeholder="0.00" />

{/* Trailing slot — Kbd shortcut hint */}
<Input leadingIcon={<Search />} trailing={<Kbd bordered>⌘K</Kbd>} placeholder="Search..." />

{/* Trailing icon */}
<Input trailingIcon={<Eye />} placeholder="Password" type="password" />

{/* Description line */}
<Input label="API Key" description="Read-only key for public use" defaultValue="pk_live_abc123" />`;

const clearableCode = `import { Input } from "@ds/Input";

const [value, setValue] = useState("Clear me");

<Input
  clearable
  value={value}
  onChange={(e) => setValue(e.target.value)}
  onClear={() => setValue("")}
  label="Clearable"
/>`;

const disabledCode = `import { Input } from "@ds/Input";

<Input label="Disabled" value="Cannot edit" disabled />
<Input label="Read Only" value="usr_01HZ..." readOnly />`;

const errorBackCompatCode = `import { Input } from "@ds/Input";

{/* Legacy error prop still works (maps to status="error" + feedbackMessage) */}
<Input label="Password" error="Must be at least 8 characters." defaultValue="short" />`;

function DefaultDemo() {
  const [value, setValue] = useState("");
  return (
    <div className="w-full max-w-md">
      <Input
        placeholder="Email address"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        autoComplete="off"
      />
    </div>
  );
}

function EmphasisDemo() {
  return (
    <div className="flex flex-col gap-6 w-full max-w-lg">
      {EMPHASES.map((e) => (
        <Input
          key={e}
          emphasis={e}
          label={e.charAt(0).toUpperCase() + e.slice(1)}
          placeholder={e === "regular" ? "Bordered box" : "Bottom border only"}
        />
      ))}
    </div>
  );
}

function SizesDemo() {
  return (
    <div className="flex flex-col gap-4 w-full max-w-lg">
      {SIZES.map((s) => (
        <Input key={s} size={s} placeholder={`Size: ${s}`} label={s.toUpperCase()} />
      ))}
    </div>
  );
}

function StatusDemo() {
  return (
    <div className="flex flex-col gap-6 w-full max-w-lg">
      <Input
        status="loading"
        label="Loading"
        defaultValue="Validating..."
        feedbackMessage="Checking availability"
      />
      <Input
        status="success"
        label="Success"
        defaultValue="available-username"
        feedbackMessage="Username is available"
      />
      <Input
        status="error"
        label="Error"
        defaultValue="short"
        feedbackMessage="Must be at least 8 characters"
      />
      <Input
        status="warning"
        label="Warning"
        defaultValue="admin"
        feedbackMessage="This username is reserved"
      />
      <Input
        status="brand"
        label="Brand"
        placeholder="Search..."
        leadingIcon={<Search />}
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
      />
    </div>
  );
}

function AddonsDemo() {
  return (
    <div className="flex flex-col gap-6 w-full max-w-lg">
      <Input
        leadingIcon={<Search />}
        placeholder="Search..."
        label="Leading icon"
      />
      <Input
        prefix="$"
        suffix="USD"
        placeholder="0.00"
        label="Prefix & suffix (strings)"
      />
      <Input
        leadingIcon={<Search />}
        trailing={<Kbd bordered>⌘K</Kbd>}
        placeholder="Search..."
        label="Trailing slot with Kbd"
      />
      <Input
        trailingIcon={<Eye />}
        placeholder="Password"
        type="password"
        label="Trailing icon"
      />
      <Input
        label="API Key"
        description="Read-only key for public use"
        defaultValue="pk_live_abc123"
        readOnly
      />
    </div>
  );
}

function ClearableDemo() {
  const [value, setValue] = useState("Clear me");
  return (
    <div className="w-full max-w-md">
      <Input
        clearable
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onClear={() => setValue("")}
        label="Clearable"
      />
    </div>
  );
}

function DisabledReadOnlyDemo() {
  return (
    <div className="flex flex-col gap-6 w-full max-w-lg">
      <Input label="Disabled" value="Cannot edit" disabled />
      <Input label="Read Only" value="usr_01HZ..." readOnly />
    </div>
  );
}

function ErrorBackCompatDemo() {
  return (
    <div className="w-full max-w-md">
      <Input
        label="Password"
        type="password"
        error="Must be at least 8 characters."
        defaultValue="short"
      />
    </div>
  );
}

export default function InputPage() {
  return (
    <Shell title="Input">
      <ScrollSpy sections={scrollSpySections} />
      <div className="max-w-5xl space-y-10">
        <SectionHeading
          title="Input"
          description="Text input with a two-axis model (Emphasis x Size), five status states, and rich addon slots. Follows the same sizing principles as Button: icon = label line-height, padding-derived height, gap-based icon-label spacing."
        />

        <section id="default">
          <ComponentPreview
            title="Default"
            description="Unlabeled input with placeholder. Defaults to emphasis=regular, size=lg, status=none."
            code={defaultCode}
          >
            <DefaultDemo />
          </ComponentPreview>
        </section>

        <section id="emphasis">
          <ComponentPreview
            title="Emphasis"
            description="Regular (bordered box with background) vs Minimal (bottom-border underline, transparent background). Both support all sizes and statuses."
            code={emphasisCode}
          >
            <EmphasisDemo />
          </ComponentPreview>
        </section>

        <section id="sizes">
          <ComponentPreview
            title="Sizes"
            description="Five sizes aligned with Button: xs, sm, md, lg (default), xl. Icon sizing, padding, and font scale together."
            code={sizesCode}
          >
            <SizesDemo />
          </ComponentPreview>
        </section>

        <section id="status">
          <ComponentPreview
            title="Status"
            description="Six status states: none (default), loading, success, error, warning, brand. Validation statuses swap border color and show a status icon. Brand uses the accent color border for primary/branded fields (no status icon). The feedbackMessage prop displays contextual text below the input."
            code={statusCode}
          >
            <StatusDemo />
          </ComponentPreview>
        </section>

        <section id="label-helper">
          <ComponentPreview
            title="Label & Helper Text"
            description="Label renders above the input as a native label element. Helper text renders below and is hidden when a feedbackMessage is shown."
            code={labelHelperCode}
          >
            <LabelHelperDemo />
          </ComponentPreview>
        </section>

        <section id="addons">
          <ComponentPreview
            title="Addon Slots"
            description="Leading icon, trailing icon, prefix/suffix (value affixes like '$' or 'USD'), trailing slot (arbitrary content like Kbd shortcut hints, badges, or chips), and description line (secondary text inside the input container)."
            code={addonsCode}
          >
            <AddonsDemo />
          </ComponentPreview>
        </section>

        <section id="clearable">
          <ComponentPreview
            title="Clearable"
            description="When clearable is true and the input has a value, an X button appears. Pass onClear to handle the clear action."
            code={clearableCode}
          >
            <ClearableDemo />
          </ComponentPreview>
        </section>

        <section id="disabled-readonly">
          <ComponentPreview
            title="Disabled & Read Only"
            description="Disabled reduces opacity and prevents interaction. Read Only allows focus and text selection but no editing."
            code={disabledCode}
          >
            <DisabledReadOnlyDemo />
          </ComponentPreview>

          <div className="mt-6">
            <ComponentPreview
              title="Legacy error prop (backward compat)"
              description="The error prop still works — it maps to status='error' + feedbackMessage internally."
              code={errorBackCompatCode}
            >
              <ErrorBackCompatDemo />
            </ComponentPreview>
          </div>
        </section>

        <div id="props">
          <SubsectionHeading>Props</SubsectionHeading>
          <PropsTable
            props={[
              {
                name: "emphasis",
                type: '"regular" | "minimal"',
                default: '"regular"',
                description: "Border model: regular = full box, minimal = bottom-border underline",
              },
              {
                name: "size",
                type: '"xs" | "sm" | "md" | "lg" | "xl"',
                default: '"lg"',
                description: "Controls font, padding, icon size, and gap — aligned with Button sizing",
              },
              {
                name: "status",
                type: '"none" | "loading" | "success" | "error" | "warning" | "brand"',
                default: '"none"',
                description: "Validation/feedback state or brand accent. Validation statuses swap border color and show a status icon. Brand uses the accent color border (no icon)",
              },
              {
                name: "label",
                type: "string",
                description: "Optional text label rendered above the input",
              },
              {
                name: "helperText",
                type: "string",
                description: "Muted hint below the field (hidden when feedbackMessage is shown)",
              },
              {
                name: "feedbackMessage",
                type: "string",
                description: "Status-specific message below the input (error text, success text, etc.)",
              },
              {
                name: "error",
                type: "string",
                description: "Deprecated — maps to status='error' + feedbackMessage. Kept for backward compat",
              },
              {
                name: "leadingIcon",
                type: "ReactNode",
                description: "Icon rendered at the start of the input container",
              },
              {
                name: "trailingIcon",
                type: "ReactNode",
                description: "Icon rendered at the end of the input container",
              },
              {
                name: "trailing",
                type: "ReactNode",
                description: "Generic slot for auxiliary trailing content — Kbd shortcut hints, badges, chips. Unlike suffix (value affix), trailing doesn't impose typography styles on its children",
              },
              {
                name: "prefix",
                type: "ReactNode",
                description: "Content before the input — text ('$'), a Kbd badge, or any ReactNode",
              },
              {
                name: "suffix",
                type: "ReactNode",
                description: "Value affix after the input — typically unit text ('USD', '.com') or contextual labels. For non-affix content like Kbd, use the trailing slot instead",
              },
              {
                name: "clearable",
                type: "boolean",
                default: "false",
                description: "Shows a clear button when the input has a value",
              },
              {
                name: "onClear",
                type: "() => void",
                description: "Callback when the clear button is clicked",
              },
              {
                name: "description",
                type: "string",
                description: "Secondary text line rendered inside the input container below the value",
              },
              {
                name: "(HTML input attributes)",
                type: "Omit<InputHTMLAttributes, 'size'>",
                description: "All standard input attributes forwarded: placeholder, disabled, readOnly, type, name, value, defaultValue, onChange, autoComplete, etc.",
              },
            ]}
          />
        </div>

        <SourcePath path="@ds/Input" />
      </div>
    </Shell>
  );
}
