#!/usr/bin/env node

import { readFileSync, readdirSync as _readdirSync, existsSync, statSync } from 'fs';
import { resolve, relative, dirname, join } from 'path';
import { createHash } from 'crypto';
import http from 'http';

const ROOT = resolve(import.meta.dirname, '..');

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const DOC_GLOBS = [
  'AGENTS.md',
  'CLAUDE.md',
  'docs/*.md',
  '.cursor/skills/**/SKILL.md',
  '.cursor/rules/*.mdc',
];

const ENTRY_POINTS = ['AGENTS.md', 'CLAUDE.md'];
const LINE_LIMIT = 300;
const DUPLICATE_MIN_LINES = 3;
const STALE_MARKERS = ['TODO', 'FIXME', 'TBD', 'HACK', 'XXX'];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function collectFiles() {
  const files = new Set();
  for (const pattern of DOC_GLOBS) {
    const abs = resolve(ROOT, pattern);
    if (pattern.includes('*')) {
      const matches = nativeGlob(pattern);
      matches.forEach((f) => files.add(f));
    } else if (existsSync(abs)) {
      files.add(abs);
    }
  }
  return [...files];
}

function nativeGlob(pattern) {
  const results = [];
  const parts = pattern.split('**/');
  if (parts.length === 2) {
    walkDir(resolve(ROOT, parts[0] || '.'), parts[1], results);
  } else {
    simpleGlob(resolve(ROOT), pattern, results);
  }
  return results;
}

function walkDir(dir, filePattern, results) {
  if (!existsSync(dir) || !statSync(dir).isDirectory()) return;
  const entries = readdirSyncSafe(dir);
  for (const entry of entries) {
    const full = join(dir, entry);
    const stat = statSync(full);
    if (stat.isDirectory()) {
      walkDir(full, filePattern, results);
    } else if (matchSimple(entry, filePattern)) {
      results.push(full);
    }
  }
}

function simpleGlob(base, pattern, results) {
  const dir = dirname(resolve(base, pattern));
  const filePattern = pattern.split('/').pop();
  if (!existsSync(dir) || !statSync(dir).isDirectory()) return;
  const entries = readdirSyncSafe(dir);
  for (const entry of entries) {
    if (matchSimple(entry, filePattern)) {
      results.push(join(dir, entry));
    }
  }
}

function matchSimple(filename, pattern) {
  const regex = new RegExp(
    '^' + pattern.replace(/\./g, '\\.').replace(/\*/g, '.*') + '$'
  );
  return regex.test(filename);
}

function readdirSyncSafe(dir) {
  try {
    return _readdirSync(dir);
  } catch {
    return [];
  }
}

function rel(absPath) {
  return relative(ROOT, absPath);
}

// ---------------------------------------------------------------------------
// Checks
// ---------------------------------------------------------------------------

const findings = [];

function report(severity, check, file, message) {
  findings.push({ severity, check, file: file ? rel(file) : null, message });
}

// 1. File size
function checkFileSize(files) {
  for (const f of files) {
    const lines = readFileSync(f, 'utf-8').split('\n');
    if (lines.length > LINE_LIMIT) {
      report(
        'WARN',
        'file-size',
        f,
        `${lines.length} lines (limit: ${LINE_LIMIT}). Large files are hard for agents to process efficiently.`
      );
    }
  }
}

