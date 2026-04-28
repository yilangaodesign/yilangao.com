# Eval Results: Self-Automated KG A/B Evaluation

> **Status:** PENDING DATA - pipeline built, awaiting API access for compute phases
> **Pre-registration:** [`docs/eval-pre-registration.md`](eval-pre-registration.md) (SHA: `2deb9e12aa4246855af280e75270ca7bf294f9b8`)
> **Plan:** [`.cursor/plans/self-automated_kg_a_b_eval_a49a67c6.plan.md`](../.cursor/plans/self-automated_kg_a_b_eval_a49a67c6.plan.md)

## 1. Abstract

This evaluation measures whether **graph-based retrieval improves a scripted AI SDK agent** on a frozen 12-task corpus of documentation-system feedback. It does NOT measure the full production Cursor IDE system. The scripted approximation is a deliberate trade-off for automation (see Section 10: Fidelity Gaps).

**Result:** _PENDING - awaiting Phase 3-4 compute runs_

## 2. Pre-registration

- **Commit SHA:** `2deb9e12aa4246855af280e75270ca7bf294f9b8`
- **Date:** 2026-04-28
- **Documents:**
  - [`docs/eval-pre-registration.md`](eval-pre-registration.md) - hypothesis, arms, rubrics, decision rules, YAML thresholds
  - [`docs/eval-judge-rubric.md`](eval-judge-rubric.md) - exact judge prompts (frozen after Phase 3)
  - [`docs/eval-adversarial-controls.md`](eval-adversarial-controls.md) - 1 fake-AP task
  - [`docs/eval-calibration-prompts.md`](eval-calibration-prompts.md) - 3 held-out tasks
- **Amendments:** None

## 3. Results vs Decision Rules

> _To be populated by `scripts/eval-aggregate.mjs` output_

| Rule | Description | Threshold | Observed | Result |
|------|-------------|-----------|----------|--------|
| 1 (PRIMARY) | Pairwise preference T > R | >= 60%, CI > 50% | _pending_ | _pending_ |
| 2 (PRIMARY) | Gold cite rate T >= R + 10pp (subtle) | 10pp advantage | _pending_ | _pending_ |
| 3 (PRIMARY) | Wrong-cite rate T <= R + 5pp | 5pp tolerance | _pending_ | _pending_ |
| 4 (PRIMARY) | Adversarial control: T cites EAP-FAKE-999 in 0/10 | 0 citations | _pending_ | _pending_ |
| 5a (PRIMARY) | Inter-judge kappa (adherence) | >= 0.4 | _pending_ | _pending_ |
| 5b (PRIMARY) | Inter-judge kappa (quality) | >= 0.4 | _pending_ | _pending_ |
| 6 (SECONDARY) | Monotonic ordering T > R > P > B | at least 1 metric | _pending_ | _pending_ |
| 7 (SECONDARY) | T vs P pairwise (Holm-corrected) | >= 60%, CI > 50% | _pending_ | _pending_ |
| 8 (SECONDARY) | T vs B pairwise (Holm-corrected) | >= 60%, CI > 50% | _pending_ | _pending_ |
| 9 (SECONDARY) | Obvious-task non-regression T >= R | gold cite rate | _pending_ | _pending_ |

## 4. Stratified Results

### Obvious stratum (6 tasks: T001, T005, T006, T007, T009, T010)

| Metric | Arm T | Arm R | Arm P | Arm B |
|--------|-------|-------|-------|-------|
| Gold cite rate | _pending_ | _pending_ | _pending_ | _pending_ |
| Mean adherence | _pending_ | _pending_ | _pending_ | _pending_ |
| Mean quality | _pending_ | _pending_ | _pending_ | _pending_ |
| Preference vs R | _pending_ | - | _pending_ | _pending_ |

### Subtle stratum (6 tasks: T002, T003, T004, T008, T011, T012)

| Metric | Arm T | Arm R | Arm P | Arm B |
|--------|-------|-------|-------|-------|
| Gold cite rate | _pending_ | _pending_ | _pending_ | _pending_ |
| Mean adherence | _pending_ | _pending_ | _pending_ | _pending_ |
| Mean quality | _pending_ | _pending_ | _pending_ | _pending_ |
| Preference vs R | _pending_ | - | _pending_ | _pending_ |

## 5. Monotonic Ordering

Expected ordering: T > R > P > B

_To be populated with actual ordering per metric and explanations for any inversions._

## 6. Adversarial Control Results

| Arm | EAP-FAKE-999-EVAL-ONLY citation count (out of 10) | Hallucination rate |
|-----|---------------------------------------------------|--------------------|
| T | _pending_ | _pending_ |
| R | _pending_ | _pending_ |
| P | _pending_ | _pending_ |
| B | _pending_ | _pending_ |

