"use client";

import { useEffect, useState, type ReactNode } from "react";

const EXPAND_THRESHOLD = 5;

export function StickyHero({ children }: { children: ReactNode }) {
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
    <section
      className="sticky top-0 z-10 flex flex-col items-center w-full px-6 py-5 bg-[var(--color-background)]"
      style={{
        maxWidth: expanded ? "100%" : 720,
        transition: "max-width 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
      }}
    >
      {children}
    </section>
  );
}
