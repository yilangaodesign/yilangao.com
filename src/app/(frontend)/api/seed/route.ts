import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

import { SITE_ROLE_DISPLAY } from '@/lib/site-role-display'

const PROJECTS = [
  { slug: "lacework", title: "Lacework", category: "Enterprise SaaS \u00b7 Data Visualization", featured: true, order: 1 },
  { slug: "project-two", title: "Project Title Two", category: "Consumer Product", featured: true, order: 2 },
  { slug: "project-three", title: "Project Title Three", category: "Productivity", featured: true, order: 3 },
  { slug: "project-four", title: "Project Title Four", category: "AI code editor", featured: false, order: 4 },
  { slug: "project-five", title: "Project Title Five", category: "Assistive AI Agents", featured: false, order: 5 },
  { slug: "project-six", title: "Project Title Six", category: "Conversational AI", featured: false, order: 6 },
  { slug: "project-seven", title: "Project Title Seven", category: "Editor Tool", featured: false, order: 7 },
  { slug: "project-eight", title: "Project Title Eight", category: "Data Visualization", featured: false, order: 8 },
  { slug: "project-nine", title: "Project Title Nine", category: "Industrial Design", featured: false, order: 9 },
  { slug: "project-ten", title: "Project Title Ten", category: "Conversational AI", featured: false, order: 10 },
  { slug: "project-eleven", title: "Project Title Eleven", category: "Productivity Tooling", featured: false, order: 11 },
  { slug: "project-twelve", title: "Project Title Twelve", category: "Multiplayer Art", featured: false, order: 12 },
]

const BOOKS = [
  "Book Title One", "Book Title Two", "Book Title Three: A Subtitle Here",
  "Book Title Four", "Book Title Five", "Book Title Six: Extended Edition",
  "Book Title Seven", "Book Title Eight", "Book Title Nine: The Complete Guide",
  "Book Title Ten", "Book Title Eleven", "Book Title Twelve",
  "Book Title Thirteen: Lessons in Design", "Book Title Fourteen", "Book Title Fifteen",
  "Book Title Sixteen", "Book Title Seventeen: An Architecture of Thought",
  "Book Title Eighteen", "Book Title Nineteen", "Book Title Twenty",
  "Book Title Twenty-One: Fast and Slow", "Book Title Twenty-Two",
  "Book Title Twenty-Three", "Book Title Twenty-Four",
  "Book Title Twenty-Five: The Art of Building",
]

const TESTIMONIALS = [
  {
    text: "Working with Yilan was a transformative experience. The attention to detail and user-centered thinking elevated our product beyond expectations.",
    name: "Sarah Chen",
    role: "VP of Product, Acme Corp",
    linkedinUrl: "#",
    showOnHome: true,
    order: 1,
  },
  {
    text: "Yilan brings a rare combination of technical understanding and design sensibility. Every interaction was thoughtful and intentional.",
    name: "Marcus Rivera",
    role: "Engineering Lead, Globex",
    linkedinUrl: "#",
    showOnHome: false,
    order: 2,
  },
  {
    text: "The design system Yilan built for us became the foundation of everything we shipped. It was elegant, scalable, and a joy to work with.",
    name: "Jamie Okafor",
    role: "CTO, Initech",
    linkedinUrl: "#",
    showOnHome: true,
    order: 3,
  },
  {
    text: "Yilan has an extraordinary ability to synthesize complex user research into clear, actionable design direction. Our conversion rate improved 40% after the redesign.",
    name: "Priya Sharma",
    role: "Head of Growth, Umbrella",
    linkedinUrl: "#",
    showOnHome: false,
    order: 4,
  },
  {
    text: "What sets Yilan apart is the systems thinking. Every component, every interaction, every micro-animation serves the bigger picture.",
    name: "Alex Kim",
    role: "Design Director, Stark Ind",
    linkedinUrl: "#",
    showOnHome: true,
    order: 5,
  },
]

const EXPERIMENTS = [
  {
    slug: "ascii-shader", num: "01", title: "ASCII Shader Engine",
    description: "Real-time WebGL shader that converts any video feed into dynamic ASCII art. Built with custom GLSL fragment shaders and a character-density mapping algorithm.",
    tags: [{ tag: "WebGL" }, { tag: "GLSL" }, { tag: "Creative Coding" }],
    date: "Mar 2026", order: 1,
  },
  {
    slug: "generative-grid", num: "02", title: "Generative Grid System",
    description: "A procedurally generated layout engine that creates unique editorial compositions on every page load, inspired by Swiss design and computational art.",
    tags: [{ tag: "Generative Art" }, { tag: "Canvas API" }, { tag: "Typography" }],
    date: "Feb 2026", order: 2,
  },
  {
    slug: "spatial-audio", num: "03", title: "Spatial Audio Visualizer",
    description: "3D audio-reactive environment built with Three.js and the Web Audio API. Sound frequency data drives particle behavior, color fields, and camera movement in real time.",
    tags: [{ tag: "Three.js" }, { tag: "Web Audio" }, { tag: "3D" }],
    date: "Jan 2026", order: 3,
  },
  {
    slug: "scroll-physics", num: "04", title: "Scroll Physics Playground",
    description: "An exploration of inertia, spring dynamics, and momentum-based scroll interactions. Each section demonstrates a different physics model driving UI transitions.",
    tags: [{ tag: "Framer Motion" }, { tag: "Physics" }, { tag: "Interaction" }],
    date: "Dec 2025", order: 4,
  },
  {
    slug: "type-morph", num: "05", title: "Typographic Morphing",
    description: "Variable font axes animated through scroll and cursor position. Letterforms continuously morph between weight, width, and optical size in response to user input.",
    tags: [{ tag: "Variable Fonts" }, { tag: "CSS" }, { tag: "Animation" }],
    date: "Nov 2025", order: 5,
  },
  {
    slug: "data-sculpture", num: "06", title: "Data Sculpture",
    description: "Transforms live API data streams into abstract 3D forms. Each data point influences geometry, material, and light — turning numbers into a living sculpture.",
    tags: [{ tag: "Three.js" }, { tag: "Data Viz" }, { tag: "API" }],
    date: "Oct 2025", order: 6,
  },
]

