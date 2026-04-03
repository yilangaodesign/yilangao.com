import { Shell } from "@/components/shell";
import { SectionHeading } from "@/components/token-grid";
import {
  ComponentPreview,
  PropsTable,
  SourcePath,
  SubsectionHeading,
} from "@/components/component-preview";
import { TextRow } from "@ds/TextRow";
import type { TextRowSize, TextRowEmphasis } from "@ds/TextRow";
import Info from "lucide-react/dist/esm/icons/info";
import Star from "lucide-react/dist/esm/icons/star";
import ChevronRight from "lucide-react/dist/esm/icons/chevron-right";

const SIZES: TextRowSize[] = ["xxs", "xs", "sm", "md", "lg", "xl"];
const EMPHASES: TextRowEmphasis[] = ["subtle", "bold"];

const code = `import { TextRow } from "@ds/TextRow";

// Basic usage — size × emphasis
<TextRow size="md" emphasis="subtle">Subtle text</TextRow>
<TextRow size="md" emphasis="bold">Bold text</TextRow>

// With secondary text
<TextRow size="lg" secondaryText="Optional">Field name</TextRow>

// With leading icon
<TextRow size="md" leadingContent={<StarIcon />}>Starred</TextRow>

// With trailing content
<TextRow size="md" trailingSecondaryText="⌘K" trailingContent={<ChevronRight />}>
  Search
</TextRow>

// As a form label
<TextRow as="label" htmlFor="email" emphasis="bold" size="sm">
  Email address
</TextRow>`;

