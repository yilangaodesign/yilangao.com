/**
 * Migration — imageGroup → atomic image blocks (standalone script).
 *
 * Run via:
 *   # Dry run (no writes, dumps backup + per-project diffs)
 *   npx tsx src/scripts/migrate-image-groups.ts --dry
 *
 *   # Execute
 *   npx tsx src/scripts/migrate-image-groups.ts
 *
 * Preferred path when the dev server is already running:
 *   curl -X POST "http://localhost:4000/api/migrate-image-groups?dry=1"
 *   curl -X POST "http://localhost:4000/api/migrate-image-groups"
 *
 * Transform logic lives in `src/lib/migrate-image-groups.ts` — imported
 * here so the route and the CLI share a single source of truth.
 *
 * Durability:
 *   - Dumps a timestamped backup of every project's `content` array to
 *     `scripts/.backups/image-groups-<stamp>/` before touching anything.
 *   - Per-project `before` + `after` JSON artifacts for easy diffing.
 *   - Dry mode produces the same artifacts without writing to the DB.
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs'
import { resolve, join } from 'path'
import { getPayload, type Payload } from 'payload'
import config from '../payload.config'
import { migrateProjectContent } from '../lib/migrate-image-groups'

const envPath = resolve(process.cwd(), '.env')
if (existsSync(envPath)) {
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
}

interface ProjectResult {
  slug: string
  id: string | number
  action: 'migrated' | 'no-image-groups' | 'dry-would-migrate' | 'error'
  groupsMigrated?: number
  imagesEmitted?: number
  error?: string
}

async function run(dry: boolean) {
  const payload = (await getPayload({ config })) as Payload

  const { docs } = await payload.find({
    collection: 'projects',
    limit: 1000,
    depth: 0,
  })

  const stamp = new Date().toISOString().replace(/[:.]/g, '-')
  const backupDir = resolve(process.cwd(), 'scripts', '.backups', `image-groups-${stamp}`)
  mkdirSync(backupDir, { recursive: true })

  writeFileSync(
    join(backupDir, '_manifest.json'),
    JSON.stringify({ stamp, dry, projectCount: docs.length }, null, 2),
    'utf-8',
  )

  const results: ProjectResult[] = []

  for (const doc of docs) {
    const slug = (doc.slug as string) || String(doc.id)
    const before = Array.isArray(doc.content) ? (doc.content as unknown[]) : []

    writeFileSync(
      join(backupDir, `${slug}.before.json`),
      JSON.stringify(before, null, 2),
      'utf-8',
    )

    try {
      const { next, touched, groupsMigrated, imagesEmitted } = migrateProjectContent(before)

      if (!touched) {
        results.push({ slug, id: doc.id, action: 'no-image-groups' })
        continue
      }

      writeFileSync(
        join(backupDir, `${slug}.after.json`),
        JSON.stringify(next, null, 2),
        'utf-8',
      )

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

  writeFileSync(
    join(backupDir, '_results.json'),
    JSON.stringify(results, null, 2),
    'utf-8',
  )

  console.log(`\nBackup directory: ${backupDir}\n`)
  for (const r of results) {
    const detail =
      r.action === 'migrated' || r.action === 'dry-would-migrate'
        ? `  (${r.groupsMigrated} groups → ${r.imagesEmitted} image blocks)`
        : r.action === 'error'
          ? `  ${r.error}`
          : ''
    console.log(`[${r.action}] ${r.slug}${detail}`)
  }

  const touched = results.filter(
    (r) => r.action === 'migrated' || r.action === 'dry-would-migrate',
  ).length
  console.log(`\n${dry ? 'Dry run' : 'Migration'} complete — ${touched}/${results.length} projects affected.`)
}

const dry = process.argv.includes('--dry')
run(dry)
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
