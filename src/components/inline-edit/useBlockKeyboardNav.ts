'use client'

import { useCallback, useMemo, useRef } from 'react'

export interface BlockNavCallbacks {
  onBackspaceAtStart: (blockIndex: number, isEmpty: boolean) => void
  onArrowUp: (blockIndex: number) => void
  onArrowDown: (blockIndex: number) => void
}

function focusBlock(index: number, position: 'start' | 'end' = 'start') {
  requestAnimationFrame(() => {
    const wrapper = document.querySelector(`[data-block-index="${index}"]`)
    if (!wrapper) return

    const editable =
      wrapper.querySelector<HTMLElement>('[contenteditable="true"]') ??
      wrapper.querySelector<HTMLElement>('[tabindex]')

    if (editable) {
      editable.focus()
      if (position === 'end' && editable.isContentEditable) {
        const sel = window.getSelection()
        if (sel) {
          sel.selectAllChildren(editable)
          sel.collapseToEnd()
        }
      }
    }
  })
}

export default function useBlockKeyboardNav(
  deleteBlock: (index: number) => void,
  blockCount: number,
): BlockNavCallbacks {
  const blockCountRef = useRef(blockCount)
  blockCountRef.current = blockCount

  const onBackspaceAtStart = useCallback(
    (blockIndex: number, isEmpty: boolean) => {
      if (!isEmpty || blockIndex === 0) return
      deleteBlock(blockIndex)
      setTimeout(() => focusBlock(blockIndex - 1, 'end'), 300)
    },
    [deleteBlock],
  )

  const onArrowUp = useCallback(
    (blockIndex: number) => {
      if (blockIndex > 0) {
        focusBlock(blockIndex - 1, 'end')
      }
    },
    [],
  )

  const onArrowDown = useCallback(
    (blockIndex: number) => {
      if (blockIndex < blockCountRef.current - 1) {
        focusBlock(blockIndex + 1, 'start')
      }
    },
    [],
  )

  // Stable object identity — downstream Lexical plugins depend on `nav`
  // in their useEffect dep arrays; re-creating it each render would
  // unregister/re-register commands on every parent render, which
  // interacts badly with React 19 StrictMode + Lexical 0.41 and can
  // surface frozen-selection errors. See ENG-188.
  return useMemo(
    () => ({ onBackspaceAtStart, onArrowUp, onArrowDown }),
    [onBackspaceAtStart, onArrowUp, onArrowDown],
  )
}
