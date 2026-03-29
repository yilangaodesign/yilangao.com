"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Eye, Code } from "lucide-react";

export function ComponentPreview({
  children,
  code,
  title,
  description,
}: {
  children: React.ReactNode;
  code: string;
  title?: string;
  description?: string;
}) {
  const [view, setView] = useState<"preview" | "code">("preview");

  return (
    <div className="rounded-sm border border-border overflow-hidden">
      {(title || description) && (
        <div className="px-6 pt-5 pb-3">
          {title && <h3 className="text-base font-semibold">{title}</h3>}
          {description && (
            <p className="text-sm text-muted-foreground mt-1">{description}</p>
          )}
        </div>
      )}

      <div className="flex items-center gap-1 px-5 py-2.5 border-b border-border bg-muted/30">
        <button
          onClick={() => setView("preview")}
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-sm transition-colors",
            view === "preview"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <Eye className="w-3.5 h-3.5" />
          Preview
        </button>
        <button
          onClick={() => setView("code")}
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-sm transition-colors",
            view === "code"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <Code className="w-3.5 h-3.5" />
          Code
        </button>
      </div>

      {view === "preview" ? (
        <div className="p-8 bg-preview-bg min-h-[140px] flex items-center justify-center">
          {children}
        </div>
      ) : (
        <div className="overflow-x-auto bg-code-bg">
          <pre className="p-6 text-sm leading-relaxed font-mono text-code-foreground">
            <code>{code}</code>
          </pre>
        </div>
      )}
    </div>
  );
}

export function PropsTable({
  props,
}: {
  props: {
    name: string;
    type: string;
    default?: string;
    description: string;
  }[];
}) {
  return (
    <div className="rounded-sm border border-border overflow-x-auto">
      <table className="w-full text-sm min-w-[480px]">
        <thead>
          <tr className="bg-muted/50 border-b border-border">
            <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">Prop</th>
            <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">Type</th>
            <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">Default</th>
            <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">Description</th>
          </tr>
        </thead>
        <tbody>
          {props.map((prop) => (
            <tr key={prop.name} className="border-b last:border-b-0 border-border">
              <td className="px-4 py-2.5 font-mono text-xs font-medium whitespace-nowrap">{prop.name}</td>
              <td className="px-4 py-2.5 font-mono text-xs text-accent whitespace-nowrap">{prop.type}</td>
              <td className="px-4 py-2.5 font-mono text-xs text-muted-foreground whitespace-nowrap">
                {prop.default ?? "—"}
              </td>
              <td className="px-4 py-2.5 text-muted-foreground">{prop.description}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
