"use client";

import { Shell } from "@/components/shell";
import { SectionHeading, SectionTitle, SectionDescription, SubSection, TokenRow } from "@/components/token-grid";
import ScrollSpy from "@/components/scroll-spy";
import { elevation } from "@/lib/tokens";

const scrollSpySections = [
  { id: "token-architecture", label: "Architecture" },
  { id: "shadows", label: "Shadows" },
  { id: "border-radius", label: "Border Radius" },
  { id: "combined-demo", label: "Combined Demo" },
];

export default function ElevationPage() {
  return (
    <Shell title="Elevation">
      <ScrollSpy sections={scrollSpySections} />
      <div className="max-w-5xl">
        <SectionHeading
          title="Elevation"
          description="Shadow depth levels and border-radius tokens for consistent visual hierarchy and shape language."
        />

        <SectionTitle id="token-architecture">Token Architecture</SectionTitle>
        <SectionDescription>
          Elevation tokens use a size-scale naming convention. Shadows follow
          shadow-sm / shadow-md / shadow-lg / shadow-xl / shadow-overlay,
          indicating increasing visual depth. Border radii mirror the same
          scale pattern with radius-sm / radius-md / radius-lg / radius-full
          for shape consistency. Both scales progress from subtle to prominent.
        </SectionDescription>

        <SubSection id="shadows" title="Shadows">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
            {elevation.shadows.map((s) => (
              <div key={s.name} className="text-center">
                <div
                  className="h-24 rounded-sm bg-card border border-border/30 flex items-center justify-center mb-3"
                  style={{ boxShadow: s.value }}
                >
                  <span className="text-sm font-medium">{s.name}</span>
                </div>
                <p className="text-xs font-mono text-muted-foreground">{s.token}</p>
                <p className="text-[11px] font-mono text-muted-foreground mt-0.5">{s.value}</p>
              </div>
            ))}
          </div>
        </SubSection>

        <SubSection id="border-radius" title="Border Radius">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {elevation.radii.map((r) => (
              <div key={r.name} className="text-center">
                <div className="flex items-center justify-center mb-3">
                  <div
                    className="w-16 h-16 bg-accent/20 border-2 border-accent/50"
                    style={{ borderRadius: r.value }}
                  />
                </div>
                <p className="text-sm font-medium">{r.name}</p>
                <p className="text-xs font-mono text-muted-foreground">{r.value}</p>
                <p className="text-[11px] font-mono text-muted-foreground">{r.token}</p>
              </div>
            ))}
          </div>
        </SubSection>

        <SubSection id="combined-demo" title="Combined Demo">
          <div className="flex flex-wrap gap-6 p-8 rounded-sm bg-muted/30 border border-border">
            {elevation.shadows.slice(1).map((s, i) => (
              <div
                key={s.name}
                className="w-28 h-28 rounded-sm bg-card flex items-center justify-center"
                style={{
                  boxShadow: s.value,
                  borderRadius: elevation.radii[Math.min(i + 1, elevation.radii.length - 2)].value,
                }}
              >
                <div className="text-center">
                  <p className="text-xs font-medium">{s.name}</p>
                  <p className="text-[11px] text-muted-foreground">
                    {elevation.radii[Math.min(i + 1, elevation.radii.length - 2)].name}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </SubSection>
      </div>
    </Shell>
  );
}
