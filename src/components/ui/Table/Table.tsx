import { forwardRef, type HTMLAttributes, type TdHTMLAttributes, type ThHTMLAttributes } from "react";
import styles from "./Table.module.scss";

// ---------------------------------------------------------------------------
// Table root (scrollable container + <table>)
// ---------------------------------------------------------------------------

export const Table = forwardRef<
  HTMLTableElement,
  HTMLAttributes<HTMLTableElement>
>(({ className, ...props }, ref) => (
  <div className={styles.wrapper}>
    <table
      ref={ref}
      className={[styles.table, className].filter(Boolean).join(" ")}
      {...props}
    />
  </div>
));

Table.displayName = "Table";

// ---------------------------------------------------------------------------
// Structural sub-components
// ---------------------------------------------------------------------------

export const TableHeader = forwardRef<
  HTMLTableSectionElement,
  HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <thead
    ref={ref}
    className={[styles.header, className].filter(Boolean).join(" ")}
    {...props}
  />
));

TableHeader.displayName = "TableHeader";

export const TableBody = forwardRef<
  HTMLTableSectionElement,
  HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tbody
    ref={ref}
    className={[styles.body, className].filter(Boolean).join(" ")}
    {...props}
  />
));

TableBody.displayName = "TableBody";

export const TableRow = forwardRef<
  HTMLTableRowElement,
  HTMLAttributes<HTMLTableRowElement>
>(({ className, ...props }, ref) => (
  <tr
    ref={ref}
    className={[styles.row, className].filter(Boolean).join(" ")}
    {...props}
  />
));

TableRow.displayName = "TableRow";

// ---------------------------------------------------------------------------
// Header cell
// ---------------------------------------------------------------------------

export const TableHead = forwardRef<
  HTMLTableCellElement,
  ThHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <th
    ref={ref}
    className={[styles.head, className].filter(Boolean).join(" ")}
    {...props}
  />
));

TableHead.displayName = "TableHead";

// ---------------------------------------------------------------------------
// Data cell
// ---------------------------------------------------------------------------

export interface TableCellProps extends TdHTMLAttributes<HTMLTableCellElement> {
  mono?: boolean;
  accent?: boolean;
}

export const TableCell = forwardRef<HTMLTableCellElement, TableCellProps>(
  ({ mono = false, accent = false, className, ...props }, ref) => {
    const cls = [
      styles.cell,
      mono && styles.mono,
      accent && styles.accent,
      className,
    ]
      .filter(Boolean)
      .join(" ");

    return <td ref={ref} className={cls} {...props} />;
  },
);

TableCell.displayName = "TableCell";
