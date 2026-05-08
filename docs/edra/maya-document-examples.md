# Maya's Document Examples

> **Live data:** These documents are seeded into Supabase as the `edra_documents` table (**200 rows**, full metadata model) with a relational `edra_document_links` junction table (**137 links**). The prototype queries from there — this file is the human-readable reference copy showing the original 55 curated examples.
>
> - **Full seed:** `edra-challenge/scripts/seed-documents-full.mjs` (200 docs, persona-grounded)
> - **Links:** `edra-challenge/scripts/seed-links.mjs` (137 relational links across 6 types)
> - **TS types:** `edra-challenge/src/lib/supabase.ts` (`Document`, `DocumentLink`)
> - **Re-seed:** `node edra-challenge/scripts/seed-documents-full.mjs && node edra-challenge/scripts/seed-links.mjs`
>
> **Stats:** 200 docs across 11 categories | 24 orphaned (departed authors) | 20 stale-but-not-archived | 6 near-duplicate pairs | 65% of docs connected via links

Sample documents from Maya's 600+ workspace, organized by document type. Each entry includes its assigned tags on a separate line.

---

## Experiment Logs

- **Fine-tuning Haiku on claims dataset v3 — results**
  `fine-tuning` `haiku` `claims` `insurance` `dataset` `project-claimsbot` `meeting:claimsbot-kickoff-jan15` `meeting:weekly-sync-jan21`

- **RAG vs long-context comparison for support agent**
  `rag` `context-window` `support-agent` `architecture` `project-atlas` `meeting:atlas-architecture-review-nov8` `meeting:weekly-sync-nov13`

- **Temperature sweep 0.1–0.7 on routing classifier**
  `hyperparameter` `routing` `classifier` `tuning` `project-atlas` `meeting:atlas-standup-dec4`

- **Embedding model comparison: voyage vs openai vs cohere**
  `embeddings` `model-selection` `retrieval` `vendor-comparison` `project-retrieval-v2` `meeting:retrieval-v2-kickoff-oct22` `meeting:vendor-eval-oct29`

- **Multi-turn memory retention test — 50 conversation pairs**
  `memory` `multi-turn` `conversation` `evaluation` `project-atlas` `meeting:atlas-eval-review-mar17`

---

## Eval Reports

- **Weekly eval: support agent accuracy (Apr 28)**
  `eval` `support-agent` `accuracy` `weekly-cadence` `project-atlas` `meeting:weekly-sync-apr28`

- **Regression analysis post-deployment v2.4**
  `regression` `deployment` `v2.4` `quality-check` `project-atlas` `meeting:atlas-postdeploy-review-feb10` `meeting:weekly-sync-feb11`

- **Human vs auto-eval agreement rates Q1**
  `eval-methodology` `human-eval` `auto-eval` `agreement` `project-eval-framework` `meeting:eval-framework-review-apr2` `meeting:quarterly-review-apr7`

- **Hallucination rate by query category — March**
  `hallucination` `safety` `query-type` `monthly-cadence` `project-guardrails` `meeting:guardrails-standup-mar31` `meeting:weekly-sync-apr7`

- **Agent performance: structured vs unstructured inputs**
  `eval` `input-format` `structured-data` `agent-performance` `project-atlas` `meeting:atlas-eval-review-mar17`

---

## Prompt Libraries

- **System prompt: customer support agent (CURRENT)**
  `prompt` `support-agent` `production` `current` `project-atlas` `meeting:atlas-prompt-review-apr14`

- **System prompt: support agent (old — do not use)**
  `prompt` `support-agent` `deprecated` `archived` `project-atlas` `meeting:atlas-prompt-review-feb3`

- **Few-shot examples for refund classification**
  `few-shot` `refund` `classification` `prompt-engineering` `project-atlas` `meeting:atlas-standup-dec11`

- **Chain-of-thought template for escalation routing**
  `cot` `escalation` `routing` `prompt-engineering` `project-atlas` `meeting:atlas-architecture-review-nov8`

