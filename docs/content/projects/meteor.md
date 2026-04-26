<!-- graph metadata for docs knowledge graph (see docs/knowledge-graph.md) -->
---
type: spoke
id: content-meteor
topics:
  - content
  - projects
  - case-study
derivedFrom:
  - content.md
---

# Goldman Sachs Meteor - Case Study Dossier

> Bootstrapped 2026-04-03 by synthesizing CFB-016 from content feedback log.
> Full rebuild 2026-04-05: thesis pivoted from ETRO trust framework to
> three counterintuitive scoping bets. Source: Rengo AI R3 interview transcript
> (35-page presentation walkthrough).

## Current State

- **Thesis:** Three counterintuitive scoping bets that made a 0-to-1 financial
  platform adoptable - where to focus, whom to serve, what to build. Each
  decision demonstrates a different founding-designer competency: product strategy,
  user research-to-prioritization, and engineering collaboration under constraint.
  The ETRO framework and trust features become *evidence* within these decisions,
  not the headline.
- **Previous thesis (v1):** ETRO framework as transferable model for human-in-the-loop
  design. Deprioritized because it treats features as the story when the real story
  is the strategic judgment that made those features possible.
- **Status:** Phase 3 complete (content materialized to CMS), Phase 4 quality check passed
- **Last significant edit:** 2026-04-05

## Confirmed Content Map (Phase 2)

### Thesis
Three counterintuitive scoping bets that made a 0-to-1 platform adoptable.

### Blurb

**Headline (Technique 10 - Protagonist Framing):**
"I had to choose whom NOT to design for."
9 words. Passes luxury test: "whom NOT to design for" = difficult situation.

**Body (79 words, 7 sentences incl. fragments, final):**
How do you design software that moves $79B in assets daily? As the only designer.
No PM. Two user groups who want opposite things. Halfway through, a wall that
nearly killed adoption. Meteor is a story of three counterintuitive bets I made
mid-flight - who to prioritize, what to deliberately not build, and a migration
risk nobody saw coming. Read how I turned an error-prone ETF workflow into an
exception-driven system that cut 12,000 lines of data to 560.

### Scope Statement (64 words, 3 sentences, final)
Meteor is a multi-asset ETF management platform built for Goldman Sachs's Asset
Management division. As the sole designer and first design hire on a team that
had never had one, I conducted research, mapped workflows, drove feature strategy,
and shipped an MVP in 8 months with nine engineers across three time zones.
Within six weeks, users stopped verifying the system's work line by line.

### Section Titles (confirmed with user)

| # | Title | Technique | Decision |
|---|-------|-----------|----------|
| 1 | **The Scope Buffet** | Object Substitution (T6) | Where to focus: upstream basket management over downstream polish |
| 2 | **Not the Squeaky Wheel** | Framework Inversion (T7) | Whom to serve: equities (under-the-radar, zero tooling) over fixed income (high-visibility, entrenched legacy) |
| 3 | **Nobody Migrates Halfway** | Verdict (T8) | What to build: minimum adoptable workflow covering ecosystem dependencies, not just better features |

### Section Body Sketches

**S1 - The Scope Buffet (36 words, final):**
ETF portfolio management spans four stages. I mapped existing tool coverage and
asked which uncovered gap, if left open, breaks everything downstream. Basket
management - if the upstream action is wrong, no downstream polish saves it.

**S2 - Not the Squeaky Wheel (40 words, final):**
The original thesis: one platform for two desks. Fixed income had higher visibility
and more precedent, but matching their entrenched legacy system first would have
consumed the timeline. Equities had zero internal tooling, acute pain, and workflows
built for automation.

**S3 - Nobody Migrates Halfway (50 words, final):**
Halfway through, users refused to migrate. Not because Meteor was worse - because
switching meant losing a system they still needed for another part of their job. I
mapped every feature against usage frequency and design input, scoped to the minimum
adoptable workflow, and built only what unblocked the move.

### Hero Metric
95% / noise reduction (kept from v1 - strong and memorable)

### Image Skeleton Plan (16 total: 1 hero + 15 section)

**Hero:** "Hero - Meteor basket review dashboard showing flagged exceptions"

