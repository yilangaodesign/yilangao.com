import {
  forwardRef,
  type AnchorHTMLAttributes,
  type ButtonHTMLAttributes,
  type ReactNode,
} from "react";
import styles from "./NavItem.module.scss";

export interface NavItemBaseProps {
  icon: ReactNode;
  active?: boolean;
  collapsed?: boolean;
  trailing?: ReactNode;
  disabled?: boolean;
}

export type NavItemAsLink = NavItemBaseProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "children"> & {
    href: string;
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
      active = false,
      collapsed = false,
      trailing,
      disabled = false,
      className,
      children,
      ...rest
    },
    ref,
  ) => {
    const cls = [
      styles.navItem,
      active && styles.active,
      collapsed && styles.collapsed,
      disabled && styles.disabled,
      className,
    ]
      .filter(Boolean)
      .join(" ");

    const inner = (
      <>
        <span className={styles.icon} aria-hidden="true">
          {icon}
        </span>
        {!collapsed && children && (
          <span className={styles.label}>{children}</span>
        )}
        {!collapsed && trailing && (
          <span className={styles.trailing}>{trailing}</span>
        )}
      </>
    );

    if (isLink({ ...rest, icon, children } as NavItemProps)) {
      const { href, ...anchorProps } = rest as Omit<NavItemAsLink, keyof NavItemBaseProps>;
      return (
        <a
          ref={ref as React.Ref<HTMLAnchorElement>}
          href={href}
          className={cls}
          aria-current={active ? "page" : undefined}
          aria-disabled={disabled || undefined}
          title={collapsed && typeof children === "string" ? children : undefined}
          {...anchorProps}
        >
          {inner}
        </a>
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
