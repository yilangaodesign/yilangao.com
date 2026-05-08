---
type: eval-spec
id: eval-confidence-sample-v3
topics: [eval, knowledge-graph, confidence]
references:
  - docs/eval-confidence-sample-v0.md
  - docs/eval-confidence-sample-v1.md
  - docs/eval-confidence-sample-v2.md
  - docs/eval-confidence-rubric.md
---

# Labeling Sheet — How Good Are These Connections?

> **Version:** v3
>
> **Previous versions:**
> - [v0](eval-confidence-sample-v0.md) — raw data
> - [v1](eval-confidence-sample-v1.md) — plain language, no context
> - [v2](eval-confidence-sample-v2.md) — added context (still too technical)
>
> **What this is:** Your portfolio site has an AI assistant with a knowledge base of ~1,000 documents. Those documents are connected to each other — "this document links to that one." The system assigned a confidence score to each connection (how sure it is that the link is real and useful). We picked 60 connections and now need you to judge: *are they actually useful?*
>
> **How to score:** Write a number from **0 to 10** next to each connection.
>
> | Score | What it means |
> |-------|--------------|
> | **0** | "I have no idea what this connection is about." |
> | **1–3** | "This connection seems wrong, irrelevant, or confusing." |
> | **4–6** | "Loosely related, but not really what you'd want to find." |
> | **7–10** | "Yes — following this link would take you to exactly the right place." |

---

## Background: How your knowledge base is organized

Your portfolio site's AI assistant has documentation organized like a library:

- **Hub pages** are the main overview pages for each topic area (Engineering, Design, Content). Think of them as a textbook's table of contents.
- **Sub-topic pages** are detailed chapters under each hub (e.g., "Layout" under Design, "Debugging" under Engineering).
- **Known-mistake catalogs** list recurring errors the AI should avoid. Each entry describes a specific mistake, what triggers it, and how to fix it.
- **Bug/issue reports** are logs of real problems encountered during development — each one has a title, description, and resolution.
- **The AI rulebook** (AGENTS.md) contains the rules the AI must follow and the skills it can use.
- **Skills** are capabilities the AI can activate (e.g., "write a case study," "run a stress test").
- **Guardrails** are specific "never do this" rules embedded in the rulebook.

---

## Group 1 — High confidence (score 1.0) — 20 connections

The system is very confident these are real, useful connections.

---

### E001

**The connection:** A report that checked the health of the documentation network says "I was created because of the evaluation experiment plan."

**Document A** is a health-check report that analyzed the structure of the entire knowledge base — how many documents exist, how they're linked, whether any are orphaned.

**Document B** is an internal planning document that designed the evaluation experiments. It lives outside the knowledge base itself (in the plans folder).

The report says it was derived from the plan — the plan called for this report to be created.

**Score (0–10):** ___

---

### E002

**The connection:** The Engineering overview page mentions a specific known mistake about failing to flush cache after making changes.

**Document A** is the Engineering hub — the main overview page that summarizes all engineering knowledge. It has tables tracking recurring issues and their severity.

**Document B** is known mistake EAP-042: "Reporting Playground Changes as Done Without Flushing Cache and Restarting." It's about the AI claiming work is finished without actually clearing the build cache and restarting the dev server — so the changes never actually took effect.

The hub's issue-tracking table calls this out as a critical problem that happened 6+ times, with an explicit "See EAP-042" citation.

**Score (0–10):** ___

---

### E003

**The connection:** The AI rulebook lists "case study authoring" as one of the skills the AI can activate.

**Document A** is AGENTS.md — the AI's main instruction manual. It lists every skill, rule, and routing instruction the AI follows.

**Document B** is the Case Study Authoring skill — it teaches the AI how to write portfolio case studies from raw materials through a 4-phase workflow (Analyze, Plan, Write, Review).

The rulebook registers this skill in its "available skills" list so the AI knows it exists and when to use it.

**Score (0–10):** ___

---

### E004

**The connection:** A bug report about a console error explicitly says "See EAP-013" — pointing to the known mistake it hit.

**Document A** is bug report ENG-019: "Console Error — script tag warning persists; hydration mismatch in DesignSystemFootnote." A real issue encountered during development.

