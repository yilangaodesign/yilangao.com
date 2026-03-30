'use client'

import { useCallback, useEffect, useRef, useState, type MouseEvent as ReactMouseEvent } from 'react'
import { useInlineEdit } from './useInlineEdit'
import {
  matchFontSize,
  matchFontWeight,
  matchColor,
  TYPE_SCALE,
  WEIGHT_SCALE,
} from './token-map'
import type { TokenMatch } from './token-map'
import styles from './inline-edit.module.scss'

interface TextProperties {
  fontSize: TokenMatch
  fontWeight: TokenMatch
  fontStyle: string
  color: TokenMatch
  selectionBold: boolean
  selectionItalic: boolean
}

function getActiveElement(): HTMLElement | null {
  return document.querySelector('[data-editable-active]') as HTMLElement | null
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
  const sizeRef = useRef<HTMLDivElement>(null)
  const weightRef = useRef<HTMLDivElement>(null)

  const refreshState = useCallback(() => {
    const el = getActiveElement()
    if (el) setProps(readProperties(el))
  }, [])

  useEffect(() => {
    if (!ctx?.activeFieldId) {
      setProps(null)
      setShowSizeMenu(false)
      setShowWeightMenu(false)
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
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const applyFontSize = useCallback((rem: string) => {
    const el = getActiveElement()
    if (!el) return
    el.style.fontSize = rem
    setProps(readProperties(el))
    setShowSizeMenu(false)
  }, [])

  const applyFontWeight = useCallback((weight: number) => {
    const el = getActiveElement()
    if (!el) return
    el.style.fontWeight = String(weight)
    setProps(readProperties(el))
    setShowWeightMenu(false)
  }, [])

  const toggleBold = useCallback(() => {
    const el = getActiveElement()
    if (!el) return

    const sel = window.getSelection()
    if (sel && !sel.isCollapsed && sel.rangeCount && el.contains(sel.anchorNode)) {
      document.execCommand('bold', false)
    } else {
      const computed = window.getComputedStyle(el)
      const current = parseInt(computed.fontWeight, 10) || 400
      el.style.fontWeight = current >= 700 ? '400' : '700'
    }
    setProps(readProperties(el))
  }, [])

  const toggleItalic = useCallback(() => {
    const el = getActiveElement()
    if (!el) return

    const sel = window.getSelection()
    if (sel && !sel.isCollapsed && sel.rangeCount && el.contains(sel.anchorNode)) {
      document.execCommand('italic', false)
    } else {
      const computed = window.getComputedStyle(el)
      el.style.fontStyle = computed.fontStyle === 'italic' ? 'normal' : 'italic'
    }
    setProps(readProperties(el))
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
        {/* Font size */}
        <div ref={sizeRef} className={styles.formatGroup}>
          <button
            type="button"
            className={styles.formatSelect}
            onClick={() => {
              setShowSizeMenu((v) => !v)
              setShowWeightMenu(false)
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
            <div className={styles.formatDropdown} role="listbox" aria-label="Font size">
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
                  <span className={styles.formatOptionValue}>{t.rem}</span>
                  <span className={styles.formatOptionMeta}>{t.px}px</span>
                  <span className={styles.formatOptionToken}>{t.token}</span>
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
            <div className={styles.formatDropdown} role="listbox" aria-label="Font weight">
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
                  <span className={styles.formatOptionValue}>{w.value}</span>
                  <span className={styles.formatOptionToken}>{w.token}</span>
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

        {/* Color display */}
        <div className={styles.formatColorInfo}>
          <span
            className={styles.formatColorSwatch}
            style={{ backgroundColor: props.color.rawValue }}
          />
          <span className={styles.formatColorName}>{props.color.name}</span>
          <span className={styles.formatColorHex}>{props.color.rawValue}</span>
        </div>

        {/* Active token reference */}
        <span className={styles.formatTokenRef}>{props.fontSize.token}</span>
      </div>
    </div>
  )
}
