/**
 * Playground stubs for CMS inline-edit components.
 *
 * These exist so that site components imported via @site/* (which reference
 * @/components/inline-edit) resolve in the playground context. The playground
 * renders components with isAdmin=false, so these stubs are never called at
 * runtime — they only need to satisfy the TypeScript compiler.
 *
 * Source of truth: src/components/inline-edit/ — keep signatures in sync.
 */

import type { ReactNode } from "react";

export type ApiTarget =
  | { type: "global"; slug: string }
  | { type: "collection"; slug: string; id: number };

export interface DirtyField {
  target: ApiTarget;
  fieldPath: string;
  value: string;
}

export interface FieldDefinition {
  fieldId: string;
  target: ApiTarget;
  fieldPath: string;
  label?: string;
}

export interface InlineEditContextValue {
  isAdmin: boolean;
  dirtyFields: Map<string, DirtyField>;
  registerField: (def: FieldDefinition) => void;
  unregisterField: (fieldId: string) => void;
  setDirty: (fieldId: string, value: string) => void;
  clearDirty: (fieldId: string) => void;
  saveAll: () => Promise<void>;
  saving: boolean;
}

export function EditableText(props: {
  fieldId: string;
  target: ApiTarget;
  fieldPath: string;
  as?: string;
  className?: string;
  multiline?: boolean;
  isRichText?: boolean;
  htmlContent?: string;
  label?: string;
  children: ReactNode;
}) {
  return props.children as React.ReactElement;
}

export function DeleteItemButton(_props: {
  collection: string;
  id: number;
  itemLabel?: string;
}) {
  return null;
}

export function AddItemCard(_props: {
  collection: string;
  label?: string;
}) {
  return null;
}
