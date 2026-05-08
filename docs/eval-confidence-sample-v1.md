---
type: eval-spec
id: eval-confidence-sample-readable
topics: [eval, knowledge-graph, confidence]
references:
  - docs/eval-confidence-sample-v0.md
  - docs/eval-confidence-rubric.md
---

# Confidence Calibration — Human-Readable Labeling Sheet

> **Version:** 1.1.0 — **Superseded by [v4](eval-confidence-sample-v4.md)** (clearer category names removed the need for numbers)
>
> **Source data:** [eval-confidence-sample-v0.md](eval-confidence-sample-v0.md) (the raw technical version)
>
> **How to label:** For each connection below, rate how useful it would be if an AI assistant followed this link while working on a task. Write a number from **0 to 10** in the **Score** spot.
>
> | Score | Meaning | Category |
> |-------|---------|----------|
> | **0** | "I genuinely can't tell what this is for." | ambiguous |
> | **1–3** | "This would confuse or distract me." | noise |
> | **4–6** | "Related, but I'd still need to look further." | relevant |
> | **7–10** | "This link takes me exactly where I need to go." | authoritative |
>
> Just write a single number. Don't overthink it — go with your gut.

---

## What you're looking at

The AI assistant's knowledge base is organized like a web of connected documents. Each "connection" (edge) says: *"Document A is related to Document B in this way."* The system assigns a **confidence score** to each connection — how sure it is that the link is real and meaningful.

We sampled 60 connections across three confidence levels to check whether the scores are accurate. Your job: read each one and judge whether the connection is actually useful.

---

## Group 1 — High confidence (1.0) — 20 connections

The system is very confident these connections are real and useful.

---

### E001

**What's connected:** The *graph audit report* says it was created from the *experiment program plan*.

**In plain terms:** A report about the health of our documentation network says "I was derived from the evaluation experiment plan." This is a parentage/lineage claim — the report exists because the plan called for it.

**Score (0–10):** ___

---

### E002

**What's connected:** The *Engineering hub* (main engineering knowledge page) points to *anti-pattern EAP-042* (Turbopack cache / HMR delivery failure).

**In plain terms:** The engineering overview page mentions a specific known mistake — a recurring issue where the build tool's hot-reload cache breaks. The engineering page lists this as a critical, escalated problem that happened 6+ times.

**Score (0–10):** ___

---

### E003

**What's connected:** The *AI Agent instruction manual* (AGENTS.md) activates the *case study authoring skill*.

**In plain terms:** When the AI reads its main instruction file, it discovers it has a skill for writing case studies. The instruction file lists this skill in its "available skills" section so the AI knows it can use it.

**Score (0–10):** ___

---

### E004

**What's connected:** *Engineering feedback entry #19* points to *anti-pattern EAP-013*.

**In plain terms:** A specific bug report (ENG-019) says "we hit known mistake EAP-013 again — this is the third time." The feedback directly calls out the anti-pattern by name with "See EAP-013."

**Score (0–10):** ___

---

### E005

**What's connected:** The *engineering anti-patterns catalog* contains *anti-pattern EAP-077*.

**In plain terms:** The master list of known engineering mistakes includes EAP-077 as one of its entries. It appears in the "Build / Toolchain / CSS" category table. This is a parent-child relationship — the catalog literally defines this anti-pattern.

**Score (0–10):** ___

---

### E006

**What's connected:** The *About Page content doc* says it belongs to the *Content hub*.

**In plain terms:** A document about how to write the "About" page declares in its header: "I'm a child of the Content pillar." It's like a file in a folder saying which folder it belongs to.

**Score (0–10):** ___

---

### E007

**What's connected:** The *engineering anti-patterns catalog* contains *anti-pattern EAP-110*.

**In plain terms:** The master list of known engineering mistakes includes EAP-110 as one of its entries. Same parent-child relationship as E005 — the catalog defines this anti-pattern within itself.

**Score (0–10):** ___

---

### E008

**What's connected:** The *AI Agent instruction manual* contains *design guardrail #1* ("NEVER use inline styles").

**In plain terms:** The AI's main rulebook physically contains the rule: "Never use inline style={{}} — always use Tailwind classes." The rule lives inside AGENTS.md with an anchor so the system can point directly to it.

**Score (0–10):** ___

---

### E009

**What's connected:** The *AI Agent instruction manual* activates the *password gate skill*.

**In plain terms:** AGENTS.md lists a skill that handles password-protected access. When the AI reads its instructions, it learns this skill exists and can be triggered. Same pattern as E003 — a skill registration.

