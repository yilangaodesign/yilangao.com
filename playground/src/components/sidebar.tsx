"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Palette from "lucide-react/dist/esm/icons/palette";
import Type from "lucide-react/dist/esm/icons/type";
import Zap from "lucide-react/dist/esm/icons/zap";
import Layers from "lucide-react/dist/esm/icons/layers";
import Navigation from "lucide-react/dist/esm/icons/navigation";
import PanelBottom from "lucide-react/dist/esm/icons/panel-bottom";
import ToggleLeft from "lucide-react/dist/esm/icons/toggle-left";
import MousePointerClick from "lucide-react/dist/esm/icons/mouse-pointer-click";
import Home from "lucide-react/dist/esm/icons/home";
import Ruler from "lucide-react/dist/esm/icons/ruler";
import Menu from "lucide-react/dist/esm/icons/menu";
import PanelLeftClose from "lucide-react/dist/esm/icons/panel-left-close";
import PanelLeftOpen from "lucide-react/dist/esm/icons/panel-left-open";
import Archive from "lucide-react/dist/esm/icons/archive";
import Play from "lucide-react/dist/esm/icons/play";
import ChevronsUpDown from "lucide-react/dist/esm/icons/chevrons-up-down";
import ArrowRight from "lucide-react/dist/esm/icons/arrow-right";
import Repeat from "lucide-react/dist/esm/icons/repeat";
import Search from "lucide-react/dist/esm/icons/search";
import Sparkles from "lucide-react/dist/esm/icons/sparkles";
import Newspaper from "lucide-react/dist/esm/icons/newspaper";
import TextCursorInput from "lucide-react/dist/esm/icons/text-cursor-input";
import Bell from "lucide-react/dist/esm/icons/bell";
import ChevronRight from "lucide-react/dist/esm/icons/chevron-right";
import GripVertical from "lucide-react/dist/esm/icons/grip-vertical";
import RectangleHorizontal from "lucide-react/dist/esm/icons/rectangle-horizontal";
import Square from "lucide-react/dist/esm/icons/square";
import Tag from "lucide-react/dist/esm/icons/tag";
import SeparatorHorizontal from "lucide-react/dist/esm/icons/separator-horizontal";
import CircleUser from "lucide-react/dist/esm/icons/circle-user";
import FormInput from "lucide-react/dist/esm/icons/form-input";
import AlignLeft from "lucide-react/dist/esm/icons/align-left";
import ListFilter from "lucide-react/dist/esm/icons/list-filter";
import CheckSquare from "lucide-react/dist/esm/icons/check-square";
import ToggleRight from "lucide-react/dist/esm/icons/toggle-right";
import MessageSquare from "lucide-react/dist/esm/icons/message-square";
import PanelTopOpen from "lucide-react/dist/esm/icons/panel-top-open";
import LayoutList from "lucide-react/dist/esm/icons/layout-list";
import BellRing from "lucide-react/dist/esm/icons/bell-ring";
import Shapes from "lucide-react/dist/esm/icons/shapes";
import Compass from "lucide-react/dist/esm/icons/compass";
import Table2 from "lucide-react/dist/esm/icons/table-2";
import Paintbrush from "lucide-react/dist/esm/icons/paintbrush";
import Pipette from "lucide-react/dist/esm/icons/pipette";
import SlidersHorizontal from "lucide-react/dist/esm/icons/sliders-horizontal";
import GripHorizontal from "lucide-react/dist/esm/icons/grip-horizontal";
import Upload from "lucide-react/dist/esm/icons/upload";
import Loader from "lucide-react/dist/esm/icons/loader";
import Columns from "lucide-react/dist/esm/icons/columns";
import Code2 from "lucide-react/dist/esm/icons/code-2";
import { cn } from "@/lib/utils";
import { elan } from "@/lib/elan";
import styles from "./sidebar.module.css";
import { useDevInfo } from "@/hooks/use-dev-info";
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
import { useSafeTriangle } from "@/hooks/use-safe-triangle";
import { Button, Kbd } from "@ds/index";

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
      { href: "/tokens/breakpoints", label: "Breakpoints", icon: Columns },
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
      { href: "/components/button", label: "Button", icon: Square, group: "Action" },
      { href: "/components/avatar", label: "Avatar", icon: CircleUser, group: "Display" },
      { href: "/components/badge", label: "Badge", icon: Tag, group: "Display" },
      { href: "/components/badge-overlay", label: "BadgeOverlay", icon: Bell, group: "Display" },
      { href: "/components/card", label: "Card", icon: RectangleHorizontal, group: "Display" },
      { href: "/components/divider", label: "Divider", icon: SeparatorHorizontal, group: "Display" },
      { href: "/components/inline-code", label: "InlineCode", icon: Code2, group: "Inline" },
      { href: "/components/kbd", label: "Kbd", icon: Square, group: "Inline" },
    ],
  },
  {
    id: "forms",
    label: "Forms & Inputs",
    icon: TextCursorInput,
    section: "Components",
    links: [
      { href: "/components/input", label: "Input", icon: FormInput, group: "Text" },
      { href: "/components/textarea", label: "Textarea", icon: AlignLeft, group: "Text" },
      { href: "/components/checkbox", label: "Checkbox", icon: CheckSquare, group: "Selection" },
      { href: "/components/select", label: "Select", icon: ListFilter, group: "Selection" },
      { href: "/components/toggle", label: "Toggle", icon: ToggleRight, group: "Selection" },
      { href: "/components/color-picker", label: "ColorPicker", icon: Pipette, group: "Specialized" },
      { href: "/components/dropzone", label: "Dropzone", icon: Upload, group: "Specialized" },
      { href: "/components/scrub-input", label: "ScrubInput", icon: GripHorizontal, group: "Specialized" },
      { href: "/components/slider", label: "Slider", icon: SlidersHorizontal, group: "Specialized" },
    ],
  },
  {
    id: "nav-layout",
    label: "Navigation & Layout",
    icon: Compass,
    section: "Components",
    links: [
      { href: "/components/footer", label: "Footer", icon: PanelBottom, group: "Structure" },
      { href: "/components/navigation", label: "Navigation", icon: Navigation, group: "Structure" },
      { href: "/components/nav-item", label: "NavItem", icon: ChevronRight, group: "Structure" },
      { href: "/components/button-select", label: "ButtonSelect", icon: Columns, group: "View Switching" },
      { href: "/components/tabs", label: "Tabs", icon: LayoutList, group: "View Switching" },
      { href: "/components/scroll-spy", label: "ScrollSpy", icon: GripVertical, group: "Utilities" },
      { href: "/components/theme-toggle", label: "ThemeToggle", icon: ToggleLeft, group: "Utilities" },
    ],
  },
  {
    id: "data-display",
    label: "Data Display",
    icon: Table2,
    section: "Components",
    links: [
      { href: "/components/code-block", label: "CodeBlock", icon: Code2 },
      { href: "/components/description-list", label: "DescriptionList", icon: LayoutList },
      { href: "/components/table", label: "Table", icon: Table2 },
    ],
  },
  {
    id: "feedback",
    label: "Overlays & Feedback",
    icon: Bell,
    section: "Components",
    links: [
      { href: "/components/command-menu", label: "CommandMenu", icon: Search, group: "Overlays" },
      { href: "/components/dialog", label: "Dialog", icon: PanelTopOpen, group: "Overlays" },
      { href: "/components/dropdown-menu", label: "DropdownMenu", icon: ListFilter, group: "Overlays" },
      { href: "/components/sheet", label: "Sheet", icon: PanelLeftOpen, group: "Overlays" },
      { href: "/components/progress-bar", label: "ProgressBar", icon: Loader, group: "Feedback" },
      { href: "/components/toast", label: "Toast", icon: BellRing, group: "Feedback" },
      { href: "/components/tooltip", label: "Tooltip", icon: MessageSquare, group: "Feedback" },
    ],
  },
  {
    id: "content",
    label: "Content & Media",
    icon: Newspaper,
    section: "Components",
    links: [
      { href: "/components/marquee", label: "Marquee", icon: Repeat },
      { href: "/components/testimonial-card", label: "TestimonialCard", icon: MessageSquare },
    ],
  },
  {
    id: "motion",
    label: "Motion & Entrance",
    icon: Sparkles,
    section: "Components",
    links: [
      { href: "/components/arrow-reveal", label: "ArrowReveal", icon: ArrowRight },
      { href: "/components/expand-collapse", label: "ExpandCollapse", icon: ChevronsUpDown },
      { href: "/components/fade-in", label: "FadeIn & Stagger", icon: MousePointerClick },
      { href: "/components/mount-entrance", label: "MountEntrance", icon: Play },
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
        <div className="px-3 py-4 text-center text-xs text-sidebar-muted-foreground/50">
          No results for &ldquo;{query}&rdquo;
        </div>
      ) : (
        results.map((r, idx) => {
          const Icon = r.item.icon;
          return (
            <button
              key={r.item.href}
              className={cn(
                "flex items-center gap-2 w-full px-2 h-7 rounded-sm text-xs transition-colors text-left",
                idx === selectedIndex
                  ? "bg-foreground/7 text-black dark:text-white"
                  : "text-sidebar-foreground hover:bg-foreground/7"
              )}
              onMouseEnter={() => setSelectedIndex(idx)}
              onClick={() => navigateTo(r.item.href)}
            >
              <Icon className="w-3 h-3 shrink-0 text-sidebar-muted-foreground" />
              <span className="truncate flex-1">{r.item.label}</span>
              <span className="text-xs text-sidebar-muted-foreground/50 shrink-0">
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
          className="flex items-center pl-[7px] h-7 rounded-sm text-sidebar-muted-foreground hover:bg-foreground/7 hover:text-black dark:hover:text-white transition-colors"
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
                  className="w-full h-7 pl-6 pr-2 text-xs bg-sidebar-muted/50 rounded-sm border border-accent/50 text-sidebar-foreground placeholder:text-sidebar-muted-foreground/50 focus:outline-none transition-colors"
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
          className="flex items-center gap-2 w-full h-7 px-2 rounded-sm text-xs bg-sidebar-muted/50 border border-sidebar-border/50 text-sidebar-muted-foreground/50 hover:border-accent/50 hover:text-sidebar-muted-foreground transition-colors"
        >
          <Search className="w-3 h-3 shrink-0" />
          <span className="flex-1 text-left">Search…</span>
          <Kbd>⌘K</Kbd>
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
              className="w-full h-7 pl-6 pr-2 text-xs bg-sidebar-muted/50 rounded-sm border border-accent/50 text-sidebar-foreground placeholder:text-sidebar-muted-foreground/50 focus:outline-none transition-colors"
            />
          </div>
          {showResults && (
            <div className="absolute left-1.5 right-1.5 top-[calc(100%-2px)] z-50 bg-sidebar border border-sidebar-border rounded-sm shadow-lg overflow-hidden">
              {results.length === 0 ? (
                <div className="px-3 py-4 text-center text-xs text-sidebar-muted-foreground/50">
                  No results for &ldquo;{query}&rdquo;
                </div>
              ) : (
                results.map((r, idx) => {
                  const Icon = r.item.icon;
                  return (
                    <button
                      key={r.item.href}
                      className={cn(
                        "flex items-center gap-2 w-full px-2 h-7 text-xs transition-colors text-left",
                        idx === selectedIndex
                          ? "bg-foreground/7 text-black dark:text-white"
                          : "text-sidebar-foreground hover:bg-foreground/7"
                      )}
                      onMouseEnter={() => setSelectedIndex(idx)}
                      onClick={() => navigateTo(r.item.href)}
                    >
                      <Icon className="w-3 h-3 shrink-0 text-sidebar-muted-foreground" />
                      <span className="truncate flex-1">{r.item.label}</span>
                      <span className="text-xs text-sidebar-muted-foreground/50 shrink-0">
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
            <span className={styles.groupLabel}>
              {link.group}
            </span>
          </div>
        )}
        <Link
          href={link.href}
          onClick={onNavigate}
          className={cn(
            "flex items-center gap-2 h-7 px-2 rounded-sm text-sm transition-colors",
            isLinkActive
              ? "text-accent font-medium hover:bg-accent/7"
              : "text-sidebar-muted-foreground hover:bg-foreground/7 hover:text-black dark:hover:text-white"
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
                    <span className={cn("px-2", styles.sectionLabel)}>
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
                    collapsed ? "pl-[7px]" : "gap-2 px-2 text-sm",
                    isDirectActive
                      ? "text-accent font-medium hover:bg-accent/7"
                      : "text-sidebar-muted-foreground hover:bg-foreground/7 hover:text-black dark:hover:text-white"
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
                      : "gap-2 px-2 text-sm",
                    isEmpty && "opacity-30 cursor-not-allowed",
                    isCatActive && !isEmpty
                      ? "text-accent font-medium hover:bg-accent/7"
                      : isOpen
                        ? "text-black dark:text-white font-medium hover:bg-foreground/7"
                        : "text-sidebar-muted-foreground hover:bg-foreground/7 hover:text-black dark:hover:text-white"
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

const CategorySliver = React.forwardRef<
  HTMLDivElement,
  {
    category: NavCategory;
    pathname: string;
    sidebarCollapsed: boolean;
    visible: boolean;
    onMouseEnter: () => void;
    onMouseLeave: () => void;
    onNavigate?: () => void;
  }
>(function CategorySliver(
  {
    category,
    pathname,
    sidebarCollapsed,
    visible,
    onMouseEnter,
    onMouseLeave,
    onNavigate,
  },
  ref,
) {
  return (
    <div
      ref={ref}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className={cn(
        "fixed top-0 h-screen w-[200px] z-[29] bg-sidebar border-r border-sidebar-border shadow-lg",
        "transition-transform duration-200 ease-out",
        visible
          ? "translate-x-0"
          : "-translate-x-full pointer-events-none",
        sidebarCollapsed ? "left-[41px]" : "left-[200px]",
      )}
    >
      <div className="flex items-center h-12 px-3 border-b border-sidebar-border">
        <span className="text-xs font-medium text-sidebar-foreground">
          {category.label}
        </span>
      </div>
      <nav className="p-1.5 space-y-px">
        {renderLinksWithGroups(category.links, pathname, onNavigate)}
      </nav>
    </div>
  );
});

// ── Mobile Menu Button ───────────────────────────────────────────────────────

export function MobileMenuButton() {
  const { mobileOpen, setMobileOpen } = useSidebar();
  return (
    <Button
      iconOnly
      size="sm"
      emphasis="minimal"
      onClick={() => setMobileOpen(!mobileOpen)}
      className="lg:hidden -ml-1.5"
      aria-label="Toggle sidebar"
    >
      <Menu className="w-5 h-5" />
    </Button>
  );
}

// ── Main Sidebar ─────────────────────────────────────────────────────────────

function VersionLabel() {
  const { data, isLocal } = useDevInfo();
  const version = isLocal
    ? data?.currentVersion ?? elan.version
    : elan.release.version;
  return (
    <span className="font-semibold text-sm whitespace-nowrap">
      {elan.name} {version}
    </span>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const { mobileOpen, setMobileOpen, collapsed, setCollapsed } = useSidebar();
  const [openCategory, setOpenCategory] = useState<string | null>(null);
  const [displayedCategory, setDisplayedCategory] = useState<string | null>(
    null
  );
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const sliverRef = useRef<HTMLDivElement>(null);

  const closeMobile = useCallback(() => setMobileOpen(false), [setMobileOpen]);

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
    closeMobile();
    cancelPending();
    setOpenCategory(null);
  }, [pathname, closeMobile, cancelPending]);

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

  const widthClass = isCollapsedDesktop ? W_COLLAPSED : W_EXPANDED;

  function handleCategoryClick(catId: string) {
    setOpenCategory((prev) => (prev === catId ? null : catId));
  }

  function handleCategoryHover(catId: string) {
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
            "flex items-center h-12 border-b border-sidebar-border shrink-0 px-1.5",
            isCollapsedDesktop ? "justify-center" : "justify-between"
          )}
        >
          {!isCollapsedDesktop && (
            <Link
              href="/"
              className="flex items-center gap-2.5 min-w-0 px-2"
              onClick={closeMobile}
            >
              <img
                src="/yg-logo.svg"
                alt="YG"
                className="w-6 h-6 shrink-0"
              />
              <VersionLabel />
            </Link>
          )}
          {isCollapsedDesktop && (
            <Button
              iconOnly
              size="xs"
              emphasis="minimal"
              onClick={() => setCollapsed(false)}
              aria-label="Expand sidebar"
            >
              <PanelLeftOpen className="w-3.5 h-3.5" />
            </Button>
          )}
          {!isCollapsedDesktop && (
            <Button
              iconOnly
              size="xs"
              emphasis="minimal"
              onClick={() => {
                if (mobileOpen) {
                  closeMobile();
                } else {
                  setCollapsed(true);
                  setOpenCategory(null);
                }
              }}
              className="hidden lg:flex shrink-0 mr-2"
              aria-label="Collapse sidebar"
            >
              <PanelLeftClose className="w-3.5 h-3.5" />
            </Button>
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
                : "gap-2 px-2 text-sm",
              pathname === "/archive"
                ? "text-accent font-medium hover:bg-accent/7"
                : "text-sidebar-muted-foreground hover:bg-foreground/7 hover:text-black dark:hover:text-white"
            )}
          >
            <Archive className="w-3.5 h-3.5 shrink-0" />
            {!isCollapsedDesktop && "Archive"}
          </Link>
        </div>
      </aside>

      {!isMobile && sliverCategoryData && (
        <CategorySliver
          ref={sliverRef}
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
