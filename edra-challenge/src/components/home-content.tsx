"use client";

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import { PromptPanel } from "./prompt-panel";

type PromptPanelContextValue = {
  activePrompt: string | null;
  setActivePrompt: (prompt: string | null) => void;
};

const PromptPanelContext = createContext<PromptPanelContextValue | null>(null);

export function usePromptPanel() {
  return useContext(PromptPanelContext);
}

export function HomeContent({
  hero,
  content,
}: {
  hero: ReactNode;
  content: ReactNode;
}) {
  const [activePrompt, setActivePromptRaw] = useState<string | null>(null);

  const setActivePrompt = useCallback((prompt: string | null) => {
    setActivePromptRaw(prompt);
  }, []);

  return (
    <PromptPanelContext.Provider value={{ activePrompt, setActivePrompt }}>
      {hero}
      {activePrompt ? (
        <PromptPanel />
      ) : (
        content
      )}
    </PromptPanelContext.Provider>
  );
}
