import type { GlobalConfig } from 'payload'

export const SiteConfig: GlobalConfig = {
  slug: 'site-config',
  label: 'Site Config',
  admin: {
    description: 'Global site configuration — bio, teams, links, experience, education.',
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Identity',
          fields: [
            {
              name: 'name',
              type: 'text',
              required: true,
              defaultValue: 'Yilan Gao',
            },
            {
              name: 'role',
              type: 'text',
              required: true,
              defaultValue: 'UX Designer',
            },
            {
              name: 'location',
              type: 'text',
              defaultValue: 'City, ST',
            },
            {
              name: 'email',
              type: 'email',
            },
            {
              name: 'bio',
              type: 'richText',
              admin: {
                description: 'Main bio paragraph shown on the home page and about page',
              },
            },
          ],
        },
        {
          label: 'Teams',
          fields: [
            {
              name: 'teams',
              type: 'array',
              admin: {
                description: 'Companies / teams you have worked with',
              },
              fields: [
                {
                  name: 'name',
                  type: 'text',
                  required: true,
                },
                {
                  name: 'url',
                  type: 'text',
                },
              ],
            },
          ],
        },
        {
          label: 'Links',
          fields: [
            {
              name: 'socialLinks',
              type: 'array',
              admin: {
                description: 'Social links shown in sidebar and footer',
              },
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
                {
                  name: 'external',
                  type: 'checkbox',
                  defaultValue: true,
                },
              ],
            },
          ],
        },
        {
          label: 'Experience',
          fields: [
            {
              name: 'experience',
              type: 'array',
              admin: {
                description: 'Work experience entries',
              },
              fields: [
                {
                  name: 'role',
                  type: 'text',
                  required: true,
                },
                {
                  name: 'company',
                  type: 'text',
                  required: true,
                },
                {
                  name: 'period',
                  type: 'text',
                  required: true,
                },
              ],
            },
            {
              name: 'education',
              type: 'array',
              admin: {
                description: 'Education entries',
              },
              fields: [
                {
                  name: 'degree',
                  type: 'text',
                  required: true,
                },
                {
                  name: 'institution',
                  type: 'text',
                  required: true,
                },
                {
                  name: 'period',
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
