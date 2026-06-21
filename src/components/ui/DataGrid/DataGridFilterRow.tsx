import type { Table } from "@tanstack/react-table";
import Search from "lucide-react/dist/esm/icons/search";
import { Input } from "../Input";
import styles from "./DataGrid.module.scss";

interface DataGridFilterRowProps<TData> {
  table: Table<TData>;
}

/**
 * Optional per-column filter row. Renders one filter input per filterable
 * column; non-filterable columns (e.g. the selection column) get an empty cell
 * so the grid template stays aligned.
 */
export function DataGridFilterRow<TData>({ table }: DataGridFilterRowProps<TData>) {
  const headerGroups = table.getHeaderGroups();
  const leafHeaders = headerGroups[headerGroups.length - 1]?.headers ?? [];

  return (
    <div role="row" className={[styles.row, styles.filterRow].join(" ")}>
      {leafHeaders.map((header) => {
        const column = header.column;
        const canFilter = column.getCanFilter() && column.id !== "__select__";

        if (!canFilter) {
          return (
            <div
              key={header.id}
              role="gridcell"
              tabIndex={-1}
              className={[styles.cell, styles.filterCell].join(" ")}
            />
          );
        }

        const value = (column.getFilterValue() as string) ?? "";

        return (
          <div
            key={header.id}
            role="gridcell"
            tabIndex={-1}
            className={[styles.cell, styles.filterCell].join(" ")}
          >
            <Input
              size="xs"
              placeholder="Filter"
              value={value}
              leadingIcon={<Search size={13} />}
              clearable={value.length > 0}
              onClear={() => column.setFilterValue("")}
              onChange={(e) => column.setFilterValue(e.target.value)}
              aria-label={`Filter by ${column.id}`}
            />
          </div>
        );
      })}
    </div>
  );
}
