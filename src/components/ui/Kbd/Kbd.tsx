import { forwardRef, type HTMLAttributes } from "react";
import styles from "./Kbd.module.scss";

export interface KbdProps extends HTMLAttributes<HTMLElement> {
  bordered?: boolean;
}

export const Kbd = forwardRef<HTMLElement, KbdProps>(
  ({ bordered = false, className, ...props }, ref) => {
    const cls = [styles.kbd, bordered && styles.bordered, className]
      .filter(Boolean)
      .join(" ");

    return <kbd ref={ref} className={cls} {...props} />;
  },
);

Kbd.displayName = "Kbd";
