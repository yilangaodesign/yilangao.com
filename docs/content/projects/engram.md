<!-- graph metadata for docs knowledge graph (see docs/knowledge-graph.md) -->
---
type: spoke
id: content-engram
topics:
  - content
  - system-architecture
  - projects
  - case-study
derivedFrom:
  - content.md
---

# Engram (formerly Élan Design System) - Case Study Dossier

> Bootstrapped 2026-04-03 by synthesizing CFB-013 through CFB-019 + design/engineering logs.
> Full rebuild 2026-04-04: thesis pivoted from "AI-native design system" to "compounding design knowledge for vibe coding."
> v3 rebuild 2026-04-06: thesis pivoted to "what happens when you stop designing for the agent and start designing with it." Horseless carriage metaphor. Translation Arc. All interactive visuals replaced with Tier 3 components.
> 2026-04-29: Renamed from "Élan Design System" to "Engram." Case study reframed around the agent memory system, not the design system product. Slug changed from `elan-design-system` to `engram`. Old dossier (`elan-design-system.md`) converted to `type: alias` pointer.

## Current State

- **Thesis:** Intelligence was never the bottleneck — context is. Engram is the agent memory
  system built to solve that: 18 skills routing corrections into the right documentation,
  200+ anti-patterns encoding what not to repeat, and a knowledge graph with ~4,892 typed
  edges making every relationship between rules explicit and auditable. The measurement
  framework validates whether any of it works (72% retrieval accuracy on subtle tasks,
  both baselines at zero).
- **Status:** draft-v4 (materialized to CMS via update-elan route). 4 sections:
  all with interactive components (CollaborationLoop, SkillMap, MaturityTimeline,
  ExperimentSection). ExperimentSection is a compound: GraphCanvas + EvalComparisonGrid.
- **Last significant edit:** 2026-04-29 (slug rename, framing update)
- **Quality check results:** Pending Phase 4 review.

## Positive Signals

- [Type B] User values interactive demos over static screenshots for demonstrating
  design system concepts - coded interactions are the primary evidence medium.
- [Type B] User wants every section to answer "why I designed it this way," not just
  "what I built" - WHY-focused rationale is the core seniority signal (CFB-014).
- [Type B] Section text should be a **label** for the visual, not a parallel
  explanation - if the interactive visual already shows something, the text must not
  restate it (CFB-015).
- [Type B] User frames the design system through "growth design" lens: early components
  needed heavy hand-holding (15x spacing, 8x state transitions), later components
  needed refinement-level corrections only. The maturity curve is the core evidence.
- [Type B] User insists the designer's contribution is the SYSTEM design (naming,
  escalation, feedback routing), NOT the engineering bug fixes (Turbopack, hydration,
  CMS sync). Don't claim engineering fixes as designer decisions.
- [Type B] User explicitly rejected "design systems matter more than ever" as lazy
  rhetoric. Design systems have always mattered; UI has always been necessary. The
  argument is complementary, not contrarian.
- [Type B] Horseless carriage metaphor approved as blurb anchor. Pointed, not mocking.
  Names a real pattern (bolting AI-readability onto human-designed systems) without
  attacking practitioners. A hiring manager who built an MCP server should feel
  provoked into thinking, not attacked.
- [Type B] "Harnessed my code production - 40 sessions in." headline approved
  (2026-04-23). T8 (Verdict) + Staccato Authority. Verb-first drops pronoun,
  "my" carries first-person perspective, "40 sessions in" grounds the claim in
  real effort. Replaces "You're looking at the wrong part" (T7) which lacked
  the "harness" positioning keyword. Standalone Test: PASS - "how? what happened
  in those 40 sessions?"
- [Type B] ccunpacked.dev visualization patterns approved as design references for
  Tier 3 interactive components. Sequential step-through, categorized card grid,
  proportional block/treemap, side-panel document explorer.
- [Type B] User explicitly rejects "designer as architect replaces visual design" framing.
  Meta-system work is an ADDITIONAL capability, not a replacement. "I push pixels AND
  architect systems" - not "I'm beyond pixels."
