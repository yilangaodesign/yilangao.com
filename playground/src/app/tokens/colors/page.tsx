"use client";

import { Shell } from "@/components/shell";
import { SectionHeading } from "@/components/token-grid";
import ScrollSpy from "@/components/scroll-spy";
import { colors } from "@/lib/tokens";
import type { RoleGroup, EmphasisToken, SemanticToken } from "@/lib/tokens";
import { useState } from "react";
import Check from "lucide-react/dist/esm/icons/check";
import Copy from "lucide-react/dist/esm/icons/copy";

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
    <button
      onClick={copy}
      className="group text-left w-[52px] p-0.5 rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <div
        className="h-12 w-12 rounded-sm border relative overflow-hidden transition-transform group-hover:scale-105"
        style={{
          backgroundColor: color,
          borderColor: dark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.12)",
        }}
      >
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20">
          {copied ? (
            <Check className="w-3.5 h-3.5 text-white" />
          ) : (
            <Copy className="w-3 h-3 text-white" />
          )}
        </div>
      </div>
      <p
        className="mt-1 text-[10px] font-medium truncate"
        style={{ color: dark ? "#F4F4F4" : "#161616" }}
      >
        {label}
      </p>
      {sublabel && (
        <p
          className="text-[9px] font-mono truncate"
          style={{ color: dark ? "#8D8D8D" : "#6F6F6F" }}
        >
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
    <div className="flex gap-4 items-start">
      <div className="w-20 shrink-0 pt-1">
        <p className="text-xs font-medium">{titleCase(role.role)}</p>
      </div>

      <div className="flex-1 flex flex-col gap-3">
        {/* Light theme strip */}
        <div
          className="rounded-md px-3 py-2.5 border"
          style={{
            backgroundColor: "#FFFFFF",
            borderColor: "rgba(0,0,0,0.08)",
          }}
        >
          <p
            className="text-[9px] font-medium uppercase tracking-wider mb-2"
            style={{ color: "#8D8D8D" }}
          >
            Light
          </p>
          <div className="flex flex-wrap gap-1.5">
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

        {/* Dark theme strip */}
        {showDark && (
          <div
            className="rounded-md px-3 py-2.5 border"
            style={{
              backgroundColor: "#161616",
              borderColor: "rgba(255,255,255,0.08)",
            }}
          >
            <p
              className="text-[9px] font-medium uppercase tracking-wider mb-2"
              style={{ color: "#8D8D8D" }}
            >
              Dark
            </p>
            <div className="flex flex-wrap gap-1.5">
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
    <div id={property} className="mb-16 scroll-mt-24">
      <h3 className="text-lg font-semibold tracking-tight mb-1">
        {titleCase(property)}
      </h3>
      <p className="text-sm text-muted-foreground mb-6">{description}</p>

      <div className="space-y-6">
        {neutralRole && <ThemedRoleRow role={neutralRole} />}
        {otherRoles.map((role) => (
          <ThemedRoleRow key={role.role} role={role} />
        ))}
      </div>
    </div>
  );
}

function InteractionSection({
  tokens,
}: {
  tokens: SemanticToken[];
}) {
  const showDark = tokens.some((t) => t.darkValue);

  return (
    <div id="interaction" className="mb-16 scroll-mt-24">
      <h3 className="text-lg font-semibold tracking-tight mb-1">
        Focus & Highlight
      </h3>
      <p className="text-sm text-muted-foreground mb-6">
        Interaction state tokens. These are global — they don&apos;t follow the
        property dimension.
      </p>

      <div className="flex flex-col gap-3">
        <div
          className="rounded-md px-3 py-2.5 border"
          style={{
            backgroundColor: "#FFFFFF",
            borderColor: "rgba(0,0,0,0.08)",
          }}
        >
          <p
            className="text-[9px] font-medium uppercase tracking-wider mb-2"
            style={{ color: "#8D8D8D" }}
          >
            Light
          </p>
          <div className="flex flex-wrap gap-1.5">
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
          <div
            className="rounded-md px-3 py-2.5 border"
            style={{
              backgroundColor: "#161616",
              borderColor: "rgba(255,255,255,0.08)",
            }}
          >
            <p
              className="text-[9px] font-medium uppercase tracking-wider mb-2"
              style={{ color: "#8D8D8D" }}
            >
              Dark
            </p>
            <div className="flex flex-wrap gap-1.5">
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
    <div className="flex flex-wrap gap-1.5">
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
      <div className="max-w-5xl">
        <SectionHeading
          title="Colors"
          description="A structured, accessible color token system. Tokens follow a consistent naming formula that encodes what the color is applied to, its semantic intent, and its prominence level. Semantic tokens resolve to different values in light and dark themes — both are shown below."
        />

        {/* Architecture explanation */}
        <div id="token-architecture" className="mb-16 scroll-mt-24">
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-4">
            Token Architecture
          </h3>
          <div className="rounded-sm border border-border bg-muted/30 p-6 mb-4">
            <div className="flex items-center gap-2 font-mono text-sm flex-wrap">
              <span className="bg-foreground text-background px-3 py-1.5 rounded-sm">
                color
              </span>
              <span className="text-muted-foreground">.</span>
              <span className="bg-muted px-3 py-1.5 rounded-sm">property</span>
              <span className="text-muted-foreground">.</span>
              <span className="bg-muted px-3 py-1.5 rounded-sm">role</span>
              <span className="text-muted-foreground">.</span>
              <span className="bg-muted px-3 py-1.5 rounded-sm">emphasis</span>
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
        <InteractionSection tokens={colors.interaction} />

        {/* Palette Reference */}
        <div id="palette-reference" className="scroll-mt-24">
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-2">
            Palette Reference
          </h3>
          <p className="text-xs text-muted-foreground mb-8">
            Raw palette scales — implementation details behind the semantic
            tokens above. These are theme-invariant primitives. Components should
            not reference these directly.
          </p>

          <div className="mb-12">
            <h4 className="text-sm font-medium mb-4">Accent Scale (Brand)</h4>
            <PaletteSwatchRow items={colors.accent} />
          </div>

          <div className="mb-12">
            <h4 className="text-sm font-medium mb-4">Neutral Scale</h4>
            <PaletteSwatchRow items={colors.neutral} />
          </div>

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
                <PaletteSwatchRow items={family.steps} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </Shell>
  );
}
