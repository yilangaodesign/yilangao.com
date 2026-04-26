"use client";

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
  className?: string;
}

export default function CanvasToolbar({
  items,
  onItemClick,
  className,
}: CanvasToolbarProps) {
  return (
    <div className={[styles.toolbar, className].filter(Boolean).join(" ")}>
      {items.map((item) => (
        <div key={item.id} className={styles.itemWrap}>
          {item.separator && <hr className={styles.separator} />}
          <Tooltip content={item.label} side="left" size="sm" appearance="inverse">
            <button
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
