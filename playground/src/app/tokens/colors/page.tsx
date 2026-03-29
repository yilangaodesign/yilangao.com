"use client";

import { Shell } from "@/components/shell";
import { ColorSwatch, SectionHeading, SubSection } from "@/components/token-grid";
import { colors } from "@/lib/tokens";

export default function ColorsPage() {
  return (
    <Shell title="Colors">
      <div className="max-w-5xl">
        <SectionHeading
          title="Colors"
          description="A comprehensive, accessible color palette influenced by IBM Carbon. The palette is a toolkit — having a color here doesn't mean it must be used. The UI remains neutral-dominant with selective, intentional color."
        />

        <SubSection title="Accent Scale (Brand)">
          <div className="grid grid-cols-5 sm:grid-cols-10 gap-2 sm:gap-3">
            {colors.accent.map((c) => (
              <ColorSwatch
                key={c.step}
                color={c.value}
                label={c.step}
                sublabel={c.value}
                large
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
                large
              />
            ))}
          </div>
        </SubSection>

        <div className="mb-12">
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-2">
            Extended Palette (Carbon-Influenced)
          </h3>
          <p className="text-xs text-muted-foreground mb-6">
            Sourced from @carbon/colors v11. Available for status indicators, data visualization, tags, and syntax highlighting.
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

        <SubSection title="Surfaces">
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {colors.semantic.surface.map((s) => (
              <ColorSwatch
                key={s.name}
                color={s.value}
                label={s.name}
                sublabel={s.token}
                large
              />
            ))}
          </div>
        </SubSection>

        <SubSection title="Text">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {colors.semantic.text.map((t) => (
              <div key={t.name} className="flex items-center gap-4 p-4 rounded-sm border border-border">
                <div
                  className="w-10 h-10 rounded-sm border border-border/50 shrink-0"
                  style={{ backgroundColor: t.value }}
                />
                <div>
                  <p className="text-sm font-medium">{t.name}</p>
                  <p className="text-xs font-mono text-muted-foreground">{t.value}</p>
                  <p className="text-[11px] font-mono text-muted-foreground">{t.token}</p>
                </div>
              </div>
            ))}
          </div>
        </SubSection>

        <SubSection title="Borders">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {colors.semantic.border.map((b) => (
              <div key={b.name} className="p-5 rounded-sm" style={{ border: `2px solid ${b.value}` }}>
                <p className="text-sm font-medium">{b.name}</p>
                <p className="text-xs font-mono text-muted-foreground">{b.value}</p>
                <p className="text-[11px] font-mono text-muted-foreground">{b.token}</p>
              </div>
            ))}
          </div>
        </SubSection>

        <SubSection title="Support">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {colors.semantic.support.map((s) => (
              <div key={s.name} className="flex items-center gap-4 p-4 rounded-sm border border-border">
                <div
                  className="w-10 h-10 rounded-sm shrink-0"
                  style={{ backgroundColor: s.value }}
                />
                <div>
                  <p className="text-sm font-medium">{s.name}</p>
                  <p className="text-xs font-mono text-muted-foreground">{s.value}</p>
                  <p className="text-[11px] font-mono text-muted-foreground">{s.token}</p>
                </div>
              </div>
            ))}
          </div>
        </SubSection>

        <SubSection title="Focus & Highlight">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {[...colors.semantic.focus, ...colors.semantic.highlight].map((f) => (
              <div key={f.name} className="flex items-center gap-4 p-4 rounded-sm border border-border">
                <div
                  className="w-10 h-10 rounded-sm border border-border/50 shrink-0"
                  style={{ backgroundColor: f.value }}
                />
                <div>
                  <p className="text-sm font-medium">{f.name}</p>
                  <p className="text-xs font-mono text-muted-foreground">{f.value}</p>
                  <p className="text-[11px] font-mono text-muted-foreground">{f.token}</p>
                </div>
              </div>
            ))}
          </div>
        </SubSection>
      </div>
    </Shell>
  );
}
