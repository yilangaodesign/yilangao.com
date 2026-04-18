import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { markdownToLexical, createCaseStudyBlocks } from '@/lib/content-helpers'
import { INTRO_HEADLINE_BY_SLUG } from '@/lib/case-study-intro-headline'

const BLURB_BODY =
  'Six weeks after launch, users stopped checking the system\'s work. Not because they were lazy. Because the system had earned it. A CEO told me the approach was wrong - that full transparency does more harm than good. I agreed too quickly. Two weeks later I had the answer I should have given. I took it to other startups and watched it diagnose trust failures live. Most teams build trust features without asking whether they\'re scaffolding or structure.'

const SCOPE_STATEMENT =
  'Trust features are either scaffolding you\'ll remove or permanent structure you\'ll never touch. This article introduces ETRO - Explainability, Traceability, Reversibility, Observability - built during a multi-asset ETF management platform covering $79 billion in assets under management at a financial institution I probably can\'t name. AI startup CEOs told me the approach creates more overhead than trust. They were partially right. The framework claims calibrated transparency, not maximum transparency.'

const CONTENT_BLOCKS = createCaseStudyBlocks(
  [
    {
      heading: 'Twelve Thousand Lines of Doubt',
      bodyMarkdown:
        'Portfolio managers on the trading floor worked 10-hour days. Between 8 and 10:30pm they received emails asking them to confirm if a basket was good to go. Each basket: up to 12,000 lines of data.\n\nThey needed to find roughly three issues among those 12,000 lines - weight mismatches, stale prices, corporate action adjustments the vendor missed. Reviewing a single basket took an hour and twenty minutes.\n\nThe platform I designed auto-generated baskets overnight, flagged potential issues, and cut noise by 95% - from 12,000 lines to about 560. Review time dropped from eighty minutes to eight.\n\nBut the real result was not the time savings. Within six weeks, users stopped spot-checking every line. They moved from reviewing everything to reviewing only what was flagged.\n\nThat behavioral shift only works if the user trusts the system\'s filtering. If they don\'t, they scan all 12,000 lines anyway and you save nothing.\n\nThe trust architecture earned it. The time savings were a byproduct.\n\nThat trust had four layers.',
      layout: 'stacked',
      imagePlaceholders: [
        'Before: the daily email-and-spreadsheet review loop with external vendor',
        'After: auto-generated basket with flagged exception rows, 95% noise reduction',
      ],
    },
    {
      heading: 'Present, Past, Future, Always.',
      bodyMarkdown:
        'Every user who sat down with the system was asking four questions, whether they knew it or not. Each one lived at a different point in time.\n\nWhy did you flag this row? Present tense. The decision just happened.\n\nWhat changed overnight? Past tense. The system adjusted something while they were asleep.\n\nCan I undo this before it goes out? Future tense. The consequences of a wrong submission are not abstract when your name is on it.\n\nIs this thing getting better or worse? No tense. That question never resolves.\n\nI called the framework ETRO - Explainability, Traceability, Reversibility, Observability. Each element answers one of those questions. Skip one and trust breaks at that seam.\n\nExplainability came first because users asked for it loudest. Every flagged row showed which rule triggered the flag - severity-tier reasoning tags I designed with a decision tree that took months of edge-case work with engineers to get right. Not post-hoc explanations bolted onto a black box. Rules baked into the logic.\n\nBut here is what I did not expect: once users trusted the system, they stopped reading the explanations. Explainability was the element they thought they wanted most and engaged with least.\n\nTraceability mattered when something changed without warning. Corporate actions - stock splits, ticker changes - triggered automatic basket adjustments overnight. I designed a two-layer system: a corner notch showing what changed and by how much, and a diff view showing before state, after state, and delta. Nobody reads every entry. But when a PM gets a question from compliance, the record is there.\n\nReversibility was the adoption unlock. A calculation sandbox let users preview the impact of any rebalancing before committing. Users who knew they could undo were willing to let the system act. The counterintuitive application: when someone submitted a basket with severe flags, the system made it intentionally hard to proceed. Written justification for every override. Ease of use is not always the right goal.\n\nObservability was the hardest to prove and the easiest to undervalue. Override rates dropped 40% in six months. Spot-check frequency fell from every line to flagged-only within six weeks. Without those signals, you cannot tell whether trust is being earned or quietly eroding. Whether it was the dashboards or just familiarity, I still cannot cleanly separate.\n\nNot every product needs all four at full depth. But I had a blind spot.',
      layout: 'stacked',
      imagePlaceholders: [
        'The four temporal layers of trust: present, past, future, longitudinal',
        'Explainability: severity tier reasoning tags with decision tree logic',
        'Traceability: corporate actions diff view showing before, after, and delta',
        'Reversibility: calculation sandbox with preview before commit',
      ],
    },
    {
      heading: 'Full Transparency Is Its Own Kind of Noise',
      bodyMarkdown:
        'A CEO I was consulting with made the sharpest argument against the framework. Does your manager have 100% visibility into everything you do? No. So why would a user want that level of control over their AI?\n\nHe said they might think they want it. They don\'t know what to do with it when given it.\n\nHis point was clean. Applying ETRO everywhere overwhelms the AI with cost on every interaction and overwhelms the humans with transparency they cannot meaningfully act on. Full ETRO slows adoption. The exact opposite of its intent.\n\nThe uncomfortable implication landed harder than he probably meant it to. If full ETRO slows adoption, then maybe my financial platform succeeded despite the trust architecture, not because of it. Maybe the 95% noise reduction did the heavy lifting. Maybe the explainability was just reassuring furniture users scrolled past.\n\nI agreed too quickly in that conversation. Two weeks later I had the answer I should have given.\n\nThe noise reduction and the trust architecture were not separate things. The system reduced noise by 95%, but users only believed the reduction because the remaining 5% was transparent. Without the reasoning tags, the severity tiers, the diff views, the 95% would have been a black box they refused to trust.\n\nThe trust architecture was the mechanism by which the noise reduction earned belief.\n\nMonths later, consulting for a different AI startup, I watched the exact mistake play out. They buried outcomes under explanation layers. The growth PM did not want behavioral science reasoning. They wanted results.\n\nSame framework. Wrong volume.',
      layout: 'full-width',
      imagePlaceholders: [
        'The management analogy: trust graduated by demonstrated competence, not applied uniformly',
      ],
    },
    {
      heading: 'Volume Dial, Not Light Switch',
      bodyMarkdown:
        'You onboard a junior employee and review everything they produce. Six months later, if they have been reliable, you stop. A year later you only check their work on novel or high-stakes tasks.\n\nThat is how trust actually works. Graduated oversight based on demonstrated competence. The same logic applies to AI systems, and the answer to the CEO\'s challenge is embedded in it.\n\nThe gradient operates along two axes. Per-user: someone new to the system needs the full ETRO experience. Someone who has validated its judgment hundreds of times needs a fundamentally different one. Per-task: a routine reconciliation does not need the same explainability as a situation the system encounters for the first time.\n\nWithin six weeks of launch, I watched this happen. Users who had verified the system hundreds of times stopped reading reasoning tags on routine rows. The system started showing reasoning only for exceptions - novel situations, low-confidence flags, first-time corporate action types.\n\nThat was not a design aspiration. It was a measurable behavioral threshold.\n\nAt full volume, reasoning is surfaced for every decision, every action sits in draft mode, audit trails are proactively presented. At low volume, the infrastructure still exists - every action is still traceable, every decision still reversible - but the interface recedes. The safety net stays out of the workflow unless you need it.\n\nThe harder problem, which I have not solved: detecting when a trusted user encounters genuinely novel territory and needs guardrails back at full volume. The gradient should know how to turn itself up. That mechanism does not exist yet.\n\nThe AI startup I consulted for had the gradient problem in reverse. Their information architecture led with behavioral science reasoning - walls of "why" before the user ever saw the result. I inverted it. Outcomes first, reasoning underneath.\n\nAccountants trust auditability. Growth PMs trust predicted lift. Developers trust the undo button. Same four questions. Lead with the wrong one and the trust never forms.',
      layout: 'stacked',
      imagePlaceholders: [
        'The trust gradient: per-user and per-task adaptation of ETRO intensity',
        'Cross-domain application: how each element manifests differently by trust currency',
      ],
    },
    {
      heading: 'Scaffolding or Structure. Know Which.',
      bodyMarkdown:
        'For most AI products, trust is a temporary problem. The gap between "I need to verify this" and "this just works" is collapsing. ETRO in those contexts is scaffolding. The faster you remove it, the better the product.\n\nBut when a portfolio manager submits a basket that moves tens of billions in assets, a mistake does not just cost time. It costs millions and triggers regulatory consequences. When a compliance officer signs off on a disclosure, their professional license is on the line.\n\nIn those environments, the trust infrastructure is not scaffolding you remove once the building is complete. It is the building.\n\nThe distinction is not even as clean as "regulated vs. unregulated." Internal bookkeeping at an accounting firm has a different trust bar than a trading platform where one error cascades through downstream order execution. Both are finance. Both are regulated. The guardrail architecture for each should look fundamentally different.\n\nEvery AI product I touch now, the first question is not "how do we build trust." It is "what role does trust play here, and does it have a shelf life?"\n\nMost teams skip that question. They build permanent infrastructure for temporary problems, or temporary scaffolding for permanent ones. Both fail.\n\nOne wastes engineering. The other never ships.\n\nTwelve thousand lines of data, three issues hidden somewhere. Whether the trust architecture that finds them is a temporary scaffold or a permanent floor is the question most teams never ask.',
      layout: 'stacked',
      imagePlaceholders: [
        'The two roles of ETRO: adoption mechanism vs. permanent architecture',
        'Stakes map: how trust calibration varies within a single industry',
      ],
    },
  ],
  {
    heroPlaceholderLabel:
      'Hero - ETRO Framework: trust architecture diagram showing four temporal layers and trust gradient',
  },
)

const ETRO_DATA = {
  title: 'ETRO Framework',
  slug: 'etro-framework',
  category: 'Design Strategy \u00b7 AI Trust Architecture',
  featured: false,
  order: 5,
  introBlurbHeadline: INTRO_HEADLINE_BY_SLUG['etro-framework'],
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
