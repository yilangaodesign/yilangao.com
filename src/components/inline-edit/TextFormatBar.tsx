'use client'

import { useCallback, useEffect, useRef, useState, type MouseEvent as ReactMouseEvent } from 'react'
import { useInlineEdit } from './useInlineEdit'
import {
  matchFontSize,
  matchFontWeight,
  matchFontFamily,
  matchColor,
  TYPE_SCALE,
  WEIGHT_SCALE,
  FONT_FAMILY_SCALE,
  COLOR_TOKENS,
} from './token-map'
import type { TokenMatch } from './token-map'
import styles from './inline-edit.module.scss'

function useListboxKeyboard(
  containerRef: React.RefObject<HTMLDivElement | null>,
  isOpen: boolean,
  onClose: () => void,
) {
  useEffect(() => {
    if (!isOpen) return
    const container = containerRef.current
    if (!container) return

    const items = container.querySelectorAll<HTMLButtonElement>('[role="option"]')
    if (!items.length) return
    let idx = Array.from(items).findIndex((el) => el.getAttribute('aria-selected') === 'true')
    if (idx < 0) idx = 0

    function highlight(i: number) {
      items.forEach((el) => el.removeAttribute('data-highlighted'))
      items[i]?.setAttribute('data-highlighted', '')
      items[i]?.scrollIntoView({ block: 'nearest' })
    }
    highlight(idx)

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        idx = (idx + 1) % items.length
        highlight(idx)
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        idx = (idx - 1 + items.length) % items.length
        highlight(idx)
      } else if (e.key === 'Home') {
        e.preventDefault()
        idx = 0
        highlight(idx)
      } else if (e.key === 'End') {
        e.preventDefault()
        idx = items.length - 1
        highlight(idx)
      } else if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        items[idx]?.click()
      } else if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [containerRef, isOpen, onClose])
}

interface TextProperties {
  fontSize: TokenMatch
  fontWeight: TokenMatch
  fontFamily: TokenMatch
  fontStyle: string
  color: TokenMatch
  selectionBold: boolean
  selectionItalic: boolean
}

function getActiveElement(): HTMLElement | null {
  return document.querySelector('[data-editable-active]') as HTMLElement | null
}

function hasActiveSelection(el: HTMLElement): boolean {
  const sel = window.getSelection()
  if (!sel || sel.isCollapsed || !sel.rangeCount) return false
  const range = sel.getRangeAt(0)
  return el.contains(range.startContainer) && el.contains(range.endContainer)
}

function selectAllContent(el: HTMLElement): void {
  const range = document.createRange()
  range.selectNodeContents(el)
  const sel = window.getSelection()
  sel?.removeAllRanges()
  sel?.addRange(range)
}

function collapseToEnd(el: HTMLElement): void {
  const sel = window.getSelection()
  if (!sel) return
  const range = document.createRange()
  range.selectNodeContents(el)
  range.collapse(false)
  sel.removeAllRanges()
  sel.addRange(range)
}

function wrapSelectionWithStyle(el: HTMLElement, cssProp: string, cssValue: string): void {
  const sel = window.getSelection()
  if (!sel || sel.rangeCount === 0) return
  const range = sel.getRangeAt(0)
  if (range.collapsed) return
  if (!el.contains(range.startContainer) || !el.contains(range.endContainer)) return

  const fragment = range.extractContents()
  const span = document.createElement('span')
  span.style.setProperty(cssProp, cssValue)
  span.appendChild(fragment)
  range.insertNode(span)

  sel.removeAllRanges()
  const newRange = document.createRange()
  newRange.selectNodeContents(span)
  sel.addRange(newRange)

  el.dispatchEvent(new Event('input', { bubbles: true }))
}

function notifyChange(el: HTMLElement): void {
  el.dispatchEvent(new Event('input', { bubbles: true }))
  el.dispatchEvent(new CustomEvent('inlinestyle', { bubbles: true }))
}

function readProperties(el: HTMLElement): TextProperties {
  const computed = window.getComputedStyle(el)
  let selBold = false
  let selItalic = false
  try {
    selBold = document.queryCommandState('bold')
    selItalic = document.queryCommandState('italic')
  } catch { /* not available outside contentEditable */ }

  return {
    fontSize: matchFontSize(computed.fontSize),
    fontWeight: matchFontWeight(computed.fontWeight),
    fontFamily: matchFontFamily(computed.fontFamily),
    fontStyle: computed.fontStyle,
    color: matchColor(computed.color),
    selectionBold: selBold || parseInt(computed.fontWeight, 10) >= 700,
    selectionItalic: selItalic || computed.fontStyle === 'italic',
  }
}

