import React from 'react'
import styles from './ViewSiteLink.module.scss'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:4000'

export default function ViewSiteLink() {
  return (
    <a
      href={SITE_URL}
      target="_blank"
      rel="noopener noreferrer"
      className={styles.link}
    >
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
        <path
          d="M5 2H3a1 1 0 00-1 1v8a1 1 0 001 1h8a1 1 0 001-1V9M8 2h4m0 0v4m0-4L6 8"
          stroke="currentColor"
          strokeWidth="1.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      Open Live Site
    </a>
  )
}
