import { Shell } from "@/components/shell";
import { SectionHeading } from "@/components/token-grid";
import {
  ComponentPreview,
  PropsTable,
  SourcePath,
  SubsectionHeading,
} from "@/components/component-preview";
import { Eyebrow } from "@ds/Eyebrow";
import type { EyebrowSize, EyebrowEmphasis } from "@ds/Eyebrow";

const SIZES: EyebrowSize[] = ["sm", "md"];
const EMPHASES: EyebrowEmphasis[] = ["subtle", "bold"];

const code = `import { Eyebrow } from "@ds/Eyebrow";

// Basic usage — size × emphasis
<Eyebrow size="md" emphasis="subtle">Section Title</Eyebrow>
<Eyebrow size="sm" emphasis="bold">Group Label</Eyebrow>

// As a heading element
<Eyebrow as="h3" size="md" emphasis="bold">Components</Eyebrow>

// Metric annotation — monospace for tabular scanability
<Eyebrow size="sm" emphasis="subtle" metric>Revenue</Eyebrow>
<span className="text-3xl font-semibold">$1.2M</span>`;

export default function EyebrowPage() {
  return (
    <Shell title="Eyebrow">
      <div className="max-w-6xl space-y-10">
        <SectionHeading
          title="Eyebrow"
          description="Uppercase tracked text primitive for section headings, group labels, and metric annotations. Codifies the @include label / label-sm mixin pattern into a composable React component. Two sizes (sm = 10px, md = 12px) and two emphases (subtle = regular weight with wider tracking, bold = medium weight with tighter tracking). Not a replacement for form <label> elements, nav/menu item text, or body text annotations (use TextRow). Polymorphic via the `as` prop."
        />

        {/* ── Size × Emphasis Matrix ─────────────────────────────────── */}
        <ComponentPreview
          title="Size × Emphasis"
          description="Two sizes × two emphases. Subtle uses regular weight (400) with wider tracking (0.05em). Bold uses medium weight (500) with tighter tracking (0.02em) — heavier strokes create more visual air, so tracking compensates."
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
                <div key={size} className="contents">
                  <span className="text-xs font-mono text-muted-foreground">
                    {size}
                  </span>
                  {EMPHASES.map((emphasis) => (
                    <Eyebrow key={`${size}-${emphasis}`} size={size} emphasis={emphasis}>
                      Section Title
                    </Eyebrow>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </ComponentPreview>

        {/* ── Navigation Section Dividers ─────────────────────────────── */}
        <ComponentPreview
          title="Navigation Section Dividers"
          description='Eyebrow as sidebar section labels — the primary use case. Bold emphasis at sm size matches the VerticalNav pattern (medium weight, tighter tracking). Rendered as <h3> for accessible section headings.'
        >
          <div className="flex flex-col gap-1 w-[200px] bg-black/5 dark:bg-white/5 rounded-md p-3">
            <Eyebrow as="h3" size="sm" emphasis="bold" className="px-2 mb-1 opacity-60">
              Foundations
            </Eyebrow>
            <div className="h-7 px-2 flex items-center text-sm text-muted-foreground rounded-sm hover:bg-black/5 dark:hover:bg-white/5">
              Colors
            </div>
            <div className="h-7 px-2 flex items-center text-sm text-muted-foreground rounded-sm hover:bg-black/5 dark:hover:bg-white/5">
              Typography
            </div>
            <div className="h-7 px-2 flex items-center text-sm text-muted-foreground rounded-sm hover:bg-black/5 dark:hover:bg-white/5">
              Spacing
            </div>
            <div className="mt-2 pt-2 border-t border-black/10 dark:border-white/10">
              <Eyebrow as="h3" size="sm" emphasis="bold" className="px-2 mb-1 opacity-60">
                Components
              </Eyebrow>
              <div className="h-7 px-2 flex items-center text-sm text-muted-foreground rounded-sm hover:bg-black/5 dark:hover:bg-white/5">
                Button
              </div>
              <div className="h-7 px-2 flex items-center text-sm text-muted-foreground rounded-sm hover:bg-black/5 dark:hover:bg-white/5">
                Card
              </div>
            </div>
          </div>
        </ComponentPreview>

        {/* ── Menu Group Headings ──────────────────────────────────────── */}
        <ComponentPreview
          title="Menu / Command Group Headings"
          description='Subtle emphasis at md size — matches the @include label pattern used in Menu, Select, and CommandMenu group headings.'
        >
          <div className="w-[240px] bg-black/5 dark:bg-white/5 rounded-md p-1.5">
            <div className="px-2 py-1">
              <Eyebrow size="md" emphasis="subtle">Actions</Eyebrow>
            </div>
            <div className="h-8 px-2 flex items-center text-sm rounded-sm hover:bg-black/5 dark:hover:bg-white/5">
              Edit profile
            </div>
            <div className="h-8 px-2 flex items-center text-sm rounded-sm hover:bg-black/5 dark:hover:bg-white/5">
              Change password
            </div>
            <div className="px-2 py-1 mt-1">
              <Eyebrow size="md" emphasis="subtle">Danger Zone</Eyebrow>
            </div>
            <div className="h-8 px-2 flex items-center text-sm text-red-500 rounded-sm hover:bg-black/5 dark:hover:bg-white/5">
              Delete account
            </div>
          </div>
        </ComponentPreview>

        {/* ── Metric Annotations ──────────────────────────────────────── */}
        <ComponentPreview
          title="Metric Annotations"
          description="Eyebrow above stat values — common in dashboards and case studies. The `metric` prop switches to monospace for tabular scanability across data columns."
        >
          <div className="flex gap-8">
            <div className="flex flex-col gap-1">
              <Eyebrow size="sm" emphasis="subtle" metric>Revenue</Eyebrow>
              <span className="text-3xl font-semibold">$1.2M</span>
            </div>
            <div className="flex flex-col gap-1">
              <Eyebrow size="sm" emphasis="subtle" metric>Conversion</Eyebrow>
              <span className="text-3xl font-semibold">4.8%</span>
            </div>
            <div className="flex flex-col gap-1">
              <Eyebrow size="sm" emphasis="subtle" metric>Users</Eyebrow>
              <span className="text-3xl font-semibold">12.4K</span>
            </div>
          </div>
        </ComponentPreview>

        {/* ── Card Metadata Categories ────────────────────────────────── */}
        <ComponentPreview
          title="Card Metadata Category"
          description="Eyebrow above a card title to categorize the content type. Common pattern in portfolio grids and blog listings."
        >
          <div className="w-[320px] border border-black/10 dark:border-white/10 rounded-lg p-5">
            <Eyebrow size="sm" emphasis="bold" className="mb-2">
              Case Study
            </Eyebrow>
            <h3 className="text-lg font-semibold mb-1">Enterprise Dashboard Redesign</h3>
            <p className="text-sm text-muted-foreground">
              Led the redesign of the analytics platform, improving task completion by 34%.
            </p>
          </div>
        </ComponentPreview>

        {/* ── Polymorphic Rendering ───────────────────────────────────── */}
        <ComponentPreview
          title="Polymorphic Rendering"
          description='Defaults to <span>. Use as="h2"/"h3"/"h4" for accessible section headings, as="dt" for description lists, as="legend" for fieldsets, as="p" or as="div" for block-level contexts.'
        >
          <div className="flex flex-col gap-3">
            <div>
              <Eyebrow as="h3" size="md" emphasis="bold">
                Rendered as h3
              </Eyebrow>
            </div>
            <div>
              <Eyebrow as="p" size="sm" emphasis="subtle">
                Rendered as p
              </Eyebrow>
            </div>
            <div>
              <Eyebrow as="dt" size="md" emphasis="subtle">
                Rendered as dt
              </Eyebrow>
            </div>
            <div>
              <Eyebrow as="div" size="sm" emphasis="bold">
                Rendered as div
              </Eyebrow>
            </div>
          </div>
        </ComponentPreview>

        {/* ── Props ──────────────────────────────────────────────────── */}
        <div>
          <SubsectionHeading>Props</SubsectionHeading>
          <PropsTable
            props={[
              {
                name: "as",
                type: '"span" | "p" | "div" | "dt" | "legend" | "h2" | "h3" | "h4"',
                default: '"span"',
                description:
                  "HTML element to render. Use heading elements for accessible section headings, dt for description lists.",
              },
              {
                name: "size",
                type: '"sm" | "md"',
                default: '"md"',
                description:
                  "sm = 10px (type-2xs, compact leading). md = 12px (type-xs, normal leading).",
              },
              {
                name: "emphasis",
                type: '"subtle" | "bold"',
                default: '"subtle"',
                description:
                  "Subtle = regular weight (400), wider tracking (0.05em). Bold = medium weight (500), tighter tracking (0.02em).",
              },
              {
                name: "metric",
                type: "boolean",
                default: "false",
                description:
                  "Switches to monospace font. Use when the eyebrow labels a statistic, KPI, or data value where tabular alignment aids scanability.",
              },
              {
                name: "children",
                type: "ReactNode",
                description: "Text content. Rendered uppercase via CSS text-transform.",
              },
              {
                name: "className",
                type: "string",
                description:
                  "Merged onto the root element. Use to override color or add opacity.",
              },
            ]}
          />
        </div>

        <SourcePath path="src/components/ui/Eyebrow/Eyebrow.tsx · src/components/ui/Eyebrow/Eyebrow.module.scss" />
      </div>
    </Shell>
  );
}
