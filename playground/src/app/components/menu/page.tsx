"use client";

import { Shell } from "@/components/shell";
import { SectionHeading } from "@/components/token-grid";
import {
  ComponentPreview,
  PropsTable,
  SourcePath,
  SubsectionHeading,
} from "@/components/component-preview";
import {
  Menu,
  MenuItem,
  MenuLabel,
  MenuSeparator,
  MenuHeader,
  MenuFooter,
} from "@ds/Menu";
import { Checkbox } from "@ds/Checkbox";
import { Button } from "@ds/Button";
import { Input } from "@ds/Input";
import { Kbd } from "@ds/index";
import Copy from "lucide-react/dist/esm/icons/copy";
import Pencil from "lucide-react/dist/esm/icons/pencil";
import Search from "lucide-react/dist/esm/icons/search";
import Settings from "lucide-react/dist/esm/icons/settings";
import Share from "lucide-react/dist/esm/icons/share";
import Trash2 from "lucide-react/dist/esm/icons/trash-2";
import User from "lucide-react/dist/esm/icons/user";
import type { MenuSize, MenuAppearance } from "@ds/Menu";

const basicCode = `<Menu>
  <MenuItem>Edit</MenuItem>
  <MenuItem>Copy</MenuItem>
  <MenuSeparator />
  <MenuItem destructive>Delete</MenuItem>
</Menu>`;

const leadingIconCode = `<Menu>
  <MenuItem leading={<Pencil />}>Edit</MenuItem>
  <MenuItem leading={<Copy />}>Copy</MenuItem>
  <MenuItem leading={<Share />}>Share</MenuItem>
  <MenuSeparator />
  <MenuItem leading={<Trash2 />} destructive>Delete</MenuItem>
</Menu>`;

const sizesCode = `<Menu size="xs">...</Menu>
<Menu size="sm">...</Menu>
<Menu size="md">...</Menu>
<Menu size="lg">...</Menu>
<Menu size="xl">...</Menu>`;

const appearanceCode = `<Menu appearance="neutral">...</Menu>
<Menu appearance="inverse">...</Menu>
<Menu appearance="always-dark">...</Menu>
<Menu appearance="always-light">...</Menu>`;

const sizes: MenuSize[] = ["xs", "sm", "md", "lg", "xl"];
const appearances: MenuAppearance[] = [
  "neutral",
  "inverse",
  "always-dark",
  "always-light",
];

function SampleItems({ withIcons }: { withIcons?: boolean }) {
  return (
    <>
      <MenuItem leading={withIcons ? <User className="w-full h-full" /> : undefined}>
        Profile
      </MenuItem>
      <MenuItem leading={withIcons ? <Settings className="w-full h-full" /> : undefined}>
        Settings
      </MenuItem>
      <MenuItem leading={withIcons ? <Copy className="w-full h-full" /> : undefined}>
        Copy link
      </MenuItem>
      <MenuSeparator />
      <MenuItem
        leading={withIcons ? <Trash2 className="w-full h-full" /> : undefined}
        destructive
      >
        Delete
      </MenuItem>
    </>
  );
}

