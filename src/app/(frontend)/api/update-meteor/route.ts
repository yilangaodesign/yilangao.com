import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { makeLexicalParagraph } from '@/lib/lexical'

const METEOR_DATA = {
  title: 'Meteor',
  slug: 'meteor',
  category: 'Financial Operations \u00b7 Founding Design',
  featured: true,
  order: 3,
  description: makeLexicalParagraph(
    'Goldman Sachs\u2019s ETF desk manages 200+ funds with a team that barely scaled\u2009\u2014\u2009portfolio managers were reviewing 12,000 lines of data nightly in spreadsheets, routinely working past 10\u202fPM. As the first and only designer on the engineering team, I designed Meteor from zero: a basket management platform that reduced human review to 560 flagged lines, earning enough user trust that within six weeks of launch, PMs stopped spot-checking the system entirely.'
  ),
  role: 'Product Designer (sole designer, founding)',
  collaborators: [
    { name: '9 Engineers' },
    { name: '3 Time Zones (NY, London, India)' },
    { name: 'Portfolio Managers (Equities Desk)' },
    { name: 'Portfolio Managers (Fixed Income Desk)' },
  ],
  duration: '~8 months (0 \u2192 MVP)',
  tools: [{ name: 'Figma' }],
  externalLinks: [] as { label: string; href: string }[],
  sections: [
    {
      heading: 'The Trust Problem',
      body: makeLexicalParagraph(
        'Trust isn\u2019t binary\u2009\u2014\u2009users don\u2019t flip from \u201cI don\u2019t trust this\u201d to \u201cI trust this.\u201d They build confidence through micro-verifications, and the system\u2019s job is to support that progression at every layer.'
      ),
      caption: '12,000 lines \u2192 560 flagged \u00b7 Review time: 80\u202fmin \u2192 8\u202fmin per basket \u00b7 45+ baskets daily',
    },
    {
      heading: 'Leverage-Based Scoping',
      body: makeLexicalParagraph(
        'Upstream errors cascade\u2009\u2014\u2009if basket management is wrong, every downstream order is wrong too. I mapped the full portfolio management lifecycle to find where one designer\u2019s effort would have the highest leverage.'
      ),
      caption: 'ETF lifecycle: Fund Launch \u2192 Holdings \u2192 Basket Management \u2192 Order Management',
    },
    {
      heading: 'Adoption Sequencing',
      body: makeLexicalParagraph(
        'Same product type doesn\u2019t mean same workflow\u2009\u2014\u2009Fixed Income and Equities have fundamentally different tool readiness, mental models, and failure modes. I chose the team whose pain was acute and switching cost low, knowing an early win would unlock adoption across the floor.'
      ),
      caption: 'EQ: zero internal tooling, desperate for change \u00b7 FI: legacy tools, entrenched habits \u00b7 EQ first \u2192 internal precedent',
    },
    {
      heading: 'ETRO \u2014 Progressive Trust Calibration',
      body: makeLexicalParagraph(
        'I designed a progressive trust calibration framework\u2009\u2014\u2009four principles that scaffold human confidence in automated data: Explainability (show me why), Traceability (show me what changed), Reversibility (let me undo), Observability (make me accountable).'
      ),
      caption: 'Severity tier reasoning \u00b7 Corporate actions diff view \u00b7 Rebalancing preview sandbox \u00b7 Override justification with deliberate friction',
    },
  ],
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
