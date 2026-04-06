# Élan Design System — Case Study Dossier

> Bootstrapped 2026-04-03 by synthesizing CFB-013 through CFB-019 + design/engineering logs.
> Full rebuild 2026-04-04: thesis pivoted from "AI-native design system" to "compounding design knowledge for vibe coding."

## Current State

- **Thesis:** A design system that learns from every failure — where documented design
  corrections compound into rules that make each session more effective than the last.
  Framed for vibe coding: the design system exists so an AI agent can generate
  design-quality components without the designer present.
- **Status:** draft-v2 (materialized to CMS, 12/13 quality checks pass, 1 WEAK
  intentional exception on blurb sentence count). Pending user review of hero metric
  and A/B maturity evidence.
- **Last significant edit:** 2026-04-04
- **Quality check results:** 12 PASS, 1 WEAK (Check 11: blurb sentence count 9 vs.
  4-6 guideline. Intentional - user's conversational voice produces fragments that
  inflate count without inflating word count. 73 words is within 80-word limit.)

## Positive Signals

- [Type B] User values interactive demos over static screenshots for demonstrating
  design system concepts — coded interactions are the primary evidence medium.
- [Type B] User wants every section to answer "why I designed it this way," not just
  "what I built" — WHY-focused rationale is the core seniority signal (CFB-014).
- [Type B] Section text should be a **label** for the visual, not a parallel
  explanation — if the interactive visual already shows something, the text must not
  restate it (CFB-015).
- [Type A] The scoping of TokenGrid to color-only was approved — user confirmed color
  identity should be the focus of that section (CFB-013). Recyclable.
- [Type B] User frames the design system through "growth design" lens: early components
  needed heavy hand-holding (15× spacing, 8× state transitions), later components
  needed refinement-level corrections only. The maturity curve is the core evidence.
- [Type B] User insists the designer's contribution is the SYSTEM design (naming,
  escalation, feedback routing), NOT the engineering bug fixes (Turbopack, hydration,
  CMS sync). Don't claim engineering fixes as designer decisions.
- [Type B] User wants a "fake A/B test" comparison: early session design quality vs.
  late session design quality, showing the system's compounding effect.

## Frustration Log

- 2026-03-30: "Token examples don't follow the naming convention" — Fixed in CFB-014.
- 2026-03-30: "Section hierarchy is inverted" — Fixed in CFB-014.
- 2026-03-30: "You're stacking facts over facts" — Fixed in CFB-015.
- 2026-03-31: "Spacing and radius is irrelevant" — Fixed in CFB-013.
- 2026-03-31: "Information architecture is wrong" — Fixed in CFB-019.
- 2026-04-03: User unhappy with agent harness narrative — **resolved by full rebuild.**
- 2026-04-03: "Feedback-Driven Component Library" section too high — **resolved by
  removing the section entirely; learning mechanism now in "How the System Learns."**
- 2026-04-04: "120+ as hero metric doesn't tell me anything" — user wants metric that
  communicates WHY the design system matters for vibe coding, not just volume. Current
  placeholder: "54 / design rules accumulated from real corrections." **Open — needs
  user confirmation or alternative.**
- 2026-04-04: "Don't over-index on engineering fixes" — reframed all sections around
  design corrections, not engineering bugs. Addressed in rebuild.
- 2026-04-04: User wants comparison with generic designer skills — inspiration for
  framing, not a hard requirement. Open for future iteration.

## Style Preferences (project-specific)

- **Voice register:** Conversational, first-person, culturally sharp. NOT formal/luxury.
  The user's own draft establishes the register: "Sounds ridiculous?", "Me too.",
  "Afraid of that default Tailwind blue-violet?" — irreverent, relatable, like a
  designer talking to another designer. This is the canonical voice for this case study.
- Cultural references that signal in-group knowledge (Tailwind blue-violet, AI slop,
  "every session starts from zero") — readers who vibe code will immediately relate.
- 1-3 sentence section bodies that label the visual, not explain it
- Learning-from-corrections must be the unifying narrative thread
- Interactive visuals scoped to section topic — no general-purpose showcases
- Information hierarchy: show the system/structure first, then rationale
- Frame from designer's perspective: what design decisions were made, not what bugs were fixed
- Engineering fixes happen through the AI agent, not through the designer's expertise
- Hero metric must have derivation in scope statement (pending hero metric confirmation)
- **Narrative shape:** Accumulation Arc. Interview prep: see `elan-design-system-interview.md` (pending creation)

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

