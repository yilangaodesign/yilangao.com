"use client";

import { motion, useReducedMotion } from "framer-motion";
import { TRANSITION_INDICATOR, getReducedTransition } from "@/lib/motion";

/**
 * Hover-driven arrow / icon reveal.
 * Shifts children along the x-axis and fades from resting to active opacity.
 * Typically used on list rows or card links as a "go to" affordance.
 */
export function ArrowReveal({
  active,
  children,
  className,
  xShift = 4,
  restingOpacity = 0.3,
}: {
  active: boolean;
  children: React.ReactNode;
  className?: string;
  /** Horizontal shift in px when active (default 4) */
  xShift?: number;
  /** Opacity when inactive (default 0.3) */
  restingOpacity?: number;
}) {
  const prefersReduced = useReducedMotion();
  const transition = prefersReduced
    ? getReducedTransition(TRANSITION_INDICATOR)
    : TRANSITION_INDICATOR;

  return (
    <motion.div
      className={className}
      animate={{
        x: active ? xShift : 0,
        opacity: active ? 1 : restingOpacity,
      }}
      transition={transition}
    >
      {children}
    </motion.div>
  );
}
