/**
 * Creates the edra_documents table (full metadata model) and seeds it
 * with Maya's 55 workspace documents.
 *
 * Run via: node edra-challenge/scripts/seed-documents.mjs
 */

import { readFileSync } from 'fs'
import { resolve } from 'path'
import pg from 'pg'

const { Client } = pg

// Load env from root .env (shared DATABASE_URL)
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

const LOREM = `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.

Curabitur pretium tincidunt lacus. Nulla gravida orci a odio. Nullam varius, turpis et commodo pharetra, est eros bibendum elit, nec luctus magna felis sollicitudin mauris. Integer in mauris eu nibh euismod gravida. Duis ac tellus et risus vulputate vehicula. Donec lobortis risus a elit.`

const TEAM = ['Maya Chen', 'Tomás Rivera', 'Samira Khalil', 'Alex Park', 'Priya Sharma', 'Jordan Hayes', 'Chen Liu', 'Lucia Fernández', 'Marcus Williams', 'Aisha Hassan', 'Ben Torres', 'Kai Nakamura', 'Sofia Reyes', 'Dev Kapoor', 'Noor Al-Rashid', 'Ravi Sundaram', 'Elena Volkov', 'Yuki Tanaka', 'Omar Farouk', 'Zara Ibrahim']

// Narrative "now" — fixed anchor so dates never drift.
const NARRATIVE_NOW_MS = Date.UTC(2026, 4, 7, 21, 0, 0) // May 7, 2026 5 PM ET = 9 PM UTC
const NARRATIVE_NOW = new Date(NARRATIVE_NOW_MS)

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

function absoluteET(daysBack, hour, minute) {
  const h = hour ?? seededRandInt(9, 18)
  const m = minute ?? seededRandInt(0, 59)
  const base = new Date(Date.UTC(2026, 4, 7))
  base.setUTCDate(base.getUTCDate() - daysBack)
  return `${base.getUTCFullYear()}-${_pad2(base.getUTCMonth() + 1)}-${_pad2(base.getUTCDate())}T${_pad2(h)}:${_pad2(m)}:00-04:00`
}

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
    history.push({ version: `v${i}`, date: d.toISOString(), author: pick(TEAM) })
  }
  return history
}

// Messy folder paths (intentionally inconsistent — that's the problem Maya is solving)
const FOLDER_PATHS = {
  'Experiment Logs': ['/experiments', '/experiments/2025', '/team-shared/experiments', '/Maya/experiments', '/unsorted', '/atlas/experiments'],
  'Eval Reports': ['/evals', '/evals/weekly', '/team-shared/evals', '/reports/evals', '/unsorted', '/atlas/evals'],
  'Prompt Libraries': ['/prompts', '/prompts/production', '/prompts/archive', '/atlas/prompts', '/unsorted'],
  'Architecture Decision Records': ['/ADRs', '/architecture', '/decisions', '/team-shared/ADRs', '/unsorted'],
  'Deployment Postmortems': ['/postmortems', '/incidents/postmortems', '/team-shared/postmortems', '/unsorted'],
  'Integration Notes': ['/integrations', '/clients', '/enterprise/integrations', '/unsorted', '/team-shared/clients'],
  'Model Cards': ['/models', '/model-registry', '/team-shared/models', '/unsorted'],
  'Incident Reports': ['/incidents', '/incidents/2025', '/team-shared/incidents', '/unsorted'],
  'Research Notes': ['/research', '/reading-notes', '/team-shared/research', '/Maya/notes', '/unsorted'],
  'Meeting Notes': ['/meetings', '/meetings/weekly', '/meetings/2025', '/team-shared/meetings', '/unsorted'],
  'Runbooks': ['/runbooks', '/how-to', '/team-shared/runbooks', '/onboarding', '/unsorted'],
}

// ─── Document Data ─────────────────────────────────────────────────────────

