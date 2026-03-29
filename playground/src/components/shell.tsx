"use client";

import { useState, useEffect } from "react";
import { Sidebar, MobileMenuButton } from "./sidebar";
import { ThemeToggle } from "./theme-toggle";
import { elan } from "@/lib/elan";

function DesignSystemFootnote() {
  const [isLocal, setIsLocal] = useState(false);

  useEffect(() => {
    const host = window.location.hostname;
    setIsLocal(host === "localhost" || host === "127.0.0.1");
  }, []);

  const releaseDate = elan.release.releasedAt.split("T")[0];

  return (
    <footer className="h-11 flex items-center border-t border-border px-4 lg:px-5 text-[11px] text-muted-foreground/60 font-mono">
      <span>
        {elan.name} {isLocal ? elan.version : elan.release.version}
        {isLocal && elan.version !== elan.release.version && (
          <> · v{elan.release.version} released</>
        )}
        {" · "}Last updated {releaseDate}
      </span>
    </footer>
  );
}

export function Shell({ children, title }: { children: React.ReactNode; title?: string }) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 min-w-0 flex flex-col">
        <header className="sticky top-0 z-10 flex items-center justify-between h-12 px-4 lg:px-5 border-b bg-background/80 backdrop-blur-sm border-border gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <MobileMenuButton />
            {title && <h1 className="text-sm font-medium truncate">{title}</h1>}
          </div>
          <ThemeToggle />
        </header>
        <main className="flex-1 px-4 py-4 lg:px-5 lg:py-5">{children}</main>
        <DesignSystemFootnote />
      </div>
    </div>
  );
}
