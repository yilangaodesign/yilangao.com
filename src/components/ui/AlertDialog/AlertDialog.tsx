"use client";

import { forwardRef, type ReactNode } from "react";
import * as AlertDialogPrimitive from "@radix-ui/react-alert-dialog";
import styles from "./AlertDialog.module.scss";

// ---------------------------------------------------------------------------
// Root — controls open/close state for destructive confirmation
// ---------------------------------------------------------------------------

export const AlertDialog = AlertDialogPrimitive.Root;
export const AlertDialogTrigger = AlertDialogPrimitive.Trigger;

// ---------------------------------------------------------------------------
// Content (the actual alert panel)
// ---------------------------------------------------------------------------

export interface AlertDialogContentProps {
  children: ReactNode;
  className?: string;
}

export const AlertDialogContent = forwardRef<HTMLDivElement, AlertDialogContentProps>(
  ({ children, className, ...props }, ref) => (
    <AlertDialogPrimitive.Portal>
      <AlertDialogPrimitive.Overlay className={styles.overlay} />
      <AlertDialogPrimitive.Content
        ref={ref}
        className={[styles.content, className].filter(Boolean).join(" ")}
        {...props}
      >
        {children}
      </AlertDialogPrimitive.Content>
    </AlertDialogPrimitive.Portal>
  ),
);

AlertDialogContent.displayName = "AlertDialogContent";

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

export const AlertDialogTitle = forwardRef<
  HTMLHeadingElement,
  { children: ReactNode; className?: string }
>(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Title
    ref={ref}
    className={[styles.title, className].filter(Boolean).join(" ")}
    {...props}
  />
));

AlertDialogTitle.displayName = "AlertDialogTitle";

export const AlertDialogDescription = forwardRef<
  HTMLParagraphElement,
  { children: ReactNode; className?: string }
>(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Description
    ref={ref}
    className={[styles.description, className].filter(Boolean).join(" ")}
    {...props}
  />
));

AlertDialogDescription.displayName = "AlertDialogDescription";

export function AlertDialogFooter({
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

export const AlertDialogCancel = AlertDialogPrimitive.Cancel;
export const AlertDialogAction = AlertDialogPrimitive.Action;
