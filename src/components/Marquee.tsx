"use client";

import { useRef, useEffect, useState } from "react";
import styles from "./Marquee.module.scss";

/**
 * Infinite horizontal marquee with pause-on-hover and edge fade masks.
 * Pure CSS animation — no Framer Motion dependency.
 *
 * Children are tripled internally to create the seamless loop.
 * Speed is controlled via the `duration` prop (seconds for one full cycle).
 */
export function Marquee({
  children,
  className,
  duration = 25,
  pauseOnHover = true,
}: {
  children: React.ReactNode;
  className?: string;
  /** Duration in seconds for one full loop (default 25) */
  duration?: number;
  pauseOnHover?: boolean;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  return (
    <div className={`${styles.viewport} ${className ?? ""}`}>
      <div
        ref={trackRef}
        className={styles.track}
        data-pause={pauseOnHover ? "" : undefined}
        style={{
          animationDuration: `${duration}s`,
          animationPlayState: reducedMotion ? "paused" : undefined,
        }}
      >
        {children}
        {children}
        {children}
      </div>
    </div>
  );
}
