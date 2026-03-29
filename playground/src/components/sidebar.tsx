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
  GripVertical,
  RectangleHorizontal,
  Square,
  Tag,
  SeparatorHorizontal,
  CircleUser,
  FormInput,
  AlignLeft,
  ListFilter,
  CheckSquare,
  ToggleRight,
  MessageSquare,
  PanelTopOpen,
  LayoutList,
  BellRing,
  Shapes,
  Compass,
  Table2,
  Paintbrush,
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
import { createPortal } from "react-dom";
import Fuse from "fuse.js";

// ── Constants ────────────────────────────────────────────────────────────────

const W_EXPANDED = "w-[200px]";
const W_COLLAPSED = "w-[41px]";

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
  group?: string;
};

type NavCategory = {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  links: NavLink[];
  section?: string;
  href?: string;
};

const componentCategories: NavCategory[] = [
  {
    id: "overview",
    label: "Overview",
    icon: Home,
    section: "Foundations",
    href: "/",
    links: [],
  },
  {
    id: "tokens",
    label: "Styles",
    icon: Paintbrush,
    section: "Foundations",
    links: [
      { href: "/tokens/colors", label: "Colors", icon: Palette },
      { href: "/tokens/typography", label: "Typography", icon: Type },
      { href: "/tokens/spacing", label: "Spacing", icon: Ruler },
      { href: "/tokens/motion", label: "Motion", icon: Zap },
      { href: "/tokens/elevation", label: "Elevation", icon: Layers },
    ],
  },
  {
    id: "base",
    label: "Base",
    icon: Shapes,
    section: "Components",
    links: [
      { href: "/components/button", label: "Button", icon: Square },
      { href: "/components/badge", label: "Badge", icon: Tag },
      { href: "/components/avatar", label: "Avatar", icon: CircleUser },
      { href: "/components/card", label: "Card", icon: RectangleHorizontal },
      {
        href: "/components/divider",
        label: "Divider",
        icon: SeparatorHorizontal,
      },
    ],
  },
  {
    id: "forms",
    label: "Forms & Controls",
    icon: TextCursorInput,
    section: "Components",
    links: [
      { href: "/components/input", label: "Input", icon: FormInput },
      { href: "/components/textarea", label: "Textarea", icon: AlignLeft },
      { href: "/components/select", label: "Select", icon: ListFilter },
      { href: "/components/checkbox", label: "Checkbox", icon: CheckSquare },
      { href: "/components/toggle", label: "Toggle", icon: ToggleRight },
      {
        href: "/components/theme-toggle",
        label: "ThemeToggle",
        icon: ToggleLeft,
      },
    ],
  },
  {
    id: "feedback",
    label: "Feedback & Overlay",
    icon: Bell,
    section: "Components",
    links: [
      { href: "/components/toast", label: "Toast", icon: BellRing },
      { href: "/components/dialog", label: "Dialog", icon: PanelTopOpen },
      { href: "/components/tooltip", label: "Tooltip", icon: MessageSquare },
    ],
  },
  {
    id: "nav-menus",
    label: "Navigation & Menus",
    icon: Compass,
    section: "Components",
    links: [
      {
        href: "/components/dropdown-menu",
        label: "DropdownMenu",
        icon: ListFilter,
      },
      { href: "/components/tabs", label: "Tabs", icon: LayoutList },
    ],
  },
  {
    id: "data-display",
    label: "Data Display",
    icon: Table2,
    section: "Components",
    links: [],
  },
  {
    id: "layout",
    label: "Layout & Shell",
    icon: PanelTop,
    section: "Components",
    links: [
      {
        href: "/components/navigation",
        label: "Navigation",
        icon: Navigation,
      },
      { href: "/components/footer", label: "Footer", icon: PanelBottom },
    ],
  },
  {
    id: "content",
    label: "Content & Media",
    icon: Newspaper,
    section: "Components",
    links: [
      { href: "/components/marquee", label: "Marquee", icon: Repeat },
    ],
  },
  {
    id: "entrance",
    label: "Entrance & Reveal",
    icon: Sparkles,
    section: "Components",
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
    section: "Components",
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
      {
        href: "/components/scroll-spy",
        label: "ScrollSpy",
        icon: GripVertical,
      },
    ],
  },
];

// ── Search Index ─────────────────────────────────────────────────────────────

type SearchItem = NavLink & { section: string };

