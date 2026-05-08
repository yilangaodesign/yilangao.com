/**
 * Creates the edra_documents table (full metadata model) and seeds it
 * with 200 documents from Maya's workspace — grounded in her persona
 * as a newly promoted Engineering Lead on a 25-person applied AI team.
 *
 * Run via: node edra-challenge/scripts/seed-documents-full.mjs
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

// ─── Helpers ───────────────────────────────────────────────────────────────

const LOREM = `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.\n\nCurabitur pretium tincidunt lacus. Nulla gravida orci a odio. Nullam varius, turpis et commodo pharetra, est eros bibendum elit, nec luctus magna felis sollicitudin mauris. Integer in mauris eu nibh euismod gravida. Duis ac tellus et risus vulputate vehicula.`

const TEAM_CURRENT = ['Maya Chen', 'Tomás Rivera', 'Samira Khalil', 'Alex Park', 'Priya Sharma', 'Jordan Hayes', 'Chen Liu', 'Lucia Fernández', 'Marcus Williams', 'Aisha Hassan', 'Ben Torres', 'Kai Nakamura', 'Sofia Reyes', 'Dev Kapoor', 'Noor Al-Rashid', 'Ravi Sundaram', 'Elena Volkov', 'Yuki Tanaka', 'Omar Farouk', 'Zara Ibrahim']
const TEAM_DEPARTED = ["Liam O'Brien", 'Hannah Kim', 'Raj Mehta']
const TEAM_ALL = [...TEAM_CURRENT, ...TEAM_DEPARTED]

// Narrative "now" — fixed anchor so dates never drift.
// May 7, 2026 5:00 PM ET (UTC-4).
const NARRATIVE_NOW_MS = Date.UTC(2026, 4, 7, 21, 0, 0) // 5 PM ET = 9 PM UTC
const NARRATIVE_NOW = new Date(NARRATIVE_NOW_MS)

// Seeded PRNG for deterministic date variation across re-seeds.
let _seed = 42
function seededRandom() {
  _seed = (_seed * 16807) % 2147483647
  return (_seed - 1) / 2147483646
}
function seededRandInt(min, max) {
  return Math.floor(seededRandom() * (max - min + 1)) + min
}

function pick(arr, n = 1) {
  const shuffled = [...arr].sort(() => Math.random() - 0.5)
  return n === 1 ? shuffled[0] : shuffled.slice(0, n)
}

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

const _pad2 = (n) => String(n).padStart(2, '0')

/**
 * Produce an absolute ET timestamp string N days before NARRATIVE_NOW.
 * If hour/minute are omitted, seeded random business-hours values are used.
 */
function absoluteET(daysBack, hour, minute) {
  const h = hour ?? seededRandInt(9, 18)
  const m = minute ?? seededRandInt(0, 59)
  const base = new Date(Date.UTC(2026, 4, 7)) // May 7 midnight UTC
  base.setUTCDate(base.getUTCDate() - daysBack)
  return `${base.getUTCFullYear()}-${_pad2(base.getUTCMonth() + 1)}-${_pad2(base.getUTCDate())}T${_pad2(h)}:${_pad2(m)}:00-04:00`
}

/**
 * Shorthand for created_date — absolute ET timestamp N days before narrative now.
 */
function daysAgo(n) {
  return absoluteET(n)
}

function makeVersionHistory(version, createdDate) {
  const history = []
  const vNum = parseInt(version.replace('v', ''))
  const created = new Date(createdDate)
  for (let i = 1; i <= vNum; i++) {
    const d = new Date(created)
    d.setDate(d.getDate() + (i - 1) * randInt(7, 30))
    history.push({ version: `v${i}`, date: d.toISOString(), author: pick(TEAM_ALL) })
  }
  return history
}

const FOLDER_PATHS = {
  'Experiment Logs': ['/experiments', '/experiments/2025', '/experiments/2024', '/team-shared/experiments', '/Maya/experiments', '/unsorted', '/atlas/experiments', '/raj-experiments', '/Liam/old-experiments'],
  'Eval Reports': ['/evals', '/evals/weekly', '/evals/monthly', '/team-shared/evals', '/reports/evals', '/unsorted', '/atlas/evals', '/evals/2024'],
  'Prompt Libraries': ['/prompts', '/prompts/production', '/prompts/archive', '/prompts/drafts', '/atlas/prompts', '/unsorted', '/Liam/prompts'],
  'Architecture Decision Records': ['/ADRs', '/architecture', '/decisions', '/team-shared/ADRs', '/unsorted', '/Liam/decisions'],
  'Deployment Postmortems': ['/postmortems', '/incidents/postmortems', '/team-shared/postmortems', '/unsorted', '/postmortems/2024'],
  'Integration Notes': ['/integrations', '/clients', '/enterprise/integrations', '/unsorted', '/team-shared/clients', '/clients/onboarding'],
  'Model Cards': ['/models', '/model-registry', '/team-shared/models', '/unsorted', '/models/deprecated'],
  'Incident Reports': ['/incidents', '/incidents/2025', '/incidents/2024', '/team-shared/incidents', '/unsorted'],
  'Research Notes': ['/research', '/reading-notes', '/team-shared/research', '/Maya/notes', '/unsorted', '/Samira/papers', '/Liam/notes'],
  'Meeting Notes': ['/meetings', '/meetings/weekly', '/meetings/2025', '/meetings/2024', '/team-shared/meetings', '/unsorted', '/Liam/meetings', '/meetings/standups'],
  'Runbooks': ['/runbooks', '/how-to', '/team-shared/runbooks', '/onboarding', '/unsorted', '/Liam/runbooks'],
}

// ─── All 200 Documents ─────────────────────────────────────────────────────

