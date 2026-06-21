"use client";

import { useState } from "react";
import {
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnFiltersState,
  type PaginationState,
  type RowSelectionState,
  type SortingState,
} from "@tanstack/react-table";
import type { DataGridProps } from "./types";

/**
 * Wraps TanStack `useReactTable` and owns the feature state (sorting, filters,
 * selection, pagination) that v1 of the DataGrid exposes. The render layer is
 * intentionally separate (ADR-002) - this hook only provides the table model.
 */
export function useDataGrid<TData>({
  data,
  columns,
  enableSorting = false,
  enableFiltering = false,
  enableRowSelection = false,
  enablePagination = false,
  pageSize = 10,
  getRowId,
}: DataGridProps<TData>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize,
  });

  const table = useReactTable<TData>({
    data,
    columns,
    state: {
      ...(enableSorting ? { sorting } : {}),
      ...(enableFiltering ? { columnFilters } : {}),
      ...(enableRowSelection ? { rowSelection } : {}),
      ...(enablePagination ? { pagination } : {}),
    },
    getRowId,
    enableSorting,
    enableRowSelection,
    onSortingChange: enableSorting ? setSorting : undefined,
    onColumnFiltersChange: enableFiltering ? setColumnFilters : undefined,
    onRowSelectionChange: enableRowSelection ? setRowSelection : undefined,
    onPaginationChange: enablePagination ? setPagination : undefined,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: enableSorting ? getSortedRowModel() : undefined,
    getFilteredRowModel: enableFiltering ? getFilteredRowModel() : undefined,
    getPaginationRowModel: enablePagination ? getPaginationRowModel() : undefined,
  });

  return table;
}
