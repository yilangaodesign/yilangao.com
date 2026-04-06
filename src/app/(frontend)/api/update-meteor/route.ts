import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { markdownToLexical, createCaseStudyBlocks } from '@/lib/content-helpers'

const BLURB_HEADLINE = 'I had to choose whom NOT to design for.'

const BLURB_BODY =
  'How do you design software that moves $79B in assets daily? As the only designer. No PM. Two user groups who want opposite things. Halfway through, a wall that nearly killed adoption. Meteor is a story of three counterintuitive bets I made mid-flight - who to prioritize, what to deliberately not build, and a migration risk nobody saw coming. Read how I turned an error-prone ETF workflow into an exception-driven system that cut 12,000 lines of data to 560.'

const SCOPE_STATEMENT =
  "Meteor is a multi-asset ETF management platform built for Goldman Sachs's Asset Management division. As the sole designer and first design hire on a team that had never had one, I conducted research, mapped workflows, drove feature strategy, and shipped an MVP in 8 months with nine engineers across three time zones. Within six weeks, users stopped verifying the system's work line by line."

const CONTENT_BLOCKS = createCaseStudyBlocks(
  [
    {
      heading: 'The Scope Buffet',
      bodyMarkdown:
        'ETF portfolio management spans four stages. I mapped existing tool coverage and asked which uncovered gap, if left open, breaks everything downstream. Basket management - if the upstream action is wrong, no downstream polish saves it.',
      layout: 'stacked',
      imagePlaceholders: [
        'Lifecycle map: four ETF management stages from fund launch to order management',
        'Coverage analysis: existing internal tools vs. uncovered gaps',
        'Upstream cascade: basket management as the highest-leverage intervention point',
        'Before: the daily email-and-spreadsheet review loop with BNY vendor',
        'After: Meteor auto-generated basket with flagged exception rows',
      ],
    },
    {
      heading: 'Not the Squeaky Wheel',
      bodyMarkdown:
        'The original thesis: one platform for two desks. Fixed income had higher visibility and more precedent, but matching their entrenched legacy system first would have consumed the timeline. Equities had zero internal tooling, acute pain, and workflows built for automation.',
      layout: 'grid-2-equal',
      imagePlaceholders: [
        'Equities desk: zero internal tooling, spreadsheet-dependent, acute pain',
        'Fixed income desk: legacy tool with entrenched workflows and high replacement bar',
        'Implementation: equities-first focus with parallel fixed income track via senior engineer',
        "Equities team reviewing a basket in Meteor's exception-driven interface",
      ],
    },
    {
      heading: 'Nobody Migrates Halfway',
      bodyMarkdown:
        "Halfway through, users refused to migrate. Not because Meteor was worse - because switching meant losing a system they still needed for another part of their job. If we built everything they asked for, engineers estimated six more months - past our deadline, past our budget justification, and into a timeline where nobody would trust the platform. I mapped every feature against usage frequency and design input, scoped to the minimum adoptable workflow, and built only what unblocked the move.",
      layout: 'stacked',
      imagePlaceholders: [
        'Migration blocker: the Jet dependency that nearly killed adoption',
        'Prioritization: usage frequency x design input criticality matrix',
        'ETRO - Explainability: severity tier reasoning tags with decision tree logic',
        'ETRO - Traceability: corporate actions diff view showing before, after, and delta',
        'ETRO - Reversibility: pro rata calculator sandbox with preview and reversal',
        'ETRO - Observability: submission validation requiring written justification for overrides',
      ],
    },
  ],
  {
    heroPlaceholderLabel:
      'Hero - Meteor basket review dashboard showing flagged exceptions',
  },
)

const METEOR_DATA = {
  title: 'Meteor',
  slug: 'meteor',
  category: 'Financial Operations \u00b7 Founding Design',
  featured: true,
  order: 3,
  introBlurbHeadline: BLURB_HEADLINE,
  introBlurbBody: markdownToLexical(BLURB_BODY),
  description: markdownToLexical(SCOPE_STATEMENT),
  content: CONTENT_BLOCKS,
  sections: [],
  role: 'Product Designer (sole designer, founding)',
  collaborators: [
    { name: 'Engineering (9 engineers)' },
    { name: '3 Time Zones (NY, London, India)' },
    { name: 'External Vendor (BNY Mellon)' },
  ],
  duration: '8 months (MVP)',
  tools: [{ name: 'Figma' }],
  externalLinks: [] as { label: string; href: string }[],
}

export async function POST() {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Disabled in production' }, { status: 403 })
  }

  const payload = await getPayload({ config })

  const existingBySlug = await payload.find({
    collection: 'projects',
    where: { slug: { equals: 'meteor' } },
    limit: 1,
  })

  if (existingBySlug.docs.length > 0) {
    const doc = existingBySlug.docs[0]
    await payload.update({
      collection: 'projects',
      id: doc.id,
      data: METEOR_DATA as never,
    })
    return NextResponse.json({
      action: 'updated',
      id: doc.id,
      slug: 'meteor',
      url: '/work/meteor',
    })
  }

  const existingPlaceholder = await payload.find({
    collection: 'projects',
    where: { slug: { equals: 'project-two' } },
    limit: 1,
  })

  if (existingPlaceholder.docs.length > 0) {
    const doc = existingPlaceholder.docs[0]
    await payload.update({
      collection: 'projects',
      id: doc.id,
      data: METEOR_DATA as never,
    })
    return NextResponse.json({
      action: 'updated-from-project-two',
      id: doc.id,
      slug: 'meteor',
      url: '/work/meteor',
    })
  }

  const created = await payload.create({
    collection: 'projects',
    data: METEOR_DATA as never,
  })

  return NextResponse.json({
    action: 'created',
    id: created.id,
    slug: 'meteor',
    url: '/work/meteor',
  })
}
