import React from 'react'
import styles from './NavPages.module.scss'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:4000'

const PAGES = [
  {
    label: 'Home',
    adminUrl: '/admin/globals/site-config',
    liveUrl: `${SITE_URL}/`,
    hint: 'Identity, bio, links, experience',
  },
  {
    label: 'Work',
    adminUrl: '/admin/collections/projects',
    liveUrl: `${SITE_URL}/`,
    hint: 'Case studies',
  },
  {
    label: 'About',
    adminUrl: '/admin/globals/site-config',
    liveUrl: `${SITE_URL}/about`,
    hint: 'Work history, education',
  },
  {
    label: 'Reading',
    adminUrl: '/admin/collections/books',
    liveUrl: `${SITE_URL}/reading`,
    hint: 'Book list',
  },
  {
    label: 'Experiments',
    adminUrl: '/admin/collections/experiments',
    liveUrl: `${SITE_URL}/experiments`,
    hint: 'Experiments list',
  },
  {
    label: 'Contact',
    adminUrl: '/admin/collections/testimonials',
    liveUrl: `${SITE_URL}/contact`,
    hint: 'Testimonials, clients',
  },
]

export default function NavPages() {
  return (
    <div className={styles.container}>
      <p className={styles.heading}>Pages</p>
      <ul className={styles.list}>
        {PAGES.map((page) => (
          <li key={page.label} className={styles.item}>
            <a
              href={page.adminUrl}
              className={styles.pageLink}
              title={`Edit ${page.label} page content`}
            >
              <span className={styles.pageName}>{page.label}</span>
              <span className={styles.pageHint}>{page.hint}</span>
            </a>
            <a
              href={page.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.openLink}
              title={`Open ${page.label} in new tab (inline editing)`}
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
                <path
                  d="M4.5 2H3a1 1 0 00-1 1v6a1 1 0 001 1h6a1 1 0 001-1V8.5M7 2h3m0 0v3m0-3L5.5 6.5"
                  stroke="currentColor"
                  strokeWidth="1.1"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </a>
          </li>
        ))}
      </ul>
    </div>
  )
}
