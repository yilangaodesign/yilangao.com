---
type: eval-report
id: eval-typing-results
topics: [eval, knowledge-graph, typing, phase-1]
derivedFrom:
  - .cursor/plans/eval_experiment_program_0516e9af.plan.md
references:
  - docs/eval-typing-pre-registration.md
  - docs/eval-typing-task-corpus.md
  - docs/eval-multipillar-task-corpus.md
  - docs/eval-graph-audit.md
  - docs/eval-typing-eval-config.yaml
---

# Phase 1 — Typed vs untyped graph A/B (Eval-B)

> Phase 1 of the Eval Experiment Program ([`eval_experiment_program_0516e9af.plan.md`](../.cursor/plans/eval_experiment_program_0516e9af.plan.md)).
>
> Pre-registered design: [`docs/eval-typing-pre-registration.md`](eval-typing-pre-registration.md).
> Subset corpus: [`docs/eval-typing-task-corpus.md`](eval-typing-task-corpus.md) (6 tasks, SHA-pinned to multipillar corpus `c193de490ca8`).
>
> **Run ID:** `phase1-main` (`eval-results/phase1-main/`)
> **Generation date:** 2026-05-03
> **Generation model:** `anthropic/claude-4.6-sonnet` (via AI Gateway, OIDC auth)
> **Judge ensemble:** `openai/gpt-5.4`, `google/gemini-2.5-pro`, `xai/grok-3`
> **Stratification field:** `pillar` (multi-pillar vs single-pillar)
> **Reps per task:** 5 (per pre-reg)

## Top-line verdict — Gate B Outcome 3: No effect (with caveats)

**Multi-pillar Δ F1 = +0.022 [95% CI: −0.133, +0.167], Wilcoxon p = 1.000.**

The 95% CI on the primary anchor (multi-pillar Δ F1) includes 0, with a central tendency well below the +0.10 "helps materially" threshold and well below the +0.20 Phase 2 escalation guard. By the pre-registered Gate B 4-outcome table, this falls squarely in **Outcome 3 — no effect on the primary anchor**.

A directional signal is visible on the **single-pillar** stratum (Δ F1 = +0.133), but its 95% CI also includes 0. The pooled effect (n=30 paired observations) is +0.078 with a CI that includes 0.

This null-on-multi-pillar result is consistent with the Phase 0 caveat: ~80% of the typed graph's forward edges already collapse to `references` semantics, so the typed–untyped contrast measures only the marginal effect of the remaining ~20% non-`references` edges plus confidence-distribution differences.

## Phase 1 statistics

### Δ F1 by stratum (paired by `(task_id, rep)`)

| Stratum | n_pairs | mean Δ F1 | 95% CI (bootstrap, B=10,000) | Wilcoxon p (two-sided) |
|---|---|---|---|---|
| **multi-pillar** (primary) | 15 | **+0.022** | [−0.133, +0.167] | 1.000 |
| single-pillar | 15 | +0.133 | [−0.129, +0.400] | 0.505 |
| pooled (secondary) | 30 | +0.078 | [−0.077, +0.233] | 0.586 |

### Distribution of paired Δ values

| Stratum | +Δ pairs | 0 (tied) | −Δ pairs | range | median Δ |
|---|---|---|---|---|---|
| multi-pillar | 3 | 10 | 2 | [−0.667, +0.500] | 0.000 |
| single-pillar | 7 | 3 | 5 | [−0.667, +1.000] | 0.000 |

The 10 ties on multi-pillar are dominantly `(0, 0)` pairs where both arms failed to converge (see § Convergence). Excluding ties, the multi-pillar split is 3:2 in T-typed's favor — directionally consistent but underpowered.

### Per-task F1 means (5 reps per arm per task)

| Task | combination | T-typed F1 | T-untyped F1 | Δ |
|---|---|---|---|---|
| `eval-MP-DC-001` | D+C | 0.100 | 0.233 | **−0.133** |
| `eval-MP-DE-001` | D+E | 0.200 | 0.000 | +0.200 |
| `eval-MP-DEC-001` | D+E+C | 0.000 | 0.000 | 0.000 |
| `eval-SP-C-001` | single-pillar (C) | 0.533 | 0.800 | **−0.267** |
| `eval-SP-D-001` | single-pillar (D) | 0.760 | 0.333 | +0.427 |
| `eval-SP-D-002` | single-pillar (D) | 0.340 | 0.100 | +0.240 |

