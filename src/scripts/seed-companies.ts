/**
 * One-time migration: seed the Payload "companies" collection from the static
 * companies.json file. Run via: npx tsx src/scripts/seed-companies.ts
 *
 * Requires DATABASE_URL and PAYLOAD_SECRET to be set (reads .env automatically).
 */

import 'dotenv/config'
import { getPayload } from 'payload'
import config from '@payload-config'
import companiesData from '../config/companies.json'

type JsonCompany = {
  name: string
  password: string
  theme: { accent: string; greeting: string }
  caseStudyNotes: Record<string, string>
}

const companies = companiesData as Record<string, JsonCompany>

async function seed() {
  const payload = await getPayload({ config })

  for (const [slug, data] of Object.entries(companies)) {
    const existing = await payload.find({
      collection: 'companies',
      where: { slug: { equals: slug } },
      limit: 1,
    })

    if (existing.docs.length > 0) {
      console.log(`  ⏭  "${slug}" already exists, skipping`)
      continue
    }

    await payload.create({
      collection: 'companies',
      data: {
        name: data.name,
        slug,
        password: data.password,
        active: true,
        accent: data.theme.accent,
        greeting: data.theme.greeting,
        layoutVariant: 'centered',
        caseStudyNotes: Object.entries(data.caseStudyNotes).map(
          ([projectSlug, note]) => ({ projectSlug, note }),
        ),
        loginCount: 0,
      },
    })

    console.log(`  ✓  Created "${slug}" (${data.name})`)
  }

  console.log('\nDone. You can verify at /admin/collections/companies')
  process.exit(0)
}

seed().catch((err) => {
  console.error('Seed failed:', err)
  process.exit(1)
})
