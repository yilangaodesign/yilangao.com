# Content Anti-Patterns

> **What this file is:** A catalog of content mistakes that weaken portfolio effectiveness, documented so they are never repeated. Each anti-pattern includes the trigger, why it's wrong, and the correct alternative.
>
> **Who reads this:** AI agents before writing or editing portfolio content — scan for relevant anti-patterns.
> **Who writes this:** AI agents when a content feedback cycle reveals a new anti-pattern.
> **Last updated:** 2026-03-29 (initial creation from competitive analysis)

---

## CAP-001: Process-First Case Study Narrative

**Trigger:** Opening a case study with "First we did research, then we ideated, then we prototyped, then we tested..."

**Why it's wrong:** Every designer follows a process. The process itself is not the differentiator — the *thinking within the process* is. A hiring manager scanning 30+ portfolios has seen the double diamond diagram dozens of times. Process-first narratives bury the actual signal (decisions, trade-offs, outcomes) under methodology that the reader already assumes you follow. By the time the interesting parts arrive, the reader has already bounced.

**Correct alternative:** Lead with the problem and the outcome (inverted pyramid). If process is relevant, embed it as context within feature sections: "We discovered through prototype testing that users expected X, so we pivoted to Y." The process is supporting evidence, not the headline.

**Reference:** Neither Joseph Zhang nor Ryo Lu include any process sections in their case studies. Zero instances of "Research → Ideate → Prototype → Test" across 8+ case studies analyzed.

---

## CAP-002: Generic Positioning Statement

**Trigger:** Using phrases like "I design delightful experiences", "I'm a passionate UX designer", "I create user-centered solutions", or any tagline that could describe every designer on earth.

**Why it's wrong:** These are the portfolio equivalent of a SaaS homepage saying "We help businesses grow." They are true of everyone and therefore signal nothing. A hiring manager reading this learns nothing about what kind of designer you are, what problems you solve, or whether you're relevant to their open role. Generic positioning fails the 10-second clarity test — the visitor cannot tell if this portfolio is worth their time.

**Correct alternative:** A specific positioning statement that narrows the field:
- "Product designer specializing in B2B SaaS growth and activation"
- "Interaction Designer" (Joseph Zhang — specific discipline, not generic "UX/UI")
- "I design software with the belief it's one of the most malleable mediums we have" — specific philosophy, not generic aspiration

---

## CAP-003: Screenshot Gallery Without Narrative Context

**Trigger:** A page full of screenshots with no text explaining what the reader is looking at, why it matters, or what decisions it represents.

**Why it's wrong:** Visuals matter, but they are evidence, not the argument. A hiring manager looking at 15 uncontextualized screenshots cannot distinguish "this person shipped impressive work" from "this person took screenshots of someone else's work." Without 1-3 sentences of framing per section, the reader can't evaluate the designer's thinking — only their visual output.

**Correct alternative:** Every cluster of images needs a brief label (1-3 sentences) that names the design intent, one interesting detail, or the business context. The text is not an explanation — it's a lens that tells the reader what to notice in the images.

---

## CAP-004: Vague Impact Claims

**Trigger:** "Improved the user experience", "Increased engagement", "Made it easier to use", or any impact statement that cannot be verified or compared.

**Why it's wrong:** If you cannot be specific, the hiring manager assumes you don't have real metrics — or worse, that the impact was negligible. Vague claims read as padding. They also fail the seniority calibration test: junior designers say "the client was happy"; senior designers say "activation time dropped 30% in the first month."

**Correct alternative:** Quantitative if possible, specific qualitative if not:
- "Scaled from beta to over +1,000,000 users" (Joseph Zhang, Skiff)
- "Set the record for the most expensive skateboards sold in history" (Joseph Zhang, Azuki)
- "Acquired by Notion" (Joseph Zhang, Skiff — the acquisition IS the impact)
- If no metrics: describe the specific qualitative outcome honestly. "Reduced the admin's three-step approval workflow to a single confirmation" is better than "improved the workflow."

---

## CAP-005: Overloaded Project Count

**Trigger:** Featuring 8-15 projects on the homepage, including uneven quality or projects from significantly different career stages.

**Why it's wrong:** An exhaustive project list signals "I included everything" rather than "I chose what's most relevant." It's the equivalent of a feature-bloated product page. The hiring manager must now evaluate which projects are worth clicking — a job the designer should have done for them. Weak projects dilute the signal from strong ones.

