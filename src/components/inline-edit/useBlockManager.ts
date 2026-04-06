'use client'

import { useCallback, useState } from 'react'
import { useRouter } from 'next/navigation'
import { updateCollectionField, uploadMedia } from './api'
import type { ApiTarget } from './types'

export type BlockType = 'heading' | 'richText' | 'imageGroup' | 'divider' | 'hero'

const DEFAULT_BLOCKS: Record<BlockType, () => Record<string, unknown>> = {
  heading: () => ({
    blockType: 'heading',
    text: 'New Heading',
    level: 'h2',
  }),
  richText: () => ({
    blockType: 'richText',
    body: {
      root: {
        type: 'root', format: '', indent: 0, version: 1,
        children: [{
          type: 'paragraph', format: '', indent: 0, version: 1,
          children: [{ mode: 'normal', text: 'New text block.', type: 'text', style: '', detail: 0, format: 0, version: 1 }],
          direction: 'ltr', textFormat: 0, textStyle: '',
        }],
        direction: 'ltr',
      },
    },
  }),
  imageGroup: () => ({
    blockType: 'imageGroup',
    layout: 'auto',
    images: [],
    caption: '',
  }),
  divider: () => ({
    blockType: 'divider',
  }),
  hero: () => ({
    blockType: 'hero',
  }),
}

function announce(message: string) {
  const el = document.getElementById('block-live-region')
  if (el) el.textContent = message
}

export default function useBlockManager(target: ApiTarget | undefined) {
  const router = useRouter()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const patchContent = useCallback(
    async (transform: (blocks: unknown[]) => unknown[], announcement?: string) => {
      if (!target || target.type !== 'collection' || !target.id) return
      setBusy(true)
      setError(null)
      try {
        const res = await fetch(`/api/${target.slug}/${target.id}`, {
          credentials: 'include',
        })
        if (!res.ok) throw new Error('Failed to fetch project')
        const json = await res.json()
        const current = (json.content ?? []) as unknown[]
        const updated = transform(current)
        await updateCollectionField(target.slug, target.id, 'content', updated)
        if (announcement) announce(announcement)
        router.refresh()
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Unknown error')
      } finally {
        setBusy(false)
      }
    },
    [target, router],
  )

  const addBlock = useCallback(
    (type: BlockType, atIndex?: number) => {
      patchContent((blocks) => {
        const newBlock = DEFAULT_BLOCKS[type]()
        const next = [...blocks]
        const idx = atIndex !== undefined ? atIndex : next.length
        next.splice(idx, 0, newBlock)
        return next
      }, `${type} block added`)
    },
    [patchContent],
  )

  const deleteBlock = useCallback(
    (index: number) => {
      patchContent(
        (blocks) => blocks.filter((_, i) => i !== index),
        `Block ${index + 1} deleted`,
      )
    },
    [patchContent],
  )

  const moveBlock = useCallback(
    (index: number, direction: -1 | 1) => {
      patchContent((blocks) => {
        const next = [...blocks]
        const swapTarget = index + direction
        if (swapTarget < 0 || swapTarget >= next.length) return next
        ;[next[index], next[swapTarget]] = [next[swapTarget], next[index]]
        return next
      }, `Block moved ${direction === -1 ? 'up' : 'down'}`)
    },
    [patchContent],
  )

  const reorderBlock = useCallback(
    (fromIndex: number, toIndex: number) => {
      if (fromIndex === toIndex) return
      patchContent((blocks) => {
        const next = [...blocks]
        const [moved] = next.splice(fromIndex, 1)
        next.splice(toIndex, 0, moved)
        return next
      }, `Block moved from ${fromIndex + 1} to ${toIndex + 1}`)
    },
    [patchContent],
  )

  const patchBlockField = useCallback(
    (index: number, field: string, value: unknown) => {
      patchContent((blocks) => {
        const next = [...blocks]
        const block = { ...(next[index] as Record<string, unknown>) }
        block[field] = value
        next[index] = block
        return next
      })
    },
    [patchContent],
  )

  const addImageToBlock = useCallback(
    async (blockIndex: number, file: File) => {
      if (!target || target.type !== 'collection' || !target.id) return
      setBusy(true)
      setError(null)
      try {
        const media = await uploadMedia(file, file.name.replace(/\.[^.]+$/, ''))
        const res = await fetch(`/api/${target.slug}/${target.id}`, {
          credentials: 'include',
        })
        if (!res.ok) throw new Error('Failed to fetch project')
        const json = await res.json()
        const blocks = [...(json.content ?? [])] as Record<string, unknown>[]
        const block = { ...blocks[blockIndex] }
        const images = [...((block.images ?? []) as unknown[])]
        images.push({ image: media.id })
        block.images = images
        delete block.placeholderLabels
        blocks[blockIndex] = block
        await updateCollectionField(target.slug, target.id, 'content', blocks)
        router.refresh()
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Unknown error')
      } finally {
        setBusy(false)
      }
    },
    [target, router],
  )

  const removeImageFromBlock = useCallback(
    (blockIndex: number, imageIndex: number) => {
      patchContent((blocks) => {
        const next = [...blocks] as Record<string, unknown>[]
        const block = { ...next[blockIndex] }
        const images = [...((block.images ?? []) as unknown[])]
        images.splice(imageIndex, 1)
        block.images = images
        next[blockIndex] = block
        return next
      })
    },
    [patchContent],
  )

  const moveImageInBlock = useCallback(
    (blockIndex: number, imageIndex: number, direction: -1 | 1) => {
      patchContent((blocks) => {
        const next = [...blocks] as Record<string, unknown>[]
        const block = { ...next[blockIndex] }
        const images = [...((block.images ?? []) as unknown[])]
        const swap = imageIndex + direction
        if (swap < 0 || swap >= images.length) return next
        ;[images[imageIndex], images[swap]] = [images[swap], images[imageIndex]]
        block.images = images
        next[blockIndex] = block
        return next
      })
    },
    [patchContent],
  )

  return {
    busy,
    error,
    addBlock,
    deleteBlock,
    moveBlock,
    reorderBlock,
    patchBlockField,
    addImageToBlock,
    removeImageFromBlock,
    moveImageInBlock,
  }
}
