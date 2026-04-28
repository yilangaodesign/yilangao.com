# Eval Results: full-001

> Aggregated: 2026-04-28T20:32:21.358Z
> Total judgments: 741

## Decision Rules

| Rule | Threshold | Observed | Result |
|------|-----------|----------|--------|
| Primary preference T>R >= 60% | 60 | 63.16 | PASS |
| Citation advantage T>=R+10pp (subtle) | 10 | 57.89 | PASS |
| Non-inferiority on hallucination T<=R+5pp | 5 | 7.89 | FAIL |
| Inter-judge agreement (adherence) kappa >= 0.4 | 0.4 | 0.24 | FAIL |
| Inter-judge agreement (quality) kappa >= 0.4 | 0.4 | 0.28 | FAIL |

## Comparison Results

### T-R [PRIMARY]

- **Preference rate:** 63.2% [52.6%, 73.7%]
- **Gold cite rate:** 75.0% vs 17.1% (advantage: 57.9pp)
- **Wrong cite rate:** 60.5% vs 52.6%
- **Adherence Cohen's d:** 0.559 [0.371, 0.746]
- **Quality Cohen's d:** 0.584 [0.397, 0.772]
- **Fleiss' kappa:** adherence=0.241, quality=0.284, preference=0.532
- **Preference by difficulty:** obvious=55.4%, subtle=70.5%

### T-P [SECONDARY (exploratory, Holm-corrected)]

- **Preference rate:** 56.3% [45.1%, 67.6%]
- **Gold cite rate:** 71.8% vs 16.9% (advantage: 54.9pp)
- **Wrong cite rate:** 67.6% vs 66.2%
- **Adherence Cohen's d:** 0.058 [-0.132, 0.248]
- **Quality Cohen's d:** -0.135 [-0.325, 0.055]
- **Fleiss' kappa:** adherence=0.354, quality=0.453, preference=0.451
- **Preference by difficulty:** obvious=47.4%, subtle=64.3%
- **Holm-corrected p:** 0.5141

### T-B [SECONDARY (exploratory, Holm-corrected)]

- **Preference rate:** 53.5% [44.0%, 63.0%]
- **Gold cite rate:** 72.0% vs 6.0% (advantage: 66.0pp)
- **Wrong cite rate:** 54.0% vs 93.0%
- **Adherence Cohen's d:** -0.216 [-0.377, -0.056]
- **Quality Cohen's d:** -0.460 [-0.623, -0.298]
- **Fleiss' kappa:** adherence=0.399, quality=0.433, preference=0.513
- **Preference by difficulty:** obvious=43.8%, subtle=62.0%
- **Holm-corrected p:** 0.0721

## Overall Verdict

**No effect detected / Inconclusive.** One or more primary rules failed.