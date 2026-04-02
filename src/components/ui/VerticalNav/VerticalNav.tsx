"use client";

import {
  forwardRef,
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
  type ReactNode,
  type HTMLAttributes,
} from "react";
import { createPortal } from "react-dom";
import { useSafeTriangle } from "../../../hooks/use-safe-triangle";
import { NavItem } from "../NavItem/NavItem";
import { NavItemChildren } from "../NavItem/NavItemChildren";
import styles from "./VerticalNav.module.scss";
import navItemStyles from "../NavItem/NavItem.module.scss";

// ── Constants ────────────────────────────────────────────────────────────────

const W_EXPANDED = 200;
const W_COLLAPSED = 41;

// ── Context: Public (collapsed / mobile state) ──────────────────────────────

interface VerticalNavContextValue {
  collapsed: boolean;
  setCollapsed: (v: boolean) => void;
  mobileOpen: boolean;
  setMobileOpen: (v: boolean) => void;
}

const VerticalNavContext = createContext<VerticalNavContextValue>({
  collapsed: false,
  setCollapsed: () => {},
  mobileOpen: false,
  setMobileOpen: () => {},
});

export function useVerticalNav() {
  return useContext(VerticalNavContext);
}

// ── Context: Internal (sliver interaction state) ─────────────────────────────

interface SliverContextValue {
  openCategory: string | null;
  handleCategoryHover: (id: string) => void;
  dismissSliver: () => void;
  isMobile: boolean;
  isCollapsedDesktop: boolean;
}

const SliverContext = createContext<SliverContextValue>({
  openCategory: null,
  handleCategoryHover: () => {},
  dismissSliver: () => {},
  isMobile: false,
  isCollapsedDesktop: false,
});

// ── Provider ─────────────────────────────────────────────────────────────────

export interface VerticalNavProviderProps {
  children: ReactNode;
  defaultCollapsed?: boolean;
}

export function VerticalNavProvider({
  children,
  defaultCollapsed = false,
}: VerticalNavProviderProps) {
  const [collapsed, setCollapsed] = useState(defaultCollapsed);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <VerticalNavContext.Provider
      value={{ collapsed, setCollapsed, mobileOpen, setMobileOpen }}
    >
      {children}
    </VerticalNavContext.Provider>
  );
}

VerticalNavProvider.displayName = "VerticalNavProvider";

// ── VerticalNav (root aside) ─────────────────────────────────────────────────

export interface VerticalNavProps extends HTMLAttributes<HTMLElement> {
  children: ReactNode;
}

export const VerticalNav = forwardRef<HTMLElement, VerticalNavProps>(
  ({ children, className, ...rest }, ref) => {
    const { collapsed, mobileOpen, setMobileOpen } =
      useContext(VerticalNavContext);

    const [openCategory, setOpenCategory] = useState<string | null>(null);
    const [displayedCategory, setDisplayedCategory] = useState<string | null>(
      null,
    );
    const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const sliverRef = useRef<HTMLDivElement>(null);

    const closeMobile = useCallback(
      () => setMobileOpen(false),
      [setMobileOpen],
    );

    const isCollapsedDesktop = collapsed && !mobileOpen;
    const isMobile = mobileOpen;

    const { interceptHover, cancelPending } = useSafeTriangle({
      enabled: openCategory !== null && !isMobile,
      submenuRef: sliverRef,
      direction: "right",
    });

    const scheduleClose = useCallback(() => {
      closeTimerRef.current = setTimeout(() => {
        setOpenCategory(null);
      }, 200);
    }, []);

    const cancelClose = useCallback(() => {
      if (closeTimerRef.current) {
        clearTimeout(closeTimerRef.current);
        closeTimerRef.current = null;
      }
    }, []);

    useEffect(() => {
      if (openCategory) setDisplayedCategory(openCategory);
    }, [openCategory]);

    useEffect(() => {
      cancelPending();
      setOpenCategory(null);
    }, [collapsed, cancelPending]);

    useEffect(() => {
      return () => {
        if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
      };
    }, []);

    useEffect(() => {
      function handleKey(e: KeyboardEvent) {
        if (e.key === "Escape" && openCategory) {
          setOpenCategory(null);
        }
      }
      document.addEventListener("keydown", handleKey);
      return () => document.removeEventListener("keydown", handleKey);
    }, [openCategory]);

    const handleCategoryHover = useCallback(
      (catId: string) => {
        if (!catId) {
          cancelPending();
          setOpenCategory(null);
          return;
        }
        cancelClose();

        if (openCategory && openCategory !== catId) {
          interceptHover(() => setOpenCategory(catId));
        } else {
          setOpenCategory(catId);
        }
      },
      [openCategory, cancelClose, cancelPending, interceptHover],
    );

    const dismissSliver = useCallback(() => setOpenCategory(null), []);

    const widthPx = isCollapsedDesktop ? W_COLLAPSED : W_EXPANDED;

    const cls = [
      styles.root,
      isCollapsedDesktop && styles.collapsed,
      mobileOpen && styles.mobileOpen,
      className,
    ]
      .filter(Boolean)
      .join(" ");

    return (
      <SliverContext.Provider
        value={{
          openCategory,
          handleCategoryHover,
          dismissSliver,
          isMobile,
          isCollapsedDesktop,
        }}
      >
        {mobileOpen && (
          <div className={styles.backdrop} onClick={closeMobile} />
        )}

        <div
          className={styles.spacer}
          style={{ width: widthPx }}
        />

        <aside
          ref={ref}
          data-vertical-nav
          onMouseEnter={cancelClose}
          onMouseLeave={scheduleClose}
          className={cls}
          {...rest}
        >
          {children}
        </aside>

        {!isMobile && displayedCategory && (
          <SliverPortal
            ref={sliverRef}
            categoryId={displayedCategory}
            visible={openCategory !== null}
            sidebarCollapsed={isCollapsedDesktop}
            onMouseEnter={cancelClose}
            onMouseLeave={scheduleClose}
          />
        )}
      </SliverContext.Provider>
    );
  },
);

