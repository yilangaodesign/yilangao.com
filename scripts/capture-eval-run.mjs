#!/usr/bin/env node
/**
 * scripts/capture-eval-run.mjs
 *
 * Captures a baseline eval run from the worktree window's Cursor JSONL transcript
 * directly, instead of requiring the operator to use Cursor's Export Transcript
 * feature and copy-paste.
 *
 * Why this exists:
 *   - Cursor's Export Transcript collapses tool calls into invisible UI cards
 *     that don't survive export. The JSONL preserves them with full arguments.
 *   - The future LLM-as-judge's "tool calls to relevant context" metric relies
 *     on seeing which Read paths / Grep patterns / Shell commands the agent
 *     actually invoked. The export drops those; the JSONL preserves them.
 *   - Eliminates the operator round-trip: no Export Transcript click, no
 *     ~/Downloads/ save, no copy-paste. Operator just says "run T002-2 done"
 *     and this script captures + cleans the worktree.
 *
 * Limitation (unchanged from cursor-export-transcript format):
 *   - Tool RESULTS are not in the JSONL (file-read contents, grep matches,
 *     shell stdout). Only call args. The agent's narrative is the surrogate
 *     for what it actually saw.
 *
 * Usage:
 *   node scripts/capture-eval-run.mjs --task eval-T002 --run 2
 *   node scripts/capture-eval-run.mjs --task eval-T008 --run 1 --no-clean
 *   node scripts/capture-eval-run.mjs --task eval-T002 --run 1 --jsonl <uuid>
 *
 * Flags:
 *   --task <id>       eval-T002 | eval-T008 | eval-T011 (required)
 *   --run <n>         1 | 2 | 3 (required)
 *   --worktree <path> default: ~/eval/yilangao-current
 *   --jsonl <uuid>    explicit JSONL UUID; default: most-recently-modified
 *   --no-clean        skip the post-capture worktree reset
 *   --force           overwrite an already-captured run file
 *   --dry-run         print what would be written without touching disk
 */

import { execSync } from "node:child_process";
import {
  readFileSync,
  writeFileSync,
  readdirSync,
  statSync,
  existsSync,
} from "node:fs";
import { join, basename } from "node:path";
import { homedir } from "node:os";

// ---------------------------------------------------------------------------
// CLI args
// ---------------------------------------------------------------------------

const args = parseArgs(process.argv.slice(2));

if (!args.task || !args.run) {
  errorExit(
    "missing required flags. Usage: node scripts/capture-eval-run.mjs --task <eval-T002|eval-T008|eval-T011> --run <1|2|3>"
  );
}

const TASK_ID = args.task;
const RUN_N = Number(args.run);
const WORKTREE = args.worktree
  ? expandHome(args.worktree)
  : join(homedir(), "eval", "yilangao-current");
const FORCE = args.force === true;
const NO_CLEAN = args["no-clean"] === true;
const DRY_RUN = args["dry-run"] === true;
const EXPLICIT_JSONL = args.jsonl;

const REPO_ROOT = process.cwd();

// ---------------------------------------------------------------------------
// Locate the worktree's Cursor project transcripts directory
// ---------------------------------------------------------------------------

const WORKTREE_PROJECT_DIR = encodeCursorProjectName(WORKTREE);
const TRANSCRIPTS_DIR = join(
  homedir(),
  ".cursor",
  "projects",
  WORKTREE_PROJECT_DIR,
  "agent-transcripts"
);

if (!existsSync(TRANSCRIPTS_DIR)) {
  errorExit(
    `worktree transcripts directory not found: ${TRANSCRIPTS_DIR}\n` +
      `Has the worktree window been opened in Cursor at least once?`
  );
}

// ---------------------------------------------------------------------------
// Find target JSONL
// ---------------------------------------------------------------------------

