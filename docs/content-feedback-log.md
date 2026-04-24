# Content Feedback Log

> **What this file is:** Chronological record of every content feedback session. Each entry captures the raw user instruction, the parsed intent, and what was done. Newest entries first.
>
> **Who reads this:** AI agents at session start (scan recent entries for context), and during content feedback processing (check for recurring patterns).
> **Who writes this:** AI agents after each content feedback cycle.
> **Last updated:** 2026-04-23 (CFB-042: Élan headline rewrite — "You're looking at the wrong part" → "Harnessed my code production - 40 sessions in." Keyword positioning + content strategy rule broadened: first-person perspective includes possessives and verb-first openings, not just "I"/"you". Gold Standard 3 added to case-study.md. Portfolio coherence manifest updated T7 → T8.) Prior: CFB-041: Default site password changed from `preview-2026` to `glad you are here`. Phrase selected for tonal universality in the "Welcome, ___" greeting sentence - warm without presuming hierarchy. Extends CFB-031's placeholder-as-microcopy principle to the password content itself. Cross-category with FB-165 and ENG-193.) Prior: CFB-040: Essay content type introduced as a first-class format on `/work/[slug]`, distinct from UX case studies. Content decisions: (1) the proposed like-counter / engagement signal was rejected by the user mid-session — on a portfolio primarily read by interviewers, a visible like-count is socially off-key (a low number reads as weak, a high number reads as seeking validation), and the "waiter's tip jar" social-proof metaphor doesn't translate to a hiring-evaluation context. Replaced with a cross-post link out to the Medium article — social proof via distribution discipline, not vanity metrics. (2) Scope statement dropped for essays: scope statements are a case-study convention that simultaneously establish company context, role claim, and impact metric in 2-4 sentences (`docs/content/case-study.md` §3.3). Essays have no shipped product and no team — the framing work is carried by the H1 and the intro blurb body. Removed the `scopeStatementMarkdown` option from the ETRO seed route and deleted the orphan `SCOPE_STATEMENT` constant. (3) The `"Essay · "` category prefix retired from ETRO's category (`"Essay · AI Trust Architecture"` → `"AI Trust Architecture"`). The prefix was format-signal smuggled into a topic field, which worked when `contentFormat` didn't exist but produces duplicate labeling the moment the format is encoded explicitly. (4) `category` gains a second content role on essays: topic eyebrow above the H1 (Medium-style topic tag). Same authored field, same editorial intent — just two rendering surfaces depending on format. (5) `title` intentionally unrendered on essays. The essay's visible title is the `introBlurbHeadline`; the internal `title` field ("ETRO Framework") is a short-name for the admin list view and archive operations. Rendering both would produce a double-title experience where the short internal label competes with the headline. Admin can still edit `title` through the Payload form. (6) Meta row vocabulary settled: publication date (`Dec 1, 2025`) · read time (`N min read`) · cross-post link (`Also on Medium`). "Also on Medium" chosen over "Read on Medium" / "View on Medium" because "Also" flags the Medium version as a mirror, not a canonical destination — the portfolio version is the primary read. Cross-category with FB-164 (design feedback — single-column layout, EssayHeader composition, inline SVG Medium logo) and ENG-191 (engineering feedback — `contentFormat` discriminant, hybrid read-time helper, homepage projection fix). `docs/content/case-study.md` §3.2 reconciled: the sidebar is *replaced* by a single-column layout for essays, not lightened.) Prior: CFB-039: Admin-surface labels on video audio settings rewritten to separate capability vocabulary ("Audio off / Audio on", "Expose audio controls to viewers") from default-state vocabulary ("Muted by default / Sound by default", "Starts muted by default"). Embed admin surface lost its audio-default control entirely — the provider iframe owns that language. Cross-category with FB-157 / ENG-170.) Prior: CFB-038: Portfolio home order — Goldman Sachs (Meteor) promoted to top position; Lacework demoted to #2; Élan #3; order reflected portfolio-add sequence instead of narrative priority.
>
> **For agent skills:** Read only the first 30 lines of this file (most recent entries) for pattern detection. The full file is a historical audit trail — do not read it in its entirety during normal work.

---

## Session: 2026-04-23 — Élan headline rewrite + content strategy rule update

#### CFB-042: "A small consideration for the case study title...I want to keep the 'Harness Code Production' three words"

**Intent:** The Élan headline "You're looking at the wrong part" (T7 Framework Inversion) didn't communicate the "harness" positioning keyword to scanners on the home page. The user needed the headline to include "harness code production" while maintaining the conversational, interpersonal register of the other case study headlines. Additionally, the headline didn't need to start with "I" or "you" - first-person perspective can be carried by possessives like "my."

**Root Cause:** Two issues: (1) the previous headline prioritized intrigue over keyword positioning - it created curiosity but didn't tell readers what the project was about at scan speed. (2) The content strategy rules for blurb headlines were too prescriptive about opening words, implicitly suggesting headlines must start with "I" or "you" based on the gold standard references. First-person possessives ("my") and verb-first openings were valid but undocumented.

**Resolution:** Headline changed to "Harnessed my code production - 40 sessions in." (T8 Verdict + Staccato Authority). Verb-first drops the pronoun, "my" carries first-person ownership, "40 sessions in" grounds the claim in real effort. Content strategy updated: §3.7 now includes explicit guidance that first-person perspective includes possessives and verb-first openings. Gold Standard 3 added to case-study.md. personal-voice.md Technique 10 broadened. Portfolio coherence manifest updated (T7 → T8, improving headline technique diversity to 4 distinct techniques across 4 entries).

**Pattern extracted → `case-study.md` §3.7: Headline voice (first-person perspective, not first-person pronoun)**
**Pattern extracted → `personal-voice.md` §17.1: Sample 3b (verb-first headline reference)**

---

## Session: 2026-04-22 — Password phrase selection: "glad you are here"

#### CFB-041: Default site password changed from `preview-2026` to `glad you are here`

**Intent:** The portfolio password is shared by recruiters with hiring managers and team leads. It needs to read as a natural greeting when typed into the "Welcome, ___" sentence on the login page, be memorable enough to share verbally ("the password is glad you are here"), and avoid hierarchy tension across audiences (recruiters, peer designers, design directors, C-suite).

**Exploration path:**
1. **"my future teammates"** - Presumes mutual selection. A CEO or design director reading "Welcome, my future teammates" might think: I haven't decided that yet. Rejected for hierarchy reasons.
2. **"my new company"** - Same problem. "Welcome, my new company" presumes an outcome. Rejected.
3. **"glad you are here"** - Acknowledges presence without claiming a relationship. "Welcome, glad you are here" reads as genuine hospitality. Works whether the visitor is a recruiter, a peer, or a senior executive. No apostrophes, no contractions, no capitalization ambiguity in the canonical form.

