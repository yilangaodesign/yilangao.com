import type { CollectionConfig } from 'payload'

export const Experiments: CollectionConfig = {
  slug: 'experiments',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'num', 'date', 'order'],
    description: 'Creative coding experiments and side projects.',
    group: 'Experiments',
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'num',
      type: 'text',
      required: true,
      admin: {
        description: 'Display number, e.g. "01"',
      },
    },
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
        description: 'URL-friendly identifier (e.g. "ascii-shader")',
      },
    },
    {
      name: 'description',
      type: 'textarea',
      required: true,
    },
    {
      name: 'tags',
      type: 'array',
      fields: [
        {
          name: 'tag',
          type: 'text',
          required: true,
        },
      ],
    },
    {
      name: 'date',
      type: 'text',
      required: true,
      admin: {
        description: 'Display date, e.g. "Mar 2026"',
      },
    },
    {
      name: 'order',
      type: 'number',
      required: true,
      defaultValue: 0,
      admin: {
        description: 'Display order (lower = first)',
      },
    },
  ],
}
