---
type: eval-baseline
id: eval-baselines
topics: [eval, knowledge-graph]
derivedFrom:
  - docs/initiatives/docs-knowledge-graph-initiative.md
references:
  - docs/eval-task-corpus.md
  - docs/eval-pre-registration.md
---

# Eval baselines

> **Purpose**: capture pre-initiative agent outputs against the frozen documentation system at `eval-baseline-current` so a future A/B evaluation plan can compare agent generation outcomes between the pre-graph "current structure" and the post-initiative "new structure."
>
> **Status**: Phase 10 of the Docs Knowledge Graph Initiative — methodology validation only. The 9-run subset captured here is NOT part of the eval dataset. The future eval plan runs N=5×12 = 60 invocations per arm against this same procedure for the actual measurement.
>
> **Source plan**: [`.cursor/plans/docs_kg_eval_handle_c7e2a5f9.plan.md`](../../.cursor/plans/docs_kg_eval_handle_c7e2a5f9.plan.md). Coordinator: [`docs/initiatives/docs-knowledge-graph-initiative.md`](../initiatives/docs-knowledge-graph-initiative.md). Companion file: [`docs/eval-task-corpus.md`](../eval-task-corpus.md).

## Phase 00 baseline tag (frozen reference)

| Field | Value |
|---|---|
| **Tag** | `eval-baseline-current` |
| **Commit SHA** | `56f876024fc95591b95f0f181686ba4dda0ac03f` |
| **Branch at tag time** | `dev` |
| **Tag created (ISO 8601)** | `2026-04-25T23:44:43-04:00` |
| **Pushed to origin** | yes |
| **HEAD commit message at tag time** | `docs: post-release audit for REL-028 (Élan 2.13.3)` |

### Working-tree note at tag time

Phase 00's strict precondition required `git status --porcelain` to be empty. At tag time, two unrelated files had uncommitted modifications: `docs/engineering.md` (frequency map row removal) and `docs/release-log.md` (REL-028 entry removal). These were the user's in-progress revert work, semantically unrelated to the Docs Knowledge Graph Initiative. The tag references the HEAD commit — git tags do not capture working-tree state — so the eval baseline correctness is unaffected. Documented in the coordinator's lessons-learned log as a precondition relaxation.

## Worktree setup

The baseline runs MUST execute against a checkout pinned to `eval-baseline-current`, not the live `dev` branch (the live branch contains Plan A + Plan B changes that contaminate the "current structure" reference).

```bash
mkdir -p ~/eval
git worktree add ~/eval/yilangao-current eval-baseline-current
cd ~/eval/yilangao-current
git log --oneline -1
# Expected: 56f8760 docs: post-release audit for REL-028 (Élan 2.13.3)
git rev-parse HEAD
# Expected: 56f876024fc95591b95f0f181686ba4dda0ac03f
```

**Path convention.** `~/eval/...` is the documented default. Operators may relocate to any path outside the main repo (e.g. `/Volumes/work/eval/yilangao-current`) provided they update the absolute path here and in `current/manifest.json`. The relocated path MUST stay outside the main checkout to avoid Cursor accidentally indexing the worktree as part of the main project.

**Cleanup (after the eval is complete).** From the main checkout:

```bash
git worktree remove ~/eval/yilangao-current
git worktree prune
```

The tag `eval-baseline-current` itself stays on origin permanently — the future eval plan can re-create the worktree from it.

## Agent invocation procedure

For each run, follow this exact sequence:

1. **Open Cursor at the worktree root** (one-time, per session). From a fresh Cursor window: `File → Open Folder → ~/eval/yilangao-current`. Critical — opening the main checkout pollutes the agent's context with post-initiative documentation. Verify the workspace path in Cursor's title bar before continuing.
2. **Start a fresh chat.** Do not resume an existing chat. The agent's context must be clean per run.
3. **Select the model.** Match the model + temperature defaults below. Confirm in Cursor's model selector before sending the prompt.
4. **Paste the task `prompt` verbatim.** Copy the `prompt` field from the corresponding YAML block in [`docs/eval-task-corpus.md`](../eval-task-corpus.md). Do NOT add framing, "this is a test", "please show your work", or any other meta instruction. The prompt must look like a normal feedback request.
5. **Wait for the agent to finish.** When the agent stops responding, the run is complete. Do nothing in the chat — no follow-up questions, no thanks, no edits. The next run is captured by leaving the chat alone.
6. **Notify the main-window agent.** From the main Cursor window (this repo at `~/Desktop/Job Application/Vibe Coding/yilangao.com`), tell the main agent which run just finished (e.g. `done with T002 run 2`). The main agent runs:

    ```bash
    node scripts/capture-eval-run.mjs --task eval-T0XX --run N
    ```

    The script reads the worktree's Cursor JSONL transcript directly (`~/.cursor/projects/Users-yilangao-eval-yilangao-current/agent-transcripts/<latest>.jsonl`), validates that the JSONL's first user prompt matches the corpus prompt for the task, renders the transcript into `current/<task-id>/run-<n>.md` with full frontmatter, marks the run captured in `manifest.json`, and runs `git restore . && git clean -fd` in the worktree to reset for the next run. No copy-paste, no "Export Transcript", no manual frontmatter editing.