| Section | Layout | Slots | Labels |
|---------|--------|-------|--------|
| The Scope Buffet | `stacked` | 5 | Lifecycle map (4 stages) / Coverage analysis (tools vs. gaps) / Upstream cascade (basket as leverage point) / Before (email-spreadsheet loop) / After (Meteor auto-generated basket) |
| Not the Squeaky Wheel | `grid-2-equal` | 4 | Equities desk (zero tooling, spreadsheets) / Fixed income desk (legacy tool, entrenched) / Implementation (equities-first + parallel FI track) / Equities team in Meteor's review interface |
| Nobody Migrates Halfway | `stacked` | 6 | Migration blocker (Jet dependency) / Prioritization (frequency x design input matrix) / ETRO Explainability (severity reasoning tags) / ETRO Traceability (corporate actions diff view) / ETRO Reversibility (calculator sandbox) / ETRO Observability (submission validation) |

### Technical Vocabulary (direct matches)
Human-in-the-loop, exception-driven design, explainability, guardrails, progressive
automation, observability, workflow orchestration, system of action. Placed at
levels 1 (blurb) and 4 (section body/captions). Authentic parallels: confidence
scoring analog (severity tiers), autonomy levels (unflagged/yellow/red).

### Sidebar Metadata
- Role: Product Designer (sole designer, founding)
- Collaborators: Engineering (9 engineers) / 3 Time Zones (NY, London, India) / External Vendor (BNY Mellon)
- Duration: 8 months (MVP)
- Tools: Figma
- Links: Goldman Sachs -> goldmansachs.com (via INLINE_LINKS map in page.tsx)

### Beat Assignments
- Hook -> Hero metric (95%) + blurb headline tension
- Stakes -> Blurb body (sentences 1-3)
- Reframe -> Scope statement + S2 opening ("original thesis was convergence")
- Architecture -> S1 visuals (lifecycle map) + S3 visuals (ETRO features)
- Decisions -> S1-S3 (one decision per section)
- Evidence -> Blurb closer + scope statement + captions
- Residue -> S3 final sentence or caption

## Positive Signals

- [Type B] Metric derivation anchoring: self-anchoring hero metric (95%) paired with
  absolute before/after ("12,000 lines to 560") in the blurb closer. Domain context
  is unambiguous ("lines of data"). No additional scope statement clause needed.
  Transferable principle: self-anchoring metrics need domain clarity, not derivation.
- [Type B] Three strategic decision sections structured per CAP-016: what the decision
  was, alternatives considered, why this approach, trade-offs - user approved this
  structure as the right model for senior signal. RECYCLED in v2.
- [Type B] Internal tool compensation strategy: Goldman Sachs name recognition +
  concrete scale metrics + user testimonial in captions + sanitized screenshot
  placeholders labeled by content. RECYCLED in v2.
- [Type B] Negation threading as cohesive device: when the thesis centers on
  counterintuitive exclusion (choosing NOT to do the obvious), carrying a negation
  word through the headline and section titles creates structural cohesion. Blurb:
  "NOT", S2: "Not", S3: "Nobody". S1 breaks the pattern intentionally - "The Scope
  Buffet" sets up abundance before the negations deliver discipline. User-identified
  pattern (2026-04-05). Transferable to any case study with a contrarian thesis.
- [Type A] ETRO framework as unifying narrative - EXTRACTED PRINCIPLE from v1:
  use a named framework to unify feature evidence. ETRO still present in v2 as
  Section 3 image evidence, but no longer the thesis.
- [Type A] Contemporary relevance framing: domain-neutral language that signals
  AI/data workflow relevance without explicitly stating it. RECYCLED in v2 via
  technical vocabulary placement (8 direct matches at level 4).
- [Type A] User creative direction on section titles: "The Scope Buffet" (user
  proposed the buffet metaphor), "Not the Squeaky Wheel" (user proposed the
  framework inversion from squeaky wheel idiom), "Nobody Migrates Halfway" (agent
  proposed, user confirmed). These are canonical and should not be flattened during
  iteration.
- [Type A] Section 2 enrichment: user added that fixed income had higher visibility
  and more precedent in the firm (the "squeaky wheel"), while equities was under the
  radar. This makes the choice to prioritize equities more contrarian and strengthens
  the inversion.

## Frustration Log

- 2026-04-05: User expressed dissatisfaction with v1 case study as a whole. "A lot
  of problems have happened since we last built the skeleton." Triggered full rebuild
  via case-study-authoring skill Phase 1a.
