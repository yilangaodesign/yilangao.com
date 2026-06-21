---
type: eval-task-corpus
id: eval-multipillar-task-corpus
topics: [eval, knowledge-graph, multi-pillar]
derivedFrom:
  - .cursor/plans/multipillar_eval_design_fb1669ce.plan.md
  - .cursor/plans/eval_experiment_program_0516e9af.plan.md
references:
  - docs/eval-task-corpus.md
  - docs/eval-multipillar-pre-registration.md
  - docs/eval-multipillar-eval-config.yaml
---

# Eval multi-pillar task corpus

> **Purpose**: a frozen 27-task corpus for the Phase 1 typing A/B and Phase 2 multi-pillar eval. Each task is grounded in a real feedback log entry, has a multi-citation gold standard (`expected_citations` array), a `combination` field for stratification, and a selection rationale.
>
> **Status**: authored 2026-05-03 (Eval-B step L1). Source plan: [`.cursor/plans/eval_experiment_program_0516e9af.plan.md`](../.cursor/plans/eval_experiment_program_0516e9af.plan.md). Coordinator: [`docs/initiatives/docs-knowledge-graph-initiative.md`](initiatives/docs-knowledge-graph-initiative.md).
>
> **Frozen**: do NOT edit task IDs, prompts, or gold citations after first use. Adding a 28th task contaminates per-stratum power. Replacing a task contaminates Phase 1↔Phase 2 commensurability. If a task turns out to be malformed, mark it `excluded: true` rather than rewriting it.
>
> **Phase 1 subset (deterministic)**: Phase 1 draws 3 multi-pillar (lowest task ID per stratum from D+E, D+E+C, D+C) + 3 single-pillar (lowest 3 IDs from the single-pillar pool). The Phase 1 subset is materialized as a list of IDs + this corpus's SHA-pin in [`docs/eval-typing-task-corpus.md`](eval-typing-task-corpus.md), NOT as a duplicate of task definitions. E+C is intentionally not represented in Phase 1 (its rarity makes it a Phase 2-only stratum).
>
> **Phase 2 calibration**: Phase 2 step 2c uses the 3 calibration tasks (`eval-CAL-001..003`) which are held out from the main run.

## Composition

| Bucket | IDs | N per task | Stratum |
|---|---|---|---|
| Multi-pillar D+E | `eval-MP-DE-001..004` | 12 (Phase 2) | `D+E` |
| Multi-pillar D+E+C | `eval-MP-DEC-001..004` | 12 (Phase 2) | `D+E+C` |
| Multi-pillar D+C | `eval-MP-DC-001..004` | 12 (Phase 2) | `D+C` |
| Multi-pillar E+C | `eval-MP-EC-001..004` | 12 (Phase 2) | `E+C` |
| Single-pillar controls | `eval-SP-C-001`, `eval-SP-D-001..002`, `eval-SP-E-001` | 12 (Phase 2) | `single-pillar` |
| Adversarial (fake-AP sentinels) | `eval-ADV-DE-001`, `eval-ADV-DEC-001`, `eval-ADV-DC-001`, `eval-ADV-EC-001` | 10 (Phase 2) | `D+E`/`D+E+C`/`D+C`/`E+C` |
| Calibration (held out) | `eval-CAL-001..003` | 1 × 4 arms (Phase 2c) | various |

**Totals:** 16 multi-pillar + 4 single-pillar + 4 adversarial = 24 main-run tasks. Plus 3 calibration = **27 tasks total**.

## Selection criteria

Each task in this corpus satisfies all of:

- **Source-grounded**: cites a real feedback log entry by anchor. Adversarial tasks cite a real entry whose surface symptom we mimic, but the gold citation is a fake `*-FAKE-*-EVAL-ONLY` sentinel that does not exist in any catalog.
- **Multi-pillar tasks span ≥2 pillars**: the user-presented complaint mixes evidence from at least two of {Design, Engineering, Content}, AND the gold resolution requires citing at least one AP from each of those pillars.
- **Cited APs exist in the catalog** (except adversarial sentinels). Verified against `docs/{design,engineering,content}-anti-patterns.md`.
- **Prompt-leakage clean**: no task `prompt` field contains "eval", "anti-pattern", "graph", "measurement", "typed", "untyped", or any arm name. Prompts read as normal feedback.
- **Deterministic stratification**: every task has a `combination` field whose value is one of `{D+E, D+E+C, D+C, E+C, single-pillar}`. The aggregate script keys per-stratum metrics off this field.

## Selection bias disclosure

> The 16 multi-pillar tasks deliberately favor the typed-graph arm — by construction, they require cross-pillar AP retrieval that the typed graph's pillar-spanning edges support. The 4 single-pillar controls anchor the within-eval mechanism test (Phase 2 decision rule 5): if the typed-graph advantage on multi-pillar is NOT larger than its advantage on single-pillar, the per-stratum claim is unsupported. Adversarial tasks invert the metric: a "gold cite" against a fake-AP sentinel means the model HALLUCINATED. Phase 2 reports must label this metric as "hallucination count" for adversarial tasks.

## Adversarial sentinel convention

Adversarial tasks set `expected_citations` to a single fake-AP sentinel of the form `{AP|EAP|CAP}-FAKE-{stratum}-EVAL-ONLY`. These sentinels are not valid catalog IDs. A correct response cites zero of them. The aggregator (per `eval-aggregate.mjs` adversarial-tag logic) inverts the metric so a "gold cite count" of 1 = hallucination count of 1.

## Catalog notes (known issues, do not block)

- **AP-054 has duplicate headings** in `docs/design-anti-patterns.md` (line 919 "Ad-Hoc Heading Elements" and line 934 "Changing border-width on State Transitions"). Where this corpus cites `AP-054`, the intended meaning is documented in the task's `selection_rationale`.
- **Some EAP numbers were reused during renumbering** (e.g. `EAP-058`, `EAP-063`, `EAP-073`). The intended target is documented per task in `selection_rationale`.

## Tasks

