import type { ButtonHTMLAttributes, ReactNode } from "react";
import { Plus, ChevronRight, ArrowRight, Download, Keyboard } from "lucide-react";
import { Shell } from "@/components/shell";
import { SectionHeading } from "@/components/token-grid";
import { ComponentPreview, PropsTable } from "@/components/component-preview";
import { cn } from "@/lib/utils";
import ScrollSpy from "@/components/scroll-spy";

type Appearance =
  | "neutral"
  | "highlight"
  | "positive"
  | "negative"
  | "inverse"
  | "always-dark"
  | "always-light";

type Emphasis = "bold" | "regular" | "subtle" | "minimal";
type Size = "xs" | "sm" | "lg" | "xl";

const SIZE_META: Record<
  Size,
  {
    height: string;
    px: string;
    py: string;
    iconSize: string;
    iconPad: string;
    fontSize: string;
    heightToken: string;
    pxToken: string;
    pyToken: string;
  }
> = {
  xs: {
    height: "h-[var(--spacer-3x)]",
    px: "px-[var(--spacer-utility-0-75x)]",
    py: "py-[var(--spacer-utility-0-5x)]",
    iconSize: "size-[var(--spacer-utility-1-5x)]",
    iconPad: "p-[var(--spacer-0-25x)]",
    fontSize: "text-xs",
    heightToken: "spacer-3x (24)",
    pxToken: "utility-0.75x (6)",
    pyToken: "utility-0.5x (4)",
  },
  sm: {
    height: "h-[var(--spacer-4x)]",
    px: "px-[var(--spacer-utility-1x)]",
    py: "py-[var(--spacer-utility-0-875x)]",
    iconSize: "size-[var(--spacer-utility-1-75x)]",
    iconPad: "p-[var(--spacer-0-25x)]",
    fontSize: "text-xs",
    heightToken: "spacer-4x (32)",
    pxToken: "utility-1x (8)",
    pyToken: "utility-0.875x (7)",
  },
  lg: {
    height: "h-[var(--spacer-6x)]",
    px: "px-[var(--spacer-utility-2x)]",
    py: "py-[var(--spacer-utility-1-625x)]",
    iconSize: "size-[var(--spacer-utility-2-25x)]",
    iconPad: "p-[var(--spacer-0-5x)]",
    fontSize: "text-sm",
    heightToken: "spacer-6x (48)",
    pxToken: "utility-2x (16)",
    pyToken: "utility-1.625x (13)",
  },
  xl: {
    height: "h-[var(--spacer-7x)]",
    px: "px-[var(--spacer-utility-2-5x)]",
    py: "py-[var(--spacer-utility-2x)]",
    iconSize: "size-[var(--spacer-utility-2-5x)]",
    iconPad: "p-[var(--spacer-0-5x)]",
    fontSize: "text-base",
    heightToken: "spacer-7x (56)",
    pxToken: "utility-2.5x (20)",
    pyToken: "utility-2x (16)",
  },
};

const APPEARANCE_STYLES: Record<
  Appearance,
  Record<Emphasis, string>
