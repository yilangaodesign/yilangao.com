import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { markdownToLexical, createCaseStudyBlocks } from '@/lib/content-helpers'

const BLURB_HEADLINE = 'Trust Has a Shelf Life. Sometimes.'

const BLURB_BODY =
  'Six weeks after launch, users stopped checking the system\'s work. Not because they were lazy. Because the system had earned it. Then a CEO told me the features I was proudest of might be exactly what slows AI adoption. He was right - and wrong. Trust architecture plays two fundamentally different roles depending on stakes. Most product teams don\'t know which one they\'re building.'

const SCOPE_STATEMENT =
  'Trust features are either scaffolding you\'ll remove or permanent structure you\'ll never touch. The mistake is confusing the two. This article introduces the ETRO Framework - Explainability, Traceability, Reversibility, Observability - built during a multi-asset ETF management platform at a financial institution I probably can\'t name, and stress-tested when a CEO argued the whole approach was wrong.'

const CONTENT_BLOCKS = createCaseStudyBlocks(
  [
    {
      heading: 'Twelve Thousand Lines of Doubt',
      bodyMarkdown:
        'Portfolio managers on the trading floor worked 10-hour days. Between 8 and 10:30pm - after an exhausting day - they received emails asking them to confirm if a basket was good to go. Each basket: up to 12,000 lines of data. They needed to find roughly three issues among those 12,000 lines - weight mismatches, stale prices, corporate action adjustments the vendor missed. Reviewing a single basket took an hour and twenty minutes.\n\nThe platform I designed auto-generated baskets overnight, flagged lines with potential issues, and reduced noise by 95% - from 12,000 lines down to about 560 that needed human review. Review time dropped from eighty minutes to eight. But the real result was not the time savings. Within six weeks, users stopped spot-checking the system\'s work for every single line. They moved from reviewing everything to reviewing only what was flagged.\n\nThat behavioral shift - from data processing to decision making - only works if the user trusts the system\'s filtering. If they don\'t trust it, they scan all 12,000 lines anyway and you save nothing. The trust architecture was what earned it. The time savings were a byproduct.\n\nThat trust had four layers.',
      layout: 'stacked',
      imagePlaceholders: [
        'Before: the daily email-and-spreadsheet review loop with external vendor',
        'After: auto-generated basket with flagged exception rows, 95% noise reduction',
      ],
    },
    {
      heading: 'Four Pillars, One Job',
      bodyMarkdown:
        '**Explainability** answers: why did the system make this judgment? For every flagged row, the system shows which rule triggered the flag. I designed a decision tree for the reasoning tag logic, working with engineers to identify edge cases over several months. If users can\'t see why a row is flagged, they either distrust the system entirely or trust it blindly. Both are failures.\n\n**Traceability** answers: what exactly happened, and can we audit it? When a corporate action happens - a stock split, a ticker change - the system automatically adjusts the basket. I designed a two-layer trust system: a corner notch showing what changed and by how much, and a diff view modal showing before state, after state, and delta. Users trace every automated adjustment without reconstructing what happened manually.\n\n**Reversibility** answers: can we safely undo this if something goes wrong? A calculation sandbox lets users preview the impact of any rebalancing before committing. But the most counterintuitive application was deliberate friction: when a user submits a basket with severe exception flags, the system makes it intentionally difficult to proceed. Written justification required for every override. Ease of use is not always the right goal.\n\n**Observability** answers: how is the system performing over time? This closes the loop on the other three. Override rates dropped 40% in six months. Spot-check frequency fell from every line to flagged-only within six weeks. Without those signals, you cannot tell whether trust is being earned or eroded.\n\nEach pillar addresses a different dimension of trust: explainability builds comprehension, traceability builds accountability, reversibility builds willingness to act, observability builds systemic confidence. In practice, reversibility was the adoption unlock. Users who knew they could undo were willing to trust. Explainability was the pillar they thought they wanted most but engaged with least once confidence built. Observability was the hardest to prove - whether it was the dashboards or just familiarity, I cannot cleanly separate. But I had a blind spot.',
      layout: 'stacked',
      imagePlaceholders: [
        'Explainability: severity tier reasoning tags with decision tree logic',
        'Traceability: corporate actions diff view showing before, after, and delta',
        'Reversibility: calculation sandbox with preview before commit',
        'Reversibility: submission validation requiring written justification for overrides',
      ],
    },
    {
      heading: 'Full Transparency Is Its Own Kind of Noise',
      bodyMarkdown:
        'After presenting ETRO across multiple conversations with startup founders and engineering leaders, I received the pushback that sharpened my thinking most. A CEO building an AI-powered professional services company - someone with deep operating experience on the buy side at one of the world\'s largest alternative asset managers - made a precise argument.\n\nIf you think about why people want observability, transparency, and reversibility, he said, it\'s because there\'s a lack of trust in the AI. But consider how human management actually works. Does your manager have 100% visibility into everything you do? No. Would a user actually want that level of control over their AI? They might think they want it. They don\'t know what to do with it when given it.\n\nHis point: applying ETRO everywhere creates two problems simultaneously. It overwhelms the AI (adding cost and complexity to every interaction) and it overwhelms the humans (who now process transparency they didn\'t need and can\'t meaningfully act on). Full ETRO actually slows adoption rather than accelerating it. The exact opposite of its intent.\n\nThe uncomfortable implication: if full ETRO slows adoption, then the financial platform might have succeeded despite the trust architecture, not because of it. Maybe the 95% noise reduction did the heavy lifting. Maybe the explainability was just reassuring furniture users scrolled past. I sat with that question for two weeks before I found the answer that held up: the noise reduction and the trust architecture were not separate things. The system reduced noise by 95% - but users only believed the reduction because the remaining 5% was transparent. Without the reasoning tags, the severity tiers, the diff views, the 95% would have been a black box they refused to trust.\n\nThis was not a dismissal. It was the question that forced the framework to grow up.',
      layout: 'full-width',
      imagePlaceholders: [
        'The management analogy: trust graduated by demonstrated competence, not applied uniformly',
      ],
    },
    {
      heading: 'Volume Dial, Not Light Switch',
      bodyMarkdown:
        'My answer - arrived at through reflection rather than in real time - is that trust operates as a gradient, not a binary.\n\nThink about it through the management analogy. When you onboard a new junior employee, you review their work closely, ask them to explain their reasoning, check their outputs against your own judgment. Six months later, if they\'ve been reliable, you stop checking every deliverable. A year later, you might only review their work on novel or high-stakes tasks. You didn\'t remove oversight. You graduated it based on demonstrated competence.\n\nThe gradient operates along two axes. Per-user: a new user needs the full ETRO experience. An experienced user who has validated the system\'s judgment hundreds of times needs a fundamentally different one. Per-task: a routine reconciliation the system has handled correctly a thousand times does not need the same explainability as a complex situation it encounters for the first time.\n\nWithin six weeks of launch, the behavioral shift was our signal. Users who had verified the system hundreds of times no longer needed reasoning surfaced for every row. The system started showing reasoning only for exceptions - novel situations, low-confidence flags, first-time corporate action types. The gradient was not a design aspiration. It was an observable behavioral threshold we could measure and respond to.\n\nThe harder problem - which I am still working through - is detecting when a trusted user encounters genuinely novel territory and needs guardrails back at full volume. The gradient should know how to turn itself back up. That mechanism does not exist yet.\n\nThe four pillars remain constant. The gradient governs how intensely each is expressed. At full volume, reasoning is surfaced for every decision, every action sits in draft mode pending approval, and audit trails are proactively presented. At low volume, the infrastructure still exists - every action is still traceable, every decision still reversible - but the interface recedes. Reasoning appears only for exceptions. Routine actions auto-commit. The safety net stays out of the workflow unless you need it.\n\nWhen I consulted for an AI startup building UX optimization for growth PMs, the gradient reframed their entire product. Their information architecture led with behavioral science reasoning - walls of "why" before the user ever saw the redesigned screen. I inverted it: outcomes first, reasoning underneath. Same principle as the financial platform - don\'t make users read the algorithm\'s rationale before they see the result.\n\nAccountants trust auditability. Growth PMs trust predicted lift. Developers trust the undo button. Call it the same framework - but lead with the wrong pillar and the trust never forms.',
      layout: 'stacked',
      imagePlaceholders: [
        'The trust gradient: per-user and per-task adaptation of ETRO intensity',
        'Cross-domain application: how each pillar manifests differently by trust currency',
      ],
    },
    {
      heading: 'Scaffolding or Structure. Know Which.',
      bodyMarkdown:
        'After building ETRO, having it challenged, refining it into a gradient, and applying that gradient across domains, I arrived at a position simpler and more honest than any of the intermediate versions.\n\nFor most AI products, trust is a temporary problem. The gap between "I need to verify this" and "this just works" is collapsing. ETRO in these contexts is scaffolding. The faster you can remove it, the better the product.\n\nBut for highly regulated industries - finance, legal, medicine, government - the trust question does not expire. When a portfolio manager submits a basket that moves tens of billions in assets, a mistake does not just cost time. It costs millions and triggers regulatory consequences. When a compliance officer signs off on a disclosure, their professional license is on the line. In these environments, the trust infrastructure is not scaffolding you remove once the building is complete. It is the building. The explainability, traceability, reversibility, and observability are the reason the product is deployable at all.\n\nThe distinction is not even as clean as "regulated vs. unregulated." Within a single industry, the trust bar varies by workflow. Internal bookkeeping at an accounting firm has a different trust bar than a trading platform where one error cascades through downstream order execution. Both are finance. Both are regulated. The guardrail architecture for each should look fundamentally different.\n\nEvery AI product I touch now, the first question is not "how do we build trust." It is "what role does trust play here - and does it have a shelf life?" Most teams skip that question. They build permanent infrastructure for temporary problems, or temporary scaffolding for permanent ones. Both fail. One wastes engineering. The other never ships.\n\nThe designer\'s job is to map the stakes landscape and know which one they are building.',
      layout: 'stacked',
      imagePlaceholders: [
        'The two roles of ETRO: adoption mechanism vs. permanent architecture',
        'Stakes landscape: how trust calibration varies within a single industry',
      ],
    },
  ],
  {
    heroPlaceholderLabel:
      'Hero - ETRO Framework: trust architecture diagram showing the four pillars and trust gradient',
  },
)

const ETRO_DATA = {
  title: 'ETRO Framework',
  slug: 'etro-framework',
  category: 'Design Strategy \u00b7 AI Trust Architecture',
  featured: false,
  order: 5,
  introBlurbHeadline: BLURB_HEADLINE,
  introBlurbBody: markdownToLexical(BLURB_BODY),
  description: markdownToLexical(SCOPE_STATEMENT),
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
