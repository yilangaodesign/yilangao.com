'use client'

import {
  createElement,
  useCallback,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type MouseEvent,
} from 'react'
import { useInlineEdit } from './useInlineEdit'
import type { ApiTarget } from './types'
import styles from './inline-edit.module.scss'

interface EditableTextProps {
  fieldId: string
  target: ApiTarget
  fieldPath: string
  as?: keyof React.JSX.IntrinsicElements
  className?: string
  children: React.ReactNode
  multiline?: boolean
  isRichText?: boolean
  /** Exact value from the CMS for dirty detection when it can differ from `children` (e.g. HTML fragment vs plain). */
  storedValue?: string
  /**
   * When true, inline bold/weight/font changes from contenteditable are read and saved as an HTML string
   * on a plain Payload `text` field. Without this, only textContent is captured so formatting never persists.
   */
  inlineTypography?: boolean
  htmlContent?: string
  label?: string
  singleClickEdit?: boolean
  /**
   * Admin-only placeholder shown when the field is empty, not dirty, and not
   * being edited. Visible only to admins so visitors never see the hint.
   * Defaults to `Add {label || fieldPath}`.
   */
  adminPlaceholder?: string
  [htmlAttr: string]: unknown
}

function hasTextSelection(el: HTMLElement): boolean {
  const sel = window.getSelection()
  if (!sel || sel.isCollapsed || !sel.rangeCount) return false
  const range = sel.getRangeAt(0)
  return el.contains(range.startContainer) && el.contains(range.endContainer)
}

