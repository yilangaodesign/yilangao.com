# Content Anti-Patterns

> **What this file is:** A catalog of content mistakes that weaken portfolio effectiveness, documented so they are never repeated. Each anti-pattern includes the trigger, why it's wrong, and the correct alternative.
>
> **Who reads this:** AI agents before writing or editing portfolio content — scan for relevant anti-patterns.
> **Who writes this:** AI agents when a content feedback cycle reveals a new anti-pattern.
> **Last updated:** 2026-04-25 (CAP-032 added: Redundant Noun in Labelled Count)

## Category Index

| Category | IDs | Count |
|----------|-----|-------|
| Narrative Structure | CAP-001, 003, 006, 016, 024 | 5 |
| Voice & Tone | CAP-017, 022, 023, 027, 028 | 5 |
| Positioning & Claims | CAP-002, 004, 011, 019, 025, 026 | 6 |
| Information Architecture | CAP-005, 008, 009, 010, 018, 031 | 6 |
| Specificity & Evidence | CAP-007, 015, 020, 021 | 4 |
| UX Microcopy | CAP-012, 013, 014, 032 | 4 |
| **Total** | | **31** |

---

## CAP-001: Process-First Case Study Narrative

**Status: ACTIVE**

**Trigger:** Opening a case study with "First we did research, then we ideated, then we prototyped, then we tested..."

**Why it's wrong:** Every designer follows a process. The process itself is not the differentiator — the *thinking within the process* is. A hiring manager scanning 30+ portfolios has seen the double diamond diagram dozens of times. Process-first narratives bury the actual signal (decisions, trade-offs, outcomes) under methodology that the reader already assumes you follow. By the time the interesting parts arrive, the reader has already bounced.

**Correct alternative:** Lead with the problem and the outcome (inverted pyramid). If process is relevant, embed it as context within feature sections: "We discovered through prototype testing that users expected X, so we pivoted to Y." The process is supporting evidence, not the headline.

**Reference:** Neither Joseph Zhang nor Ryo Lu include any process sections in their case studies. Zero instances of "Research → Ideate → Prototype → Test" across 8+ case studies analyzed.

---

## CAP-002: Generic Positioning Statement

**Status: ACTIVE**

**Trigger:** Using phrases like "I design delightful experiences", "I'm a passionate UX designer", "I create user-centered solutions", or any tagline that could describe every designer on earth.

**Why it's wrong:** These are the portfolio equivalent of a SaaS homepage saying "We help businesses grow." They are true of everyone and therefore signal nothing. A hiring manager reading this learns nothing about what kind of designer you are, what problems you solve, or whether you're relevant to their open role. Generic positioning fails the 10-second clarity test — the visitor cannot tell if this portfolio is worth their time.

**Correct alternative:** A specific positioning statement that narrows the field:
- "Product designer specializing in B2B SaaS growth and activation"
- "Interaction Designer" (Joseph Zhang — specific discipline, not generic "UX/UI")
- "I design software with the belief it's one of the most malleable mediums we have" — specific philosophy, not generic aspiration

---

## CAP-003: Screenshot Gallery Without Narrative Context

**Status: ACTIVE**

**Trigger:** A page full of screenshots with no text explaining what the reader is looking at, why it matters, or what decisions it represents.

**Why it's wrong:** Visuals matter, but they are evidence, not the argument. A hiring manager looking at 15 uncontextualized screenshots cannot distinguish "this person shipped impressive work" from "this person took screenshots of someone else's work." Without 1-3 sentences of framing per section, the reader can't evaluate the designer's thinking — only their visual output.

**Correct alternative:** Every cluster of images needs a brief label (1-3 sentences) that names the design intent, one interesting detail, or the business context. The text is not an explanation — it's a lens that tells the reader what to notice in the images.

---

## CAP-004: Vague Impact Claims

**Status: ACTIVE**

**Trigger:** "Improved the user experience", "Increased engagement", "Made it easier to use", or any impact statement that cannot be verified or compared.

**Why it's wrong:** If you cannot be specific, the hiring manager assumes you don't have real metrics — or worse, that the impact was negligible. Vague claims read as padding. They also fail the seniority calibration test: junior designers say "the client was happy"; senior designers say "activation time dropped 30% in the first month."

**Correct alternative:** Quantitative if possible, specific qualitative if not:
- "Scaled from beta to over +1,000,000 users" (Joseph Zhang, Skiff)
- "Set the record for the most expensive skateboards sold in history" (Joseph Zhang, Azuki)
- "Acquired by Notion" (Joseph Zhang, Skiff — the acquisition IS the impact)
- If no metrics: describe the specific qualitative outcome honestly. "Reduced the admin's three-step approval workflow to a single confirmation" is better than "improved the workflow."

---

## CAP-005: Overloaded Project Count

**Status: ACTIVE**

**Trigger:** Featuring 8-15 projects on the homepage, including uneven quality or projects from significantly different career stages.