**Score (0–10):** ___

---

### E010

**What's connected:** The *engineering anti-patterns catalog* contains *anti-pattern EAP-068*.

**In plain terms:** EAP-068 appears in the "Dev Workflow" category of the anti-patterns master list. The catalog physically holds this entry. Same parent-child pattern as E005 and E007.

**Score (0–10):** ___

---

### E011

**What's connected:** The *Engineering hub* points to *anti-pattern EAP-007* (Playground ↔ production drift).

**In plain terms:** The engineering overview page mentions a critical, escalated problem: the playground and production versions of the site keep drifting apart. The hub references this anti-pattern in its issue tracking table.

**Score (0–10):** ___

---

### E012

**What's connected:** The *AI Agent instruction manual* activates the *stress test skill*.

**In plain terms:** AGENTS.md registers the "content stress test" skill so the AI knows it can run comprehensive content reviews. Same skill-registration pattern as E003 and E009.

**Score (0–10):** ___

---

### E013

**What's connected:** The *AI Agent instruction manual* contains *engineering guardrail #15* ("NEVER use barrel imports from lucide-react in the playground").

**In plain terms:** AGENTS.md physically holds rule #15: don't import icons using the shortcut method in the playground app. The rule is embedded in the file with an anchor tag.

**Score (0–10):** ___

---

### E014

**What's connected:** The *release log archive* contains *release entry REL-014*.

**In plain terms:** The historical log of past releases includes release #14 as one of its entries. The archive literally holds this release note within itself. Straightforward container relationship.

**Score (0–10):** ___

---

### E015

**What's connected:** The *stress test skill* points to the *Content hub*.

**In plain terms:** The stress test skill's description says it's used for "content stress test" — it references the Content pillar because that's what it operates on. The skill file mentions content in its purpose statement.

**Score (0–10):** ___

---

### E016

**What's connected:** The *content anti-patterns catalog* contains *anti-pattern CAP-005*.

**In plain terms:** The master list of content writing mistakes includes CAP-005 in its "Information Architecture" category. The catalog defines and holds this anti-pattern. Same parent-child pattern as E005.

**Score (0–10):** ___

---

### E017

**What's connected:** The *engineering anti-patterns catalog* enforces rules on the *Engineering hub*.

**In plain terms:** The anti-patterns document says "I enforce standards on the engineering pillar." This is a governance relationship — the catalog of known mistakes exists to prevent the engineering team from repeating them.

**Score (0–10):** ___

---

### E018

**What's connected:** The *AI Agent instruction manual* contains *design guardrail #7* ("NEVER use SVG to render text or labels").

**In plain terms:** AGENTS.md holds rule #7: don't use SVG for text, labels, or UI elements — SVG is only for decorative graphics. Same rule-in-rulebook pattern as E008 and E013.

**Score (0–10):** ___

---

### E019

**What's connected:** The *AI Agent instruction manual* activates the *doc audit skill*.

**In plain terms:** AGENTS.md registers the documentation health-check skill. The AI discovers it can audit its own docs for broken links and inconsistencies. Same skill-registration pattern as E003, E009, E012.

**Score (0–10):** ___

---

### E020

**What's connected:** *Engineering feedback entry #21* points to *anti-pattern EAP-054*.

**In plain terms:** Bug report ENG-021 says "See EAP-054" — it directly tells the reader to look at a specific known mistake for context. An explicit, named cross-reference.

**Score (0–10):** ___

---

## Group 2 — Medium confidence (0.6) — 20 connections

The system is moderately confident these connections are meaningful. These were often detected from regular markdown links or "Related:" mentions rather than explicit "See:" citations.

---

### E021

**What's connected:** *Engineering feedback entry #200* mentions *anti-pattern EAP-118* (session-existence check without identity match).

**In plain terms:** A bug report says a principle was "extracted" into EAP-118. The text says "Related:" not "See:" — it's connected but phrased more loosely. The feedback led to creating this anti-pattern, so there's a real conceptual link.

**Score (0–10):** ___

---

### E022

**What's connected:** A *repeated section of engineering feedback #104* links to *engineering feedback #230*.

**In plain terms:** One feedback entry contains a markdown link to another feedback entry. The source text is from a "Last updated" note at the top of the log, suggesting the link was added during a mass update rather than being a deliberate cross-reference from within the entry itself.

**Score (0–10):** ___

---

### E023

**What's connected:** The *Design hub* links to the *Layout spoke* (a sub-topic page about layout).

