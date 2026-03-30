"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Shell } from "@/components/shell";
import { SectionHeading } from "@/components/token-grid";
import { ComponentPreview, PropsTable } from "@/components/component-preview";
import { cn } from "@/lib/utils";
import { X, CheckCircle, AlertCircle, Info } from "lucide-react";

type ToastVariant = "default" | "success" | "error" | "info";

interface ToastItem {
  id: number;
  title: string;
  description?: string;
  variant: ToastVariant;
  duration: number;
  action?: { label: string; onClick: () => void };
}

let toastIdCounter = 0;

const variantStyles: Record<ToastVariant, string> = {
  default: "border-border bg-background text-foreground",
  success: "border-green-500/30 bg-green-950/50 text-green-100",
  error: "border-red-500/30 bg-red-950/50 text-red-100",
  info: "border-blue-500/30 bg-blue-950/50 text-blue-100",
};

const variantIcons: Record<ToastVariant, React.ComponentType<{ className?: string }> | null> = {
  default: null,
  success: CheckCircle,
  error: AlertCircle,
  info: Info,
};

const variantIconColor: Record<ToastVariant, string> = {
  default: "",
  success: "text-green-400",
  error: "text-red-400",
  info: "text-blue-400",
};

function DemoToastContainer({
  toasts,
  onDismiss,
}: {
  toasts: ToastItem[];
  onDismiss: (id: number) => void;
}) {
  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col-reverse gap-2 w-[360px] max-w-[calc(100vw-2rem)]">
      {toasts.map((toast) => {
        const Icon = variantIcons[toast.variant];
        return (
          <div
            key={toast.id}
            className={cn(
              "rounded-sm border p-4 shadow-lg animate-in slide-in-from-right-full fade-in duration-200 flex gap-3",
              variantStyles[toast.variant],
            )}
          >
            {Icon && (
              <Icon className={cn("w-4 h-4 mt-0.5 shrink-0", variantIconColor[toast.variant])} />
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium">{toast.title}</p>
              {toast.description && (
                <p className="text-xs mt-1 opacity-70">{toast.description}</p>
              )}
              {toast.action && (
                <button
                  type="button"
                  onClick={() => {
                    toast.action!.onClick();
                    onDismiss(toast.id);
                  }}
                  className="mt-2 text-xs font-medium underline underline-offset-2 hover:opacity-80 transition-opacity"
                >
                  {toast.action.label}
                </button>
              )}
            </div>
            <button
              type="button"
              onClick={() => onDismiss(toast.id)}
              className="shrink-0 p-0.5 rounded-sm hover:bg-foreground/10 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
}

function useToast() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const timersRef = useRef<Map<number, ReturnType<typeof setTimeout>>>(new Map());

  const dismiss = useCallback((id: number) => {
    const timer = timersRef.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timersRef.current.delete(id);
    }
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    (opts: Omit<ToastItem, "id">) => {
      const id = ++toastIdCounter;
      const item: ToastItem = { id, ...opts };
      setToasts((prev) => [...prev, item]);

      const timer = setTimeout(() => {
        dismiss(id);
      }, opts.duration);
      timersRef.current.set(id, timer);
    },
    [dismiss],
  );

  useEffect(() => {
    return () => {
      timersRef.current.forEach((timer) => clearTimeout(timer));
    };
  }, []);

  return { toasts, toast, dismiss };
}

const basicCode = `const { toasts, toast, dismiss } = useToast();

toast({
  title: "Changes saved",
  variant: "default",
  duration: 4000,
});`;

const variantsCode = `toast({ title: "Profile updated", variant: "success", duration: 4000 });
toast({ title: "Upload failed", variant: "error", duration: 4000 });
toast({ title: "New version available", variant: "info", duration: 4000 });`;

const actionCode = `toast({
  title: "Message archived",
  description: "The conversation has been moved to archive.",
  variant: "default",
  duration: 6000,
  action: { label: "Undo", onClick: () => console.log("undone") },
});`;

const descriptionCode = `toast({
  title: "Deployment started",
  description: "Building and deploying to production. This may take a few minutes.",
  variant: "info",
  duration: 5000,
});`;

export default function ToastPage() {
  const { toasts, toast, dismiss } = useToast();

  return (
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
          <button
            type="button"
            onClick={() =>
              toast({ title: "Changes saved", variant: "default", duration: 4000 })
            }
            className="rounded-sm border border-border bg-background px-4 py-2 text-sm font-medium text-foreground shadow-sm transition-colors hover:bg-muted"
          >
            Show toast
          </button>
        </ComponentPreview>

        <ComponentPreview
          title="Variants"
          description="Success, error, and info variants with colored borders and icons."
          code={variantsCode}
        >
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() =>
                toast({ title: "Profile updated", variant: "success", duration: 4000 })
              }
              className="rounded-sm bg-green-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-green-700"
            >
              Success
            </button>
            <button
              type="button"
              onClick={() =>
                toast({ title: "Upload failed", variant: "error", duration: 4000 })
              }
              className="rounded-sm bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700"
            >
              Error
            </button>
            <button
              type="button"
              onClick={() =>
                toast({ title: "New version available", variant: "info", duration: 4000 })
              }
              className="rounded-sm bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
            >
              Info
            </button>
          </div>
        </ComponentPreview>

        <ComponentPreview
          title="With action"
          description="Toast with an inline action button, useful for undo patterns."
          code={actionCode}
        >
          <button
            type="button"
            onClick={() =>
              toast({
                title: "Message archived",
                description: "The conversation has been moved to archive.",
                variant: "default",
                duration: 6000,
                action: { label: "Undo", onClick: () => {} },
              })
            }
            className="rounded-sm border border-border bg-background px-4 py-2 text-sm font-medium text-foreground shadow-sm transition-colors hover:bg-muted"
          >
            Archive message
          </button>
        </ComponentPreview>

        <ComponentPreview
          title="With description"
          description="Longer informational toast with title and supporting text."
          code={descriptionCode}
        >
          <button
            type="button"
            onClick={() =>
              toast({
                title: "Deployment started",
                description:
                  "Building and deploying to production. This may take a few minutes.",
                variant: "info",
                duration: 5000,
              })
            }
            className="rounded-sm border border-border bg-background px-4 py-2 text-sm font-medium text-foreground shadow-sm transition-colors hover:bg-muted"
          >
            Start deploy
          </button>
        </ComponentPreview>

        <div>
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-3">
            Props
          </h3>
          <PropsTable
            props={[
              {
                name: "title",
                type: "string",
                description: "Primary text displayed in the toast.",
              },
              {
                name: "description",
                type: "string",
                default: "—",
                description: "Optional secondary text below the title.",
              },
              {
                name: "variant",
                type: '"default" | "success" | "error" | "info"',
                default: '"default"',
                description: "Visual style variant.",
              },
              {
                name: "duration",
                type: "number",
                default: "4000",
                description: "Auto-dismiss timeout in milliseconds.",
              },
              {
                name: "action",
                type: "{ label: string; onClick: () => void }",
                default: "—",
                description: "Optional inline action button.",
              },
            ]}
          />
        </div>

        <div className="text-xs font-mono text-muted-foreground p-3 rounded-sm bg-muted/50">
          src/components/ui/Toast
        </div>
      </div>

      <DemoToastContainer toasts={toasts} onDismiss={dismiss} />
    </Shell>
  );
}
