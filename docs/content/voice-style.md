# Section 13 — Voice & Style

> Two-tier scoping: **universal rules** apply to all case study text work
> (iteration and authoring). **Authoring-mode rules** apply only to new case
> study creation or full rebuilds.

## 13.1 Universal Rules

These rules apply whenever an agent writes or edits any case study text —
whether during `content-iteration` or `case-study-authoring`.

### Sentence rules

Most sentences under 18 words. Subject, verb, object. A long sentence earns its
length by following two or three short ones.

Use sentence fragments to sharpen a point. "Not a component library. A control
layer." Periods after fragments give them authority.

Fragment density by zone: In feature section bodies (Zone 3), cap at 2-3
fragments per section - more and the rhythm flattens into telegram staccato.
In the intro blurb (Zone 1), fragments can carry the rhythm freely - the word
count (80 max) is the real constraint, not the fragment count. In the scope
statement (Zone 2), 1-2 fragments max.

Never start consecutive sentences with the same word. Especially avoid stacking
"I," "The," or "This." Open with a verb, a condition, a contrast, a concrete
noun.

Get to the point. No bland scene-setting. No "Imagine you're sitting at your
desk" openings. A vivid metaphor that creates an instant picture is a hook,
not scene-setting. The test: can the reader see a specific image in one
sentence? "Teaching Einstein to build a design system - when he's six"
produces an image. "In today's fast-moving design landscape" produces nothing.
The first is a hook. The second is throat-clearing.

Sentences should read like a person writing with conviction — not like a
telegram, and not like a press release. If every sentence is under eight words,
the rhythm flattens and the voice disappears. Mix short and medium. Let a
sentence breathe when the idea needs room.

### Paragraph shape

1-3 sentences per paragraph. Four sentences signals a wall of text. Case studies follow the ~60/40 visual-prose model. Essay-type content (opinion pieces, written arguments like ETRO) follows a text-majority model - see `visual-economy.md` section 4.1.

One idea per paragraph. If a paragraph has a setup and a payoff, split them.

### Banned words — always rewrite

| Banned | Replacement |
|--------|-------------|
| leveraged | say what you used |
| utilized | used |
| holistic | describe the actual scope |
| seamless | say what made it smooth |
| innovative | show it, never label it |
| ensure | say how |
| facilitate | say what happened |
| robust | say what makes it strong |
| comprehensive | say what it covers |
| streamlined | say what got faster |
| journey | flow, path, or describe it |
| landscape, realm, multifaceted | delete and rewrite |
| essentially | always deletable |
| kind of | undermines conviction |
| "I think that" before a strong opinion | just state the opinion |

### Preferred words

**Physical, spatial language for systems:**
layer, scaffold, guardrail, surface, loop, signal, drift, anchor, lock, funnel,
queue, threshold

**Plain verbs:**
built, cut, broke, fixed, tested, dropped, shipped, flagged, mapped

Not: implemented, optimized, iterated upon

### Punctuation

- **Em dashes:** never. Use a regular dash - like this. Max one per section.
- **Semicolons:** avoid. Use a period.
- **Colons:** use to set up a reveal. Max two per section.
- **Bold:** only for section headings and impact metrics. Never in body text for
  emphasis.
- **Exclamation marks:** zero.
- **Parenthetical asides:** one per page max.

### Metric handling

State the metric. Don't explain why it's impressive. The reader can do the math.

- **Yes:** "Sign-up conversion increased by 37%."
- **No:** "Sign-up conversion increased by 37%, which represents a significant
  improvement in our funnel performance."

**Always** pair a metric with a derivation or a reframe - but the anchoring strategy depends on the metric type:

- **Derived metric** (percentage, multiplier, ratio): Requires a derivation clause - before/after absolutes or measurement basis. Derivation belongs in the scope statement (Zone 2) or blurb body closer (Zone 1).
- **Self-anchoring metric** (absolute before/after): The before/after IS the derivation. No additional clause needed if domain context is clear.
- **Behavioral observation**: Not a calculation. Benefits from a temporal anchor but does not require mathematical derivation.