export default function TextRowPage() {
  return (
    <Shell title="TextRow">
      <div className="max-w-6xl space-y-10">
        <SectionHeading
          title="TextRow"
          description="A composed inline text primitive — a horizontal row of text parts with optional leading/trailing slots, secondary text, and tooltip triggers. Use for standalone metadata annotations, key-value pairs, card metadata, and composed text lines outside interactive or form components. Not a replacement for eyebrow/section headings (uppercase, tracked), form field labels (coupled to Input size systems), or nav/menu item text (state-dependent transitions). Polymorphic rendering via the `as` prop. Inspired by One GS Label."
        />

        {/* ── Size × Emphasis Matrix ─────────────────────────────────── */}
        <ComponentPreview
          title="Size × Emphasis"
          description="Two columns: subtle (regular weight 400) vs bold (medium weight 500). Six sizes from xxs (10px) to xl (20px), mapping 1:1 to the shared type scale."
          code={code}
        >
          <div className="flex flex-col gap-5 w-full">
            <div className="grid grid-cols-[80px_1fr_1fr] gap-x-6 gap-y-4 items-center">
              <div />
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                subtle
              </p>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                bold
              </p>
              {SIZES.map((size) => (
                <>
                  <span
                    key={`${size}-label`}
                    className="text-xs font-mono text-muted-foreground"
                  >
                    {size}
                  </span>
                  {EMPHASES.map((emphasis) => (
                    <TextRow key={`${size}-${emphasis}`} size={size} emphasis={emphasis}>
                      TextRow
                    </TextRow>
                  ))}
                </>
              ))}
            </div>
          </div>
        </ComponentPreview>

        {/* ── Leading Content ──────────────────────────────────────── */}
        <ComponentPreview
          title="Leading Content"
          description="An icon or visual element before the text. Icon sizing automatically matches the line-height."
        >
          <div className="flex flex-col gap-3">
            {(["sm", "md", "lg"] as TextRowSize[]).map((size) => (
              <TextRow key={size} size={size} emphasis="bold" leadingContent={<Star />}>
                Starred item
              </TextRow>
            ))}
          </div>
        </ComponentPreview>

        {/* ── Secondary Text ───────────────────────────────────────── */}
        <ComponentPreview
          title="Secondary Text"
          description="Subtle secondary text rendered inline after the primary text. One step smaller than the primary type size, clamped at xxs."
        >
          <div className="flex flex-col gap-3">
            <TextRow size="xl" emphasis="bold" secondaryText="Required">
              Full name
            </TextRow>
            <TextRow size="md" emphasis="subtle" secondaryText="Optional">
              Phone number
            </TextRow>
            <TextRow size="sm" emphasis="bold" secondaryText="Max 500">
              Description
            </TextRow>
          </div>
        </ComponentPreview>

        {/* ── Trailing Content ─────────────────────────────────────── */}
        <ComponentPreview
          title="Trailing Content"
          description="Trailing secondary text and trailing content slot are pushed to the right. Useful for keyboard shortcuts, counts, or action icons."
        >
          <div className="flex flex-col gap-3 w-[320px]">
            <TextRow size="md" emphasis="bold" trailingSecondaryText="⌘K">
              Search
            </TextRow>
            <TextRow
              size="md"
              emphasis="subtle"
              trailingSecondaryText="12 items"
              trailingContent={<ChevronRight />}
            >
              Projects
            </TextRow>
            <TextRow size="sm" emphasis="bold" trailingContent={<ChevronRight />}>
              View all
            </TextRow>
          </div>
        </ComponentPreview>

        {/* ── Info Tooltip Slot ─────────────────────────────────────── */}
        <ComponentPreview
          title="Info Tooltip Slot"
          description="An inline slot for a tooltip trigger icon (typically an info icon). Consumers compose the Tooltip component into this slot."
        >
          <div className="flex flex-col gap-3">
            <TextRow size="md" emphasis="bold" infoTooltip={<Info />}>
              API Key
            </TextRow>
            <TextRow size="sm" emphasis="subtle" infoTooltip={<Info />} secondaryText="SHA-256">
              Fingerprint
            </TextRow>
          </div>
        </ComponentPreview>

        {/* ── Polymorphic `as` Prop ────────────────────────────────── */}
        <ComponentPreview
          title="Polymorphic Rendering"
          description='Defaults to <span>. Use as="label" with htmlFor for form fields, as="dt" for description lists, as="legend" for fieldsets, as="p" for standalone text.'
        >
          <div className="flex flex-col gap-3">
            <TextRow as="label" htmlFor="demo-input" size="sm" emphasis="bold">
              Email address
            </TextRow>
            <TextRow as="p" size="lg" emphasis="subtle">
              Section heading rendered as a paragraph
            </TextRow>
            <TextRow as="dt" size="xs" emphasis="bold">
              Definition term
            </TextRow>
          </div>
        </ComponentPreview>

        {/* ── Full Composition ──────────────────────────────────────── */}
        <ComponentPreview
          title="Full Composition"
          description="All slots active simultaneously: leading icon + primary text + info tooltip + secondary text + trailing secondary text + trailing icon."
        >
          <div className="w-[400px]">
            <TextRow
              size="lg"
              emphasis="bold"
              leadingContent={<Star />}
              infoTooltip={<Info />}
              secondaryText="Required"
              trailingSecondaryText="3 / 10"
              trailingContent={<ChevronRight />}
            >
              Workspace name
            </TextRow>
          </div>
        </ComponentPreview>

        {/* ── Props ──────────────────────────────────────────────────── */}
        <div>
          <SubsectionHeading>Props</SubsectionHeading>
          <PropsTable
            props={[
              {
                name: "as",
                type: '"span" | "label" | "legend" | "p" | "dt"',
                default: '"span"',
                description:
                  "HTML element to render. Use 'label' with htmlFor for form fields.",
              },
              {
                name: "size",
                type: '"xxs" | "xs" | "sm" | "md" | "lg" | "xl"',
                default: '"md"',
                description: "Typography scale step. Maps 1:1 to the shared type token scale.",
              },
              {
                name: "emphasis",
                type: '"subtle" | "bold"',
                default: '"subtle"',
                description:
                  "Font weight. Subtle = regular (400), Bold = medium (500).",
              },
              {
                name: "htmlFor",
                type: "string",
                description:
                  'Associates with a form control. Only meaningful when as="label".',
              },
              {
                name: "children",
                type: "ReactNode",
                description: "Primary text content.",
              },
              {
                name: "secondaryText",
                type: "string",
                description:
                  "Inline secondary text after the primary, one type step smaller in subtle color.",
              },
              {
                name: "leadingContent",
                type: "ReactNode",
                description:
                  "Icon or visual element before the text. Auto-sized to match line-height.",
              },
              {
                name: "trailingContent",
                type: "ReactNode",
                description:
                  "Icon or element at the trailing edge. Auto-sized to match line-height.",
              },
              {
                name: "trailingSecondaryText",
                type: "string",
                description:
                  "Subtle text at the trailing edge, before trailingContent.",
              },
              {
                name: "infoTooltip",
                type: "ReactNode",
                description:
                  "Inline slot for a tooltip trigger icon (e.g. Info icon composed with Tooltip).",
              },
              {
                name: "className",
                type: "string",
                description: "Merged onto the root element.",
              },
            ]}
          />
        </div>

        <SourcePath path="src/components/ui/TextRow/TextRow.tsx · src/components/ui/TextRow/TextRow.module.scss" />
      </div>
    </Shell>
  );
}