const DOCUMENTS = [
  // ════════════════════════════════════════════════════════════════════════════
  // MEETING NOTES (48 total)
  // ════════════════════════════════════════════════════════════════════════════

  // Weekly syncs (~24 — about 6 months of weekly meetings)
  { title: 'Weekly sync — Apr 28', document_id: 'MTG-001', category: 'Meeting Notes', tags: ['sync', 'weekly-cadence', 'team-updates', 'status'], projects: ['project-atlas', 'project-guardrails'], meetings: ['meeting:weekly-sync-apr28'], references: ['references:weekly-eval-apr28', 'references:agent-discount-incident'], version: 'v1', status: 'current', sensitivity: 'internal', created_by: 'Maya Chen', owner: 'Maya Chen', created_date: daysAgo(8), staleness_flag: 'active' },
  { title: 'Weekly sync — Apr 21', document_id: 'MTG-006', category: 'Meeting Notes', tags: ['sync', 'weekly-cadence', 'team-updates', 'status'], projects: ['project-atlas'], meetings: ['meeting:weekly-sync-apr21'], references: [], version: 'v1', status: 'current', sensitivity: 'internal', created_by: 'Maya Chen', owner: 'Maya Chen', created_date: daysAgo(15), staleness_flag: 'active' },
  { title: 'Weekly sync — Apr 14', document_id: 'MTG-007', category: 'Meeting Notes', tags: ['sync', 'weekly-cadence', 'team-updates', 'prompt-review'], projects: ['project-atlas'], meetings: ['meeting:weekly-sync-apr14'], references: [], version: 'v1', status: 'current', sensitivity: 'internal', created_by: 'Maya Chen', owner: 'Maya Chen', created_date: daysAgo(22), staleness_flag: 'active' },
  { title: 'Weekly sync — Apr 7', document_id: 'MTG-008', category: 'Meeting Notes', tags: ['sync', 'weekly-cadence', 'team-updates'], projects: ['project-guardrails'], meetings: ['meeting:weekly-sync-apr7'], references: [], version: 'v1', status: 'current', sensitivity: 'internal', created_by: 'Maya Chen', owner: 'Maya Chen', created_date: daysAgo(29), staleness_flag: 'active' },
  { title: 'Weekly sync — Mar 31', document_id: 'MTG-009', category: 'Meeting Notes', tags: ['sync', 'weekly-cadence', 'team-updates'], projects: ['project-atlas', 'project-guardrails'], meetings: ['meeting:weekly-sync-mar31'], references: [], version: 'v1', status: 'current', sensitivity: 'internal', created_by: 'Maya Chen', owner: 'Maya Chen', created_date: daysAgo(36), staleness_flag: 'active' },
  { title: 'Weekly sync — Mar 24', document_id: 'MTG-010', category: 'Meeting Notes', tags: ['sync', 'weekly-cadence', 'team-updates'], projects: ['project-atlas'], meetings: ['meeting:weekly-sync-mar24'], references: [], version: 'v1', status: 'current', sensitivity: 'internal', created_by: 'Maya Chen', owner: 'Maya Chen', created_date: daysAgo(43), staleness_flag: 'active' },
  { title: 'Weekly sync — Mar 17', document_id: 'MTG-011', category: 'Meeting Notes', tags: ['sync', 'weekly-cadence', 'team-updates'], projects: ['project-atlas'], meetings: ['meeting:weekly-sync-mar17'], references: [], version: 'v1', status: 'current', sensitivity: 'internal', created_by: 'Maya Chen', owner: 'Maya Chen', created_date: daysAgo(50), staleness_flag: 'active' },
  { title: 'Weekly sync — Mar 10', document_id: 'MTG-012', category: 'Meeting Notes', tags: ['sync', 'weekly-cadence', 'team-updates'], projects: ['project-model-registry'], meetings: ['meeting:weekly-sync-mar10'], references: [], version: 'v1', status: 'current', sensitivity: 'internal', created_by: 'Maya Chen', owner: 'Maya Chen', created_date: daysAgo(57), staleness_flag: 'active' },
  { title: 'Weekly sync — Mar 3', document_id: 'MTG-013', category: 'Meeting Notes', tags: ['sync', 'weekly-cadence', 'team-updates'], projects: ['project-guardrails'], meetings: ['meeting:weekly-sync-mar3'], references: [], version: 'v1', status: 'current', sensitivity: 'internal', created_by: 'Maya Chen', owner: 'Maya Chen', created_date: daysAgo(64), staleness_flag: 'active' },
  { title: 'Weekly sync — Feb 24', document_id: 'MTG-014', category: 'Meeting Notes', tags: ['sync', 'weekly-cadence', 'team-updates'], projects: ['project-enterprise-rollout'], meetings: ['meeting:weekly-sync-feb24'], references: [], version: 'v1', status: 'current', sensitivity: 'internal', created_by: 'Maya Chen', owner: 'Maya Chen', created_date: daysAgo(71), staleness_flag: 'active' },
  { title: 'Weekly sync — Feb 17', document_id: 'MTG-015', category: 'Meeting Notes', tags: ['sync', 'weekly-cadence', 'team-updates'], projects: ['project-eval-framework'], meetings: ['meeting:weekly-sync-feb17'], references: [], version: 'v1', status: 'current', sensitivity: 'internal', created_by: 'Maya Chen', owner: 'Maya Chen', created_date: daysAgo(78), staleness_flag: 'active' },
  { title: 'Weekly sync — Feb 11', document_id: 'MTG-016', category: 'Meeting Notes', tags: ['sync', 'weekly-cadence', 'team-updates'], projects: ['project-atlas'], meetings: ['meeting:weekly-sync-feb11'], references: [], version: 'v1', status: 'current', sensitivity: 'internal', created_by: 'Maya Chen', owner: 'Maya Chen', created_date: daysAgo(84), staleness_flag: 'active' },
  { title: 'Weekly sync — Feb 3', document_id: 'MTG-017', category: 'Meeting Notes', tags: ['sync', 'weekly-cadence', 'team-updates'], projects: ['project-atlas'], meetings: ['meeting:weekly-sync-feb3'], references: [], version: 'v1', status: 'current', sensitivity: 'internal', created_by: 'Maya Chen', owner: 'Maya Chen', created_date: daysAgo(92), staleness_flag: 'active' },
  { title: 'Weekly sync — Jan 27', document_id: 'MTG-018', category: 'Meeting Notes', tags: ['sync', 'weekly-cadence', 'team-updates'], projects: ['project-eval-framework'], meetings: ['meeting:weekly-sync-jan27'], references: [], version: 'v1', status: 'current', sensitivity: 'internal', created_by: "Liam O'Brien", owner: 'Maya Chen', created_date: daysAgo(99), staleness_flag: 'aging' },
  { title: 'Weekly sync — Jan 21', document_id: 'MTG-019', category: 'Meeting Notes', tags: ['sync', 'weekly-cadence', 'team-updates'], projects: ['project-claimsbot'], meetings: ['meeting:weekly-sync-jan21'], references: [], version: 'v1', status: 'current', sensitivity: 'internal', created_by: "Liam O'Brien", owner: 'Maya Chen', created_date: daysAgo(105), staleness_flag: 'aging' },
  { title: 'Weekly sync — Jan 13', document_id: 'MTG-020', category: 'Meeting Notes', tags: ['sync', 'weekly-cadence', 'team-updates'], projects: ['project-integrations'], meetings: ['meeting:weekly-sync-jan13'], references: [], version: 'v1', status: 'current', sensitivity: 'internal', created_by: "Liam O'Brien", owner: 'Maya Chen', created_date: daysAgo(114), staleness_flag: 'aging' },
  { title: 'Weekly sync — Jan 6', document_id: 'MTG-021', category: 'Meeting Notes', tags: ['sync', 'weekly-cadence', 'team-updates'], projects: ['project-kb-sync'], meetings: ['meeting:weekly-sync-jan6'], references: [], version: 'v1', status: 'current', sensitivity: 'internal', created_by: "Liam O'Brien", owner: 'Maya Chen', created_date: daysAgo(121), staleness_flag: 'aging' },
  { title: 'Weekly sync — Dec 16', document_id: 'MTG-022', category: 'Meeting Notes', tags: ['sync', 'weekly-cadence', 'team-updates'], projects: ['project-atlas'], meetings: ['meeting:weekly-sync-dec16'], references: [], version: 'v1', status: 'current', sensitivity: 'internal', created_by: "Liam O'Brien", owner: 'Maya Chen', created_date: daysAgo(142), staleness_flag: 'aging' },
  { title: 'Weekly sync — Dec 9', document_id: 'MTG-023', category: 'Meeting Notes', tags: ['sync', 'weekly-cadence', 'team-updates'], projects: ['project-integrations'], meetings: ['meeting:weekly-sync-dec9'], references: [], version: 'v1', status: 'current', sensitivity: 'internal', created_by: "Liam O'Brien", owner: 'Maya Chen', created_date: daysAgo(149), staleness_flag: 'aging' },
  { title: 'notes from thurs sync', document_id: 'MTG-024', category: 'Meeting Notes', tags: ['sync', 'weekly-cadence'], projects: [], meetings: [], references: [], version: 'v1', status: 'current', sensitivity: 'internal', created_by: "Liam O'Brien", owner: "Liam O'Brien", created_date: daysAgo(200), staleness_flag: 'stale' },
  { title: 'MEETING NOTES 11/8', document_id: 'MTG-025', category: 'Meeting Notes', tags: ['sync'], projects: ['project-atlas'], meetings: [], references: [], version: 'v1', status: 'current', sensitivity: 'internal', created_by: 'Hannah Kim', owner: 'Hannah Kim', created_date: daysAgo(180), staleness_flag: 'stale' },
  { title: 'atlas mtg', document_id: 'MTG-026', category: 'Meeting Notes', tags: ['atlas'], projects: ['project-atlas'], meetings: [], references: [], version: 'v1', status: 'current', sensitivity: 'internal', created_by: "Liam O'Brien", owner: "Liam O'Brien", created_date: daysAgo(220), staleness_flag: 'stale' },
  { title: 'team sync (no agenda)', document_id: 'MTG-027', category: 'Meeting Notes', tags: ['sync', 'no-agenda'], projects: [], meetings: [], references: [], version: 'v1', status: 'current', sensitivity: 'internal', created_by: "Liam O'Brien", owner: "Liam O'Brien", created_date: daysAgo(250), staleness_flag: 'stale' },

  // Project standups
  { title: 'Sprint retro: what broke in the eval pipeline', document_id: 'MTG-002', category: 'Meeting Notes', tags: ['retro', 'eval-pipeline', 'process', 'lessons'], projects: ['project-eval-framework'], meetings: ['meeting:eval-framework-retro-feb17'], references: ['references:ADR-029'], version: 'v1', status: 'current', sensitivity: 'internal', created_by: 'Jordan Hayes', owner: 'Jordan Hayes', created_date: daysAgo(78), staleness_flag: 'active' },
  { title: 'Atlas standup — Feb 3', document_id: 'MTG-028', category: 'Meeting Notes', tags: ['standup', 'atlas', 'status'], projects: ['project-atlas'], meetings: ['meeting:atlas-standup-feb3'], references: [], version: 'v1', status: 'current', sensitivity: 'internal', created_by: 'Alex Park', owner: 'Alex Park', created_date: daysAgo(92), staleness_flag: 'active' },
  { title: 'Atlas standup — Mar 5', document_id: 'MTG-029', category: 'Meeting Notes', tags: ['standup', 'atlas', 'status'], projects: ['project-atlas'], meetings: ['meeting:atlas-standup-mar5'], references: [], version: 'v1', status: 'current', sensitivity: 'internal', created_by: 'Alex Park', owner: 'Alex Park', created_date: daysAgo(62), staleness_flag: 'active' },
  { title: 'Guardrails standup — Mar 10', document_id: 'MTG-030', category: 'Meeting Notes', tags: ['standup', 'guardrails', 'status'], projects: ['project-guardrails'], meetings: ['meeting:guardrails-standup-mar10'], references: [], version: 'v1', status: 'current', sensitivity: 'internal', created_by: 'Aisha Hassan', owner: 'Aisha Hassan', created_date: daysAgo(57), staleness_flag: 'active' },
  { title: 'Guardrails standup — Apr 7', document_id: 'MTG-031', category: 'Meeting Notes', tags: ['standup', 'guardrails', 'status'], projects: ['project-guardrails'], meetings: ['meeting:guardrails-standup-apr7'], references: [], version: 'v1', status: 'current', sensitivity: 'internal', created_by: 'Aisha Hassan', owner: 'Aisha Hassan', created_date: daysAgo(29), staleness_flag: 'active' },
  { title: 'Retrieval-v2 standup — Nov 12', document_id: 'MTG-032', category: 'Meeting Notes', tags: ['standup', 'retrieval', 'status'], projects: ['project-retrieval-v2'], meetings: ['meeting:retrieval-v2-standup-nov12'], references: [], version: 'v1', status: 'current', sensitivity: 'internal', created_by: 'Samira Khalil', owner: 'Samira Khalil', created_date: daysAgo(176), staleness_flag: 'aging' },
  { title: 'Retrieval-v2 standup — Dec 10', document_id: 'MTG-033', category: 'Meeting Notes', tags: ['standup', 'retrieval', 'status'], projects: ['project-retrieval-v2'], meetings: ['meeting:retrieval-v2-standup-dec10'], references: [], version: 'v1', status: 'current', sensitivity: 'internal', created_by: 'Samira Khalil', owner: 'Samira Khalil', created_date: daysAgo(148), staleness_flag: 'aging' },
  { title: 'Standup notes — Tomás OOO, blocked on client C data', document_id: 'MTG-005', category: 'Meeting Notes', tags: ['standup', 'client-c', 'blocker', 'status'], projects: ['project-enterprise-rollout'], meetings: ['meeting:enterprise-standup-feb20'], references: ['references:client-c-encoding-issues'], version: 'v1', status: 'current', sensitivity: 'internal', created_by: 'Lucia Fernández', owner: 'Lucia Fernández', created_date: daysAgo(75), staleness_flag: 'aging' },

  // Design reviews
  { title: 'Design review: new evidence panel UI', document_id: 'MTG-003', category: 'Meeting Notes', tags: ['design-review', 'evidence-panel', 'ui', 'frontend'], projects: ['project-atlas'], meetings: ['meeting:atlas-design-review-apr10'], references: ['references:hallucination-postmortem-mar12'], version: 'v1', status: 'current', sensitivity: 'internal', created_by: 'Sofia Reyes', owner: 'Sofia Reyes', created_date: daysAgo(26), staleness_flag: 'active' },
  { title: 'Design review: agent confidence UI', document_id: 'MTG-034', category: 'Meeting Notes', tags: ['design-review', 'confidence-score', 'ui', 'frontend'], projects: ['project-atlas'], meetings: ['meeting:atlas-design-review-mar20'], references: [], version: 'v1', status: 'current', sensitivity: 'internal', created_by: 'Sofia Reyes', owner: 'Sofia Reyes', created_date: daysAgo(47), staleness_flag: 'active' },
  { title: 'Design review: guardrails admin dashboard', document_id: 'MTG-035', category: 'Meeting Notes', tags: ['design-review', 'guardrails', 'dashboard', 'admin'], projects: ['project-guardrails'], meetings: ['meeting:guardrails-design-review-feb25'], references: [], version: 'v1', status: 'current', sensitivity: 'internal', created_by: 'Sofia Reyes', owner: 'Sofia Reyes', created_date: daysAgo(70), staleness_flag: 'active' },

  // 1:1s
  { title: '1:1 Maya + Tomás — re: Atlas latency', document_id: 'MTG-036', category: 'Meeting Notes', tags: ['1:1', 'atlas', 'latency', 'performance'], projects: ['project-atlas'], meetings: ['meeting:maya-tomas-1-1-apr22'], references: [], version: 'v1', status: 'current', sensitivity: 'team-only', created_by: 'Maya Chen', owner: 'Maya Chen', created_date: daysAgo(14), staleness_flag: 'active' },
  { title: '1:1 Maya + Lucia — client C escalation', document_id: 'MTG-037', category: 'Meeting Notes', tags: ['1:1', 'client-c', 'escalation'], projects: ['project-enterprise-rollout'], meetings: ['meeting:maya-lucia-1-1-mar18'], references: [], version: 'v1', status: 'current', sensitivity: 'team-only', created_by: 'Maya Chen', owner: 'Maya Chen', created_date: daysAgo(49), staleness_flag: 'active' },
  { title: '1:1 Maya + Aisha — guardrails roadmap', document_id: 'MTG-038', category: 'Meeting Notes', tags: ['1:1', 'guardrails', 'roadmap'], projects: ['project-guardrails'], meetings: ['meeting:maya-aisha-1-1-apr8'], references: [], version: 'v1', status: 'current', sensitivity: 'team-only', created_by: 'Maya Chen', owner: 'Maya Chen', created_date: daysAgo(28), staleness_flag: 'active' },
  { title: '1:1 Maya + Jordan — eval pipeline ownership', document_id: 'MTG-039', category: 'Meeting Notes', tags: ['1:1', 'eval-pipeline', 'ownership'], projects: ['project-eval-framework'], meetings: ['meeting:maya-jordan-1-1-apr1'], references: [], version: 'v1', status: 'current', sensitivity: 'team-only', created_by: 'Maya Chen', owner: 'Maya Chen', created_date: daysAgo(35), staleness_flag: 'active' },

  // All-hands
  { title: 'All-hands — Q1 kickoff', document_id: 'MTG-040', category: 'Meeting Notes', tags: ['all-hands', 'quarterly', 'roadmap', 'kickoff'], projects: ['project-atlas', 'project-guardrails', 'project-retrieval-v2'], meetings: ['meeting:all-hands-jan6'], references: [], version: 'v1', status: 'current', sensitivity: 'internal', created_by: "Liam O'Brien", owner: 'Maya Chen', created_date: daysAgo(121), staleness_flag: 'aging' },
  { title: 'All-hands — Q4 roadmap', document_id: 'MTG-041', category: 'Meeting Notes', tags: ['all-hands', 'quarterly', 'roadmap'], projects: ['project-atlas', 'project-retrieval-v2'], meetings: ['meeting:all-hands-oct2'], references: [], version: 'v1', status: 'current', sensitivity: 'internal', created_by: "Liam O'Brien", owner: 'Maya Chen', created_date: daysAgo(217), staleness_flag: 'stale' },

  // Sprint retros
  { title: 'Sprint retro — Atlas sprint 14', document_id: 'MTG-042', category: 'Meeting Notes', tags: ['retro', 'atlas', 'sprint', 'process'], projects: ['project-atlas'], meetings: ['meeting:atlas-retro-apr25'], references: [], version: 'v1', status: 'current', sensitivity: 'internal', created_by: 'Alex Park', owner: 'Alex Park', created_date: daysAgo(11), staleness_flag: 'active' },
  { title: 'Sprint retro — Guardrails sprint 8', document_id: 'MTG-043', category: 'Meeting Notes', tags: ['retro', 'guardrails', 'sprint', 'process'], projects: ['project-guardrails'], meetings: ['meeting:guardrails-retro-mar28'], references: [], version: 'v1', status: 'current', sensitivity: 'internal', created_by: 'Aisha Hassan', owner: 'Aisha Hassan', created_date: daysAgo(39), staleness_flag: 'active' },

  // Brainstorms
  { title: 'Brainstorm: how to handle multilingual KB', document_id: 'MTG-004', category: 'Meeting Notes', tags: ['multilingual', 'knowledge-base', 'ideation', 'i18n'], projects: ['project-kb-sync'], meetings: ['meeting:kb-sync-brainstorm-mar5'], references: ['references:client-b-taxonomy-mapping'], version: 'v1', status: 'current', sensitivity: 'internal', created_by: 'Noor Al-Rashid', owner: 'Noor Al-Rashid', created_date: daysAgo(62), staleness_flag: 'active' },
  { title: 'Brainstorm: agent personality customization', document_id: 'MTG-044', category: 'Meeting Notes', tags: ['agent', 'personality', 'tone', 'customization'], projects: ['project-atlas'], meetings: ['meeting:atlas-brainstorm-feb12'], references: [], version: 'v1', status: 'current', sensitivity: 'internal', created_by: 'Elena Volkov', owner: 'Elena Volkov', created_date: daysAgo(83), staleness_flag: 'active' },
  { title: 'Brainstorm: should we build multi-agent?', document_id: 'MTG-045', category: 'Meeting Notes', tags: ['multi-agent', 'architecture', 'ideation'], projects: ['project-atlas'], meetings: ['meeting:atlas-brainstorm-jan15'], references: [], version: 'v1', status: 'current', sensitivity: 'internal', created_by: 'Samira Khalil', owner: 'Samira Khalil', created_date: daysAgo(113), staleness_flag: 'aging' },

  // Orphaned meeting notes (departed members)
  { title: 'Liam + VP sync — re: headcount', document_id: 'MTG-046', category: 'Meeting Notes', tags: ['1:1', 'vp', 'headcount', 'budget'], projects: [], meetings: [], references: [], version: 'v1', status: 'current', sensitivity: 'team-only', created_by: "Liam O'Brien", owner: "Liam O'Brien", created_date: daysAgo(300), staleness_flag: 'obsolete' },
  { title: 'Hannah onboarding notes', document_id: 'MTG-047', category: 'Meeting Notes', tags: ['onboarding', 'personal'], projects: [], meetings: [], references: [], version: 'v1', status: 'current', sensitivity: 'internal', created_by: 'Hannah Kim', owner: 'Hannah Kim', created_date: daysAgo(500), staleness_flag: 'obsolete' },
  { title: 'raj + liam architecture chat', document_id: 'MTG-048', category: 'Meeting Notes', tags: ['architecture', 'informal'], projects: ['project-atlas'], meetings: [], references: [], version: 'v1', status: 'current', sensitivity: 'internal', created_by: 'Raj Mehta', owner: 'Raj Mehta', created_date: daysAgo(400), staleness_flag: 'obsolete' },

  // ════════════════════════════════════════════════════════════════════════════
  // EXPERIMENT LOGS (22 total)
  // ════════════════════════════════════════════════════════════════════════════

  { title: 'Fine-tuning Haiku on claims dataset v3 — results', document_id: 'EXP-001', category: 'Experiment Logs', tags: ['fine-tuning', 'haiku', 'claims', 'insurance', 'dataset'], projects: ['project-claimsbot'], meetings: ['meeting:claimsbot-kickoff-jan15', 'meeting:weekly-sync-jan21'], references: [], version: 'v3', status: 'current', sensitivity: 'internal', created_by: 'Tomás Rivera', owner: 'Tomás Rivera', created_date: daysAgo(112), staleness_flag: 'active' },
  { title: 'RAG vs long-context comparison for support agent', document_id: 'EXP-002', category: 'Experiment Logs', tags: ['rag', 'context-window', 'support-agent', 'architecture'], projects: ['project-atlas'], meetings: ['meeting:atlas-architecture-review-nov8', 'meeting:weekly-sync-nov13'], references: [], version: 'v2', status: 'current', sensitivity: 'internal', created_by: 'Samira Khalil', owner: 'Samira Khalil', created_date: daysAgo(180), staleness_flag: 'aging' },
  { title: 'Temperature sweep 0.1–0.7 on routing classifier', document_id: 'EXP-003', category: 'Experiment Logs', tags: ['hyperparameter', 'routing', 'classifier', 'tuning'], projects: ['project-atlas'], meetings: ['meeting:atlas-standup-dec4'], references: [], version: 'v1', status: 'current', sensitivity: 'internal', created_by: 'Dev Kapoor', owner: 'Dev Kapoor', created_date: daysAgo(154), staleness_flag: 'aging' },
  { title: 'Embedding model comparison: voyage vs openai vs cohere', document_id: 'EXP-004', category: 'Experiment Logs', tags: ['embeddings', 'model-selection', 'retrieval', 'vendor-comparison'], projects: ['project-retrieval-v2'], meetings: ['meeting:retrieval-v2-kickoff-oct22', 'meeting:vendor-eval-oct29'], references: [], version: 'v2', status: 'current', sensitivity: 'internal', created_by: 'Samira Khalil', owner: 'Samira Khalil', created_date: daysAgo(197), staleness_flag: 'aging' },
  { title: 'Multi-turn memory retention test — 50 conversation pairs', document_id: 'EXP-005', category: 'Experiment Logs', tags: ['memory', 'multi-turn', 'conversation', 'evaluation'], projects: ['project-atlas'], meetings: ['meeting:atlas-eval-review-mar17'], references: [], version: 'v1', status: 'current', sensitivity: 'internal', created_by: 'Priya Sharma', owner: 'Priya Sharma', created_date: daysAgo(50), staleness_flag: 'active' },
  { title: 'Sonnet vs Haiku latency on 10k routing samples', document_id: 'EXP-006', category: 'Experiment Logs', tags: ['sonnet', 'haiku', 'latency', 'routing', 'benchmark'], projects: ['project-atlas'], meetings: ['meeting:model-eval-roundtable-mar10'], references: [], version: 'v1', status: 'current', sensitivity: 'internal', created_by: 'Chen Liu', owner: 'Chen Liu', created_date: daysAgo(57), staleness_flag: 'active' },
  { title: 'Context window 100k vs 200k — support agent recall', document_id: 'EXP-007', category: 'Experiment Logs', tags: ['context-window', 'recall', 'support-agent', 'scaling'], projects: ['project-atlas'], meetings: ['meeting:atlas-eval-review-mar17'], references: [], version: 'v1', status: 'current', sensitivity: 'internal', created_by: 'Samira Khalil', owner: 'Samira Khalil', created_date: daysAgo(48), staleness_flag: 'active' },
  { title: 'Retrieval top-k sweep: 3, 5, 10, 20 chunks', document_id: 'EXP-008', category: 'Experiment Logs', tags: ['retrieval', 'top-k', 'chunks', 'hyperparameter'], projects: ['project-retrieval-v2'], meetings: ['meeting:retrieval-v2-design-review-nov19'], references: [], version: 'v1', status: 'current', sensitivity: 'internal', created_by: 'Samira Khalil', owner: 'Samira Khalil', created_date: daysAgo(169), staleness_flag: 'aging' },
  { title: 'Instruction-following fine-tune on refund flows — epoch 3', document_id: 'EXP-009', category: 'Experiment Logs', tags: ['fine-tuning', 'instruction-following', 'refund', 'epoch'], projects: ['project-atlas'], meetings: ['meeting:atlas-standup-dec11'], references: [], version: 'v3', status: 'current', sensitivity: 'internal', created_by: 'Tomás Rivera', owner: 'Tomás Rivera', created_date: daysAgo(140), staleness_flag: 'aging' },
  { title: 'Tool use: parallel vs sequential function calling', document_id: 'EXP-010', category: 'Experiment Logs', tags: ['tool-use', 'parallel', 'sequential', 'function-calling'], projects: ['project-atlas'], meetings: ['meeting:atlas-standup-feb18'], references: [], version: 'v1', status: 'current', sensitivity: 'internal', created_by: 'Dev Kapoor', owner: 'Dev Kapoor', created_date: daysAgo(77), staleness_flag: 'active' },
  { title: 'Embedding dimension reduction 1536→512 — retrieval impact', document_id: 'EXP-011', category: 'Experiment Logs', tags: ['embeddings', 'dimensionality-reduction', 'retrieval', 'performance'], projects: ['project-retrieval-v2'], meetings: ['meeting:retrieval-v2-design-review-dec3'], references: [], version: 'v1', status: 'current', sensitivity: 'internal', created_by: 'Samira Khalil', owner: 'Samira Khalil', created_date: daysAgo(155), staleness_flag: 'aging' },
  { title: 'Agent memory: sliding window vs summary compression', document_id: 'EXP-012', category: 'Experiment Logs', tags: ['memory', 'sliding-window', 'summarization', 'agent'], projects: ['project-atlas'], meetings: ['meeting:atlas-architecture-review-nov8'], references: [], version: 'v2', status: 'current', sensitivity: 'internal', created_by: 'Samira Khalil', owner: 'Samira Khalil', created_date: daysAgo(180), staleness_flag: 'aging' },
  { title: 'Prompt caching impact on p95 latency', document_id: 'EXP-013', category: 'Experiment Logs', tags: ['prompt-caching', 'latency', 'p95', 'performance'], projects: ['project-atlas'], meetings: ['meeting:atlas-standup-apr15'], references: [], version: 'v1', status: 'current', sensitivity: 'internal', created_by: 'Marcus Williams', owner: 'Marcus Williams', created_date: daysAgo(21), staleness_flag: 'active' },
  { title: 'Claude 3 → Claude 3.5 migration — regression check', document_id: 'EXP-014', category: 'Experiment Logs', tags: ['migration', 'claude-3', 'claude-3.5', 'regression'], projects: ['project-atlas'], meetings: ['meeting:model-eval-roundtable-mar10'], references: [], version: 'v1', status: 'current', sensitivity: 'internal', created_by: 'Chen Liu', owner: 'Chen Liu', created_date: daysAgo(57), staleness_flag: 'active' },
  { title: 'Few-shot vs zero-shot on ticket classification', document_id: 'EXP-015', category: 'Experiment Logs', tags: ['few-shot', 'zero-shot', 'classification', 'ticket'], projects: ['project-atlas'], meetings: ['meeting:atlas-standup-dec4'], references: [], version: 'v1', status: 'current', sensitivity: 'internal', created_by: 'Priya Sharma', owner: 'Priya Sharma', created_date: daysAgo(154), staleness_flag: 'aging' },
  { title: 'Guardrails: prompt injection detection — false positive sweep', document_id: 'EXP-016', category: 'Experiment Logs', tags: ['prompt-injection', 'guardrails', 'false-positive', 'detection'], projects: ['project-guardrails'], meetings: ['meeting:guardrails-sprint-planning-mar3'], references: [], version: 'v2', status: 'current', sensitivity: 'internal', created_by: 'Aisha Hassan', owner: 'Aisha Hassan', created_date: daysAgo(64), staleness_flag: 'active' },
  { title: 'ClaimsBot: document extraction accuracy by file type', document_id: 'EXP-017', category: 'Experiment Logs', tags: ['claims', 'document-extraction', 'pdf', 'accuracy'], projects: ['project-claimsbot'], meetings: ['meeting:claimsbot-review-feb5'], references: [], version: 'v1', status: 'current', sensitivity: 'internal', created_by: 'Tomás Rivera', owner: 'Tomás Rivera', created_date: daysAgo(90), staleness_flag: 'active' },
  // Orphaned experiments
  { title: "raj's tokenizer experiment — DO NOT DELETE", document_id: 'EXP-018', category: 'Experiment Logs', tags: ['tokenizer', 'experiment', 'personal'], projects: ['project-atlas'], meetings: [], references: [], version: 'v1', status: 'current', sensitivity: 'internal', created_by: 'Raj Mehta', owner: 'Raj Mehta', created_date: daysAgo(350), staleness_flag: 'stale' },
  { title: 'fine-tune attempt 7 (abandoned?)', document_id: 'EXP-019', category: 'Experiment Logs', tags: ['fine-tuning', 'abandoned', 'draft'], projects: ['project-atlas'], meetings: [], references: [], version: 'v1', status: 'draft', sensitivity: 'internal', created_by: 'Raj Mehta', owner: 'Raj Mehta', created_date: daysAgo(320), staleness_flag: 'stale' },
  { title: 'Hannah — latency benchmarks (old infra)', document_id: 'EXP-020', category: 'Experiment Logs', tags: ['latency', 'benchmark', 'old-infra'], projects: ['project-atlas'], meetings: [], references: [], version: 'v1', status: 'current', sensitivity: 'internal', created_by: 'Hannah Kim', owner: 'Hannah Kim', created_date: daysAgo(450), staleness_flag: 'obsolete' },
  { title: 'Structured output: JSON mode vs tool_use for claims', document_id: 'EXP-021', category: 'Experiment Logs', tags: ['structured-output', 'json-mode', 'tool-use', 'claims'], projects: ['project-claimsbot'], meetings: ['meeting:claimsbot-review-feb5'], references: [], version: 'v1', status: 'current', sensitivity: 'internal', created_by: 'Tomás Rivera', owner: 'Tomás Rivera', created_date: daysAgo(90), staleness_flag: 'active' },
  { title: 'Reranker comparison: Cohere vs cross-encoder', document_id: 'EXP-022', category: 'Experiment Logs', tags: ['reranker', 'cohere', 'cross-encoder', 'retrieval'], projects: ['project-retrieval-v2'], meetings: ['meeting:retrieval-v2-design-review-dec3'], references: [], version: 'v1', status: 'current', sensitivity: 'internal', created_by: 'Samira Khalil', owner: 'Samira Khalil', created_date: daysAgo(155), staleness_flag: 'aging' },

  // ════════════════════════════════════════════════════════════════════════════
  // EVAL REPORTS (20 total)
  // ════════════════════════════════════════════════════════════════════════════

  { title: 'Weekly eval: support agent accuracy (Apr 28)', document_id: 'EVAL-001', category: 'Eval Reports', tags: ['eval', 'support-agent', 'accuracy', 'weekly-cadence'], projects: ['project-atlas'], meetings: ['meeting:weekly-sync-apr28'], references: [], version: 'v1', status: 'current', sensitivity: 'internal', created_by: 'Maya Chen', owner: 'Maya Chen', created_date: daysAgo(8), staleness_flag: 'active' },
  { title: 'Regression analysis post-deployment v2.4', document_id: 'EVAL-002', category: 'Eval Reports', tags: ['regression', 'deployment', 'v2.4', 'quality-check'], projects: ['project-atlas'], meetings: ['meeting:atlas-postdeploy-review-feb10', 'meeting:weekly-sync-feb11'], references: [], version: 'v1', status: 'current', sensitivity: 'internal', created_by: 'Jordan Hayes', owner: 'Jordan Hayes', created_date: daysAgo(85), staleness_flag: 'active' },
  { title: 'Human vs auto-eval agreement rates Q1', document_id: 'EVAL-003', category: 'Eval Reports', tags: ['eval-methodology', 'human-eval', 'auto-eval', 'agreement'], projects: ['project-eval-framework'], meetings: ['meeting:eval-framework-review-apr2', 'meeting:quarterly-review-apr7'], references: [], version: 'v2', status: 'current', sensitivity: 'internal', created_by: 'Priya Sharma', owner: 'Priya Sharma', created_date: daysAgo(34), staleness_flag: 'active' },
  { title: 'Hallucination rate by query category — March', document_id: 'EVAL-004', category: 'Eval Reports', tags: ['hallucination', 'safety', 'query-type', 'monthly-cadence'], projects: ['project-guardrails'], meetings: ['meeting:guardrails-standup-mar31', 'meeting:weekly-sync-apr7'], references: [], version: 'v1', status: 'current', sensitivity: 'internal', created_by: 'Aisha Hassan', owner: 'Aisha Hassan', created_date: daysAgo(36), staleness_flag: 'active' },
  { title: 'Agent performance: structured vs unstructured inputs', document_id: 'EVAL-005', category: 'Eval Reports', tags: ['eval', 'input-format', 'structured-data', 'agent-performance'], projects: ['project-atlas'], meetings: ['meeting:atlas-eval-review-mar17'], references: [], version: 'v1', status: 'current', sensitivity: 'internal', created_by: 'Chen Liu', owner: 'Chen Liu', created_date: daysAgo(50), staleness_flag: 'active' },
  { title: 'Weekly eval: Atlas accuracy (Apr 21)', document_id: 'EVAL-006', category: 'Eval Reports', tags: ['eval', 'support-agent', 'accuracy', 'weekly-cadence'], projects: ['project-atlas'], meetings: ['meeting:weekly-sync-apr21'], references: [], version: 'v1', status: 'current', sensitivity: 'internal', created_by: 'Priya Sharma', owner: 'Priya Sharma', created_date: daysAgo(15), staleness_flag: 'active' },
  { title: 'Weekly eval: Atlas accuracy (Apr 14)', document_id: 'EVAL-007', category: 'Eval Reports', tags: ['eval', 'support-agent', 'accuracy', 'weekly-cadence'], projects: ['project-atlas'], meetings: ['meeting:weekly-sync-apr14'], references: [], version: 'v1', status: 'current', sensitivity: 'internal', created_by: 'Priya Sharma', owner: 'Priya Sharma', created_date: daysAgo(22), staleness_flag: 'active' },
  { title: 'Weekly eval: Atlas accuracy (Mar 24)', document_id: 'EVAL-008', category: 'Eval Reports', tags: ['eval', 'support-agent', 'accuracy', 'weekly-cadence'], projects: ['project-atlas'], meetings: ['meeting:weekly-sync-mar24'], references: [], version: 'v1', status: 'current', sensitivity: 'internal', created_by: 'Priya Sharma', owner: 'Priya Sharma', created_date: daysAgo(43), staleness_flag: 'active' },
  { title: 'Weekly eval: Atlas accuracy (Mar 17)', document_id: 'EVAL-009', category: 'Eval Reports', tags: ['eval', 'support-agent', 'accuracy', 'weekly-cadence'], projects: ['project-atlas'], meetings: ['meeting:weekly-sync-mar17'], references: [], version: 'v1', status: 'current', sensitivity: 'internal', created_by: 'Priya Sharma', owner: 'Priya Sharma', created_date: daysAgo(50), staleness_flag: 'active' },
  { title: 'Weekly eval: Atlas accuracy (Mar 10)', document_id: 'EVAL-010', category: 'Eval Reports', tags: ['eval', 'support-agent', 'accuracy', 'weekly-cadence'], projects: ['project-atlas'], meetings: ['meeting:weekly-sync-mar10'], references: [], version: 'v1', status: 'current', sensitivity: 'internal', created_by: 'Priya Sharma', owner: 'Priya Sharma', created_date: daysAgo(57), staleness_flag: 'active' },
  { title: 'Eval: guardrails false positive rate — post-patch', document_id: 'EVAL-011', category: 'Eval Reports', tags: ['eval', 'guardrails', 'false-positive', 'post-patch'], projects: ['project-guardrails'], meetings: ['meeting:guardrails-standup-apr7'], references: [], version: 'v1', status: 'current', sensitivity: 'internal', created_by: 'Aisha Hassan', owner: 'Aisha Hassan', created_date: daysAgo(29), staleness_flag: 'active' },
  { title: 'ClaimsBot precision/recall — dataset v4', document_id: 'EVAL-012', category: 'Eval Reports', tags: ['eval', 'claims', 'precision', 'recall', 'dataset'], projects: ['project-claimsbot'], meetings: ['meeting:claimsbot-review-feb5'], references: [], version: 'v1', status: 'current', sensitivity: 'internal', created_by: 'Tomás Rivera', owner: 'Tomás Rivera', created_date: daysAgo(90), staleness_flag: 'active' },
  { title: 'Human-eval batch 12 — inter-annotator agreement', document_id: 'EVAL-013', category: 'Eval Reports', tags: ['human-eval', 'annotation', 'agreement', 'batch'], projects: ['project-eval-framework'], meetings: ['meeting:eval-framework-review-apr2'], references: [], version: 'v1', status: 'current', sensitivity: 'internal', created_by: 'Jordan Hayes', owner: 'Jordan Hayes', created_date: daysAgo(34), staleness_flag: 'active' },
  { title: 'Regression check: retrieval recall after reindex', document_id: 'EVAL-014', category: 'Eval Reports', tags: ['regression', 'retrieval', 'recall', 'reindex'], projects: ['project-retrieval-v2'], meetings: ['meeting:retrieval-v2-standup-dec10'], references: [], version: 'v1', status: 'current', sensitivity: 'internal', created_by: 'Samira Khalil', owner: 'Samira Khalil', created_date: daysAgo(148), staleness_flag: 'aging' },
  { title: 'Agent tone eval — Q1 customer satisfaction correlation', document_id: 'EVAL-015', category: 'Eval Reports', tags: ['tone', 'customer-satisfaction', 'correlation', 'quarterly'], projects: ['project-atlas'], meetings: ['meeting:quarterly-review-apr7'], references: [], version: 'v1', status: 'current', sensitivity: 'internal', created_by: 'Elena Volkov', owner: 'Elena Volkov', created_date: daysAgo(29), staleness_flag: 'active' },
  { title: 'Latency vs quality tradeoff — Haiku routing', document_id: 'EVAL-016', category: 'Eval Reports', tags: ['latency', 'quality', 'tradeoff', 'haiku', 'routing'], projects: ['project-model-registry'], meetings: ['meeting:model-eval-roundtable-mar10'], references: [], version: 'v1', status: 'current', sensitivity: 'internal', created_by: 'Chen Liu', owner: 'Chen Liu', created_date: daysAgo(57), staleness_flag: 'active' },
  { title: 'Eval: support agent on edge cases (billing disputes)', document_id: 'EVAL-017', category: 'Eval Reports', tags: ['eval', 'edge-cases', 'billing', 'support-agent'], projects: ['project-atlas'], meetings: ['meeting:atlas-eval-review-mar17'], references: [], version: 'v1', status: 'current', sensitivity: 'internal', created_by: 'Alex Park', owner: 'Alex Park', created_date: daysAgo(50), staleness_flag: 'active' },
  { title: 'ClaimsBot: end-to-end accuracy — Q4 dataset', document_id: 'EVAL-018', category: 'Eval Reports', tags: ['eval', 'claims', 'end-to-end', 'accuracy'], projects: ['project-claimsbot'], meetings: ['meeting:claimsbot-kickoff-jan15'], references: [], version: 'v1', status: 'current', sensitivity: 'internal', created_by: 'Tomás Rivera', owner: 'Tomás Rivera', created_date: daysAgo(112), staleness_flag: 'aging' },
  { title: 'Eval methodology: rubric v2 calibration results', document_id: 'EVAL-019', category: 'Eval Reports', tags: ['eval-methodology', 'rubric', 'calibration'], projects: ['project-eval-framework'], meetings: ['meeting:eval-framework-review-jan27'], references: [], version: 'v1', status: 'current', sensitivity: 'internal', created_by: 'Jordan Hayes', owner: 'Jordan Hayes', created_date: daysAgo(99), staleness_flag: 'active' },
  { title: 'OLD — eval results format (pre-pipeline rewrite)', document_id: 'EVAL-020', category: 'Eval Reports', tags: ['eval', 'old-format', 'deprecated'], projects: ['project-eval-framework'], meetings: [], references: [], version: 'v1', status: 'current', sensitivity: 'internal', created_by: 'Raj Mehta', owner: 'Raj Mehta', created_date: daysAgo(400), staleness_flag: 'obsolete' },

  // ════════════════════════════════════════════════════════════════════════════
  // RESEARCH NOTES (18 total)
  // ════════════════════════════════════════════════════════════════════════════

  { title: 'Paper summary: Constitutional AI implications for our guardrails', document_id: 'RES-001', category: 'Research Notes', tags: ['constitutional-ai', 'safety', 'guardrails', 'research'], projects: ['project-guardrails'], meetings: ['meeting:guardrails-sprint-planning-mar3'], references: [], version: 'v1', status: 'current', sensitivity: 'internal', created_by: 'Aisha Hassan', owner: 'Aisha Hassan', created_date: daysAgo(64), staleness_flag: 'active' },
  { title: 'Notes from Anthropic cookbook on tool use patterns', document_id: 'RES-002', category: 'Research Notes', tags: ['tool-use', 'anthropic', 'patterns', 'reference'], projects: ['project-atlas'], meetings: ['meeting:atlas-standup-feb18'], references: [], version: 'v1', status: 'current', sensitivity: 'internal', created_by: 'Dev Kapoor', owner: 'Dev Kapoor', created_date: daysAgo(77), staleness_flag: 'active' },
  { title: 'Competitor analysis: how Moveworks handles KB updates', document_id: 'RES-003', category: 'Research Notes', tags: ['competitor', 'moveworks', 'knowledge-base', 'analysis'], projects: ['project-kb-sync'], meetings: ['meeting:quarterly-review-jan6'], references: [], version: 'v1', status: 'current', sensitivity: 'team-only', created_by: 'Maya Chen', owner: 'Maya Chen', created_date: daysAgo(121), staleness_flag: 'aging' },
  { title: 'Ideas from NeurIPS — retrieval augmented generation panel', document_id: 'RES-004', category: 'Research Notes', tags: ['neurips', 'rag', 'research', 'ideas'], projects: ['project-retrieval-v2'], meetings: ['meeting:retrieval-v2-kickoff-oct22'], references: [], version: 'v1', status: 'current', sensitivity: 'internal', created_by: 'Samira Khalil', owner: 'Samira Khalil', created_date: daysAgo(197), staleness_flag: 'stale' },
  { title: "Samira's notes on graph-based memory architectures", document_id: 'RES-005', category: 'Research Notes', tags: ['graph', 'memory', 'architecture', 'research'], projects: ['project-retrieval-v2'], meetings: ['meeting:retrieval-v2-design-review-nov19'], references: [], version: 'v1', status: 'draft', sensitivity: 'internal', created_by: 'Samira Khalil', owner: 'Samira Khalil', created_date: daysAgo(169), staleness_flag: 'stale' },
  { title: 'Paper: Toolformer implications for our agent architecture', document_id: 'RES-006', category: 'Research Notes', tags: ['toolformer', 'agent', 'architecture', 'paper'], projects: ['project-atlas'], meetings: ['meeting:atlas-architecture-review-nov8'], references: [], version: 'v1', status: 'current', sensitivity: 'internal', created_by: 'Dev Kapoor', owner: 'Dev Kapoor', created_date: daysAgo(180), staleness_flag: 'aging' },
  { title: 'Paper: RLHF vs RLAIF — relevance to guardrails', document_id: 'RES-007', category: 'Research Notes', tags: ['rlhf', 'rlaif', 'alignment', 'guardrails', 'paper'], projects: ['project-guardrails'], meetings: ['meeting:guardrails-sprint-planning-mar3'], references: [], version: 'v1', status: 'current', sensitivity: 'internal', created_by: 'Aisha Hassan', owner: 'Aisha Hassan', created_date: daysAgo(64), staleness_flag: 'active' },
  { title: 'Competitor: Intercom Fin — how they handle KB updates', document_id: 'RES-008', category: 'Research Notes', tags: ['competitor', 'intercom', 'knowledge-base', 'analysis'], projects: ['project-kb-sync'], meetings: ['meeting:kb-sync-brainstorm-mar5'], references: [], version: 'v1', status: 'current', sensitivity: 'team-only', created_by: 'Maya Chen', owner: 'Maya Chen', created_date: daysAgo(62), staleness_flag: 'active' },
  { title: 'Competitor: Sierra — their escalation model', document_id: 'RES-009', category: 'Research Notes', tags: ['competitor', 'sierra', 'escalation', 'analysis'], projects: ['project-atlas'], meetings: ['meeting:atlas-brainstorm-jan15'], references: [], version: 'v1', status: 'current', sensitivity: 'team-only', created_by: 'Maya Chen', owner: 'Maya Chen', created_date: daysAgo(113), staleness_flag: 'aging' },
  { title: 'Notes from Anthropic office hours — Apr 2025', document_id: 'RES-010', category: 'Research Notes', tags: ['anthropic', 'office-hours', 'api', 'notes'], projects: ['project-atlas'], meetings: [], references: [], version: 'v1', status: 'current', sensitivity: 'internal', created_by: 'Dev Kapoor', owner: 'Dev Kapoor', created_date: daysAgo(25), staleness_flag: 'active' },
  { title: 'Ideas: could we use code generation for structured responses?', document_id: 'RES-011', category: 'Research Notes', tags: ['code-generation', 'structured-output', 'ideation'], projects: ['project-atlas'], meetings: [], references: [], version: 'v1', status: 'draft', sensitivity: 'internal', created_by: 'Dev Kapoor', owner: 'Dev Kapoor', created_date: daysAgo(40), staleness_flag: 'active' },
  { title: "Samira's reading list — retrieval papers Q4", document_id: 'RES-012', category: 'Research Notes', tags: ['reading-list', 'retrieval', 'papers', 'personal'], projects: ['project-retrieval-v2'], meetings: [], references: [], version: 'v1', status: 'current', sensitivity: 'internal', created_by: 'Samira Khalil', owner: 'Samira Khalil', created_date: daysAgo(200), staleness_flag: 'stale' },
  { title: "Liam's notes on agent memory (before he left)", document_id: 'RES-013', category: 'Research Notes', tags: ['agent', 'memory', 'architecture', 'personal'], projects: ['project-atlas'], meetings: [], references: [], version: 'v1', status: 'current', sensitivity: 'internal', created_by: "Liam O'Brien", owner: "Liam O'Brien", created_date: daysAgo(280), staleness_flag: 'stale' },
  { title: 'brainstorm: should agents cite sources?', document_id: 'RES-014', category: 'Research Notes', tags: ['citations', 'agent', 'transparency', 'ideation'], projects: ['project-atlas'], meetings: ['meeting:atlas-brainstorm-feb12'], references: [], version: 'v1', status: 'current', sensitivity: 'internal', created_by: 'Elena Volkov', owner: 'Elena Volkov', created_date: daysAgo(83), staleness_flag: 'active' },
  { title: 'Paper: ReAct — reasoning + acting in LLMs', document_id: 'RES-015', category: 'Research Notes', tags: ['react', 'reasoning', 'acting', 'paper', 'agent'], projects: ['project-atlas'], meetings: [], references: [], version: 'v1', status: 'current', sensitivity: 'internal', created_by: 'Samira Khalil', owner: 'Samira Khalil', created_date: daysAgo(250), staleness_flag: 'stale' },
  { title: 'Multimodal agents — vision use cases for support', document_id: 'RES-016', category: 'Research Notes', tags: ['multimodal', 'vision', 'support-agent', 'future'], projects: ['project-atlas'], meetings: ['meeting:atlas-brainstorm-jan15'], references: [], version: 'v1', status: 'draft', sensitivity: 'internal', created_by: 'Kai Nakamura', owner: 'Kai Nakamura', created_date: daysAgo(113), staleness_flag: 'aging' },
  { title: 'Cost modeling: per-query breakdown by model tier', document_id: 'RES-017', category: 'Research Notes', tags: ['cost', 'modeling', 'per-query', 'budget'], projects: ['project-model-registry'], meetings: ['meeting:budget-review-apr9'], references: [], version: 'v2', status: 'current', sensitivity: 'team-only', created_by: 'Maya Chen', owner: 'Maya Chen', created_date: daysAgo(27), staleness_flag: 'active' },
  { title: 'Hannah — literature review on eval methodologies', document_id: 'RES-018', category: 'Research Notes', tags: ['eval', 'literature-review', 'methodology'], projects: ['project-eval-framework'], meetings: [], references: [], version: 'v1', status: 'current', sensitivity: 'internal', created_by: 'Hannah Kim', owner: 'Hannah Kim', created_date: daysAgo(420), staleness_flag: 'obsolete' },

  // ════════════════════════════════════════════════════════════════════════════
  // INCIDENT REPORTS (16 total)
  // ════════════════════════════════════════════════════════════════════════════

  { title: 'Agent gave medical advice to customer (May 1)', document_id: 'INC-001', category: 'Incident Reports', tags: ['safety', 'out-of-scope', 'medical', 'incident'], projects: ['project-guardrails'], meetings: ['meeting:incident-review-may2'], references: [], version: 'v1', status: 'in review', sensitivity: 'client-restricted', created_by: 'Aisha Hassan', owner: 'Maya Chen', created_date: daysAgo(5), staleness_flag: 'active' },
  { title: 'Agent applied wrong discount — 40% instead of 4%', document_id: 'INC-002', category: 'Incident Reports', tags: ['accuracy', 'numerical-error', 'discount', 'incident'], projects: ['project-atlas'], meetings: ['meeting:incident-review-apr21', 'meeting:weekly-sync-apr21'], references: [], version: 'v1', status: 'current', sensitivity: 'internal', created_by: 'Jordan Hayes', owner: 'Jordan Hayes', created_date: daysAgo(15), staleness_flag: 'active' },
  { title: 'Customer received contradictory answers in same session', document_id: 'INC-003', category: 'Incident Reports', tags: ['consistency', 'multi-turn', 'contradiction', 'incident'], projects: ['project-atlas'], meetings: ['meeting:atlas-standup-apr15'], references: [], version: 'v1', status: 'current', sensitivity: 'internal', created_by: 'Alex Park', owner: 'Alex Park', created_date: daysAgo(21), staleness_flag: 'active' },
  { title: 'Agent bypassed escalation on billing dispute', document_id: 'INC-004', category: 'Incident Reports', tags: ['escalation', 'billing', 'routing-failure', 'incident'], projects: ['project-atlas'], meetings: ['meeting:incident-review-mar27'], references: [], version: 'v1', status: 'current', sensitivity: 'internal', created_by: 'Kai Nakamura', owner: 'Kai Nakamura', created_date: daysAgo(40), staleness_flag: 'active' },
  { title: 'False positive: flagged normal transaction as fraud', document_id: 'INC-005', category: 'Incident Reports', tags: ['false-positive', 'fraud-detection', 'precision', 'incident'], projects: ['project-claimsbot'], meetings: ['meeting:claimsbot-review-feb5'], references: [], version: 'v1', status: 'current', sensitivity: 'internal', created_by: 'Tomás Rivera', owner: 'Tomás Rivera', created_date: daysAgo(90), staleness_flag: 'active' },
  { title: 'Agent hallucinated a product that doesn\'t exist (Apr 3)', document_id: 'INC-006', category: 'Incident Reports', tags: ['hallucination', 'product', 'accuracy', 'incident'], projects: ['project-atlas'], meetings: ['meeting:incident-review-apr7'], references: [], version: 'v1', status: 'current', sensitivity: 'internal', created_by: 'Alex Park', owner: 'Alex Park', created_date: daysAgo(33), staleness_flag: 'active' },
  { title: 'Agent gave refund instructions for wrong country', document_id: 'INC-007', category: 'Incident Reports', tags: ['refund', 'localization', 'wrong-context', 'incident'], projects: ['project-atlas'], meetings: ['meeting:atlas-standup-mar5'], references: [], version: 'v1', status: 'current', sensitivity: 'internal', created_by: 'Kai Nakamura', owner: 'Kai Nakamura', created_date: daysAgo(62), staleness_flag: 'active' },
  { title: 'ClaimsBot approved claim outside policy — $12k exposure', document_id: 'INC-008', category: 'Incident Reports', tags: ['claims', 'policy-violation', 'financial-exposure', 'incident'], projects: ['project-claimsbot'], meetings: ['meeting:incident-review-mar27'], references: [], version: 'v1', status: 'current', sensitivity: 'client-restricted', created_by: 'Tomás Rivera', owner: 'Maya Chen', created_date: daysAgo(40), staleness_flag: 'active' },
  { title: 'Agent stuck in loop — 47 tool calls before timeout', document_id: 'INC-009', category: 'Incident Reports', tags: ['infinite-loop', 'tool-use', 'timeout', 'incident'], projects: ['project-atlas'], meetings: ['meeting:atlas-standup-feb18'], references: [], version: 'v1', status: 'current', sensitivity: 'internal', created_by: 'Dev Kapoor', owner: 'Dev Kapoor', created_date: daysAgo(77), staleness_flag: 'active' },
  { title: 'Customer PII surfaced in agent response to different customer', document_id: 'INC-010', category: 'Incident Reports', tags: ['pii', 'privacy', 'data-leak', 'incident'], projects: ['project-guardrails'], meetings: ['meeting:incident-review-mar20'], references: [], version: 'v1', status: 'current', sensitivity: 'client-restricted', created_by: 'Aisha Hassan', owner: 'Maya Chen', created_date: daysAgo(47), staleness_flag: 'active' },
  { title: 'Agent contradicted help center article on return window', document_id: 'INC-011', category: 'Incident Reports', tags: ['knowledge-base', 'contradiction', 'return-policy', 'incident'], projects: ['project-kb-sync'], meetings: ['meeting:kb-sync-standup-feb24'], references: [], version: 'v1', status: 'current', sensitivity: 'internal', created_by: 'Ben Torres', owner: 'Ben Torres', created_date: daysAgo(71), staleness_flag: 'active' },
  { title: 'Billing agent applied coupon to wrong account type', document_id: 'INC-012', category: 'Incident Reports', tags: ['billing', 'coupon', 'account-type', 'incident'], projects: ['project-atlas'], meetings: ['meeting:incident-review-apr21'], references: [], version: 'v1', status: 'current', sensitivity: 'internal', created_by: 'Kai Nakamura', owner: 'Kai Nakamura', created_date: daysAgo(15), staleness_flag: 'active' },
  { title: 'Agent refused valid request — over-triggered safety filter', document_id: 'INC-013', category: 'Incident Reports', tags: ['false-positive', 'safety-filter', 'refusal', 'incident'], projects: ['project-guardrails'], meetings: ['meeting:guardrails-standup-mar10'], references: [], version: 'v1', status: 'current', sensitivity: 'internal', created_by: 'Aisha Hassan', owner: 'Aisha Hassan', created_date: daysAgo(57), staleness_flag: 'active' },
  { title: 'Latency spike: 45s TTFT during Black Friday', document_id: 'INC-014', category: 'Incident Reports', tags: ['latency', 'ttft', 'black-friday', 'scaling', 'incident'], projects: ['project-atlas'], meetings: ['meeting:incident-review-jan8'], references: [], version: 'v1', status: 'current', sensitivity: 'internal', created_by: 'Marcus Williams', owner: 'Marcus Williams', created_date: daysAgo(119), staleness_flag: 'active' },
  { title: 'ClaimsBot sent email to wrong claimant — data breach', document_id: 'INC-015', category: 'Incident Reports', tags: ['claims', 'email', 'data-breach', 'privacy', 'incident'], projects: ['project-claimsbot'], meetings: ['meeting:incident-review-mar13'], references: [], version: 'v1', status: 'current', sensitivity: 'client-restricted', created_by: 'Tomás Rivera', owner: 'Maya Chen', created_date: daysAgo(55), staleness_flag: 'active' },
  { title: 'Agent exposed internal tool names to customer', document_id: 'INC-016', category: 'Incident Reports', tags: ['tool-use', 'information-leak', 'internal', 'incident'], projects: ['project-atlas'], meetings: ['meeting:atlas-standup-apr15'], references: [], version: 'v1', status: 'current', sensitivity: 'internal', created_by: 'Dev Kapoor', owner: 'Dev Kapoor', created_date: daysAgo(21), staleness_flag: 'active' },

  // ════════════════════════════════════════════════════════════════════════════
  // RUNBOOKS (16 total)
  // ════════════════════════════════════════════════════════════════════════════

  { title: 'How to deploy a new model to production', document_id: 'RUN-001', category: 'Runbooks', tags: ['deployment', 'model', 'production', 'how-to'], projects: ['project-atlas'], meetings: ['meeting:atlas-onboarding-session-sep8'], references: [], version: 'v3', status: 'current', sensitivity: 'internal', created_by: 'Marcus Williams', owner: 'Marcus Williams', created_date: daysAgo(241), staleness_flag: 'active' },
  { title: 'Rolling back a release — step by step', document_id: 'RUN-002', category: 'Runbooks', tags: ['rollback', 'release', 'production', 'how-to'], projects: ['project-atlas'], meetings: ['meeting:incident-review-jan8'], references: ['references:latency-spike-postmortem'], version: 'v2', status: 'current', sensitivity: 'internal', created_by: 'Marcus Williams', owner: 'Marcus Williams', created_date: daysAgo(200), staleness_flag: 'active' },
  { title: 'New client onboarding checklist', document_id: 'RUN-003', category: 'Runbooks', tags: ['onboarding', 'client', 'checklist', 'how-to'], projects: ['project-enterprise-rollout'], meetings: ['meeting:enterprise-process-review-dec15'], references: [], version: 'v2', status: 'current', sensitivity: 'team-only', created_by: 'Lucia Fernández', owner: 'Lucia Fernández', created_date: daysAgo(143), staleness_flag: 'active' },
  { title: 'How to re-run evals after KB change', document_id: 'RUN-004', category: 'Runbooks', tags: ['eval', 'knowledge-base', 'rerun', 'how-to'], projects: ['project-eval-framework'], meetings: ['meeting:eval-framework-review-jan27'], references: [], version: 'v1', status: 'current', sensitivity: 'internal', created_by: 'Priya Sharma', owner: 'Priya Sharma', created_date: daysAgo(99), staleness_flag: 'active' },
  { title: 'Setting up a new VPC for enterprise client', document_id: 'RUN-005', category: 'Runbooks', tags: ['vpc', 'enterprise', 'infrastructure', 'how-to'], projects: ['project-enterprise-rollout'], meetings: ['meeting:enterprise-process-review-dec15'], references: [], version: 'v1', status: 'current', sensitivity: 'team-only', created_by: 'Marcus Williams', owner: 'Marcus Williams', created_date: daysAgo(143), staleness_flag: 'aging' },
  { title: 'How to rotate API keys without downtime', document_id: 'RUN-006', category: 'Runbooks', tags: ['api-keys', 'rotation', 'zero-downtime', 'how-to'], projects: ['project-atlas'], meetings: ['meeting:atlas-onboarding-session-sep8'], references: [], version: 'v2', status: 'current', sensitivity: 'internal', created_by: 'Marcus Williams', owner: 'Marcus Williams', created_date: daysAgo(241), staleness_flag: 'active' },
  { title: 'Reindexing the knowledge base — step by step', document_id: 'RUN-007', category: 'Runbooks', tags: ['reindex', 'knowledge-base', 'step-by-step', 'how-to'], projects: ['project-kb-sync'], meetings: ['meeting:kb-sync-standup-feb24'], references: [], version: 'v3', status: 'current', sensitivity: 'internal', created_by: 'Ben Torres', owner: 'Ben Torres', created_date: daysAgo(130), staleness_flag: 'active' },
  { title: 'Adding a new tool to the agent (dev → prod)', document_id: 'RUN-008', category: 'Runbooks', tags: ['tool-use', 'agent', 'deployment', 'how-to'], projects: ['project-atlas'], meetings: ['meeting:atlas-standup-feb18'], references: [], version: 'v2', status: 'current', sensitivity: 'internal', created_by: 'Dev Kapoor', owner: 'Dev Kapoor', created_date: daysAgo(77), staleness_flag: 'active' },
  { title: 'Setting up eval pipeline for a new agent', document_id: 'RUN-009', category: 'Runbooks', tags: ['eval-pipeline', 'setup', 'new-agent', 'how-to'], projects: ['project-eval-framework'], meetings: ['meeting:eval-framework-review-jan27'], references: [], version: 'v1', status: 'current', sensitivity: 'internal', created_by: 'Jordan Hayes', owner: 'Jordan Hayes', created_date: daysAgo(99), staleness_flag: 'active' },
  { title: 'How to investigate a hallucination report', document_id: 'RUN-010', category: 'Runbooks', tags: ['hallucination', 'investigation', 'debugging', 'how-to'], projects: ['project-atlas'], meetings: ['meeting:incident-review-mar13'], references: [], version: 'v1', status: 'current', sensitivity: 'internal', created_by: 'Alex Park', owner: 'Alex Park', created_date: daysAgo(55), staleness_flag: 'active' },
  { title: 'Client onboarding: data pipeline setup', document_id: 'RUN-011', category: 'Runbooks', tags: ['client', 'data-pipeline', 'onboarding', 'how-to'], projects: ['project-enterprise-rollout'], meetings: ['meeting:enterprise-process-review-dec15'], references: [], version: 'v1', status: 'current', sensitivity: 'team-only', created_by: 'Lucia Fernández', owner: 'Lucia Fernández', created_date: daysAgo(143), staleness_flag: 'active' },
  { title: 'Emergency rollback: agent prompt', document_id: 'RUN-012', category: 'Runbooks', tags: ['emergency', 'rollback', 'prompt', 'how-to'], projects: ['project-atlas'], meetings: ['meeting:incident-review-mar27'], references: [], version: 'v1', status: 'current', sensitivity: 'internal', created_by: 'Marcus Williams', owner: 'Marcus Williams', created_date: daysAgo(40), staleness_flag: 'active' },
  { title: 'How to add a new guardrail rule', document_id: 'RUN-013', category: 'Runbooks', tags: ['guardrails', 'rule', 'configuration', 'how-to'], projects: ['project-guardrails'], meetings: ['meeting:guardrails-sprint-planning-mar3'], references: [], version: 'v1', status: 'current', sensitivity: 'internal', created_by: 'Aisha Hassan', owner: 'Aisha Hassan', created_date: daysAgo(64), staleness_flag: 'active' },
  { title: 'Troubleshooting: agent not using updated KB', document_id: 'RUN-014', category: 'Runbooks', tags: ['troubleshooting', 'knowledge-base', 'staleness', 'how-to'], projects: ['project-kb-sync'], meetings: ['meeting:kb-sync-standup-feb24'], references: [], version: 'v2', status: 'current', sensitivity: 'internal', created_by: 'Ben Torres', owner: 'Ben Torres', created_date: daysAgo(71), staleness_flag: 'active' },
  { title: 'GPU cluster: requesting spot instances for fine-tuning', document_id: 'RUN-015', category: 'Runbooks', tags: ['gpu', 'spot-instances', 'fine-tuning', 'infrastructure'], projects: ['project-claimsbot'], meetings: [], references: [], version: 'v1', status: 'current', sensitivity: 'internal', created_by: 'Marcus Williams', owner: 'Marcus Williams', created_date: daysAgo(180), staleness_flag: 'aging' },
  { title: "How to run the weekly eval (Liam's doc — may be outdated)", document_id: 'RUN-016', category: 'Runbooks', tags: ['eval', 'weekly', 'how-to', 'outdated'], projects: ['project-eval-framework'], meetings: [], references: [], version: 'v1', status: 'current', sensitivity: 'internal', created_by: "Liam O'Brien", owner: "Liam O'Brien", created_date: daysAgo(300), staleness_flag: 'stale' },

  // ════════════════════════════════════════════════════════════════════════════
  // INTEGRATION NOTES (15 total)
  // ════════════════════════════════════════════════════════════════════════════

  { title: 'Client A onboarding: SSO quirks and workarounds', document_id: 'INT-001', category: 'Integration Notes', tags: ['client-a', 'sso', 'authentication', 'onboarding'], projects: ['project-enterprise-rollout'], meetings: ['meeting:client-a-kickoff-oct1'], references: [], version: 'v2', status: 'current', sensitivity: 'client-restricted', created_by: 'Lucia Fernández', owner: 'Lucia Fernández', created_date: daysAgo(218), staleness_flag: 'aging' },
  { title: 'Client B: custom taxonomy mapping for their ticket system', document_id: 'INT-002', category: 'Integration Notes', tags: ['client-b', 'taxonomy', 'ticketing', 'customization'], projects: ['project-enterprise-rollout'], meetings: ['meeting:client-b-onboarding-nov5'], references: [], version: 'v1', status: 'current', sensitivity: 'client-restricted', created_by: 'Lucia Fernández', owner: 'Lucia Fernández', created_date: daysAgo(183), staleness_flag: 'aging' },
  { title: 'Client C data pipeline — known encoding issues', document_id: 'INT-003', category: 'Integration Notes', tags: ['client-c', 'data-pipeline', 'encoding', 'bug'], projects: ['project-enterprise-rollout'], meetings: ['meeting:client-c-troubleshooting-feb19', 'meeting:weekly-sync-feb24'], references: [], version: 'v3', status: 'in review', sensitivity: 'client-restricted', created_by: 'Marcus Williams', owner: 'Lucia Fernández', created_date: daysAgo(76), staleness_flag: 'active' },
  { title: 'HubSpot integration: field mapping reference', document_id: 'INT-004', category: 'Integration Notes', tags: ['hubspot', 'integration', 'field-mapping', 'reference'], projects: ['project-integrations'], meetings: ['meeting:integrations-planning-dec9'], references: [], version: 'v1', status: 'current', sensitivity: 'internal', created_by: 'Ben Torres', owner: 'Ben Torres', created_date: daysAgo(149), staleness_flag: 'aging' },
  { title: 'Zendesk webhook setup — what actually works', document_id: 'INT-005', category: 'Integration Notes', tags: ['zendesk', 'webhook', 'integration', 'workaround'], projects: ['project-integrations'], meetings: ['meeting:integrations-planning-jan13'], references: [], version: 'v2', status: 'current', sensitivity: 'internal', created_by: 'Ben Torres', owner: 'Ben Torres', created_date: daysAgo(114), staleness_flag: 'active' },
  { title: 'Client A: custom PII redaction requirements', document_id: 'INT-006', category: 'Integration Notes', tags: ['client-a', 'pii', 'redaction', 'requirements'], projects: ['project-enterprise-rollout'], meetings: ['meeting:client-a-kickoff-oct1'], references: [], version: 'v1', status: 'current', sensitivity: 'client-restricted', created_by: 'Lucia Fernández', owner: 'Lucia Fernández', created_date: daysAgo(218), staleness_flag: 'aging' },
  { title: 'Client B: Salesforce field mapping (OUTDATED?)', document_id: 'INT-007', category: 'Integration Notes', tags: ['client-b', 'salesforce', 'field-mapping', 'outdated'], projects: ['project-enterprise-rollout'], meetings: ['meeting:client-b-onboarding-nov5'], references: [], version: 'v1', status: 'current', sensitivity: 'client-restricted', created_by: 'Lucia Fernández', owner: 'Lucia Fernández', created_date: daysAgo(183), staleness_flag: 'stale' },
  { title: 'Client C: encoding fix attempt 2 — results', document_id: 'INT-008', category: 'Integration Notes', tags: ['client-c', 'encoding', 'fix', 'results'], projects: ['project-enterprise-rollout'], meetings: ['meeting:client-c-troubleshooting-feb19'], references: [], version: 'v1', status: 'current', sensitivity: 'client-restricted', created_by: 'Marcus Williams', owner: 'Marcus Williams', created_date: daysAgo(76), staleness_flag: 'active' },
  { title: 'Client D onboarding — paused pending contract', document_id: 'INT-009', category: 'Integration Notes', tags: ['client-d', 'onboarding', 'paused', 'contract'], projects: ['project-enterprise-rollout'], meetings: [], references: [], version: 'v1', status: 'draft', sensitivity: 'client-restricted', created_by: 'Lucia Fernández', owner: 'Lucia Fernández', created_date: daysAgo(30), staleness_flag: 'active' },
  { title: 'Slack integration: message format quirks', document_id: 'INT-010', category: 'Integration Notes', tags: ['slack', 'integration', 'message-format', 'quirks'], projects: ['project-integrations'], meetings: ['meeting:integrations-planning-jan13'], references: [], version: 'v1', status: 'current', sensitivity: 'internal', created_by: 'Ben Torres', owner: 'Ben Torres', created_date: daysAgo(114), staleness_flag: 'active' },
  { title: 'HubSpot: ticket creation via webhook — rate limits', document_id: 'INT-011', category: 'Integration Notes', tags: ['hubspot', 'webhook', 'rate-limit', 'ticket-creation'], projects: ['project-integrations'], meetings: ['meeting:integrations-planning-dec9'], references: [], version: 'v1', status: 'current', sensitivity: 'internal', created_by: 'Ben Torres', owner: 'Ben Torres', created_date: daysAgo(149), staleness_flag: 'aging' },
  { title: 'Zendesk: sandbox vs production API differences', document_id: 'INT-012', category: 'Integration Notes', tags: ['zendesk', 'sandbox', 'production', 'api-differences'], projects: ['project-integrations'], meetings: ['meeting:integrations-planning-jan13'], references: [], version: 'v1', status: 'current', sensitivity: 'internal', created_by: 'Ben Torres', owner: 'Ben Torres', created_date: daysAgo(114), staleness_flag: 'active' },
  { title: 'Client A: QBR prep — usage stats Q1', document_id: 'INT-013', category: 'Integration Notes', tags: ['client-a', 'qbr', 'usage-stats', 'quarterly'], projects: ['project-enterprise-rollout'], meetings: ['meeting:quarterly-review-apr7'], references: [], version: 'v1', status: 'current', sensitivity: 'client-restricted', created_by: 'Lucia Fernández', owner: 'Lucia Fernández', created_date: daysAgo(29), staleness_flag: 'active' },
  { title: 'SSO debug log — Client B IdP issues', document_id: 'INT-014', category: 'Integration Notes', tags: ['client-b', 'sso', 'idp', 'debugging'], projects: ['project-enterprise-rollout'], meetings: [], references: [], version: 'v1', status: 'current', sensitivity: 'client-restricted', created_by: 'Marcus Williams', owner: 'Lucia Fernández', created_date: daysAgo(160), staleness_flag: 'stale' },
  { title: 'API versioning: what happens when client is on v1', document_id: 'INT-015', category: 'Integration Notes', tags: ['api', 'versioning', 'backwards-compatibility', 'reference'], projects: ['project-integrations'], meetings: [], references: [], version: 'v1', status: 'current', sensitivity: 'internal', created_by: 'Marcus Williams', owner: 'Marcus Williams', created_date: daysAgo(200), staleness_flag: 'aging' },

  // ════════════════════════════════════════════════════════════════════════════
  // PROMPT LIBRARIES (14 total)
  // ════════════════════════════════════════════════════════════════════════════

  { title: 'System prompt: customer support agent (CURRENT)', document_id: 'PROMPT-001', category: 'Prompt Libraries', tags: ['prompt', 'support-agent', 'production', 'current'], projects: ['project-atlas'], meetings: ['meeting:atlas-prompt-review-apr14'], references: [], version: 'v7', status: 'current', sensitivity: 'team-only', created_by: 'Maya Chen', owner: 'Maya Chen', created_date: daysAgo(210), staleness_flag: 'active' },
  { title: 'System prompt: support agent (old — do not use)', document_id: 'PROMPT-002', category: 'Prompt Libraries', tags: ['prompt', 'support-agent', 'deprecated', 'archived'], projects: ['project-atlas'], meetings: ['meeting:atlas-prompt-review-feb3'], references: [], version: 'v5', status: 'deprecated', sensitivity: 'team-only', created_by: 'Maya Chen', owner: 'Maya Chen', created_date: daysAgo(300), staleness_flag: 'obsolete' },
  { title: 'Few-shot examples for refund classification', document_id: 'PROMPT-003', category: 'Prompt Libraries', tags: ['few-shot', 'refund', 'classification', 'prompt-engineering'], projects: ['project-atlas'], meetings: ['meeting:atlas-standup-dec11'], references: [], version: 'v3', status: 'current', sensitivity: 'internal', created_by: 'Tomás Rivera', owner: 'Tomás Rivera', created_date: daysAgo(147), staleness_flag: 'active' },
  { title: 'Chain-of-thought template for escalation routing', document_id: 'PROMPT-004', category: 'Prompt Libraries', tags: ['cot', 'escalation', 'routing', 'prompt-engineering'], projects: ['project-atlas'], meetings: ['meeting:atlas-architecture-review-nov8'], references: [], version: 'v2', status: 'current', sensitivity: 'internal', created_by: 'Alex Park', owner: 'Alex Park', created_date: daysAgo(180), staleness_flag: 'aging' },
  { title: 'Jailbreak resistance prompt — v3 draft', document_id: 'PROMPT-005', category: 'Prompt Libraries', tags: ['safety', 'jailbreak', 'guardrails', 'draft'], projects: ['project-guardrails'], meetings: ['meeting:guardrails-sprint-planning-mar3'], references: [], version: 'v3', status: 'draft', sensitivity: 'team-only', created_by: 'Aisha Hassan', owner: 'Aisha Hassan', created_date: daysAgo(64), staleness_flag: 'active' },
  { title: 'System prompt: claims agent v4 (CURRENT)', document_id: 'PROMPT-006', category: 'Prompt Libraries', tags: ['prompt', 'claims-agent', 'production', 'current'], projects: ['project-claimsbot'], meetings: ['meeting:claimsbot-review-feb5'], references: [], version: 'v4', status: 'current', sensitivity: 'team-only', created_by: 'Tomás Rivera', owner: 'Tomás Rivera', created_date: daysAgo(90), staleness_flag: 'active' },
  { title: 'System prompt: claims agent v3 (deprecated)', document_id: 'PROMPT-007', category: 'Prompt Libraries', tags: ['prompt', 'claims-agent', 'deprecated'], projects: ['project-claimsbot'], meetings: ['meeting:claimsbot-kickoff-jan15'], references: [], version: 'v3', status: 'deprecated', sensitivity: 'team-only', created_by: 'Tomás Rivera', owner: 'Tomás Rivera', created_date: daysAgo(200), staleness_flag: 'obsolete' },
  { title: 'System prompt: claims agent v2 (do not use)', document_id: 'PROMPT-008', category: 'Prompt Libraries', tags: ['prompt', 'claims-agent', 'deprecated', 'archived'], projects: ['project-claimsbot'], meetings: [], references: [], version: 'v2', status: 'deprecated', sensitivity: 'team-only', created_by: "Liam O'Brien", owner: 'Tomás Rivera', created_date: daysAgo(400), staleness_flag: 'obsolete' },
  { title: 'Guardrails meta-prompt: content filter v2', document_id: 'PROMPT-009', category: 'Prompt Libraries', tags: ['guardrails', 'content-filter', 'meta-prompt', 'safety'], projects: ['project-guardrails'], meetings: ['meeting:guardrails-sprint-planning-mar24'], references: [], version: 'v2', status: 'current', sensitivity: 'team-only', created_by: 'Aisha Hassan', owner: 'Aisha Hassan', created_date: daysAgo(43), staleness_flag: 'active' },
  { title: 'Few-shot: ticket priority classification', document_id: 'PROMPT-010', category: 'Prompt Libraries', tags: ['few-shot', 'priority', 'classification', 'ticket'], projects: ['project-atlas'], meetings: ['meeting:atlas-standup-dec4'], references: [], version: 'v2', status: 'current', sensitivity: 'internal', created_by: 'Priya Sharma', owner: 'Priya Sharma', created_date: daysAgo(154), staleness_flag: 'aging' },
  { title: 'Tool-use preamble: search + retrieve', document_id: 'PROMPT-011', category: 'Prompt Libraries', tags: ['tool-use', 'search', 'retrieve', 'preamble'], projects: ['project-atlas'], meetings: ['meeting:atlas-standup-feb18'], references: [], version: 'v3', status: 'current', sensitivity: 'internal', created_by: 'Dev Kapoor', owner: 'Dev Kapoor', created_date: daysAgo(77), staleness_flag: 'active' },
  { title: 'Persona prompt: enterprise tone (Client A)', document_id: 'PROMPT-012', category: 'Prompt Libraries', tags: ['persona', 'enterprise', 'tone', 'client-a'], projects: ['project-enterprise-rollout'], meetings: ['meeting:client-a-kickoff-oct1'], references: [], version: 'v1', status: 'current', sensitivity: 'client-restricted', created_by: 'Lucia Fernández', owner: 'Lucia Fernández', created_date: daysAgo(218), staleness_flag: 'aging' },
  { title: 'DRAFT — new escalation prompt (untested)', document_id: 'PROMPT-013', category: 'Prompt Libraries', tags: ['escalation', 'draft', 'untested', 'wip'], projects: ['project-atlas'], meetings: [], references: [], version: 'v1', status: 'draft', sensitivity: 'internal', created_by: 'Alex Park', owner: 'Alex Park', created_date: daysAgo(10), staleness_flag: 'active' },
  { title: "Liam's prompt experiments (personal folder)", document_id: 'PROMPT-014', category: 'Prompt Libraries', tags: ['prompt', 'experiments', 'personal', 'old'], projects: ['project-atlas'], meetings: [], references: [], version: 'v1', status: 'current', sensitivity: 'internal', created_by: "Liam O'Brien", owner: "Liam O'Brien", created_date: daysAgo(350), staleness_flag: 'stale' },

  // ════════════════════════════════════════════════════════════════════════════
  // ARCHITECTURE DECISION RECORDS (12 total)
  // ════════════════════════════════════════════════════════════════════════════

  { title: 'ADR-017: Why we chose RAG over fine-tuning', document_id: 'ADR-017', category: 'Architecture Decision Records', tags: ['rag', 'fine-tuning', 'architecture', 'decision'], projects: ['project-retrieval-v2'], meetings: ['meeting:retrieval-v2-kickoff-oct22', 'meeting:all-hands-nov1'], references: [], version: 'v1', status: 'current', sensitivity: 'internal', created_by: 'Samira Khalil', owner: 'Samira Khalil', created_date: daysAgo(197), staleness_flag: 'active' },
  { title: 'ADR-018: Event-driven eval pipeline', document_id: 'ADR-018', category: 'Architecture Decision Records', tags: ['eval-pipeline', 'event-driven', 'architecture', 'decision'], projects: ['project-eval-framework'], meetings: ['meeting:eval-framework-review-jan27'], references: [], version: 'v1', status: 'current', sensitivity: 'internal', created_by: 'Jordan Hayes', owner: 'Jordan Hayes', created_date: daysAgo(99), staleness_flag: 'active' },
  { title: 'ADR-021: Switching to chunking by semantic boundary', document_id: 'ADR-021', category: 'Architecture Decision Records', tags: ['chunking', 'retrieval', 'semantic', 'architecture'], projects: ['project-retrieval-v2'], meetings: ['meeting:retrieval-v2-design-review-nov19'], references: [], version: 'v1', status: 'current', sensitivity: 'internal', created_by: 'Samira Khalil', owner: 'Samira Khalil', created_date: daysAgo(169), staleness_flag: 'active' },
  { title: 'ADR-022: Knowledge base versioning strategy', document_id: 'ADR-022', category: 'Architecture Decision Records', tags: ['knowledge-base', 'versioning', 'architecture', 'decision'], projects: ['project-kb-sync'], meetings: ['meeting:kb-sync-brainstorm-mar5'], references: [], version: 'v1', status: 'current', sensitivity: 'internal', created_by: 'Ben Torres', owner: 'Ben Torres', created_date: daysAgo(62), staleness_flag: 'active' },
  { title: 'ADR-024: Separate retrieval model vs shared embeddings', document_id: 'ADR-024', category: 'Architecture Decision Records', tags: ['retrieval', 'embeddings', 'architecture', 'decision'], projects: ['project-retrieval-v2'], meetings: ['meeting:retrieval-v2-design-review-dec3'], references: [], version: 'v1', status: 'current', sensitivity: 'internal', created_by: 'Samira Khalil', owner: 'Chen Liu', created_date: daysAgo(155), staleness_flag: 'active' },
  { title: 'ADR-025: Multi-agent vs single-agent architecture', document_id: 'ADR-025', category: 'Architecture Decision Records', tags: ['multi-agent', 'single-agent', 'architecture', 'decision'], projects: ['project-atlas'], meetings: ['meeting:atlas-brainstorm-jan15'], references: [], version: 'v1', status: 'current', sensitivity: 'internal', created_by: 'Samira Khalil', owner: 'Maya Chen', created_date: daysAgo(113), staleness_flag: 'active' },
  { title: 'ADR-027: Guardrails as middleware vs inline', document_id: 'ADR-027', category: 'Architecture Decision Records', tags: ['guardrails', 'middleware', 'inline', 'architecture'], projects: ['project-guardrails'], meetings: ['meeting:guardrails-sprint-planning-mar3'], references: [], version: 'v1', status: 'current', sensitivity: 'internal', created_by: 'Aisha Hassan', owner: 'Aisha Hassan', created_date: daysAgo(64), staleness_flag: 'active' },
  { title: 'ADR-029: Moving eval pipeline to async', document_id: 'ADR-029', category: 'Architecture Decision Records', tags: ['eval-pipeline', 'infrastructure', 'async', 'performance'], projects: ['project-eval-framework'], meetings: ['meeting:eval-framework-review-jan27'], references: [], version: 'v2', status: 'current', sensitivity: 'internal', created_by: 'Jordan Hayes', owner: 'Jordan Hayes', created_date: daysAgo(99), staleness_flag: 'active' },
  { title: 'ADR-030: Streaming responses — chunked vs SSE', document_id: 'ADR-030', category: 'Architecture Decision Records', tags: ['streaming', 'chunked', 'sse', 'architecture'], projects: ['project-atlas'], meetings: ['meeting:atlas-design-review-apr10'], references: [], version: 'v1', status: 'current', sensitivity: 'internal', created_by: 'Marcus Williams', owner: 'Marcus Williams', created_date: daysAgo(26), staleness_flag: 'active' },
  { title: 'ADR-031: Observability stack — Datadog vs custom', document_id: 'ADR-031', category: 'Architecture Decision Records', tags: ['observability', 'datadog', 'monitoring', 'architecture'], projects: ['project-atlas'], meetings: ['meeting:atlas-standup-apr15'], references: [], version: 'v1', status: 'in review', sensitivity: 'internal', created_by: 'Marcus Williams', owner: 'Marcus Williams', created_date: daysAgo(21), staleness_flag: 'active' },
  { title: 'ADR-032: Agent tool permissions model', document_id: 'ADR-032', category: 'Architecture Decision Records', tags: ['tool-use', 'permissions', 'security', 'architecture'], projects: ['project-atlas', 'project-guardrails'], meetings: ['meeting:atlas-design-review-apr10'], references: [], version: 'v1', status: 'draft', sensitivity: 'internal', created_by: 'Dev Kapoor', owner: 'Maya Chen', created_date: daysAgo(26), staleness_flag: 'active' },
  { title: 'Why we dropped LangChain — notes from Tomás', document_id: 'ADR-MISC-001', category: 'Architecture Decision Records', tags: ['langchain', 'framework', 'migration', 'decision'], projects: ['project-atlas'], meetings: ['meeting:atlas-retro-sep15'], references: [], version: 'v1', status: 'current', sensitivity: 'internal', created_by: 'Tomás Rivera', owner: 'Tomás Rivera', created_date: daysAgo(234), staleness_flag: 'aging' },

  // ════════════════════════════════════════════════════════════════════════════
  // DEPLOYMENT POSTMORTEMS (10 total)
  // ════════════════════════════════════════════════════════════════════════════

  { title: 'Postmortem: agent hallucinating after KB update (Mar 12)', document_id: 'PM-001', category: 'Deployment Postmortems', tags: ['hallucination', 'knowledge-base', 'deployment', 'incident'], projects: ['project-atlas'], meetings: ['meeting:incident-review-mar13', 'meeting:weekly-sync-mar17'], references: [], version: 'v1', status: 'current', sensitivity: 'internal', created_by: 'Jordan Hayes', owner: 'Maya Chen', created_date: daysAgo(55), staleness_flag: 'active' },
  { title: 'Postmortem: latency spike during peak traffic', document_id: 'PM-002', category: 'Deployment Postmortems', tags: ['latency', 'scaling', 'production', 'infrastructure'], projects: ['project-atlas'], meetings: ['meeting:incident-review-jan8'], references: [], version: 'v1', status: 'current', sensitivity: 'internal', created_by: 'Marcus Williams', owner: 'Marcus Williams', created_date: daysAgo(119), staleness_flag: 'active' },
  { title: 'Postmortem: wrong refund amount — chunking overlap issue', document_id: 'PM-003', category: 'Deployment Postmortems', tags: ['chunking', 'refund', 'retrieval-error', 'incident'], projects: ['project-retrieval-v2'], meetings: ['meeting:incident-review-nov25', 'meeting:retrieval-v2-design-review-dec3'], references: [], version: 'v1', status: 'current', sensitivity: 'internal', created_by: 'Samira Khalil', owner: 'Samira Khalil', created_date: daysAgo(163), staleness_flag: 'aging' },
  { title: 'Root cause: agent ignoring updated return policy', document_id: 'PM-004', category: 'Deployment Postmortems', tags: ['knowledge-base', 'staleness', 'policy', 'retrieval'], projects: ['project-kb-sync'], meetings: ['meeting:kb-sync-standup-feb24'], references: [], version: 'v1', status: 'current', sensitivity: 'internal', created_by: 'Ben Torres', owner: 'Ben Torres', created_date: daysAgo(71), staleness_flag: 'active' },
  { title: 'Incident debrief: PII leak in agent response', document_id: 'PM-005', category: 'Deployment Postmortems', tags: ['pii', 'safety', 'privacy', 'incident'], projects: ['project-guardrails'], meetings: ['meeting:incident-review-mar20', 'meeting:guardrails-sprint-planning-mar24'], references: [], version: 'v1', status: 'current', sensitivity: 'client-restricted', created_by: 'Aisha Hassan', owner: 'Maya Chen', created_date: daysAgo(47), staleness_flag: 'active' },
  { title: 'Postmortem: KB reindex caused 2hr agent downtime', document_id: 'PM-006', category: 'Deployment Postmortems', tags: ['reindex', 'downtime', 'knowledge-base', 'deployment'], projects: ['project-kb-sync'], meetings: ['meeting:incident-review-mar27'], references: [], version: 'v1', status: 'current', sensitivity: 'internal', created_by: 'Ben Torres', owner: 'Ben Torres', created_date: daysAgo(40), staleness_flag: 'active' },
  { title: 'Postmortem: prompt injection via customer name field', document_id: 'PM-007', category: 'Deployment Postmortems', tags: ['prompt-injection', 'security', 'customer-input', 'incident'], projects: ['project-guardrails'], meetings: ['meeting:guardrails-standup-apr7'], references: [], version: 'v1', status: 'current', sensitivity: 'internal', created_by: 'Aisha Hassan', owner: 'Aisha Hassan', created_date: daysAgo(29), staleness_flag: 'active' },
  { title: 'Postmortem: eval pipeline OOM on large batch', document_id: 'PM-008', category: 'Deployment Postmortems', tags: ['eval-pipeline', 'oom', 'memory', 'infrastructure'], projects: ['project-eval-framework'], meetings: ['meeting:eval-framework-retro-feb17'], references: [], version: 'v1', status: 'current', sensitivity: 'internal', created_by: 'Jordan Hayes', owner: 'Jordan Hayes', created_date: daysAgo(78), staleness_flag: 'active' },
  { title: 'Postmortem: agent used training data as real answer', document_id: 'PM-009', category: 'Deployment Postmortems', tags: ['training-data', 'hallucination', 'contamination', 'incident'], projects: ['project-atlas'], meetings: ['meeting:atlas-standup-feb3'], references: [], version: 'v1', status: 'current', sensitivity: 'internal', created_by: 'Alex Park', owner: 'Alex Park', created_date: daysAgo(92), staleness_flag: 'active' },
  { title: 'Postmortem: rate limit hit on Anthropic API — cascade failure', document_id: 'PM-010', category: 'Deployment Postmortems', tags: ['rate-limit', 'anthropic-api', 'cascade', 'infrastructure'], projects: ['project-atlas'], meetings: ['meeting:incident-review-apr7'], references: [], version: 'v1', status: 'current', sensitivity: 'internal', created_by: 'Marcus Williams', owner: 'Marcus Williams', created_date: daysAgo(29), staleness_flag: 'active' },

  // ════════════════════════════════════════════════════════════════════════════
  // MODEL CARDS (9 total)
  // ════════════════════════════════════════════════════════════════════════════

  { title: 'Model card: Sonnet 4 for classification tasks', document_id: 'MC-001', category: 'Model Cards', tags: ['sonnet', 'classification', 'model-card', 'capabilities'], projects: ['project-model-registry'], meetings: ['meeting:model-eval-roundtable-mar10'], references: [], version: 'v2', status: 'current', sensitivity: 'internal', created_by: 'Chen Liu', owner: 'Chen Liu', created_date: daysAgo(57), staleness_flag: 'active' },
  { title: 'Model card: Haiku for high-volume routing', document_id: 'MC-002', category: 'Model Cards', tags: ['haiku', 'routing', 'throughput', 'model-card'], projects: ['project-model-registry'], meetings: ['meeting:model-eval-roundtable-mar10'], references: [], version: 'v1', status: 'current', sensitivity: 'internal', created_by: 'Chen Liu', owner: 'Chen Liu', created_date: daysAgo(57), staleness_flag: 'active' },
  { title: 'Opus vs Sonnet cost-performance tradeoff matrix', document_id: 'MC-003', category: 'Model Cards', tags: ['opus', 'sonnet', 'cost', 'model-selection'], projects: ['project-model-registry'], meetings: ['meeting:quarterly-review-apr7', 'meeting:budget-review-apr9'], references: [], version: 'v3', status: 'current', sensitivity: 'team-only', created_by: 'Maya Chen', owner: 'Maya Chen', created_date: daysAgo(120), staleness_flag: 'active' },
  { title: 'Known failure modes: Sonnet on ambiguous instructions', document_id: 'MC-004', category: 'Model Cards', tags: ['sonnet', 'failure-modes', 'ambiguity', 'limitations'], projects: ['project-model-registry'], meetings: ['meeting:atlas-eval-review-mar17'], references: [], version: 'v1', status: 'current', sensitivity: 'internal', created_by: 'Priya Sharma', owner: 'Priya Sharma', created_date: daysAgo(50), staleness_flag: 'active' },
  { title: 'Model selection guide — when to use what', document_id: 'MC-005', category: 'Model Cards', tags: ['model-selection', 'guide', 'reference', 'decision'], projects: ['project-model-registry'], meetings: ['meeting:all-hands-apr1'], references: [], version: 'v4', status: 'current', sensitivity: 'internal', created_by: 'Maya Chen', owner: 'Maya Chen', created_date: daysAgo(180), staleness_flag: 'active' },
  { title: 'Model card: Claude 3.5 Sonnet for support (supersedes Claude 3)', document_id: 'MC-006', category: 'Model Cards', tags: ['claude-3.5', 'sonnet', 'support-agent', 'model-card'], projects: ['project-model-registry'], meetings: ['meeting:model-eval-roundtable-mar10'], references: [], version: 'v1', status: 'current', sensitivity: 'internal', created_by: 'Chen Liu', owner: 'Chen Liu', created_date: daysAgo(57), staleness_flag: 'active' },
  { title: 'Model card: fine-tuned Haiku for claims routing', document_id: 'MC-007', category: 'Model Cards', tags: ['haiku', 'fine-tuned', 'claims', 'routing', 'model-card'], projects: ['project-claimsbot', 'project-model-registry'], meetings: ['meeting:claimsbot-review-feb5'], references: [], version: 'v1', status: 'current', sensitivity: 'internal', created_by: 'Chen Liu', owner: 'Chen Liu', created_date: daysAgo(90), staleness_flag: 'active' },
  { title: 'Model card: Voyage embeddings for retrieval', document_id: 'MC-008', category: 'Model Cards', tags: ['voyage', 'embeddings', 'retrieval', 'model-card'], projects: ['project-retrieval-v2', 'project-model-registry'], meetings: ['meeting:retrieval-v2-design-review-dec3'], references: [], version: 'v1', status: 'current', sensitivity: 'internal', created_by: 'Samira Khalil', owner: 'Samira Khalil', created_date: daysAgo(155), staleness_flag: 'active' },
  { title: 'Model card: OpenAI text-embedding-3-large (deprecated — replaced by Voyage)', document_id: 'MC-009', category: 'Model Cards', tags: ['openai', 'embeddings', 'deprecated', 'model-card'], projects: ['project-model-registry'], meetings: ['meeting:vendor-eval-oct29'], references: [], version: 'v1', status: 'deprecated', sensitivity: 'internal', created_by: 'Samira Khalil', owner: 'Samira Khalil', created_date: daysAgo(197), staleness_flag: 'obsolete' },

  // ════════════════════════════════════════════════════════════════════════════
  // ATLAS DISAMBIGUATION — additional entities
  // ════════════════════════════════════════════════════════════════════════════

  // Atlas Okafor — departed data scientist, eval team
  { title: 'Eval Pipeline Calibration Notes', document_id: 'EXP-030', category: 'Experiment Logs', tags: ['eval-pipeline', 'calibration', 'embeddings'], projects: ['project-eval-framework'], meetings: ['meeting:eval-framework-review-jan27'], references: [], version: 'v1', status: 'current', sensitivity: 'internal', created_by: 'Atlas Okafor', owner: 'Atlas Okafor', created_date: daysAgo(100), staleness_flag: 'aging' },
  { title: 'Hallucination Rate Baseline Study', document_id: 'EVAL-030', category: 'Eval Reports', tags: ['hallucination', 'baseline', 'eval'], projects: ['project-eval-framework'], meetings: [], references: [], version: 'v1', status: 'current', sensitivity: 'internal', created_by: 'Atlas Okafor', owner: 'Atlas Okafor', created_date: daysAgo(110), staleness_flag: 'aging' },
  { title: 'Atlas Okafor Departure Handoff', document_id: 'MTG-050', category: 'Meeting Notes', tags: ['handoff', 'departure', 'eval-pipeline'], projects: ['project-eval-framework'], meetings: ['meeting:weekly-sync-feb17'], references: [], version: 'v1', status: 'stale', sensitivity: 'team-only', created_by: 'Atlas Okafor', owner: 'Atlas Okafor', created_date: daysAgo(85), staleness_flag: 'stale' },

  // Priya Atlas — QA engineer, guardrails team
  { title: 'Guardrails Edge Case Test Matrix', document_id: 'EVAL-031', category: 'Eval Reports', tags: ['guardrails', 'edge-cases', 'test-matrix', 'eval'], projects: ['project-guardrails'], meetings: ['meeting:guardrails-standup-apr7'], references: [], version: 'v2', status: 'current', sensitivity: 'internal', created_by: 'Priya Atlas', owner: 'Priya Atlas', created_date: daysAgo(35), staleness_flag: 'active' },
  { title: 'Safety Filter False Positive Audit', document_id: 'EXP-031', category: 'Experiment Logs', tags: ['safety', 'false-positive', 'guardrails', 'audit'], projects: ['project-guardrails'], meetings: [], references: [], version: 'v1', status: 'current', sensitivity: 'internal', created_by: 'Priya Atlas', owner: 'Priya Atlas', created_date: daysAgo(20), staleness_flag: 'active' },

  // Atlassian — tooling (Jira & Confluence integration)
  { title: 'Jira Ticket Sync Pipeline', document_id: 'INT-020', category: 'Integration Notes', tags: ['atlassian', 'tool-use', 'jira', 'sync'], projects: ['project-integrations'], meetings: ['meeting:integrations-planning-jan13'], references: [], version: 'v1', status: 'current', sensitivity: 'internal', created_by: 'Ben Torres', owner: 'Ben Torres', created_date: daysAgo(105), staleness_flag: 'aging' },
  { title: 'Confluence to KB Sync Runbook', document_id: 'RUN-020', category: 'Runbooks', tags: ['atlassian', 'confluence', 'kb-sync', 'how-to'], projects: ['project-kb-sync', 'project-integrations'], meetings: [], references: [], version: 'v1', status: 'current', sensitivity: 'internal', created_by: 'Ben Torres', owner: 'Ben Torres', created_date: daysAgo(95), staleness_flag: 'aging' },
  { title: 'Atlassian API Rate Limit Incident', document_id: 'INC-020', category: 'Incident Reports', tags: ['atlassian', 'latency', 'rate-limit', 'jira'], projects: ['project-integrations'], meetings: ['meeting:weekly-sync-apr28'], references: [], version: 'v1', status: 'current', sensitivity: 'internal', created_by: 'Marcus Williams', owner: 'Marcus Williams', created_date: daysAgo(10), staleness_flag: 'active' },

  // Atlassian — enterprise client (pilot program)
  { title: 'Atlassian Pilot Onboarding Checklist', document_id: 'INT-021', category: 'Integration Notes', tags: ['atlassian', 'escalation', 'onboarding', 'pilot'], projects: ['project-enterprise-rollout'], meetings: ['meeting:enterprise-process-review-dec15'], references: [], version: 'v1', status: 'current', sensitivity: 'client-restricted', created_by: 'Lucia Fernández', owner: 'Lucia Fernández', created_date: daysAgo(45), staleness_flag: 'active' },
  { title: 'Atlassian Custom Routing Rules', document_id: 'RUN-021', category: 'Runbooks', tags: ['atlassian', 'routing', 'enterprise', 'custom-rules'], projects: ['project-atlas', 'project-enterprise-rollout'], meetings: [], references: [], version: 'v1', status: 'current', sensitivity: 'client-restricted', created_by: 'Lucia Fernández', owner: 'Lucia Fernández', created_date: daysAgo(40), staleness_flag: 'active' },
  { title: 'Atlassian QBR Prep Q2', document_id: 'MTG-051', category: 'Meeting Notes', tags: ['atlassian', 'qbr', 'quarterly', 'client'], projects: ['project-enterprise-rollout'], meetings: ['meeting:quarterly-review-apr7'], references: [], version: 'v1', status: 'current', sensitivity: 'client-restricted', created_by: 'Lucia Fernández', owner: 'Lucia Fernández', created_date: daysAgo(15), staleness_flag: 'active' },

  // Tag "atlas" — legacy v1 migration
  { title: 'Atlas v1 Migration Tracker', document_id: 'PM-020', category: 'Deployment Postmortems', tags: ['atlas', 'deployment', 'migration', 'v1'], projects: ['project-atlas'], meetings: [], references: [], version: 'v1', status: 'deprecated', sensitivity: 'internal', created_by: 'Marcus Williams', owner: 'Marcus Williams', created_date: daysAgo(200), staleness_flag: 'obsolete' },
  { title: 'Atlas Legacy Schema Mapping', document_id: 'PM-021', category: 'Deployment Postmortems', tags: ['atlas', 'chunking', 'schema', 'legacy'], projects: ['project-atlas'], meetings: [], references: [], version: 'v1', status: 'obsolete', sensitivity: 'internal', created_by: 'Marcus Williams', owner: 'Marcus Williams', created_date: daysAgo(220), staleness_flag: 'obsolete' },
  { title: 'Atlas v1 to v2 Data Bridge', document_id: 'PM-022', category: 'Deployment Postmortems', tags: ['atlas', 'retrieval', 'migration', 'data-bridge'], projects: ['project-retrieval-v2'], meetings: [], references: [], version: 'v2', status: 'current', sensitivity: 'internal', created_by: 'Samira Khalil', owner: 'Samira Khalil', created_date: daysAgo(160), staleness_flag: 'aging' },
]