**Why it's wrong:** An exhaustive project list signals "I included everything" rather than "I chose what's most relevant." It's the equivalent of a feature-bloated product page. The hiring manager must now evaluate which projects are worth clicking — a job the designer should have done for them. Weak projects dilute the signal from strong ones.

**Correct alternative:** 3-5 curated projects, each with a clear reason for inclusion. If you have more good work, you can add a secondary "Other Work" section below the fold, but the primary grid should be tight and intentional.

---

## CAP-006: Burying the Lede

**Status: ACTIVE**

**Trigger:** A case study that opens with 2-3 paragraphs of company background, team structure, or problem context before stating what was actually designed and what happened.

**Why it's wrong:** The hiring manager's internal monologue at 15-60 seconds is: "What was the problem? What was this person's role? Did they ship it?" If the answer to these questions is below the fold, the reader may never reach it. The engagement window is 15-60 seconds — context must be compressed, not expanded.

**Correct alternative:** The scope statement (first 2-4 sentences) must simultaneously provide company context, ownership claim, and impact signal. Background detail goes in feature sections, not the opening.

**Reference:** Joseph Zhang's Skiff intro is 3 sentences and covers: company (productivity, E2EE), role (led design, first hire), scale (+1M users), and outcome (acquired by Notion). No separate "Background" section exists.

---

## CAP-007: Explaining Instead of Showing for Internal Tools

**Status: ACTIVE**

**Trigger:** Writing 3-4 paragraphs describing what an internal tool does because the reader can't access it, instead of showing high-fidelity screenshots and annotated walkthroughs.

**Why it's wrong:** Text-heavy descriptions of internal tools read as "I can't show you the work." This is a red flag for hiring managers who want to evaluate visual and interaction design quality. The constraint of a firewall does not change the hiring manager's need — they still need to SEE the work. More text is not the answer; better visuals are.

**Correct alternative:** Replace every paragraph of description with a full-width screenshot + one-line caption. For flows and interactions, use short screen recordings (5-15s GIF), state progression sequences, or annotated walkthroughs. The reader should feel like they've used the product, even though they can't.

---

## CAP-008: Tool Logo Grids on About Page

**Status: ACTIVE**

**Trigger:** A grid of tool/technology logos (Figma, Sketch, Adobe XD, React, etc.) as a way to communicate skills.

**Why it's wrong:** Every product designer uses Figma. Listing tools communicates nothing about how you use them, at what depth, or in what context. A logo grid is visual filler that takes space from more meaningful content. It also dates quickly as tools change.

**Correct alternative:** Contextualize tools within project descriptions: "20 interactive graphics, each individually coded in React" tells the reader more about React proficiency than a React logo ever could. If skills must be listed, embed them in the metadata block of case studies (Role + Tools).

---

## CAP-009: Leading with Personal Photo/Bio Before Professional Relevance

**Status: ACTIVE**

**Trigger:** Homepage hero section that features a personal photo or long bio before any evidence of professional work.

**Why it's wrong:** The homepage is not the About page. The hiring manager's first 5 seconds are spent answering "What does this person do?" and "Is this relevant to my open role?" A personal photo answers neither question. The About page exists for personal context — after the visitor is already interested.

**Correct alternative:** Lead with positioning statement + project grid. Personal information belongs on the About page, which is a secondary conversion asset visited by hiring managers who are already engaged.

**Reference:** Joseph Zhang's homepage: Name → Title ("Interaction Designer") → Location → Teams list → Project grid. No personal photo in the hero.

---

## CAP-010: Overly Experimental Portfolio That Sacrifices Usability

**Status: ACTIVE**

**Trigger:** A portfolio with custom scroll behavior, abstract navigation, unconventional layouts, or creative experiments that make it harder for a hiring manager to find and evaluate case studies.

**Why it's wrong:** The portfolio itself is evaluated as a design artifact. A confusing, inaccessible, or slow portfolio is a silent case study that argues against the designer's judgment. Hiring managers evaluating 30+ portfolios will not spend time learning a novel navigation paradigm. The irony of a UX designer with poor portfolio UX is not lost on them.

**Correct alternative:** Clear navigation, obvious project hierarchy, fast load times, mobile responsiveness. The portfolio can have distinctive design details (typography, color, interaction polish) that show taste without compromising usability. Clarity plus distinctiveness outperforms experimental novelty.

---

## CAP-011: Title Inflation in Role Field

**Status: ACTIVE**

**Trigger:** Using a role title that implies a seniority level the designer didn't hold (e.g., "Lead Product Designer" when the actual title was "Design Intern" or "Junior Designer"), justified by the fact that they led the project.

**Why it's wrong:** Hiring managers verify claims. If the reference check reveals the candidate was an intern while the portfolio says "Lead Designer," the dishonesty undermines everything else in the portfolio — even the legitimate achievements. It also fails the specificity principle: if the role is inflated, what else might be? Trust, once lost, doesn't recover.

