import type { Table } from "@tanstack/react-table";
import ChevronLeft from "lucide-react/dist/esm/icons/chevron-left";
import ChevronRight from "lucide-react/dist/esm/icons/chevron-right";
import ChevronsLeft from "lucide-react/dist/esm/icons/chevrons-left";
import ChevronsRight from "lucide-react/dist/esm/icons/chevrons-right";
import { Button } from "../Button";
import styles from "./DataGrid.module.scss";

interface DataGridPaginationProps<TData> {
  table: Table<TData>;
}

/** Pager: row count summary + first / prev / next / last controls. */
export function DataGridPagination<TData>({ table }: DataGridPaginationProps<TData>) {
  const { pageIndex, pageSize } = table.getState().pagination;
  const totalRows = table.getFilteredRowModel().rows.length;
  const pageCount = table.getPageCount();
  const firstRow = totalRows === 0 ? 0 : pageIndex * pageSize + 1;
  const lastRow = Math.min((pageIndex + 1) * pageSize, totalRows);

  return (
    <div className={styles.pagination}>
      <span className={styles.paginationSummary} aria-live="polite">
        {firstRow}-{lastRow} of {totalRows}
      </span>
      <div className={styles.paginationControls}>
        <Button
          appearance="neutral"
          emphasis="subtle"
          size="xs"
          iconOnly
          aria-label="First page"
          disabled={!table.getCanPreviousPage()}
          onClick={() => table.setPageIndex(0)}
          leadingIcon={<ChevronsLeft size={15} />}
        />
        <Button
          appearance="neutral"
          emphasis="subtle"
          size="xs"
          iconOnly
          aria-label="Previous page"
          disabled={!table.getCanPreviousPage()}
          onClick={() => table.previousPage()}
          leadingIcon={<ChevronLeft size={15} />}
        />
        <span className={styles.paginationPage}>
          Page {pageIndex + 1} of {Math.max(pageCount, 1)}
        </span>
        <Button
          appearance="neutral"
          emphasis="subtle"
          size="xs"
          iconOnly
          aria-label="Next page"
          disabled={!table.getCanNextPage()}
          onClick={() => table.nextPage()}
          leadingIcon={<ChevronRight size={15} />}
        />
        <Button
          appearance="neutral"
          emphasis="subtle"
          size="xs"
          iconOnly
          aria-label="Last page"
          disabled={!table.getCanNextPage()}
          onClick={() => table.setPageIndex(pageCount - 1)}
          leadingIcon={<ChevronsRight size={15} />}
        />
      </div>
    </div>
  );
}
