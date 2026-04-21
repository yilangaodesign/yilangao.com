'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { updateCollectionField } from './api'
import { parseVideoEmbedUrl } from '@/lib/parse-video-embed'
import styles from './inline-edit.module.scss'

interface VideoEmbedInputProps {
  projectId: string | number
  blockIndex: number
  currentUrl?: string
  className?: string
}

export default function VideoEmbedInput({
  projectId,
  blockIndex,
  currentUrl = '',
  className,
}: VideoEmbedInputProps) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [value, setValue] = useState(currentUrl)
  const [error, setError] = useState<string | null>(null)

  const trimmed = value.trim()
  const parsed = trimmed ? parseVideoEmbedUrl(trimmed) : null
  const isEmpty = !trimmed
  const isValid = !!parsed
  const feedback = isEmpty
    ? null
    : isValid
      ? `Detected ${parsed.provider} (${parsed.id})`
      : 'Unsupported provider. Use YouTube, Vimeo, or Loom.'

  const save = () => {
    if (pending) return
    if (trimmed === currentUrl) return
    if (trimmed && !isValid) {
      setError('Unsupported provider. Use YouTube, Vimeo, or Loom.')
      return
    }
    setError(null)
    startTransition(async () => {
      try {
        const res = await fetch(`/api/projects/${projectId}`, { credentials: 'include' })
        if (!res.ok) throw new Error('Failed to fetch project')
        const json = await res.json()
        const blocks = [...((json.content ?? []) as Record<string, unknown>[])]
        if (!blocks[blockIndex]) return
        const next = { ...blocks[blockIndex], url: trimmed }
        blocks[blockIndex] = next
        await updateCollectionField('projects', projectId, 'content', blocks)
        router.refresh()
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Save failed')
      }
    })
  }

  return (
    <div
      className={[styles.videoEmbedInput, className].filter(Boolean).join(' ')}
      onClick={(e) => e.stopPropagation()}
    >
      <input
        type="url"
        className={styles.videoEmbedInputField}
        placeholder="Paste YouTube, Vimeo, or Loom URL…"
        value={value}
        onChange={(e) => {
          setValue(e.target.value)
          if (error) setError(null)
        }}
        onBlur={save}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault()
            ;(e.target as HTMLInputElement).blur()
          }
        }}
        disabled={pending}
        aria-label="Video embed URL"
      />
      {feedback ? (
        <span
          className={styles.videoEmbedInputFeedback}
          data-valid={isValid}
          role={isValid ? undefined : 'alert'}
        >
          {feedback}
        </span>
      ) : null}
      {error ? (
        <span className={styles.videoEmbedInputFeedback} data-valid={false} role="alert">
          {error}
        </span>
      ) : null}
    </div>
  )
}
