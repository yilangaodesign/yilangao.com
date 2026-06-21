---
type: eval-spec
id: eval-confidence-sample-v4
topics: [eval, knowledge-graph, confidence]
references:
  - docs/eval-confidence-sample-v0.md
  - docs/eval-confidence-rubric.md
---

# How Related Are These?

> **Version:** v4 — [changelog at bottom](#changelog) | [lookup table](#lookup) to trace items back to v0 edge IDs
>
> Your portfolio site's AI assistant has a knowledge base of ~1,000 documents, all linked together. We picked 60 of those links and need you to judge each one.
>
> For each link below, you'll see what both documents are about. Then answer:
>
> **"Document A links to Document B. How related are they?"**
>
> Pick one (write the letter on the blank line):
>
> | | Label | When to use it |
> |---|-------|----------------|
> | **A** | Can't tell | Not enough context to judge |
> | **B** | Not related | These don't really belong together |
> | **C** | Loosely related | Same general area, but not a strong connection |
> | **D** | Strongly related | This connection clearly makes sense |

---

### 1.

**Document A** is the Content hub — the main content overview listing all sub-topics.

**Document B** is the Conversion Funnel sub-page — it explains how hiring managers move through the portfolio, from landing page to case study to "should I interview this person?"

Document A has a table-of-contents link to Document B.

**How related are these?** ___
A) Can't tell · B) Not related · C) Loosely related · D) Strongly related

---

### 2.

**Document A** is bug report ENG-031: "I don't think the configuration dashboard is reflecting the additions." The CMS admin interface wasn't showing recent changes.

**Document B** is bug report ENG-027: "Inline CMS editing — Figma-like hover/edit/save on frontend." The original feature request for inline editing.

Document A says: "This is the fifth time this kind of CMS editing issue has happened." It deliberately traces a chain of recurring incidents back to Document B, the first one.

**How related are these?** ___
A) Can't tell · B) Not related · C) Loosely related · D) Strongly related

---

### 3.

**Document A** is the Voice & Style content guide — it defines writing voice and tone rules for all case studies.

**Document B** is content mistake CAP-023: "Voice Flattening During Refinement." A known error where the writing voice gets watered down and generic through multiple rounds of editing.

Document A mentions Document B in a list of related mistakes. Document B is directly about voice — exactly what Document A covers.

**How related are these?** ___
A) Can't tell · B) Not related · C) Loosely related · D) Strongly related

---

### 4.

**Document A** is the Content hub — issue tables tracking content problems.

**Document B** is content mistake CAP-025: "Floating Metric." A content error about putting a prominent number (like "50+ projects") on the page without explaining how it was calculated.

Document A's table lists Document B in a row: "Floating metric — 1 occurrence — Critical."

**How related are these?** ___
A) Can't tell · B) Not related · C) Loosely related · D) Strongly related

---

### 5.

**Document A** is the AI rulebook.

**Document B** is Design Guardrail #7: "NEVER use SVG to render text, labels, or component UI." SVG should only be used for decorative graphics.

Document A physically contains Document B.

**How related are these?** ___
A) Can't tell · B) Not related · C) Loosely related · D) Strongly related

---

### 6.

**Document A** is the About Page content guide — it explains how to write the portfolio's About page. Key advice: "Hiring managers visit it when already interested. It should reinforce, not introduce, the value proposition."

**Document B** is the Content Strategy hub — the main overview page for all content knowledge, listing 19+ sub-topics.

Document A is one of those sub-topics. It declares itself as belonging to Document B.

**How related are these?** ___
A) Can't tell · B) Not related · C) Loosely related · D) Strongly related

---

### 7.

**Document A** is the Content Anti-Patterns catalog — the master list of known content writing mistakes.

**Document B** is mistake CAP-005: "Overloaded Project Count." A content error about claiming too many projects or inflating numbers.

Document A contains Document B in its "Information Architecture" category.

**How related are these?** ___
A) Can't tell · B) Not related · C) Loosely related · D) Strongly related

---

### 8.

**Document A** is the Engineering Anti-Patterns catalog.

**Document B** is mistake EAP-068: "Treating TCP Listen as a Health Check for Dev Servers." A mistake about assuming a dev server is ready just because its network port is open, when the server hasn't actually finished loading.

