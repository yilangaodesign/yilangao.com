"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Shell } from "@/components/shell";
import { SectionHeading } from "@/components/token-grid";
import { ComponentPreview, PropsTable } from "@/components/component-preview";
import { cn } from "@/lib/utils";

type SegmentItem = {
  label: string;
  value: string;
  disabled?: boolean;
};

function DemoSegmentedControl({
  items,
  value,
  onChange,
  size = "md",
  fullWidth = false,
  disabled = false,
  className,
}: {
  items: SegmentItem[];
  value: string;
  onChange: (value: string) => void;
  size?: "sm" | "md";
  fullWidth?: boolean;
  disabled?: boolean;
  className?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [indicator, setIndicator] = useState({ left: 0, width: 0 });

  const updateIndicator = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;
    const activeIndex = items.findIndex((item) => item.value === value);
    if (activeIndex < 0) return;
    const buttons = container.querySelectorAll<HTMLButtonElement>(
      "[data-segment-button]"
    );
    const btn = buttons[activeIndex];
    if (!btn) return;
    setIndicator({
      left: btn.offsetLeft,
      width: btn.offsetWidth,
    });
  }, [items, value]);

  useEffect(() => {
    updateIndicator();
  }, [updateIndicator]);

  useEffect(() => {
    const ro = new ResizeObserver(updateIndicator);
    if (containerRef.current) ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, [updateIndicator]);

  const sizeClasses = size === "sm" ? "h-8 text-xs" : "h-10 text-sm";

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative inline-flex items-center p-1 bg-muted rounded-sm",
        fullWidth && "w-full",
        disabled && "opacity-50 pointer-events-none",
        className
      )}
    >
      <div
        className="absolute top-1 bottom-1 rounded-sm bg-background shadow-sm transition-all duration-200 ease-out"
        style={{ left: indicator.left, width: indicator.width }}
      />
      {items.map((item) => (
        <button
          key={item.value}
          type="button"
          data-segment-button
          onClick={() => {
            if (!item.disabled) onChange(item.value);
          }}
          disabled={item.disabled || disabled}
          className={cn(
            "relative z-[1] flex-1 flex items-center justify-center px-3 font-medium rounded-sm transition-colors whitespace-nowrap",
            sizeClasses,
            item.value === value
              ? "text-foreground"
              : "text-muted-foreground hover:text-foreground",
            item.disabled && "opacity-40 cursor-not-allowed"
          )}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}

const basicCode = `import { SegmentedControl } from "@/components/ui/SegmentedControl/SegmentedControl";

<SegmentedControl
  items={[
    { label: "Day", value: "day" },
    { label: "Week", value: "week" },
    { label: "Month", value: "month" },
  ]}
  value={view}
  onChange={setView}
/>`;

const sizesCode = `import { SegmentedControl } from "@/components/ui/SegmentedControl/SegmentedControl";

<SegmentedControl size="sm" items={...} value={v} onChange={setV} />
<SegmentedControl size="md" items={...} value={v} onChange={setV} />`;

const fullWidthCode = `import { SegmentedControl } from "@/components/ui/SegmentedControl/SegmentedControl";

<SegmentedControl fullWidth items={...} value={v} onChange={setV} />`;

const disabledItemsCode = `import { SegmentedControl } from "@/components/ui/SegmentedControl/SegmentedControl";

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

  const viewItems: SegmentItem[] = [
    { label: "Day", value: "day" },
    { label: "Week", value: "week" },
    { label: "Month", value: "month" },
  ];

  const layoutItems: SegmentItem[] = [
    { label: "List", value: "list" },
    { label: "Grid", value: "grid" },
    { label: "Board", value: "board" },
  ];

  const filterItems: SegmentItem[] = [
    { label: "All", value: "all" },
    { label: "Active", value: "active" },
    { label: "Archived", value: "archived" },
  ];

  const partialItems: SegmentItem[] = [
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
            <DemoSegmentedControl
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
            <DemoSegmentedControl
              size="sm"
              items={layoutItems}
              value={sm}
              onChange={setSm}
            />
            <DemoSegmentedControl
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
            <DemoSegmentedControl
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
            <DemoSegmentedControl
              items={partialItems}
              value={partial}
              onChange={setPartial}
            />
          </div>
        </ComponentPreview>

        <div>
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-3">
            Props
          </h3>
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

        <div className="text-xs font-mono text-muted-foreground p-3 rounded-sm bg-muted/50">
          src/components/ui/SegmentedControl/SegmentedControl.tsx
        </div>
      </div>
    </Shell>
  );
}
