"use client";

import { forwardRef, type ReactNode } from "react";
import * as ToggleGroupPrimitive from "@radix-ui/react-toggle-group";
import styles from "./ButtonSelect.module.scss";

export type ButtonSelectAppearance = "neutral" | "highlight";
export type ButtonSelectEmphasis = "bold" | "regular" | "subtle";
export type ButtonSelectSize = "xs" | "sm" | "md" | "lg" | "xl";

export interface ButtonSelectProps {
  value: string;
  onValueChange: (value: string) => void;
  appearance?: ButtonSelectAppearance;
  emphasis?: ButtonSelectEmphasis;
  size?: ButtonSelectSize;
  fullWidth?: boolean;
  disabled?: boolean;
  children: ReactNode;
  className?: string;
  "aria-label"?: string;
}

export const ButtonSelect = forwardRef<HTMLDivElement, ButtonSelectProps>(
  (
    {
      value,
      onValueChange,
      appearance = "neutral",
      emphasis = "regular",
      size = "md",
      fullWidth = false,
      disabled = false,
      children,
      className,
      "aria-label": ariaLabel,
    },
    ref,
  ) => {
    const cls = [
      styles.group,
      styles[appearance],
      styles[emphasis],
      styles[size],
      fullWidth && styles.fullWidth,
      className,
    ]
      .filter(Boolean)
      .join(" ");

    return (
      <ToggleGroupPrimitive.Root
        ref={ref}
        type="single"
        value={value}
        onValueChange={(v) => {
          if (v) onValueChange(v);
        }}
        disabled={disabled}
        className={cls}
        aria-label={ariaLabel}
      >
        {children}
      </ToggleGroupPrimitive.Root>
    );
  },
);

ButtonSelect.displayName = "ButtonSelect";

export interface ButtonSelectItemProps {
  value: string;
  disabled?: boolean;
  iconOnly?: boolean;
  children: ReactNode;
  className?: string;
}

export const ButtonSelectItem = forwardRef<
  HTMLButtonElement,
  ButtonSelectItemProps
>(({ value, disabled, iconOnly = false, children, className }, ref) => {
  const cls = [
    styles.item,
    iconOnly && styles.iconOnly,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <ToggleGroupPrimitive.Item
      ref={ref}
      value={value}
      disabled={disabled}
      className={cls}
    >
      {iconOnly ? (
        <span className={styles.iconWrap} aria-hidden="true">
          {children}
        </span>
      ) : (
        children
      )}
    </ToggleGroupPrimitive.Item>
  );
});

ButtonSelectItem.displayName = "ButtonSelectItem";
