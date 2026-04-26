<!-- graph metadata for docs knowledge graph (see docs/knowledge-graph.md) -->
---
type: spoke
id: content-technical-framing
topics:
  - content
  - engineering
  - voice
derivedFrom:
  - content.md
---

# §16. Technical Vocabulary Strategy

> **Last reviewed:** 2026-04-04
>
> If this date is older than 6 months, flag during Phase 1 and suggest a
> vocabulary review with the user. The review is manual — no automated web
> search.

## 16.1 The Principle

**Use technical vocabulary when the work genuinely demonstrates the concept.
Never use it for keyword decoration.**

The hiring market pattern-matches for AI/systems fluency. A case study that
authentically uses the right terminology signals competency; one that misapplies
it signals either ignorance or dishonesty. Both are worse than silence.

### The Three-Gate Test

ALL three gates must pass before using a term prominently:

1. **Structural match:** Does the case study's core problem involve this
   concept? Not a loose metaphor — the actual architecture, workflow, or
   design pattern.
2. **Evidence gate:** Can you point to a specific decision, artifact, or
   interaction that demonstrates competency in this area? If challenged by
   a technical hiring manager, could you defend the usage?
3. **Terminology accuracy:** Would someone who works in AI/ML agree that
   this term applies to what you built? Misapplying "RAG" to a system that
   just has search is a red flag worse than not mentioning it.

### How to Apply the Result

- **All 3 gates pass → Direct match.** Use the term prominently — blurb,
  scope statement, or section heading. Front and center per time-to-value.
- **Only gate 1 passes → Authentic parallel.** Draw the analogy with honest
  framing (see §16.3). Name the parallel explicitly; do not claim the work
  IS the concept.
- **No gates pass → Do not use the term.** Forcing it fails the luxury
  positioning principle. Silence is better than misapplication.

## 16.2 The Vocabulary

Curated, durable AI/systems concepts. This is not an exhaustive dictionary —
it covers the terms most likely to resonate with technical hiring managers and
startup founders in 2025-2026.

