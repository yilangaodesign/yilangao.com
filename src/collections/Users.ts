import type { CollectionConfig } from 'payload'

export const Users: CollectionConfig = {
  slug: 'users',
  auth: {
    tokenExpiration: 60 * 60 * 24 * 30, // 30 days
  },
  admin: {
    useAsTitle: 'email',
    group: 'System',
  },
  fields: [],
}
