---
type: cross-cutting
id: eval-navigator
topics: [eval, knowledge-graph, engineering]
derivedFrom:
  - docs/initiatives/docs-knowledge-graph-initiative.md
references:
  - docs/eval-results.md
  - docs/eval-task-corpus.md
  - docs/eval-pre-registration.md
  - docs/eval-judge-rubric.md
  - docs/eval-calibration-prompts.md
  - docs/eval-adversarial-controls.md
  - docs/eval-baselines/README.md
---

# Eval Navigator

Central index for the Knowledge Graph A/B evaluation effort. The eval measured whether the typed knowledge graph (995 nodes, 4,892 edges) improves agent accuracy compared to the pre-initiative hierarchical docs and a no-memory baseline with no external knowledge at all. Four arms, 12 tasks, 10 runs each, 3-judge ensemble scoring blind.

**Key result:** The graph found the gold anti-pattern 72% of the time on subtle tasks where neither the hierarchical docs nor the no-memory baseline ever did (0%). Overall verdict by pre-registered decision rules: inconclusive - the no-memory baseline scored higher on holistic response quality. Full report: [`docs/eval-results.md`](eval-results.md).

## Artifact map

| Artifact | Path | Role | Read when |
|----------|------|------|-----------|
| **Report** | [`docs/eval-results.md`](eval-results.md) | Final results, statistical tests, verdict | You want the numbers and conclusions |
| **Pre-registration** | [`docs/eval-pre-registration.md`](eval-pre-registration.md) | Hypotheses, decision rules, arm definitions | You want to know what was promised before data |
| **Judge rubric** | [`docs/eval-judge-rubric.md`](eval-judge-rubric.md) | Scoring criteria, system prompts for judges | You want to understand how quality was measured |
| **Calibration prompts** | [`docs/eval-calibration-prompts.md`](eval-calibration-prompts.md) | 3 held-out tasks for judge agreement testing | You want to verify judge reliability |
| **Adversarial controls** | [`docs/eval-adversarial-controls.md`](eval-adversarial-controls.md) | Out-of-distribution task to test overfit | You want to see the adversarial probe |
| **Task corpus** | [`docs/eval-task-corpus.md`](eval-task-corpus.md) | Frozen 12-task set with gold anti-patterns | You want the actual test items |
| **Baselines** | [`docs/eval-baselines/`](eval-baselines/README.md) | 9 captured pre-initiative Cursor runs | You want to see raw baseline outputs |
| **Raw data (calibration)** | `eval-results/cal-001/` | JSONL: calibration run outputs + judgments | You want to inspect calibration data |
| **Raw data (full eval)** | `eval-results/full-001/` | JSONL: all 4 arms x 12 tasks x 10 runs | You want to inspect full eval data |
| **Runner script** | [`scripts/eval-runner.mjs`](../scripts/eval-runner.mjs) | Orchestrates generation across arms | You want to understand the pipeline |
| **Judge script** | [`scripts/eval-judge.mjs`](../scripts/eval-judge.mjs) | Runs LLM-as-judge scoring | You want to understand scoring automation |
| **Aggregation script** | [`scripts/eval-aggregate.mjs`](../scripts/eval-aggregate.mjs) | Computes summary stats, generates report | You want to understand statistical analysis |
| **Eval plan** | [`.cursor/plans/self-automated_kg_a_b_eval_a49a67c6.plan.md`](../.cursor/plans/self-automated_kg_a_b_eval_a49a67c6.plan.md) | Execution plan for the eval | You want the full plan that drove execution |
| **Corpus handling plan** | [`.cursor/plans/docs_kg_eval_handle_c7e2a5f9.plan.md`](../.cursor/plans/docs_kg_eval_handle_c7e2a5f9.plan.md) | Plan C: corpus creation and baseline capture | You want the earlier planning phase |
| **Initiative coordinator** | [`docs/initiatives/docs-knowledge-graph-initiative.md`](initiatives/docs-knowledge-graph-initiative.md) | Parent initiative context | You want the bigger picture |
