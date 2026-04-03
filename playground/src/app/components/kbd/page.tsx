import { Shell } from "@/components/shell";
import { SectionHeading } from "@/components/token-grid";
import { ComponentPreview, PropsTable, SourcePath, SubsectionHeading } from "@/components/component-preview";
import { Kbd } from "@ds/Kbd";
import type { KbdSize } from "@ds/Kbd";

const variantsCode = `import { Kbd } from "@ds/Kbd";

<Kbd>⌘K</Kbd>
<Kbd bordered>⌘K</Kbd>
<p>Press <Kbd bordered>Esc</Kbd> to close.</p>`;

const sizesCode = `<Kbd size="xs" bordered>⌘K</Kbd>
<Kbd size="sm" bordered>⌘K</Kbd>
<Kbd size="md" bordered>⌘K</Kbd>
<Kbd size="lg" bordered>⌘K</Kbd>
<Kbd size="xl" bordered>⌘K</Kbd>`;

const SIZES: KbdSize[] = ["xs", "sm", "md", "lg", "xl"];

const SIZE_DOCS: Record<KbdSize, { font: string; lh: string; py: string; px: string; radius: string }> = {
  xs: { font: "2xs (10)", lh: "12", py: "1", px: "0.25x (2)", radius: "xs (2)" },
  sm: { font: "2xs (10)", lh: "14", py: "2", px: "0.5x (4)", radius: "xs (2)" },
  md: { font: "xs (12)", lh: "16", py: "2", px: "0.5x (4)", radius: "sm (4)" },
  lg: { font: "sm (14)", lh: "18", py: "2", px: "0.75x (6)", radius: "sm (4)" },
  xl: { font: "sm (14)", lh: "20", py: "2", px: "0.75x (6)", radius: "sm (4)" },
};

export default function KbdPage() {
  return (
    <Shell title="Kbd">
      <div className="max-w-5xl space-y-10">
        <SectionHeading
          title="Kbd"
          description="Keyboard shortcut chip for displaying key combinations inline with text. Five sizes map 1:1 to the Input/Button size scale so Kbd can be composed as a trailing shortcut hint."
        />

        <ComponentPreview title="Variants" description="Minimal (default) and bordered styles." code={variantsCode}>
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

        <ComponentPreview title="Sizes" description="Each size is one type step below the corresponding Input/Button content font. Bordered height fits within the host line-height." code={sizesCode}>
          <div className="space-y-4 w-full">
            {SIZES.map((s) => (
              <div key={s} className="flex items-center gap-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-3 w-40">
                  <Kbd size={s}>⌘K</Kbd>
                  <Kbd size={s} bordered>⌘K</Kbd>
                </div>
                <div className="font-mono space-x-3">
                  <span>{s}</span>
                  <span>font: {SIZE_DOCS[s].font}</span>
                  <span>lh: {SIZE_DOCS[s].lh}</span>
                  <span>py: {SIZE_DOCS[s].py}</span>
                  <span>px: {SIZE_DOCS[s].px}</span>
                  <span>radius: {SIZE_DOCS[s].radius}</span>
                </div>
              </div>
            ))}
          </div>
        </ComponentPreview>

        <div>
          <SubsectionHeading>Props</SubsectionHeading>
          <PropsTable
            props={[
              { name: "size", type: '"xs" | "sm" | "md" | "lg" | "xl"', default: '"xs"', description: "Maps to Input/Button size scale. Font is one type step below the host content font at each size." },
              { name: "bordered", type: "boolean", default: "false", description: "Adds a visible border, border-radius (size-responsive), and reduced opacity." },
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