> = {
  neutral: {
    bold: "bg-foreground text-background hover:bg-[var(--btn-neutral-bold-hover)] active:bg-[var(--btn-neutral-bold-active)]",
    regular:
      "bg-transparent border border-[var(--btn-neutral-border)] text-foreground hover:bg-[var(--btn-neutral-surface-subtle)] active:bg-[var(--btn-neutral-surface-regular)]",
    subtle:
      "bg-[var(--btn-neutral-surface-regular)] text-foreground hover:bg-[var(--btn-neutral-step-20)] active:bg-[var(--btn-neutral-step-30)]",
    minimal:
      "bg-transparent text-foreground hover:bg-[var(--btn-neutral-surface-subtle)] active:bg-[var(--btn-neutral-surface-regular)]",
  },
  highlight: {
    bold: "bg-accent text-accent-foreground hover:bg-[var(--btn-highlight-bold-hover)] active:bg-[var(--btn-highlight-bold-active)]",
    regular:
      "bg-transparent border border-accent text-accent hover:bg-[var(--btn-highlight-surface-subtle)] active:bg-[var(--btn-highlight-step-20)]",
    subtle: "bg-[var(--btn-highlight-surface-subtle)] text-accent hover:bg-[var(--btn-highlight-step-20)] active:bg-[var(--btn-highlight-step-30)]",
    minimal: "bg-transparent text-accent hover:bg-[var(--btn-highlight-surface-subtle)] active:bg-[var(--btn-highlight-step-20)]",
  },
  positive: {
    bold: "bg-[var(--palette-green-60)] text-[var(--palette-neutral-00)] hover:bg-[var(--palette-green-70)] active:bg-[var(--palette-green-80)]",
    regular:
      "bg-transparent border border-[var(--palette-green-60)] text-[var(--palette-green-60)] hover:bg-[var(--palette-green-10)] active:bg-[var(--palette-green-20)]",
    subtle:
      "bg-[var(--palette-green-10)] text-[var(--palette-green-60)] hover:bg-[var(--palette-green-20)] active:bg-[var(--palette-green-30)]",
    minimal:
      "bg-transparent text-[var(--palette-green-60)] hover:bg-[var(--palette-green-10)] active:bg-[var(--palette-green-20)]",
  },
  negative: {
    bold: "bg-[var(--palette-red-60)] text-[var(--palette-neutral-00)] hover:bg-[var(--palette-red-70)] active:bg-[var(--palette-red-80)]",
    regular:
      "bg-transparent border border-[var(--palette-red-60)] text-[var(--palette-red-60)] hover:bg-[var(--palette-red-10)] active:bg-[var(--palette-red-20)]",
    subtle: "bg-[var(--palette-red-10)] text-[var(--palette-red-60)] hover:bg-[var(--palette-red-20)] active:bg-[var(--palette-red-30)]",
    minimal: "bg-transparent text-[var(--palette-red-60)] hover:bg-[var(--palette-red-10)] active:bg-[var(--palette-red-20)]",
  },
  inverse: {
    bold: "bg-[var(--palette-neutral-00)] text-[var(--palette-neutral-100)] hover:bg-[var(--palette-neutral-10)] active:bg-[var(--palette-neutral-20)]",
    regular:
      "bg-transparent border border-[var(--palette-neutral-00)] text-[var(--palette-neutral-00)] hover:bg-[var(--overlay-white-08)] active:bg-[var(--overlay-white-16)]",
    subtle: "bg-[var(--overlay-white-08)] text-[var(--palette-neutral-00)] hover:bg-[var(--overlay-white-12)] active:bg-[var(--overlay-white-16)]",
    minimal: "bg-transparent text-[var(--palette-neutral-00)] hover:bg-[var(--overlay-white-08)] active:bg-[var(--overlay-white-12)]",
  },
  "always-dark": {
    bold: "bg-[var(--palette-neutral-100)] text-[var(--palette-neutral-10)] hover:bg-[var(--palette-neutral-90)] active:bg-[var(--palette-neutral-80)]",
    regular:
      "bg-transparent border border-[var(--palette-neutral-100)] text-[var(--palette-neutral-100)] hover:bg-[var(--overlay-black-04)] active:bg-[var(--overlay-black-08)]",
    subtle:
      "bg-[var(--overlay-black-06)] text-[var(--palette-neutral-100)] hover:bg-[var(--overlay-black-10)] active:bg-[var(--overlay-black-14)]",
    minimal:
      "bg-transparent text-[var(--palette-neutral-100)] hover:bg-[var(--overlay-black-04)] active:bg-[var(--overlay-black-08)]",
  },
  "always-light": {
    bold: "bg-[var(--palette-neutral-10)] text-[var(--palette-neutral-100)] hover:bg-[var(--palette-neutral-20)] active:bg-[var(--palette-neutral-30)]",
    regular:
      "bg-transparent border border-[var(--palette-neutral-10)] text-[var(--palette-neutral-10)] hover:bg-[var(--overlay-white-08)] active:bg-[var(--overlay-white-12)]",
    subtle:
      "bg-[var(--overlay-white-08)] text-[var(--palette-neutral-10)] hover:bg-[var(--overlay-white-12)] active:bg-[var(--overlay-white-16)]",
    minimal:
      "bg-transparent text-[var(--palette-neutral-10)] hover:bg-[var(--overlay-white-08)] active:bg-[var(--overlay-white-12)]",
  },
};

