import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { makeLexicalParagraph } from '@/lib/lexical'

const LACEWORK_DATA = {
  title: 'Lacework',
  slug: 'lacework',
  category: 'Enterprise SaaS · Data Visualization',
  featured: true,
  order: 1,
  description: makeLexicalParagraph(
    'Lacework (acquired by Fortinet, now FortiCNAPP) is a cloud security platform serving enterprise clients including Snowflake and LendingTree. As the sole designer, I redesigned the License page to support a consumption-based pricing model\u2009—\u2009the same pay-for-what-you-use approach now standard across AI products. I restructured the information architecture, designed interactive usage trend visualizations, and surfaced in-app upselling levers. The feature shipped August 2022, survived the Fortinet acquisition, and remains in production today.'
  ),
  role: 'Product Designer (sole designer)',
  collaborators: [
    { name: 'Product Management' },
    { name: 'Engineering' },
    { name: 'Customer Success' },
  ],
  duration: '~3 months',
  tools: [{ name: 'Figma' }],
  externalLinks: [
    {
      label: 'Fortinet FortiCNAPP Docs',
      href: 'https://docs.fortinet.com/document/forticnapp/latest/administration-guide/237460/subscription-and-usage',
    },
  ],
  sections: [
    {
      heading: 'Restructured Navigation',
      body: makeLexicalParagraph(
        "Half of Lacework\u2019s users didn\u2019t know they could track their own usage\u2009—\u2009the page was buried five layers deep under unrelated features. I moved subscription and usage to the third level, grouped account settings together, and separated subscription (admin-focused) from usage (engineer-focused) into distinct pages. Navigation time dropped from 8s to 4.2s."
      ),
      caption: 'Navigation time: 8s \u2192 4.2s. Discoverability: +100%',
    },
    {
      heading: 'Interactive Usage Trends',
      body: makeLexicalParagraph(
        "Customer Success Managers had abandoned the in-app License page\u2009—\u2009they built Tableau reports instead because the native data was purely numerical. With modular billing making every customer\u2019s package unique, per-customer Tableau maintenance was unsustainable. I designed an interactive trend visualization with adjustable time spans and resource granularity."
      ),
      caption:
        'Resource-level breakdown lets engineers identify exactly which services drive consumption.',
    },
    {
      heading: 'At-a-Glance Overage Status',
      body: makeLexicalParagraph(
        "Users needed an instant signal: am I over or under my subscription? I designed a speedometer-style gauge showing current usage relative to subscription limits\u2009—\u2009universally intuitive and scaling cleanly regardless of overage magnitude, unlike the donut chart it replaced."
      ),
      caption:
        'Three states: healthy, approaching, and overage\u2009—\u2009each with distinct visual treatment.',
    },
    {
      heading: 'In-App Service Discovery',
      body: makeLexicalParagraph(
        "Customers had zero visibility into available services until renewal. With modular billing, sales opportunities exist year-round. I designed an in-app pricing comparison showing service tiers alongside the current subscription with feature-by-feature visibility."
      ),
      caption: null,
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
    where: { slug: { equals: 'project-one' } },
    limit: 1,
  })

  const existingLacework = await payload.find({
    collection: 'projects',
    where: { slug: { equals: 'lacework' } },
    limit: 1,
  })

  if (existingLacework.docs.length > 0) {
    const doc = existingLacework.docs[0]
    await payload.update({
      collection: 'projects',
      id: doc.id,
      data: LACEWORK_DATA as never,
    })
    return NextResponse.json({
      action: 'updated',
      id: doc.id,
      slug: 'lacework',
      url: '/work/lacework',
    })
  }

  if (existingBySlug.docs.length > 0) {
    const doc = existingBySlug.docs[0]
    await payload.update({
      collection: 'projects',
      id: doc.id,
      data: LACEWORK_DATA as never,
    })
    return NextResponse.json({
      action: 'updated-from-project-one',
      id: doc.id,
      slug: 'lacework',
      url: '/work/lacework',
    })
  }

  const created = await payload.create({
    collection: 'projects',
    data: LACEWORK_DATA as never,
  })

  return NextResponse.json({
    action: 'created',
    id: created.id,
    slug: 'lacework',
    url: '/work/lacework',
  })
}
