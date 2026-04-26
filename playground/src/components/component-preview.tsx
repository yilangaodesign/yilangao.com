"use client";

import { useState } from "react";
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
import s from "./component-preview.module.scss";

export function ComponentPreview({
  children,
  code,
  title,
  description,
  flush = false,
}: {
  children: React.ReactNode;
  code?: string;
  title?: string;
  description?: string;
  /** Remove padding so children fill the preview pane edge-to-edge. */
  flush?: boolean;
}) {
  const [view, setView] = useState<"preview" | "code">("preview");

  return (
    <Card>
      {(title || description) && (
        <div className={s.header}>
          {title && <h3 className={s.title}>{title}</h3>}
          {description && <p className={s.description}>{description}</p>}
        </div>
      )}

      <div className={s.tabBar}>
        <button
          onClick={() => setView("preview")}
          className={view === "preview" ? s.tabButtonActive : s.tabButton}
        >
          <Eye className={s.tabIcon} />
          Preview
        </button>
        <button
          onClick={() => setView("code")}
          className={view === "code" ? s.tabButtonActive : s.tabButton}
        >
          <Code className={s.tabIcon} />
          Code
        </button>
      </div>

      {view === "preview" ? (
        <div className={flush ? s.previewPaneFlush : s.previewPane}>{children}</div>
      ) : (
        <div className={s.codePane}>
          <pre className={s.codePre}>
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
            <TableCell mono accent>
              {prop.type}
            </TableCell>
            <TableCell mono>{prop.default ?? "—"}</TableCell>
            <TableCell>{prop.description}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

export function SourcePath({ path }: { path: string }) {
  return <div className={s.sourcePath}>{path}</div>;
}

export function SubsectionHeading({ children }: { children: string }) {
  return <h4 className={s.subsectionHeading}>{children}</h4>;
}

export function NotesList({ children }: { children: React.ReactNode }) {
  return <ul className={s.notesList}>{children}</ul>;
}

export function NotesItem({ children }: { children: React.ReactNode }) {
  return (
    <li className={s.notesItem}>
      <span className={s.notesBullet} />
      <span>{children}</span>
    </li>
  );
}
