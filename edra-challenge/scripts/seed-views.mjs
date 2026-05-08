/**
 * Creates the view tables and pre-computes all 22 workspace views.
 * Each view assigns every (or a subset of) document to slug-based folder paths,
 * with human-readable display names stored separately.
 *
 * Run via: node edra-challenge/scripts/seed-views.mjs
 * (Must run AFTER seed-documents-full.mjs and seed-links.mjs)
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

function slugify(str) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function daysAgo(date) {
  return Math.round((Date.now() - new Date(date).getTime()) / (1000 * 60 * 60 * 24))
}

const TEAM_CURRENT = ['Maya Chen', 'Tomás Rivera', 'Samira Khalil', 'Alex Park', 'Priya Sharma', 'Jordan Hayes', 'Chen Liu', 'Lucia Fernández', 'Marcus Williams', 'Aisha Hassan', 'Ben Torres', 'Kai Nakamura', 'Sofia Reyes', 'Dev Kapoor', 'Noor Al-Rashid', 'Ravi Sundaram', 'Elena Volkov', 'Yuki Tanaka', 'Omar Farouk', 'Zara Ibrahim']
const TEAM_DEPARTED = ["Liam O'Brien", 'Hannah Kim', 'Raj Mehta', 'Atlas Okafor', 'Priya Atlas']

const PROJECT_DISPLAY = {
  'project-atlas': 'Atlas (Support Agent)',
  'project-guardrails': 'Guardrails (Safety)',
  'project-retrieval-v2': 'Retrieval v2',
  'project-eval-framework': 'Eval Framework',
  'project-enterprise-rollout': 'Enterprise Clients',
  'project-claimsbot': 'ClaimsBot',
  'project-kb-sync': 'Knowledge Base Ops',
  'project-integrations': 'Integrations',
  'project-model-registry': 'Model Registry',
}

const CATEGORY_DISPLAY = {
  'Experiment Logs': 'Experiments',
  'Eval Reports': 'Evaluations',
  'Prompt Libraries': 'Prompts',
  'Architecture Decision Records': 'Architecture Decisions',
  'Deployment Postmortems': 'Postmortems',
  'Incident Reports': 'Incidents',
  'Integration Notes': 'Integration Notes',
  'Model Cards': 'Model Cards',
  'Research Notes': 'Research & Reading Notes',
  'Meeting Notes': 'Meeting Notes',
  'Runbooks': 'How-To Guides & Runbooks',
}

// ─── View Definitions ──────────────────────────────────────────────────────

// Helpers for shared_with JSONB
const p = (initials, name) => ({ initials, name })
const d = (families, tier1, tier2) => ({ families, tier1, tier2 })
const e = (label, value) => ({ label, value })

const VIEW_DEFS = [
  // ── Project & Structure ──────────────────────────────────────────────────
  { id: 'by-project',           name: 'By Project',               category: 'project',      description: 'All documents grouped by their primary project',                   isFiltered: false, sortOrder: 1,  isSystem: false, visibility: 'shared', sharedWith: [p('TR','Tomás Rivera'), p('SK','Samira Khalil'), p('AP','Alex Park')], derivation: d(['metadata'], 'Organized by project', 'Each document placed under its primary project tag. Documents spanning 2+ projects appear in a cross-project group.'), evidenceSummary: null, sourceTooltip: 'Groups by the primary project tag on each document. Documents spanning 2+ projects are placed in a cross-project group.' },
  { id: 'by-document-type',     name: 'By Document Type',          category: 'project',      description: 'All documents grouped by category with status sub-groups',         isFiltered: false, sortOrder: 2,  isSystem: false, visibility: 'team',   sharedWith: [p('TR','Tomás Rivera'), p('SK','Samira Khalil')], derivation: d(['metadata'], 'Organized by document category', 'Uses each document\u2019s type \u2014 experiments, evals, ADRs, runbooks, etc. \u2014 with status sub-groups within each.'), evidenceSummary: null, sourceTooltip: 'Groups by document category (experiments, evals, ADRs, etc.) with status sub-groups extracted from document metadata.' },
  { id: 'by-client',            name: 'By Client',                 category: 'project',      description: 'Client-related documents organized by client name',                isFiltered: true,  sortOrder: 3,  isSystem: false, visibility: 'shared', sharedWith: [p('AP','Alex Park'), p('SR','Sofia Reyes')], derivation: d(['metadata'], 'Only client-related documents', 'Filtered to documents with client tags, then grouped by client name.'), evidenceSummary: null, sourceTooltip: 'Filters to documents with client tags or client-restricted sensitivity, then groups by client name.' },
  // ── People & Teams ───────────────────────────────────────────────────────
  { id: 'by-owner',             name: 'By Owner',                  category: 'people',       description: 'Documents grouped by who owns them',                               isFiltered: false, sortOrder: 4,  isSystem: false, visibility: 'team',   sharedWith: [p('JH','Jordan Hayes'), p('AP','Alex Park')], derivation: d(['metadata'], 'Organized by document author', 'Grouped by the created_by field on each document.'), evidenceSummary: null, sourceTooltip: 'Groups by the created_by field on each document.' },
  { id: 'team-vs-alumni',       name: 'Current Team vs Alumni',    category: 'people',       description: 'Triage view for inherited docs from departed team members',         isFiltered: false, sortOrder: 5,  isSystem: false, visibility: 'team',   sharedWith: [p('SK','Samira Khalil'), p('BT','Ben Torres')], derivation: d(['temporal', 'metadata'], 'Triage inherited work from departed members', 'Documents grouped by whether the author is on the current team roster or has since left. Useful for identifying unowned knowledge.'), evidenceSummary: [e('documents from departed members', 74), e('documents with no current owner', 18)], sourceTooltip: 'Compares document owners against the current team roster. Departed members\u2019 docs are flagged by whether they\u2019re still referenced in Slack or tickets.' },
  // ── Timeline ─────────────────────────────────────────────────────────────
  { id: 'by-recency',           name: 'By Recency',                category: 'temporal',     description: 'Documents bucketed by how recently they were modified',             isFiltered: false, sortOrder: 6,  isSystem: false, visibility: 'team',   sharedWith: [p('PS','Priya Sharma'), p('CL','Chen Liu')], derivation: d(['metadata'], 'Organized by how recently each document changed', 'Bucketed by last-modified date: today, this week, this month, this quarter, older.'), evidenceSummary: null, sourceTooltip: 'Buckets by each document\u2019s last-modified date relative to today.' },
  { id: 'by-quarter',           name: 'By Quarter',                category: 'temporal',     description: 'Documents arranged by creation quarter and month',                  isFiltered: false, sortOrder: 7,  isSystem: false, visibility: 'team',   sharedWith: [p('TR','Tomás Rivera'), p('LF','Lucia Fernández')], derivation: d(['metadata'], 'Arranged by when documents were created', 'Bucketed by creation date into quarters, then months within each quarter.'), evidenceSummary: null, sourceTooltip: 'Buckets by each document\u2019s creation date into year-quarter, then month.' },
  { id: 'before-i-joined',      name: 'From Before I Joined',      category: 'temporal',     description: 'What existed before you became lead vs. what you\'ve created since',          isFiltered: false, sortOrder: 8,  isSystem: false, visibility: 'private', sharedWith: [], derivation: d(['temporal', 'personal'], 'What existed before you became lead', 'Split by your start date. Left side: documents created before you joined. Right side: what you and the team have created since.'), evidenceSummary: [e('documents created before you joined', 142), e('documents created since', 58)], sourceTooltip: 'Splits documents by your start date (6 weeks ago), then by whether you\u2019ve personally touched them since.' },
  // ── Activity & Engagement ────────────────────────────────────────────────
  { id: 'my-engagement',        name: 'My Engagement',             category: 'behavioral',   description: 'Documents bucketed by your interaction level',      isFiltered: false, sortOrder: 9,  isSystem: true,  visibility: 'private', sharedWith: [], derivation: d(['behavioral', 'personal'], 'Reflects your recent activity across the workspace', 'Bucketed by your interaction level: documents you\u2019ve edited, viewed multiple times, bookmarked, or haven\u2019t touched. Based on the past 30 days.'), evidenceSummary: [e('documents you opened this month', 47), e('documents you edited', 12), e('documents you bookmarked', 8)], sourceTooltip: 'Based on your personal interaction history: documents you\u2019ve edited, viewed, bookmarked, or never opened in the past 30 days.' },
  { id: 'team-hotspots',        name: 'Team Hotspots',             category: 'behavioral',   description: 'Where the team energy is — high activity, Slack buzz, PR links',   isFiltered: false, sortOrder: 10, isSystem: false, visibility: 'team',   sharedWith: [p('KN','Kai Nakamura'), p('DK','Dev Kapoor')], derivation: d(['behavioral', 'team'], 'Surfaces where team attention is concentrated', 'Ranked by a blend of: unique viewers in the past 30 days, mentions in Slack threads, and citations in pull requests. Individual activity is aggregated \u2014 no individual usage is shown.'), evidenceSummary: [e('documents with 5+ viewers this month', 34), e('documents mentioned in Slack', 19), e('documents linked in PRs', 11)], sourceTooltip: 'Ranks by a blend of unique viewers (30 days), Slack thread mentions, and PR citations. No individual usage is shown.' },
  { id: 'most-searched',         name: 'Most Searched',             category: 'behavioral',   description: 'Documents by search visibility — what people look for vs find',    isFiltered: false, sortOrder: 11, isSystem: false, visibility: 'private', sharedWith: [], derivation: d(['behavioral', 'team'], 'Documents people look for most often', 'Ranked by search frequency and click-through rate. Shows what the team searches for vs. what they actually find useful.'), evidenceSummary: [e('documents appearing in searches', 92), e('documents with high click-through', 28)], sourceTooltip: 'Ranks by workspace search frequency and click-through rate from search results.' },
  // ── Calendar ─────────────────────────────────────────────────────────────
  { id: 'for-your-meetings',    name: 'For Your Meetings',         category: 'calendar',     description: 'Documents linked to upcoming meetings on your calendar',         isFiltered: true,  sortOrder: 12, isSystem: true,  visibility: 'private', sharedWith: [], derivation: d(['calendar', 'personal'], 'Matched to your upcoming meetings', 'Documents are linked by meeting tags in the document metadata and by shared attendees between your calendar events and document authors.'), evidenceSummary: [e('documents matched to 2 upcoming meetings', 7)], sourceTooltip: 'Matched to your Google Calendar by meeting tags in document metadata and shared attendees between calendar events and document authors.' },
  { id: 'meeting-archive',      name: 'Meeting Archive',           category: 'calendar',     description: 'All meeting notes organized by meeting type and date',              isFiltered: true,  sortOrder: 13, isSystem: false, visibility: 'private', sharedWith: [], derivation: d(['calendar'], 'All meeting notes, organized by type', 'Grouped by meeting type \u2014 weekly syncs, standups, design reviews, 1:1s \u2014 extracted from document tags.'), evidenceSummary: [e('meeting notes across 4 meeting types', 31)], sourceTooltip: 'Uses meeting-type tags (sync, standup, design-review, 1:1, retro) extracted from document metadata.' },
  // ── Health & Hygiene ─────────────────────────────────────────────────────
  { id: 'needs-attention',      name: 'Needs Attention',           category: 'health',       description: 'Stale, overdue, deprecated, or superseded documents',              isFiltered: true,  sortOrder: 14, isSystem: false, visibility: 'shared', sharedWith: [p('TR','Tomás Rivera')], derivation: d(['health', 'temporal'], 'Documents that may need action', 'Flagged when any of: last edit was 90+ days ago, another document supersedes this one, or the document carries a deprecated tag. Each flag shown individually per document.'), evidenceSummary: [e('documents last edited 90+ days ago', 31), e('documents with supersession links', 8), e('documents tagged deprecated', 5)], sourceTooltip: 'Flags documents where: last edit was 90+ days ago, a newer version supersedes this one, or a deprecated tag is present.' },
  { id: 'archive-candidates',   name: 'Archive Candidates',        category: 'health',       description: 'Documents scored by archival safety — high confidence to risky',   isFiltered: false, sortOrder: 15, isSystem: false, visibility: 'team',   sharedWith: [p('TR','Tomás Rivera'), p('NA','Noor Al-Rashid')], derivation: d(['health', 'behavioral'], 'Ordered from safest to riskiest to archive', 'Safety score combines: days since last edit, unique viewers in the past 30 days, and number of documents that link to this one. Higher-scored documents have fewer dependencies and less recent activity.'), evidenceSummary: [e('documents with zero views in 30 days', 44), e('documents with no inbound links', 67), e('high-confidence archive candidates', 22)], sourceTooltip: 'Safety score combines: days since last edit, unique viewers in 30 days, and count of inbound document links.' },
  { id: 'duplicates-conflicts', name: 'Duplicates & Conflicts',    category: 'health',       description: 'Supersession chains, near-duplicates, and topic overlaps',         isFiltered: false, sortOrder: 16, isSystem: false, visibility: 'team',   sharedWith: [p('EV','Elena Volkov'), p('RS','Ravi Sundaram')], derivation: d(['health', 'graph'], 'Documents that overlap or contradict each other', 'Detected by: explicit supersession links between documents, near-duplicate titles, and overlapping topic tags on documents from different authors.'), evidenceSummary: [e('supersession chains detected', 6), e('near-duplicate pairs', 4), e('topic overlap clusters', 3)], sourceTooltip: 'Detected via explicit supersession links, near-duplicate titles, and overlapping topic tags across different authors.' },
  // ── By Purpose ───────────────────────────────────────────────────────────
  { id: 'what-broke',           name: 'What Broke',                category: 'intent',       description: 'Incidents and postmortems organized by severity and project',      isFiltered: true,  sortOrder: 17, isSystem: false, visibility: 'shared', sharedWith: [p('BT','Ben Torres'), p('KN','Kai Nakamura'), p('LF','Lucia Fernández')], derivation: d(['composite', 'metadata'], 'Incidents and postmortems', 'Filtered to incident reports and deployment postmortems, organized by severity and project.'), evidenceSummary: null, sourceTooltip: 'Filters to incident reports and deployment postmortems from document category, then organizes by severity tags and project.' },
  { id: 'what-were-building',   name: 'What Are We Building',      category: 'intent',       description: 'Active work across projects — experiments, evals, decisions',      isFiltered: true,  sortOrder: 18, isSystem: false, visibility: 'shared', sharedWith: [p('TR','Tomás Rivera'), p('PS','Priya Sharma')], derivation: d(['composite', 'temporal'], 'Active work in progress', 'Filtered to active experiments, in-progress evals, and open decisions across all projects.'), evidenceSummary: null, sourceTooltip: 'Filters to documents with active staleness flag or in-progress status, grouped by project and document type.' },
  { id: 'how-do-i',             name: 'How Do I...',               category: 'intent',       description: 'Runbooks and how-to guides by topic area',                         isFiltered: true,  sortOrder: 19, isSystem: false, visibility: 'shared', sharedWith: [p('DK','Dev Kapoor'), p('EV','Elena Volkov')], derivation: d(['composite', 'metadata'], 'Guides and how-tos', 'Filtered to runbooks and step-by-step guides, organized by topic area.'), evidenceSummary: null, sourceTooltip: 'Filters to documents categorized as Runbooks, then groups by topic tags (deployment, eval, knowledge-base, etc.).' },
  { id: 'what-did-we-decide',   name: 'What Did We Decide',        category: 'intent',       description: 'Architecture decisions by status and topic',                       isFiltered: true,  sortOrder: 20, isSystem: false, visibility: 'team',   sharedWith: [p('SK','Samira Khalil'), p('TR','Tomás Rivera')], derivation: d(['composite', 'metadata'], 'Architecture decisions', 'Filtered to ADRs and decision records, organized by status (active, superseded, draft) and topic.'), evidenceSummary: null, sourceTooltip: 'Filters to Architecture Decision Records, grouped by status (active, accepted, superseded) and topic tags.' },
  { id: 'what-do-we-know',      name: 'What Do We Know',           category: 'intent',       description: 'Model cards, research notes, and competitive intelligence',        isFiltered: true,  sortOrder: 21, isSystem: false, visibility: 'team',   sharedWith: [p('PS','Priya Sharma'), p('YT','Yuki Tanaka')], derivation: d(['composite', 'metadata'], 'Research and reference material', 'Filtered to model cards, research notes, and competitive intelligence.'), evidenceSummary: null, sourceTooltip: 'Filters to Model Cards and Research Notes, then groups by topic (models in use, competitive intelligence, research papers).' },
  // ── Access & Sensitivity ─────────────────────────────────────────────────
  { id: 'by-sensitivity',       name: 'By Sensitivity Level',      category: 'sensitivity',  description: 'Documents grouped by access level — client-restricted, team, internal', isFiltered: false, sortOrder: 22, isSystem: false, visibility: 'team',   sharedWith: [p('SK','Samira Khalil'), p('JH','Jordan Hayes')], derivation: d(['metadata'], 'Organized by access level', 'Uses each document\u2019s sensitivity tag: client-restricted, team-only, or internal.'), evidenceSummary: null, sourceTooltip: 'Groups by the sensitivity tag on each document: client-restricted, team-only, or internal.' },
  // ── Connections ──────────────────────────────────────────────────────────
  { id: 'connection-threads',   name: 'Connection Threads',        category: 'relationship', description: 'Narrative arcs traced through document link chains',               isFiltered: false, sortOrder: 23, isSystem: false, visibility: 'team',   sharedWith: [p('CL','Chen Liu'), p('AP','Alex Park')], derivation: d(['graph'], 'Follows the threads between related documents', 'Traced through 137 document links across 6 relationship types: cites, supersedes, informs, contradicts, related-to, and part-of. Each thread shows the chain of connected documents.'), evidenceSummary: [e('document links across 6 relationship types', 137), e('distinct link chains traced', 24)], sourceTooltip: 'Traces chains through 137 document links across 6 relationship types (cites, supersedes, informs, contradicts, related-to, part-of).' },
  { id: 'orphaned-documents',   name: 'Orphaned Documents',        category: 'relationship', description: 'Documents with no links, meeting tags, or project associations',   isFiltered: false, sortOrder: 24, isSystem: false, visibility: 'team',   sharedWith: [p('BT','Ben Torres'), p('KN','Kai Nakamura')], derivation: d(['graph'], 'Documents with no connections to other work', 'No document links, no meeting tags, and no project association. These documents exist in isolation \u2014 they may need to be connected or archived.'), evidenceSummary: [e('documents with zero links', 41), e('documents with no project tag', 23)], sourceTooltip: 'Identifies documents with zero links, no meeting tags, and no project associations in the link graph.' },
  // ── Smart Views ──────────────────────────────────────────────────────────
  { id: 'sprint-view',          name: 'Sprint View',               category: 'composite',    description: 'Active experiments, open incidents, pending decisions this sprint', isFiltered: true,  sortOrder: 25, isSystem: false, visibility: 'shared', sharedWith: [p('TR','Tomás Rivera'), p('PS','Priya Sharma'), p('JH','Jordan Hayes'), p('CL','Chen Liu')], derivation: d(['composite', 'temporal'], 'What\u2019s active this sprint', 'Combines: active experiments, open incidents, and pending architecture decisions \u2014 filtered to the current sprint window.'), evidenceSummary: null, sourceTooltip: 'Combines active experiments, open incidents, and pending decisions filtered to the current 2-week sprint window.' },
  { id: 'onboarding',           name: 'New Engineer Onboarding',   category: 'composite',    description: 'Curated reading list for new team members',                        isFiltered: true,  sortOrder: 26, isSystem: false, visibility: 'shared', sharedWith: [p('NA','Noor Al-Rashid'), p('RS','Ravi Sundaram')], derivation: d(['composite'], 'Curated reading list for new team members', 'Current prompts, latest evals, deployment runbooks, and key postmortems \u2014 selected as essential context for someone joining the team.'), evidenceSummary: null, sourceTooltip: 'Curated by filtering to current-status documents with high view counts and search clicks, prioritizing runbooks, model cards, and postmortems.' },
  { id: 'vp-review-prep',       name: 'VP Review Prep',            category: 'composite',    description: 'What shipped, what\'s in progress, what failed, team health',      isFiltered: true,  sortOrder: 27, isSystem: false, visibility: 'shared', sharedWith: [p('SK','Samira Khalil')], derivation: d(['composite', 'behavioral'], 'What you need for leadership conversations', 'Aggregates across projects: what shipped, what\u2019s in progress, what failed, and team health indicators.'), evidenceSummary: null, sourceTooltip: 'Aggregates across projects: recently-shipped experiments, active work, deployment postmortems, and cost analysis from the past quarter.' },
]

// ─── Grouping Functions ────────────────────────────────────────────────────
// Each returns an array of { path, displayName, description? } assignments.
// A doc may map to zero entries (filtered out) or multiple (multi-placement).

function viewByProject(doc) {
  const projects = doc.projects || []
  if (projects.length === 0) return [{ path: '/uncategorized', confidence: 1.0 }]
  if (projects.length >= 2) return [{ path: '/cross-project', confidence: 1.0 }]
  const proj = projects[0]
  const projSlug = slugify(PROJECT_DISPLAY[proj] || proj)
  const catSlug = slugify(CATEGORY_DISPLAY[doc.category] || doc.category)
  return [{ path: `/${projSlug}/${catSlug}`, confidence: 1.0 }]
}

function viewByDocumentType(doc) {
  const catSlug = slugify(CATEGORY_DISPLAY[doc.category] || doc.category)
  const tags = doc.tags || []

  if (doc.category === 'Meeting Notes') {
    let subtype = 'miscellaneous'
    if (tags.includes('sync')) subtype = 'weekly-syncs'
    else if (tags.includes('standup')) subtype = 'standups'
    else if (tags.includes('design-review')) subtype = 'design-reviews'
    else if (tags.includes('1:1')) subtype = 'one-on-ones'
    else if (tags.includes('all-hands')) subtype = 'all-hands'
    else if (tags.includes('retro')) subtype = 'retros'
    else if (tags.includes('multilingual') || tags.includes('ideation') || tags.includes('multi-agent') || tags.includes('personality')) subtype = 'brainstorms'
    return [{ path: `/${catSlug}/${subtype}`, confidence: 1.0 }]
  }
  if (['Experiment Logs', 'Eval Reports'].includes(doc.category)) {
    const statusSlug = doc.staleness_flag === 'active' ? 'active' : 'completed'
    return [{ path: `/${catSlug}/${statusSlug}`, confidence: 1.0 }]
  }
  if (doc.category === 'Prompt Libraries') {
    const statusSlug = doc.status === 'deprecated' ? 'deprecated' : doc.status === 'draft' ? 'drafts' : 'in-production'
    return [{ path: `/${catSlug}/${statusSlug}`, confidence: 1.0 }]
  }
  if (doc.category === 'Architecture Decision Records') {
    const statusSlug = doc.status === 'draft' ? 'drafts' : doc.status === 'in review' ? 'in-review' : 'accepted'
    return [{ path: `/${catSlug}/${statusSlug}`, confidence: 1.0 }]
  }
  return [{ path: `/${catSlug}`, confidence: 1.0 }]
}

function viewByClient(doc) {
  const tags = doc.tags || []
  const clientTags = tags.filter(t => t.startsWith('client-'))
  const isAtlassianClient = tags.includes('atlassian') && (tags.includes('onboarding') || tags.includes('pilot') || tags.includes('qbr') || tags.includes('routing'))

  if (clientTags.length > 0) {
    const client = clientTags[0]
    return [{ path: `/${client}`, confidence: 1.0 }]
  }
  if (isAtlassianClient) {
    return [{ path: '/atlassian-pilot', confidence: 1.0 }]
  }
  if (doc.category === 'Integration Notes' && tags.some(t => ['onboarding', 'vpc', 'enterprise'].includes(t))) {
    return [{ path: '/general-not-client-specific', confidence: 0.8 }]
  }
  if (doc.sensitivity === 'client-restricted') {
    return [{ path: '/general-not-client-specific', confidence: 0.8 }]
  }
  if (doc.category === 'Runbooks' && tags.some(t => ['onboarding', 'client', 'vpc', 'enterprise'].includes(t))) {
    return [{ path: '/general-not-client-specific', confidence: 0.8 }]
  }
  if (doc.category === 'Prompt Libraries' && tags.includes('enterprise')) {
    return [{ path: '/general-not-client-specific', confidence: 0.8 }]
  }
  if (doc.sensitivity === 'client-restricted') {
    return [{ path: '/uncategorized', confidence: 0.3 }]
  }
  return [{ path: '/uncategorized', confidence: 0.1 }]
}

function viewByOwner(doc) {
  const owner = doc.owner || 'Unknown'
  const isDeparted = TEAM_DEPARTED.includes(owner)
  if (isDeparted) return [{ path: `/former-team/${slugify(owner)}`, confidence: 1.0 }]
  if (!TEAM_CURRENT.includes(owner) && !TEAM_DEPARTED.includes(owner)) return [{ path: '/unowned', confidence: 1.0 }]
  return [{ path: `/${slugify(owner)}`, confidence: 1.0 }]
}

function viewTeamVsAlumni(doc) {
  const owner = doc.owner || 'Unknown'
  const isDeparted = TEAM_DEPARTED.includes(owner)

  if (isDeparted) {
    let healthBucket = 'needs-triage'
    if ((doc.linked_in_slack > 0 || doc.linked_in_tickets > 0)) healthBucket = 'still-referenced'
    else if (['stale', 'obsolete'].includes(doc.staleness_flag)) healthBucket = 'possibly-outdated'
    return [{ path: `/former-team-members/${slugify(owner)}/${healthBucket}`, confidence: 1.0 }]
  }
  if (!TEAM_CURRENT.includes(owner)) return [{ path: '/ownership-unclear', confidence: 1.0 }]
  return [{ path: '/current-team', confidence: 1.0 }]
}

function viewByRecency(doc) {
  if (!doc.last_modified_date) return [{ path: '/no-modification-date', confidence: 1.0 }]
  const days = daysAgo(doc.last_modified_date)
  if (days <= 1) return [{ path: '/today', confidence: 1.0 }]
  if (days <= 7) return [{ path: '/this-week', confidence: 1.0 }]
  if (days <= 30) return [{ path: '/this-month', confidence: 1.0 }]
  if (days <= 90) return [{ path: '/last-3-months', confidence: 1.0 }]
  if (days <= 180) return [{ path: '/3-6-months-ago', confidence: 1.0 }]
  return [{ path: '/older-than-6-months', confidence: 1.0 }]
}

function viewByQuarter(doc) {
  const dateStr = doc.created_date || doc.last_modified_date
  if (!dateStr) return [{ path: '/no-date', confidence: 1.0 }]
  const date = new Date(dateStr)
  const year = date.getFullYear()
  const month = date.getMonth()
  const quarter = Math.floor(month / 3) + 1
  const monthNames = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december']

  const now = new Date()
  const nowYear = now.getFullYear()
  const nowQ = Math.floor(now.getMonth() / 3) + 1

  if (year === nowYear && quarter === nowQ) {
    return [{ path: `/${year}-q${quarter}-current/${monthNames[month]}`, confidence: 1.0 }]
  }
  if (year < nowYear - 1 || (year === nowYear - 1 && quarter <= 2)) {
    return [{ path: `/${year}-q${quarter}-and-earlier`, confidence: 1.0 }]
  }
  return [{ path: `/${year}-q${quarter}/${monthNames[month]}`, confidence: 1.0 }]
}

function viewBeforeIJoined(doc) {
  const dateStr = doc.created_date
  if (!dateStr) return [{ path: '/unknown-timeline', confidence: 1.0 }]
  const days = daysAgo(dateStr)

  if (days <= 42) {
    const sub = doc.created_by === 'Maya' ? 'created-by-me' : 'created-by-team'
    return [{ path: `/created-during-my-time-as-lead/${sub}`, confidence: 1.0 }]
  }
  if (days <= 548) {
    const mayaContributed = (doc.contributors || []).includes('Maya Chen') || doc.owner === 'Maya Chen' || doc.last_edited_by_me
    const sub = mayaContributed ? 'docs-i-contributed-to' : 'docs-i-never-touched'
    return [{ path: `/created-while-i-was-an-ic/${sub}`, confidence: 1.0 }]
  }
  let healthSub = 'still-active'
  if (['stale', 'obsolete'].includes(doc.staleness_flag)) healthSub = 'stale-or-obsolete'
  else if (doc.staleness_flag === 'aging') healthSub = 'aging'
  return [{ path: `/before-my-time/${healthSub}`, confidence: 1.0 }]
}

function viewMyEngagement(doc) {
  const paths = []
  if (doc.bookmarked_by_me) paths.push({ path: '/favorites-bookmarked', confidence: 1.0 })
  if (doc.times_opened_by_me > 10) paths.push({ path: '/frequently-visited', confidence: 1.0 })

  if (paths.length > 0) return paths

  if (doc.times_opened_by_me === 0) return [{ path: '/never-opened', confidence: 1.0 }]

  if (doc.last_edited_by_me) return [{ path: '/docs-ive-edited', confidence: 1.0 }]

  if (doc.last_opened_by_me) {
    const days = daysAgo(doc.last_opened_by_me)
    if (days <= 7) return [{ path: '/opened-recently', confidence: 1.0 }]
    if (days <= 30) return [{ path: '/opened-this-month', confidence: 1.0 }]
    if (days > 90) return [{ path: '/havent-opened-in-3-plus-months', confidence: 1.0 }]
  }

  return [{ path: '/opened-this-month', confidence: 0.8 }]
}

function viewTeamHotspots(doc) {
  const paths = []
  if (doc.unique_viewers_30d >= 15) paths.push({ path: '/high-activity', confidence: 1.0 })
  if (doc.linked_in_slack >= 10) paths.push({ path: '/buzzing-in-slack', confidence: 1.0 })
  if (doc.linked_in_prs >= 3) paths.push({ path: '/linked-in-prs', confidence: 1.0 })
  if (doc.linked_in_tickets >= 3) paths.push({ path: '/referenced-in-tickets', confidence: 1.0 })

  if (paths.length > 0) return paths

  if (doc.last_commented_on && daysAgo(doc.last_commented_on) <= 7) {
    return [{ path: '/recently-commented', confidence: 0.9 }]
  }
  return [{ path: '/uncategorized', confidence: 0.2 }]
}

function viewMostSearched(doc) {
  const sa = doc.search_appearances || 0
  const sc = doc.search_clicks || 0
  if (sa >= 20 && sc >= 10) return [{ path: '/high-search-high-click', confidence: 1.0 }]
  if (sa >= 20 && sc < 10) return [{ path: '/high-search-low-click', confidence: 1.0 }]
  if (sa < 20 && sc >= 5) return [{ path: '/low-search-high-click', confidence: 1.0 }]
  return [{ path: '/never-searched', confidence: 1.0 }]
}

function viewForYourMeetings(doc) {
  const meetings = doc.meetings || []
  if (meetings.length === 0) {
    if (doc.staleness_flag === 'active' && doc.linked_in_slack >= 5) {
      return [{ path: '/uncategorized', confidence: 0.3 }]
    }
    return [{ path: '/uncategorized', confidence: 0.1 }]
  }
  const meetingKeys = ['weekly-sync', 'atlas-design-review', 'sprint-planning']
  const matched = meetings.some(m => meetingKeys.some(k => m.includes(k)))
  if (!matched) {
    return [{ path: '/uncategorized', confidence: 0.3 }]
  }

  if (meetings.some(m => m.includes('weekly-sync') || m.includes('atlas-design-review'))) {
    return [{ path: '/today', confidence: 1.0 }]
  }
  return [{ path: '/this-week', confidence: 1.0 }]
}

function viewMeetingArchive(doc) {
  if (doc.category !== 'Meeting Notes') {
    if ((doc.tags || []).some(t => ['sync', 'standup', 'design-review', '1:1', 'retro', 'all-hands'].includes(t))) {
      return [{ path: '/uncategorized', confidence: 0.3 }]
    }
    return [{ path: '/uncategorized', confidence: 0.1 }]
  }
  const tags = doc.tags || []

  let meetingType = 'miscellaneous'
  if (tags.includes('sync') && tags.includes('weekly-cadence')) meetingType = 'weekly-syncs'
  else if (tags.includes('standup')) {
    const projects = doc.projects || []
    if (projects.includes('project-atlas')) return [{ path: '/project-standups/atlas', confidence: 1.0 }]
    if (projects.includes('project-guardrails')) return [{ path: '/project-standups/guardrails', confidence: 1.0 }]
    if (projects.includes('project-retrieval-v2')) return [{ path: '/project-standups/retrieval-v2', confidence: 1.0 }]
    if (projects.includes('project-enterprise-rollout')) return [{ path: '/project-standups/enterprise', confidence: 1.0 }]
    return [{ path: '/project-standups/other', confidence: 1.0 }]
  }
  else if (tags.includes('design-review')) meetingType = 'design-reviews'
  else if (tags.includes('1:1')) meetingType = 'one-on-ones'
  else if (tags.includes('retro')) meetingType = 'sprint-retros'
  else if (tags.includes('all-hands')) meetingType = 'all-hands'
  else if (tags.some(t => ['multilingual', 'ideation', 'multi-agent', 'personality'].includes(t))) meetingType = 'brainstorms'

  if (meetingType === 'weekly-syncs') {
    const date = new Date(doc.created_date)
    const months = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december']
    const monthName = months[date.getMonth()]
    const year = date.getFullYear()
    return [{ path: `/weekly-syncs/${monthName}-${year}`, confidence: 1.0 }]
  }
  return [{ path: `/${meetingType}`, confidence: 1.0 }]
}

function viewNeedsAttention(doc) {
  if (['stale', 'obsolete'].includes(doc.staleness_flag) && doc.linked_in_tickets > 0) {
    return [{ path: '/stale-but-still-referenced', confidence: 1.0 }]
  }
  if (doc.category === 'Architecture Decision Records' && ['draft', 'in review'].includes(doc.status)) {
    return [{ path: '/open-decisions', confidence: 1.0 }]
  }
  if (doc.review_due_date && new Date(doc.review_due_date) < new Date()) {
    return [{ path: '/overdue-for-review', confidence: 1.0 }]
  }
  if (doc.status === 'deprecated') {
    return [{ path: '/deprecated-but-not-archived', confidence: 1.0 }]
  }
  if (doc.superseded_by) {
    return [{ path: '/superseded-newer-version-exists', confidence: 1.0 }]
  }
  if (doc.staleness_flag === 'aging' || doc.staleness_flag === 'stale') {
    return [{ path: '/uncategorized', confidence: 0.3 }]
  }
  return [{ path: '/uncategorized', confidence: 0.1 }]
}

function viewArchiveCandidates(doc) {
  const isDeparted = TEAM_DEPARTED.includes(doc.owner)
  if (doc.linked_in_tickets > 0 && doc.last_modified_date && daysAgo(doc.last_modified_date) > 90) {
    return [{ path: '/keep-despite-age/old-but-still-referenced-in-tickets', confidence: 1.0 }]
  }
  if (doc.search_clicks > 10 && doc.last_modified_date && daysAgo(doc.last_modified_date) > 90) {
    return [{ path: '/keep-despite-age/old-but-high-search-traffic', confidence: 1.0 }]
  }
  if (doc.staleness_flag === 'obsolete' && doc.unique_viewers_30d <= 1) {
    return [{ path: '/safe-to-archive/obsolete-zero-recent-views', confidence: 1.0 }]
  }
  if (doc.superseded_by) {
    return [{ path: '/safe-to-archive/superseded-by-newer-version', confidence: 1.0 }]
  }
  if (doc.status === 'deprecated' && doc.linked_in_tickets === 0 && doc.linked_in_slack <= 1) {
    return [{ path: '/safe-to-archive/deprecated-no-active-references', confidence: 1.0 }]
  }
  if (['stale', 'obsolete'].includes(doc.staleness_flag) && isDeparted) {
    return [{ path: '/probably-safe/stale-departed-owner', confidence: 0.9 }]
  }
  if (doc.last_modified_date && daysAgo(doc.last_modified_date) > 180) {
    return [{ path: '/probably-safe/no-activity-in-6-plus-months', confidence: 0.9 }]
  }
  if (doc.status === 'draft' && doc.staleness_flag !== 'active') {
    return [{ path: '/probably-safe/draft-never-completed', confidence: 0.9 }]
  }
  return [{ path: '/uncategorized', confidence: 0.2 }]
}

function viewDuplicatesConflicts(doc, _allDocs, allLinks) {
  if (doc.duplicate_of) return [{ path: '/near-duplicates', confidence: 1.0 }]
  if (doc.supersedes || doc.superseded_by) return [{ path: '/superseded-chains', confidence: 1.0 }]

  const docLinks = allLinks.filter(l => l.source_id === doc.id || l.target_id === doc.id)
  const hasDupeLink = docLinks.some(l => l.link_type === 'duplicate_of')
  if (hasDupeLink) return [{ path: '/near-duplicates', confidence: 0.8 }]

  const hasSupersede = docLinks.some(l => l.link_type === 'supersedes')
  if (hasSupersede) return [{ path: '/superseded-chains', confidence: 0.8 }]

  return [{ path: '/uncategorized', confidence: 0.2 }]
}

function viewWhatBroke(doc, _allDocs, allLinks) {
  if (!['Incident Reports', 'Deployment Postmortems'].includes(doc.category)) {
    const tags = doc.tags || []
    if (tags.some(t => ['pii', 'safety', 'data-breach', 'incident', 'outage', 'postmortem'].includes(t))) {
      return [{ path: '/uncategorized', confidence: 0.3 }]
    }
    return [{ path: '/uncategorized', confidence: 0.1 }]
  }
  const tags = doc.tags || []

  if (doc.category === 'Deployment Postmortems') {
    const hasFollowUp = tags.some(t => ['follow-up', 'action-items', 'remediation'].includes(t)) ||
      allLinks.some(l => l.source_id === doc.id && l.link_type === 'informs')
    return [{ path: hasFollowUp ? '/postmortems/with-follow-up-actions' : '/postmortems/without-follow-up', confidence: 1.0 }]
  }

  if (doc.status === 'in review') return [{ path: '/open-needs-resolution', confidence: 1.0 }]

  if (tags.some(t => ['pii', 'safety', 'data-breach', 'medical', 'data-leak'].includes(t))) {
    return [{ path: '/by-severity/safety-and-pii', confidence: 1.0 }]
  }
  if (tags.some(t => ['accuracy', 'hallucination', 'numerical-error', 'contradiction'].includes(t))) {
    return [{ path: '/by-severity/accuracy-and-hallucination', confidence: 1.0 }]
  }
  if (tags.some(t => ['escalation', 'routing-failure'].includes(t))) {
    return [{ path: '/by-severity/escalation-failures', confidence: 1.0 }]
  }
  if (tags.some(t => ['latency', 'timeout', 'rate-limit', 'oom', 'infinite-loop'].includes(t))) {
    return [{ path: '/by-severity/infrastructure', confidence: 1.0 }]
  }

  const projects = doc.projects || []
  if (projects.includes('project-atlas')) return [{ path: '/by-project/atlas', confidence: 1.0 }]
  if (projects.includes('project-guardrails')) return [{ path: '/by-project/guardrails', confidence: 1.0 }]
  if (projects.includes('project-claimsbot')) return [{ path: '/by-project/claimsbot', confidence: 1.0 }]
  return [{ path: '/by-project/other', confidence: 1.0 }]
}

function viewWhatWereBuilding(doc) {
  if (!['active'].includes(doc.staleness_flag) && !['current', 'draft', 'in review'].includes(doc.status)) {
    if (doc.staleness_flag === 'aging' && (doc.projects || []).length > 0) {
      return [{ path: '/uncategorized', confidence: 0.3 }]
    }
    return [{ path: '/uncategorized', confidence: 0.1 }]
  }
  const projects = doc.projects || []
  if (projects.length === 0) {
    return [{ path: '/uncategorized', confidence: 0.3 }]
  }

  const proj = projects[0]
  const projSlug = slugify(PROJECT_DISPLAY[proj] || proj)

  if (doc.category === 'Experiment Logs' && doc.staleness_flag === 'active') return [{ path: `/${projSlug}/active-experiments`, confidence: 1.0 }]
  if (doc.category === 'Eval Reports' && doc.staleness_flag === 'active') return [{ path: `/${projSlug}/latest-eval-results`, confidence: 1.0 }]
  if (doc.category === 'Prompt Libraries' && doc.status === 'current') return [{ path: `/${projSlug}/current-prompts`, confidence: 1.0 }]
  if (doc.category === 'Architecture Decision Records' && ['draft', 'in review'].includes(doc.status)) return [{ path: `/${projSlug}/open-decisions`, confidence: 1.0 }]

  if (doc.staleness_flag === 'active') return [{ path: `/${projSlug}`, confidence: 0.8 }]
  return [{ path: '/uncategorized', confidence: 0.3 }]
}

function viewHowDoI(doc) {
  if (doc.category !== 'Runbooks') {
    const tags = doc.tags || []
    if (tags.some(t => ['deployment', 'rollback', 'release', 'eval', 'infrastructure', 'how-to', 'guide'].includes(t))) {
      return [{ path: '/uncategorized', confidence: 0.3 }]
    }
    return [{ path: '/uncategorized', confidence: 0.1 }]
  }
  const tags = doc.tags || []

  if (tags.some(t => ['deployment', 'rollback', 'release', 'production'].includes(t))) return [{ path: '/deployment-and-releases', confidence: 1.0 }]
  if (tags.some(t => ['eval', 'eval-pipeline'].includes(t))) return [{ path: '/eval-and-testing', confidence: 1.0 }]
  if (tags.some(t => ['knowledge-base', 'reindex', 'kb-sync', 'confluence'].includes(t))) return [{ path: '/knowledge-base', confidence: 1.0 }]
  if (tags.some(t => ['client', 'onboarding', 'vpc', 'data-pipeline'].includes(t))) return [{ path: '/client-operations', confidence: 1.0 }]
  if (tags.some(t => ['tool-use', 'agent', 'guardrails', 'rule', 'configuration'].includes(t))) return [{ path: '/agent-configuration', confidence: 1.0 }]
  if (tags.some(t => ['gpu', 'infrastructure', 'api-keys', 'atlassian'].includes(t))) return [{ path: '/infrastructure', confidence: 1.0 }]
  return [{ path: '/other', confidence: 0.8 }]
}

function viewWhatDidWeDecide(doc) {
  const isADR = doc.category === 'Architecture Decision Records'
  const tags = doc.tags || []
  const isInformalDecision = !isADR && tags.includes('decision')
  if (!isADR && !isInformalDecision) {
    if (tags.some(t => ['decision', 'trade-off', 'proposal', 'rfc'].includes(t))) {
      return [{ path: '/uncategorized', confidence: 0.3 }]
    }
    return [{ path: '/uncategorized', confidence: 0.1 }]
  }

  if (isInformalDecision) return [{ path: '/informal-decisions', confidence: 0.8 }]

  if (['draft', 'in review'].includes(doc.status)) return [{ path: '/active-decisions', confidence: 1.0 }]
  if (doc.status === 'deprecated' || doc.staleness_flag === 'obsolete') return [{ path: '/historical-deprecated', confidence: 1.0 }]

  if (tags.some(t => ['retrieval', 'embeddings', 'chunking', 'rag'].includes(t))) return [{ path: '/accepted-decisions/retrieval-and-embeddings', confidence: 1.0 }]
  if (tags.some(t => ['infrastructure', 'async', 'streaming', 'performance'].includes(t))) return [{ path: '/accepted-decisions/infrastructure', confidence: 1.0 }]
  if (tags.some(t => ['guardrails', 'safety', 'middleware'].includes(t))) return [{ path: '/accepted-decisions/safety', confidence: 1.0 }]
  return [{ path: '/accepted-decisions/agent-architecture', confidence: 0.8 }]
}

function viewWhatDoWeKnow(doc) {
  if (!['Model Cards', 'Research Notes'].includes(doc.category)) {
    const tags = doc.tags || []
    if (tags.some(t => ['research', 'paper', 'literature-review', 'model', 'benchmark'].includes(t))) {
      return [{ path: '/uncategorized', confidence: 0.3 }]
    }
    return [{ path: '/uncategorized', confidence: 0.1 }]
  }
  const tags = doc.tags || []

  if (doc.category === 'Model Cards') {
    if (doc.status === 'deprecated' || doc.staleness_flag === 'obsolete') return [{ path: '/models-we-use/deprecated-models', confidence: 1.0 }]
    if (tags.includes('voyage') || tags.includes('embeddings')) return [{ path: '/models-we-use/voyage-embeddings', confidence: 1.0 }]
    if (tags.includes('sonnet') || tags.includes('claude-3.5')) return [{ path: '/models-we-use/sonnet', confidence: 1.0 }]
    if (tags.includes('haiku')) return [{ path: '/models-we-use/haiku', confidence: 1.0 }]
    if (tags.includes('opus')) return [{ path: '/models-we-use/opus', confidence: 1.0 }]
    return [{ path: '/models-we-use', confidence: 0.8 }]
  }

  if (tags.includes('competitor')) {
    if (tags.includes('moveworks')) return [{ path: '/competitive-intelligence/moveworks', confidence: 1.0 }]
    if (tags.includes('intercom')) return [{ path: '/competitive-intelligence/intercom-fin', confidence: 1.0 }]
    if (tags.includes('sierra')) return [{ path: '/competitive-intelligence/sierra', confidence: 1.0 }]
    return [{ path: '/competitive-intelligence', confidence: 0.8 }]
  }
  if (tags.includes('cost') || tags.includes('budget')) return [{ path: '/cost-analysis', confidence: 1.0 }]
  if (tags.some(t => ['agent', 'toolformer', 'react', 'multi-agent', 'tool-use'].includes(t))) return [{ path: '/research-and-papers/agent-architecture', confidence: 1.0 }]
  if (tags.some(t => ['retrieval', 'rag', 'graph', 'memory', 'embeddings'].includes(t))) return [{ path: '/research-and-papers/retrieval-techniques', confidence: 1.0 }]
  if (tags.some(t => ['safety', 'alignment', 'constitutional-ai', 'rlhf', 'rlaif', 'guardrails'].includes(t))) return [{ path: '/research-and-papers/safety-and-alignment', confidence: 1.0 }]
  if (tags.some(t => ['eval', 'methodology', 'literature-review'].includes(t))) return [{ path: '/research-and-papers/eval-methodology', confidence: 1.0 }]
  return [{ path: '/research-and-papers', confidence: 0.8 }]
}

function viewBySensitivity(doc) {
  const sens = doc.sensitivity || 'internal'
  if (sens === 'client-restricted') {
    const tags = doc.tags || []
    const clientTag = tags.find(t => t.startsWith('client-'))
    if (clientTag) return [{ path: `/client-restricted/${clientTag}`, confidence: 1.0 }]
    if (tags.includes('atlassian')) return [{ path: '/client-restricted/atlassian', confidence: 1.0 }]
    return [{ path: '/client-restricted/other', confidence: 1.0 }]
  }
  if (sens === 'team-only') {
    const tags = doc.tags || []
    if (tags.some(t => ['cost', 'budget'].includes(t))) return [{ path: '/team-only/cost-and-budget', confidence: 1.0 }]
    if (tags.includes('1:1')) return [{ path: '/team-only/one-on-one-notes', confidence: 1.0 }]
    if (tags.includes('competitor')) return [{ path: '/team-only/competitive-intelligence', confidence: 1.0 }]
    return [{ path: '/team-only', confidence: 1.0 }]
  }
  return [{ path: '/internal-general', confidence: 1.0 }]
}

function viewConnectionThreads(doc, allDocs, allLinks) {
  const THREAD_LINK_TYPES = ['informs', 'references', 'supersedes', 'related', 'duplicate_of']
  const docLinks = allLinks.filter(l => l.source_id === doc.id || l.target_id === doc.id)
  if (docLinks.length === 0) return [{ path: '/unconnected-documents', confidence: 0.7 }]

  const relevantLinks = docLinks.filter(l => THREAD_LINK_TYPES.includes(l.link_type))
  if (relevantLinks.length === 0) return [{ path: '/unconnected-documents', confidence: 0.7 }]

  const threadName = findThreadName(doc, allDocs, allLinks, THREAD_LINK_TYPES)
  return [{ path: `/${slugify(threadName)}`, confidence: 0.7 }]
}

function findThreadName(doc, allDocs, allLinks, linkTypes) {
  const validTypes = linkTypes || ['informs', 'references', 'supersedes', 'related', 'duplicate_of']
  const visited = new Set()
  const queue = [doc.id]
  const clusterDocs = []

  while (queue.length > 0) {
    const current = queue.shift()
    if (visited.has(current)) continue
    visited.add(current)
    const currentDoc = allDocs.find(d => d.id === current)
    if (currentDoc) clusterDocs.push(currentDoc)

    const neighbors = allLinks
      .filter(l => (l.source_id === current || l.target_id === current) && validTypes.includes(l.link_type))
      .map(l => l.source_id === current ? l.target_id : l.source_id)

    for (const n of neighbors) {
      if (!visited.has(n)) queue.push(n)
    }
  }

  const incidents = clusterDocs.filter(d => ['Incident Reports', 'Deployment Postmortems'].includes(d.category))
  if (incidents.length > 0) {
    const primary = incidents[0]
    const shortTitle = primary.title.replace(/^(Postmortem|Incident): /, '').substring(0, 40)
    return `${shortTitle} thread`
  }
  const adrs = clusterDocs.filter(d => d.category === 'Architecture Decision Records')
  if (adrs.length > 0) return `${adrs[0].title.substring(0, 40)} thread`
  return `${clusterDocs[0]?.title?.substring(0, 40) || 'unknown'} thread`
}

function viewOrphanedDocuments(doc, _allDocs, allLinks) {
  const linkCount = allLinks.filter(l => l.source_id === doc.id || l.target_id === doc.id).length
  const meetings = doc.meetings || []
  const projects = doc.projects || []

  if (linkCount === 0 && meetings.length === 0) return [{ path: '/no-links-no-meeting-tags', confidence: 1.0 }]
  if (linkCount === 0 && meetings.length > 0) return [{ path: '/no-links-has-meeting-tags', confidence: 1.0 }]
  if (linkCount > 0 && projects.length === 0) return [{ path: '/has-links-but-no-project-tag', confidence: 1.0 }]
  return [{ path: '/uncategorized', confidence: 0.2 }]
}

function viewSprintView(doc) {
  if (doc.category === 'Experiment Logs' && doc.staleness_flag === 'active') return [{ path: '/active-experiments', confidence: 1.0 }]
  if (doc.category === 'Incident Reports' && doc.status === 'in review') return [{ path: '/open-incidents', confidence: 1.0 }]
  if (doc.category === 'Architecture Decision Records' && ['draft', 'in review'].includes(doc.status)) return [{ path: '/decisions-pending', confidence: 1.0 }]
  if (doc.last_modified_date && daysAgo(doc.last_modified_date) <= 14 && doc.staleness_flag === 'active') return [{ path: '/docs-modified-this-sprint', confidence: 1.0 }]
  if ((doc.meetings || []).length > 0 && doc.staleness_flag === 'active') return [{ path: '/upcoming-meeting-prep', confidence: 1.0 }]
  if (doc.staleness_flag === 'active') {
    return [{ path: '/uncategorized', confidence: 0.3 }]
  }
  return [{ path: '/uncategorized', confidence: 0.1 }]
}

function viewOnboarding(doc) {
  if (doc.status !== 'current' || !['active', 'aging'].includes(doc.staleness_flag)) {
    if (doc.total_views >= 20 || doc.search_clicks >= 5) {
      return [{ path: '/uncategorized', confidence: 0.3 }]
    }
    return [{ path: '/uncategorized', confidence: 0.1 }]
  }
  if (doc.total_views < 10 && doc.search_clicks < 3) {
    return [{ path: '/uncategorized', confidence: 0.3 }]
  }

  if (doc.category === 'Model Cards' && doc.tags?.includes('guide')) return [{ path: '/start-here', confidence: 1.0 }]
  if (doc.category === 'Runbooks' && doc.tags?.some(t => ['deployment', 'model'].includes(t))) return [{ path: '/start-here', confidence: 1.0 }]
  if (doc.category === 'Prompt Libraries' && doc.status === 'current' && doc.tags?.includes('production')) return [{ path: '/start-here', confidence: 1.0 }]

  if (doc.category === 'Architecture Decision Records' && doc.status === 'current') return [{ path: '/understand-our-architecture', confidence: 1.0 }]

  if (doc.category === 'Incident Reports' && doc.linked_in_tickets >= 2) return [{ path: '/learn-from-our-mistakes', confidence: 1.0 }]
  if (doc.category === 'Deployment Postmortems') return [{ path: '/learn-from-our-mistakes', confidence: 1.0 }]

  if (doc.category === 'Runbooks') return [{ path: '/operational-guides', confidence: 1.0 }]

  const projects = doc.projects || []
  if (projects.includes('project-atlas') && doc.total_views >= 20) return [{ path: '/project-deep-dives/atlas', confidence: 1.0 }]
  if (projects.includes('project-guardrails') && doc.total_views >= 20) return [{ path: '/project-deep-dives/guardrails', confidence: 1.0 }]
  if (projects.includes('project-retrieval-v2') && doc.total_views >= 20) return [{ path: '/project-deep-dives/retrieval-v2', confidence: 1.0 }]

  return [{ path: '/uncategorized', confidence: 0.3 }]
}

function viewVPReviewPrep(doc) {
  if (doc.staleness_flag !== 'active' && doc.staleness_flag !== 'aging') {
    return [{ path: '/uncategorized', confidence: 0.1 }]
  }

  if (doc.category === 'Experiment Logs' && doc.status === 'current' && doc.last_modified_date && daysAgo(doc.last_modified_date) <= 90) {
    return [{ path: '/what-we-shipped-last-quarter/completed-experiments', confidence: 1.0 }]
  }
  if (doc.category === 'Prompt Libraries' && doc.status === 'current' && doc.tags?.includes('production')) {
    return [{ path: '/what-we-shipped-last-quarter/deployed-prompts', confidence: 1.0 }]
  }
  if (doc.category === 'Incident Reports' && doc.status === 'current' && doc.last_modified_date && daysAgo(doc.last_modified_date) <= 90) {
    return [{ path: '/what-we-shipped-last-quarter/resolved-incidents', confidence: 1.0 }]
  }

  if (['Experiment Logs', 'Eval Reports'].includes(doc.category) && doc.staleness_flag === 'active' && ['draft', 'in review'].includes(doc.status)) {
    return [{ path: '/whats-in-progress/active-by-project', confidence: 1.0 }]
  }
  if (doc.category === 'Architecture Decision Records' && ['draft', 'in review'].includes(doc.status)) {
    return [{ path: '/whats-in-progress/key-open-decisions', confidence: 1.0 }]
  }

  if (doc.category === 'Deployment Postmortems' && doc.last_modified_date && daysAgo(doc.last_modified_date) <= 90) {
    return [{ path: '/what-failed-and-why', confidence: 1.0 }]
  }

  if (doc.category === 'Eval Reports' && doc.staleness_flag === 'active' && doc.tags?.some(t => ['weekly-cadence', 'accuracy'].includes(t))) {
    return [{ path: '/key-metrics/latest-eval-results', confidence: 1.0 }]
  }
  if (doc.category === 'Research Notes' && doc.tags?.includes('cost')) {
    return [{ path: '/key-metrics/cost-analysis', confidence: 1.0 }]
  }

  if (doc.staleness_flag === 'active' || doc.staleness_flag === 'aging') {
    return [{ path: '/uncategorized', confidence: 0.3 }]
  }
  return [{ path: '/uncategorized', confidence: 0.1 }]
}

// Map view IDs to grouping functions
const VIEW_FUNCTIONS = {
  'by-project': viewByProject,
  'by-document-type': viewByDocumentType,
  'by-client': viewByClient,
  'by-owner': viewByOwner,
  'team-vs-alumni': viewTeamVsAlumni,
  'by-recency': viewByRecency,
  'by-quarter': viewByQuarter,
  'before-i-joined': viewBeforeIJoined,
  'my-engagement': viewMyEngagement,
  'team-hotspots': viewTeamHotspots,
  'most-searched': viewMostSearched,
  'for-your-meetings': viewForYourMeetings,
  'meeting-archive': viewMeetingArchive,
  'needs-attention': viewNeedsAttention,
  'archive-candidates': viewArchiveCandidates,
  'duplicates-conflicts': viewDuplicatesConflicts,
  'what-broke': viewWhatBroke,
  'what-were-building': viewWhatWereBuilding,
  'how-do-i': viewHowDoI,
  'what-did-we-decide': viewWhatDidWeDecide,
  'what-do-we-know': viewWhatDoWeKnow,
  'by-sensitivity': viewBySensitivity,
  'connection-threads': viewConnectionThreads,
  'orphaned-documents': viewOrphanedDocuments,
  'sprint-view': viewSprintView,
  'onboarding': viewOnboarding,
  'vp-review-prep': viewVPReviewPrep,
}

// ─── Display name generator from slug ──────────────────────────────────────

function displayNameFromSlug(slug) {
  return slug
    .replace(/^\//, '')
    .split('/')
    .pop()
    .replace(/-/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase())
    .replace(/\bAnd\b/g, '&')
    .replace(/\bOr\b/g, 'or')
    .replace(/\bIn\b/g, 'in')
    .replace(/\bFor\b/g, 'for')
    .replace(/\bOf\b/g, 'of')
    .replace(/\bThe\b/g, 'the')
    .replace(/\bTo\b/g, 'to')
    .replace(/\bVs\b/g, 'vs')
    .replace(/\bBy\b/g, 'by')
    .replace(/\bA\b(?!tlas|isha|lex|dr)/g, 'a')
    .replace(/^./, c => c.toUpperCase())
}

// ─── Main ──────────────────────────────────────────────────────────────────

async function seed() {
  const client = new Client({ connectionString: process.env.DATABASE_URL })
  await client.connect()
  console.log('Connected to Supabase Postgres')

  // Read all documents and links
  const { rows: allDocs } = await client.query(
    `SELECT id, document_id, title, category, status, staleness_flag, owner, created_by,
            created_date, last_modified_date, last_modified_by, contributors,
            projects, tags, meetings, sensitivity,
            last_opened_by_me, times_opened_by_me, last_edited_by_me, bookmarked_by_me,
            total_views, unique_viewers_30d, linked_in_slack, linked_in_tickets, linked_in_prs,
            search_appearances, search_clicks, last_commented_on,
            supersedes, superseded_by, duplicate_of, review_due_date,
            folder_path
     FROM edra_documents`
  )
  console.log(`✓ Read ${allDocs.length} documents`)

  const { rows: allLinks } = await client.query(
    `SELECT id, source_id, target_id, link_type FROM edra_document_links`
  )
  console.log(`✓ Read ${allLinks.length} links`)

  // Drop and recreate view tables
  await client.query(`DROP TABLE IF EXISTS edra_view_folders CASCADE`)
  await client.query(`DROP TABLE IF EXISTS edra_view_paths CASCADE`)
  await client.query(`DROP TABLE IF EXISTS edra_workspace_views CASCADE`)
  console.log('✓ Dropped existing view tables')

  await client.query(`
    CREATE TABLE edra_workspace_views (
      id text PRIMARY KEY,
      name text NOT NULL,
      category text NOT NULL
        CHECK (category IN (
          'project', 'people', 'temporal', 'behavioral',
          'calendar', 'health', 'intent',
          'sensitivity', 'relationship', 'composite'
        )),
      description text,
      is_filtered boolean DEFAULT false,
      sort_order integer DEFAULT 0,
      is_system boolean NOT NULL DEFAULT false,
      visibility text NOT NULL DEFAULT 'private'
        CHECK (visibility IN ('private', 'shared', 'team')),
      shared_with jsonb DEFAULT '[]',
      derivation jsonb,
      evidence_summary jsonb,
      source_tooltip text,
      avg_confidence real,
      confidence_level text CHECK (confidence_level IN ('high', 'moderate', 'low')),
      CHECK (NOT is_system OR visibility = 'private')
    )
  `)

  await client.query(`
    CREATE TABLE edra_view_paths (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      view_id text NOT NULL REFERENCES edra_workspace_views(id) ON DELETE CASCADE,
      document_id uuid NOT NULL REFERENCES edra_documents(id) ON DELETE CASCADE,
      folder_path text NOT NULL,
      position integer DEFAULT 0,
      confidence real NOT NULL DEFAULT 1.0
    )
  `)
  await client.query(`CREATE INDEX edra_vp_view_idx ON edra_view_paths(view_id)`)
  await client.query(`CREATE INDEX edra_vp_doc_idx ON edra_view_paths(document_id)`)
  await client.query(`CREATE INDEX edra_vp_view_path_idx ON edra_view_paths(view_id, folder_path)`)

  await client.query(`
    CREATE TABLE edra_view_folders (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      view_id text NOT NULL REFERENCES edra_workspace_views(id) ON DELETE CASCADE,
      folder_path text NOT NULL,
      display_name text NOT NULL,
      description text,
      UNIQUE(view_id, folder_path)
    )
  `)
  await client.query(`CREATE INDEX edra_vf_view_idx ON edra_view_folders(view_id)`)

  // RLS
  for (const table of ['edra_workspace_views', 'edra_view_paths', 'edra_view_folders']) {
    await client.query(`ALTER TABLE "${table}" ENABLE ROW LEVEL SECURITY`)
    await client.query(`
      DO $$ BEGIN
        CREATE POLICY "${table}_public_read" ON "${table}"
          FOR SELECT USING (true);
      EXCEPTION
        WHEN duplicate_object THEN NULL;
      END $$
    `)
  }
  console.log('✓ View tables created with RLS')

  // Insert view definitions
  for (const v of VIEW_DEFS) {
    await client.query(
      `INSERT INTO edra_workspace_views (id, name, category, description, is_filtered, sort_order, is_system, visibility, shared_with, derivation, evidence_summary, source_tooltip)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
      [v.id, v.name, v.category, v.description, v.isFiltered, v.sortOrder, v.isSystem, v.visibility, JSON.stringify(v.sharedWith), JSON.stringify(v.derivation), v.evidenceSummary ? JSON.stringify(v.evidenceSummary) : null, v.sourceTooltip ?? null]
    )
  }
  console.log(`✓ Inserted ${VIEW_DEFS.length} view definitions`)

  // Process each view
  let totalPaths = 0
  let totalFolders = 0

  for (const viewDef of VIEW_DEFS) {
    const fn = VIEW_FUNCTIONS[viewDef.id]
    if (!fn) {
      console.warn(`  ⚠ No grouping function for view "${viewDef.id}", skipping`)
      continue
    }

    const folderSet = new Map()
    let pathCount = 0

    for (const doc of allDocs) {
      const assignments = fn(doc, allDocs, allLinks)
      for (let i = 0; i < assignments.length; i++) {
        const { path, confidence } = assignments[i]
        await client.query(
          `INSERT INTO edra_view_paths (view_id, document_id, folder_path, position, confidence)
           VALUES ($1, $2, $3, $4, $5)`,
          [viewDef.id, doc.id, path, i, confidence ?? 1.0]
        )
        pathCount++

        const segments = path.split('/').filter(Boolean)
        let built = ''
        for (const seg of segments) {
          built += '/' + seg
          if (!folderSet.has(`${viewDef.id}:${built}`)) {
            folderSet.set(`${viewDef.id}:${built}`, built)
          }
        }
      }
    }

    for (const [, folderPath] of folderSet) {
      const displayName = displayNameFromSlug(folderPath)
      await client.query(
        `INSERT INTO edra_view_folders (view_id, folder_path, display_name)
         VALUES ($1, $2, $3)
         ON CONFLICT (view_id, folder_path) DO NOTHING`,
        [viewDef.id, folderPath, displayName]
      )
    }

    totalPaths += pathCount
    totalFolders += folderSet.size
    console.log(`  ✓ ${viewDef.id}: ${pathCount} paths, ${folderSet.size} folders`)
  }

  console.log(`\n✓ Total: ${totalPaths} path assignments, ${totalFolders} folder entries`)

  await client.query(`
    UPDATE edra_workspace_views v
    SET avg_confidence = sub.avg_conf
    FROM (
      SELECT view_id, ROUND(AVG(confidence)::numeric, 2) as avg_conf
      FROM edra_view_paths GROUP BY view_id
    ) sub
    WHERE v.id = sub.view_id
  `)
  console.log('✓ Computed avg_confidence for all views')

  await client.query(`
    UPDATE edra_workspace_views
    SET confidence_level = CASE
      WHEN avg_confidence >= 0.85 THEN 'high'
      WHEN avg_confidence >= 0.6  THEN 'moderate'
      ELSE 'low'
    END
  `)
  console.log('✓ Derived confidence_level for all views')

  await client.end()
  console.log('Done.')
}

seed().catch((err) => {
  console.error('Seed views failed:', err)
  process.exit(1)
})
