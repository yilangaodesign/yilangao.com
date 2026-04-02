"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import Eye from "lucide-react/dist/esm/icons/eye";
import Code from "lucide-react/dist/esm/icons/code";
import {
  Card,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@ds/index";

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
    <Card>
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
    </Card>
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
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Prop</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Default</TableHead>
          <TableHead>Description</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {props.map((prop) => (
          <TableRow key={prop.name}>
            <TableCell mono>{prop.name}</TableCell>
            <TableCell mono accent>{prop.type}</TableCell>
            <TableCell mono>{prop.default ?? "—"}</TableCell>
            <TableCell>{prop.description}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

export function SourcePath({ path }: { path: string }) {
  return (
    <div className="text-xs font-mono text-muted-foreground p-3 rounded-sm bg-muted/50">
      {path}
    </div>
  );
}

export function SubsectionHeading({ children }: { children: string }) {
  return (
    <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-3">
      {children}
    </h3>
  );
}

export function NotesList({ children }: { children: React.ReactNode }) {
  return <ul className="space-y-1.5 text-sm text-muted-foreground">{children}</ul>;
}

export function NotesItem({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2">
      <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-accent flex-shrink-0" />
      <span>{children}</span>
    </li>
  );
}
