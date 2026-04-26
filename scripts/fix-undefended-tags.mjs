#!/usr/bin/env node

/**
 * Plan B remediation: downgrade STRONG_UNDEFENDED tags to APPROX.
 *
 * Spot-check (scripts/spotcheck-tags.mjs) found N strong tags whose cited AP
 * body does NOT reference the feedback ID. Per ENG-230 plan: rather than
 * editing AP bodies (which loses the original-extraction signal in the AP
 * file), we downgrade the FEEDBACK side from strong (`See AP-NNN`) to approx
 * (`Related: AP-NNN`) and add a `**Loose match:**` self-disclosure prefix.
 *
 * Confidence drops 1.0 -> 0.6 for these entries; mean weighted confidence stays
 * well above the 0.70 floor as long as <50% of tags are downgraded.
 *
 * Run with `--dry-run` to print the planned changes without editing.
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
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

const ANCHOR_RE = /^<a id="([^"]+)"><\/a>$/;
const HEADING_RE = /^#{3,4} /;

const DRY_RUN = process.argv.includes('--dry-run');

function loadFile(rel) {
  const abs = resolve(ROOT, rel);
  if (!existsSync(abs)) return null;
  return readFileSync(abs, 'utf-8');
}

function indexCatalog(text) {
  const idx = new Map();
  if (!text) return idx;
  const lines = text.split('\n');
  let cur = null;
  let buf = [];
  const flush = () => {
    if (cur) idx.set(cur, buf.join('\n'));
  };
  for (const line of lines) {
    const m = /^##+\s+((?:AP|EAP|CAP)-\d{1,4})\b/.exec(line);
    if (m) {
      flush();
      cur = m[1];
      buf = [];
    } else if (cur) {
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
  const prefix = apId.split('-')[0];
  return CATALOGS[prefix]?.get(apId) ?? null;
}

function mapEntryAnchorsToLines(text) {
  // Returns: array of { fbId, anchorLine, headingLine, bodyEndLine }
  const lines = text.split('\n');
  const result = [];
  let i = 0;
  while (i < lines.length) {
    const am = ANCHOR_RE.exec(lines[i]);
    if (am && i + 1 < lines.length && HEADING_RE.test(lines[i + 1])) {
      let end = lines.length;
      for (let j = i + 2; j < lines.length; j++) {
        if (/^<a id="/.test(lines[j]) || /^## /.test(lines[j])) {
          end = j;
          break;
        }
      }
      result.push({
        fbId: am[1].toUpperCase(),
        anchorLine: i,
        headingLine: i + 1,
        bodyEndLine: end,
      });
      i = end;
      continue;
    }
    i += 1;
  }
  return { lines, entries: result };
}

const STRONG_LINE_RE = /^\*\*[^*]+:\*\*\s+See\s+((?:AP|EAP|CAP)-\d{1,4})\.?\s*$/;
const PLAIN_STRONG_LINE_RE = /^See\s+((?:AP|EAP|CAP)-\d{1,4})\.?\s*$/;

function fixFile(rel) {
  const text = loadFile(rel);
  if (!text) return { changed: 0, decisions: [] };
  const { lines, entries } = mapEntryAnchorsToLines(text);
  const decisions = [];
  let changed = 0;

  for (const entry of entries) {
    for (let li = entry.headingLine + 1; li < entry.bodyEndLine; li++) {
      const line = lines[li];
      const sm = STRONG_LINE_RE.exec(line);
      const psm = !sm ? PLAIN_STRONG_LINE_RE.exec(line) : null;
      const apId = sm?.[1] ?? psm?.[1];
      if (!apId) continue;

      const apBody = lookupApBody(apId);
      if (!apBody) {
        decisions.push({
          file: rel,
          fbId: entry.fbId,
          apId,
          line: li + 1,
          action: 'skip-ap-not-found',
        });
        continue;
      }
      const fbCanonical = entry.fbId.replace(/-OCC\d+$/i, '');
      const re = new RegExp(`\\b${fbCanonical}\\b`, 'i');
      const linked = re.test(apBody);
      if (linked) continue; // strong is defended

      // STRONG_UNDEFENDED. Try to re-target before downgrading.
      // Look at the FB body itself for explicit AP-NNN / EAP-NNN / CAP-NNN
      // mentions; if one of those AP bodies actually cites the FB ID, that's
      // the correct strong target.
      const fbBody = lines.slice(entry.headingLine + 1, entry.bodyEndLine).join('\n');
      const candidates = new Set();
      for (const m of fbBody.matchAll(/\b((?:AP|EAP|CAP)-\d{1,4})\b/g)) {
        candidates.add(m[1]);
      }
      candidates.delete(apId); // we already know this one fails

      let retargetTo = null;
      for (const cand of candidates) {
        const cbody = lookupApBody(cand);
        if (!cbody) continue;
        if (re.test(cbody)) {
          retargetTo = cand;
          break;
        }
      }

      const isLoosePrefix = /^\*\*Loose match:/i.test(line);
      if (retargetTo && !isLoosePrefix) {
        const replacement = `**Anti-pattern:** See ${retargetTo}.`;
        lines[li] = replacement;
        changed += 1;
        decisions.push({
          file: rel,
          fbId: entry.fbId,
          apId,
          line: li + 1,
          action: 'retarget',
          from: line,
          to: replacement,
          newApId: retargetTo,
        });
      } else {
        const replacement = `**Loose match:** Related: ${apId}.`;
        lines[li] = replacement;
        changed += 1;
        decisions.push({
          file: rel,
          fbId: entry.fbId,
          apId,
          line: li + 1,
          action: 'downgrade',
          from: line,
          to: replacement,
        });
      }
    }
  }

  if (changed > 0 && !DRY_RUN) {
    writeFileSync(resolve(ROOT, rel), lines.join('\n'), 'utf-8');
  }
  return { changed, decisions };
}

const summary = {};
for (const fp of FEEDBACK_FILES) {
  const { changed, decisions } = fixFile(fp);
  summary[fp] = { changed, decisions };
}

const totalChanged = Object.values(summary).reduce((a, b) => a + b.changed, 0);

console.log(`${DRY_RUN ? '[DRY RUN] ' : ''}Plan B undefended-tag downgrade pass\n`);
for (const [fp, { changed, decisions }] of Object.entries(summary)) {
  console.log(`${fp}: ${changed} downgrade(s)`);
  for (const d of decisions) {
    if (d.action === 'downgrade') {
      console.log(`  L${d.line}  ${d.fbId} -> ${d.apId}  [downgrade -> approx]`);
    } else if (d.action === 'retarget') {
      console.log(`  L${d.line}  ${d.fbId} -> ${d.apId}  [retarget -> ${d.newApId}]`);
    } else if (d.action === 'skip-ap-not-found') {
      console.log(`  L${d.line}  ${d.fbId} -> ${d.apId}  [SKIPPED: AP not found]`);
    }
  }
}
console.log(`\nTotal lines changed: ${totalChanged}${DRY_RUN ? ' (dry run, no files modified)' : ''}`);
