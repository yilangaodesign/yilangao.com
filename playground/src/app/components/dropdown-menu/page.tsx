"use client";

import { Shell } from "@/components/shell";
import { SectionHeading } from "@/components/token-grid";
import { ComponentPreview, PropsTable, SourcePath, SubsectionHeading} from "@/components/component-preview";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuLabel,
} from "@ds/DropdownMenu";
import { Button } from "@ds/Button";
import Copy from "lucide-react/dist/esm/icons/copy";
import CreditCard from "lucide-react/dist/esm/icons/credit-card";
import Keyboard from "lucide-react/dist/esm/icons/keyboard";
import LogOut from "lucide-react/dist/esm/icons/log-out";
import Pencil from "lucide-react/dist/esm/icons/pencil";
import Settings from "lucide-react/dist/esm/icons/settings";
import Share from "lucide-react/dist/esm/icons/share";
import Trash2 from "lucide-react/dist/esm/icons/trash-2";
import User from "lucide-react/dist/esm/icons/user";

const basicCode = `<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <button>Open menu</button>
  </DropdownMenuTrigger>
  <DropdownMenuContent>
    <DropdownMenuItem><Pencil /> Edit</DropdownMenuItem>
    <DropdownMenuItem><Copy /> Copy</DropdownMenuItem>
    <DropdownMenuSeparator />
    <DropdownMenuItem destructive><Trash2 /> Delete</DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>`;

const iconsCode = `<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <button>Account</button>
  </DropdownMenuTrigger>
  <DropdownMenuContent>
    <DropdownMenuItem><User /> Profile</DropdownMenuItem>
    <DropdownMenuItem><Settings /> Settings</DropdownMenuItem>
    <DropdownMenuItem><CreditCard /> Billing</DropdownMenuItem>
    <DropdownMenuItem><Keyboard /> Shortcuts</DropdownMenuItem>
    <DropdownMenuSeparator />
    <DropdownMenuItem><LogOut /> Log out</DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>`;

const shortcutsCode = `<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <button>Edit</button>
  </DropdownMenuTrigger>
  <DropdownMenuContent>
    <DropdownMenuItem>
      <Copy /> Copy
      <DropdownMenuShortcut>⌘C</DropdownMenuShortcut>
    </DropdownMenuItem>
    <DropdownMenuItem>
      Paste <DropdownMenuShortcut>⌘V</DropdownMenuShortcut>
    </DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>`;

const destructiveCode = `<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <button>Manage</button>
  </DropdownMenuTrigger>
  <DropdownMenuContent>
    <DropdownMenuItem><Pencil /> Edit</DropdownMenuItem>
    <DropdownMenuItem><Share /> Share</DropdownMenuItem>
    <DropdownMenuSeparator />
    <DropdownMenuItem destructive>
      <Trash2 /> Delete project
    </DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>`;

const groupedCode = `<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <button>More actions</button>
  </DropdownMenuTrigger>
  <DropdownMenuContent>
    <DropdownMenuItem><Pencil /> Edit</DropdownMenuItem>
    <DropdownMenuItem><Copy /> Copy link</DropdownMenuItem>
    <DropdownMenuSeparator />
    <DropdownMenuLabel>Share to…</DropdownMenuLabel>
    <DropdownMenuItem>Twitter</DropdownMenuItem>
    <DropdownMenuItem>LinkedIn</DropdownMenuItem>
    <DropdownMenuItem>Email</DropdownMenuItem>
    <DropdownMenuSeparator />
    <DropdownMenuItem destructive>
      <Trash2 /> Delete
    </DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>`;

