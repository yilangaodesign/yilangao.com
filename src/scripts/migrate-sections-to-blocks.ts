/**
 * Migrate projects from legacy sections to content blocks.
 * Run via: npx tsx src/scripts/migrate-sections-to-blocks.ts
 *
 * For each project that has sections but no content blocks, converts:
 *   heroImage → hero block (at index 0)
 *   section → heading block + richText block + (imageGroup block if images) + (divider block if showDivider)
 *
 * Safe to re-run: skips projects that already have content blocks.
 */

import { readFileSync } from 'fs'
import { resolve } from 'path'

const envPath = resolve(process.cwd(), '.env')
const envContent = readFileSync(envPath, 'utf-8')
for (const line of envContent.split('\n')) {
  const trimmed = line.trim()
  if (!trimmed || trimmed.startsWith('#')) continue
  const eqIdx = trimmed.indexOf('=')
  if (eqIdx === -1) continue
  const key = trimmed.slice(0, eqIdx)
  const val = trimmed.slice(eqIdx + 1)
  if (!process.env[key]) process.env[key] = val
}

const API_BASE = 'http://localhost:4000/api'

async function apiFetch(path: string, options?: RequestInit) {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...options?.headers },
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`API ${options?.method ?? 'GET'} ${path} → ${res.status}: ${text.slice(0, 200)}`)
  }
  return res.json()
}

type Section = {
  heading: string
  body?: unknown
  layout?: string | null
  showDivider?: boolean | null
  images?: { image: unknown; caption?: string | null }[]
  caption?: string | null
}

type ContentBlock =
  | { blockType: 'hero'; image: number | string; caption?: string }
  | { blockType: 'heading'; text: string; level: string }
  | { blockType: 'richText'; body: unknown }
  | { blockType: 'imageGroup'; layout: string; images: { image: number | string; caption?: string }[]; caption?: string }
  | { blockType: 'divider' }

function sectionsToBlocks(
  sections: Section[],
  heroImageId: number | string | null,
): ContentBlock[] {
  const blocks: ContentBlock[] = []

  if (heroImageId) {
    blocks.push({ blockType: 'hero', image: heroImageId })
  }

  for (let i = 0; i < sections.length; i++) {
    const s = sections[i]

    blocks.push({ blockType: 'heading', text: s.heading, level: 'h2' })

    if (s.body) {
      blocks.push({ blockType: 'richText', body: s.body })
    }

    const rawImages = s.images ?? []
    if (rawImages.length > 0) {
      const imgEntries = rawImages
        .map((img) => {
          const mediaObj = img.image as { id?: number | string } | number | string | null
          const mediaId = typeof mediaObj === 'object' && mediaObj !== null
            ? mediaObj.id
            : mediaObj
          if (!mediaId) return null
          return { image: mediaId, ...(img.caption ? { caption: img.caption } : {}) }
        })
        .filter(Boolean) as { image: number | string; caption?: string }[]

      if (imgEntries.length > 0) {
        blocks.push({
          blockType: 'imageGroup',
          layout: s.layout ?? 'auto',
          images: imgEntries,
          ...(s.caption ? { caption: s.caption } : {}),
        })
      }
    }

    const showDivider = s.showDivider !== false
    const isLast = i === sections.length - 1
    if (showDivider && !isLast) {
      blocks.push({ blockType: 'divider' })
    }
  }

  return blocks
}

async function migrate() {
  console.log('Fetching all projects...')
  const res = await apiFetch('/projects?limit=100&depth=0')
  const docs = res.docs as { id: number | string; title: string; slug: string; heroImage?: number | string | null; sections?: Section[]; content?: unknown[] }[]

  console.log(`Found ${docs.length} projects\n`)

  let migrated = 0
  let skipped = 0

  for (const doc of docs) {
    const hasContent = Array.isArray(doc.content) && doc.content.length > 0
    const hasSections = Array.isArray(doc.sections) && doc.sections.length > 0

    if (hasContent) {
      console.log(`  ⏭ ${doc.title} — already has ${doc.content!.length} content blocks, skipping`)
      skipped++
      continue
    }

    if (!hasSections) {
      console.log(`  ⏭ ${doc.title} — no sections to migrate, skipping`)
      skipped++
      continue
    }

    const heroId = doc.heroImage ?? null
    const blocks = sectionsToBlocks(doc.sections!, heroId)

    console.log(`  → ${doc.title}: ${doc.sections!.length} sections → ${blocks.length} blocks`)

    await apiFetch(`/projects/${doc.id}`, {
      method: 'PATCH',
      body: JSON.stringify({ content: blocks }),
    })

    migrated++
    console.log(`    ✓ migrated`)
  }

  console.log(`\nDone. Migrated: ${migrated}, Skipped: ${skipped}`)
}

migrate().catch((err) => {
  console.error('Migration failed:', err)
  process.exit(1)
})