7. **Repeat for the next run.** Same chat-window if it's still pristine, but a fresh chat per run is safer (the script's prompt-validation guards against accidentally capturing the wrong JSONL by selecting the most-recently-modified file by default — a fresh chat per run keeps that selection unambiguous).

The script's safety checks: refuses to overwrite an already-captured run unless `--force` is passed, refuses to capture if the JSONL's prompt doesn't match the corpus prompt for the named task, and reports git status after the cleanup so the operator can see the worktree is back to a clean reference state.

### Transcript-format limitations

The `cursor-jsonl` format is the canonical evidence format for the 9-run smoke test. The capture script reads Cursor's internal per-chat JSONL transcripts directly (one event per line, structured user/assistant messages with embedded tool_use blocks). This is **strictly more useful** than Cursor's built-in `Export Transcript` feature, which collapses tool calls into UI cards that are dropped on export. The JSONL preserves every `Read` path, `Grep` pattern, `Glob` pattern, `Shell` command, and `Edit`/`Write`/`StrReplace` target with full arguments.

What the JSONL does **not** preserve (limitation shared with the export):

- **Tool RESULTS** — file-read contents, grep matches, shell stdout, `git log` output. Cursor stores tool call args but not their outputs in the per-chat JSONL. The agent's narrative ("git log shows commit X made the change") serves as the surrogate for what it actually saw.
- **Model name** and **Cursor version** are not embedded in the JSONL events. The capture script fills these from the run-file's pre-existing frontmatter (which the manifest's `model` default seeds).

This is acceptable for the smoke test because:
1. Tool call args are sufficient for grading the "tool calls to relevant context" metric on the 9 runs (we can see the agent Read `Input.module.scss`, `_borders.scss`, `design-anti-patterns.md` — all relevant).
2. The agent's narrative + final response reports its actual findings, sufficient for AP citation grading.
3. The future N=5×12 eval will capture results in addition to args via a deterministic harness (`scripts/eval-runner.mjs`), which is out of scope for Plan C.

The future LLM-as-judge prompt should account for this: when grading on smoke-test transcripts, treat the agent's narrative claims about what it found as evidence supplementing the captured tool call args.

### Resolved-already confound (T002 specifically; possible on others)

A subset of the corpus prompts derive from feedback entries whose **gold resolution committed BEFORE** the `eval-baseline-current` tag (e.g. T002 — FB-163 → commit `35225d3` on 2026-04-22, two days before the tag). In these cases the agent in the baseline state finds the fix already applied and cannot reproduce it from scratch. The agent's correct response is to recognize the prior fix and verify it (commit history + token resolution + AP citation), not to re-implement.

The future LLM-as-judge prompt should grade "verified prior resolution" as a positive signal on these tasks. See `docs/eval-baselines/current/eval-T002/run-1.md` "Capture notes" section for a worked example.

## Model + temperature defaults

| Field | Value |
|---|---|
| **Model** | record the exact slug used (e.g. `claude-opus-4.7`, `gpt-5.4`, etc.) — the future eval plan reads this from the manifest to decide whether the new arm uses the same model |
| **Temperature** | `0.3` (low but non-zero — `0` is unrepresentative of real agent use) |
| **Top-p / penalties** | leave at Cursor defaults; record any deviation in run frontmatter |
| **Tool access** | full Cursor agent toolset (Read, Glob, Grep, Edit, Write, Shell). Do NOT restrict — the agent is supposed to forage for context exactly as it would in a normal session |
| **MCP servers** | leave enabled; the eval is testing the documentation system in its real configuration |

**Why temperature 0.3, not 0.** Zero-temperature runs give the same output every time and are not representative of how the agent behaves during real user interactions. 0.3 keeps determinism high enough that 3 runs of the same task converge on similar outputs while still exposing variance. The future eval plan's N=5 per task per arm is sized for this temperature.

## Output format

