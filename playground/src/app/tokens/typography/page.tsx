"use client";

import { Shell } from "@/components/shell";
import { SectionHeading, SectionTitle, SectionDescription, SubSection, TokenRow } from "@/components/token-grid";
import ScrollSpy from "@/components/scroll-spy";
import { typography } from "@/lib/tokens";

const scrollSpySections = [
  { id: "token-architecture", label: "Architecture" },
  { id: "semantic-mixins", label: "Semantic Mixins" },
  { id: "type-scale", label: "Type Scale" },
  { id: "font-stacks", label: "Font Stacks" },
  { id: "font-weights", label: "Weights" },
  { id: "line-heights", label: "Line Heights" },
  { id: "letter-spacing", label: "Letter Spacing" },
];

function getFontFamily(font: string): string | undefined {
  if (font === "Serif") return "var(--font-ibm-plex-serif), 'Georgia', serif";
  if (font === "Mono")
    return "var(--font-geist-mono), 'JetBrains Mono', ui-monospace, monospace";
  return undefined;
}

export default function TypographyPage() {
  return (
    <Shell title="Typography">
      <ScrollSpy sections={scrollSpySections} />
      <div className="max-w-5xl">
        <SectionHeading
          title="Typography"
          description="29 semantic mixins across 9 categories, built on a 13-step type scale. Primary face: Geist Sans. IBM Plex Serif for case study intro titles and quotes. Mono (Geist Mono) restricted to code. Informed by OneGS and IBM Carbon."
        />

        <SectionTitle id="token-architecture">Token Architecture</SectionTitle>
        <SectionDescription>
          Typography tokens follow a two-tier naming system. Semantic mixins
          (@include heading-display, @include body-sm) compose font-size, weight,
          line-height, and letter-spacing into ready-to-use type styles. Primitive
          tokens (--portfolio-type-2xl, --portfolio-weight-bold,
          --portfolio-leading-relaxed) expose individual properties for custom
          compositions. Mixins are the preferred API; primitives are for edge cases
          where no mixin fits.
        </SectionDescription>

        <SubSection id="semantic-mixins" title="Semantic Mixins">
          <div className="space-y-8">
            {typography.categories.map((cat) => (
              <div key={cat.name}>
                <div className="mb-3">
                  <h4 className="text-sm font-semibold">{cat.name}</h4>
                  <p className="text-xs text-muted-foreground">
                    {cat.description}
                  </p>
                </div>
                <div className="border rounded-sm border-border overflow-x-auto">
                  <div className="min-w-[640px]">
                    {cat.mixins.map((m) => (
                      <div
                        key={m.name}
                        className="flex items-baseline gap-4 px-5 py-3 border-b last:border-b-0 border-border hover:bg-muted/30 transition-colors"
                      >
                        <span
                          className="shrink-0 w-20 sm:w-28"
                          style={{
                            fontSize: m.size.match(/\((\d+)px\)/)?.[1]
                              ? `${m.size.match(/\((\d+)px\)/)?.[1]}px`
                              : "16px",
                            fontWeight: parseInt(
                              m.weight.match(/\d+/)?.[0] ?? "400"
                            ),
                            lineHeight: parseFloat(
                              m.leading.match(/[\d.]+/)?.[0] ?? "1.5"
                            ),
                            fontStyle: m.extras?.includes("italic")
                              ? "italic"
                              : undefined,
                            fontFamily: getFontFamily(m.font),
                            fontVariantNumeric: m.extras?.includes(
                              "tabular-nums"
                            )
                              ? "tabular-nums"
                              : undefined,
                            textTransform: m.extras?.includes("uppercase")
                              ? "uppercase"
                              : undefined,
                            letterSpacing:
                              m.tracking === "Tight"
                                ? "-0.02em"
                                : m.tracking === "Wider"
                                  ? "0.05em"
                                  : undefined,
                          }}
                        >
                          {m.extras?.includes("tabular-nums") ? "1,234" : "Aa"}
                        </span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-baseline gap-2">
                            <span className="text-xs font-semibold font-mono">
                              {m.name}
                            </span>
                            <span className="text-[10px] text-muted-foreground">
                              {m.font} · {m.size} · {m.weight} · {m.leading}
                            </span>
                          </div>
                          <p className="text-[10px] text-muted-foreground/60 mt-0.5">
                            {m.use}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </SubSection>

        <SubSection id="type-scale" title="Type Scale">
          <div className="border rounded-sm border-border overflow-x-auto">
            <div className="min-w-[480px]">
              {typography.scale.map((t) => (
                <div
                  key={t.name}
                  className="flex items-baseline gap-4 px-5 sm:px-6 py-4 border-b last:border-b-0 border-border hover:bg-muted/30 transition-colors"
                >
                  <span
                    className="shrink-0 w-16 sm:w-24 font-semibold"
                    style={{ fontSize: t.size, lineHeight: 1.2 }}
                  >
                    Aa
                  </span>
                  <div className="flex-1 flex items-baseline gap-2 sm:gap-3 min-w-0">
                    <span className="text-sm font-medium shrink-0">
                      {t.name}
                    </span>
                    <span className="text-xs font-mono text-muted-foreground shrink-0">
                      {t.size}
                    </span>
                    <span className="text-xs font-mono text-muted-foreground shrink-0">
                      ({t.px})
                    </span>
                  </div>
                  <span className="text-xs font-mono text-muted-foreground shrink-0 text-right">
                    {t.token}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </SubSection>

        <SubSection id="font-stacks" title="Font Stacks">
          <div className="space-y-4">
            {typography.fonts.map((f) => (
              <div key={f.name} className="p-5 rounded-sm border border-border">
                <div className="flex items-baseline gap-3 mb-1">
                  <p className="text-sm font-semibold">{f.name}</p>
                  <span className="text-[10px] font-medium text-muted-foreground/60 uppercase tracking-wider">
                    {f.category}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mb-2">{f.role}</p>
                <p
                  className="text-2xl mb-3"
                  style={{ fontFamily: f.value }}
                >
                  The quick brown fox jumps over the lazy dog
                </p>
                <div className="flex flex-col gap-1">
                  <p className="text-xs font-mono text-muted-foreground">
                    {f.token}
                  </p>
                  <p className="text-[10px] font-mono text-muted-foreground/50 break-all">
                    {f.value}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </SubSection>

        <SubSection id="font-weights" title="Font Weights">
          <div className="space-y-1">
            {typography.weights.map((w) => (
              <TokenRow
                key={w.name}
                label={w.name}
                value={String(w.value)}
                token={w.token}
                preview={
                  <span
                    className="text-lg w-20 inline-block"
                    style={{ fontWeight: w.value }}
                  >
                    Aa
                  </span>
                }
              />
            ))}
          </div>
        </SubSection>

        <SubSection id="line-heights" title="Line Heights">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {typography.leading.map((l) => (
              <div
                key={l.name}
                className="p-5 rounded-sm border border-border"
              >
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
                  {l.name} — {l.value}
                </p>
                <p className="text-sm" style={{ lineHeight: l.value }}>
                  Design is not just what it looks like and feels like. Design is
                  how it works. Good design is as little design as possible.
                </p>
                <p className="text-xs font-mono text-muted-foreground mt-3">
                  {l.token}
                </p>
              </div>
            ))}
          </div>
        </SubSection>

        <SubSection id="letter-spacing" title="Letter Spacing">
          <div className="space-y-1">
            {typography.tracking.map((t) => (
              <TokenRow
                key={t.name}
                label={t.name}
                value={t.value}
                token={t.token}
                preview={
                  <span
                    className="text-sm w-32 inline-block"
                    style={{ letterSpacing: t.value }}
                  >
                    ABCDEFGH
                  </span>
                }
              />
            ))}
          </div>
        </SubSection>
      </div>
    </Shell>
  );
}
