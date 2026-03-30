'use client'

import { useInlineEdit } from './useInlineEdit'
import styles from './inline-edit.module.scss'

export default function InlineEditBar() {
  const ctx = useInlineEdit()

  if (!ctx?.isAdmin || !ctx.isDirty()) return null

  const count = ctx.dirtyFields.size
  const hasError = !!ctx.saveError

  return (
    <div
      className={[styles.editBar, hasError ? styles.editBarErrorState : ''].filter(Boolean).join(' ')}
    >
      <div className={styles.editBarInner}>
        {hasError ? (
          <span className={styles.editBarMessage}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden className={styles.editBarIcon}>
              <path d="M8 1.5a6.5 6.5 0 100 13 6.5 6.5 0 000-13zM7.25 5a.75.75 0 011.5 0v3a.75.75 0 01-1.5 0V5zM8 11.5A.75.75 0 118 10a.75.75 0 010 1.5z" fill="currentColor" />
            </svg>
            {ctx.saveError}
          </span>
        ) : (
          <span className={styles.editBarCount}>
            {count} unsaved {count === 1 ? 'change' : 'changes'}
            <span className={styles.editBarHint}> · ⌘S to save</span>
          </span>
        )}
        <div className={styles.editBarActions}>
          <button
            type="button"
            onClick={ctx.discard}
            className={styles.editBarDiscard}
            disabled={ctx.isSaving}
          >
            Discard
          </button>
          <button
            type="button"
            onClick={() => ctx.save().catch(() => {})}
            className={hasError ? styles.editBarRetry : styles.editBarSave}
            disabled={ctx.isSaving}
          >
            {ctx.isSaving ? 'Saving…' : hasError ? 'Retry' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  )
}
