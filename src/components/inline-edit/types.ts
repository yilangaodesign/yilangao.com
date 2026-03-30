export type ApiTarget =
  | { type: 'global'; slug: string }
  | { type: 'collection'; slug: string; id: number | string }

export interface DirtyField {
  fieldId: string
  target: ApiTarget
  fieldPath: string
  originalValue: unknown
  currentValue: unknown
  /** Whether this field stores Lexical richText (plain text in/out, wrapped on save) */
  isRichText?: boolean
}

export interface FieldDefinition {
  name: string
  label: string
  type: 'text' | 'email' | 'checkbox' | 'url' | 'media-url'
  required?: boolean
}

export interface InlineEditContextValue {
  dirtyFields: Map<string, DirtyField>
  activeFieldId: string | null
  isSaving: boolean
  saveError: string | null
  isAdmin: boolean
  registerField: (field: Omit<DirtyField, 'currentValue'>) => void
  setFieldValue: (fieldId: string, value: unknown) => void
  setActiveField: (fieldId: string | null) => void
  save: () => Promise<void>
  discard: () => void
  isDirty: (fieldId?: string) => boolean
}
