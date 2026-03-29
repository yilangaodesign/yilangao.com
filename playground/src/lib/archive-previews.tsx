"use client";

import { useState } from "react";
import type { ComponentType } from "react";

function NavigationPreview() {
  const links = ["Work", "Blog", "About", "Contact"];
  return (
    <div className="w-full border border-border rounded-sm overflow-hidden bg-white">
      <nav className="flex justify-between items-center px-5 py-4 w-full">
        <span className="font-semibold text-lg text-[#161616]">Yilan Gao</span>
        <div className="flex items-center gap-5">
          {links.map((label) => (
            <span key={label} className="text-sm text-[#525252] cursor-pointer hover:text-[#161616] transition-colors">{label}</span>
          ))}
          <button className="text-sm border border-[#e0e0e0] rounded-sm px-3 py-1 text-[#161616] bg-transparent cursor-pointer hover:bg-[#f4f4f4] transition-colors">
            Dark
          </button>
        </div>
      </nav>
    </div>
  );
}

function ThemeTogglePreview() {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  return (
    <div className="flex flex-col items-center gap-3">
      <button
        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        className="text-sm border rounded-sm px-3 py-1.5 cursor-pointer transition-colors"
        style={{
          borderColor: theme === "dark" ? "#393939" : "#e0e0e0",
          color: theme === "dark" ? "#f4f4f4" : "#161616",
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

function FooterPreview() {
  return (
    <div className="w-full border border-border rounded-sm overflow-hidden bg-white">
      <footer className="px-5 py-8 w-full border-t border-[#e0e0e0] text-[#525252] text-sm">
        <p>&copy; {new Date().getFullYear()} Yilan Gao</p>
      </footer>
    </div>
  );
}

const previewRegistry: Record<string, ComponentType> = {
  "exp02-navigation": NavigationPreview,
  "exp02-theme-toggle": ThemeTogglePreview,
  "exp02-footer": FooterPreview,
};

export function getPreviewComponent(id: string): ComponentType | null {
  return previewRegistry[id] ?? null;
}

export function PreviewRenderer({ id }: { id: string }) {
  const Component = getPreviewComponent(id);
  if (!Component) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground text-xs">
        No preview available
      </div>
    );
  }
  return <Component />;
}
