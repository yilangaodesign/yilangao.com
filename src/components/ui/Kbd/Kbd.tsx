import { forwardRef, type HTMLAttributes } from "react";
import styles from "./Kbd.module.scss";

export type KbdSize = "xs" | "sm" | "md" | "lg" | "xl";

export interface KbdProps extends HTMLAttributes<HTMLElement> {
  size?: KbdSize;
  bordered?: boolean;
}

export const Kbd = forwardRef<HTMLElement, KbdProps>(
  ({ size = "xs", bordered = false, className, ...props }, ref) => {
    const cls = [
      styles.kbd,
      styles[size],
      bordered && styles.bordered,
      className,
    ]
      .filter(Boolean)
      .join(" ");

    return <kbd ref={ref} className={cls} {...props} />;
  },
);

Kbd.displayName = "Kbd";
