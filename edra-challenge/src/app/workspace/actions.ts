"use server";

import pg from "pg";
import { revalidatePath } from "next/cache";

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  max: 5,
});

export type RelatedDoc = {
  id: string;
  title: string;
  link_type: string;
  direction: "outgoing" | "incoming";
  category: string;
  tags: string[];
  owner: string;
  staleness_flag: string;
  content_age_days: number | null;
  last_modified_date: string | null;
  total_views: number;
  unique_viewers_30d: number;
  linked_in_slack: number;
  linked_in_tickets: number;
  linked_in_prs: number;
};

export type DocumentDetail = {
  id: string;
  document_id: string;
  title: string;
  content: string | null;
  category: string;
  status: string;
  staleness_flag: string;
  sensitivity: string;
  owner: string;
  created_by: string;
  created_date: string | null;
  last_modified_by: string | null;
  last_modified_date: string | null;
  contributors: string[];
  projects: string[];
  tags: string[];
  version: string;
  version_history: { version: string; date: string; author: string }[];
  folder_path: string;
  total_views: number;
  unique_viewers_30d: number;
  total_edits: number;
  linked_in_slack: number;
  linked_in_prs: number;
  linked_in_tickets: number;
  last_commented_on: string | null;
  last_commented_by: string | null;
  content_age_days: number | null;
  review_due_date: string | null;
  last_verified_date: string | null;
  last_verified_by: string | null;
  bookmarked_by_me: boolean;
  relatedDocs: RelatedDoc[];
};

export async function getDocumentDetail(
  docId: string,
): Promise<DocumentDetail | null> {
  try {
    const { rows } = await pool.query(
      `SELECT id, document_id, title, content, category, status, staleness_flag,
              sensitivity, owner, created_by, created_date,
              last_modified_by, last_modified_date, contributors,
              projects, tags, version, version_history, folder_path,
              total_views, unique_viewers_30d, total_edits,
              linked_in_slack, linked_in_prs, linked_in_tickets,
              last_commented_on, last_commented_by,
              content_age_days, review_due_date,
              last_verified_date, last_verified_by, bookmarked_by_me
       FROM edra_documents WHERE id = $1`,
      [docId],
    );
    if (!rows.length) return null;

    const doc = rows[0];

    const { rows: links } = await pool.query(
      `SELECT DISTINCT ON (CASE WHEN l.source_id = $1 THEN l.target_id ELSE l.source_id END)
         CASE WHEN l.source_id = $1 THEN l.target_id ELSE l.source_id END AS related_id,
         l.source_id,
         l.link_type,
         d.title,
         d.category,
         d.tags,
         d.owner,
         d.staleness_flag,
         d.content_age_days,
         d.last_modified_date AS related_last_modified,
         d.total_views,
         d.unique_viewers_30d,
         d.linked_in_slack,
         d.linked_in_tickets,
         d.linked_in_prs
       FROM edra_document_links l
       JOIN edra_documents d
         ON d.id = CASE WHEN l.source_id = $1 THEN l.target_id ELSE l.source_id END
       WHERE l.source_id = $1 OR l.target_id = $1
       ORDER BY CASE WHEN l.source_id = $1 THEN l.target_id ELSE l.source_id END, l.link_type
       LIMIT 10`,
      [docId],
    );

    return {
      ...doc,
      created_date: doc.created_date?.toISOString?.() ?? doc.created_date,
      last_modified_date:
        doc.last_modified_date?.toISOString?.() ?? doc.last_modified_date,
      last_commented_on:
        doc.last_commented_on?.toISOString?.() ?? doc.last_commented_on,
      last_verified_date:
        doc.last_verified_date?.toISOString?.() ?? doc.last_verified_date,
      review_due_date:
        doc.review_due_date?.toISOString?.() ?? doc.review_due_date,
      version_history: doc.version_history ?? [],
      relatedDocs: links.map((l: any) => ({
        id: l.related_id,
        title: l.title,
        link_type: l.link_type,
        direction: l.source_id === docId ? "outgoing" : "incoming",
        category: l.category,
        tags: l.tags ?? [],
        owner: l.owner,
        staleness_flag: l.staleness_flag,
        content_age_days: l.content_age_days,
        last_modified_date:
          l.related_last_modified?.toISOString?.() ?? l.related_last_modified,
        total_views: l.total_views,
        unique_viewers_30d: l.unique_viewers_30d,
        linked_in_slack: l.linked_in_slack,
        linked_in_tickets: l.linked_in_tickets,
        linked_in_prs: l.linked_in_prs,
      })),
    } as DocumentDetail;
  } catch (e) {
    console.error("getDocumentDetail failed:", e);
    return null;
  }
}

