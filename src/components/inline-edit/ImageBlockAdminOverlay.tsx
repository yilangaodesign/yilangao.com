'use client'

/**
 * ImageBlockAdminOverlay — the hover overlay on every image figure inside
 * an `imageGroup` block (and any other inline-edit image surface). Was
 * previously four raw `<button>` glyphs styled with orphaned CSS; now it
 * composes DS `Button` primitives wrapped in DS `Tooltip`, and routes
 * deletion through `useBlockManager.confirmRemoveImage` so every removal
 * honors the §14 CRUD contract (AlertDialog + `toast.undoable`).
 *
 * Props are narrow on purpose — this component knows nothing about the
 * block manager or the backing collection. The page wires its own
 * instance of `useBlockManager` to these callbacks.
 *
 * Zero `border-radius` in the co-located SCSS (branding §1.1).
 */

import { useRef, type ReactNode } from 'react'
import { Button } from '@/components/ui/Button'
import { Tooltip } from '@/components/ui/Tooltip'
import styles from './ImageBlockAdminOverlay.module.scss'

export interface ImageBlockAdminOverlayProps {
  // Move buttons are optional: atomic `image` blocks are reordered via
  // the outer sortable drag handle (and future row-internal DnD), so the
  // arrows become dead UI on that path. The legacy `imageGroup` path
  // still passes them until the group schema is removed (see the
  // `cleanup` task in the atomic-images plan).
  canMoveLeft?: boolean
  canMoveRight?: boolean
  onMoveLeft?: () => void
  onMoveRight?: () => void
  busy?: boolean
  onReplace: (file: File) => void | Promise<void>
  onDelete: () => void | Promise<void>
  className?: string
}

function ChevronLeft() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
      <path
        d="M7.5 2.5L4 6l3.5 3.5"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function ChevronRight() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
      <path
        d="M4.5 2.5L8 6l-3.5 3.5"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function ReplaceIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
      <path
        d="M6 9V3M6 3L3.5 5.5M6 3l2.5 2.5"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M2.5 9.5h7"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  )
}

function TrashIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
      <path
        d="M2.5 3.5h7M4.5 3.5V2.5a1 1 0 011-1h1a1 1 0 011 1v1M3.5 3.5v6a1 1 0 001 1h3a1 1 0 001-1v-6"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function OverlayButton({
  label,
  onClick,
  disabled,
  icon,
  danger,
}: {
  label: string
  onClick: () => void
  disabled?: boolean
  icon: ReactNode
  danger?: boolean
}) {
  return (
    <Tooltip content={label} size="sm">
      <Button
        type="button"
        appearance={danger ? 'negative' : 'neutral'}
        emphasis="bold"
        size="xs"
        iconOnly
        onColor
        leadingIcon={icon}
        onClick={onClick}
        disabled={disabled}
        aria-label={label}
      />
    </Tooltip>
  )
}

export default function ImageBlockAdminOverlay({
  canMoveLeft,
  canMoveRight,
  busy,
  onMoveLeft,
  onMoveRight,
  onReplace,
  onDelete,
  className,
}: ImageBlockAdminOverlayProps) {
  const fileRef = useRef<HTMLInputElement | null>(null)

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    void onReplace(file)
  }

  const showMoveButtons = Boolean(onMoveLeft && onMoveRight)

  return (
    <div
      className={[styles.root, className].filter(Boolean).join(' ')}
      onClick={(e) => e.stopPropagation()}
      role="toolbar"
      aria-label="Image controls"
    >
      {showMoveButtons && (
        <>
          <OverlayButton
            label="Move left"
            onClick={onMoveLeft!}
            disabled={busy || !canMoveLeft}
            icon={<ChevronLeft />}
          />
          <OverlayButton
            label="Move right"
            onClick={onMoveRight!}
            disabled={busy || !canMoveRight}
            icon={<ChevronRight />}
          />
        </>
      )}
      <OverlayButton
        label="Replace image"
        onClick={() => fileRef.current?.click()}
        disabled={busy}
        icon={<ReplaceIcon />}
      />
      <OverlayButton
        label="Delete image"
        onClick={onDelete}
        disabled={busy}
        icon={<TrashIcon />}
        danger
      />
      <input
        ref={fileRef}
        type="file"
        accept="image/*,video/*"
        className={styles.hiddenInput}
        onChange={onFileChange}
        tabIndex={-1}
      />
    </div>
  )
}
