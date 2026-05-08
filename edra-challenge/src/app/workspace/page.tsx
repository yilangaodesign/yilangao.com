import { getWorkspaceTree, getAllViews } from "@/lib/queries";
import { FolderTree } from "@/components/folder-tree";
import { ViewSelector } from "@/components/view-selector";
import { ShareDialog } from "@/components/share-dialog";
import { DocumentDrawerProvider } from "@/components/document-drawer";
import { WorkspaceSearch } from "@/components/workspace-search";
import { SuggestionProvider } from "@/components/smart-suggestion-toast";

export default async function WorkspacePage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string }>;
}) {
  const { view } = await searchParams;
  const activeView = view ?? "by-project";

  const [{ tree, folderMeta }, allViews] = await Promise.all([
    getWorkspaceTree(activeView),
    getAllViews(),
  ]);

  const currentView = allViews.find((v) => v.id === activeView);

  return (
    <DocumentDrawerProvider>
      <SuggestionProvider tree={tree} viewId={activeView}>
        <div className="flex flex-col w-full mx-auto px-6 py-8 gap-5">
          <div className="flex flex-col gap-3">
            <h1 className="text-[length:var(--type-2xl)] font-serif font-semibold tracking-tight">
              My workspace
            </h1>
            <div className="flex items-center gap-3">
              <ViewSelector currentViewId={activeView} allViews={allViews} />
              <WorkspaceSearch />
              {currentView && <ShareDialog view={currentView} />}
            </div>
          </div>

          <FolderTree root={tree} folderMeta={folderMeta} viewId={activeView} />
        </div>
      </SuggestionProvider>
    </DocumentDrawerProvider>
  );
}
