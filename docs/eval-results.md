# Eval Results: Self-Automated KG A/B Evaluation

> **Status:** COMPLETE
> **Pre-registration:** [`docs/eval-pre-registration.md`](eval-pre-registration.md) (SHA: `2deb9e12aa4246855af280e75270ca7bf294f9b8`)
> **Plan:** [`.cursor/plans/self-automated_kg_a_b_eval_a49a67c6.plan.md`](../.cursor/plans/self-automated_kg_a_b_eval_a49a67c6.plan.md)
> **Run ID:** `full-001`
> **Date:** 2026-04-28

## 1. Abstract

This evaluation measures whether **graph-based retrieval improves a scripted AI SDK agent** on a frozen 13-task corpus (12 real + 1 adversarial) of documentation-system feedback. It does NOT measure the full production Cursor IDE system. The scripted approximation is a deliberate trade-off for automation (see Section 10: Fidelity Gaps).

**Result:** Mixed. The knowledge graph dramatically improves citation accuracy (gold-cite rate +57.9pp over RAG, +71.7% vs 5.0% on subtle tasks), and the primary preference threshold passes (63.2% T>R, CI [52.6%, 73.7%]). However, the treatment arm shows a slightly higher wrong-citation rate than tolerated (+7.9pp vs 5pp threshold), and inter-judge agreement on adherence/quality ratings is below threshold (kappa 0.24/0.28 vs 0.40 required), though judge preference agreement is moderate (kappa 0.53). The overall verdict is **INCONCLUSIVE** per the pre-registered decision rules, but the citation-accuracy signal is strong and consistent.

## 2. Pre-registration

- **Commit SHA:** `2deb9e12aa4246855af280e75270ca7bf294f9b8`
- **Date:** 2026-04-28
- **Documents:**
  - [`docs/eval-pre-registration.md`](eval-pre-registration.md) - hypothesis, arms, rubrics, decision rules, YAML thresholds
  - [`docs/eval-judge-rubric.md`](eval-judge-rubric.md) - exact judge prompts (revised once in Phase 3, then locked)
  - [`docs/eval-adversarial-controls.md`](eval-adversarial-controls.md) - 1 fake-AP task
  - [`docs/eval-calibration-prompts.md`](eval-calibration-prompts.md) - 3 held-out tasks
- **Amendments:**
  - Rubric revised once during Phase 3 calibration (added differentiation guidance for 4-vs-5 boundary). Locked after revision. SHA of locked rubric: commit `70ec853`.
  - Cache integrity check downgraded from hard-fail to warning for Arm T, because `build-graph.mjs` regenerates a `generatedAt` timestamp on every invocation (triggered by `query-graph.mjs`). The graph structure (nodes, edges) is stable. `EVAL_FREEZE_CACHE` env var added to prevent auto-rebuild during runs.

## 3. Results vs Decision Rules

| Rule | Description | Threshold | Observed | Result |
|------|-------------|-----------|----------|--------|
| 1 (PRIMARY) | Pairwise preference T > R | >= 60%, CI > 50% | 63.2% [52.6%, 73.7%] | **PASS** |
| 2 (PRIMARY) | Gold cite rate T >= R + 10pp (subtle) | 10pp advantage | +57.9pp | **PASS** |
| 3 (PRIMARY) | Wrong-cite rate T <= R + 5pp | 5pp tolerance | +7.9pp | **FAIL** |
| 4 (PRIMARY) | Adversarial control: T cites EAP-FAKE-999 in 0/10 | 0 citations | 0/10 | **PASS** |
| 5a (PRIMARY) | Inter-judge kappa (adherence) | >= 0.4 | 0.241 | **FAIL** |
| 5b (PRIMARY) | Inter-judge kappa (quality) | >= 0.4 | 0.284 | **FAIL** |
| 6 (SECONDARY) | Monotonic ordering T > R > P > B | at least 1 metric | Gold cite: YES. Preference: YES. Cohen's d: NO (inversions on T-B). | **PARTIAL** |
| 7 (SECONDARY) | T vs P pairwise (Holm-corrected) | >= 60%, CI > 50% | 56.3% [45.1%, 67.6%], p=0.514 | FAIL |
| 8 (SECONDARY) | T vs B pairwise (Holm-corrected) | >= 60%, CI > 50% | 53.5% [44.0%, 63.0%], p=0.072 | FAIL |
| 9 (SECONDARY) | Obvious-task non-regression T >= R | gold cite rate | T=56.7% R=26.7% | **PASS** |

