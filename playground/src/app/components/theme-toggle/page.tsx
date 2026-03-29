"use client";

import { useState } from "react";
import { Shell } from "@/components/shell";
import { SectionHeading } from "@/components/token-grid";
import { ComponentPreview, PropsTable } from "@/components/component-preview";

function ThemeToggleDemo() {
  const [theme, setTheme] = useState<"light" | "dark">("light");

  return (
    <div className="flex flex-col items-center gap-4">
      <button
        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        style={{
          background: "none",
          border: `1px solid ${theme === "dark" ? "#393939" : "#e0e0e0"}`,
          borderRadius: "6px",
          padding: "0.4rem 0.75rem",
          cursor: "pointer",
          color: theme === "dark" ? "#f4f4f4" : "#161616",
          fontSize: "0.875rem",
          backgroundColor: theme === "dark" ? "#262626" : "transparent",
        }}
      >
        {theme === "dark" ? "Light" : "Dark"}
      </button>
      <span className="text-xs text-muted-foreground">
        Current: <code className="font-mono">{theme}</code>
      </span>
    </div>
  );
}

const code = `"use client";

import { useTheme } from "@/components/theme-provider";
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
}`;

export default function ThemeTogglePage() {
  return (
    <Shell title="ThemeToggle">
      <div className="max-w-5xl space-y-10">
        <SectionHeading
          title="ThemeToggle"
          description="A button that toggles between light and dark themes using the custom ThemeProvider. Handles hydration with a mounted guard."
        />

        <ComponentPreview
          title="Interactive Demo"
          description="Click to toggle. In the actual app, this changes the site-wide theme."
          code={code}
        >
          <ThemeToggleDemo />
        </ComponentPreview>

        <div>
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-3">
            Props
          </h3>
          <PropsTable
            props={[
              { name: "(none)", type: "—", description: "Self-contained — reads/writes theme via the ThemeProvider useTheme() hook." },
            ]}
          />
        </div>

        <div>
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-3">
            Dependencies
          </h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex gap-2">
              <span className="text-accent shrink-0">•</span>
              <code className="text-xs bg-muted px-1.5 py-0.5 rounded-sm font-mono">ThemeProvider</code> — must wrap the app. Applies <code className="text-xs bg-muted px-1.5 py-0.5 rounded-sm font-mono">class=&quot;dark&quot;</code> to <code className="text-xs bg-muted px-1.5 py-0.5 rounded-sm font-mono">&lt;html&gt;</code>.
            </li>
            <li className="flex gap-2">
              <span className="text-accent shrink-0">•</span>
              Hydration guard: renders <code className="text-xs bg-muted px-1.5 py-0.5 rounded-sm font-mono">null</code> until mounted to avoid mismatches.
            </li>
          </ul>
        </div>

        <div className="text-xs font-mono text-muted-foreground p-3 rounded-sm bg-muted/50">
          src/components/ThemeToggle.tsx
        </div>
      </div>
    </Shell>
  );
}