**Document B** is known mistake EAP-013: "Script Tags in React 19 / Next.js 16 Component Trees." A documented pattern of using script tags incorrectly in the component framework.

The bug report says "Anti-patterns: EAP-013 corrected (third time)" — it's explicitly linking this incident to the known mistake, noting this is the third time it happened.

**Score (0–10):** ___

---

### E005

**The connection:** The engineering known-mistakes catalog contains mistake EAP-077 as one of its entries.

**Document A** is the Engineering Anti-Patterns catalog — the master list of all known engineering mistakes, organized by category (Build, CSS, Dev Workflow, etc.).

**Document B** is EAP-077: "Assuming CSS Can Fix Native Text Clipping for Oversized Serif Fonts." A specific mistake about trying to use CSS to fix a browser-level rendering limitation.

The catalog physically holds this entry — it's listed in the Build/Toolchain/CSS category. This is a parent containing its child.

**Score (0–10):** ___

---

### E006

**The connection:** The "About Page" content guide says it belongs to the Content hub.

**Document A** is the About Page content guide (§9) — it explains how to write the portfolio's About page. Key advice: "The About page is a secondary conversion asset. Hiring managers visit it when already interested. It should reinforce, not introduce, the value proposition."

**Document B** is the Content Strategy hub — the main overview of all content knowledge. It's the table of contents for 19+ sub-topic pages covering everything from voice & style to conversion funnels to case study reviews.

The About Page guide declares in its metadata: "I'm a sub-topic of the Content hub." Like a chapter saying which book it belongs to.

**Score (0–10):** ___

---

### E007

**The connection:** The engineering known-mistakes catalog contains mistake EAP-110 as one of its entries.

**Document A** is the Engineering Anti-Patterns catalog (same as E005 — the master list of known mistakes).

**Document B** is EAP-110: "Reorder-Only DnD on a 2-D Layout." A mistake about implementing drag-and-drop that only handles reordering in one dimension when the layout is actually two-dimensional.

The catalog physically contains this entry. Same parent-child pattern as E005.

**Score (0–10):** ___

---

### E008

**The connection:** The AI rulebook contains design rule #1: "NEVER use inline styles."

**Document A** is the AI rulebook (AGENTS.md) — the master instruction file with all rules and skills.

**Document B** is Design Guardrail #1 — a specific rule embedded in the rulebook that says: "NEVER use inline `style={{}}` — always use Tailwind classes or CSS custom properties." This prevents the AI from writing code with hardcoded styling.

The rulebook physically contains this rule with a direct anchor so other documents can point to it.

**Score (0–10):** ___

---

### E009

**The connection:** The AI rulebook lists "password gate" as one of the skills the AI can activate.

**Document A** is the AI rulebook (AGENTS.md).

**Document B** is the Password Gate skill — it handles password-protected access to the portfolio site.

Same skill-registration pattern as E003 — the rulebook lists this in its available skills.

**Score (0–10):** ___

---

### E010

**The connection:** The engineering known-mistakes catalog contains mistake EAP-068 as one of its entries.

**Document A** is the Engineering Anti-Patterns catalog (same master list as E005, E007).

**Document B** is EAP-068: "Treating TCP Listen as a Health Check for Dev Servers." A mistake about assuming a development server is ready just because its network port is open, when actually the server hasn't finished loading yet.

Listed in the Dev Workflow category. Same parent-child pattern.

**Score (0–10):** ___

---

### E011

**The connection:** The Engineering overview page mentions known mistake EAP-007 about playground/production drift.

**Document A** is the Engineering hub — the main engineering overview with issue-tracking tables.

**Document B** is EAP-007: "Adding Components to Main Site Without Playground Preview." A critical, escalated problem about adding features to the live site without first testing them in the playground (a safe testing environment).

The hub's table flags this as a critical escalated issue with explicit references to multiple related incidents.

**Score (0–10):** ___

---

### E012

**The connection:** The AI rulebook lists "stress test" as one of the skills the AI can activate.

**Document A** is the AI rulebook (AGENTS.md).

