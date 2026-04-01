"use client";

import { useState } from "react";
import { MoreVertical, RotateCcw, Trash2, AlertTriangle } from "lucide-react";
import {
  Button,
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@ds/index";

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
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleRecover = () => {
    onRecover();
  };

  const handleDeleteClick = () => {
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
      <div className={className} onClick={(e) => e.stopPropagation()}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button iconOnly size="xs" emphasis="minimal" aria-label="More actions">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onSelect={handleRecover}>
              <RotateCcw className="w-3.5 h-3.5 mr-2" />
              Recover
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem destructive onSelect={handleDeleteClick}>
              <Trash2 className="w-3.5 h-3.5 mr-2" />
              Delete permanently
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <Dialog open={confirmDelete} onOpenChange={(open) => !deleting && setConfirmDelete(open)}>
        <DialogContent>
          <div className="flex items-start gap-3">
            <div className="flex items-center justify-center w-9 h-9 rounded-sm bg-red-50 dark:bg-red-950/30 shrink-0">
              <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-500" />
            </div>
            <div className="space-y-1.5 min-w-0">
              <DialogTitle>Delete permanently?</DialogTitle>
              <DialogDescription>
                This will permanently delete <strong className="text-foreground">{itemName}</strong> and
                its source file from disk. This action cannot be undone.
              </DialogDescription>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button emphasis="regular" size="xs" disabled={deleting}>
                Cancel
              </Button>
            </DialogClose>
            <Button
              appearance="negative"
              size="xs"
              onClick={handleConfirmDelete}
              disabled={deleting}
            >
              {deleting ? "Deleting..." : "Delete permanently"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
