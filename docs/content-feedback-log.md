# Content Feedback Log

> **What this file is:** Chronological record of every content feedback session. Each entry captures the raw user instruction, the parsed intent, and what was done. Newest entries first.
>
> **Who reads this:** AI agents at session start (scan recent entries for context), and during content feedback processing (check for recurring patterns).
> **Who writes this:** AI agents after each content feedback cycle.
> **Last updated:** 2026-03-30 (CFB-019: Token Architecture tab IA inverted — rationale before anatomy, section blurb missing domain context)
>
> **For agent skills:** Read only the first 30 lines of this file (most recent entries) for pattern detection. The full file is a historical audit trail — do not read it in its entirety during normal work.

---

## Session: 2026-03-30 — Token Architecture Information Hierarchy

#### CFB-020: "You don't really need an extended palette tab and a neutral tab"

**Intent:** The user identified that separate tabs for Extended Palette and Neutral colors were disconnected from the token naming system — they displayed raw color swatches without tying them to semantic meaning. Consolidating all colors into a single dropdown within the token builder creates a tighter information architecture: every color is immediately contextualized by the role it maps to (Accent → brand, Red → negative, etc.).

**Root Cause:** The original tab structure (Token Architecture / Lumen / Extended / Neutral) treated palette display and token composition as separate activities. This violates the "time to value" principle from CFB-019 — users had to mentally bridge the gap between "I see a red swatch on the Extended tab" and "Red maps to the negative role in the naming formula." The tab structure was organized by data source (which palette the colors come from) rather than by user task (composing a token).

**Resolution:**
1. Collapsed 4 tabs → 2 tabs (Token Builder + Lumen Accent). The Lumen Accent tab is retained because it tells the brand color origin story — a portfolio narrative, not just a palette display.
2. All color families integrated into a grouped dropdown within the token builder. Each group shows the family name, its swatch row, and the semantic role it maps to (→ brand, → negative, etc.).
3. The dropdown serves as both a color picker AND an information filter — selecting a color family drives cascading filters on the property and emphasis dimensions, showing only valid combinations.

**Pattern extracted → `content.md` §3: Organize by user task, not data source — when the same information appears in multiple contexts (colors in palettes vs. colors in tokens), consolidate around the user's primary task (composing tokens) rather than the data's origin (which palette).**

**Cross-category note:** Also documented as FB-068 (design — interaction model, cascading filter UX).

---

#### CFB-019: "The information architecture here is just wrong — architecture first, rationale second"

**Intent:** The content hierarchy within the Token Architecture interactive visual was inverted. It started with "Why semantic naming" (the rationale and comparison table) before showing the actual architecture (the naming formula and dimension pills). The user's principle: always show the result/outcome first, then explain the reasoning behind it. This is the inverted pyramid applied at the component level — the same principle as CAP-006 (Burying the Lede), but inside an interactive widget rather than a case study section.

Additionally, the section-level blurb ("A token naming convention designed for machine readability...") didn't mention that color is being used as the example domain. A reader can't tell from the blurb that the interactive visual below will focus on color tokens specifically.

**Root Cause:** The tab was authored following the writer's logical order: "First let me explain WHY we need semantic naming (motivation), THEN show you HOW it works (architecture), THEN give you examples." But the reader's logical order is the reverse: "Show me what the system looks like (architecture), then I'll decide if I care about why (rationale)." The tab ordering also started with "Lumen Accent" (the brand color example) before "Token Architecture" (the anatomy), which is like showing a specific painting before explaining what painting is.

**Resolution:**
1. Reordered tab to: Architecture first (formula + interactive pills), then "Why Semantic Naming" (rationale) below.
2. Reordered tabs: Token Architecture → Lumen Accent → Extended → Neutral. The skeleton/anatomy comes first; the other tabs are examples of that architecture applied.
3. Added clear sub-section headers ("Naming Formula", "Why Semantic Naming") for wayfinding within the tab.
4. Updated CMS seed blurb to contextualize: "Using color as the example domain: a token naming convention where every name fully describes its intent..."

**Cross-category note:** Also documented as FB-067 (design) — covers the interactive affordance issues (false affordance on static pills, accent highlight implying active state).

**Pattern extracted → `content.md` §3 / §12: The inverted pyramid doesn't only apply to case study sections — it applies to every content block, including interactive visuals. If a widget has explanatory text and a structural diagram, the diagram must come first. Rationale is supporting evidence, not the headline.**

---

## Session: 2026-03-30 — Media Upload Integration

#### CFB-018: "Links should let me upload files instead of just typing URLs"

**Intent:** When adding a social link that points to a resume or portfolio PDF, the user shouldn't have to navigate to a separate media library, upload the file, copy the URL, return to the link editor, and paste. The flow should be: click upload → select file → done. The URL is an implementation detail the system should handle.

**Root Cause:** Link fields in the inline edit system were modeled as plain URL text inputs with no awareness of the Media collection. The conceptual model was "links are URLs" when the user's mental model is "links are destinations that might be files."

