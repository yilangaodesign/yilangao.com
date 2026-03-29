"use client";

import { forwardRef, type ReactNode } from "react";
import * as DropdownPrimitive from "@radix-ui/react-dropdown-menu";
import styles from "./DropdownMenu.module.scss";

export const DropdownMenu = DropdownPrimitive.Root;
export const DropdownMenuTrigger = DropdownPrimitive.Trigger;
export const DropdownMenuGroup = DropdownPrimitive.Group;
export const DropdownMenuSub = DropdownPrimitive.Sub;
export const DropdownMenuRadioGroup = DropdownPrimitive.RadioGroup;

// ---------------------------------------------------------------------------
// Content
// ---------------------------------------------------------------------------

export interface DropdownMenuContentProps {
  children: ReactNode;
  className?: string;
  align?: "start" | "center" | "end";
  sideOffset?: number;
}

export const DropdownMenuContent = forwardRef<HTMLDivElement, DropdownMenuContentProps>(
  ({ className, align = "end", sideOffset = 4, ...props }, ref) => (
    <DropdownPrimitive.Portal>
      <DropdownPrimitive.Content
        ref={ref}
        className={[styles.content, className].filter(Boolean).join(" ")}
        align={align}
        sideOffset={sideOffset}
        {...props}
      />
    </DropdownPrimitive.Portal>
  ),
);

DropdownMenuContent.displayName = "DropdownMenuContent";

// ---------------------------------------------------------------------------
// Item
// ---------------------------------------------------------------------------

export interface DropdownMenuItemProps {
  children: ReactNode;
  className?: string;
  destructive?: boolean;
  disabled?: boolean;
  onSelect?: () => void;
}

export const DropdownMenuItem = forwardRef<HTMLDivElement, DropdownMenuItemProps>(
  ({ destructive, className, ...props }, ref) => (
    <DropdownPrimitive.Item
      ref={ref}
      className={[styles.item, destructive && styles.destructive, className]
        .filter(Boolean)
        .join(" ")}
      {...props}
    />
  ),
);

DropdownMenuItem.displayName = "DropdownMenuItem";

// ---------------------------------------------------------------------------
// Label / Separator / Shortcut
// ---------------------------------------------------------------------------

export const DropdownMenuLabel = forwardRef<
  HTMLDivElement,
  { children: ReactNode; className?: string }
>(({ className, ...props }, ref) => (
  <DropdownPrimitive.Label
    ref={ref}
    className={[styles.label, className].filter(Boolean).join(" ")}
    {...props}
  />
));

DropdownMenuLabel.displayName = "DropdownMenuLabel";

export const DropdownMenuSeparator = () => (
  <DropdownPrimitive.Separator className={styles.separator} />
);

export function DropdownMenuShortcut({ children }: { children: ReactNode }) {
  return <span className={styles.shortcut}>{children}</span>;
}
