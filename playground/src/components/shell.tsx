"use client";

import { Sidebar, MobileMenuButton } from "./sidebar";
import { ThemeToggle } from "./theme-toggle";

export function Shell({ children, title }: { children: React.ReactNode; title?: string }) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 min-w-0">
        <header className="sticky top-0 z-10 flex items-center justify-between h-12 px-4 lg:px-5 border-b bg-background/80 backdrop-blur-sm border-border gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <MobileMenuButton />
            {title && <h1 className="text-sm font-medium truncate">{title}</h1>}
          </div>
          <ThemeToggle />
        </header>
        <main className="px-4 py-4 lg:px-5 lg:py-5">{children}</main>
      </div>
    </div>
  );
}
