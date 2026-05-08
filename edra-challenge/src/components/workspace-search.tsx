"use client";

import { useRef, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { SearchInput, type SearchInputHandle } from "./search-input";
import { useDocumentDrawer } from "./document-drawer";

export function WorkspaceSearch() {
  const searchRef = useRef<SearchInputHandle>(null);
  const { openDrawer } = useDocumentDrawer();
  const searchParams = useSearchParams();
  const router = useRouter();
  const viewId = searchParams.get("view") ?? "by-project";

  const handleResultSelect = useCallback(
    (docId: string) => {
      openDrawer(docId);
    },
    [openDrawer],
  );

  const handleGroupByNavigate = useCallback(
    (targetViewId: string) => {
      router.push(`/workspace?view=${targetViewId}`);
    },
    [router],
  );

  return (
    <div className="flex-1 min-w-0">
      <SearchInput ref={searchRef} compact hidePlusMenu viewId={viewId} onResultSelect={handleResultSelect} onGroupByNavigate={handleGroupByNavigate} />
    </div>
  );
}