// ─── Enrich each document with computed metadata ───────────────────────────

function enrichDocument(doc) {
  const createdDate = new Date(doc.created_date)
  const daysSinceCreation = Math.round((NARRATIVE_NOW_MS - createdDate.getTime()) / 86_400_000)

  const isDeparted = TEAM_DEPARTED.includes(doc.created_by)
  const teamPool = isDeparted ? TEAM_ALL : TEAM_CURRENT
  const extraCount = randInt(1, 4)
  const extras = pick(teamPool.filter(t => t !== doc.created_by), extraCount)
  const contributors = [doc.created_by, ...(Array.isArray(extras) ? extras : [extras])]

  // Staleness-aware last_modified_date — deterministic via seeded PRNG.
  let lastModifiedDaysAgo
  switch (doc.staleness_flag) {
    case 'active':   lastModifiedDaysAgo = seededRandInt(0, Math.min(7, daysSinceCreation)); break
    case 'aging':    lastModifiedDaysAgo = seededRandInt(14, Math.min(60, daysSinceCreation)); break
    case 'stale':    lastModifiedDaysAgo = seededRandInt(60, Math.min(150, daysSinceCreation)); break
    case 'obsolete': lastModifiedDaysAgo = seededRandInt(120, Math.min(400, daysSinceCreation)); break
    default:         lastModifiedDaysAgo = seededRandInt(1, Math.min(30, daysSinceCreation)); break
  }
  const lastModifiedDate = absoluteET(lastModifiedDaysAgo)
  const lastModifiedBy = isDeparted && Math.random() > 0.3 ? doc.created_by : pick(TEAM_CURRENT)

  const mayaOpened = doc.staleness_flag === 'obsolete' ? randInt(0, 1) : randInt(1, 12)
  const mayaLastOpened = absoluteET(randInt(0, doc.staleness_flag === 'active' ? 14 : 60))
  const mayaEdited = doc.owner === 'Maya Chen' ? absoluteET(randInt(1, 20)) : (Math.random() > 0.7 ? absoluteET(randInt(5, 60)) : null)
  const bookmarked = doc.status === 'current' && (doc.owner === 'Maya Chen' || Math.random() > 0.7)

  const totalViews = doc.staleness_flag === 'obsolete' ? randInt(2, 15) : randInt(5, 150)
  const uniqueViewers30d = doc.staleness_flag === 'stale' ? randInt(0, 3) : Math.min(randInt(2, 15), totalViews)
  const totalEdits = parseInt(doc.version.replace('v', '')) * randInt(2, 8)
  const lastCommentedDaysAgo = randInt(0, Math.min(daysSinceCreation, 30))
  const lastCommentedBy = pick(TEAM_CURRENT)

  const possiblePaths = FOLDER_PATHS[doc.category] || ['/unsorted']
  const folderPath = possiblePaths[Math.floor(Math.random() * possiblePaths.length)]

  const clusterMap = {
    'project-atlas': 'Support Agent Core',
    'project-guardrails': 'Safety & Guardrails',
    'project-retrieval-v2': 'Retrieval Architecture',
    'project-eval-framework': 'Eval Infrastructure',
    'project-enterprise-rollout': 'Enterprise & Clients',
    'project-claimsbot': 'ClaimsBot',
    'project-kb-sync': 'Knowledge Base Ops',
    'project-integrations': 'Integrations',
    'project-model-registry': 'Model Registry',
  }
  const aiCluster = doc.projects.length > 0 ? (clusterMap[doc.projects[0]] || 'Uncategorized') : 'Uncategorized'
  const aiLabel = `${doc.category} — ${aiCluster}`

  const lastVerifiedDaysAgo = doc.staleness_flag === 'active' ? randInt(1, 30) : (doc.staleness_flag === 'aging' ? randInt(30, 90) : null)
  const lastVerifiedBy = lastVerifiedDaysAgo ? pick(TEAM_CURRENT) : null
  const reviewDueDaysFromNow = doc.staleness_flag === 'aging' ? randInt(-10, 14) : (doc.staleness_flag === 'stale' ? randInt(-30, -5) : null)

  const linkedInSlack = randInt(0, 20)
  const linkedInTickets = randInt(0, 8)
  const linkedInPrs = doc.category === 'Runbooks' || doc.category === 'Architecture Decision Records' ? randInt(2, 12) : randInt(0, 3)
  const searchAppearances = doc.staleness_flag === 'obsolete' ? randInt(0, 5) : randInt(5, 80)
  const searchClicks = Math.min(randInt(1, 30), searchAppearances)

  const versionHistory = makeVersionHistory(doc.version, doc.created_date)

  // content_age_days computed from the absolute last_modified_date
  const contentAgeDays = Math.round((NARRATIVE_NOW_MS - new Date(lastModifiedDate).getTime()) / 86_400_000)

  let content = LOREM
  if (doc.document_id === 'ADR-025') {
    try {
      content = readFileSync(resolve(import.meta.dirname, '../../docs/edra/adr-025-content.md'), 'utf-8')
    } catch { /* fallback to LOREM */ }
  }

  // review_due_date anchored to NARRATIVE_NOW
  const reviewDueDate = reviewDueDaysFromNow
    ? new Date(NARRATIVE_NOW_MS + reviewDueDaysFromNow * 86_400_000).toISOString().split('T')[0]
    : null

  return {
    ...doc,
    content,
    version_history: versionHistory,
    parent_document_id: null,
    last_modified_by: lastModifiedBy,
    last_modified_date: lastModifiedDate,
    contributors,
    last_opened_by_me: mayaLastOpened,
    times_opened_by_me: mayaOpened,
    last_edited_by_me: mayaEdited,
    bookmarked_by_me: bookmarked,
    last_opened_by_anyone: absoluteET(randInt(0, 3)),
    total_views: totalViews,
    unique_viewers_30d: uniqueViewers30d,
    total_edits: totalEdits,
    last_commented_on: absoluteET(lastCommentedDaysAgo),
    last_commented_by: lastCommentedBy,
    folder_path: folderPath,
    ai_suggested_cluster: aiCluster,
    ai_suggested_label: aiLabel,
    pinned_to: Math.random() > 0.85 ? [doc.projects[0] || 'general'] : [],
    content_age_days: contentAgeDays,
    review_due_date: reviewDueDate,
    last_verified_date: lastVerifiedDaysAgo ? absoluteET(lastVerifiedDaysAgo) : null,
    last_verified_by: lastVerifiedBy,
    linked_in_slack: linkedInSlack,
    linked_in_tickets: linkedInTickets,
    linked_in_prs: linkedInPrs,
    search_appearances: searchAppearances,
    search_clicks: searchClicks,
  }
}

