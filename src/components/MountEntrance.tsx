"use client";

import { motion, useReducedMotion } from "framer-motion";
import {
  TRANSITION_ENTER,
  ENTRANCE_Y,
  getReducedTransition,
} from "@/lib/motion";

/**
 * Page-load entrance animation (non-scroll-triggered).
 * Unlike FadeIn (which waits for scroll into view), MountEntrance
 * plays immediately on mount — use for hero sections, above-the-fold content.
 */
export function MountEntrance({
  children,
  className,
  delay = 0,
  y = ENTRANCE_Y,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  y?: number;
}) {
  const prefersReduced = useReducedMotion();
  const transition = prefersReduced
    ? getReducedTransition(TRANSITION_ENTER)
    : { ...TRANSITION_ENTER, delay };

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: prefersReduced ? 0 : y }}
      animate={{ opacity: 1, y: 0 }}
      transition={transition}
    >
      {children}
    </motion.div>
  );
}
