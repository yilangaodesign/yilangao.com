"use client";

import { Shell } from "@/components/shell";
import { SectionHeading } from "@/components/token-grid";
import { ComponentPreview, PropsTable, SourcePath, SubsectionHeading} from "@/components/component-preview";
import Navigation from "@ds/Navigation/Navigation";

const codeFrosted = `import { Navigation } from "@/components/ui/Navigation";

<Navigation />              // default: frosted
<Navigation appearance="frosted" />  // explicit`;

const codeSolid = `import { Navigation } from "@/components/ui/Navigation";

<Navigation appearance="solid" />`;

export default function NavigationPage() {
  return (
    <Shell title="Navigation">
      <div className="max-w-5xl space-y-10">
        <SectionHeading
          title="Navigation"
          description="Top-level navigation bar with logo mark, name, and route links. Two appearance variants: frosted (translucent blur) and solid (opaque). Active link detection via usePathname()."
        />

        <ComponentPreview
          title="Frosted (default)"
          description="Translucent background with backdrop blur. Best on pages where content scrolls behind the nav."
          code={codeFrosted}
        >
          <div className="w-full max-w-3xl border border-border rounded-sm overflow-hidden">
            <Navigation />
          </div>
        </ComponentPreview>

        <ComponentPreview
          title="Solid"
          description="Fully opaque terra-05 background, no blur. Use when the nav should be a clean surface boundary with no transparency."
          code={codeSolid}
        >
          <div className="w-full max-w-3xl border border-border rounded-sm overflow-hidden">
            <Navigation appearance="solid" />
          </div>
        </ComponentPreview>

        <div>
          <SubsectionHeading>Props</SubsectionHeading>
          <PropsTable
            props={[
              { name: "appearance", type: '"frosted" | "solid"', default: '"frosted"', description: "Background treatment. Frosted uses translucent terra-05 + backdrop blur. Solid uses fully opaque terra-05." },
            ]}
          />
        </div>

        <div>
          <SubsectionHeading>Notes</SubsectionHeading>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex gap-2">
              <span className="text-accent shrink-0">&bull;</span>
              Logo mark (<code className="text-xs bg-muted px-1.5 py-0.5 rounded-sm font-mono">/images/yg-logo.svg</code>) + name rendered in IBM Plex Serif at 2xl regular weight with accent-60 color.
            </li>
            <li className="flex gap-2">
              <span className="text-accent shrink-0">&bull;</span>
              Uses <code className="text-xs bg-muted px-1.5 py-0.5 rounded-sm font-mono">usePathname()</code> for active link state detection.
            </li>
            <li className="flex gap-2">
              <span className="text-accent shrink-0">&bull;</span>
              Styled via SCSS modules (<code className="text-xs bg-muted px-1.5 py-0.5 rounded-sm font-mono">Navigation.module.scss</code>), not inline styles.
            </li>
            <li className="flex gap-2">
              <span className="text-accent shrink-0">&bull;</span>
              Hover on logo text transitions to <code className="text-xs bg-muted px-1.5 py-0.5 rounded-sm font-mono">text-neutral-max</code> (darkest in DS).
            </li>
          </ul>
        </div>

        <SourcePath path="src/components/ui/Navigation/Navigation.tsx · src/components/ui/Navigation/Navigation.module.scss" />
      </div>
    </Shell>
  );
}