A derived metric that lacks its derivation is a floating claim - see CAP-025 in `content-anti-patterns.md`.

The metric is what happened. The reframe is what it means.

### Caption style

Captions are not descriptions of what the reader can see. They're context the
image can't provide on its own.

A caption should tell the reader what to notice, what changed, or why it
matters. If the caption just restates what the image shows, delete it and write
something the image needs the text to say.

Captions can function as compressed credentials. If the image shows a body of
work, the caption can state its scope or the effort behind it in a single line.

Captions are tiny arguments disguised as labels.

## 13.2 Authoring-Mode Rules

These rules apply only during `case-study-authoring` (new case studies or full
rebuilds). They are too opinionated for line-level editing during iteration.

### Voice posture

Write as a designer who did the work. Not someone writing about doing work.

Confident without performing confidence. State what happened. No gratitude
language, no false modesty. The philosophical foundation for this posture is
the Luxury Positioning Principle — see `case-study.md` §3.8.

- **Yes:** "I led design for the review system."
- **No:** "I had the privilege of leading design for the review system."
- **Yes:** "I chose equity users as the first adopter."
- **No:** "After careful consideration, we felt that equity users might be the
  right starting point."

Opinionated when it counts. Senior designers have positions. State choices as
judgments, not feelings.

- **Yes:** "Modularity lets each layer do one job. A single monolithic prompt
  breaks the moment context shifts."
- **No:** "We felt that modularity might be a better approach."

### Luxury and personality are not opposites

The Luxury Positioning Principle (`case-study.md` Section 3.8) means: don't
editorialize outcomes, don't perform credentials, let facts speak for
themselves. It does NOT mean: be cold, strip personality, avoid cultural
references, or write like a press release.

Luxury brands are specific and personal. The portfolio's voice should feel
like a designer with strong opinions and lived experience - not like a
summary generated from project notes. Cultural in-group references, survival
framing, and humor are compatible with luxury positioning when they serve
specificity. "Afraid of the default Tailwind blue-violet? Me too." is luxury
- it's specific, confident, and doesn't editorialize. "I innovatively solved
the challenge of inconsistent AI output" is mass market.

See `personal-voice.md` (Section 17) for the named techniques that produce
this voice.

### Contrarian lines

One or two contrarian lines per case study that push against a default
assumption. Place them at the start of a section or right after a break. Never
buried mid-paragraph. These also serve as echo points that maintain cohesion
across the Three Thermal Zones — they reference the blurb's energy inside the
restrained body. See `case-study.md` §3.7.

### Wry aside

One per case study max. A parenthetical. A one-word sentence. No more.

### Positioning frame

Frame the work as system design, not tool usage.

- **Yes:** "I designed the constraints and review loops that make AI generation
  consistent."
- **No:** "I also know how to use Cursor/AI."
- **No:** "I can't code but I shipped anyway."

Center your judgment, never the tool. The case study should make the reader
trust your thinking, not your toolchain.

The one-line test: you're selling "I can harness generation," not "I can
generate."

For the curated vocabulary of AI/systems terms, the three-gate applicability
test, and the authentic parallel technique, see `technical-framing.md` §16.
The positioning frame here governs *how* to phrase technical work; §16 governs
*which concepts* to surface and where to place them.

### Section openings

Open with the sharpest thing. Not context. Not background.

If there's a metric, lead with it. If there's no metric, lead with the core
tension in one sentence.

Never start a section with "Background," "Context," or "Overview."

Test: delete the first sentence. Does the section still work? If yes, the first
sentence was throat-clearing. Cut it.

## Cross-references

- Personal voice techniques and refinement protocol: `docs/content/personal-voice.md`
- Expanded language patterns: `docs/content/language-patterns.md`
- AI-generated voice tells (CAP-017): `docs/content-anti-patterns.md`
- Voice flattening during refinement (CAP-023): `docs/content-anti-patterns.md`
- Narrative arc beats: `docs/content/narrative-arc.md`
- Case study anatomy: `docs/content/case-study.md`
