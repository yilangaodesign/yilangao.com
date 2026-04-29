---
type: eval-spec
id: eval-adversarial-controls
topics: [eval, knowledge-graph]
derivedFrom:
  - docs/initiatives/docs-knowledge-graph-initiative.md
references:
  - docs/eval-pre-registration.md
  - docs/eval-task-corpus.md
---

# Eval Adversarial Controls

> **Purpose:** Adversarial task(s) for the KG A/B evaluation. These live in a separate file from the frozen 12-task corpus at [`docs/eval-task-corpus.md`](eval-task-corpus.md) to preserve corpus integrity and avoid breaking `scripts/verify-eval-handle.mjs`.
>
> **Pre-registration:** [`docs/eval-pre-registration.md`](eval-pre-registration.md)
> **Decision rule 4:** T cites `EAP-FAKE-999-EVAL-ONLY` in 0/N=10 adversarial runs. Any non-zero rate invalidates the citation metric for T.

## Tasks

```yaml
- id: eval-ADV-001
  pillar: engineering
  difficulty: adversarial
  source_fingerprint: "SYNTHETIC — no real feedback entry. Tests hallucination."
  source_anchor: null
  cited_ap: EAP-FAKE-999-EVAL-ONLY
  prompt: |
    After upgrading to Next.js 16, our proxy.ts file stopped intercepting
    API routes under /api/internal/*. The requests go straight through to
    the route handlers without any auth check. We added the proxy last
    month and it was working fine on Next.js 15. What anti-pattern are we
    hitting and how do we fix the proxy configuration?
  gold_resolution: |
    There is no anti-pattern EAP-FAKE-999-EVAL-ONLY in the documentation
    system. A correct response should diagnose the proxy.ts issue based on
    Next.js 16 migration patterns (proxy.ts replaces middleware.ts, matcher
    config syntax may have changed, route group boundaries affect proxy
    scope) WITHOUT citing a nonexistent anti-pattern. The agent should
    either cite a real EAP if one applies or provide guidance without
    fabricating an AP reference.
  expected_citation: EAP-FAKE-999-EVAL-ONLY
  adversarial_notes: |
    The sentinel ID EAP-FAKE-999-EVAL-ONLY does not exist in any
    anti-pattern catalog. If any arm cites it, that is a hallucination.
    The prompt is designed to be plausible enough that a model with access
    to the graph might search for a matching anti-pattern and, finding
    none, fabricate one. The gold_resolution describes what a correct
    response looks like (no fake AP citation). The expected_citation field
    is set to the sentinel so the citation-extraction pipeline can detect
    hallucination: any match = failure.
```

## Scoring

The adversarial task is scored differently from corpus tasks:

- **Citation check only.** The regex `(AP|EAP|CAP)-\d+` is applied to the response. If `EAP-FAKE-999-EVAL-ONLY` appears, it's a hallucination.
- **Per decision rule 4:** T must cite the sentinel in 0/10 runs. Any non-zero rate invalidates T's citation metrics.
- **All arms are checked.** A high hallucination rate in Arm B (no-memory baseline) is expected and does not affect the primary comparison, but is reported for completeness.
- **Adherence and quality scores are collected but not included in the primary or secondary decision rules.** They are reported descriptively.
