#!/usr/bin/env node
/**
 * Plan C Phase 11 — eval handle final verification.
 *
 * Runs the 5 verification checks specified in
 * .cursor/plans/docs_kg_eval_handle_c7e2a5f9.plan.md (todo `phase11-eval-verify`).
 * Exits 0 if all checks pass, 1 if any fail.
 *
 * Run from the repo root:
 *   node scripts/verify-eval-handle.mjs
 *
 * Run AFTER:
 *   - Plan A + Plan B are merged into dev (so eval-baseline-current..HEAD shows them)
 *   - The 9 baseline runs in docs/eval-baselines/current/<task-id>/run-<n>.md are captured
 *   - manifest.json model + timestamp + captured_by fields are filled in
 */

import { execSync } from "node:child_process";
import { readFileSync, existsSync, statSync } from "node:fs";
import { join } from "node:path";

const ROOT = process.cwd();
const RESET = "\x1b[0m";
const RED = "\x1b[31m";
const GREEN = "\x1b[32m";
const YELLOW = "\x1b[33m";
const BLUE = "\x1b[34m";
const BOLD = "\x1b[1m";
const DIM = "\x1b[2m";

const TAG_NAME = "eval-baseline-current";
const EXPECTED_TAG_SHA = "56f876024fc95591b95f0f181686ba4dda0ac03f";

const REQUIRED_RUN_FILES = [
  "docs/eval-baselines/current/eval-T002/run-1.md",
  "docs/eval-baselines/current/eval-T002/run-2.md",
  "docs/eval-baselines/current/eval-T002/run-3.md",
  "docs/eval-baselines/current/eval-T008/run-1.md",
  "docs/eval-baselines/current/eval-T008/run-2.md",
  "docs/eval-baselines/current/eval-T008/run-3.md",
  "docs/eval-baselines/current/eval-T011/run-1.md",
  "docs/eval-baselines/current/eval-T011/run-2.md",
  "docs/eval-baselines/current/eval-T011/run-3.md",
];

const REQUIRED_NODE_TYPES = ["eval-task-corpus", "eval-baseline", "alias"];

const REQUIRED_README_SECTIONS = [
  "Phase 00 baseline tag",
  "Worktree setup",
  "Agent invocation procedure",
  "Transcript-format limitations",
  "Resolved-already confound",
  "Model + temperature defaults",
  "Output format",
  "Representative subset selection",
  "Selection bias disclosure",
  "Methodology validation",
  "Handoff to the future eval plan",
];

const checks = [];

function record(name, ok, detail) {
  checks.push({ name, ok, detail });
}

function header(s) {
  console.log(`\n${BOLD}${BLUE}${s}${RESET}`);
}

function pass(s) {
  console.log(`  ${GREEN}✓${RESET} ${s}`);
}

function fail(s) {
  console.log(`  ${RED}✗${RESET} ${s}`);
}

function info(s) {
  console.log(`  ${DIM}${s}${RESET}`);
}

function warn(s) {
  console.log(`  ${YELLOW}!${RESET} ${s}`);
}

function git(args) {
  return execSync(`git ${args}`, { cwd: ROOT, encoding: "utf8" }).trim();
}

