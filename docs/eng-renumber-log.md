---
node_type: renumber-log
id: eng-renumber-log
domain: engineering
---

> **Last updated:** 2026-04-26 (Plan B Phase 4a.2.(i) — duplicate-anchor disambiguation + ENG-219 fresh allocation)

# Engineering ID Renumber & Anchor Log

> Tracks ID retrofits, fresh ENG-NNN allocations, and duplicate-anchor disambiguation in `docs/engineering-feedback-log.md` and `docs/engineering-feedback-log-archive.md`.

## Scope

Plan B Phase 4a.2.(i) was originally scoped to retrofit `## Session:` containers into `### ENG-NNN` headings. Empirical audit showed all 9 active-log Sessions already contain `### ENG-NNN` sub-entries — they fall under the policy carve-out ("Sessions whose internal headings are already ENG-NNN are excluded"). The retrofit scope is therefore **moot for the active log**.

Two material problems were discovered in the inventory pass and addressed in this phase:

1. **One non-ENG `###` entry** lacked an ENG-NNN identifier. → Allocated a fresh ID.
2. **18 duplicate ENG-NNN headings** (20 collisions total) made some entries unaddressable in the knowledge graph. → Resolved via line-suffixed anchors, *not* by renaming headings, to preserve cross-reference integrity in adjacent docs.

## Decision: Line-Suffixed Anchors over Heading Renames

Renaming duplicate headings to fresh ENG-NNN IDs would have required rewriting **80+ inbound cross-references** across `design-feedback-log.md`, `engineering-anti-patterns.md`, `architecture.md`, `engineering.md`, `port-registry.md`, `release-log.md`, `doc-audit-log.md`, `storage.md`, and `knowledge-graph.md`. Each cross-ref would need context-based disambiguation (which of the duplicate ENG-104 entries is being referenced?), with high risk of misattribution.

Instead, the active log now anchors each entry uniquely:

- **First occurrence (lowest line number, typically the most recent):** `<a id="eng-NNN"></a>`
- **Subsequent occurrences:** `<a id="eng-NNN-occ2"></a>`, `<a id="eng-NNN-occ3"></a>`, …

Inbound cross-references in body text continue to read "ENG-NNN" verbatim. They remain narrative pointers, not graph edges. The knowledge graph addresses each entry by its unique anchor; the line-suffixed form is the canonical address for older duplicate occurrences.

A future cleanup pass MAY rename duplicate headings to fresh IDs once the cross-reference rewrite is scoped and budgeted. Until then, the line-suffixed anchors are stable.

## Fresh Allocations

| Line | New ID | Title |
|------|--------|-------|
| L2685 | ENG-219 | Route group restructure for gate page navigation exclusion (2026-04-09) |

## Duplicate ENG-NNN Anchor Disambiguation

The following ENG-NNN identifiers appear on multiple headings in `docs/engineering-feedback-log.md`. Each occurrence has been assigned a unique anchor; heading text is unchanged.

| ID | Occurrences | Anchors |
|----|-------------|---------|
| ENG-104 | L2563, L2637 | `eng-104`, `eng-104-occ2` |
| ENG-105 | L2549, L2653 | `eng-105`, `eng-105-occ2` |
| ENG-106 | L2535, L2671 | `eng-106`, `eng-106-occ2` |
| ENG-107 | L2508, L2697 | `eng-107`, `eng-107-occ2` |
| ENG-111 | L2492, L2761 | `eng-111`, `eng-111-occ2` |
| ENG-112 | L2478, L2789 | `eng-112`, `eng-112-occ2` |
| ENG-113 | L2464, L2775 | `eng-113`, `eng-113-occ2` |
| ENG-114 | L2448, L2803 | `eng-114`, `eng-114-occ2` |
| ENG-115 | L2436, L2835 | `eng-115`, `eng-115-occ2` |
| ENG-116 | L2424, L2921 | `eng-116`, `eng-116-occ2` |
| ENG-117 | L2412, L2893, L2907 | `eng-117`, `eng-117-occ2`, `eng-117-occ3` |
| ENG-118 | L2390, L2879 | `eng-118`, `eng-118-occ2` |
| ENG-183 | L679, L730 | `eng-183`, `eng-183-occ2` |
| ENG-198 | L295, L2958 | `eng-198`, `eng-198-occ2` |
| ENG-199 | L283, L2970 | `eng-199`, `eng-199-occ2` |
| ENG-200 | L271, L3021 | `eng-200`, `eng-200-occ2` |
| ENG-201 | L261, L2984, L3035 | `eng-201`, `eng-201-occ2`, `eng-201-occ3` |
| ENG-202 | L247, L2998 | `eng-202`, `eng-202-occ2` |

