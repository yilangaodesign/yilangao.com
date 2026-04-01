import { forwardRef, type HTMLAttributes, type ReactNode } from "react";
import styles from "./DescriptionList.module.scss";

// ---------------------------------------------------------------------------
// List wrapper
// ---------------------------------------------------------------------------

export type DescriptionListProps = HTMLAttributes<HTMLDListElement>;

export const DescriptionList = forwardRef<HTMLDListElement, DescriptionListProps>(
  ({ className, ...props }, ref) => (
    <dl
      ref={ref}
      className={[styles.list, className].filter(Boolean).join(" ")}
      {...props}
    />
  ),
);

DescriptionList.displayName = "DescriptionList";

// ---------------------------------------------------------------------------
// Item (label + value row)
// ---------------------------------------------------------------------------

export interface DescriptionItemProps extends HTMLAttributes<HTMLDivElement> {
  label: string;
  children: ReactNode;
}

export const DescriptionItem = forwardRef<HTMLDivElement, DescriptionItemProps>(
  ({ label, children, className, ...props }, ref) => (
    <div
      ref={ref}
      className={[styles.item, className].filter(Boolean).join(" ")}
      {...props}
    >
      <dt className={styles.label}>{label}</dt>
      <dd className={styles.value}>{children}</dd>
    </div>
  ),
);

DescriptionItem.displayName = "DescriptionItem";
