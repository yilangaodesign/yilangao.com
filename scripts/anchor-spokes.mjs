#!/usr/bin/env node
// One-shot script: prepends file-level YAML frontmatter to docs spoke files.
// Idempotent: skips files that already have frontmatter.
//
// Spoke = a leaf doc under docs/{engineering,design,content}/*.md
// (plus docs/content/projects/*.md). Each spoke gets:
//   type: spoke
//   id: <category>-<basename>     e.g., engineering-versioning
//   topics: [<category>, ...heuristic]
//   derivedFrom: [<category>.md]  (hub is the canonical source)

import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { resolve, join, basename } from 'path';

const ROOT = resolve(import.meta.dirname, '..');

const CATEGORIES = [
  {
    category: 'engineering',
    dir: 'docs/engineering',
    recursive: false,
    hub: 'engineering.md',
  },
  {
    category: 'design',
    dir: 'docs/design',
    recursive: false,
    hub: 'design.md',
  },
  {
    category: 'content',
    dir: 'docs/content',
    recursive: true, // includes projects/
    hub: 'content.md',
  },
];

// keyword -> extra topics (substring match against basename)
const TOPIC_HEURISTICS = {
  analytics: ['analytics'],
  versioning: ['release'],
  storage: ['storage'],
  token: ['parity'],
  port: ['port-registry'],
  multi: ['parity'],
  media: ['content'],
  localhost: ['parity'],
  git: ['release'],
  deployment: ['release'],
  branding: ['branding'],
  color: ['color', 'dark-mode'],
  component: ['component'],
  copy: ['copy'],
  dark: ['dark-mode'],
  global: ['parity'],
  iconography: ['imagery'],
  interaction: ['interaction'],
  interactive: ['interaction'],
  layout: ['layout'],
  microcopy: ['copy'],
  portfolio: ['portfolio', 'branding'],
  system: ['system-architecture'],
  typography: ['typography'],
  voice: ['voice'],
  responsive: ['layout'],
  accessibility: ['accessibility'],
  spacing: ['layout'],
  navigation: ['navigation'],
  tooltip: ['interaction'],
  homepage: ['portfolio'],
  admin: ['admin-ui'],
  corner: ['branding'],
  theming: ['dark-mode'],
  playground: ['playground'],
  framework: ['system-architecture'],
  about: ['portfolio'],
  case: ['case-study'],
  competitive: ['positioning'],
  internal: ['internal-tools'],
  positioning: ['positioning'],
  projects: ['projects', 'case-study'],
  quality: ['quality'],
  scope: ['scope'],
  strategy: ['strategy'],
  visual: ['visual-evidence'],
  conversion: ['analytics'],
  funnel: ['analytics'],
  lifecycle: ['release'],
  coherence: ['parity'],
  narrative: ['case-study'],
  language: ['voice'],
  reference: ['case-study'],
  seniority: ['positioning'],
  self: ['quality'],
  technical: ['engineering'],
  measurement: ['analytics'],
  economy: ['visual-evidence'],
  selection: ['projects'],
  arc: ['case-study'],
  patterns: ['voice'],
  framing: ['positioning'],
  signals: ['positioning'],
  audit: ['quality'],
  portfolios: ['case-study'],
  meteor: ['projects', 'case-study'],
  lacework: ['projects', 'case-study'],
  elan: ['projects', 'case-study'],
  etro: ['projects', 'case-study'],
};

function listMarkdown(dirAbs, recursive) {
  const out = [];
  function walk(d) {
    let entries;
    try { entries = readdirSync(d); } catch { return; }
    for (const e of entries) {
      const p = join(d, e);
      let st;
      try { st = statSync(p); } catch { continue; }
      if (st.isDirectory()) {
        if (recursive) walk(p);
      } else if (st.isFile() && e.endsWith('.md')) {
        out.push(p);
      }
    }
  }
  walk(dirAbs);
  return out.sort();
}

function deriveTopics(category, base) {
  const set = new Set([category]);
  const lower = base.toLowerCase();
  for (const [kw, extras] of Object.entries(TOPIC_HEURISTICS)) {
    if (lower.includes(kw)) for (const t of extras) set.add(t);
  }
  return [...set];
}

function buildFrontmatter(category, relPath, hub) {
  const base = basename(relPath, '.md');
  const id = `${category}-${base}`;
  const topics = deriveTopics(category, base);
  const lines = ['<!-- graph metadata for docs knowledge graph (see docs/knowledge-graph.md) -->', '---'];
  lines.push('type: spoke');
  lines.push(`id: ${id}`);
  lines.push('topics:');
  for (const t of topics) lines.push(`  - ${t}`);
  lines.push('derivedFrom:');
  lines.push(`  - ${hub}`);
  lines.push('---', '');
  return lines.join('\n');
}

function alreadyHasFrontmatter(text) {
  if (text.startsWith('---\n') || text.startsWith('---\r\n')) return true;
  if (text.startsWith('<!--')) {
    const end = text.indexOf('-->');
    if (end !== -1) {
      const after = text.slice(end + 3).replace(/^\s+/, '');
      return after.startsWith('---\n') || after.startsWith('---\r\n');
    }
  }
  return false;
}

let added = 0;
let skipped = 0;
const filterCat = process.argv[2]; // optional: 'engineering' | 'design' | 'content'

for (const cat of CATEGORIES) {
  if (filterCat && cat.category !== filterCat) continue;
  const dirAbs = resolve(ROOT, cat.dir);
  const files = listMarkdown(dirAbs, cat.recursive);
  for (const abs of files) {
    const rel = abs.slice(ROOT.length + 1);
    let text = readFileSync(abs, 'utf8');
    if (alreadyHasFrontmatter(text)) {
      skipped++;
      continue;
    }
    const fm = buildFrontmatter(cat.category, rel, cat.hub);
    writeFileSync(abs, fm + '\n' + text);
    added++;
    console.log(`+ ${rel}`);
  }
}
console.log(`\nAdded: ${added}, skipped (already had FM): ${skipped}`);
