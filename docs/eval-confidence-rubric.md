---
type: eval-spec
id: eval-confidence-rubric
topics: [eval, knowledge-graph, confidence]
references:
  - docs/eval-confidence-sample-v0.md
  - docs/knowledge-graph.md
---

# Confidence Score Calibration — Labeling Rubric

> **Status:** LOCKED. No edits after C3 labeling begins.
>
> **Purpose:** Define the ground-truth labels for evaluating whether the knowledge graph's confidence scores (1.0 / 0.6 / 0.5) predict edge utility.
>
> **Labeler:** Human (portfolio author). The AI agent must NOT label edges — the labels measure "would an agent find this edge useful," which is self-referential if the agent labels its own utility.

## Label Definitions

Each sampled edge receives exactly one label. The labeler should assess the edge **independently of its current confidence score** — label first, compare to predicted confidence after.

| Label | Meaning | Decision question | Examples |
|---|---|---|---|
| `authoritative` | An agent retrieving this edge would get directly useful, on-topic context for the task implied by the source node. | "If I followed this edge during a task, would I land on exactly the thing I need?" | A skill `enforces` an AP the agent should cite. A guardrail `references` the exact anti-pattern it gates. A hub `documents` its direct spoke. |
| `relevant` | Tangentially useful — same topic area, but not the primary thing the agent needs. Following the edge wouldn't hurt, but it adds noise or a detour. | "Related, but would I need to keep searching after following this?" | A spoke `references` another spoke in the same pillar. A feedback entry mentions an AP in passing context. |
| `noise` | Off-topic, stale, or misleading. Agent retrieval would be actively hurt or wasted. | "Following this edge would confuse or distract the agent." | A bare ID mention inside a code example, quoted block, or renumber log. An edge to a deprecated node with no current relevance. A false positive from the citation regex. |
| `ambiguous` | Edge meaning is genuinely unclear without more context. Labeling would be a coin flip. | "I honestly can't tell if this is useful or noise even after reading the source." | A bare ID in a footnote that may or may not refer to the same concept. An edge whose source text was truncated and context is lost. |

## Label Mapping (v4 → rubric)

The labeling sheet (v4) uses plain-language labels. They map 1:1 to the rubric's internal labels used in calibration math:

| v4 code | v4 label (what you write) | Rubric label (used in C4 math) |
|---------|---------------------------|-------------------------------|
| **D** | Strongly related | `authoritative` |
| **C** | Loosely related | `relevant` |
| **B** | Not related | `noise` |
| **A** | Can't tell | `ambiguous` |

## Labeling Procedure

1. For each edge in [eval-confidence-sample-v4.md](eval-confidence-sample-v4.md) (the human-readable, bias-free version):
   - Read the descriptions of Document A and Document B.
   - Pick one label: **Strongly related**, **Loosely related**, **Not related**, or **Can't tell**.
   - If the label is hard to decide, pick **Can't tell** rather than forcing a guess.
2. Write your label on the blank line next to "How related are these?"
3. Document any "rubric edge cases" — edges where the label was hard to assign, with a brief note on why.

## Exclusion Rule

`ambiguous` edges are **excluded from all calibration math** (ECE, sign tests, reliability diagram). They appear in the C4 report as a count and percentage.

**If `ambiguous` exceeds 20% of the sample (>12 of 60 edges):** the rubric is too vague. Abort C3, revise the rubric, and re-label from scratch.

## Scoring Map (for C4 calibration)

For computing ECE and reliability diagrams, labels map to a binary "useful" indicator:

| Label | Useful? | Rationale |
|---|---|---|
| `authoritative` | 1 | Directly useful — this is what confidence should predict. |
| `relevant` | 0.5 | Partially useful — acknowledged but not the primary target. |
| `noise` | 0 | Not useful — retrieval would hurt. |
| `ambiguous` | excluded | Cannot score — excluded from math. |

The **observed utility** for a tier is the mean of these values across all non-ambiguous edges in that tier. The **expected utility** is the confidence score itself (1.0, 0.6, or 0.5). ECE = |observed - expected| averaged across tiers.

## Known Limitations

- **Single labeler.** Inter-rater reliability cannot be computed. Mitigation: rubric locked before labeling, edge cases documented, `ambiguous` class prevents forced noisy labels.
- **Sample size.** N=20 per tier detects ~30pp differences at 80% power. Smaller real differences will fail to reject the null. See C4 for explicit power disclosure.