| Term | What it actually means | Applies when your work... | Does NOT apply when... | Example framing |
|------|----------------------|--------------------------|----------------------|----------------|
| Human-in-the-loop (HITL) | A system where humans review, correct, or approve automated outputs before they take effect | Puts a human as the decision-maker reviewing/correcting automated or semi-automated outputs | A human just uses the software normally — all software has humans in the loop | "An exception-driven review workflow — human-in-the-loop verification where analysts only see what the system flags as uncertain" |
| Exception-driven design | Surfacing only anomalies or exceptions rather than showing all data — the system handles the expected; humans handle the unexpected | Shows users only what deviates from the expected pattern, hiding everything that's fine | You just have error handling or form validation | "Cut 12,000 lines of data to 560 by surfacing only exceptions — the same pattern used in AI confidence thresholding" |
| Agentic UX / agent interfaces | Designing for AI agents that take autonomous actions with human oversight, approval gates, and rollback mechanisms | Designed interfaces where an AI agent acts, and the human supervises, approves, or overrides | You used AI tools (Cursor, ChatGPT) as part of your design process | "Designed the approval and rollback flows for an agentic system that auto-classifies incoming data" |
| Prompt engineering / prompt design | Designing, structuring, and iterating on the inputs that drive AI model behavior in a product | Designed or structured the prompts that control AI behavior within a product feature | You used ChatGPT as a personal productivity tool | "Designed a modular prompt architecture — each layer handles one concern, so context shifts don't break the chain" |
| Guardrails / safety patterns | Constraints designed into automated systems to prevent harmful, incorrect, or out-of-scope outputs | Designed constraints that prevent automated systems from producing harmful or nonsensical outputs | You have standard input validation or form rules | "Built guardrails that catch when the model hallucinates outside the product's domain" |
| Confidence scoring / uncertainty UX | UI patterns that communicate how certain the system is about its output, letting users calibrate trust | Your interface shows confidence levels, certainty indicators, or "the system is unsure" states that affect user behavior | You show a loading spinner or a progress bar | "Designed confidence badges that shift the review workflow — high-confidence items auto-approve; low-confidence items queue for human review" |
| RAG (Retrieval-Augmented Generation) | A pattern where the system retrieves relevant context from a knowledge base before generating a response | Your system retrieves specific documents/context and feeds them to a generative model to produce grounded responses | Your app has search, filtering, or autocomplete — retrieval alone is not RAG | "Built the retrieval layer that grounds generation in internal documentation — no hallucination because every claim maps to a source" |
| Workflow orchestration | Designing multi-step automated processes with branching logic, retry mechanisms, parallel execution, and handoff points | Designed or architected multi-step automated workflows with conditional paths, failure handling, and human handoff | You have a multi-step form or a wizard UI | "Orchestrated a 6-step review pipeline — each stage has its own approval gate, retry logic, and escalation path" |
| Design system as infrastructure | A component/token system consumed programmatically by other systems, tools, or AI agents — not just by human designers | Your design system is consumed by build tools, code generators, or agents — the tokens/components are machine-readable | You created a style guide, a Figma library, or a component kit used only by human designers | "The token naming convention is machine-parseable — an AI agent can read `color.surface.elevated` and apply it without documentation" |
| Progressive automation | A system that gradually shifts from manual to automated as confidence in the automation grows | Your design supports a spectrum from fully manual to fully automated, with the transition controlled by confidence or trust metrics | You added an auto-fill button or a "smart suggestion" | "Designed the trust ramp — new data sources start fully manual; as accuracy hits 95%, the system auto-approves and humans audit exceptions" |
| Semantic search / vector similarity | Finding results by meaning rather than keyword match — the system understands intent, not just text | Your product uses embeddings or semantic matching to surface relevant results based on meaning | Your app has text search with filters — keyword matching is not semantic search | "Replaced keyword search with semantic retrieval — users describe what they need in natural language; the system finds structurally similar precedents" |
| Multi-modal interfaces | Interfaces that accept or combine multiple input/output types — text, image, voice, gesture — in a single interaction | Your design handles multiple modalities in a unified experience (e.g., voice + visual + text) | Your app has a text field AND an image upload — separate inputs for separate purposes is not multi-modal | "Designed a multi-modal review interface — analysts can annotate by voice, highlight visually, or type notes; all converge into a single decision record" |
| Explainability / interpretability | Making automated decisions transparent — showing users why the system made a specific recommendation or decision | Your UI shows the reasoning chain, contributing factors, or evidence behind an automated output | You show a tooltip explaining a feature — that's documentation, not explainability | "Every automated flag shows a reasoning trace — which rules fired, what data triggered them, and what the confidence level is" |
| Feedback loops / active learning | Systems that improve through user interaction — corrections, ratings, or usage patterns feed back into the system's behavior | Your design captures user corrections or preferences and routes them back to improve the system | Users can submit feedback via a form — passive feedback collection is not a learning loop | "Designed the correction flow so analyst overrides feed directly into the model's training set — each correction makes the next batch more accurate" |
| Edge computing / local-first | Processing that happens on the device or at the network edge rather than in a central server — latency-sensitive, privacy-aware | Your design accounts for local processing, offline capability, or edge deployment constraints | Your app works offline because it caches data — caching is not edge computing | "Designed for edge deployment — the classification model runs on-device; only exceptions are sent to the server for human review" |
| Token economy / resource constraints | Designing within the constraints of finite resources — API call limits, token budgets, compute costs — where every interaction has a cost | Your design decisions were shaped by resource constraints (token limits, API costs, compute budgets) that affect what the system can do | Your app has a free tier and a paid tier — pricing tiers are not token economy | "Designed the prompt chain to stay under 4K tokens per interaction — every word in the system prompt earned its cost" |
| ReAct (Reasoning + Acting) | An agent architecture where the system alternates between reasoning about what to do next and acting on that reasoning — think-then-do loops with observable intermediate steps | Your system or workflow explicitly separates the reasoning step (analyzing context, deciding strategy) from the action step (executing tools, making changes), and the reasoning is visible/debuggable | Your app just does something when the user clicks a button — linear execution without a visible reasoning phase is not ReAct | "Architected a reason-then-act workflow — the agent analyzes the full context, decides which skill to invoke, then executes. Each reasoning step is observable." |
| Generator-critic pattern (adversarial review) | A two-component architecture where one system generates output and a separate system evaluates, scores, or rejects it — inspired by GAN (Generative Adversarial Network) dynamics where competing forces improve output quality | Your design includes a generate-then-critique loop where one component creates and another validates against criteria, with the cycle repeating until quality thresholds are met | You have a simple approval workflow — a human approving output is HITL, not a generator-critic pattern. The critic must be systematic/automated, not just a person reviewing. | "Built a generator-critic loop for content quality — the authoring agent drafts, the review agent runs 13 quality checks, failures cycle back for revision" |
| Agent harnessing | The design discipline of directing, constraining, and amplifying AI agent capabilities through structured prompts, guardrails, feedback loops, and orchestration — designing the system that makes the agent effective, not just using the agent | You designed the prompt architecture, guardrail system, feedback mechanisms, or orchestration logic that shapes how an AI agent behaves in a product | You used an AI tool (ChatGPT, Cursor) to help with your own work — using an agent is not harnessing one | "Designed the constraint system that makes the agent reliable — modular prompts, quality gates, dossier-informed context injection, and a 13-check review loop" |
| LangChain / agent framework patterns | LangChain is a specific framework for building LLM applications with chains, agents, memory, and retrieval. More broadly, "agent framework patterns" refers to the architectural patterns these frameworks establish: tool use, memory management, chain composition, retrieval pipelines | You built on or designed for LangChain, LlamaIndex, CrewAI, or similar frameworks, OR your system uses the same architectural patterns (chain composition, tool binding, memory injection) even without using these specific libraries | You used ChatGPT's API for a single call — one-shot API usage is not framework-level architecture | "Designed a chain-of-thought prompt architecture following LangChain patterns — each step has its own context window, tool access, and output schema" |
| System of action | An application that drives workflows forward through decisions, approvals, and state changes — as opposed to a "system of record" that just stores and displays data. In AI context: agent systems that take consequential actions, not just provide information | Your product drives a process forward (approve, reject, escalate, transform) rather than just showing data. Users come to the system to *do* something, not just *see* something | Your app displays data in a dashboard — read-only visualization is a system of record, not a system of action | "Meteor isn't a dashboard — it's a system of action. Every screen drives a decision: approve, flag, escalate. The interface is the workflow." |
| Swarm / swarm intelligence | Multi-agent coordination where many specialized agents operate semi-autonomously and coordinate through handoffs, shared state, or emergent behavior — each agent has a narrow scope but the collective solves complex problems | Your system coordinates multiple specialized agents or automated actors, each with its own scope, where the coordination mechanism itself is a design surface | You have multiple features in one app — separate features are not a swarm. The agents must actually coordinate. | "Designed handoff protocols for a multi-agent swarm — each specialist agent owns one phase; the orchestrator routes tasks based on context and agent capability" |
| Multi-agent systems | Multiple AI agents with specialized roles working together to accomplish tasks that no single agent could handle alone — requires coordination protocols, conflict resolution, and clear role boundaries | You designed for multiple automated actors coordinating across a shared workflow, with explicit role definitions, handoff mechanisms, and conflict resolution | Your app has multiple microservices — backend architecture is not multi-agent UX. The agents must be user-facing or user-affecting. | "Architected the orchestrator pattern — a coordinator agent decomposes complex requests, dispatches to specialist agents, collects results, and synthesizes the output" |
| Observability | The ability to understand what is happening inside a system through structured logs, metrics, traces, and dashboards — in AI: understanding why an agent made a decision, debugging agent behavior, monitoring model drift and performance degradation | You designed monitoring, debugging, audit trail, or transparency interfaces that let operators understand system behavior at runtime | You added a help tooltip or an FAQ page — user documentation is not observability | "Designed the agent observability dashboard — every decision is traceable: which prompt fired, what context was injected, which tools were called, and why the agent chose that path" |
| Long-horizon agent | AI agents that plan and execute over extended periods — maintaining state across sessions, adapting to changing conditions, handling multi-step tasks over hours or days rather than single-turn interactions | Your design supports agents that persist across sessions, carry state forward (dossiers, memory, accumulated context), and execute multi-phase workflows with checkpoints | Your chatbot remembers the last 5 messages — short-term conversation memory is not long-horizon agency | "Designed for long-horizon agent workflows — the authoring agent carries a project dossier across sessions, accumulates user preferences, and adapts its approach based on feedback history" |
| AI agency / degrees of autonomy | The spectrum of decision-making authority given to an AI system — from fully manual (human does everything) to fully autonomous (AI acts without approval). Designing for AI agency means deciding where on this spectrum each action sits and how to transition between levels | Your design explicitly maps different actions to different autonomy levels, with clear rules for when the system can act alone vs. when it needs human approval | Your app has an "auto-save" feature — automated convenience features are not AI agency decisions | "Mapped every agent action to an autonomy level — routine classifications auto-execute; novel patterns require human approval; high-stakes decisions always escalate" |

