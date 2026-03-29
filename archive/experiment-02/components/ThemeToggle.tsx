/**
 * @archived
 * @origin experiment-02 — src/components/ThemeToggle.tsx
 * @reason Shelved since the wireframe uses a fixed light theme.
 *
 * Light/dark mode toggle button using next-themes.
 * Renders null until mounted to avoid hydration mismatch.
 */

"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      aria-label="Toggle theme"
      style={{
        background: "none",
        border: "1px solid var(--color-border)",
        borderRadius: "6px",
        padding: "0.4rem 0.75rem",
        cursor: "pointer",
        color: "var(--color-text)",
        fontSize: "0.875rem",
      }}
    >
      {theme === "dark" ? "Light" : "Dark"}
    </button>
  );
}
