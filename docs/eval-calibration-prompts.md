# Eval Calibration Prompts

> **Purpose:** 3 held-out calibration tasks for Phase 3 of the KG A/B evaluation. These are NOT in the 12-task corpus, NOT graded for the eval, and exist solely to test judge agreement (Fleiss' kappa) before any corpus data is observed.
>
> **Pre-registration:** [`docs/eval-pre-registration.md`](eval-pre-registration.md)
> **Rubric:** [`docs/eval-judge-rubric.md`](eval-judge-rubric.md)
>
> **Structure:** Identical to corpus tasks (prompt + gold_resolution + expected_citation) but drawn from different feedback log entries not used in the corpus.
>
> **Selection criteria:** All 3 are "obvious" difficulty (the anti-pattern is a direct grep hit). Calibration tests judge agreement, not retrieval difficulty. One task per pillar (design, engineering, content).

## Calibration tasks

```yaml
- id: cal-C001
  pillar: design
  difficulty: obvious
  source_fingerprint: "FB-185: KnowledgeTreemap orientation-blind layout — vertical sliver tiles illegible"
  source_anchor: "docs/design-feedback-log.md#fb-185"
  cited_ap: AP-072
  prompt: |
    The treemap has a tile for "Data Migration" that renders as a tall
    narrow sliver, maybe 20px wide and 73px tall. The label overflows
    because it's stacked vertically (label above count) but the tile is
    way too narrow. The layout needs to adapt to the tile's shape, not
    just assume everything is wide enough for a column stack.
  gold_resolution: |
    Add ResizeObserver to track container pixel dimensions. For each tile,
    compute pxW and pxH from d3 percentage coordinates x container size.
    Classify via classifyTile(): column mode (normal, pxW >= 36px and
    aspect ratio <= 2.5), row mode (vertical sliver, flips flex-direction
    to row so label and count sit side-by-side), silent mode (too narrow,
    color only). The principle is AP-072: layout direction must match the
    physical orientation of the available space. Orientation-blind content
    layout in variable-size containers is the anti-pattern.
  expected_citation: AP-072

- id: cal-C002
  pillar: engineering
  difficulty: obvious
  source_fingerprint: "ENG-192: Case-study videos frozen on first frame in production (HEVC hvc1 codec)"
  source_anchor: "docs/engineering-feedback-log.md#eng-192"
  cited_ap: EAP-117
  prompt: |
    The loop videos on the Lacework case study page are completely frozen
    on the first frame in Chrome and Firefox. They play fine in Safari.
    The video element has all the right attributes (autoplay muted loop
    playsinline), the Supabase URL returns 200, and the loaded class is
    applied. What is going on?
  gold_resolution: |
    The MP4 files are macOS-native HEVC (hvc1 codec, QuickTime brand).
    Safari decodes hvc1 via VideoToolbox but Chrome/Firefox cannot decode
    it beyond the first frame. The fix is to batch re-encode all portfolio
    MP4s to H.264 (libx264) + AAC with faststart and mp42 brand, then
    re-upload in place so URLs stay stable. The anti-pattern is EAP-117:
    uploading macOS-native HEVC without transcoding. Browser-portable
    media (H.264/AAC/faststart/mp42) is a hard invariant of the upload
    pipeline, not a runtime concern.
  expected_citation: EAP-117

- id: cal-C003
  pillar: content
  difficulty: obvious
  source_fingerprint: "CFB-014: Token examples don't follow convention, missing rationale, section hierarchy wrong, DAG missing"
  source_anchor: "docs/content-feedback-log.md#cfb-014"
  cited_ap: CAP-016
  prompt: |
    The Elan design system case study reads like a feature list. It shows
    what the token naming convention is but not why it was chosen. There
    is no comparison to IBM Carbon or Goldman Sachs. The section hierarchy
    has "Token Architecture" under "Lumen Color Identity" when it should
    be the other way around. This is a showcase, not a rationale. Fix the
    content strategy.
  gold_resolution: |
    Restructure the case study around rationale, not features. The core
    thread is AI-native semantic naming and why it was chosen. Reorder
    sections with Agent Harness Architecture first. In the TokenGrid, add
    rationale content explaining WHY semantic naming benefits agents, with
    IBM Carbon and Goldman Sachs One GS comparisons. Fix token examples
    to use dot notation matching the formula. The anti-pattern is CAP-016:
    feature-list case study that shows WHAT without WHY. Senior designers
    describe decisions and rationale, not tasks completed.
  expected_citation: CAP-016
```

## Usage in Phase 3

1. Run all 3 calibration tasks through all 4 arms (1 run each) = 12 generation runs
2. Judge 3 pairs (T-R, T-P, T-B) x 3 tasks x 3 judges = 27 judge calls
3. Compute Fleiss' kappa on adherence and quality across the 3 judges
4. Decision gate:
   - kappa >= 0.4 on both: rubrics locked, proceed to Phase 4
   - kappa < 0.4 on either: revise rubric wording, re-run (max 2 cycles)
5. After Phase 3, the final rubric revision becomes the permanently locked rubric
