# Phase 5: Synthesize Documentation

This phase replaces normal Post-Flight for orchestrated work. The orchestrator
owns all official documentation writes — helpers only write 2-line stubs.

## Step 1: Stub Enrichment

For each helper that returned a `## Draft Documentation` section:
1. Find the helper's 2-line stub in the feedback log (search by pre-assigned ID)
2. Replace the stub with the full entry from the helper's draft
3. Ensure the entry follows the standard format for its log type:
   - Design: `#### FB-NNN: "..."` with UX Intent, Root Cause, Resolution, Pattern extracted
   - Engineering: `#### ENG-NNN: "..."` with Issue, Root Cause, Resolution, Principle extracted
   - Content: `#### CFB-NNN: "..."` with Intent, Root Cause, Resolution, Pattern extracted

## Step 2: Correlation ID

Assign a correlation ID `ORC-NNN` to this orchestration session (read the last
ORC entry in any feedback log to determine the next number, or start at ORC-001).

Add to each enriched log entry:
```
**Orchestration:** ORC-NNN
```

## Step 3: Cross-References

For entries that span multiple categories (e.g., a task that touched both design
and engineering), add cross-category notes:
```
**Cross-category note:** Also documented as ENG-074 (engineering)
```

## Step 4: Frequency Map + Anti-Pattern Updates

Update the frequency map appendix in each applicable doc:
- `docs/design.md` Appendix — if design feedback was processed
- `docs/engineering.md` Appendix — if engineering incidents were processed
- `docs/content.md` Appendix — if content feedback was processed

Increment the relevant category counts.

Update anti-pattern files if any helper's draft documentation flagged a new
anti-pattern:
- `docs/design-anti-patterns.md` — if a design anti-pattern was identified
- `docs/engineering-anti-patterns.md` — if an engineering anti-pattern was identified
- `docs/content-anti-patterns.md` — if a content anti-pattern was identified

## Step 5: Update "Last Updated" Headers

Update the `> **Last updated:**` header line at the top of each feedback log
that was modified during this orchestration session. Include the date and the
latest entry ID.

## Fallback: Incomplete Documentation

If a helper failed before writing its `## Draft Documentation`:
- Leave the "Resolution pending (orchestrated)" stub in place
- Add a note: `**Note:** Helper failed during ORC-NNN. Check git diff for
  partial implementation. Resolve in next session.`
- The next session can catch up by running `git diff` against the last commit
  before this orchestration and matching changes to pending stubs.
