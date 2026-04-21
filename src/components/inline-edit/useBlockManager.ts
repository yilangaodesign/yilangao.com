'use client'

import { useCallback, useState } from 'react'
import { useRouter } from 'next/navigation'
import { updateCollectionField, uploadMedia } from './api'
import type { ApiTarget } from './types'
import { useConfirm } from './ConfirmDelete'
import { useToast } from './ToastSurface'
import { normalizeImageRowBreaks, applyImageDropIntent } from '@/lib/normalize-image-rows'

export type BlockType = 'heading' | 'richText' | 'imageGroup' | 'image' | 'divider' | 'hero' | 'videoEmbed'

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
  // Atomic image block: each image is its own block (see Projects.ts schema).
  // Defaults to a new row (rowBreak=true) so newly inserted blocks always
  // appear on their own line until the author explicitly extends a row.
  image: () => ({
    blockType: 'image',
    rowBreak: true,
    widthFraction: null,
    caption: '',
    alt: '',
  }),
  divider: () => ({
    blockType: 'divider',
  }),
  hero: () => ({
    blockType: 'hero',
  }),
  videoEmbed: () => ({
    blockType: 'videoEmbed',
    url: '',
    caption: '',
    placeholderLabel: 'Video embed',
  }),
}

export default function useBlockManager(target: ApiTarget | undefined) {
  const router = useRouter()
  const { confirm } = useConfirm()
  const toast = useToast()
  const [busy, setBusy] = useState(false)

  const patchContent = useCallback(
    async (transform: (blocks: unknown[]) => unknown[], announcement?: string) => {
      if (!target || target.type !== 'collection' || !target.id) {
        return
      }
      setBusy(true)
      try {
        const res = await fetch(`/api/${target.slug}/${target.id}`, {
          credentials: 'include',
        })
        if (!res.ok) throw new Error('Failed to fetch project')
        const json = await res.json()
        const current = (json.content ?? []) as unknown[]
        const updated = transform(current)
        await updateCollectionField(target.slug, target.id, 'content', updated)
        if (announcement) toast.success(announcement)
        router.refresh()
      } catch (e) {
        toast.error(e instanceof Error ? e.message : 'Block update failed')
      } finally {
        setBusy(false)
      }
    },
    [target, router, toast],
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

  const confirmDeleteBlock = useCallback(
    async (index: number, blockLabel?: string) => {
      const ok = await confirm({
        title: `Delete ${blockLabel ?? 'block'}?`,
        description: 'This cannot be undone. The block and its contents will be removed.',
      })
      if (ok) deleteBlock(index)
    },
    [confirm, deleteBlock],
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
        return normalizeImageRowBreaks(next)
      }, `Block moved from ${fromIndex + 1} to ${toIndex + 1}`)
    },
    [patchContent],
  )

  // Move a contiguous range of blocks as a single unit. Used by the
  // row-level DnD path: an atomic image row is a run of `image` blocks
  // whose first member has rowBreak=true. When an editor drags a row, all
  // members must move together so the visual row identity is preserved
  // (EAP-019 — data fields and visual rendering must stay in lockstep).
  //
  // `toStart` is the destination index AFTER the range is removed from
  // the source position. `fromStart` is the pre-removal index of the
  // range's first block.
  const reorderBlockRange = useCallback(
    (fromStart: number, count: number, toStart: number) => {
      if (count <= 0) return
      if (fromStart === toStart) return
      patchContent((blocks) => {
        const next = [...blocks]
        const moved = next.splice(fromStart, count)
        next.splice(toStart, 0, ...moved)
        return normalizeImageRowBreaks(next)
      }, `Block moved from ${fromStart + 1} to ${toStart + 1}`)
    },
    [patchContent],
  )

  // Merge an atomic image range into another row. Behaves like
  // `reorderBlockRange` (same `toStart` semantics = post-removal index)
  // but also flips the first moved block's `rowBreak` to `false` so the
  // range joins the destination row instead of opening a new one.
  //
  // Unlike reorderBlockRange, this runs even when fromStart === toStart
  // (the positional no-op case) because the author may be merging an
  // already-adjacent row; the rowBreak flip is still meaningful.
  const mergeImageRangeIntoRow = useCallback(
    (fromStart: number, count: number, toStart: number) => {
      if (count <= 0) return
      patchContent((blocks) => {
        const next = [...blocks]
        const moved = next.splice(fromStart, count) as Record<string, unknown>[]
        if (moved.length > 0) {
          moved[0] = { ...moved[0], rowBreak: false }
        }
        next.splice(toStart, 0, ...moved)
        return next
      }, `Image merged into row`)
    },
    [patchContent],
  )

  // Atomic single-image reorder + rowBreak intent flip. Encodes the
  // drag-to-merge / drag-to-split semantics used by the case-study DnD
  // (ENG-179): instead of a pure reorder that leaves the dragged image's
  // `rowBreak` untouched and relies on a normalizer to backfill,
  // `intent` is read from the pointer's horizontal-vs-vertical offset
  // relative to the drop target and directly sets the new `rowBreak`.
  //
  // - `intent === 'merge'` → dragged block becomes a follower
  //   (`rowBreak: false`). The previous block in the new sequence should
  //   be an image for this to render as a shared row; if it's not, the
  //   normalizer will re-promote to `true` on the next save, so the
  //   caller-side pointer test is the guard.
  // - `intent === 'split'` → dragged block becomes a row head
  //   (`rowBreak: true`). When inserted mid-run (e.g. between two
  //   members of the same row the block just left), the next image in
  //   CMS order is also promoted to `rowBreak: true` so it does not
  //   fall into the dragged block's newly-created row; otherwise
  //   splitting a 3-image row by pulling the middle image out would
  //   leave the trailing member silently swallowed into the head's
  //   row.
  //
  // The final `normalizeImageRowBreaks` pass is a belt-and-braces guard
  // (first-of-run still gets forced to head). The primary signal is
  // the explicit `rowBreak` set above.
  const reorderImageWithDropIntent = useCallback(
    (
      fromCmsIdx: number,
      postRemovalToIdx: number,
      intent: 'merge' | 'split',
    ) => {
      patchContent(
        (blocks) => applyImageDropIntent(blocks, fromCmsIdx, postRemovalToIdx, intent),
        intent === 'merge' ? 'Image merged into row' : 'Image split to new row',
      )
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
      try {
        const res = await fetch(`/api/${target.slug}/${target.id}`, {
          credentials: 'include',
        })
        if (!res.ok) throw new Error('Failed to fetch project')
        const json = await res.json()
        const blocks = [...(json.content ?? [])] as Record<string, unknown>[]
        const block = { ...blocks[blockIndex] }
        const images = [...((block.images ?? []) as unknown[])]
        const labels = (block.placeholderLabels ?? []) as string[]
        const slotLabel = labels[images.length] || ''
        const alt = slotLabel || file.name.replace(/\.[^.]+$/, '')
        const media = await uploadMedia(file, alt)
        images.push({ image: media.id, caption: slotLabel || null })
        block.images = images
        blocks[blockIndex] = block
        await updateCollectionField(target.slug, target.id, 'content', blocks)
        router.refresh()
      } catch (e) {
        toast.error(e instanceof Error ? e.message : 'Image upload failed')
      } finally {
        setBusy(false)
      }
    },
    [target, router, toast],
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

  // Atomic multi-file drop: create one `image` block per file, in one
  // row (first member rowBreak=true, rest rowBreak=false), inserted at
  // `cmsIndex` in a single patch.
  //
  // The pressure test flagged the naive sequential implementation
  // (N4 — non-deterministic rowBreak when multiple uploads race): if
  // files resolve out-of-order and each upload patches independently,
  // the block-insertion order becomes the upload-resolution order, not
  // the drop order, and `rowBreak` ends up on whichever file happened
  // to finish first. Upload in parallel via `Promise.all` preserving
  // the caller-supplied order, then commit all blocks in one
  // `patchContent` call so the CMS sees an atomic row.
  const insertAtomicImageBlocks = useCallback(
    async (cmsIndex: number, files: File[]) => {
      if (!target || target.type !== 'collection' || !target.id) return
      if (files.length === 0) return
      setBusy(true)
      try {
        const uploads = await Promise.all(
          files.map((file) => {
            const alt = file.name.replace(/\.[^.]+$/, '')
            return uploadMedia(file, alt).then((media) => ({ media, alt }))
          }),
        )
        await patchContent((blocks) => {
          const next = [...blocks] as Record<string, unknown>[]
          // If inserting at cmsIndex > 0 and the existing block at
          // cmsIndex has rowBreak=false, we are splicing in front of
          // a row continuation — the first new block must still open
          // a row (rowBreak=true), which is already the default below.
          const newBlocks = uploads.map(({ media, alt }, i) => ({
            blockType: 'image' as const,
            image: media.id,
            caption: '',
            alt,
            rowBreak: i === 0,
            widthFraction: null,
          }))
          next.splice(cmsIndex, 0, ...newBlocks)
          return next
        }, `${files.length} image${files.length === 1 ? '' : 's'} added`)
      } catch (e) {
        toast.error(e instanceof Error ? e.message : 'Image upload failed')
      } finally {
        setBusy(false)
      }
    },
    [target, toast, patchContent],
  )

  /**
   * Destructive image removal following the §14 CRUD contract.
   *
   * 1. Open an `AlertDialog` via `useConfirm` — the description surfaces
   *    the filename/alt of the image being deleted so editors can tell
   *    which one they are about to remove.
   * 2. On confirm, snapshot the pre-delete images array (used to restore
   *    via the undoable toast).
   * 3. Patch `content` with the image removed; `router.refresh()` fires so
   *    the page re-reads from the CMS.
   * 4. Raise an undoable toast. `onUndo` restores the snapshot in one PATCH.
   *
   * Keep `removeImageFromBlock` available for programmatic callers that
   * already have their own confirmation (eg. drag-to-trash in the future).
   */
  const confirmRemoveImage = useCallback(
    async (
      blockIndex: number,
      imageIndex: number,
      preview: { filename?: string; thumbnailUrl?: string; alt?: string } = {},
    ) => {
      if (!target || target.type !== 'collection' || !target.id) return
      const label = preview.filename ?? preview.alt ?? `image ${imageIndex + 1}`
      const ok = await confirm({
        title: `Delete ${label}?`,
        description:
          'The image will be removed from this block. You can undo immediately from the toast, or it will be permanent once the undo window closes.',
        confirmLabel: 'Delete',
      })
      if (!ok) return

      setBusy(true)
      try {
        const res = await fetch(`/api/${target.slug}/${target.id}`, { credentials: 'include' })
        if (!res.ok) throw new Error('Failed to fetch project')
        const json = await res.json()
        const blocks = [...(json.content ?? [])] as Record<string, unknown>[]
        const block = { ...blocks[blockIndex] }
        const imagesBefore = [...((block.images ?? []) as unknown[])]
        const imagesAfter = imagesBefore.filter((_, i) => i !== imageIndex)
        block.images = imagesAfter
        blocks[blockIndex] = block
        await updateCollectionField(target.slug, target.id, 'content', blocks)
        router.refresh()

        toast.undoable({
          message: `Deleted ${label}`,
          onUndo: () => {
            void (async () => {
              try {
                const restoreRes = await fetch(`/api/${target.slug}/${target.id}`, { credentials: 'include' })
                if (!restoreRes.ok) throw new Error('Failed to fetch project')
                const restoreJson = await restoreRes.json()
                const restoreBlocks = [...(restoreJson.content ?? [])] as Record<string, unknown>[]
                const restoreBlock = { ...restoreBlocks[blockIndex] }
                restoreBlock.images = imagesBefore
                restoreBlocks[blockIndex] = restoreBlock
                await updateCollectionField(target.slug, target.id!, 'content', restoreBlocks)
                router.refresh()
                toast.success('Image restored')
              } catch (e) {
                toast.error(e instanceof Error ? e.message : 'Undo failed')
              }
            })()
          },
        })
      } catch (e) {
        toast.error(e instanceof Error ? e.message : 'Delete failed')
      } finally {
        setBusy(false)
      }
    },
    [target, router, toast, confirm],
  )

  /**
   * Swap an existing image in a block for a newly uploaded file.
   * Uploads the file, then PATCHes the specific `images[i].image` pointer.
   */
  const replaceImageInBlock = useCallback(
    async (blockIndex: number, imageIndex: number, file: File) => {
      if (!target || target.type !== 'collection' || !target.id) return
      setBusy(true)
      try {
        const res = await fetch(`/api/${target.slug}/${target.id}`, { credentials: 'include' })
        if (!res.ok) throw new Error('Failed to fetch project')
        const json = await res.json()
        const blocks = [...(json.content ?? [])] as Record<string, unknown>[]
        const block = { ...blocks[blockIndex] }
        const images = [...((block.images ?? []) as unknown[])] as Record<string, unknown>[]
        const current = { ...(images[imageIndex] ?? {}) }
        const alt = (typeof current.caption === 'string' && current.caption) || file.name.replace(/\.[^.]+$/, '')
        const media = await uploadMedia(file, alt)
        current.image = media.id
        images[imageIndex] = current
        block.images = images
        blocks[blockIndex] = block
        await updateCollectionField(target.slug, target.id, 'content', blocks)
        toast.success('Image replaced')
        router.refresh()
      } catch (e) {
        toast.error(e instanceof Error ? e.message : 'Replace failed')
      } finally {
        setBusy(false)
      }
    },
    [target, router, toast],
  )

  /**
   * Remove an empty scaffold slot from `block.placeholderLabels`.
   *
   * Slots are generated by `createCaseStudyBlocks()` (one entry per
   * image the author was expected to upload) and previously had no
   * inline-edit removal path — authors could only fill them or delete
   * the whole imageGroup. See ENG-166 for the CRUD-contract gap.
   *
   * Guard: if the slot is already filled (an `images[slotIndex]` exists),
   * this is a no-op. The filled state is owned by `confirmRemoveImage`,
   * which honors the §14 CRUD contract (AlertDialog + undoable toast).
   * Empty slots use a lighter undoable toast directly — the stake is a
   * single label string, not a media asset.
   */
  const removePlaceholderSlot = useCallback(
    async (blockIndex: number, slotIndex: number) => {
      if (!target || target.type !== 'collection' || !target.id) return
      setBusy(true)
      try {
        const res = await fetch(`/api/${target.slug}/${target.id}`, { credentials: 'include' })
        if (!res.ok) throw new Error('Failed to fetch project')
        const json = await res.json()
        const blocks = [...(json.content ?? [])] as Record<string, unknown>[]
        const block = { ...blocks[blockIndex] }
        const labelsBefore = [...((block.placeholderLabels ?? []) as string[])]
        const images = (block.images ?? []) as unknown[]
        if (slotIndex < 0 || slotIndex >= labelsBefore.length) return
        if (images[slotIndex] !== undefined) {
          toast.error('Slot has an uploaded image — delete the image first')
          return
        }
        const removed = labelsBefore[slotIndex]
        const labelsAfter = labelsBefore.filter((_, i) => i !== slotIndex)
        block.placeholderLabels = labelsAfter
        blocks[blockIndex] = block
        await updateCollectionField(target.slug, target.id, 'content', blocks)
        router.refresh()

        toast.undoable({
          message: `Removed slot${removed ? ` "${removed}"` : ''}`,
          onUndo: () => {
            void (async () => {
              try {
                const restoreRes = await fetch(`/api/${target.slug}/${target.id}`, { credentials: 'include' })
                if (!restoreRes.ok) throw new Error('Failed to fetch project')
                const restoreJson = await restoreRes.json()
                const restoreBlocks = [...(restoreJson.content ?? [])] as Record<string, unknown>[]
                const restoreBlock = { ...restoreBlocks[blockIndex] }
                restoreBlock.placeholderLabels = labelsBefore
                restoreBlocks[blockIndex] = restoreBlock
                await updateCollectionField(target.slug, target.id!, 'content', restoreBlocks)
                router.refresh()
                toast.success('Slot restored')
              } catch (e) {
                toast.error(e instanceof Error ? e.message : 'Undo failed')
              }
            })()
          },
        })
      } catch (e) {
        toast.error(e instanceof Error ? e.message : 'Remove slot failed')
      } finally {
        setBusy(false)
      }
    },
    [target, router, toast],
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

  // ---------------------------------------------------------------------
  // Atomic image row operations
  //
  // In the atomic model each image is its own block, and a "row" is a
  // contiguous run of `image` blocks whose first member has
  // `rowBreak: true`. All row structure lives in the block shape itself —
  // there's no separate row container object — so every row op is just a
  // patch of `rowBreak` on one or more image blocks.
  //
  // These helpers centralize that so DnD handlers, the break-to-new-row
  // keyboard shortcut, and the admin overlay all go through a single code
  // path. Each op is a no-op on non-image blocks (defensive — the DnD
  // layer shouldn't be calling them on, say, a heading, but a stale index
  // shouldn't corrupt the document).
  // ---------------------------------------------------------------------

  const setImageRowBreak = useCallback(
    (cmsIndex: number, rowBreak: boolean) =>
      patchContent((blocks) => {
        const next = [...blocks] as Record<string, unknown>[]
        const block = { ...(next[cmsIndex] ?? {}) }
        if (block.blockType !== 'image') return next
        // The very first block in the document must stand alone — there's
        // no previous row to merge into — so we force rowBreak=true for
        // index 0 regardless of what the caller asked for.
        block.rowBreak = cmsIndex === 0 ? true : rowBreak
        next[cmsIndex] = block
        return next
      }),
    [patchContent],
  )

  /**
   * Break an image out of its current row into a new row below. Encodes
   * the "between-blocks" drop hint and the keyboard "split here" action.
   */
  const splitImageToNewRow = useCallback(
    (cmsIndex: number) => setImageRowBreak(cmsIndex, true),
    [setImageRowBreak],
  )

  /**
   * Merge an image into the row started by the previous image block.
   * The caller is responsible for making sure the previous block is an
   * `image` (otherwise this produces a rowBreak=false dangling after a
   * non-image block, which the renderer treats as a lone row anyway —
   * safe but meaningless).
   */
  const mergeImageIntoPreviousRow = useCallback(
    (cmsIndex: number) => setImageRowBreak(cmsIndex, false),
    [setImageRowBreak],
  )

  /**
   * Set the per-image width fraction (0..1). `null` clears the override
   * and lets the renderer distribute width equally among row members
   * whose widthFraction is also null.
   */
  const setImageWidthFraction = useCallback(
    (cmsIndex: number, widthFraction: number | null) =>
      patchContent((blocks) => {
        const next = [...blocks] as Record<string, unknown>[]
        const block = { ...(next[cmsIndex] ?? {}) }
        if (block.blockType !== 'image') return next
        const clamped =
          widthFraction === null || Number.isNaN(widthFraction)
            ? null
            : Math.max(0, Math.min(1, widthFraction))
        block.widthFraction = clamped
        next[cmsIndex] = block
        return next
      }),
    [patchContent],
  )

  /**
   * Reorder a single image inside its current row. This is a pure
   * position swap within `content` — the atomic model means "within a
   * row" is exactly "between two blocks with the same implicit row
   * identity", which the caller establishes before calling in. We still
   * preserve rowBreak flags explicitly so swapping the first member of a
   * row doesn't accidentally promote the second member out.
   */
  const reorderImageWithinRow = useCallback(
    (fromCmsIndex: number, toCmsIndex: number) => {
      if (fromCmsIndex === toCmsIndex) return
      patchContent((blocks) => {
        const next = [...blocks] as Record<string, unknown>[]
        const src = next[fromCmsIndex]
        const dst = next[toCmsIndex]
        if (!src || !dst) return next
        if (src.blockType !== 'image' || dst.blockType !== 'image') return next

        // Pull the moved block out and re-insert it. Preserve the row's
        // rowBreak anchoring: whichever block ends up at the lower of the
        // two indices keeps rowBreak=true if either of them had it.
        const lowIdx = Math.min(fromCmsIndex, toCmsIndex)
        const anchored =
          (src.rowBreak as boolean | undefined) || (dst.rowBreak as boolean | undefined) || false

        const [moved] = next.splice(fromCmsIndex, 1)
        next.splice(toCmsIndex, 0, moved)

        const afterLow = next[lowIdx] as Record<string, unknown>
        if (afterLow && afterLow.blockType === 'image') {
          next[lowIdx] = { ...afterLow, rowBreak: anchored || lowIdx === 0 }
        }
        // The other member must sit as a continuation (rowBreak=false) —
        // else it would open a new row.
        const otherIdx = Math.max(fromCmsIndex, toCmsIndex)
        const afterOther = next[otherIdx] as Record<string, unknown>
        if (afterOther && afterOther.blockType === 'image') {
          next[otherIdx] = { ...afterOther, rowBreak: false }
        }

        return next
      }, `Image moved within row`)
    },
    [patchContent],
  )

  return {
    busy,
    addBlock,
    deleteBlock,
    confirmDeleteBlock,
    moveBlock,
    reorderBlock,
    reorderBlockRange,
    mergeImageRangeIntoRow,
    reorderImageWithDropIntent,
    patchBlockField,
    addImageToBlock,
    insertAtomicImageBlocks,
    removeImageFromBlock,
    confirmRemoveImage,
    replaceImageInBlock,
    moveImageInBlock,
    removePlaceholderSlot,
    // Atomic image row operations (see "Atomic image row operations"
    // comment block for semantics).
    setImageRowBreak,
    splitImageToNewRow,
    mergeImageIntoPreviousRow,
    setImageWidthFraction,
    reorderImageWithinRow,
  }
}
