import type { ButtonHTMLAttributes, ReactNode } from "react";
import { Plus } from "lucide-react";
import { Shell } from "@/components/shell";
import { SectionHeading } from "@/components/token-grid";
import { ComponentPreview, PropsTable } from "@/components/component-preview";
import { cn } from "@/lib/utils";

type DemoVariant = "primary" | "secondary" | "ghost" | "danger";
type DemoSize = "sm" | "md" | "lg";

type DemoButtonProps = {
  variant?: DemoVariant;
  size?: DemoSize;
  iconOnly?: boolean;
  fullWidth?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  children?: ReactNode;
} & ButtonHTMLAttributes<HTMLButtonElement>;

function DemoButton({
  variant = "primary",
  size = "md",
  iconOnly = false,
  fullWidth = false,
  leftIcon,
  rightIcon,
  className,
  children,
  ...props
}: DemoButtonProps) {
  const sizeClass = (() => {
    if (iconOnly) {
      if (size === "sm") return "h-8 w-8 min-w-8 p-0 text-xs";
      if (size === "lg") return "h-12 w-12 min-w-12 p-0 text-base";
      return "h-10 w-10 min-w-10 p-0 text-sm";
    }
    if (size === "sm") return "h-8 px-3 text-xs";
    if (size === "lg") return "h-12 px-6 text-base";
    return "h-10 px-4 text-sm";
  })();

  const variantClass = {
    primary:
      "bg-accent text-accent-foreground hover:brightness-95 active:brightness-[0.88]",
    secondary:
      "bg-transparent text-foreground border border-border hover:bg-muted active:bg-muted/80",
    ghost:
      "bg-transparent text-foreground border border-transparent hover:bg-muted active:bg-muted/80",
    danger:
      "bg-red-600 text-white hover:bg-red-700 active:bg-red-800",
  }[variant];

  return (
    <button
      type="button"
      className={cn(
        "inline-flex shrink-0 items-center justify-center gap-2 font-medium leading-tight rounded-sm whitespace-nowrap transition-[color,background-color,filter] duration-150 select-none font-sans",
        "disabled:opacity-50 disabled:pointer-events-none disabled:cursor-not-allowed",
        "[&[aria-disabled=true]]:opacity-50 [&[aria-disabled=true]]:pointer-events-none [&[aria-disabled=true]]:cursor-not-allowed",
        fullWidth && "w-full",
        sizeClass,
        variantClass,
        className,
      )}
      {...props}
    >
      {leftIcon && <span aria-hidden="true" className="inline-flex shrink-0">{leftIcon}</span>}
      {children}
      {rightIcon && <span aria-hidden="true" className="inline-flex shrink-0">{rightIcon}</span>}
    </button>
  );
}

const importLine = `import { Button } from "@/components/ui/Button/Button";`;

const variantsCode = `${importLine}
import { Plus, ChevronRight } from "lucide-react";

<Button variant="primary">Primary</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="danger">Danger</Button>

<Button leftIcon={<Plus className="size-4" />}>With left icon</Button>
<Button variant="secondary" rightIcon={<ChevronRight className="size-4" />}>
  Next
</Button>`;

const sizesCode = `${importLine}

<Button size="sm">Small</Button>
<Button size="md">Medium</Button>
<Button size="lg">Large</Button>`;

const iconOnlyCode = `${importLine}
import { Plus } from "lucide-react";

<Button size="sm" iconOnly aria-label="Add">
  <Plus className="size-4" />
</Button>
<Button size="md" iconOnly aria-label="Add">
  <Plus className="size-[18px]" />
</Button>
<Button size="lg" iconOnly aria-label="Add">
  <Plus className="size-5" />
</Button>`;

const disabledCode = `${importLine}

<Button disabled>Disabled</Button>
<Button aria-disabled>ARIA disabled</Button>

<Button fullWidth className="max-w-xs">
  Full width
</Button>`;