const jsonlFiles = readdirSync(TRANSCRIPTS_DIR, { withFileTypes: true })
  .filter((d) => d.isDirectory())
  .map((d) => {
    const file = join(TRANSCRIPTS_DIR, d.name, `${d.name}.jsonl`);
    if (!existsSync(file)) return null;
    const stat = statSync(file);
    return { uuid: d.name, file, mtime: stat.mtime, size: stat.size };
  })
  .filter(Boolean);

if (jsonlFiles.length === 0) {
  errorExit(
    `no JSONL transcripts found in ${TRANSCRIPTS_DIR}.\nDid the agent actually run in the worktree window?`
  );
}

let target;
if (EXPLICIT_JSONL) {
  target = jsonlFiles.find((f) => f.uuid === EXPLICIT_JSONL);
  if (!target) {
    errorExit(
      `JSONL UUID '${EXPLICIT_JSONL}' not found in ${TRANSCRIPTS_DIR}.\n` +
        `Available: ${jsonlFiles.map((f) => f.uuid).join(", ")}`
    );
  }
} else {
  jsonlFiles.sort((a, b) => b.mtime - a.mtime);
  target = jsonlFiles[0];
}

// ---------------------------------------------------------------------------
// Parse JSONL + validate prompt matches corpus
// ---------------------------------------------------------------------------

const corpusPrompt = readCorpusPrompt(TASK_ID);
if (!corpusPrompt) {
  errorExit(
    `task '${TASK_ID}' not found in docs/eval-task-corpus.md or has no prompt field`
  );
}

const events = readJsonl(target.file);
const userEvent = events.find((e) => e.role === "user");
if (!userEvent) {
  errorExit(`no user message in ${target.file}`);
}

const userText = extractUserText(userEvent);
if (!userText) {
  errorExit(`could not extract user prompt text from ${target.file}`);
}

const stripped = stripCursorWrapper(userText);
const promptMatches = normalizeForComparison(stripped) === normalizeForComparison(corpusPrompt);

if (!promptMatches) {
  console.error("\x1b[31mPROMPT MISMATCH\x1b[0m");
  console.error("");
  console.error("Expected (from corpus):");
  console.error("---");
  console.error(corpusPrompt);
  console.error("---");
  console.error("Got (from JSONL first user message, after stripping wrapper):");
  console.error("---");
  console.error(stripped);
  console.error("---");
  console.error("");
  errorExit(
    `the JSONL at ${target.uuid} does NOT contain the prompt for ${TASK_ID}.\n` +
      `Either you ran the wrong prompt, or you're capturing an older JSONL.\n` +
      `If this is intentional, pass --jsonl <uuid> to override the latest-mtime selection.`
  );
}

// ---------------------------------------------------------------------------
// Render markdown body
// ---------------------------------------------------------------------------

const renderedBody = renderTranscript({
  events,
  prompt: stripped,
  worktreePathPrefix: WORKTREE,
});

const captureTimestamp = target.mtime.toISOString().replace(/\.\d+Z$/, "");
// Use the worktree timezone offset by reading the system, but ISO with Z is fine for the manifest.
// For the human-readable header below we render the local-equivalent below.

// ---------------------------------------------------------------------------
// Build the run file content
// ---------------------------------------------------------------------------

const runFilePath = join(
  REPO_ROOT,
  "docs",
  "eval-baselines",
  "current",
  TASK_ID,
  `run-${RUN_N}.md`
);

if (!existsSync(runFilePath)) {
  errorExit(
    `run file template not found: ${runFilePath}\n` +
      `Was the template created during Plan C Phase 10? Check the manifest's tasks[].runs[] entries.`
  );
}

const existingRunContent = readFileSync(runFilePath, "utf8");
const existingFrontmatter = parseFrontmatter(existingRunContent);

if (
  existingFrontmatter.timestamp &&
  existingFrontmatter.timestamp.trim() !== "" &&
  !FORCE
) {
  errorExit(
    `run file ${runFilePath} already has timestamp '${existingFrontmatter.timestamp}'.\n` +
      `It looks already-captured. Pass --force to overwrite.`
  );
}

