import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { markdownToLexical, createCaseStudyBlocks } from '@/lib/content-helpers'
import { INTRO_HEADLINE_BY_SLUG } from '@/lib/case-study-intro-headline'

const BLURB_BODY =
  '"Your whole approach is wrong."\n\nThe startup CEO across the table had spent fifteen years at Blackstone, and he dismantled the framework I\'d spent a year building in about ninety seconds.\n\nDo you distrust electricity? Credit cards? Self-checkout? Things we once handled with caution, now invisible.\n\nThe trust scaffolding I was so proud of, he said, would go the same way. I nodded through it, but something felt off.\n\nTwo weeks later I realized he was right, and also completely wrong. We were approaching the same coin from opposite sides, and neither of us should ignore the other.'

const CONTENT_BLOCKS = createCaseStudyBlocks(
  [
    {
      heading: "The Success That Almost Wasn't.",
      bodyMarkdown:
        "Last December, I shipped a platform that automates high-stakes financial operations and flags the parts that warrant human-in-the-loop review. Six weeks in, the users stopped verifying the automated judgments line-by-line.\n\nManual review surface area dropped 95 percent. Daily resolution time fell from 1 hour 20 minutes to 8 minutes.\n\nIn this context, a single missed issue could cost the firm millions, and the user was personally on the hook for catching it. Over the years, my users had developed the only rational coping strategy - verifying everything by hand.\n\nThe problem, though, wasn't that they were lazy. In fact, it was the reverse.\n\nThey were too diligent, and that diligence had hurt the firm's scalability for years. Last year, that practice was on the verge of breaking, because the firm planned to 10x the workload over the next three years - with zero additional headcount.\n\nI distilled the strategies that made users trust the platform into a reusable framework. I called it ETRO: Explainability, Traceability, Reversibility, Observability. I was taking it around to other teams when the CEO tore into it.\n\nThe CEO's argument made me reflect. I couldn't immediately rule out that the platform had succeeded *despite* the trust architecture rather than because of it. Maybe the noise reduction did the heavy lifting, and the explainability was reassuring furniture users scrolled past.\n\nBut he was only half right. The framework that survived the two weeks has two axes instead of one - the four questions every user asks of a machine-made decision, and the volume at which the system should answer them.",
    },
    {
      heading: "Present, Past, Future, Always.",
      bodyMarkdown:
        "The four questions respond to a temporal mode: the moment of the decision, the record of the action, the bounded consequence, the relationship across time.\n\nWhy did you flag this? The user is looking at the system's output right now, deciding whether to trust it. This mechanism works best when the user has the domain knowledge to actually evaluate the logic they see.\n\nWhat exactly happened? Traceability acts as the breadcrumbs of delegated machine action. It is the record that lets a human, hours or weeks later, walk back through what the system did and verify the differences and series of actions.\n\nCan I undo this? Users who knew they could undo were willing to let the system act in the first place. Reversibility covers the moment before users officially bear the consequence of the full delegation.\n\nIs this thing getting better or worse? Observability answers whether, across months of use, the system is still behaving the way we designed it to. It is the mechanism that threads the other three elements across the passage of time.\n\nA trust architecture that covers fewer than four is incomplete in a diagnosable way. But - and this is where the CEO had a point - not every product needs all four at full volume.\n\nYou don't shoot a mosquito with a cannon.",
    },
    {
      heading: "Full Transparency Is Its Own Kind of Noise.",
      bodyMarkdown:
        "The CEO's actual argument, once I stopped nodding long enough to hear it, was about how human management works.\n\nYour manager doesn't have 100 percent visibility into what you do. You'd hate it if they did.\n\nWould a user actually want that level of control over their AI? They might *think* they do. They don't know what to do with it once they have it.\n\nApply ETRO everywhere and you burden the system with overhead on every interaction and the humans with transparency they cannot meaningfully act on. Full ETRO slows adoption. The exact opposite of its intent.\n\nThe noise reduction and the trust architecture were not separate things. The system reduced the surface area users had to review by 95 percent, but users only believed the reduction because the remaining 5 percent was transparent.\n\nWithout the reasoning tags, the severity tiers, the diff views, the 95 percent would have been a black box they refused to trust. The trust architecture was the mechanism by which the noise reduction earned belief.\n\n\"The trust architecture will go away\" and \"the trust architecture is unnecessary\" are very different claims, and only the first one is defensible.\n\nThe CEO was right that uniform application is wrong. He was wrong that ETRO is therefore wrong.\n\nThe framework needed a second axis: a way of saying that the four elements are always present in the architecture, but their intensity is calibrated to the stakes of the specific decision.\n\nI found out later that the CEO had reinvented Lee & See's \"Calibrated Trust\" (2004) from operational instinct. The dispute is sometimes called *maximum transparency versus calibrated transparency*, and there are smart people on both sides.\n\nHe was on one side. I had built a framework that defaulted to the other. We were both right about half of it.",
    },
    {
      heading: "Trust Is Relational, Not Binary.",
      bodyMarkdown:
        "You onboard a junior employee and review everything they produce. Six months later, if they have been reliable, you stop. A year later, you only check novel or high-stakes tasks.\n\nYou did not remove oversight. You graduated it based on time and accumulated evidence of competence.\n\nThe system should do the same thing along two axes.\n\nPer user: someone new to the system needs the full ETRO experience. Someone who has validated its judgment hundreds of times needs a quieter UI.\n\nPer task: a routine reconciliation does not need the same explainability as a situation the system has never seen before.\n\nThe behavioral shift from the opening was the calibration signal. Users who had verified the system hundreds of times stopped needing reasoning surfaced for every row, so the system stopped surfacing it.\n\nIt started showing reasoning only for exceptions - novel situations, low-confidence flags, first-time issue types. The veteran's interface began to look different from the new user's, automatically, based on observed behavior.\n\nThe four questions never go away. Their volume changes.",
    },
    {
      heading: "Scaffolding, Structure, or Migration.",
      bodyMarkdown:
        "The harder question the CEO was circling is whether trust architecture is something you eventually remove. Sometimes yes. Sometimes never.\n\nSometimes it moves out of the UI and into infrastructure, and that third case is the one almost no one designs for.\n\nScaffolding: an AI startup I advised built UX optimization tools for growth PMs. Their IA led with the behavioral-science reasoning behind every recommendation, which created overhead.\n\nWe inverted the hierarchy: outcomes first, reasoning underneath, accessible on demand. In contexts like this, once trust is built, users barely need trust mechanisms, and they should be taken down soon after onboarding.\n\nStructure: when a portfolio manager runs a multi-billion-dollar book, even a tiny mistake can be more costly than a six-figure salary. When a compliance officer signs off on a disclosure, their personal license is on the line.\n\nWhen a clinical decision support system suggests a treatment, the explanation is part of the doctor's defense. The trust infrastructure is not scaffolding you remove once the building is complete. It is the building.\n\nThe distinction is not as clean as regulated versus unregulated fields. Internal bookkeeping at an accounting firm has a fundamentally different trust requirement than a trading platform where one error cascades through downstream order execution.\n\nBoth are finance. Both are regulated. The guardrail architecture should look completely different, because the consequences of being wrong have different shapes.\n\nMigration: this is the category the CEO was circling without naming. Electricity and credit cards did not become trustworthy because users got used to them; they became trustworthy because institutions were built around them.\n\nFDIC insurance. Chargeback law. POS analytics.\n\nThe trust scaffolding did not vanish. It relocated into infrastructure the user no longer sees.\n\nFor some AI categories, ETRO will migrate the same way. Something like SOC 2, or whatever its AI-era equivalent turns out to be, will absorb what currently lives in product interfaces.\n\nThe designer's job here is not to build the standard. It is to build a product whose trust layer is portable: to know which elements are likely to be absorbed into external infrastructure and which will remain product-level, and to avoid building a moat on UX that certification will eat.",
    },
    {
      heading: "Trust Has a Shelf Life. Sometimes.",
      bodyMarkdown:
        "Every AI product I touch now, the first questions I ask are no longer *how do we build trust*.\n\nThey are: what role does trust play here? Does it have a shelf life? What inherits it?\n\nIn my case, I built permanent infrastructure for what might have been a temporary problem, and didn't catch it until someone with a different angle told me.\n\nI didn't ask these questions for a full year into building. You don't have to wait as long as I did.",
    },
  ],
  {
    heroPlaceholderLabel:
      'Hero - ETRO Framework: four questions of trust mapped against a calibrated-volume axis',
  },
)

