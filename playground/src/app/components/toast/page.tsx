"use client";

import { useState, useCallback } from "react";
import { Shell } from "@/components/shell";
import { SectionHeading } from "@/components/token-grid";
import { ComponentPreview, PropsTable, SourcePath, SubsectionHeading} from "@/components/component-preview";
import {
  ToastProvider,
  ToastViewport,
  Toast,
  ToastTitle,
  ToastDescription,
  ToastAction,
  ToastClose,
  type ToastVariant,
} from "@ds/Toast";
import { Button } from "@ds/Button";

interface ToastItem {
  id: number;
  title: string;
  description?: string;
  variant: ToastVariant;
  duration: number;
  action?: { label: string; onClick: () => void };
}

let toastIdCounter = 0;

function useToast() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback((opts: Omit<ToastItem, "id">) => {
    const id = ++toastIdCounter;
    setToasts((prev) => [...prev, { id, ...opts }]);
  }, []);

  return { toasts, toast, dismiss };
}

const basicCode = `<Toast variant="default" duration={4000}>
  <ToastTitle>Changes saved</ToastTitle>
  <ToastClose />
</Toast>`;

const variantsCode = `<Toast variant="success">
  <ToastTitle>Profile updated</ToastTitle>
</Toast>
<Toast variant="error">
  <ToastTitle>Upload failed</ToastTitle>
</Toast>
<Toast variant="info">
  <ToastTitle>New version available</ToastTitle>
</Toast>`;

const actionCode = `<Toast variant="default" duration={6000}>
  <ToastTitle>Message archived</ToastTitle>
  <ToastDescription>
    The conversation has been moved to archive.
  </ToastDescription>
  <ToastAction altText="Undo" onClick={() => {}}>
    Undo
  </ToastAction>
  <ToastClose />
</Toast>`;

const descriptionCode = `<Toast variant="info" duration={5000}>
  <ToastTitle>Deployment started</ToastTitle>
  <ToastDescription>
    Building and deploying to production.
  </ToastDescription>
  <ToastClose />
</Toast>`;

export default function ToastPage() {
  const { toasts, toast, dismiss } = useToast();

  return (
    <ToastProvider>
      <Shell title="Toast">
        <div className="max-w-5xl space-y-10">
          <SectionHeading
            title="Toast"
            description="Non-intrusive notification that auto-dismisses after a timeout. Supports variants, descriptions, and inline action buttons."
          />

          <ComponentPreview
            title="Basic"
            description="Trigger a default toast with title text."
            code={basicCode}
          >
            <Button
              appearance="neutral"
              emphasis="regular"
              onClick={() =>
                toast({ title: "Changes saved", variant: "default", duration: 4000 })
              }
            >
              Show toast
            </Button>
          </ComponentPreview>

          <ComponentPreview
            title="Variants"
            description="Success, error, and info variants with colored borders and icons."
            code={variantsCode}
          >
            <div className="flex flex-wrap gap-3">
              <Button
                appearance="positive"
                onClick={() =>
                  toast({ title: "Profile updated", variant: "success", duration: 4000 })
                }
              >
                Success
              </Button>
              <Button
                appearance="negative"
                onClick={() =>
                  toast({ title: "Upload failed", variant: "error", duration: 4000 })
                }
              >
                Error
              </Button>
              <Button
                appearance="highlight"
                onClick={() =>
                  toast({ title: "New version available", variant: "info", duration: 4000 })
                }
              >
                Info
              </Button>
            </div>
          </ComponentPreview>

          <ComponentPreview
            title="With action"
            description="Toast with an inline action button, useful for undo patterns."
            code={actionCode}
          >
            <Button
              appearance="neutral"
              emphasis="regular"
              onClick={() =>
                toast({
                  title: "Message archived",
                  description: "The conversation has been moved to archive.",
                  variant: "default",
                  duration: 6000,
                  action: { label: "Undo", onClick: () => {} },
                })
              }
            >
              Archive message
            </Button>
          </ComponentPreview>

          <ComponentPreview
            title="With description"
            description="Longer informational toast with title and supporting text."
            code={descriptionCode}
          >
            <Button
              appearance="neutral"
              emphasis="regular"
              onClick={() =>
                toast({
                  title: "Deployment started",
                  description:
                    "Building and deploying to production. This may take a few minutes.",
                  variant: "info",
                  duration: 5000,
                })
              }
            >
              Start deploy
            </Button>
          </ComponentPreview>

          <div>
            <SubsectionHeading>Props</SubsectionHeading>
            <PropsTable
              props={[
                {
                  name: "Toast.variant",
                  type: '"default" | "success" | "error" | "warning" | "info"',
                  default: '"default"',
                  description: "Visual style variant with accent color.",
                },
                {
                  name: "Toast.duration",
                  type: "number",
                  description: "Auto-dismiss timeout in milliseconds.",
                },
                {
                  name: "Toast.open",
                  type: "boolean",
                  description: "Controlled open state.",
                },
                {
                  name: "Toast.onOpenChange",
                  type: "(open: boolean) => void",
                  description: "Callback when the toast's open state changes.",
                },
                {
                  name: "ToastAction.altText",
                  type: "string",
                  description: "Accessible label for the action button.",
                },
              ]}
            />
          </div>

          <SourcePath path="src/components/ui/Toast" />
        </div>
      </Shell>

      {toasts.map((t) => (
        <Toast
          key={t.id}
          variant={t.variant}
          duration={t.duration}
          onOpenChange={(open) => {
            if (!open) dismiss(t.id);
          }}
        >
          <ToastTitle>{t.title}</ToastTitle>
          {t.description && <ToastDescription>{t.description}</ToastDescription>}
          {t.action && (
            <ToastAction altText={t.action.label} onClick={t.action.onClick}>
              {t.action.label}
            </ToastAction>
          )}
          <ToastClose />
        </Toast>
      ))}
      <ToastViewport />
    </ToastProvider>
  );
}
