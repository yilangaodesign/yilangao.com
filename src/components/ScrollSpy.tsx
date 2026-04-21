"use client";

import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  useCallback,
} from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { DURATION, EASING } from "@/lib/motion";
import styles from "./ScrollSpy.module.scss";

const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

export type ScrollSpySection = {
  id: string;
  label: string;
  depth?: 0 | 1;
  group?: string;
};

type ScrollSpyProps = {
  sections: ScrollSpySection[];
};

export default function ScrollSpy({ sections }: ScrollSpyProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [mounted, setMounted] = useState(false);
  const [overlayPos, setOverlayPos] = useState<{
    top: number;
    left: number;
  } | null>(null);

  const trackRef = useRef<HTMLDivElement>(null);
  const drag = useRef({ active: false, index: -1 });
  const pointerStart = useRef<{ y: number; index: number } | null>(null);

  useEffect(() => setMounted(true), []);

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
        const top = el.getBoundingClientRect().top + window.scrollY - window.innerHeight * 0.2;
        window.scrollTo({ top: Math.max(0, top), behavior });
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

  const isDragging = dragIndex !== null;
  const highlightIndex = isDragging ? dragIndex : activeIndex;
  const highlightVisible = isDragging ? dragIndex !== null : isHovered;
  const highlightSection =
    highlightIndex != null ? sections[highlightIndex] : undefined;
  const highlightDepth = highlightSection?.depth ?? 0;

  useIsomorphicLayoutEffect(() => {
    if (!mounted || !highlightVisible || highlightIndex == null) {
      setOverlayPos(null);
      return;
    }

    const compute = () => {
      // Anchor to the notch container (not the inner tick button). In-rail
      // labels use `right: calc(100% + spacer)` relative to the notch, so
      // the notch's left edge is the shared right-alignment gutter for all
      // labels. Anchoring to the tick pushed the portaled label 12-18px east
      // of the hover labels and clipped long titles past the viewport. See
      // FB-156.
      const notch = trackRef.current?.querySelector<HTMLElement>(
        `[data-notch-index="${highlightIndex}"]`,
      );
      if (!notch) {
        setOverlayPos(null);
        return;
      }
      const r = notch.getBoundingClientRect();
      setOverlayPos({
        top: r.top + r.height / 2,
        left: r.left,
      });
    };

    compute();
    window.addEventListener("resize", compute);
    window.addEventListener("scroll", compute, true);
    return () => {
      window.removeEventListener("resize", compute);
      window.removeEventListener("scroll", compute, true);
    };
  }, [mounted, highlightVisible, highlightIndex]);

  if (sections.length < 2) return null;

  return (
    <>
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
            const isHighlight = i === highlightIndex;
            const depth = section.depth ?? 0;

            return (
              <div
                key={section.id}
                className={styles.notch}
                data-notch-index={i}
                data-active={isActive || undefined}
                data-depth={depth || undefined}
              >
                <AnimatePresence>
                  {showLabel && !isHighlight && (
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
                  data-depth={depth || undefined}
                  onClick={() => scrollTo(i)}
                  aria-label={`Jump to ${section.label}`}
                  aria-current={isActive ? "true" : undefined}
                />
              </div>
            );
          })}
        </div>
      </nav>

      {mounted &&
        highlightSection &&
        createPortal(
          // Two-element structure: the anchor div owns the CSS transform
          // (translate(-100%, -50%)) that places the label's right edge at
          // the notch's left gutter. The inner motion.span animates only
          // `x`/`opacity`, so framer-motion's inline transform does not
          // clobber the anchor's placement. See FB-156.
          <div
            className={styles.highlightLabelAnchor}
            style={
              overlayPos
                ? {
                    top: `${overlayPos.top}px`,
                    left: `${overlayPos.left}px`,
                  }
                : { top: 0, left: 0, visibility: "hidden" }
            }
            aria-hidden="true"
          >
            <motion.span
              className={styles.highlightLabel}
              data-depth={highlightDepth || undefined}
              initial={false}
              animate={{
                opacity: highlightVisible && overlayPos ? 1 : 0,
                x: highlightVisible && overlayPos ? 0 : 4,
              }}
              transition={{
                duration: isDragging ? 0 : DURATION.fast,
                ease: EASING.standard,
              }}
            >
              {highlightSection.label}
            </motion.span>
          </div>,
          document.body,
        )}
    </>
  );
}
