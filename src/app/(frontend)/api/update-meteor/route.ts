import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { markdownToLexical, createCaseStudyBlocks } from '@/lib/content-helpers'
import { INTRO_HEADLINE_BY_SLUG } from '@/lib/case-study-intro-headline'

const BLURB_BODY =
  'How do you design software that moves $79B in assets daily? As the only designer. No PM. Two user groups who want opposite things. Halfway through, a wall that nearly killed adoption. Meteor is a story of three counterintuitive bets I made mid-flight - who to prioritize, what to deliberately not build, and a migration risk nobody saw coming. Read how I turned an error-prone ETF workflow into an exception-driven system that cut 12,000 lines of data to 560.'

const SCOPE_STATEMENT =
  "Meteor is a multi-asset ETF management platform built for Goldman Sachs's Asset Management division. As the sole designer and first design hire on a team that had never had one, I conducted research, mapped workflows, drove feature strategy, and shipped an MVP in 8 months with nine engineers across three time zones. Within six weeks, users stopped verifying the system's work line by line."

const SECTIONS = [
  {
    heading: 'The Scope Buffet',
    bodyMarkdown:
      'ETF portfolio management spans four stages. I mapped existing tool coverage and asked which uncovered gap, if left open, breaks everything downstream. Basket management - if the upstream action is wrong, no downstream polish saves it.',
    imagePlaceholders: [
      ['Lifecycle map: four ETF management stages from fund launch to order management'],
      ['Coverage analysis: existing internal tools vs. uncovered gaps'],
      ['Upstream cascade: basket management as the highest-leverage intervention point'],
      ['Before: the daily email-and-spreadsheet review loop with BNY vendor'],
      ['After: Meteor auto-generated basket with flagged exception rows'],
    ],
  },
  {
    heading: 'Not the Squeaky Wheel',
    bodyMarkdown:
      'The original thesis: one platform for two desks. Fixed income had higher visibility and more precedent, but matching their entrenched legacy system first would have consumed the timeline. Equities had zero internal tooling, acute pain, and workflows built for automation.',
    imagePlaceholders: [
      ['Equities desk: zero internal tooling, spreadsheet-dependent, acute pain', 'Fixed income desk: legacy tool with entrenched workflows and high replacement bar'],
      ['Implementation: equities-first focus with parallel fixed income track via senior engineer', "Equities team reviewing a basket in Meteor's exception-driven interface"],
    ],
  },
  {
    heading: 'Nobody Migrates Halfway',
    bodyMarkdown:
      "Halfway through, users refused to migrate. Not because Meteor was worse - because switching meant losing a system they still needed for another part of their job. If we built everything they asked for, engineers estimated six more months - past our deadline, past our budget justification, and into a timeline where nobody would trust the platform. I mapped every feature against usage frequency and design input, scoped to the minimum adoptable workflow, and built only what unblocked the move.",
    imagePlaceholders: [
      ['Migration blocker: the Jet dependency that nearly killed adoption'],
      ['Prioritization: usage frequency x design input criticality matrix'],
      ['ETRO - Explainability: severity tier reasoning tags with decision tree logic'],
      ['ETRO - Traceability: corporate actions diff view showing before, after, and delta'],
      ['ETRO - Reversibility: pro rata calculator sandbox with preview and reversal'],
      ['ETRO - Observability: submission validation requiring written justification for overrides'],
    ],
  },
] as const

function buildMeteorData(existingHeroImageId?: number | string | null) {
  const content = createCaseStudyBlocks(SECTIONS as never, {
    heroPlaceholderLabel:
      'Hero - Meteor basket review dashboard showing flagged exceptions',
    scopeStatementMarkdown: SCOPE_STATEMENT,
    ...(existingHeroImageId ? { heroImageId: existingHeroImageId } : {}),
  })

  return {
    title: 'Meteor',
    slug: 'meteor',
    category: 'Financial Operations \u00b7 Founding Design',
    featured: true,
    order: 1,
    introBlurbHeadline: INTRO_HEADLINE_BY_SLUG.meteor,
    introBlurbBody: markdownToLexical(BLURB_BODY),
    content,
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
}

/**
 * Extract the `image` from an existing hero block so re-seeding preserves
 * user-uploaded hero media. Without this, a POST to this endpoint would
 * null out the hero image_id every time (see ENG-172, EAP-087).
 */
function extractHeroImageId(doc: unknown): number | string | null {
  const content = (doc as { content?: unknown })?.content
  if (!Array.isArray(content)) return null
  for (const block of content) {
    if (block && typeof block === 'object' && (block as { blockType?: string }).blockType === 'hero') {
      const image = (block as { image?: unknown }).image
      if (image == null) return null
      if (typeof image === 'number' || typeof image === 'string') return image
      if (typeof image === 'object' && image !== null) {
        const id = (image as { id?: unknown }).id
        if (typeof id === 'number' || typeof id === 'string') return id
      }
      return null
    }
  }
  return null
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
    const heroImageId = extractHeroImageId(doc)
    await payload.update({
      collection: 'projects',
      id: doc.id,
      data: buildMeteorData(heroImageId) as never,
    })
    return NextResponse.json({
      action: 'updated',
      id: doc.id,
      slug: 'meteor',
      url: '/work/meteor',
      preservedHeroImageId: heroImageId,
    })
  }

  const existingPlaceholder = await payload.find({
    collection: 'projects',
    where: { slug: { equals: 'project-two' } },
    limit: 1,
  })

  if (existingPlaceholder.docs.length > 0) {
    const doc = existingPlaceholder.docs[0]
    const heroImageId = extractHeroImageId(doc)
    await payload.update({
      collection: 'projects',
      id: doc.id,
      data: buildMeteorData(heroImageId) as never,
    })
    return NextResponse.json({
      action: 'updated-from-project-two',
      id: doc.id,
      slug: 'meteor',
      url: '/work/meteor',
      preservedHeroImageId: heroImageId,
    })
  }

  const created = await payload.create({
    collection: 'projects',
    data: buildMeteorData() as never,
  })

  return NextResponse.json({
    action: 'created',
    id: created.id,
    slug: 'meteor',
    url: '/work/meteor',
  })
}