const expectedCitation =
  existingFrontmatter.expected_citation || corpusExpectedCitation(TASK_ID);
const pillar = existingFrontmatter.pillar || corpusPillar(TASK_ID);
const difficulty = existingFrontmatter.difficulty || "subtle";
const sourceAnchor = existingFrontmatter.source || corpusSourceAnchor(TASK_ID);

const newFrontmatter = renderFrontmatter({
  task_id: TASK_ID,
  run_number: RUN_N,
  arm: "current",
  commit_sha: "56f876024fc95591b95f0f181686ba4dda0ac03f",
  worktree_path: shrinkHomePath(WORKTREE),
  model: existingFrontmatter.model || "claude-opus-4.6",
  temperature: 0.3,
  timestamp: captureTimestamp + "Z",
  cursor_window_path: WORKTREE,
  cursor_version: existingFrontmatter.cursor_version || "3.1.15",
  transcript_format: "cursor-jsonl",
  transcript_source_uuid: target.uuid,
  transcript_source_size_bytes: target.size,
  expected_citation: expectedCitation,
  pillar,
  difficulty,
  source: sourceAnchor,
});

const finalContent = `${newFrontmatter}

## Prompt (paste verbatim into a fresh Cursor chat opened on \`~/eval/yilangao-current\`)

\`\`\`
${corpusPrompt.trimEnd()}
\`\`\`

## Agent transcript

<!--
Captured from Cursor JSONL transcript (cursor-jsonl format) by
scripts/capture-eval-run.mjs. Source: ${target.uuid}.jsonl
(${target.size.toLocaleString()} bytes, mtime ${captureTimestamp}Z).

Format choice rationale: see docs/eval-baselines/README.md
\`Transcript-format limitations\` section.

Tool RESULTS (file contents read, grep matches, shell stdout) are NOT in
the JSONL — only tool call args. The agent's narrative serves as the
surrogate for what it actually saw.
-->

${renderedBody}

## Capture notes

<!--
Optional. Anything the operator noticed during the run that isn't part of
the agent's output: e.g. the chat ran out of context and was truncated;
the model returned an error and was retried; a tool call timed out.
-->
`;

// ---------------------------------------------------------------------------
// Write run file + update manifest + clean worktree
// ---------------------------------------------------------------------------

if (DRY_RUN) {
  console.log(`\x1b[33m[dry-run]\x1b[0m would write ${runFilePath}`);
  console.log(`\x1b[33m[dry-run]\x1b[0m JSONL source: ${target.uuid}`);
  console.log(`\x1b[33m[dry-run]\x1b[0m would update manifest run ${TASK_ID}#${RUN_N}`);
  if (!NO_CLEAN) {
    console.log(`\x1b[33m[dry-run]\x1b[0m would clean worktree at ${WORKTREE}`);
  }
  console.log(`\nFirst 600 chars of rendered body:\n${renderedBody.slice(0, 600)}\n...`);
  process.exit(0);
}

writeFileSync(runFilePath, finalContent, "utf8");
console.log(`\x1b[32mwrote\x1b[0m ${runFilePath} (${finalContent.length.toLocaleString()} bytes)`);

updateManifest(TASK_ID, RUN_N, captureTimestamp + "Z", target.uuid);
console.log(`\x1b[32mmanifest updated\x1b[0m: ${TASK_ID} run ${RUN_N} marked captured`);

if (!NO_CLEAN) {
  const cleaned = cleanWorktree(WORKTREE);
  if (cleaned.ok) {
    console.log(`\x1b[32mworktree clean\x1b[0m: ${WORKTREE}`);
    if (cleaned.summary) {
      cleaned.summary.split("\n").filter(Boolean).forEach((line) => {
        console.log(`  \x1b[2m${line}\x1b[0m`);
      });
    }
  } else {
    console.log(`\x1b[33mworktree cleanup warning\x1b[0m: ${cleaned.error}`);
  }
}