**In plain terms:** The design overview page has a table-of-contents link to its "Layout" sub-page. It's a navigational link — the hub lists its child topics. Think of it like a chapter index pointing to Chapter 3.

**Score (0–10):** ___

---

### E024

**What's connected:** *Anti-pattern EAP-120* links to the *knowledge graph specification*.

**In plain terms:** An engineering anti-pattern entry contains a markdown link to the knowledge graph spec. The link appears inside a graph metadata HTML comment at the top of a file. The anti-pattern's file references the graph spec as infrastructure context, not as part of the anti-pattern's own content.

**Score (0–10):** ___

---

### E025

**What's connected:** *Design feedback entry #178* mentions *design anti-pattern AP-065*.

**In plain terms:** A design bug report says "Related: AP-065" — flagged as a "Loose match." The feedback is associated with a known design mistake, but the connection is explicitly marked as approximate rather than definitive.

**Score (0–10):** ___

---

### E026

**What's connected:** The *Content hub* links to the *Conversion Funnel spoke* (a sub-topic page).

**In plain terms:** The content overview page has a link to its "Conversion Funnel" sub-page. Same navigational table-of-contents pattern as E023 — a hub listing its child topics.

**Score (0–10):** ___

---

### E027

**What's connected:** The *synthetic types section* of the knowledge graph spec links to the *hygiene decisions document*.

**In plain terms:** A section in the knowledge graph specification that talks about automatically-created node types contains a link to a separate document that records cleanup decisions. The section references it for further reading on why edge types have no authority ranking.

**Score (0–10):** ___

---

### E028

**What's connected:** The *Content hub* links to the *Analytics & Measurement spoke* (a sub-topic page).

**In plain terms:** Same pattern as E023 and E026 — the content overview page links to its "Analytics & Measurement" child page. A navigational index link.

**Score (0–10):** ___

---

### E029

**What's connected:** The *Content hub* links to the *Seniority Signals spoke* (a sub-topic page).

**In plain terms:** Same hub-to-spoke table-of-contents link. The content overview lists "Seniority Signals" as one of its sub-topics with a link to the detailed page.

**Score (0–10):** ___

---

### E030

**What's connected:** The *Analytics Instrumentation spoke* (under Engineering) links to the *Analytics cross-cutting doc*.

**In plain terms:** A sub-page about how analytics tracking is built (engineering perspective) links to the shared analytics document that covers analytics from all angles. It's a cross-reference between a specialized engineering page and a shared resource.

**Score (0–10):** ___

---

### E031

**What's connected:** *Engineering feedback entry #197* mentions *anti-pattern EAP-119*.

**In plain terms:** A bug report says "Related: EAP-119" — marked as a "Loose match." The feedback is connected to a known engineering mistake, but the match was made heuristically (not with a definitive "See:" citation).

**Score (0–10):** ___

---

### E032

**What's connected:** *Content feedback entry #13* mentions *content anti-pattern CAP-003*.

**In plain terms:** A content bug report says "Related: CAP-003" — also a "Loose match." Same pattern as E031 but in the content domain rather than engineering.

**Score (0–10):** ___

---

### E033

**What's connected:** The *Engineering hub* links to the *Debugging spoke* (a sub-topic page).

**In plain terms:** Same hub-to-spoke table-of-contents link. The engineering overview lists "Debugging" as one of its sub-topics.

**Score (0–10):** ___

---

### E034

**What's connected:** The *Engineering hub* links to the *Versioning spoke* (a sub-topic page).

**In plain terms:** The engineering overview lists "Versioning" as a sub-topic. Same navigational index pattern as E023, E026, E028, E029, E033.

**Score (0–10):** ___

---

### E035

**What's connected:** The *Storage spoke* (under Engineering) links to the *Media Embeds spoke* (also under Engineering).

**In plain terms:** A page about file storage says "for external video embeds, see the media-embeds page." Two sibling sub-topics cross-reference each other — storage handles files, media-embeds handles video players.

**Score (0–10):** ___

---

### E036

**What's connected:** The *table of contents section* of the knowledge graph spec links to its own *Cluster Validation section*.

**In plain terms:** The knowledge graph document's index at the top links to section 14 ("Cluster Validation") further down in the same document. It's an internal navigation link — same file, different heading.

**Score (0–10):** ___

---

### E037

**What's connected:** The *table of contents section* of the knowledge graph spec links to its own *Maintenance Rules section*.

**In plain terms:** Same as E036 — the document's index links to section 16 ("Maintenance Rules") in the same file. Another internal table-of-contents link.

**Score (0–10):** ___

---

### E038