**Correct alternative:** Use the neutral functional descriptor that accurately reflects what you did without claiming a title you didn't hold. "Product Designer (sole designer)" communicates ownership and scope without inflating title. The scope statement carries the leadership signal: "As the sole designer, I redesigned..." says everything "Lead" would say, with the added credibility of being verifiably true. Never mention the word "intern" — it's a title that carries disproportionate negative signal. The strategy is omission of the limiting title, not inflation of a different one.

---

## CAP-012: Database Column Names as User-Facing Labels

**Status: ACTIVE**

**Trigger:** Using the Payload/database field name (e.g., "name", "url", "href", "period") directly as the user-visible label in an editing panel, form, or admin UI — without translating it to human-readable language.

**Why it's wrong:** Database field names are terse identifiers optimized for code, not comprehension. "name" doesn't tell the user whether it's a person's name, a company name, or a project name. "url" is technical jargon that many non-technical users don't recognize. When labels use internal names, the cognitive burden shifts to the user: they must infer purpose from context, which leads to errors (entering a date into a URL field, for example).

**Correct alternative:** Translate every field name to a specific, human-readable label that communicates exactly what to enter:
- `name` → "Company" (or "Person", "Project" — be specific)
- `url` → "Website (e.g., https://example.com)"
- `period` → "Time Period (e.g., 2023-Present)"
- `href` → "Link URL"
- `external` → "Opens in new tab"

For fields with non-obvious formats, add a help line or placeholder with an example. The label answers "what is this?"; the placeholder or help text answers "what format?"

---

## CAP-013: System Error Dumps as User-Facing Copy

**Status: ACTIVE**

**Trigger:** Displaying raw API error responses, JSON payloads, HTTP status codes, or internal field paths (e.g. `socialLinks.0.href`) directly to the user.

**Why it's wrong:** Users don't speak JSON. Error messages exist to help the user fix the problem — they need to know (1) what went wrong, (2) where, and (3) what to do. A raw error dump communicates none of these. It signals that the system was built for developers, not users. Even technical users find it disorienting because the internal naming conventions don't match the UI labels they see.

**Correct alternative:** Parse structured API errors and translate to natural language:
- Map internal field names to user-visible labels ("href" → "URL", "socialLinks.0" → "Link 1")
- Convert validation messages to plain statements ("This field is required" → "is required")
- Assemble into a single sentence: "Could not save — Link 1 → URL is required."
- Provide contextual fallbacks for auth errors ("session expired"), server errors ("try again in a moment")

---

## CAP-014: Ship Dates in Duration Field (Redundant Metadata)

**Status: ACTIVE**

**Trigger:** Using the Duration metadata field to display when a project shipped (e.g., "Shipped August 2022") instead of how long it took.

**Why it's wrong:** Duration and ship date serve different information jobs. The Duration field in the sidebar is scanned as metadata — the reader expects to calibrate project scope/velocity ("~3 months" signals a focused sprint; "18 months" signals a complex initiative). Ship dates are temporal context that belongs in the scope statement narrative. When the ship date appears in BOTH the duration field and the description, it's redundant — the same information occupies two slots, and the reader learns nothing new from the second occurrence.

**Correct alternative:** Use duration to communicate project length: "~3 months", "6 weeks", "Q2 – Q3 2022", "2024 – Present". Put ship dates in the description text where they provide narrative context. If both need to appear, they must say different things.

**Reference:** CF-004b → CF-010 progression (two rounds of feedback on the same field).

---

## CAP-015: Strategic Transparency Leak

**Status: ACTIVE**

**Trigger:** Including content in a case study that reveals meta-strategy (how you position yourself in the market, your hiring optimization framework, your competitive intelligence approach) rather than demonstrable craft (what you built, why you made specific design decisions, and what trade-offs you navigated).

**Why it's wrong:** A case study's job is to demonstrate capability and decision-making quality. Strategic frameworks — conversion funnels applied to hiring, probability models for recruiter behavior, competitive analysis methodologies — are valuable *because they're not public*. Publishing them doesn't showcase a design skill; it gives away an edge. The hiring manager reads a case study to evaluate "can this person do the job?" not "does this person know growth frameworks?" Revealing the meta-strategy also risks appearing manipulative rather than competent.

**Correct alternative:** Every case study section should pass the "does this showcase what I *built*?" filter. If the answer is "no, this showcases what I *know about positioning*," it doesn't belong. Replace with craft-oriented content: interaction patterns you designed, technical trade-offs you navigated, scaling decisions you made. Keep strategic frameworks as internal decision-making tools, not public portfolio content.

**Reference:** CFB-012 — "Portfolio as Product" replaced with "Interaction Choreography" because the former revealed HM conversion funnel strategy while the latter demonstrates actual design system interaction design.

---

## CAP-016: Feature-List Case Study (Showing WHAT Without WHY)

**Status: ACTIVE**