console.log(
  `\n\x1b[32mready for next run.\x1b[0m Tell the worktree-window agent the next prompt.`
);

// ===========================================================================
// helpers
// ===========================================================================

function parseArgs(argv) {
  const out = {};
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (!arg.startsWith("--")) continue;
    const key = arg.slice(2);
    const next = argv[i + 1];
    if (!next || next.startsWith("--")) {
      out[key] = true;
    } else {
      out[key] = next;
      i++;
    }
  }
  return out;
}

function expandHome(p) {
  if (p.startsWith("~/")) return join(homedir(), p.slice(2));
  if (p === "~") return homedir();
  return p;
}

function shrinkHomePath(p) {
  const home = homedir();
  if (p === home) return "~";
  if (p.startsWith(home + "/")) return "~/" + p.slice(home.length + 1);
  return p;
}

function encodeCursorProjectName(absPath) {
  // /Users/yilangao/eval/yilangao-current -> Users-yilangao-eval-yilangao-current
  return absPath.replace(/^\/+/, "").replace(/\//g, "-");
}

function readJsonl(path) {
  const text = readFileSync(path, "utf8");
  const lines = text.split("\n").filter((l) => l.trim() !== "");
  const events = [];
  for (let i = 0; i < lines.length; i++) {
    try {
      events.push(JSON.parse(lines[i]));
    } catch (e) {
      console.error(
        `\x1b[33mwarn:\x1b[0m skipped malformed JSONL line ${i + 1}: ${e.message}`
      );
    }
  }
  return events;
}

function extractUserText(userEvent) {
  const content = userEvent?.message?.content;
  if (!Array.isArray(content)) return null;
  return content
    .filter((c) => c.type === "text")
    .map((c) => c.text)
    .join("\n");
}

function stripCursorWrapper(s) {
  // Cursor wraps the prompt in <timestamp>...</timestamp>\n<user_query>...</user_query>
  let out = s;
  out = out.replace(/<timestamp>[\s\S]*?<\/timestamp>\s*\n?/g, "");
  const m = out.match(/<user_query>\s*\n?([\s\S]*?)\n?<\/user_query>/);
  if (m) out = m[1];
  return out.trim();
}

function normalizeForComparison(s) {
  return s
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

function readCorpusPrompt(taskId) {
  const corpusPath = join(REPO_ROOT, "docs", "eval-task-corpus.md");
  if (!existsSync(corpusPath)) return null;
  const text = readFileSync(corpusPath, "utf8");
  const block = extractTaskBlock(text, taskId);
  if (!block) return null;
  return extractYamlBlockScalar(block, "prompt");
}

function corpusExpectedCitation(taskId) {
  const corpusPath = join(REPO_ROOT, "docs", "eval-task-corpus.md");
  const text = readFileSync(corpusPath, "utf8");
  const block = extractTaskBlock(text, taskId);
  if (!block) return null;
  const m = block.match(/^\s*expected_citation:\s*(\S+)/m);
  return m ? m[1].trim() : null;
}

function corpusPillar(taskId) {
  const corpusPath = join(REPO_ROOT, "docs", "eval-task-corpus.md");
  const text = readFileSync(corpusPath, "utf8");
  const block = extractTaskBlock(text, taskId);
  if (!block) return null;
  const m = block.match(/^\s*pillar:\s*(\S+)/m);
  return m ? m[1].trim() : null;
}

function corpusSourceAnchor(taskId) {
  const corpusPath = join(REPO_ROOT, "docs", "eval-task-corpus.md");
  const text = readFileSync(corpusPath, "utf8");
  const block = extractTaskBlock(text, taskId);
  if (!block) return null;
  const m = block.match(/^\s*source_anchor:\s*"?([^"\n]+)"?\s*$/m);
  return m ? `"${m[1].trim()}"` : null;
}

function extractTaskBlock(corpusText, taskId) {
  const re = new RegExp(`(^|\\n)- id: ${escapeRe(taskId)}\\b`, "m");
  const match = corpusText.match(re);
  if (!match) return null;
  const start = match.index + match[1].length;
  const rest = corpusText.slice(start);
  const nextTaskMatch = rest.match(/\n- id: eval-T\d+/);
  const blockEnd = nextTaskMatch ? nextTaskMatch.index : rest.length;
  return rest.slice(0, blockEnd);
}

function extractYamlBlockScalar(block, fieldName) {
  const re = new RegExp(`^\\s*${escapeRe(fieldName)}: \\|\\s*\\n([\\s\\S]+?)(?=^\\s*[a-z_]+:\\s|\\Z)`, "m");
  const m = block.match(re);
  if (!m) return null;
  // Strip the consistent leading indent (4 spaces in this corpus).
  const lines = m[1].split("\n");
  const indents = lines
    .filter((l) => l.trim() !== "")
    .map((l) => l.match(/^( *)/)[1].length);
  const minIndent = indents.length ? Math.min(...indents) : 0;
  return lines
    .map((l) => l.slice(minIndent))
    .join("\n")
    .trimEnd();
}

function escapeRe(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function parseFrontmatter(content) {
  const m = content.match(/^---\n([\s\S]+?)\n---/);
  if (!m) return {};
  const fm = {};
  for (const line of m[1].split("\n")) {
    const kv = line.match(/^([a-z_]+):\s*(.*)$/);
    if (kv) fm[kv[1]] = kv[2];
  }
  return fm;
}

function renderFrontmatter(fields) {
  const lines = ["---"];
  for (const [k, v] of Object.entries(fields)) {
    if (v === null || v === undefined || v === "") continue;
    lines.push(`${k}: ${v}`);
  }
  lines.push("---");
  return lines.join("\n");
}

function renderTranscript({ events, prompt, worktreePathPrefix }) {
  const out = [];
  out.push(`**User**`);
  out.push("");
  out.push(prompt.trim());
  out.push("");
  out.push("---");
  out.push("");
  out.push(`**Cursor**`);
  out.push("");

  let firstAssistant = true;
  for (const ev of events) {
    if (ev.role !== "assistant") continue;
    const content = ev?.message?.content;
    if (!Array.isArray(content)) continue;

    if (!firstAssistant) {
      // Separate distinct assistant turns with a blank line for readability.
      out.push("");
    }
    firstAssistant = false;

    for (const block of content) {
      if (block.type === "text") {
        out.push(block.text);
        out.push("");
      } else if (block.type === "tool_use") {
        out.push(renderToolCall(block, worktreePathPrefix));
      }
    }
  }

  return out.join("\n").replace(/\n{3,}/g, "\n\n").trimEnd();
}

function renderToolCall(block, worktreePathPrefix) {
  const name = block.name || "Tool";
  const input = block.input || {};
  const renderedInput = renderToolInput(name, input, worktreePathPrefix);
  return `> **${name}** ${renderedInput}`;
}

function renderToolInput(name, input, worktreePathPrefix) {
  switch (name) {
    case "Read": {
      const p = stripWorktree(input.path, worktreePathPrefix);
      const range = input.offset
        ? ` (offset: ${input.offset}${input.limit ? `, limit: ${input.limit}` : ""})`
        : input.limit
          ? ` (limit: ${input.limit})`
          : "";
      return `\`${p}\`${range}`;
    }
    case "Glob": {
      return `pattern: \`${input.glob_pattern}\`${input.target_directory ? ` (dir: \`${stripWorktree(input.target_directory, worktreePathPrefix)}\`)` : ""}`;
    }
    case "Grep": {
      const p = input.path
        ? ` in \`${stripWorktree(input.path, worktreePathPrefix)}\``
        : "";
      const glob = input.glob ? ` glob=\`${input.glob}\`` : "";
      const mode = input.output_mode ? ` mode=${input.output_mode}` : "";
      const ctx = [];
      if (input["-A"] != null) ctx.push(`-A ${input["-A"]}`);
      if (input["-B"] != null) ctx.push(`-B ${input["-B"]}`);
      if (input["-C"] != null) ctx.push(`-C ${input["-C"]}`);
      const ctxStr = ctx.length ? ` ctx=${ctx.join(",")}` : "";
      return `\`${input.pattern}\`${p}${glob}${mode}${ctxStr}`;
    }
    case "Shell": {
      const cmd = (input.command || "")
        .replace(/^cd\s+\/Users\/yilangao\/eval\/yilangao-current\s*&&\s*/, "");
      const desc = input.description ? ` _(${input.description})_` : "";
      return `\`${truncate(cmd, 140)}\`${desc}`;
    }
    case "Edit":
    case "Write":
    case "StrReplace": {
      return `\`${stripWorktree(input.path || input.file_path, worktreePathPrefix)}\``;
    }
    case "TodoWrite":
      return `(${(input.todos || []).length} items, merge=${input.merge ?? false})`;
    case "Task":
      return `${input.subagent_type || "?"}: \`${truncate(input.description || "", 80)}\``;
    default: {
      // Generic dump.
      const summary = JSON.stringify(input);
      return `\`${truncate(summary, 200)}\``;
    }
  }
}

function stripWorktree(p, worktreePathPrefix) {
  if (typeof p !== "string") return String(p);
  const prefix = worktreePathPrefix.replace(/\/$/, "") + "/";
  if (p.startsWith(prefix)) return p.slice(prefix.length);
  return p;
}

function truncate(s, n) {
  if (s.length <= n) return s;
  return s.slice(0, n - 1) + "…";
}

function updateManifest(taskId, runNumber, capturedAt, sourceUuid) {
  const manifestPath = join(
    REPO_ROOT,
    "docs",
    "eval-baselines",
    "current",
    "manifest.json"
  );
  const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
  const task = manifest.tasks.find((t) => t.task_id === taskId);
  if (!task) {
    console.error(`\x1b[33mwarn:\x1b[0m task '${taskId}' not in manifest; skipping update`);
    return;
  }
  const run = task.runs.find((r) => r.run_number === runNumber);
  if (!run) {
    console.error(`\x1b[33mwarn:\x1b[0m run ${runNumber} of '${taskId}' not in manifest`);
    return;
  }
  run.captured = true;
  run.captured_at = capturedAt;
  run.transcript_source_uuid = sourceUuid;

  // Track earliest captured_window_start; capture _end is finalized later.
  if (
    !manifest.captured_window_start ||
    capturedAt < manifest.captured_window_start
  ) {
    manifest.captured_window_start = capturedAt;
  }
  manifest.captured_window_end = capturedAt;

  // Recompute aggregate captured count for convenience.
  const total = manifest.tasks.reduce((acc, t) => acc + t.runs.length, 0);
  const done = manifest.tasks.reduce(
    (acc, t) => acc + t.runs.filter((r) => r.captured).length,
    0
  );
  manifest.runs_captured = `${done}/${total}`;

  writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + "\n", "utf8");
}

function cleanWorktree(worktreePath) {
  try {
    const restoreOut = execSync("git restore .", {
      cwd: worktreePath,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
    });
    const cleanOut = execSync("git clean -fd", {
      cwd: worktreePath,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
    });
    const status = execSync("git status --porcelain", {
      cwd: worktreePath,
      encoding: "utf8",
    }).trim();
    return {
      ok: true,
      summary:
        (restoreOut || "") +
        (cleanOut || "") +
        (status === ""
          ? "git status: clean"
          : `git status:\n${status}`),
    };
  } catch (e) {
    return { ok: false, error: e.message };
  }
}

function errorExit(msg) {
  console.error(`\x1b[31merror:\x1b[0m ${msg}`);
  process.exit(1);
}