**Decision:** "glad you are here" - selected for its tonal universality. It's warm without being presumptuous, simple enough to share verbally, and produces a complete natural sentence when typed after "Welcome,". The absence of contractions and punctuation in the canonical form minimizes formatting confusion, though the fuzzy normalization (ENG-193) accepts `you're`, dashes, caps, etc.

**Principle (extending CFB-031):** The password is microcopy at display scale. CFB-031 established that the placeholder text must serve the greeting sentence visually and tonally. This entry extends the same principle to the password content itself: the password must be a phrase that (a) completes the greeting naturally, (b) is shareable as natural speech, and (c) does not encode a social claim the visitor hasn't consented to. When the password IS the greeting, choosing it is a content decision, not a security decision.

**Cross-category note:** Design interaction rationale documented as FB-165. Engineering normalization documented as ENG-193.

---

## Session: 2026-04-21 — Essay content format: category eyebrow, cross-post link, dropped scope statement

#### CFB-040: Essay content type — reader-facing orientation metadata settled for essays, scope-statement convention retired, like-counter rejected in favor of cross-post link

**Intent:** Establish the content conventions for the newly-introduced `essay` content format (distinct from UX case studies) on `/work/[slug]`. User's session-opening instruction framed the need concretely against the ETRO Framework essay: the existing two-column case-study layout is actively misleading for an essay (no team, no duration, no hero metric), and the orientation signals readers actually want between the title and the body — publication date, read time, topic tag, and a cross-post link — have no home in the current shell. User also explicitly reversed an earlier proposal for a like-counter mid-session, requesting a Medium cross-post link instead.

**Root Cause (content dimension):** Two content-strategy conflations were baked into the existing shell:

1. **Format vs. topic.** The `category` field was carrying two signals simultaneously on ETRO — topic ("AI Trust Architecture") and format ("Essay") — via the string prefix `"Essay · "`. That worked as a workaround before a proper discriminant existed, but it collapsed two independent content axes (what is this *about* vs. what *shape* is it) into a single authored string. The homepage's essay-badge check tried to read format back out of that string with `category.toLowerCase() === 'essay'` and silently failed because the string was never just `"essay"`. Content failure (mis-overloaded field) produced an engineering failure (broken badge).

2. **Convention vs. content type.** The scope statement convention (`docs/content/case-study.md` §3.3: a 2-4 sentence opener that simultaneously establishes company context, role claim, and impact metric) is a case-study device — it exists because case studies need to anchor a hiring manager in the company/role/scale in 10 seconds before the hero metric fires. Essays have no company being scoped, no role being claimed within a team, no shipped product to attach a metric to. Forcing a scope statement onto an essay produces something between a disclaimer and a mis-registered self-citation ("This essay is authored by …") that reads as needy rather than authoritative. The authority on an essay comes from the argument itself in the H1 + opening blurb; a scope statement competes with that, not reinforces it.

**Resolution:**

1. **Meta row vocabulary and ordering.** Between the H1 and the blurb body, a single horizontal row: `{publication date} · {N} min read · Also on Medium ↗` (the Medium segment conditional on a non-empty `mediumUrl`). Ordering rationale: date is the most universal orientation signal (when was this written, is it still relevant); read time is the explicit time-cost disclosure (set expectations before commitment); cross-post link is the optional distribution footer (authors who publish elsewhere expose it). Segments separated by `·` in `$portfolio-text-placeholder` to keep the row scannable without borders.

2. **Link copy: "Also on Medium" (not "Read on Medium" / "View on Medium").** "Also" flags the Medium version as a mirror, positioning the portfolio version as the primary read. "Read on Medium" / "View on Medium" would redirect readers out of the portfolio before they've finished engaging with it — the wrong pressure at the wrong time on a page whose purpose is to keep the reader on the portfolio.

3. **Cross-post link replaces the like counter.** User's mid-session reversal: *"Thinking about that again, I think that instead of having the like count, that's just overcomplicating this. … The like count sounds cool, but it doesn't really do much and also is weird, given how many people will see other interview, potential interviewers looking at this and liking it."* A visible engagement counter on a portfolio primarily read by interviewers is socially off-key — a low number reads as weak, a high number reads as seeking validation, and any number invites scrutiny about audience composition. The "waiter's tip jar" social-proof metaphor from the original proposal doesn't translate: a tip jar is in a restaurant full of other patrons, where seeded tips prime real patrons' behavior; a portfolio essay is read one interviewer at a time, and no interviewer is ever going to click the like button themselves — the counter would be a read-only social signal with a broken generating mechanism. A cross-post link converts the same social-proof impulse ("this essay has distribution beyond the portfolio") into a concrete affordance without the generating-mechanism problem.

4. **Scope statement dropped for essays.** Removed the `scopeStatementMarkdown` option from `createCaseStudyBlocks` for the ETRO seed and deleted the orphan `SCOPE_STATEMENT` constant. The ETRO essay's framing ("Your AI product doesn't need more transparency. It needs the right kind.") is carried by the H1 + blurb body. `docs/content/case-study.md` §3.3 continues to govern case studies; essays are out of its scope.

5. **`"Essay · "` category prefix retired.** ETRO's category changed from `"Essay · AI Trust Architecture"` to `"AI Trust Architecture"`. The `contentFormat` discriminant now carries format; `category` carries topic only. One authored field, one content role.

6. **Category doubles as topic eyebrow on essays.** Same authored field as case studies, two rendering surfaces depending on format: on case studies it's the sidebar eyebrow above the title; on essays it's a small topic tag above the H1 (Medium-style). No new field needed — the existing `category` content carries the right signal and the layout variant chooses the right rendering.

7. **`title` intentionally unrendered on essays.** The essay's visible title is `introBlurbHeadline`. The internal `title` field ("ETRO Framework") is an admin-list / archive-ops short-name. Rendering both on an essay would produce a double-title experience where the short label competes with the headline — same problem as CFB-036's bold-font abuse in miniature. Admin can still edit `title` through the Payload form; it just doesn't render on the essay page.

8. **Default read time is hybrid.** Auto-computed from content at 225 wpm with a minimum of 1 minute; authors can override via `readTimeMinutesOverride` in the Meta tab. Content rationale: 225 wpm is the middle of the 200–250 wpm reading-speed band commonly used by Medium/Substack; the minimum-1-minute floor prevents the awkward `"0 min read"` on very short essays. Override exists because reading speed varies by density (a code-heavy essay reads slower than a prose essay of the same word count) and the author sometimes knows better than the estimator.

**Content principle (extracted → `docs/content.md` §Content type conventions):** When a portfolio carries a second content type alongside case studies, resist the pressure to reuse case-study conventions mechanically. Each convention on the case-study template (scope statement, hero metric, role-at-company sidebar, collaborators list) earns its place because case studies are the specific thing they serve; replicating them on a different content type usually produces either empty shells (no team, no metric) or semantic drift (scope statements about self-authored essays). Start from what the reader actually needs to orient themselves in the first 5 seconds for *that* type — for essays that's publication date, read time, and topic — and resist importing vocabulary from the neighboring type unless it survives the same "does this reader actually need this here?" test.

**Anti-pattern note:** `docs/content-anti-patterns.md` does not need a new entry. The failure modes exercised here ("smuggling format signal into a topic field via string prefix" and "mechanical reuse of case-study conventions on a non-case-study type") are content-strategy habits, not crystallized anti-patterns with named failure chronologies. If a third content type emerges and these patterns recur, promote to CAP-* then.

**Cross-category note:** Also documented as FB-164 (design feedback — single-column Medium-style layout, `EssayHeader` composition, inline SVG Medium logo under branding guardrail #7's icon/logo exception) and ENG-191 (engineering feedback — `contentFormat` discriminant on the `projects` collection, hybrid read-time helper at `src/lib/read-time.ts`, idempotent ALTER TABLE + legacy-row backfill, homepage projection fix closing a latent bug where the essay badge never fired).

**Docs reconciliation:** `docs/content/case-study.md` §3.2 "Essay Sidebar Variant" rewritten. The earlier table proposing a lightened essay sidebar is superseded: essays replace the two-column layout with a single-column Medium-style reading layout; orientation metadata lives in the meta row under the H1, not a sidebar.

---

## Session: 2026-04-20 — Video audio settings: vocabulary separates capability from state

#### CFB-039: "You're conflating two different things, and that's very dangerous" — admin labels for audio on video blocks

**Intent:** User rejected yesterday's single "Muted by default / Sound by default" label as the sole audio control on `VideoSettings`. Their distinction: *"'Muted by default' means the user can still have sound. 'Audio on or audio off' means that there is no mute functionality available to users; it just means that there is no audio for this video, so there is no mute/unmute button for the user."* They asked for a two-layer vocabulary: capability first, then (only when enabled) default-state. For external embeds they asked to remove the option entirely because the provider already owns the audio UI.

**Root Cause (content dimension):** The ENG-169 / FB-154 labels on the admin surface read as though they described the *viewer's starting state*. But because the underlying data model (`media.muted`) was actually doubling as a capability flag (silent captures → `muted=true`), any author reasoning from the label alone would misconfigure silent videos. The label promised a default state the data couldn't honor.

Two label genres were tangled:

- **Capability language** (what *exists* on the viewer side): "Audio off / Audio on", "Expose audio controls to viewers", "no audio for this video."
- **Default-state language** (how existing controls *start*): "Muted by default / Sound by default", "Starts muted by default."

The single-ButtonSelect implementation forced the author to guess which genre the label belonged to for each asset. Worse, because most portfolio videos are silent loop captures, "Sound by default" on those assets would produce a visible-but-useless Unmute button — a broken affordance driven by misleading copy.

**Resolution:**

1. **`VideoSettings` admin copy — split into two surfaces:**
   - Primary `ButtonSelect` values: `"Audio off"` / `"Audio on"` (capability). Bound to the new `media.audioEnabled` field.
   - Secondary `ButtonSelect` (rendered only when Audio is on): `"Muted by default"` / `"Sound by default"` (default state). Bound to `media.muted`, which keeps its name but narrows its meaning to default state.

2. **Payload admin field labels (the Payload UI itself):**
   - `audioEnabled` — label `"Expose audio controls to viewers"`, description: *"Capability axis: does this video carry a usable audio track? When off, no mute/unmute control is rendered to the viewer. Leave off for silent loop captures."*
   - `muted` — label `"Starts muted by default"`, description: *"Default-state axis: if audio controls are exposed, does playback begin muted? Ignored when audio controls are off."*

   The description strings name the axis explicitly so an author reading the Payload admin can't repeat the conflation even without seeing `VideoSettings.tsx`. "Capability axis" and "Default-state axis" are now shared vocabulary across docs + admin descriptions + inline-edit copy.

3. **`VideoEmbed` admin surface — audio-default control removed entirely.** The paste-URL input is now the only control. The content decision: the provider (YouTube / Vimeo / Loom) owns audio vocabulary for external content. A second control competing with the provider's own mute button would introduce two vocabularies for one behavior and make the configured state unreliable under varying autoplay policies.

**Pattern extracted (new):** Admin-surface labels must be grep-able by axis. When a field governs "does this control exist?" the label uses capability vocabulary (*expose, surface, on/off*). When a field governs "how does the control start?" the label uses default-state vocabulary (*by default, starts muted*). A label that could fit both genres is a sign the field is doing two jobs and must split. This pattern complements the engineering side (schema splits into two fields) but is an independent content rule: even when the data is already split, the labels still have to pick a single genre and stay inside it.

**Voice check:** New strings use plain language, no em dashes, no fluff:

- ✅ "Audio off" / "Audio on" (2 words each, unambiguous)
- ✅ "Muted by default" / "Sound by default" (parallel structure; "by default" is the axis marker)
- ✅ "Expose audio controls to viewers" (verb + object; describes what flipping the field changes)
- ✅ "Starts muted by default" (states the starting condition; ties back to "by default" parallel)

**Cross-reference:** Cross-category with FB-157 (UI tree structure) and ENG-170 (schema + component work). Corrects CFB-037 / FB-154 / ENG-169 vocabulary from the same session.

---

## Session: 2026-04-20 — Portfolio Home Case-Study Order

#### CFB-038: "Why is the current case study order: Lacework, the design system, Goldman Sachs. They should have been Goldman Sachs at the top. I don't know starting from which point it was moved up, and this is just wrong, and I've never said it this way."

**Intent:** User flagged that the home page orders case studies Lacework → Élan → Meteor (Goldman Sachs), and insists Goldman Sachs should lead. They want a trace of when the order was "moved up," a fix, and documentation.

**Trace (answer to "starting from which point"):** Goldman Sachs was never at the top in git history. The order has been stable since the API routes were first committed on `d9bb2d3` (Mar 30 2026, "Mar 30 daytime changes"), which set `update-lacework/route.ts` → `order: 1`, `update-elan/route.ts` → `order: 2`, `update-meteor/route.ts` → `order: 3`. The only subsequent `order` mutation was `e28a1a0` (Apr 6 2026), which bumped Élan from 2 → 3 to make room for ETRO, producing an incidental 3-3 tie until ETRO stabilized at 5 in `b7e9353` (Apr 17). Meteor has been at 3 since inception. What the user perceived as "moved up" was not a move — it was a default baked into the scaffold that nobody challenged.

**Root Cause (content dimension):** The `order` integer on each project encoded *when the case study was added to the portfolio*, not *where it belongs in the portfolio narrative*. Lacework was the first case study migrated into the CMS, so it got `order: 1` by scaffolding convention; every case study added afterward was numbered in arrival sequence. No step in the case-study-authoring or content-iteration skills asks "where does this new piece slot relative to the existing ones?" — authoring materializes content into the CMS at whatever order the route file declares, and nobody goes back to re-rank. The narrative cost: the reader's first impression of the portfolio was framed by a consumption-billing UX redesign (Lacework) rather than by the single largest-scope project (Meteor / Goldman Sachs: $79B AUM, sole designer, nine engineers, three time zones). The strongest proof of scale was buried behind two lighter pieces.

**Resolution:**
1. `src/app/(frontend)/api/update-meteor/route.ts` — `order: 3` → `order: 1`.
2. `src/app/(frontend)/api/update-lacework/route.ts` — `order: 1` → `order: 2`.
3. `src/app/(frontend)/api/update-elan/route.ts` — already `order: 3`, unchanged.
4. `src/app/(frontend)/api/update-etro/route.ts` — already `order: 5`, unchanged.
5. `POST /api/update-meteor` → `{"action":"updated","id":2,"slug":"meteor"}`; `POST /api/update-lacework` → `{"action":"updated","id":1,"slug":"lacework"}`. Verified via `GET /api/projects?sort=order`: meteor(1), lacework(2), elan-design-system(3), ascii-studio(4), etro-framework(5), illustrations(6).

**Pattern extracted (new):** The home-page case-study order is a narrative-priority decision, not a chronology. The question to answer before any new case study ships is: "If this reader reads only the first case study, which one is most likely to earn the next click?" That piece takes `order: 1`. The rest descend by impact, not by authoring date. This applies in reverse too: when authoring adds a new case study, the author must explicitly decide its rank, not let it default to the next integer.

**Cross-reference:** Also documented as ENG-168 in `docs/engineering-feedback-log.md` (the data-shape / scaffolding side of the same incident). Anti-pattern promoted to `docs/content-anti-patterns.md` as CAP-029 ("Chronological Case-Study Order").

**Files touched:** `src/app/(frontend)/api/update-meteor/route.ts`, `src/app/(frontend)/api/update-lacework/route.ts`, `docs/content-feedback-log.md`, `docs/content-anti-patterns.md`, `docs/engineering-feedback-log.md`, `docs/engineering-anti-patterns.md`.

---

## Session: 2026-04-17 — ETRO Essay Blurb vs Article Boundary

#### CFB-037: "This part should be moved into the Intro blurb section instead of the official article."

**Intent:** User quoted Section 1 of the ETRO essay (heading `'Your whole approach is wrong.'` plus the 4-paragraph CEO-dismantle narrative) and said it belongs in the intro blurb, not in the article body.

**Root Cause:** During CFB-035 materialization, I treated this as a standard case study and kept the case-study-shaped blurb contract: short 73-word trailer in `introBlurbBody`, narrative begins at content block 0. But this is not a case study - the dossier explicitly documents it as "Essay (not a standard case study), text-majority, no image floor." Essays and case studies have different blurb contracts: a case study trailer TEASES to earn a click (the reader is deciding whether to commit), while an essay blurb IS the lede (the reader has already committed by clicking in; the hook should drop them into the narrative immediately). The CEO scene was the natural lede - dramatic, short, self-contained - but I kept it inside the article body because that's where case study content goes. This produced a sequence with two "openings": the short blurb trailer and then Section 1 (the real lede), which read as redundant and delayed the hook by one scroll.

**Resolution:**
1. `src/app/(frontend)/api/update-etro/route.ts` - replaced `BLURB_BODY` with the 5-paragraph lede: the CEO's direct quote ("Your whole approach is wrong.") as the opener, followed by the 4 narrative paragraphs that were Section 1's body. The quote moves from being a section heading (single-quoted typographic styling) to being a spoken quote in prose (double-quoted direct speech) - natural register shift from heading to body.
2. Removed the first content block (`heading: "'Your whole approach is wrong."'`) entirely. Article now starts at "The Success That Almost Wasn't." (backstory section), which flows correctly because the blurb has already established the CEO scene.
3. Tweaked `SCOPE_STATEMENT`: removed the clause "A Blackstone veteran challenged the approach as overkill, forcing a second axis..." - that exact beat now lives in the blurb one paragraph above. Replaced with "The framework has a second axis: the four elements are always present, but their volume calibrates to stakes, user tenure, and task novelty." Same fact, no recap.
4. `POST /api/update-etro` → `{"action":"updated","id":6}`. REST verified: block count 13 (hero + 6 × heading/richText, down from 15), blurb has 5 Lexical paragraphs, article first heading is now "The Success That Almost Wasn't.", scope statement no longer contains "Blackstone veteran challenged".
5. Homepage card unaffected - that surface reads `introBlurbHeadline` + `HOME_CASE_SUBLINE_BY_SLUG['etro-framework']` ("Opinion · AI Trust Architecture"), not `introBlurbBody`. Confirmed in `src/app/(frontend)/(site)/page.tsx`.