- **TokenGrid:** Scoped to color-only after CFB-013. Tabs: Token Architecture (naming
  formula + dimension pills), Lumen Accent (brand color example). Now serves "Naming
  as Documentation" section. Architecture tab moved before rationale (CFB-019).
- **IncidentDensityMap:** Now serves "How the System Learns" section. Shows the
  3-domain routing and pattern accumulation. Functional, no explicit frustration.
- **InteractionShowcase:** Now serves "One Component, Seven Corrections" section.
  Demonstrates ScrollSpy's 4-iteration journey through 7 anti-patterns.
- **EscalationTimeline:** Dropped from this version. Was mapped to "Agent Harness
  Architecture" which no longer exists.
- **ComponentShowcase:** Dropped from this version. No section mapping.
- **FunnelDiagram:** Dropped from this version. No section mapping.

## Open Questions for Next Iteration

1. **Hero metric:** "54 / design rules accumulated from real corrections" is a
   placeholder. User specifically wants something that communicates value for vibe
   coding, not just pattern count. Consider: maturity curve metric (corrections per
   component early vs. late), or leverage metric (1 designer → 3 apps).
2. **A/B maturity evidence:** User requested a chronological analysis of design
   feedback log to quantify the shift from fundamental corrections (Mar 29-30) to
   refinement corrections (Apr 3-4). Could become a new interactive visual or replace
   the IncidentDensityMap.
3. **Generic designer skill comparison:** User floated comparing output quality of
   this system vs. a publicly available designer skill. Not a requirement for v2 but
   could strengthen the thesis for v3.
4. **Section text for "Naming as Documentation":** Token name `color.surface.brand.bold`
   appears as plain text because the Lexical headless editor doesn't support inline
   code. Consider adding CodeNode to content-helpers if code formatting is needed.

## Content Map (v2)

| Section | Heading | Interactive Visual | Artifact Tier |
|---------|---------|-------------------|---------------|
| 1 | How the System Learns | IncidentDensityMap | Tier 2 (existing) |
| 2 | Naming as Documentation | TokenGrid | Tier 2 (existing) |
| 3 | One Component, Seven Corrections | InteractionShowcase | Tier 2 (existing) |

## Evolution Timeline

- 2026-03-30: Initial content strategy overhaul. Restructured from feature showcase to
  WHY-focused narrative. AI-native thread became core. (CFB-014)
- 2026-03-30: Verbosity cut. Section bodies trimmed from 5-7 sentences to 1-3. (CFB-015)
- 2026-03-31: Interactive visual rescoped. TokenGrid tabs cut to color-only. (CFB-013)
- 2026-03-31: Hierarchy inversion fixed. Architecture tab moved before rationale. (CFB-019)
- 2026-04-03: User indicates full rebuild needed.
- 2026-04-04: Full rebuild. Thesis pivoted from "AI-native design system" to "compounding
  design knowledge." Sections reduced from 4 to 3. EscalationTimeline, ComponentShowcase,
  FunnelDiagram dropped. All sections reframed around design corrections (not engineering
  bugs). Hero metric changed from "47+" to "54" (placeholder, pending user feedback).
  Duration corrected from "2 days" to "2026 - Present."
- 2026-04-04: Voice rewrite. User provided draft establishing conversational, first-person,
  culturally sharp register ("Teaching Einstein...", "Tailwind blue-violet", "Me too.").
  All content rewritten in this voice. Em dashes purged (CAP-022). Content pushed to CMS
  and verified. Quality checks: 12/13 PASS, 1 WEAK (intentional).

- 2026-04-05: Evidence anchoring framework applied. Narrative shape classified as
  Accumulation Arc. No content patch needed (hero metric is TBD pending user
  confirmation). Manifest entry seeded.

## Cross-References

- Content: CFB-013, CFB-014, CFB-015, CFB-019
- Design: FB-056 (interactive visual scoping), FB-067 (false affordance on static pills)
- Engineering: ENG-054 (CMS heading vs INTERACTIVE_VISUALS key mismatch)
