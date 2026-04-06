"use client";

import { type ReactNode } from "react";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import styles from "./Tooltip.module.scss";

export type TooltipSize = "sm" | "md" | "lg";
export type TooltipAppearance = "inverse" | "neutral" | "brand";

export interface TooltipProps {
  content: ReactNode;
  children: ReactNode;
  size?: TooltipSize;
  appearance?: TooltipAppearance;
  caret?: boolean | "center";
  delayDuration?: number;
  collisionPadding?: number;
  side?: "top" | "right" | "bottom" | "left";
  align?: "start" | "center" | "end";
}

const SIDE_OFFSET: Record<TooltipSize, number> = {
  sm: 4, // spacer-0.5x
  md: 6, // spacer-utility-0.75x
  lg: 8, // spacer-1x
};

const CARET_SIZE: Record<TooltipSize, { width: number; height: number }> = {
  sm: { width: 8, height: 4 }, // spacer-1x x spacer-0.5x
  md: { width: 10, height: 5 }, // spacer-utility-1.25x x (between 0.5x and 0.75x)
  lg: { width: 12, height: 6 }, // spacer-1.5x x spacer-utility-0.75x
};

const CARET_INSET = 4; // radius-sm — caret must never overlap the container's rounded corners

const CARET_CLASS: Record<TooltipAppearance, string> = {
  inverse: styles.caretInverse,
  neutral: styles.caretNeutral,
  brand: styles.caretBrand,
};

export function Tooltip({
  content,
  children,
  size = "md",
  appearance = "inverse",
  caret = true,
  delayDuration,
  collisionPadding = 8, // spacer-1x
  side = "top",
  align = "center",
}: TooltipProps) {
  const resolvedAlign = caret === "center" ? "center" : align;
  const caretDims = CARET_SIZE[size];

  return (
    <TooltipPrimitive.Root delayDuration={delayDuration}>
      <TooltipPrimitive.Trigger asChild>
        {children}
      </TooltipPrimitive.Trigger>
      <TooltipPrimitive.Portal>
        <TooltipPrimitive.Content
          className={[styles.content, styles[size], styles[appearance]].join(
            " ",
          )}
          side={side}
          align={resolvedAlign}
          sideOffset={SIDE_OFFSET[size]}
          collisionPadding={collisionPadding}
          avoidCollisions
          sticky="partial"
          arrowPadding={caret === "center" ? 0 : CARET_INSET}
        >
          {content}
          {caret !== false && (
            <TooltipPrimitive.Arrow
              className={CARET_CLASS[appearance]}
              width={caretDims.width}
              height={caretDims.height}
            />
          )}
        </TooltipPrimitive.Content>
      </TooltipPrimitive.Portal>
    </TooltipPrimitive.Root>
  );
}
