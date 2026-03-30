"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Shell } from "@/components/shell";
import { SectionHeading } from "@/components/token-grid";
import { ComponentPreview, PropsTable } from "@/components/component-preview";
import { cn } from "@/lib/utils";
import {
  Copy,
  Pencil,
  Trash2,
  Share,
  ChevronRight,
  LogOut,
  Settings,
  User,
  CreditCard,
  Keyboard,
} from "lucide-react";

interface MenuItem {
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  shortcut?: string;
  destructive?: boolean;
  disabled?: boolean;
  onClick?: () => void;
}

interface MenuSeparator {
  separator: true;
}

type MenuEntry = MenuItem | MenuSeparator;

function isSeparator(entry: MenuEntry): entry is MenuSeparator {
  return "separator" in entry;
}

function DemoDropdownMenu({
  trigger,
  items,
  align = "start",
  sideOffset = 4,
}: {
  trigger: React.ReactNode;
  items: MenuEntry[];
  align?: "start" | "center" | "end";
  sideOffset?: number;
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (!containerRef.current?.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open]);

  const alignClass =
    align === "end" ? "right-0" : align === "center" ? "left-1/2 -translate-x-1/2" : "left-0";

  return (
    <div ref={containerRef} className="relative inline-block">
      <div onClick={() => setOpen((prev) => !prev)}>{trigger}</div>
      {open && (
        <div
          className={cn(
            "absolute z-50 min-w-[200px] rounded-sm border border-border bg-background p-1 shadow-lg",
            alignClass,
          )}
          style={{ marginTop: sideOffset }}
        >
          {items.map((entry, i) => {
            if (isSeparator(entry)) {
              return <div key={i} className="my-1 h-px bg-border" />;
            }
            const Icon = entry.icon;
            return (
              <button
                key={i}
                type="button"
                disabled={entry.disabled}
                onClick={() => {
                  entry.onClick?.();
                  setOpen(false);
                }}
                className={cn(
                  "flex items-center gap-2 w-full px-2 py-1.5 rounded-sm text-sm transition-colors text-left",
                  entry.destructive
                    ? "text-red-400 hover:bg-red-500/10 hover:text-red-300"
                    : "text-foreground hover:bg-muted",
                  entry.disabled && "opacity-40 pointer-events-none",
                )}
              >
                {Icon && <Icon className="w-3.5 h-3.5 shrink-0" />}
                <span className="flex-1">{entry.label}</span>
                {entry.shortcut && (
                  <span className="text-xs text-muted-foreground font-mono ml-auto pl-4">
                    {entry.shortcut}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function DemoSubMenu({
  trigger,
  items,
}: {
  trigger: React.ReactNode;
  items: MenuItem[];
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const scheduleClose = useCallback(() => {
    closeTimer.current = setTimeout(() => setOpen(false), 150);
  }, []);

  const cancelClose = useCallback(() => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      if (closeTimer.current) clearTimeout(closeTimer.current);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative"
      onMouseEnter={() => {
        cancelClose();
        setOpen(true);
      }}
      onMouseLeave={scheduleClose}
    >
      <div className="flex items-center gap-2 w-full px-2 py-1.5 rounded-sm text-sm text-foreground hover:bg-muted transition-colors cursor-default">
        <span className="flex-1">{trigger}</span>
        <ChevronRight className="w-3 h-3 text-muted-foreground" />
      </div>
      {open && (
        <div className="absolute left-full top-0 ml-1 min-w-[160px] rounded-sm border border-border bg-background p-1 shadow-lg z-50">
          {items.map((item, i) => (
            <button
              key={i}
              type="button"
              onClick={() => {
                item.onClick?.();
                setOpen(false);
              }}
              className="flex items-center gap-2 w-full px-2 py-1.5 rounded-sm text-sm text-foreground hover:bg-muted transition-colors text-left"
            >
              {item.icon && <item.icon className="w-3.5 h-3.5 shrink-0" />}
              <span className="flex-1">{item.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function MenuButton({ children }: { children: React.ReactNode }) {
  return (
    <button
      type="button"
      className="rounded-sm border border-border bg-background px-4 py-2 text-sm font-medium text-foreground shadow-sm transition-colors hover:bg-muted"
    >
      {children}
    </button>
  );
}

const basicCode = `<DemoDropdownMenu
  trigger={<button>Open menu</button>}
  items={[
    { label: "Edit", icon: Pencil },
    { label: "Copy", icon: Copy },
    { separator: true },
    { label: "Delete", icon: Trash2, destructive: true },
  ]}
/>`;

const shortcutsCode = `<DemoDropdownMenu
  trigger={<button>Actions</button>}
  items={[
    { label: "Copy", icon: Copy, shortcut: "⌘C" },
    { label: "Paste", shortcut: "⌘V" },
    { label: "Cut", shortcut: "⌘X" },
  ]}
/>`;

const iconsCode = `<DemoDropdownMenu
  trigger={<button>Account</button>}
  items={[
    { label: "Profile", icon: User },
    { label: "Settings", icon: Settings },
    { label: "Billing", icon: CreditCard },
    { label: "Shortcuts", icon: Keyboard },
    { separator: true },
    { label: "Log out", icon: LogOut },
  ]}
/>`;

const destructiveCode = `<DemoDropdownMenu
  trigger={<button>Manage</button>}
  items={[
    { label: "Edit", icon: Pencil },
    { label: "Share", icon: Share },
    { separator: true },
    { label: "Delete project", icon: Trash2, destructive: true },
  ]}
/>`;

export default function DropdownMenuPage() {
  return (
    <Shell title="DropdownMenu">
      <div className="max-w-5xl space-y-10">
        <SectionHeading
          title="DropdownMenu"
          description="Click-triggered floating menu with items, separators, keyboard shortcuts, and destructive actions."
        />

        <ComponentPreview
          title="Basic"
          description="Simple menu with edit, copy, and destructive delete actions."
          code={basicCode}
        >
          <DemoDropdownMenu
            trigger={<MenuButton>Open menu</MenuButton>}
            items={[
              { label: "Edit", icon: Pencil },
              { label: "Copy", icon: Copy },
              { separator: true },
              { label: "Delete", icon: Trash2, destructive: true },
            ]}
          />
        </ComponentPreview>

        <ComponentPreview
          title="With icons"
          description="Account menu with icons on every item."
          code={iconsCode}
        >
          <DemoDropdownMenu
            trigger={<MenuButton>Account</MenuButton>}
            items={[
              { label: "Profile", icon: User },
              { label: "Settings", icon: Settings },
              { label: "Billing", icon: CreditCard },
              { label: "Shortcuts", icon: Keyboard },
              { separator: true },
              { label: "Log out", icon: LogOut },
            ]}
          />
        </ComponentPreview>

        <ComponentPreview
          title="With shortcuts"
          description="Items showing keyboard shortcut hints on the right side."
          code={shortcutsCode}
        >
          <DemoDropdownMenu
            trigger={<MenuButton>Edit</MenuButton>}
            items={[
              { label: "Copy", icon: Copy, shortcut: "⌘C" },
              { label: "Paste", shortcut: "⌘V" },
              { label: "Cut", shortcut: "⌘X" },
              { separator: true },
              { label: "Select all", shortcut: "⌘A" },
            ]}
          />
        </ComponentPreview>

        <ComponentPreview
          title="With destructive item"
          description="Dangerous actions are styled in red to signal irreversibility."
          code={destructiveCode}
        >
          <DemoDropdownMenu
            trigger={<MenuButton>Manage</MenuButton>}
            items={[
              { label: "Edit", icon: Pencil },
              { label: "Share", icon: Share },
              { separator: true },
              { label: "Delete project", icon: Trash2, destructive: true },
            ]}
          />
        </ComponentPreview>

        <ComponentPreview
          title="With sub-menu"
          description="Nested menu that opens on hover for grouping related actions."
          code={`<DemoDropdownMenu trigger={<button>More</button>} items={[...]}>
  <DemoSubMenu trigger="Share to..." items={[...]} />
</DemoDropdownMenu>`}
        >
          <div className="relative inline-block">
            <DemoDropdownMenu
              trigger={<MenuButton>More actions</MenuButton>}
              items={[
                { label: "Edit", icon: Pencil },
                { label: "Copy link", icon: Copy },
              ]}
            />
            <div className="mt-3 text-xs text-muted-foreground">
              <p>Sub-menu demo (hover &ldquo;Share to…&rdquo;):</p>
              <div className="mt-2 inline-block rounded-sm border border-border bg-background p-1 shadow-lg min-w-[200px]">
                <button
                  type="button"
                  className="flex items-center gap-2 w-full px-2 py-1.5 rounded-sm text-sm text-foreground hover:bg-muted transition-colors text-left"
                >
                  <Pencil className="w-3.5 h-3.5" />
                  Edit
                </button>
                <DemoSubMenu
                  trigger="Share to…"
                  items={[
                    { label: "Twitter", onClick: () => {} },
                    { label: "LinkedIn", onClick: () => {} },
                    { label: "Email", onClick: () => {} },
                  ]}
                />
                <div className="my-1 h-px bg-border" />
                <button
                  type="button"
                  className="flex items-center gap-2 w-full px-2 py-1.5 rounded-sm text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors text-left"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Delete
                </button>
              </div>
            </div>
          </div>
        </ComponentPreview>

        <div>
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-3">
            Props
          </h3>
          <PropsTable
            props={[
              {
                name: "trigger",
                type: "ReactNode",
                description: "The element that opens the menu on click.",
              },
              {
                name: "items",
                type: "(MenuItem | { separator: true })[]",
                description:
                  "Array of menu items. Each item can have label, icon, shortcut, destructive, disabled, and onClick.",
              },
              {
                name: "align",
                type: '"start" | "center" | "end"',
                default: '"start"',
                description: "Horizontal alignment of the menu relative to the trigger.",
              },
              {
                name: "sideOffset",
                type: "number",
                default: "4",
                description: "Vertical gap in pixels between trigger and menu.",
              },
            ]}
          />
        </div>

        <div className="text-xs font-mono text-muted-foreground p-3 rounded-sm bg-muted/50">
          src/components/ui/DropdownMenu
        </div>
      </div>
    </Shell>
  );
}
