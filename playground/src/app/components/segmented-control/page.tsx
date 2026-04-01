"use client";

import { useState } from "react";
import { Shell } from "@/components/shell";
import { SectionHeading } from "@/components/token-grid";
import { ComponentPreview, PropsTable, SourcePath, SubsectionHeading} from "@/components/component-preview";
import { SegmentedControl } from "@ds/SegmentedControl";
import type { SegmentedControlItem } from "@ds/SegmentedControl";

const basicCode = `import { SegmentedControl } from "@ds/SegmentedControl";

<SegmentedControl
  items={[
    { label: "Day", value: "day" },
    { label: "Week", value: "week" },
    { label: "Month", value: "month" },
  ]}
  value={view}
  onChange={setView}
/>`;

const sizesCode = `import { SegmentedControl } from "@ds/SegmentedControl";

<SegmentedControl size="sm" items={...} value={v} onChange={setV} />
<SegmentedControl size="md" items={...} value={v} onChange={setV} />`;

const fullWidthCode = `import { SegmentedControl } from "@ds/SegmentedControl";

<SegmentedControl fullWidth items={...} value={v} onChange={setV} />`;

const disabledItemsCode = `import { SegmentedControl } from "@ds/SegmentedControl";

<SegmentedControl
  items={[
    { label: "Active", value: "active" },
    { label: "Disabled", value: "disabled", disabled: true },
    { label: "Also active", value: "also" },
  ]}
  value={v}
  onChange={setV}
/>`;

export default function SegmentedControlPage() {
  const [view, setView] = useState("week");
  const [sm, setSm] = useState("list");
  const [md, setMd] = useState("list");
  const [full, setFull] = useState("all");
  const [partial, setPartial] = useState("active");

  const viewItems: SegmentedControlItem[] = [
    { label: "Day", value: "day" },
    { label: "Week", value: "week" },
    { label: "Month", value: "month" },
  ];

  const layoutItems: SegmentedControlItem[] = [
    { label: "List", value: "list" },
    { label: "Grid", value: "grid" },
    { label: "Board", value: "board" },
  ];

  const filterItems: SegmentedControlItem[] = [
    { label: "All", value: "all" },
    { label: "Active", value: "active" },
    { label: "Archived", value: "archived" },
  ];

  const partialItems: SegmentedControlItem[] = [
    { label: "Active", value: "active" },
    { label: "Pending", value: "pending", disabled: true },
    { label: "Done", value: "done" },
  ];

  return (
    <Shell title="Segmented Control">
      <div className="max-w-5xl space-y-10">
        <SectionHeading
          title="Segmented Control"
          description="Mutually exclusive toggle group with a sliding active indicator. Use for switching between views, filters, or modes within a confined space."
        />

        <ComponentPreview
          title="Basic"
          description="Three-option selector with a sliding background indicator."
          code={basicCode}
        >
          <div className="flex items-center justify-center w-full">
            <SegmentedControl
              items={viewItems}
              value={view}
              onChange={setView}
            />
          </div>
        </ComponentPreview>

        <ComponentPreview
          title="Sizes"
          description="Two sizes: sm (32px height, 12px text) and md (40px height, 14px text)."
          code={sizesCode}
        >
          <div className="flex flex-col items-center gap-4 w-full">
            <SegmentedControl
              size="sm"
              items={layoutItems}
              value={sm}
              onChange={setSm}
            />
            <SegmentedControl
              size="md"
              items={layoutItems}
              value={md}
              onChange={setMd}
            />
          </div>
        </ComponentPreview>

        <ComponentPreview
          title="Full width"
          description="Stretches to fill the container width — each segment takes equal space."
          code={fullWidthCode}
        >
          <div className="w-full max-w-md">
            <SegmentedControl
              fullWidth
              items={filterItems}
              value={full}
              onChange={setFull}
            />
          </div>
        </ComponentPreview>

        <ComponentPreview
          title="With disabled items"
          description="Individual items can be disabled while the rest remain interactive."
          code={disabledItemsCode}
        >
          <div className="flex items-center justify-center w-full">
            <SegmentedControl
              items={partialItems}
              value={partial}
              onChange={setPartial}
            />
          </div>
        </ComponentPreview>

        <div>
          <SubsectionHeading>Props</SubsectionHeading>
          <PropsTable
            props={[
              {
                name: "items",
                type: "{ label: string; value: string; disabled?: boolean }[]",
                description: "Array of selectable segments.",
              },
              {
                name: "value",
                type: "string",
                description: "Currently selected segment value.",
              },
              {
                name: "onChange",
                type: "(value: string) => void",
                description: "Called with the selected segment value.",
              },
              {
                name: "size",
                type: '"sm" | "md"',
                default: '"md"',
                description: "Height and text size of the control.",
              },
              {
                name: "fullWidth",
                type: "boolean",
                default: "false",
                description: "Stretch to fill the container width.",
              },
              {
                name: "disabled",
                type: "boolean",
                default: "false",
                description:
                  "Disable the entire control (reduces opacity, blocks interaction).",
              },
            ]}
          />
        </div>

        <SourcePath path="src/components/ui/SegmentedControl/SegmentedControl.tsx" />
      </div>
    </Shell>
  );
}