Two tasks (`eval-MP-DC-001`, `eval-SP-C-001`) show **T-untyped > T-typed** at the per-task mean. This is small-N noise (5 reps each), but worth flagging — the typed graph is not uniformly helpful.

### Preference (judge-graded, secondary outcome)

| Metric | Value |
|---|---|
| Total judgments | 48 (16 valid task-rep pairs × 3 judges; 14 pairs SKIPPED due to ≥1 null response) |
| T-typed preferred (overall) | 87.5% [68.8%, 100.0%] |
| T-typed preferred (multi-pillar) | 75.0% (n=4 pairs) |
| T-typed preferred (single-pillar) | 91.7% (n=12 pairs) |
| Adherence Cohen's d (T-typed > T-untyped) | 0.916 [0.495, 1.336] |
| Quality Cohen's d (T-typed > T-untyped) | 0.918 [0.497, 1.339] |

The judge-graded preference signal is strong, but the deterministic F1 signal is weak. This divergence is real: judges often prefer responses that *look* more rigorous (more citations, more structure) without those citations actually being correct. **F1 is the primary outcome by pre-reg** — preference is reported alongside.

### Inter-judge agreement (Fleiss' kappa)

| Metric | Observed kappa | Pre-reg floor | Result |
|---|---|---|---|
| Adherence | 0.314 | 0.40 | **FAIL** |
| Quality | 0.131 | 0.40 | **FAIL** |
| Preference | 0.373 | 0.40 | **FAIL** (just below) |

All three judge-graded metrics fall below the pre-reg's 0.40 kappa floor. With n=16 task-rep pairs the kappa estimate is statistically noisy, but the signal is real: the three judges genuinely disagree on these tasks.

