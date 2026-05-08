/**
 * Shared motion constants for Framer Motion.
 * These mirror the SCSS tokens in src/styles/tokens/_motion.scss.
 * Always import from here — never hardcode easing or duration values in components.
 */

import type { Transition } from "framer-motion";

// ── Durations (seconds) ──────────────────────────────────────────────────────
// Maps 1:1 to $portfolio-duration-* SCSS tokens (converted from ms → s)

export const DURATION = {
  fast: 0.11,
  moderate: 0.24,
  slow: 0.4,
  slower: 0.6,
} as const;

// ── Easing curves ────────────────────────────────────────────────────────────
// Maps 1:1 to $portfolio-easing-* SCSS tokens

export const EASING = {
  standard: [0.2, 0, 0.38, 0.9] as const,
  entrance: [0, 0, 0.38, 0.9] as const,
  exit: [0.2, 0, 1, 0.9] as const,
  expressive: [0.4, 0.14, 0.3, 1] as const,
} as const;

// ── Choreography presets ─────────────────────────────────────────────────────
// Named transition presets for common animation patterns.
// These combine token durations + easings into ready-to-spread objects.

/** Scroll-triggered entrance (FadeIn, whileInView blocks) */
export const TRANSITION_ENTER: Transition = {
  duration: DURATION.slower,
  ease: EASING.entrance,
};

/** Individual item in a stagger sequence */
export const TRANSITION_STAGGER_ITEM: Transition = {
  duration: DURATION.slow,
  ease: EASING.entrance,
};

/** Expand / collapse (disclosure, accordion) */
export const TRANSITION_EXPAND: Transition = {
  duration: DURATION.slow,
  ease: EASING.standard,
};

/** Hover indicator shifts (arrows, icons) */
export const TRANSITION_INDICATOR: Transition = {
  duration: DURATION.moderate,
  ease: EASING.standard,
};

/** Hover scale on thumbnails / images */
export const TRANSITION_HOVER_SCALE: Transition = {
  duration: DURATION.slow,
  ease: EASING.standard,
};

/** Default stagger interval between children (seconds) */
export const STAGGER_INTERVAL = 0.08;

/** Default vertical offset for entrance animations (px) */
export const ENTRANCE_Y = 20;

// ── Reduced motion ───────────────────────────────────────────────────────────

/**
 * Media query string for prefers-reduced-motion.
 * Use with Framer Motion's `useReducedMotion()` hook or pass to
 * `window.matchMedia()` for imperative checks.
 */
export const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

/** Returns a zero-duration transition for reduced-motion contexts */
export function getReducedTransition(base: Transition): Transition {
  return { ...base, duration: 0 };
}