**Document B** is the Stress Test skill — it runs comprehensive reviews of all active case studies against the current knowledge base, checking for content quality issues.

Same skill-registration pattern as E003 and E009.

**Score (0–10):** ___

---

### E013

**The connection:** The AI rulebook contains engineering rule #15: "NEVER use barrel imports from lucide-react in the playground."

**Document A** is the AI rulebook (AGENTS.md).

**Document B** is Engineering Guardrail #15 — a specific rule that prevents the AI from importing icons using the shortcut method in the playground app (because it causes hydration mismatches between server and browser rendering).

The rulebook physically contains this rule. Same pattern as E008.

**Score (0–10):** ___

---

### E014

**The connection:** The release history archive contains release #14 as one of its entries.

**Document A** is the Release Log Archive — a historical record of past software releases that were moved out of the active release log (which caps at 15 entries).

**Document B** is Release #14 — a specific release entry inside the archive.

The archive physically holds this entry. A straightforward container relationship.

**Score (0–10):** ___

---

### E015

**The connection:** The stress test skill says it operates on content.

**Document A** is the Stress Test skill (same as E012) — it reviews case studies for quality issues.

**Document B** is the Content Strategy hub — the overview of all content knowledge.

The skill's description says "Use when the user says 'content stress test'" — it references the content pillar because that's what it reviews.

**Score (0–10):** ___

---

### E016

**The connection:** The content known-mistakes catalog contains mistake CAP-005 as one of its entries.

**Document A** is the Content Anti-Patterns catalog — the master list of known content writing mistakes, organized by category.

**Document B** is CAP-005: "Overloaded Project Count." A content mistake about claiming too many projects or inflating numbers in the portfolio.

Listed in the Information Architecture category. Same parent-child pattern as E005.

**Score (0–10):** ___

---

### E017

**The connection:** The engineering known-mistakes catalog declares that it enforces standards on the Engineering hub.

**Document A** is the Engineering Anti-Patterns catalog (same master list as E005, E007, E010).

**Document B** is the Engineering hub — the main engineering overview.

The catalog's metadata says "I enforce rules on the engineering pillar." It's a governance relationship — the list of known mistakes exists to prevent the engineering work from repeating those mistakes.

**Score (0–10):** ___

---

### E018

**The connection:** The AI rulebook contains design rule #7: "NEVER use SVG to render text or labels."

**Document A** is the AI rulebook (AGENTS.md).

**Document B** is Design Guardrail #7 — a rule that says SVG should only be used for decorative graphics, not for text, labels, or interactive UI elements.

Same rule-in-rulebook pattern as E008 and E013.

**Score (0–10):** ___

---

### E019

**The connection:** The AI rulebook lists "doc audit" as one of the skills the AI can activate.

**Document A** is the AI rulebook (AGENTS.md).

**Document B** is the Doc Audit skill — it runs periodic health checks on the AI's own knowledge base, looking for broken links, stale references, and inconsistencies.

Same skill-registration pattern as E003, E009, E012.

**Score (0–10):** ___

---

### E020

**The connection:** A bug report about admin view problems explicitly says "See EAP-054."

**Document A** is bug report ENG-021: "Admin view doesn't reflect the website structure." A complaint that the admin dashboard didn't match the actual site layout.

**Document B** is known mistake EAP-054: "Client Mutation Without router.refresh() in App Router." A mistake about changing data on the client side without telling the page framework to refresh — so the screen shows stale content.

The bug report explicitly says "Anti-pattern: See EAP-054" — a direct, named reference.

**Score (0–10):** ___

---

## Group 2 — Medium confidence (score 0.6) — 20 connections

The system is moderately confident. These were detected from regular links or "Related:" mentions (less definitive than explicit "See:" citations).

---

### E021

**The connection:** A bug report mentions a known mistake using "Related:" phrasing (not the definitive "See:").

**Document A** is bug report ENG-200: "Frozen-Point TypeError from link popover focus stealing Lexical selection." A technical issue where a text editor component crashed because focus was being stolen by a popup.

**Document B** is known mistake EAP-118: "Native Selection moves across Lexical editors without blurring the outgoing surface." A documented pattern about focus management between text editors.

