<!-- graph metadata for docs knowledge graph (see docs/knowledge-graph.md) -->
---
type: spoke
id: content-lacework
topics:
  - content
  - projects
  - case-study
derivedFrom:
  - content.md
---

# Lacework — Case Study Dossier

> Bootstrapped 2026-04-03 by synthesizing CF-003 through CF-010 from content feedback log.
> Full rebuild 2026-04-04: thesis refined from "consumption-based pricing interface" to
> "billing model transition - making consumption-based complexity self-service."

## Current State

- **Thesis:** Designing for a billing model transition - making consumption-based
  complexity self-service. When a company switches from monolithic to modular pricing,
  every user-facing touchpoint must be redesigned to match the new mental model.
  Contemporary relevance: the same pay-for-what-you-use model now standard across
  AI products.
- **Status:** active (rebuilt v2)
- **Last significant edit:** 2026-04-04
- **Quality check results:** 16/16 PASS. Headline at 10 words (upper guideline limit)
  is intentional - the user's voice energy in "I saved the page my own team gave up on"
  justifies the extra word. Check 15 (visual density): 16 image slots + 1 hero across
  3 sections. Check 16 (hero presence): hero placeholder is first block.

## Positive Signals

- [Type B] Metric derivation anchoring: derived hero metric (58%) grounded with
  measurement basis ("in task-based evaluations with internal users") in scope
  statement. Anchors without inviting sample-size scrutiny. Transferable principle:
  derived metrics need a measurement basis visible in the scan window. See CAP-025.
- [Type B] Company name links in scope statement add verifiable credibility - user
  approved linking Snowflake and LendingTree to their official sites (CF-005a).
- [Type B] Named social proof over generic quantifiers - "serving enterprise clients
  including Snowflake and LendingTree" rather than "serving thousands of enterprise
  clients" (CF-005a).
- [Type A] Contemporary relevance framing approved - connecting consumption-based
  pricing to current AI product pricing patterns (CF-004e). Recycled in v2 rebuild.
- [Type A] Duration field using project length ("7 weeks") rather than ship date -
  user confirmed this is the correct semantics (CF-004b, CAP-014). Updated from
  "~3 months" to "7 weeks" based on interview transcript (user stated "seven weeks").
- [Type B] User's creative direction carries strong voice energy. Blurb headline,
  section titles, and the donut joke were all user-directed. Preserve these as
  canonical voice for this project.
- [Type A] "Matryoshka" metaphor for nested navigation layers - user suggestion.
  Vivid, memorable, passes picture test. Placed in Section 1 heading.
- [Type A] "Donut. Avoid at All Cost." / "Not the food. The chart." - user-directed
  wry aside. Uses the one-per-case-study wry aside budget. Passes memorability test.
- [Type A] "Build Instead of Buy" heading - user-directed. Clean, recognizable
  framework reference that immediately signals strategic thinking.

## Frustration Log

- 2026-03-29: Role title said "Lead Product Designer" - actual title was not "Lead."
  Title inflation. Fixed: changed to "Product Designer (sole designer)" (CF-006).
- 2026-03-29: Duration field had a ship date ("Shipped August 2022") instead of project
  length. Fixed: changed to "~3 months" (CF-004b, CF-010). Further refined to "7 weeks"
  in v2 rebuild based on interview transcript.
- 2026-03-29: Ship date appeared in BOTH duration field and description - redundant
  metadata. Fixed (CF-010, CAP-014).
- 2026-03-29: CMS field labels used database names ("name", "url", "href") instead of
  human-readable labels. Fixed with semantic label mapping (CF-007, CAP-012).
- 2026-03-29: Error messages showed raw API JSON instead of natural language. Fixed
  with error translation layer (CF-007, CAP-013).

## Style Preferences (project-specific)

- Role field: use functional descriptor, never inflate title (CAP-011)
- Duration: project length, not ship date (CAP-014). "7 weeks" per interview transcript.
- External links: company names linked to official sites with visual indicator
- Scope statement: simultaneous company context + role claim + impact signal
- Section headings: personality-forward, user-directed. "Five Matryoshkas Deep",
  "Build Instead of Buy", "Donut. Avoid at All Cost." - these are canonical and should
  not be flattened during iteration.
- Wry aside budget used by "Not the food. The chart." in Section 3.
- Blurb headline is user-authored - "I saved the page my own team gave up on."
  Ownership + situation tension. Do not rewrite to remove the "I saved" framing.
- Hero metric must have derivation in scope statement. 58% is a derived metric -
  anchored via "in task-based evaluations with internal users" in scope statement.
- **Narrative shape:** Rescue Arc. Interview prep: see `lacework-interview.md`

