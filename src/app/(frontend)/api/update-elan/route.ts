import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { markdownToLexical, createCaseStudyBlocks } from '@/lib/content-helpers'

const ELAN_DATA = {
  title: '\u00c9lan Design System',
  slug: 'elan-design-system',
  category: 'Design Systems \u00b7 Design Infrastructure',
  featured: true,
  order: 2,
  introBlurbHeadline: 'Teaching Einstein to build a design system - when he\u2019s six',
  introBlurbBody: markdownToLexical(
    'Sounds ridiculous? That\u2019s what everyone vibe coding an app is dealing with right now. AI has the knowledge of the world - if you teach it how to use it. I\u2019ve been vibe coding since GPT came out. Every session starts from zero. Spacing rules, color decisions, interaction patterns, gone. Afraid of that default Tailwind blue-violet? Me too. I built \u00c9lan to escape AI design slop and ship components that actually look like a designer made them.'
  ),
  description: markdownToLexical(
    '\u00c9lan is a design system I built from scratch as sole designer and engineer. Token architecture, component library, interactive playground, and 54 documented design patterns the agent reads before writing a single component. Every naming convention is machine-parseable. Every guardrail comes from a real correction, not a style guide prescribed upfront. Published as an npm package, consumed by three apps, continuously evolving.'
  ),
  role: 'Designer & Engineer (sole creator)',
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
  content: createCaseStudyBlocks([
    {
      heading: 'How the System Learns',
      bodyMarkdown: 'First time the agent broke dark mode, I wrote it down. Third time, I made it a rule. Now it checks before it touches a single color.',
    },
    {
      heading: 'Naming as Documentation',
      bodyMarkdown: 'color.surface.brand.bold - not color-1, not --primary-dark. The name tells the agent exactly what the token does. No lookup table needed.',
    },
    {
      heading: 'One Component, Seven Corrections',
      bodyMarkdown: 'ScrollSpy took four tries. Click and drag share the same pointer. Turns out you need a 3px dead zone to tell them apart. The model stays the same. The system around it sharpens.',
    },
  ], {
    heroPlaceholderLabel: 'Hero — Design system component library with token architecture',
  }),
}

export async function POST() {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Disabled in production' }, { status: 403 })
  }

  const payload = await getPayload({ config })

  const existingById = await payload.findByID({
    collection: 'projects',
    id: 9,
  }).catch(() => null)

  if (existingById) {
    await payload.update({
      collection: 'projects',
      id: 9,
      data: ELAN_DATA as never,
    })
    return NextResponse.json({
      action: 'updated',
      id: 9,
      slug: 'elan-design-system',
      url: '/work/elan-design-system',
    })
  }

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
      action: 'updated-existing',
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