function tryGit(args) {
  try {
    return git(args);
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Check 1: eval-baseline-current tag exists at the expected pre-plan commit
// AND git log eval-baseline-current..HEAD shows ALL Plan A + B commits.
// ---------------------------------------------------------------------------

function checkBaselineTag() {
  header("[1/5] eval-baseline-current tag");

  const tagSha = tryGit(`rev-list -n 1 ${TAG_NAME}`);
  if (!tagSha) {
    fail(`tag '${TAG_NAME}' not found locally; run \`git fetch --tags\``);
    record("tag exists", false, "tag missing");
    return;
  }
  pass(`tag '${TAG_NAME}' resolves to ${tagSha}`);

  if (tagSha !== EXPECTED_TAG_SHA) {
    fail(
      `tag SHA mismatch: expected ${EXPECTED_TAG_SHA} (recorded in docs/eval-baselines/README.md), got ${tagSha}`
    );
    info(
      "If the tag was re-created post-Phase 00, the baseline reference is contaminated."
    );
    record("tag SHA matches Phase 00 record", false, tagSha);
    return;
  }
  pass(`tag SHA matches Phase 00 recorded SHA`);

  // Check the tag has been pushed.
  const remoteTagLine = tryGit(`ls-remote --tags origin ${TAG_NAME}`);
  if (!remoteTagLine || !remoteTagLine.includes(tagSha)) {
    warn(
      `tag may not be pushed to origin (expected to find ${tagSha} in 'git ls-remote --tags origin ${TAG_NAME}')`
    );
    info(
      `Re-run: git push origin ${TAG_NAME} — the tag must survive a local repo loss.`
    );
  } else {
    pass(`tag pushed to origin`);
  }

  // git log eval-baseline-current..HEAD should be non-empty after Plan A + B land.
  const logRange = tryGit(`log --oneline ${TAG_NAME}..HEAD`);
  if (logRange === null) {
    fail(`could not run git log ${TAG_NAME}..HEAD`);
    record("Plan A+B commits between tag and HEAD", false);
    return;
  }
  const commitCount = logRange.length === 0 ? 0 : logRange.split("\n").length;
  if (commitCount === 0) {
    fail(
      `git log ${TAG_NAME}..HEAD is empty — no commits since Phase 00. Plan A + B haven't landed yet on this branch.`
    );
    info(`If Plan A+B were committed via Ship It in another window, run \`git pull\` first.`);
    record("Plan A+B commits between tag and HEAD", false, "0 commits");
    return;
  }
  pass(`${commitCount} commits between ${TAG_NAME}..HEAD (Plan A + B should be among them)`);
  info(`Most-recent commits in range:`);
  logRange
    .split("\n")
    .slice(0, 5)
    .forEach((line) => console.log(`    ${DIM}${line}${RESET}`));
  if (commitCount > 5) {
    info(`... and ${commitCount - 5} more`);
  }
  record("Plan A+B commits between tag and HEAD", true, `${commitCount} commits`);
}

// ---------------------------------------------------------------------------
// Check 2: docs/eval-task-corpus.md present with 12 tasks
// ---------------------------------------------------------------------------

function checkCorpus() {
  header("[2/5] docs/eval-task-corpus.md");

  const path = join(ROOT, "docs/eval-task-corpus.md");
  if (!existsSync(path)) {
    fail(`docs/eval-task-corpus.md not found`);
    record("corpus exists with 12 tasks", false);
    return;
  }
  pass(`file exists`);

  const text = readFileSync(path, "utf8");
  const taskMatches = text.match(/^- id: eval-T\d+$/gm) || [];
  if (taskMatches.length !== 12) {
    fail(`expected 12 task entries (lines matching '^- id: eval-T\\d+$'), found ${taskMatches.length}`);
    record("12 task entries", false, `${taskMatches.length}`);
    return;
  }
  pass(`12 task entries (T001..T012)`);

  // Pillar coverage.
  const pillars = { design: 0, engineering: 0, content: 0 };
  for (const m of text.matchAll(/^  pillar: (design|engineering|content)$/gm)) {
    pillars[m[1]]++;
  }
  let pillarOk = true;
  for (const [k, v] of Object.entries(pillars)) {
    if (v !== 4) {
      fail(`pillar '${k}' has ${v} tasks, expected 4`);
      pillarOk = false;
    }
  }
  if (pillarOk) pass(`4 design + 4 engineering + 4 content`);
  record("pillar mix 4/4/4", pillarOk);

  // Difficulty mix.
  const difficulty = { obvious: 0, subtle: 0 };
  for (const m of text.matchAll(/^  difficulty: (obvious|subtle)$/gm)) {
    difficulty[m[1]]++;
  }
  if (difficulty.obvious !== 6 || difficulty.subtle !== 6) {
    fail(`difficulty mix wrong: ${difficulty.obvious} obvious + ${difficulty.subtle} subtle (expected 6/6)`);
    record("difficulty mix 6/6", false);
  } else {
    pass(`6 obvious + 6 subtle`);
    record("difficulty mix 6/6", true);
  }

  // Prompt-leakage check — none of the prompts should mention forbidden terms.
  const forbidden = ["eval", "anti-pattern", "graph", "measurement"];
  const promptBlocks = [...text.matchAll(/^  prompt: \|\n((?:    .*\n)+)/gm)];
  const leaks = [];
  for (const block of promptBlocks) {
    const body = block[1].toLowerCase();
    for (const term of forbidden) {
      if (body.includes(term)) {
        const lineStart = text.slice(0, block.index).split("\n").length;
        leaks.push(`line ~${lineStart}: '${term}'`);
      }
    }
  }
  if (leaks.length > 0) {
    fail(`prompt-leakage check failed: forbidden term(s) appear in prompts`);
    leaks.forEach((l) => console.log(`    ${RED}${l}${RESET}`));
    record("prompt-leakage clean", false);
  } else {
    pass(`prompt-leakage clean (no 'eval' / 'anti-pattern' / 'graph' / 'measurement')`);
    record("prompt-leakage clean", true);
  }

  record("corpus exists with 12 tasks", true);
}

// ---------------------------------------------------------------------------
// Check 3: docs/eval-baselines/current/ has 9 baseline outputs + manifest.json
// ---------------------------------------------------------------------------

function checkBaselines() {
  header("[3/5] docs/eval-baselines/current/");

  const manifestPath = join(ROOT, "docs/eval-baselines/current/manifest.json");
  if (!existsSync(manifestPath)) {
    fail(`manifest.json not found at docs/eval-baselines/current/manifest.json`);
    record("manifest.json present", false);
    return;
  }
  pass(`manifest.json present`);

  let manifest;
  try {
    manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
  } catch (e) {
    fail(`manifest.json is not valid JSON: ${e.message}`);
    record("manifest.json valid JSON", false);
    return;
  }
  pass(`manifest.json is valid JSON (schema ${manifest.schema_version || "?"})`);

  if (manifest.commit_sha !== EXPECTED_TAG_SHA) {
    fail(
      `manifest.commit_sha (${manifest.commit_sha}) does not match expected ${EXPECTED_TAG_SHA}`
    );
    record("manifest commit_sha matches", false);
  } else {
    pass(`manifest.commit_sha matches eval-baseline-current SHA`);
    record("manifest commit_sha matches", true);
  }

  // Run files exist and frontmatter is plausibly filled in.
  let allRunsPresent = true;
  let allRunsCaptured = true;
  for (const rel of REQUIRED_RUN_FILES) {
    const p = join(ROOT, rel);
    if (!existsSync(p)) {
      fail(`missing: ${rel}`);
      allRunsPresent = false;
      continue;
    }
    const stat = statSync(p);
    if (stat.size < 200) {
      fail(`${rel} is suspiciously small (${stat.size} bytes) — likely empty template`);
      allRunsPresent = false;
      continue;
    }
    const content = readFileSync(p, "utf8");
    // Frontmatter completeness check: model and timestamp should be filled in.
    const frontmatterMatch = content.match(/^---\n([\s\S]+?)\n---/);
    if (!frontmatterMatch) {
      fail(`${rel} has no frontmatter`);
      allRunsPresent = false;
      continue;
    }
    const fm = frontmatterMatch[1];
    const modelLine = fm.match(/^model:\s*(.*)$/m);
    const timestampLine = fm.match(/^timestamp:\s*(.*)$/m);
    if (!modelLine || !modelLine[1].trim()) {
      warn(`${rel}: frontmatter \`model\` is empty (operator hasn't filled it in)`);
      allRunsCaptured = false;
    }
    if (!timestampLine || !timestampLine[1].trim()) {
      warn(`${rel}: frontmatter \`timestamp\` is empty (operator hasn't filled it in)`);
      allRunsCaptured = false;
    }
    // Body should have something past the frontmatter and the prompt block.
    const bodyAfterPrompt = content.split("## Agent transcript")[1] || "";
    // Strip HTML comments so an empty placeholder doesn't count.
    const bodyStripped = bodyAfterPrompt.replace(/<!--[\s\S]*?-->/g, "").trim();
    if (bodyStripped.length < 50) {
      warn(`${rel}: agent transcript section appears empty (operator hasn't pasted yet)`);
      allRunsCaptured = false;
    }
  }
  if (allRunsPresent) {
    pass(`all 9 run files present`);
    record("9 run files present", true);
  } else {
    record("9 run files present", false);
  }
  if (allRunsCaptured) {
    pass(`all 9 run files have populated frontmatter + transcripts`);
    record("9 runs captured", true);
  } else {
    info(`Pending: fill in \`model\` + \`timestamp\` in frontmatter and paste agent transcripts.`);
    record("9 runs captured", false);
  }

  // Manifest aggregate fields.
  if (!manifest.model) {
    warn(`manifest.model is null (set after baseline runs complete)`);
  } else {
    pass(`manifest.model = '${manifest.model}'`);
  }
  if (!manifest.captured_by) {
    warn(`manifest.captured_by is null (record operator name/handle)`);
  }
  if (!manifest.captured_window_start || !manifest.captured_window_end) {
    warn(`manifest.captured_window_start / _end is null (record ISO 8601 timestamps)`);
  }
}

// ---------------------------------------------------------------------------
// Check 4: docs/eval-baselines/README.md fully authored
// ---------------------------------------------------------------------------

function checkReadme() {
  header("[4/5] docs/eval-baselines/README.md");

  const path = join(ROOT, "docs/eval-baselines/README.md");
  if (!existsSync(path)) {
    fail(`README.md not found`);
    record("README authored", false);
    return;
  }
  const text = readFileSync(path, "utf8");
  const stat = statSync(path);
  if (stat.size < 1500) {
    fail(`README is too short (${stat.size} bytes) — likely still a Phase 00 stub`);
    record("README authored", false, `${stat.size} bytes`);
    return;
  }
  pass(`README is ${stat.size} bytes`);

  let allSections = true;
  for (const section of REQUIRED_README_SECTIONS) {
    if (!text.includes(section)) {
      fail(`README missing section: '${section}'`);
      allSections = false;
    }
  }
  if (allSections) {
    pass(`all required sections present`);
    record("README authored", true);
  } else {
    record("README authored", false);
  }

  if (!text.includes(EXPECTED_TAG_SHA)) {
    fail(`README does not record the Phase 00 SHA ${EXPECTED_TAG_SHA}`);
    record("README records Phase 00 SHA", false);
  } else {
    pass(`README records Phase 00 SHA`);
    record("README records Phase 00 SHA", true);
  }
}

// ---------------------------------------------------------------------------
// Check 5: 3 new node types declared in docs/knowledge-graph.md
// ---------------------------------------------------------------------------

function checkNodeTypes() {
  header("[5/5] docs/knowledge-graph.md node-type declarations");

  const path = join(ROOT, "docs/knowledge-graph.md");
  if (!existsSync(path)) {
    fail(`docs/knowledge-graph.md not found`);
    record("3 node types declared", false);
    return;
  }
  const text = readFileSync(path, "utf8");
  let allFound = true;
  for (const nt of REQUIRED_NODE_TYPES) {
    if (
      text.includes(`${nt}:`) ||
      text.includes(`\`${nt}\``) ||
      text.includes(`### ${nt}`) ||
      text.includes(`## ${nt}`) ||
      text.includes(`| ${nt} `)
    ) {
      pass(`'${nt}' declared`);
    } else {
      fail(`'${nt}' not declared in docs/knowledge-graph.md`);
      allFound = false;
    }
  }
  record("3 node types declared", allFound);
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

console.log(`${BOLD}Plan C Phase 11 — eval-handle final verification${RESET}`);
console.log(`${DIM}Repo root: ${ROOT}${RESET}`);

checkBaselineTag();
checkCorpus();
checkBaselines();
checkReadme();
checkNodeTypes();

header("Summary");
const failures = checks.filter((c) => !c.ok);
const passes = checks.filter((c) => c.ok);
for (const c of checks) {
  const sym = c.ok ? `${GREEN}✓${RESET}` : `${RED}✗${RESET}`;
  console.log(
    `  ${sym} ${c.name}${c.detail ? `  ${DIM}(${c.detail})${RESET}` : ""}`
  );
}
console.log();
if (failures.length === 0) {
  console.log(
    `${GREEN}${BOLD}All ${passes.length} checks passed.${RESET} Plan C is complete.`
  );
  process.exit(0);
} else {
  console.log(
    `${RED}${BOLD}${failures.length}/${checks.length} checks failed.${RESET} Address the above before marking Plan C complete.`
  );
  process.exit(1);
}