## Voice Samples

Canonical calibration targets for this project, derived from user creative
direction during the 2026-04-04 rebuild.

**Sample 1 (section title energy):**
> "Donut. Avoid at All Cost."

What makes it work: Two words as a heading, period after each for authority.
Deliberately ambiguous (food or chart?), resolved immediately in the body.
Shows the user has design opinions and states them as facts.

**Sample 2 (wry redirect):**
> "Not the food. The chart."

What makes it work: Two fragments. Anticipates the reader's question. Self-aware
humor that also functions as a transition into the technical argument.

## Interactive Visual History

- No interactive components - this case study uses static images and screenshots
  (internal tool behind firewall; compensated with sanitized screenshots).

## Image Skeleton Plan (v2)

16 total image slots across 3 sections (target 15-25). All Tier 1 (static).
User uploads screenshots to replace skeleton placeholders.

| Section | Heading | Layout | Slots | Labels |
|---------|---------|--------|-------|--------|
| 1 | Five Matryoshkas Deep | `grid-2-equal` | 6 | Before/after IA (2), before/after nav bar (2), subscription overview (1), usage detail (1) |
| 2 | Build Instead of Buy | `stacked` | 4 | Tableau poster child (1), gap analysis (1), new in-app page (1), full subscription overview (1) |
| 3 | Donut. Avoid at All Cost. | `stacked` | 6 | First iteration bar (1), first iteration donut (1), speedometer exploration (1), final gauge (1), before/after comparison (1), full final page (1) |

## Content Map (v2)

| Section | Heading | Beat Served | Artifact Tier |
|---------|---------|-------------|---------------|
| 1 | Five Matryoshkas Deep | Architecture + Evidence | Tier 1 (static) |
| 2 | Build Instead of Buy | Decisions (primary trade-off) | Tier 1 (static) |
| 3 | Donut. Avoid at All Cost. | Decisions (viz evolution) + Residue | Tier 1 (static) |

## Evolution Timeline

- 2026-03-29: Initial CMS implementation from restructured draft. Migrated from Figma
  prototype + presentation transcript. Applied inverted pyramid structure. (CF-003)
- 2026-03-29: Five content fixes in single session: company name links (CF-005a),
  external link indicators (CF-005b), title deflation (CF-006), duration semantics
  (CF-004b), error message humanization (CF-007). (Session: Lacework Content Refinement)
- 2026-03-30: Metadata field refinements - collaborator display, duration field
  semantics clarified further. (CF-010)
- 2026-04-04: Full rebuild via case-study-authoring skill. Thesis refined from
  "consumption-based pricing interface" to "billing model transition - self-service."
  New raw material: interview transcript (Norm AI portfolio presentation). User provided
  creative direction for all 3 section headings and blurb headline. Content rewritten
  with user voice energy. Duration updated from "~3 months" to "7 weeks." Hero metric
  changed from "2x / page discoverability" to "58% / usability improvement." Legacy
  sections migrated to content blocks format. 14/14 quality checks pass.
- 2026-04-04: Image skeleton placeholders added per updated authoring skill. 16 image
  slots across 3 sections with descriptive labels and CMS-native layout values
  (grid-2-equal for Section 1 before/after pairs, stacked for Sections 2-3 narrative
  flow). Section titles verified against Techniques 6-8 (Object Substitution, Framework
  Inversion, Verdict-as-Headline) - all pass Standalone Test. Blurb headline verified
  against Technique 10 (Protagonist Framing) - passes luxury compatibility test.
- 2026-04-04: Hero image placeholder added as first content block. Multi-layer
  enforcement: CMS schema (hero.image now nullable, placeholderLabel field added),
  DB migration (image_id DROP NOT NULL, placeholder_label column), content-helpers
  (createCaseStudyBlocks always emits hero block), page mapper (passes placeholderLabel),
  ProjectClient (renders hero unconditionally with dynamic label), authoring skill
  (mandatory hero in Phase 2/3/4), review checklist (Check 16: hero presence).
  Label: "Hero — Redesigned usage dashboard with consumption-based billing."

- 2026-04-05: Evidence anchoring improvements. Scope statement updated with metric
  derivation anchor ("in task-based evaluations with internal users") for the 58%
  hero metric. Narrative shape classified as Rescue Arc. Metric derivation positive
  signal documented (derived metric with measurement basis). Interview prep file
  created at `lacework-interview.md`.

## Cross-References

- Content: CF-003, CF-004a, CF-004b, CF-004e, CF-005a, CF-005b, CF-006, CF-007, CF-010, CFB-020
- Design: FB-058 (form UX for CMS fields)
- Engineering: ENG-061 (missing admin descriptions for CMS fields)
