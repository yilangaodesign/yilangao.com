# Edra Outreach Strategy

> Consolidated from the Edra Communication Audit plan. These are outreach-only assets - none of this belongs in live portfolio copy.

## 1. Portfolio Routing for Edra

When linking to the portfolio for Edra specifically, route in this order:

| Priority | Case Study | Why | When to Link |
|----------|-----------|-----|-------------|
| **Primary** | Engram | Closest problem space. Knowledge graph visualization is a hook. Thesis ("intelligence was never the bottleneck, context is") mirrors Edra's. | Always. First link in every channel. |
| **Credibility** | Meteor | Enterprise scale ($79B daily), sole designer, financial ops. Proves you can operate in complex institutional environments. | LinkedIn note and email. Establishes Goldman credibility. |
| **Conditional** | ETRO | Trust architecture essay. 2,500 words. Eugen won't read it on first visit. | Only if trust/auditability comes up in conversation. |
| **Lowest** | Lacework | Consumption billing. Least overlap with Edra's problem space. | Only if asked about additional work. |

## 2. Goldman-to-Engram Thread (outreach copy only)

This connection belongs in outreach materials, NOT in live portfolio copy. Making it explicit on the site risks reading as meta-positioning rather than craft demonstration (CAP-015).

The thread: "I built a trust architecture for $79B in daily ETF operations at Goldman, then built the context system that kind of work demands when an AI agent is your collaborator."

### X Reply (public, on Eugen's enterprise context posts)

> This resonates. I designed high-stakes enterprise workflows at Goldman where the hard part was never the models - it was making the reasoning, exceptions, and audit trail legible enough for humans to trust the next action. I've been building a system that does something similar for AI agents: a knowledge graph that makes institutional judgment retrievable and enforceable. The overlap with what Edra is doing at enterprise scale is why I applied.

### LinkedIn Note

> Hi Eugen - I just applied through Edra's site and wanted to reach out directly.
>
> I'm a product designer who spent years designing complex, high-stakes enterprise workflows at Goldman Sachs Asset Management (ETF operations, $79B in daily assets). My work sits at the intersection of trust, auditability, and making dense operational systems usable.
>
> On the side, I've been building something that turned out to be surprisingly close to Edra's thesis: a knowledge graph that makes institutional judgment retrievable and enforceable for AI agents. 72% retrieval accuracy on the hardest tasks, both baselines at zero. The case study is live at yilangao.com/work/engram.
>
> Edra feels unusually aligned with the kind of problems I've been working on. I'd love to be considered if you're thinking about early product/design talent.

### Email (hello@edra.ai)

> Subject: Product designer interested in Edra - enterprise context is the problem I've been solving
>
> Hi Edra team,
>
> I just applied through your site and wanted to reach out directly.
>
> I'm a product designer at Goldman Sachs Asset Management, where I design high-stakes enterprise workflows for ETF operations. My work focuses on trust, auditability, exception handling, and making dense operational systems usable.
>
> On the side, I built an agent memory system that turned out to mirror Edra's thesis almost exactly: a knowledge graph that makes institutional judgment retrievable, enforceable, and measurable for AI agents. The case study is at yilangao.com/work/engram.
>
> Edra's focus on making enterprise context legible to AI is the exact problem space I've been working in, both at Goldman and independently. I'd be excited to be considered for any product/design opportunities.
>
> Best,
> Yilan

## 3. Timeline Defense

Engram predates Edra's stealth launch. Include this naturally in outreach, not as a defensive statement.

**Facts:**
- Edra's stealth launch: March 18, 2026
- Engram dossier creation: April 3, 2026
- Engram case study iteration: continuous since early April 2026
- The core insight ("intelligence was never the bottleneck, context is") was developed independently

**How to use it:** The LinkedIn note and email above frame the overlap as "turned out to be surprisingly close to Edra's thesis" - language that implies independent convergence without being defensive about it. If pressed directly, the dossier commit history is timestamped evidence.

**Do NOT:** Put timeline defense in the portfolio itself. It would read as self-conscious.

## 4. Analogy for the Knowledge Graph (needs user input)

The plan identified that Engram lists artifacts (18 skills, 200+ APs, ~4,892 edges) without a one-sentence analogy that makes the system immediately graspable. "GitHub for knowledge" fails CAP-020 (structural mismatch - GitHub is version control + collaboration, not retrieval + enforcement + measurement).

### Candidates

| Analogy | Structural Match | Misses | CAP-020 Gate 1 |
|---------|-----------------|--------|----------------|
| "A type system for design judgment" | Typed relationships, compile-time error detection, makes invalid states unrepresentable. The graph has typed edges (enforces, supersedes, derivedFrom), catches contradictions, and makes relationships explicit. | Doesn't convey measurement or retrieval. "Type system" may read as engineering to non-technical audience. | PASS |
| "A codebase for institutional memory" | Closest to Edra's "enterprise context is the new source code." Implies structure, queryability, version history. | Doesn't inherently convey enforcement or measurement. "Codebase" is metaphorical stretch for non-engineers. | PARTIAL |
| "A linter for AI collaboration" | Names enforcement (the graph's primary function). Immediately familiar to engineering audience. | Misses retrieval and measurement. Linters check, they don't store or connect. | PARTIAL |

**Recommendation:** "A type system for design judgment" is the strongest structural parallel for a technical audience (Edra's founders are ex-Palantir engineers). For a broader audience, "a codebase for institutional memory" borrows Edra's own framing and might land faster.

**Decision needed from user:** Which structural parallel resonates? Or propose a different one.
