import type { CollectionConfig } from 'payload'
import { parseVideoEmbedUrl } from '../lib/parse-video-embed'

export const Projects: CollectionConfig = {
  slug: 'projects',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'category', 'featured', 'order'],
    group: 'Content',
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      admin: {
        description: 'Application or product name (e.g. "Meteor", "Lacework"). Shown in sidebar and navigation.',
      },
    },
    {
      name: 'cardLine1',
      type: 'text',
      admin: {
        description: 'Card overlay — primary text (large, serif). Typically company or brand. Leave blank to hide.',
      },
    },
    {
      name: 'cardLine2',
      type: 'text',
      admin: {
        description: 'Card overlay — secondary text (smaller, sans). Typically app or product. Leave blank to hide.',
      },
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      admin: {
        description: 'URL-friendly identifier (e.g. "project-one")',
      },
    },
    {
      name: 'category',
      type: 'text',
      required: true,
      admin: {
        description: 'e.g. "Digital toolmaking", "Consumer Product"',
      },
    },
    {
      name: 'featured',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description: 'Featured projects get a larger card on the home page',
      },
    },
    {
      name: 'order',
      type: 'number',
      required: true,
      defaultValue: 0,
      admin: {
        description: 'Display order on the home page (lower = first)',
      },
    },
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Content',
          fields: [
            {
              name: 'introBlurbHeadline',
              type: 'text',
              admin: {
                description: 'Case study title — the creative tension headline (6-10 words). Drives homepage card and intro blurb. Uses Protagonist Framing or Verdict-as-Headline technique.',
              },
            },
            {
              name: 'introBlurbBody',
              type: 'richText',
              admin: {
                description: 'Trailer body, 4-6 sentences, ≤80 words. Flash the outcome in the closer.',
              },
            },
            {
              name: 'description',
              type: 'richText',
              admin: {
                description: 'Deprecated — scope statement is now the first richText block in `content`. Hidden in admin; kept in schema only for backwards compatibility. See ENG-154.',
                condition: () => false,
              },
            },
            {
              name: 'thumbnail',
              type: 'upload',
              relationTo: 'media',
              admin: {
                description: 'Masonry grid thumbnail — independent of the case study hero. Shown on the homepage card.',
              },
            },
            {
              name: 'heroImage',
              type: 'upload',
              relationTo: 'media',
              admin: {
                description: 'Deprecated — thumbnails use the "thumbnail" field; hero uses content blocks.',
                condition: () => false,
              },
            },
            {
              name: 'content',
              type: 'blocks',
              admin: {
                description: 'Case study content blocks — headings, text, images, dividers',
              },
              blocks: [
                {
                  slug: 'heading',
                  labels: { singular: 'Heading', plural: 'Headings' },
                  fields: [
                    {
                      name: 'text',
                      type: 'text',
                      required: true,
                    },
                    {
                      name: 'level',
                      type: 'select',
                      defaultValue: 'h2',
                      options: [
                        { label: 'H2', value: 'h2' },
                        { label: 'H3', value: 'h3' },
                      ],
                    },
                  ],
                },
                {
                  slug: 'richText',
                  labels: { singular: 'Text Block', plural: 'Text Blocks' },
                  fields: [
                    {
                      name: 'body',
                      type: 'richText',
                    },
                  ],
                },
                {
                  slug: 'imageGroup',
                  labels: { singular: 'Image Group', plural: 'Image Groups' },
                  fields: [
                    {
                      name: 'layout',
                      type: 'select',
                      defaultValue: 'auto',
                      options: [
                        { label: 'Auto', value: 'auto' },
                        { label: 'Full Width', value: 'full-width' },
                        { label: '2-Column Equal', value: 'grid-2-equal' },
                        { label: '2-Column Left Heavy', value: 'grid-2-left-heavy' },
                        { label: '2-Column Right Heavy', value: 'grid-2-right-heavy' },
                        { label: '3-Column Bento', value: 'grid-3-bento' },
                        { label: '3-Column Equal', value: 'grid-3-equal' },
                        { label: 'Stacked', value: 'stacked' },
                      ],
                    },
                    {
                      name: 'images',
                      type: 'array',
                      fields: [
                        {
                          name: 'image',
                          type: 'upload',
                          relationTo: 'media',
                          required: true,
                        },
                        {
                          name: 'caption',
                          type: 'text',
                        },
                      ],
                    },
                    {
                      name: 'caption',
                      type: 'text',
                      admin: {
                        description: 'Caption for the entire image group',
                      },
                    },
                    {
                      name: 'placeholderLabels',
                      type: 'json',
                      admin: {
                        description: 'Descriptive labels for image skeleton slots. Cleared when real images are uploaded.',
                        condition: (_data, siblingData) => {
                          const images = (siblingData as Record<string, unknown>)?.images
                          return !images || !Array.isArray(images) || images.length === 0
                        },
                      },
                    },
                  ],
                },
                {
                  slug: 'image',
                  labels: { singular: 'Image', plural: 'Images' },
                  fields: [
                    {
                      name: 'image',
                      type: 'upload',
                      relationTo: 'media',
                      required: false,
                    },
                    {
                      name: 'caption',
                      type: 'text',
                    },
                    {
                      name: 'alt',
                      type: 'text',
                      admin: {
                        description: 'Accessibility alt text. Falls back to caption if empty.',
                      },
                    },
                    {
                      name: 'rowBreak',
                      type: 'checkbox',
                      defaultValue: true,
                      admin: {
                        description:
                          'True = this image starts a new row (stands alone or starts a horizontal group). False = continues the row started by the previous image block.',
                      },
                    },
                    {
                      name: 'widthFraction',
                      type: 'number',
                      required: false,
                      admin: {
                        description:
                          'Optional 0..1 proportion within its row. Null = equal distribution among row members.',
                      },
                    },
                    {
                      name: 'placeholderLabel',
                      type: 'text',
                      admin: {
                        description:
                          'Descriptive label shown when no image is uploaded. Cleared when a real image is attached.',
                        condition: (_data, siblingData) => {
                          const image = (siblingData as Record<string, unknown>)?.image
                          return !image
                        },
                      },
                    },
                  ],
                },
                {
                  slug: 'divider',
                  labels: { singular: 'Divider', plural: 'Dividers' },
                  fields: [],
                },
                {
                  slug: 'hero',
                  labels: { singular: 'Hero Image', plural: 'Hero Images' },
                  fields: [
                    {
                      name: 'image',
                      type: 'upload',
                      relationTo: 'media',
                    },
                    {
                      name: 'placeholderLabel',
                      type: 'text',
                      admin: {
                        description: 'Descriptive label for the hero skeleton. Cleared when a real image is uploaded.',
                        condition: (_data, siblingData) => {
                          const image = (siblingData as Record<string, unknown>)?.image
                          return !image
                        },
                      },
                    },
                    {
                      name: 'caption',
                      type: 'text',
                    },
                  ],
                },
                {
                  slug: 'videoEmbed',
                  labels: { singular: 'Video Embed', plural: 'Video Embeds' },
                  fields: [
                    {
                      name: 'url',
                      type: 'text',
                      admin: {
                        description:
                          'Paste a YouTube, Vimeo, or Loom URL. Privacy-mode variants are used where supported (youtube-nocookie, ?dnt=1).',
                      },
                      validate: ((value: unknown) => {
                        if (!value) return true
                        if (typeof value !== 'string') return 'Must be a string'
                        return parseVideoEmbedUrl(value)
                          ? true
                          : 'Unsupported provider. Use YouTube, Vimeo, or Loom.'
                      }) as never,
                    },
                    {
                      name: 'poster',
                      type: 'upload',
                      relationTo: 'media',
                      filterOptions: () => ({ mimeType: { like: 'image/' } }),
                      admin: {
                        description:
                          'Optional custom thumbnail. YouTube falls back to its auto-thumb; Vimeo/Loom fall back to a neutral placeholder.',
                      },
                    },
                    { name: 'caption', type: 'text' },
                    {
                      name: 'placeholderLabel',
                      type: 'text',
                      admin: {
                        description: 'Descriptive label shown before a URL is pasted.',
                        condition: (_data, siblingData) => {
                          const url = (siblingData as Record<string, unknown>)?.url
                          return !url
                        },
                      },
                    },
                  ],
                },
              ],
            },
            {
              name: 'sections',
              type: 'array',
              admin: {
                description: 'Legacy — migrated to content blocks. Hidden when content blocks exist.',
                condition: (_data, siblingData) => {
                  const content = (siblingData as Record<string, unknown>)?.content
                  return !content || !Array.isArray(content) || content.length === 0
                },
              },
              fields: [
                {
                  name: 'heading',
                  type: 'text',
                  required: true,
                },
                {
                  name: 'body',
                  type: 'richText',
                },
                {
                  name: 'layout',
                  type: 'select',
                  defaultValue: 'auto',
                  options: [
                    { label: 'Auto', value: 'auto' },
                    { label: 'Full Width', value: 'full-width' },
                    { label: '2-Column Equal', value: 'grid-2-equal' },
                    { label: '2-Column Left Heavy', value: 'grid-2-left-heavy' },
                    { label: '2-Column Right Heavy', value: 'grid-2-right-heavy' },
                    { label: '3-Column Bento', value: 'grid-3-bento' },
                    { label: '3-Column Equal', value: 'grid-3-equal' },
                    { label: 'Stacked', value: 'stacked' },
                  ],
                },
                {
                  name: 'showDivider',
                  type: 'checkbox',
                  defaultValue: true,
                },
                {
                  name: 'images',
                  type: 'array',
                  fields: [
                    {
                      name: 'image',
                      type: 'upload',
                      relationTo: 'media',
                      required: true,
                    },
                    {
                      name: 'caption',
                      type: 'text',
                    },
                  ],
                },
                {
                  name: 'caption',
                  type: 'text',
                },
              ],
            },
          ],
        },
        {
          label: 'Meta',
          fields: [
            {
              name: 'role',
              type: 'text',
              admin: {
                description: 'Your role on this project',
              },
            },
            {
              name: 'collaborators',
              type: 'array',
              fields: [
                {
                  name: 'name',
                  type: 'text',
                  required: true,
                },
              ],
            },
            {
            name: 'duration',
            type: 'text',
            admin: {
              description: 'Project length, e.g. "~3 months", "6 weeks", "2024 – Present". Avoid ship dates here — put those in the description.',
            },
            },
            {
              name: 'tools',
              type: 'array',
              fields: [
                {
                  name: 'name',
                  type: 'text',
                  required: true,
                },
              ],
            },
            {
              name: 'externalLinks',
              type: 'array',
              fields: [
                {
                  name: 'label',
                  type: 'text',
                  required: true,
                },
                {
                  name: 'href',
                  type: 'text',
                  required: true,
                },
              ],
            },
          ],
        },
      ],
    },
  ],
}