- **Jailbreak resistance prompt — v3 draft**
  `safety` `jailbreak` `guardrails` `draft` `project-guardrails` `meeting:guardrails-sprint-planning-mar3`

---

## Architecture Decision Records

- **ADR-017: Why we chose RAG over fine-tuning**
  `rag` `fine-tuning` `architecture` `decision` `project-retrieval-v2` `meeting:retrieval-v2-kickoff-oct22` `meeting:all-hands-nov1`

- **ADR-021: Switching to chunking by semantic boundary**
  `chunking` `retrieval` `semantic` `architecture` `project-retrieval-v2` `meeting:retrieval-v2-design-review-nov19`

- **ADR-024: Separate retrieval model vs shared embeddings**
  `retrieval` `embeddings` `architecture` `decision` `project-retrieval-v2` `meeting:retrieval-v2-design-review-dec3`

- **ADR-029: Moving eval pipeline to async**
  `eval-pipeline` `infrastructure` `async` `performance` `project-eval-framework` `meeting:eval-framework-review-jan27`

- **Why we dropped LangChain — notes from Tomás**
  `langchain` `framework` `migration` `decision` `project-atlas` `meeting:atlas-retro-sep15`

---

## Deployment Postmortems

- **Postmortem: agent hallucinating after KB update (Mar 12)**
  `hallucination` `knowledge-base` `deployment` `incident` `project-atlas` `meeting:incident-review-mar13` `meeting:weekly-sync-mar17`

- **Postmortem: latency spike during peak traffic**
  `latency` `scaling` `production` `infrastructure` `project-atlas` `meeting:incident-review-jan8`

- **Postmortem: wrong refund amount — chunking overlap issue**
  `chunking` `refund` `retrieval-error` `incident` `project-retrieval-v2` `meeting:incident-review-nov25` `meeting:retrieval-v2-design-review-dec3`

- **Root cause: agent ignoring updated return policy**
  `knowledge-base` `staleness` `policy` `retrieval` `project-kb-sync` `meeting:kb-sync-standup-feb24`

- **Incident debrief: PII leak in agent response**
  `pii` `safety` `privacy` `incident` `project-guardrails` `meeting:incident-review-mar20` `meeting:guardrails-sprint-planning-mar24`

---

## Integration Notes

- **Client A onboarding: SSO quirks and workarounds**
  `client-a` `sso` `authentication` `onboarding` `project-enterprise-rollout` `meeting:client-a-kickoff-oct1`

- **Client B: custom taxonomy mapping for their ticket system**
  `client-b` `taxonomy` `ticketing` `customization` `project-enterprise-rollout` `meeting:client-b-onboarding-nov5`

- **Client C data pipeline — known encoding issues**
  `client-c` `data-pipeline` `encoding` `bug` `project-enterprise-rollout` `meeting:client-c-troubleshooting-feb19` `meeting:weekly-sync-feb24`

- **HubSpot integration: field mapping reference**
  `hubspot` `integration` `field-mapping` `reference` `project-integrations` `meeting:integrations-planning-dec9`

- **Zendesk webhook setup — what actually works**
  `zendesk` `webhook` `integration` `workaround` `project-integrations` `meeting:integrations-planning-jan13`

---

## Model Cards and Capability Inventories

- **Model card: Sonnet 4 for classification tasks**
  `sonnet` `classification` `model-card` `capabilities` `project-model-registry` `meeting:model-eval-roundtable-mar10`

- **Model card: Haiku for high-volume routing**
  `haiku` `routing` `throughput` `model-card` `project-model-registry` `meeting:model-eval-roundtable-mar10`

- **Opus vs Sonnet cost-performance tradeoff matrix**
  `opus` `sonnet` `cost` `model-selection` `project-model-registry` `meeting:quarterly-review-apr7` `meeting:budget-review-apr9`

- **Known failure modes: Sonnet on ambiguous instructions**
  `sonnet` `failure-modes` `ambiguity` `limitations` `project-model-registry` `meeting:atlas-eval-review-mar17`

