/**
 * Bridge file — re-exports motion constants from the main site's canonical source.
 *
 * Components imported from `src/components/` (via @site/*) reference `@/lib/motion`.
 * Since `@/` resolves to `playground/src/` in the playground context, this file
 * provides the constants those components expect. Values are duplicated (not
 * re-exported) because the main site's `@/lib/motion` can't be reached via `@/`
 * from the playground.
 *
 * Source of truth: src/lib/motion.ts — keep in sync.
 */

import type { Transition } from "framer-motion";

export const DURATION = {
  fast: 0.11,
  moderate: 0.24,
  slow: 0.4,
  slower: 0.6,
} as const;

export const EASING = {
  standard: [0.2, 0, 0.38, 0.9] as const,
  entrance: [0, 0, 0.38, 0.9] as const,
  exit: [0.2, 0, 1, 0.9] as const,
  expressive: [0.4, 0.14, 0.3, 1] as const,
} as const;

export const TRANSITION_ENTER: Transition = {
  duration: DURATION.slower,
  ease: EASING.entrance,
};

export const TRANSITION_STAGGER_ITEM: Transition = {
  duration: DURATION.slow,
  ease: EASING.entrance,
};

export const TRANSITION_EXPAND: Transition = {
  duration: DURATION.slow,
  ease: EASING.standard,
};

export const TRANSITION_INDICATOR: Transition = {
  duration: DURATION.moderate,
  ease: EASING.standard,
};

export const TRANSITION_HOVER_SCALE: Transition = {
  duration: DURATION.slow,
  ease: EASING.standard,
};

export const STAGGER_INTERVAL = 0.08;
export const ENTRANCE_Y = 20;

export const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

export function getReducedTransition(base: Transition): Transition {
  return { ...base, duration: 0 };
}
