// Atomic image blocks carry a `rowBreak` boolean that determines whether
// they start a new visual row. After any reorder (or insert/delete that
// shifts image positions), some row-break flags can become inconsistent:
// an image may end up as the first block in a non-image neighborhood
// while still carrying `rowBreak: false`, which would cause it to
// visually "absorb" into a non-existent previous row.
//
// This normalizer enforces a single invariant: the first image of every
// image run must have `rowBreak === true`. All subsequent images in the
// run keep their author-set `rowBreak`, so mid-row reorders still
// preserve row membership.
//
// Side effect: drag-driven row splitting. When an image is dragged from
// inside a multi-image row into a non-image neighborhood (e.g. between
// a heading and a divider, or to the very top), it automatically
// becomes a new row head. No explicit "split" action required (ENG-176).
//
// The helper is defensive: it only mutates the `rowBreak` field of
// `blockType === 'image'` entries. Non-image blocks pass through
// untouched. Non-first images in a run are left untouched so any
// follower→head promotion must come from drag-landing in a non-image
// neighborhood (the desired split semantics), not from incidental
// renumbering.

export function normalizeImageRowBreaks<T>(blocks: T[]): T[] {
  let changed = false
  const next = blocks.map((b, i) => {
    const block = b as unknown as Record<string, unknown> | null
    if (!block || block.blockType !== 'image') return b
    const prev = i > 0 ? (blocks[i - 1] as unknown as Record<string, unknown> | null) : null
    const isFirstInRun = !prev || prev.blockType !== 'image'
    if (isFirstInRun && block.rowBreak !== true) {
      changed = true
      return { ...block, rowBreak: true } as unknown as T
    }
    return b
  })
  return changed ? next : blocks
}

// Compute the side-aware target insertion index. Callers pass the
// target's current CMS index and the drop side (left/right relative to
// a horizontal target, top/bottom relative to a vertical target); this
// maps to either "insert at target's slot" (pushing target down) or
// "insert immediately after target." The result is still a *pre*-
// removal index — convert to post-removal via
// `fromCmsIdx < insertIdx ? insertIdx - 1 : insertIdx`. See ENG-179.
export function targetInsertIndex(
  toCmsIdx: number,
  side: 'left' | 'right' | 'top' | 'bottom',
): number {
  return side === 'right' || side === 'bottom' ? toCmsIdx + 1 : toCmsIdx
}

// Single-image drag transform used by the case-study DnD (ENG-179).
// Performs the splice + `rowBreak` intent flip in one pass so the
// optimistic UI and the server patch apply the same function and
// produce the same result.
//
// Semantics (neighborhood-based, so "merge into target's row" works
// whether the target was already in a multi-image row or was a solo
// row by itself):
//
// **Merge:**
// 1. Move block lands at `postRemovalToIdx`.
// 2. If the preceding block in the new sequence is also an image, the
//    moved block adopts `rowBreak: false` and joins that row. The row
//    head remains whichever image was already the head of the run.
// 3. If the preceding block is NOT an image (start of list, after a
//    heading, etc.), the moved block becomes a new row head
//    (`rowBreak: true`). If the immediately following block is an
//    image that was itself a row head (`rowBreak: true`), it is
//    demoted to follower (`rowBreak: false`) so the pair renders as a
//    single row with the moved block at the head. Without this demote,
//    dropping image A on image B's left edge would leave both
//    `rowBreak: true` and render as two rows — the bug the user hit in
//    the "merge" feedback.
//
// **Split:**
// 1. Moved block lands at `postRemovalToIdx` with `rowBreak: true`.
// 2. The block immediately after (if it's an image that was a
//    follower, `rowBreak: false`) is promoted to `rowBreak: true` so
//    it does not silently fall into the moved block's newly-created
//    row. This matters when the user splits a middle image out of a
//    3+-image row — without the promotion, the trailing members would
//    be swallowed into the moved block's row instead of forming their
//    own.
//
// The final `normalizeImageRowBreaks` pass is defensive: it only
// promotes orphaned first-in-run images to `rowBreak: true` and never
// demotes, so the explicit rules above are the primary signal.
export function applyImageDropIntent<T>(
  blocks: T[],
  fromCmsIdx: number,
  postRemovalToIdx: number,
  intent: 'merge' | 'split',
): T[] {
  const next = [...blocks] as (T | undefined)[]
  const [moved] = next.splice(fromCmsIdx, 1)
  if (moved === undefined) return blocks
  next.splice(postRemovalToIdx, 0, moved)
  const movedBlock = moved as unknown as Record<string, unknown>
  if (movedBlock.blockType === 'image') {
    if (intent === 'merge') {
      const prev = next[postRemovalToIdx - 1] as unknown as Record<string, unknown> | undefined
      const nextBlock = next[postRemovalToIdx + 1] as unknown as Record<string, unknown> | undefined
      if (prev && prev.blockType === 'image') {
        next[postRemovalToIdx] = { ...movedBlock, rowBreak: false } as unknown as T
      } else {
        next[postRemovalToIdx] = { ...movedBlock, rowBreak: true } as unknown as T
        if (nextBlock && nextBlock.blockType === 'image' && nextBlock.rowBreak === true) {
          next[postRemovalToIdx + 1] = { ...nextBlock, rowBreak: false } as unknown as T
        }
      }
    } else {
      next[postRemovalToIdx] = { ...movedBlock, rowBreak: true } as unknown as T
      const follower = next[postRemovalToIdx + 1] as unknown as Record<string, unknown> | undefined
      if (follower && follower.blockType === 'image' && follower.rowBreak === false) {
        next[postRemovalToIdx + 1] = { ...follower, rowBreak: true } as unknown as T
      }
    }
  }
  return normalizeImageRowBreaks(next as T[])
}
