'use client'

import { useCallback, useEffect, useMemo, useRef } from 'react'
import { LexicalComposer } from '@lexical/react/LexicalComposer'
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin'
import { ContentEditable } from '@lexical/react/LexicalContentEditable'
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin'
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin'
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { registerMarkdownShortcuts, TRANSFORMERS } from '@lexical/markdown'
import { HeadingNode, QuoteNode } from '@lexical/rich-text'
import { ListNode, ListItemNode } from '@lexical/list'
import { LinkNode, AutoLinkNode } from '@lexical/link'
import { LinkPlugin } from '@lexical/react/LexicalLinkPlugin'
import { ClickableLinkPlugin } from '@lexical/react/LexicalClickableLinkPlugin'
import { CodeNode } from '@lexical/code'
import {
  BLUR_COMMAND,
  COMMAND_PRIORITY_LOW,
  KEY_BACKSPACE_COMMAND,
  KEY_ARROW_UP_COMMAND,
  KEY_ARROW_DOWN_COMMAND,
  $getRoot,
  $getSelection,
  $isRangeSelection,
} from 'lexical'
import type { EditorState, SerializedEditorState } from 'lexical'
import type { BlockNavCallbacks } from './useBlockKeyboardNav'
import { updateCollectionField } from './api'
import type { ApiTarget } from './types'
import LexicalToolbar from './LexicalToolbar'
import styles from './inline-edit.module.scss'

const EDITOR_NODES = [HeadingNode, QuoteNode, ListNode, ListItemNode, LinkNode, AutoLinkNode, CodeNode]

function editorTheme() {
  return {
    paragraph: styles.lexParagraph,
    link: styles.lexLink,
    text: {
      bold: styles.lexBold,
      italic: styles.lexItalic,
      underline: styles.lexUnderline,
      strikethrough: styles.lexStrikethrough,
      code: styles.lexCode,
    },
  }
}

function MarkdownShortcutsPlugin() {
  const [editor] = useLexicalComposerContext()
  useEffect(() => registerMarkdownShortcuts(editor, TRANSFORMERS), [editor])
  return null
}

function AutoFocusPlugin({ shouldFocus }: { shouldFocus: boolean }) {
  const [editor] = useLexicalComposerContext()
  useEffect(() => {
    if (shouldFocus) {
      editor.focus()
    }
  }, [editor, shouldFocus])
  return null
}

async function save(target: ApiTarget, fieldPath: string, state: EditorState) {
  if (target.type !== 'collection') return
  const json = state.toJSON()

  const arrayMatch = fieldPath.match(/^(\w+)\.(\d+)\.(.+)$/)
  if (arrayMatch) {
    const [, arrayField, indexStr, subField] = arrayMatch
    const index = parseInt(indexStr, 10)

    const res = await fetch(`/api/${target.slug}/${target.id}`, {
      credentials: 'include',
    })
    if (!res.ok) throw new Error('Failed to fetch document for array update')
    const doc = await res.json()

    const arr = [...((doc[arrayField] ?? []) as Record<string, unknown>[])]
    arr[index] = { ...arr[index], [subField]: json }

    await updateCollectionField(target.slug, target.id, arrayField, arr)
  } else {
    await updateCollectionField(target.slug, target.id, fieldPath, json)
  }
}

function SaveOnBlurPlugin({
  target,
  fieldPath,
  dirtyRef,
}: {
  target: ApiTarget
  fieldPath: string
  dirtyRef: React.RefObject<EditorState | null>
}) {
  const [editor] = useLexicalComposerContext()

  useEffect(() => {
    return editor.registerCommand(
      BLUR_COMMAND,
      () => {
        const state = dirtyRef.current
        if (state) {
          save(target, fieldPath, state).catch((err) => {
            console.error('[LexicalBlockEditor] save failed:', err)
          })
          dirtyRef.current = null
        }
        return false
      },
      COMMAND_PRIORITY_LOW,
    )
  }, [editor, target, fieldPath, dirtyRef])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault()
        const state = dirtyRef.current
        if (state) {
          save(target, fieldPath, state).catch((err) => {
            console.error('[LexicalBlockEditor] save failed:', err)
          })
          dirtyRef.current = null
        }
      }
    }
    const root = editor.getRootElement()
    root?.addEventListener('keydown', handleKeyDown)
    return () => root?.removeEventListener('keydown', handleKeyDown)
  }, [editor, target, fieldPath, dirtyRef])

  return null
}

