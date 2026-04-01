"use client";

import { Shell } from "@/components/shell";
import { SectionHeading } from "@/components/token-grid";
import { ComponentPreview, PropsTable, SourcePath, SubsectionHeading} from "@/components/component-preview";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@ds/Dialog";
import { Button } from "@ds/Button";

function DialogDemo() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button appearance="neutral" emphasis="regular">
          Open dialog
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogTitle>Save changes?</DialogTitle>
        <DialogDescription>
          Your updates will be visible to collaborators. You can undo this action from the history
          panel for 24 hours.
        </DialogDescription>
        <DialogFooter>
          <DialogClose asChild>
            <Button appearance="neutral" emphasis="regular" size="sm">
              Cancel
            </Button>
          </DialogClose>
          <DialogClose asChild>
            <Button appearance="highlight" emphasis="bold" size="sm">
              Confirm
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

const code = `import {
  Dialog, DialogTrigger, DialogContent,
  DialogTitle, DialogDescription, DialogFooter, DialogClose,
} from "@ds/Dialog";
import { Button } from "@ds/Button";

<Dialog>
  <DialogTrigger asChild>
    <Button appearance="neutral" emphasis="regular">Open dialog</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogTitle>Save changes?</DialogTitle>
    <DialogDescription>Description text here.</DialogDescription>
    <DialogFooter>
      <DialogClose asChild>
        <Button appearance="neutral" emphasis="regular" size="sm">Cancel</Button>
      </DialogClose>
      <DialogClose asChild>
        <Button appearance="highlight" emphasis="bold" size="sm">Confirm</Button>
      </DialogClose>
    </DialogFooter>
  </DialogContent>
</Dialog>`;

export default function DialogPage() {
  return (
    <Shell title="Dialog">
      <div className="max-w-5xl space-y-10">
        <SectionHeading
          title="Dialog"
          description="Modal dialog compound component built on Radix UI: root controls open state, trigger opens the portal, content carries title, description, and footer actions."
        />

        <ComponentPreview
          title="Interactive demo"
          description="Button opens a modal with title, description, and Cancel / Confirm actions wired through DialogClose."
          code={code}
        >
          <DialogDemo />
        </ComponentPreview>

        <div>
          <SubsectionHeading>Compound parts</SubsectionHeading>
          <PropsTable
            props={[
              {
                name: "Dialog",
                type: "Root props (Radix)",
                description: "Wraps DialogPrimitive.Root; optional controlled open / onOpenChange.",
              },
              {
                name: "DialogTrigger",
                type: "Trigger props",
                description: "Opens the dialog. Use asChild to attach to a button.",
              },
              {
                name: "DialogContent",
                type: "{ children, className? }",
                description: "Portal, overlay, and focus-trapped panel with built-in close button.",
              },
              {
                name: "DialogTitle",
                type: "{ children, className? }",
                description: "Accessible title; required for screen readers.",
              },
              {
                name: "DialogDescription",
                type: "{ children, className? }",
                description: "Secondary text below the title.",
              },
              {
                name: "DialogFooter",
                type: "{ children, className? }",
                description: "Layout row for actions (not a Radix primitive).",
              },
              {
                name: "DialogClose",
                type: "Close props",
                description: "Closes the dialog; use asChild with buttons.",
              },
            ]}
          />
        </div>

        <SourcePath path="src/components/ui/Dialog/Dialog.tsx · src/components/ui/Dialog/Dialog.module.scss" />
      </div>
    </Shell>
  );
}
