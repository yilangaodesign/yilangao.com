"use client";

import { useState } from "react";
import { Shell } from "@/components/shell";
import { SectionHeading, SubSection, TokenRow } from "@/components/token-grid";
import { motion as motionTokens } from "@/lib/tokens";

const EASING = {
  standard: "cubic-bezier(0.2, 0, 0.38, 0.9)",
  entrance: "cubic-bezier(0, 0, 0.38, 0.9)",
  exit: "cubic-bezier(0.2, 0, 1, 0.9)",
  expressive: "cubic-bezier(0.4, 0.14, 0.3, 1)",
};
const DUR = { fast: 110, moderate: 240, slow: 400, slower: 600 };

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

/* ── Choreography preset demo ── */

function ChoreographyDemo({
  name,
  ts,
  duration,
  ease,
  use,
}: {
  name: string;
  ts: string;
  duration: string;
  ease: string;
  use: string;
}) {
  const [playing, setPlaying] = useState(false);

  const durationMs =
    duration.includes("0.6") ? DUR.slower
    : duration.includes("0.4") ? DUR.slow
    : duration.includes("0.24") ? DUR.moderate
    : DUR.moderate;

  const easingValue =
    ease === "entrance" ? EASING.entrance
    : ease === "exit" ? EASING.exit
    : ease === "expressive" ? EASING.expressive
    : EASING.standard;

  const isScale = ts === "TRANSITION_HOVER_SCALE";
  const isExpand = ts === "TRANSITION_EXPAND";
  const isStagger = ts === "TRANSITION_STAGGER_ITEM";

  const play = () => {
    setPlaying(false);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => setPlaying(true));
    });
    setTimeout(() => setPlaying(false), durationMs + 800);
  };

  return (
    <div className="p-5 rounded-sm border border-border">
      <div className="flex items-center justify-between mb-1">
        <p className="text-sm font-medium font-mono text-accent">{ts}</p>
        <button
          onClick={play}
          className="px-3 py-1.5 text-xs font-medium rounded-sm bg-muted hover:bg-muted/80 transition-colors"
        >
          Play
        </button>
      </div>
      <p className="text-xs text-muted-foreground mb-4">{use}</p>
      <div className="flex items-center gap-2 text-[11px] font-mono text-muted-foreground mb-4">
        <span className="px-1.5 py-0.5 bg-muted rounded-sm">{duration}</span>
        <span className="px-1.5 py-0.5 bg-muted rounded-sm">{ease}</span>
      </div>

      <div className="relative h-16 bg-muted/30 rounded-sm overflow-hidden flex items-center px-4">
        {isStagger ? (
          <div className="flex gap-2">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className="w-8 h-8 rounded-sm bg-accent"
                style={{
                  opacity: playing ? 1 : 0,
                  transform: playing ? "translateY(0)" : "translateY(12px)",
                  transition: playing
                    ? `opacity ${durationMs}ms ${easingValue} ${i * 80}ms, transform ${durationMs}ms ${easingValue} ${i * 80}ms`
                    : "none",
                }}
              />
            ))}
          </div>
        ) : isExpand ? (
          <div
            className="w-full bg-accent/20 rounded-sm overflow-hidden"
            style={{
              height: playing ? "48px" : "0px",
              transition: playing
                ? `height ${durationMs}ms ${easingValue}`
                : `height ${durationMs}ms ${EASING.exit}`,
            }}
          >
            <div className="p-2 text-xs text-muted-foreground">Expanded content</div>
          </div>
        ) : isScale ? (
          <div
            className="w-16 h-10 rounded-sm bg-accent mx-auto"
            style={{
              transform: playing ? "scale(1.15)" : "scale(1)",
              transition: `transform ${durationMs}ms ${easingValue}`,
            }}
          />
        ) : (
          <div
            className="w-10 h-10 rounded-sm bg-accent"
            style={{
              opacity: playing ? 1 : 0,
              transform: playing ? "translateY(0)" : "translateY(16px)",
              transition: playing
                ? `opacity ${durationMs}ms ${easingValue}, transform ${durationMs}ms ${easingValue}`
                : "none",
            }}
          />
        )}
      </div>
    </div>
  );
}

