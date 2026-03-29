import sharp from 'sharp'
import path from 'path'
import { fileURLToPath } from 'url'
import { buildConfig } from 'payload'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { postgresAdapter } from '@payloadcms/db-postgres'

import { Users } from './collections/Users.ts'
import { Media } from './collections/Media.ts'
import { Projects } from './collections/Projects.ts'
import { Books } from './collections/Books.ts'
import { Testimonials } from './collections/Testimonials.ts'
import { Experiments } from './collections/Experiments.ts'
import { SiteConfig } from './globals/SiteConfig.ts'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:4000'

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
    livePreview: {
      url: ({ data, collectionConfig, globalConfig }) => {
        if (collectionConfig) {
          switch (collectionConfig.slug) {
            case 'projects':
              return `${SITE_URL}/work/${data?.slug || ''}`
            case 'books':
              return `${SITE_URL}/reading`
            case 'testimonials':
              return `${SITE_URL}/contact`
            case 'experiments':
              return `${SITE_URL}/experiments`
          }
        }
        if (globalConfig?.slug === 'site-config') {
          return `${SITE_URL}/`
        }
        return `${SITE_URL}/`
      },
      breakpoints: [
        { label: 'Mobile', name: 'mobile', width: 375, height: 667 },
        { label: 'Tablet', name: 'tablet', width: 768, height: 1024 },
        { label: 'Desktop', name: 'desktop', width: 1440, height: 900 },
      ],
      collections: ['projects', 'books', 'testimonials', 'experiments'],
      globals: ['site-config'],
    },
  },
  editor: lexicalEditor(),
  collections: [Users, Media, Projects, Books, Testimonials, Experiments],
  globals: [SiteConfig],
  secret: process.env.PAYLOAD_SECRET || 'CHANGE-ME-IN-PRODUCTION',
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL || '',
    },
  }),
  sharp,
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
})
