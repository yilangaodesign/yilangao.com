# Content Feedback Log

> **What this file is:** Chronological record of every content feedback session. Each entry captures the raw user instruction, the parsed intent, and what was done. Newest entries first.
>
> **Who reads this:** AI agents at session start (scan recent entries for context), and during content feedback processing (check for recurring patterns).
> **Who writes this:** AI agents after each content feedback cycle.
> **Last updated:** 2026-03-29 (CF-002: mental model v2 — RARRA, P(Alive), Magic Number, HM segmentation, intervention matrix)

---

## Session: 2026-03-29 — Mental Model v2 Integration (Lifecycle & Retention Frameworks)

**Chat:** Current session
**Scope:** `docs/content.md`

#### CF-002: "Updated mental model document — make sure to update content.md"

**Intent:** The hiring manager mental model document was updated with growth-design lifecycle frameworks. The new version adds RARRA retention thinking, P(Alive) probability decay, three retention layers, a portfolio magic number, hiring manager segmentation, a lifecycle intervention matrix, portfolio LTV thinking, and a layered self-audit framework. All of these needed to be integrated into the working `content.md` so they are available as operational principles during content work.

**New concepts integrated:**
1. **RARRA retention-first model** (§0, §1) — engagement value > page views; fix retention before acquisition
2. **P(Alive) consideration probability** (§0, §1.4) — attention decays by default; no neutral content exists
3. **Three Retention Layers** (§1.2) — Value Verification (Aha Moment) → Engagement Deepening → Barrier Building, with recursive dependency (fix earlier layers first)
4. **The Portfolio's Magic Number** (§1.3) — 3 signals in 60 seconds: specialization, relevant project, concrete outcome
5. **Hiring Manager Segmentation** (§1.5) — 4 types (craft, outcome, process, culture) with different evaluation lenses
6. **Vanity Metrics vs. North Star Metrics** (§1.8) — page views are vanity; interview conversion rate is the north star
7. **BJ Fogg Behavior Model** (§2.1) — Motivation × Ability × Trigger applied to homepage design
8. **Retrospective vs. Predictive narratives** (§6.3) — junior = what happened; senior = ability to anticipate and plan
9. **LTV resource allocation** (§8.3) — invest most in highest-value project segments
10. **Portfolio Lifecycle Intervention Matrix** (§10) — lifecycle stages mapped to hiring + HM segment × stage grid
11. **Portfolio LTV formula** (§10.3) — conversion rate improvement > volume increase
12. **Layered Self-Audit** (§11) — audit restructured around 3 retention layers instead of flat funnel stages
13. **Critical ordering principle** (§12.1) — fix Layer 1 before Layer 2, Layer 2 before Layer 3

**Resolution:** Updated `content.md` across §0, §1, §2, §6, §8, §9. Added new §10 (Portfolio Lifecycle & Intervention Matrix), §11 (Self-Audit Framework). Renumbered old §10 to §12 (Process Principles). Updated Section Index.

---

## Session: 2026-03-29 — Competitive Portfolio Analysis & Content Strategy Foundation

**Chat:** Current session
**Scope:** `docs/content.md`, `docs/content-anti-patterns.md`, `docs/content-feedback-log.md`

### Content Reflection — What This Session Established

This session was not a single piece of feedback — it was the foundational analysis that created the content track. The user requested a deep study of two top-tier designer portfolios (Joseph Zhang at joseph.cv, Ryo Lu at work.ryo.lu) to extract principles for structuring their own portfolio, with the specific constraint that their work is on internal tools behind a firewall.

**The core tension this session surfaced:** The best portfolios rely heavily on the reader being able to *see and interact with* the shipped product. When that's not possible, the portfolio must work harder visually — more screenshots, more recordings, more annotated walkthroughs — to create the experience of having used the product. This is a harder design problem than having a public product link, and doing it well actually demonstrates a stronger communication skill.

### Feedback → Intent → Resolution

---

#### CF-001: "Study how joseph.cv and work.ryo.lu write their case studies — image to text ratio, key language, how to structure for internal tools"

**Intent:** Establish a content strategy knowledge base by reverse-engineering what makes top portfolios successful, then adapt those patterns for the specific constraint of internal (firewalled) work.

**Analysis performed:**
1. Fetched and analyzed 8 pages across joseph.cv (homepage, Notion, Azuki, Skiff, Cursor, Thinkspace, Brain Technologies)
2. Analyzed Ryo Lu's portfolio structure via work.ryo.lu, read.cv, and his Dive Club podcast interview
3. Cross-referenced both against the hiring manager mental model document
4. Identified common patterns, language formulas, image strategies, and anti-patterns

**Key findings:**
- **Image-to-text ratio:** Both portfolios operate at 80-90% visual. Text serves as framing, not explanation.
- **Language patterns:** Scope statements claim ownership + ambition in 2-4 sentences. Section text labels what images show (intent + detail + context). Captions use numbers over adjectives.
- **Structure:** Inverted pyramid — lead with outcome, then supporting evidence. Section-based, not linear narrative.
- **Internal tool gap:** Both designers link to live products and press coverage. For internal tools, compensation requires: immersive screenshots, guided walkthroughs, before/after comparisons, system artifact displays, and context framing that replaces brand recognition with scale metrics.

**Resolution:** Created the full content track:
- `docs/content.md` — 10-section knowledge base with all extracted principles
- `docs/content-anti-patterns.md` — catalog of content mistakes to avoid
- `docs/content-feedback-log.md` — this file
- Updated `AGENTS.md` Pre-Flight, Post-Flight, and Hard Guardrails with content routing

**Pattern extracted → `content.md` §0-§10 (all sections)**

---

### Session Meta-Analysis

**Key learning — The portfolio's job is NOT to showcase work. It's to generate enough confidence in 60-90 seconds to earn a conversation.** This reframes every content decision: text is not self-expression, it's signal delivery. Images are not decoration, they're evidence. The structure is not a narrative arc, it's a scanning optimization.

**Key learning — Internal tools are actually a harder portfolio problem that, when solved well, demonstrates a *stronger* communication skill.** Linking to a live product is a crutch. Communicating complex systems visually without relying on interactivity is a form of design leadership — exactly the signal a hiring manager is looking for.

**Key learning — Ryo Lu's own portfolio philosophy (from Dive Club): "What I like seeing is work. Real work, pictures. Not long writing case studies of standard product development process."** This is the industry's current bar, stated by someone who reviews portfolios professionally.

---

## Entry Template

```markdown
#### CF-NNN: "[First 10 words of user message]"

**Intent:** [What the user is trying to achieve with the content]

**Root Cause:** [Why the current content doesn't achieve it]

**Resolution:** [What was changed]

**Pattern extracted → `content.md` §N.N: [Section reference]**
```
