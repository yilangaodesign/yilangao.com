# Branding Reference — yilangao.com

> Spoke file for `docs/design.md`. Return to the [hub](../design.md) for the Section Index.
>
> **What this file is:** The canonical branding identity reference for the portfolio website (yilangao.com). Every agent working on the main site MUST read this before generating UI, components, or page layouts.
>
> **Scope:** Main site only (`src/app/(frontend)/(site)/`). Does NOT apply to the Playground, ASCII Art Studio, or admin UI.
>
> **Last updated:** 2026-04-10 (initial creation)

---

## 1. Zero Corner Radius

The portfolio website uses **zero border-radius on all elements**. This is a core branding decision, not a component-level detail.

### 1.1 The Rule

| Element | Border-radius | Notes |
|---------|--------------|-------|
| Cards, containers, sections | `0` | No rounding whatsoever |
| Buttons | `0` | Already default (`shape="default"` = 0px) |
| Inputs, textareas, selects | `0` | Override any DS default that adds radius |
| Images, media | `0` | No rounded corners on thumbnails or media |
| Badges | `0` | Use `shape="squared"` — see §1.2 |
| Tooltips, popovers | `0` | Strip any inherited radius |
| Modals, dialogs | `0` | Full sharp corners |
| Code blocks | `0` | No rounding |
| Nav items, links | `0` | No rounding on hover/active states |

### 1.2 Badge Component

The Badge component defaults to `shape="pill"` (fully rounded). **On the portfolio website, always use `shape="squared"`** and ensure the squared variant renders at `0` radius, not `rounded-sm`.

If the Badge `squared` shape currently maps to `var(--portfolio-radius-sm)` (2px), override it to `0` for the portfolio context.

### 1.3 Exceptions

Corner radius is permitted ONLY for elements where the shape is structurally meaningful and removing it would break recognition:

- **Avatars** — circular shape is part of the "avatar" affordance
- **Progress bars** — pill shape communicates fill semantics
- **Toggle switches** — rounded track/thumb is the standard toggle affordance
- **Spinners/loaders** — circular by nature

Everything else: **zero radius, no exceptions**.

### 1.4 Why

Sharp edges communicate precision, intentionality, and a modernist design sensibility. The zero-radius identity distinguishes the portfolio from the soft, rounded aesthetic common in consumer and template-based sites. It signals that every pixel is deliberate.

---

## 2. Brand Position and Personality

### 2.1 Position

**Yilan Gao is an AI-native designer whose practice sits at the boundary between automation and human judgment.**

She designs for environments where AI has real consequences - where the decisions being automated move money, affect investigations, commit resources, or shape how experts do expert work. She is not a UI designer who happens to work on AI products. She is a designer whose craft is built around the specific problem of how humans and AI systems should share responsibility for decisions that matter.

One-sentence: "I design AI-native products for environments where the stakes are real, and my work lives on the boundary where friction becomes a feature and transparency becomes noise."

One-phrase: "Friction as a feature. Transparency as noise."

One-word: "Judgment."

Every positioning choice on the site is a variation on this single claim. The brand is coherent when every element points at "judgment on the boundary of automation" and incoherent when any element drifts toward generic framing (design, UX, product, AI in general).

### 2.2 Five Personality Stances

The brand personality is a set of stances the brand takes when faced with common situations.

1. **Confident but not declarative.** States positions and defends them without shouting. The confidence comes from having considered the version where the position isn't true. Shows up as parenthetical asides, steelmanned counterarguments, occasional deliberate concessions. Failure mode avoided: thought leadership as performance.

2. **Specific, not abstract.** Reaches for the specific example, not the general principle. "How do you design software that moves $79B in assets daily? As the only designer. No PM." contains four specific facts. The generic version conveys nothing. Failure mode avoided: "user-centered," "iterative," "human-centered," "delightful" - words that contain no information.

3. **Opinionated without being contrarian.** Opinions are earned from having tried the convention and found it wanting in a specific, nameable way. Failure mode avoided: the hot-take voice, the "unpopular opinion:" voice - contrarianism as content strategy.

4. **Warm without being soft.** Interfaces are warm (Terra paper, serif typography, conversational asides). Positions are not soft. The warmth is the delivery vehicle for the hardness. Failure mode avoided: cold-hard-systems-designer voice (brutalist Swiss typography + manifesto proclamations).

5. **Treats the visitor as an intellectual equal.** Writing assumes the reader is smart, curious, and unwilling to be condescended to. Uses domain vocabulary without glossaries. Failure mode avoided: writing down to the reader, over-explaining, apologizing for complexity.

### 2.3 Edges - What the Brand Is NOT

| Edge | Meaning |
|------|---------|
| Not a visual designer | Strongest assets are writing and strategic judgment. Visual craft is the vehicle, not the destination. "Sharp thinker with demonstrated judgment" is the right takeaway. |
| Not a generalist | Works at the specific intersection of AI, enterprise, and decision-making under uncertainty. Never "senior product designer, any domain." |
| Not a PM in disguise | "Strategist" was rejected because it implies thinking without shipping. Strategic insight is inseparable from design craft. |
| Not a thought leader | Writes to think, not to build an audience. If an audience emerges, that is a byproduct. |
| Not AI-skeptical or AI-credulous | AI is genuinely useful and introduces genuinely new problems. Not "AI is overhyped" and not "AI will change everything." Her position is more specific: "AI changes specific things in specific ways, and the interesting design work is in the specifics." |

