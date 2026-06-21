"use client";

import { Shell } from "@/components/shell";
import { SectionHeading } from "@/components/token-grid";
import {
  ComponentPreview,
  PropsTable,
  SourcePath,
  SubsectionHeading,
} from "@/components/component-preview";
import ScrollSpy from "@/components/scroll-spy";
import {
  DataGrid,
  TextCell,
  MultiLineTextCell,
  ProgressCell,
  BadgeCell,
  ButtonCell,
  InputCell,
} from "@ds/DataGrid";
import type { DataGridDensity, DataGridSize } from "@ds/DataGrid";
import type { BadgeAppearance } from "@ds/Badge";
import type { ColumnDef } from "@tanstack/react-table";

// ── Sample data ──────────────────────────────────────────────────────────────

type Position = {
  id: string;
  instrument: string;
  desk: string;
  allocation: number;
  pnl: number;
  status: "Cleared" | "Pending" | "Breach";
  note: string;
};

const POSITIONS: Position[] = [
  { id: "1", instrument: "US 10Y Treasury", desk: "Rates", allocation: 82, pnl: 1284500, status: "Cleared", note: "Rolled on schedule." },
  { id: "2", instrument: "EUR/USD Spot", desk: "FX", allocation: 64, pnl: -342100, status: "Pending", note: "Awaiting confirmation from counterparty." },
  { id: "3", instrument: "S&P 500 Future", desk: "Equity", allocation: 91, pnl: 2105300, status: "Cleared", note: "Within risk limits." },
  { id: "4", instrument: "Brent Crude", desk: "Commodities", allocation: 47, pnl: -88720, status: "Breach", note: "Exceeds desk VaR; escalate to risk." },
  { id: "5", instrument: "JPY/USD Swap", desk: "Rates", allocation: 73, pnl: 540900, status: "Cleared", note: "Standard settlement." },
  { id: "6", instrument: "Gold Spot", desk: "Commodities", allocation: 55, pnl: 173400, status: "Pending", note: "Pricing under review." },
  { id: "7", instrument: "Nasdaq 100 Future", desk: "Equity", allocation: 88, pnl: 932000, status: "Cleared", note: "Hedged via options." },
  { id: "8", instrument: "GBP/USD Spot", desk: "FX", allocation: 39, pnl: -12450, status: "Breach", note: "Stale mark; needs refresh." },
  { id: "9", instrument: "German Bund", desk: "Rates", allocation: 68, pnl: 421800, status: "Cleared", note: "No action required." },
  { id: "10", instrument: "Natural Gas", desk: "Commodities", allocation: 51, pnl: 64300, status: "Pending", note: "Seasonal volatility expected." },
  { id: "11", instrument: "Nikkei 225 Future", desk: "Equity", allocation: 77, pnl: 285600, status: "Cleared", note: "Within limits." },
  { id: "12", instrument: "AUD/USD Spot", desk: "FX", allocation: 44, pnl: -53900, status: "Pending", note: "Monitoring central-bank guidance." },
];

const SMALL_POSITIONS = POSITIONS.slice(0, 4);

function usd(value: number): string {
  const sign = value < 0 ? "-" : "";
  return `${sign}$${Math.abs(value).toLocaleString("en-US")}`;
}

function statusAppearance(status: Position["status"]): BadgeAppearance {
  if (status === "Cleared") return "positive";
  if (status === "Pending") return "warning";
  return "negative";
}

// ── Column sets ──────────────────────────────────────────────────────────────

