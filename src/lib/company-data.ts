import { getPayloadClient } from '@/lib/payload'

export type CompanyRecord = {
  id: string | number
  name: string
  slug: string
  password: string
  active: boolean
  accent: string
  greeting: string
  layoutVariant: string
  caseStudyNotes: Array<{ projectSlug: string; note: string }>
  lastLoginAt: string | null
  loginCount: number
}

export async function getCompanyBySlug(slug: string): Promise<CompanyRecord | null> {
  try {
    const payload = await getPayloadClient()
    const res = await payload.find({
      collection: 'companies',
      where: { slug: { equals: slug } },
      limit: 1,
    })

    if (res.docs.length === 0) return null

    const doc = res.docs[0]
    return {
      id: doc.id,
      name: doc.name as string,
      slug: doc.slug as string,
      password: doc.password as string,
      active: (doc.active as boolean) ?? true,
      accent: (doc.accent as string) || '#888888',
      greeting: (doc.greeting as string) || 'Welcome.',
      layoutVariant: (doc.layoutVariant as string) || 'centered',
      caseStudyNotes: ((doc.caseStudyNotes as CompanyRecord['caseStudyNotes']) || []),
      lastLoginAt: (doc.lastLoginAt as string) || null,
      loginCount: (doc.loginCount as number) || 0,
    }
  } catch {
    return null
  }
}

export async function incrementLoginAnalytics(companyId: string | number): Promise<void> {
  try {
    const payload = await getPayloadClient()
    const doc = await payload.findByID({ collection: 'companies', id: companyId })
    const currentCount = (doc.loginCount as number) || 0

    await payload.update({
      collection: 'companies',
      id: companyId,
      data: {
        lastLoginAt: new Date().toISOString(),
        loginCount: currentCount + 1,
      },
    })
  } catch {
    // Analytics failures should not break login flow
  }
}
