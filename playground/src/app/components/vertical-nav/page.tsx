"use client";

import { useState, type MouseEvent } from "react";
import { Shell } from "@/components/shell";
import { SectionHeading } from "@/components/token-grid";
import {
  ComponentPreview,
  PropsTable,
  SourcePath,
  SubsectionHeading,
} from "@/components/component-preview";
import {
  VerticalNavSection,
  VerticalNavGroup,
} from "@ds/VerticalNav";
import { NavItem, NavItemTrigger, NavItemChildren } from "@ds/NavItem";
import Home from "lucide-react/dist/esm/icons/home";
import Palette from "lucide-react/dist/esm/icons/palette";
import Layers from "lucide-react/dist/esm/icons/layers";
import Archive from "lucide-react/dist/esm/icons/archive";
import Shapes from "lucide-react/dist/esm/icons/shapes";
import Square from "lucide-react/dist/esm/icons/square";
import Tag from "lucide-react/dist/esm/icons/tag";
import Type from "lucide-react/dist/esm/icons/type";
import Compass from "lucide-react/dist/esm/icons/compass";

const prevent = (e: MouseEvent) => e.preventDefault();

const usageCode = `import {
  VerticalNav,
  VerticalNavProvider,
  VerticalNavHeader,
  VerticalNavContent,
  VerticalNavSection,
  VerticalNavGroup,
  VerticalNavCategory,
  VerticalNavFooter,
  VerticalNavSliverRegistry,
  VerticalNavSliver,
} from "@ds/VerticalNav";
import { NavItem } from "@ds/NavItem";

<VerticalNavProvider defaultCollapsed={false}>
  <VerticalNav>
    <VerticalNavHeader>Logo + Toggle</VerticalNavHeader>
    <VerticalNavContent>
      <VerticalNavSection label="Foundations">
        <NavItem href="/" icon={<Home />} active activeAppearance="brand">
          Overview
        </NavItem>
      </VerticalNavSection>
      <VerticalNavSection label="Components">
        <VerticalNavCategory
          id="base"
          label="Base"
          icon={<Shapes />}
          sliverContent={
            <VerticalNavSliver label="Base">
              <VerticalNavGroup label="Action">
                <NavItem href="/button" icon={<Square />}>
                  Button
                </NavItem>
              </VerticalNavGroup>
            </VerticalNavSliver>
          }
        />
      </VerticalNavSection>
    </VerticalNavContent>
    <VerticalNavFooter>
      <NavItem href="/archive" icon={<Archive />}>Archive</NavItem>
    </VerticalNavFooter>
  </VerticalNav>
</VerticalNavProvider>`;

const brandActiveCode = `import { NavItem } from "@ds/NavItem";

// Brand active — sidebar pattern: accent text, no resting bg
<NavItem icon={<Home />} active activeAppearance="brand" href="/home">
  Active (Brand)
</NavItem>

// Neutral active — default: solid gray background
<NavItem icon={<Home />} active activeAppearance="neutral" href="/home">
  Active (Neutral)
</NavItem>`;

const sectionCode = `import { VerticalNavSection } from "@ds/VerticalNav";
import { NavItem } from "@ds/NavItem";

<VerticalNavSection label="Foundations">
  <NavItem href="/" icon={<Home />} active activeAppearance="brand">
    Overview
  </NavItem>
  <NavItem href="/tokens" icon={<Palette />}>
    Styles
  </NavItem>
</VerticalNavSection>`;

const groupCode = `import { VerticalNavGroup } from "@ds/VerticalNav";
import { NavItem } from "@ds/NavItem";

// Groups appear inside category slivers as sub-headers
<VerticalNavGroup label="Action">
  <NavItem href="/button" icon={<Square />}>Button</NavItem>
</VerticalNavGroup>
<VerticalNavGroup label="Display">
  <NavItem href="/badge" icon={<Tag />}>Badge</NavItem>
</VerticalNavGroup>`;

