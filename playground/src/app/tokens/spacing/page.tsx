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
          description="An 8px-grid spacing system with a 13-step component scale, 7-step layout rhythm, and 4 container widths. Inspired by Carbon's spacing methodology."
        />

        <SubSection title="Spacing Scale">
          <div className="space-y-1">
            {spacing.scale.map((s) => (
              <TokenRow
                key={s.name}
                label={`Spacing ${s.name}`}
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

        <SubSection title="Layout Rhythm">
          <div className="space-y-1">
            {spacing.layout.map((l) => (
              <TokenRow
                key={l.name}
                label={`Layout ${l.name}`}
                value={l.value}
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