**Implication for Phase 2:** the Phase 2c calibration step (Fleiss' kappa on 3 held-out tasks at the start of Phase 2, before any expensive runs) becomes a hard gate. If kappa stays below 0.40 on calibration, the rubric needs revision before Phase 2 generation runs.

### Convergence rate by arm (derived metric)

| Arm | Converged / total | Rate | Empty responses | Runaway flagged |
|---|---|---|---|---|
| T-typed | 22/30 | 73.3% | 8 | 0 |
| T-untyped | 21/30 | 70.0% | 9 | 0 |

Δ convergence ≈ +3.3pp (T-typed slightly higher). The big driver is task difficulty, not arm: multi-pillar tasks converge ~53% of the time on both arms; single-pillar tasks converge ~88%. The pre-reg's 20% per-arm exclusion threshold is met (T-typed: 26.7% empty; T-untyped: 30.0% empty — both below 33%), but T-untyped is at the edge.

All "empty" runs are step-budget exhaustion (15-step `stopWhen` reached with response still under construction), not infrastructure failures. None triggered the per-run hard kill ($5 / 30k tokens). The runner classifies these as `OK` because `result.text` is non-empty (mid-stream prose); the aggregator's convergence metric reclassifies them when no AP/EAP/CAP citations are extractable AND the text is < 500 chars.

## Phase 0 caveat (verbatim, carried forward)

> The graph audit ([`docs/eval-graph-audit.md`](eval-graph-audit.md)) reports Gate A status as **borderline**: 80.0% of forward edges already collapse to `references` semantics in the typed arm; only 20.0% are typed (`documents`, `derivedFrom`, `enforces`, `triggers`, `supersedes`). The Phase 1 Δ F1 therefore measures the contribution of those ~20% non-`references` edges plus distributional differences in confidence (typed: 0.50–1.00 stratified by source; untyped: 1.00 uniform), NOT "all typing vs no typing." A weak Δ should not be read as "the type system is decorative" — it can also be read as "most of the typing in the current graph IS already `references`."

## Gate B verdict and Phase 2 implications

| Pre-registered outcome | Δ F1 (multi-pillar) | Phase 2 framing |
|---|---|---|
| Helps materially | Δ ≥ +0.10 | Strong framing |
| Helps marginally | 0 < Δ < +0.10 | Disclosure framing |
| **No effect** | **Δ ≈ 0 (CI includes 0)** | **Reframe Phase 2 as connectivity test** |
| Actively hurts | Δ ≤ −0.05 | Pause Phase 2 |

**Recommendation:** **Reframe Phase 2 as a connectivity test (T-with-graph vs R-without-graph) rather than a typed-graph test.** Phase 2's existing design already does this — it pits T-typed (with the typed graph) against R (no graph access). Phase 1's null-on-typing means the Phase 2 finding will primarily measure the value of *having a graph at all*, not the value of typed edges over untyped ones.

**Phase 2 N escalation (pre-registered):** because multi-pillar Δ F1 = 0.022 < 0.20, the pre-reg requires increasing Phase 2 from 12 reps/task/arm to **18 reps/task/arm**. This is not a post-hoc decision — it is the explicit fallback in `eval-typing-pre-registration.md` § Gate B. Cost moves from ~$500 to ~$750.

**Optional follow-up before Phase 2 (cheap):**

1. **Improve typed-edge density.** The Phase 0 caveat is the simplest explanation for the null result. If the docs author 50–100 more `documents` / `enforces` / `derivedFrom` edges in frontmatter (raising typed-forward share from 20% to >35%), the typed–untyped contrast becomes more meaningful. ~2 hours of doc work.
2. **Increase `stopWhen` from 15 → 25 steps.** Multi-pillar tasks consistently exhausted the step budget. With 25 steps, expected convergence rate would be ~85% on multi-pillar (estimated). This changes Phase 2's expected cost by ~30%.
3. **Tighten the rubric.** Inter-judge kappa < 0.40 on adherence, quality, preference. The rubric likely under-specifies what "good" looks like. Revising before Phase 2c calibration is materially cheaper than rerunning Phase 2.

None of these are blocking. They are improvements to consider before kicking off Phase 2's $500–$750 spend.

## Open questions for the user

1. **Should we improve the typed-edge density before Phase 2** (option 1 above), or accept the borderline-graph caveat and proceed?
2. **Should we increase `stopWhen` to 25** to reduce step-exhaustion DNFs in Phase 2?
3. **Should we revise the rubric** before Phase 2c calibration (kappa floor risk)?
4. Phase 2 is now a ~$750 spend by pre-reg. **Is that within budget,** or do we need to scope down (e.g., drop the E+C stratum)?

## Methodology notes

- **F1 grading is deterministic** (no LLM judge involved): see `scripts/eval-judge.mjs:classifyCitations()` and the regex `/(?:AP|EAP|CAP)-\d+/g`. Edge cases (empty extracted, empty expected, both empty) follow the pre-registered convention.
- **Runs paired by `(task_id, rep)`** for Wilcoxon and bootstrap CI. Pairing reduces variance from task difficulty.
- **Bootstrap CI uses 10,000 iterations** (per pre-reg). Two-sided Wilcoxon uses normal approximation (n=15 per stratum is at the edge of the small-sample regime).
- **Adversarial sentinels** were not part of the Phase 1 subset (only Phase 2 includes adversarial tasks). Phase 1 makes no claim about hallucination frequency.
- **Calibration tasks** were not part of the Phase 1 subset (held out for Phase 2c).

## Artifacts

| Artifact | Path |
|---|---|
| Run JSONLs (T-typed) | `eval-results/phase1-main/T-typed/<task_id>/run-*.jsonl` |
| Run JSONLs (T-untyped) | `eval-results/phase1-main/T-untyped/<task_id>/run-*.jsonl` |
| Judgments | `eval-results/phase1-main/judgments.jsonl` |
| Aggregated summary | `eval-results/phase1-main/summary.json`, `summary.md` |
| Manifest | `eval-results/phase1-main/manifest.json` (graph SHA, index SHA, ref repo state) |
| Pre-registration | `docs/eval-typing-pre-registration.md` |
| Subset corpus | `docs/eval-typing-task-corpus.md` (SHA-pinned to multipillar corpus `c193de490ca8`) |
| Graph audit | `docs/eval-graph-audit.md` |

## Status

Phase 1 (Eval-B steps 1a–1e) is **complete**. Phase 2 is **paused for user review** before the ~$750 spend (per pre-reg N=18 escalation).