Document A contains Document B in its Dev Workflow category.

**How related are these?** ___
A) Can't tell · B) Not related · C) Loosely related · D) Strongly related

---

### 9.

**Document A** is the Engineering Renumber Log — a housekeeping file that tracks when bug report IDs were reassigned (e.g., because of duplicates or reorganization).

**Document B** is bug report ENG-202: "Company-personalized badge on home page + essay badge cleanup." A report about badge UI changes.

Document A lists Document B in a table showing which IDs changed line numbers. It says nothing about what Document B is about — just that its ID was administratively reshuffled.

**How related are these?** ___
A) Can't tell · B) Not related · C) Loosely related · D) Strongly related

---

### 10.

**Document A** is known mistake EAP-120: "Client analytics init only in a parent useEffect while children track in useEffect." A mistake about initializing analytics tracking in the wrong order.

**Document B** is the Knowledge Graph specification — the document that defines how all documents in the knowledge base are connected.

Document A has a link to Document B inside an invisible HTML comment (metadata) at the top of the file — infrastructure plumbing, not part of Document A's actual content.

**How related are these?** ___
A) Can't tell · B) Not related · C) Loosely related · D) Strongly related

---

### 11.

**Document A** is the Case Study Review Checklist — a quality checklist for writing and revising case studies.

**Document B** is content feedback CFB-019: "The information architecture here is just wrong — architecture first, rationale second." A complaint about a case study presenting information in the wrong order.

Document A mentions Document B briefly in parentheses.

**How related are these?** ___
A) Can't tell · B) Not related · C) Loosely related · D) Strongly related

---

### 12.

**Document A** is bug report ENG-170: "Split media.muted into capability + default-state." An engineering decision about restructuring video settings.

**Document B** is design feedback FB-157: "You're conflating two different things, and that's very dangerous." A complaint about mixing up audio capability with default mute state.

Document A's link to Document B is in a "Last updated" header note — a batch update, not within Document A's own narrative.

**How related are these?** ___
A) Can't tell · B) Not related · C) Loosely related · D) Strongly related

---

### 13.

**Document A** is the Analytics Instrumentation sub-page — covers the technical implementation of analytics tracking (Mixpanel, event naming, tracking hooks).

**Document B** is the Client Analytics Reference — a shared document used by both engineering and content teams explaining what events exist and what they measure.

Document A links to Document B — the shared reference it depends on.

**How related are these?** ___
A) Can't tell · B) Not related · C) Loosely related · D) Strongly related

---

### 14.

**Document A** is a repeated section of bug report ENG-104 — a second occurrence of the same issue.

**Document B** is bug report ENG-230 — a different engineering issue.

Document A's link to Document B is in a "Last updated" header note at the top of the log file. It was probably added during a batch update, not as a deliberate "these two are related" cross-reference.

**How related are these?** ___
A) Can't tell · B) Not related · C) Loosely related · D) Strongly related

---

### 15.

**Document A** is the Engineering Anti-Patterns catalog — the master list of known engineering mistakes.

**Document B** is mistake EAP-110: "Reorder-Only DnD on a 2-D Layout." A mistake about implementing drag-and-drop that only works in one dimension when the layout is two-dimensional.

Document A contains Document B.

**How related are these?** ___
A) Can't tell · B) Not related · C) Loosely related · D) Strongly related

---

### 16.

**Document A** is a section of the Knowledge Graph spec about auto-generated node types — categories the build system creates automatically.

**Document B** is the Hygiene Decisions document — a record of cleanup decisions explaining why the knowledge base is structured the way it is.

Document A links to Document B for context on authority ranking.

**How related are these?** ___
A) Can't tell · B) Not related · C) Loosely related · D) Strongly related

---

### 17.

**Document A** is the Engineering hub.

**Document B** is the Debugging sub-page — covers debugging methodology with the principle "Diagnose Before You Patch."

Document A has a table-of-contents link to Document B.

**How related are these?** ___
A) Can't tell · B) Not related · C) Loosely related · D) Strongly related

---

### 18.

**Document A** is bug report ENG-021: "Admin view doesn't reflect the website structure." The admin dashboard didn't match the actual site layout.

