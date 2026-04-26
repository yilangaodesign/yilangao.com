#!/usr/bin/env node
// One-shot script: adds <a id="..."></a> anchors above every AP/EAP/CAP/DAP entry
// heading and prepends file-level YAML frontmatter to the 3 anti-pattern files.
// Idempotent: skips entries that already have an anchor on the line above.

import { readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';

const ROOT = resolve(import.meta.dirname, '..');

const FILES = [
  {
    path: 'docs/design-anti-patterns.md',
    prefix: 'AP',
    frontmatter: {
      type: 'anti-pattern',
      id: 'design-anti-patterns',
      topics: ['design', 'guardrail'],
      enforces: ['design.md'],
      references: ['design-feedback-log.md'],
    },
  },
  {
    path: 'docs/engineering-anti-patterns.md',
    prefix: 'EAP',
    frontmatter: {
      type: 'anti-pattern',
      id: 'engineering-anti-patterns',
      topics: ['engineering', 'guardrail'],
      enforces: ['engineering.md'],
      references: ['engineering-feedback-log.md'],
    },
  },
  {
    path: 'docs/content-anti-patterns.md',
    prefix: 'CAP',
    frontmatter: {
      type: 'anti-pattern',
      id: 'content-anti-patterns',
      topics: ['content', 'guardrail'],
      enforces: ['content.md'],
      references: ['content-feedback-log.md'],
    },
  },
];

function buildFrontmatterBlock(fm) {
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
  // Either starts with `---` or starts with `<!--` followed by `-->\n---`.
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

function processFile({ path, prefix, frontmatter }) {
  const abs = resolve(ROOT, path);
  let text = readFileSync(abs, 'utf8');
  let inserted = 0;
  let skipped = 0;

  if (!alreadyHasFrontmatter(text)) {
    text = buildFrontmatterBlock(frontmatter) + '\n' + text;
  }

  // Anchor pattern: line N is anchor, line N+1 is heading.
  const headingRegex = new RegExp(`^(#{2,4})\\s+(${prefix})-(\\d+)`, 'm');
  const lines = text.split('\n');
  const out = [];
  const seenIds = new Map();
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const match = line.match(new RegExp(`^(#{2,4})\\s+(${prefix})-(\\d+)([:.\\s]|$)`));
    if (match) {
      const num = match[3].padStart(3, '0');
      let id = `${prefix.toLowerCase()}-${num}`;
      const prev = i > 0 ? lines[i - 1] : '';
      const hasAnchorAbove = /^<a\s+id="[^"]+"\s*><\/a>\s*$/.test(prev.trim());
      if (hasAnchorAbove) {
        out.push(line);
        skipped++;
        continue;
      }
      // Disambiguate duplicate IDs (e.g., AP-048 occurs twice in design-anti-patterns).
      if (seenIds.has(id)) {
        const n = (seenIds.get(id) || 1) + 1;
        seenIds.set(id, n);
        id = `${id}-${String.fromCharCode(96 + n)}`; // ap-048-b, ap-048-c, ...
      } else {
        seenIds.set(id, 1);
      }
      // Insert blank-line separator above for readability (only if not already blank).
      if (out.length > 0 && out[out.length - 1].trim() !== '') {
        out.push('');
      }
      out.push(`<a id="${id}"></a>`);
      out.push(line);
      inserted++;
    } else {
      out.push(line);
    }
  }
  const updated = out.join('\n');
  if (updated !== text) {
    writeFileSync(abs, updated);
  }
  console.log(`[${path}] inserted: ${inserted}, skipped (already-anchored): ${skipped}`);
}

for (const f of FILES) processFile(f);
