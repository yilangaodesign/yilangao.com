# §4. Image-to-Text Ratio & Visual Economy

### 4.1 Content Type Triage

Before applying ratio and word-count rules, classify the content type:

| | Case study (default) | Essay |
|---|---|---|
| **When** | Shipped UI, visual assets, product screens | Written argument, framework, opinion (e.g., ETRO) |
| **Ratio** | ~60% visual, ~40% text | Text-majority |
| **Word count** | 400-600 words (feature section body text) | No cap |
| **Sentences/section** | 3-6 (max 3 per paragraph) | No section cap (paragraph cap of 3 sentences still applies) |
| **Image slots** | 15-25 total, 2-6 per section | No image floor |

The practitioner-writing tradition this brand belongs to (Stripe blog, Linear Readme, Julia Evans, Figma blog) treats text as a near-equal partner to visuals. Text frames what images show and carries the argument images can't convey (strategy, trade-offs, alternatives). See `docs/design/branding.md` section 3 for the full tradition reference.

### 4.2 The Rhythm

**Text and images are near-equal partners.** Text frames what the images show and carries the argument images can't convey. Images carry the visual evidence. Neither dominates.

Typical section rhythm (case studies):
- 3-6 sentences of context (max 3 per paragraph, whitespace between paragraphs)
- 3-6 full-width or half-width images
- 0-2 one-line captions

For essays: paragraphs follow the same 3-sentence cap, but there is no section sentence cap and no image floor.

**Agent generation note:** When creating a new case study via the authoring skill, the 3-6 images per section rule translates to 3-6 `imagePlaceholders` entries per section in `createCaseStudyBlocks`. Each placeholder must have a specific label describing what image belongs there. The section `layout` field determines how the skeleton grid (and later, real images) arranges. For essays, there is no image floor - use images only when they carry evidence the prose cannot. See `case-study-authoring/SKILL.md` Phase 2 Step 2 for the artifact mapping instructions and Phase 3 Step 2 for the materialization format.

### 4.3 Image Types That Work

| Type | When to use | Example |
|---|---|---|
| **Full-width hero screenshot** | Opening each feature section | The product's primary view, immersive scale |
| **Detail crops** | Showing specific interaction patterns or micro-decisions | A toolbar, a modal, a hover state |
| **State progression** | Showing a flow or transformation | Empty → loading → populated → error, side by side |
| **Before/after** | Showing impact of your redesign | Old vs. new, clearly labeled |
| **Screen recording / GIF / MP4 loop / MP4 walkthrough** | Showing animation, transitions, or interactive behavior | A drag interaction, a page transition, a loading sequence. Use MP4 `loop` (silent autoplay) for short UI clips under ~10s. Use MP4 `player` mode (controls, no autoplay) for narrative walkthroughs with audio or longer runtime. Animated GIFs exported from Figma/After Effects are accepted as-is and will play (GIF animation is preserved automatically); prefer MP4 over GIF when the file is >2MB or longer than ~3s. |
| **Embedded walkthrough (YouTube / Vimeo / Loom)** | Long narrative demos where provider controls, captions, chapters, or host-side analytics matter | A 5-minute product tour on YouTube, a Loom walkthrough recorded for a stakeholder, a Vimeo-hosted case film. Use the `videoEmbed` block (paste the share URL). Prefer uploaded MP4 over embed for short silent loops and anything that grid-mixes with uploaded assets. Prefer embed for long-form content where you want the provider's player (captions, speed, chapters) rather than a bare controls bar. Posters default to YouTube auto-thumb; upload a custom poster for Vimeo/Loom. |
| **System diagram** | Showing architecture or component relationships | Information architecture, component hierarchy |
| **Annotated walkthrough** | Replacing "play with it" for internal tools | 3-4 screens connected with arrows, one-sentence annotations |

### 4.4 Images the Reader Doesn't Need

- Process artifacts (sticky notes, whiteboard photos, affinity diagrams) unless they're exceptionally clear
- Low-fidelity wireframes when high-fidelity final work exists
- Screenshots of Figma with visible layers panel and UI chrome — crop to the design
- Stock photography or decorative imagery that doesn't show actual work
