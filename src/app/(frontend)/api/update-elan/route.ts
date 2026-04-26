import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { markdownToLexical, createCaseStudyBlocks } from '@/lib/content-helpers'
import { INTRO_HEADLINE_BY_SLUG } from '@/lib/case-study-intro-headline'

const BLURB_BODY =
  "Every day is a first date. Sounds romantic for a married couple. Sounds like a nightmare for a working relationship.\n\nThat's me and my agent: a Severance-style collaboration where nothing learned from one session carries to the next. After being burned the 50th time, I realized one thing: intelligence was never the bottleneck, context is.\n\nSo I built the memory it never had. Gradually, we stopped starting over. Forty sessions. Fifteen corrections became three. The agent didn't get smarter. It just stopped forgetting."

const SCOPE_STATEMENT =
  "[Élan](https://yilangao-design-system.vercel.app) spans three Next.js apps with tokens, components, and a playground, published as an npm package. I'm the sole designer and engineer. Underneath the visual layer: 16 skills routing my corrections into documentation, 130+ anti-patterns encoding what not to repeat, and an escalation protocol deciding when a rule stops being optional. Over 40+ sessions, corrections dropped from 15 fundamental issues per session to 3 refinement-level ones."

const CONTENT_BLOCKS = createCaseStudyBlocks(
  [
    {
      heading: 'Not the Components',
      bodyMarkdown:
        "The tokens, components, and playground are real and they work. But every hour I spent on the collaboration architecture was an hour not spent polishing what's on screen. That trade-off shows. Below is what it bought: one correction traced from my feedback to permanent rule.",
    },
    {
      heading: 'The System Behind the System',
      bodyMarkdown:
        "I wrote rules for the agent. It ignored some of them. The same playground verification got skipped six times before I made it mandatory. Figuring out where that line sits - when a suggestion needs to become a constraint - is where most of the design time actually went.",
    },
    {
      heading: 'The Rising Floor',
      bodyMarkdown:
        "Early on, I was correcting spacing tokens and inverted hierarchy. Basic stuff. By the end, the corrections looked different: is this headline technique reused from another case study? Should the tone shift here? The agent didn't get smarter. The rules just accumulated what I kept fixing.",
    },
  ],
  {
    heroPlaceholderLabel:
      'Hero - Élan Design System: design playground with token architecture and interactive components',
    scopeStatementMarkdown: SCOPE_STATEMENT,
  },
)

const ELAN_DATA = {
  title: 'Élan Design System',
  slug: 'elan-design-system',
  category: 'Design Systems \u00b7 Self-Improving AI Collaboration',
  featured: true,
  order: 3,
  introBlurbHeadline: INTRO_HEADLINE_BY_SLUG['elan-design-system'],
  introBlurbBody: markdownToLexical(BLURB_BODY),
  content: CONTENT_BLOCKS,
  sections: [],
  role: 'Designer & Engineer',
  collaborators: [
    { name: 'AI Coding Agent (Cursor + Claude)' },
    { name: 'Open-Source Libraries (Radix UI, Carbon, Geist)' },
  ],
  duration: '2026 \u2013 Present',
  tools: [
    { name: 'Figma' },
    { name: 'Next.js 16' },
    { name: 'TypeScript' },
    { name: 'SCSS' },
    { name: 'Payload CMS' },
    { name: 'Radix UI' },
    { name: 'Framer Motion' },
  ],
  externalLinks: [
    {
      label: 'Interactive Playground',
      href: 'https://yilangao-design-system.vercel.app',
    },
    {
      label: 'GitHub Packages',
      href: 'https://github.com/yilangaodesign/design-system',
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
    where: { slug: { equals: 'elan-design-system' } },
    limit: 1,
  })

  if (existingBySlug.docs.length > 0) {
    const doc = existingBySlug.docs[0]
    await payload.update({
      collection: 'projects',
      id: doc.id,
      data: ELAN_DATA as never,
    })
    return NextResponse.json({
      action: 'updated',
      id: doc.id,
      slug: 'elan-design-system',
      url: '/work/elan-design-system',
    })
  }

  const created = await payload.create({
    collection: 'projects',
    data: ELAN_DATA as never,
  })

  return NextResponse.json({
    action: 'created',
    id: created.id,
    slug: 'elan-design-system',
    url: '/work/elan-design-system',
  })
}
