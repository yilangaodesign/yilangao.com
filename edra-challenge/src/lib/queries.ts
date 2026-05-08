import pg from 'pg'

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  max: 5,
})

type CalendarEntry = {
  time: string
  hour: number
  minute: number
  durationMin: number
  title: string
  meetingKey: string
}

export const MAYA_CALENDAR: CalendarEntry[] = [
  { time: '11:00 AM', hour: 11, minute: 0, durationMin: 60, title: 'Weekly Sync', meetingKey: 'weekly-sync' },
  { time: '2:00 PM', hour: 14, minute: 0, durationMin: 60, title: 'Atlas Design Review', meetingKey: 'atlas-design-review' },
]

export const MAYA_CALENDAR_TOMORROW: CalendarEntry[] = [
  { time: '10:00 AM', hour: 10, minute: 0, durationMin: 30, title: 'Sprint Planning', meetingKey: 'weekly-sync' },
]

// ─── Types ────────────────────────────────────────────────────────────────────

export type MeetingDoc = {
  id: string
  title: string
  category: string
  projects: string[]
  staleness_flag: string
  linked_in_slack: number
  linked_in_prs: number
  unique_viewers_30d: number
  superseded_by: string | null
  relatedCount: number
  secondarySignal: string | null
  threadHint: string | null
}

export type MeetingGroup = {
  time: string
  title: string
  status: 'upcoming' | 'now' | 'past'
  docs: MeetingDoc[]
}

export type MeetingState = 'upcoming' | 'in-progress' | 'all-done' | 'no-meetings'

export type MeetingContext = {
  state: MeetingState
  eyebrow: string
  meetings: MeetingGroup[]
  tomorrowPreview: { time: string; title: string } | null
}

export type Relevance = { label: string; tier: 'critical' | 'attention' | 'info' }

export type ActivityEvent = {
  id: string
  actor: string
  action: string
  document_id: string
  timestamp: string
  summary: string
  doc_title: string
  doc_category: string
  relatedCount: number
  relevance: Relevance | null
}

