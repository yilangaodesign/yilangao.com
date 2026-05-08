# Maya Chen — User Persona

---

**Maya Chen**
**Title:** Engineering Lead, Applied AI
**Company:** Mid-to-large tech company with a dedicated AI/ML organization

**Team:** 25 engineers and researchers building and deploying customer-facing AI agents. The team has grown from 8 to 25 over the past two years. Several original members have left. Three joined in the last quarter.

**Authority:** Maya has admin-level permissions across the team's shared workspace. She can restructure, archive, rename, and set organizational standards for the entire team. She reports to the VP of Engineering and is accountable for the team's output quality, deployment reliability, and knowledge continuity.

**How she got here:** Maya was promoted to lead six weeks ago after the previous lead left for another company. She was an individual contributor on the team for a year before that — deep in the work, but only exposed to her own corner of it. Now she's responsible for the whole picture.

**The mess she inherited:** 600+ documents accumulated over two years across experiment logs, eval reports, prompt libraries, architecture decision records, deployment postmortems, integration notes, model cards, incident reports, research notes, meeting notes, and runbooks. No naming conventions. Minimal folder structure. Multiple people wrote docs about the same topic using different terminology. Some docs are current. Some were superseded months ago but never archived. Some are duplicates nobody noticed. The previous lead kept the map in his head. That map left with him.

**Jobs to be done:**

*Primary:* "I have a roadmap review with the VP on Thursday. I need to understand what the team has shipped, what's in progress, what failed, and why — without scheduling five 1:1s to piece together the story."

*Secondary:* "Production incident just fired. I need to know in 30 seconds: have we seen this before, what caused it last time, what did we change, and did the fix hold — instead of pinging three engineers who may or may not remember."

*Tertiary:* "I'm preparing for sprint planning. I need to see which projects have stalled, which have open decisions that were never resolved, and which have docs that contradict each other — so I can walk in with an agenda, not questions."

*Ongoing:* "When a new engineer joins, they should be able to self-serve their way to the current state of any project without booking time on my calendar."

*Latent:* "Eventually, the way we organize this knowledge should make it consumable by our own agents — not just by humans browsing folders."

**What she values:**
- Speed over perfection. A good-enough organization she can refine is better than a perfect taxonomy that takes weeks to build.
- Evidence over intuition. She wants to see why the system grouped things a certain way, not just trust it.
- Low input, high output. She doesn't want to spend hours teaching the system before seeing a result. Show her a default, let her correct.
- Reasoning on demand. She doesn't want confidence scores, clustering metadata, or AI rationale cluttering her default view. But she always wants the option to drill down. When a grouping looks wrong, she needs to understand why the system made that call — so she can correct it precisely, not blindly. The reasoning layer should be one click away, never zero clicks away.

**What she fears:**
- Breaking something. Moving 600 documents around could disrupt her team's existing workflows and bookmarks. People will complain if their stuff moves.
- Missing something important. Archiving a doc that turns out to be the only record of a critical decision.
- Wasting time on a reorganization that doesn't stick. If the system doesn't maintain itself, the workspace returns to chaos in three months.
- Looking uninformed. She's six weeks into leading a team she didn't build. Walking into a meeting without context on a project her team owns is the fastest way to lose credibility.

**What she doesn't care about:**
- Perfect folder hierarchies. She's not building a library. She needs findability, not beauty.

**Behaviors:**
- Searches before browsing. Her instinct is to type a query, not navigate a tree. But she knows her new teammates don't always know what to search for.
- Scans fast, reads slow. She'll skim a list of 50 documents in seconds but spend 10 minutes on one that matters.
- Corrects by exception. She won't review every suggestion. She'll spot-check the ones that look wrong and approve the rest in bulk.
- Prepares in bursts. Her engagement with the knowledge base spikes before meetings, after incidents, and during planning — not as a daily habit. The system needs to be useful in 5-minute windows, not hour-long organizing sessions.
- Drills down when trust breaks. Most of the time she accepts the system's output at face value. But the moment something feels off — a document grouped in a cluster it doesn't belong in, a staleness flag she disagrees with — she shifts into investigative mode. That's when she wants the confidence score, the clustering rationale, the signals the system used. The transition from trusting to verifying should be seamless, not a mode switch.

**Success looks like:**

Thursday morning, 45 minutes before the VP review. Maya opens the workspace. She sees the Atlas project cluster — 4 postmortems, 12 experiment logs, 3 ADRs, current eval results, all connected. She traces the thread: the hallucination incident in March led to the chunking ADR in December, which led to retrieval-v2, which is currently showing a 15% improvement in the latest eval. She walks into the meeting and presents the arc without having asked anyone. The VP asks about the PII incident. Maya pulls it up, sees it's linked to the guardrails project, sees the prompt fix that followed, sees the eval showing the fix held. She answers in real time.

She never organized a single folder. The system surfaced the structure that was already latent in the documents. She corrected a few groupings that looked wrong, archived 40 stale docs the system flagged, and merged two duplicate runbooks. Total active time: under an hour across the week. The rest was the system working from her corrections.

A new engineer joins next month. Without asking Maya, they find the current system prompt, the latest eval, the deployment runbook, and the March postmortem — all within their first hour. That's the byproduct, not the goal.
