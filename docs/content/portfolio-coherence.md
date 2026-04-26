<!-- graph metadata for docs knowledge graph (see docs/knowledge-graph.md) -->
---
type: spoke
id: content-portfolio-coherence
topics:
  - content
  - port-registry
  - portfolio
  - branding
  - parity
derivedFrom:
  - content.md
---

# §18. Portfolio Coherence Manifest

> **What this file is:** A living inventory tracking stylistic and structural diversity across all active case studies. Ensures the portfolio doesn't repeat the same narrative shape, headline technique, or technique emphasis across multiple entries.
>
> **Who reads this:** AI agents during case study authoring (diversity gate, Phase 1a Step 5), case study review (Check 18), and content iteration (when edits might break diversity).
> **Who writes this:** AI agents at the end of case-study-authoring Phase 4 (dossier step) and after content-iteration changes that affect portfolio-level dimensions.
> **Last updated:** 2026-04-06 (Voice Framework Upgrade - replaced Voice register with Technique emphasis dimension)

---

## Seven Dimensions

The manifest tracks seven dimensions per case study:

1. **Content format** — case study or essay (determines which ratio, word count, and review rules apply)
2. **Narrative shape** — from the named shapes vocabulary in `narrative-arc.md` §12.9
3. **Blurb headline technique** — which of Techniques 6-10 from `personal-voice.md` is primary
4. **Technique emphasis** — which body techniques (T1-T15) appear prominently; tracked as 2-3 technique numbers
5. **Metric type** — percentage improvement, absolute reduction, behavioral change, qualitative. N/A for essays.
6. **Evidence method** — task-based evaluation, production analytics, behavioral observation, user quote. N/A for essays; use "Argument coherence" instead.
7. **Employment context** — interview-only field, never in portfolio text; tracks what the candidate needs to be prepared to discuss

---

## Current State

| Dimension | Meteor | Lacework | Elan | ETRO |
|---|---|---|---|---|
| **Content format** | Case study | Case study | Case study | Essay |
| **Narrative shape** | Contrarian Discovery | Rescue Arc | Translation Arc | Accumulation Arc |
| **Headline technique** | Protagonist Framing (T10) | Protagonist Framing (T10) | Verdict + Staccato Authority (T8) | Deliberate Ambiguity (T9) |
| **Technique emphasis** | T3+T4 (Survival Frame, Escalation) | T10+T8 (Protagonist, Verdict) | T11+T13+T15 (Identification, Anti-Sell, Closed-Loop) | T13+T14 (Anti-Sell, Emotional Deflation) |
| **Metric type** | Absolute reduction (12K to 560) | Percentage improvement (58%) | Behavioral/maturity-based absolute (15 → 3) | N/A |
| **Evidence method** | Behavioral observation ("stopped verifying line by line") | Task-based evaluation with internal users | Interactive demo (3 Tier 3 components) | Argument coherence |
| **Employment context** | Full-time founding role | Interview-only context | Personal project (2026 - Present) | Cross-domain expertise |

---

## Diversity Assessment

- **Content formats:** 3 case studies + 1 essay (good). Format diversity established.
- **Narrative shapes:** 4 different shapes across 4 entries (good). Accumulation Arc (ETRO) is distinct from all case study shapes.
- **Headline techniques:** 4 distinct techniques across 4 entries (good). Meteor and Lacework use T10, Elan uses T8 (Verdict + Staccato Authority), ETRO uses T9. Any new entry (5th+) should avoid T10 (already at 2/4).
- **Technique emphasis:** 4 distinct technique pairs across 4 entries (good). No two entries share a primary technique. ETRO's T13+T14 pair is unique.
- **Metric types:** 3 different types across case studies + N/A for ETRO (good). For dimensions marked N/A, the diversity gate skips the repetition check. N/A vs N/A is not a repetition.
- **Evidence methods:** 3 different methods across case studies + "Argument coherence" for ETRO (good). ETRO's evidence method is structural rather than empirical.

---

## N/A Handling Rules

For dimensions marked N/A (e.g., metric type and evidence method for essays):
- The diversity gate **skips** the repetition check for N/A dimensions.
- N/A vs N/A is **not** a repetition. Two essays can both have N/A metric type without triggering a flag.
- N/A vs a real value is **not** a conflict. An essay's N/A does not "use up" a metric type slot.

## How to Update

After authoring or rebuilding a case study, update the table row for that project. After adding a new case study, add a new column. Re-run the diversity assessment and note any new flags.

## Cross-references

- Named narrative shapes: `docs/content/narrative-arc.md` §12.9
- Headline + body techniques: `docs/content/personal-voice.md` Techniques 1-15
- Diversity gate: `.cursor/skills/case-study-authoring/SKILL.md` Phase 1a Step 5b (7 dimensions)
- Employment classification guardrail: `docs/content-anti-patterns.md` CAP-026
