'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { uploadMedia } from '@/components/inline-edit/api'
import styles from './ProjectEditModal.module.scss'

interface MediaDoc {
  id: number | string
  url: string
  filename: string
  mimeType?: string
  sizes?: Record<string, { url?: string }>
}

export interface ProjectForEdit {
  id: string | number
  title: string
  category: string
  coverImage?: string | null
  heroImageId?: string | number | null
}

interface ProjectEditModalProps {
  project: ProjectForEdit
  onClose: () => void
  onSaved: () => void
}

export default function ProjectEditModal({ project, onClose, onSaved }: ProjectEditModalProps) {
  const [title, setTitle] = useState(project.title)
  const [category, setCategory] = useState(project.category)
  const [coverUrl, setCoverUrl] = useState(project.coverImage ?? null)
  const [heroImageId, setHeroImageId] = useState<number | string | null>(project.heroImageId ?? null)

  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)

  const [browseOpen, setBrowseOpen] = useState(false)
  const [mediaItems, setMediaItems] = useState<MediaDoc[]>([])
  const [mediaLoading, setMediaLoading] = useState(false)
  const [mediaLoaded, setMediaLoaded] = useState(false)

  const fileRef = useRef<HTMLInputElement>(null)

  const fetchMedia = useCallback(async () => {
    if (mediaLoaded) return
    setMediaLoading(true)
    try {
      const res = await fetch('/api/media?limit=30&sort=-createdAt&where[mimeType][like]=image', {
        credentials: 'include',
      })
      if (res.ok) {
        const json = await res.json()
        setMediaItems(json.docs ?? [])
      }
    } catch {
      // media fetch failed silently
    } finally {
      setMediaLoading(false)
      setMediaLoaded(true)
    }
  }, [mediaLoaded])

  const toggleBrowse = useCallback(() => {
    setBrowseOpen((prev) => {
      if (!prev) fetchMedia()
      return !prev
    })
  }, [fetchMedia])

  const handleFileUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    setError(null)
    try {
      const media = await uploadMedia(file, file.name.replace(/\.[^.]+$/, ''))
      setCoverUrl(media.url)
      setHeroImageId(media.id)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }, [])

  const selectMedia = useCallback((doc: MediaDoc) => {
    const thumbUrl = doc.sizes?.thumbnail?.url ?? doc.url
    setCoverUrl(thumbUrl !== doc.url ? doc.url : doc.url)
    setHeroImageId(doc.id)
    setBrowseOpen(false)
  }, [])

  const handleSave = useCallback(async () => {
    setSaving(true)
    setError(null)
    try {
      const body: Record<string, unknown> = {}
      if (title !== project.title) body.title = title
      if (category !== project.category) body.category = category
      if (heroImageId !== project.heroImageId) body.heroImage = heroImageId

      if (Object.keys(body).length === 0) {
        onClose()
        return
      }

      const res = await fetch(`/api/projects/${project.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(body),
      })

      if (!res.ok) {
        const text = await res.text().catch(() => '')
        throw new Error(text || `Save failed (${res.status})`)
      }

      onSaved()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed')
    } finally {
      setSaving(false)
    }
  }, [title, category, heroImageId, project, onClose, onSaved])

  const openDashboard = useCallback(() => {
    window.open(`/admin/collections/projects/${project.id}`, '_blank')
  }, [project.id])

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleEsc)
    return () => document.removeEventListener('keydown', handleEsc)
  }, [onClose])

  const modal = (
    <>
      {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */}
      <div className={styles.backdrop} onClick={onClose} />
      <div className={styles.modal} role="dialog" aria-label={`Edit ${project.title}`}>
        <div className={styles.header}>
          <span className={styles.headerTitle}>Edit Project</span>
          <button
            type="button"
            className={styles.closeBtn}
            onClick={onClose}
            aria-label="Close"
          >
            <svg width="12" height="12" viewBox="0 0 14 14" fill="none" aria-hidden>
              <path d="M3.5 3.5l7 7m0-7l-7 7" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <div className={styles.body}>
          {/* Cover image section */}
          <div className={styles.section}>
            <label className={styles.fieldLabel}>Cover Image</label>
            <div className={styles.coverPreview}>
              {coverUrl ? (
                <img src={coverUrl} alt="Cover preview" className={styles.coverImg} />
              ) : (
                <div className={styles.coverPlaceholder}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
                    <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.5" />
                    <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor" />
                    <path d="M3 16l5-5 4 4 3-3 6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span>No cover image</span>
                </div>
              )}
            </div>
            <div className={styles.coverActions}>
              <button
                type="button"
                className={styles.actionBtn}
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
              >
                {uploading ? (
                  <span className={styles.spinner} />
                ) : (
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden>
                    <path d="M8 2v8M5 5l3-3 3 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M2 10v3a1 1 0 001 1h10a1 1 0 001-1v-3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
                Upload new
              </button>
              <button
                type="button"
                className={[styles.actionBtn, browseOpen ? styles.actionBtnActive : ''].filter(Boolean).join(' ')}
                onClick={toggleBrowse}
              >
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden>
                  <rect x="1" y="1" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.2" />
                  <rect x="9" y="1" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.2" />
                  <rect x="1" y="9" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.2" />
                  <rect x="9" y="9" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.2" />
                </svg>
                Browse media
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className={styles.hiddenInput}
                tabIndex={-1}
              />
            </div>

            {browseOpen && (
              <div className={styles.mediaBrowser}>
                {mediaLoading ? (
                  <div className={styles.mediaLoading}>
                    <span className={styles.spinner} />
                    Loading media...
                  </div>
                ) : mediaItems.length === 0 ? (
                  <div className={styles.mediaEmpty}>No images uploaded yet</div>
                ) : (
                  <div className={styles.mediaGrid}>
                    {mediaItems.map((doc) => (
                      <button
                        key={doc.id}
                        type="button"
                        className={[
                          styles.mediaThumbnail,
                          heroImageId === doc.id ? styles.mediaThumbnailSelected : '',
                        ].filter(Boolean).join(' ')}
                        onClick={() => selectMedia(doc)}
                        title={doc.filename}
                      >
                        <img
                          src={doc.sizes?.thumbnail?.url ?? doc.url}
                          alt={doc.filename}
                          className={styles.mediaThumbnailImg}
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Text fields */}
          <div className={styles.section}>
            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel} htmlFor="project-title">Title</label>
              <input
                id="project-title"
                type="text"
                className={styles.fieldInput}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Project title"
              />
            </div>
            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel} htmlFor="project-category">Category</label>
              <input
                id="project-category"
                type="text"
                className={styles.fieldInput}
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="e.g. Enterprise SaaS"
              />
            </div>
          </div>
        </div>

        <div className={styles.footer}>
          {error && <span className={styles.errorText}>{error}</span>}
          <button type="button" className={styles.dashboardBtn} onClick={openDashboard}>
            <svg width="12" height="12" viewBox="0 0 14 14" fill="none" aria-hidden>
              <path d="M11 7.5V11a1 1 0 01-1 1H3a1 1 0 01-1-1V4a1 1 0 011-1h3.5M8 2h4v4M6.5 7.5L12 2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Open in Dashboard
          </button>
          <button
            type="button"
            className={styles.saveBtn}
            onClick={handleSave}
            disabled={saving || uploading}
          >
            {saving ? 'Saving...' : 'Save & Close'}
          </button>
        </div>
      </div>
    </>
  )

  return createPortal(modal, document.body)
}
