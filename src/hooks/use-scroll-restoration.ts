"use client";

import { useEffect, useCallback, useRef } from "react";

const STORAGE_PREFIX = "scroll_y_";

/**
 * Saves scroll position on demand (e.g. when clicking an outbound link)
 * and restores it on mount if a saved position exists.
 * Designed for back-navigation: position is consumed once after restoring.
 */
export function useScrollRestoration(key: string) {
  const restoredRef = useRef(false);

  useEffect(() => {
    if (restoredRef.current) return;

    const storageKey = `${STORAGE_PREFIX}${key}`;
    const raw = sessionStorage.getItem(storageKey);
    if (!raw) return;

    const y = parseInt(raw, 10);
    sessionStorage.removeItem(storageKey);
    restoredRef.current = true;

    if (y <= 0) return;

    const restore = () => window.scrollTo(0, y);
    requestAnimationFrame(() => {
      restore();
      setTimeout(restore, 80);
    });
  }, [key]);

  const savePosition = useCallback(() => {
    sessionStorage.setItem(
      `${STORAGE_PREFIX}${key}`,
      String(Math.round(window.scrollY)),
    );
  }, [key]);

  return { savePosition };
}
