import ArrowRight from "lucide-react/dist/esm/icons/arrow-right";
import ChevronRight from "lucide-react/dist/esm/icons/chevron-right";
import Download from "lucide-react/dist/esm/icons/download";
import Plus from "lucide-react/dist/esm/icons/plus";
import { Shell } from "@/components/shell";
import { SectionHeading } from "@/components/token-grid";
import { ComponentPreview, PropsTable, SourcePath, SubsectionHeading} from "@/components/component-preview";
import ScrollSpy from "@/components/scroll-spy";
import { Button } from "@ds/Button";
import type { ButtonAppearance, ButtonEmphasis, ButtonSize } from "@ds/Button";
import { Kbd } from "@ds/Kbd";
import surfaces from "./surfaces.module.css";

const SIZE_TOKEN_DOCS: Record<ButtonSize, { height: string; px: string; py: string; font: string; icon: string; gap: string }> = {
  xs: { height: "min 24", px: "utility-0.75x (6)", py: "utility-0.5x (4)", font: "xs (12)", icon: "16", gap: "utility-0.5x (4)" },
  sm: { height: "min 32", px: "utility-1x (8)", py: "utility-0.875x (7)", font: "sm (14)", icon: "18", gap: "utility-0.75x (6)" },
  md: { height: "min 40", px: "utility-1.5x (12)", py: "utility-1.25x (10)", font: "base (16)", icon: "20", gap: "utility-1x (8)" },
  lg: { height: "min 48", px: "utility-2x (16)", py: "utility-1.625x (13)", font: "lg (18)", icon: "22", gap: "utility-1.5x (12)" },
  xl: { height: "min 56", px: "utility-3x (24)", py: "utility-2x (16)", font: "lg (18)", icon: "24", gap: "utility-2x (16)" },
};

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

