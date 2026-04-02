"use client";

import { useState, type MouseEvent } from "react";
import { Shell } from "@/components/shell";
import { SectionHeading } from "@/components/token-grid";
import { ComponentPreview, PropsTable, SourcePath, SubsectionHeading } from "@/components/component-preview";
import { NavItem, NavItemTrigger, NavItemChildren } from "@ds/NavItem";
import type { NavItemSize } from "@ds/NavItem";
import { Badge } from "@ds/Badge";
import Home from "lucide-react/dist/esm/icons/home";
import Palette from "lucide-react/dist/esm/icons/palette";
import Layers from "lucide-react/dist/esm/icons/layers";
import Archive from "lucide-react/dist/esm/icons/archive";
import Settings from "lucide-react/dist/esm/icons/settings";
import Bell from "lucide-react/dist/esm/icons/bell";
import MessageSquare from "lucide-react/dist/esm/icons/message-square";
import Star from "lucide-react/dist/esm/icons/star";
import FolderOpen from "lucide-react/dist/esm/icons/folder-open";
import FileText from "lucide-react/dist/esm/icons/file-text";

const prevent = (e: MouseEvent) => e.preventDefault();

const SIZES: NavItemSize[] = ["sm", "md", "lg", "touch"];

const SIZE_META: Record<NavItemSize, { height: string; font: string; icon: string }> = {
  sm:    { height: "24px", font: "12px", icon: "12px" },
  md:    { height: "32px", font: "14px", icon: "16px" },
  lg:    { height: "40px", font: "16px", icon: "20px" },
  touch: { height: "44px", font: "16px", icon: "20px" },
};

const code = `import { NavItem } from "@ds/NavItem";

<NavItem href="/home" icon={<Home />} active>Home</NavItem>
<NavItem href="/tokens" icon={<Palette />}>Tokens</NavItem>
<NavItem icon={<Layers />} collapsed>Components</NavItem>`;

const sizesCode = `import { NavItem } from "@ds/NavItem";

<NavItem size="sm" icon={<Home />}>Compact</NavItem>
<NavItem size="md" icon={<Home />}>Default</NavItem>
<NavItem size="lg" icon={<Home />}>Spacious</NavItem>
<NavItem size="touch" icon={<Home />}>Touch</NavItem>`;

const badgeCode = `import { NavItem } from "@ds/NavItem";

// Primitive badge — auto-wrapped in <Badge> with size matched to NavItem
<NavItem icon={<Bell />} badge={3}>Notifications</NavItem>
<NavItem icon={<MessageSquare />} badge={12}>Messages</NavItem>
<NavItem icon={<Star />} badge="NEW">Updates</NavItem>

// Custom Badge ReactNode — rendered as-is (escape hatch)
<NavItem icon={<Bell />} badge={<Badge size="xs" appearance="negative" emphasis="bold">5</Badge>}>
  Alerts
</NavItem>`;

const badgeOverlayCode = `// Collapsed mode: badge renders as a positioned overlay
<NavItem icon={<Bell />} badge={3} collapsed>Notifications</NavItem>
<NavItem icon={<MessageSquare />} badge={12} collapsed>Messages</NavItem>`;

const expandedStateCode = `import { NavItem, NavItemTrigger } from "@ds/NavItem";

// The four visual states of NavItem:
<NavItem icon={<Home />}>Default</NavItem>
<NavItem icon={<Palette />} active>Active (neutral)</NavItem>
<NavItem icon={<Palette />} active activeAppearance="brand">Active (brand)</NavItem>

// Expanded state — uses NavItemTrigger which composes NavItem
// with an auto-rotating chevron in the trailing slot
<NavItemTrigger icon={<Layers />} expanded>Expanded</NavItemTrigger>`;