const fullColumns: ColumnDef<Position>[] = [
  {
    accessorKey: "instrument",
    header: "Instrument",
    cell: ({ getValue }) => <TextCell>{getValue() as string}</TextCell>,
  },
  {
    accessorKey: "desk",
    header: "Desk",
    cell: ({ getValue }) => <BadgeCell>{getValue() as string}</BadgeCell>,
  },
  {
    accessorKey: "allocation",
    header: "Allocation",
    enableColumnFilter: false,
    cell: ({ getValue }) => <ProgressCell value={getValue() as number} />,
  },
  {
    accessorKey: "pnl",
    header: "P&L (USD)",
    enableColumnFilter: false,
    meta: { numeric: true },
    cell: ({ getValue }) => <TextCell>{usd(getValue() as number)}</TextCell>,
  },
  {
    accessorKey: "status",
    header: "Status",
    enableColumnFilter: false,
    cell: ({ getValue }) => {
      const status = getValue() as Position["status"];
      return <BadgeCell appearance={statusAppearance(status)}>{status}</BadgeCell>;
    },
  },
  {
    id: "action",
    header: "",
    enableSorting: false,
    cell: () => <ButtonCell>View</ButtonCell>,
  },
];

const compactColumns: ColumnDef<Position>[] = [
  {
    accessorKey: "instrument",
    header: "Instrument",
    cell: ({ getValue }) => <TextCell>{getValue() as string}</TextCell>,
  },
  {
    accessorKey: "desk",
    header: "Desk",
    cell: ({ getValue }) => <TextCell>{getValue() as string}</TextCell>,
  },
  {
    accessorKey: "pnl",
    header: "P&L (USD)",
    meta: { numeric: true },
    cell: ({ getValue }) => <TextCell>{usd(getValue() as number)}</TextCell>,
  },
];

const cellTypeColumns: ColumnDef<Position>[] = [
  {
    accessorKey: "instrument",
    header: "Text",
    cell: ({ getValue }) => <TextCell>{getValue() as string}</TextCell>,
  },
  {
    accessorKey: "note",
    header: "Multi-line",
    cell: ({ getValue }) => <MultiLineTextCell>{getValue() as string}</MultiLineTextCell>,
  },
  {
    accessorKey: "allocation",
    header: "Progress",
    cell: ({ getValue }) => <ProgressCell value={getValue() as number} />,
  },
  {
    accessorKey: "desk",
    header: "Badge",
    cell: ({ getValue }) => <BadgeCell>{getValue() as string}</BadgeCell>,
  },
  {
    id: "input",
    header: "Input",
    cell: ({ row }) => <InputCell defaultValue={row.original.desk} />,
  },
  {
    id: "button",
    header: "Button",
    cell: () => <ButtonCell>Edit</ButtonCell>,
  },
];

const tokenColumns: ColumnDef<Position>[] = [
  {
    accessorKey: "instrument",
    header: "Instrument",
    cell: ({ getValue }) => <TextCell>{getValue() as string}</TextCell>,
  },
  {
    accessorKey: "desk",
    header: "Neutral bg",
    meta: { background: "neutral-subtle" },
    cell: ({ getValue }) => <TextCell>{getValue() as string}</TextCell>,
  },
  {
    accessorKey: "allocation",
    header: "Success",
    meta: { status: "success", numeric: true },
    cell: ({ getValue }) => <TextCell>{getValue() as number}%</TextCell>,
  },
  {
    accessorKey: "pnl",
    header: "Warning",
    meta: { status: "warning", numeric: true },
    cell: ({ getValue }) => <TextCell>{usd(getValue() as number)}</TextCell>,
  },
  {
    accessorKey: "status",
    header: "Error",
    meta: { status: "error" },
    cell: ({ getValue }) => <TextCell>{getValue() as string}</TextCell>,
  },
];

const SIZES: DataGridSize[] = ["sm", "md", "lg"];
const DENSITIES: DataGridDensity[] = ["x-compact", "compact", "standard", "spacious"];

const scrollSpySections = [
  { id: "feature-complete", label: "Feature Complete" },
  { id: "density", label: "Density" },
  { id: "size", label: "Size" },
  { id: "cell-content", label: "Cell Content" },
  { id: "status-background", label: "Status & Background" },
  { id: "zebra", label: "Zebra" },
  { id: "sticky", label: "Sticky Header" },
  { id: "keyboard", label: "Keyboard A11y" },
  { id: "props", label: "Props" },
];

