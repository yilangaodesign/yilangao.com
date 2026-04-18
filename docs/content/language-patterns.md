# §5. Language Patterns

### 5.1 The Scope Claim

Active voice. Specific. Ambitious but defensible.

| Weak | Strong |
|---|---|
| "I was asked to redesign the dashboard" | "I identified that dashboard engagement was dropping and proposed a redesign" |
| "I worked on the design" | "I led design for the marketing site relaunch, a 2.5-month project" |
| "We made an app" | "We designed the Elementals reveal experience to be full of anticipation and delight" |

### 5.2 The Feature Section Text

Section text has two jobs: (1) frame what the images show, and (2) carry the argument images can't convey (strategy, trade-offs, alternatives). Visual points: image leads, text frames. Strategic points: text leads (the decision is the work). Each sentence should do one of four things:

1. **Name the design intent:** "full of anticipation and delight", "feel luxurious and high-fashion"
2. **Describe one specific interesting detail:** "Every time someone clicks the white rabbit, a new quote is generated via ChatGPT"
3. **Establish context:** "marks one of the first high-profile streetwear partnerships between a web3 company and high fashion"
4. **State a trade-off or alternative considered:** "We could serve both user groups or serve one well. We chose one."

**Hard limit: 3-6 sentences per section body (max 3 per paragraph).** Whitespace between paragraphs is mandatory. If an interactive visual or image already demonstrates the point, the text must not restate it. "Adding rationale" does not mean "adding sentences" — it means replacing vague sentences with specific ones. (This reverses CFB-015 enforcement. The ratio model shifted from 80/20 to 60/40. The CFB-015 behavioral correction still applies: "adding rationale" = replacing vague sentences with specific ones, not padding with filler.)

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

### 5.6 Voice & Style Cross-Reference

For expanded sentence rules, banned/preferred words, punctuation policy, metric
handling, caption craft, and authoring-mode voice posture, see
[`docs/content/voice-style.md`](voice-style.md). The rules in §5.1-§5.5 above
and §13 are complementary - language patterns define *what to write*; voice &
style defines *how to write it*.

### 5.7 The Section Title

Section titles (2-5 words) are compressed arguments, not content previews. A
strong title works as a standalone interesting statement even without the body
text below it.

| Weak (Preview) | Strong (Argument) | Technique |
|---|---|---|
| "Five Layers to Three" | "Five Matryoshkas Deep" | Object Substitution (T6) |
| "Why Not Just Keep Tableau" | "Build Instead of Buy" | Framework Inversion (T7) |
| "Reading the Speedometer" | "Donut. Avoid at All Cost." | Verdict + Staccato (T8 + modifier) |
| "Improving the Dashboard" | (too generic to fix - needs sharper material) | N/A |

**The Standalone Test:** Remove the section body text. Read only the title.
Does it make you curious what the argument is? (Argument title - pass.) Or does
it make you predict what the section explains? (Preview title - fail.)

- "Five Layers to Three" = preview. Numbers describe a transformation but give
  away the conclusion. Needs the body to be interesting.
- "Build Instead of Buy" = argument. The reader knows the stance, wants to know
  the reasoning. Works standalone.
- "Reading the Speedometer" = preview. Describes what the section is about.
  Functional, not magnetic.
- "Donut. Avoid at All Cost." = argument. A judgment that provokes curiosity.
  Works standalone.

Section titles and blurb headlines (6-10 words) are different beasts. This
pattern covers section titles. Blurb headlines are now also the homepage card
title (the official case study title), which raises the stakes on headline
quality - they must work both as a case study opener and as a masonry grid hook.
For blurb headline techniques (Protagonist Framing, Verdict-as-Headline at
longer range), see `case-study.md` section 3.7. For the full technique library,
see `personal-voice.md` Techniques 6-10.
