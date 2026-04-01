import { forwardRef, type HTMLAttributes } from "react";
import styles from "./Badge.module.scss";

export type BadgeVariant = "default" | "success" | "warning" | "error" | "info" | "muted";
export type BadgeSize = "xs" | "sm" | "md";
export type BadgeShape = "pill" | "squared";

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: BadgeSize;
  shape?: BadgeShape;
  mono?: boolean;
}

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  (
    {
      variant = "default",
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
      styles[variant],
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
