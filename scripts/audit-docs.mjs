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
  '.cursor/rules/*.md',
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
            indexEntries.push({ topic: cells[1], cells });
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

    // External-doc link detector: matches markdown links pointing to other
    // files or directories (relative paths). Skips anchor-only (#x) and
    // absolute URLs (http/https/mailto).
    const externalDocLinkRe = /\[([^\]]+)\]\(([^)]+)\)/g;
    const isExternalDocTarget = (target) =>
      !!target &&
      !target.startsWith('#') &&
      !target.startsWith('http://') &&
      !target.startsWith('https://') &&
      !target.startsWith('mailto:');

    for (const entryObj of indexEntries) {
      // If ANY cell on the row contains an external-doc link, treat the row as
      // a cross-document reference. The Broken Cross-References check already
      // validates those targets, so we don't need a local-heading match here.
      const rowHasExternalLink = entryObj.cells.some((c) => {
        externalDocLinkRe.lastIndex = 0;
        let m;
        while ((m = externalDocLinkRe.exec(c)) !== null) {
          if (isExternalDocTarget(m[2])) return true;
        }
        return false;
      });
      if (rowHasExternalLink) continue;

      const rawEntry = entryObj.topic;

      // Strip a single wrapping `[Title](...)` for display/comparison.
      const wrapMatch = rawEntry.match(/^\[([^\]]+)\]\(([^)]+)\)\s*$/);
      const entry = wrapMatch ? wrapMatch[1] : rawEntry;
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
// Skips URLs, anchors, @-references, agent chat transcript links (UUIDs,
// short hex prefixes, "current-session"), and links inside inline code or
// fenced code blocks (which are illustrative, not real references).
const UUID_RE = /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/;
const SHORT_HEX_RE = /^[a-f0-9]{6,40}$/; // transcript prefixes, commit SHAs
const CHAT_REF_RE = /^current-session$/;