const polymorphicCode = `import Link from "next/link";
import { NavItem } from "@ds/NavItem";

// Framework-agnostic: pass your router's Link via "as" prop
<NavItem as={Link} href="/components/button" icon={<Square />}>
  Button
</NavItem>`;

const categoryCode = `import { VerticalNavCategory, VerticalNavSliver, VerticalNavGroup } from "@ds/VerticalNav";
import { NavItem } from "@ds/NavItem";

// Category button triggers a hover-to-reveal sliver flyout.
// VerticalNavCategory now composes NavItem internally — the three visual states
// (default, expanded, active) come from NavItem's expanded/active/activeAppearance props.
<VerticalNavCategory
  id="base"
  label="Base"
  icon={<Shapes />}
  active={currentCategoryIsBase}
  sliverContent={
    <VerticalNavSliver label="Base">
      <VerticalNavGroup label="Action">
        <NavItem href="/button" icon={<Square />}>Button</NavItem>
      </VerticalNavGroup>
    </VerticalNavSliver>
  }
/>`;

const triggerCompositionCode = `import { NavItemTrigger, NavItemChildren, NavItem } from "@ds/NavItem";
import { VerticalNavGroup } from "@ds/VerticalNav";

// NavItemTrigger + NavItemChildren form the tiered navigation primitive.
// VerticalNavCategory composes these internally for its mobile accordion mode.
// You can also use them directly for non-sidebar navigation trees.
// When a child is active, the parent trigger must also be marked active.

<NavItemTrigger icon={<Shapes />} active activeAppearance="brand" defaultExpanded>
  Components
</NavItemTrigger>
<NavItemChildren expanded={true}>
  <VerticalNavGroup label="Action">
    <NavItem href="/button" icon={<Square />}>Button</NavItem>
  </VerticalNavGroup>
  <VerticalNavGroup label="Display">
    <NavItem href="/badge" icon={<Tag />} active activeAppearance="brand">Badge</NavItem>
  </VerticalNavGroup>
</NavItemChildren>`;

const navItemProps = [
  {
    name: "activeAppearance",
    type: '"neutral" | "brand"',
    default: '"neutral"',
    description:
      'Active state styling. "brand" uses accent color text with no resting background (sidebar pattern). "neutral" uses solid gray background (default).',
  },
  {
    name: "as",
    type: "ElementType",
    default: '"a"',
    description:
      "Polymorphic root element for link items. Pass your router's Link component (e.g., next/link) for client-side navigation.",
  },
];

const verticalNavProps = [
  {
    name: "children",
    type: "ReactNode",
    default: "—",
    description:
      "VerticalNavHeader, VerticalNavContent, and VerticalNavFooter subcomponents.",
  },
];

const providerProps = [
  {
    name: "defaultCollapsed",
    type: "boolean",
    default: "false",
    description: "Initial collapsed state of the sidebar.",
  },
  {
    name: "children",
    type: "ReactNode",
    default: "—",
    description: "App content — should include VerticalNav.",
  },
];

const categoryProps = [
  {
    name: "id",
    type: "string",
    default: "—",
    description: "Unique identifier for this category (used for sliver registry).",
  },
  {
    name: "label",
    type: "string",
    default: "—",
    description: "Display label for the category button.",
  },
  {
    name: "icon",
    type: "ReactNode",
    default: "—",
    description: "Leading icon for the category button.",
  },
  {
    name: "active",
    type: "boolean",
    default: "false",
    description: "Whether this category contains the current active page.",
  },
  {
    name: "sliverContent",
    type: "ReactNode",
    default: "—",
    description:
      "Content rendered in the flyout sliver panel. Should contain VerticalNavGroup and NavItem children.",
  },
];

const sectionProps = [
  {
    name: "label",
    type: "string",
    default: "—",
    description: "Section heading text. Shown as uppercase label when expanded, horizontal rule when collapsed.",
  },
  {
    name: "children",
    type: "ReactNode",
    default: "—",
    description: "NavItem or VerticalNavCategory children.",
  },
];

