#!/usr/bin/env node
// One-shot script: add HTML anchors before every `## REL-NNN` heading in
// docs/release-log.md and docs/release-log-archive.md. Idempotent.
// Also prepends file-level frontmatter declaring the file as type: release-log.

import { readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';

const ROOT = resolve(import.meta.dirname, '..');
const FILES = [
  {
    path: 'docs/release-log.md',
    frontmatter: {
      type: 'release-log',
      id: 'release-log',
      topics: ['release', 'engineering'],
      references: ['engineering.md'],
    },
  },
  {
    path: 'docs/release-log-archive.md',
    frontmatter: {
      type: 'release-log',
      id: 'release-log-archive',
      topics: ['release', 'engineering'],
      supersededBy: ['release-log.md'],
    },
  },
];

function buildFrontmatter(fm) {
  const lines = ['<!-- graph metadata for docs knowledge graph (see docs/knowledge-graph.md) -->', '---'];
  for (const [k, v] of Object.entries(fm)) {
    if (Array.isArray(v)) {
      lines.push(`${k}:`);
      for (const item of v) lines.push(`  - ${item}`);
    } else {
      lines.push(`${k}: ${v}`);
    }
  }
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

for (const { path, frontmatter } of FILES) {
  const abs = resolve(ROOT, path);
  let text = readFileSync(abs, 'utf8');
  if (!alreadyHasFrontmatter(text)) {
    text = buildFrontmatter(frontmatter) + '\n' + text;
  }
  const lines = text.split('\n');
  const out = [];
  let inserted = 0;
  let skipped = 0;
  const seenIds = new Map();
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const m = line.match(/^(##|###|####)\s+REL-(\d+)/);
    if (m) {
      const num = m[2].padStart(3, '0');
      let id = `rel-${num}`;
      const prev = i > 0 ? lines[i - 1] : '';
      if (/^<a\s+id="[^"]+"\s*><\/a>\s*$/.test(prev.trim())) {
        out.push(line);
        skipped++;
        continue;
      }
      if (seenIds.has(id)) {
        const n = (seenIds.get(id) || 1) + 1;
        seenIds.set(id, n);
        id = `${id}-${String.fromCharCode(96 + n)}`;
      } else {
        seenIds.set(id, 1);
      }
      if (out.length > 0 && out[out.length - 1].trim() !== '') out.push('');
      out.push(`<a id="${id}"></a>`);
      out.push(line);
      inserted++;
    } else {
      out.push(line);
    }
  }
  writeFileSync(abs, out.join('\n'));
  console.log(`[${path}] inserted: ${inserted}, skipped: ${skipped}`);
}
