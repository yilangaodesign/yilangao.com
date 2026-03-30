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
  htmlContent?: string
  label?: string
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
  htmlContent,
  label,
  ...htmlAttrs
}: EditableTextProps) {
  const ctx = useInlineEdit()
  const elRef = useRef<HTMLElement>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [hydrated, setHydrated] = useState(false)
  const originalTextRef = useRef<string>('')
  const originalHtmlRef = useRef<string>('')

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

  useEffect(() => {
    if (!isAdmin) return
    originalTextRef.current = childText
    ctx!.registerField({
      fieldId,
      target,
      fieldPath,
      originalValue: childText,
      isRichText,
    })
  }, [ctx, isAdmin, fieldId, target, fieldPath, childText, isRichText])

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
    setIsEditing(false)
    ctx?.setActiveField(null)
  }, [ctx])

  const handleClick = useCallback(
    (e: MouseEvent) => {
      if (!isAdmin) return
      e.preventDefault()
      e.stopPropagation()
    },
    [isAdmin],
  )

  const handleDoubleClick = useCallback(
    (e: MouseEvent) => {
      if (!isAdmin) return
      e.preventDefault()
      e.stopPropagation()
      activate()
    },
    [isAdmin, activate],
  )

  const handleInput = useCallback(() => {
    const el = elRef.current
    if (!el || !ctx) return
    if (isRichText) {
      ctx.setFieldValue(fieldId, el.innerHTML)
    } else {
      ctx.setFieldValue(fieldId, (el.textContent ?? '').trim())
    }
  }, [ctx, fieldId, isRichText])

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey

      if (mod && e.key === 'b') {
        e.preventDefault()
        const el = elRef.current
        if (!el) return

        if (hasTextSelection(el)) {
          document.execCommand('bold', false)
          handleInput()
        } else {
          const computed = window.getComputedStyle(el)
          const current = parseInt(computed.fontWeight, 10) || 400
          el.style.fontWeight = current >= 700 ? '400' : '700'
        }
        el.dispatchEvent(new CustomEvent('inlinestyle', { bubbles: true }))
        return
      }

      if (mod && e.key === 'i') {
        e.preventDefault()
        const el = elRef.current
        if (!el) return

        if (hasTextSelection(el)) {
          document.execCommand('italic', false)
          handleInput()
        } else {
          const computed = window.getComputedStyle(el)
          el.style.fontStyle = computed.fontStyle === 'italic' ? 'normal' : 'italic'
        }
        el.dispatchEvent(new CustomEvent('inlinestyle', { bubbles: true }))
        return
      }

      if (e.key === 'Escape') {
        const el = elRef.current
        if (el) {
          if (isRichText) {
            el.innerHTML = originalHtmlRef.current
          } else {
            el.textContent = originalTextRef.current
          }
        }
        ctx?.setFieldValue(fieldId, originalTextRef.current)
        deactivate()
      }
      if (e.key === 'Enter' && !multiline) {
        e.preventDefault()
        deactivate()
      }
    },
    [ctx, fieldId, multiline, isRichText, deactivate, handleInput],
  )

  const handleBlur = useCallback(() => {
    deactivate()
  }, [deactivate])

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

  const dirty = ctx.isDirty(fieldId)
  const dirtyValue = dirty
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

  const dirtyHasHtml = showDirtyText && isRichText && dirtyValue!.includes('<')
  const useHtml = dirtyHasHtml || (!showDirtyText && !!htmlContent)

  if (useHtml) {
    displayProps.dangerouslySetInnerHTML = {
      __html: dirtyHasHtml ? dirtyValue! : htmlContent!,
    }
  } else {
    displayProps.children = showDirtyText ? dirtyValue : children
  }

  return createElement(Tag, displayProps)
}
