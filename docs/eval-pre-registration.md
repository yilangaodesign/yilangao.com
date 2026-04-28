# Eval Pre-Registration

> **Status:** Pre-registered. Committed before any corpus generation runs.
> **Plan:** [`.cursor/plans/self-automated_kg_a_b_eval_a49a67c6.plan.md`](../.cursor/plans/self-automated_kg_a_b_eval_a49a67c6.plan.md)
> **Corpus:** [`docs/eval-task-corpus.md`](eval-task-corpus.md) (frozen, 12 tasks)
> **Adversarial controls:** [`docs/eval-adversarial-controls.md`](eval-adversarial-controls.md) (1 task, separate from corpus)
> **Calibration prompts:** [`docs/eval-calibration-prompts.md`](eval-calibration-prompts.md) (3 held-out tasks)
> **Judge rubric:** [`docs/eval-judge-rubric.md`](eval-judge-rubric.md) (frozen after Phase 3)
>
> **LOCKED after Phase 3.** Any post-lock change requires a SHA-stamped amendment prominently disclosed in the final report.

## Hypothesis

The post-initiative documentation system (knowledge graph + MCP server + tagged feedback logs + audit skills at HEAD), when accessed by a scripted AI SDK agent via MCP tools (`query-node`, `subgraph`, `search`) and keyword-matched skill-fragment injection, produces measurably better outputs on the 12-task corpus at [`docs/eval-task-corpus.md`](eval-task-corpus.md) than three alternative retrieval configurations.

"Better" is defined by frozen rubrics and decision rules below, committed before any corpus data is observed.

## Scoped claim

This evaluation measures whether **graph-based retrieval improves a scripted AI SDK agent** on a frozen 12-task corpus. It does NOT measure the full production system (Cursor IDE + AGENTS.md routing + 16 skills + tool-triggered skill injection + IDE context). That stronger claim requires Cursor-in-the-loop runs. The scripted approximation is a deliberate trade-off for automation. Phase 5b provides qualitative calibration against 9 captured Cursor runs.

## Arms

All four arms use the same scripted runner (`scripts/eval-runner.mjs`), same generation model, same system prompt skeleton. They differ only in available tools and injected context.

### Arm T (Treatment)

- **Tools:** 3 MCP tools proxied to `scripts/mcp-graph-server.mjs` (spawned as child process via stdio):
  - `query-node` - 1-hop neighborhood lookup by node ID
  - `subgraph` - N-hop neighborhood (default 1, max 3)
  - `search` - BM25 keyword search across graph nodes
  - Plus `read_file` for reading docs referenced in graph results
- **Skill injection:** For each task prompt, match against trigger phrases extracted from each `.cursor/skills/*/SKILL.md` (`description` field + "Use when" / "Trigger:" / "triggers:" lines). Score by keyword overlap. Inject top-3 as system prompt sections. Log which skills were injected per run.
- **Context:** Full post-initiative docs at HEAD

### Arm R (Naive RAG at HEAD)

- **Tools:** `grep_docs` (ripgrep over `docs/`, `AGENTS.md`, `.cursor/skills/`, `.cursor/rules/`), `lunr_search` (BM25 over `.cache/search-index.json`), `read_file`
- **Skill injection:** None
- **Context:** Full post-initiative docs at HEAD (same files, different retrieval)

### Arm P (Pre-init docs replay)

- **Tools:** `grep_docs_pre_init` + `read_file_pre_init` reading from git worktree at `eval-baseline-current`
- **Skill injection:** None
- **Context:** Pre-initiative docs only (tag `eval-baseline-current`)

### Arm B (Bare LLM)

- **Tools:** None
- **Skill injection:** None
- **Context:** None (parametric knowledge only)

## Generation model (locked)

`anthropic/claude-4.6-sonnet` via AI Gateway OIDC. Strong tool-use capability, mid-cost, same Anthropic family as the 9 baseline captures (`claude-opus-4.6`). Sonnet instead of opus for cost control at N=520.

## Judge ensemble (locked)

Three non-Anthropic models (generation model is Anthropic; no same-family judging):

1. `openai/gpt-5.4`
2. `google/gemini-2.5-pro`
3. `xai/grok-3`

All via AI Gateway OIDC.

## Sample size

**N = 10 repetitions per task per arm.**

