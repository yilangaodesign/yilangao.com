# Content Strategy — Accumulated Knowledge

> **What this file is:** The synthesized, authoritative content strategy knowledge base for yilangao.com. Every principle here was extracted from competitive portfolio analysis, hiring manager mental modeling, and real content iteration. This is a living document — it grows after every content session.
>
> **Who reads this:** AI agents routed here by `AGENTS.md` Pre-Flight. Read the Section Index first, then only the section matching your task.
> **Who writes this:** AI agents after processing content feedback via the `content-iteration` feedback loop.
> **Last updated:** 2026-03-29 (updated with RARRA retention model, P(Alive), Magic Number, HM segmentation, intervention matrix, LTV thinking from revised mental model v2)

---

## Section Index — Read This First

| § | Topic | Read when |
|---|-------|-----------|
| §0 | Content Posture | Always for content work (~15 lines — read this every time) |
| §1 | Conversion Funnel & Hiring Manager Mental Model | Understanding who the audience is and how they read |
| §2 | Homepage / Hero Strategy | Touching the landing page, hero section, or project grid |
| §3 | Case Study Structure | Writing, restructuring, or editing any case study page |
| §4 | Image-to-Text Ratio & Visual Economy | Deciding how much to write vs. show |
| §5 | Language Patterns | Writing any copy — titles, intros, captions, metadata |
| §6 | Seniority Signals | Framing role, scope, decisions, and impact |
| §7 | Internal Tool Compensation Strategies | Presenting work that lives behind a firewall |
| §8 | Project Selection & Curation | Choosing which projects to feature and in what order |
| §9 | About Page & Supporting Content | Editing the about page, contact page, or any non-case-study content |
| §10 | Portfolio Lifecycle & Intervention Matrix | Mapping hiring stages to lifecycle, adapting for HM segments |
| §11 | Self-Audit Framework | Evaluating the portfolio against the mental model |
| §12 | Process Principles | Meta — how to approach content changes |
| Appendix | Reference Portfolios & Frequency Map | Competitive benchmarks and recurring feedback patterns |

---

## 0. Content Posture

**The portfolio is a product. The hiring manager is the user. The conversion event is "move this candidate to the next stage."**

- **Retention over acquisition.** More portfolio views won't help if visitors bounce. The higher-leverage problem is always what happens *after* someone lands. Fix engagement depth before worrying about traffic. (RARRA > AARRR applied to portfolios.)
- **P(Alive) decays by default.** Every section of the portfolio must actively maintain or increase the hiring manager's consideration probability. Passive content (filler, generic copy, decorative elements without signal) allows decay. There is no "neutral" content — it either increases P(Alive) or lets it drop.
- **Visual-first, text-minimal.** The current industry standard for top-tier product design portfolios is ~80-85% visual surface area, ~15-20% text. Text exists to frame images, not to explain them.
- **Every word must earn its place.** Hiring managers spend 15-60 seconds scanning a case study before deciding whether to read. If a sentence doesn't help them decide whether to keep reading, cut it.
- **Show the work, not the process.** Never lead with methodology (research → ideate → prototype → test). Lead with the problem, the outcome, and the artifacts. Process is what every designer does; *thinking within the process* is the differentiator.
- **The portfolio itself is a design artifact.** Typography, layout, interaction design, and code quality of the portfolio are evaluated as implicit evidence of capability. A clumsy portfolio undermines every case study inside it.
- **Internal tools require more visual evidence, not more text.** When the reader can't visit the live product, screenshots, recordings, and annotated flows must be so clear that the reader feels like they've used the product.
- **Specificity over generality.** "Improved the user experience" signals nothing. "Activation time dropped 30% in the first month" or "Led design for a 2.5-month marketing site relaunch with 20 interactive graphics coded in React" signals everything.
- **Conversion rate > application volume.** A small improvement in conversion rate has a multiplicative effect. Doubling application volume doubles effort. Doubling conversion rate doubles outcomes with no additional effort per application.

---

## How to Use This File

1. **Read the Section Index above** — match your task to a section, read only that section.
2. **If the user gives content feedback**, process it through the content feedback loop: log → update principles → update anti-patterns.
3. **After resolving feedback**, update this file: strengthen existing principles or add new ones.
4. **Do NOT read the entire file** unless the feedback loop requires it.

