<!-- graph metadata for docs knowledge graph (see docs/knowledge-graph.md) -->
---
type: spoke
id: content-meteor-interview
topics:
  - content
  - projects
  - case-study
derivedFrom:
  - content.md
---

# Goldman Sachs Meteor - Interview Defense Notes

> **WARNING:** This file contains information deliberately omitted from the portfolio.
> The `content-iteration` skill NEVER reads this file. The dossier (`meteor.md`)
> cross-references it without containing the content.

## 1. Metric Defense

### "95% noise reduction" / "12,000 lines to 560"

The 95% headline metric and the "12,000 to 560" absolute anchor are derived from the
same underlying measurement: a single ETF basket review in Meteor versus the
equivalent workflow in spreadsheets.

- **Before:** A basket review required examining ~12,000 rows of data across multiple
  spreadsheets (positions, corporate actions, dividends, NAV calculations). Analysts
  checked every line because they had no way to distinguish expected values from
  exceptions.
- **After:** Meteor's exception-driven interface flags only the items that deviate from
  expected behavior. A typical basket surfaces ~560 items requiring human attention.
  The remaining ~11,440 rows are auto-validated and hidden.
- **Calculation:** (12,000 - 560) / 12,000 = 95.3%, rounded to 95%.
- **Limitations:** This is based on a representative basket, not an average across all
  baskets. Basket complexity varies. The number demonstrates the design's filtering
  power, not a guaranteed percentage for every use case.

### "Within six weeks, users stopped verifying line by line"

Behavioral observation from the PM and team lead. Not a formal measurement. Within
six weeks of the equities MVP launch, the equities team transitioned from manually
reviewing all rows to trusting the exception flags and only reviewing flagged items.
This was observable in workflow patterns (session length, scroll depth) and confirmed
verbally by users.

## 2. Role Scope Precision

- **Title:** Product Designer (sole designer, founding)
- **What was mine:** All research, all design, feature strategy, prioritization
  framework, the decision to focus on equities first, the decision to scope to
  minimum adoptable workflow during the migration crisis.
- **What was shared:** Technical architecture decisions (with 9 engineers), timeline
  commitments (with PM equivalent).
- **What was someone else's:** Backend connectivity (engineers), BNY Mellon vendor
  integration (vendor team), final go/no-go on launch (management).
- **No PM:** I functioned as a de facto PM. "Drove feature strategy" is accurate -
  there was no PM on the team.

## 3. Strategic Omission Inventory

| Omission | Why omitted | Prepared response |
|----------|-------------|-------------------|
| Exact team structure | Could invite "who did what" nitpicking | "Nine engineers across three time zones - New York, London, India. I was the only designer. No dedicated PM." |
| BNY Mellon vendor relationship | Adds complexity without strengthening the narrative | "We worked with BNY Mellon as an external vendor for data connectivity. My focus was on the user-facing platform." |
| Fixed income track details | Portfolio focuses on equities-first decision; FI track was a parallel workstream | "The fixed income track ran in parallel with a senior engineer leading it. My primary focus was the equities experience." |
| Post-MVP iteration details | Case study ends at adoption moment for narrative clarity | "After the initial adoption, we continued iterating. But the portfolio shows the hardest part - getting people to migrate." |

## 4. Anticipated Probes

**Q: "You drove feature strategy as a sole designer with no PM - really?"**
"Yes. It was a new team that had never had a designer. The engineering lead and I
effectively split PM responsibilities. I owned user research, prioritization, and
scoping. He owned technical architecture and sprint planning."

**Q: "95% noise reduction sounds impressive. How did you measure that?"**
"A representative basket review went from roughly 12,000 rows of data to about 560
exception flags. The remaining 11,400+ rows are auto-validated. It's not a formal
A/B test - it's the design's filtering power on a typical workflow."

**Q: "How do you know users actually trusted the system within six weeks?"**
"Observable workflow patterns. Session lengths shortened, scroll depth decreased, and
users stopped opening the spreadsheet backup. The PM confirmed it verbally. It wasn't
a formal study - it was visible adoption."

**Q: "What would you do differently?"**
"I'd formalize the exception taxonomy earlier. We discovered the right severity levels
through iteration, but having a structured framework from day one would have saved
two weeks of design exploration."

**Q: "$79B in assets daily - were you really responsible for that?"**
"The platform processes that volume. I designed the interface that people use to manage
it. I'm not claiming I personally moved the money - I'm claiming I designed the tool
that the people who move the money rely on."
