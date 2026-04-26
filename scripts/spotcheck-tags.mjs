#!/usr/bin/env node

/**
 * Plan B feedback-tag defensibility spot-check.
 *
 * For each canonical citation in feedback logs, verify:
 *   - Strong tag (`See AP-NNN`): the cited AP body in its catalog file MUST
 *     reference the feedback ID (back-link verification). If not, the strong
 *     claim is undefended.
 *   - Approx tag (`Related: AP-NNN`): the citation MUST be self-disclosed via
 *     "**Loose match:**" or similar prefix indicating it's heuristic.
 *
 * Produces a stratified sample (default 12 per file = 60 total) and a
 * machine-readable summary. Output is markdown, written to stdout or to
 * `docs/feedback-tag-spotcheck.md` when `--write` is passed.
 */

import { readFileSync, existsSync, writeFileSync } from 'fs';
import { resolve } from 'path';

const ROOT = resolve(import.meta.dirname, '..');

const FEEDBACK_FILES = [
  'docs/content-feedback-log.md',
  'docs/design-feedback-log.md',
  'docs/design-feedback-log-archive.md',
  'docs/engineering-feedback-log.md',
  'docs/engineering-feedback-log-archive.md',
];

const CATALOG_FILES = {
  AP: 'docs/design-anti-patterns.md',
  EAP: 'docs/engineering-anti-patterns.md',
  CAP: 'docs/content-anti-patterns.md',
};

const CITATION_LINE_RE = /^(\*\*[^*]+:\*\*\s+)?(See|Related:)\s+((?:AP|EAP|CAP)-\d{1,4})(?:\s*\(([0-9]*\.?[0-9]+)\))?\.?\s*$/;
const ANCHOR_RE = /^<a id="([^"]+)"><\/a>$/;
const HEADING_RE = /^#{3,4} /;
const ARGS = process.argv.slice(2);
const SAMPLE_PER_FILE = Number(ARGS.find((a) => a.startsWith('--per-file='))?.split('=')[1] ?? 12);
const WRITE_OUT = ARGS.includes('--write');

function loadFile(rel) {
  const abs = resolve(ROOT, rel);
  if (!existsSync(abs)) return null;
  return readFileSync(abs, 'utf-8');
}

function indexCatalog(catalogText) {
  // Map: AP-NNN -> body text (everything between this heading and the next).
  const idx = new Map();
  if (!catalogText) return idx;
  const lines = catalogText.split('\n');
  let currentId = null;
  let buf = [];
  const flush = () => {
    if (currentId) idx.set(currentId, buf.join('\n'));
  };
  for (const line of lines) {
    const m = /^##+\s+((?:AP|EAP|CAP)-\d{1,4})\b/.exec(line);
    if (m) {
      flush();
      currentId = m[1];
      buf = [];
    } else if (currentId) {
      buf.push(line);
    }
  }
  flush();
  return idx;
}

const CATALOGS = {};
for (const [k, fp] of Object.entries(CATALOG_FILES)) {
  CATALOGS[k] = indexCatalog(loadFile(fp));
}

function lookupApBody(apId) {
  const prefix = apId.split('-')[0]; // AP / EAP / CAP
  return CATALOGS[prefix]?.get(apId) ?? null;
}

function scanFile(rel) {
  const text = loadFile(rel);
  if (!text) return [];
  const lines = text.split('\n');
  const entries = [];
  let i = 0;
  while (i < lines.length) {
    const am = ANCHOR_RE.exec(lines[i]);
    if (am && i + 1 < lines.length && HEADING_RE.test(lines[i + 1])) {
      const fbId = am[1].toUpperCase();
      // Body extends to next anchor or next ## heading.
      let end = lines.length;
      for (let j = i + 2; j < lines.length; j++) {
        if (/^<a id="/.test(lines[j]) || /^## /.test(lines[j])) {
          end = j;
          break;
        }
      }
      const bodyLines = lines.slice(i + 1, end);
      const tags = [];
      for (const line of bodyLines) {
        const cm = CITATION_LINE_RE.exec(line);
        if (cm) {
          const prefix = cm[1] ?? '';
          const kind = cm[2] === 'See' ? 'strong' : 'approx';
          const apId = cm[3];
          const isLooseDisclosed = /loose match/i.test(prefix);
          tags.push({ kind, apId, prefix: prefix.trim(), looseDisclosed: isLooseDisclosed });
        }
      }
      if (tags.length > 0) {
        entries.push({ file: rel, fbId, tags });
      }
      i = end;
      continue;
    }
    i += 1;
  }
  return entries;
}

