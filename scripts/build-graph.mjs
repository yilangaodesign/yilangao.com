#!/usr/bin/env node

import { readFileSync, existsSync, statSync, mkdirSync, writeFileSync, renameSync, readdirSync } from 'fs';
import { resolve, relative, dirname, join, basename } from 'path';
import yaml from 'js-yaml';
import lunr from 'lunr';

const ROOT = resolve(import.meta.dirname, '..');
const CACHE_DIR = resolve(ROOT, '.cache');
const GRAPH_PATH = join(CACHE_DIR, 'graph.json');
const SEARCH_PATH = join(CACHE_DIR, 'search-index.json');

const WATCHED_GLOBS = [
  'AGENTS.md',
  'CLAUDE.md',
  'docs/**/*.md',
  '.cursor/skills/**/SKILL.md',
  '.cursor/skills/**/METADATA.yml',
  '.cursor/rules/*.md',
  '.cursor/rules/*-METADATA.yml',
];

const EDGE_FORWARD_TYPES = ['enforces', 'documents', 'supersedes', 'derivedFrom', 'triggers', 'references'];

const INVERSE_MAP = {
  enforces: 'enforcedBy',
  documents: 'documentedBy',
  supersedes: 'supersededBy',
  derivedFrom: 'derives',
  triggers: 'triggeredBy',
  references: 'referencedBy',
};

// Strong citations: explicit reference keywords. Confidence 1.0 / 0.6.
const STRONG_CITATION_RE = /(?:^|[\s(])(See|Related:|cf\.|Also:|see)\s+(AP|EAP|CAP|FB|CFB|ENG|REL)-(\d{1,4})(?:\s*\(([0-9]*\.?[0-9]+)\))?/gm;

// Bare ID mentions: any AP/EAP/CAP/FB/CFB/ENG/REL token in prose. Confidence 0.5.
// We rely on segmentation to attribute these to the nearest preceding anchor.
const BARE_ID_RE = /\b(AP|EAP|CAP|FB|CFB|ENG|REL)-(\d{1,4})\b/g;

const STRONG_KEYWORD_CONFIDENCE = {
  See: 1.0,
  see: 1.0,
  'Related:': 0.6,
  'cf.': 0.6,
  'Also:': 0.6,
};

const ANCHOR_RE = /<a\s+id="([a-z0-9][a-z0-9-]*)"\s*><\/a>/g;
const HEADING_RE = /^(#{1,6})\s+(.+)$/gm;
const MD_LINK_RE = /\[([^\]]+)\]\(([^)]+)\)/g;

