"use client";

import { useState } from "react";
import { Shell } from "@/components/shell";
import { SectionHeading } from "@/components/token-grid";
import { ComponentPreview, PropsTable, SourcePath, SubsectionHeading } from "@/components/component-preview";
import ScrollSpy from "@/components/scroll-spy";
import { Checkbox } from "@ds/Checkbox";
import type { CheckboxAppearance, CheckboxCheckedState, CheckboxSize } from "@ds/Checkbox";

// ── Constants ────────────────────────────────────────────────────────────────

const SIZES: CheckboxSize[] = ["sm", "md", "lg", "xl"];

const SIZE_DOCS: Record<CheckboxSize, { box: string; icon: string; label: string; gap: string }> = {
  sm: { box: "16", icon: "10", label: "xs (12)", gap: "utility-0.5x (4)" },
  md: { box: "18", icon: "12", label: "sm (14)", gap: "utility-0.75x (6)" },
  lg: { box: "20", icon: "14", label: "base (16)", gap: "utility-1x (8)" },
  xl: { box: "24", icon: "16", label: "lg (18)", gap: "utility-1x (8)" },
};

const CORE_APPEARANCES: CheckboxAppearance[] = [
  "neutral",
  "highlight",
  "positive",
  "negative",
  "warning",
];

const scrollSpySections = [
  { id: "sizes", label: "Size Scale" },
  { id: "appearances", label: "Appearances" },
  { id: "states", label: "States" },
  { id: "error", label: "Error" },
  { id: "label-placement", label: "Label Placement" },
  { id: "description", label: "Description" },
  { id: "controlled", label: "Controlled" },
  { id: "props", label: "Props" },
];

// ── Demos ────────────────────────────────────────────────────────────────────

