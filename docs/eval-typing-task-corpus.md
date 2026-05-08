---
type: eval-task-corpus
id: eval-typing-task-corpus
topics: [eval, knowledge-graph, typing]
derivedFrom:
  - .cursor/plans/eval_experiment_program_0516e9af.plan.md
references:
  - docs/eval-multipillar-task-corpus.md
  - docs/eval-typing-pre-registration.md
  - docs/eval-typing-eval-config.yaml
---

# Phase 1 task subset (typed-vs-untyped A/B)

> **Purpose**: a deterministic 6-task subset of the locked Phase 2 multi-pillar corpus, used by the Phase 1 type-system A/B (`T-typed` vs `T-untyped`).
>
> **This file is a SUBSET REFERENCE, not a duplicate corpus.** Task definitions live in [`docs/eval-multipillar-task-corpus.md`](eval-multipillar-task-corpus.md). The eval-runner loads the corpus path from [`docs/eval-typing-eval-config.yaml`](eval-typing-eval-config.yaml) (which points at this file), and `parseTasks()` in `scripts/eval-runner.mjs` reads the YAML block at the bottom. The block embeds the full task definitions for the 6 selected IDs so the runner does not need to load both files.
>
> **Selection rule (deterministic, no author discretion)**: within each Phase 1 stratum, select the task with the LOWEST task ID by lexicographic order on the `id` field of the locked Phase 2 corpus. Phase 1 strata: 3 multi-pillar (one each from D+E, D+E+C, D+C — drops E+C) + 3 single-pillar (lowest 3 IDs from the single-pillar pool). Mechanically verifiable.
>
> **Phase 2 corpus SHA-pin**: `c193de490ca8072978c40aa0cd7cbea2046a07d901bf5b48e5783955e37dbced`. If the locked corpus's SHA changes (any edit to `docs/eval-multipillar-task-corpus.md`), this subset reference is invalidated and Phase 1 must re-derive the subset.

## Selected task IDs (per the deterministic rule)

| Phase 1 stratum (`pillar`) | Combination | Task ID | Source |
|---|---|---|---|
| multi-pillar | D+E | `eval-MP-DE-001` | Lowest ID in D+E stratum of locked Phase 2 corpus |
| multi-pillar | D+E+C | `eval-MP-DEC-001` | Lowest ID in D+E+C stratum |
| multi-pillar | D+C | `eval-MP-DC-001` | Lowest ID in D+C stratum |
| single-pillar | single-pillar | `eval-SP-C-001` | Lowest single-pillar ID (C < D < E lexicographically) |
| single-pillar | single-pillar | `eval-SP-D-001` | 2nd lowest single-pillar ID |
| single-pillar | single-pillar | `eval-SP-D-002` | 3rd lowest single-pillar ID |

