/**
 * Creates the edra_document_links junction table and seeds it with
 * relational links between Maya's 200 documents.
 *
 * Run via: node edra-challenge/scripts/seed-links.mjs
 * (Must run AFTER seed-documents-full.mjs)
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

/**
 * Link types:
 *  - references    → source explicitly cites target
 *  - supersedes    → source replaces target
 *  - duplicate_of  → source is a near-duplicate of target
 *  - related       → topically related (AI-suggested)
 *  - discussed_in  → document was discussed in a meeting note
 *  - informs       → research/experiment that led to a decision
 */

const LINKS = [
  // ─── References (meeting notes citing docs) ─────────────────────────────
  { source: 'MTG-001', target: 'EVAL-001', type: 'references' },
  { source: 'MTG-001', target: 'INC-002', type: 'references' },
  { source: 'MTG-002', target: 'ADR-029', type: 'references' },
  { source: 'MTG-003', target: 'PM-001', type: 'references' },
  { source: 'MTG-004', target: 'INT-002', type: 'references' },
  { source: 'MTG-005', target: 'INT-003', type: 'references' },
  { source: 'RUN-002', target: 'PM-002', type: 'references' },
  { source: 'MTG-006', target: 'INC-002', type: 'references' },
  { source: 'MTG-008', target: 'EVAL-004', type: 'references' },
  { source: 'MTG-009', target: 'PM-007', type: 'references' },
  { source: 'MTG-014', target: 'INT-003', type: 'references' },
  { source: 'MTG-015', target: 'ADR-029', type: 'references' },
  { source: 'MTG-016', target: 'EVAL-002', type: 'references' },
  { source: 'MTG-018', target: 'ADR-018', type: 'references' },
  { source: 'MTG-030', target: 'INC-013', type: 'references' },
  { source: 'MTG-031', target: 'EVAL-011', type: 'references' },
  { source: 'MTG-034', target: 'PM-001', type: 'references' },
  { source: 'MTG-036', target: 'EXP-013', type: 'references' },
  { source: 'MTG-037', target: 'INT-003', type: 'references' },
  { source: 'MTG-042', target: 'PM-010', type: 'references' },
  { source: 'MTG-043', target: 'PM-007', type: 'references' },
  { source: 'RUN-010', target: 'PM-001', type: 'references' },
  { source: 'RUN-012', target: 'RUN-002', type: 'references' },
  { source: 'RUN-014', target: 'PM-004', type: 'references' },

  // ─── Supersedes ─────────────────────────────────────────────────────────
  { source: 'PROMPT-001', target: 'PROMPT-002', type: 'supersedes' },
  { source: 'PROMPT-006', target: 'PROMPT-007', type: 'supersedes' },
  { source: 'PROMPT-007', target: 'PROMPT-008', type: 'supersedes' },
  { source: 'MC-006', target: 'MC-001', type: 'supersedes' },
  { source: 'MC-008', target: 'MC-009', type: 'supersedes' },

  // ─── Informs (research/experiment → decision/fix) ───────────────────────
  { source: 'EXP-002', target: 'ADR-017', type: 'informs' },
  { source: 'EXP-004', target: 'ADR-024', type: 'informs' },
  { source: 'EXP-008', target: 'ADR-021', type: 'informs' },
  { source: 'EXP-011', target: 'ADR-024', type: 'informs' },
  { source: 'EXP-012', target: 'ADR-025', type: 'informs' },
  { source: 'EXP-022', target: 'MC-008', type: 'informs' },
  { source: 'RES-001', target: 'PROMPT-005', type: 'informs' },
  { source: 'RES-004', target: 'ADR-017', type: 'informs' },
  { source: 'RES-005', target: 'ADR-021', type: 'informs' },
  { source: 'RES-002', target: 'PROMPT-004', type: 'informs' },
  { source: 'RES-003', target: 'PM-004', type: 'informs' },
  { source: 'RES-006', target: 'EXP-010', type: 'informs' },
  { source: 'RES-007', target: 'ADR-027', type: 'informs' },
  { source: 'RES-009', target: 'PROMPT-004', type: 'informs' },
  { source: 'RES-015', target: 'EXP-010', type: 'informs' },
  { source: 'EXP-006', target: 'MC-002', type: 'informs' },
  { source: 'EXP-014', target: 'MC-006', type: 'informs' },
  { source: 'EXP-016', target: 'PROMPT-009', type: 'informs' },
  { source: 'EVAL-014', target: 'RUN-007', type: 'informs' },

  // ─── Discussed in (doc discussed in meeting note) ───────────────────────
  { source: 'EVAL-001', target: 'MTG-001', type: 'discussed_in' },
  { source: 'INC-002', target: 'MTG-001', type: 'discussed_in' },
  { source: 'ADR-029', target: 'MTG-002', type: 'discussed_in' },
  { source: 'PM-001', target: 'MTG-003', type: 'discussed_in' },
  { source: 'INT-003', target: 'MTG-005', type: 'discussed_in' },
  { source: 'INC-002', target: 'MTG-006', type: 'discussed_in' },
  { source: 'PM-007', target: 'MTG-009', type: 'discussed_in' },
  { source: 'PM-010', target: 'MTG-042', type: 'discussed_in' },
  { source: 'PM-008', target: 'MTG-002', type: 'discussed_in' },
  { source: 'ADR-032', target: 'MTG-003', type: 'discussed_in' },
  { source: 'ADR-030', target: 'MTG-003', type: 'discussed_in' },
  { source: 'EXP-013', target: 'MTG-036', type: 'discussed_in' },
  { source: 'INT-003', target: 'MTG-037', type: 'discussed_in' },
  { source: 'INC-008', target: 'MTG-009', type: 'discussed_in' },
  { source: 'INC-014', target: 'MTG-040', type: 'discussed_in' },

  // ─── Related (topical affinity — AI-suggested) ──────────────────────────
  // Hallucination cluster
  { source: 'PM-001', target: 'EVAL-004', type: 'related' },
  { source: 'PM-001', target: 'INC-006', type: 'related' },
  { source: 'PM-001', target: 'RUN-010', type: 'related' },
  { source: 'EVAL-004', target: 'PM-009', type: 'related' },
  { source: 'INC-006', target: 'PM-009', type: 'related' },

  // Chunking / retrieval cluster
  { source: 'ADR-021', target: 'PM-003', type: 'related' },
  { source: 'ADR-021', target: 'EXP-008', type: 'related' },
  { source: 'EXP-008', target: 'EXP-011', type: 'related' },
  { source: 'EXP-004', target: 'MC-008', type: 'related' },
  { source: 'EXP-022', target: 'EXP-004', type: 'related' },

  // Eval pipeline cluster
  { source: 'ADR-029', target: 'RUN-004', type: 'related' },
  { source: 'ADR-029', target: 'ADR-018', type: 'related' },
  { source: 'PM-008', target: 'ADR-029', type: 'related' },
  { source: 'RUN-009', target: 'ADR-018', type: 'related' },

  // Routing cluster
  { source: 'EXP-003', target: 'PROMPT-004', type: 'related' },
  { source: 'EXP-003', target: 'MC-002', type: 'related' },
  { source: 'EXP-006', target: 'EXP-003', type: 'related' },
  { source: 'EVAL-016', target: 'MC-002', type: 'related' },

  // Safety cluster
  { source: 'PROMPT-005', target: 'PM-005', type: 'related' },
  { source: 'PROMPT-005', target: 'INC-001', type: 'related' },
  { source: 'PM-005', target: 'INC-001', type: 'related' },
  { source: 'PM-005', target: 'INC-010', type: 'related' },
  { source: 'RES-001', target: 'EVAL-004', type: 'related' },
  { source: 'PM-007', target: 'EXP-016', type: 'related' },
  { source: 'INC-013', target: 'EVAL-011', type: 'related' },
  { source: 'ADR-027', target: 'PROMPT-009', type: 'related' },

  // KB freshness cluster
  { source: 'PM-004', target: 'PM-001', type: 'related' },
  { source: 'PM-004', target: 'RUN-004', type: 'related' },
  { source: 'PM-004', target: 'INC-011', type: 'related' },
  { source: 'PM-006', target: 'RUN-007', type: 'related' },
  { source: 'RUN-014', target: 'PM-006', type: 'related' },

  // Multi-turn / consistency
  { source: 'EXP-005', target: 'INC-003', type: 'related' },
  { source: 'EXP-012', target: 'EXP-005', type: 'related' },
  { source: 'RES-013', target: 'EXP-012', type: 'related' },

  // Enterprise / client cluster
  { source: 'INT-001', target: 'RUN-003', type: 'related' },
  { source: 'INT-002', target: 'RUN-003', type: 'related' },
  { source: 'INT-003', target: 'RUN-005', type: 'related' },
  { source: 'INT-006', target: 'PM-005', type: 'related' },
  { source: 'INT-009', target: 'RUN-003', type: 'related' },
  { source: 'RUN-011', target: 'RUN-003', type: 'related' },

  // Deployment / infra cluster
  { source: 'RUN-001', target: 'PM-002', type: 'related' },
  { source: 'RUN-002', target: 'PM-002', type: 'related' },
  { source: 'RUN-006', target: 'RUN-001', type: 'related' },
  { source: 'PM-010', target: 'INC-014', type: 'related' },

  // Escalation cluster
  { source: 'PROMPT-004', target: 'INC-004', type: 'related' },
  { source: 'PROMPT-013', target: 'PROMPT-004', type: 'related' },

  // Refund / financial cluster
  { source: 'PROMPT-003', target: 'PM-003', type: 'related' },
  { source: 'PROMPT-003', target: 'INC-002', type: 'related' },
  { source: 'EXP-009', target: 'PROMPT-003', type: 'related' },
  { source: 'INC-007', target: 'PROMPT-003', type: 'related' },

  // ClaimsBot cluster
  { source: 'EXP-001', target: 'PROMPT-006', type: 'related' },
  { source: 'EXP-017', target: 'EXP-021', type: 'related' },
  { source: 'INC-008', target: 'INC-015', type: 'related' },
  { source: 'MC-007', target: 'EXP-001', type: 'related' },
  { source: 'EVAL-012', target: 'EXP-017', type: 'related' },

  // Model selection cluster
  { source: 'EXP-004', target: 'MC-005', type: 'related' },
  { source: 'MC-003', target: 'MC-005', type: 'related' },
  { source: 'RES-017', target: 'MC-003', type: 'related' },
  { source: 'EXP-006', target: 'MC-003', type: 'related' },

  // Tool use cluster
  { source: 'EXP-010', target: 'RUN-008', type: 'related' },
  { source: 'EXP-010', target: 'INC-009', type: 'related' },
  { source: 'RES-002', target: 'EXP-010', type: 'related' },
  { source: 'ADR-032', target: 'RES-002', type: 'related' },
  { source: 'INC-016', target: 'ADR-032', type: 'related' },

  // Competitor analysis cluster
  { source: 'RES-003', target: 'RES-008', type: 'related' },
  { source: 'RES-009', target: 'RES-003', type: 'related' },

  // Prompt caching / latency cluster
  { source: 'EXP-013', target: 'PM-010', type: 'related' },
  { source: 'EXP-013', target: 'INC-014', type: 'related' },

  // ─── Duplicate candidates (AI-flagged) ──────────────────────────────────
  { source: 'MC-004', target: 'EVAL-005', type: 'duplicate_of' },
  { source: 'RUN-002', target: 'RUN-012', type: 'duplicate_of' },
  { source: 'INT-007', target: 'INT-002', type: 'duplicate_of' },
  { source: 'RES-013', target: 'RES-005', type: 'duplicate_of' },
  { source: 'RUN-016', target: 'RUN-004', type: 'duplicate_of' },
  { source: 'EXP-020', target: 'EXP-006', type: 'duplicate_of' },

  // ─── Atlas disambiguation entities ────────────────────────────────────────
  { source: 'INT-020', target: 'INT-004', type: 'references' },
  { source: 'INT-021', target: 'RUN-021', type: 'references' },
  { source: 'INC-020', target: 'MTG-001', type: 'discussed_in' },
  { source: 'PM-020',  target: 'PM-021',  type: 'supersedes' },
  { source: 'PM-022',  target: 'EXP-008', type: 'informs' },
  { source: 'MTG-050', target: 'MTG-015', type: 'discussed_in' },
]

