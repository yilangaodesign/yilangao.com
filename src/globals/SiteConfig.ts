import type { GlobalConfig } from 'payload'

import { SITE_ROLE_DISPLAY } from '@/lib/site-role-display'

export const SiteConfig: GlobalConfig = {
  slug: 'site-config',
  label: 'Site Config',
  admin: {
    description: 'Global site configuration — identity, experience, links, clients, and work history. Use the "Pages" section in the nav to open any page with inline editing enabled.',
    group: 'Settings',
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
          description: 'Displayed in the home page sidebar header and footer. Editable on the live site via the visual editor.',
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
              defaultValue: SITE_ROLE_DISPLAY,
            },
            {
              name: 'location',
              type: 'text',
              defaultValue: 'City, ST',
            },
            {
              name: 'email',
              type: 'text',
              admin: {
                description: 'Contact email address (e.g. hello@example.com)',
              },
              validate: (value: unknown) => {
                if (!value || value === '') return true
                const str = String(value).trim()
                if (str === '') return true
                return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(str)
                  ? true
                  : 'Please enter a valid email address'
              },
            },
            {
              name: 'bio',
              type: 'richText',
              admin: {
                description: 'Main bio paragraph shown on the home page and about page',
              },
            },
            {
              name: 'aboutLabel',
              type: 'text',
              defaultValue: 'ABOUT',
              admin: {
                description: 'Section heading shown above the bio on the home page',
              },
            },
            {
              name: 'footerCta',
              type: 'text',
              defaultValue: "Let's build something together.",
              admin: {
                description: 'Call-to-action text shown in the site footer',
              },
            },
          ],
        },
        {
          label: 'Experience',
          description: 'Companies displayed in the home page sidebar. The section heading is editable on the live site.',
          fields: [
            {
              name: 'teamsLabel',
              type: 'text',
              defaultValue: 'EXPERIENCE',
              admin: {
                description: 'Section heading shown above the experience list on the home page',
              },
            },
            {
              name: 'teams',
              type: 'array',
              labels: { singular: 'Experience', plural: 'Experience' },
              admin: {
                description: 'Companies / teams you have worked with',
              },
              fields: [
                {
                  name: 'name',
                  type: 'text',
                  required: true,
                  admin: { description: 'Company or team name' },
                },
                {
                  name: 'url',
                  type: 'text',
                  admin: { description: 'Company website URL (e.g. https://example.com)' },
                },
                {
                  name: 'period',
                  type: 'text',
                  admin: { description: 'Time period (e.g. "2023-2024" or "Present")' },
                },
              ],
            },
          ],
        },
        {
          label: 'Links',
          description: 'Social and navigation links displayed in the home page sidebar. Editable on the live site via the visual editor.',
          fields: [
            {
              name: 'linksLabel',
              type: 'text',
              defaultValue: 'LINKS',
              admin: {
                description: 'Section heading shown above the links list on the home page',
              },
            },
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
          label: 'Clients',
          description: 'Displayed on the Contact page in the "Trusted by" section.',
          fields: [
            {
              name: 'clients',
              type: 'array',
              admin: {
                description: 'Client / company logos shown in the "Trusted by" marquee on the contact page',
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
                  admin: {
                    description: 'Optional link to the client\'s website',
                  },
                },
              ],
            },
          ],
        },
        {
          label: 'Grid Order',
          description: 'Stores the manually curated tile order for the homepage masonry grid. Managed via the inline drag-and-drop editor — do not edit directly.',
          fields: [
            {
              name: 'gridOrder',
              type: 'json',
              admin: {
                description: 'JSON array of { type: "project"|"testimonial", id: number } entries representing the flat tile sequence on the home page.',
              },
            },
          ],
        },
        {
          label: 'Work History',
          description: 'Displayed on the About page. Work experience and education entries.',
          fields: [
            {
              name: 'experience',
              type: 'array',
              admin: {
                description: 'Work experience entries shown on the About page',
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
                description: 'Education entries shown on the About page',
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