- [Type B] Fragment chains are an AI voice tell - section bodies need narrative sentences
  with cause-and-consequence, not telegraphic lists. Fragments work as punchlines after
  setup but not as the default prose rhythm. Benchmark: Lacework and Meteor section
  bodies tell mini-stories. (CF-022, CAP-027)

## Frustration Log

- 2026-03-30: "Token examples don't follow the naming convention" - Fixed in CFB-014.
- 2026-03-30: "Section hierarchy is inverted" - Fixed in CFB-014.
- 2026-03-30: "You're stacking facts over facts" - Fixed in CFB-015.
- 2026-03-31: "Spacing and radius is irrelevant" - Fixed in CFB-013.
- 2026-03-31: "Information architecture is wrong" - Fixed in CFB-019.
- 2026-04-03: User unhappy with agent harness narrative - **resolved by full rebuild.**
- 2026-04-03: "Feedback-Driven Component Library" section too high - **resolved by
  removing the section entirely; learning mechanism now in "How the System Learns."**
- 2026-04-04: "120+ as hero metric doesn't tell me anything" - resolved by v3 hero
  metric: "15 -> 3" (corrections per session). Later revised to "130+" (anti-patterns encoded) after data verification showed the declining count wasn't reproducible from API data.
- 2026-04-04: "Don't over-index on engineering fixes" - reframed all sections around
  design corrections, not engineering bugs. Addressed in rebuild.
- 2026-04-06: "Super dissatisfied with how the content is written" - full v3 rebuild.
  New thesis, new narrative shape, new sections, new interactive visuals.
- 2026-04-06: "machine-generated short sentences that don't make sense" - v3 prose
  rewrite (CF-022). Fragment chains replaced with narrative sentences. Specific stories
  added (playground verification skipped 6 times, correction type shift from fundamental
  to refinement). CAP-027 (Fragment Chain as Default Prose) created.

## Style Preferences (project-specific)

- **Voice register:** Conversational-irreverent. NOT formal/luxury.
  The user's own draft establishes the register: "Sounds ridiculous?", "Me too.",
  "Afraid of that default Tailwind blue-violet?" - irreverent, relatable, like a
  designer talking to another designer. This is the canonical voice for this case study.
- Cultural references that signal in-group knowledge (horseless carriages, MCP servers,
  anti-patterns, vibe coding, Tailwind blue-violet, AI slop) - readers who work with
  AI agents will immediately relate.
- 1-3 sentence section bodies that label the visual, not explain it
- The meta-system is the core argument, not the components
- Interactive visuals scoped to section topic - no general-purpose showcases
- Information hierarchy: show the system/structure first, then rationale
- Frame from designer's perspective: what design decisions were made, not what bugs were fixed
- Hero metric: "0→72%" retrieval accuracy on subtle tasks (comparative impact metric)
- **Narrative shape:** Translation Arc. Interview prep: see `engram-interview.md`

## Voice Samples

Canonical calibration targets for this project's voice, extracted from the
user's raw draft during the 2026-04-04 rebuild.

**Sample 1 (blurb hook):**
> "Teaching Einstein how to build a design system...when he's 6 years old.
> Sounds ridiculous? That's what everyone is facing right now trying to spin
> up vibe coded apps. AI powerful? Yes. AI dumb? Also yes."

**Sample 2 (pain + positioning):**
> "I have been vibe coding rigorously since GPT came out. A pain point I have
> is xxxx, horrible consistency... Afraid of the Tailwind blue violet color?
> I'm too. That's why I made this system. To save myself from the abyss of
> AI slop."

These samples were written spontaneously by the user. They represent the
target register for this case study. The refined output should preserve their
energy while tightening grammar and thesis coherence.

## Interactive Visual History

### v4 (current)

- **CollaborationLoop:** Tier 3. Section 1 "Teach Once, Enforce Forever." Design ref:
  ccunpacked.dev "The Agent Loop" (sequential step-through with source display).
  8-step guided walkthrough of the correction-to-rule lifecycle. Interaction:
  play/pause, forward/back. Each step highlights the relevant document in a side panel.
