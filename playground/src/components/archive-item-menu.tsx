"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { MoreVertical, RotateCcw, Trash2, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface ArchiveItemMenuProps {
  itemId: string;
  itemName: string;
  onRecover: () => void;
  onDeleted: () => void;
  className?: string;
}

export function ArchiveItemMenu({
  itemId,
  itemName,
  onRecover,
  onDeleted,
  className,
}: ArchiveItemMenuProps) {
  const [open, setOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const close = useCallback(() => {
    setOpen(false);
  }, []);

  useEffect(() => {
    if (!open) return;
    function handleClickOutside(e: MouseEvent) {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target as Node)
      ) {
        close();
      }
    }
    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape") close();
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open, close]);

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setOpen((prev) => !prev);
  };

  const handleRecover = (e: React.MouseEvent) => {
    e.stopPropagation();
    close();
    onRecover();
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    close();
    setConfirmDelete(true);
  };

  const handleConfirmDelete = async () => {
    setDeleting(true);
    try {
      const res = await fetch("/api/archive/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: itemId }),
      });
      if (res.ok) {
        setConfirmDelete(false);
        onDeleted();
      }
    } catch {
      // Silently fail — user can retry
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <div className={cn("relative", className)}>
        <button
          ref={buttonRef}
          onClick={handleToggle}
          className={cn(
            "flex items-center justify-center w-7 h-7 rounded-sm transition-colors",
            "text-muted-foreground hover:text-foreground hover:bg-muted/80",
            open && "bg-muted text-foreground",
          )}
          aria-label="More actions"
          aria-expanded={open}
          aria-haspopup="menu"
        >
          <MoreVertical className="w-4 h-4" />
        </button>

        <AnimatePresence>
          {open && (
            <motion.div
              ref={menuRef}
              role="menu"
              initial={{ opacity: 0, scale: 0.95, y: -4 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -4 }}
              transition={{ duration: 0.12 }}
              className="absolute right-0 top-full mt-1 z-50 w-48 rounded-sm border border-border bg-background shadow-md py-1"
            >
              <button
                role="menuitem"
                onClick={handleRecover}
                className="flex items-center gap-2.5 w-full px-3 py-2 text-sm text-left transition-colors hover:bg-muted/60"
              >
                <RotateCcw className="w-3.5 h-3.5 text-muted-foreground" />
                Recover
              </button>
              <div className="h-px bg-border mx-2 my-1" />
              <button
                role="menuitem"
                onClick={handleDeleteClick}
                className="flex items-center gap-2.5 w-full px-3 py-2 text-sm text-left transition-colors hover:bg-red-50 dark:hover:bg-red-950/30 text-[#DA1E28]"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Delete permanently
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Confirmation dialog */}
      <AnimatePresence>
        {confirmDelete && (
          <>
            <motion.div
              className="fixed inset-0 z-[60] bg-black/30"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !deleting && setConfirmDelete(false)}
            />
            <motion.div
              className="fixed inset-0 z-[61] flex items-center justify-center p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !deleting && setConfirmDelete(false)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="w-full max-w-sm bg-background border border-border rounded-sm shadow-lg"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-5 space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="flex items-center justify-center w-9 h-9 rounded-sm bg-red-50 dark:bg-red-950/30 shrink-0">
                      <AlertTriangle className="w-5 h-5 text-[#DA1E28]" />
                    </div>
                    <div className="space-y-1.5 min-w-0">
                      <h3 className="text-sm font-medium">Delete permanently?</h3>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        This will permanently delete <strong className="text-foreground">{itemName}</strong> and
                        its source file from disk. This action cannot be undone.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 justify-end pt-1">
                    <button
                      onClick={() => setConfirmDelete(false)}
                      disabled={deleting}
                      className="px-3 py-1.5 text-xs font-medium rounded-sm border border-border hover:bg-muted transition-colors disabled:opacity-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleConfirmDelete}
                      disabled={deleting}
                      className={cn(
                        "px-3 py-1.5 text-xs font-medium rounded-sm transition-colors text-white",
                        "bg-[#DA1E28] hover:bg-[#BA1B23]",
                        "disabled:opacity-60 disabled:cursor-not-allowed",
                      )}
                    >
                      {deleting ? "Deleting..." : "Delete permanently"}
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
