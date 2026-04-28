"use client";

import { useRef, useLayoutEffect, useState, useCallback } from "react";
import styles from "./canvas-toolbar.module.scss";
import { Tooltip } from "../Tooltip/Tooltip";

export interface CanvasToolbarItem {
  id: string;
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  separator?: boolean;
}

export interface CanvasToolbarProps {
  items: CanvasToolbarItem[];
  onItemClick: (id: string) => void;
  /** When true, the active indicator shows a subtle breathing pulse. */
  autoTour?: boolean;
  className?: string;
}

export default function CanvasToolbar({
  items,
  onItemClick,
  autoTour,
  className,
}: CanvasToolbarProps) {
  const toolbarRef = useRef<HTMLDivElement>(null);
  const buttonRefs = useRef<Map<string, HTMLButtonElement>>(new Map());
  const [indicator, setIndicator] = useState<{ top: number; height: number } | null>(null);
  const [hasAnimated, setHasAnimated] = useState(false);

  const setButtonRef = useCallback((id: string, el: HTMLButtonElement | null) => {
    if (el) buttonRefs.current.set(id, el);
    else buttonRefs.current.delete(id);
  }, []);

  useLayoutEffect(() => {
    const activeItem = items.find((i) => i.active);
    if (!activeItem || !toolbarRef.current) {
      setIndicator(null);
      return;
    }
    const btn = buttonRefs.current.get(activeItem.id);
    if (!btn) { setIndicator(null); return; }
    const toolbarRect = toolbarRef.current.getBoundingClientRect();
    const btnRect = btn.getBoundingClientRect();
    setIndicator({
      top: btnRect.top - toolbarRect.top,
      height: btnRect.height,
    });
    if (!hasAnimated) {
      requestAnimationFrame(() => setHasAnimated(true));
    }
  }, [items, hasAnimated]);

  return (
    <div ref={toolbarRef} className={[styles.toolbar, className].filter(Boolean).join(" ")}>
      {indicator && (
        <div
          className={[
            styles.activeIndicator,
            autoTour ? styles.activeIndicatorBreathing : undefined,
          ].filter(Boolean).join(" ")}
          style={{
            transform: `translateY(${indicator.top}px)`,
            height: indicator.height,
            transition: hasAnimated ? undefined : "none",
          }}
          aria-hidden
        />
      )}
      {items.map((item) => (
        <div key={item.id} className={styles.itemWrap}>
          {item.separator && <hr className={styles.separator} />}
          <Tooltip content={item.label} side="left" size="sm" appearance="inverse">
            <button
              ref={(el) => setButtonRef(item.id, el)}
              type="button"
              className={[
                styles.button,
                item.active ? styles.buttonActive : undefined,
              ]
                .filter(Boolean)
                .join(" ")}
              onClick={() => onItemClick(item.id)}
              aria-label={item.label}
              aria-pressed={item.active ?? undefined}
            >
              {item.icon}
            </button>
          </Tooltip>
        </div>
      ))}
    </div>
  );
}

CanvasToolbar.displayName = "CanvasToolbar";