/* ── Interactive mixin demos ── */

function HoverLiftDemo() {
  return (
    <MixinDemoCard
      name="hover-lift"
      token="@include hover-lift"
      desc="translateY(-4px) + shadow-lg on hover"
      hint="Hover the card"
    >
      <div
        className="w-full h-16 rounded-sm bg-accent/10 border border-border flex items-center justify-center text-xs text-muted-foreground"
        style={{
          transition: `transform ${DUR.moderate}ms ${EASING.standard}, box-shadow ${DUR.moderate}ms ${EASING.standard}`,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "translateY(-4px)";
          e.currentTarget.style.boxShadow = "0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -4px rgba(0,0,0,0.1)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "translateY(0)";
          e.currentTarget.style.boxShadow = "none";
        }}
      >
        Card element
      </div>
    </MixinDemoCard>
  );
}

function HoverMicroLiftDemo() {
  return (
    <MixinDemoCard
      name="hover-micro-lift"
      token="@include hover-micro-lift"
      desc="translateY(-1px) + opacity change on hover"
      hint="Hover the element"
    >
      <div
        className="w-full h-12 rounded-sm bg-accent/10 border border-border flex items-center justify-center text-xs text-muted-foreground"
        style={{
          opacity: 0.85,
          transition: `transform ${DUR.fast}ms ${EASING.standard}, opacity ${DUR.fast}ms ${EASING.standard}`,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "translateY(-1px)";
          e.currentTarget.style.opacity = "1";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "translateY(0)";
          e.currentTarget.style.opacity = "0.85";
        }}
      >
        List item
      </div>
    </MixinDemoCard>
  );
}

function HoverScaleDemo() {
  return (
    <MixinDemoCard
      name="hover-scale"
      token="@include hover-scale($scale)"
      desc="scale(1.02) on hover with will-change"
      hint="Hover the image"
    >
      <div className="rounded-sm overflow-hidden border border-border">
        <div
          className="w-full h-20 bg-gradient-to-br from-accent/20 to-accent/5 flex items-center justify-center text-xs text-muted-foreground"
          style={{
            willChange: "transform",
            transition: `transform ${DUR.slow}ms ${EASING.standard}`,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "scale(1.02)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "scale(1)";
          }}
        >
          Thumbnail
        </div>
      </div>
    </MixinDemoCard>
  );
}

function TransitionBaseDemo() {
  const [active, setActive] = useState(false);
  return (
    <MixinDemoCard
      name="transition-base"
      token="@include transition-base"
      desc="all properties · 240ms · standard easing"
      hint="Click to toggle"
    >
      <button
        onClick={() => setActive((v) => !v)}
        className="w-full h-12 rounded-sm border border-border flex items-center justify-center text-xs font-medium"
        style={{
          backgroundColor: active ? "var(--color-accent)" : "transparent",
          color: active ? "white" : "var(--color-muted-foreground)",
          borderColor: active ? "var(--color-accent)" : undefined,
          transition: `all ${DUR.moderate}ms ${EASING.standard}`,
        }}
      >
        {active ? "Active" : "Inactive"}
      </button>
    </MixinDemoCard>
  );
}

function TransitionFastDemo() {
  const [active, setActive] = useState(false);
  return (
    <MixinDemoCard
      name="transition-fast"
      token="@include transition-fast"
      desc="all properties · 110ms · standard easing"
      hint="Click to toggle"
    >
      <button
        onClick={() => setActive((v) => !v)}
        className="w-full h-12 rounded-sm border border-border flex items-center justify-center text-xs font-medium"
        style={{
          backgroundColor: active ? "var(--color-accent)" : "transparent",
          color: active ? "white" : "var(--color-muted-foreground)",
          borderColor: active ? "var(--color-accent)" : undefined,
          transition: `all ${DUR.fast}ms ${EASING.standard}`,
        }}
      >
        {active ? "Active" : "Inactive"}
      </button>
    </MixinDemoCard>
  );
}