export default function ButtonPage() {
  return (
    <Shell title="Button">
      <div className="max-w-5xl space-y-10">
        <SectionHeading
          title="Button"
          description="Primary action control for forms and navigation. Variants map to emphasis (primary accent, secondary outline, ghost minimal, danger destructive). Sizes control height and type scale; icon-only mode yields square hit targets. The live site implementation uses SCSS modules from the design system — this page uses Tailwind-only demos for the playground."
        />

        <ComponentPreview
          title="Variants"
          description="Four visual variants: primary (accent fill), secondary (bordered), ghost (no border), danger (destructive)."
          code={variantsCode}
        >
          <div className="flex flex-wrap items-center justify-center gap-3 w-full">
            <DemoButton variant="primary">Primary</DemoButton>
            <DemoButton variant="secondary">Secondary</DemoButton>
            <DemoButton variant="ghost">Ghost</DemoButton>
            <DemoButton variant="danger">Danger</DemoButton>
          </div>
        </ComponentPreview>

        <ComponentPreview
          title="Sizes"
          description="Heights: 32px (sm), 40px (md), 48px (lg), with matching horizontal padding and font size."
          code={sizesCode}
        >
          <div className="flex flex-wrap items-end justify-center gap-3 w-full">
            <DemoButton size="sm">Small</DemoButton>
            <DemoButton size="md">Medium</DemoButton>
            <DemoButton size="lg">Large</DemoButton>
          </div>
        </ComponentPreview>

        <ComponentPreview
          title="Icon-only"
          description="Square buttons with no horizontal padding — set iconOnly and pass an icon as children. Always provide aria-label."
          code={iconOnlyCode}
        >
          <div className="flex flex-wrap items-end justify-center gap-3 w-full">
            <DemoButton size="sm" iconOnly aria-label="Add item">
              <Plus className="size-4" strokeWidth={2} />
            </DemoButton>
            <DemoButton size="md" iconOnly aria-label="Add item">
              <Plus className="size-[18px]" strokeWidth={2} />
            </DemoButton>
            <DemoButton size="lg" iconOnly aria-label="Add item">
              <Plus className="size-5" strokeWidth={2} />
            </DemoButton>
          </div>
        </ComponentPreview>

        <ComponentPreview
          title="Disabled"
          description="Disabled uses native disabled or aria-disabled; both reduce opacity and block interaction."
          code={disabledCode}
        >
          <div className="flex flex-wrap items-center justify-center gap-3 w-full">
            <DemoButton disabled>Disabled</DemoButton>
            <DemoButton aria-disabled>ARIA disabled</DemoButton>
          </div>
        </ComponentPreview>

        <div>
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-3">
            Props
          </h3>
          <PropsTable
            props={[
              {
                name: "variant",
                type: '"primary" | "secondary" | "ghost" | "danger"',
                default: '"primary"',
                description: "Visual style and semantic emphasis.",
              },
              {
                name: "size",
                type: '"sm" | "md" | "lg"',
                default: '"md"',
                description: "Control height, padding, and font size.",
              },
              {
                name: "iconOnly",
                type: "boolean",
                default: "false",
                description: "Square layout with no side padding — use with a single icon child.",
              },
              {
                name: "fullWidth",
                type: "boolean",
                default: "false",
                description: "Stretch to 100% of the container width.",
              },
              {
                name: "leftIcon",
                type: "ReactNode",
                default: "—",
                description: "Optional icon before the label (wrapped in a span, aria-hidden).",
              },
              {
                name: "rightIcon",
                type: "ReactNode",
                default: "—",
                description: "Optional icon after the label (wrapped in a span, aria-hidden).",
              },
              {
                name: "...props",
                type: "ButtonHTMLAttributes<HTMLButtonElement>",
                default: "—",
                description: "Forwarded to the native button (type, onClick, disabled, aria-*, className, etc.).",
              },
            ]}
          />
        </div>

        <div className="text-xs font-mono text-muted-foreground p-3 rounded-sm bg-muted/50">
          src/components/ui/Button/Button.tsx
        </div>
      </div>
    </Shell>
  );
}
