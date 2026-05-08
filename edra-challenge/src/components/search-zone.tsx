"use client";

import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { SearchInput, type SearchInputHandle } from "./search-input";
import { QuickActionZone } from "./quick-action-zone";
import { usePromptPanel } from "./home-content";
import { useDocumentDrawer } from "./document-drawer";

export function SearchZone() {
  const [searchFocused, setSearchFocused] = useState(false);
  const [searchActive, setSearchActive] = useState(false);
  const searchRef = useRef<SearchInputHandle>(null);
  const promptPanel = usePromptPanel();
  const router = useRouter();
  const { openDrawer } = useDocumentDrawer();

  const handleQuickAction = useCallback((query: string) => {
    if (promptPanel) {
      promptPanel.setActivePrompt(query);
    } else {
      searchRef.current?.setQuery(query);
    }
  }, [promptPanel]);

  const handleChipInsert = useCallback((label: string) => {
    searchRef.current?.appendText(label);
  }, []);

  const handleGroupByNavigate = useCallback((viewId: string) => {
    router.push(`/workspace?view=${viewId}`);
  }, [router]);

  const handlePromptSubmit = useCallback((query: string) => {
    if (promptPanel) {
      promptPanel.setActivePrompt(query);
    }
  }, [promptPanel]);

  return (
    <>
      <div className="w-full">
        <SearchInput
          ref={searchRef}
          onFocusChange={setSearchFocused}
          onActiveChange={setSearchActive}
          onResultSelect={openDrawer}
          onGroupByNavigate={handleGroupByNavigate}
          onPromptSubmit={handlePromptSubmit}
        />
      </div>
      <QuickActionZone
        searchFocused={searchFocused}
        searchActive={searchActive}
        className="self-start w-full mt-5"
        onQuickAction={handleQuickAction}
        onChipInsert={handleChipInsert}
      />
    </>
  );
}
