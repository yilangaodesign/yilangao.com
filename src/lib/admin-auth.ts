import { cookies } from 'next/headers'

/**
 * Checks whether the current visitor has a valid Payload admin session.
 * Uses the `payload-token` cookie set by the Payload admin login.
 * This is a lightweight check (cookie presence, not full JWT verification)
 * suitable for toggling UI chrome — the actual admin API endpoints are
 * still protected by Payload's own auth middleware.
 */
export async function isAdminAuthenticated(): Promise<boolean> {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('payload-token')
    return !!token?.value
  } catch {
    return false
  }
}