- 12 corpus tasks x 10 runs x 4 arms = 480 primary generation runs
- 1 adversarial task x 10 runs x 4 arms = 40 adversarial runs
- **Total: 520 generation runs**

**Justification for N=10 override:** The inherited contract ([`docs/eval-baselines/README.md`](eval-baselines/README.md) line 198) specifies N=5, sized for a human-graded protocol (~20min per grading session). Automated judging removes that bottleneck. N=10 provides higher statistical power for the paired comparisons.

**Judging:** 3 comparison pairs per task-run (T-R, T-P, T-B) x 3 judges each.
- 12 tasks x 10 runs x 3 pairs x 3 judges = 1080 primary judge calls
- 1 adversarial x 10 runs x 3 pairs x 3 judges = 90 adversarial judge calls
- **Total: 1170 judge calls**

R-P, R-B, P-B monotonic ordering is inferred from the directly-scored pairs, not separately judged.

## Rubrics

See [`docs/eval-judge-rubric.md`](eval-judge-rubric.md) for the exact judge prompts. Summary:

### Adherence (1-5)

Measures how well the response addresses the user's specific request with actionable, correct guidance.

| Score | Criteria |
|-------|----------|
| 5 | Directly addresses the request, provides the correct fix with code-level specificity, cites the relevant principle/anti-pattern, and explains the root cause |
| 4 | Addresses the request correctly with minor omissions (e.g., missing one edge case, principle stated but not cited by ID) |
| 3 | Partially correct - identifies the right area but misses the root cause or provides an incomplete fix |
| 2 | Tangentially related response that doesn't solve the stated problem |
| 1 | Off-topic, wrong diagnosis, or harmful advice |

### Quality (1-5)

Measures response clarity, specificity, and professional utility independent of correctness.

| Score | Criteria |
|-------|----------|
| 5 | Clear diagnosis-then-fix structure, specific file/line references, no filler, actionable immediately |
| 4 | Well-structured and specific with minor verbosity or formatting issues |
| 3 | Understandable but verbose, vague on specifics, or poorly structured |
| 2 | Confusing structure, significant filler, hard to act on |
| 1 | Incoherent, contradictory, or unusable |

### Pairwise preference

Given two unlabeled responses to the same prompt (presented in randomized order):
- **A wins** - Response A is meaningfully better on adherence AND quality
- **Tie** - Responses are comparable or each is better on different dimensions
- **B wins** - Response B is meaningfully better on adherence AND quality

### Citation extraction (deterministic, not LLM-judged)

Regex `(AP|EAP|CAP)-\d+` applied to the model's final response text. Each extracted ID is compared against the task's `expected_citation` field:
- **Gold cite** = extracted ID matches `expected_citation`
- **Wrong cite** = extracted ID does NOT match `expected_citation`
- **No cite** = no AP/EAP/CAP pattern found

## Statistical tests

1. **Wilcoxon signed-rank** (paired) on continuous metrics (adherence, quality) - T vs R, T vs P, T vs B
2. **McNemar's test** on binary citation (gold AP cited: yes/no) - T vs R (primary), T vs P, T vs B (secondary)
3. **Bootstrap 95% CI** on pairwise preference rate (10,000 iterations)
4. **Fleiss' kappa** per metric (adherence, quality, preference) across the 3 judges
5. **Cohen's d** effect sizes with 95% CI

## Decision rules

### Primary comparison: T vs R

Treatment "wins" only if ALL of rules 1-5 hold:

1. **Primary outcome.** Pairwise judge preference T > R in >= 60% of paired comparisons across all 12 corpus tasks (95% CI lower bound > 50%, bootstrap 10,000 iterations).

2. **Co-primary on citation (subtle stratum).** Gold AP cite rate: T >= R + 10 percentage points on the 6 subtle tasks (graph-required, per corpus selection criteria).

