# Eval task corpus

> **Purpose**: a frozen 12-task set drawn from past feedback log entries — each with a known-correct resolution and a gold AP citation — used by a future A/B evaluation plan to compare agent generation outcomes between the pre-initiative documentation system (`eval-baseline-current` worktree) and the post-initiative `main`.
>
> **Status**: authored in Plan C Phase 9 of the Docs Knowledge Graph Initiative. Source plan: [`.cursor/plans/docs_kg_eval_handle_c7e2a5f9.plan.md`](../.cursor/plans/docs_kg_eval_handle_c7e2a5f9.plan.md). Coordinator: [`docs/initiatives/docs-knowledge-graph-initiative.md`](initiatives/docs-knowledge-graph-initiative.md).
>
> **Frozen**: do NOT edit task IDs, prompts, or gold resolutions after first use. Adding a 13th task contaminates run-count parity. Replacing a task contaminates baseline comparison. If a task turns out to be malformed, mark it `excluded: true` rather than rewriting it.

## How to use this file

A future eval plan (separate from this initiative) will:

1. Build `scripts/eval-runner.mjs` — a deterministic harness that reads each task's `prompt` field, invokes the agent against a target documentation arm (worktree at `eval-baseline-current` or post-initiative `main`), and captures the full transcript.
2. Run N=5 invocations per task per arm (60 per arm, 120 total).
3. Grade outputs against `gold_resolution` and `expected_citation` using a hybrid LLM-as-judge + 20% human spot-check protocol.
4. Aggregate: AP citation rate, adherence rate, blind quality (1–5), tool calls to relevant context, total tokens.

Plan C's 9-run subset (3 tasks × 3 runs in `docs/eval-baselines/current/`) is methodology smoke-test only — NOT part of the eval dataset.

## Selection criteria

Each task in this corpus satisfies all of:

- **Issue field is a clear scoped request** — not a multi-pillar mess, not "make it better."
- **Resolution is documented and known-correct** — recorded in the source feedback log entry, verified against shipped artifacts.
- **Cited AP/EAP/CAP exists in the catalog** — no orphan tags. The `cited_ap` field is the gold standard the agent should retrieve.
- **Mix of obvious-and-subtle**: 6 tasks where the AP is the first hit on grep against the agent's available context; 6 tasks where the connection requires the typed knowledge graph (or wide reading of guardrails / cross-references).
- **Prompt-leakage clean**: no task `prompt` field contains "eval", "anti-pattern", "graph", or "measurement". Prompts read like normal feedback requests.

## Exclusion rules

- **No tasks from session-shape engineering entries** that haven't been retrofitted to `### ENG-NNN`. All four engineering tasks below cite `### ENG-NNN`-shape source entries (Plan B Phase 4a.2.(i) retrofit completed).
- **No tasks where the resolution requires runtime context** (e.g. dev-server crash from a port conflict). Context retrieval can't help; the task adds noise.
- **No multi-pillar tasks**. Each task lives in one pillar; cross-category notes in source entries are recorded but the task is graded on the primary pillar's AP.

## Selection bias disclosure

> **The 6 graph-required (subtle) tasks deliberately favor the "new" arm** — by construction, they require the kind of typed cross-reference traversal that the Docs Knowledge Graph Initiative builds. The future eval plan should apply a discount when interpreting effect size on subtle tasks. The 6 obvious tasks act as a control: if the new arm doesn't beat baseline on subtle tasks AND the obvious tasks show no regression, the initiative is null. If the new arm beats baseline on obvious tasks too (where the connection is a single grep), that's an unexpected positive signal worth investigating.
>
> This disclosure is also carried forward into [`docs/eval-baselines/README.md`](eval-baselines/README.md) so it remains visible to the eval-plan operator independently of this corpus file.

## Catalog notes (known issues, do not block)

- **AP-054 has duplicate headings** in `docs/design-anti-patterns.md` (line 919 "Ad-Hoc Heading Elements" and line 934 "Changing border-width on State Transitions"). The gold citation for `eval-T002` below is the second AP-054 (border-width). Tracked as a separate cleanup; out of Plan C scope.