const allSearchableItems: SearchItem[] = [
  ...componentCategories.flatMap((cat) => {
    const items: SearchItem[] = [];
    if (cat.href) {
      items.push({
        href: cat.href,
        label: cat.label,
        icon: cat.icon,
        section: cat.section || "Pages",
      });
    }
    items.push(...cat.links.map((l) => ({ ...l, section: cat.label })));
    return items;
  }),
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
    if (cat.href === pathname) return cat.id;
    if (cat.links.some((l) => l.href === pathname)) return cat.id;
  }
  return null;
}

// ── Sidebar Search (collapsed: flyout, expanded: inline dropdown) ────────────

function SidebarSearch({
  collapsed,
  onNavigate,
  onMouseEnter,
}: {
  collapsed: boolean;
  onNavigate?: () => void;
  onMouseEnter?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const flyoutRef = useRef<HTMLDivElement>(null);

  const results = useMemo(() => {
    if (!query.trim()) return [];
    return fuseInstance.search(query).slice(0, 8);
  }, [query]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [results]);

  useEffect(() => {
    setOpen(false);
    setQuery("");
  }, [collapsed]);

  useEffect(() => {
    if (open) {
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      const target = e.target as Node;
      if (containerRef.current?.contains(target)) return;
      if (flyoutRef.current?.contains(target)) return;
      setOpen(false);
      setQuery("");
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen(true);
      }
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, []);

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Escape") {
      e.preventDefault();
      setOpen(false);
      setQuery("");
      return;
    }
    if (results.length === 0) return;
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
    setOpen(false);
    onNavigate?.();
  }

  const showResults = query.trim().length > 0;

  const resultsDropdown = showResults && (
    <div className="max-h-[50vh] overflow-y-auto p-1">
      {results.length === 0 ? (
        <div className="px-3 py-4 text-center text-[12px] text-sidebar-muted-foreground/50">
          No results for &ldquo;{query}&rdquo;
        </div>
      ) : (
        results.map((r, idx) => {
          const Icon = r.item.icon;
          return (
            <button
              key={r.item.href}
              className={cn(
                "flex items-center gap-2 w-full px-2 h-7 rounded-sm text-[12px] transition-colors text-left",
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
        })
      )}
    </div>
  );

  if (collapsed) {
    return (
      <div ref={containerRef} onMouseEnter={onMouseEnter} className="shrink-0 pt-2 px-1.5">
        <button
          onClick={() => setOpen(!open)}
          className="flex items-center pl-[7px] h-7 rounded-sm text-sidebar-muted-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-foreground transition-colors"
          title="Search (⌘K)"
        >
          <Search className="w-3.5 h-3.5" />
        </button>
        {open &&
          createPortal(
            <div
              ref={flyoutRef}
              className="fixed top-[56px] left-[41px] z-50 w-[200px] bg-sidebar border border-sidebar-border rounded-sm shadow-2xl overflow-hidden"
            >
              <div className="relative p-1.5">
                <Search className="absolute left-[14px] top-1/2 -translate-y-1/2 w-3 h-3 text-sidebar-muted-foreground pointer-events-none" />
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Search…"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="w-full h-7 pl-6 pr-2 text-[12px] bg-sidebar-muted/50 rounded-sm border border-accent/50 text-sidebar-foreground placeholder:text-sidebar-muted-foreground/50 focus:outline-none transition-colors"
                />
              </div>
              {resultsDropdown}
            </div>,
            document.body
          )}
      </div>
    );
  }

  return (
    <div ref={containerRef} onMouseEnter={onMouseEnter} className="shrink-0 pt-2 relative px-1.5">
      {!open ? (
        <button
          onClick={() => setOpen(true)}
          title="Search (⌘K)"
          className="flex items-center gap-2 w-full h-7 px-2 rounded-sm text-[12px] bg-sidebar-muted/50 border border-sidebar-border/50 text-sidebar-muted-foreground/50 hover:border-accent/50 hover:text-sidebar-muted-foreground transition-colors"
        >
          <Search className="w-3 h-3 shrink-0" />
          <span className="flex-1 text-left">Search…</span>
          <kbd className="text-[10px] font-medium">⌘K</kbd>
        </button>
      ) : (
        <>
          <div className="relative">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-sidebar-muted-foreground pointer-events-none" />
            <input
              ref={inputRef}
              type="text"
              placeholder="Search…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full h-7 pl-6 pr-2 text-[12px] bg-sidebar-muted/50 rounded-sm border border-accent/50 text-sidebar-foreground placeholder:text-sidebar-muted-foreground/50 focus:outline-none transition-colors"
            />
          </div>
          {showResults && (
            <div className="absolute left-1.5 right-1.5 top-[calc(100%-2px)] z-50 bg-sidebar border border-sidebar-border rounded-sm shadow-lg overflow-hidden">
              {results.length === 0 ? (
                <div className="px-3 py-4 text-center text-[12px] text-sidebar-muted-foreground/50">
                  No results for &ldquo;{query}&rdquo;
                </div>
              ) : (
                results.map((r, idx) => {
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
                })
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ── Link rendering with optional group sub-headers ───────────────────────────

function renderLinksWithGroups(
  links: NavLink[],
  pathname: string,
  onNavigate?: () => void
) {
  let lastGroup: string | undefined;

  return links.map((link) => {
    const LinkIcon = link.icon;
    const isLinkActive = pathname === link.href;
    const showGroupHeader = link.group && link.group !== lastGroup;
    if (link.group) lastGroup = link.group;

    return (
      <div key={link.href}>
        {showGroupHeader && (
          <div className="px-2 pt-2 pb-0.5">
            <span className="text-[9px] font-medium tracking-[0.1em] uppercase text-sidebar-muted-foreground/40">
              {link.group}
            </span>
          </div>
        )}
        <Link
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
      </div>
    );
  });
}

// ── Categories Section (unified tokens + components with section dividers) ───

function CategoriesSection({
  pathname,
  collapsed,
  isMobile,
  openCategory,
  onCategoryClick,
  onCategoryHover,
  onNavigate,
}: {
  pathname: string;
  collapsed: boolean;
  isMobile: boolean;
  openCategory: string | null;
  onCategoryClick: (categoryId: string) => void;
  onCategoryHover: (categoryId: string) => void;
  onNavigate?: () => void;
}) {
  const activeCategory = getCategoryForPath(pathname);
  const [mobileExpanded, setMobileExpanded] = useState<string | null>(null);

  function handleCategoryClick(catId: string) {
    if (isMobile) {
      setMobileExpanded((prev) => (prev === catId ? null : catId));
    } else {
      onCategoryHover(catId);
    }
  }

  let lastSection: string | undefined;

  return (
    <div>
      <nav className="space-y-px">
        {componentCategories.map((cat) => {
          const Icon = cat.icon;
          const isCatActive = activeCategory === cat.id;
          const isOpen =
            isMobile ? mobileExpanded === cat.id : openCategory === cat.id;
          const isEmpty = cat.links.length === 0;
          const isDirectLink = !!cat.href;
          const isDirectActive = isDirectLink && pathname === cat.href;

          const showSectionDivider =
            cat.section && cat.section !== lastSection;
          if (cat.section) lastSection = cat.section;

          return (
            <div key={cat.id}>
              {showSectionDivider && (
                <div className="h-6 flex items-center">
                  {collapsed ? (
                    <div className="w-full border-t border-sidebar-border" />
                  ) : (
                    <span className="px-2 text-[9px] font-medium tracking-[0.12em] uppercase text-sidebar-muted-foreground/50">
                      {cat.section}
                    </span>
                  )}
                </div>
              )}
              {isDirectLink ? (
                <Link
                  href={cat.href!}
                  onClick={onNavigate}
                  onMouseEnter={() => !isMobile && onCategoryHover("")}
                  title={collapsed ? cat.label : undefined}
                  className={cn(
                    "flex items-center h-7 rounded-sm transition-colors w-full",
                    collapsed ? "pl-[7px]" : "gap-2 px-2 text-[13px]",
                    isDirectActive
                      ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                      : "text-sidebar-muted-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                  )}
                >
                  <Icon className="w-3.5 h-3.5 shrink-0" />
                  {!collapsed && (
                    <span className="flex-1 text-left truncate">
                      {cat.label}
                    </span>
                  )}
                </Link>
              ) : (
                <button
                  onClick={() => !isEmpty && handleCategoryClick(cat.id)}
                  onMouseEnter={() =>
                    !isMobile && !isEmpty && onCategoryHover(cat.id)
                  }
                  title={collapsed ? cat.label : undefined}
                  disabled={isEmpty}
                  className={cn(
                    "flex items-center h-7 rounded-sm transition-colors w-full",
                    collapsed
                      ? "pl-[7px]"
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
              )}

              {isMobile && isOpen && !isDirectLink && (
                <div className="pl-4 space-y-px">
                  {renderLinksWithGroups(cat.links, pathname, onNavigate)}
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
  visible,
  onMouseEnter,
  onMouseLeave,
  onNavigate,
}: {
  category: NavCategory;
  pathname: string;
  sidebarCollapsed: boolean;
  visible: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onNavigate?: () => void;
}) {
  return (
    <div
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className={cn(
        "fixed top-0 h-screen w-[200px] z-[29] bg-sidebar border-r border-sidebar-border shadow-lg",
        "transition-transform duration-200 ease-out",
        visible
          ? "translate-x-0"
          : "-translate-x-full pointer-events-none",
        sidebarCollapsed ? "left-[41px]" : "left-[200px]"
      )}
    >
      <div className="flex items-center h-12 px-3 border-b border-sidebar-border">
        <span className="text-[12px] font-medium text-sidebar-foreground">
          {category.label}
        </span>
      </div>
      <nav className="p-1.5 space-y-px">
        {renderLinksWithGroups(category.links, pathname, onNavigate)}
      </nav>
    </div>
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
  const [displayedCategory, setDisplayedCategory] = useState<string | null>(
    null
  );
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const closeMobile = useCallback(() => setMobileOpen(false), [setMobileOpen]);

  const isCollapsedDesktop = collapsed && !mobileOpen;
  const isMobile = mobileOpen;

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
    closeMobile();
    setOpenCategory(null);
  }, [pathname, closeMobile]);

  useEffect(() => {
    setOpenCategory(null);
  }, [collapsed]);

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

  const widthClass = isCollapsedDesktop ? W_COLLAPSED : W_EXPANDED;

  function handleCategoryClick(catId: string) {
    setOpenCategory((prev) => (prev === catId ? null : catId));
  }

  function handleCategoryHover(catId: string) {
    if (!catId) {
      setOpenCategory(null);
      return;
    }
    cancelClose();
    setOpenCategory(catId);
  }

  const sliverCategoryData = displayedCategory
    ? componentCategories.find((c) => c.id === displayedCategory) ?? null
    : null;

  return (
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/40 lg:hidden"
          onClick={closeMobile}
        />
      )}

      <div
        className={cn(
          "hidden lg:block shrink-0 transition-[width] duration-200 ease-in-out",
          widthClass
        )}
      />

      <aside
        data-sidebar
        onMouseEnter={cancelClose}
        onMouseLeave={scheduleClose}
        className={cn(
          "fixed top-0 left-0 z-30 flex flex-col h-screen border-r bg-sidebar text-sidebar-foreground border-sidebar-border transition-[width] duration-200 ease-in-out overflow-hidden",
          "lg:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
          mobileOpen && collapsed ? W_EXPANDED : widthClass
        )}
      >
        {/* Header */}
        <div
          onMouseEnter={() => setOpenCategory(null)}
          className={cn(
            "flex items-center h-12 border-b border-sidebar-border shrink-0",
            isCollapsedDesktop ? "px-1.5" : "justify-between px-4"
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
              className="flex items-center pl-[7px] h-7 rounded-sm hover:bg-sidebar-accent/50 text-sidebar-muted-foreground hover:text-sidebar-foreground transition-colors"
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

        {/* Search */}
        <SidebarSearch
          collapsed={isCollapsedDesktop}
          onNavigate={closeMobile}
          onMouseEnter={() => setOpenCategory(null)}
        />

        {/* Scrollable nav */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden pb-4 px-1.5">
          <CategoriesSection
            pathname={pathname}
            collapsed={isCollapsedDesktop}
            isMobile={isMobile}
            openCategory={openCategory}
            onCategoryClick={handleCategoryClick}
            onCategoryHover={handleCategoryHover}
            onNavigate={closeMobile}
          />
        </div>

        {/* Bottom — Archive pinned (h-11 matches page footer) */}
        <div className="shrink-0 h-11 flex items-center border-t border-sidebar-border px-1.5">
          <Link
            href="/archive"
            onClick={closeMobile}
            onMouseEnter={() => setOpenCategory(null)}
            title={isCollapsedDesktop ? "Archive" : undefined}
            className={cn(
              "flex items-center h-7 rounded-sm transition-colors",
              isCollapsedDesktop
                ? "pl-[7px]"
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

      {!isMobile && sliverCategoryData && (
        <CategorySliver
          category={sliverCategoryData}
          pathname={pathname}
          sidebarCollapsed={isCollapsedDesktop}
          visible={openCategory !== null}
          onMouseEnter={cancelClose}
          onMouseLeave={scheduleClose}
          onNavigate={() => setOpenCategory(null)}
        />
      )}

    </>
  );
}