3. **Non-inferiority on hallucination.** Wrong-cite rate (any `(AP|EAP|CAP)-\d+` citation not matching the task's `expected_citation`): T <= R + 5 percentage points across all 12 tasks.

4. **Adversarial control.** T cites `EAP-FAKE-999-EVAL-ONLY` in 0 out of N=10 adversarial runs. Any non-zero rate invalidates the citation metric for T.

5. **Inter-judge agreement.** Fleiss' kappa >= 0.4 on adherence AND quality. If kappa < 0.4 on either, that metric is reported as inconclusive, not as a win.

### Secondary comparisons (exploratory, Holm-corrected)

6. **Monotonic ordering.** T > R > P > B on at least one of: gold cite rate, judge preference, adherence rubric. Inversions require written explanation. Reported stratified by obvious (6 tasks) and subtle (6 tasks).

7. **T vs P pairwise.** Same structure as rule 1, Holm-adjusted p-value.

8. **T vs B pairwise.** Same structure as rule 1, Holm-adjusted p-value.

9. **Obvious-task non-regression.** T >= R on obvious tasks (gold cite rate). Regression signals the graph is interfering with simple lookups.

### Interpretation

- Rules 1-5 all pass: "Treatment wins"
- Any of rules 1-5 fail: "No effect detected" or "Inconclusive" (specify which rule failed)
- No post-hoc reweighting
- Secondary comparisons labeled as exploratory in the report

## Exclusion criteria

A generation run is excluded from analysis if:
- The model produces an empty response (zero content tokens)
- The model enters a tool-call loop (>10 consecutive identical tool calls)
- The runner crashes mid-run (incomplete transcript)
- Budget cap is hit (run did not complete)

Excluded runs are reported with counts per arm. If >20% of runs in any arm are excluded, that arm's results are flagged as unreliable.

## Stratified reporting

All metrics are reported twice:
- **Obvious stratum** (6 tasks: T001, T005, T006, T007, T009, T010) - AP is a direct grep hit
- **Subtle stratum** (6 tasks: T002, T003, T004, T008, T011, T012) - requires graph traversal or cross-reference

The selection-bias discount (subtle tasks favor treatment by construction) is applied by reporting strata separately, not by a numerical discount. The reader sees both effect sizes and decides.

## Budget

- **Hard cap: $300** for Phase 4 generation + judging
- Runner tracks cumulative cost per-run and halts if cap is exceeded
- Report discloses how many runs completed if cap is hit

## Calibration (Phase 3)

Before any corpus data is observed, 3 held-out calibration prompts (from `docs/eval-calibration-prompts.md`) are run through all 4 arms (12 generation runs) and judged (27 judge calls). Fleiss' kappa is computed on adherence and quality.

- kappa >= 0.4 on both: rubrics locked permanently, proceed to Phase 4
- kappa < 0.4 on either: revise rubric wording, re-run (max 2 cycles)
- After Phase 3, the final rubric revision becomes the permanently locked rubric regardless of kappa outcome

## Fidelity gaps (scripted runner vs production Cursor agent)

These gaps are inherent to the automation trade-off and must be disclosed in the report:

| Gap | Production behavior | Scripted approximation | Impact |
|-----|---------------------|----------------------|--------|
| Pre-Flight routing | AGENTS.md 16-route classifier activates skills via semantic cues | Skills matched by keyword overlap with prompt | Treatment arm may under-activate skills |
| Skill injection | `pretooluse-skill-inject.mjs` fires per tool call, dedup, 18KB budget, max 3 | One-time injection at prompt time, top-3 by keyword | Fewer skill fragments than a real session |
| IDE context | Open-file list, edit history, cursor position, linter errors | Not available | Less ambient context |
| AGENTS.md auto-read | Always-applied workspace rule, read every session | Injected as system prompt once | Functionally equivalent for single-turn eval |
| R vs P tool asymmetry | N/A | Arm R has 3 tools (grep+lunr+read); Arm P has 2 (grep+read) | R > P may reflect tool-count, not doc-quality |
| Tool results | Cursor captures args only; scripted captures args+results | Richer transcripts | Favors all arms equally |

---

```yaml
# --- machine-parseable decision thresholds (do not reformat) ---
thresholds:
  primary_preference_pct: 60        # rule 1: T>R pairwise >= this %
  primary_preference_ci_floor: 50   # rule 1: 95% CI lower bound > this %
  citation_advantage_pp: 10         # rule 2: T cite rate >= R + this pp (subtle)
  hallucination_tolerance_pp: 5     # rule 3: T wrong-cite rate <= R + this pp
  adversarial_max_cite: 0           # rule 4: T fake-AP cites <= this
  judge_kappa_floor: 0.4            # rule 5: Fleiss' kappa >= this
  bootstrap_iterations: 10000       # rule 1: bootstrap CI iterations
  budget_cap_usd: 300               # Phase 4 hard cap
```
