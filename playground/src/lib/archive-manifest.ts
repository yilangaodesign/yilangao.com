export type ItemType = "Component" | "Page" | "Token" | "Style";
export type Experiment = "experiment-01" | "experiment-02" | "shared";
export type ArchivedBy = "user" | "cursor";
export type CreatedBy = "user" | "cursor";
export type OriginType = "custom" | "library" | "hybrid";

export interface Origin {
  type: OriginType;
  library?: string;
  url?: string;
}

export interface ArchiveItem {
  id: string;
  name: string;
  type: ItemType;
  experiment: Experiment;
  status: "active" | "archived";
  description: string;
  sourcePath: string;
  createdAt: string;
  createdBy: CreatedBy;
  origin: Origin;
  tags: string[];
  hasPreview: boolean;

  archivePath?: string;
  archivedAt?: string;
  archivedBy?: ArchivedBy;
  reason?: string;
}

export interface ArchiveManifest {
  items: ArchiveItem[];
}

export function getArchivedItems(items: ArchiveItem[]): ArchiveItem[] {
  return items.filter((i) => i.status === "archived");
}

export function getActiveItems(items: ArchiveItem[]): ArchiveItem[] {
  return items.filter((i) => i.status === "active");
}

export function getUniqueExperiments(items: ArchiveItem[]): Experiment[] {
  const set = new Set(items.map((i) => i.experiment));
  return Array.from(set) as Experiment[];
}

export function getUniqueTypes(items: ArchiveItem[]): ItemType[] {
  const set = new Set(items.map((i) => i.type));
  return Array.from(set) as ItemType[];
}
