#!/usr/bin/env node

/**
 * Automated version analysis and bump script.
 *
 * Analyzes git diff since the last release to determine the appropriate
 * semver bump level (patch, minor, major) based on the scope and type
 * of design system changes.
 *
 * Usage:
 *   node scripts/version-analyze.mjs              # analyze only — print recommendation
 *   node scripts/version-analyze.mjs --apply      # analyze + auto-bump
 *   node scripts/version-analyze.mjs --quiet      # machine-readable JSON output
 *
 * Heuristics:
 *   MAJOR — component deletions/renames, token file removals, breaking API changes
 *   MINOR — new components, new token categories, broad multi-file changes (15+ files)
 *   PATCH — value tweaks, bug fixes, minor component adjustments
 */

import { readFileSync } from 'fs';
import { execSync } from 'child_process';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

const DS_PATHS = [
  'src/components/',
  'src/styles/',
  'playground/src/components/',
  'playground/src/app/components/',
  'playground/src/app/tokens/',
  'playground/src/lib/tokens.ts',
];

const flags = new Set(process.argv.slice(2));
const applyBump = flags.has('--apply');
const quietMode = flags.has('--quiet');

function git(cmd) {
  try {
    return execSync(`git ${cmd}`, { cwd: root, encoding: 'utf-8' }).trim();
  } catch {
    return '';
  }
}

function findLastReleaseCommit() {
  const commits = git('log --all --format=%H -- elan.json').split('\n').filter(Boolean);

  for (const sha of commits.slice(0, 30)) {
    try {
      const content = git(`show ${sha}:elan.json`);
      const parsed = JSON.parse(content);
      if (parsed.release?.version === parsed.version) {
        return sha;
      }
    } catch {
      continue;
    }
  }
  return null;
}

function analyzeChanges(baseCommit) {
  const diffBase = baseCommit || 'HEAD~30';
  const pathArgs = DS_PATHS.join(' ');

  const diffOutput = git(`diff --name-status ${diffBase} -- ${pathArgs}`);
  if (!diffOutput) {
    return {
      level: 'patch',
      reason: 'No design system changes detected since last release',
      details: { newComponents: [], deletedComponents: [], renamedComponents: [], modifiedTokenFiles: [], modifiedComponentFiles: [] },
      totalFilesChanged: 0,
    };
  }

  const lines = diffOutput.split('\n').filter(Boolean);
  const newComponents = [];
  const deletedComponents = [];
  const renamedComponents = [];
  const modifiedTokenFiles = [];
  const modifiedComponentFiles = [];

  for (const line of lines) {
    const parts = line.split('\t');
    const status = parts[0].charAt(0);
    const filePath = parts[1] || '';
    const newPath = parts[2] || '';

    const isComponent = filePath.includes('components/') && !filePath.includes('tokens/');
    const isToken = filePath.includes('styles/tokens/') || filePath.includes('/tokens/');

    switch (status) {
      case 'A':
        if (isComponent) newComponents.push(filePath);
        break;
      case 'D':
        if (isComponent) deletedComponents.push(filePath);
        else if (isToken) modifiedTokenFiles.push(`DELETED: ${filePath}`);
        break;
      case 'R':
        if (isComponent) renamedComponents.push(`${filePath} → ${newPath}`);
        break;
      case 'M':
        if (isToken) modifiedTokenFiles.push(filePath);
        else if (isComponent) modifiedComponentFiles.push(filePath);
        break;
    }
  }

  let level = 'patch';
  const reasons = [];

  if (deletedComponents.length > 0) {
    level = 'major';
    reasons.push(`${deletedComponents.length} component(s) deleted — breaking change`);
  }

  if (renamedComponents.length > 0) {
    level = level === 'major' ? 'major' : 'major';
    reasons.push(`${renamedComponents.length} component(s) renamed — breaking change`);
  }

  const deletedTokens = modifiedTokenFiles.filter(f => f.startsWith('DELETED:'));
  if (deletedTokens.length > 0) {
    level = 'major';
    reasons.push(`${deletedTokens.length} token file(s) deleted — breaking change`);
  }

  if (level !== 'major') {
    if (newComponents.length > 0) {
      level = 'minor';
      reasons.push(`${newComponents.length} new component(s) added`);
    }

    if (modifiedTokenFiles.length >= 3 && modifiedComponentFiles.length >= 5) {
      level = 'minor';
      reasons.push(`Broad changes: ${modifiedTokenFiles.length} token files + ${modifiedComponentFiles.length} component files`);
    }

    if (lines.length >= 15 && level !== 'minor') {
      level = 'minor';
      reasons.push(`${lines.length} total files changed — scope warrants minor bump`);
    }
  }

  if (reasons.length === 0) {
    if (modifiedTokenFiles.length > 0) {
      reasons.push(`${modifiedTokenFiles.length} token file(s) modified`);
    }
    if (modifiedComponentFiles.length > 0) {
      reasons.push(`${modifiedComponentFiles.length} component file(s) modified`);
    }
    if (reasons.length === 0) {
      reasons.push('Minor value tweaks or bug fixes');
    }
  }

  return {
    level,
    reason: reasons.join('; '),
    details: { newComponents, deletedComponents, renamedComponents, modifiedTokenFiles, modifiedComponentFiles },
    totalFilesChanged: lines.length,
  };
}

