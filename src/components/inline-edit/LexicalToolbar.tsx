'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import {
  $getSelection,
  $isRangeSelection,
  FORMAT_TEXT_COMMAND,
  SELECTION_CHANGE_COMMAND,
  COMMAND_PRIORITY_LOW,
  $createParagraphNode,
} from 'lexical'
import type { RangeSelection, TextFormatType } from 'lexical'
import { $setBlocksType } from '@lexical/selection'
import { $createHeadingNode, $isHeadingNode } from '@lexical/rich-text'
import { TOGGLE_LINK_COMMAND, $isLinkNode } from '@lexical/link'
import { $findMatchingParent } from '@lexical/utils'
import { ButtonSelect, ButtonSelectItem } from '@/components/ui/ButtonSelect'
import { Tooltip } from '@/components/ui/Tooltip'
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/DropdownMenu'
import { Kbd } from '@/components/ui/Kbd'
import { FONT_FAMILY_SCALE, COLOR_TOKENS } from './token-map'
import styles from './inline-edit.module.scss'

type FormatState = {
  bold: boolean
  italic: boolean
  underline: boolean
  strikethrough: boolean
  code: boolean
}

type BlockState = 'paragraph' | 'h2' | 'h3'

function getFormatState(selection: RangeSelection): FormatState {
  return {
    bold: selection.hasFormat('bold'),
    italic: selection.hasFormat('italic'),
    underline: selection.hasFormat('underline'),
    strikethrough: selection.hasFormat('strikethrough'),
    code: selection.hasFormat('code'),
  }
}

function getBlockState(selection: RangeSelection): BlockState {
  const anchorNode = selection.anchor.getNode()
  const element =
    anchorNode.getKey() === 'root'
      ? anchorNode
      : anchorNode.getTopLevelElementOrThrow()
  if ($isHeadingNode(element)) {
    const tag = element.getTag()
    if (tag === 'h2') return 'h2'
    if (tag === 'h3') return 'h3'
  }
  return 'paragraph'
}

function FormatButton({
  label,
  shortcut,
  active,
  onClick,
  children,
}: {
  label: string
  shortcut?: string
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <Tooltip content={<>{label} {shortcut && <Kbd>{shortcut}</Kbd>}</>}>
      <button
        type="button"
        className={[styles.lexToolbarBtn, active && styles.lexToolbarBtnActive].filter(Boolean).join(' ')}
        onMouseDown={(e) => {
          e.preventDefault()
          onClick()
        }}
        aria-label={label}
        aria-pressed={active}
      >
        {children}
      </button>
    </Tooltip>
  )
}

