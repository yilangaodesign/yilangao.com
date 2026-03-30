"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Shell } from "@/components/shell";
import { SectionHeading } from "@/components/token-grid";
import { ComponentPreview, PropsTable } from "@/components/component-preview";
import { cn } from "@/lib/utils";

type TooltipSide = "top" | "bottom" | "left" | "right";

function DemoTooltip({
  children,
  content,
  side = "top",
  align = "center",
  delayDuration = 300,
}: {
  children: React.ReactNode;
  content: string;
  side?: TooltipSide;
  align?: "start" | "center" | "end";
  delayDuration?: number;
}) {
  const [visible, setVisible] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const triggerRef = useRef<HTMLSpanElement>(null);

  const show = useCallback(() => {
    timerRef.current = setTimeout(() => setVisible(true), delayDuration);
  }, [delayDuration]);

  const hide = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setVisible(false);
  }, []);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const positionClasses: Record<TooltipSide, string> = {
    top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
    bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
    left: "right-full top-1/2 -translate-y-1/2 mr-2",
    right: "left-full top-1/2 -translate-y-1/2 ml-2",
  };

  const arrowClasses: Record<TooltipSide, string> = {
    top: "top-full left-1/2 -translate-x-1/2 border-t-foreground border-x-transparent border-b-transparent",
    bottom: "bottom-full left-1/2 -translate-x-1/2 border-b-foreground border-x-transparent border-t-transparent",
    left: "left-full top-1/2 -translate-y-1/2 border-l-foreground border-y-transparent border-r-transparent",
    right: "right-full top-1/2 -translate-y-1/2 border-r-foreground border-y-transparent border-l-transparent",
  };

  const alignOffset =
    align === "start"
      ? side === "top" || side === "bottom"
        ? "!left-2 !translate-x-0"
        : "!top-2 !translate-y-0"
      : align === "end"
        ? side === "top" || side === "bottom"
          ? "!left-auto !right-2 !translate-x-0"
          : "!top-auto !bottom-2 !translate-y-0"
        : "";

  return (
    <span
      ref={triggerRef}
      className="relative inline-flex"
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
    >
      {children}
      {visible && (
        <span
          role="tooltip"
          className={cn(
            "absolute z-50 whitespace-nowrap rounded-sm bg-foreground px-2.5 py-1.5 text-xs text-background font-mono pointer-events-none",
            positionClasses[side],
            alignOffset,
          )}
        >
          {content}
          <span
            className={cn(
              "absolute w-0 h-0 border-[4px]",
              arrowClasses[side],
            )}
          />
        </span>
      )}
    </span>
  );
}

const basicCode = `<DemoTooltip content="Save your progress" side="top">
  <button className="...">Hover me</button>
</DemoTooltip>`;

const positionsCode = `<DemoTooltip content="Top" side="top">...</DemoTooltip>
<DemoTooltip content="Bottom" side="bottom">...</DemoTooltip>
<DemoTooltip content="Left" side="left">...</DemoTooltip>
<DemoTooltip content="Right" side="right">...</DemoTooltip>`;

const delayCode = `<DemoTooltip content="Instant" delayDuration={0}>...</DemoTooltip>
<DemoTooltip content="300ms" delayDuration={300}>...</DemoTooltip>
<DemoTooltip content="800ms" delayDuration={800}>...</DemoTooltip>`;

function TriggerButton({ children }: { children: React.ReactNode }) {
  return (
    <button
      type="button"
      className="rounded-sm border border-border bg-background px-4 py-2 text-sm font-medium text-foreground shadow-sm transition-colors hover:bg-muted"
    >
      {children}
    </button>
  );
}

export default function TooltipPage() {
  return (
    <Shell title="Tooltip">
      <div className="max-w-5xl space-y-10">
        <SectionHeading
          title="Tooltip"
          description="Hover-triggered informational popover with directional arrow. Supports configurable delay and placement."
        />

        <ComponentPreview
          title="Basic"
          description="Hover over the button to reveal a tooltip above the trigger."
          code={basicCode}
        >
          <DemoTooltip content="Save your progress" side="top">
            <TriggerButton>Hover me</TriggerButton>
          </DemoTooltip>
        </ComponentPreview>

        <ComponentPreview
          title="Positions"
          description="Tooltip placement on all four sides of the trigger."
          code={positionsCode}
        >
          <div className="flex flex-wrap items-center gap-6">
            <DemoTooltip content="Top tooltip" side="top">
              <TriggerButton>Top</TriggerButton>
            </DemoTooltip>
            <DemoTooltip content="Bottom tooltip" side="bottom">
              <TriggerButton>Bottom</TriggerButton>
            </DemoTooltip>
            <DemoTooltip content="Left tooltip" side="left">
              <TriggerButton>Left</TriggerButton>
            </DemoTooltip>
            <DemoTooltip content="Right tooltip" side="right">
              <TriggerButton>Right</TriggerButton>
            </DemoTooltip>
          </div>
        </ComponentPreview>

        <ComponentPreview
          title="With delay"
          description="Custom delay durations before the tooltip appears."
          code={delayCode}
        >
          <div className="flex flex-wrap items-center gap-6">
            <DemoTooltip content="Instant" side="top" delayDuration={0}>
              <TriggerButton>0ms</TriggerButton>
            </DemoTooltip>
            <DemoTooltip content="Default delay" side="top" delayDuration={300}>
              <TriggerButton>300ms</TriggerButton>
            </DemoTooltip>
            <DemoTooltip content="Slow reveal" side="top" delayDuration={800}>
              <TriggerButton>800ms</TriggerButton>
            </DemoTooltip>
          </div>
        </ComponentPreview>

        <div>
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-3">
            Props
          </h3>
          <PropsTable
            props={[
              {
                name: "content",
                type: "string",
                description: "Text displayed inside the tooltip.",
              },
              {
                name: "children",
                type: "ReactNode",
                description: "The trigger element that activates the tooltip on hover.",
              },
              {
                name: "side",
                type: '"top" | "bottom" | "left" | "right"',
                default: '"top"',
                description: "Which side of the trigger the tooltip appears on.",
              },
              {
                name: "align",
                type: '"start" | "center" | "end"',
                default: '"center"',
                description: "Alignment along the side axis.",
              },
              {
                name: "delayDuration",
                type: "number",
                default: "300",
                description: "Delay in milliseconds before tooltip appears.",
              },
            ]}
          />
        </div>

        <div className="text-xs font-mono text-muted-foreground p-3 rounded-sm bg-muted/50">
          src/components/ui/Tooltip
        </div>
      </div>
    </Shell>
  );
}