- **Model selection guide — when to use what**
  `model-selection` `guide` `reference` `decision` `project-model-registry` `meeting:all-hands-apr1`

---

## Incident Reports

- **Agent gave medical advice to customer (May 1)**
  `safety` `out-of-scope` `medical` `incident` `project-guardrails` `meeting:incident-review-may2`

- **Agent applied wrong discount — 40% instead of 4%**
  `accuracy` `numerical-error` `discount` `incident` `project-atlas` `meeting:incident-review-apr21` `meeting:weekly-sync-apr21`

- **Customer received contradictory answers in same session**
  `consistency` `multi-turn` `contradiction` `incident` `project-atlas` `meeting:atlas-standup-apr15`

- **Agent bypassed escalation on billing dispute**
  `escalation` `billing` `routing-failure` `incident` `project-atlas` `meeting:incident-review-mar27`

- **False positive: flagged normal transaction as fraud**
  `false-positive` `fraud-detection` `precision` `incident` `project-claimsbot` `meeting:claimsbot-review-feb5`

---

## Research Notes

- **Paper summary: Constitutional AI implications for our guardrails**
  `constitutional-ai` `safety` `guardrails` `research` `project-guardrails` `meeting:guardrails-sprint-planning-mar3`

- **Notes from Anthropic cookbook on tool use patterns**
  `tool-use` `anthropic` `patterns` `reference` `project-atlas` `meeting:atlas-standup-feb18`

- **Competitor analysis: how Moveworks handles KB updates**
  `competitor` `moveworks` `knowledge-base` `analysis` `project-kb-sync` `meeting:quarterly-review-jan6`

- **Ideas from NeurIPS — retrieval augmented generation panel**
  `neurips` `rag` `research` `ideas` `project-retrieval-v2` `meeting:retrieval-v2-kickoff-oct22`

- **Samira's notes on graph-based memory architectures**
  `graph` `memory` `architecture` `research` `project-retrieval-v2` `meeting:retrieval-v2-design-review-nov19`

---

## Meeting Notes and Standup Logs

- **Weekly sync — Apr 28**
  `sync` `weekly-cadence` `team-updates` `status` `project-atlas` `project-guardrails` `meeting:weekly-sync-apr28` `references:weekly-eval-apr28` `references:agent-discount-incident`

- **Sprint retro: what broke in the eval pipeline**
  `retro` `eval-pipeline` `process` `lessons` `project-eval-framework` `meeting:eval-framework-retro-feb17` `references:ADR-029`

- **Design review: new evidence panel UI**
  `design-review` `evidence-panel` `ui` `frontend` `project-atlas` `meeting:atlas-design-review-apr10` `references:hallucination-postmortem-mar12`

- **Brainstorm: how to handle multilingual KB**
  `multilingual` `knowledge-base` `ideation` `i18n` `project-kb-sync` `meeting:kb-sync-brainstorm-mar5` `references:client-b-taxonomy-mapping`

- **Standup notes — Tomás OOO, blocked on client C data**
  `standup` `client-c` `blocker` `status` `project-enterprise-rollout` `meeting:enterprise-standup-feb20` `references:client-c-encoding-issues`

---

## Runbooks

- **How to deploy a new model to production**
  `deployment` `model` `production` `how-to` `project-atlas` `meeting:atlas-onboarding-session-sep8`

- **Rolling back a release — step by step**
  `rollback` `release` `production` `how-to` `project-atlas` `meeting:incident-review-jan8` `references:latency-spike-postmortem`

- **New client onboarding checklist**
  `onboarding` `client` `checklist` `how-to` `project-enterprise-rollout` `meeting:enterprise-process-review-dec15`

- **How to re-run evals after KB change**
  `eval` `knowledge-base` `rerun` `how-to` `project-eval-framework` `meeting:eval-framework-review-jan27`

- **Setting up a new VPC for enterprise client**
  `vpc` `enterprise` `infrastructure` `how-to` `project-enterprise-rollout` `meeting:enterprise-process-review-dec15`
