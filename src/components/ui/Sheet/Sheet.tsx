"use client";

import { forwardRef, type ReactNode, type HTMLAttributes } from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import styles from "./Sheet.module.scss";

// ---------------------------------------------------------------------------
// Root — controls open/close state
// ---------------------------------------------------------------------------

export const Sheet = DialogPrimitive.Root;
export const SheetTrigger = DialogPrimitive.Trigger;
export const SheetClose = DialogPrimitive.Close;

// ---------------------------------------------------------------------------
// Content (the sliding panel)
// ---------------------------------------------------------------------------

export type SheetSide = "left" | "right" | "top" | "bottom";

export interface SheetContentProps {
  children: ReactNode;
  side?: SheetSide;
  className?: string;
}

export const SheetContent = forwardRef<HTMLDivElement, SheetContentProps>(
  ({ children, side = "right", className, ...props }, ref) => (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className={styles.overlay} />
      <DialogPrimitive.Content
        ref={ref}
        className={[styles.content, styles[side], className]
          .filter(Boolean)
          .join(" ")}
        {...props}
      >
        {children}
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  ),
);

SheetContent.displayName = "SheetContent";

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

export const SheetHeader = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => (
  <div
    ref={ref}
    className={[styles.header, className].filter(Boolean).join(" ")}
    {...props}
  >
    {children}
  </div>
));

SheetHeader.displayName = "SheetHeader";

export const SheetTitle = forwardRef<
  HTMLHeadingElement,
  { children: ReactNode; className?: string }
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={[styles.title, className].filter(Boolean).join(" ")}
    {...props}
  />
));

SheetTitle.displayName = "SheetTitle";

export const SheetDescription = forwardRef<
  HTMLParagraphElement,
  { children: ReactNode; className?: string }
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={[styles.description, className].filter(Boolean).join(" ")}
    {...props}
  />
));

SheetDescription.displayName = "SheetDescription";

export function SheetFooter({
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

export function SheetBody({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={[styles.body, className].filter(Boolean).join(" ")}>
      {children}
    </div>
  );
}
