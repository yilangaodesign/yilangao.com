"use client";

import {
  useCallback,
  useEffect,
  useRef,
  type KeyboardEvent as ReactKeyboardEvent,
  type FocusEvent as ReactFocusEvent,
} from "react";

const CELL_SELECTOR =
  '[role="gridcell"],[role="columnheader"],[role="rowheader"]';

const FOCUSABLE_SELECTOR =
  'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';

type Coord = { r: number; c: number };

/**
 * Implements the WAI-ARIA grid keyboard pattern for the div-based DataGrid
 * (ADR-002): roving tabindex, arrow / Home / End / PageUp / PageDown cell
 * navigation, and dual-mode focus.
 *
 * - Navigation mode (default): arrow keys move the focused cell. Only the
 *   active cell carries `tabindex=0`; all others are `-1`, so a single Tab
 *   moves into / out of the whole grid.
 * - Actionable mode: Enter or F2 on a cell with an interactive widget moves
 *   focus into that widget; Escape returns to navigation mode on the cell.
 *
 * The hook is DOM-driven (it reads `role` attributes) so it stays correct as
 * TanStack re-renders rows on sort / filter / page changes.
 */
export function useGridKeyboard(pageJump = 10) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const activeRef = useRef<Coord>({ r: 0, c: 0 });
  const modeRef = useRef<"nav" | "act">("nav");

  const getRows = useCallback((): HTMLElement[] => {
    const root = rootRef.current;
    if (!root) return [];
    return Array.from(root.querySelectorAll<HTMLElement>('[role="row"]'));
  }, []);

  const getCells = useCallback((row: HTMLElement | undefined): HTMLElement[] => {
    if (!row) return [];
    return Array.from(row.querySelectorAll<HTMLElement>(CELL_SELECTOR));
  }, []);

  const cellAt = useCallback(
    (r: number, c: number): HTMLElement | undefined => {
      const rows = getRows();
      const row = rows[r];
      const cells = getCells(row);
      return cells[c];
    },
    [getRows, getCells],
  );

  /** Reassert roving tabindex after every render without stealing focus. */
  const syncTabIndex = useCallback(() => {
    const rows = getRows();
    if (rows.length === 0) return;
    const { r, c } = activeRef.current;
    const clampedR = Math.min(r, rows.length - 1);
    rows.forEach((row, ri) => {
      const cells = getCells(row);
      cells.forEach((cell, ci) => {
        cell.tabIndex = ri === clampedR && ci === c ? 0 : -1;
      });
    });
    activeRef.current = { r: clampedR, c };
  }, [getRows, getCells]);

  useEffect(() => {
    syncTabIndex();
  });

  const moveTo = useCallback(
    (r: number, c: number) => {
      const rows = getRows();
      if (rows.length === 0) return;
      const nextR = Math.max(0, Math.min(r, rows.length - 1));
      const cells = getCells(rows[nextR]);
      if (cells.length === 0) return;
      const nextC = Math.max(0, Math.min(c, cells.length - 1));

      activeRef.current = { r: nextR, c: nextC };
      syncTabIndex();
      cells[nextC]?.focus();
    },
    [getRows, getCells, syncTabIndex],
  );

  const enterActionable = useCallback(() => {
    const { r, c } = activeRef.current;
    const cell = cellAt(r, c);
    if (!cell) return false;
    const focusable = cell.querySelector<HTMLElement>(FOCUSABLE_SELECTOR);
    if (!focusable) return false;
    modeRef.current = "act";
    focusable.focus();
    return true;
  }, [cellAt]);

  const exitActionable = useCallback(() => {
    const { r, c } = activeRef.current;
    modeRef.current = "nav";
    cellAt(r, c)?.focus();
  }, [cellAt]);

  const onKeyDown = useCallback(
    (event: ReactKeyboardEvent<HTMLDivElement>) => {
      if (modeRef.current === "act") {
        if (event.key === "Escape") {
          event.preventDefault();
          exitActionable();
        }
        return;
      }

      const { r, c } = activeRef.current;
      const rows = getRows();
      const lastRow = rows.length - 1;
      const lastCol = getCells(rows[r]).length - 1;

      switch (event.key) {
        case "ArrowRight":
          event.preventDefault();
          moveTo(r, c + 1);
          break;
        case "ArrowLeft":
          event.preventDefault();
          moveTo(r, c - 1);
          break;
        case "ArrowDown":
          event.preventDefault();
          moveTo(r + 1, c);
          break;
        case "ArrowUp":
          event.preventDefault();
          moveTo(r - 1, c);
          break;
        case "Home":
          event.preventDefault();
          moveTo(event.ctrlKey ? 0 : r, 0);
          break;
        case "End":
          event.preventDefault();
          moveTo(event.ctrlKey ? lastRow : r, lastCol);
          break;
        case "PageDown":
          event.preventDefault();
          moveTo(r + pageJump, c);
          break;
        case "PageUp":
          event.preventDefault();
          moveTo(r - pageJump, c);
          break;
        case "Enter":
        case "F2":
          if (enterActionable()) event.preventDefault();
          break;
        default:
          break;
      }
    },
    [getRows, getCells, moveTo, enterActionable, exitActionable, pageJump],
  );

  /** Sync the active coordinate when the user clicks or tabs onto a cell. */
  const onFocusCapture = useCallback(
    (event: ReactFocusEvent<HTMLDivElement>) => {
      const target = event.target as HTMLElement;
      const cell = target.closest<HTMLElement>(CELL_SELECTOR);
      if (!cell || cell !== target) return;
      const row = cell.closest<HTMLElement>('[role="row"]');
      if (!row) return;
      const rows = getRows();
      const r = rows.indexOf(row);
      const c = getCells(row).indexOf(cell);
      if (r >= 0 && c >= 0) {
        activeRef.current = { r, c };
        modeRef.current = "nav";
      }
    },
    [getRows, getCells],
  );

  return { rootRef, onKeyDown, onFocusCapture };
}
