import { NextResponse } from 'next/server';
import { readFileSync } from 'fs';
import { join } from 'path';

// ── Types ─────────────────────────────────────────────────────────────────────

export type AntipatternCategory = {
  name: string;
  count: number;
  /** Titles of the 3 most recent APs (by ID number, descending). */
  topThree: string[];
};

export type AntipatternDomain = {
  domain: 'design' | 'engineering' | 'content';
  categories: AntipatternCategory[];
  total: number;
};

export type AntipatternData = {
  domains: AntipatternDomain[];
  grandTotal: number;
  /** ISO timestamp of when the server last parsed the docs. */
  parsedAt: string;
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function readDoc(relativePath: string): string {
  try {
    return readFileSync(join(process.cwd(), relativePath), 'utf-8');
  } catch {
    return '';
  }
}

/**
 * Parses all `## PREFIX-NNN: Title` headings from a doc into a Map<id, title>.
 * Handles prefixes AP, EAP, CAP (and any future prefix).
 */
function parseAntipatternTitles(markdown: string): Map<string, string> {
  const map = new Map<string, string>();
  const re = /^## ([A-Z]+-\d+): (.+)$/gm;
  let m: RegExpExecArray | null;
  while ((m = re.exec(markdown)) !== null) {
    map.set(m[1], m[2].trim());
  }
  return map;
}

/**
 * Expands a raw IDs cell into fully-qualified ID strings.
 *
 * Handles:
 * - Full IDs: "AP-001, AP-002"
 * - Abbreviated content style: "CAP-001, 003, 006"  →  "CAP-001, CAP-003, CAP-006"
 * - Footnote markers (†, ‡) are stripped.
 */
function expandIds(rawCell: string, fallbackPrefix: string): string[] {
  const parts = rawCell.split(',').map((s) => s.replace(/[†‡*]/g, '').trim());
  let lastPrefix = fallbackPrefix;
  const result: string[] = [];

  for (const part of parts) {
    if (!part) continue;
    // Full ID: starts with letters then dash then digits
    if (/^[A-Z]+-\d+$/.test(part)) {
      // Extract the prefix portion for subsequent abbreviated entries
      lastPrefix = part.replace(/-\d+$/, '-');
      result.push(part);
    } else if (/^\d+$/.test(part)) {
      // Abbreviated: just digits, prepend last known prefix
      result.push(`${lastPrefix}${part}`);
    }
    // Skip anything else (e.g. stray punctuation)
  }

  return result;
}

/** Returns the trailing integer from an ID like "EAP-121" → 121. */
function idNumber(id: string): number {
  const m = id.match(/(\d+)$/);
  return m ? parseInt(m[1], 10) : 0;
}

/**
 * Parses the `## Category Index` markdown table plus the individual AP headings
 * to produce a list of categories with counts and top-3 most recent AP titles.
 */
function parseDomain(
  markdown: string,
  fallbackPrefix: string
): AntipatternCategory[] {
  const titles = parseAntipatternTitles(markdown);
  const lines = markdown.split('\n');
  const indexLine = lines.findIndex((l) => l.trim() === '## Category Index');
  if (indexLine === -1) return [];

  const categories: AntipatternCategory[] = [];
  let inTable = false;
  let rowsSeen = 0;

  for (let i = indexLine + 1; i < lines.length; i++) {
    const line = lines[i].trim();

    if (!line.startsWith('|')) {
      if (inTable) break;
      continue;
    }

    inTable = true;
    rowsSeen++;
    if (rowsSeen <= 2) continue; // header + separator

    const cells = line
      .split('|')
      .map((c) => c.trim())
      .filter((_, idx, arr) => idx > 0 && idx < arr.length - 1);

    if (cells.length < 2) continue;
    const categoryRaw = cells[0];
    if (categoryRaw.startsWith('**')) continue; // Total row

    // Last column = count
    const countRaw = cells[cells.length - 1].replace(/\*/g, '').trim();
    const countMatch = countRaw.match(/^(\d+)/);
    if (!countMatch) continue;
    const count = parseInt(countMatch[1], 10);
    if (isNaN(count) || count <= 0) continue;

    // IDs are in column index 1 (second cell)
    const idsCell = cells.length >= 3 ? cells[1] : '';
    const ids = expandIds(idsCell, fallbackPrefix);

    // Top 3 by highest ID number (most recent)
    const sorted = [...ids].sort((a, b) => idNumber(b) - idNumber(a));
    const topThree = sorted
      .slice(0, 3)
      .map((id) => titles.get(id))
      .filter((t): t is string => Boolean(t));

    categories.push({ name: categoryRaw, count, topThree });
  }

  return categories;
}

// ── Route ────────────────────────────────────────────────────────────────────

export async function GET() {
  const designMd = readDoc('docs/design-anti-patterns.md');
  const engineeringMd = readDoc('docs/engineering-anti-patterns.md');
  const contentMd = readDoc('docs/content-anti-patterns.md');

  const design = parseDomain(designMd, 'AP-');
  const engineering = parseDomain(engineeringMd, 'EAP-');
  const content = parseDomain(contentMd, 'CAP-');

  const domains: AntipatternDomain[] = [
    { domain: 'design', categories: design, total: design.reduce((s, c) => s + c.count, 0) },
    { domain: 'engineering', categories: engineering, total: engineering.reduce((s, c) => s + c.count, 0) },
    { domain: 'content', categories: content, total: content.reduce((s, c) => s + c.count, 0) },
  ];

  const grandTotal = domains.reduce((s, d) => s + d.total, 0);

  const data: AntipatternData = {
    domains,
    grandTotal,
    parsedAt: new Date().toISOString(),
  };

  return NextResponse.json(data, {
    headers: {
      'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
    },
  });
}
