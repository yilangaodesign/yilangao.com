---
name: case-study-authoring
description: >-
  Writes new case studies from raw materials (Phase 1a) or rebuilds existing
  ones using dossier-informed audits (Phase 1b). Produces CMS-ready output
  via a 4-phase workflow: Analyze, Plan, Write+Materialize, Review. Trigger:
  "write up" (aliases: "write this up", "draft this", "turn this into a case
  study"). Also activates when the user dumps raw notes/transcripts/project
  details, or says "redo/rebuild this case study."
---
# Skill: Case Study Authoring

## When to Activate

**Phase 1a (Author from scratch):**
- User provides raw materials: notes, transcripts, bullet points, project details,
  presentation slides, Cursor conversation logs.
- User says "write a case study for X" or "turn these notes into a case study."

**Phase 1b (Rebuild existing):**
- User says "redo this case study," "rebuild," "rethink," "apply the new framework."
- User expresses dissatisfaction with an existing case study as a whole (not a specific text fix).

**Do NOT activate for:**
- Feedback on specific text within an existing case study → use `content-iteration`.
- Editing a single caption or section → use `content-iteration`.

## Intake Protocol

The trigger is **"write up"** (aliases: "write this up", "draft this", "turn this
into a case study"). The agent detects the scenario from context and starts working
immediately — no questionnaire before Phase 1. The skill's built-in checkpoints
(end of Phase 1, end of Phase 2) handle all steering decisions.

### Scenario Detection

| What the user provides | Route | Agent action |
|------------------------|-------|-------------|
| Raw material (notes, transcripts, bullets, files) + "write up" | **Phase 1a** | Start analyzing immediately. Honor any steering hints in the message (e.g., "write up, focus on the migration risk" → bias thesis extraction toward that angle). |
| Project name or slug + "write up" (no raw material) | **Phase 1b** | Treat as rebuild. Read dossier, audit existing entry. |
| "Write up" + raw material + existing slug | **Phase 1a** | New material supersedes old. Treat as fresh authoring, but read dossier for recycling signals. |
| Just "write up" (nothing attached, no project named) | **Ask one question** | "Which project? And do you have raw material to share, or should I rebuild from the existing case study?" |

### Steering Hints

If the user's message contains directional language alongside the trigger, treat it
as a thesis bias — not a hard constraint. Examples:

- "Write up, focus on the migration risk" → Weight "migration" thesis higher in
  Phase 1 Step 4 evaluation, but still present alternatives at the checkpoint.
- "Write up, I want to emphasize the founding designer angle" → Same — bias, not
  lock. The user confirms at the Phase 1 checkpoint.
- "Write up" with no hints → Analyze unbiased, present all candidates equally.

### Checkpoints

The workflow pauses for user confirmation at three points:

1. **End of Phase 1** — Thesis selection. Agent shows signal inventory, recommended
   thesis, runners-up, portfolio gap analysis. User confirms or redirects.
2. **End of Phase 2** — Content map. Agent shows beat assignments, blurb headline
   draft, artifact plan, section structure. User confirms or adjusts.
3. **End of Phase 4** — Review. Agent shows quality check results, dossier summary.
   User accepts or requests changes.

Between checkpoints, the agent works autonomously. Phase 3 (Write + Materialize)
runs without pausing — the content map was already approved in Phase 2.

## Phase Index

| Phase | What | Checkpoints | Key references |
|-------|------|-------------|----------------|
| 1a | Analyze raw materials | Output signal inventory + thesis. **Wait for confirmation.** | `conversion-funnel.md`, `project-selection.md`, `narrative-arc.md`, `portfolio-coherence.md` |
| 1b | Audit existing case study | Output audit + thesis candidates. **Wait for confirmation.** | Project dossier, `case-study-review.md`, CMS entry, `page.tsx` maps |
| 2 | Plan (beats, artifacts, recycling) | Output content map + artifact plan. **Wait for confirmation.** | `narrative-arc.md`, `visual-economy.md`, `case-study.md` |
| 3 | Write + Materialize to CMS | Create or update Payload entry + `page.tsx` maps | `voice-style.md`, `case-study.md`, `language-patterns.md`, `seniority-signals.md`, `cms-parity` skill |
| 3b | Interview Defense Notes | Autonomous (output at Phase 4 checkpoint) | `portfolio-coherence.md` (employment context), project dossier |
| 4 | Review + dossier update | Run quality checks; create/refresh project dossier | `case-study-review.md`, `content-anti-patterns.md`, `self-audit.md` |

**Case study page title typography:** The `introBlurbHeadline` field renders in **IBM Plex Serif** via the shared template (`@include heading-case-study-intro` in `src/app/(frontend)/work/[slug]/page.module.scss`). Authors supply text only; font is not set in CMS.

---

## Phase 1a: Analyze Raw Materials

### Step 1: Classify source material

Different source types carry different signals.

**Presentation transcripts.** Look for verbal walkthrough cues: "they go from this
to this," "here is the framework I have," "let me show you." These indicate the
speaker was presenting an artifact. Also look for reframe statements ("the real
result isn't X, it's Y") and judgment calls ("I told them I'm not going to build it").

**Cursor project context and conversation logs.** Scan the full history. Look for:
recurring corrections (same fix applied multiple times = implicit design principle),
explicit rule-setting, moments where the user rejected agent output and explained why,
and patterns in what the user consistently enforced. Decisions that surface repeatedly
across many conversations are often more important than any single dramatic choice.

**Raw notes and bullet points.** Look for metrics, user quotes, constraint statements,
and specificity. Generic bullets ("improved the UX") carry no signal. Specific bullets
("review time from 80 minutes to 8") carry strong signal.

### Step 2: Build signal inventory + technical resonance scan

Output a list of the strongest signals, classified as: metrics, trade-off moments,
artifact walkthroughs, user quotes, recurring design decisions, reframe statements.
Note conflicts between signals — these are resolved in Step 4 using the thesis as
tiebreaker.

**Technical resonance scan:** Read `docs/content/technical-framing.md` §16.2
vocabulary table. For each term, check whether the material contains signals that
pass the three-gate test (§16.1). Output a "Technical Resonance" section:
- **Direct matches** (all 3 gates pass) — terms to use prominently
- **Authentic parallels** (gate 1 passes, partial gate 2) — terms to frame as
  analogies using the technique in §16.3
- **Near-misses** (tempting but fails gate 3) — terms to explicitly NOT use, with
  reasoning

Check the vocabulary freshness date — if >6 months old, flag for review.

### Step 3: Extract thesis candidates

List every thesis the material could support. A single project might yield five or six:
trust-building in automated systems, scoping strategy for 0-to-1, designing for
migration, founding designer operating model, interaction design for data-dense tools.

### Step 4: Evaluate each candidate

Four criteria (see `docs/content/narrative-arc.md` for full definitions):

1. **Strategic altitude** — thinking above the screen level? Prioritization, system
   architecture, stakeholder navigation, organizational influence?
2. **Judgment density** — supported with real trade-offs where you chose one path
   and argued against another?
3. **Audience relevance** — would a founder hiring their first designer care?
4. **Material strength** — enough concrete evidence (metrics, quotes, before/after)?

### Step 4b: Classify the narrative shape

Based on the thesis + material, classify which named narrative shape (see
`docs/content/narrative-arc.md` §12.9) best describes the emerging arc:

- Contrarian Discovery, Rescue Arc, Accumulation Arc, Constraint Theater, or
  Translation Arc

This is a classification of what emerged from the material, not a template to force
material into. The ordering matters: analyze beats bottom-up (Steps 1-3) → evaluate
thesis (Step 4) → classify shape as a top-down label (Step 4b) → recommend technique
emphasis (Step 4c) → check diversity against the portfolio (Step 5b). This prevents
confirmation bias.

### Step 4c: Recommend technique emphasis

Based on the material and thesis, identify 2-3 techniques from T1-T15 that will carry
the most weight in this case study. The material determines the emphasis - professional
case studies with concrete deliverables naturally pull toward T10, T4, T8; personal or
theoretical case studies naturally pull toward T11, T13, T15. But there are no walls
between technique groups (see `personal-voice.md` Technique Weighting note).

Check against `portfolio-coherence.md` to avoid repeating another case study's primary
technique pair. Present the technique emphasis recommendation at the Phase 1 checkpoint
alongside thesis and shape.

### Step 5: Check portfolio coverage

Read existing case study dossiers (or CMS entries if no dossiers exist) to understand
what's already demonstrated. The portfolio should present a multi-dimensional skill set,
not the same strength told three ways. If existing case studies already prove systems
thinking, pick an angle that fills a gap. Reference `docs/content/project-selection.md`.

### Step 5b: Pattern diversity check

Read the Portfolio Coherence Manifest (`docs/content/portfolio-coherence.md`). For each
of the six dimensions, check whether the new case study would create a repetition:

1. **Narrative shape:** Does the emerging shape (classified in Step 4b — see
   `narrative-arc.md` §12.9) match an existing one? If so, reframe the thesis to
   shift the arc, or document justified repetition with reasoning.
2. **Headline technique:** If 2+ existing case studies use the same primary technique,
   the new one MUST differ. This is a hard constraint.
3. **Technique emphasis:** No two case studies should share the same primary technique
   pair. Check the manifest for existing emphasis patterns before committing.
4. **Metric type, evidence method:** Variation preferred, not required. Flag for the
   user at the Phase 1 checkpoint if the new case study would duplicate an existing
   metric type or evidence method.
5. **Employment context:** Populate the interview-only field. Flag disclosure strategy
   needs for Phase 3b (Interview Defense Notes).

Output: a "diversity constraint" note for Phase 2 planning + a draft manifest entry
for the new case study. The manifest is updated at Phase 4 (dossier step) after the
case study is finalized.

### Step 6: Select and output

Pick one thesis. Output: signal inventory, thesis with reasoning, why not the
runners-up, how it scores on the 4 criteria, how it complements the portfolio.
**Wait for user confirmation before proceeding to Phase 2.**

---

## Phase 1b: Audit Existing Case Study (Rebuild)

### Step 1: Read the project dossier

Read `docs/content/projects/{slug}.md` **first**. This tells you:
- What the user praised (protect or extract principles)
- What frustrated the user (prioritize fixing)
- Style preferences that emerged for this project
- Interactive visual history (what iterations happened)
- The full evolution arc

If no dossier exists, create one by synthesizing feedback log entries (grep
`content-feedback-log.md`, `design-feedback-log.md`, and `engineering-feedback-log.md`
for the project name/slug) before proceeding.

### Step 2: Read the current implementation

1. CMS entry: description, sections (headings + body), metadata
2. `page.tsx` static maps for this slug: `HERO_METRICS`, `INLINE_LINKS`,
   `INTERACTIVE_VISUALS`, `IMAGE_PLACEHOLDERS`, `COVER_IMAGES`
3. Interactive components: what they demonstrate, what section they're mapped to

### Step 3: Audit against the framework + technical resonance scan

1. Run the quality checks from `docs/content/case-study-review.md`
2. Run the technical resonance scan (same as Phase 1a Step 2 — read
   `docs/content/technical-framing.md`, apply three-gate test, output direct
   matches / authentic parallels / near-misses)
3. Audit each interactive component against the dossier and framework:
   - Was this praised or was the user frustrated with it?
   - Does it serve the current thesis?
   - Is content scoped to the section topic? (CFB-013 pattern)
   - Is information hierarchy correct? (CFB-019 pattern)
   - Does the `INTERACTIVE_VISUALS` key match the CMS section heading? (CFB-014 bug)

### Step 4: Classify positive signals

For every positive signal in the dossier, classify as:

- **Type A (content-specific):** A particular section, phrasing, or interaction the
  user liked. Only recyclable if the new thesis demands content this item serves.
- **Type B (principle-level):** A preference for how arguments are presented, how
  visuals work, how text and images relate. Always transferable to any thesis.

### Step 5: Produce audit and thesis candidates

Output: what's working, what's failing, thesis candidates (may include the current
thesis if sound), Type A/B signals, reasoning. **Wait for user confirmation on thesis
+ rebuild scope.**

### Step 6: Run the recycling decision tree

After the thesis is locked, for each positive signal in the dossier:

- **Type B** → Always apply to the new case study.
- **Type A** → Does the new thesis demand content this item serves?
  - **Yes** → Recycle the content (adapt if needed).
  - **No** → Extract the underlying principle, discard the specific content.
    Apply the extracted principle to whatever the new thesis demands.

---

## Phase 2: Plan

With the thesis confirmed, map material to the narrative structure.

### Step 1: Evidence segmentation

Tag every signal from Phase 1 to a narrative beat (see `docs/content/narrative-arc.md`):
Hook, Stakes, Reframe, Architecture, Decisions, Evidence, Residue. Strong material
that doesn't serve the thesis gets discarded.

### Step 2: Artifact mapping (3-tier classification)

**Hero image (mandatory):** Every case study MUST have a hero image placeholder as
the first content block. The hero sits above the blurb headline and shows the final
design outcome at a glance. During planning, define a descriptive label for the hero
(e.g., "Hero — Redesigned usage dashboard with consumption-based billing"). During
materialization, `createCaseStudyBlocks` automatically emits a hero block — pass
`heroPlaceholderLabel` in options when no image is uploaded yet. The label describes
what image belongs there so the user can match it to their assets.

For each implied visual, classify into one of three tiers:

**Tier 1 — Static:** Screenshot, diagram, before/after. For each Tier 1 artifact,
output: (a) which section it belongs to, (b) a descriptive label for each image slot -
specific enough that the user can match it to their assets ("Before: Old navigation
with License buried 5 layers deep", not "Screenshot"), (c) suggested layout using
CMS-native values: `full-width` for hero shots, `grid-2-equal` for before/after pairs,
`grid-3-equal` or `grid-3-bento` for component showcases, `stacked` for sequential
flows, (d) image count per section following `visual-economy.md` section 4.2: one
paragraph of text buys 3-6 images. Target: 15-25 total image slots across the case
study. User uploads the images later.

**Tier 2 — Interactive (existing):** Component already in `src/components/elan-visuals/`
or similar. In rebuild mode, audit against thesis (keep / modify / replace). In authoring
mode, recommend mapping if relevant components exist.

**Tier 3 — Interactive (new):** Component that needs to be built. Write an interactive
component spec with 6 fields:
1. Thesis connection (which beat, what argument)
2. Interaction behavior (hover, click, tab, scroll)
3. Content scoping (data/examples; must match section topic per CFB-013)
4. Information hierarchy (structure before rationale per CFB-019)
5. Section heading (exact string for `INTERACTIVE_VISUALS` key)
6. Component name (following existing conventions)

Flag Tier 3 artifacts for engineering dispatch.

### Step 3: Beat-to-anatomy compression

Map beats into the page anatomy (see compression table in `docs/content/narrative-arc.md`).
Beats are a thinking framework — they compress into the Anatomy's compact format:
scope statement, 3-4 feature sections, hero metric, captions. They are NOT 7 visible
page sections.

### Step 4: Content map and checklist

Output a plan covering:
1. Thesis (restated)
1b. Technique emphasis: T_+T_+T_. Planned placement: which zone/section each
   emphasized technique appears in. Cross-ref `personal-voice.md` for zone rules.
2. Beat assignments (what fills each beat, where it lives in the anatomy)
3. **Intro blurb plan:**
   a. **Blurb headline draft** — use Technique 10 (Protagonist Framing) or Technique 8
      (Verdict-as-Headline). Run the luxury compatibility test from `personal-voice.md`.
      Run the Standalone Test from `case-study.md` §3.4. Reference `case-study.md` §3.7.
   b. Body sketch (which stakes, which outcome flash, which structural tease).
3b. **Section title drafts** — For each feature section, draft a title using the
   selection heuristic:
   1. Does the section's argument center on a single vivid physical object or
      metaphor? → Technique 6 (Object Substitution)
   2. Does the section's argument invert a known framework or conventional wisdom?
      → Technique 7 (Framework Inversion)
   3. Does the section arrive at a strong conclusion statable as a design rule?
      → Technique 8 (Verdict-as-Headline)
   4. Can a key word in the argument mean two things productively? → Apply
      Deliberate Ambiguity modifier
   5. Can the title compress to 1-3 fragment-sentences with periods? → Apply
      Staccato Authority modifier
   6. If none of the above fit naturally, the material may need reframing -
      revisit the section's core argument before forcing a technique.

   **Self-correction (Preview Title gate):** After drafting each title, ask: "Is
   this a Preview Title (describes section content) or an Argument Title (object /
   inversion / verdict)?" Apply the Standalone Test from `case-study.md` §3.4:
   remove the body text - does the title work as a standalone interesting statement?
   If a title reads like a preview, rewrite before presenting to the user. A
   descriptive summary title is the default AI output and is NOT acceptable.
4. **Technical vocabulary placement** — which terms from the resonance scan go where
   in the anatomy, following the placement hierarchy in `technical-framing.md` §16.4.
   Direct matches get levels 1-2 (blurb/scope statement); authentic parallels get
   levels 3-4 (section heading/body). See `technical-framing.md` §16.4.
5. Artifact plan (Tier 1 placeholders, Tier 2 mappings, Tier 3 specs)
5a. **Hero image plan** — Descriptive label for the hero placeholder (mandatory).
   The hero is always the first block in content. It shows the final design outcome
   or product screenshot that anchors the entire case study.
5b. **Image skeleton plan** — For each feature section, list the image placeholders
   to create. Each placeholder has a descriptive label. Each section gets one
   imageGroup with a layout choice and N placeholder labels. The plan must satisfy
   the 80-85% visual / 15-20% text ratio from `visual-economy.md`. Minimum 2 image
   slots per section. Present at the Phase 2 checkpoint alongside the content map.
6. Sidebar metadata (role, collaborators, duration, tools, links)
7. Recycled content from dossier (if rebuild mode)
8. Style constraints to monitor
9. Engineering dispatch list (if Tier 3 artifacts exist)

**Wait for user confirmation before proceeding to Phase 3.**

---

## Phase 3: Write + Materialize

### Step 1: Write

Execute the plan. Apply beats to anatomy following these references:
- `docs/content/voice-style.md` — voice posture, sentence rules, banned words, punctuation
- `docs/content/case-study.md` — page anatomy, scope statement, intro blurb, feature section structure, luxury positioning
- `docs/content/language-patterns.md` — scope claims, feature labels, craft captions
- `docs/content/seniority-signals.md` — ownership language, senior framing
- `docs/content/personal-voice.md` — named voice techniques (universal) and calibration samples
- Project dossier `## Voice Samples` section (if it exists) — project-specific calibration

**Writing order:**
0. **Voice calibration** (before writing anything):
   a. Read `personal-voice.md` voice samples (§17.1). These are the universal
      register target. Pay attention to Samples 3-5 (headline-specific targets).
   b. Read the project dossier's Voice Samples section (if it exists).
   c. Read ALL named techniques (1-15 + modifiers + structural patterns). For the
      techniques flagged in the technique emphasis plan (Phase 1 Step 4c / Phase 2
      Step 4 item 1b), review their zone rules and guardrails. If T12 (Warranted
      Vulnerability) is in the emphasis plan, verify that the planned concession
      does not contradict the thesis. Plan where to use each:
      - Section titles: APPLY one of Technique 6 (Object Substitution), Technique 7
        (Framework Inversion), or Technique 8 (Verdict-as-Headline). A descriptive
        summary title is the default AI output and is NOT acceptable. If the first
        draft reads like a newspaper headline about the section content, it is a
        Preview Title. Rewrite using the selection heuristic from Phase 2 Step 4.
      - Blurb headline: APPLY Technique 10 (Protagonist Framing) or Technique 8
        (Verdict-as-Headline). Run the luxury compatibility test.
      - Blurb body: apply In-Group Signal, Survival Frame, Wry Redirect. If T11
        (Identification) or T12 (Warranted Vulnerability) is in the emphasis plan,
        this is their primary zone.
      - Section bodies: apply Escalation Beat (universally applicable). If T13
        (Anti-Sell) or T14 (Emotional Deflation) is in the emphasis plan, section
        bodies and scope statement are their zones. If T15 (Closed-Loop Closer)
        is planned, it belongs in the final section closer.
      - Modifiers (Deliberate Ambiguity, Staccato Authority): layer on top of
        primary techniques where the material supports dual meaning or fragment rhythm.
      - Structural patterns (Concessive Turn): if the emphasis plan includes T12+T13+T14,
        consider sequencing them as a Concessive Turn within a section body.
   d. The first draft should use these techniques. It will still be warmer-clinical,
      not the user's full personality - that's expected. The user may inject
      personality via raw draft text, triggering the refinement protocol
      (see `personal-voice.md` §17.3 and `content-iteration` skill Step 4b).
0.5. **Title verification** — Review Phase 2 section title drafts. Confirm each
   passes the Standalone Test (`case-study.md` §3.4). If writing reveals a stronger
   object/inversion/verdict, update the title. Titles are finalized before writing
   body text because they frame the argument each section delivers.
1. **Intro blurb** (headline + body) - write first, referencing `case-study.md` §3.7.
   The blurb is the trailer: tension headline, stakes in the body, outcome flash in
   the closer, never reveal the how. Apply luxury constraint from §3.8.
2. **Scope statement** - must not repeat the blurb. The blurb is emotional/curiosity-
   driven (trailer); the scope is factual/claim-driven (credentials). First sentence
   bridges from the blurb's energy (see §3.3).
3. **Feature sections** - restrained, declarative, thesis-serving.

**Key constraints:**
- Intro blurb: headline 6-10 words, body ≤80 words, 4-6 sentences
- Under 300 words total for feature section body text
- 1-3 sentences per feature section body
- Scope statement: 2-4 sentences
- 80-85% visual, 15-20% text
- Every sentence serves the thesis
- Luxury positioning (§3.8): state outcomes as facts, never editorialize

### Step 2: Materialize to CMS

**For new case studies:** Create a Payload `Projects` entry.
**For rebuilds:** Update the existing entry.

Map content to the data model:
- `title` → application or product name (e.g., "Lacework", "Goldman Sachs Meteor"). This is the product discussed in the raw materials. Shown in sidebar and prev/next navigation.
- `introBlurbHeadline` → case study title / creative tension headline (6-10 words). Same writing strategy as section titles - uses Protagonist Framing, Verdict-as-Headline, or another named technique. This field drives the homepage card title, falling back to `title` if no headline exists yet.
- `introBlurbBody` → blurb body as Lexical richText
- `description` → scope statement as Lexical richText
- `content` → ordered array of typed blocks:
  - `{ blockType: 'hero', image: mediaId, caption? }` — hero image at document start
  - `{ blockType: 'heading', text: '...', level: 'h2' | 'h3' }` — section heading
  - `{ blockType: 'richText', body: LexicalJSON }` — body text (use `markdownToLexical` from `src/lib/content-helpers.ts` to convert Markdown to Lexical)
  - `{ blockType: 'imageGroup', layout, images: [{ image: mediaId, caption? }], caption? }` — image section
  - `{ blockType: 'divider' }` — reserved for explicit structural breaks; do NOT use between feature sections (see CAP-024). The template renders the intro-to-article divider automatically.
- Metadata fields → `role`, `collaborators`, `duration`, `tools`, `externalLinks`
- `page.tsx` → update `HERO_METRICS`, `INLINE_LINKS`, `INTERACTIVE_VISUALS` (Tier 2),
  `IMAGE_PLACEHOLDERS`, `COVER_IMAGES`

**Agent helper:** Use `createCaseStudyBlocks(sections, options?)` from
`src/lib/content-helpers.ts` to build the full `content` array from a simple
`{ heading, bodyMarkdown, images?, imagePlaceholders?, layout? }[]` input. Use
`readBlocksAsMarkdown(blocks)` to read existing content as Markdown for review/iteration.

**Hero block enforcement:** `createCaseStudyBlocks` ALWAYS emits a hero block as the
first content block. If `options.heroImageId` is provided, the hero uses the real image.
Otherwise it creates a placeholder hero with the label from `options.heroPlaceholderLabel`
(defaults to "Hero — Case study cover image" if omitted). Every case study route MUST
pass `heroPlaceholderLabel` in options when no hero image is uploaded. This is not optional.

**Image skeletons:** For sections without uploaded images (most new case studies), use
`imagePlaceholders` to create labeled skeleton blocks. Each section gets ONE imageGroup
block containing all placeholder labels. The page renders labeled skeleton boxes that
the user can upload into.

```typescript
createCaseStudyBlocks([
  {
    heading: 'Five Matryoshkas Deep',
    bodyMarkdown: 'Users navigated through navbar...',
    layout: 'grid-2-equal',
    imagePlaceholders: [
      'Before: Navigation with License buried 5 layers deep',
      'After: Collapsed structure at 3 layers with subscription/usage split',
      'Side-by-side: Old 5-layer path vs. new 3-layer path',
    ],
  },
  {
    heading: 'Build Instead of Buy',
    bodyMarkdown: 'Tableau was the cheaper, easier choice...',
    layout: 'full-width',
    imagePlaceholders: [
      'Comparison: Tableau dashboard vs. in-product usage page',
      'Architecture: Data flow from product to usage insights',
    ],
  },
])
```

Layout values must use CMS-native strings: `auto`, `full-width`, `grid-2-equal`,
`grid-2-left-heavy`, `grid-2-right-heavy`, `grid-3-bento`, `grid-3-equal`, `stacked`.
These are the same values as the `layout` select in `Projects.ts`.

Reference `cms-parity` skill for the 4-layer contract. Read `Projects.ts` and
`page.tsx` for the current data model before writing.

---

## Phase 3b: Interview Defense Notes

Produce a companion document alongside the portfolio content. This phase runs
autonomously after Phase 3 and before Phase 4. Output is presented at the Phase 4
checkpoint.

**Storage: `docs/content/projects/{slug}-interview.md` — NOT the dossier.** Two reasons:

1. **Voice contamination prevention:** The dossier is read during content iteration.
   If it contains metric limitations, the agent may temper portfolio confidence —
   contradicting the luxury positioning principle from `case-study.md` §3.8.
2. **Leakage prevention:** Interview prep contains information banned from portfolio
   text (employment type per CAP-026). Placing banned info in a frequently-read file
   puts the landmine on the path.

The dossier cross-references the interview file without containing the content. The
`content-iteration` skill NEVER reads interview files.

**Contents:**

1. **Metric defense:** Full derivation, method, sample size, limitations for every
   hero metric. Written in first-person as if answering an interviewer.
2. **Role scope precision:** Exact boundaries of decision authority. What was yours,
   what was shared, what was someone else's.
3. **Strategic omission inventory:** Everything the portfolio deliberately omits
   (employment type, team size caveats, methodology details) + prepared responses
   for each.
4. **Anticipated probes:** 3-5 skeptical interviewer questions + prepared responses.
   Focus on the most likely challenges a hiring manager would raise based on the
   case study content.

---

## Phase 4: Review + Dossier

### Step 1: Run quality checks

Run all checks from `docs/content/case-study-review.md` against the output.
Cross-check against `docs/content-anti-patterns.md`. Fix what fails.

**Hero presence check (mandatory):** Verify the first block in `content` is a hero
block. If missing, the case study is incomplete. Every case study must start with a
hero — either a real image or a labeled placeholder skeleton.

### Step 2: Create or refresh dossier

**New case study:** Create `docs/content/projects/{slug}.md` with:
- Current State (thesis, status: active, date)
- Empty Positive Signals (populated as user gives feedback)
- Empty Frustration Log
- Style Preferences from Phase 3 decisions
- Interactive Visual History (Tier 2 mappings + Tier 3 specs)
- Evolution Timeline (initial entry: "Created via case-study-authoring skill")
- Cross-References (any feedback log entries generated)

**Rebuild:** Refresh the dossier:
- Update Current State with new thesis
- Archive old thesis in Evolution Timeline
- Note what was recycled (Type A) and what principles were extracted (Type B)
- Update Interactive Visual History
- Append rebuild event to Evolution Timeline

---

## Operating Under Orchestrator Dispatch

When `[ORCHESTRATED]` appears in your context:
- BEFORE implementation: write a 2-line stub to the content feedback log using the
  pre-assigned ID (per EAP-027).
- Follow all phases as normal (skip cross-category check).
- Replace Phase 4 Step 2 (dossier) and final documentation with:
  1. `## Draft Documentation` section using pre-assigned ID
  2. `## Files Modified` section
  3. `## Server Operations Needed` section if applicable
- Do NOT write to docs/ files other than the initial stub and the project dossier.

## Cross-Category Dispatch

If Phase 2 identifies Tier 3 interactive artifacts (new components to build):
- The scope meets orchestrator criteria (2 tasks, one creation from scratch)
- Activate orchestrator at `.cursor/skills/orchestrator/SKILL.md`
- Content task: this skill (authoring)
- Engineering task: build component from the spec

## File Map

| File | Purpose | Read When | Write When |
|------|---------|-----------|------------|
| `docs/content/narrative-arc.md` | Beat definitions, compression, artifacts, recycling | Phase 1 + 2 | Never (spoke) |
| `docs/content/voice-style.md` | Voice/style rules (two tiers) | Phase 3 | Never (spoke) |
| `docs/content/case-study.md` | Page anatomy, scope statement, intro blurb (§3.7), luxury positioning (§3.8) | Phase 2 + 3 | Never (spoke) |
| `docs/content/technical-framing.md` | Technical vocabulary, three-gate test, authentic parallel technique | Phase 1 (resonance scan) + Phase 2 (placement) | Never (spoke) |
| `docs/content/case-study-review.md` | Quality checks | Phase 4 | Never (spoke) |
| `docs/content/personal-voice.md` | Named voice techniques, calibration samples, refinement protocol | Phase 3 (voice calibration) | Never (spoke) |
| `docs/content/visual-economy.md` | Image types, ratio | Phase 2 | Never (spoke) |
| `docs/content/language-patterns.md` | Language patterns | Phase 3 | Never (spoke) |
| `docs/content/seniority-signals.md` | Senior framing | Phase 3 | Never (spoke) |
| `docs/content/conversion-funnel.md` | HM mental model | Phase 1a | Never (spoke) |
| `docs/content/project-selection.md` | Portfolio balance | Phase 1a | Never (spoke) |
| `docs/content/self-audit.md` | Retention layer audit | Phase 4 | Never (spoke) |
| `docs/content-anti-patterns.md` | CAP catalog | Phase 4 | Never |
| `docs/content/portfolio-coherence.md` | Portfolio diversity manifest | Phase 1a Step 5b (diversity gate) | Phase 4 (update manifest entry) |
| `docs/content/projects/{slug}.md` | Project dossier | Phase 1b (first) | Phase 4 (create/refresh) |
| `docs/content/projects/{slug}-interview.md` | Interview defense notes | Never during content iteration | Phase 3b (create) |
| `docs/content-feedback-log.md` | Feedback history | Phase 1b | Stub only (orchestrated) |
| `src/collections/Projects.ts` | CMS schema | Phase 3 | Never |
| `src/app/(frontend)/work/[slug]/page.tsx` | Static maps, data fetch | Phase 3 | Phase 3 (maps) |
| `src/app/(frontend)/work/[slug]/ProjectClient.tsx` | Render logic | Phase 3 (reference) | Never |
