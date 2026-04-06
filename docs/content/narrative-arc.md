# Section 12 — Narrative Arc

> A **thinking framework** for case study creation, not a page template.
> The 7 beats are analytical units for planning — they compress into the page
> anatomy defined in `case-study.md`.

## 12.1 The Seven Beats

Structure every case study around seven narrative beats. Each beat serves a
distinct function. Not all beats require equal weight — material quality and
thesis demands determine which beats expand and which compress.

### Beat 1: Hook

One headline metric or outcome, placed before the story begins. A promise to
the reader that the story has a payoff.

- **Word budget:** 10-20 words (1 sentence)
- **Source signals:** metrics, quantitative outcomes, user impact numbers
- **Primary:** a specific metric. **Fallback:** a qualitative outcome statement.
  **If neither exists:** ask the user.
- **Anatomy slot:** hero metric (visual, beside title) + intro blurb headline
  (tension angle - different from the metric; see `case-study.md` §3.7)

**Headline generation:** The intro blurb headline and feature section titles are
the primary carriers of the Hook beat's energy beyond the hero metric. For headline
generation techniques, see `personal-voice.md` Techniques 6-10. For the three
section title archetypes (Object, Inversion, Verdict) and the Preview Title
anti-pattern, see `case-study.md` §3.4.

### Beat 2: Stakes

What's broken, what's at risk. No scene-setting. Just tension.

- **Word budget:** 40-80 words (2-4 sentences)
- **Source signals:** friction descriptions, broken workflows, pain points,
  constraint statements
- **Anatomy slot:** intro blurb body (first 2-3 sentences, empathy/constraints)
  + woven into scope statement or first feature section opening. The blurb gets
  the emotional stakes; the scope statement gets the factual claim.

### Beat 3: Reframe

Your angle on the problem. Not the obvious reading — the sharper one. This is
where the thesis becomes visible to the reader.

- **Word budget:** 20-40 words (1-2 sentences)
- **Source signals:** reframe statements from transcripts, explicit thesis
  re-articulations, "the real X is Y" patterns
- **Anatomy slot:** scope statement or the thesis-setting sentence of a feature
  section

### Beat 4: Architecture

What you built, conceptually. A diagram carries this. Text is connective tissue.

- **Word budget:** 80-120 words (3-5 sentences)
- **Source signals:** system descriptions, framework walkthroughs, layer
  explanations, technical architecture notes
- **Anatomy slot:** a feature section (diagram or interactive component carries
  it, text frames the visual)

### Beat 5: Decisions

The trade-offs that show your judgment. Lead with the sharpest one. 2-3 total,
each as its own short paragraph cluster.

- **Word budget:** 120-200 words (50-80 per trade-off)
- **Source signals:** trade-off moments, constraint-driven choices, arguments
  against rejected paths, business consequence statements
- **Anatomy slot:** core argument of 1-2 feature sections
  (constraint/choice/cost)
- **No fallback.** If the source material cannot support at least two trade-offs
  with constraint/choice/cost, stop and ask the user for more material. This
  beat is the core of senior signal. It cannot be thin.

### Beat 6: Evidence

Detailed metrics, a before/after, or one user quote. If the hook used a metric,
expand or add a different dimension here.

- **Word budget:** 40-80 words (2-4 sentences)
- **Source signals:** user quotes, outcome data, before/after comparisons,
  supporting metrics
- **Primary:** metric + user quote. **Fallback:** metric alone, or before/after,
  or user quote alone. **If none exist:** ask the user.
- **Anatomy slot:** metrics in scope statement + expanded in a feature section or
  caption
- One user quote max per case study. Placed here, not scattered.

### Beat 7: Residue

What changed in how you think. Not a manifesto. An observation.

- **Word budget:** 30-50 words (2-3 sentences)
- **Source signals:** reflective observations, forward-looking statements about
  future work, principles extracted from the project
- **Primary:** a reflective observation. **Fallback:** a forward-looking
  statement about how this work shapes the next.
- **Anatomy slot:** final sentence of the last feature section, or omitted if
  the visuals close the story

## 12.2 Beat-to-Anatomy Compression

The 7 beats are a thinking framework — they do NOT map to 7 visible page
sections. Beats compress into the anatomy's compact format.

| Beat | Where it lives in the anatomy |
|------|-------------------------------|
| Hook | Hero metric (visual, beside title) + **intro blurb headline** (tension angle) |
| Stakes | **Intro blurb body** (first 2-3 sentences)* + woven into scope statement |
| Reframe | Scope statement or the thesis-setting sentence of a feature section |
| Architecture | A feature section (diagram or interactive component carries it) |
| Decisions | Core argument of 1-2 feature sections (constraint/choice/cost) |
| Evidence | **Intro blurb body** (outcome flash in closer)* + expanded in feature section |
| Residue | Final sentence of the last feature section, or omitted |

