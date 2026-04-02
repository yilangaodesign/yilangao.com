"use client";

import { Shell } from "@/components/shell";
import { SectionHeading } from "@/components/token-grid";
import { ComponentPreview, PropsTable, SourcePath, SubsectionHeading} from "@/components/component-preview";
import ThemeToggle from "@ds/ThemeToggle/ThemeToggle";

const code = `import ThemeToggle from "@/components/ui/ThemeToggle";

// ThemeToggle is self-contained — no props needed.
// Uses useTheme() from next-themes with a hydration guard.

<ThemeToggle />`;

export default function ThemeTogglePage() {
  return (
    <Shell title="ThemeToggle">
      <div className="max-w-5xl space-y-10">
        <SectionHeading
          title="ThemeToggle"
          description="A button that toggles between light and dark themes using the ThemeProvider. Handles hydration with a mounted guard to avoid mismatches."
        />

        <ComponentPreview
          title="Interactive Demo"
          description="Click to toggle. In the actual app, this changes the site-wide theme via the ThemeProvider context."
          code={code}
        >
          <div className="flex flex-col items-center gap-4">
            <ThemeToggle />
          </div>
        </ComponentPreview>

        <div>
          <SubsectionHeading>Props</SubsectionHeading>
          <PropsTable
            props={[
              { name: "(none)", type: "—", description: "Self-contained — reads/writes theme via the ThemeProvider useTheme() hook." },
            ]}
          />
        </div>

        <div>
          <SubsectionHeading>Dependencies</SubsectionHeading>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex gap-2">
              <span className="text-accent shrink-0">&bull;</span>
              <code className="text-xs bg-muted px-1.5 py-0.5 rounded-sm font-mono">ThemeProvider</code> must wrap the app. Applies <code className="text-xs bg-muted px-1.5 py-0.5 rounded-sm font-mono">class=&quot;dark&quot;</code> to <code className="text-xs bg-muted px-1.5 py-0.5 rounded-sm font-mono">&lt;html&gt;</code>.
            </li>
            <li className="flex gap-2">
              <span className="text-accent shrink-0">&bull;</span>
              Hydration guard: renders <code className="text-xs bg-muted px-1.5 py-0.5 rounded-sm font-mono">null</code> until mounted to avoid mismatches.
            </li>
          </ul>
        </div>

        <SourcePath path="src/components/ThemeToggle.tsx · src/components/ThemeToggle.module.scss" />
      </div>
    </Shell>
  );
}