const expandableBadgeCode = `import { NavItemTrigger } from "@ds/NavItem";

// Badge + chevron coexist — badge sits between label and chevron.
// Both are right-aligned via margin-inline-start: auto.
<NavItemTrigger icon={<Bell />} badge={3}>Notifications</NavItemTrigger>
<NavItemTrigger icon={<MessageSquare />} badge={12} expanded>Messages</NavItemTrigger>
<NavItemTrigger icon={<Star />} badge="NEW">Updates</NavItemTrigger>`;

const triggerCode = `import { NavItemTrigger, NavItemChildren, NavItem } from "@ds/NavItem";

// Uncontrolled — manages its own open/close state
<NavItemTrigger icon={<FolderOpen />}>
  Components
</NavItemTrigger>

// Controlled — parent manages expanded state
const [open, setOpen] = useState(false);
<NavItemTrigger
  icon={<FolderOpen />}
  expanded={open}
  onExpandedChange={setOpen}
>
  Components
</NavItemTrigger>`;

const childrenCode = `import { NavItemTrigger, NavItemChildren, NavItem } from "@ds/NavItem";

// NavItemTrigger + NavItemChildren compose a tiered navigation tree.
// NavItemChildren animates expand/collapse with the nav motion token (200ms ease-out).

<div>
  <NavItemTrigger icon={<FolderOpen />} defaultExpanded>
    Components
  </NavItemTrigger>
  <NavItemChildren expanded={true}>
    <NavItem href="#" icon={<FileText />}>Button</NavItem>
    <NavItem href="#" icon={<FileText />}>Dialog</NavItem>
    <NavItem href="#" icon={<FileText />} active activeAppearance="brand">Tabs</NavItem>
  </NavItemChildren>
</div>`;

function ExpandableDemo() {
  const [expanded, setExpanded] = useState(true);
  return (
    <div className="w-64">
      <NavItemTrigger
        icon={<FolderOpen />}
        expanded={expanded}
        onExpandedChange={setExpanded}
      >
        Components
      </NavItemTrigger>
      <NavItemChildren expanded={expanded}>
        <NavItem href="#" onClick={prevent} icon={<FileText />}>Button</NavItem>
        <NavItem href="#" onClick={prevent} icon={<FileText />}>Dialog</NavItem>
        <NavItem href="#" onClick={prevent} icon={<FileText />} active activeAppearance="brand">Tabs</NavItem>
      </NavItemChildren>
    </div>
  );
}

function UncontrolledDemo() {
  return (
    <div className="w-64">
      <UncontrolledGroup label="Tokens" defaultExpanded={false}>
        <NavItem href="#" onClick={prevent} icon={<FileText />}>Colors</NavItem>
        <NavItem href="#" onClick={prevent} icon={<FileText />}>Typography</NavItem>
        <NavItem href="#" onClick={prevent} icon={<FileText />}>Spacing</NavItem>
      </UncontrolledGroup>
      <UncontrolledGroup label="Components" defaultExpanded>
        <NavItem href="#" onClick={prevent} icon={<FileText />}>Button</NavItem>
        <NavItem href="#" onClick={prevent} icon={<FileText />}>Dialog</NavItem>
        <NavItem href="#" onClick={prevent} icon={<FileText />} active activeAppearance="brand">NavItem</NavItem>
      </UncontrolledGroup>
    </div>
  );
}

function UncontrolledGroup({ label, defaultExpanded = false, children }: { label: string; defaultExpanded?: boolean; children: React.ReactNode }) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  return (
    <div>
      <NavItemTrigger
        icon={<FolderOpen />}
        expanded={expanded}
        onExpandedChange={setExpanded}
      >
        {label}
      </NavItemTrigger>
      <NavItemChildren expanded={expanded}>
        {children}
      </NavItemChildren>
    </div>
  );
}