The bug report says "Related: EAP-118" — it's connected but the author hedged with "Related" instead of committing to "See."

**Score (0–10):** ___

---

### E022

**The connection:** One section of the engineering feedback log contains a link to another entry in the same log.

**Document A** is a repeated section of bug report ENG-104 — a second occurrence of the same issue logged again.

**Document B** is bug report ENG-230 — a different engineering issue.

The link appears in a "Last updated" header note at the top of the log file, not within the entry's own narrative. It was likely added during a batch update rather than as a deliberate "these two issues are related" cross-reference.

**Score (0–10):** ___

---

### E023

**The connection:** The Design overview page has a table-of-contents link to its "Layout" sub-page.

**Document A** is the Design hub — the main design overview page. It lists all design sub-topics.

**Document B** is the Layout sub-page — it covers rules about layout integrity, like "no overlapping elements" and spacing guidelines.

This is a navigational index link — like a table of contents entry pointing to Chapter 2.

**Score (0–10):** ___

---

### E024

**The connection:** An engineering anti-pattern entry's file has a metadata comment referencing the knowledge graph specification.

**Document A** is known mistake EAP-120: "Client analytics init only in a parent useEffect while children track in useEffect." A mistake about initializing analytics in the wrong order.

**Document B** is the Knowledge Graph specification — the technical document that defines how all documents in the knowledge base are connected.

The link is inside an HTML comment (invisible metadata) at the top of the file — infrastructure plumbing, not part of the anti-pattern's actual content.

**Score (0–10):** ___

---

### E025

**The connection:** A design bug report says "Related: AP-065" — a loose match to a design anti-pattern.

**Document A** is design feedback FB-178: "CollaborationLoop overuses brand accent — neutralize decorative color." A complaint that a component on the Elan case study used too much of the brand's accent color.

**Document B** is design anti-pattern AP-065: "Centered-Align Footer Text Below Left-Aligned Form Elements." A known design mistake about misaligned text.

The feedback says "Related: AP-065" but the system flagged it as a "loose match" — the connection seems approximate.

**Score (0–10):** ___

---

### E026

**The connection:** The Content overview page has a table-of-contents link to its "Conversion Funnel" sub-page.

**Document A** is the Content Strategy hub — the main content overview.

**Document B** is the Conversion Funnel sub-page — it explains how hiring managers move through the portfolio (from landing page to case study to "should I interview this person?").

Navigational index link. Same pattern as E023.

**Score (0–10):** ___

---

### E027

**The connection:** A section about auto-generated node types in the knowledge graph spec links to the cleanup decisions document.

**Document A** is a section of the Knowledge Graph spec that discusses "synthetic types" — node categories that are created automatically by the build system rather than written by hand.

**Document B** is the Hygiene Decisions document — a record of cleanup decisions made during the Graph Hygiene Remediation project, explaining why the graph is structured the way it is.

The section references the decisions document for context on why edge types have no authority ranking.

**Score (0–10):** ___

---

### E028

**The connection:** The Content overview page has a table-of-contents link to its "Analytics & Measurement" sub-page.

**Document A** is the Content Strategy hub.

**Document B** is the Analytics Measurement sub-page — it covers how to interpret analytics data and decide what to measure for portfolio optimization.

Navigational index link. Same pattern as E023, E026.

**Score (0–10):** ___

---

### E029

**The connection:** The Content overview page has a table-of-contents link to its "Seniority Signals" sub-page.

**Document A** is the Content Strategy hub.

**Document B** is the Seniority Signals sub-page — it explains how hiring managers calibrate a candidate's seniority level from portfolio content. Key insight: "Seniority is not read from a title on the page. It's read from how the designer talks about their work."

Navigational index link. Same pattern as E023, E026, E028.

**Score (0–10):** ___

---

### E030

**The connection:** An engineering sub-page about analytics tracking links to the shared analytics reference.

**Document A** is the Analytics Instrumentation sub-page (under Engineering) — it covers the technical implementation of client-side analytics: Mixpanel integration, event naming conventions, and tracking hooks.

**Document B** is the Client Analytics Reference — a shared document used by both engineering and content teams. It explains what events exist and what they measure, without being specific to either team's work.

