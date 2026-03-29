import { Shell } from "@/components/shell";
import { SectionHeading } from "@/components/token-grid";
import { ComponentPreview, PropsTable } from "@/components/component-preview";
import { cn } from "@/lib/utils";

type BadgeVariant = "default" | "success" | "warning" | "error" | "info";
type BadgeSize = "sm" | "md";

const VARIANTS: BadgeVariant[] = ["default", "success", "warning", "error", "info"];

function variantClasses(variant: BadgeVariant): string {
  switch (variant) {
    case "default":
      return "bg-muted text-foreground";
    case "success":
      return "bg-emerald-500/15 text-emerald-800 border border-emerald-500/30 dark:text-emerald-300 dark:border-emerald-500/25";
    case "warning":
      return "bg-amber-500/15 text-amber-900 border border-amber-500/30 dark:text-amber-200 dark:border-amber-500/25";
    case "error":
      return "bg-red-500/15 text-red-800 border border-red-500/30 dark:text-red-300 dark:border-red-500/25";
    case "info":
      return "bg-sky-500/15 text-sky-900 border border-sky-500/30 dark:text-sky-200 dark:border-sky-500/25";
    default:
      return "";
  }
}

function sizeClasses(size: BadgeSize): string {
  return size === "sm"
    ? "text-xs font-medium px-2 py-0.5"
    : "text-sm font-medium px-2.5 py-1";
}

function BadgeDemo() {
  return (
    <div className="flex flex-col gap-10 w-full max-w-4xl">
      {(["sm", "md"] as const).map((size) => (
        <div key={size} className="space-y-3">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Size: {size}
          </p>
          <div className="flex flex-wrap items-center gap-3">
            {VARIANTS.map((variant) => (
              <span
                key={variant}
                className={cn(
                  "inline-flex items-center rounded-full font-medium tabular-nums",
                  variantClasses(variant),
                  sizeClasses(size),
                )}
              >
                {variant}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

const code = `// Badge is a <span> with variant + size. Styling uses design tokens / SCSS in the app;
// this preview uses Tailwind to approximate pill badges.

<span className="inline-flex items-center rounded-full text-sm font-medium px-2.5 py-1 bg-muted text-foreground">
  default
</span>
<span className="inline-flex items-center rounded-full text-sm font-medium px-2.5 py-1 bg-emerald-500/15 text-emerald-800 border border-emerald-500/30 dark:text-emerald-300">
  success
</span>
// …warning, error, info

// Small: text-xs px-2 py-0.5
// Medium: text-sm px-2.5 py-1`;

export default function BadgePage() {
  return (
    <Shell title="Badge">
      <div className="max-w-5xl space-y-10">
        <SectionHeading
          title="Badge"
          description="Status and label chips rendered as a span. Variants communicate semantic tone; sizes support dense UI and default body scale."
        />

        <ComponentPreview
          title="Variants × sizes"
          description="All five variants in a row for each size (small and medium). Pill shape via rounded-full."
          code={code}
        >
          <BadgeDemo />
        </ComponentPreview>

        <div>
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-3">
            Props
          </h3>
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

        <div className="text-xs font-mono text-muted-foreground p-3 rounded-sm bg-muted/50">
          src/components/ui/Badge/Badge.tsx
        </div>
      </div>
    </Shell>
  );
}