export default function DropdownMenuPage() {
  return (
    <Shell title="DropdownMenu">
      <div className="max-w-5xl space-y-10">
        <SectionHeading
          title="DropdownMenu"
          description="Click-triggered floating menu with items, separators, keyboard shortcuts, and destructive actions."
        />

        <ComponentPreview
          title="Basic"
          description="Simple menu with edit, copy, and destructive delete actions."
          code={basicCode}
        >
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button appearance="neutral" emphasis="regular">Open menu</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem>
                <Pencil className="w-3.5 h-3.5 shrink-0" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Copy className="w-3.5 h-3.5 shrink-0" />
                Copy
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem destructive>
                <Trash2 className="w-3.5 h-3.5 shrink-0" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </ComponentPreview>

        <ComponentPreview
          title="With icons"
          description="Account menu with icons on every item."
          code={iconsCode}
        >
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button appearance="neutral" emphasis="regular">Account</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem>
                <User className="w-3.5 h-3.5 shrink-0" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="w-3.5 h-3.5 shrink-0" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuItem>
                <CreditCard className="w-3.5 h-3.5 shrink-0" />
                Billing
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Keyboard className="w-3.5 h-3.5 shrink-0" />
                Shortcuts
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <LogOut className="w-3.5 h-3.5 shrink-0" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </ComponentPreview>

        <ComponentPreview
          title="With shortcuts"
          description="Items showing keyboard shortcut hints on the right side."
          code={shortcutsCode}
        >
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button appearance="neutral" emphasis="regular">Edit</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem>
                <Copy className="w-3.5 h-3.5 shrink-0" />
                Copy
                <DropdownMenuShortcut>⌘C</DropdownMenuShortcut>
              </DropdownMenuItem>
              <DropdownMenuItem>
                Paste
                <DropdownMenuShortcut>⌘V</DropdownMenuShortcut>
              </DropdownMenuItem>
              <DropdownMenuItem>
                Cut
                <DropdownMenuShortcut>⌘X</DropdownMenuShortcut>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                Select all
                <DropdownMenuShortcut>⌘A</DropdownMenuShortcut>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </ComponentPreview>

        <ComponentPreview
          title="With destructive item"
          description="Dangerous actions are styled in red to signal irreversibility."
          code={destructiveCode}
        >
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button appearance="neutral" emphasis="regular">Manage</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem>
                <Pencil className="w-3.5 h-3.5 shrink-0" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Share className="w-3.5 h-3.5 shrink-0" />
                Share
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem destructive>
                <Trash2 className="w-3.5 h-3.5 shrink-0" />
                Delete project
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </ComponentPreview>

        <ComponentPreview
          title="With grouped items"
          description="Labeled groups organize related actions within a single menu."
          code={groupedCode}
        >
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button appearance="neutral" emphasis="regular">More actions</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem>
                <Pencil className="w-3.5 h-3.5 shrink-0" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Copy className="w-3.5 h-3.5 shrink-0" />
                Copy link
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuLabel>Share to&hellip;</DropdownMenuLabel>
              <DropdownMenuItem>Twitter</DropdownMenuItem>
              <DropdownMenuItem>LinkedIn</DropdownMenuItem>
              <DropdownMenuItem>Email</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem destructive>
                <Trash2 className="w-3.5 h-3.5 shrink-0" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </ComponentPreview>

        <div>
          <SubsectionHeading>Props</SubsectionHeading>
          <PropsTable
            props={[
              {
                name: "DropdownMenuContent.align",
                type: '"start" | "center" | "end"',
                default: '"end"',
                description: "Horizontal alignment of the menu relative to the trigger.",
              },
              {
                name: "DropdownMenuContent.sideOffset",
                type: "number",
                default: "4",
                description: "Vertical gap in pixels between trigger and menu.",
              },
              {
                name: "DropdownMenuItem.destructive",
                type: "boolean",
                default: "false",
                description: "Applies destructive (red) styling to the item.",
              },
              {
                name: "DropdownMenuItem.disabled",
                type: "boolean",
                default: "false",
                description: "Prevents interaction and dims the item.",
              },
              {
                name: "DropdownMenuItem.onSelect",
                type: "() => void",
                description: "Callback when the item is selected.",
              },
            ]}
          />
        </div>

        <SourcePath path="src/components/ui/DropdownMenu" />
      </div>
    </Shell>
  );
}
