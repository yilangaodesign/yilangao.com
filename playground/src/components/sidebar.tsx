"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Palette,
  Type,
  Zap,
  Layers,
  Navigation,
  PanelBottom,
  ToggleLeft,
  MousePointerClick,
  Home,
  Ruler,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  Archive,
  Play,
  ChevronsUpDown,
  ArrowRight,
  Repeat,
  Search,
  PanelTop,
  Sparkles,
  MousePointer2,
  Newspaper,
  TextCursorInput,
  Bell,
  ChevronRight,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
  useMemo,
} from "react";
import Fuse from "fuse.js";

// ── Constants ────────────────────────────────────────────────────────────────

const W_EXPANDED = "w-[200px]";
const W_COLLAPSED = "w-[40px]";

// ── Context ──────────────────────────────────────────────────────────────────

const SidebarContext = createContext<{
  mobileOpen: boolean;
  setMobileOpen: (v: boolean) => void;
  collapsed: boolean;
  setCollapsed: (v: boolean) => void;
}>({
  mobileOpen: false,
  setMobileOpen: () => {},
  collapsed: false,
  setCollapsed: () => {},
});

export function useSidebar() {
  return useContext(SidebarContext);
}

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  return (
    <SidebarContext.Provider
      value={{ mobileOpen, setMobileOpen, collapsed, setCollapsed }}
    >
      {children}
    </SidebarContext.Provider>
  );
}

// ── Navigation Data ──────────────────────────────────────────────────────────

type NavLink = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
};

type NavCategory = {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  links: NavLink[];
};

const tokenLinks: NavLink[] = [
  { href: "/tokens/colors", label: "Colors", icon: Palette },
  { href: "/tokens/typography", label: "Typography", icon: Type },
  { href: "/tokens/spacing", label: "Spacing", icon: Ruler },
  { href: "/tokens/motion", label: "Motion", icon: Zap },
  { href: "/tokens/elevation", label: "Elevation", icon: Layers },
];

const componentCategories: NavCategory[] = [
  {
    id: "layout",
    label: "Layout & Shell",
    icon: PanelTop,
    links: [
      { href: "/components/navigation", label: "Navigation", icon: Navigation },
      { href: "/components/footer", label: "Footer", icon: PanelBottom },
    ],
  },
  {
    id: "entrance",
    label: "Entrance & Reveal",
    icon: Sparkles,
    links: [
      {
        href: "/components/fade-in",
        label: "FadeIn & Stagger",
        icon: MousePointerClick,
      },
      {
        href: "/components/mount-entrance",
        label: "MountEntrance",
        icon: Play,
      },
    ],
  },
  {
    id: "interaction",
    label: "Interaction",
    icon: MousePointer2,
    links: [
      {
        href: "/components/expand-collapse",
        label: "ExpandCollapse",
        icon: ChevronsUpDown,
      },
      {
        href: "/components/arrow-reveal",
        label: "ArrowReveal",
        icon: ArrowRight,
      },
    ],
  },
  {
    id: "content",
    label: "Content & Media",
    icon: Newspaper,
    links: [
      { href: "/components/marquee", label: "Marquee", icon: Repeat },
    ],
  },
  {
    id: "form",
    label: "Form & Input",
    icon: TextCursorInput,
    links: [
      {
        href: "/components/theme-toggle",
        label: "ThemeToggle",
        icon: ToggleLeft,
      },
    ],
  },
  {
    id: "feedback",
    label: "Feedback",
    icon: Bell,
    links: [],
  },
];

// ── Search Index ─────────────────────────────────────────────────────────────

type SearchItem = NavLink & { section: string };

const allSearchableItems: SearchItem[] = [
  { href: "/", label: "Overview", icon: Home, section: "Pages" },
  ...tokenLinks.map((l) => ({ ...l, section: "Tokens" })),
  ...componentCategories.flatMap((cat) =>
    cat.links.map((l) => ({ ...l, section: cat.label }))
  ),
  { href: "/archive", label: "Archive", icon: Archive, section: "Pages" },
];

