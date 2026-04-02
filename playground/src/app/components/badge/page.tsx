import { Shell } from "@/components/shell";
import { SectionHeading } from "@/components/token-grid";
import { ComponentPreview, PropsTable, SourcePath, SubsectionHeading } from "@/components/component-preview";
import { Badge } from "@ds/Badge";
import type { BadgeAppearance, BadgeEmphasis, BadgeSize } from "@ds/Badge";

const APPEARANCES: BadgeAppearance[] = [
  "neutral",
  "positive",
  "negative",
  "warning",
  "highlight",
  "always-dark",
  "always-light",
  "inverse",
];

const EMPHASES: BadgeEmphasis[] = ["bold", "regular", "minimal", "subtle"];

const SIZES: BadgeSize[] = ["xxs", "xs", "sm", "md", "lg", "xl"];

const UNSUPPORTED: Set<string> = new Set([
  "always-dark:subtle",
  "always-dark:minimal",
  "always-light:subtle",
  "always-light:minimal",
  "inverse:subtle",
  "inverse:minimal",
]);

const code = `import { Badge } from "@ds/Badge";

// Appearance × Emphasis (two-axis model, same as Button)
<Badge appearance="neutral" emphasis="bold">Bold</Badge>
<Badge appearance="positive" emphasis="subtle">Subtle</Badge>
<Badge appearance="negative" emphasis="regular">Regular</Badge>
<Badge appearance="highlight" emphasis="minimal">Minimal</Badge>

// Sizes (xxs through xl)
<Badge size="xxs">XXS</Badge>
<Badge size="md">MD</Badge>
<Badge size="xl">XL</Badge>

// Shape & mono
<Badge shape="squared" mono>CODE</Badge>`;

export default function BadgePage() {
  return (
    <Shell title="Badge">
      <div className="max-w-6xl space-y-10">
        <SectionHeading
          title="Badge"
          description="Status and label pills using the two-axis appearance × emphasis model. Shared vocabulary with Button — appearance controls color intent, emphasis controls visual weight."
        />

        {/* ── Appearance × Emphasis Matrix ─────────────────────────── */}
        <ComponentPreview
          title="Appearance × Emphasis"
          description="Full variant matrix. Rows = emphasis levels (bold → regular → minimal → subtle). Columns = appearance values. always-dark / always-light / inverse only support bold + regular."
          code={code}
        >
          <div className="flex flex-col gap-6 w-full overflow-x-auto">
            {EMPHASES.map((emphasis) => (
              <div key={emphasis} className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  {emphasis}
                </p>
                <div className="flex flex-wrap items-center gap-2">
                  {APPEARANCES.map((appearance) => {
                    const key = `${appearance}:${emphasis}`;
                    if (UNSUPPORTED.has(key)) return null;
                    return (
                      <Badge
                        key={key}
                        appearance={appearance}
                        emphasis={emphasis}
                      >
                        {appearance}
                      </Badge>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </ComponentPreview>

        {/* ── Sizes ────────────────────────────────────────────────── */}
        <ComponentPreview
          title="Sizes"
          description="Six sizes from xxs (12px) to xl (40px). Shown with neutral/subtle defaults."
        >
          <div className="flex flex-wrap items-end gap-3">
            {SIZES.map((size) => (
              <Badge key={size} size={size}>
                {size}
              </Badge>
            ))}
          </div>
        </ComponentPreview>

        {/* ── Shape & Mono ─────────────────────────────────────────── */}
        <ComponentPreview
          title="Shape & Mono"
          description="Pill (default) vs squared. Mono activates monospace uppercase tracking."
        >
          <div className="flex flex-wrap items-center gap-3">
            <Badge shape="pill">pill</Badge>
            <Badge shape="squared">squared</Badge>
            <Badge shape="squared" mono>MONO</Badge>
            <Badge shape="squared" mono appearance="highlight" emphasis="bold">v2.1</Badge>
            <Badge shape="squared" mono appearance="positive" emphasis="subtle">LIVE</Badge>
            <Badge shape="squared" mono appearance="negative" emphasis="bold">ERROR</Badge>
          </div>
        </ComponentPreview>

        {/* ── Props ─────────────────────────────────────────────────── */}
        <div>
          <SubsectionHeading>Props</SubsectionHeading>
          <PropsTable
            props={[
              {
                name: "appearance",
                type: '"neutral" | "highlight" | "positive" | "negative" | "warning" | "inverse" | "always-dark" | "always-light"',
                default: '"neutral"',
                description: "Color intent / semantic category. Mirrors Button appearances.",
              },
              {
                name: "emphasis",
                type: '"bold" | "regular" | "subtle" | "minimal"',
                default: '"subtle"',
                description: "Visual weight. Bold = solid fill, Regular = neutral border, Subtle = tinted fill, Minimal = neutral gray fill.",
              },
              {
                name: "size",
                type: '"xxs" | "xs" | "sm" | "md" | "lg" | "xl"',
                default: '"md"',
                description: "Height and typography scale.",
              },
              {
                name: "shape",
                type: '"pill" | "squared"',
                default: '"pill"',
                description: "Border-radius style: full rounding or sm radius.",
              },
              {
                name: "mono",
                type: "boolean",
                default: "false",
                description: "Monospace font, uppercase, wide letter-spacing.",
              },
              {
                name: "className",
                type: "string",
                description: "Merged onto the root span.",
              },
              {
                name: "children",
                type: "ReactNode",
                description: "Label text or content inside the badge.",
              },
            ]}
          />
        </div>

        <SourcePath path="src/components/ui/Badge/Badge.tsx · src/components/ui/Badge/Badge.module.scss" />
      </div>
    </Shell>
  );
}
