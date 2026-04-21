'use client'

import {
  useCallback,
  useState,
  type MouseEvent,
  type ReactNode,
} from 'react'
import { useRouter } from 'next/navigation.js'
import { createCollectionItem, deleteCollectionItem } from './api'
import { ConfirmDelete } from './ConfirmDelete'
import { useToast } from './ToastSurface'
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
  const toast = useToast()

  const noun = itemLabel ? `"${itemLabel}"` : `this ${collection.replace(/s$/, '')}`

  const handleConfirm = useCallback(async () => {
    try {
      await deleteCollectionItem(collection, id)
      toast.success(`Deleted ${itemLabel || collection.replace(/s$/, '')}`)
      router.refresh()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Delete failed')
      throw err
    }
  }, [collection, id, itemLabel, router, toast])

  return (
    <ConfirmDelete
      title={`Delete ${noun}?`}
      description="This cannot be undone."
      onConfirm={handleConfirm}
      trigger={
        <button
          type="button"
          className={[styles.collectionDeleteBtn, className].filter(Boolean).join(' ')}
          title={`Delete ${itemLabel || collection}`}
          aria-label={`Delete ${itemLabel || collection}`}
        >
          <svg width="12" height="12" viewBox="0 0 14 14" fill="none" aria-hidden>
            <path
              d="M2 4h10M5 4V2.5h4V4m-5.5 0l.5 8h6l.5-8"
              stroke="currentColor"
              strokeWidth="1.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      }
    />
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
  const toast = useToast()
  const [creating, setCreating] = useState(false)

  const handleClick = useCallback(async (e: MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setCreating(true)
    try {
      const result = await createCollectionItem(collection, defaults)
      if (openAfterCreate && result.id) {
        window.open(`/admin/collections/${collection}/${result.id}`, '_blank')
      }
      router.refresh()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Create failed')
    } finally {
      setCreating(false)
    }
  }, [collection, defaults, openAfterCreate, router, toast])

  return (
    <button
      type="button"
      onClick={handleClick}
      className={[styles.addItemCard, className].filter(Boolean).join(' ')}
      disabled={creating}
    >
      {children || (
        <>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden className={styles.addItemIcon}>
            <path d="M10 4v12M4 10h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <span className={styles.addItemLabel}>
            {creating ? 'Creating…' : label || `Add ${collection.replace(/s$/, '')}`}
          </span>
        </>
      )}
    </button>
  )
}