**Trigger:** A case study section that describes what was built, what tools were used, or what the output looks like — without explaining why those decisions were made, what alternatives were evaluated, or what trade-offs were accepted.

**Why it's wrong:** Feature lists are a junior signal (§6.1). "I built a token architecture using property·role·emphasis naming" tells the reader what happened. "I evaluated IBM Carbon's flat naming, Material Design's role tokens, and Goldman Sachs's property-first hierarchy, then chose property·role·emphasis because the name itself becomes machine-readable documentation for AI agents" tells the reader how this person thinks. Hiring managers at senior levels evaluate decision-making quality, not output volume. A case study that lists features reads like a project brief, not evidence of design leadership.

**Correct alternative:** Every case study section must answer "why I designed it this way" — not just "what I built." Structure: (1) what the problem or decision point was, (2) what alternatives were considered, (3) why this approach was chosen, (4) what trade-offs were accepted. The feature/output is supporting evidence for the decision, not the headline.

**Reference:** CFB-014 — Élan case study restructured from WHAT-focused ("Here's the token architecture") to WHY-focused ("I evaluated three naming conventions and chose property·role·emphasis because agents can parse it without a lookup table").

---

## CAP-017: AI-Generated Voice Tells

**Status: ACTIVE**

**Trigger:** Case study text that passes a factual review but fails the "read it aloud" test — the writing sounds machine-generated rather than human-authored.

**Why it's wrong:** Hiring managers read dozens of AI-polished portfolios. They have developed instincts for machine voice, even if they can't articulate the rules. Text that triggers these instincts undermines the "I did the thinking" signal the portfolio is built on. If the writing doesn't sound like the designer, the reader doubts the thinking behind it too. The tells are:

- **Passive voice clusters:** "The system was designed to..." instead of "I designed the system to..."
- **Hedging phrases:** "might," "could potentially," "we felt that," "it seemed like" — conviction killers
- **Symmetrical structures:** Three parallel clauses of identical length and rhythm — a signature of language model generation
- **Banned vocabulary:** "landscape," "realm," "multifaceted," "holistic," "innovative," "streamlined" (see `voice-style.md` §13.1)
- **Balanced emptiness:** Sentences that sound measured and articulate but communicate nothing specific
- **Telegram staccato:** The opposite extreme — every sentence under 8 words, creating a choppy rhythm that is equally artificial

**Correct alternative:** Mix sentence lengths. Lead with specifics, not abstractions. State choices as judgments ("I chose X because Y") not feelings ("We felt X might work"). Let a sentence breathe when the idea needs room. Read aloud: does it sound like a person with an opinion, or a machine summarizing?

**Reference:** Derived from the AI-sniff test (case-study-review.md, Check 3) and voice-style.md §13.1/§13.2. See also CFB-015 (agent conflated "explain WHY" with "write more").

---

## CAP-018: Blurb That Summarizes Instead of Teasing

**Status: ACTIVE**

**Trigger:** An intro blurb that reveals the solution, process, or specific design decisions — functioning as a project summary rather than a trailer. If the reader can understand how you solved the problem from the blurb alone, the blurb has given away too much.

**Why it's wrong:** The blurb's job is to create an information gap that makes the reader scroll. A summary closes that gap. "I redesigned the review workflow by introducing exception-driven filtering that grouped errors by type" is a summary — the reader now knows the solution and has less reason to keep reading. The blurb should show the stakes and flash the outcome but withhold the mechanism entirely.

**Correct alternative:** Show the situation tension (rhetorical "you," constraints, scale), flash the outcome in the closer ("cut 12,000 lines to 560"), and hide the how. The how is the case study itself. See `case-study.md` §3.7 for full blurb rules.

**Reference:** Check 11 in `case-study-review.md`.

---

## CAP-019: Credential Performance (Editorializing Outcomes)

**Status: ACTIVE**

**Trigger:** Copy that editorializes about the difficulty or impressiveness of the work, or draws conclusions the reader should reach independently. This is NOT about hiding achievements — outcomes, metrics, and credentials must be front-loaded (time-to-value is non-negotiable). The anti-pattern is adding commentary ON TOP of the fact.

**Why it's wrong:** Editorializing outcomes is mass-market positioning. Luxury positioning states the fact and trusts the reader to be impressed. "Review time dropped from 80 minutes to 8" is a powerful credential. Adding "which was a significant achievement" weakens it — the commentary signals that the writer doesn't trust the fact to speak for itself. Credential performance ("I had the unique opportunity to lead this massive initiative") is the written equivalent of nervous laughter after a good joke.

**Correct alternative:** State the outcome as a fact and stop. "Review time dropped from 80 minutes to 8." The reader does the math. The fact itself is the credential; commentary cheapens it. See `case-study.md` §3.8 for the Luxury Positioning Principle.

**Specific tells to watch for:** "which was a significant achievement," "requiring innovative thinking," "I had the unique opportunity to," "demonstrating my ability to drive efficiency," "a massive undertaking," "proving that I could."

