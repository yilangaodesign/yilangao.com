"use client";

import { Shell } from "@/components/shell";
import {
  ColorSwatch,
  SectionHeading,
  SubSection,
} from "@/components/token-grid";
import ScrollSpy from "@/components/scroll-spy";
import { colors } from "@/lib/tokens";
import type { EmphasisToken, RoleGroup } from "@/lib/tokens";


const scrollSpySections = [
  { id: "token-architecture", label: "Architecture" },
  { id: "surface", label: "Surface" },
  { id: "text", label: "Text" },
  { id: "icon", label: "Icon" },
  { id: "border", label: "Border" },
  { id: "action", label: "Action" },
  { id: "interaction", label: "Focus & Highlight" },
  { id: "palette-reference", label: "Palette Reference" },
];

function titleCase(str: string) {
  return str
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function EmphasisSwatch({ token }: { token: EmphasisToken }) {
  return (
    <div className="min-w-0">
      <div
        className="h-14 rounded-sm border border-border/50"
        style={{ backgroundColor: token.value }}
      />
      <p className="mt-1.5 text-xs font-medium truncate">
        {token.emphasis ? titleCase(token.emphasis) : "Default"}
      </p>
      <p className="text-[11px] text-muted-foreground font-mono truncate">
        {token.value}
      </p>
    </div>
  );
}

function RoleRow({ role }: { role: RoleGroup }) {
  return (
    <div className="flex gap-4 items-start">
      <div className="w-24 shrink-0 pt-1">
        <p className="text-xs font-medium">{titleCase(role.role)}</p>
      </div>
      <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2">
        {role.tokens.map((t) => (
          <EmphasisSwatch key={t.token} token={t} />
        ))}
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
    <div id={property} className="mb-16 scroll-mt-16">
      <h3 className="text-lg font-semibold tracking-tight mb-1">
        {titleCase(property)}
      </h3>
      <p className="text-sm text-muted-foreground mb-6">{description}</p>

      <div className="space-y-4">
        {neutralRole && <RoleRow role={neutralRole} />}
        {otherRoles.map((role) => (
          <RoleRow key={role.role} role={role} />
        ))}
      </div>
    </div>
  );
}

export default function ColorsPage() {
  return (
    <Shell title="Colors">
      <ScrollSpy sections={scrollSpySections} />
      <div className="max-w-5xl">
        <SectionHeading
          title="Colors"
          description="A structured, accessible color token system. Tokens follow a consistent naming formula that encodes what the color is applied to, its semantic intent, and its prominence level."
        />

        {/* Architecture explanation */}
        <div id="token-architecture" className="mb-16 scroll-mt-16">
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-4">
            Token Architecture
          </h3>
          <div className="rounded-sm border border-border bg-muted/30 p-6 mb-4">
            <div className="flex items-center gap-2 font-mono text-sm flex-wrap">
              <span className="bg-foreground text-background px-3 py-1.5 rounded-sm">
                color
              </span>
              <span className="text-muted-foreground">.</span>
              <span className="bg-muted px-3 py-1.5 rounded-sm">
                property
              </span>
              <span className="text-muted-foreground">.</span>
              <span className="bg-muted px-3 py-1.5 rounded-sm">role</span>
              <span className="text-muted-foreground">.</span>
              <span className="bg-muted px-3 py-1.5 rounded-sm">
                emphasis
              </span>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
            <div className="space-y-1">
              <p className="font-medium">Property</p>
              <p className="text-muted-foreground">
                What element type the color applies to.
              </p>
              <div className="flex flex-wrap gap-1 pt-1">
                {["surface", "text", "icon", "border", "action"].map((p) => (
                  <span
                    key={p}
                    className="px-2 py-0.5 bg-muted rounded-full text-xs font-mono"
                  >
                    {p}
                  </span>
                ))}
              </div>
            </div>
            <div className="space-y-1">
              <p className="font-medium">Role</p>
              <p className="text-muted-foreground">
                Semantic intent of the color.
              </p>
              <div className="flex flex-wrap gap-1 pt-1">
                {[
                  "neutral",
                  "brand",
                  "inverse",
                  "positive",
                  "warning",
                  "negative",
                ].map((r) => (
                  <span
                    key={r}
                    className="px-2 py-0.5 bg-muted rounded-full text-xs font-mono"
                  >
                    {r}
                  </span>
                ))}
              </div>
            </div>
            <div className="space-y-1">
              <p className="font-medium">Emphasis</p>
              <p className="text-muted-foreground">
                Prominence level, relative within its group.
              </p>
              <div className="flex flex-wrap gap-1 pt-1">
                {["bold", "regular", "subtle", "minimal"].map((e) => (
                  <span
                    key={e}
                    className="px-2 py-0.5 bg-muted rounded-full text-xs font-mono"
                  >
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
        <div id="interaction" className="mb-16 scroll-mt-16">
          <h3 className="text-lg font-semibold tracking-tight mb-1">
            Focus & Highlight
          </h3>
          <p className="text-sm text-muted-foreground mb-6">
            Interaction state tokens. These are global — they don&apos;t follow
            the property dimension.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
            {colors.interaction.map((t) => (
              <ColorSwatch
                key={t.name}
                color={t.value}
                label={t.name}
                sublabel={t.value}
              />
            ))}
          </div>
        </div>

        {/* Palette Reference */}
        <div id="palette-reference" className="scroll-mt-16">
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-2">
            Palette Reference
          </h3>
          <p className="text-xs text-muted-foreground mb-8">
            Raw palette scales — implementation details behind the semantic
            tokens above. Components should not reference these directly.
          </p>

          <SubSection title="Accent Scale (Brand)">
            <div className="grid grid-cols-5 sm:grid-cols-10 gap-2 sm:gap-3">
              {colors.accent.map((c) => (
                <ColorSwatch
                  key={c.step}
                  color={c.value}
                  label={c.step}
                  sublabel={c.value}
                />
              ))}
            </div>
          </SubSection>

          <SubSection title="Neutral Scale">
            <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-12 gap-2 sm:gap-3">
              {colors.neutral.map((c) => (
                <ColorSwatch
                  key={c.step}
                  color={c.value}
                  label={c.step}
                  sublabel={c.value}
                />
              ))}
            </div>
          </SubSection>

          <div className="mb-12">
            <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-2">
              Extended Palette (Carbon-Influenced)
            </h4>
            <p className="text-xs text-muted-foreground mb-6">
              Sourced from @carbon/colors v11. Available for status indicators,
              data visualization, tags, and syntax highlighting.
            </p>
            {colors.extended.map((family) => (
              <div key={family.prefix} className="mb-6">
                <p className="text-xs font-medium mb-2">{family.name}</p>
                <div className="grid grid-cols-5 sm:grid-cols-10 gap-1.5 sm:gap-2">
                  {family.steps.map((c) => (
                    <ColorSwatch
                      key={c.step}
                      color={c.value}
                      label={c.step}
                      sublabel={c.value}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Shell>
  );
}
