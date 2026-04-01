"use client";

import { useState } from "react";
import { X, RotateCcw, User, Bot, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ArchiveItem } from "@/lib/archive-manifest";
import { PreviewRenderer } from "@/lib/archive-previews";
import { TypeBadge, ExperimentTag } from "./archive-tile";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetBody,
  SheetFooter,
  Button,
  Card,
  Badge,
  InlineCode,
  DescriptionList,
  DescriptionItem,
} from "@ds/index";

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

  const restoreAppearance =
    restoreState === "done" ? "positive" as const
    : restoreState === "confirm" ? "warning" as const
    : "neutral" as const;

  return (
    <Sheet open={!!item} onOpenChange={(open) => !open && resetAndClose()}>
      <SheetContent side="right">
        <SheetHeader>
          <h2 className="text-sm font-medium truncate">{item?.name}</h2>
          <Button iconOnly size="xs" emphasis="minimal" onClick={resetAndClose} aria-label="Close drawer">
            <X className="w-4 h-4" />
          </Button>
        </SheetHeader>

        {item && (
          <SheetBody>
            <div className="space-y-5">
              <Card variant="muted">
                <div className="p-6 min-h-[160px] flex items-center justify-center">
                  <PreviewRenderer id={item.id} />
                </div>
              </Card>

              <div className="flex items-center gap-2 flex-wrap">
                <TypeBadge type={item.type} />
                <ExperimentTag experiment={item.experiment} />
                {item.tags.map((tag) => (
                  <Badge key={tag} shape="squared" mono size="xs" variant="default">
                    {tag}
                  </Badge>
                ))}
              </div>

              <div>
                <p className="text-sm leading-relaxed">{item.description}</p>
                {item.reason && (
                  <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                    <span className="font-medium">Why archived:</span> {item.reason}
                  </p>
                )}
              </div>

              <Card>
                <div className="px-4">
                  <DescriptionList>
                    <DescriptionItem label="Origin">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <Badge shape="squared" mono size="xs">{item.origin.type}</Badge>
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
                    </DescriptionItem>
                    <DescriptionItem label="Source">
                      <InlineCode>{item.sourcePath}</InlineCode>
                    </DescriptionItem>
                    {item.archivePath && (
                      <DescriptionItem label="Archive">
                        <InlineCode>{item.archivePath}</InlineCode>
                      </DescriptionItem>
                    )}
                    <DescriptionItem label="Created">
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
                    </DescriptionItem>
                    {item.archivedAt && (
                      <DescriptionItem label="Archived">
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
                      </DescriptionItem>
                    )}
                  </DescriptionList>
                </div>
              </Card>
            </div>
          </SheetBody>
        )}

        <SheetFooter>
          <Button
            fullWidth
            appearance={restoreAppearance}
            onClick={handleRestore}
            disabled={restoreState === "restoring" || restoreState === "done"}
            leadingIcon={
              <RotateCcw className={cn("w-3.5 h-3.5", restoreState === "restoring" && "animate-spin")} />
            }
          >
            {restoreState === "idle" && "Restore to source"}
            {restoreState === "confirm" && "Click again to confirm"}
            {restoreState === "restoring" && "Restoring..."}
            {restoreState === "done" && "Restored"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