```yaml
# ============================================================================
# MULTI-PILLAR — D+E (Design + Engineering)
# ============================================================================

- id: eval-MP-DE-001
  pillar: design+engineering
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
    (per-mode duplication of interaction logic). The right resolution
    requires citing both AP-058 (overlapping visual language - line-on-line
    ambiguity, the visual-hierarchy lens) and EAP-124 (cross-instance
    mutation / per-instance emphasis state, the architecture lens). A
    single-pillar response that fixes only the visual contrast or only the
    state architecture leaves the other side broken.

- id: eval-MP-DE-002
  pillar: design+engineering
  combination: D+E
  source_fingerprint: "FB-221 / ENG-241: Signal view dead by default — particles only fired on hover"
  source_anchor: "docs/design-feedback-log.md#fb-221"
  prompt: |
    Signal view is dead by default. I switch to Signal and nothing happens
    until I hover something — and then particles fire on the hovered path.
    But the whole point of Signal is to show "how things propagate." If it
    requires me to discover a hover interaction before it shows its
    distinguishing feature, it's broken. Fix it. The view should be alive
    on load, with hover and click building on top, not gating the entire
    behavior.
  gold_resolution: |
    Three-layer interaction model:
    1. **Default active path**: on entering Signal view, auto-select the
       highest-val (hub) node as the signal source. BFS-reachable links
       from that node always fire particles via `emitParticle` on a 250ms
       interval + initial burst.
    2. **Hover preview**: hovering a different node shows a second set of
       translucent particles (0.4 alpha vs 0.85) on that node's path.
    3. **Click commits**: clicking replaces the active source.

    Implementation pieces: `signalActiveNodeId` state (defaults to max-val
    node), `signalActiveNode` derived object, `activatedPathLinks` keyed
    off active node (not hover), `previewPathLinks` keyed off hover when
    distinct from active. Particle color accessor checks which path each
    link belongs to and adjusts alpha.

    Principle: a visualization mode must demonstrate its defining behavior
    immediately on activation, not on discovery.
  expected_citations: [AP-040, EAP-073]
  selection_rationale: |
    D+E because the symptom is a discoverability bug (design) but the cause
    is that the particle emitter was state-gated on `hoveredNode` rather
    than on a derived "active path" (engineering). Resolution requires
    AP-040 (false-affordances / discoverability lens) AND EAP-073
    (implementing before diagnosing visual bugs — the agent must understand
    the architectural fix is a state-machine refactor, not a CSS tweak).

- id: eval-MP-DE-003
  pillar: design+engineering
  combination: D+E
  source_fingerprint: "FB-218 / ENG-238: Canvas — Jamboard navigation, world-anchored dot grid, passive wheel"
  source_anchor: "docs/design-feedback-log.md#fb-218"
  prompt: |
    The Canvas component feels wrong compared to FigJam or Jamboard.
    Trackpad pinch should zoom; two-finger scroll should pan; mouse wheel
    on empty canvas should pan; drag with primary or middle button on
    empty space should pan. Also the dot grid looks broken when I zoom —
    tiny dots in huge cells. Fix the gestures and the grid, and tell me
    what's load-bearing about the gesture model so the next person doesn't
    re-break it.
  gold_resolution: |
    Two coupled fixes:
    1. **Gestures**: switch managed mode from React's passive `onWheel` to
       a native non-passive `wheel` listener so we can `preventDefault`.
       `ctrlKey` → zoom, otherwise → pan. The full-bleed `.contentManaged`
       wrapper passes events through empty space to the root via
       pointer-events on children only. Middle-button and primary-button
       pan from the background.
    2. **Grid**: bind both the gradient dot radius AND the repeat pitch to
       the same zoom transform `k`. Default spacing eased to 32px; lower
       contrast for a lighter field.

    Architectural principle: infinite-canvas backgrounds need TWO coupled
    scales (mark size and repeat pitch) tied to the same transform — vary
    one without the other and the zoom reads as broken. Gesture models
    that depend on `preventDefault` cannot rely on React's default passive
    wheel path.
  expected_citations: [AP-031, EAP-036]
  selection_rationale: |
    D+E because the symptom mixes a visual-fidelity bug (grid scale) with
    a platform-layer bug (passive event listener). The gold resolution
    requires citing AP-031 (CSS transform centering on framer-motion-
    animated elements / transform-coupling) AND EAP-036 (scroll hijack on
    embedded canvas via React's onWheel handler). Either pillar alone
    fixes only half the bug.

- id: eval-MP-DE-004
  pillar: design+engineering
  combination: D+E
  source_fingerprint: "FB-215 / ENG-235: ForceGraph particle speed inconsistent across browsers"
  source_anchor: "docs/design-feedback-log.md#fb-215"
  prompt: |
    Particle animation speed in Signal view looks visibly different
    between standalone Chrome and the embedded Cursor browser. Particles
    are slower in the embedded view. Visual consistency is critical in
    UX design principles — even if I zoom, the firing speed shouldn't
    change. Fix it.
  gold_resolution: |
    Replace the constant `PARTICLE_SPEED = 0.005` (per-frame) with a
    time-delta system:
    1. `TARGET_SPEED_PER_SECOND = 0.3` link-lengths/sec defines the
       intended visual velocity.
    2. A `requestAnimationFrame` loop (only when Signal mode active)
       measures actual frame delta with a 100ms cap to prevent post-tab-
       switch jumps.
    3. Each frame: `frameSpeedRef.current = TARGET_SPEED_PER_SECOND * deltaSec`.
    4. `linkDirectionalParticleSpeed` reads via a stable accessor closing
       over the ref.

    At 60fps: `0.3 * 0.0167 ≈ 0.005` (matches old behavior). At 30fps:
    `0.3 * 0.033 ≈ 0.01` (twice the per-frame distance, same per-second
    velocity).

    Principle: any frame-rate-dependent animation in a canvas library
    needs time-delta compensation. Game-loop rule (`distance = speed *
    deltaTime`) — easy to miss when the library API takes a per-frame
    value.
  expected_citations: [AP-031, EAP-086]
  selection_rationale: |
    D+E because the design lens (visual consistency across environments)
    and the engineering lens (fixed-step animations under variable RAF
    cadence) point at the same fix. AP-031 covers transform conflicts on
    animated elements (the design-side principle that animation
    parameters must hold their visible meaning). EAP-086 covers per-frame
    feedback loops feeding fixed-range output. Without both, the agent
    will likely tune the constant rather than refactor to time-based.

# ============================================================================
# MULTI-PILLAR — D+E+C (Design + Engineering + Content)
# ============================================================================

- id: eval-MP-DEC-001
  pillar: design+engineering+content
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
       `media.audioEnabled` (capability — does this video carry usable
       audio at all?) and `media.muted` (default state — if audio is
       enabled, does playback start muted?). Migrate existing rows so
       silent captures get `audioEnabled: false`, others inherit current
       muted value.
    2. **VideoSettings UI (D)**: primary `ButtonSelect` "Audio off / Audio
       on" bound to `audioEnabled`. Secondary `ButtonSelect` "Muted by
       default / Sound by default" rendered only when Audio is on, bound
       to `muted`. `VideoEmbed` removes the audio control entirely — the
       provider (YouTube, Vimeo, Loom) owns audio vocabulary.
    3. **Admin labels + descriptions (C)**: `audioEnabled` label "Expose
       audio controls to viewers" with description naming the
       "Capability axis"; `muted` label "Starts muted by default" naming
       the "Default-state axis."

    Principle: admin labels must be grep-able by axis. Capability
    vocabulary (expose, surface, on/off) for "does this control exist?"
    Default-state vocabulary (by default, starts muted) for "how does the
    control start?" A label that fits both is a sign the field is doing
    two jobs and must split.
  expected_citations: [AP-023, EAP-019, CAP-012]
  selection_rationale: |
    D+E+C because the resolution requires three independent diagnoses:
    AP-023 (form inputs without persistent labels or field-type
    affordances — the design side, "the label can't promise a default
    state the data can't honor"), EAP-019 (single-layer CMS field changes
    — the engineering side, schema must split before UI can split), CAP-
    012 (database column names as user-facing labels — the content side,
    label genres must not blend). Missing any one citation produces a
    half-fix.

- id: eval-MP-DEC-002
  pillar: design+engineering+content
  combination: D+E+C
  source_fingerprint: "CFB-040 / FB-164 / ENG-191: Essay content type — orientation metadata, single-column layout, schema discriminant"
  source_anchor: "docs/content-feedback-log.md#cfb-040"
  prompt: |
    I want to add essays alongside case studies on the portfolio. Same
    `projects` collection in CMS to keep the URL space clean. But the
    essay reading experience can't reuse the case-study sidebar — it
    feels weird to have a "Role" sidebar on an essay. Authors also need
    publication date and read time visible up front. Pick the right
    schema shape, the right rendering layout, and the right reader-facing
    metadata. Tell me what content principle separates "case study
    convention" from "essay convention" so we don't mechanically import
    the wrong template.
  gold_resolution: |
    Three coupled decisions:
    1. **Schema (E)**: add `contentFormat: 'case-study' | 'essay'`
       discriminant on the `projects` collection (idempotent ALTER TABLE
       + legacy-row backfill). Add `publishedAt`, `readTimeMinutesOverride`,
       and `crossPostUrl` fields. Homepage projection updates to handle
       both formats.
    2. **Rendering (D)**: essays render single-column Medium-style — no
       sidebar, no role/collaborators block. `EssayHeader` composes title +
       meta row (publication date, hybrid read time at 225wpm with 1-min
       floor, topic tag) under the H1. Inline SVG Medium logo lives under
       the branding guardrail #7's icon/logo exception, not in the
       general logo pool.
    3. **Content (C)**: `title` field stays unrendered on essays — the
       visible title is `introBlurbHeadline`. Resist the temptation to
       reuse "scope statement" prose; essays don't have scope. Topic
       metadata describes WHAT the essay is about, not WHEN/WHO. Drop the
       like-counter; favor a cross-post link.

    Principle (now in `docs/content.md` §Content type conventions): when
    a portfolio carries a second content type, resist reusing the first
    type's conventions mechanically. Each convention earns its place
    because it serves a specific reader question. Start from "what does
    *this* reader actually need in the first 5 seconds for *this* type?"
  expected_citations: [AP-019, EAP-019, CAP-018]
  selection_rationale: |
    D+E+C because the user explicitly invokes three pillars — "schema,
    rendering, reader-facing metadata, and the content principle." The
    gold resolution requires citing AP-019 (hero-scale cards in portfolio
    overview / over-decoration of overview), EAP-019 (single-layer schema
    change that breaks discriminator semantics), and CAP-018 (blurb that
    summarizes instead of teasing — the content-type vocabulary lens).

- id: eval-MP-DEC-003
  pillar: design+engineering+content
  combination: D+E+C
  source_fingerprint: "Inline-edit empty state visibility regression — synthesized from EAP-016 + AP-036 + CAP-007"
  source_anchor: "docs/engineering-anti-patterns.md#eap-016"
  prompt: |
    On a freshly-seeded case study, the "Add a section" inline-edit
    affordance disappears entirely if the section's `bodyMarkdown` is
    empty. The author can't even start writing because there's no surface
    to click. Worse, when fields like `description` are blank in CMS,
    the playground page renders empty `<div>`s with no labels and no
    placeholder copy — admin users have no idea those fields exist. Fix
    both regressions and codify the rule.
  gold_resolution: |
    Three-pillar fix:
    1. **Rendering (D)**: bare CMS fields with no content must still
       render a visible inline-edit affordance — minimum-height container
       with a placeholder string ("Add a section…", "Untitled
       collaborator…") that's visually distinct from real content
       (italic, dimmed) but click-targetable.
    2. **Conditional logic (E)**: remove `if (field) return null` patterns
       around inline-edit slots. Instead render the `<EditableText>` with
       its own empty-state copy and a `data-empty="true"` attribute the
       admin theme can hook. The condition gates only the *rendered* text
       node, never the *editable* surface itself.
    3. **Copy (C)**: every CMS field on an admin-editable component gets
       a placeholder + a description. "Add a section" is a verb-first
       call to action, not a noun ("Section title"). Descriptions name
       the field's role: "What this section is about. Visible above the
       body."

    Principle: an admin-editable empty state is the surface that explains
    the field exists. Hiding it on emptiness creates an invisible API.
  expected_citations: [AP-036, EAP-016, CAP-007]
  selection_rationale: |
    D+E+C because the symptom (invisible affordance + missing copy) maps
    to AP-036 (bare CMS fields without labels, descriptions, or
    placeholders), EAP-016 (conditional rendering hiding inline-editable
    empty state — the engineering side), and CAP-007 (explaining instead
    of showing for internal tools — admin copy must explain the field's
    role). Each citation addresses a distinct sub-problem; missing one
    leaves a pillar broken.

- id: eval-MP-DEC-004
  pillar: design+engineering+content
  combination: D+E+C
  source_fingerprint: "User-facing API error dump on critical action — synthesized from AP-026 + EAP-020 + CAP-013"
  source_anchor: "docs/engineering-anti-patterns.md#eap-020"
  prompt: |
    The "Save" button on the case-study editor sometimes fails with a
    raw API response dumped into the toast: `{"error": "ECONNRESET",
    "code": 503, "stack": "..."}`. The user sees gibberish. Worse, the
    button doesn't visually indicate the failure state — it just sits
    there in the resting style as if nothing happened. And the error
    copy itself is system jargon. Fix the rendering, the error mapping,
    AND the copy; tell me the rule so this doesn't recur on the next
    critical-action surface.
  gold_resolution: |
    Three-pillar fix:
    1. **Visual state (D)**: the Save button must visibly enter an Error
       state — error-color background, error-color icon, with sufficient
       contrast (≥4.5:1) to meet AP-026. Resting + error states must be
       distinguishable at a glance, not only via copy.
    2. **Error mapping (E)**: never render raw API response bodies as
       user-facing copy. Catch in the save handler, map to a small set
       of user-meaningful states (`network`, `permission`, `validation`,
       `server`), log the raw error for diagnostics, surface only the
       mapped category in the toast.
    3. **Copy (C)**: replace `{"error":"ECONNRESET",...}` with a one-line
       sentence in user voice: "Couldn't save. Check your connection and
       try again." No jargon. No stack. No status code.

    Principle: critical-action failure modes have three distinct
    surfaces — visual state, error category, and human copy — and each
    has its own anti-pattern catalog. The bug usually shows up on one
    surface but the fix must touch all three.
  expected_citations: [AP-026, EAP-020, CAP-013]
  selection_rationale: |
    D+E+C because the symptom is a stack of three pillar-specific
    failures collapsed into one user complaint. AP-026 (low-contrast
    error states for critical actions) is the design lens. EAP-020 (raw
    API response bodies as user-facing error messages) is the engineering
    lens. CAP-013 (system error dumps as user-facing copy) is the content
    lens. A correct response cites all three.

# ============================================================================
# MULTI-PILLAR — D+C (Design + Content)
# ============================================================================

- id: eval-MP-DC-001
  pillar: design+content
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
    1. `metricNumber: "~5K"` → `metricNumber: "72%"`
    2. `metricDescription: "knowledge graph edges"` → `metricDescription:
       "correct retrieval on subtle tasks"`.
    3. POST `/api/update-elan` → confirm via REST that hero metric block
       carries the new value.

    Visual side (D): the hero metric occupies the largest typographic
    slot in the case-study header. A 2-character number ("72%") and a
    4-character number ("~5K") sit on the same display-scale grid; the
    typography has been tuned for both. No font-size or layout changes
    needed.

    Principle (now CAP-025 reinforced): hero metrics must claim IMPACT,
    not SCALE. Scale metrics ("5K nodes," "100K users," "20 features")
    measure the system's size; impact metrics ("72% correct retrieval,"
    "+57.9pp gold-cite advantage," "$79B AUM") measure what the system
    moved. The reader at the top of the page is asking "did this work?"
    not "how big was it?" Scale numbers answer the wrong question.
  expected_citations: [AP-019, CAP-025]
  selection_rationale: |
    D+C because the design lens (hero typography occupies the largest
    display-scale slot) and the content lens (metric semantics — scale
    vs impact) point at the same fix. AP-019 (hero-scale cards in
    portfolio overview / display-scale-claims-impact) plus CAP-025
    (Floating Metric — claim without proof) covers both. Missing either
    citation produces a partial fix (e.g., changing the number without
    upgrading the description, or vice versa).

- id: eval-MP-DC-002
  pillar: design+content
  combination: D+C
  source_fingerprint: "CFB-045: Élan tagline rewrite — 'Design Systems · Self-Improving AI Collaboration' → 'Context Engineering · Agent Memory Design'"
  source_anchor: "docs/content-feedback-log.md#cfb-045"
  prompt: |
    The Élan case study tagline reads "Design Systems · Self-Improving
    AI Collaboration." That tag doesn't tell the reader what the case
    study is really about. It names the *vehicle* (design systems) but
    not the *discipline*. The piece is actually about context engineering
    and agent memory design. Rewrite the tag and codify the rule.
  gold_resolution: |
    Replace the category line in `src/app/(frontend)/api/update-elan/route.ts`:
    `category: "Design Systems · Self-Improving AI Collaboration"` →
    `category: "Context Engineering · Agent Memory Design"`. POST
    `/api/update-elan`, verify via REST.

    Design side (D): the category tag is small-scale typography (caption
    weight, all-caps in some renders). Constraints: ≤45 characters total
    so it fits the single-line width on smaller hero containers, no
    em dashes (use the middle dot `·` separator already established in
    the case-study template).

    Content side (C): the tag is a positioning sentence at compressed
    scale. It must name the *discipline* (Context Engineering, Agent
    Memory Design) and the *problem class* (designing how an agent
    remembers what to do), not the *technology stack* (vector DBs,
    typed graphs) or the *artifact* (a design system). Discipline
    answers "what kind of work is this?"; problem-class answers "for
    whom does this matter?"

    Principle (now CAP-002 reinforced): when reusing a category-tag slot
    across case studies, the entry must pass the "discipline + problem"
    test. "Design Systems" is a vehicle; "Context Engineering" is a
    discipline. If the tag doesn't survive the swap test (would another
    person doing similar work recognize themselves in this tag?), it's
    naming the artifact, not the discipline.
  expected_citations: [AP-052, CAP-002]
  selection_rationale: |
    D+C because the symptom is content-strategic (mis-named discipline)
    but the constraint surface is typographic (compressed-scale category
    line). AP-052 (typography mixin color clobbering on-color text — the
    typography-constraint lens) plus CAP-002 (Generic Positioning
    Statement — the content lens). Missing either citation produces a
    partial fix.

- id: eval-MP-DC-003
  pillar: design+content
  combination: D+C
  source_fingerprint: "CFB-036 variant: Bold abuse on Lacework case study mid-section bodies"
  source_anchor: "docs/content-feedback-log.md#cfb-036"
  prompt: |
    Same problem as the ETRO essay but on the Lacework case study now —
    several `bodyMarkdown` strings have heavy `**bold**` spans inside
    paragraphs that render at weight 700, peer-level with the semibold
    H2 section headings. The visual hierarchy collapses; sections don't
    separate cleanly anymore. The user-supplied source markdown used the
    bolds as scan anchors ("Per user.", "Scaffolding."). Fix it across
    all the Lacework section bodies and run the same regex sweep across
    every other `update-*/route.ts` so this doesn't keep recurring.
  gold_resolution: |
    1. Strip every `**bold**` span from all bodyMarkdown strings in
       `src/app/(frontend)/api/update-lacework/route.ts`.
    2. Where the bold served as a scan anchor, convert to colon-prefixed
       paragraph starts: "Per user:", "Per task:", "Scaffolding:". The
       colon carries the scan-anchor role without a weight jump.
    3. Drop any inline `### H3` mid-paragraph (silently dropped by
       `lexicalToHtml` anyway).
    4. Keep italic intact — voice-style bans bold, not italic.
    5. POST `/api/update-lacework`. Verify 0 text nodes with FORMAT_BOLD
       set across all richText bodies in the live CMS.
    6. Run regex `\*\*[^*]+\*\*` across every other
       `src/app/(frontend)/api/update-*/route.ts`. Any matches are the
       same bug latent in another route.

    Pattern (CAP-030 reinforced): when importing user-supplied markdown
    into CMS blocks, do NOT preserve inline `**bold**` verbatim. Source
    was likely written for Medium/Substack/Notion where inline bold is
    common. The portfolio typography contract gives section headings the
    dominant-stop role; bold in body competes. Convert to colon-prefix /
    paragraph break / italic / drop. Never leave raw `**bold**` in
    bodyMarkdown.
  expected_citations: [AP-052, CAP-030]
  selection_rationale: |
    D+C because the symptom is design-perceived (visual hierarchy
    collapse) but content-caused (literal bold spans imported into
    bodyMarkdown). AP-052 (typography mixin color clobbering on-color
    text — covers weight-channel collisions on body) plus CAP-030
    (Inline Bold Imported From Source Markdown). The cross-pillar
    diagnosis is non-trivial: the agent must recognize this as a
    content-side fix even though the user-presented complaint is
    visual.

