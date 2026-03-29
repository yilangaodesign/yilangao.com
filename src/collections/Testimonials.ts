import type { CollectionConfig } from 'payload'

export const Testimonials: CollectionConfig = {
  slug: 'testimonials',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'role', 'order'],
    description: 'Client/colleague testimonials shown on the contact page.',
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'text',
      type: 'textarea',
      required: true,
      admin: {
        description: 'The testimonial quote',
      },
    },
    {
      name: 'name',
      type: 'text',
      required: true,
      admin: {
        description: 'Person\'s full name',
      },
    },
    {
      name: 'role',
      type: 'text',
      required: true,
      admin: {
        description: 'e.g. "VP of Product, Company"',
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
