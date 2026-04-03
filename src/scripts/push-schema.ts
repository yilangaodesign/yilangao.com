/**
 * Push the Payload schema to the database.
 * Run via: npx tsx src/scripts/push-schema.ts
 * 
 * This creates the companies table and related columns that Payload expects.
 */

import { readFileSync } from 'fs'
import { resolve } from 'path'
import pg from 'pg'

const { Client } = pg

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

async function pushSchema() {
  const client = new Client({ connectionString: process.env.DATABASE_URL })
  await client.connect()

  console.log('Connected to database')

  const statements = [
    // Create companies table
    `CREATE TABLE IF NOT EXISTS "companies" (
      "id" serial PRIMARY KEY,
      "name" varchar NOT NULL,
      "slug" varchar NOT NULL UNIQUE,
      "password" varchar NOT NULL,
      "active" boolean DEFAULT true,
      "accent" varchar DEFAULT '#888888',
      "greeting" varchar DEFAULT 'Welcome',
      "logo_id" integer REFERENCES "media"("id") ON DELETE SET NULL,
      "background_image_id" integer REFERENCES "media"("id") ON DELETE SET NULL,
      "layout_variant" varchar DEFAULT 'centered',
      "last_login_at" timestamp(3) with time zone,
      "login_count" numeric DEFAULT 0,
      "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
    )`,

    // Create index on slug
    `CREATE UNIQUE INDEX IF NOT EXISTS "companies_slug_idx" ON "companies" ("slug")`,

    // Create companies case study notes array table
    `CREATE TABLE IF NOT EXISTS "companies_case_study_notes" (
      "id" serial PRIMARY KEY,
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL REFERENCES "companies"("id") ON DELETE CASCADE,
      "project_slug" varchar NOT NULL,
      "note" varchar NOT NULL
    )`,

    // Create index on _parent_id for case study notes
    `CREATE INDEX IF NOT EXISTS "companies_case_study_notes_parent_idx" ON "companies_case_study_notes" ("_parent_id")`,
    `CREATE INDEX IF NOT EXISTS "companies_case_study_notes_order_idx" ON "companies_case_study_notes" ("_order")`,

    // Add companies_id to payload_locked_documents_rels if it doesn't exist
    `DO $$ BEGIN
      ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "companies_id" integer REFERENCES "companies"("id") ON DELETE CASCADE;
    EXCEPTION
      WHEN duplicate_column THEN NULL;
    END $$`,
  ]

  for (const sql of statements) {
    try {
      await client.query(sql)
      console.log('  ✓', sql.slice(0, 60).replace(/\n/g, ' ') + '...')
    } catch (err: unknown) {
      const pgErr = err as { message?: string }
      console.log('  ⚠', pgErr.message?.slice(0, 80) || 'unknown error')
    }
  }

  await client.end()
  console.log('\nDone. Restart the dev server to pick up changes.')
}

pushSchema().catch((err) => {
  console.error('Failed:', err)
  process.exit(1)
})