**Pattern extracted (new):**
Case studies and essays have structurally different blurb contracts. In a case study, the blurb body is the TRAILER - a compressed tease whose job is to earn the click. The real opening is Section 1, which the reader sees after committing. In an essay, the blurb body is the LEDE - the hook itself, because the essay has no "committing" moment left to earn; the reader already committed by navigating in. When materializing a piece whose dossier lists `Format: Essay`, do not apply the case-study blurb pattern by default. Look at the first content block's role: if it functions as a dramatic hook or in-medias-res opener (not a "here's what I'll tell you" paragraph), promote it to `introBlurbBody` and drop it from the article body. The article then opens with the backstory section, which is the essay's actual second beat.

Secondary rule: when the blurb absorbs a scene, the `description` (scope statement) must not recap that scene. The reader encounters the blurb first and scope second, a handful of lines apart. Repeating a named beat across both feels like bureaucratic framing. Replace any recap clause in the scope with the underlying fact it was gesturing at.

**Cross-reference:** This is a direct refinement of the CFB-035 materialization. The original plan explicitly said "keeps `introBlurbHeadline` [formatting that matches]" but did not reconsider the blurb-body contract for an essay vs a case study. The dossier already flagged the format difference; I didn't apply it to the blurb/body boundary.

**Files touched:** `src/app/(frontend)/api/update-etro/route.ts`, `docs/content/projects/etro-framework.md`.

---

## Session: 2026-04-17 — ETRO Essay Bold Abuse

#### CFB-036: "The current article abuses bold font. There's also not a clear separation between sections, somehow, or the hierarchy not visually clean."

**Intent:** Two complaints in one message. (1) Too much bold. (2) Section hierarchy not visually clean / sections feel undifferentiated.

**Root Cause:** When materializing the essay in CFB-035, I imported every `**bold**` from the user's source markdown verbatim - 36 bold spans across 7 bodies, used in the source as scan anchors ("Per user.", "Scaffolding.", "What role does trust play here?", etc.). This directly violated `voice-style.md` §13.1: "Bold: only for section headings and impact metrics. Never in body text for emphasis."

The two complaints were one cause. `.sectionHeading` uses `subtitle-1` (xl, semibold). Body uses `body-base` (regular). Inline `<strong>` at body size renders weight 700 - heavy enough to read as a peer of the semibold heading. N bold spans per section = N+1 competing stops, so the reader stops perceiving the H2 as the dominant break. "Can't see section separation" was not actually about the `layout-x-spacious` gap between `.blockWrapper`s - it was about density inside each section eroding the H2's dominance.

**Resolution:**
1. Stripped every `**bold**` from all 7 bodyMarkdowns in `route.ts`. 36 → 0.
2. Where the bold was serving as a scan anchor, converted to colon-prefixed paragraph starts: "Per user:", "Per task:", "Scaffolding:", "Structure:", "Migration:". The colon carries the scan-anchor role without a weight jump.
3. Removed the inline `### The noise reduction...` H3 from Section 4's body - not just because it was over-emphasis, but because `lexicalToHtml` silently drops heading nodes when a richText root has mixed heading+paragraph children. That line was likely not rendering at all.
4. Removed the final bold thesis question block "**What role does trust play here? Does it have a shelf life? What inherits it?**" - the three question marks are already the typographic emphasis.
5. Kept italic (`*word*`) intact: voice-style bans bold specifically, not italic.
6. `POST /api/update-etro` → `{"action":"updated","id":6}`. Verified via REST walk of the Lexical tree: 0 text nodes with FORMAT_BOLD bit set across all 7 richText bodies. All 7 headings and 15 total blocks intact.

**Pattern extracted (new):**
When importing a user-supplied markdown essay into CMS blocks, do NOT preserve inline `**bold**` verbatim even if the source uses it as scan-anchor typography. The source markdown was likely written for a Medium/Substack/Notion rendering context where inline bold is common and the surrounding typography supports it. The portfolio design system has a specific typography contract: H2 section headings own the dominant-stop role, and bold in body competes with it. When the source has inline bold, convert it to one of:
- a colon-prefixed paragraph start ("Per user: ...")
- a paragraph break alone (the sentence ending is its own anchor)
- an italic if the emphasis is tonal rather than structural
- drop it if it was purely typographic habit with no structural role
Never leave raw `**bold**` spans in bodyMarkdown.

**Cross-category note:** Also documented as FB-143 (design feedback log). The user's complaint landed as "hierarchy not visually clean" (Design), but the fix was in content strings, and the rule violated was `voice-style.md` §13.1 (Content). This is the canonical shape of a cross-category issue: Design-perceived, Content-caused, single-file fix.

**Files touched:** `src/app/(frontend)/api/update-etro/route.ts`, `docs/design-feedback-log.md`, `docs/content/projects/etro-framework.md`.

**Follow-up check:** Run a regex sweep on every other `src/app/(frontend)/api/update-*/route.ts` for `\*\*` inside `bodyMarkdown` strings - any matches are the same anti-pattern in other essays/case studies and should be cleaned up before they're noticed.

---

## Session: 2026-04-17 — ETRO Essay Replacement

#### CFB-035: "Replace ETRO essay body with new calibrated-transparency draft"

**Intent:** User delivered a full rewritten draft of the ETRO essay (`Your AI product doesn't need more transparency. It needs the right kind. (5).md`). Asked to replace the current case study body with the new markdown, formatted into the existing case study block system.

**Root Cause:** N/A — user-authored content replacement, not a diagnosis cycle. Treated as a Phase 3 materialization task (skill: case-study-authoring): pre-written essay → CMS blocks.

