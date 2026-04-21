'use client'

import {
  createElement,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type MouseEvent,
  type ReactNode,
} from 'react'
import { createPortal, flushSync } from 'react-dom'
import { useInlineEdit } from './useInlineEdit'
import { uploadMedia } from './api'
import type { ApiTarget, FieldDefinition } from './types'
import styles from './inline-edit.module.scss'

function MediaUrlField({
  value,
  label,
  hasError,
  required,
  onChange,
}: {
  value: string
  label: string
  hasError: boolean
  required?: boolean
  onChange: (val: string) => void
}) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)

  const handleFile = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (!file) return
      setUploading(true)
      try {
        const media = await uploadMedia(file, file.name.replace(/\.[^.]+$/, ''))
        onChange(media.url)
      } catch {
        // upload failed — leave field unchanged
      } finally {
        setUploading(false)
        if (fileRef.current) fileRef.current.value = ''
      }
    },
    [onChange],
  )

  return (
    <div className={styles.arrayFieldGroup}>
      <label className={styles.arrayFieldLabel}>
        {label}
        {required && <span className={styles.requiredMark}>*</span>}
      </label>
      <div className={styles.mediaUrlRow}>
        <input
          type="url"
          className={[styles.arrayFieldInput, hasError ? styles.arrayFieldInputError : ''].filter(Boolean).join(' ')}
          value={value}
          placeholder={label}
          onChange={(e) => onChange(e.target.value)}
          aria-invalid={hasError || undefined}
          disabled={uploading}
        />
        <button
          type="button"
          className={styles.mediaUploadBtn}
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          title="Upload a file and use its URL"
        >
          {uploading ? (
            <span className={styles.mediaUploadSpinner} />
          ) : (
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden>
              <path d="M8 2v8M5 5l3-3 3 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M2 10v3a1 1 0 001 1h10a1 1 0 001-1v-3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*,application/pdf,.doc,.docx"
          className={styles.hiddenFileInput}
          onChange={handleFile}
          tabIndex={-1}
        />
      </div>
      {hasError && (
        <span className={styles.fieldError}>{label} is required</span>
      )}
    </div>
  )
}

interface EditableArrayProps<T extends Record<string, unknown>> {
  fieldId: string
  target: ApiTarget
  fieldPath: string
  items: T[]
  renderItem: (item: T, index: number) => ReactNode
  itemFields: FieldDefinition[]
  label?: string
  className?: string
  as?: keyof React.JSX.IntrinsicElements
  newItemDefaults?: Partial<T>
}

export default function EditableArray<T extends Record<string, unknown>>({
  fieldId,
  target,
  fieldPath,
  items,
  renderItem,
  itemFields,
  label,
  className,
  as: Tag = 'div',
  newItemDefaults,
}: EditableArrayProps<T>) {
  const ctx = useInlineEdit()
  const [panelOpen, setPanelOpen] = useState(false)
  const [localItems, setLocalItems] = useState<T[]>(items)
  const originalRef = useRef(items)
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  const isAdmin = mounted && !!ctx?.isAdmin

  useEffect(() => {
    if (!isAdmin || !ctx) return
    originalRef.current = items
    ctx.registerField({
      fieldId,
      target,
      fieldPath,
      originalValue: items,
    })
  }, [ctx, isAdmin, fieldId, target, fieldPath, items])

  useEffect(() => {
    if (!panelOpen) {
      setLocalItems(items)
      setShowValidation(false)
    }
  }, [items, panelOpen])

  const dirty = ctx?.isDirty(fieldId) ?? false
  const displayItems = useMemo(() => {
    if (!dirty) return items
    const dirtyVal = ctx?.dirtyFields.get(fieldId)?.currentValue
    return (dirtyVal as T[]) ?? items
  }, [dirty, ctx, fieldId, items])

  const openPanel = useCallback(
    (e: MouseEvent) => {
      if (!isAdmin) return
      e.preventDefault()
      e.stopPropagation()
      setLocalItems(displayItems)
      setItemKeys(displayItems.map((_, i) => `${fieldId}-item-${Date.now()}-${i}`))
      setPanelOpen(true)
    },
    [isAdmin, displayItems, fieldId],
  )

  const closePanel = useCallback(() => {
    setPanelOpen(false)
  }, [])

  const [panelSaving, setPanelSaving] = useState(false)
  const [panelError, setPanelError] = useState<string | null>(null)
  const [showValidation, setShowValidation] = useState(false)
  const [itemKeys, setItemKeys] = useState<string[]>([])

  const requiredFields = useMemo(
    () => itemFields.filter((f) => f.required),
    [itemFields],
  )

  const validationErrors = useMemo(() => {
    const errors = new Set<string>()
    for (let i = 0; i < localItems.length; i++) {
      for (const f of requiredFields) {
        const val = localItems[i][f.name]
        if (val === undefined || val === null || val === '') {
          errors.add(`${i}:${f.name}`)
        }
      }
    }
    return errors
  }, [localItems, requiredFields])

  const hasValidationErrors = validationErrors.size > 0

  const commitPanel = useCallback(async () => {
    if (!ctx) return

    if (hasValidationErrors) {
      setShowValidation(true)
      return
    }

    const changed =
      JSON.stringify(localItems) !== JSON.stringify(originalRef.current)
    if (!changed) {
      setPanelOpen(false)
      return
    }

    flushSync(() => {
      ctx.setFieldValue(fieldId, localItems)
    })

    setPanelSaving(true)
    setPanelError(null)

    try {
      await ctx.save()
      setPanelOpen(false)
    } catch (err) {
      setPanelError(err instanceof Error ? err.message : 'Save failed')
    } finally {
      setPanelSaving(false)
    }
  }, [ctx, fieldId, localItems, hasValidationErrors])

  const updateItem = useCallback(
    (index: number, field: string, value: unknown) => {
      setLocalItems((prev) => {
        const next = [...prev]
        next[index] = { ...next[index], [field]: value }
        return next
      })
    },
    [],
  )

  const deleteItem = useCallback((index: number) => {
    setLocalItems((prev) => prev.filter((_, i) => i !== index))
    setItemKeys((prev) => prev.filter((_, i) => i !== index))
  }, [])

  const reorderItem = useCallback((from: number, to: number) => {
    if (from === to) return
    setLocalItems((prev) => {
      const next = [...prev]
      const [moved] = next.splice(from, 1)
      next.splice(to, 0, moved)
      return next
    })
    setItemKeys((prev) => {
      const next = [...prev]
      const [moved] = next.splice(from, 1)
      next.splice(to, 0, moved)
      return next
    })
  }, [])

  const addItem = useCallback(() => {
    const blank = {} as Record<string, unknown>
    for (const f of itemFields) {
      blank[f.name] = f.type === 'checkbox' ? false : ''
    }
    setLocalItems((prev) => [...prev, { ...blank, ...newItemDefaults } as T])
    setItemKeys((prev) => [...prev, `item-${Date.now()}-${prev.length}`])
  }, [itemFields, newItemDefaults])

  const [dragIndex, setDragIndex] = useState<number | null>(null)
  const [overIndex, setOverIndex] = useState<number | null>(null)

  const handleDragStart = useCallback((e: React.DragEvent, index: number) => {
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', String(index))
    const itemEl = (e.currentTarget as HTMLElement).closest(`.${styles.arrayItem}`)
    if (itemEl) e.dataTransfer.setDragImage(itemEl as HTMLElement, 20, 20)
    setDragIndex(index)
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent, index: number) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setOverIndex(index)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    if (dragIndex !== null && overIndex !== null && dragIndex !== overIndex) {
      reorderItem(dragIndex, overIndex)
    }
    setDragIndex(null)
    setOverIndex(null)
  }, [dragIndex, overIndex, reorderItem])

  const handleDragEnd = useCallback(() => {
    setDragIndex(null)
    setOverIndex(null)
  }, [])

  const itemSummary = useCallback((item: T) => {
    const firstField = itemFields[0]
    return firstField ? String(item[firstField.name] ?? '') : ''
  }, [itemFields])

  if (!isAdmin || !ctx) {
    return createElement(Tag, { className }, items.map(renderItem))
  }

  const isEmpty = displayItems.length === 0

  return (
    <>
      {createElement(
        Tag,
        {
          className: [className, styles.editableArray, isEmpty ? styles.editableArrayEmpty : ''].filter(Boolean).join(' '),
          'data-editable-label': label || fieldPath,
          'data-editable-dirty': dirty || undefined,
          onDoubleClick: openPanel,
        },
        isEmpty ? (
          <button
            type="button"
            className={styles.editableArrayEmptyCta}
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setLocalItems([]); setItemKeys([]); setPanelOpen(true); }}
          >
            <svg width="12" height="12" viewBox="0 0 14 14" fill="none" aria-hidden>
              <path d="M7 2v10M2 7h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            Add {label || fieldPath}
          </button>
        ) : (
          displayItems.map(renderItem)
        ),
      )}

      {panelOpen && mounted && createPortal(
        <>
          <div className={styles.arrayBackdrop} onClick={closePanel} />
          <div
            className={[styles.arrayPanel, dragIndex !== null ? styles.panelDragging : ''].filter(Boolean).join(' ')}
            role="dialog"
            aria-label={`Edit ${label || fieldPath}`}
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
          >
            <div className={styles.arrayPanelHeader}>
              <span className={styles.arrayPanelTitle}>
                Edit {label || fieldPath}
              </span>
              <button
                type="button"
                className={styles.arrayPanelClose}
                onClick={closePanel}
                aria-label="Close"
              >
                <svg width="12" height="12" viewBox="0 0 14 14" fill="none" aria-hidden>
                  <path d="M3.5 3.5l7 7m0-7l-7 7" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            <div className={styles.arrayPanelBody}>
              {localItems.map((item, index) => (
                <div
                  key={itemKeys[index] ?? index}
                  className={[
                    styles.arrayItem,
                    dragIndex === index ? styles.arrayItemDragging : '',
                    overIndex === index && dragIndex !== index ? styles.arrayItemDropTarget : '',
                  ].filter(Boolean).join(' ')}
                  onDragOver={(e) => handleDragOver(e, index)}
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.target !== e.currentTarget) return
                    if (e.altKey && e.key === 'ArrowUp' && index > 0) {
                      e.preventDefault(); reorderItem(index, index - 1); return
                    }
                    if (e.altKey && e.key === 'ArrowDown' && index < localItems.length - 1) {
                      e.preventDefault(); reorderItem(index, index + 1); return
                    }
                    if ((e.metaKey || e.ctrlKey) && e.key === 'Backspace') {
                      e.preventDefault(); deleteItem(index);
                    }
                  }}
                >
                  <button
                    type="button"
                    className={styles.dragHandle}
                    draggable
                    onDragStart={(e) => handleDragStart(e, index)}
                    onDragEnd={handleDragEnd}
                    aria-label={`Drag to reorder item ${index + 1}`}
                  >
                    <svg width="10" height="14" viewBox="0 0 10 14" fill="none" aria-hidden>
                      <circle cx="2.5" cy="2" r="1.2" fill="currentColor" />
                      <circle cx="7.5" cy="2" r="1.2" fill="currentColor" />
                      <circle cx="2.5" cy="7" r="1.2" fill="currentColor" />
                      <circle cx="7.5" cy="7" r="1.2" fill="currentColor" />
                      <circle cx="2.5" cy="12" r="1.2" fill="currentColor" />
                      <circle cx="7.5" cy="12" r="1.2" fill="currentColor" />
                    </svg>
                  </button>
                  <span className={styles.arrayItemIndex}>{index + 1}</span>
                  <span className={styles.arrayItemSummary}>{itemSummary(item)}</span>
                  <div className={styles.arrayItemFields}>
                    {itemFields.map((field) => {
                      const errorKey = `${index}:${field.name}`
                      const hasError = showValidation && validationErrors.has(errorKey)

                      if (field.type === 'checkbox') {
                        return (
                          <label key={field.name} className={styles.arrayFieldCheckbox}>
                            <input
                              type="checkbox"
                              checked={!!item[field.name]}
                              onChange={(e) => updateItem(index, field.name, e.target.checked)}
                            />
                            {field.label}
                          </label>
                        )
                      }

                      if (field.type === 'media-url') {
                        return (
                          <MediaUrlField
                            key={field.name}
                            value={String(item[field.name] ?? '')}
                            label={field.label}
                            hasError={hasError}
                            required={field.required}
                            onChange={(val) => updateItem(index, field.name, val)}
                          />
                        )
                      }

                      return (
                        <div key={field.name} className={styles.arrayFieldGroup}>
                          <label className={styles.arrayFieldLabel}>
                            {field.label}
                            {field.required && <span className={styles.requiredMark}>*</span>}
                          </label>
                          <input
                            type={field.type}
                            className={[styles.arrayFieldInput, hasError ? styles.arrayFieldInputError : ''].filter(Boolean).join(' ')}
                            value={String(item[field.name] ?? '')}
                            placeholder={field.label}
                            onChange={(e) => updateItem(index, field.name, e.target.value)}
                            aria-invalid={hasError || undefined}
                          />
                          {hasError && (
                            <span className={styles.fieldError}>{field.label} is required</span>
                          )}
                        </div>
                      )
                    })}
                  </div>
                  <div className={styles.arrayItemActions}>
                    <button
                      type="button"
                      className={styles.arrayDeleteBtn}
                      onClick={() => deleteItem(index)}
                      aria-label="Delete item"
                    >
                      <svg width="12" height="12" viewBox="0 0 14 14" fill="none" aria-hidden>
                        <path d="M2 4h10M5 4V2.5h4V4m-5.5 0l.5 8h6l.5-8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}

              {localItems.length === 0 && (
                <div className={styles.arrayItem}>
                  <span className={[styles.arrayItemIndex, styles.noItemsText].join(' ')}>
                    No items
                  </span>
                </div>
              )}

              <button
                type="button"
                className={styles.arrayAddChip}
                onClick={addItem}
                disabled={panelSaving}
              >
                <svg width="12" height="12" viewBox="0 0 14 14" fill="none" aria-hidden>
                  <path d="M7 2v10M2 7h10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                </svg>
                Add item
              </button>
            </div>

            <div className={styles.arrayPanelFooter}>
              {panelError && (
                <span className={styles.arrayPanelError}>{panelError}</span>
              )}
              {showValidation && hasValidationErrors && (
                <span className={styles.arrayPanelError}>
                  Fill in all required fields before saving
                </span>
              )}
              <button type="button" className={styles.arrayAddBtn} onClick={addItem} disabled={panelSaving}>
                <svg width="12" height="12" viewBox="0 0 14 14" fill="none" aria-hidden>
                  <path d="M7 2v10M2 7h10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                </svg>
                Add item
              </button>
              <button
                type="button"
                className={styles.arrayDoneBtn}
                onClick={commitPanel}
                disabled={panelSaving || (showValidation && hasValidationErrors)}
              >
                {panelSaving ? 'Saving…' : 'Save & Close'}
              </button>
            </div>
          </div>
        </>,
        document.body,
      )}
    </>
  )
}