An engineering-specific page links to a shared resource that both teams use. Cross-referencing a sibling document.

**Score (0–10):** ___

---

### E031

**The connection:** A bug report says "Related: EAP-119" — a loose match to a known mistake.

**Document A** is bug report ENG-197: "Lexical editor crashes on CMS data with Payload-format links." The rich text editor broke when encountering links in a certain format from the content management system.

**Document B** is known mistake EAP-119: "Using @lexical/link LinkNode for Content Rendered by Payload's convertLexicalToHTML." A known issue about incompatible link formats between two systems.

The bug report says "Related: EAP-119" — flagged as a "loose match." The topics are clearly in the same area (Lexical editor + link formatting).

**Score (0–10):** ___

---

### E032

**The connection:** A content bug report says "Related: CAP-003" — a loose match to a content anti-pattern.

**Document A** is content feedback CFB-013: "Spacing and radius is irrelevant — section is about color, token naming was missing." A complaint about a case study section that discussed the wrong topic.

**Document B** is content anti-pattern CAP-003: "Screenshot Gallery Without Narrative Context." A known content mistake about showing screenshots without explaining what they demonstrate.

Flagged as a "loose match." The feedback is about content organization; the anti-pattern is about screenshots lacking context. Tangentially related.

**Score (0–10):** ___

---

### E033

**The connection:** The Engineering overview page has a table-of-contents link to its "Debugging" sub-page.

**Document A** is the Engineering hub.

**Document B** is the Debugging sub-page — covers debugging methodology, with the key principle: "Diagnose Before You Patch."

Navigational index link. Same pattern as E023.

**Score (0–10):** ___

---

### E034

**The connection:** The Engineering overview page has a table-of-contents link to its "Versioning" sub-page.

**Document A** is the Engineering hub.

**Document B** is the Multi-App Versioning sub-page — covers how version numbers are managed across the multiple apps in the project.

Navigational index link. Same pattern as E023, E033.

**Score (0–10):** ___

---

### E035

**The connection:** The "Storage" sub-page says "for external video embeds, see the Media Embeds page."

**Document A** is the Storage sub-page (under Engineering) — covers media and file storage using Supabase Storage: how uploaded files (images, videos, documents) are hosted.

**Document B** is the Media Embeds sub-page (also under Engineering) — covers external video embeds from YouTube, Vimeo, and Loom, which are rendered differently from uploaded files.

The storage page clarifies its scope: "File hosting only. External video embeds bypass storage entirely — see media-embeds.md." Two sibling pages defining their boundaries.

**Score (0–10):** ___

---

### E036

**The connection:** The knowledge graph spec's table of contents links to its own "Cluster Validation" section further down in the same document.

**Document A** is the table of contents at the top of the Knowledge Graph specification.

**Document B** is Section 14 of the same document — "Cluster Validation," which defines how groups of related nodes should be checked for structural integrity.

An internal navigation link within a single document. Like an index entry saying "see page 47."

**Score (0–10):** ___

---

### E037

**The connection:** The knowledge graph spec's table of contents links to its own "Maintenance Rules" section further down.

Same pattern as E036 — an internal table-of-contents link pointing to Section 16 ("Maintenance Rules") in the same document.

**Score (0–10):** ___

---

### E038

**The connection:** The Content overview page has a table-of-contents link to its "Portfolio Coherence" sub-page.

**Document A** is the Content Strategy hub.

**Document B** is the Portfolio Coherence Manifest — "a living inventory tracking stylistic and structural diversity across all active case studies. Ensures the portfolio doesn't repeat the same format or tone."

Navigational index link. Same pattern as E026, E028, E029.

**Score (0–10):** ___

---

### E039

**The connection:** The "Media Embeds" sub-page links back to the "Storage" sub-page.

The reverse of E035 — the media embeds page says "uploaded video/image files are handled by the storage system." Two sibling pages pointing at each other to clarify their boundaries.

**Score (0–10):** ___

---

### E040

**The connection:** The knowledge graph spec's table of contents links to its own "ID Naming" section further down.

Same pattern as E036 and E037 — an internal table-of-contents link pointing to Section 3 ("ID Naming") in the same document.

