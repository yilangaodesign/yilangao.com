# §18. Portfolio Coherence Manifest

> **What this file is:** A living inventory tracking stylistic and structural diversity across all active case studies. Ensures the portfolio doesn't repeat the same narrative shape, headline technique, or voice register across multiple entries.
>
> **Who reads this:** AI agents during case study authoring (diversity gate, Phase 1a Step 5), case study review (Check 18), and content iteration (when edits might break diversity).
> **Who writes this:** AI agents at the end of case-study-authoring Phase 4 (dossier step) and after content-iteration changes that affect portfolio-level dimensions.
> **Last updated:** 2026-04-05 (initial creation)

---

## Six Dimensions

The manifest tracks six dimensions per case study:

1. **Narrative shape** — from the named shapes vocabulary in `narrative-arc.md` §12.9
2. **Blurb headline technique** — which of Techniques 6-10 from `personal-voice.md` is primary
3. **Voice register** — professional-declarative, conversational-irreverent, etc.
4. **Metric type** — percentage improvement, absolute reduction, behavioral change, qualitative
5. **Evidence method** — task-based evaluation, production analytics, behavioral observation, user quote
6. **Employment context** — interview-only field, never in portfolio text; tracks what the candidate needs to be prepared to discuss

---

## Current State

| Dimension | Meteor | Lacework | Elan |
|---|---|---|---|
| **Narrative shape** | Contrarian Discovery | Rescue Arc | Accumulation Arc |
| **Headline technique** | Protagonist Framing (T10) | Protagonist Framing (T10) | Metaphor + Punch-Counterpunch (T1 stretched to headline) |
| **Voice register** | Professional-declarative | Professional-declarative | Conversational-irreverent |
| **Metric type** | Absolute reduction (12K to 560) | Percentage improvement (58%) | TBD (pending hero metric confirmation) |
| **Evidence method** | Behavioral observation ("stopped verifying line by line") | Task-based evaluation with internal users | Interactive demo as evidence |
| **Employment context** | Full-time founding role | Interview-only context | Personal project (2026 - Present) |

---

## Diversity Assessment

- **Narrative shapes:** 3 different shapes across 3 case studies (good)
- **Headline techniques:** 2 of 3 use Protagonist Framing. Elan's T1 provides the variance. Any new case study (4th+) must use a different primary technique. Do not change Elan to T10 during a rebuild.
- **Voice registers:** 2 professional-declarative + 1 conversational (acceptable - Elan's domain justifies the register shift)
- **Metric types:** 3 different types (good)
- **Evidence methods:** 3 different methods (good)

---

## How to Update

After authoring or rebuilding a case study, update the table row for that project. After adding a new case study, add a new column. Re-run the diversity assessment and note any new flags.

## Cross-references

- Named narrative shapes: `docs/content/narrative-arc.md` §12.9
- Headline techniques: `docs/content/personal-voice.md` Techniques 6-10
- Diversity gate: `.cursor/skills/case-study-authoring/SKILL.md` Phase 1a Step 5b
- Employment classification guardrail: `docs/content-anti-patterns.md` CAP-026
