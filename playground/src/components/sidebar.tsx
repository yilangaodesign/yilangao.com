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
import Tags from "lucide-react/dist/esm/icons/tags";
import SeparatorHorizontal from "lucide-react/dist/esm/icons/separator-horizontal";
import CircleUser from "lucide-react/dist/esm/icons/circle-user";
import FormInput from "lucide-react/dist/esm/icons/form-input";
import AlignLeft from "lucide-react/dist/esm/icons/align-left";
import List from "lucide-react/dist/esm/icons/list";
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
import Share2 from "lucide-react/dist/esm/icons/share-2";
import Paintbrush from "lucide-react/dist/esm/icons/paintbrush";
import Pipette from "lucide-react/dist/esm/icons/pipette";
import SlidersHorizontal from "lucide-react/dist/esm/icons/sliders-horizontal";
import Scan from "lucide-react/dist/esm/icons/scan";
import GripHorizontal from "lucide-react/dist/esm/icons/grip-horizontal";
import Upload from "lucide-react/dist/esm/icons/upload";
import Loader from "lucide-react/dist/esm/icons/loader";
import Columns from "lucide-react/dist/esm/icons/columns";
import Code2 from "lucide-react/dist/esm/icons/code-2";
import Heading from "lucide-react/dist/esm/icons/heading";
import AlertTriangle from "lucide-react/dist/esm/icons/alert-triangle";
import { cn } from "@/lib/utils";
import { elan } from "@/lib/elan";
import s from "./sidebar.module.scss";
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
import { Button, Input, Kbd } from "@ds/index";

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
      { href: "/components/eyebrow", label: "Eyebrow", icon: Heading, group: "Inline" },
      { href: "/components/kbd", label: "Kbd", icon: Square, group: "Inline" },
      { href: "/components/text-row", label: "TextRow", icon: Tags, group: "Inline" },
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
      { href: "/components/vertical-nav", label: "VerticalNav", icon: Navigation, group: "Structure" },
      { href: "/components/button-select", label: "ButtonSelect", icon: Columns, group: "View Switching" },
      { href: "/components/tabs", label: "Tabs", icon: LayoutList, group: "View Switching" },
      { href: "/components/scroll-spy", label: "ScrollSpy", icon: GripVertical, group: "Utilities" },
      { href: "/components/theme-toggle", label: "ThemeToggle", icon: ToggleLeft, group: "Utilities" },
    ],
  },
  {
    id: "data",
    label: "Data",
    icon: Table2,
    section: "Components",
    links: [
      { href: "/components/code-block", label: "CodeBlock", icon: Code2, group: "Display" },
      { href: "/components/description-list", label: "DescriptionList", icon: LayoutList, group: "Display" },
      { href: "/components/table", label: "Table", icon: Table2, group: "Display" },
      { href: "/components/canvas", label: "Canvas", icon: Scan, group: "Visualization" },
      { href: "/components/force-graph", label: "ForceGraph", icon: Share2, group: "Visualization" },
    ],
  },
  {
    id: "feedback",
    label: "Overlays & Feedback",
    icon: Bell,
    section: "Components",
    links: [
      { href: "/components/command-menu", label: "CommandMenu", icon: Search, group: "Overlays" },
      { href: "/components/alert-dialog", label: "AlertDialog", icon: AlertTriangle, group: "Overlays" },
      { href: "/components/dialog", label: "Dialog", icon: PanelTopOpen, group: "Overlays" },
      { href: "/components/dropdown-menu", label: "DropdownMenu", icon: ListFilter, group: "Overlays" },
      { href: "/components/menu", label: "Menu", icon: List, group: "Overlays" },
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
      { href: "/components/media-mute-toggle", label: "MediaMuteToggle", icon: ToggleRight },
      { href: "/components/testimonial-card", label: "TestimonialCard", icon: MessageSquare },
      { href: "/components/video-embed", label: "VideoEmbed", icon: Play },
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
    if (open && collapsed) {
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open, collapsed]);

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
        requestAnimationFrame(() => inputRef.current?.focus());
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
      inputRef.current?.blur();
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
    <div className={s.searchResults}>
      {results.length === 0 ? (
        <div className={s.searchEmpty}>
          No results for &ldquo;{query}&rdquo;
        </div>
      ) : (
        results.map((r, idx) => {
          const Icon = r.item.icon;
          return (
            <button
              key={r.item.href}
              className={cn(
                s.searchResultItem,
                idx === selectedIndex && s.searchResultItemActive
              )}
              onMouseEnter={() => setSelectedIndex(idx)}
              onClick={() => navigateTo(r.item.href)}
            >
              <Icon className={s.searchResultIcon} />
              <span className={s.searchResultLabel}>{r.item.label}</span>
              <span className={s.searchResultSection}>
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
      <div ref={containerRef} onMouseEnter={onMouseEnter} className={s.searchSection}>
        <button
          onClick={() => setOpen(!open)}
          className={s.searchIconBtn}
          title="Search (⌘K)"
        >
          <Search className={s.iconNav} />
        </button>
        {open &&
          createPortal(
            <div ref={flyoutRef} className={s.searchFlyout}>
              <div className={s.searchFlyoutInner}>
                <Input
                  ref={inputRef}
                  size="xs"
                  leadingIcon={<Search />}
                  placeholder="Search…"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
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
    <div ref={containerRef} onMouseEnter={onMouseEnter} className={s.searchSectionExpanded}>
      <Input
        ref={inputRef}
        size="xs"
        leadingIcon={<Search />}
        trailing={!open ? <Kbd>⌘K</Kbd> : undefined}
        placeholder="Search…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => setOpen(true)}
        onKeyDown={handleKeyDown}
      />
      {open && showResults && (
        <div className={s.searchDropdown}>
          {results.length === 0 ? (
            <div className={s.searchEmpty}>
              No results for &ldquo;{query}&rdquo;
            </div>
          ) : (
            results.map((r, idx) => {
              const Icon = r.item.icon;
              return (
                <button
                  key={r.item.href}
                  className={cn(
                    s.searchResultItem,
                    idx === selectedIndex && s.searchResultItemActive
                  )}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  onClick={() => navigateTo(r.item.href)}
                >
                  <Icon className={s.searchResultIcon} />
                  <span className={s.searchResultLabel}>{r.item.label}</span>
                  <span className={s.searchResultSection}>
                    {r.item.section}
                  </span>
                </button>
              );
            })
          )}
        </div>
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
          <div className={s.groupLabelWrap}>
            <span className={s.groupLabel}>
              {link.group}
            </span>
          </div>
        )}
        <Link
          href={link.href}
          onClick={onNavigate}
          className={cn(
            s.navItem,
            s.navItemExpanded,
            isLinkActive ? s.navItemActive : s.navItemDefault
          )}
        >
          <LinkIcon className={s.iconNav} />
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
      <nav className={s.navList}>
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
                <div className={s.sectionDivider}>
                  {collapsed ? (
                    <div className={s.sectionDividerLine} />
                  ) : (
                    <span className={s.sectionLabel}>
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
                    s.navItem,
                    collapsed ? s.navItemCollapsed : s.navItemExpanded,
                    isDirectActive ? s.navItemActive : s.navItemDefault
                  )}
                >
                  <Icon className={s.iconNav} />
                  {!collapsed && (
                    <span className={s.navItemLabel}>
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
                    s.navItem,
                    collapsed ? s.navItemCollapsed : s.navItemExpanded,
                    isEmpty && s.navItemDisabled,
                    isCatActive && !isEmpty
                      ? s.navItemActive
                      : isOpen
                        ? s.navItemOpen
                        : s.navItemDefault
                  )}
                >
                  <Icon className={s.iconNav} />
                  {!collapsed && (
                    <>
                      <span className={s.navItemLabel}>
                        {cat.label}
                      </span>
                      {!isEmpty && (
                        <ChevronRight
                          className={cn(
                            s.chevron,
                            isMobile && isOpen && s.chevronOpen
                          )}
                        />
                      )}
                    </>
                  )}
                </button>
              )}

              {isMobile && isOpen && !isDirectLink && (
                <div className={s.mobileExpandedLinks}>
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
        s.sliver,
        sidebarCollapsed ? s.sliverFromCollapsed : s.sliverFromExpanded,
        visible ? s.sliverVisible : s.sliverHidden,
      )}
    >
      <div className={s.sliverHeader}>
        <span className={s.sliverHeaderLabel}>
          {category.label}
        </span>
      </div>
      <nav className={s.sliverNav}>
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
      className={s.mobileMenuBtn}
      aria-label="Toggle sidebar"
    >
      <Menu className={s.iconMenu} />
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
    <span className={s.versionLabel}>
      <span className={s.versionName}>{elan.name}</span>
      {" "}
      <span className={s.versionNumber}>{version}</span>
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
          className={s.mobileBackdrop}
          onClick={closeMobile}
        />
      )}

      <div
        className={cn(
          s.spacer,
          isCollapsedDesktop ? s.spacerCollapsed : s.spacerExpanded
        )}
      />

      <aside
        data-sidebar
        onMouseEnter={cancelClose}
        onMouseLeave={scheduleClose}
        className={cn(
          s.sidebar,
          mobileOpen ? s.sidebarVisible : s.sidebarHidden,
          (mobileOpen && collapsed) ? s.sidebarExpanded : (isCollapsedDesktop ? s.sidebarCollapsed : s.sidebarExpanded)
        )}
      >
        <div
          onMouseEnter={() => setOpenCategory(null)}
          className={cn(
            s.header,
            isCollapsedDesktop ? s.headerCollapsed : s.headerExpanded
          )}
        >
          {!isCollapsedDesktop && (
            <Link
              href="/"
              className={s.logoLink}
              onClick={closeMobile}
            >
              <span
                className={s.logoImage}
                role="img"
                aria-label="YG"
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
              <PanelLeftOpen className={s.iconNav} />
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
              className={s.collapseBtn}
              aria-label="Collapse sidebar"
            >
              <PanelLeftClose className={s.iconNav} />
            </Button>
          )}
        </div>

        <SidebarSearch
          collapsed={isCollapsedDesktop}
          onNavigate={closeMobile}
          onMouseEnter={() => setOpenCategory(null)}
        />

        <div className={s.scrollArea}>
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

        <div className={s.footer}>
          <Link
            href="/archive"
            onClick={closeMobile}
            onMouseEnter={() => setOpenCategory(null)}
            title={isCollapsedDesktop ? "Archive" : undefined}
            className={cn(
              s.navItem,
              isCollapsedDesktop ? s.navItemCollapsed : s.navItemExpanded,
              pathname === "/archive" ? s.navItemActive : s.navItemDefault
            )}
          >
            <Archive className={s.iconNav} />
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