**Correct alternative:** 3-5 curated projects, each with a clear reason for inclusion. If you have more good work, you can add a secondary "Other Work" section below the fold, but the primary grid should be tight and intentional.

---

## CAP-006: Burying the Lede

**Trigger:** A case study that opens with 2-3 paragraphs of company background, team structure, or problem context before stating what was actually designed and what happened.

**Why it's wrong:** The hiring manager's internal monologue at 15-60 seconds is: "What was the problem? What was this person's role? Did they ship it?" If the answer to these questions is below the fold, the reader may never reach it. The engagement window is 15-60 seconds — context must be compressed, not expanded.

**Correct alternative:** The scope statement (first 2-4 sentences) must simultaneously provide company context, ownership claim, and impact signal. Background detail goes in feature sections, not the opening.

**Reference:** Joseph Zhang's Skiff intro is 3 sentences and covers: company (productivity, E2EE), role (led design, first hire), scale (+1M users), and outcome (acquired by Notion). No separate "Background" section exists.

---

## CAP-007: Explaining Instead of Showing for Internal Tools

**Trigger:** Writing 3-4 paragraphs describing what an internal tool does because the reader can't access it, instead of showing high-fidelity screenshots and annotated walkthroughs.

**Why it's wrong:** Text-heavy descriptions of internal tools read as "I can't show you the work." This is a red flag for hiring managers who want to evaluate visual and interaction design quality. The constraint of a firewall does not change the hiring manager's need — they still need to SEE the work. More text is not the answer; better visuals are.

**Correct alternative:** Replace every paragraph of description with a full-width screenshot + one-line caption. For flows and interactions, use short screen recordings (5-15s GIF), state progression sequences, or annotated walkthroughs. The reader should feel like they've used the product, even though they can't.

---

## CAP-008: Tool Logo Grids on About Page

**Trigger:** A grid of tool/technology logos (Figma, Sketch, Adobe XD, React, etc.) as a way to communicate skills.

**Why it's wrong:** Every product designer uses Figma. Listing tools communicates nothing about how you use them, at what depth, or in what context. A logo grid is visual filler that takes space from more meaningful content. It also dates quickly as tools change.

**Correct alternative:** Contextualize tools within project descriptions: "20 interactive graphics, each individually coded in React" tells the reader more about React proficiency than a React logo ever could. If skills must be listed, embed them in the metadata block of case studies (Role + Tools).

---

## CAP-009: Leading with Personal Photo/Bio Before Professional Relevance

**Trigger:** Homepage hero section that features a personal photo or long bio before any evidence of professional work.

**Why it's wrong:** The homepage is not the About page. The hiring manager's first 5 seconds are spent answering "What does this person do?" and "Is this relevant to my open role?" A personal photo answers neither question. The About page exists for personal context — after the visitor is already interested.

**Correct alternative:** Lead with positioning statement + project grid. Personal information belongs on the About page, which is a secondary conversion asset visited by hiring managers who are already engaged.

**Reference:** Joseph Zhang's homepage: Name → Title ("Interaction Designer") → Location → Teams list → Project grid. No personal photo in the hero.

---

## CAP-010: Overly Experimental Portfolio That Sacrifices Usability

**Trigger:** A portfolio with custom scroll behavior, abstract navigation, unconventional layouts, or creative experiments that make it harder for a hiring manager to find and evaluate case studies.

**Why it's wrong:** The portfolio itself is evaluated as a design artifact. A confusing, inaccessible, or slow portfolio is a silent case study that argues against the designer's judgment. Hiring managers evaluating 30+ portfolios will not spend time learning a novel navigation paradigm. The irony of a UX designer with poor portfolio UX is not lost on them.

**Correct alternative:** Clear navigation, obvious project hierarchy, fast load times, mobile responsiveness. The portfolio can have distinctive design details (typography, color, interaction polish) that show taste without compromising usability. Clarity plus distinctiveness outperforms experimental novelty.

---

## Entry Template

```markdown
## CAP-NNN: [Short Name]

**Trigger:** [What content pattern triggers this]

**Why it's wrong:** [The strategic and perceptual reason]

**Correct alternative:** [What to do instead]

**Reference:** [Optional — example from competitive analysis]
```
