import type { CollectionConfig } from 'payload'

export const Projects: CollectionConfig = {
  slug: 'projects',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'category', 'featured', 'order'],
    group: 'Work',
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
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
              name: 'description',
              type: 'richText',
              admin: {
                description: 'Case study intro paragraph',
              },
            },
            {
              name: 'heroImage',
              type: 'upload',
              relationTo: 'media',
            },
            {
              name: 'sections',
              type: 'array',
              admin: {
                description: 'Case study content sections',
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
                  name: 'images',
                  type: 'array',
                  fields: [
                    {
                      name: 'image',
                      type: 'upload',
                      relationTo: 'media',
                      required: true,
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