function stripCodeRegions(content) {
  // Replace fenced code blocks and inline code spans with whitespace of the
  // same length so character offsets remain stable for downstream checks.
  let out = content.replace(/```[\s\S]*?```/g, (m) => ' '.repeat(m.length));
  out = out.replace(/`[^`\n]*`/g, (m) => ' '.repeat(m.length));
  return out;
}

function checkCrossReferences(files) {
  const linkPattern = /\[([^\]]*)\]\(([^)]+)\)/g;

  for (const f of files) {
    const raw = readFileSync(f, 'utf-8');
    const content = stripCodeRegions(raw);
    let match;
    while ((match = linkPattern.exec(content)) !== null) {
      const target = match[2];

      if (target.startsWith('http://') || target.startsWith('https://')) continue;
      if (target.startsWith('#')) continue;
      if (target.startsWith('@')) continue;
      if (UUID_RE.test(target) || CHAT_REF_RE.test(target)) continue;
      if (SHORT_HEX_RE.test(target)) continue;

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
    'analytics-parity': 'Analytics Event Registry Parity',
    'broken-anchor': 'Graph Topology — Broken Anchors',
    'orphan-anti-pattern': 'Graph Topology — Orphan Anti-Patterns',
    'topic-vocabulary': 'Graph Topology — Topic Vocabulary',
    'frontmatter-schema': 'Graph Topology — Frontmatter Schema',
    'anchor-uniqueness': 'Graph Topology — Anchor ID Uniqueness',
    'graph-staleness': 'Graph Topology — Cache Staleness',
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

// 9. Analytics event registry parity
function checkAnalyticsEventRegistryParity() {
  const registryPath = resolve(ROOT, 'docs/analytics.md');
  if (!existsSync(registryPath)) {
    report('WARN', 'analytics-parity', null, 'docs/analytics.md not found — skipping event registry parity check.');
    return;
  }

  const registryContent = readFileSync(registryPath, 'utf-8');

  // Extract only the Event Registry section, then parse event names from it.
  const sectionMatch = registryContent.match(/## Event Registry\n([\s\S]*?)(?=\n## |\n---\s*$|$)/);
  if (!sectionMatch) {
    report('WARN', 'analytics-parity', registryPath, 'Could not find "## Event Registry" section in docs/analytics.md.');
    return;
  }
  const registrySection = sectionMatch[1];

  const registryEvents = new Set();
  const tableRowRegex = /^\|\s*\*\*(.+?)\*\*\s*\|/gm;
  let match;
  while ((match = tableRowRegex.exec(registrySection)) !== null) {
    const name = match[1].trim();
    if (name !== 'Event Name' && name !== '---') {
      registryEvents.add(name);
    }
  }

  if (registryEvents.size === 0) {
    report('WARN', 'analytics-parity', registryPath, 'Could not parse any event names from the Event Registry table.');
    return;
  }

  // Grep src/ for track() calls, excluding tests, stories, and node_modules.
  const srcDir = resolve(ROOT, 'src');
  const codeEvents = new Set();
  const trackRegex = /track\s*\(\s*["']([^"']+)["']/g;

  function scanDir(dir) {
    if (!existsSync(dir)) return;
    const entries = readdirSyncSafe(dir);
    for (const entry of entries) {
      if (entry === 'node_modules') continue;
      const full = join(dir, entry);
      const stat = statSync(full);
      if (stat.isDirectory()) {
        scanDir(full);
      } else if (/\.(ts|tsx|js|jsx)$/.test(entry) && !/\.(test|stories|spec)\./.test(entry)) {
        const content = readFileSync(full, 'utf-8');
        let m;
        while ((m = trackRegex.exec(content)) !== null) {
          codeEvents.add(m[1]);
        }
        trackRegex.lastIndex = 0;
      }
    }
  }

  scanDir(srcDir);

  // Bidirectional set diff
  for (const event of codeEvents) {
    if (!registryEvents.has(event)) {
      report('ERROR', 'analytics-parity', registryPath, `Event "${event}" found in code but missing from the event registry in docs/analytics.md.`);
    }
  }

  for (const event of registryEvents) {
    if (!codeEvents.has(event)) {
      report('ERROR', 'analytics-parity', registryPath, `Event "${event}" listed in registry but no matching track() call found in src/.`);
    }
  }
}

// ---------------------------------------------------------------------------
// Topology checks (Plan A Phase 1c stubs; wired into main() in Phase 7a)
// ---------------------------------------------------------------------------

const GRAPH_CACHE_PATH = resolve(ROOT, '.cache/graph.json');
const KG_SPEC_PATH = resolve(ROOT, 'docs/knowledge-graph.md');
const TOPIC_VOCAB_CAP = 40;

function loadGraphCacheOrWarn(checkName) {
  if (!existsSync(GRAPH_CACHE_PATH)) {
    report(
      'WARN',
      checkName,
      null,
      `Graph cache not found at .cache/graph.json. Run \`npm run build-graph\` first.`
    );
    return null;
  }
  try {
    return JSON.parse(readFileSync(GRAPH_CACHE_PATH, 'utf-8'));
  } catch (err) {
    report('ERROR', checkName, GRAPH_CACHE_PATH, `Failed to parse graph cache: ${err.message}`);
    return null;
  }
}

function checkBrokenAnchors() {
  const graph = loadGraphCacheOrWarn('broken-anchor');
  if (!graph) return;
  const anchorIds = new Set(graph.nodes.map((n) => n.id));
  for (const edge of graph.edges) {
    if (edge.source && edge.source.startsWith('markdown-link')) {
      if (!anchorIds.has(edge.to)) {
        report(
          'ERROR',
          'broken-anchor',
          null,
          `Edge from \`${edge.from}\` references missing anchor \`${edge.to}\` (source: ${edge.source}).`
        );
      }
    }
  }
}