const DOCUMENTS = [
  // ── Experiment Logs ──
  {
    title: 'Fine-tuning Haiku on claims dataset v3 — results',
    document_id: 'EXP-001',
    category: 'Experiment Logs',
    tags: ['fine-tuning', 'haiku', 'claims', 'insurance', 'dataset'],
    projects: ['project-claimsbot'],
    meetings: ['meeting:claimsbot-kickoff-jan15', 'meeting:weekly-sync-jan21'],
    references: [],
    version: 'v3',
    status: 'current',
    sensitivity: 'internal',
    created_by: 'Tomás Rivera',
    owner: 'Tomás Rivera',
    created_date: daysAgo(112),
    staleness_flag: 'active',
  },
  {
    title: 'RAG vs long-context comparison for support agent',
    document_id: 'EXP-002',
    category: 'Experiment Logs',
    tags: ['rag', 'context-window', 'support-agent', 'architecture'],
    projects: ['project-atlas'],
    meetings: ['meeting:atlas-architecture-review-nov8', 'meeting:weekly-sync-nov13'],
    references: [],
    version: 'v2',
    status: 'current',
    sensitivity: 'internal',
    created_by: 'Samira Khalil',
    owner: 'Samira Khalil',
    created_date: daysAgo(180),
    staleness_flag: 'aging',
  },
  {
    title: 'Temperature sweep 0.1–0.7 on routing classifier',
    document_id: 'EXP-003',
    category: 'Experiment Logs',
    tags: ['hyperparameter', 'routing', 'classifier', 'tuning'],
    projects: ['project-atlas'],
    meetings: ['meeting:atlas-standup-dec4'],
    references: [],
    version: 'v1',
    status: 'current',
    sensitivity: 'internal',
    created_by: 'Dev Kapoor',
    owner: 'Dev Kapoor',
    created_date: daysAgo(154),
    staleness_flag: 'aging',
  },
  {
    title: 'Embedding model comparison: voyage vs openai vs cohere',
    document_id: 'EXP-004',
    category: 'Experiment Logs',
    tags: ['embeddings', 'model-selection', 'retrieval', 'vendor-comparison'],
    projects: ['project-retrieval-v2'],
    meetings: ['meeting:retrieval-v2-kickoff-oct22', 'meeting:vendor-eval-oct29'],
    references: [],
    version: 'v2',
    status: 'current',
    sensitivity: 'internal',
    created_by: 'Samira Khalil',
    owner: 'Samira Khalil',
    created_date: daysAgo(197),
    staleness_flag: 'aging',
  },
  {
    title: 'Multi-turn memory retention test — 50 conversation pairs',
    document_id: 'EXP-005',
    category: 'Experiment Logs',
    tags: ['memory', 'multi-turn', 'conversation', 'evaluation'],
    projects: ['project-atlas'],
    meetings: ['meeting:atlas-eval-review-mar17'],
    references: [],
    version: 'v1',
    status: 'current',
    sensitivity: 'internal',
    created_by: 'Priya Sharma',
    owner: 'Priya Sharma',
    created_date: daysAgo(50),
    staleness_flag: 'active',
  },

  // ── Eval Reports ──
  {
    title: 'Weekly eval: support agent accuracy (Apr 28)',
    document_id: 'EVAL-001',
    category: 'Eval Reports',
    tags: ['eval', 'support-agent', 'accuracy', 'weekly-cadence'],
    projects: ['project-atlas'],
    meetings: ['meeting:weekly-sync-apr28'],
    references: [],
    version: 'v1',
    status: 'current',
    sensitivity: 'internal',
    created_by: 'Maya Chen',
    owner: 'Maya Chen',
    created_date: daysAgo(8),
    staleness_flag: 'active',
  },
  {
    title: 'Regression analysis post-deployment v2.4',
    document_id: 'EVAL-002',
    category: 'Eval Reports',
    tags: ['regression', 'deployment', 'v2.4', 'quality-check'],
    projects: ['project-atlas'],
    meetings: ['meeting:atlas-postdeploy-review-feb10', 'meeting:weekly-sync-feb11'],
    references: [],
    version: 'v1',
    status: 'current',
    sensitivity: 'internal',
    created_by: 'Jordan Hayes',
    owner: 'Jordan Hayes',
    created_date: daysAgo(85),
    staleness_flag: 'active',
  },
  {
    title: 'Human vs auto-eval agreement rates Q1',
    document_id: 'EVAL-003',
    category: 'Eval Reports',
    tags: ['eval-methodology', 'human-eval', 'auto-eval', 'agreement'],
    projects: ['project-eval-framework'],
    meetings: ['meeting:eval-framework-review-apr2', 'meeting:quarterly-review-apr7'],
    references: [],
    version: 'v2',
    status: 'current',
    sensitivity: 'internal',
    created_by: 'Priya Sharma',
    owner: 'Priya Sharma',
    created_date: daysAgo(34),
    staleness_flag: 'active',
  },
  {
    title: 'Hallucination rate by query category — March',
    document_id: 'EVAL-004',
    category: 'Eval Reports',
    tags: ['hallucination', 'safety', 'query-type', 'monthly-cadence'],
    projects: ['project-guardrails'],
    meetings: ['meeting:guardrails-standup-mar31', 'meeting:weekly-sync-apr7'],
    references: [],
    version: 'v1',
    status: 'current',
    sensitivity: 'internal',
    created_by: 'Aisha Hassan',
    owner: 'Aisha Hassan',
    created_date: daysAgo(36),
    staleness_flag: 'active',
  },
  {
    title: 'Agent performance: structured vs unstructured inputs',
    document_id: 'EVAL-005',
    category: 'Eval Reports',
    tags: ['eval', 'input-format', 'structured-data', 'agent-performance'],
    projects: ['project-atlas'],
    meetings: ['meeting:atlas-eval-review-mar17'],
    references: [],
    version: 'v1',
    status: 'current',
    sensitivity: 'internal',
    created_by: 'Chen Liu',
    owner: 'Chen Liu',
    created_date: daysAgo(50),
    staleness_flag: 'active',
  },

  // ── Prompt Libraries ──
  {
    title: 'System prompt: customer support agent (CURRENT)',
    document_id: 'PROMPT-001',
    category: 'Prompt Libraries',
    tags: ['prompt', 'support-agent', 'production', 'current'],
    projects: ['project-atlas'],
    meetings: ['meeting:atlas-prompt-review-apr14'],
    references: [],
    version: 'v7',
    status: 'current',
    sensitivity: 'team-only',
    created_by: 'Maya Chen',
    owner: 'Maya Chen',
    created_date: daysAgo(210),
    staleness_flag: 'active',
  },
  {
    title: 'System prompt: support agent (old — do not use)',
    document_id: 'PROMPT-002',
    category: 'Prompt Libraries',
    tags: ['prompt', 'support-agent', 'deprecated', 'archived'],
    projects: ['project-atlas'],
    meetings: ['meeting:atlas-prompt-review-feb3'],
    references: [],
    version: 'v5',
    status: 'deprecated',
    sensitivity: 'team-only',
    created_by: 'Maya Chen',
    owner: 'Maya Chen',
    created_date: daysAgo(300),
    staleness_flag: 'obsolete',
  },
  {
    title: 'Few-shot examples for refund classification',
    document_id: 'PROMPT-003',
    category: 'Prompt Libraries',
    tags: ['few-shot', 'refund', 'classification', 'prompt-engineering'],
    projects: ['project-atlas'],
    meetings: ['meeting:atlas-standup-dec11'],
    references: [],
    version: 'v3',
    status: 'current',
    sensitivity: 'internal',
    created_by: 'Tomás Rivera',
    owner: 'Tomás Rivera',
    created_date: daysAgo(147),
    staleness_flag: 'active',
  },
  {
    title: 'Chain-of-thought template for escalation routing',
    document_id: 'PROMPT-004',
    category: 'Prompt Libraries',
    tags: ['cot', 'escalation', 'routing', 'prompt-engineering'],
    projects: ['project-atlas'],
    meetings: ['meeting:atlas-architecture-review-nov8'],
    references: [],
    version: 'v2',
    status: 'current',
    sensitivity: 'internal',
    created_by: 'Alex Park',
    owner: 'Alex Park',
    created_date: daysAgo(180),
    staleness_flag: 'aging',
  },
  {
    title: 'Jailbreak resistance prompt — v3 draft',
    document_id: 'PROMPT-005',
    category: 'Prompt Libraries',
    tags: ['safety', 'jailbreak', 'guardrails', 'draft'],
    projects: ['project-guardrails'],
    meetings: ['meeting:guardrails-sprint-planning-mar3'],
    references: [],
    version: 'v3',
    status: 'draft',
    sensitivity: 'team-only',
    created_by: 'Aisha Hassan',
    owner: 'Aisha Hassan',
    created_date: daysAgo(64),
    staleness_flag: 'active',
  },

  // ── Architecture Decision Records ──
  {
    title: 'ADR-017: Why we chose RAG over fine-tuning',
    document_id: 'ADR-017',
    category: 'Architecture Decision Records',
    tags: ['rag', 'fine-tuning', 'architecture', 'decision'],
    projects: ['project-retrieval-v2'],
    meetings: ['meeting:retrieval-v2-kickoff-oct22', 'meeting:all-hands-nov1'],
    references: [],
    version: 'v1',
    status: 'current',
    sensitivity: 'internal',
    created_by: 'Samira Khalil',
    owner: 'Samira Khalil',
    created_date: daysAgo(197),
    staleness_flag: 'active',
  },
  {
    title: 'ADR-021: Switching to chunking by semantic boundary',
    document_id: 'ADR-021',
    category: 'Architecture Decision Records',
    tags: ['chunking', 'retrieval', 'semantic', 'architecture'],
    projects: ['project-retrieval-v2'],
    meetings: ['meeting:retrieval-v2-design-review-nov19'],
    references: [],
    version: 'v1',
    status: 'current',
    sensitivity: 'internal',
    created_by: 'Samira Khalil',
    owner: 'Samira Khalil',
    created_date: daysAgo(169),
    staleness_flag: 'active',
  },
  {
    title: 'ADR-024: Separate retrieval model vs shared embeddings',
    document_id: 'ADR-024',
    category: 'Architecture Decision Records',
    tags: ['retrieval', 'embeddings', 'architecture', 'decision'],
    projects: ['project-retrieval-v2'],
    meetings: ['meeting:retrieval-v2-design-review-dec3'],
    references: [],
    version: 'v1',
    status: 'current',
    sensitivity: 'internal',
    created_by: 'Samira Khalil',
    owner: 'Chen Liu',
    created_date: daysAgo(155),
    staleness_flag: 'active',
  },
  {
    title: 'ADR-029: Moving eval pipeline to async',
    document_id: 'ADR-029',
    category: 'Architecture Decision Records',
    tags: ['eval-pipeline', 'infrastructure', 'async', 'performance'],
    projects: ['project-eval-framework'],
    meetings: ['meeting:eval-framework-review-jan27'],
    references: [],
    version: 'v2',
    status: 'current',
    sensitivity: 'internal',
    created_by: 'Jordan Hayes',
    owner: 'Jordan Hayes',
    created_date: daysAgo(99),
    staleness_flag: 'active',
  },
  {
    title: 'Why we dropped LangChain — notes from Tomás',
    document_id: 'ADR-MISC-001',
    category: 'Architecture Decision Records',
    tags: ['langchain', 'framework', 'migration', 'decision'],
    projects: ['project-atlas'],
    meetings: ['meeting:atlas-retro-sep15'],
    references: [],
    version: 'v1',
    status: 'current',
    sensitivity: 'internal',
    created_by: 'Tomás Rivera',
    owner: 'Tomás Rivera',
    created_date: daysAgo(234),
    staleness_flag: 'aging',
  },

  // ── Deployment Postmortems ──
  {
    title: 'Postmortem: agent hallucinating after KB update (Mar 12)',
    document_id: 'PM-001',
    category: 'Deployment Postmortems',
    tags: ['hallucination', 'knowledge-base', 'deployment', 'incident'],
    projects: ['project-atlas'],
    meetings: ['meeting:incident-review-mar13', 'meeting:weekly-sync-mar17'],
    references: [],
    version: 'v1',
    status: 'current',
    sensitivity: 'internal',
    created_by: 'Jordan Hayes',
    owner: 'Maya Chen',
    created_date: daysAgo(55),
    staleness_flag: 'active',
  },
  {
    title: 'Postmortem: latency spike during peak traffic',
    document_id: 'PM-002',
    category: 'Deployment Postmortems',
    tags: ['latency', 'scaling', 'production', 'infrastructure'],
    projects: ['project-atlas'],
    meetings: ['meeting:incident-review-jan8'],
    references: [],
    version: 'v1',
    status: 'current',
    sensitivity: 'internal',
    created_by: 'Marcus Williams',
    owner: 'Marcus Williams',
    created_date: daysAgo(119),
    staleness_flag: 'active',
  },
  {
    title: 'Postmortem: wrong refund amount — chunking overlap issue',
    document_id: 'PM-003',
    category: 'Deployment Postmortems',
    tags: ['chunking', 'refund', 'retrieval-error', 'incident'],
    projects: ['project-retrieval-v2'],
    meetings: ['meeting:incident-review-nov25', 'meeting:retrieval-v2-design-review-dec3'],
    references: [],
    version: 'v1',
    status: 'current',
    sensitivity: 'internal',
    created_by: 'Samira Khalil',
    owner: 'Samira Khalil',
    created_date: daysAgo(163),
    staleness_flag: 'aging',
  },
  {
    title: 'Root cause: agent ignoring updated return policy',
    document_id: 'PM-004',
    category: 'Deployment Postmortems',
    tags: ['knowledge-base', 'staleness', 'policy', 'retrieval'],
    projects: ['project-kb-sync'],
    meetings: ['meeting:kb-sync-standup-feb24'],
    references: [],
    version: 'v1',
    status: 'current',
    sensitivity: 'internal',
    created_by: 'Ben Torres',
    owner: 'Ben Torres',
    created_date: daysAgo(71),
    staleness_flag: 'active',
  },
  {
    title: 'Incident debrief: PII leak in agent response',
    document_id: 'PM-005',
    category: 'Deployment Postmortems',
    tags: ['pii', 'safety', 'privacy', 'incident'],
    projects: ['project-guardrails'],
    meetings: ['meeting:incident-review-mar20', 'meeting:guardrails-sprint-planning-mar24'],
    references: [],
    version: 'v1',
    status: 'current',
    sensitivity: 'client-restricted',
    created_by: 'Aisha Hassan',
    owner: 'Maya Chen',
    created_date: daysAgo(47),
    staleness_flag: 'active',
  },

  // ── Integration Notes ──
  {
    title: 'Client A onboarding: SSO quirks and workarounds',
    document_id: 'INT-001',
    category: 'Integration Notes',
    tags: ['client-a', 'sso', 'authentication', 'onboarding'],
    projects: ['project-enterprise-rollout'],
    meetings: ['meeting:client-a-kickoff-oct1'],
    references: [],
    version: 'v2',
    status: 'current',
    sensitivity: 'client-restricted',
    created_by: 'Lucia Fernández',
    owner: 'Lucia Fernández',
    created_date: daysAgo(218),
    staleness_flag: 'aging',
  },
  {
    title: 'Client B: custom taxonomy mapping for their ticket system',
    document_id: 'INT-002',
    category: 'Integration Notes',
    tags: ['client-b', 'taxonomy', 'ticketing', 'customization'],
    projects: ['project-enterprise-rollout'],
    meetings: ['meeting:client-b-onboarding-nov5'],
    references: [],
    version: 'v1',
    status: 'current',
    sensitivity: 'client-restricted',
    created_by: 'Lucia Fernández',
    owner: 'Lucia Fernández',
    created_date: daysAgo(183),
    staleness_flag: 'aging',
  },
  {
    title: 'Client C data pipeline — known encoding issues',
    document_id: 'INT-003',
    category: 'Integration Notes',
    tags: ['client-c', 'data-pipeline', 'encoding', 'bug'],
    projects: ['project-enterprise-rollout'],
    meetings: ['meeting:client-c-troubleshooting-feb19', 'meeting:weekly-sync-feb24'],
    references: [],
    version: 'v3',
    status: 'in review',
    sensitivity: 'client-restricted',
    created_by: 'Marcus Williams',
    owner: 'Lucia Fernández',
    created_date: daysAgo(76),
    staleness_flag: 'active',
  },
  {
    title: 'HubSpot integration: field mapping reference',
    document_id: 'INT-004',
    category: 'Integration Notes',
    tags: ['hubspot', 'integration', 'field-mapping', 'reference'],
    projects: ['project-integrations'],
    meetings: ['meeting:integrations-planning-dec9'],
    references: [],
    version: 'v1',
    status: 'current',
    sensitivity: 'internal',
    created_by: 'Ben Torres',
    owner: 'Ben Torres',
    created_date: daysAgo(149),
    staleness_flag: 'aging',
  },
  {
    title: 'Zendesk webhook setup — what actually works',
    document_id: 'INT-005',
    category: 'Integration Notes',
    tags: ['zendesk', 'webhook', 'integration', 'workaround'],
    projects: ['project-integrations'],
    meetings: ['meeting:integrations-planning-jan13'],
    references: [],
    version: 'v2',
    status: 'current',
    sensitivity: 'internal',
    created_by: 'Ben Torres',
    owner: 'Ben Torres',
    created_date: daysAgo(114),
    staleness_flag: 'active',
  },

  // ── Model Cards ──
  {
    title: 'Model card: Sonnet 4 for classification tasks',
    document_id: 'MC-001',
    category: 'Model Cards',
    tags: ['sonnet', 'classification', 'model-card', 'capabilities'],
    projects: ['project-model-registry'],
    meetings: ['meeting:model-eval-roundtable-mar10'],
    references: [],
    version: 'v2',
    status: 'current',
    sensitivity: 'internal',
    created_by: 'Chen Liu',
    owner: 'Chen Liu',
    created_date: daysAgo(57),
    staleness_flag: 'active',
  },
  {
    title: 'Model card: Haiku for high-volume routing',
    document_id: 'MC-002',
    category: 'Model Cards',
    tags: ['haiku', 'routing', 'throughput', 'model-card'],
    projects: ['project-model-registry'],
    meetings: ['meeting:model-eval-roundtable-mar10'],
    references: [],
    version: 'v1',
    status: 'current',
    sensitivity: 'internal',
    created_by: 'Chen Liu',
    owner: 'Chen Liu',
    created_date: daysAgo(57),
    staleness_flag: 'active',
  },
  {
    title: 'Opus vs Sonnet cost-performance tradeoff matrix',
    document_id: 'MC-003',
    category: 'Model Cards',
    tags: ['opus', 'sonnet', 'cost', 'model-selection'],
    projects: ['project-model-registry'],
    meetings: ['meeting:quarterly-review-apr7', 'meeting:budget-review-apr9'],
    references: [],
    version: 'v3',
    status: 'current',
    sensitivity: 'team-only',
    created_by: 'Maya Chen',
    owner: 'Maya Chen',
    created_date: daysAgo(120),
    staleness_flag: 'active',
  },
  {
    title: 'Known failure modes: Sonnet on ambiguous instructions',
    document_id: 'MC-004',
    category: 'Model Cards',
    tags: ['sonnet', 'failure-modes', 'ambiguity', 'limitations'],
    projects: ['project-model-registry'],
    meetings: ['meeting:atlas-eval-review-mar17'],
    references: [],
    version: 'v1',
    status: 'current',
    sensitivity: 'internal',
    created_by: 'Priya Sharma',
    owner: 'Priya Sharma',
    created_date: daysAgo(50),
    staleness_flag: 'active',
  },
  {
    title: 'Model selection guide — when to use what',
    document_id: 'MC-005',
    category: 'Model Cards',
    tags: ['model-selection', 'guide', 'reference', 'decision'],
    projects: ['project-model-registry'],
    meetings: ['meeting:all-hands-apr1'],
    references: [],
    version: 'v4',
    status: 'current',
    sensitivity: 'internal',
    created_by: 'Maya Chen',
    owner: 'Maya Chen',
    created_date: daysAgo(180),
    staleness_flag: 'active',
  },

  // ── Incident Reports ──
  {
    title: 'Agent gave medical advice to customer (May 1)',
    document_id: 'INC-001',
    category: 'Incident Reports',
    tags: ['safety', 'out-of-scope', 'medical', 'incident'],
    projects: ['project-guardrails'],
    meetings: ['meeting:incident-review-may2'],
    references: [],
    version: 'v1',
    status: 'in review',
    sensitivity: 'client-restricted',
    created_by: 'Aisha Hassan',
    owner: 'Maya Chen',
    created_date: daysAgo(5),
    staleness_flag: 'active',
  },
  {
    title: 'Agent applied wrong discount — 40% instead of 4%',
    document_id: 'INC-002',
    category: 'Incident Reports',
    tags: ['accuracy', 'numerical-error', 'discount', 'incident'],
    projects: ['project-atlas'],
    meetings: ['meeting:incident-review-apr21', 'meeting:weekly-sync-apr21'],
    references: [],
    version: 'v1',
    status: 'current',
    sensitivity: 'internal',
    created_by: 'Jordan Hayes',
    owner: 'Jordan Hayes',
    created_date: daysAgo(15),
    staleness_flag: 'active',
  },
  {
    title: 'Customer received contradictory answers in same session',
    document_id: 'INC-003',
    category: 'Incident Reports',
    tags: ['consistency', 'multi-turn', 'contradiction', 'incident'],
    projects: ['project-atlas'],
    meetings: ['meeting:atlas-standup-apr15'],
    references: [],
    version: 'v1',
    status: 'current',
    sensitivity: 'internal',
    created_by: 'Alex Park',
    owner: 'Alex Park',
    created_date: daysAgo(21),
    staleness_flag: 'active',
  },
  {
    title: 'Agent bypassed escalation on billing dispute',
    document_id: 'INC-004',
    category: 'Incident Reports',
    tags: ['escalation', 'billing', 'routing-failure', 'incident'],
    projects: ['project-atlas'],
    meetings: ['meeting:incident-review-mar27'],
    references: [],
    version: 'v1',
    status: 'current',
    sensitivity: 'internal',
    created_by: 'Kai Nakamura',
    owner: 'Kai Nakamura',
    created_date: daysAgo(40),
    staleness_flag: 'active',
  },
  {
    title: 'False positive: flagged normal transaction as fraud',
    document_id: 'INC-005',
    category: 'Incident Reports',
    tags: ['false-positive', 'fraud-detection', 'precision', 'incident'],
    projects: ['project-claimsbot'],
    meetings: ['meeting:claimsbot-review-feb5'],
    references: [],
    version: 'v1',
    status: 'current',
    sensitivity: 'internal',
    created_by: 'Tomás Rivera',
    owner: 'Tomás Rivera',
    created_date: daysAgo(90),
    staleness_flag: 'active',
  },

  // ── Research Notes ──
  {
    title: 'Paper summary: Constitutional AI implications for our guardrails',
    document_id: 'RES-001',
    category: 'Research Notes',
    tags: ['constitutional-ai', 'safety', 'guardrails', 'research'],
    projects: ['project-guardrails'],
    meetings: ['meeting:guardrails-sprint-planning-mar3'],
    references: [],
    version: 'v1',
    status: 'current',
    sensitivity: 'internal',
    created_by: 'Aisha Hassan',
    owner: 'Aisha Hassan',
    created_date: daysAgo(64),
    staleness_flag: 'active',
  },
  {
    title: 'Notes from Anthropic cookbook on tool use patterns',
    document_id: 'RES-002',
    category: 'Research Notes',
    tags: ['tool-use', 'anthropic', 'patterns', 'reference'],
    projects: ['project-atlas'],
    meetings: ['meeting:atlas-standup-feb18'],
    references: [],
    version: 'v1',
    status: 'current',
    sensitivity: 'internal',
    created_by: 'Dev Kapoor',
    owner: 'Dev Kapoor',
    created_date: daysAgo(77),
    staleness_flag: 'active',
  },
  {
    title: 'Competitor analysis: how Moveworks handles KB updates',
    document_id: 'RES-003',
    category: 'Research Notes',
    tags: ['competitor', 'moveworks', 'knowledge-base', 'analysis'],
    projects: ['project-kb-sync'],
    meetings: ['meeting:quarterly-review-jan6'],
    references: [],
    version: 'v1',
    status: 'current',
    sensitivity: 'team-only',
    created_by: 'Maya Chen',
    owner: 'Maya Chen',
    created_date: daysAgo(121),
    staleness_flag: 'aging',
  },
  {
    title: 'Ideas from NeurIPS — retrieval augmented generation panel',
    document_id: 'RES-004',
    category: 'Research Notes',
    tags: ['neurips', 'rag', 'research', 'ideas'],
    projects: ['project-retrieval-v2'],
    meetings: ['meeting:retrieval-v2-kickoff-oct22'],
    references: [],
    version: 'v1',
    status: 'current',
    sensitivity: 'internal',
    created_by: 'Samira Khalil',
    owner: 'Samira Khalil',
    created_date: daysAgo(197),
    staleness_flag: 'stale',
  },
  {
    title: "Samira's notes on graph-based memory architectures",
    document_id: 'RES-005',
    category: 'Research Notes',
    tags: ['graph', 'memory', 'architecture', 'research'],
    projects: ['project-retrieval-v2'],
    meetings: ['meeting:retrieval-v2-design-review-nov19'],
    references: [],
    version: 'v1',
    status: 'draft',
    sensitivity: 'internal',
    created_by: 'Samira Khalil',
    owner: 'Samira Khalil',
    created_date: daysAgo(169),
    staleness_flag: 'stale',
  },

  // ── Meeting Notes ──
  {
    title: 'Weekly sync — Apr 28',
    document_id: 'MTG-001',
    category: 'Meeting Notes',
    tags: ['sync', 'weekly-cadence', 'team-updates', 'status'],
    projects: ['project-atlas', 'project-guardrails'],
    meetings: ['meeting:weekly-sync-apr28'],
    references: ['references:weekly-eval-apr28', 'references:agent-discount-incident'],
    version: 'v1',
    status: 'current',
    sensitivity: 'internal',
    created_by: 'Maya Chen',
    owner: 'Maya Chen',
    created_date: daysAgo(8),
    staleness_flag: 'active',
  },
  {
    title: 'Sprint retro: what broke in the eval pipeline',
    document_id: 'MTG-002',
    category: 'Meeting Notes',
    tags: ['retro', 'eval-pipeline', 'process', 'lessons'],
    projects: ['project-eval-framework'],
    meetings: ['meeting:eval-framework-retro-feb17'],
    references: ['references:ADR-029'],
    version: 'v1',
    status: 'current',
    sensitivity: 'internal',
    created_by: 'Jordan Hayes',
    owner: 'Jordan Hayes',
    created_date: daysAgo(78),
    staleness_flag: 'active',
  },
  {
    title: 'Design review: new evidence panel UI',
    document_id: 'MTG-003',
    category: 'Meeting Notes',
    tags: ['design-review', 'evidence-panel', 'ui', 'frontend'],
    projects: ['project-atlas'],
    meetings: ['meeting:atlas-design-review-apr10'],
    references: ['references:hallucination-postmortem-mar12'],
    version: 'v1',
    status: 'current',
    sensitivity: 'internal',
    created_by: 'Sofia Reyes',
    owner: 'Sofia Reyes',
    created_date: daysAgo(26),
    staleness_flag: 'active',
  },
  {
    title: 'Brainstorm: how to handle multilingual KB',
    document_id: 'MTG-004',
    category: 'Meeting Notes',
    tags: ['multilingual', 'knowledge-base', 'ideation', 'i18n'],
    projects: ['project-kb-sync'],
    meetings: ['meeting:kb-sync-brainstorm-mar5'],
    references: ['references:client-b-taxonomy-mapping'],
    version: 'v1',
    status: 'current',
    sensitivity: 'internal',
    created_by: 'Noor Al-Rashid',
    owner: 'Noor Al-Rashid',
    created_date: daysAgo(62),
    staleness_flag: 'active',
  },
  {
    title: 'Standup notes — Tomás OOO, blocked on client C data',
    document_id: 'MTG-005',
    category: 'Meeting Notes',
    tags: ['standup', 'client-c', 'blocker', 'status'],
    projects: ['project-enterprise-rollout'],
    meetings: ['meeting:enterprise-standup-feb20'],
    references: ['references:client-c-encoding-issues'],
    version: 'v1',
    status: 'current',
    sensitivity: 'internal',
    created_by: 'Lucia Fernández',
    owner: 'Lucia Fernández',
    created_date: daysAgo(75),
    staleness_flag: 'aging',
  },

  // ── Runbooks ──
  {
    title: 'How to deploy a new model to production',
    document_id: 'RUN-001',
    category: 'Runbooks',
    tags: ['deployment', 'model', 'production', 'how-to'],
    projects: ['project-atlas'],
    meetings: ['meeting:atlas-onboarding-session-sep8'],
    references: [],
    version: 'v3',
    status: 'current',
    sensitivity: 'internal',
    created_by: 'Marcus Williams',
    owner: 'Marcus Williams',
    created_date: daysAgo(241),
    staleness_flag: 'active',
  },
  {
    title: 'Rolling back a release — step by step',
    document_id: 'RUN-002',
    category: 'Runbooks',
    tags: ['rollback', 'release', 'production', 'how-to'],
    projects: ['project-atlas'],
    meetings: ['meeting:incident-review-jan8'],
    references: ['references:latency-spike-postmortem'],
    version: 'v2',
    status: 'current',
    sensitivity: 'internal',
    created_by: 'Marcus Williams',
    owner: 'Marcus Williams',
    created_date: daysAgo(200),
    staleness_flag: 'active',
  },
  {
    title: 'New client onboarding checklist',
    document_id: 'RUN-003',
    category: 'Runbooks',
    tags: ['onboarding', 'client', 'checklist', 'how-to'],
    projects: ['project-enterprise-rollout'],
    meetings: ['meeting:enterprise-process-review-dec15'],
    references: [],
    version: 'v2',
    status: 'current',
    sensitivity: 'team-only',
    created_by: 'Lucia Fernández',
    owner: 'Lucia Fernández',
    created_date: daysAgo(143),
    staleness_flag: 'active',
  },
  {
    title: 'How to re-run evals after KB change',
    document_id: 'RUN-004',
    category: 'Runbooks',
    tags: ['eval', 'knowledge-base', 'rerun', 'how-to'],
    projects: ['project-eval-framework'],
    meetings: ['meeting:eval-framework-review-jan27'],
    references: [],
    version: 'v1',
    status: 'current',
    sensitivity: 'internal',
    created_by: 'Priya Sharma',
    owner: 'Priya Sharma',
    created_date: daysAgo(99),
    staleness_flag: 'active',
  },
  {
    title: 'Setting up a new VPC for enterprise client',
    document_id: 'RUN-005',
    category: 'Runbooks',
    tags: ['vpc', 'enterprise', 'infrastructure', 'how-to'],
    projects: ['project-enterprise-rollout'],
    meetings: ['meeting:enterprise-process-review-dec15'],
    references: [],
    version: 'v1',
    status: 'current',
    sensitivity: 'team-only',
    created_by: 'Marcus Williams',
    owner: 'Marcus Williams',
    created_date: daysAgo(143),
    staleness_flag: 'aging',
  },
]

