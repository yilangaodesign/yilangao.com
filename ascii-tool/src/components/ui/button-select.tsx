"use client";

import { forwardRef, type ReactNode } from "react";
import * as ToggleGroupPrimitive from "@radix-ui/react-toggle-group";
import { cn } from "@/lib/utils";

interface ButtonSelectProps {
  value: string;
  onValueChange: (value: string) => void;
  size?: "sm" | "md";
  fullWidth?: boolean;
  disabled?: boolean;
  children: ReactNode;
  className?: string;
}

export const ButtonSelect = forwardRef<HTMLDivElement, ButtonSelectProps>(
  (
    {
      value,
      onValueChange,
      size = "md",
      fullWidth = false,
      disabled = false,
      children,
      className,
    },
    ref,
  ) => (
    <ToggleGroupPrimitive.Root
      ref={ref}
      type="single"
      value={value}
      onValueChange={(v) => { if (v) onValueChange(v); }}
      disabled={disabled}
      className={cn(
        "inline-flex items-stretch border border-border rounded-sm overflow-hidden",
        fullWidth && "flex w-full",
        className,
      )}
    >
      {children}
    </ToggleGroupPrimitive.Root>
  ),
);

ButtonSelect.displayName = "ButtonSelect";

interface ButtonSelectItemProps {
  value: string;
  disabled?: boolean;
  children: ReactNode;
  className?: string;
}

export const ButtonSelectItem = forwardRef<HTMLButtonElement, ButtonSelectItemProps>(
  ({ value, disabled, children, className }, ref) => (
    <ToggleGroupPrimitive.Item
      ref={ref}
      value={value}
      disabled={disabled}
      className={cn(
        "flex-1 inline-flex items-center justify-center font-medium whitespace-nowrap border-r border-border last:border-r-0 transition-colors",
        "text-muted-foreground hover:text-foreground hover:bg-muted",
        "data-[state=on]:bg-muted data-[state=on]:text-foreground",
        "disabled:opacity-40 disabled:pointer-events-none",
        "h-8 px-4 text-sm",
        className,
      )}
    >
      {children}
    </ToggleGroupPrimitive.Item>
  ),
);

ButtonSelectItem.displayName = "ButtonSelectItem";
