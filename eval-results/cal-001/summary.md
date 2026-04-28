# Eval Results: cal-001

> Aggregated: 2026-04-28T05:20:40.994Z
> Total judgments: 15

## Decision Rules

| Rule | Threshold | Observed | Result |
|------|-----------|----------|--------|
| Primary preference T>R >= 60% | 60 | 75.00 | FAIL |
| Citation advantage T>=R+10pp (subtle) | 10 | 0.00 | FAIL |
| Non-inferiority on hallucination T<=R+5pp | 5 | 0.00 | PASS |
| Inter-judge agreement (adherence) kappa >= 0.4 | 0.4 | -0.20 | FAIL |
| Inter-judge agreement (quality) kappa >= 0.4 | 0.4 | -0.20 | FAIL |

## Comparison Results

### T-R [PRIMARY]

- **Preference rate:** 75.0% [50.0%, 100.0%]
- **Gold cite rate:** 100.0% vs 100.0% (advantage: 0.0pp)
- **Wrong cite rate:** 50.0% vs 50.0%
- **Adherence Cohen's d:** 0.775 [-0.399, 1.948]
- **Quality Cohen's d:** 1.074 [-0.136, 2.285]
- **Fleiss' kappa:** adherence=-0.200, quality=-0.200, preference=1.000

### T-P [SECONDARY (exploratory, Holm-corrected)]

- **Preference rate:** 100.0% [100.0%, 100.0%]
- **Gold cite rate:** 100.0% vs 0.0% (advantage: 100.0pp)
- **Wrong cite rate:** 0.0% vs 100.0%
- **Adherence Cohen's d:** 2.041 [0.068, 4.015]
- **Quality Cohen's d:** 1.633 [-0.215, 3.481]
- **Fleiss' kappa:** adherence=-0.500, quality=1.000, preference=1.000
- **Holm-corrected p:** 0.2176

### T-B [SECONDARY (exploratory, Holm-corrected)]

- **Preference rate:** 50.0% [0.0%, 100.0%]
- **Gold cite rate:** 100.0% vs 50.0% (advantage: 50.0pp)
- **Wrong cite rate:** 50.0% vs 100.0%
- **Adherence Cohen's d:** -0.160 [-1.294, 0.973]
- **Quality Cohen's d:** 0.000 [-1.132, 1.132]
- **Fleiss' kappa:** adherence=0.000, quality=0.250, preference=0.455
- **Holm-corrected p:** 0.8551

## Overall Verdict

**No effect detected / Inconclusive.** One or more primary rules failed.