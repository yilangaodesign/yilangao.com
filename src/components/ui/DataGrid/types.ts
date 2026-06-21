import type { ColumnDef, RowData } from "@tanstack/react-table";

export type DataGridSize = "sm" | "md" | "lg";

export type DataGridDensity = "x-compact" | "compact" | "standard" | "spacious";

export type DataGridAlign = "left" | "center" | "right";

/**
 * The cell content archetypes from the GS "One GS" anatomy. Each maps to a
 * renderer in `cell-renderers.tsx` that composes an existing Élan primitive.
 */
export type DataGridCellContent =
  | "text"
  | "multiline"
  | "progress"
  | "badge"
  | "button"
  | "input"
  | "slot";

/** Per-cell semantic status tint (GS `Status` token). */
export type DataGridCellStatus = "none" | "success" | "warning" | "error";

/** Per-cell background fill (GS `Background` token). */
export type DataGridCellBackground = "none" | "neutral-subtle" | "neutral-regular";

/**
 * Column-level metadata consumed by the presentational layer. Augments
 * TanStack's `ColumnMeta` so it travels on `ColumnDef.meta` with full typing.
 */
export interface DataGridColumnMeta {
  /** Horizontal alignment of header + body cells in this column. */
  align?: DataGridAlign;
  /** Numeric column: right-aligns and uses tabular figures (intent-based name; replaces the legacy `mono`). */
  numeric?: boolean;
  /** Which cell renderer to use when the column relies on the default cell. */
  content?: DataGridCellContent;
  /** Column-level status tint (GS `Status` token) applied to body cells. */
  status?: DataGridCellStatus;
  /** Column-level background fill (GS `Background` token) applied to body cells. */
  background?: DataGridCellBackground;
}

declare module "@tanstack/react-table" {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ColumnMeta<TData extends RowData, TValue> extends DataGridColumnMeta {}
}

export interface DataGridProps<TData> {
  data: TData[];
  columns: ColumnDef<TData, unknown>[];
  /** Font size + horizontal padding scale. */
  size?: DataGridSize;
  /** Row height scale (GS density axis). */
  density?: DataGridDensity;
  /** Alternating row background. Named to mirror the GS Figma property. */
  zebra?: boolean;
  /** Pin the header row to the top of the scroll container. */
  stickyHeader?: boolean;
  enableSorting?: boolean;
  enableFiltering?: boolean;
  enableRowSelection?: boolean;
  enablePagination?: boolean;
  /** Initial page size when pagination is enabled. */
  pageSize?: number;
  /** Accessible name for the grid (maps to `aria-label`). */
  label?: string;
  /** Stable row id accessor (recommended when selection is enabled). */
  getRowId?: (row: TData, index: number) => string;
  className?: string;
}
