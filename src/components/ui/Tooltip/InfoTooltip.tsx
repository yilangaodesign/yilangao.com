"use client";

import { type ReactNode } from "react";
import { Tooltip, type TooltipSize, type TooltipAppearance, type TooltipProps } from "./Tooltip";
import styles from "./InfoTooltip.module.scss";

export type InfoTooltipContextSize = "xs" | "sm" | "md" | "lg" | "xl";

export interface InfoTooltipProps {
  content: ReactNode;
  contextSize?: InfoTooltipContextSize;
  icon?: ReactNode;
  size?: TooltipSize;
  appearance?: TooltipAppearance;
  side?: TooltipProps["side"];
  align?: TooltipProps["align"];
  delayDuration?: number;
}

const SIZE_MAP: Record<InfoTooltipContextSize, TooltipSize> = {
  xs: "sm",
  sm: "sm",
  md: "md",
  lg: "md",
  xl: "lg",
};

function InfoIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      style={{ width: "100%", height: "100%" }}
    >
      <circle cx={12} cy={12} r={10} />
      <path d="M12 16v-4" />
      <path d="M12 8h.01" />
    </svg>
  );
}

export function InfoTooltip({
  content,
  contextSize = "md",
  icon,
  size,
  appearance = "inverse",
  side = "top",
  align = "start",
  delayDuration,
}: InfoTooltipProps) {
  const resolvedSize = size ?? SIZE_MAP[contextSize];
  const triggerCls = [styles.trigger, styles[contextSize]].join(" ");

  return (
    <Tooltip
      content={content}
      size={resolvedSize}
      appearance={appearance}
      side={side}
      align={align}
      delayDuration={delayDuration}
    >
      <button className={triggerCls} type="button" aria-label="More information">
        {icon ?? <InfoIcon />}
      </button>
    </Tooltip>
  );
}