async function seedLinks() {
  const client = new Client({ connectionString: process.env.DATABASE_URL })
  await client.connect()
  console.log('Connected to Supabase Postgres')

  await client.query(`DROP TABLE IF EXISTS "edra_document_links" CASCADE`)

  await client.query(`
    CREATE TABLE "edra_document_links" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      "source_id" uuid NOT NULL REFERENCES "edra_documents"("id") ON DELETE CASCADE,
      "target_id" uuid NOT NULL REFERENCES "edra_documents"("id") ON DELETE CASCADE,
      "link_type" text NOT NULL,
      "confidence" real DEFAULT 1.0,
      "created_by" text DEFAULT 'system',
      "created_at" timestamptz DEFAULT now(),
      UNIQUE("source_id", "target_id", "link_type")
    )
  `)
  await client.query(`CREATE INDEX "edra_links_source_idx" ON "edra_document_links" ("source_id")`)
  await client.query(`CREATE INDEX "edra_links_target_idx" ON "edra_document_links" ("target_id")`)
  await client.query(`CREATE INDEX "edra_links_type_idx" ON "edra_document_links" ("link_type")`)
  console.log('✓ Table edra_document_links created')

  await client.query(`ALTER TABLE "edra_document_links" ENABLE ROW LEVEL SECURITY`)
  await client.query(`
    DO $$ BEGIN
      CREATE POLICY "edra_links_public_read" ON "edra_document_links"
        FOR SELECT USING (true);
    EXCEPTION
      WHEN duplicate_object THEN NULL;
    END $$
  `)
  console.log('✓ RLS enabled')

  // Resolve document_id → uuid
  const { rows: docs } = await client.query(`SELECT id, document_id FROM edra_documents`)
  const idMap = Object.fromEntries(docs.map(d => [d.document_id, d.id]))

  let inserted = 0
  let skipped = 0

  for (const link of LINKS) {
    const sourceUuid = idMap[link.source]
    const targetUuid = idMap[link.target]

    if (!sourceUuid || !targetUuid) {
      console.warn(`  ⚠ Skipping ${link.source} → ${link.target}: document not found`)
      skipped++
      continue
    }

    const confidence = link.type === 'related' ? (0.7 + Math.random() * 0.2) : (link.type === 'duplicate_of' ? (0.65 + Math.random() * 0.15) : 1.0)
    const createdBy = ['references', 'supersedes', 'discussed_in'].includes(link.type) ? 'manual' : 'ai-clustering'

    await client.query(
      `INSERT INTO "edra_document_links" (source_id, target_id, link_type, confidence, created_by)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (source_id, target_id, link_type) DO NOTHING`,
      [sourceUuid, targetUuid, link.type, Math.round(confidence * 100) / 100, createdBy]
    )
    inserted++
  }

  console.log(`✓ Inserted ${inserted} links (${skipped} skipped)`)

  // Summary
  const { rows: summary } = await client.query(
    `SELECT link_type, count(*) as count, 
     round(avg(confidence)::numeric, 2) as avg_confidence,
     count(*) FILTER (WHERE created_by = 'manual') as manual,
     count(*) FILTER (WHERE created_by = 'ai-clustering') as ai
     FROM edra_document_links GROUP BY link_type ORDER BY count DESC`
  )
  console.log('\nLink Summary:')
  console.log('  Type            | Count | Avg Conf | Manual | AI')
  console.log('  ' + '─'.repeat(55))
  for (const row of summary) {
    console.log(`  ${row.link_type.padEnd(16)} | ${String(row.count).padStart(5)} | ${String(row.avg_confidence).padStart(8)} | ${String(row.manual).padStart(6)} | ${String(row.ai).padStart(3)}`)
  }

  // Graph density
  const { rows: [{ count: totalLinks }] } = await client.query(`SELECT count(*) FROM edra_document_links`)
  const { rows: [{ count: totalDocs }] } = await client.query(`SELECT count(*) FROM edra_documents`)
  const { rows: [{ count: connectedDocs }] } = await client.query(
    `SELECT count(DISTINCT doc_id) FROM (
      SELECT source_id as doc_id FROM edra_document_links
      UNION
      SELECT target_id as doc_id FROM edra_document_links
    ) t`
  )
  console.log(`\n  Total links: ${totalLinks}`)
  console.log(`  Connected documents: ${connectedDocs}/${totalDocs} (${Math.round(connectedDocs/totalDocs*100)}%)`)
  console.log(`  Avg links per connected doc: ${(totalLinks * 2 / connectedDocs).toFixed(1)}`)

  await client.end()
  console.log('\nDone.')
}

seedLinks().catch((err) => {
  console.error('Seed links failed:', err)
  process.exit(1)
})
