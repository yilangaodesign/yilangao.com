"use client";

import { forwardRef, type ReactNode } from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import styles from "./Dialog.module.scss";

// ---------------------------------------------------------------------------
// Root — controls open/close state
// ---------------------------------------------------------------------------

export const Dialog = DialogPrimitive.Root;
export const DialogTrigger = DialogPrimitive.Trigger;

// ---------------------------------------------------------------------------
// Content (the actual modal panel)
// ---------------------------------------------------------------------------

export interface DialogContentProps {
  children: ReactNode;
  className?: string;
}

export const DialogContent = forwardRef<HTMLDivElement, DialogContentProps>(
  ({ children, className, ...props }, ref) => (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className={styles.overlay} />
      <DialogPrimitive.Content
        ref={ref}
        className={[styles.content, className].filter(Boolean).join(" ")}
        {...props}
      >
        {children}
        <DialogPrimitive.Close className={styles.close} aria-label="Close">
          <CloseIcon />
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  ),
);

DialogContent.displayName = "DialogContent";

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

export const DialogTitle = forwardRef<
  HTMLHeadingElement,
  { children: ReactNode; className?: string }
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={[styles.title, className].filter(Boolean).join(" ")}
    {...props}
  />
));

DialogTitle.displayName = "DialogTitle";

export const DialogDescription = forwardRef<
  HTMLParagraphElement,
  { children: ReactNode; className?: string }
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={[styles.description, className].filter(Boolean).join(" ")}
    {...props}
  />
));

DialogDescription.displayName = "DialogDescription";

export function DialogFooter({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={[styles.footer, className].filter(Boolean).join(" ")}>
      {children}
    </div>
  );
}

export const DialogClose = DialogPrimitive.Close;

// ---------------------------------------------------------------------------
// Inline SVG
// ---------------------------------------------------------------------------

function CloseIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M12 4L4 12M4 4L12 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}
