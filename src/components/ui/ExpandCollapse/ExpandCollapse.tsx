"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { TRANSITION_EXPAND, getReducedTransition } from "@/lib/motion";

/**
 * Animated expand / collapse disclosure.
 * Wraps content that toggles visibility with a height: "auto" animation.
 * Uses AnimatePresence so the exit animation plays before unmount.
 */
export function ExpandCollapse({
  open,
  children,
  className,
}: {
  open: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  const prefersReduced = useReducedMotion();
  const transition = prefersReduced
    ? getReducedTransition(TRANSITION_EXPAND)
    : TRANSITION_EXPAND;

  return (
    <AnimatePresence initial={false}>
      {open && (
        <motion.div
          className={className}
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={transition}
          style={{ overflow: "hidden" }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
