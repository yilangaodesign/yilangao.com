import { flexRender, type Row } from "@tanstack/react-table";
import { DataGridCell } from "./DataGridCell";
import styles from "./DataGrid.module.scss";

interface DataGridRowProps<TData> {
  row: Row<TData>;
  /** 1-based absolute index for `aria-rowindex` (header row is 1). */
  ariaRowIndex: number;
  selectable: boolean;
}

/**
 * A single body row. Cells read their alignment / numeric / status /
 * background from the column's `meta`, then render the column's cell content
 * through `flexRender`.
 */
export function DataGridRow<TData>({
  row,
  ariaRowIndex,
  selectable,
}: DataGridRowProps<TData>) {
  const selected = selectable && row.getIsSelected();

  return (
    <div
      role="row"
      aria-rowindex={ariaRowIndex}
      aria-selected={selectable ? selected : undefined}
      className={[styles.row, styles.bodyRow, selected && styles.rowSelected]
        .filter(Boolean)
        .join(" ")}
    >
      {row.getVisibleCells().map((cell) => {
        const meta = cell.column.columnDef.meta;
        return (
          <DataGridCell
            key={cell.id}
            role={cell.column.id === "__select__" ? "rowheader" : "gridcell"}
            align={meta?.align}
            numeric={meta?.numeric}
            status={meta?.status}
            background={meta?.background}
          >
            {flexRender(cell.column.columnDef.cell, cell.getContext())}
          </DataGridCell>
        );
      })}
    </div>
  );
}
