# Section 14 — Case Study Review Checklist

> Standalone quality checklist. Usable by:
> - `case-study-authoring` skill (Phase 4)
> - `content-iteration` skill (when editing case study text)
> - Rebuild audits (Phase 1b, pre-rebuild quality assessment)
> - Future evaluator agent (as scoring rubric)

## The Checks

Run every check against the written output. Fix what fails.

### Check 1: Deletion test

Delete the first sentence of every section. If it still works, the first
sentence was throat-clearing. Cut it.

This check catches the most common structural problem: sections that open with
context instead of the point. If a section loses nothing by losing its first
sentence, the first sentence was filler.

### Check 2: "So what" test

After every claim, ask: would a hiring manager say "so what?" If yes, add
sharper framing or concrete evidence.

Claims without evidence are assertions. Evidence without framing is a fact dump.
Every claim needs both — a concrete detail and a reason the reader should care.

### Check 3: AI-sniff test

Read aloud. Watch for:
- Passive voice
- Hedging phrases ("might," "could potentially," "we felt that")
- Symmetrical structures (three parallel clauses of equal length)
- Banned words (see `docs/content/voice-style.md` §13.1)
- Any sentence that sounds balanced and says nothing
- Over-compressed staccato that sounds like a telegram — equally artificial

Also see CAP-017 (AI-Generated Voice Tells) in `docs/content-anti-patterns.md`.

### Check 4: Specificity test

Count concrete nouns per paragraph. If abstract nouns (system, process,
approach, framework) outnumber concrete ones (prompt, page, spacing, flag, row),
rewrite.

### Check 5: Compression test

Could this sentence be shorter and still land? Almost always yes. But if
shortening it kills the voice, leave it.

### Check 6: Scan test

Scroll in two seconds. Do the section openings, bold metrics, and captions
alone tell a coherent story? If the reader never reads a full paragraph, do they
still walk away knowing what you did, what you decided, and what changed?

The hiring manager reader will scan, not read. The case study must work at scan
depth.

### Check 7: Memorability test

Does this case study contain one sentence a hiring manager would repeat to their
co-founder? If nothing sticks, the case study is informative but not memorable.

One sharp line - a reframe, a contrarian position, an observation - should
survive in the reader's head after the tab closes.

**Section title evaluation:** Section titles are the highest-leverage memorability
targets. For each title, run the Standalone Test: can it function as a standalone
interesting statement? Test whether it is an Argument title (Object, Inversion, or
Verdict archetype from `case-study.md` §3.4) or a Preview title (describes section
content). A case study with 3 preview-style section titles has a memorability problem
regardless of body text quality. The blurb headline is also a primary memorability
candidate - apply the same test. See `personal-voice.md` Techniques 6-10 for
generation techniques.

### Check 8: Coherence test

For every section, ask: does this serve the thesis? If a paragraph could be
moved to a completely different case study about a different project and still
make sense, it's either too generic or off-topic. Every section should feel like
it could only belong to this case study.

### Check 9: Checklist verification

Compare the final output against the task checklist generated in Phase 2:
- Thesis maintained throughout
- Content matches the plan
- Word count within target
- All style constraints met
- All content constraints met (one quote max, contrarian lines placed correctly,
  metrics frontloaded)
- Every artifact from the artifact map has a placeholder with type and caption
- Sidebar metadata fields populated

### Check 10: Interactive visual coherence

For each interactive component on the page:

1. **Thesis service:** Does this interaction serve the section's thesis? If
   removing it wouldn't weaken the argument, it doesn't belong.
2. **Content scoping:** Is the content within the interactive component scoped
   to the section topic? General-purpose showcases that display unrelated tabs
   or data violate the section boundary. (Per CFB-013.)
3. **Information hierarchy:** Does the component present information in the
   right order? Structure/architecture before rationale/explanation. (Per
   CFB-019.)
4. **Key matching:** Does the `INTERACTIVE_VISUALS` map key exactly match the
   CMS section heading? A mismatch means the component won't render. (Per
   CFB-014 / ENG-054.)

### Check 11: Intro blurb quality

If the case study has an intro blurb (`introBlurbHeadline` + `introBlurbBody`):

1. **Headline length:** Under 10 words? Creates tension or friction, not an outcome
   statement?
2. **Body length:** Under 80 words? 4-6 sentences?
3. **Hides the how:** Can the reader learn the solution from the blurb alone? If yes,
   it fails — the blurb is a trailer, not a summary.
4. **Cohesion:** Do headline and body tell one story? The body should deepen the
   headline's tension, not pivot to a different topic.
5. **Distinctness:** Is the blurb content different from the scope statement? No
   repeated sentences or rephrased duplicates between the two.
