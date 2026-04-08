# §3. Case Study Structure

### 3.1 The Inverted Pyramid

Borrow from journalism. Lead with the conclusion (impact, outcome, key insight), then provide supporting detail. Most portfolios do the opposite — they build from context through process to results the reader may never reach.

### 3.2 Recommended Anatomy

```
┌──────────────────────────────────────────────────────────┐
│           [Full-width hero splash image]                 │  ← Full viewport width
│           (final product mockup, no text overlay)        │     above two-column layout
│           Always renders as skeleton when no image        │     max-width: 1056px, 16:9
└──────────────────────────────────────────────────────────┘

┌─────────────────┬────────────────────────────────────────┐
│                 │                                        │
│ ## App Name     │ # [Case Study Title: 6-10 words]       │  ← Intro Blurb (Zone 1); title set in IBM Plex Serif (`heading-case-study-intro`)
│ [descriptor]    │ [Intro body: 4-6 sentences, ≤80 words] │
│                 │                                        │
│ [HERO METRIC]   │ ---                                    │  ← structural divider (hook → article)
│ [metric label]  │                                        │
│                 │ [Scope statement: 2-4 sentences]       │  ← Article begins (Zone 2)
│ Role: [title]   │                                        │
│ Collaborators   │ ## [Feature Section 1 Title]           │  ← Feature sections continue Zone 2
│ Duration        │ [1-3 sentences: what + why]            │
│ Tools           │ [Full-width screenshot]                │
│ [Links ↗]       │ [Detail crops / interaction GIFs]      │
│                 │ [One-line caption]                     │
│  (sticky)       │                                        │     (whitespace only between sections)
│                 │ ## [Feature Section 2 Title]           │
│                 │ [1-3 sentences]                        │
│                 │ [Before/after or state progression]    │
│                 │                                        │     (whitespace only between sections)
│                 │ ## [Feature Section 3 Title]           │
│                 │ [1-3 sentences]                        │
│                 │ [System diagram or component overview] │
└─────────────────┴────────────────────────────────────────┘
```

**Time-to-Value Hero:** The hero image is the single most important content element on the case study page. It renders as a **full-width splash zone above the two-column layout**, centered via `margin: 0 auto` and slightly narrower than the sidebar+content block below it. It must show the final design outcome - a polished screenshot or composite of the shipped product. No text overlays the hero; the image speaks for itself. The hero skeleton (gradient placeholder at standard 16:9 ratio) always renders - it never conditionally disappears. When a real image loads, it replaces the skeleton. A visitor evaluates visual quality, product domain, and design sensibility in a single glance (~2 seconds) before reading any text. Starting with text forces sequential processing and delays value perception. Starting with a strong visual establishes credibility instantly and gives the visitor a reason to keep scrolling. Every case study must open with the hero splash before any text or metadata.

**Hero responsive behavior:** Symmetric padding on all four sides at every breakpoint: 24px vertical / 0 horizontal on mobile, 24px/16px at tablet, 32px all sides at desktop. Border radius appears at tablet+ breakpoints. The hero inner container caps at `$elan-container-default` (1056px). At viewports above 1056px + padding, the hero is centered and slightly narrower than the sidebar+content block (~1100px), creating a clean inset relationship. Both containers share the same visual center via `margin: 0 auto`.

**Adaptive image dimensions:** The hero container adapts to the uploaded image's natural aspect ratio - no cropping, no letterboxing, no `object-fit: cover`. The image renders at `width: 100%; height: auto`, so the designer controls the hero's proportions by choosing the image dimensions. The 16:9 gradient skeleton matches the standard screenshot ratio and is a placeholder shape, not an enforced constraint. **Hero images should target 16:9** (standard display ratio) for best fit. At 1056px max-width, a 16:9 image is ~594px tall - comfortably above the fold at all common viewports. Other ratios (16:10 MacBook captures, 3:2 photography) also work naturally since the container adapts.

**Hero metric:** Every case study needs a single, visually prominent impact number visible in the first scan — not buried in prose. "2×" or "+40%" displayed large alongside the title. This is the number the hiring manager will remember 30 seconds later when deciding whether to keep reading. Prose metrics are parsed sequentially; visual metrics are parsed in parallel (scanning). For the 10-second scan, a visually distinct metric block beats an embedded sentence.

