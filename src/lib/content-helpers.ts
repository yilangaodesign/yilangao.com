import { createHeadlessEditor } from '@lexical/headless'
import {
  $convertFromMarkdownString,
  $convertToMarkdownString,
  TRANSFORMERS,
} from '@lexical/markdown'
import { HeadingNode, QuoteNode } from '@lexical/rich-text'
import { ListNode, ListItemNode } from '@lexical/list'
import { LinkNode, AutoLinkNode } from '@lexical/link'
import { $getRoot } from 'lexical'
import type { SerializedEditorState } from 'lexical'
import { normalizePayloadLinks, denormalizePayloadLinks } from './normalize-lexical-links'

const EDITOR_NODES = [HeadingNode, QuoteNode, ListNode, ListItemNode, LinkNode, AutoLinkNode]

function headlessEditor() {
  return createHeadlessEditor({ nodes: EDITOR_NODES })
}

/**
 * Convert a Markdown string into Lexical JSON suitable for Payload richText fields.
 * Handles bold, italic, strikethrough, links, headings, lists, blockquotes, code.
 */
export function markdownToLexical(md: string): SerializedEditorState {
  const editor = headlessEditor()
  editor.update(
    () => {
      $getRoot().clear()
      $convertFromMarkdownString(md, TRANSFORMERS)
    },
    { discrete: true },
  )
  return normalizePayloadLinks(editor.getEditorState().toJSON())
}

/**
 * Convert Lexical JSON (from Payload richText) back to a Markdown string.
 * Useful for agents reading case study content efficiently.
 */
export function lexicalToMarkdown(json: unknown): string {
  if (!json || typeof json !== 'object') return ''

  const editor = headlessEditor()
  try {
    const data = 'root' in json ? json : { root: json }
    const normalized = denormalizePayloadLinks(data as SerializedEditorState)
    const state = editor.parseEditorState(normalized)
    return state.read(() => $convertToMarkdownString(TRANSFORMERS))
  } catch {
    return ''
  }
}

// ---------------------------------------------------------------------------
// Agent-friendly case study block helpers
// ---------------------------------------------------------------------------

export type SectionImage = { image: number | string; caption?: string; alt?: string }

export interface CaseStudySection {
  heading: string
  level?: 'h2' | 'h3'
  bodyMarkdown?: string
  /**
   * Section images. Two shapes are supported:
   * - `SectionImage[]`  — a single row containing every image.
   * - `SectionImage[][]` — multiple rows; each inner array is one row.
   *
   * The 2D form is the preferred way to express "these images stack" or
   * "these images pair up" without needing the old `layout` preset.
   */
  images?: SectionImage[] | SectionImage[][]
  /**
   * Placeholder labels, same shape rules as `images`.
   * - `string[]`   — single row.
   * - `string[][]` — multiple rows.
   */
  imagePlaceholders?: string[] | string[][]
  /**
   * Per-image width fractions (0..1) within each row.
   * - 1D (`Array<number | null>`) pairs with a 1D `images`/`imagePlaceholders`.
   * - 2D (`Array<Array<number | null>>`) pairs with a 2D `images`/`imagePlaceholders`,
   *   one inner array per row.
   * `null` = equal distribution among unspecified members in that row.
   */
  widthFractions?: Array<number | null> | Array<Array<number | null>>
  showDivider?: boolean
}

function normalizeRows<T>(value: T[] | T[][] | undefined): T[][] {
  if (!value || value.length === 0) return []
  return Array.isArray(value[0]) ? (value as T[][]) : [value as T[]]
}

function normalizeWidthRows(
  value: CaseStudySection['widthFractions'],
): Array<Array<number | null>> {
  if (!value || value.length === 0) return []
  return Array.isArray(value[0]) ? (value as Array<Array<number | null>>) : [value as Array<number | null>]
}

export interface CaseStudyBlockOptions {
  heroImageId?: number | string
  heroCaption?: string
  heroPlaceholderLabel?: string
  /**
   * Scope statement (Markdown) rendered as the first richText content block,
   * directly after the hero and before the first section heading. Replaces the
   * legacy top-level `description` field so it can be edited, moved, and have
   * blocks inserted around it via the standard block UI. See ENG-154.
   */
  scopeStatementMarkdown?: string
}

/**
 * Build a complete `content` blocks array from a simple section description.
 * Designed for agent use — each section is a flat object with Markdown body.
 *
 * @example
 * ```ts
 * createCaseStudyBlocks([
 *   { heading: 'The Trust Problem', bodyMarkdown: 'Vendors **never** trusted the automated scores.' },
 *   { heading: 'Single-Page Workflow', bodyMarkdown: 'I designed a correction flow...', images: [{ image: 42 }] },
 * ], { heroImageId: 7 })
 * ```
 */
