import { NextResponse } from 'next/server';
import { readFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

// ── Types ─────────────────────────────────────────────────────────────────────

export type LiveSkill = {
  name: string;
  /** Concise trigger / magic-word label shown on the card face. */
  trigger: string;
  /** Full description from the YAML frontmatter. */
  description: string;
};

export type LiveSkillPhase = {
  label: string;
  skills: LiveSkill[];
};

export type SkillsData = {
  phases: LiveSkillPhase[];
  total: number;
  /** ISO timestamp of when the server last parsed the skill files. */
  parsedAt: string;
};

// ── Phase mapping (editorial: which workflow stage each skill belongs to) ─────
//
// Skills not listed here are silently skipped; add new skills to the
// appropriate phase as new SKILL.md files are created.

const PHASE_ORDER = ['Input', 'Work', 'Gates', 'Release'] as const;
type PhaseName = (typeof PHASE_ORDER)[number];

const PHASE_MAP: Record<string, PhaseName> = {
  'boot-up':              'Input',
  'orchestrator':         'Input',
  'personalize':          'Input',
  'plan-audit':           'Input',
  'plan-structure':       'Input',
  'design-iteration':     'Work',
  'engineering-iteration':'Work',
  'content-iteration':    'Work',
  'case-study-authoring': 'Work',
  'cross-app-parity':     'Gates',
  'cms-parity':           'Gates',
  'playground':           'Gates',
  'stress-test':          'Gates',
  'password-gate':        'Gates',
  'doc-audit':            'Release',
  'checkpoint':           'Release',
  'ship-it':              'Release',
};

// ── YAML frontmatter parser ───────────────────────────────────────────────────

function parseFrontmatter(raw: string): { name: string; description: string } {
  const block = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!block) return { name: '', description: '' };

  const yaml = block[1];

  // name: single-line value
  const nameMatch = yaml.match(/^name:\s*(.+)$/m);
  const name = nameMatch ? nameMatch[1].trim() : '';

  // description: either inline or a folded block scalar (>- / >)
  let description = '';
  const foldedMatch = yaml.match(/^description:\s*>-?\r?\n([\s\S]*?)(?=\n\S|$)/m);
  if (foldedMatch) {
    // Fold: join indented continuation lines with spaces
    description = foldedMatch[1]
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter(Boolean)
      .join(' ');
  } else {
    const inlineMatch = yaml.match(/^description:\s*(.+)$/m);
    if (inlineMatch) description = inlineMatch[1].trim();
  }

  return { name, description };
}

// ── Trigger extraction from "## When to Activate" section ────────────────────

function extractTrigger(raw: string): string {
  // Find the "When to Activate" section heading
  const sectionMatch = raw.match(/##\s+When to Activate\r?\n([\s\S]*?)(?=\n##|\n---\s*\n|$)/i);
  if (!sectionMatch) return '';

  const body = sectionMatch[1];

  // Take the first non-empty bullet line
  const lines = body.split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || !trimmed.startsWith('-')) continue;

    // Strip leading dash/asterisk and bold markers, collapse whitespace
    const cleaned = trimmed
      .replace(/^[-*]\s*/, '')          // list marker
      .replace(/\*\*/g, '')             // bold
      .replace(/`/g, '')                // code ticks
      .replace(/\s+/g, ' ')
      .trim();

    if (cleaned) return cleaned;
  }

  return '';
}

// ── File reader ───────────────────────────────────────────────────────────────

function readSkillFile(dir: string, skillName: string): LiveSkill | null {
  const skillPath = join(dir, skillName, 'SKILL.md');
  try {
    statSync(skillPath); // confirm file exists
  } catch {
    return null;
  }

  let raw = '';
  try {
    raw = readFileSync(skillPath, 'utf-8');
  } catch {
    return null;
  }

  const { name, description } = parseFrontmatter(raw);
  const trigger = extractTrigger(raw);

  return {
    name: name || skillName,
    trigger,
    description,
  };
}

// ── Route ─────────────────────────────────────────────────────────────────────

export async function GET() {
  const skillsDir = join(process.cwd(), '.cursor', 'skills');

  let entries: string[] = [];
  try {
    entries = readdirSync(skillsDir);
  } catch {
    // Skills directory not found — return empty payload
    return NextResponse.json(
      { phases: [], total: 0, parsedAt: new Date().toISOString() } satisfies SkillsData,
      { headers: { 'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=120' } }
    );
  }

  // Parse each skill
  const allSkills: Map<PhaseName, LiveSkill[]> = new Map(
    PHASE_ORDER.map((p) => [p, []])
  );

  for (const entry of entries) {
    const phase = PHASE_MAP[entry];
    if (!phase) continue; // skill exists but isn't assigned to a phase yet

    const skill = readSkillFile(skillsDir, entry);
    if (!skill) continue;

    allSkills.get(phase)!.push(skill);
  }

  // Preserve phase-level order from PHASE_ORDER; within each phase, preserve
  // filesystem/PHASE_MAP insertion order (matches how CATEGORIES was ordered).
  const phases: LiveSkillPhase[] = PHASE_ORDER.map((label) => ({
    label,
    skills: allSkills.get(label) ?? [],
  })).filter((p) => p.skills.length > 0);

  const total = phases.reduce((n, p) => n + p.skills.length, 0);

  return NextResponse.json(
    { phases, total, parsedAt: new Date().toISOString() } satisfies SkillsData,
    { headers: { 'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=120' } }
  );
}
