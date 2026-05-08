"use client";

import { useState, useEffect } from "react";
import { Button } from "@ds/Button";
import { ALL_ENTITY_TYPES, ENTITY_ICONS } from "@/lib/entity-registry";
import styles from "./quick-action-zone.module.css";

/* ─── Types ────────────────────────────────────────────────────── */

type ZoneState = "idle" | "focused" | "collapsed";

interface QuickActionZoneProps {
  searchFocused: boolean;
  searchActive?: boolean;
  className?: string;
  onQuickAction?: (query: string) => void;
  onChipInsert?: (label: string) => void;
}

/* ─── Quick action definitions ─────────────────────────────────── */

const QUICK_ACTIONS = [
  "Prep me for today's meetings",
  "Show me docs by project",
  "What changed this week?",
];

/* ─── Main component ───────────────────────────────────────────── */

export function QuickActionZone({
  searchFocused,
  searchActive,
  className,
  onQuickAction,
  onChipInsert,
}: QuickActionZoneProps) {
  const [scrollCollapsed, setScrollCollapsed] = useState(false);

  useEffect(() => {
    function onScroll() {
      if (window.scrollY > 10) {
        setScrollCollapsed(true);
        window.removeEventListener("scroll", onScroll);
      }
    }
    if (window.scrollY > 10) {
      setScrollCollapsed(true);
      return;
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const isSearchEngaged = searchFocused || searchActive;

  const state: ZoneState = isSearchEngaged
    ? "focused"
    : scrollCollapsed ? "collapsed" : "idle";

  const isCollapsed = state === "collapsed";
  const isFocused = state === "focused";
  const isIdle = state === "idle";

  return (
    <div
      className={`${styles.zone} ${isCollapsed ? styles.zoneHidden : ""} ${className ?? ""}`}
      aria-hidden={isCollapsed}
    >
      {isIdle && (
        <div className="flex flex-wrap gap-2">
          {QUICK_ACTIONS.map((action) => (
            <Button
              key={action}
              size="sm"
              emphasis="subtle"
              onClick={() => onQuickAction?.(action)}
            >
              {action}
            </Button>
          ))}
        </div>
      )}

      {isFocused && (
        <div className={styles.chipGrid}>
          {ALL_ENTITY_TYPES.map(({ type, label, icon }) => {
            const Icon = ENTITY_ICONS[icon];
            return (
              <button
                key={type}
                type="button"
                className={styles.chip}
                onClick={() => onChipInsert?.(label)}
                onMouseDown={(e) => e.preventDefault()}
              >
                {Icon && (
                  <span className={styles.chipIcon}>
                    <Icon size={14} />
                  </span>
                )}
                {label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