*The intro blurb body spans two beats: the first 2-3 sentences carry Stakes
(empathy, constraints); the closer sentence carries Evidence (outcome flash).
A single paragraph serving multiple narrative functions is intentional.

**Planning budget vs output target:** The prompt's 500-800 word target is the
Arc's **planning budget** — how much narrative material the analysis phase
produces. The final output respects the anatomy's visual-first constraints:
under 300 words total for feature section body text, 1-3 sentences per section.
The Arc ensures the RIGHT 300 words are chosen; the anatomy ensures only 300
words appear.

## 12.3 Trade-Off Writing Methodology

Every trade-off needs three parts: the constraint, the choice, and the cost.

"We decided to do X" is not a trade-off. "We chose X, which meant giving up Y"
is.

**Constraint:** Real and specific — engineering capacity, a deadline, a
dependency, a coverage gap. Not "we had to make tough choices."

**Choice:** Name the specific thing done and the specific thing cut or deferred.
Not "we prioritized impact" but which feature got cut and which one replaced it.

**Cost:** Name what was given up and why it was acceptable. Then argue against
the rejected path — not just "we gave up Y" but why Y was the wrong choice.
The rejected option should have a specific downside: outright failure,
unacceptable cost, strategic misalignment, or a dependency that would have
blocked adoption.

Write each trade-off as a short narrative paragraph. Never in bullet points.
Bullets make trade-offs feel like a checklist. Prose makes them feel like
judgment calls. Connect every decision to a business consequence — adoption,
speed, scale, trust, revenue.

## 12.4 Evidence Segmentation

During Phase 2 planning, tag every signal from Phase 1 to a beat:

- Which source chunks are evidence for the hook (metrics)
- Which source chunks are evidence for the stakes (friction, broken workflows)
- Which source chunks support the reframe (the sharper angle)
- Which source chunks describe the architecture (system, structure, layers)
- Which source chunks contain trade-off moments (constraint/choice/cost)
- Which source chunks contain user quotes or outcome data (evidence beat)
- Which source chunks contain reflective observations (residue)

Strong material that doesn't serve the thesis gets discarded. Anything that
doesn't tag to a beat gets set aside.

## 12.5 Three-Tier Artifact Classification

Every implied visual gets classified into one of three tiers:

### Tier 1 — Static

Screenshots, diagrams, before/after comparisons, system diagrams, annotated
walkthroughs.

- Content skill outputs a descriptive label per image slot and a section-level layout choice
- At materialization (Phase 3), labels become `imagePlaceholders` entries in the `createCaseStudyBlocks` call - one imageGroup per section containing all labels
- The frontend renders labeled skeleton boxes ("Before: Old nav...", "Image 1 of 3") until the user uploads actual images
- When the user uploads, `placeholderLabels` is cleared automatically and real images render in the chosen layout
- CMS mapping: `imageGroup` block with empty `images[]`, `placeholderLabels: string[]`, and chosen `layout`

### Tier 2 — Interactive (Existing)

React components already built (e.g., in `src/components/elan-visuals/`) and
mapped via `INTERACTIVE_VISUALS` in `page.tsx`.

- In rebuild mode: audit each against thesis — keep / modify / replace
- In authoring mode: recommend mapping if relevant existing components are found
- CMS mapping: `INTERACTIVE_VISUALS[slug][sectionHeading]` matched by exact
  heading string

### Tier 3 — Interactive (New)

Components that need to be **built** to demonstrate a concept.

- Content skill writes a spec (see §12.6); engineering builds the component
- Cross-category dispatch: triggers orchestrator if Tier 3 artifacts are
  identified

## 12.6 Interactive Component Spec Format

When Phase 2 identifies a Tier 3 artifact, the content skill produces a spec
with six fields:

1. **Thesis connection:** Which beat does this serve? What argument does it make?
2. **Interaction behavior:** What does the user do? What responds? (hover, click,
   tab, scroll)
3. **Content scoping:** What data/examples appear? Must match section topic.
   Do not create general-purpose showcases. (Per CFB-013.)
4. **Information hierarchy:** What appears first? Structure before rationale.
   (Per CFB-019.)
5. **Section heading:** The exact string for the `INTERACTIVE_VISUALS` map key.
   Must match the CMS section heading precisely. (Per CFB-014.)
6. **Component name:** Suggested name following existing conventions in
   `src/components/elan-visuals/`.

## 12.7 Dossier Recycling Decision Tree

