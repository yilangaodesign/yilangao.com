---
node_type: renumber-log
id: design-renumber-log
domain: design
---

> **Last updated:** 2026-04-26 (Plan B Phase 4a.3 — duplicate-anchor disambiguation + 4 fresh FB-NNN allocations)

# Design ID Renumber & Anchor Log

> Tracks ID retrofits, fresh FB-NNN allocations, and duplicate-anchor disambiguation in `docs/design-feedback-log.md` and `docs/design-feedback-log-archive.md`.

## Decision: Line-Suffixed Anchors over Heading Renames

Same rationale as the engineering renumber log: heading renames would require rewriting many inbound cross-references with high misattribution risk. Line-suffixed anchors preserve cross-reference integrity in adjacent docs.

- **First occurrence (lowest line number, most recent):** `<a id="fb-NNN"></a>`
- **Subsequent occurrences:** `<a id="fb-NNN-occ2"></a>`, `<a id="fb-NNN-occ3"></a>`, …

## Fresh FB-NNN Allocations

Four standalone `### {Title}` entries lacked FB-NNN identifiers despite being individual feedback entries (with `**Date:**` + intent body). Allocated fresh IDs (continuing from the active-log max FB-207).

| Line | New ID | Title |
|------|--------|-------|
| L3518 | FB-208 | Block Editor Enhancement — Rich Text UX Overhaul |
| L3759 | FB-209 | Login page DS compliance audit and refactoring |
| L3779 | FB-210 | Geist Pixel fonts: weight mismatch destroys decorative rendering |
| L3798 | FB-211 | Login page split layout with halftone portrait |

## Duplicate FB-NNN Anchor Disambiguation

The following FB-NNN identifiers appear on multiple headings in `docs/design-feedback-log.md`. Each occurrence has been assigned a unique anchor; heading text is unchanged.

| ID | Occurrences | Anchors |
|----|-------------|---------|
| FB-051 | L2903, L2970 | `fb-051`, `fb-051-occ2` |
| FB-052 | L2875, L2980 | `fb-052`, `fb-052-occ2` |
| FB-053 | L2849, L2994 | `fb-053`, `fb-053-occ2` |
| FB-054 | L2827, L3010 | `fb-054`, `fb-054-occ2` |
| FB-055 | L2788, L2809, L3030 | `fb-055`, `fb-055-occ2`, `fb-055-occ3` |
| FB-056 | L2768, L3048 | `fb-056`, `fb-056-occ2` |
| FB-057 | L2746, L3064 | `fb-057`, `fb-057-occ2` |
| FB-058 | L2732, L3083 | `fb-058`, `fb-058-occ2` |
| FB-059 | L2716, L3100 | `fb-059`, `fb-059-occ2` |
| FB-060 | L2697, L3117 | `fb-060`, `fb-060-occ2` |
| FB-061 | L2683, L3149 | `fb-061`, `fb-061-occ2` |
| FB-062 | L2669, L3168 | `fb-062`, `fb-062-occ2` |
| FB-063 | L2647, L3195 | `fb-063`, `fb-063-occ2` |
| FB-064 | L2606, L3219 | `fb-064`, `fb-064-occ2` |
| FB-066 | L2588, L3250 | `fb-066`, `fb-066-occ2` |
| FB-070 | L2497, L3269 | `fb-070`, `fb-070-occ2` |
| FB-071 | L2479, L3284 | `fb-071`, `fb-071-occ2` |
| FB-072 | L2463, L3300 | `fb-072`, `fb-072-occ2` |
| FB-073 | L2443, L3325 | `fb-073`, `fb-073-occ2` |
| FB-074 | L2426, L3343 | `fb-074`, `fb-074-occ2` |
| FB-075 | L2398, L3368 | `fb-075`, `fb-075-occ2` |
| FB-078 | L2340, L3823 | `fb-078`, `fb-078-occ2` |
| FB-079 | L2321, L3842, L3859 | `fb-079`, `fb-079-occ2`, `fb-079-occ3` |
| FB-080 | L2277, L3873 | `fb-080`, `fb-080-occ2` |
| FB-081 | L2301, L3887 | `fb-081`, `fb-081-occ2` |
| FB-082 | L2263, L3945 | `fb-082`, `fb-082-occ2` |
| FB-083 | L2249, L3925, L3964 | `fb-083`, `fb-083-occ2`, `fb-083-occ3` |
| FB-084 | L2235, L3903, L4003 | `fb-084`, `fb-084-occ2`, `fb-084-occ3` |
| FB-085 | L2219, L3982 | `fb-085`, `fb-085-occ2` |
| FB-086 | L2193, L4024 | `fb-086`, `fb-086-occ2` |
| FB-087 | L2171, L4038 | `fb-087`, `fb-087-occ2` |
| FB-095 | L2016, L3395 | `fb-095`, `fb-095-occ2` |
| FB-096 | L1995, L3434 | `fb-096`, `fb-096-occ2` |
| FB-097 | L1981, L3416 | `fb-097`, `fb-097-occ2` |
| FB-100 | L1924, L3448 | `fb-100`, `fb-100-occ2` |
| FB-101 | L1912, L3466 | `fb-101`, `fb-101-occ2` |
| FB-102 | L1902, L3483 | `fb-102`, `fb-102-occ2` |
| FB-103 | L1886, L3506 | `fb-103`, `fb-103-occ2` |
| FB-104 | L1870, L3544 | `fb-104`, `fb-104-occ2` |
| FB-106 | L1851, L3579 | `fb-106`, `fb-106-occ2` |
| FB-109 | L1830, L3637 | `fb-109`, `fb-109-occ2` |
| FB-110 | L1814, L3662 | `fb-110`, `fb-110-occ2` |
| FB-111 | L1794, L3684 | `fb-111`, `fb-111-occ2` |
| FB-112 | L1778, L3703 | `fb-112`, `fb-112-occ2` |

## Active Log Inventory (Post-Anchor)

- **Total anchored entries:** 201 (`### FB-NNN` and `#### FB-NNN`)
- **Unique IDs at first occurrence:** 153
- **Line-suffixed anchors (occ2+):** 48
- **Fresh FB-NNN IDs allocated:** 4 (FB-208 through FB-211)
- **Duplicate FB-NNN groups:** 44
- **Sessions retrofitted:** 0 (5 level-3 `### Session:` containers left alone — they wrap level-4 FB-NNN sub-entries; not feedback nodes themselves)

## Archive Status

`docs/design-feedback-log-archive.md` retrofit pending in **Phase 4b.1**. Anchors-only at level 4, no fresh-ID allocations. Will continue the FB-NNN counter from FB-212 if needed.