export default function NavItemPage() {
  return (
    <Shell title="NavItem">
      <div className="max-w-5xl space-y-10">
        <SectionHeading
          title="NavItem"
          description="Navigation list item with leading icon, four size variants (sm/md/lg/touch), four visual states (default/hover/expanded/active), collapsed icon-only mode, trailing slots, and tiered parent/children composition via NavItemTrigger + NavItemChildren."
        />

        <ComponentPreview title="Sizes" description="Four sizes: sm (24px) for dense tool chrome, md (32px) for standard sidebars, lg (40px) for primary navigation, touch (44px) for mobile/touch targets meeting Apple HIG minimum." code={sizesCode}>
          <div className="flex gap-8 items-start">
            {SIZES.map((size) => (
              <div key={size} className="flex flex-col gap-1 w-56">
                <span className="text-xs font-mono text-muted-foreground mb-1">
                  {size} — {SIZE_META[size].height} · {SIZE_META[size].font} font · {SIZE_META[size].icon} icon
                </span>
                <NavItem href="#" onClick={prevent} size={size} icon={<Home />} active>Home</NavItem>
                <NavItem href="#" onClick={prevent} size={size} icon={<Palette />}>Tokens</NavItem>
                <NavItem href="#" onClick={prevent} size={size} icon={<Settings />} trailing={<span className="text-xs text-muted-foreground">3</span>}>Settings</NavItem>
              </div>
            ))}
          </div>
        </ComponentPreview>

        <ComponentPreview title="Four Visual States" description="NavItem implements the navigation design doc's four-state model: Default (muted text, no bg), Hover (neutral surface + bold text — hover to see), Expanded (bold text, medium weight, chevron rotated — for open parent items), Active (brand or neutral accent)." code={expandedStateCode}>
          <div className="flex flex-col gap-1 w-64">
            <NavItem href="#" onClick={prevent} icon={<Home />}>Default</NavItem>
            <NavItem href="#" onClick={prevent} icon={<Palette />} active>Active (neutral)</NavItem>
            <NavItem href="#" onClick={prevent} icon={<Palette />} active activeAppearance="brand">Active (brand)</NavItem>
            <NavItemTrigger icon={<Layers />} expanded={true} onExpandedChange={() => {}}>Expanded</NavItemTrigger>
            <NavItem href="#" onClick={prevent} icon={<Archive />} disabled>Disabled</NavItem>
          </div>
        </ComponentPreview>

        <ComponentPreview title="States" description="Default, active, and disabled states at the default (md) size." code={code}>
          <div className="flex flex-col gap-1 w-64">
            <NavItem href="#" onClick={prevent} icon={<Home />}>Home</NavItem>
            <NavItem href="#" onClick={prevent} icon={<Palette />} active>Tokens</NavItem>
            <NavItem href="#" onClick={prevent} icon={<Layers />} disabled>Disabled</NavItem>
            <NavItem href="#" onClick={prevent} icon={<Archive />} trailing={<span className="text-xs text-muted-foreground">12</span>}>Archive</NavItem>
          </div>
        </ComponentPreview>

        <ComponentPreview title="Collapsed" description="Icon-only mode at each size. Width matches height for a square hit target." code={`<NavItem size="sm" icon={<Home />} collapsed>Home</NavItem>\n<NavItem size="md" icon={<Home />} collapsed>Home</NavItem>\n<NavItem size="lg" icon={<Home />} collapsed>Home</NavItem>\n<NavItem size="touch" icon={<Home />} collapsed>Home</NavItem>`}>
          <div className="flex gap-8 items-start">
            {SIZES.map((size) => (
              <div key={size} className="flex flex-col gap-1 items-start">
                <span className="text-xs font-mono text-muted-foreground mb-1">{size}</span>
                <NavItem href="#" onClick={prevent} size={size} icon={<Home />} collapsed>Home</NavItem>
                <NavItem href="#" onClick={prevent} size={size} icon={<Palette />} collapsed active>Tokens</NavItem>
                <NavItem href="#" onClick={prevent} size={size} icon={<Layers />} collapsed>Components</NavItem>
              </div>
            ))}
          </div>
        </ComponentPreview>

        <ComponentPreview title="With Badge" description="Pass a number, string, or custom Badge ReactNode. NavItem auto-selects the Badge size: sm → xxs, md → xs, lg → sm." code={badgeCode}>
          <div className="flex gap-8 items-start">
            {SIZES.map((size) => (
              <div key={size} className="flex flex-col gap-1 w-56">
                <span className="text-xs font-mono text-muted-foreground mb-1">{size}</span>
                <NavItem href="#" onClick={prevent} size={size} icon={<Bell />} badge={3}>Notifications</NavItem>
                <NavItem href="#" onClick={prevent} size={size} icon={<MessageSquare />} badge={12}>Messages</NavItem>
                <NavItem href="#" onClick={prevent} size={size} icon={<Star />} badge="NEW">Updates</NavItem>
                <NavItem href="#" onClick={prevent} size={size} icon={<Bell />} badge={<Badge size="xs" appearance="negative" emphasis="bold">5</Badge>}>Alerts</NavItem>
              </div>
            ))}
          </div>
        </ComponentPreview>

        <ComponentPreview title="Collapsed with Badge Overlay" description="Overlay badges use bold emphasis for maximum contrast against the NavItem surface. When active, the badge switches to the brand highlight color to match the active icon." code={badgeOverlayCode}>
          <div className="flex gap-8 items-start">
            {SIZES.map((size) => (
              <div key={size} className="flex flex-col gap-3 items-start">
                <span className="text-xs font-mono text-muted-foreground">{size}</span>
                <NavItem href="#" onClick={prevent} size={size} icon={<Bell />} badge={3} collapsed>Notifications</NavItem>
                <NavItem href="#" onClick={prevent} size={size} icon={<MessageSquare />} badge={12} collapsed active>Messages (active)</NavItem>
                <NavItem href="#" onClick={prevent} size={size} icon={<Star />} badge="NEW" collapsed>Updates</NavItem>
              </div>
            ))}
          </div>
        </ComponentPreview>

        <ComponentPreview title="Expandable with Badge" description="NavItemTrigger supports the badge prop — badge and chevron coexist in the trailing area, both pushed to the far right. The badge sits between the label and the chevron." code={expandableBadgeCode}>
          <div className="flex gap-8 items-start">
            {SIZES.map((size) => (
              <div key={size} className="flex flex-col gap-1 w-56">
                <span className="text-xs font-mono text-muted-foreground mb-1">{size}</span>
                <NavItemTrigger icon={<Bell />} size={size} badge={3} expanded={false} onExpandedChange={() => {}}>Notifications</NavItemTrigger>
                <NavItemTrigger icon={<MessageSquare />} size={size} badge={12} expanded={true} onExpandedChange={() => {}}>Messages</NavItemTrigger>
                <NavItemTrigger icon={<Star />} size={size} badge="NEW" expanded={false} onExpandedChange={() => {}}>Updates</NavItemTrigger>
                <NavItemTrigger icon={<Bell />} size={size} badge={<Badge size="xs" appearance="negative" emphasis="bold">5</Badge>} expanded={true} onExpandedChange={() => {}}>Alerts</NavItemTrigger>
              </div>
            ))}
          </div>
        </ComponentPreview>

        <ComponentPreview title="Expandable Parent (NavItemTrigger)" description="NavItemTrigger composes NavItem internally, adding an auto-rotating chevron in the trailing slot and expand/collapse behavior. Supports both controlled (expanded + onExpandedChange) and uncontrolled (defaultExpanded) patterns. When expanded and not active, NavItem renders in the Expanded visual state (bold text, medium weight)." code={triggerCode}>
          <div className="flex gap-8 items-start">
            <div className="flex flex-col gap-2 w-64">
              <span className="text-xs font-mono text-muted-foreground mb-1">Controlled</span>
              <ExpandableDemo />
            </div>
            <div className="flex flex-col gap-2 w-64">
              <span className="text-xs font-mono text-muted-foreground mb-1">Uncontrolled (multiple groups)</span>
              <UncontrolledDemo />
            </div>
          </div>
        </ComponentPreview>

        <ComponentPreview title="Tiered Navigation (NavItemChildren)" description="NavItemChildren is the animated collapsible container for child NavItems. It uses the nav motion token (200ms ease-out) for smooth height transitions. Together with NavItemTrigger, they form a two-tier navigation tree — the same pattern that VerticalNav's categories compose." code={childrenCode}>
          <div className="flex gap-8 items-start">
            <div className="flex flex-col gap-2 w-64">
              <span className="text-xs font-mono text-muted-foreground mb-1">Active child with brand accent</span>
              <ExpandableDemo />
            </div>
          </div>
        </ComponentPreview>

        <div>
          <SubsectionHeading>NavItem Props</SubsectionHeading>
          <PropsTable
            props={[
              { name: "icon", type: "ReactNode", description: "Leading icon slot." },
              { name: "size", type: '"sm" | "md" | "lg" | "touch"', default: '"md"', description: "Item height and typography scale. sm = 24px, md = 32px, lg = 40px, touch = 44px." },
              { name: "href", type: "string", description: "Renders as <a>. Omit for <button>." },
              { name: "as", type: "ElementType", description: "Polymorphic link component (e.g., next/link). Only applies when href is set." },
              { name: "active", type: "boolean", default: "false", description: "Active/selected state (current page)." },
              { name: "activeAppearance", type: '"neutral" | "brand"', default: '"neutral"', description: 'Visual style when active. "brand" uses the accent color.' },
              { name: "expanded", type: "boolean", default: "false", description: "Expanded state (parent is open, not on this page). Bold text, medium weight, no resting bg." },
              { name: "collapsed", type: "boolean", default: "false", description: "Icon-only mode." },
              { name: "badge", type: "ReactNode", description: "Badge content. Primitives (number/string) auto-wrap in <Badge> sized to the NavItem. In collapsed mode, renders as a positioned overlay." },
              { name: "trailing", type: "ReactNode", description: "Trailing slot (chevron, shortcut, etc.). Hidden when collapsed." },
              { name: "disabled", type: "boolean", default: "false", description: "Disables interaction." },
              { name: "children", type: "ReactNode", description: "Label text." },
            ]}
          />
        </div>

        <div>
          <SubsectionHeading>NavItemTrigger Props</SubsectionHeading>
          <PropsTable
            props={[
              { name: "icon", type: "ReactNode", description: "Leading icon slot (passed to NavItem)." },
              { name: "size", type: '"sm" | "md" | "lg" | "touch"', default: '"md"', description: "Size variant (passed to NavItem)." },
              { name: "active", type: "boolean", default: "false", description: "Active state (passed to NavItem)." },
              { name: "activeAppearance", type: '"neutral" | "brand"', default: '"neutral"', description: 'Active appearance (passed to NavItem).' },
              { name: "expanded", type: "boolean", description: "Controlled expanded state. When set, component is controlled." },
              { name: "defaultExpanded", type: "boolean", default: "false", description: "Initial expanded state for uncontrolled mode." },
              { name: "onExpandedChange", type: "(expanded: boolean) => void", description: "Callback when expanded state changes." },
              { name: "badge", type: "ReactNode", description: "Badge content (passed to NavItem). Renders between label and chevron." },
              { name: "collapsed", type: "boolean", default: "false", description: "Icon-only mode (hides label + chevron)." },
              { name: "disabled", type: "boolean", default: "false", description: "Disables interaction." },
              { name: "children", type: "ReactNode", description: "Label text." },
            ]}
          />
        </div>

        <div>
          <SubsectionHeading>NavItemChildren Props</SubsectionHeading>
          <PropsTable
            props={[
              { name: "expanded", type: "boolean", description: "Whether the children container is expanded (visible) or collapsed (hidden). Controls the animated height transition." },
              { name: "children", type: "ReactNode", description: "Child NavItems or other content to render inside the collapsible container." },
            ]}
          />
        </div>

        <SourcePath path="src/components/ui/NavItem/NavItem.tsx · NavItemTrigger.tsx · NavItemChildren.tsx · NavItem.module.scss" />
      </div>
    </Shell>
  );
}