**Score (0–10):** ___

---

## Group 3 — Low confidence (score 0.5) — 20 connections

The system has low confidence. These were detected from "bare" mentions — an ID appeared in the text, but the system isn't sure it's a deliberate cross-reference vs. just a coincidental appearance.

---

### E041

**The connection:** The Engineering overview page's summary table lists known mistake EAP-115 in a row of issue statistics.

**Document A** is the Engineering hub — its tables summarize recurring problems with counts and severity.

**Document B** is known mistake EAP-115: "Fix Verification Deferred to 'Next Live Session' Under Webpack HMR Staleness." A mistake where the AI postponed verifying a fix, blaming a stale dev server, instead of just restarting it.

The ID appears in a table row alongside many other IDs. The hub was listing it for statistical tracking, not making a specific "go read this" reference.

**Score (0–10):** ___

---

### E042

**The connection:** A section of the AI's instructions mentions design feedback FB-040 as an example.

**Document A** is "Knowledge Route D" — a section of the AI's instruction manual that explains how to handle feedback touching multiple categories (e.g., both design and engineering).

**Document B** is design feedback FB-040: "It's really unclear about what the second field is." A user complaint about confusing form field labels.

The feedback ID appears in instructional text as an example of multi-category documentation. It's used to teach a concept, not to say "go read this specific report."

**Score (0–10):** ___

---

### E043

**The connection:** Bug report ENG-253 mentions bug report ENG-252 because they're adjacent entries in the same log.

**Document A** is ENG-253: "Canvas label still rendering on hover despite tooltip — own paintNode was the source." A bug about graph canvas labels showing up when they shouldn't.

**Document B** is ENG-252: "Ghost node label still visible despite nodeLabel suppression." A very similar bug about ghost labels persisting.

The two entries are literally next to each other in the log (252 and 253 are consecutive). Entry 253's text includes entry 252's anchor tag because they're physically adjacent — likely not a deliberate "these are related" cross-reference, though the topics are nearly identical.

**Score (0–10):** ___

---

### E044

**The connection:** The ID renumbering tracker lists ENG-202 as one of the entries it renumbered.

**Document A** is the Engineering Renumber Log — a housekeeping document that tracks when feedback entries had their ID numbers reassigned (e.g., because of duplicate anchors or reorganization).

**Document B** is bug report ENG-202: "Company-personalized badge on home page + essay badge cleanup." A feature/bug report about badge UI elements.

The renumber log lists ENG-202 in a table of "which line numbers changed and which IDs were affected." This is a bookkeeping reference about administrative reshuffling — it says nothing about the content of ENG-202 itself.

**Score (0–10):** ___

---

### E045

**The connection:** The "Voice & Style" content guide mentions content anti-pattern CAP-023.

**Document A** is the Voice & Style sub-page — it defines the writing voice and style rules for all case studies, covering tone, word choice, and how to maintain authenticity during editing.

**Document B** is content anti-pattern CAP-023: "Voice Flattening During Refinement." A known mistake where the writing voice gets watered down and generic as text goes through multiple rounds of editing.

The voice guide references CAP-023 in a list of related anti-patterns. The anti-pattern is directly about voice — which is exactly what this document covers.

**Score (0–10):** ___

---

### E046

**The connection:** An engineering bug report mentions a design feedback entry about the same visual issue.

**Document A** is ENG-139: "Browser native text clipping unfixable via CSS." An engineering investigation concluding that a font rendering problem can't be fixed with code.

**Document B** is design feedback FB-129: "Login page — serif glyph clipping on input elements." A user complaint about ugly text cutoffs on the login page.

Both entries document the same incident — engineering tried to fix the clipping that design reported. The engineering entry references the design report because they're about the same visual bug.

**Score (0–10):** ___

---

### E047

**The connection:** A content anti-pattern entry lists an engineering bug report in its "Reference" footnote.

**Document A** is content anti-pattern CAP-032: "Redundant Noun in Labelled Count." A content writing mistake about phrasing like "5 projects completed" when the label already says "Projects."

