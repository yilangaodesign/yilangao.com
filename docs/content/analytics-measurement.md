<!-- graph metadata for docs knowledge graph (see docs/knowledge-graph.md) -->
---
type: spoke
id: content-analytics-measurement
topics:
  - content
  - analytics
derivedFrom:
  - content.md
---

# Analytics Measurement Strategy

> **What this file is:** Content spoke for interpreting client analytics data and deciding what to measure next. Maps Mixpanel events to portfolio optimization questions.
>
> **Who reads this:** Agents routed here by `AGENTS.md` Pre-Flight route 17 → `docs/analytics.md` → this file.
>
> **Last updated:** 2026-04-25 (initial creation)

---

## Relationship to Conversion Funnel

For the conceptual framework on which metrics matter and why (vanity vs. north star), see [`conversion-funnel.md`](conversion-funnel.md) §1.8. For the retention layers that the engagement model maps to, see §1.2.

This file answers a different question: **given the events we actually track in Mixpanel, what portfolio optimization questions can we answer?**

## Event-to-Question Mapping

Each custom Mixpanel event answers a specific portfolio optimization question. Events are listed in the order a typical visitor encounter them.

| Event | Portfolio Question It Answers |
|---|---|
| **Sign In** | Which companies are visiting? How many attempts fail (bad password, wrong URL)? |
| **Page Viewed** | What is the visitor journey through the site? Which pages get traffic vs. which are dead ends? |
| **Case Study Clicked** | Which case studies attract attention from the homepage? Does position in the list affect click-through? |
| **Case Study Viewed** | How many visitors enter a case study vs. stay on the homepage? Do personalized case studies get more views? |
| **Section Reached** | Where do visitors stop scrolling? Which sections lose attention? |
| **Case Study Engaged** | Which case studies hold attention past the first 5 seconds? Does `content_format` (case study vs. essay) affect engagement rate? |
| **Case Study Dwell** | How much active time do visitors spend per case study? Which studies have the longest dwell? |
| **Deep Explorer** | Do visitors read multiple case studies, or bounce after one? How many reach the "2+ engaged" threshold? |
| **Repeat Session** | Are visitors coming back? How many sessions does a typical company have before the portfolio "converts"? |
| **External Link Clicked** | Which external links get clicked? Does context (sidebar vs. footer vs. interactive) matter? |
| **Contact Form Submitted** | How many visitors reach the contact form? What is the success/failure ratio? |
| **Error** | Are there silent failures degrading the visitor experience? |

## Engagement-to-Retention-Layer Mapping

The three engagement tiers map directly to the three retention layers defined in [`conversion-funnel.md`](conversion-funnel.md) §1.2:

| Engagement Tier | Events | Retention Layer (§1.2) | Signal |
|---|---|---|---|
| **Viewed** | `Case Study Viewed`, `Page Viewed` | Layer 1: Value Verification (0-15s) | Visitor arrived and saw content |
| **Engaged** | `Case Study Engaged`, `Case Study Dwell` | Layer 2: Engagement Deepening (15s-3min) | Visitor invested attention past first impression |
| **Deep Explorer** | `Deep Explorer`, `Repeat Session` | Layer 3: Barrier Building (3+ min) | Visitor built cognitive investment across studies |

**The recursive insight from §1.2 applies here:** Optimizing Layer 2 events doesn't help if Layer 1 is failing. If `Case Study Viewed` counts are low relative to `Page Viewed`, the homepage isn't converting — fix that before analyzing `Case Study Engaged` patterns.

## How to Use the Data

### Diagnosing funnel drop-off

1. **Homepage → Case Study** (Layer 1 → Layer 2): Compare `Page Viewed` (homepage) to `Case Study Clicked`. Low ratio means the homepage isn't creating enough pull. Check which studies get clicked and which are ignored.

2. **Case Study Viewed → Engaged** (Layer 2 depth): Compare `Case Study Viewed` to `Case Study Engaged` per slug. Studies with high view but low engagement have a "first 5 seconds" problem — the hero or opening section isn't landing.

3. **Engaged → Deep Explorer** (Layer 2 → Layer 3): If `Case Study Engaged` is healthy but `Deep Explorer` is rare, visitors are reading one study but not exploring further. The "next study" nudges or homepage re-entry aren't working.

4. **One-time → Repeat** (Layer 3 durability): `Repeat Session` tells you whether the portfolio is memorable enough to warrant a return visit. Low repeat rates after high engagement suggest the content was interesting but not sufficiently differentiated from competitors.

### Prioritizing content work

- **High `Case Study Viewed`, low `Case Study Engaged`:** Rewrite the hero and first section. The study is attracting clicks but failing to hold attention.
- **High `Section Reached` drop-off at a specific section:** That section is the weakest link. Rewrite or restructure it.
- **One case study dominates `Deep Explorer` contribution:** The other studies may lack the engagement depth to trigger the second "engaged" count. Audit them for the engagement criteria (5s dwell + scroll past intro).
- **`External Link Clicked` concentrated in one `context`:** Visitors are finding value in one placement pattern but ignoring others. Double down on the pattern that works.

## Cross-References

- **`docs/analytics.md`** — Event registry (canonical list of all 12 events with properties and firing conditions).
- **`docs/content/conversion-funnel.md`** — §1.2 (retention layers), §1.8 (vanity vs. north star metrics).
- **`docs/engineering/analytics-instrumentation.md`** — Technical implementation, hook internals, how to add events.
