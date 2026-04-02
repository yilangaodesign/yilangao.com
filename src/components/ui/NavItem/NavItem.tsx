import {
  forwardRef,
  type AnchorHTMLAttributes,
  type ButtonHTMLAttributes,
  type ElementType,
  type ReactNode,
} from "react";
import { Badge, type BadgeSize } from "../Badge/Badge";
import styles from "./NavItem.module.scss";

export type NavItemSize = "sm" | "md" | "lg" | "touch";
export type NavItemActiveAppearance = "neutral" | "brand";

const BADGE_SIZE: Record<NavItemSize, { expanded: BadgeSize; overlay: BadgeSize }> = {
  sm:    { expanded: "xxs", overlay: "xxs" },
  md:    { expanded: "xs",  overlay: "xxs" },
  lg:    { expanded: "sm",  overlay: "xs" },
  touch: { expanded: "sm",  overlay: "xs" },
};

interface RenderBadgeOpts {
  size: BadgeSize;
  overlay?: boolean;
  active?: boolean;
}

function renderBadge(badge: ReactNode, opts: RenderBadgeOpts): ReactNode {
  if (typeof badge === "number" || typeof badge === "string") {
    const appearance = opts.overlay && opts.active ? "highlight" : "neutral";
    const emphasis = opts.overlay ? "bold" : "subtle";
    return (
      <Badge size={opts.size} appearance={appearance} emphasis={emphasis}>
        {badge}
      </Badge>
    );
  }
  return badge;
}

export interface NavItemBaseProps {
  icon: ReactNode;
  size?: NavItemSize;
  active?: boolean;
  activeAppearance?: NavItemActiveAppearance;
  expanded?: boolean;
  collapsed?: boolean;
  badge?: ReactNode;
  trailing?: ReactNode;
  disabled?: boolean;
}

export type NavItemAsLink = NavItemBaseProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "children"> & {
    href: string;
    as?: ElementType;
    children?: ReactNode;
  };

export type NavItemAsButton = NavItemBaseProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> & {
    href?: never;
    children?: ReactNode;
  };

export type NavItemProps = NavItemAsLink | NavItemAsButton;

function isLink(props: NavItemProps): props is NavItemAsLink {
  return typeof (props as NavItemAsLink).href === "string";
}

export const NavItem = forwardRef<
  HTMLAnchorElement | HTMLButtonElement,
  NavItemProps
>(
  (
    {
      icon,
      size = "md",
      active = false,
      activeAppearance = "neutral",
      expanded = false,
      collapsed = false,
      badge,
      trailing,
      disabled = false,
      className,
      children,
      ...rest
    },
    ref,
  ) => {
    const stateClass = active
      ? activeAppearance === "brand"
        ? styles.brandActive
        : styles.active
      : expanded
        ? styles.expanded
        : undefined;

    const cls = [
      styles.navItem,
      styles[size],
      stateClass,
      collapsed && styles.collapsed,
      disabled && styles.disabled,
      className,
    ]
      .filter(Boolean)
      .join(" ");

    const hasBadge = badge != null;

    const inner = (
      <>
        <span className={styles.icon} aria-hidden="true">
          {icon}
        </span>
        {!collapsed && children && (
          <span className={styles.label}>{children}</span>
        )}
        {!collapsed && hasBadge && (
          <span className={styles.badge}>
            {renderBadge(badge, { size: BADGE_SIZE[size].expanded })}
          </span>
        )}
        {!collapsed && trailing && (
          <span className={styles.trailing}>{trailing}</span>
        )}
        {collapsed && hasBadge && (
          <span className={styles.badgeOverlay}>
            {renderBadge(badge, { size: BADGE_SIZE[size].overlay, overlay: true, active })}
          </span>
        )}
      </>
    );

    if (isLink({ ...rest, icon, children } as NavItemProps)) {
      const { href, as: LinkComponent = "a", ...anchorProps } = rest as Omit<NavItemAsLink, keyof NavItemBaseProps>;
      return (
        <LinkComponent
          ref={ref as React.Ref<HTMLAnchorElement>}
          href={href}
          className={cls}
          aria-current={active ? "page" : undefined}
          aria-disabled={disabled || undefined}
          title={collapsed && typeof children === "string" ? children : undefined}
          {...anchorProps}
        >
          {inner}
        </LinkComponent>
      );
    }

    const buttonProps = rest as Omit<NavItemAsButton, keyof NavItemBaseProps>;
    return (
      <button
        ref={ref as React.Ref<HTMLButtonElement>}
        type="button"
        className={cls}
        disabled={disabled}
        title={collapsed && typeof children === "string" ? children : undefined}
        {...buttonProps}
      >
        {inner}
      </button>
    );
  },
);

NavItem.displayName = "NavItem";
