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
  return editor.getEditorState().toJSON()
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
    const state = editor.parseEditorState(data as SerializedEditorState)
    return state.read(() => $convertToMarkdownString(TRANSFORMERS))
  } catch {
    return ''
  }
}

// ---------------------------------------------------------------------------
// Agent-friendly case study block helpers
// ---------------------------------------------------------------------------

export interface CaseStudySection {
  heading: string
  level?: 'h2' | 'h3'
  bodyMarkdown?: string
  images?: Array<{ image: number | string; caption?: string }>
  imagePlaceholders?: string[]
  layout?: 'auto' | 'full-width' | 'grid-2-equal' | 'grid-2-left-heavy' | 'grid-2-right-heavy' | 'grid-3-bento' | 'grid-3-equal' | 'stacked'
  showDivider?: boolean
}

export interface CaseStudyBlockOptions {
  heroImageId?: number | string
  heroCaption?: string
  heroPlaceholderLabel?: string
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

    if (s.images && s.images.length > 0) {
      blocks.push({
        blockType: 'imageGroup',
        layout: s.layout ?? 'auto',
        images: s.images,
        caption: '',
      })
    } else if (s.imagePlaceholders && s.imagePlaceholders.length > 0) {
      blocks.push({
        blockType: 'imageGroup',
        layout: s.layout ?? 'auto',
        images: [],
        placeholderLabels: s.imagePlaceholders,
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