**Document B** is known mistake EAP-054: "Client Mutation Without router.refresh()." A mistake about changing data without telling the page to refresh — so the screen shows stale content.

Document A explicitly says "Anti-pattern: See EAP-054" — pointing directly to Document B.

**How related are these?** ___
A) Can't tell · B) Not related · C) Loosely related · D) Strongly related

---

### 19.

**Document A** is bug report ENG-139: "Browser native text clipping unfixable via CSS." An engineering investigation concluding a font rendering problem can't be fixed with code.

**Document B** is design feedback FB-129: "Login page — serif glyph clipping on input elements." A user complaint about ugly text cutoffs on the login page.

Document A and Document B describe the same visual bug from different perspectives — Document A (engineering) tried to fix what Document B (design) reported.

**How related are these?** ___
A) Can't tell · B) Not related · C) Loosely related · D) Strongly related

---

### 20.

**Document A** is the Engineering hub — issue tables tracking recurring problems.

**Document B** is known mistake EAP-115: "Fix Verification Deferred to 'Next Live Session.'" A mistake where the AI postponed verifying a fix, blaming a stale dev server, instead of just restarting it.

Document A's table lists Document B's ID in a row of issue statistics — one of many IDs, not a focused reference.

**How related are these?** ___
A) Can't tell · B) Not related · C) Loosely related · D) Strongly related

---

### 21.

**Document A** is the Design hub — the main overview for all design knowledge.

**Document B** is the Layout sub-page — it covers layout rules like "no overlapping elements" and spacing guidelines.

Document A has a table-of-contents link to Document B.

**How related are these?** ___
A) Can't tell · B) Not related · C) Loosely related · D) Strongly related

---

### 22.

**Document A** is design feedback FB-178: "CollaborationLoop overuses brand accent — neutralize decorative color." A complaint about a component using too much of the brand's accent color.

**Document B** is design mistake AP-065: "Centered-Align Footer Text Below Left-Aligned Form Elements." A known mistake about misaligned text.

Document A says "Related: AP-065" — flagged as a loose match. Document A is about color overuse; Document B is about text alignment.

**How related are these?** ___
A) Can't tell · B) Not related · C) Loosely related · D) Strongly related

---

### 23.

**Document A** is the Release Log Archive — a historical record of past software releases.

**Document B** is Release #14 — a specific release entry inside the archive.

Document A physically contains Document B.

**How related are these?** ___
A) Can't tell · B) Not related · C) Loosely related · D) Strongly related

---

### 24.

**Document A** is a health-check report that analyzed the structure of the entire knowledge base — how many documents exist, how they're linked, whether any are orphaned.

**Document B** is an internal planning document that designed the evaluation experiments. It lives outside the knowledge base itself.

Document A was written to fulfill Document B's requirements.

**How related are these?** ___
A) Can't tell · B) Not related · C) Loosely related · D) Strongly related

---

### 25.

**Document A** is the AI rulebook.

**Document B** is Engineering Guardrail #15: "NEVER use barrel imports from lucide-react in the playground." A rule preventing the AI from importing icons using a shortcut that causes rendering mismatches.

Document A physically contains Document B.

**How related are these?** ___
A) Can't tell · B) Not related · C) Loosely related · D) Strongly related

---

### 26.

**Document A** is the Design hub — the main design overview with issue-tracking tables.

**Document B** is design feedback FB-105: "Block list content indented ~24px vs intro blurb in admin mode." A complaint about inconsistent indentation in admin editing mode.

Document A's issue table lists Document B in a row about "admin controls displacing content."

**How related are these?** ___
A) Can't tell · B) Not related · C) Loosely related · D) Strongly related

---

### 27.

**Document A** is the Candidate Anti-Patterns list — a scratch file of potential mistakes that haven't been officially promoted yet.

**Document B** is bug report ENG-266: "Designed an Export-Transcript workflow without checking if a simpler solution already existed on disk." The AI built a complex workaround without first checking if the data was already available.

Document A cites Document B as evidence for a proposed new mistake about "designing workflows without checking the underlying data first."

**How related are these?** ___
A) Can't tell · B) Not related · C) Loosely related · D) Strongly related

---

### 28.

