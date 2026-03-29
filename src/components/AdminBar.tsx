'use client'

import { useState } from 'react'
import styles from './AdminBar.module.scss'

interface AdminBarProps {
  editUrl: string
  editLabel?: string
}

export default function AdminBar({ editUrl, editLabel = 'Edit this page' }: AdminBarProps) {
  const [dismissed, setDismissed] = useState(false)

  if (dismissed) return null

  return (
    <div className={styles.bar}>
      <div className={styles.inner}>
        <div className={styles.left}>
          <span className={styles.badge}>Admin</span>
          <span className={styles.hint}>You&apos;re viewing the live site with editing enabled</span>
        </div>
        <div className={styles.actions}>
          <a href={editUrl} className={styles.editBtn}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
              <path d="M10.08 1.92a1.5 1.5 0 0 1 2.12 0l.38.38a1.5 1.5 0 0 1 0 2.12L5.5 11.5 2 12.5l1-3.5 7.08-7.08Z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {editLabel}
          </a>
          <a href="/admin" className={styles.dashBtn}>Dashboard</a>
          <button onClick={() => setDismissed(true)} className={styles.closeBtn} aria-label="Dismiss admin bar">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
              <path d="M3.5 3.5l7 7m0-7l-7 7" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}
