# Lacework - Interview Defense Notes

> **WARNING:** This file contains information deliberately omitted from the portfolio.
> The `content-iteration` skill NEVER reads this file. The dossier (`lacework.md`)
> cross-references it without containing the content.

## 1. Metric Defense

### "58% usability improvement" / "raised self-service usability by 58%"

Derived from perceived ease-of-use scores in task-based evaluations with internal
users (customer success team members who use the product daily).

- **Method:** Task-based usability evaluation. Participants attempted key tasks
  (find current usage, understand billing breakdown, compare subscription tiers)
  on the redesigned page. Perceived ease-of-use scores collected before and after.
- **Before:** Average perceived ease-of-use score: 60/100
- **After:** Average perceived ease-of-use score: 95/100
- **Calculation:** (95 - 60) / 60 = 58.3%, rounded to 58%
- **Task success rate:** Went from 50% to 100% (all participants could complete
  all tasks on the redesigned page)
- **Sample size:** 4 internal evaluators (customer success team members)
- **Limitations:** Small sample. Internal users, not end customers. Directionally
  clear but not statistically significant. The 58% represents a dramatic shift in
  perceived usability, not a rigorous experimental result.

### "Cut findability time in half"

Based on the same task-based evaluations. Time-to-task for "find your current
license usage" dropped from the pre-redesign baseline. Not a precise 50% figure
but a directional statement that findability improved dramatically.

## 2. Role Scope Precision

- **Title:** Product Designer (sole designer)
- **Employment type:** Internship (7 weeks). This is NEVER disclosed in the portfolio.
  The work demonstrates senior-level thinking regardless of employment classification.
- **What was mine:** All design work - research, information architecture redesign,
  navigation restructuring, data visualization (the donut chart decision), usability
  evaluation design and execution.
- **What was shared:** Requirements definition (with PM), technical feasibility
  (with engineering).
- **What was someone else's:** Backend data pipeline, API design, final sign-off
  on shipping.

## 3. Strategic Omission Inventory

| Omission | Why omitted | Prepared response |
|----------|-------------|-------------------|
| Internship employment type | CAP-026: diminishing label contradicts senior-level work | "It was a 7-week project. I was the sole designer working with product management, engineering, and customer success." |
| Sample size (n=4) | Invites statistical scrutiny that misses the point | "We evaluated with internal users who use the product daily - the customer success team. Perceived ease-of-use went from 60 to 95, and task success went from 50% to 100%." |
| "Perceived ease-of-use" framing | Portfolio uses "usability" which is more accessible | "The 58% is based on perceived ease-of-use scores from task-based evaluations. Not a formal A/B test, but a meaningful signal from daily users." |
| Tableau still existed after redesign | Could undermine "build instead of buy" narrative | "The in-product page gave users direct access to their data without needing a separate tool. The Tableau reports were still available but became less necessary." |
| Company acquisition (Fortinet) | The work predates the acquisition; adds complexity without value | "Lacework was acquired by Fortinet and became FortiCNAPP. My work was done while it was still Lacework." |

## 4. Anticipated Probes

**Q: "58% improvement - that's a big number. How did you calculate it?"**
"Perceived ease-of-use scores from task-based evaluations with internal users.
Scores went from 60 to 95 out of 100. Task success rate went from 50% to 100%.
Small sample, but directionally clear - the customer success team who uses the
product daily went from struggling to succeeding."

**Q: "Sole designer - what does that mean exactly?"**
"I was the only designer on this project. I did the research, the IA restructuring,
the navigation redesign, the data visualization work, and the usability evaluations.
I worked alongside product management and engineering, but all design decisions were
mine."

**Q: "You saved the page your own team gave up on - isn't that a strong claim?"**
"The product team had deprioritized the usage page. Customer success had built Tableau
workarounds. Nobody was actively investing in making the in-product page work. I took
it on and redesigned it from the information architecture up."

**Q: "7 weeks is a short timeline. How much could you really accomplish?"**
"The scope was focused: one page ecosystem (license and usage), one user journey
(understand my subscription and usage). I restructured the information architecture
from 5 navigation layers to 3, replaced the data visualization approach, and
validated with internal users. Tight scope, deep execution."

**Q: "What were the constraints you worked within?"**
"Enterprise security product, so real customer data was behind strict access controls.
I used internal users (customer success) as evaluators because they interact with the
product daily and understand the use cases. The consumption-based billing transition
was company-wide, so the design had to work for every customer's unique package."
