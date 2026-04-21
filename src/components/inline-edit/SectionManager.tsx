'use client'

import { useCallback, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { updateCollectionField } from './api'
import type { ApiTarget } from './types'
import { useConfirm } from './ConfirmDelete'
import { useToast } from './ToastSurface'
import styles from './inline-edit.module.scss'

const LAYOUT_OPTIONS = [
  { value: 'auto', label: 'Auto' },
  { value: 'full-width', label: 'Full Width' },
  { value: 'grid-2-equal', label: '2-Col Equal' },
  { value: 'grid-2-left-heavy', label: '2-Col Left' },
  { value: 'grid-2-right-heavy', label: '2-Col Right' },
  { value: 'grid-3-bento', label: '3-Col Bento' },
  { value: 'grid-3-equal', label: '3-Col Equal' },
  { value: 'stacked', label: 'Stacked' },
] as const;

export default function useSectionManager(target: ApiTarget | undefined) {
  const router = useRouter()
  const { confirm } = useConfirm()
  const toast = useToast()
  const [busy, setBusy] = useState(false)

  const patchSections = useCallback(
    async (transform: (sections: unknown[]) => unknown[]) => {
      if (!target || target.type !== 'collection' || !target.id) return
      setBusy(true)
      try {
        const res = await fetch(`/api/${target.slug}/${target.id}`, {
          credentials: 'include',
        })
        if (!res.ok) throw new Error('Failed to fetch project')
        const json = await res.json()
        const current = (json.sections ?? []) as unknown[]
        const updated = transform(current)
        await updateCollectionField(target.slug, target.id, 'sections', updated)
        router.refresh()
      } catch (e) {
        toast.error(e instanceof Error ? e.message : 'Section update failed')
      } finally {
        setBusy(false)
      }
    },
    [target, router, toast],
  )

  const addSection = useCallback(() => {
    patchSections((sections) => [
      ...sections,
      {
        heading: 'New Section',
        body: {
          root: {
            type: 'root', format: '', indent: 0, version: 1,
            children: [{
              type: 'paragraph', format: '', indent: 0, version: 1,
              children: [{ mode: 'normal', text: 'Section content.', type: 'text', style: '', detail: 0, format: 0, version: 1 }],
              direction: 'ltr', textFormat: 0, textStyle: '',
            }],
            direction: 'ltr',
          },
        },
        images: [],
        caption: '',
        layout: 'auto',
        showDivider: true,
      },
    ])
  }, [patchSections])

  const deleteSection = useCallback(
    async (index: number) => {
      const ok = await confirm({
        title: `Delete section ${index + 1}?`,
        description: 'This cannot be undone. The section and all its content will be removed.',
      })
      if (!ok) return
      patchSections((sections) => sections.filter((_, i) => i !== index))
    },
    [confirm, patchSections],
  )

  const moveSection = useCallback(
    (index: number, direction: -1 | 1) => {
      patchSections((sections) => {
        const next = [...sections]
        const swapTarget = index + direction
        if (swapTarget < 0 || swapTarget >= next.length) return next
        ;[next[index], next[swapTarget]] = [next[swapTarget], next[index]]
        return next
      })
    },
    [patchSections],
  )

  const patchSectionField = useCallback(
    (index: number, field: string, value: unknown) => {
      patchSections((sections) => {
        const next = [...sections]
        const section = { ...(next[index] as Record<string, unknown>) }
        section[field] = value
        next[index] = section
        return next
      })
    },
    [patchSections],
  )

  return { busy, addSection, deleteSection, moveSection, patchSectionField }
}

export function SectionToolbar({
  index,
  total,
  onMoveUp,
  onMoveDown,
  onDelete,
  onLayoutChange,
  onDividerToggle,
  currentLayout,
  showDivider,
  busy,
}: {
  index: number
  total: number
  onMoveUp: () => void
  onMoveDown: () => void
  onDelete: () => void
  onLayoutChange?: (layout: string) => void
  onDividerToggle?: () => void
  currentLayout?: string
  showDivider?: boolean
  busy: boolean
}) {
  const [showLayoutMenu, setShowLayoutMenu] = useState(false)
  const layoutRef = useRef<HTMLDivElement>(null)

  return (
    <div className={styles.sectionToolbar}>
      <button
        type="button"
        className={styles.sectionToolbarBtn}
        onClick={onMoveUp}
        disabled={busy || index === 0}
        title="Move section up"
        aria-label="Move section up"
      >
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
          <path d="M6 2.5L6 9.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M2.5 6L6 2.5L9.5 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      <button
        type="button"
        className={styles.sectionToolbarBtn}
        onClick={onMoveDown}
        disabled={busy || index === total - 1}
        title="Move section down"
        aria-label="Move section down"
      >
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
          <path d="M6 9.5L6 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M2.5 6L6 9.5L9.5 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      <span className={styles.sectionToolbarSep} aria-hidden />

      {onLayoutChange && (
        <div ref={layoutRef} className={styles.sectionToolbarLayoutWrap}>
          <button
            type="button"
            className={styles.sectionToolbarBtn}
            onClick={() => setShowLayoutMenu((v) => !v)}
            disabled={busy}
            title="Image layout"
            aria-label="Change image layout"
            aria-expanded={showLayoutMenu}
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
              <rect x="1" y="1" width="4" height="4" rx="0.5" stroke="currentColor" strokeWidth="1" />
              <rect x="7" y="1" width="4" height="4" rx="0.5" stroke="currentColor" strokeWidth="1" />
              <rect x="1" y="7" width="4" height="4" rx="0.5" stroke="currentColor" strokeWidth="1" />
              <rect x="7" y="7" width="4" height="4" rx="0.5" stroke="currentColor" strokeWidth="1" />
            </svg>
          </button>
          {showLayoutMenu && (
            <div className={styles.sectionLayoutMenu} role="listbox" aria-label="Layout options">
              {LAYOUT_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  role="option"
                  aria-selected={currentLayout === opt.value}
                  className={[
                    styles.sectionLayoutOption,
                    currentLayout === opt.value ? styles.sectionLayoutOptionActive : '',
                  ].filter(Boolean).join(' ')}
                  onClick={() => {
                    onLayoutChange(opt.value)
                    setShowLayoutMenu(false)
                  }}
                  disabled={busy}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {onDividerToggle && (
        <button
          type="button"
          className={[
            styles.sectionToolbarBtn,
            showDivider ? styles.sectionToolbarBtnActive : '',
          ].filter(Boolean).join(' ')}
          onClick={onDividerToggle}
          disabled={busy}
          title={showDivider ? 'Hide divider' : 'Show divider'}
          aria-label={showDivider ? 'Hide section divider' : 'Show section divider'}
          aria-pressed={showDivider}
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
            <path d="M1 6h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
      )}

      <span className={styles.sectionToolbarSep} aria-hidden />

      <button
        type="button"
        className={[styles.sectionToolbarBtn, styles.sectionToolbarBtnDanger].join(' ')}
        onClick={onDelete}
        disabled={busy}
        title="Delete section"
        aria-label="Delete section"
      >
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
          <path d="M2 3h8M4.5 3V2a.5.5 0 01.5-.5h2a.5.5 0 01.5.5v1M5 5.5v3M7 5.5v3M3 3l.5 7a1 1 0 001 1h3a1 1 0 001-1L9 3" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
    </div>
  )
}

export function AddSectionButton({
  onClick,
  busy,
}: {
  onClick: () => void
  busy: boolean
}) {
  return (
    <button
      type="button"
      className={styles.addSectionBtn}
      onClick={onClick}
      disabled={busy}
    >
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
        <path d="M7 2v10M2 7h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
      Add Section
    </button>
  )
}
