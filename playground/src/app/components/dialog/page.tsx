"use client";

import { type ReactNode } from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Shell } from "@/components/shell";
import { SectionHeading } from "@/components/token-grid";
import { ComponentPreview, PropsTable } from "@/components/component-preview";
import { cn } from "@/lib/utils";

const Dialog = DialogPrimitive.Root;
const DialogTrigger = DialogPrimitive.Trigger;
const DialogClose = DialogPrimitive.Close;

function DialogContent({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/50" />
      <DialogPrimitive.Content
        className={cn(
          "fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-sm border border-border bg-background p-6 shadow-lg outline-none",
          className,
        )}
      >
        {children}
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
}

const DialogTitle = DialogPrimitive.Title;
const DialogDescription = DialogPrimitive.Description;

function DialogFooter({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={cn("mt-6 flex flex-row flex-wrap justify-end gap-2", className)}>{children}</div>
  );
}

function DialogDemo() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button
          type="button"
          className="rounded-sm border border-border bg-background px-4 py-2 text-sm font-medium text-foreground shadow-sm transition-colors hover:bg-muted"
        >
          Open dialog
        </button>
      </DialogTrigger>
      <DialogContent>
        <DialogTitle className="text-lg font-semibold text-foreground">Save changes?</DialogTitle>
        <DialogDescription className="mt-2 text-sm text-muted-foreground">
          Your updates will be visible to collaborators. You can undo this action from the history
          panel for 24 hours.
        </DialogDescription>
        <DialogFooter>
          <DialogClose asChild>
            <button
              type="button"
              className="rounded-sm border border-border bg-background px-3 py-2 text-sm font-medium text-foreground hover:bg-muted"
            >
              Cancel
            </button>
          </DialogClose>
          <DialogClose asChild>
            <button
              type="button"
              className="rounded-sm bg-accent px-3 py-2 text-sm font-medium text-accent-foreground hover:bg-accent/90"
            >
              Confirm
            </button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

const code = `"use client";

import * as DialogPrimitive from "@radix-ui/react-dialog";

const Dialog = DialogPrimitive.Root;
const DialogTrigger = DialogPrimitive.Trigger;
const DialogClose = DialogPrimitive.Close;
const DialogTitle = DialogPrimitive.Title;
const DialogDescription = DialogPrimitive.Description;

function DialogContent({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/50" />
      <DialogPrimitive.Content className={cn("fixed left-1/2 top-1/2 z-50 ...", className)}>
        {children}
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
}

function DialogFooter({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("mt-6 flex justify-end gap-2", className)}>{children}</div>;
}

export function Example() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button type="button">Open</button>
      </DialogTrigger>
      <DialogContent>
        <DialogTitle>Title</DialogTitle>
        <DialogDescription>Description</DialogDescription>
        <DialogFooter>
          <DialogClose asChild><button type="button">Cancel</button></DialogClose>
          <DialogClose asChild><button type="button">Confirm</button></DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}`;

export default function DialogPage() {
  return (
    <Shell title="Dialog">
      <div className="max-w-5xl space-y-10">
        <SectionHeading
          title="Dialog"
          description="Modal dialog compound component built on Radix UI: root controls open state, trigger opens the portal, content carries title, description, and footer actions."
        />

        <ComponentPreview
          title="Interactive demo"
          description="Button opens a modal with title, description, and Cancel / Confirm actions wired through DialogClose."
          code={code}
        >
          <DialogDemo />
        </ComponentPreview>

        <div>
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-3">
            Compound parts
          </h3>
          <PropsTable
            props={[
              {
                name: "Dialog",
                type: "Root props (Radix)",
                description: "Wraps DialogPrimitive.Root; optional controlled open / onOpenChange.",
              },
              {
                name: "DialogTrigger",
                type: "Trigger props",
                description: "Opens the dialog. Use asChild to attach to a button.",
              },
              {
                name: "DialogContent",
                type: "{ children, className? }",
                description: "Portal, overlay, and focus-trapped panel.",
              },
              {
                name: "DialogTitle",
                type: "Title props",
                description: "Accessible title; required for screen readers.",
              },
              {
                name: "DialogDescription",
                type: "Description props",
                description: "Secondary text below the title.",
              },
              {
                name: "DialogFooter",
                type: "{ children, className? }",
                description: "Layout row for actions (not a Radix primitive).",
              },
              {
                name: "DialogClose",
                type: "Close props",
                description: "Closes the dialog; use asChild with buttons.",
              },
            ]}
          />
        </div>

        <div className="text-xs font-mono text-muted-foreground p-3 rounded-sm bg-muted/50">
          src/components/ui/Dialog/Dialog.tsx
        </div>
      </div>
    </Shell>
  );
}
