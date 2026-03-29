'use client'

import { useCallback, type MouseEvent } from 'react'
import styles from './EditButton.module.scss'

interface EditButtonProps {
  collection: string
  id: number | string
  label?: string
}

export default function EditButton({ collection, id, label }: EditButtonProps) {
  const href = `/admin/collections/${collection}/${id}`

  const handleClick = useCallback((e: MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    window.open(href, '_blank')
  }, [href])

  return (
    <button
      type="button"
      onClick={handleClick}
      className={styles.btn}
      title={label || `Edit ${collection}`}
      aria-label={label || `Edit this ${collection}`}
    >
      <svg width="12" height="12" viewBox="0 0 14 14" fill="none" aria-hidden>
        <path d="M10.08 1.92a1.5 1.5 0 0 1 2.12 0l.38.38a1.5 1.5 0 0 1 0 2.12L5.5 11.5 2 12.5l1-3.5 7.08-7.08Z" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  )
}

interface EditGlobalButtonProps {
  global: string
  label?: string
}

export function EditGlobalButton({ global, label }: EditGlobalButtonProps) {
  const href = `/admin/globals/${global}`

  const handleClick = useCallback((e: MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    window.open(href, '_blank')
  }, [href])

  return (
    <button
      type="button"
      onClick={handleClick}
      className={styles.btn}
      title={label || `Edit ${global}`}
      aria-label={label || `Edit ${global}`}
    >
      <svg width="12" height="12" viewBox="0 0 14 14" fill="none" aria-hidden>
        <path d="M10.08 1.92a1.5 1.5 0 0 1 2.12 0l.38.38a1.5 1.5 0 0 1 0 2.12L5.5 11.5 2 12.5l1-3.5 7.08-7.08Z" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  )
}