const ENTRY_HEADING_RE = /^(#{3,4})\s+((?:FB|ENG|CFB)-\d{1,4})(?::|\s|$)/gm;

const TOPIC_VOCAB_DOC = 'docs/knowledge-graph.md';

const warnings = [];
function warn(msg) {
  warnings.push(msg);
  console.error(`[build-graph] WARN: ${msg}`);
}

function collectFiles() {
  const files = new Set();
  for (const pattern of WATCHED_GLOBS) {
    if (pattern.includes('**')) {
      const [head, tail] = pattern.split('**');
      walkDirRecursive(resolve(ROOT, head.replace(/\/$/, '')), tail.replace(/^\//, ''), files);
    } else if (pattern.includes('*')) {
      const dir = resolve(ROOT, dirname(pattern));
      const filePat = basename(pattern);
      simpleGlobInDir(dir, filePat, files);
    } else {
      const abs = resolve(ROOT, pattern);
      if (existsSync(abs)) files.add(abs);
    }
  }
  return [...files];
}

function walkDirRecursive(dir, filePat, out) {
  if (!existsSync(dir) || !statSync(dir).isDirectory()) return;
  for (const entry of readdirSafe(dir)) {
    const full = join(dir, entry);
    const st = safeStat(full);
    if (!st) continue;
    if (st.isDirectory()) {
      if (entry.startsWith('.') && entry !== '.cursor') continue;
      if (['node_modules', '.next', '.cache', 'archive'].includes(entry)) continue;
      walkDirRecursive(full, filePat, out);
    } else if (st.isFile() && matchesGlob(entry, filePat)) {
      out.add(full);
    }
  }
}

function simpleGlobInDir(dir, filePat, out) {
  if (!existsSync(dir) || !statSync(dir).isDirectory()) return;
  for (const entry of readdirSafe(dir)) {
    const full = join(dir, entry);
    const st = safeStat(full);
    if (st && st.isFile() && matchesGlob(entry, filePat)) {
      out.add(full);
    }
  }
}

function readdirSafe(dir) {
  try { return readdirSync(dir); } catch { return []; }
}
function safeStat(p) {
  try { return statSync(p); } catch { return null; }
}

function matchesGlob(name, pattern) {
  const re = new RegExp('^' + pattern.replace(/\./g, '\\.').replace(/\*/g, '.*') + '$');
  return re.test(name);
}

function parseFile(absPath) {
  const text = readFileSync(absPath, 'utf8');
  const { frontmatter, body } = extractFrontmatter(text, absPath);
  return {
    absPath,
    relPath: relative(ROOT, absPath),
    text,
    frontmatter,
    body,
  };
}

function extractFrontmatter(text, absPath) {
  let cursor = 0;
  // Skip a single leading HTML comment block (used to label the frontmatter for human readers).
  if (text.startsWith('<!--')) {
    const commentEnd = text.indexOf('-->');
    if (commentEnd !== -1) {
      cursor = commentEnd + 3;
      while (cursor < text.length && (text[cursor] === '\n' || text[cursor] === '\r')) cursor++;
    }
  }
  const remaining = text.slice(cursor);
  if (!remaining.startsWith('---\n') && !remaining.startsWith('---\r\n')) {
    return { frontmatter: null, body: text };
  }
  const endIdx = remaining.indexOf('\n---', 4);
  if (endIdx === -1) {
    return { frontmatter: null, body: text };
  }
  const yamlText = remaining.slice(4, endIdx);
  let fm = null;
  try {
    fm = yaml.load(yamlText) || {};
  } catch (err) {
    warn(`frontmatter YAML parse error in ${relative(ROOT, absPath)}: ${err.message}`);
    return { frontmatter: null, body: remaining.slice(endIdx + 4) };
  }
  const bodyStart = endIdx + 4 + (remaining[endIdx + 4] === '\n' ? 1 : 0);
  return { frontmatter: fm, body: remaining.slice(bodyStart) };
}

function extractAnchors(body) {
  const anchors = [];
  let m;
  ANCHOR_RE.lastIndex = 0;
  while ((m = ANCHOR_RE.exec(body)) !== null) {
    const id = m[1];
    const offset = m.index;
    const matchEnd = m.index + m[0].length;
    const before = body.slice(0, offset);
    const lineStart = before.lastIndexOf('\n') + 1;
    const lineEnd = body.indexOf('\n', offset);
    const lineText = body.slice(lineStart, lineEnd === -1 ? body.length : lineEnd);
    const nextLineStart = lineEnd === -1 ? -1 : lineEnd + 1;
    let nextHeading = null;
    if (nextLineStart !== -1) {
      const nextLineEnd = body.indexOf('\n', nextLineStart);
      const next = body.slice(nextLineStart, nextLineEnd === -1 ? body.length : nextLineEnd);
      const hMatch = /^(#{1,6})\s+(.+)$/.exec(next);
      if (hMatch) nextHeading = { level: hMatch[1].length, text: hMatch[2].trim() };
    }
    const restOfLine = body.slice(matchEnd, lineEnd === -1 ? body.length : lineEnd);
    let inlineText = restOfLine.replace(/\*\*/g, '').replace(/`/g, '').trim();
    if (inlineText.length > 100) inlineText = inlineText.slice(0, 100).replace(/\s+\S*$/, '') + '...';
    anchors.push({ id, offset, lineText, nextHeading, inlineText });
  }
  return anchors;
}

function extractEntryHeadings(body) {
  const out = [];
  let m;
  ENTRY_HEADING_RE.lastIndex = 0;
  while ((m = ENTRY_HEADING_RE.exec(body)) !== null) {
    out.push({ level: m[1].length, id: m[2], offset: m.index });
  }
  return out;
}

// Extract every citation in the (already code-stripped) body. Returns one
// entry per ID mention with a confidence reflecting the surrounding cue.
// Strong matches override bare matches at the same offset.
function extractCitations(body) {
  const stripped = stripCodeRegions(body);
  const byOffset = new Map();

  let m;
  STRONG_CITATION_RE.lastIndex = 0;
  while ((m = STRONG_CITATION_RE.exec(stripped)) !== null) {
    const keyword = m[1];
    const idType = m[2];
    const idNum = m[3];
    const overrideStr = m[4];
    const targetId = canonicalIdToken(idType, idNum);
    let confidence = STRONG_KEYWORD_CONFIDENCE[keyword] ?? 0.6;
    if (overrideStr !== undefined) {
      const v = parseFloat(overrideStr);
      if (!isNaN(v) && v >= 0 && v <= 1) confidence = v;
    }
    // Use the offset of the ID token itself (after the keyword) so bare
    // matches at the same position get overridden cleanly.
    const idOffset = stripped.indexOf(`${idType}-${idNum}`, m.index);
    const offset = idOffset === -1 ? m.index : idOffset;
    byOffset.set(offset, { targetId, keyword, confidence, offset, strong: true });
  }

  BARE_ID_RE.lastIndex = 0;
  while ((m = BARE_ID_RE.exec(stripped)) !== null) {
    const idType = m[1];
    const idNum = m[2];
    const targetId = canonicalIdToken(idType, idNum);
    const offset = m.index;
    if (byOffset.has(offset)) continue; // strong already won
    byOffset.set(offset, { targetId, keyword: 'bare', confidence: 0.5, offset, strong: false });
  }

  return [...byOffset.values()].sort((a, b) => a.offset - b.offset);
}

// Convert a (TYPE, NUM) pair into the canonical lowercase node id used in
// HTML anchors. AP/EAP/CAP/REL pad to 3 digits; FB/ENG/CFB don't pad here
// because feedback-log anchors are Plan B's job and this avoids drift if
// they end up un-zero-padded.
function canonicalIdToken(idType, idNum) {
  const t = idType.toLowerCase();
  if (t === 'fb' || t === 'cfb' || t === 'eng') {
    return `${t}-${idNum}`;
  }
  return `${t}-${String(idNum).padStart(3, '0')}`;
}

function stripCodeRegions(body) {
  // Replace fenced and inline code with whitespace so example markdown
  // inside docs/knowledge-graph.md and similar files doesn't generate
  // phantom graph edges.
  let out = body.replace(/```[\s\S]*?```/g, (m) => ' '.repeat(m.length));
  out = out.replace(/`[^`\n]*`/g, (m) => ' '.repeat(m.length));
  return out;
}

function extractMarkdownLinks(body) {
  const out = [];
  const stripped = stripCodeRegions(body);
  let m;
  MD_LINK_RE.lastIndex = 0;
  while ((m = MD_LINK_RE.exec(stripped)) !== null) {
    const text = m[1];
    const target = m[2];
    if (target.startsWith('http://') || target.startsWith('https://')) continue;
    if (target.startsWith('mailto:')) continue;
    let path = target;
    let anchor = null;
    const hashIdx = target.indexOf('#');
    if (hashIdx !== -1) {
      path = target.slice(0, hashIdx);
      anchor = target.slice(hashIdx + 1);
    }
    out.push({ text, path, anchor, offset: m.index });
  }
  return out;
}

function extractMetadataSibling(absPath, parsed) {
  const dir = dirname(absPath);
  const base = basename(absPath);
  let siblingPath = null;
  if (base === 'SKILL.md') {
    const candidate = join(dir, 'METADATA.yml');
    if (existsSync(candidate)) siblingPath = candidate;
  } else if (absPath.includes('.cursor/rules/') && base.endsWith('.md')) {
    const candidate = join(dir, base.replace(/\.md$/, '-METADATA.yml'));
    if (existsSync(candidate)) siblingPath = candidate;
  }
  if (siblingPath === absPath) return null;
  if (!siblingPath) return null;
  try {
    const text = readFileSync(siblingPath, 'utf8');
    const fm = yaml.load(text) || {};
    return { siblingPath, frontmatter: fm };
  } catch (err) {
    warn(`sibling YAML parse error in ${relative(ROOT, siblingPath)}: ${err.message}`);
    return null;
  }
}

function deriveFileNode(parsed, sibling) {
  const fm = parsed.frontmatter || {};
  const sibFm = sibling?.frontmatter || {};
  const merged = { ...fm, ...sibFm };
  if (!merged.id) {
    return null;
  }
  const node = {
    id: merged.id,
    type: merged.type || 'unknown',
    title: deriveTitleFromFile(parsed),
    path: parsed.relPath,
    anchor: merged.id,
    topics: Array.isArray(merged.topics) ? merged.topics : [],
    deprecated: merged.deprecated === true,
  };
  return node;
}

function deriveTitleFromFile(parsed) {
  const m = /^#\s+(.+)$/m.exec(parsed.body);
  if (m) return m[1].trim();
  return basename(parsed.relPath, '.md');
}

function deriveAnchorNode(anchor, parentRelPath) {
  let title = anchor.id;
  if (anchor.nextHeading && anchor.nextHeading.text) title = anchor.nextHeading.text;
  else if (anchor.inlineText) title = anchor.inlineText;
  return {
    id: anchor.id,
    type: classifyAnchorType(anchor.id),
    title,
    path: parentRelPath,
    anchor: anchor.id,
    topics: [],
    deprecated: false,
  };
}

function classifyAnchorType(id) {
  if (/^route-/.test(id)) return 'route';
  if (/^guardrail-/.test(id)) return 'guardrail';
  if (/^(ap|eap|cap)-\d+$/.test(id)) return 'anti-pattern';
  if (/^(fb|cfb|eng)-\d+$/.test(id)) return 'feedback';
  if (/^rel-\d+$/.test(id)) return 'release';
  if (/^skill-/.test(id)) return 'skill';
  if (/^rule-/.test(id)) return 'rule';
  if (/^hub-/.test(id)) return 'hub';
  if (/^spoke-/.test(id)) return 'spoke';
  return 'section';
}

function extractEdgesFromFrontmatter(merged, fromId, fromType) {
  const edges = [];
  for (const declaredType of EDGE_FORWARD_TYPES) {
    if (!(declaredType in merged)) continue;
    const value = merged[declaredType];
    if (!Array.isArray(value)) {
      warn(`frontmatter edge "${declaredType}" in node "${fromId}" is not an array`);
      continue;
    }
    for (const entry of value) {
      let targetId;
      let confidence = 1.0;
      if (typeof entry === 'string') {
        targetId = entry;
      } else if (Array.isArray(entry) && entry.length === 2) {
        targetId = entry[0];
        const c = parseFloat(entry[1]);
        if (!isNaN(c) && c >= 0 && c <= 1) confidence = c;
      } else {
        warn(`unrecognized edge entry shape in "${fromId}.${declaredType}": ${JSON.stringify(entry)}`);
        continue;
      }
      const normalizedTarget = normalizeTargetId(targetId);
      // Coerce a generic `references:` to `enforces:` when the source is a
      // skill/rule/guardrail and the target is an anti-pattern. Authors
      // routinely write `references` because that's the safe default; the
      // semantic relationship is enforcement.
      const edgeType = (declaredType === 'references' && isEnforcerType(fromType) && isAntiPatternId(normalizedTarget))
        ? 'enforces'
        : declaredType;
      edges.push({
        from: fromId,
        to: normalizedTarget,
        type: edgeType,
        confidence,
        source: edgeType === declaredType ? 'frontmatter' : 'frontmatter:coerced',
      });
    }
  }
  for (const key of Object.keys(merged)) {
    if (
      ['type', 'id', 'topics', 'deprecated', 'name', 'description', 'globs'].includes(key) ||
      EDGE_FORWARD_TYPES.includes(key)
    ) {
      continue;
    }
    if (typeof merged[key] === 'object' && merged[key] !== null) {
      warn(`unknown edge name "${key}" in node "${fromId}" (allowed: ${EDGE_FORWARD_TYPES.join(', ')})`);
    }
  }
  return edges;
}

function normalizeTargetId(target) {
  if (typeof target !== 'string') return String(target);
  if (target.includes('#')) {
    const hashIdx = target.indexOf('#');
    return target.slice(hashIdx + 1);
  }
  if (/[\\/.]/.test(target)) {
    const noExt = basename(target).replace(/\.md$/, '');
    return noExt;
  }
  return target;
}

// Resolve a markdown link target to a real node ID using the path map
// built during pass 1. Returns null when the link points outside the
// watched docs scope (e.g., src/, playground/) so we don't pollute the
// graph with phantom nodes. Anchor-only links resolve to the anchor ID.
function resolveLinkTargetId(link, sourceRelPath, pathToNodeId) {
  if (link.anchor && (!link.path || link.path === '')) {
    return link.anchor;
  }
  if (!link.path) return null;
  if (link.path.startsWith('http://') || link.path.startsWith('https://')) return null;
  if (link.path.startsWith('mailto:')) return null;

  const sourceDir = dirname(sourceRelPath);
  const joined = link.path.startsWith('/')
    ? link.path.slice(1)
    : pathJoinNormalize(sourceDir, link.path);
  const candidate = joined.replace(/\\/g, '/');

  if (pathToNodeId.has(candidate)) {
    return pathToNodeId.get(candidate);
  }
  if (!candidate.endsWith('.md') && pathToNodeId.has(candidate + '.md')) {
    return pathToNodeId.get(candidate + '.md');
  }
  // Path didn't resolve. If there's an anchor, prefer that (in-file ref);
  // otherwise drop the edge — link points outside the watched docs scope.
  if (link.anchor) return link.anchor;
  return null;
}

function pathJoinNormalize(dir, rel) {
  const parts = (dir + '/' + rel).split('/');
  const out = [];
  for (const p of parts) {
    if (p === '' || p === '.') continue;
    if (p === '..') {
      out.pop();
      continue;
    }
    out.push(p);
  }
  return out.join('/');
}

function deriveInverses(edges) {
  const inverses = [];
  for (const edge of edges) {
    const inverseType = INVERSE_MAP[edge.type];
    if (!inverseType) continue;
    inverses.push({
      from: edge.to,
      to: edge.from,
      type: inverseType,
      confidence: edge.confidence,
      source: edge.source + ':inverse',
    });
  }
  return inverses;
}

function buildSearchIndex(nodes) {
  const docs = nodes.map((n) => ({
    id: n.id,
    title: n.title || n.id,
    type: n.type,
    topics: (n.topics || []).join(' '),
    path: n.path,
  }));
  const idx = lunr(function () {
    this.ref('id');
    this.field('title', { boost: 5 });
    this.field('type');
    this.field('topics', { boost: 3 });
    this.field('path');
    docs.forEach((d) => this.add(d));
  });
  return { index: idx.toJSON(), docs };
}

function atomicWriteJson(path, data) {
  if (!existsSync(dirname(path))) mkdirSync(dirname(path), { recursive: true });
  const tmp = path + '.tmp';
  writeFileSync(tmp, JSON.stringify(data, null, 2));
  renameSync(tmp, path);
}

function buildGraph() {
  const files = collectFiles();
  const nodes = [];
  const edges = [];
  const nodeIds = new Set();

  let feedbackEntriesTotal = 0;
  let feedbackEntriesAnchored = 0;

  // Pass 1: parse every file and build a path -> nodeId map so that
  // markdown-link edges in pass 2 can resolve to real frontmatter IDs
  // (e.g., `content/voice-style.md` -> `content-voice-style`) instead of
  // falling back to a basename heuristic that produces phantom nodes.
  const pathToNodeId = new Map();
  const parsedByPath = new Map();
  for (const absPath of files) {
    if (basename(absPath).endsWith('METADATA.yml')) continue;
    const parsed = parseFile(absPath);
    const sibling = extractMetadataSibling(absPath, parsed);
    const merged = { ...(parsed.frontmatter || {}), ...(sibling?.frontmatter || {}) };
    parsedByPath.set(absPath, { parsed, sibling, merged });
    const fileNode = deriveFileNode(parsed, sibling);
    if (fileNode) {
      pathToNodeId.set(parsed.relPath, fileNode.id);
    }
  }

  for (const absPath of files) {
    if (basename(absPath).endsWith('METADATA.yml')) continue;

    const ctx = parsedByPath.get(absPath);
    if (!ctx) continue;
    const { parsed, sibling, merged } = ctx;

    const fileNode = deriveFileNode(parsed, sibling);
    if (fileNode && !nodeIds.has(fileNode.id)) {
      nodes.push(fileNode);
      nodeIds.add(fileNode.id);
    }

    const fromId = fileNode?.id;
    if (fromId) {
      const fmEdges = extractEdgesFromFrontmatter(merged, fromId, fileNode?.type);
      edges.push(...fmEdges);
    }

    const anchors = extractAnchors(parsed.body);
    const anchorNodesById = new Map();
    for (const a of anchors) {
      if (a.id === fromId) continue;
      const anchorNode = deriveAnchorNode(a, parsed.relPath);
      if (!nodeIds.has(anchorNode.id)) {
        nodes.push(anchorNode);
        nodeIds.add(anchorNode.id);
      }
      anchorNodesById.set(anchorNode.id, anchorNode);
      if (fromId) {
        edges.push({
          from: fromId,
          to: anchorNode.id,
          type: 'documents',
          confidence: 1.0,
          source: 'anchor:contained',
        });
      }
    }

    const entries = extractEntryHeadings(parsed.body);
    feedbackEntriesTotal += entries.length;
    const anchoredIds = new Set(anchors.map((a) => a.id));
    for (const e of entries) {
      const expectedId = e.id.toLowerCase();
      if (anchoredIds.has(expectedId)) feedbackEntriesAnchored++;
    }

    // Build segmentation: every offset in the body is owned by the nearest
    // preceding anchor, or by the file itself if no anchor precedes it. This
    // makes edges anchor-scoped instead of file-scoped, which is the whole
    // point of having anchors at all.
    const segmenter = buildSegmenter(anchors, entries, fromId);

    const links = extractMarkdownLinks(parsed.body);
    for (const link of links) {
      const targetId = resolveLinkTargetId(link, parsed.relPath, pathToNodeId);
      if (!targetId) continue;
      const ownerId = segmenter.ownerAt(link.offset);
      if (!ownerId || targetId === ownerId) continue;
      const ownerNode = anchorNodesById.get(ownerId) || fileNode;
      const edgeType = inferEdgeType(ownerNode, targetId, 'markdown-link');
      edges.push({
        from: ownerId,
        to: targetId,
        type: edgeType,
        confidence: 0.6,
        source: 'markdown-link',
      });
    }

    const citations = extractCitations(parsed.body);
    for (const c of citations) {
      const ownerId = segmenter.ownerAt(c.offset);
      if (!ownerId || c.targetId === ownerId) continue;
      const ownerNode = anchorNodesById.get(ownerId) || fileNode;
      const edgeType = inferEdgeType(ownerNode, c.targetId, `citation:${c.keyword}`);
      edges.push({
        from: ownerId,
        to: c.targetId,
        type: edgeType,
        confidence: c.confidence,
        source: `citation:${c.keyword}`,
      });
    }
  }

  const inverses = deriveInverses(edges);
  const allEdges = [...edges, ...inverses];

  const dedupedEdges = dedupeEdges(allEdges);

  return {
    nodes,
    edges: dedupedEdges,
    feedbackStats: {
      total: feedbackEntriesTotal,
      anchored: feedbackEntriesAnchored,
    },
  };
}

function findClosestPrecedingEntry(entries, offset) {
  let last = null;
  for (const e of entries) {
    if (e.offset > offset) break;
    last = e;
  }
  return last;
}

// buildSegmenter produces a function `ownerAt(offset)` that returns the id
// of the nearest preceding anchor or feedback-entry heading. This is the
// invariant that makes anchor-scoped edges work: when guardrail-engineering-13
// cites EAP-013, we want the edge to start at guardrail-engineering-13, not
// at the file-level AGENTS node.
function buildSegmenter(anchors, entries, fileFallbackId) {
  // Merge anchors and entry-headings (FB/ENG/CFB) into a sorted list of
  // (offset, id) pairs. Entries are normalized to lowercase to match anchor
  // ids that Plan B will produce.
  const segments = [];
  for (const a of anchors) {
    segments.push({ offset: a.offset, id: a.id });
  }
  for (const e of entries) {
    segments.push({ offset: e.offset, id: e.id.toLowerCase() });
  }
  segments.sort((a, b) => a.offset - b.offset);
  return {
    ownerAt(offset) {
      let owner = fileFallbackId || null;
      for (const seg of segments) {
        if (seg.offset > offset) break;
        owner = seg.id;
      }
      return owner;
    },
  };
}

// Only nodes that actively prescribe behavior count as enforcers. Routes
// navigate to skills; the skill is the enforcer, not the route.
const ENFORCER_TYPES = new Set(['guardrail', 'skill', 'rule']);

function isEnforcerType(t) {
  return ENFORCER_TYPES.has(t);
}

function isAntiPatternId(id) {
  return /^(ap|eap|cap)-\d+$/i.test(id);
}

// Choose the right edge type given the source node's type and the target id.
// - Enforcer node + anti-pattern target -> `enforces` (regardless of how it
//   was written in prose). Confidence is preserved by the caller.
// - Anything else -> `references` (the safe default).
function inferEdgeType(fromNode, targetId, sourceTag) {
  const fromType = fromNode?.type;
  if (isEnforcerType(fromType) && isAntiPatternId(targetId)) {
    return 'enforces';
  }
  return 'references';
}

function dedupeEdges(edges) {
  const seen = new Map();
  for (const e of edges) {
    const key = `${e.from}|${e.to}|${e.type}`;
    const prior = seen.get(key);
    if (!prior) {
      seen.set(key, e);
      continue;
    }
    if (e.confidence > prior.confidence) {
      seen.set(key, e);
    }
  }
  return [...seen.values()];
}

function readTopicVocab() {
  const path = resolve(ROOT, TOPIC_VOCAB_DOC);
  if (!existsSync(path)) return null;
  const text = readFileSync(path, 'utf8');
  const m = /## 9\. Topic vocabulary[\s\S]*?```\n([\s\S]*?)\n```/m.exec(text);
  if (!m) return null;
  return m[1]
    .split('\n')
    .map((s) => s.trim())
    .filter((s) => s.length > 0 && !s.startsWith('#'));
}

function emit(graph) {
  const generatedAt = new Date().toISOString();
  const out = {
    version: 1,
    generatedAt,
    nodes: graph.nodes,
    edges: graph.edges,
    feedbackStats: graph.feedbackStats,
    warnings,
  };
  atomicWriteJson(GRAPH_PATH, out);

  const search = buildSearchIndex(graph.nodes);
  atomicWriteJson(SEARCH_PATH, {
    version: 1,
    generatedAt,
    index: search.index,
    docs: search.docs,
  });

  return out;
}

function main() {
  const start = Date.now();
  const graph = buildGraph();
  const out = emit(graph);
  const elapsed = Date.now() - start;
  const fbCoverage = graph.feedbackStats.total === 0
    ? 'n/a'
    : `${graph.feedbackStats.anchored}/${graph.feedbackStats.total} (${((graph.feedbackStats.anchored / graph.feedbackStats.total) * 100).toFixed(1)}%)`;
  console.log(`[build-graph] nodes: ${graph.nodes.length}, edges: ${graph.edges.length}, feedback anchored: ${fbCoverage}, warnings: ${warnings.length}, elapsed: ${elapsed}ms`);
  console.log(`[build-graph] -> ${relative(ROOT, GRAPH_PATH)}`);
  console.log(`[build-graph] -> ${relative(ROOT, SEARCH_PATH)}`);
  if (warnings.length > 0 && process.env.STRICT === '1') process.exit(1);
}

main();