**External link indicators:** Any link that leaves the portfolio site must have a visual indicator (↗ icon). This is a basic affordance — users should know before clicking that they're leaving the site. It also signals that the link points to real, verifiable external evidence (documentation, press, live products).

**Contemporary relevance framing:** When a project's domain maps to a current industry trend, make the connection explicit in the scope statement. Historical projects gain interview-worthiness when connected to problems the hiring company faces today. Example: "a consumption-based pricing model — the same pay-for-what-you-use approach now standard across AI products."

**Duration field semantics:** The Duration metadata field communicates project length — a velocity and scope signal. Use "~3 months", "6 weeks", "2024 – Present". Never use ship dates here (e.g., "Shipped August 2022"). Ship dates provide temporal context and belong in the scope statement narrative. If a ship date and a duration both appear, they must say different things — otherwise one is wasted metadata. See CAP-014.

**Collaborator display:** Each collaborator/stakeholder group renders on its own line. "Product Management", "Engineering", "Customer Success" are distinct entries, not a comma-separated list. This gives the sidebar a clean, scannable structure where the reader can quickly assess cross-functional scope.

### 3.3 The Scope Statement (Intro Paragraph)

This is the single most important paragraph in the case study. It must accomplish three things simultaneously in 2-4 sentences:

1. **What the company/product does** (context for readers who don't know it)
2. **What you specifically did** (ownership claim)
3. **Evidence of scale or impact** (credibility anchor)

**Bridge sentence (Zone 2 entry):** When an intro blurb precedes the scope statement (see §3.7), the first sentence of the scope statement acts as a thermal bridge — it can carry forward-leaning momentum (short, punchy, a dash or scale reveal) but must NOT use rhetorical questions, "you" address, or tabloid curiosity language. By sentence 2, the register is fully in the credentials zone. See §3.7 for the Three Thermal Zones model and §3.8 for the Luxury Positioning Principle that governs all case study text.

**Visual hierarchy:** The `description` field (scope statement) is a legacy field rendered as regular body text (`body-base`, `text-secondary`). The **intro blurb body** is the primary text engagement hook - it uses `body-lg`, `font-weight: medium`, and `text-primary` to signal importance. New case studies should not use the `description` field; all prominent text goes in the intro blurb (see §3.7 and CF-016).

**Social proof via named clients:** When the product serves notable clients, name 1-2 recognizable ones instead of using generic quantifiers. "Serving enterprise clients including Snowflake and LendingTree" is stronger than "serving thousands of enterprise clients." Named social proof triggers trust through association — the reader infers quality from the caliber of the customer base.

**Company name links:** When company names appear in the scope statement, link them to their official landing pages. This adds a layer of verifiability that strengthens credibility. The reader can confirm the companies are real, substantial entities. The links also carry a subtle signal: "I'm confident enough in these claims that I'm inviting you to check."

**Reference — Joseph Zhang, Skiff:**
> "I led design at Skiff, a productivity company building E2EE collaboration tools. As the first full-time design hire, I helped scale Skiff from beta to over +1,000,000 users."

Three sentences. Company context, role claim ("led design", "first full-time design hire"), impact metric (+1M users), and an outcome (acquired by Notion). Every word earns its place.

**Reference — Joseph Zhang, Notion:**
> "I design for the time layer of the Notion ecosystem, primarily focusing on turning Notion Calendar into the most powerful calendar application in the world."

Two sentences. Specific scope ("time layer"), ambitious framing ("most powerful calendar in the world"), and named product features (AI Meeting Notes, Notion Agent). No hedging.

**Metric derivation anchor (mandatory):** If the case study has a hero metric, the scope statement or blurb body closer must ground it. The anchoring strategy depends on the metric type:

- **Derived metric** (percentage, multiplier, ratio): The scope statement must contain the before/after absolutes or a measurement basis. Example: "raised self-service usability by 58% in task-based evaluations with internal users" - the measurement basis ("task-based evaluations with internal users") anchors the derived 58%.
- **Self-anchoring metric** (absolute before/after): The before/after IS the derivation. No additional clause needed if the measurement domain is clear. Example: "cut 12,000 lines of data to 560" - the domain ("lines of data") is unambiguous.
- **Behavioral observation**: Not a calculation. A temporal or observational anchor is sufficient. Example: "users stopped verifying line by line within six weeks."

This is a construction pattern. See CAP-025 in `content-anti-patterns.md` for the failure mode. Check 17 in `case-study-review.md` is the compliance test.

### 3.4 Feature Sections

Each section follows a consistent rhythm:

1. **Section title** (2-5 words): An argument, not a label. See Section Title Strategy below.
2. **Context paragraph** (1-3 sentences): What was designed and why it mattered. Never process — always outcome or intent.
3. **2-6 full-width images**: The primary communication medium. Screenshots, UI states, interaction moments.
4. **Occasional one-line captions**: Specificity signals beneath images.

**Section Title Strategy:** A section title is a compressed argument, not a
content preview. The reader should find the title interesting on its own,
before reading the body. Three archetypes:

- **Object Title:** A concrete object that contains the argument. The reader
  sees the object and understands the problem without explanation.
  "Five Matryoshkas Deep" (nested navigation layers).
  "Collector's Profile" (the feature IS the title).
- **Inversion Title:** A flipped framework that stakes a contrarian position.
  The reader recognizes the framework and wonders why it was inverted.
  "Build Instead of Buy" (inverts the standard "build vs. buy" decision).
- **Verdict Title:** An opinion about a design decision stated as fact.
  The reader encounters a judgment and wants to know if it holds up.
  "Donut. Avoid at All Cost." (verdict about a chart type).

**Preview Title anti-pattern:** A title that describes the section content
rather than arguing for it. Preview titles are accurate but not magnetic.
The **Standalone Test:** remove the section body text. Read only the title.
Does it make you curious what the argument is? (Argument title - pass.) Or
does it make you predict what the section explains? (Preview title - fail.)
A title that cannot function as a standalone interesting statement is a
preview.

| Preview (fail) | Argument (pass) | Why it fails/passes |
|---|---|---|
| "Five Layers to Three" | "Five Matryoshkas Deep" | Numbers describe; object creates a picture |
| "Why Not Just Keep Tableau" | "Build Instead of Buy" | Question promises; inversion delivers |
| "Reading the Speedometer" | "Donut. Avoid at All Cost." | Describes output; verdict takes a position |

See `personal-voice.md` Techniques 6-10 for headline generation techniques.
See `case-study-review.md` Check 7 for validation against this anti-pattern.

**Target per case study:** 3-4 feature sections. Total text under 300 words. Total images: 15-25.

**Luxury positioning (§3.8):** Feature section text must state decisions and trade-offs as facts — never editorialize about difficulty or impressiveness. "We could serve both user groups or serve one well. We chose one." The reader evaluates the judgment. See §3.8 for the full constraint.

**WHY over WHAT (CAP-016):** Every case study section must answer "why I designed it this way" — not just "what I built." Feature lists are junior signals; design rationale with evaluated alternatives is the senior signal. Structure each section as: (1) what the decision point was, (2) what alternatives were considered, (3) why this approach was chosen, (4) what trade-offs were accepted. The feature/output is supporting evidence for the decision, not the headline.

**Interactive visuals must match section topic:** When embedding interactive demonstrations within case study sections, the visual must be scoped to the section's narrative. A general-purpose widget that shows "everything in the design system" in a section about color identity is a content anti-pattern — it fails the "does this support the narrative?" test. Interactive visual examples within the widget must follow the conventions they describe (e.g., token examples must use the naming convention the section explains).

### 3.5 Arc-Drives-Anatomy Relationship

The **narrative arc** (`docs/content/narrative-arc.md`) and the **page anatomy**
(this file, §3.2) serve different purposes and operate in sequence:

1. The **Arc** is a thinking framework. It analyzes raw material, selects a thesis,
   and decides which narrative beats to include. It produces a planning budget of
   500-800 words.
2. The **Anatomy** is a visual container. It defines the fixed page structure: hero
   image, title, sidebar metadata, scope statement, and feature sections.
3. The Arc **instructs** the Anatomy. After analysis, the Arc compresses its beats
   into the Anatomy's compact format — under 300 words for feature section text,
   1-3 sentences per section, 80-85% visual density.

The page has three zones with different levels of freedom:

- **Hero splash (fixed template):** Full-width above the two-column layout. Always
  renders a skeleton; the Arc provides the hero image. No text overlay. This zone
  exists solely for visual credibility in the 0-5 second impression window.
- **Left sidebar (fixed template):** Role, Collaborators, Duration, Tools, External
  Links. The Arc decides what values go here based on material analysis. These map
  to Payload `Projects` metadata fields.
- **Right main area (semi-structured):** Intro blurb and scope statement at top, then
  N feature sections, each with 1-3 sentences + visuals. The Arc determines how many
  sections, what each argues, and what visuals belong where — but the Anatomy
  constrains the density.

The beats are NOT 7 visible sections. See `docs/content/narrative-arc.md` §12.2 for
the beat-to-anatomy compression table.

When a feature section includes an interactive component (not a static image), the
component must follow the interactive component spec format defined in
`docs/content/narrative-arc.md` §12.6. This includes exact section heading matching
for the `INTERACTIVE_VISUALS` map (per CFB-014 / ENG-054).

### 3.6 What Case Studies Never Include

- **No "Design Process" sections.** No double diamond, no "Research → Ideate → Prototype → Test" flowcharts.
- **No user personas or journey maps.** The thinking is embedded in the work, not explained around it.
- **No walls of body text.** Nothing exceeds 4 sentences in a row.
- **No separate "Results" section at the bottom.** Impact is stated upfront in the intro, not saved for the end.
- **No generic language.** No "delightful experiences", "user-centered", "intuitive interfaces."

### 3.7 The Intro Blurb (Headline + Body) and the Three Thermal Zones

The intro blurb sits between the hero image and the scope statement. Its sole job is
to **hook the reader into scrolling further**. It is a trailer, not a summary.

**CMS storage:** Two top-level fields on the Projects collection -
`introBlurbHeadline` (text) and `introBlurbBody` (richText). Not a content block.
The `introBlurbHeadline` is the official case study title and drives the homepage
masonry card title (`h3`). On the homepage, the headline replaces the app name as
the card title. The `category` field below it communicates domain. This shifts the
card from domain-first (Joseph Zhang pattern) to intrigue-first, relying on
category + thumbnail for domain signal. The `title` field holds the application
or product name (e.g. "Lacework") and is shown in the sidebar and prev/next nav.

**Typography:** The intro blurb body uses `body-lg` at `font-weight: medium` with
`text-primary` color. This is the prominent entry text for the case study - there is
no separate "description" section. The `description` CMS field is legacy; existing
content is rendered as regular body text (`body-sm`, `text-secondary`) for backward
compatibility, but new case studies should not use it. All prominent text goes in
the intro blurb.

#### Structure

| Part | Length | Purpose |
|------|--------|---------|
| **Headline** | 6-10 words | Tension, friction, the moment of itch. NOT an outcome statement. |
| **Body** | 4-6 sentences, ≤80 words | Stakes, empathy, structural tease, outcome flash in the closer. Hides the *how*. |

**Headline vs. body distinction (critical):** The headline hooks through *situation
tension* — it must NOT state the outcome. The body closer flashes the outcome as a
fact ("cut 12,000 lines to 560"). This separation makes the blurb simultaneously
intriguing (headline) and time-to-value compliant (body closer).

#### Three Thermal Zones

The blurb and the case study body sit on opposite ends of a voice spectrum. A
controlled gradient bridges them — the scope statement is the cooldown, and visual
hierarchy (typography size decreasing) signals that each register is supposed to be
different.

- **Zone 1: Blurb (hot)** — Rhetorical "you," tension, tabloid curiosity, sentence
  rhythm building to a medium-long closer. Trailer energy. Has its own register.
  Lives above the scope statement with larger, distinct typography.
- **Zone 2: Scope statement (warm → precise)** — The bridge. First sentence carries
  forward-leaning momentum (short, punchy) but NOT rhetorical questions or "you."
  By sentence 2-3, fully in the credentials register. See §3.3.
- **Zone 3: Feature sections (precise)** — Fully restrained, declarative. 1-3
  sentences. The voice `voice-style.md` already defines. No change.

Existing escape valves maintain cohesion: contrarian lines (1-2 per case study) and
one wry aside are the echo points inside the body that reference the blurb's energy.

#### 10 Writing Principles

1. **The blurb is a trailer, not a summary.** Show stakes, flash the outcome in the
   closer, never reveal the how. The gap between "what was achieved" and "how" is
   what makes them scroll.

2. **Use "you" to create empathy.** Rhetorical questions that start with "How do
   you..." force the reader into your shoes. "How do you design software that moves
   $79B?" — not "I designed software that moves $79B."

3. **Sentence rhythm: alternate punch and flow.** Short, short, short → medium →
   medium-long. Short sentences set stakes. Medium sentences tease the narrative.
   One medium-long sentence at the end delivers the outcome flash. Never make
   rhetorical questions long.

4. **Numbers need verbs to land.** Raw numbers floating in space mean nothing. "$79B
   in assets. One designer." is weaker than "How do you design software that moves
   $79B in assets daily?" The verb turns a statistic into stakes.

5. **Tease structure without revealing it.** If the case study has a clear internal
   structure, name it but don't unpack it. "A story of three counterintuitive bets"
   creates three open questions in the reader's mind.

6. **Avoid cliche metaphors — earn your imagery.** Not "rebuilding a plane mid-air"
   or "wearing many hats." Borrow the energy from the metaphor but use language
   specific to the actual story.

7. **"Read how I..." is a valid closer.** It explicitly invites continued reading,
   states the transformation, and withholds the mechanism. The closer is where
   specific outcome numbers belong.

8. **Inject tabloid-grade curiosity.** "Nobody saw coming," "nearly killed,"
   "deliberately not build," "counterintuitive" — these are accurate descriptions of
   real project dynamics, framed to maximize curiosity. Not clickbait.

9. **Do NOT over-explain the domain.** Provide just enough context to establish
   stakes ("ETF portfolio management," "$79B in assets"). Don't explain what an ETF
   is. Trust that stakes translate even without domain knowledge.

10. **The headline and body must tell one cohesive story.** The headline introduces a
    tension. The first line of the body escalates or contextualizes it. They are a
    continuous unit, not two separate pieces.

**Luxury constraint on hook source (§3.8):** The headline hooks through *situation
intrigue* (the problem's scale, constraints, tension), not through *achievement-
listing*. "How do you design software that moves $79B?" centers the challenge.
"I single-handedly redesigned Goldman Sachs's $79B platform" centers the credential.
The former is luxury; the latter is mass market.

#### Blurb-Specific Anti-Patterns

- **3+ rhetorical questions.** Diminishing returns. Two maximum.
- **Revealing the how.** If the reader can learn the solution from the blurb alone,
  it fails.
- **Same-length sentences.** Monotone rhythm kills scannability.
- **Generic design language.** "I conducted user research and iterated on designs"
  says nothing.
- **Summarizing the entire project.** The blurb covers stakes, constraints, tension,
  and a flash of outcome. Everything else is the case study's job.
- **Credential-stacking in the headline.** The headline creates tension, not a list
  of accomplishments. See CAP-019.

#### Gold Standard References

**Gold Standard 1 (situation tension):**

**Headline:** I had to choose whom NOT to design for.

**Body:** How do you design software that moves $79B in assets daily? Now do it as
the only designer, with no PM, and two user groups who want opposite things. Halfway
through, I hit a wall that nearly killed adoption entirely. Meteor is a story of
three counterintuitive bets I made mid-flight - who to prioritize, what to
deliberately not build, and a migration risk nobody saw coming. Read how I turned a
tedious, error-prone ETF workflow into an exception-driven system that cut 12,000
lines of data down to 560.

**Gold Standard 2 (protagonist framing):**

**Headline:** I saved the page my own team gave up on

Works because the verb ("saved") is reframed by the resistance clause ("my own team
gave up on"). The emphasis lands on the situation, not the achievement. Compare:
"I redesigned the billing page" = credential listing (fails luxury). The luxury
test: remove "I [verb]ed" - does the remainder describe a difficult situation? "The
page my own team gave up on" = yes. Source: Lacework case study. Technique 10 from
`personal-voice.md`.

#### Headline Technique Cross-References

Blurb headlines and section titles use overlapping but distinct technique subsets
from `personal-voice.md`:

- **Blurb headlines (6-10 words):** Protagonist Framing (Technique 10) is the
  primary blurb technique - first-person dramatic casting with resistance. Verdict-as-
  Headline (Technique 8) works when combined with a longer resolver clause.
- **Section titles (2-5 words):** Object Substitution (Technique 6), Framework
  Inversion (Technique 7), and Verdict-as-Headline (Technique 8) are the primary
  section title techniques. See §3.4 for the three title archetypes.
- **Modifiers (both levels):** Deliberate Ambiguity and Staccato Authority layer on
  top of the primary techniques.

### 3.8 The Luxury Positioning Principle

This is a meta-constraint that governs ALL case study text — blurb, scope statement,
and feature sections. It is not specific to the intro blurb.

**The rule:** Show outcomes early. State them as facts. Never editorialize why they
are impressive. The reader's inference is more powerful than your commentary.

**Critical non-negotiable: Time-to-value.** The luxury principle governs *manner of
presentation*, NOT *visibility of outcomes*. Achievements, metrics, credentials, and
outcomes MUST be front-loaded — hero metric in the first scan, outcome flash in the
blurb body closer, credentials in the scope statement. Hiding outcomes to seem
understated is NOT luxury — it is bad UX. The reader must know what you achieved
within 15 seconds. The luxury principle prohibits editorializing those outcomes or
anxiously stacking them.

#### The Three-Way Distinction

- **Luxury:** "Review time dropped from 80 minutes to 8." (Fact. The reader does the
  math.)
- **Mass market:** "Review time dropped from 80 minutes to 8, which was a significant
  improvement that demonstrated my ability to drive operational efficiency." (Fact +
  commentary + credential performance.)
- **Wrong interpretation of luxury:** Burying the metric in a feature section at the
  bottom. (Hiding outcomes is not restraint — it is burying the lede.)

#### How It Constrains Each Thermal Zone

- **Zone 1 (Blurb):** Headline hooks through *situation tension*, not credential-
  listing. Body MUST flash the outcome in the closer. The outcome is visible; only
  the *how* is withheld. Time-to-value AND luxury simultaneously.
- **Zone 2 (Scope statement):** Credentials and impact stated as flat facts,
  prominently and early. "As the sole designer, I redesigned the review workflow.
  Review time dropped from 80 minutes to 8." Never add "which was a tremendous
  responsibility."
- **Zone 3 (Feature sections):** Show the decision, the constraint, the trade-off.
  Never editorialize about difficulty. "We could serve both user groups or serve one
  well. We chose one." The reader evaluates the judgment.

#### Related Anti-Patterns

- **CAP-019 (Credential Performance):** Editorializing outcomes. See
  `docs/content-anti-patterns.md`.
- **Check 12 (Luxury Positioning):** Quality check applied during review. See
  `docs/content/case-study-review.md`.

### 3.9 Divider Usage Principle

Dividers mark **zone boundaries** - the transition from the intro hook to the article narrative, or from article to navigation. One divider, one boundary.

**The structural divider:** A single `<hr>` renders in the template between the intro blurb (Zone 1: title + hook body) and the article body (Zone 2: scope statement, company callout, feature sections). It is always present when an intro blurb exists. This is a template-level element, not a CMS content block - the author does not control it per-section. The scope statement is the first element of the article, not part of the intro zone.

**No dividers between feature sections.** Sections within the article body are chapters of one cohesive story. Whitespace (via CSS adjacent-sibling margin on headings, 48px) provides sufficient visual separation. Divider lines between sections signal "these are separate items" when the intent is continuity. This creates friction, discourages scrolling, and contradicts the narrative arc structure from `narrative-arc.md`.

**When dividers ARE appropriate:**
- Between the intro blurb and the article body (rendered by the template)
- Between the article body and prev/next navigation (already exists as `.projectNav` border-top)
- Never between sections that tell a continuous narrative

**Implementation:** The `createCaseStudyBlocks` helper defaults `showDivider` to `false`. Setting `showDivider: true` explicitly opts in for rare structural breaks. The inter-section spacing comes from CSS adjacent-sibling rules on `.sectionHeading` (48px, `$portfolio-spacer-layout-x-spacious`), not from divider blocks.

**Anti-pattern reference:** CAP-024 (Divider Overuse Between Narrative Sections).
