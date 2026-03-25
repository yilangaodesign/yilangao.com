"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import ThemeToggle from "./ThemeToggle";

const links = [
  { href: "/", label: "Home" },
  { href: "/work", label: "Work" },
  { href: "/blog", label: "Blog" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export default function Navigation() {
  const pathname = usePathname();

  return (
    <nav style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "1.5rem var(--page-padding)",
      maxWidth: "var(--container-max)",
      margin: "0 auto",
      width: "100%",
    }}>
      <Link href="/" style={{ fontWeight: 600, fontSize: "1.125rem" }}>
        Yilan Gao
      </Link>
      <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
        {links.slice(1).map((link) => (
          <Link
            key={link.href}
            href={link.href}
            style={{
              fontSize: "0.875rem",
              color: pathname === link.href
                ? "var(--color-text)"
                : "var(--color-text-muted)",
            }}
          >
            {link.label}
          </Link>
        ))}
        <ThemeToggle />
      </div>
    </nav>
  );
}
