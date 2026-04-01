"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DURATION, EASING } from "@/lib/motion";
import styles from "./ScrollSpy.module.scss";

export type ScrollSpySection = {
  id: string;
  label: string;
};

type ScrollSpyProps = {
  sections: ScrollSpySection[];
};

export default function ScrollSpy({ sections }: ScrollSpyProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  const trackRef = useRef<HTMLDivElement>(null);
  const drag = useRef({ active: false, index: -1 });
  const pointerStart = useRef<{ y: number; index: number } | null>(null);

  useEffect(() => {
    const elements = sections
      .map((s) => document.getElementById(s.id))
      .filter(Boolean) as HTMLElement[];

    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (drag.current.active) return;

        let best: IntersectionObserverEntry | null = null;
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          if (
            !best ||
            entry.boundingClientRect.top < best.boundingClientRect.top
          ) {
            best = entry;
          }
        }

        if (best) {
          const idx = elements.indexOf(best.target as HTMLElement);
          if (idx !== -1) setActiveIndex(idx);
        }
      },
      { rootMargin: "-20% 0px -60% 0px", threshold: 0 },
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [sections]);

  const scrollTo = useCallback(
    (index: number, behavior: ScrollBehavior = "smooth") => {
      const el = document.getElementById(sections[index]?.id);
      if (el) {
        el.scrollIntoView({ behavior, block: "start" });
        setActiveIndex(index);
      }
    },
    [sections],
  );

  const indexFromPointer = useCallback((clientY: number): number => {
    const notches =
      trackRef.current?.querySelectorAll<HTMLElement>("[data-notch-index]");
    if (!notches || notches.length === 0) return 0;
    let closest = 0;
    let minDist = Infinity;
    notches.forEach((el, i) => {
      const rect = el.getBoundingClientRect();
      const dist = Math.abs(clientY - (rect.top + rect.height / 2));
      if (dist < minDist) {
        minDist = dist;
        closest = i;
      }
    });
    return closest;
  }, []);

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (e.button !== 0) return;
      e.preventDefault();
      trackRef.current?.setPointerCapture(e.pointerId);
      const idx = indexFromPointer(e.clientY);
      pointerStart.current = { y: e.clientY, index: idx };
    },
    [indexFromPointer],
  );

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!pointerStart.current) return;

      if (!drag.current.active) {
        if (Math.abs(e.clientY - pointerStart.current.y) < 3) return;
        drag.current = { active: true, index: pointerStart.current.index };
        setDragIndex(pointerStart.current.index);
        scrollTo(pointerStart.current.index, "instant");
      }

      const idx = indexFromPointer(e.clientY);
      if (idx !== drag.current.index) {
        drag.current.index = idx;
        setDragIndex(idx);
        scrollTo(idx, "instant");
      }
    },
    [indexFromPointer, scrollTo],
  );

  const endInteraction = useCallback(() => {
    if (pointerStart.current && !drag.current.active) {
      scrollTo(pointerStart.current.index, "smooth");
    }
    drag.current = { active: false, index: -1 };
    pointerStart.current = null;
    setDragIndex(null);
  }, [scrollTo]);

  if (sections.length < 2) return null;

  const isDragging = dragIndex !== null;

  return (
    <nav className={styles.rail} aria-label="Page sections">
      <div
        ref={trackRef}
        className={styles.track}
        data-hovered={isHovered || undefined}
        data-dragging={isDragging || undefined}
        onPointerEnter={() => setIsHovered(true)}
        onPointerLeave={() => setIsHovered(false)}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endInteraction}
        onLostPointerCapture={endInteraction}
      >
        {sections.map((section, i) => {
          const isActive = i === activeIndex;
          const isDragTarget = isDragging && i === dragIndex;
          const showLabel = isDragging ? isDragTarget : isHovered;

          return (
            <div key={section.id} className={styles.notch} data-notch-index={i} data-active={isActive || undefined}>
              <AnimatePresence>
                {showLabel && (
                  <motion.span
                    className={styles.label}
                    initial={{ opacity: 0, x: 4 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 4 }}
                    transition={{
                      duration: isDragging ? 0 : DURATION.fast,
                      ease: EASING.standard,
                    }}
                  >
                    {section.label}
                  </motion.span>
                )}
              </AnimatePresence>

              <button
                className={styles.tick}
                data-active={isActive || undefined}
                data-drag-target={isDragTarget || undefined}
                onClick={() => scrollTo(i)}
                aria-label={`Jump to ${section.label}`}
                aria-current={isActive ? "true" : undefined}
              />
            </div>
          );
        })}
      </div>
    </nav>
  );
}
