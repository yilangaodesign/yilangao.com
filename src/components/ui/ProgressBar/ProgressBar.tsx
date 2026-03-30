import { forwardRef } from "react";
import styles from "./ProgressBar.module.scss";

export interface ProgressBarProps {
  value?: number;
  max?: number;
  indeterminate?: boolean;
  label?: string;
  showValue?: boolean;
  size?: "sm" | "md";
  className?: string;
}

export const ProgressBar = forwardRef<HTMLDivElement, ProgressBarProps>(
  (
    {
      value = 0,
      max = 100,
      indeterminate = false,
      label,
      showValue = false,
      size = "md",
      className,
    },
    ref,
  ) => {
    const pct = indeterminate ? 0 : Math.min(100, Math.max(0, (value / max) * 100));

    return (
      <div
        ref={ref}
        className={[styles.wrapper, className].filter(Boolean).join(" ")}
      >
        {(label || showValue) && (
          <div className={styles.header}>
            {label && <span className={styles.label}>{label}</span>}
            {showValue && !indeterminate && (
              <span className={styles.value}>{Math.round(pct)}%</span>
            )}
          </div>
        )}
        <div
          className={[styles.track, styles[size]].join(" ")}
          role="progressbar"
          aria-valuenow={indeterminate ? undefined : value}
          aria-valuemin={0}
          aria-valuemax={max}
          aria-label={label}
        >
          <div
            className={[
              styles.fill,
              indeterminate && styles.indeterminate,
            ]
              .filter(Boolean)
              .join(" ")}
            style={indeterminate ? undefined : { width: `${pct}%` }}
          />
        </div>
      </div>
    );
  },
);

ProgressBar.displayName = "ProgressBar";
