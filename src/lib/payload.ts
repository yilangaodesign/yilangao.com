import { getPayload } from 'payload'
import config from '@payload-config'

function isDatabaseConfigured(): boolean {
  const url = process.env.DATABASE_URL ?? ''
  return url.length > 0 && !url.includes('YOUR_PASSWORD') && !url.includes('YOUR_PROJECT')
}

export async function getPayloadClient() {
  if (!isDatabaseConfigured()) {
    throw new Error('DATABASE_URL not configured — using fallback data')
  }
  return getPayload({ config })
}