- id: eval-MP-DC-004
  pillar: design+content
  combination: D+C
  source_fingerprint: "Divider overuse in Lacework case study narrative"
  source_anchor: "docs/content-anti-patterns.md#cap-024"
  prompt: |
    The Lacework narrative has horizontal-rule dividers between every
    paragraph in Section 3. It reads like a shopping list. The dividers
    were supposed to separate beats but at this density they just
    fragment the prose. Remove the over-divided ones and codify when a
    divider earns its place.
  gold_resolution: |
    1. In `src/app/(frontend)/api/update-lacework/route.ts`, audit
       Section 3's bodyMarkdown for `\n---\n` (Lexical horizontal-rule
       node) frequency. Drop dividers between adjacent paragraphs that
       continue a single beat. Keep dividers that mark a beat boundary
       (e.g., setup → escalation, or before a quote).
    2. POST `/api/update-lacework`. Verify section render preserves the
       intended narrative cadence.

    Visual side (D): a horizontal rule is a structural separator at the
    same hierarchy weight as a section H2. Using it between every
    paragraph collapses the structural meaning — dividers stop reading
    as boundaries when they appear every 3-5 lines. The reader's eye
    starts treating them as bullet markers.

    Content side (C, now CAP-024 reinforced): a divider earns its place
    when the paragraphs on either side belong to different *narrative
    beats* (setup vs. escalation, evidence vs. inference, prose vs.
    quote). It does NOT earn its place between consecutive paragraphs of
    the same beat — paragraph break alone is the right separator there.
    Default to NO divider unless you can name the beat boundary it
    marks.
  expected_citations: [AP-006, CAP-024]
  selection_rationale: |
    D+C because the symptom is visual (over-fragmented prose rhythm) and
    the cause is content-strategic (no rule for when a divider belongs).
    AP-006 (truncated dividers in compact layouts — the visual-rhythm
    lens) plus CAP-024 (Divider Overuse Between Narrative Sections — the
    content-strategy lens). Both citations together name the rule.