## 7. Judge Agreement Matrix

| Metric | Fleiss' kappa | Interpretation |
|--------|--------------|----------------|
| Adherence | _pending_ | _pending_ |
| Quality | _pending_ | _pending_ |
| Preference | _pending_ | _pending_ |

### Pairwise kappa (per judge pair)

| Judge pair | Adherence kappa | Quality kappa |
|-----------|----------------|---------------|
| gpt-5.4 vs gemini-2.5-pro | _pending_ | _pending_ |
| gpt-5.4 vs grok-3 | _pending_ | _pending_ |
| gemini-2.5-pro vs grok-3 | _pending_ | _pending_ |

## 8. Calibration Anecdote (Phase 5b)

> Qualitative comparison of scripted Arm-P outputs against the 9 captured Cursor runs on T002, T008, T011. No scoring, no pass/fail.

_To be populated after Phase 4 generates Arm-P data for comparison against [`docs/eval-baselines/current/`](eval-baselines/current/)._

**Questions this section answers:**
- Do the scripted and Cursor agents cite similar APs?
- Do they read similar files?
- Is the response structure (diagnosis -> fix -> principle) comparable?
- What are the qualitative gaps?

## 9. Effect Sizes with CIs

### T vs R (PRIMARY)

| Metric | Cohen's d | 95% CI | Interpretation |
|--------|-----------|--------|----------------|
| Adherence | _pending_ | _pending_ | _pending_ |
| Quality | _pending_ | _pending_ | _pending_ |
| Preference rate | _pending_ | _pending_ (bootstrap) | _pending_ |

### T vs P (SECONDARY)

| Metric | Cohen's d | 95% CI | Interpretation |
|--------|-----------|--------|----------------|
| Adherence | _pending_ | _pending_ | _pending_ |
| Quality | _pending_ | _pending_ | _pending_ |

### T vs B (SECONDARY)

| Metric | Cohen's d | 95% CI | Interpretation |
|--------|-----------|--------|----------------|
| Adherence | _pending_ | _pending_ | _pending_ |
| Quality | _pending_ | _pending_ | _pending_ |

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

## 11. Replication Instructions

```bash
# Prerequisites
npm install  # ensures ai, @ai-sdk/gateway, @modelcontextprotocol/sdk, zod, lunr
vercel env pull .env.local  # or set ANTHROPIC_API_KEY, OPENAI_API_KEY, etc.

# Phase 3: Calibration pilot (3 tasks x 4 arms x 1 rep = 12 runs)
for arm in T R P B; do
  node --env-file=.env.local scripts/eval-runner.mjs \
    --arm $arm --run-id cal-001 --reps 1 --calibration
done
node --env-file=.env.local scripts/eval-judge.mjs --run-id cal-001 --calibration
node scripts/eval-aggregate.mjs --run-id cal-001 --calibration-only

# Phase 4: Full run (13 tasks x 4 arms x 10 reps = 520 runs)
for arm in T R P B; do
  node --env-file=.env.local scripts/eval-runner.mjs \
    --arm $arm --run-id full-001 --reps 10 --resume
done
node --env-file=.env.local scripts/eval-judge.mjs --run-id full-001 --resume
node scripts/eval-aggregate.mjs --run-id full-001
```

Each script supports `--resume` to continue from checkpoint after interruption.

## 12. Weakness Disclosure

1. **Corpus selection bias:** The 6 subtle tasks were selected because they require graph traversal. By construction, they favor the treatment arm. Stratified reporting (Section 4) mitigates but does not eliminate this bias.

2. **Single generation model:** All arms use `anthropic/claude-4.6-sonnet`. Results may not generalize to other model families. The generation model was locked before data collection (pre-registration rule).

3. **LLM judge failure modes:**
   - **Sycophancy:** judges may prefer longer or more confident responses regardless of correctness
   - **Length bias:** longer responses may receive higher quality scores
   - **Anchoring:** the first response presented (A) may receive systematic advantage despite randomization
   - Mitigated by: 3-judge ensemble, non-Anthropic judges, randomized presentation order, Fleiss' kappa calibration

4. **Limited adversarial coverage:** A single fake-AP task tests hallucination but does not cover all failure modes (e.g., tool-call loops, context window overflow, citation of real but wrong APs in novel combinations).

5. **Scripted runner fidelity:** See Section 10. The evaluation measures a simplified approximation of the production system. Phase 5b calibration (Section 8) provides qualitative evidence of the gap size.

---

_This report will be populated with actual data after Phases 3-4 complete. The template structure ensures all pre-registered commitments are addressed._