// 2. Heading hierarchy
function checkHeadingHierarchy(files) {
  for (const f of files) {
    const content = readFileSync(f, 'utf-8');
    const headings = [];
    for (const line of content.split('\n')) {
      const match = line.match(/^(#{1,6})\s+/);
      if (match) headings.push(match[1].length);
    }
    for (let i = 1; i < headings.length; i++) {
      const jump = headings[i] - headings[i - 1];
      if (jump > 1) {
        report(
          'WARN',
          'heading-hierarchy',
          f,
          `Heading level jumps from h${headings[i - 1]} to h${headings[i]} (skips ${jump - 1} level${jump - 1 > 1 ? 's' : ''}).`
        );
      }
    }
  }
}

// 3. Section index accuracy
// Only targets tables immediately following a heading containing "Section Index"
// (e.g., "## Section Index — Read This First"). Ignores inline mentions.
function checkSectionIndex(files) {
  for (const f of files) {
    const content = readFileSync(f, 'utf-8');
    const lines = content.split('\n');

    const indexEntries = [];
    let inIndex = false;
    let passedSeparator = false;

    for (const line of lines) {
      if (/^#{1,6}\s+.*Section Index/.test(line)) {
        inIndex = true;
        passedSeparator = false;
        continue;
      }

      if (inIndex) {
        if (/^\|[\s-]+\|/.test(line)) {
          passedSeparator = true;
          continue;
        }
        if (passedSeparator && line.startsWith('|')) {
          const cells = line
            .split('|')
            .map((c) => c.trim())
            .filter(Boolean);
          if (cells.length >= 2) {
            indexEntries.push(cells[1]);
          }
          continue;
        }
        if (passedSeparator && !line.startsWith('|')) {
          inIndex = false;
        }
        if (!passedSeparator && line.startsWith('|') && line.includes('§')) {
          continue;
        }
      }
    }

    if (indexEntries.length === 0) continue;

    const headings = lines
      .filter((l) => /^#{1,6}\s+/.test(l))
      .map((l) =>
        l
          .replace(/^#{1,6}\s+/, '')
          .replace(/^§?\d+\.\s*/, '')
          .replace(/\(.*?\)/g, '')
          .trim()
      );

    const headingsLower = headings.map((h) => h.toLowerCase());

    for (const entry of indexEntries) {
      const entryLower = entry.toLowerCase();
      const found = headingsLower.some(
        (h) => h === entryLower || h.includes(entryLower) || entryLower.includes(h)
      );
      if (!found) {
        report(
          'ERROR',
          'section-index',
          f,
          `Section Index lists "${entry}" but no matching heading found in file.`
        );
      }
    }
  }
}

// 4. Broken cross-references
// Skips URLs, anchors, @-references, and agent chat transcript links (UUIDs, "current-session").
const UUID_RE = /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/;
const CHAT_REF_RE = /^current-session$/;

function checkCrossReferences(files) {
  const linkPattern = /\[([^\]]*)\]\(([^)]+)\)/g;

  for (const f of files) {
    const content = readFileSync(f, 'utf-8');
    let match;
    while ((match = linkPattern.exec(content)) !== null) {
      const target = match[2];

      if (target.startsWith('http://') || target.startsWith('https://')) continue;
      if (target.startsWith('#')) continue;
      if (target.startsWith('@')) continue;
      if (UUID_RE.test(target) || CHAT_REF_RE.test(target)) continue;

      const targetPath = target.split('#')[0];
      if (!targetPath) continue;

      const resolved = resolve(dirname(f), targetPath);
      if (!existsSync(resolved)) {
        report(
          'ERROR',
          'broken-link',
          f,
          `Link target "${targetPath}" does not exist on disk.`
        );
      }
    }
  }
}

// 5. Orphan detection
function checkOrphans(files) {
  const entryContent = ENTRY_POINTS.map((ep) => {
    const p = resolve(ROOT, ep);
    return existsSync(p) ? readFileSync(p, 'utf-8') : '';
  }).join('\n');

  const allContent = files.map((f) => readFileSync(f, 'utf-8')).join('\n');

  for (const f of files) {
    const relPath = rel(f);
    if (ENTRY_POINTS.includes(relPath)) continue;

    const filename = relPath.split('/').pop();
    const isReferenced =
      entryContent.includes(relPath) ||
      entryContent.includes(filename) ||
      allContent.includes(relPath) ||
      (allContent.match(new RegExp(`\\(${escapeRegex(relPath)}[)#]`)) !== null);

    if (!isReferenced) {
      report(
        'WARN',
        'orphan',
        f,
        `Not referenced from any entry point or other doc file. May be undiscoverable by agents.`
      );
    }
  }
}

function escapeRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// 6. Duplicate content
// Skips table-separator rows, very short blocks, and identical structural
// patterns (like shared table headers) that are expected across parallel docs.
function checkDuplicates(files) {
  const blockMap = new Map();

  for (const f of files) {
    const lines = readFileSync(f, 'utf-8').split('\n');
    const normalized = lines.map((l) => l.trim().toLowerCase().replace(/\s+/g, ' '));

    for (let i = 0; i <= normalized.length - DUPLICATE_MIN_LINES; i++) {
      const block = normalized.slice(i, i + DUPLICATE_MIN_LINES).join('\n');
      if (block.replace(/\s/g, '').length < 40) continue;
      if (/^\|.*\|$/.test(normalized[i]) && normalized[i].includes('---')) continue;

      const hash = createHash('md5').update(block).digest('hex');
      if (!blockMap.has(hash)) {
        blockMap.set(hash, []);
      }
      blockMap.get(hash).push({ file: f, line: i + 1 });
    }
  }

  const reported = new Set();
  for (const [, locations] of blockMap) {
    const uniqueFiles = [...new Set(locations.map((l) => l.file))];
    if (uniqueFiles.length < 2) continue;

    const key = uniqueFiles.map(rel).sort().join('|');
    if (reported.has(key)) continue;
    reported.add(key);

    const first = locations[0];
    const preview = readFileSync(first.file, 'utf-8')
      .split('\n')
      .slice(first.line - 1, first.line - 1 + DUPLICATE_MIN_LINES)
      .map((l) => `    ${l}`)
      .join('\n');

    report(
      'WARN',
      'duplicate',
      first.file,
      `Duplicate content block also found in ${uniqueFiles
        .filter((f2) => f2 !== first.file)
        .map(rel)
        .join(', ')} (line ${first.line}):\n${preview}`
    );
  }
}

// 7. Stale markers
// Only flags markers used as actionable tags: "TODO:", "FIXME -", "TODO(name)",
// "// HACK", "<!-- TODO" — not prose mentions like "checks for TODO markers".
const MARKER_TAG_RE = new RegExp(
  `(?://|<!--|#|\\*)?\\s*\\b(${STALE_MARKERS.join('|')})\\s*[:(-]`,
  'i'
);

function checkStaleMarkers(files) {
  for (const f of files) {
    const lines = readFileSync(f, 'utf-8').split('\n');
    const markerCounts = {};
    let inCodeBlock = false;

    lines.forEach((line, idx) => {
      if (line.trimStart().startsWith('```')) {
        inCodeBlock = !inCodeBlock;
        return;
      }
      if (inCodeBlock) return;

      if (MARKER_TAG_RE.test(line)) {
        const matched = line.match(MARKER_TAG_RE)[1].toUpperCase();
        if (!markerCounts[matched]) markerCounts[matched] = [];
        markerCounts[matched].push(idx + 1);
      }
    });

    for (const [marker, lineNums] of Object.entries(markerCounts)) {
      report(
        'INFO',
        'stale-marker',
        f,
        `${lineNums.length}× ${marker} marker${lineNums.length > 1 ? 's' : ''} at line${lineNums.length > 1 ? 's' : ''} ${lineNums.join(', ')}.`
      );
    }
  }
}

// 8. Server health — reads port-registry.md and verifies each "running" service responds
function httpHead(port) {
  return new Promise((resolve) => {
    const req = http.request(
      { hostname: '127.0.0.1', port, method: 'HEAD', timeout: 3000 },
      (res) => resolve(res.statusCode)
    );
    req.on('error', () => resolve(null));
    req.on('timeout', () => { req.destroy(); resolve(null); });
    req.end();
  });
}

async function checkServerHealth() {
  const registryPath = resolve(ROOT, 'docs/port-registry.md');
  if (!existsSync(registryPath)) {
    report('WARN', 'server-health', null, 'docs/port-registry.md not found — cannot verify servers.');
    return;
  }

  const content = readFileSync(registryPath, 'utf-8');
  const lines = content.split('\n');

  const services = [];
  let inTable = false;
  for (const line of lines) {
    if (line.includes('Service') && line.includes('Default Port')) {
      inTable = true;
      continue;
    }
    if (inTable && /^\|[\s-]+\|/.test(line)) continue;
    if (inTable && line.startsWith('|')) {
      const cells = line.split('|').map((c) => c.trim()).filter(Boolean);
      if (cells.length >= 4) {
        services.push({
          name: cells[0],
          defaultPort: parseInt(cells[1], 10),
          currentPort: cells[2] === '—' ? null : parseInt(cells[2], 10),
          status: cells[3],
        });
      }
      continue;
    }
    if (inTable && !line.startsWith('|')) {
      inTable = false;
    }
  }

  for (const svc of services) {
    if (svc.status !== 'running') continue;
    if (!svc.currentPort) {
      report('ERROR', 'server-health', null, `${svc.name}: registry says "running" but no port assigned.`);
      continue;
    }

    const statusCode = await httpHead(svc.currentPort);
    if (statusCode === null) {
      report(
        'ERROR',
        'server-health',
        null,
        `${svc.name}: not responding on port ${svc.currentPort}. Registry says "running" but server is down.`
      );
    } else {
      report(
        'INFO',
        'server-health',
        null,
        `${svc.name}: healthy on port ${svc.currentPort} (HTTP ${statusCode}).`
      );
    }
  }
}

// ---------------------------------------------------------------------------
// Runner
// ---------------------------------------------------------------------------

function printReport() {
  const counts = { ERROR: 0, WARN: 0, INFO: 0 };
  findings.forEach((f) => counts[f.severity]++);

  console.log('');
  console.log('╔══════════════════════════════════════════════════╗');
  console.log('║           DOC SELF-AUDIT REPORT                 ║');
  console.log('╚══════════════════════════════════════════════════╝');
  console.log('');

  if (findings.length === 0) {
    console.log('  ✓ All checks passed. No issues found.');
    console.log('');
    return;
  }

  const grouped = {};
  for (const f of findings) {
    const key = f.check;
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(f);
  }

  const checkLabels = {
    'server-health': 'Server Health',
    'file-size': 'File Size',
    'heading-hierarchy': 'Heading Hierarchy',
    'section-index': 'Section Index Accuracy',
    'broken-link': 'Broken Cross-References',
    orphan: 'Orphan Detection',
    duplicate: 'Duplicate Content',
    'stale-marker': 'Stale Markers',
  };

  for (const [check, items] of Object.entries(grouped)) {
    console.log(`── ${checkLabels[check] || check} ──`);
    for (const item of items) {
      const prefix =
        item.severity === 'ERROR'
          ? '  ✗ ERROR'
          : item.severity === 'WARN'
            ? '  ⚠ WARN '
            : '  ◦ INFO ';
      const filePart = item.file ? ` [${item.file}]` : '';
      console.log(`${prefix}${filePart}`);
      console.log(`         ${item.message}`);
    }
    console.log('');
  }

  console.log('── Summary ──');
  console.log(
    `  ${counts.ERROR} error(s), ${counts.WARN} warning(s), ${counts.INFO} info(s)`
  );
  console.log('');

  if (counts.ERROR > 0) {
    process.exitCode = 1;
  }
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  const files = collectFiles();

  if (files.length === 0) {
    console.log('No doc files found. Check DOC_GLOBS configuration.');
    process.exit(1);
  }

  console.log(`Scanning ${files.length} doc file(s)...`);

  await checkServerHealth();
  checkFileSize(files);
  checkHeadingHierarchy(files);
  checkSectionIndex(files);
  checkCrossReferences(files);
  checkOrphans(files);
  checkDuplicates(files);
  checkStaleMarkers(files);

  printReport();
}

main();
