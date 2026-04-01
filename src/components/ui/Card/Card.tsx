import { forwardRef, type HTMLAttributes, type ReactNode } from "react";
import styles from "./Card.module.scss";

export type CardVariant = "default" | "muted";

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  elevated?: boolean;
  interactive?: boolean;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ variant = "default", elevated = false, interactive = false, className, children, ...props }, ref) => {
    const cls = [
      styles.card,
      variant !== "default" && styles[variant],
      elevated && styles.elevated,
      interactive && styles.interactive,
      className,
    ]
      .filter(Boolean)
      .join(" ");

    return (
      <div ref={ref} className={cls} {...props}>
        {children}
      </div>
    );
  },
);

Card.displayName = "Card";

// ---------------------------------------------------------------------------
// Sub-components for structured layout
// ---------------------------------------------------------------------------

export interface CardSectionProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export const CardHeader = forwardRef<HTMLDivElement, CardSectionProps>(
  ({ className, children, ...props }, ref) => (
    <div ref={ref} className={[styles.header, className].filter(Boolean).join(" ")} {...props}>
      {children}
    </div>
  ),
);

CardHeader.displayName = "CardHeader";

export const CardBody = forwardRef<HTMLDivElement, CardSectionProps>(
  ({ className, children, ...props }, ref) => (
    <div ref={ref} className={[styles.body, className].filter(Boolean).join(" ")} {...props}>
      {children}
    </div>
  ),
);

CardBody.displayName = "CardBody";

export const CardFooter = forwardRef<HTMLDivElement, CardSectionProps>(
  ({ className, children, ...props }, ref) => (
    <div ref={ref} className={[styles.footer, className].filter(Boolean).join(" ")} {...props}>
      {children}
    </div>
  ),
);

CardFooter.displayName = "CardFooter";