**Document A** is bug report ENG-020: "Why are there so many constant-like errors that I have to tell you?" A frustrated user message about recurring mistakes.

**Document B** is bug report ENG-012: "You need to document things. Why are you not following it?" An earlier frustrated message about the AI not following its own documentation.

Document A says: "This is the same escalation pattern as ENG-012 (documentation skips)." It deliberately compares its pattern to Document B's.

**How related are these?** ___
A) Can't tell · B) Not related · C) Loosely related · D) Strongly related

---

### 29.

**Document A** is the AI rulebook — the master instruction file.

**Document B** is Design Guardrail #1: "NEVER use inline styles — always use Tailwind classes." A rule preventing hardcoded styling.

Document A physically contains Document B.

**How related are these?** ___
A) Can't tell · B) Not related · C) Loosely related · D) Strongly related

---

### 30.

**Document A** is the knowledge graph spec's table of contents.

**Document B** is Section 16 of the same document — "Maintenance Rules."

Document A links to Document B further down in the same file. Same-file navigation.

**How related are these?** ___
A) Can't tell · B) Not related · C) Loosely related · D) Strongly related

---

### 31.

**Document A** is bug report ENG-200: "Frozen-Point TypeError from link popover focus stealing Lexical selection." A text editor component crashed because a popup was stealing focus.

**Document B** is known mistake EAP-118: "Native Selection moves across Lexical editors without blurring the outgoing surface." A known bug pattern about focus management between text editors.

Document A says "Related: EAP-118" — linking to Document B, but the author hedged with "Related" instead of a definitive "See."

**How related are these?** ___
A) Can't tell · B) Not related · C) Loosely related · D) Strongly related

---

### 32.

**Document A** is bug report ENG-102: "I don't see the label component in the playground shell." A complaint about a missing UI component.

**Document B** is known mistake EAP-007: "Adding Components to Main Site Without Playground Preview." A known error about skipping playground testing.

Document A mentions Document B in passing while noting a parity check. The topic (playground consistency) overlaps, but Document A isn't specifically about Document B.

**How related are these?** ___
A) Can't tell · B) Not related · C) Loosely related · D) Strongly related

---

### 33.

**Document A** is bug report ENG-019: "Console Error — script tag warning persists; hydration mismatch." A real development issue.

**Document B** is known mistake EAP-013: "Script Tags in React 19 / Next.js 16 Component Trees." A known pattern of using script tags incorrectly.

Document A says "Anti-patterns: EAP-013 corrected (third time)" — explicitly naming Document B and noting this is the third occurrence.

**How related are these?** ___
A) Can't tell · B) Not related · C) Loosely related · D) Strongly related

---

### 34.

**Document A** is a section of the AI instructions explaining how to handle feedback that touches multiple categories (e.g., both design and engineering).

**Document B** is design feedback FB-040: "It's really unclear about what the second field is." A user complaint about confusing form labels.

Document A uses Document B as an example to teach a concept. The link is instructional, not a recommendation to "go read Document B."

**How related are these?** ___
A) Can't tell · B) Not related · C) Loosely related · D) Strongly related

---

### 35.

**Document A** is the Engineering hub.

**Document B** is the Versioning sub-page — covers how version numbers are managed across the project's multiple apps.

Document A has a table-of-contents link to Document B.

**How related are these?** ___
A) Can't tell · B) Not related · C) Loosely related · D) Strongly related

---

### 36.

**Document A** is the Content hub.

**Document B** is the Analytics & Measurement sub-page — it covers how to interpret analytics data and decide what to measure for portfolio optimization.

Document A has a table-of-contents link to Document B.

**How related are these?** ___
A) Can't tell · B) Not related · C) Loosely related · D) Strongly related

---

### 37.

**Document A** is the Engineering hub — the main overview page that tracks all engineering issues and sub-topics.

**Document B** is known mistake EAP-042: "Reporting Playground Changes as Done Without Flushing Cache." The AI claimed work was finished without clearing the build cache — so changes never took effect. Happened 6+ times.

Document A's issue table explicitly references Document B with "See EAP-042."

**How related are these?** ___
A) Can't tell · B) Not related · C) Loosely related · D) Strongly related

---

### 38.

**Document A** is content mistake CAP-032: "Redundant Noun in Labelled Count." A writing error like saying "5 projects completed" when the label already says "Projects."

