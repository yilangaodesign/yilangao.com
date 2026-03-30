import type { CollectionConfig } from 'payload'

function sanitizeFilename(filename: string): string {
  const lastDot = filename.lastIndexOf('.')
  const ext = lastDot > 0 ? filename.slice(lastDot) : ''
  const stem = lastDot > 0 ? filename.slice(0, lastDot) : filename

  const clean = stem
    .replace(/[\[\]{}()]/g, '')
    .replace(/[^a-zA-Z0-9._-]/g, '-')
    .replace(/-{2,}/g, '-')
    .replace(/^-|-$/g, '')

  return (clean || 'upload') + ext
}

export const Media: CollectionConfig = {
  slug: 'media',
  labels: {
    singular: 'File',
    plural: 'Files',
  },
  admin: {
    group: 'System',
    description:
      'Upload images, PDFs, and documents. Filenames are automatically cleaned for web compatibility — brackets, spaces, and special characters are replaced with hyphens.',
  },
  access: {
    read: () => true,
  },
  hooks: {
    beforeChange: [
      ({ data }) => {
        if (data?.filename) {
          data.filename = sanitizeFilename(data.filename)
        }
        if (data?.sizes && typeof data.sizes === 'object') {
          for (const size of Object.values(data.sizes) as Array<{ filename?: string }>) {
            if (size?.filename) {
              size.filename = sanitizeFilename(size.filename)
            }
          }
        }
        return data
      },
    ],
  },
  upload: {
    staticDir: 'media',
    imageSizes: [
      {
        name: 'thumbnail',
        width: 400,
        height: 300,
        position: 'centre',
      },
      {
        name: 'card',
        width: 768,
        height: 512,
        position: 'centre',
      },
      {
        name: 'hero',
        width: 1920,
        position: 'centre',
      },
    ],
    adminThumbnail: 'thumbnail',
    mimeTypes: ['image/*', 'application/pdf'],
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
      label: 'Description (Alt Text)',
      admin: {
        description:
          'Describe what\'s in this file. Used for accessibility (screen readers) and search engines. For documents like resumes, use the document title.',
        placeholder: 'e.g., Yilan Gao — Resume 2026',
      },
    },
    {
      name: 'caption',
      type: 'text',
      label: 'Caption',
      admin: {
        description:
          'Optional text displayed below the image when it appears on the site. Leave empty if no caption is needed.',
        placeholder: 'e.g., Design review — Q3 2026',
      },
    },
  ],
}