export async function moveDocument(
  documentId: string,
  newFolderPath: string,
  viewId?: string,
  oldFolderPath?: string,
): Promise<{ ok: boolean; error?: string }> {
  try {
    if (viewId && oldFolderPath) {
      await pool.query(
        `UPDATE edra_view_paths
         SET folder_path = $3, confidence = 1.0
         WHERE view_id = $1 AND document_id = $2::uuid AND folder_path = $4`,
        [viewId, documentId, newFolderPath, oldFolderPath],
      );
    } else {
      await pool.query(
        `UPDATE edra_documents SET folder_path = $1 WHERE id = $2`,
        [newFolderPath, documentId],
      );
    }
    revalidatePath("/workspace");
    return { ok: true };
  } catch (e) {
    console.error("moveDocument failed:", e);
    return { ok: false, error: String(e) };
  }
}

export async function moveFolder(
  oldFolderPath: string,
  newParentPath: string,
  viewId?: string,
): Promise<{ ok: boolean; error?: string }> {
  const folderName = oldFolderPath.split("/").filter(Boolean).pop();
  if (!folderName) return { ok: false, error: "Invalid folder path" };

  const newFolderPath =
    newParentPath === "/" ? `/${folderName}` : `${newParentPath}/${folderName}`;

  if (newFolderPath === oldFolderPath) return { ok: true };
  if (newFolderPath.startsWith(oldFolderPath + "/")) {
    return { ok: false, error: "Cannot move a folder into itself" };
  }

  try {
    if (viewId) {
      await pool.query(
        `UPDATE edra_view_paths
         SET folder_path = $3 || substring(folder_path from $4::int)
         WHERE view_id = $1
           AND (folder_path = $2 OR folder_path LIKE $2 || '/%')`,
        [viewId, oldFolderPath, newFolderPath, oldFolderPath.length + 1],
      );
    } else {
      await pool.query(
        `UPDATE edra_documents
         SET folder_path = $3 || substring(folder_path from $4::int)
         WHERE folder_path = $1 OR folder_path LIKE $2`,
        [
          oldFolderPath,
          oldFolderPath + "/%",
          newFolderPath,
          oldFolderPath.length + 1,
        ],
      );
    }
    revalidatePath("/workspace");
    return { ok: true };
  } catch (e) {
    console.error("moveFolder failed:", e);
    return { ok: false, error: String(e) };
  }
}

export async function toggleBookmark(
  docId: string,
): Promise<{ ok: boolean; bookmarked?: boolean; error?: string }> {
  try {
    const { rows } = await pool.query(
      `UPDATE edra_documents
       SET bookmarked_by_me = NOT bookmarked_by_me
       WHERE id = $1
       RETURNING bookmarked_by_me`,
      [docId],
    );
    if (!rows.length) return { ok: false, error: "Document not found" };
    return { ok: true, bookmarked: rows[0].bookmarked_by_me };
  } catch (e) {
    console.error("toggleBookmark failed:", e);
    return { ok: false, error: String(e) };
  }
}

export async function archiveDocument(
  docId: string,
): Promise<{ ok: boolean; error?: string }> {
  try {
    await pool.query(
      `UPDATE edra_documents SET status = 'archived' WHERE id = $1`,
      [docId],
    );
    revalidatePath("/workspace");
    return { ok: true };
  } catch (e) {
    console.error("archiveDocument failed:", e);
    return { ok: false, error: String(e) };
  }
}