const featureCode = `import { DataGrid, TextCell, BadgeCell, ProgressCell, ButtonCell } from "@ds/DataGrid";

<DataGrid
  data={positions}
  columns={columns}
  enableSorting
  enableFiltering
  enableRowSelection
  enablePagination
  pageSize={5}
  zebra
  label="Trading positions"
/>`;

export default function DataGridPage() {
  return (
    <Shell title="DataGrid">
      <ScrollSpy sections={scrollSpySections} />
      <div className="max-w-5xl space-y-10">
        <SectionHeading
          title="DataGrid"
          description="A headless TanStack Table v8 model rendered into a bespoke, token-driven div-based ARIA grid. v1 ships sorting, per-column filtering, row selection, pagination, and the full WAI-ARIA grid keyboard pattern. Cell content reuses existing Élan primitives (Badge, Button, Input, ProgressBar, Checkbox)."
        />

        {/* 1. Feature complete */}
        <section id="feature-complete">
          <ComponentPreview
            title="Feature-complete grid"
            description="Sorting (click a header), per-column filtering (Instrument / Desk), row selection (checkboxes), and pagination, all on one grid. Tab into the grid and use arrow keys, Home/End, and PageUp/PageDown to navigate; Enter or F2 to interact with a cell, Escape to exit."
            code={featureCode}
          >
            <DataGrid
              data={POSITIONS}
              columns={fullColumns}
              enableSorting
              enableFiltering
              enableRowSelection
              enablePagination
              pageSize={5}
              zebra
              label="Trading positions"
            />
          </ComponentPreview>
        </section>

        {/* 2. Density */}
        <section id="density">
          <ComponentPreview
            title="Density"
            description="Row height scales across four densities (x-compact 24px → spacious 48px), snapped to the 8px-grid spacer tokens. Density controls vertical rhythm only; size controls font and horizontal padding."
            code={`<DataGrid data={rows} columns={columns} density="compact" />`}
          >
            <div className="space-y-6 w-full">
              {DENSITIES.map((density) => (
                <div key={density}>
                  <div className="text-xs font-mono mb-2 text-[var(--portfolio-text-secondary)]">
                    density=&quot;{density}&quot;
                  </div>
                  <DataGrid
                    data={SMALL_POSITIONS}
                    columns={compactColumns}
                    density={density}
                    label={`Density ${density}`}
                  />
                </div>
              ))}
            </div>
          </ComponentPreview>
        </section>

        {/* 3. Size */}
        <section id="size">
          <ComponentPreview
            title="Size"
            description="Size scales font size and horizontal cell padding (sm / md / lg) independently of density."
            code={`<DataGrid data={rows} columns={columns} size="lg" />`}
          >
            <div className="space-y-6 w-full">
              {SIZES.map((size) => (
                <div key={size}>
                  <div className="text-xs font-mono mb-2 text-[var(--portfolio-text-secondary)]">
                    size=&quot;{size}&quot;
                  </div>
                  <DataGrid
                    data={SMALL_POSITIONS}
                    columns={compactColumns}
                    size={size}
                    label={`Size ${size}`}
                  />
                </div>
              ))}
            </div>
          </ComponentPreview>
        </section>

        {/* 4. Cell content */}
        <section id="cell-content">
          <ComponentPreview
            title="Cell content types"
            description="Each cell archetype from the GS anatomy maps to a renderer that composes an existing Élan primitive: Text, Multi-line text, Progress, Badge, Input, and Button."
            code={`import { TextCell, MultiLineTextCell, ProgressCell, BadgeCell, InputCell, ButtonCell } from "@ds/DataGrid";

// inside a TanStack ColumnDef:
{ accessorKey: "allocation", cell: ({ getValue }) => <ProgressCell value={getValue()} /> }`}
          >
            <DataGrid
              data={SMALL_POSITIONS}
              columns={cellTypeColumns}
              label="Cell content types"
            />
          </ComponentPreview>
        </section>

        {/* 5. Status & background tokens */}
        <section id="status-background">
          <ComponentPreview
            title="Status & background tokens"
            description="Cells carry an optional status tint (success / warning / error, with a left accent) and a background fill (neutral-subtle / neutral-regular), set via column meta."
            code={`{ accessorKey: "allocation", meta: { status: "success", numeric: true }, cell: ... }
{ accessorKey: "desk", meta: { background: "neutral-subtle" }, cell: ... }`}
          >
            <DataGrid
              data={SMALL_POSITIONS}
              columns={tokenColumns}
              label="Status and background tokens"
            />
          </ComponentPreview>
        </section>

        {/* 6. Zebra */}
        <section id="zebra">
          <ComponentPreview
            title="Zebra striping"
            description="Alternating row backgrounds improve scanning of dense tables. The prop name mirrors the GS Figma property exactly."
            code={`<DataGrid data={rows} columns={columns} zebra />`}
          >
            <DataGrid
              data={POSITIONS.slice(0, 6)}
              columns={compactColumns}
              zebra
              label="Zebra striping"
            />
          </ComponentPreview>
        </section>

        {/* 7. Sticky header */}
        <section id="sticky">
          <ComponentPreview
            title="Sticky header"
            description="With stickyHeader, the column header stays pinned while the body scrolls inside a constrained container."
            code={`<DataGrid data={rows} columns={columns} stickyHeader density="compact" />`}
          >
            <div className="w-full max-h-60 overflow-auto">
              <DataGrid
                data={POSITIONS}
                columns={compactColumns}
                stickyHeader
                density="compact"
                label="Sticky header"
              />
            </div>
          </ComponentPreview>
        </section>

        {/* 8. Keyboard a11y */}
        <section id="keyboard">
          <SubsectionHeading>Keyboard accessibility</SubsectionHeading>
          <p className="text-sm text-[var(--portfolio-text-secondary)] max-w-2xl">
            The grid implements the WAI-ARIA grid pattern. A single Tab moves
            focus into / out of the whole grid (roving tabindex). Arrow keys move
            between cells; Home / End jump to the row edges (Ctrl+Home / Ctrl+End
            to the grid corners); PageUp / PageDown jump by a page. Enter or F2
            enters a cell&apos;s interactive widget (button, input, checkbox);
            Escape returns to navigation. Sort state is announced via
            <code className="font-mono"> aria-sort</code>, selection via
            <code className="font-mono"> aria-selected</code>.
          </p>
        </section>

        {/* Props */}
        <section id="props">
          <SubsectionHeading>Props</SubsectionHeading>
          <PropsTable
            props={[
              { name: "data", type: "TData[]", default: "—", description: "Row data." },
              { name: "columns", type: "ColumnDef<TData>[]", default: "—", description: "TanStack column definitions. meta supports align, numeric, status, background." },
              { name: "size", type: '"sm" | "md" | "lg"', default: '"md"', description: "Font size + horizontal padding scale." },
              { name: "density", type: '"x-compact" | "compact" | "standard" | "spacious"', default: '"standard"', description: "Row height scale (GS density axis)." },
              { name: "zebra", type: "boolean", default: "false", description: "Alternating row backgrounds (mirrors the GS Figma property)." },
              { name: "stickyHeader", type: "boolean", default: "false", description: "Pin the header to the top of the scroll container." },
              { name: "enableSorting", type: "boolean", default: "false", description: "Click-to-sort headers with aria-sort." },
              { name: "enableFiltering", type: "boolean", default: "false", description: "Per-column filter row." },
              { name: "enableRowSelection", type: "boolean", default: "false", description: "Adds a leading checkbox column with select-all." },
              { name: "enablePagination", type: "boolean", default: "false", description: "Adds a pager below the grid." },
              { name: "pageSize", type: "number", default: "10", description: "Initial page size when pagination is enabled." },
              { name: "label", type: "string", default: '"Data grid"', description: "Accessible name (aria-label) for the grid." },
              { name: "getRowId", type: "(row, index) => string", default: "—", description: "Stable row id accessor (recommended with selection)." },
            ]}
          />
        </section>

        <SourcePath path="src/components/ui/DataGrid/DataGrid.tsx · src/components/ui/DataGrid/DataGrid.module.scss" />
      </div>
    </Shell>
  );
}
