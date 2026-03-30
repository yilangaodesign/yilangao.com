import { cookies } from 'next/headers'

/**
 * Checks whether the current visitor has a valid Payload admin session.
 *
 * In development with auto-login configured, Payload authenticates server-side
 * without setting a browser cookie. The cookie check only works when the user
 * has manually logged in via /admin/login. The dev fallback ensures the admin
 * UI is always available when auto-login is active.
 */
export async function isAdminAuthenticated(): Promise<boolean> {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('payload-token')
    if (token?.value) return true
  } catch {
    // cookies() not available
  }

  const isDev = process.env.NODE_ENV !== 'production'
  const hasAutoLogin = !!process.env.PAYLOAD_ADMIN_EMAIL
  return isDev && hasAutoLogin
}