export async function updateDocumentContent(
  docId: string,
  content: string,
): Promise<{ ok: boolean; error?: string }> {
  try {
    const { rowCount } = await pool.query(
      `UPDATE edra_documents SET content = $1, last_modified_date = now() WHERE document_id = $2`,
      [content, docId],
    );
    if (!rowCount) return { ok: false, error: "Document not found" };
    revalidatePath("/workspace");
    return { ok: true };
  } catch (e) {
    console.error("updateDocumentContent failed:", e);
    return { ok: false, error: String(e) };
  }
}

export type SearchResult = {
  id: string;
  title: string;
  category: string;
  status: string;
  owner: string;
  staleness_flag: string;
  projects: string[];
  tags: string[];
  confidence: number;
};

function editDistance(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;

  let prev = Array.from({ length: n + 1 }, (_, j) => j);
  let curr = new Array(n + 1);

  for (let i = 1; i <= m; i++) {
    curr[0] = i;
    for (let j = 1; j <= n; j++) {
      curr[j] =
        a[i - 1] === b[j - 1]
          ? prev[j - 1]
          : 1 + Math.min(prev[j], curr[j - 1], prev[j - 1]);
    }
    [prev, curr] = [curr, prev];
  }
  return prev[n];
}

function fuzzyScore(query: string, title: string): number {
  const qLower = query.toLowerCase();
  const tLower = title.toLowerCase();

  if (tLower.includes(qLower)) return 10;

  const terms = qLower.split(/\s+/).filter(Boolean);
  const titleWords = tLower.split(/[\s\-—:,()]+/).filter(Boolean);

  let total = 0;
  for (const term of terms) {
    let bestTerm = 0;

    for (const word of titleWords) {
      if (word.includes(term)) {
        bestTerm = Math.max(bestTerm, 5);
        continue;
      }
      if (word.startsWith(term.slice(0, -1))) {
        bestTerm = Math.max(bestTerm, 4);
        continue;
      }

      const target = word.length > term.length + 2 ? word.slice(0, term.length + 2) : word;
      const dist = editDistance(term, target);
      const maxAllowed = Math.max(1, Math.floor(term.length / 3));
      if (dist <= maxAllowed) {
        bestTerm = Math.max(bestTerm, 3 - dist);
      }
    }

    if (bestTerm === 0) return 0;
    total += bestTerm;
  }

  return total;
}

export async function searchDocuments(
  query: string,
  viewId?: string,
): Promise<SearchResult[]> {
  const trimmed = query.trim();
  if (!trimmed) return [];

  try {
    const hasView = !!viewId;

    const { rows } = await pool.query(
      `SELECT d.id, d.title, d.category, d.status, d.owner,
              d.staleness_flag, d.projects, d.tags,
              ${hasView ? `COALESCE(vp.confidence, 1.0)` : `1.0`}::real AS confidence
       FROM edra_documents d
       ${hasView ? `LEFT JOIN edra_view_paths vp ON vp.document_id = d.id AND vp.view_id = $1` : ""}`,
      hasView ? [viewId] : [],
    );

    const scored = rows
      .map((row: any) => ({ ...row, _score: fuzzyScore(trimmed, row.title) }))
      .filter((r: any) => r._score > 0)
      .sort((a: any, b: any) => b._score - a._score)
      .slice(0, 8);

    return scored.map(({ _score, ...rest }: any) => rest) as SearchResult[];
  } catch (e) {
    console.error("searchDocuments failed:", e);
    return [];
  }
}

export async function dismissResolution(
  sourceId: string,
  targetId: string,
): Promise<{ ok: boolean; error?: string }> {
  try {
    await pool.query(
      `ALTER TABLE edra_document_links
       ADD COLUMN IF NOT EXISTS resolved_at timestamptz`,
    );
    await pool.query(
      `UPDATE edra_document_links
       SET resolved_at = now()
       WHERE (source_id = $1 AND target_id = $2)
          OR (source_id = $2 AND target_id = $1)`,
      [sourceId, targetId],
    );
    return { ok: true };
  } catch (e) {
    console.error("dismissResolution failed:", e);
    return { ok: false, error: String(e) };
  }
}