6. **Sentence rhythm:** Does sentence length vary? Short-short-medium-long, not all
   the same length.

7. **Headline technique:** Does the headline use a named technique from
   `personal-voice.md` (Protagonist Framing, Verdict-as-Headline, or a body
   technique repurposed for headline use)? A headline that merely previews the
   content below ("How I redesigned the billing page") is technically compliant
   with the 6-10 word and tension constraints but functionally weak. If no named
   technique is identifiable, the headline likely defaults to a descriptive summary.

See `case-study.md` §3.7 for full blurb rules and the gold standard references.

### Check 12: Luxury positioning

Applies to the **entire** case study — blurb, scope statement, and feature sections.
Cross-ref `case-study.md` §3.8.

1. **Time-to-value safeguard (non-negotiable):** Are outcomes, metrics, and
   credentials visible within the first 15 seconds (hero metric + blurb body closer
   + scope statement)? If outcomes are buried in feature sections, that is a
   time-to-value failure regardless of luxury compliance. Note: the blurb *headline*
   creates tension, NOT outcome — only the *body closer* flashes the outcome.
2. **Editorializing check:** Does any sentence add commentary on top of an outcome?
   ("significant achievement," "massive undertaking," "innovative approach,"
   "demonstrating my ability to...") If so, cut the commentary; the fact speaks for
   itself.
3. **Hook source check:** Does the blurb headline hook through the *situation's*
   scale or tension (luxury) or through *listing the designer's accomplishments*
   (mass market)?
4. **Energy check:** Would a reader feel sold to, or feel intrigued? The energy
   should be "here is something interesting" not "let me tell you how great I am."

See also CAP-019 (Credential Performance) in `content-anti-patterns.md`.

### Check 13: Technical vocabulary accuracy

For every AI/systems term used in the case study, cross-ref
`technical-framing.md` §16:

1. **Three-gate compliance:** Does each technical term pass all three gates
   (structural match, evidence gate, terminology accuracy)? If any gate
   fails, the term must be removed or reframed as an authentic parallel.
2. **Placement check:** Is each direct-match term placed at the right level
   in the anatomy hierarchy? High-signal terms should not be buried in
   captions or parentheticals.
