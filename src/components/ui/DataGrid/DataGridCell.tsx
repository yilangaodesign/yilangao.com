import { forwardRef, type HTMLAttributes } from "react";
import styles from "./DataGrid.module.scss";
import type {
  DataGridAlign,
  DataGridCellBackground,
  DataGridCellStatus,
} from "./types";

export interface DataGridCellProps extends HTMLAttributes<HTMLDivElement> {
  /** `gridcell` (default) or `rowheader` for the leading select/label cell. */
  role?: "gridcell" | "rowheader" | "columnheader";
  align?: DataGridAlign;
  /** Numeric column: right-align + tabular figures (intent-based; replaces `mono`). */
  numeric?: boolean;
  status?: DataGridCellStatus;
  background?: DataGridCellBackground;
}

const ALIGN_CLASS: Record<DataGridAlign, string> = {
  left: styles.alignLeft,
  center: styles.alignCenter,
  right: styles.alignRight,
};

const STATUS_CLASS: Record<DataGridCellStatus, string | undefined> = {
  none: undefined,
  success: styles.statusSuccess,
  warning: styles.statusWarning,
  error: styles.statusError,
};

const BACKGROUND_CLASS: Record<DataGridCellBackground, string | undefined> = {
  none: undefined,
  "neutral-subtle": styles.bgNeutralSubtle,
  "neutral-regular": styles.bgNeutralRegular,
};

/**
 * Presentational cell shell. Owns the alignment / status / background visual
 * axes; size + density are inherited from the grid root via CSS. Default
 * `tabIndex` is -1 - the keyboard hook promotes the active cell to 0.
 */
export const DataGridCell = forwardRef<HTMLDivElement, DataGridCellProps>(
  (
    {
      role = "gridcell",
      align = "left",
      numeric = false,
      status = "none",
      background = "none",
      className,
      ...props
    },
    ref,
  ) => {
    const cls = [
      styles.cell,
      ALIGN_CLASS[numeric ? "right" : align],
      numeric && styles.numeric,
      STATUS_CLASS[status],
      BACKGROUND_CLASS[background],
      className,
    ]
      .filter(Boolean)
      .join(" ");

    return <div ref={ref} role={role} tabIndex={-1} className={cls} {...props} />;
  },
);

DataGridCell.displayName = "DataGridCell";