function CompoundCardHoverDemo() {
  const [hovered, setHovered] = useState(false);
  return (
    <MixinDemoCard
      name="compound-card-hover"
      token="@include compound-card-hover($img, $title)"
      desc="Parent hover triggers child image scale + title recolor"
      hint="Hover the card"
    >
      <div
        className="rounded-sm border border-border overflow-hidden cursor-pointer"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <div className="overflow-hidden">
          <div
            className="w-full h-14 bg-gradient-to-br from-accent/20 to-accent/5 flex items-center justify-center text-xs text-muted-foreground"
            style={{
              transform: hovered ? "scale(1.04)" : "scale(1)",
              transition: `transform ${DUR.slow}ms ${EASING.standard}`,
            }}
          >
            Image area
          </div>
        </div>
        <div className="px-3 py-2">
          <p
            className="text-xs font-medium"
            style={{
              color: hovered ? "var(--color-accent)" : undefined,
              transition: `color ${DUR.fast}ms ${EASING.standard}`,
            }}
          >
            Card Title
          </p>
          <p className="text-[11px] text-muted-foreground">Description text</p>
        </div>
      </div>
    </MixinDemoCard>
  );
}

function LinkColorDemo() {
  return (
    <MixinDemoCard
      name="link-color"
      token="@include link-color($hover-color)"
      desc="Color transition on hover · fast"
      hint="Hover the link"
    >
      <div className="flex items-center h-12 px-3">
        <a
          href="#"
          onClick={(e) => e.preventDefault()}
          className="text-sm font-medium"
          style={{
            color: "var(--color-muted-foreground)",
            transition: `color ${DUR.fast}ms ${EASING.standard}`,
          }}
          onMouseEnter={(e) => { e.currentTarget.style.color = "var(--color-accent)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = "var(--color-muted-foreground)"; }}
        >
          Navigation Link
        </a>
      </div>
    </MixinDemoCard>
  );
}

function LinkUnderlineDemo() {
  return (
    <MixinDemoCard
      name="link-underline"
      token="@include link-underline"
      desc="Animated underline via background-size · moderate"
      hint="Hover the link"
    >
      <div className="flex items-center h-12 px-3">
        <a
          href="#"
          onClick={(e) => e.preventDefault()}
          className="text-sm font-medium text-accent"
          style={{
            textDecoration: "none",
            backgroundImage: "linear-gradient(currentColor, currentColor)",
            backgroundPosition: "0% 100%",
            backgroundRepeat: "no-repeat",
            backgroundSize: "0% 1px",
            transition: `background-size ${DUR.moderate}ms ${EASING.standard}`,
          }}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundSize = "100% 1px"; }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundSize = "0% 1px"; }}
        >
          Animated Underline Link
        </a>
      </div>
    </MixinDemoCard>
  );
}

function FormFieldFocusDemo() {
  return (
    <MixinDemoCard
      name="form-field-focus"
      token="@include form-field-focus($accent)"
      desc="border-color + box-shadow on focus · fast"
      hint="Click to focus the input"
    >
      <input
        type="text"
        placeholder="Click to focus..."
        className="w-full h-10 rounded-sm border border-border bg-transparent px-3 text-sm text-foreground placeholder:text-muted-foreground outline-none"
        style={{
          transition: `border-color ${DUR.fast}ms ${EASING.standard}, box-shadow ${DUR.fast}ms ${EASING.standard}`,
        }}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = "var(--color-accent)";
          e.currentTarget.style.boxShadow = "0 0 0 2px color-mix(in srgb, var(--color-accent) 25%, transparent)";
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = "";
          e.currentTarget.style.boxShadow = "none";
        }}
      />
    </MixinDemoCard>
  );
}

