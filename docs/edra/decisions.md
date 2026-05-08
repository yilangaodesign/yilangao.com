# Edra Design Decisions

Design decisions and assumptions for the Edra homepage prototype. These emerged from persona analysis, retrieval pattern evaluation, and critical review against Maya's behavioral cadences.

---

## 1. Warm-Start Assumption

Maya is NOT a blank-slate first-time user. The previous team lead used the AI clustering system before departing. The system has:

- **Org-level context** — existing clusters, document relationships (137 links across 6 types), AI-suggested labels already assigned to many documents
- **Maya's personal signals** — 6 weeks of activity as lead (documents opened, bookmarked, edited), her calendar (meeting invites with agendas)
- **Inherited structure** — the previous lead's organizational decisions persist in the system

This means the homepage serves a "warm handoff" state, not onboarding. The system is making inferred guesses and presenting them for Maya to validate or correct.

---

## 2. Confidence / Tentativeness Principle

The system uses **tentative language at the item level** — where individual signals are inferred and Maya benefits from seeing the system's reasoning:

- "Mentioned in 18 Slack threads" — factual signal, no hedging needed
- "Possibly outdated" — staleness is an inference, hedging appropriate
- "→ 3 related docs" — relationship hints invite exploration

**Where tentativeness does NOT belong:** Section-level framing. Showing documents under a meeting header already implies the system thinks they're relevant. Adding "Likely relevant to your..." weakens trust without adding transparency — it makes the system sound uncertain rather than honest. The act of surfacing IS the confidence signal.

**Why:** Maps to Maya's "evidence over intuition" value. She wants to see why the system grouped things, not hear it hedge about whether it should have grouped them at all. Tentativeness belongs in drill-down reasoning (one click away), not in the default presentation layer.

**When to shift to confident:** Once Maya has explicitly confirmed a connection (e.g., pinned a doc to a meeting, approved a cluster), item-level hedging can drop for that specific item.

---

## 3. Discovery + Maintenance Blend

Quick action prompts on the homepage serve **both investigative and maintenance patterns**:

- **Investigative** (Maya is still new to the full workspace):
  - "Explore by project" — gives AI examples, builds mental model
  - "See document types" — landscape overview of 11 categories
- **Maintenance** (the AI has already identified problems):
  - "Find near-duplicates" — spot-check, quick win
  - "Review stale docs" — low-effort hygiene

**Why not pure maintenance:** The retrieval patterns doc explicitly states Maya at this stage is "building enough understanding to give the system useful input without spending an hour doing it." If we only show cleanup tasks, we skip the discovery step she needs.

---

## 4. Relevance Signal Approach ("Why Now")

Documents surfaced on the homepage carry a **contextual annotation** explaining their current relevance. This is the primary differentiator from a dumb "recently opened" list.

**Priority system (highest applicable wins):**

1. Meeting link (calendar inference)
2. Recent teammate comment
3. Slack thread mentions
4. PR citation
5. High team activity (viewers)
6. Staleness warning
7. Fallback: recency only

**Data sources:** The `edra_documents` table already has `meetings`, `linked_in_slack`, `linked_in_prs`, `last_commented_by`, `unique_viewers_30d`, and `staleness_flag`. We hardcode Maya's "calendar" for the prototype (Weekly Sync at 11am, Atlas Design Review at 2pm) and match against document `meetings` tags.

---

## 5. Thread-Tracing from Homepage

Even on the homepage, document rows show **relationship hints** for items with entries in `edra_document_links`:

- "→ 3 related docs" (subtly indicates connections exist)
- "Superseded by [newer doc]" (warns about outdated versions)

**Why at the homepage level:** Maya's success scenario is "She traces the thread: postmortem → ADR → eval." If the homepage only shows flat lists, it misses the system's core value proposition — making latent connections visible. The hints prime her to explore deeper.

---

## 6. Time-Anchored Meeting View

The "For your meetings" section uses **time as the structural anchor**, not prose. Each meeting is a distinct block headed by its time and title, with documents listed beneath. This replaces the previous flat list with a single "Likely relevant to..." sentence per group.

