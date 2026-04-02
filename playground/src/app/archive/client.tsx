"use client";

import { useState, useMemo, useCallback } from "react";
import { Shell } from "@/components/shell";
import { SectionHeading } from "@/components/token-grid";
import { ArchiveTile } from "@/components/archive-tile";
import { ArchiveListRow } from "@/components/archive-list-row";
import { ArchiveDrawer } from "@/components/archive-drawer";
import { getArchivedItems, getUniqueExperiments, getUniqueTypes } from "@/lib/archive-manifest";
import type { ArchiveItem, ItemType, Experiment } from "@/lib/archive-manifest";
import LayoutGrid from "lucide-react/dist/esm/icons/layout-grid";
import List from "lucide-react/dist/esm/icons/list";
import Search from "lucide-react/dist/esm/icons/search";
import ArrowUpDown from "lucide-react/dist/esm/icons/arrow-up-down";
import { cn } from "@/lib/utils";

type ViewMode = "gallery" | "list";
type SortKey = "name-asc" | "name-desc" | "archived-newest" | "archived-oldest" | "type" | "experiment";

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "archived-newest", label: "Newest archived" },
  { value: "archived-oldest", label: "Oldest archived" },
  { value: "name-asc", label: "Name A\u2013Z" },
  { value: "name-desc", label: "Name Z\u2013A" },
  { value: "type", label: "Type" },
  { value: "experiment", label: "Experiment" },
];

function sortItems(items: ArchiveItem[], key: SortKey): ArchiveItem[] {
  const sorted = [...items];
  switch (key) {
    case "name-asc":
      return sorted.sort((a, b) => a.name.localeCompare(b.name));
    case "name-desc":
      return sorted.sort((a, b) => b.name.localeCompare(a.name));
    case "archived-newest":
      return sorted.sort((a, b) => {
        const da = a.archivedAt ? new Date(a.archivedAt).getTime() : 0;
        const db = b.archivedAt ? new Date(b.archivedAt).getTime() : 0;
        return db - da;
      });
    case "archived-oldest":
      return sorted.sort((a, b) => {
        const da = a.archivedAt ? new Date(a.archivedAt).getTime() : 0;
        const db = b.archivedAt ? new Date(b.archivedAt).getTime() : 0;
        return da - db;
      });
    case "type":
      return sorted.sort((a, b) => a.type.localeCompare(b.type) || a.name.localeCompare(b.name));
    case "experiment":
      return sorted.sort((a, b) => a.experiment.localeCompare(b.experiment) || a.name.localeCompare(b.name));
    default:
      return sorted;
  }
}

export function ArchivePageClient({ items: allItems }: { items: ArchiveItem[] }) {
  const [items, setItems] = useState(allItems);
  const archivedItems = getArchivedItems(items);
  const experiments = getUniqueExperiments(archivedItems);
  const types = getUniqueTypes(archivedItems);

  const [view, setView] = useState<ViewMode>("gallery");
  const [search, setSearch] = useState("");
  const [filterExperiment, setFilterExperiment] = useState<Experiment | "all">("all");
  const [filterType, setFilterType] = useState<ItemType | "all">("all");
  const [selectedItem, setSelectedItem] = useState<ArchiveItem | null>(null);
  const [sortKey, setSortKey] = useState<SortKey>("archived-newest");

  const filtered = useMemo(() => {
    const base = archivedItems.filter((item) => {
      if (filterExperiment !== "all" && item.experiment !== filterExperiment) return false;
      if (filterType !== "all" && item.type !== filterType) return false;
      if (search) {
        const q = search.toLowerCase();
        return (
          item.name.toLowerCase().includes(q) ||
          item.description.toLowerCase().includes(q) ||
          item.tags.some((t) => t.toLowerCase().includes(q))
        );
      }
      return true;
    });
    return sortItems(base, sortKey);
  }, [archivedItems, filterExperiment, filterType, search, sortKey]);

  const handleRecover = useCallback((item: ArchiveItem) => {
    setSelectedItem(item);
  }, []);

  const handleDeleted = useCallback((deletedId: string) => {
    setItems((prev) => prev.filter((i) => i.id !== deletedId));
  }, []);

  return (
    <Shell title="Archive">
      <div className="max-w-5xl">
        <SectionHeading
          title="Archive"
          description="Explored-but-shelved components, layouts, tokens, and styles from across experiments. Click any item to see details and restore."
        />

        {/* Toolbar */}
        <div className="flex items-center gap-3 mb-5 flex-wrap">
          <div className="relative flex-1 min-w-[180px] max-w-xs">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
            <input
              type="text"
              placeholder="Search archive..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-8 pl-8 pr-3 text-sm rounded-sm border border-border bg-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-foreground/20"
            />
          </div>

          <select
            value={filterExperiment}
            onChange={(e) => setFilterExperiment(e.target.value as Experiment | "all")}
            className="h-8 px-2.5 text-xs font-mono rounded-sm border border-border bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-foreground/20"
          >
            <option value="all">All experiments</option>
            {experiments.map((exp) => (
              <option key={exp} value={exp}>{exp}</option>
            ))}
          </select>

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as ItemType | "all")}
            className="h-8 px-2.5 text-xs font-mono rounded-sm border border-border bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-foreground/20"
          >
            <option value="all">All types</option>
            {types.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>

          <div className="flex items-center gap-1.5">
            <ArrowUpDown className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
            <select
              value={sortKey}
              onChange={(e) => setSortKey(e.target.value as SortKey)}
              className="h-8 px-2.5 text-xs font-mono rounded-sm border border-border bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-foreground/20"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center border border-border rounded-sm overflow-hidden ml-auto">
            <button
              onClick={() => setView("gallery")}
              className={cn(
                "flex items-center justify-center w-8 h-8 transition-colors",
                view === "gallery"
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
              aria-label="Gallery view"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setView("list")}
              className={cn(
                "flex items-center justify-center w-8 h-8 transition-colors",
                view === "list"
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
              aria-label="List view"
            >
              <List className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <p className="text-xs text-muted-foreground mb-4">
          {filtered.length} {filtered.length === 1 ? "item" : "items"}
          {(filterExperiment !== "all" || filterType !== "all" || search) && " (filtered)"}
        </p>

        {filtered.length === 0 ? (
          <div className="py-16 text-center text-sm text-muted-foreground">
            No archived items match your filters.
          </div>
        ) : view === "gallery" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {filtered.map((item) => (
              <ArchiveTile
                key={item.id}
                item={item}
                onClick={() => setSelectedItem(item)}
                onRecover={() => handleRecover(item)}
                onDeleted={() => handleDeleted(item.id)}
              />
            ))}
          </div>
        ) : (
          <div className="space-y-px">
            {filtered.map((item) => (
              <ArchiveListRow
                key={item.id}
                item={item}
                onClick={() => setSelectedItem(item)}
                onRecover={() => handleRecover(item)}
                onDeleted={() => handleDeleted(item.id)}
              />
            ))}
          </div>
        )}
      </div>

      <ArchiveDrawer item={selectedItem} onClose={() => setSelectedItem(null)} />
    </Shell>
  );
}
