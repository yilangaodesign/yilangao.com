"use client";

import { Shell } from "@/components/shell";
import { SectionHeading } from "@/components/token-grid";
import { ComponentPreview, PropsTable, SourcePath, SubsectionHeading } from "@/components/component-preview";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@ds/AlertDialog";
import { Button } from "@ds/Button";

function AlertDialogDemo() {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button appearance="negative" emphasis="regular">
          Delete project
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogTitle>Delete project?</AlertDialogTitle>
        <AlertDialogDescription>
          This cannot be undone. All sections, blocks, and assets attached to the project will be permanently removed.
        </AlertDialogDescription>
        <AlertDialogFooter>
          <AlertDialogCancel asChild>
            <Button appearance="neutral" emphasis="regular" size="sm">
              Cancel
            </Button>
          </AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button appearance="negative" emphasis="bold" size="sm">
              Delete
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

const code = `import {
  AlertDialog, AlertDialogTrigger, AlertDialogContent,
  AlertDialogTitle, AlertDialogDescription,
  AlertDialogFooter, AlertDialogCancel, AlertDialogAction,
} from "@ds/AlertDialog";
import { Button } from "@ds/Button";

<AlertDialog>
  <AlertDialogTrigger asChild>
    <Button appearance="negative" emphasis="regular">Delete project</Button>
  </AlertDialogTrigger>
  <AlertDialogContent>
    <AlertDialogTitle>Delete project?</AlertDialogTitle>
    <AlertDialogDescription>This cannot be undone.</AlertDialogDescription>
    <AlertDialogFooter>
      <AlertDialogCancel asChild>
        <Button appearance="neutral" emphasis="regular" size="sm">Cancel</Button>
      </AlertDialogCancel>
      <AlertDialogAction asChild>
        <Button appearance="negative" emphasis="bold" size="sm">Delete</Button>
      </AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>`;

export default function AlertDialogPage() {
  return (
    <Shell title="AlertDialog">
      <div className="max-w-5xl space-y-10">
        <SectionHeading
          title="AlertDialog"
          description="Destructive confirmation dialog built on Radix UI's AlertDialog primitive. Use for delete confirmations and other irreversible actions. Unlike Dialog, it traps focus until Cancel or Action is explicitly chosen — clicks outside do not dismiss."
        />

        <ComponentPreview
          title="Interactive demo"
          description="Destructive confirmation with Cancel (neutral) and Delete (negative) actions. Cancel is required; focus is trapped until a decision is made."
          code={code}
        >
          <AlertDialogDemo />
        </ComponentPreview>

        <div>
          <SubsectionHeading>When to use</SubsectionHeading>
          <PropsTable
            props={[
              {
                name: "AlertDialog",
                type: "Destructive confirmation",
                description:
                  "Use for actions that cannot be undone or have significant consequences (deletes, resets). Focus is trapped; no dismiss-on-outside-click.",
              },
              {
                name: "Dialog",
                type: "Reversible interaction",
                description:
                  "Use for modals where the user can safely dismiss without consequence (forms, detail views, settings panels).",
              },
            ]}
          />
        </div>

        <div>
          <SubsectionHeading>Compound parts</SubsectionHeading>
          <PropsTable
            props={[
              {
                name: "AlertDialog",
                type: "Root props (Radix)",
                description: "Wraps AlertDialogPrimitive.Root; optional controlled open / onOpenChange.",
              },
              {
                name: "AlertDialogTrigger",
                type: "Trigger props",
                description: "Opens the alert. Use asChild to attach to a button.",
              },
              {
                name: "AlertDialogContent",
                type: "{ children, className? }",
                description: "Portal, overlay, and focus-trapped panel. No built-in close button — decision must be explicit.",
              },
              {
                name: "AlertDialogTitle",
                type: "{ children, className? }",
                description: "Accessible title; required by Radix.",
              },
              {
                name: "AlertDialogDescription",
                type: "{ children, className? }",
                description: "Secondary text below the title.",
              },
              {
                name: "AlertDialogFooter",
                type: "{ children, className? }",
                description: "Layout row for Cancel + Action buttons (not a Radix primitive).",
              },
              {
                name: "AlertDialogCancel",
                type: "Cancel props",
                description: "Dismisses the alert without running the destructive action. Focus auto-lands here.",
              },
              {
                name: "AlertDialogAction",
                type: "Action props",
                description: "Triggers the destructive action. Style with Button appearance=\"negative\".",
              },
            ]}
          />
        </div>

        <SourcePath path="src/components/ui/AlertDialog/AlertDialog.tsx · src/components/ui/AlertDialog/AlertDialog.module.scss" />
      </div>
    </Shell>
  );
}
