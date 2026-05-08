---
type: eval-task-corpus
id: typing-corpus-test
fixture: true
references:
  - scripts/tests/fixtures/typing-eval-config-test.yaml
---

# Typing corpus — integration test fixture

> **Fixture, not real corpus.** Used by `scripts/tests/test-integration-phase1.mjs` to exercise the eval-runner / eval-judge / eval-aggregate pipeline with the Phase-1-shaped eval-config (T-typed vs T-untyped, multi-citation expected_citations, pillar stratification). Two tasks: one multi-pillar, one single-pillar.

## Tasks

```yaml
- id: int-T001
  pillar: multi-pillar
  difficulty: subtle
  source_fingerprint: "FIXTURE: synthetic D+E task for integration test"
  source_anchor: "fixture://int-T001"
  cited_ap: AP-066
  prompt: |
    [INTEGRATION TEST] Synthetic prompt; should not be sent to a model under
    normal test runs. The unit test bypasses generation by writing run JSONLs
    directly. Reaching this prompt means the harness is running real generation.
  gold_resolution: |
    [INTEGRATION TEST] Synthetic gold resolution.
  expected_citations: [AP-066, EAP-082]
  selection_rationale: |
    Multi-pillar (D+E) representative for typing-eval integration test.

- id: int-T002
  pillar: single-pillar
  difficulty: obvious
  source_fingerprint: "FIXTURE: synthetic single-pillar task for integration test"
  source_anchor: "fixture://int-T002"
  cited_ap: AP-072
  prompt: |
    [INTEGRATION TEST] Synthetic prompt; should not be sent to a model under
    normal test runs.
  gold_resolution: |
    [INTEGRATION TEST] Synthetic gold resolution.
  expected_citations: [AP-072]
  selection_rationale: |
    Single-pillar control for stratum coverage in integration test.
```