- **SkillMap:** Tier 3. Section 2 "The System Behind the System." Design ref:
  ccunpacked.dev "Tool System" (card grid) + "Architecture Explorer" (treemap).
  Dual-view component: View 1 "Operations" (18 skills by phase, dynamic count),
  View 2 "Knowledge" (200+ anti-patterns by domain as proportional blocks).
- **MaturityTimeline:** Tier 2. Section 3 "Relationships Hidden in Context."
  Stacked bar chart showing correction recurrence breakdown (recurrent/approximate/novel)
  over build days. Domain toggle hidden; narrative focuses on novel-% trending upward
  (+0.34%/day) as the "muddier than expected" signal. Trend line overlay on recurrence view.
- **ExperimentSection:** Tier 3 compound. Section 4 "Zero, Zero, Seventy-Two." Stacks GraphCanvas
  (force-directed knowledge graph, ~995 nodes, ~4,892 edges, auto-transition loop) +
  EvalComparisonGrid (3-column comparison: No Memory / Hierarchical Docs / Knowledge Graph, stratified
  by subtle/obvious tasks). Body text replaced with actual eval results: 72% gold cite on
  subtle tasks vs 0% for all other arms, verdict inconclusive by pre-registered rules.

### v3 (archived)

- **MaturityTimeline:** Tier 3. Was Section 4 "The Rising Floor." Stacked percentage
  bar chart showing correction recurrence breakdown over time. Removed: recurrence
  data didn't trend meaningfully. Replaced by text-only closing section.

### v2 (archived)

- **IncidentDensityMap:** Served "How the System Learns" section. Showed 3-domain
  routing and pattern accumulation. Replaced by CollaborationLoop in v3.
- **TokenGrid:** Served "Naming as Documentation" section. Color-only token display.
  Dropped - section removed in v3.
- **InteractionShowcase:** Served "One Component, Seven Corrections" section. ScrollSpy
  4-iteration journey. Dropped - section removed in v3.

### v1 (archived)

- **EscalationTimeline:** Dropped from v2. Was mapped to "Agent Harness Architecture."
- **ComponentShowcase:** Dropped from v2. No section mapping.
- **FunnelDiagram:** Dropped from v2. No section mapping.

## Content Map (v4)

| Section | Heading | Interactive Visual | Artifact Tier | Narrative Beat |
|---------|---------|-------------------|---------------|----------------|
| Blurb | "Every day is a first date..." | - | - | Hook + Stakes + Insight |
| 1 | Teach Once, Enforce Forever | CollaborationLoop | Tier 3 | The Seed: vibe-coding, steady cost, first file (Act I) |
| 2 | The System Behind the System | SkillMap (dual-view) | Tier 3 | CTA split, bucket problem, rot (Acts II-IV) |
| 3 | Relationships Hidden in Context | MaturityTimeline (recurrence only) | Tier 2 | Novel-% trending up = muddier than expected → research → need for graph + measurement (Acts IV-VI) |
| 4 | Zero, Zero, Seventy-Two. | ExperimentSection (compound: GraphCanvas + EvalComparisonGrid) | Tier 3 | The graph + eval results: 72% vs 0% on subtle tasks, inconclusive by own rules (Acts V-VIII) |

## Open Questions for Next Iteration

1. **Session 1 vs Session 40 comparison:** The only remaining image placeholder in
   Section 1. Needs a before/after visual showing the same design task handled early
   vs. late in the project (demonstrating the maturity curve).
2. **Metric verification:** Hero metric updated from "15 -> 3" to "130+" (anti-patterns
   encoded). The declining correction count was not reproducible from API data; total
   corrections per day trend upward as project scope expands.
3. **Hero image:** Hero image asset still needed. Current placeholder describes the slot.

## Evolution Timeline

- 2026-03-30: Initial content strategy overhaul. Restructured from feature showcase to
  WHY-focused narrative. AI-native thread became core. (CFB-014)
- 2026-03-30: Verbosity cut. Section bodies trimmed from 5-7 sentences to 1-3. (CFB-015)
- 2026-03-31: Interactive visual rescoped. TokenGrid tabs cut to color-only. (CFB-013)
- 2026-03-31: Hierarchy inversion fixed. Architecture tab moved before rationale. (CFB-019)
- 2026-04-03: User indicates full rebuild needed.
- 2026-04-04: Full rebuild (v2). Thesis pivoted from "AI-native design system" to
  "compounding design knowledge." Sections reduced from 4 to 3. EscalationTimeline,
  ComponentShowcase, FunnelDiagram dropped.
