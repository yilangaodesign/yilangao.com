"use client";

import { forwardRef, type HTMLAttributes, type ReactNode } from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Command as CommandPrimitive } from "cmdk";
import styles from "./CommandMenu.module.scss";

// ---------------------------------------------------------------------------
// Root — wraps cmdk Command inside a Radix Dialog
// ---------------------------------------------------------------------------

export interface CommandMenuProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: ReactNode;
  className?: string;
}

export function CommandMenu({
  open,
  onOpenChange,
  children,
  className,
}: CommandMenuProps) {
  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className={styles.overlay} />
        <DialogPrimitive.Content
          className={[styles.dialog, className].filter(Boolean).join(" ")}
          aria-label="Command menu"
        >
          <CommandPrimitive className={styles.command}>
            {children}
          </CommandPrimitive>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

// ---------------------------------------------------------------------------
// Input
// ---------------------------------------------------------------------------

export interface CommandInputProps {
  placeholder?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  className?: string;
}

export const CommandInput = forwardRef<HTMLInputElement, CommandInputProps>(
  ({ className, ...props }, ref) => (
    <div className={styles.inputWrapper}>
      <SearchIcon />
      <CommandPrimitive.Input
        ref={ref}
        className={[styles.input, className].filter(Boolean).join(" ")}
        {...props}
      />
    </div>
  ),
);

CommandInput.displayName = "CommandInput";

// ---------------------------------------------------------------------------
// List
// ---------------------------------------------------------------------------

export const CommandList = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.List
    ref={ref}
    className={[styles.list, className].filter(Boolean).join(" ")}
    {...props}
  />
));

CommandList.displayName = "CommandList";

// ---------------------------------------------------------------------------
// Empty state
// ---------------------------------------------------------------------------

export const CommandEmpty = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.Empty
    ref={ref}
    className={[styles.empty, className].filter(Boolean).join(" ")}
    {...props}
  />
));

CommandEmpty.displayName = "CommandEmpty";

// ---------------------------------------------------------------------------
// Group
// ---------------------------------------------------------------------------

export interface CommandGroupProps extends HTMLAttributes<HTMLDivElement> {
  heading?: string;
}

export const CommandGroup = forwardRef<HTMLDivElement, CommandGroupProps>(
  ({ heading, className, ...props }, ref) => (
    <CommandPrimitive.Group
      ref={ref}
      heading={heading}
      className={[styles.group, className].filter(Boolean).join(" ")}
      {...props}
    />
  ),
);

CommandGroup.displayName = "CommandGroup";

// ---------------------------------------------------------------------------
// Item
// ---------------------------------------------------------------------------

export interface CommandItemProps {
  icon?: ReactNode;
  children: ReactNode;
  onSelect?: () => void;
  className?: string;
  value?: string;
  disabled?: boolean;
}

export const CommandItem = forwardRef<HTMLDivElement, CommandItemProps>(
  ({ icon, children, className, ...props }, ref) => (
    <CommandPrimitive.Item
      ref={ref}
      className={[styles.item, className].filter(Boolean).join(" ")}
      {...props}
    >
      {icon && (
        <span className={styles.itemIcon} aria-hidden="true">
          {icon}
        </span>
      )}
      <span className={styles.itemLabel}>{children}</span>
    </CommandPrimitive.Item>
  ),
);

CommandItem.displayName = "CommandItem";

// ---------------------------------------------------------------------------
// Separator
// ---------------------------------------------------------------------------

export const CommandSeparator = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.Separator
    ref={ref}
    className={[styles.separator, className].filter(Boolean).join(" ")}
    {...props}
  />
));

CommandSeparator.displayName = "CommandSeparator";

// ---------------------------------------------------------------------------
// Shortcut helper
// ---------------------------------------------------------------------------

export function CommandShortcut({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span className={[styles.shortcut, className].filter(Boolean).join(" ")}>
      {children}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Inline SVG
// ---------------------------------------------------------------------------

function SearchIcon() {
  return (
    <svg
      className={styles.searchIcon}
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
    >
      <circle cx="7" cy="7" r="5.25" stroke="currentColor" strokeWidth="1.5" />
      <path d="M11 11L14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}
