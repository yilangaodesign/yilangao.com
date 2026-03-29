"use client";

import { useRef } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import {
  STAGGER_INTERVAL,
  TRANSITION_STAGGER_ITEM,
  ENTRANCE_Y,
  getReducedTransition,
} from "@/lib/motion";

export function StaggerChildren({
  children,
  className,
  stagger = STAGGER_INTERVAL,
}: {
  children: React.ReactNode;
  className?: string;
  stagger?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.05 });
  const prefersReduced = useReducedMotion();
  return (
    <motion.div
      ref={ref}
      className={className}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={{
        hidden: {},
        visible: {
          transition: { staggerChildren: prefersReduced ? 0 : stagger },
        },
      }}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const prefersReduced = useReducedMotion();
  const transition = prefersReduced
    ? getReducedTransition(TRANSITION_STAGGER_ITEM)
    : TRANSITION_STAGGER_ITEM;

  return (
    <motion.div
      className={className}
      variants={{
        hidden: { opacity: 0, y: prefersReduced ? 0 : ENTRANCE_Y },
        visible: { opacity: 1, y: 0, transition },
      }}
    >
      {children}
    </motion.div>
  );
}
