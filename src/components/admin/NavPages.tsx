import React from 'react'
import styles from './NavPages.module.scss'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:4000'

export default function NavPages() {
  return (
    <div className={styles.container}>
      <p className={styles.heading}>Quick Links</p>
      <ul className={styles.list}>
        <li className={styles.item}>
          <a
            href="/admin/companies-dashboard"
            className={styles.pageLink}
            title="Manage password-gated company access"
          >
            <span className={styles.pageName}>Company Access</span>
            <span className={styles.pageHint}>Passwords, themes, analytics</span>
          </a>
        </li>
        <li className={styles.item}>
          <a
            href={SITE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.pageLink}
            title="Open the live site in a new tab"
          >
            <span className={styles.pageName}>
              Open Live Site
              <svg
                width="12"
                height="12"
                viewBox="0 0 12 12"
                fill="none"
                aria-hidden
                className={styles.externalIcon}
              >
                <path
                  d="M4.5 2H3a1 1 0 00-1 1v6a1 1 0 001 1h6a1 1 0 001-1V8.5M7 2h3m0 0v3m0-3L5.5 6.5"
                  stroke="currentColor"
                  strokeWidth="1.1"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
          </a>
        </li>
      </ul>
    </div>
  )
}