export default function MenuPage() {
  return (
    <Shell title="Menu">
      <div className="max-w-5xl space-y-10">
        <SectionHeading
          title="Menu"
          description="Standalone visual primitive for actionable item lists. Composable with DropdownMenu (Radix) for popup behavior, or usable standalone for sidebars, selection panels, and action lists."
        />

        <ComponentPreview
          title="Basic"
          description="Plain text items with a destructive action."
          code={basicCode}
        >
          <Menu className="w-[200px]">
            <MenuItem>Edit</MenuItem>
            <MenuItem>Copy</MenuItem>
            <MenuSeparator />
            <MenuItem destructive>Delete</MenuItem>
          </Menu>
        </ComponentPreview>

        <ComponentPreview
          title="With leading icons"
          description="Icons in the leading slot are auto-sized to match the menu's size scale."
          code={leadingIconCode}
        >
          <Menu className="w-[220px]">
            <MenuItem leading={<Pencil className="w-full h-full" />}>
              Edit
            </MenuItem>
            <MenuItem leading={<Copy className="w-full h-full" />}>
              Copy
            </MenuItem>
            <MenuItem leading={<Share className="w-full h-full" />}>
              Share
            </MenuItem>
            <MenuSeparator />
            <MenuItem leading={<Trash2 className="w-full h-full" />} destructive>
              Delete
            </MenuItem>
          </Menu>
        </ComponentPreview>

        <ComponentPreview
          title="With checkbox leading"
          description="Checkbox in the leading slot for multi-select menus."
          code={`<Menu>\n  <MenuItem leading={<Checkbox size="sm" />}>Option A</MenuItem>\n</Menu>`}
        >
          <Menu className="w-[220px]">
            <MenuItem leading={<Checkbox size="sm" appearance="neutral" />}>
              Option A
            </MenuItem>
            <MenuItem leading={<Checkbox size="sm" appearance="neutral" defaultChecked />}>
              Option B
            </MenuItem>
            <MenuItem leading={<Checkbox size="sm" appearance="neutral" />}>
              Option C
            </MenuItem>
          </Menu>
        </ComponentPreview>

        <ComponentPreview
          title="With header, footer, and label"
          description="Header slot for search/filter, footer for secondary actions. Match nested component sizes to the Menu size so icons align visually. Use emphasis='regular' (box style) for inputs — the minimal underline conflicts with separator lines. The trailing slot accepts arbitrary content like Kbd shortcut hints."
          code={`<Menu size="md">\n  <MenuHeader>\n    <Input size="md" emphasis="regular" placeholder="Filter..."\n      leadingIcon={<Search />} trailing={<Kbd bordered>⌘F</Kbd>} />\n  </MenuHeader>\n  <MenuLabel>Group</MenuLabel>\n  <MenuItem>Item A</MenuItem>\n  <MenuFooter>\n    <Button size="md" emphasis="minimal" fullWidth>Manage...</Button>\n  </MenuFooter>\n</Menu>`}
        >
          <Menu className="w-[260px]">
            <MenuHeader>
              <Input
                size="md"
                emphasis="regular"
                placeholder="Filter actions..."
                leadingIcon={<Search className="w-full h-full" />}
                trailing={<Kbd bordered size="md">⌘F</Kbd>}
              />
            </MenuHeader>
            <MenuLabel>Actions</MenuLabel>
            <MenuItem leading={<Pencil className="w-full h-full" />}>
              Edit
            </MenuItem>
            <MenuItem leading={<Copy className="w-full h-full" />}>
              Duplicate
            </MenuItem>
            <MenuSeparator />
            <MenuLabel>Danger zone</MenuLabel>
            <MenuItem leading={<Trash2 className="w-full h-full" />} destructive>
              Delete
            </MenuItem>
            <MenuFooter>
              <Button size="md" emphasis="minimal" fullWidth>
                Manage actions...
              </Button>
            </MenuFooter>
          </Menu>
        </ComponentPreview>

        <SubsectionHeading>Sizes</SubsectionHeading>
        <p className="text-sm text-muted-foreground mb-4">
          Five sizes aligned with the Button spatial scale: xs, sm, md, lg, xl.
        </p>
        <div className="flex flex-wrap items-start gap-6">
          {sizes.map((size) => (
            <div key={size} className="space-y-1">
              <span className="text-xs font-mono text-muted-foreground">
                {size}
              </span>
              <Menu size={size} className="w-[180px]">
                <SampleItems withIcons />
              </Menu>
            </div>
          ))}
        </div>

        <SubsectionHeading>Appearances</SubsectionHeading>
        <p className="text-sm text-muted-foreground mb-4">
          Four appearance modes: neutral (theme-responsive), inverse
          (theme-responsive flipped), always-dark, and always-light.
        </p>
        <div className="flex flex-wrap items-start gap-6">
          {appearances.map((appearance) => (
            <div key={appearance} className="space-y-1">
              <span className="text-xs font-mono text-muted-foreground">
                {appearance}
              </span>
              <Menu appearance={appearance} className="w-[200px]">
                <SampleItems withIcons />
              </Menu>
            </div>
          ))}
        </div>

        <ComponentPreview
          title="Active state"
          description="The active prop marks the currently selected item."
          code={`<Menu>\n  <MenuItem active>Current</MenuItem>\n  <MenuItem>Other</MenuItem>\n</Menu>`}
        >
          <Menu className="w-[200px]">
            <MenuItem leading={<User className="w-full h-full" />} active>
              Profile
            </MenuItem>
            <MenuItem leading={<Settings className="w-full h-full" />}>
              Settings
            </MenuItem>
            <MenuItem leading={<Copy className="w-full h-full" />}>
              Copy link
            </MenuItem>
          </Menu>
        </ComponentPreview>

        <ComponentPreview
          title="Disabled items"
          description="Disabled items are dimmed and non-interactive."
          code={`<MenuItem disabled>Can't touch this</MenuItem>`}
        >
          <Menu className="w-[200px]">
            <MenuItem>Enabled</MenuItem>
            <MenuItem disabled>Disabled</MenuItem>
            <MenuItem>Also enabled</MenuItem>
          </Menu>
        </ComponentPreview>

        <div>
          <SubsectionHeading>Props</SubsectionHeading>
          <PropsTable
            props={[
              {
                name: "Menu.size",
                type: '"xs" | "sm" | "md" | "lg" | "xl"',
                default: '"md"',
                description:
                  "Controls item height, padding, font size, and icon size. Aligned with Button scale.",
              },
              {
                name: "Menu.appearance",
                type: '"neutral" | "inverse" | "always-dark" | "always-light"',
                default: '"neutral"',
                description:
                  "Surface color and text color of the menu container.",
              },
              {
                name: "MenuItem.leading",
                type: "ReactNode",
                description:
                  "Slot for leading content: icon, Checkbox, Avatar, etc. Auto-sized by the menu's size.",
              },
              {
                name: "MenuItem.trailing",
                type: "ReactNode",
                description:
                  "Slot for trailing content: keyboard shortcut, badge, chevron.",
              },
              {
                name: "MenuItem.destructive",
                type: "boolean",
                default: "false",
                description:
                  "Applies red destructive styling for dangerous actions.",
              },
              {
                name: "MenuItem.active",
                type: "boolean",
                default: "false",
                description:
                  "Marks the item as currently selected/active with a subtle fill.",
              },
              {
                name: "MenuItem.disabled",
                type: "boolean",
                default: "false",
                description: "Dims the item and prevents interaction.",
              },
              {
                name: "MenuItem.href",
                type: "string",
                description:
                  "When provided, renders as an anchor instead of a button.",
              },
            ]}
          />
        </div>

        <SourcePath path="src/components/ui/Menu" />
      </div>
    </Shell>
  );
}
