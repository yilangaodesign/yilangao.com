import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { markdownToLexical, createCaseStudyBlocks } from '@/lib/content-helpers'
import { INTRO_HEADLINE_BY_SLUG } from '@/lib/case-study-intro-headline'

const BLURB_BODY =
  "Every day is a first date. Sounds romantic for a married couple. Sounds like a nightmare for a working relationship.\n\nThat's me and my agent: a Severance-style collaboration where nothing learned from one session carries to the next. After being burned the 50th time, I realized one thing: intelligence was never the bottleneck, context is.\n\nSo I built the memory it never had. Gradually, we stopped starting over. Forty sessions. 200+ anti-patterns. The agent didn't get smarter. It just stopped forgetting."

const SCOPE_STATEMENT =
  "[Élan](https://yilangao-design-system.vercel.app) is a design system I built from scratch, spanning three Next.js apps with tokens, components, and a playground, published as an npm package. I'm the sole designer and engineer. Underneath the visual layer is an apparatus: 18 skills routing corrections into the right documentation, 200+ anti-patterns encoding what not to repeat, and a knowledge graph with ~4,892 typed edges making every relationship between rules explicit and auditable. The design system itself is alive, but the artifact isn't the design system. It's the memory, the routing, the audit loop, and the measurement framework around it. The graph below is live."

const CONTENT_BLOCKS = createCaseStudyBlocks(
  [
    {
      heading: 'Teach Once, Enforce Forever',
      bodyMarkdown:
        "\u00c9lan started as a personal design system. I was vibe-coding it: cursor in one hand, deadline in the other. Two weeks in, the agent kept making the same mistakes: hardcoded hex values when tokens existed, forgot the playground needed a flush before HMR could deliver edits, added em dashes to portfolio text after I'd corrected it twice.\n\nThe cost wasn't catastrophic, but it was steady. So I started a file: one entry per recurring failure mode. A correction became a documented anti-pattern, which became a rule the agent could cite without being told again. Below is what that pipeline looks like.",
    },
    {
      heading: 'The System Behind the System',
      bodyMarkdown:
        "One CTA button broke everything. The submit fired twice (engineering: missing debounce and idempotency key), showed no loading state (design: no spinner), and read \"Click Here\" (content: wrong copy). One incident, three domains. That's when the single-doc approach collapsed.\n\nI split documentation into three pillars (design, engineering, content) and added multi-category classification so one correction could route to all three. Each pillar got its own semantic structure: skills that encode process rules, anti-patterns that encode failure modes, and a routing layer that decides which documents a new correction should touch. Four weeks and 300+ corrections later, I had 200+ anti-patterns and 18 skills. The system below shows the scale of what I built.",
    },
    {
      heading: 'Organized\u2026 Until It Wasn\u2019t',
      bodyMarkdown:
        "It looked like it was working. Around build day 10, rolling novel-% dropped from 67% to 40%. The catalog was catching known patterns and the system felt like it was learning. Then it climbed back. By day 16 it passed 50% again and never came down. The chart below tells the story: the project kept entering new territory faster than the catalog could cover it.\n\nWorse, new rules were quietly contradicting older ones, and the catalog only ever grew. I started calling it rot. The numbers matched what I was reading about agent memory and retrieval-augmented generation: without explicit relationship modeling, flat knowledge systems decay silently. When one anti-pattern strengthens, supersedes, or narrows another, a categorized list can't surface that. I needed a different structure, and I needed measurement alongside it, not after.",
    },
    {
      heading: '0, 0, 72.',
      bodyMarkdown:
        "520 generations, three independent judges scoring blind. On tasks where the answer required connecting rules across multiple documents, the graph found the right principle 72% of the time. The old docs and the bare model scored zero. The breakdown is below.\n\nBut the judges rated confident guessing higher than correct-but-messy retrieval. By my own pre-registered rules, the verdict is inconclusive. The agent still hasn't stopped forgetting - it just started remembering where to look.",
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
