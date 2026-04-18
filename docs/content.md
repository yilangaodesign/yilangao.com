# Content Strategy — Accumulated Knowledge

> **What this file is:** The hub file for the content strategy knowledge base. Detailed section content lives in spoke files under `docs/content/`. This file contains the Section Index for routing, the Content Posture (read every time), and the Feedback Frequency Map.
>
> **Who reads this:** AI agents routed here by `AGENTS.md` Pre-Flight. Read the Section Index first, then open only the spoke file matching your task.
> **Who writes this:** AI agents after processing content feedback via the `content-iteration` skill.
> **Last updated:** 2026-04-01 (hub/spoke decomposition — section content moved to docs/content/)

---

## Section Index — Read This First

| § | Topic | File | Read when |
|---|-------|------|-----------|
| §0 | Content Posture | *(this file)* | Always for content work |
| §1 | Conversion Funnel & HM Mental Model | [`docs/content/conversion-funnel.md`](content/conversion-funnel.md) | Understanding audience |
| §2 | Homepage / Hero Strategy | [`docs/content/homepage.md`](content/homepage.md) | Touching landing page, hero, project grid |
| §3 | Case Study Structure | [`docs/content/case-study.md`](content/case-study.md) | Writing or editing any case study |
| §4 | Image-to-Text Ratio & Visual Economy | [`docs/content/visual-economy.md`](content/visual-economy.md) | Deciding how much to write vs. show |
| §5 | Language Patterns | [`docs/content/language-patterns.md`](content/language-patterns.md) | Writing any copy — titles, intros, captions |
| §6 | Seniority Signals | [`docs/content/seniority-signals.md`](content/seniority-signals.md) | Framing role, scope, decisions, impact |
| §7 | Internal Tool Compensation Strategies | [`docs/content/internal-tools.md`](content/internal-tools.md) | Presenting work behind a firewall |
| §8 | Project Selection & Curation | [`docs/content/project-selection.md`](content/project-selection.md) | Choosing which projects to feature |
| §9 | About Page & Supporting Content | [`docs/content/about-page.md`](content/about-page.md) | Editing about page or non-case-study content |
| §10 | Portfolio Lifecycle & Intervention Matrix | [`docs/content/portfolio-lifecycle.md`](content/portfolio-lifecycle.md) | Mapping hiring stages, adapting for HM segments |
| §11 | Self-Audit Framework | [`docs/content/self-audit.md`](content/self-audit.md) | Evaluating portfolio against the mental model |
| §12 | Narrative Arc (7-Beat Framework) | [`docs/content/narrative-arc.md`](content/narrative-arc.md) | Writing or rebuilding a full case study |
| §13 | Voice & Style | [`docs/content/voice-style.md`](content/voice-style.md) | Writing any case study text |
| §14 | Case Study Review Checklist | [`docs/content/case-study-review.md`](content/case-study-review.md) | Reviewing or auditing a case study |
| §15 | Project Dossiers | [`docs/content/projects/`](content/projects/) | Per-project evolution tracking, rebuild context |
| §16 | Technical Vocabulary Strategy | [`docs/content/technical-framing.md`](content/technical-framing.md) | Writing or editing any case study, especially for technical/startup audiences |
| §17 | Personal Voice & Techniques | [`docs/content/personal-voice.md`](content/personal-voice.md) | Writing any case study text (universal) |
| §18 | Portfolio Coherence Manifest | [`docs/content/portfolio-coherence.md`](content/portfolio-coherence.md) | Authoring (diversity gate), reviewing (Check 18), iterating (when edits might break diversity) |
| App. A | Reference Portfolios | [`docs/content/reference-portfolios.md`](content/reference-portfolios.md) | Competitive benchmarks |
| App. B | Feedback Frequency Map | *(this file)* | Checking recurring patterns |

**Process principles & feedback workflow** (formerly §12): covered by the `content-iteration` skill at `.cursor/skills/content-iteration/SKILL.md` — not duplicated in this file.