**What's connected:** The *Content hub* links to the *Portfolio Coherence spoke* (a sub-topic page).

**In plain terms:** The content overview links to its "Portfolio Coherence Manifest" sub-page. Same hub-to-spoke pattern as E023, E026, etc.

**Score (0–10):** ___

---

### E039

**What's connected:** The *Media Embeds spoke* links back to the *Storage spoke*.

**In plain terms:** The reverse of E035 — the media-embeds page says "uploaded files are handled by the storage system, see storage.md." Two sibling pages pointing at each other.

**Score (0–10):** ___

---

### E040

**What's connected:** The *table of contents section* of the knowledge graph spec links to its own *ID Naming section*.

**In plain terms:** Same as E036 and E037 — the document's index links to section 3 ("ID Naming") in the same file. Internal navigation.

**Score (0–10):** ___

---

## Group 3 — Low confidence (0.5) — 20 connections

The system has low confidence in these connections. They were detected from "bare" mentions — the system spotted an ID or code in the text but isn't sure it's a deliberate cross-reference.

---

### E041

**What's connected:** The *Engineering hub* mentions *anti-pattern EAP-115* (verification gap — reporting done without browser check).

**In plain terms:** The engineering overview page has a table row mentioning EAP-115 in passing. The anti-pattern ID appears in a summary table alongside many others. The system found the ID text but it wasn't a deliberate "See EAP-115" citation — it was just listed in a row.

**Score (0–10):** ___

---

### E042

**What's connected:** *Knowledge route D* (a section of AGENTS.md) mentions *design feedback entry #40*.

**In plain terms:** A section of the AI's instruction manual that handles multi-category feedback mentions FB-040 as an example. It appears in a paragraph about documenting feedback in all applicable logs. The ID is embedded in instructional text.

**Score (0–10):** ___

---

### E043

**What's connected:** *Engineering feedback entry #253* mentions *engineering feedback entry #252*.

**In plain terms:** One feedback entry mentions another right next to it — they're adjacent entries in the log (252 and 253 are consecutive numbers). The system detected that 253's text contains the anchor tag for 252. This is likely just physical proximity in the file, not a deliberate cross-reference.

**Score (0–10):** ___

---

### E044

**What's connected:** The *engineering renumber log* mentions *engineering feedback entry #202*.

**In plain terms:** A housekeeping document that tracks when feedback entries were renumbered lists ENG-202 as one of the entries that got renumbered. It shows which line numbers changed and what IDs were affected. This is a bookkeeping reference, not a topical one.

**Score (0–10):** ___

---

### E045

**What's connected:** The *Voice & Style content doc* mentions *content anti-pattern CAP-023* (voice flattening during refinement).

**In plain terms:** A document about writing voice and style references CAP-023 in a list of related anti-patterns. The anti-pattern is about voice getting watered down during editing — which is directly relevant to a document about maintaining voice. The mention is inline rather than a formal citation.

**Score (0–10):** ___

---

### E046

**What's connected:** *Engineering feedback entry #139* mentions *design feedback entry #129*.

**In plain terms:** An engineering bug report about a CSS overflow issue references a design feedback entry about the same visual problem (a serif font reappearing). The two entries document the same incident from different angles — engineering and design.

**Score (0–10):** ___

---

### E047

**What's connected:** *Content anti-pattern CAP-032* mentions *engineering feedback entry #233*.

**In plain terms:** A content writing mistake entry lists ENG-233 in its "Reference" footnote alongside other entry IDs. It's a citation cluster at the bottom of the entry — connecting this content issue to related engineering incidents.

**Score (0–10):** ___

---

### E048

**What's connected:** The *Elan Design System case study doc* mentions *content feedback entry #45*.

**In plain terms:** A case study about the design system references CFB-045 in parentheses at the end of a sentence. It's a brief inline citation — the case study mentions a specific piece of content feedback as supporting evidence for a problem it describes.

**Score (0–10):** ___

---

### E049

**What's connected:** The *Engineering hub* mentions *engineering feedback entry #123* in a summary table.

**In plain terms:** The engineering overview page has a row in its issue-tracking table that lists ENG-123 among a long chain of related CMS/inline-editing incidents (ENG-027→039, ENG-042→046, etc.). The ID appears buried in a sequence of 54 related entries. It's a statistical mention, not a focused reference.

**Score (0–10):** ___

---

### E050

**What's connected:** *Engineering feedback entry #20* mentions *engineering feedback entry #12*.

