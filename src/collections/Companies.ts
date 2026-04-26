import type { CollectionConfig } from 'payload'

export const Companies: CollectionConfig = {
  slug: 'companies',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'slug', 'active', 'lastLoginAt', 'loginCount'],
    group: 'Settings',
  },
  access: {
    read: ({ req: { user } }) => Boolean(user),
    create: ({ req: { user } }) => Boolean(user),
    update: ({ req: { user } }) => Boolean(user),
    delete: ({ req: { user } }) => Boolean(user),
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      admin: {
        description: 'Display name shown on the login page (e.g. "Google")',
      },
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: {
        description: 'URL segment — becomes /for/{slug}',
      },
    },
    {
      name: 'password',
      type: 'text',
      required: true,
      admin: {
        description: 'The primary password shared with the hiring manager',
      },
    },
    {
      name: 'adminPassword',
      type: 'text',
      admin: {
        description: 'Your personal admin password — logging in with this tags you as owner in analytics',
      },
    },
    {
      name: 'altPasswords',
      type: 'array',
      admin: {
        description: 'Additional passwords that also grant access',
      },
      fields: [
        {
          name: 'value',
          type: 'text',
          required: true,
        },
      ],
    },
    {
      name: 'active',
      type: 'checkbox',
      defaultValue: true,
      admin: {
        description: 'Deactivated companies cannot log in',
      },
    },
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Theme',
          fields: [
            {
              name: 'accent',
              type: 'text',
              defaultValue: '#888888',
              admin: {
                description: 'Hex color for the login page accent (e.g. "#4285F4")',
              },
            },
            {
              name: 'greeting',
              type: 'text',
              defaultValue: 'Welcome.',
              admin: {
                description: 'Heading on the login page (e.g. "Hi, Google team")',
              },
            },
            {
              name: 'logo',
              type: 'upload',
              relationTo: 'media',
              admin: {
                description: 'Optional company logo for the login page (future use)',
              },
            },
            {
              name: 'backgroundImage',
              type: 'upload',
              relationTo: 'media',
              admin: {
                description: 'Optional background image for the login page (future use)',
              },
            },
            {
              name: 'layoutVariant',
              type: 'select',
              defaultValue: 'centered',
              options: [
                { label: 'Centered Card', value: 'centered' },
              ],
              admin: {
                description: 'Login page layout — more variants coming in Phase 2',
              },
            },
          ],
        },
        {
          label: 'Case Study Notes',
          fields: [
            {
              name: 'caseStudyNotes',
              type: 'array',
              admin: {
                description: 'Per-project relevance notes shown as callouts in case studies',
              },
              fields: [
                {
                  name: 'projectSlug',
                  type: 'text',
                  required: true,
                  admin: {
                    description: 'Must match a project slug from the Projects collection',
                  },
                },
                {
                  name: 'note',
                  type: 'textarea',
                  required: true,
                  admin: {
                    description: 'The "Why this matters to [Company]" text',
                  },
                },
              ],
            },
          ],
        },
        {
          label: 'Analytics',
          fields: [
            {
              name: 'lastLoginAt',
              type: 'date',
              admin: {
                description: 'Last time someone logged in with this company\'s password',
                readOnly: true,
              },
            },
            {
              name: 'loginCount',
              type: 'number',
              defaultValue: 0,
              admin: {
                description: 'Total number of logins',
                readOnly: true,
              },
            },
          ],
        },
      ],
    },
  ],
}
