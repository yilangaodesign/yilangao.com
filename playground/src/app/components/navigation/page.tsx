"use client";

import { Shell } from "@/components/shell";
import { SectionHeading } from "@/components/token-grid";
import { ComponentPreview, PropsTable } from "@/components/component-preview";

function NavigationDemo() {
  const links = [
    { href: "/about", label: "About" },
    { href: "/experiments", label: "Experiments" },
  ];

  return (
    <div className="w-full max-w-3xl border border-border rounded-sm overflow-hidden bg-white">
      <nav
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "1.5rem 2rem",
          width: "100%",
        }}
      >
        <span style={{ fontWeight: 600, fontSize: "1.125rem", color: "#161616" }}>
          Yilan Gao
        </span>
        <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
          {links.map((link) => (
            <span
              key={link.href}
              style={{ fontSize: "0.875rem", color: "#525252", cursor: "pointer" }}
            >
              {link.label}
            </span>
          ))}
          <button
            style={{
              background: "none",
              border: "1px solid #e0e0e0",
              borderRadius: "6px",
              padding: "0.4rem 0.75rem",
              cursor: "pointer",
              color: "#161616",
              fontSize: "0.875rem",
            }}
          >
            Dark
          </button>
        </div>
      </nav>
    </div>
  );
}

const code = `"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

const NAV_LINKS = [
  { href: "/about", label: "About" },
  { href: "/experiments", label: "Experiments" },
];

function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  return (
    <button
      type="button"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      aria-label="Toggle theme"
    >
      {theme === "dark" ? "Light" : "Dark"}
    </button>
  );
}

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
        {NAV_LINKS.map((link) => (
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
}`;

export default function NavigationPage() {
  return (
    <Shell title="Navigation">
      <div className="max-w-5xl space-y-10">
        <SectionHeading
          title="Navigation"
          description="Top-level navigation bar with route links and theme toggle. Uses inline styles with CSS variables for theming."
        />

        <ComponentPreview
          title="Default"
          description="Standard navigation layout with logo, links, and theme toggle."
          code={code}
        >
          <NavigationDemo />
        </ComponentPreview>

        <div>
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-3">
            Props
          </h3>
          <PropsTable
            props={[
              { name: "(none)", type: "—", description: "This component takes no props. Links and routing are self-contained." },
            ]}
          />
        </div>

        <div>
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-3">
            Notes
          </h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex gap-2">
              <span className="text-accent shrink-0">•</span>
              Uses <code className="text-xs bg-muted px-1.5 py-0.5 rounded-sm font-mono">usePathname()</code> for active state detection.
            </li>
            <li className="flex gap-2">
              <span className="text-accent shrink-0">•</span>
              Relies on CSS variables: <code className="text-xs bg-muted px-1.5 py-0.5 rounded-sm font-mono">--page-padding</code>, <code className="text-xs bg-muted px-1.5 py-0.5 rounded-sm font-mono">--container-max</code>, <code className="text-xs bg-muted px-1.5 py-0.5 rounded-sm font-mono">--color-text</code>, <code className="text-xs bg-muted px-1.5 py-0.5 rounded-sm font-mono">--color-text-muted</code>.
            </li>
            <li className="flex gap-2">
              <span className="text-accent shrink-0">•</span>
              Theme toggle uses <code className="text-xs bg-muted px-1.5 py-0.5 rounded-sm font-mono">useTheme</code> from <code className="text-xs bg-muted px-1.5 py-0.5 rounded-sm font-mono">next-themes</code> (same pattern as <code className="text-xs bg-muted px-1.5 py-0.5 rounded-sm font-mono">src/components/ThemeToggle.tsx</code>).
            </li>
          </ul>
        </div>

        <div className="text-xs font-mono text-muted-foreground p-3 rounded-sm bg-muted/50">
          src/components/Navigation.tsx
        </div>
      </div>
    </Shell>
  );
}