const EMPHASIS_LEVELS: ButtonEmphasis[] = ["bold", "regular", "subtle", "minimal"];
const CORE_APPEARANCES: ButtonAppearance[] = [
  "neutral",
  "highlight",
  "positive",
  "negative",
  "warning",
];
const INVERSE_EMPHASIS: ButtonEmphasis[] = ["bold", "regular"];
const CONTEXT_APPEARANCES: ButtonAppearance[] = [
  "inverse",
  "always-dark",
  "always-light",
];
const SIZES: ButtonSize[] = ["xs", "sm", "md", "lg", "xl"];

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
                  <Button key={e} appearance="neutral" emphasis={e}>
                    {e.charAt(0).toUpperCase() + e.slice(1)}
                  </Button>
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
                              <Button appearance={a} emphasis={e} size="sm">
                                {a.charAt(0).toUpperCase() + a.slice(1)}
                              </Button>
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="space-y-3">
                  <p className="text-xs text-muted-foreground font-medium">
                    Inverse (theme-responsive — Bold + Regular only)
                  </p>
                  <div className={`rounded-sm p-6 flex flex-wrap items-center justify-center gap-3 ${surfaces.surfaceInverse}`}>
                    {INVERSE_EMPHASIS.map((e) => (
                      <Button key={`inverse-${e}`} appearance="inverse" emphasis={e} size="sm">
                        inverse / {e}
                      </Button>
                    ))}
                  </div>
                </div>
                <div className="space-y-3">
                  <p className="text-xs text-muted-foreground font-medium">
                    Always Dark (locked dark — toggle theme to verify)
                  </p>
                  <div className={`rounded-sm p-6 flex flex-wrap items-center justify-center gap-4 ${surfaces.surfaceAlwaysLight}`}>
                    {EMPHASIS_LEVELS.map((e) => (
                      <Button key={`always-dark-${e}`} appearance="always-dark" emphasis={e} size="sm">
                        always-dark / {e}
                      </Button>
                    ))}
                  </div>
                </div>
                <div className="space-y-3">
                  <p className="text-xs text-muted-foreground font-medium">
                    Always Light (locked light — toggle theme to verify)
                  </p>
                  <div className={`rounded-sm p-6 flex flex-wrap items-center justify-center gap-4 ${surfaces.surfaceAlwaysDark}`}>
                    {EMPHASIS_LEVELS.map((e) => (
                      <Button key={`always-light-${e}`} appearance="always-light" emphasis={e} size="sm">
                        always-light / {e}
                      </Button>
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
              description="Five sizes on an 8px height grid (24–32–40–48–56). All dimensions use spacer tokens — zero hardcoded px for spacing."
              code={`<Button size="xs">Extra Small</Button>
<Button size="sm">Small</Button>
<Button size="md">Medium</Button>
<Button size="lg">Large</Button>  {/* default */}
<Button size="xl">Extra Large</Button>`}
            >
              <div className="space-y-4 w-full">
                {SIZES.map((s) => (
                  <div
                    key={s}
                    className="flex items-center gap-4 text-xs text-muted-foreground"
                  >
                    <Button
                      size={s}
                      appearance="highlight"
                      emphasis="bold"
                      leadingIcon={<Plus />}
                    >
                      {s.toUpperCase()}
                    </Button>
                    <div className="font-mono space-x-4">
                      <span>h: {SIZE_TOKEN_DOCS[s].height}</span>
                      <span>px: {SIZE_TOKEN_DOCS[s].px}</span>
                      <span>py: {SIZE_TOKEN_DOCS[s].py}</span>
                      <span>icon: {SIZE_TOKEN_DOCS[s].icon}</span>
                      <span>gap: {SIZE_TOKEN_DOCS[s].gap}</span>
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
<Button size="md">MD</Button>
<Button size="lg">LG</Button>
<Button size="xl">XL</Button>`}
            >
              <div className="flex flex-wrap items-end justify-center gap-3 w-full">
                {SIZES.map((s) => (
                  <Button key={s} size={s}>
                    {s.toUpperCase()}
                  </Button>
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
<Button trailingSlot={<Kbd bordered size="lg">⌘K</Kbd>}>With shortcut</Button>`}
            >
              <div className="flex flex-wrap items-center justify-center gap-3 w-full">
                <Button appearance="highlight">Label only</Button>
                <Button appearance="highlight" leadingIcon={<Plus />}>
                  Leading
                </Button>
                <Button
                  appearance="highlight"
                  trailingIcon={<ChevronRight />}
                >
                  Trailing
                </Button>
                <Button
                  appearance="highlight"
                  leadingIcon={<Download />}
                  trailingIcon={<ArrowRight />}
                >
                  Both
                </Button>
                <Button
                  appearance="highlight"
                  emphasis="regular"
                  trailingSlot={<Kbd bordered size="lg">⌘K</Kbd>}
                >
                  Search
                </Button>
                <Button
                  appearance="highlight"
                  emphasis="subtle"
                  trailingSlot={
                    <span className="inline-flex items-center justify-center rounded-full bg-accent text-accent-foreground text-[10px] font-medium min-w-[18px] h-[18px] px-1">
                      3
                    </span>
                  }
                >
                  Notifications
                </Button>
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
                      <Button
                        key={s}
                        size={s}
                        emphasis={e}
                        appearance="highlight"
                        iconOnly
                        aria-label="Add"
                      >
                        <Plus />
                      </Button>
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
                  <Button key={e} emphasis={e} disabled>
                    Disabled {e}
                  </Button>
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
              <div className="w-full max-w-sm mx-auto flex flex-col gap-3">
                <Button fullWidth appearance="highlight">
                  Full width bold
                </Button>
                <Button fullWidth appearance="neutral" emphasis="regular">
                  Full width regular
                </Button>
                <Button fullWidth appearance="neutral" emphasis="subtle">
                  Full width subtle
                </Button>
              </div>
            </ComponentPreview>
          </section>

          {/* 9. Props */}
          <section id="props">
            <SubsectionHeading>Props</SubsectionHeading>
            <PropsTable
              props={[
                {
                  name: "appearance",
                  type: '"neutral" | "highlight" | "positive" | "negative" | "warning" | "inverse" | "always-dark" | "always-light"',
                  default: '"neutral"',
                  description: "Color/intent axis — what semantic color family the button uses. Inverse supports Bold + Regular only.",
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
                  type: '"xs" | "sm" | "md" | "lg" | "xl"',
                  default: '"lg"',
                  description:
                    "Button size on an 8px height grid (24–56). Controls min-height, padding, font size, icon size (= line-height), and gap.",
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
                    "Icon before the label. Sized to match the label line-height at each size.",
                },
                {
                  name: "trailingIcon",
                  type: "ReactNode",
                  default: "—",
                  description:
                    "Icon after the label. Same sizing treatment as leadingIcon.",
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

          <SourcePath path="src/components/ui/Button/Button.tsx · src/components/ui/Button/Button.module.scss" />
        </div>
    </Shell>
  );
}