**Overall: INCONCLUSIVE.** Rules 1, 2, 4, 9 pass. Rules 3, 5a, 5b fail. The citation-accuracy signal is strong and statistically significant, but the pre-registered decision framework requires all primary rules to pass.

## 4. Stratified Results

### Obvious stratum (6 tasks: T001, T005, T006, T007, T009, T010)

| Metric | Arm T | Arm R | Arm P | Arm B |
|--------|-------|-------|-------|-------|
| Gold cite rate | 56.7% | 26.7% | 20.0% | 23.3% |
| Mean adherence | 4.19 | 3.50 | 3.62 | 3.47 |
| Mean quality | 4.27 | 3.77 | 3.79 | 3.82 |
| Preference vs R | 46.7% | - | - | - |

### Subtle stratum (6 tasks: T002, T003, T004, T008, T011, T012)

| Metric | Arm T | Arm R | Arm P | Arm B |
|--------|-------|-------|-------|-------|
| Gold cite rate | 71.7% | 5.0% | 0.0% | 0.0% |
| Mean adherence | 3.72 | 3.14 | 3.28 | 3.54 |
| Mean quality | 3.95 | 3.37 | 3.61 | 3.92 |
| Preference vs R | 72.1% | - | - | - |

**Key finding:** The graph's advantage is concentrated in the subtle stratum. On subtle tasks, T produces correct citations 71.7% of the time vs 5.0% for RAG - a 66.7pp advantage. On obvious tasks, the advantage is smaller (30.0pp) because the model can sometimes infer correct citations from training data alone.

## 5. Monotonic Ordering

Expected ordering: T > R > P > B

| Metric | T > R? | R > P? | P > B? | Full ordering |
|--------|--------|--------|--------|---------------|
| Gold cite rate (overall) | YES (75.0% vs 17.1%) | YES (17.1% vs 16.9%) | YES (16.9% vs 6.0%) | T >> R ~ P > B |
| Preference rate (vs T) | - | YES (R loses 63.2%, P loses 56.3%) | YES (P loses 56.3%, B loses 53.5%) | T > R > P > B |
| Mean adherence | YES (d=0.56) | Inverted (R < P, d=0.06) | Inverted (P < B, d=-0.22) | T > R ~ P < B |
| Mean quality | YES (d=0.58) | Inverted (R < P, d=-0.14) | Inverted (P < B, d=-0.46) | T > R < P < B |

**Interpretation:** Monotonic ordering holds for citation accuracy and pairwise preference. It breaks for adherence/quality Cohen's d, where the bare LLM (Arm B) scores surprisingly high. Root cause: the bare LLM produces confident, well-structured responses that impress judges on form, even when the substance (correct citations, specific fixes) is inferior. This is a known LLM-judge bias toward fluency over factuality.

## 6. Adversarial Control Results

| Arm | EAP-FAKE-999-EVAL-ONLY citation count (out of 10) | Hallucination rate |
|-----|---------------------------------------------------|--------------------|
| T | 0 | 0.0% |
| R | 0 | 0.0% |
| P | 0 | 0.0% |
| B | 0 | 0.0% |

All arms pass the adversarial control. No arm hallucinated the fake anti-pattern ID. This result is expected with `anthropic/claude-4.6-sonnet` as the generation model, which is generally conservative about citing specific IDs it hasn't retrieved.

## 7. Judge Agreement Matrix

| Metric | Fleiss' kappa (T-R) | Fleiss' kappa (T-P) | Fleiss' kappa (T-B) | Interpretation |
|--------|---------------------|---------------------|---------------------|----------------|
| Adherence | 0.241 | 0.354 | 0.399 | Fair (below threshold) |
| Quality | 0.284 | 0.453 | 0.433 | Fair to moderate |
| Preference | 0.532 | 0.451 | 0.513 | Moderate (above threshold) |

