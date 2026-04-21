'use client'

import { useEffect } from 'react'

/**
 * useStructuralShortcuts
 * ──────────────────────
 * Unified keyboard wiring for every *structural* inline-edit surface
 * (content blocks, sections, images, collection rows, array items).
 *
 * Shortcut contract (matches the table in InlineEditProvider.tsx):
 *   Cmd/Ctrl-Backspace → onDelete (callers wire this to a confirm flow)
 *   Alt-ArrowUp        → onMoveUp
 *   Alt-ArrowDown      → onMoveDown
 *
 * The handler is bound to the given element (not document) so it only fires
 * when the user has focused the wrapper via Tab or click. Plain Backspace is
 * intentionally NOT bound here — it must remain usable for text editing
 * inside children.
 *
 * Pass `enabled: false` to opt out (e.g. non-admin viewers).
 */
export default function useStructuralShortcuts(
  ref: React.RefObject<HTMLElement | null>,
  {
    enabled = true,
    onDelete,
    onMoveUp,
    onMoveDown,
  }: {
    enabled?: boolean
    onDelete?: () => void
    onMoveUp?: () => void
    onMoveDown?: () => void
  },
) {
  useEffect(() => {
    if (!enabled) return
    const el = ref.current
    if (!el) return

    function handler(e: KeyboardEvent) {
      // Only trigger when the wrapper itself is focused, not descendants.
      // This keeps Backspace inside text inputs / contenteditables untouched.
      if (e.target !== el) return

      if ((e.metaKey || e.ctrlKey) && e.key === 'Backspace') {
        if (onDelete) {
          e.preventDefault()
          e.stopPropagation()
          onDelete()
        }
        return
      }

      if (e.altKey && e.key === 'ArrowUp') {
        if (onMoveUp) {
          e.preventDefault()
          e.stopPropagation()
          onMoveUp()
        }
        return
      }

      if (e.altKey && e.key === 'ArrowDown') {
        if (onMoveDown) {
          e.preventDefault()
          e.stopPropagation()
          onMoveDown()
        }
      }
    }

    el.addEventListener('keydown', handler)
    return () => el.removeEventListener('keydown', handler)
  }, [ref, enabled, onDelete, onMoveUp, onMoveDown])
}
