#!/usr/bin/env node

/**
 * Read-only hygiene audit for the knowledge graph.
 * Reports structural-integrity issues without modifying any files.
 * Always exits 0 (advisory, never gating). Idempotent.
 *
 * Part of Plan D: Graph Hygiene Remediation.
 */

import { readFileSync, existsSync, readdirSync, statSync } from 'fs';
import { resolve, join, relative } from 'path';

const ROOT = resolve(import.meta.dirname, '..');
const GRAPH_CACHE = resolve(ROOT, '.cache/graph.json');
const KG_SPEC = resolve(ROOT, 'docs/knowledge-graph.md');

function loadGraph() {
  if (!existsSync(GRAPH_CACHE)) {
    console.error('ERROR: .cache/graph.json not found. Run `npm run build-graph` first.');
    process.exit(1);
  }
  return JSON.parse(readFileSync(GRAPH_CACHE, 'utf-8'));
}

function loadKgSpec() {
  if (!existsSync(KG_SPEC)) return null;
  return readFileSync(KG_SPEC, 'utf-8');
}

// ---------------------------------------------------------------------------
// §3 ID-naming table parser (runtime, not hardcoded)
// ---------------------------------------------------------------------------

function parseIdNamingTable(specText) {
  if (!specText) return null;
  const sectionStart = specText.indexOf('## 3. ID naming');
  if (sectionStart === -1) return null;
  const sectionEnd = specText.indexOf('\n## ', sectionStart + 1);
  const section = specText.slice(sectionStart, sectionEnd === -1 ? undefined : sectionEnd);

  const rows = [];
  const tableLineRe = /^\|[^|]+\|[^|]+\|[^|]+\|$/gm;
  let match;
  while ((match = tableLineRe.exec(section)) !== null) {
    const cells = match[0].split('|').map(c => c.trim()).filter(Boolean);
    if (cells.length >= 2 && !cells[0].startsWith('---') && !cells[0].startsWith('Heading')) {
      rows.push({ heading: cells[0], pattern: cells[1], example: cells[2] || '' });
    }
  }
  return rows.length > 0 ? rows : null;
}

