"use client";

import { useState } from "react";
import { Shell } from "@/components/shell";
import { SectionHeading, SubSection, TokenRow } from "@/components/token-grid";
import { motion as motionTokens } from "@/lib/tokens";

function EasingDemo({
  name,
  value,
  array,
  token,
}: {
  name: string;
  value: string;
  array: number[];
  token: string;
}) {
  const [playing, setPlaying] = useState(false);

  const play = () => {
    setPlaying(false);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => setPlaying(true));
    });
  };

  return (
    <div className="p-5 rounded-sm border border-border">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-sm font-medium">{name}</p>
          <p className="text-xs font-mono text-muted-foreground mt-0.5">{value}</p>
        </div>
        <button
          onClick={play}
          className="px-3 py-1.5 text-xs font-medium rounded-sm bg-muted hover:bg-muted/80 transition-colors"
        >
          Play
        </button>
      </div>

      <div className="relative h-10 bg-muted/50 rounded-sm overflow-hidden">
        <div
          className="absolute top-1 bottom-1 left-1 w-8 rounded-sm bg-accent"
          style={{
            transform: playing ? "translateX(calc(100% + 200px))" : "translateX(0)",
            transition: playing
              ? `transform 800ms ${value}`
              : "none",
          }}
        />
      </div>

      <div className="mt-4">
        <svg viewBox="0 0 200 100" className="w-full h-20 text-muted-foreground">
          <rect x="0" y="0" width="200" height="100" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.2" />
          <line x1="0" y1="100" x2="200" y2="0" stroke="currentColor" strokeWidth="0.5" strokeDasharray="4 4" opacity="0.2" />
          <path
            d={`M 0 100 C ${array[0] * 200} ${100 - array[1] * 100}, ${array[2] * 200} ${100 - array[3] * 100}, 200 0`}
            fill="none"
            stroke="var(--color-accent)"
            strokeWidth="2"
          />
        </svg>
      </div>

      <p className="text-[11px] font-mono text-muted-foreground mt-1">{token}</p>
    </div>
  );
}

function DurationDemo({
  name,
  value,
  token,
  use,
}: {
  name: string;
  value: string;
  token: string;
  use?: string;
}) {
  const [playing, setPlaying] = useState(false);
  const ms = parseInt(value);

  const play = () => {
    setPlaying(false);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => setPlaying(true));
    });
  };

  return (
    <button
      onClick={play}
      className="p-5 rounded-sm border border-border hover:bg-muted/30 transition-colors text-left w-full"
    >
      <div className="flex items-center justify-between mb-1">
        <p className="text-sm font-medium">{name}</p>
        <p className="text-xs font-mono text-muted-foreground">{value}</p>
      </div>
      {use && <p className="text-xs text-muted-foreground mb-3">{use}</p>}
      <div className="relative h-2 bg-muted rounded-full overflow-hidden">
        <div
          className="absolute inset-y-0 left-0 bg-accent rounded-full"
          style={{
            width: playing ? "100%" : "0%",
            transition: playing
              ? `width ${ms}ms cubic-bezier(0.2, 0, 0.38, 0.9)`
              : "none",
          }}
        />
      </div>
      <p className="text-[11px] font-mono text-muted-foreground mt-3">{token}</p>
    </button>
  );
}

export default function MotionPage() {
  return (
    <Shell title="Motion">
      <div className="max-w-5xl">
        <SectionHeading
          title="Motion & Interaction"
          description="Duration, easing, and choreography tokens for consistent animation. Follows Carbon's productive motion methodology. Available in SCSS via _motion.scss and in TS via src/lib/motion.ts."
        />

        {/* Easing Curves */}
        <SubSection title="Easing Curves">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {motionTokens.easings.map((e) => (
              <EasingDemo
                key={e.name}
                name={e.name}
                value={e.value}
                array={e.array}
                token={e.token}
              />
            ))}
          </div>
        </SubSection>

        {/* Durations */}
        <SubSection title="Durations">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {motionTokens.durations.map((d) => (
              <DurationDemo
                key={d.name}
                name={d.name}
                value={d.value}
                token={d.token}
                use={d.use}
              />
            ))}
          </div>
        </SubSection>

        {/* Choreography Presets */}
        <SubSection title="Choreography Presets (TS)">
          <p className="text-sm text-muted-foreground mb-4">
            Named transition presets from <code className="text-xs bg-muted px-1.5 py-0.5 rounded-sm font-mono">src/lib/motion.ts</code>. These combine token durations + easings into ready-to-spread Framer Motion objects.
          </p>
          <div className="rounded-sm border border-border overflow-x-auto">
            <table className="w-full text-sm min-w-[600px]">
              <thead>
                <tr className="bg-muted/50 border-b border-border">
                  <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">Preset</th>
                  <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">Duration</th>
                  <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">Easing</th>
                  <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">Use</th>
                </tr>
              </thead>
              <tbody>
                {motionTokens.choreography.map((c) => (
                  <tr key={c.name} className="border-b last:border-b-0 border-border">
                    <td className="px-4 py-2.5 font-mono text-xs font-medium text-accent whitespace-nowrap">{c.ts}</td>
                    <td className="px-4 py-2.5 font-mono text-xs text-muted-foreground whitespace-nowrap">{c.duration}</td>
                    <td className="px-4 py-2.5 font-mono text-xs text-muted-foreground whitespace-nowrap">{c.ease}</td>
                    <td className="px-4 py-2.5 text-muted-foreground">{c.use}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SubSection>

        {/* Interactive SCSS Mixins */}
        <SubSection title="Interactive Mixins (SCSS)">
          <p className="text-sm text-muted-foreground mb-4">
            SCSS mixins from <code className="text-xs bg-muted px-1.5 py-0.5 rounded-sm font-mono">src/styles/mixins/_interactive.scss</code>. All token-backed durations and easings.
          </p>
          <div className="space-y-1">
            {motionTokens.mixins.map((m) => (
              <TokenRow
                key={m.name}
                label={m.name}
                value={m.desc}
                token={m.token}
              />
            ))}
          </div>
        </SubSection>

        {/* Global Behaviors */}
        <SubSection title="Global Behaviors">
          <div className="space-y-1">
            {motionTokens.globals.map((g) => (
              <TokenRow
                key={g.name}
                label={g.name}
                value={g.desc}
                token={g.source}
              />
            ))}
          </div>
        </SubSection>

        {/* Z-Index Scale */}
        <SubSection title="Z-Index Scale">
          <div className="space-y-1">
            {motionTokens.zIndex.map((z) => (
              <TokenRow
                key={z.name}
                label={z.name}
                value={String(z.value)}
                token={z.token}
                preview={
                  <div className="flex items-center w-20">
                    <div
                      className="h-3 rounded-sm bg-accent/50"
                      style={{ width: `${Math.max(8, z.value / 8)}px` }}
                    />
                  </div>
                }
              />
            ))}
          </div>
        </SubSection>
      </div>
    </Shell>
  );
}