function checkOrphanAntiPatterns() {
  const graph = loadGraphCacheOrWarn('orphan-anti-pattern');
  if (!graph) return;
  const anyInbound = new Map();
  const enforcerInbound = new Map();
  for (const edge of graph.edges) {
    // Skip self-edges from the AP catalog file (`engineering-anti-patterns documents eap-013`)
    // because they don't count as cross-references that prove the AP is connected.
    if (edge.source === 'anchor:contained' || edge.source === 'anchor:contained:inverse') continue;
    if (
      edge.type === 'references' ||
      edge.type === 'referencedBy' ||
      edge.type === 'enforces' ||
      edge.type === 'enforcedBy'
    ) {
      anyInbound.set(edge.to, (anyInbound.get(edge.to) || 0) + 1);
    }
    if (edge.type === 'enforces' || edge.type === 'enforcedBy') {
      enforcerInbound.set(edge.to, (enforcerInbound.get(edge.to) || 0) + 1);
    }
  }
  for (const node of graph.nodes) {
    if (node.type !== 'anti-pattern') continue;
    if (!anyInbound.get(node.id)) {
      // True orphan: the AP exists in the catalog but nothing in the watched
      // docs scope mentions it at all. Either delete or add a citation.
      report(
        'WARN',
        'orphan-anti-pattern',
        node.path,
        `Anti-pattern \`${node.id}\` has zero inbound references — no rule, skill, guardrail, or feedback entry mentions it.`
      );
    } else if (!enforcerInbound.get(node.id)) {
      // Has references but no enforcer (guardrail/skill/rule). This is a
      // documentation gap: the pattern is observed but no prescription
      // prevents it. INFO so it doesn't gate audits, but visible.
      report(
        'INFO',
        'orphan-anti-pattern',
        node.path,
        `Anti-pattern \`${node.id}\` has references but no enforcer — no guardrail, skill, or rule cites it.`
      );
    }
  }
}

function checkTopicVocabulary() {
  const graph = loadGraphCacheOrWarn('topic-vocabulary');
  if (!graph) return;
  if (!existsSync(KG_SPEC_PATH)) {
    report('WARN', 'topic-vocabulary', null, `Knowledge graph spec not found at ${rel(KG_SPEC_PATH)}.`);
    return;
  }
  const specText = readFileSync(KG_SPEC_PATH, 'utf-8');
  const m = /## 9\. Topic vocabulary[\s\S]*?```\n([\s\S]*?)\n```/m.exec(specText);
  if (!m) {
    report('WARN', 'topic-vocabulary', KG_SPEC_PATH, 'Could not parse topic vocabulary fenced block.');
    return;
  }
  const vocab = new Set(m[1].split('\n').map((s) => s.trim()).filter(Boolean));
  if (vocab.size > TOPIC_VOCAB_CAP) {
    report(
      'ERROR',
      'topic-vocabulary',
      KG_SPEC_PATH,
      `Topic vocabulary has ${vocab.size} entries; cap is ${TOPIC_VOCAB_CAP}.`
    );
  }
  for (const node of graph.nodes) {
    if (!Array.isArray(node.topics)) continue;
    for (const t of node.topics) {
      if (!vocab.has(t)) {
        report(
          'WARN',
          'topic-vocabulary',
          node.path,
          `Node \`${node.id}\` uses topic \`${t}\` not in vocabulary.`
        );
      }
    }
  }
}

function checkFrontmatterSchema() {
  const graph = loadGraphCacheOrWarn('frontmatter-schema');
  if (!graph) return;
  const knownTypes = new Set([
    'route-table',
    'hub',
    'spoke',
    'anti-pattern',
    'feedback',
    'release',
    'skill',
    'rule',
    'cross-cutting',
    'untagged-pattern-list',
    'renumber-log',
    'cluster-report',
    'alias',
    'eval-task-corpus',
    'eval-baseline',
    'eval-report',
    'eval-spec',
    'release-log',
    'spec',
  ]);
  for (const node of graph.nodes) {
    if (node.type === 'unknown' || node.type === 'section' || node.type === 'route' || node.type === 'guardrail') continue;
    if (!knownTypes.has(node.type)) {
      report(
        'WARN',
        'frontmatter-schema',
        node.path,
        `Node \`${node.id}\` has unknown type \`${node.type}\` (allowed: ${[...knownTypes].join(', ')}).`
      );
    }
  }
}

