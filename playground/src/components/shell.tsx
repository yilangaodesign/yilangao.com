"use client";

import { Sidebar, MobileMenuButton } from "./sidebar";
import { ThemeToggle } from "./theme-toggle";
import { elan } from "@/lib/elan";
import { useDevInfo } from "@/hooks/use-dev-info";

const BUMP_COLORS: Record<string, string> = {
  patch: "text-muted-foreground/80",
  minor: "text-amber-600/80 dark:text-amber-400/80",
  major: "text-red-600/80 dark:text-red-400/80",
};

function DesignSystemFootnote() {
  const { data: devInfo, isLocal } = useDevInfo();

  const version = isLocal
    ? devInfo?.currentVersion ?? elan.version
    : elan.release.version;

  const displayDate = isLocal
    ? devInfo?.lastModifiedDate ?? elan.release.releasedAt.split("T")[0]
    : elan.release.releasedAt.split("T")[0];

  const analysis = devInfo?.analysis;
  const showBumpHint =
    isLocal && analysis && analysis.totalFilesChanged > 0;

  return (
    <footer className="h-11 flex items-center border-t border-border px-3.5 text-xs text-muted-foreground/60 font-mono gap-2">
      <span className="truncate">
        {elan.name} {version}
        {isLocal &&
          (elan.version as string) !== (elan.release.version as string) && (
            <> · v{elan.release.version} released</>
          )}
        {" · "}Last updated {displayDate}
      </span>
      {showBumpHint && (
        <span
          className={`shrink-0 ${BUMP_COLORS[analysis.level] ?? ""}`}
          title={analysis.reason}
        >
          {analysis.totalFilesChanged} change
          {analysis.totalFilesChanged !== 1 && "s"} · suggests{" "}
          {analysis.level}
        </span>
      )}
    </footer>
  );
}

export function Shell({ children, title }: { children: React.ReactNode; title?: string }) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 min-w-0 flex flex-col">
        <header className="sticky top-0 z-10 flex items-center justify-between h-12 px-3.5 border-b bg-background/80 backdrop-blur-sm border-border gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <MobileMenuButton />
            {title && <h1 className="text-sm font-medium truncate">{title}</h1>}
          </div>
          <ThemeToggle />
        </header>
        <main className="flex-1 px-3.5 py-4 lg:py-5">{children}</main>
        <DesignSystemFootnote />
      </div>
    </div>
  );
}
