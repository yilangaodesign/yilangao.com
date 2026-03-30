import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import styles from "./Button.module.scss";

export type ButtonAppearance =
  | "neutral"
  | "highlight"
  | "positive"
  | "negative"
  | "inverse"
  | "always-dark"
  | "always-light";

export type ButtonEmphasis = "bold" | "regular" | "subtle" | "minimal";

export type ButtonSize = "xs" | "sm" | "lg" | "xl";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  appearance?: ButtonAppearance;
  emphasis?: ButtonEmphasis;
  size?: ButtonSize;
  iconOnly?: boolean;
  fullWidth?: boolean;
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
  trailingSlot?: ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      appearance = "neutral",
      emphasis = "bold",
      size = "lg",
      iconOnly = false,
      fullWidth = false,
      leadingIcon,
      trailingIcon,
      trailingSlot,
      className,
      children,
      type = "button",
      ...props
    },
    ref,
  ) => {
    const cls = [
      styles.button,
      styles[appearance],
      styles[emphasis],
      styles[size],
      iconOnly && styles.iconOnly,
      fullWidth && styles.fullWidth,
      className,
    ]
      .filter(Boolean)
      .join(" ");

    return (
      <button ref={ref} type={type} className={cls} {...props}>
        {leadingIcon && (
          <span className={styles.iconWrap} aria-hidden="true">
            {leadingIcon}
          </span>
        )}
        {children && <span className={styles.label}>{children}</span>}
        {trailingIcon && (
          <span className={styles.iconWrap} aria-hidden="true">
            {trailingIcon}
          </span>
        )}
        {trailingSlot && (
          <span className={styles.trailingSlot}>{trailingSlot}</span>
        )}
      </button>
    );
  },
);

Button.displayName = "Button";
