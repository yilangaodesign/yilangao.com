'use client'

import { useCallback, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { uploadMedia, updateCollectionField } from './api'
import { useConfirm } from './ConfirmDelete'
import { useToast } from './ToastSurface'
import styles from './inline-edit.module.scss'

type SectionImage = {
  url: string
  caption?: string
}

interface ImageManagerProps {
  collection: string
  docId: string | number
  sectionIndex: number
  images: SectionImage[]
  busy: boolean
}

export default function ImageManager({
  collection,
  docId,
  sectionIndex,
  images,
  busy,
}: ImageManagerProps) {
  const router = useRouter()
  const { confirm } = useConfirm()
  const toast = useToast()
  const [working, setWorking] = useState(false)
  const addInputRef = useRef<HTMLInputElement>(null)
  const replaceInputRefs = useRef<Map<number, HTMLInputElement>>(new Map())

  const patchImages = useCallback(
    async (transform: (imgs: unknown[]) => unknown[]) => {
      if (working || busy) return
      setWorking(true)
      try {
        const res = await fetch(`/api/${collection}/${docId}`, { credentials: 'include' })
        if (!res.ok) throw new Error('Failed to fetch project')
        const json = await res.json()
        const sections = [...(json.sections ?? [])]
        const section = { ...sections[sectionIndex] }
        section.images = transform([...(section.images ?? [])])
        sections[sectionIndex] = section
        await updateCollectionField(collection, docId, 'sections', sections)
        router.refresh()
      } catch (e) {
        toast.error(e instanceof Error ? e.message : 'Image update failed')
      } finally {
        setWorking(false)
      }
    },
    [collection, docId, sectionIndex, working, busy, router, toast],
  )

  const deleteImage = useCallback(
    async (idx: number) => {
      const ok = await confirm({
        title: `Delete image ${idx + 1}?`,
        description: 'This cannot be undone. The image will be removed from this section.',
      })
      if (!ok) return
      patchImages((imgs) => imgs.filter((_, i) => i !== idx))
    },
    [confirm, patchImages],
  )

  const moveImage = useCallback(
    (idx: number, direction: -1 | 1) => {
      patchImages((imgs) => {
        const next = [...imgs]
        const target = idx + direction
        if (target < 0 || target >= next.length) return next
        ;[next[idx], next[target]] = [next[target], next[idx]]
        return next
      })
    },
    [patchImages],
  )

  const replaceImage = useCallback(
    async (idx: number, file: File) => {
      if (!file.type.startsWith('image/')) return
      setWorking(true)
      try {
        const { id: mediaId } = await uploadMedia(file, file.name.replace(/\.[^.]+$/, ''))
        const res = await fetch(`/api/${collection}/${docId}`, { credentials: 'include' })
        if (!res.ok) throw new Error('Failed to fetch project')
        const json = await res.json()
        const sections = [...(json.sections ?? [])]
        const section = { ...sections[sectionIndex] }
        const imgs = [...(section.images ?? [])]
        if (idx < imgs.length) {
          imgs[idx] = { ...imgs[idx], image: mediaId }
        }
        section.images = imgs
        sections[sectionIndex] = section
        await updateCollectionField(collection, docId, 'sections', sections)
        router.refresh()
      } catch (e) {
        toast.error(e instanceof Error ? e.message : 'Replace failed')
      } finally {
        setWorking(false)
      }
    },
    [collection, docId, sectionIndex, router, toast],
  )

  const addImage = useCallback(
    async (file: File) => {
      if (!file.type.startsWith('image/')) return
      setWorking(true)
      try {
        const { id: mediaId } = await uploadMedia(file, file.name.replace(/\.[^.]+$/, ''))
        patchImages((imgs) => [...imgs, { image: mediaId }])
      } catch (e) {
        toast.error(e instanceof Error ? e.message : 'Upload failed')
      } finally {
        setWorking(false)
      }
    },
    [patchImages, toast],
  )

  const disabled = working || busy

  return (
    <div className={styles.imageManager}>
      {images.map((img, idx) => (
        <div key={idx} className={styles.imageManagerCard}>
          <img src={img.url} alt={`Image ${idx + 1}`} className={styles.imageManagerThumb} />
          <div className={styles.imageManagerOverlay}>
            <button
              type="button"
              className={styles.imageManagerBtn}
              onClick={() => moveImage(idx, -1)}
              disabled={disabled || idx === 0}
              title="Move left"
              aria-label="Move image left"
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
                <path d="M7.5 2.5L3.5 6L7.5 9.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <button
              type="button"
              className={styles.imageManagerBtn}
              onClick={() => moveImage(idx, 1)}
              disabled={disabled || idx === images.length - 1}
              title="Move right"
              aria-label="Move image right"
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
                <path d="M4.5 2.5L8.5 6L4.5 9.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <button
              type="button"
              className={styles.imageManagerBtn}
              onClick={() => replaceInputRefs.current.get(idx)?.click()}
              disabled={disabled}
              title="Replace image"
              aria-label="Replace image"
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
                <path d="M6 10V2M6 2L3 5M6 2L9 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <input
              ref={(el) => { if (el) replaceInputRefs.current.set(idx, el); else replaceInputRefs.current.delete(idx) }}
              type="file"
              accept="image/*"
              className={styles.uploadInput}
              onChange={(e) => {
                const f = e.target.files?.[0]
                if (f) replaceImage(idx, f)
                e.target.value = ''
              }}
              tabIndex={-1}
            />
            <button
              type="button"
              className={[styles.imageManagerBtn, styles.imageManagerBtnDanger].join(' ')}
              onClick={() => deleteImage(idx)}
              disabled={disabled}
              title="Delete image"
              aria-label="Delete image"
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
                <path d="M2 3h8M4.5 3V2a.5.5 0 01.5-.5h2a.5.5 0 01.5.5v1M5 5.5v3M7 5.5v3M3 3l.5 7a1 1 0 001 1h3a1 1 0 001-1L9 3" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </div>
      ))}

      <button
        type="button"
        className={styles.imageManagerAdd}
        onClick={() => addInputRef.current?.click()}
        disabled={disabled}
        title="Add image"
        aria-label="Add image to section"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
          <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </button>
      <input
        ref={addInputRef}
        type="file"
        accept="image/*"
        className={styles.uploadInput}
        onChange={(e) => {
          const f = e.target.files?.[0]
          if (f) addImage(f)
          e.target.value = ''
        }}
        tabIndex={-1}
      />
    </div>
  )
}