---

## 1. Conversion Funnel & Hiring Manager Mental Model

**Source:** `portfolio-hiring-manager-mental-model.md` (v2, RARRA + lifecycle model) + competitive analysis, 2026-03-29.

### 1.1 The Funnel

Every portfolio visit is a five-stage conversion funnel. Each stage has a job, a signal the hiring manager seeks, and a failure mode.

| Stage | Time | Signal Sought | Drop-off Cause |
|---|---|---|---|
| **Impression** | 0–5s | Role clarity + professional credibility | Unclear positioning, visual noise |
| **Relevance** | 5–15s | Domain or problem-space match | Projects don't map to role; titles vague |
| **Engagement** | 15–60s | Problem framing + ownership evidence | Buries the lede; opens with process |
| **Evaluation** | 1–3 min | Decision quality + impact + thinking clarity | Describes what happened but not why |
| **Conversion** | 3+ min | Confidence this person can do the job | Portfolio was "fine" but not memorable |

### 1.2 Three Retention Layers

The funnel compresses a user lifecycle (Onboarding → Growth → Maturity) into minutes. Three layers apply in sequence — each is prerequisite to the next.

**Layer 1 — Value Verification (0–15 seconds / The Aha Moment):**
The visitor must experience "this person is relevant and credible" within seconds. This is the portfolio's Aha Moment. Hiring managers who confirm relevance in the first 15 seconds are dramatically more likely to read a case study. The Aha Moment is NOT "this portfolio is beautiful." It IS: "This person has solved problems like the ones my team faces."

**Layer 2 — Engagement Deepening (15 seconds – 3 minutes):**
Once value is verified, the visitor invests time. Each scroll, each section must deliver a new unit of signal — a decision, an insight, an outcome — that justifies continued reading. The more time invested, the more likely the manager completes the evaluation rather than abandons it (sunk cost in attention).

**Layer 3 — Barrier Building (3+ minutes):**
After extended engaged reading, the manager has constructed a mental picture of the designer's capabilities and fit. This cognitive investment creates a switching cost — they are less likely to move on without taking action (reaching out, bookmarking, sharing). The portfolio's job at this layer: provide a clear, frictionless conversion path so the built-up engagement has somewhere to go.

**The recursive insight:** These layers are a funnel within the funnel. Optimizing Layer 2 doesn't help if Layer 1 is failing. **Fix Layer 1 before optimizing Layer 2. Fix Layer 2 before optimizing Layer 3.**

### 1.3 The Portfolio's Magic Number

In growth design, a "magic number" is a specific behavior that strongly predicts retention (Facebook: "add 10 friends in 7 days"). For a portfolio:

**Within 60 seconds, the visitor has (1) understood the designer's specialization, (2) identified at least one relevant project, and (3) encountered a specific, concrete outcome from that project.**

If all three signals land within a minute, the probability of deeper engagement rises dramatically. If any one is missing, the visit likely ends. Designing for the magic number means:
- The homepage must communicate specialization immediately (signal 1)
- Project titles and thumbnails must convey domain relevance at a glance (signal 2)
- The first visible element of each case study must include an outcome, not just a problem statement (signal 3)

### 1.4 P(Alive) — Consideration Probability

Every candidate has an implicit P(Alive) in the hiring manager's mind — the probability this candidate is still worth considering. P(Alive) starts at baseline when the portfolio opens and adjusts with every signal:

- Strong positioning statement → P(Alive) increases
- Vague or generic hero copy → P(Alive) drops sharply
- Relevant project titles → P(Alive) holds or increases
- Case study demonstrates clear thinking → P(Alive) climbs toward conversion threshold
- Process-heavy narrative without insight → P(Alive) decays

**Key insight: P(Alive) decays by default.** If nothing actively increases it, attention drifts. Every section must actively maintain or increase P(Alive). Passive content allows decay. There is no neutral content.

### 1.5 Hiring Manager Segmentation

Not all hiring managers evaluate the same way. The portfolio can't optimize for all four types simultaneously, but it can lead with the lens most common in target roles and ensure others are present as secondary signals.