const groupProps = [
  {
    name: "label",
    type: "string",
    default: "—",
    description: "Sub-group heading label within a sliver.",
  },
  {
    name: "children",
    type: "ReactNode",
    default: "—",
    description: "NavItem children.",
  },
];

function TriggerCompositionDemo() {
  const [expanded, setExpanded] = useState(true);
  return (
    <div className="w-[200px]">
      <NavItemTrigger
        icon={<Shapes />}
        active
        activeAppearance="brand"
        expanded={expanded}
        onExpandedChange={setExpanded}
      >
        Components
      </NavItemTrigger>
      <NavItemChildren expanded={expanded}>
        <VerticalNavGroup label="Action">
          <NavItem href="#" onClick={prevent} icon={<Square />}>Button</NavItem>
        </VerticalNavGroup>
        <VerticalNavGroup label="Display">
          <NavItem href="#" onClick={prevent} icon={<Tag />} active activeAppearance="brand">Badge</NavItem>
          <NavItem href="#" onClick={prevent} icon={<Type />}>Typography</NavItem>
        </VerticalNavGroup>
      </NavItemChildren>
    </div>
  );
}

export default function VerticalNavPage() {
  return (
    <Shell title="VerticalNav">
      <div className="max-w-5xl space-y-10">
        <SectionHeading
          title="VerticalNav"
          description="Compound sidebar navigation component with collapsible/expanded states, mobile overlay, hover-to-reveal category slivers with safe-triangle protection, section dividers, and polymorphic link support. This playground's own sidebar is the canonical live example."
        />

        <ComponentPreview
          title="Brand vs Neutral Active"
          description="NavItem supports two active appearances. Use 'brand' in sidebar navigation (accent color, no resting background). Use 'neutral' for other contexts (solid gray background)."
          code={brandActiveCode}
        >
          <div className="flex flex-col gap-1 w-[200px]">
            <NavItem
              icon={<Home className="w-4 h-4" />}
              active
              activeAppearance="brand"
              href="#"
              onClick={prevent}
            >
              Active (Brand)
            </NavItem>
            <NavItem
              icon={<Layers className="w-4 h-4" />}
              active
              activeAppearance="neutral"
              href="#"
              onClick={prevent}
            >
              Active (Neutral)
            </NavItem>
            <NavItem
              icon={<Palette className="w-4 h-4" />}
              href="#"
              onClick={prevent}
            >
              Default (Inactive)
            </NavItem>
          </div>
        </ComponentPreview>

        <ComponentPreview
          title="Section Dividers"
          description="VerticalNavSection renders an uppercase label as a section divider. In collapsed mode it renders a horizontal rule instead."
          code={sectionCode}
        >
          <div className="w-[200px] flex flex-col gap-px">
            <VerticalNavSection label="Foundations">
              <NavItem
                icon={<Home className="w-4 h-4" />}
                active
                activeAppearance="brand"
                href="#"
                onClick={prevent}
              >
                Overview
              </NavItem>
              <NavItem
                icon={<Palette className="w-4 h-4" />}
                href="#"
                onClick={prevent}
              >
                Styles
              </NavItem>
            </VerticalNavSection>
            <VerticalNavSection label="Components">
              <NavItem
                icon={<Shapes className="w-4 h-4" />}
                href="#"
                onClick={prevent}
              >
                Base
              </NavItem>
              <NavItem
                icon={<Compass className="w-4 h-4" />}
                href="#"
                onClick={prevent}
              >
                Navigation
              </NavItem>
            </VerticalNavSection>
          </div>
        </ComponentPreview>

        <ComponentPreview
          title="Group Sub-Headers"
          description="VerticalNavGroup renders a sub-header label within a category sliver. Groups organize related NavItems."
          code={groupCode}
        >
          <div className="w-[200px] flex flex-col gap-px">
            <VerticalNavGroup label="Action">
              <NavItem
                icon={<Square className="w-4 h-4" />}
                active
                activeAppearance="brand"
                href="#"
                onClick={prevent}
              >
                Button
              </NavItem>
            </VerticalNavGroup>
            <VerticalNavGroup label="Display">
              <NavItem
                icon={<Tag className="w-4 h-4" />}
                href="#"
                onClick={prevent}
              >
                Badge
              </NavItem>
              <NavItem
                icon={<Type className="w-4 h-4" />}
                href="#"
                onClick={prevent}
              >
                Typography
              </NavItem>
            </VerticalNavGroup>
          </div>
        </ComponentPreview>

        <ComponentPreview
          title="Category Button States"
          description="VerticalNavCategory now composes NavItem internally. The three visual states come directly from NavItem's props: default (muted text), active (brand accent via activeAppearance='brand'), expanded (bold text via expanded prop — for when the sliver is open)."
          code={categoryCode}
        >
          <div className="w-[200px] flex flex-col gap-px">
            <NavItem icon={<Shapes />}>Default</NavItem>
            <NavItem icon={<Compass />} active activeAppearance="brand">Active (contains current page)</NavItem>
            <NavItem icon={<Layers />} expanded>Expanded (sliver open)</NavItem>
          </div>
        </ComponentPreview>

        <ComponentPreview
          title="Tiered Navigation (NavItemTrigger + NavItemChildren)"
          description="NavItemTrigger + NavItemChildren are the primitives that power VerticalNavCategory's mobile accordion mode. They can also be used directly for non-sidebar navigation trees. Click the trigger to toggle expand/collapse."
          code={triggerCompositionCode}
        >
          <TriggerCompositionDemo />
        </ComponentPreview>

        <ComponentPreview
          title="Full Composition"
          description="VerticalNav is a full-page layout component (position: fixed, 100vh). It cannot be embedded in a preview — this playground's own sidebar is the live example. The code below shows the complete composition pattern."
          code={usageCode}
        >
          <div className="text-sm text-muted-foreground text-center py-6">
            <p>VerticalNav uses <code className="font-mono text-xs bg-muted px-1 py-0.5 rounded">position: fixed</code> and <code className="font-mono text-xs bg-muted px-1 py-0.5 rounded">createPortal</code> for slivers.</p>
            <p className="mt-1">Look at this playground&apos;s sidebar (left) for the canonical live demo.</p>
          </div>
        </ComponentPreview>

        <ComponentPreview
          title="Polymorphic Link"
          description="Pass your framework's Link component via the 'as' prop for client-side navigation. VerticalNav itself does not import next/link."
          code={polymorphicCode}
        >
          <div className="text-sm text-muted-foreground text-center py-4">
            Framework-agnostic — consumers compose with their router&apos;s Link component.
          </div>
        </ComponentPreview>

        <SubsectionHeading
          title="Subcomponents"
          description="VerticalNav is composed of several subcomponents, each with a specific role."
        />

        <div className="space-y-6">
          <div>
            <h4 className="text-sm font-medium mb-2">VerticalNavProvider</h4>
            <PropsTable props={providerProps} />
          </div>

          <div>
            <h4 className="text-sm font-medium mb-2">VerticalNav</h4>
            <PropsTable props={verticalNavProps} />
          </div>

          <div>
            <h4 className="text-sm font-medium mb-2">VerticalNavSection</h4>
            <PropsTable props={sectionProps} />
          </div>

          <div>
            <h4 className="text-sm font-medium mb-2">VerticalNavCategory</h4>
            <PropsTable props={categoryProps} />
          </div>

          <div>
            <h4 className="text-sm font-medium mb-2">VerticalNavGroup</h4>
            <PropsTable props={groupProps} />
          </div>

          <div>
            <h4 className="text-sm font-medium mb-2">NavItem (Extended Props)</h4>
            <PropsTable props={navItemProps} />
          </div>
        </div>

        <SourcePath>src/components/ui/VerticalNav/VerticalNav.tsx</SourcePath>
      </div>
    </Shell>
  );
}
