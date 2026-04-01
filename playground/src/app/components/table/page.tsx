import { Shell } from "@/components/shell";
import { SectionHeading } from "@/components/token-grid";
import { ComponentPreview, PropsTable, SourcePath, SubsectionHeading } from "@/components/component-preview";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@ds/Table";

const code = `import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@ds/Table";

<Table>
  <TableHeader>
    <TableRow>
      <TableHead>Prop</TableHead>
      <TableHead>Type</TableHead>
      <TableHead>Description</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow>
      <TableCell mono>variant</TableCell>
      <TableCell mono accent>"default" | "muted"</TableCell>
      <TableCell>Background style.</TableCell>
    </TableRow>
  </TableBody>
</Table>`;

export default function TablePage() {
  return (
    <Shell title="Table">
      <div className="max-w-5xl space-y-10">
        <SectionHeading
          title="Table"
          description="Semantic data table with scrollable container, mono/accent cell modifiers, and consistent border styling."
        />

        <ComponentPreview title="Basic table" description="Header with muted background and bordered rows." code={code}>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Default</TableHead>
                <TableHead>Description</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell mono>variant</TableCell>
                <TableCell mono accent>{`"default" | "muted"`}</TableCell>
                <TableCell mono>{`"default"`}</TableCell>
                <TableCell>Background style of the card.</TableCell>
              </TableRow>
              <TableRow>
                <TableCell mono>elevated</TableCell>
                <TableCell mono accent>boolean</TableCell>
                <TableCell mono>false</TableCell>
                <TableCell>Adds a box-shadow.</TableCell>
              </TableRow>
              <TableRow>
                <TableCell mono>interactive</TableCell>
                <TableCell mono accent>boolean</TableCell>
                <TableCell mono>false</TableCell>
                <TableCell>Hover shadow and border change.</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </ComponentPreview>

        <div>
          <SubsectionHeading>Props</SubsectionHeading>
          <PropsTable
            props={[
              { name: "mono", type: "boolean", default: "false", description: "Monospace font for code-like values (TableCell only)." },
              { name: "accent", type: "boolean", default: "false", description: "Accent color for type annotations (TableCell only)." },
            ]}
          />
        </div>

        <SourcePath path="src/components/ui/Table/Table.tsx · src/components/ui/Table/Table.module.scss" />
      </div>
    </Shell>
  );
}