export type BlockingItem = {
  id: string
  type: 'stale-referenced' | 'open-decision'
  title: string
  description: string
  severity: 'high' | 'medium'
  documentId: string
  relevance: Relevance
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function computeSecondarySignal(doc: { linked_in_slack: number; linked_in_prs: number; unique_viewers_30d: number; staleness_flag: string }): string | null {
  if (doc.linked_in_slack > 5) {
    return `Mentioned in ${doc.linked_in_slack} Slack threads`
  }
  if (doc.linked_in_prs > 2) {
    return `Linked in ${doc.linked_in_prs} PRs`
  }
  if (doc.unique_viewers_30d > 8) {
    return `Viewed by ${doc.unique_viewers_30d} people this month`
  }
  if (doc.staleness_flag === 'stale' || doc.staleness_flag === 'obsolete') {
    return 'Possibly outdated'
  }
  return null
}

// ─── Schedule Classification ─────────────────────────────────────────────────

function classifyEntry(entry: CalendarEntry, now: Date): 'past' | 'now' | 'upcoming' {
  const startMin = entry.hour * 60 + entry.minute
  const endMin = startMin + entry.durationMin
  const nowMin = now.getHours() * 60 + now.getMinutes()
  if (nowMin >= endMin) return 'past'
  if (nowMin >= startMin) return 'now'
  return 'upcoming'
}

function classifyMeetingState(
  calendar: CalendarEntry[],
  now: Date,
): { state: MeetingState; classified: { entry: CalendarEntry; status: 'past' | 'now' | 'upcoming' }[] } {
  if (calendar.length === 0) return { state: 'no-meetings', classified: [] }

  const classified = calendar.map(entry => ({
    entry,
    status: classifyEntry(entry, now),
  }))

  const hasNow = classified.some(c => c.status === 'now')
  const hasUpcoming = classified.some(c => c.status === 'upcoming')

  if (hasNow) return { state: 'in-progress', classified }
  if (hasUpcoming) return { state: 'upcoming', classified }
  return { state: 'all-done', classified }
}

// ─── getMeetingContext ────────────────────────────────────────────────────────

async function fetchDocsForMeeting(meetingKey: string): Promise<{ docs: MeetingDoc[] }> {
  const { rows: docs } = await pool.query(
    `SELECT id, title, category, projects, staleness_flag,
            linked_in_slack, linked_in_prs, unique_viewers_30d, superseded_by
     FROM edra_documents
     WHERE EXISTS (
       SELECT 1 FROM unnest(meetings) m WHERE m LIKE $1
     )
     ORDER BY last_opened_by_me DESC NULLS LAST
     LIMIT 4`,
    [`%${meetingKey}%`]
  )

  if (!docs.length) return { docs: [] }

  const docIds = docs.map((d: { id: string }) => d.id)
  const { rows: links } = await pool.query(
    `SELECT source_id, target_id, link_type FROM edra_document_links
     WHERE source_id = ANY($1) OR target_id = ANY($1)`,
    [docIds]
  )

  const linkCounts = new Map<string, number>()
  const threadHints = new Map<string, string>()
  for (const link of links) {
    linkCounts.set(link.source_id, (linkCounts.get(link.source_id) ?? 0) + 1)
    linkCounts.set(link.target_id, (linkCounts.get(link.target_id) ?? 0) + 1)
    if (link.link_type === 'informs' || link.link_type === 'references') {
      if (docIds.includes(link.source_id) && !threadHints.has(link.source_id)) {
        threadHints.set(link.source_id, `→ ${linkCounts.get(link.source_id) ?? 1} related doc${(linkCounts.get(link.source_id) ?? 1) > 1 ? 's' : ''}`)
      }
      if (docIds.includes(link.target_id) && !threadHints.has(link.target_id)) {
        threadHints.set(link.target_id, `→ ${linkCounts.get(link.target_id) ?? 1} related doc${(linkCounts.get(link.target_id) ?? 1) > 1 ? 's' : ''}`)
      }
    }
  }

  return {
    docs: docs.map((doc: any) => ({
      id: doc.id,
      title: doc.title,
      category: doc.category,
      projects: doc.projects,
      staleness_flag: doc.staleness_flag,
      linked_in_slack: doc.linked_in_slack,
      linked_in_prs: doc.linked_in_prs,
      unique_viewers_30d: doc.unique_viewers_30d,
      superseded_by: doc.superseded_by,
      relatedCount: linkCounts.get(doc.id) ?? 0,
      secondarySignal: computeSecondarySignal(doc),
      threadHint: threadHints.get(doc.id) ?? (linkCounts.get(doc.id) ? `→ ${linkCounts.get(doc.id)} related doc${(linkCounts.get(doc.id) ?? 0) > 1 ? 's' : ''}` : null),
    })),
  }
}

const DEMO_NOW = new Date()
DEMO_NOW.setHours(9, 0, 0, 0)

export async function getMeetingContext(): Promise<MeetingContext> {
  const { state, classified } = classifyMeetingState(MAYA_CALENDAR, DEMO_NOW)

  const eyebrowMap: Record<MeetingState, string> = {
    'upcoming': 'For your meetings',
    'in-progress': 'For your meetings',
    'all-done': 'From today\'s meetings',
    'no-meetings': 'For tomorrow\'s meetings',
  }

  try {
    let entriesToFetch: { entry: CalendarEntry; status: 'past' | 'now' | 'upcoming' }[]

    if (state === 'no-meetings') {
      entriesToFetch = MAYA_CALENDAR_TOMORROW.map(entry => ({ entry, status: 'upcoming' as const }))
    } else {
      entriesToFetch = classified
    }

    const groups: MeetingGroup[] = []
    for (const { entry, status } of entriesToFetch) {
      const { docs } = await fetchDocsForMeeting(entry.meetingKey)
      if (!docs.length) continue
      groups.push({ time: entry.time, title: entry.title, status, docs })
    }

    return {
      state,
      eyebrow: eyebrowMap[state],
      meetings: groups,
      tomorrowPreview: null,
    }
  } catch (e) {
    console.error('getMeetingContext failed:', e)
    return { state: 'no-meetings', eyebrow: eyebrowMap['no-meetings'], meetings: [], tomorrowPreview: null }
  }
}

// ─── getRecentActivity ────────────────────────────────────────────────────────

function computeActivityRelevance(row: {
  owner: string
  last_opened_by_me: string | null
  timestamp: string
  meetings: string[]
  linked_in_slack: number
  linked_in_prs: number
}): Relevance | null {
  const meetingKeys = MAYA_CALENDAR.map(m => m.meetingKey)

  if (row.owner === 'Maya Chen') {
    const lastOpened = row.last_opened_by_me ? new Date(row.last_opened_by_me).getTime() : 0
    const eventTime = new Date(row.timestamp).getTime()
    if (eventTime > lastOpened) {
      return { label: 'New activity on your doc', tier: 'info' }
    }
  }

  const matchedMeeting = (row.meetings ?? []).find(m =>
    meetingKeys.some(key => m.includes(key))
  )
  if (matchedMeeting) {
    const cal = MAYA_CALENDAR.find(c => matchedMeeting.includes(c.meetingKey))
    if (cal) {
      return { label: `For your ${cal.time} meeting`, tier: 'info' }
    }
  }

  if (row.linked_in_slack >= 12) {
    return { label: `${row.linked_in_slack} Slack threads`, tier: 'info' }
  }
  if (row.linked_in_prs >= 3) {
    return { label: `Linked in ${row.linked_in_prs} PRs`, tier: 'info' }
  }

  return null
}

export async function getRecentActivity(limit = 10): Promise<ActivityEvent[]> {
  try {
    const { rows } = await pool.query(
      `SELECT e.id, e.actor, e.action, e.document_id, e."timestamp", e.summary,
              d.title as doc_title, d.category as doc_category,
              d.owner, d.last_opened_by_me, d.meetings,
              d.linked_in_slack, d.linked_in_prs
       FROM edra_activity_events e
       JOIN edra_documents d ON d.id = e.document_id
       ORDER BY e."timestamp" DESC
       LIMIT $1`,
      [limit]
    )

    if (!rows.length) return []

    const docIds = rows.map((r: { document_id: string }) => r.document_id)
    const { rows: links } = await pool.query(
      `SELECT source_id, target_id FROM edra_document_links
       WHERE source_id = ANY($1) OR target_id = ANY($1)`,
      [docIds]
    )

    const linkCounts = new Map<string, number>()
    for (const link of links) {
      linkCounts.set(link.source_id, (linkCounts.get(link.source_id) ?? 0) + 1)
      linkCounts.set(link.target_id, (linkCounts.get(link.target_id) ?? 0) + 1)
    }

    return rows.map((row: any) => ({
      id: row.id,
      actor: row.actor,
      action: row.action,
      document_id: row.document_id,
      timestamp: row.timestamp,
      summary: row.summary,
      doc_title: row.doc_title,
      doc_category: row.doc_category,
      relatedCount: linkCounts.get(row.document_id) ?? 0,
      relevance: computeActivityRelevance(row),
    }))
  } catch (e) {
    console.error('getRecentActivity failed:', e)
    return []
  }
}

// ─── getBlockingItems ─────────────────────────────────────────────────────────

export async function getBlockingItems(): Promise<BlockingItem[]> {
  const items: BlockingItem[] = []

  try {
    const { rows: staleDocs } = await pool.query(
      `SELECT id, title, linked_in_tickets, content_age_days
       FROM edra_documents
       WHERE staleness_flag IN ('stale', 'obsolete') AND linked_in_tickets > 0
       ORDER BY linked_in_tickets DESC
       LIMIT 3`
    )

    for (const doc of staleDocs) {
      items.push({
        id: `stale-${doc.id}`,
        type: 'stale-referenced',
        title: doc.title,
        description: `Last updated ${doc.content_age_days}+ days ago, still linked in ${doc.linked_in_tickets} active ticket${doc.linked_in_tickets > 1 ? 's' : ''}`,
        severity: 'high',
        documentId: doc.id,
        relevance: { label: `Blocking ${doc.linked_in_tickets} active ticket${doc.linked_in_tickets > 1 ? 's' : ''}`, tier: 'critical' },
      })
    }

    const { rows: openDecisions } = await pool.query(
      `SELECT id, title, content_age_days
       FROM edra_documents
       WHERE category = 'Architecture Decision Records'
         AND (status = 'draft' OR status = 'in review')
       ORDER BY created_date DESC
       LIMIT 2`
    )

    for (const doc of openDecisions) {
      items.push({
        id: `decision-${doc.id}`,
        type: 'open-decision',
        title: doc.title,
        description: `Open ${doc.content_age_days ? doc.content_age_days + ' days' : 'decision'} — needs resolution`,
        severity: 'medium',
        documentId: doc.id,
        relevance: { label: `Open ${doc.content_age_days ?? '?'} days`, tier: 'attention' },
      })
    }
  } catch (e) {
    console.error('getBlockingItems failed:', e)
  }

  return items
}

// ─── Workspace Tree ───────────────────────────────────────────────────────────

export type WorkspaceDocument = {
  id: string
  document_id: string
  title: string
  category: string
  folder_path: string
  status: 'draft' | 'in review' | 'current' | 'deprecated' | 'archived'
  staleness_flag: string
  owner: string
  last_modified_date: string | null
  last_modified_by: string | null
  projects: string[]
  tags: string[]
  confidence: number
}

export type FolderNode = {
  name: string
  path: string
  children: FolderNode[]
  documents: WorkspaceDocument[]
  documentCount: number
  lastModified: string | null
}

function buildFolderTree(docs: WorkspaceDocument[]): FolderNode {
  const root: FolderNode = { name: 'My workspace', path: '/', children: [], documents: [], documentCount: 0, lastModified: null }

  const folderMap = new Map<string, FolderNode>()
  folderMap.set('/', root)

  function ensureFolder(pathStr: string): FolderNode {
    if (folderMap.has(pathStr)) return folderMap.get(pathStr)!

    const segments = pathStr.split('/').filter(Boolean)
    let current = root
    let built = ''

    for (const seg of segments) {
      built += '/' + seg
      if (!folderMap.has(built)) {
        const displayName = seg === 'unsorted' ? 'Uncategorized' : seg
        const node: FolderNode = { name: displayName, path: built, children: [], documents: [], documentCount: 0, lastModified: null }
        folderMap.set(built, node)
        current.children.push(node)
      }
      current = folderMap.get(built)!
    }

    return current
  }

  for (const doc of docs) {
    const folder = ensureFolder(doc.folder_path || '/unsorted')
    folder.documents.push(doc)
  }

  function computeStats(node: FolderNode): { count: number; latest: string | null } {
    let total = node.documents.length
    let latest: string | null = null

    for (const doc of node.documents) {
      if (doc.last_modified_date && (!latest || doc.last_modified_date > latest)) {
        latest = doc.last_modified_date
      }
    }

    for (const child of node.children) {
      const childStats = computeStats(child)
      total += childStats.count
      if (childStats.latest && (!latest || childStats.latest > latest)) {
        latest = childStats.latest
      }
    }

    node.documentCount = total
    node.lastModified = latest
    return { count: total, latest }
  }
  computeStats(root)

  function sortTree(node: FolderNode) {
    node.children.sort((a, b) => a.name.localeCompare(b.name))
    node.documents.sort((a, b) => a.title.localeCompare(b.title))
    for (const child of node.children) sortTree(child)
  }
  sortTree(root)

  return root
}

export type FolderMeta = Map<string, { displayName: string; description: string | null }>

export type WorkspaceTreeResult = {
  tree: FolderNode
  folderMeta: FolderMeta
  viewName?: string
  isFiltered?: boolean
  avgConfidence?: number | null
}

function applyDisplayNames(node: FolderNode, meta: FolderMeta): void {
  const entry = meta.get(node.path)
  if (entry) node.name = entry.displayName
  for (const child of node.children) applyDisplayNames(child, meta)
}

export async function getWorkspaceTree(viewId?: string): Promise<WorkspaceTreeResult> {
  const emptyResult: WorkspaceTreeResult = {
    tree: { name: 'My workspace', path: '/', children: [], documents: [], documentCount: 0, lastModified: null },
    folderMeta: new Map(),
  }

  try {
    if (viewId) {
      const [docsResult, foldersResult, viewResult] = await Promise.all([
        pool.query(
          `SELECT d.id, d.document_id, d.title, d.category, vp.folder_path,
                  d.status, d.staleness_flag, d.last_modified_date,
                  d.last_modified_by, d.projects, d.tags, vp.confidence
           FROM edra_documents d
           JOIN edra_view_paths vp ON vp.document_id = d.id
           WHERE vp.view_id = $1
           ORDER BY vp.folder_path, vp.position, d.title`,
          [viewId]
        ),
        pool.query(
          `SELECT folder_path, display_name, description
           FROM edra_view_folders
           WHERE view_id = $1`,
          [viewId]
        ),
        pool.query(
          `SELECT name, is_filtered, avg_confidence FROM edra_workspace_views WHERE id = $1`,
          [viewId]
        ),
      ])

      const docs = docsResult.rows.map((r: any) => ({
        ...r,
        last_modified_date: r.last_modified_date instanceof Date
          ? r.last_modified_date.toISOString()
          : r.last_modified_date,
      })) as WorkspaceDocument[]

      const folderMeta: FolderMeta = new Map()
      for (const row of foldersResult.rows) {
        folderMeta.set(row.folder_path, {
          displayName: row.display_name,
          description: row.description,
        })
      }

      const tree = buildFolderTree(docs)
      applyDisplayNames(tree, folderMeta)

      return {
        tree,
        folderMeta,
        viewName: viewResult.rows[0]?.name,
        isFiltered: viewResult.rows[0]?.is_filtered ?? false,
        avgConfidence: viewResult.rows[0]?.avg_confidence ?? null,
      }
    }

    const { rows } = await pool.query(
      `SELECT id, document_id, title, category, folder_path,
              status, staleness_flag, last_modified_date,
              last_modified_by, projects, tags, 1.0::real as confidence
       FROM edra_documents
       ORDER BY folder_path, title`
    )
    const docs = rows.map((r: any) => ({
      ...r,
      last_modified_date: r.last_modified_date instanceof Date
        ? r.last_modified_date.toISOString()
        : r.last_modified_date,
    })) as WorkspaceDocument[]

    return { tree: buildFolderTree(docs), folderMeta: new Map() }
  } catch (e) {
    console.error('getWorkspaceTree failed:', e)
    return emptyResult
  }
}

export type Collaborator = {
  initials: string
  name: string
}

export type Derivation = {
  families: string[]
  tier1: string
  tier2: string
}

export type EvidenceLine = {
  label: string
  value: number
}

export type FolderPreview = {
  name: string
  docCount: number
  sampleDocs: { title: string; status: string }[]
}

export type ViewSummary = {
  id: string
  name: string
  category: string
  description: string | null
  isFiltered: boolean
  isSystem: boolean
  visibility: 'private' | 'shared' | 'team'
  sharedWith: Collaborator[]
  derivation: Derivation | null
  evidenceSummary: EvidenceLine[] | null
  sourceTooltip: string | null
  docCount: number
  folderCount: number
  topFolders: string[]
  folderPreviews: FolderPreview[]
  avgConfidence: number | null
  confidenceLevel: 'high' | 'moderate' | 'low' | null
}

export async function getAllViews(): Promise<ViewSummary[]> {
  const [viewsResult, foldersResult, samplesResult] = await Promise.all([
    pool.query(
      `SELECT v.id, v.name, v.category, v.description,
              v.is_filtered as "isFiltered",
              v.is_system as "isSystem",
              v.visibility,
              COALESCE(v.shared_with, '[]'::jsonb) as "sharedWith",
              v.derivation,
              v.evidence_summary as "evidenceSummary",
              v.source_tooltip as "sourceTooltip",
              v.avg_confidence as "avgConfidence",
              v.confidence_level as "confidenceLevel",
              (SELECT COUNT(DISTINCT document_id)
               FROM edra_view_paths WHERE view_id = v.id
              )::int as "docCount",
              (SELECT COUNT(*)
               FROM edra_view_folders
               WHERE view_id = v.id AND folder_path NOT LIKE '%/%/%'
              )::int as "folderCount",
              COALESCE(
                (SELECT jsonb_agg(display_name ORDER BY folder_path)
                 FROM (
                   SELECT display_name, folder_path
                   FROM edra_view_folders
                   WHERE view_id = v.id AND folder_path NOT LIKE '%/%/%'
                   ORDER BY folder_path
                   LIMIT 5
                 ) sub
                ), '[]'::jsonb
              ) as "topFolders"
       FROM edra_workspace_views v
       ORDER BY v.sort_order`
    ),
    pool.query(
      `SELECT f.view_id, f.folder_path, f.display_name,
              (SELECT COUNT(*)::int FROM edra_view_paths vp
               WHERE vp.view_id = f.view_id AND vp.folder_path = f.folder_path
              ) as doc_count
       FROM edra_view_folders f
       WHERE f.folder_path NOT LIKE '%/%/%'
       ORDER BY f.view_id, f.folder_path`
    ),
    pool.query(
      `SELECT DISTINCT ON (vp.view_id, vp.folder_path, d.title)
              vp.view_id, vp.folder_path, d.title, d.status
       FROM edra_view_paths vp
       JOIN edra_documents d ON d.id = vp.document_id
       JOIN edra_view_folders f ON f.view_id = vp.view_id
                                AND f.folder_path = vp.folder_path
       WHERE f.folder_path NOT LIKE '%/%/%'
       ORDER BY vp.view_id, vp.folder_path, d.title`
    ),
  ])

  const sampleMap = new Map<string, { title: string; status: string }[]>()
  for (const row of samplesResult.rows) {
    const key = `${row.view_id}:${row.folder_path}`
    let arr = sampleMap.get(key)
    if (!arr) { arr = []; sampleMap.set(key, arr) }
    if (arr.length < 3) arr.push({ title: row.title, status: row.status })
  }

  const folderMap = new Map<string, FolderPreview[]>()
  for (const row of foldersResult.rows) {
    const key = row.view_id as string
    let arr = folderMap.get(key)
    if (!arr) { arr = []; folderMap.set(key, arr) }
    if (arr.length < 5) {
      arr.push({
        name: row.display_name,
        docCount: row.doc_count,
        sampleDocs: sampleMap.get(`${row.view_id}:${row.folder_path}`) ?? [],
      })
    }
  }

  return viewsResult.rows.map((v: any) => ({
    ...v,
    folderPreviews: folderMap.get(v.id) ?? [],
  })) as ViewSummary[]
}