function ReducedMotionDemo() {
  const [reduced, setReduced] = useState(false);
  const [playing, setPlaying] = useState(false);

  const play = () => {
    setPlaying(false);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => setPlaying(true));
    });
    setTimeout(() => setPlaying(false), 1200);
  };

  return (
    <MixinDemoCard
      name="reduced-motion"
      token="@include reduced-motion"
      desc="Zeroes all durations, disables smooth scroll"
      hint="Toggle reduced motion, then play"
    >
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setReduced((v) => !v)}
            className="px-3 py-1.5 text-xs font-medium rounded-sm border border-border hover:bg-muted/50 transition-colors"
          >
            {reduced ? "prefers-reduced-motion: reduce" : "prefers-reduced-motion: off"}
          </button>
          <button
            onClick={play}
            className="px-3 py-1.5 text-xs font-medium rounded-sm bg-muted hover:bg-muted/80 transition-colors"
          >
            Play
          </button>
        </div>
        <div className="relative h-10 bg-muted/30 rounded-sm overflow-hidden">
          <div
            className="absolute top-1 bottom-1 left-1 w-8 rounded-sm bg-accent"
            style={{
              transform: playing ? "translateX(calc(100% + 200px))" : "translateX(0)",
              transition: playing
                ? `transform ${reduced ? "0ms" : `${DUR.slow}ms`} ${EASING.standard}`
                : "none",
            }}
          />
        </div>
      </div>
    </MixinDemoCard>
  );
}

function FocusRingDemo() {
  return (
    <MixinDemoCard
      name="focus-ring"
      token="@include focus-ring"
      desc="2px solid accent outline, 2px offset"
      hint="Tab or click the button"
    >
      <div className="flex items-center justify-center h-12">
        <button
          className="px-4 py-2 text-xs font-medium rounded-sm bg-muted hover:bg-muted/80 transition-colors outline-none"
          style={{
            transition: `outline-color ${DUR.fast}ms ${EASING.standard}`,
          }}
          onFocus={(e) => {
            e.currentTarget.style.outline = "2px solid var(--color-accent)";
            e.currentTarget.style.outlineOffset = "2px";
          }}
          onBlur={(e) => {
            e.currentTarget.style.outline = "none";
          }}
        >
          Focusable Button
        </button>
      </div>
    </MixinDemoCard>
  );
}

function MixinDemoCard({
  name,
  token,
  desc,
  hint,
  children,
}: {
  name: string;
  token: string;
  desc: string;
  hint: string;
  children: React.ReactNode;
}) {
  return (
    <div className="p-5 rounded-sm border border-border">
      <div className="mb-1">
        <p className="text-sm font-medium">{name}</p>
        <p className="text-[11px] font-mono text-muted-foreground">{token}</p>
      </div>
      <p className="text-xs text-muted-foreground mb-4">{desc}</p>
      <div className="mb-3">{children}</div>
      <p className="text-[11px] text-muted-foreground/60 italic">{hint}</p>
    </div>
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
            Named transition presets from <code className="text-xs bg-muted px-1.5 py-0.5 rounded-sm font-mono">src/lib/motion.ts</code>. These combine token durations + easings into ready-to-spread Framer Motion objects. Click <strong>Play</strong> to see each preset in action.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {motionTokens.choreography.map((c) => (
              <ChoreographyDemo
                key={c.name}
                name={c.name}
                ts={c.ts}
                duration={c.duration}
                ease={c.ease}
                use={c.use}
              />
            ))}
          </div>
        </SubSection>

        {/* Interactive SCSS Mixins */}
        <SubSection title="Interactive Mixins (SCSS)">
          <p className="text-sm text-muted-foreground mb-4">
            Live demonstrations of SCSS mixins from <code className="text-xs bg-muted px-1.5 py-0.5 rounded-sm font-mono">_interactive.scss</code>. Each demo replicates the exact CSS the mixin produces, using the same token-backed durations and easings. Hover, click, or focus to see the effect.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <TransitionBaseDemo />
            <TransitionFastDemo />
            <HoverLiftDemo />
            <HoverMicroLiftDemo />
            <HoverScaleDemo />
            <CompoundCardHoverDemo />
            <LinkColorDemo />
            <LinkUnderlineDemo />
            <FormFieldFocusDemo />
            <FocusRingDemo />
            <ReducedMotionDemo />
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
