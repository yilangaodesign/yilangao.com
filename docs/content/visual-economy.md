# §4. Image-to-Text Ratio & Visual Economy

### 4.1 The Ratio

**Target: 80-85% visual surface area, 15-20% text.**

Both Joseph Zhang and Ryo Lu operate at or above this ratio. Ryo Lu approaches 90%+ visual — his portfolio (built inside Notion itself) is primarily screenshots with project title, year, and a brief descriptor.

### 4.2 The Rhythm

**One paragraph of text buys you 3-6 images.** Never the reverse. The images carry the argument; the text provides just enough framing for the images to be legible.

Typical section rhythm:
- 1-3 sentences of context
- 3-6 full-width or half-width images
- 0-2 one-line captions

**Agent generation note:** When creating a new case study via the authoring skill, the 3-6 images per paragraph rule translates to 3-6 `imagePlaceholders` entries per section in `createCaseStudyBlocks`. Each placeholder must have a specific label describing what image belongs there. The section `layout` field determines how the skeleton grid (and later, real images) arranges. See `case-study-authoring/SKILL.md` Phase 2 Step 2 for the artifact mapping instructions and Phase 3 Step 2 for the materialization format.

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