**Reference:** Check 12 in `case-study-review.md`.

---

## CAP-020: Buzzword Misapplication

**Status: ACTIVE**

**Trigger:** Using an AI or technical systems term in a case study that does not pass all three gates of the technical vocabulary test (structural match, evidence gate, terminology accuracy) defined in `technical-framing.md` §16.1.

**Why it's wrong:** A hiring manager who knows the term will immediately see the mismatch. Calling a filtered list "AI-powered curation" or a standard search feature "RAG-enabled retrieval" doesn't signal fluency — it signals either ignorance or dishonesty. Both are disqualifying at senior level. This is the technical equivalent of credential performance (CAP-019): the term itself should be the credential, not your commentary about it. A misapplied buzzword is worse than no buzzword — it raises the question of what else in the portfolio is overstated.

**Correct alternative:** Run the three-gate test. If all gates pass, use the term prominently and let it speak for itself. If only gate 1 passes (structural parallel), use the authentic parallel technique: "This exception-driven review system uses the same pattern as human-in-the-loop AI verification." If no gates pass, do not use the term. Silence is luxury; misapplication is mass market.

**Reference:** Check 13 in `case-study-review.md`. Full vocabulary and test in `technical-framing.md` §16.

---

## CAP-021: Claiming AI Agent Work as Designer Expertise

**Status: ACTIVE**

**Trigger:** Writing a case study about an AI-collaborative project that presents engineering fixes (cache invalidation, hydration mismatches, build errors) as designer decisions.

**Why it's wrong:** A designer cannot credibly claim they personally resolved Turbopack cache invalidation or React hydration mismatches — those are the AI agent's execution domain. When a hiring manager reads "I fixed the SSR hydration mismatch," they expect the designer to explain the technical fix. If the designer can't, the credibility of the entire case study suffers. The designer's contribution in AI-collaborative work is the SYSTEM — naming conventions, feedback architecture, escalation paths, documentation structure. That's the design work.

**Correct alternative:** Distinguish between what the designer decided (system architecture, naming conventions, feedback routing, visual rules) and what the AI agent executed (bug fixes, build configuration, infrastructure debugging). Frame engineering improvements as evidence that the designer's system WORKS, not as the designer's direct achievement. "The agent fixed spacing issues 15 times before the system encoded a spacing rule" positions the designer as architect, not debugger.

**Reference:** CFB-021 (2026-04-04) — Élan case study rebuild pivoted from engineering-centric to design-system-centric framing.

---

## CAP-022: Em Dash Usage

**Status: ACTIVE**

**Trigger:** Using the em dash character (U+2014) anywhere in case study text, blurbs, scope statements, section bodies, or captions.

**Why it's wrong:** Em dashes are an AI voice tell. Language models default to em dashes as a stylistic device because they are standard in formal English typography. In this portfolio's voice, em dashes read as machine-generated and break the conversational register. The project voice style (`docs/content/voice-style.md` line 73) explicitly bans them: "Em dashes: never. Use a regular dash - like this. Max one per section."

**Correct alternative:** Use a regular hyphen-minus surrounded by spaces ( - ) for parenthetical asides. Prefer splitting into two sentences or using a comma when possible. Max one dash per section to avoid staccato rhythm.

**Reference:** CFB-022 (2026-04-04). Agent used em dashes across every section of the Élan case study despite the rule existing in voice-style.md. Violated 6+ times in a single writing pass.

---

## CAP-023: Voice Flattening During Refinement

**Status: ACTIVE**

**Trigger:** Taking a user-provided raw draft that is vivid, specific, and personal, and "refining" it into text that is grammatically correct but stripped of the original's energy - fragment rhythm replaced with full sentences, cultural references generalized, rhetorical questions converted to declarative statements.

**Why it's wrong:** The user provides raw draft text precisely because the AI's first draft lacked personality. If the refinement step sands down the personality the user injected, the workflow produces no net improvement - the system oscillates between "too clinical" (AI draft) and "too rough" (user draft) without reaching "vivid and polished." The user's voice IS the value; refinement should preserve it.

**Correct alternative:** Apply the two-tier constraint model from `personal-voice.md` Part C. Enforce Tier 1 constraints (banned words, em dashes, thesis coherence, word counts). Yield to the user's voice on Tier 2 elements (fragment density, rhetorical questions, cultural references, informal grammar). Run the voice-flattening test after refinement.

**Reference:** Elan case study overhaul (2026-04-04) - system acknowledged user's draft was better, then produced a refinement that reintroduced em dashes and flattened the register.

---

## CAP-024: Divider Overuse Between Narrative Sections

**Status: ACTIVE**

**Trigger:** Placing `<hr>` divider blocks between every feature section in a case study, or defaulting `showDivider` to true in `createCaseStudyBlocks` calls.

