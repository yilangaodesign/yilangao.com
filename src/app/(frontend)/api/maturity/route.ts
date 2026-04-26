import { NextResponse } from 'next/server';
import { readFileSync } from 'fs';
import { join } from 'path';

// ── Types ─────────────────────────────────────────────────────────────────────

export type DailyStats = {
  min: number;
  max: number;
  median: number;
  mean: number;
};

export type DayBreakdown = {
  day: number;
  date: string;
  fundamental: number;
  structural: number;
  refinement: number;
  design: number;
  engineering: number;
  content: number;
  // Recurrence breakdown (per Plan B canonical citations).
  // - recurrent: ≥1 strong citation (`See AP-NNN`) — issue mapped to existing AP
  // - approximate: only loose-match citations (`Related: AP-NNN`) — semantically close
  // - novel: no canonical citations — first-time observation, candidate for new AP
  recurrent: number;
  approximate: number;
  novel: number;
  total: number;
};

export type MaturityPeriod = {
  /** x-axis label, e.g. "1-5" */
  label: string;
  /** Full label for aria / tooltips, e.g. "Days 1–5" */
  dayRange: string;
  // Severity breakdown (aggregate)
  fundamental: number;
  structural: number;
  refinement: number;
  // Domain breakdown (aggregate)
  design: number;
  engineering: number;
  content: number;
  // Optional editorial milestone annotation
  milestone?: string;
  /** Per-day correction count stats within this period */
  dailyStats: DailyStats;
};

export type MaturityData = {
  periods: MaturityPeriod[];
  /** Every build day with its severity + domain breakdown */
  days: DayBreakdown[];
  totalBuildDays: number;
  parsedAt: string;
};

// ── Period definitions ────────────────────────────────────────────────────────

const PERIOD_DEFS = [
  { label: '1-5',    dayRange: 'Days 1–5',    min: 1,  max: 5 },
  { label: '6-10',   dayRange: 'Days 6–10',   min: 6,  max: 10 },
  { label: '11-15',  dayRange: 'Days 11–15',  min: 11, max: 15 },
  { label: '16-20',  dayRange: 'Days 16–20',  min: 16, max: 20 },
  { label: '21-30',  dayRange: 'Days 21–30',  min: 21, max: 30 },
  { label: '31-40+', dayRange: 'Days 31–40+', min: 31, max: Infinity },
] as const;

// Editorial milestone for the escalation-protocol introduction.
// Keyed to the period label it belongs to.
const STATIC_MILESTONES: Record<string, string> = {
  '6-10': 'Escalation protocol introduced',
};

// ── Internal correction entry ─────────────────────────────────────────────────

