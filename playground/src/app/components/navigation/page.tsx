"use client";

import { Shell } from "@/components/shell";
import { SectionHeading } from "@/components/token-grid";
import { ComponentPreview, PropsTable, SourcePath, SubsectionHeading} from "@/components/component-preview";
import Navigation from "@ds/Navigation/Navigation";

const code = `import Navigation from "@/components/ui/Navigation";

// Navigation is self-contained — no props needed.
// Uses usePathname() for active link detection and
// SCSS modules for styling.

<Navigation />`;

export default function NavigationPage() {
  return (
    <Shell title="Navigation">
      <div className="max-w-5xl space-y-10">
        <SectionHeading
          title="Navigation"
          description="Top-level navigation bar with route links. Uses SCSS modules with CSS custom properties for theming. Active link detection via usePathname()."
        />

        <ComponentPreview
          title="Default"
          description="Standard navigation layout with logo and links. Active state styling applied via SCSS module class."
          code={code}
        >
          <div className="w-full max-w-3xl border border-border rounded-sm overflow-hidden">
            <Navigation />
          </div>
        </ComponentPreview>

        <div>
          <SubsectionHeading>Props</SubsectionHeading>
          <PropsTable
            props={[
              { name: "(none)", type: "—", description: "Self-contained — links and routing are managed internally via usePathname()." },
            ]}
          />
        </div>

        <div>
          <SubsectionHeading>Notes</SubsectionHeading>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex gap-2">
              <span className="text-accent shrink-0">&bull;</span>
              Uses <code className="text-xs bg-muted px-1.5 py-0.5 rounded-sm font-mono">usePathname()</code> for active state detection.
            </li>
            <li className="flex gap-2">
              <span className="text-accent shrink-0">&bull;</span>
              Styled via SCSS modules (<code className="text-xs bg-muted px-1.5 py-0.5 rounded-sm font-mono">Navigation.module.scss</code>), not inline styles.
            </li>
          </ul>
        </div>

        <SourcePath path="src/components/Navigation.tsx · src/components/Navigation.module.scss" />
      </div>
    </Shell>
  );
}