**Why it's wrong:** Dividers signal structural zone boundaries (intro-to-article, article-to-navigation), not chapter breaks within a continuous narrative. Overuse fragments the reading flow, creates visual stop signs that discourage scrolling, and contradicts the cohesive story structure from `narrative-arc.md`. From a UX and content strategy perspective, sections within a case study are telling one story - the divider line signals "this is a separate thing" and breaks the reader's momentum.

**Correct alternative:** Use whitespace (CSS adjacent-sibling margin on headings, 48px) for inter-section separation. Reserve the divider for the single boundary between the intro blurb (hook) and the article body (scope statement onward), which is rendered by the template itself (not authored as a content block). See `case-study.md` section 3.9.

**Reference:** User feedback (2026-04-04) - identified divider lines as "too much" and "abused," creating friction that stops readers from enjoying the narrative arc.

---

## CAP-025: Floating Metric

**Status: ACTIVE**

**Trigger:** A hero metric that appears in the visual scan zone (blurb headline, hero area, or scope statement) without a derivation or anchor visible within the scope statement or blurb body closer. The metric type determines what "floating" means:

- **Derived metric** (percentage, multiplier, ratio - "58%", "2x"): Floating when the before/after absolutes or measurement basis are not visible in the scan window.
- **Self-anchoring metric** (absolute before/after - "12,000 lines to 560"): Floating when the measurement domain is ambiguous. The math is self-evident; domain context must not be missing.
- **Behavioral observation** ("users stopped verifying line by line"): Floating when there is no temporal or observational anchor ("within six weeks", "across N users").

**Why it's wrong:** Impressive numbers without derivation trigger a "how did they calculate this?" reflex in skeptical readers. The number becomes a trust liability instead of a credibility anchor. Even absolute reductions fail if the reader cannot tell what was measured. The scan window (0-60s) is the only window where anchoring matters - if the reader moves past it without verification, the metric was either trusted (anchored) or discounted (floating).

**Correct alternative:** Ground every hero metric within the scan window. For derived metrics, show the before/after absolutes or measurement basis in the scope statement (Zone 2). For self-anchoring metrics, ensure domain clarity. For behavioral observations, add a temporal anchor. The reader's own verification is more convincing than the writer's claim.

**Cross-reference:** `case-study.md` section 3.3 describes the construction pattern for metric derivation anchors. Check 17 in `case-study-review.md` is the compliance test.

---

## CAP-026: Employment Classification Signal

**Status: ACTIVE**

**Trigger:** Portfolio text that reveals or implies an employment type that would undermine seniority positioning - specifically: internship, contract, part-time, junior-level classification.

**What does NOT trigger this pattern:** Employment types that signal scope or ownership are positioning assets, not liabilities. "Founding designer," "sole designer," "first design hire" communicate decision authority - use them prominently. "Personal project" is context-dependent - fine for projects demonstrating ongoing system work, not for framing that reads as "hobby."

**Why it's wrong:** "Intern project" triggers a mental discount regardless of the project's actual complexity. When work demonstrates senior-level thinking, a diminishing employment label contradicts the evidence. Cognitive dissonance resolves against the candidate. The reader won't think "impressive intern" - they'll think "just an intern project."

**Correct alternative:** Functional descriptors: "Product Designer (sole designer)" not "Design Intern." "7 weeks" not "summer internship." Employment context is interview-only disclosure. See the Portfolio Coherence Manifest (`docs/content/portfolio-coherence.md`) for the employment context tracking field.

**Scope:** All portfolio text. Does NOT apply to interview prep notes (`docs/content/projects/{slug}-interview.md`), where honest disclosure is mandatory.

---

## CAP-027: Fragment Chain as Default Prose

**Status: ACTIVE**

**Trigger:** Section body or blurb body where the majority of sentences are standalone fragments (under 5 words) without a setup sentence that gives them context. Distinct from deliberate staccato punches, which follow a full sentence and land as punchlines.

**Why it's wrong:** Fragment chains are an AI voice tell. They create the impression of compressed authority but actually read as a database printout. When every sentence is a fragment, no sentence has impact - the rhythm flatlines. Human readers expect cause-and-consequence flow; a chain of "Sixteen skills. Three feedback loops. An escalation protocol." communicates a list, not an argument. Extends CAP-017 (AI-Generated Voice Tells).

**Correct alternative:** Weave lists into narrative sentences: "The meta-system has 16 skills routing corrections, three feedback loops encoding them as rules, and an escalation protocol deciding when a rule needs teeth." Use fragments only as punchlines after setup: "Not the food. The chart." (Lacework - setup is the section title "Donut. Avoid at All Cost."). A fragment chain is only acceptable when answering a question posed in the preceding sentence (e.g., Meteor blurb: "How do you design software that moves $79B? As the only designer. No PM.").

**Reference:** CF-022. Elan v3 initial draft had fragment chains in all three section bodies and the blurb. Rewrite wove fragments into narrative sentences.

---

## CAP-028: Technique-as-Posturing

**Status: ACTIVE**

