"use client";

import { forwardRef, type ReactNode } from "react";
import * as DropdownPrimitive from "@radix-ui/react-dropdown-menu";
import type { MenuSize, MenuAppearance } from "../Menu/Menu";
import menuStyles from "../Menu/Menu.module.scss";
import styles from "./DropdownMenu.module.scss";

export const DropdownMenu = DropdownPrimitive.Root;
export const DropdownMenuTrigger = DropdownPrimitive.Trigger;
export const DropdownMenuGroup = DropdownPrimitive.Group;
export const DropdownMenuSub = DropdownPrimitive.Sub;
export const DropdownMenuRadioGroup = DropdownPrimitive.RadioGroup;

// ---------------------------------------------------------------------------
// Content — composes Menu container styles with Radix portal + animation
// ---------------------------------------------------------------------------

export interface DropdownMenuContentProps {
  children: ReactNode;
  className?: string;
  align?: "start" | "center" | "end";
  sideOffset?: number;
  size?: MenuSize;
  appearance?: MenuAppearance;
}

export const DropdownMenuContent = forwardRef<HTMLDivElement, DropdownMenuContentProps>(
  (
    {
      className,
      align = "end",
      sideOffset = 4,
      size = "sm",
      appearance = "neutral",
      ...props
    },
    ref,
  ) => (
    <DropdownPrimitive.Portal>
      <DropdownPrimitive.Content
        ref={ref}
        className={[
          menuStyles.menu,
          menuStyles[size],
          menuStyles[appearance],
          styles.animated,
          className,
        ]
          .filter(Boolean)
          .join(" ")}
        align={align}
        sideOffset={sideOffset}
        role="menu"
        {...props}
      />
    </DropdownPrimitive.Portal>
  ),
);

DropdownMenuContent.displayName = "DropdownMenuContent";

// ---------------------------------------------------------------------------
// Item — composes Menu item styles with Radix item behavior
// ---------------------------------------------------------------------------

export interface DropdownMenuItemProps {
  children: ReactNode;
  className?: string;
  destructive?: boolean;
  disabled?: boolean;
  onSelect?: () => void;
  leading?: ReactNode;
  trailing?: ReactNode;
}

export const DropdownMenuItem = forwardRef<HTMLDivElement, DropdownMenuItemProps>(
  ({ destructive, leading, trailing, className, children, ...props }, ref) => {
    const hasSlots = leading != null || trailing != null;

    return (
      <DropdownPrimitive.Item
        ref={ref}
        className={[
          menuStyles.item,
          destructive && menuStyles.destructive,
          className,
        ]
          .filter(Boolean)
          .join(" ")}
        {...props}
      >
        {hasSlots ? (
          <>
            {leading && (
              <span className={menuStyles.leadingSlot} aria-hidden="true">
                {leading}
              </span>
            )}
            <span className={menuStyles.itemLabel}>{children}</span>
            {trailing && (
              <span className={menuStyles.trailingSlot}>{trailing}</span>
            )}
          </>
        ) : (
          children
        )}
      </DropdownPrimitive.Item>
    );
  },
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
    className={[menuStyles.label, className].filter(Boolean).join(" ")}
    {...props}
  />
));

DropdownMenuLabel.displayName = "DropdownMenuLabel";

export const DropdownMenuSeparator = () => (
  <DropdownPrimitive.Separator className={menuStyles.separator} />
);

export function DropdownMenuShortcut({ children }: { children: ReactNode }) {
  return <span className={styles.shortcut}>{children}</span>;
}