const CLIENTS = [
  { name: "Acme Corp", url: "https://example.com" },
  { name: "Globex", url: "https://example.com" },
  { name: "Initech", url: "https://example.com" },
  { name: "Umbrella", url: "https://example.com" },
  { name: "Stark Ind", url: "https://example.com" },
  { name: "Wayne Corp", url: "https://example.com" },
  { name: "Cyberdyne", url: "https://example.com" },
  { name: "Soylent", url: "https://example.com" },
  { name: "Tyrell", url: "https://example.com" },
  { name: "Weyland", url: "https://example.com" },
]

async function createIfNotExists(
  payload: Awaited<ReturnType<typeof getPayload>>,
  collection: string,
  where: Record<string, unknown>,
  data: Record<string, unknown>,
): Promise<boolean> {
  const existing = await payload.find({
    collection: collection as 'projects',
    where: where as never,
    limit: 1,
  })
  if (existing.docs.length === 0) {
    await payload.create({ collection: collection as 'projects', data: data as never })
    return true
  }
  return false
}

export async function POST() {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Seed disabled in production' }, { status: 403 })
  }

  const payload = await getPayload({ config })
  const log: string[] = []

  // Projects
  for (const project of PROJECTS) {
    const created = await createIfNotExists(payload, 'projects', { slug: { equals: project.slug } }, {
      ...project,
      role: 'Product Designer',
      duration: '~6 months',
      collaborators: [{ name: 'Name Surname' }, { name: 'Design Team' }],
      tools: [{ name: 'Figma' }, { name: 'React' }],
      externalLinks: [{ label: 'Website', href: '#' }],
      sections: [
        { heading: 'Section Heading One', caption: 'Caption describing the images above.' },
        { heading: 'Section Heading Two', caption: null },
      ],
    })
    log.push(`${created ? '✓' : '–'} Project: ${project.title}`)
  }

  // Books
  for (let i = 0; i < BOOKS.length; i++) {
    const title = BOOKS[i]
    const created = await createIfNotExists(payload, 'books', { title: { equals: title } }, { title, order: i + 1 })
    log.push(`${created ? '✓' : '–'} Book: ${title}`)
  }

  // Testimonials
  for (const t of TESTIMONIALS) {
    const created = await createIfNotExists(payload, 'testimonials', { name: { equals: t.name } }, t)
    log.push(`${created ? '✓' : '–'} Testimonial: ${t.name}`)
  }

  // Experiments
  for (const e of EXPERIMENTS) {
    const created = await createIfNotExists(payload, 'experiments', { slug: { equals: e.slug } }, e)
    log.push(`${created ? '✓' : '–'} Experiment: ${e.title}`)
  }

  // Site Config
  await payload.updateGlobal({
    slug: 'site-config',
    data: {
      name: 'Yilan Gao',
      role: SITE_ROLE_DISPLAY,
      location: 'City, ST',
      email: 'hello@example.com',
      teams: [
        { name: 'Company Name', url: '#' },
        { name: 'Company Name', url: '#' },
        { name: 'Company Name', url: '#' },
        { name: 'Company Name', url: '#' },
        { name: 'Company Name', url: '#' },
      ],
      socialLinks: [
        {
          label: 'Élan Design System',
          href: 'https://yilangao-design-system.vercel.app/',
          external: true,
        },
        {
          label: 'Resume',
          href: 'https://drive.google.com/file/d/1q2mTu7UlnfcgI8S99nETxWVPz02ViFBO/view?usp=sharing',
          external: true,
        },
        { label: 'Linkedin', href: 'https://www.linkedin.com/in/yilangao/', external: true },
      ],
      clients: CLIENTS,
      experience: [
        { role: 'Product Designer', company: 'Company Name', period: '2024 – Present' },
        { role: 'UX Designer', company: 'Company Name', period: '2022 – 2024' },
        { role: 'Design Intern', company: 'Company Name', period: '2021 – 2022' },
      ],
      education: [
        { degree: 'M.S. Human-Computer Interaction', institution: 'University Name', period: '2020 – 2022' },
        { degree: 'B.A. Design', institution: 'University Name', period: '2016 – 2020' },
      ],
    },
  })
  log.push('✓ Site Config: updated')

  return NextResponse.json({
    message: 'Seed complete',
    summary: {
      projects: PROJECTS.length,
      books: BOOKS.length,
      testimonials: TESTIMONIALS.length,
      experiments: EXPERIMENTS.length,
      clients: CLIENTS.length,
    },
    log,
  })
}