**Document B** is bug report ENG-233: "Systematic fix for missing paragraph spacing in richText prose containers." An engineering fix for paragraph spacing in the content management system.

The anti-pattern lists ENG-233 in a footnote alongside other reference IDs. The content issue (redundant wording) and the engineering issue (paragraph spacing) are loosely related — both affect how text appears — but they're about different problems.

**Score (0–10):** ___

---

### E048

**The connection:** The Engram case study mentions a content feedback entry in parentheses.

**Document A** is the Engram case study dossier (formerly called "Élan Design System") — the detailed case study about a design system project in the portfolio.

**Document B** is content feedback CFB-045: "The tag here needs to be improved. What is this case study really about?" A user complaint about the case study's labeling not capturing its essence.

The case study mentions CFB-045 briefly in parentheses as evidence for a problem it describes.

**Score (0–10):** ___

---

### E049

**The connection:** The Engineering overview page's issue table lists ENG-123 as one of 54 related CMS editing incidents.

**Document A** is the Engineering hub with its issue-tracking tables.

**Document B** is bug report ENG-123: "Hero image upload — uniqueness error + display disconnect." A specific issue with uploading hero images in the CMS.

The ID appears in a long chain of CMS-related incidents (ENG-027 through ENG-123 and beyond — 54 total). It's one of many in a statistical list, not a focused "go read this specific entry" reference.

**Score (0–10):** ___

---

### E050

**The connection:** Bug report ENG-020 reflects on a pattern and compares it to ENG-012.

**Document A** is ENG-020: "Why are there so many constant-like errors that I have to tell you?" A frustrated user message about recurring mistakes.

**Document B** is ENG-012: "You need to document things. Why are you not following it?" An earlier frustrated user message about the AI not following its own documentation.

ENG-020 includes a "Meta-lesson" paragraph: "This is the same escalation pattern as ENG-012 (documentation skips)." The author is deliberately drawing a parallel between two recurring frustration patterns.

**Score (0–10):** ___

---

### E051

**The connection:** The Engineering overview page's issue table lists ENG-087 as one of 10+ hydration mismatch incidents.

**Document A** is the Engineering hub with its issue-tracking tables.

**Document B** is ENG-087: "Hydration failed — sidebar icon SVG differs between server and client (lucide-react barrel import)." A specific bug where the server-rendered HTML didn't match what the browser produced, causing a crash.

The ID appears in a table row listing 10+ related hydration mismatch incidents. It's one of many in a sequence, not a focused reference.

**Score (0–10):** ___

---

### E052

**The connection:** Bug report ENG-031 traces its history back to ENG-027 as the start of a recurring problem.

**Document A** is ENG-031: "I don't think the actual configuration dashboard is reflecting the additions." A complaint about the CMS admin interface not showing recent changes.

**Document B** is ENG-027: "Inline CMS editing — Figma-like hover/edit/save on frontend." The original feature request for inline editing on the website.

ENG-031 says: "CMS UX / inline editing — fifth occurrence (ENG-027→031). Escalation trigger activated." It's deliberately tracing a chain of five related incidents back to the first one.

**Score (0–10):** ___

---

### E053

**The connection:** The Content overview page's issue table mentions content anti-pattern CAP-025 in a summary row.

**Document A** is the Content Strategy hub with its issue-tracking tables.

**Document B** is content anti-pattern CAP-025: "Floating Metric." A content mistake about putting a prominent number (like "50+ projects") on the page without explaining how it was calculated or what it means.

The ID appears in a table row: "Floating metric (hero number without derivation in scan window) — 1 occurrence — Critical." It's listed for tracking purposes.

**Score (0–10):** ___

---

### E054

**The connection:** Engineering entry ENG-187 mentions design feedback FB-163 in a header note.

**Document A** is ENG-187: "Why tf are both states thicker and thicker?? Default should be 1px, thick active 2px." A frustrated user message about button border widths growing progressively thicker.

**Document B** is design feedback FB-163 — the same complaint filed from the design perspective: "Why tf are both states thicker and thicker?"

The cross-reference appears in a "Last updated" header note at the top of the log file — likely added during a batch update, not as a deliberate "see also" within the entry's own narrative.

**Score (0–10):** ___

---