**Document B** is bug report ENG-233: "Systematic fix for missing paragraph spacing in richText prose containers." An engineering fix for paragraph spacing.

Document A lists Document B in a footnote alongside other reference IDs. Document A's issue (redundant wording) and Document B's fix (paragraph spacing) are different problems, loosely related only because both affect how text appears.

**How related are these?** ___
A) Can't tell · B) Not related · C) Loosely related · D) Strongly related

---

### 39.

**Document A** is the Engineering hub — the main engineering overview with issue-tracking tables.

**Document B** is known mistake EAP-007: "Adding Components to Main Site Without Playground Preview." A critical, escalated problem about adding features to the live site without first testing them in the playground.

Document A's issue table flags Document B as critical and escalated, referencing multiple related incidents.

**How related are these?** ___
A) Can't tell · B) Not related · C) Loosely related · D) Strongly related

---

### 40.

**Document A** is the AI rulebook.

**Document B** is the Doc Audit skill — it runs health checks on the AI's knowledge base, looking for broken links and inconsistencies.

Document A lists Document B in its "available skills" section.

**How related are these?** ___
A) Can't tell · B) Not related · C) Loosely related · D) Strongly related

---

### 41.

**Document A** is the Engram case study — a portfolio case study about a design system project (formerly called "Élan Design System").

**Document B** is content feedback CFB-045: "The tag here needs to be improved. What is this case study really about?" A complaint about the case study's labeling not capturing its essence.

Document A mentions Document B briefly in parentheses.

**How related are these?** ___
A) Can't tell · B) Not related · C) Loosely related · D) Strongly related

---

### 42.

**Document A** is the knowledge graph spec's table of contents (at the top of a long document).

**Document B** is Section 14 of the same document — "Cluster Validation," about checking groups of related documents for structural problems.

Document A links to Document B further down in the same file.

**How related are these?** ___
A) Can't tell · B) Not related · C) Loosely related · D) Strongly related

---

### 43.

**Document A** is the Media Embeds sub-page — covers external video embeds from YouTube, Vimeo, and Loom.

**Document B** is the Storage sub-page — covers file hosting.

Document A says "uploaded files are handled by the storage system" — pointing to Document B. Two sibling pages clarifying where one's scope ends and the other's begins.

**How related are these?** ___
A) Can't tell · B) Not related · C) Loosely related · D) Strongly related

---

### 44.

**Document A** is the Engineering Anti-Patterns catalog — the master list of all known engineering mistakes, organized by category.

**Document B** is mistake EAP-077: "Assuming CSS Can Fix Native Text Clipping for Oversized Serif Fonts." A mistake about trying to use CSS to fix a browser-level rendering limitation.

Document A contains Document B in its Build/Toolchain/CSS category.

**How related are these?** ___
A) Can't tell · B) Not related · C) Loosely related · D) Strongly related

---

### 45.

**Document A** is the Engineering hub.

**Document B** is bug report ENG-087: "Hydration failed — sidebar icon SVG differs between server and client." The server-rendered page didn't match what the browser produced, causing a crash.

Document A's issue table lists Document B's ID among 10+ related incidents in a row.

**How related are these?** ___
A) Can't tell · B) Not related · C) Loosely related · D) Strongly related

---

### 46.

**Document A** is the Engineering Anti-Patterns catalog — the master list of known engineering mistakes.

**Document B** is the Engineering hub — the main engineering overview.

Document A declares: "I exist to enforce standards on the engineering pillar" — linking to Document B as the pillar it governs.

**How related are these?** ___
A) Can't tell · B) Not related · C) Loosely related · D) Strongly related

---

### 47.

**Document A** is content feedback CFB-013: "Spacing and radius is irrelevant — section is about color, token naming was missing." A complaint about a case study section discussing the wrong topic.

**Document B** is content mistake CAP-003: "Screenshot Gallery Without Narrative Context." A known error about showing screenshots without explaining what they demonstrate.

Document A says "Related: CAP-003" — flagged as a loose match. Document A is about content organization; Document B is about screenshots lacking context.

**How related are these?** ___
A) Can't tell · B) Not related · C) Loosely related · D) Strongly related

---

