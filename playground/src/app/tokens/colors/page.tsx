"use client";

import { Shell } from "@/components/shell";
import {
  SectionHeading,
  SectionTitle,
  SectionDescription,
  SubsectionTitle,
  ZoneDivider,
} from "@/components/token-grid";
import ScrollSpy from "@/components/scroll-spy";
import { colors } from "@/lib/tokens";
import type { RoleGroup, SemanticToken } from "@/lib/tokens";
import { useState } from "react";
import Check from "lucide-react/dist/esm/icons/check";
import Copy from "lucide-react/dist/esm/icons/copy";
import s from "./colors.module.scss";

const scrollSpySections = [
  { id: "token-architecture", label: "Architecture", group: "Tokens" },
  { id: "surface", label: "Surface", depth: 1 as const },
  { id: "text", label: "Text", depth: 1 as const },
  { id: "icon", label: "Icon", depth: 1 as const },
  { id: "border", label: "Border", depth: 1 as const },
  { id: "action", label: "Action", depth: 1 as const },
  { id: "interaction", label: "Focus & Highlight", depth: 1 as const },
  {
    id: "palette-reference",
    label: "Palette Reference",
    group: "Reference",
  },
  { id: "lumen-scale", label: "How Lumen Is Built", depth: 1 as const },
  { id: "terra-scale", label: "Terra Scale (Brand)", depth: 1 as const },
  { id: "terra-construction", label: "How Terra Is Built", depth: 1 as const },
];

function titleCase(str: string) {
  return str
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function Swatch({
  color,
  label,
  sublabel,
  dark,
}: {
  color: string;
  label: string;
  sublabel?: string;
  dark?: boolean;
}) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(color);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <button onClick={copy} className={s.swatchButton}>
      <div
        className={dark ? s.swatchChipDark : s.swatchChipLight}
        style={{ backgroundColor: color }}
      >
        <div className={s.swatchOverlay}>
          {copied ? (
            <Check className={s.swatchIconMd} />
          ) : (
            <Copy className={s.swatchIconSm} />
          )}
        </div>
      </div>
      <p className={dark ? s.swatchLabelDark : s.swatchLabelLight}>{label}</p>
      {sublabel && (
        <p className={dark ? s.swatchSublabelDark : s.swatchSublabelLight}>
          {sublabel}
        </p>
      )}
    </button>
  );
}

function hasDarkValues(role: RoleGroup): boolean {
  return role.tokens.some((t) => t.darkValue);
}

