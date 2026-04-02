"use client";

import {
  forwardRef,
  useState,
  useCallback,
  type ReactNode,
  type ButtonHTMLAttributes,
} from "react";
import { NavItem, type NavItemSize, type NavItemActiveAppearance } from "./NavItem";
import styles from "./NavItem.module.scss";

export interface NavItemTriggerProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> {
  icon: ReactNode;
  size?: NavItemSize;
  active?: boolean;
  activeAppearance?: NavItemActiveAppearance;
  collapsed?: boolean;
  disabled?: boolean;
  expanded?: boolean;
  defaultExpanded?: boolean;
  onExpandedChange?: (expanded: boolean) => void;
  badge?: ReactNode;
  children: ReactNode;
}

export const NavItemTrigger = forwardRef<
  HTMLButtonElement,
  NavItemTriggerProps
>(
  (
    {
      icon,
      size = "md",
      active = false,
      activeAppearance = "neutral",
      collapsed = false,
      disabled = false,
      expanded: controlledExpanded,
      defaultExpanded = false,
      onExpandedChange,
      badge,
      children,
      className,
      onClick,
      ...rest
    },
    ref,
  ) => {
    const [uncontrolledExpanded, setUncontrolledExpanded] =
      useState(defaultExpanded);

    const isControlled = controlledExpanded !== undefined;
    const isExpanded = isControlled ? controlledExpanded : uncontrolledExpanded;

    const handleToggle = useCallback(
      (e: React.MouseEvent<HTMLButtonElement>) => {
        if (disabled) return;
        onClick?.(e);
        if (e.defaultPrevented) return;

        const next = !isExpanded;
        if (!isControlled) setUncontrolledExpanded(next);
        onExpandedChange?.(next);
      },
      [disabled, isExpanded, isControlled, onClick, onExpandedChange],
    );

    const chevron = (
      <svg
        className={[
          styles.chevron,
          isExpanded && styles.chevronExpanded,
        ]
          .filter(Boolean)
          .join(" ")}
        width={12}
        height={12}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <polyline points="9 18 15 12 9 6" />
      </svg>
    );

    return (
      <NavItem
        ref={ref as React.Ref<HTMLAnchorElement | HTMLButtonElement>}
        icon={icon}
        size={size}
        active={active}
        activeAppearance={activeAppearance}
        expanded={!active && isExpanded}
        collapsed={collapsed}
        disabled={disabled}
        badge={badge}
        trailing={!collapsed ? chevron : undefined}
        className={className}
        onClick={handleToggle}
        aria-expanded={isExpanded}
        {...rest}
      >
        {children}
      </NavItem>
    );
  },
);

NavItemTrigger.displayName = "NavItemTrigger";
