import { Shell } from "@/components/shell";
import { SectionHeading } from "@/components/token-grid";
import { ComponentPreview, PropsTable, SourcePath, SubsectionHeading} from "@/components/component-preview";
import { Badge } from "@ds/Badge";
import type { BadgeVariant, BadgeSize } from "@ds/Badge";

const VARIANTS: BadgeVariant[] = ["default", "success", "warning", "error", "info"];
const SIZES: BadgeSize[] = ["sm", "md"];

const code = `import { Badge } from "@ds/Badge";

<Badge variant="default">default</Badge>
<Badge variant="success">success</Badge>
<Badge variant="warning">warning</Badge>
<Badge variant="error">error</Badge>
<Badge variant="info">info</Badge>

<Badge size="sm">Small</Badge>
<Badge size="md">Medium</Badge>`;

export default function BadgePage() {
  return (
    <Shell title="Badge">
      <div className="max-w-5xl space-y-10">
        <SectionHeading
          title="Badge"
          description="Status and label chips rendered as a span. Variants communicate semantic tone; sizes support dense UI and default body scale."
        />

        <ComponentPreview
          title="Variants × Sizes"
          description="All five variants at each size. Pill shape via SCSS border-radius token."
          code={code}
        >
          <div className="flex flex-col gap-10 w-full max-w-4xl">
            {SIZES.map((size) => (
              <div key={size} className="space-y-3">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Size: {size}
                </p>
                <div className="flex flex-wrap items-center gap-3">
                  {VARIANTS.map((variant) => (
                    <Badge key={variant} variant={variant} size={size}>
                      {variant}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </ComponentPreview>

        <div>
          <SubsectionHeading>Props</SubsectionHeading>
          <PropsTable
            props={[
              {
                name: "variant",
                type: '"default" | "success" | "warning" | "error" | "info"',
                default: '"default"',
                description: "Semantic tone for background and text color.",
              },
              {
                name: "size",
                type: '"sm" | "md"',
                default: '"md"',
                description: "Typography and horizontal padding scale.",
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