export default function LexicalToolbar() {
  const [editor] = useLexicalComposerContext()
  const toolbarRef = useRef<HTMLDivElement>(null)
  const [format, setFormat] = useState<FormatState>({
    bold: false,
    italic: false,
    underline: false,
    strikethrough: false,
    code: false,
  })
  const [blockType, setBlockType] = useState<BlockState>('paragraph')
  const [isLink, setIsLink] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const [position, setPosition] = useState({ top: 0, left: 0 })

  const updateToolbar = useCallback(() => {
    editor.read(() => {
      const selection = $getSelection()
      if (!$isRangeSelection(selection)) {
        setIsVisible(false)
        return
      }

      if (selection.isCollapsed()) {
        setIsVisible(false)
        return
      }

      setFormat(getFormatState(selection))
      setBlockType(getBlockState(selection))

      const node = selection.anchor.getNode()
      const parent = node.getParent()
      setIsLink($isLinkNode(parent) || $isLinkNode(node) || !!$findMatchingParent(node, $isLinkNode))

      setIsVisible(true)
    })
  }, [editor])

  useEffect(() => {
    return editor.registerCommand(
      SELECTION_CHANGE_COMMAND,
      () => {
        updateToolbar()
        return false
      },
      COMMAND_PRIORITY_LOW,
    )
  }, [editor, updateToolbar])

  useEffect(() => {
    if (!isVisible) return

    const nativeSelection = window.getSelection()
    if (!nativeSelection || nativeSelection.rangeCount === 0) return

    const range = nativeSelection.getRangeAt(0)
    const rect = range.getBoundingClientRect()
    const editorRoot = editor.getRootElement()
    if (!editorRoot) return
    const editorRect = editorRoot.getBoundingClientRect()

    setPosition({
      top: rect.top - editorRect.top - 44,
      left: rect.left - editorRect.left + rect.width / 2,
    })
  }, [isVisible, editor, format])

  const applyFormat = useCallback(
    (fmt: TextFormatType) => {
      editor.dispatchCommand(FORMAT_TEXT_COMMAND, fmt)
    },
    [editor],
  )

  const applyBlockType = useCallback(
    (type: string) => {
      editor.update(() => {
        const selection = $getSelection()
        if (!$isRangeSelection(selection)) return
        if (type === 'paragraph') {
          $setBlocksType(selection, () => $createParagraphNode())
        } else if (type === 'h2' || type === 'h3') {
          $setBlocksType(selection, () => $createHeadingNode(type))
        }
      })
      setBlockType(type as BlockState)
    },
    [editor],
  )

  const applyFontFamily = useCallback(
    (css: string) => {
      editor.update(() => {
        const selection = $getSelection()
        if ($isRangeSelection(selection)) {
          const nodes = selection.getNodes()
          for (const node of nodes) {
            if (node.getType() === 'text') {
              const existing = (node as { getStyle?: () => string }).getStyle?.() ?? ''
              const stripped = existing.replace(/font-family:[^;]+;?\s*/g, '')
              const next = `font-family: ${css}; ${stripped}`.trim()
              ;(node as { setStyle?: (s: string) => void }).setStyle?.(next)
            }
          }
        }
      })
    },
    [editor],
  )

  const toggleLink = useCallback(() => {
    if (isLink) {
      editor.dispatchCommand(TOGGLE_LINK_COMMAND, null)
    } else {
      const url = window.prompt('Enter URL')
      if (url) {
        editor.dispatchCommand(TOGGLE_LINK_COMMAND, { url, target: '_blank', rel: 'noopener noreferrer' })
      }
    }
  }, [editor, isLink])

  const applyColor = useCallback(
    (hex: string) => {
      editor.update(() => {
        const selection = $getSelection()
        if ($isRangeSelection(selection)) {
          const nodes = selection.getNodes()
          for (const node of nodes) {
            if (node.getType() === 'text') {
              const existing = (node as { getStyle?: () => string }).getStyle?.() ?? ''
              const stripped = existing.replace(/color:[^;]+;?\s*/g, '')
              const next = `color: ${hex}; ${stripped}`.trim()
              ;(node as { setStyle?: (s: string) => void }).setStyle?.(next)
            }
          }
        }
      })
    },
    [editor],
  )

  if (!isVisible) return null

  const isMac = typeof navigator !== 'undefined' && /Mac/.test(navigator.platform)
  const mod = isMac ? '⌘' : 'Ctrl+'

  return (
    <div
      ref={toolbarRef}
      className={styles.lexToolbar}
      style={{
        position: 'absolute',
        top: `${position.top}px`,
        left: `${position.left}px`,
        transform: 'translateX(-50%)',
      }}
      role="toolbar"
      aria-label="Text formatting"
      onMouseDown={(e) => e.preventDefault()}
    >
      {/* Block type select */}
      <ButtonSelect
        value={blockType}
        onValueChange={applyBlockType}
        size="xs"
        emphasis="subtle"
        aria-label="Block type"
      >
        <ButtonSelectItem value="paragraph">P</ButtonSelectItem>
        <ButtonSelectItem value="h2">H2</ButtonSelectItem>
        <ButtonSelectItem value="h3">H3</ButtonSelectItem>
      </ButtonSelect>

      <span className={styles.lexToolbarSep} aria-hidden />

      {/* Inline format toggles */}
      <FormatButton label="Bold" shortcut={`${mod}B`} active={format.bold} onClick={() => applyFormat('bold')}>
        <strong>B</strong>
      </FormatButton>
      <FormatButton label="Italic" shortcut={`${mod}I`} active={format.italic} onClick={() => applyFormat('italic')}>
        <em>I</em>
      </FormatButton>
      <FormatButton label="Underline" shortcut={`${mod}U`} active={format.underline} onClick={() => applyFormat('underline')}>
        <u>U</u>
      </FormatButton>
      <FormatButton label="Strikethrough" active={format.strikethrough} onClick={() => applyFormat('strikethrough')}>
        <s>S</s>
      </FormatButton>
      <FormatButton label="Code" active={format.code} onClick={() => applyFormat('code')}>
        <code>&lt;/&gt;</code>
      </FormatButton>
      <FormatButton label="Link" active={isLink} onClick={toggleLink}>
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
          <path d="M6 8l2-2m-1.5-1.5L8.25 2.75a1.77 1.77 0 012.5 0l.5.5a1.77 1.77 0 010 2.5L9.5 7.5M4.5 6.5L2.75 8.25a1.77 1.77 0 000 2.5l.5.5a1.77 1.77 0 002.5 0L7.5 9.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </FormatButton>

      <span className={styles.lexToolbarSep} aria-hidden />

      {/* Font family */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button type="button" className={styles.lexToolbarBtn} onMouseDown={(e) => e.preventDefault()}>
            Aa
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          {FONT_FAMILY_SCALE.map((f) => (
            <DropdownMenuItem key={f.token} onSelect={() => applyFontFamily(f.css)}>
              <span style={{ fontFamily: f.css }}>{f.name}</span>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Text color */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button type="button" className={styles.lexToolbarBtn} onMouseDown={(e) => e.preventDefault()} aria-label="Text color">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <path d="M3 11h8M5 3l-2.5 6h1L5.5 5h3L10.5 9h1L9 3z" fill="currentColor" />
            </svg>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <div className={styles.lexColorGrid}>
            {COLOR_TOKENS.map((c) => (
              <button
                key={c.token}
                type="button"
                className={styles.lexColorSwatch}
                title={c.name}
                onClick={() => applyColor(c.hex)}
                onMouseDown={(e) => e.preventDefault()}
              >
                <span
                  className={styles.lexColorDot}
                  style={{ backgroundColor: c.hex }}
                />
              </button>
            ))}
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
