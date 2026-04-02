'use client'

import Link from 'next/link'
import { useState } from 'react'
import TextFormatBar from './inline-edit/TextFormatBar'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import btnStyles from '@/components/ui/Button/Button.module.scss'
import styles from './AdminBar.module.scss'

interface AdminBarProps {
  editUrl: string
  editLabel?: string
}

const editPencilIcon = (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
    <path
      d="M10.08 1.92a1.5 1.5 0 0 1 2.12 0l.38.38a1.5 1.5 0 0 1 0 2.12L5.5 11.5 2 12.5l1-3.5 7.08-7.08Z"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

const closeIcon = (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
    <path d="M3.5 3.5l7 7m0-7l-7 7" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
  </svg>
)

export default function AdminBar({ editUrl, editLabel = 'Edit this page' }: AdminBarProps) {
  const [dismissed, setDismissed] = useState(false)

  const editLinkClass = [
    btnStyles.button,
    btnStyles.highlight,
    btnStyles.bold,
    btnStyles.sm,
    styles.anchorAsButton,
  ].join(' ')

  const dashLinkClass = [
    btnStyles.button,
    btnStyles.alwaysLight,
    btnStyles.subtle,
    btnStyles.sm,
    styles.anchorAsButton,
  ].join(' ')

  return (
    <aside className={styles.bar} aria-label="Admin editing toolbar">
      {!dismissed && (
        <div className={styles.barRow}>
          <div className={styles.inner}>
            <div className={styles.left}>
              <Badge
                appearance="neutral"
                emphasis="regular"
                size="sm"
                shape="squared"
                className={styles.adminContextBadge}
              >
                Admin
              </Badge>
              <span className={styles.hint}>You&apos;re viewing the live site with editing enabled</span>
            </div>
            <div className={styles.actions}>
              <Link href={editUrl} className={editLinkClass}>
                <span className={btnStyles.iconWrap} aria-hidden>
                  {editPencilIcon}
                </span>
                <span className={btnStyles.label}>{editLabel}</span>
              </Link>
              <Link href="/admin" className={dashLinkClass}>
                <span className={btnStyles.label}>Dashboard</span>
              </Link>
              <Button
                type="button"
                appearance="always-light"
                emphasis="minimal"
                size="xs"
                iconOnly
                aria-label="Dismiss admin bar"
                onClick={() => setDismissed(true)}
                leadingIcon={closeIcon}
              />
            </div>
          </div>
        </div>
      )}
      <TextFormatBar />
    </aside>
  )
}
