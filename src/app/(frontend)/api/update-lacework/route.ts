import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { makeLexicalParagraph } from '@/lib/lexical'
import { createCaseStudyBlocks } from '@/lib/content-helpers'

const LACEWORK_DATA = {
  title: 'Lacework',
  slug: 'lacework',
  category: 'Enterprise SaaS \u00b7 Data Visualization',
  featured: true,
  order: 1,
  introBlurbHeadline: 'I saved the page my own team gave up on',
  introBlurbBody: makeLexicalParagraph(
    "Lacework built a usage page so customers could manage their own subscriptions. Half of them didn't know it existed. Customer success - the team paid to guide users through purchases - didn't use it either. They had Tableau reports instead. Then came the switch to consumption-based billing, where every customer gets a unique package. Read how I rebuilt that page - 58% more usable in 7 weeks."
  ),
  description: makeLexicalParagraph(
    'Lacework (now FortiCNAPP by Fortinet) was a cloud security platform serving enterprise clients including Snowflake and LendingTree. As the sole designer, I redesigned the license and usage experience to support a company-wide shift from flat licensing to consumption-based billing - the same pay-for-what-you-use model now standard across AI products. The 7-week project cut findability time in half and raised self-service usability by 58% in task-based evaluations with internal users.'
  ),
  role: 'Product Designer (sole designer)',
  collaborators: [
    { name: 'Product Management' },
    { name: 'Engineering' },
    { name: 'Customer Success' },
  ],
  duration: '7 weeks',
  tools: [{ name: 'Figma' }],
  externalLinks: [
    {
      label: 'Fortinet FortiCNAPP Docs',
      href: 'https://docs.fortinet.com/document/forticnapp/latest/administration-guide/237460/subscription-and-usage',
    },
  ],
  sections: [],
  content: createCaseStudyBlocks([
    {
      heading: 'Five Matryoshkas Deep',
      bodyMarkdown:
        "Users navigated through navbar, tabs, sections, license, then usage - five nested layers, like cracking open a matryoshka to find the smallest doll. I collapsed the structure to three layers and split subscription from usage: a thumbnail overview for \"am I within my limits?\" with a drill-down for the details.",
      layout: 'grid-2-equal',
      imagePlaceholders: [
        'Before: Navigation with License buried 5 layers deep',
        'After: Restructured IA with Account grouping at 3 layers',
        'Before: Old navigation bar with 12+ tabs',
        'After: Simplified navigation bar with Account section',
        'Subscription overview page with usage thumbnail',
        'Usage detail page - drill-down from thumbnail',
      ],
    },
    {
      heading: 'Build Instead of Buy',
      bodyMarkdown:
        "Tableau was the cheaper, easier choice - CSMs already used it, customers were happy. But consumption-based billing creates unique packages per customer. Maintaining custom Tableau dashboards per client scales worse than the development cost, and keeping data out of the product means zero behavioral insight.",
      layout: 'stacked',
      imagePlaceholders: [
        'Tableau: The poster child dashboard CSMs preferred over the product',
        'Gap analysis: Trends, overage, and breakdown the product page lacked',
        'New in-app usage page with trend visualization and resource granularity',
        'Full subscription overview with linked usage drill-down',
      ],
    },
    {
      heading: 'Donut. Avoid at All Cost.',
      bodyMarkdown:
        "Not the food. The chart. A donut capped overage at 100% - unscalable, and working against the goal of encouraging users to see when they need more. A speedometer tells less: just over or under. That's all users needed.",
      layout: 'stacked',
      imagePlaceholders: [
        'First iteration: Bar chart for usage status',
        'First iteration: Donut chart capping overage at 100%',
        'Exploration: Speedometer vs. stock graph concepts',
        'Final: Speedometer gauge - over or under at a glance',
        'Before and after: Donut overage vs. speedometer overage',
        'Full final page: Speedometer, trends, and resource breakdown',
      ],
    },
  ], {
    heroPlaceholderLabel: 'Hero — Redesigned usage dashboard with consumption-based billing',
  }),
}

export async function POST() {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Disabled in production' }, { status: 403 })
  }

  const payload = await getPayload({ config })

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