---

## 3. Taste and Tradition

### 3.1 Taste Statement

**Dense, scannable writing about hard problems, where humor compresses meaning and images carry as much weight as the prose, written by a practitioner who has earned the right to be both serious and casual.**

When a design choice is ambiguous, the question to ask is: does this feel like dense scannable writing about hard problems, by a practitioner who is being both serious and casual? If yes, in character. If no, drifted.

### 3.2 Four Tradition Strands

The brand belongs to a specific, identifiable tradition with four strands:

1. **Practitioner technical writing that respects the reader's time.** Stripe engineering blog, Linear changelog, Julia Evans' zines and blog, Maciej Ceglowski's Pinboard posts, Dan Luu's essays, Bret Victor's shorter pieces. Shared property: dense, specific, scannable, produced by practitioners who built the thing they describe. Humor does compression work.

2. **Editorial design at its most restrained.** Experimental Jetset, Vignelli's Unimark system, the New York Review of Books, Cabinet Magazine, MIT Press under Muriel Cooper, Dexter Sinister. Shared property: absence of decoration + obsessive attention to remaining details. Typography as primary material. The restraint is not asceticism; it is a specific kind of confidence.

3. **Frontier technical thinking that treats design as a first-class discipline.** Bret Victor's interactive essays, Alan Kay's late essays, Anthropic's research blog at its best, Observable notebook culture. Shared property: serious intellectual work where the presentation is part of the work. The medium argues alongside the message.

4. **Post-blog building in public with substance.** Linear's blog, Figma's blog, Notion's technical posts, Vercel's writing, Dan Hollick's design posts, Amelia Wattenberger's interactive essays. Shared property: using the web's native form (short, scannable, image-supported, mobile-readable) for serious thinking that previously only happened in long-form essays or print.

### 3.3 Reference Map

| Reference type | Touchstones |
|---------------|-------------|
| Writing feeling | Julia Evans (zines/blog), Maciej Ceglowski (Pinboard posts), Stripe engineering blog, Figma blog, Linear Readme page (pacing reference), Linear changelog, Bret Victor (shorter essays), Dan Hollick, Amelia Wattenberger |
| Visual system feeling | Experimental Jetset, Dexter Sinister, MIT Press/Muriel Cooper, Vignelli Unimark/NYC subway, Natasha Jen (Pentagram), Eye Magazine (David Hillman era), Stripe docs, Linear blog |
| Interaction feeling | Apple iOS scroll behavior, Stripe parallax product pages, Kottke.org/Daring Fireball (link-as-editorial-gesture), Bret Victor interactive essays, Observable notebooks |
| Atmospheric feeling | Well-designed paper book in a quiet room. Well-curated small museum (Menil Collection, Rothko Chapel, Judd/Marfa). Early spring in New York after rain - quiet, specific, considered. |

### 3.4 Taste Edges - What the Taste Is NOT

| Edge | Why it's adjacent but wrong |
|------|---------------------------|
| NOT Swiss modernist | Swiss modernism is universal and anonymous by design. This brand is deeply personal and voiced. "An editorial magazine with opinions," not "Swiss." |
| NOT brutalist web design | Brutalism rejects ornamentation because it's dishonest. Editorial restraint rejects ornamentation because typography and argument should carry the work. Different reasons. |
| NOT AI startup aesthetic | Dark mode, glassmorphism, gradients, neural network graphics say "frontier wonder." This brand says "careful thinking with opinions worth reading." |
| NOT Framer-portfolio editorial | Framer editorial is a template that produces the same feeling everywhere. This site pushes past it via argument-sentence titles, cursor-thumbnail interaction, prose quality. The text is the distinctiveness. |
| NOT "designer with personality" warmth | The warmth is "I have been thinking carefully and will explain patiently," not "I'm a fun person to work with." Structural warmth, not decorative. |
| NOT brand-as-personality-cult | The visitor should leave remembering the arguments, not the person. She is the author, not the subject. |

### 3.5 The Moodboard Desk Test

When a decision is ambiguous, ask: does this decision feel at home on a desk with the following?

**On the desk:** Linear Readme (always open), Stripe engineering blog, Julia Evans' latest zine, a marked-up Ceglowski printout, Vignelli's NYC subway map on the wall, Experimental Jetset's Statement and Counter-Statement, a Bret Victor essay, Observable notebook in another tab, Anthropic research post, Dan Hollick/Wattenberger threads, a postcard from the Menil Collection, a Field Notes notebook with writing in it.

**Not on the desk:** Portfolio templates, AI company marketing pages, hot-take Twitter threads, "10 tips for better portfolios," Pinterest boards, Awwwards winners, Balenciaga sites, 12,000-word Atlantic features, thought leadership Medium posts, LinkedIn carousels.