**Resolution:** Added `media-url` field type that combines URL text input with an upload button. The label changed from "URL" to "URL or File" to signal the dual capability. Applied to social links (`LINK_FIELDS.href`) and project external links (`EXT_LINK_FIELDS.href`).

**Cross-category note:** Also documented as ENG-063 (engineering) and FB-059 (design).

**Pattern extracted -> `content.md` §6: Field labels should describe what the user provides ("URL or File"), not just the underlying data type ("URL"). When a field can accept multiple content types, the label should communicate the full range of options.**

---

## Session: 2026-03-30 — Media Upload Form Microcopy

#### CFB-017: "What the hell is the alt input field about? What is caption?"

**Intent:** Field labels on CMS forms must communicate their purpose to a non-technical user without requiring prior knowledge of web standards. "Alt" means nothing to someone who isn't a web developer. "Caption" is slightly better but still lacks context for what it does on this specific site.

**Root Cause:** Fields used their Payload schema names as labels — technical shorthand ("alt", "caption") that assumes the user knows HTML accessibility attributes and image captioning conventions. No descriptions or examples were provided. This is the same pattern as CF-008/CF-009 (database names as user-facing labels) applied to the upload collection.

**Resolution:** (1) "Alt" → "Description (Alt Text)" with description: "Describe what's in this file. Used for accessibility and search engines. For documents like resumes, use the document title." (2) "Caption" → "Caption (optional)" with description: "Text displayed below the image on the site. Leave empty if none is needed." (3) Added placeholder examples to both fields.

**Cross-category note:** Also documented as FB-058 (design — form UX) and ENG-061 (engineering — missing admin descriptions).

**Pattern extracted → `content.md` §6 (existing): Every CMS field label must be a natural-language phrase that answers "what does this field do?" without requiring domain knowledge. Technical names (alt, slug, href, mime) must be either replaced or supplemented with plain-language descriptions.**

---

## Session: 2026-03-30 — Goldman Sachs Meteor Case Study

#### CFB-016: "Create a content strategy for the Goldman Sachs Meteor case study"

**Intent:** Create and implement a full case study for Meteor — an ETF basket management platform the user designed as the sole founding designer at Goldman Sachs. The content strategy was derived from: (1) a 92-slide presentation deck, (2) a 35-page interview transcript from a Rengo AI interview, (3) all content.md principles, (4) existing Lacework and Élan case study structures, and (5) Joseph Zhang / Ryo Lu reference patterns. The case study needed to frame Meteor's "human trust in machine-processed data" problem as directly relevant to current AI/data review workflows.

