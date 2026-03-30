"use client";

import { Shell } from "@/components/shell";
import { SectionHeading } from "@/components/token-grid";
import { ComponentPreview, PropsTable } from "@/components/component-preview";
import { cn } from "@/lib/utils";

function DemoDivider({
  orientation = "horizontal",
  className,
}: {
  orientation?: "horizontal" | "vertical";
  className?: string;
}) {
  if (orientation === "vertical") {
    return (
      <div
        role="separator"
        aria-orientation="vertical"
        className={cn("w-px self-stretch bg-border", className)}
      />
    );
  }
  return (
    <hr
      className={cn("border-none h-px w-full bg-border", className)}
    />
  );
}

const horizontalCode = `<DemoDivider />
{/* renders: <hr className="border-none h-px w-full bg-border" /> */}`;

const verticalCode = `<div className="flex items-center gap-4 h-10">
  <span>Left</span>
  <DemoDivider orientation="vertical" />
  <span>Right</span>
</div>`;

const spacingCode = `<DemoDivider className="my-6" />
<DemoDivider className="my-2" />
<DemoDivider className="my-0" />`;

export default function DividerPage() {
  return (
    <Shell title="Divider">
      <div className="max-w-5xl space-y-10">
        <SectionHeading
          title="Divider"
          description="Simple semantic separator for horizontal and vertical layouts. Renders an <hr> for horizontal orientation and a <div> for vertical."
        />

        <ComponentPreview
          title="Horizontal (default)"
          description="Full-width horizontal rule using the border token color."
          code={horizontalCode}
        >
          <div className="w-full max-w-md space-y-3">
            <p className="text-sm text-foreground">Section one content</p>
            <DemoDivider />
            <p className="text-sm text-foreground">Section two content</p>
            <DemoDivider />
            <p className="text-sm text-foreground">Section three content</p>
          </div>
        </ComponentPreview>

        <ComponentPreview
          title="Vertical"
          description="Vertical divider in a flex row, stretching to the height of its siblings."
          code={verticalCode}
        >
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-4 h-10 px-4 rounded-sm border border-border bg-background">
              <span className="text-sm text-foreground font-medium">Dashboard</span>
              <DemoDivider orientation="vertical" />
              <span className="text-sm text-foreground font-medium">Settings</span>
              <DemoDivider orientation="vertical" />
              <span className="text-sm text-foreground font-medium">Profile</span>
            </div>
          </div>
        </ComponentPreview>

        <ComponentPreview
          title="With spacing"
          description="Control vertical spacing around the divider with className overrides."
          code={spacingCode}
        >
          <div className="w-full max-w-md rounded-sm border border-border bg-background p-4">
            <p className="text-sm text-foreground">Large spacing (my-6)</p>
            <DemoDivider className="my-6" />
            <p className="text-sm text-foreground">Medium spacing (my-3)</p>
            <DemoDivider className="my-3" />
            <p className="text-sm text-foreground">Small spacing (my-1)</p>
            <DemoDivider className="my-1" />
            <p className="text-sm text-foreground">No spacing (my-0)</p>
          </div>
        </ComponentPreview>

        <div>
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-3">
            Props
          </h3>
          <PropsTable
            props={[
              {
                name: "orientation",
                type: '"horizontal" | "vertical"',
                default: '"horizontal"',
                description:
                  "Direction of the divider. Horizontal renders an <hr>, vertical renders a <div> with w-px.",
              },
              {
                name: "className",
                type: "string",
                default: "—",
                description: "Additional Tailwind classes for spacing or color overrides.",
              },
            ]}
          />
        </div>

        <div className="text-xs font-mono text-muted-foreground p-3 rounded-sm bg-muted/50">
          src/components/ui/Divider
        </div>
      </div>
    </Shell>
  );
}