**Resolution:** Rewrote `src/app/(frontend)/api/update-etro/route.ts`:
1. Replaced `BLURB_BODY` with a 73-word, two-paragraph trailer that foregrounds the ninety-second CEO dismantle and the "right and also completely wrong" reframe (keeps `introBlurbHeadline` "Trust has a shelf life. Sometimes." — it already matches the essay's closer).
2. Replaced `SCOPE_STATEMENT` with a 3-sentence credentials paragraph that names ETRO, the calibrated-transparency second axis (stakes × tenure × novelty), and the three opening questions for new engagements.
3. Expanded `CONTENT_BLOCKS` from 5 to 7 sections matching the essay: ("'Your whole approach is wrong.'", "The Success That Almost Wasn't.", "Present, Past, Future, Always.", "Full Transparency Is Its Own Kind of Noise.", "Trust Is Relational, Not Binary.", "Scaffolding, Structure, or Migration.", "Trust Has a Shelf Life. Sometimes.").
4. Dropped per-section `imagePlaceholders` (essay format — no image floor; user's draft does not evoke specific diagrams). Kept a single hero placeholder per Phase 3 hero-enforcement rule.
5. Split every paragraph to the 3-sentence cap. Verified no em dashes (source was clean; used ASCII hyphens throughout). Changed `category` from "Design Strategy · AI Trust Architecture" to "Essay · AI Trust Architecture" to match the draft's frontmatter and the essay format the dossier already documents.
6. `POST /api/update-etro` returned `{"action":"updated","id":6}`. Verified via REST: 15 blocks (hero + 7× heading/richText), all 7 headings present, distinctive strings "Blackstone" and "FDIC insurance" present in the body.
7. **Follow-up correction (same session):** User pointed out the case-study page title still read "Trust has a shelf life. Sometimes." — that phrase is the essay's closing section, not its title. Updated `INTRO_HEADLINE_BY_SLUG['etro-framework']` in `src/lib/case-study-intro-headline.ts` to the essay's actual title: "Your AI product doesn't need more transparency. It needs the right kind." Re-pushed via `POST /api/update-etro` (confirmed live in Payload: `introBlurbHeadline` now matches essay title). The closer phrase still functions as Section 7's heading inside the body — it does Deliberate Ambiguity duty there, not as the blurb hook.

**Pattern extracted (new):** When a user-supplied essay draft has `# Title` frontmatter and a distinct closing-section heading, they are NOT interchangeable. `introBlurbHeadline` must be the essay title (hook). Do not promote a closer to the headline even when the closer phrase is more aphoristic. This is a specific variant of the general rule: the hook answers "what is this essay about?"; the closer answers "where did the essay land?". Confusing the two misrepresents the essay on the homepage card and on the case-study page title.

**Pattern (not new, reinforced):** When the user supplies a finished essay draft and asks for block formatting, skip Phase 1–2 checkpoints and drop straight into Phase 3 materialization. Preserve the author's structural choices; the agent's only transformations are (a) paragraph splits to the 3-sentence cap, (b) hyphen/em-dash sanitization, (c) dropping image placeholders for essay format, and (d) hero enforcement. This matches case-study-authoring §Scenario Detection row 3 ("Write up + raw material + existing slug — new material supersedes old").

---

## Session: 2026-04-12 — ETRO Voice Rewrite

#### CFB-034: "ETRO essay doesn't read like a human wrote it - machine-compiled literature review voice"

**Intent:** User said the ETRO essay reads like "a bunch of machine spit out some summary chunks" with "no logic, no storyline, just jumping around." Requested rewrite to match the approved voice from Meteor, Lacework, and Elan case studies.

**Root Cause:** Six structural problems: (1) Section 2 repeated a 4-part parallel pattern (theory -> external example -> "In my system...") creating encyclopedic monotony. (2) External examples (medical AI, legal contracts, code review agents, autonomous vehicles) were spectator summaries with zero personal stake. (3) No narrative connective tissue between sections. (4) Literature-review sentences ("Across 90 studies...") created academic distance incompatible with the practitioner voice. (5) Bold sub-headers mid-section made it read like a reference doc. (6) Paragraphs over-explained, violating the "treats the visitor as an intellectual equal" brand principle.

**Resolution:** Major rewrite of all five sections. Section 2 collapsed from ~1,200 words of parallel structure to ~450 words of narrative - each ETRO element introduced through what happened in the system, not through theory-then-application. All external examples deleted. All bold sub-headers deleted. All literature-review sentences deleted. Section 3 cut CEO resume-padding and put reader in the conversation. Section 4 removed redundant gradient explanations (said the same thing three times). Section 5 cut the self-summarizing opener. Blurb last line sharpened. Scope run-on sentence broken into three.

**Extracted Pattern:** The "parallel-structure encyclopedia" is a distinct AI writing failure mode - when asked to cover N items, the default output is N identical mini-essays with the same beat pattern. The fix is not to rewrite each mini-essay but to refuse the parallel structure entirely and let items emerge from narrative. Related to CAP-017 (AI voice tells) but a structural variant, not a vocabulary one.

---

## Session: 2026-04-10 — Site Nav Tagline

#### CFB-033: "ETRO framework rewrite - theoretical grounding, multi-voice challenge, temporal framing"

**Intent:** Rebuild the ETRO essay from "case study dressed as a framework" into "a real framework illustrated by a case study." User wanted: (1) the CEO challenge foregrounded as the blurb's hook, (2) theoretical grounding under each ETRO element, (3) cross-domain validation from multiple CEO conversations, (4) framework claims separated from Meteor examples.

**Root Cause:** The original essay asserted the four elements without justification, treated one CEO's pushback as a single-voice challenge, and used Meteor features as both product examples and framework definitions. The blurb underweighted the challenge-and-refinement narrative.

**Resolution:**
1. Blurb rewritten with Punch-Counterpunch (T1) structure: earned trust -> CEO challenge -> vulnerability ("I agreed too quickly") -> cross-domain validation -> thesis. 79/80 words.
2. Scope statement adds $79B AUM provenance, multi-CEO challenge, honest position ("calibrated transparency, not maximum transparency").
3. Section 2 renamed from "Four Pillars, One Job" (pillar metaphor contradicted the argument) to "Present, Past, Future, Always." (Object Title + Staccato Authority). Four-questions temporal framing added. Each element gets four-beat structure: human problem, theoretical grounding, second-domain example, tagged Meteor instance.
4. Section 3 enhanced with intellectual-weight framing, actual follow-up email language (Warranted Vulnerability, T12), cross-domain proof via onBeacon consultation, and "trust as relationship" claim.
5. Section 4 gets closing theoretical loop connecting gradient back to four questions.
6. Section 5 pacing fixes + closed-loop callback (T15) to Section 1's "twelve thousand lines."
7. All paragraphs verified against 3-sentence cap. All "pillar" references updated to "element" or "question."

**Pattern extracted:** The temporal-layers framing (present/past/future/always) is a reusable justification pattern for any multi-element framework: map elements to distinct temporal modes to argue theoretical completeness.

---

#### CFB-032: Top navigation tagline text update

**Intent:** Replace the identity line shown next to the site name in the main nav with a clearer formulation of role and employer.

**Resolution:** Updated `SITE_ROLE_DISPLAY` in `src/lib/site-role-display.ts` to `Designer, AI Systems & Experience | Goldman Sachs`. Extended `resolveSiteRoleFromCms` so rows still storing the previous canonical string (`AI-Native Product Builder. Currently at Goldman Sachs`) normalize to the new line without a manual CMS edit.

---

## Session: 2026-04-08 — Login Page Placeholder Copy

#### CFB-031: Login page placeholder — "(what I told you)"

**Intent:** With the password-as-name concept (password is visible text, not dots), the placeholder/ghost text needed to serve two masters: (1) tell users to type their password, and (2) not break the "Welcome, ___" greeting sentence visually or tonally.

**Exploration path:** Three options were tested live:
1. **Ellipsis (`…`)** — Minimalist. "Welcome, ..." reads as an incomplete thought. Visually weightless at 2.75rem serif. Lets the design speak. But the user wanted to evaluate alternatives.
2. **"your password"** — Functional sentence fragment. "Welcome, your password" is unmistakable but flat. Tested and moved on.
3. **"(what I told you)"** — Conversational parenthetical. Implies a prior relationship ("I already gave you the password via email/message"). Has personality without being precious. The parentheses signal it's an aside, not part of the greeting sentence.

**Decision:** "(what I told you)" — selected by the user for its tonal balance between functional clarity and personality. It's idiot-proof (the parentheses and phrasing make it obviously a prompt, not content), conversational (assumes a human relationship), and portfolio-appropriate (a design portfolio can afford warmth that a banking app cannot).

**Principle:** At oversized display fonts (2.75rem+), placeholder text is a visual event, not a footnote. Length matters as much as tone — "Type your password" at 44px serif would dominate the layout. Shorter placeholders let the greeting and the input share the visual stage. When the placeholder IS visible at display scale, treat it as UX microcopy with brand voice, not boilerplate.

**Cross-category note:** The placeholder required a custom rendering approach (span overlay instead of native `placeholder` attribute) due to browser focus behavior disabling `text-overflow: ellipsis` — documented as ENG-139.

---

## Session: 2026-04-06 — ETRO Framework Article Revision (External Editorial Critique Integration)

#### CFB-030: "Two external editors critiqued the ETRO article - integrate feedback"

**Intent:** User received two detailed editorial critiques from experienced column editors. Both editors diagnosed real structural and rhetorical weaknesses but prescribed fixes optimized for standalone column publication, not portfolio artifacts. User requested adversarial analysis of the critiques, then a revision plan integrating the feedback.

**Root Cause:** The original ~1,800-word article had five structural weaknesses: (1) framework led over insight, (2) "I built/developed/refined/validated" pattern repeated throughout, (3) CEO challenge section was the strongest material but underdeveloped, (4) cross-domain validation was thin (compressed from 5,500-word raw source), (5) closing hedged instead of committing.

**Resolution:**
All 12 editorial recommendations were assessed as "partially adopt and adapt." Key changes:
1. **Blurb body rewritten:** Removed "I built the trust architecture" construction. Sharpened CEO foreshadowing ("the features I was proudest of might be exactly what slows AI adoption"). Flashed thesis resolution (two roles of trust) as outcome.
2. **Scope statement restructured:** Insight leads ("Trust features are either scaffolding or permanent structure"), framework name follows. Provenance compressed. Unsupported "most AI products get trust architecture wrong" replaced.
3. **Section 2 (Four Pillars):** Added trust-dimension mapping sentence. Broke pillar symmetry (reversibility as adoption unlock, observability hardest to prove). Added concrete observability metrics (40% override rate drop, spot-check frequency).
4. **Section 3 renamed and expanded:** "The Challenge That Changed Everything" (Preview Title) renamed to "Full Transparency Is Its Own Kind of Noise" (Verdict Title). Added genuine reckoning beat: interrogated whether ETRO or noise reduction did heavy lifting, resolved by arguing they were inseparable.
5. **Section 4 revised:** Added concrete gradient example (behavioral threshold as measurable signal). Added acknowledged open question (gradient turning back up - unsolved). Replaced "I validated this" with vivid cross-domain design decision (IA inversion for growth PM startup). Sharpened trust-currency prose with more specificity and edge.
6. **Section 5 tightened:** Replaced generic industry closer with personal design commitment ("Every AI product I touch now..."). Cut "AI industry is locked in a false choice" paragraph.
7. **Sidebar:** Collaborators changed from "Cross-domain product consultations" to "Startup founders" + "Engineering leaders."

**Key editorial principle established:** Editors' diagnostics are usually right; their prescriptions are usually wrong when applied to portfolio artifacts. A column optimizes for argument sharpness and reader utility. A portfolio artifact optimizes for hiring signal and demonstrated judgment. These overlap but diverge on self-critique, framework branding, provenance, and falsifiable claims.

---

## Session: 2026-04-06 — ETRO Framework Article (New Format: Deep Article)

#### CFB-029: "The ETRO Framework will not be a case study but a deep article"

**Intent:** Transform a raw, messy ~5,500-word framework document into a polished ~1,800-word column-style article for the portfolio. Same personality and writing style as case studies but in article format - longer than a case study, shorter than a Medium deep-dive. All startup names redacted. Logic restructured around a narrative arc rather than textbook pillar-by-pillar definitions.

**Root Cause:** The raw material had three structural problems: (1) throat-clearing opening ("AI models are commoditizing") that could be anyone on LinkedIn, (2) academic textbook structure (definition, definition, definition, case study, critique, answer) instead of a narrative arc, (3) too many competing examples diluting each other (six different companies/products). The strongest thread - "built it, got challenged, refined it, arrived at simpler truth" - was buried under structural noise.

**Resolution:**
1. **Rethought opening:** Cold open with the behavioral shift ("Six weeks after launch, users stopped checking") instead of industry commentary. Earns the right to introduce the framework through a specific, visceral moment.
2. **Restructured logic:** Five sections following a narrative arc: the evidence (Twelve Thousand Lines of Doubt) -> the framework (Four Pillars, One Job) -> the challenge (The Challenge That Changed Everything) -> the answer (Volume Dial, Not Light Switch) -> the verdict (Scaffolding or Structure. Know Which.)
3. **Redacted names:** Goldman Sachs -> "a financial institution I probably can't name" (wry acknowledgment). Norm AI, Pay-i, Devin, Salesforce all removed or generalized. Management analogy from the unnamed CEO preserved as the dramatic turn.
4. **Cut ruthlessly:** Removed UX Patterns bullet lists, Principles appendix, Emerging Frontiers speculation, Trust Beyond the Interface section, Devin deep-dive. ~5,500 words -> ~1,800 words.
5. **Applied voice techniques:** Section titles use Object Substitution ("Twelve Thousand Lines of Doubt"), Framework Inversion ("Volume Dial, Not Light Switch"), and Verdict + Staccato ("Scaffolding or Structure. Know Which."). Blurb headline uses Deliberate Ambiguity ("Trust Has a Shelf Life. Sometimes.").
6. **Materialized to CMS** as project entry (slug: etro-framework, id: 6, updated from project-six placeholder).

**New pattern: Article format in the case study infrastructure.** The case study page anatomy (hero, sidebar, intro blurb, content blocks) works for long-form articles when the sidebar carries author/context metadata instead of project metadata. This extends the portfolio's content types beyond case studies. The voice rules from `voice-style.md` apply but with relaxed word count constraints - article sections can carry longer prose than the 1-3 sentence case study feature sections.

**Pattern extracted -> `content.md`:** Consider adding a §19 for non-case-study content types (articles, frameworks, opinion pieces) if this format recurs.

---

## Session: 2026-04-05 — External Review Triage & Evidence Anchoring Framework

#### CFB-028: "Two external reviewers evaluated case study writing quality"

**Intent:** Two independent reviewers assessed the Meteor and Lacework case studies. The goal was to identify genuine content gaps versus suggestions that would weaken top-of-funnel conversion if followed. Evaluation focused on writing quality and persuasiveness for a UX portfolio, not general copywriting.

**Root Cause:** Both reviewers independently identified the same gap: hero metrics float without derivation. The 95% and 58% numbers are compelling but unanchored - a reader who wants to believe them has no arithmetic to hold onto within the scan window. This was the only genuine content gap.

**Resolution - What was adopted:**
1. **Metric derivation anchoring** (Lacework): Added "in task-based evaluations with internal users" to scope statement. Anchors the 58% without inviting sample-size scrutiny.
2. **Stakes escalation** (Meteor S3): Added Jet ultimatum stakes ("engineers estimated six more months - past our deadline, past our budget justification"). Makes the existential risk of the migration crisis concrete.

**Resolution - What was adapted (deferred to systemic infrastructure):**
- **Pattern diversity:** Reviewers noted "both follow the same framework." With only 2 case studies, this is voice consistency, not repetition. Built a diversity gate and Portfolio Coherence Manifest to catch this proactively as case studies accumulate.

**Resolution - What was rejected (with reasoning):**
| Suggestion | Decision | Reasoning |
|---|---|---|
| Add failure/vulnerability sections | Reject | Failure is already embedded as story setup. Confessional asides conflict with outcome-oriented luxury positioning. |
| Tone down "self-marketing copy" language | Reject | "Read how I turned..." and "I saved the page..." are documented gold standards. Muting hooks reduces conversion. |
| Add methodology sections for metrics | Reject | Violates visual-first, text-minimal posture. One derivation clause per metric is the right calibration. |
| Disclaim role scope | Reject | "Drove feature strategy" is accurate for founding designer with no PM. Prepare interview answer, don't weaken portfolio. |

**Patterns extracted:**
- **CAP-025 (Floating Metric):** New anti-pattern. A hero metric without derivation visible in the scan window is a trust liability. Three-category taxonomy: derived metrics need before/after absolutes, self-anchoring metrics need domain clarity, behavioral observations need temporal anchors.
- **CAP-026 (Employment Classification Signal):** New anti-pattern. Portfolio text that reveals diminishing employment types (internship, contract) contradicts senior-level positioning. Narrowed: founding/sole/first-hire labels are assets, not triggers.
- **Check 17 (Metric Derivation Proximity):** New compliance check using the three-category taxonomy.
- **Check 18 (Credibility Stress Test):** New perception check for role claims, impact claims, and employment signals.
- **Portfolio Coherence Manifest:** New infrastructure for tracking stylistic diversity across case studies.
- **Named Narrative Shapes:** Five named arc patterns added to narrative-arc.md for diversity classification.
- **Interview Defense Notes:** New Phase 3b in the authoring skill. Produces companion files with metric defense, role scope precision, and prepared responses for strategic omissions.

---

## Session: 2026-04-05 — Meteor Case Study Full Rebuild

#### CFB-027: "Write up the case study for Goldman Sachs Meteor - treat as brand new, strip away existing"

**Intent:** Full rebuild of the Meteor case study. User dissatisfied with v1 skeleton (ETRO framework thesis). Source material: Rengo AI R3 interview transcript where user presented the case study, with wording tailored to an AI startup's needs. Goal: demonstrate founding designer judgment and relevant experience for a general portfolio audience.

**Root Cause:** V1 thesis (ETRO trust framework) treated features as the story when the real story is the strategic judgment that made those features possible. The case study needed to fill a portfolio gap: 0-to-1 product creation and founding-designer scoping decisions.

**Resolution:**
1. Completed full 4-phase case-study-authoring workflow (Analyze, Plan, Write, Review).
2. New thesis: "Three counterintuitive scoping bets that made a 0-to-1 platform adoptable."
3. Three decision-structured sections with user-directed titles: "The Scope Buffet" (Object Substitution T6), "Not the Squeaky Wheel" (Framework Inversion T7), "Nobody Migrates Halfway" (Verdict T8).
4. Headline: "I had to choose whom NOT to design for." (Protagonist Framing T10).
5. Route rewritten from legacy `sections` array to `content` blocks via `createCaseStudyBlocks`.
6. 16 image placeholders (1 hero + 15 across 3 sections) ready for screenshot replacement.
7. ETRO framework demoted from thesis to visual evidence within Section 3.

**Patterns extracted:**
- **Negation threading as cohesive device:** When a thesis centers on counterintuitive exclusion, carrying a negation word through titles (NOT/Not/Nobody) creates structural cohesion. S1 breaks the pattern intentionally (setup before discipline). User-discovered pattern, transferable to any contrarian thesis. Documented in dossier positive signals.
- **Agent overreach on jargon:** Agent pushed back on "scope" as jargon for a tech audience. User correctly identified this as a basic industry term. Lesson: the jargon gate in technical-framing.md should not fire on domain fundamentals. Reserve pushback for genuinely obscure terminology.
- **Decision sections over feature sections (reinforced):** Structuring around choices (what, whom, how) rather than outputs (feature A, feature B) is the right model for senior/strategic signal. Already in style preferences; now confirmed across two case studies (Lacework and Meteor).

---

## Session: 2026-04-04 — Title Semantic Redefinition

#### CFB-026: "Sidebar title should be app name; intro blurb headline is the official case study title"

**Intent:** Promote `introBlurbHeadline` to the official case study title. The homepage masonry card should show the creative tension headline, not the app name. The `category` line and thumbnail provide domain context.

**Root Cause:** The previous system used `title` (app name) as the homepage card title, hiding the most engaging content (the creative headline) behind a click. The intro blurb headline techniques (Protagonist Framing, Verdict-as-Headline) produce strong hooks that are wasted when only visible inside the case study.

**Resolution:**
1. Updated authoring skill materialization map: `title` = app name, `introBlurbHeadline` = case study title / creative headline.
2. Updated `case-study.md` page anatomy: `# Application Name` (was `# Project Title`). Added CMS storage note explaining homepage card now reads `introBlurbHeadline`.
3. Updated `conversion-funnel.md`: homepage cards now hook through headline intrigue + category/thumbnail for domain signal.
4. Updated `project-selection.md` §8.4: Joseph Zhang's "Company / Domain" pattern now maps to "Headline / Category" in our model.
5. Updated `self-audit.md` §11.2: project card titles hook through intrigue; domain communicated by category + thumbnail.
6. Updated `language-patterns.md`: blurb headlines are now also homepage card titles, raising stakes on headline quality.

**Pattern extracted:** Homepage card semantics shifted from domain-first (app name + category) to intrigue-first (creative headline + category). This aligns with the luxury positioning principle - the card is now a trailer, not a label.

**Cross-category note:** Also documented as FB-106 (design) and ENG-120 (engineering).

---

## Session: 2026-04-04 — Voice Calibration System

#### CFB-025: "Rework the Lacework case study based on interview transcript material"

**Intent:** Full rebuild of Lacework case study using new raw material (Norm AI interview transcript where the user presented the project). User wanted the case study rewritten with all content skills now in place, using the transcript as the primary source.

**Root Cause:** Previous version (v1) was written before the full content skill system was established. While nothing was "particularly off," the case study lacked the thesis-driven structure, intro blurb, voice calibration, and narrative arc that the skills now enforce. The interview transcript provided richer signal material than the original sources.

**Resolution:**
1. Phase 1 (Analyze): Extracted signal inventory from 38-page interview transcript. Identified 3 trade-off moments (Tableau vs. in-app, page arrangement, visualization evolution), 4 metrics, and multiple CSM quotes. Technical resonance scan found authentic parallel to AI consumption-based pricing.
2. Phase 2 (Plan): Selected thesis "billing model transition - self-service." Mapped 7 beats to 3-section anatomy. User provided creative direction for all headings: "Five Matryoshkas Deep", "Build Instead of Buy", "Donut. Avoid at All Cost."
3. Phase 3 (Write + Materialize): New intro blurb (headline: "I saved the page my own team gave up on", body: 64 words/6 sentences). New scope statement with Snowflake/LendingTree social proof and AI pricing parallel. Three feature sections totaling ~125 words. Migrated from legacy sections to content blocks format. Hero metric changed from "2x/page discoverability" to "58%/usability improvement." Duration corrected from "~3 months" to "7 weeks" per transcript.
4. Phase 4 (Review): 14/14 quality checks PASS. Dossier updated with v2 content map, voice samples, and evolution timeline.

**Pattern extracted:** User creative direction in section headings and blurb headlines produces stronger memorability (Check 7) and vividness (Check 14) than agent-generated alternatives. The agent's role in these elements is integration and constraint enforcement, not generation.

---

#### CFB-024: Prompt system optimized for constraint compliance over voice production

**Intent:** The user observed that their handwritten draft for the Elan case study was significantly more vivid than anything the system generated, despite the system following all content rules correctly. The gap between the user's natural voice and the system's output indicated a structural deficit in the prompt architecture - the rules describe what NOT to write but provide no model of what TO write.

**Root Cause:** The content strategy system has 22 anti-patterns, banned word lists, fragment caps, and luxury positioning constraints - all optimized for preventing bad writing. No document encoded the user's actual voice techniques (metaphor-driven hooks, punch-counterpunch rhythm, cultural in-group signaling, escalation beats, wry redirects). The system interpreted "luxury positioning" as "clinical restraint" rather than "confident specificity." Result: technically correct, emotionally flat output on every first draft.

**Resolution:**
1. Created `docs/content/personal-voice.md` (Section 17) - universal voice spoke with calibration samples, 5 named techniques, and a two-tier refinement protocol.
2. Revised `voice-style.md` - "no scene-setting" became "no bland scene-setting"; fragment cap zone-scoped (free in Zone 1, capped in Zone 3); added "Luxury and personality are not opposites" reframe.
3. Added Check 14 (Vividness test) to `case-study-review.md` - picture/podcast/shared-pain tests apply universally.
4. Added Step 4b (Voice Refinement Protocol) to `content-iteration` skill - two-tier constraint model for when user provides raw draft text.
5. Wired technique library into `case-study-authoring` skill Phase 3 as Step 0 (voice calibration).
6. Added CAP-023 (Voice Flattening During Refinement) to anti-patterns catalog.
7. Added Voice Samples to Elan project dossier.

**Pattern extracted -> `content.md` Section 17 + `voice-style.md` 13.2: The prompt system must encode positive voice targets (what TO write), not just negative constraints (what NOT to write). One unified voice across all case studies, calibrated warmer than clinical. When the user provides raw draft text, the refinement protocol distinguishes Tier 1 constraints (always enforce) from Tier 2 constraints (yield to user voice).**

---

## Session: 2026-04-04 — Voice register pivot for Élan case study

#### CFB-023: User draft established conversational, culturally sharp voice register

**Intent:** The user provided their own draft for the Élan intro blurb with a fundamentally different voice register than the agent's initial version. The agent's version was formal, structured, and impersonal ("How do you maintain design consistency..."). The user's version was conversational, first-person, irreverent, and culturally specific ("Teaching Einstein...", "Afraid of that default Tailwind blue-violet? Me too.", "AI design slop").

**Root Cause:** The agent defaulted to the "luxury positioning" Zone 1 voice (restrained, precise, factual) without considering that the Élan case study's target audience (designers and engineers who vibe code) would respond better to a voice that signals in-group membership. The user's draft uses cultural references (Tailwind blue-violet, AI slop, "every session starts from zero") that immediately establish credibility with anyone who has tried vibe coding. The formal voice was technically correct but emotionally flat.

**Resolution:**
1. Rewrote headline, blurb body, scope statement, and all section bodies in the user's conversational register.
2. Filled in placeholder gaps ("xxxx", "blah blah") with specific, grounded content maintaining the voice.
3. Section bodies reworked for cultural sharpness: "color.surface.brand.bold - not color-1, not --primary-dark" (relatable bad names), "First time the agent broke dark mode, I wrote it down" (personal narrative).
4. Documented voice register as a project-specific style preference in the dossier.

**Pattern extracted: The default "luxury positioning" voice is not universally correct. Case studies targeting technical audiences (designers, engineers, vibe coders) benefit from a culturally sharp, first-person voice that signals shared experience. The voice register should match the audience, not the format.**

---

## Session: 2026-04-04 — Em dash violation in Élan case study

#### CFB-022: "You use em dashes. This is an anti-pattern. You're never supposed to do that."

**Intent:** The user identified that the agent used em dashes (U+2014) throughout the Élan case study content despite an explicit rule in `docs/content/voice-style.md` line 73: "Em dashes: never. Use a regular dash - like this. Max one per section." This is a recurring behavioral failure, not a knowledge gap. The rule existed and the agent did not follow it.

**Root Cause:** The agent defaults to em dashes as a stylistic device because they are standard in formal English typography. This default overrides the project-specific rule unless the agent actively checks `voice-style.md` before writing. The rule was read during skill activation but not retained during the actual writing phase. This is the same class of failure as EAP-027 (documentation as deferred post-step): the agent treats voice rules as background context rather than active constraints during generation.

**Resolution:**
1. Replaced all em dashes in `update-elan/route.ts` with regular dashes or sentence breaks.
2. Added CAP-022 to `content-anti-patterns.md`.
3. Updated frequency map in `content.md`.

**Pattern extracted: Em dash usage is an AI voice tell (extends CAP-017). The agent must check `voice-style.md` line 73 as a hard constraint during every content writing task, not just during review.**

---

## Session: 2026-04-04 — Élan Design System Case Study Full Rebuild

#### CFB-021: Thesis pivot from "AI-native design system" to "compounding design knowledge"

**Intent:** The user requested a complete rewrite of the Élan Design System case study. Three specific corrections emerged:
1. Don't over-index on engineering bug fixes (Turbopack, hydration, CMS sync) — those are the AI agent's work, not the designer's.
2. Center on DESIGN corrections that accumulated into rules — the designer's contribution is the system architecture (naming, escalation paths, feedback routing), not the bug fixes.
3. Frame through a "growth design" lens — early components needed heavy hand-holding (spacing 15×, states 8×), later components needed refinement only. This maturity curve IS the evidence that the system works.

**Root Cause:** The previous draft conflated "engineering incidents fixed" with "designer decisions made." A designer cannot credibly claim they personally resolved Turbopack cache invalidation or hydration mismatches. The design system's value for the designer is the DESIGN knowledge it accumulates — spacing rules, dark mode contracts, state modeling protocols, semantic naming conventions. The engineering guardrails are valuable but belong to the agent's competence, not the designer's portfolio claim.

**Resolution:**
1. Rewrote thesis: "A design system that learns from every failure — where documented design corrections compound into rules that make each session more effective than the last."
2. Reduced sections from 4 to 3: "How the System Learns" (learning mechanism), "Naming as Documentation" (knowledge encoding), "One Component, Seven Corrections" (concrete proof).
3. Dropped EscalationTimeline, ComponentShowcase, FunnelDiagram visuals. Kept IncidentDensityMap, TokenGrid, InteractionShowcase.
4. Reframed all section text around DESIGN decisions, not engineering fixes.
5. Updated duration from "2 days" to "2026 – Present" (reflecting continuous evolution).
6. Hero metric changed from "47+" to "54 / design rules accumulated from real corrections" (placeholder — user flagged as needing further refinement).

**Pattern extracted → `content-anti-patterns.md`: When writing a case study about a system built with AI, distinguish between what the designer decided and what the AI agent executed. Engineering fixes belong to the agent; system design (naming, escalation, documentation architecture) belongs to the designer. Overclaiming AI agent work as designer expertise breaks credibility.**

**Open items:**
- Hero metric needs user confirmation — "54" may still feel like a count rather than a value statement.
- User wants "fake A/B test" comparing early vs. late session design quality. Requires chronological analysis of design feedback log.
- User suggested comparing with generic designer skills for framing inspiration.

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

#### CF-014: "Technical vocabulary strategy — AI/systems terminology for case studies"

**Intent:** Ensure case studies use AI and systems terminology when genuinely warranted, positioning it prominently to signal fluency to technical hiring managers and startup founders, while never misapplying terms.

**Root Cause:** The content system had no mechanism for evaluating whether technical terms were applicable to a case study's content. AI-relevant vocabulary was either absent (missing a signal opportunity) or at risk of being slapped on without substance (which would be worse than silence).

**Resolution:**
1. Created `docs/content/technical-framing.md` (§16) with: the three-gate test (structural match, evidence gate, terminology accuracy), a curated vocabulary table of 16 durable AI/systems concepts, the authentic parallel technique for non-AI work with genuine structural parallels, a placement hierarchy, and a freshness protocol.
2. Wired a "Technical Resonance Scan" into the authoring skill Phase 1 (runs alongside signal inventory), vocabulary placement into Phase 2 Step 4, and updated Phase 4 to 13 quality checks.
3. Added Check 13 (Technical vocabulary accuracy) to the review checklist and CAP-020 (Buzzword Misapplication) to anti-patterns.
4. Cross-referenced from `voice-style.md` §13.2 positioning frame.

**Pattern extracted → `technical-framing.md` §16:** Technical vocabulary decisions are upstream of language patterns — the system must decide *which concepts to surface* before deciding *how to phrase them*. The three-gate test prevents both silence (missing opportunity) and misapplication (red flag).

---

#### CF-013: "Write up — trigger word and intake protocol for case study authoring"

**Intent:** Create a single magic-word trigger ("write up") that activates the full case study authoring pipeline, similar to how "boot up" starts servers and "ship it" triggers release.

**Root Cause:** The authoring skill existed but had no snappy trigger — Route 15 relied on intent-matching ("user provides notes/transcripts") rather than a keyword. This made the workflow less discoverable and harder to invoke reliably.

**Resolution:**
1. Updated AGENTS.md Route 15 with "write up" as primary trigger plus aliases ("write this up", "draft this", "turn this into a case study").
2. Added an Intake Protocol section to the authoring skill with scenario detection table, steering hints, and checkpoint documentation.
3. Design principle: detect-and-go with optional steering. No questionnaire before Phase 1 — the agent starts working immediately and pauses at built-in checkpoints. Only asks a question in the bare scenario (no material, no project named).

**Pattern extracted → `case-study-authoring/SKILL.md` Intake Protocol section:** Trigger-activated skills should detect context and start working, not interrogate. Use the skill's existing checkpoints for steering.

---

#### CF-012: "Intro blurb integration + luxury positioning + three thermal zones"

**Intent:** Integrate an intro blurb (headline + body) at the top of each case study to hook readers into scrolling. Establish a luxury positioning meta-constraint governing all case study text. Define a voice coherence model (Three Thermal Zones) to bridge the punchy blurb into the restrained body.

**Root Cause:** The content strategy system had no mechanism for a "trailer" component between the hero and scope statement. Voice rules didn't address how to transition between two very different registers on the same page. There was no explicit naming for the portfolio's positioning philosophy (luxury vs. mass market).

**Resolution:**
1. Added §3.7 (Intro Blurb + Three Thermal Zones) and §3.8 (Luxury Positioning Principle) to `case-study.md`.
2. Added two CMS fields (`introBlurbHeadline`, `introBlurbBody`) to Projects collection.
3. Updated page anatomy template, scope statement bridge sentence, narrative arc compression table.
4. Wired blurb into authoring skill (Phase 2 + 3), review checklist (Checks 11-12), anti-patterns (CAP-018, CAP-019).
5. Added voice cross-references for contrarian-line echo points and luxury positioning foundation.

**Pattern extracted → `case-study.md` §3.7 + §3.8:** The intro blurb is a page anatomy component with its own thermal zone. Luxury positioning is the overarching meta-constraint that unifies all content voice decisions.

**Cross-category note:** Also documented as ENG-104 (engineering) — CMS schema change, frontend rendering, inline edit support.

---

#### CF-015: "Include all of them in the dictionary — they all have reasons"

**Intent:** Expand the technical vocabulary table in `docs/content/technical-framing.md` with 10 additional AI/systems terms (ReAct, generator-critic pattern, agent harnessing, LangChain/agent framework patterns, system of action, swarm/swarm intelligence, multi-agent systems, observability, long-horizon agent, AI agency/degrees of autonomy). The user's projects directly use these concepts; the agent needs complete definitions to evaluate applicability during the technical resonance scan rather than omitting terms it doesn't recognize.

**Root Cause:** The initial vocabulary (15 terms) was conservative — several user-provided terms were assessed as "too academic," "too tied to a specific framework," or "covered by existing terms." But the user's actual work uses these concepts (design system architecture, prompt engineering, agent orchestration), and the three-gate test already prevents misuse. An incomplete dictionary means the agent can't even consider terms it doesn't know.

**Resolution:**
1. Added 10 new rows to §16.2 vocabulary table in `technical-framing.md`, each with full 5-column entries (definition, applies-when, does-not-apply-when, example framing).
2. Reframed several terms for durability: "GAN-inspired" → "Generator-critic pattern (adversarial review)," "Swarm mode" → "Swarm / swarm intelligence," "AI Agency" → "AI agency / degrees of autonomy," "LangChain" → "LangChain / agent framework patterns."
3. Total vocabulary now 25 terms.

**Pattern extracted → `technical-framing.md` §16.2:** The vocabulary is a reference dictionary, not a usage mandate. Completeness is more important than conservatism — the three-gate test is the usage filter, not the dictionary itself.

---

#### CF-016: "Intro blurb should be the only prominent text; remove description as template concept"

**Intent:** Eliminate the "description" as a distinct case study template element. The intro blurb body should be the sole prominent entry text (medium weight, primary color). Existing description content should not be deleted but rendered as regular body text. Future case studies should have no description field - only the intro blurb.

**Root Cause:** Two competing text tiers (intro blurb body at secondary weight/color vs. description at medium weight/primary color) created visual hierarchy confusion. The description appeared more important than the intro blurb despite being lower on the page. This redundancy diluted the intro blurb's role as the hook.

**Resolution:**
1. Promoted intro blurb body styling to medium weight, primary color (matching the former description).
2. Demoted the description section to legacy status - `body-sm`, `text-secondary`, conditional render.
3. Updated `docs/content/case-study.md` §3.7 to document the policy: no separate description section, all prominent text goes in the intro blurb.

**Pattern extracted → `case-study.md` §3.7:** The intro blurb is the single prominent entry text element. Typography uses `body-lg`, `font-weight: medium`, `text-primary`. The `description` field is legacy - existing content is preserved as regular body text, but new case studies must not use it.

**Cross-category note:** Also documented as FB-104 (design).

---

#### CF-017: "Hero image different dimensions than 16:9 - crop, adjust, or burden on designer?"

**Intent:** Ensure the case study hero template handles images of any aspect ratio without cropping, and document the adaptive behavior so future case study generation and authoring workflows produce correct output.

**Root Cause:** The hero container enforced `aspect-ratio: 16/9` with `overflow: hidden`, silently cropping non-standard images. The case study documentation described the hero as using `width: 100%; height: auto` but the implementation contradicted this by constraining all images to 16:9.

**Resolution:**
1. Split `.heroInner` into base wrapper (adaptive) and `.heroSkeleton` modifier (16:9 placeholder only when no image exists).
2. Updated `docs/content/case-study.md` §3.2 "Hero responsive behavior" to document: the hero container adapts to the uploaded image's natural aspect ratio; the 16:9 skeleton is a placeholder shape, not an enforced constraint; the designer controls hero proportions by choosing image dimensions.

**Pattern extracted → `case-study.md` §3.2:** Added "Adaptive image dimensions" paragraph. The hero renders images at their natural ratio - no cropping, no letterboxing. 4:3, 2:1, 16:9 all render correctly.

**Cross-category note:** Also documented as FB-106 (design - vertical breathing room and adaptive container).

---

#### CF-018: "Divider lines between sections are too much; need separation between intro and article"

**Intent:** Dividers should mark structural zone boundaries, not chapter breaks within a continuous narrative. The reading flow between case study sections should feel like one cohesive story, not a series of separate items. A visual separator is needed between the intro zone and the article body to signal the register change.

**Root Cause:** `createCaseStudyBlocks` defaulted `showDivider` to `true`, inserting `<hr>` blocks between every feature section. This fragmented the narrative arc and created friction - readers encountered visual stop signs that discouraged scrolling. Meanwhile, no visual boundary existed between the intro zone (blurb + scope statement) and the article body, despite a clear register change (Zone 1/2 to Zone 3).

**Resolution:**
1. Flipped `showDivider` default to opt-in (`=== true`) in `content-helpers.ts`.
2. Added `.articleSeparator` as a template-level structural divider between intro zone and content blocks.
3. Documented the principle in `case-study.md` §3.9 (Divider Usage Principle).
4. Added CAP-024 (Divider Overuse Between Narrative Sections) to `content-anti-patterns.md`.
5. Updated `case-study-authoring/SKILL.md` Phase 3 block type documentation.

**Pattern extracted -> `case-study.md` §3.9:** Dividers mark zone boundaries (intro-to-article, article-to-navigation). Within the article, whitespace provides inter-section separation. The structural divider is a template-level element, not an authored content block.

**Cross-category note:** Also documented as FB-107 (design).

---

#### CF-019: "Divider should sit between intro blurb and scope statement, not after scope statement"

**Intent:** The scope statement is the beginning of the article, not part of the intro zone. The structural divider should signal this transition - hook above, article below. Additionally, feature sections within the article need more breathing room (whitespace, not dividers).

**Root Cause:** The previous zone model treated the scope statement and company callout as part of the "intro zone" (Zone 1 + Zone 2), placing the divider after all of them. User feedback clarified that the scope statement IS the article start, so the divider belongs between the intro blurb and the scope statement. This is a zone redefinition, not just a layout change.

**Resolution:**
1. Moved `<hr>` placement in `ProjectClient.tsx` from after legacyDescription/companyCallout to between introBlurb and legacyDescription.
2. Updated anatomy diagram in `case-study.md` section 3.2 - divider now sits between Zone 1 (intro blurb) and Zone 2 (article: scope statement, feature sections).
3. Updated section 3.9 (Divider Usage Principle) to define intro zone as blurb only; article begins at scope statement.
4. Updated CAP-024 zone reference in `content-anti-patterns.md`.

**Pattern extracted -> `case-study.md` §3.9:** Intro zone = title + hook body only. The scope statement is the first element of the article, not part of the intro. Divider marks the hook-to-article boundary.

**Cross-category note:** Also documented as FB-109 (design).

---

#### CF-020: "Hero metrics should have a tooltip explaining how the number was derived"

**Intent:** Add non-invasive progressive disclosure to hero metrics (the big numbers in the case study sidebar) so skeptical hiring managers can see the derivation methodology without the metric losing its visual impact.

**Root Cause:** Hero metrics like "58% usability improvement" and "95% noise reduction" are Derived metrics (per the metric taxonomy in `voice-style.md` section 13.1). The scope statement text contains a derivation anchor, but it's several scroll-lengths away from the number. Co-locating the derivation with the metric via a tooltip closes that gap without disrupting the visual hierarchy.

**Resolution:**
1. Added `tooltip` field to `HERO_METRICS` map in `page.tsx` for Lacework and Meteor.
2. Imported `InfoTooltip` in `ProjectClient.tsx` and rendered it next to the metric label (inside a new `.heroMetricLabelRow` flex wrapper).
3. Tooltip content follows content guardrails: 1-2 sentences, confident factual tone, no defensiveness.
4. Elan Design System metric ("54 design corrections") has no tooltip - it's a self-anchoring count that doesn't need derivation.

**Tooltip content:**
- Lacework: "Perceived ease-of-use scores from task-based evaluations with the customer success team. Scores rose from 60 to 95 out of 100."
- Meteor: "A representative basket review went from ~12,000 spreadsheet rows to ~560 exception flags. The remaining rows are auto-validated."

**Pattern extracted -> `content.md`:** Derived metrics benefit from co-located derivation anchors (tooltips). Self-anchoring metrics (counts, user numbers) do not. This is a selective application of the Evidence Anchoring framework.

**Cross-category note:** Also documented in the design log (tooltip as a UI pattern) and engineering log (ENG-122).

---

#### CF-022: "I don't like the current tone of the design system case study"

**Intent:** The v3 text uses the right thesis and structure but the prose is machine-telegraphic. Staccato fragments ("Sixteen skills. Three feedback loops. An escalation protocol.") and log-entry-style data ("March 29: wrong spacing tokens, inverted hierarchy") don't read as human writing. User wants parity with Lacework and Meteor voice quality.

**Root Cause:** Over-application of compression. Fragments were used as a default sentence structure rather than a punchline device. Lists were rendered as standalone fragment chains instead of being woven into narrative sentences. Section bodies stated abstract categories instead of telling specific stories with cause-and-consequence. The writing optimized for terseness over readability.

**Resolution:**
1. Rewrote blurb body: fragments ("MCP servers. Metadata files. Component manifests.") woven into narrative sentences ("MCP servers, metadata files, component manifests - a motor strapped to a carriage"). Added "I" as active subject ("I built one with the agent").
2. Rewrote scope statement: spec-sheet opener replaced with conversational intro ("Élan is a design system spanning three Next.js applications"). Added editorial voice ("what I actually designed was the collaboration architecture underneath").
3. Rewrote Section 1: abstract trade-off language replaced with direct address ("The tokens, components, and playground you'd expect from a design system case study - they exist, they work").
4. Rewrote Section 2: grocery-list opener replaced with a specific story ("I wrote rules. The agent sometimes ignored them. When the same playground verification got skipped six times, the system stopped asking nicely...").
5. Rewrote Section 3: log-entry-style data replaced with narrative arc with rhetorical questions ("By the end, they'd shifted to refinement: is this headline technique already used in another case study?"). Added insight closer ("not because the agent got smarter, but because the system accumulated what I keep correcting").

**Pattern extracted -> `content-anti-patterns.md`:** Fragment chains as default sentence structure are an AI voice tell (extends CAP-017). Fragments work as punchlines after setup ("Not the food. The chart.") but not as the primary prose rhythm. When every sentence is a fragment, no sentence has impact.

---

#### CF-021: "Super dissatisfied with how the content is written for the design system case study"

**Intent:** Full rebuild of the Élan Design System case study. User expressed comprehensive dissatisfaction with v2 content, thesis, and narrative approach. Requested deep analysis of all internal documentation, agent architecture, feedback loops, and external research on agent-native design systems before rewriting.

**Root Cause:** The v2 thesis ("compounding design knowledge for vibe coding") was too narrow and failed to capture the actual design work - the collaboration architecture (meta-system) rather than the components. The sections showcased existing interactive components (TokenGrid, IncidentDensityMap, InteractionShowcase) rather than arguing about the meta-system. The narrative shape (Accumulation Arc) didn't match the real story (Translation Arc - redefining what "design work" means).

**Resolution:**
1. Pivoted thesis to "what happens when you stop designing for the agent and start designing with it."
2. Changed narrative shape from Accumulation Arc to Translation Arc.
3. Replaced all three sections: "Not the Components" (T7), "The System Behind the System" (T6), "The Rising Floor" (T6).
4. Introduced horseless carriage metaphor for blurb - pointed industry framing without attacking practitioners.
5. New headline: "You're looking at the wrong part." (T7 Framework Inversion).
6. New hero metric: "15 → 3" (maturity-based, corrections per session).
7. Replaced all Tier 2 interactive visuals with Tier 3 specs (CollaborationLoop, SkillMap dual-view, MaturityTimeline).
8. Updated dossier, portfolio coherence manifest, page.tsx maps, CMS content, and interview defense notes.

**Pattern extracted -> `content.md`:** When user expresses comprehensive dissatisfaction with a case study (not a specific text fix), the issue is almost always thesis-level, not execution-level. The correct response is a full rebuild (case-study-authoring Phase 1b), not iterative text fixes.

---

#### CF-023: "The essence is there but the way it's written is not intriguing"

**Intent:** User wants the Elan Design System case study to feel human, vivid, and lively - matching the tone quality of the Meteor and Lacework case studies - while preserving the thesis and structure established in CF-021/CF-022.

**Root Cause:** The CF-022 rewrite landed the correct thesis and structure but used declarative prose without cause-and-consequence rhythm. Section bodies read as summaries rather than narrative. The voice framework upgrade (T11-T15, Concessive Turn, technique weighting) hadn't been implemented yet when CF-022 was written.

**Resolution (v1 - reverted in CF-024):**
Applied T11/T13/T15 techniques mechanically. Over-indexed on "clever contrarian" positioning. Result was vivid but arrogant - see CF-024.

---

#### CF-024: "Reads like a dick, the current writing"

**Intent:** User wants the Elan prose to match the reference writing sample's tone - humble, real, empathetic. The previous rewrite (CF-023 v1) fixed the "machine-generated" problem but overcorrected into condescension.

**Root Cause:** The CF-023 rewrite applied voice techniques (T11 Identification, T13 Anti-Sell, T15 Closed-Loop) as rhetorical positioning rather than honest process description. Three specific failure modes:
1. **Industry judgment** - "the whole conversation looks the same," "a motor strapped to a carriage" positions author above peers. The reference never does this.
2. **Secret knowledge claims** - "what you can't see," "what I actually designed" implies the reader is looking at the wrong thing. The reference lets readers arrive at insights themselves.
3. **False modesty** - "they exist, they work fine" dismisses own work to seem above it. The reference is humble about self ("I'm a decent engineer. Not the best."), never dismissive about the work.

**Resolution:**
1. Removed horseless carriage metaphor and all industry-positioning language from blurb.
2. Replaced "what you can't see" tease with honest invitation: "That shift is what I want to show you."
3. Rewrote scope to be matter-of-fact ("it's not where most of the time went") instead of superiority-coded ("what I actually designed sits underneath").
4. Section 1: "That trade-off shows" (honest) instead of "they work fine" (dismissive).
5. Section 2: "before I made it mandatory" (personal agency) instead of "before the system promoted it" (abstracting away responsibility to sound architectural).
6. Section 3: "The agent didn't get smarter. The rules just accumulated what I kept fixing." (emotional deflation, lets reader draw conclusion) instead of "That shift is what compounding looks like" (telling reader what to think).
7. All prose now follows reference pattern: humble about self, honest about process, trusts reader to arrive at insight.

**Pattern extracted -> `content-anti-patterns.md`:** **CAP-028: Technique-as-Posturing.** Applying named voice techniques (T11-T15) as rhetorical moves that position the author above peers, rather than as honest process description. Symptoms: industry judgment ("everyone is doing X wrong"), secret knowledge claims ("the part you can't see"), false modesty about own work to imply you're above it. Fix: techniques should emerge from honest narration of what happened, not from clever framing of what others are missing. The reference sample works because it's humble about self and trusts the reader.

---

#### CF-025: "The wording should be like 'how I built that system'"

**Intent:** User wants the Cognition company callout note to accurately represent their relationship to the work - they built a similar system, not the Cognition system itself.

**Root Cause:** The original note said "This case study is about building that system" which implies the author rebuilt Cognition's system. The author built a parallel/similar system (the Elan agent knowledge framework), not a direct replica.

**Resolution:** Changed "This case study is about building that system" to "This case study is about how I built a similar system" in the Cognition company record's `caseStudyNotes` for the `elan-design-system` project (updated via Payload API, company id 4).

**Cross-category note:** Also documented as FB-087 (design) for a padding fix on the same callout element.

**Pattern extracted:** When writing company-specific relevance notes, be precise about the relationship between the author's work and the target company's problem. "I built that system" = direct. "I built a similar system" = parallel. "I solved the same problem" = convergent. Getting this wrong undermines credibility with the very audience the note is tailored for.

---

#### CF-026: Personalize for Chalk (ML data platform, founding designer role)

**Intent:** Set up a tailored visitor experience for Chalk, a real-time ML data platform ($50M Series A, $500M valuation). Interviewer is David Zhao, their current product designer. The role is an early design team member working with engineers and founders on web/CLI tools for data scientists and ML practitioners.

**Root Cause:** New company setup - no prior Chalk record existed.

**Resolution:** Created Chalk company record (slug: `chalk`, password: `David`, accent: `#3336FF` portfolio blue). 1 badge on Meteor. Note connects Chalk's core domain (real-time data for fraud detection, identity, lending) to Meteor's exception-review workflow (12,000 rows compressed to 560 flags). Note avoids mentioning "founding designer" since Chalk already has at least one designer (David Zhao) plus brand/creative roles. The user corrected stale JD language that implied this was the first design hire.

**Pattern extracted:** When the JD says "founding" but the user has insider knowledge that the team already has members in that role, defer to the user's knowledge. JDs go stale. Avoid mentioning team size or hire sequence in notes unless the user confirms it.

---

#### CF-027: "The notes is wrong - it's not '12,000 rows of exception data'"

**Intent:** The note mischaracterized Meteor's data reduction. The 12,000 rows are the full dataset, not "exception data." The 560 rows are the exceptions that users actually need to review.

**Root Cause:** Agent compressed the metric into "12,000 rows of exception data compressed into 560 actionable flags" which reverses the meaning. The 12,000 is the noise; the 560 is the signal.

**Resolution:** Changed to "instead of reviewing 12,000 rows, users review only the 560 flagged as exceptions." This correctly frames the before (full dataset) and after (exception subset).

**Pattern extracted:** When paraphrasing a metric from a case study, preserve the direction of the reduction. "X compressed into Y" is ambiguous about what X is. "Instead of X, only Y" is unambiguous. Always name the before state as the undifferentiated mass and the after state as the filtered result.

---

#### CF-028: "The intro blurb already covers the 12000 -> 560. Won't that be repetitive?"

**Intent:** The company note was restating the hero metric that appears directly above it in the page layout. The note should add new context, not echo the headline.

**Root Cause:** Agent defaulted to the case study's most prominent metric as the anchor for the note. But the note sits visually below the intro blurb, which already contains that metric. Repeating it reads as lazy copy-paste, not personalization.

**Resolution:** Rewrote the note to focus on the design approach (exception-driven workflows, progressive disclosure, interface shaped by judgment not schema) and the structural parallel to Chalk's domain. Zero overlap with the intro blurb above.

**Pattern extracted:** Company notes must be written with awareness of their visual position on the page. The intro blurb and hero metric are always visible above. Never restate what's already on screen. The note's job is to add a connection the reader wouldn't make on their own - why this work matters to *their* specific problem.

---

## Entry Template

```markdown
#### CF-NNN: "[First 10 words of user message]"

**Intent:** [What the user is trying to achieve with the content]

**Root Cause:** [Why the current content doesn't achieve it]

**Resolution:** [What was changed]

**Pattern extracted → `content.md` §N.N: [Section reference]**
```
