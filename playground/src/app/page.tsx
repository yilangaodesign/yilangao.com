"use client";

import Link from "next/link";
import { Shell } from "@/components/shell";
import { elan } from "@/lib/elan";
import { colors, typography, spacing, motion, elevation } from "@/lib/tokens";
import {
  Palette,
  Type,
  Ruler,
  Zap,
  Layers,
  ArrowRight,
} from "lucide-react";

const stylePages = [
  {
    title: "Colors",
    description: `${colors.accent.length + colors.neutral.length} color tokens across accent and neutral scales, plus semantic mappings for surfaces, text, borders, and support states.`,
    href: "/tokens/colors",
    icon: Palette,
    preview: (
      <div className="flex gap-1">
        {colors.accent.map((c) => (
          <div key={c.step} className="w-6 h-6 rounded-sm" style={{ background: c.value }} />
        ))}
      </div>
    ),
  },
  {
    title: "Typography",
    description: `${typography.scale.length}-step type scale from ${typography.scale[typography.scale.length - 1].px} to ${typography.scale[0].px}, with ${typography.weights.length} weights and ${typography.fonts.length} font stacks.`,
    href: "/tokens/typography",
    icon: Type,
    preview: (
      <div className="flex items-baseline gap-3">
        {typography.scale.slice(0, 5).map((t) => (
          <span key={t.name} style={{ fontSize: t.size, fontWeight: 600, lineHeight: 1 }}>
            Aa
          </span>
        ))}
      </div>
    ),
  },
  {
    title: "Spacing",
    description: `${spacing.scale.length}-step spacing scale (${spacing.scale[0].value}–${spacing.scale[spacing.scale.length - 1].value}), ${spacing.layout.length} layout rhythms, and ${spacing.containers.length} container widths.`,
    href: "/tokens/spacing",
    icon: Ruler,
    preview: (
      <div className="flex items-end gap-1">
        {spacing.scale.slice(0, 8).map((s) => (
          <div
            key={s.name}
            className="bg-accent/20 rounded-sm"
            style={{ width: "12px", height: s.value }}
          />
        ))}
      </div>
    ),
  },
  {
    title: "Motion",
    description: `${motion.durations.length} duration tokens and ${motion.easings.length} easing curves for consistent, expressive animations.`,
    href: "/tokens/motion",
    icon: Zap,
    preview: null,
  },
  {
    title: "Elevation",
    description: `${elevation.shadows.length} shadow levels and ${elevation.radii.length} border-radius tokens for consistent depth.`,
    href: "/tokens/elevation",
    icon: Layers,
    preview: (
      <div className="flex items-center gap-3">
        {elevation.shadows.slice(1, 5).map((s) => (
          <div
            key={s.name}
            className="w-10 h-10 rounded-sm bg-card"
            style={{ boxShadow: s.value }}
          />
        ))}
      </div>
    ),
  },
];

export default function OverviewPage() {
  return (
    <Shell title="Overview">
      <div className="max-w-5xl">
        {/* Hero */}
        <div className="mb-10">
          <p className="text-[11px] font-mono uppercase tracking-[0.15em] text-muted-foreground/60 mb-2">
            {elan.release.name}
          </p>
          <h2 className="text-3xl font-bold tracking-tight mb-3">
            A personal design system by Yilan Gao
          </h2>
          <p className="text-muted-foreground text-[15px] leading-relaxed max-w-2xl">
            Élan is the design language behind{" "}
            <span className="text-foreground font-medium">yilangao.com</span> —
            an opinionated collection of design tokens, components, and
            interaction patterns that define how the site looks, moves, and
            feels.
          </p>
        </div>

        {/* About sections */}
        <div className="grid gap-6 mb-12">
          <div className="p-5 rounded-sm border border-border bg-card">
            <h3 className="text-[13px] font-semibold uppercase tracking-[0.06em] text-muted-foreground mb-2">
              Intended Use
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              This system powers a personal portfolio and project showcase.
              Every token and component documented here is actively used in
              production on yilangao.com. The playground serves as both
              living documentation and a development environment for iterating
              on the design language.
            </p>
          </div>
          <div className="p-5 rounded-sm border border-border bg-card">
            <h3 className="text-[13px] font-semibold uppercase tracking-[0.06em] text-muted-foreground mb-2">
              How It&apos;s Built
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Élan draws from personal design sensibility and established
              open-source design systems. The spacing and motion scales are
              influenced by IBM Carbon; the color system follows a structured
              property·role·emphasis naming convention inspired by Goldman
              Sachs&apos;s One GS. Components are built from scratch or adapted
              from open-source libraries with custom styling that conforms to
              the token system. Based on an 8px grid.
            </p>
          </div>
        </div>

        {/* Style pages */}
        <div className="mb-6">
          <h3 className="text-[11px] font-mono uppercase tracking-[0.15em] text-muted-foreground/60 mb-4">
            Styles
          </h3>
          <div className="grid gap-4">
            {stylePages.map((section) => {
              const Icon = section.icon;
              return (
                <Link
                  key={section.href}
                  href={section.href}
                  className="group flex items-start gap-5 p-5 rounded-sm border border-border bg-card hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center justify-center w-10 h-10 rounded-sm bg-muted shrink-0">
                    <Icon className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      <h3 className="font-semibold">{section.title}</h3>
                      <ArrowRight className="w-3.5 h-3.5 text-muted-foreground opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">{section.description}</p>
                    {section.preview && <div className="mt-1">{section.preview}</div>}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </Shell>
  );
}
