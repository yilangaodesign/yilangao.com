import type { SerializedEditorState } from 'lexical'

/**
 * Reshape @lexical/link serialized nodes ({ type:"link", url }) into
 * Payload's expected format ({ type:"link", fields:{ url, linkType, newTab } }).
 * The two libraries use incompatible LinkNode classes — this bridges them.
 *
 * Pure function, no Lexical runtime dependency — safe for client bundles.
 */
export function normalizePayloadLinks(state: SerializedEditorState): SerializedEditorState {
  function walk(node: Record<string, unknown>): void {
    if (node.type === 'link' && typeof node.url === 'string' && !node.fields) {
      node.fields = {
        url: node.url,
        linkType: 'custom',
        newTab: true,
      }
      delete node.url
      delete node.target
      delete node.rel
      delete node.title
    }
    const children = node.children as Record<string, unknown>[] | undefined
    if (Array.isArray(children)) children.forEach(walk)
    const root = node.root as Record<string, unknown> | undefined
    if (root) walk(root)
  }
  const clone = JSON.parse(JSON.stringify(state))
  walk(clone)
  return clone
}

/**
 * Reverse of `normalizePayloadLinks`: reshape Payload's
 * `{ type:"link", fields:{ url, linkType, newTab } }` back into
 * `@lexical/link`'s expected `{ type:"link", url, target, rel }`.
 *
 * Lexical's `LinkNode.updateFromJSON` reads `serializedNode.url` at
 * the top level. If the CMS stores the Payload shape, `url` is
 * undefined and the editor crashes with "Cannot read properties of
 * undefined (reading 'match')". Call this before passing CMS data
 * to `LexicalComposer`'s `editorState`.
 */
export function denormalizePayloadLinks(state: SerializedEditorState): SerializedEditorState {
  function walk(node: Record<string, unknown>): void {
    if (node.type === 'link' && !node.url && node.fields) {
      const fields = node.fields as Record<string, unknown>
      node.url = fields.url ?? ''
      if (fields.newTab) {
        node.target = '_blank'
        node.rel = 'noopener noreferrer'
      }
      delete node.fields
    }
    const children = node.children as Record<string, unknown>[] | undefined
    if (Array.isArray(children)) children.forEach(walk)
    const root = node.root as Record<string, unknown> | undefined
    if (root) walk(root)
  }
  const clone = JSON.parse(JSON.stringify(state))
  walk(clone)
  return clone
}
