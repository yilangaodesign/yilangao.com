import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type LinkType =
  | 'references'
  | 'supersedes'
  | 'duplicate_of'
  | 'related'
  | 'discussed_in'
  | 'informs'

export type DocumentLink = {
  id: string
  source_id: string
  target_id: string
  link_type: LinkType
  confidence: number
  created_by: 'manual' | 'ai-clustering'
  created_at: string
}

export type ActivityEvent = {
  id: string
  actor: string
  action: 'commented' | 'edited' | 'created' | 'mentioned_in_slack' | 'linked_in_pr'
  document_id: string
  timestamp: string
  summary: string
}

export type Document = {
  // Identity
  id: string
  document_id: string
  title: string
  content: string | null
  version: string
  version_history: { version: string; date: string; author: string }[]
  parent_document_id: string | null

  // Authorship
  created_by: string
  created_date: string
  last_modified_by: string | null
  last_modified_date: string | null
  contributors: string[]
  owner: string

  // My activity (Maya's perspective)
  last_opened_by_me: string | null
  times_opened_by_me: number
  last_edited_by_me: string | null
  bookmarked_by_me: boolean

  // Team activity
  last_opened_by_anyone: string | null
  total_views: number
  unique_viewers_30d: number
  total_edits: number
  last_commented_on: string | null
  last_commented_by: string | null

  // Classification
  category: string
  projects: string[]
  status: 'draft' | 'in review' | 'current' | 'deprecated' | 'archived'
  sensitivity: 'internal' | 'team-only' | 'client-restricted'

  // Relationships
  tags: string[]
  meetings: string[]
  references: string[]
  supersedes: string | null
  superseded_by: string | null
  duplicate_of: string | null

  // Organization
  folder_path: string | null
  ai_suggested_cluster: string | null
  ai_suggested_label: string | null
  pinned_to: string[]

  // Freshness
  content_age_days: number | null
  staleness_flag: 'active' | 'aging' | 'stale' | 'obsolete'
  review_due_date: string | null
  last_verified_date: string | null
  last_verified_by: string | null

  // Relevance signals
  linked_in_slack: number
  linked_in_tickets: number
  linked_in_prs: number
  search_appearances: number
  search_clicks: number
}
