import { Shell } from "@/components/shell";
import { SectionHeading } from "@/components/token-grid";
import { ComponentPreview, PropsTable, SourcePath, SubsectionHeading } from "@/components/component-preview";
import { NavItem } from "@ds/NavItem";
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

const SIZES: NavItemSize[] = ["sm", "md", "lg"];

const SIZE_META: Record<NavItemSize, { height: string; font: string; icon: string }> = {
  sm: { height: "24px", font: "12px", icon: "12px" },
  md: { height: "32px", font: "14px", icon: "16px" },
  lg: { height: "40px", font: "16px", icon: "20px" },
};

const code = `import { NavItem } from "@ds/NavItem";

<NavItem href="/home" icon={<Home />} active>Home</NavItem>
<NavItem href="/tokens" icon={<Palette />}>Tokens</NavItem>
<NavItem icon={<Layers />} collapsed>Components</NavItem>`;

const sizesCode = `import { NavItem } from "@ds/NavItem";

<NavItem size="sm" icon={<Home />}>Compact</NavItem>
<NavItem size="md" icon={<Home />}>Default</NavItem>
<NavItem size="lg" icon={<Home />}>Spacious</NavItem>`;

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

export default function NavItemPage() {
  return (
    <Shell title="NavItem">
      <div className="max-w-5xl space-y-10">
        <SectionHeading
          title="NavItem"
          description="Navigation list item with leading icon, three size variants (sm/md/lg), active state, collapsed icon-only mode, and trailing slots."
        />

        <ComponentPreview title="Sizes" description="Three sizes mapping to the lower half of Button's scale: sm (24px) for dense tool chrome, md (32px) for standard sidebars, lg (40px) for primary or mobile navigation." code={sizesCode}>
          <div className="flex gap-8 items-start">
            {SIZES.map((size) => (
              <div key={size} className="flex flex-col gap-1 w-56">
                <span className="text-xs font-mono text-muted-foreground mb-1">
                  {size} — {SIZE_META[size].height} · {SIZE_META[size].font} font · {SIZE_META[size].icon} icon
                </span>
                <NavItem href="#" size={size} icon={<Home />} active>Home</NavItem>
                <NavItem href="#" size={size} icon={<Palette />}>Tokens</NavItem>
                <NavItem href="#" size={size} icon={<Settings />} trailing={<span className="text-xs text-muted-foreground">3</span>}>Settings</NavItem>
              </div>
            ))}
          </div>
        </ComponentPreview>

        <ComponentPreview title="States" description="Default, active, and disabled states at the default (md) size." code={code}>
          <div className="flex flex-col gap-1 w-64">
            <NavItem href="#" icon={<Home />}>Home</NavItem>
            <NavItem href="#" icon={<Palette />} active>Tokens</NavItem>
            <NavItem href="#" icon={<Layers />} disabled>Disabled</NavItem>
            <NavItem href="#" icon={<Archive />} trailing={<span className="text-xs text-muted-foreground">12</span>}>Archive</NavItem>
          </div>
        </ComponentPreview>

        <ComponentPreview title="Collapsed" description="Icon-only mode at each size. Width matches height for a square hit target." code={`<NavItem size="sm" icon={<Home />} collapsed>Home</NavItem>\n<NavItem size="md" icon={<Home />} collapsed>Home</NavItem>\n<NavItem size="lg" icon={<Home />} collapsed>Home</NavItem>`}>
          <div className="flex gap-8 items-start">
            {SIZES.map((size) => (
              <div key={size} className="flex flex-col gap-1 items-start">
                <span className="text-xs font-mono text-muted-foreground mb-1">{size}</span>
                <NavItem href="#" size={size} icon={<Home />} collapsed>Home</NavItem>
                <NavItem href="#" size={size} icon={<Palette />} collapsed active>Tokens</NavItem>
                <NavItem href="#" size={size} icon={<Layers />} collapsed>Components</NavItem>
              </div>
            ))}
          </div>
        </ComponentPreview>

        <ComponentPreview title="With Badge" description="Pass a number, string, or custom Badge ReactNode. NavItem auto-selects the Badge size: sm → xxs, md → xs, lg → sm." code={badgeCode}>
          <div className="flex gap-8 items-start">
            {SIZES.map((size) => (
              <div key={size} className="flex flex-col gap-1 w-56">
                <span className="text-xs font-mono text-muted-foreground mb-1">{size}</span>
                <NavItem href="#" size={size} icon={<Bell />} badge={3}>Notifications</NavItem>
                <NavItem href="#" size={size} icon={<MessageSquare />} badge={12}>Messages</NavItem>
                <NavItem href="#" size={size} icon={<Star />} badge="NEW">Updates</NavItem>
                <NavItem href="#" size={size} icon={<Bell />} badge={<Badge size="xs" appearance="negative" emphasis="bold">5</Badge>}>Alerts</NavItem>
              </div>
            ))}
          </div>
        </ComponentPreview>

        <ComponentPreview title="Collapsed with Badge Overlay" description="Overlay badges use bold emphasis for maximum contrast against the NavItem surface. When active, the badge switches to the brand highlight color to match the active icon." code={badgeOverlayCode}>
          <div className="flex gap-8 items-start">
            {SIZES.map((size) => (
              <div key={size} className="flex flex-col gap-1 items-start">
                <span className="text-xs font-mono text-muted-foreground mb-1">{size}</span>
                <NavItem href="#" size={size} icon={<Bell />} badge={3} collapsed>Notifications</NavItem>
                <NavItem href="#" size={size} icon={<MessageSquare />} badge={12} collapsed active>Messages (active)</NavItem>
                <NavItem href="#" size={size} icon={<Star />} badge="NEW" collapsed>Updates</NavItem>
              </div>
            ))}
          </div>
        </ComponentPreview>

        <div>
          <SubsectionHeading>Props</SubsectionHeading>
          <PropsTable
            props={[
              { name: "icon", type: "ReactNode", description: "Leading icon slot." },
              { name: "size", type: '"sm" | "md" | "lg"', default: '"md"', description: "Item height and typography scale. sm = 24px, md = 32px, lg = 40px." },
              { name: "href", type: "string", description: "Renders as <a>. Omit for <button>." },
              { name: "active", type: "boolean", default: "false", description: "Active/selected state." },
              { name: "collapsed", type: "boolean", default: "false", description: "Icon-only mode." },
              { name: "badge", type: "ReactNode", description: "Badge content. Primitives (number/string) auto-wrap in <Badge> sized to the NavItem. In collapsed mode, renders as a positioned overlay." },
              { name: "trailing", type: "ReactNode", description: "Trailing slot (chevron, shortcut, etc.). Hidden when collapsed." },
              { name: "disabled", type: "boolean", default: "false", description: "Disables interaction." },
              { name: "children", type: "ReactNode", description: "Label text." },
            ]}
          />
        </div>

        <SourcePath path="src/components/ui/NavItem/NavItem.tsx · src/components/ui/NavItem/NavItem.module.scss" />
      </div>
    </Shell>
  );
}
