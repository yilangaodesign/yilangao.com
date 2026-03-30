"use client";
import { useState, useCallback, useRef, useEffect } from 'react';
import type { AsciiSettings } from './use-ascii-renderer';

export interface MediaLayer {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface HistorySnapshot {
  settings: AsciiSettings;
  layer: MediaLayer;
}

const MAX_HISTORY = 100;
const DEBOUNCE_MS = 300;

export interface HistoryHook {
  push: (snapshot: HistorySnapshot) => void;
  undo: () => HistorySnapshot | null;
  redo: () => HistorySnapshot | null;
  canUndo: boolean;
  canRedo: boolean;
  reset: (snapshot: HistorySnapshot) => void;
}

export function useHistory(initial: HistorySnapshot): HistoryHook {
  const [, setTick] = useState(0);
  const stackRef = useRef<HistorySnapshot[]>([initial]);
  const pointerRef = useRef(0);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingRef = useRef<HistorySnapshot | null>(null);

  const rerender = useCallback(() => setTick((n) => n + 1), []);

  const flushPending = useCallback(() => {
    const pending = pendingRef.current;
    if (!pending) return;
    pendingRef.current = null;

    const truncated = stackRef.current.slice(0, pointerRef.current + 1);
    const newStack = [...truncated, pending];
    if (newStack.length > MAX_HISTORY) newStack.shift();
    stackRef.current = newStack;
    pointerRef.current = Math.min(pointerRef.current + 1, MAX_HISTORY - 1);
    rerender();
  }, [rerender]);

  const push = useCallback(
    (snapshot: HistorySnapshot) => {
      pendingRef.current = snapshot;
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
      debounceTimer.current = setTimeout(flushPending, DEBOUNCE_MS);
    },
    [flushPending],
  );

  useEffect(() => {
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, []);

  const undo = useCallback((): HistorySnapshot | null => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
      debounceTimer.current = null;
    }
    if (pendingRef.current) {
      const pending = pendingRef.current;
      pendingRef.current = null;
      const truncated = stackRef.current.slice(0, pointerRef.current + 1);
      stackRef.current = [...truncated, pending];
      rerender();
      return stackRef.current[pointerRef.current] ?? null;
    }
    if (pointerRef.current <= 0) return null;
    pointerRef.current -= 1;
    rerender();
    return stackRef.current[pointerRef.current] ?? null;
  }, [rerender]);

  const redo = useCallback((): HistorySnapshot | null => {
    if (pointerRef.current >= stackRef.current.length - 1) return null;
    pointerRef.current += 1;
    rerender();
    return stackRef.current[pointerRef.current] ?? null;
  }, [rerender]);

  const reset = useCallback((snapshot: HistorySnapshot) => {
    pendingRef.current = null;
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
      debounceTimer.current = null;
    }
    stackRef.current = [snapshot];
    pointerRef.current = 0;
    rerender();
  }, [rerender]);

  return {
    push,
    undo,
    redo,
    canUndo: pointerRef.current > 0 || pendingRef.current !== null,
    canRedo: pointerRef.current < stackRef.current.length - 1,
    reset,
  };
}