function checkAnchorIdUniqueness() {
  const graph = loadGraphCacheOrWarn('anchor-uniqueness');
  if (!graph) return;
  const seen = new Map();
  for (const node of graph.nodes) {
    const prior = seen.get(node.id);
    if (prior && prior.path !== node.path) {
      report(
        'ERROR',
        'anchor-uniqueness',
        node.path,
        `Duplicate anchor id \`${node.id}\` also found in \`${prior.path}\`.`
      );
    } else if (!prior) {
      seen.set(node.id, node);
    }
  }
}

// ---------------------------------------------------------------------------
// Plan B Phase 4e — Feedback-log tagging-rate checks
// ---------------------------------------------------------------------------

// Discovered at scan time via glob — never hardcode file lists; new feedback
// logs added to docs/ are automatically included. See ENG-230.
function discoverFeedbackLogs() {
  const matches = nativeGlob('docs/*-feedback-log*.md');
  return matches
    .map((abs) => relative(ROOT, abs))
    .filter((rel) => !rel.includes('synthesis'))
    .sort();
}

// Tightened canonical citation regex (per ENG-230, ratifying P9):
//   - Strong:      "See AP-NNN" / "See EAP-NNN" / "See CAP-NNN" (confidence 1.0)
//   - Approximate: "Related: AP-NNN" / "Loose match: Related: AP-NNN" (confidence 0.6)
//
// Tightened to line-start (with optional bold-markdown prefix like
// "**Loose match:**") so narrative usage of "See AP-NNN" or "Related:"
// mid-sentence does NOT inflate the metric. The plan's original loose
// regex `/(?:^|\s)(See|Related:)\s+...` over-matched on body text.
const CANON_CITATION_RE = /^(?:\*\*[^*]+:\*\*\s+)?(See|Related:)\s+(?:AP|EAP|CAP)-\d{1,4}(?:\s*\(([0-9]*\.?[0-9]+)\))?/m;
const CANON_CITATION_GLOBAL = /^(?:\*\*[^*]+:\*\*\s+)?(See|Related:)\s+(AP|EAP|CAP)-\d{1,4}(?:\s*\(([0-9]*\.?[0-9]+)\))?/gm;
const ANCHOR_LINE_RE = /^<a id="((?:cfb|fb|eng)-[\w-]+)"><\/a>$/;
const HEADING_LINE_RE = /^(#{2,4})\s+((?:CFB|FB|ENG)-\d+):?\s*(.*)$/;

// Defaults if knowledge-graph.md §17 is unparseable. These match the plan
// fallback policy floor (achieved-rate-rounded-down-to-5%). The actual values
// are loaded from §17 at run time via loadTaggingInvariants().
const DEFAULT_MIN_RAW_RATE = 0.4;
const DEFAULT_MIN_MEAN_CONFIDENCE = 0.7;
const DEFAULT_WINDOW_SIZE = 30;
const DEFAULT_WINDOW_MIN_RATE = 0.5;

function loadTaggingInvariants() {
  const kgPath = resolve(ROOT, 'docs/knowledge-graph.md');
  if (!existsSync(kgPath)) {
    return {
      minRawRate: DEFAULT_MIN_RAW_RATE,
      minMeanConfidence: DEFAULT_MIN_MEAN_CONFIDENCE,
      windowSize: DEFAULT_WINDOW_SIZE,
      windowMinRate: DEFAULT_WINDOW_MIN_RATE,
      source: 'default',
    };
  }
  const text = readFileSync(kgPath, 'utf-8');
  // Each invariant lives in the LAST cell of its table row (variable column count).
  // We match the row label, then capture the bolded value in the rightmost cell.
  const rawMatch = text.match(
    /\*\*Locked raw-rate invariant\*\*[^\n]*?\*\*([0-9.]+)%\*\*[^\n]*\|/
  );
  const confMatch = text.match(
    /\*\*Locked mean-confidence invariant\*\*[^\n]*?\*\*([0-9.]+)\*\*[^\n]*\|/
  );
  const windowSizeMatch = text.match(
    /\*\*Locked windowed-rate window size\*\*[^\n]*?\*\*([0-9]+)\*\*[^\n]*\|/
  );
  const windowRateMatch = text.match(
    /\*\*Locked windowed-rate floor\*\*[^\n]*?\*\*([0-9.]+)%\*\*[^\n]*\|/
  );
  return {
    minRawRate: rawMatch ? parseFloat(rawMatch[1]) / 100 : DEFAULT_MIN_RAW_RATE,
    minMeanConfidence: confMatch
      ? parseFloat(confMatch[1])
      : DEFAULT_MIN_MEAN_CONFIDENCE,
    windowSize: windowSizeMatch ? parseInt(windowSizeMatch[1], 10) : DEFAULT_WINDOW_SIZE,
    windowMinRate: windowRateMatch
      ? parseFloat(windowRateMatch[1]) / 100
      : DEFAULT_WINDOW_MIN_RATE,
    source: rawMatch && confMatch ? 'knowledge-graph.md §17' : 'partial-default',
  };
}

// Strong = "See", confidence 1.0. Approximate = "Related:", confidence 0.6.
function classifyCitation(kind) {
  return kind === 'See' ? 1.0 : 0.6;
}

function scanFeedbackEntries() {
  const stats = {
    perFile: {},
    totalEntries: 0,
    totalTagged: 0,
    citationCount: 0,
    confidenceSum: 0,
    // Order-preserving entry list per file for windowed analysis.
    perFileEntries: {},
  };
  const files = discoverFeedbackLogs();
  for (const fp of files) {
    const abs = resolve(ROOT, fp);
    if (!existsSync(abs)) continue;
    const text = readFileSync(abs, 'utf-8');
    const lines = text.split('\n');
    let entries = 0;
    let tagged = 0;
    let citations = 0;
    let confSum = 0;
    const entryList = [];
    let i = 0;
    while (i < lines.length) {
      const am = ANCHOR_LINE_RE.exec(lines[i]);
      if (am && i + 1 < lines.length && HEADING_LINE_RE.test(lines[i + 1])) {
        // Find body extent: next anchor or next ## heading
        let end = lines.length;
        for (let j = i + 2; j < lines.length; j++) {
          if (/^<a id="/.test(lines[j]) || /^## /.test(lines[j])) {
            end = j;
            break;
          }
        }
        const body = lines.slice(i + 1, end).join('\n');
        entries += 1;
        let entryHasCitation = false;
        let entryCitations = 0;
        let m;
        const re = new RegExp(CANON_CITATION_GLOBAL.source, CANON_CITATION_GLOBAL.flags);
        while ((m = re.exec(body)) !== null) {
          entryHasCitation = true;
          entryCitations += 1;
          citations += 1;
          confSum += classifyCitation(m[1]);
        }
        if (entryHasCitation) tagged += 1;
        entryList.push({ anchor: am[1], tagged: entryHasCitation, citations: entryCitations });
        i = end;
        continue;
      }
      i += 1;
    }
    stats.perFile[fp] = { entries, tagged, citations, confSum };
    stats.perFileEntries[fp] = entryList;
    stats.totalEntries += entries;
    stats.totalTagged += tagged;
    stats.citationCount += citations;
    stats.confidenceSum += confSum;
  }
  return stats;
}

function checkFeedbackTaggingRate() {
  const stats = scanFeedbackEntries();
  const inv = loadTaggingInvariants();
  if (stats.totalEntries === 0) {
    report(
      'WARN',
      'feedback-tagging-rate',
      null,
      'No anchored feedback entries found across known logs. Run `npm run build-graph` first or verify anchor format.'
    );
    return;
  }
  const rawRate = stats.totalTagged / stats.totalEntries;
  const sev = rawRate < inv.minRawRate ? 'WARN' : 'INFO';
  const perFileSummary = Object.entries(stats.perFile)
    .map(([fp, s]) => `${rel(resolve(ROOT, fp))}: ${s.tagged}/${s.entries}`)
    .join('; ');
  report(
    sev,
    'feedback-tagging-rate',
    null,
    `Raw feedback tagging rate: ${stats.totalTagged}/${stats.totalEntries} (${(rawRate * 100).toFixed(1)}%); target ≥ ${(inv.minRawRate * 100).toFixed(0)}% [source: ${inv.source}]. Per file: ${perFileSummary}.`
  );
}

function checkWeightedTaggingRate() {
  const stats = scanFeedbackEntries();
  const inv = loadTaggingInvariants();
  if (stats.citationCount === 0) {
    report(
      'WARN',
      'weighted-tagging-rate',
      null,
      'No canonical citations found in feedback logs. Verify Plan B Phase 4 has been applied.'
    );
    return;
  }
  const meanConf = stats.confidenceSum / stats.citationCount;
  const sev = meanConf < inv.minMeanConfidence ? 'WARN' : 'INFO';
  report(
    sev,
    'weighted-tagging-rate',
    null,
    `Mean citation confidence: ${meanConf.toFixed(3)} across ${stats.citationCount} citations (strong=1.0, approx=0.6); target ≥ ${inv.minMeanConfidence} [source: ${inv.source}].`
  );
}

// Forward-protection: a baseline of duplicate ENG-NNN / FB-NNN / CFB-NNN
// headings exists in the active and archive logs, intentionally preserved per
// docs/eng-renumber-log.md and docs/design-renumber-log.md (renaming would
// require rewriting 80+ context-dependent cross-references). This check
// ensures that NEW duplicates are flagged immediately so the baseline cannot
// silently grow. The baseline counts are encoded here; when they are reduced
// (e.g., by a future cleanup pass), update the constants.
// See ENG-230 (P4 forward-protection) and the renumber logs.
const DUPLICATE_HEADING_BASELINE = {
  'docs/engineering-feedback-log.md': 20,
  'docs/engineering-feedback-log-archive.md': 20,
  'docs/design-feedback-log.md': 48,
  'docs/design-feedback-log-archive.md': 9,
  'docs/content-feedback-log.md': 0,
};

function checkDuplicateFeedbackHeadings() {
  const files = discoverFeedbackLogs();
  const lines = [];
  let anyExceeds = false;
  for (const fp of files) {
    const abs = resolve(ROOT, fp);
    if (!existsSync(abs)) continue;
    const text = readFileSync(abs, 'utf-8');
    const ids = new Map();
    for (const line of text.split('\n')) {
      const m = HEADING_LINE_RE.exec(line);
      if (m) {
        const id = m[2].toUpperCase();
        ids.set(id, (ids.get(id) ?? 0) + 1);
      }
    }
    let dupCount = 0;
    for (const [, count] of ids) {
      if (count > 1) dupCount += count - 1;
    }
    const baseline = DUPLICATE_HEADING_BASELINE[fp] ?? 0;
    if (dupCount > baseline) {
      anyExceeds = true;
      lines.push(`${rel(abs)}: ${dupCount} duplicate(s) > baseline ${baseline} ✗`);
    } else if (dupCount > 0) {
      lines.push(`${rel(abs)}: ${dupCount} duplicate(s) at baseline ${baseline} ✓`);
    }
  }
  const sev = anyExceeds ? 'WARN' : 'INFO';
  if (lines.length === 0) {
    report('INFO', 'duplicate-feedback-headings', null, 'No duplicate ENG/FB/CFB headings detected.');
    return;
  }
  report(
    sev,
    'duplicate-feedback-headings',
    null,
    `Duplicate-heading baseline check (intentionally preserved per renumber-logs; new duplicates fail this check): ${lines.join('; ')}`
  );
}

// Forward-regression guard: the most recent N entries (chronologically newest)
// in each feedback log must be tagged at ≥ X%. Prevents the corpus from drifting
// down as new untagged entries are appended after a remediation pass.
// See ENG-230 (P8 fix) and knowledge-graph.md §17.
function checkWindowedTaggingRate() {
  const stats = scanFeedbackEntries();
  const inv = loadTaggingInvariants();
  const lines = [];
  let anyFail = false;
  for (const [fp, entryList] of Object.entries(stats.perFileEntries)) {
    if (entryList.length === 0) continue;
    // Active logs list newest-first; archive logs list oldest-first. The
    // first N entries in active logs are the most recent. We treat the
    // first N entries of each file as the "recent window" — same convention
    // as the file's own ordering. Archive files are tested for completeness
    // not recency, so use total file rate instead of windowed rate.
    const isArchive = fp.includes('archive');
    if (isArchive) continue;
    const window = entryList.slice(0, inv.windowSize);
    if (window.length < Math.min(inv.windowSize, 10)) continue;
    const taggedInWindow = window.filter((e) => e.tagged).length;
    const windowRate = taggedInWindow / window.length;
    const passing = windowRate >= inv.windowMinRate;
    if (!passing) anyFail = true;
    lines.push(
      `${rel(resolve(ROOT, fp))}: ${taggedInWindow}/${window.length} most recent (${(windowRate * 100).toFixed(1)}%) ${passing ? '✓' : '✗'}`
    );
  }
  const sev = anyFail ? 'WARN' : 'INFO';
  report(
    sev,
    'windowed-tagging-rate',
    null,
    `Recent-window tagging rate (last ${inv.windowSize} per active log; floor ${(inv.windowMinRate * 100).toFixed(0)}% [source: ${inv.source}]): ${lines.join('; ')}`
  );
}

function checkGraphStaleness() {
  if (!existsSync(GRAPH_CACHE_PATH)) {
    report('WARN', 'graph-staleness', null, `Graph cache not found. Run \`npm run build-graph\`.`);
    return;
  }
  const graphMtime = statSync(GRAPH_CACHE_PATH).mtimeMs;
  const watchedDirs = ['docs', '.cursor/skills', '.cursor/rules'];
  let latest = 0;
  for (const dir of watchedDirs) {
    const abs = resolve(ROOT, dir);
    if (!existsSync(abs)) continue;
    walkAndStat(abs, (st) => {
      if (st.mtimeMs > latest) latest = st.mtimeMs;
    });
  }
  for (const f of ['AGENTS.md', 'CLAUDE.md']) {
    const abs = resolve(ROOT, f);
    if (existsSync(abs)) {
      const st = statSync(abs);
      if (st.mtimeMs > latest) latest = st.mtimeMs;
    }
  }
  if (latest > graphMtime) {
    report(
      'WARN',
      'graph-staleness',
      null,
      `Graph cache is older than at least one watched file. Run \`npm run build-graph\`.`
    );
  }
}

function walkAndStat(dir, fn) {
  for (const entry of readdirSyncSafe(dir)) {
    if (entry.startsWith('.') && entry !== '.cursor') continue;
    const full = join(dir, entry);
    const st = (() => { try { return statSync(full); } catch { return null; } })();
    if (!st) continue;
    if (st.isDirectory()) walkAndStat(full, fn);
    else fn(st);
  }
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

function parseAuditArgs(argv) {
  const args = { quick: false };
  for (const a of argv) {
    if (a === '--quick') args.quick = true;
  }
  return args;
}

async function main() {
  const args = parseAuditArgs(process.argv.slice(2));
  const files = collectFiles();

  if (files.length === 0) {
    console.log('No doc files found. Check DOC_GLOBS configuration.');
    process.exit(1);
  }

  console.log(`Scanning ${files.length} doc file(s)${args.quick ? ' (--quick mode)' : ''}...`);

  if (!args.quick) {
    await checkServerHealth();
  }
  checkFileSize(files);
  checkHeadingHierarchy(files);
  checkSectionIndex(files);
  checkCrossReferences(files);
  checkOrphans(files);
  checkDuplicates(files);
  checkStaleMarkers(files);
  checkAnalyticsEventRegistryParity();

  checkBrokenAnchors();
  checkOrphanAntiPatterns();
  checkTopicVocabulary();
  checkFrontmatterSchema();
  checkAnchorIdUniqueness();
  if (!args.quick) checkFeedbackTaggingRate();
  if (!args.quick) checkWeightedTaggingRate();
  if (!args.quick) checkWindowedTaggingRate();
  if (!args.quick) checkDuplicateFeedbackHeadings();
  if (!args.quick) checkGraphStaleness();

  printReport();
}

main();