function SizeScaleDemo() {
  return (
    <div className="space-y-4 w-full">
      {SIZES.map((s) => (
        <div key={s} className="flex items-center gap-4 text-xs text-muted-foreground">
          <Checkbox size={s} label={`Size ${s}`} defaultChecked />
          <div className="font-mono space-x-3">
            <span>box: {SIZE_DOCS[s].box}</span>
            <span>icon: {SIZE_DOCS[s].icon}</span>
            <span>font: {SIZE_DOCS[s].label}</span>
            <span>gap: {SIZE_DOCS[s].gap}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

function AppearanceMatrixDemo() {
  return (
    <div className="overflow-x-auto w-full">
      <table className="w-full text-xs">
        <thead>
          <tr>
            <th className="text-left text-muted-foreground font-medium p-2">
              Appearance
            </th>
            <th className="text-center text-muted-foreground font-medium p-2">
              Unchecked
            </th>
            <th className="text-center text-muted-foreground font-medium p-2">
              Checked
            </th>
            <th className="text-center text-muted-foreground font-medium p-2">
              Indeterminate
            </th>
          </tr>
        </thead>
        <tbody>
          {CORE_APPEARANCES.map((a) => (
            <tr key={a}>
              <td className="text-muted-foreground p-2 capitalize font-medium">
                {a}
              </td>
              <td className="p-2 text-center">
                <Checkbox appearance={a} label="Label" />
              </td>
              <td className="p-2 text-center">
                <Checkbox appearance={a} label="Label" checked />
              </td>
              <td className="p-2 text-center">
                <Checkbox appearance={a} label="Label" checked="indeterminate" />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function StatesDemo() {
  return (
    <div className="flex flex-col gap-4 w-full">
      <div className="flex flex-wrap items-start gap-6">
        <Checkbox label="Unchecked" />
        <Checkbox label="Checked" defaultChecked />
        <Checkbox label="Indeterminate" defaultChecked="indeterminate" />
      </div>
      <div className="flex flex-wrap items-start gap-6">
        <Checkbox label="Disabled unchecked" disabled />
        <Checkbox label="Disabled checked" checked disabled />
        <Checkbox label="Disabled indeterminate" checked="indeterminate" disabled />
      </div>
    </div>
  );
}

function ErrorDemo() {
  return (
    <div className="space-y-4 w-full">
      <div className="flex flex-wrap items-start gap-6">
        <Checkbox label="Terms" error="You must accept the terms" />
        <Checkbox label="Terms" error="Accepted with error" defaultChecked />
      </div>
      <div className="flex flex-wrap items-start gap-6">
        {SIZES.map((s) => (
          <Checkbox
            key={s}
            size={s}
            label={`Size ${s}`}
            error="Required"
          />
        ))}
      </div>
    </div>
  );
}

function LabelPlacementDemo() {
  return (
    <div className="space-y-4 w-full">
      <div className="flex flex-wrap items-start gap-8">
        <Checkbox label="Label on right" labelPlacement="right" defaultChecked />
        <Checkbox label="Label on left" labelPlacement="left" defaultChecked />
      </div>
      <div className="flex flex-wrap items-start gap-8">
        <Checkbox label="Right with error" labelPlacement="right" error="Required" />
        <Checkbox label="Left with error" labelPlacement="left" error="Required" />
      </div>
    </div>
  );
}

function DescriptionDemo() {
  return (
    <div className="space-y-4 w-full max-w-sm">
      <Checkbox
        label="Marketing emails"
        description="Receive emails about new products and features."
      />
      <Checkbox
        label="Terms of service"
        description="You agree to our terms of service and privacy policy."
        error="You must accept the terms to continue."
      />
    </div>
  );
}

function ControlledDemo() {
  const [agreed, setAgreed] = useState<CheckboxCheckedState>(false);
  const [newsletter, setNewsletter] = useState<CheckboxCheckedState>(true);

  return (
    <div className="flex flex-col gap-3">
      <Checkbox
        label="I agree to the terms"
        checked={agreed}
        onCheckedChange={setAgreed}
      />
      <Checkbox
        label="Subscribe to newsletter"
        checked={newsletter}
        onCheckedChange={setNewsletter}
      />
      <p className="text-xs text-muted-foreground mt-1 font-mono">
        agreed: {String(agreed)} · newsletter: {String(newsletter)}
      </p>
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function CheckboxPage() {
  return (
    <Shell title="Checkbox">
      <ScrollSpy sections={scrollSpySections} />
      <div className="max-w-5xl space-y-10">
        <SectionHeading
          title="Checkbox"
          description="Binary toggle with label, description, and error support. Uses a two-axis model: Appearance controls checked fill color, Size maps to button icon dimensions. Built on Radix UI primitives with full keyboard and screen reader support."
        />

        <section id="sizes">
          <ComponentPreview
            title="Size Scale"
            description="Four sizes derived from Button icon dimensions and cross-referenced with Badge heights. Box = label line-height at each step."
            code={`<Checkbox size="sm" label="Small (16px)" />
<Checkbox size="md" label="Medium (18px)" />  {/* default */}
<Checkbox size="lg" label="Large (20px)" />
<Checkbox size="xl" label="Extra Large (24px)" />`}
          >
            <SizeScaleDemo />
          </ComponentPreview>
        </section>

        <section id="appearances">
          <ComponentPreview
            title="Appearances"
            description="The appearance axis controls the checked fill color, mirroring Button's bold tier. Unchecked state is always neutral."
            code={`<Checkbox appearance="neutral" label="Neutral" checked />
<Checkbox appearance="highlight" label="Highlight" checked />
<Checkbox appearance="positive" label="Positive" checked />
<Checkbox appearance="negative" label="Negative" checked />
<Checkbox appearance="warning" label="Warning" checked />`}
          >
            <AppearanceMatrixDemo />
          </ComponentPreview>
        </section>

        <section id="states">
          <ComponentPreview
            title="States"
            description="Unchecked, checked, and indeterminate — each with enabled and disabled variants."
            code={`<Checkbox label="Unchecked" />
<Checkbox label="Checked" defaultChecked />
<Checkbox label="Indeterminate" defaultChecked="indeterminate" />
<Checkbox label="Disabled" disabled />
<Checkbox label="Disabled checked" checked disabled />`}
          >
            <StatesDemo />
          </ComponentPreview>
        </section>

        <section id="error">
          <ComponentPreview
            title="Error"
            description="Error is an orthogonal status dimension — overrides appearance with red border and fill. Error message renders below the label."
            code={`<Checkbox
  label="Terms"
  error="You must accept the terms"
/>`}
          >
            <ErrorDemo />
          </ComponentPreview>
        </section>

        <section id="label-placement">
          <ComponentPreview
            title="Label Placement"
            description="Labels can be placed on the right (default) or left side of the checkbox."
            code={`<Checkbox label="Right" labelPlacement="right" />
<Checkbox label="Left" labelPlacement="left" />`}
          >
            <LabelPlacementDemo />
          </ComponentPreview>
        </section>

        <section id="description">
          <ComponentPreview
            title="Description"
            description="Optional helper text below the label. When error is present, it replaces the description."
            code={`<Checkbox
  label="Marketing emails"
  description="Receive emails about new products."
/>
<Checkbox
  label="Terms of service"
  description="You agree to our terms."
  error="You must accept."
/>`}
          >
            <DescriptionDemo />
          </ComponentPreview>
        </section>

        <section id="controlled">
          <ComponentPreview
            title="Controlled"
            description="Use checked and onCheckedChange for controlled state."
            code={`const [agreed, setAgreed] = useState(false);

<Checkbox
  label="I agree to the terms"
  checked={agreed}
  onCheckedChange={setAgreed}
/>`}
          >
            <ControlledDemo />
          </ComponentPreview>
        </section>

        <section id="props">
          <SubsectionHeading>Props</SubsectionHeading>
          <PropsTable
            props={[
              {
                name: "appearance",
                type: '"neutral" | "highlight" | "positive" | "negative" | "warning" | "inverse" | "always-dark" | "always-light"',
                default: '"highlight"',
                description: "Color axis — controls the checked fill color. Maps to Button's bold tier per appearance.",
              },
              {
                name: "size",
                type: '"sm" | "md" | "lg" | "xl"',
                default: '"md"',
                description: "Box size derived from Button icon dimensions (16–18–20–24px). Also controls label font, gap, and icon scale.",
              },
              {
                name: "label",
                type: "string",
                description: "Text label rendered next to the checkbox.",
              },
              {
                name: "description",
                type: "string",
                description: "Helper text below the label. Hidden when error is present.",
              },
              {
                name: "error",
                type: "string",
                description: "Error message below the label. Overrides description and forces red border/fill.",
              },
              {
                name: "labelPlacement",
                type: '"right" | "left"',
                default: '"right"',
                description: "Which side the label appears on.",
              },
              {
                name: "checked",
                type: 'boolean | "indeterminate"',
                description: "Controlled checked state.",
              },
              {
                name: "defaultChecked",
                type: 'boolean | "indeterminate"',
                default: "false",
                description: "Initial checked state (uncontrolled).",
              },
              {
                name: "onCheckedChange",
                type: "(checked: CheckboxCheckedState) => void",
                description: "Called when the checked state changes.",
              },
              {
                name: "disabled",
                type: "boolean",
                default: "false",
                description: "Disables the checkbox (opacity 0.4, no pointer events).",
              },
            ]}
          />
        </section>

        <SourcePath path="src/components/ui/Checkbox/Checkbox.tsx · src/components/ui/Checkbox/Checkbox.module.scss" />
      </div>
    </Shell>
  );
}
