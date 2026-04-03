'use client'

import React from 'react'
import styles from './DashboardPages.module.scss'

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:4000'

type PageEntry = {
  label: string
  description: string
  liveUrl: string | null
  adminUrl: string
}

const PAGES: PageEntry[] = [
  {
    label: 'Home',
    description: 'Sidebar identity, bio, experience, links',
    liveUrl: `${SITE_URL}/`,
    adminUrl: '/admin/globals/site-config',
  },
  {
    label: 'Work',
    description: 'Case studies and project cards',
    liveUrl: `${SITE_URL}/`,
    adminUrl: '/admin/collections/projects',
  },
  {
    label: 'About',
    description: 'Work history, education, extended bio',
    liveUrl: `${SITE_URL}/about`,
    adminUrl: '/admin/globals/site-config',
  },
  {
    label: 'Reading',
    description: 'Book list',
    liveUrl: `${SITE_URL}/reading`,
    adminUrl: '/admin/collections/books',
  },
  {
    label: 'Experiments',
    description: 'Creative coding experiments',
    liveUrl: `${SITE_URL}/experiments`,
    adminUrl: '/admin/collections/experiments',
  },
  {
    label: 'Contact',
    description: 'Testimonials and client list',
    liveUrl: `${SITE_URL}/contact`,
    adminUrl: '/admin/collections/testimonials',
  },
  {
    label: 'Company Access',
    description: 'Manage password-gated company logins',
    liveUrl: null,
    adminUrl: '/admin/companies-dashboard',
  },
]

export default function DashboardPages() {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>Pages</h2>
        <p className={styles.subtitle}>
          Click a page to edit it visually on the live site. Use the pencil icon to edit fields in the admin.
        </p>
      </div>
      <div className={styles.grid}>
        {PAGES.map((page) => (
          <div
            key={page.label}
            className={styles.card}
            role="button"
            tabIndex={0}
            onClick={() => {
              if (page.liveUrl) {
                window.open(page.liveUrl, '_blank', 'noopener')
              } else {
                window.location.href = page.adminUrl
              }
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                if (page.liveUrl) {
                  window.open(page.liveUrl, '_blank', 'noopener')
                } else {
                  window.location.href = page.adminUrl
                }
              }
            }}
          >
            <div className={styles.cardPreview}>
              <span className={styles.cardLabel}>{page.label}</span>
            </div>
            <div className={styles.cardFooter}>
              <div className={styles.cardMeta}>
                <span className={styles.cardName}>{page.label}</span>
                <span className={styles.cardDesc}>{page.description}</span>
              </div>
              <a
                href={page.adminUrl}
                className={styles.cardAdmin}
                title={`Edit ${page.label} fields in admin`}
                onClick={(e) => e.stopPropagation()}
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
                  <path
                    d="M10.08 1.92a1.5 1.5 0 0 1 2.12 0l.38.38a1.5 1.5 0 0 1 0 2.12L5.5 11.5 2 12.5l1-3.5 7.08-7.08Z"
                    stroke="currentColor"
                    strokeWidth="1.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