export function createCaseStudyBlocks(
  sections: CaseStudySection[],
  options?: CaseStudyBlockOptions,
): Record<string, unknown>[] {
  const blocks: Record<string, unknown>[] = []

  if (options?.heroImageId) {
    blocks.push({
      blockType: 'hero',
      image: options.heroImageId,
      ...(options.heroCaption ? { caption: options.heroCaption } : {}),
    })
  } else {
    const label = options?.heroPlaceholderLabel ?? 'Hero — Case study cover image'
    blocks.push({
      blockType: 'hero',
      placeholderLabel: label,
    })
  }

  if (options?.scopeStatementMarkdown) {
    blocks.push({
      blockType: 'richText',
      body: markdownToLexical(options.scopeStatementMarkdown),
    })
  }

  for (let i = 0; i < sections.length; i++) {
    const s = sections[i]

    blocks.push({
      blockType: 'heading',
      text: s.heading,
      level: s.level ?? 'h2',
    })

    if (s.bodyMarkdown) {
      blocks.push({
        blockType: 'richText',
        body: markdownToLexical(s.bodyMarkdown),
      })
    }

    // Atomic image blocks: one block per image. Rows are expressed by the
    // 2D-array shape of `images` / `imagePlaceholders`. The first image of
    // each row gets `rowBreak: true`; subsequent images continue with
    // `rowBreak: false`. 1D input is treated as a single row.
    const imageRows = normalizeRows<SectionImage>(s.images)
    const placeholderRows = normalizeRows<string>(s.imagePlaceholders)
    const widthRows = normalizeWidthRows(s.widthFractions)

    if (imageRows.length > 0) {
      imageRows.forEach((row, rowIdx) => {
        row.forEach((img, colIdx) => {
          const imageId =
            typeof img.image === 'object' && img.image
              ? (img.image as { id: unknown }).id
              : img.image
          blocks.push({
            blockType: 'image',
            image: imageId,
            caption: img.caption ?? '',
            alt: img.alt ?? '',
            rowBreak: colIdx === 0,
            widthFraction: widthRows[rowIdx]?.[colIdx] ?? null,
          })
        })
      })
    } else if (placeholderRows.length > 0) {
      placeholderRows.forEach((row, rowIdx) => {
        row.forEach((label, colIdx) => {
          blocks.push({
            blockType: 'image',
            placeholderLabel: label,
            rowBreak: colIdx === 0,
            widthFraction: widthRows[rowIdx]?.[colIdx] ?? null,
          })
        })
      })
    }

    const wantDivider = s.showDivider === true
    if (wantDivider && i < sections.length - 1) {
      blocks.push({ blockType: 'divider' })
    }
  }

  return blocks
}

/**
 * Convert a blocks array into a readable Markdown document.
 * Designed for agent use — review, iteration, or quality checks on case study content.
 */
export function readBlocksAsMarkdown(blocks: unknown[]): string {
  const lines: string[] = []

  for (const block of blocks as Record<string, unknown>[]) {
    switch (block.blockType) {
      case 'heading': {
        const prefix = block.level === 'h3' ? '###' : '##'
        lines.push(`${prefix} ${block.text}`)
        lines.push('')
        break
      }
      case 'richText': {
        if (block.body) {
          const md = lexicalToMarkdown(block.body)
          if (md) {
            lines.push(md)
            lines.push('')
          }
        }
        break
      }
      // Legacy: preserved so existing CMS documents still render correctly
      // during the transition window. Once the migration (Phase 2) clears
      // all imageGroup entries from the CMS and the Phase 4 cleanup runs,
      // this branch can be removed. Until then, keeping both is required
      // — EAP-019 (data fields must stay visible across all consumers).
      case 'imageGroup': {
        const images = (block.images as Array<{ image: unknown; caption?: string }>) ?? []
        const labels = block.placeholderLabels as string[] | undefined
        if (images.length === 0 && labels && labels.length > 0) {
          for (const lbl of labels) {
            lines.push(`> [IMAGE PLACEHOLDER: ${lbl}]`)
          }
        } else {
          for (const img of images) {
            const id =
              typeof img.image === 'object' && img.image
                ? (img.image as { id: unknown }).id
                : img.image
            lines.push(`![${img.caption ?? ''}](media:${id})`)
          }
        }
        if (block.caption) lines.push(`_${block.caption}_`)
        lines.push('')
        break
      }
      // New atomic image block. `rowBreak=false` members belong to the same
      // visual row as the previous atomic image; the markdown emission flags
      // the break so a reader can reconstruct the row structure if needed.
      case 'image': {
        const id =
          typeof block.image === 'object' && block.image
            ? (block.image as { id: unknown }).id
            : block.image
        const rowBreakMarker = block.rowBreak === false ? ' [+row]' : ''
        if (id) {
          lines.push(`![${block.caption ?? ''}](media:${id})${rowBreakMarker}`)
        } else if (block.placeholderLabel) {
          lines.push(`> [IMAGE PLACEHOLDER: ${block.placeholderLabel}]${rowBreakMarker}`)
        }
        lines.push('')
        break
      }
      case 'divider':
        lines.push('---')
        lines.push('')
        break
      case 'hero': {
        const id =
          typeof block.image === 'object' && block.image
            ? (block.image as { id: unknown }).id
            : block.image
        if (id) {
          lines.push(`![hero](media:${id})`)
        } else if (block.placeholderLabel) {
          lines.push(`> [HERO PLACEHOLDER: ${block.placeholderLabel}]`)
        }
        if (block.caption) lines.push(`_${block.caption}_`)
        lines.push('')
        break
      }
    }
  }

  return lines.join('\n').trim()
}
