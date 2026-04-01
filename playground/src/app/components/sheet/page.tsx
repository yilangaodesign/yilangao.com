"use client";

import { useState } from "react";
import { Shell } from "@/components/shell";
import { SectionHeading } from "@/components/token-grid";
import { ComponentPreview, PropsTable, SourcePath, SubsectionHeading } from "@/components/component-preview";
import { Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle, SheetBody, SheetFooter, SheetClose } from "@ds/Sheet";
import { Button } from "@ds/Button";

const code = `import { Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle, SheetBody, SheetFooter } from "@ds/Sheet";

<Sheet>
  <SheetTrigger asChild>
    <Button>Open Sheet</Button>
  </SheetTrigger>
  <SheetContent side="right">
    <SheetHeader><SheetTitle>Title</SheetTitle></SheetHeader>
    <SheetBody>Content here</SheetBody>
    <SheetFooter><Button>Save</Button></SheetFooter>
  </SheetContent>
</Sheet>`;

export default function SheetPage() {
  const [open, setOpen] = useState(false);

  return (
    <Shell title="Sheet">
      <div className="max-w-5xl space-y-10">
        <SectionHeading
          title="Sheet"
          description="Slide-in drawer panel built on Radix Dialog. Supports four directional sides with CSS slide transitions."
        />

        <ComponentPreview title="Right side (default)" description="Click to open a right-sliding sheet." code={code}>
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button>Open Sheet</Button>
            </SheetTrigger>
            <SheetContent side="right">
              <SheetHeader>
                <SheetTitle>Sheet Title</SheetTitle>
                <SheetClose asChild>
                  <Button iconOnly size="xs" emphasis="minimal" aria-label="Close">✕</Button>
                </SheetClose>
              </SheetHeader>
              <SheetBody>
                <p className="text-sm text-muted-foreground">Sheet body content goes here. The body is scrollable when content overflows.</p>
              </SheetBody>
              <SheetFooter>
                <Button size="sm" onClick={() => setOpen(false)}>Done</Button>
              </SheetFooter>
            </SheetContent>
          </Sheet>
        </ComponentPreview>

        <div>
          <SubsectionHeading>Props</SubsectionHeading>
          <PropsTable
            props={[
              { name: "side", type: '"left" | "right" | "top" | "bottom"', default: '"right"', description: "Direction the sheet slides in from." },
              { name: "children", type: "ReactNode", description: "Content inside the sheet panel." },
              { name: "className", type: "string", description: "Applied to the sheet panel." },
            ]}
          />
        </div>

        <SourcePath path="src/components/ui/Sheet/Sheet.tsx · src/components/ui/Sheet/Sheet.module.scss" />
      </div>
    </Shell>
  );
}