type Correction = {
  date: string;
  domain: 'design' | 'engineering' | 'content';
  /** Created a new documented anti-pattern. */
  fundamental: boolean;
  /** Cross-category or substantially complex entry. */
  structural: boolean;
  /** Recurrence classification from Plan B canonical citations. */
  recurrence: 'recurrent' | 'approximate' | 'novel';
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
 * Classify a block of text:
 * - fundamental  → block promoted a new anti-pattern to the docs
 * - structural   → cross-category fix or long complex entry
 * - refinement   → everything else (the default)
 */
function classifyBlock(block: string): { fundamental: boolean; structural: boolean } {
  const fundamental =
    /Promoted\s+[A-Z]{2,3}-\d+/i.test(block) ||
    /\b[A-Z]{2,3}-\d+\s+(extracted|captured|promoted|created)\b/.test(block);

  const structural =
    !fundamental &&
    (/cross-category/i.test(block) || block.length > 900);

  return { fundamental, structural };
}

/**
 * Classify a block by recurrence using Plan B canonical citations.
 * The regex matches the same line-anchored canonical syntax enforced by
 * scripts/audit-docs.mjs (see CANON_CITATION_GLOBAL).
 */
const STRONG_CITE_RE = /^(?:\*\*[^*]+:\*\*\s+)?See\s+(?:AP|EAP|CAP)-\d{1,4}/m;
const APPROX_CITE_RE = /^(?:\*\*[^*]+:\*\*\s+)?Related:\s+(?:AP|EAP|CAP)-\d{1,4}/m;

function classifyRecurrence(block: string): 'recurrent' | 'approximate' | 'novel' {
  if (STRONG_CITE_RE.test(block)) return 'recurrent';
  if (APPROX_CITE_RE.test(block)) return 'approximate';
  return 'novel';
}

/**
 * Parse logs that use the standard `**Date:** YYYY-MM-DD` format.
 * Design-feedback-log.md and both engineering logs use this format.
 * Entries are separated by `\n---\n`.
 */
function parseStandardLog(
  text: string,
  domain: 'design' | 'engineering',
): Correction[] {
  const corrections: Correction[] = [];
  const blocks = text.split(/\n---\n/);

  for (const block of blocks) {
    const dateMatch = block.match(/\*\*Date:\*\*\s*(\d{4}-\d{2}-\d{2})/);
    if (!dateMatch) continue;

    const { fundamental, structural } = classifyBlock(block);
    const recurrence = classifyRecurrence(block);
    corrections.push({ date: dateMatch[1], domain, fundamental, structural, recurrence });
  }

  return corrections;
}

/**
 * Parse the content-feedback-log.md, which uses `## Session: YYYY-MM-DD` headers
 * and `#### CFB-NNN:` sub-entries rather than the `**Date:**` style.
 * Each CFB entry counts as one correction; the session block's text is used
 * for severity classification.
 */
function parseContentLog(text: string): Correction[] {
  const corrections: Correction[] = [];
  // Content log blocks are also `---`-separated, each containing one session
  const blocks = text.split(/\n---\n/);

  for (const block of blocks) {
    const dateMatch = block.match(/##\s+Session:\s*(\d{4}-\d{2}-\d{2})/);
    if (!dateMatch) continue;

    const date = dateMatch[1];
    const cfbEntries = (block.match(/^####\s+CFB-\d+:/gm) ?? []).length;
    if (cfbEntries === 0) continue;

    const { fundamental, structural } = classifyBlock(block);
    const recurrence = classifyRecurrence(block);
    for (let i = 0; i < cfbEntries; i++) {
      corrections.push({ date, domain: 'content', fundamental, structural, recurrence });
    }
  }

  return corrections;
}

// ── Route ─────────────────────────────────────────────────────────────────────

export async function GET() {
  // Read all log files (design archive uses synthesis format without dates,
  // so only the active design log contributes design corrections).
  const allCorrections: Correction[] = [
    ...parseStandardLog(readDoc('docs/design-feedback-log.md'), 'design'),
    ...parseStandardLog(readDoc('docs/engineering-feedback-log.md'), 'engineering'),
    ...parseStandardLog(readDoc('docs/engineering-feedback-log-archive.md'), 'engineering'),
    ...parseContentLog(readDoc('docs/content-feedback-log.md')),
  ];

  // All unique build-day dates in ascending chronological order.
  const uniqueDates = [...new Set(allCorrections.map((c) => c.date))].sort();
  const totalBuildDays = uniqueDates.length;
  // Map date → 1-based day number
  const dayNum = new Map(uniqueDates.map((d, i) => [d, i + 1]));

  // Accumulate per-period counts.
  type PeriodAcc = {
    fundamental: number;
    structural: number;
    refinement: number;
    design: number;
    engineering: number;
    content: number;
  };
  const periodMap = new Map<string, PeriodAcc>();
  for (const def of PERIOD_DEFS) {
    periodMap.set(def.label, {
      fundamental: 0, structural: 0, refinement: 0,
      design: 0, engineering: 0, content: 0,
    });
  }

  for (const c of allCorrections) {
    const dn = dayNum.get(c.date) ?? 0;
    const def = PERIOD_DEFS.find((d) => dn >= d.min && dn <= d.max);
    if (!def) continue;

    const acc = periodMap.get(def.label)!;
    acc[c.domain]++;
    if (c.fundamental) acc.fundamental++;
    else if (c.structural) acc.structural++;
    else acc.refinement++;
  }

  // ── Per-day totals → dailyStats per period ────────────────────────────────
  const dayTotals = new Map<string, number>();
  for (const c of allCorrections) {
    dayTotals.set(c.date, (dayTotals.get(c.date) ?? 0) + 1);
  }

  const periodDayValues = new Map<string, number[]>();
  for (const def of PERIOD_DEFS) {
    periodDayValues.set(def.label, []);
  }
  for (const [date, total] of dayTotals) {
    const dn = dayNum.get(date) ?? 0;
    const def = PERIOD_DEFS.find((d) => dn >= d.min && dn <= d.max);
    if (!def) continue;
    periodDayValues.get(def.label)!.push(total);
  }

  function computeMedian(sorted: number[]): number {
    if (sorted.length === 0) return 0;
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 === 0
      ? (sorted[mid - 1] + sorted[mid]) / 2
      : sorted[mid];
  }

  const dailyStatsMap = new Map<string, DailyStats>();
  for (const [label, values] of periodDayValues) {
    if (values.length === 0) continue;
    const sorted = [...values].sort((a, b) => a - b);
    const sum = sorted.reduce((a, b) => a + b, 0);
    dailyStatsMap.set(label, {
      min: sorted[0],
      max: sorted[sorted.length - 1],
      median: computeMedian(sorted),
      mean: Math.round((sum / sorted.length) * 10) / 10,
    });
  }

  // Auto-detect "first zero-fundamental period" milestone.
  // Attach it to the first period (chronologically) where fundamental drops to 0
  // AND the previous period had at least 1 fundamental correction.
  let firstZeroFundamentalLabel: string | null = null;
  let prevFundamental = -1;
  for (const def of PERIOD_DEFS) {
    const acc = periodMap.get(def.label)!;
    const total = acc.design + acc.engineering + acc.content;
    if (total === 0) break; // no data beyond this period
    if (prevFundamental > 0 && acc.fundamental === 0) {
      firstZeroFundamentalLabel = def.label;
      break;
    }
    prevFundamental = acc.fundamental;
  }

  // Build output — only emit periods that have at least one session's data.
  const periods: MaturityPeriod[] = [];
  for (const def of PERIOD_DEFS) {
    const acc = periodMap.get(def.label)!;
    const total = acc.design + acc.engineering + acc.content;
    if (total === 0) continue;

    const milestone =
      STATIC_MILESTONES[def.label] ??
      (firstZeroFundamentalLabel === def.label ? 'First zero-fundamental period' : undefined);

    periods.push({
      label: def.label,
      dayRange: def.dayRange,
      ...acc,
      ...(milestone ? { milestone } : {}),
      dailyStats: dailyStatsMap.get(def.label) ?? { min: 0, max: 0, median: 0, mean: 0 },
    });
  }

  // ── Per-day breakdown for the combined chart ────────────────────────────
  const dayBreakdownMap = new Map<string, Omit<DayBreakdown, 'day' | 'date' | 'total'>>();
  for (const c of allCorrections) {
    let db = dayBreakdownMap.get(c.date);
    if (!db) {
      db = {
        fundamental: 0, structural: 0, refinement: 0,
        design: 0, engineering: 0, content: 0,
        recurrent: 0, approximate: 0, novel: 0,
      };
      dayBreakdownMap.set(c.date, db);
    }
    db[c.domain]++;
    if (c.fundamental) db.fundamental++;
    else if (c.structural) db.structural++;
    else db.refinement++;
    db[c.recurrence]++;
  }

  const days: DayBreakdown[] = uniqueDates.map((date) => {
    const dn = dayNum.get(date)!;
    const db = dayBreakdownMap.get(date)!;
    const total = db.design + db.engineering + db.content;
    return { day: dn, date, ...db, total };
  });

  const data: MaturityData = { periods, days, totalBuildDays, parsedAt: new Date().toISOString() };

  return NextResponse.json(data, {
    headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' },
  });
}
