import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { extractLexicalText } from '@/lib/lexical'

/**
 * One-time migration: move each project's legacy top-level `description` field
 * into the `content` blocks array as a richText block, positioned immediately
 * after the hero block. See ENG-154.
 *
 * Idempotent. A project is considered already migrated if the plain text of
 * the first non-hero richText block matches the plain text of `description`.
 * In that case the description field is simply cleared.
 *
 * Disabled in production.
 */
export async function POST() {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Disabled in production' }, { status: 403 })
  }

  const payload = await getPayload({ config })

  const { docs } = await payload.find({
    collection: 'projects',
    limit: 1000,
    depth: 0,
  })

  const results: Array<{
    slug: string
    action: 'migrated' | 'already-migrated' | 'no-description' | 'skipped'
    note?: string
  }> = []

  for (const doc of docs) {
    const slug = (doc.slug as string) || String(doc.id)
    const description = doc.description as unknown
    const descText = extractLexicalText(description).trim()

    if (!descText) {
      results.push({ slug, action: 'no-description' })
      continue
    }

    const rawContent = Array.isArray(doc.content)
      ? (doc.content as Array<Record<string, unknown>>)
      : []

    const firstNonHero = rawContent.find((b) => b?.blockType !== 'hero')
    if (
      firstNonHero &&
      firstNonHero.blockType === 'richText' &&
      extractLexicalText(firstNonHero.body).trim() === descText
    ) {
      await payload.update({
        collection: 'projects',
        id: doc.id,
        data: { description: null } as never,
      })
      results.push({ slug, action: 'already-migrated', note: 'description cleared' })
      continue
    }

    const heroIdx = rawContent.findIndex((b) => b?.blockType === 'hero')
    const insertAt = heroIdx >= 0 ? heroIdx + 1 : 0

    const newBlock = {
      blockType: 'richText',
      body: description,
    }

    const nextContent = [...rawContent]
    nextContent.splice(insertAt, 0, newBlock)

    await payload.update({
      collection: 'projects',
      id: doc.id,
      data: {
        content: nextContent,
        description: null,
      } as never,
    })

    results.push({ slug, action: 'migrated', note: `inserted at content[${insertAt}]` })
  }

  return NextResponse.json({
    action: 'migrate-description-to-block',
    total: docs.length,
    results,
  })
}