```
docs/eval-baselines/current/
├── manifest.json
├── eval-T002/                  ← design pillar — subtle — FB-163 → AP-054
│   ├── run-1.md
│   ├── run-2.md
│   └── run-3.md
├── eval-T008/                  ← engineering pillar — subtle — ENG-156 → EAP-094
│   ├── run-1.md
│   ├── run-2.md
│   └── run-3.md
└── eval-T011/                  ← content pillar — subtle — CFB-034 → CAP-029
    ├── run-1.md
    ├── run-2.md
    └── run-3.md
```

Each `run-<n>.md` file has frontmatter pre-filled with `task_id`, `run_number`, `commit_sha`, and the verbatim prompt copy of the task. The operator fills in `model`, `temperature`, `timestamp`, `cursor_window_path`, and pastes the agent transcript below the frontmatter.

## Representative subset selection (3 tasks × 3 runs)

The 9-run subset deliberately covers **one subtle task per pillar**. Subtle tasks are where the typed knowledge graph is most likely to provide signal — they require connecting a complaint to a non-obvious AP via cross-references. Obvious tasks are reserved for the future eval plan's N=5 runs against the full 12-task corpus; running them at N=3 in the smoke-test would not validate methodology any harder.

| Run subset | Task | Pillar | Difficulty | Source | Cited AP | Why high signal |
|---|---|---|---|---|---|---|
| `eval-T002/` | T002 | design | subtle | FB-163 | AP-054 | Fourth complaint in a session — agent must invoke architectural-review guardrail rather than patching values. Tests recognition of "AP-054 constrains state-to-state change, not absolute value" — the cross-reference Plan B's tagging surfaces. |
| `eval-T008/` | T008 | engineering | subtle | ENG-156 | EAP-094 | User asks "what did you actually verify?" rather than describing a bug. Tests EAP-094 (trusting summary over filesystem) AND Hard Guardrail Engineering #10 (verify against distinctive string, not generic markers). |
| `eval-T011/` | T011 | content | subtle | CFB-034 | CAP-029 | Symptom is voice complaint; cause is structural (parallel-structure encyclopedia). Tests distinguishing CAP-029 (structural AI failure mode) from CAP-017 (vocabulary AI voice tells) — exactly the cross-reference depth Plan B's tagging adds. |

## Selection bias disclosure

> **The 6 graph-required (subtle) tasks in the corpus deliberately favor the post-initiative arm** — by construction, they require the kind of typed cross-reference traversal that the Docs Knowledge Graph Initiative builds. The 9-run subset captured here is drawn entirely from those subtle tasks. The future eval plan should apply a discount when interpreting effect size on subtle tasks.
>
> The 6 obvious tasks act as a control: if the post-initiative arm doesn't beat baseline on subtle tasks AND the obvious tasks show no regression, the initiative is null. If the post-initiative arm beats baseline on obvious tasks too (where the connection is a single grep), that's an unexpected positive signal worth investigating.
>
> This disclosure is duplicated from [`docs/eval-task-corpus.md`](../eval-task-corpus.md) so it remains visible to the eval-plan operator independently of the corpus file.

## Methodology validation, not measurement

The 9-run subset is a methodology smoke test, not a statistically valid measurement. Statistical signal comes from the future eval plan's N=5×12 = 60 invocations per arm. Future readers should not over-interpret the 9 outputs as evidence for or against the initiative.

What the 9 runs DO validate:
- The worktree procedure produces a clean documentation state.
- The corpus prompts elicit on-topic agent behavior (no leakage of "this is an eval").
- The capture format is rich enough to be re-graded by a future LLM-as-judge harness.
- The manifest schema captures every metadata field a future scaling run needs.

What they do NOT establish:
- Whether the initiative improves AP citation rate (need N=5×12 per arm minimum).
- Whether effect sizes are statistically significant (need paired-difference tests).
- Whether judge-human agreement is calibrated (need human spot-check on a sample).

## Verification (Plan C Phase 11 closer)

After the 9 baseline runs are captured AND Plan A + Plan B are merged into `dev`, run from the main checkout (NOT the worktree):

```bash
node scripts/verify-eval-handle.mjs
```

The script runs the 5 Phase 11 checks:

1. `eval-baseline-current` tag exists at the recorded SHA, is pushed to origin, and `git log eval-baseline-current..HEAD` shows the Plan A + B commits.
2. `docs/eval-task-corpus.md` has 12 tasks with the 4/4/4 pillar mix, 6/6 obvious/subtle mix, and is prompt-leakage clean.
3. `docs/eval-baselines/current/` contains the 9 baseline run files with populated frontmatter (`model`, `timestamp`) and non-empty transcripts, plus a valid `manifest.json` whose `commit_sha` matches the tag.
4. `docs/eval-baselines/README.md` is fully authored (all required sections + Phase 00 SHA recorded).
5. `docs/knowledge-graph.md` declares the `eval-task-corpus`, `eval-baseline`, and `alias` node types.