### 48.

**Document A** is the Engram case study — a portfolio case study about a design system project.

**Document B** is design feedback FB-056: "Doing all this on the button — map to spacing tokens." A directive about using proper design tokens for spacing.

Document A lists Document B in a "Design:" reference list of feedback that shaped the project.

**How related are these?** ___
A) Can't tell · B) Not related · C) Loosely related · D) Strongly related

---

### 49.

**Document A** is the Engineering hub — issue tables tracking recurring problems.

**Document B** is bug report ENG-123: "Hero image upload — uniqueness error + display disconnect." A problem with uploading hero images in the CMS.

Document A's table lists Document B as one of 54 related CMS editing incidents in a long sequence. It's one of many IDs in a row, not a focused reference.

**How related are these?** ___
A) Can't tell · B) Not related · C) Loosely related · D) Strongly related

---

### 50.

**Document A** is the Stress Test skill — it reviews case studies for quality issues.

**Document B** is the Content Strategy hub — the main overview of all content knowledge.

Document A's description says it's used for "content stress test" — it references Document B because that's the pillar it reviews.

**How related are these?** ___
A) Can't tell · B) Not related · C) Loosely related · D) Strongly related

---

### 51.

**Document A** is the AI rulebook.

**Document B** is the Stress Test skill — it runs comprehensive reviews of all active case studies against the knowledge base, checking for quality issues.

Document A lists Document B in its "available skills" section.

**How related are these?** ___
A) Can't tell · B) Not related · C) Loosely related · D) Strongly related

---

### 52.

**Document A** is the AI rulebook — the master instruction file listing every rule and skill the AI follows.

**Document B** is the Case Study Authoring skill — it teaches the AI how to write portfolio case studies through a 4-phase workflow (Analyze, Plan, Write, Review).

Document A lists Document B in its "available skills" section.

**How related are these?** ___
A) Can't tell · B) Not related · C) Loosely related · D) Strongly related

---

### 53.

**Document A** is the AI rulebook.

**Document B** is the Password Gate skill — it handles password-protected access to the portfolio site.

Document A lists Document B in its "available skills" section.

**How related are these?** ___
A) Can't tell · B) Not related · C) Loosely related · D) Strongly related

---

### 54.

**Document A** is the Content hub.

**Document B** is the Seniority Signals sub-page — it explains how hiring managers judge a candidate's seniority from their portfolio. Key insight: "Seniority is not read from a title. It's read from how the designer talks about their work."

Document A has a table-of-contents link to Document B.

**How related are these?** ___
A) Can't tell · B) Not related · C) Loosely related · D) Strongly related

---

### 55.

**Document A** is the Content hub.

**Document B** is the Portfolio Coherence sub-page — "a living inventory tracking stylistic and structural diversity across all active case studies, ensuring the portfolio doesn't repeat the same format or tone."

Document A has a table-of-contents link to Document B.

**How related are these?** ___
A) Can't tell · B) Not related · C) Loosely related · D) Strongly related

---

### 56.

**Document A** is bug report ENG-253: "Canvas label still rendering on hover despite tooltip." A bug about graph labels appearing when they shouldn't.

**Document B** is bug report ENG-252: "Ghost node label still visible despite nodeLabel suppression." A nearly identical bug about ghost labels.

Document A and Document B are literally next to each other in the log (252 and 253 are consecutive numbers). The link exists because Document A's text includes Document B's ID tag due to physical proximity.

**How related are these?** ___
A) Can't tell · B) Not related · C) Loosely related · D) Strongly related

---

### 57.

**Document A** is the knowledge graph spec's table of contents.

**Document B** is Section 3 of the same document — "ID Naming," which defines naming conventions.

Document A links to Document B further down in the same file.

**How related are these?** ___
A) Can't tell · B) Not related · C) Loosely related · D) Strongly related

---

### 58.

**Document A** is bug report ENG-187: "Why are both states thicker and thicker?? Default should be 1px." A frustrated complaint about button borders growing progressively thicker.

**Document B** is design feedback FB-163 — the same complaint filed from the design side.

Document A's link to Document B appears in a "Last updated" header note — a batch update at the top of the file, not within Document A's own story.

**How related are these?** ___
A) Can't tell · B) Not related · C) Loosely related · D) Strongly related

