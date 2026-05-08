export type GroupByDimension = {
  id: string;
  label: string;
  description: string;
  icon: string;
  viewId: string | null;
  viewName: string | null;
};

export const GROUPBY_DIMENSIONS: GroupByDimension[] = [
  { id: "project",       label: "project",       description: "By primary project",     icon: "folder",   viewId: "by-project",        viewName: "By Project" },
  { id: "owner",         label: "owner",         description: "By document author",     icon: "user",     viewId: "by-owner",          viewName: "By Owner" },
  { id: "document-type", label: "type",          description: "By document category",   icon: "file",     viewId: "by-document-type",  viewName: "By Document Type" },
  { id: "recency",       label: "recency",       description: "By last modified date",  icon: "clock",    viewId: "by-recency",        viewName: "By Recency" },
  { id: "client",        label: "client",        description: "By client name",         icon: "building", viewId: "by-client",         viewName: "By Client" },
  { id: "theme",         label: "theme",         description: "By topic tags",          icon: "tag",      viewId: null,                viewName: null },
  { id: "severity",      label: "severity",      description: "By incident severity",   icon: "alert",    viewId: "what-broke",        viewName: "What Broke" },
  { id: "status",        label: "status",        description: "By current status",      icon: "circle",   viewId: null,                viewName: null },
  { id: "meeting-type",  label: "meeting type",  description: "By meeting category",    icon: "calendar", viewId: "meeting-archive",   viewName: "Meeting Archive" },
];

export const FAMILY_DIMENSIONS: Record<string, string[]> = {
  "Incident Investigation": ["severity", "project", "theme", "recency"],
  "Sprint Planning":        ["project", "owner", "status", "recency"],
  "Workspace Hygiene":      ["owner", "project", "recency", "status"],
  "Project Status":         ["owner", "document-type", "recency", "status"],
  "Person/Ownership":       ["project", "document-type", "recency"],
  "Doc Type Exploration":   ["project", "owner", "status", "recency"],
  "Onboarding":             ["project", "document-type"],
  "General":                ["project", "owner", "document-type", "recency", "client"],
};

export function getDimensionsForFamily(
  family: string,
  ensureIncluded?: string,
): GroupByDimension[] {
  const ids = [...(FAMILY_DIMENSIONS[family] ?? FAMILY_DIMENSIONS["General"])];
  if (ensureIncluded && !ids.includes(ensureIncluded)) {
    ids.unshift(ensureIncluded);
  }
  return ids
    .map(id => GROUPBY_DIMENSIONS.find(d => d.id === id))
    .filter((d): d is GroupByDimension => d != null);
}
