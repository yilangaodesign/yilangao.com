import { forwardRef, type HTMLAttributes, type ReactNode } from "react";
import type { ButtonSize } from "../Button";
import styles from "./ButtonGroup.module.scss";

export type ButtonGroupOrientation = "horizontal" | "vertical";
export type ButtonGroupAlign = "start" | "center" | "end" | "between";
export type ButtonGroupSpacing = "compact" | "default" | "relaxed";

export interface ButtonGroupProps extends HTMLAttributes<HTMLDivElement> {
  orientation?: ButtonGroupOrientation;
  align?: ButtonGroupAlign;
  spacing?: ButtonGroupSpacing;
  /**
   * Size of the Buttons inside the group. Does NOT resize the children
   * (they carry their own `size`) — it only tunes the inter-button gap so it
   * fits the buttons. The gap is near-constant; only `xl` opens it up.
   */
  size?: ButtonSize;
  /** Children stretch to equal widths (e.g. stacked mobile CTAs). */
  equalWidth?: boolean;
  /** Allow wrapping onto multiple lines on overflow. */
  wrap?: boolean;
  /** Expected to be `<Button>` elements (direct children). */
  children: ReactNode;
}

export const ButtonGroup = forwardRef<HTMLDivElement, ButtonGroupProps>(
  (
    {
      orientation = "horizontal",
      align = "start",
      spacing = "default",
      size,
      equalWidth = false,
      wrap = false,
      className,
      children,
      ...props
    },
    ref,
  ) => {
    const cls = [
      styles.group,
      styles[orientation],
      styles[align],
      styles[spacing],
      size ? styles[size] : null,
      equalWidth && styles.equalWidth,
      wrap && styles.wrap,
      className,
    ]
      .filter(Boolean)
      .join(" ");

    return (
      <div ref={ref} role="group" className={cls} {...props}>
        {children}
      </div>
    );
  },
);

ButtonGroup.displayName = "ButtonGroup";