---

### 59.

**Document A** is bug report ENG-197: "Lexical editor crashes on CMS data with Payload-format links." The text editor broke when encountering links in a certain format.

**Document B** is known mistake EAP-119: "Using @lexical/link LinkNode for Content Rendered by Payload's convertLexicalToHTML." A known incompatibility between two systems' link formats.

Document A says "Related: EAP-119" — linking to Document B. A loose match, but the topics (text editor + link formatting) clearly overlap.

**How related are these?** ___
A) Can't tell · B) Not related · C) Loosely related · D) Strongly related

---

### 60.

**Document A** is the Storage sub-page — covers file hosting using Supabase Storage (images, videos, documents).

**Document B** is the Media Embeds sub-page — covers external video embeds from YouTube, Vimeo, and Loom.

Document A says: "External video embeds bypass storage entirely" — pointing to Document B. Two sibling pages clarifying where one's scope ends and the other's begins.

**How related are these?** ___
A) Can't tell · B) Not related · C) Loosely related · D) Strongly related

---

## Summary

After labeling all 60 items, count how many fall into each category:

| | Label | Count |
|---|-------|-------|
| A | Can't tell | |
| B | Not related | |
| C | Loosely related | |
| D | Strongly related | |
| | **Total** | **60** |

> If A (Can't tell) exceeds 12 items, the descriptions need improvement before moving forward.

---

<a id="lookup"></a>

## Lookup Table

Each item above was shuffled from its original position in [v0](eval-confidence-sample-v0.md). Use this table to trace any item back to its technical edge ID, which you can then find in v0's data table.

| v4 item | v0 edge ID | | v4 item | v0 edge ID |
|---------|------------|-|---------|------------|
| 1 | E022 | | 31 | E025 |
| 2 | E041 | | 32 | E002 |
| 3 | E047 | | 33 | E019 |
| 4 | E031 | | 34 | E010 |
| 5 | E042 | | 35 | E028 |
| 6 | E045 | | 36 | E053 |
| 7 | E060 | | 37 | E040 |
| 8 | E033 | | 38 | E037 |
| 9 | E032 | | 39 | E006 |
| 10 | E026 | | 40 | E008 |
| 11 | E011 | | 41 | E020 |
| 12 | E036 | | 42 | E046 |
| 13 | E021 | | 43 | E009 |
| 14 | E003 | | 44 | E049 |
| 15 | E051 | | 45 | E018 |
| 16 | E023 | | 46 | E048 |
| 17 | E014 | | 47 | E030 |
| 18 | E013 | | 48 | E027 |
| 19 | E044 | | 49 | E015 |
| 20 | E005 | | 50 | E029 |
| 21 | E007 | | 51 | E034 |
| 22 | E057 | | 52 | E056 |
| 23 | E024 | | 53 | E038 |
| 24 | E017 | | 54 | E058 |
| 25 | E001 | | 55 | E052 |
| 26 | E043 | | 56 | E035 |
| 27 | E039 | | 57 | E012 |
| 28 | E004 | | 58 | E054 |
| 29 | E016 | | 59 | E059 |
| 30 | E050 | | 60 | E055 |

---

<a id="changelog"></a>

> **Changelog**
>
> - **v4** (2026-05-03): Removed confidence tier labels to prevent bias. Shuffled order randomly. Prompt: "How related are these?" with four plain-language labels (Can't tell / Not related / Loosely related / Strongly related). Replaced the 0–10 numeric scale — once the category names became self-explanatory, numbers added friction without adding clarity. Stripped all jargon. Consistent "Document A"/"Document B" closing sentences. Lookup table maps each v4 item back to its v0 edge ID.
> - **v3** (2026-05-03): Synthesized human summaries for each node. No code or file paths.
> - **v2** (2026-05-03): Added raw context snippets (still too technical).
> - **v1** (2026-05-03): Plain-language explanations, 0–10 numeric scale. Numbers were introduced here because the original text labels (authoritative, relevant, noise, ambiguous) were unclear — a numeric scale lowered the barrier. Superseded by v4's clearer category names.
> - **v0** (2026-05-03): Raw technical data with text labels (authoritative / relevant / noise / ambiguous).
