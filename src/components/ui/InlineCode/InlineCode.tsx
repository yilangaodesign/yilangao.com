import { forwardRef, type HTMLAttributes } from "react";
import styles from "./InlineCode.module.scss";

export type InlineCodeProps = HTMLAttributes<HTMLElement>;

export const InlineCode = forwardRef<HTMLElement, InlineCodeProps>(
  ({ className, ...props }, ref) => (
    <code
      ref={ref}
      className={[styles.inlineCode, className].filter(Boolean).join(" ")}
      {...props}
    />
  ),
);

InlineCode.displayName = "InlineCode";