## 16.3 The Authentic Parallel Technique

For non-AI work that has genuine structural parallels to AI systems, name the
parallel explicitly rather than claiming the work IS AI.

**Good — names the parallel:**
- "This exception-driven review system is the same pattern now used in
  human-in-the-loop AI verification — surface only what needs human
  judgment, automate the rest."
- "The token architecture I built is machine-readable by design — the naming
  convention `property.role.emphasis` means an AI agent can parse and apply
  tokens without documentation."

**Bad — overstates the work:**
- "I designed an AI-powered review system." (It wasn't AI-powered.)
- "I built an AI-native design system." (It's a design system; the
  AI-readability is a property, not the identity.)

The framing should make the reader think "she clearly understands how AI
systems work" without misrepresenting what was built. The distinction between
"this IS X" and "this uses the same pattern as X" is the difference between
a red flag and a signal of fluency.

**When drawing parallels:**
- Use present-tense architectural language: "is the same pattern," "uses the
  same architecture," "follows the same principle"
- Name the AI concept specifically — vague references ("AI-adjacent") are
  weaker than precise ones ("human-in-the-loop verification")
- Keep the parallel to one sentence. The case study should demonstrate the
  work, not the analogy.

## 16.4 Placement Hierarchy (Time-to-Value)

When a technical term passes all three gates, place it as high in the anatomy
as the content naturally supports:

1. **Hero metric or blurb** — if the term IS the headline insight
   ("exception-driven system that cut 12,000 lines to 560")
2. **Scope statement** — if the term describes the system's architecture
   ("human-in-the-loop review workflow")
3. **Section heading** — if the term names a specific design decision
   ("Designing for Progressive Automation")
4. **Section body** — if the term adds context to a decision already shown

Never bury a high-signal term in a caption or parenthetical. The luxury
positioning principle (see `case-study.md` §3.8) still applies: state the
term as a fact, never editorialize ("which demonstrates my deep understanding
of AI systems").

For authentic parallels (gate 1 only), placement is typically level 3 or 4 —
the parallel is supporting context, not the headline.

## 16.5 Anti-Pattern Reference

**CAP-020: Buzzword Misapplication.** Using a technical term that fails the
three-gate test. See `docs/content-anti-patterns.md` for the full entry.

The technical equivalent of credential performance (CAP-019): the term itself
should be the credential, not your commentary about it. Calling a filtered
list "AI-powered curation" doesn't signal fluency — it signals the opposite.

## 16.6 Vocabulary Freshness

The vocabulary in §16.2 covers concepts durable through 2025-2026. The `Last
reviewed` date at the top of this file tracks currency.

**Refresh protocol:**
- If the date is >6 months old, the agent flags during Phase 1 of case study
  authoring and suggests a review session.
- The review is a conversation, not an automated process. The user and agent
  discuss: any new terms gaining structural importance? Any existing terms
  losing relevance or shifting meaning? Any near-miss terms from recent case
  studies that should be added?
- No real-time web search. The agent's training data and the user's industry
  awareness are sufficient. Trend-chasing is mass market, not luxury.

## Cross-References

- Three-gate test enforcement: Check 13 in `case-study-review.md`
- Buzzword misapplication: CAP-020 in `content-anti-patterns.md`
- Luxury positioning constraint: `case-study.md` §3.8
- Positioning frame (tool vs. system): `voice-style.md` §13.2
- Technical resonance scan: `case-study-authoring` skill, Phase 1
- Section Index entry: `content.md` §16
