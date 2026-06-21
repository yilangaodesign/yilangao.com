import ChevronLeft from "lucide-react/dist/esm/icons/chevron-left";
import ChevronRight from "lucide-react/dist/esm/icons/chevron-right";
import Pencil from "lucide-react/dist/esm/icons/pencil";
import Copy from "lucide-react/dist/esm/icons/copy";
import Trash2 from "lucide-react/dist/esm/icons/trash-2";
import { Shell } from "@/components/shell";
import { SectionHeading } from "@/components/token-grid";
import {
  ComponentPreview,
  PropsTable,
  SourcePath,
  SubsectionHeading,
} from "@/components/component-preview";
import ScrollSpy from "@/components/scroll-spy";
import { Button } from "@ds/Button";
import { ButtonGroup } from "@ds/ButtonGroup";
import type { ButtonGroupSpacing } from "@ds/ButtonGroup";

const scrollSpySections = [
  { id: "orientation", label: "Orientation" },
  { id: "alignment", label: "Alignment" },
  { id: "spacing", label: "Spacing" },
  { id: "equal-width", label: "Equal Width" },
  { id: "wrap", label: "Wrap" },
  { id: "props", label: "Props" },
];

const SPACINGS: ButtonGroupSpacing[] = ["compact", "default", "relaxed"];

