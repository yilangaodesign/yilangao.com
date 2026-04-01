import { Shell } from "@/components/shell";
import { SectionHeading } from "@/components/token-grid";
import { ComponentPreview, PropsTable, SourcePath, SubsectionHeading } from "@/components/component-preview";
import { DescriptionList, DescriptionItem } from "@ds/DescriptionList";
import { InlineCode } from "@ds/InlineCode";

const code = `import { DescriptionList, DescriptionItem } from "@ds/DescriptionList";

<DescriptionList>
  <DescriptionItem label="Origin">Custom</DescriptionItem>
  <DescriptionItem label="Source"><InlineCode>src/components/</InlineCode></DescriptionItem>
  <DescriptionItem label="Created">March 15, 2026</DescriptionItem>
</DescriptionList>`;

export default function DescriptionListPage() {
  return (
    <Shell title="DescriptionList">
      <div className="max-w-5xl space-y-10">
        <SectionHeading
          title="DescriptionList"
          description="Key-value metadata rows using semantic <dl> markup. Fixed-width mono labels with flexible value column."
        />

        <ComponentPreview title="Basic usage" description="Five metadata rows with mixed content types." code={code}>
          <div className="w-full max-w-md">
            <DescriptionList>
              <DescriptionItem label="Origin">Custom component</DescriptionItem>
              <DescriptionItem label="Source"><InlineCode>src/components/ui/Badge</InlineCode></DescriptionItem>
              <DescriptionItem label="Type">Component</DescriptionItem>
              <DescriptionItem label="Created">March 15, 2026</DescriptionItem>
              <DescriptionItem label="Archived">April 1, 2026</DescriptionItem>
            </DescriptionList>
          </div>
        </ComponentPreview>

        <div>
          <SubsectionHeading>Props</SubsectionHeading>
          <PropsTable
            props={[
              { name: "label", type: "string", description: "Fixed-width label displayed in mono uppercase (DescriptionItem only)." },
              { name: "children", type: "ReactNode", description: "Value content — can include InlineCode, links, etc." },
              { name: "className", type: "string", description: "Merged onto the root element." },
            ]}
          />
        </div>

        <SourcePath path="src/components/ui/DescriptionList/DescriptionList.tsx · src/components/ui/DescriptionList/DescriptionList.module.scss" />
      </div>
    </Shell>
  );
}
