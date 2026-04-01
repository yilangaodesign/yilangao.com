import { Shell } from "@/components/shell";
import { SectionHeading } from "@/components/token-grid";
import { ComponentPreview, PropsTable, SourcePath, SubsectionHeading } from "@/components/component-preview";
import { Kbd } from "@ds/Kbd";

const code = `import { Kbd } from "@ds/Kbd";

<Kbd>⌘K</Kbd>
<Kbd bordered>⌘K</Kbd>
<p>Press <Kbd bordered>Esc</Kbd> to close.</p>`;

export default function KbdPage() {
  return (
    <Shell title="Kbd">
      <div className="max-w-5xl space-y-10">
        <SectionHeading
          title="Kbd"
          description="Keyboard shortcut chip for displaying key combinations inline with text. Supports a minimal and bordered variant."
        />

        <ComponentPreview title="Variants" description="Minimal (default) and bordered styles." code={code}>
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-2 text-sm">
              Minimal: <Kbd>⌘K</Kbd>
            </span>
            <span className="flex items-center gap-2 text-sm">
              Bordered: <Kbd bordered>⌘K</Kbd>
            </span>
            <span className="flex items-center gap-2 text-sm">
              Inline: Press <Kbd bordered>Esc</Kbd> to close
            </span>
          </div>
        </ComponentPreview>

        <div>
          <SubsectionHeading>Props</SubsectionHeading>
          <PropsTable
            props={[
              { name: "bordered", type: "boolean", default: "false", description: "Adds a visible border and border-radius." },
              { name: "children", type: "ReactNode", description: "Key label text." },
              { name: "className", type: "string", description: "Merged onto the root <kbd> element." },
            ]}
          />
        </div>

        <SourcePath path="src/components/ui/Kbd/Kbd.tsx · src/components/ui/Kbd/Kbd.module.scss" />
      </div>
    </Shell>
  );
}