function inferPatternFromExample(example) {
  if (!example) return null;
  const stripped = example.replace(/`/g, '');
  if (/^eap-\d+$/.test(stripped)) return /^eap-\d+$/;
  if (/^ap-\d+$/.test(stripped)) return /^ap-\d+$/;
  if (/^cap-\d+$/.test(stripped)) return /^cap-\d+$/;
  if (/^rel-\d+$/.test(stripped)) return /^rel-\d+$/;
  if (/^eng-\d+$/.test(stripped)) return /^eng-\d+$/;
  if (/^fb-\d+$/.test(stripped)) return /^fb-\d+$/;
  if (/^cfb-\d+$/.test(stripped)) return /^cfb-\d+$/;
  if (/^route-\d+$/.test(stripped)) return /^route-\d+$/;
  if (/^route-knowledge-[a-z]$/.test(stripped)) return /^route-knowledge-[a-z]$/;
  if (/^guardrail-/.test(stripped)) return /^guardrail-(design|content|engineering)-\d+$/;
  if (/^skill-/.test(stripped)) return /^skill-[a-z0-9-]+$/;
  if (/^rule-/.test(stripped)) return /^rule-[a-z0-9-]+$/;
  if (/^hub-/.test(stripped)) return /^hub-[a-z]+$/;
  if (/^spoke-/.test(stripped)) return /^spoke-[a-z0-9-]+$/;
  if (/^kg-/.test(stripped)) return /^[a-z0-9]+-[a-z0-9-]+$/;
  return null;
}

// ---------------------------------------------------------------------------
// §8 Node-type taxonomy parser
// ---------------------------------------------------------------------------

function parseDeclaredTypes(specText) {
  if (!specText) return new Set();
  const sectionStart = specText.indexOf('## 8. Node-type taxonomy');
  if (sectionStart === -1) return new Set();
  const sectionEnd = specText.indexOf('\n## ', sectionStart + 1);
  const section = specText.slice(sectionStart, sectionEnd === -1 ? undefined : sectionEnd);

  const types = new Set();
  const re = /^\|\s*`([a-z0-9-]+)`\s*\|/gm;
  let m;
  while ((m = re.exec(section)) !== null) {
    types.add(m[1]);
  }
  return types;
}

// ---------------------------------------------------------------------------
// Subcheck 1: Outbound dead-ends
// ---------------------------------------------------------------------------

function checkOutboundDeadEnds(graph) {
  const outbound = new Map();
  for (const edge of graph.edges) {
    outbound.set(edge.from, (outbound.get(edge.from) || 0) + 1);
  }
  const deadEnds = graph.nodes.filter(n => !outbound.has(n.id));
  const byType = new Map();
  for (const n of deadEnds) {
    if (!byType.has(n.type)) byType.set(n.type, []);
    byType.get(n.type).push(n);
  }
  return { total: deadEnds.length, byType };
}

// ---------------------------------------------------------------------------
// Subcheck 2: ID-pattern violations
// ---------------------------------------------------------------------------

function checkIdPatterns(graph, specText) {
  const namingTable = parseIdNamingTable(specText);
  if (!namingTable) {
    return { error: 'unable to parse §3 ID-naming table', violations: [] };
  }

  const typeToPatterns = new Map();
  function addPattern(key, pattern) {
    if (!typeToPatterns.has(key)) typeToPatterns.set(key, []);
    typeToPatterns.get(key).push(pattern);
  }
  for (const row of namingTable) {
    const pattern = inferPatternFromExample(row.example);
    if (pattern) {
      const heading = row.heading.toLowerCase();
      if (heading.includes('eap')) addPattern('anti-pattern:eap', pattern);
      else if (heading.includes('cap')) addPattern('anti-pattern:cap', pattern);
      else if (/\bap-/.test(heading)) addPattern('anti-pattern:ap', pattern);
      else if (heading.includes('rel-') || heading.includes('rel ')) addPattern('release', pattern);
      else if (heading.includes('eng-')) addPattern('feedback:eng', pattern);
      else if (heading.includes('cfb')) addPattern('feedback:cfb', pattern);
      else if (heading.includes('fb-')) addPattern('feedback:fb', pattern);
      else if (heading.includes('route') || heading.includes('knowledge route')) addPattern('route', pattern);
      else if (heading.includes('guardrail')) addPattern('guardrail', pattern);
      else if (heading.includes('skill')) addPattern('skill', pattern);
      else if (heading.includes('rule') && !heading.includes('guardrail')) addPattern('rule', pattern);
      else if (heading.includes('hub')) addPattern('hub', pattern);
      else if (heading.includes('spoke')) addPattern('spoke', pattern);
    }
  }

  const violations = [];
  for (const node of graph.nodes) {
    let patterns = typeToPatterns.get(node.type);
    if (node.type === 'anti-pattern') {
      if (node.id.startsWith('eap-')) patterns = typeToPatterns.get('anti-pattern:eap');
      else if (node.id.startsWith('cap-')) patterns = typeToPatterns.get('anti-pattern:cap');
      else if (node.id.startsWith('ap-')) patterns = typeToPatterns.get('anti-pattern:ap');
      else continue;
    } else if (node.type === 'feedback') {
      if (node.id.startsWith('eng-')) patterns = typeToPatterns.get('feedback:eng');
      else if (node.id.startsWith('cfb-')) patterns = typeToPatterns.get('feedback:cfb');
      else if (node.id.startsWith('fb-')) patterns = typeToPatterns.get('feedback:fb');
      else continue;
    }
    if (!patterns || patterns.length === 0) continue;
    const matchesAny = patterns.some(p => p.test(node.id));
    if (!matchesAny) {
      violations.push({ id: node.id, type: node.type, expected: patterns.map(p => p.toString()).join(' | '), path: node.path });
    }
  }
  return { error: null, violations };
}

// ---------------------------------------------------------------------------
// Subcheck 3: Field-name drift (node_type: vs type:)
// ---------------------------------------------------------------------------

function checkFieldNameDrift() {
  const docsDir = resolve(ROOT, 'docs');
  const drifted = [];

  function walkDir(dir) {
    for (const entry of readdirSync(dir)) {
      const full = join(dir, entry);
      const stat = statSync(full);
      if (stat.isDirectory()) { walkDir(full); continue; }
      if (!entry.endsWith('.md')) continue;
      const content = readFileSync(full, 'utf-8');
      const fmMatch = content.match(/^---\n([\s\S]*?)\n---/);
      if (fmMatch && /^node_type:/m.test(fmMatch[1])) {
        drifted.push(relative(ROOT, full));
      }
    }
  }
  walkDir(docsDir);

  const agentsMd = resolve(ROOT, 'AGENTS.md');
  if (existsSync(agentsMd)) {
    const content = readFileSync(agentsMd, 'utf-8');
    const fmMatch = content.match(/^---\n([\s\S]*?)\n---/);
    if (fmMatch && /^node_type:/m.test(fmMatch[1])) {
      drifted.push('AGENTS.md');
    }
  }
  return drifted;
}

// ---------------------------------------------------------------------------
// Subcheck 4: Undocumented types
// ---------------------------------------------------------------------------

function checkUndocumentedTypes(graph, declaredTypes) {
  const graphTypes = new Set(graph.nodes.map(n => n.type));
  const undocumented = [];
  for (const t of graphTypes) {
    if (!declaredTypes.has(t)) {
      const count = graph.nodes.filter(n => n.type === t).length;
      undocumented.push({ type: t, count });
    }
  }
  return undocumented;
}

// ---------------------------------------------------------------------------
// Subcheck 5: Deprecated targets
// ---------------------------------------------------------------------------

function checkDeprecatedTargets(graph) {
  const deprecatedIds = new Set(graph.nodes.filter(n => n.deprecated).map(n => n.id));
  if (deprecatedIds.size === 0) return [];
  const violations = [];
  for (const edge of graph.edges) {
    if (deprecatedIds.has(edge.to)) {
      violations.push({ from: edge.from, to: edge.to, type: edge.type });
    }
  }
  return violations;
}

// ---------------------------------------------------------------------------
// Subcheck 6: Pillar-membership inference
// ---------------------------------------------------------------------------

function checkPillarMembership(graph) {
  const hubs = graph.nodes.filter(n => n.type === 'hub');
  const spokes = graph.nodes.filter(n => n.type === 'spoke');
  const edgeSet = new Set(graph.edges.map(e => `${e.from}->${e.to}`));

  const issues = [];
  for (const spoke of spokes) {
    const pathParts = spoke.path.split('/');
    if (pathParts.length < 2) continue;
    let inferredHub = null;
    if (pathParts[0] === 'docs' && pathParts.length >= 3) {
      const pillar = pathParts[1];
      if (['design', 'engineering', 'content'].includes(pillar)) {
        inferredHub = pillar;
      }
    } else if (pathParts[0] === 'docs' && pathParts.length === 2) {
      const fname = pathParts[1].replace('.md', '');
      for (const h of hubs) {
        if (fname.startsWith(h.id + '-') || fname === h.id) {
          inferredHub = h.id;
          break;
        }
      }
    }
    if (!inferredHub) continue;

    const hasForward = edgeSet.has(`${spoke.id}->${inferredHub}`) ||
                       edgeSet.has(`${inferredHub}->${spoke.id}`);
    if (!hasForward) {
      issues.push({ spoke: spoke.id, expectedHub: inferredHub, path: spoke.path });
    }
  }
  return issues;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

function main() {
  const graph = loadGraph();
  const specText = loadKgSpec();

  console.log('# Graph Hygiene Audit Report\n');
  console.log(`Graph: ${graph.nodes.length} nodes, ${graph.edges.length} edges\n`);

  // 1. Outbound dead-ends
  console.log('## 1. Outbound Dead-Ends\n');
  const deadEnds = checkOutboundDeadEnds(graph);
  console.log(`Total nodes with zero outbound edges: ${deadEnds.total}\n`);
  console.log('| Type | Count |');
  console.log('|------|-------|');
  for (const [type, nodes] of deadEnds.byType) {
    console.log(`| ${type} | ${nodes.length} |`);
  }
  console.log();

  // 2. ID-pattern violations
  console.log('## 2. ID-Pattern Violations\n');
  const idResult = checkIdPatterns(graph, specText);
  if (idResult.error) {
    console.log(`WARN: ${idResult.error}\n`);
  } else if (idResult.violations.length === 0) {
    console.log('No violations found.\n');
  } else {
    console.log(`Found ${idResult.violations.length} violations:\n`);
    console.log('| ID | Type | Expected Pattern | File |');
    console.log('|----|------|------------------|------|');
    for (const v of idResult.violations) {
      console.log(`| ${v.id} | ${v.type} | ${v.expected} | ${v.path} |`);
    }
    console.log();
  }

  // 3. Field-name drift
  console.log('## 3. Field-Name Drift (node_type: vs type:)\n');
  const drifted = checkFieldNameDrift();
  if (drifted.length === 0) {
    console.log('No files use `node_type:` — all conform to `type:`.\n');
  } else {
    console.log(`Found ${drifted.length} files using \`node_type:\` instead of \`type:\`:\n`);
    for (const f of drifted) {
      console.log(`- ${f}`);
    }
    console.log();
  }

  // 4. Undocumented types
  console.log('## 4. Undocumented Node Types\n');
  const declaredTypes = parseDeclaredTypes(specText);
  const undocumented = checkUndocumentedTypes(graph, declaredTypes);
  if (undocumented.length === 0) {
    console.log('All graph node types are documented in §8.\n');
  } else {
    console.log('| Type | Count in Graph | In §8? |');
    console.log('|------|---------------|--------|');
    for (const u of undocumented) {
      console.log(`| ${u.type} | ${u.count} | No |`);
    }
    console.log();
  }

  // 5. Deprecated targets
  console.log('## 5. Edges Pointing to Deprecated Nodes\n');
  const depTargets = checkDeprecatedTargets(graph);
  if (depTargets.length === 0) {
    console.log('No edges point to deprecated nodes.\n');
  } else {
    console.log(`Found ${depTargets.length} edges to deprecated nodes:\n`);
    console.log('| From | To (deprecated) | Edge Type |');
    console.log('|------|-----------------|-----------|');
    for (const d of depTargets) {
      console.log(`| ${d.from} | ${d.to} | ${d.type} |`);
    }
    console.log();
  }

  // 6. Pillar-membership inference
  console.log('## 6. Pillar-Membership Gaps\n');
  const pillarIssues = checkPillarMembership(graph);
  if (pillarIssues.length === 0) {
    console.log('All spokes have graph edges connecting them to their inferred hub.\n');
  } else {
    console.log(`Found ${pillarIssues.length} spokes without a graph edge to their inferred hub:\n`);
    console.log('| Spoke ID | Expected Hub | File |');
    console.log('|----------|-------------|------|');
    for (const p of pillarIssues) {
      console.log(`| ${p.spoke} | ${p.expectedHub} | ${p.path} |`);
    }
    console.log();
  }

  console.log('---');
  console.log('Audit complete. Exit code 0 (advisory).');
}

main();
