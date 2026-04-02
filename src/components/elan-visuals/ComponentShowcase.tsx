"use client";

import { useState } from "react";
import { FadeIn } from "@/components/ui/FadeIn";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/Tabs";
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

  const filtered = filter === "All" ? COMPONENTS : COMPONENTS.filter((c) => c.category === filter);

  return (
    <Tabs value={filter} onValueChange={setFilter} className={styles.visualContainer}>
      <TabsList className={styles.tabList}>
        {CATEGORIES.map((cat) => (
          <TabsTrigger key={cat} value={cat}>
            {cat}
          </TabsTrigger>
        ))}
      </TabsList>

      <TabsContent value={filter} className={styles.componentGrid}>
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
      </TabsContent>
    </Tabs>
  );
}
