# §18. Portfolio Coherence Manifest

> **What this file is:** A living inventory tracking stylistic and structural diversity across all active case studies. Ensures the portfolio doesn't repeat the same narrative shape, headline technique, or technique emphasis across multiple entries.
>
> **Who reads this:** AI agents during case study authoring (diversity gate, Phase 1a Step 5), case study review (Check 18), and content iteration (when edits might break diversity).
> **Who writes this:** AI agents at the end of case-study-authoring Phase 4 (dossier step) and after content-iteration changes that affect portfolio-level dimensions.
> **Last updated:** 2026-04-06 (Voice Framework Upgrade - replaced Voice register with Technique emphasis dimension)

---

## Six Dimensions

The manifest tracks six dimensions per case study:

1. **Narrative shape** — from the named shapes vocabulary in `narrative-arc.md` §12.9
2. **Blurb headline technique** — which of Techniques 6-10 from `personal-voice.md` is primary
3. **Technique emphasis** — which body techniques (T1-T15) appear prominently; tracked as 2-3 technique numbers
4. **Metric type** — percentage improvement, absolute reduction, behavioral change, qualitative
5. **Evidence method** — task-based evaluation, production analytics, behavioral observation, user quote
6. **Employment context** — interview-only field, never in portfolio text; tracks what the candidate needs to be prepared to discuss

---

## Current State

| Dimension | Meteor | Lacework | Elan |
|---|---|---|---|
| **Narrative shape** | Contrarian Discovery | Rescue Arc | Translation Arc |
| **Headline technique** | Protagonist Framing (T10) | Protagonist Framing (T10) | Framework Inversion (T7) |
| **Technique emphasis** | T3+T4 (Survival Frame, Escalation) | T10+T8 (Protagonist, Verdict) | T11+T13+T15 (Identification, Anti-Sell, Closed-Loop) |
| **Metric type** | Absolute reduction (12K to 560) | Percentage improvement (58%) | Behavioral/maturity-based absolute (15 → 3) |
| **Evidence method** | Behavioral observation ("stopped verifying line by line") | Task-based evaluation with internal users | Interactive demo (3 Tier 3 components) |
| **Employment context** | Full-time founding role | Interview-only context | Personal project (2026 - Present) |

---

## Diversity Assessment

- **Narrative shapes:** 3 different shapes across 3 case studies (good). Translation Arc is new to the portfolio.
- **Headline techniques:** 2 of 3 use Protagonist Framing. Elan v3 uses Framework Inversion (T7), providing strong variance. Any new case study (4th+) should avoid T10 (already at 2/3).
- **Technique emphasis:** 3 distinct technique pairs across 3 case studies (good). No two case studies share a primary technique. Any new case study (4th+) should avoid T3, T4, T10, T8, T11, T13, T15 as primary pair members.
- **Metric types:** 3 different types (good). Elan's maturity-based metric differs from both percentage and absolute reduction.
- **Evidence methods:** 3 different methods (good). Elan's interactive demo method is unique in the portfolio.

---

## How to Update

After authoring or rebuilding a case study, update the table row for that project. After adding a new case study, add a new column. Re-run the diversity assessment and note any new flags.

## Cross-references

- Named narrative shapes: `docs/content/narrative-arc.md` §12.9
- Headline + body techniques: `docs/content/personal-voice.md` Techniques 1-15
- Diversity gate: `.cursor/skills/case-study-authoring/SKILL.md` Phase 1a Step 5b
- Employment classification guardrail: `docs/content-anti-patterns.md` CAP-026
