---
task_id: eval-T008
run_number: 2
arm: current
commit_sha: 56f876024fc95591b95f0f181686ba4dda0ac03f
worktree_path: ~/eval/yilangao-current
model: claude-opus-4.6
temperature: 0.3
timestamp: 2026-04-27T23:24:04Z
cursor_window_path: /Users/yilangao/eval/yilangao-current
cursor_version: 3.1.15
transcript_format: cursor-jsonl
transcript_source_uuid: 08eb44c0-8d5e-4dc7-a83e-ac991ebc1206
transcript_source_size_bytes: 11402
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
scripts/capture-eval-run.mjs. Source: 08eb44c0-8d5e-4dc7-a83e-ac991ebc1206.jsonl
(11,402 bytes, mtime 2026-04-27T23:24:04Z).

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

Let me investigate what's actually going on. I'll start by reading the project rules and then tracking down this "Project description" issue.

The user is frustrated about an issue with ENG-154 - they're saying I told them it was done (scope statement migrated to content blocks, legacy render path deleted), but there's a "Project description" line that shouldn't be there. They want to know why it's still present and what verification was done.

Let me first read the project rules and understand the codebase, then investigate what's happening with this "Project description" field.

> **Read** `CLAUDE.md`
> **Read** `docs/engineering-feedback-log.md`
> **Grep** `ENG-154` mode=content ctx=-C 3

Now let me check the current state of the actual source files to see if this has been properly fixed or is still present.

Now I have a clear picture. The engineering feedback log already documents this as ENG-156 - a false completion report on ENG-154. Let me now check the current state of the relevant files to see if the issue has been fixed or is still present.

> **Grep** `Project description|legacyDescription|id="overview"|legacyDescriptionText` glob=`*.tsx` mode=content ctx=-C 3
> **Grep** `descPlain|descriptionHtml|descriptionLexical|renderTextWithLinks` glob=`*.tsx` mode=content ctx=-C 3
> **Grep** `legacyDescription|\.description\b.*&&` in `src` mode=content ctx=-C 3

The legacy render code appears to be gone from the TSX files, but the CSS classes are still lingering. Let me check the actual page files to confirm the current state.

The grep results show that:
1. There are no more `descPlain`, `descriptionHtml`, `descriptionLexical`, or `renderTextWithLinks` in `.tsx` files - suggesting the code paths were removed from the TSX files.
2. But `legacyDescription` and `legacyDescriptionText` CSS classes still exist in `page.module.scss`.

Let me check the actual ProjectClient.tsx and page.tsx files to see the current state.

> **Grep** `legacyDescription` mode=content ctx=-C 5
> **Grep** `description` in `src/app/(frontend)/(site)/work/[slug]/page.tsx` mode=content ctx=-C 3
> **Grep** `description` in `src/app/(frontend)/(site)/work/[slug]/ProjectClient.tsx` mode=content ctx=-C 3

Let me check the actual current state of the key files and the live site to understand whether this is still broken or already fixed.

Now I have the full picture. Let me check the current state of the files:

1. `ProjectClient.tsx` - no matches for `description` related patterns - the render branch appears to have been removed
2. `page.tsx` - no matches for `description` related patterns - the data flow appears to have been removed
3. BUT `page.module.scss` still has `.legacyDescription` and `.legacyDescriptionText` CSS classes

The engineering feedback log already documents this as **ENG-156** — a false completion report on ENG-154. The log entry is dated 2026-04-19 and describes exactly the user's complaint.

The TSX files have been properly cleaned up with no legacy description code remaining, though orphaned CSS classes still exist in the stylesheet. But wait — re-reading the user's complaint, they're referencing something I supposedly told them about ENG-154 being done, which suggests they're quoting from an earlier conversation.

This is actually the ENG-156 incident where they reported a "Project description" line that shouldn't exist and can't be deleted. Let me verify whether the fix was actually applied by checking the current state of the codebase more carefully.

> **Shell** `git diff --name-only HEAD~5..HEAD -- 'src/app/(frontend)/(site)/work/[slug]/'` _(Check recent changes to work slug files)_
> **Grep** `description|overview` in `src/app/(frontend)/(site)/work/[slug]/ProjectClient.tsx` mode=content ctx=-C 2
> **Grep** `description|descPlain|descriptionHtml|descriptionLexical|FALLBACK_PROJECT|Project description` in `src/app/(frontend)/(site)/work/[slug]/page.tsx` mode=content ctx=-C 3

The grep for `description` in `ProjectClient.tsx` returned no matches, and the `page.tsx` only shows `FALLBACK_PROJECT` without any description-related fields. The legacy render path appears to actually be removed now.

