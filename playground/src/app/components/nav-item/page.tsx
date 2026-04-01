import { Shell } from "@/components/shell";
import { SectionHeading } from "@/components/token-grid";
import { ComponentPreview, PropsTable, SourcePath, SubsectionHeading } from "@/components/component-preview";
import { NavItem } from "@ds/NavItem";
import { Home, Palette, Layers, Archive } from "lucide-react";

const code = `import { NavItem } from "@ds/NavItem";

<NavItem href="/home" icon={<Home />} active>Home</NavItem>
<NavItem href="/tokens" icon={<Palette />}>Tokens</NavItem>
<NavItem icon={<Layers />} collapsed>Components</NavItem>`;

export default function NavItemPage() {
  return (
    <Shell title="NavItem">
      <div className="max-w-5xl space-y-10">
        <SectionHeading
          title="NavItem"
          description="28px-tall navigation list item with a 14px leading icon. Supports active state, collapsed icon-only mode, and trailing slots."
        />

        <ComponentPreview title="States" description="Default, active, and disabled states." code={code}>
          <div className="flex flex-col gap-1 w-64">
            <NavItem href="#" icon={<Home />}>Home</NavItem>
            <NavItem href="#" icon={<Palette />} active>Tokens</NavItem>
            <NavItem href="#" icon={<Layers />} disabled>Disabled</NavItem>
            <NavItem href="#" icon={<Archive />} trailing={<span className="text-xs text-muted-foreground">12</span>}>Archive</NavItem>
          </div>
        </ComponentPreview>

        <ComponentPreview title="Collapsed" description="Icon-only mode with tooltip via title attribute." code={`<NavItem icon={<Home />} collapsed>Home</NavItem>`}>
          <div className="flex flex-col gap-1 w-10">
            <NavItem href="#" icon={<Home />} collapsed>Home</NavItem>
            <NavItem href="#" icon={<Palette />} collapsed active>Tokens</NavItem>
            <NavItem href="#" icon={<Layers />} collapsed>Components</NavItem>
          </div>
        </ComponentPreview>

        <div>
          <SubsectionHeading>Props</SubsectionHeading>
          <PropsTable
            props={[
              { name: "icon", type: "ReactNode", description: "Leading icon slot (14px)." },
              { name: "href", type: "string", description: "Renders as <a>. Omit for <button>." },
              { name: "active", type: "boolean", default: "false", description: "Active/selected state." },
              { name: "collapsed", type: "boolean", default: "false", description: "Icon-only mode." },
              { name: "trailing", type: "ReactNode", description: "Trailing slot (chevron, badge, etc.)." },
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
