"use client";

import { useMemo, type CSSProperties } from "react";
import { flexRender, type ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "../Checkbox";
import { useDataGrid } from "./use-data-grid";
import { useGridKeyboard } from "./use-grid-keyboard";
import { DataGridColumnHeader } from "./DataGridColumnHeader";
import { DataGridFilterRow } from "./DataGridFilterRow";
import { DataGridRow } from "./DataGridRow";
import { DataGridPagination } from "./DataGridPagination";
import styles from "./DataGrid.module.scss";
import type { DataGridProps } from "./types";

const SELECT_COLUMN_ID = "__select__";

const SIZE_CLASS = {
  sm: styles.sizeSm,
  md: styles.sizeMd,
  lg: styles.sizeLg,
} as const;

const DENSITY_CLASS = {
  "x-compact": styles.densityXCompact,
  compact: styles.densityCompact,
  standard: styles.densityStandard,
  spacious: styles.densitySpacious,
} as const;

/**
 * Élan DataGrid (v1): a headless TanStack Table v8 model rendered into a
 * bespoke, token-driven div-based ARIA grid (ADR-001, ADR-002). v1 ships the
 * full presentational layer plus sorting, per-column filtering, row selection,
 * pagination, and the WAI-ARIA grid keyboard pattern. Advanced behaviors
 * (resize / reorder / sticky columns / virtualization / inline edit /
 * expandable rows) are deferred to v2.
 */
export function DataGrid<TData>(props: DataGridProps<TData>) {
  const {
    columns,
    size = "md",
    density = "standard",
    zebra = false,
    stickyHeader = false,
    enableFiltering = false,
    enableRowSelection = false,
    enablePagination = false,
    label = "Data grid",
    className,
  } = props;

  const resolvedColumns = useMemo<ColumnDef<TData, unknown>[]>(() => {
    if (!enableRowSelection) return columns;

    const selectColumn: ColumnDef<TData, unknown> = {
      id: SELECT_COLUMN_ID,
      enableSorting: false,
      enableColumnFilter: false,
      size: 44,
      meta: { align: "center" },
      header: ({ table }) => (
        <Checkbox
          size="sm"
          checked={
            table.getIsAllPageRowsSelected()
              ? true
              : table.getIsSomePageRowsSelected()
                ? "indeterminate"
                : false
          }
          onCheckedChange={(value) =>
            table.toggleAllPageRowsSelected(value === true)
          }
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          size="sm"
          checked={row.getIsSelected()}
          disabled={!row.getCanSelect()}
          onCheckedChange={(value) => row.toggleSelected(value === true)}
        />
      ),
    };

    return [selectColumn, ...columns];
  }, [columns, enableRowSelection]);

  const table = useDataGrid<TData>({ ...props, columns: resolvedColumns });
  const { rootRef, onKeyDown, onFocusCapture } = useGridKeyboard(
    enablePagination ? table.getState().pagination.pageSize : 10,
  );

  const headerGroups = table.getHeaderGroups();
  const rows = table.getRowModel().rows;
  const leafColumns = table.getVisibleLeafColumns();

  const template = leafColumns
    .map((col) =>
      col.id === SELECT_COLUMN_ID
        ? "44px"
        : `minmax(${col.getSize()}px, 1fr)`,
    )
    .join(" ");

  const headerOffset = headerGroups.length + (enableFiltering ? 1 : 0);
  const pageStart = enablePagination
    ? table.getState().pagination.pageIndex *
      table.getState().pagination.pageSize
    : 0;
  const totalRowCount =
    headerOffset + table.getFilteredRowModel().rows.length;

  const rootCls = [
    styles.dataGrid,
    SIZE_CLASS[size],
    DENSITY_CLASS[density],
    zebra && styles.zebra,
    stickyHeader && styles.stickyHeader,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={styles.dataGridWrapper}>
      <div
        ref={rootRef}
        role="grid"
        aria-label={label}
        aria-rowcount={totalRowCount}
        aria-colcount={leafColumns.length}
        className={rootCls}
        style={{ "--dg-template": template } as CSSProperties}
        onKeyDown={onKeyDown}
        onFocusCapture={onFocusCapture}
      >
        <div role="rowgroup" className={styles.headerGroup}>
          {headerGroups.map((headerGroup, groupIndex) => (
            <div
              key={headerGroup.id}
              role="row"
              aria-rowindex={groupIndex + 1}
              className={[styles.row, styles.headerRow].join(" ")}
            >
              {headerGroup.headers.map((header) => (
                <DataGridColumnHeader
                  key={header.id}
                  header={header}
                  enableSorting={props.enableSorting ?? false}
                />
              ))}
            </div>
          ))}
          {enableFiltering && <DataGridFilterRow table={table} />}
        </div>

        <div role="rowgroup" className={styles.bodyGroup}>
          {rows.length === 0 ? (
            <div role="row" className={[styles.row, styles.emptyRow].join(" ")}>
              <div role="gridcell" tabIndex={-1} className={styles.emptyCell}>
                No results.
              </div>
            </div>
          ) : (
            rows.map((row, index) => (
              <DataGridRow
                key={row.id}
                row={row}
                ariaRowIndex={headerOffset + pageStart + index + 1}
                selectable={enableRowSelection}
              />
            ))
          )}
        </div>
      </div>

      {enablePagination && <DataGridPagination table={table} />}
    </div>
  );
}

DataGrid.displayName = "DataGrid";

export { flexRender };
