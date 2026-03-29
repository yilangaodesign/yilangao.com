"use client";

import { forwardRef, type ReactNode } from "react";
import * as ToastPrimitive from "@radix-ui/react-toast";
import styles from "./Toast.module.scss";

// ---------------------------------------------------------------------------
// Provider + Viewport (place once in layout)
// ---------------------------------------------------------------------------

export const ToastProvider = ToastPrimitive.Provider;

export function ToastViewport() {
  return <ToastPrimitive.Viewport className={styles.viewport} />;
}

// ---------------------------------------------------------------------------
// Toast root
// ---------------------------------------------------------------------------

export interface ToastProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  duration?: number;
  children: ReactNode;
  className?: string;
}

export const Toast = forwardRef<HTMLLIElement, ToastProps>(
  ({ className, ...props }, ref) => (
    <ToastPrimitive.Root
      ref={ref}
      className={[styles.root, className].filter(Boolean).join(" ")}
      {...props}
    />
  ),
);

Toast.displayName = "Toast";

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

export const ToastTitle = forwardRef<
  HTMLDivElement,
  { children: ReactNode; className?: string }
>(({ className, ...props }, ref) => (
  <ToastPrimitive.Title
    ref={ref}
    className={[styles.title, className].filter(Boolean).join(" ")}
    {...props}
  />
));

ToastTitle.displayName = "ToastTitle";

export const ToastDescription = forwardRef<
  HTMLDivElement,
  { children: ReactNode; className?: string }
>(({ className, ...props }, ref) => (
  <ToastPrimitive.Description
    ref={ref}
    className={[styles.description, className].filter(Boolean).join(" ")}
    {...props}
  />
));

ToastDescription.displayName = "ToastDescription";

export const ToastAction = forwardRef<
  HTMLButtonElement,
  { children: ReactNode; altText: string; className?: string; onClick?: () => void }
>(({ className, ...props }, ref) => (
  <ToastPrimitive.Action
    ref={ref}
    className={[styles.action, className].filter(Boolean).join(" ")}
    {...props}
  />
));

ToastAction.displayName = "ToastAction";

export const ToastClose = forwardRef<
  HTMLButtonElement,
  { className?: string }
>(({ className, ...props }, ref) => (
  <ToastPrimitive.Close
    ref={ref}
    className={[styles.close, className].filter(Boolean).join(" ")}
    aria-label="Dismiss"
    {...props}
  >
    <CloseIcon />
  </ToastPrimitive.Close>
));

ToastClose.displayName = "ToastClose";

// ---------------------------------------------------------------------------
// Inline SVG
// ---------------------------------------------------------------------------

function CloseIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path d="M10.5 3.5L3.5 10.5M3.5 3.5L10.5 10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}
