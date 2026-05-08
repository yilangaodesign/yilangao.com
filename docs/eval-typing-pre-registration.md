---
type: eval-spec
id: eval-typing-pre-registration
topics: [eval, knowledge-graph, typing]
derivedFrom:
  - .cursor/plans/eval_experiment_program_0516e9af.plan.md
  - docs/eval-pre-registration.md
references:
  - docs/eval-multipillar-task-corpus.md
  - docs/eval-typing-task-corpus.md
  - docs/eval-typing-eval-config.yaml
  - docs/eval-judge-rubric.md
  - docs/eval-graph-audit.md
---

# Phase 1 — Type-System A/B Pre-Registration

> **Status:** Pre-registered. Committed before any Phase 1 generation runs.
> **Plan:** [`.cursor/plans/eval_experiment_program_0516e9af.plan.md`](../.cursor/plans/eval_experiment_program_0516e9af.plan.md) (Phase 1, steps 1a-1e)
> **Eval-config:** [`docs/eval-typing-eval-config.yaml`](eval-typing-eval-config.yaml)
> **Subset corpus:** [`docs/eval-typing-task-corpus.md`](eval-typing-task-corpus.md) — 6 task IDs drawn deterministically from the locked Phase 2 corpus.
> **Phase 2 corpus reference:** [`docs/eval-multipillar-task-corpus.md`](eval-multipillar-task-corpus.md) at SHA `c193de490ca8072978c40aa0cd7cbea2046a07d901bf5b48e5783955e37dbced` (Phase 1 selects a subset; the corpus stays frozen until Phase 2 report is written).
> **Phase 0 input:** [`docs/eval-graph-audit.md`](eval-graph-audit.md) — Gate A status: **borderline** (typed forward edges = 20.0%, frontmatter edges = 8.9%). Phase 1 proceeds with the disclosure that ~80% of forward edges already collapse to `references` semantics in the typed arm.
> **Judge rubric:** [`docs/eval-judge-rubric.md`](eval-judge-rubric.md) — code blocks SHA-pinned. Surrounding prose may evolve; the LLM-input portion is locked.
>
> **LOCKED before Phase 1 runs.** Any post-lock change requires a SHA-stamped amendment in the Phase 1 results doc.

## Hypothesis

The typed knowledge graph (forward edge types `triggers`, `references`, `documents`, `enforces`, `derivedFrom`, `supersedes` plus inverses, with confidence values 0.50–1.00 stratified by source) produces measurably better gold-cite **F1** scores than a structurally identical "untyped" graph (every edge collapsed to `type: references`, `confidence: 1.0`) on a 6-task subset of the Phase 2 multi-pillar corpus.

Both arms use the same scripted runner, the same MCP server, the same skill-injection logic, the same generation model, the same 6 tasks, and the same `(from, to)` edge endpoints. The ONLY difference is which graph cache file the MCP server reads — `.cache/graph.json` vs `.cache/graph-untyped.json`.

If the typed arm wins on F1, the typing-as-information-channel claim survives. If the untyped arm matches or wins, the v1 result is plausibly explained by raw connectivity rather than by edge-type semantics.

## Scoped claim

Phase 1 measures the **incremental contribution of edge typing** above raw connectivity, on multi-pillar reasoning tasks where cross-pillar AP retrieval matters. It does NOT measure:

