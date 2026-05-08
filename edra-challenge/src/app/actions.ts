"use server";

import { getWorkspaceTree, type FolderNode } from "@/lib/queries";

export type FolderMetaEntry = [
  string,
  { displayName: string; description: string | null },
];

export type PromptViewResult = {
  tree: FolderNode;
  folderMetaEntries: FolderMetaEntry[];
  viewId: string;
  viewName: string;
};

const PROMPT_VIEW_MAP: { keywords: string[]; viewId: string }[] = [
  { keywords: ["meeting", "prep", "today"], viewId: "for-your-meetings" },
  { keywords: ["project", "docs by project"], viewId: "by-project" },
  { keywords: ["changed", "week", "recent"], viewId: "by-recency" },
  { keywords: ["owner", "who"], viewId: "by-owner" },
  { keywords: ["stale", "outdated", "attention"], viewId: "needs-attention" },
  { keywords: ["type", "document type"], viewId: "by-document-type" },
  { keywords: ["client"], viewId: "by-client" },
  { keywords: ["onboarding", "new hire"], viewId: "onboarding" },
  { keywords: ["decision", "adr", "decided"], viewId: "what-did-we-decide" },
  { keywords: ["building", "roadmap"], viewId: "what-were-building" },
];

export async function generateView(
  prompt: string,
): Promise<PromptViewResult> {
  const matched =
    PROMPT_VIEW_MAP.find((m) =>
      m.keywords.some((k) => prompt.toLowerCase().includes(k)),
    ) ?? PROMPT_VIEW_MAP[0];

  const result = await getWorkspaceTree(matched.viewId);
  return {
    tree: result.tree,
    folderMetaEntries: [...result.folderMeta.entries()],
    viewId: matched.viewId,
    viewName: result.viewName ?? matched.viewId,
  };
}
