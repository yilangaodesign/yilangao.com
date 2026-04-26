---
title: Candidate Anti-Patterns
type: untagged-pattern-list
id: candidate-anti-patterns
topics: [knowledge-graph, audit, anti-pattern]
description: Scratch list of recurring failure modes surfaced during Plan B feedback-log tagging that lack a canonical AP/EAP/CAP entry. Reviewed separately to decide whether each should be promoted into the catalog.
---

# Candidate Anti-Patterns

> **Scratch file.** Patterns listed here have NOT yet been promoted to the canonical AP/EAP/CAP catalogs. Each entry records a failure mode that surfaced during Plan B's feedback-log tagging pass (or Phase 0 sample) but did not match an existing anti-pattern with strong or approximate confidence.
>
> **Not for citation.** Feedback log entries should NOT cite candidates as `See` or `Related:` — only canonical APs are valid citation targets per `docs/knowledge-graph.md` §"Edge-extraction invariants".
>
> **Promotion path.** A candidate is eligible for promotion to a real AP entry once it has 2+ distinct feedback-log occurrences. At that point, author the AP entry in the appropriate `docs/{design,engineering,content}-anti-patterns.md` file with the next available ID, then retroactively tag every occurrence in feedback logs.

## Format

Each entry is a single line:

```
- **Source ID**: One-sentence description of the failure mode. Why it might recur.
```

If the same pattern surfaces from a second source ID, append `, source-id-N` to the existing line rather than creating a new one. When the count reaches 2, flag for promotion review.

## Active candidates

### From Plan B Phase 0 sample (2026-04-26)

- **ENG-218**: React 19 forbids `flushSync` inside `useLayoutEffect` (commit-phase violation); `queueMicrotask` is the correct escape hatch for pre-paint synchronous measurement. Could recur as more sync-effect + measurement patterns surface; if it does, promote as a new EAP under React 19 lifecycle rules.

### From Plan B Phase 4 (added during the active-tag pass)

- **ENG-216, ENG-213**: Snapshot data hardcoded into a UI component when a live source-of-truth file (feedback log, manifest) already exists. Drifts silently; no test catches it. Recurs across visualization rebuilds. Promote once a third occurrence appears.
- **ENG-215, ENG-212**: Chart popover/tooltip layered behind sibling segments OR clipped at chart-container `overflow: hidden`. EAP-121 covers stacked-segment hover but not the broader "popover anchored to an element inside an overflow-clipping ancestor" case. Worth promoting once the stacked-segment-specific guidance is generalized.
- **ENG-185, ENG-180, ENG-166**: Block-deletion UX in the case-study editor: image-block delete is unreliable, empty image slots cannot be removed, pre-built scaffolding blocks cannot be cleaned up. Cluster of CMS block-editor deletion failures. Candidate for an "atomic block-delete with confirmation" EAP.
- **ENG-173, ENG-172, ENG-170, ENG-169**: Video block regressions (replaces hero, disappears, mute capability split confused). Candidate EAP: "Splitting a single boolean into capability + state without auditing all consumers."
- **FB-103-occ2, FB-179, FB-205**: Visual-element measurement loops (sidebar logo invisible, step dots misaligned, transport bar trigger width). Possibly an AP for "measuring against painted DOM mid-animation rather than against deterministic geometry," but the cluster is small. Hold for now.
- **ENG-232**: Generated-artifact's structural validity (JSON schema, file-format conformance) verified, but semantic resolution rules of the consumer (Obsidian Canvas) not honored — `.canvas` JSON used HTML anchor IDs as `subpath` while Obsidian resolves `subpath` against markdown headings; dotfolder file paths broke because Obsidian doesn't index `.cursor/` by default. Recurs whenever a script emits a third-party file format and is verified only via JSON-schema/structural checks rather than by rendering in the target consumer. Promote on second occurrence — likely candidates: future Figma export scripts, KML/SVG generators, MCP resource files, any script writing to a foreign IDE/tool's file format.

## Promoted

_When a candidate graduates to a canonical AP, move its line here with the new ID (e.g. `ENG-218 → EAP-XXX`). Do not delete — preserves traceability._

_None yet._
