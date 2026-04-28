import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { markdownToLexical, createCaseStudyBlocks } from '@/lib/content-helpers'
import { INTRO_HEADLINE_BY_SLUG } from '@/lib/case-study-intro-headline'

const BLURB_BODY =
  "Every day is a first date. Sounds romantic for a married couple. Sounds like a nightmare for a working relationship.\n\nThat's me and my agent: a Severance-style collaboration where nothing learned from one session carries to the next. After being burned the 50th time, I realized one thing: intelligence was never the bottleneck, context is.\n\nSo I built the memory it never had. Gradually, we stopped starting over. Forty sessions. 200+ anti-patterns. The agent didn't get smarter. It just stopped forgetting."

const SCOPE_STATEMENT =
  "[Élan](https://yilangao-design-system.vercel.app) spans three Next.js apps with tokens, components, and a playground, published as an npm package. I'm the sole designer and engineer. Underneath the visual layer is an apparatus: 18 skills routing corrections into the right documentation, 200+ anti-patterns encoding what not to repeat, and a knowledge graph with ~4,892 typed edges making every relationship between rules explicit and auditable. The design system itself is alive — but the artifact isn't the design system. It's the memory, the routing, the audit loop, and the measurement framework around it. The graph below is live."

const CONTENT_BLOCKS = createCaseStudyBlocks(
  [
    {
      heading: 'Teach Once, Enforce Forever',
      bodyMarkdown:
        "The agent kept making the same mistakes. Not catastrophic ones — a missing loading state here, a hardcoded string there — but the cost was steady. I'd fix something in session 12 and re-fix it in session 19.\n\nSo I started writing it down. One correction became a documented anti-pattern, which became a rule the agent could cite on its own. Below is what that pipeline looks like: a single piece of feedback traced from the moment I give it to the permanent rule it becomes. The human teaches once. The system enforces forever.",
    },
    {
      heading: 'The System Behind the System',
      bodyMarkdown:
        "One CTA button broke everything. The submit fired twice (engineering: missing debounce and idempotency key), showed no loading state (design: no spinner), and read \"Click Here\" (content: wrong copy). One incident, three domains.\n\nThat's when the single-doc approach collapsed. Forcing a correction into one bucket lost the other two dimensions. I split documentation into three pillars — design, engineering, content — and added multi-category classification so a single fix could route to all three. The routing worked, but the catalog kept growing. 200+ anti-patterns, 18 skills. New rules started conflicting with older ones. The system scaled; its accuracy didn't. That silent decay is what eventually forced the graph.",
    },
    {
      heading: 'The Living Graph',
      bodyMarkdown:
        "When one anti-pattern strengthens, supersedes, or narrows another, that relationship was buried in prose. A regex extractor lifted those implicit references into typed edges — six relationship types, each with a confidence score. An audit enforcer now validates every new entry against the existing graph at write time: contradictions surface before they ship.\n\nThe result is ~995 nodes connected by ~4,892 edges. The graph below is live — the auto-transition tours its topology, starting from signal hubs and ending at the full mesh. But a graph this size raises a question the graph itself can't answer.",
    },
    {
      heading: 'Is Any of This Working?',
      bodyMarkdown:
        "200+ anti-patterns. 18 skills. ~5,000 graph edges. An audit enforcer that checks every commit. The system exists. But does the agent actually obey any of it? The catalog could be perfect and the agent could still ignore it. Without measurement, I'm tuning a system I've never validated.\n\nSo I built a 12-task eval corpus — gold anti-patterns, foils, confound profiles — and a comparator: bare baseline (no skills, no routing, no graph) versus the full system. LLM-as-judge scores each run. The baseline is sealed; the comparator runs next.\n\nThe design system itself is alive, but it isn't the artifact. The artifact is the apparatus around the design system: the memory, the routing, the audit, the experiment. The honest answer is that I don't know yet whether it works. The next deliverable is a number, not a feature.",
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
