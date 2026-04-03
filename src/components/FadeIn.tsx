"use client";

import { useRef } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import {
  TRANSITION_ENTER,
  ENTRANCE_Y,
  getReducedTransition,
} from "@/lib/motion";

export function FadeIn({
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
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.1 });
  const prefersReduced = useReducedMotion();

  const transition = prefersReduced
    ? getReducedTransition(TRANSITION_ENTER)
    : { ...TRANSITION_ENTER, delay };

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, y: prefersReduced ? 0 : y }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={transition}
    >
      {children}
    </motion.div>
  );
}