// ─── Main ──────────────────────────────────────────────────────────────────

async function seed() {
  const client = new Client({ connectionString: process.env.DATABASE_URL })
  await client.connect()
  console.log('Connected to Supabase Postgres')

  await client.query(`DROP TABLE IF EXISTS "edra_document_links" CASCADE`)
  await client.query(`DROP TABLE IF EXISTS "edra_documents" CASCADE`)
  console.log('✓ Dropped existing tables')

  await client.query(`
    CREATE TABLE "edra_documents" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      "document_id" text NOT NULL,
      "title" text NOT NULL,
      "content" text,
      "version" text NOT NULL DEFAULT 'v1',
      "version_history" jsonb DEFAULT '[]',
      "parent_document_id" uuid REFERENCES "edra_documents"("id") ON DELETE SET NULL,
      "created_by" text NOT NULL,
      "created_date" timestamptz DEFAULT now(),
      "last_modified_by" text,
      "last_modified_date" timestamptz,
      "contributors" text[] DEFAULT '{}',
      "owner" text NOT NULL,
      "last_opened_by_me" timestamptz,
      "times_opened_by_me" integer DEFAULT 0,
      "last_edited_by_me" timestamptz,
      "bookmarked_by_me" boolean DEFAULT false,
      "last_opened_by_anyone" timestamptz,
      "total_views" integer DEFAULT 0,
      "unique_viewers_30d" integer DEFAULT 0,
      "total_edits" integer DEFAULT 0,
      "last_commented_on" timestamptz,
      "last_commented_by" text,
      "category" text NOT NULL,
      "projects" text[] DEFAULT '{}',
      "status" text DEFAULT 'draft',
      "sensitivity" text DEFAULT 'internal',
      "tags" text[] DEFAULT '{}',
      "meetings" text[] DEFAULT '{}',
      "references" text[] DEFAULT '{}',
      "supersedes" uuid,
      "superseded_by" uuid,
      "duplicate_of" uuid,
      "folder_path" text,
      "ai_suggested_cluster" text,
      "ai_suggested_label" text,
      "pinned_to" text[] DEFAULT '{}',
      "content_age_days" integer,
      "staleness_flag" text DEFAULT 'active',
      "review_due_date" date,
      "last_verified_date" date,
      "last_verified_by" text,
      "linked_in_slack" integer DEFAULT 0,
      "linked_in_tickets" integer DEFAULT 0,
      "linked_in_prs" integer DEFAULT 0,
      "search_appearances" integer DEFAULT 0,
      "search_clicks" integer DEFAULT 0
    )
  `)
  console.log('✓ Table created')

  await client.query(`CREATE INDEX "edra_docs_category_idx" ON "edra_documents" ("category")`)
  await client.query(`CREATE INDEX "edra_docs_status_idx" ON "edra_documents" ("status")`)
  await client.query(`CREATE INDEX "edra_docs_staleness_idx" ON "edra_documents" ("staleness_flag")`)
  await client.query(`CREATE INDEX "edra_docs_owner_idx" ON "edra_documents" ("owner")`)
  await client.query(`CREATE INDEX "edra_docs_tags_idx" ON "edra_documents" USING GIN ("tags")`)
  await client.query(`CREATE INDEX "edra_docs_projects_idx" ON "edra_documents" USING GIN ("projects")`)
  await client.query(`CREATE INDEX "edra_docs_meetings_idx" ON "edra_documents" USING GIN ("meetings")`)
  await client.query(`CREATE INDEX "edra_docs_document_id_idx" ON "edra_documents" ("document_id")`)
  console.log('✓ Indexes created')

  await client.query(`ALTER TABLE "edra_documents" ENABLE ROW LEVEL SECURITY`)
  await client.query(`
    DO $$ BEGIN
      CREATE POLICY "edra_documents_public_read" ON "edra_documents"
        FOR SELECT USING (true);
    EXCEPTION
      WHEN duplicate_object THEN NULL;
    END $$
  `)
  console.log('✓ RLS enabled')

  const enriched = DOCUMENTS.map(enrichDocument)

  for (const doc of enriched) {
    await client.query(
      `INSERT INTO "edra_documents" (
        document_id, title, content, version, version_history, parent_document_id,
        created_by, created_date, last_modified_by, last_modified_date, contributors, owner,
        last_opened_by_me, times_opened_by_me, last_edited_by_me, bookmarked_by_me,
        last_opened_by_anyone, total_views, unique_viewers_30d, total_edits, last_commented_on, last_commented_by,
        category, projects, status, sensitivity,
        tags, meetings, "references", supersedes, superseded_by, duplicate_of,
        folder_path, ai_suggested_cluster, ai_suggested_label, pinned_to,
        content_age_days, staleness_flag, review_due_date, last_verified_date, last_verified_by,
        linked_in_slack, linked_in_tickets, linked_in_prs, search_appearances, search_clicks
      ) VALUES (
        $1, $2, $3, $4, $5, $6,
        $7, $8, $9, $10, $11, $12,
        $13, $14, $15, $16,
        $17, $18, $19, $20, $21, $22,
        $23, $24, $25, $26,
        $27, $28, $29, $30, $31, $32,
        $33, $34, $35, $36,
        $37, $38, $39, $40, $41,
        $42, $43, $44, $45, $46
      )`,
      [
        doc.document_id, doc.title, doc.content, doc.version, JSON.stringify(doc.version_history), doc.parent_document_id,
        doc.created_by, doc.created_date, doc.last_modified_by, doc.last_modified_date, doc.contributors, doc.owner,
        doc.last_opened_by_me, doc.times_opened_by_me, doc.last_edited_by_me, doc.bookmarked_by_me,
        doc.last_opened_by_anyone, doc.total_views, doc.unique_viewers_30d, doc.total_edits, doc.last_commented_on, doc.last_commented_by,
        doc.category, doc.projects, doc.status, doc.sensitivity,
        doc.tags, doc.meetings, doc.references, doc.supersedes || null, doc.superseded_by || null, doc.duplicate_of || null,
        doc.folder_path, doc.ai_suggested_cluster, doc.ai_suggested_label, doc.pinned_to,
        doc.content_age_days, doc.staleness_flag, doc.review_due_date, doc.last_verified_date, doc.last_verified_by,
        doc.linked_in_slack, doc.linked_in_tickets, doc.linked_in_prs, doc.search_appearances, doc.search_clicks,
      ]
    )
  }
  console.log(`✓ Inserted ${enriched.length} documents`)

  // Wire up supersedes relationships
  const supersedePairs = [
    ['PROMPT-001', 'PROMPT-002'],
    ['PROMPT-006', 'PROMPT-007'],
    ['PROMPT-007', 'PROMPT-008'],
    ['MC-006', 'MC-001'],
    ['MC-008', 'MC-009'],
  ]
  for (const [newerId, olderId] of supersedePairs) {
    const { rows } = await client.query(
      `SELECT id, document_id FROM edra_documents WHERE document_id IN ($1, $2)`,
      [newerId, olderId]
    )
    const newer = rows.find(r => r.document_id === newerId)
    const older = rows.find(r => r.document_id === olderId)
    if (newer && older) {
      await client.query(`UPDATE edra_documents SET supersedes = $1 WHERE id = $2`, [older.id, newer.id])
      await client.query(`UPDATE edra_documents SET superseded_by = $1 WHERE id = $2`, [newer.id, older.id])
    }
  }
  console.log('✓ Supersedes relationships linked')

  // ─── Activity Events ──────────────────────────────────────────────────────
  await client.query(`DROP TABLE IF EXISTS "edra_activity_events" CASCADE`)
  await client.query(`
    CREATE TABLE "edra_activity_events" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      "actor" text NOT NULL,
      "action" text NOT NULL,
      "document_id" uuid REFERENCES "edra_documents"("id"),
      "timestamp" timestamptz NOT NULL DEFAULT now(),
      "summary" text NOT NULL
    )
  `)
  await client.query(`CREATE INDEX "edra_events_timestamp_idx" ON "edra_activity_events" ("timestamp" DESC)`)
  await client.query(`CREATE INDEX "edra_events_document_idx" ON "edra_activity_events" ("document_id")`)

  function hoursAgo(h) {
    const d = new Date(NARRATIVE_NOW_MS)
    d.setHours(d.getHours() - h)
    return d.toISOString()
  }

  const ACTIVITY_EVENTS = [
    // Today (0-8h ago) — 12 events
    { actor: 'Tomás Rivera', action: 'commented', docId: 'PM-006', ts: hoursAgo(1), summary: 'Added timeline details to KB reindex postmortem' },
    { actor: 'Aisha Hassan', action: 'edited', docId: 'PROMPT-005', ts: hoursAgo(2), summary: 'Updated jailbreak resistance prompt v3 draft' },
    { actor: 'Marcus Williams', action: 'commented', docId: 'ADR-031', ts: hoursAgo(2), summary: 'Replied to cost concerns on observability ADR' },
    { actor: 'Ben Torres', action: 'edited', docId: 'RUN-007', ts: hoursAgo(3), summary: 'Added rollback step to KB reindex runbook' },
    { actor: 'Jordan Hayes', action: 'commented', docId: 'EVAL-001', ts: hoursAgo(3), summary: 'Flagged regression in accuracy numbers' },
    { actor: 'Dev Kapoor', action: 'created', docId: 'ADR-032', ts: hoursAgo(4), summary: 'Drafted ADR for agent tool permissions model' },
    { actor: 'Priya Sharma', action: 'edited', docId: 'EVAL-006', ts: hoursAgo(5), summary: 'Corrected methodology note in weekly eval' },
    { actor: 'Alex Park', action: 'commented', docId: 'INC-003', ts: hoursAgo(5), summary: 'Added root cause analysis to contradiction incident' },
    { actor: 'Samira Khalil', action: 'mentioned_in_slack', docId: 'ADR-022', ts: hoursAgo(6), summary: 'Shared in #retrieval channel for discussion' },
    { actor: 'Aisha Hassan', action: 'mentioned_in_slack', docId: 'PM-006', ts: hoursAgo(6), summary: 'Referenced in #incidents as related context' },
    { actor: 'Chen Liu', action: 'edited', docId: 'MC-001', ts: hoursAgo(7), summary: 'Updated Sonnet 4 benchmarks with new data' },
    { actor: 'Marcus Williams', action: 'linked_in_pr', docId: 'RUN-007', ts: hoursAgo(8), summary: 'Linked in PR #347 — reindex safety checks' },

    // Yesterday (24-32h ago) — 10 events
    { actor: 'Tomás Rivera', action: 'edited', docId: 'PM-006', ts: hoursAgo(25), summary: 'Added impact analysis section to postmortem' },
    { actor: 'Ben Torres', action: 'commented', docId: 'ADR-022', ts: hoursAgo(26), summary: 'Proposed alternative versioning approach' },
    { actor: 'Jordan Hayes', action: 'created', docId: 'EVAL-001', ts: hoursAgo(27), summary: 'Published weekly eval for Apr 28' },
    { actor: 'Aisha Hassan', action: 'commented', docId: 'INC-001', ts: hoursAgo(28), summary: 'Added guardrails gap analysis to medical advice incident' },
    { actor: 'Sofia Reyes', action: 'edited', docId: 'MTG-003', ts: hoursAgo(29), summary: 'Updated evidence panel design review notes' },
    { actor: 'Maya Chen', action: 'commented', docId: 'ADR-032', ts: hoursAgo(30), summary: 'Asked for threat model before approving permissions ADR' },
    { actor: 'Lucia Fernández', action: 'mentioned_in_slack', docId: 'INT-003', ts: hoursAgo(30), summary: 'Flagged in #enterprise — client C encoding resurfaced' },
    { actor: 'Marcus Williams', action: 'linked_in_pr', docId: 'ADR-030', ts: hoursAgo(31), summary: 'Linked in PR #344 — SSE streaming implementation' },
    { actor: 'Priya Sharma', action: 'edited', docId: 'EVAL-003', ts: hoursAgo(31), summary: 'Added Q1 agreement rate charts' },
    { actor: 'Dev Kapoor', action: 'commented', docId: 'EXP-010', ts: hoursAgo(32), summary: 'Noted parallel tool calling improves by 40%' },

    // 2 days ago (48-56h ago) — 8 events
    { actor: 'Samira Khalil', action: 'edited', docId: 'RES-005', ts: hoursAgo(49), summary: 'Added new graph memory paper to research notes' },
    { actor: 'Alex Park', action: 'created', docId: 'MTG-042', ts: hoursAgo(50), summary: 'Published Atlas sprint 14 retro notes' },
    { actor: 'Aisha Hassan', action: 'edited', docId: 'EVAL-011', ts: hoursAgo(51), summary: 'Updated false positive rates after latest patch' },
    { actor: 'Ben Torres', action: 'mentioned_in_slack', docId: 'PM-004', ts: hoursAgo(52), summary: 'Referenced in #kb-ops — return policy issue recurring' },
    { actor: 'Marcus Williams', action: 'commented', docId: 'PM-010', ts: hoursAgo(52), summary: 'Confirmed rate limit fix deployed' },
    { actor: 'Tomás Rivera', action: 'linked_in_pr', docId: 'PROMPT-006', ts: hoursAgo(53), summary: 'Linked in PR #341 — claims prompt tuning' },
    { actor: 'Jordan Hayes', action: 'edited', docId: 'RUN-009', ts: hoursAgo(54), summary: 'Simplified eval pipeline setup steps' },
    { actor: 'Chen Liu', action: 'commented', docId: 'EXP-006', ts: hoursAgo(55), summary: 'Added cost comparison table to latency experiment' },

    // 3 days ago — 6 events
    { actor: 'Maya Chen', action: 'commented', docId: 'PM-001', ts: hoursAgo(72), summary: 'Asked for follow-up action items on hallucination postmortem' },
    { actor: 'Dev Kapoor', action: 'edited', docId: 'PROMPT-011', ts: hoursAgo(73), summary: 'Refactored tool-use preamble for clarity' },
    { actor: 'Priya Sharma', action: 'created', docId: 'EVAL-007', ts: hoursAgo(74), summary: 'Published weekly eval for Apr 14' },
    { actor: 'Aisha Hassan', action: 'mentioned_in_slack', docId: 'PM-007', ts: hoursAgo(75), summary: 'Cited in #security — prompt injection patterns' },
    { actor: 'Ben Torres', action: 'edited', docId: 'RUN-014', ts: hoursAgo(76), summary: 'Added diagnostic commands to KB staleness troubleshooting' },
    { actor: 'Lucia Fernández', action: 'commented', docId: 'INT-009', ts: hoursAgo(76), summary: 'Updated Client D status — contract signed, resume onboarding' },

    // 4 days ago — 5 events
    { actor: 'Marcus Williams', action: 'edited', docId: 'RUN-001', ts: hoursAgo(96), summary: 'Updated model deployment runbook for new infra' },
    { actor: 'Samira Khalil', action: 'commented', docId: 'ADR-024', ts: hoursAgo(97), summary: 'Noted retrieval model performing better than shared embeddings' },
    { actor: 'Jordan Hayes', action: 'mentioned_in_slack', docId: 'ADR-029', ts: hoursAgo(98), summary: 'Shared async pipeline ADR in #eval-infra' },
    { actor: 'Alex Park', action: 'commented', docId: 'INC-006', ts: hoursAgo(99), summary: 'Identified root cause — stale product catalog in retrieval' },
    { actor: 'Kai Nakamura', action: 'edited', docId: 'INC-004', ts: hoursAgo(100), summary: 'Added escalation flow diagram to incident report' },

    // 5-7 days ago — 9 events
    { actor: 'Maya Chen', action: 'edited', docId: 'RES-017', ts: hoursAgo(121), summary: 'Updated cost modeling with April usage data' },
    { actor: 'Elena Volkov', action: 'commented', docId: 'EVAL-015', ts: hoursAgo(122), summary: 'Correlated tone scores with resolution time' },
    { actor: 'Tomás Rivera', action: 'edited', docId: 'EXP-001', ts: hoursAgo(130), summary: 'Added epoch 4 results to fine-tuning experiment' },
    { actor: 'Aisha Hassan', action: 'created', docId: 'PM-007', ts: hoursAgo(140), summary: 'Published prompt injection postmortem' },
    { actor: 'Noor Al-Rashid', action: 'commented', docId: 'MTG-004', ts: hoursAgo(145), summary: 'Listed multilingual KB priority languages' },
    { actor: 'Ben Torres', action: 'linked_in_pr', docId: 'ADR-022', ts: hoursAgo(150), summary: 'Linked in PR #338 — versioning implementation' },
    { actor: 'Marcus Williams', action: 'edited', docId: 'PM-002', ts: hoursAgo(155), summary: 'Added capacity planning recommendations' },
    { actor: 'Priya Sharma', action: 'created', docId: 'EVAL-008', ts: hoursAgo(160), summary: 'Published weekly eval for Mar 24' },
    { actor: 'Dev Kapoor', action: 'mentioned_in_slack', docId: 'RES-002', ts: hoursAgo(165), summary: 'Shared Anthropic tool use patterns in #engineering' },
  ]

  for (const event of ACTIVITY_EVENTS) {
    const { rows: [doc] } = await client.query(
      `SELECT id FROM edra_documents WHERE document_id = $1`,
      [event.docId]
    )
    if (doc) {
      await client.query(
        `INSERT INTO "edra_activity_events" (actor, action, document_id, "timestamp", summary)
         VALUES ($1, $2, $3, $4, $5)`,
        [event.actor, event.action, doc.id, event.ts, event.summary]
      )
    }
  }
  console.log(`✓ Inserted ${ACTIVITY_EVENTS.length} activity events`)

  // Summary
  const { rows: summary } = await client.query(
    `SELECT category, count(*) as count, 
     count(*) FILTER (WHERE staleness_flag = 'active') as active,
     count(*) FILTER (WHERE staleness_flag = 'aging') as aging,
     count(*) FILTER (WHERE staleness_flag IN ('stale', 'obsolete')) as stale
     FROM edra_documents GROUP BY category ORDER BY category`
  )
  console.log('\nSummary:')
  console.log('  Category                        | Total | Active | Aging | Stale')
  console.log('  ' + '─'.repeat(70))
  for (const row of summary) {
    console.log(`  ${row.category.padEnd(33)} | ${String(row.count).padStart(5)} | ${String(row.active).padStart(6)} | ${String(row.aging).padStart(5)} | ${String(row.stale).padStart(5)}`)
  }

  const { rows: [{ count: total }] } = await client.query(`SELECT count(*) FROM edra_documents`)
  const { rows: [{ count: departed }] } = await client.query(`SELECT count(*) FROM edra_documents WHERE created_by IN ('Liam O''Brien', 'Hannah Kim', 'Raj Mehta')`)
  const { rows: [{ count: staleCount }] } = await client.query(`SELECT count(*) FROM edra_documents WHERE staleness_flag IN ('stale', 'obsolete') AND status = 'current'`)
  console.log(`\n  Total: ${total} documents`)
  console.log(`  Orphaned (departed authors): ${departed}`)
  console.log(`  Stale but not archived: ${staleCount}`)

  await client.end()
  console.log('\nDone.')
}

seed().catch((err) => {
  console.error('Seed failed:', err)
  process.exit(1)
})
