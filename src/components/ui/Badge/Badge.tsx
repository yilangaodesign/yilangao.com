import { forwardRef, type HTMLAttributes } from "react";
import styles from "./Badge.module.scss";

export type BadgeAppearance =
  | "neutral"
  | "highlight"
  | "positive"
  | "negative"
  | "warning"
  | "inverse"
  | "always-dark"
  | "always-light";

export type BadgeEmphasis = "bold" | "regular" | "subtle" | "minimal";

export type BadgeSize = "xxs" | "xs" | "sm" | "md" | "lg" | "xl";

export type BadgeShape = "pill" | "squared";

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  appearance?: BadgeAppearance;
  emphasis?: BadgeEmphasis;
  size?: BadgeSize;
  shape?: BadgeShape;
  mono?: boolean;
}

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  (
    {
      appearance = "neutral",
      emphasis = "subtle",
      size = "md",
      shape = "pill",
      mono = false,
      className,
      children,
      ...props
    },
    ref,
  ) => {
    const cls = [
      styles.badge,
      styles[appearance],
      styles[emphasis],
      styles[size],
      styles[shape],
      mono && styles.mono,
      className,
    ]
      .filter(Boolean)
      .join(" ");

    return (
      <span ref={ref} className={cls} {...props}>
        {children}
      </span>
    );
  },
);

Badge.displayName = "Badge";