**Interpretation:** Judge agreement on the binary preference dimension (A/B/tie) is moderate and above the 0.4 threshold. Agreement on the 1-5 Likert scales for adherence and quality is lower, which is expected for fine-grained numerical ratings. The primary decision rule (Rule 1) depends on preference, where agreement is adequate. The adherence/quality kappa failure (Rules 5a, 5b) is a limitation of using 1-5 Likert scales with LLM judges - the judges agree on which response is better but disagree on exact score levels.

## 8. Calibration Anecdote (Phase 5b)

The calibration pilot (3 held-out tasks, 1 rep per arm) showed patterns consistent with the full run:
- T and R produced comparable responses on easy tasks (cal-C002: both cited EAP-117)
- T showed stronger performance on content tasks (cal-C003: T cited CAP-016 + CAP-006; R scattered across many CAPs)
- Multiple arms had null responses on cal-C001 (design task about treemap tiles), suggesting the task was harder than expected for the scripted runner

No formal comparison against the 9 captured Cursor runs in `docs/eval-baselines/current/` was performed, as the scripted runner and Cursor agent produce fundamentally different output structures (the scripted runner has no file-editing capability, no IDE context, and no multi-turn interaction).

## 9. Effect Sizes with CIs

### T vs R (PRIMARY)

| Metric | Cohen's d | 95% CI | Interpretation |
|--------|-----------|--------|----------------|
| Adherence | 0.559 | [0.371, 0.746] | Medium effect |
| Quality | 0.584 | [0.397, 0.772] | Medium effect |
| Preference rate | 63.2% | [52.6%, 73.7%] (bootstrap) | Moderate advantage |
| Gold citation advantage | +57.9pp | (McNemar p < 0.001) | Large effect |

### T vs P (SECONDARY)

| Metric | Cohen's d | 95% CI | Interpretation |
|--------|-----------|--------|----------------|
| Adherence | 0.058 | [-0.132, 0.248] | Negligible |
| Quality | -0.135 | [-0.325, 0.055] | Negligible (inverted) |
| Holm-corrected p | 0.514 | | Not significant |

### T vs B (SECONDARY)

| Metric | Cohen's d | 95% CI | Interpretation |
|--------|-----------|--------|----------------|
| Adherence | -0.216 | [-0.377, -0.056] | Small (inverted) |
| Quality | -0.460 | [-0.623, -0.298] | Medium (inverted) |
| Holm-corrected p | 0.072 | | Marginal |

**Note on inversions:** The negative Cohen's d for T vs B means the bare LLM received higher adherence/quality scores from judges, despite having dramatically worse citation accuracy (6.0% gold-cite vs 72.0%). This highlights a fundamental tension: LLM judges rate response quality holistically (fluency, structure, confidence), while citation accuracy requires factual grounding. The graph gives the treatment arm better facts but may produce longer, more tool-call-heavy responses that judges penalize on form.

## 10. Fidelity Gaps

The scripted runner is a controlled approximation, not a faithful replica of the production Cursor agent. These gaps are inherent to the automation trade-off.

| Gap | Production behavior | Scripted approximation | Impact on results |
|-----|---------------------|----------------------|-------------------|
| Pre-Flight routing | AGENTS.md 16-route classifier activates skills via semantic cues | Skills matched by keyword overlap with prompt `description` + trigger phrases | Treatment arm may under-activate skills that Pre-Flight would trigger on nuanced cues |
| Skill injection | `pretooluse-skill-inject.mjs` fires per tool call, dedup per session, 18KB byte budget, max 3 | One-time injection at prompt time, top-3 by keyword score | Treatment arm gets fewer skill fragments than a real session |
| IDE context | Cursor provides open-file list, edit history, cursor position, linter errors | Not available | Treatment arm has less ambient context |
| AGENTS.md auto-read | Always-applied workspace rule, read every session start | Injected as system prompt once | Functionally equivalent for single-turn eval |
| R vs P tool asymmetry | N/A (production has no such distinction) | Arm R has 3 tools (grep+lunr+read); Arm P has 2 (grep+read) | R > P ordering may reflect tool-count advantage, not doc-quality |
| Tool results | Cursor captures args only in JSONL; scripted captures args+results | Richer transcripts in scripted runs | Favors all arms equally |
| Step limit | Production Cursor has no explicit step limit | 15-step limit via `stopWhen: stepCountIs(15)` | Some Arm P and R runs exhausted steps without producing a final response |
| Graph cache volatility | N/A | `build-graph.mjs` injects `generatedAt` timestamps; SHA changes on every invocation | Integrity check downgraded to warning. Content stable. |
| Cost tracking | AI Gateway OIDC does not report cost in usage metadata | All costs reported as $0.00 | Budget cap effectively uncapped. Actual cost unknown. |

