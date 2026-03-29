import { forwardRef, type HTMLAttributes } from "react";
import styles from "./Divider.module.scss";

export type DividerOrientation = "horizontal" | "vertical";

export interface DividerProps extends HTMLAttributes<HTMLHRElement> {
  orientation?: DividerOrientation;
}

export const Divider = forwardRef<HTMLHRElement, DividerProps>(
  ({ orientation = "horizontal", className, ...props }, ref) => {
    const cls = [styles.divider, styles[orientation], className]
      .filter(Boolean)
      .join(" ");

    return (
      <hr
        ref={ref}
        className={cls}
        role={orientation === "vertical" ? "separator" : undefined}
        aria-orientation={orientation === "vertical" ? "vertical" : undefined}
        {...props}
      />
    );
  },
);

Divider.displayName = "Divider";