// ─── Enrich each document with computed metadata ───────────────────────────

function enrichDocument(doc) {
  const createdDate = new Date(doc.created_date)
  const daysSinceCreation = Math.round((NARRATIVE_NOW_MS - createdDate.getTime()) / 86_400_000)

  const contributors = [doc.created_by, ...pick(TEAM.filter(t => t !== doc.created_by), randInt(1, 4))]

  let lastModifiedDaysAgo
  switch (doc.staleness_flag) {
    case 'active':   lastModifiedDaysAgo = seededRandInt(0, Math.min(7, daysSinceCreation)); break
    case 'aging':    lastModifiedDaysAgo = seededRandInt(14, Math.min(60, daysSinceCreation)); break
    case 'stale':    lastModifiedDaysAgo = seededRandInt(60, Math.min(150, daysSinceCreation)); break
    case 'obsolete': lastModifiedDaysAgo = seededRandInt(120, Math.min(400, daysSinceCreation)); break
    default:         lastModifiedDaysAgo = seededRandInt(1, Math.min(30, daysSinceCreation)); break
  }
  const lastModifiedDate = absoluteET(lastModifiedDaysAgo)
  const lastModifiedBy = pick(contributors)

  const mayaOpened = randInt(1, 12)
  const mayaLastOpened = absoluteET(randInt(0, 14))
  const mayaEdited = doc.owner === 'Maya Chen' ? absoluteET(randInt(1, 20)) : (Math.random() > 0.7 ? absoluteET(randInt(5, 60)) : null)
  const bookmarked = doc.status === 'current' && (doc.owner === 'Maya Chen' || Math.random() > 0.7)

  const totalViews = randInt(5, 150)
  const uniqueViewers30d = Math.min(randInt(2, 15), totalViews)
  const totalEdits = parseInt(doc.version.replace('v', '')) * randInt(2, 8)
  const lastCommentedDaysAgo = randInt(0, Math.min(daysSinceCreation, 30))
  const lastCommentedBy = pick(TEAM)

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
  const aiCluster = clusterMap[doc.projects[0]] || 'Uncategorized'
  const aiLabel = `${doc.category} — ${aiCluster}`

  const lastVerifiedDaysAgo = doc.staleness_flag === 'active' ? randInt(1, 30) : (doc.staleness_flag === 'aging' ? randInt(30, 90) : null)
  const lastVerifiedBy = lastVerifiedDaysAgo ? pick(contributors) : null
  const reviewDueDaysFromNow = doc.staleness_flag === 'aging' ? randInt(-10, 14) : (doc.staleness_flag === 'stale' ? randInt(-30, -5) : null)

  const linkedInSlack = randInt(0, 20)
  const linkedInTickets = randInt(0, 8)
  const linkedInPrs = doc.category === 'Runbooks' || doc.category === 'Architecture Decision Records' ? randInt(2, 12) : randInt(0, 3)
  const searchAppearances = randInt(5, 80)
  const searchClicks = Math.min(randInt(1, 30), searchAppearances)

  const versionHistory = makeVersionHistory(doc.version, doc.created_date)
  const contentAgeDays = Math.round((NARRATIVE_NOW_MS - new Date(lastModifiedDate).getTime()) / 86_400_000)
  const reviewDueDate = reviewDueDaysFromNow
    ? new Date(NARRATIVE_NOW_MS + reviewDueDaysFromNow * 86_400_000).toISOString().split('T')[0]
    : null

  return {
    ...doc,
    content: LOREM,
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
    pinned_to: Math.random() > 0.8 ? [doc.projects[0]] : [],
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

  // Drop and recreate with full schema
  await client.query(`DROP TABLE IF EXISTS "edra_documents" CASCADE`)
  console.log('✓ Dropped existing table')

  await client.query(`
    CREATE TABLE "edra_documents" (
      -- Identity
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      "document_id" text NOT NULL,
      "title" text NOT NULL,
      "content" text,
      "version" text NOT NULL DEFAULT 'v1',
      "version_history" jsonb DEFAULT '[]',
      "parent_document_id" uuid REFERENCES "edra_documents"("id") ON DELETE SET NULL,

      -- Authorship
      "created_by" text NOT NULL,
      "created_date" timestamptz DEFAULT now(),
      "last_modified_by" text,
      "last_modified_date" timestamptz,
      "contributors" text[] DEFAULT '{}',
      "owner" text NOT NULL,

      -- My activity (Maya's perspective)
      "last_opened_by_me" timestamptz,
      "times_opened_by_me" integer DEFAULT 0,
      "last_edited_by_me" timestamptz,
      "bookmarked_by_me" boolean DEFAULT false,

      -- Team activity
      "last_opened_by_anyone" timestamptz,
      "total_views" integer DEFAULT 0,
      "unique_viewers_30d" integer DEFAULT 0,
      "total_edits" integer DEFAULT 0,
      "last_commented_on" timestamptz,
      "last_commented_by" text,

      -- Classification
      "category" text NOT NULL,
      "projects" text[] DEFAULT '{}',
      "status" text DEFAULT 'draft',
      "sensitivity" text DEFAULT 'internal',

      -- Relationships
      "tags" text[] DEFAULT '{}',
      "meetings" text[] DEFAULT '{}',
      "references" text[] DEFAULT '{}',
      "supersedes" uuid,
      "superseded_by" uuid,
      "duplicate_of" uuid,

      -- Organization
      "folder_path" text,
      "ai_suggested_cluster" text,
      "ai_suggested_label" text,
      "pinned_to" text[] DEFAULT '{}',

      -- Freshness
      "content_age_days" integer,
      "staleness_flag" text DEFAULT 'active',
      "review_due_date" date,
      "last_verified_date" date,
      "last_verified_by" text,

      -- Relevance signals
      "linked_in_slack" integer DEFAULT 0,
      "linked_in_tickets" integer DEFAULT 0,
      "linked_in_prs" integer DEFAULT 0,
      "search_appearances" integer DEFAULT 0,
      "search_clicks" integer DEFAULT 0
    )
  `)
  console.log('✓ Table edra_documents created with full schema')

  // Indexes
  await client.query(`CREATE INDEX "edra_docs_category_idx" ON "edra_documents" ("category")`)
  await client.query(`CREATE INDEX "edra_docs_status_idx" ON "edra_documents" ("status")`)
  await client.query(`CREATE INDEX "edra_docs_staleness_idx" ON "edra_documents" ("staleness_flag")`)
  await client.query(`CREATE INDEX "edra_docs_owner_idx" ON "edra_documents" ("owner")`)
  await client.query(`CREATE INDEX "edra_docs_tags_idx" ON "edra_documents" USING GIN ("tags")`)
  await client.query(`CREATE INDEX "edra_docs_projects_idx" ON "edra_documents" USING GIN ("projects")`)
  await client.query(`CREATE INDEX "edra_docs_meetings_idx" ON "edra_documents" USING GIN ("meetings")`)
  await client.query(`CREATE INDEX "edra_docs_document_id_idx" ON "edra_documents" ("document_id")`)
  console.log('✓ Indexes created')

  // RLS
  await client.query(`ALTER TABLE "edra_documents" ENABLE ROW LEVEL SECURITY`)
  await client.query(`
    DO $$ BEGIN
      CREATE POLICY "edra_documents_public_read" ON "edra_documents"
        FOR SELECT USING (true);
    EXCEPTION
      WHEN duplicate_object THEN NULL;
    END $$
  `)
  console.log('✓ RLS enabled with public read policy')

  // Enrich and insert
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
  console.log(`✓ Inserted ${enriched.length} documents with full metadata`)

  // Link supersedes: old prompt superseded by new prompt
  const { rows: prompts } = await client.query(
    `SELECT id, document_id FROM edra_documents WHERE document_id IN ('PROMPT-001', 'PROMPT-002')`
  )
  const prompt001 = prompts.find(r => r.document_id === 'PROMPT-001')
  const prompt002 = prompts.find(r => r.document_id === 'PROMPT-002')
  if (prompt001 && prompt002) {
    await client.query(`UPDATE edra_documents SET supersedes = $1 WHERE id = $2`, [prompt002.id, prompt001.id])
    await client.query(`UPDATE edra_documents SET superseded_by = $1 WHERE id = $2`, [prompt001.id, prompt002.id])
    console.log('✓ Linked PROMPT-001 supersedes PROMPT-002')
  }

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
  console.log(`\n  Total: ${total} documents`)

  await client.end()
  console.log('\nDone.')
}

seed().catch((err) => {
  console.error('Seed failed:', err)
  process.exit(1)
})