VerticalNav.displayName = "VerticalNav";

// ── Header ───────────────────────────────────────────────────────────────────

export interface VerticalNavHeaderProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export const VerticalNavHeader = forwardRef<
  HTMLDivElement,
  VerticalNavHeaderProps
>(({ children, className, ...rest }, ref) => {
  const { dismissSliver } = useContext(SliverContext);

  return (
    <div
      ref={ref}
      onMouseEnter={dismissSliver}
      className={[styles.header, className].filter(Boolean).join(" ")}
      {...rest}
    >
      {children}
    </div>
  );
});

VerticalNavHeader.displayName = "VerticalNavHeader";

// ── Content (scrollable middle) ──────────────────────────────────────────────

export interface VerticalNavContentProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export const VerticalNavContent = forwardRef<
  HTMLDivElement,
  VerticalNavContentProps
>(({ children, className, ...rest }, ref) => {
  return (
    <div
      ref={ref}
      className={[styles.content, className].filter(Boolean).join(" ")}
      {...rest}
    >
      <nav className={styles.contentNav}>{children}</nav>
    </div>
  );
});

VerticalNavContent.displayName = "VerticalNavContent";

// ── Footer ───────────────────────────────────────────────────────────────────

export interface VerticalNavFooterProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export const VerticalNavFooter = forwardRef<
  HTMLDivElement,
  VerticalNavFooterProps
>(({ children, className, ...rest }, ref) => {
  const { dismissSliver } = useContext(SliverContext);

  return (
    <div
      ref={ref}
      onMouseEnter={dismissSliver}
      className={[styles.footer, className].filter(Boolean).join(" ")}
      {...rest}
    >
      {children}
    </div>
  );
});

VerticalNavFooter.displayName = "VerticalNavFooter";

// ── Section ──────────────────────────────────────────────────────────────────

export interface VerticalNavSectionProps extends HTMLAttributes<HTMLDivElement> {
  label: string;
  children?: ReactNode;
}

export const VerticalNavSection = forwardRef<
  HTMLDivElement,
  VerticalNavSectionProps
>(({ label, children, className, ...rest }, ref) => {
  const { isCollapsedDesktop } = useContext(SliverContext);

  return (
    <div ref={ref} className={className} {...rest}>
      <div className={styles.sectionDivider}>
        {isCollapsedDesktop ? (
          <div className={styles.sectionRule} />
        ) : (
          <span className={styles.sectionLabel}>{label}</span>
        )}
      </div>
      {children}
    </div>
  );
});

VerticalNavSection.displayName = "VerticalNavSection";

// ── Group (sub-header within a category sliver) ──────────────────────────────

export interface VerticalNavGroupProps extends HTMLAttributes<HTMLDivElement> {
  label: string;
  children: ReactNode;
}

export const VerticalNavGroup = forwardRef<
  HTMLDivElement,
  VerticalNavGroupProps
>(({ label, children, className, ...rest }, ref) => {
  return (
    <div ref={ref} className={className} {...rest}>
      <div className={styles.groupHeader}>
        <span className={styles.groupLabel}>{label}</span>
      </div>
      {children}
    </div>
  );
});

