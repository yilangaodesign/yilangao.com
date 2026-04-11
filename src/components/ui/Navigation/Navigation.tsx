"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./Navigation.module.scss";

export type NavigationAppearance = "frosted" | "solid";

const NAV_LINKS: { href: string; label: string }[] = [];

export default function Navigation({
  appearance = "frosted",
  tagline,
}: {
  appearance?: NavigationAppearance;
  tagline?: string;
} = {}) {
  const pathname = usePathname();

  const navClass = [
    styles.nav,
    appearance === "solid" && styles.solid,
  ].filter(Boolean).join(" ");

  return (
    <nav className={navClass}>
      <div className={styles.navInner}>
        <Link href="/" className={styles.logo}>
          <span className={styles.logoMark} aria-hidden="true" />
          <span className={styles.logoText}>Yilan Gao</span>
        </Link>
        <div className={styles.links}>
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`${styles.link} ${pathname === link.href ? styles.linkActive : ""}`}
            >
              {link.label}
            </Link>
          ))}
          {tagline && <span className={styles.tagline}>{tagline}</span>}
        </div>
      </div>
    </nav>
  );
}
