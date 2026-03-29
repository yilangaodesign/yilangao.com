"use client";

import { Shell } from "@/components/shell";
import { SectionHeading } from "@/components/token-grid";
import { ComponentPreview, PropsTable } from "@/components/component-preview";

function FooterDemo() {
  return (
    <div className="w-full max-w-3xl border border-border rounded-sm overflow-hidden bg-white">
      <footer
        style={{
          padding: "3rem 2rem",
          width: "100%",
          borderTop: "1px solid #e0e0e0",
          color: "#525252",
          fontSize: "0.875rem",
        }}
      >
        <p>&copy; {new Date().getFullYear()} Yilan Gao</p>
      </footer>
    </div>
  );
}

const code = `export default function Footer() {
  return (
    <footer style={{
      padding: "3rem var(--page-padding)",
      maxWidth: "var(--container-max)",
      margin: "0 auto",
      width: "100%",
      borderTop: "1px solid var(--color-border)",
      color: "var(--color-text-muted)",
      fontSize: "0.875rem",
    }}>
      <p>&copy; {new Date().getFullYear()} Yilan Gao</p>
    </footer>
  );
}`;

export default function FooterPage() {
  return (
    <Shell title="Footer">
      <div className="max-w-5xl space-y-10">
        <SectionHeading
          title="Footer"
          description="Simple footer with copyright text. Uses inline styles and CSS variables."
        />

        <ComponentPreview
          title="Default"
          description="Standard footer with copyright notice."
          code={code}
        >
          <FooterDemo />
        </ComponentPreview>

        <div>
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-3">
            Props
          </h3>
          <PropsTable
            props={[
              { name: "(none)", type: "—", description: "This component takes no props. Year is computed automatically." },
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
              Relies on CSS variables: <code className="text-xs bg-muted px-1.5 py-0.5 rounded-sm font-mono">--page-padding</code>, <code className="text-xs bg-muted px-1.5 py-0.5 rounded-sm font-mono">--container-max</code>, <code className="text-xs bg-muted px-1.5 py-0.5 rounded-sm font-mono">--color-border</code>, <code className="text-xs bg-muted px-1.5 py-0.5 rounded-sm font-mono">--color-text-muted</code>.
            </li>
            <li className="flex gap-2">
              <span className="text-accent shrink-0">•</span>
              Server component — no client-side JS.
            </li>
          </ul>
        </div>

        <div className="text-xs font-mono text-muted-foreground p-3 rounded-sm bg-muted/50">
          src/components/Footer.tsx
        </div>
      </div>
    </Shell>
  );
}
