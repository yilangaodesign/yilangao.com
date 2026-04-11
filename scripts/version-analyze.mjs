#!/usr/bin/env node

/**
 * Multi-app version analysis and bump script.
 *
 * Analyzes git diff since the last release to determine the appropriate
 * semver bump level (patch, minor, major) based on the scope and type
 * of changes for the given app.
 *
 * Usage:
 *   node scripts/version-analyze.mjs [app]             # analyze only
 *   node scripts/version-analyze.mjs [app] --apply     # analyze + auto-bump
 *   node scripts/version-analyze.mjs [app] --quiet     # machine-readable JSON
 *
 * If [app] is omitted, defaults to "elan".
 *
 * App-specific heuristics:
 *   elan:     DS components + tokens (MAJOR on deletions, MINOR on additions)
 *   website:  Pages + CMS + routes (MAJOR on route deletions, MINOR on new pages)
 */

import { readFileSync } from 'fs';
import { execSync } from 'child_process';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

// ── App Configurations ──────────────────────────────────────────────────────

const APPS = {
  elan: {
    displayName: 'Élan',
    manifest: 'elan.json',
    paths: [
      'src/components/',
      'src/styles/',
      'playground/src/components/',
      'playground/src/app/components/',
      'playground/src/app/tokens/',
      'playground/src/lib/tokens.ts',
    ],
    analyze: analyzeElan,
  },
  website: {
    displayName: 'yilangao.com',
    manifest: 'website.json',
    paths: [
      'src/app/(frontend)/',
      'src/collections/',
      'src/lib/',
      'src/proxy.ts',
      'next.config.ts',
    ],
    analyze: analyzeWebsite,
  },
};

// ── Args ─────────────────────────────────────────────────────────────────────

const positionalArgs = process.argv.slice(2).filter(a => !a.startsWith('--'));
const flags = new Set(process.argv.slice(2).filter(a => a.startsWith('--')));
const appKey = positionalArgs[0] || 'elan';
const applyBump = flags.has('--apply');
const quietMode = flags.has('--quiet');

const appConfig = APPS[appKey];
if (!appConfig) {
  console.error(`Unknown app: "${appKey}". Available: ${Object.keys(APPS).join(', ')}`);
  process.exit(1);
}

// ── Shared Utilities ─────────────────────────────────────────────────────────

function git(cmd) {
  try {
    return execSync(`git ${cmd}`, { cwd: root, encoding: 'utf-8' }).trim();
  } catch {
    return '';
  }
}

