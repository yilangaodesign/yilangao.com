<!-- graph metadata for docs knowledge graph (see docs/knowledge-graph.md) -->
---
type: spoke
id: content-elan-design-system
topics:
  - content
  - system-architecture
  - projects
  - case-study
derivedFrom:
  - content.md
---

# Élan Design System - Case Study Dossier

> Bootstrapped 2026-04-03 by synthesizing CFB-013 through CFB-019 + design/engineering logs.
> Full rebuild 2026-04-04: thesis pivoted from "AI-native design system" to "compounding design knowledge for vibe coding."
> v3 rebuild 2026-04-06: thesis pivoted to "what happens when you stop designing for the agent and start designing with it." Horseless carriage metaphor. Translation Arc. All interactive visuals replaced with Tier 3 components.

## Current State

- **Thesis:** What happens when you stop designing for the agent and start designing
  with it. The designer's primary deliverable was not the components - it was the
  apparatus around the design system: 18 operational skills, 200+ anti-patterns,
  a knowledge graph with ~4,892 typed edges, and a measurement framework to validate
  whether any of it works. Complementary to the industry's consumption work
  (MCP servers, metadata files), this demonstrates a different starting point:
  co-creation.
- **Status:** draft-v4 (materialized to CMS via update-elan route). 4 sections:
  all with interactive components (CollaborationLoop, SkillMap, MaturityTimeline,
  ExperimentSection). ExperimentSection is a compound: GraphCanvas + EvalComparisonGrid.
- **Last significant edit:** 2026-04-28
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
- Hero metric must have derivation in scope statement (knowledge-graph scale: ~5K edges)
- **Narrative shape:** Translation Arc. Interview prep: see `elan-design-system-interview.md` (pending creation)

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
- **ExperimentSection:** Tier 3 compound. Section 4 "0, 0, 72." Stacks GraphCanvas
  (force-directed knowledge graph, ~995 nodes, ~4,892 edges, auto-transition loop) +
  EvalComparisonGrid (3-column comparison: Bare LLM / Old Docs / Knowledge Graph, stratified
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
| 4 | 0, 0, 72. | ExperimentSection (compound: GraphCanvas + EvalComparisonGrid) | Tier 3 | The graph + eval results: 72% vs 0% on subtle tasks, inconclusive by own rules (Acts V-VIII) |

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
- 2026-04-26: Headline updated to "I built an agent's memory out of my own mistakes." (T10 Protagonist Framing). Blurb body fully rewritten to match new headline's T10 frame. New body: first date / Severance metaphor opener, "intelligence was never the bottleneck, context is" as the insight peak, "The agent didn't get smarter. It just stopped forgetting." as the closer (T15 closed loop on the memory theme). Previous body was written for T7 and created a mismatch. CF-029, CF-030. Motivated by: (1) "harness" is a top positioning keyword, (2) the
  previous headline didn't communicate the project's core value prop to scanners,
  (3) user preference for verb-first opening without "I" pronoun. Content strategy
  rule updated: first-person perspective includes possessives ("my"), not just "I"/"you."
- 2026-04-06: Tone rewrite v2 (CF-024). Rewrote all prose to match reference
  sample register (humble, real, process-first). Removed horseless carriage metaphor
  and all industry-positioning. Blurb now honest process narrative. Section bodies
  use personal agency ("I made it mandatory") not architectural abstraction. Section 3
  closes with emotional deflation ("The agent didn't get smarter.") instead of
  declarative framing. CAP-028 (Technique-as-Posturing) created.
- 2026-04-28: v4 restructure (CF-032). Narrative arc redistributed: mechanism → scale + decay
  → the graph → the question. MaturityTimeline removed (recurrence data didn't trend
  meaningfully). Section 1 renamed to "Teach Once, Enforce Forever." GraphCanvas promoted
  to Section 3 with auto-transition loop. New text-only Section 4 "Is Any of This Working?"
  as closing. Hero metric changed from "130+" (anti-patterns) to "~5K" (knowledge graph
  edges). All metrics updated to verified current numbers (18 skills, 200+ APs, ~4,892 edges).
- 2026-04-28: Narrative twist injection (CFB-044). All four section bodies rewritten to
  incorporate the 8-act draft's missing reversals. Section 1: vibe-coding setup, specific
  failure examples (hex/flush/em dashes). Section 2: bucket problem (cross-pillar + doubled
  overhead) and rot as named failure mode. Section 3: retitled "Relationships Hidden in
  Context" (from "The Living Graph"); deflation beat added ("felt good for two weeks").
  Section 4: capture protocol twist (Act VII) added. Visual assignments unchanged.
- 2026-04-28: MaturityTimeline reintroduced to Section 3. Domain toggle hidden; locked to
  recurrence view showing novel-% trending upward as narrative evidence for "muddier than
  expected." Section 3 body rewritten to reference the chart directly. Section 3 no longer
  text-only.
- 2026-04-28: Section 4 rewrite with actual eval results. GraphCanvas replaced by
  ExperimentSection (compound: GraphCanvas + EvalComparisonGrid). Body para 2 adjusted
  for 3-arm framing; para 3 replaced with results narrative (72% vs 0% on subtle tasks,
  inconclusive by own rules, "the number is just not clean"). Eval artifacts graph-indexed
  via docs/eval-navigator.md. 7 eval docs received graph frontmatter. New node types
  (eval-report, eval-spec) and topic (eval) added to knowledge-graph.md taxonomy.
- 2026-04-28: Section 4 title + body rewrite. "The Experiment" (Preview Title, Check 7
  fail) replaced with "0, 0, 72." (Staccato Authority on raw arm scores). Body cut from
  5 paragraphs / 14 sentences to 2 paragraphs / 6 sentences. Architecture beat content
  (graph-building details) dropped entirely — scope statement and GraphCanvas already
  cover it. New body leads with result (T14 Emotional Deflation), adds Concessive Turn
  (T12+T13), closes with T15 Closed-Loop callback to "stopped forgetting" from blurb.
  Driven by Phase 1b audit: 5 FAILs (Checks 1, 2, 4, 7, 10, 19).

## Portfolio Coherence Manifest Entry

- **Narrative shape:** Translation Arc
- **Headline technique:** T8 Verdict + Staccato Authority ("Harnessed my code production - 40 sessions in.")
- **Voice register:** Conversational-irreverent
- **Metric type:** Knowledge-graph scale (~5K edges)
- **Evidence method:** Interactive demo (3 Tier 3 components: CollaborationLoop, SkillMap, ExperimentSection) + quantitative eval results
- **Employment context:** Solo project / portfolio piece

## Cross-References

- Content: CFB-013, CFB-014, CFB-015, CFB-019
- Design: FB-056 (interactive visual scoping), FB-067 (false affordance on static pills)
- Engineering: ENG-054 (CMS heading vs INTERACTIVE_VISUALS key mismatch)
- Plan: `.cursor/plans/ds_case_study_v3_f661b06e.plan.md`
