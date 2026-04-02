# §3. Case Study Structure

### 3.1 The Inverted Pyramid

Borrow from journalism. Lead with the conclusion (impact, outcome, key insight), then provide supporting detail. Most portfolios do the opposite — they build from context through process to results the reader may never reach.

### 3.2 Recommended Anatomy

```
[Full-width hero image of the product]

# Project Title                              [HERO METRIC]
[2-3 word descriptor]                        [metric label]

[Scope statement: 2-4 sentences]

Role: [Specific title]
Collaborators: [Named individuals — one per line]
Duration: [Project length, e.g. "~3 months", "6 weeks" — NOT ship dates]
Tools: [Key tools]
[External links ↗: live product, press, etc.]

---

## [Feature Section 1 Title]
[1-3 sentences: what + why]

[Full-width screenshot]
[Detail crops / interaction GIFs]
[One-line caption]

## [Feature Section 2 Title]
[1-3 sentences]

[Before/after or state progression]
[Screenshots]

## [Feature Section 3 Title]
[1-3 sentences]

[System diagram or component overview]
[Screenshots of system in use]
```

**Time-to-Value Hero:** The hero image is the single most important content element on the case study page. It must show the final design outcome — a polished screenshot or composite of the shipped product. This is not decorative. A visitor evaluates visual quality, product domain, and design sensibility in a single glance (~2 seconds) before reading any text. Starting with text forces sequential processing and delays value perception. Starting with a strong visual establishes credibility instantly and gives the visitor a reason to keep scrolling. Every case study must open with the hero before any description or metadata.

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

**Visual hierarchy:** The scope statement must be typographically distinct from section body text — larger size and medium weight. This is both a design and content concern: the paragraph is the hiring manager's primary text engagement hook after the hero image. If it visually blends with body text, it fails to signal its importance regardless of how well it's written.

**Social proof via named clients:** When the product serves notable clients, name 1-2 recognizable ones instead of using generic quantifiers. "Serving enterprise clients including Snowflake and LendingTree" is stronger than "serving thousands of enterprise clients." Named social proof triggers trust through association — the reader infers quality from the caliber of the customer base.

**Company name links:** When company names appear in the scope statement, link them to their official landing pages. This adds a layer of verifiability that strengthens credibility. The reader can confirm the companies are real, substantial entities. The links also carry a subtle signal: "I'm confident enough in these claims that I'm inviting you to check."

**Reference — Joseph Zhang, Skiff:**
> "I led design at Skiff, a productivity company building E2EE collaboration tools. As the first full-time design hire, I helped scale Skiff from beta to over +1,000,000 users."

Three sentences. Company context, role claim ("led design", "first full-time design hire"), impact metric (+1M users), and an outcome (acquired by Notion). Every word earns its place.

**Reference — Joseph Zhang, Notion:**
> "I design for the time layer of the Notion ecosystem, primarily focusing on turning Notion Calendar into the most powerful calendar application in the world."

Two sentences. Specific scope ("time layer"), ambitious framing ("most powerful calendar in the world"), and named product features (AI Meeting Notes, Notion Agent). No hedging.

### 3.4 Feature Sections

Each section follows a consistent rhythm:

1. **Section title** (2-5 words): Names the feature or initiative. "Collector's Profile", "Visual Language", "Mail"
2. **Context paragraph** (1-3 sentences): What was designed and why it mattered. Never process — always outcome or intent.
3. **2-6 full-width images**: The primary communication medium. Screenshots, UI states, interaction moments.
4. **Occasional one-line captions**: Specificity signals beneath images.

**Target per case study:** 3-4 feature sections. Total text under 300 words. Total images: 15-25.

**WHY over WHAT (CAP-016):** Every case study section must answer "why I designed it this way" — not just "what I built." Feature lists are junior signals; design rationale with evaluated alternatives is the senior signal. Structure each section as: (1) what the decision point was, (2) what alternatives were considered, (3) why this approach was chosen, (4) what trade-offs were accepted. The feature/output is supporting evidence for the decision, not the headline.

**Interactive visuals must match section topic:** When embedding interactive demonstrations within case study sections, the visual must be scoped to the section's narrative. A general-purpose widget that shows "everything in the design system" in a section about color identity is a content anti-pattern — it fails the "does this support the narrative?" test. Interactive visual examples within the widget must follow the conventions they describe (e.g., token examples must use the naming convention the section explains).

### 3.5 What Case Studies Never Include

- **No "Design Process" sections.** No double diamond, no "Research → Ideate → Prototype → Test" flowcharts.
- **No user personas or journey maps.** The thinking is embedded in the work, not explained around it.
- **No walls of body text.** Nothing exceeds 4 sentences in a row.
- **No separate "Results" section at the bottom.** Impact is stated upfront in the intro, not saved for the end.
- **No generic language.** No "delightful experiences", "user-centered", "intuitive interfaces."