| Segment | Primary Lens | Scans For First | Portfolio Implication |
|---|---|---|---|
| **Craft-oriented** (design leads) | Visual quality, interaction detail | Polish of UI work, attention to detail | High-fidelity visuals and micro-interactions matter most |
| **Outcome-oriented** (product/eng leaders) | Business impact, cross-functional collab | Metrics, before/after, stakeholder mgmt | Lead with outcomes and decision rationale, not aesthetics |
| **Process-oriented** (UX research, design ops) | Methodology rigor, research quality | Research methods, insight → decision chain | Show the thinking chain from insight to design decision |
| **Culture-oriented** (founders, small teams) | Communication style, values alignment | Writing voice, About page, collaboration descriptions | Personality and point of view carry more weight |

### 1.6 The Hiring Manager's Internal Monologue

**0–5 seconds:** "What does this person do? Is this relevant to my open role? Does this feel polished or amateur?" If unclear → close tab.

**5–15 seconds:** "Do any of these projects map to problems my team faces? How many projects — curated or exhaustive?" If nothing relevant → close tab.

**15–60 seconds:** "What was the problem? What was this person's role? Did they ship it?" If the case study opens with a wall of context → skim or bounce.

**1–3 minutes:** "Does the reasoning make sense? Are the decisions defensible? Is there impact evidence? Would I trust this person to own this on my team?"

**3+ minutes:** Pre-interview territory. The conversion has happened.

### 1.7 Jobs To Be Done (Priority Order)

1. **Risk reduction:** "Will this person fail in this role?" — screening out risk before screening in talent.
2. **Signal matching:** "Does this person have evidence of the specific capabilities I need?"
3. **Seniority calibration:** "Is this person at the level I'm hiring for?" — reading between the lines of how they talk about scope and decisions.
4. **Culture fit (light read):** "Would this person communicate and collaborate well?" — secondary signal from tone and clarity.

### 1.8 Vanity Metrics vs. North Star Metrics

| Vanity Metric (Looks Good, Means Little) | North Star Metric (Actually Matters) |
|---|---|
| Portfolio page views | Interview invitations per application sent |
| Behance/Dribbble likes | Recruiter inbound messages |
| Number of projects shown | Engagement depth per case study (scroll depth, time on page) |
| Social media followers | Conversion rate from portfolio visit to next-stage action |
| Visual polish without substance | Hiring manager's ability to articulate what you do after 60 seconds |

The last row is critical: if a hiring manager cannot explain to their team in one sentence what you do and why you're relevant, the portfolio has failed its core job — regardless of visual quality.

---

## 2. Homepage / Hero Strategy

### 2.1 The 10-Second Clarity Test (Designing the Aha Moment)

A visitor must answer three questions without scrolling:

1. **What does this person do?** (Role + specialization)
2. **What kind of problems do they solve?** (Domain or problem-space)
3. **Is this work at the level I'm hiring for?** (Visual credibility + tone)

This is the portfolio's Aha Moment window (Layer 1). Using the BJ Fogg behavior model (Behavior = Motivation × Ability × Trigger):

- **Motivation:** The hiring manager already has it — they have an open role. The homepage's job is not to create motivation but to connect to existing motivation by signaling relevance immediately.
- **Ability:** The homepage must make it effortless to understand who you are and what you do. Any friction — ambiguous copy, slow load, unclear navigation — reduces ability and breaks the chain.
- **Trigger:** Project thumbnails, titles, and featured work serve as triggers to the next action (clicking a case study). The trigger must be visible and compelling without requiring the visitor to search.

### 2.2 Positioning Statement

**Reference — Joseph Zhang:** "Interaction Designer" + "I design software with the belief it's one of the most malleable mediums we have." — Clear role, specific philosophy, no generic tagline.

**Anti-pattern:** "I design delightful experiences" — true of everyone, signals nothing. Equivalent to a SaaS homepage saying "We help businesses grow."

**Rule:** The positioning statement should narrow the field. "Product designer specializing in B2B SaaS growth and activation" is more useful than "UX/UI Designer."

### 2.3 Project Grid

- **3–5 curated projects** is almost always stronger than 8–15. Curation signals editorial judgment.
- Each project card needs: **company/project name**, **2-3 word descriptor** (not a tagline — a category), and a **visual thumbnail** that communicates the work domain at a glance.
- **Reference — Joseph Zhang:** "Notion / Digital toolmaking", "Azuki / Consumer Product", "Skiff / Productivity" — instantly parseable domain + type.

