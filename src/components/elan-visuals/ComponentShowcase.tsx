"use client";

import { useState, useRef, useCallback } from "react";
import { FadeIn } from "@/components/ui/FadeIn";
import styles from "./elan-visuals.module.scss";

const COMPONENTS = [
  { name: "FadeIn", category: "Animation", desc: "Scroll-triggered entrance", playground: "/components/fade-in" },
  { name: "ScrollSpy", category: "Navigation", desc: "Section rail + drag scrub", playground: "/components/scroll-spy" },
  { name: "Marquee", category: "Animation", desc: "Infinite scroll, CSS-only", playground: "/components/marquee" },
  { name: "ExpandCollapse", category: "Disclosure", desc: "AnimatePresence + auto height", playground: "/components/expand-collapse" },
  { name: "ArrowReveal", category: "Interaction", desc: "Hover-driven icon reveal", playground: "/components/arrow-reveal" },
  { name: "Dialog", category: "Overlay", desc: "Radix UI + focus trap", playground: "/components/dialog" },
  { name: "DropdownMenu", category: "Overlay", desc: "Radix UI + keyboard nav", playground: "/components/dropdown-menu" },
  { name: "Select", category: "Form", desc: "Radix UI + custom SCSS", playground: "/components/select" },
  { name: "Tooltip", category: "Overlay", desc: "Radix UI + configurable side", playground: "/components/tooltip" },
  { name: "Toast", category: "Feedback", desc: "Swipe-to-dismiss notification", playground: "/components/toast" },
  { name: "Tabs", category: "Disclosure", desc: "Radix UI + underline indicator", playground: "/components/tabs" },
  { name: "Checkbox", category: "Form", desc: "Radix UI + indeterminate state", playground: "/components/checkbox" },
];

const CATEGORIES = ["All", "Animation", "Navigation", "Disclosure", "Interaction", "Overlay", "Form", "Feedback"] as const;

export default function ComponentShowcase() {
  const [filter, setFilter] = useState<string>("All");
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const handleTabKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      const idx = CATEGORIES.indexOf(filter as typeof CATEGORIES[number]);
      let next = idx;
      if (e.key === "ArrowRight") next = (idx + 1) % CATEGORIES.length;
      else if (e.key === "ArrowLeft") next = (idx - 1 + CATEGORIES.length) % CATEGORIES.length;
      else if (e.key === "Home") next = 0;
      else if (e.key === "End") next = CATEGORIES.length - 1;
      else return;
      e.preventDefault();
      setFilter(CATEGORIES[next]);
      tabRefs.current[next]?.focus();
    },
    [filter],
  );

  const filtered = filter === "All" ? COMPONENTS : COMPONENTS.filter((c) => c.category === filter);

  return (
    <div className={styles.visualContainer}>
      <div className={styles.tabBar} role="tablist" aria-label="Component categories" onKeyDown={handleTabKeyDown}>
        {CATEGORIES.map((cat, i) => (
          <button
            key={cat}
            ref={(el) => { tabRefs.current[i] = el; }}
            role="tab"
            id={`compShowcase-tab-${cat}`}
            aria-selected={filter === cat}
            aria-controls="compShowcase-panel"
            tabIndex={filter === cat ? 0 : -1}
            className={`${styles.tab} ${filter === cat ? styles.tabActive : ""}`}
            onClick={() => setFilter(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className={styles.componentGrid} role="tabpanel" id="compShowcase-panel" aria-labelledby={`compShowcase-tab-${filter}`}>
        {filtered.map((comp) => (
          <FadeIn key={comp.name}>
            <div className={styles.componentCard}>
              <div className={styles.componentCardHeader}>
                <span className={styles.componentName}>{comp.name}</span>
                <span className={styles.componentCategory}>{comp.category}</span>
              </div>
              <span className={styles.componentDesc}>{comp.desc}</span>
            </div>
          </FadeIn>
        ))}
      </div>
    </div>
  );
}