- 2026-04-04: Voice rewrite. User provided draft establishing conversational register.
  All content rewritten in this voice.
- 2026-04-05: Evidence anchoring framework applied. Narrative shape classified as
  Accumulation Arc.
- 2026-04-06: Full rebuild (v3). Thesis pivoted to "designing with the agent."
  Narrative shape changed to Translation Arc. All sections replaced. All interactive
  visuals replaced with Tier 3 components (CollaborationLoop, SkillMap, MaturityTimeline).
  Hero metric changed from "54" to "15 -> 3" (maturity-based), later revised to
  "130+" (anti-patterns encoded) after data verification. Horseless carriage
  metaphor introduced for blurb. ccunpacked.dev visualization patterns adopted as
  design references.
- 2026-04-06: Prose style rewrite (CF-022). Fragment chains in all sections replaced
  with narrative sentences. Added specific stories: playground verification incident
  (Section 2), rhetorical questions from actual corrections (Section 3). CAP-027
  created. Blurb fragments woven into sentence structure. Scope statement given
  editorial voice ("what I actually designed was...").
- 2026-04-06: Voice framework tone pass (CF-023). Applied T11+T13+T15 technique
  emphasis after voice framework upgrade. Over-indexed on clever contrarian
  positioning - result was condescending. Reverted in CF-024.
- 2026-04-23: Headline change. "You're looking at the wrong part" (T7) replaced with "Harnessed my code production - 40 sessions in" (T8 + Staccato Authority).
- 2026-04-26: Headline updated to "I built an agent's memory out of my own mistakes." (T10 Protagonist Framing). Blurb body fully rewritten to match new headline's T10 frame.
- 2026-04-06: Tone rewrite v2 (CF-024). Rewrote all prose to match reference
  sample register (humble, real, process-first). Removed horseless carriage metaphor
  and all industry-positioning.
- 2026-04-28: v4 restructure (CF-032). Narrative arc redistributed. MaturityTimeline
  reintroduced. Section 4 rewrite with actual eval results (ExperimentSection compound).
- 2026-04-28: Category rewrite. "Design Systems · Self-Improving AI Collaboration" →
  "Context Engineering · Agent Memory Design." (CFB-045)
- 2026-04-28: Hero metric rewrite. "~5K knowledge graph edges" → "0→72% retrieval
  accuracy on subtle tasks." Scale metric replaced with comparative impact metric. (CFB-046)
- 2026-04-28: Terminology standardized. "Flat docs" → "Hierarchical Docs," "bare LLM" →
  "No Memory." Research-backed agent memory architecture naming. (CFB-048)
- 2026-04-29: Case study renamed from "Élan Design System" to "Engram." Slug changed
  from `elan-design-system` to `engram`. Framing shifted from design system product to
  agent memory system. Old dossier converted to `type: alias` pointer. (CFB-049)

## Portfolio Coherence Manifest Entry

- **Narrative shape:** Translation Arc
- **Headline technique:** T10 Protagonist Framing ("I built an agent's memory out of my own mistakes.")
- **Voice register:** Conversational-irreverent
- **Metric type:** Percentage improvement (0→72% retrieval accuracy on subtle tasks vs 0% baseline)
- **Evidence method:** Interactive demo (3 Tier 3 components: CollaborationLoop, SkillMap, ExperimentSection) + quantitative eval results
- **Employment context:** Solo project / portfolio piece

## Cross-References

- Content: CFB-013, CFB-014, CFB-015, CFB-019, CFB-045, CFB-046, CFB-048, CFB-049
- Design: FB-056 (interactive visual scoping), FB-067 (false affordance on static pills)
- Engineering: ENG-054 (CMS heading vs INTERACTIVE_VISUALS key mismatch)
- Plan: `.cursor/plans/ds_case_study_v3_f661b06e.plan.md`
- Previous dossier: `elan-design-system.md` (alias → this file)
