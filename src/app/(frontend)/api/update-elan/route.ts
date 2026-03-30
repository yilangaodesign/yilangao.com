import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { makeLexicalParagraph } from '@/lib/lexical'

const ELAN_DATA = {
  title: 'Élan Design System',
  slug: 'elan-design-system',
  category: 'Design Systems · AI-Native Tooling · Vibe Coding',
  featured: true,
  order: 2,
  description: makeLexicalParagraph(
    '\u00c9lan is a design system I built from scratch in 2 days through human-AI co-evolution\u2009—\u2009token architecture, component library, and interactive playground, designed so an AI agent can read, generate, and self-correct without external documentation. The harness constrains the agent; the agent improves the harness.'
  ),
  role: 'Designer & Engineer (sole creator)',
  collaborators: [
    { name: 'AI Coding Agent (Cursor + Claude)' },
    { name: 'Open-Source Libraries' },
  ],
  duration: '2 days',
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
      href: 'https://localhost:4001',
    },
    {
      label: 'GitHub Packages',
      href: 'https://github.com/yilangaodesign/design-system',
    },
  ],
  sections: [
    {
      heading: 'Agent Harness Architecture',
      body: makeLexicalParagraph(
        "The harness that constrains and co-evolves with the AI agent\u2009—\u2009dual evaluation, 3-domain feedback routing, and guardrails that tighten with every repeated failure."
      ),
      caption: 'Dual evaluation (AI pre-check + human review) \u00b7 3-domain routing \u00b7 Self-tightening guardrails',
    },
    {
      heading: 'Agent-Native Semantic Tokens',
      body: makeLexicalParagraph(
        "Using color as the example domain: a token naming convention where every name fully describes its intent\u2009—\u2009so agents can generate and validate tokens without a lookup table."
      ),
      caption: 'Goldman Sachs\u2013inspired property \u00b7 role \u00b7 emphasis naming \u00b7 Machine-readable by default',
    },
    {
      heading: 'Systemic Pattern Map',
      body: makeLexicalParagraph(
        "Patterns invisible to individual incidents become obvious in aggregate. Four categories hit the 3-strike threshold and promoted to hard guardrails."
      ),
      caption: '47 incidents \u00b7 6 failure categories \u00b7 Documented \u2192 Audited \u2192 Guardrailed',
    },
    {
      heading: 'ScrollSpy \u2014 A Micro-Interaction Deep Dive',
      body: makeLexicalParagraph(
        "One component, 7 anti-patterns, 4 iterations. Click and drag share the same pointer\u2009—\u2009a 3px dead zone discriminates intent."
      ),
      caption: '7 anti-patterns \u00b7 AP-011 pointer mapping \u00b7 AP-012 dead zone \u00b7 AP-031 Framer Motion transform conflict',
    },
  ],
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
