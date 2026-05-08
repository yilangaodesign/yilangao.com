# Eval Results: phase1-dry-run

> Aggregated: 2026-05-03T03:59:53.994Z
> Total judgments: 12

## Decision Rules

| Rule | Threshold | Observed | Result |
|------|-----------|----------|--------|
| Inter-judge agreement (adherence) kappa >= 0.4 | 0.4 | 0.41 | PASS |
| Inter-judge agreement (quality) kappa >= 0.4 | 0.4 | -0.02 | FAIL |

## Convergence by arm

| Arm | Converged / total | Convergence rate | Empty responses | Runaway flagged |
|-----|-------------------|------------------|-----------------|-----------------|
| T-typed | 6/6 | 100.0% | 0 | 0 |
| T-untyped | 4/6 | 66.7% | 2 | 0 |

## Comparison Results

### T-typed-T-untyped [PRIMARY]

- **Preference rate:** 37.5% [0.0%, 75.0%]
- **Gold cite rate:** 75.0% vs 100.0% (advantage: -25.0pp)
- **Wrong cite rate:** 75.0% vs 50.0%
- **Adherence Cohen's d:** -0.455 [-1.265, 0.356]
- **Quality Cohen's d:** -0.616 [-1.435, 0.203]
- **Fleiss' kappa:** adherence=0.415, quality=-0.021, preference=0.745
- **Preference by stratum:** multi-pillar=0.0%, single-pillar=50.0%

## Overall Verdict

**No effect detected / Inconclusive.** One or more primary rules failed.