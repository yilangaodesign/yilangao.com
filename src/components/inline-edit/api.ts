import type { ApiTarget, DirtyField } from './types'
import { makeLexicalParagraph } from '@/lib/lexical'

/* ── Lexical format bitmask: Bold=1, Italic=2, Strikethrough=4, Underline=8 ── */

interface LexicalTextNode {
  mode: 'normal'
  text: string
  type: 'text'
  style: string
  detail: number
  format: number
  version: 1
}

function collectTextNodes(node: Node, format: number): LexicalTextNode[] {
  const nodes: LexicalTextNode[] = []

  for (const child of Array.from(node.childNodes)) {
    if (child.nodeType === Node.TEXT_NODE) {
      const text = child.textContent || ''
      if (text) {
        nodes.push({
          mode: 'normal',
          text,
          type: 'text',
          style: '',
          detail: 0,
          format,
          version: 1,
        })
      }
    } else if (child.nodeType === Node.ELEMENT_NODE) {
      const el = child as HTMLElement
      const tag = el.tagName
      let f = format
      if (tag === 'B' || tag === 'STRONG') f |= 1
      if (tag === 'I' || tag === 'EM') f |= 2
      if (tag === 'U') f |= 8
      if (tag === 'S' || tag === 'STRIKE' || tag === 'DEL') f |= 4
      nodes.push(...collectTextNodes(el, f))
    }
  }

  return nodes
}

function mergeAdjacentNodes(nodes: LexicalTextNode[]): LexicalTextNode[] {
  if (nodes.length === 0) return nodes
  const merged: LexicalTextNode[] = [nodes[0]]
  for (let i = 1; i < nodes.length; i++) {
    const prev = merged[merged.length - 1]
    if (prev.format === nodes[i].format) {
      prev.text += nodes[i].text
    } else {
      merged.push(nodes[i])
    }
  }
  return merged
}

function isBlockTag(tag: string): boolean {
  return tag === 'DIV' || tag === 'P' || tag === 'BLOCKQUOTE' || tag === 'SECTION'
}

function makeLexicalParagraphNode(children: LexicalTextNode[]) {
  return {
    type: 'paragraph' as const,
    format: '' as const,
    indent: 0,
    version: 1,
    children,
    direction: 'ltr' as const,
    textFormat: 0,
    textStyle: '',
  }
}

function splitIntoBlocks(container: Node): LexicalTextNode[][] {
  const blocks: LexicalTextNode[][] = []
  let inline: LexicalTextNode[] = []

  for (const child of Array.from(container.childNodes)) {
    if (child.nodeType === Node.ELEMENT_NODE) {
      const el = child as HTMLElement
      const tag = el.tagName

      if (tag === 'BR') {
        blocks.push(inline)
        inline = []
        continue
      }

      if (isBlockTag(tag)) {
        if (inline.length > 0) {
          blocks.push(inline)
          inline = []
        }
        const nested = splitIntoBlocks(el)
        blocks.push(...(nested.length > 0 ? nested : [[]]))
        continue
      }

      let f = 0
      if (tag === 'B' || tag === 'STRONG') f |= 1
      if (tag === 'I' || tag === 'EM') f |= 2
      if (tag === 'U') f |= 8
      if (tag === 'S' || tag === 'STRIKE' || tag === 'DEL') f |= 4
      inline.push(...collectTextNodes(el, f))
    } else if (child.nodeType === Node.TEXT_NODE) {
      const text = child.textContent || ''
      if (text) {
        inline.push({
          mode: 'normal',
          text,
          type: 'text',
          style: '',
          detail: 0,
          format: 0,
          version: 1,
        })
      }
    }
  }

  if (inline.length > 0) {
    blocks.push(inline)
  }

  return blocks
}

function htmlToLexicalDocument(html: string) {
  const container = document.createElement('div')
  container.innerHTML = html

  const blocks = splitIntoBlocks(container)

  if (blocks.length === 0) {
    return makeLexicalParagraph('')
  }

  return {
    root: {
      type: 'root' as const,
      format: '' as const,
      indent: 0,
      version: 1,
      children: blocks.map((nodes) =>
        makeLexicalParagraphNode(mergeAdjacentNodes(nodes)),
      ),
      direction: 'ltr' as const,
    },
  }
}

function targetKey(t: ApiTarget): string {
  return t.type === 'global'
    ? `global:${t.slug}`
    : `collection:${t.slug}:${t.id}`
}

function buildEndpoint(t: ApiTarget): string {
  return t.type === 'global'
    ? `/api/globals/${t.slug}`
    : `/api/${t.slug}/${t.id}`
}

function buildMethod(t: ApiTarget): string {
  return t.type === 'global' ? 'POST' : 'PATCH'
}

function setNested(obj: Record<string, unknown>, path: string, value: unknown): void {
  const parts = path.split('.')
  let current: Record<string, unknown> = obj

  for (let i = 0; i < parts.length - 1; i++) {
    const key = parts[i]
    const nextKey = parts[i + 1]
    const nextIsIndex = /^\d+$/.test(nextKey)

    if (current[key] === undefined) {
      current[key] = nextIsIndex ? [] : {}
    }
    current = current[key] as Record<string, unknown>
  }

  current[parts[parts.length - 1]] = value
}

