# Future Migration Path: LangGraph

This document captures the LangGraph exploration findings from the orchestrator
design process (March 2026). It serves as a reference for when/if the
prompt-based orchestrator outgrows its design limits.

## Why We Explored LangGraph

The prompt-based orchestrator (v3.2) has known limitations:
- **Invisible control flow** — orchestration logic lives in markdown instructions,
  not executable code. Debugging means re-reading skill files.
- **State fragility at scale** — coordination relies on the agent's context window
  and structured text sections in responses. No persistent state between phases.
- **Risky evaluator loops** — a future evaluator agent that re-checks work could
  loop indefinitely without deterministic cycle control.
- **No tracing** — when something goes wrong in a multi-helper dispatch, there's
  no observability layer to reconstruct what happened.

## Why We Chose Prompt-Based for Now

LangGraph can't dispatch Cursor's native subagents (`Task` tool). It would need
its own LLM API keys, its own execution runtime, and its own agent definitions —
none of which can access Cursor's workspace rules, skill files, or MCP tools.

Specific blockers:
1. **Workspace rules don't transfer** — AGENTS.md, file-scoped rules, and skills
   are injected by Cursor into its own agents. External LangGraph agents wouldn't
   receive them.
2. **Infrastructure overhead** — running a LangGraph service requires LLM API
   keys, a Node.js process, checkpointing storage, and an observability layer
   (LangSmith). This is disproportionate at current scale (3-5 helpers, minutes
   not hours).
3. **Two systems to maintain** — a hybrid approach means orchestration logic
   split between Cursor skills and LangGraph graphs, increasing cognitive load.

## LangGraph.js Status (as of March 2026)

- `@langchain/langgraph` v2.0 released February 2026, TypeScript-native
- **Send API** for dynamic fan-out (maps to our parallel dispatch)
- **StateGraph** with typed state channels
- **Conditional edges** for routing decisions
- **Checkpointing** for state persistence across steps
- **Known JS gaps**: dynamic node/edge addition not supported, tool
  output/artifacts handling has open issues

## Architecture Mapping

Our Phase 1-6 maps to a LangGraph StateGraph:

| Orchestrator Phase | LangGraph Equivalent |
|--------------------|----------------------|
| Phase 1: Escalation check | Entry node with conditional edge |
| Phase 2: Decompose + plan | Node that produces task list in state |
| Phase 3: Dispatch | Send API for fan-out to parallel worker nodes |
| Phase 4: Collect + gates | Fan-in node with sequential gate checks |
| Phase 5: Synthesize docs | Documentation node reading from collected state |
| Phase 6: Verify + report | Terminal node with completion check |

The evaluator (future) would be a cyclic edge from Phase 4 back to a rework
node, with a max-iteration guard to prevent infinite loops.

## Migration Triggers

Reconsider LangGraph when any of these become true:
- **Evaluator agent needs deterministic loop control** — prompt-based "check and
  maybe re-dispatch" is too fragile for a real quality gate
- **Context window overflow during collection phase** — collecting 5+ helper
  responses with full draft documentation exceeds the context window
- **Need for observability/tracing across orchestration** — debugging multi-helper
  failures requires more than reading git diff
- **Scale exceeds 5+ concurrent helpers** — coordination complexity grows
  non-linearly; prompt-based dispatch becomes error-prone

## Integration Paths

### Path A: Full Migration
Replace Cursor-based orchestration entirely with a standalone LangGraph service.
- LangGraph handles routing, dispatch, collection, evaluation
- Cursor becomes a pure execution layer (receives instructions, returns results)
- **Pros**: clean architecture, full tracing, deterministic control flow
- **Cons**: loses Cursor workspace rules/skills, requires full agent redefinition,
  highest migration cost

### Path B: Hybrid via MCP
LangGraph service handles routing/evaluation decisions, exposed to Cursor via MCP.
Cursor handles execution.
- Requires `langchain-mcp-adapters` to bridge the two systems
- LangGraph decides what to do; Cursor agents do the work
- **Pros**: keeps Cursor's strengths (workspace rules, file access, skills),
  adds LangGraph's strengths (state, tracing, loop control)
- **Cons**: two systems to maintain, MCP bridge adds latency and a failure point

### Path C: Evaluator Only
Build only the evaluator gate as a LangGraph graph, exposed via MCP.
- The orchestrator remains prompt-based in Cursor
- After Phase 4, the orchestrator calls a LangGraph MCP tool that runs the
  evaluator graph (quality check → approve/rework decision)
- **Pros**: smallest migration surface, addresses the most pressing limitation
- **Cons**: still doesn't solve tracing or context overflow for the main flow

## Setup Notes

If exploring LangGraph in the future:

1. **`mcpdoc` MCP server** — configure it to feed LangGraph documentation into
   Cursor so the agent writes correct API calls:
   ```json
   {
     "mcpServers": {
       "langgraph-docs": {
         "command": "npx",
         "args": ["-y", "@anthropic/mcpdoc", "--urls",
           "https://langchain-ai.github.io/langgraphjs/llms.txt"]
       }
     }
   }
   ```

2. **LangSmith** — observability platform for tracing LangGraph executions.
   Essential for debugging multi-agent workflows. Free tier available.

3. **Separate project** — LangGraph exploration should happen in a dedicated
   repo, not in the main portfolio codebase. Migrate only after validation.

## Resources (Prioritized Reading List)

1. [LangGraph.js Docs](https://langchain-ai.github.io/langgraphjs/) — primary reference
2. [Multi-Agent Orchestration](https://langchain-ai.github.io/langgraphjs/concepts/multi_agent/) — closest to our architecture
3. [Send API (fan-out)](https://langchain-ai.github.io/langgraphjs/how-tos/send-map-reduce/) — parallel dispatch pattern
4. [Human-in-the-loop](https://langchain-ai.github.io/langgraphjs/concepts/human_in_the_loop/) — for evaluator pause/resume
5. [mcpdoc repo](https://github.com/langchain-ai/mcpdoc) — MCP bridge for docs
6. [LangSmith](https://smith.langchain.com/) — observability
7. [langchain-mcp-adapters](https://github.com/langchain-ai/langchain-mcp-adapters) — for Path B hybrid integration