During rebuilds, after the thesis is locked, evaluate every positive signal in
the project dossier:

```
For each positive signal:
    |
    Is this Type A (content-specific) or Type B (principle-level)?
    |
    +--> Type B (principle): Always apply to the new case study.
    |    Example: "user values coded interactive demos that make abstract
    |    concepts tangible" → apply regardless of thesis topic.
    |
    +--> Type A (content):
         |
         Does the new thesis demand content that this praised item serves?
         |
         +--> Yes: Recycle the content (adapt if needed).
         |    Example: "I liked the ETRO section" + thesis covers trust → keep.
         |
         +--> No: Extract the underlying principle, discard the content.
              Example: "I liked the micro interaction section" + thesis is
              prompt engineering → extract: "user values live demos over
              static screenshots for demonstrating technical concepts" →
              apply that principle to whatever the new thesis demands.
```

Every positive signal yields either recycled content or an extracted principle.
Nothing is wasted.

## 12.8 Fallback Rules

When material is thin:

- **No metrics:** Lead the hook with a qualitative outcome statement. Ask the
  user if any numbers exist before proceeding.
- **No quotes:** Replace the evidence beat's quote slot with a before/after or
  expanded metric. Note the gap for the user.
- **Only one trade-off:** Stop and ask the user for more material. The decisions
  beat is non-negotiable — it carries the senior signal.
- **No reframe:** The thesis IS the reframe. Make it more explicit. If the
  thesis can't reframe the problem, the thesis may be wrong.

## 12.9 Named Narrative Shapes

The seven beats are universal — every case study uses them. But the *story pattern* the beats serve differs. A **narrative shape** names the overall arc: what kind of story is being told.

Shape classification is descriptive, not prescriptive. Classify after analyzing material and evaluating thesis candidates (Phase 1 Step 4b in the authoring skill). The shape names what emerged from the material — it is not a template to force material into.

### Five Shapes

**Contrarian Discovery**
"The obvious approach was X. I saw that Y was the real problem. I bet on Y and it paid off."
- *Strength:* Judgment, strategic altitude. Shows the designer sees what others miss.
- *Risk:* Performing insight if overused. Multiple Contrarian Discoveries in a portfolio reads as contrarianism for its own sake.

**Rescue Arc**
"Something was failing or abandoned. I identified why, reframed the problem, and made it work."
- *Strength:* Impact on existing products. Demonstrates working with messy reality.
- *Risk:* Self-aggrandizement if ungrounded. The rescue must be backed by specific artifacts and decisions, not just a claim of saving the day.

**Accumulation Arc**
"A system that started small and compounded. Each iteration improved the next."
- *Strength:* Systems thinking, long-term ownership. Shows the designer builds foundations.
- *Risk:* Lacking a dramatic moment. Needs a clear inflection point to avoid reading as a feature log.

**Constraint Theater**
"Extreme constraints forced creative solutions. The constraints themselves shaped the design."
- *Strength:* Resourcefulness, pragmatism. Resonates with hiring managers who manage constrained teams.
- *Risk:* Excuse-making if overemphasized. Constraints should enable creativity, not explain away limitations.

**Translation Arc**
"Two worlds that couldn't communicate. I built the bridge."
- *Strength:* Cross-functional fluency, empathy range. Works for designer-engineer or designer-stakeholder stories.
- *Risk:* Abstract without concrete artifacts. Must show what the bridge actually looked like.

### Workflow Timing

Shape classification occurs at **Phase 1 Step 4b** in the case-study-authoring skill (after thesis evaluation, before portfolio coverage check):

1. Steps 1-3: Analyze material, build signal inventory, extract thesis candidates
2. Step 4: Evaluate thesis candidates on four criteria
3. **Step 4b: Classify the narrative shape** — based on thesis + material, which shape best describes the arc?
4. Step 5: Check portfolio coverage + diversity gate (reads manifest, checks if shape creates repetition)

This ordering prevents confirmation bias: analyze beats (bottom-up) → classify shape (top-down label) → check diversity (cross-portfolio).

### Diversity Tracking

The Portfolio Coherence Manifest (`docs/content/portfolio-coherence.md`) tracks which shape each case study uses. The diversity gate in the authoring skill flags repetition and suggests reframing before committing.

## Cross-references

- Page anatomy and visual density: `docs/content/case-study.md` §3
- Arc-drives-Anatomy relationship: `docs/content/case-study.md` §3.6
- Language patterns for each beat: `docs/content/language-patterns.md`
- Voice and style rules: `docs/content/voice-style.md`
- Per-project dossiers and recycling: `docs/content/projects/{slug}.md`
- Portfolio diversity tracking: `docs/content/portfolio-coherence.md`
