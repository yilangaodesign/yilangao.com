"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { Shell } from "@/components/shell";
import { SectionHeading } from "@/components/token-grid";
import { ComponentPreview, PropsTable } from "@/components/component-preview";

function ScrollSpyDemo() {
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const drag = useRef({ active: false, index: -1 });

  const sections = [
    { id: "demo-overview", label: "Overview" },
    { id: "demo-features", label: "Features" },
    { id: "demo-api", label: "API" },
    { id: "demo-examples", label: "Examples" },
    { id: "demo-notes", label: "Notes" },
  ];

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const elements = sections
      .map((s) => container.querySelector(`#${s.id}`))
      .filter(Boolean) as HTMLElement[];

    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (drag.current.active) return;
        let topEntry: IntersectionObserverEntry | null = null;
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          if (
            !topEntry ||
            entry.boundingClientRect.top < topEntry.boundingClientRect.top
          ) {
            topEntry = entry;
          }
        }
        if (topEntry) {
          const idx = elements.indexOf(topEntry.target as HTMLElement);
          if (idx !== -1) setActiveIndex(idx);
        }
      },
      { root: container, rootMargin: "-10% 0px -70% 0px", threshold: 0 },
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const scrollTo = useCallback(
    (index: number, behavior: ScrollBehavior = "smooth") => {
      const container = containerRef.current;
      const el = container?.querySelector(`#${sections[index]?.id}`);
      if (el) {
        el.scrollIntoView({ behavior, block: "start" });
        setActiveIndex(index);
      }
    },
    [],
  );

  const indexFromPointer = useCallback(
    (clientY: number): number => {
      if (!trackRef.current) return 0;
      const { top, height } = trackRef.current.getBoundingClientRect();
      const ratio = (clientY - top) / height;
      const index = Math.round(ratio * (sections.length - 1));
      return Math.max(0, Math.min(index, sections.length - 1));
    },
    [],
  );

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (e.button !== 0) return;
      e.preventDefault();
      trackRef.current?.setPointerCapture(e.pointerId);

      const idx = indexFromPointer(e.clientY);
      drag.current = { active: true, index: idx };
      setDragIndex(idx);
      scrollTo(idx, "instant");
    },
    [indexFromPointer, scrollTo],
  );

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!drag.current.active) return;
      const idx = indexFromPointer(e.clientY);
      if (idx !== drag.current.index) {
        drag.current.index = idx;
        setDragIndex(idx);
        scrollTo(idx, "instant");
      }
    },
    [indexFromPointer, scrollTo],
  );

  const endDrag = useCallback(() => {
    drag.current = { active: false, index: -1 };
    setDragIndex(null);
  }, []);

  const isDragging = dragIndex !== null;

  return (
    <div className="flex gap-6 w-full">
      <div
        ref={containerRef}
        className="flex-1 h-[360px] overflow-y-auto rounded-sm border border-border bg-muted/20 scroll-smooth"
      >
        {sections.map((section, i) => (
          <div
            key={section.id}
            id={section.id}
            className="min-h-[200px] p-6 border-b border-border last:border-b-0"
          >
            <h3 className="text-sm font-medium mb-2">{section.label}</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {i === 0 && "This is the overview section. Scroll down to see the active indicator change on the right rail."}
              {i === 1 && "Features section — the scroll spy tracks which section is in view using IntersectionObserver and highlights the corresponding tick."}
              {i === 2 && "API section — the component accepts a sections array with id and label. Each section in the page needs a matching id attribute."}
              {i === 3 && "Examples section — click any tick on the right to scroll to that section. Click and drag to snap between sections."}
              {i === 4 && "Notes section — the component is hidden on mobile. On desktop, it appears fixed on the right edge of the viewport."}
            </p>
          </div>
        ))}
      </div>

      <div
        ref={trackRef}
        className={`flex flex-col gap-2 items-end pt-4 shrink-0 p-3 -m-3 touch-none select-none ${isDragging ? "cursor-grabbing" : "cursor-pointer"}`}
        onPointerEnter={() => setIsHovered(true)}
        onPointerLeave={() => setIsHovered(false)}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onLostPointerCapture={endDrag}
      >
        {sections.map((section, i) => {
          const isActive = i === activeIndex;
          const isDragTarget = isDragging && i === dragIndex;
          const showLabel = isDragging ? isDragTarget : isHovered;

          return (
            <div key={section.id} className="relative flex items-center justify-end">
              {showLabel && (
                <span className="absolute right-[calc(100%+8px)] top-1/2 -translate-y-1/2 text-[11px] font-mono text-muted-foreground whitespace-nowrap pointer-events-none animate-in fade-in slide-in-from-right-1 duration-100">
                  {section.label}
                </span>
              )}
              <button
                onClick={() => scrollTo(i)}
                className={`h-[2px] rounded-sm transition-all duration-200 ${
                  isActive || isDragTarget
                    ? "w-7 bg-foreground"
                    : isHovered && !isDragging
                      ? "w-5 bg-muted-foreground/60"
                      : "w-4 bg-border"
                }`}
                aria-label={`Jump to ${section.label}`}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}

const scrollSpyCode = `"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DURATION, EASING } from "@/lib/motion";
import styles from "./ScrollSpy.module.scss";

export type ScrollSpySection = { id: string; label: string };

export default function ScrollSpy({ sections }: { sections: ScrollSpySection[] }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [hoverTickIndex, setHoverTickIndex] = useState<number | null>(null);

  const trackRef = useRef<HTMLDivElement>(null);
  const drag = useRef({ active: false, index: -1 });

  // IntersectionObserver tracking (paused during drag)
  useEffect(() => { /* ... */ }, [sections]);

  const scrollTo = useCallback((index, behavior = "smooth") => {
    document.getElementById(sections[index]?.id)
      ?.scrollIntoView({ behavior, block: "start" });
    setActiveIndex(index);
  }, [sections]);

  const indexFromPointer = useCallback((clientY) => {
    const { top, height } = trackRef.current.getBoundingClientRect();
    return Math.max(0, Math.min(
      Math.round(((clientY - top) / height) * (sections.length - 1)),
      sections.length - 1
    ));
  }, [sections.length]);

  // Pointer capture keeps all events on the track during drag
  const onPointerDown = (e) => {
    trackRef.current?.setPointerCapture(e.pointerId);
    const idx = indexFromPointer(e.clientY);
    drag.current = { active: true, index: idx };
    setDragIndex(idx);
    scrollTo(idx, "instant");
  };

  const onPointerMove = (e) => {
    if (!drag.current.active) return;
    const idx = indexFromPointer(e.clientY);
    if (idx !== drag.current.index) {
      drag.current.index = idx;
      setDragIndex(idx);
      scrollTo(idx, "instant");
    }
  };

  const endDrag = () => {
    drag.current = { active: false, index: -1 };
    setDragIndex(null);
  };

  // Render: track container handles all pointer events.
  // Individual ticks use mouse events for hover labels
  // and onClick for keyboard accessibility.
}`;

const usageCode = `import ScrollSpy from "@/components/ScrollSpy";

const sections = [
  { id: "intro", label: "Introduction" },
  { id: "features", label: "Features" },
  { id: "api", label: "API Reference" },
];

<main>
  <ScrollSpy sections={sections} />
  <section id="intro">...</section>
  <section id="features">...</section>
  <section id="api">...</section>
</main>`;

export default function ScrollSpyPage() {
  return (
    <Shell title="ScrollSpy">
      <div className="max-w-5xl space-y-10">
        <SectionHeading
          title="ScrollSpy"
          description="A fixed vertical rail of section indicators on the right edge of the viewport. Tracks the active section via IntersectionObserver, supports click-to-scroll and drag-to-snap navigation. Hidden on mobile."
        />

        <ComponentPreview
          title="Interactive Demo"
          description="Scroll the panel below to see the active indicator change. Hover the rail to see ticks expand. Click a tick to jump, or click and drag to scrub between sections."
          code={scrollSpyCode}
        >
          <ScrollSpyDemo />
        </ComponentPreview>

        <div>
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-3">
            Props
          </h3>
          <PropsTable
            props={[
              {
                name: "sections",
                type: "ScrollSpySection[]",
                description: "Array of { id, label } objects. Each id must match a DOM element's id attribute.",
              },
            ]}
          />
        </div>

        <div>
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-3">
            ScrollSpySection Type
          </h3>
          <PropsTable
            props={[
              {
                name: "id",
                type: "string",
                description: "The DOM id of the section element to observe and scroll to.",
              },
              {
                name: "label",
                type: "string",
                description: "Display label shown on hover and during drag.",
              },
            ]}
          />
        </div>

        <ComponentPreview
          title="Usage"
          description="Add id attributes to your page sections and pass the section list to ScrollSpy."
          code={usageCode}
        >
          <div className="text-sm text-muted-foreground text-center py-4">
            See code tab for integration pattern.
          </div>
        </ComponentPreview>

        <div>
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-3">
            Interaction States
          </h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex gap-2">
              <span className="text-accent shrink-0">•</span>
              <span><strong>Idle:</strong> Ticks at default width (16px). Active section tick is wider (28px) and uses primary color.</span>
            </li>
            <li className="flex gap-2">
              <span className="text-accent shrink-0">•</span>
              <span><strong>Rail hover:</strong> All non-active ticks widen to 20px, signaling the interactive zone. Individual tick hover widens further to 24px with label tooltip.</span>
            </li>
            <li className="flex gap-2">
              <span className="text-accent shrink-0">•</span>
              <span><strong>Drag:</strong> Pointer down activates drag mode. Moving the pointer snaps to the nearest notch with instant scroll. Labels show at the current drag target. Cursor changes to grabbing.</span>
            </li>
            <li className="flex gap-2">
              <span className="text-accent shrink-0">•</span>
              <span><strong>Click:</strong> Clicking a notch navigates instantly to that section. Keyboard users can focus and press Enter/Space.</span>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-3">
            Technical Notes
          </h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex gap-2">
              <span className="text-accent shrink-0">•</span>
              <span><strong>Pointer capture:</strong> Uses <code className="text-xs bg-muted px-1.5 py-0.5 rounded-sm font-mono">setPointerCapture</code> instead of window-level event listeners, keeping all drag events on the track element.</span>
            </li>
            <li className="flex gap-2">
              <span className="text-accent shrink-0">•</span>
              <span><strong>Observer pausing:</strong> IntersectionObserver callbacks are skipped during drag via a ref check, preventing the observer from fighting user intent.</span>
            </li>
            <li className="flex gap-2">
              <span className="text-accent shrink-0">•</span>
              <span><strong>Data attributes:</strong> State styling uses <code className="text-xs bg-muted px-1.5 py-0.5 rounded-sm font-mono">data-active</code>, <code className="text-xs bg-muted px-1.5 py-0.5 rounded-sm font-mono">data-dragging</code>, and <code className="text-xs bg-muted px-1.5 py-0.5 rounded-sm font-mono">data-hovered</code> attributes instead of class concatenation.</span>
            </li>
            <li className="flex gap-2">
              <span className="text-accent shrink-0">•</span>
              <span><strong>Responsive:</strong> Hidden below <code className="text-xs bg-muted px-1.5 py-0.5 rounded-sm font-mono">lg</code> breakpoint. Not useful on small viewports.</span>
            </li>
          </ul>
        </div>

        <div className="text-xs font-mono text-muted-foreground p-3 rounded-sm bg-muted/50">
          src/components/ScrollSpy.tsx, src/components/ScrollSpy.module.scss
        </div>
      </div>
    </Shell>
  );
}
