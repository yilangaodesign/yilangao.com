import type { CollectionConfig } from 'payload'

export const Testimonials: CollectionConfig = {
  slug: 'testimonials',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'role', 'showOnHome', 'order'],
    description: 'Client/colleague testimonials shown on the contact page and homepage grid.',
    group: 'Contact',
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'text',
      type: 'richText',
      required: true,
      admin: {
        description: 'The testimonial quote (supports bold/italic formatting)',
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
      name: 'avatar',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description: 'Profile photo (optional — initials shown when empty)',
      },
    },
    {
      name: 'linkedinUrl',
      type: 'text',
      admin: {
        description: 'LinkedIn profile URL',
      },
    },
    {
      name: 'showOnHome',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description: 'Show this testimonial in the homepage waterfall grid',
        position: 'sidebar',
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