interface DemoButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  appearance?: Appearance;
  emphasis?: Emphasis;
  size?: Size;
  iconOnly?: boolean;
  fullWidth?: boolean;
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
  trailingSlot?: ReactNode;
}

function DemoButton({
  appearance = "neutral",
  emphasis = "bold",
  size = "lg",
  iconOnly = false,
  fullWidth = false,
  leadingIcon,
  trailingIcon,
  trailingSlot,
  className,
  children,
  ...props
}: DemoButtonProps) {
  const meta = SIZE_META[size];
  const style = APPEARANCE_STYLES[appearance][emphasis];

  const sizeClass = iconOnly
    ? `${meta.height} aspect-square p-0`
    : `${meta.height} ${meta.px} ${meta.fontSize}`;

  return (
    <button
      type="button"
      className={cn(
        "inline-flex shrink-0 items-center justify-center gap-0 cursor-pointer font-medium leading-tight rounded-sm whitespace-nowrap select-none font-sans",
        "transition-all duration-[var(--duration-fast)] ease-[var(--easing-standard)]",
        "disabled:opacity-40 disabled:pointer-events-none disabled:cursor-not-allowed",
        "border border-transparent",
        fullWidth && "w-full",
        sizeClass,
        style,
        className,
      )}
      {...props}
    >
      {leadingIcon && (
        <span
          className={cn(
            "inline-flex items-center justify-center shrink-0",
            meta.iconPad,
          )}
          aria-hidden="true"
        >
          <span className={cn("inline-flex", meta.iconSize)}>{leadingIcon}</span>
        </span>
      )}
      {children && <span className="inline-flex items-center">{children}</span>}
      {trailingIcon && (
        <span
          className={cn(
            "inline-flex items-center justify-center shrink-0",
            meta.iconPad,
          )}
          aria-hidden="true"
        >
          <span className={cn("inline-flex", meta.iconSize)}>{trailingIcon}</span>
        </span>
      )}
      {trailingSlot && (
        <span className="inline-flex items-center ml-[var(--spacer-0-25x)]">{trailingSlot}</span>
      )}
    </button>
  );
}

const scrollSpySections = [
  { id: "emphasis-spectrum", label: "Emphasis Spectrum" },
  { id: "appearance-emphasis-matrix", label: "Appearance × Emphasis" },
  { id: "size-scale", label: "Size Scale" },
  { id: "size-comparison", label: "Size Comparison" },
  { id: "content-arrangements", label: "Content Arrangements" },
  { id: "icon-only", label: "Icon-Only" },
  { id: "disabled", label: "Disabled" },
  { id: "full-width", label: "Full Width" },
  { id: "props", label: "Props" },
];

const EMPHASIS_LEVELS: Emphasis[] = ["bold", "regular", "subtle", "minimal"];
const CORE_APPEARANCES: Appearance[] = [
  "neutral",
  "highlight",
  "positive",
  "negative",
];
const CONTEXT_APPEARANCES: Appearance[] = [
  "inverse",
  "always-dark",
  "always-light",
];
const SIZES: Size[] = ["xs", "sm", "lg", "xl"];