**Trigger:** Applying named voice techniques (T11-T15) in a way that positions the author above peers or the reader, rather than as honest process description. Common symptoms:
- Industry judgment: "everyone is solving the wrong problem," "the whole conversation looks the same"
- Secret knowledge: "the part you can't see," "what I actually designed"
- False modesty about own deliverables to imply being above the work: "they exist, they work fine"
- Abstracting personal agency into architectural language: "the system promoted it to a hard gate" instead of "I made it mandatory"

**Why it's wrong:** The reference writing sample ("I'm a decent engineer. Not the best.") works because it's humble about self and trusts the reader. It never positions itself above anyone's approach. Techniques like Identification (T11), Anti-Sell (T13), and Closed-Loop (T15) are powerful when they emerge from honest narration of what happened, but become condescending when used to frame what others are missing. "I built one with the agent" is honest. "The whole conversation looks the same: a motor strapped to a carriage" is judgment dressed up as insight.

**Correct alternative:** Describe your process honestly. Concede real costs. Let the reader draw conclusions. Use "I" as a person who made choices (not an author who sees what others don't). Compare: "The agent didn't get smarter. The rules just accumulated what I kept fixing." (honest, reader arrives at insight) vs. "That shift is what compounding looks like." (telling the reader what to think).

**Reference:** CF-024. Elan v3 tone rewrite applied T11/T13/T15 as rhetorical positioning. User response: "reads like a dick." Full rewrite adopted the reference sample's register: humble, real, process-first.

---

## CAP-029: Parallel-Structure Encyclopedia

**Status: ACTIVE**

**Trigger:** When covering N items (framework elements, design principles, features), the output is N identical mini-essays with the same beat pattern: definition, theory, external example, "in my system." Each block is structurally identical to the previous one. The reader gets the pattern by the second item and skims the rest.

**Why it's wrong:** It reads like compilation, not writing. No human writes four consecutive blocks with the same structure. It signals the author organized information into a template and filled it in four times, which is exactly what an AI does when asked to "cover each element." The voice disappears because the structure is doing all the work. Additionally, external examples the writer has no personal stake in (medical AI, legal contracts, autonomous vehicles) read like Wikipedia summaries and create spectator distance.

**Correct alternative:** Refuse the parallel structure. Let items emerge from narrative where they are needed. "The first question users asked, every time: why did you flag this row?" introduces explainability through what happened, not through a definition block. If all N items need coverage, vary the beat pattern per item - one gets a full paragraph, another gets two sentences, a third emerges as a surprise in a story about something else. External examples must be earned (the writer was in the room, not reading about it).

**Reference:** CFB-034. ETRO essay Section 2 had four identical blocks (Explainability, Traceability, Reversibility, Observability) each following theory -> external example -> "In the system I built, this looked like..." Collapsed from ~1,200 words to ~450 by introducing each element through what actually happened.

---

## CAP-030: Inline Bold Imported From Source Markdown

**Status: ACTIVE**

**Trigger:** Materializing a user-supplied markdown essay/case-study draft into CMS blocks and preserving the source's `**bold**` spans verbatim. Source markdown (written for Medium/Substack/Notion/Google Docs rendering) commonly uses inline bold as scan-anchor typography - bolded leads, emphasized conclusions, bolded sub-labels like "Per user.", "Scaffolding.", or "What happens next?" When imported raw into `bodyMarkdown` strings, these survive the `markdownToLexical` conversion as FORMAT_BOLD text nodes and render as `<strong>` at body weight 700.

**Why it's wrong:** Two reasons - one hard, one soft.

Hard: `voice-style.md` §13.1 is explicit - "Bold: only for section headings and impact metrics. Never in body text for emphasis." The portfolio design system's typography contract reserves weight jumps for the H2 section heading (semibold at xl size). The contract is the only thing making section rhythm legible.

Soft: the user perceives it as "hierarchy not visually clean" or "I can't see where sections start." Inline bold at body size reads as a visual peer of the semibold H2 one unit up. N bold spans per section create N+1 competing dominant stops, so the H2 loses its role as the top of the section. The complaint will present as a section-separation problem but the fix is inside each paragraph, not in the gaps.

**Correct alternative:** During materialization, strip every `**bold**` from `bodyMarkdown`. Replace according to the bold's function in the source:
- Scan-anchor label ("Per user.", "Scaffolding.") → colon-prefixed paragraph start ("Per user:", "Scaffolding:")
- Tonal emphasis of a full sentence → plain prose (the sentence break is its own anchor)
- Italicized feel → convert to `*italic*` (voice-style bans bold, not italic)
- Purely typographic habit with no structural role → drop it

Bold survives only on H2/H3 heading blocks (the `heading` block type, not inline `###` in bodyMarkdown) and on impact metrics. Running a `\*\*` regex on every `update-*/route.ts` file is a 2-second parity check - any match is this pattern.

Also do NOT use inline `###` headings inside a richText `bodyMarkdown`. `src/lib/lexical.ts::lexicalToHtml` does not emit heading HTML tags - when a Lexical root has mixed heading+paragraph children, it silently drops the heading entirely. Use separate `heading` blocks (with `level: 'h3'`) or convert to a paragraph with an emphatic lead.

**Reference:** FB-143 / CFB-036. ETRO essay was materialized from source with 36 inline bold spans preserved; user perceived it as "bold abuse" + unclear section hierarchy in a single complaint. Stripping all 36 fixed both perceptions without changing spacing, heading levels, or any structural layout. Other `update-*/route.ts` files (elan, lacework, meteor) had zero bolds - ETRO was the only essay materialized from raw user markdown, which is precisely when this pattern appears.

---

## CAP-031: Chronological Case-Study Order

**Status: ACTIVE**

**Trigger:** The integer `order` on each project in the CMS was set when the project's `src/app/(frontend)/api/update-*/route.ts` was scaffolded, and never revisited. New case studies default to the next available integer instead of being explicitly ranked against the existing set. Over time the home page orders cases by *authoring date* instead of by *narrative priority*, and the strongest piece is not the one the reader sees first.

**Why it's wrong:** The home page case-study grid is a funnel. Most visitors read the first card carefully, the second with less attention, and bounce before the third. Whichever case study holds `order: 1` is doing the load-bearing work of the whole portfolio. Letting that slot be determined by "which project was migrated into the CMS first" is a category error: the sequence in which the author built out the CMS has nothing to do with which project best demonstrates their ceiling to a hiring manager. The consequence is slow — nothing breaks visibly — but the portfolio underperforms because the strongest proof of scale (biggest scope, sole designer, largest team, largest dollar surface) sits behind weaker pieces.

**Correct alternative:** Treat `order` as a narrative-priority decision, not a timestamp. Before shipping any new case study, answer: "If a reader opens only the first case study on my home page, which of my projects gives me the highest chance of earning the next click?" That project takes `order: 1`. The rest descend by impact (scope × rarity × scale × recency). When a new case study is added, the authoring flow MUST explicitly re-rank — either claim a position and shift the others, or take the bottom. Never silently append at the next integer.

Operational check: `rg "order: \d+" src/app/\(frontend\)/api/update-\*/route.ts` lists the current ordering in one command. If the sequence does not reflect the narrative ranking the author would give out loud, the ordering is stale.

**Reference:** CFB-038 / ENG-168. As of Mar 30 – Apr 19 2026, Lacework held `order: 1` (first CMS-migrated case study), Élan `order: 3`, Meteor/Goldman Sachs `order: 3` (tied). Meteor is the highest-scope case study in the portfolio ($79B AUM, sole designer, nine engineers, three time zones) and was buried at position 3 for ~21 days because nobody re-ranked after adding it. Fixed 2026-04-20: Meteor → 1, Lacework → 2, Élan → 3.

---

## CAP-032: Redundant Noun in Labelled Count

**Status: ACTIVE**

**Category:** UX Microcopy

**Trigger:** A count badge or metadata label repeats the noun that the section heading already provides. Common forms: "6 skills" under a "SKILLS" heading, "3 items" inside a list labeled "Items", "12 results" when the container is already titled "Search results."

**Why it's wrong:** The count exists to quantify. The noun exists to categorize. When the heading already names the category, the noun in the count is pure redundancy — it adds character count and reading weight without adding information. The reader must parse "6 skills" as "6 [of the things already named above]" — the bracketed clause does real cognitive work, and the visible word "skills" does none of it. In dense UI surfaces (tables, filter chips, stat rows, card headers), redundant nouns are a leading cause of visual noise.

**Correct alternative:** Strip the noun. Let the count be a bare number. The heading supplies the category; the number supplies the quantity. Together they are complete. Separately they carry their own weight.

- Bad: `ITERATION  3 skills` (column header followed by count with noun)
- Good: `ITERATION  3` (column header, bare count)
- Bad: `16 results found` under a "Search results" heading
- Good: `16` in a results-count badge next to the heading

**When a noun IS appropriate:** When the count is displayed without a labeling heading — in isolation, in a sentence, or in a cross-category summary (e.g. "3 design skills, 2 engineering skills"). In that case the noun is necessary for disambiguation, not redundancy.

**Applies to:** All count badges, stat chips, column headers, section subtitles, and filter counts in the main site, playground, and ASCII Studio. When authoring any new design that shows a numeric count, ask: "Does a parent label already name the thing being counted?" If yes, drop the noun.

**Reference:** FB-201 (2026-04-25). Élan SkillMap `categoryCount` displayed `{count} skills` inside a column header already labeled "ITERATION / QUALITY / OPERATIONS". Stripped to bare `{count}`.

---

## Entry Template

```markdown
## CAP-NNN: [Short Name]

**Trigger:** [What content pattern triggers this]

**Why it's wrong:** [The strategic and perceptual reason]

**Correct alternative:** [What to do instead]

**Reference:** [Optional — example from competitive analysis]
```
