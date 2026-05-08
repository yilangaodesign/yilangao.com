"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  Home,
  FolderOpen,
  FileText,
  Tags,
  Settings,
  LogOut,
  User,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import {
  VerticalNavProvider,
  VerticalNav,
  VerticalNavHeader,
  VerticalNavContent,
  VerticalNavFooter,
  VerticalNavSection,
  useVerticalNav,
} from "@ds/VerticalNav/VerticalNav";
import { NavItem } from "@ds/NavItem/NavItem";
import { Avatar } from "@ds/Avatar/Avatar";
import { Button } from "@ds/Button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@ds/DropdownMenu";
import styles from "./app-shell.module.scss";

function EdraNav() {
  const pathname = usePathname();
  const { collapsed, setCollapsed } = useVerticalNav();

  return (
    <VerticalNav>
      <VerticalNavHeader>
        {!collapsed && (
          <span className={styles.logo}>Edra</span>
        )}
        <Button
          iconOnly
          size="xs"
          emphasis="minimal"
          onClick={() => setCollapsed(!collapsed)}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <PanelLeftOpen className={styles.headerIcon} />
          ) : (
            <PanelLeftClose className={styles.headerIcon} />
          )}
        </Button>
      </VerticalNavHeader>

      <VerticalNavContent>
        <NavItem
          icon={<Home className={styles.navIcon} />}
          size="md"
          active={pathname === "/"}
          activeAppearance="brand"
          collapsed={collapsed}
          href="/"
          as={Link}
        >
          Home
        </NavItem>

        <NavItem
          icon={<FolderOpen className={styles.navIcon} />}
          size="md"
          active={pathname === "/workspace"}
          activeAppearance="brand"
          collapsed={collapsed}
          href="/workspace"
          as={Link}
        >
          My workspace
        </NavItem>

        <VerticalNavSection label="Database">
          <NavItem
            icon={<FileText className={styles.navIcon} />}
            size="md"
            active={pathname === "/documents"}
            activeAppearance="brand"
            collapsed={collapsed}
            href="/documents"
            as={Link}
          >
            Documents
          </NavItem>

          <NavItem
            icon={<Tags className={styles.navIcon} />}
            size="md"
            active={pathname === "/labels"}
            activeAppearance="brand"
            collapsed={collapsed}
            href="/labels"
            as={Link}
          >
            Labels
          </NavItem>
        </VerticalNavSection>
      </VerticalNavContent>

      <VerticalNavFooter>
        <NavItem
          icon={<Settings className={styles.navIcon} />}
          size="md"
          active={pathname === "/settings"}
          activeAppearance="brand"
          collapsed={collapsed}
          href="/settings"
          as={Link}
        >
          Settings
        </NavItem>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <NavItem
              icon={<Avatar size="sm" name="Maya Chen" tone="brand" />}
              size="md"
              collapsed={collapsed}
            >
              Maya Chen
            </NavItem>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" sideOffset={8}>
            <DropdownMenuItem leading={<User className={styles.navIcon} />}>
              Account
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem leading={<LogOut className={styles.navIcon} />}>
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </VerticalNavFooter>
    </VerticalNav>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <VerticalNavProvider defaultCollapsed>
      <div className={styles.shell}>
        <EdraNav />
        <main className={styles.main}>{children}</main>
      </div>
    </VerticalNavProvider>
  );
}