**In plain terms:** ENG-020 has a "Meta-lesson" note that says: "This is the same escalation pattern as ENG-012 (documentation skips) and ENG-005 (cross-app parity)." The author is drawing a deliberate parallel between recurring patterns, but it's phrased as a reflection, not a formal cross-reference.

**Score (0–10):** ___

---

### E051

**What's connected:** The *Engineering hub* mentions *engineering feedback entry #87* in a summary table.

**In plain terms:** Same pattern as E049 — the engineering overview table lists ENG-087 among a chain of hydration mismatch incidents. The ID is one of many in a long list (ENG-017/18/19/20, ENG-045, ENG-055, ENG-067, etc.).

**Score (0–10):** ___

---

### E052

**What's connected:** *Engineering feedback entry #31* mentions *engineering feedback entry #27*.

**In plain terms:** ENG-031 says: "CMS UX / inline editing — fifth occurrence (ENG-027→031). Escalation trigger activated." The entry explicitly traces its history back to ENG-027 as the first occurrence of the same bug category. It's a deliberate escalation chain reference.

**Score (0–10):** ___

---

### E053

**What's connected:** The *Content hub* mentions *content anti-pattern CAP-025* (floating metric without derivation).

**In plain terms:** The content overview page lists CAP-025 in a table — "Floating metric (hero number without derivation in scan window)" rated as Critical. The anti-pattern ID appears in an issue summary row, similar to how E041 and E049 work.

**Score (0–10):** ___

---

### E054

**What's connected:** *Engineering feedback entry #187* mentions *design feedback entry #163*.

**In plain terms:** An engineering bug report mentions a design feedback entry. The source text is from a "Last updated" header note rather than from the entry's own body. The mention appears to come from a mass update note, not a deliberate topical cross-reference within the entry itself.

**Score (0–10):** ___

---

### E055

**What's connected:** *Engineering feedback entry #170* mentions *design feedback entry #157*.

**In plain terms:** Same pattern as E054 — an engineering entry mentions a design feedback entry, but the reference is in a "Last updated" header note rather than in the entry's own narrative. Likely a housekeeping mention.

**Score (0–10):** ___

---

### E056

**What's connected:** *Engineering feedback entry #102* mentions *anti-pattern EAP-007* (playground ↔ production drift).

**In plain terms:** A feedback entry about materializing CMS data mentions EAP-007 in a passing note about cross-app parity checks. The anti-pattern about playground/production drift is tangentially relevant — the entry ran a parity check that relates to this anti-pattern's concern.

**Score (0–10):** ___

---

### E057

**What's connected:** The *Case Study Review process doc* mentions *content feedback entry #19*.

**In plain terms:** A document about how case studies should be reviewed mentions CFB-019 in its text. The mention is terse — just "CFB-019.)" with a closing parenthesis, suggesting it's an inline citation at the end of a point.

**Score (0–10):** ___

---

### E058

**What's connected:** The *Design hub* mentions *design feedback entry #105* (admin controls displacing content).

**In plain terms:** The design overview page's issue-tracking table mentions FB-105 — a problem where admin controls (like drag handles) were pushing content around on the page. The feedback ID appears in a table row describing the issue.

**Score (0–10):** ___

---

### E059

**What's connected:** The *candidate anti-patterns doc* mentions *engineering feedback entry #266*.

**In plain terms:** A document that lists potential (not yet promoted) anti-patterns references ENG-266 — an incident where a workflow was designed without checking the underlying data layer first. The feedback entry is cited as evidence for why this should become an anti-pattern.

**Score (0–10):** ___

---

### E060

**What's connected:** The *Engram case study* mentions *design feedback entry #56* (interactive visual scoping).

**In plain terms:** A case study about the Engram project lists FB-056 in a "Design:" reference list — it's one of several design feedback entries cited as relevant to the project. The case study is gathering evidence from past feedback.

**Score (0–10):** ___

---

## Summary

After scoring, tally how many edges fall into each range:

| Score range | Category | Count |
|-------------|----------|-------|
| 0 | ambiguous | |
| 1–3 | noise | |
| 4–6 | relevant | |
| 7–10 | authoritative | |
| | **Total** | **60** |

> If ambiguous (score = 0) exceeds 12 entries (20%), the rubric needs revision before proceeding to C4.

---

> **Changelog**
>
> - **v1.1.0** (2026-05-03): Replaced text labels with 0–10 numeric scale. 0 = ambiguous, 1–3 = noise, 4–6 = relevant, 7–10 = authoritative.
> - **v1.0.0** (2026-05-03): Initial human-readable translation of all 60 sampled edges.
