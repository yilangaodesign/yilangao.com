/**
 * Shared logic for the imageGroup → atomic image migration.
 *
 * Consumed by:
 *   - `src/app/(frontend)/api/migrate-image-groups/route.ts` — dev-only
 *     endpoint that runs against the live Payload instance.
 *   - `src/scripts/migrate-image-groups.ts` — standalone script that boots
 *     Payload from CLI (useful for CI or one-off re-runs).
 *
 * Keeping the transform pure (no Payload imports here) means it can be
 * unit-tested in isolation and called from either surface without
 * duplication. Both callers pass in the `content` array and receive the
 * rewritten array plus a summary.
 */

type Layout =
  | 'auto'
  | 'full-width'
  | 'grid-2-equal'
  | 'grid-2-left-heavy'
  | 'grid-2-right-heavy'
  | 'grid-3-bento'
  | 'grid-3-equal'
  | 'stacked'

type ImageRef = number | string | { id?: number | string } | null | undefined

interface ImageGroupMember {
  image?: ImageRef
  caption?: string | null
}

interface RowPlan {
  count: number
  widths: Array<number | null>
}

/**
 * Produce a concrete row plan for N images under a given layout.
 *
 * Each entry = one row. `widths[i]` is the widthFraction for position i;
 * `null` means "equal distribution" (renderer decides).
 *
 * Trailing partial rows (when count isn't a clean multiple of the preferred
 * row size) get equal-distribution widths — matches how the old renderer
 * relaxed the grid rather than dropping images.
 */
function planRows(layout: Layout, count: number): RowPlan[] {
  if (count === 0) return []

  switch (layout) {
    case 'full-width':
    case 'stacked':
      return Array.from({ length: count }, () => ({ count: 1, widths: [null] }))

    case 'grid-2-equal':
      return chunk(count, 2, () => [null, null])

    case 'grid-2-left-heavy':
      return chunk(count, 2, () => [2 / 3, 1 / 3])

    case 'grid-2-right-heavy':
      return chunk(count, 2, () => [1 / 3, 2 / 3])

    case 'grid-3-equal':
      return chunk(count, 3, () => [null, null, null])

    case 'grid-3-bento':
      return chunk(count, 3, () => [1 / 2, 1 / 4, 1 / 4])

    case 'auto':
    default:
      // Plan audit decision N2: chunk into rows of 3.
      return chunk(count, 3, () => [null, null, null])
  }
}

function chunk(count: number, size: number, widthsFor: () => Array<number | null>): RowPlan[] {
  const rows: RowPlan[] = []
  let remaining = count
  while (remaining > 0) {
    if (remaining >= size) {
      rows.push({ count: size, widths: widthsFor() })
      remaining -= size
    } else {
      rows.push({ count: remaining, widths: new Array(remaining).fill(null) })
      remaining = 0
    }
  }
  return rows
}

interface ImageGroupBlock {
  blockType: 'imageGroup'
  id?: string
  layout?: Layout
  images?: ImageGroupMember[]
  caption?: string | null
  placeholderLabels?: string[] | null
}

interface AtomicImageBlock {
  blockType: 'image'
  image?: ImageRef
  caption?: string
  alt?: string
  rowBreak: boolean
  widthFraction: number | null
  placeholderLabel?: string
}

function resolveImageId(ref: ImageRef): ImageRef {
  if (ref && typeof ref === 'object' && 'id' in ref) return ref.id ?? null
  return ref ?? null
}

/**
 * Convert a single imageGroup block into a contiguous run of atomic image
 * blocks. Preserves per-image captions; the group-level caption becomes the
 * caption of the first image (so it isn't silently dropped).
 *
 * Slot semantics (ENG-176 follow-up): the pre-atomic `imageGroup` block had
 * two parallel arrays — `images` (filled media) and `placeholderLabels`
 * (intended slot labels). Authors could configure N labels but only fill
 * M < N of them; the remaining `N − M` slots were rendered as empty
 * drop-zones in the group. The legacy renderer showed them; they are real
 * author intent ("I want a slot here for X"). The migration emits one
 * atomic block per **slot**, not per filled image, so the empty slots
 * survive as draggable placeholder blocks in the atomic model. Without
 * this, the migration silently deletes unfilled slots the moment any
 * sibling slot is filled — users only asked us to split the group, not
 * to destroy the empty-slot intent. The row plan is computed over the
 * total slot count (max of images.length and labels.length) so row
 * boundaries match the legacy layout's grid.
 */
function transformImageGroup(block: ImageGroupBlock): AtomicImageBlock[] {
  const layout = (block.layout ?? 'auto') as Layout
  const images = Array.isArray(block.images) ? block.images : []
  const labels = Array.isArray(block.placeholderLabels) ? block.placeholderLabels : []
  const groupCaption = block.caption?.trim() || undefined

  const count = Math.max(images.length, labels.length)
  if (count === 0) return []

  const rows = planRows(layout, count)
  const out: AtomicImageBlock[] = []

  let flatIdx = 0
  for (const row of rows) {
    for (let col = 0; col < row.count; col++) {
      const isFirstInRow = col === 0
      const widthFraction = row.widths[col] ?? null

      const src = images[flatIdx]
      const label = labels[flatIdx]
      const hasMedia = !!(src && resolveImageId(src.image))

      if (hasMedia) {
        const caption =
          (src!.caption?.trim() || '') ||
          (flatIdx === 0 && groupCaption ? groupCaption : '')
        // Filled slots do not carry the legacy placeholder label. The
        // frontend `handleReplace` flow clears `placeholderLabel` when
        // an author swaps a new image into a previously-labeled slot,
        // so emitting the label here would drift from the live-edit
        // behavior — a dormant-but-nonempty field that the admin UI
        // hides. Dropping it here keeps the two paths symmetric.
        out.push({
          blockType: 'image',
          image: resolveImageId(src!.image),
          caption,
          alt: '',
          rowBreak: isFirstInRow,
          widthFraction,
        })
      } else {
        out.push({
          blockType: 'image',
          placeholderLabel: label ?? '',
          caption: flatIdx === 0 && groupCaption ? groupCaption : '',
          alt: '',
          rowBreak: isFirstInRow,
          widthFraction,
        })
      }
      flatIdx++
    }
  }

  return out
}

export interface MigrateContentResult {
  next: Array<Record<string, unknown>>
  touched: boolean
  groupsMigrated: number
  imagesEmitted: number
}

export function migrateProjectContent(content: unknown): MigrateContentResult {
  if (!Array.isArray(content)) {
    return { next: [], touched: false, groupsMigrated: 0, imagesEmitted: 0 }
  }

  const next: Array<Record<string, unknown>> = []
  let groupsMigrated = 0
  let imagesEmitted = 0

  for (const block of content as Array<Record<string, unknown>>) {
    if (block?.blockType === 'imageGroup') {
      const atomic = transformImageGroup(block as unknown as ImageGroupBlock)
      for (const a of atomic) {
        next.push(a as unknown as Record<string, unknown>)
        imagesEmitted++
      }
      groupsMigrated++
    } else {
      next.push(block)
    }
  }

  return { next, touched: groupsMigrated > 0, groupsMigrated, imagesEmitted }
}
