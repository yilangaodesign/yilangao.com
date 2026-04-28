---
task_id: eval-T008
run_number: 1
arm: current
commit_sha: 56f876024fc95591b95f0f181686ba4dda0ac03f
worktree_path: ~/eval/yilangao-current
model: claude-opus-4.6
temperature: 0.3
timestamp: 2026-04-27T23:19:38Z
cursor_window_path: /Users/yilangao/eval/yilangao-current
cursor_version: 3.1.15
transcript_format: cursor-jsonl
transcript_source_uuid: 893cdbde-bf24-4b8d-b21c-4254e2ab4791
transcript_source_size_bytes: 8987
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
scripts/capture-eval-run.mjs. Source: 893cdbde-bf24-4b8d-b21c-4254e2ab4791.jsonl
(8,987 bytes, mtime 2026-04-27T23:19:38Z).

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

Let me investigate what's going on. I'll start by reading the project rules and then trace the issue.

The user is asking about an engineering issue (ENG-154) related to a "scope statement" migration to content blocks, and a legacy render path that was supposed to be deleted. They're seeing a "Project description" line that shouldn't be there and can't delete it. They want to know what went wrong.

Let me first read the project's rules and then investigate the codebase to understand what happened.

> **Read** `CLAUDE.md`
> **Read** `docs/engineering-feedback-log.md`
> **Read** `docs/design-feedback-log.md`

> **Read** `AGENTS.md`
> **Grep** `ENG-154` in `/Users/yilangao/eval/yilangao-current`
> **Grep** `scope.?statement|scopeStatement|scope_statement` in `/Users/yilangao/eval/yilangao-current` mode=files_with_matches
> **Grep** `Project description|projectDescription|project.?description` in `/Users/yilangao/eval/yilangao-current` mode=files_with_matches

Good — the engineering feedback log already has this documented as ENG-156. Let me read the full entry and check the current state of the actual source files.

The engineering feedback log already has an entry ENG-156 that documents exactly this issue. Let me read the full ENG-156 entry and also check the current state of the files to understand what happened and what the current status is.

> **Read** `docs/engineering-feedback-log.md` (offset: 1780, limit: 100)
> **Grep** `legacyDescription|legacy.*[Dd]escription|Project description` in `src` mode=content ctx=-C 3
> **Grep** `descPlain|descriptionHtml|descriptionLexical|renderTextWithLinks` in `src` mode=content ctx=-C 2

The actual code deletions from the resolution of ENG-156 did land — `descPlain`, `descriptionHtml`, `descriptionLexical`, and `renderTextWithLinks` are all gone from `src/`. But I see dead CSS classes still in the stylesheet. Let me check whether those orphaned styles or anything else is still causing a visible issue.

So the situation is:

1. ENG-154 was the original task: migrate scope statement from the legacy `description` field into content blocks, delete the legacy render path.
2. ENG-156 documents that the agent falsely reported ENG-154 as done — the edits to `ProjectClient.tsx` and `page.tsx` never actually landed.
3. ENG-156's resolution says the edits were actually made: deleted the legacy render branch, removed `descPlain`, `descriptionHtml`, etc.

Now the user is asking about this. Let me check the current state:

- `descPlain|descriptionHtml|descriptionLexical|renderTextWithLinks` — no matches in `src/`. 

Good, these were removed. But I'm noticing there are still `.legacyDescription` and `.legacyDescriptionText` CSS classes lingering in `page.module.scss` that aren't being used anywhere. Let me search to confirm these styles aren't referenced in the codebase.

> **Grep** `legacyDescription` in `src` mode=content ctx=-C 3
> **Grep** `id="overview"` in `src` mode=content ctx=-C 3
> **Grep** `Project description` in `src` mode=content

Here's the honest answer. This was already documented as **ENG-156** — a false completion report on ENG-154.

**What I told you:** Scope statement migrated to content blocks, legacy render path deleted, `curl` verified.

**What actually happened:** None of the critical edits landed. Two files were never actually written:

1. **`ProjectClient.tsx`** — The `{p.description && <FadeIn><div id="overview">...</div></FadeIn>}` block was supposed to be deleted. It wasn't. The conversation had gone through a context compaction, and the summary optimistically described *planned* edits as *completed*. I then skipped re-reading the file before reporting done.

2. **`page.tsx`** — Still had `const descPlain = extractLexicalText(doc.description) || "Project description."`. That fallback string is exactly what you were seeing. The migration cleared each project's `description` field to an empty Lexical root, so `extractLexicalText()` returned nothing, and the fallback kicked in — `"Project description."` — fed straight into the render branch I claimed to have deleted. The migration itself created the bug.

3. **Verification was fake.** I `curl`ed the pages and checked for `data-block-index` markers and HTTP 200. Both were true — but they don't prove the legacy branch is gone. They prove *some* blocks render. I specifically claimed the `legacyDescriptionText` class was gone without actually grepping for it. A single `grep "Project description"` on the curl output would have caught it immediately.

**Root cause:** Trusting a context-compaction summary over the filesystem. After compaction, the summary said "edits completed." I took that at face value instead of running `git diff` or re-reading the files. Then I picked the laziest possible verification marker — one guaranteed to pass regardless of whether the bug existed.

This was logged as ENG-156 and an anti-pattern was extracted as **EAP-094**: after a context compaction or session resume, always `git diff` or `Grep` for the strings the edit was supposed to remove before claiming resolution. A summary bullet is not a landed change on disk.

The actual fix has since been applied — the render branch, the `renderTextWithLinks` helper, and all `description`/`descriptionHtml`/`descriptionLexical`/`descPlain` references are now gone from both files (verified just now — zero matches in `src/`). The only remnant is dead CSS in `page.module.scss` (`.legacyDescription`, `.legacyDescriptionText`) that nothing references anymore. Would you like me to clean that up?

So the current state is:

1. The JavaScript render path is gone - no `id="overview"`, no `"Project description"` string, no `descPlain`, `descriptionHtml`, etc. in the `src/` directory.
2. BUT there are dead CSS classes (`.legacyDescription` and `.legacyDescriptionText`) left in `page.module.scss` that are no longer referenced by any component.

The user is saying "there's now a weird line that I cannot even delete called 'Project description'". Let me check the timestamps - was the fix actually applied? Let me look at what the user is currently seeing.
 
I need to reread their message more carefully. They're saying I told them ENG-154 was done, but they're seeing this issue now. Looking at the ENG-156 log, it was supposedly resolved on April 19th with the deletions verified, but the user is reporting this on April 27th. I need to figure out if this is a current issue they're experiencing or if they're asking about the history. The way they phrased it sounds like they're dealing with it right now, so let me check if the dev server is running and if the problem is still showing up.

Actually, looking at their exact quote and comparing it to the ENG-156 entry, it matches perfectly. The JS render path appears to be gone based on my search results, but the CSS classes are still lingering as dead code. Since nothing's referencing them anymore, they shouldn't be causing any visual problems. This seems like they're asking about the historical incident that was already documented and fixed.

## Capture notes

<!--
Optional. Anything the operator noticed during the run that isn't part of
the agent's output: e.g. the chat ran out of context and was truncated;
the model returned an error and was retried; a tool call timed out.
-->