export default function EditableText({
  fieldId,
  target,
  fieldPath,
  as: Tag = 'span',
  className,
  children,
  multiline = false,
  isRichText = false,
  storedValue,
  inlineTypography = false,
  htmlContent,
  label,
  singleClickEdit = false,
  adminPlaceholder,
  ...htmlAttrs
}: EditableTextProps) {
  const ctx = useInlineEdit()
  const elRef = useRef<HTMLElement>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [hydrated, setHydrated] = useState(false)
  const originalTextRef = useRef<string>('')
  const originalHtmlRef = useRef<string>('')
  const pendingValueRef = useRef<string | null>(null)

  useEffect(() => {
    setHydrated(true)
  }, [])

  const isAdmin = hydrated && !!ctx?.isAdmin

  const childText =
    typeof children === 'string'
      ? children
      : typeof children === 'number'
        ? String(children)
        : ''

  const canonicalStored =
    typeof storedValue === 'string' ? storedValue : childText

  useEffect(() => {
    if (!isAdmin) return
    originalTextRef.current = childText
    ctx!.registerField({
      fieldId,
      target,
      fieldPath,
      originalValue: canonicalStored,
      isRichText,
    })
  }, [ctx, isAdmin, fieldId, target, fieldPath, childText, canonicalStored, isRichText])

  const flushPendingValue = useCallback(() => {
    if (pendingValueRef.current !== null && ctx) {
      ctx.setFieldValue(fieldId, pendingValueRef.current)
      pendingValueRef.current = null
    }
  }, [ctx, fieldId])

  const activate = useCallback(() => {
    if (!isAdmin || !ctx) return
    setIsEditing(true)
    ctx.setActiveField(fieldId)
    requestAnimationFrame(() => {
      const el = elRef.current
      if (!el) return
      originalHtmlRef.current = el.innerHTML
      el.focus()
      const range = document.createRange()
      range.selectNodeContents(el)
      range.collapse(false)
      const sel = window.getSelection()
      sel?.removeAllRanges()
      sel?.addRange(range)
    })
  }, [ctx, isAdmin, fieldId])

  const deactivate = useCallback(() => {
    flushPendingValue()
    setIsEditing(false)
    ctx?.setActiveField(null)
  }, [ctx, flushPendingValue])

  const handleClick = useCallback(
    (e: MouseEvent) => {
      if (!isAdmin) return
      if (isEditing) return
      e.preventDefault()
      e.stopPropagation()
      if (singleClickEdit) activate()
    },
    [isAdmin, fieldId, isEditing, singleClickEdit, activate],
  )

  const handleDoubleClick = useCallback(
    (e: MouseEvent) => {
      if (!isAdmin) return
      if (isEditing) return
      e.preventDefault()
      e.stopPropagation()
      activate()
    },
    [isAdmin, isEditing, activate],
  )

  const handleInput = useCallback(() => {
    const el = elRef.current
    if (!el || !ctx) return
    const val = isRichText
      ? el.innerHTML
      : inlineTypography
        ? el.innerHTML.trim()
        : (el.textContent ?? '').trim()
    pendingValueRef.current = val
  }, [ctx, fieldId, isRichText, inlineTypography])

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey

      if (mod && e.key === 'b') {
        e.preventDefault()
        const el = elRef.current
        if (!el) return

        if (hasTextSelection(el)) {
          document.execCommand('bold', false)
        } else {
          const range = document.createRange()
          range.selectNodeContents(el)
          const sel = window.getSelection()
          sel?.removeAllRanges()
          sel?.addRange(range)
          document.execCommand('bold', false)
          range.collapse(false)
          sel?.removeAllRanges()
          sel?.addRange(range)
        }
        el.style.removeProperty('font-weight')
        handleInput()
        el.dispatchEvent(new CustomEvent('inlinestyle', { bubbles: true }))
        return
      }

      if (mod && e.key === 'i') {
        e.preventDefault()
        const el = elRef.current
        if (!el) return

        if (hasTextSelection(el)) {
          document.execCommand('italic', false)
        } else {
          const range = document.createRange()
          range.selectNodeContents(el)
          const sel = window.getSelection()
          sel?.removeAllRanges()
          sel?.addRange(range)
          document.execCommand('italic', false)
          range.collapse(false)
          sel?.removeAllRanges()
          sel?.addRange(range)
        }
        el.style.removeProperty('font-style')
        handleInput()
        el.dispatchEvent(new CustomEvent('inlinestyle', { bubbles: true }))
        return
      }

      if (e.key === 'Escape') {
        const el = elRef.current
        if (el) {
          if (isRichText || inlineTypography) {
            el.innerHTML = originalHtmlRef.current
          } else {
            el.textContent = originalTextRef.current
          }
        }
        pendingValueRef.current = null
        ctx?.setFieldValue(fieldId, canonicalStored)
        deactivate()
      }
      if (e.key === 'Enter' && !multiline) {
        e.preventDefault()
        deactivate()
      }
    },
    [ctx, fieldId, multiline, isRichText, inlineTypography, canonicalStored, deactivate, handleInput],
  )

  const handleBlur = useCallback(() => {
    deactivate()
  }, [deactivate, fieldId, isEditing])

  if (!isAdmin || !ctx) {
    if (htmlContent) {
      return createElement(Tag, {
        ...htmlAttrs,
        className,
        dangerouslySetInnerHTML: { __html: htmlContent },
      })
    }
    return createElement(Tag, { ...htmlAttrs, className }, children)
  }

  const dirty = ctx.isDirty(fieldId) || pendingValueRef.current !== null
  const dirtyValue = ctx.isDirty(fieldId)
    ? (ctx.dirtyFields.get(fieldId)?.currentValue as string)
    : undefined

  const showDirtyText = dirtyValue !== undefined && !isEditing
  const displayProps: Record<string, unknown> = {
    ...htmlAttrs,
    ref: elRef,
    className: [className, styles.editable].filter(Boolean).join(' '),
    'data-editable': true,
    'data-editable-active': isEditing || undefined,
    'data-editable-dirty': dirty || undefined,
    'data-editable-label': label || fieldPath,
    contentEditable: isEditing,
    suppressContentEditableWarning: true,
    onClick: handleClick,
    onDoubleClick: handleDoubleClick,
    onInput: handleInput,
    onKeyDown: isEditing ? handleKeyDown : undefined,
    onBlur: isEditing ? handleBlur : undefined,
  }

  const dirtyHasHtml =
    showDirtyText &&
    (isRichText || inlineTypography) &&
    typeof dirtyValue === 'string' &&
    dirtyValue.includes('<')
  const useHtml = dirtyHasHtml || (!showDirtyText && !!htmlContent)

  // Admin-only empty placeholder: render a hint when there's no value to edit,
  // so the field is still clickable and discoverable. Not shown while editing
  // or while a dirty value exists.
  const hasVisibleValue =
    (showDirtyText && typeof dirtyValue === 'string' && dirtyValue.trim() !== '') ||
    (!showDirtyText && (!!htmlContent || childText.trim() !== ''))
  const showAdminPlaceholder = !isEditing && !hasVisibleValue

  if (useHtml) {
    displayProps.dangerouslySetInnerHTML = {
      __html: dirtyHasHtml ? dirtyValue! : htmlContent!,
    }
  } else if (showAdminPlaceholder) {
    displayProps.children = (
      <span className={styles.editablePlaceholder} data-editable-placeholder>
        {adminPlaceholder || `Add ${label || fieldPath}`}
      </span>
    )
  } else {
    displayProps.children = showDirtyText ? dirtyValue : children
  }

  return createElement(Tag, displayProps)
}
