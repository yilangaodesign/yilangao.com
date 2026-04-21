import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { migrateProjectContent } from '@/lib/migrate-image-groups'

/**
 * One-shot migration: rewrite every project's `imageGroup` blocks into a
 * sequence of atomic `image` blocks. Idempotent — projects with no
 * `imageGroup` blocks are skipped.
 *
 * Supports dry-run via `?dry=1`. In dry mode the transform is computed and
 * returned in the response (so you can eyeball the diff) but no writes
 * happen. Disabled entirely in production.
 *
 * This is the recommended path for running the migration locally — it
 * reuses the live dev-server Payload instance instead of cold-booting a
 * second one from a standalone script. The companion script at
 * `src/scripts/migrate-image-groups.ts` calls the same shared logic.
 */
export async function POST(req: Request) {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Disabled in production' }, { status: 403 })
  }

  const url = new URL(req.url)
  const dry = url.searchParams.get('dry') === '1'

  const payload = await getPayload({ config })

  const { docs } = await payload.find({
    collection: 'projects',
    limit: 1000,
    depth: 0,
  })

  const results: Array<{
    slug: string
    id: string | number
    action: 'migrated' | 'no-image-groups' | 'dry-would-migrate' | 'error'
    groupsMigrated?: number
    imagesEmitted?: number
    error?: string
  }> = []

  for (const doc of docs) {
    const slug = (doc.slug as string) || String(doc.id)
    const before = Array.isArray(doc.content) ? (doc.content as unknown[]) : []

    try {
      const { next, touched, groupsMigrated, imagesEmitted } = migrateProjectContent(before)

      if (!touched) {
        results.push({ slug, id: doc.id, action: 'no-image-groups' })
        continue
      }

      if (dry) {
        results.push({
          slug,
          id: doc.id,
          action: 'dry-would-migrate',
          groupsMigrated,
          imagesEmitted,
        })
        continue
      }

      await payload.update({
        collection: 'projects',
        id: doc.id,
        data: { content: next } as never,
      })

      results.push({
        slug,
        id: doc.id,
        action: 'migrated',
        groupsMigrated,
        imagesEmitted,
      })
    } catch (err) {
      results.push({
        slug,
        id: doc.id,
        action: 'error',
        error: err instanceof Error ? err.message : String(err),
      })
    }
  }

  const affected = results.filter(
    (r) => r.action === 'migrated' || r.action === 'dry-would-migrate',
  ).length

  return NextResponse.json({
    action: dry ? 'dry-run' : 'migrate-image-groups',
    total: docs.length,
    affected,
    results,
  })
}