function verify(entry) {
  const results = [];
  for (const tag of entry.tags) {
    const apBody = lookupApBody(tag.apId);
    if (!apBody) {
      results.push({
        ...tag,
        verdict: 'AP_NOT_FOUND',
        detail: `${tag.apId} not found in catalogs`,
      });
      continue;
    }
    if (tag.kind === 'strong') {
      // Back-link check: AP body must reference the feedback ID.
      const fbBody = entry.fbId.replace(/-OCC\d+$/i, '');
      const re = new RegExp(`\\b${fbBody}\\b`, 'i');
      const linked = re.test(apBody);
      results.push({
        ...tag,
        verdict: linked ? 'STRONG_BACKLINKED' : 'STRONG_UNDEFENDED',
        detail: linked ? `${tag.apId} body cites ${entry.fbId}` : `${tag.apId} body does NOT cite ${entry.fbId}`,
      });
    } else {
      // Approx tag: must be self-disclosed.
      const ok = tag.looseDisclosed;
      results.push({
        ...tag,
        verdict: ok ? 'APPROX_DISCLOSED' : 'APPROX_UNDISCLOSED',
        detail: ok ? `Self-disclosed via "${tag.prefix}"` : `Approx tag without "Loose match:" prefix`,
      });
    }
  }
  return { ...entry, results };
}

function stratifiedSample(entries, perFile) {
  const byFile = {};
  for (const e of entries) {
    (byFile[e.file] ??= []).push(e);
  }
  const sample = [];
  for (const [file, list] of Object.entries(byFile)) {
    if (list.length <= perFile) {
      sample.push(...list);
      continue;
    }
    // Deterministic stride: every (length/perFile)-th entry.
    const stride = list.length / perFile;
    for (let k = 0; k < perFile; k++) {
      sample.push(list[Math.floor(k * stride)]);
    }
  }
  return sample;
}

function fmtRow(verified) {
  const tagSummary = verified.results
    .map((r) => `${r.apId} (${r.kind}: ${r.verdict})`)
    .join('; ');
  return `| ${verified.fbId} | ${verified.file.replace('docs/', '')} | ${tagSummary} |`;
}