**Visual structure:**
- Meeting header: time (prominent, font-medium) + title (muted) + doc count (right-aligned, subtle)
- Full-bleed divider between meetings (negative margin to escape CardBody padding) — visually stronger than within-meeting doc dividers
- Standard dividers between document rows within a meeting

**Schedule-aware states:**
- **Upcoming** — default; shows future meetings with time anchors
- **In progress** — active meeting gets a "Now" badge instead of the time
- **All done** — "All done for today." with optional tomorrow preview
- **No meetings** — "Clear day" with optional tomorrow preview

**Why time-first:** Maya's engagement spikes before meetings (persona: "prepares in bursts"). The time IS the information she scans for — "what's at 2pm and what should I read?" A time-anchored layout answers that in a single visual pass. Embedding time in copy ("Likely relevant to your 2:00 PM...") forces her to parse a sentence to extract the anchor.

**Why adaptive states:** A static empty state ("No meetings with linked documents today") is a dead end. Maya's burst-prep behavior means even meeting-free moments should surface something useful — a peek at tomorrow, or a nudge toward catch-up work.

---

## 7. Color Token Usage — Neutral Default

Icons and text default to **neutral semantic tokens** (`--portfolio-text-secondary`, `--portfolio-text-primary`). Brand color is reserved for intentional emphasis — interactive affordances, active states, or explicit user attention. Applying brand color to every folder icon, for example, violates this: it creates visual noise and dilutes the signal of elements that actually warrant brand emphasis.

**Rule:** Default to neutral. Use brand only when warranted (active nav, selected state, primary CTA). Use semantic colors (negative, warning, positive) for their defined purpose — staleness badges, status indicators, severity markers.

**SCSS token pattern:** In SCSS modules, use `--portfolio-*` prefixed CSS custom properties (e.g. `--portfolio-spacer-2x`, `--portfolio-text-secondary`), not the unprefixed `--spacer-*` / `--color-*` tokens from `globals.css` `@theme`. The `@theme` tokens work in Tailwind utility classes and inline styles, but non-standard namespaces like `--spacer-*` don't generate CSS custom properties that SCSS modules can resolve. The `--portfolio-*` tokens come from the SCSS system (`@use '../../../src/styles' as *`) and are guaranteed to exist at runtime.

---

## 8. Workspace Tree: 3 Columns, Not 5

The workspace tree stripped from **Name | Date Modified | Owner | Category | Status** down to **Name | Date Modified | Status**.

**What was removed:**
- **Owner** — Maya never asks "who wrote this?" as a first-order question. Owner is a proxy for freshness/authority, which Date Modified + Staleness already cover. 24 of the 200 docs show departed authors, making the column actively misleading.
- **Category** — Redundant with folder structure. A doc inside `/ADRs` showing "Architecture Decision Records" adds zero information. Folders showing "Folder" as their category is absurd.

**Why Project wasn't added as a replacement:** Any metadata axis that could also serve as a folder name is structurally doomed. When the folder is organized by that axis, the column is redundant (same value repeated for every row). When the folder is organized by a different axis, the column contradicts the user's chosen frame — she grouped by type because she wants to think in types right now, not projects. This eliminates Project, Category, and Owner as useful persistent columns.

**Surviving columns pass three tests:** (a) always varies per-document within any grouping, (b) never usable as a folder axis, (c) answers a question Maya has while scanning.

**Design principle:** The workspace tree is a structural comprehension tool, not a data table. It answers "what's here and is it healthy?" Dense metadata belongs in drill-down surfaces (hover cards, detail panels, search results). The tree stays lean to support Maya's "scans fast" behavior.

**Where removed data lives:** Owner, project, and category remain available in the folder hover card and in future document detail panels — one click away, never zero clicks away. Maps to "reasoning on demand."

---

## Open Trade-offs

- **Search placeholder as guidance** — "Try a project like 'atlas'..." biases toward project-first exploration but might confuse users who want topic search. Testing needed.
- **How much inference is too much?** — Tentativeness now lives at item-level signals and drill-down reasoning, not section headers. But the boundary is still fuzzy: should "Possibly outdated" be hedged or just say "Outdated"? Testing needed.
- **Workspace landscape overview** — Currently served by quick action prompts only. An explicit stat bar ("200 docs, 11 categories, 20 stale") might help Maya calibrate faster. Deferred.
