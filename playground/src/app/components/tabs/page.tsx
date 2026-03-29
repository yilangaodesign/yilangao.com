"use client";

import { forwardRef, type ReactNode } from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import { Shell } from "@/components/shell";
import { SectionHeading } from "@/components/token-grid";
import { ComponentPreview, PropsTable } from "@/components/component-preview";
import { cn } from "@/lib/utils";

const Tabs = TabsPrimitive.Root;

const TabsList = forwardRef<
  HTMLDivElement,
  { children: ReactNode; className?: string }
>(({ className, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(
      "inline-flex h-10 w-full items-center gap-1 border-b border-border text-muted-foreground",
      className,
    )}
    {...props}
  />
));
TabsList.displayName = "TabsList";

const TabsTrigger = forwardRef<
  HTMLButtonElement,
  { children: ReactNode; value: string; className?: string; disabled?: boolean }
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      "relative -mb-px inline-flex items-center justify-center whitespace-nowrap px-3 pb-2 pt-1.5 text-sm font-medium transition-colors",
      "border-b-2 border-transparent bg-transparent text-muted-foreground",
      "hover:text-foreground",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
      "data-[state=active]:border-accent data-[state=active]:text-foreground",
      "disabled:pointer-events-none disabled:opacity-50",
      className,
    )}
    {...props}
  />
));
TabsTrigger.displayName = "TabsTrigger";

const TabsContent = forwardRef<
  HTMLDivElement,
  { children: ReactNode; value: string; className?: string }
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      "mt-4 rounded-sm border border-border bg-muted/20 p-4 text-sm text-foreground outline-none",
      "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
      className,
    )}
    {...props}
  />
));
TabsContent.displayName = "TabsContent";

function TabsDemo() {
  return (
    <div className="w-full max-w-xl">
      <Tabs defaultValue="overview" className="w-full">
        <TabsList aria-label="Example tabs">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>
        <TabsContent value="overview">
          Summary metrics and key objectives for this workspace. Switch tabs to inspect supporting
          data.
        </TabsContent>
        <TabsContent value="details">
          Technical metadata: identifiers, owners, and linked resources. Use this panel for
          copy-paste friendly values.
        </TabsContent>
        <TabsContent value="activity">
          Recent edits and comments in chronological order. Notifications can be configured in
          settings.
        </TabsContent>
      </Tabs>
    </div>
  );
}

const code = `"use client";

import * as TabsPrimitive from "@radix-ui/react-tabs";

const Tabs = TabsPrimitive.Root;

const TabsList = forwardRef((props, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className="inline-flex w-full border-b border-border gap-1"
    {...props}
  />
));

const TabsTrigger = forwardRef((props, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className="px-3 pb-2 border-b-2 border-transparent data-[state=active]:border-accent data-[state=active]:text-foreground ..."
    {...props}
  />
));

const TabsContent = forwardRef((props, ref) => (
  <TabsPrimitive.Content ref={ref} className="mt-4 p-4 ..." {...props} />
));

export function Example() {
  return (
    <Tabs defaultValue="a">
      <TabsList>
        <TabsTrigger value="a">Tab A</TabsTrigger>
        <TabsTrigger value="b">Tab B</TabsTrigger>
        <TabsTrigger value="c">Tab C</TabsTrigger>
      </TabsList>
      <TabsContent value="a">Panel A</TabsContent>
      <TabsContent value="b">Panel B</TabsContent>
      <TabsContent value="c">Panel C</TabsContent>
    </Tabs>
  );
}`;

export default function TabsPage() {
  return (
    <Shell title="Tabs">
      <div className="max-w-5xl space-y-10">
        <SectionHeading
          title="Tabs"
          description="Tabbed interface built on Radix Tabs: a root controls the selected value; list and triggers form the underline-style header; content panels match each value."
        />

        <ComponentPreview
          title="Three panels"
          description="Underline indicator on the active trigger; inactive triggers use muted text. Content areas sit below the list."
          code={code}
        >
          <TabsDemo />
        </ComponentPreview>

        <div>
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-3">
            Compound parts
          </h3>
          <PropsTable
            props={[
              {
                name: "Tabs",
                type: "Root props (Radix)",
                default: "—",
                description: "Optional defaultValue / value / onValueChange for controlled usage.",
              },
              {
                name: "TabsList",
                type: "{ children, className? }",
                default: "—",
                description: "Horizontal tab strip; pairs with TabsTrigger children.",
              },
              {
                name: "TabsTrigger",
                type: "{ value, children, className?, disabled? }",
                default: "—",
                description: "Selects a panel; value must match a TabsContent value.",
              },
              {
                name: "TabsContent",
                type: "{ value, children, className? }",
                default: "—",
                description: "Panel shown when its value is active.",
              },
            ]}
          />
        </div>

        <div className="text-xs font-mono text-muted-foreground p-3 rounded-sm bg-muted/50">
          src/components/ui/Tabs/Tabs.tsx
        </div>
      </div>
    </Shell>
  );
}
