"use client";

import { Shell } from "@/components/shell";
import { SectionHeading } from "@/components/token-grid";
import { ComponentPreview, PropsTable, SourcePath, SubsectionHeading} from "@/components/component-preview";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@ds/Tabs";

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

function DisabledTabDemo() {
  return (
    <div className="w-full max-w-xl">
      <Tabs defaultValue="first" className="w-full">
        <TabsList aria-label="Disabled tab example">
          <TabsTrigger value="first">Active</TabsTrigger>
          <TabsTrigger value="second" disabled>Disabled</TabsTrigger>
          <TabsTrigger value="third">Another</TabsTrigger>
        </TabsList>
        <TabsContent value="first">
          This tab is active. The middle tab is disabled and cannot be selected.
        </TabsContent>
        <TabsContent value="third">
          Third panel content.
        </TabsContent>
      </Tabs>
    </div>
  );
}

const code = `import { Tabs, TabsList, TabsTrigger, TabsContent } from "@ds/Tabs";

<Tabs defaultValue="overview">
  <TabsList>
    <TabsTrigger value="overview">Overview</TabsTrigger>
    <TabsTrigger value="details">Details</TabsTrigger>
    <TabsTrigger value="activity">Activity</TabsTrigger>
  </TabsList>
  <TabsContent value="overview">Panel A</TabsContent>
  <TabsContent value="details">Panel B</TabsContent>
  <TabsContent value="activity">Panel C</TabsContent>
</Tabs>`;

const disabledCode = `<Tabs defaultValue="first">
  <TabsList>
    <TabsTrigger value="first">Active</TabsTrigger>
    <TabsTrigger value="second" disabled>Disabled</TabsTrigger>
    <TabsTrigger value="third">Another</TabsTrigger>
  </TabsList>
  <TabsContent value="first">Content</TabsContent>
  <TabsContent value="third">Content</TabsContent>
</Tabs>`;

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

        <ComponentPreview
          title="Disabled tab"
          description="Individual triggers can be disabled. Disabled triggers are not focusable and show reduced opacity."
          code={disabledCode}
        >
          <DisabledTabDemo />
        </ComponentPreview>

        <div>
          <SubsectionHeading>Compound parts</SubsectionHeading>
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

        <SourcePath path="src/components/ui/Tabs/Tabs.tsx · src/components/ui/Tabs/Tabs.module.scss" />
      </div>
    </Shell>
  );
}