const FIELD_NAME_MAP: Record<string, string> = {
  href: 'URL',
  url: 'URL',
  label: 'name',
  name: 'name',
  external: 'open-in-new-tab setting',
}

/**
 * Translate Payload's "Links > Social Links 1 > Href" style labels
 * into plain language like "Link 1's URL".
 */
function humanizeLabel(rawLabel: string): string {
  const parts = rawLabel.split(' > ')
  if (parts.length <= 1) return rawLabel

  const withoutGroup = parts.slice(1)

  return withoutGroup
    .map((p) => {
      const numbered = p.match(/^(.+?)\s+(\d+)$/)
      if (numbered) return `${numbered[1].replace(/s$/, '')} ${numbered[2]}`
      return FIELD_NAME_MAP[p.toLowerCase()] ?? p
    })
    .join(' → ')
}

function humanizeMessage(msg: string): string {
  if (/required/i.test(msg)) return 'is required'
  if (/invalid/i.test(msg)) return 'has an invalid value'
  return msg.toLowerCase()
}

/**
 * Parse a Payload API error response into a human-readable sentence.
 * Falls back to a generic message if the structure is unrecognised.
 */
function parsePayloadError(responseText: string, status: number): string {
  try {
    const json = JSON.parse(responseText)

    const validationErrors: { label?: string; message?: string }[] | undefined =
      json?.errors?.[0]?.data?.errors

    if (validationErrors?.length) {
      const items = validationErrors.map((e) => {
        const label = e.label ? humanizeLabel(e.label) : 'A field'
        const msg = e.message ? humanizeMessage(e.message) : 'has a problem'
        return `${label} ${msg}`
      })

      if (items.length === 1) return `Could not save \u2014 ${items[0]}.`
      return `Could not save \u2014 ${items.length} issues: ${items.join('; ')}.`
    }

    if (json?.message) return `Could not save \u2014 ${json.message}`
  } catch {
    /* not JSON — fall through */
  }

  if (status === 401 || status === 403) return "Could not save \u2014 you are not logged in or your session expired."
  if (status >= 500) return "Could not save \u2014 the server encountered an error. Try again in a moment."
  return `Could not save (error ${status}). Please try again.`
}

export async function createCollectionItem(
  collection: string,
  data: Record<string, unknown>,
): Promise<{ id: number | string; doc: Record<string, unknown> }> {
  const response = await fetch(`/api/${collection}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    const text = await response.text().catch(() => '')
    throw new Error(parsePayloadError(text, response.status))
  }

  const json = await response.json()
  return { id: json.doc?.id ?? json.id, doc: json.doc ?? json }
}

export async function deleteCollectionItem(
  collection: string,
  id: number | string,
): Promise<void> {
  const response = await fetch(`/api/${collection}/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  })

  if (!response.ok) {
    const text = await response.text().catch(() => '')
    throw new Error(parsePayloadError(text, response.status))
  }
}

export async function uploadMedia(
  file: File,
  alt: string,
): Promise<{ id: number | string; url: string }> {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('alt', alt)

  const response = await fetch('/api/media', {
    method: 'POST',
    credentials: 'include',
    body: formData,
  })

  if (!response.ok) {
    const text = await response.text().catch(() => '')
    throw new Error(parsePayloadError(text, response.status))
  }

  const json = await response.json()
  const doc = json.doc ?? json
  return { id: doc.id, url: doc.url }
}

export async function updateCollectionField(
  collection: string,
  id: number | string,
  field: string,
  value: unknown,
): Promise<void> {
  const body: Record<string, unknown> = {}
  setNested(body, field, value)

  const response = await fetch(`/api/${collection}/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(body),
  })

  if (!response.ok) {
    const text = await response.text().catch(() => '')
    throw new Error(parsePayloadError(text, response.status))
  }
}

export async function saveFields(
  dirtyFields: Map<string, DirtyField>,
): Promise<void> {
  const grouped = new Map<string, { target: ApiTarget; fields: DirtyField[] }>()

  for (const field of dirtyFields.values()) {
    if (field.currentValue === field.originalValue) continue

    const key = targetKey(field.target)
    if (!grouped.has(key)) {
      grouped.set(key, { target: field.target, fields: [] })
    }
    grouped.get(key)!.fields.push(field)
  }

  const requests = Array.from(grouped.values()).map(async ({ target, fields }) => {
    const body: Record<string, unknown> = {}

    for (const field of fields) {
      let value: unknown = field.currentValue
      if (field.isRichText) {
        const str = String(value)
        value = str.includes('<')
          ? htmlToLexicalDocument(str)
          : makeLexicalParagraph(str)
      }
      setNested(body, field.fieldPath, value)
    }

    const response = await fetch(buildEndpoint(target), {
      method: buildMethod(target),
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      const text = await response.text().catch(() => '')
      throw new Error(parsePayloadError(text, response.status))
    }
  })

  await Promise.all(requests)
}
