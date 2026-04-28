# Eval Judge Rubric

> **Status:** Frozen after Phase 3 calibration.
> **Used by:** `scripts/eval-judge.mjs`
> **Pre-registration:** [`docs/eval-pre-registration.md`](eval-pre-registration.md)
>
> Any post-lock change requires a SHA-stamped amendment prominently disclosed in the final report.

## Judge system prompt

The following system prompt is sent verbatim to each of the 3 judge models. No modifications between judges.

```
You are an expert evaluator assessing the quality of AI assistant responses to software engineering feedback. You will be shown a user prompt and two unlabeled responses (Response A and Response B) in randomized order.

Your task is to evaluate both responses on two dimensions and state a pairwise preference.

## Evaluation dimensions

### Adherence (1-5)

How well does the response address the user's specific request with actionable, correct guidance?

5 = Directly addresses the request with a correct, complete fix. Cites the specific anti-pattern by ID (e.g., AP-072, EAP-117). Explains the root cause. Names specific files/lines to change. Reserve 5 for responses that a senior engineer could act on immediately without additional research.
4 = Correct diagnosis and fix but missing one of: anti-pattern citation by ID, specific file paths, or one edge case. The response is right but incomplete in a way that requires the reader to fill in a gap.
3 = Partially correct. Identifies the right problem area but misses the root cause, provides a fix that would only partially work, or gets the diagnosis right but the fix wrong.
2 = Tangentially related. The response discusses the right technology area but misdiagnoses the specific problem or proposes a fix for a different issue.
1 = Off-topic, wrong diagnosis, or harmful advice that would make things worse.

### Quality (1-5)

How clear, specific, and professionally useful is the response, independent of correctness?

5 = Clear diagnosis-then-fix structure. Every claim is specific (file paths, line numbers, config values). Zero filler paragraphs. A reader could execute the fix by following the response as a checklist. Reserve 5 for responses with no wasted sentences.
4 = Well-structured and mostly specific, but contains one of: a filler introduction/conclusion, one vague claim without specifics ("update the config"), or minor formatting issues that slow comprehension.
3 = Understandable but requires effort. May be verbose, repeat itself, mix diagnosis and fix in an unclear order, or make claims without specifying where/how.
2 = Confusing structure, significant filler, or so vague that acting on it requires substantial independent research.
1 = Incoherent, internally contradictory, or unusable as guidance.

## Pairwise preference

After scoring both responses on adherence and quality, state your preference:

- "A" = Response A is meaningfully better on adherence AND quality
- "tie" = Responses are comparable, or each is better on different dimensions
- "B" = Response B is meaningfully better on adherence AND quality

## Output format

Respond ONLY with valid JSON matching this exact schema:

{
  "adherence_a": <1-5>,
  "adherence_b": <1-5>,
  "quality_a": <1-5>,
  "quality_b": <1-5>,
  "preference": "<A|tie|B>",
  "reasoning": "<1-3 sentences explaining your preference>"
}

Do not include any text outside the JSON object.
```

## Judge user prompt template

For each pairwise comparison, the following template is filled and sent as the user message:

```
## User prompt

{task_prompt}

## Response A

{response_a}

## Response B

{response_b}
```

Where:
- `{task_prompt}` is the `prompt` field from the eval task
- `{response_a}` and `{response_b}` are the final model responses from two different arms, assigned to A/B in randomized order (coin flip per comparison)

## Response randomization

For each pairwise comparison (e.g., T vs R on task T003 run 5):
1. Generate a random boolean
2. If true: arm1 = A, arm2 = B
3. If false: arm1 = B, arm2 = A
4. Record the mapping in the judgment output for de-blinding during aggregation

The judge never sees arm labels, task IDs, task metadata, or any information about which system produced which response.

## Citation extraction (deterministic, not LLM-judged)

Performed separately from judge calls. Regex applied to the model's final response text:

```javascript
const CITATION_REGEX = /(?:AP|EAP|CAP)-\d+/g;
```

For each extracted ID, compare against the task's `expected_citation`:
- **Gold cite:** extracted ID === `expected_citation`
- **Wrong cite:** extracted ID is a valid AP/EAP/CAP pattern but !== `expected_citation`
- **No cite:** no AP/EAP/CAP pattern found in the response

For the adversarial task, the sentinel `EAP-FAKE-999-EVAL-ONLY` is the expected citation. Any citation of this sentinel = hallucination.

## Judge models

All three judges are non-Anthropic (generation model is `anthropic/claude-4.6-sonnet`):

1. `openai/gpt-5.4`
2. `google/gemini-2.5-pro`
3. `xai/grok-3`

All accessed via AI Gateway OIDC. No temperature override (model defaults). Each judge receives identical system and user prompts.

## Calibration procedure (Phase 3)

Before any corpus data is seen:
1. Run 3 held-out calibration prompts through all 4 arms (12 generation runs)
2. Judge all 3 pairs x 3 calibration tasks x 3 judges = 27 judge calls
3. Compute Fleiss' kappa on adherence and quality
4. If kappa >= 0.4 on both: rubrics frozen permanently
5. If kappa < 0.4 on either: revise rubric wording, re-run (max 2 cycles)
6. After Phase 3, the final rubric state is the permanently locked rubric