Exit code is `0` when all checks pass; `1` otherwise. The script is safe to re-run — it reads-only, it doesn't modify any files.

**Common partial states** (expected during the workflow):

| Failure | What it means | Next action |
|---|---|---|
| `git log eval-baseline-current..HEAD` empty | Plan A + B haven't committed to `dev` yet (they're being shipped in another window) | Wait for the Ship It session to finish, then `git pull` and re-run |
| Run files present but transcripts empty | Operator hasn't run `scripts/capture-eval-run.mjs` for that run yet | Tell the main-window agent which run finished; it captures + cleans the worktree automatically |
| `manifest.json` has runs with `captured: false` | Some baseline runs not yet captured | Continue capturing per the agent invocation procedure; the script flips each run to `captured: true` and updates `runs_captured` |
| Manifest `captured_by` is `null` | Aggregate field not filled in (set once at the end) | After all 9 runs report `captured: true`, set `captured_by` to the operator name in `docs/eval-baselines/current/manifest.json` |

When the script reports `All checks passed`, mark the `phase11-eval-verify` todo complete in the plan.

## Handoff to the future eval plan

When the eval plan starts, it inherits:

1. **The frozen tag.** `eval-baseline-current` is on origin and references the pre-initiative HEAD.
2. **The 12-task corpus.** [`docs/eval-task-corpus.md`](../eval-task-corpus.md) — frozen, do not edit.
3. **This procedure.** Worktree setup + agent invocation + output format.
4. **The smoke-test artifacts.** The 9 runs in `current/<task-id>/run-<n>.md` — useful for prompt sanity-checking but NOT part of the dataset.

The eval plan's responsibilities (out of scope for Plan C):
1. Build `scripts/eval-runner.mjs` (deterministic harness reading the corpus).
2. Scale baseline to N=5×12 = 60 invocations against the worktree (the smoke-test is not part of the dataset).
3. Run the matching N=5×12 = 60 invocations against post-initiative `main` (the "new" arm).
4. Design hybrid grading (LLM-as-judge with 20% human spot-check calibration) covering 5 metrics: AP citation rate, adherence rate, tool calls to relevant context, total tokens, blind quality 1–5.
5. Calibrate judge ↔ human agreement on a sample before scaling.
6. Aggregate statistics (effect size + variance per metric, paired-difference test).
7. Write up findings as `docs/eval-results.md`.

Effort estimate for the future eval plan: ~34–40h. Blockers to flag in advance: model version drift across the eval window (run all 120 invocations in one session), token cost for the 120+ agent runs + grading runs, human grader time (~12–25h subsumed in the estimate).

### Amendment (2026-04-28): Self-Automated KG A/B Evaluation

The eval plan has been authored as [`.cursor/plans/self-automated_kg_a_b_eval_a49a67c6.plan.md`](../../.cursor/plans/self-automated_kg_a_b_eval_a49a67c6.plan.md). Pre-registration at [`docs/eval-pre-registration.md`](../eval-pre-registration.md).

**N=5 to N=10 override:** The plan increases sample size from N=5 (specified above) to N=10 repetitions per task per arm. Justification: the original N=5 was sized for a human-graded protocol where each run cost ~20min of manual grading time. The automated evaluation replaces human grading with a 3-judge LLM ensemble, removing the per-run grading bottleneck. N=10 provides higher statistical power for paired comparisons at acceptable compute cost (~$150-250 for 520 generation runs + 1170 judge calls, hard cap $300).

**Multi-arm expansion:** The plan adds two arms beyond the original two-arm (pre-init vs post-init) design:
- Arm R (Naive RAG at HEAD): grep + lunr search over post-initiative docs without the knowledge graph. Isolates the graph's marginal contribution.
- Arm B (Bare LLM): zero tools, parametric knowledge only. Establishes a floor.

**Automated judging:** Replaces the hybrid "LLM-as-judge + 20% human spot-check" with a 3-judge non-Anthropic ensemble (`openai/gpt-5.4`, `google/gemini-2.5-pro`, `xai/grok-3`). Judge agreement is calibrated on held-out prompts (Phase 3) before corpus data is seen. Human spot-check is replaced by agent-driven cross-validation (Phase 6: 8 sampled runs read end-to-end for surface anomalies).