VerticalNavGroup.displayName = "VerticalNavGroup";

// ── Category ─────────────────────────────────────────────────────────────────

export interface VerticalNavCategoryProps {
  id: string;
  label: string;
  icon: ReactNode;
  active?: boolean;
  disabled?: boolean;
  children?: ReactNode;
  sliverContent?: ReactNode;
}

export function VerticalNavCategory({
  id,
  label,
  icon,
  active = false,
  disabled = false,
  children,
  sliverContent,
}: VerticalNavCategoryProps) {
  const {
    openCategory,
    handleCategoryHover,
    isMobile,
    isCollapsedDesktop,
  } = useContext(SliverContext);

  const isEmpty = !sliverContent && !children;
  const isOpen = !isMobile && openCategory === id;

  const [mobileExpanded, setMobileExpanded] = useState(false);

  function handleClick() {
    if (isEmpty || disabled) return;
    if (isMobile) {
      setMobileExpanded((prev) => !prev);
    } else {
      handleCategoryHover(id);
    }
  }

  function handleMouseEnter() {
    if (!isMobile && !isEmpty && !disabled) {
      handleCategoryHover(id);
    }
  }

  const chevron = !isCollapsedDesktop && !isEmpty ? (
    <svg
      className={[
        navItemStyles.chevron,
        (isMobile ? mobileExpanded : isOpen) && navItemStyles.chevronExpanded,
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
  ) : undefined;

  return (
    <div data-category-id={id}>
      <NavItem
        icon={icon}
        size="md"
        active={active}
        activeAppearance="brand"
        expanded={!active && isOpen}
        collapsed={isCollapsedDesktop}
        disabled={disabled}
        trailing={chevron}
        onClick={handleClick}
        onMouseEnter={handleMouseEnter}
        aria-expanded={isMobile ? mobileExpanded : isOpen}
        className={styles.categoryItem}
      >
        {label}
      </NavItem>

      {isMobile && (children || sliverContent) && (
        <NavItemChildren expanded={mobileExpanded}>
          {sliverContent ?? children}
        </NavItemChildren>
      )}
    </div>
  );
}

VerticalNavCategory.displayName = "VerticalNavCategory";

// ── Sliver Renderer ──────────────────────────────────────────────────────────

export interface VerticalNavSliverProps {
  label: string;
  children: ReactNode;
}

export function VerticalNavSliver({ label, children }: VerticalNavSliverProps) {
  return (
    <>
      <div className={styles.sliverHeader}>
        <span className={styles.sliverTitle}>{label}</span>
      </div>
      <nav className={styles.sliverNav}>{children}</nav>
    </>
  );
}

VerticalNavSliver.displayName = "VerticalNavSliver";

// ── Sliver Registry (internal) ───────────────────────────────────────────────
// Categories register their sliver content via context so the portal can
// render the correct content for the currently open category.

const SliverRegistryContext = createContext<Map<string, ReactNode>>(new Map());

export function VerticalNavSliverRegistry({
  children,
  slots,
}: {
  children: ReactNode;
  slots: Map<string, ReactNode>;
}) {
  return (
    <SliverRegistryContext.Provider value={slots}>
      {children}
    </SliverRegistryContext.Provider>
  );
}

// ── Sliver Portal (internal) ─────────────────────────────────────────────────

interface SliverPortalProps {
  categoryId: string;
  visible: boolean;
  sidebarCollapsed: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}

const SliverPortal = forwardRef<HTMLDivElement, SliverPortalProps>(
  (
    { categoryId, visible, sidebarCollapsed, onMouseEnter, onMouseLeave },
    ref,
  ) => {
    const [mounted, setMounted] = useState(false);
    const registry = useContext(SliverRegistryContext);

    useEffect(() => {
      setMounted(true);
    }, []);

    if (!mounted) return null;

    const content = registry.get(categoryId);
    if (!content) return null;

    const leftOffset = sidebarCollapsed ? W_COLLAPSED : W_EXPANDED;

    return createPortal(
      <div
        ref={ref}
        data-vertical-nav-sliver
        data-category={categoryId}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        className={[
          styles.sliver,
          visible ? styles.sliverVisible : styles.sliverHidden,
        ].join(" ")}
        style={{ left: leftOffset }}
      >
        {content}
      </div>,
      document.body,
    );
  },
);

SliverPortal.displayName = "SliverPortal";

// ── Exports ──────────────────────────────────────────────────────────────────

export {
  W_EXPANDED as VERTICAL_NAV_WIDTH_EXPANDED,
  W_COLLAPSED as VERTICAL_NAV_WIDTH_COLLAPSED,
};
