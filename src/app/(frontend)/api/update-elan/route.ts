import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { markdownToLexical, createCaseStudyBlocks } from '@/lib/content-helpers'
import { INTRO_HEADLINE_BY_SLUG } from '@/lib/case-study-intro-headline'

const BLURB_BODY =
  "Every day is a first date. Sounds romantic for a married couple. Sounds like a nightmare for a working relationship.\n\nThat's me and my agent: a Severance-style collaboration where nothing learned from one session carries to the next. Intelligence was never the bottleneck, context is.\n\nSo I built the memory it never had. Forty sessions later: 72% retrieval accuracy on the hardest tasks, both baselines at zero. The agent didn't get smarter, it just stopped forgetting."

const SCOPE_STATEMENT =
  "Engram is an agent memory system I built from scratch. I was vibe-coding a constellation of apps (a personal design system, this portfolio, and a handful of side projects), all with AI agents. I'm the sole builder.\n\nUnderneath all of it is an apparatus: 18 skills routing corrections into the right documentation, 200+ anti-patterns encoding what not to repeat, and a knowledge graph with ~4,892 typed edges making every relationship between rules explicit and auditable. Not documentation. Encoded judgment that agents consume as procedure.\n\nThe site you're browsing right now is built on code generated through that collaboration, with every practice I've learned encoded to scale. But self-learning at scale was never an intelligence problem. It was a context problem. The graphs below is the actual live data and executed Engram experience."

const CONTENT_BLOCKS = createCaseStudyBlocks(
  [
    {
      heading: 'Teach Once, Enforce Forever',
      bodyMarkdown:
        "It started as a vibe-coded experiment. I was shipping apps with Cursor, and the first 80% of each took about 20% of the time. Fun and games.\n\nThen I started polishing, and the remaining 20% flipped the ratio. Every session, the agent repeated mistakes I'd already corrected - hardcoded hex when tokens existed, skipped documented procedures, ignored feedback from two chats ago. Paper cuts, not catastrophes, but they compound.\n\nSo I started a file: one entry per recurring failure mode. Most people stop here, and it works for a while, but in my case, when the file kept growing to 200+, and every task loaded every rule regardless of relevance.\n\nTo fix it, I built a hierarchical system to ensure token efficiency and drift prevention by leveraging a progressive context disclosure structure. Below is what the pipeline looks like.",
    },
    {
      heading: 'The System Behind the System',
      bodyMarkdown:
        "The turning point happened when that one CTA button broke everything. The submit fired twice (engineering), showed no loading state (design), and read \"Click Here\" (content). One incident, three domains, and that was the end of the single-file era.\n\nThe problem was no longer what rules to write but how an agent should find the right one.\n\nI decided to split documentation into three pillars (design, engineering, content) and gave each its own routing: skills that encode process rules, anti-patterns that encode failure modes, and a classification layer that decides which documents a correction should touch.\n\nAnd then I started enjoying the significantly improve flow.",
    },
    {
      heading: 'Organized\u2026 Until It Wasn\u2019t',
      bodyMarkdown:
        "The hierarchical approach was amazing... for a few days. Initially, things were taking off. Around build day 10, rolling novel-% dropped from 67% to 40%. The catalog was catching known patterns and the system felt like it was learning.\n\nThen it climbed back.\n\nBy day 16 it passed 50% again and never came down. The chart below tells the story: the project kept entering new territory faster than the catalog could cover it.\n\nWorse, new rules were quietly contradicting older ones, and the catalog only ever grew. I started calling it rot.\n\nI realized that, three-pillar routing solved the domain problem but introduced a new one: when one anti-pattern strengthens, supersedes, or narrows another, a tree can't surface that. The architecture itself had to change, from hierarchical documents to a graph with typed edges, and measurement had to come alongside it, not after.",
    },
    {
      heading: 'Zero, Zero, Seventy-Two.',
      bodyMarkdown:
        "I needed to know if any of this actually worked. So I designed an experiment: 520 generated tasks, three independent judges scoring blind, no peeking at results until the full run was done.\n\nOn the hardest tasks, where the answer required connecting rules across multiple documents, the graph found the right principle 72% of the time. The hierarchical docs and the no-memory baseline both scored zero. The breakdown is below.\n\nBut the judges rated confident guessing higher than correct-but-messy retrieval. By my own pre-registered rules, the verdict is inconclusive.\n\nBut 72% where both baselines scored zero tells me something: the bottleneck was never intelligence. It was always knowing precisely what happened and what lessons matter. And an agent's memory, it turns out, can be designed.",
    },
  ],
  {
    heroPlaceholderLabel:
      'Hero - Élan Design System: design playground with token architecture and interactive components',
    scopeStatementMarkdown: SCOPE_STATEMENT,
  },
)

const ELAN_DATA = {
  title: 'Engram',
  slug: 'engram',
  category: 'Context Engineering \u00b7 Agent Memory Design',
  featured: true,
  order: 3,
  introBlurbHeadline: INTRO_HEADLINE_BY_SLUG['engram'],
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
  externalLinks: [],
}

export async function POST() {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Disabled in production' }, { status: 403 })
  }

  const payload = await getPayload({ config })

  const existingBySlug = await payload.find({
    collection: 'projects',
    where: { slug: { equals: 'engram' } },
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
      slug: 'engram',
      url: '/work/engram',
    })
  }

  const created = await payload.create({
    collection: 'projects',
    data: ELAN_DATA as never,
  })

  return NextResponse.json({
    action: 'created',
    id: created.id,
    slug: 'engram',
    url: '/work/engram',
  })
}