export default function ButtonPage() {
  return (
    <Shell title="Button">
      <ScrollSpy sections={scrollSpySections} />
      <div className="max-w-5xl space-y-10">
          <SectionHeading
            title="Button"
            description="Primary action control using a two-axis model: Appearance controls color/intent, Emphasis controls visual weight. Based on the One GS design system's multi-axis variant architecture, adapted to the Elan color palette."
          />

          {/* 1. Emphasis Spectrum */}
          <section id="emphasis-spectrum">
            <ComponentPreview
              title="Emphasis Spectrum"
              description="Four emphasis levels on the neutral appearance. Bold = highest visual weight (filled), Regular = medium (bordered), Subtle = low (tinted), Minimal = lowest (transparent)."
              code={`<Button appearance="neutral" emphasis="bold">Bold</Button>
<Button appearance="neutral" emphasis="regular">Regular</Button>
<Button appearance="neutral" emphasis="subtle">Subtle</Button>
<Button appearance="neutral" emphasis="minimal">Minimal</Button>`}
            >
              <div className="flex flex-wrap items-center justify-center gap-3 w-full">
                {EMPHASIS_LEVELS.map((e) => (
                  <DemoButton key={e} appearance="neutral" emphasis={e}>
                    {e.charAt(0).toUpperCase() + e.slice(1)}
                  </DemoButton>
                ))}
              </div>
            </ComponentPreview>
          </section>

          {/* 2. Appearance × Emphasis Matrix */}
          <section id="appearance-emphasis-matrix">
            <ComponentPreview
              title="Appearance × Emphasis Matrix"
              description="Every appearance can be rendered at every emphasis level. Core appearances on a light surface, context appearances on their natural backgrounds."
              code={`<Button appearance="highlight" emphasis="subtle">Subtle Highlight</Button>
<Button appearance="negative" emphasis="regular">Regular Negative</Button>`}
            >
              <div className="space-y-6 w-full">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr>
                        <th className="text-left text-muted-foreground font-medium p-2">
                          Emphasis ↓ / Appearance →
                        </th>
                        {CORE_APPEARANCES.map((a) => (
                          <th
                            key={a}
                            className="text-center text-muted-foreground font-medium p-2 capitalize"
                          >
                            {a}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {EMPHASIS_LEVELS.map((e) => (
                        <tr key={e}>
                          <td className="text-muted-foreground p-2 capitalize font-medium">
                            {e}
                          </td>
                          {CORE_APPEARANCES.map((a) => (
                            <td key={a} className="p-2 text-center">
                              <DemoButton appearance={a} emphasis={e} size="sm">
                                {a.charAt(0).toUpperCase() + a.slice(1)}
                              </DemoButton>
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="space-y-3">
                  <p className="text-xs text-muted-foreground font-medium">
                    Context Appearances (on dark surfaces)
                  </p>
                  <div className="rounded-sm bg-neutral-900 p-6 flex flex-wrap items-center justify-center gap-3">
                    {CONTEXT_APPEARANCES.filter((a) => a !== "always-dark").map(
                      (a) =>
                        EMPHASIS_LEVELS.map((e) => (
                          <DemoButton key={`${a}-${e}`} appearance={a} emphasis={e} size="sm">
                            {a} / {e}
                          </DemoButton>
                        )),
                    )}
                  </div>
                  <div className="rounded-sm bg-white border border-border p-6 flex flex-wrap items-center justify-center gap-3">
                    {EMPHASIS_LEVELS.map((e) => (
                      <DemoButton
                        key={`always-dark-${e}`}
                        appearance="always-dark"
                        emphasis={e}
                        size="sm"
                      >
                        always-dark / {e}
                      </DemoButton>
                    ))}
                  </div>
                </div>
              </div>
            </ComponentPreview>
          </section>

          {/* 3. Size Scale */}
          <section id="size-scale">
            <ComponentPreview
              title="Size Scale"
              description="Four sizes (no 'md'). All dimensions use spacer tokens — zero hardcoded px for spacing."
              code={`<Button size="xs">Extra Small</Button>
<Button size="sm">Small</Button>
<Button size="lg">Large</Button>  {/* default */}
<Button size="xl">Extra Large</Button>`}
            >
              <div className="space-y-4 w-full">
                {SIZES.map((s) => (
                  <div
                    key={s}
                    className="flex items-center gap-4 text-xs text-muted-foreground"
                  >
                    <DemoButton
                      size={s}
                      appearance="highlight"
                      emphasis="bold"
                      leadingIcon={<Plus />}
                    >
                      {s.toUpperCase()}
                    </DemoButton>
                    <div className="font-mono space-x-4">
                      <span>h: {SIZE_META[s].heightToken}</span>
                      <span>px: {SIZE_META[s].pxToken}</span>
                      <span>py: {SIZE_META[s].pyToken}</span>
                    </div>
                  </div>
                ))}
              </div>
            </ComponentPreview>
          </section>

          {/* 4. Size Comparison */}
          <section id="size-comparison">
            <ComponentPreview
              title="Size Comparison"
              description="Side-by-side size comparison aligned by baseline."
              code={`<Button size="xs">XS</Button>
<Button size="sm">SM</Button>
<Button size="lg">LG</Button>
<Button size="xl">XL</Button>`}
            >
              <div className="flex flex-wrap items-end justify-center gap-3 w-full">
                {SIZES.map((s) => (
                  <DemoButton key={s} size={s}>
                    {s.toUpperCase()}
                  </DemoButton>
                ))}
              </div>
            </ComponentPreview>
          </section>

          {/* 5. Content Arrangements */}
          <section id="content-arrangements">
            <ComponentPreview
              title="Content Arrangements"
              description="Every slot configuration: label-only, leading icon, trailing icon, both icons, trailing slot (badge/kbd), and icon-only."
              code={`<Button>Label only</Button>
<Button leadingIcon={<Plus />}>Leading icon</Button>
<Button trailingIcon={<ChevronRight />}>Trailing icon</Button>
<Button leadingIcon={<Plus />} trailingIcon={<ArrowRight />}>Both</Button>
<Button trailingSlot={<kbd>⌘K</kbd>}>With shortcut</Button>`}
            >
              <div className="flex flex-wrap items-center justify-center gap-3 w-full">
                <DemoButton appearance="highlight">Label only</DemoButton>
                <DemoButton appearance="highlight" leadingIcon={<Plus />}>
                  Leading
                </DemoButton>
                <DemoButton
                  appearance="highlight"
                  trailingIcon={<ChevronRight />}
                >
                  Trailing
                </DemoButton>
                <DemoButton
                  appearance="highlight"
                  leadingIcon={<Download />}
                  trailingIcon={<ArrowRight />}
                >
                  Both
                </DemoButton>
                <DemoButton
                  appearance="highlight"
                  emphasis="regular"
                  trailingSlot={
                    <kbd className="inline-flex items-center rounded-sm border border-current/20 px-1 py-0.5 text-[10px] font-mono opacity-60">
                      ⌘K
                    </kbd>
                  }
                >
                  Search
                </DemoButton>
                <DemoButton
                  appearance="highlight"
                  emphasis="subtle"
                  trailingSlot={
                    <span className="inline-flex items-center justify-center rounded-full bg-accent text-accent-foreground text-[10px] font-medium min-w-[18px] h-[18px] px-1">
                      3
                    </span>
                  }
                >
                  Notifications
                </DemoButton>
              </div>
            </ComponentPreview>
          </section>

          {/* 6. Icon-Only */}
          <section id="icon-only">
            <ComponentPreview
              title="Icon-Only"
              description="Square buttons across all sizes and emphasis levels. Always provide aria-label."
              code={`<Button iconOnly size="sm" aria-label="Add">
  <Plus />
</Button>`}
            >
              <div className="space-y-3 w-full">
                {EMPHASIS_LEVELS.map((e) => (
                  <div
                    key={e}
                    className="flex items-center gap-3"
                  >
                    <span className="text-xs text-muted-foreground w-16 capitalize">
                      {e}
                    </span>
                    {SIZES.map((s) => (
                      <DemoButton
                        key={s}
                        size={s}
                        emphasis={e}
                        appearance="highlight"
                        iconOnly
                        aria-label="Add"
                      >
                        <Plus />
                      </DemoButton>
                    ))}
                  </div>
                ))}
              </div>
            </ComponentPreview>
          </section>

          {/* 7. Disabled */}
          <section id="disabled">
            <ComponentPreview
              title="Disabled"
              description="Disabled state across emphasis levels. Opacity reduces to 0.4."
              code={`<Button disabled>Disabled Bold</Button>
<Button emphasis="regular" disabled>Disabled Regular</Button>
<Button emphasis="subtle" disabled>Disabled Subtle</Button>
<Button emphasis="minimal" disabled>Disabled Minimal</Button>`}
            >
              <div className="flex flex-wrap items-center justify-center gap-3 w-full">
                {EMPHASIS_LEVELS.map((e) => (
                  <DemoButton key={e} emphasis={e} disabled>
                    Disabled {e}
                  </DemoButton>
                ))}
              </div>
            </ComponentPreview>
          </section>

          {/* 8. Full Width */}
          <section id="full-width">
            <ComponentPreview
              title="Full Width"
              description="fullWidth stretches to 100% of the container."
              code={`<Button fullWidth appearance="highlight">Full width highlight bold</Button>
<Button fullWidth appearance="neutral" emphasis="regular">Full width neutral regular</Button>
<Button fullWidth appearance="neutral" emphasis="subtle">Full width neutral subtle</Button>`}
            >
              <div className="w-full max-w-sm mx-auto space-y-2">
                <DemoButton fullWidth appearance="highlight">
                  Full width bold
                </DemoButton>
                <DemoButton fullWidth appearance="neutral" emphasis="regular">
                  Full width regular
                </DemoButton>
                <DemoButton fullWidth appearance="neutral" emphasis="subtle">
                  Full width subtle
                </DemoButton>
              </div>
            </ComponentPreview>
          </section>

          {/* 9. Props */}
          <section id="props">
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-3">
              Props
            </h3>
            <PropsTable
              props={[
                {
                  name: "appearance",
                  type: '"neutral" | "highlight" | "positive" | "negative" | "inverse" | "always-dark" | "always-light"',
                  default: '"neutral"',
                  description: "Color/intent axis — what semantic color family the button uses.",
                },
                {
                  name: "emphasis",
                  type: '"bold" | "regular" | "subtle" | "minimal"',
                  default: '"bold"',
                  description:
                    "Visual weight axis — independent of appearance. Bold = filled, Regular = bordered, Subtle = tinted, Minimal = transparent.",
                },
                {
                  name: "size",
                  type: '"xs" | "sm" | "lg" | "xl"',
                  default: '"lg"',
                  description:
                    "Button size controlling height, padding, icon size, and font size. No 'md' — use 'lg' as default.",
                },
                {
                  name: "iconOnly",
                  type: "boolean",
                  default: "false",
                  description:
                    "Square layout (width = height) for single-icon buttons. Always pair with aria-label.",
                },
                {
                  name: "fullWidth",
                  type: "boolean",
                  default: "false",
                  description: "Stretch to 100% of the container width.",
                },
                {
                  name: "leadingIcon",
                  type: "ReactNode",
                  default: "—",
                  description:
                    "Icon before the label. Wrapped in a bounding-box with padding scaled per size.",
                },
                {
                  name: "trailingIcon",
                  type: "ReactNode",
                  default: "—",
                  description:
                    "Icon after the label. Same bounding-box treatment as leadingIcon.",
                },
                {
                  name: "trailingSlot",
                  type: "ReactNode",
                  default: "—",
                  description:
                    "Arbitrary content after the trailing icon — badges, kbd shortcuts, counts. Distinct from trailingIcon.",
                },
                {
                  name: "...props",
                  type: "ButtonHTMLAttributes<HTMLButtonElement>",
                  default: "—",
                  description:
                    "Forwarded to the native button (type defaults to 'button', onClick, disabled, aria-*, className, etc.).",
                },
              ]}
            />
          </section>

          <div className="text-xs font-mono text-muted-foreground p-3 rounded-sm bg-muted/50">
            src/components/ui/Button/Button.tsx · src/components/ui/Button/Button.module.scss
          </div>
        </div>
    </Shell>
  );
}