function ThemedRoleRow({ role }: { role: RoleGroup }) {
  const showDark = hasDarkValues(role);

  return (
    <div className={s.roleRow}>
      <div className={s.roleLabel}>
        <p className={s.roleLabelText}>{titleCase(role.role)}</p>
      </div>

      <div className={s.themeStripContainer}>
        <div className={s.themeStripLight}>
          <p className={s.themeStripTitle}>Light</p>
          <div className={s.swatchGrid}>
            {role.tokens.map((t) => (
              <Swatch
                key={t.token + "-light"}
                color={t.value}
                label={t.emphasis ? titleCase(t.emphasis) : "Default"}
                sublabel={t.value}
              />
            ))}
          </div>
        </div>

        {showDark && (
          <div className={s.themeStripDark}>
            <p className={s.themeStripTitleDark}>Dark</p>
            <div className={s.swatchGrid}>
              {role.tokens
                .filter((t) => t.darkValue)
                .map((t) => (
                  <Swatch
                    key={t.token + "-dark"}
                    color={t.darkValue!}
                    label={t.emphasis ? titleCase(t.emphasis) : "Default"}
                    sublabel={t.darkValue!}
                    dark
                  />
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function PropertySection({
  property,
  description,
  roles,
}: {
  property: string;
  description: string;
  roles: RoleGroup[];
}) {
  const neutralRole = roles.find((r) => r.role === "neutral");
  const otherRoles = roles.filter((r) => r.role !== "neutral");

  return (
    <div className={s.propertySection}>
      <SectionTitle id={property}>{titleCase(property)}</SectionTitle>
      <SectionDescription>{description}</SectionDescription>

      <div className={s.roleStack}>
        {neutralRole && <ThemedRoleRow role={neutralRole} />}
        {otherRoles.map((role) => (
          <ThemedRoleRow key={role.role} role={role} />
        ))}
      </div>
    </div>
  );
}

function InteractionSection({ tokens }: { tokens: SemanticToken[] }) {
  const showDark = tokens.some((t) => t.darkValue);

  return (
    <div className={s.interactionSection}>
      <SectionTitle id="interaction">Focus &amp; Highlight</SectionTitle>
      <SectionDescription>
        Interaction state tokens. These are global — they don&apos;t follow the
        property dimension.
      </SectionDescription>

      <div className={s.interactionStrips}>
        <div className={s.themeStripLight}>
          <p className={s.themeStripTitle}>Light</p>
          <div className={s.swatchGrid}>
            {tokens.map((t) => (
              <Swatch
                key={t.name + "-light"}
                color={t.value}
                label={t.name}
                sublabel={t.value}
              />
            ))}
          </div>
        </div>

        {showDark && (
          <div className={s.themeStripDark}>
            <p className={s.themeStripTitleDark}>Dark</p>
            <div className={s.swatchGrid}>
              {tokens
                .filter((t) => t.darkValue)
                .map((t) => (
                  <Swatch
                    key={t.name + "-dark"}
                    color={t.darkValue!}
                    label={t.name}
                    sublabel={t.darkValue!}
                    dark
                  />
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function PaletteSwatchRow({
  items,
}: {
  items: { step: string; value: string }[];
}) {
  return (
    <div className={s.swatchGrid}>
      {items.map((c) => (
        <Swatch key={c.step} color={c.value} label={c.step} sublabel={c.value} />
      ))}
    </div>
  );
}

export default function ColorsPage() {
  return (
    <Shell title="Colors">
      <ScrollSpy sections={scrollSpySections} />
      <div className={s.content}>
        <SectionHeading
          title="Colors"
          description="A structured, accessible color token system. Tokens follow a consistent naming formula that encodes what the color is applied to, its semantic intent, and its prominence level. Semantic tokens resolve to different values in light and dark themes — both are shown below."
        />

        {/* Architecture explanation */}
        <div className={s.architectureSection}>
          <SectionTitle id="token-architecture">Token Architecture</SectionTitle>
          <SectionDescription>
            Semantic color tokens follow a four-part naming formula that encodes
            what the color is applied to, its semantic intent, and its prominence level.
          </SectionDescription>
          <div className={s.formulaBox}>
            <div className={s.formulaRow}>
              <span className={s.formulaPillInverted}>color</span>
              <span className={s.formulaDot}>.</span>
              <span className={s.formulaPill}>property</span>
              <span className={s.formulaDot}>.</span>
              <span className={s.formulaPill}>role</span>
              <span className={s.formulaDot}>.</span>
              <span className={s.formulaPill}>emphasis</span>
            </div>
          </div>
          <div className={s.explainerGrid}>
            <div className={s.explainerCol}>
              <p className={s.explainerTitle}>Property</p>
              <p className={s.explainerDesc}>
                What element type the color applies to.
              </p>
              <div className={s.tagRow}>
                {["surface", "text", "icon", "border", "action"].map((p) => (
                  <span key={p} className={s.tag}>
                    {p}
                  </span>
                ))}
              </div>
            </div>
            <div className={s.explainerCol}>
              <p className={s.explainerTitle}>Role</p>
              <p className={s.explainerDesc}>
                Semantic intent of the color.
              </p>
              <div className={s.tagRow}>
                {[
                  "neutral",
                  "brand",
                  "terra",
                  "inverse",
                  "positive",
                  "warning",
                  "negative",
                ].map((r) => (
                  <span key={r} className={s.tag}>
                    {r}
                  </span>
                ))}
              </div>
            </div>
            <div className={s.explainerCol}>
              <p className={s.explainerTitle}>Emphasis</p>
              <p className={s.explainerDesc}>
                Prominence level, relative within its group.
              </p>
              <div className={s.tagRow}>
                {["bold", "regular", "subtle", "minimal"].map((e) => (
                  <span key={e} className={s.tag}>
                    {e}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Property sections */}
        {colors.properties.map((section) => (
          <PropertySection
            key={section.property}
            property={section.property}
            description={section.description}
            roles={section.roles}
          />
        ))}

        {/* Interaction */}
        <InteractionSection tokens={colors.interaction} />

        {/* Zone divider: semantic tokens above, palette reference below */}
        <ZoneDivider label="Reference" />

        {/* Palette Reference */}
        <div className={s.paletteSection}>
          <SectionTitle id="palette-reference">Palette Reference</SectionTitle>
          <SectionDescription>
            Raw palette scales — implementation details behind the semantic
            tokens above. These are theme-invariant primitives. Components should
            not reference these directly.
          </SectionDescription>

          <div className={s.paletteGroup}>
            <SubsectionTitle>Accent Scale (Brand)</SubsectionTitle>
            <PaletteSwatchRow items={colors.accent} />
          </div>

          {/* Lumen scale construction documentation */}
          <div id="lumen-scale" className={s.lumenSection}>
            <SubsectionTitle>How This Scale Is Built</SubsectionTitle>
            <p className={s.lumenNarrative}>
              Lumen is a custom blue-violet (
              <code className={s.lumenCode}>#3336FF</code>) in the same
              territory as ultramarine&thinsp;&mdash;&thinsp;the pigment
              Renaissance painters ground from lapis lazuli. Precise enough for
              an engineering interface, rooted in something older.
            </p>

            <div className={s.lumenMethodBox}>
              <p className={s.lumenMethodTitle}>OKLCH Construction</p>
              <p className={s.lumenMethodDesc}>
                Grade 60 is the immovable brand anchor. All other steps are
                derived in OKLCH&thinsp;&mdash;&thinsp;a perceptual color space
                where equal numeric steps produce equal visual difference.
              </p>
              <div className={s.lumenParamGrid}>
                <div className={s.lumenParam}>
                  <span className={s.lumenParamLabel}>Lightness</span>
                  <span className={s.lumenParamValue}>
                    Even ramp: &Delta;L&nbsp;&asymp;&nbsp;0.093 (10&ndash;60),
                    &Delta;L&nbsp;&asymp;&nbsp;0.081 (60&ndash;100)
                  </span>
                </div>
                <div className={s.lumenParam}>
                  <span className={s.lumenParamLabel}>Chroma</span>
                  <span className={s.lumenParamValue}>
                    Sine arc peaking at grade 60 (C&nbsp;=&nbsp;0.281), tapering
                    to both extremes
                  </span>
                </div>
                <div className={s.lumenParam}>
                  <span className={s.lumenParamLabel}>Hue</span>
                  <span className={s.lumenParamValue}>
                    Constant 269.7&deg; across all steps (no hue discontinuity)
                  </span>
                </div>
              </div>
            </div>

            <div className={s.lumenTable}>
              <table className={s.lumenTableEl}>
                <thead>
                  <tr>
                    <th>Step</th>
                    <th>Hex</th>
                    <th>OKLCH</th>
                    <th>vs White</th>
                    <th>vs #161616</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { step: 10, hex: "#EFF3FF", oklch: "0.96, 0.016, 269.7", w: "1.1:1", d: "16.3:1" },
                    { step: 20, hex: "#C5D4FF", oklch: "0.87, 0.062, 269.7", w: "1.5:1", d: "12.2:1" },
                    { step: 30, hex: "#9BB4FF", oklch: "0.78, 0.111, 269.7", w: "2.0:1", d: "8.9:1" },
                    { step: 40, hex: "#7392FF", oklch: "0.69, 0.164, 269.7", w: "2.9:1", d: "6.3:1" },
                    { step: 50, hex: "#4E6CFF", oklch: "0.59, 0.220, 269.7", w: "4.3:1", d: "4.2:1" },
                    { step: 60, hex: "#3336FF", oklch: "0.50, 0.281, 269.7", w: "6.7:1", d: "2.7:1" },
                    { step: 70, hex: "#261BD5", oklch: "0.42, 0.257, 269.7", w: "9.6:1", d: "1.9:1" },
                    { step: 80, hex: "#1A169C", oklch: "0.34, 0.200, 269.8", w: "12.8:1", d: "1.4:1" },
                    { step: 90, hex: "#0F1560", oklch: "0.26, 0.129, 269.8", w: "16.2:1", d: "1.1:1" },
                    { step: 100, hex: "#070D29", oklch: "0.17, 0.058, 269.8", w: "19.1:1", d: "1.1:1" },
                  ].map((row) => (
                    <tr key={row.step} className={row.step === 60 ? s.lumenAnchorRow : undefined}>
                      <td>{row.step}</td>
                      <td>
                        <code className={s.lumenCode}>{row.hex}</code>
                      </td>
                      <td>
                        <code className={s.lumenCodeMuted}>{row.oklch}</code>
                      </td>
                      <td>{row.w}</td>
                      <td>{row.d}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div id="terra-scale" className={s.paletteGroup}>
            <SubsectionTitle>Terra Scale (Brand)</SubsectionTitle>
            <PaletteSwatchRow items={colors.terra} />
          </div>

          {/* Terra scale construction documentation */}
          <div id="terra-construction" className={s.lumenSection}>
            <SubsectionTitle>How This Scale Is Built</SubsectionTitle>
            <p className={s.lumenNarrative}>
              Terra is a warm amber accent seeded from{" "}
              <code className={s.lumenCode}>#FAF9F6</code>, then hue-tuned to
              70&deg; for a richer, redder warmth that reads as amber/sienna
              rather than gold. It follows the same OKLCH construction as Lumen,
              providing a full-range warm complement to the cool blue-violet brand.
            </p>

            <div className={s.lumenMethodBox}>
              <p className={s.lumenMethodTitle}>OKLCH Construction</p>
              <p className={s.lumenMethodDesc}>
                Same methodology as Lumen: grade 60 is the brand anchor.
                Peak chroma scaled to 0.480&times; Lumen&apos;s to match warm
                earth-tone gamut limits. Hue tuned from seed (91.4&deg;) to
                70&deg; for redder warmth.
              </p>
              <div className={s.lumenParamGrid}>
                <div className={s.lumenParam}>
                  <span className={s.lumenParamLabel}>Lightness</span>
                  <span className={s.lumenParamValue}>
                    Even ramp: &Delta;L&nbsp;&asymp;&nbsp;0.093 (10&ndash;60),
                    &Delta;L&nbsp;&asymp;&nbsp;0.081 (60&ndash;100)
                  </span>
                </div>
                <div className={s.lumenParam}>
                  <span className={s.lumenParamLabel}>Chroma</span>
                  <span className={s.lumenParamValue}>
                    Sine arc peaking at grade 60 (C&nbsp;=&nbsp;0.135), tapering
                    to both extremes
                  </span>
                </div>
                <div className={s.lumenParam}>
                  <span className={s.lumenParamLabel}>Hue</span>
                  <span className={s.lumenParamValue}>
                    Constant 70&deg; across all steps (no hue discontinuity)
                  </span>
                </div>
              </div>
            </div>

            <div className={s.lumenTable}>
              <table className={s.lumenTableEl}>
                <thead>
                  <tr>
                    <th>Step</th>
                    <th>Hex</th>
                    <th>OKLCH</th>
                    <th>vs White</th>
                    <th>vs #161616</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { step: 5, hex: "#FAF8F6", oklch: "0.98, 0.003, 70", w: "1.06:1", d: "17.1:1" },
                    { step: 10, hex: "#F5F1EC", oklch: "0.96, 0.008, 70", w: "1.1:1", d: "16.1:1" },
                    { step: 20, hex: "#E0D0BF", oklch: "0.87, 0.030, 70", w: "1.5:1", d: "12.0:1" },
                    { step: 30, hex: "#CCB091", oklch: "0.77, 0.053, 70", w: "2.1:1", d: "8.8:1" },
                    { step: 40, hex: "#B89062", oklch: "0.68, 0.079, 70", w: "2.9:1", d: "6.2:1" },
                    { step: 50, hex: "#A4702C", oklch: "0.59, 0.106, 70", w: "4.3:1", d: "4.3:1" },
                    { step: 60, hex: "#915000", oklch: "0.50, 0.135, 70", w: "6.3:1", d: "2.9:1" },
                    { step: 70, hex: "#743B00", oklch: "0.41, 0.123, 70", w: "8.9:1", d: "2.0:1" },
                    { step: 80, hex: "#542A00", oklch: "0.33, 0.096, 70", w: "12.3:1", d: "1.5:1" },
                    { step: 90, hex: "#341B00", oklch: "0.25, 0.062, 70", w: "16.1:1", d: "1.1:1" },
                    { step: 100, hex: "#170D03", oklch: "0.17, 0.028, 70", w: "19.2:1", d: "1.1:1" },
                  ].map((row) => (
                    <tr key={row.step} className={row.step === 60 ? s.lumenAnchorRow : undefined}>
                      <td>{row.step}</td>
                      <td>
                        <code className={s.lumenCode}>{row.hex}</code>
                      </td>
                      <td>
                        <code className={s.lumenCodeMuted}>{row.oklch}</code>
                      </td>
                      <td>{row.w}</td>
                      <td>{row.d}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className={s.paletteGroup}>
            <SubsectionTitle>Neutral Scale</SubsectionTitle>
            <PaletteSwatchRow items={colors.neutral} />
          </div>

          <div className={s.paletteGroup}>
            <SubsectionTitle>
              Extended Palette (Carbon-Influenced)
            </SubsectionTitle>
            <SectionDescription>
              Sourced from @carbon/colors v11. Available for status indicators,
              data visualization, tags, and syntax highlighting.
            </SectionDescription>
            {colors.extended.map((family) => (
              <div key={family.prefix} className={s.familyBlock}>
                <p className={s.familyName}>{family.name}</p>
                <PaletteSwatchRow items={family.steps} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </Shell>
  );
}