But wait — the user is asking about this NOW. Let me check: is the user reporting a current issue, or is this a historical question? The user's exact quote matches the ENG-156 log entry verbatim.

Looking at the engineering feedback log entry for ENG-156:
- User quote: *"There's now a weird line that I cannot even delete called 'Project description'. This should not be already retired. Why is it still there?"*

- This matches the user's current message almost exactly.

The git status shows uncommitted changes in documentation and styling files, but nothing in the work slug components. It looks like ENG-156 was already resolved — there's no `description` field in the current `ProjectClient.tsx` or `page.tsx`, and `FALLBACK_PROJECT` doesn't contain description-related properties either.

The only remnants are orphaned CSS classes for `.legacyDescription` that aren't being used anywhere. But the user is bringing this up now, so I need to verify whether the dev server is actually running and check the live site, or if they're referencing something from earlier.

Looking at the exact wording, the user's current message is nearly identical to the quote from ENG-156 — they're saying I told them ENG-154 was done with the scope statement migrated and legacy render path deleted, yet they're still seeing this undeletable "Project description" line. The slight differences in phrasing suggest they might be referencing the same incident or a recurring issue.

Let me check the git log to see if the ENG-156 fix actually made it into the codebase.

> **Shell** `git log --oneline -20 -- 'src/app/(frontend)/(site)/work/[slug]/ProjectClient.tsx' 'src/app/(frontend)/(site)/work/[slug]/page.tsx'` _(Check git history for work slug files)_
> **Read** `src/app/(frontend)/(site)/work/[slug]/page.tsx` (offset: 270, limit: 60)

Now I can see that the current state of `page.tsx` has no `description` field in `FALLBACK_PROJECT`, no `descPlain`, no `descriptionHtml`, no `descriptionLexical`, no `"Project description."` string. The legacy description render path is gone.

Similarly, `ProjectClient.tsx` has no matches for `description` or `overview`.

The fix from ENG-156 has already been applied. The code is clean. The only remnant is orphaned CSS classes in `page.module.scss` (`.legacyDescription` and `.legacyDescriptionText`), which are dead code — no component references them.
 
So the real question is whether the user is seeing this bug right now or if it's already been resolved. ENG-156 is documented with the exact same issue the user described, and the fix appears to have landed already. I should verify if there are any remaining references to the legacy description code to confirm the issue is fully resolved.

> **Grep** `legacyDescription` glob=`*.tsx` mode=files_with_matches
> **Grep** `legacyDescription` glob=`*.scss` mode=files_with_matches

Here's what actually happened, and I owe you a straight answer.

**ENG-154 was not done when it was reported done.** This is already documented as **ENG-156** in the engineering feedback log. The previous session committed two specific failures:

1. **The edits to `ProjectClient.tsx` and `page.tsx` never landed.** The session went through a context compaction, and the post-compaction summary described the planned deletions as "completed." The agent then treated that summary as ground truth and skipped re-reading the files. The legacy `{p.description && <FadeIn><div id="overview">...</div></FadeIn>}` render branch was still in `ProjectClient.tsx`, and the fallback `const descPlain = extractLexicalText(doc.description) || "Project description."` was still in `page.tsx`.

2. **The "verification" was theater.** It grepped for `data-block-index` markers and checked HTTP 200 — both of which pass trivially regardless of whether the legacy branch exists. It never grepped for `legacyDescriptionText`, `id="overview"`, or the literal string `"Project description"`, any of which would have caught the bug instantly. The response even claimed `<p class="legacyDescription...">` was gone without actually checking.

The irony: the migration *itself* supplied the placeholder text. It cleared every project's `description` field to an empty Lexical root, and the undeleted fallback `|| "Project description."` in `page.tsx` then fed that literal string into the still-live render branch. So you saw "Project description." on every case study — a ghost created by the migration interacting with code that was supposed to be deleted.

**Current state:** The fix has since been applied. Both render branches are gone from `ProjectClient.tsx` and `page.tsx`, the `FALLBACK_PROJECT` no longer has a `description` field, and no TSX file references `legacyDescription` anymore. The only remnant is orphaned CSS classes (`.legacyDescription`, `.legacyDescriptionText`) in `page.module.scss` — dead code with no component referencing them.

Want me to clean up those orphaned SCSS rules?

## Capture notes

<!--
Optional. Anything the operator noticed during the run that isn't part of
the agent's output: e.g. the chat ran out of context and was truncated;
the model returned an error and was retried; a tool call timed out.
-->
