import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { markdownToLexical, createCaseStudyBlocks } from '@/lib/content-helpers'

const BLURB_HEADLINE = 'Trust Has a Shelf Life. Sometimes.'

const BLURB_BODY =
  'Six weeks after launch, our users stopped checking the system\'s work. Not because they were lazy. Because the system had earned it. I built the trust architecture that made that behavioral shift possible - then a CEO told me I had it backwards. What followed was the most important refinement: knowing when your guardrails are scaffolding you\'ll remove, and when they\'re the entire building.'

const SCOPE_STATEMENT =
  'The ETRO Framework - Explainability, Traceability, Reversibility, Observability - is a progressive trust calibration system I developed while building a multi-asset ETF management platform at a financial institution I probably can\'t name, refined through a direct challenge from a CEO building an AI-powered professional services company, and validated through cross-domain product consultations. This article is the argument for why most AI products get trust architecture wrong - and a framework for getting it right.'

const CONTENT_BLOCKS = createCaseStudyBlocks(
  [
    {
      heading: 'Twelve Thousand Lines of Doubt',
      bodyMarkdown:
        'Portfolio managers on the trading floor worked 10-hour days. Between 8 and 10:30pm - after an exhausting day - they received emails asking them to confirm if a basket was good to go. Each basket: up to 12,000 lines of data. They needed to find roughly three issues among those 12,000 lines. Reviewing a single basket took an hour and twenty minutes.\n\nThe platform I designed auto-generated baskets overnight, flagged lines with potential issues, and reduced noise by 95% - from 12,000 lines down to about 560 that needed human review. Review time dropped from eighty minutes to eight. But the real result was not the time savings. Within six weeks, users stopped spot-checking the system\'s work for every single line. They moved from reviewing everything to reviewing only what was flagged.\n\nThat behavioral shift - from data processing to decision making - only works if the user trusts the system\'s filtering. If they don\'t trust it, they scan all 12,000 lines anyway and you save nothing. The trust architecture was what earned it. The time savings were a byproduct.\n\nI built that architecture around four pillars.',
      layout: 'stacked',
      imagePlaceholders: [
        'Before: the daily email-and-spreadsheet review loop with external vendor',
        'After: auto-generated basket with flagged exception rows, 95% noise reduction',
      ],
    },
    {
      heading: 'Four Pillars, One Job',
      bodyMarkdown:
        '**Explainability** answers: why did the system make this judgment? For every flagged row, the system shows which rule triggered the flag. I designed a decision tree for the reasoning tag logic, working with engineers to identify edge cases over several months. If users can\'t see why a row is flagged, they either distrust the system entirely or trust it blindly. Both are failures.\n\n**Traceability** answers: what exactly happened, and can we audit it? When a corporate action happens - a stock split, a ticker change - the system automatically adjusts the basket. I designed a two-layer trust system: a corner notch showing what changed and by how much, and a diff view modal showing before state, after state, and delta. Users trace every automated adjustment without reconstructing what happened manually.\n\n**Reversibility** answers: can we safely undo this if something goes wrong? I designed a calculation sandbox where users preview the impact of any rebalancing before committing. Whatever calculation they set up, they see the result before it executes. But the most counterintuitive application was deliberate friction: when a user submits a basket with severe exception flags, the system makes it intentionally difficult to proceed. Written justification required for every override. Ease of use is not always the right goal. Any system of record for financial data needs bulletproof accountability.\n\n**Observability** answers: how is the system performing over time? This closes the loop. Without it, you can\'t tell whether trust is being earned or eroded. The team could see that users were progressively trusting the system more - validating the entire design approach.\n\nTogether, these four pillars formed a trust architecture that turned 12,000 lines of anxiety into 560 lines of focused decision-making. But I had a blind spot.',
      layout: 'stacked',
      imagePlaceholders: [
        'Explainability: severity tier reasoning tags with decision tree logic',
        'Traceability: corporate actions diff view showing before, after, and delta',
        'Reversibility: calculation sandbox with preview before commit',
        'Reversibility: submission validation requiring written justification for overrides',
      ],
    },
    {
      heading: 'The Challenge That Changed Everything',
      bodyMarkdown:
        'After developing and presenting ETRO across multiple conversations with startup founders and engineering leaders, I received the pushback that sharpened my thinking most. A CEO building an AI-powered professional services company - someone with deep operating experience on the buy side at one of the world\'s largest alternative asset managers - made a precise argument.\n\nIf you think about why people want observability, transparency, and reversibility, he said, it\'s because there\'s a lack of trust in the AI. But consider how human management actually works. Does your manager have 100% visibility into everything you do? No. Would a user actually want that level of control over their AI? They might think they want it. They don\'t know what to do with it when given it.\n\nHis point: applying ETRO everywhere creates two problems simultaneously. It overwhelms the AI (adding cost and complexity to every interaction) and it overwhelms the humans (who now process transparency they didn\'t need and can\'t meaningfully act on). Full ETRO actually slows adoption rather than accelerating it. The exact opposite of its intent.\n\nThis was not a dismissal. It was the most important refinement the framework needed.',
      layout: 'full-width',
      imagePlaceholders: [
        'The management analogy: trust graduated by demonstrated competence, not applied uniformly',
      ],
    },
    {
      heading: 'Volume Dial, Not Light Switch',
      bodyMarkdown:
        'My answer - arrived at through reflection rather than in real time - is that trust operates as a gradient, not a binary.\n\nThink about it through the management analogy. When you onboard a new junior employee, you review their work closely, ask them to explain their reasoning, check their outputs against your own judgment. Six months later, if they\'ve been reliable, you stop checking every deliverable. A year later, you might only review their work on novel or high-stakes tasks. You didn\'t remove oversight. You graduated it based on demonstrated competence.\n\nThe gradient operates along two axes. Per-user: a new user needs the full ETRO experience. An experienced user who has validated the system\'s judgment hundreds of times needs a fundamentally different one. The guardrails get quieter as trust builds. Per-task: a routine reconciliation the system has handled correctly a thousand times does not need the same explainability as a complex situation it encounters for the first time.\n\nThe four pillars remain constant. The gradient governs how intensely each is expressed. Explainability at full volume shows reasoning for every decision. At low volume, it surfaces reasoning only for novel, high-stakes, or low-confidence decisions - and makes the rest available one click away. Traceability still logs everything (regulatory requirements have no volume dial) but surfaces the audit interface only when users seek it or anomalies appear. Reversibility at full volume puts every action in draft mode. At low volume, it auto-commits routine actions while maintaining rollback capability. The safety net exists but stays out of the workflow.\n\nThe infrastructure for all four pillars should always be present. Every action should still be traceable. Every decision should still be reversible. The gradient only governs visibility and friction in the interface - not whether the underlying capability exists.\n\nI validated this when consulting for an AI startup building a UX optimization product for growth product managers. Every ETRO pillar transferred - but the emphasis shifted entirely. Explainability meant predicted outcomes first, reasoning second. Traceability meant before/after diff views (the same pattern from the financial platform). Reversibility became the adoption unlock: if rollback is easy and the AI demonstrates quality, the human-in-the-loop becomes optional rather than mandatory. Each domain has its own trust currency. In finance, auditability. In growth, predicted outcomes. In compliance, substantiation. In AI-assisted engineering, controllability. The pillars remain constant. Which pillar leads and what counts as evidence - that is calibrated to what the domain considers proof.',
      layout: 'stacked',
      imagePlaceholders: [
        'The trust gradient: per-user and per-task adaptation of ETRO intensity',
        'Cross-domain application: how each pillar manifests differently by trust currency',
      ],
    },
    {
      heading: 'Scaffolding or Structure. Know Which.',
      bodyMarkdown:
        'After building ETRO, having it challenged, refining it into a gradient, and applying that gradient across domains, I arrived at a position simpler and more honest than any of the intermediate versions.\n\nFor most AI products, trust is going to disappear as a concern. Nobody asks "do I trust the internet?" We live and breathe it. AI is heading to the same place. The pace of capability improvement is so rapid that the gap between "I need to verify this" and "this just works" is collapsing. For consumer products, for internal productivity tools, for most of the applications being built right now - trust is temporary. ETRO in these contexts is an adoption mechanism. Training wheels the product learns to remove.\n\nBut for highly regulated industries - finance, legal, medicine, government - the trust question does not expire. When a portfolio manager submits a basket that moves tens of billions in assets, a mistake does not just cost time. It costs millions and triggers regulatory consequences. When a compliance officer signs off on a disclosure, their professional license is on the line. In these environments, the trust infrastructure is not scaffolding you remove once the building is complete. It is the building. The explainability, traceability, reversibility, and observability are the reason the product is deployable at all.\n\nThe distinction is not even as clean as "regulated vs. unregulated." Within a single industry, the trust bar varies by workflow. Internal bookkeeping at an accounting firm has a different trust bar than a trading platform where one error cascades through downstream order execution. Both are finance. Both are regulated. The guardrail architecture for each should look fundamentally different.\n\nThe art of designing for AI in a specific domain is knowing which role ETRO plays - and recognizing that most real products contain both. A portfolio management platform has routine tasks where trust can be graduated and high-stakes tasks where trust must be permanently visible. The designer\'s job is to map the stakes landscape and calibrate the gradient accordingly.\n\nThe AI industry is locked in a false choice: build trust infrastructure and accept the overhead, or push toward full autonomy and accept the risk. The real answer is that trust architecture should be proportional to consequences, adaptive to user maturity, and honest about which domains will never fully automate away the human-in-the-loop. The companies that know where their guardrails are scaffolding and where they are structure will build the products that actually get deployed in the industries that matter most.',
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
    { name: 'Cross-domain product consultations' },
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
