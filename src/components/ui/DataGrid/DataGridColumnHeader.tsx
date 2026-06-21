import { flexRender, type Header } from "@tanstack/react-table";
import ArrowUp from "lucide-react/dist/esm/icons/arrow-up";
import ArrowDown from "lucide-react/dist/esm/icons/arrow-down";
import ChevronsUpDown from "lucide-react/dist/esm/icons/chevrons-up-down";
import styles from "./DataGrid.module.scss";
import type { DataGridAlign } from "./types";

interface DataGridColumnHeaderProps<TData> {
  header: Header<TData, unknown>;
  enableSorting: boolean;
}

const ALIGN_CLASS: Record<DataGridAlign, string> = {
  left: styles.alignLeft,
  center: styles.alignCenter,
  right: styles.alignRight,
};

/**
 * Sortable header cell. Renders `role="columnheader"`, reflects sort state via
 * `aria-sort`, and toggles sorting on click / Enter / Space. Default
 * `tabIndex` is -1 - the keyboard hook promotes the active cell.
 */
export function DataGridColumnHeader<TData>({
  header,
  enableSorting,
}: DataGridColumnHeaderProps<TData>) {
  const meta = header.column.columnDef.meta;
  const align: DataGridAlign = meta?.numeric ? "right" : meta?.align ?? "left";
  const canSort = enableSorting && header.column.getCanSort();
  const sortDir = header.column.getIsSorted();

  const ariaSort = !canSort
    ? undefined
    : sortDir === "asc"
      ? "ascending"
      : sortDir === "desc"
        ? "descending"
        : "none";

  const cls = [
    styles.cell,
    styles.headerCell,
    ALIGN_CLASS[align],
    meta?.numeric && styles.numeric,
    canSort && styles.sortable,
  ]
    .filter(Boolean)
    .join(" ");

  const content = header.isPlaceholder
    ? null
    : flexRender(header.column.columnDef.header, header.getContext());

  const handleSortKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      header.column.toggleSorting();
    }
  };

  return (
    <div role="columnheader" aria-sort={ariaSort} tabIndex={-1} className={cls}>
      {canSort ? (
        <button
          type="button"
          className={styles.sortButton}
          onClick={() => header.column.toggleSorting()}
          onKeyDown={handleSortKeyDown}
          tabIndex={-1}
        >
          <span className={styles.headerLabel}>{content}</span>
          <span className={styles.sortIcon} aria-hidden="true">
            {sortDir === "asc" ? (
              <ArrowUp size={14} />
            ) : sortDir === "desc" ? (
              <ArrowDown size={14} />
            ) : (
              <ChevronsUpDown size={14} />
            )}
          </span>
        </button>
      ) : (
        <span className={styles.headerLabel}>{content}</span>
      )}
    </div>
  );
}