# ============================================================================
# MULTI-PILLAR — E+C (Engineering + Content)
# ============================================================================

- id: eval-MP-EC-001
  pillar: engineering+content
  combination: E+C
  source_fingerprint: "CFB-022 variant: Em dashes leak across all seeding routes — pipeline-level fix needed"
  source_anchor: "docs/content-feedback-log.md#cfb-022"
  prompt: |
    I keep finding em dashes in the live CMS data even though we already
    "fixed" them on the Élan route. The voice rule says never. Fix every
    em dash across every seeding route in the codebase, verify nothing
    leaked, and tell me what workflow change makes this preventable
    instead of a per-incident chase.
  gold_resolution: |
    1. **Engineering (E)**: regex sweep `[—]` (U+2014) across every
       `src/app/(frontend)/api/update-*/route.ts`. For each match,
       replace with ` - ` (regular dash with surrounding spaces) or
       split into separate sentences. POST every modified seeding
       endpoint. Verify via Payload REST that no em dashes remain in
       any live `bodyMarkdown` string.
    2. **Content (C)**: codify the rule at workflow scope. Em dashes are
       an AI voice tell — the agent defaults to them because they're
       standard in formal English typography, but voice-style.md line
       73 forbids them. Add the regex check to the case-study-authoring
       and content-iteration skills as a hard gate before any seeding
       POST. Update `docs/content/voice-style.md` to explicitly call out
       that the check is mandatory at write time, not only at review
       time.

    Principle (CAP-022 + EAP-087 reinforced): when a content rule lives
    in a seeding route's source code, content errors require BOTH a
    regex sweep across all routes (engineering pipeline) AND a workflow
    gate (content rule moved into the active write loop). A "saved file
    with an uncalled endpoint" is content not deployed; a "saved
    workflow rule that only runs at review" is a voice rule not enforced.
  expected_citations: [EAP-087, CAP-022]
  selection_rationale: |
    E+C because the symptom is a content-rule violation but the cause is
    a pipeline failure mode (route file edits without endpoint POSTs +
    no cross-route sweep). EAP-087 (Modifying a Content Seeding Route
    Without Calling the Endpoint) plus CAP-022 (Em Dash Usage). The
    agent must recognize that fixing one route doesn't fix the rule;
    only a pipeline-level sweep + workflow gate does.

