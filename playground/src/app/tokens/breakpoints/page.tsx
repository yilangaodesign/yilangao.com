"use client";

import { Shell } from "@/components/shell";
import { SectionHeading, SubSection, TokenRow } from "@/components/token-grid";
import { breakpoints, densityModes, spacing } from "@/lib/tokens";

function BreakpointVisual({ value, max }: { value: number; max: number }) {
  const pct = Math.min((value / max) * 100, 100);
  return (
    <div className="relative h-3 bg-muted rounded-sm overflow-hidden w-full">
      <div
        className="absolute inset-y-0 left-0 bg-accent/50 rounded-sm transition-all"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

export default function BreakpointsPage() {
  const maxBp = parseInt(breakpoints[breakpoints.length - 1].value);

  return (
    <Shell title="Breakpoints">
      <div className="max-w-5xl">
        <SectionHeading
          title="Breakpoints"
          description="6-tier enterprise breakpoint scale for B2B SaaS. Values selected from comparative audit of IBM Carbon, OneGS, and Tailwind v4. Column logic: doubles at major layout shifts (4→8→16). Above md, column count holds at 16."
        />

        <SubSection title="Breakpoint Scale">
          <div className="space-y-1">
            {breakpoints.map((bp) => (
              <TokenRow
                key={bp.name}
                label={bp.name}
                value={`${bp.value} · ${bp.columns} col`}
                token={bp.token}
                preview={
                  <div className="flex items-center w-24 sm:w-40">
                    <BreakpointVisual
                      value={parseInt(bp.value)}
                      max={maxBp}
                    />
                  </div>
                }
              />
            ))}
          </div>
        </SubSection>

        <SubSection title="Breakpoint Details">
          <div className="space-y-3">
            {breakpoints.map((bp) => {
              const px = parseInt(bp.value);
              return (
                <div
                  key={bp.name}
                  className="rounded-sm border border-border p-5"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-semibold">{bp.name}</span>
                      <span className="text-xs font-mono text-muted-foreground">
                        {bp.value} ({(px / 16).toFixed(bp.name === "xs" ? 3 : 0)}rem)
                      </span>
                    </div>
                    <span className="text-xs px-2 py-0.5 rounded-sm bg-muted text-muted-foreground">
                      {bp.origin}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mb-3">
                    {bp.description} &middot; {bp.columns} columns
                  </p>
                  <BreakpointVisual value={px} max={maxBp} />
                  <p className="text-xs font-mono text-muted-foreground mt-2">
                    SCSS: <code>{bp.token}</code> &middot; CSS:{" "}
                    <code>--breakpoint-{bp.name}</code> &middot; Tailwind:{" "}
                    <code>{bp.name}:</code>
                  </p>
                </div>
              );
            })}
          </div>
        </SubSection>

        <SubSection title="Density Modes">
          <p className="text-xs text-muted-foreground mb-3">
            Information density is orthogonal to viewport size. Breakpoints
            control layout; density modes control spacing within that layout.
            Adopted from IBM Carbon&apos;s gutter system.
          </p>
          <div className="space-y-1">
            {densityModes.map((dm) => (
              <TokenRow
                key={dm.name}
                label={dm.name}
                value={`${dm.gutter} gutter`}
                token={dm.description}
                preview={
                  <div className="flex items-center gap-px w-24 sm:w-40">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div
                        key={i}
                        className="h-6 flex-1 bg-accent/30 rounded-sm"
                        style={{
                          marginRight:
                            i < 3 ? dm.gutter : "0",
                        }}
                      />
                    ))}
                  </div>
                }
              />
            ))}
          </div>
        </SubSection>

        <SubSection title="Container Widths">
          <p className="text-xs text-muted-foreground mb-3">
            Semantic container names avoid collision with breakpoint tier names.
          </p>
          <div className="space-y-3">
            {spacing.containers.map((c, idx) => (
              <div key={c.name} className="rounded-sm border border-border p-5">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium">{c.name}</span>
                  <span className="text-xs font-mono text-muted-foreground">
                    {c.value}
                  </span>
                </div>
                <div className="relative h-4 bg-muted rounded-full overflow-hidden">
                  <div
                    className="absolute inset-y-0 left-0 bg-accent/30 rounded-full"
                    style={{
                      width: `${(parseInt(c.value) / parseInt(spacing.containers[spacing.containers.length - 1].value)) * 100}%`,
                    }}
                  />
                </div>
                <p className="text-xs font-mono text-muted-foreground mt-2">
                  {c.token}
                </p>
              </div>
            ))}
          </div>
        </SubSection>

        <SubSection title="Migration Reference">
          <p className="text-xs text-muted-foreground mb-3">
            Legacy token mapping for incremental migration from the Carbon-derived scale.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border text-left">
                  <th className="py-2 pr-4 font-medium text-muted-foreground">Old Token</th>
                  <th className="py-2 pr-4 font-medium text-muted-foreground">Old Value</th>
                  <th className="py-2 pr-4 font-medium text-muted-foreground">New Token</th>
                  <th className="py-2 font-medium text-muted-foreground">New Value</th>
                </tr>
              </thead>
              <tbody className="font-mono">
                {[
                  ["$portfolio-bp-sm", "320px", "$elan-bp-xs", "375px"],
                  ["$portfolio-bp-md", "672px", "$elan-bp-sm", "672px"],
                  ["$portfolio-bp-lg", "1056px", "$elan-bp-md", "1056px"],
                  ["$portfolio-bp-xl", "1312px", "—", "Dropped"],
                  ["$portfolio-bp-2xl", "1584px", "—", "Dropped"],
                  ["—", "—", "$elan-bp-lg", "1440px (new)"],
                  ["—", "—", "$elan-bp-xl", "1920px (new)"],
                  ["—", "—", "$elan-bp-2xl", "2560px (new)"],
                ].map(([oldToken, oldVal, newToken, newVal], i) => (
                  <tr key={i} className="border-b border-border/50">
                    <td className="py-1.5 pr-4 text-muted-foreground">{oldToken}</td>
                    <td className="py-1.5 pr-4">{oldVal}</td>
                    <td className="py-1.5 pr-4 text-accent">{newToken}</td>
                    <td className="py-1.5">{newVal}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SubSection>
      </div>
    </Shell>
  );
}
