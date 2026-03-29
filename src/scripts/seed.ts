import { getPayload } from 'payload'
import config from '@payload-config'

const PROJECTS = [
  { slug: "project-one", title: "Project Title One", category: "Digital toolmaking", featured: true, order: 1 },
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
  "Book Title One",
  "Book Title Two",
  "Book Title Three: A Subtitle Here",
  "Book Title Four",
  "Book Title Five",
  "Book Title Six: Extended Edition",
  "Book Title Seven",
  "Book Title Eight",
  "Book Title Nine: The Complete Guide",
  "Book Title Ten",
  "Book Title Eleven",
  "Book Title Twelve",
  "Book Title Thirteen: Lessons in Design",
  "Book Title Fourteen",
  "Book Title Fifteen",
  "Book Title Sixteen",
  "Book Title Seventeen: An Architecture of Thought",
  "Book Title Eighteen",
  "Book Title Nineteen",
  "Book Title Twenty",
  "Book Title Twenty-One: Fast and Slow",
  "Book Title Twenty-Two",
  "Book Title Twenty-Three",
  "Book Title Twenty-Four",
  "Book Title Twenty-Five: The Art of Building",
]

async function seed() {
  const payload = await getPayload({ config })

  console.log('Seeding projects...')
  for (const project of PROJECTS) {
    const existing = await payload.find({
      collection: 'projects',
      where: { slug: { equals: project.slug } },
      limit: 1,
    })

    if (existing.docs.length === 0) {
      await payload.create({
        collection: 'projects',
        data: {
          ...project,
          role: 'Product Designer',
          duration: '2024 – Present',
          collaborators: [{ name: 'Name Surname' }, { name: 'Design Team' }],
          tools: [{ name: 'Figma' }, { name: 'React' }],
          externalLinks: [{ label: 'Website', href: '#' }],
          sections: [
            {
              heading: 'Section Heading One',
              caption: 'Caption describing the images above.',
            },
            {
              heading: 'Section Heading Two',
              caption: null,
            },
          ],
        },
      })
      console.log(`  Created: ${project.title}`)
    } else {
      console.log(`  Skipped (exists): ${project.title}`)
    }
  }

  console.log('Seeding books...')
  for (let i = 0; i < BOOKS.length; i++) {
    const title = BOOKS[i]
    const existing = await payload.find({
      collection: 'books',
      where: { title: { equals: title } },
      limit: 1,
    })

    if (existing.docs.length === 0) {
      await payload.create({
        collection: 'books',
        data: { title, order: i + 1 },
      })
      console.log(`  Created: ${title}`)
    } else {
      console.log(`  Skipped (exists): ${title}`)
    }
  }

  console.log('Seeding site config...')
  await payload.updateGlobal({
    slug: 'site-config',
    data: {
      name: 'Yilan Gao',
      role: 'UX Designer',
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
        { label: 'Reading', href: '/reading', external: false },
        { label: 'Linkedin', href: '#', external: true },
        { label: 'Instagram', href: '#', external: true },
        { label: 'Twitter', href: '#', external: true },
      ],
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
  console.log('  Site config updated.')

  console.log('Seed complete!')
  process.exit(0)
}

seed().catch((err) => {
  console.error('Seed failed:', err)
  process.exit(1)
})