- The end-to-end value of the knowledge graph vs no graph (that's the v1 T vs R comparison).
- The value of typing on E+C tasks (Phase 1 drops the E+C stratum to keep N tractable; only Phase 2 covers E+C).
- Production fidelity (this is the same scripted-runner approximation as v1).

## Arms

Both arms are `arm_role: treatment` per [`docs/eval-typing-eval-config.yaml`](eval-typing-eval-config.yaml). Identical tools, identical skills, identical context. Only `graph_cache` differs.

### Arm `T-typed` (current)

- **Tools:** `query-node`, `subgraph`, `search` (MCP tools proxied to `scripts/mcp-graph-server.mjs`), plus `read_file`.
- **Graph cache:** `.cache/graph.json` (1068 nodes, 5280 edges; full forward + inverse type system; confidence 0.50–1.00).
- **Skill injection:** keyword-matched top-3 skills from `.cursor/skills/*/SKILL.md`, identical to v1 Arm T.

### Arm `T-untyped` (collapsed)

- **Tools:** same as `T-typed`.
- **Graph cache:** `.cache/graph-untyped.json` (same 1068 nodes, same 5280 `(from, to)` pairs; every edge rewritten to `type: 'references'`, `confidence: 1.0`, `source: 'untyped:collapsed:<original>'`). Auto-emitted by `scripts/build-graph.mjs` (per Plan A I2) so the variant cannot drift from the typed graph between runs.
- **Skill injection:** identical to `T-typed`.

The MCP server receives `GRAPH_CACHE_PATH` and `EVAL_FREEZE_CACHE=1` env vars at spawn time (per Plan A I1). The runner verifies the cache file SHA against the manifest before each run.

## Generation model (locked)

`anthropic/claude-4.6-sonnet` via AI Gateway OIDC. Same generation model as v1 `full-001` for cross-eval commensurability.

## Judge ensemble (locked)

Three non-Anthropic models (no same-family judging):

1. `openai/gpt-5.4`
2. `google/gemini-2.5-pro`
3. `xai/grok-3`

All via AI Gateway OIDC. Identical to v1.

If a judge becomes unavailable mid-Phase-1 (rate-limit, gateway outage, deprecation), Phase 1 pauses up to 24h. If the model is not restored, an amendment is filed naming the replacement judge and re-running ALL Phase 1 judgments under the new ensemble. No silent substitution.

## Sample size

**N = 5 repetitions per task per arm** (smaller than v1's N=10; the typing delta is likely smaller than the v1 graph-vs-no-graph delta but Phase 1's role is a directional signal, not a definitive measurement).

| Component | Calculation | Total |
|---|---|---|
| Generation runs | 6 tasks × 5 reps × 2 arms | 60 |
| Judge calls | 30 task-reps × 1 comparison pair × 3 judges | 90 |

F1 is deterministic regex grading and does not consume judge calls.

## Stratification

Phase 1 uses `pillar` as the stratification field (per `docs/eval-typing-eval-config.yaml`):

- **multi-pillar** stratum: 3 tasks (`eval-MP-DE-001`, `eval-MP-DEC-001`, `eval-MP-DC-001`).
- **single-pillar** stratum: 3 tasks (`eval-SP-C-001`, `eval-SP-D-001`, `eval-SP-D-002`).

This is **not** the 4-strata `combination` axis Phase 2 uses; Phase 1's per-stratum aggregation is therefore a 2-stratum sanity check (multi vs single), NOT a 4-way Holm-corrected test.

**Disclosure:** Phase 1 cannot generalize the typing finding to the E+C stratum (no E+C task in the subset). Phase 2 is the only place E+C gets measured, and Phase 2 measures T-with-graph vs R-without-graph, not typed-vs-untyped. Acceptable limitation; documented here so the Phase 1 results doc can carry it forward.

## Citation grading (deterministic, F1)

Per Plan A I4, citation correctness is computed by `scripts/eval-judge.mjs:classifyCitations()` over the `expected_citations` array (plural) on each task:

```javascript
const CITATION_REGEX = /(?:AP|EAP|CAP)-\d+/g;
// extracted = unique IDs in the model's final response
// expected  = task.expected_citations
// recall    = |extracted ∩ expected| / |expected|
// precision = |extracted ∩ expected| / |extracted|
// f1        = 2 * recall * precision / (recall + precision)
//
// Edge cases (pre-registered convention):
//   extracted = [], expected = non-empty   -> F1 = 0
//   expected  = [], extracted = non-empty  -> F1 = 0 (precision = 0)
//   both empty                             -> F1 = 1 (correctly avoided citation)
```

F1 is the primary outcome. Adherence/quality/preference (LLM-judged) are secondary outcomes.

## Gate B — 4-outcome decision table

The Phase 2 framing depends on the Phase 1 outcome.

| Outcome | Δ F1 (T-typed − T-untyped) | Phase 2 framing |
|---|---|---|
| **Helps materially** | Δ ≥ +0.10 | Proceed to Phase 2 with strong framing. |
| **Helps marginally** | 0 < Δ < +0.10 | Proceed to Phase 2 with disclosure that typing adds incremental value above connectivity. |
| **No effect** | Δ ≈ 0 (CI includes 0) | Reframe Phase 2 as a connectivity test rather than a typed-graph test. |
| **Actively hurts** | Δ ≤ −0.05 | **Pause Phase 2.** Redesign edge typing or confidence calibration before any further runs. |

Δ is computed on the multi-pillar stratum first (3 tasks × 5 reps = 15 paired observations per arm), then on single-pillar (15 paired observations), then pooled (30 paired observations). The decision uses the multi-pillar number as the primary anchor; the other two are reported alongside.

**Pre-registered fallback (Phase 2 N escalation):** if Phase 1 multi-pillar Δ F1 < 0.20, increase Phase 2 N from 12 to 18 reps per task per arm before running. This is a one-time pre-registered escalation, not post-hoc. Cost goes from ~$500 to ~$750 (still within program cap).

## Phase 0 caveat carried forward

The graph audit ([`docs/eval-graph-audit.md`](eval-graph-audit.md)) reports Gate A status as **borderline**: 80.0% of forward edges already collapse to `references` semantics in the typed arm; only 20.0% are typed (`documents`, `derivedFrom`, `enforces`, `triggers`, `supersedes`). The Phase 1 Δ F1 therefore measures the contribution of those ~20% non-`references` edges plus distributional differences in confidence (typed: 0.50–1.00 stratified by source; untyped: 1.00 uniform), NOT "all typing vs no typing." A weak Δ should not be read as "the type system is decorative" — it can also be read as "most of the typing in the current graph IS already `references`."

This caveat is reproduced in the Phase 1 results doc verbatim.

## Statistical tests

| Metric | Test | Rationale |
|---|---|---|
| F1 (multi-pillar) | Wilcoxon signed-rank, paired by `(task_id, rep)` | Continuous F1 differences; v1 inherits Wilcoxon for paired metrics |
| F1 (single-pillar) | Wilcoxon signed-rank, paired by `(task_id, rep)` | Same |
| F1 (pooled, secondary) | Wilcoxon signed-rank, paired by `(task_id, rep)` | Reported alongside per-stratum |
| Pairwise preference | Bootstrap 95% CI on T-typed > T-untyped rate (10,000 iterations) | v1 inherits bootstrap |
| Inter-judge agreement | Fleiss' kappa across 3 judges on preference | Deterministic F1 has perfect agreement by construction |

## Decision rule for Phase 1 success

Phase 1 itself does NOT have a "wins / loses" verdict in the v1 sense — it produces a directional signal feeding Gate B's 4-outcome table. The thresholds in the YAML block at the bottom are budget caps and adversarial guards; they are NOT win conditions.

## Exclusion criteria

A run is excluded from analysis if:

- The model produces an empty response (zero content tokens).
- The model enters a tool-call loop (>10 consecutive identical tool calls).
- The runner crashes mid-run.
- The per-run hard kill triggers ($5 OR 30k output tokens, per Plan A I5).

Excluded runs are reported per arm. If >20% of runs in any arm are excluded, that arm is flagged as unreliable and the Phase 1 result is treated as inconclusive.

## Mid-flight quality check (1d-check, NEW)

After the first 2 tasks complete (20 runs out of 60), the runner pauses for manual inspection:

1. Both arms produced non-empty responses.
2. `T-typed` responses contain graph-derived citations (AP/EAP/CAP IDs and anchor references).
3. `T-untyped` responses also contain citations (proving MCP worked for both arms).
4. F1 computation produced finite values (no NaN, no zero-recall artifact from empty `expected_citations`).

If any check fails, STOP and debug before spending the remaining $80. This is the cheapest place to catch infrastructure bugs that escaped the Plan A I8 dry run.

## Budget overrun procedure

| Condition | Action |
|---|---|
| ≥ 40 of 60 runs done AND signal is clear (Δ F1 95% CI excludes 0) | Stop and proceed to Gate B with reported N. |
| ≥ 40 of 60 runs done AND signal is unclear | Escalate cap to $225 (one-time, pre-registered). Resume. |
| < 40 of 60 runs done | Treat as infrastructure failure. Pause. Debug runaway cost. Restart from checkpoint. |

The `budget_cap_usd` in the YAML block below is the cap the runner reads at startup.

## Generation model snapshot pin

`anthropic/claude-4.6-sonnet` is an AI Gateway alias. If Anthropic silently updates the underlying snapshot between Phase 1 and Phase 2, that's a v1↔Phase 1 commensurability concern, not a Phase 1↔Phase 1 concern (both Phase 1 arms run in the same session window). Phase 2's pre-reg adds an explicit snapshot sanity check before its calibration step.

---

```yaml
# --- machine-parseable decision thresholds (do not reformat) ---
thresholds:
  reps_per_task: 5
  total_runs: 60
  total_judge_calls: 90
  primary_anchor_stratum: multi-pillar
  helps_materially_delta_f1: 0.10    # Gate B outcome 1 threshold
  no_effect_delta_f1: 0.0            # Gate B outcome 3 anchor
  actively_hurts_delta_f1: -0.05     # Gate B outcome 4 threshold
  phase2_n_escalation_delta_f1: 0.20 # Phase 2 N=18 trigger if multi-pillar Δ < this
  budget_cap_usd: 150
  per_run_kill_usd: 5
  per_run_kill_output_tokens: 30000
  bootstrap_iterations: 10000
  judge_kappa_floor: 0.4             # for preference only; F1 is deterministic
```
