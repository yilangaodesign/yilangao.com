import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { markdownToLexical, createCaseStudyBlocks } from '@/lib/content-helpers'

const BLURB_HEADLINE = "You're looking at the wrong part."

const BLURB_BODY =
  "I built a design system for vibe coding. You've probably heard this story before. You may have built your own, or at least thought about it.\n\nThis isn't about that. Everyone's excited about making design systems readable to agents. I want to show you what happened when I documented the failures instead - each correction became a rule the agent couldn't break next time. After forty sessions, the corrections nearly disappeared. Not because the work got easier."

const SCOPE_STATEMENT =
  "Élan spans three Next.js apps with tokens, components, and a playground, published as an npm package. I'm the sole designer and engineer. The visual layer took effort, but it's not where most of the time went. Underneath: 16 skills routing my corrections into documentation, 130+ anti-patterns encoding what not to repeat, and an escalation protocol deciding when a rule stops being optional. Over 40+ sessions, corrections dropped from 15 fundamental issues per session to 3 refinement-level ones."

const CONTENT_BLOCKS = createCaseStudyBlocks(
  [
    {
      heading: 'Not the Components',
      bodyMarkdown:
        "The tokens, components, and playground are real and they work. But every hour I spent on the collaboration architecture was an hour not spent polishing what's on screen. That trade-off shows. Below is what it bought: one correction traced from my feedback to permanent rule.",
      layout: 'stacked',
      imagePlaceholders: [
        'Before and after: the same design task handled in session 1 vs. session 40',
      ],
    },
    {
      heading: 'The System Behind the System',
      bodyMarkdown:
        "I wrote rules for the agent. It ignored some of them. The same playground verification got skipped six times before I made it mandatory. Figuring out where that line sits - when a suggestion needs to become a constraint - is where most of the design time actually went.",
      layout: 'stacked',
    },
    {
      heading: 'The Rising Floor',
      bodyMarkdown:
        "Early on, I was correcting spacing tokens and inverted hierarchy. Basic stuff. By the end, the corrections looked different: is this headline technique reused from another case study? Should the tone shift here? The agent didn't get smarter. The rules just accumulated what I kept fixing.",
      layout: 'stacked',
    },
  ],
  {
    heroPlaceholderLabel:
      'Hero - Élan Design System: design playground with token architecture and interactive components',
  },
)

const ELAN_DATA = {
  title: 'Élan Design System',
  slug: 'elan-design-system',
  category: 'Design Systems \u00b7 AI Collaboration Architecture',
  featured: true,
  order: 3,
  introBlurbHeadline: BLURB_HEADLINE,
  introBlurbBody: markdownToLexical(BLURB_BODY),
  description: markdownToLexical(SCOPE_STATEMENT),
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
