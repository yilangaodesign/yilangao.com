import { forwardRef, type HTMLAttributes } from "react";
import styles from "./Badge.module.scss";

export type BadgeVariant = "default" | "success" | "warning" | "error" | "info";
export type BadgeSize = "sm" | "md";

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: BadgeSize;
}

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ variant = "default", size = "md", className, children, ...props }, ref) => {
    const cls = [styles.badge, styles[variant], styles[size], className]
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
