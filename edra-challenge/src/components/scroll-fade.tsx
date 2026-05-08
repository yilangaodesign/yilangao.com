"use client";

import { useEffect, useState, type ReactNode } from "react";

interface ScrollFadeProps {
  children: ReactNode;
  /** Scroll threshold (px) at which the element fully disappears */
  threshold?: number;
  className?: string;
}

/**
 * One-way scroll-driven exit: once scrollY crosses the threshold,
 * the element fades out, translates up, and collapses permanently.
 * Uses a latch pattern to avoid layout-feedback oscillation.
 */
export function ScrollFade({
  children,
  threshold = 60,
  className,
}: ScrollFadeProps) {
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    function onScroll() {
      if (window.scrollY > threshold) {
        setCollapsed(true);
        window.removeEventListener("scroll", onScroll);
      }
    }

    if (window.scrollY > threshold) {
      setCollapsed(true);
      return;
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [threshold]);

  return (
    <div
      className={className}
      style={{
        opacity: collapsed ? 0 : 1,
        transform: collapsed ? "translateY(-8px) scale(0.98)" : "none",
        height: collapsed ? 0 : "auto",
        marginTop: collapsed ? 0 : undefined,
        marginBottom: collapsed ? 0 : undefined,
        overflow: "hidden",
        transformOrigin: "top left",
        transition: "opacity 0.3s ease-out, transform 0.3s ease-out, height 0.3s ease-out, margin 0.3s ease-out",
        pointerEvents: collapsed ? "none" : "auto",
      }}
      aria-hidden={collapsed}
    >
      {children}
    </div>
  );
}
