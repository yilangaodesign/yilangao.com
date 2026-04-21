'use client'

import { useCallback, useRef, useState, type DragEvent } from 'react'
import { useRouter } from 'next/navigation'
import { uploadMedia, updateCollectionField } from './api'
import { useToast } from './ToastSurface'
import styles from './inline-edit.module.scss'

interface ImageUploadZoneProps {
  collection: string
  docId: string | number
  fieldPath: string
  label?: string
  className?: string
  children?: React.ReactNode
}

const LARGE_UPLOAD_BYTES = 50 * 1024 * 1024 // 50 MB

export default function ImageUploadZone({
  collection,
  docId,
  fieldPath,
  label = 'Drop image or click to upload',
  className,
  children,
}: ImageUploadZoneProps) {
  const router = useRouter()
  const toast = useToast()
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)

  const handleUpload = useCallback(
    async (file: File) => {
      if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
        toast.error('Only image and video files are supported')
        return
      }
      if (file.size > LARGE_UPLOAD_BYTES) {
        const mb = Math.round(file.size / (1024 * 1024))
        toast.info(
          `Large upload (${mb} MB)`,
          { description: 'For videos, consider compressing to MP4/WebM first — aim for <20 MB.' },
        )
      }
      setUploading(true)
      try {
        const { id } = await uploadMedia(file, file.name.replace(/\.[^.]+$/, ''))
        await updateCollectionField(collection, docId, fieldPath, id)
        router.refresh()
      } catch (e) {
        toast.error(e instanceof Error ? e.message : 'Upload failed')
      } finally {
        setUploading(false)
      }
    },
    [collection, docId, fieldPath, router, toast],
  )

  const handleDrop = useCallback(
    (e: DragEvent) => {
      e.preventDefault()
      setDragOver(false)
      const file = e.dataTransfer.files[0]
      if (file) handleUpload(file)
    },
    [handleUpload],
  )

  const handleDragOver = useCallback((e: DragEvent) => {
    e.preventDefault()
    setDragOver(true)
  }, [])

  const handleDragLeave = useCallback(() => {
    setDragOver(false)
  }, [])

  const handleClick = useCallback(() => {
    inputRef.current?.click()
  }, [])

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file) handleUpload(file)
      if (inputRef.current) inputRef.current.value = ''
    },
    [handleUpload],
  )

  const cls = [
    styles.uploadZone,
    dragOver ? styles.uploadZoneDragOver : '',
    uploading ? styles.uploadZoneUploading : '',
    className,
  ].filter(Boolean).join(' ')

  return (
    <div
      className={cls}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleClick() }}
      aria-label={label}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*,video/*"
        className={styles.uploadInput}
        onChange={handleFileChange}
        tabIndex={-1}
      />
      {children || (
        <div className={styles.uploadContent}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden className={styles.uploadIcon}>
            <path d="M12 16V4M12 4L8 8M12 4L16 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M20 16v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className={styles.uploadLabel}>
            {uploading ? 'Uploading…' : label}
          </span>
        </div>
      )}
    </div>
  )
}

export function SectionImageUpload({
  collection,
  docId,
  sectionIndex,
  imageIndex,
  label,
  className,
}: {
  collection: string
  docId: string | number
  sectionIndex: number
  imageIndex?: number
  label?: string
  className?: string
}) {
  const router = useRouter()
  const toast = useToast()
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)

  const handleUpload = useCallback(
    async (file: File) => {
      if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) return
      setUploading(true)
      try {
        const { id: mediaId } = await uploadMedia(file, file.name.replace(/\.[^.]+$/, ''))

        const res = await fetch(`/api/${collection}/${docId}`, { credentials: 'include' })
        if (!res.ok) throw new Error('Failed to fetch project')
        const json = await res.json()
        const sections = [...(json.sections ?? [])]
        const section = { ...sections[sectionIndex] }
        const images = [...(section.images ?? [])]

        if (imageIndex !== undefined && imageIndex < images.length) {
          images[imageIndex] = { ...images[imageIndex], image: mediaId }
        } else {
          images.push({ image: mediaId })
        }

        section.images = images
        sections[sectionIndex] = section
        await updateCollectionField(collection, docId, 'sections', sections)
        router.refresh()
      } catch (e) {
        toast.error(e instanceof Error ? e.message : 'Upload failed')
      } finally {
        setUploading(false)
      }
    },
    [collection, docId, sectionIndex, imageIndex, router, toast],
  )

  return (
    <div
      className={[styles.uploadZone, uploading ? styles.uploadZoneUploading : '', className].filter(Boolean).join(' ')}
      onClick={() => inputRef.current?.click()}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') inputRef.current?.click() }}
      onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleUpload(f) }}
      onDragOver={(e) => e.preventDefault()}
      aria-label={label || 'Upload section image'}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*,video/*"
        className={styles.uploadInput}
        onChange={(e) => { const f = e.target.files?.[0]; if (f) handleUpload(f); if (inputRef.current) inputRef.current.value = '' }}
        tabIndex={-1}
      />
      <div className={styles.uploadContent}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden className={styles.uploadIcon}>
          <path d="M12 16V4M12 4L8 8M12 4L16 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M20 16v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span className={styles.uploadLabel}>{uploading ? 'Uploading…' : (label || 'Upload image')}</span>
      </div>
    </div>
  )
}