3. **Authentic parallel honesty:** If a term is used as an analogy ("same
   pattern as X"), is the framing explicit and honest? ("this IS X" when it
   isn't = fail.)
4. **Omission check:** Are there any near-miss terms that were correctly
   omitted? Confirming what was NOT used is as important as validating what
   was — it demonstrates vocabulary awareness without misapplication.

See also CAP-020 (Buzzword Misapplication) in `content-anti-patterns.md`.

### Check 14: Vividness test

Read the intro blurb aloud. Apply these tests:

1. **Picture test:** Can the reader see a specific image from the headline?
   "A design system built to remember what AI forgets" produces no image.
   "Teaching Einstein to build a design system - when he's six" produces an
   instant one. Every blurb headline should pass this test.
2. **Podcast test:** Could this blurb body work as a podcast intro? If it
   sounds like a LinkedIn post or a project brief, rewrite.
3. **Shared pain test:** Does the blurb contain at least one reference that
   makes the target reader think "that's me"? A named tool, a specific
   frustration, a cultural signal. Abstract pain ("inconsistent design
   systems") fails. Specific pain ("that default Tailwind blue-violet") passes.

If all three tests fail, the blurb needs a rewrite - regardless of whether
Checks 1-13 pass. A technically correct blurb that creates no image, sounds
like a brief, and connects with no one is not a passing blurb.

This check applies to the intro blurb only, not section bodies.

Cross-ref: named techniques in `personal-voice.md` (Section 17) for how to
fix a flat blurb. See also CAP-023 (Voice Flattening During Refinement) in
`content-anti-patterns.md`.

### Check 15: Visual density

Count image blocks (both uploaded and placeholder) per feature section.

1. **Per-section minimum:** Every feature section must have at least 2 image
   slots (placeholder or real). A text-only section fails the 80-85% visual
   target regardless of prose quality.
2. **Total count:** The entire case study should have 15-25 image slots across
   all sections. Under 15 means the page will feel text-heavy when images are
   uploaded. Over 25 means sections are overloaded.
3. **Placeholder specificity:** Each placeholder label must describe a specific
   screenshot or diagram ("Before: Old navigation with License buried 5 layers
   deep"), not a generic description ("Screenshot of the feature"). Generic
   labels fail because the user cannot match them to their assets.
4. **Layout appropriateness:** Before/after pairs should use `grid-2-equal`.
   Sequential flows should use `stacked`. Hero shots should use `full-width`.
   Mismatched layouts create visual noise when images are uploaded.

See `visual-economy.md` section 4.2 for the section rhythm rule (1-3 sentences
\+ 3-6 images).

### Check 16: Hero image presence

The first block in `content` must be a hero block (`blockType: 'hero'`).

1. **Presence:** If no hero block exists, the case study is incomplete. Every case
   study must start with a hero — either a real uploaded image or a labeled
   placeholder skeleton.
2. **Position:** The hero must be the first block. If it appears later in the
   content array, it was likely inserted after other blocks by mistake.
3. **Placeholder label specificity:** If the hero is a placeholder (no image),
   the label must describe the intended image concretely ("Hero — Redesigned
   usage dashboard with consumption-based billing"), not generically ("Hero
   image"). The label tells the user what to upload.

### Check 17: Metric derivation proximity

For each hero metric in the case study, classify its type and verify anchoring:

1. **Derived metric** (percentage, multiplier, ratio - "58%", "2x", "1 in 5"):
   Are before/after absolutes or a measurement basis visible in the scope
   statement or blurb body closer? If the reader cannot verify the arithmetic
   within the scan window, the metric is floating.

2. **Self-anchoring metric** (absolute before/after - "12,000 lines to 560"):
   Is the measurement domain unambiguous? The math is self-evident (the reader
   can verify the magnitude directly); the context must not be missing. "12,000
   lines of data" is clear; "reduced by 500 items" is not.

3. **Behavioral observation** ("users stopped verifying line by line"):
   Is there a temporal or observational anchor ("within six weeks", "across N
   users")? Mathematical derivation is not required.

Fail = derived metric with no derivation visible in the scan window, OR
self-anchoring metric with ambiguous measurement domain, OR behavioral
observation without a temporal or observational anchor.

Fix: add one clause to the scope statement (Zone 2) or blurb body closer
(Zone 1). See `case-study.md` section 3.3 for the construction pattern.

Cross-ref: CAP-025 in `content-anti-patterns.md` describes the failure mode.
This check is the compliance test.

### Check 18: Credibility stress test

Read the case study as a skeptical hiring manager. This check does NOT re-test
metric derivation (that is Check 17). Check 18 is purely about perception of
non-metric claims.

**Pre-read:** Check the Portfolio Coherence Manifest
(`docs/content/portfolio-coherence.md`) for the employment context field before
running sub-check 3.

1. **Role claim:** Plausible role + scope + company combination? If skeptical,
   is there an anchoring detail only someone who did the work would know? (e.g.,
   a specific tool name, a team structure detail, a constraint that reveals
   inside knowledge)

2. **Impact claim:** Could a skeptic construct an alternative explanation for the
   claimed impact? Does the case study preempt it? Look for claims that could be
   attributed to team effort, existing momentum, or coincidence.

3. **Employment signals:** Does anything inadvertently signal employment type or
   seniority that contradicts positioning? Check: role field labels, duration
   phrasing ("summer" vs "7 weeks"), collaborator descriptions, scope language
   ("helped with" vs "led"). See CAP-026 in `content-anti-patterns.md`.

### Check 19: Technique guardrails

Runs for ALL case studies that use any of T11-T15. If none of the extended
techniques appear, skip this check.

1. **Warranted Vulnerability (T12):** If used, does competence evidence arrive
   within 2 sentences of the concession? Does the vulnerability concede something
   adjacent to (not contradicting) the thesis?

2. **Anti-Sell (T13):** If used, is the conceded limitation something a skeptic
   would actually challenge? If nobody questioned it, the concession is theatrical.

3. **Identification (T11):** If used, is the shared experience universal enough
   (80%+ of target audience has lived it) but specific enough (generic readers
   bounce off)?

4. **Closed-Loop (T15):** If used, does the callback reference a specific word or
   image from the blurb, not a vague thematic echo?

5. **Consistency check:** Does the case study maintain a consistent personality
   throughout? Oscillating between confident and vulnerable within a single
   section reads as insecure. Vulnerability in the blurb + confidence in section
   bodies = fine. Vulnerability mid-section then confidence two sentences later =
   not fine.

Cross-ref: `personal-voice.md` Extended Body Techniques (11-15) for full
technique definitions and zone rules.

## Scoring

When used for auditing (Phase 1b rebuild), score each check as:

- **Pass** — no issues
- **Weak** — minor issues, fixable in place
- **Fail** — structural problem, requires rewrite

3+ fails on an existing case study = rebuild candidate.

## Cross-references

- Voice and style rules: `docs/content/voice-style.md`
- Named techniques (T1-T15): `docs/content/personal-voice.md`
- Anti-patterns catalog: `docs/content-anti-patterns.md`
- Self-audit framework: `docs/content/self-audit.md`
- Narrative arc: `docs/content/narrative-arc.md`
- Page anatomy: `docs/content/case-study.md`