const ETRO_DATA = {
  title: 'ETRO Framework',
  slug: 'etro-framework',
  category: 'AI Trust Architecture',
  contentFormat: 'essay',
  publishedAt: '2026-04-21',
  readTimeMinutesOverride: null as number | null,
  mediumUrl: '',
  featured: false,
  order: 5,
  introBlurbHeadline: INTRO_HEADLINE_BY_SLUG['etro-framework'],
  introBlurbBody: markdownToLexical(BLURB_BODY),
  content: CONTENT_BLOCKS,
  sections: [],
  role: 'Author & Designer',
  collaborators: [
    { name: 'Startup founders' },
    { name: 'Engineering leaders' },
  ],
  duration: '2024 \u2013 2026',
  tools: [{ name: 'Figma' }, { name: 'Cursor' }],
  externalLinks: [] as { label: string; href: string }[],
}

export async function POST() {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Disabled in production' }, { status: 403 })
  }

  const payload = await getPayload({ config })

  const existingBySlug = await payload.find({
    collection: 'projects',
    where: { slug: { equals: 'etro-framework' } },
    limit: 1,
  })

  if (existingBySlug.docs.length > 0) {
    const doc = existingBySlug.docs[0]
    await payload.update({
      collection: 'projects',
      id: doc.id,
      data: ETRO_DATA as never,
    })
    return NextResponse.json({
      action: 'updated',
      id: doc.id,
      slug: 'etro-framework',
      url: '/work/etro-framework',
    })
  }

  const existingPlaceholder = await payload.find({
    collection: 'projects',
    where: { slug: { equals: 'project-six' } },
    limit: 1,
  })

  if (existingPlaceholder.docs.length > 0) {
    const doc = existingPlaceholder.docs[0]
    await payload.update({
      collection: 'projects',
      id: doc.id,
      data: ETRO_DATA as never,
    })
    return NextResponse.json({
      action: 'updated-from-project-six',
      id: doc.id,
      slug: 'etro-framework',
      url: '/work/etro-framework',
    })
  }

  const created = await payload.create({
    collection: 'projects',
    data: ETRO_DATA as never,
  })

  return NextResponse.json({
    action: 'created',
    id: created.id,
    slug: 'etro-framework',
    url: '/work/etro-framework',
  })
}