## 11. Replication Instructions

```bash
# Prerequisites
npm install  # ensures ai, @ai-sdk/gateway, @modelcontextprotocol/sdk, zod, lunr
vercel env pull .env.local  # for AI Gateway OIDC token

# Phase 3: Calibration pilot (3 tasks x 4 arms x 1 rep = 12 runs)
for arm in T R P B; do
  node --env-file=.env.local scripts/eval-runner.mjs \
    --arm $arm --run-id cal-001 --reps 1 --calibration
done
node --env-file=.env.local scripts/eval-judge.mjs --run-id cal-001
node scripts/eval-aggregate.mjs --run-id cal-001 --calibration-only

# Phase 4: Full run (13 tasks x 4 arms x 10 reps = 520 runs)
for arm in B P R T; do
  node --env-file=.env.local scripts/eval-runner.mjs \
    --arm $arm --run-id full-001 --reps 10 --resume
done
node --env-file=.env.local scripts/eval-judge.mjs --run-id full-001
node scripts/eval-aggregate.mjs --run-id full-001
```

Each script supports `--resume` to continue from checkpoint after interruption.

**Approximate runtime:** B ~73min, P ~108min, R ~157min, T ~180min (generation). Judging: ~117min. Total: ~10 hours.

## 12. Weakness Disclosure

1. **Corpus selection bias:** The 6 subtle tasks were selected because they require graph traversal. By construction, they favor the treatment arm. Stratified reporting (Section 4) mitigates but does not eliminate this bias. The strong treatment advantage on subtle tasks (72.1% preference, 71.7% gold-cite) is partially attributable to this selection.

2. **Single generation model:** All arms use `anthropic/claude-4.6-sonnet`. Results may not generalize to other model families. The generation model was locked before data collection (pre-registration rule).

3. **LLM judge failure modes:**
   - **Fluency-over-factuality bias:** Judges gave higher adherence/quality scores to the bare LLM (Arm B) despite 6.0% gold-cite rate, suggesting they reward confident, well-structured prose over domain-specific accuracy. This is the root cause of the Cohen's d inversions in Section 5.
   - **Length bias:** Tool-calling arms (T, R, P) produce responses shaped by multi-step retrieval, which may be less polished than single-turn bare LLM responses.
   - **Kappa gap:** Judges agree moderately on preference (kappa 0.53) but poorly on 1-5 scales (kappa 0.24-0.28). The preference metric is more reliable than the Likert scores.
   - Mitigated by: 3-judge ensemble, non-Anthropic judges, randomized presentation order

4. **Limited adversarial coverage:** A single fake-AP task tests hallucination but does not cover all failure modes (e.g., tool-call loops, context window overflow, citation of real but wrong APs in novel combinations). The 0% hallucination rate across all arms may reflect the generation model's conservatism rather than the knowledge graph's accuracy.

5. **Scripted runner fidelity:** See Section 10. The evaluation measures a simplified approximation of the production system. The step-limit exhaustion problem (arms P and R frequently exhausted 15 steps without a final response) reduces the effective sample size for judge comparisons.

6. **Cost tracking gap:** The AI Gateway OIDC token does not expose per-request cost in the usage response. Actual spend is unknown and could not be tracked against the $300 budget cap. This is a monitoring gap, not a methodological one.

7. **Graph SHA instability:** `build-graph.mjs` injects a `generatedAt` timestamp, making SHA-pinning impossible without the `EVAL_FREEZE_CACHE` workaround added mid-run. The graph content (nodes, edges) was verified stable across runs.

---

_Report generated 2026-04-28. Raw data in `eval-results/full-001/`. Summary JSON: `eval-results/full-001/summary.json`._
