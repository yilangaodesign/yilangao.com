import { forwardRef, type HTMLAttributes, type ReactNode } from "react";
import styles from "./BadgeOverlay.module.scss";

export type BadgeOverlayAppearance =
  | "neutral"
  | "highlight"
  | "inverse"
  | "always-dark"
  | "always-light";

export type BadgeOverlayStatus = "success" | "warning" | "error";

export type BadgeOverlayEmphasis = "bold" | "regular" | "subtle";

export type BadgeOverlaySize = "xs" | "sm";

export type BadgeOverlayPlacement =
  | "top-right"
  | "top-left"
  | "bottom-right"
  | "bottom-left";

export interface BadgeOverlayProps extends HTMLAttributes<HTMLSpanElement> {
  appearance?: BadgeOverlayAppearance;
  status?: BadgeOverlayStatus;
  emphasis?: BadgeOverlayEmphasis;
  size?: BadgeOverlaySize;
  bordered?: boolean;
}

export interface BadgeOverlayAnchorProps {
  placement?: BadgeOverlayPlacement;
  children: ReactNode;
  badge: ReactNode;
  className?: string;
}

export const BadgeOverlay = forwardRef<HTMLSpanElement, BadgeOverlayProps>(
  (
    {
      appearance = "neutral",
      status,
      emphasis = "bold",
      size = "xs",
      bordered = false,
      className,
      children,
      ...props
    },
    ref,
  ) => {
    const isDot = children == null;

    const colorClass = status ? styles[status] : styles[appearance];

    const cls = [
      styles["badge-overlay"],
      colorClass,
      styles[emphasis],
      styles[size],
      isDot && styles.dot,
      bordered && styles.bordered,
      className,
    ]
      .filter(Boolean)
      .join(" ");

    return (
      <span ref={ref} className={cls} {...props}>
        {isDot ? null : <span className={styles.label}>{children}</span>}
      </span>
    );
  },
);

BadgeOverlay.displayName = "BadgeOverlay";

export const BadgeOverlayAnchor = forwardRef<
  HTMLDivElement,
  BadgeOverlayAnchorProps & HTMLAttributes<HTMLDivElement>
>(({ placement = "top-right", children, badge, className, ...props }, ref) => {
  const cls = [styles.anchor, className].filter(Boolean).join(" ");

  return (
    <div ref={ref} className={cls} {...props}>
      {children}
      <span className={`${styles["badge-slot"]} ${styles[placement]}`}>
        {badge}
      </span>
    </div>
  );
});

BadgeOverlayAnchor.displayName = "BadgeOverlayAnchor";
