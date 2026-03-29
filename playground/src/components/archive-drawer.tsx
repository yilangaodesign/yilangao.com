"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, RotateCcw, User, Bot, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ArchiveItem } from "@/lib/archive-manifest";
import { PreviewRenderer } from "@/lib/archive-previews";
import { TypeBadge, ExperimentTag } from "./archive-tile";

function MetadataRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3 py-2 border-b border-border last:border-b-0">
      <span className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground w-24 shrink-0 pt-0.5">
        {label}
      </span>
      <div className="text-sm text-foreground min-w-0 flex-1">{children}</div>
    </div>
  );
}

export function ArchiveDrawer({
  item,
  onClose,
}: {
  item: ArchiveItem | null;
  onClose: () => void;
}) {
  const [restoreState, setRestoreState] = useState<"idle" | "confirm" | "restoring" | "done">("idle");

  const handleRestore = async () => {
    if (restoreState === "idle") {
      setRestoreState("confirm");
      return;
    }
    if (restoreState === "confirm") {
      setRestoreState("restoring");
      try {
        const res = await fetch("/api/archive/restore", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: item?.id }),
        });
        if (res.ok) {
          setRestoreState("done");
          setTimeout(() => {
            onClose();
            setRestoreState("idle");
          }, 1200);
        } else {
          setRestoreState("idle");
        }
      } catch {
        setRestoreState("idle");
      }
    }
  };

  const resetAndClose = () => {
    setRestoreState("idle");
    onClose();
  };

  return (
    <AnimatePresence>
      {item && (
        <>
          <motion.div
            className="fixed inset-0 z-40 bg-black/20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={resetAndClose}
          />
          <motion.aside
            className="fixed top-0 right-0 z-50 h-screen w-full max-w-[480px] bg-background border-l border-border overflow-y-auto"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
          >
            <div className="sticky top-0 z-10 flex items-center justify-between h-12 px-4 border-b border-border bg-background/80 backdrop-blur-sm">
              <h2 className="text-sm font-medium truncate">{item.name}</h2>
              <button
                onClick={resetAndClose}
                className="flex items-center justify-center w-7 h-7 rounded-sm hover:bg-muted transition-colors"
                aria-label="Close drawer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 space-y-5">
              {/* Preview */}
              <div className="rounded-sm border border-border overflow-hidden bg-muted/20">
                <div className="p-6 min-h-[160px] flex items-center justify-center">
                  <PreviewRenderer id={item.id} />
                </div>
              </div>

              {/* Tags row */}
              <div className="flex items-center gap-2 flex-wrap">
                <TypeBadge type={item.type} />
                <ExperimentTag experiment={item.experiment} />
                {item.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-[10px] font-mono text-muted-foreground border border-border px-1.5 py-0.5 rounded-sm"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* Description */}
              <div>
                <p className="text-sm leading-relaxed">{item.description}</p>
                {item.reason && (
                  <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                    <span className="font-medium">Why archived:</span> {item.reason}
                  </p>
                )}
              </div>

              {/* Metadata */}
              <div className="rounded-sm border border-border">
                <MetadataRow label="Origin">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[10px] font-mono uppercase tracking-wider bg-muted px-1.5 py-0.5 rounded-sm">
                      {item.origin.type}
                    </span>
                    {item.origin.library && (
                      <span className="text-xs">{item.origin.library}</span>
                    )}
                    {item.origin.url && (
                      <a
                        href={item.origin.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </MetadataRow>
                <MetadataRow label="Source">
                  <code className="text-xs font-mono bg-muted px-1.5 py-0.5 rounded-sm break-all">
                    {item.sourcePath}
                  </code>
                </MetadataRow>
                {item.archivePath && (
                  <MetadataRow label="Archive">
                    <code className="text-xs font-mono bg-muted px-1.5 py-0.5 rounded-sm break-all">
                      {item.archivePath}
                    </code>
                  </MetadataRow>
                )}
                <MetadataRow label="Created">
                  <div className="flex items-center gap-3">
                    <span>
                      {new Date(item.createdAt).toLocaleDateString("en-US", {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      {item.createdBy === "user" ? (
                        <User className="w-3 h-3" />
                      ) : (
                        <Bot className="w-3 h-3" />
                      )}
                      <span className="text-xs capitalize">{item.createdBy}</span>
                    </div>
                  </div>
                </MetadataRow>
                {item.archivedAt && (
                  <MetadataRow label="Archived">
                    <div className="flex items-center gap-3">
                      <span>
                        {new Date(item.archivedAt).toLocaleDateString("en-US", {
                          month: "long",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                      {item.archivedBy && (
                        <div className="flex items-center gap-1 text-muted-foreground">
                          {item.archivedBy === "user" ? (
                            <User className="w-3 h-3" />
                          ) : (
                            <Bot className="w-3 h-3" />
                          )}
                          <span className="text-xs capitalize">{item.archivedBy}</span>
                        </div>
                      )}
                    </div>
                  </MetadataRow>
                )}
              </div>

              {/* Actions */}
              <div className="pt-2">
                <button
                  onClick={handleRestore}
                  disabled={restoreState === "restoring" || restoreState === "done"}
                  className={cn(
                    "flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-sm text-sm font-medium transition-colors",
                    restoreState === "done"
                      ? "bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-300"
                      : restoreState === "confirm"
                        ? "bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 hover:bg-amber-200 dark:hover:bg-amber-900"
                        : "bg-foreground text-background hover:bg-foreground/90",
                    (restoreState === "restoring" || restoreState === "done") && "opacity-60 cursor-not-allowed"
                  )}
                >
                  <RotateCcw className={cn("w-3.5 h-3.5", restoreState === "restoring" && "animate-spin")} />
                  {restoreState === "idle" && "Restore to source"}
                  {restoreState === "confirm" && "Click again to confirm"}
                  {restoreState === "restoring" && "Restoring..."}
                  {restoreState === "done" && "Restored"}
                </button>
              </div>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