const fuseInstance = new Fuse(allSearchableItems, {
  keys: ["label", "section"],
  threshold: 0.4,
  includeScore: true,
});

// ── Helpers ──────────────────────────────────────────────────────────────────

function getCategoryForPath(pathname: string): string | null {
  for (const cat of componentCategories) {
    if (cat.links.some((l) => l.href === pathname)) return cat.id;
  }
  return null;
}

// ── Search Component ─────────────────────────────────────────────────────────

function SidebarSearch({
  collapsed,
  onNavigate,
  onExpandSidebar,
  focusRequested,
  onFocusHandled,
}: {
  collapsed: boolean;
  onNavigate?: () => void;
  onExpandSidebar?: () => void;
  focusRequested: boolean;
  onFocusHandled: () => void;
}) {
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const results = useMemo(() => {
    if (!query.trim()) return [];
    return fuseInstance.search(query).slice(0, 8);
  }, [query]);

  const showDropdown =
    focused && query.trim().length > 0 && results.length > 0;

  useEffect(() => {
    setSelectedIndex(0);
  }, [results]);

  useEffect(() => {
    if (focusRequested && !collapsed && inputRef.current) {
      inputRef.current.focus();
      onFocusHandled();
    }
  }, [focusRequested, collapsed, onFocusHandled]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setFocused(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Escape") {
      e.stopPropagation();
      setFocused(false);
      setQuery("");
      inputRef.current?.blur();
      return;
    }
    if (!showDropdown) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && results[selectedIndex]) {
      e.preventDefault();
      navigateTo(results[selectedIndex].item.href);
    }
  }

  function navigateTo(href: string) {
    router.push(href);
    setQuery("");
    setFocused(false);
    onNavigate?.();
  }

  if (collapsed) {
    return (
      <div className="px-1.5 pb-1">
        <button
          onClick={onExpandSidebar}
          className="flex items-center justify-center w-7 h-7 mx-auto rounded-sm text-sidebar-muted-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-foreground transition-colors"
          title="Search (⌘K)"
        >
          <Search className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative px-1.5 pb-1">
      <div className="relative">
        <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-sidebar-muted-foreground pointer-events-none" />
        <input
          ref={inputRef}
          type="text"
          placeholder="Search… ⌘K"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          onKeyDown={handleKeyDown}
          className="w-full h-7 pl-6 pr-2 text-[12px] bg-sidebar-muted/50 rounded-sm border border-sidebar-border/50 text-sidebar-foreground placeholder:text-sidebar-muted-foreground/50 focus:outline-none focus:border-accent/50 transition-colors"
        />
      </div>

      {showDropdown && (
        <div className="absolute left-1.5 right-1.5 top-[calc(100%-2px)] z-50 bg-sidebar border border-sidebar-border rounded-sm shadow-lg overflow-hidden">
          {results.map((r, idx) => {
            const Icon = r.item.icon;
            return (
              <button
                key={r.item.href}
                className={cn(
                  "flex items-center gap-2 w-full px-2 h-7 text-[12px] transition-colors text-left",
                  idx === selectedIndex
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent/50"
                )}
                onMouseEnter={() => setSelectedIndex(idx)}
                onClick={() => navigateTo(r.item.href)}
              >
                <Icon className="w-3 h-3 shrink-0 text-sidebar-muted-foreground" />
                <span className="truncate flex-1">{r.item.label}</span>
                <span className="text-[10px] text-sidebar-muted-foreground/50 shrink-0">
                  {r.item.section}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Tokens Section (flat — stable, small count) ──────────────────────────────

function TokensSection({
  pathname,
  collapsed,
  onNavigate,
}: {
  pathname: string;
  collapsed: boolean;
  onNavigate?: () => void;
}) {
  return (
    <div>
      <div className="h-6 flex items-center">
        {collapsed ? (
          <div className="w-full border-t border-sidebar-border" />
        ) : (
          <span className="px-2 text-[9px] font-medium tracking-[0.12em] uppercase text-sidebar-muted-foreground/50">
            Tokens
          </span>
        )}
      </div>
      <nav className="space-y-px">
        {tokenLinks.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              onClick={onNavigate}
              title={collapsed ? link.label : undefined}
              className={cn(
                "flex items-center h-7 rounded-sm transition-colors",
                collapsed
                  ? "justify-center w-7 mx-auto"
                  : "gap-2 px-2 text-[13px]",
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                  : "text-sidebar-muted-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
              )}
            >
              <Icon className="w-3.5 h-3.5 shrink-0" />
              {!collapsed && link.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

// ── Components Section (categorized with sliver/inline expansion) ────────────

function ComponentsSection({
  pathname,
  collapsed,
  isMobile,
  openCategory,
  onCategoryClick,
  onNavigate,
}: {
  pathname: string;
  collapsed: boolean;
  isMobile: boolean;
  openCategory: string | null;
  onCategoryClick: (categoryId: string) => void;
  onNavigate?: () => void;
}) {
  const activeCategory = getCategoryForPath(pathname);
  const [mobileExpanded, setMobileExpanded] = useState<string | null>(null);

  function handleCategoryClick(catId: string) {
    if (isMobile) {
      setMobileExpanded((prev) => (prev === catId ? null : catId));
    } else {
      onCategoryClick(catId);
    }
  }

  return (
    <div>
      <div className="h-6 flex items-center">
        {collapsed ? (
          <div className="w-full border-t border-sidebar-border" />
        ) : (
          <span className="px-2 text-[9px] font-medium tracking-[0.12em] uppercase text-sidebar-muted-foreground/50">
            Components
          </span>
        )}
      </div>
      <nav className="space-y-px">
        {componentCategories.map((cat) => {
          const Icon = cat.icon;
          const isCatActive = activeCategory === cat.id;
          const isOpen =
            isMobile ? mobileExpanded === cat.id : openCategory === cat.id;
          const isEmpty = cat.links.length === 0;

          return (
            <div key={cat.id}>
              <button
                onClick={() => !isEmpty && handleCategoryClick(cat.id)}
                title={collapsed ? cat.label : undefined}
                disabled={isEmpty}
                className={cn(
                  "flex items-center h-7 rounded-sm transition-colors w-full",
                  collapsed
                    ? "justify-center w-7 mx-auto"
                    : "gap-2 px-2 text-[13px]",
                  isEmpty && "opacity-30 cursor-not-allowed",
                  isOpen
                    ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                    : isCatActive && !isEmpty
                      ? "text-accent font-medium"
                      : "text-sidebar-muted-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                )}
              >
                <Icon className="w-3.5 h-3.5 shrink-0" />
                {!collapsed && (
                  <>
                    <span className="flex-1 text-left truncate">
                      {cat.label}
                    </span>
                    {!isEmpty && (
                      <ChevronRight
                        className={cn(
                          "w-3 h-3 shrink-0 transition-transform duration-150",
                          isMobile && isOpen && "rotate-90"
                        )}
                      />
                    )}
                  </>
                )}
              </button>

              {/* Mobile: inline expansion */}
              {isMobile && isOpen && (
                <div className="pl-4 space-y-px">
                  {cat.links.map((link) => {
                    const LinkIcon = link.icon;
                    const isLinkActive = pathname === link.href;
                    return (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={onNavigate}
                        className={cn(
                          "flex items-center gap-2 h-7 px-2 rounded-sm text-[13px] transition-colors",
                          isLinkActive
                            ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                            : "text-sidebar-muted-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                        )}
                      >
                        <LinkIcon className="w-3.5 h-3.5 shrink-0" />
                        {link.label}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>
    </div>
  );
}

// ── Category Sliver (desktop flyout panel) ───────────────────────────────────

function CategorySliver({
  category,
  pathname,
  sidebarCollapsed,
  onClose,
}: {
  category: NavCategory;
  pathname: string;
  sidebarCollapsed: boolean;
  onClose: () => void;
}) {
  return (
    <>
      {/* Click-away backdrop — z-28, below sidebar (z-30) and sliver (z-29) */}
      <div className="fixed inset-0 z-[28]" onClick={onClose} />

      {/* Panel */}
      <div
        className={cn(
          "fixed top-0 h-screen w-[200px] z-[29] bg-sidebar border-r border-sidebar-border shadow-lg",
          sidebarCollapsed ? "left-[40px]" : "left-[200px]"
        )}
      >
        <div className="flex items-center justify-between h-12 px-3 border-b border-sidebar-border">
          <span className="text-[12px] font-medium text-sidebar-foreground">
            {category.label}
          </span>
          <button
            onClick={onClose}
            className="flex items-center justify-center w-6 h-6 rounded-sm hover:bg-sidebar-accent/50 text-sidebar-muted-foreground hover:text-sidebar-foreground transition-colors"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
        <nav className="p-1.5 space-y-px">
          {category.links.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "flex items-center gap-2 h-7 px-2 rounded-sm text-[13px] transition-colors",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                    : "text-sidebar-muted-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                )}
              >
                <Icon className="w-3.5 h-3.5 shrink-0" />
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </>
  );
}

// ── Mobile Menu Button ───────────────────────────────────────────────────────

export function MobileMenuButton() {
  const { mobileOpen, setMobileOpen } = useSidebar();
  return (
    <button
      onClick={() => setMobileOpen(!mobileOpen)}
      className="lg:hidden p-1.5 -ml-1.5 rounded-sm hover:bg-muted transition-colors"
      aria-label="Toggle sidebar"
    >
      <Menu className="w-5 h-5" />
    </button>
  );
}

// ── Main Sidebar ─────────────────────────────────────────────────────────────

export function Sidebar() {
  const pathname = usePathname();
  const { mobileOpen, setMobileOpen, collapsed, setCollapsed } = useSidebar();
  const [openCategory, setOpenCategory] = useState<string | null>(null);
  const [searchFocusRequested, setSearchFocusRequested] = useState(false);

  const closeMobile = useCallback(() => setMobileOpen(false), [setMobileOpen]);

  const isCollapsedDesktop = collapsed && !mobileOpen;
  const isMobile = mobileOpen;

  // Close sliver + mobile on route change
  useEffect(() => {
    closeMobile();
    setOpenCategory(null);
  }, [pathname, closeMobile]);

  // Global ⌘K to focus search
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        if (isCollapsedDesktop) setCollapsed(false);
        setSearchFocusRequested(true);
      }
      if (e.key === "Escape" && openCategory) {
        setOpenCategory(null);
      }
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [isCollapsedDesktop, setCollapsed, openCategory]);

  const widthClass = isCollapsedDesktop ? W_COLLAPSED : W_EXPANDED;

  function handleCategoryClick(catId: string) {
    setOpenCategory((prev) => (prev === catId ? null : catId));
  }

  const activeCategoryData = openCategory
    ? componentCategories.find((c) => c.id === openCategory) ?? null
    : null;

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/40 lg:hidden"
          onClick={closeMobile}
        />
      )}

      {/* Desktop: in-flow spacer that reserves sidebar width */}
      <div
        className={cn(
          "hidden lg:block shrink-0 transition-[width] duration-200 ease-in-out",
          widthClass
        )}
      />

      {/* The sidebar panel */}
      <aside
        data-sidebar
        className={cn(
          "fixed top-0 left-0 z-30 flex flex-col h-screen border-r bg-sidebar text-sidebar-foreground border-sidebar-border transition-[width] duration-200 ease-in-out overflow-hidden",
          "lg:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
          mobileOpen && collapsed ? W_EXPANDED : widthClass
        )}
      >
        {/* Header */}
        <div
          className={cn(
            "flex items-center h-12 border-b border-sidebar-border shrink-0",
            isCollapsedDesktop ? "justify-center" : "justify-between px-4"
          )}
        >
          {!isCollapsedDesktop && (
            <Link
              href="/"
              className="flex items-center gap-2.5 min-w-0"
              onClick={closeMobile}
            >
              <div className="flex items-center justify-center w-6 h-6 rounded-sm bg-accent text-accent-foreground text-[9px] font-bold shrink-0">
                DS
              </div>
              <span className="font-semibold text-[13px] whitespace-nowrap">
                Design System
              </span>
            </Link>
          )}
          {isCollapsedDesktop && (
            <button
              onClick={() => setCollapsed(false)}
              className="flex items-center justify-center w-7 h-7 rounded-sm hover:bg-sidebar-accent/50 text-sidebar-muted-foreground hover:text-sidebar-foreground transition-colors"
              aria-label="Expand sidebar"
            >
              <PanelLeftOpen className="w-3.5 h-3.5" />
            </button>
          )}
          {!isCollapsedDesktop && (
            <button
              onClick={() => {
                if (mobileOpen) {
                  closeMobile();
                } else {
                  setCollapsed(true);
                  setOpenCategory(null);
                }
              }}
              className="hidden lg:flex items-center justify-center w-8 h-8 rounded-sm hover:bg-sidebar-accent/50 text-sidebar-muted-foreground hover:text-sidebar-foreground transition-colors shrink-0"
              aria-label="Collapse sidebar"
            >
              <PanelLeftClose className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Search — pinned below header, above scrollable area */}
        <div className="shrink-0 pt-2">
          <SidebarSearch
            collapsed={isCollapsedDesktop}
            onNavigate={closeMobile}
            onExpandSidebar={() => setCollapsed(false)}
            focusRequested={searchFocusRequested}
            onFocusHandled={() => setSearchFocusRequested(false)}
          />
        </div>

        {/* Scrollable nav */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden pt-1 pb-4 px-1.5">
          {/* Overview */}
          <Link
            href="/"
            onClick={closeMobile}
            title={isCollapsedDesktop ? "Overview" : undefined}
            className={cn(
              "flex items-center h-7 rounded-sm transition-colors",
              isCollapsedDesktop
                ? "justify-center w-7 mx-auto"
                : "gap-2 px-2 text-[13px]",
              pathname === "/"
                ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                : "text-sidebar-muted-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
            )}
          >
            <Home className="w-3.5 h-3.5 shrink-0" />
            {!isCollapsedDesktop && "Overview"}
          </Link>

          {/* Tokens — flat list, small stable count */}
          <TokensSection
            pathname={pathname}
            collapsed={isCollapsedDesktop}
            onNavigate={closeMobile}
          />

          {/* Components — categorized */}
          <ComponentsSection
            pathname={pathname}
            collapsed={isCollapsedDesktop}
            isMobile={isMobile}
            openCategory={openCategory}
            onCategoryClick={handleCategoryClick}
            onNavigate={closeMobile}
          />
        </div>

        {/* Bottom — Archive pinned */}
        <div className="shrink-0 border-t border-sidebar-border px-1.5 py-2">
          <Link
            href="/archive"
            onClick={closeMobile}
            title={isCollapsedDesktop ? "Archive" : undefined}
            className={cn(
              "flex items-center h-7 rounded-sm transition-colors",
              isCollapsedDesktop
                ? "justify-center w-7 mx-auto"
                : "gap-2 px-2 text-[13px]",
              pathname === "/archive"
                ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                : "text-sidebar-muted-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
            )}
          >
            <Archive className="w-3.5 h-3.5 shrink-0" />
            {!isCollapsedDesktop && "Archive"}
          </Link>
        </div>
      </aside>

      {/* Category Sliver — desktop only, rendered outside sidebar for independent positioning */}
      {!isMobile && activeCategoryData && (
        <CategorySliver
          category={activeCategoryData}
          pathname={pathname}
          sidebarCollapsed={isCollapsedDesktop}
          onClose={() => setOpenCategory(null)}
        />
      )}
    </>
  );
}