---

## 0. Content Posture

**The portfolio is a product. The hiring manager is the user. The conversion event is "move this candidate to the next stage."**

- **Retention over acquisition.** More portfolio views won't help if visitors bounce. The higher-leverage problem is always what happens *after* someone lands. Fix engagement depth before worrying about traffic. (RARRA > AARRR applied to portfolios.)
- **P(Alive) decays by default.** Every section of the portfolio must actively maintain or increase the hiring manager's consideration probability. Passive content (filler, generic copy, decorative elements without signal) allows decay. There is no "neutral" content — it either increases P(Alive) or lets it drop.
- **Visual-prose parity.** Case studies target ~60% visual, ~40% text. Essay-type content (opinion pieces, written arguments like ETRO) is text-majority. See `visual-economy.md` section 4.1 for the content type triage. Text frames what images show and carries the argument images can't convey (strategy, trade-offs, alternatives). For the brand identity and tradition that informs this ratio, see `docs/design/branding.md`.
- **Every word must earn its place.** Hiring managers spend 15-60 seconds scanning a case study before deciding whether to read. If a sentence doesn't help them decide whether to keep reading, cut it.
- **Show the work, not the process.** Never lead with methodology (research → ideate → prototype → test). Lead with the problem, the outcome, and the artifacts. Process is what every designer does; *thinking within the process* is the differentiator.
- **The portfolio itself is a design artifact.** Typography, layout, interaction design, and code quality of the portfolio are evaluated as implicit evidence of capability. A clumsy portfolio undermines every case study inside it.
- **Internal tools require more visual evidence, not more text.** When the reader can't visit the live product, screenshots, recordings, and annotated flows must be so clear that the reader feels like they've used the product.
- **Specificity over generality.** "Improved the user experience" signals nothing. "Activation time dropped 30% in the first month" or "Led design for a 2.5-month marketing site relaunch with 20 interactive graphics coded in React" signals everything.
- **Conversion rate > application volume.** A small improvement in conversion rate has a multiplicative effect. Doubling application volume doubles effort. Doubling conversion rate doubles outcomes with no additional effort per application.
- **Luxury positioning governs all case study content.** Show outcomes early, state them as facts, never editorialize why they're impressive. The reader's inference is more powerful than your commentary. See `case-study.md` §3.8 for the full principle and technique rules.

---

## How to Use This File

1. **Read the Section Index above** — match your task to a section, then open the linked spoke file and read only that file.
2. **If the user gives content feedback**, process it through the content feedback loop: log → update principles → update anti-patterns.
3. **After resolving feedback**, update the relevant spoke file: strengthen existing principles or add new ones.
4. **Do NOT read all spoke files** unless the feedback loop requires it.

---

## Appendix B: Feedback Frequency Map

| Pattern | Times Raised | Priority |
|---------|-------------|----------|
| **Text verbosity (section body > 3 sentences, scope > 4 sentences)** | **2** | **Critical — escalation threshold** |
| Interactive visual scoping (widget content must match section topic) | 2 | Medium |
| Information hierarchy inversion (rationale before outcome, data source over task) | 2 | High |
| Feature-list case study (WHAT without WHY) — CAP-016 | 2 | High |
| Section hierarchy (AI-native thread should be the core narrative) | 1 | High |
| Token naming examples inconsistent with described convention | 1 | Medium |
| CMS data sync (headings out of sync → visuals silently drop) | 1 | High |
| Claiming AI agent work as designer expertise — CAP-021 | 1 | High |
| Hero metric must communicate value, not volume | 1 | High |
| Em dash usage (AI voice tell) — CAP-022 | 1 | Critical |
| Voice flattening during refinement — CAP-023 | 1 | Critical |
| AI output lacks user's personal voice (clinical register) | 1 | High |
| Floating metric (hero number without derivation in scan window) - CAP-025 | 1 | Critical |
| Employment classification signal (diminishing labels in portfolio text) - CAP-026 | 1 | High |

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
