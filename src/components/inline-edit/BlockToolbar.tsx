'use client'

import { type ReactNode } from 'react'
import { Button } from '@/components/ui/Button'
import { Tooltip } from '@/components/ui/Tooltip'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/DropdownMenu'
import type { BlockType } from './useBlockManager'
import styles from './inline-edit.module.scss'

const BLOCK_TYPES: { type: BlockType; label: string; icon: ReactNode }[] = [
  {
    type: 'heading',
    label: 'Heading',
    icon: (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
        <path d="M2.5 2.5v9M11.5 2.5v9M2.5 7h9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    type: 'richText',
    label: 'Text Block',
    icon: (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
        <path d="M2 3.5h10M2 7h8M2 10.5h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    type: 'imageGroup',
    label: 'Image Group',
    icon: (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
        <rect x="1.5" y="1.5" width="11" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.2" />
        <circle cx="5" cy="5" r="1.2" stroke="currentColor" strokeWidth="1" />
        <path d="M1.5 10l3-3 2 2 2-2 4 3" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    type: 'videoEmbed',
    label: 'Video Embed',
    icon: (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
        <path d="M5 4l5 3-5 3V4z" fill="currentColor" stroke="currentColor" strokeWidth="1" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    type: 'divider',
    label: 'Divider',
    icon: (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
        <path d="M2 7h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
]

function ToolbarButton({
  label,
  onClick,
  disabled,
  children,
  active,
}: {
  label: string
  onClick: () => void
  disabled?: boolean
  children: ReactNode
  active?: boolean
}) {
  return (
    <Tooltip content={label}>
      <Button
        size="xs"
        emphasis="minimal"
        appearance={active ? 'highlight' : 'neutral'}
        onColor
        iconOnly
        onClick={onClick}
        disabled={disabled}
        aria-label={label}
      >
        {children}
      </Button>
    </Tooltip>
  )
}

export function BlockInsertMenu({
  onInsert,
  disabled,
  children,
  align = 'start',
}: {
  onInsert: (type: BlockType) => void
  disabled?: boolean
  children: ReactNode
  align?: 'start' | 'center' | 'end'
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild disabled={disabled}>
        {children}
      </DropdownMenuTrigger>
      <DropdownMenuContent align={align} size="sm" appearance="always-dark">
        {BLOCK_TYPES.map((bt) => (
          <DropdownMenuItem
            key={bt.type}
            onSelect={() => onInsert(bt.type)}
            leading={bt.icon}
          >
            {bt.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

// NOTE: The `imageGroup` layout preset picker was removed when the
// atomic image model shipped — there is no block-level "layout" concept
// anymore; rows are derived from each image block's `rowBreak` and
// `widthFraction` fields (see Projects.ts schema). Legacy imageGroup
// blocks still render via the transitional `getLayoutClass` path in
// ProjectClient.tsx, but editors now change layout by breaking/merging
// rows via drag instead of picking from a dropdown. The picker will be
// fully deleted alongside the imageGroup schema in the `cleanup` task.

export function BlockToolbar({
  index,
  total,
  blockType,
  onMoveUp,
  onMoveDown,
  onDelete,
  onInsertAbove,
  onLevelChange,
  currentLevel,
  busy,
}: {
  index: number
  total: number
  blockType: string
  onMoveUp: () => void
  onMoveDown: () => void
  onDelete: () => void
  onInsertAbove: (type: BlockType) => void
  onLevelChange?: (level: string) => void
  currentLevel?: string
  busy: boolean
}) {
  return (
    <div className={styles.blockToolbar} role="toolbar" aria-label={`Block ${index + 1} controls`}>
      <BlockInsertMenu onInsert={onInsertAbove} disabled={busy}>
        <Button size="xs" emphasis="minimal" appearance="neutral" onColor iconOnly aria-label="Add block above">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
            <path d="M6 2v8M2 6h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </Button>
      </BlockInsertMenu>

      <span className={styles.blockToolbarSep} aria-hidden />

      <ToolbarButton label="Move up" onClick={onMoveUp} disabled={busy || index === 0}>
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
          <path d="M6 2.5V9.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M2.5 6L6 2.5L9.5 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </ToolbarButton>

      <ToolbarButton label="Move down" onClick={onMoveDown} disabled={busy || index === total - 1}>
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
          <path d="M6 9.5V2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M2.5 6L6 9.5L9.5 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </ToolbarButton>

      {onLevelChange && (
        <>
          <span className={styles.blockToolbarSep} aria-hidden />
          <ToolbarButton
            label={currentLevel === 'h3' ? 'Switch to H2' : 'Switch to H3'}
            onClick={() => onLevelChange(currentLevel === 'h3' ? 'h2' : 'h3')}
            disabled={busy}
          >
            <span className={styles.levelLabel}>
              {currentLevel === 'h3' ? 'H3' : 'H2'}
            </span>
          </ToolbarButton>
        </>
      )}

      <span className={styles.blockToolbarSep} aria-hidden />

      <ToolbarButton label="Delete block" onClick={onDelete} disabled={busy}>
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
          <path d="M2 3h8M4.5 3V2a.5.5 0 01.5-.5h2a.5.5 0 01.5.5v1M5 5.5v3M7 5.5v3M3 3l.5 7a1 1 0 001 1h3a1 1 0 001-1L9 3" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </ToolbarButton>
    </div>
  )
}

export function BetweenBlockInsert({
  onInsert,
  busy,
}: {
  onInsert: (type: BlockType) => void
  busy: boolean
}) {
  return (
    <div className={styles.betweenBlockInsert}>
      <div className={styles.betweenBlockLine} />
      <BlockInsertMenu onInsert={onInsert} disabled={busy} align="center">
        <button
          type="button"
          className={styles.betweenBlockBtn}
          disabled={busy}
          aria-label="Insert block here"
        >
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
            <path d="M5 1v8M1 5h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
      </BlockInsertMenu>
      <div className={styles.betweenBlockLine} />
    </div>
  )
}