## Active Log Inventory (Post-Anchor)

- **Total anchored entries:** 132 (`### ENG-NNN` and `#### ENG-NNN`)
- **Unique IDs:** 112 canonical + 20 line-suffixed = 132 unique anchors
- **Fresh IDs allocated:** 1 (ENG-219)
- **Sessions retrofitted:** 0 (all active-log Sessions already had ENG-NNN sub-entries; carve-out applied)


## Archive Domain (Phase 4b.2)

### Fresh ENG-NNN Allocations (Archive)

Ten standalone `### {Title}` entries in `docs/engineering-feedback-log-archive.md` lacked ENG-NNN identifiers. Allocated fresh IDs continuing from active-log allocation (ENG-219).

| Line | New ID | Title |
|------|--------|-------|
| L2404 | ENG-220 | Block Editor Enhancement — Per-Block Lexical + Markdown Adapter |
| L2431 | ENG-221 | Hero Image Skeleton — Mandatory First Block for All Case Studies |
| L2451 | ENG-222 | Grid Reorder Disconnected from Case Study Navigation Order |
| L2465 | ENG-223 | TestimonialCard pretext API mismatch |
| L2479 | ENG-224 | Login page inaccessible during UI iteration |
| L2493 | ENG-225 | Login page rebuilt components instead of using DS |
| L2507 | ENG-226 | Halftone portrait component ported to login page |
| L2534 | ENG-227 | Image upload to slotted placeholder grid wipes sibling slots + alt text lost |
| L2560 | ENG-228 | Illustrations case study scaffold never populated |
| L2578 | ENG-229 | Case study sidebar shows empty "Links" section when no links exist |

### Duplicate ENG-NNN Anchor Disambiguation (Archive)

| ID | Occurrences | Anchors |
|----|-------------|---------|
| ENG-016 | L1098, L1186 | `eng-016`, `eng-016-occ2` |
| ENG-017 | L704, L1200 | `eng-017`, `eng-017-occ2` |
| ENG-018 | L689, L1212 | `eng-018`, `eng-018-occ2` |
| ENG-019 | L662, L1122, L1226 | `eng-019`, `eng-019-occ2`, `eng-019-occ3` |
| ENG-020 | L639, L1136, L1240 | `eng-020`, `eng-020-occ2`, `eng-020-occ3` |
| ENG-021 | L615, L1154, L1254 | `eng-021`, `eng-021-occ2`, `eng-021-occ3` |
| ENG-042 | L133, L1171, L1391 | `eng-042`, `eng-042-occ2`, `eng-042-occ3` |
| ENG-054 | L1281, L2039 | `eng-054`, `eng-054-occ2` |
| ENG-055 | L1293, L2018 | `eng-055`, `eng-055-occ2` |
| ENG-056 | L1305, L2002 | `eng-056`, `eng-056-occ2` |
| ENG-060 | L1353, L1974 | `eng-060`, `eng-060-occ2` |
| ENG-061 | L1372, L1986 | `eng-061`, `eng-061-occ2` |
| ENG-073 | L1407, L1775 | `eng-073`, `eng-073-occ2` |
| ENG-095 | L2219, L2232 | `eng-095`, `eng-095-occ2` |
| ENG-098 | L1542, L2281 | `eng-098`, `eng-098-occ2` |
| ENG-099 | L1528, L2293 | `eng-099`, `eng-099-occ2` |

### Archive Inventory (Post-Anchor)

- **Total anchored entries:** 135 (`### ENG-NNN` and `#### ENG-NNN`)
- **Fresh ENG-NNN IDs allocated:** 10 (ENG-220 through ENG-229)
- **Duplicate ENG-NNN groups:** 16
- **Sessions retrofitted:** 0 (all 71 archive Sessions already contained ENG-NNN sub-entries; carve-out applied)
- **Container H3 entries left intact:** 9 (8× `### Incidents` wrapping ENG-NNN sub-entries, 1× `### Session Meta-Analysis`)

