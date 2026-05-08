"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

const EXPAND_THRESHOLD = 5;

const ExpandedContext = createContext(false);

export function useExpanded() {
  return useContext(ExpandedContext);
}

export function ExpandableContent({ children }: { children: ReactNode }) {
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    function onScroll() {
      if (window.scrollY >= EXPAND_THRESHOLD) {
        setExpanded(true);
        window.removeEventListener("scroll", onScroll);
      }
    }

    if (window.scrollY >= EXPAND_THRESHOLD) {
      setExpanded(true);
      return;
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <ExpandedContext.Provider value={expanded}>
      <div
        className="flex flex-col items-center w-full"
        style={{
          maxWidth: expanded ? "100%" : 720,
          transition: "max-width 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      >
        {children}
      </div>
    </ExpandedContext.Provider>
  );
}