## Tasks

```yaml
- id: eval-T001
  pillar: design
  difficulty: obvious
  source_fingerprint: "FB-192: Micro mode abolished — `type-3xs` in row/sliver tiles is not legible"
  source_anchor: "docs/design-feedback-log.md#fb-192"
  cited_ap: AP-072
  prompt: |
    The KnowledgeTreemap has a few tiny tiles where the category name is rendered
    at 8px (the `micro` mode introduced for tiles 32-64px wide). Don't use micro
    fonts — that's just bad. Normal font size for the type. Fix it across the
    component and tell me what the principle is so we don't reintroduce it.
  gold_resolution: |
    Remove `micro` mode entirely from `TileMode`, `classifyTile()`, and SCSS in
    `KnowledgeTreemap`. Row mode uses the same `type-xs` (12px) as column mode —
    no font downscaling in slivers. `TILE_SILENT_W_PX` lowers to 20px so 31px-wide
    tiles enter row mode instead of silence. Count is suppressed in row mode
    (label-only for slivers; count in tooltip). `TILE_MIN_TWO_LINE_PX` updates
    to 38px. The principle: ellipsis at a legible font size is always preferable
    to legible-ish text at a smaller size. An "A..." at 12px communicates "there
    is a category here, hover to see it"; a label at 8px on a saturated surface
    communicates nothing.
  expected_citation: AP-072
  selection_rationale: |
    Direct catalog hit. The user's request maps unambiguously to AP-072 (orientation-
    blind content layout in variable-size containers / micro-font illegibility).
    Tests whether the agent can find a single-AP fix from a verbatim user
    complaint. Obvious arm.

- id: eval-T002
  pillar: design
  difficulty: subtle
  source_fingerprint: "FB-163: Why tf are both states thicker and thicker?? Default should be 1px, thick active 2px."
  source_anchor: "docs/design-feedback-log.md#fb-163"
  cited_ap: AP-054
  prompt: |
    Fourth time I'm reporting the Input border thickness in this session. Even
    the default is 2px now. Default should be 1px, engaged should read as 2px.
    The two-axis grammar from the previous fix is the right structure — color
    channel + weight channel, paint-only ring on engaged — but the values on
    the axes are wrong. Resting needs to drop to a hairline. Fix it.
  gold_resolution: |
    Drop the `.regular` base border and `.minimal` base `border-bottom` from
    `$portfolio-border-width-regular` (2px) to `$portfolio-border-width-thin`
    (1px) in `src/components/ui/Input/Input.module.scss`. Keep the matching-color
    engaged-state rings untouched. Resulting composition: resting 1px hairline,
    engaged 1px border + 1px outer ring at zero gap reading as a continuous 2px
    rim. Status variants follow the same pattern: 1px resting, 2px engaged. The
    architectural principle (escalation per Design Hard Guardrail #4 after the
    fourth complaint): the catalog rule constrains state-to-state change of
    `border-width`, NOT its absolute value. When a paint-only weight channel
    (box-shadow, outline, ring) exists, the base `border-width` is a pure
    design choice — pick the value that matches resting character.
  expected_citation: AP-054
  selection_rationale: |
    Subtle. The agent must recognize this as the 4th complaint in a session and
    invoke the architectural-review guardrail rather than patching values
    incrementally. The right citation is AP-054 amended (border-width on state
    transitions), and the resolution requires understanding that AP-054 constrains
    *change*, not *absolute value*. Without the cross-reference between the
    border-width AP and the paint-only-weight-channel rule, the agent will
    likely chase the symptom. Graph-required arm.

- id: eval-T003
  pillar: design
  difficulty: subtle
  source_fingerprint: "FB-156: ScrollSpy portaled highlight label landed rightward of the notch, extending past the viewport"
  source_anchor: "docs/design-feedback-log.md#fb-156"
  cited_ap: AP-070
  prompt: |
    The ScrollSpy active label landed on the wrong side of the notch — it's
    sitting to the right of the rail and extending past the viewport edge. The
    in-rail hover labels sit on the LEFT, lined up in a single right-aligned
    gutter. The active one should join that stack. I tried fixing the anchor
    element from the inner tick to the notch container, no visible change.
    Diagnose the real cause and ship the fix.
  gold_resolution: |
    Two compounding bugs, the second dominates and masked the first:
    (1) wrong anchor element — portal compute reads the inner tick rect
        instead of the notch container; fix by reading
        `[data-notch-index="${highlightIndex}"]`.
    (2) framer-motion `animate={{ x }}` writes an inline `transform: translateX(...)`
        style that wins over the SCSS `transform: translate(calc(-100% - spacer), -50%)`
        on the same element. The `-100%` horizontal shift and `-50%` vertical
        centering get silently dropped on animate-in.
    Fix: split positioning across two elements. Outer `<div class="highlightLabelAnchor">`
    owns the `position: fixed; transform: translate(...)` (plain CSS, nothing
    overrides). Inner `motion.span class="highlightLabel">` owns only the
    `animate={{ x, opacity }}` (framer-motion writes its inline transform on
    the inner span). Apply identical refactor in both `src/components/ui/ScrollSpy/`
    (DS source) and `src/components/ScrollSpy.tsx` (package mirror).
  expected_citation: AP-070
  selection_rationale: |
    Subtle. The visible symptom (label on wrong side of notch) suggests a layout
    bug. The actual cause is a CSS property conflict between framer-motion and
    SCSS `transform`. Recognizing this requires connecting the symptom (transform
    not applying) to the cross-cutting AP about animation libraries clobbering
    base CSS transforms. Without that connection, the agent will fix the anchor
    bug only — exactly the path that shipped silently in the source incident.
    Graph-required arm.

- id: eval-T004
  pillar: design
  difficulty: obvious
  source_fingerprint: "FB-146: Nav logo Yilan Gao wrapping to two lines under squeeze"
  source_anchor: "docs/design-feedback-log.md#fb-146"
  cited_ap: AP-066
  prompt: |
    The nav logo "Yilan Gao" is wrapping to two lines when the viewport gets
    squeezed. This should never be collapsed or moved to the next line. It
    should never compromise; this is a principle. Anything that's logo or
    navigation, such a core identity line, should never ever be returned to
    two lines when it's squeezed. The personal identity blurb, which is the
    'Designer, AI systems experience...', that line CAN be squeezed into two
    lines — that's fine. Fix the nav and codify the priority rule.
  gold_resolution: |
    In `src/components/ui/Navigation/Navigation.module.scss`:
    - `.logo` → `flex-shrink: 0` (identity anchor never yields to flex pressure)
    - `.logoText` → `white-space: nowrap` (forbid wrap regardless of pressure)
    - `.links` → `min-width: 0` (allow the right-side container to shrink below
      its intrinsic content width; without this, flex children with `min-width: auto`
      push the logo first)
    - `.tagline` → `min-width: 0`, `text-align: right`, `-webkit-line-clamp: 2`
      so the tagline can wrap (honoring the user's "two rows is fine") but
      capped so it cannot open the nav arbitrarily tall.
    Pattern (extracted to `design.md` §24): in a flex nav row, express element
    priority in CSS. Rigid elements (logo, identity) get `flex-shrink: 0` +
    `white-space: nowrap` on text. Elastic elements (taglines, affiliations)
    get `min-width: 0` + line-clamp ceiling.
  expected_citation: AP-066
  selection_rationale: |
    Direct catalog hit. The user states the principle explicitly and names the
    expected behavior split (logo rigid, tagline elastic). AP-066 (unconstrained
    flex compression breaking identity text) maps 1:1. Tests whether the agent
    can locate the right CSS knobs (`flex-shrink: 0`, `min-width: 0`,
    `-webkit-line-clamp`) given the user's clear priority statement. Obvious arm.

- id: eval-T005
  pillar: engineering
  difficulty: obvious
  source_fingerprint: "ENG-146: 10th documentation skip - major homepage redesign shipped without any Post-Flight"
  source_anchor: "docs/engineering-feedback-log.md#eng-146"
  cited_ap: EAP-027
  prompt: |
    Across our last conversation we did five large architectural changes to
    the home page — archived homepage-v1, removed the masonry project grid,
    moved About/Experience/Links to the footer, moved the role tagline to the
    nav, restructured the footer to a 4-column terra band — and you responded
    after each one without running any documentation step. That's not okay.
    This keeps happening. Document everything retroactively, then tell me
    why this is a chronic pattern and what the architectural fix looks like.
  gold_resolution: |
    Retroactively document each change as its own feedback log entry:
    ENG-144 (SiteFooter expansion), ENG-145 (homepage-v1 archive + redesign
    initiation), FB-083 + FB-084 (design dimensions). Update EAP-027 with the
    10th occurrence and the architectural reflection.

    Architectural fix: the "post-fix Post-Flight" framing keeps failing because
    behavioral urgency overrides process unless documentation is woven into the
    fix workflow itself. The new pattern (now in Hard Guardrail Engineering #1
    enforcement note): BEFORE writing the fix, create the feedback log entry
    stub (Issue + Root Cause). AFTER the fix, fill in Resolution. ONLY THEN
    compose the response message. This makes documentation a pre-condition,
    not a deferred post-step. The 10th occurrence introduces a new variant —
    "too in-progress to document yet" — alongside the existing "too trivial
    to document." Both rationalizations produce zero documentation.
  expected_citation: EAP-027
  selection_rationale: |
    Direct catalog hit. EAP-027 is the canonical anti-pattern for "responded
    after fix without running documentation step." The user explicitly names
    the chronic-pattern signal. Tests whether the agent can find the right EAP
    AND apply its enforcement note (write the stub before the fix, not after).
    Obvious arm.

- id: eval-T006
  pillar: engineering
  difficulty: subtle
  source_fingerprint: "ENG-149: ETRO essay content rewrite not visible on website - seeding endpoint never called"
  source_anchor: "docs/engineering-feedback-log.md#eng-149"
  cited_ap: EAP-087
  prompt: |
    I just spent a session rewriting the ETRO essay content. The
    `src/app/(frontend)/api/update-etro/route.ts` file has the new blurb,
    scope statement, and section bodies I wanted. But the live site still
    shows the old content. The file was saved successfully, no errors. What's
    going on, and what should the workflow have been so I don't run into
    this every time we do content work?
  gold_resolution: |
    The route file is a content seeding script — it defines content as
    constants and pushes them to the CMS database when the POST endpoint
    is called. Modifying the file only changes the *definition*; content
    doesn't reach the database until `curl -X POST http://localhost:4000/api/update-etro`
    is invoked. The session ended with "file saved" treated as "content
    deployed" — they aren't the same.

    Resolution steps:
    1. `curl -X POST http://localhost:4000/api/update-etro` — confirm
       response includes `"action": "updated"`.
    2. Verify via Payload REST API
       (`curl http://localhost:4000/api/projects?where[slug][equals]=etro-framework`)
       that the new headings/body strings are present in the CMS.
    3. Spot-check the live page in the browser.

    Workflow rule (now Hard Guardrail Engineering #25): after every modification
    to any `src/app/(frontend)/api/update-*/route.ts`, the curl + REST verification
    is mandatory before marking the task done. A saved file with an uncalled
    endpoint is an incomplete task. Same pattern applies to migration scripts,
    schema-push scripts, and any other "definition file with separate execution
    step."
  expected_citation: EAP-087
  selection_rationale: |
    Subtle. The visible symptom (file saved, content not live) looks like a
    deployment or caching bug. The actual cause is a missing pipeline step:
    seeding routes need explicit POST invocation. Recognizing this requires
    connecting "I edited a file under `update-*/route.ts`" to "this is a
    content definition, not a deployment." Without the EAP catalog and
    Hard Guardrail #25, the agent will likely investigate caching, restart
    the dev server, or rebuild — none of which fix it. Graph-required arm.

- id: eval-T007
  pillar: engineering
  difficulty: obvious
  source_fingerprint: "ENG-106: Did you document this variant in Playground Shell?"
  source_anchor: "docs/engineering-feedback-log.md#eng-106-occ2"
  cited_ap: EAP-082
  prompt: |
    I just added a `solid` appearance variant to the Navigation component.
    Did you document this variant in the playground? You almost never do.
    Fix it now and codify a rule so this isn't a per-feedback chase next
    time someone adds a variant.
  gold_resolution: |
    Update `playground/src/app/components/navigation/page.tsx` to document
    the new `solid` appearance variant:
    1. Read the existing playground page first to understand structure,
       section ordering, and conventions (this is itself in the workflow).
    2. Add a `ComponentPreview` for the `solid` variant in the appropriate
       section (Appearance group).
    3. Update the `PropsTable` row for `appearance` to list the new option.
    4. Update Notes if the variant has usage guidance.
    5. Run the mandatory flush-and-restart per the playground delivery rule
       (kill the playground server, `rm -rf playground/.next`, restart,
       curl the page and grep for "solid" in the response to confirm
       delivery).

    Codified as Hard Guardrail Engineering #24 (added during the second
    occurrence): ALWAYS update the playground page when adding a new variant,
    prop, or visual state to any DS component in `src/components/ui/`. A
    variant that exists in code but not in the playground is invisible to
    consumers. EAP-082 captures the principle.
  expected_citation: EAP-082
  selection_rationale: |
    Direct catalog hit. The user's question is the canonical EAP-082 trigger
    ("variant added to DS component, playground page not updated"). Tests
    whether the agent can find the right EAP AND apply its workflow steps
    (read playground page first, then update preview + props table + notes,
    then flush-and-restart per the delivery rule). Obvious arm.

