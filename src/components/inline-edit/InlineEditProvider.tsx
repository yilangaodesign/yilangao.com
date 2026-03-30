'use client'

import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { useRouter } from 'next/navigation.js'
import type { DirtyField, InlineEditContextValue } from './types'
import { saveFields } from './api'

export const InlineEditContext = createContext<InlineEditContextValue | null>(null)

export default function InlineEditProvider({
  children,
  isAdmin = false,
}: {
  children: ReactNode
  isAdmin?: boolean
}) {
  const router = useRouter()
  const [dirtyFields, setDirtyFields] = useState<Map<string, DirtyField>>(
    () => new Map(),
  )
  const [activeFieldId, setActiveFieldId] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  const registryRef = useRef<Map<string, DirtyField>>(new Map())
  const dirtyRef = useRef(dirtyFields)
  dirtyRef.current = dirtyFields

  const registerField = useCallback(
    (field: Omit<DirtyField, 'currentValue'>) => {
      const full: DirtyField = { ...field, currentValue: field.originalValue }
      registryRef.current.set(field.fieldId, full)
    },
    [],
  )

  const setFieldValue = useCallback((fieldId: string, value: unknown) => {
    setDirtyFields((prev) => {
      const next = new Map(prev)
      const registered = registryRef.current.get(fieldId)
      if (!registered) return prev

      if (value === registered.originalValue) {
        next.delete(fieldId)
      } else {
        next.set(fieldId, { ...registered, currentValue: value })
      }
      dirtyRef.current = next
      return next
    })
  }, [])

  const setActiveField = useCallback((fieldId: string | null) => {
    setActiveFieldId(fieldId)
  }, [])

  const save = useCallback(async () => {
    const snapshot = dirtyRef.current
    if (snapshot.size === 0) return
    setIsSaving(true)
    setSaveError(null)

    try {
      await saveFields(snapshot)
      const empty = new Map<string, DirtyField>()
      setDirtyFields(empty)
      dirtyRef.current = empty
      router.refresh()
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Save failed'
      setSaveError(msg)
      throw err
    } finally {
      setIsSaving(false)
    }
  }, [router])

  const discard = useCallback(() => {
    const empty = new Map<string, DirtyField>()
    setDirtyFields(empty)
    dirtyRef.current = empty
    setActiveFieldId(null)
    setSaveError(null)
  }, [])

  const isDirty = useCallback(
    (fieldId?: string) => {
      if (fieldId) return dirtyFields.has(fieldId)
      return dirtyFields.size > 0
    },
    [dirtyFields],
  )

  const saveRef = useRef(save)
  saveRef.current = save
  const discardRef = useRef(discard)
  discardRef.current = discard

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault()
        if (dirtyRef.current.size > 0) saveRef.current().catch(() => {})
      }
      if (e.key === 'Escape' && !document.querySelector('[data-editable-active]')) {
        if (dirtyRef.current.size > 0) discardRef.current()
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  useEffect(() => {
    function handleBeforeUnload(e: BeforeUnloadEvent) {
      if (dirtyRef.current.size > 0) {
        e.preventDefault()
      }
    }
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [])

  const value = useMemo<InlineEditContextValue>(
    () => ({
      dirtyFields,
      activeFieldId,
      isSaving,
      saveError,
      isAdmin,
      registerField,
      setFieldValue,
      setActiveField,
      save,
      discard,
      isDirty,
    }),
    [
      dirtyFields,
      activeFieldId,
      isSaving,
      saveError,
      isAdmin,
      registerField,
      setFieldValue,
      setActiveField,
      save,
      discard,
      isDirty,
    ],
  )

  return (
    <InlineEditContext.Provider value={value}>
      {children}
    </InlineEditContext.Provider>
  )
}
