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

    // Add layout column to projects_sections
    `DO $$ BEGIN
      ALTER TABLE "projects_sections" ADD COLUMN "layout" varchar DEFAULT 'auto';
    EXCEPTION
      WHEN duplicate_column THEN NULL;
    END $$`,

    // Add show_divider column to projects_sections
    `DO $$ BEGIN
      ALTER TABLE "projects_sections" ADD COLUMN "show_divider" boolean DEFAULT true;
    EXCEPTION
      WHEN duplicate_column THEN NULL;
    END $$`,

    // Add caption column to projects_sections_images
    `DO $$ BEGIN
      ALTER TABLE "projects_sections_images" ADD COLUMN "caption" varchar;
    EXCEPTION
      WHEN duplicate_column THEN NULL;
    END $$`,

    // Fix testimonials.text column type: varchar → jsonb (richText field)
    // Payload auto-push can't do this cast; without it, payloadInitError crashes the whole site
    `DO $$ BEGIN
      ALTER TABLE "testimonials" ALTER COLUMN "text" TYPE jsonb USING text::jsonb;
    EXCEPTION
      WHEN others THEN NULL;
    END $$`,

    // Allow hero blocks without an image (placeholder heroes)
    `ALTER TABLE "projects_blocks_hero" ALTER COLUMN "image_id" DROP NOT NULL`,

    // Add placeholder_label to hero blocks for skeleton labels
    `DO $$ BEGIN
      ALTER TABLE "projects_blocks_hero" ADD COLUMN "placeholder_label" varchar;
    EXCEPTION
      WHEN duplicate_column THEN NULL;
    END $$`,

    // Add thumbnail_id to projects (independent of heroImage)
    `DO $$ BEGIN
      ALTER TABLE "projects" ADD COLUMN "thumbnail_id" integer REFERENCES "media"("id") ON DELETE SET NULL;
    EXCEPTION
      WHEN duplicate_column THEN NULL;
    END $$`,

    // Card overlay — independent label fields (not coupled to title)
    `DO $$ BEGIN
      ALTER TABLE "projects" ADD COLUMN "card_line1" varchar;
    EXCEPTION
      WHEN duplicate_column THEN NULL;
    END $$`,
    `DO $$ BEGIN
      ALTER TABLE "projects" ADD COLUMN "card_line2" varchar;
    EXCEPTION
      WHEN duplicate_column THEN NULL;
    END $$`,

    // Media: video poster (relationship → media). Already live on existing DBs
    // via Payload auto-push, but codified here so fresh provisions get it.
    `DO $$ BEGIN
      ALTER TABLE "media" ADD COLUMN "poster_id" integer REFERENCES "media"("id") ON DELETE SET NULL;
    EXCEPTION
      WHEN duplicate_column THEN NULL;
    END $$`,

    // Media: muted override (ENG-162). This is now the *default state* axis
    // (starts muted vs starts with sound), only meaningful when
    // `audio_enabled` is true. See the audio_enabled column below.
    `DO $$ BEGIN
      ALTER TABLE "media" ADD COLUMN "muted" boolean DEFAULT true;
    EXCEPTION
      WHEN duplicate_column THEN NULL;
    END $$`,

    // Media: audio_enabled (capability axis). Split out from `muted` in
    // ENG-170 because the old single-boolean conflated capability
    // ("does the viewer have a mute toggle?") with default state
    // ("if audio is exposed, does it start muted?"). New semantics:
    //   audio_enabled=false → video plays silently, no viewer toggle
    //                         (the `muted` column is ignored in this case)
    //   audio_enabled=true  → viewer mute toggle is shown; `muted` decides
    //                         the starting state
    // Migration: existing rows where `muted=false` were effectively
    // "audio on, starts with sound" — preserve by setting audio_enabled=true.
    // Rows where `muted=true` were "audio off" — preserve by leaving
    // audio_enabled=false (the default).
    `DO $$ BEGIN
      ALTER TABLE "media" ADD COLUMN "audio_enabled" boolean DEFAULT false;
    EXCEPTION
      WHEN duplicate_column THEN NULL;
    END $$`,
    `UPDATE "media" SET "audio_enabled" = true WHERE "muted" = false AND "audio_enabled" IS NOT TRUE`,

    // Atomic image block (replacing imageGroup's images[] array). Each image
    // is its own block; rows are formed implicitly by consecutive `image`
    // blocks whose `row_break` = false continue the row started by their
    // predecessor. Required for the Figma-like atomic image-block DnD model.
    `CREATE TABLE IF NOT EXISTS "projects_blocks_image" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL REFERENCES "projects"("id") ON DELETE CASCADE,
      "_path" text NOT NULL,
      "id" varchar PRIMARY KEY,
      "image_id" integer REFERENCES "media"("id") ON DELETE SET NULL,
      "caption" varchar,
      "alt" varchar,
      "row_break" boolean DEFAULT true,
      "width_fraction" numeric,
      "placeholder_label" varchar,
      "block_name" varchar
    )`,
    `CREATE INDEX IF NOT EXISTS "projects_blocks_image_parent_idx" ON "projects_blocks_image" ("_parent_id")`,
    `CREATE INDEX IF NOT EXISTS "projects_blocks_image_order_idx" ON "projects_blocks_image" ("_order")`,
    `CREATE INDEX IF NOT EXISTS "projects_blocks_image_path_idx" ON "projects_blocks_image" ("_path")`,

    // Essay content type — discriminant + Medium-style meta fields.
    // `content_format` selects between the two-column case-study layout and
    // the single-column essay layout. `published_at`, `read_time_minutes_override`,
    // and `medium_url` feed the EssayMeta row (date · N min read · Medium link).
    // See docs/engineering-feedback-log.md (essay content type).
    `DO $$ BEGIN
      ALTER TABLE "projects" ADD COLUMN "content_format" varchar DEFAULT 'caseStudy';
    EXCEPTION
      WHEN duplicate_column THEN NULL;
    END $$`,
    `DO $$ BEGIN
      ALTER TABLE "projects" ADD COLUMN "published_at" timestamp(3) with time zone;
    EXCEPTION
      WHEN duplicate_column THEN NULL;
    END $$`,
    `DO $$ BEGIN
      ALTER TABLE "projects" ADD COLUMN "read_time_minutes_override" numeric;
    EXCEPTION
      WHEN duplicate_column THEN NULL;
    END $$`,
    `DO $$ BEGIN
      ALTER TABLE "projects" ADD COLUMN "medium_url" varchar;
    EXCEPTION
      WHEN duplicate_column THEN NULL;
    END $$`,
    // Backfill legacy rows so the admin dropdown reads 'caseStudy' instead of blank.
    // DEFAULT only applies to new inserts.
    `UPDATE "projects" SET "content_format" = 'caseStudy' WHERE "content_format" IS NULL`,

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

  // Enable RLS on all public tables (ENG-130)
  // Supabase exposes public schema via PostgREST API by default.
  // Without RLS, the anon key grants full CRUD access to all Payload tables.
  // The postgres superuser role (used by Payload via pooler) bypasses RLS automatically.
  const { rows: unprotected } = await client.query(
    "SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND rowsecurity = false"
  )
  for (const row of unprotected) {
    try {
      await client.query(`ALTER TABLE public."${row.tablename}" ENABLE ROW LEVEL SECURITY`)
      console.log('  ✓ RLS enabled on', row.tablename)
    } catch (err: unknown) {
      const pgErr = err as { message?: string }
      console.log('  ⚠ RLS on', row.tablename, ':', pgErr.message?.slice(0, 80))
    }
  }
  if (unprotected.length === 0) {
    console.log('  ✓ All public tables already have RLS enabled')
  }

  await client.end()
  console.log('\nDone. Restart the dev server to pick up changes.')
}

pushSchema().catch((err) => {
  console.error('Failed:', err)
  process.exit(1)
})