function findLastReleaseCommit(manifestFile) {
  const commits = git(`log --all --format=%H -- ${manifestFile}`).split('\n').filter(Boolean);

  for (const sha of commits.slice(0, 30)) {
    try {
      const content = git(`show ${sha}:${manifestFile}`);
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

function getDiffLines(baseCommit, paths) {
  const diffBase = baseCommit || 'HEAD~30';
  const pathArgs = paths.map(p => `'${p}'`).join(' ');
  const diffOutput = git(`diff --name-status ${diffBase} -- ${pathArgs}`);
  if (!diffOutput) return [];
  return diffOutput.split('\n').filter(Boolean);
}

function getManifest(manifestFile) {
  return JSON.parse(readFileSync(resolve(root, manifestFile), 'utf-8'));
}

function isVersionSufficient(currentVersion, releaseVersion, level) {
  const [curMajor, curMinor] = currentVersion.split('.').map(Number);
  const [relMajor, relMinor] = releaseVersion.split('.').map(Number);

  const majorDiff = curMajor - relMajor;
  const minorDiff = curMinor - relMinor;

  if (level === 'major' && majorDiff > 0) return true;
  if (level === 'minor' && (majorDiff > 0 || minorDiff > 0)) return true;
  if (level === 'patch') return true;
  return false;
}

// ── Élan Analysis (design system) ────────────────────────────────────────────

function analyzeElan(lines) {
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
    reasons.push(`${deletedComponents.length} component(s) deleted`);
  }
  if (renamedComponents.length > 0) {
    level = 'major';
    reasons.push(`${renamedComponents.length} component(s) renamed`);
  }
  const deletedTokens = modifiedTokenFiles.filter(f => f.startsWith('DELETED:'));
  if (deletedTokens.length > 0) {
    level = 'major';
    reasons.push(`${deletedTokens.length} token file(s) deleted`);
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
    if (modifiedTokenFiles.length > 0) reasons.push(`${modifiedTokenFiles.length} token file(s) modified`);
    if (modifiedComponentFiles.length > 0) reasons.push(`${modifiedComponentFiles.length} component file(s) modified`);
    if (reasons.length === 0) reasons.push('Minor value tweaks or bug fixes');
  }

  return {
    level,
    reason: reasons.join('; '),
    details: { newComponents, deletedComponents, renamedComponents, modifiedTokenFiles, modifiedComponentFiles },
    totalFilesChanged: lines.length,
    detailLabels: {
      newComponents: 'New components',
      deletedComponents: 'Deleted components',
      renamedComponents: 'Renamed components',
      modifiedTokenFiles: 'Modified token files',
      modifiedComponentFiles: 'Modified component files',
    },
  };
}

// ── Website Analysis (pages, routes, CMS) ────────────────────────────────────

function analyzeWebsite(lines) {
  const newPages = [];
  const deletedPages = [];
  const renamedPages = [];
  const modifiedPages = [];
  const newCollections = [];
  const deletedCollections = [];
  const modifiedCollections = [];
  const modifiedLib = [];
  const modifiedConfig = [];

  for (const line of lines) {
    const parts = line.split('\t');
    const status = parts[0].charAt(0);
    const filePath = parts[1] || '';
    const newPath = parts[2] || '';

    const isPage = filePath.includes('(frontend)/') && (filePath.endsWith('page.tsx') || filePath.endsWith('layout.tsx'));
    const isPageAsset = filePath.includes('(frontend)/') && !isPage;
    const isCollection = filePath.includes('collections/');
    const isLib = filePath.includes('src/lib/');
    const isConfig = filePath.includes('proxy.ts') || filePath.includes('next.config');

    switch (status) {
      case 'A':
        if (isPage) newPages.push(filePath);
        else if (isCollection) newCollections.push(filePath);
        else if (isPageAsset) modifiedPages.push(filePath);
        else if (isLib) modifiedLib.push(filePath);
        else if (isConfig) modifiedConfig.push(filePath);
        break;
      case 'D':
        if (isPage) deletedPages.push(filePath);
        else if (isCollection) deletedCollections.push(`DELETED: ${filePath}`);
        break;
      case 'R':
        if (isPage) renamedPages.push(`${filePath} → ${newPath}`);
        break;
      case 'M':
        if (isPage || isPageAsset) modifiedPages.push(filePath);
        else if (isCollection) modifiedCollections.push(filePath);
        else if (isLib) modifiedLib.push(filePath);
        else if (isConfig) modifiedConfig.push(filePath);
        break;
    }
  }

  let level = 'patch';
  const reasons = [];

  if (deletedPages.length > 0) {
    level = 'major';
    reasons.push(`${deletedPages.length} page(s)/route(s) deleted — URL breaking change`);
  }
  if (renamedPages.length > 0) {
    level = 'major';
    reasons.push(`${renamedPages.length} page(s)/route(s) renamed — URL breaking change`);
  }
  if (deletedCollections.length > 0) {
    level = 'major';
    reasons.push(`${deletedCollections.length} CMS collection(s) deleted`);
  }

  if (level !== 'major') {
    if (newPages.length > 0) {
      level = 'minor';
      reasons.push(`${newPages.length} new page(s)/route(s) added`);
    }
    if (newCollections.length > 0) {
      level = 'minor';
      reasons.push(`${newCollections.length} new CMS collection(s) added`);
    }
    if (lines.length >= 15 && level !== 'minor') {
      level = 'minor';
      reasons.push(`${lines.length} total files changed — scope warrants minor bump`);
    }
  }

  if (reasons.length === 0) {
    if (modifiedPages.length > 0) reasons.push(`${modifiedPages.length} page file(s) modified`);
    if (modifiedCollections.length > 0) reasons.push(`${modifiedCollections.length} CMS collection(s) modified`);
    if (modifiedLib.length > 0) reasons.push(`${modifiedLib.length} lib file(s) modified`);
    if (modifiedConfig.length > 0) reasons.push(`${modifiedConfig.length} config file(s) modified`);
    if (reasons.length === 0) reasons.push('Minor content or config tweaks');
  }

  return {
    level,
    reason: reasons.join('; '),
    details: { newPages, deletedPages, renamedPages, modifiedPages, newCollections, deletedCollections, modifiedCollections, modifiedLib, modifiedConfig },
    totalFilesChanged: lines.length,
    detailLabels: {
      newPages: 'New pages/routes',
      deletedPages: 'Deleted pages/routes',
      renamedPages: 'Renamed pages/routes',
      modifiedPages: 'Modified page files',
      newCollections: 'New CMS collections',
      deletedCollections: 'Deleted CMS collections',
      modifiedCollections: 'Modified CMS collections',
      modifiedLib: 'Modified lib files',
      modifiedConfig: 'Modified config files',
    },
  };
}

// ── Main ─────────────────────────────────────────────────────────────────────

const manifest = getManifest(appConfig.manifest);
const releaseCommit = findLastReleaseCommit(appConfig.manifest);
const diffLines = getDiffLines(releaseCommit, appConfig.paths);

const analysis = diffLines.length === 0
  ? {
      level: 'patch',
      reason: `No ${appConfig.displayName} changes detected since last release`,
      details: {},
      totalFilesChanged: 0,
      detailLabels: {},
    }
  : appConfig.analyze(diffLines);

const alreadySufficient = isVersionSufficient(manifest.version, manifest.release.version, analysis.level);

if (quietMode) {
  console.log(JSON.stringify({
    app: appKey,
    displayName: appConfig.displayName,
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

const header = `${appConfig.displayName} — Version Analysis Report`;
const pad = Math.max(0, 56 - header.length);
const padL = Math.floor(pad / 2);
const padR = pad - padL;

console.log('');
console.log('╔══════════════════════════════════════════════════════════╗');
console.log(`║${' '.repeat(padL + 1)}${header}${' '.repeat(padR + 1)}║`);
console.log('╚══════════════════════════════════════════════════════════╝');
console.log('');
console.log(`  Current dev version:   ${manifest.version}`);
console.log(`  Last released version: ${manifest.release.version}`);
console.log(`  Released at:           ${manifest.release.releasedAt}`);
console.log(`  Release commit:        ${releaseCommit ? releaseCommit.slice(0, 12) : '(not found)'}`);
console.log('');
console.log('── Change Summary ──────────────────────────────────────────');
console.log(`  Total files changed: ${analysis.totalFilesChanged}`);

const labels = analysis.detailLabels || {};
for (const [key, label] of Object.entries(labels)) {
  const items = analysis.details[key];
  if (!items || items.length === 0) continue;

  const prefix = key.startsWith('new') ? '+' : key.startsWith('deleted') ? '-' : key.startsWith('renamed') ? '~' : '*';
  console.log(`  ${label} (${items.length}):`);
  const show = items.slice(0, 10);
  show.forEach(f => console.log(`    ${prefix} ${f}`));
  if (items.length > 10) console.log(`    ... and ${items.length - 10} more`);
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
    execSync(`node scripts/version-bump.mjs ${analysis.level} ${appKey}`, { cwd: root, stdio: 'inherit' });
    console.log('  ✓ Version bumped successfully.');
  } catch (err) {
    console.error('  ✗ Version bump failed:', err.message);
    process.exit(1);
  }
} else if (applyBump && alreadySufficient) {
  console.log(`  No bump needed — version already sufficient.`);
} else if (!alreadySufficient) {
  console.log(`  Run with --apply to auto-bump, or manually:`);
  console.log(`    npm run ${appKey === 'elan' ? '' : appKey + ':'}version:${analysis.level}`);
}

console.log('');
