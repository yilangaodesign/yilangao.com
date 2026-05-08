"use client";

import { useEffect, useRef, useState } from "react";

export function HeroSpacer() {
  const [collapsed, setCollapsed] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleScroll() {
      if (window.scrollY > 0) {
        setCollapsed(true);
        window.removeEventListener("scroll", handleScroll);
      }
    }
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div
      ref={ref}
      className="shrink-0 transition-[height] duration-300 ease-out"
      style={{ height: collapsed ? 0 : "calc(50vh - 120px)" }}
    />
  );
}