- 2026-04-05: "The Upstream Bet" title rejected as "not enticing enough...doesn't
  make me feel curious...very mid." User proposed "scope buffet" direction. Confirmed
  after agent withdrew jargon pushback (user correctly noted "scope" is a basic word).
- 2026-04-05: "Better Doesn't Ship" title rejected as confusing ("I don't understand
  what that means"). Replaced with "Nobody Migrates Halfway."

## Style Preferences (project-specific)

- Decision sections over feature sections - structure around choices, not outputs
- Predictive framing over retrospective ("knowing an early win would unlock adoption")
- Internal tool: screenshots + captions, never paragraphs of description (CAP-007)
- Role: "Product Designer (sole designer, founding)" - not "Lead" (CAP-011)
- Duration as project length, not ship date
- Section titles are user-directed creative: preserve exact phrasing during iteration
- Negation pattern across titles is intentional cohesive device - do not flatten
- "The Scope Buffet" uses compound metaphor (scope + buffet as a unit) - do not
  split or remove "scope" from the metaphor
- Section 2 must include the "squeaky wheel" context: fixed income had higher
  visibility/precedent (conventional choice), equities was under the radar (actual choice)
- Hero metric must have derivation in scope statement. 95% is self-anchoring
  (blurb anchors via "12,000 lines to 560"). No additional derivation clause needed.
- **Narrative shape:** Contrarian Discovery. Interview prep: see `meteor-interview.md`

## Interactive Visual History

- No interactive components - this case study uses image placeholders (16 slots:
  1 hero + 15 across 3 sections). Internal tool screenshots to be provided by user.
- No Tier 2 or Tier 3 artifacts. All Tier 1 (static).

## Voice Samples

Section titles are user-directed (confirmed in session). Body text follows
warmer-clinical register: declarative sentences, no hedging, fragment stacking in
the blurb (Zone 1) for rhythm, tricolon enumerations in Zone 3 for momentum.

## Portfolio Complementarity

| Case Study | Capability Signal | Core Thesis |
|------------|-------------------|-------------|
| Lacework | Transformation of existing product | Billing model transition |
| Elan Design System | Systems thinking + meta-design | Compounding design knowledge |
| **Meteor** | **0-to-1 creation + founding designer judgment** | **Three counterintuitive scoping bets** |

Each demonstrates a fundamentally different capability. The portfolio gap Meteor
fills: 0-to-1 product creation and founding designer strategic judgment.

## Evolution Timeline

- 2026-03-30: Full case study created from 92-slide presentation deck + 35-page
  interview transcript. Content strategy derived from all content.md principles +
  competitive analysis. CMS entry created with Meteor content, 15 image placeholders,
  inline links. (CFB-016)
- 2026-04-05: Full rebuild initiated. User dissatisfied with v1 skeleton. Source
  material: Rengo AI R3 interview transcript (35 pages). Thesis pivoted from ETRO
  framework to three counterintuitive scoping bets. Phase 1a completed: signal
  inventory (7 metrics, 4 trade-offs, 6 reframes, 8 direct-match technical terms).
  Phase 2 completed: content map confirmed with user-directed section titles
  ("The Scope Buffet" / "Not the Squeaky Wheel" / "Nobody Migrates Halfway"),
  blurb headline ("I had to choose whom NOT to design for"), 16 image placeholders.
  Negation threading identified as cohesive device (user-discovered pattern).
- 2026-04-05: Phase 3 complete. Content written and materialized to CMS via
  update-meteor API route. Uses `createCaseStudyBlocks` from content-helpers.ts
  with `markdownToLexical` for richText fields. Route rewritten from legacy
  `sections` array to new `content` blocks format. Phase 4 quality check passed:
  no banned words, no em dashes, no generic language, word counts within limits,
  sentence length distribution acceptable (3 of 9 section sentences exceed 18-word
  guideline but earn their length structurally).

- 2026-04-05: Evidence anchoring improvements. S3 body updated with Jet ultimatum
  stakes ("engineers estimated six more months - past our deadline, past our budget
  justification"). Narrative shape classified as Contrarian Discovery. Metric derivation
  positive signal documented (self-anchoring via blurb closer). Interview prep file
  created at `meteor-interview.md`.

## Cross-References

- Content: CFB-016 (v1 creation)
- Engineering: (ordering conflict fixed - Meteor order 3, after Elan at order 2)
- Source material: /Users/yilangao/Desktop/Job Application/Rengo AI/Interviews/20260306 Rengo AI R3.pdf
