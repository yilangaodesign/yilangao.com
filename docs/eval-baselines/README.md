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

1. **Open Cursor at the worktree root.** From a fresh Cursor window: `File → Open Folder → ~/eval/yilangao-current`. This is critical — opening the main checkout instead pollutes the agent's context with post-initiative documentation. Verify the workspace path in Cursor's title bar before continuing.
2. **Start a fresh chat.** Do not resume an existing chat. The agent's context must be clean per run.
3. **Select the model.** Match the model + temperature defaults below. Confirm in Cursor's model selector before sending the prompt.
4. **Paste the task `prompt` verbatim.** Copy the `prompt` field from the corresponding YAML block in [`docs/eval-task-corpus.md`](../eval-task-corpus.md). Do NOT add framing, "this is a test", "please show your work", or any other meta instruction. The prompt must look like a normal feedback request.
5. **Capture the full response.** When the agent stops, capture: planning blocks, tool calls (names + arguments + truncated outputs are fine), and final message. Paste into the corresponding `current/<task-id>/run-<n>.md` file BELOW the existing frontmatter line.
6. **Record metadata.** Fill in `model`, `temperature`, `timestamp` (ISO 8601 with timezone), and `cursor_window_path` in the frontmatter. The `commit_sha` field is pre-filled and should always read `56f876024fc95591b95f0f181686ba4dda0ac03f`. The `task_id` and `run_number` are pre-filled.
7. **Update the manifest.** After all 9 runs complete, fill in the aggregate fields in `current/manifest.json`.

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
| Run files present but transcripts empty | Operator hasn't pasted agent output yet | Complete the 9 baseline invocations per the procedure above |
| Manifest `model` / `captured_by` / `captured_window_*` are `null` | Aggregate metadata not filled in after baseline runs | Fill in `docs/eval-baselines/current/manifest.json` after all 9 transcripts are captured |

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
