<!-- graph metadata for docs knowledge graph (see docs/knowledge-graph.md) -->
---
type: spoke
id: content-elan-design-system-interview
topics:
  - content
  - system-architecture
  - projects
  - case-study
derivedFrom:
  - content.md
---

# Élan Design System - Interview Defense Notes

> Created 2026-04-06 during v3 case study rebuild.
> NOT for content iteration consumption. See dossier for cross-reference.

## 1. Metric Defense

### Hero Metric: "~5K" (knowledge graph edges)

**Derivation:** The knowledge graph contains ~4,892 typed edges across 6 relationship
types (strengthens, supersedes, narrows, weakens, related, cites). Built from 200+
anti-patterns, 18 skills, and 234 feedback entries across design, engineering, and content.
Edge count sourced from `.cache/graph.json`.

**Method:** A regex extractor lifts cross-references between anti-patterns, skills,
and feedback entries into typed edges with confidence scores. An audit enforcer validates
new entries against the existing graph at write time — contradictions surface before they
ship. The live graph is rendered on the case study page with an auto-transition tour.

**What it measures:** The density of the system's interconnected knowledge. Not just how
many rules exist, but how explicitly they relate to each other. A graph with ~5K edges
means corrections don't exist in isolation — they form a queryable network of design
judgment.

**Limitations:**
- Edge count alone doesn't indicate quality — some relationships may be weak or redundant
- Solo practitioner context — no evidence this scales to teams
- No baseline comparison yet (12-task eval corpus designed, baseline sealed, comparator pending)

**Prepared response if challenged:**
"The edge count is more interesting than the anti-pattern count because it measures
relationships, not just entries. When one anti-pattern strengthens, supersedes, or narrows
another, that's a typed edge the agent can query at decision time. 200+ isolated rules
are a catalog; ~5K edges between them are a network. The eval framework I built — 12 tasks,
LLM-as-judge, bare baseline vs full system — is designed to test whether the agent actually
uses this network. The honest answer is I don't have results yet. The next deliverable
is a number, not a feature."

## 2. Role Scope Precision

**What was mine:**
- All design decisions: token naming, component API design, interaction patterns,
  information architecture, visual hierarchy
- The collaboration architecture: all 18 skills, the feedback loop structure, the
  escalation protocol, the anti-pattern catalogs, the knowledge graph, the eval framework
- Content strategy: case study thesis, section structure, voice calibration, narrative
  arc, portfolio coherence framework
- All content writing: blurb, scope, section bodies (refined through the collaboration
  architecture)

**What was shared (human + AI agent):**
- Component implementation: I designed the component API and behavior, the AI agent
  wrote the implementation code, I reviewed and corrected through the feedback loop
- Documentation: I established the structure and principles, the agent maintained and
  updated docs through the skill system
- Quality gates: I defined the checks, the agent executed them, I verified the results

**What was the agent's:**
- Code execution: writing TypeScript, SCSS, React components
- Documentation maintenance: updating feedback logs, anti-pattern catalogs
- Build/deploy operations: running dev servers, publishing packages
- All engineering infrastructure: Turbopack configuration, CMS schema, build pipeline

**What was NOT mine:**
- The underlying AI model capabilities (Claude, Cursor)
- The open-source libraries (Radix UI, Framer Motion, Geist)
- The frameworks and tools (Next.js, Payload CMS, SCSS)

## 3. Strategic Omission Inventory

**Employment type:** This is a portfolio/personal project, not an employer project.
The case study does not hide this - "Sole designer and engineer" and "2026 - Present"
make it clear. But the framing emphasizes the design methodology and systems thinking,
not the employment context.

**Prepared response if asked "Is this a real product?":**
"It's a real design system used across three applications, published as an npm package.
The interesting part isn't the product - it's the apparatus around it. I built a system
where a designer and an AI agent co-evolve design quality over time. The 200+ anti-patterns,
18 skills, and a ~5K-edge knowledge graph are real artifacts from real design sessions.
The methodology is what I'm demonstrating, not a product shipped to users."

**Team size:** Solo. No team management experience demonstrated here. Other case studies
(Lacework, Meteor) demonstrate team collaboration.

**Scale:** Three Next.js apps, one npm package. Not enterprise scale. Not millions of
users. The scale claim is in the methodology's compounding effect, not in user reach.

**Maturation confound:** The metric decline could partially reflect natural project
familiarity, not just meta-system effectiveness. The case study acknowledges this with
"honest caveats" but doesn't over-explain it in the portfolio text (luxury positioning).

## 4. Anticipated Probes

### "Isn't this just documentation? Every team documents their design decisions."

"Documentation is a necessary condition, not a sufficient one. Most design documentation
is write-once, read-never. The difference here is the escalation protocol. When
documentation failed to prevent the same error six times - I have the exact incident, a
playground verification that kept getting skipped - the system promoted it to a hard
constraint that the agent reads before acting. That's not documentation. That's a
feedback loop with teeth."

### "How is this different from writing a good design system README?"

"A README tells an agent what components exist. The meta-system tells an agent how to
think about design decisions. The 200+ anti-patterns aren't component docs - they're
encoded design judgment. Things like 'never use inline style attributes' or 'never treat
repeated complaints incrementally - 3+ in the same category means the root cause is
architectural.' A README doesn't get smarter over time. This does."

### "Can this scale beyond one designer and one AI agent?"

"Honest answer: I don't know. The current system is optimized for a solo practitioner.
The feedback loop assumes one designer's taste as the source of truth. With multiple
designers, you'd need conflict resolution for contradictory corrections - designer A
says 'more spacing' while designer B says 'tighter.' The escalation protocol would need
a voting mechanism or authority hierarchy. That's a real open question I haven't solved."

### "The industry is moving toward MCP servers and component manifests. Isn't your approach orthogonal to where things are going?"

"It's complementary, not orthogonal. MCP servers solve distribution - how to make an
existing system readable to any agent. The collaboration architecture solves creation -
how to build a system where the agent's judgment improves over time. A team could use
both: MCP for broad agent access to components, and something like this meta-system for
the design team's own agent workflow. I don't think it's either/or."

### "What happens when you stop working on it? Does the system decay?"

"The anti-patterns and guardrails are static knowledge - they persist regardless of
activity. The feedback loops only generate new knowledge when someone is actively working.
So the system doesn't decay, but it also stops growing. The interesting question is
whether the accumulated knowledge is transferable - could another designer pick up the
meta-system and continue evolving it with their own corrections? I think yes, because the
escalation protocol is explicit about thresholds and promotion criteria. But I haven't
tested it."
