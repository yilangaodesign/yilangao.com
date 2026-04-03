import {
  forwardRef,
  type AnchorHTMLAttributes,
  type ButtonHTMLAttributes,
  type ElementType,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import styles from "./Menu.module.scss";

// =============================================================================
// Types
// =============================================================================

export type MenuSize = "xs" | "sm" | "md" | "lg" | "xl";

export type MenuAppearance =
  | "neutral"
  | "inverse"
  | "always-dark"
  | "always-light";

// =============================================================================
// Menu (container)
// =============================================================================

export interface MenuProps extends HTMLAttributes<HTMLDivElement> {
  size?: MenuSize;
  appearance?: MenuAppearance;
  children: ReactNode;
}

export const Menu = forwardRef<HTMLDivElement, MenuProps>(
  (
    {
      size = "md",
      appearance = "neutral",
      className,
      children,
      ...props
    },
    ref,
  ) => {
    const cls = [
      styles.menu,
      styles[size],
      styles[appearance],
      className,
    ]
      .filter(Boolean)
      .join(" ");

    return (
      <div ref={ref} className={cls} role="menu" {...props}>
        {children}
      </div>
    );
  },
);

Menu.displayName = "Menu";

// =============================================================================
// MenuItem — discriminated union: link (href) vs button
// =============================================================================

export interface MenuItemBaseProps {
  leading?: ReactNode;
  trailing?: ReactNode;
  destructive?: boolean;
  active?: boolean;
}

export type MenuItemAsLink = MenuItemBaseProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "children"> & {
    href: string;
    as?: ElementType;
    children?: ReactNode;
  };

export type MenuItemAsButton = MenuItemBaseProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> & {
    href?: never;
    children?: ReactNode;
  };

export type MenuItemProps = MenuItemAsLink | MenuItemAsButton;

function isLink(props: MenuItemProps): props is MenuItemAsLink {
  return typeof (props as MenuItemAsLink).href === "string";
}

export const MenuItem = forwardRef<
  HTMLAnchorElement | HTMLButtonElement,
  MenuItemProps
>(
  (
    {
      leading,
      trailing,
      destructive = false,
      active = false,
      className,
      children,
      ...rest
    },
    ref,
  ) => {
    const cls = [
      styles.item,
      active && styles.active,
      destructive && styles.destructive,
      className,
    ]
      .filter(Boolean)
      .join(" ");

    const inner = (
      <>
        {leading && (
          <span className={styles.leadingSlot} aria-hidden="true">
            {leading}
          </span>
        )}
        {children && <span className={styles.itemLabel}>{children}</span>}
        {trailing && (
          <span className={styles.trailingSlot}>{trailing}</span>
        )}
      </>
    );

    if (isLink({ ...rest, children } as MenuItemProps)) {
      const {
        href,
        as: LinkComponent = "a",
        ...anchorProps
      } = rest as Omit<MenuItemAsLink, keyof MenuItemBaseProps>;

      return (
        <LinkComponent
          ref={ref as React.Ref<HTMLAnchorElement>}
          href={href}
          className={cls}
          role="menuitem"
          {...anchorProps}
        >
          {inner}
        </LinkComponent>
      );
    }

    const buttonProps = rest as Omit<MenuItemAsButton, keyof MenuItemBaseProps>;
    return (
      <button
        ref={ref as React.Ref<HTMLButtonElement>}
        type="button"
        className={cls}
        role="menuitem"
        {...buttonProps}
      >
        {inner}
      </button>
    );
  },
);

MenuItem.displayName = "MenuItem";

// =============================================================================
// MenuLabel — non-interactive group heading
// =============================================================================

export interface MenuLabelProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export const MenuLabel = forwardRef<HTMLDivElement, MenuLabelProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={[styles.label, className].filter(Boolean).join(" ")}
      role="presentation"
      {...props}
    />
  ),
);

MenuLabel.displayName = "MenuLabel";

// =============================================================================
// MenuSeparator
// =============================================================================

export function MenuSeparator({ className }: { className?: string }) {
  return (
    <div
      className={[styles.separator, className].filter(Boolean).join(" ")}
      role="separator"
    />
  );
}

// =============================================================================
// MenuHeader / MenuFooter — sticky slot areas
// =============================================================================

export interface MenuHeaderProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export const MenuHeader = forwardRef<HTMLDivElement, MenuHeaderProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={[styles.header, className].filter(Boolean).join(" ")}
      {...props}
    />
  ),
);

MenuHeader.displayName = "MenuHeader";

export interface MenuFooterProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export const MenuFooter = forwardRef<HTMLDivElement, MenuFooterProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={[styles.footer, className].filter(Boolean).join(" ")}
      {...props}
    />
  ),
);

MenuFooter.displayName = "MenuFooter";
