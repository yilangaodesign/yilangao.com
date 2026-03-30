"use client";

import { Shell } from "@/components/shell";
import { SectionHeading, SubSection, TokenRow } from "@/components/token-grid";
import { spacing } from "@/lib/tokens";

export default function SpacingPage() {
  return (
    <Shell title="Spacing">
      <div className="max-w-5xl">
        <SectionHeading
          title="Spacing"
          description="Three-tier spacing system based on an 8px base unit (One GS reference). Tier 1: primitive spacer tokens (multiplier-based, value-derivable). Tier 2: semantic layout tokens (density-aware, intent-readable). Tier 3: utility tokens (component-internal spacing). Plus 4 container widths."
        />

        <SubSection title="Primitive Spacers (spacer-Nx)">
          <p className="text-xs text-muted-foreground mb-3">
            Base unit: 8px. Token name = multiplier &times; 8. Agent-readable: spacer-3x = 3 &times; 8 = 24px.
          </p>
          <div className="space-y-1">
            {spacing.scale.map((s) => (
              <TokenRow
                key={s.name}
                label={`spacer-${s.name}`}
                value={s.value}
                token={s.token}
                preview={
                  <div className="flex items-center w-24 sm:w-40">
                    <div
                      className="h-3 rounded-sm bg-accent/70"
                      style={{ width: s.value }}
                    />
                  </div>
                }
              />
            ))}
          </div>
        </SubSection>

        <SubSection title="Layout Spacers (spacer-layout-*)">
          <p className="text-xs text-muted-foreground mb-3">
            Semantic density names for page/section spacing. Default density: Functional.
          </p>
          <div className="space-y-1">
            {spacing.layout.map((l) => (
              <TokenRow
                key={l.name}
                label={`spacer-layout-${l.name}`}
                value={`${l.value}${"ref" in l ? ` → ${l.ref}` : ""}`}
                token={l.token}
                preview={
                  <div className="flex items-center w-24 sm:w-40">
                    <div
                      className="h-3 rounded-sm bg-accent/40"
                      style={{ width: l.value }}
                    />
                  </div>
                }
              />
            ))}
          </div>
        </SubSection>

        <SubSection title="Utility Spacers (spacer-utility-Nx)">
          <p className="text-xs text-muted-foreground mb-3">
            Component-internal spacing for buttons, inputs, checkboxes. Same multiplier values, separate namespace.
          </p>
          <div className="space-y-1">
            {spacing.utility.map((u) => (
              <TokenRow
                key={u.name}
                label={`spacer-utility-${u.name}`}
                value={u.value}
                token={u.token}
                preview={
                  <div className="flex items-center w-24 sm:w-40">
                    <div
                      className="h-3 rounded-sm bg-emerald-500/50"
                      style={{ width: u.value }}
                    />
                  </div>
                }
              />
            ))}
          </div>
        </SubSection>

        <SubSection title="Container Widths">
          <div className="space-y-3">
            {spacing.containers.map((c) => (
              <div key={c.name} className="rounded-sm border border-border p-5">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium">{c.name}</span>
                  <span className="text-xs font-mono text-muted-foreground">{c.value}</span>
                </div>
                <div className="relative h-4 bg-muted rounded-full overflow-hidden">
                  <div
                    className="absolute inset-y-0 left-0 bg-accent/30 rounded-full"
                    style={{ width: `${(parseInt(c.value) / parseInt(spacing.containers[spacing.containers.length - 1].value)) * 100}%` }}
                  />
                </div>
                <p className="text-xs font-mono text-muted-foreground mt-2">{c.token}</p>
              </div>
            ))}
          </div>
        </SubSection>
      </div>
    </Shell>
  );
}
