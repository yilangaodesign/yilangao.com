---
type: eval-spec
id: eval-confidence-sample
topics: [eval, knowledge-graph, confidence]
references:
  - docs/knowledge-graph.md
  - docs/eval-confidence-rubric.md
---

# Confidence Score Calibration — Edge Sample

> **Version:** v0 (raw technical data) — **Use [v4](eval-confidence-sample-v4.md) for labeling.** | [v1](eval-confidence-sample-v1.md) (plain language + numbers) | [v2](eval-confidence-sample-v2.md) (with raw context) | [v3](eval-confidence-sample-v3.md) (synthesized summaries)
>
> **Sampled:** 2026-05-03. **Method:** deterministic seeded shuffle per tier (seed: `plan-c-sample-2026-05-03`).
> **Population:** 5332 total edges (910 forward at conf=1.0, 197 forward at conf=0.6, 1559 forward at conf=0.5; inverse edges excluded).
> **Sample size:** 60 edges (20 per confidence tier).

## Population Counts (for C4 population-weighted ECE)

| Tier | Forward edges | % of total |
|------|-------------|------------|
| 1.0 | 910 | 34.1% |
| 0.6 | 197 | 7.4% |
| 0.5 | 1559 | 58.5% |

## Sampled Edges

| # | edge_id | from | to | type | confidence | source | source_text_excerpt | label |
|---|---------|------|----|------|------------|--------|---------------------|-------|
| 1 | E001 | `eval-graph-audit` | `eval_experiment_program_0516e9af.plan` | derivedFrom | 1.0 | frontmatter | - .cursor/plans/eval_experiment_program_0516e9af.plan.md | |
| 2 | E002 | `engineering` | `eap-042` | references | 1.0 | citation:See | \| Turbopack cache / HMR delivery failure \| 6+ \| **Critical — ESCALATED TWICE. ENG-047, ENG-056, ENG-067, ENG-085, ENG... | |
| 3 | E003 | `AGENTS` | `skill-case-study-authoring` | triggers | 1.0 | frontmatter | - skill-case-study-authoring | |
| 4 | E004 | `eng-019` | `eap-013` | references | 1.0 | citation:See | **Anti-patterns:** EAP-013 corrected (third time), EAP-014 added (hydration mismatch from window checks) | |
| 5 | E005 | `engineering-anti-patterns` | `eap-077` | documents | 1.0 | anchor:contained | \| Build / Toolchain / CSS \| EAP-011, EAP-012, EAP-031, EAP-035, EAP-038‡, EAP-039, EAP-040, EAP-069, EAP-072, EAP-077... | |
| 6 | E006 | `content-about-page` | `content` | derivedFrom | 1.0 | frontmatter | id: content-about-page | |
| 7 | E007 | `engineering-anti-patterns` | `eap-110` | documents | 1.0 | anchor:contained | > **Last updated:** 2026-04-26 (EAP-123: Missing `prose-paragraph-spacing` on HTML prose container — CSS resets strip... | |
| 8 | E008 | `AGENTS` | `guardrail-design-1` | documents | 1.0 | anchor:contained | 1. <a id="guardrail-design-1"></a>**NEVER** use inline `style={{}}` — always use Tailwind classes or CSS custom prope... | |
| 9 | E009 | `AGENTS` | `skill-password-gate` | triggers | 1.0 | frontmatter | - skill-password-gate | |
| 10 | E010 | `engineering-anti-patterns` | `eap-068` | documents | 1.0 | anchor:contained | \| Dev Workflow \| EAP-002, EAP-003, EAP-009, EAP-068, EAP-073, EAP-108 \| 6 active \| 6 \| | |
| 11 | E011 | `engineering` | `eap-007` | references | 1.0 | citation:See | \| Playground ↔ production drift (one-way experiment) \| 5 \| **Critical — ESCALATED. ENG-073, ENG-074, ENG-101, ENG-102... | |
| 12 | E012 | `AGENTS` | `skill-stress-test` | triggers | 1.0 | frontmatter | - skill-stress-test | |
| 13 | E013 | `AGENTS` | `guardrail-engineering-15` | documents | 1.0 | anchor:contained | 15. <a id="guardrail-engineering-15"></a>**NEVER** use barrel imports from `lucide-react` in the playground (`import ... | |
| 14 | E014 | `release-log-archive` | `rel-014` | documents | 1.0 | anchor:contained | <a id="rel-014"></a> | |
| 15 | E015 | `skill-stress-test` | `content` | references | 1.0 | frontmatter | Use when the user says "content stress test" or "fresh eyes" after new | |
| 16 | E016 | `content-anti-patterns` | `cap-005` | documents | 1.0 | anchor:contained | \| Information Architecture \| CAP-005, 008, 009, 010, 018, 031 \| 6 \| | |
| 17 | E017 | `engineering-anti-patterns` | `engineering` | enforces | 1.0 | frontmatter | id: engineering-anti-patterns | |
| 18 | E018 | `AGENTS` | `guardrail-design-7` | documents | 1.0 | anchor:contained | 7. <a id="guardrail-design-7"></a>**NEVER** use SVG to render text, labels, or component UI — SVG is permitted only f... | |
| 19 | E019 | `AGENTS` | `skill-doc-audit` | triggers | 1.0 | frontmatter | - skill-doc-audit | |
| 20 | E020 | `eng-021` | `eap-054` | references | 1.0 | citation:See | **Anti-pattern:** See EAP-054. | |
| 21 | E021 | `eng-200` | `eap-118` | references | 0.6 | citation:Related: | **Principle extracted -> `engineering-anti-patterns.md` EAP-118: Session-existence check without identity match on re... | |
| 22 | E022 | `eng-104-occ2` | `eng-230` | references | 0.6 | markdown-link | > **Last updated:** 2026-04-27 (ENG-266: Baseline eval transcript capture pivoted from `cursor-export-transcript` (op... | |
| 23 | E023 | `design` | `design-layout` | references | 0.6 | markdown-link | — | |
| 24 | E024 | `eap-120` | `knowledge-graph` | references | 0.6 | markdown-link | <!-- graph metadata for docs knowledge graph (see ../knowledge-graph.md) --> | |
| 25 | E025 | `fb-178` | `ap-065` | references | 0.6 | citation:Related: | **Loose match:** Related: AP-065. | |
| 26 | E026 | `content` | `content-conversion-funnel` | references | 0.6 | markdown-link | — | |
| 27 | E027 | `kg-synthetic-types` | `knowledge-graph-hygiene-decisions` | references | 0.6 | markdown-link | **Authority ordering: none (peer-level).** The six edge types carry no explicit authority rank. The semantic weight i... | |
| 28 | E028 | `content` | `content-analytics-measurement` | references | 0.6 | markdown-link | — | |
| 29 | E029 | `content` | `content-seniority-signals` | references | 0.6 | markdown-link | — | |
| 30 | E030 | `engineering-analytics-instrumentation` | `analytics` | references | 0.6 | markdown-link | id: engineering-analytics-instrumentation | |
| 31 | E031 | `eng-197` | `eap-119` | references | 0.6 | citation:Related: | **Loose match:** Related: EAP-119. | |
| 32 | E032 | `cfb-013` | `cap-003` | references | 0.6 | citation:Related: | **Loose match:** Related: CAP-003. | |
| 33 | E033 | `engineering` | `engineering-debugging` | references | 0.6 | markdown-link | — | |
| 34 | E034 | `engineering` | `engineering-versioning` | references | 0.6 | markdown-link | — | |
| 35 | E035 | `engineering-storage` | `engineering-media-embeds` | references | 0.6 | markdown-link | — | |
| 36 | E036 | `kg-section-index` | `kg-clusters` | references | 0.6 | markdown-link | - [14. Cluster validation](#kg-clusters) | |
| 37 | E037 | `kg-section-index` | `kg-maintenance` | references | 0.6 | markdown-link | - [16. Maintenance rules](#kg-maintenance) | |
| 38 | E038 | `content` | `content-portfolio-coherence` | references | 0.6 | markdown-link | — | |
| 39 | E039 | `engineering-media-embeds` | `engineering-storage` | references | 0.6 | markdown-link | — | |
| 40 | E040 | `kg-section-index` | `kg-id-naming` | references | 0.6 | markdown-link | - [3. ID naming](#kg-id-naming) | |
| 41 | E041 | `engineering` | `eap-115` | references | 0.5 | citation:bare | \| Verification gap (reporting done without browser check) \| 4 \| **Critical — promoted to Hard Guardrail #10 (ENG-020)... | |
| 42 | E042 | `route-knowledge-d` | `fb-040` | references | 0.5 | citation:bare | If Pre-Flight Step 0 identified multiple categories, you MUST document in ALL applicable logs. A single piece of feed... | |
| 43 | E043 | `eng-253` | `eng-252` | references | 0.5 | citation:bare | <a id="eng-252"></a> | |
| 44 | E044 | `eng-renumber-log` | `eng-202` | references | 0.5 | citation:bare | \| ENG-202 \| L247, L2998 \| `eng-202`, `eng-202-occ2` \| | |
| 45 | E045 | `content-voice-style` | `cap-023` | references | 0.5 | citation:bare | - Voice flattening during refinement (CAP-023): `docs/content-anti-patterns.md` | |
| 46 | E046 | `eng-139` | `fb-129` | references | 0.5 | citation:bare | **Issue:** Adding `overflow: hidden` to `.typedText` for long-password truncation immediately reintroduced the serif ... | |
| 47 | E047 | `cap-032` | `eng-233` | references | 0.5 | citation:bare | **Reference:** CF-031 (2026-04-26), ENG-202, ENG-233. | |
| 48 | E048 | `content-elan-design-system` | `cfb-045` | references | 0.5 | citation:bare | problem. (CFB-045) | |
| 49 | E049 | `engineering` | `eng-123` | references | 0.5 | citation:bare | \| CMS UX / inline editing \| 54 \| **Critical — ESCALATED. ENG-027→039, ENG-042→046, ENG-049→051, ENG-054→058, ENG-062→... | |
| 50 | E050 | `eng-020` | `eng-012` | references | 0.5 | citation:bare | **Meta-lesson:** This is the same escalation pattern as ENG-012 (documentation skips) and ENG-005 (cross-app parity).... | |
| 51 | E051 | `engineering` | `eng-087` | references | 0.5 | citation:bare | \| Hydration mismatch (SSR/CSR divergence) \| 10 \| **Critical — ESCALATED. ENG-017/18/19/20, ENG-045, ENG-055, ENG-067,... | |
| 52 | E052 | `eng-031` | `eng-027` | references | 0.5 | citation:bare | **Category:** CMS UX / inline editing — fifth occurrence (ENG-027→031). Escalation trigger activated: systemic fix ap... | |
| 53 | E053 | `content` | `cap-025` | references | 0.5 | citation:bare | \| Floating metric (hero number without derivation in scan window) - CAP-025 \| 1 \| Critical \| | |
| 54 | E054 | `eng-187` | `fb-163` | references | 0.5 | citation:bare | > **Last updated:** 2026-04-27 (ENG-266: Baseline eval transcript capture pivoted from `cursor-export-transcript` (op... | |
| 55 | E055 | `eng-170` | `fb-157` | references | 0.5 | citation:bare | > **Last updated:** 2026-04-27 (ENG-266: Baseline eval transcript capture pivoted from `cursor-export-transcript` (op... | |
| 56 | E056 | `eng-102` | `eap-007` | references | 0.5 | citation:bare | - CMS materialized via `POST /api/update-elan`, TypeScript compiles cleanly, cross-app parity check passed (elan-visu... | |
| 57 | E057 | `content-case-study-review` | `cfb-019` | references | 0.5 | citation:bare | CFB-019.) | |
| 58 | E058 | `design` | `fb-105` | references | 0.5 | citation:bare | \| Admin controls displacing component content (overlay separation) \| 2 \| High — FB-105: drag handle as invisible flex... | |
| 59 | E059 | `candidate-anti-patterns` | `eng-266` | references | 0.5 | citation:bare | - **ENG-266**: Operator-mediated workflow designed without probing the underlying data layer first. Plan C Phase 10 l... | |
| 60 | E060 | `content-engram` | `fb-056` | references | 0.5 | citation:bare | - Design: FB-056 (interactive visual scoping), FB-067 (false affordance on static pills) | |

> **Label column** is blank — to be filled by the human labeler in C3.
> **Labels:** `authoritative`, `relevant`, `noise`, `ambiguous` (see [eval-confidence-rubric.md](eval-confidence-rubric.md)).
>
> **Other versions:**
> - [v1](eval-confidence-sample-v1.md) — plain language, no context
> - [v2](eval-confidence-sample-v2.md) — added raw context (still technical)
> - [v3](eval-confidence-sample-v3.md) — synthesized summaries, no jargon
> - [v4](eval-confidence-sample-v4.md) — bias-free (shuffled, no tier labels). **Use this one to label.**
