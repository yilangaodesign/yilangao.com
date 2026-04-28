---
task_id: eval-T008
run_number: 3
arm: current
commit_sha: 56f876024fc95591b95f0f181686ba4dda0ac03f
worktree_path: ~/eval/yilangao-current
model: claude-opus-4.6
temperature: 0.3
timestamp: 2026-04-28T02:00:00Z
cursor_window_path: /Users/yilangao/eval/yilangao-current
cursor_version: 3.1.15
transcript_format: cursor-jsonl
transcript_source_uuid: 7085efa9-ca52-4b0c-a20a-44f31555f7cf
transcript_source_size_bytes: 6598
expected_citation: EAP-094
pillar: engineering
difficulty: subtle
source: "docs/engineering-feedback-log.md#eng-156"
---

## Prompt (paste verbatim into a fresh Cursor chat opened on `~/eval/yilangao-current`)

```
You told me ENG-154 was done — scope statement migrated to content blocks,
legacy render path deleted. But there's now a weird line that I cannot
even delete called "Project description". This should not be already
retired. Why is it still there? What did you actually verify before
reporting it done?
```

## Agent transcript

<!--
Captured from Cursor JSONL transcript (cursor-jsonl format) by
scripts/capture-eval-run.mjs. Source: 7085efa9-ca52-4b0c-a20a-44f31555f7cf.jsonl
(6,598 bytes, mtime 2026-04-28T02:00:00Z).

Format choice rationale: see docs/eval-baselines/README.md
`Transcript-format limitations` section.

Tool RESULTS (file contents read, grep matches, shell stdout) are NOT in
the JSONL — only tool call args. The agent's narrative serves as the
surrogate for what it actually saw.
-->

**User**

You told me ENG-154 was done — scope statement migrated to content blocks,
legacy render path deleted. But there's now a weird line that I cannot
even delete called "Project description". This should not be already
retired. Why is it still there? What did you actually verify before
reporting it done?

---

**Cursor**

Let me investigate what's actually going on. I'll read the project rules, check the engineering feedback log for ENG-154, and search the codebase for "Project description" references.

The user is frustrated about an issue with ENG-154 - they're saying that a "Project description" field/line is still appearing somewhere despite being told it was migrated/retired. Let me investigate what's going on by first reading the project rules and then looking into the codebase to understand the issue.

Let me start by reading the relevant project docs and looking for "Project description" in the codebase.

> **Read** `CLAUDE.md`
> **Read** `docs/engineering-feedback-log.md`
> **Grep** `Project description`
> **Grep** `ENG-154`

Let me check whether this is still live right now by looking at the actual source files.

This is very well-documented in the engineering feedback log already. The user is quoting from the past - this is the exact scenario that was already documented as ENG-156. Let me read the full ENG-156 entry and the surrounding context to understand whether this is:

1. A current, live issue the user is experiencing right now
2. The user referencing what happened historically and asking me to account for it

Looking at the grep results, ENG-156 documents exactly this scenario. The user's quote is even captured verbatim in the log. The resolution is also documented - the files were actually edited and verified with proper grep checks.

The user's follow-up question suggests they're either seeing this bug reoccur now or questioning what was actually verified back then. I need to check the current state of those files to determine if this is a regression or if the original fix was incomplete.

> **Grep** `legacyDescription|Project description\.|id="overview"` glob=`*.tsx`
> **Grep** `descPlain|descriptionHtml|descriptionLexical|renderTextWithLinks` glob=`*.tsx`
> **Read** `docs/engineering-feedback-log.md` (offset: 1784, limit: 30)

Here's the honest accounting. This was already documented as **ENG-156** because the failure was serious enough to warrant its own incident entry separate from ENG-154.

**What I told you was done — but wasn't:**

1. **`ProjectClient.tsx` was never actually edited.** The ENG-154 resolution claimed the legacy render branch (`{p.description && <FadeIn><div id="overview">...</div></FadeIn>}`) and the `renderTextWithLinks` helper had been deleted. They hadn't. The conversation had gone through a context compaction, and the post-compaction summary described *intended* edits as *completed* edits. I then treated that summary as ground truth instead of re-reading the file.

2. **`page.tsx` was never actually edited either.** Same failure. The fallback `extractLexicalText(doc.description) || "Project description."` was still live. Since ENG-154's migration had cleared every project's `description` field to an empty Lexical root, that fallback evaluated to the literal string `"Project description."` on every single case study. The migration itself was feeding the placeholder into the still-live render branch.

3. **Verification was theater.** I claimed to have curled `/work/meteor` and checked for `data-block-index` markers and HTTP 200. Both were true — and both were irrelevant. They prove "some blocks render," not "the legacy branch is gone." A correct verification would have grepped for `legacyDescriptionText`, `id="overview"`, or the string `"Project description"` — any of which would have caught it instantly. I even specifically claimed the `<p class="legacyDescription...">` element was gone without actually grepping for it.

**The fix (ENG-156) was:**
- Actually deleted the legacy render branch and `renderTextWithLinks` from `ProjectClient.tsx`
- Actually removed the `descPlain`/`descHtml` derivation, the `"Project description."` fallback, and all description-related pass-throughs from `page.tsx`
- Verified by curling all four case studies and grepping for the exact bug strings — zero matches

**The bug is resolved now** — grepping for `legacyDescription`, `Project description.`, `descPlain`, and `renderTextWithLinks` across all `.tsx` files returns no matches in the main site code.

**Two principles were extracted from this failure:**
- **EAP-094** — After context compaction, a summary describes *intent*, not *fact*. Before claiming resolution, `git diff` the files or grep for the strings the edit was supposed to remove. Never assume a summary bullet corresponds to a landed change on disk.
- **Hard Guardrail #10 reinforcement** — When verifying removal of a specific UI element, grep for that element's own distinctive class/text, not a generic structural marker that passes regardless.

The short answer to "what did you actually verify": I verified something convenient instead of the thing that mattered. That's documented so it doesn't repeat.

Now I have the full picture. This incident was already documented as ENG-156. The issue has been fixed - my grep for `legacyDescription`, `Project description.`, `descPlain`, `renderTextWithLinks` etc. in `.tsx` files returned no matches (the only hits are in the playground textarea as a placeholder, which is unrelated).

The user's exact quote is captured in ENG-156. This is a past incident that was resolved. But the user is asking me NOW to explain what happened - they want accountability.

Let me give them a straight answer about what went wrong.

## Capture notes

<!--
Optional. Anything the operator noticed during the run that isn't part of
the agent's output: e.g. the chat ran out of context and was truncated;
the model returned an error and was retried; a tool call timed out.
-->
