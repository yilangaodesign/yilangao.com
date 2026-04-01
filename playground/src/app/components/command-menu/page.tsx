"use client";

import { useState } from "react";
import { Shell } from "@/components/shell";
import { SectionHeading } from "@/components/token-grid";
import { ComponentPreview, PropsTable, SourcePath, SubsectionHeading } from "@/components/component-preview";
import { CommandMenu, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from "@ds/CommandMenu";
import { Button } from "@ds/Button";
import { Home, Palette, Layers, Square } from "lucide-react";

const code = `import { CommandMenu, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from "@ds/CommandMenu";

<CommandMenu open={open} onOpenChange={setOpen}>
  <CommandInput placeholder="Search..." />
  <CommandList>
    <CommandEmpty>No results found.</CommandEmpty>
    <CommandGroup heading="Pages">
      <CommandItem icon={<Home />} onSelect={() => {}}>Home</CommandItem>
    </CommandGroup>
  </CommandList>
</CommandMenu>`;

export default function CommandMenuPage() {
  const [open, setOpen] = useState(false);

  return (
    <Shell title="CommandMenu">
      <div className="max-w-5xl space-y-10">
        <SectionHeading
          title="CommandMenu"
          description="Command palette built on cmdk + Radix Dialog. Supports keyboard navigation, grouped items, and Cmd+K global shortcut."
        />

        <ComponentPreview title="Basic command menu" description="Click to open, then type to filter." code={code}>
          <Button onClick={() => setOpen(true)}>Open Command Menu (⌘K)</Button>
          <CommandMenu open={open} onOpenChange={setOpen}>
            <CommandInput placeholder="Search components..." />
            <CommandList>
              <CommandEmpty>No results found.</CommandEmpty>
              <CommandGroup heading="Pages">
                <CommandItem icon={<Home />} onSelect={() => setOpen(false)}>Home</CommandItem>
              </CommandGroup>
              <CommandGroup heading="Components">
                <CommandItem icon={<Square />} onSelect={() => setOpen(false)}>Button</CommandItem>
                <CommandItem icon={<Palette />} onSelect={() => setOpen(false)}>Badge</CommandItem>
                <CommandItem icon={<Layers />} onSelect={() => setOpen(false)}>Card</CommandItem>
              </CommandGroup>
            </CommandList>
          </CommandMenu>
        </ComponentPreview>

        <div>
          <SubsectionHeading>Props</SubsectionHeading>
          <PropsTable
            props={[
              { name: "open", type: "boolean", description: "Controlled open state." },
              { name: "onOpenChange", type: "(open: boolean) => void", description: "Called when open state changes." },
              { name: "children", type: "ReactNode", description: "CommandInput + CommandList composition." },
            ]}
          />
        </div>

        <SourcePath path="src/components/ui/CommandMenu/CommandMenu.tsx · src/components/ui/CommandMenu/CommandMenu.module.scss" />
      </div>
    </Shell>
  );
}