### E055

**The connection:** Engineering entry ENG-170 mentions design feedback FB-157 in a header note.

**Document A** is ENG-170: "Split media.muted into capability + default-state; remove audio control from videoEmbed." An engineering decision about video settings architecture.

**Document B** is design feedback FB-157: "You're conflating two different things, and that's very dangerous." A user complaint about the AI mixing up two separate concepts (audio capability vs. default mute state) in video settings.

Same header-note pattern as E054 — the cross-reference is in housekeeping metadata, not in the entry's narrative.

**Score (0–10):** ___

---

### E056

**The connection:** Engineering entry ENG-102 mentions known mistake EAP-007 in passing.

**Document A** is ENG-102: "I don't see the label component being there in the playground shell." A complaint about a missing UI component in the playground.

**Document B** is known mistake EAP-007: "Adding Components to Main Site Without Playground Preview" (same anti-pattern from E011).

The entry mentions EAP-007 in a note about passing a cross-app parity check — the anti-pattern is tangentially relevant (both are about playground consistency) but the entry isn't specifically about this anti-pattern.

**Score (0–10):** ___

---

### E057

**The connection:** The case study review checklist mentions content feedback CFB-019 briefly.

**Document A** is the Case Study Review Checklist (§14) — a quality checklist used when writing or revising case studies, covering structure, narrative flow, and evidence quality.

**Document B** is content feedback CFB-019: "The information architecture here is just wrong — architecture first, rationale second." A complaint about a case study presenting information in the wrong order.

The checklist mentions "CFB-019.)" in parentheses — a very brief inline citation.

**Score (0–10):** ___

---

### E058

**The connection:** The Design overview page's issue table mentions design feedback FB-105 in a row.

**Document A** is the Design hub with its issue-tracking tables.

**Document B** is design feedback FB-105: "Block list content indented ~24px vs intro blurb in admin mode." A complaint about inconsistent indentation when editing content in admin mode.

The ID appears in a table row about "Admin controls displacing component content (overlay separation)" — listed for tracking purposes.

**Score (0–10):** ___

---

### E059

**The connection:** The candidate anti-patterns list cites ENG-266 as evidence for a potential new anti-pattern.

**Document A** is the Candidate Anti-Patterns list — a scratch file of patterns that have been observed but haven't yet been promoted to the official known-mistakes catalogs. Each entry records a failure mode that surfaced during evaluation.

**Document B** is ENG-266: "Baseline eval transcript capture — designed an Export-Transcript + copy-paste workflow without probing the JSONL on disk first." A report about the AI designing a complex workaround without first checking if a simpler solution already existed.

The candidate list cites ENG-266 as evidence for a proposed anti-pattern about "designing workflows without probing the underlying data layer first."

**Score (0–10):** ___

---

### E060

**The connection:** The Engram case study lists design feedback FB-056 in a references section.

**Document A** is the Engram case study dossier (same case study as E048) — the portfolio case study about a design system project.

**Document B** is design feedback FB-056: "Doing all this on the button — map to spacing tokens." A user directive about using proper design tokens for spacing instead of ad-hoc values on buttons.

The case study lists FB-056 in a "Design:" reference list alongside other feedback entries, gathering evidence from past feedback that shaped the project.

**Score (0–10):** ___

---

## Summary

After scoring, count how many edges fall into each range:

| Score range | Category | Count |
|-------------|----------|-------|
| 0 | ambiguous | |
| 1–3 | noise | |
| 4–6 | relevant | |
| 7–10 | authoritative | |
| | **Total** | **60** |

> If ambiguous (score = 0) exceeds 12 entries (20%), the scoring rubric needs revision before proceeding.

---

> **Changelog**
>
> - **v3** (2026-05-03): Complete rewrite. Every node described in plain English with synthesized summaries. No code, file paths, or jargon. Relationships described as sentences, not FROM/TO/edge-type tables.
> - **v2** (2026-05-03): Added raw context snippets (still too technical — pasted file headers verbatim).
> - **v1** (2026-05-03): Plain-language explanations with 0–10 numeric scale, no context.
> - **v0** (2026-05-03): Raw technical data (machine-readable).
