import { Shell } from "@/components/shell";
import { SectionHeading } from "@/components/token-grid";
import { ComponentPreview, PropsTable, SourcePath, SubsectionHeading } from "@/components/component-preview";
import { InlineCode } from "@ds/InlineCode";

const code = `import { InlineCode } from "@ds/InlineCode";

<p>Use <InlineCode>ThemeProvider</InlineCode> at the root of your app.</p>`;

export default function InlineCodePage() {
  return (
    <Shell title="InlineCode">
      <div className="max-w-5xl space-y-10">
        <SectionHeading
          title="InlineCode"
          description="Monospace code chip for inline references to component names, props, tokens, and file paths."
        />

        <ComponentPreview title="Inline usage" description="Rendered within body text." code={code}>
          <p className="text-sm">
            Use <InlineCode>ThemeProvider</InlineCode> at the root of your app.
            The <InlineCode>variant</InlineCode> prop accepts <InlineCode>{`"default"`}</InlineCode> or <InlineCode>{`"muted"`}</InlineCode>.
          </p>
        </ComponentPreview>

        <div>
          <SubsectionHeading>Props</SubsectionHeading>
          <PropsTable
            props={[
              { name: "children", type: "ReactNode", description: "Code text to display." },
              { name: "className", type: "string", description: "Merged onto the root <code> element." },
            ]}
          />
        </div>

        <SourcePath path="src/components/ui/InlineCode/InlineCode.tsx · src/components/ui/InlineCode/InlineCode.module.scss" />
      </div>
    </Shell>
  );
}