function isMac(): boolean {
  return navigator.platform?.toUpperCase().includes('MAC') ?? false
}

export default function TextFormatBar() {
  const ctx = useInlineEdit()
  const [props, setProps] = useState<TextProperties | null>(null)
  const [showSizeMenu, setShowSizeMenu] = useState(false)
  const [showWeightMenu, setShowWeightMenu] = useState(false)
  const [showFontMenu, setShowFontMenu] = useState(false)
  const [showColorMenu, setShowColorMenu] = useState(false)
  const sizeRef = useRef<HTMLDivElement>(null)
  const weightRef = useRef<HTMLDivElement>(null)
  const fontRef = useRef<HTMLDivElement>(null)
  const colorRef = useRef<HTMLDivElement>(null)
  const sizeListRef = useRef<HTMLDivElement>(null)
  const weightListRef = useRef<HTMLDivElement>(null)
  const fontListRef = useRef<HTMLDivElement>(null)
  const colorListRef = useRef<HTMLDivElement>(null)

  const refreshState = useCallback(() => {
    const el = getActiveElement()
    if (el) setProps(readProperties(el))
  }, [])

  useEffect(() => {
    if (!ctx?.activeFieldId) {
      setProps(null)
      setShowSizeMenu(false)
      setShowWeightMenu(false)
      setShowFontMenu(false)
      setShowColorMenu(false)
      return
    }

    requestAnimationFrame(refreshState)

    function handleStyleChange() {
      refreshState()
    }
    function handleSelectionChange() {
      if (!ctx?.activeFieldId) return
      refreshState()
    }
    document.addEventListener('inlinestyle', handleStyleChange)
    document.addEventListener('selectionchange', handleSelectionChange)
    return () => {
      document.removeEventListener('inlinestyle', handleStyleChange)
      document.removeEventListener('selectionchange', handleSelectionChange)
    }
  }, [ctx?.activeFieldId, refreshState])

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (sizeRef.current && !sizeRef.current.contains(e.target as Node)) {
        setShowSizeMenu(false)
      }
      if (weightRef.current && !weightRef.current.contains(e.target as Node)) {
        setShowWeightMenu(false)
      }
      if (fontRef.current && !fontRef.current.contains(e.target as Node)) {
        setShowFontMenu(false)
      }
      if (colorRef.current && !colorRef.current.contains(e.target as Node)) {
        setShowColorMenu(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const closeSizeMenu = useCallback(() => setShowSizeMenu(false), [])
  const closeWeightMenu = useCallback(() => setShowWeightMenu(false), [])
  const closeFontMenu = useCallback(() => setShowFontMenu(false), [])
  const closeColorMenu = useCallback(() => setShowColorMenu(false), [])

  useListboxKeyboard(sizeListRef, showSizeMenu, closeSizeMenu)
  useListboxKeyboard(weightListRef, showWeightMenu, closeWeightMenu)
  useListboxKeyboard(fontListRef, showFontMenu, closeFontMenu)
  useListboxKeyboard(colorListRef, showColorMenu, closeColorMenu)

  const applyFontSize = useCallback((rem: string) => {
    const el = getActiveElement()
    if (!el) return
    if (hasActiveSelection(el)) {
      wrapSelectionWithStyle(el, 'font-size', rem)
    } else {
      el.style.fontSize = rem
    }
    notifyChange(el)
    setProps(readProperties(el))
    setShowSizeMenu(false)
  }, [])

  const applyFontFamily = useCallback((css: string) => {
    const el = getActiveElement()
    if (!el) return
    if (hasActiveSelection(el)) {
      wrapSelectionWithStyle(el, 'font-family', css)
    } else {
      selectAllContent(el)
      wrapSelectionWithStyle(el, 'font-family', css)
      collapseToEnd(el)
    }
    notifyChange(el)
    setProps(readProperties(el))
    setShowFontMenu(false)
  }, [])

  const applyFontWeight = useCallback((weight: number) => {
    const el = getActiveElement()
    if (!el) return
    if (hasActiveSelection(el)) {
      wrapSelectionWithStyle(el, 'font-weight', String(weight))
    } else {
      selectAllContent(el)
      wrapSelectionWithStyle(el, 'font-weight', String(weight))
      collapseToEnd(el)
    }
    notifyChange(el)
    setProps(readProperties(el))
    setShowWeightMenu(false)
  }, [])

  const toggleBold = useCallback(() => {
    const el = getActiveElement()
    if (!el) return

    if (hasActiveSelection(el)) {
      document.execCommand('bold', false)
    } else {
      selectAllContent(el)
      document.execCommand('bold', false)
      collapseToEnd(el)
    }
    el.style.removeProperty('font-weight')
    notifyChange(el)
    setProps(readProperties(el))
  }, [])

  const toggleItalic = useCallback(() => {
    const el = getActiveElement()
    if (!el) return

    if (hasActiveSelection(el)) {
      document.execCommand('italic', false)
    } else {
      selectAllContent(el)
      document.execCommand('italic', false)
      collapseToEnd(el)
    }
    el.style.removeProperty('font-style')
    notifyChange(el)
    setProps(readProperties(el))
  }, [])

  const applyColor = useCallback((hex: string) => {
    const el = getActiveElement()
    if (!el) return
    if (hasActiveSelection(el)) {
      document.execCommand('foreColor', false, hex)
    } else {
      selectAllContent(el)
      document.execCommand('foreColor', false, hex)
      collapseToEnd(el)
    }
    notifyChange(el)
    setProps(readProperties(el))
    setShowColorMenu(false)
  }, [])

  const preventFocusLoss = useCallback((e: ReactMouseEvent) => {
    e.preventDefault()
  }, [])

  if (!ctx?.isAdmin || !ctx.activeFieldId || !props) return null

  const isBold = props.selectionBold
  const isItalic = props.selectionItalic
  const mod = isMac() ? '⌘' : 'Ctrl+'

  return (
    <div className={styles.formatBar} onMouseDown={preventFocusLoss}>
      <div className={styles.formatBarInner}>
        {/* Font family */}
        <div ref={fontRef} className={styles.formatGroup}>
          <button
            type="button"
            className={styles.formatSelect}
            onClick={() => {
              setShowFontMenu((v) => !v)
              setShowSizeMenu(false)
              setShowWeightMenu(false)
              setShowColorMenu(false)
            }}
            aria-haspopup="listbox"
            aria-expanded={showFontMenu}
          >
            <span className={styles.formatLabel}>Font</span>
            <span className={styles.formatValue}>{props.fontFamily.name}</span>
            <svg width="8" height="8" viewBox="0 0 8 8" fill="none" aria-hidden className={styles.formatChevron}>
              <path d="M1.5 3L4 5.5L6.5 3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          {showFontMenu && (
            <div ref={fontListRef} className={styles.formatDropdown} role="listbox" aria-label="Font family">
              {FONT_FAMILY_SCALE.map((f) => (
                <button
                  key={f.name}
                  type="button"
                  role="option"
                  aria-selected={f.name === props.fontFamily.name}
                  className={[
                    styles.formatOption,
                    f.name === props.fontFamily.name ? styles.formatOptionActive : '',
                  ].filter(Boolean).join(' ')}
                  onClick={() => applyFontFamily(f.css)}
                >
                  <span className={styles.formatOptionName}>{f.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className={styles.formatDivider} />

        {/* Font size */}
        <div ref={sizeRef} className={styles.formatGroup}>
          <button
            type="button"
            className={styles.formatSelect}
            onClick={() => {
              setShowSizeMenu((v) => !v)
              setShowWeightMenu(false)
              setShowFontMenu(false)
              setShowColorMenu(false)
            }}
            aria-haspopup="listbox"
            aria-expanded={showSizeMenu}
          >
            <span className={styles.formatLabel}>Size</span>
            <span className={styles.formatValue}>{props.fontSize.name}</span>
            <span className={styles.formatMeta}>{props.fontSize.rawValue}</span>
            <svg
              width="8"
              height="8"
              viewBox="0 0 8 8"
              fill="none"
              aria-hidden
              className={styles.formatChevron}
            >
              <path
                d="M1.5 3L4 5.5L6.5 3"
                stroke="currentColor"
                strokeWidth="1.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          {showSizeMenu && (
            <div ref={sizeListRef} className={styles.formatDropdown} role="listbox" aria-label="Font size">
              {TYPE_SCALE.map((t) => (
                <button
                  key={t.name}
                  type="button"
                  role="option"
                  aria-selected={t.name === props.fontSize.name}
                  className={[
                    styles.formatOption,
                    t.name === props.fontSize.name ? styles.formatOptionActive : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  onClick={() => applyFontSize(t.rem)}
                >
                  <span className={styles.formatOptionName}>{t.name}</span>
                  <span className={styles.formatOptionMeta}>{t.px}px</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className={styles.formatDivider} />

        {/* Font weight */}
        <div ref={weightRef} className={styles.formatGroup}>
          <button
            type="button"
            className={styles.formatSelect}
            onClick={() => {
              setShowWeightMenu((v) => !v)
              setShowSizeMenu(false)
              setShowFontMenu(false)
              setShowColorMenu(false)
            }}
            aria-haspopup="listbox"
            aria-expanded={showWeightMenu}
          >
            <span className={styles.formatLabel}>Weight</span>
            <span className={styles.formatValue}>{props.fontWeight.name}</span>
            <span className={styles.formatMeta}>{props.fontWeight.value}</span>
            <svg
              width="8"
              height="8"
              viewBox="0 0 8 8"
              fill="none"
              aria-hidden
              className={styles.formatChevron}
            >
              <path
                d="M1.5 3L4 5.5L6.5 3"
                stroke="currentColor"
                strokeWidth="1.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          {showWeightMenu && (
            <div ref={weightListRef} className={styles.formatDropdown} role="listbox" aria-label="Font weight">
              {WEIGHT_SCALE.map((w) => (
                <button
                  key={w.value}
                  type="button"
                  role="option"
                  aria-selected={w.name === props.fontWeight.name}
                  className={[
                    styles.formatOption,
                    w.name === props.fontWeight.name ? styles.formatOptionActive : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  onClick={() => applyFontWeight(w.value)}
                >
                  <span className={styles.formatOptionName} style={{ fontWeight: w.value }}>
                    {w.name}
                  </span>
                  <span className={styles.formatOptionMeta}>{w.value}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className={styles.formatDivider} />

        {/* Bold toggle */}
        <button
          type="button"
          className={[styles.formatToggle, isBold ? styles.formatToggleActive : '']
            .filter(Boolean)
            .join(' ')}
          onClick={toggleBold}
          title={`Bold (${mod}B)`}
          aria-label="Toggle bold"
          aria-pressed={isBold}
        >
          <strong>B</strong>
        </button>

        {/* Italic toggle */}
        <button
          type="button"
          className={[styles.formatToggle, isItalic ? styles.formatToggleActive : '']
            .filter(Boolean)
            .join(' ')}
          onClick={toggleItalic}
          title={`Italic (${mod}I)`}
          aria-label="Toggle italic"
          aria-pressed={isItalic}
        >
          <em>I</em>
        </button>

        <div className={styles.formatDivider} />

        {/* Color picker */}
        <div ref={colorRef} className={styles.formatGroup}>
          <button
            type="button"
            className={styles.formatSelect}
            onClick={() => {
              setShowColorMenu((v) => !v)
              setShowSizeMenu(false)
              setShowWeightMenu(false)
              setShowFontMenu(false)
            }}
            aria-haspopup="listbox"
            aria-expanded={showColorMenu}
          >
            <span
              className={styles.formatColorSwatch}
              style={{ backgroundColor: props.color.rawValue }}
            />
            <span className={styles.formatValue}>{props.color.name}</span>
            <svg width="8" height="8" viewBox="0 0 8 8" fill="none" aria-hidden className={styles.formatChevron}>
              <path d="M1.5 3L4 5.5L6.5 3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          {showColorMenu && (
            <div ref={colorListRef} className={styles.formatColorGrid} role="listbox" aria-label="Text color">
              {COLOR_TOKENS.map((c) => (
                <button
                  key={c.token}
                  type="button"
                  role="option"
                  aria-selected={c.hex === props.color.rawValue}
                  aria-label={c.name}
                  title={c.name}
                  className={[
                    styles.formatColorOption,
                    c.hex === props.color.rawValue ? styles.formatColorOptionActive : '',
                  ].filter(Boolean).join(' ')}
                  onClick={() => applyColor(c.hex)}
                >
                  <span className={styles.formatColorDot} style={{ backgroundColor: c.hex }} />
                  <span className={styles.formatColorLabel}>{c.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