E+C is intentionally not represented (Phase 1 drops the rarest Phase 2 stratum; Phase 1 results don't generalize to E+C and that limitation is disclosed in [`docs/eval-typing-pre-registration.md`](eval-typing-pre-registration.md)).

## Embedded task definitions

The YAML block below is a **verbatim copy** of the 6 selected entries from `docs/eval-multipillar-task-corpus.md` at the SHA-pinned revision above. Embedding them avoids cross-file `parseTasks()` and keeps the eval-runner's contract identical to v1 (one corpus YAML per eval-config).

If you need to verify provenance, run:

```bash
node -e "const c = require('fs').readFileSync('docs/eval-multipillar-task-corpus.md','utf8'); const m = c.match(/```yaml\n([\\s\\S]*?)```/); const ids = ['eval-MP-DE-001','eval-MP-DEC-001','eval-MP-DC-001','eval-SP-C-001','eval-SP-D-001','eval-SP-D-002']; for (const id of ids) console.log(id + ':', m[1].includes(id));"
```

All 6 IDs must report `true`. If any report `false`, the embedded copy below has drifted from the locked source — STOP and re-derive.

## Tasks

```yaml
- id: eval-MP-DE-001
  pillar: multi-pillar
  combination: D+E
  source_fingerprint: "FB-217 / ENG-237: ForceGraph hover-to-emphasize built piecemeal per view mode"
  source_anchor: "docs/design-feedback-log.md#fb-217"
  prompt: |
    The hover-to-emphasize behavior on the ForceGraph isn't consistent across
    views. In Mesh, hovering a node bolds the connected links and dims the
    rest. In Pathway and Signal, hovering does almost nothing visible — the
    same node lights up differently depending on which view I'm in. Also,
    when I hover, particles are still firing on every link instead of just
    the connected ones. Fix it so hover behaves as a single component-level
    pattern across all three views, and tell me what the architectural rule
    is so this doesn't drift again.
  gold_resolution: |
    Treat hover-to-emphasize as a *component-level* interaction owned by the
    base ForceGraph, with each view varying only WHAT gets emphasized, not
    WHETHER emphasis exists.

    Add a `hoveredNeighborNodes` set alongside the existing
    `hoveredNeighborLinks`. Three node states: hovered (bright stroke ring,
    1.0 opacity), neighbor (subtle ring, 0.9 opacity), dimmed (0.2 opacity).
    Three link states: emphasis (1.4 width, brighter), resting, dim
    (rgba(160,160,160,0.06), 0.4 width). Arrows on non-connected links go
    to length 0 in Pathway. Define the emphasis vocabulary as constants at
    the component scope, not per-mode inline literals.

    Per-mode variation lives only in WHAT gets emphasized: Mesh emphasizes
    immediate neighbors, Signal emphasizes the activated path plus
    neighbors, Pathway scales confidence-weighted link width by 1.3x on
    hover.
  expected_citations: [AP-058, EAP-124]
  selection_rationale: |
    D+E because the user-presented complaint mixes a visual symptom
    (inconsistent emphasis across modes) with an architectural cause
    (per-mode duplication of interaction logic).

- id: eval-MP-DEC-001
  pillar: multi-pillar
  combination: D+E+C
  source_fingerprint: "CFB-039 / FB-157 / ENG-170: Audio capability vs default-state on video blocks"
  source_anchor: "docs/content-feedback-log.md#cfb-039"
  prompt: |
    The audio control on video blocks is a single ButtonSelect labeled
    "Muted by default / Sound by default." That label is wrong because
    "Muted by default" implies audio still EXISTS and the user can
    unmute. For most of our portfolio videos there's no audio track at
    all — silent loop captures. So when an author picks "Sound by default"
    on a silent loop, we render a useless Unmute button. You're conflating
    two different things and that's very dangerous. Fix the admin labels,
    the schema, AND the videoSettings UI. For external embeds, remove the
    audio control entirely. Codify the rule.
  gold_resolution: |
    Three-pillar fix:
    1. **Schema (E)**: split `media.muted` into two fields:
       `media.audioEnabled` (capability) and `media.muted` (default state).
       Migrate existing rows so silent captures get `audioEnabled: false`.
    2. **VideoSettings UI (D)**: primary `ButtonSelect` "Audio off / Audio
       on" bound to `audioEnabled`. Secondary `ButtonSelect` "Muted by
       default / Sound by default" rendered only when Audio is on, bound
       to `muted`. `VideoEmbed` removes the audio control entirely.
    3. **Admin labels + descriptions (C)**: `audioEnabled` label "Expose
       audio controls to viewers" with description naming the
       "Capability axis"; `muted` label "Starts muted by default" naming
       the "Default-state axis."

    Principle: admin labels must be grep-able by axis. Capability
    vocabulary for "does this control exist?" Default-state vocabulary
    for "how does the control start?"
  expected_citations: [AP-023, EAP-019, CAP-012]
  selection_rationale: |
    D+E+C because the resolution requires three independent diagnoses:
    AP-023 (form inputs without persistent labels), EAP-019 (single-layer
    CMS field changes), CAP-012 (database column names as user-facing
    labels). Missing any one citation produces a half-fix.

- id: eval-MP-DC-001
  pillar: multi-pillar
  combination: D+C
  source_fingerprint: "CFB-046: Élan hero metric '5K knowledge graph edges' replaced with '72% correct retrieval on subtle tasks'"
  source_anchor: "docs/content-feedback-log.md#cfb-046"
  prompt: |
    The Élan case study hero says "~5K edges" as the headline metric. I
    don't think 5K is a good headline number — it's a scale metric, not
    an impact metric. We have a much better number: 72% correct retrieval
    on subtle tasks. That's the money shot. Fix the hero metric and tell
    me the principle so we don't backslide to vanity scale numbers on the
    next case study.
  gold_resolution: |
    Replace the hero metric in `src/app/(frontend)/api/update-elan/route.ts`:
    `metricNumber: "~5K"` → `"72%"`, `metricDescription: "knowledge graph
    edges"` → `"correct retrieval on subtle tasks"`. POST `/api/update-elan`,
    confirm via REST that hero metric block carries the new value.

    Visual side (D): the hero metric occupies the largest typographic slot.
    A 2-character number ("72%") and a 4-character number ("~5K") sit on
    the same display-scale grid; typography unchanged.

    Principle (CAP-025 reinforced): hero metrics must claim IMPACT, not
    SCALE. Scale metrics measure size; impact metrics measure what the
    system moved. The reader at the top of the page asks "did this work?"
    not "how big was it?" Scale numbers answer the wrong question.
  expected_citations: [AP-019, CAP-025]
  selection_rationale: |
    D+C because the design lens (hero typography occupies the largest
    display-scale slot) and the content lens (metric semantics) point at
    the same fix.

- id: eval-SP-C-001
  pillar: single-pillar
  combination: single-pillar
  source_fingerprint: "CAP-027: Fragment Chain as Default Prose"
  source_anchor: "docs/content-anti-patterns.md#cap-027"
  prompt: |
    The Élan case study Section 2 reads as a chain of sentence
    fragments. "Built a system. Watched it learn. Saw the gaps." Three
    sentences of three words each, back to back. It's punchy in
    isolation but four paragraphs in a row of this structure becomes
    exhausting. Fix the rhythm and tell me when fragment chains earn
    their place vs. when they're a tic.
  gold_resolution: |
    1. Audit Section 2 of `src/app/(frontend)/api/update-elan/route.ts`.
       Identify paragraphs that are 3+ consecutive fragments of <8 words
       each. Re-write into mixed prose: a few full sentences interleaved
       with one or two fragments for emphasis at beat boundaries.
    2. POST `/api/update-elan`. Verify the section reads with prose
       rhythm restored.

    Principle (CAP-027): fragment chains are a *cadence device*, not a
    *default voice*. They earn their place at beat boundaries where the
    staccato signals "stop and feel this." Used as the default sentence
    shape, they read as performative. Mix in full sentences. Reserve the
    fragments for the line that has to land.
  expected_citations: [CAP-027]
  selection_rationale: |
    Single-pillar control (content). Pure voice/cadence rule with no
    cross-pillar implication.

- id: eval-SP-D-001
  pillar: single-pillar
  combination: single-pillar
  source_fingerprint: "AP-067: Min-Width Floor on a Root Wrapper That Contains Functional Chrome"
  source_anchor: "docs/design-anti-patterns.md#ap-067"
  prompt: |
    On viewports narrower than 320px, the entire page including the
    fixed nav stops scrolling horizontally — the nav is clipped on the
    right. Hovering on the right side of the screen reveals a nav menu
    item but you can't reach it because there's no horizontal scroll. I
    don't think the agent should ever set a min-width floor on the page
    root. Fix it and codify the rule.
  gold_resolution: |
    1. Find the rule on the root layout wrapper (likely
       `src/app/layout.tsx` or a global SCSS file): `min-width: 320px` (or
       similar) applied to a root wrapper that contains the nav.
    2. Remove the min-width floor at the root level. Where minimum
       layout dimensions are needed, scope them to the inner content
       container, not the wrapper that contains functional chrome (nav,
       toolbar, modals).

    Principle (AP-067): root wrappers that contain functional chrome MUST
    be free of min-width floors, because the chrome is the user's only
    escape hatch on a narrow viewport. Apply minimum-dimension
    constraints to the inner content container, not the outer chrome
    host.
  expected_citations: [AP-067]
  selection_rationale: |
    Single-pillar control (design). Pure layout-architecture rule with
    no engineering or content angle.

- id: eval-SP-D-002
  pillar: single-pillar
  combination: single-pillar
  source_fingerprint: "AP-064: Native input text rendering for display-scale serif fonts"
  source_anchor: "docs/design-anti-patterns.md#ap-064"
  prompt: |
    The display-scale title input on the case-study editor is clipping
    its top — the cap-height of the serif glyphs is getting cropped at
    the input's top padding. Setting `padding-top` higher just makes the
    input taller without fixing the clip; the glyphs still sit at the
    top of their line box. Fix it and tell me what's structurally
    different about display-scale fonts in inputs.
  gold_resolution: |
    1. Replace the native `<input>` with a contentEditable surface (or
       an auto-resizing textarea wrapped to look like an input) for the
       display-scale title field. Native `<input>` line-height is
       browser-dependent and clips serif glyphs whose cap-height +
       ascender exceeds the computed line-box.
    2. Add glyph padding (top/bottom) inside the editable surface so
       ascenders and descenders have room.
    3. Constrain the surface to a single line via overflow + scroll, not
       via input height.

    Principle (AP-064): native `<input>` cannot reliably render display-
    scale serif fonts because the line-box geometry is browser-fixed and
    doesn't account for serif ascender/descender extension. CSS
    properties (`line-height`, `padding-top`) do not relocate glyphs
    inside an input's text rendering box.
  expected_citations: [AP-064]
  selection_rationale: |
    Single-pillar control (design). Pure typography-platform rule.
```