export default function ButtonGroupPage() {
  return (
    <Shell title="ButtonGroup">
      <ScrollSpy sections={scrollSpySections} />
      <div className="max-w-5xl space-y-10">
        <SectionHeading
          title="ButtonGroup"
          description="Layout primitive that arranges several independent Button actions in a row or column with consistent, token-based spacing. The buttons stay visually separate — it never joins or merges them (that is ButtonSelect's job). It owns the §1.3 minimum-gap contract, so a group can never under-space its buttons."
        />

        {/* 1. Orientation */}
        <section id="orientation">
          <ComponentPreview
            title="Orientation"
            description="Lay the group out as a horizontal row (default) or a vertical stack. The container fills its width; use a constrained wrapper for narrow stacks."
            code={`<ButtonGroup aria-label="Pagination">
  <Button emphasis="regular" leadingIcon={<ChevronLeft />}>Previous</Button>
  <Button emphasis="regular" trailingIcon={<ChevronRight />}>Next</Button>
</ButtonGroup>

<ButtonGroup orientation="vertical" aria-label="Row actions">
  <Button emphasis="regular" leadingIcon={<Pencil />}>Edit</Button>
  <Button emphasis="regular" leadingIcon={<Copy />}>Duplicate</Button>
  <Button emphasis="regular" appearance="negative" leadingIcon={<Trash2 />}>Delete</Button>
</ButtonGroup>`}
          >
            <div className="w-full flex flex-col gap-8 items-center">
              <ButtonGroup aria-label="Pagination" align="center">
                <Button emphasis="regular" leadingIcon={<ChevronLeft />}>
                  Previous
                </Button>
                <Button emphasis="regular" trailingIcon={<ChevronRight />}>
                  Next
                </Button>
              </ButtonGroup>

              <div className="w-full max-w-[200px]">
                <ButtonGroup orientation="vertical" aria-label="Row actions">
                  <Button emphasis="regular" leadingIcon={<Pencil />}>
                    Edit
                  </Button>
                  <Button emphasis="regular" leadingIcon={<Copy />}>
                    Duplicate
                  </Button>
                  <Button
                    emphasis="regular"
                    appearance="negative"
                    leadingIcon={<Trash2 />}
                  >
                    Delete
                  </Button>
                </ButtonGroup>
              </div>
            </div>
          </ComponentPreview>
        </section>

        {/* 2. Alignment */}
        <section id="alignment">
          <ComponentPreview
            title="Alignment"
            description="align positions the buttons along the row via justify-content. start (default) for toolbars, end for dialog/footer actions, center, or between to spread."
            code={`<ButtonGroup align="end" aria-label="Dialog actions">
  <Button emphasis="regular">Cancel</Button>
  <Button appearance="highlight">Save changes</Button>
</ButtonGroup>`}
          >
            <div className="w-full space-y-4">
              {(["start", "center", "end", "between"] as const).map((a) => (
                <div key={a} className="space-y-1">
                  <p className="text-xs text-muted-foreground font-mono">
                    align=&quot;{a}&quot;
                  </p>
                  <div className="w-full border border-dashed border-[var(--portfolio-border-subtle)] p-3">
                    <ButtonGroup align={a} aria-label={`Actions ${a}`}>
                      <Button emphasis="regular">Cancel</Button>
                      <Button appearance="highlight">Save changes</Button>
                    </ButtonGroup>
                  </div>
                </div>
              ))}
            </div>
          </ComponentPreview>
        </section>

        {/* 3. Spacing */}
        <section id="spacing">
          <ComponentPreview
            title="Spacing"
            description="Three semantic spacing levels. The gap is near-constant across button sizes (grouping is a proximity concern, not a size concern). default = 8px is the §1.3 floor; compact = 4px is a deliberate dense opt-in below it. Set size to match the buttons inside — only size='xl' opens the gap up one step (8 / 12 / 16)."
            code={`{/* standard tier (xs–lg) */}
<ButtonGroup size="md" spacing="compact">...</ButtonGroup>  {/* 4px  */}
<ButtonGroup size="md" spacing="default">...</ButtonGroup>  {/* 8px  */}
<ButtonGroup size="md" spacing="relaxed">...</ButtonGroup>  {/* 12px */}

{/* xl tier — one step up */}
<ButtonGroup size="xl" spacing="default">...</ButtonGroup>  {/* 12px */}`}
          >
            <div className="w-full space-y-6">
              <div className="space-y-3">
                <p className="text-xs text-muted-foreground font-medium">
                  Standard tier (xs–lg) — 4 / 8 / 12
                </p>
                {SPACINGS.map((sp) => (
                  <div key={sp} className="flex items-center gap-4">
                    <span className="text-xs text-muted-foreground w-16 font-mono">
                      {sp}
                    </span>
                    <ButtonGroup size="sm" spacing={sp} aria-label={`Spacing ${sp}`}>
                      <Button size="sm" emphasis="regular">
                        One
                      </Button>
                      <Button size="sm" emphasis="regular">
                        Two
                      </Button>
                      <Button size="sm" emphasis="regular">
                        Three
                      </Button>
                    </ButtonGroup>
                  </div>
                ))}
              </div>

              <div className="space-y-3">
                <p className="text-xs text-muted-foreground font-medium">
                  xl tier — 8 / 12 / 16
                </p>
                {SPACINGS.map((sp) => (
                  <div key={sp} className="flex items-center gap-4">
                    <span className="text-xs text-muted-foreground w-16 font-mono">
                      {sp}
                    </span>
                    <ButtonGroup size="xl" spacing={sp} aria-label={`XL spacing ${sp}`}>
                      <Button size="xl" emphasis="regular">
                        One
                      </Button>
                      <Button size="xl" emphasis="regular">
                        Two
                      </Button>
                    </ButtonGroup>
                  </div>
                ))}
              </div>
            </div>
          </ComponentPreview>
        </section>

        {/* 4. Equal Width */}
        <section id="equal-width">
          <ComponentPreview
            title="Equal Width"
            description="equalWidth stretches children to fill the track in equal shares (horizontal) or full width (vertical) — the stacked mobile-CTA pattern. align is a no-op when equalWidth is set, since the buttons leave no free space."
            code={`<ButtonGroup equalWidth aria-label="Billing period">
  <Button emphasis="regular">Monthly</Button>
  <Button appearance="highlight">Annual</Button>
</ButtonGroup>

<ButtonGroup orientation="vertical" equalWidth aria-label="Get started">
  <Button appearance="highlight">Create account</Button>
  <Button emphasis="regular">Continue as guest</Button>
</ButtonGroup>`}
          >
            <div className="w-full max-w-md mx-auto space-y-6">
              <ButtonGroup equalWidth aria-label="Billing period">
                <Button emphasis="regular">Monthly</Button>
                <Button appearance="highlight">Annual</Button>
              </ButtonGroup>

              <ButtonGroup
                orientation="vertical"
                equalWidth
                aria-label="Get started"
              >
                <Button appearance="highlight">Create account</Button>
                <Button emphasis="regular">Continue as guest</Button>
              </ButtonGroup>
            </div>
          </ComponentPreview>
        </section>

        {/* 5. Wrap */}
        <section id="wrap">
          <ComponentPreview
            title="Wrap"
            description="wrap lets a long row of actions flow onto multiple lines instead of overflowing. The same vertical and horizontal gap applies between wrapped rows."
            code={`<ButtonGroup wrap aria-label="Filters">
  <Button size="sm" emphasis="regular">All</Button>
  <Button size="sm" emphasis="regular">Active</Button>
  {/* ...more */}
</ButtonGroup>`}
          >
            <div className="w-full max-w-sm mx-auto border border-dashed border-[var(--portfolio-border-subtle)] p-3">
              <ButtonGroup wrap spacing="compact" size="sm" aria-label="Filters">
                {["All", "Active", "Archived", "Draft", "Pending", "Flagged"].map(
                  (label) => (
                    <Button key={label} size="sm" emphasis="regular">
                      {label}
                    </Button>
                  ),
                )}
              </ButtonGroup>
            </div>
          </ComponentPreview>
        </section>

        {/* 6. Props */}
        <section id="props">
          <SubsectionHeading>Props</SubsectionHeading>
          <PropsTable
            props={[
              {
                name: "orientation",
                type: '"horizontal" | "vertical"',
                default: '"horizontal"',
                description:
                  "Lay the buttons out in a row or a column.",
              },
              {
                name: "align",
                type: '"start" | "center" | "end" | "between"',
                default: '"start"',
                description:
                  "Main-axis distribution (justify-content). Use end for dialog/footer actions. No-op when equalWidth is set.",
              },
              {
                name: "spacing",
                type: '"compact" | "default" | "relaxed"',
                default: '"default"',
                description:
                  "Gap between buttons. Standard tier: 4 / 8 / 12px (default 8px is the §1.3 floor; compact 4px is a deliberate dense opt-in). xl tier (size='xl'): 8 / 12 / 16px.",
              },
              {
                name: "size",
                type: '"xs" | "sm" | "md" | "lg" | "xl"',
                default: "—",
                description:
                  "Set to match the buttons inside. Does NOT resize children — it only tunes the gap, and only diverges at xl (xs–lg are identical).",
              },
              {
                name: "equalWidth",
                type: "boolean",
                default: "false",
                description:
                  "Stretch children to equal widths (horizontal) or full width (vertical). The stacked mobile-CTA pattern.",
              },
              {
                name: "wrap",
                type: "boolean",
                default: "false",
                description: "Allow the row to wrap onto multiple lines on overflow.",
              },
              {
                name: "children",
                type: "ReactNode",
                default: "—",
                description:
                  "Must be direct <Button> elements. equalWidth and wrap target direct children, so wrapping a Button (e.g. in a Tooltip span) breaks them.",
              },
              {
                name: "...props",
                type: "HTMLAttributes<HTMLDivElement>",
                default: "—",
                description:
                  "Forwarded to the container div (role='group' is set automatically; pass aria-label, className, etc.).",
              },
            ]}
          />
        </section>

        <SourcePath path="src/components/ui/ButtonGroup/ButtonGroup.tsx · src/components/ui/ButtonGroup/ButtonGroup.module.scss" />
      </div>
    </Shell>
  );
}