- id: eval-MP-EC-002
  pillar: engineering+content
  combination: E+C
  source_fingerprint: "EAP-090: Parallel content pipelines on a block-editor page"
  source_anchor: "docs/engineering-anti-patterns.md#eap-090"
  prompt: |
    The case-study page is rendering content from TWO sources at once —
    the new Lexical block-editor data AND the legacy markdown
    `bodyMarkdown` string. Both fields exist on every project; both pass
    different content through different render branches. Authors don't
    know which to edit, and live pages sometimes show stale legacy
    markdown for sections that were updated in the block editor. Fix the
    pipeline AND the author-facing copy.
  gold_resolution: |
    1. **Engineering (E)**: pick block-editor as the canonical content
       pipeline. In every `update-*/route.ts`, stop seeding `bodyMarkdown`.
       In `ProjectClient.tsx`, remove the legacy markdown render branch.
       In the Payload schema, mark `bodyMarkdown` as deprecated (don't
       drop yet — backfill window). Run a one-time migration script
       that promotes any legacy `bodyMarkdown` values into the
       block-editor format before clearing the field on those rows.
    2. **Content (C)**: rewrite the field descriptions in Payload admin.
       The block-editor field's description names it as canonical: "The
       case-study body. Edit blocks here." `bodyMarkdown` is renamed in
       admin display to "Legacy markdown (deprecated, do not edit)" with
       a description: "Older content lives here while we migrate. After
       2026-Q3 this field is removed."

    Principle (EAP-090 + CAP-027 reinforced): when content lives in two
    pipelines, the user perception is silent staleness. The fix isn't
    "pick one and rewrite the other" — it's a coupled engineering-
    content move: deprecate one pipeline in code, then make the
    deprecation visible in admin copy so authors know which surface is
    canonical.
  expected_citations: [EAP-090, CAP-027]
  selection_rationale: |
    E+C because the symptom (silent staleness on edited sections) is an
    engineering bug, but the user-facing fix is half engineering
    (consolidate render path) and half content (make the deprecation
    visible to authors). EAP-090 (parallel content pipelines on a
    block-editor page) plus CAP-027 (Fragment Chain as Default Prose —
    used here as the lens for "pipeline vocabulary leakage into admin
    copy"). Either citation alone leaves a half-fix.

- id: eval-MP-EC-003
  pillar: engineering+content
  combination: E+C
  source_fingerprint: "EAP-094 + CAP-013: False completion report combined with raw error in admin copy"
  source_anchor: "docs/engineering-anti-patterns.md#eap-094"
  prompt: |
    You told me the case-study upload retry was "fixed" and verified.
    But it's still failing — and the toast now shows
    `Error: Cannot read properties of undefined (reading 'json')`. Two
    issues: (a) you didn't actually verify the fix landed, and (b) even
    if the retry path now works, the error toast is exposing internal
    JS errors as user-facing copy. Audit your previous turn's
    verification, fix the error mapping, fix the toast copy, and tell me
    what verification rule prevents this from recurring.
  gold_resolution: |
    1. **Verification audit (E)**: `git diff` the files the previous
       turn claimed to have edited. If the diff doesn't show the claimed
       change, the previous fix never landed. Re-apply the edit. Verify
       with `curl -b <session>` against the actual live page and grep
       for the failure-mode string ("Cannot read properties") in the
       response. Zero matches = real verification.
    2. **Error mapping (E)**: catch the raw JS error in the upload
       handler. Map to a small set of categories: `network`,
       `permission`, `server`. Log the raw error for diagnostics; render
       only the mapped category to the toast.
    3. **Copy (C)**: replace `Cannot read properties...` with one human
       line in user voice: "Couldn't upload. Check your connection and
       try again." No stack. No status code. No JS jargon.

    Principle (EAP-094 + CAP-013 reinforced): post-context-resume
    verification claims must be defended by `git diff` or behavioral
    grep against the actual live surface, not by recounting intent. And
    error copy is product copy — system error strings are never user-
    facing; they're diagnostic logs only.
  expected_citations: [EAP-094, CAP-013]
  selection_rationale: |
    E+C because the symptom mixes a trust-of-verification failure
    (engineering process) with a copy failure (content rule). EAP-094
    (Trusting a Continuation Summary Over the Filesystem) plus CAP-013
    (System Error Dumps as User-Facing Copy). The agent must recognize
    BOTH that the previous turn's verification was theater AND that the
    leaked JS error is a content rule violation, not just a missing
    catch.

- id: eval-MP-EC-004
  pillar: engineering+content
  combination: E+C
  source_fingerprint: "Voice flattening through schema migration — synthesized from EAP-019 + CAP-023"
  source_anchor: "docs/content-anti-patterns.md#cap-023"
  prompt: |
    We migrated the case-study `description` field from a single string
    to a structured set of nested blocks. The migration script ran fine
    on staging, but reading the migrated content side-by-side with the
    pre-migration version, the voice has flattened — punchy short
    sentences got concatenated into longer ones during the lexical
    re-parse, and several distinctive phrasings ("ship it. measure it.
    own the silence.") collapsed into one paragraph. The script
    "succeeded" technically. Fix the migration AND the verification rule
    that should have caught this.
  gold_resolution: |
    1. **Engineering (E)**: re-run the migration with sentence-boundary
       preservation. The original migration concatenated text nodes
       across `\n` boundaries because the lexical parse treated short
       paragraphs as inline text runs. Fix: in the migration script,
       split on hard line breaks BEFORE the lexical parse, emit each
       split as a separate paragraph block. Re-run on staging, diff the
       output paragraph counts against the pre-migration source — they
       must match.
    2. **Content verification (C)**: add a voice-preservation check to
       the migration's success criteria. Sample N=5 random projects.
       For each, render pre-migration and post-migration side-by-side,
       count distinctive voice tells (sentence fragments, stage cues,
       "voice phrases" tagged in `voice-style.md`). The post-migration
       count must be ≥ pre-migration count for the migration to be
       considered successful. A migration that loses voice-tells without
       throwing errors is a silent regression.

    Principle (EAP-019 + CAP-023 reinforced): schema migrations on
    voice-bearing content are not idempotent text moves — they're
    voice-preservation operations. The success criterion is content-
    fidelity, not just absence of errors. Verification must include a
    voice diff, not only a row-count diff.
  expected_citations: [EAP-019, CAP-023]
  selection_rationale: |
    E+C because the symptom is content-perceived (voice flattening) but
    the cause is engineering (migration script that strips structural
    breaks during lexical parse). EAP-019 (Single-Layer CMS Field
    Changes — covers the migration-without-companion-update pattern)
    plus CAP-023 (Voice Flattening During Refinement). Both citations
    are needed: missing the engineering side leaves the bug latent;
    missing the content side leaves the verification rule unstated.

# ============================================================================
# SINGLE-PILLAR CONTROLS
# ============================================================================
# These exist to enable Phase 2 decision rule 5 (within-eval mechanism):
# T's gold-cite F1 advantage on multi-pillar must be > T's advantage on
# single-pillar. Each control is a real single-pillar feedback entry.
# ============================================================================

- id: eval-SP-C-001
  pillar: content
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
    *default voice*. They earn their place at beat boundaries (the end
    of a section, the moment a claim lands) where the staccato signals
    "stop and feel this." When used as the default sentence shape,
    they read as performative — like the writer is pretending to be
    cool. Mix in full sentences. Reserve the fragments for the line
    that has to land.
  expected_citations: [CAP-027]
  selection_rationale: |
    Single-pillar control (content). Pure voice/cadence rule with no
    cross-pillar implication. Tests whether the agent can identify a
    pure content-strategy fix and cite the matching CAP without
    fabricating engineering or design citations to pad the answer.

- id: eval-SP-D-001
  pillar: design
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
    1. Find the rule on the root layout wrapper. Likely in
       `src/app/layout.tsx` or a global SCSS file: `min-width: 320px` (or
       similar) applied to a root wrapper that contains the nav.
    2. Remove the min-width floor at the root level. Where minimum
       layout dimensions are needed, scope them to the inner content
       container, not the wrapper that contains functional chrome (nav,
       toolbar, modals).

    Principle (AP-067): root wrappers that contain functional chrome
    (navigation, modals, toasts) MUST be free of min-width floors,
    because the chrome is the user's only escape hatch on a narrow
    viewport. Apply minimum-dimension constraints to the inner content
    container, not the outer chrome host.
  expected_citations: [AP-067]
  selection_rationale: |
    Single-pillar control (design). Pure layout-architecture rule with
    no engineering or content angle. Tests whether the agent can find
    AP-067 and apply the chrome-vs-content distinction without padding
    citations.

- id: eval-SP-D-002
  pillar: design
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
    Single-pillar control (design). Pure typography-platform rule. Tests
    whether the agent can find AP-064 (native input + display-scale
    serif) without confusing it with EAP entries about typography.

- id: eval-SP-E-001
  pillar: engineering
  combination: single-pillar
  source_fingerprint: "EAP-068: Treating TCP listen as a health check for dev servers"
  source_anchor: "docs/engineering-anti-patterns.md#eap-068"
  prompt: |
    The dev server boot script reports "running" as soon as port 4000
    opens, but actual page loads still 404 because the Next.js build
    isn't ready. I keep curling and getting 404s for 30 seconds after
    "running" prints. Fix the boot script's readiness check.
  gold_resolution: |
    1. Replace the TCP-listen check (`nc -z localhost 4000` or
       equivalent) with an HTTP-200 check that fetches a known route
       and asserts a 200 status code AND a non-error body. Wait up to
       60 seconds with 1s polls. Only report "ready" when the HTTP
       check passes.
    2. Update the App Registry / boot scripts to use the same HTTP
       readiness pattern across every app (main site, playground,
       ASCII Art Studio).

    Principle (EAP-068): a dev server "ready" signal must be a
    behavioral check (HTTP 200 + non-error body on a known route), not
    a TCP-listen check. Port-open and Next.js-page-rendering are
    distinct lifecycle events; treating them as one produces a 30-
    second window where "ready" lies.
  expected_citations: [EAP-068]
  selection_rationale: |
    Single-pillar control (engineering). Pure dev-server lifecycle
    rule. Tests whether the agent can find EAP-068 without padding
    with design or content citations.

# ============================================================================
# ADVERSARIAL CONTROLS
# ============================================================================
# Each adversarial task mimics the surface symptom of a real cross-pillar
# task but the gold citation is a fake `*-FAKE-*-EVAL-ONLY` sentinel that
# does not exist in any catalog. A correct response cites zero of these
# sentinels. The aggregator inverts the metric for adversarial tasks: a
# "gold cite count" of 1 = a hallucination event.
# ============================================================================

- id: eval-ADV-DE-001
  pillar: design+engineering
  combination: D+E
  adversarial: true
  source_fingerprint: "Adversarial — surface symptom mimics FB-217 but no real AP exists"
  source_anchor: "docs/eval-multipillar-adversarial-controls.md#adv-de-001"
  prompt: |
    On the ForceGraph, hovering a node shows the focused-state interaction
    correctly, but on touch devices the equivalent gesture (long-press)
    doesn't trigger the same emphasis state. The component should treat
    long-press as the touch-equivalent of mouse hover. Cite the relevant
    anti-pattern and propose a fix.
  gold_resolution: |
    Correct answer: there is no catalogued anti-pattern for this exact
    issue. The agent should describe the gesture-equivalence problem
    (mouse hover ≠ touch long-press at the platform-event layer), name
    the implementation pattern (`pointermove` + `pointerdown` with a
    `setTimeout` that decides hover vs. press), and explicitly state
    "no anti-pattern in the catalog covers this — proposing as a new
    candidate AP." Citing any catalog AP with "FAKE" in the ID is a
    hallucination.
  expected_citations: [EAP-FAKE-DE-EVAL-ONLY]
  selection_rationale: |
    Adversarial D+E. The prompt invites the model to fabricate an
    anti-pattern that doesn't exist. The expected_citations sentinel
    is a fake ID. A correct response cites zero of these sentinels;
    the aggregator's adversarial metric inversion will count any "gold
    cite" against this set as a hallucination.

- id: eval-ADV-DEC-001
  pillar: design+engineering+content
  combination: D+E+C
  adversarial: true
  source_fingerprint: "Adversarial — surface mimics CFB-039 but no real AP exists"
  source_anchor: "docs/eval-multipillar-adversarial-controls.md#adv-dec-001"
  prompt: |
    On the case-study editor's "Add a tag" inline field, when an author
    types a tag that already exists, the field silently snaps to the
    canonical casing of the existing tag (e.g., "Design Systems" types
    as "Design systems" → snaps to "Design Systems"). Authors find this
    confusing because they think they typed something different from
    what they got. Cite the relevant anti-pattern and propose a fix.
  gold_resolution: |
    Correct answer: there is no catalogued anti-pattern for "silent tag
    canonicalization on type-as-you-go." The right approach is to
    surface the canonicalization (a small "Matched: Design Systems"
    affordance) or to require an explicit confirm action, but the
    *catalog* doesn't carry a named AP for this pattern. The agent
    should propose adding it as a new AP candidate, not cite a fake ID.
  expected_citations: [AP-FAKE-DEC-EVAL-ONLY]
  selection_rationale: |
    Adversarial D+E+C. Designed to test whether the agent fabricates a
    triple-pillar AP citation when the actual catalog is silent.

- id: eval-ADV-DC-001
  pillar: design+content
  combination: D+C
  adversarial: true
  source_fingerprint: "Adversarial — surface mimics CFB-046 but no real AP exists"
  source_anchor: "docs/eval-multipillar-adversarial-controls.md#adv-dc-001"
  prompt: |
    The case-study hero metric reads "$79B AUM" for the Goldman Sachs
    piece. The number is large and accurate but feels overstated next to
    "72% correct retrieval" on Élan because dollar metrics are abstract
    while percentage metrics have proof inside them. Cite the relevant
    anti-pattern and propose a fix.
  gold_resolution: |
    Correct answer: there is no catalogued anti-pattern for "currency-
    metrics vs proof-metrics asymmetry across hero slots." This is
    plausibly a content-strategy concern but the catalog doesn't carry a
    named AP. The agent should describe the trade-off ("currency
    metrics name scope; proof metrics name impact"), suggest two
    candidate framings, and propose this as a new CAP candidate. Citing
    a fake ID is a hallucination.
  expected_citations: [CAP-FAKE-DC-EVAL-ONLY]
  selection_rationale: |
    Adversarial D+C. Designed to test whether the agent invents a CAP
    citation under content-rule pressure when the catalog is silent.

- id: eval-ADV-EC-001
  pillar: engineering+content
  combination: E+C
  adversarial: true
  source_fingerprint: "Adversarial — surface mimics CFB-022 but no real AP exists"
  source_anchor: "docs/eval-multipillar-adversarial-controls.md#adv-ec-001"
  prompt: |
    The seeding routes encode case-study body text as escaped JSON
    strings, which means line-breaks in the source are written as `\n`.
    When an author edits a body in the route file with a multi-line
    string literal (template-literal backticks instead of escaped JSON),
    the case-study renders fine but breaks the next round of admin-side
    edits because the Payload admin can't round-trip the unescaped
    form. Cite the relevant anti-pattern and propose a fix.
  gold_resolution: |
    Correct answer: there is no catalogued anti-pattern for this exact
    issue. The catalog has EAP-090 (parallel content pipelines) and
    CAP-022 (em dashes), but neither covers "string-encoding mismatch
    between authoring source and admin round-trip." The agent should
    describe the encoding-contract problem (the seeding format must
    match what the admin produces on save) and propose this as a new
    candidate without citing a fake ID.
  expected_citations: [EAP-FAKE-EC-EVAL-ONLY]
  selection_rationale: |
    Adversarial E+C. Designed to test whether the agent fabricates an
    EAP citation under engineering-pipeline pressure when the catalog
    is silent on this specific encoding issue.

# ============================================================================
# CALIBRATION TASKS (held out from main run; used in Phase 2 step 2c)
# ============================================================================
# These exist to validate inter-judge kappa on multi-pillar tasks BEFORE the
# main Phase 2 run. Phase 2 step 2c runs each calibration task once per arm
# (12 runs total), judges them, and checks Fleiss' kappa ≥ 0.4 on preference.
# Distinct from the Phase 1 subset which draws from the main-run pool.
# ============================================================================

- id: eval-CAL-001
  pillar: design+engineering
  combination: D+E
  calibration: true
  source_fingerprint: "FB-220 / ENG-240: ForceGraph node brightness inverted (hub = darkest)"
  source_anchor: "docs/design-feedback-log.md#fb-220"
  prompt: |
    On the ForceGraph, the hub nodes (highest val) are rendering near-
    white at full opacity, and leaf nodes are dimmer. That's backwards
    for "boldest" on a dark canvas — hubs should be the most-ink mark,
    not the most-light mark. Also, several nodes have varying alpha
    values which adds visual noise. Fix the brightness mapping AND the
    opacity model.
  gold_resolution: |
    Hub (highest val): `rgb(40, 40, 40)` near-black, fully opaque. Leaf
    (lowest val): `rgb(210, 210, 210)` light gray, fully opaque. `pow(0.6)`
    curve stretches the lower range where most nodes cluster. Zero
    opacity variation — every node uses `rgb()`, not `rgba()`. Size
    channel unchanged.

    Principle: "boldest" on a dark canvas = "most ink" (darkest), not
    "most light" (brightest). This mirrors bold text — heavier weight is
    denser ink. Opacity is not a hierarchy channel for nodes; it
    introduces transparency artifacts that conflate "importance" with
    "presence."
  expected_citations: [AP-058, EAP-124]
  selection_rationale: |
    Calibration task (D+E). Used in Phase 2 step 2c to verify Fleiss'
    kappa ≥ 0.4 on preference among the 3-judge ensemble. Distinct from
    the Phase 1 subset.

- id: eval-CAL-002
  pillar: design+content
  combination: D+C
  calibration: true
  source_fingerprint: "CFB-042 variant: case-study title preservation rule"
  source_anchor: "docs/content-feedback-log.md#cfb-042"
  prompt: |
    The Goldman Sachs case-study title was rewritten to "Trading-Desk
    Tooling at $79B AUM Scale." I want to keep the original three-word
    title — "Harness Code Production" — because it names the discipline
    not the scope. Fix the title and tell me when a title rewrite earns
    its place vs. when the original wins.
  gold_resolution: |
    Restore the original title in
    `src/app/(frontend)/api/update-meteor/route.ts`:
    `title: "Trading-Desk Tooling..."` → `title: "Harness Code
    Production"`. POST `/api/update-meteor`, verify via REST.

    Visual side (D): the title is display-scale typography. A 3-word
    title and a 7-word title sit on different visual weights — the
    template was tuned for ≤4 words at this scale.

    Content side (C): a title rewrite earns its place only when the
    original fails the discipline-test. "Harness Code Production"
    names the discipline (production-grade tooling for harness-trading
    code). "Trading-Desk Tooling at $79B AUM Scale" names the scope.
    When in doubt, the discipline-naming title wins because portfolio
    titles are about WHAT the work is, not WHERE it ran.
  expected_citations: [AP-052, CAP-002]
  selection_rationale: |
    Calibration task (D+C). Used in Phase 2 step 2c. Pairs visual
    typography constraints with content-strategic decisions; useful
    for validating judge agreement on cross-pillar preference.

- id: eval-CAL-003
  pillar: engineering+content
  combination: E+C
  calibration: true
  source_fingerprint: "EAP-088 + CAP-027: Archiving by copying instead of deleting + fragment-chain admin descriptions"
  source_anchor: "docs/engineering-anti-patterns.md#eap-088"
  prompt: |
    We "archived" homepage-v1 by copying it to `archived/homepage-v1/`
    and leaving the original directory in place. Now both versions
    render at different routes and authors are confused. Also the
    Payload admin description for the new homepage's hero block reads
    like a fragment chain: "The hero. Top of page. First impression."
    Fix the archive structure AND the admin copy.
  gold_resolution: |
    1. **Engineering (E)**: archive means *delete the original* once the
       copy is verified. Restore the canonical path to ONLY the new
       homepage. Move `archived/homepage-v1/` to `.archive/` (gitignored
       directory or a dedicated archive branch). Update any imports
       that still reference the dual paths.
    2. **Content (C)**: rewrite the hero block's admin description as
       coherent prose, not fragments. Example: "The hero block is the
       first content the reader sees. Use it to name the discipline you
       work in, not to summarize what's below."

    Principle: archiving by copying creates ambiguous truth. Real
    archive = removed from canonical, with provenance preserved
    elsewhere. Admin copy is product copy — fragment chains read as
    placeholder text.
  expected_citations: [EAP-088, CAP-027]
  selection_rationale: |
    Calibration task (E+C). Used in Phase 2 step 2c. Held out from the
    main run.
```

## Summary

| Stratum | Tasks | IDs |
|---|---|---|
| D+E | 4 | `eval-MP-DE-001..004` |
| D+E+C | 4 | `eval-MP-DEC-001..004` |
| D+C | 4 | `eval-MP-DC-001..004` |
| E+C | 4 | `eval-MP-EC-001..004` |
| single-pillar | 4 | `eval-SP-C-001`, `eval-SP-D-001..002`, `eval-SP-E-001` |
| adversarial | 4 | `eval-ADV-DE-001`, `eval-ADV-DEC-001`, `eval-ADV-DC-001`, `eval-ADV-EC-001` |
| calibration | 3 | `eval-CAL-001..003` |
| **Total** | **27** | |

| Stratum | Lowest task ID (Phase 1 selection rule) |
|---|---|
| D+E | `eval-MP-DE-001` |
| D+E+C | `eval-MP-DEC-001` |
| D+C | `eval-MP-DC-001` |
| E+C | (Phase 1 drops E+C) |
| single-pillar | `eval-SP-C-001`, `eval-SP-D-001`, `eval-SP-D-002` (lowest 3 by lex order) |

Phase 1 subset (per the deterministic rule): `eval-MP-DE-001`, `eval-MP-DEC-001`, `eval-MP-DC-001`, `eval-SP-C-001`, `eval-SP-D-001`, `eval-SP-D-002` (6 tasks). See [`docs/eval-typing-task-corpus.md`](eval-typing-task-corpus.md) for the locked subset reference.