function getCurrentVersion() {
  const manifest = JSON.parse(readFileSync(resolve(root, 'elan.json'), 'utf-8'));
  return manifest;
}

function isVersionSufficient(currentVersion, level) {
  const [curMajor, curMinor] = currentVersion.split('.').map(Number);
  const manifest = getCurrentVersion();
  const [relMajor, relMinor] = manifest.release.version.split('.').map(Number);

  const majorDiff = curMajor - relMajor;
  const minorDiff = curMinor - relMinor;

  if (level === 'major' && majorDiff > 0) return true;
  if (level === 'minor' && (majorDiff > 0 || minorDiff > 0)) return true;
  if (level === 'patch') return true;
  return false;
}

// ── Main ────────────────────────────────────────────────────────────────────

const manifest = getCurrentVersion();
const releaseCommit = findLastReleaseCommit();
const analysis = analyzeChanges(releaseCommit);
const alreadySufficient = isVersionSufficient(manifest.version, analysis.level);

if (quietMode) {
  console.log(JSON.stringify({
    currentVersion: manifest.version,
    releaseVersion: manifest.release.version,
    suggestedBump: analysis.level,
    reason: analysis.reason,
    totalFilesChanged: analysis.totalFilesChanged,
    alreadySufficient,
    details: analysis.details,
  }, null, 2));
  process.exit(0);
}

console.log('');
console.log('╔══════════════════════════════════════════════════════════╗');
console.log('║            Élan — Version Analysis Report               ║');
console.log('╚══════════════════════════════════════════════════════════╝');
console.log('');
console.log(`  Current dev version:   ${manifest.version}`);
console.log(`  Last released version: ${manifest.release.version}`);
console.log(`  Released at:           ${manifest.release.releasedAt}`);
console.log(`  Release commit:        ${releaseCommit ? releaseCommit.slice(0, 12) : '(not found)'}`);
console.log('');
console.log('── Change Summary ──────────────────────────────────────────');
console.log(`  Total DS files changed: ${analysis.totalFilesChanged}`);

const d = analysis.details;
if (d.newComponents.length > 0) {
  console.log(`  New components (${d.newComponents.length}):`);
  d.newComponents.forEach(f => console.log(`    + ${f}`));
}
if (d.deletedComponents.length > 0) {
  console.log(`  Deleted components (${d.deletedComponents.length}):`);
  d.deletedComponents.forEach(f => console.log(`    - ${f}`));
}
if (d.renamedComponents.length > 0) {
  console.log(`  Renamed components (${d.renamedComponents.length}):`);
  d.renamedComponents.forEach(f => console.log(`    ~ ${f}`));
}
if (d.modifiedTokenFiles.length > 0) {
  console.log(`  Modified token files (${d.modifiedTokenFiles.length}):`);
  d.modifiedTokenFiles.forEach(f => console.log(`    * ${f}`));
}
if (d.modifiedComponentFiles.length > 0) {
  console.log(`  Modified component files (${d.modifiedComponentFiles.length}):`);
  d.modifiedComponentFiles.slice(0, 10).forEach(f => console.log(`    * ${f}`));
  if (d.modifiedComponentFiles.length > 10) {
    console.log(`    ... and ${d.modifiedComponentFiles.length - 10} more`);
  }
}

console.log('');
console.log('── Recommendation ──────────────────────────────────────────');
console.log(`  Suggested bump: ${analysis.level.toUpperCase()}`);
console.log(`  Reason: ${analysis.reason}`);

if (alreadySufficient) {
  console.log(`  ✓ Current version (${manifest.version}) already satisfies ${analysis.level} bump.`);
} else {
  console.log(`  ⚠ Current version (${manifest.version}) does NOT match — a ${analysis.level} bump is recommended.`);
}

console.log('');

if (applyBump && !alreadySufficient) {
  console.log(`  Applying ${analysis.level} bump...`);
  try {
    execSync(`node scripts/version-bump.mjs ${analysis.level}`, { cwd: root, stdio: 'inherit' });
    console.log('  ✓ Version bumped successfully.');
  } catch (err) {
    console.error('  ✗ Version bump failed:', err.message);
    process.exit(1);
  }
} else if (applyBump && alreadySufficient) {
  console.log(`  No bump needed — version already sufficient.`);
} else if (!alreadySufficient) {
  console.log(`  Run with --apply to auto-bump, or manually:`);
  console.log(`    npm run version:${analysis.level}`);
}

console.log('');