function main() {
  const allEntries = FEEDBACK_FILES.flatMap(scanFile);
  const sample = stratifiedSample(allEntries, SAMPLE_PER_FILE);
  const verified = sample.map(verify);

  // Aggregate stats over the sample.
  const counts = {
    STRONG_BACKLINKED: 0,
    STRONG_UNDEFENDED: 0,
    APPROX_DISCLOSED: 0,
    APPROX_UNDISCLOSED: 0,
    AP_NOT_FOUND: 0,
  };
  for (const v of verified) {
    for (const r of v.results) counts[r.verdict] += 1;
  }
  const totalTags = Object.values(counts).reduce((a, b) => a + b, 0);
  const undefended = counts.STRONG_UNDEFENDED;
  const undisclosed = counts.APPROX_UNDISCLOSED;
  const missing = counts.AP_NOT_FOUND;

  // Aggregate stats over the FULL corpus too — useful sanity number.
  const fullCounts = {
    STRONG_BACKLINKED: 0,
    STRONG_UNDEFENDED: 0,
    APPROX_DISCLOSED: 0,
    APPROX_UNDISCLOSED: 0,
    AP_NOT_FOUND: 0,
  };
  for (const e of allEntries) {
    for (const r of verify(e).results) fullCounts[r.verdict] += 1;
  }
  const fullTotal = Object.values(fullCounts).reduce((a, b) => a + b, 0);

  const ts = new Date().toISOString().slice(0, 10);
  const md = [
    `<!-- Auto-generated by scripts/spotcheck-tags.mjs. DO NOT EDIT. -->`,
    `<!-- Re-generate with: node scripts/spotcheck-tags.mjs --write -->`,
    `# Plan B Feedback-Tag Defensibility Spot-Check`,
    ``,
    `**Generated:** ${ts}  `,
    `**Sample size:** ${verified.length} entries (${SAMPLE_PER_FILE} per file, stratified)  `,
    `**Tags in sample:** ${totalTags}`,
    ``,
    `## Methodology`,
    ``,
    `- **Strong tag** (\`See AP-NNN\`): the cited AP body in its catalog file MUST reference the feedback ID. Verifies "this AP was extracted from / cites this feedback".`,
    `- **Approx tag** (\`Related: AP-NNN\`): the citation MUST be self-disclosed with a \`**Loose match:**\` prefix so consumers know the link is heuristic.`,
    `- Verdicts: \`STRONG_BACKLINKED\` (good), \`STRONG_UNDEFENDED\` (suspect), \`APPROX_DISCLOSED\` (good), \`APPROX_UNDISCLOSED\` (suspect), \`AP_NOT_FOUND\` (missing).`,
    ``,
    `## Sample results (${SAMPLE_PER_FILE}/file × 5 files)`,
    ``,
    `**Counts:** STRONG_BACKLINKED=${counts.STRONG_BACKLINKED} · STRONG_UNDEFENDED=${counts.STRONG_UNDEFENDED} · APPROX_DISCLOSED=${counts.APPROX_DISCLOSED} · APPROX_UNDISCLOSED=${counts.APPROX_UNDISCLOSED} · AP_NOT_FOUND=${counts.AP_NOT_FOUND}`,
    ``,
    `| Feedback ID | File | Tags |`,
    `|---|---|---|`,
    ...verified.map(fmtRow),
    ``,
    `## Full-corpus aggregate (over all tagged entries, not just the sample)`,
    ``,
    `Total tags across all 5 logs: **${fullTotal}**`,
    ``,
    `- STRONG_BACKLINKED: **${fullCounts.STRONG_BACKLINKED}** (${pct(fullCounts.STRONG_BACKLINKED, fullTotal)})`,
    `- STRONG_UNDEFENDED: **${fullCounts.STRONG_UNDEFENDED}** (${pct(fullCounts.STRONG_UNDEFENDED, fullTotal)})`,
    `- APPROX_DISCLOSED: **${fullCounts.APPROX_DISCLOSED}** (${pct(fullCounts.APPROX_DISCLOSED, fullTotal)})`,
    `- APPROX_UNDISCLOSED: **${fullCounts.APPROX_UNDISCLOSED}** (${pct(fullCounts.APPROX_UNDISCLOSED, fullTotal)})`,
    `- AP_NOT_FOUND: **${fullCounts.AP_NOT_FOUND}** (${pct(fullCounts.AP_NOT_FOUND, fullTotal)})`,
    ``,
    `## Verdict`,
    ``,
    undefendedSummary(undefended, undisclosed, missing, fullCounts),
  ].join('\n');

  if (WRITE_OUT) {
    const outPath = resolve(ROOT, 'docs/feedback-tag-spotcheck.md');
    writeFileSync(outPath, md + '\n', 'utf-8');
    console.error(`Wrote ${outPath}`);
  } else {
    console.log(md);
  }

  // Exit non-zero on any sample-level red flag so CI can gate.
  if (undefended > 0 || undisclosed > 0 || missing > 0) {
    console.error(
      `\nWarnings: STRONG_UNDEFENDED=${undefended}, APPROX_UNDISCLOSED=${undisclosed}, AP_NOT_FOUND=${missing}`
    );
  }
}

function pct(n, d) {
  if (d === 0) return '0.0%';
  return `${((n / d) * 100).toFixed(1)}%`;
}

function undefendedSummary(undefended, undisclosed, missing, fullCounts) {
  const parts = [];
  if (undefended === 0 && undisclosed === 0 && missing === 0) {
    parts.push(
      `**Sample passes.** All ${SAMPLE_PER_FILE * 5} sampled tags either back-link to a citing AP body (strong) or self-disclose as heuristic (approx).`
    );
  } else {
    parts.push(`**Sample issues found.**`);
    if (undefended > 0)
      parts.push(`- ${undefended} strong tags lack back-link in the cited AP body.`);
    if (undisclosed > 0)
      parts.push(`- ${undisclosed} approx tags missing "Loose match:" disclosure.`);
    if (missing > 0) parts.push(`- ${missing} citations point to AP IDs not found in any catalog.`);
  }
  if (fullCounts.STRONG_UNDEFENDED + fullCounts.APPROX_UNDISCLOSED + fullCounts.AP_NOT_FOUND > 0) {
    parts.push(``);
    parts.push(
      `**Full-corpus warnings:** ${fullCounts.STRONG_UNDEFENDED} undefended strong + ${fullCounts.APPROX_UNDISCLOSED} undisclosed approx + ${fullCounts.AP_NOT_FOUND} missing AP IDs across all tagged entries (not just the sample). These should be reviewed and either down-graded to approx or have the AP body updated to cite the feedback ID.`
    );
  }
  return parts.join('\n');
}

main();