### 2.4 Team/Company List

Joseph lists companies with a numbered sequence (Cognition 1, Notion 2, Azuki 3, Skiff 4, Apple 5). This is a subtle chronology-of-credibility device — the companies speak louder than any description. For internal tools where the company name carries weight, lean on this.

---

## 3. Case Study Structure

### 3.1 The Inverted Pyramid

Borrow from journalism. Lead with the conclusion (impact, outcome, key insight), then provide supporting detail. Most portfolios do the opposite — they build from context through process to results the reader may never reach.

### 3.2 Recommended Anatomy

```
[Full-width hero image of the product]

# Project Title
[2-3 word descriptor]

[Scope statement: 2-4 sentences]

Role: [Specific title]
Collaborators: [Named individuals]
Duration: [Timeframe]
Tools: [Key tools]
[External links: live product, press, etc.]

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

### 3.3 The Scope Statement (Intro Paragraph)

This is the single most important paragraph in the case study. It must accomplish three things simultaneously in 2-4 sentences:

1. **What the company/product does** (context for readers who don't know it)
2. **What you specifically did** (ownership claim)
3. **Evidence of scale or impact** (credibility anchor)

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

### 3.5 What Case Studies Never Include

- **No "Design Process" sections.** No double diamond, no "Research → Ideate → Prototype → Test" flowcharts.
- **No user personas or journey maps.** The thinking is embedded in the work, not explained around it.
- **No walls of body text.** Nothing exceeds 4 sentences in a row.
- **No separate "Results" section at the bottom.** Impact is stated upfront in the intro, not saved for the end.
- **No generic language.** No "delightful experiences", "user-centered", "intuitive interfaces."

---

## 4. Image-to-Text Ratio & Visual Economy

### 4.1 The Ratio

**Target: 80-85% visual surface area, 15-20% text.**

Both Joseph Zhang and Ryo Lu operate at or above this ratio. Ryo Lu approaches 90%+ visual — his portfolio (built inside Notion itself) is primarily screenshots with project title, year, and a brief descriptor.

### 4.2 The Rhythm

**One paragraph of text buys you 3-6 images.** Never the reverse. The images carry the argument; the text provides just enough framing for the images to be legible.

Typical section rhythm:
- 1-3 sentences of context
- 3-6 full-width or half-width images
- 0-2 one-line captions

### 4.3 Image Types That Work

| Type | When to use | Example |
|---|---|---|
| **Full-width hero screenshot** | Opening each feature section | The product's primary view, immersive scale |
| **Detail crops** | Showing specific interaction patterns or micro-decisions | A toolbar, a modal, a hover state |
| **State progression** | Showing a flow or transformation | Empty → loading → populated → error, side by side |
| **Before/after** | Showing impact of your redesign | Old vs. new, clearly labeled |
| **Screen recording / GIF** | Showing animation, transitions, or interactive behavior | A drag interaction, a page transition, a loading sequence |
| **System diagram** | Showing architecture or component relationships | Information architecture, component hierarchy |
| **Annotated walkthrough** | Replacing "play with it" for internal tools | 3-4 screens connected with arrows, one-sentence annotations |

### 4.4 Images the Reader Doesn't Need

- Process artifacts (sticky notes, whiteboard photos, affinity diagrams) unless they're exceptionally clear
- Low-fidelity wireframes when high-fidelity final work exists
- Screenshots of Figma with visible layers panel and UI chrome — crop to the design
- Stock photography or decorative imagery that doesn't show actual work

---

## 5. Language Patterns

### 5.1 The Scope Claim

Active voice. Specific. Ambitious but defensible.

| Weak | Strong |
|---|---|
| "I was asked to redesign the dashboard" | "I identified that dashboard engagement was dropping and proposed a redesign" |
| "I worked on the design" | "I led design for the marketing site relaunch, a 2.5-month project" |
| "We made an app" | "We designed the Elementals reveal experience to be full of anticipation and delight" |

### 5.2 The Feature Label

Section text serves as a **label for what the images show**, not an explanation of the design process. Each sentence should do one of three things:

1. **Name the design intent:** "full of anticipation and delight", "feel luxurious and high-fashion"
2. **Describe one specific interesting detail:** "Every time someone clicks the white rabbit, a new quote is generated via ChatGPT"
3. **Establish context:** "marks one of the first high-profile streetwear partnerships between a web3 company and high fashion"

### 5.3 The Craft Caption

Single-line captions beneath images that demonstrate attention to detail through **specificity**:

- "20 interactive graphics scattered across the marketing site, each individually coded in React"
- "+200 hand-drawn icons combining angular and soft features"
- "Four skeuomorphic icons, one for each product [Co-designed with Jason]"
- "Led design for the Skiff marketing site relaunch, a 2.5 month project"

**Rule:** Numbers are more convincing than adjectives. "200 icons" > "extensive icon set". "2.5 months" > "a significant project". "20 interactive graphics" > "many graphics."

### 5.4 The Metadata Block

Structured metadata communicates seniority and context without narrative overhead:

| Field | Purpose | Example |
|---|---|---|
| **Role** | Specific title, not generic | "Product & Brand Designer" not "UX Designer" |
| **Collaborators** | Named individuals, not "the team" | "Raphael Schaad, Calendar Team" |
| **Duration** | Shows commitment and scope | "2022 – Present" or "2 months" |
| **Tools** | Signals technical capability | "Figma, React" |
| **Links** | External validation | Live product, press articles, acquisition news |

### 5.5 Third-Party Validation

External links that let someone else vouch for the work:

- Press coverage: Hypebeast, Highsnobiety, Yahoo Finance articles about the project
- Live product links: "View a profile" → azuki.com/collector/dingaling
- Acquisition announcements: "Skiff has been acquired by Notion"
- App store links: direct links to the shipped product

For internal tools, third-party validation is harder. Compensate with: company blog posts mentioning the project, internal awards, team size/scope metrics, or quantified impact statements.

---

## 6. Seniority Signals

### 6.1 How Hiring Managers Calibrate Level

Seniority is not read from a title on the page. It's read from **how the designer talks about their work.** The differentiators:

| Junior Signal | Senior Signal |
|---|---|
| "I was asked to redesign the dashboard" | "I identified that dashboard engagement was dropping and proposed a redesign" |
| "I followed the design process" | "I scoped a v1 we could ship in two weeks given limited dev bandwidth" |
| "I designed the screens" | "I collaborated with PM to define success metrics and with engineering to negotiate scope" |
| "The client was happy" | "Activation time dropped 30% in the first month after launch" |
| Describes tasks completed | Describes decisions made and their rationale |
| Credits the team generically | Specifies their unique contribution within the team |

### 6.2 Ownership Language

Use language that claims scope without being dishonest:

- **"I led design for..."** — you were the primary designer
- **"As the first full-time design hire, I..."** — you shaped the role and the system
- **"I helped scale X from Y to Z"** — you were part of the growth, claiming proportional credit
- **"I collaborated with [named person] to..."** — you worked at peer level with specific people
- **"[Co-designed with Jason]"** — honest attribution that still centers your contribution

### 6.3 Retrospective vs. Predictive Narratives

The lifecycle framework's distinction between "explaining the past" and "predicting the future" applies directly. Junior narratives tend to be retrospective accounts of what happened. Senior narratives demonstrate the ability to anticipate, plan, and adapt — which is what hiring managers are buying at senior level.

- **Retrospective (junior):** "We discovered users were confused, so we redesigned the flow."
- **Predictive (senior):** "I scoped a v1 we could ship in two weeks given limited dev bandwidth, knowing we'd iterate based on activation data."

### 6.4 Scope Framing

Senior designers describe scope in terms of systems and outcomes, not screens and tasks:

- "I design for the time layer of the Notion ecosystem" — not "I designed 15 screens for Calendar"
- "Managing such a large scope has helped me develop a holistic understanding of the product ecosystem" — showing awareness of breadth
- "Most of my work stayed in R&D but pieces of it have shipped" — honest about what launched vs. explored

---

## 7. Internal Tool Compensation Strategies

**The core challenge:** When the product lives behind a firewall, you cannot say "go see for yourself." The strategies below replace live product access with equivalent evidence.

### 7.1 Screenshots as the Live Product

High-fidelity, full-resolution screenshots at multiple scales replace the live link. Present them full-width and immersive — as if the reader is looking at the actual screen.

**Structure each feature section as:**
1. A full-width hero screenshot of the feature in its primary state
2. 2-3 detail crops showing specific interaction patterns, edge cases, or states
3. One line of caption describing what the user is seeing

**Do not:** Put screenshots in laptop/phone mockup frames (wastes space, adds nothing). Use small thumbnails in a grid (loses detail). Show Figma UI chrome (show the design, not the tool).

### 7.2 Guided Walkthroughs Replace "Play With It"

Since the reader can't click, create the experience of clicking:

- **Short screen recordings (5-15 seconds, looped as video/GIF):** Key interactions, transitions, loading states
- **State progression sequences:** The same screen in 3-4 states side by side (empty → populated → error)
- **Annotated flows:** 3-4 screens connected with arrows showing a key user path, with one-sentence annotations at decision points

This is not a process diagram. It's a **guided tour of the shipped product.**

### 7.3 Context Framing Replaces Brand Name Recognition

When you work at Notion or Apple, the company name carries instant credibility. For internal tools, you need to build that credibility yourself:

> "[Company name] operates [X scale metric]. The internal [tool name] is used by [N users/teams] to [core job]. When I joined, [one sentence about the state of things]. Over [duration], I [scope statement with impact]."

3-4 sentences max. Replace brand recognition with **concrete scale numbers**.

### 7.4 Before/After Replaces Third-Party Validation

Side-by-side comparisons showing the state of the tool before your involvement vs. after. These are high-signal because they answer the hiring manager's core question: "Did this person actually improve things?"

### 7.5 System Artifacts Replace "Go Use the Product"

Even behind a firewall, you can show:
- Design system components and tokens you built
- Information architecture diagrams
- Component libraries (Figma screenshots)
- Decision frameworks or matrices you created for the team
- Data dashboards showing adoption/impact metrics

These are artifacts of thinking, not process documentation.

### 7.6 Sanitization Principles

When showing internal tool screenshots:
- Blur or redact sensitive data (names, financial figures, PII) — this is expected and professional
- Keep UI structure and visual design fully visible — the redaction shows responsibility, not evasion
- Add a brief note if needed: "Data redacted per company policy" — one sentence, no apology

---

## 8. Project Selection & Curation

### 8.1 The Curator Problem

Showing 8–15 projects signals "I included everything" rather than "I chose what's most relevant." 3–5 well-chosen projects is almost always stronger. This is the equivalent of a feature-bloated product page vs. a focused landing page.

### 8.2 Selection Criteria

Each featured project should demonstrate a **different capability signal**:

| Signal | What it proves | Example project type |
|---|---|---|
| Complexity management | Can handle large-scope, interconnected systems | Enterprise tool with multiple user types |
| Zero-to-one | Can create from nothing | New product or feature from scratch |
| Scale | Can design for large user bases | Product used by 1M+ users |
| Craft | Deep attention to interaction detail | Polished consumer experience |
| Systems thinking | Can create reusable, scalable patterns | Design system or component library |
| Cross-functional leadership | Can work across disciplines | Project involving PM, eng, research |

### 8.3 Relevance Targeting (LTV Resource Allocation)

If you know the type of role you're pursuing, project selection and framing should reflect that. A portfolio optimized for a design systems role looks different from one for consumer mobile. This doesn't mean multiple portfolios — it means re-ordering projects and adjusting which details are emphasized.

This is the portfolio version of the LTV framework's resource allocation principle: invest the most in the highest-value segments. Projects most relevant to target roles should be most prominent, most polished, and most thoroughly presented.

### 8.4 Titling

Project titles and thumbnails are the "above the fold" of each project. They must communicate the problem domain and work type in a glance.

- **Good:** "Redesigning the Checkout Flow" — immediately parseable
- **Bad:** "Project Moonshot" — cute but opaque
- **Reference — Joseph Zhang:** "Notion / Digital toolmaking", "Cursor AI / AI code editor" — company + domain in 2-3 words

---

## 9. About Page & Supporting Content

### 9.1 Purpose

The About page is a secondary conversion asset. Hiring managers visit it when already interested. It should **reinforce**, not introduce, the value proposition.

### 9.2 Useful Elements

- A brief professional narrative (how you got here, what you care about) — 2-3 paragraphs max
- Specific skills contextualized by experience — not a grid of tool logos
- A clear, frictionless way to get in touch (email link, not a form with 5 fields)

### 9.3 What Ryo Lu Values

From his Dive Club interview: "What I like seeing is work. Real work, pictures, ideally something I can play with, that's live. Not long writing case studies of standard product development process. I care a lot about all the details, how you present things, how you build your website. All the typography."

The About page should be as carefully designed as the case studies. It's not a dumping ground for biography.

### 9.4 Contact as Conversion (Designing the Path to the Magic Number)

"Get in touch" should be frictionless. Every page should have a clear path to contact:
- From homepage → enter a case study
- From case study → read another case study, or get in touch
- From About → get in touch

Do not leave the visitor to find their own way through the portfolio. The journey from landing to conversion should be as guided as a SaaS onboarding flow, where each step makes the next step obvious. An email link is lower friction than a contact form.

---

## 10. Portfolio Lifecycle & Intervention Matrix

**Source:** `portfolio-hiring-manager-mental-model.md` v2, §6 — lifecycle mapping, 2026-03-29.

### 10.1 Mapping Hiring Stages to Lifecycle

A candidate's relationship with a hiring process follows the same arc as a user lifecycle:

| Lifecycle Stage | Hiring Equivalent | Portfolio's Role | Key Intervention |
|---|---|---|---|
| **Onboarding** | Portfolio visit (first impression) | Deliver the Aha Moment — prove relevance in seconds | Clear positioning, curated projects, immediate evidence |
| **Growth** | Case study engagement (deepening interest) | Sustain engagement through compelling narrative | Strong structure, decision-focused content, impact evidence |
| **Maturity** | Interview stage (active consideration) | Serve as reference document the team revisits | Depth, consistency across projects, memorable details |
| **Decline** | Competing candidates emerge | Maintain P(Alive) against comparison | Distinctiveness, a clear "why this person" differentiator |
| **Churn** | Rejection or ghosting | Enable potential re-engagement for future roles | Lasting impression, easy to re-find, shareability |

### 10.2 The Intervention Matrix: HM Segment × Engagement Stage

Different hiring manager types need different signals at different stages. This isn't about building multiple portfolios — it's about knowing which signals to lead with and which to embed as supporting evidence.

| | Craft-Oriented HM | Outcome-Oriented HM | Process-Oriented HM |
|---|---|---|---|
| **Onboarding (Homepage)** | High-fidelity hero visuals, design system evidence | Outcome stats in hero, business context | Research methodology keywords, structured approach |
| **Growth (Case Study)** | Detailed UI artifacts, interaction decisions | Before/after metrics, ROI framing | Research → insight → decision chain |
| **Maturity (Deep Read)** | Design system documentation, component libraries | Cross-project pattern of business impact | Methodology evolution, learning across projects |

### 10.3 Portfolio LTV Thinking

Most designers over-invest in application volume (the CAC equivalent) and under-invest in portfolio quality (the LTV equivalent):

**Portfolio ROI = (Interview conversion rate × Offer rate × Offer value) / (Time invested in portfolio + Time invested per application)**

A small improvement in conversion rate — the percentage of portfolio visits that lead to interviews — has a multiplicative effect. Doubling application volume doubles effort. Doubling conversion rate doubles outcomes with zero additional effort per application.

---

## 11. Self-Audit Framework

**Source:** `portfolio-hiring-manager-mental-model.md` v2, §7.1 — layered audit, 2026-03-29.

Use this to evaluate the portfolio against the mental model. The audit follows the three retention layers — fix earlier layers before optimizing later ones.

### 11.1 Layer 1 — Value Verification (Aha Moment)

- Can a stranger identify your role and specialization within 5 seconds of landing?
- Does the visual quality match or exceed the level of roles you're targeting?
- Is the first impression creating professional credibility or raising questions?
- Could a hiring manager explain in one sentence what you do after a 60-second visit?

### 11.2 Layer 1 → Layer 2 Transition (Magic Number)

- Do project titles and thumbnails communicate the problem domain clearly?
- Would a hiring manager for your target role see at least 2 relevant projects?
- Are you curating (3-5 strong projects) or dumping (8+ with uneven quality)?
- Within 60 seconds, can a visitor achieve all three magic number signals: specialization understood, relevant project identified, concrete outcome encountered?

### 11.3 Layer 2 — Engagement Deepening

- Does each case study open with the problem and outcome, or with background context?
- Can a reader get the key takeaway in under 60 seconds of scanning?
- Is your specific role and scope clear within the first few sentences?
- Do case studies demonstrate decisions and trade-offs, not just process?
- Is there evidence of impact — quantitative, qualitative, or both?
- Does the level of strategic thinking match the seniority of target roles?

### 11.4 Layer 3 — Barrier Building (Conversion)

- After reading the portfolio, would a hiring manager remember one specific thing about you?
- Is the path from "I'm interested" to "I've reached out" frictionless?
- Does the portfolio leave the visitor with a clear sense of what working with you would be like?
- Would the hiring manager share this portfolio with a colleague? What would they say?

---

## 12. Process Principles

### 12.1 Diagnose Before You Rewrite

When content "isn't working," identify which retention layer is failing (§1.2) before rewriting everything. A homepage bounce (Layer 1) is a different problem than a case study engagement drop (Layer 2). **Fix Layer 1 before optimizing Layer 2. Fix Layer 2 before optimizing Layer 3.**

### 12.2 One Change, One Verification

Each content iteration should address one retention layer. Don't rewrite the homepage, restructure a case study, and update the About page simultaneously.

### 12.3 Read the Content.md First

Before writing or editing any portfolio content, read this file. If the task maps to an existing principle, apply the documented approach immediately.

### 12.4 The Portfolio Is Never "Done"

Treat portfolio improvements like a growth experiment: identify the weakest retention layer, form a hypothesis, design a change, test for 2-4 weeks, measure signal (north star metrics from §1.8, not vanity metrics), iterate.

---

## Appendix A: Reference Portfolios

### A.1 Joseph Zhang — joseph.cv

**Why it works:**
- Company names do heavy lifting (Notion, Apple, Cursor, Azuki) — instant credibility
- ~80-85% visual, ~15-20% text
- Scope statements claim ownership and ambition simultaneously
- Named collaborators add legitimacy
- External validation via press links (Hypebeast, Highsnobiety, Yahoo Finance)
- Each project tells a different capability story
- The website itself is a custom-built artifact (not a template)

**Key language patterns:**
- "I led design at Skiff" — direct ownership claim
- "As the first full-time design hire" — seniority signal
- "I helped scale Skiff from beta to over +1,000,000 users" — impact metric
- "20 interactive graphics scattered across the marketing site, each individually coded in React" — specificity in captions

### A.2 Ryo Lu — work.ryo.lu

**Why it works:**
- Portfolio IS the product (built inside Notion) — meta-demonstration of competence
- Approaching 90%+ visual — extreme confidence in letting work speak
- Project entries organized by feature and year within each company
- Personal site (ryo.lu) shows personality AND technical capability

**Key insight from Dive Club interview:**
> "What I like seeing is work. Real work, pictures, ideally something I can play with, that's live. Not long writing case studies of standard product development process. I care a lot about all the details, how you present things, how you build your website. All the typography."

### A.3 Common Patterns Between Both

1. Image-to-text ratio: 80-90% visual
2. Text is surgical, not explanatory — every word earns its place
3. No process documentation — no double diamond, no persona cards
4. Outcome-first framing — intro tells you what matters immediately
5. Section-based structure — not linear narrative, but discrete features/moments
6. Named collaborators — shows team context without being generic
7. External validation — live product links, press coverage, acquisition news
8. The portfolio itself is a design artifact — custom domains, careful typography, interactive elements

---

## Appendix B: Feedback Frequency Map

| Pattern | Times Raised | Priority |
|---------|-------------|----------|
| (No content feedback processed yet) | 0 | — |

---

## Entry Template (for future updates)

```markdown
## N. [Category Name]

### N.1 [Principle Name]

**Source:** Session YYYY-MM-DD, feedback "[first 10 words...]"
**Problem:** [What the content issue was]
**Root cause:** [Why it happened]
**Rule:** [The principle to follow going forward]
**Implementation:** [Specific copy pattern, structure, or visual approach to use]
```