If the decision would feel like an intruder among those objects, it has drifted.

---

## 4. Atmospheric Dials

Taste is a set of positions on continuous dials, not a single point. These calibrate the overall brand register. For the operational voice gradient *within a single case study*, see the Three Thermal Zones in `case-study.md` section 3.7.

| Dial | Position | Failure if too far left | Failure if too far right |
|------|----------|------------------------|--------------------------|
| Warmth / Coldness | Warm but not soft. Paper is warm, voice is warm, arguments are sharp. | Academic or corporate | Unserious |
| Formality / Informality | Formal in structure, informal in voice. Careful page structure; conversational writing inside it. | Corporate | Blog |
| Density / Spareness | Spare at page level, dense at sentence level. Lots of whitespace; sentences packed with information. | Empty | Overwhelming |
| Confidence / Humility | Confident about positions, humble about certainty. States opinions; acknowledges their edges. | Bombastic | Nervous |
| Newness / Tradition | Traditional form carrying new content. Old editorial disciplines wrapping frontier AI work. | AI-startup aesthetic | Graduate-school academic |
| Craft / Content | Craft invisible in service of content. High craft that doesn't draw attention to itself. | Showing off (designer portfolios) | Under-designed (engineer blogs) |

---

## 5. Visual Identity Summary

The visual system implements the brand identity through a small number of deliberate choices. For full specifications, see the linked spoke docs.

| Element | Implementation | Reference |
|---------|---------------|-----------|
| Surface system | Terra warm amber as chrome/sidebar, pure white as reading body. Two surfaces, no middle ground. | `color.md` section 9.3b |
| Typography pairing | Geist Sans (all interface text: headings, body, labels, captions). IBM Plex Serif scoped to: case study intro titles (`heading-case-study-intro`), pull quotes, block quotes, testimonial text, epigraphs. Serif scope is restricted - it does NOT extend to body prose. | `typography.md` section 18.1 |
| Brand accent: Lumen | Blue-violet at ~270deg hue. Grade 60 (#3336FF) is the immovable anchor. Scoped to interactive elements, links, and the `yg` logo mark. | `color.md` section 9.3 |
| Brand accent: Terra | Warm amber at 70deg hue. Provides the warm earthy surface that distinguishes the site. | `color.md` section 9.3b |
| Shape | Zero corner radius across the entire site. The only curves are structural exceptions (avatars, progress bars, toggle switches, spinners) and the two semicircular cutouts inside the logo mark. See section 1 above. | This file, section 1 |
| Interaction signature | Cursor-thumbnail on desktop (hover reveals project preview) / inline reveal on mobile. One hover gesture per element. | `navigation.md` |
| Login portrait | Halftone treatment - abstracts the person into a brand material rather than a photograph. Appears once on the login page. | — |

### What the Visual Identity Is NOT Selling

Visual craft is table stakes, not the destination. A visitor who walks away thinking "nice typography" has read the site wrong. The right takeaway is "sharp thinker with demonstrated judgment on hard problems." The typography is the vehicle. This is why the brand position (section 2) says "not a visual designer" while the visual system is meticulously crafted - foundational competency demonstrated as fact, not as primary selling point.

---

## 6. Proof Map

Every brand claim must have corresponding proof reachable on the site. If a claim exists without proof, the claim is weakened.

| Claim | Proof artifact |
|-------|---------------|
| I design for real-stakes AI environments | Meteor case study (Goldman Sachs, ETF exception review, $79B daily) |
| My work sits on the automation/judgment boundary | ETRO essay ("volume dial, not light switch" - the boundary as continuous space) |
| Friction is sometimes a feature | Meteor (showing fewer exceptions = introducing productive friction) + Lacework (removing friction where it doesn't earn its place). Two directions, one principle. |
| Transparency is sometimes noise | ETRO section "Full Transparency Is Its Own Kind of Noise" |
| I think at the meta-system level | Elan case study (scaffolding/harnessing layer around AI that lets it construct a design system while self-learning) |
| I ship, I don't just theorize | Three shipped case studies with specific metrics + one published essay with developed framework. Zero "concept" or "strategy deck" work. |
| I think for a living | The quality of writing across all pieces. Section headers across case studies cohere as a body of work. |
| I am distinctive | Text-first homepage, argument-sentence titles, cursor-thumbnail, Terra surface, `yg` logo, no conventional portfolio elements |

For hiring manager recall evaluation, see also `self-audit.md` section 11.4 Layer 3.

---

## 7. Enforcement Checklist (Zero Corner Radius)

When creating or modifying any element on the portfolio website:

1. **Check:** Does this element have border-radius > 0?
2. **Check:** Is it in the exceptions list (§1.3)?
3. **If not excepted:** Set border-radius to 0.
4. **If using Badge:** Pass `shape="squared"` explicitly.
5. **If using Button:** Default `shape="default"` is already correct (0px).
6. **If using a third-party or inherited component:** Override its radius to 0 in the consuming SCSS module.