function BlockNavPlugin({
  blockIndex,
  nav,
}: {
  blockIndex: number
  nav: BlockNavCallbacks
}) {
  const [editor] = useLexicalComposerContext()

  useEffect(() => {
    const unregBackspace = editor.registerCommand(
      KEY_BACKSPACE_COMMAND,
      (event) => {
        let atStart = false
        let isEmpty = false
        editor.read(() => {
          const sel = $getSelection()
          if (!$isRangeSelection(sel) || !sel.isCollapsed()) return
          const root = $getRoot()
          const textContent = root.getTextContent()
          isEmpty = textContent.trim() === ''
          const firstChild = root.getFirstDescendant()
          if (!firstChild) { atStart = true; return }
          const anchor = sel.anchor
          if (anchor.key === firstChild.getKey() && anchor.offset === 0) atStart = true
        })

        if (atStart && isEmpty) {
          event?.preventDefault()
          nav.onBackspaceAtStart(blockIndex, isEmpty)
          return true
        }
        return false
      },
      COMMAND_PRIORITY_LOW,
    )

    const unregUp = editor.registerCommand(
      KEY_ARROW_UP_COMMAND,
      () => {
        let atStart = false
        editor.read(() => {
          const sel = $getSelection()
          if (!$isRangeSelection(sel) || !sel.isCollapsed()) return
          const root = $getRoot()
          const firstChild = root.getFirstDescendant()
          if (!firstChild) { atStart = true; return }
          const anchor = sel.anchor
          if (anchor.key === firstChild.getKey() && anchor.offset === 0) atStart = true
        })
        if (atStart) {
          nav.onArrowUp(blockIndex)
          return true
        }
        return false
      },
      COMMAND_PRIORITY_LOW,
    )

    const unregDown = editor.registerCommand(
      KEY_ARROW_DOWN_COMMAND,
      () => {
        let atEnd = false
        editor.read(() => {
          const sel = $getSelection()
          if (!$isRangeSelection(sel) || !sel.isCollapsed()) return
          const root = $getRoot()
          const lastChild = root.getLastDescendant()
          if (!lastChild) { atEnd = true; return }
          const anchor = sel.anchor
          if (anchor.key === lastChild.getKey()) {
            const len = lastChild.getTextContentSize?.() ?? lastChild.getTextContent().length
            if (anchor.offset >= len) atEnd = true
          }
        })
        if (atEnd) {
          nav.onArrowDown(blockIndex)
          return true
        }
        return false
      },
      COMMAND_PRIORITY_LOW,
    )

    return () => {
      unregBackspace()
      unregUp()
      unregDown()
    }
  }, [editor, blockIndex, nav])

  return null
}

interface LexicalBlockEditorProps {
  initialState: SerializedEditorState | null
  target: ApiTarget
  fieldPath: string
  className?: string
  placeholder?: string
  autoFocus?: boolean
  blockIndex?: number
  nav?: BlockNavCallbacks
}

export default function LexicalBlockEditor({
  initialState,
  target,
  fieldPath,
  className,
  placeholder = 'Start typing…',
  autoFocus = false,
  blockIndex,
  nav,
}: LexicalBlockEditorProps) {
  const dirtyRef = useRef<EditorState | null>(null)

  const initialConfig = useMemo(
    () => ({
      namespace: `block-${fieldPath}`,
      theme: editorTheme(),
      nodes: EDITOR_NODES,
      editorState: initialState
        ? JSON.stringify(initialState)
        : undefined,
      onError: (error: Error) => {
        console.error('[LexicalBlockEditor]', error)
      },
    }),
    // initialState is static for the lifetime of the editor mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [fieldPath],
  )

  const handleChange = useCallback(
    (editorState: EditorState) => {
      dirtyRef.current = editorState
    },
    [],
  )

  return (
    <div className={[styles.lexEditorWrapper, className].filter(Boolean).join(' ')}>
      <LexicalComposer initialConfig={initialConfig}>
        <LexicalToolbar />
        <RichTextPlugin
          contentEditable={
            <ContentEditable
              className={styles.lexContentEditable}
              aria-label="Rich text editor"
            />
          }
          placeholder={
            <div className={styles.lexPlaceholder}>{placeholder}</div>
          }
          ErrorBoundary={LexicalErrorBoundary}
        />
        <LinkPlugin />
        <ClickableLinkPlugin />
        <HistoryPlugin />
        <OnChangePlugin onChange={handleChange} />
        <MarkdownShortcutsPlugin />
        <AutoFocusPlugin shouldFocus={autoFocus} />
        {nav && blockIndex !== undefined && (
          <BlockNavPlugin blockIndex={blockIndex} nav={nav} />
        )}
        <SaveOnBlurPlugin
          target={target}
          fieldPath={fieldPath}
          dirtyRef={dirtyRef}
        />
      </LexicalComposer>
    </div>
  )
}