**Key content decisions:**
1. **Narrative identity:** "Designing human trust in automated data" — not "building an ETF platform." The ETRO framework (Explainability, Traceability, Reversibility, Observability) is the through-line, directly transferable to AI human-in-the-loop products.
2. **Hero metric:** 95% noise reduction (12,000 → 560 lines). Chosen over review time (80→8min) because the noise reduction is the design achievement; time savings is a consequence.
3. **Scope statement:** 2 sentences per CFB-015. Simultaneously communicates: Goldman Sachs scale (200+ funds), the human problem (10 PM workdays, 12,000 lines), ownership ("first and only designer," "designed from zero"), and the trust outcome ("PMs stopped spot-checking entirely").
4. **Section structure — decisions, not features:** Three strategic decision sections (Leverage-Based Scoping, Adoption Sequencing, ETRO) each structured per CAP-016: what the decision was, alternatives considered, why this approach, trade-offs. The ETRO section combines four hero features under one trust-calibration umbrella.
5. **Internal tool compensation (§7):** No external links (behind firewall). Compensated with: Goldman Sachs name recognition, concrete scale metrics, user testimonial in captions, sanitized screenshot placeholders labeled by content.
6. **Seniority signals (§6):** "First and only designer" + "no PM, no UXR" + three explicit strategic decisions with alternatives evaluated + predictive framing ("knowing an early win would unlock adoption").
7. **Contemporary relevance (§3.2, CF-004e):** The ETRO framework and "human trust in machine-processed data" language is domain-neutral — signals AI/data workflow relevance without explicitly stating it (per CAP-015, don't tell the reader how to evaluate you).

**Resolution:**
1. Added `meteor` slug to seed script (order 3, featured)
2. Added hero metric `{ value: "95%", label: "noise reduction" }` to page.tsx
3. Added Goldman Sachs inline link to page.tsx
4. Added 15 labeled image placeholders across 4 sections to page.tsx
5. Created `src/app/(frontend)/api/update-meteor/route.ts` with full CMS data
6. Seeded CMS — updated project-two placeholder (id: 2) with Meteor content
7. Fixed ordering conflict (Meteor → order 3, after Élan at order 2)
8. Cleaned up duplicate "Goldman Sachs Meteor" at project-five
9. Verified: HTTP 200, all content elements rendering, image skeletons present, inline link working

**Differentiation from existing case studies (§8.2):**
- Lacework: Scale + craft (enterprise SaaS, pricing model)
- Élan: Systems thinking (design system, AI-native tokens)
- Meteor: Complexity management (multi-user enterprise tool) + Cross-functional leadership (sole designer, 9 engineers, 3 time zones) + Strategic decision-making under constraint

**Principles applied:** §0 (Content Posture), §3.1 (Inverted Pyramid), §3.2 (Recommended Anatomy + Hero Metric), §3.3 (Scope Statement), §3.4 (WHY over WHAT / CAP-016), §3.5 (What Case Studies Never Include), §4.1 (80-85% visual target), §5.1-5.4 (Language Patterns), §6.1-6.4 (Seniority Signals), §7.1-7.6 (Internal Tool Compensation), §8.2 (Selection Criteria)

**Anti-patterns avoided:** CAP-001 (no process-first narrative), CAP-002 (no generic positioning), CAP-004 (specific impact claims), CAP-007 (screenshots not paragraphs for internal tools), CAP-011 (no title inflation — "Product Designer (sole designer, founding)"), CAP-014 (duration as project length, not ship date), CAP-015 (no strategic transparency leak), CAP-016 (WHY over WHAT in every section)

---

## Session: 2026-03-30 — Copy Verbosity (Recurring Pattern)

#### CFB-015: "You're stacking facts over facts — section blurbs are too lengthy, too many words"

**Intent:** The scope statement and every section body in the Élan case study were too long — violating §3.3 (2-4 sentences), §3.4 (1-3 sentences per section), and §5.2 ("section text serves as a label, not an explanation"). The scope statement stacked metrics ("47 engineering incidents", "33 design anti-patterns") as disconnected facts instead of expressing the design philosophy. Section bodies were 5-7 sentences each, re-explaining what the interactive visuals already demonstrate. The references (Joseph Zhang, Ryo Lu) use 1-2 sentences per section — text as labels for images, not mini-essays.

**Root Cause:** The agent conflated "explain WHY" (from CFB-014) with "write more." WHY-focused copy should be *more specific*, not *longer*. The rationale for a design decision can be expressed in one sentence ("A naming convention designed for machine readability — every name fully describes its intent, so agents can validate tokens without a lookup table") instead of six sentences restating what the comparison grid already shows. Additionally, the comparison between IBM/Material/GS naming was duplicated: once in the section body text AND once in the TokenGrid component's interactive comparison grid. The body text should label the visual, not replicate it.

**Resolution:**
1. Scope statement: 5 sentences → 2 sentences. Philosophy-driven ("designed so an AI agent can read, generate, and self-correct without external documentation") instead of fact-stacking.
2. Agent Harness Architecture: 7 sentences → 1 sentence. The DAG visual carries the detail.
3. Agent-Native Semantic Tokens: 6 sentences → 1 sentence. The TokenGrid comparison grid carries the IBM/Material/GS comparison.
4. Systemic Pattern Map: 5 sentences → 2 sentences. The IncidentDensityMap carries the detail.
5. ScrollSpy: 4 sentences → 2 sentences. The InteractionShowcase carries the detail.

**Escalation note:** This is the 2nd time text verbosity has been raised in this session (CFB-014 identified the WHAT-without-WHY pattern; CFB-015 identifies that fixing WHAT-without-WHY by writing MORE is the wrong correction). The underlying behavioral pattern: the agent treats "add rationale" as "add sentences" instead of "replace vague sentences with specific ones." Future content work must apply a hard word-count check: section bodies ≤ 3 sentences, scope statements ≤ 4 sentences.

**Pattern extracted → `content.md` §5.2: reinforced — section text is a LABEL for the visual, not a parallel explanation. If an interactive visual already demonstrates something (comparison grid, DAG, timeline), the body text must not restate it.**

---

## Session: 2026-03-30 — Élan Case Study Content Strategy Overhaul

#### CFB-014: "Token examples don't follow convention, missing rationale, section hierarchy wrong, DAG missing"

**Intent:** The Élan design system case study has multiple content strategy failures:
1. **Token naming examples are wrong:** The Token Architecture tab shows `$portfolio-text-neutral-bold` but the formula says `color.property.role.emphasis`. The `$portfolio-` prefix is meaningless — "what is the dollar sign portfolio me?"
2. **Missing rationale (the WHY):** The token architecture shows WHAT the naming convention is but not WHY it was chosen. No comparison to IBM Carbon's approach, Goldman Sachs One GS, or explanation of why semantic naming benefits AI agents. "Those are things that actually matter, and you're not explaining it."
3. **Section hierarchy is inverted:** "Token Architecture" is a tab under "Lumen — A Custom Color Identity." Should be reversed: the parent section should be about AI agent-friendly semantic naming; underneath, "Token Architecture" and "Lumen Accent Color" are sub-topics.
4. **Content strategy is WHAT-focused, not WHY-focused:** Sections describe what was built instead of why it was designed this way. The case study should explain design decisions, not list features.
5. **AI-native design system is not the core thread:** This should be the unifying narrative threading the entire case study, not one section.
6. **"Feedback-Driven Component Library" is too high in hierarchy:** Currently section 2 in CMS. "I don't know how it's relevant either."
7. **DAG is completely missing** from the rendered page — a data sync bug where CMS headings ("Self-Healing Process") don't match INTERACTIVE_VISUALS keys ("Agent Harness Architecture").

**Root Cause (content):** The case study was structured as a feature showcase ("here's what I built") rather than a design rationale narrative ("here's why I made these decisions"). This violates §3.1 (inverted pyramid) and §6.1 (seniority signals) — senior designers describe decisions and their rationale, not tasks completed. The naming convention section lists dimensions (property, role, emphasis) without explaining the decision-making process: what alternatives were evaluated (IBM Carbon's flat naming, Material Design's role-based tokens, Goldman Sachs's property-first hierarchy), why semantic naming was chosen (AI agents can parse `color.surface.brand.bold` without a lookup table), and what trade-offs were accepted.

**Root Cause (engineering):** The `update-elan` API route was updated with new section headings ("Agent Harness Architecture", "Systemic Pattern Map") but never re-run against the CMS. The CMS still has old headings ("Self-Healing Process", "Feedback-Driven Component Library"). Since `interactiveVisuals?.[section.heading]` uses exact string matching, the DAG and IncidentDensityMap visuals silently don't render.

**Resolution:**
1. Restructured section hierarchy with AI-native as the core thread
2. Reordered sections: Agent Harness Architecture → Agent-Native Semantic Tokens → Systemic Pattern Map → ScrollSpy
3. Reorganized TokenGrid: "Lumen Accent" tab (brand color story), "Token Architecture" tab (naming convention + rationale with IBM/Goldman Sachs comparison), Extended Palette, Neutral
4. Fixed token examples to use dot notation matching the formula
5. Added rationale content explaining WHY semantic naming benefits agents
6. Synced CMS data to fix the DAG rendering bug
7. Removed "Feedback-Driven Component Library" from case study

**Cross-category note:** Also documented as ENG-054 (engineering — CMS data sync bug) and FB-057 (design — TokenGrid tab restructuring).

**Pattern extracted → `content.md` §3: Case study sections must answer "why I designed it this way" not "what I built." Feature lists are junior signals (§6.1); design rationale with evaluated alternatives is the senior signal.**

**New anti-pattern → `content-anti-patterns.md` CAP-016: Feature-List Case Study (showing WHAT without WHY)**

---

## Session: 2026-03-30 — Case Study Interactive Visual Scoping

#### CFB-013: "Spacing and radius is irrelevant — section is about color, token naming was missing"

**Intent:** The "Lumen — A Custom Color Identity" section in the Élan case study should exclusively showcase color-related content. The interactive TokenGrid had Spacing and Radius tabs that are completely off-topic for a color identity narrative. Additionally, the token naming convention (`property.role.emphasis`) — a key design decision inspired by Goldman Sachs One GS — was absent from the interactive visual, despite being central to the color architecture story and having existed in the section's content scope previously.

**Root Cause:** The TokenGrid component was built as a general token showcase rather than a color-focused one. This violates §4.2's image-text rhythm principle: every visual element must serve the surrounding narrative. Spacing bars and radius boxes in a color section are visual noise — they dilute the color identity story and confuse the reader about what the section is demonstrating.

**Resolution:**
1. Removed Spacing and Radius tabs.
2. Added "Extended Palette" tab showing Carbon-sourced color families (Red, Green, Yellow, Teal) — demonstrating the full breadth of the color system.
3. Added "Token Architecture" tab with the `color.property.role.emphasis` naming formula, dimension breakdowns (property, role, emphasis), and concrete token examples with color swatches.

**Cross-category note:** Also documented as FB-056 (design) — the visual implementation changes.

**Pattern extracted → `content.md` §3.4: Interactive visuals embedded in case study sections must be scoped to the section topic. A general-purpose widget that shows "everything in the design system" in a section about color identity is a content anti-pattern — it fails the "does this support the narrative?" test.**

---

## Session: 2026-03-29 — Case Study Metadata Semantics & Scope Statement

**Chat:** Current session
**Scope:** `src/app/(frontend)/work/[slug]/page.module.scss`, `src/app/(frontend)/api/update-lacework/route.ts`, `src/collections/Projects.ts`, `src/scripts/seed.ts`

#### CF-010: "Duration should be the length; description blurb should capture attention"

**Intent:** Two content strategy issues:
1. The duration field displayed "Shipped August 2022" which is (a) redundant with the description text that already says "The feature shipped August 2022" and (b) communicates the wrong thing. A hiring manager scanning the sidebar wants to know "how long did this take?" — that conveys velocity and scope. The ship date is context, not metadata.
2. The scope statement (intro paragraph) doesn't have enough visual distinction to function as the engagement hook it needs to be. Per §3.3, this is "the single most important paragraph in the case study."

**Root Cause:** CF-004b previously corrected the ship date from "February 2023" to "August 2022" but didn't question whether a ship date was the right content for the Duration field. The field's CMS description said `e.g. "2024 – Present"` which is a timeframe, not a ship event. The typography issue stemmed from treating the scope statement with the same visual weight as section body text.

**Resolution:**
1. Changed Lacework duration from "Shipped August 2022" to "~3 months". Updated CMS field description to explicitly guide toward project length: `'Project length, e.g. "~3 months", "6 weeks", "2024 – Present". Avoid ship dates here — put those in the description.'`
2. Updated default seed duration from "2024 – Present" to "~6 months" to model the correct content pattern for new projects.
3. Elevated `.descriptionText` to `$portfolio-type-lg` + `$portfolio-weight-medium` + `$portfolio-text-primary` for visual hierarchy.

**Cross-category note:** Also documented as FB-051 (design) and ENG-041 (engineering).

**Pattern extracted → `content.md` §3.2: Duration field communicates project length (velocity/scope signal), not ship dates. Ship dates belong in the scope statement. The scope statement must be typographically distinct — it's the hiring manager's primary text engagement hook.**

---

## Session: 2026-03-29 — Teams → Experience Naming Consistency

**Chat:** Current session
**Scope:** `src/globals/SiteConfig.ts`, `src/app/(frontend)/HomeClient.tsx`, `src/app/(frontend)/page.tsx`

#### CF-009: "Experience section was called Teams — needs consistency"

**Intent:** The user considers the companies/teams section on the home page to represent their "Experience." The CMS called it "Teams" — both the tab label and the default section heading. This naming mismatch between what the user calls it and what the system calls it created confusion, especially when the CMS admin and the visual edit view used different terminology.

**Resolution:** Changed the CMS tab label from "Teams" to "Experience." Updated the array field's `labels` to display as "Experience" in the admin panel. Changed the default `teamsLabel` from "TEAMS" to "EXPERIENCE." Updated the inline edit panel label from "Teams" to "Experience." The internal field name `teams` was kept to avoid database migration — the existing `experience` field on the About page has a different data shape. Renamed the About page's "Experience" tab to "Work History" to prevent collision.

**Principle extracted -> `content.md`: Section naming must be consistent across all surfaces (CMS admin tabs, CMS field labels, frontend section headings, inline edit panel titles). When the user renames a section on the frontend, the CMS should reflect that naming — not use legacy internal terminology.

**Cross-category note:** Also documented as ENG-039 (engineering) — CMS tab reorganization.

---

## Session: 2026-03-29 — Inline Validation Copy

**Chat:** Current session
**Scope:** `src/components/inline-edit/EditableArray.tsx`

#### CF-008: Validation error messaging for required fields

**Intent:** When a required field is empty, the user needs to know (1) which field, (2) what's wrong, in the fewest words possible. The message appears directly under the offending input — spatial proximity means the copy can be ultra-concise.

**Copy patterns:**
- Field-level: `"{Label} is required"` — e.g. "Label is required", "Company is required"
- Footer-level: `"Fill in all required fields before saving"` — appears when validation is active with errors
- Visual indicator: Red asterisk (`*`) after required field labels — universally understood, no words needed

**Cross-category note:** Also documented as ENG-035 (engineering) and FB-044 (design).

---

## Session: 2026-03-29 — Error Banner Copy: Raw JSON as User-Facing Text

**Chat:** Current session
**Scope:** `src/components/inline-edit/api.ts`

#### CF-007: "Why is this UX copy having so much technical jargon?"

**User's intent:** Error messages should use natural language that tells the user what went wrong and what to do — not internal system data. The user saw `Failed to update global:site-config: 400 — {"errors":[{"name":"ValidationError",...}]}` and rightly called it out as unreadable jargon. There should be a "semantic linkage between the error message and the natural language explanation."

**Root cause:** The save API threw the raw HTTP response body as the error message without any parsing or translation layer. The error was designed for debugging, not for users.

**Resolution:**
1. Added `parsePayloadError()` that extracts Payload's structured validation error format and translates it:
   - Field labels like "Links > Social Links 1 > Href" → "Social Link 1 → URL"
   - Validation messages like "This field is required" → "is required"
   - Common field names mapped to plain English: href→URL, label→name
2. Added contextual fallback messages for auth errors ("session expired"), server errors ("try again in a moment"), and unknown errors.
3. Result: `"Could not save — Social Link 1 → URL is required."` — one sentence, cause + location, no JSON.

**Pattern extracted → `content-anti-patterns.md` CAP-013: system error dumps as user-facing copy**

**Cross-category note:** Also documented as ENG-033 (engineering — error parsing) and FB-042 (design — error banner visibility).

---

## Session: 2026-03-29 — Inline Edit Panel Microcopy

**Chat:** [Inline CMS experience](0c0a7972-7ad5-4928-a1fd-0c61746d4816) (originally documented as ENG-029 engineering-only; retroactively capturing the content dimension)
**Scope:** `src/components/inline-edit/EditableArray.tsx`, `src/app/(frontend)/HomeClient.tsx`

#### CF-006: "It's really unclear about what the second field is" (content dimension)

**Intent:** Form labels and placeholder text in an editing UI are UX microcopy — they're content that instructs, orients, and prevents errors. When labels say "Name" instead of "Company" or "URL" instead of "Website (e.g., https://example.com)", the microcopy fails its job: the user doesn't know what to put where.

**What was missed:** This feedback was processed only as an engineering issue (missing schema field, data not saving). The content dimension — that the labels themselves were poorly written and didn't communicate purpose — was not captured. Good UX microcopy for form fields should:
1. Use human-readable terms, not database column names ("Company" not "name", "Website" not "url")
2. Include format hints for non-obvious fields ("e.g., 2023-Present" for a period field)
3. Differentiate between required and optional fields in the label or help text

**Resolution:**
1. Changed field labels: "Name" → "Company", "URL" → "Website", added "Period" with human-readable label.
2. Used persistent labels above inputs (visible at all times, not just as placeholder).

**Pattern extracted → `content-anti-patterns.md` CAP-012: database column names as user-facing labels**

**Cross-category note:** Also documented as FB-040 (design) and ENG-029 (engineering).

---

## Session: 2026-03-29 — Social Proof, Inline Links, External Indicators

**Chat:** Current session
**Scope:** Payload CMS `projects/lacework`, `ProjectClient.tsx`, `page.tsx`, `page.module.scss`

#### CF-005a: "For anything that is a company name, link them to their official landing page"

**Intent:** Company names in the scope statement should be clickable links to their official sites. This adds legitimacy — the reader can verify the companies are real and substantial.

**Resolution:** Created a `renderTextWithLinks()` utility in ProjectClient that takes the plain-text description and a map of `{text: url}` pairs, splitting the text and wrapping matches in `<a>` tags. Five company names now link out: Lacework → lacework.net, Fortinet → fortinet.com, FortiCNAPP → fortinet.com/products/cloud-security/forticnapp, Snowflake → snowflake.com, LendingTree → lendingtree.com.

**Pattern extracted → `content.md` §5: Company names in scope statements should link to official sites when publicly available.**

#### CF-005b: "For any link that will direct the user outside, there should always be an indicator"

**Intent:** This extends CF-004c (which only added the icon to meta sidebar links). ALL external links — including inline text links in the scope statement — need the ↗ icon. The indicator is an affordance: users should always know before clicking that they're leaving the site.

**Root Cause:** CF-004c was scoped too narrowly. It added the icon only to the `metaLinks` section, not to inline text links. The principle should be universal.

**Resolution:** Extracted the SVG into a shared `ExternalIcon` component. Applied to both meta sidebar links and inline text links. Added `.inlineLink` styles that display the icon inline with the text at the correct baseline alignment.

**Pattern reinforced → `content.md` §3.2: Already documented. This confirms the principle applies to ALL external links, not just metadata links.**

#### CF-005c: "From a social proof perspective, add in the top, the most well-known clients"

**Intent:** "Thousands of enterprise clients" is vague. Name-dropping recognizable companies creates immediate credibility through social proof psychology — the reader thinks "if Snowflake trusts this product, it's serious."

**Root Cause:** The original scope statement used a generic quantifier ("thousands of enterprise clients") instead of named entities. Named proof > numeric proof for trust formation.

**Resolution:** Changed "serving thousands of enterprise clients" to "serving enterprise clients including Snowflake and LendingTree." Both are publicly documented Lacework/FortiCNAPP customers from Fortinet's case studies. Snowflake (major cloud data platform) and LendingTree (publicly traded financial marketplace) provide strong name recognition without overclaiming.

**Pattern extracted → `content.md` §3.3: When the product serves notable clients, name 1-2 recognizable ones in the scope statement instead of using generic quantifiers. Named social proof > "thousands of clients."**

---

## Session: 2026-03-29 — Lacework Case Study Content Refinement (5 Fixes)

**Chat:** Current session
**Scope:** Payload CMS `projects/lacework`, `src/app/(frontend)/work/[slug]/`

#### CF-004a: "I'm not the lead product designer. I'm an intern there."

**Intent:** The role "Lead Product Designer" falsely claims a title the user didn't hold. They were an intern who led the project. Mentioning "intern" hurts perception; claiming "lead" is dishonest.

**Root Cause:** The draft assumed job title from project scope. Ownership ≠ title. The scope statement ("sole designer") already communicates leadership without needing the title.

**Resolution:** Changed role from "Lead Product Designer (sole designer)" to "Product Designer (sole designer)". Scope statement language "As the sole designer, I redesigned..." conveys ownership without title inflation.

**Pattern extracted → new anti-pattern CAP-011: Title Inflation in Role Field**

#### CF-004b: "The duration was shipped in August 2022"

**Intent:** The ship date was wrong. The design work shipped August 2022, not February 2023 (which was when the pricing model launched for new customers).

**Resolution:** Changed duration from "7 weeks (shipped February 2023)" to "Shipped August 2022". Updated scope statement to match.

#### CF-004c: "The link should have a little icon that indicates external"

**Intent:** External links need a visual affordance. Users should know before clicking that a link leaves the site.

**Resolution:** Added an SVG arrow icon (↗ style) next to all external links in the meta sidebar. Styled inline with the link text via flexbox.

**Pattern extracted → `content.md` §3.2: External links must have a visual indicator**

#### CF-004d: "The impact metrics are not front and center in the first scan"

**Intent:** The scope statement mentions "5 layers deep to 3" but this reads as a description, not a metric. The hiring manager's first scan needs a single, prominent, unmistakable impact number — a hero metric.

**Root Cause:** The draft embedded metrics in flowing prose. Prose metrics are parsed sequentially; visual metrics are parsed in parallel (scanning). For the 10-second scan, a visually distinct metric block beats an embedded sentence.

**Resolution:** Added a `heroMetric` display component: large "2×" with "page discoverability" label, positioned at the header level opposite the title. Visible immediately without scrolling.

**Pattern extracted → `content.md` §3.2: Every case study needs a hero metric visible in the first scan**

#### CF-004e: "You need to consider why it's relevant to companies right now"

**Intent:** The case study's consumption-based pricing model is ahead of its time — it directly maps to current AI pricing (token-based, usage-based billing). This is a powerful relevance hook that wasn't surfaced.

**Root Cause:** The draft described the business model factually but didn't frame it as prescient or connect it to the reader's current context. A hiring manager evaluating candidates in 2026 is likely at a company dealing with usage-based pricing (AI products, cloud infrastructure).

**Resolution:** Added to scope statement: "a consumption-based pricing model — the same pay-for-what-you-use approach now standard across AI products." This creates an immediate relevance bridge between the 2022 project and the reader's 2026 context.

**Pattern extracted → `content.md` §5: Frame past work in terms of current industry relevance. Historical projects gain interview-worthiness when connected to problems the hiring company faces today.**

---

## Session: 2026-03-29 — Lacework Case Study CMS Implementation

**Chat:** Current session
**Scope:** Payload CMS `projects` collection, `src/app/(frontend)/work/[slug]/`

#### CF-003: "Implement the Lacework case study in the CMS"

**Intent:** The user audited their legacy Lacework case study (Figma prototype + presentation transcript) against `content.md` principles, identified critical issues (process-first structure, buried impact, no external validation), and drafted a restructured case study. This session implements the draft into the live CMS so it renders on the portfolio site.

**Key decisions:**
1. **Inverted pyramid structure** — Scope statement with impact numbers visible in first 10 seconds. No process methodology, no research sections.
2. **Feature-section pattern** — 4 sections (Restructured Navigation, Interactive Usage Trends, At-a-Glance Overage Status, In-App Service Discovery), each with 1-2 sentence problem-outcome framing + image placeholders.
3. **External validation** — Fortinet FortiCNAPP documentation linked as proof the work shipped and survived acquisition.
4. **Image-first approach** — 12 labeled image placeholder slots (3 per section) with descriptive labels so the user knows exactly which asset to upload in each slot. Target: 80-85% visual when populated.
5. **Lexical richText handling** — Created `extractLexicalText()` utility to properly extract plain text from Payload's Lexical JSON, fixing the existing fallback that silently dropped all CMS body text.

**What changed from the legacy case study:**
- Structure: Context → Research → Solutions → **became** → Scope → Impact → Features
- Text ratio: ~50/50 text-to-visual → target ~15-20% text / 80-85% visual
- Impact: buried in final section → visible in scope statement and section captions
- Validation: none → Fortinet acquisition + live documentation link
- Word count: ~28,000px of scrolling → ~300 words of body text + 12 image slots

**Resolution:** Updated Payload CMS project record (slug: `lacework`, formerly `project-one`). Content renders at `/work/lacework` with all text sections and labeled image skeleton placeholders.

**Pattern reinforced → `content.md` §3.2 (Case Study Anatomy), §3.5 (Inverted Pyramid), §4.1 (Image-to-Text Ratio)**

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

#### CFB-010: "Case studies should begin with strong visuals showing end results — time to value"

**Intent:** Every case study must open with a hero image that shows the final design outcome. This is a UX time-to-value principle applied to portfolio content: the visitor should understand what was built in under 2 seconds of landing, before reading any text. Starting with text forces sequential processing; starting with a screenshot enables parallel evaluation (visual quality, product domain, design sensibility) in a single glance.

**Root Cause:** During the split-view layout conversion, the hero image was removed along with the full-width splash. The distinction between "remove the decorative splash" and "remove the outcome visual" wasn't made — both were treated as the same thing. The resulting case study opened with a text description, forcing the visitor to read before understanding what the case study was about.

**Resolution:** Added a hero image slot at the very top of the right content column, before the description. Uses 16:9 aspect ratio (standard product screenshot format). Currently renders as a labeled placeholder ("Hero — Final Design Outcome") until real screenshots are provided.

**Cross-category note:** Also documented as FB-047 (design) — the visual placement and sizing is a design concern.

**Pattern extracted → `content.md` §3.2: Recommended Anatomy** (reinforces existing hero-first anatomy) | New principle: **Time-to-Value Hero — case studies must lead with the finished design, not with text. The hero image is not decorative; it is the single most important content element on the page.**

---

#### CFB-011: "All Projects back link adds confusion — portfolio is only one layer deep"

**Intent:** The back link on case study detail pages previously read "All Projects." The user observed this is misleading: the portfolio has no dedicated "all projects" listing page — the home page *is* the project grid. Labeling the link "All Projects" implies a separate archive or index page that doesn't exist, creating false expectations. For a shallow two-layer navigation structure (home → case study), the correct affordance is simply "Back."

**Root Cause:** The label was written as if the portfolio has three layers (Home → All Projects → Case Study), which is common in larger portfolios. This one has two layers. The label over-specified the destination in a way that was only accurate for a different information architecture.

**Resolution:** Changed `<span>All Projects</span>` to `<span>Back</span>` in `ProjectClient.tsx`. The arrow icon already conveys directionality; the text only needs to confirm "you're going backwards," not describe where backwards leads.

**Pattern extracted → `content.md` §9 (About Page & Supporting Content):** Navigation microcopy must match the actual IA. Label back links by the action ("Back"), not by a destination that doesn't map to any real page.

---

#### CFB-012: "Portfolio as Product shouldn't be in the Élan case study"

**Intent:** The user identified that the "Portfolio as Product" section — which reveals the hiring manager conversion funnel, P(Alive) decay, and magic number strategy — exposes strategic competitive advantage that shouldn't be public. It's the *portfolio's* secret sauce, not the *design system's* story. The user proposed replacing it with interaction design work (navigation patterns, ScrollSpy gesture discrimination) and the Lumen accent color story, which better demonstrate design system craft.

**Root Cause:** The original case study structure conflated "interesting things I know" with "interesting things I built." The HM mental model is a meta-strategy for the portfolio itself; it doesn't belong in a case study about building a design system. CAP-002 (Generic Positioning) inverted: specific strategic knowledge can be *too* revealing to include.

**Resolution:**
1. Replaced "Portfolio as Product" section → "Interaction Choreography" covering safe triangle submenu aim, click/drag dead zone discrimination, closest-element pointer mapping, and paired visual channel state management.
2. Renamed "Token Architecture" → "Lumen — A Custom Color Identity" to foreground the Lumen color origin story, hybrid luminance scaling (grades 10–50 match Carbon's absolute luminance, 70–100 match inter-step ratios), and the Goldman Sachs-inspired property·role·emphasis naming.
3. Replaced FunnelDiagram interactive visual → InteractionShowcase (4-tab demo: safe triangle, click/drag dead zone, closest-element detection, paired channels before/after).
4. Enhanced TokenGrid with hybrid scaling legend (absolute vs. key vs. ratio annotations on the accent swatch row).

**Pattern extracted → `content-anti-patterns.md` CAP-015 (new): Strategic Transparency Leak** — content that reveals meta-strategy (how you position yourself) rather than craft (what you built and why). Case studies should demonstrate capability, not expose competitive positioning frameworks. Also → `content.md` §3.3: case study section selection should pass the "does this showcase what I *built*?" filter, not "does this showcase what I *know*?"

**Cross-category note:** Also involves design work (new InteractionShowcase component, enhanced TokenGrid) documented implicitly — no design feedback log entry needed as this is content-driven restructuring.

---

#### CF-011: "Token Architecture should belong to the application section, not global"

**Intent:** Enforce consistent content strategy across all 6 foundational styles pages in the playground documentation. Every token category has a naming convention that designers and developers need to understand — this should be systematically documented in the same position on every page, not ad-hoc on one page and missing from the rest.

**Root Cause:** Only the colors page had a Token Architecture section, and it was positioned at the global level (above semantic tokens) rather than scoped as part of the application/semantic narrative. The other 5 pages (typography, spacing, motion, elevation, breakpoints) each have distinct naming conventions that were undocumented. This inconsistency meant users visiting different token pages got different levels of documentation depth.

**Resolution:**
1. Established a standard content template: Token Architecture is always the first major section on every foundational styles page, explaining the naming formula for that token category.
2. Wrote Token Architecture content for each page:
   - **Typography**: two-tier naming (semantic mixins vs. primitive tokens)
   - **Spacing**: three-tier naming (primitives, layout, utility)
   - **Motion**: intent-based naming (duration speed, easing intent, choreography presets, interactive mixins)
   - **Elevation**: size-scale naming (shadow-sm/md/lg, radius-sm/md/lg)
   - **Breakpoints**: SCSS variable naming ($elan-bp-* vs $elan-mq-*)
3. Codified the template in SKILL.md for future page creation enforcement.

**Pattern extracted → SKILL.md "Token Page Template" section:** Every foundational styles page must have Token Architecture as its first SectionTitle, explaining the naming formula. This is a content strategy requirement — naming conventions are essential reference content for both human and agent consumers.

**Cross-category note:** Also documented as FB-095 (design) — the IA placement and heading hierarchy are design decisions that intersect with this content strategy decision.

---

## Entry Template

```markdown
#### CF-NNN: "[First 10 words of user message]"

**Intent:** [What the user is trying to achieve with the content]

**Root Cause:** [Why the current content doesn't achieve it]

**Resolution:** [What was changed]

**Pattern extracted → `content.md` §N.N: [Section reference]**
```
