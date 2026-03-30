'use client'

import {
  useCallback,
  useState,
  type MouseEvent,
  type ReactNode,
} from 'react'
import { createPortal } from 'react-dom'
import { useRouter } from 'next/navigation.js'
import { createCollectionItem, deleteCollectionItem } from './api'
import styles from './inline-edit.module.scss'

/* ── Delete Button ── */

interface DeleteItemButtonProps {
  collection: string
  id: number | string
  itemLabel?: string
  className?: string
}

export function DeleteItemButton({
  collection,
  id,
  itemLabel,
  className,
}: DeleteItemButtonProps) {
  const router = useRouter()
  const [confirming, setConfirming] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleClick = useCallback((e: MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setConfirming(true)
  }, [])

  const handleCancel = useCallback((e: MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setConfirming(false)
    setError(null)
  }, [])

  const handleConfirm = useCallback(async (e: MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDeleting(true)
    setError(null)
    try {
      await deleteCollectionItem(collection, id)
      setConfirming(false)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Delete failed')
    } finally {
      setDeleting(false)
    }
  }, [collection, id, router])

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        className={[styles.collectionDeleteBtn, className].filter(Boolean).join(' ')}
        title={`Delete ${itemLabel || collection}`}
        aria-label={`Delete ${itemLabel || collection}`}
      >
        <svg width="12" height="12" viewBox="0 0 14 14" fill="none" aria-hidden>
          <path d="M2 4h10M5 4V2.5h4V4m-5.5 0l.5 8h6l.5-8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {confirming && createPortal(
        <>
          <div className={styles.confirmBackdrop} onClick={handleCancel} />
          <div className={styles.confirmDialog} role="alertdialog" aria-label="Confirm delete">
            <p className={styles.confirmMessage}>
              Delete {itemLabel ? `"${itemLabel}"` : `this ${collection.replace(/s$/, '')}`}?
              <span className={styles.confirmHint}>This cannot be undone.</span>
            </p>
            {error && <p className={styles.confirmError}>{error}</p>}
            <div className={styles.confirmActions}>
              <button
                type="button"
                className={styles.confirmCancel}
                onClick={handleCancel}
                disabled={deleting}
              >
                Cancel
              </button>
              <button
                type="button"
                className={styles.confirmDelete}
                onClick={handleConfirm}
                disabled={deleting}
              >
                {deleting ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          </div>
        </>,
        document.body,
      )}
    </>
  )
}

/* ── Add Item Card ── */

interface AddItemCardProps {
  collection: string
  defaults: Record<string, unknown>
  label?: string
  className?: string
  children?: ReactNode
  openAfterCreate?: boolean
}

export function AddItemCard({
  collection,
  defaults,
  label,
  className,
  children,
  openAfterCreate = false,
}: AddItemCardProps) {
  const router = useRouter()
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleClick = useCallback(async (e: MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setCreating(true)
    setError(null)
    try {
      const result = await createCollectionItem(collection, defaults)
      if (openAfterCreate && result.id) {
        window.open(`/admin/collections/${collection}/${result.id}`, '_blank')
      }
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Create failed')
    } finally {
      setCreating(false)
    }
  }, [collection, defaults, openAfterCreate, router])

  return (
    <button
      type="button"
      onClick={handleClick}
      className={[styles.addItemCard, className].filter(Boolean).join(' ')}
      disabled={creating}
      title={error || undefined}
    >
      {children || (
        <>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden className={styles.addItemIcon}>
            <path d="M10 4v12M4 10h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <span className={styles.addItemLabel}>
            {creating ? 'Creating…' : label || `Add ${collection.replace(/s$/, '')}`}
          </span>
          {error && <span className={styles.addItemError}>{error}</span>}
        </>
      )}
    </button>
  )
}