- id: eval-T008
  pillar: engineering
  difficulty: subtle
  source_fingerprint: "ENG-156: False completion report on ENG-154 — legacy `description` render branch was never actually deleted"
  source_anchor: "docs/engineering-feedback-log.md#eng-156"
  cited_ap: EAP-094
  prompt: |
    You told me ENG-154 was done — scope statement migrated to content blocks,
    legacy render path deleted. But there's now a weird line that I cannot
    even delete called "Project description". This should not be already
    retired. Why is it still there? What did you actually verify before
    reporting it done?
  gold_resolution: |
    Two distinct failures, both masked by fabricated verification evidence:

    1. The edit never landed in `ProjectClient.tsx`. The previous turn's
       resolution note claimed lines ~793-812 (the `{p.description && <FadeIn>...}`
       block plus `renderTextWithLinks` helper) had been deleted. `git diff`
       shows no such change. The turn followed a context summary, and the
       summary asserted the change as completed based on prior intent — but
       the file was never actually written. The agent skipped reading the
       file before reporting.

    2. The edit never landed in `page.tsx` either. `descPlain = extractLexicalText(doc.description) || "Project description."` was still there,
       still feeding the literal string `"Project description."` into the
       still-live render branch.

    3. The verification was theater. The previous turn claimed `curl`'d
       `/work/meteor` and saw HTTP 200 + `data-block-index="N"` markers —
       both true, both irrelevant. HTTP 200 is necessary but not sufficient.
       `data-block-index` only proves *some* blocks render; it doesn't prove
       the legacy branch is absent. A correct verification would have
       grepped for `legacyDescriptionText` or `Project description` in the
       response — either of which would have caught it instantly.

    Real fix:
    - Actually delete the `{p.description && ...}` block from
      `ProjectClient.tsx`, plus the `renderTextWithLinks` helper.
    - Remove `description`, `descriptionHtml`, `descriptionLexical`,
      `inlineLinks` from `ProjectData`.
    - In `page.tsx`: remove `INLINE_LINKS`, the four description fields from
      `FALLBACK_PROJECT`, the `descPlain`/`descHtml` derivation including the
      `"Project description."` fallback string, and the five description-
      related fields from the `project` payload.
    - Verify for real: `curl -b <session>` each case study, grep for
      `legacyDescription|Project description|id="overview"`, expect zero
      matches per page.

    Principle (now EAP-094): after a context compaction, the conversation
    summary describes *intent* to edit, not landed edits. Before reporting
    a resolution, `git diff` the files or grep for the strings the edit
    was supposed to remove/add. And when verifying that a specific element
    was removed, grep for that element's own distinctive class/text — never
    for a generic marker (HTTP 200, block-index count) that could be
    satisfied by unrelated parts of the page.
  expected_citation: EAP-094
  selection_rationale: |
    Subtle. The user's complaint isn't "I see this bug" — it's "you said it
    was fixed and it isn't, what did you verify?" The agent must recognize
    this as the post-context-resume trust pattern (EAP-094) AND the wrong-
    verification-marker pattern (Hard Guardrail Engineering #10 reinforcement).
    Without the catalog and the cross-reference to EAP-027-family, the agent
    will likely re-attempt the fix without auditing the previous turn's
    verification claims. Graph-required arm.

- id: eval-T009
  pillar: content
  difficulty: obvious
  source_fingerprint: "CFB-022: You use em dashes. This is an anti-pattern. You're never supposed to do that."
  source_anchor: "docs/content-feedback-log.md#cfb-022"
  cited_ap: CAP-022
  prompt: |
    You used em dashes throughout the Élan case study content. The voice rule
    says never. You're never supposed to do that. Fix every em dash in the
    case study content I just shipped, and tell me why this keeps happening
    so we can stop it.
  gold_resolution: |
    Replace all em dashes (U+2014) in `src/app/(frontend)/api/update-elan/route.ts`
    with regular dashes surrounded by spaces ( - ) or split into separate
    sentences. Do the same regex sweep across every other
    `src/app/(frontend)/api/update-*/route.ts` to catch latent occurrences.
    POST each modified seeding endpoint and verify via Payload REST that the
    em dashes are gone in the live CMS data.

    Why it keeps happening: the agent defaults to em dashes as a stylistic
    device because they're standard in formal English typography. That default
    overrides the project-specific rule (`docs/content/voice-style.md` line 73:
    "Em dashes: never. Use a regular dash like this. Max one per section.")
    unless the agent actively re-checks voice-style during generation, not
    only during post-write review. This is the same class of failure as
    EAP-027 (documentation as deferred post-step): voice rules treated as
    background context rather than active constraints during writing.

    Fix at the workflow level (now Hard Guardrail Content #7): em dashes are
    an AI voice tell. The agent must check voice-style line 73 as a hard
    constraint during every content writing task, not only during review.
    Adding CAP-022 to the catalog and to the frequency map in `content.md`
    makes the rule grep-able for every future task.
  expected_citation: CAP-022
  selection_rationale: |
    Direct catalog hit. The user's complaint is the canonical CAP-022 trigger
    and they explicitly invoke the rule. Tests whether the agent can find
    CAP-022, apply the regex sweep across all seeding routes, AND surface the
    workflow fix (Hard Guardrail Content #7). Obvious arm. Bonus: tests EAP-087
    indirectly (POST endpoint after route file edits).

- id: eval-T010
  pillar: content
  difficulty: obvious
  source_fingerprint: "CFB-036: The current article abuses bold font. There's also not a clear separation between sections, somehow, or the hierarchy not visually clean."
  source_anchor: "docs/content-feedback-log.md#cfb-036"
  cited_ap: CAP-030
  prompt: |
    Two complaints about the current ETRO essay. The article abuses bold font.
    There's also not a clear separation between sections, somehow, or the
    hierarchy not visually clean. I count 36 bold spans across 7 bodies — the
    user-supplied source markdown used them as scan anchors ("Per user.",
    "Scaffolding.", etc.). Fix it.
  gold_resolution: |
    The two complaints share one cause. `.sectionHeading` uses `subtitle-1`
    (xl, semibold). Body uses `body-base` (regular). Inline `<strong>` in
    body renders weight 700 — heavy enough to read as a peer of the semibold
    H2, eroding the section break.

    Fix in `src/app/(frontend)/api/update-etro/route.ts`:
    1. Strip every `**bold**` span from all 7 bodyMarkdown strings (36 → 0).
    2. Where the bold served as a scan anchor, convert to colon-prefixed
       paragraph starts: "Per user:", "Per task:", "Scaffolding:",
       "Structure:", "Migration:". The colon carries the scan-anchor role
       without a weight jump.
    3. Drop the inline `### The noise reduction...` H3 from Section 4
       (heading-inside-richText nodes are silently dropped by `lexicalToHtml`
       when mixed with paragraphs anyway).
    4. Remove the final bold thesis question block; the three question marks
       already carry the typographic emphasis.
    5. Keep italic (`*word*`) intact — voice-style bans bold, not italic.
    6. POST `/api/update-etro` and verify via REST: 0 text nodes with
       FORMAT_BOLD bit set across all 7 richText bodies.

    Pattern (now CAP-030): when importing user-supplied markdown into CMS
    blocks, do NOT preserve inline `**bold**` verbatim even if the source
    uses it as scan anchors. The source was likely written for a Medium /
    Substack / Notion render context where inline bold is common. The
    portfolio typography contract gives section headings the dominant-stop
    role; bold in body competes with it. Convert to colon-prefixed paragraph
    starts, paragraph break alone, italic if tonal, or drop. Never leave
    raw `**bold**` in bodyMarkdown.

    Run a regex sweep on every other `src/app/(frontend)/api/update-*/route.ts`
    for `\*\*` inside `bodyMarkdown` strings — any matches are the same
    pattern.
  expected_citation: CAP-030
  selection_rationale: |
    Direct catalog hit. The user's two-complaint package (visual + content)
    points to a single content cause: inline bold imported verbatim from
    user-supplied source markdown. Tests whether the agent finds CAP-030,
    applies the conversion table (colon-prefix / paragraph break / italic /
    drop), AND runs the cross-route regex sweep + POST verification. Obvious
    arm — though the cross-pillar diagnosis (Design-perceived, Content-caused)
    is non-trivial.

- id: eval-T011
  pillar: content
  difficulty: subtle
  source_fingerprint: "CFB-034: ETRO essay doesn't read like a human wrote it - machine-compiled literature review voice"
  source_anchor: "docs/content-feedback-log.md#cfb-034"
  cited_ap: CAP-029
  prompt: |
    The ETRO essay reads like a bunch of machine spit out some summary chunks.
    No logic, no storyline, just jumping around. Section 2 especially — every
    one of the four pillars gets the same beat pattern: theory, then external
    example, then "In my system...". External examples (medical AI, legal
    contracts, code review agents, autonomous vehicles) feel like spectator
    summaries with zero personal stake. Rewrite it to match the approved voice
    from Meteor, Lacework, and Élan.
  gold_resolution: |
    Six structural problems, fix all six:
    1. Section 2's 4-part parallel pattern is the dominant problem. It collapses
       from ~1,200 words of identical-rhythm mini-essays to ~450 words of
       narrative. Each ETRO element gets introduced through what happened in
       the system, not through theory-then-application.
    2. Delete every external example (medical AI, legal contracts, code review
       agents, autonomous vehicles). They're spectator summaries; the personal
       stake is in the actual project.
    3. Delete every bold sub-header mid-section. It made the piece read like
       a reference doc, not an essay.
    4. Delete every literature-review sentence ("Across 90 studies..."). They
       create academic distance incompatible with the practitioner voice.
    5. Section 3 cuts CEO resume-padding and puts the reader inside the
       conversation. Section 4 removes redundant gradient explanations
       (said the same thing three times).
    6. Section 5 cuts the self-summarizing opener.
    Tighten blurb's last line. Break scope's run-on into three.

    Pattern (new, now CAP-029): the "parallel-structure encyclopedia" is a
    distinct AI writing failure mode — when asked to cover N items, the
    default output is N identical mini-essays with the same beat pattern.
    The fix is not to rewrite each mini-essay but to refuse the parallel
    structure entirely and let items emerge from narrative. Related to
    CAP-017 (AI voice tells) but a structural variant, not a vocabulary one.
  expected_citation: CAP-029
  selection_rationale: |
    Subtle. The visible symptom ("doesn't read like a human wrote it") is a
    voice complaint, but the root cause is structural — an AI writing failure
    mode where N items get N parallel mini-essays. The agent must recognize
    this as CAP-029 (structural variant, distinct from CAP-017 vocabulary
    voice tells) and refuse the parallel structure rather than polishing
    individual sections. Without the cross-reference between CAP-017 and
    CAP-029 the agent will likely chase voice tweaks per section. Graph-
    required arm.

- id: eval-T012
  pillar: content
  difficulty: subtle
  source_fingerprint: "CFB-038: Why is the current case study order: Lacework, the design system, Goldman Sachs."
  source_anchor: "docs/content-feedback-log.md#cfb-038"
  cited_ap: CAP-031
  prompt: |
    Why is the current case study order on the home page Lacework, the design
    system, Goldman Sachs? Goldman Sachs should be at the top. I don't know
    starting from which point it was moved up, and this is just wrong. I've
    never said it should be ordered this way. Trace when this happened, fix
    it, and document the rule so we don't slide back into the wrong order.
  gold_resolution: |
    Trace: Goldman Sachs was never at the top in git history. The order has
    been stable since the API routes were first committed on `d9bb2d3`
    (Mar 30 2026), which set `update-lacework` → `order: 1`,
    `update-elan` → `order: 2`, `update-meteor` → `order: 3`. The only
    subsequent `order` mutation bumped Élan from 2 → 3 to make room for
    ETRO. What the user perceived as "moved up" was a default baked into
    the scaffold that nobody challenged.

    Root cause: the `order` integer encoded *when the case study was added
    to the portfolio*, not *where it belongs in the portfolio narrative*.
    Lacework was the first migrated into the CMS, so it got `order: 1` by
    scaffolding convention; every subsequent case study was numbered by
    arrival sequence. No step in case-study-authoring or content-iteration
    asks "where does this slot relative to the existing pieces?".

    Fix:
    1. `src/app/(frontend)/api/update-meteor/route.ts` — `order: 3` → `order: 1`.
    2. `src/app/(frontend)/api/update-lacework/route.ts` — `order: 1` → `order: 2`.
    3. `src/app/(frontend)/api/update-elan/route.ts` — already `order: 3`.
    4. POST each modified endpoint, verify via REST sort=order:
       meteor(1), lacework(2), elan(3), ascii-studio(4), etro(5), illustrations(6).

    Pattern (now CAP-031): the home-page case-study order is a narrative-
    priority decision, not a chronology. Before any new case study ships,
    answer: "If this reader reads only the first case study, which one is
    most likely to earn the next click?" That piece takes `order: 1`. The
    rest descend by impact, not authoring date. When authoring adds a new
    case study, the author must explicitly decide its rank, not let it
    default to the next integer.
  expected_citation: CAP-031
  selection_rationale: |
    Subtle. The complaint surfaces as a UX/data complaint ("wrong order"),
    but the underlying issue is a content-strategy default (chronological
    fallback for narrative-priority data). Fixing the order alone without
    encoding the rule will let the next addition slide back into chronology.
    The agent must connect "case study order" to "narrative priority"
    (CAP-031) and update the case-study-authoring skill to enforce the rank
    decision at intake. Graph-required arm.
```

## Summary

| Pillar | Tasks | Difficulty mix |
|---|---|---|
| Design | T001, T002, T003, T004 | 2 obvious + 2 subtle |
| Engineering | T005, T006, T007, T008 | 2 obvious + 2 subtle |
| Content | T009, T010, T011, T012 | 2 obvious + 2 subtle |
| **Total** | **12 tasks** | **6 obvious + 6 subtle** |

| AP / EAP / CAP | Cited by |
|---|---|
| AP-054 | T002 |
| AP-066 | T004 |
| AP-070 | T003 |
| AP-072 | T001 |
| EAP-027 | T005 |
| EAP-082 | T007 |
| EAP-087 | T006 |
| EAP-094 | T008 |
| CAP-022 | T009 |
| CAP-029 | T011 |
| CAP-030 | T010 |
| CAP-031 | T012 |
